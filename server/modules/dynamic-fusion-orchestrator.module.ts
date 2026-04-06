/**
 * 🎛️ DYNAMIC FUSION ORCHESTRATOR — v2.0
 *
 * - Blueprint 4D : axes X (zone), Y (couche), Z (intensité), T (axe temporel)
 * - Matrice de compatibilité avec scores décimaux précis (2 décimales)
 * - Export JSON du blueprint pour réutilisation comme preset
 * - Détection des conflits visuels entre zones adjacentes (ex: logo + nom)
 */

import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';
import type { FusionResult } from './effect-fusion-engine.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrchestratorLevel = 'standard' | 'pro' | 'ultimate';

export interface EffectDNA {
  zone:             string;
  effet_id:         string;
  dominant_trait:   string;
  energy_signature: number;
  temporal_class:   'instant' | 'sustain' | 'cyclic' | 'crescendo';
  motion_axis:      'radial' | 'linear' | 'orbital' | 'chaotic' | 'static';
  layer_dna:        string[];
}

export interface ModuleCompatibility {
  module_a:   string;
  module_b:   string;
  score:      number;   // 2 décimales précises
  conflict:   boolean;
  resolution: 'blend' | 'sequence' | 'suppress' | 'amplify';
  /** Explication textuelle du score */
  rationale:  string;
  /** Conflits visuels détectés si zones adjacentes */
  visual_conflict?: string;
}

export interface TemporalAxis {
  /** Phase de démarrage relative (0-1) dans le cycle */
  phase_start:    number;
  /** Durée relative (0-1) dans le cycle */
  phase_duration: number;
  /** Accélération temporelle (+1 = plus vite, -1 = ralentir) */
  tempo_drift:    number;
  /** Pattern d'intensité dans le temps */
  intensity_curve: 'linear' | 'ease_in' | 'ease_out' | 'bell_curve' | 'pulse';
}

export interface Blueprint4D {
  /** Axe X : positions des zones dans l'espace visuel (0-1) */
  spatial_x:         Record<string, number>;
  /** Axe Y : profondeur de couches (0 = surface, 1 = profond) */
  layer_depth:       Record<string, number>;
  /** Axe Z : intensité orchestrée par zone */
  intensity_z:       Record<string, number>;
  /** Axe T : paramètres temporels par zone */
  temporal_t:        Record<string, TemporalAxis>;
}

export interface AdjacentZoneConflict {
  zone_pair:    string;   // ex: 'logo-nom'
  conflict_type: 'intensity_clash' | 'trait_clash' | 'axis_clash' | 'phase_clash';
  severity:     'low' | 'medium' | 'high';
  description:  string;
  resolution:   string;
}

export interface FusionBlueprint {
  variation:            VariationKey;
  level:                OrchestratorLevel;
  zone_dna:             Record<string, EffectDNA>;
  compatibility_matrix: ModuleCompatibility[];
  fusion_sequence:      string[];
  intensity_envelope:   Record<string, number>;
  cross_zone_links:     Array<{ from: string; to: string; sync_type: 'phase' | 'amplitude' | 'delay' }>;
  blueprint_score:      number;
  blueprint_4d:         Blueprint4D;
  adjacent_conflicts:   AdjacentZoneConflict[];
  /** Timestamp pour identifier le preset */
  created_at:           string;
  /** Version du blueprint */
  version:              '2.0';
}

export interface OrchestratorResult {
  composition:    ZoneComposition;
  blueprint:      FusionBlueprint;
  level_applied:  OrchestratorLevel;
  enhancements:   string[];
  /** JSON exportable du blueprint pour réutilisation comme preset */
  preset_json:    string;
}

// ─── Zones adjacentes dans une signature email ───────────────────────────────

const ADJACENT_ZONE_PAIRS: Array<[string, string]> = [
  ['logo', 'nom'],       // côte à côte en haut
  ['nom', 'titre'],      // verticallement adjacents
  ['titre', 'contact'],  // verticallement adjacents
  ['separateur', 'fond'],// chevauchement potentiel
  ['nom', 'cta'],        // interaction CTA proche du nom
  ['fond', 'logo'],      // fond derrière le logo
];

