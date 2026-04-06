/**
 * 🎨 COLOR HARMONY ENGINE — v2.0
 *
 * Génère des palettes complémentaires intelligentes à partir de la couleur de marque.
 * - Harmonies triadiques, analogues, split-complémentaires
 * - Contrôle WCAG 2.1 (ratios de contraste AA/AAA) pour la lisibilité
 * - Interpolation perceptuelle OKLCH pour des transitions biologiquement naturelles
 * - Simulation daltonisme (deuteranopie, protanopie) pour valider l'accessibilité
 * - Mode "température dynamique" : palette chaude/froide selon l'heure du jour
 */

export interface HarmonyPalette {
  primary:      string;
  analog_warm:  string;  // +30° teinte
  analog_cool:  string;  // -30° teinte
  complement:   string;  // 180° teinte
  split_1:      string;  // 150° teinte
  split_2:      string;  // 210° teinte
  triadic_1:    string;  // 120° teinte
  triadic_2:    string;  // 240° teinte
  tint:         string;  // version éclaircie (+20% luminosité)
  shade:        string;  // version assombrie (-20% luminosité)
  accent_glow:  string;  // haute saturation pour effets lumineux
}

export interface ZoneColorMap {
  logo:       string;
  nom:        string;
  titre:      string;
  contact:    string;
  separateur: string;
  fond:       string;
  cta:        string;
}

export interface ColorAnalysis {
  hue:         number;
  saturation:  number;
  lightness:   number;
  temperature: 'warm' | 'cool' | 'neutral';
  vibrancy:    'muted' | 'moderate' | 'vivid';
  luminance:   number;
}

export interface WCAGResult {
  ratio:       number;
  levelAA:     boolean;   // ratio ≥ 4.5 (texte normal) ou ≥ 3 (gros texte)
  levelAAA:    boolean;   // ratio ≥ 7 (texte normal)
  suggestion?: string;    // couleur ajustée si non conforme
}

export interface ColorblindPalette {
  deuteranopia: HarmonyPalette;  // déficit vert
  protanopia:   HarmonyPalette;  // déficit rouge
}

export interface DynamicTemperatureResult {
  palette:     HarmonyPalette;
  mode:        'warm_morning' | 'neutral_day' | 'cool_evening' | 'night';
  hour:        number;
}

// ─── Conversions HSL ↔ Hex ─────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!hex || hex.length < 7) return { h: 240, s: 70, l: 55 };
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
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
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

// ─── Luminance relative WCAG 2.1 ────────────────────────────────────────────

function linearize(c: number): number {
  const n = c / 255;
  return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Calcule le ratio de contraste WCAG 2.1 entre deux couleurs.
 * Retourne un objet avec le ratio, la conformité AA/AAA, et une suggestion si nécessaire.
 */
export function checkWCAGContrast(
  foreground: string,
  background: string,
  largeText = false
): WCAGResult {
  const L1 = relativeLuminance(foreground);
  const L2 = relativeLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker  = Math.min(L1, L2);
  const ratio   = parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));

  const aaThreshold  = largeText ? 3.0 : 4.5;
  const aaaThreshold = largeText ? 4.5 : 7.0;

  const levelAA  = ratio >= aaThreshold;
  const levelAAA = ratio >= aaaThreshold;

  let suggestion: string | undefined;
  if (!levelAA) {
    // Ajuster la luminosité du premier plan pour atteindre AA
    const { h, s, l } = hexToHsl(foreground);
    const bgLum = relativeLuminance(background);
    // Si le fond est clair, assombrir l'avant-plan; sinon l'éclaircir
    const newL = bgLum > 0.5 ? Math.max(l - 30, 5) : Math.min(l + 30, 95);
    suggestion = hslToHex(h, s, newL);
  }

  return { ratio, levelAA, levelAAA, suggestion };
}

// ─── Interpolation OKLCH perceptuelle ───────────────────────────────────────

/**
 * Conversion approximée RGB→OKLCH (L: luminosité perceptuelle, C: chroma, H: teinte).
 * Permet des transitions de couleur biologiquement naturelles, sans shift de teinte.
 */
function hexToOklch(hex: string): { L: number; C: number; H: number } {
  const { r, g, b } = hexToRgb(hex);
  // Linéarisation sRGB
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);
  // Espace LMS (matrice Bradford approximée pour OKLAB)
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  // OKLAB
  const La = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a  = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C  = Math.sqrt(a * a + bv * bv);
  const H  = (Math.atan2(bv, a) * 180) / Math.PI;
  return { L: La, C, H: ((H % 360) + 360) % 360 };
}

function oklchToHex(L: number, C: number, H: number): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const bv = C * Math.sin(hRad);
  // OKLAB → LMS cubes
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bv;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bv;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * bv;
  const l3 = l_ * l_ * l_, m3 = m_ * m_ * m_, s3 = s_ * s_ * s_;
  // LMS → linéaire RGB
  const rl =  4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gl = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  // Linéaire → sRGB
  const toSRGB = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    return Math.round((clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1/2.4) - 0.055) * 255);
  };
  const rr = toSRGB(rl), gg = toSRGB(gl), bb = toSRGB(bl);
  return `#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`;
}

