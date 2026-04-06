/**
 * 🔀 EFFECT FUSION ENGINE — v2.0
 *
 * - Bibliothèque de recettes hybrides étendue à 50+ combinaisons
 * - Validation physique des mélanges : détecte les effets incohérents (ex: GLITCH + SOUL_AURA)
 * - Calcul du "poids perceptuel" de chaque recette pour éviter la surcharge sensorielle
 * - Recettes adaptatives avec proportions variables selon le score de complexité du ContentAnalyzer
 */

import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';

// ─── Familles d'effets ────────────────────────────────────────────────────────

const EFFECT_FAMILIES: Record<string, string[]> = {
  PARTICLE:    ['PARTICLE_BUILD', 'SPARKLE_AURA', 'STAR_DUST_FORM', 'STAR_EXPLOSION', 'STELLAR_DRIFT', 'COSMIC_DUST', 'SOUL_AURA'],
  ENERGY:      ['ENERGY_FLOW', 'ENERGY_IONIZE', 'ELECTRIC_FORM', 'ELECTRIC_HOVER', 'NEON_GLOW', 'NEURAL_PULSE', 'MAGNETIC_FIELD', 'MAGNETIC_PULL'],
  FLUID:       ['LIQUID_MORPH', 'LIQUID_POUR', 'LIQUID_STATE', 'WAVE_DISSOLVE', 'WAVE_DISTORTION', 'WAVE_SURF', 'SMOKE_DISPERSE'],
  TEMPORAL:    ['TIME_ECHO', 'TIME_REWIND', 'ECHO_MULTIPLE', 'ECHO_TRAIL', 'PHASE_THROUGH', 'QUANTUM_PHASE', 'QUANTUM_SPLIT'],
  DIMENSIONAL: ['MORPH_3D', 'ROTATION_3D', 'DIMENSION_SHIFT', 'MIRROR_REALITY', 'HOLOGRAM', 'GRAVITY_REVERSE'],
  ORGANIC:     ['BREATHING', 'HEARTBEAT', 'FLOAT_DANCE', 'FLOAT_PHYSICS', 'DNA_BUILD', 'CRYSTAL_GROW'],
  DESTRUCTIVE: ['FIRE_CONSUME', 'FIRE_WRITE', 'ICE_FREEZE', 'TORNADO_ABSORB', 'TORNADO_SPIN', 'GLITCH_SPAWN', 'REALITY_GLITCH'],
  ATMOSPHERIC: ['FADE_LAYERS', 'SHADOW_CLONE', 'PENDULUM_SWING', 'GYROSCOPE_SPIN', 'ORBIT_DANCE', 'PRISM_SPLIT'],
};

// ─── Incompatibilités physiques ───────────────────────────────────────────────

/**
 * Paires d'effets physiquement incohérentes — ne peuvent pas coexister dans une même zone.
 * Ex: GLITCH (chaos numérique) + SOUL_AURA (sérénité organique) = contradiction narrative.
 */
const PHYSICAL_INCOMPATIBILITIES: Array<{ a: string; b: string; reason: string }> = [
  { a: 'GLITCH_SPAWN',   b: 'SOUL_AURA',      reason: 'Chaos numérique ≠ sérénité organique' },
  { a: 'REALITY_GLITCH', b: 'HEARTBEAT',       reason: 'Erreur système ≠ vie organique' },
  { a: 'ICE_FREEZE',     b: 'FIRE_CONSUME',    reason: 'Gel ≠ combustion (opposition thermique)' },
  { a: 'ICE_FREEZE',     b: 'FIRE_WRITE',      reason: 'Gel ≠ feu (opposition thermique)' },
  { a: 'TORNADO_SPIN',   b: 'CRYSTAL_GROW',    reason: 'Vortex ≠ cristallisation (opposition physique)' },
  { a: 'TORNADO_ABSORB', b: 'CRYSTAL_GROW',    reason: 'Aspiration ≠ croissance ordonnée' },
  { a: 'GLITCH_SPAWN',   b: 'BREATHING',       reason: 'Erreur numérique ≠ respiration naturelle' },
  { a: 'REALITY_GLITCH', b: 'SOUL_AURA',       reason: 'Dysfonction ≠ présence spirituelle' },
  { a: 'FIRE_CONSUME',   b: 'WAVE_DISSOLVE',   reason: 'Feu ≠ eau (annulation physique)' },
  { a: 'FIRE_CONSUME',   b: 'LIQUID_POUR',     reason: 'Combustion ≠ liquide' },
  { a: 'FIRE_CONSUME',   b: 'LIQUID_STATE',    reason: 'Combustion ≠ état liquide' },
  { a: 'STAR_EXPLOSION', b: 'FADE_LAYERS',     reason: 'Explosion ≠ disparition douce (contradiction d\'intensité)' },
  { a: 'QUANTUM_PHASE',  b: 'PENDULUM_SWING',  reason: 'Superposition quantique ≠ mouvement déterministe' },
  { a: 'TORNADO_SPIN',   b: 'FLOAT_PHYSICS',   reason: 'Vortex ≠ lévitation stable' },
];

