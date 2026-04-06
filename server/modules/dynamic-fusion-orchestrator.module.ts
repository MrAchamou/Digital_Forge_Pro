/**
 * 🎛️ DYNAMIC FUSION ORCHESTRATOR — Module 7, Priorité 3
 *
 * Chef d'orchestre central du pipeline de fusion :
 * - Décompose l'essence d'un effet (ADN animatoire) par zone
 * - Analyse la compatibilité de tous les modules actifs
 * - Crée un blueprint de fusion multi-couche
 * - Reconstruit l'effet entièrement avec une cohérence globale
 * - Gère les 3 niveaux : Standard / Pro / Ultimate
 *
 * Niveau Standard  → fusion 2 effets max, intensité modérée
 * Niveau Pro       → fusion 3 effets, courbes d'intensité adaptatives
 * Niveau Ultimate  → fusion N effets, synchronisation cross-zones, climax orchestré
 */

import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';
import type { FusionResult } from './effect-fusion-engine.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrchestratorLevel = 'standard' | 'pro' | 'ultimate';

export interface EffectDNA {
  zone:             string;
  effet_id:         string;
  dominant_trait:   string;   // trait animatoire dominant (ex: 'pulsation', 'rotation', 'flux')
  energy_signature: number;   // 0-1 — empreinte énergétique
  temporal_class:   'instant' | 'sustain' | 'cyclic' | 'crescendo';
  motion_axis:      'radial' | 'linear' | 'orbital' | 'chaotic' | 'static';
  layer_dna:        string[];  // IDs des couches secondaires
}

export interface ModuleCompatibility {
  module_a:    string;
  module_b:    string;
  score:       number;   // 0-1
  conflict:    boolean;
  resolution:  'blend' | 'sequence' | 'suppress' | 'amplify';
}

export interface FusionBlueprint {
  variation:        VariationKey;
  level:            OrchestratorLevel;
  zone_dna:         Record<string, EffectDNA>;
  compatibility_matrix: ModuleCompatibility[];
  fusion_sequence:  string[];   // ordre d'application des effets
  intensity_envelope: Record<string, number>;  // enveloppe d'intensité par zone
  cross_zone_links: Array<{ from: string; to: string; sync_type: 'phase' | 'amplitude' | 'delay' }>;
  blueprint_score:  number;    // 0-1
}

export interface OrchestratorResult {
  composition:    ZoneComposition;
  blueprint:      FusionBlueprint;
  level_applied:  OrchestratorLevel;
  enhancements:   string[];
}

// ─── Traits animatoires par effet ────────────────────────────────────────────

