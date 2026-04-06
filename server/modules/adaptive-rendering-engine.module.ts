/**
 * ⚡ ADAPTIVE RENDERING ENGINE — Module 10, Priorité 4
 *
 * Sélectionne automatiquement le profil de rendu optimal
 * et adapte la composition en conséquence :
 *
 * Profils disponibles :
 *   Ultra       → Effets maximaux, densité particules 100%, FPS 60
 *   High        → Effets riches, densité 75%, FPS 60
 *   Balanced    → Équilibre performance/qualité, densité 50%, FPS 30
 *   Performance → Effets simplifiés, densité 25%, FPS 30
 *   Low         → Effets minimalistes, densité 10%, FPS 15
 *
 * La sélection automatique est basée sur :
 *   - Le ContentProfile (complexité visuelle)
 *   - Le secteur (luxe = Ultra, finance = Balanced)
 *   - La variation (D = profil plus élevé, A = Balanced)
 *   - Le score de fusion P3 (composition riche → profil plus haut)
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';
import type { ContentProfile } from './content-analyzer.module';
import type { VariationKey } from './variance-engine.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RenderingProfile = 'ultra' | 'high' | 'balanced' | 'performance' | 'low';

export interface ProfileSpec {
  name:              RenderingProfile;
  label:             string;
  max_layers_logo:   number;
  max_layers_zone:   number;
  intensity_cap:     number;
  intensity_floor:   number;
  particle_density:  number;    // 0-1
  target_fps:        number;
  animation_quality: 'full' | 'reduced' | 'minimal';
  complexity_budget: number;    // 0-1
  description:       string;
}

export interface RenderingResult {
  composition:      ZoneComposition;
  profile:          ProfileSpec;
  profile_selected: RenderingProfile;
  auto_selected:    boolean;
  adjustments:      string[];
  performance_score: number;    // 0-1 — score de performance estimé
}

// ─── Définitions des profils ──────────────────────────────────────────────────

export const RENDERING_PROFILES: Record<RenderingProfile, ProfileSpec> = {
  ultra: {
    name:              'ultra',
    label:             '🔥 Ultra',
    max_layers_logo:   8,
    max_layers_zone:   5,
    intensity_cap:     1.0,
    intensity_floor:   0.2,
    particle_density:  1.0,
    target_fps:        60,
    animation_quality: 'full',
    complexity_budget: 1.0,
    description:       'Rendu maximal — toutes les couches actives, densité particules 100%',
  },
  high: {
    name:              'high',
    label:             '⚡ High',
    max_layers_logo:   6,
    max_layers_zone:   4,
    intensity_cap:     0.95,
    intensity_floor:   0.15,
    particle_density:  0.75,
    target_fps:        60,
    animation_quality: 'full',
    complexity_budget: 0.80,
    description:       'Rendu riche — effets complets avec légère réduction de densité',
  },
  balanced: {
    name:              'balanced',
    label:             '⚖️ Balanced',
    max_layers_logo:   4,
    max_layers_zone:   2,
    intensity_cap:     0.85,
    intensity_floor:   0.12,
    particle_density:  0.50,
    target_fps:        30,
    animation_quality: 'reduced',
    complexity_budget: 0.60,
    description:       'Équilibre qualité/performance — couches secondaires écrêtées',
  },
  performance: {
    name:              'performance',
    label:             '🏎️ Performance',
    max_layers_logo:   2,
    max_layers_zone:   1,
    intensity_cap:     0.70,
    intensity_floor:   0.10,
    particle_density:  0.25,
    target_fps:        30,
    animation_quality: 'reduced',
    complexity_budget: 0.35,
    description:       'Mode performance — effets primaires uniquement, animations allégées',
  },
  low: {
    name:              'low',
    label:             '🌿 Low',
    max_layers_logo:   1,
    max_layers_zone:   0,
    intensity_cap:     0.50,
    intensity_floor:   0.08,
    particle_density:  0.10,
    target_fps:        15,
    animation_quality: 'minimal',
    complexity_budget: 0.15,
    description:       'Mode économie — effets minimalistes, zéro couche secondaire',
  },
};

// ─── Sélection automatique du profil ─────────────────────────────────────────

export function selectRenderingProfile(
  content:   ContentProfile,
  variation: VariationKey,
  forcedProfile?: RenderingProfile
): RenderingProfile {
  if (forcedProfile) return forcedProfile;

  // Score composite : complexité + richesse + sector_boost
  const baseScore = (content.visual_complexity * 0.35)
    + (content.content_richness * 0.30)
    + (content.sector_boost * 0.35);

  // Bonus par variation (D est toujours "plus spectaculaire")
  const variationBonus: Record<VariationKey, number> = { A: 0, B: 0.05, C: 0.02, D: 0.15 };
  const total = Math.min(1, baseScore + variationBonus[variation]);

  if (total > 0.80) return 'ultra';
  if (total > 0.62) return 'high';
  if (total > 0.42) return 'balanced';
  if (total > 0.22) return 'performance';
  return 'low';
}

// ─── Application du profil sur la composition ────────────────────────────────

function applyProfileToZone(
  zone:     ZoneEffectDecision,
  zoneName: string,
  spec:     ProfileSpec
): ZoneEffectDecision {
  // Écrêter les couches selon le profil
  const maxLayers = zoneName === 'logo' ? spec.max_layers_logo : spec.max_layers_zone;
  const trimmedLayers = (zone.layers ?? []).slice(0, maxLayers);

  // Calibrer l'intensité dans la plage du profil
  const clampedIntensity = Math.min(spec.intensity_cap, Math.max(spec.intensity_floor, zone.intensity));

  // Annoter pour le renderer SVG
  const densityHint = `density=${(spec.particle_density * 100).toFixed(0)}%`;
  const fpsHint     = `fps=${spec.target_fps}`;
  const qualityHint = `quality=${spec.animation_quality}`;

  return {
    ...zone,
    intensity: clampedIntensity,
    layers:    trimmedLayers,
    raison:    `${zone.raison ?? ''} | Profile ${spec.name}: ${densityHint} ${fpsHint} ${qualityHint}`,
  };
}

// ─── Score de performance ─────────────────────────────────────────────────────

function computePerformanceScore(
  spec:        ProfileSpec,
  composition: ZoneComposition
): number {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];
  const totalLayers = zones.reduce((s, z) => s + ((composition as any)[z]?.layers?.length ?? 0), 0);
  const avgIntensity = zones.reduce((s, z) => s + ((composition as any)[z]?.intensity ?? 0.5), 0) / zones.length;

  // Performance = budget utilisé vs alloué
  const layerUtilization   = 1 - Math.min(1, totalLayers / (spec.max_layers_logo * 2 + spec.max_layers_zone * 5));
  const intensityFit        = 1 - Math.abs(avgIntensity - spec.intensity_cap * 0.75);
  const budgetEfficiency    = spec.complexity_budget;

  return Math.min(1, (layerUtilization * 0.35) + (intensityFit * 0.35) + (budgetEfficiency * 0.30));
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function applyAdaptiveRendering(
  composition:    ZoneComposition,
  content:        ContentProfile,
  variation:      VariationKey,
  forcedProfile?: RenderingProfile
): RenderingResult {
  const profileName   = selectRenderingProfile(content, variation, forcedProfile);
  const spec          = RENDERING_PROFILES[profileName];
  const autoSelected  = !forcedProfile;

  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const result = { ...composition };
  const adjustments: string[] = [];

  zones.forEach(zoneName => {
    const zone = composition[zoneName];
    if (!zone?.effet_id) return;

    const adapted = applyProfileToZone(zone, zoneName, spec);
    (result as any)[zoneName] = adapted;

    // Logger les ajustements significatifs
    if (Math.abs(adapted.intensity - zone.intensity) > 0.05) {
      adjustments.push(`${zoneName}: intensité ${zone.intensity.toFixed(2)}→${adapted.intensity.toFixed(2)}`);
    }
    const removedLayers = (zone.layers?.length ?? 0) - (adapted.layers?.length ?? 0);
    if (removedLayers > 0) {
      adjustments.push(`${zoneName}: ${removedLayers} couche(s) écrêtée(s)`);
    }
  });

  const perfScore = computePerformanceScore(spec, result);

  if (adjustments.length === 0) {
    adjustments.push(`Composition compatible profil ${spec.name} — aucun ajustement nécessaire`);
  }

  return {
    composition:       result,
    profile:           spec,
    profile_selected:  profileName,
    auto_selected:     autoSelected,
    adjustments,
    performance_score: perfScore,
  };
}
