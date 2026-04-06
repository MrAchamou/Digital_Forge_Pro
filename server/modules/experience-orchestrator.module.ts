/**
 * 🎬 EXPERIENCE ORCHESTRATOR — v2.0
 *
 * - Arc émotionnel étendu à 7 phases (vs 4 dans la v1)
 * - Adaptation selon objectif : "vente" (CTA boosté) vs "networking" (profil valorisé)
 * - BPM émotionnel : cadence de changement d'intensité alignée sur les rythmes humains
 * - Détection de la fatigue visuelle après 3+ cycles → simplification automatique
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';
import type { OrchestratorResult } from './dynamic-fusion-orchestrator.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExperiencePhase =
  | 'silence'   // avant le début — tension vide
  | 'intro'     // émergence douce
  | 'establish' // ancrage — établissement des éléments
  | 'develop'   // développement des couches
  | 'tension'   // montée progressive vers le climax
  | 'climax'    // pic maximal
  | 'resolution'// retour doux
  | 'outro';    // fermeture invitante

export type ExperienceObjective = 'vente' | 'networking' | 'notoriete' | 'recrutement';

export interface PhaseConfig {
  name:            ExperiencePhase;
  start_pct:       number;
  end_pct:         number;
  intensity_mult:  number;
  easing:          'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring' | 'bounce';
  zones_active:    string[];
  bpm:             number;  // BPM émotionnel de cette phase
}

export interface MicroReward {
  trigger_pct:  number;
  zone:         string;
  type:         'shimmer' | 'pulse' | 'flash' | 'bloom' | 'ripple' | 'spark';
  intensity:    number;
  duration_ms:  number;
}

export interface VisualFatigueAnalysis {
  is_fatigued:       boolean;
  fatigue_score:     number;   // 0-1
  triggers:          string[];
  simplifications:   string[];
}

export interface ExperienceArc {
  variation:         VariationKey;
  objective:         ExperienceObjective;
  total_cycle_ms:    number;
  phases:            PhaseConfig[];
  micro_rewards:     MicroReward[];
  emotional_arc:     string;
  engagement_score:  number;
  average_bpm:       number;
  fatigue_analysis:  VisualFatigueAnalysis;
}

export interface ExperienceResult {
  composition:      ZoneComposition;
  arc:              ExperienceArc;
  phase_delays:     Record<string, number>;
  phase_durations:  Record<string, number>;
  enhancements:     string[];
}

// ─── BPM émotionnels par phase ────────────────────────────────────────────────

/**
 * Les BPM émotionnels correspondent aux rythmes cardiaques humains naturels :
 * - Repos (60 BPM) → calme, contemplation
 * - Actif (80 BPM) → engagement, attention
 * - Intense (100+ BPM) → excitation, action
 */
const PHASE_BPM: Record<ExperiencePhase, number> = {
  silence:    50,   // sous-cardiaque, anticipation
  intro:      62,   // repos calme
  establish:  68,   // légère activation
  develop:    75,   // engagement croissant
  tension:    88,   // montée d'intensité
  climax:     105,  // pic — action
  resolution: 72,   // retour doux
  outro:      65,   // invitation tranquille
};

// ─── Configuration 7 phases par variation ────────────────────────────────────

