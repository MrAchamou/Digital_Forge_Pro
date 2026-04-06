/**
 * ⚡ ADAPTIVE RENDERING ENGINE — v2.0
 *
 * - Détection du viewport et du client email pour adapter le profil
 * - Dégradation progressive : si SVG trop lourd, écrêter couche par couche
 * - Profiling SVG en 3 passes : estimation rapide, analyse fine, validation finale
 * - Hooks de métriques temps-réel pour le dashboard AnalyticsModule
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';
import type { ContentProfile } from './content-analyzer.module';
import type { VariationKey } from './variance-engine.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RenderingProfile = 'ultra' | 'high' | 'balanced' | 'performance' | 'low';
export type ClientType = 'gmail' | 'outlook365' | 'outlook_desktop' | 'apple_mail' | 'yahoo' | 'generic';
export type ViewportCategory = 'mobile' | 'tablet' | 'desktop' | 'widescreen';

export interface ProfileSpec {
  name:              RenderingProfile;
  label:             string;
  max_layers_logo:   number;
  max_layers_zone:   number;
  intensity_cap:     number;
  intensity_floor:   number;
  particle_density:  number;
  target_fps:        number;
  animation_quality: 'full' | 'reduced' | 'minimal';
  complexity_budget: number;
  description:       string;
}

export interface ViewportSpec {
  category:        ViewportCategory;
  width_px:        number;
  height_px:       number;
  pixel_density:   number;
  /** Réduit la densité de particules et le nombre de couches */
  rendering_downscale: number;  // 0-1 : 1 = pas de réduction, 0.5 = 50% réduction
}

export interface ClientCapabilities {
  client:               ClientType;
  supports_css_anim:    boolean;
  supports_svg_anim:    boolean;
  supports_filter:      boolean;
  supports_backdrop:    boolean;
  supports_mix_blend:   boolean;
  max_svg_bytes:        number;
  /** Facteur de réduction imposé par ce client (0-1) */
  complexity_penalty:   number;
}

export interface SVGProfile {
  /** Passe 1 : estimation rapide par comptage de couches × intensité */
  estimated_bytes:   number;
  /** Passe 2 : analyse fine avec coefficients par effet */
  refined_bytes:     number;
  /** Passe 3 : validation finale avec overhead DOM/CSS */
  validated_bytes:   number;
  /** Dépasse le seuil critique (50KB) ? */
  exceeds_threshold: boolean;
  /** Nombre de passes de réduction nécessaires (0 = aucune) */
  reduction_passes:  number;
}

export interface RenderingMetrics {
  profile_name:      RenderingProfile;
  client:            ClientType;
  viewport:          ViewportCategory;
  complexity_before: number;
  complexity_after:  number;
  layers_removed:    number;
  intensity_adjustments: number;
  svg_profile:       SVGProfile;
  degradation_steps: string[];
  timestamp:         number;
}

export interface RenderingResult {
  composition:        ZoneComposition;
  profile:            ProfileSpec;
  profile_selected:   RenderingProfile;
  auto_selected:      boolean;
  adjustments:        string[];
  performance_score:  number;
  metrics:            RenderingMetrics;
  client_warnings:    string[];
  viewport_applied:   ViewportSpec;
}

// ─── Profils de rendu ─────────────────────────────────────────────────────────