const EFFECT_TRAITS: Record<string, { trait: string; temporal: EffectDNA['temporal_class']; axis: EffectDNA['motion_axis'] }> = {
  default:         { trait: 'presence',   temporal: 'cyclic',    axis: 'static'   },
  HEARTBEAT:       { trait: 'pulsation',  temporal: 'cyclic',    axis: 'radial'   },
  BREATHING:       { trait: 'respiration',temporal: 'cyclic',    axis: 'radial'   },
  SOUL_AURA:       { trait: 'aura',       temporal: 'sustain',   axis: 'radial'   },
  FLOAT_DANCE:     { trait: 'levitation', temporal: 'cyclic',    axis: 'orbital'  },
  FLOAT_PHYSICS:   { trait: 'gravite',    temporal: 'sustain',   axis: 'linear'   },
  DNA_BUILD:       { trait: 'construction',temporal:'crescendo', axis: 'orbital'  },
  CRYSTAL_GROW:    { trait: 'croissance', temporal: 'crescendo', axis: 'radial'   },
  ENERGY_FLOW:     { trait: 'flux',       temporal: 'sustain',   axis: 'linear'   },
  ENERGY_IONIZE:   { trait: 'ionisation', temporal: 'instant',   axis: 'radial'   },
  ELECTRIC_FORM:   { trait: 'arc',        temporal: 'instant',   axis: 'chaotic'  },
  ELECTRIC_HOVER:  { trait: 'levitation', temporal: 'sustain',   axis: 'radial'   },
  NEON_GLOW:       { trait: 'luminosite', temporal: 'cyclic',    axis: 'static'   },
  NEURAL_PULSE:    { trait: 'synapse',    temporal: 'cyclic',    axis: 'orbital'  },
  MAGNETIC_FIELD:  { trait: 'attraction', temporal: 'sustain',   axis: 'radial'   },
  MAGNETIC_PULL:   { trait: 'traction',   temporal: 'crescendo', axis: 'linear'   },
  LIQUID_MORPH:    { trait: 'metamorphose',temporal:'crescendo', axis: 'chaotic'  },
  WAVE_DISTORTION: { trait: 'onde',       temporal: 'cyclic',    axis: 'linear'   },
  WAVE_DISSOLVE:   { trait: 'dissolution',temporal: 'crescendo', axis: 'linear'   },
  TIME_ECHO:       { trait: 'echo',       temporal: 'cyclic',    axis: 'orbital'  },
  TIME_REWIND:     { trait: 'regression', temporal: 'cyclic',    axis: 'radial'   },
  QUANTUM_PHASE:   { trait: 'phase',      temporal: 'instant',   axis: 'chaotic'  },
  QUANTUM_SPLIT:   { trait: 'superposition',temporal:'instant',  axis: 'orbital'  },
  MORPH_3D:        { trait: 'dimension',  temporal: 'crescendo', axis: 'orbital'  },
  ROTATION_3D:     { trait: 'rotation',   temporal: 'cyclic',    axis: 'orbital'  },
  HOLOGRAM:        { trait: 'holographie',temporal: 'cyclic',    axis: 'chaotic'  },
  GRAVITY_REVERSE: { trait: 'antigravite',temporal: 'sustain',   axis: 'radial'   },
  PARTICLE_BUILD:  { trait: 'formation',  temporal: 'crescendo', axis: 'chaotic'  },
  STAR_EXPLOSION:  { trait: 'explosion',  temporal: 'instant',   axis: 'radial'   },
  STELLAR_DRIFT:   { trait: 'derive',     temporal: 'sustain',   axis: 'linear'   },
  FIRE_CONSUME:    { trait: 'combustion', temporal: 'crescendo', axis: 'chaotic'  },
  TORNADO_SPIN:    { trait: 'vortex',     temporal: 'cyclic',    axis: 'orbital'  },
  GLITCH_SPAWN:    { trait: 'erreur',     temporal: 'instant',   axis: 'chaotic'  },
  REALITY_GLITCH:  { trait: 'dysfonction',temporal: 'instant',   axis: 'chaotic'  },
  PRISM_SPLIT:     { trait: 'refraction', temporal: 'crescendo', axis: 'radial'   },
  SHADOW_CLONE:    { trait: 'ombre',      temporal: 'sustain',   axis: 'linear'   },
  PENDULUM_SWING:  { trait: 'oscillation',temporal: 'cyclic',    axis: 'linear'   },
  ORBIT_DANCE:     { trait: 'orbite',     temporal: 'cyclic',    axis: 'orbital'  },
};

// ─── Limites par niveau ───────────────────────────────────────────────────────

const LEVEL_CAPS: Record<OrchestratorLevel, {
  max_layers_logo:  number;
  max_layers_zone:  number;
  max_cross_links:  number;
  intensity_boost:  number;   // multiplicateur max
  allow_climax:     boolean;
}> = {
  standard: { max_layers_logo: 3, max_layers_zone: 2, max_cross_links: 1, intensity_boost: 1.1, allow_climax: false },
  pro:      { max_layers_logo: 5, max_layers_zone: 3, max_cross_links: 3, intensity_boost: 1.2, allow_climax: true  },
  ultimate: { max_layers_logo: 7, max_layers_zone: 4, max_cross_links: 6, intensity_boost: 1.35,allow_climax: true  },
};

// ─── Détection du trait animatoire ───────────────────────────────────────────

function getEffectTrait(effectId: string): typeof EFFECT_TRAITS[string] {
  const id = effectId.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  // Cherche une correspondance exacte ou partielle
  for (const [key, trait] of Object.entries(EFFECT_TRAITS)) {
    if (id === key || id.startsWith(key) || key.startsWith(id.split('_')[0])) {
      return trait;
    }
  }
  return EFFECT_TRAITS.default;
}

// ─── Encodage ADN d'une zone ──────────────────────────────────────────────────

function encodeZoneDNA(zoneName: string, zone: ZoneEffectDecision): EffectDNA {
  const trait = getEffectTrait(zone.effet_id);
  const energySig = zone.intensity * (zone.speed === 'fast' ? 1.2 : zone.speed === 'slow' ? 0.7 : 1.0);

  return {
    zone:             zoneName,
    effet_id:         zone.effet_id,
    dominant_trait:   trait.trait,
    energy_signature: Math.min(1, energySig),
    temporal_class:   trait.temporal,
    motion_axis:      trait.axis,
    layer_dna:        zone.layers?.map(l => l.effet_id) ?? [],
  };
}

// ─── Matrice de compatibilité ─────────────────────────────────────────────────

