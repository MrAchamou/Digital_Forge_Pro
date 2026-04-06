/**
 * 🔬 CONTENT ANALYZER — Module 11, Priorité 4
 *
 * Scanne les paramètres de la signature pour extraire son profil de contenu :
 * - Couleurs dominantes et saturation
 * - Complexité visuelle (logo, réseaux sociaux, longueur du texte, CTA)
 * - Nombre d'éléments actifs dans la composition
 * - Densité textuelle et équilibre visuel
 *
 * Résultat : un ContentProfile qui calibre les seuils de déclenchement
 * utilisés par tous les modules en aval (P1, P2, P3, P4).
 */

import type { ZoneComposition } from '../services/harmony-validator';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaletteAnalysis {
  dominant_hue:     number;        // 0-360
  saturation_avg:   number;        // 0-1
  lightness_avg:    number;        // 0-1
  contrast_ratio:   number;        // 0-1
  palette_richness: number;        // nb couleurs distinctes
  color_temperature: 'warm' | 'cool' | 'neutral';
  color_harmony:    'monochromatic' | 'complementary' | 'triadic' | 'analogous' | 'complex';
}

export interface TextDensity {
  nom_chars:         number;
  titre_chars:       number;
  contact_chars:     number;
  cta_chars:         number;
  total_chars:       number;
  density_level:     'minimal' | 'light' | 'medium' | 'dense' | 'heavy';
}

export interface ContentProfile {
  // Richesse du contenu
  has_logo:          boolean;
  has_cta:           boolean;
  has_social:        boolean;
  element_count:     number;         // 0-7 zones actives
  active_zones:      string[];

  // Analyse des couleurs
  palette:           PaletteAnalysis;

  // Texte
  text:              TextDensity;

  // Complexité globale (0-1)
  visual_complexity:  number;
  content_richness:   number;

  // Seuils dynamiques calculés
  thresholds: {
    max_intensity:    number;        // plafond d'intensité recommandé
    min_intensity:    number;        // plancher pour éviter l'invisible
    max_layers:       number;        // max couches simultanées
    animation_budget: number;        // 0-1 — budget d'animation disponible
    effect_cap:       number;        // max effets distincts autorisés
  };

  // Recommandations
  recommended_profile: 'minimal' | 'balanced' | 'rich' | 'spectacular';
  sector_boost:        number;       // 0-1 — multiplicateur contextuel secteur
}

// ─── Conversion hex → HSL ──────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!hex || hex.length < 7) return { h: 0, s: 0, l: 0.5 };
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, h = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s, l };
}

// ─── Analyse de la palette ──────────────────────────────────────────────────

function analyzePalette(palette: string[]): PaletteAnalysis {
  if (!palette || palette.length === 0) {
    return {
      dominant_hue: 220, saturation_avg: 0.5, lightness_avg: 0.5,
      contrast_ratio: 0.5, palette_richness: 1,
      color_temperature: 'cool', color_harmony: 'monochromatic',
    };
  }

  const hslValues = palette.map(hexToHsl).filter(h => h.s > 0 || h.l !== 0.5);
  const satAvg    = hslValues.reduce((s, c) => s + c.s, 0) / hslValues.length;
  const ligAvg    = hslValues.reduce((s, c) => s + c.l, 0) / hslValues.length;
  const hues      = hslValues.map(c => c.h);
  const dominantH = hues.reduce((a, b) => a + b, 0) / hues.length;

  // Température de couleur
  const colorTemperature: PaletteAnalysis['color_temperature'] =
    dominantH < 60 || dominantH > 300 ? 'warm' :
    dominantH > 150 && dominantH < 270 ? 'cool' : 'neutral';

  // Dispersion des teintes pour déterminer l'harmonie
  const hueRange   = Math.max(...hues) - Math.min(...hues);
  const colorHarmony: PaletteAnalysis['color_harmony'] =
    hueRange < 30                    ? 'monochromatic' :
    hueRange > 150 && hueRange < 210 ? 'complementary' :
    hueRange > 100 && hueRange < 140 ? 'triadic'       :
    hueRange < 60                    ? 'analogous'     : 'complex';

  // Contraste estimé
  const contrastRatio = Math.abs(Math.max(...hslValues.map(c => c.l)) - Math.min(...hslValues.map(c => c.l)));

  return {
    dominant_hue:     Math.round(dominantH),
    saturation_avg:   Math.min(1, satAvg),
    lightness_avg:    Math.min(1, ligAvg),
    contrast_ratio:   Math.min(1, contrastRatio),
    palette_richness: Math.min(palette.length, 8),
    color_temperature: colorTemperature,
    color_harmony:    colorHarmony,
  };
}

// ─── Analyse textuelle ──────────────────────────────────────────────────────

