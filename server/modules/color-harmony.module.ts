/**
 * 🎨 COLOR HARMONY ENGINE
 *
 * Génère des palettes complémentaires intelligentes à partir de la couleur de marque.
 * - Harmonies triadiques, analogues, split-complémentaires
 * - Assignation couleur par zone selon la hiérarchie visuelle
 * - Remplacement des couleurs statiques par des gradients enrichis
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
  logo:       string;  // couleur primaire — zone maîtresse
  nom:        string;  // analogue chaude — proximité avec le logo
  titre:      string;  // teinte claire — hiérarchie secondaire
  contact:    string;  // teinte — discret, lisible
  separateur: string;  // complémentaire — tension visuelle subtile
  fond:       string;  // version sombre — ne doit pas concurrencer
  cta:        string;  // triadique 1 — appel fort différencié
}

export interface ColorAnalysis {
  hue:         number;
  saturation:  number;
  lightness:   number;
  temperature: 'warm' | 'cool' | 'neutral';
  vibrancy:    'muted' | 'moderate' | 'vivid';
  luminance:   number;
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

// ─── Analyse couleur ────────────────────────────────────────────────────────

export function analyzeColor(hex: string): ColorAnalysis {
  const { h, s, l } = hexToHsl(hex);
  const temperature: 'warm' | 'cool' | 'neutral' =
    (h >= 0 && h <= 60) || (h >= 300 && h <= 360) ? 'warm' :
    (h >= 180 && h <= 300) ? 'cool' : 'neutral';
  const vibrancy: 'muted' | 'moderate' | 'vivid' =
    s < 30 ? 'muted' : s < 70 ? 'moderate' : 'vivid';
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const bN = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * bN;
  return { hue: h, saturation: s, lightness: l, temperature, vibrancy, luminance };
}

// ─── Génération de l'harmonie complète ─────────────────────────────────────

export function generateHarmonyPalette(primaryHex: string): HarmonyPalette {
  const { h, s, l } = hexToHsl(primaryHex);

  // Saturation adaptative : couleurs très désaturées → on booste un peu pour les effets
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

/**
 * Mappe les couleurs de la palette aux zones selon la hiérarchie visuelle :
 * Logo (dominant) → Nom (proche) → CTA (appel fort) → Séparateur → Fond → Titre → Contact
 */
export function buildZoneColorMap(
  harmony: HarmonyPalette,
  bgColor: string,
  variation: 'A' | 'B' | 'C' | 'D'
): ZoneColorMap {
  // Chaque variation utilise un mapping légèrement différent pour la diversité
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

  return maps[variation] ?? maps.A;
}

// ─── Enrichissement des couleurs de zone ────────────────────────────────────

/**
 * Point d'entrée principal : enrichit une couleur de base avec les harmonies
 * et retourne le mapping zone → couleur pour une variation donnée.
 */
export function enrichZoneColors(
  primaryHex: string,
  bgHex: string,
  variation: 'A' | 'B' | 'C' | 'D'
): ZoneColorMap {
  const safe = primaryHex && primaryHex.startsWith('#') ? primaryHex : '#6366f1';
  const safeBg = bgHex && bgHex.startsWith('#') ? bgHex : '#0f172a';
  const harmony = generateHarmonyPalette(safe);
  return buildZoneColorMap(harmony, safeBg, variation);
}

/**
 * Génère un gradient SVG inline à partir d'une couleur et de son harmonique.
 * Utilisé pour remplacer les couleurs plates par des dégradés enrichis.
 */
export function buildGradientStop(
  baseHex: string,
  offsetPct: number,
  opacity = 1
): string {
  const { h, s, l } = hexToHsl(baseHex);
  const variantHex = hslToHex(h + 15, s * 1.1, l + 8);
  return `<stop offset="${offsetPct}%" stop-color="${variantHex}" stop-opacity="${opacity}"/>`;
}

console.log('🎨 Color Harmony Engine chargé — harmonies triadiques/analogues/split-complémentaires actives');