export const RENDERING_PROFILES: Record<RenderingProfile, ProfileSpec> = {
  ultra: {
    name: 'ultra', label: '🔥 Ultra',
    max_layers_logo: 8, max_layers_zone: 5,
    intensity_cap: 1.0, intensity_floor: 0.20,
    particle_density: 1.0, target_fps: 60,
    animation_quality: 'full', complexity_budget: 1.0,
    description: 'Rendu maximal — toutes les couches actives, densité particules 100%',
  },
  high: {
    name: 'high', label: '⚡ High',
    max_layers_logo: 6, max_layers_zone: 4,
    intensity_cap: 0.95, intensity_floor: 0.15,
    particle_density: 0.75, target_fps: 60,
    animation_quality: 'full', complexity_budget: 0.80,
    description: 'Rendu riche — effets complets avec légère réduction de densité',
  },
  balanced: {
    name: 'balanced', label: '⚖️ Balanced',
    max_layers_logo: 4, max_layers_zone: 2,
    intensity_cap: 0.85, intensity_floor: 0.12,
    particle_density: 0.50, target_fps: 30,
    animation_quality: 'reduced', complexity_budget: 0.60,
    description: 'Équilibre qualité/performance — couches secondaires écrêtées',
  },
  performance: {
    name: 'performance', label: '🏎️ Performance',
    max_layers_logo: 2, max_layers_zone: 1,
    intensity_cap: 0.70, intensity_floor: 0.10,
    particle_density: 0.25, target_fps: 30,
    animation_quality: 'reduced', complexity_budget: 0.35,
    description: 'Mode performance — effets primaires uniquement, animations allégées',
  },
  low: {
    name: 'low', label: '🌿 Low',
    max_layers_logo: 1, max_layers_zone: 0,
    intensity_cap: 0.50, intensity_floor: 0.08,
    particle_density: 0.10, target_fps: 15,
    animation_quality: 'minimal', complexity_budget: 0.15,
    description: 'Mode économie — effets minimalistes, zéro couche secondaire',
  },
};

// ─── Capacités clients email ──────────────────────────────────────────────────

const CLIENT_CAPABILITIES: Record<ClientType, ClientCapabilities> = {
  gmail: {
    client: 'gmail', supports_css_anim: true, supports_svg_anim: true,
    supports_filter: true, supports_backdrop: false, supports_mix_blend: true,
    max_svg_bytes: 100000, complexity_penalty: 0,
  },
  outlook365: {
    client: 'outlook365', supports_css_anim: true, supports_svg_anim: true,
    supports_filter: false, supports_backdrop: false, supports_mix_blend: false,
    max_svg_bytes: 80000, complexity_penalty: 0.10,
  },
  outlook_desktop: {
    client: 'outlook_desktop', supports_css_anim: false, supports_svg_anim: false,
    supports_filter: false, supports_backdrop: false, supports_mix_blend: false,
    max_svg_bytes: 20000, complexity_penalty: 0.60,
  },
  apple_mail: {
    client: 'apple_mail', supports_css_anim: true, supports_svg_anim: true,
    supports_filter: true, supports_backdrop: true, supports_mix_blend: true,
    max_svg_bytes: 200000, complexity_penalty: 0,
  },
  yahoo: {
    client: 'yahoo', supports_css_anim: true, supports_svg_anim: false,
    supports_filter: false, supports_backdrop: false, supports_mix_blend: false,
    max_svg_bytes: 60000, complexity_penalty: 0.20,
  },
  generic: {
    client: 'generic', supports_css_anim: true, supports_svg_anim: true,
    supports_filter: true, supports_backdrop: false, supports_mix_blend: false,
    max_svg_bytes: 80000, complexity_penalty: 0.05,
  },
};

// ─── Spécifications viewport ─────────────────────────────────────────────────

const VIEWPORT_SPECS: Record<ViewportCategory, ViewportSpec> = {
  mobile: {
    category: 'mobile', width_px: 375, height_px: 200,
    pixel_density: 2.0, rendering_downscale: 0.55,
  },
  tablet: {
    category: 'tablet', width_px: 768, height_px: 280,
    pixel_density: 1.5, rendering_downscale: 0.75,
  },
  desktop: {
    category: 'desktop', width_px: 1440, height_px: 220,
    pixel_density: 1.0, rendering_downscale: 1.0,
  },
  widescreen: {
    category: 'widescreen', width_px: 2560, height_px: 220,
    pixel_density: 1.0, rendering_downscale: 1.0,
  },
};

// ─── Hook métriques (observateurs temps-réel) ────────────────────────────────

