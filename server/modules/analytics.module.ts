/**
 * 📊 ANALYTICS MODULE — Module 12, Priorité 4
 *
 * Collecte les métriques de performance et de génération :
 * - Effets sélectionnés par secteur et variation
 * - Scores de diversité, fusion, expérience par session
 * - Profils de rendu utilisés et leur efficacité
 * - Durées de génération par étape du pipeline
 *
 * Génère des rapports d'optimisation automatiques
 * pour guider l'ajustement des algorithmes au fil du temps.
 *
 * Architecture :
 *   - Store en mémoire (persisté sur le système de fichiers au shutdown)
 *   - Rotation automatique : garde les 500 derniers événements
 *   - Agrégats calculés à la demande (pas de calcul continu)
 *   - Exposition via endpoint GET /api/analytics/report
 */

import { log } from '../vite';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerationEvent {
  id:             string;
  timestamp:      number;
  secteur:        string;
  entreprise:     string;
  duration_ms:    number;      // durée totale du pipeline
  variations: {
    A: VariationMetrics;
    B: VariationMetrics;
    C: VariationMetrics;
    D: VariationMetrics;
  };
  pipeline_scores: {
    diversity:    number;      // VarianceEngine
    fusion:       number;      // EffectFusionEngine
    engagement:   number;      // ExperienceOrchestrator
    performance:  number;      // AdaptiveRenderingEngine
    content:      number;      // ContentAnalyzer
  };
  rendering_profiles: Record<string, string>;   // variation → profil
  optimisations_count: number;
  status:         'success' | 'partial' | 'error';
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
  effect_id:    string;
  count:        number;
  avg_intensity: number;
  sectors:      string[];
  variations:   string[];
  last_used:    number;
}

export interface SectorStats {
  secteur:          string;
  generation_count: number;
  avg_duration_ms:  number;
  avg_diversity:    number;
  top_effects:      string[];
  preferred_profile: string;
}

export interface AnalyticsReport {
  generated_at:     number;
  period_start:     number;
  period_end:       number;
  total_generations: number;
  success_rate:     number;

  // Effets les plus utilisés
  top_effects:      EffectUsageStats[];

  // Statistiques par secteur
  sector_stats:     SectorStats[];

  // Moyennes globales
  global_averages: {
    duration_ms:     number;
    diversity_score: number;
    fusion_score:    number;
    engagement_score: number;
    performance_score: number;
  };

  // Profils de rendu utilisés
  profile_distribution: Record<string, number>;  // profil → % utilisations

  // Recommandations d'optimisation automatiques
  recommendations:  OptimizationRecommendation[];
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

// ─── Store en mémoire ─────────────────────────────────────────────────────────

const MAX_EVENTS   = 500;
const events: GenerationEvent[] = [];
let eventCounter   = 0;

// ─── Enregistrement d'un événement ───────────────────────────────────────────

export function recordGeneration(event: Omit<GenerationEvent, 'id' | 'timestamp'>): string {
  const id = `gen_${Date.now()}_${++eventCounter}`;
  const fullEvent: GenerationEvent = {
    id,
    timestamp: Date.now(),
    ...event,
  };

  events.push(fullEvent);

  // Rotation : garder les 500 derniers
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }

  log(`📊 Analytics — Génération enregistrée: ${event.entreprise} (${event.secteur}) | ${event.duration_ms}ms | Diversité:${(event.pipeline_scores.diversity * 100).toFixed(0)}%`, 'analytics');

  return id;
}

// ─── Statistiques des effets ─────────────────────────────────────────────────