// ─── Traits animatoires ───────────────────────────────────────────────────────

const EFFECT_TRAITS: Record<string, { trait: string; temporal: EffectDNA['temporal_class']; axis: EffectDNA['motion_axis'] }> = {
  default:          { trait: 'presence',      temporal: 'cyclic',    axis: 'static'  },
  HEARTBEAT:        { trait: 'pulsation',     temporal: 'cyclic',    axis: 'radial'  },
  BREATHING:        { trait: 'respiration',   temporal: 'cyclic',    axis: 'radial'  },
  SOUL_AURA:        { trait: 'aura',          temporal: 'sustain',   axis: 'radial'  },
  FLOAT_DANCE:      { trait: 'levitation',    temporal: 'cyclic',    axis: 'orbital' },
  FLOAT_PHYSICS:    { trait: 'gravite',       temporal: 'sustain',   axis: 'linear'  },
  DNA_BUILD:        { trait: 'construction',  temporal: 'crescendo', axis: 'orbital' },
  CRYSTAL_GROW:     { trait: 'croissance',    temporal: 'crescendo', axis: 'radial'  },
  ENERGY_FLOW:      { trait: 'flux',          temporal: 'sustain',   axis: 'linear'  },
  ENERGY_IONIZE:    { trait: 'ionisation',    temporal: 'instant',   axis: 'radial'  },
  ELECTRIC_FORM:    { trait: 'arc',           temporal: 'instant',   axis: 'chaotic' },
  ELECTRIC_HOVER:   { trait: 'levitation',    temporal: 'sustain',   axis: 'radial'  },
  NEON_GLOW:        { trait: 'luminosite',    temporal: 'cyclic',    axis: 'static'  },
  NEURAL_PULSE:     { trait: 'synapse',       temporal: 'cyclic',    axis: 'orbital' },
  MAGNETIC_FIELD:   { trait: 'attraction',    temporal: 'sustain',   axis: 'radial'  },
  MAGNETIC_PULL:    { trait: 'traction',      temporal: 'crescendo', axis: 'linear'  },
  LIQUID_MORPH:     { trait: 'metamorphose',  temporal: 'crescendo', axis: 'chaotic' },
  WAVE_DISTORTION:  { trait: 'onde',          temporal: 'cyclic',    axis: 'linear'  },
  WAVE_DISSOLVE:    { trait: 'dissolution',   temporal: 'crescendo', axis: 'linear'  },
  TIME_ECHO:        { trait: 'echo',          temporal: 'cyclic',    axis: 'orbital' },
  TIME_REWIND:      { trait: 'regression',    temporal: 'cyclic',    axis: 'radial'  },
  QUANTUM_PHASE:    { trait: 'phase',         temporal: 'instant',   axis: 'chaotic' },
  QUANTUM_SPLIT:    { trait: 'superposition', temporal: 'instant',   axis: 'orbital' },
  MORPH_3D:         { trait: 'dimension',     temporal: 'crescendo', axis: 'orbital' },
  ROTATION_3D:      { trait: 'rotation',      temporal: 'cyclic',    axis: 'orbital' },
  HOLOGRAM:         { trait: 'holographie',   temporal: 'cyclic',    axis: 'chaotic' },
  GRAVITY_REVERSE:  { trait: 'antigravite',   temporal: 'sustain',   axis: 'radial'  },
  PARTICLE_BUILD:   { trait: 'formation',     temporal: 'crescendo', axis: 'chaotic' },
  STAR_EXPLOSION:   { trait: 'explosion',     temporal: 'instant',   axis: 'radial'  },
  STELLAR_DRIFT:    { trait: 'derive',        temporal: 'sustain',   axis: 'linear'  },
  FIRE_CONSUME:     { trait: 'combustion',    temporal: 'crescendo', axis: 'chaotic' },
  TORNADO_SPIN:     { trait: 'vortex',        temporal: 'cyclic',    axis: 'orbital' },
  GLITCH_SPAWN:     { trait: 'erreur',        temporal: 'instant',   axis: 'chaotic' },
  REALITY_GLITCH:   { trait: 'dysfonction',   temporal: 'instant',   axis: 'chaotic' },
  PRISM_SPLIT:      { trait: 'refraction',    temporal: 'crescendo', axis: 'radial'  },
  SHADOW_CLONE:     { trait: 'ombre',         temporal: 'sustain',   axis: 'linear'  },
  PENDULUM_SWING:   { trait: 'oscillation',   temporal: 'cyclic',    axis: 'linear'  },
  ORBIT_DANCE:      { trait: 'orbite',        temporal: 'cyclic',    axis: 'orbital' },
};