type MetricsHook = (metrics: RenderingMetrics) => void;
const metricsHooks: MetricsHook[] = [];

export function registerMetricsHook(hook: MetricsHook): void {
  metricsHooks.push(hook);
}

export function unregisterMetricsHook(hook: MetricsHook): void {
  const idx = metricsHooks.indexOf(hook);
  if (idx >= 0) metricsHooks.splice(idx, 1);
}

function emitMetrics(metrics: RenderingMetrics): void {
  for (const hook of metricsHooks) {
    try { hook(metrics); } catch { /* silencieux */ }
  }
}

// ─── Profiling SVG (3 passes) ─────────────────────────────────────────────────

/** Coefficients d'estimation de la taille SVG par effet (bytes par unité d'intensité) */
const EFFECT_SIZE_COEFFICIENTS: Record<string, number> = {
  PARTICLE:    8500,   // beaucoup de paths SVG
  ENERGY:      6200,
  FLUID:       7800,
  TEMPORAL:    5500,
  DIMENSIONAL: 9000,   // transformations 3D complexes
  ORGANIC:     4800,
  DESTRUCTIVE: 9500,   // plus grand nombre d'éléments
  ATMOSPHERIC: 3200,   // léger
};

function getEffectFamily(effectId: string): string {
  const id = (effectId || '').toUpperCase();
  if (id.includes('PART') || id.includes('DUST') || id.includes('STAR') || id.includes('SPARK')) return 'PARTICLE';
  if (id.includes('ENER') || id.includes('ELEC') || id.includes('NEON') || id.includes('MAGN'))  return 'ENERGY';
  if (id.includes('LIQ')  || id.includes('WAVE') || id.includes('FLOW') || id.includes('SMOK'))  return 'FLUID';
  if (id.includes('TIME') || id.includes('ECHO') || id.includes('QUANT') || id.includes('PHAS')) return 'TEMPORAL';
  if (id.includes('3D')   || id.includes('DIM')  || id.includes('MIRR') || id.includes('HOLO'))  return 'DIMENSIONAL';
  if (id.includes('BREATH')|| id.includes('HEART')|| id.includes('FLOAT')|| id.includes('DNA'))  return 'ORGANIC';
  if (id.includes('FIRE') || id.includes('ICE')  || id.includes('TORN') || id.includes('GLIT'))  return 'DESTRUCTIVE';
  return 'ATMOSPHERIC';
}

export function profileSVGSize(composition: ZoneComposition): SVGProfile {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const SVG_SIZE_THRESHOLD = 50000;  // 50 KB
  const DOM_OVERHEAD = 1.25;         // 25% overhead DOM/CSS

  // Passe 1 : estimation rapide
  let estimatedBytes = 2000;  // structure SVG de base
  for (const zone of zones) {
    const decision = (composition as any)[zone] as ZoneEffectDecision | undefined;
    if (!decision?.effet_id) continue;
    const family = getEffectFamily(decision.effet_id);
    const coeff  = EFFECT_SIZE_COEFFICIENTS[family] ?? 5000;
    estimatedBytes += coeff * decision.intensity * (1 + (decision.layers?.length ?? 0) * 0.4);
  }

  // Passe 2 : analyse fine par zone
  let refinedBytes = 2000;
  for (const zone of zones) {
    const decision = (composition as any)[zone] as ZoneEffectDecision | undefined;
    if (!decision?.effet_id) continue;
    const family  = getEffectFamily(decision.effet_id);
    const coeff   = EFFECT_SIZE_COEFFICIENTS[family] ?? 5000;
    const layerCt = decision.layers?.length ?? 0;

    // La vitesse influe sur le nombre de keyframes (fast = plus lourd)
    const speedMult = decision.speed === 'fast' ? 1.4 : decision.speed === 'slow' ? 0.8 : 1.0;

    refinedBytes += coeff * decision.intensity * speedMult;
    if (layerCt > 0) {
      refinedBytes += decision.layers!.reduce((s, l) => s + coeff * (l.intensity ?? 0.5) * 0.6, 0);
    }
  }

  // Passe 3 : validation finale avec overhead DOM/CSS
  const validatedBytes = Math.round(refinedBytes * DOM_OVERHEAD);

  const exceeds     = validatedBytes > SVG_SIZE_THRESHOLD;
  const overload    = validatedBytes / SVG_SIZE_THRESHOLD;
  const redPasses   = exceeds ? Math.ceil(Math.log2(overload) + 1) : 0;

  return {
    estimated_bytes:   Math.round(estimatedBytes),
    refined_bytes:     Math.round(refinedBytes),
    validated_bytes:   validatedBytes,
    exceeds_threshold: exceeds,
    reduction_passes:  redPasses,
  };
}

