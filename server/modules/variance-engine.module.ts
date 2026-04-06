/**
 * 🧬 VARIANCE ENGINE — v2.0
 *
 * Moteur génétique qui maximise la diversité entre les 4 variations A/B/C/D.
 * - Distance cosinus entre vecteurs d'effets (diversité mathématiquement exacte)
 * - Algorithme de croisement génétique A×B → hybrides contrôlés
 * - Détection automatique des "clones" (similarité > 85%) + mutation forcée
 * - Cache des meilleurs génotypes par secteur pour accélérer les générations suivantes
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';

export type VariationKey = 'A' | 'B' | 'C' | 'D';

// ─── ADN d'une variation ──────────────────────────────────────────────────

export interface VariationDNA {
  variation:        VariationKey;
  gene_vector:      string[];
  effect_set:       Set<string>;
  speed_signature:  string;
  intensity_curve:  number[];
  complexity_score: number;
  /** Vecteur numérique normalisé pour la distance cosinus */
  numeric_vector:   number[];
}

export interface FitnessResult {
  variation:        VariationKey;
  uniqueness:       number;
  internal_harmony: number;
  visual_impact:    number;
  diversity_bonus:  number;
  total:            number;
}

export interface DiversityReport {
  overall_diversity: number;
  pairwise:          Record<string, number>;
  weakest_pair:      string;
  mutations_applied: number;
  crossovers_applied: number;
  clones_detected:   string[];
  compositions:      Record<VariationKey, ZoneComposition>;
}

// ─── Cache génotypes ─────────────────────────────────────────────────────────

interface GenotypeCache {
  sector:       string;
  variation:    VariationKey;
  dna:          Omit<VariationDNA, 'effect_set'> & { effect_set: string[] };
  fitness:      number;
  timestamp:    number;
}

const genotypeCache: Map<string, GenotypeCache> = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;  // 30 minutes

/**
 * Met en cache un génotype performant pour un secteur donné.
 */
export function cacheGenotype(sector: string, dna: VariationDNA, fitness: number): void {
  const key = `${sector}:${dna.variation}`;
  genotypeCache.set(key, {
    sector,
    variation:  dna.variation,
    dna: { ...dna, effect_set: [...dna.effect_set] },
    fitness,
    timestamp:  Date.now(),
  });
}

/**
 * Récupère le meilleur génotype en cache pour un secteur et une variation.
 */
export function getCachedGenotype(sector: string, variation: VariationKey): GenotypeCache | null {
  const key = `${sector}:${variation}`;
  const entry = genotypeCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    genotypeCache.delete(key);
    return null;
  }
  return entry;
}

export function clearGenotypeCache(sector?: string): void {
  if (sector) {
    for (const key of genotypeCache.keys()) {
      if (key.startsWith(`${sector}:`)) genotypeCache.delete(key);
    }
  } else {
    genotypeCache.clear();
  }
}

// ─── Ordre canonique des zones ───────────────────────────────────────────────

const ZONE_ORDER = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

const INTENSITY_TARGETS: Record<VariationKey, number[]> = {
  A: [0.65, 0.50, 0.30, 0.20, 0.45, 0.35, 0.55],
  B: [0.80, 0.65, 0.35, 0.25, 0.55, 0.40, 0.70],
  C: [0.70, 0.55, 0.30, 0.20, 0.40, 0.45, 0.60],
  D: [0.95, 0.80, 0.40, 0.30, 0.65, 0.50, 0.85],
};

// Dictionnaire global des effets connus pour le vecteur numérique
const KNOWN_EFFECTS: string[] = [];
function effectIndex(effectId: string): number {
  if (!KNOWN_EFFECTS.includes(effectId)) KNOWN_EFFECTS.push(effectId);
  return KNOWN_EFFECTS.indexOf(effectId);
}

// ─── Encodage ADN ────────────────────────────────────────────────────────────

