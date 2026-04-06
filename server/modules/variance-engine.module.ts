/**
 * 🧬 VARIANCE ENGINE
 *
 * Moteur génétique qui maximise la diversité entre les 4 variations A/B/C/D.
 * - Encode chaque ZoneComposition en "ADN" (vecteur d'effets)
 * - Calcule les scores de fitness (unicité, cohérence, impact)
 * - Applique mutations + croisements si 2 variations se ressemblent trop
 * - Garantit que chaque variation est visuellement distincte
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';

export type VariationKey = 'A' | 'B' | 'C' | 'D';

// ─── ADN d'une variation ──────────────────────────────────────────────────

export interface VariationDNA {
  variation:        VariationKey;
  gene_vector:      string[];           // liste ordonnée des effet_id de toutes les zones
  effect_set:       Set<string>;        // ensemble des effets uniques utilisés
  speed_signature:  string;             // ex: "slow-medium-slow-medium-fast-slow-medium"
  intensity_curve:  number[];           // profil d'intensité [logo, nom, titre, contact, sep, fond, cta]
  complexity_score: number;             // 0-1 : combien de couches multi-layers
}

export interface FitnessResult {
  variation:        VariationKey;
  uniqueness:       number;  // 0-1 par rapport aux autres variations
  internal_harmony: number;  // 0-1 cohérence interne des effets
  visual_impact:    number;  // 0-1 puissance visuelle
  diversity_bonus:  number;  // bonus si beaucoup d'effets uniques vs les autres
  total:            number;  // score final
}

export interface DiversityReport {
  overall_diversity: number;   // 0-1 moyenne pairwise
  pairwise: Record<string, number>;  // ex: { "A-B": 0.87, "A-C": 0.72 ... }
  weakest_pair: string;        // la paire la moins diverse
  mutations_applied: number;   // nb mutations appliquées
  compositions: Record<VariationKey, ZoneComposition>;
}

// ─── Ordre canonique des zones ───────────────────────────────────────────────

const ZONE_ORDER = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

// Profils d'intensité attendus par variation (référence)
const INTENSITY_TARGETS: Record<VariationKey, number[]> = {
  A: [0.65, 0.50, 0.30, 0.20, 0.45, 0.35, 0.55],  // calme, équilibré
  B: [0.80, 0.65, 0.35, 0.25, 0.55, 0.40, 0.70],  // précis, net
  C: [0.70, 0.55, 0.30, 0.20, 0.40, 0.45, 0.60],  // atmosphérique
  D: [0.95, 0.80, 0.40, 0.30, 0.65, 0.50, 0.85],  // explosif
};

// ─── Encodage ADN ────────────────────────────────────────────────────────────

export function encodeVariationDNA(
  variation: VariationKey,
  composition: ZoneComposition
): VariationDNA {
  const gene_vector: string[] = [];
  const effect_set = new Set<string>();
  const speed_parts: string[] = [];
  const intensity_curve: number[] = [];
  let layerCount = 0;
  let totalZones = 0;

  for (const zone of ZONE_ORDER) {
    const zd: ZoneEffectDecision = (composition as any)[zone];
    if (!zd) { gene_vector.push('NONE'); speed_parts.push('?'); intensity_curve.push(0); continue; }

    // Effet principal
    gene_vector.push(zd.effet_id || 'NONE');
    effect_set.add(zd.effet_id || 'NONE');
    speed_parts.push(zd.speed || 'medium');
    intensity_curve.push(zd.intensity ?? 0.5);
    totalZones++;

    // Couches secondaires
    if (zd.layers && zd.layers.length > 1) {
      layerCount += zd.layers.length;
      for (const layer of zd.layers) {
        if (layer.effet_id && layer.effet_id !== zd.effet_id) {
          gene_vector.push(`${zone}:${layer.category}:${layer.effet_id}`);
          effect_set.add(layer.effet_id);
        }
      }
    }
  }

  const complexity_score = totalZones > 0 ? Math.min(layerCount / (totalZones * 3), 1) : 0;

  return {
    variation,
    gene_vector,
    effect_set,
    speed_signature: speed_parts.join('-'),
    intensity_curve,
    complexity_score,
  };
}

// ─── Distance génétique ──────────────────────────────────────────────────────

/**
 * Mesure la distance génétique entre 2 variations (0 = identiques, 1 = totalement différentes).
 * Combine : overlap d'effets + différence d'intensité + différence de vitesse.
 */