// ─── Bibliothèque de 50+ recettes hybrides ───────────────────────────────────

interface HybridRecipeTemplate {
  name:          string;
  families:      string[];    // familles combinées dans l'ordre de priorité
  weights:       number[];    // poids de chaque famille (somme ≤ 1)
  blend_mode:    'additive' | 'multiplicative' | 'overlay' | 'screen';
  perceptual_weight: number;  // 0-1 : charge perceptuelle (0=léger, 1=surchargé)
  best_for:      string[];    // secteurs/variations recommandés
  description:   string;
}

const HYBRID_RECIPES: HybridRecipeTemplate[] = [
  // ── Particules + Énergie ──────────────────────────────────────────────────
  { name: 'Plasma Nebula',        families: ['PARTICLE','ENERGY'],       weights: [0.60,0.40],         blend_mode: 'additive',       perceptual_weight: 0.65, best_for: ['tech','startup','D'],  description: 'Nuage de particules chargées électriquement' },
  { name: 'Solar Storm',          families: ['ENERGY','PARTICLE'],       weights: [0.55,0.45],         blend_mode: 'screen',         perceptual_weight: 0.75, best_for: ['creative','D'],       description: 'Tempête solaire — arcs électriques + poussière cosmique' },
  { name: 'Quantum Dust',         families: ['PARTICLE','TEMPORAL'],     weights: [0.50,0.50],         blend_mode: 'overlay',        perceptual_weight: 0.55, best_for: ['tech','B'],           description: 'Particules avec effets temporels quantiques' },
  { name: 'Neural Constellation', families: ['ENERGY','PARTICLE'],       weights: [0.45,0.55],         blend_mode: 'additive',       perceptual_weight: 0.60, best_for: ['ia_ml','tech'],        description: 'Réseau de synapses avec constellation de particules' },
  { name: 'Star Forge',           families: ['PARTICLE','DIMENSIONAL'],  weights: [0.60,0.40],         blend_mode: 'multiplicative', perceptual_weight: 0.70, best_for: ['creative','D'],       description: 'Formation stellaire avec morphing dimensionnel' },
  // ── Organique + Fluide ───────────────────────────────────────────────────
  { name: 'Ocean Breath',         families: ['ORGANIC','FLUID'],         weights: [0.55,0.45],         blend_mode: 'overlay',        perceptual_weight: 0.35, best_for: ['wellness','A'],       description: 'Respiration + vagues océaniques — calme absolu' },
  { name: 'Living Water',         families: ['FLUID','ORGANIC'],         weights: [0.60,0.40],         blend_mode: 'additive',       perceptual_weight: 0.40, best_for: ['wellness','C'],       description: 'Liquide organique avec pulsation vitale' },
  { name: 'Crystal Bloom',        families: ['ORGANIC','ATMOSPHERIC'],   weights: [0.65,0.35],         blend_mode: 'screen',         perceptual_weight: 0.30, best_for: ['luxe','A'],          description: 'Croissance cristalline + aura atmosphérique' },
  { name: 'DNA Ocean',            families: ['ORGANIC','FLUID','ENERGY'],weights: [0.45,0.35,0.20],    blend_mode: 'overlay',        perceptual_weight: 0.50, best_for: ['biotech','medical'],  description: 'Hélice ADN dans un milieu liquide électrifié' },
  { name: 'Heartwave',            families: ['ORGANIC','FLUID'],         weights: [0.70,0.30],         blend_mode: 'multiplicative', perceptual_weight: 0.45, best_for: ['medical','wellness'], description: 'Pulsation cardiaque + ondes fluides' },
  // ── Temporel + Dimensionnel ─────────────────────────────────────────────
  { name: 'Time Warp',            families: ['TEMPORAL','DIMENSIONAL'],  weights: [0.55,0.45],         blend_mode: 'screen',         perceptual_weight: 0.60, best_for: ['tech','B','C'],       description: 'Distorsion temporelle + morphing 3D' },
  { name: 'Mirror Echo',          families: ['DIMENSIONAL','TEMPORAL'],  weights: [0.60,0.40],         blend_mode: 'overlay',        perceptual_weight: 0.55, best_for: ['creative','C'],       description: 'Réflexion miroir + échos temporels' },
  { name: 'Phase Shift',          families: ['TEMPORAL','ENERGY'],       weights: [0.50,0.50],         blend_mode: 'additive',       perceptual_weight: 0.65, best_for: ['tech','D'],           description: 'Superposition quantique + flux d\'énergie' },
  { name: 'Holographic Echo',     families: ['DIMENSIONAL','TEMPORAL'],  weights: [0.55,0.45],         blend_mode: 'screen',         perceptual_weight: 0.70, best_for: ['tech','gaming'],      description: 'Hologramme instable avec décalage temporel' },
  { name: 'Orbital Memory',       families: ['DIMENSIONAL','TEMPORAL'],  weights: [0.65,0.35],         blend_mode: 'multiplicative', perceptual_weight: 0.50, best_for: ['finance','A'],        description: 'Rotation orbitale avec traces temporelles' },
  // ── Énergie + Atmosphérique ──────────────────────────────────────────────
  { name: 'Electric Mist',        families: ['ENERGY','ATMOSPHERIC'],    weights: [0.60,0.40],         blend_mode: 'screen',         perceptual_weight: 0.50, best_for: ['tech','C'],           description: 'Arcs électriques dans un brouillard atmosphérique' },
  { name: 'Neon Shadow',          families: ['ENERGY','ATMOSPHERIC'],    weights: [0.55,0.45],         blend_mode: 'overlay',        perceptual_weight: 0.55, best_for: ['gaming','creative'],  description: 'Néon cyberpunk + ombres dynamiques' },
  { name: 'Pulse Aura',           families: ['ENERGY','ORGANIC'],        weights: [0.50,0.50],         blend_mode: 'additive',       perceptual_weight: 0.45, best_for: ['startup','B'],        description: 'Pulsation énergétique + aura organique' },
  { name: 'Magnetic Dream',       families: ['ENERGY','ATMOSPHERIC'],    weights: [0.60,0.40],         blend_mode: 'multiplicative', perceptual_weight: 0.40, best_for: ['luxe','A'],          description: 'Champ magnétique + atmosphère onirique' },
  { name: 'Lightning Veil',       families: ['ENERGY','FLUID'],          weights: [0.55,0.45],         blend_mode: 'screen',         perceptual_weight: 0.65, best_for: ['esport','gaming'],    description: 'Éclairs + voile liquide ondulant' },
  // ── Destructif + Énergie ─────────────────────────────────────────────────
  { name: 'Inferno Core',         families: ['DESTRUCTIVE','ENERGY'],    weights: [0.60,0.40],         blend_mode: 'additive',       perceptual_weight: 0.85, best_for: ['gaming','D'],         description: 'Combustion + noyau d\'énergie pure' },
  { name: 'Storm Vortex',         families: ['DESTRUCTIVE','FLUID'],     weights: [0.55,0.45],         blend_mode: 'multiplicative', perceptual_weight: 0.80, best_for: ['creative','D'],       description: 'Tornade + vortex liquide' },
  { name: 'Glitch Matrix',        families: ['DESTRUCTIVE','TEMPORAL'],  weights: [0.60,0.40],         blend_mode: 'screen',         perceptual_weight: 0.75, best_for: ['tech','gaming'],      description: 'Glitch numérique + anomalies temporelles' },
  { name: 'Frozen Lightning',     families: ['DESTRUCTIVE','ENERGY'],    weights: [0.45,0.55],         blend_mode: 'overlay',        perceptual_weight: 0.70, best_for: ['cybersecurity'],      description: 'Cristallisation glaciaire + arcs électriques' },
  { name: 'Dark Prism',           families: ['DESTRUCTIVE','ATMOSPHERIC'],weights: [0.50,0.50],        blend_mode: 'multiplicative', perceptual_weight: 0.60, best_for: ['cinema','creative'],  description: 'Réfraction sombre dans l\'atmosphère' },
  // ── Fluide + Atmosphérique ───────────────────────────────────────────────
  { name: 'Silk Cloud',           families: ['FLUID','ATMOSPHERIC'],     weights: [0.55,0.45],         blend_mode: 'overlay',        perceptual_weight: 0.25, best_for: ['luxe','mode','A'],    description: 'Soie liquide + nuage atmosphérique' },
  { name: 'Aqua Mist',            families: ['FLUID','ATMOSPHERIC'],     weights: [0.60,0.40],         blend_mode: 'screen',         perceptual_weight: 0.30, best_for: ['wellness','C'],       description: 'Eau nébuleuse + brume légère' },
  { name: 'Mercury Flow',         families: ['FLUID','DIMENSIONAL'],     weights: [0.65,0.35],         blend_mode: 'additive',       perceptual_weight: 0.50, best_for: ['luxe','finance'],     description: 'Mercure liquide + morphing dimensionnel' },
  { name: 'Phantom Wave',         families: ['FLUID','TEMPORAL'],        weights: [0.55,0.45],         blend_mode: 'overlay',        perceptual_weight: 0.45, best_for: ['C','creative'],       description: 'Vagues fantômes avec traces temporelles' },
  { name: 'Oil Prism',            families: ['FLUID','DIMENSIONAL'],     weights: [0.50,0.50],         blend_mode: 'multiplicative', perceptual_weight: 0.55, best_for: ['mode','luxe'],        description: 'Huile irisée avec profondeur dimensionnelle' },
  // ── Organique + Énergie ──────────────────────────────────────────────────
  { name: 'Bio-Electric',         families: ['ORGANIC','ENERGY'],        weights: [0.55,0.45],         blend_mode: 'additive',       perceptual_weight: 0.55, best_for: ['biotech','medical'],  description: 'Potentiel d\'action biologique + énergie électrique' },
  { name: 'Auric Pulse',          families: ['ORGANIC','ENERGY'],        weights: [0.60,0.40],         blend_mode: 'screen',         perceptual_weight: 0.45, best_for: ['wellness','B'],       description: 'Aura organique pulsée par l\'énergie' },
  { name: 'Life Force',           families: ['ORGANIC','PARTICLE'],      weights: [0.65,0.35],         blend_mode: 'overlay',        perceptual_weight: 0.40, best_for: ['wellness','A'],       description: 'Force vitale + particules de lumière' },
  { name: 'DNA Spark',            families: ['ORGANIC','ENERGY','PARTICLE'],weights: [0.45,0.30,0.25], blend_mode: 'additive',      perceptual_weight: 0.65, best_for: ['biotech','tech'],     description: 'Hélice ADN électrifiée avec particules' },
  { name: 'Bioluminescence',      families: ['ORGANIC','ATMOSPHERIC'],   weights: [0.60,0.40],         blend_mode: 'screen',         perceptual_weight: 0.35, best_for: ['biotech','C'],        description: 'Bioluminescence naturelle dans l\'obscurité' },
  // ── Particule + Atmosphérique ─────────────────────────────────────────────
  { name: 'Cosmic Veil',          families: ['PARTICLE','ATMOSPHERIC'],  weights: [0.55,0.45],         blend_mode: 'screen',         perceptual_weight: 0.35, best_for: ['C','luxe'],          description: 'Poussière cosmique + voile atmosphérique' },
  { name: 'Stardust Mist',        families: ['PARTICLE','FLUID'],        weights: [0.60,0.40],         blend_mode: 'overlay',        perceptual_weight: 0.45, best_for: ['creative','C'],       description: 'Étoiles tombantes dans un brouillard aqueux' },
  { name: 'Galaxy Drift',         families: ['PARTICLE','TEMPORAL'],     weights: [0.55,0.45],         blend_mode: 'additive',       perceptual_weight: 0.50, best_for: ['tech','scaleup'],     description: 'Dérive galactique avec distorsion temporelle' },
  { name: 'Aurora Bloom',         families: ['PARTICLE','ATMOSPHERIC','ENERGY'],weights:[0.40,0.35,0.25],blend_mode: 'screen',      perceptual_weight: 0.55, best_for: ['luxe','A'],          description: 'Aurora boréale — particules + atmosphère + énergie' },
  { name: 'Micro Nova',           families: ['PARTICLE','DESTRUCTIVE'],  weights: [0.45,0.55],         blend_mode: 'additive',       perceptual_weight: 0.80, best_for: ['gaming','D'],         description: 'Micro-explosion stellaire percutante' },
  // ── Dimensionnel + Organique ──────────────────────────────────────────────
  { name: 'Living Hologram',      families: ['DIMENSIONAL','ORGANIC'],   weights: [0.55,0.45],         blend_mode: 'overlay',        perceptual_weight: 0.55, best_for: ['tech','B'],           description: 'Hologramme organique respirant' },
  { name: 'Gravity Garden',       families: ['DIMENSIONAL','ORGANIC'],   weights: [0.50,0.50],         blend_mode: 'multiplicative', perceptual_weight: 0.40, best_for: ['wellness','greentech'],description: 'Gravité inversée + croissance naturelle' },
  { name: 'Shadow Life',          families: ['ATMOSPHERIC','ORGANIC'],   weights: [0.55,0.45],         blend_mode: 'screen',         perceptual_weight: 0.35, best_for: ['A','corporate'],      description: 'Ombres vivantes + aura organique' },
  // ── 3+ familles (recettes complexes) ─────────────────────────────────────
  { name: 'God Particle',         families: ['PARTICLE','ENERGY','TEMPORAL'],weights:[0.40,0.35,0.25], blend_mode: 'screen',         perceptual_weight: 0.90, best_for: ['D','creative'],       description: 'Particule divine — fusion ultime 3 familles' },
  { name: 'Quantum Soul',         families: ['TEMPORAL','ORGANIC','ENERGY'],weights:[0.40,0.35,0.25],  blend_mode: 'additive',       perceptual_weight: 0.70, best_for: ['wellness','A'],       description: 'Âme quantique — temps + nature + énergie' },
  { name: 'Digital Nature',       families: ['ENERGY','ORGANIC','FLUID'],weights:[0.40,0.35,0.25],     blend_mode: 'overlay',        perceptual_weight: 0.65, best_for: ['greentech','edtech'], description: 'Nature numérique — technologie et biologie fusionnées' },
  { name: 'Mythic Storm',         families: ['DESTRUCTIVE','ENERGY','PARTICLE'],weights:[0.45,0.30,0.25],blend_mode:'multiplicative', perceptual_weight: 0.95, best_for: ['D','gaming'],        description: 'Tempête mythique — destruction + énergie + particules' },
  { name: 'Zen Pulse',            families: ['ORGANIC','ATMOSPHERIC','FLUID'],weights:[0.45,0.30,0.25], blend_mode: 'screen',        perceptual_weight: 0.20, best_for: ['wellness','A'],       description: 'Zen pulsé — minimalisme absolu 3 familles douces' },
  { name: 'Cyber Dream',          families: ['DIMENSIONAL','ENERGY','TEMPORAL'],weights:[0.40,0.35,0.25],blend_mode:'overlay',       perceptual_weight: 0.75, best_for: ['tech','gaming'],      description: 'Rêve cybernétique — 3D + énergie + distorsion temporelle' },
  { name: 'Primal Force',         families: ['ORGANIC','DESTRUCTIVE','ENERGY'],weights:[0.35,0.35,0.30],blend_mode:'additive',       perceptual_weight: 0.85, best_for: ['sport','esport'],     description: 'Force primale — nature + destruction + énergie brute' },
  { name: 'Cosmos Genesis',       families: ['PARTICLE','TEMPORAL','DIMENSIONAL'],weights:[0.40,0.30,0.30],blend_mode:'screen',      perceptual_weight: 0.80, best_for: ['creative','D'],       description: 'Genèse cosmique — création de l\'univers en 3D temporel' },
];