export function encodeVariationDNA(
  variation: VariationKey,
  composition: ZoneComposition
): VariationDNA {
  const gene_vector: string[] = [];
  const effect_set = new Set<string>();
  const speed_parts: string[] = [];
  const intensity_curve: number[] = [];
  const numeric_vector_raw: number[] = [];
  let layerCount = 0;
  let totalZones = 0;

  for (const zone of ZONE_ORDER) {
    const zd: ZoneEffectDecision = (composition as any)[zone];
    if (!zd) {
      gene_vector.push('NONE');
      speed_parts.push('?');
      intensity_curve.push(0);
      numeric_vector_raw.push(0, 0, 0);
      continue;
    }

    gene_vector.push(zd.effet_id || 'NONE');
    effect_set.add(zd.effet_id || 'NONE');
    speed_parts.push(zd.speed || 'medium');
    intensity_curve.push(zd.intensity ?? 0.5);

    // Vecteur numérique : [index_effet, intensité, vitesse_encodée]
    const speedEnc = zd.speed === 'slow' ? 0 : zd.speed === 'fast' ? 1 : 0.5;
    numeric_vector_raw.push(effectIndex(zd.effet_id || 'NONE'), zd.intensity ?? 0.5, speedEnc);
    totalZones++;

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

  // Normalisation L2 du vecteur numérique pour la distance cosinus
  const norm = Math.sqrt(numeric_vector_raw.reduce((s, v) => s + v * v, 0)) || 1;
  const numeric_vector = numeric_vector_raw.map(v => v / norm);

  return {
    variation,
    gene_vector,
    effect_set,
    speed_signature: speed_parts.join('-'),
    intensity_curve,
    complexity_score,
    numeric_vector,
  };
}

// ─── Distance cosinus ────────────────────────────────────────────────────────

/**
 * Calcule la distance cosinus entre deux vecteurs d'effets normalisés.
 * 0 = identiques, 1 = orthogonaux (totalement différents).
 * Plus précis que Jaccard car il tient compte des positions et intensités.
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  const len = Math.min(v1.length, v2.length);
  let dot = 0;
  for (let i = 0; i < len; i++) dot += v1[i] * v2[i];
  return Math.max(-1, Math.min(1, dot));
}

export function cosineDistance(v1: number[], v2: number[]): number {
  return parseFloat((1 - cosineSimilarity(v1, v2)).toFixed(4));
}

// ─── Distance génétique hybride ──────────────────────────────────────────────

/**
 * Distance hybride : 50% cosinus (positions + intensités) + 30% Jaccard (ensembles) + 20% vitesse.
 */
export function geneticDistance(dna1: VariationDNA, dna2: VariationDNA): number {
  // 1. Distance cosinus sur vecteur numérique (50%)
  const cosDist = cosineDistance(dna1.numeric_vector, dna2.numeric_vector);

  // 2. Jaccard sur ensembles d'effets (30%)
  const union        = new Set([...dna1.effect_set, ...dna2.effect_set]);
  const intersection = new Set([...dna1.effect_set].filter(e => dna2.effect_set.has(e)));
  const jaccardDist  = union.size > 0 ? 1 - intersection.size / union.size : 0;

  // 3. Distance de vitesse (20%)
  const s1 = dna1.speed_signature.split('-');
  const s2 = dna2.speed_signature.split('-');
  let speedDiff = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] !== s2[i]) speedDiff++;
  }
  const speedDistance = s1.length > 0 ? speedDiff / s1.length : 0;

  return parseFloat((cosDist * 0.5 + jaccardDist * 0.3 + speedDistance * 0.2).toFixed(4));
}

// ─── Détection clones ────────────────────────────────────────────────────────

const CLONE_THRESHOLD = 0.15;  // distance cosinus < 0.15 → clones (similarité > 85%)

/**
 * Détecte les paires de variations qui sont trop similaires (clones).
 */
export function detectClones(dnas: VariationDNA[]): string[] {
  const clones: string[] = [];
  for (let i = 0; i < dnas.length; i++) {
    for (let j = i + 1; j < dnas.length; j++) {
      const dist = cosineDistance(dnas[i].numeric_vector, dnas[j].numeric_vector);
      if (dist < CLONE_THRESHOLD) {
        clones.push(`${dnas[i].variation}-${dnas[j].variation}(${(dist * 100).toFixed(1)}%dist)`);
      }
    }
  }
  return clones;
}

// ─── Croisement génétique ────────────────────────────────────────────────────