function computeEffectStats(subset: GenerationEvent[]): EffectUsageStats[] {
  const statsMap = new Map<string, {
    count: number; intensities: number[]; sectors: Set<string>; variations: Set<string>; last: number;
  }>();

  subset.forEach(event => {
    const varKeys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
    varKeys.forEach(vk => {
      const vm = event.variations[vk];
      [vm.logo_effect, vm.cta_effect].forEach(effectId => {
        if (!effectId) return;
        const existing = statsMap.get(effectId) ?? { count: 0, intensities: [], sectors: new Set(), variations: new Set(), last: 0 };
        existing.count++;
        existing.intensities.push(vm.avg_intensity);
        existing.sectors.add(event.secteur);
        existing.variations.add(vk);
        existing.last = Math.max(existing.last, event.timestamp);
        statsMap.set(effectId, existing);
      });
    });
  });

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
  subset.forEach(e => {
    const arr = sectorMap.get(e.secteur) ?? [];
    arr.push(e);
    sectorMap.set(e.secteur, arr);
  });

  return Array.from(sectorMap.entries())
    .map(([secteur, evts]) => {
      const avgDuration  = evts.reduce((s, e) => s + e.duration_ms, 0) / evts.length;
      const avgDiversity = evts.reduce((s, e) => s + e.pipeline_scores.diversity, 0) / evts.length;

      // Top effets dans ce secteur
      const effectFreq = new Map<string, number>();
      evts.forEach(e => {
        ['A', 'B', 'C', 'D'].forEach(vk => {
          const vm = e.variations[vk as 'A'];
          [vm.logo_effect, vm.cta_effect].forEach(id => {
            if (id) effectFreq.set(id, (effectFreq.get(id) ?? 0) + 1);
          });
        });
      });
      const topEffects = Array.from(effectFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      // Profil le plus utilisé
      const profileFreq = new Map<string, number>();
      evts.forEach(e => {
        Object.values(e.rendering_profiles).forEach(p => {
          profileFreq.set(p, (profileFreq.get(p) ?? 0) + 1);
        });
      });
      const preferredProfile = Array.from(profileFreq.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'balanced';

      return { secteur, generation_count: evts.length, avg_duration_ms: Math.round(avgDuration), avg_diversity: avgDiversity, top_effects: topEffects, preferred_profile: preferredProfile };
    })
    .sort((a, b) => b.generation_count - a.generation_count);
}

// ─── Recommandations automatiques ────────────────────────────────────────────

function generateRecommendations(
  subset:      GenerationEvent[],
  topEffects:  EffectUsageStats[],
  averages:    AnalyticsReport['global_averages']
): OptimizationRecommendation[] {
  const recs: OptimizationRecommendation[] = [];

  // Diversité trop faible
  if (averages.diversity_score < 0.6) {
    recs.push({
      priority: 'high', type: 'pipeline',
      title: 'Diversité génétique insuffisante',
      description: 'Le VarianceEngine produit des variations trop similaires. Augmenter le mutation_rate ou la pression de sélection.',
      metric: 'avg_diversity', value: averages.diversity_score, threshold: 0.6,
    });
  }

  // Durée trop longue
  if (averages.duration_ms > 15000) {
    recs.push({
      priority: 'medium', type: 'performance',
      title: 'Durée de génération élevée',
      description: `Moyenne de ${(averages.duration_ms / 1000).toFixed(1)}s. Envisager du caching pour les effets fréquents ou paralléliser les cerveaux IA.`,
      metric: 'avg_duration_ms', value: averages.duration_ms, threshold: 15000,
    });
  }

  // Engagement faible
  if (averages.engagement_score < 0.55) {
    recs.push({
      priority: 'medium', type: 'pipeline',
      title: 'Score d\'engagement Experience Orchestrator faible',
      description: 'Les arcs émotionnels manquent de contraste intro/climax. Augmenter l\'écart d\'intensité entre phases.',
      metric: 'avg_engagement', value: averages.engagement_score, threshold: 0.55,
    });
  }

  // Effet sur-utilisé
  if (topEffects.length > 0 && topEffects[0].count > subset.length * 0.4) {
    recs.push({
      priority: 'low', type: 'effect',
      title: `Effet "${topEffects[0].effect_id}" sur-représenté`,
      description: `Utilisé dans ${((topEffects[0].count / subset.length / 4) * 100).toFixed(0)}% des générations. Réduire son poids dans le pool de sélection.`,
      metric: 'effect_frequency', value: topEffects[0].count, threshold: Math.floor(subset.length * 0.4),
    });
  }

  // Fusion faible
  if (averages.fusion_score < 0.5) {
    recs.push({
      priority: 'low', type: 'pipeline',
      title: 'Score de fusion hybride faible',
      description: 'L\'EffectFusionEngine trouve peu d\'effets compatibles. Élargir les fenêtres de compatibilité inter-familles.',
      metric: 'avg_fusion', value: averages.fusion_score, threshold: 0.5,
    });
  }

  return recs.sort((a, b) =>
    ['high', 'medium', 'low'].indexOf(a.priority) - ['high', 'medium', 'low'].indexOf(b.priority)
  );
}

// ─── Génération du rapport ────────────────────────────────────────────────────

export function generateReport(periodDays: number = 30): AnalyticsReport {
  const now      = Date.now();
  const cutoff   = now - periodDays * 24 * 60 * 60 * 1000;
  const subset   = events.filter(e => e.timestamp >= cutoff);

  if (subset.length === 0) {
    return {
      generated_at: now, period_start: cutoff, period_end: now,
      total_generations: 0, success_rate: 0,
      top_effects: [], sector_stats: [],
      global_averages: { duration_ms: 0, diversity_score: 0, fusion_score: 0, engagement_score: 0, performance_score: 0 },
      profile_distribution: {}, recommendations: [],
    };
  }

  const successCount = subset.filter(e => e.status === 'success').length;
  const topEffects   = computeEffectStats(subset);
  const sectorStats  = computeSectorStats(subset);

  // Moyennes globales
  const avg = (key: keyof GenerationEvent['pipeline_scores']) =>
    subset.reduce((s, e) => s + (e.pipeline_scores[key] ?? 0), 0) / subset.length;

  const globalAverages: AnalyticsReport['global_averages'] = {
    duration_ms:      Math.round(subset.reduce((s, e) => s + e.duration_ms, 0) / subset.length),
    diversity_score:  avg('diversity'),
    fusion_score:     avg('fusion'),
    engagement_score: avg('engagement'),
    performance_score: avg('performance'),
  };

  // Distribution des profils de rendu
  const profileFreq = new Map<string, number>();
  subset.forEach(e => {
    Object.values(e.rendering_profiles).forEach(p => {
      profileFreq.set(p, (profileFreq.get(p) ?? 0) + 1);
    });
  });
  const totalProfiles = Array.from(profileFreq.values()).reduce((a, b) => a + b, 0);
  const profileDistribution: Record<string, number> = {};
  profileFreq.forEach((count, profile) => {
    profileDistribution[profile] = Math.round((count / totalProfiles) * 100);
  });

  const recommendations = generateRecommendations(subset, topEffects, globalAverages);

  return {
    generated_at:      now,
    period_start:      cutoff,
    period_end:        now,
    total_generations: subset.length,
    success_rate:      Math.round((successCount / subset.length) * 100),
    top_effects:       topEffects,
    sector_stats:      sectorStats,
    global_averages:   globalAverages,
    profile_distribution: profileDistribution,
    recommendations,
  };
}

// ─── Statistiques rapides (pour le dashboard) ─────────────────────────────────

export function getQuickStats(): {
  total:          number;
  last_24h:       number;
  avg_diversity:  number;
  top_sector:     string;
  last_event:     GenerationEvent | null;
} {
  const now    = Date.now();
  const day    = 24 * 60 * 60 * 1000;
  const last24 = events.filter(e => e.timestamp >= now - day);
  const avgDiv = events.length > 0
    ? events.reduce((s, e) => s + e.pipeline_scores.diversity, 0) / events.length
    : 0;

  // Top secteur
  const sectorCount = new Map<string, number>();
  events.forEach(e => sectorCount.set(e.secteur, (sectorCount.get(e.secteur) ?? 0) + 1));
  const topSector = Array.from(sectorCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a';

  return {
    total:         events.length,
    last_24h:      last24.length,
    avg_diversity: avgDiv,
    top_sector:    topSector,
    last_event:    events[events.length - 1] ?? null,
  };
}
