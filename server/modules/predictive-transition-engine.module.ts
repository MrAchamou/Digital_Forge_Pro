/**
 * 🔮 PREDICTIVE TRANSITION ENGINE — Module 13, Priorité 5
 *
 * Prédit et prépare les transitions avant même qu'elles se déclenchent.
 * - Fonctions d'easing procédurales : Fibonacci, Golden Ratio, Organic, Neural
 * - Pipeline d'animation multi-couche avec synchronisation parfaite
 * - Pré-calcule les keyframes critiques de transition inter-phases
 * - Synchronise les zones sur un métronome animatoire global
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EasingType = 'fibonacci' | 'golden' | 'organic' | 'neural' | 'linear';

export interface EasingCurve {
  type:        EasingType;
  control_pts: [number, number][];   // points de contrôle cubique Bézier [t, v]
  css_value:   string;               // valeur CSS cubic-bezier()
  description: string;
}

export interface TransitionBlueprint {
  zone:            string;
  easing:          EasingCurve;
  entry_delay_ms:  number;       // délai avant entrée en scène
  exit_delay_ms:   number;       // délai avant sortie
  overlap_pct:     number;       // 0-1 — chevauchement avec zone suivante
  sync_group:      string;       // groupe de synchronisation (zones qui se synchronisent)
  keyframes:       TransitionKeyframe[];
}

export interface TransitionKeyframe {
  t_pct:      number;      // % du cycle (0-1)
  intensity:  number;      // intensité cible à ce moment
  easing_hint: string;     // hint CSS pour le rendu
}

export interface TransitionPipelineResult {
  composition:   ZoneComposition;
  blueprints:    Record<string, TransitionBlueprint>;
  sync_groups:   Record<string, string[]>;  // groupe → zones
  global_bpm:    number;               // métronome global en BPM
  transition_score: number;            // 0-1
}

// ─── Courbes d'easing procédurales ───────────────────────────────────────────

const PHI = 1.6180339887;
const FIB  = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

function fibonacciEasing(): EasingCurve {
  // Basé sur les ratios de Fibonacci → accélération naturelle organique
  const ratio1 = FIB[3] / FIB[5];   // 3/8  = 0.375
  const ratio2 = FIB[4] / FIB[6];   // 5/13 = 0.385
  return {
    type:        'fibonacci',
    control_pts: [[ratio1, 0.05], [ratio2, 0.95]],
    css_value:   `cubic-bezier(${ratio1.toFixed(3)}, 0.05, ${ratio2.toFixed(3)}, 0.95)`,
    description: 'Fibonacci organique — accélération naturelle basée sur 3/8 et 5/13',
  };
}

function goldenEasing(): EasingCurve {
  // Basé sur le nombre d'or φ → point d'inflexion à 61.8%
  const p1 = 1 / PHI / PHI;     // ≈ 0.382
  const p2 = 1 / PHI;           // ≈ 0.618
  return {
    type:        'golden',
    control_pts: [[p1, 0.0], [p2, 1.0]],
    css_value:   `cubic-bezier(${p1.toFixed(3)}, 0.0, ${p2.toFixed(3)}, 1.0)`,
    description: 'Nombre d\'or — point d\'inflexion à φ⁻¹ ≈ 61.8% du cycle',
  };
}

function organicEasing(): EasingCurve {
  // Simulé la physique organique : démarrage lent, pic au 2/3, retour doux
  return {
    type:        'organic',
    control_pts: [[0.25, 0.1], [0.25, 1.0]],
    css_value:   'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    description: 'Organique — démarrage doux, pic naturel au 2/3 du mouvement',
  };
}

function neuralEasing(): EasingCurve {
  // Simulé un pattern neuronal : impulsion rapide → plateau → retour progressif
  return {
    type:        'neural',
    control_pts: [[0.68, -0.55], [0.265, 1.55]],
    css_value:   'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    description: 'Neural — impulsion rapide avec légère surcompensation (spring feel)',
  };
}

function linearEasing(): EasingCurve {
  return {
    type:        'linear',
    control_pts: [[0, 0], [1, 1]],
    css_value:   'linear',
    description: 'Linéaire — progression constante',
  };
}

const EASING_FUNCTIONS: Record<EasingType, () => EasingCurve> = {
  fibonacci: fibonacciEasing,
  golden:    goldenEasing,
  organic:   organicEasing,
  neural:    neuralEasing,
  linear:    linearEasing,
};

// ─── Attribution des easings par zone et variation ───────────────────────────

const ZONE_EASING_MAP: Record<VariationKey, Record<string, EasingType>> = {
  A: { logo: 'golden',    nom: 'fibonacci', titre: 'organic',  contact: 'linear',   separateur: 'organic',   fond: 'linear',    cta: 'golden'    },
  B: { logo: 'neural',    nom: 'golden',    titre: 'fibonacci', contact: 'organic',  separateur: 'fibonacci', fond: 'linear',    cta: 'neural'    },
  C: { logo: 'fibonacci', nom: 'organic',   titre: 'golden',   contact: 'linear',   separateur: 'golden',    fond: 'fibonacci', cta: 'fibonacci' },
  D: { logo: 'neural',    nom: 'neural',    titre: 'golden',   contact: 'fibonacci', separateur: 'neural',   fond: 'golden',    cta: 'neural'    },
};

// ─── Groupes de synchronisation ──────────────────────────────────────────────

const SYNC_GROUPS: Record<VariationKey, Record<string, string>> = {
  A: { logo: 'impact', nom: 'identity', titre: 'identity', contact: 'info', separateur: 'structure', fond: 'ambient', cta: 'impact' },
  B: { logo: 'impact', nom: 'impact',   titre: 'identity', contact: 'info', separateur: 'identity',  fond: 'ambient', cta: 'impact' },
  C: { logo: 'impact', nom: 'identity', titre: 'ambient',  contact: 'info', separateur: 'ambient',   fond: 'ambient', cta: 'impact' },
  D: { logo: 'impact', nom: 'impact',   titre: 'impact',   contact: 'identity', separateur: 'impact', fond: 'impact', cta: 'impact' },
};

// ─── BPM global selon la variation ───────────────────────────────────────────

const GLOBAL_BPM: Record<VariationKey, number> = {
  A: 60,   // calme, 1 pulsation/seconde
  B: 72,   // précis, légèrement plus rapide
  C: 50,   // atmosphérique, très lent
  D: 90,   // explosif, proche du rythme cardiaque fort
};

// ─── Calcul des keyframes de transition ──────────────────────────────────────

function buildKeyframes(
  zone:      ZoneEffectDecision,
  easing:    EasingCurve,
  variation: VariationKey
): TransitionKeyframe[] {
  const baseIntensity = zone.intensity;
  const intensityArc  = variation === 'D' ? [0.1, 0.6, 1.0, 0.8] :
                        variation === 'B' ? [0.2, 0.7, 0.95, 0.75] :
                        variation === 'C' ? [0.05, 0.4, 0.85, 0.7] :
                                            [0.15, 0.5, 0.9, 0.8];

  return intensityArc.map((mult, i) => ({
    t_pct:       i / (intensityArc.length - 1),
    intensity:   Math.min(1, baseIntensity * mult),
    easing_hint: easing.css_value,
  }));
}

// ─── Calcul des délais d'entrée/sortie ────────────────────────────────────────

function computeDelays(
  zoneName:  string,
  bpm:       number,
  variation: VariationKey
): { entry: number; exit: number; overlap: number } {
  // Durée d'un beat en ms
  const beatMs = (60 / bpm) * 1000;

  // Ordre des zones pour l'entrée en scène (séquentiel avec décalage de beats)
  const entryOrder: Record<VariationKey, string[]> = {
    A: ['fond', 'separateur', 'logo', 'nom', 'titre', 'contact', 'cta'],
    B: ['logo', 'nom', 'cta', 'separateur', 'fond', 'titre', 'contact'],
    C: ['fond', 'logo', 'separateur', 'nom', 'titre', 'cta', 'contact'],
    D: ['logo', 'cta', 'nom', 'fond', 'separateur', 'titre', 'contact'],
  };

  const order     = entryOrder[variation];
  const zoneIndex = order.indexOf(zoneName);
  const entryDelay = zoneIndex >= 0 ? Math.round(zoneIndex * beatMs * 0.382) : 0;   // espacé par φ⁻²
  const exitDelay  = Math.round(entryDelay + beatMs * PHI);                           // sortie après 1 φ-beat

  // Chevauchement : zones primaires se chevauchent plus
  const isPrimary = ['logo', 'cta', 'nom'].includes(zoneName);
  const overlap    = isPrimary ? 0.35 : 0.15;

  return { entry: entryDelay, exit: exitDelay, overlap };
}

// ─── Enrichissement de la zone avec les hints de transition ──────────────────

function applyTransitionHints(
  zone:       ZoneEffectDecision,
  blueprint:  TransitionBlueprint
): ZoneEffectDecision {
  return {
    ...zone,
    raison: `${zone.raison ?? ''} | Transition[${blueprint.easing.type}] bpm-sync:${blueprint.sync_group} entry:${blueprint.entry_delay_ms}ms`,
  };
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function buildTransitionPipeline(
  composition: ZoneComposition,
  variation:   VariationKey
): TransitionPipelineResult {
  const zones   = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const bpm     = GLOBAL_BPM[variation];
  const result  = { ...composition };
  const blueprints: Record<string, TransitionBlueprint> = {};
  const syncMap: Record<string, string[]>               = {};

  zones.forEach(zoneName => {
    const zone = composition[zoneName];
    if (!zone?.effet_id) return;

    const easingType  = ZONE_EASING_MAP[variation][zoneName] ?? 'organic';
    const easing      = EASING_FUNCTIONS[easingType]();
    const syncGroup   = SYNC_GROUPS[variation][zoneName] ?? 'identity';
    const delays      = computeDelays(zoneName, bpm, variation);
    const keyframes   = buildKeyframes(zone, easing, variation);

    const blueprint: TransitionBlueprint = {
      zone:            zoneName,
      easing,
      entry_delay_ms:  delays.entry,
      exit_delay_ms:   delays.exit,
      overlap_pct:     delays.overlap,
      sync_group:      syncGroup,
      keyframes,
    };

    blueprints[zoneName] = blueprint;
    syncMap[syncGroup]   = [...(syncMap[syncGroup] ?? []), zoneName];
    (result as any)[zoneName] = applyTransitionHints(zone, blueprint);
  });

  // Score de transition : homogénéité des groupes de sync
  const groupSizes    = Object.values(syncMap).map(g => g.length);
  const avgGroupSize  = groupSizes.reduce((a, b) => a + b, 0) / Math.max(1, groupSizes.length);
  const transitionScore = Math.min(1, avgGroupSize / 3);

  return { composition: result, blueprints, sync_groups: syncMap, global_bpm: bpm, transition_score: transitionScore };
}