/**
 * Croisement A×B : échange les zones [splitIndex:] entre deux compositions.
 * Produit un hybride contrôlé qui hérite des meilleures caractéristiques des deux parents.
 */
export function crossover(
  parent1: ZoneComposition,
  parent2: ZoneComposition,
  splitIndex?: number
): ZoneComposition {
  const split = splitIndex ?? Math.floor(ZONE_ORDER.length / 2);
  const child: any = {};

  for (let i = 0; i < ZONE_ORDER.length; i++) {
    const zone = ZONE_ORDER[i];
    // Avant le point de coupure → parent1, après → parent2
    child[zone] = i < split
      ? (parent1 as any)[zone]
      : (parent2 as any)[zone];
  }

  return child as ZoneComposition;
}

/**
 * Mutation forcée : change l'intensité et la vitesse d'une zone aléatoire.
 * Utilisé quand deux variations sont trop similaires (clone détecté).
 */
function forceMutate(
  composition: ZoneComposition,
  variation: VariationKey
): ZoneComposition {
  const result: any = { ...composition };
  const intensityTargets = INTENSITY_TARGETS[variation];
  const zoneList = [...ZONE_ORDER];

  // Choisir aléatoirement une zone à muter
  const zoneIdx = Math.floor(Math.random() * zoneList.length);
  const zone    = zoneList[zoneIdx];
  const current: ZoneEffectDecision = result[zone];
  if (!current) return result;

  const targetIntensity = intensityTargets[zoneIdx] ?? 0.5;
  // Ajouter un décalage aléatoire ±0.2
  const mutatedIntensity = Math.max(0.1, Math.min(1.0, targetIntensity + (Math.random() - 0.5) * 0.4));

  const speedOptions: Array<'slow' | 'medium' | 'fast'> = ['slow', 'medium', 'fast'];
  const currentSpeedIdx = speedOptions.indexOf(current.speed as any);
  // Choisir une vitesse différente
  const newSpeed = speedOptions[(currentSpeedIdx + 1 + Math.floor(Math.random() * 2)) % 3];

  result[zone] = { ...current, intensity: mutatedIntensity, speed: newSpeed };
  return result as ZoneComposition;
}

// ─── Calcul fitness ──────────────────────────────────────────────────────────