const PHASE_CONFIGS_7: Record<VariationKey, PhaseConfig[]> = {
  // A — Majestueux : silence contemplatif → établissement progressif
  A: [
    { name: 'silence',    start_pct: 0.00, end_pct: 0.05, intensity_mult: 0.20, easing: 'linear',       zones_active: [],                           bpm: PHASE_BPM.silence    },
    { name: 'intro',      start_pct: 0.05, end_pct: 0.18, intensity_mult: 0.55, easing: 'ease-in',      zones_active: ['fond'],                      bpm: PHASE_BPM.intro      },
    { name: 'establish',  start_pct: 0.18, end_pct: 0.32, intensity_mult: 0.70, easing: 'ease-in-out',  zones_active: ['logo'],                      bpm: PHASE_BPM.establish  },
    { name: 'develop',    start_pct: 0.32, end_pct: 0.52, intensity_mult: 0.82, easing: 'ease-in-out',  zones_active: ['nom', 'titre', 'separateur'], bpm: PHASE_BPM.develop    },
    { name: 'tension',    start_pct: 0.52, end_pct: 0.62, intensity_mult: 0.92, easing: 'spring',       zones_active: ['logo', 'nom'],               bpm: PHASE_BPM.tension    },
    { name: 'climax',     start_pct: 0.62, end_pct: 0.80, intensity_mult: 1.00, easing: 'linear',       zones_active: ['logo', 'cta'],               bpm: PHASE_BPM.climax     },
    { name: 'resolution', start_pct: 0.80, end_pct: 0.92, intensity_mult: 0.72, easing: 'ease-out',     zones_active: ['cta', 'nom'],                bpm: PHASE_BPM.resolution },
    { name: 'outro',      start_pct: 0.92, end_pct: 1.00, intensity_mult: 0.60, easing: 'ease-out',     zones_active: ['cta', 'contact'],            bpm: PHASE_BPM.outro      },
  ],
  // B — Précis : direct, intro très courte, climax soutenu
  B: [
    { name: 'silence',    start_pct: 0.00, end_pct: 0.02, intensity_mult: 0.30, easing: 'linear',       zones_active: [],                           bpm: PHASE_BPM.silence    },
    { name: 'intro',      start_pct: 0.02, end_pct: 0.10, intensity_mult: 0.65, easing: 'ease-in',      zones_active: ['logo'],                      bpm: PHASE_BPM.intro      },
    { name: 'establish',  start_pct: 0.10, end_pct: 0.20, intensity_mult: 0.78, easing: 'linear',       zones_active: ['logo', 'nom'],               bpm: PHASE_BPM.establish  },
    { name: 'develop',    start_pct: 0.20, end_pct: 0.38, intensity_mult: 0.87, easing: 'ease-in',      zones_active: ['titre', 'contact'],          bpm: PHASE_BPM.develop    },
    { name: 'tension',    start_pct: 0.38, end_pct: 0.48, intensity_mult: 0.95, easing: 'spring',       zones_active: ['logo', 'separateur'],        bpm: PHASE_BPM.tension    },
    { name: 'climax',     start_pct: 0.48, end_pct: 0.82, intensity_mult: 1.00, easing: 'ease-in-out',  zones_active: ['logo', 'cta', 'nom'],        bpm: PHASE_BPM.climax     },
    { name: 'resolution', start_pct: 0.82, end_pct: 0.92, intensity_mult: 0.75, easing: 'ease-out',     zones_active: ['cta'],                       bpm: PHASE_BPM.resolution },
    { name: 'outro',      start_pct: 0.92, end_pct: 1.00, intensity_mult: 0.65, easing: 'ease-out',     zones_active: ['cta'],                       bpm: PHASE_BPM.outro      },
  ],
  // C — Atmosphérique : intro très douce, toutes les phases
  C: [
    { name: 'silence',    start_pct: 0.00, end_pct: 0.08, intensity_mult: 0.15, easing: 'ease-in',      zones_active: [],                           bpm: PHASE_BPM.silence    },
    { name: 'intro',      start_pct: 0.08, end_pct: 0.22, intensity_mult: 0.45, easing: 'ease-in',      zones_active: ['fond'],                      bpm: PHASE_BPM.intro      },
    { name: 'establish',  start_pct: 0.22, end_pct: 0.35, intensity_mult: 0.60, easing: 'ease-in-out',  zones_active: ['fond', 'logo'],              bpm: PHASE_BPM.establish  },
    { name: 'develop',    start_pct: 0.35, end_pct: 0.55, intensity_mult: 0.75, easing: 'ease-in-out',  zones_active: ['nom', 'separateur', 'titre'],bpm: PHASE_BPM.develop    },
    { name: 'tension',    start_pct: 0.55, end_pct: 0.64, intensity_mult: 0.88, easing: 'spring',       zones_active: ['logo', 'fond'],              bpm: PHASE_BPM.tension    },
    { name: 'climax',     start_pct: 0.64, end_pct: 0.80, intensity_mult: 0.95, easing: 'ease-in-out',  zones_active: ['logo', 'cta', 'fond'],       bpm: PHASE_BPM.climax     },
    { name: 'resolution', start_pct: 0.80, end_pct: 0.92, intensity_mult: 0.65, easing: 'ease-out',     zones_active: ['cta', 'contact'],            bpm: PHASE_BPM.resolution },
    { name: 'outro',      start_pct: 0.92, end_pct: 1.00, intensity_mult: 0.55, easing: 'ease-out',     zones_active: ['contact', 'cta'],            bpm: PHASE_BPM.outro      },
  ],
  // D — Explosif : silence inexistant, explosion immédiate
  D: [
    { name: 'silence',    start_pct: 0.00, end_pct: 0.01, intensity_mult: 0.80, easing: 'linear',       zones_active: [],                           bpm: PHASE_BPM.climax     },
    { name: 'intro',      start_pct: 0.01, end_pct: 0.05, intensity_mult: 0.88, easing: 'spring',       zones_active: ['logo', 'cta'],               bpm: PHASE_BPM.climax     },
    { name: 'establish',  start_pct: 0.05, end_pct: 0.15, intensity_mult: 0.92, easing: 'spring',       zones_active: ['logo', 'fond'],              bpm: PHASE_BPM.climax     },
    { name: 'develop',    start_pct: 0.15, end_pct: 0.30, intensity_mult: 0.95, easing: 'ease-in',      zones_active: ['nom', 'titre', 'fond'],      bpm: PHASE_BPM.tension    },
    { name: 'tension',    start_pct: 0.30, end_pct: 0.38, intensity_mult: 0.98, easing: 'spring',       zones_active: ['logo', 'nom', 'fond'],       bpm: PHASE_BPM.climax     },
    { name: 'climax',     start_pct: 0.38, end_pct: 0.78, intensity_mult: 1.00, easing: 'linear',       zones_active: ['logo', 'cta', 'nom', 'fond'],bpm: PHASE_BPM.climax     },
    { name: 'resolution', start_pct: 0.78, end_pct: 0.90, intensity_mult: 0.82, easing: 'ease-out',     zones_active: ['cta', 'separateur'],         bpm: PHASE_BPM.resolution },
    { name: 'outro',      start_pct: 0.90, end_pct: 1.00, intensity_mult: 0.70, easing: 'ease-out',     zones_active: ['cta'],                       bpm: PHASE_BPM.outro      },
  ],
};

