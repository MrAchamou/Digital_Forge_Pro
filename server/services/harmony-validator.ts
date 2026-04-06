// ═══════════════════════════════════════════════════════
// TYPES MULTI-COUCHES
// ═══════════════════════════════════════════════════════

export interface EffectLayer {
  effet_id: string;
  category: string;  // 'dimension' | 'matiere' | 'energie' | 'transformation' | 'lumiere' | 'mouvement' | 'primary' | 'secondary'
  intensity: number;
  speed: 'slow' | 'medium' | 'fast';
  color: string;
  raison?: string;
}

export interface ZoneEffectDecision {
  effet_id: string;  // effet principal (backward compat)
  intensity: number;
  speed: 'slow' | 'medium' | 'fast';
  color: string;
  raison?: string;
  layers?: EffectLayer[];  // couches multiples — le cœur du système WOW
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

// ═══════════════════════════════════════════════════════
// VALIDATION D'HARMONIE MULTI-COUCHES
// ═══════════════════════════════════════════════════════

export function validateHarmony(
  composition: ZoneComposition,
  palette: string[]
): ValidationResult {
  const corrections: string[] = [];
  const config = JSON.parse(JSON.stringify(composition)) as ZoneComposition;

  const zones = Object.keys(config) as ZoneName[];

  // RÈGLE 1 — Densité visuelle globale
  // 🌀 Chaos Organisé : tolérance augmentée, on atténue seulement en cas de surcharge extrême
  const totalLayers = zones.reduce((sum, z) => sum + (config[z]?.layers?.length || 0), 0);
  const animatedZones = zones.filter(z => {
    const effect = config[z];
    return effect.intensity > 0 && effect.effet_id !== 'CTA_STATIC_PRESENCE' && effect.effet_id !== 'FOND_CLEAN_DARK';
  });
  if (animatedZones.length >= 7 && totalLayers > 16) {
    // Vraie surcharge extrême — atténuer seulement le fond
    if (config.fond.intensity > 0) {
      config.fond.intensity = parseFloat((config.fond.intensity * 0.75).toFixed(3));
      if (config.fond.layers) {
        config.fond.layers.forEach(l => l.intensity = parseFloat((l.intensity * 0.75).toFixed(3)));
      }
      corrections.push(`Règle 1: Surcharge chaos (${totalLayers} couches) — fond atténué légèrement`);
    }
  }

  // RÈGLE 2 — Hiérarchie visuelle
  const intensities: Partial<Record<ZoneName, number>> = {};
  for (const z of zones) intensities[z] = config[z]?.intensity ?? 0;

  const logoInt = intensities['logo'] ?? 0;
  const nomInt  = intensities['nom']  ?? 0;

  if (nomInt > logoInt && logoInt > 0) {
    config.nom.intensity = parseFloat((logoInt * 0.85).toFixed(3));
    corrections.push(`Règle 2: Nom recalibré à ${config.nom.intensity} (< logo ${logoInt})`);
  }

  const ctaInt = intensities['cta'] ?? 0;
  const sepInt = intensities['separateur'] ?? 0;
  if (sepInt > ctaInt && ctaInt > 0) {
    config.separateur.intensity = parseFloat((ctaInt * 0.9).toFixed(3));
    corrections.push(`Règle 2: Séparateur recalibré sous CTA`);
  }

  const fondInt  = intensities['fond']  ?? 0;
  const titreInt = intensities['titre'] ?? 0;
  if (fondInt > sepInt && sepInt > 0) {
    config.fond.intensity = parseFloat((sepInt * 0.7).toFixed(3));
    corrections.push(`Règle 2: Fond recalibré sous séparateur`);
  }
  if (titreInt > fondInt && fondInt > 0) {
    config.titre.intensity = parseFloat((fondInt * 0.85).toFixed(3));
    corrections.push(`Règle 2: Titre recalibré sous fond`);
  }

  // RÈGLE 3 — Cohérence de vitesse
  const logoSpeed = SPEED_VALUES[config.logo?.speed ?? 'medium'];
  for (const z of zones) {
    if (z === 'logo') continue;
    const speedVal = SPEED_VALUES[config[z]?.speed ?? 'medium'];
    if (Math.abs(speedVal - logoSpeed) > 1) {
      const harmonized = logoSpeed <= 1 ? 'slow' : 'medium';
      config[z].speed = harmonized as any;
      corrections.push(`Règle 3: Vitesse ${z} → '${harmonized}'`);
    }
  }

  // RÈGLE 4 — Intensités des couches secondaires atténuées
  // 🌀 Chaos Organisé : cascade douce, les couches gardent assez d'intensité pour être visibles
  for (const z of zones) {
    const layers = config[z]?.layers;
    if (layers && layers.length > 1) {
      layers.forEach((layer, idx) => {
        if (idx > 0) {
          // Chaque couche suivante peut avoir jusqu'à 80% de l'intensité de la précédente
          const maxAllowed = config[z].intensity * (0.80 - idx * 0.08);
          if (layer.intensity > maxAllowed) {
            layer.intensity = parseFloat(Math.max(0.05, maxAllowed).toFixed(3));
          }
        }
      });
    }
  }

  // RÈGLE 5 — Test lisibilité fond
  const bgColor = palette[0] ?? '#0f172a';
  const bgLum = luminanceFromHex(bgColor);
  const effectLum = luminanceFromHex(config.fond?.color ?? bgColor);
  const cr = contrastRatio(bgLum, effectLum);

  if (cr < 1.5 && config.fond.intensity > 0.1) {
    config.fond.intensity = parseFloat(Math.min(config.fond.intensity, 0.08).toFixed(3));
    corrections.push(`Règle 5: Fond atténué (contraste insuffisant: ${cr.toFixed(2)})`);
  }

  const score_harmonie = Math.max(0, 1 - corrections.length * 0.07);

  return {
    valid: true,
    corrections,
    config,
    score_harmonie: parseFloat(score_harmonie.toFixed(2)),
  };
}
