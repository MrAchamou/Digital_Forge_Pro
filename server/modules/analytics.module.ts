/**
 * 📊 ANALYTICS MODULE — v3.0 (PostgreSQL persistant)
 *
 * - Persistance PostgreSQL : les événements survivent aux redémarrages
 * - Export CSV et JSON de tous les événements de génération
 * - Heatmap des effets utilisés par secteur (matrice 2D effets × secteurs)
 * - Dashboard temps-réel avec hooks WebSocket
 * - Comparaison A/B entre deux sessions ou deux variations
 * - Alertes automatiques si le temps de génération dépasse un seuil configurable
 * - Segmentation par secteur, variation et profil de rendu
 */

import { log } from '../vite';
import { db } from '../db';
import { analyticsEvents } from '../../shared/schema';
import { desc, gte, sql } from 'drizzle-orm';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerationEvent {
  id:             string;
  timestamp:      number;
  secteur:        string;
  entreprise:     string;
  duration_ms:    number;
  variations: {
    A: VariationMetrics;
    B: VariationMetrics;
    C: VariationMetrics;
    D: VariationMetrics;
  };
  pipeline_scores: {
    diversity:    number;
    fusion:       number;
    engagement:   number;
    performance:  number;
    content:      number;
  };
  rendering_profiles: Record<string, string>;
  optimisations_count: number;
  status:         'success' | 'partial' | 'error';
  config_hash?:   string;
}

export interface VariationMetrics {
  key:           string;
  logo_effect:   string;
  cta_effect:    string;
  layer_count:   number;
  avg_intensity: number;
  profile:       string;
}

export interface EffectUsageStats {
  effect_id:     string;
  count:         number;
  avg_intensity: number;
  sectors:       string[];
  variations:    string[];
  last_used:     number;
}

export interface SectorStats {
  secteur:           string;
  generation_count:  number;
  avg_duration_ms:   number;
  avg_diversity:     number;
  top_effects:       string[];
  preferred_profile: string;
}

export interface EffectHeatmapCell {
  effect_id:  string;
  secteur:    string;
  count:      number;
  avg_intensity: number;
  heat:       number;
}

export interface ABComparisonResult {
  session_a: string;
  session_b: string;
  events_a:  number;
  events_b:  number;
  delta: {
    diversity:    number;
    fusion:       number;
    engagement:   number;
    performance:  number;
    duration_ms:  number;
  };
  winner:       'A' | 'B' | 'tie';
  confidence:   number;
  summary:      string;
}

export interface OptimizationRecommendation {
  priority:    'high' | 'medium' | 'low';
  type:        'effect' | 'sector' | 'pipeline' | 'performance';
  title:       string;
  description: string;
  metric:      string;
  value:       number;
  threshold:   number;
}

export interface AnalyticsReport {
  generated_at:     number;
  period_start:     number;
  period_end:       number;
  total_generations: number;
  success_rate:     number;
  top_effects:      EffectUsageStats[];
  sector_stats:     SectorStats[];
  effect_heatmap:   EffectHeatmapCell[];
  global_averages: {
    duration_ms:       number;
    diversity_score:   number;
    fusion_score:      number;
    engagement_score:  number;
    performance_score: number;
  };
  profile_distribution: Record<string, number>;
  recommendations:  OptimizationRecommendation[];
}

// ─── Configuration des alertes ────────────────────────────────────────────────

export interface AlertThresholds {
  max_duration_ms:   number;   // alerte si génération > N ms (défaut: 45 000)
  min_diversity:     number;   // alerte si diversité < N (défaut: 0.50)
  min_success_rate:  number;   // alerte si taux succès < N% (défaut: 80)
}

let alertThresholds: AlertThresholds = {
  max_duration_ms:  45000,
  min_diversity:    0.50,
  min_success_rate: 80,
};

export function setAlertThresholds(t: Partial<AlertThresholds>): void {
  alertThresholds = { ...alertThresholds, ...t };
}

export function getAlertThresholds(): AlertThresholds {
  return { ...alertThresholds };
}

// ─── Cache en mémoire (500 derniers événements pour requêtes rapides) ─────────

const MAX_CACHE    = 500;
const eventsCache: GenerationEvent[] = [];
let   eventCounter = 0;