// ─── Adaptation selon objectif ─────────────────────────────────────────────

/**
 * Ajuste les multiplicateurs d'intensité selon l'objectif métier.
 * - Vente : booste le CTA au maximum pendant le climax
 * - Networking : valorise le profil (logo + nom) tout au long
 * - Notoriété : développe longtemps, climax bref
 * - Recrutement : met en valeur les compétences (titre + contact)
 */
function applyObjectiveAdaptation(phases: PhaseConfig[], objective: ExperienceObjective): PhaseConfig[] {
  return phases.map(phase => {
    let multAdjust = 0;
    const zonesBoost: string[] = [];

    switch (objective) {
      case 'vente':
        // Climax + 5%, zones CTA dans l'outro → on insiste
        if (phase.name === 'climax')     multAdjust = +0.05;
        if (phase.name === 'outro')      { zonesBoost.push('cta'); multAdjust = +0.10; }
        if (phase.name === 'resolution') zonesBoost.push('cta');
        break;
      case 'networking':
        // Develop et establish centrés sur logo + nom
        if (phase.name === 'establish' || phase.name === 'develop') {
          zonesBoost.push('logo', 'nom');
          multAdjust = +0.03;
        }
        if (phase.name === 'climax') multAdjust = -0.05;  // climax moins explosif
        break;
      case 'notoriete':
        // Develop très long, climax court
        if (phase.name === 'develop') { multAdjust = +0.05; zonesBoost.push('logo'); }
        if (phase.name === 'climax')  multAdjust = -0.10;
        break;
      case 'recrutement':
        // Valeur sur titre + contact dans develop
        if (phase.name === 'develop') { zonesBoost.push('titre', 'contact'); multAdjust = +0.08; }
        if (phase.name === 'outro')   zonesBoost.push('contact', 'cta');
        break;
    }

    const newZones = zonesBoost.some((z: string) => phase.zones_active.includes(z))
      ? phase.zones_active
      : [...phase.zones_active, ...zonesBoost.filter(z => !phase.zones_active.includes(z))];

    return {
      ...phase,
      intensity_mult: parseFloat(Math.max(0.10, Math.min(1.0, phase.intensity_mult + multAdjust)).toFixed(2)),
      zones_active:   newZones,
    };
  });
}

