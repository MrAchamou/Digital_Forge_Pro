/**
 * 🎯 SMART OPTIMIZER — v2.0
 *
 * - Optimisation multi-objectifs de Pareto (impact visuel + compatibilité email)
 * - Simulation des 5 principaux clients email (Gmail, Outlook 365, Apple Mail, Yahoo, Thunderbird)
 * - Réduction automatique de la complexité si le poids SVG dépasse 50 KB
 * - Détection des propriétés CSS qui causent des repaints coûteux + substitution
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';

export type VariationKey = 'A' | 'B' | 'C' | 'D';
export type MovementIntensity = 'minimal' | 'subtil' | 'expressif' | 'dramatique';

export interface SignatureContent {
  has_logo:        boolean;
  logo_complexity: 'simple' | 'detailed' | 'complex';
  text_length:     'short' | 'medium' | 'long';
  has_cta:         boolean;
  secteur:         string;
  ton_emotionnel:  string;
  intensite:       MovementIntensity;
  /** Taille estimée du SVG en bytes (optionnel) */
  svg_size_bytes?: number;
}

export interface ZoneOptimizationProfile {
  zone:                  string;
  recommended_intensity: number;
  recommended_speed:     'slow' | 'medium' | 'fast';
  reasoning:             string;
}

export interface EmailClientSimulation {
  client:       'gmail' | 'outlook365' | 'apple_mail' | 'yahoo' | 'thunderbird';
  supports_css_animations: boolean;
  supports_svg_animations: boolean;
  supports_filter:         boolean;
  supports_transform:      boolean;
  max_svg_kb:              number;
  notes:                   string;
}

export interface ParetoPoint {
  /** Score impact visuel (0-1) */
  visual_impact:   number;
  /** Score compatibilité email (0-1, 1 = compatible partout) */
  email_compat:    number;
  /** Score Pareto global (pondéré) */
  pareto_score:    number;
  /** Descriptif de la configuration */
  label:           string;
}

export interface OptimizationResult {
  composition:       ZoneComposition;
  profiles:          ZoneOptimizationProfile[];
  boost_factor:      number;
  summary:           string;
  pareto:            ParetoPoint;
  email_simulations: EmailClientSimulation[];
  svg_warnings:      string[];
  repaint_warnings:  string[];
}

// ─── Profils des clients email ───────────────────────────────────────────────

const EMAIL_CLIENT_PROFILES: EmailClientSimulation[] = [
  {
    client:                  'gmail',
    supports_css_animations: true,
    supports_svg_animations: true,
    supports_filter:         true,
    supports_transform:      true,
    max_svg_kb:              100,
    notes:                   'Excellent support CSS/SVG. Attention aux grandes images embarquées.',
  },
  {
    client:                  'outlook365',
    supports_css_animations: true,   // Outlook 365 web (≠ Outlook 2016/2019 desktop)
    supports_svg_animations: true,
    supports_filter:         false,  // filter: blur() non supporté
    supports_transform:      true,
    max_svg_kb:              80,
    notes:                   'filter: CSS non supporté. Éviter box-shadow complexes.',
  },
  {
    client:                  'apple_mail',
    supports_css_animations: true,
    supports_svg_animations: true,
    supports_filter:         true,
    supports_transform:      true,
    max_svg_kb:              200,
    notes:                   'Excellent support général. Pas de limitation notable.',
  },
  {
    client:                  'yahoo',
    supports_css_animations: true,
    supports_svg_animations: false,  // SVG animations partiellement supportées
    supports_filter:         false,
    supports_transform:      true,
    max_svg_kb:              60,
    notes:                   'Support SVG animations limité. Préférer les transitions CSS simples.',
  },
  {
    client:                  'thunderbird',
    supports_css_animations: true,
    supports_svg_animations: true,
    supports_filter:         true,
    supports_transform:      true,
    max_svg_kb:              150,
    notes:                   'Bon support général basé sur Gecko.',
  },
];

// ─── Propriétés CSS coûteuses (repaints) ────────────────────────────────────

const EXPENSIVE_CSS_PROPERTIES: Array<{
  property: string;
  cost:     'high' | 'medium';
  substitute?: string;
}> = [
  { property: 'filter',      cost: 'high',   substitute: 'opacity (pour les effets de fondu)' },
  { property: 'box-shadow',  cost: 'high',   substitute: 'outline ou border' },
  { property: 'border-radius', cost: 'medium', substitute: 'clip-path' },
  { property: 'background',  cost: 'medium', substitute: 'background-color (gradient fixe)' },
];

// ─── Matrices de calibration ──────────────────────────────────────────────────

const SECTOR_INTENSITY_MATRIX: Record<string, {
  global_mult: number;
  logo_bias:   number;
  cta_bias:    number;
  fond_cap:    number;
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

const VARIATION_SPEED_PROFILE: Record<VariationKey, {
  logo_speed: 'slow' | 'medium' | 'fast';
  nom_speed:  'slow' | 'medium' | 'fast';
  fond_speed: 'slow' | 'medium' | 'fast';
  cta_speed:  'slow' | 'medium' | 'fast';
}> = {
  A: { logo_speed: 'slow',   nom_speed: 'slow',   fond_speed: 'slow',   cta_speed: 'slow'   },
  B: { logo_speed: 'medium', nom_speed: 'medium', fond_speed: 'slow',   cta_speed: 'medium' },
  C: { logo_speed: 'slow',   nom_speed: 'medium', fond_speed: 'slow',   cta_speed: 'medium' },
  D: { logo_speed: 'fast',   nom_speed: 'fast',   fond_speed: 'medium', cta_speed: 'fast'   },
};

const MOVEMENT_BOOST: Record<MovementIntensity, number> = {
  minimal: 0.60, subtil: 0.80, expressif: 1.00, dramatique: 1.20,
};

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSecteur(raw: string): string {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('financ') || lower.includes('banque') || lower.includes('assur')) return 'finance';
  if (lower.includes('jur') || lower.includes('droit') || lower.includes('avocat')) return 'legal';
  if (lower.includes('méd') || lower.includes('sant') || lower.includes('pharma')) return 'medical';
  if (lower.includes('luxe') || lower.includes('mode') || lower.includes('joaill')) return 'luxe';
  if (lower.includes('tech') || lower.includes('saas') || lower.includes('ia') || lower.includes('logiciel')) return 'tech';
  if (lower.includes('startup') || lower.includes('scale')) return 'startup';
  if (lower.includes('créa') || lower.includes('design') || lower.includes('agence')) return 'creative';
  if (lower.includes('retail') || lower.includes('e-com') || lower.includes('boutique')) return 'retail';
  if (lower.includes('immob')) return 'immobilier';
  return 'default';
}

// ─── Simulation clients email ────────────────────────────────────────────────

/**
 * Évalue la compatibilité d'une composition avec les 5 principaux clients email.
 * Retourne un score global de compatibilité (0-1).
 */
export function simulateEmailClients(
  composition: ZoneComposition,
  svgSizeBytes?: number
): { simulations: EmailClientSimulation[]; compat_score: number; warnings: string[] } {
  const warnings: string[] = [];
  let compatPoints = 0;
  let totalPoints  = 0;

  for (const profile of EMAIL_CLIENT_PROFILES) {
    let clientOk = true;

    // Vérification poids SVG
    if (svgSizeBytes && svgSizeBytes > profile.max_svg_kb * 1024) {
      warnings.push(`⚠️ ${profile.client} : SVG trop lourd (${(svgSizeBytes / 1024).toFixed(0)} KB > ${profile.max_svg_kb} KB)`);
      clientOk = false;
    }

    // Vérification support filter CSS
    if (!profile.supports_filter) {
      const zones = Object.values(composition as any) as ZoneEffectDecision[];
      const hasFilterEffect = zones.some(z => {
        const id = z?.effet_id?.toLowerCase() ?? '';
        return id.includes('glow') || id.includes('blur') || id.includes('neon');
      });
      if (hasFilterEffect) {
        warnings.push(`⚠️ ${profile.client} : filter CSS non supporté — les effets GLOW/NEON peuvent ne pas s'afficher`);
        clientOk = false;
      }
    }

    // Vérification SVG animations
    if (!profile.supports_svg_animations) {
      warnings.push(`⚠️ ${profile.client} : animations SVG SMIL non supportées — utiliser uniquement CSS animations`);
      clientOk = false;
    }

    totalPoints++;
    if (clientOk) compatPoints++;
  }

  const compat_score = totalPoints > 0 ? compatPoints / totalPoints : 1;
  return { simulations: EMAIL_CLIENT_PROFILES, compat_score, warnings };
}

// ─── Détection propriétés CSS coûteuses ─────────────────────────────────────

/**
 * Détecte les effets SVG qui génèrent des propriétés CSS coûteuses (repaints).
 * Retourne des recommandations de substitution.
 */
export function detectExpensiveCSSProperties(composition: ZoneComposition): string[] {
  const warnings: string[] = [];
  const zones = Object.entries(composition as any) as [string, ZoneEffectDecision][];

  for (const [zone, decision] of zones) {
    if (!decision?.effet_id) continue;
    const effectId = decision.effet_id.toLowerCase();

    for (const css of EXPENSIVE_CSS_PROPERTIES) {
      const triggersExpensive =
        (css.property === 'filter'     && (effectId.includes('glow') || effectId.includes('neon') || effectId.includes('blur'))) ||
        (css.property === 'box-shadow' && (effectId.includes('shadow') || effectId.includes('aura'))) ||
        (css.property === 'background' && decision.intensity > 0.8);

      if (triggersExpensive) {
        warnings.push(
          `🔧 Zone ${zone} / ${decision.effet_id} : utilise "${css.property}" (coût:${css.cost})` +
          (css.substitute ? ` → substitut recommandé : ${css.substitute}` : '')
        );
      }
    }
  }
  return warnings;
}

// ─── Réduction automatique si SVG > 50 KB ───────────────────────────────────

const SVG_SIZE_THRESHOLD_BYTES = 50 * 1024;  // 50 KB

/**
 * Réduit automatiquement la complexité de la composition si le SVG est trop lourd.
 * Stratégie : réduire les intensités et supprimer les couches secondaires.
 */
export function reduceSVGComplexity(
  composition: ZoneComposition,
  svgSizeBytes: number
): { composition: ZoneComposition; reductions: string[] } {
  if (svgSizeBytes <= SVG_SIZE_THRESHOLD_BYTES) {
    return { composition, reductions: [] };
  }

  const overloadRatio = svgSizeBytes / SVG_SIZE_THRESHOLD_BYTES;
  const reductionFactor = Math.max(0.5, 1 / overloadRatio);
  const reductions: string[] = [`SVG ${(svgSizeBytes / 1024).toFixed(0)} KB > 50 KB — réduction complexité × ${reductionFactor.toFixed(2)}`];

  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const reduced: Partial<ZoneComposition> = {};

  for (const zone of zones) {
    const decision: ZoneEffectDecision = (composition as any)[zone];
    const newIntensity = clamp(decision.intensity * reductionFactor, 0.05, decision.intensity);

    // Supprimer les couches secondaires si le fichier est vraiment trop lourd (> 80 KB)
    const layers = svgSizeBytes > 80 * 1024 ? undefined : decision.layers;

    if (Math.abs(newIntensity - decision.intensity) > 0.02) {
      reductions.push(`Zone ${zone}: intensité ${(decision.intensity * 100).toFixed(0)}% → ${(newIntensity * 100).toFixed(0)}%`);
    }

    (reduced as any)[zone] = { ...decision, intensity: parseFloat(newIntensity.toFixed(3)), layers };
  }

  return { composition: reduced as ZoneComposition, reductions };
}

// ─── Optimisation Pareto ──────────────────────────────────────────────────────

/**
 * Calcule le score Pareto de la composition : équilibre impact visuel et compatibilité email.
 * L'objectif est de maximiser les deux simultanément (front de Pareto).
 */
export function computeParetoScore(
  composition: ZoneComposition,
  variation: VariationKey,
  emailCompatScore: number
): ParetoPoint {
  const zones = Object.values(composition as any) as ZoneEffectDecision[];
  const avgIntensity = zones.reduce((s, z) => s + (z?.intensity ?? 0), 0) / Math.max(zones.length, 1);
  const avgLayers    = zones.reduce((s, z) => s + (z?.layers?.length ?? 1), 0) / Math.max(zones.length, 1);

  // Impact visuel = intensité × richesse des couches × bonus variation D
  const variationBonus = variation === 'D' ? 1.2 : variation === 'A' ? 0.9 : 1.0;
  const visual_impact  = clamp(avgIntensity * (1 + (avgLayers - 1) * 0.15) * variationBonus, 0, 1);

  // Score Pareto pondéré : 60% compatibilité + 40% impact visuel
  // (La compatibilité prime car une belle signature invisible ne sert à rien)
  const pareto_score = parseFloat((emailCompatScore * 0.60 + visual_impact * 0.40).toFixed(3));

  const label = pareto_score >= 0.8 ? '🏆 Optimal' :
                pareto_score >= 0.6 ? '✅ Bon équilibre' :
                pareto_score >= 0.4 ? '⚠️ Compromis' : '❌ À revoir';

  return { visual_impact: parseFloat(visual_impact.toFixed(3)), email_compat: emailCompatScore, pareto_score, label };
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

  const baseIntensity = decision.intensity * sectorMatrix.global_mult * globalMult;

  switch (zone) {
    case 'logo': {
      const logoMult   = content.has_logo ? 1.0 : 0.7;
      const complexMult = { simple: 1.0, detailed: 0.9, complex: 0.85 }[content.logo_complexity] ?? 1.0;
      targetIntensity  = clamp(baseIntensity * complexMult * logoMult + sectorMatrix.logo_bias, 0.15, 1.0);
      targetSpeed      = variationProfile.logo_speed;
      reasoning        = `Logo ${content.logo_complexity} × secteur (${(sectorMatrix.global_mult * 100).toFixed(0)}%)`;
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

  const layers = decision.layers?.map((l) => ({
    ...l,
    intensity: clamp((l.intensity ?? 0.5) * sectorMatrix.global_mult * globalMult * (zone === 'logo' ? 1.0 : 0.85), 0.05, targetIntensity),
    speed: targetSpeed,
  }));

  return {
    decision: { ...decision, intensity: parseFloat(targetIntensity.toFixed(3)), speed: targetSpeed, layers },
    profile:  { zone, recommended_intensity: targetIntensity, recommended_speed: targetSpeed, reasoning },
  };
}

// ─── API publique ─────────────────────────────────────────────────────────────

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

  // Réduction automatique si SVG trop lourd
  const svgWarnings: string[] = [];
  let workingComposition = composition;
  if (fullContent.svg_size_bytes && fullContent.svg_size_bytes > SVG_SIZE_THRESHOLD_BYTES) {
    const { composition: reduced, reductions } = reduceSVGComplexity(composition, fullContent.svg_size_bytes);
    workingComposition = reduced;
    svgWarnings.push(...reductions);
  }

  // Optimisation zone par zone
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const profiles: ZoneOptimizationProfile[] = [];
  const optimized: Partial<ZoneComposition> = {};

  for (const zone of zones) {
    const decision: ZoneEffectDecision = (workingComposition as any)[zone];
    const result = optimizeZoneDecision(zone, decision, sectorMatrix, varProfile, globalMult, fullContent);
    (optimized as any)[zone] = result.decision;
    profiles.push(result.profile);
  }

  // Simulation clients email
  const emailSim = simulateEmailClients(optimized as ZoneComposition, fullContent.svg_size_bytes);

  // Détection propriétés CSS coûteuses
  const repaintWarnings = detectExpensiveCSSProperties(optimized as ZoneComposition);

  // Score Pareto
  const pareto = computeParetoScore(optimized as ZoneComposition, variation, emailSim.compat_score);

  const summary = `SmartOptimizer v2 [${variation}] secteur:${sectorKey} mult:${boostFactor.toFixed(2)} | Pareto: ${pareto.label} (${(pareto.pareto_score * 100).toFixed(0)}%) | Email compat: ${(emailSim.compat_score * 100).toFixed(0)}%`;
  console.log(`🎯 ${summary}`);

  if (emailSim.warnings.length > 0) {
    emailSim.warnings.forEach(w => console.warn(`   ${w}`));
  }

  return {
    composition:       optimized as ZoneComposition,
    profiles,
    boost_factor:      parseFloat(boostFactor.toFixed(3)),
    summary,
    pareto,
    email_simulations: emailSim.simulations,
    svg_warnings:      svgWarnings,
    repaint_warnings:  repaintWarnings,
  };
}

export function analyzeSignatureContent(metadata: any, secteur: string): SignatureContent {
  const hasLogo        = !!(metadata?.logo || metadata?.has_logo);
  const logoComplexity = metadata?.logo_type === 'photo' ? 'complex'
                       : metadata?.logo_type === 'illustration' ? 'detailed'
                       : 'simple';
  const nameLen        = (metadata?.nom || metadata?.name || '').length;
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
    svg_size_bytes:  metadata?.svg_size_bytes,
  };
}

console.log('🎯 Smart Optimizer v2.0 — Pareto multi-objectifs | 5 clients email | réduction SVG 50KB | détection CSS repaints');
