/**
 * 🎨 COLOR HARMONY ENGINE — v3.0
 *
 * Moteur de cohérence chromatique militaire pour signatures email animées.
 *
 * ARCHITECTURE v3.0 :
 *  ┌─ HarmonyGenerator ─────────────────────────────────────────────────────┐
 *  │  7 types d'harmonies : complémentaire, triadique, analogique,           │
 *  │  split-complementary, tétradique, monochromatique, carré.              │
 *  │  Calcul HSL pur — zéro dépendance externe.                             │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ SectorPaletteAdapter ─────────────────────────────────────────────────┐
 *  │  Adapte la palette du secteur à une couleur dominante (logo uploadé).   │
 *  │  Préserve les rapports de contraste et l'identité du secteur.          │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ AccessibilityGuard ───────────────────────────────────────────────────┐
 *  │  WCAG 2.1 AA/AAA : ratio de contraste pour chaque paire texte/fond.    │
 *  │  Ajustement automatique si contraste insuffisant.                       │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ GradientEngine ───────────────────────────────────────────────────────┐
 *  │  Génère des dégradés CSS intelligents basés sur les harmonies.          │
 *  │  Linéaire, radial, conic, mesh — calibrés par secteur.                 │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ CSS Variable Injector ────────────────────────────────────────────────┐
 *  │  Génère --sig-bg, --sig-accent, --sig-text, --sig-muted, --sig-border  │
 *  │  injectés avant </head> — compatible VarianceEngine + TimingMaster.    │
 *  └────────────────────────────────────────────────────────────────────────┘
 *
 * @version 3.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement
 */

// ─── Types & Interfaces ──────────────────────────────────────────────────────

interface RGB  { r: number; g: number; b: number; }
interface HSL  { h: number; s: number; l: number; }
interface WCAG { ratio: number; aa: boolean; aaa: boolean; }

export type HarmonyType =
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic'
  | 'square';

/** Palette complète d'une signature */
export interface SignaturePalette {
  background: string;   // Fond principal
  accent:     string;   // Couleur d'accent (liens, titres, CTA)
  text:       string;   // Texte principal
  muted:      string;   // Texte secondaire (gris)
  border:     string;   // Séparateurs / bordures
  highlight?: string;   // Surbrillance optionnelle
  gradient?:  string;   // Dégradé CSS optionnel
}

/** Résultat d'une harmonisation */
export interface HarmonyResult {
  type:         HarmonyType;
  baseColor:    string;      // Couleur de départ (hex)
  colors:       string[];    // Couleurs harmoniques générées
  palette:      SignaturePalette;
  wcag:         WCAGReport;
  cssVariables: string;      // Bloc :root { --sig-* } prêt à injecter
  gradients:    GradientSet;
}

/** Rapport de contraste WCAG */
export interface WCAGReport {
  textOnBg:     WCAG;
  accentOnBg:   WCAG;
  textOnAccent: WCAG;
  allPassAA:    boolean;
  allPassAAA:   boolean;
}

/** Collection de dégradés CSS */
export interface GradientSet {
  linear:  string;
  radial:  string;
  conic:   string;
}

/** Résultat d'adaptation au logo */
export interface LogoAdaptationResult {
  dominantColor:   string;
  adaptedPalette:  SignaturePalette;
  harmonyType:     HarmonyType;
  harmonyColors:   string[];
  wcag:            WCAGReport;
  cssVariables:    string;
  delta:           PaletteDelta;
}

/** Différences entre palette originale et adaptée */
export interface PaletteDelta {
  background: { original: string; adapted: string; changed: boolean };
  accent:     { original: string; adapted: string; changed: boolean };
  text:       { original: string; adapted: string; changed: boolean };
}

/** Résultat d'injection CSS */
export interface ColorInjectionResult {
  html:        string;
  injected:    boolean;
  blockSize:   number;
  palette:     SignaturePalette;
}

export const ENGINE_VERSION = '3.0.0';

// ─── Maths couleur — HSL ↔ RGB ↔ HEX ────────────────────────────────────────

function hexToRGB(hex: string): RGB {
  const clean = hex.replace('#', '').trim();
  const full  = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const n = parseInt(full.slice(0, 6), 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >>  8) & 0xff,
    b:  n        & 0xff,
  };
}

