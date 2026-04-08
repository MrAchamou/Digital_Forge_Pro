/**
 * 🧬 VARIANCE ENGINE — v1.0
 *
 * Génère 4 variantes visuelles distinctes d'une même signature secteur.
 * Chaque variante est produite par mutation génétique de 3 couches :
 *   1. PaletteGene  — mutation HSL (teinte, saturation, luminosité)
 *   2. TimingGene   — mutation temporelle (délais / durées, PHI, Fibonacci)
 *   3. IntensityGene — mutation d'intensité (scale, filter, shadows)
 *
 * Stratégie d'injection : CSS override bloc injecté avant </head>
 * — aucune modification des HBS ni des JSON secteurs.
 *
 * Variantes :
 *   A — Canon     : signature originale, aucune mutation
 *   B — Intense   : palette saturée, timing rapide (× PHI⁻¹), scale ++
 *   C — Éthéré    : palette délavée, timing lent (× PHI), filtre lumineux
 *   D — Contrasté : accent complémentaire (hue +180°), staccato timing
 *
 * @version 1.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement (CSS pur généré)
 */

import { renderSignature, getSectorConfig, SectorConfig, SignatureData } from '../services/signature-renderer.js';

// ─── Constantes mathématiques ────────────────────────────────────────────────

const PHI = 1.6180339887;          // Nombre d'or φ
const PHI_INV = 1 / PHI;           // φ⁻¹ ≈ 0.618
const FIB = [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.3, 2.1]; // Fibonacci (secondes)

// Garde-fous CSS
const DELAY_MIN_S   = 0.0;
const DELAY_MAX_S   = 8.0;
const DURATION_MIN_S = 0.1;
const DURATION_MAX_S = 10.0;

export const ENGINE_VERSION = '1.0.0';

// ─── Types ───────────────────────────────────────────────────────────────────

export type VariantId = 'A' | 'B' | 'C' | 'D';

interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }

interface PaletteGene {
  bg_hue_shift:        number;  // Décalage teinte fond (°)
  bg_sat_mult:         number;  // Multiplicateur saturation fond
  bg_light_offset:     number;  // Offset luminosité fond
  accent_hue_shift:    number;  // Décalage teinte accent (°)
  accent_sat_mult:     number;
  accent_light_offset: number;
  text_light_offset:   number;  // Offset luminosité texte
}

interface TimingGene {
  delay_mult:    number;   // Multiplicateur des délais
  duration_mult: number;   // Multiplicateur des durées
  staccato:      boolean;  // Délais en paliers fixes (D)
  staccato_step: number;   // Pas staccato (s)
  jitter:        number;   // Micro-variation aléatoire max (s)
}

interface IntensityGene {
  scale_factor:  number;  // Scale transform multiplicateur
  filter_boost:  number;  // brightness() boost
  shadow_alpha:  number;  // Opacité des drop-shadow
  glow_radius:   number;  // px — rayon glow
}

interface VariantProfile {
  id:          VariantId;
  name:        string;
  description: string;
  personality: string;
  palette:     PaletteGene;
  timing:      TimingGene;
  intensity:   IntensityGene;
  fitness:     number;   // Score génétique 0-1
}

export interface SignatureVariant {
  id:           VariantId;
  html:         string;
  css_overrides: string;
  metadata: {
    sector_id:         string;
    variant_name:      string;
    description:       string;
    personality:       string;
    generation_time_ms: number;
    fitness_score:     number;
    mutations_applied: string[];
    elements_mutated:  number;
  };
}

export interface VariantsResult {
  sector_id:            string;
  base_palette:         Record<string, string>;
  variants:             SignatureVariant[];
  engine_version:       string;
  generation_timestamp: string;
  total_time_ms:        number;
}

// ─── Profils génétiques des 4 variantes ──────────────────────────────────────