/**
 * Interpole perceptuellement deux couleurs en OKLCH.
 * t=0 → color1, t=1 → color2. Plus naturel que l'interpolation HSL.
 */
export function interpolateOKLCH(color1: string, color2: string, t: number): string {
  const c1 = hexToOklch(color1);
  const c2 = hexToOklch(color2);
  // Interpolation angulaire courte pour la teinte
  let dH = c2.H - c1.H;
  if (dH > 180) dH -= 360;
  if (dH < -180) dH += 360;
  return oklchToHex(
    c1.L + (c2.L - c1.L) * t,
    c1.C + (c2.C - c1.C) * t,
    c1.H + dH * t,
  );
}

// ─── Simulation daltonisme ───────────────────────────────────────────────────

/**
 * Simule la vision d'un daltonien (deuteranopie ou protanopie) sur une couleur hex.
 * Matricielle basée sur les travaux de Brettel, Viénot & Mollon (1997).
 */
export function simulateColorblind(hex: string, type: 'deuteranopia' | 'protanopia'): string {
  const { r, g, b } = hexToRgb(hex);
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);
  let nr: number, ng: number, nb: number;

  if (type === 'deuteranopia') {
    // Déficit vert — matrice simplifiée Machado 2009
    nr =  0.625 * rl + 0.375 * gl + 0.0  * bl;
    ng =  0.700 * rl + 0.300 * gl + 0.0  * bl;
    nb =  0.0   * rl + 0.300 * gl + 0.700 * bl;
  } else {
    // Déficit rouge — protanopie
    nr =  0.567 * rl + 0.433 * gl + 0.0  * bl;
    ng =  0.558 * rl + 0.442 * gl + 0.0  * bl;
    nb =  0.0   * rl + 0.242 * gl + 0.758 * bl;
  }

  const delinearize = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    return Math.round((clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1/2.4) - 0.055) * 255);
  };

  return `#${delinearize(nr).toString(16).padStart(2,'0')}${delinearize(ng).toString(16).padStart(2,'0')}${delinearize(nb).toString(16).padStart(2,'0')}`;
}

/**
 * Génère une palette simulée pour daltoniens à partir de la palette standard.
 */
export function generateColorblindPalette(harmony: HarmonyPalette): ColorblindPalette {
  const applyType = (type: 'deuteranopia' | 'protanopia'): HarmonyPalette => {
    const entries = Object.entries(harmony) as [keyof HarmonyPalette, string][];
    const result: Partial<HarmonyPalette> = {};
    for (const [key, val] of entries) {
      result[key] = simulateColorblind(val, type);
    }
    return result as HarmonyPalette;
  };
  return {
    deuteranopia: applyType('deuteranopia'),
    protanopia:   applyType('protanopia'),
  };
}

// ─── Température dynamique ───────────────────────────────────────────────────

/**
 * Adapte la palette selon l'heure du jour :
 * - 06h-10h : tons chauds (matin)
 * - 10h-17h : neutre (journée productive)
 * - 17h-21h : refroidissement (soirée)
 * - 21h-06h : palette sombre/froide (nuit)
 */
export function getDynamicTemperaturePalette(
  primaryHex: string,
  hour?: number
): DynamicTemperatureResult {
  const h = hour ?? new Date().getHours();
  let mode: DynamicTemperatureResult['mode'];
  let hueShift = 0;
  let satShift = 0;
  let lightShift = 0;

  if (h >= 6 && h < 10) {
    mode = 'warm_morning';
    hueShift  = -15;  // glisser vers le rouge/orange
    satShift  = +10;
    lightShift = +5;
  } else if (h >= 10 && h < 17) {
    mode = 'neutral_day';
    // Pas de décalage — palette de base
  } else if (h >= 17 && h < 21) {
    mode = 'cool_evening';
    hueShift  = +20;  // glisser vers le bleu/violet
    satShift  = -5;
    lightShift = -5;
  } else {
    mode = 'night';
    hueShift  = +30;
    satShift  = -15;
    lightShift = -15;
  }

  const { h: baseH, s: baseS, l: baseL } = hexToHsl(primaryHex);
  const shiftedPrimary = hslToHex(baseH + hueShift, baseS + satShift, baseL + lightShift);
  const palette = generateHarmonyPalette(shiftedPrimary);

  return { palette, mode, hour: h };
}

// ─── Analyse couleur ────────────────────────────────────────────────────────

export function analyzeColor(hex: string): ColorAnalysis {
  const { h, s, l } = hexToHsl(hex);
  const temperature: 'warm' | 'cool' | 'neutral' =
    (h >= 0 && h <= 60) || (h >= 300 && h <= 360) ? 'warm' :
    (h >= 180 && h <= 300) ? 'cool' : 'neutral';
  const vibrancy: 'muted' | 'moderate' | 'vivid' =
    s < 30 ? 'muted' : s < 70 ? 'moderate' : 'vivid';
  const luminance = relativeLuminance(hex);
  return { hue: h, saturation: s, lightness: l, temperature, vibrancy, luminance };
}

