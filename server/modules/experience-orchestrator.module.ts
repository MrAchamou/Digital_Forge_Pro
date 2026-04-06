/**
 * 🎬 EXPERIENCE ORCHESTRATOR — Module 9, Priorité 3
 *
 * Mappe le voyage complet de la signature :
 *   INTRO → DÉVELOPPEMENT → CLIMAX → OUTRO
 *
 * - Crée des phases d'intensité progressives avec timing précis
 * - Ajoute des micro-récompenses visuelles à intervalles optimaux
 * - Synchronise les zones sur un arc émotionnel cohérent
 * - Maximise l'engagement en guidant l'œil sur un chemin narratif
 *
 * Architecture temporelle :
 *   Phase INTRO       (0–20%)  : entrée progressive, émergence du logo
 *   Phase DEVELOP     (20–55%) : développement des zones secondaires
 *   Phase CLIMAX      (55–80%) : pic d'intensité — CTA + logo au maximum
 *   Phase OUTRO       (80–100%): retour doux, invitation à l'action finale
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';
import type { OrchestratorResult } from './dynamic-fusion-orchestrator.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExperiencePhase = 'intro' | 'develop' | 'climax' | 'outro';

export interface PhaseConfig {
  name:            ExperiencePhase;
  start_pct:       number;   // % du cycle total (0-1)
  end_pct:         number;
  intensity_mult:  number;   // multiplicateur d'intensité pour cette phase
  easing:          'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring';
  zones_active:    string[]; // zones qui "s'allument" en priorité dans cette phase
}

export interface MicroReward {
  trigger_pct:  number;   // % du cycle où la micro-récompense se déclenche
  zone:         string;
  type:         'shimmer' | 'pulse' | 'flash' | 'bloom' | 'ripple';
  intensity:    number;
  duration_ms:  number;
}

export interface ExperienceArc {
  variation:       VariationKey;
  total_cycle_ms:  number;
  phases:          PhaseConfig[];
  micro_rewards:   MicroReward[];
  emotional_arc:   string;
  engagement_score: number;  // 0-1 — score d'engagement estimé
}

export interface ExperienceResult {
  composition:    ZoneComposition;
  arc:            ExperienceArc;
  phase_delays:   Record<string, number>;  // délais de démarrage en ms par zone
  phase_durations: Record<string, number>; // durées d'animation en ms par zone
  enhancements:   string[];
}

// ─── Configuration des phases par variation ───────────────────────────────────

const PHASE_CONFIGS: Record<VariationKey, PhaseConfig[]> = {
  // A : Calme & équilibré — introduction douce, climax mesuré
  A: [
    { name: 'intro',   start_pct: 0.00, end_pct: 0.20, intensity_mult: 0.6,  easing: 'ease-in',     zones_active: ['logo', 'fond']             },
    { name: 'develop', start_pct: 0.20, end_pct: 0.55, intensity_mult: 0.85, easing: 'ease-in-out', zones_active: ['nom', 'titre', 'separateur'] },
    { name: 'climax',  start_pct: 0.55, end_pct: 0.78, intensity_mult: 1.0,  easing: 'spring',      zones_active: ['logo', 'cta']               },
    { name: 'outro',   start_pct: 0.78, end_pct: 1.00, intensity_mult: 0.7,  easing: 'ease-out',    zones_active: ['cta', 'contact']            },
  ],
  // B : Précis & net — intro rapide, climax long et soutenu
  B: [
    { name: 'intro',   start_pct: 0.00, end_pct: 0.12, intensity_mult: 0.7,  easing: 'ease-in',     zones_active: ['logo']                      },
    { name: 'develop', start_pct: 0.12, end_pct: 0.45, intensity_mult: 0.90, easing: 'linear',      zones_active: ['nom', 'titre', 'contact']   },
    { name: 'climax',  start_pct: 0.45, end_pct: 0.82, intensity_mult: 1.0,  easing: 'ease-in-out', zones_active: ['logo', 'cta', 'separateur'] },
    { name: 'outro',   start_pct: 0.82, end_pct: 1.00, intensity_mult: 0.75, easing: 'ease-out',    zones_active: ['cta']                       },
  ],
  // C : Atmosphérique — intro très douce, développement long, climax poétique
  C: [
    { name: 'intro',   start_pct: 0.00, end_pct: 0.25, intensity_mult: 0.5,  easing: 'ease-in',     zones_active: ['fond', 'logo']              },
    { name: 'develop', start_pct: 0.25, end_pct: 0.60, intensity_mult: 0.80, easing: 'ease-in-out', zones_active: ['nom', 'separateur', 'titre'] },
    { name: 'climax',  start_pct: 0.60, end_pct: 0.80, intensity_mult: 0.95, easing: 'spring',      zones_active: ['logo', 'cta', 'fond']       },
    { name: 'outro',   start_pct: 0.80, end_pct: 1.00, intensity_mult: 0.65, easing: 'ease-out',    zones_active: ['contact', 'cta']            },
  ],
  // D : Explosif & dramatique — intro absente, développement court, climax massif
  D: [
    { name: 'intro',   start_pct: 0.00, end_pct: 0.08, intensity_mult: 0.9,  easing: 'spring',      zones_active: ['logo', 'cta']               },
    { name: 'develop', start_pct: 0.08, end_pct: 0.35, intensity_mult: 0.95, easing: 'ease-in',     zones_active: ['nom', 'titre', 'fond']      },
    { name: 'climax',  start_pct: 0.35, end_pct: 0.78, intensity_mult: 1.0,  easing: 'linear',      zones_active: ['logo', 'cta', 'nom', 'fond'] },
    { name: 'outro',   start_pct: 0.78, end_pct: 1.00, intensity_mult: 0.80, easing: 'ease-out',    zones_active: ['cta', 'separateur']         },
  ],
};

// ─── Micro-récompenses par variation ──────────────────────────────────────────

const MICRO_REWARDS_TEMPLATE: Record<VariationKey, Omit<MicroReward, 'duration_ms'>[]> = {
  A: [
    { trigger_pct: 0.18, zone: 'logo',  type: 'shimmer', intensity: 0.6 },
    { trigger_pct: 0.52, zone: 'cta',   type: 'bloom',   intensity: 0.7 },
    { trigger_pct: 0.77, zone: 'nom',   type: 'pulse',   intensity: 0.5 },
  ],
  B: [
    { trigger_pct: 0.10, zone: 'logo',  type: 'flash',   intensity: 0.8 },
    { trigger_pct: 0.44, zone: 'cta',   type: 'pulse',   intensity: 0.9 },
    { trigger_pct: 0.81, zone: 'logo',  type: 'ripple',  intensity: 0.6 },
  ],
  C: [
    { trigger_pct: 0.22, zone: 'fond',  type: 'bloom',   intensity: 0.5 },
    { trigger_pct: 0.58, zone: 'logo',  type: 'shimmer', intensity: 0.7 },
    { trigger_pct: 0.79, zone: 'cta',   type: 'pulse',   intensity: 0.8 },
  ],
  D: [
    { trigger_pct: 0.06, zone: 'logo',  type: 'flash',   intensity: 1.0 },
    { trigger_pct: 0.32, zone: 'fond',  type: 'ripple',  intensity: 0.8 },
    { trigger_pct: 0.70, zone: 'cta',   type: 'bloom',   intensity: 0.95},
    { trigger_pct: 0.90, zone: 'logo',  type: 'pulse',   intensity: 0.7 },
  ],
};

// ─── Arc émotionnel par variation ─────────────────────────────────────────────

const EMOTIONAL_ARCS: Record<VariationKey, string> = {
  A: 'Sérénité → Présence → Confiance → Invitation',
  B: 'Impact → Clarté → Conviction → Engagement',
  C: 'Rêverie → Exploration → Révélation → Contemplation',
  D: 'Choc visuel → Intensité → Apothéose → Mémorisation',
};

// ─── Calcul des délais par zone ───────────────────────────────────────────────

function computeZoneDelays(
  phases:       PhaseConfig[],
  cycleMs:      number,
  composition:  ZoneComposition
): { delays: Record<string, number>; durations: Record<string, number> } {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];
  const delays:    Record<string, number> = {};
  const durations: Record<string, number> = {};

  zones.forEach(zoneName => {
    const zone = (composition as any)[zoneName] as ZoneEffectDecision | undefined;
    if (!zone) return;

    // Trouver la première phase où la zone est active
    const activePhase = phases.find(p => p.zones_active.includes(zoneName))
      ?? phases.find(p => p.name === 'develop')
      ?? phases[1];

    // Délai = début de la phase active
    delays[zoneName] = Math.round(activePhase.start_pct * cycleMs);

    // Durée = couverture de la phase active + la suivante si disponible
    const nextPhaseIdx = phases.indexOf(activePhase) + 1;
    const nextPhase    = phases[nextPhaseIdx];
    const endPct       = nextPhase ? nextPhase.end_pct : 1.0;
    durations[zoneName] = Math.round((endPct - activePhase.start_pct) * cycleMs);
  });

  return { delays, durations };
}

// ─── Application de l'arc sur la composition ─────────────────────────────────

function applyExperienceArc(
  composition: ZoneComposition,
  arc:         ExperienceArc,
  delays:      Record<string, number>
): ZoneComposition {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const result = { ...composition };

  zones.forEach(zoneName => {
    const zone = composition[zoneName];
    if (!zone) return;

    // Trouver la phase qui gouverne cette zone
    const govPhase = arc.phases.find(p => p.zones_active.includes(zoneName))
      ?? arc.phases[1];

    // Appliquer le multiplicateur d'intensité de la phase
    const newIntensity = Math.min(1, Math.max(0.05, zone.intensity * govPhase.intensity_mult));

    // Annoter avec le delay d'expérience (info pour le renderer futur)
    const delayMs = delays[zoneName] ?? 0;

    (result as any)[zoneName] = {
      ...zone,
      intensity: newIntensity,
      raison: `${zone.raison ?? ''} | Expérience ${govPhase.name}(${(govPhase.intensity_mult * 100).toFixed(0)}%) delay=${delayMs}ms ${govPhase.easing}`,
    };
  });

  return result;
}

// ─── Score d'engagement ───────────────────────────────────────────────────────

function computeEngagementScore(
  arc:          ExperienceArc,
  composition:  ZoneComposition
): number {
  // Critères d'engagement :
  // 1. Durée du climax (plus long = plus d'impact)
  const climaxPhase   = arc.phases.find(p => p.name === 'climax');
  const climaxDuration = climaxPhase ? (climaxPhase.end_pct - climaxPhase.start_pct) : 0.2;
  const climaxScore   = Math.min(1, climaxDuration / 0.35);

  // 2. Nombre de micro-récompenses
  const rewardScore = Math.min(1, arc.micro_rewards.length / 4);

  // 3. Intensité du CTA au climax
  const ctaIntensity = (composition.cta?.intensity ?? 0.5);
  const ctaScore     = Math.min(1, ctaIntensity / 0.8);

  // 4. Différentiel intro/climax (contraste = engagement)
  const introPhase  = arc.phases.find(p => p.name === 'intro');
  const contrastScore = introPhase ? Math.min(1, (climaxPhase?.intensity_mult ?? 1) - introPhase.intensity_mult) : 0.3;

  return (climaxScore * 0.3) + (rewardScore * 0.25) + (ctaScore * 0.25) + (contrastScore * 0.2);
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function orchestrateExperience(
  orchestratorResult: OrchestratorResult,
  variation:          VariationKey,
  cycleMs:            number = 8000
): ExperienceResult {
  const { composition } = orchestratorResult;
  const phases          = PHASE_CONFIGS[variation];

  // Construire les micro-récompenses avec durée calculée selon le cycle
  const micro_rewards: MicroReward[] = MICRO_REWARDS_TEMPLATE[variation].map(r => ({
    ...r,
    duration_ms: Math.round(cycleMs * 0.04 + 200),  // ~4% du cycle + base 200ms
  }));

  // Arc émotionnel
  const arc: ExperienceArc = {
    variation,
    total_cycle_ms:   cycleMs,
    phases,
    micro_rewards,
    emotional_arc:    EMOTIONAL_ARCS[variation],
    engagement_score: 0,  // calculé après
  };

  // Délais et durées par zone
  const { delays, durations } = computeZoneDelays(phases, cycleMs, composition);

  // Score d'engagement
  arc.engagement_score = computeEngagementScore(arc, composition);

  // Appliquer l'arc sur la composition
  const experienceComposition = applyExperienceArc(composition, arc, delays);

  // Phase climax pour le log
  const climaxPhase = phases.find(p => p.name === 'climax');
  const introPhase  = phases.find(p => p.name === 'intro');

  const enhancements = [
    `Arc émotionnel: ${arc.emotional_arc}`,
    `Cycle: ${cycleMs}ms | Climax: ${climaxPhase ? ((climaxPhase.end_pct - climaxPhase.start_pct) * 100).toFixed(0) : 0}% du cycle`,
    `${micro_rewards.length} micro-récompenses visuelles programmées`,
    `Contraste intro/climax: ${introPhase ? (climaxPhase?.intensity_mult ?? 1 - introPhase.intensity_mult).toFixed(2) : 'n/a'}`,
    `Score d'engagement: ${(arc.engagement_score * 100).toFixed(1)}%`,
    `Délais orchestrés: logo=${delays.logo ?? 0}ms | cta=${delays.cta ?? 0}ms | nom=${delays.nom ?? 0}ms`,
  ];

  return {
    composition:     experienceComposition,
    arc,
    phase_delays:    delays,
    phase_durations: durations,
    enhancements,
  };
}
