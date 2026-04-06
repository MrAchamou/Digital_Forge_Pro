/**
 * 👁️ VISUAL FOCUS ENGINE
 *
 * Guide l'œil du lecteur selon un chemin naturel à travers la signature.
 * Chemin principal : Logo → Nom → CTA
 * Chemin secondaire : Séparateur rythme la lecture → Titre/Contact ancrent le contexte
 *
 * Techniques :
 * - Amplification des zones-clés (logo, nom, CTA) avec des intensités relatives
 * - Création d'un gradient d'attention décroissant du logo au fond
 * - Cascade d'apparition (timing) qui force la lecture dans le bon ordre
 * - Contrastes d'animation pour distinguer les éléments actifs des passifs
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';

export type VariationKey = 'A' | 'B' | 'C' | 'D';

export interface FocusPath {
  primary:   string[];   // zones-clés dans l'ordre de lecture
  secondary: string[];   // zones de contexte (rythme mais ne concurrencent pas)
  anchor:    string[];   // zones statiques ou très discrètes
}

export interface AttentionMap {
  zone:              string;
  attention_weight:  number;   // 0-1 — importance relative dans le chemin
  contrast_boost:    number;   // multiplicateur sur l'intensité
  appearance_delay:  number;   // délai dans la cascade d'apparition (s)
  animation_active:  boolean;  // l'élément doit-il animer activement ?
}

export interface FocusEnhancementResult {
  composition:  ZoneComposition;
  attention_map: AttentionMap[];
  focus_score:   number;        // 0-1 — clarté du chemin visuel
  changes_made:  string[];
}

// ─── Définition des chemins de focus ────────────────────────────────────────

const FOCUS_PATHS: Record<VariationKey, FocusPath> = {
  // A — Autorité : Logo domine → Nom confirme → CTA clôt
  A: {
    primary:   ['logo', 'nom', 'cta'],
    secondary: ['separateur', 'fond'],
    anchor:    ['titre', 'contact'],
  },
  // B — Précision : Logo tranchant → CTA immédiat → Nom confirme
  B: {
    primary:   ['logo', 'cta', 'nom'],
    secondary: ['separateur', 'titre'],
    anchor:    ['fond', 'contact'],
  },
  // C — Profondeur : Fond d'abord → Logo émerge → Nom flotte → CTA
  C: {
    primary:   ['fond', 'logo', 'nom', 'cta'],
    secondary: ['separateur'],
    anchor:    ['titre', 'contact'],
  },
  // D — Éclat : Tout explose → Logo WOW → CTA brillant → Nom illuminé
  D: {
    primary:   ['logo', 'cta'],
    secondary: ['nom', 'separateur', 'fond'],
    anchor:    ['titre', 'contact'],
  },
};

// Poids d'attention par position dans le chemin (décroissant naturellement)
const PATH_WEIGHTS = [1.0, 0.80, 0.65, 0.50];

// ─── Construction de la carte d'attention ────────────────────────────────────

function buildAttentionMap(
  path: FocusPath,
  variation: VariationKey
): Record<string, AttentionMap> {
  const map: Record<string, AttentionMap> = {};

  // Zones primaires : chemin de lecture actif
  path.primary.forEach((zone, idx) => {
    const weight = PATH_WEIGHTS[idx] ?? 0.4;
    // Variation D : contraste plus agressif sur la zone 1
    const contrastBoost = variation === 'D' && idx === 0 ? 1.25
                        : variation === 'A' && idx === 0 ? 1.10
                        : 1.0 + (0.8 - weight) * 0.3;

    map[zone] = {
      zone,
      attention_weight: weight,
      contrast_boost:   parseFloat(contrastBoost.toFixed(3)),
      appearance_delay: idx * 0.3,  // cascade : +0.3s par position
      animation_active: true,
    };
  });

  // Zones secondaires : rythme sans concurrence
  path.secondary.forEach((zone, idx) => {
    const baseWeight = 0.35 - idx * 0.05;
    map[zone] = {
      zone,
      attention_weight: Math.max(0.15, baseWeight),
      contrast_boost:   0.75,   // réduction du contraste pour passer en retrait
      appearance_delay: (path.primary.length + idx) * 0.3,
      animation_active: true,
    };
  });

  // Zones d'ancrage : discrètes, lisibles
  path.anchor.forEach((zone) => {
    map[zone] = {
      zone,
      attention_weight: 0.15,
      contrast_boost:   0.60,   // très discret
      appearance_delay: (path.primary.length + path.secondary.length) * 0.3,
      animation_active: false,  // mouvement minimal sur les zones d'ancrage
    };
  });

  return map;
}

// ─── Application à la composition ────────────────────────────────────────────

function applyFocusToZone(
  zone: string,
  decision: ZoneEffectDecision,
  attentionMap: Record<string, AttentionMap>
): { decision: ZoneEffectDecision; change: string | null } {
  const att = attentionMap[zone];
  if (!att) return { decision, change: null };

  const originalIntensity = decision.intensity;
  let newIntensity = parseFloat((originalIntensity * att.contrast_boost).toFixed(3));

  // Clamp selon la zone
  const caps: Record<string, number> = {
    logo: 1.00, nom: 0.85, cta: 0.92, separateur: 0.65,
    fond: 0.50, titre: 0.38, contact: 0.32,
  };
  const floors: Record<string, number> = {
    logo: 0.30, nom: 0.20, cta: 0.25, separateur: 0.10,
    fond: 0.05, titre: 0.05, contact: 0.05,
  };
  newIntensity = Math.max(floors[zone] ?? 0.05, Math.min(caps[zone] ?? 1.0, newIntensity));

  // Appliquer aussi aux couches si présentes
  const layers = decision.layers?.map((l) => ({
    ...l,
    intensity: Math.max(
      floors[zone] ?? 0.05,
      Math.min(caps[zone] ?? 1.0, (l.intensity ?? 0.5) * att.contrast_boost)
    ),
  }));

  const changed = Math.abs(newIntensity - originalIntensity) > 0.02;

  return {
    decision: { ...decision, intensity: newIntensity, layers },
    change:   changed
      ? `Zone ${zone} [FOCUS] ${(originalIntensity * 100).toFixed(0)}% → ${(newIntensity * 100).toFixed(0)}% (weight:${(att.attention_weight * 100).toFixed(0)}%)`
      : null,
  };
}

// ─── Score de clarté du chemin ───────────────────────────────────────────────

function computeFocusScore(
  attentionMap: Record<string, AttentionMap>,
  path: FocusPath
): number {
  if (path.primary.length < 2) return 0.5;

  // Score = contraste entre la zone 1 du chemin et les zones d'ancrage
  const primaryWeights  = path.primary.map(z => attentionMap[z]?.attention_weight ?? 0);
  const anchorWeights   = path.anchor.map(z => attentionMap[z]?.attention_weight ?? 0);

  const avgPrimary = primaryWeights.reduce((a, b) => a + b, 0) / Math.max(primaryWeights.length, 1);
  const avgAnchor  = anchorWeights.reduce((a, b) => a + b, 0) / Math.max(anchorWeights.length, 1);

  // Contraste relatif entre le chemin principal et les zones d'ancrage
  const contrast = avgAnchor > 0 ? Math.min(avgPrimary / avgAnchor, 3) / 3 : 1;
  return parseFloat(Math.min(contrast, 1).toFixed(3));
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Point d'entrée principal.
 * Applique l'optimisation visuelle de focus à une composition entière.
 */
