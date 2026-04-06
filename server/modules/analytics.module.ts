/**
 * 📊 ANALYTICS MODULE — v2.0
 *
 * - Export CSV et JSON de tous les événements de génération
 * - Heatmap des effets utilisés par secteur (matrice 2D effets × secteurs)
 * - Dashboard temps-réel avec hooks WebSocket (via le système de hooks)
 * - Comparaison A/B entre deux sessions ou deux variations
 */

import { log } from '../vite';

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
  /** Hash de la configuration pour comparaisons A/B */
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
  /** Intensité normalisée 0-1 pour la visualisation couleur */
  heat:       number;
}

export interface ABComparisonResult {
  session_a: string;    // config_hash ou id de session A
  session_b: string;
  events_a:  number;
  events_b:  number;
  delta: {
    diversity:    number;   // B - A
    fusion:       number;
    engagement:   number;
    performance:  number;
    duration_ms:  number;
  };
  winner:       'A' | 'B' | 'tie';
  confidence:   number;   // 0-1 : confiance statistique
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

// ─── Store en mémoire ─────────────────────────────────────────────────────────

const MAX_EVENTS    = 500;
const events: GenerationEvent[] = [];
let eventCounter    = 0;

// Hooks dashboard temps-réel
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

// ─── Enregistrement d'un événement ───────────────────────────────────────────

export function recordGeneration(event: Omit<GenerationEvent, 'id' | 'timestamp'>): string {
  const id        = `gen_${Date.now()}_${++eventCounter}`;
  const fullEvent = { id, timestamp: Date.now(), ...event };

  events.push(fullEvent);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  log(
    `📊 Analytics — Génération [${id}]: ${event.entreprise} (${event.secteur}) | ` +
    `${event.duration_ms}ms | Diversité:${(event.pipeline_scores.diversity * 100).toFixed(0)}%`,
    'analytics'
  );

  // Émettre vers les hooks dashboard temps-réel
  if (dashboardHooks.length > 0) {
    const qs = getQuickStats();
    for (const hook of dashboardHooks) {
      try { hook(fullEvent, qs); } catch { /* silencieux */ }
    }
  }

  return id;
}

// ─── Statistiques des effets ─────────────────────────────────────────────────

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

/**
 * Génère une heatmap 2D : chaque cellule représente la fréquence et l'intensité
 * d'un effet dans un secteur donné. Normalisé 0-1 pour la visualisation couleur.
 */
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

  // Trouver le max pour la normalisation
  const maxCount = Math.max(1, ...Array.from(cellMap.values()).map(c => c.count));

  return Array.from(cellMap.entries()).map(([key, cell]) => {
    const [effect_id, secteur] = key.split('||');
    const avg_intensity = cell.intensities.reduce((a, b) => a + b, 0) / cell.intensities.length;
    const heat = parseFloat(Math.min(1, (cell.count / maxCount) * 0.6 + avg_intensity * 0.4).toFixed(3));
    return { effect_id, secteur, count: cell.count, avg_intensity, heat };
  }).sort((a, b) => b.heat - a.heat);
}

// ─── Comparaison A/B ──────────────────────────────────────────────────────────

/**
 * Compare deux groupes d'événements (identifiés par config_hash ou date).
 * Retourne les deltas et le "gagnant" selon les scores clés.
 */
export function compareAB(
  sessionA: string,
  sessionB: string,
  allEvents: GenerationEvent[] = events
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

export function exportCSV(periodDays = 30): string {
  const cutoff = Date.now() - periodDays * 86400000;
  const subset = events.filter(e => e.timestamp >= cutoff);

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

// ─── Export JSON ──────────────────────────────────────────────────────────────

export function exportJSON(periodDays = 30): string {
  const cutoff = Date.now() - periodDays * 86400000;
  const subset = events.filter(e => e.timestamp >= cutoff);
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

  if (averages.duration_ms > 15000) {
    recs.push({ priority: 'medium', type: 'performance', title: 'Durée de génération élevée', description: `Moyenne ${(averages.duration_ms / 1000).toFixed(1)}s — envisager du caching ou paralléliser les cerveaux IA.`, metric: 'avg_duration_ms', value: averages.duration_ms, threshold: 15000 });
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

// ─── Génération du rapport ────────────────────────────────────────────────────

export function generateReport(periodDays = 30): AnalyticsReport {
  const now    = Date.now();
  const cutoff = now - periodDays * 86400000;
  const subset = events.filter(e => e.timestamp >= cutoff);

  if (subset.length === 0) {
    return {
      generated_at: now, period_start: cutoff, period_end: now,
      total_generations: 0, success_rate: 0,
      top_effects: [], sector_stats: [], effect_heatmap: [],
      global_averages: { duration_ms: 0, diversity_score: 0, fusion_score: 0, engagement_score: 0, performance_score: 0 },
      profile_distribution: {}, recommendations: [],
    };
  }

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
    effect_heatmap:    effect_heatmap.slice(0, 50),  // top 50 cellules
    global_averages:   globalAverages,
    profile_distribution: profileDistribution,
    recommendations:  generateRecommendations(subset, topEffects, globalAverages),
  };
}

// ─── Statistiques rapides ─────────────────────────────────────────────────────

export function getQuickStats(): QuickStats {
  const now    = Date.now();
  const day    = 86400000;
  const last24 = events.filter(e => e.timestamp >= now - day);
  const avgDiv = events.length > 0
    ? events.reduce((s, e) => s + e.pipeline_scores.diversity, 0) / events.length
    : 0;

  const sectorCount = new Map<string, number>();
  for (const e of events) sectorCount.set(e.secteur, (sectorCount.get(e.secteur) ?? 0) + 1);
  const topSector = Array.from(sectorCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a';

  return {
    total:         events.length,
    last_24h:      last24.length,
    avg_diversity: parseFloat(avgDiv.toFixed(3)),
    top_sector:    topSector,
    last_event:    events[events.length - 1] ?? null,
  };
}