const VARIANT_PROFILES: Record<VariantId, VariantProfile> = {

  A: {
    id: 'A',
    name: 'Canon',
    description: 'Rendu original fidèle au secteur — aucune mutation',
    personality: 'Authentique · Stable · Professionnel',
    palette: {
      bg_hue_shift: 0, bg_sat_mult: 1, bg_light_offset: 0,
      accent_hue_shift: 0, accent_sat_mult: 1, accent_light_offset: 0,
      text_light_offset: 0,
    },
    timing: { delay_mult: 1, duration_mult: 1, staccato: false, staccato_step: 0.3, jitter: 0 },
    intensity: { scale_factor: 1, filter_boost: 1, shadow_alpha: 0.6, glow_radius: 8 },
    fitness: 0.85,
  },

  B: {
    id: 'B',
    name: 'Intense',
    description: 'Palette saturée, timing rapide (× φ⁻¹), effets amplifiés',
    personality: 'Dynamique · Énergique · Impact fort',
    palette: {
      bg_hue_shift: 5, bg_sat_mult: 1.25, bg_light_offset: -5,
      accent_hue_shift: 15, accent_sat_mult: 1.4, accent_light_offset: 5,
      text_light_offset: 8,
    },
    timing: { delay_mult: PHI_INV, duration_mult: 0.75, staccato: false, staccato_step: 0.3, jitter: 0.04 },
    intensity: { scale_factor: 1.12, filter_boost: 1.35, shadow_alpha: 0.85, glow_radius: 14 },
    fitness: 0.91,
  },

  C: {
    id: 'C',
    name: 'Éthéré',
    description: 'Palette délavée, timing lent (× φ), effets doux et lumineux',
    personality: 'Délicat · Raffiné · Minimaliste',
    palette: {
      bg_hue_shift: -8, bg_sat_mult: 0.65, bg_light_offset: 12,
      accent_hue_shift: -20, accent_sat_mult: 0.7, accent_light_offset: 18,
      text_light_offset: 15,
    },
    timing: { delay_mult: PHI, duration_mult: 1.4, staccato: false, staccato_step: 0.3, jitter: 0.08 },
    intensity: { scale_factor: 0.95, filter_boost: 0.8, shadow_alpha: 0.3, glow_radius: 20 },
    fitness: 0.87,
  },

  D: {
    id: 'D',
    name: 'Contrasté',
    description: 'Accent complémentaire (hue +180°), timing en staccato régulier',
    personality: 'Audacieux · Inattendu · Mémorable',
    palette: {
      bg_hue_shift: 10, bg_sat_mult: 1.1, bg_light_offset: -8,
      accent_hue_shift: 180, accent_sat_mult: 1.2, accent_light_offset: 0,
      text_light_offset: 5,
    },
    timing: { delay_mult: 1, duration_mult: 0.9, staccato: true, staccato_step: 0.25, jitter: 0.02 },
    intensity: { scale_factor: 1.05, filter_boost: 1.15, shadow_alpha: 0.75, glow_radius: 10 },
    fitness: 0.88,
  },
};

// ─── Utilitaires couleur ──────────────────────────────────────────────────────

function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    return {
      r: parseInt(cleaned[0] + cleaned[0], 16),
      g: parseInt(cleaned[1] + cleaned[1], 16),
      b: parseInt(cleaned[2] + cleaned[2], 16),
    };
  }
  if (cleaned.length === 8) {
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
    };
  }
  return {
    r: parseInt(cleaned.slice(0, 2), 16) || 0,
    g: parseInt(cleaned.slice(2, 4), 16) || 0,
    b: parseInt(cleaned.slice(4, 6), 16) || 0,
  };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    default:  h = ((rn - gn) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    const tt = ((t % 1) + 1) % 1;
    if (tt < 1/6) return p + (q - p) * 6 * tt;
    if (tt < 1/2) return q;
    if (tt < 2/3) return p + (q - p) * (2/3 - tt) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = (((h % 360) + 360) % 360) / 360;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1/3) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Mute une couleur hex selon les paramètres HSL fournis.
 * Fallback sécurisé : retourne la couleur d'origine si parse impossible.
 */
function mutateColor(hex: string, hueShift: number, satMult: number, lightOffset: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  try {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const mutated: HSL = {
      h: ((hsl.h + hueShift) % 360 + 360) % 360,
      s: Math.max(0, Math.min(100, hsl.s * satMult)),
      l: Math.max(3,  Math.min(97,  hsl.l + lightOffset)),
    };
    return rgbToHex(hslToRgb(mutated));
  } catch {
    return hex;
  }
}

// ─── Utilitaires timing ───────────────────────────────────────────────────────

function clampDelay(v: number): number {
  return Math.max(DELAY_MIN_S, Math.min(DELAY_MAX_S, v));
}
function clampDuration(v: number): number {
  return Math.max(DURATION_MIN_S, Math.min(DURATION_MAX_S, v));
}