// ─── Dégradation progressive ──────────────────────────────────────────────────

/**
 * Dégrade la composition couche par couche jusqu'à ce que le SVG passe sous le seuil.
 * Ordre de dégradation : couches secondaires → couches primaires → intensités.
 */
export function applyProgressiveDegradation(
  composition: ZoneComposition,
  maxBytes:    number
): { composition: ZoneComposition; steps: string[] } {
  const steps: string[] = [];
  let current = { ...composition };
  const zones = ['fond', 'separateur', 'titre', 'contact', 'nom', 'logo', 'cta'] as const;

  let profile = profileSVGSize(current);
  let pass    = 0;

  while (profile.exceeds_threshold && profile.validated_bytes > maxBytes && pass < 6) {
    pass++;

    // Étape 1 : supprimer les couches secondaires de la zone la moins prioritaire
    let removed = false;
    for (const zone of zones) {
      const decision = (current as any)[zone] as ZoneEffectDecision;
      if (decision?.layers && decision.layers.length > 0) {
        const removedCount = decision.layers.length;
        (current as any)[zone] = { ...decision, layers: [] };
        steps.push(`Passe ${pass} — ${zone} : ${removedCount} couche(s) secondaire(s) supprimée(s)`);
        removed = true;
        break;
      }
    }

    // Étape 2 : si aucune couche secondaire, réduire les intensités
    if (!removed) {
      let reduced = false;
      for (const zone of zones) {
        const decision = (current as any)[zone] as ZoneEffectDecision;
        if (decision?.intensity > 0.20) {
          const newInt = Math.max(0.15, decision.intensity * 0.75);
          (current as any)[zone] = { ...decision, intensity: parseFloat(newInt.toFixed(3)) };
          steps.push(`Passe ${pass} — ${zone} : intensité réduite de ${(decision.intensity * 100).toFixed(0)}% → ${(newInt * 100).toFixed(0)}%`);
          reduced = true;
          break;
        }
      }
      if (!reduced) break;  // impossible de réduire davantage
    }

    profile = profileSVGSize(current);
  }

  return { composition: current, steps };
}

// ─── Sélection automatique du profil ─────────────────────────────────────────

export function selectRenderingProfile(
  content:        ContentProfile,
  variation:      VariationKey,
  client?:        ClientType,
  viewport?:      ViewportCategory,
  forcedProfile?: RenderingProfile
): RenderingProfile {
  if (forcedProfile) return forcedProfile;

  const baseScore = (content.visual_complexity * 0.35)
    + (content.content_richness * 0.30)
    + (content.sector_boost * 0.35);

  const variationBonus: Record<VariationKey, number> = { A: 0, B: 0.05, C: 0.02, D: 0.15 };

  // Pénalité client (Outlook desktop force un profil très bas)
  const clientPenalty = client ? (CLIENT_CAPABILITIES[client]?.complexity_penalty ?? 0) : 0;

  // Réduction viewport
  const viewportScale = viewport ? (VIEWPORT_SPECS[viewport]?.rendering_downscale ?? 1.0) : 1.0;

  const total = Math.min(1, (baseScore + variationBonus[variation]) * viewportScale - clientPenalty);

  if (total > 0.80) return 'ultra';
  if (total > 0.62) return 'high';
  if (total > 0.42) return 'balanced';
  if (total > 0.22) return 'performance';
  return 'low';
}