// ─── Limites par niveau ───────────────────────────────────────────────────────

const LEVEL_CAPS: Record<OrchestratorLevel, {
  max_layers_logo:  number;
  max_layers_zone:  number;
  max_cross_links:  number;
  intensity_boost:  number;
  allow_climax:     boolean;
}> = {
  standard: { max_layers_logo: 3, max_layers_zone: 2, max_cross_links: 1, intensity_boost: 1.10, allow_climax: false },
  pro:      { max_layers_logo: 5, max_layers_zone: 3, max_cross_links: 3, intensity_boost: 1.20, allow_climax: true  },
  ultimate: { max_layers_logo: 7, max_layers_zone: 4, max_cross_links: 6, intensity_boost: 1.35, allow_climax: true  },
};

// ─── Positions spatiales LTR (axe X) ────────────────────────────────────────

const ZONE_SPATIAL_X: Record<string, number> = {
  logo: 0.10, nom: 0.50, titre: 0.50, contact: 0.50, separateur: 0.50, fond: 0.50, cta: 0.80,
};

// ─── Trait → profondeur de couche (axe Y) ────────────────────────────────────

const TRAIT_LAYER_DEPTH: Record<string, number> = {
  aura: 0.10, fond: 0.15, ombre: 0.20, presence: 0.30, luminosite: 0.40,
  onde: 0.50, rotation: 0.55, orbite: 0.60, pulsation: 0.65, arc: 0.70,
  explosion: 0.85, combustion: 0.90, erreur: 0.95, dysfonction: 0.95,
};

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function getEffectTrait(effectId: string): typeof EFFECT_TRAITS[string] {
  const id = effectId.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  for (const [key, trait] of Object.entries(EFFECT_TRAITS)) {
    if (id === key || id.startsWith(key) || key.startsWith(id.split('_')[0])) return trait;
  }
  return EFFECT_TRAITS.default;
}

function encodeZoneDNA(zoneName: string, zone: ZoneEffectDecision): EffectDNA {
  const trait     = getEffectTrait(zone.effet_id);
  const energySig = zone.intensity * (zone.speed === 'fast' ? 1.2 : zone.speed === 'slow' ? 0.7 : 1.0);
  return {
    zone:             zoneName,
    effet_id:         zone.effet_id,
    dominant_trait:   trait.trait,
    energy_signature: parseFloat(Math.min(1, energySig).toFixed(2)),
    temporal_class:   trait.temporal,
    motion_axis:      trait.axis,
    layer_dna:        zone.layers?.map(l => l.effet_id) ?? [],
  };
}

// ─── Matrice de compatibilité avec scores décimaux précis ────────────────────

