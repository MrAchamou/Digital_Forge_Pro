/**
 * 🧠 CONTEXTUAL INTELLIGENCE MODERATOR
 *
 * Analyse la complexité des compositions générées et modère intelligemment
 * les améliorations pour éviter la sur-complexification visuelle.
 *
 * Rôles :
 * - Écrêter les couches excessives par zone selon le secteur
 * - Protéger les zones secondaires (titre, contact) de la surcharge
 * - Recalibrer les intensités pour maintenir la hiérarchie visuelle
 * - Détecter les combinaisons d'effets qui créent du bruit visuel
 */

import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from '../services/harmony-validator';

export type SecteurType =
  | 'finance' | 'legal' | 'medical' | 'luxe' | 'tech' | 'startup'
  | 'creative' | 'retail' | 'immobilier' | 'default';

export type IntensiteMouvement = 'minimal' | 'subtil' | 'expressif' | 'dramatique';

export interface ComplexityProfile {
  zone:              string;
  layer_count:       number;
  intensity_sum:     number;
  complexity_score:  number;    // 0-1
  overload_detected: boolean;
  recommendation:    'keep' | 'trim' | 'simplify' | 'protect';
}

export interface ModerationResult {
  composition:      ZoneComposition;
  profiles:         ComplexityProfile[];
  total_complexity: number;      // 0-1 — charge visuelle globale
  corrections_made: string[];
  quality_score:    number;      // 0-1 — qualité estimée du rendu
}

// ─── Règles par secteur ──────────────────────────────────────────────────────

const SECTOR_RULES: Record<SecteurType, {
  max_logo_layers:   number;
  max_zone_layers:   number;
  intensity_cap:     number;   // intensité maximale autorisée
  intensity_floor:   number;   // intensité minimale (évite les effets invisibles)
  allowed_overload:  number;   // 0-1 — tolérance à la surcharge globale
}> = {
  finance:     { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.65, intensity_floor: 0.15, allowed_overload: 0.3 },
  legal:       { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.55, intensity_floor: 0.10, allowed_overload: 0.2 },
  medical:     { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.60, intensity_floor: 0.15, allowed_overload: 0.25 },
  luxe:        { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.5 },
  tech:        { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.90, intensity_floor: 0.20, allowed_overload: 0.6 },
  startup:     { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.95, intensity_floor: 0.20, allowed_overload: 0.7 },
  creative:    { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 1.00, intensity_floor: 0.20, allowed_overload: 0.8 },
  retail:      { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.5 },
  immobilier:  { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.70, intensity_floor: 0.15, allowed_overload: 0.4 },
  default:     { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.85, intensity_floor: 0.15, allowed_overload: 0.6 },
};

// Zones protégées : doivent rester lisibles en toute circonstance
const PROTECTED_ZONES = new Set(['titre', 'contact']);

// Intensités maximales par zone (règle de hiérarchie visuelle)
const ZONE_INTENSITY_CAPS: Record<string, number> = {
  logo:       1.00,
  nom:        0.85,
  cta:        0.90,
  separateur: 0.65,
  fond:       0.50,
  titre:      0.40,  // protégé — lisibilité
  contact:    0.35,  // protégé — lisibilité
};

// ─── Analyse de complexité ────────────────────────────────────────────────────

function analyzeZoneComplexity(
  zone: string,
  decision: ZoneEffectDecision,
  rules: typeof SECTOR_RULES[SecteurType]
): ComplexityProfile {
  const layers   = decision.layers ?? [{ effet_id: decision.effet_id, category: 'primary', intensity: decision.intensity, speed: decision.speed, color: decision.color }];
  const layerCnt = layers.length;
  const intSum   = layers.reduce((s, l) => s + (l.intensity ?? 0.5), 0);
  const maxLayers = zone === 'logo' ? rules.max_logo_layers : rules.max_zone_layers;

  const complexityScore = Math.min(
    (layerCnt / (maxLayers + 1)) * 0.6 +
    (intSum / (layerCnt * rules.intensity_cap)) * 0.4,
    1
  );

  const overload = layerCnt > maxLayers || intSum / layerCnt > rules.intensity_cap;

  let recommendation: ComplexityProfile['recommendation'] = 'keep';
  if (PROTECTED_ZONES.has(zone) && (layerCnt > 1 || intSum > rules.intensity_cap)) {
    recommendation = 'protect';
  } else if (layerCnt > maxLayers + 1) {
    recommendation = 'trim';
  } else if (intSum / Math.max(layerCnt, 1) > rules.intensity_cap) {
    recommendation = 'simplify';
  }

  return { zone, layer_count: layerCnt, intensity_sum: intSum, complexity_score: complexityScore, overload_detected: overload, recommendation };
}

// ─── Modération d'une zone ───────────────────────────────────────────────────

function moderateZone(
  zone: string,
  decision: ZoneEffectDecision,
  rules: typeof SECTOR_RULES[SecteurType],
  profile: ComplexityProfile,
  variation: 'A' | 'B' | 'C' | 'D'
): { decision: ZoneEffectDecision; correction: string | null } {
  if (profile.recommendation === 'keep') return { decision, correction: null };

  const intensityCap = Math.min(rules.intensity_cap, ZONE_INTENSITY_CAPS[zone] ?? 1.0);
  const intensityFloor = rules.intensity_floor;

  // PROTECT : zone lisibilité → 1 seul effet, intensité cappée
  if (profile.recommendation === 'protect') {
    const corrected: ZoneEffectDecision = {
      ...decision,
      intensity: Math.min(decision.intensity, intensityCap),
      layers:    undefined,  // retrait des couches sur les zones protégées
    };
    return { decision: corrected, correction: `Zone ${zone} [PROTECT] → couches retirées, intensité ≤ ${intensityCap.toFixed(2)}` };
  }

  // TRIM : trop de couches → garder les N meilleures
  if (profile.recommendation === 'trim' && decision.layers) {
    const maxLayers = zone === 'logo' ? rules.max_logo_layers : rules.max_zone_layers;
    const sorted = [...decision.layers].sort((a, b) => (b.intensity ?? 0.5) - (a.intensity ?? 0.5));
    const trimmed = sorted.slice(0, maxLayers);

    // Recalibration des intensités sur les couches conservées
    const calibrated = trimmed.map((l, i): EffectLayer => ({
      ...l,
      intensity: Math.max(intensityFloor, Math.min(l.intensity ?? 0.5, intensityCap * (1 - i * 0.15))),
    }));

    const primary = calibrated[0];
    const corrected: ZoneEffectDecision = {
      ...decision,
      effet_id:  primary.effet_id,
      intensity: primary.intensity,
      speed:     primary.speed,
      color:     primary.color,
      layers:    calibrated,
    };
    return { decision: corrected, correction: `Zone ${zone} [TRIM] → ${profile.layer_count}→${calibrated.length} couches` };
  }

  // SIMPLIFY : intensité excessive → recalibrer sans toucher aux couches
  if (profile.recommendation === 'simplify') {
    const layers = decision.layers?.map((l): EffectLayer => ({
      ...l,
      intensity: Math.max(intensityFloor, Math.min(l.intensity ?? 0.5, intensityCap)),
    }));

    const corrected: ZoneEffectDecision = {
      ...decision,
      intensity: Math.max(intensityFloor, Math.min(decision.intensity, intensityCap)),
      layers,
    };
    return { decision: corrected, correction: `Zone ${zone} [SIMPLIFY] → intensités ≤ ${intensityCap.toFixed(2)}` };
  }

  return { decision, correction: null };
}

// ─── API publique ────────────────────────────────────────────────────────────

/**
 * Normalise le nom du secteur vers une des clés connues.
 */
export function normalizeSecteur(raw: string): SecteurType {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('financ') || lower.includes('banque') || lower.includes('assur')) return 'finance';
  if (lower.includes('jur') || lower.includes('droit') || lower.includes('avocat') || lower.includes('notar')) return 'legal';
  if (lower.includes('méd') || lower.includes('sant') || lower.includes('pharma') || lower.includes('clinic')) return 'medical';
  if (lower.includes('luxe') || lower.includes('mode') || lower.includes('joaill') || lower.includes('prestige')) return 'luxe';
  if (lower.includes('tech') || lower.includes('logiciel') || lower.includes('saas') || lower.includes('ia') || lower.includes('ai')) return 'tech';
  if (lower.includes('startup') || lower.includes('scale') || lower.includes('disrupt')) return 'startup';
  if (lower.includes('créa') || lower.includes('design') || lower.includes('agence') || lower.includes('pub')) return 'creative';
  if (lower.includes('retail') || lower.includes('commerce') || lower.includes('boutique') || lower.includes('e-com')) return 'retail';
  if (lower.includes('immob') || lower.includes('promo') || lower.includes('agence immo')) return 'immobilier';
  return 'default';
}

/**
 * Point d'entrée principal.
 * Applique la modération contextuelle à une composition complète.
 */
export function moderateComposition(
  composition: ZoneComposition,
  secteur: string,
  variation: 'A' | 'B' | 'C' | 'D',
  intensite: IntensiteMouvement = 'subtil'
): ModerationResult {
  const sectorKey = normalizeSecteur(secteur);
  let rules = { ...SECTOR_RULES[sectorKey] };

  // Ajustement selon l'intensité de mouvement voulue
  const intensityBoosts: Record<IntensiteMouvement, number> = {
    minimal:    -0.20,
    subtil:     -0.05,
    expressif:  +0.10,
    dramatique: +0.20,
  };
  const boost = intensityBoosts[intensite] ?? 0;
  rules.intensity_cap = Math.max(0.2, Math.min(1.0, rules.intensity_cap + boost));

  // Variation D toujours plus tolérante
  if (variation === 'D') {
    rules.intensity_cap   = Math.min(1.0, rules.intensity_cap   + 0.10);
    rules.allowed_overload = Math.min(1.0, rules.allowed_overload + 0.15);
  }
  // Variation A toujours plus sobre
  if (variation === 'A') {
    rules.intensity_cap   = Math.max(0.2, rules.intensity_cap   - 0.10);
  }

  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const corrections: string[] = [];
  const profiles: ComplexityProfile[] = [];
  const moderated: Partial<ZoneComposition> = {};

  for (const zone of zones) {
    const decision: ZoneEffectDecision = (composition as any)[zone];
    const profile = analyzeZoneComplexity(zone, decision, rules);
    profiles.push(profile);

    const { decision: mod, correction } = moderateZone(zone, decision, rules, profile, variation);
    (moderated as any)[zone] = mod;
    if (correction) corrections.push(correction);
  }

  const totalComplexity = profiles.reduce((s, p) => s + p.complexity_score, 0) / profiles.length;
  const overloadedZones = profiles.filter(p => p.overload_detected).length;
  const qualityScore = Math.max(0, 1 - overloadedZones * 0.08 - corrections.length * 0.04);

  if (corrections.length > 0) {
    console.log(`🧠 Contextual Intelligence [${variation}/${sectorKey}] — ${corrections.length} modérations | Complexité: ${(totalComplexity * 100).toFixed(0)}% | Qualité: ${(qualityScore * 100).toFixed(0)}%`);
  }

  return {
    composition:      moderated as ZoneComposition,
    profiles,
    total_complexity: parseFloat(totalComplexity.toFixed(3)),
    corrections_made: corrections,
    quality_score:    parseFloat(qualityScore.toFixed(3)),
  };
}

console.log('🧠 Contextual Intelligence Moderator chargé — protection zones + modération par secteur');
