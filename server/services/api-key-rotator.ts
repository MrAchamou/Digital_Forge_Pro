import { log } from '../vite';
import { db } from '../db';
import { apiKeyConfigs } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { loadPersistedState, saveState, saveKeyState } from './key-state-persistence';

export type ApiKeyStatus = 'active' | 'cooldown' | 'exhausted' | 'error';
export type ServiceName = 'gemini' | 'cerebras' | 'serper';

export interface ApiKey {
  id: string;
  service: ServiceName;
  key: string;
  label: string;
  source: 'env' | 'db';
  status: ApiKeyStatus;
  usageToday: number;
  dailyLimit: number;
  lastUsed: Date | null;
  cooldownUntil: Date | null;
  cooldownCount: number;
  errorCount: number;
  successCount: number;
  avgResponseTime: number;
  healthScore: number;
  callsLastHour: number;
  hourWindowStart: Date;
  lastError: string | null;
}

export interface KeyPool {
  gemini: ApiKey[];
  cerebras: ApiKey[];
  serper: ApiKey[];
}

// ─── Circuit breaker per service ──────────────────────────────────────────────
interface CircuitBreaker {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure: Date | null;
  openUntil: Date | null;
}

const DAILY_LIMITS: Record<ServiceName, number> = {
  gemini:   1500,
  cerebras: 1000,
  serper:   17,
};

const COOLDOWN_DURATIONS = [60, 120, 300, 600];
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT_MS = 120_000;

// ─── Score de santé composite ─────────────────────────────────────────────────
function computeHealthScore(key: ApiKey): number {
  const total = key.successCount + key.errorCount;
  if (total === 0) return 100;

  const successRate  = (key.successCount / total) * 40;
  const cooldownPenalty = Math.min(key.cooldownCount * 8, 30);
  const speedBonus   = key.avgResponseTime === 0 ? 20
                     : key.avgResponseTime < 500  ? 20
                     : key.avgResponseTime < 1500 ? 10
                     : key.avgResponseTime < 3000 ? 5
                     : 0;
  const usagePenalty = key.usageToday / key.dailyLimit > 0.9 ? 10 : 0;

  return Math.max(0, Math.min(100, successRate + (40 - cooldownPenalty) + speedBonus - usagePenalty));
}

// ─── Vélocité et prédiction d'épuisement ─────────────────────────────────────
function computeVelocity(key: ApiKey): number {
  const now = Date.now();
  const windowMs = now - key.hourWindowStart.getTime();
  if (windowMs <= 0) return 0;
  return (key.callsLastHour / (windowMs / 3_600_000));
}

function minutesUntilExhausted(key: ApiKey): number | null {
  const velocity = computeVelocity(key);
  if (velocity <= 0) return null;
  const remaining = key.dailyLimit - key.usageToday;
  if (remaining <= 0) return 0;
  return Math.round((remaining / velocity) * 60);
}

class ApiKeyRotator {
  private pool: KeyPool = { gemini: [], cerebras: [], serper: [] };
  private monthlyUsage: Record<string, number> = {};
  private circuitBreakers: Record<ServiceName, CircuitBreaker> = {
    gemini:   { state: 'closed', failureCount: 0, lastFailure: null, openUntil: null },
    cerebras: { state: 'closed', failureCount: 0, lastFailure: null, openUntil: null },
    serper:   { state: 'closed', failureCount: 0, lastFailure: null, openUntil: null },
  };
  private resetTimer: NodeJS.Timeout | null = null;
  private saveTimer: NodeJS.Timeout | null = null;
  private initialized = false;

  // ─── Initialisation ────────────────────────────────────────────────────────
  async init() {
    if (this.initialized) return;
    this.initialized = true;

    this.loadKeysFromEnv();
    await this.loadKeysFromDB();
    await this.restorePersistedState();
    this.scheduleMidnightReset();
    this.schedulePersistence();

    const totals = {
      gemini:   this.pool.gemini.length,
      cerebras: this.pool.cerebras.length,
      serper:   this.pool.serper.length,
    };
    log(
      `🔑 API Key Rotator v2.0 — Gemini: ${totals.gemini} | Cerebras: ${totals.cerebras} | Serper: ${totals.serper} | Circuit breaker: ON | Health scoring: ON`,
      'api-rotator'
    );
  }