function buildCompatibilityMatrix(dnas: Record<string, EffectDNA>): ModuleCompatibility[] {
  const zoneNames = Object.keys(dnas);
  const matrix: ModuleCompatibility[] = [];

  for (let i = 0; i < zoneNames.length; i++) {
    for (let j = i + 1; j < zoneNames.length; j++) {
      const a = dnas[zoneNames[i]];
      const b = dnas[zoneNames[j]];

      // Score basé sur la compatibilité des axes et classes temporelles
      let score = 0.5;

      // Même axe = bonne cohérence
      if (a.motion_axis === b.motion_axis) score += 0.2;

      // Complémentarité temporelle
      const temporalPairs: Record<string, string> = {
        instant: 'sustain', sustain: 'cyclic', cyclic: 'crescendo', crescendo: 'instant',
      };
      if (temporalPairs[a.temporal_class] === b.temporal_class) score += 0.15;

      // Similitude des traits = conflit potentiel sur la même zone
      const conflict = a.dominant_trait === b.dominant_trait && Math.abs(a.energy_signature - b.energy_signature) < 0.1;
      if (conflict) score -= 0.3;

      // Énergie complémentaire (l'un intense, l'autre doux)
      if (Math.abs(a.energy_signature - b.energy_signature) > 0.3) score += 0.1;

      score = Math.max(0, Math.min(1, score));

      const resolution: ModuleCompatibility['resolution'] =
        conflict               ? 'suppress'  :
        score > 0.75           ? 'amplify'   :
        score > 0.55           ? 'blend'     : 'sequence';

      matrix.push({
        module_a:   zoneNames[i],
        module_b:   zoneNames[j],
        score,
        conflict,
        resolution,
      });
    }
  }

  return matrix;
}

// ─── Liens cross-zones ────────────────────────────────────────────────────────

function buildCrossZoneLinks(
  dnas: Record<string, EffectDNA>,
  matrix: ModuleCompatibility[],
  caps: typeof LEVEL_CAPS[OrchestratorLevel]
): FusionBlueprint['cross_zone_links'] {
  const links: FusionBlueprint['cross_zone_links'] = [];

  // Logo → CTA est toujours le lien prioritaire
  if (dnas.logo && dnas.cta) {
    const logoEnergy  = dnas.logo.energy_signature;
    const ctaEnergy   = dnas.cta.energy_signature;
    links.push({
      from:      'logo',
      to:        'cta',
      sync_type: logoEnergy > ctaEnergy ? 'amplitude' : 'phase',
    });
  }

  // Ajouter d'autres liens selon le niveau
  const highScorePairs = matrix
    .filter(m => m.score > 0.7 && !m.conflict && m.resolution === 'amplify')
    .slice(0, caps.max_cross_links - 1);

  highScorePairs.forEach(pair => {
    if (links.length >= caps.max_cross_links) return;
    links.push({
      from:      pair.module_a,
      to:        pair.module_b,
      sync_type: 'delay',
    });
  });

  return links;
}

// ─── Enveloppe d'intensité orchestrée ─────────────────────────────────────────

function buildIntensityEnvelope(
  dnas:    Record<string, EffectDNA>,
  links:   FusionBlueprint['cross_zone_links'],
  caps:    typeof LEVEL_CAPS[OrchestratorLevel],
  variation: VariationKey
): Record<string, number> {
  const envelope: Record<string, number> = {};

  // Profils d'intensité par variation (cohérents avec VarianceEngine)
  const profiles: Record<VariationKey, Record<string, number>> = {
    A: { logo: 0.70, nom: 0.50, titre: 0.30, contact: 0.20, separateur: 0.40, fond: 0.30, cta: 0.55 },
    B: { logo: 0.85, nom: 0.60, titre: 0.35, contact: 0.25, separateur: 0.50, fond: 0.35, cta: 0.70 },
    C: { logo: 0.75, nom: 0.55, titre: 0.30, contact: 0.20, separateur: 0.40, fond: 0.45, cta: 0.60 },
    D: { logo: 0.95, nom: 0.80, titre: 0.40, contact: 0.30, separateur: 0.65, fond: 0.50, cta: 0.85 },
  };

  const baseProfile = profiles[variation];

  Object.keys(dnas).forEach(zone => {
    let intensity = baseProfile[zone] ?? 0.5;
    const dna     = dnas[zone];

    // Boost selon la classe temporelle (crescendo = plus d'impact)
    if (dna.temporal_class === 'crescendo') intensity = Math.min(1, intensity * caps.intensity_boost);
    if (dna.temporal_class === 'instant')   intensity = Math.min(1, intensity * (caps.intensity_boost * 0.9));

    // Boost si la zone est source d'un lien cross-zone
    const isLinkedSource = links.some(l => l.from === zone);
    if (isLinkedSource) intensity = Math.min(1, intensity * 1.05);

    envelope[zone] = intensity;
  });

  return envelope;
}