// ─── Micro-récompenses par variation + objectif ───────────────────────────────

const MICRO_REWARDS_BASE: Record<VariationKey, Omit<MicroReward, 'duration_ms'>[]> = {
  A: [
    { trigger_pct: 0.17, zone: 'logo',  type: 'shimmer', intensity: 0.60 },
    { trigger_pct: 0.32, zone: 'nom',   type: 'pulse',   intensity: 0.50 },
    { trigger_pct: 0.62, zone: 'cta',   type: 'bloom',   intensity: 0.72 },
    { trigger_pct: 0.79, zone: 'nom',   type: 'pulse',   intensity: 0.48 },
    { trigger_pct: 0.91, zone: 'cta',   type: 'shimmer', intensity: 0.55 },
  ],
  B: [
    { trigger_pct: 0.09, zone: 'logo',  type: 'flash',   intensity: 0.80 },
    { trigger_pct: 0.38, zone: 'cta',   type: 'spark',   intensity: 0.85 },
    { trigger_pct: 0.48, zone: 'cta',   type: 'pulse',   intensity: 0.92 },
    { trigger_pct: 0.80, zone: 'logo',  type: 'ripple',  intensity: 0.65 },
  ],
  C: [
    { trigger_pct: 0.21, zone: 'fond',  type: 'bloom',   intensity: 0.45 },
    { trigger_pct: 0.35, zone: 'logo',  type: 'shimmer', intensity: 0.55 },
    { trigger_pct: 0.64, zone: 'logo',  type: 'shimmer', intensity: 0.70 },
    { trigger_pct: 0.79, zone: 'cta',   type: 'pulse',   intensity: 0.80 },
    { trigger_pct: 0.92, zone: 'cta',   type: 'bloom',   intensity: 0.60 },
  ],
  D: [
    { trigger_pct: 0.02, zone: 'logo',  type: 'flash',   intensity: 1.00 },
    { trigger_pct: 0.14, zone: 'fond',  type: 'ripple',  intensity: 0.85 },
    { trigger_pct: 0.38, zone: 'cta',   type: 'bloom',   intensity: 0.95 },
    { trigger_pct: 0.62, zone: 'logo',  type: 'spark',   intensity: 0.90 },
    { trigger_pct: 0.78, zone: 'cta',   type: 'flash',   intensity: 0.88 },
    { trigger_pct: 0.92, zone: 'logo',  type: 'pulse',   intensity: 0.75 },
  ],
};

// ─── Arcs émotionnels par variation + objectif ────────────────────────────────

