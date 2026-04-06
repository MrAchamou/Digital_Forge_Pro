/**
 * 🔀 EFFECT FUSION ENGINE — Module 8, Priorité 3
 *
 * Identifie les variantes d'un même effet au sein des 4 variations,
 * crée des "recettes de mélange" hybrides (ex: 40% SWARM + 30% FIREFLIES + 30% COSMIC),
 * et fusionne les algorithmes mathématiquement pour des rendus uniques.
 *
 * Pipeline:
 *   - Détecte les familles d'effets présentes dans une composition
 *   - Calcule les poids de fusion par zone (recette)
 *   - Enrichit les couches (layers) avec les blends hybrides
 *   - Garantit que chaque variation a une "empreinte fusion" unique
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

// ─── Compatibilité de fusion entre familles ──────────────────────────────────

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
  primary_effect:  string;
  primary_weight:  number;   // 0-1
  secondary_blends: Array<{ effect: string; weight: number; family: string }>;
  compatibility:   number;   // 0-1 — score de fusion global
  blend_mode:      'additive' | 'multiplicative' | 'overlay' | 'screen';
  description:     string;
}

export interface FusionResult {
  composition:    ZoneComposition;
  recipes:        Record<string, FusionRecipe>;  // par zone
  fusion_score:   number;                        // 0-1
  hybrid_effects: number;                        // nb zones avec fusion hybride
}

// ─── Détection de famille ─────────────────────────────────────────────────────

function detectFamily(effectId: string): string {
  const id = effectId.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  for (const [family, effects] of Object.entries(EFFECT_FAMILIES)) {
    if (effects.some(e => id.includes(e.replace(/_/g, '')) || e.replace(/_/g, '').includes(id.replace(/_/g, '')))) {
      return family;
    }
  }
  // Matching partiel par mot-clé
  if (id.includes('PART') || id.includes('DUST') || id.includes('STAR') || id.includes('SPARK')) return 'PARTICLE';
  if (id.includes('ENER') || id.includes('ELEC') || id.includes('NEON') || id.includes('MAGN')) return 'ENERGY';
  if (id.includes('LIQ') || id.includes('WAVE') || id.includes('FLOW') || id.includes('SMOK')) return 'FLUID';
  if (id.includes('TIME') || id.includes('ECHO') || id.includes('QUANT') || id.includes('PHAS')) return 'TEMPORAL';
  if (id.includes('3D') || id.includes('DIM') || id.includes('MIRR') || id.includes('HOLO')) return 'DIMENSIONAL';
  if (id.includes('BREATH') || id.includes('HEART') || id.includes('FLOAT') || id.includes('DNA')) return 'ORGANIC';
  if (id.includes('FIRE') || id.includes('ICE') || id.includes('TORN') || id.includes('GLIT')) return 'DESTRUCTIVE';
  return 'ATMOSPHERIC';
}

// ─── Recette de fusion pour une zone ─────────────────────────────────────────

function buildFusionRecipe(
  primary: ZoneEffectDecision,
  allCompositionEffects: string[],
  variation: VariationKey
): FusionRecipe {
  const primaryFamily  = detectFamily(primary.effet_id);
  const primaryWeight  = 0.55 + (primary.intensity * 0.1);

  // Trouver les effets compatibles dans la composition globale
  const compatible = allCompositionEffects
    .filter(e => e !== primary.effet_id)
    .map(e => {
      const family = detectFamily(e);
      const compat = FUSION_COMPATIBILITY[primaryFamily]?.[family] ?? 0.5;
      return { effect: e, family, compat };
    })
    .filter(e => e.compat > 0.45)
    .sort((a, b) => b.compat - a.compat)
    .slice(0, 2);

  // Distribuer les poids restants
  const remaining = 1 - primaryWeight;
  const secondaryBlends = compatible.map((c, i) => ({
    effect:  c.effect,
    weight:  i === 0 ? remaining * 0.6 : remaining * 0.4,
    family:  c.family,
  }));

  // Mode de fusion selon la variation
  const blendModes: Record<VariationKey, FusionRecipe['blend_mode']> = {
    A: 'overlay',
    B: 'screen',
    C: 'additive',
    D: 'multiplicative',
  };

  const compatScore = compatible.length > 0
    ? compatible.reduce((s, c) => s + c.compat, 0) / compatible.length
    : 0.6;

  return {
    primary_effect:  primary.effet_id,
    primary_weight:  Math.min(0.85, primaryWeight),
    secondary_blends: secondaryBlends,
    compatibility:   compatScore,
    blend_mode:      blendModes[variation],
    description:     `${primaryFamily}(${(primaryWeight * 100).toFixed(0)}%) ⊕ ${secondaryBlends.map(b => `${b.family}(${(b.weight * 100).toFixed(0)}%)`).join(' + ')}`,
  };
}

// ─── Enrichissement des layers avec la fusion ─────────────────────────────────

function applyFusionToZone(
  zone: ZoneEffectDecision,
  recipe: FusionRecipe
): ZoneEffectDecision {
  if (recipe.secondary_blends.length === 0) return zone;

  const existingLayers = zone.layers ?? [];

  // Créer les couches de fusion hybride (si elles n'existent pas déjà)
  const fusionLayers: EffectLayer[] = recipe.secondary_blends
    .filter(blend => !existingLayers.some(l => l.effet_id === blend.effect))
    .map((blend, i) => ({
      effet_id:  blend.effect,
      category:  'secondary',
      intensity: zone.intensity * blend.weight * 0.85,
      speed:     zone.speed,
      color:     zone.color,
      raison:    `Fusion ${recipe.blend_mode}: ${blend.family} blend @ ${(blend.weight * 100).toFixed(0)}%`,
    }));

  return {
    ...zone,
    layers: [...existingLayers, ...fusionLayers],
    raison: `${zone.raison ?? ''} | Fusion: ${recipe.description}`,
  };
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function applyEffectFusion(
  composition: ZoneComposition,
  variation: VariationKey
): FusionResult {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

  // Collecter tous les effets présents dans la composition
  const allEffects: string[] = [];
  zones.forEach(z => {
    const zone = composition[z];
    if (zone?.effet_id) allEffects.push(zone.effet_id);
    zone?.layers?.forEach(l => { if (l.effet_id) allEffects.push(l.effet_id); });
  });
  const uniqueEffects = [...new Set(allEffects)];

  const recipes: Record<string, FusionRecipe>  = {};
  const newComposition = { ...composition };
  let hybridCount = 0;
  let totalCompat  = 0;

  // Zones prioritaires pour la fusion (logo, nom, cta ont l'impact WOW)
  const fusionZones: Array<typeof zones[number]> = ['logo', 'cta', 'nom', 'fond'];

  zones.forEach(zoneName => {
    const zone = composition[zoneName];
    if (!zone?.effet_id) return;

    if (fusionZones.includes(zoneName as any) && uniqueEffects.length > 1) {
      const recipe = buildFusionRecipe(zone, uniqueEffects, variation);
      recipes[zoneName] = recipe;

      if (recipe.secondary_blends.length > 0) {
        (newComposition as any)[zoneName] = applyFusionToZone(zone, recipe);
        hybridCount++;
        totalCompat += recipe.compatibility;
      }
    }
  });

  const fusionScore = hybridCount > 0 ? totalCompat / hybridCount : 0;

  return {
    composition: newComposition,
    recipes,
    fusion_score:   fusionScore,
    hybrid_effects: hybridCount,
  };
}