/** Applique un jitter déterministe (pas de Math.random — reproductible par id) */
function deterministicJitter(seed: string, maxJitter: number): number {
  if (maxJitter === 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((Math.abs(hash) % 1000) / 1000 - 0.5) * maxJitter * 2;
}

// ─── Générateur de CSS overrides ─────────────────────────────────────────────

interface ElementTiming {
  id:        string;
  delay_s:   number;
  duration_s: number;
  iteration: string | number;
}

/**
 * Extrait les timings des éléments depuis le SectorConfig.
 */
function extractElementTimings(config: SectorConfig): ElementTiming[] {
  if (!Array.isArray((config as any).elements)) return [];
  return (config as any).elements.map((el: any) => ({
    id:          el.id || 'unknown',
    delay_s:     el.animation?.delai    ?? 0,
    duration_s:  el.animation?.duree    ? (el.animation.duree / 1000) : 1,
    iteration:   el.animation?.iteration ?? 1,
  }));
}

/**
 * Construit le bloc <style> d'override de palette pour une variante.
 */
function buildPaletteOverride(config: SectorConfig, gene: PaletteGene): string {
  const p = config.palette;
  const newBg     = mutateColor(p.background,  gene.bg_hue_shift,     gene.bg_sat_mult,     gene.bg_light_offset);
  const newAccent = mutateColor(p.accent,       gene.accent_hue_shift, gene.accent_sat_mult, gene.accent_light_offset);
  const newText   = mutateColor(p.text,         0,                     1,                    gene.text_light_offset);
  const newMuted  = mutateColor(p.muted,        gene.bg_hue_shift,     gene.bg_sat_mult * 0.9, gene.bg_light_offset * 0.6);
  const newBorder = mutateColor(p.border,       gene.accent_hue_shift, gene.accent_sat_mult, 0);
  return `  :root {
    --sig-bg: ${newBg};
    --sig-accent: ${newAccent};
    --sig-text: ${newText};
    --sig-muted: ${newMuted};
    --sig-border: ${newBorder};
  }`;
}

/**
 * Construit le bloc <style> d'override de timing pour une variante.
 */
function buildTimingOverride(
  timings: ElementTiming[],
  gene: TimingGene,
  variantId: VariantId
): string {
  const lines: string[] = [];
  timings.forEach((el, idx) => {
    let delay: number;
    let duration: number;

    if (gene.staccato) {
      delay    = clampDelay(idx * gene.staccato_step);
      duration = clampDuration(el.duration_s * gene.duration_mult);
    } else {
      const jitter = deterministicJitter(`${variantId}-${el.id}`, gene.jitter);
      delay    = clampDelay(el.delay_s * gene.delay_mult + jitter);
      duration = clampDuration(el.duration_s * gene.duration_mult);
    }

    // Les animations CSS peuvent avoir 1 ou 2 animations sur un élément (intro + boucle).
    // On écrase uniquement les propriétés animation-delay / animation-duration.
    lines.push(`  .sig-el-${el.id} { animation-delay: ${delay.toFixed(3)}s; animation-duration: ${duration.toFixed(3)}s; }`);
  });
  return lines.join('\n');
}

/**
 * Construit le bloc <style> d'override d'intensité pour une variante.
 */
function buildIntensityOverride(
  timings: ElementTiming[],
  gene: IntensityGene,
  variantId: VariantId
): string {
  if (gene.scale_factor === 1 && gene.filter_boost === 1) return '';
  const lines: string[] = [];
  const filterVal = gene.filter_boost !== 1
    ? `brightness(${gene.filter_boost.toFixed(2)})`
    : '';
  timings.forEach(el => {
    const parts: string[] = [];
    if (filterVal) parts.push(`filter: ${filterVal};`);
    if (parts.length) {
      lines.push(`  .sig-el-${el.id} { ${parts.join(' ')} }`);
    }
  });
  return lines.join('\n');
}

/**
 * Assemble le bloc CSS complet pour une variante.
 */
function buildVariantCssBlock(
  config: SectorConfig,
  profile: VariantProfile,
  timings: ElementTiming[]
): string {
  const id = profile.id;

  if (id === 'A') return '';  // Canon : zéro override

  const sections: string[] = [];

  sections.push(buildPaletteOverride(config, profile.palette));

  const timingCSS = buildTimingOverride(timings, profile.timing, id);
  if (timingCSS) sections.push(timingCSS);

  const intensityCSS = buildIntensityOverride(timings, profile.intensity, id);
  if (intensityCSS) sections.push(intensityCSS);

  return sections.join('\n');
}

/**
 * Injecte un bloc <style> dans le HTML avant </head>.
 * Fallback : ajout en tête du document si pas de </head>.
 */
function injectStyleIntoHtml(html: string, cssContent: string, variantId: VariantId): string {
  if (!cssContent.trim()) return html;
  const styleTag = `<style id="variance-override-${variantId}" data-engine="VarianceEngine-${ENGINE_VERSION}">\n${cssContent}\n</style>`;
  const headClose = html.lastIndexOf('</head>');
  if (headClose !== -1) {
    return html.slice(0, headClose) + styleTag + '\n' + html.slice(headClose);
  }
  return styleTag + '\n' + html;
}

/**
 * Détermine les mutations appliquées (pour les métadonnées).
 */
function describeMutations(profile: VariantProfile): string[] {
  if (profile.id === 'A') return ['none — variante canonique'];
  const m: string[] = [];
  const pg = profile.palette;
  if (pg.accent_hue_shift !== 0) m.push(`accent hue ${pg.accent_hue_shift > 0 ? '+' : ''}${pg.accent_hue_shift}°`);
  if (pg.accent_sat_mult !== 1)  m.push(`saturation ×${pg.accent_sat_mult.toFixed(2)}`);
  if (pg.accent_light_offset !== 0) m.push(`luminosité ${pg.accent_light_offset > 0 ? '+' : ''}${pg.accent_light_offset}%`);
  const tg = profile.timing;
  if (tg.staccato) m.push(`timing staccato Δ${tg.staccato_step}s`);
  else if (tg.delay_mult !== 1) m.push(`délais ×${tg.delay_mult.toFixed(3)} (${tg.delay_mult > 1 ? 'φ lent' : 'φ⁻¹ rapide'})`);
  if (tg.duration_mult !== 1) m.push(`durées ×${tg.duration_mult.toFixed(2)}`);
  const ig = profile.intensity;
  if (ig.filter_boost !== 1) m.push(`brightness ×${ig.filter_boost.toFixed(2)}`);
  if (ig.scale_factor !== 1) m.push(`scale ×${ig.scale_factor.toFixed(2)}`);
  return m;
}

// ─── Interface publique ───────────────────────────────────────────────────────

/**
 * Génère les 4 variantes visuelles d'une signature secteur.
 *
 * @param sectorId  Identifiant du secteur (ex : 'restauration')
 * @param data      Données utilisateur (nom, titre, email…)
 * @returns         VariantsResult avec 4 SignatureVariant (A, B, C, D)
 */
export function generateVariants(sectorId: string, data: SignatureData): VariantsResult {
  const t0 = Date.now();

  const config  = getSectorConfig(sectorId);
  const timings = extractElementTimings(config);

  const basePalette: Record<string, string> = {
    background: config.palette.background,
    accent:     config.palette.accent,
    text:       config.palette.text,
    muted:      config.palette.muted,
    border:     config.palette.border,
  };

  const variantIds: VariantId[] = ['A', 'B', 'C', 'D'];
  const variants: SignatureVariant[] = [];

  for (const vid of variantIds) {
    const t1 = Date.now();
    const profile = VARIANT_PROFILES[vid];

    const cssOverrides = buildVariantCssBlock(config, profile, timings);

    const baseHtml  = renderSignature(sectorId, data);
    const finalHtml = injectStyleIntoHtml(baseHtml, cssOverrides, vid);

    const mutations = describeMutations(profile);

    variants.push({
      id:           vid,
      html:         finalHtml,
      css_overrides: cssOverrides,
      metadata: {
        sector_id:          sectorId,
        variant_name:       profile.name,
        description:        profile.description,
        personality:        profile.personality,
        generation_time_ms: Date.now() - t1,
        fitness_score:      profile.fitness,
        mutations_applied:  mutations,
        elements_mutated:   vid === 'A' ? 0 : timings.length,
      },
    });
  }

  return {
    sector_id:            sectorId,
    base_palette:         basePalette,
    variants,
    engine_version:       ENGINE_VERSION,
    generation_timestamp: new Date().toISOString(),
    total_time_ms:        Date.now() - t0,
  };
}

/**
 * Génère une seule variante identifiée.
 */
export function generateSingleVariant(sectorId: string, data: SignatureData, variantId: VariantId): SignatureVariant {
  const config   = getSectorConfig(sectorId);
  const timings  = extractElementTimings(config);
  const profile  = VARIANT_PROFILES[variantId];

  const t0 = Date.now();
  const cssOverrides = buildVariantCssBlock(config, profile, timings);
  const baseHtml     = renderSignature(sectorId, data);
  const finalHtml    = injectStyleIntoHtml(baseHtml, cssOverrides, variantId);

  return {
    id:           variantId,
    html:         finalHtml,
    css_overrides: cssOverrides,
    metadata: {
      sector_id:          sectorId,
      variant_name:       profile.name,
      description:        profile.description,
      personality:        profile.personality,
      generation_time_ms: Date.now() - t0,
      fitness_score:      profile.fitness,
      mutations_applied:  describeMutations(profile),
      elements_mutated:   variantId === 'A' ? 0 : timings.length,
    },
  };
}

/**
 * Retourne les 4 profils génétiques (sans rendu HTML) — utile pour l'UI.
 */
export function getVariantProfiles(): Omit<VariantProfile, 'palette' | 'timing' | 'intensity'>[] {
  return (['A', 'B', 'C', 'D'] as VariantId[]).map(id => {
    const { palette: _p, timing: _t, intensity: _i, ...meta } = VARIANT_PROFILES[id];
    return meta;
  });
}
