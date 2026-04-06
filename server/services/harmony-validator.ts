export interface ZoneEffectDecision {
  effet_id: string;
  intensity: number;
  speed: 'slow' | 'medium' | 'fast';
  color: string;
  raison?: string;
}

export interface ZoneComposition {
  logo: ZoneEffectDecision;
  nom: ZoneEffectDecision;
  titre: ZoneEffectDecision;
  contact: ZoneEffectDecision;
  separateur: ZoneEffectDecision;
  fond: ZoneEffectDecision;
  cta: ZoneEffectDecision;
}

export interface ValidationResult {
  valid: boolean;
  corrections: string[];
  config: ZoneComposition;
  score_harmonie: number;
}

const HIERARCHY_ORDER = ['logo', 'nom', 'cta', 'separateur', 'fond', 'titre', 'contact'] as const;
type ZoneName = typeof HIERARCHY_ORDER[number];

const SPEED_VALUES: Record<string, number> = { slow: 1, medium: 2, fast: 3 };

function hexToHsl(hex: string): { h: number; s: number; l: number } {
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
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function luminanceFromHex(hex: string): number {
  if (!hex || hex.length < 7) return 0.5;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker  = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateHarmony(
  composition: ZoneComposition,
  palette: string[]
): ValidationResult {
  const corrections: string[] = [];
  const config = JSON.parse(JSON.stringify(composition)) as ZoneComposition;

  const zones = Object.keys(config) as ZoneName[];

  // RÈGLE 1 — Densité visuelle
  const animatedZones = zones.filter(z => {
    const effect = config[z];
    return effect.intensity > 0 && effect.effet_id !== 'CTA_STATIC_PRESENCE' && effect.effet_id !== 'FOND_CLEAN_DARK';
  });
  if (animatedZones.length > 6) {
    if (config.fond.intensity > 0) {
      config.fond.intensity = parseFloat((config.fond.intensity * 0.6).toFixed(3));
      corrections.push(`Règle 1: Densité visuelle élevée — fond réduit à ${config.fond.intensity}`);
    }
  }

  // RÈGLE 2 — Hiérarchie visuelle
  const intensities: Partial<Record<ZoneName, number>> = {};
  for (const z of zones) {
    intensities[z] = config[z]?.intensity ?? 0;
  }

  const logoIntensity = intensities['logo'] ?? 0;
  const nomIntensity  = intensities['nom']  ?? 0;

  if (nomIntensity > logoIntensity && logoIntensity > 0) {
    config.nom.intensity = parseFloat((logoIntensity * 0.85).toFixed(3));
    corrections.push(`Règle 2: Nom recalibré à ${config.nom.intensity} (< logo ${logoIntensity})`);
  }

  const ctaIntensity = intensities['cta'] ?? 0;
  const sepIntensity = intensities['separateur'] ?? 0;
  if (sepIntensity > ctaIntensity && ctaIntensity > 0) {
    config.separateur.intensity = parseFloat((ctaIntensity * 0.9).toFixed(3));
    corrections.push(`Règle 2: Séparateur recalibré sous CTA`);
  }

  const fondIntensity  = intensities['fond']    ?? 0;
  const titreIntensity = intensities['titre']   ?? 0;
  if (fondIntensity > sepIntensity && sepIntensity > 0) {
    config.fond.intensity = parseFloat((sepIntensity * 0.7).toFixed(3));
    corrections.push(`Règle 2: Fond recalibré sous séparateur`);
  }
  if (titreIntensity > fondIntensity && fondIntensity > 0) {
    config.titre.intensity = parseFloat((fondIntensity * 0.85).toFixed(3));
    corrections.push(`Règle 2: Titre recalibré sous fond`);
  }

  // RÈGLE 3 — Cohérence de vitesse
  const logoSpeed = SPEED_VALUES[config.logo?.speed ?? 'medium'];
  for (const z of zones) {
    if (z === 'logo') continue;
    const speedVal = SPEED_VALUES[config[z]?.speed ?? 'medium'];
    if (Math.abs(speedVal - logoSpeed) > 1) {
      const harmonized = logoSpeed <= 1 ? 'slow' : logoSpeed >= 3 ? 'medium' : 'medium';
      config[z].speed = harmonized as any;
      corrections.push(`Règle 3: Vitesse de ${z} harmonisée à '${harmonized}' (cohérence logo)`);
    }
  }

  // RÈGLE 4 — Compatibilité palette
  const validColors = new Set(palette.map(c => c.toLowerCase()));
  for (const z of zones) {
    const color = config[z]?.color?.toLowerCase();
    if (color && color !== '#000000' && !validColors.has(color)) {
      const closestColor = palette[0] ?? '#6366f1';
      config[z].color = closestColor;
      corrections.push(`Règle 4: Couleur de ${z} remplacée par palette (${closestColor})`);
    }
  }

  // RÈGLE 5 — Test lisibilité (contraste)
  const bgColor = palette[0] ?? '#0f172a';
  const bgLum = luminanceFromHex(bgColor);
  const effectLum = luminanceFromHex(config.fond?.color ?? bgColor);
  const cr = contrastRatio(bgLum, effectLum);

  if (cr < 1.5 && config.fond.intensity > 0.1) {
    config.fond.intensity = parseFloat(Math.min(config.fond.intensity, 0.08).toFixed(3));
    corrections.push(`Règle 5: Fond atténué (contraste insuffisant, ratio: ${cr.toFixed(2)})`);
  }

  // Score d'harmonie
  const score_harmonie = Math.max(0, 1 - corrections.length * 0.08);

  return {
    valid: true,
    corrections,
    config,
    score_harmonie: parseFloat(score_harmonie.toFixed(2)),
  };
}