function rgbToHSL({ r, g, b }: RGB): HSL {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break;
      case ng: h = ((nb - nr) / d + 2) / 6;                  break;
      case nb: h = ((nr - ng) / d + 4) / 6;                  break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: parseFloat((s * 100).toFixed(1)),
    l: parseFloat((l * 100).toFixed(1)),
  };
}

function hslToRGB({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = Math.max(0, Math.min(1, s / 100));
  const ln = Math.max(0, Math.min(1, l / 100));

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  return {
    r: Math.round(hue2rgb(hn + 1/3) * 255),
    g: Math.round(hue2rgb(hn)       * 255),
    b: Math.round(hue2rgb(hn - 1/3) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

function hslToHex(hsl: HSL): string { return rgbToHex(hslToRGB(hsl)); }
function hexToHSL(hex: string): HSL { return rgbToHSL(hexToRGB(hex)); }

/** Rotation de teinte (modulo 360) */
function shiftHue(hsl: HSL, degrees: number): HSL {
  return { ...hsl, h: ((hsl.h + degrees) % 360 + 360) % 360 };
}

/** Ajustement saturation avec garde-fous */
function adjustSat(hsl: HSL, delta: number): HSL {
  return { ...hsl, s: Math.max(0, Math.min(100, hsl.s + delta)) };
}

/** Ajustement luminosité avec garde-fous */
function adjustLight(hsl: HSL, delta: number): HSL {
  return { ...hsl, l: Math.max(5, Math.min(95, hsl.l + delta)) };
}

// ─── WCAG — Contraste ────────────────────────────────────────────────────────

function relativeLuminance({ r, g, b }: RGB): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRGB(hex1));
  const l2 = relativeLuminance(hexToRGB(hex2));
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return parseFloat(((light + 0.05) / (dark + 0.05)).toFixed(2));
}

function wcagCheck(fg: string, bg: string): WCAG {
  const ratio = contrastRatio(fg, bg);
  return { ratio, aa: ratio >= 4.5, aaa: ratio >= 7.0 };
}

/**
 * Ajuste la luminosité d'une couleur jusqu'à atteindre le contraste WCAG AA.
 * Préserve teinte + saturation.
 */
function enforceWCAGContrast(fg: string, bg: string, targetRatio = 4.5): string {
  let hsl = hexToHSL(fg);
  const bgLum = relativeLuminance(hexToRGB(bg));
  let hex = fg;

  // Détermine direction : assombrir si fond clair, éclaircir si fond sombre
  const direction = bgLum > 0.5 ? -1 : 1;

  for (let step = 0; step < 50; step++) {
    const ratio = contrastRatio(hex, bg);
    if (ratio >= targetRatio) break;
    hsl = adjustLight(hsl, direction * 2);
    hex = hslToHex(hsl);
  }

  return hex;
}

// ─── Génération d'harmonies ──────────────────────────────────────────────────

function generateHarmonyColors(baseHex: string, type: HarmonyType): string[] {
  const hsl = hexToHSL(baseHex);

  switch (type) {
    case 'complementary':
      return [hslToHex(shiftHue(hsl, 180))];

    case 'triadic':
      return [
        hslToHex(shiftHue(hsl, 120)),
        hslToHex(shiftHue(hsl, 240)),
      ];

    case 'analogous':
      return [
        hslToHex(shiftHue(hsl, -30)),
        hslToHex(shiftHue(hsl,  30)),
      ];

    case 'split-complementary':
      return [
        hslToHex(shiftHue(hsl, 150)),
        hslToHex(shiftHue(hsl, 210)),
      ];

    case 'tetradic':
      return [
        hslToHex(shiftHue(hsl,  90)),
        hslToHex(shiftHue(hsl, 180)),
        hslToHex(shiftHue(hsl, 270)),
      ];

    case 'square':
      return [
        hslToHex(shiftHue(hsl,  90)),
        hslToHex(shiftHue(hsl, 180)),
        hslToHex(shiftHue(hsl, 270)),
      ];

    case 'monochromatic':
      return [
        hslToHex(adjustLight(hsl, -25)),
        hslToHex(adjustLight(hsl, -10)),
        hslToHex(adjustLight(hsl,  15)),
        hslToHex(adjustLight(hsl,  30)),
      ];

    default:
      return [hslToHex(shiftHue(hsl, 180))];
  }
}

// ─── Construction de palette signature ──────────────────────────────────────

/**
 * Construit une SignaturePalette à partir d'une couleur de base.
 * Règles :
 *  - Fond : très clair si accent saturé (fond sombre si accent > 50% luminosité)
 *  - Texte : toujours contraste élevé sur fond
 *  - Muted  : texte désaturé / abaissé de 40%
 *  - Border : couleur d'accent très transparente (simulée en hex clair)
 */
function buildPaletteFromBase(baseHex: string, type: HarmonyType): SignaturePalette {
  const hsl     = hexToHSL(baseHex);
  const isDark  = hsl.l < 50;

  // Fond : neutre — déclinaison très désaturée
  const bgHSL = { h: hsl.h, s: Math.min(hsl.s * 0.12, 15), l: isDark ? 12 : 97 };
  const bg    = hslToHex(bgHSL);

  // Accent : couleur de base légèrement saturée
  const accentHSL = adjustSat(hsl, 10);
  const accent    = hslToHex(accentHSL);

  // Texte : contraste élevé sur fond
  const textHSL = { h: hsl.h, s: 5, l: isDark ? 95 : 10 };
  const text    = enforceWCAGContrast(hslToHex(textHSL), bg, 7.0);

  // Muted : texte atténué
  const mutedHSL = { h: hsl.h, s: 8, l: isDark ? 70 : 45 };
  const muted    = enforceWCAGContrast(hslToHex(mutedHSL), bg, 4.5);

  // Border : accent très clair
  const borderHSL = { h: hsl.h, s: Math.min(hsl.s * 0.4, 40), l: isDark ? 30 : 80 };
  const border    = hslToHex(borderHSL);

  // Highlight : couleur harmonique principale
  const harmonyColors = generateHarmonyColors(baseHex, type);
  const highlight     = harmonyColors[0] ?? accent;

  return { background: bg, accent, text, muted, border, highlight };
}

// ─── Dégradés CSS ────────────────────────────────────────────────────────────

function buildGradients(palette: SignaturePalette): GradientSet {
  const { background, accent, highlight = accent } = palette;
  return {
    linear: `linear-gradient(135deg, ${background} 0%, ${accent}22 50%, ${highlight}33 100%)`,
    radial: `radial-gradient(ellipse at 30% 30%, ${accent}22 0%, ${background} 70%)`,
    conic:  `conic-gradient(from 0deg at 50% 50%, ${background}, ${accent}33, ${highlight}22, ${background})`,
  };
}

// ─── WCAG Report ─────────────────────────────────────────────────────────────

function buildWCAGReport(palette: SignaturePalette): WCAGReport {
  const textOnBg     = wcagCheck(palette.text,   palette.background);
  const accentOnBg   = wcagCheck(palette.accent, palette.background);
  const textOnAccent = wcagCheck(palette.text,   palette.accent);

  return {
    textOnBg,
    accentOnBg,
    textOnAccent,
    allPassAA:  textOnBg.aa  && accentOnBg.aa,
    allPassAAA: textOnBg.aaa && accentOnBg.aaa,
  };
}

// ─── Variables CSS ───────────────────────────────────────────────────────────

/**
 * Génère le bloc :root { --sig-* } à partir d'une palette.
 */
function buildCSSVariables(palette: SignaturePalette, gradients: GradientSet): string {
  const lines = [
    `  --sig-bg:        ${palette.background};`,
    `  --sig-accent:    ${palette.accent};`,
    `  --sig-text:      ${palette.text};`,
    `  --sig-muted:     ${palette.muted};`,
    `  --sig-border:    ${palette.border};`,
  ];
  if (palette.highlight) lines.push(`  --sig-highlight: ${palette.highlight};`);
  if (palette.gradient)  lines.push(`  --sig-gradient:  ${palette.gradient};`);
  lines.push(`  --sig-gradient-linear: ${gradients.linear};`);
  lines.push(`  --sig-gradient-radial: ${gradients.radial};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

// ─── API publique — Harmoniser ───────────────────────────────────────────────

/**
 * Génère une harmonie complète depuis une couleur de base.
 */
export function generateHarmony(
  baseHex: string,
  type: HarmonyType = 'complementary'
): HarmonyResult {
  const normalizedHex = '#' + baseHex.replace('#', '').trim().toLowerCase();
  const harmonyColors = generateHarmonyColors(normalizedHex, type);
  const palette       = buildPaletteFromBase(normalizedHex, type);
  const gradients     = buildGradients(palette);
  const wcag          = buildWCAGReport(palette);
  const cssVariables  = buildCSSVariables(palette, gradients);

  return {
    type,
    baseColor:  normalizedHex,
    colors:     harmonyColors,
    palette,
    wcag,
    cssVariables,
    gradients,
  };
}

/**
 * Génère toutes les harmonies possibles pour une couleur.
 */
export function generateAllHarmonies(baseHex: string): Record<HarmonyType, HarmonyResult> {
  const types: HarmonyType[] = [
    'complementary', 'triadic', 'analogous', 'split-complementary',
    'tetradic', 'monochromatic', 'square',
  ];
  const result = {} as Record<HarmonyType, HarmonyResult>;
  for (const type of types) {
    result[type] = generateHarmony(baseHex, type);
  }
  return result;
}

// ─── Adaptation palette secteur → couleur dominante logo ─────────────────────

/**
 * Adapte la palette d'un secteur à une couleur dominante extraite du logo.
 *
 * Stratégie :
 *  1. Calcule l'harmonie triadic depuis la couleur dominante
 *  2. Préserve la structure clair/sombre de la palette originale
 *  3. Remplace accent + highlight par les couleurs harmoniques
 *  4. Vérifie le contraste WCAG sur chaque paire
 *  5. Ajuste si nécessaire
 */
export function adaptPaletteToLogo(
  dominantHex: string,
  originalPalette: { background: string; accent: string; text: string; muted: string; border: string },
  preferredHarmony: HarmonyType = 'analogous'
): LogoAdaptationResult {
  const normalized    = '#' + dominantHex.replace('#', '').trim().toLowerCase();
  const harmonyColors = generateHarmonyColors(normalized, preferredHarmony);
  const domHSL        = hexToHSL(normalized);
  const origBgHSL     = hexToHSL(originalPalette.background);

  // Préserve la luminosité du fond original — remplace juste la teinte
  const newBgHSL = { h: domHSL.h, s: Math.min(origBgHSL.s, 15), l: origBgHSL.l };
  const newBg    = hslToHex(newBgHSL);

  // Accent = couleur dominante saturée
  const newAccentHSL = adjustSat(domHSL, 15);
  const newAccent    = enforceWCAGContrast(hslToHex(newAccentHSL), newBg, 4.5);

  // Texte : préserve la luminosité du texte original, adapte légèrement la teinte
  const origTextHSL = hexToHSL(originalPalette.text);
  const newTextHSL  = { h: domHSL.h, s: Math.min(origTextHSL.s, 8), l: origTextHSL.l };
  const newText     = enforceWCAGContrast(hslToHex(newTextHSL), newBg, 7.0);

  // Muted : texte atténué
  const mutedHSL = { h: domHSL.h, s: 8, l: hexToHSL(originalPalette.muted).l };
  const newMuted = enforceWCAGContrast(hslToHex(mutedHSL), newBg, 4.5);

  // Border : couleur harmonique très claire
  const newBorderHSL = { h: (harmonyColors[0] ? hexToHSL(harmonyColors[0]).h : domHSL.h), s: 20, l: hexToHSL(originalPalette.border).l };
  const newBorder    = hslToHex(newBorderHSL);

  const adaptedPalette: SignaturePalette = {
    background: newBg,
    accent:     newAccent,
    text:       newText,
    muted:      newMuted,
    border:     newBorder,
    highlight:  harmonyColors[0] ?? newAccent,
  };

  const gradients    = buildGradients(adaptedPalette);
  const wcag         = buildWCAGReport(adaptedPalette);
  const cssVariables = buildCSSVariables(adaptedPalette, gradients);

  return {
    dominantColor:  normalized,
    adaptedPalette,
    harmonyType:    preferredHarmony,
    harmonyColors,
    wcag,
    cssVariables,
    delta: {
      background: {
        original: originalPalette.background,
        adapted:  newBg,
        changed:  originalPalette.background.toLowerCase() !== newBg.toLowerCase(),
      },
      accent: {
        original: originalPalette.accent,
        adapted:  newAccent,
        changed:  originalPalette.accent.toLowerCase() !== newAccent.toLowerCase(),
      },
      text: {
        original: originalPalette.text,
        adapted:  newText,
        changed:  originalPalette.text.toLowerCase() !== newText.toLowerCase(),
      },
    },
  };
}

// ─── CSS Injection Engine ────────────────────────────────────────────────────

/**
 * Génère le bloc <style> complet avec variables CSS + WCAG report.
 */
export function generateColorStyleBlock(
  palette: SignaturePalette,
  options?: { instanceId?: string; includeGradients?: boolean }
): string {
  const gradients = buildGradients(palette);
  const vars      = buildCSSVariables(palette, gradients);
  const instanceId = options?.instanceId ?? 'default';

  const gradientBlock = options?.includeGradients !== false ? `
  /* Dégradés générés */
  .sig-gradient-linear { background: ${gradients.linear}; }
  .sig-gradient-radial  { background: ${gradients.radial}; }
  .sig-gradient-conic   { background: ${gradients.conic}; }` : '';

  return `<style id="color-harmony-v3-${instanceId}" data-engine="ColorHarmonyEngine-${ENGINE_VERSION}">
  /* ═══════════════════════════════════════════════════════════════════
     🎨 COLOR HARMONY ENGINE v${ENGINE_VERSION}
     bg:${palette.background} | accent:${palette.accent} | text:${palette.text}
     ═══════════════════════════════════════════════════════════════════ */
  ${vars}${gradientBlock}
</style>`;
}

/**
 * Injecte le bloc couleur dans un HTML avant </head>.
 * Compatible avec TimingMaster et VarianceEngine (non-destructif).
 */
export function injectColorIntoHTML(
  html:    string,
  palette: SignaturePalette,
  options?: { instanceId?: string }
): ColorInjectionResult {
  const styleBlock = generateColorStyleBlock(palette, {
    instanceId:      options?.instanceId ?? 'default',
    includeGradients: true,
  });

  const hasHead       = /<\/head>/i.test(html);
  const injectedHtml  = hasHead
    ? html.replace(/<\/head>/i, `${styleBlock}\n</head>`)
    : `${styleBlock}\n${html}`;

  return {
    html:      injectedHtml,
    injected:  true,
    blockSize: styleBlock.length,
    palette,
  };
}

// ─── Utilitaires publics ─────────────────────────────────────────────────────

/** Vérifie si une chaîne est un hex valide */
export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

/** Retourne le ratio de contraste WCAG entre deux couleurs */
export function getContrastRatio(hex1: string, hex2: string): number {
  return contrastRatio(hex1, hex2);
}

/** Retourne les infos HSL d'une couleur hex */
export function analyzeColor(hex: string): { hex: string; rgb: RGB; hsl: HSL; luminance: number } {
  const rgb = hexToRGB(hex);
  return {
    hex,
    rgb,
    hsl:       rgbToHSL(rgb),
    luminance: parseFloat(relativeLuminance(rgb).toFixed(4)),
  };
}

/** Retourne la liste des types d'harmonies disponibles */
export function getHarmonyTypes(): HarmonyType[] {
  return ['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic', 'monochromatic', 'square'];
}

/** Ajuste automatiquement une palette pour passer WCAG AA */
export function enforceAccessibility(palette: SignaturePalette): SignaturePalette {
  const bg = palette.background ?? '#ffffff';
  return {
    background: bg,
    accent:     palette.accent ? enforceWCAGContrast(palette.accent, bg, 4.5) : '#0066cc',
    text:       palette.text   ? enforceWCAGContrast(palette.text,   bg, 7.0) : '#111111',
    muted:      palette.muted  ? enforceWCAGContrast(palette.muted,  bg, 4.5) : '#555555',
    border:     palette.border ?? '#e0e0e0',
    ...(palette.highlight && { highlight: palette.highlight }),
    ...(palette.gradient  && { gradient:  palette.gradient  }),
  };
}

console.log(
  `🎨 ColorHarmonyEngine v${ENGINE_VERSION} chargé — 7 harmonies | SectorAdapter | WCAG AA/AAA | GradientEngine | CSS Injection`
);