export function applyVisualFocus(
  composition: ZoneComposition,
  variation:   VariationKey
): FocusEnhancementResult {
  const path        = FOCUS_PATHS[variation];
  const attentionMap = buildAttentionMap(path, variation);

  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const changes: string[] = [];
  const enhanced: Partial<ZoneComposition> = {};
  const mapArray: AttentionMap[] = [];

  for (const zone of zones) {
    const decision: ZoneEffectDecision = (composition as any)[zone];
    const { decision: focused, change } = applyFocusToZone(zone, decision, attentionMap);
    (enhanced as any)[zone] = focused;
    if (change) changes.push(change);
    if (attentionMap[zone]) mapArray.push(attentionMap[zone]);
  }

  const focusScore = computeFocusScore(attentionMap, path);

  if (changes.length > 0) {
    console.log(`👁️ Visual Focus Engine [${variation}] — ${changes.length} ajustements | Chemin: ${path.primary.join('→')} | Score: ${(focusScore * 100).toFixed(0)}%`);
  }

  return {
    composition:   enhanced as ZoneComposition,
    attention_map: mapArray,
    focus_score:   focusScore,
    changes_made:  changes,
  };
}

/**
 * Retourne la liste ordonnée des zones dans le chemin de focus d'une variation.
 * Utile pour le renderer SVG qui veut connaître l'ordre d'apparition optimal.
 */
export function getFocusPath(variation: VariationKey): FocusPath {
  return FOCUS_PATHS[variation];
}

/**
 * Calcule les délais d'apparition optimaux par zone selon le chemin de focus.
 * Retourne un Record<zone, delaySeconds>.
 */
export function getFocusDelays(variation: VariationKey, baseDelay = 0): Record<string, number> {
  const path        = FOCUS_PATHS[variation];
  const attentionMap = buildAttentionMap(path, variation);
  const result: Record<string, number> = {};
  for (const [zone, att] of Object.entries(attentionMap)) {
    result[zone] = parseFloat((baseDelay + att.appearance_delay).toFixed(3));
  }
  return result;
}

console.log('👁️ Visual Focus Engine chargé — chemins logo→nom→CTA | cascade d\'apparition | contraste adaptatif');