function buildCompatibilityMatrix(dnas: Record<string, EffectDNA>): ModuleCompatibility[] {
  const zoneNames = Object.keys(dnas);
  const matrix: ModuleCompatibility[] = [];

  for (let i = 0; i < zoneNames.length; i++) {
    for (let j = i + 1; j < zoneNames.length; j++) {
      const a = dnas[zoneNames[i]];
      const b = dnas[zoneNames[j]];
      const reasons: string[] = [];

      let score = 0.50;

      // Même axe de mouvement = cohérence visuelle (+0.20)
      if (a.motion_axis === b.motion_axis) {
        score += 0.20;
        reasons.push(`même axe (${a.motion_axis})`);
      }

      // Complémentarité temporelle (+0.15)
      const temporalPairs: Record<string, string> = {
        instant: 'sustain', sustain: 'cyclic', cyclic: 'crescendo', crescendo: 'instant',
      };
      if (temporalPairs[a.temporal_class] === b.temporal_class) {
        score += 0.15;
        reasons.push(`complémentarité temporelle (${a.temporal_class}↔${b.temporal_class})`);
      }

      // Même trait = conflit potentiel (-0.30)
      const conflict = a.dominant_trait === b.dominant_trait && Math.abs(a.energy_signature - b.energy_signature) < 0.10;
      if (conflict) {
        score -= 0.30;
        reasons.push(`conflit trait identique (${a.dominant_trait})`);
      }

      // Énergie complémentaire (+0.10)
      if (Math.abs(a.energy_signature - b.energy_signature) > 0.30) {
        score += 0.10;
        reasons.push(`énergie complémentaire (Δ=${Math.abs(a.energy_signature - b.energy_signature).toFixed(2)})`);
      }

      // Mouvement chaotique double = surcharge visuelle (-0.15)
      if (a.motion_axis === 'chaotic' && b.motion_axis === 'chaotic') {
        score -= 0.15;
        reasons.push('double chaos = surcharge');
      }

      score = parseFloat(Math.max(0, Math.min(1, score)).toFixed(2));

      const resolution: ModuleCompatibility['resolution'] =
        conflict     ? 'suppress' :
        score > 0.75 ? 'amplify'  :
        score > 0.55 ? 'blend'    : 'sequence';

      // Détection conflits zones adjacentes
      let visual_conflict: string | undefined;
      const pairKey = `${zoneNames[i]}-${zoneNames[j]}`;
      const isAdjacent = ADJACENT_ZONE_PAIRS.some(([x, y]) => (x === zoneNames[i] && y === zoneNames[j]) || (x === zoneNames[j] && y === zoneNames[i]));
      if (isAdjacent) {
        const bothChaotic    = a.motion_axis === 'chaotic' && b.motion_axis === 'chaotic';
        const bothHighEnergy = a.energy_signature > 0.75 && b.energy_signature > 0.75;
        const bothExplosive  = a.temporal_class === 'instant' && b.temporal_class === 'instant';
        if (bothChaotic)    visual_conflict = `Zones adjacentes ${pairKey} : deux axes chaotiques simultanés`;
        if (bothHighEnergy) visual_conflict = `Zones adjacentes ${pairKey} : surcharge énergétique (>${0.75})`;
        if (bothExplosive)  visual_conflict = `Zones adjacentes ${pairKey} : deux instants visuels simultanés`;
      }

      matrix.push({
        module_a:       zoneNames[i],
        module_b:       zoneNames[j],
        score,
        conflict,
        resolution,
        rationale:      reasons.join(' | ') || 'baseline',
        visual_conflict,
      });
    }
  }

  return matrix;
}

// ─── Détection conflits zones adjacentes ────────────────────────────────────

export function detectAdjacentConflicts(
  dnas: Record<string, EffectDNA>
): AdjacentZoneConflict[] {
  const conflicts: AdjacentZoneConflict[] = [];

  for (const [zoneA, zoneB] of ADJACENT_ZONE_PAIRS) {
    const a = dnas[zoneA];
    const b = dnas[zoneB];
    if (!a || !b) continue;

    const addConflict = (
      type: AdjacentZoneConflict['conflict_type'],
      severity: AdjacentZoneConflict['severity'],
      desc: string,
      res: string
    ) => conflicts.push({ zone_pair: `${zoneA}-${zoneB}`, conflict_type: type, severity, description: desc, resolution: res });

    // Choc d'intensité : les deux zones > 0.80 et adjacentes
    if (a.energy_signature > 0.80 && b.energy_signature > 0.80) {
      addConflict('intensity_clash', 'high',
        `${zoneA}(${a.energy_signature}) et ${zoneB}(${b.energy_signature}) trop intenses en adjacence`,
        `Réduire l'intensité de ${zoneB} à max 0.60`
      );
    }

    // Choc de trait : même trait, zones côte à côte
    if (a.dominant_trait === b.dominant_trait) {
      addConflict('trait_clash', 'medium',
        `Trait "${a.dominant_trait}" répété sur ${zoneA} et ${zoneB}`,
        `Différencier les effets de ${zoneB} (choisir une autre famille)`
      );
    }

    // Choc d'axe : double chaos adjacent
    if (a.motion_axis === 'chaotic' && b.motion_axis === 'chaotic') {
      addConflict('axis_clash', 'high',
        `Double axe chaotique sur ${zoneA}-${zoneB} : confusion visuelle`,
        `Changer ${zoneB} vers un axe linéaire ou radial`
      );
    }

    // Choc de phase : deux instants visuels adjacents
    if (a.temporal_class === 'instant' && b.temporal_class === 'instant') {
      addConflict('phase_clash', 'medium',
        `Deux effets "instant" adjacents (${zoneA}-${zoneB}) créent une compétition visuelle`,
        `Décaler ${zoneB} vers "sustain" ou ajouter un délai`
      );
    }
  }

  return conflicts;
}