export function geneticDistance(dna1: VariationDNA, dna2: VariationDNA): number {
  // 1. Jaccard distance sur les ensembles d'effets (40% du score)
  const union = new Set([...dna1.effect_set, ...dna2.effect_set]);
  const intersection = new Set([...dna1.effect_set].filter(e => dna2.effect_set.has(e)));
  const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;
  const jaccardDistance = 1 - jaccardSimilarity;

  // 2. Distance d'intensité L1 normalisée (30% du score)
  let intensityDist = 0;
  for (let i = 0; i < Math.min(dna1.intensity_curve.length, dna2.intensity_curve.length); i++) {
    intensityDist += Math.abs(dna1.intensity_curve[i] - dna2.intensity_curve[i]);
  }
  intensityDist /= Math.max(dna1.intensity_curve.length, 1);

  // 3. Distance de signature de vitesse (30% du score)
  const s1 = dna1.speed_signature.split('-');
  const s2 = dna2.speed_signature.split('-');
  let speedDiff = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] !== s2[i]) speedDiff++;
  }
  const speedDistance = s1.length > 0 ? speedDiff / s1.length : 0;

  return parseFloat((jaccardDistance * 0.4 + intensityDist * 0.3 + speedDistance * 0.3).toFixed(4));
}

// ─── Calcul fitness ──────────────────────────────────────────────────────────

export function calculateFitness(
  dna: VariationDNA,
  allDNAs: VariationDNA[]
): FitnessResult {
  const others = allDNAs.filter(d => d.variation !== dna.variation);

  // Unicité = distance moyenne par rapport aux autres variations
  const distances = others.map(other => geneticDistance(dna, other));
  const uniqueness = distances.length > 0
    ? distances.reduce((a, b) => a + b, 0) / distances.length
    : 1;

  // Harmonie interne : l'intensité suit le profil cible de la variation ?
  const target = INTENSITY_TARGETS[dna.variation];
  let harmonydiff = 0;
  for (let i = 0; i < Math.min(dna.intensity_curve.length, target.length); i++) {
    harmonydiff += Math.abs(dna.intensity_curve[i] - target[i]);
  }
  const internal_harmony = 1 - harmonydiff / Math.max(target.length, 1);

  // Impact visuel : nombre de couches + complexité + effets utilisés
  const visual_impact = Math.min(
    dna.complexity_score * 0.4 + (dna.effect_set.size / 10) * 0.3 + 0.3,
    1
  );

  // Bonus diversité : si effet_set ne chevauche pas les autres
  const allEffects = new Set(others.flatMap(d => [...d.effect_set]));
  const uniqueEffects = [...dna.effect_set].filter(e => !allEffects.has(e));
  const diversity_bonus = dna.effect_set.size > 0
    ? uniqueEffects.length / dna.effect_set.size
    : 0;

  const total = parseFloat((
    uniqueness       * 0.35 +
    internal_harmony * 0.25 +
    visual_impact    * 0.25 +
    diversity_bonus  * 0.15
  ).toFixed(4));

  return { variation: dna.variation, uniqueness, internal_harmony, visual_impact, diversity_bonus, total };
}

// ─── Mutation ciblée ────────────────────────────────────────────────────────

/**
 * Detecte quelle zone est trop similaire entre deux compositions et
 * force une intensité/vitesse différente pour créer de la diversité.
 * (Ne touche pas à l'effet_id car cela est géré par le sélecteur de zone.)
 */
function mutateSimilarZone(
  target: ZoneComposition,
  reference: ZoneComposition,
  targetVariation: VariationKey
): ZoneComposition {
  const result = { ...target };
  const intensityTargets = INTENSITY_TARGETS[targetVariation];
  const zoneList = [...ZONE_ORDER];

  // Trouver la zone la plus similaire
  let maxSimilarity = 0;
  let zoneToMutate = 'fond';

  for (const zone of zoneList) {
    const tz: ZoneEffectDecision = (target as any)[zone];
    const rz: ZoneEffectDecision = (reference as any)[zone];
    if (!tz || !rz) continue;
    if (tz.effet_id === rz.effet_id) {
      const sim = 1 - Math.abs((tz.intensity ?? 0.5) - (rz.intensity ?? 0.5));
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        zoneToMutate = zone;
      }
    }
  }

  // Appliquer la mutation : décaler l'intensité vers la cible de la variation
  const zoneIdx = zoneList.indexOf(zoneToMutate as typeof ZONE_ORDER[number]);
  const targetIntensity = intensityTargets[zoneIdx] ?? 0.5;
  const currentZone: ZoneEffectDecision = (result as any)[zoneToMutate];

  const mutatedZone: ZoneEffectDecision = {
    ...currentZone,
    intensity: targetIntensity,
    speed: targetVariation === 'D' ? 'fast'
          : targetVariation === 'A' ? 'slow'
          : 'medium',
  };

  (result as any)[zoneToMutate] = mutatedZone;
  return result;
}