// ─── Compatibilité de fusion ──────────────────────────────────────────────────

const FUSION_COMPATIBILITY: Record<string, Record<string, number>> = {
  PARTICLE:    { PARTICLE: 0.9, ENERGY: 0.8, FLUID: 0.5, TEMPORAL: 0.6, DIMENSIONAL: 0.4, ORGANIC: 0.7, DESTRUCTIVE: 0.6, ATMOSPHERIC: 0.5 },
  ENERGY:      { PARTICLE: 0.8, ENERGY: 0.9, FLUID: 0.4, TEMPORAL: 0.7, DIMENSIONAL: 0.6, ORGANIC: 0.5, DESTRUCTIVE: 0.7, ATMOSPHERIC: 0.4 },
  FLUID:       { PARTICLE: 0.5, ENERGY: 0.4, FLUID: 0.9, TEMPORAL: 0.5, DIMENSIONAL: 0.5, ORGANIC: 0.8, DESTRUCTIVE: 0.3, ATMOSPHERIC: 0.7 },
  TEMPORAL:    { PARTICLE: 0.6, ENERGY: 0.7, FLUID: 0.5, TEMPORAL: 0.9, DIMENSIONAL: 0.8, ORGANIC: 0.4, DESTRUCTIVE: 0.5, ATMOSPHERIC: 0.6 },
  DIMENSIONAL: { PARTICLE: 0.4, ENERGY: 0.6, FLUID: 0.5, TEMPORAL: 0.8, DIMENSIONAL: 0.9, ORGANIC: 0.3, DESTRUCTIVE: 0.4, ATMOSPHERIC: 0.7 },
  ORGANIC:     { PARTICLE: 0.7, ENERGY: 0.5, FLUID: 0.8, TEMPORAL: 0.4, DIMENSIONAL: 0.3, ORGANIC: 0.9, DESTRUCTIVE: 0.2, ATMOSPHERIC: 0.6 },
  DESTRUCTIVE: { PARTICLE: 0.6, ENERGY: 0.7, FLUID: 0.3, TEMPORAL: 0.5, DIMENSIONAL: 0.4, ORGANIC: 0.2, DESTRUCTIVE: 0.9, ATMOSPHERIC: 0.3 },
  ATMOSPHERIC: { PARTICLE: 0.5, ENERGY: 0.4, FLUID: 0.7, TEMPORAL: 0.6, DIMENSIONAL: 0.7, ORGANIC: 0.6, DESTRUCTIVE: 0.3, ATMOSPHERIC: 0.9 },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FusionRecipe {
  primary_effect:   string;
  primary_weight:   number;
  secondary_blends: Array<{ effect: string; weight: number; family: string }>;
  compatibility:    number;
  blend_mode:       'additive' | 'multiplicative' | 'overlay' | 'screen';
  perceptual_weight: number;
  description:      string;
  template_name?:   string;
  physical_valid:   boolean;
  physical_issues?: string[];
}

export interface FusionResult {
  composition:    ZoneComposition;
  recipes:        Record<string, FusionRecipe>;
  fusion_score:   number;
  hybrid_effects: number;
  perceptual_load: number;   // 0-1 : charge sensorielle globale
}

// ─── Validation physique ──────────────────────────────────────────────────────

/**
 * Vérifie si deux effets sont physiquement incohérents.
 * Retourne les problèmes détectés (liste vide si aucun).
 */
export function validatePhysicalCompatibility(effect1: string, effect2: string): string[] {
  const id1 = effect1.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  const id2 = effect2.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  const issues: string[] = [];

  for (const incompat of PHYSICAL_INCOMPATIBILITIES) {
    const aMatches = id1.includes(incompat.a) || incompat.a.includes(id1.split('_')[0]);
    const bMatches = id2.includes(incompat.b) || incompat.b.includes(id2.split('_')[0]);
    const abSwap   = id2.includes(incompat.a) || id1.includes(incompat.b);

    if ((aMatches && bMatches) || abSwap) {
      issues.push(`Incompatibilité physique : ${incompat.a} + ${incompat.b} — ${incompat.reason}`);
    }
  }

  return issues;
}

// ─── Détection de famille ─────────────────────────────────────────────────────

function detectFamily(effectId: string): string {
  const id = effectId.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  for (const [family, effects] of Object.entries(EFFECT_FAMILIES)) {
    if (effects.some(e => id.includes(e.replace(/_/g, '')) || e.replace(/_/g, '').includes(id.replace(/_/g, '')))) return family;
  }
  if (id.includes('PART') || id.includes('DUST') || id.includes('STAR') || id.includes('SPARK')) return 'PARTICLE';
  if (id.includes('ENER') || id.includes('ELEC') || id.includes('NEON') || id.includes('MAGN'))  return 'ENERGY';
  if (id.includes('LIQ')  || id.includes('WAVE') || id.includes('FLOW') || id.includes('SMOK'))  return 'FLUID';
  if (id.includes('TIME') || id.includes('ECHO') || id.includes('QUANT') || id.includes('PHAS')) return 'TEMPORAL';
  if (id.includes('3D')   || id.includes('DIM')  || id.includes('MIRR') || id.includes('HOLO'))  return 'DIMENSIONAL';
  if (id.includes('BREATH')|| id.includes('HEART')|| id.includes('FLOAT')|| id.includes('DNA'))  return 'ORGANIC';
  if (id.includes('FIRE') || id.includes('ICE')  || id.includes('TORN') || id.includes('GLIT'))  return 'DESTRUCTIVE';
  return 'ATMOSPHERIC';
}

// ─── Sélection de la meilleure recette template ───────────────────────────────

/**
 * Trouve la recette hybride optimale depuis la bibliothèque pour un effet principal donné,
 * en tenant compte du score de complexité du ContentAnalyzer pour ajuster les proportions.
 */
function selectBestTemplate(
  primaryFamily: string,
  variation: VariationKey,
  complexityScore: number = 0.5
): HybridRecipeTemplate | null {
  const candidates = HYBRID_RECIPES.filter(r => {
    const hasPrimary = r.families[0] === primaryFamily || r.families.includes(primaryFamily);
    const notOverloaded = complexityScore < 0.7 || r.perceptual_weight < 0.7;
    const suitableVariation = r.best_for.includes(variation) || r.best_for.some(s => !['A','B','C','D'].includes(s));
    return hasPrimary && notOverloaded && suitableVariation;
  });

  if (candidates.length === 0) return null;

  // Trier par combinaison : poids perceptuel adapté + best_for matching
  return candidates.sort((a, b) => {
    const aMatch = a.best_for.includes(variation) ? 1 : 0;
    const bMatch = b.best_for.includes(variation) ? 1 : 0;
    const aDelta = Math.abs(a.perceptual_weight - complexityScore * 0.8);
    const bDelta = Math.abs(b.perceptual_weight - complexityScore * 0.8);
    return (bMatch - aMatch) || (aDelta - bDelta);
  })[0];
}

// ─── Recette de fusion pour une zone ─────────────────────────────────────────

function buildFusionRecipe(
  primary: ZoneEffectDecision,
  allCompositionEffects: string[],
  variation: VariationKey,
  complexityScore: number
): FusionRecipe {
  const primaryFamily = detectFamily(primary.effet_id);
  const primaryWeight = 0.55 + (primary.intensity * 0.1);

  // Essayer d'utiliser une recette template
  const template = selectBestTemplate(primaryFamily, variation, complexityScore);

  // Trouver les effets compatibles physiquement
  const compatible = allCompositionEffects
    .filter(e => e !== primary.effet_id)
    .map(e => {
      const family = detectFamily(e);
      const compat = FUSION_COMPATIBILITY[primaryFamily]?.[family] ?? 0.5;
      const physIssues = validatePhysicalCompatibility(primary.effet_id, e);
      return { effect: e, family, compat, physIssues };
    })
    .filter(e => e.compat > 0.45 && e.physIssues.length === 0)  // Exclure les incompatibles physiques
    .sort((a, b) => b.compat - a.compat)
    .slice(0, template ? template.families.length - 1 : 2);

  // Adapter les poids selon la complexité (ContentAnalyzer)
  const adaptedPrimaryWeight = complexityScore > 0.7
    ? Math.min(0.80, primaryWeight + 0.10)  // haute complexité → renforcer le primaire
    : primaryWeight;

  const remaining = 1 - adaptedPrimaryWeight;
  const secondaryBlends = compatible.map((c, i) => {
    const templateWeight = template?.weights[i + 1] ?? (i === 0 ? 0.6 : 0.4);
    return { effect: c.effect, weight: remaining * templateWeight, family: c.family };
  });

  // Collecte des problèmes physiques (pour tous les couples de secondaires entre eux)
  const physicalIssues: string[] = [];
  for (let i = 0; i < secondaryBlends.length; i++) {
    for (let j = i + 1; j < secondaryBlends.length; j++) {
      physicalIssues.push(...validatePhysicalCompatibility(secondaryBlends[i].effect, secondaryBlends[j].effect));
    }
  }

  const blendModes: Record<VariationKey, FusionRecipe['blend_mode']> = {
    A: 'overlay', B: 'screen', C: 'additive', D: 'multiplicative',
  };

  const compatScore   = compatible.length > 0
    ? compatible.reduce((s, c) => s + c.compat, 0) / compatible.length
    : 0.6;

  const perceptualWeight = template?.perceptual_weight
    ?? Math.min(0.95, 0.3 + compatible.length * 0.15 + primary.intensity * 0.3);

  return {
    primary_effect:   primary.effet_id,
    primary_weight:   Math.min(0.85, adaptedPrimaryWeight),
    secondary_blends: secondaryBlends,
    compatibility:    compatScore,
    blend_mode:       template?.blend_mode ?? blendModes[variation],
    perceptual_weight: perceptualWeight,
    description:      template
      ? `[${template.name}] ${template.description}`
      : `${primaryFamily}(${(adaptedPrimaryWeight * 100).toFixed(0)}%) ⊕ ${secondaryBlends.map(b => `${b.family}(${(b.weight * 100).toFixed(0)}%)`).join(' + ')}`,
    template_name:    template?.name,
    physical_valid:   physicalIssues.length === 0,
    physical_issues:  physicalIssues.length > 0 ? physicalIssues : undefined,
  };
}

// ─── Application de la fusion ─────────────────────────────────────────────────

function applyFusionToZone(zone: ZoneEffectDecision, recipe: FusionRecipe): ZoneEffectDecision {
  if (recipe.secondary_blends.length === 0) return zone;

  const existingLayers = zone.layers ?? [];
  const fusionLayers: EffectLayer[] = recipe.secondary_blends
    .filter(blend => !existingLayers.some(l => l.effet_id === blend.effect))
    .map((blend) => ({
      effet_id:  blend.effect,
      category:  'secondary',
      intensity: zone.intensity * blend.weight * 0.85,
      speed:     zone.speed,
      color:     zone.color,
      raison:    `Fusion ${recipe.blend_mode}: ${blend.family} @ ${(blend.weight * 100).toFixed(0)}%`,
    }));

  return {
    ...zone,
    layers: [...existingLayers, ...fusionLayers],
    raison: `${zone.raison ?? ''} | ${recipe.description}`,
  };
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function applyEffectFusion(
  composition:     ZoneComposition,
  variation:       VariationKey,
  complexityScore: number = 0.5
): FusionResult {
  const zones        = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const allEffects:  string[] = [];

  zones.forEach(z => {
    const zone = composition[z];
    if (zone?.effet_id) allEffects.push(zone.effet_id);
    zone?.layers?.forEach(l => { if (l.effet_id) allEffects.push(l.effet_id); });
  });
  const uniqueEffects = [...new Set(allEffects)];

  const recipes: Record<string, FusionRecipe> = {};
  const newComposition = { ...composition };
  let hybridCount   = 0;
  let totalCompat   = 0;
  let totalPercept  = 0;

  const fusionZones: Array<typeof zones[number]> = ['logo', 'cta', 'nom', 'fond'];

  zones.forEach(zoneName => {
    const zone = composition[zoneName];
    if (!zone?.effet_id) return;

    if (fusionZones.includes(zoneName as any) && uniqueEffects.length > 1) {
      const recipe = buildFusionRecipe(zone, uniqueEffects, variation, complexityScore);
      recipes[zoneName] = recipe;

      if (!recipe.physical_valid) {
        console.warn(`⚠️ FusionEngine — ${zoneName}: problèmes physiques → ${recipe.physical_issues?.join('; ')}`);
      }

      if (recipe.secondary_blends.length > 0 && recipe.physical_valid) {
        (newComposition as any)[zoneName] = applyFusionToZone(zone, recipe);
        hybridCount++;
        totalCompat  += recipe.compatibility;
        totalPercept += recipe.perceptual_weight;
      }
    }
  });

  const fusionScore    = hybridCount > 0 ? totalCompat  / hybridCount : 0;
  const perceptualLoad = hybridCount > 0 ? totalPercept / hybridCount : 0;

  const templateNames = Object.values(recipes)
    .filter(r => r.template_name)
    .map(r => r.template_name!)
    .join(', ');

  console.log(
    `🔀 Effect Fusion Engine v2 — ${hybridCount} zones hybrides | ` +
    `Score: ${(fusionScore * 100).toFixed(0)}% | Charge: ${(perceptualLoad * 100).toFixed(0)}%` +
    (templateNames ? ` | Recettes: ${templateNames}` : '')
  );

  return {
    composition:     newComposition,
    recipes,
    fusion_score:    parseFloat(fusionScore.toFixed(3)),
    hybrid_effects:  hybridCount,
    perceptual_load: parseFloat(perceptualLoad.toFixed(3)),
  };
}