export function calculateFitness(
  dna: VariationDNA,
  allDNAs: VariationDNA[]
): FitnessResult {
  const others = allDNAs.filter(d => d.variation !== dna.variation);

  // Unicité cosinus moyenne
  const distances  = others.map(other => cosineDistance(dna.numeric_vector, other.numeric_vector));
  const uniqueness = distances.length > 0
    ? distances.reduce((a, b) => a + b, 0) / distances.length
    : 1;

  // Harmonie interne
  const target = INTENSITY_TARGETS[dna.variation];
  let harmonydiff = 0;
  for (let i = 0; i < Math.min(dna.intensity_curve.length, target.length); i++) {
    harmonydiff += Math.abs(dna.intensity_curve[i] - target[i]);
  }
  const internal_harmony = 1 - harmonydiff / Math.max(target.length, 1);

  // Impact visuel
  const visual_impact = Math.min(
    dna.complexity_score * 0.4 + (dna.effect_set.size / 10) * 0.3 + 0.3, 1
  );

  // Bonus diversité
  const allEffects     = new Set(others.flatMap(d => [...d.effect_set]));
  const uniqueEffects  = [...dna.effect_set].filter(e => !allEffects.has(e));
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

function mutateSimilarZone(
  target: ZoneComposition,
  reference: ZoneComposition,
  targetVariation: VariationKey
): ZoneComposition {
  const result = { ...target };
  const intensityTargets = INTENSITY_TARGETS[targetVariation];
  const zoneList = [...ZONE_ORDER];

  let maxSimilarity = 0;
  let zoneToMutate  = 'fond';

  for (const zone of zoneList) {
    const tz: ZoneEffectDecision = (target as any)[zone];
    const rz: ZoneEffectDecision = (reference as any)[zone];
    if (!tz || !rz) continue;
    if (tz.effet_id === rz.effet_id) {
      const sim = 1 - Math.abs((tz.intensity ?? 0.5) - (rz.intensity ?? 0.5));
      if (sim > maxSimilarity) { maxSimilarity = sim; zoneToMutate = zone; }
    }
  }

  const zoneIdx       = zoneList.indexOf(zoneToMutate as typeof ZONE_ORDER[number]);
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

const DIVERSITY_THRESHOLD = 0.45;

export function maximizeDiversity(
  compositions: Record<VariationKey, ZoneComposition>,
  options?: { sector?: string; maxPasses?: number }
): DiversityReport {
  const keys: VariationKey[] = ['A', 'B', 'C', 'D'];
  let current = { ...compositions };
  let mutationsApplied  = 0;
  let crossoversApplied = 0;
  const maxPasses = options?.maxPasses ?? 4;

  for (let pass = 0; pass < maxPasses; pass++) {
    const dnas = keys.map(k => encodeVariationDNA(k, current[k]));

    // ① Détection des clones
    const clones = detectClones(dnas);
    if (clones.length > 0) {
      console.warn(`🧬 VarianceEngine — Clones détectés: ${clones.join(', ')} → mutation forcée`);
      // Muter chaque variation impliquée dans un clone
      for (const cloneStr of clones) {
        const [varA, varBRaw] = cloneStr.split('-') as [VariationKey, string];
        const varB = varBRaw.split('(')[0] as VariationKey;
        current[varB] = forceMutate(current[varB], varB);
        mutationsApplied++;
      }
      continue;
    }

    // ② Croisement si paire trop similaire
    const pairwise: Record<string, number> = {};
    let weakestPairKey = '';
    let weakestDist = Infinity;

    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const pairKey = `${keys[i]}-${keys[j]}`;
        const dist    = geneticDistance(dnas[i], dnas[j]);
        pairwise[pairKey] = dist;
        if (dist < weakestDist) { weakestDist = dist; weakestPairKey = pairKey; }
      }
    }

    if (weakestDist < DIVERSITY_THRESHOLD && weakestPairKey) {
      const [varA, varB] = weakestPairKey.split('-') as VariationKey[];

      // Essayer un croisement d'abord
      const child = crossover(current[varA], current[varB], 3);
      const childDNA = encodeVariationDNA(varB, child);
      const originalDNA = dnas.find(d => d.variation === varB)!;
      const childDist = cosineDistance(childDNA.numeric_vector, dnas.find(d => d.variation === varA)!.numeric_vector);

      if (childDist > weakestDist) {
        // Le croisement a amélioré la diversité
        current[varB] = child;
        crossoversApplied++;
      } else {
        // Fallback sur mutation ciblée
        current[varB] = mutateSimilarZone(current[varB], current[varA], varB);
        mutationsApplied++;
      }
    } else {
      break;
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
      const dist    = geneticDistance(finalDNAs[i], finalDNAs[j]);
      pairwiseFinal[pairKey] = parseFloat(dist.toFixed(3));
      if (dist < weakestDist) { weakestDist = dist; weakestPair = pairKey; }
    }
  }

  const allDistances = Object.values(pairwiseFinal);
  const overall = allDistances.reduce((a, b) => a + b, 0) / Math.max(allDistances.length, 1);

  // Mise en cache des meilleurs génotypes si secteur fourni
  if (options?.sector) {
    for (const dna of finalDNAs) {
      const fitness = calculateFitness(dna, finalDNAs);
      if (fitness.total > 0.65) {
        cacheGenotype(options.sector, dna, fitness.total);
      }
    }
  }

  const report: DiversityReport = {
    overall_diversity:   parseFloat(overall.toFixed(3)),
    pairwise:            pairwiseFinal,
    weakest_pair:        weakestPair,
    mutations_applied:   mutationsApplied,
    crossovers_applied:  crossoversApplied,
    clones_detected:     detectClones(finalDNAs),
    compositions:        current,
  };

  console.log(`🧬 Variance Engine — Diversité: ${(overall * 100).toFixed(1)}% | Mutations: ${mutationsApplied} | Croisements: ${crossoversApplied} | Clones: ${report.clones_detected.length}`);
  return report;
}

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

console.log('🧬 Variance Engine v2.0 chargé — distance cosinus | croisement génétique | détection clones | cache secteur');

// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion