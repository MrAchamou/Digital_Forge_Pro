import { rotator } from './api-key-rotator';
import { log } from '../vite';

const MAX_RETRIES = 3;
const SERPER_DAILY_LIMIT_PER_KEY = 15;
const SERPER_MONTHLY_ALERT_THRESHOLD = 2400;
const SERPER_ROTATION_THRESHOLD = 3;

interface SerperCache {
  data: any;
  timestamp: number;
  query: string;
}

const cache = new Map<string, SerperCache>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCacheKey(query: string, type: string): string {
  return `${type}:${query.toLowerCase().trim()}`;
}

export async function callSerper(
  query: string,
  options: {
    type?: 'search' | 'places' | 'maps';
    num?: number;
    retryCount?: number;
  } = {}
): Promise<any> {
  const cacheKey = getCacheKey(query, options.type || 'search');
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    log(`Serper cache HIT: ${query.slice(0, 40)}`, 'serper-wrapper');
    return cached.data;
  }

  const retryCount = options.retryCount || 0;
  if (retryCount >= MAX_RETRIES) {
    return getSerperCacheFallback(query, cacheKey);
  }

  // Vérifier quota mensuel global
  const monthlyUsage = await rotator.getMonthlyUsage('serper');
  if (monthlyUsage >= SERPER_MONTHLY_ALERT_THRESHOLD) {
    log(`Quota mensuel Serper critique (${monthlyUsage}/2500) — vérification cache`, 'serper-wrapper');
    const fallback = getSerperCacheFallback(query, cacheKey);
    if (fallback) return fallback;
    throw new Error(`Quota mensuel Serper presque épuisé (${monthlyUsage}/2500). 100 requêtes de réserve conservées.`);
  }

  let key;
  try {
    key = await rotator.selectBestKey('serper');
  } catch (err: any) {
    log(`Serper pool épuisé: ${err.message}`, 'serper-wrapper');
    return getSerperCacheFallback(query, cacheKey) || (() => { throw err; })();
  }

  // Rotation forcée Serper après SERPER_ROTATION_THRESHOLD requêtes/clé
  if (key.usageToday >= SERPER_ROTATION_THRESHOLD) {
    log(`Rotation Serper forcée — clé ${key.id} a ${key.usageToday} appels aujourd'hui`, 'serper-wrapper');
  }

  const start = Date.now();
  const endpoint = options.type === 'places'
    ? 'https://google.serper.dev/places'
    : 'https://google.serper.dev/search';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': key.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: options.num ?? 5,
        gl: 'fr',
        hl: 'fr',
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const errText = await response.text();
      await rotator.handleError(key, response.status, errText);
      return callSerper(query, { ...options, retryCount: retryCount + 1 });
    }

    const data = await response.json();
    await rotator.recordSuccess(key, Date.now() - start);
    await rotator.recordMonthlyUsage('serper');

    // Mettre en cache
    cache.set(cacheKey, { data, timestamp: Date.now(), query });

    return data;
  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      await rotator.handleError(key, 408, 'Timeout');
    } else if (!err.message?.includes('retry')) {
      await rotator.handleError(key, 500, err.message);
    }
    return callSerper(query, { ...options, retryCount: retryCount + 1 });
  }
}

function getSerperCacheFallback(query: string, cacheKey: string): any | null {
  const cached = cache.get(cacheKey);
  if (cached) {
    log(`Serper fallback cache (expiré) pour: ${query.slice(0, 40)}`, 'serper-wrapper');
    return cached.data;
  }
  return null;
}

export function clearSerperCache() {
  cache.clear();
  log('Cache Serper vidé', 'serper-wrapper');
}