function analyzeText(metadata: any): TextDensity {
  const nom     = String(metadata?.nom      || metadata?.entreprise || '').length;
  const titre   = String(metadata?.titre    || metadata?.slogan     || '').length;
  const contact = String(metadata?.contact  || metadata?.telephone  || metadata?.email || '').length;
  const cta     = String(metadata?.cta_text || metadata?.site_web   || '').length;
  const total   = nom + titre + contact + cta;

  const densityLevel: TextDensity['density_level'] =
    total < 20  ? 'minimal' :
    total < 50  ? 'light'   :
    total < 100 ? 'medium'  :
    total < 180 ? 'dense'   : 'heavy';

  return { nom_chars: nom, titre_chars: titre, contact_chars: contact, cta_chars: cta, total_chars: total, density_level: densityLevel };
}

// ─── Boost par secteur ───────────────────────────────────────────────────────

const SECTOR_BOOST_MAP: Record<string, number> = {
  creative:    0.95,
  startup:     0.85,
  tech:        0.80,
  luxe:        0.75,
  retail:      0.70,
  immobilier:  0.65,
  default:     0.60,
  finance:     0.45,
  medical:     0.40,
  legal:       0.35,
};

function getSectorBoost(secteur: string): number {
  const key = secteur?.toLowerCase() ?? 'default';
  for (const [k, v] of Object.entries(SECTOR_BOOST_MAP)) {
    if (key.includes(k)) return v;
  }
  return SECTOR_BOOST_MAP.default;
}

// ─── Complexité visuelle ─────────────────────────────────────────────────────

function computeVisualComplexity(
  metadata:    any,
  composition: ZoneComposition | null,
  text:        TextDensity
): number {
  let score = 0.3;  // base

  // Logo
  if (metadata?.logo_url) score += 0.10;

  // Réseaux sociaux
  const socialCount = Object.keys(metadata?.reseaux_sociaux ?? {}).length;
  score += Math.min(0.15, socialCount * 0.03);

  // Densité textuelle
  const textBoost = text.density_level === 'heavy' ? 0.15 :
                    text.density_level === 'dense'  ? 0.10 :
                    text.density_level === 'medium' ? 0.05 : 0;
  score += textBoost;

  // Richesse de la composition
  if (composition) {
    const totalLayers = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta']
      .reduce((s, z) => s + ((composition as any)[z]?.layers?.length ?? 0), 0);
    score += Math.min(0.20, totalLayers * 0.02);
  }

  return Math.min(1, score);
}

// ─── Seuils dynamiques ───────────────────────────────────────────────────────

function computeThresholds(
  complexity:  number,
  sectorBoost: number,
  text:        TextDensity
): ContentProfile['thresholds'] {
  // Plus le contenu est dense, moins on peut mettre d'animation
  const animBudget = Math.max(0.2, 1 - (complexity * 0.5) - (text.total_chars / 600));

  return {
    max_intensity:    Math.min(1,    0.5 + sectorBoost * 0.5),
    min_intensity:    Math.max(0.05, 0.1 - complexity * 0.05),
    max_layers:       Math.round(2 + sectorBoost * 5),
    animation_budget: Math.min(1, animBudget),
    effect_cap:       Math.round(3 + sectorBoost * 4),
  };
}

// ─── Profil recommandé ───────────────────────────────────────────────────────

function recommendProfile(
  complexity:  number,
  sectorBoost: number,
  text:        TextDensity
): ContentProfile['recommended_profile'] {
  const score = complexity * 0.4 + sectorBoost * 0.4 + (1 - text.total_chars / 300) * 0.2;
  if (score > 0.75) return 'spectacular';
  if (score > 0.55) return 'rich';
  if (score > 0.35) return 'balanced';
  return 'minimal';
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function analyzeContent(
  metadata:    any,
  composition: ZoneComposition | null = null
): ContentProfile {
  const palette    = analyzePalette(metadata?.palette ?? []);
  const text       = analyzeText(metadata);
  const sectorBoost = getSectorBoost(metadata?.secteur ?? 'default');

  // Zones actives
  const zones      = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];
  const activeZones = composition
    ? zones.filter(z => (composition as any)[z]?.effet_id)
    : zones.slice(0, 5);

  const visualComplexity  = computeVisualComplexity(metadata, composition, text);
  const contentRichness   = Math.min(1, (activeZones.length / 7) * 0.5 + (palette.palette_richness / 8) * 0.3 + sectorBoost * 0.2);
  const thresholds        = computeThresholds(visualComplexity, sectorBoost, text);
  const recommendedProfile = recommendProfile(visualComplexity, sectorBoost, text);

  return {
    has_logo:          !!metadata?.logo_url,
    has_cta:           !!(metadata?.cta_text || metadata?.site_web),
    has_social:        Object.keys(metadata?.reseaux_sociaux ?? {}).length > 0,
    element_count:     activeZones.length,
    active_zones:      activeZones,
    palette,
    text,
    visual_complexity:  visualComplexity,
    content_richness:   contentRichness,
    thresholds,
    recommended_profile: recommendedProfile,
    sector_boost:       sectorBoost,
  };
}