// Hooks dashboard temps-réel (WebSocket)
type DashboardHook = (event: GenerationEvent, quickStats: QuickStats) => void;
const dashboardHooks: DashboardHook[] = [];

interface QuickStats {
  total:          number;
  last_24h:       number;
  avg_diversity:  number;
  top_sector:     string;
  last_event:     GenerationEvent | null;
}

export function registerDashboardHook(hook: DashboardHook): void {
  dashboardHooks.push(hook);
}

export function unregisterDashboardHook(hook: DashboardHook): void {
  const idx = dashboardHooks.indexOf(hook);
  if (idx >= 0) dashboardHooks.splice(idx, 1);
}

// ─── Alertes actives ──────────────────────────────────────────────────────────

export interface AnalyticsAlert {
  type:       'slow_generation' | 'low_diversity' | 'low_success_rate';
  severity:   'warning' | 'critical';
  message:    string;
  value:      number;
  threshold:  number;
  event_id:   string;
  timestamp:  number;
}

const recentAlerts: AnalyticsAlert[] = [];

function checkAndFireAlerts(event: GenerationEvent): void {
  const now = Date.now();

  if (event.duration_ms > alertThresholds.max_duration_ms) {
    const alert: AnalyticsAlert = {
      type:      'slow_generation',
      severity:  event.duration_ms > alertThresholds.max_duration_ms * 2 ? 'critical' : 'warning',
      message:   `Génération lente : ${(event.duration_ms / 1000).toFixed(1)}s (seuil: ${alertThresholds.max_duration_ms / 1000}s)`,
      value:     event.duration_ms,
      threshold: alertThresholds.max_duration_ms,
      event_id:  event.id,
      timestamp: now,
    };
    recentAlerts.push(alert);
    if (recentAlerts.length > 100) recentAlerts.shift();
    log(`⚠️ ALERTE Analytics: ${alert.message}`, 'analytics');
  }

  if (event.pipeline_scores.diversity < alertThresholds.min_diversity) {
    const alert: AnalyticsAlert = {
      type:      'low_diversity',
      severity:  event.pipeline_scores.diversity < alertThresholds.min_diversity * 0.7 ? 'critical' : 'warning',
      message:   `Diversité faible : ${(event.pipeline_scores.diversity * 100).toFixed(0)}% (seuil: ${alertThresholds.min_diversity * 100}%)`,
      value:     event.pipeline_scores.diversity,
      threshold: alertThresholds.min_diversity,
      event_id:  event.id,
      timestamp: now,
    };
    recentAlerts.push(alert);
    if (recentAlerts.length > 100) recentAlerts.shift();
  }
}

export function getRecentAlerts(limit = 20): AnalyticsAlert[] {
  return recentAlerts.slice(-limit).reverse();
}

// ─── Enregistrement d'un événement (en mémoire + PostgreSQL) ─────────────────

export async function recordGenerationAsync(event: Omit<GenerationEvent, 'id' | 'timestamp'>): Promise<string> {
  const id        = `gen_${Date.now()}_${++eventCounter}`;
  const timestamp = Date.now();
  const fullEvent: GenerationEvent = { id, timestamp, ...event };

  // 1. Mise à jour du cache mémoire
  eventsCache.push(fullEvent);
  if (eventsCache.length > MAX_CACHE) eventsCache.splice(0, eventsCache.length - MAX_CACHE);

  // 2. Persistance PostgreSQL (non-bloquante)
  db.insert(analyticsEvents).values({
    secteur:             event.secteur,
    entreprise:          event.entreprise,
    duration_ms:         event.duration_ms,
    variations:          event.variations as any,
    pipeline_scores:     event.pipeline_scores as any,
    rendering_profiles:  event.rendering_profiles as any,
    optimisations_count: event.optimisations_count,
    status:              event.status,
    config_hash:         event.config_hash,
  }).catch(err => log(`⚠️ Analytics DB write error: ${err.message}`, 'analytics'));

  // 3. Vérification des alertes
  checkAndFireAlerts(fullEvent);

  log(
    `📊 Analytics — Génération [${id}]: ${event.entreprise} (${event.secteur}) | ` +
    `${event.duration_ms}ms | Diversité:${(event.pipeline_scores.diversity * 100).toFixed(0)}%`,
    'analytics'
  );

  // 4. Émettre vers les hooks dashboard temps-réel (WebSocket)
  if (dashboardHooks.length > 0) {
    const qs = getQuickStats();
    for (const hook of dashboardHooks) {
      try { hook(fullEvent, qs); } catch { /* silencieux */ }
    }
  }

  return id;
}

// Compatibilité synchrone (utilise uniquement le cache mémoire)
export function recordGeneration(event: Omit<GenerationEvent, 'id' | 'timestamp'>): string {
  const id        = `gen_${Date.now()}_${++eventCounter}`;
  const timestamp = Date.now();
  const fullEvent: GenerationEvent = { id, timestamp, ...event };

  eventsCache.push(fullEvent);
  if (eventsCache.length > MAX_CACHE) eventsCache.splice(0, eventsCache.length - MAX_CACHE);

  // Persist asynchronously
  recordGenerationAsync(event).catch(() => {});

  checkAndFireAlerts(fullEvent);

  if (dashboardHooks.length > 0) {
    const qs = getQuickStats();
    for (const hook of dashboardHooks) {
      try { hook(fullEvent, qs); } catch { /* silencieux */ }
    }
  }

  return id;
}

// ─── Récupération des événements depuis PostgreSQL ───────────────────────────

export async function fetchEventsFromDB(periodDays = 30, limit = 1000): Promise<GenerationEvent[]> {
  try {
    const cutoff  = new Date(Date.now() - periodDays * 86400000);
    const rows    = await db.select().from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, cutoff))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit);

    return rows.map(row => ({
      id:                  row.id,
      timestamp:           row.createdAt?.getTime() ?? Date.now(),
      secteur:             row.secteur,
      entreprise:          row.entreprise,
      duration_ms:         row.duration_ms,
      variations:          row.variations as GenerationEvent['variations'],
      pipeline_scores:     row.pipeline_scores as GenerationEvent['pipeline_scores'],
      rendering_profiles:  row.rendering_profiles as Record<string, string>,
      optimisations_count: row.optimisations_count,
      status:              row.status as GenerationEvent['status'],
      config_hash:         row.config_hash ?? undefined,
    }));
  } catch (err: any) {
    log(`⚠️ Analytics DB fetch error: ${err.message}`, 'analytics');
    return eventsCache;
  }
}

// ─── Statistiques des effets ──────────────────────────────────────────────────

function computeEffectStats(subset: GenerationEvent[]): EffectUsageStats[] {
  const statsMap = new Map<string, { count: number; intensities: number[]; sectors: Set<string>; variations: Set<string>; last: number }>();

  for (const event of subset) {
    for (const vk of ['A', 'B', 'C', 'D'] as const) {
      const vm = event.variations[vk];
      for (const effectId of [vm.logo_effect, vm.cta_effect]) {
        if (!effectId) continue;
        const existing = statsMap.get(effectId) ?? { count: 0, intensities: [], sectors: new Set(), variations: new Set(), last: 0 };
        existing.count++;
        existing.intensities.push(vm.avg_intensity);
        existing.sectors.add(event.secteur);
        existing.variations.add(vk);
        existing.last = Math.max(existing.last, event.timestamp);
        statsMap.set(effectId, existing);
      }
    }
  }

  return Array.from(statsMap.entries())
    .map(([effectId, s]) => ({
      effect_id:     effectId,
      count:         s.count,
      avg_intensity: s.intensities.reduce((a, b) => a + b, 0) / s.intensities.length,
      sectors:       Array.from(s.sectors),
      variations:    Array.from(s.variations),
      last_used:     s.last,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

// ─── Statistiques par secteur ─────────────────────────────────────────────────

function computeSectorStats(subset: GenerationEvent[]): SectorStats[] {
  const sectorMap = new Map<string, GenerationEvent[]>();
  for (const e of subset) {
    const arr = sectorMap.get(e.secteur) ?? [];
    arr.push(e);
    sectorMap.set(e.secteur, arr);
  }

  return Array.from(sectorMap.entries())
    .map(([secteur, evts]) => {
      const avgDuration  = evts.reduce((s, e) => s + e.duration_ms, 0) / evts.length;
      const avgDiversity = evts.reduce((s, e) => s + e.pipeline_scores.diversity, 0) / evts.length;

      const effectFreq = new Map<string, number>();
      for (const e of evts) {
        for (const vk of ['A', 'B', 'C', 'D'] as const) {
          const vm = e.variations[vk];
          for (const id of [vm.logo_effect, vm.cta_effect]) {
            if (id) effectFreq.set(id, (effectFreq.get(id) ?? 0) + 1);
          }
        }
      }
      const topEffects = Array.from(effectFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);

      const profileFreq = new Map<string, number>();
      for (const e of evts) {
        for (const p of Object.values(e.rendering_profiles)) profileFreq.set(p, (profileFreq.get(p) ?? 0) + 1);
      }
      const preferredProfile = Array.from(profileFreq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'balanced';

      return { secteur, generation_count: evts.length, avg_duration_ms: Math.round(avgDuration), avg_diversity: avgDiversity, top_effects: topEffects, preferred_profile: preferredProfile };
    })
    .sort((a, b) => b.generation_count - a.generation_count);
}

// ─── Heatmap effets × secteurs ────────────────────────────────────────────────

export function computeEffectHeatmap(subset: GenerationEvent[]): EffectHeatmapCell[] {
  const cellMap = new Map<string, { count: number; intensities: number[] }>();

  for (const event of subset) {
    for (const vk of ['A', 'B', 'C', 'D'] as const) {
      const vm = event.variations[vk];
      for (const effectId of [vm.logo_effect, vm.cta_effect]) {
        if (!effectId) continue;
        const key = `${effectId}||${event.secteur}`;
        const cell = cellMap.get(key) ?? { count: 0, intensities: [] };
        cell.count++;
        cell.intensities.push(vm.avg_intensity);
        cellMap.set(key, cell);
      }
    }
  }

  const maxCount = Math.max(1, ...Array.from(cellMap.values()).map(c => c.count));

  return Array.from(cellMap.entries()).map(([key, cell]) => {
    const [effect_id, secteur] = key.split('||');
    const avg_intensity = cell.intensities.reduce((a, b) => a + b, 0) / cell.intensities.length;
    const heat = parseFloat(Math.min(1, (cell.count / maxCount) * 0.6 + avg_intensity * 0.4).toFixed(3));
    return { effect_id, secteur, count: cell.count, avg_intensity, heat };
  }).sort((a, b) => b.heat - a.heat);
}

// ─── Segmentation par variation et profil de rendu ────────────────────────────

export function getSegmentation(subset: GenerationEvent[]) {
  const byVariation: Record<string, { count: number; avg_diversity: number; top_effects: string[] }> = {};
  const byProfile:   Record<string, { count: number; avg_duration: number; avg_engagement: number }> = {};

  for (const vk of ['A', 'B', 'C', 'D'] as const) {
    const vEvents = subset.filter(e => e.variations[vk]?.profile);
    if (vEvents.length === 0) continue;
    const effectFreq = new Map<string, number>();
    for (const e of vEvents) {
      const ef = e.variations[vk].logo_effect;
      if (ef) effectFreq.set(ef, (effectFreq.get(ef) ?? 0) + 1);
    }
    byVariation[vk] = {
      count:         vEvents.length,
      avg_diversity: vEvents.reduce((s, e) => s + e.pipeline_scores.diversity, 0) / vEvents.length,
      top_effects:   Array.from(effectFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id),
    };
  }

  for (const e of subset) {
    for (const profile of Object.values(e.rendering_profiles)) {
      const existing = byProfile[profile] ?? { count: 0, avg_duration: 0, avg_engagement: 0 };
      existing.count++;
      existing.avg_duration   = (existing.avg_duration   * (existing.count - 1) + e.duration_ms) / existing.count;
      existing.avg_engagement = (existing.avg_engagement * (existing.count - 1) + e.pipeline_scores.engagement) / existing.count;
      byProfile[profile] = existing;
    }
  }

  return { byVariation, byProfile };
}

// ─── Comparaison A/B ──────────────────────────────────────────────────────────

export function compareAB(
  sessionA: string,
  sessionB: string,
  allEvents: GenerationEvent[] = eventsCache
): ABComparisonResult {
  const eventsA = allEvents.filter(e => e.config_hash === sessionA || e.id.startsWith(sessionA));
  const eventsB = allEvents.filter(e => e.config_hash === sessionB || e.id.startsWith(sessionB));

  const avg = (evts: GenerationEvent[], key: keyof GenerationEvent['pipeline_scores']) =>
    evts.length > 0 ? evts.reduce((s, e) => s + e.pipeline_scores[key], 0) / evts.length : 0;

  const avgDuration = (evts: GenerationEvent[]) =>
    evts.length > 0 ? evts.reduce((s, e) => s + e.duration_ms, 0) / evts.length : 0;

  const delta = {
    diversity:   parseFloat((avg(eventsB, 'diversity')    - avg(eventsA, 'diversity')).toFixed(3)),
    fusion:      parseFloat((avg(eventsB, 'fusion')       - avg(eventsA, 'fusion')).toFixed(3)),
    engagement:  parseFloat((avg(eventsB, 'engagement')   - avg(eventsA, 'engagement')).toFixed(3)),
    performance: parseFloat((avg(eventsB, 'performance')  - avg(eventsA, 'performance')).toFixed(3)),
    duration_ms: parseFloat((avgDuration(eventsB)         - avgDuration(eventsA)).toFixed(0)),
  };

  const scoreA = avg(eventsA, 'diversity') * 0.25 + avg(eventsA, 'engagement') * 0.35 + avg(eventsA, 'performance') * 0.20 + avg(eventsA, 'fusion') * 0.20;
  const scoreB = avg(eventsB, 'diversity') * 0.25 + avg(eventsB, 'engagement') * 0.35 + avg(eventsB, 'performance') * 0.20 + avg(eventsB, 'fusion') * 0.20;
  const diff   = Math.abs(scoreB - scoreA);
  const winner: ABComparisonResult['winner'] = diff < 0.02 ? 'tie' : scoreB > scoreA ? 'B' : 'A';
  const confidence = Math.min(1, Math.min(eventsA.length, eventsB.length) / 10 * 0.5 + diff * 5);

  const improvements = Object.entries(delta)
    .filter(([k, v]) => v > 0.01 && k !== 'duration_ms')
    .map(([k, v]) => `${k}+${(v * 100).toFixed(0)}%`);

  return {
    session_a: sessionA,
    session_b: sessionB,
    events_a:  eventsA.length,
    events_b:  eventsB.length,
    delta,
    winner,
    confidence: parseFloat(confidence.toFixed(2)),
    summary: winner === 'tie'
      ? `Sessions similaires (Δ<2%) — confiance: ${(confidence * 100).toFixed(0)}%`
      : `Session ${winner} gagne (+${(diff * 100).toFixed(0)}%) — améliorations: ${improvements.join(', ')}`,
  };
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

export function exportCSV(subset: GenerationEvent[]): string {
  const headers = [
    'id', 'timestamp', 'entreprise', 'secteur', 'duration_ms', 'status',
    'diversity', 'fusion', 'engagement', 'performance', 'content',
    'logo_A', 'cta_A', 'intensity_A', 'profile_A',
    'logo_B', 'cta_B', 'intensity_B', 'profile_B',
    'logo_C', 'cta_C', 'intensity_C', 'profile_C',
    'logo_D', 'cta_D', 'intensity_D', 'profile_D',
  ].join(',');

  const rows = subset.map(e => [
    e.id,
    new Date(e.timestamp).toISOString(),
    `"${e.entreprise}"`,
    e.secteur,
    e.duration_ms,
    e.status,
    e.pipeline_scores.diversity.toFixed(3),
    e.pipeline_scores.fusion.toFixed(3),
    e.pipeline_scores.engagement.toFixed(3),
    e.pipeline_scores.performance.toFixed(3),
    e.pipeline_scores.content.toFixed(3),
    e.variations.A.logo_effect, e.variations.A.cta_effect, e.variations.A.avg_intensity.toFixed(3), e.variations.A.profile,
    e.variations.B.logo_effect, e.variations.B.cta_effect, e.variations.B.avg_intensity.toFixed(3), e.variations.B.profile,
    e.variations.C.logo_effect, e.variations.C.cta_effect, e.variations.C.avg_intensity.toFixed(3), e.variations.C.profile,
    e.variations.D.logo_effect, e.variations.D.cta_effect, e.variations.D.avg_intensity.toFixed(3), e.variations.D.profile,
  ].join(','));

  return [headers, ...rows].join('\n');
}

export async function exportCSVFromDB(periodDays = 30): Promise<string> {
  const subset = await fetchEventsFromDB(periodDays);
  return exportCSV(subset);
}

// ─── Export JSON ──────────────────────────────────────────────────────────────

export async function exportJSONFromDB(periodDays = 30): Promise<string> {
  const subset = await fetchEventsFromDB(periodDays);
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    period_days: periodDays,
    count:       subset.length,
    events:      subset,
  }, null, 2);
}

// ─── Recommandations automatiques ────────────────────────────────────────────

function generateRecommendations(
  subset:     GenerationEvent[],
  topEffects: EffectUsageStats[],
  averages:   AnalyticsReport['global_averages']
): OptimizationRecommendation[] {
  const recs: OptimizationRecommendation[] = [];

  if (averages.diversity_score < 0.60) {
    recs.push({ priority: 'high', type: 'pipeline', title: 'Diversité génétique insuffisante', description: 'Augmenter mutation_rate ou la pression de sélection du VarianceEngine.', metric: 'avg_diversity', value: averages.diversity_score, threshold: 0.60 });
  }

  if (averages.duration_ms > alertThresholds.max_duration_ms) {
    recs.push({ priority: 'medium', type: 'performance', title: 'Durée de génération élevée', description: `Moyenne ${(averages.duration_ms / 1000).toFixed(1)}s — envisager du caching ou paralléliser les cerveaux IA.`, metric: 'avg_duration_ms', value: averages.duration_ms, threshold: alertThresholds.max_duration_ms });
  }

  if (averages.engagement_score < 0.55) {
    recs.push({ priority: 'medium', type: 'pipeline', title: 'Score d\'engagement ExperienceOrchestrator faible', description: 'Augmenter l\'écart d\'intensité intro/climax (arc 7 phases).', metric: 'avg_engagement', value: averages.engagement_score, threshold: 0.55 });
  }

  if (topEffects.length > 0 && topEffects[0].count > subset.length * 0.40) {
    recs.push({ priority: 'low', type: 'effect', title: `Effet "${topEffects[0].effect_id}" sur-représenté`, description: `Présent dans ${((topEffects[0].count / subset.length / 4) * 100).toFixed(0)}% des générations — réduire son poids dans le pool.`, metric: 'effect_frequency', value: topEffects[0].count, threshold: Math.floor(subset.length * 0.40) });
  }

  if (averages.fusion_score < 0.50) {
    recs.push({ priority: 'low', type: 'pipeline', title: 'Score de fusion hybride faible', description: 'Élargir les fenêtres de compatibilité inter-familles dans l\'EffectFusionEngine.', metric: 'avg_fusion', value: averages.fusion_score, threshold: 0.50 });
  }

  return recs.sort((a, b) => ['high', 'medium', 'low'].indexOf(a.priority) - ['high', 'medium', 'low'].indexOf(b.priority));
}

// ─── Génération du rapport (depuis PostgreSQL) ────────────────────────────────

export async function generateReportAsync(periodDays = 30): Promise<AnalyticsReport> {
  const now    = Date.now();
  const cutoff = now - periodDays * 86400000;
  const subset = await fetchEventsFromDB(periodDays);

  if (subset.length === 0) {
    return {
      generated_at: now, period_start: cutoff, period_end: now,
      total_generations: 0, success_rate: 0,
      top_effects: [], sector_stats: [], effect_heatmap: [],
      global_averages: { duration_ms: 0, diversity_score: 0, fusion_score: 0, engagement_score: 0, performance_score: 0 },
      profile_distribution: {}, recommendations: [],
    };
  }

  return buildReport(subset, now, cutoff);
}

// Rapport synchrone depuis le cache mémoire (pour compatibilité)
export function generateReport(periodDays = 30): AnalyticsReport {
  const now    = Date.now();
  const cutoff = now - periodDays * 86400000;
  const subset = eventsCache.filter(e => e.timestamp >= cutoff);
  if (subset.length === 0) {
    return {
      generated_at: now, period_start: cutoff, period_end: now,
      total_generations: 0, success_rate: 0,
      top_effects: [], sector_stats: [], effect_heatmap: [],
      global_averages: { duration_ms: 0, diversity_score: 0, fusion_score: 0, engagement_score: 0, performance_score: 0 },
      profile_distribution: {}, recommendations: [],
    };
  }
  return buildReport(subset, now, cutoff);
}

function buildReport(subset: GenerationEvent[], now: number, cutoff: number): AnalyticsReport {
  const successCount    = subset.filter(e => e.status === 'success').length;
  const topEffects      = computeEffectStats(subset);
  const sectorStats     = computeSectorStats(subset);
  const effect_heatmap  = computeEffectHeatmap(subset);

  const avg = (key: keyof GenerationEvent['pipeline_scores']) =>
    parseFloat((subset.reduce((s, e) => s + (e.pipeline_scores[key] ?? 0), 0) / subset.length).toFixed(3));

  const globalAverages: AnalyticsReport['global_averages'] = {
    duration_ms:      Math.round(subset.reduce((s, e) => s + e.duration_ms, 0) / subset.length),
    diversity_score:  avg('diversity'),
    fusion_score:     avg('fusion'),
    engagement_score: avg('engagement'),
    performance_score: avg('performance'),
  };

  const profileFreq = new Map<string, number>();
  for (const e of subset) {
    for (const p of Object.values(e.rendering_profiles)) profileFreq.set(p, (profileFreq.get(p) ?? 0) + 1);
  }
  const totalProfiles = Array.from(profileFreq.values()).reduce((a, b) => a + b, 0);
  const profileDistribution: Record<string, number> = {};
  profileFreq.forEach((count, profile) => { profileDistribution[profile] = Math.round((count / totalProfiles) * 100); });

  return {
    generated_at:      now,
    period_start:      cutoff,
    period_end:        now,
    total_generations: subset.length,
    success_rate:      Math.round((successCount / subset.length) * 100),
    top_effects:       topEffects,
    sector_stats:      sectorStats,
    effect_heatmap:    effect_heatmap.slice(0, 50),
    global_averages:   globalAverages,
    profile_distribution: profileDistribution,
    recommendations:  generateRecommendations(subset, topEffects, globalAverages),
  };
}

// ─── Statistiques rapides ─────────────────────────────────────────────────────

export function getQuickStats(): QuickStats {
  const now    = Date.now();
  const day    = 86400000;
  const last24 = eventsCache.filter(e => e.timestamp >= now - day);
  const avgDiv = eventsCache.length > 0
    ? eventsCache.reduce((s, e) => s + e.pipeline_scores.diversity, 0) / eventsCache.length
    : 0;

  const sectorCount = new Map<string, number>();
  for (const e of eventsCache) sectorCount.set(e.secteur, (sectorCount.get(e.secteur) ?? 0) + 1);
  const topSector = Array.from(sectorCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a';

  return {
    total:         eventsCache.length,
    last_24h:      last24.length,
    avg_diversity: parseFloat(avgDiv.toFixed(3)),
    top_sector:    topSector,
    last_event:    eventsCache[eventsCache.length - 1] ?? null,
  };
}

// ─── Chargement du cache depuis PostgreSQL au démarrage ──────────────────────

export async function warmupCache(): Promise<void> {
  try {
    const recentEvents = await fetchEventsFromDB(7, MAX_CACHE);
    for (const event of recentEvents.reverse()) {
      eventsCache.push(event);
    }
    if (eventsCache.length > MAX_CACHE) eventsCache.splice(0, eventsCache.length - MAX_CACHE);
    log(`📊 Analytics — Cache réchauffé avec ${eventsCache.length} événements depuis PostgreSQL`, 'analytics');
  } catch (err: any) {
    log(`⚠️ Analytics warmup échoué: ${err.message}`, 'analytics');
  }
}