// ─── Application du blueprint sur la composition ─────────────────────────────

function applyBlueprintToComposition(
  composition: ZoneComposition,
  blueprint:   FusionBlueprint
): ZoneComposition {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const result = { ...composition };

  zones.forEach(zoneName => {
    const zone     = composition[zoneName];
    const envelope = blueprint.intensity_envelope[zoneName];
    if (!zone || envelope === undefined) return;

    // Recalibrer l'intensité selon l'enveloppe orchestrée
    const caps       = LEVEL_CAPS[blueprint.level];
    const maxLayers  = zoneName === 'logo' ? caps.max_layers_logo : caps.max_layers_zone;
    const trimmedLayers = zone.layers?.slice(0, maxLayers - 1) ?? [];

    (result as any)[zoneName] = {
      ...zone,
      intensity: Math.min(1, Math.max(0.1, envelope)),
      layers:    trimmedLayers,
      raison:    `${zone.raison ?? ''} | Orchestration ${blueprint.level}: envelope=${envelope.toFixed(2)}`,
    };
  });

  return result;
}

// ─── Sélection automatique du niveau ─────────────────────────────────────────

function detectLevel(
  composition: ZoneComposition,
  fusionResult: FusionResult
): OrchestratorLevel {
  const totalLayers = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta']
    .reduce((sum, z) => sum + ((composition as any)[z]?.layers?.length ?? 0), 0);

  const avgIntensity = ['logo', 'nom', 'cta']
    .reduce((sum, z) => sum + ((composition as any)[z]?.intensity ?? 0.5), 0) / 3;

  if (fusionResult.fusion_score > 0.75 && avgIntensity > 0.7 && totalLayers > 8)  return 'ultimate';
  if (fusionResult.fusion_score > 0.55 && totalLayers > 4)                         return 'pro';
  return 'standard';
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function orchestrateFusion(
  composition:  ZoneComposition,
  fusionResult: FusionResult,
  variation:    VariationKey,
  levelOverride?: OrchestratorLevel
): OrchestratorResult {
  const level = levelOverride ?? detectLevel(composition, fusionResult);
  const caps  = LEVEL_CAPS[level];
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

  // 1. Encoder l'ADN de chaque zone
  const zoneDNA: Record<string, EffectDNA> = {};
  zones.forEach(z => {
    const zone = composition[z];
    if (zone?.effet_id) zoneDNA[z] = encodeZoneDNA(z, zone);
  });

  // 2. Construire la matrice de compatibilité
  const matrix = buildCompatibilityMatrix(zoneDNA);

  // 3. Séquence de fusion optimale
  const fusionSequence = zones
    .filter(z => zoneDNA[z])
    .sort((a, b) => {
      const energyA = zoneDNA[a]?.energy_signature ?? 0;
      const energyB = zoneDNA[b]?.energy_signature ?? 0;
      return energyB - energyA;
    });

  // 4. Liens cross-zones
  const crossLinks = buildCrossZoneLinks(zoneDNA, matrix, caps);

  // 5. Enveloppe d'intensité
  const intensityEnvelope = buildIntensityEnvelope(zoneDNA, crossLinks, caps, variation);

  // 6. Score du blueprint
  const blueprintScore = matrix.reduce((s, m) => s + m.score, 0) / Math.max(1, matrix.length);

  const blueprint: FusionBlueprint = {
    variation,
    level,
    zone_dna:             zoneDNA,
    compatibility_matrix: matrix,
    fusion_sequence:      fusionSequence,
    intensity_envelope:   intensityEnvelope,
    cross_zone_links:     crossLinks,
    blueprint_score:      blueprintScore,
  };

  // 7. Appliquer le blueprint sur la composition
  const orchestratedComposition = applyBlueprintToComposition(fusionResult.composition, blueprint);

  const enhancements = [
    `Niveau ${level} — ${fusionSequence.length} zones orchestrées`,
    `Matrice compatibilité: ${matrix.filter(m => !m.conflict).length}/${matrix.length} pairs compatibles`,
    `${crossLinks.length} liens cross-zones actifs`,
    `Enveloppe d'intensité: logo=${intensityEnvelope.logo?.toFixed(2) ?? 'n/a'} | cta=${intensityEnvelope.cta?.toFixed(2) ?? 'n/a'}`,
    `Blueprint score: ${(blueprintScore * 100).toFixed(1)}%`,
  ];

  return {
    composition:   orchestratedComposition,
    blueprint,
    level_applied: level,
    enhancements,
  };
}