// ─── Construction Blueprint 4D ───────────────────────────────────────────────

function buildBlueprint4D(
  dnas:      Record<string, EffectDNA>,
  envelope:  Record<string, number>
): Blueprint4D {
  const spatial_x:   Record<string, number> = {};
  const layer_depth: Record<string, number> = {};
  const intensity_z: Record<string, number> = {};
  const temporal_t:  Record<string, TemporalAxis> = {};

  for (const [zone, dna] of Object.entries(dnas)) {
    // Axe X : position spatiale
    spatial_x[zone] = ZONE_SPATIAL_X[zone] ?? 0.5;

    // Axe Y : profondeur de couche selon le trait
    layer_depth[zone] = TRAIT_LAYER_DEPTH[dna.dominant_trait] ?? 0.5;

    // Axe Z : intensité orchestrée
    intensity_z[zone] = parseFloat((envelope[zone] ?? dna.energy_signature).toFixed(2));

    // Axe T : paramètres temporels
    const phaseStart: Record<EffectDNA['temporal_class'], number> = {
      instant: 0.0, crescendo: 0.0, cyclic: 0.1, sustain: 0.2,
    };
    const phaseLen: Record<EffectDNA['temporal_class'], number> = {
      instant: 0.05, crescendo: 0.50, cyclic: 0.80, sustain: 1.0,
    };
    const intCurve: Record<EffectDNA['temporal_class'], TemporalAxis['intensity_curve']> = {
      instant: 'pulse', crescendo: 'ease_in', cyclic: 'bell_curve', sustain: 'ease_out',
    };

    temporal_t[zone] = {
      phase_start:     phaseStart[dna.temporal_class],
      phase_duration:  phaseLen[dna.temporal_class],
      tempo_drift:     dna.motion_axis === 'chaotic' ? 0.3 : dna.motion_axis === 'orbital' ? 0.1 : 0,
      intensity_curve: intCurve[dna.temporal_class],
    };
  }

  return { spatial_x, layer_depth, intensity_z, temporal_t };
}

// ─── Liens cross-zones ────────────────────────────────────────────────────────

function buildCrossZoneLinks(
  dnas: Record<string, EffectDNA>,
  matrix: ModuleCompatibility[],
  caps: typeof LEVEL_CAPS[OrchestratorLevel]
): FusionBlueprint['cross_zone_links'] {
  const links: FusionBlueprint['cross_zone_links'] = [];

  if (dnas.logo && dnas.cta) {
    links.push({ from: 'logo', to: 'cta', sync_type: dnas.logo.energy_signature > dnas.cta.energy_signature ? 'amplitude' : 'phase' });
  }

  const highScorePairs = matrix
    .filter(m => m.score > 0.70 && !m.conflict && m.resolution === 'amplify' && !m.visual_conflict)
    .sort((a, b) => b.score - a.score)
    .slice(0, caps.max_cross_links - 1);

  for (const pair of highScorePairs) {
    if (links.length >= caps.max_cross_links) break;
    links.push({ from: pair.module_a, to: pair.module_b, sync_type: 'delay' });
  }

  return links;
}

// ─── Enveloppe d'intensité ───────────────────────────────────────────────────