// ─── Application du profil à une zone ────────────────────────────────────────

function applyProfileToZone(
  zone:     ZoneEffectDecision,
  zoneName: string,
  spec:     ProfileSpec,
  viewport: ViewportSpec
): ZoneEffectDecision {
  const maxLayers = zoneName === 'logo' ? spec.max_layers_logo : spec.max_layers_zone;
  const trimmedLayers = (zone.layers ?? []).slice(0, maxLayers);

  // Réduction d'intensité selon viewport mobile
  const viewportMult = viewport.rendering_downscale;
  const raw = zone.intensity * (viewportMult < 1 ? viewportMult * 1.1 : 1.0);
  const clampedIntensity = Math.min(spec.intensity_cap, Math.max(spec.intensity_floor, raw));

  const densityHint = `density=${(spec.particle_density * viewport.rendering_downscale * 100).toFixed(0)}%`;
  const fpsHint     = `fps=${spec.target_fps}`;
  const qualityHint = `quality=${spec.animation_quality}`;

  return {
    ...zone,
    intensity: parseFloat(clampedIntensity.toFixed(3)),
    layers:    trimmedLayers,
    raison:    `${zone.raison ?? ''} | Profile ${spec.name} ${viewport.category}: ${densityHint} ${fpsHint} ${qualityHint}`,
  };
}

// ─── Warnings client ─────────────────────────────────────────────────────────

function buildClientWarnings(
  composition: ZoneComposition,
  caps:        ClientCapabilities
): string[] {
  const warnings: string[] = [];
  const zones = Object.values(composition as any) as ZoneEffectDecision[];

  if (!caps.supports_filter) {
    const hasGlow = zones.some(z => {
      const id = (z?.effet_id ?? '').toLowerCase();
      return id.includes('glow') || id.includes('neon') || id.includes('blur');
    });
    if (hasGlow) {
      warnings.push(`⚠️ ${caps.client} : filter CSS non supporté — effets GLOW/NEON peuvent s'afficher sans le flou`);
    }
  }

  if (!caps.supports_svg_anim) {
    warnings.push(`⚠️ ${caps.client} : animations SVG SMIL non supportées — les effets tombent en static`);
  }

  if (!caps.supports_css_anim) {
    warnings.push(`🚫 ${caps.client} : animations CSS non supportées — signature statique uniquement`);
  }

  if (!caps.supports_mix_blend) {
    const hasBlend = zones.some(z => (z?.layers?.length ?? 0) > 1);
    if (hasBlend) {
      warnings.push(`⚠️ ${caps.client} : mix-blend-mode non supporté — les fusions de couches seront aplaties`);
    }
  }

  return warnings;
}

// ─── Score de performance ─────────────────────────────────────────────────────

