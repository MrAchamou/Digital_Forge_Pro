import { db } from '../db';
import { apiKeyStates } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { log } from '../vite';
import path from 'path';
import fs from 'fs/promises';

const STATE_FILE = path.join(process.cwd(), 'data', 'api-keys-state.json');

export interface PersistedKeyState {
  key_id: string;
  service: string;
  status: string;
  usage_today: number;
  cooldown_until: string | null;
  cooldown_count: number;
  error_count: number;
  success_count: number;
  avg_response_ms: number;
  health_score: number;
  calls_last_hour: number;
  hour_window_start: string | null;
  last_used: string | null;
  last_error: string | null;
}

export interface PersistedState {
  lastSaved: string;
  keys: Record<string, {
    usageToday: number;
    status: string;
    cooldownUntil: string | null;
    cooldownCount: number;
    errorCount: number;
    successCount: number;
    avgResponseTime: number;
    healthScore?: number;
    callsLastHour?: number;
    hourWindowStart?: string | null;
    lastUsed?: string | null;
  }>;
  monthlyUsage: Record<string, number>;
}

// ─── Chargement depuis PostgreSQL (avec fallback fichier) ─────────────────────
export async function loadPersistedState(): Promise<PersistedState | null> {
  try {
    const rows = await db.select().from(apiKeyStates);

    if (rows.length === 0) {
      return await loadFromFile();
    }

    const today = new Date().toDateString();
    const keys: PersistedState['keys'] = {};

    for (const row of rows) {
      const savedDate = row.last_saved ? new Date(row.last_saved).toDateString() : '';
      const isToday = savedDate === today;

      keys[row.key_id] = {
        usageToday: isToday ? row.usage_today : 0,
        status: (!isToday && row.status === 'exhausted') ? 'active' : row.status,
        cooldownUntil: isToday && row.cooldown_until ? row.cooldown_until.toISOString() : null,
        cooldownCount: isToday ? row.cooldown_count : 0,
        errorCount: row.error_count,
        successCount: row.success_count,
        avgResponseTime: row.avg_response_ms,
        healthScore: row.health_score,
        callsLastHour: isToday ? row.calls_last_hour : 0,
        hourWindowStart: row.hour_window_start?.toISOString() || null,
        lastUsed: row.last_used?.toISOString() || null,
      };
    }

    return {
      lastSaved: new Date().toISOString(),
      keys,
      monthlyUsage: {},
    };
  } catch (err: any) {
    log(`DB load error — fallback fichier: ${err.message}`, 'key-persistence');
    return await loadFromFile();
  }
}

// ─── Sauvegarde dans PostgreSQL + fichier backup ───────────────────────────────
export async function saveState(data: { keys: Record<string, any>; monthlyUsage: Record<string, number> }) {
  try {
    const now = new Date();

    for (const [keyId, k] of Object.entries(data.keys)) {
      const parts = keyId.split('_');
      const service = parts[0];

      await db.insert(apiKeyStates).values({
        key_id: keyId,
        service,
        status: k.status || 'active',
        usage_today: k.usageToday || 0,
        cooldown_until: k.cooldownUntil ? new Date(k.cooldownUntil) : null,
        cooldown_count: k.cooldownCount || 0,
        error_count: k.errorCount || 0,
        success_count: k.successCount || 0,
        avg_response_ms: k.avgResponseTime || 0,
        health_score: k.healthScore ?? 100,
        calls_last_hour: k.callsLastHour || 0,
        hour_window_start: k.hourWindowStart ? new Date(k.hourWindowStart) : now,
        last_used: k.lastUsed ? new Date(k.lastUsed) : null,
        last_error: k.lastError || null,
        last_saved: now,
      }).onConflictDoUpdate({
        target: apiKeyStates.key_id,
        set: {
          status: k.status || 'active',
          usage_today: k.usageToday || 0,
          cooldown_until: k.cooldownUntil ? new Date(k.cooldownUntil) : null,
          cooldown_count: k.cooldownCount || 0,
          error_count: k.errorCount || 0,
          success_count: k.successCount || 0,
          avg_response_ms: k.avgResponseTime || 0,
          health_score: k.healthScore ?? 100,
          calls_last_hour: k.callsLastHour || 0,
          hour_window_start: k.hourWindowStart ? new Date(k.hourWindowStart) : now,
          last_used: k.lastUsed ? new Date(k.lastUsed) : null,
          last_error: k.lastError || null,
          last_saved: now,
        },
      });
    }

    // Backup fichier (non-bloquant)
    saveToFile(data).catch(() => {});
  } catch (err: any) {
    log(`DB save error: ${err.message}`, 'key-persistence');
    await saveToFile(data);
  }
}

// ─── Sauvegarde immédiate d'une seule clé ────────────────────────────────────
export async function saveKeyState(keyId: string, service: string, k: any) {
  try {
    const now = new Date();
    await db.insert(apiKeyStates).values({
      key_id: keyId,
      service,
      status: k.status || 'active',
      usage_today: k.usageToday || 0,
      cooldown_until: k.cooldownUntil ? new Date(k.cooldownUntil) : null,
      cooldown_count: k.cooldownCount || 0,
      error_count: k.errorCount || 0,
      success_count: k.successCount || 0,
      avg_response_ms: k.avgResponseTime || 0,
      health_score: k.healthScore ?? 100,
      calls_last_hour: k.callsLastHour || 0,
      hour_window_start: k.hourWindowStart ? new Date(k.hourWindowStart) : now,
      last_used: k.lastUsed ? new Date(k.lastUsed) : null,
      last_error: k.lastError || null,
      last_saved: now,
    }).onConflictDoUpdate({
      target: apiKeyStates.key_id,
      set: {
        status: k.status || 'active',
        usage_today: k.usageToday || 0,
        cooldown_until: k.cooldownUntil ? new Date(k.cooldownUntil) : null,
        cooldown_count: k.cooldownCount || 0,
        error_count: k.errorCount || 0,
        success_count: k.successCount || 0,
        avg_response_ms: k.avgResponseTime || 0,
        health_score: k.healthScore ?? 100,
        calls_last_hour: k.callsLastHour || 0,
        hour_window_start: k.hourWindowStart ? new Date(k.hourWindowStart) : now,
        last_used: k.lastUsed ? new Date(k.lastUsed) : null,
        last_error: k.lastError || null,
        last_saved: now,
      },
    });
  } catch {
    // Non-fatal
  }
}

// ─── Helpers fichier (backup/fallback) ───────────────────────────────────────
async function loadFromFile(): Promise<PersistedState | null> {
  try {
    const content = await fs.readFile(STATE_FILE, 'utf-8');
    const state: PersistedState = JSON.parse(content);

    const savedDate = new Date(state.lastSaved).toDateString();
    const today = new Date().toDateString();

    if (savedDate !== today) {
      log('État fichier d\'un autre jour — reset des compteurs journaliers', 'key-persistence');
      for (const keyData of Object.values(state.keys)) {
        keyData.usageToday = 0;
        keyData.cooldownCount = 0;
        if (keyData.status === 'exhausted') keyData.status = 'active';
        keyData.cooldownUntil = null;
      }
    }

    return state;
  } catch {
    return null;
  }
}

async function saveToFile(data: { keys: Record<string, any>; monthlyUsage: Record<string, number> }) {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    const state: PersistedState = {
      lastSaved: new Date().toISOString(),
      keys: data.keys,
      monthlyUsage: data.monthlyUsage,
    };
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err: any) {
    log(`Erreur sauvegarde fichier: ${err.message}`, 'key-persistence');
  }
}