  // ─── Chargement depuis variables d'environnement ───────────────────────────
  private loadKeysFromEnv() {
    const envPrefix: Record<ServiceName, string> = {
      gemini:   'GEMINI_KEY_',
      cerebras: 'CEREBRAS_KEY_',
      serper:   'SERPER_KEY_',
    };

    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      this.pool[service] = [];

      for (let i = 1; i <= 10; i++) {
        const envName  = `${envPrefix[service]}${i}`;
        const keyValue = process.env[envName];
        if (keyValue?.trim()) {
          const id = `${service}_${i}`;
          if (!this.pool[service].find(k => k.key === keyValue.trim())) {
            this.pool[service].push(this.createKeyObject(id, service, keyValue.trim(), `env-${i}`, 'env'));
          }
        }
      }

      if (this.pool[service].length === 0) {
        log(`⚠️  Aucune clé ${service.toUpperCase()} dans l'env — vérifie la DB ou ajoute ${envPrefix[service]}1 dans les secrets`, 'api-rotator');
      }
    }
  }

  // ─── Chargement depuis PostgreSQL ─────────────────────────────────────────
  private async loadKeysFromDB() {
    try {
      const rows = await db.select().from(apiKeyConfigs).where(eq(apiKeyConfigs.is_active, true));

      for (const row of rows) {
        const service = row.service as ServiceName;
        if (!['gemini', 'cerebras', 'serper'].includes(service)) continue;

        const isDuplicate = this.pool[service].some(k => k.key === row.key_value);
        if (isDuplicate) continue;

        const idx = this.pool[service].length + 1;
        const id = `${service}_db_${row.id.slice(0, 8)}`;
        this.pool[service].push(this.createKeyObject(id, service, row.key_value, row.label || `db-${idx}`, 'db'));
      }

      const dbCount = rows.length;
      if (dbCount > 0) {
        log(`📦 ${dbCount} clé(s) chargées depuis la base de données`, 'api-rotator');
      }
    } catch (err: any) {
      log(`⚠️ Chargement clés DB: ${err.message}`, 'api-rotator');
    }
  }

  private createKeyObject(id: string, service: ServiceName, key: string, label: string, source: 'env' | 'db'): ApiKey {
    return {
      id,
      service,
      key,
      label,
      source,
      status:         'active',
      usageToday:     0,
      dailyLimit:     DAILY_LIMITS[service],
      lastUsed:       null,
      cooldownUntil:  null,
      cooldownCount:  0,
      errorCount:     0,
      successCount:   0,
      avgResponseTime: 0,
      healthScore:    100,
      callsLastHour:  0,
      hourWindowStart: new Date(),
      lastError:      null,
    };
  }

  // ─── Restauration de l'état persisté ──────────────────────────────────────
  private async restorePersistedState() {
    try {
      const saved = await loadPersistedState();
      if (!saved) return;

      this.monthlyUsage = saved.monthlyUsage || {};

      for (const [keyId, savedKey] of Object.entries(saved.keys || {})) {
        const parts = keyId.split('_');
        const service = parts[0] as ServiceName;
        const keys = this.pool[service] || [];
        const key = keys.find(k => k.id === keyId);
        if (!key) continue;

        key.usageToday      = savedKey.usageToday || 0;
        key.errorCount      = savedKey.errorCount || 0;
        key.successCount    = savedKey.successCount || 0;
        key.avgResponseTime = savedKey.avgResponseTime || 0;
        key.cooldownCount   = savedKey.cooldownCount || 0;
        key.healthScore     = (savedKey as any).healthScore ?? 100;
        key.callsLastHour   = (savedKey as any).callsLastHour || 0;

        if ((savedKey as any).hourWindowStart) {
          key.hourWindowStart = new Date((savedKey as any).hourWindowStart);
        }
        if ((savedKey as any).lastUsed) {
          key.lastUsed = new Date((savedKey as any).lastUsed);
        }

        if (savedKey.cooldownUntil && new Date(savedKey.cooldownUntil) > new Date()) {
          key.status = 'cooldown';
          key.cooldownUntil = new Date(savedKey.cooldownUntil);
        } else if (savedKey.status === 'exhausted') {
          key.status = 'exhausted';
        } else {
          key.status = 'active';
          key.cooldownUntil = null;
        }

        key.healthScore = computeHealthScore(key);
      }
    } catch (err: any) {
      log(`Erreur restauration état: ${err.message}`, 'api-rotator');
    }
  }

  // ─── Gestion des timers ────────────────────────────────────────────────────
  private schedulePersistence() {
    this.saveTimer = setInterval(async () => {
      await this.persist();
    }, 60_000);
  }

  private scheduleMidnightReset() {
    const now  = new Date();
    const midnight = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0
    ));
    const msUntilMidnight = midnight.getTime() - Date.now();

    this.resetTimer = setTimeout(() => {
      this.midnightReset();
      setInterval(() => this.midnightReset(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    log(`Réinitialisation quotidienne dans ${Math.round(msUntilMidnight / 3_600_000)}h`, 'api-rotator');
  }

  private midnightReset() {
    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      for (const key of this.pool[service]) {
        key.usageToday    = 0;
        key.cooldownCount = 0;
        key.callsLastHour = 0;
        key.hourWindowStart = new Date();
        if (key.status === 'exhausted') key.status = 'active';
        key.healthScore = computeHealthScore(key);
      }
      this.circuitBreakers[service] = { state: 'closed', failureCount: 0, lastFailure: null, openUntil: null };
    }
    log('Réinitialisation quotidienne des quotas effectuée', 'api-rotator');
    this.persist().catch(() => {});
  }

  // ─── Circuit Breaker ───────────────────────────────────────────────────────
  private checkCircuitBreaker(service: ServiceName): void {
    const cb = this.circuitBreakers[service];
    if (cb.state === 'open') {
      if (cb.openUntil && Date.now() > cb.openUntil.getTime()) {
        cb.state = 'half-open';
        log(`Circuit breaker ${service}: HALF-OPEN (test autorisé)`, 'api-rotator');
      } else {
        const waitSec = Math.ceil((cb.openUntil!.getTime() - Date.now()) / 1000);
        throw new Error(`Circuit breaker OUVERT pour ${service}. Attente ${waitSec}s avant reprise.`);
      }
    }
  }

  private recordCircuitSuccess(service: ServiceName) {
    const cb = this.circuitBreakers[service];
    if (cb.state === 'half-open') {
      cb.state = 'closed';
      cb.failureCount = 0;
      log(`Circuit breaker ${service}: FERMÉ (service rétabli)`, 'api-rotator');
    }
  }

  private recordCircuitFailure(service: ServiceName) {
    const cb = this.circuitBreakers[service];
    cb.failureCount++;
    cb.lastFailure = new Date();

    if (cb.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
      cb.state = 'open';
      cb.openUntil = new Date(Date.now() + CIRCUIT_BREAKER_TIMEOUT_MS);
      log(`⚡ Circuit breaker ${service}: OUVERT après ${cb.failureCount} échecs — pause ${CIRCUIT_BREAKER_TIMEOUT_MS / 1000}s`, 'api-rotator');
    }
  }

  // ─── Expiration des cooldowns ──────────────────────────────────────────────
  private checkCooldowns() {
    const now = new Date();
    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      for (const key of this.pool[service]) {
        if (key.status === 'cooldown' && key.cooldownUntil && key.cooldownUntil <= now) {
          key.status = 'active';
          key.cooldownUntil = null;
          log(`Clé ${key.id} sortie du cooldown`, 'api-rotator');
        }
      }
    }
  }

  // ─── Sélection pondérée par score de santé ─────────────────────────────────
  async selectBestKey(service: ServiceName): Promise<ApiKey> {
    await this.init();
    this.checkCircuitBreaker(service);
    this.checkCooldowns();

    const allKeys = this.pool[service];
    if (allKeys.length === 0) {
      throw new Error(`Aucune clé ${service} configurée. Ajoutez une clé via l'interface ou les secrets Replit.`);
    }

    // PRIORITÉ 1 : clés actives sous leur limite, triées par score de santé (desc)
    const activeKeys = allKeys.filter(k => k.status === 'active' && k.usageToday < k.dailyLimit);

    if (activeKeys.length > 0) {
      activeKeys.sort((a, b) => {
        // Score composite : health (40%) + usage restant (30%) + rapidité (30%)
        const aUsagePct = a.usageToday / a.dailyLimit;
        const bUsagePct = b.usageToday / b.dailyLimit;
        const aScore = a.healthScore - aUsagePct * 30 - (a.avgResponseTime / 5000) * 30;
        const bScore = b.healthScore - bUsagePct * 30 - (b.avgResponseTime / 5000) * 30;
        if (Math.abs(aScore - bScore) > 2) return bScore - aScore;
        const aLast = a.lastUsed?.getTime() || 0;
        const bLast = b.lastUsed?.getTime() || 0;
        return aLast - bLast;
      });
      return activeKeys[0];
    }

    // PRIORITÉ 2 : clés en cooldown (attendre la plus proche si < 30s)
    const cooldownKeys = allKeys.filter(k => k.status === 'cooldown' && k.cooldownUntil);
    if (cooldownKeys.length > 0) {
      cooldownKeys.sort((a, b) => (a.cooldownUntil!.getTime()) - (b.cooldownUntil!.getTime()));
      const soonest = cooldownKeys[0];
      const waitMs  = soonest.cooldownUntil!.getTime() - Date.now();

      if (waitMs <= 30_000) {
        log(`Attente ${Math.ceil(waitMs / 1000)}s pour clé ${soonest.id} (score: ${Math.round(soonest.healthScore)})`, 'api-rotator');
        await new Promise(resolve => setTimeout(resolve, waitMs + 100));
        soonest.status = 'active';
        soonest.cooldownUntil = null;
        return soonest;
      }

      throw new Error(`Toutes les clés ${service} en cooldown. Min attente: ${Math.ceil(waitMs / 1000)}s.`);
    }

    // PRIORITÉ 3 : toutes épuisées ou en erreur
    const exhausted = allKeys.filter(k => k.status === 'exhausted');
    if (exhausted.length === allKeys.length) {
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const hoursUntilReset = Math.ceil((midnight.getTime() - Date.now()) / 3_600_000);
      throw new Error(`Quota journalier épuisé pour ${service}. Réinitialisation dans ${hoursUntilReset}h.`);
    }

    throw new Error(`Toutes les clés ${service} sont indisponibles (erreurs/épuisées).`);
  }

  // ─── Enregistrement d'erreur ───────────────────────────────────────────────
  async handleError(key: ApiKey, statusCode: number, responseText: string) {
    const now = new Date();
    key.errorCount++;
    key.lastError = `${statusCode}: ${responseText.slice(0, 200)}`;

    if (statusCode === 429) {
      key.status = 'cooldown';
      key.cooldownCount++;
      const cooldownIdx = Math.min(key.cooldownCount - 1, COOLDOWN_DURATIONS.length - 1);
      const cooldownSec = COOLDOWN_DURATIONS[cooldownIdx];

      const retryMatch = responseText.match(/retry.after[^\d]*(\d+)/i);
      const actualCooldown = retryMatch ? parseInt(retryMatch[1]) : cooldownSec;
      key.cooldownUntil = new Date(now.getTime() + actualCooldown * 1000);
      log(`Clé ${key.id} cooldown ${actualCooldown}s (count: ${key.cooldownCount}, score: ${Math.round(computeHealthScore(key))})`, 'api-rotator');
    } else if (statusCode === 403 || responseText.toLowerCase().includes('quota')) {
      key.status = 'exhausted';
      key.usageToday = key.dailyLimit;
      log(`Clé ${key.id} quota épuisé`, 'api-rotator');
    } else if (statusCode === 401) {
      key.status = 'error';
      log(`Clé ${key.id} invalide (401)`, 'api-rotator');
    } else if (key.errorCount >= 3) {
      key.status = 'error';
      log(`Clé ${key.id} en erreur (${key.errorCount} échecs consécutifs)`, 'api-rotator');
    }

    key.healthScore = computeHealthScore(key);
    this.recordCircuitFailure(key.service);

    // Sauvegarde immédiate sur erreur
    saveKeyState(key.id, key.service, this.keyToState(key)).catch(() => {});
  }

  // ─── Enregistrement de succès ──────────────────────────────────────────────
  async recordSuccess(key: ApiKey, responseTimeMs: number) {
    const now = new Date();
    key.usageToday++;
    key.successCount++;
    key.errorCount = 0;
    key.lastUsed   = now;
    key.avgResponseTime = key.successCount === 1
      ? responseTimeMs
      : Math.round((key.avgResponseTime * (key.successCount - 1) + responseTimeMs) / key.successCount);

    // Vélocité horaire
    const windowMs = now.getTime() - key.hourWindowStart.getTime();
    if (windowMs > 3_600_000) {
      key.callsLastHour = 1;
      key.hourWindowStart = now;
    } else {
      key.callsLastHour++;
    }

    if (key.usageToday >= key.dailyLimit) {
      key.status = 'exhausted';
      log(`Clé ${key.id} quota journalier atteint (${key.usageToday}/${key.dailyLimit})`, 'api-rotator');
    }

    key.healthScore = computeHealthScore(key);
    this.recordCircuitSuccess(key.service);
    await this.recordMonthlyUsage(key.service);
  }

  // ─── Ajout dynamique d'une clé (persisté en DB) ───────────────────────────
  async addKey(service: ServiceName, keyValue: string, label: string = ''): Promise<ApiKey> {
    await this.init();

    const isDuplicate = this.pool[service].some(k => k.key === keyValue.trim());
    if (isDuplicate) {
      throw new Error(`Cette clé ${service} est déjà dans la rotation.`);
    }

    const [dbRow] = await db.insert(apiKeyConfigs).values({
      service,
      key_value: keyValue.trim(),
      label: label || `Clé ${service} #${this.pool[service].length + 1}`,
      is_active: true,
      source: 'manual',
    }).returning();

    const id = `${service}_db_${dbRow.id.slice(0, 8)}`;
    const newKey = this.createKeyObject(id, service, keyValue.trim(), dbRow.label, 'db');
    this.pool[service].push(newKey);

    log(`✅ Clé ${service} ajoutée dynamiquement (id: ${id}, label: ${dbRow.label})`, 'api-rotator');
    return newKey;
  }

  // ─── Suppression d'une clé ────────────────────────────────────────────────
  async removeKey(keyId: string): Promise<void> {
    await this.init();

    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      const idx = this.pool[service].findIndex(k => k.id === keyId);
      if (idx !== -1) {
        const key = this.pool[service][idx];

        if (key.source === 'db') {
          const dbSuffix = keyId.replace(`${service}_db_`, '');
          await db.update(apiKeyConfigs)
            .set({ is_active: false })
            .where(and(eq(apiKeyConfigs.service, service), eq(apiKeyConfigs.is_active, true)));
        }

        this.pool[service].splice(idx, 1);
        log(`🗑️ Clé ${keyId} retirée de la rotation`, 'api-rotator');
        return;
      }
    }
    throw new Error(`Clé ${keyId} introuvable.`);
  }

  // ─── Métriques et reporting ────────────────────────────────────────────────
  async getMonthlyUsage(service: ServiceName): Promise<number> {
    await this.init();
    const monthKey = new Date().toISOString().slice(0, 7);
    return this.monthlyUsage[`${service}_${monthKey}`] || 0;
  }

  async recordMonthlyUsage(service: ServiceName) {
    const monthKey = new Date().toISOString().slice(0, 7);
    const k = `${service}_${monthKey}`;
    this.monthlyUsage[k] = (this.monthlyUsage[k] || 0) + 1;
  }

  async forceReset(service?: ServiceName) {
    await this.init();
    const services = service ? [service] : (['gemini', 'cerebras', 'serper'] as ServiceName[]);
    for (const s of services) {
      for (const key of this.pool[s]) {
        key.usageToday    = 0;
        key.cooldownCount = 0;
        key.errorCount    = 0;
        key.cooldownUntil = null;
        key.status        = 'active';
        key.healthScore   = computeHealthScore(key);
      }
      this.circuitBreakers[s] = { state: 'closed', failureCount: 0, lastFailure: null, openUntil: null };
    }
    await this.persist();
    log(`Reset forcé pour: ${services.join(', ')}`, 'api-rotator');
  }

  async testAllKeys(): Promise<Record<string, { id: string; valid: boolean; responseTime?: number; error?: string; healthScore?: number }>> {
    await this.init();
    const results: Record<string, any> = {};

    const testKey = async (key: ApiKey) => {
      const start = Date.now();
      try {
        let res: Response;
        if (key.service === 'gemini') {
          res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key.key}`, {
            signal: AbortSignal.timeout(8000),
          });
        } else if (key.service === 'cerebras') {
          res = await fetch('https://api.cerebras.ai/v1/models', {
            headers: { Authorization: `Bearer ${key.key}` },
            signal: AbortSignal.timeout(8000),
          });
        } else {
          res = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': key.key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: 'test', num: 1 }),
            signal: AbortSignal.timeout(8000),
          });
        }
        results[key.id] = {
          id: key.id,
          label: key.label,
          source: key.source,
          valid: res.ok,
          responseTime: Date.now() - start,
          healthScore: Math.round(key.healthScore),
          error: res.ok ? undefined : `HTTP ${res.status}`,
        };
      } catch (err: any) {
        results[key.id] = { id: key.id, label: key.label, source: key.source, valid: false, error: err.message, healthScore: 0 };
      }
    };

    const allKeys = [...this.pool.gemini, ...this.pool.cerebras, ...this.pool.serper];
    await Promise.allSettled(allKeys.map(testKey));
    return results;
  }

  getPoolStatus(): {
    keys: (ApiKey & { minutesUntilExhausted: number | null; velocity: number })[];
    summary: Record<ServiceName, {
      total: number; active: number; cooldown: number; exhausted: number; error: number;
      usageToday: number; capacity: number; avgHealthScore: number; circuitBreaker: string;
    }>;
    monthlyUsage: Record<string, number>;
  } {
    this.checkCooldowns();
    const allKeys = [...this.pool.gemini, ...this.pool.cerebras, ...this.pool.serper];

    const enrichedKeys = allKeys.map(k => ({
      ...k,
      minutesUntilExhausted: minutesUntilExhausted(k),
      velocity: Math.round(computeVelocity(k) * 10) / 10,
    }));

    const summary = {} as Record<ServiceName, any>;
    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      const keys = this.pool[service];
      const cb   = this.circuitBreakers[service];
      const avgHealth = keys.length > 0
        ? Math.round(keys.reduce((s, k) => s + k.healthScore, 0) / keys.length)
        : 0;
      summary[service] = {
        total:          keys.length,
        active:         keys.filter(k => k.status === 'active').length,
        cooldown:       keys.filter(k => k.status === 'cooldown').length,
        exhausted:      keys.filter(k => k.status === 'exhausted').length,
        error:          keys.filter(k => k.status === 'error').length,
        usageToday:     keys.reduce((s, k) => s + k.usageToday, 0),
        capacity:       keys.reduce((s, k) => s + Math.max(0, k.dailyLimit - k.usageToday), 0),
        avgHealthScore: avgHealth,
        circuitBreaker: cb.state,
      };
    }

    return { keys: enrichedKeys, summary, monthlyUsage: this.monthlyUsage };
  }

  // ─── Auto-détection des clés Replit (OpenAI / Anthropic) ──────────────────
  static detectReplitKeys(): { openai: boolean; anthropic: boolean; details: Record<string, string> } {
    const openaiKey  = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    return {
      openai:    !!openaiKey && openaiKey.startsWith('sk-'),
      anthropic: !!anthropicKey && anthropicKey.startsWith('sk-ant-'),
      details: {
        openai:    openaiKey  ? `sk-...${openaiKey.slice(-4)}`    : 'non configuré',
        anthropic: anthropicKey ? `sk-ant-...${anthropicKey.slice(-4)}` : 'non configuré',
      },
    };
  }

  // ─── Persistance ──────────────────────────────────────────────────────────
  private keyToState(key: ApiKey) {
    return {
      usageToday:      key.usageToday,
      status:          key.status,
      cooldownUntil:   key.cooldownUntil?.toISOString() || null,
      cooldownCount:   key.cooldownCount,
      errorCount:      key.errorCount,
      successCount:    key.successCount,
      avgResponseTime: key.avgResponseTime,
      healthScore:     key.healthScore,
      callsLastHour:   key.callsLastHour,
      hourWindowStart: key.hourWindowStart.toISOString(),
      lastUsed:        key.lastUsed?.toISOString() || null,
      lastError:       key.lastError,
    };
  }

  private async persist() {
    const keysState: Record<string, any> = {};
    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      for (const key of this.pool[service]) {
        keysState[key.id] = this.keyToState(key);
      }
    }
    await saveState({ keys: keysState, monthlyUsage: this.monthlyUsage });
  }
}

export const rotator = new ApiKeyRotator();