function buildIntensityEnvelope(
  dnas: Record<string, EffectDNA>,
  links: FusionBlueprint['cross_zone_links'],
  caps: typeof LEVEL_CAPS[OrchestratorLevel],
  variation: VariationKey
): Record<string, number> {
  const profiles: Record<VariationKey, Record<string, number>> = {
    A: { logo: 0.70, nom: 0.50, titre: 0.30, contact: 0.20, separateur: 0.40, fond: 0.30, cta: 0.55 },
    B: { logo: 0.85, nom: 0.60, titre: 0.35, contact: 0.25, separateur: 0.50, fond: 0.35, cta: 0.70 },
    C: { logo: 0.75, nom: 0.55, titre: 0.30, contact: 0.20, separateur: 0.40, fond: 0.45, cta: 0.60 },
    D: { logo: 0.95, nom: 0.80, titre: 0.40, contact: 0.30, separateur: 0.65, fond: 0.50, cta: 0.85 },
  };

  const envelope: Record<string, number> = {};
  const base = profiles[variation];

  for (const [zone, dna] of Object.entries(dnas)) {
    let intensity = base[zone] ?? 0.50;
    if (dna.temporal_class === 'crescendo') intensity = Math.min(1, intensity * caps.intensity_boost);
    if (dna.temporal_class === 'instant')   intensity = Math.min(1, intensity * (caps.intensity_boost * 0.90));
    if (links.some(l => l.from === zone))   intensity = Math.min(1, intensity * 1.05);
    envelope[zone] = parseFloat(intensity.toFixed(2));
  }

  return envelope;
}

// ─── Application du blueprint ─────────────────────────────────────────────────

function applyBlueprintToComposition(
  composition: ZoneComposition,
  blueprint:   FusionBlueprint
): ZoneComposition {
  const zones  = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const result = { ...composition };
  const caps   = LEVEL_CAPS[blueprint.level];

  for (const zoneName of zones) {
    const zone     = composition[zoneName];
    const envelope = blueprint.intensity_envelope[zoneName];
    if (!zone || envelope === undefined) continue;

    const maxLayers    = zoneName === 'logo' ? caps.max_layers_logo : caps.max_layers_zone;
    const trimmedLayers = zone.layers?.slice(0, maxLayers - 1) ?? [];

    (result as any)[zoneName] = {
      ...zone,
      intensity: Math.min(1, Math.max(0.1, envelope)),
      layers:    trimmedLayers,
      raison:    `${zone.raison ?? ''} | Orchestration ${blueprint.level}: 4D(x=${blueprint.blueprint_4d.spatial_x[zoneName]?.toFixed(2)},z=${envelope.toFixed(2)})`,
    };
  }

  return result;
}

// ─── Détection automatique du niveau ─────────────────────────────────────────

function detectLevel(composition: ZoneComposition, fusionResult: FusionResult): OrchestratorLevel {
  const totalLayers  = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta']
    .reduce((s, z) => s + ((composition as any)[z]?.layers?.length ?? 0), 0);
  const avgIntensity = ['logo', 'nom', 'cta']
    .reduce((s, z) => s + ((composition as any)[z]?.intensity ?? 0.5), 0) / 3;

  if (fusionResult.fusion_score > 0.75 && avgIntensity > 0.70 && totalLayers > 8) return 'ultimate';
  if (fusionResult.fusion_score > 0.55 && totalLayers > 4)                         return 'pro';
  return 'standard';
}

// ─── Export JSON preset ──────────────────────────────────────────────────────

/**
 * Exporte le blueprint sous forme de JSON compact réutilisable comme preset.
 * Le JSON inclut uniquement les données nécessaires à la reconstruction.
 */
export function exportBlueprintAsPreset(blueprint: FusionBlueprint): string {
  const preset = {
    version:       blueprint.version,
    created_at:    blueprint.created_at,
    variation:     blueprint.variation,
    level:         blueprint.level,
    blueprint_4d:  blueprint.blueprint_4d,
    envelope:      blueprint.intensity_envelope,
    cross_links:   blueprint.cross_zone_links,
    score:         blueprint.blueprint_score,
    conflicts:     blueprint.adjacent_conflicts.filter(c => c.severity !== 'low').length,
  };
  return JSON.stringify(preset, null, 2);
}

/**
 * Recharge un blueprint depuis un JSON preset.
 */