function computePerformanceScore(spec: ProfileSpec, composition: ZoneComposition): number {
  const zones        = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];
  const totalLayers  = zones.reduce((s, z) => s + ((composition as any)[z]?.layers?.length ?? 0), 0);
  const avgIntensity = zones.reduce((s, z) => s + ((composition as any)[z]?.intensity ?? 0.5), 0) / zones.length;

  const layerUtil    = 1 - Math.min(1, totalLayers / (spec.max_layers_logo * 2 + spec.max_layers_zone * 5));
  const intensityFit = 1 - Math.abs(avgIntensity - spec.intensity_cap * 0.75);
  const budgetEff    = spec.complexity_budget;

  return parseFloat(Math.min(1, (layerUtil * 0.35) + (intensityFit * 0.35) + (budgetEff * 0.30)).toFixed(3));
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function applyAdaptiveRendering(
  composition:    ZoneComposition,
  content:        ContentProfile,
  variation:      VariationKey,
  options?: {
    forcedProfile?: RenderingProfile;
    client?:        ClientType;
    viewport?:      ViewportCategory;
  }
): RenderingResult {
  const client      = options?.client     ?? 'generic';
  const viewportCat = options?.viewport   ?? 'desktop';
  const viewport    = VIEWPORT_SPECS[viewportCat];
  const clientCaps  = CLIENT_CAPABILITIES[client];

  const profileName  = selectRenderingProfile(content, variation, client, viewportCat, options?.forcedProfile);
  const spec         = RENDERING_PROFILES[profileName];
  const autoSelected = !options?.forcedProfile;

  // Profiling SVG avant application
  const svgProfileBefore = profileSVGSize(composition);
  const complexityBefore = content.visual_complexity;

  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  let result  = { ...composition };
  const adjustments:  string[] = [];
  let layersRemoved   = 0;
  let intensityAdjs   = 0;

  // 1. Dégradation progressive si SVG > seuil client
  const degradationSteps: string[] = [];
  if (svgProfileBefore.validated_bytes > clientCaps.max_svg_bytes) {
    const { composition: degraded, steps } = applyProgressiveDegradation(composition, clientCaps.max_svg_bytes);
    result = degraded;
    degradationSteps.push(...steps);
    adjustments.push(`Dégradation progressive pour ${client} (${steps.length} étapes)`);
  }

  // 2. Application du profil zone par zone
  for (const zoneName of zones) {
    const zone = (result as any)[zoneName] as ZoneEffectDecision;
    if (!zone?.effet_id) continue;

    const adapted = applyProfileToZone(zone, zoneName, spec, viewport);
    (result as any)[zoneName] = adapted;

    const intensityDiff = Math.abs(adapted.intensity - zone.intensity);
    if (intensityDiff > 0.05) {
      adjustments.push(`${zoneName}: ${(zone.intensity * 100).toFixed(0)}%→${(adapted.intensity * 100).toFixed(0)}%`);
      intensityAdjs++;
    }
    const removedLayers = (zone.layers?.length ?? 0) - (adapted.layers?.length ?? 0);
    if (removedLayers > 0) {
      adjustments.push(`${zoneName}: ${removedLayers} couche(s) écrêtée(s)`);
      layersRemoved += removedLayers;
    }
  }

  if (adjustments.length === 0) {
    adjustments.push(`Composition compatible profil ${spec.name} — aucun ajustement nécessaire`);
  }

  // 3. Warnings client
  const clientWarnings = buildClientWarnings(result, clientCaps);

  // 4. SVG profile après
  const svgProfileAfter = profileSVGSize(result);
  const perfScore = computePerformanceScore(spec, result);

  // 5. Métriques
  const metrics: RenderingMetrics = {
    profile_name:      profileName,
    client,
    viewport:          viewportCat,
    complexity_before: complexityBefore,
    complexity_after:  content.visual_complexity * spec.complexity_budget,
    layers_removed:    layersRemoved,
    intensity_adjustments: intensityAdjs,
    svg_profile:       svgProfileAfter,
    degradation_steps: degradationSteps,
    timestamp:         Date.now(),
  };

  // Émettre les métriques vers les hooks temps-réel
  emitMetrics(metrics);

  console.log(
    `⚡ Adaptive Rendering v2 [${variation}/${profileName}/${client}/${viewportCat}] — ` +
    `SVG: ${(svgProfileAfter.validated_bytes / 1024).toFixed(0)}KB | ` +
    `${layersRemoved} couches retirées | ${intensityAdjs} ajustements | ` +
    `Perf: ${(perfScore * 100).toFixed(0)}% | Warnings: ${clientWarnings.length}`
  );

  return {
    composition:        result,
    profile:            spec,
    profile_selected:   profileName,
    auto_selected:      autoSelected,
    adjustments,
    performance_score:  perfScore,
    metrics,
    client_warnings:    clientWarnings,
    viewport_applied:   viewport,
  };
}
