import { log } from '../vite';
import { loadPersistedState, saveState } from './key-state-persistence';

export type ApiKeyStatus = 'active' | 'cooldown' | 'exhausted' | 'error';
export type ServiceName = 'gemini' | 'cerebras' | 'serper';

export interface ApiKey {
  id: string;
  service: ServiceName;
  key: string;
  status: ApiKeyStatus;
  usageToday: number;
  dailyLimit: number;
  lastUsed: Date | null;
  cooldownUntil: Date | null;
  cooldownCount: number;
  errorCount: number;
  successCount: number;
  avgResponseTime: number;
  lastError: string | null;
}

export interface KeyPool {
  gemini: ApiKey[];
  cerebras: ApiKey[];
  serper: ApiKey[];
}

const DAILY_LIMITS: Record<ServiceName, number> = {
  gemini: 1500,
  cerebras: 1000,
  serper: 17,
};

const COOLDOWN_DURATIONS = [60, 120, 300, 600];

class ApiKeyRotator {
  private pool: KeyPool = { gemini: [], cerebras: [], serper: [] };
  private monthlyUsage: Record<string, number> = {};
  private resetTimer: NodeJS.Timeout | null = null;
  private saveTimer: NodeJS.Timeout | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    this.loadKeysFromEnv();
    await this.loadPersistedState();
    this.scheduleMidnightReset();
    this.schedulePersistence();