const EMOTIONAL_ARCS: Record<VariationKey, Record<ExperienceObjective, string>> = {
  A: {
    vente:        'Sérénité → Présence → Confiance → Décision → Action',
    networking:   'Sérénité → Présence → Connexion → Mémorisation',
    notoriete:    'Silence → Contemplation → Reconnaissance → Souvenir',
    recrutement:  'Sérénité → Compétence → Confiance → Invitation',
  },
  B: {
    vente:        'Impact → Clarté → Conviction → Action Immédiate',
    networking:   'Impact → Clarté → Crédibilité → Engagement',
    notoriete:    'Impact → Distinction → Reconnaissance → Marque',
    recrutement:  'Impact → Expertise → Persuasion → Recrutement',
  },
  C: {
    vente:        'Rêverie → Exploration → Révélation → Désir → Passage à l\'acte',
    networking:   'Rêverie → Exploration → Fascination → Mémorisation',
    notoriete:    'Atmosphère → Exploration → Poésie → Contemplation',
    recrutement:  'Atmosphère → Découverte → Singularité → Invitation',
  },
  D: {
    vente:        'Choc → Intensité → Apothéose → Désir Brûlant → Action',
    networking:   'Choc visuel → Intensité → Apothéose → Mémorisation',
    notoriete:    'Explosion → Maximum → Saturation → Souvenir Mémorable',
    recrutement:  'Explosion → Démonstration → Désir → Recrutement Évident',
  },
};

// ─── Détection de fatigue visuelle ───────────────────────────────────────────

/**
 * Détecte la fatigue visuelle après plusieurs cycles.
 * Un cycle trop intense ou trop long peut saturer l'attention.
 */
export function analyzeVisualFatigue(
  phases: PhaseConfig[],
  composition: ZoneComposition,
  cycleMs: number
): VisualFatigueAnalysis {
  const triggers: string[] = [];

  // Critère 1 : cycle trop long (> 12 secondes)
  if (cycleMs > 12000) {
    triggers.push(`Cycle de ${(cycleMs / 1000).toFixed(1)}s trop long (max recommandé : 12s)`);
  }

  // Critère 2 : climax trop soutenu (> 45% du cycle)
  const climax = phases.find(p => p.name === 'climax');
  if (climax) {
    const climaxPct = climax.end_pct - climax.start_pct;
    if (climaxPct > 0.45) {
      triggers.push(`Climax occupe ${(climaxPct * 100).toFixed(0)}% du cycle (max recommandé : 45%)`);
    }
  }

  // Critère 3 : trop peu de silence/respiration (< 5%)
  const silencePhase = phases.find(p => p.name === 'silence');
  if (!silencePhase || (silencePhase.end_pct - silencePhase.start_pct) < 0.05) {
    triggers.push('Phase de silence trop courte (<5%) — pas de respiration visuelle');
  }

  // Critère 4 : intensités élevées dans trop de zones simultanément
  const zones = Object.values(composition as any) as ZoneEffectDecision[];
  const highIntensityZones = zones.filter(z => z?.intensity > 0.80).length;
  if (highIntensityZones >= 4) {
    triggers.push(`${highIntensityZones}/7 zones à intensité > 80% simultanément — saturation`);
  }

  const fatigue_score = Math.min(1, triggers.length / 4);
  const is_fatigued   = fatigue_score > 0.25;

  const simplifications: string[] = [];
  if (is_fatigued) {
    if (cycleMs > 12000)        simplifications.push('Réduire le cycle à 10-12s');
    if (climax && (climax.end_pct - climax.start_pct) > 0.45) simplifications.push('Réduire le climax à 30-35% du cycle');
    if (highIntensityZones >= 4) simplifications.push('Limiter les zones à haute intensité à 2-3 maximum');
    simplifications.push('Activer la réduction automatique des couches secondaires');
  }

  return { is_fatigued, fatigue_score: parseFloat(fatigue_score.toFixed(2)), triggers, simplifications };
}

