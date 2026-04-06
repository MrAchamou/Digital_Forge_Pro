/**
 * 🎯 SMART OPTIMIZER
 *
 * Optimiseur de paramètres intelligent basé sur l'analyse de contenu.
 * Calcule les intensités, vitesses et délais optimaux selon :
 * - Le secteur d'activité (finance → discret, tech → expressif)
 * - Le profil de variation (A=calme, D=explosif)
 * - La présence et complexité du logo
 * - Le ton émotionnel détecté par les IAs
 *
 * Remplace les constantes hardcodées par des fonctions d'optimisation dynamique.
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';

export type VariationKey = 'A' | 'B' | 'C' | 'D';
export type MovementIntensity = 'minimal' | 'subtil' | 'expressif' | 'dramatique';

export interface SignatureContent {
  has_logo:        boolean;
  logo_complexity: 'simple' | 'detailed' | 'complex';  // icon vs photo vs illustration
  text_length:     'short' | 'medium' | 'long';
  has_cta:         boolean;
  secteur:         string;
  ton_emotionnel:  string;
  intensite:       MovementIntensity;
}

export interface ZoneOptimizationProfile {
  zone:                 string;
  recommended_intensity: number;
  recommended_speed:    'slow' | 'medium' | 'fast';
  reasoning:            string;
}

export interface OptimizationResult {
  composition:  ZoneComposition;
  profiles:     ZoneOptimizationProfile[];
  boost_factor: number;   // multiplicateur global appliqué (0.5–1.5)
  summary:      string;
}

// ─── Matrices de calibration par secteur ─────────────────────────────────────

const SECTOR_INTENSITY_MATRIX: Record<string, {
  global_mult:  number;
  logo_bias:    number;   // boost/réduction sur le logo
  cta_bias:     number;   // boost/réduction sur le CTA
  fond_cap:     number;   // cap sur le fond (évite distraction)
}> = {
  finance:    { global_mult: 0.70, logo_bias: -0.05, cta_bias: +0.10, fond_cap: 0.25 },
  legal:      { global_mult: 0.60, logo_bias: -0.10, cta_bias: +0.05, fond_cap: 0.20 },
  medical:    { global_mult: 0.65, logo_bias: -0.05, cta_bias: +0.08, fond_cap: 0.22 },
  luxe:       { global_mult: 0.85, logo_bias: +0.05, cta_bias: +0.05, fond_cap: 0.40 },
  tech:       { global_mult: 0.95, logo_bias: +0.05, cta_bias: +0.15, fond_cap: 0.50 },
  startup:    { global_mult: 1.00, logo_bias: +0.10, cta_bias: +0.20, fond_cap: 0.55 },
  creative:   { global_mult: 1.05, logo_bias: +0.10, cta_bias: +0.15, fond_cap: 0.60 },
  retail:     { global_mult: 0.90, logo_bias: +0.05, cta_bias: +0.15, fond_cap: 0.45 },
  immobilier: { global_mult: 0.80, logo_bias: 0.00,  cta_bias: +0.10, fond_cap: 0.35 },
  default:    { global_mult: 0.88, logo_bias: 0.00,  cta_bias: +0.10, fond_cap: 0.40 },
};

// Profils de vitesse par variation
const VARIATION_SPEED_PROFILE: Record<VariationKey, {
  logo_speed:  'slow' | 'medium' | 'fast';
  nom_speed:   'slow' | 'medium' | 'fast';
  fond_speed:  'slow' | 'medium' | 'fast';
  cta_speed:   'slow' | 'medium' | 'fast';
}> = {
  A: { logo_speed: 'slow',   nom_speed: 'slow',   fond_speed: 'slow',   cta_speed: 'slow'   },
  B: { logo_speed: 'medium', nom_speed: 'medium', fond_speed: 'slow',   cta_speed: 'medium' },
  C: { logo_speed: 'slow',   nom_speed: 'medium', fond_speed: 'slow',   cta_speed: 'medium' },
  D: { logo_speed: 'fast',   nom_speed: 'fast',   fond_speed: 'medium', cta_speed: 'fast'   },
};

// Boost par intensité de mouvement
const MOVEMENT_BOOST: Record<MovementIntensity, number> = {
  minimal:    0.60,
  subtil:     0.80,
  expressif:  1.00,
  dramatique: 1.20,
};

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSecteur(raw: string): string {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('financ') || lower.includes('banque') || lower.includes('assur')) return 'finance';
  if (lower.includes('jur') || lower.includes('droit') || lower.includes('avocat')) return 'legal';
  if (lower.includes('méd') || lower.includes('sant') || lower.includes('pharma')) return 'medical';
  if (lower.includes('luxe') || lower.includes('mode') || lower.includes('joaill')) return 'luxe';
  if (lower.includes('tech') || lower.includes('saas') || lower.includes(' ia ') || lower.includes('logiciel')) return 'tech';
  if (lower.includes('startup') || lower.includes('scale')) return 'startup';
  if (lower.includes('créa') || lower.includes('design') || lower.includes('agence')) return 'creative';
  if (lower.includes('retail') || lower.includes('e-com') || lower.includes('boutique')) return 'retail';
  if (lower.includes('immob')) return 'immobilier';
  return 'default';
}

// ─── Optimisation zone par zone ──────────────────────────────────────────────

function optimizeZoneDecision(
  zone: string,
  decision: ZoneEffectDecision,
  sectorMatrix: typeof SECTOR_INTENSITY_MATRIX[string],
  variationProfile: typeof VARIATION_SPEED_PROFILE[VariationKey],
  globalMult: number,
  content: SignatureContent
): { decision: ZoneEffectDecision; profile: ZoneOptimizationProfile } {
  let targetIntensity = decision.intensity;
  let targetSpeed     = decision.speed;
  let reasoning       = '';

  // ── Calcul de l'intensité optimale ─────────────────────────────────────
  const baseIntensity = decision.intensity * sectorMatrix.global_mult * globalMult;

  switch (zone) {
    case 'logo': {
      const logoMult = content.has_logo ? 1.0 : 0.7;
      const complexMult = { simple: 1.0, detailed: 0.9, complex: 0.85 }[content.logo_complexity] ?? 1.0;
      targetIntensity = clamp(baseIntensity * complexMult * logoMult + sectorMatrix.logo_bias, 0.15, 1.0);
      targetSpeed     = variationProfile.logo_speed;
      reasoning       = `Logo ${content.logo_complexity} × secteur (${(sectorMatrix.global_mult * 100).toFixed(0)}%)`;
      break;
    }
    case 'nom': {
      targetIntensity = clamp(baseIntensity * 0.85, 0.15, 0.85);
      targetSpeed     = variationProfile.nom_speed;
      reasoning       = 'Nom : 85% du logo pour hiérarchie lisible';
      break;
    }
    case 'cta': {
      targetIntensity = clamp(baseIntensity + sectorMatrix.cta_bias, 0.20, 0.95);
      targetSpeed     = variationProfile.cta_speed;
      reasoning       = `CTA boosté +${(sectorMatrix.cta_bias * 100).toFixed(0)}% pour impact`;
      break;
    }
    case 'fond': {
      targetIntensity = clamp(baseIntensity * 0.6, 0.05, sectorMatrix.fond_cap);
      targetSpeed     = variationProfile.fond_speed;
      reasoning       = `Fond plafonné à ${(sectorMatrix.fond_cap * 100).toFixed(0)}% — non-distraction`;
      break;
    }
    case 'separateur': {
      targetIntensity = clamp(baseIntensity * 0.7, 0.10, 0.65);
      targetSpeed     = decision.speed;
      reasoning       = 'Séparateur : rythme sans concurrence';
      break;
    }
    case 'titre': {
      targetIntensity = clamp(baseIntensity * 0.5, 0.05, 0.40);
      targetSpeed     = 'slow';
      reasoning       = 'Titre : lisibilité avant tout (< 0.40)';
      break;
    }
    case 'contact': {
      targetIntensity = clamp(baseIntensity * 0.4, 0.05, 0.35);
      targetSpeed     = 'slow';
      reasoning       = 'Contact : discret, fonctionnel';
      break;
    }
    default: {
      targetIntensity = clamp(baseIntensity, 0.10, 0.80);
      reasoning       = 'Default';
    }
  }

  // Appliquer les optimisations aux couches si présentes
  const layers = decision.layers?.map((l) => {
    const layerBoost = zone === 'logo' ? 1.0 : 0.85;
    return {
      ...l,
      intensity: clamp((l.intensity ?? 0.5) * sectorMatrix.global_mult * globalMult * layerBoost, 0.05, targetIntensity),
      speed: targetSpeed,
    };
  });

  const optimizedDecision: ZoneEffectDecision = {
    ...decision,
    intensity: parseFloat(targetIntensity.toFixed(3)),
    speed:     targetSpeed,
    layers,
  };

  return {
    decision: optimizedDecision,
    profile:  { zone, recommended_intensity: targetIntensity, recommended_speed: targetSpeed, reasoning },
  };
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Point d'entrée principal.
 * Optimise toutes les zones d'une composition selon le contexte métier.
 */