    const totals = {
      gemini: this.pool.gemini.length,
      cerebras: this.pool.cerebras.length,
      serper: this.pool.serper.length,
    };
    log(`API Key Rotator initialisé — Gemini: ${totals.gemini} clés | Cerebras: ${totals.cerebras} clés | Serper: ${totals.serper} clés`, 'api-rotator');
  }

  private loadKeysFromEnv() {
    const services: ServiceName[] = ['gemini', 'cerebras', 'serper'];
    const envPrefix: Record<ServiceName, string> = {
      gemini: 'GEMINI_KEY_',
      cerebras: 'CEREBRAS_KEY_',
      serper: 'SERPER_KEY_',
    };

    for (const service of services) {
      this.pool[service] = [];
      for (let i = 1; i <= 5; i++) {
        const envName = `${envPrefix[service]}${i}`;
        const keyValue = process.env[envName];
        if (keyValue && keyValue.trim()) {
          this.pool[service].push({
            id: `${service}_${i}`,
            service,
            key: keyValue.trim(),
            status: 'active',
            usageToday: 0,
            dailyLimit: DAILY_LIMITS[service],
            lastUsed: null,
            cooldownUntil: null,
            cooldownCount: 0,
            errorCount: 0,
            successCount: 0,
            avgResponseTime: 0,
            lastError: null,
          });
        }
      }

      // Fallback : si aucune clé numérotée, vérifier l'ancienne variable simple
      if (this.pool[service].length === 0) {
        const legacyMap: Record<ServiceName, string> = {
          gemini: 'GEMINI_API_KEY',
          cerebras: 'CEREBRAS_API_KEY',
          serper: 'SERPER_API_KEY',
        };
        const legacyVal = process.env[legacyMap[service]];
        if (legacyVal && legacyVal.trim()) {
          this.pool[service].push({
            id: `${service}_1`,
            service,
            key: legacyVal.trim(),
            status: 'active',
            usageToday: 0,
            dailyLimit: DAILY_LIMITS[service],
            lastUsed: null,
            cooldownUntil: null,
            cooldownCount: 0,
            errorCount: 0,
            successCount: 0,
            avgResponseTime: 0,
            lastError: null,
          });
        }
      }
    }
  }

  private async loadPersistedState() {
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

        key.usageToday = savedKey.usageToday || 0;
        key.errorCount = savedKey.errorCount || 0;
        key.successCount = savedKey.successCount || 0;
        key.avgResponseTime = savedKey.avgResponseTime || 0;
        key.cooldownCount = savedKey.cooldownCount || 0;

        if (savedKey.cooldownUntil && new Date(savedKey.cooldownUntil) > new Date()) {
          key.status = 'cooldown';
          key.cooldownUntil = new Date(savedKey.cooldownUntil);
        } else if (savedKey.status === 'exhausted') {
          key.status = 'exhausted';
        } else {
          key.status = 'active';
          key.cooldownUntil = null;
        }
      }
    } catch (err: any) {
      log(`Erreur chargement état persisté: ${err.message}`, 'api-rotator');
    }
  }

  private schedulePersistence() {
    this.saveTimer = setInterval(async () => {
      await this.persist();
    }, 60_000);
  }

  private scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    const msUntilMidnight = midnight.getTime() - Date.now();

    this.resetTimer = setTimeout(() => {
      this.midnightReset();
      setInterval(() => this.midnightReset(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    log(`Réinitialisation quotidienne planifiée dans ${Math.round(msUntilMidnight / 3600000)}h`, 'api-rotator');
  }

  private midnightReset() {
    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      for (const key of this.pool[service]) {
        key.usageToday = 0;
        key.cooldownCount = 0;
        if (key.status === 'exhausted') key.status = 'active';
      }
    }
    log('Réinitialisation quotidienne des quotas effectuée', 'api-rotator');
  }

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

  async selectBestKey(service: ServiceName): Promise<ApiKey> {
    await this.init();
    this.checkCooldowns();

    const allKeys = this.pool[service];
    if (allKeys.length === 0) {
      throw new Error(`Aucune clé ${service} configurée. Ajoutez ${service.toUpperCase()}_KEY_1 dans les secrets Replit.`);
    }

    // PRIORITÉ 1 : clés actives sous leur limite journalière
    const activeKeys = allKeys.filter(k => k.status === 'active' && k.usageToday < k.dailyLimit);

    if (activeKeys.length > 0) {
      activeKeys.sort((a, b) => {
        // Priorité 1 : moins d'utilisations aujourd'hui
        if (a.usageToday !== b.usageToday) return a.usageToday - b.usageToday;
        // Priorité 2 : meilleur temps de réponse moyen
        const aTime = a.avgResponseTime || 9999;
        const bTime = b.avgResponseTime || 9999;
        if (aTime !== bTime) return aTime - bTime;
        // Priorité 3 : utilisée il y a le plus longtemps
        const aLast = a.lastUsed?.getTime() || 0;
        const bLast = b.lastUsed?.getTime() || 0;
        return aLast - bLast;
      });
      return activeKeys[0];
    }

    // PRIORITÉ 2 : clés en cooldown (attendre la plus proche)
    const cooldownKeys = allKeys.filter(k => k.status === 'cooldown' && k.cooldownUntil);
    if (cooldownKeys.length > 0) {
      cooldownKeys.sort((a, b) => (a.cooldownUntil!.getTime()) - (b.cooldownUntil!.getTime()));
      const soonest = cooldownKeys[0];
      const waitMs = soonest.cooldownUntil!.getTime() - Date.now();

      if (waitMs <= 30_000) {
        log(`Attente ${Math.ceil(waitMs / 1000)}s pour clé ${soonest.id}`, 'api-rotator');
        await new Promise(resolve => setTimeout(resolve, waitMs + 100));
        soonest.status = 'active';
        soonest.cooldownUntil = null;
        return soonest;
      }

      throw new Error(`Toutes les clés ${service} sont en cooldown. Attente max: ${Math.ceil(waitMs / 1000)}s.`);
    }

    // PRIORITÉ 3 : toutes épuisées ou en erreur
    const exhausted = allKeys.filter(k => k.status === 'exhausted');
    if (exhausted.length === allKeys.length) {
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const hoursUntilReset = Math.ceil((midnight.getTime() - Date.now()) / 3600000);
      throw new Error(`Quota journalier épuisé pour ${service}. Réinitialisation dans ${hoursUntilReset}h.`);
    }

    throw new Error(`Toutes les clés ${service} sont indisponibles (erreurs ou épuisées).`);
  }

  async handleError(key: ApiKey, statusCode: number, responseText: string) {
    const now = new Date();
    key.errorCount++;
    key.lastError = `${statusCode}: ${responseText.slice(0, 200)}`;

    if (statusCode === 429) {
      key.status = 'cooldown';
      key.cooldownCount++;
      const cooldownIdx = Math.min(key.cooldownCount - 1, COOLDOWN_DURATIONS.length - 1);
      const cooldownSec = COOLDOWN_DURATIONS[cooldownIdx];

      // Vérifier Retry-After header (dans le texte si disponible)
      const retryMatch = responseText.match(/retry.after[^\d]*(\d+)/i);
      const actualCooldown = retryMatch ? parseInt(retryMatch[1]) : cooldownSec;

      key.cooldownUntil = new Date(now.getTime() + actualCooldown * 1000);
      log(`Clé ${key.id} en cooldown ${actualCooldown}s (count: ${key.cooldownCount})`, 'api-rotator');
    } else if (statusCode === 403 || responseText.toLowerCase().includes('quota')) {
      key.status = 'exhausted';
      key.usageToday = key.dailyLimit;
      log(`Clé ${key.id} quota épuisé`, 'api-rotator');
    } else if (statusCode === 401) {
      key.status = 'error';
      log(`Clé ${key.id} invalide (401)`, 'api-rotator');
    } else if (key.errorCount >= 3) {
      key.status = 'error';
      log(`Clé ${key.id} mise en erreur (${key.errorCount} erreurs consécutives)`, 'api-rotator');
    }
  }

  async recordSuccess(key: ApiKey, responseTimeMs: number) {
    key.usageToday++;
    key.successCount++;
    key.errorCount = 0;
    key.lastUsed = new Date();
    key.avgResponseTime = key.successCount === 1
      ? responseTimeMs
      : Math.round((key.avgResponseTime * (key.successCount - 1) + responseTimeMs) / key.successCount);

    if (key.usageToday >= key.dailyLimit) {
      key.status = 'exhausted';
      log(`Clé ${key.id} quota journalier atteint (${key.usageToday}/${key.dailyLimit})`, 'api-rotator');
    }
  }

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
        key.usageToday = 0;
        key.cooldownCount = 0;
        key.errorCount = 0;
        key.cooldownUntil = null;
        key.status = 'active';
      }
    }
    await this.persist();
    log(`Reset forcé pour: ${services.join(', ')}`, 'api-rotator');
  }

  async testAllKeys(): Promise<Record<string, { id: string; valid: boolean; responseTime?: number; error?: string }>> {
    await this.init();
    const results: Record<string, { id: string; valid: boolean; responseTime?: number; error?: string }> = {};

    const testKey = async (key: ApiKey) => {
      const start = Date.now();
      try {
        if (key.service === 'gemini') {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key.key}`, {
            signal: AbortSignal.timeout(8000),
          });
          results[key.id] = { id: key.id, valid: res.ok, responseTime: Date.now() - start };
          if (!res.ok) results[key.id].error = `HTTP ${res.status}`;
        } else if (key.service === 'cerebras') {
          const res = await fetch('https://api.cerebras.ai/v1/models', {
            headers: { Authorization: `Bearer ${key.key}` },
            signal: AbortSignal.timeout(8000),
          });
          results[key.id] = { id: key.id, valid: res.ok, responseTime: Date.now() - start };
          if (!res.ok) results[key.id].error = `HTTP ${res.status}`;
        } else if (key.service === 'serper') {
          const res = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': key.key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: 'test', num: 1 }),
            signal: AbortSignal.timeout(8000),
          });
          results[key.id] = { id: key.id, valid: res.ok, responseTime: Date.now() - start };
          if (!res.ok) results[key.id].error = `HTTP ${res.status}`;
        }
      } catch (err: any) {
        results[key.id] = { id: key.id, valid: false, error: err.message };
      }
    };

    const allKeys = [...this.pool.gemini, ...this.pool.cerebras, ...this.pool.serper];
    await Promise.allSettled(allKeys.map(testKey));
    return results;
  }

  getPoolStatus(): {
    keys: ApiKey[];
    summary: Record<ServiceName, { total: number; active: number; cooldown: number; exhausted: number; error: number; usageToday: number; capacity: number }>;
    monthlyUsage: Record<string, number>;
  } {
    const allKeys = [...this.pool.gemini, ...this.pool.cerebras, ...this.pool.serper];
    this.checkCooldowns();

    const summary = {} as Record<ServiceName, any>;
    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      const keys = this.pool[service];
      summary[service] = {
        total: keys.length,
        active: keys.filter(k => k.status === 'active').length,
        cooldown: keys.filter(k => k.status === 'cooldown').length,
        exhausted: keys.filter(k => k.status === 'exhausted').length,
        error: keys.filter(k => k.status === 'error').length,
        usageToday: keys.reduce((s, k) => s + k.usageToday, 0),
        capacity: keys.reduce((s, k) => s + Math.max(0, k.dailyLimit - k.usageToday), 0),
      };
    }

    return { keys: allKeys, summary, monthlyUsage: this.monthlyUsage };
  }

  private async persist() {
    const keysState: Record<string, any> = {};
    for (const service of ['gemini', 'cerebras', 'serper'] as ServiceName[]) {
      for (const key of this.pool[service]) {
        keysState[key.id] = {
          usageToday: key.usageToday,
          status: key.status,
          cooldownUntil: key.cooldownUntil?.toISOString() || null,
          cooldownCount: key.cooldownCount,
          errorCount: key.errorCount,
          successCount: key.successCount,
          avgResponseTime: key.avgResponseTime,
        };
      }
    }
    await saveState({ keys: keysState, monthlyUsage: this.monthlyUsage });
  }
}

export const rotator = new ApiKeyRotator();