// ─── Optimisation de la diversité ───────────────────────────────────────────

const DIVERSITY_THRESHOLD = 0.45;  // distance minimale acceptable entre deux variations

/**
 * Point d'entrée principal.
 * Prend les 4 compositions A/B/C/D, calcule leur diversité pairwise,
 * applique des mutations si nécessaire, et retourne le résultat optimisé.
 */
export function maximizeDiversity(
  compositions: Record<VariationKey, ZoneComposition>
): DiversityReport {
  const keys: VariationKey[] = ['A', 'B', 'C', 'D'];
  let current = { ...compositions };
  let mutationsApplied = 0;

  // Jusqu'à 3 passes d'optimisation
  for (let pass = 0; pass < 3; pass++) {
    const dnas = keys.map(k => encodeVariationDNA(k, current[k]));

    // Calcul pairwise
    const pairwise: Record<string, number> = {};
    let weakestPairKey = '';
    let weakestDist = Infinity;

    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const pairKey = `${keys[i]}-${keys[j]}`;
        const dist = geneticDistance(dnas[i], dnas[j]);
        pairwise[pairKey] = dist;
        if (dist < weakestDist) { weakestDist = dist; weakestPairKey = pairKey; }
      }
    }

    // Si la paire la plus similaire est en dessous du seuil → mutation
    if (weakestDist < DIVERSITY_THRESHOLD && weakestPairKey) {
      const [varA, varB] = weakestPairKey.split('-') as VariationKey[];
      // On mutate la seconde variation (pour préserver A comme référence)
      current[varB] = mutateSimilarZone(current[varB], current[varA], varB);
      mutationsApplied++;
    } else {
      break;  // Diversité suffisante, on arrête
    }
  }

  // Rapport final
  const finalDNAs = keys.map(k => encodeVariationDNA(k, current[k]));
  const pairwiseFinal: Record<string, number> = {};
  let weakestPair = '';
  let weakestDist = Infinity;

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const pairKey = `${keys[i]}-${keys[j]}`;
      const dist = geneticDistance(finalDNAs[i], finalDNAs[j]);
      pairwiseFinal[pairKey] = parseFloat(dist.toFixed(3));
      if (dist < weakestDist) { weakestDist = dist; weakestPair = pairKey; }
    }
  }

  const allDistances = Object.values(pairwiseFinal);
  const overall = allDistances.reduce((a, b) => a + b, 0) / Math.max(allDistances.length, 1);

  const report: DiversityReport = {
    overall_diversity:  parseFloat(overall.toFixed(3)),
    pairwise:           pairwiseFinal,
    weakest_pair:       weakestPair,
    mutations_applied:  mutationsApplied,
    compositions:       current,
  };

  console.log(`🧬 Variance Engine — Diversité globale: ${(overall * 100).toFixed(1)}% | Paire faible: ${weakestPair}(${(weakestDist * 100).toFixed(0)}%) | Mutations: ${mutationsApplied}`);
  return report;
}

/**
 * Retourne un résumé lisible des fitness scores pour les logs.
 */
export function logFitnessReport(compositions: Record<VariationKey, ZoneComposition>): string {
  const keys: VariationKey[] = ['A', 'B', 'C', 'D'];
  const dnas = keys.map(k => encodeVariationDNA(k, compositions[k]));
  return keys
    .map(k => {
      const dna = dnas.find(d => d.variation === k)!;
      const fitness = calculateFitness(dna, dnas);
      return `${k}:${(fitness.total * 100).toFixed(0)}%`;
    })
    .join(' | ');
}

console.log('🧬 Variance Engine chargé — algorithme génétique | distance Jaccard + intensité + vitesse');