export function optimizeComposition(
  composition: ZoneComposition,
  variation:   VariationKey,
  secteur:     string,
  content:     Partial<SignatureContent> = {}
): OptimizationResult {
  const fullContent: SignatureContent = {
    has_logo:        true,
    logo_complexity: 'detailed',
    text_length:     'medium',
    has_cta:         true,
    secteur,
    ton_emotionnel:  'professionnel',
    intensite:       'subtil',
    ...content,
  };

  const sectorKey    = normalizeSecteur(secteur);
  const sectorMatrix = SECTOR_INTENSITY_MATRIX[sectorKey] ?? SECTOR_INTENSITY_MATRIX.default;
  const varProfile   = VARIATION_SPEED_PROFILE[variation];
  const globalMult   = MOVEMENT_BOOST[fullContent.intensite];
  const boostFactor  = sectorMatrix.global_mult * globalMult;

  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const profiles: ZoneOptimizationProfile[] = [];
  const optimized: Partial<ZoneComposition> = {};

  for (const zone of zones) {
    const decision: ZoneEffectDecision = (composition as any)[zone];
    const result = optimizeZoneDecision(zone, decision, sectorMatrix, varProfile, globalMult, fullContent);
    (optimized as any)[zone] = result.decision;
    profiles.push(result.profile);
  }

  const summary = `SmartOptimizer [${variation}] secteur:${sectorKey} mult:${boostFactor.toFixed(2)} | ${profiles.map(p => `${p.zone[0].toUpperCase()}:${(p.recommended_intensity * 100).toFixed(0)}%`).join(' ')}`;
  console.log(`🎯 ${summary}`);

  return {
    composition:  optimized as ZoneComposition,
    profiles,
    boost_factor: parseFloat(boostFactor.toFixed(3)),
    summary,
  };
}

/**
 * Analyse les métadonnées brutes de la signature pour construire un SignatureContent.
 */
export function analyzeSignatureContent(metadata: any, secteur: string): SignatureContent {
  const hasLogo        = !!(metadata?.logo || metadata?.has_logo);
  const logoComplexity = metadata?.logo_type === 'photo' ? 'complex'
                       : metadata?.logo_type === 'illustration' ? 'detailed'
                       : 'simple';
  const nameLen   = (metadata?.nom || metadata?.name || '').length;
  const textLength: SignatureContent['text_length'] = nameLen > 30 ? 'long' : nameLen > 15 ? 'medium' : 'short';
  const intensite: MovementIntensity = metadata?.intensite_mouvement ?? 'subtil';

  return {
    has_logo:        hasLogo,
    logo_complexity: logoComplexity,
    text_length:     textLength,
    has_cta:         !!(metadata?.cta || metadata?.has_cta),
    secteur,
    ton_emotionnel:  metadata?.ton || 'professionnel',
    intensite,
  };
}

console.log('🎯 Smart Optimizer chargé — calibration par secteur + profils de variation + contenu signature');