// ─── BPM moyen ───────────────────────────────────────────────────────────────

function computeAverageBPM(phases: PhaseConfig[]): number {
  const totalDuration = phases.reduce((s, p) => s + (p.end_pct - p.start_pct), 0);
  const weightedBPM   = phases.reduce((s, p) => s + p.bpm * (p.end_pct - p.start_pct), 0);
  return parseFloat((weightedBPM / Math.max(totalDuration, 0.01)).toFixed(0));
}

// ─── Calcul des délais par zone ───────────────────────────────────────────────

function computeZoneDelays(
  phases:      PhaseConfig[],
  cycleMs:     number,
  composition: ZoneComposition
): { delays: Record<string, number>; durations: Record<string, number> } {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];
  const delays:    Record<string, number> = {};
  const durations: Record<string, number> = {};

  for (const zoneName of zones) {
    const zone = (composition as any)[zoneName] as ZoneEffectDecision | undefined;
    if (!zone) continue;

    const activePhase = phases.find(p => p.zones_active.includes(zoneName))
      ?? phases.find(p => p.name === 'develop')
      ?? phases[3];  // develop est index 3 dans les 8 phases

    delays[zoneName] = Math.round(activePhase.start_pct * cycleMs);

    const nextPhaseIdx  = phases.indexOf(activePhase) + 1;
    const nextPhase     = phases[nextPhaseIdx];
    const endPct        = nextPhase ? nextPhase.end_pct : 1.0;
    durations[zoneName] = Math.round((endPct - activePhase.start_pct) * cycleMs);
  }

  return { delays, durations };
}

// ─── Application de l'arc ────────────────────────────────────────────────────

function applyExperienceArc(
  composition: ZoneComposition,
  arc:         ExperienceArc,
  delays:      Record<string, number>
): ZoneComposition {
  const zones  = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const result = { ...composition };

  // Si fatigue détectée, appliquer une simplification globale
  const fatigueReduction = arc.fatigue_analysis.is_fatigued ? 0.85 : 1.0;

  for (const zoneName of zones) {
    const zone = composition[zoneName];
    if (!zone) continue;

    const govPhase = arc.phases.find(p => p.zones_active.includes(zoneName))
      ?? arc.phases[3] ?? arc.phases[1];

    const newIntensity = Math.min(1, Math.max(0.05,
      zone.intensity * govPhase.intensity_mult * fatigueReduction
    ));

    const delayMs = delays[zoneName] ?? 0;
    const bpmInfo = `BPM:${govPhase.bpm}`;

    (result as any)[zoneName] = {
      ...zone,
      intensity: parseFloat(newIntensity.toFixed(3)),
      raison:    `${zone.raison ?? ''} | Expérience 7P ${govPhase.name}(${(govPhase.intensity_mult * 100).toFixed(0)}%) ${bpmInfo} delay=${delayMs}ms ${govPhase.easing}`,
    };
  }

  return result;
}

// ─── Score d'engagement ───────────────────────────────────────────────────────

