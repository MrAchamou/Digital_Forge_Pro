import path from 'path';
import fs from 'fs/promises';
import { log } from '../vite';

const STATE_FILE = path.join(process.cwd(), 'data', 'api-keys-state.json');

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
  }>;
  monthlyUsage: Record<string, number>;
}

export async function loadPersistedState(): Promise<PersistedState | null> {
  try {
    const content = await fs.readFile(STATE_FILE, 'utf-8');
    const state: PersistedState = JSON.parse(content);

    // Vérifier que les données sont d'aujourd'hui (sinon reset usageToday)
    const savedDate = new Date(state.lastSaved).toDateString();
    const today = new Date().toDateString();

    if (savedDate !== today) {
      log('État sauvegardé d\'un autre jour — reset des compteurs journaliers', 'key-persistence');
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

export async function saveState(data: { keys: Record<string, any>; monthlyUsage: Record<string, number> }) {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    const state: PersistedState = {
      lastSaved: new Date().toISOString(),
      keys: data.keys,
      monthlyUsage: data.monthlyUsage,
    };
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err: any) {
    log(`Erreur sauvegarde état: ${err.message}`, 'key-persistence');
  }
}