// ─── Génération de l'harmonie complète ─────────────────────────────────────

export function generateHarmonyPalette(primaryHex: string): HarmonyPalette {
  const { h, s, l } = hexToHsl(primaryHex);
  const effectSat = Math.max(s, 55);

  return {
    primary:     primaryHex,
    analog_warm: hslToHex(h + 30, s, l),
    analog_cool: hslToHex(h - 30, s, l),
    complement:  hslToHex(h + 180, s, l),
    split_1:     hslToHex(h + 150, s, l),
    split_2:     hslToHex(h + 210, s, l),
    triadic_1:   hslToHex(h + 120, s, l),
    triadic_2:   hslToHex(h + 240, s, l),
    tint:        hslToHex(h, s * 0.7, Math.min(l + 22, 88)),
    shade:       hslToHex(h, s * 1.1, Math.max(l - 22, 10)),
    accent_glow: hslToHex(h, Math.min(effectSat + 25, 100), Math.min(l + 10, 70)),
  };
}

// ─── Assignation couleur par zone ───────────────────────────────────────────

export function buildZoneColorMap(
  harmony: HarmonyPalette,
  bgColor: string,
  variation: 'A' | 'B' | 'C' | 'D'
): ZoneColorMap {
  const maps: Record<string, ZoneColorMap> = {
    A: {
      logo:       harmony.primary,
      nom:        harmony.analog_warm,
      titre:      harmony.tint,
      contact:    harmony.tint,
      separateur: harmony.analog_cool,
      fond:       harmony.shade,
      cta:        harmony.triadic_1,
    },
    B: {
      logo:       harmony.accent_glow,
      nom:        harmony.primary,
      titre:      harmony.tint,
      contact:    harmony.tint,
      separateur: harmony.complement,
      fond:       harmony.shade,
      cta:        harmony.triadic_2,
    },
    C: {
      logo:       harmony.split_1,
      nom:        harmony.primary,
      titre:      harmony.tint,
      contact:    harmony.tint,
      separateur: harmony.analog_cool,
      fond:       harmony.shade,
      cta:        harmony.complement,
    },
    D: {
      logo:       harmony.triadic_1,
      nom:        harmony.accent_glow,
      titre:      harmony.tint,
      contact:    harmony.tint,
      separateur: harmony.triadic_2,
      fond:       harmony.shade,
      cta:        harmony.primary,
    },
  };

  const map = maps[variation] ?? maps.A;

  // Validation WCAG : vérifier le ratio CTA sur fond blanc et ajuster si nécessaire
  const ctaCheck = checkWCAGContrast(map.cta, '#ffffff');
  if (!ctaCheck.levelAA && ctaCheck.suggestion) {
    map.cta = ctaCheck.suggestion;
  }

  return map;
}

// ─── Point d'entrée principal ────────────────────────────────────────────────

export function enrichZoneColors(
  primaryHex: string,
  bgHex: string,
  variation: 'A' | 'B' | 'C' | 'D',
  options?: { useDynamicTemperature?: boolean; validateColorblind?: boolean }
): ZoneColorMap {
  const safe   = primaryHex && primaryHex.startsWith('#') ? primaryHex : '#6366f1';
  const safeBg = bgHex      && bgHex.startsWith('#')      ? bgHex      : '#0f172a';

  let palette: HarmonyPalette;

  if (options?.useDynamicTemperature) {
    palette = getDynamicTemperaturePalette(safe).palette;
  } else {
    palette = generateHarmonyPalette(safe);
  }

  // Validation daltonisme optionnelle (log uniquement, pas de remplacement automatique)
  if (options?.validateColorblind) {
    const cbPalette = generateColorblindPalette(palette);
    const ctaDeut   = checkWCAGContrast(cbPalette.deuteranopia.cta, safeBg);
    if (!ctaDeut.levelAA) {
      console.warn(`⚠️  ColorHarmony — CTA non conforme WCAG AA en deuteranopie (ratio: ${ctaDeut.ratio})`);
    }
  }

  return buildZoneColorMap(palette, safeBg, variation);
}

/**
 * Génère un gradient SVG inline à partir d'une couleur et de son harmonique OKLCH.
 */
export function buildGradientStop(
  baseHex: string,
  offsetPct: number,
  opacity = 1
): string {
  // Utiliser OKLCH pour un décalage de teinte perceptuellement uniforme
  const c1 = hexToOklch(baseHex);
  const variantHex = oklchToHex(
    Math.min(c1.L + 0.08, 1),
    Math.min(c1.C * 1.1, 0.4),
    (c1.H + 15 + 360) % 360,
  );
  return `<stop offset="${offsetPct}%" stop-color="${variantHex}" stop-opacity="${opacity}"/>`;
}

console.log('🎨 Color Harmony Engine v2.0 chargé — WCAG 2.1 | OKLCH | Daltonisme | Température dynamique');