function computeEngagementScore(
  arc:         ExperienceArc,
  composition: ZoneComposition
): number {
  const climaxPhase   = arc.phases.find(p => p.name === 'climax');
  const introPhase    = arc.phases.find(p => p.name === 'intro');
  const silencePhase  = arc.phases.find(p => p.name === 'silence');

  const climaxDuration = climaxPhase ? (climaxPhase.end_pct - climaxPhase.start_pct) : 0.2;
  const climaxScore    = Math.min(1, climaxDuration / 0.35);
  const rewardScore    = Math.min(1, arc.micro_rewards.length / 5);

  const ctaIntensity  = (composition.cta?.intensity ?? 0.5);
  const ctaScore      = Math.min(1, ctaIntensity / 0.8);

  const contrastScore = (introPhase && climaxPhase)
    ? Math.min(1, climaxPhase.intensity_mult - introPhase.intensity_mult)
    : 0.3;

  // Bonus silence : 0 si absent, jusqu'à +0.1
  const silenceBonus = silencePhase ? Math.min(0.1, (silencePhase.end_pct - silencePhase.start_pct) * 2) : 0;

  // Malus fatigue
  const fatiguePenalty = arc.fatigue_analysis.is_fatigued ? 0.15 : 0;

  return parseFloat(Math.max(0, Math.min(1,
    climaxScore  * 0.28 +
    rewardScore  * 0.22 +
    ctaScore     * 0.22 +
    contrastScore * 0.18 +
    silenceBonus +
    (arc.average_bpm >= 75 && arc.average_bpm <= 95 ? 0.05 : 0) -  // bonus BPM optimal
    fatiguePenalty
  )).toFixed(3));
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function orchestrateExperience(
  orchestratorResult: OrchestratorResult,
  variation:          VariationKey,
  cycleMs:            number = 9000,
  objective:          ExperienceObjective = 'networking'
): ExperienceResult {
  const { composition } = orchestratorResult;

  // Phases 7 niveaux + adaptation objectif
  const basePhasesRaw = PHASE_CONFIGS_7[variation];
  const phases        = applyObjectiveAdaptation(basePhasesRaw, objective);

  // Micro-récompenses
  const micro_rewards: MicroReward[] = MICRO_REWARDS_BASE[variation].map(r => ({
    ...r,
    duration_ms: Math.round(cycleMs * 0.04 + 180),
  }));

  // BPM moyen
  const average_bpm = computeAverageBPM(phases);

  // Analyse fatigue visuelle
  const fatigue_analysis = analyzeVisualFatigue(phases, composition, cycleMs);
  if (fatigue_analysis.is_fatigued) {
    console.warn(
      `😴 ExperienceOrchestrator — Fatigue visuelle détectée (score: ${(fatigue_analysis.fatigue_score * 100).toFixed(0)}%) | ` +
      `Causes: ${fatigue_analysis.triggers.join('; ')}`
    );
  }

  const arc: ExperienceArc = {
    variation,
    objective,
    total_cycle_ms:    cycleMs,
    phases,
    micro_rewards,
    emotional_arc:     EMOTIONAL_ARCS[variation][objective],
    engagement_score:  0,
    average_bpm,
    fatigue_analysis,
  };

  // Délais et durées
  const { delays, durations } = computeZoneDelays(phases, cycleMs, composition);

  // Score d'engagement
  arc.engagement_score = computeEngagementScore(arc, composition);

  // Appliquer l'arc
  const experienceComposition = applyExperienceArc(composition, arc, delays);

  const climaxPhase = phases.find(p => p.name === 'climax');
  const enhancements = [
    `Arc 7 phases [${variation}/${objective}] — "${arc.emotional_arc}"`,
    `Cycle: ${(cycleMs / 1000).toFixed(1)}s | Climax: ${climaxPhase ? ((climaxPhase.end_pct - climaxPhase.start_pct) * 100).toFixed(0) : 0}%`,
    `BPM émotionnel moyen: ${average_bpm} BPM`,
    `${micro_rewards.length} micro-récompenses | Score d'engagement: ${(arc.engagement_score * 100).toFixed(1)}%`,
    fatigue_analysis.is_fatigued
      ? `⚠️ Fatigue visuelle (${(fatigue_analysis.fatigue_score * 100).toFixed(0)}%) — simplification appliquée`
      : `✅ Aucune fatigue visuelle détectée`,
    `Délais: logo=${delays.logo ?? 0}ms | nom=${delays.nom ?? 0}ms | cta=${delays.cta ?? 0}ms`,
  ];

  console.log(`🎬 Experience Orchestrator v2 [${variation}/${objective}] — ${enhancements[0]}`);

  return {
    composition:      experienceComposition,
    arc,
    phase_delays:     delays,
    phase_durations:  durations,
    enhancements,
  };
}