export function loadBlueprintFromPreset(json: string): Partial<FusionBlueprint> {
  const preset = JSON.parse(json);
  return {
    version:            '2.0',
    variation:          preset.variation,
    level:              preset.level,
    blueprint_4d:       preset.blueprint_4d,
    intensity_envelope: preset.envelope,
    cross_zone_links:   preset.cross_links,
    blueprint_score:    preset.score,
    created_at:         preset.created_at,
  };
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function orchestrateFusion(
  composition:    ZoneComposition,
  fusionResult:   FusionResult,
  variation:      VariationKey,
  levelOverride?: OrchestratorLevel
): OrchestratorResult {
  const level  = levelOverride ?? detectLevel(composition, fusionResult);
  const caps   = LEVEL_CAPS[level];
  const zones  = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

  // 1. Encoder l'ADN de chaque zone
  const zoneDNA: Record<string, EffectDNA> = {};
  for (const z of zones) {
    const zone = composition[z];
    if (zone?.effet_id) zoneDNA[z] = encodeZoneDNA(z, zone);
  }

  // 2. Matrice de compatibilité avec scores décimaux précis
  const matrix = buildCompatibilityMatrix(zoneDNA);

  // 3. Séquence de fusion optimale (ordre décroissant d'énergie)
  const fusionSequence = zones
    .filter(z => zoneDNA[z])
    .sort((a, b) => (zoneDNA[b]?.energy_signature ?? 0) - (zoneDNA[a]?.energy_signature ?? 0));

  // 4. Liens cross-zones
  const crossLinks = buildCrossZoneLinks(zoneDNA, matrix, caps);

  // 5. Enveloppe d'intensité
  const intensityEnvelope = buildIntensityEnvelope(zoneDNA, crossLinks, caps, variation);

  // 6. Blueprint 4D
  const blueprint4d = buildBlueprint4D(zoneDNA, intensityEnvelope);

  // 7. Conflits zones adjacentes
  const adjacentConflicts = detectAdjacentConflicts(zoneDNA);
  if (adjacentConflicts.length > 0) {
    adjacentConflicts
      .filter(c => c.severity === 'high')
      .forEach(c => console.warn(`⚠️ Conflit adjacent [${c.zone_pair}]: ${c.description} → ${c.resolution}`));
  }

  // 8. Score global
  const blueprintScore = parseFloat((matrix.reduce((s, m) => s + m.score, 0) / Math.max(1, matrix.length)).toFixed(2));

  const blueprint: FusionBlueprint = {
    variation,
    level,
    zone_dna:             zoneDNA,
    compatibility_matrix: matrix,
    fusion_sequence:      fusionSequence,
    intensity_envelope:   intensityEnvelope,
    cross_zone_links:     crossLinks,
    blueprint_score:      blueprintScore,
    blueprint_4d:         blueprint4d,
    adjacent_conflicts:   adjacentConflicts,
    created_at:           new Date().toISOString(),
    version:              '2.0',
  };

  // 9. Appliquer le blueprint
  const orchestratedComposition = applyBlueprintToComposition(fusionResult.composition, blueprint);

  // 10. Export JSON preset
  const preset_json = exportBlueprintAsPreset(blueprint);

  const highConflicts = adjacentConflicts.filter(c => c.severity === 'high').length;
  const enhancements = [
    `Blueprint 4D v2 [${level}] — ${fusionSequence.length} zones | score: ${(blueprintScore * 100).toFixed(0)}%`,
    `Matrice: ${matrix.filter(m => !m.conflict).length}/${matrix.length} pairs compatibles | ${crossLinks.length} liens cross-zones`,
    highConflicts > 0 ? `⚠️ ${highConflicts} conflits adjacents HIGH détectés` : '✅ Aucun conflit adjacent critique',
    `4D — logo: x=${blueprint4d.spatial_x.logo?.toFixed(2)},z=${blueprint4d.intensity_z.logo?.toFixed(2)} | cta: x=${blueprint4d.spatial_x.cta?.toFixed(2)},z=${blueprint4d.intensity_z.cta?.toFixed(2)}`,
    `Preset JSON exporté (${preset_json.length} bytes)`,
  ];

  console.log(`🎛️ Dynamic Fusion Orchestrator v2 [${variation}/${level}] — ${enhancements[0]}`);

  return {
    composition:   orchestratedComposition,
    blueprint,
    level_applied: level,
    enhancements,
    preset_json,
  };
}
