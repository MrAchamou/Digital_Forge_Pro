/**
 * 👁️ ATTENTION GUIDE — Module 14, Priorité 5
 *
 * Ajoute des "aimants visuels" subtils sur les éléments clés :
 * - Lueurs douces et micro-pulsations sur logo et CTA
 * - Chemins d'œil naturels : logo → nom → CTA
 * - Effets de parallaxe légers pour hiérarchiser l'information
 * - Guidage de l'attention vers les zones de conversion
 *
 * S'applique après toutes les autres étapes du pipeline,
 * comme une couche de finition comportementale.
 */

import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttentionMagnetType = 'soft_glow' | 'micro_pulse' | 'parallax_drift' | 'eye_lead' | 'focus_bloom';

export interface AttentionMagnet {
  zone:         string;
  type:         AttentionMagnetType;
  strength:     number;       // 0-1 — force de l'aimant
  direction:    string;       // ex: "logo→nom→cta" — chemin suggéré
  css_hint:     string;       // annotation pour le renderer
}

export interface EyePath {
  sequence:     string[];     // zones dans l'ordre du chemin d'œil
  dwell_ms:     number[];     // temps de regard par zone (ms)
  total_ms:     number;
}

export interface AttentionGuideResult {
  composition:  ZoneComposition;
  magnets:      AttentionMagnet[];
  eye_path:     EyePath;
  guide_score:  number;       // 0-1 — efficacité estimée du guidage
}

// ─── Chemins d'œil par variation ─────────────────────────────────────────────

const EYE_PATHS: Record<VariationKey, { sequence: string[]; dwell_ms: number[] }> = {
  A: { sequence: ['logo', 'nom', 'titre', 'cta'],              dwell_ms: [800, 600, 400, 1200] },
  B: { sequence: ['logo', 'cta', 'nom', 'contact'],            dwell_ms: [700, 1000, 500, 300] },
  C: { sequence: ['fond', 'logo', 'nom', 'separateur', 'cta'], dwell_ms: [400, 800, 600, 200, 1000] },
  D: { sequence: ['logo', 'cta', 'nom', 'fond'],               dwell_ms: [600, 1200, 400, 300] },
};

// ─── Forces d'aimant par zone (valeurs de base) ──────────────────────────────

const BASE_MAGNET_STRENGTH: Record<string, number> = {
  logo:       0.85,
  cta:        0.90,
  nom:        0.65,
  titre:      0.40,
  separateur: 0.25,
  fond:       0.15,
  contact:    0.30,
};

// ─── Types d'aimants par zone ────────────────────────────────────────────────

const ZONE_MAGNET_TYPE: Record<string, AttentionMagnetType> = {
  logo:       'focus_bloom',
  cta:        'soft_glow',
  nom:        'micro_pulse',
  titre:      'eye_lead',
  separateur: 'parallax_drift',
  fond:       'parallax_drift',
  contact:    'micro_pulse',
};

// ─── Directives CSS pour le renderer ─────────────────────────────────────────

function buildCssHint(type: AttentionMagnetType, strength: number, zoneName: string): string {
  const s = strength.toFixed(2);
  switch (type) {
    case 'focus_bloom':
      return `filter:drop-shadow(0 0 ${Math.round(strength * 12)}px currentColor);opacity:${s}`;
    case 'soft_glow':
      return `box-shadow:0 0 ${Math.round(strength * 8)}px rgba(255,255,255,${(strength * 0.4).toFixed(2)});`;
    case 'micro_pulse':
      return `animation-timing-function:ease-in-out;animation-iteration-count:infinite;`;
    case 'parallax_drift':
      return `transform:translateZ(${Math.round(strength * -20)}px);`;
    case 'eye_lead':
      return `transition:all 0.3s ease;cursor:default;`;
    default:
      return '';
  }
}

// ─── Création d'une couche d'aimant visuel ───────────────────────────────────

function buildMagnetLayer(
  magnet:   AttentionMagnet,
  zone:     ZoneEffectDecision
): EffectLayer {
  return {
    effet_id:  `ATTENTION_${magnet.type.toUpperCase()}`,
    category:  'secondary',
    intensity: magnet.strength * 0.6,   // subtil — ne doit pas écraser l'effet principal
    speed:     zone.speed === 'fast' ? 'medium' : zone.speed,
    color:     zone.color,
    raison:    `AttentionGuide: ${magnet.type} → ${magnet.direction} [${magnet.css_hint.slice(0, 40)}]`,
  };
}

// ─── Application des aimants sur la composition ──────────────────────────────

function applyMagnetsToComposition(
  composition: ZoneComposition,
  magnets:     AttentionMagnet[]
): ZoneComposition {
  const result = { ...composition };
  const zones  = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

  zones.forEach(zoneName => {
    const zone   = composition[zoneName];
    const magnet = magnets.find(m => m.zone === zoneName);
    if (!zone?.effet_id || !magnet) return;

    // Ajouter la couche d'aimant aux layers existants (sans dépasser 2 couches pour rester subtil)
    const existingLayers = zone.layers ?? [];
    const hasAttention   = existingLayers.some(l => l.effet_id.startsWith('ATTENTION_'));

    if (!hasAttention && magnet.strength > 0.3) {
      const magnetLayer = buildMagnetLayer(magnet, zone);
      (result as any)[zoneName] = {
        ...zone,
        layers: [...existingLayers, magnetLayer],
        raison: `${zone.raison ?? ''} | AttentionGuide[${magnet.type}] strength=${magnet.strength.toFixed(2)}`,
      };
    }
  });

  return result;
}

// ─── Calcul du score de guidage ───────────────────────────────────────────────

function computeGuideScore(
  magnets:  AttentionMagnet[],
  eyePath:  EyePath
): number {
  // Critères :
  // 1. Présence d'un magnet fort sur logo et CTA
  const hasLogoMagnet = magnets.some(m => m.zone === 'logo' && m.strength > 0.7);
  const hasCtaMagnet  = magnets.some(m => m.zone === 'cta'  && m.strength > 0.7);
  const coverageScore = (hasLogoMagnet ? 0.4 : 0) + (hasCtaMagnet ? 0.4 : 0);

  // 2. Longueur du chemin d'œil (plus de zones = meilleur engagement)
  const pathScore = Math.min(1, eyePath.sequence.length / 5) * 0.2;

  return Math.min(1, coverageScore + pathScore);
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function applyAttentionGuide(
  composition: ZoneComposition,
  variation:   VariationKey,
  sectorBoost: number = 0.65
): AttentionGuideResult {
  const pathConfig  = EYE_PATHS[variation];
  const eyePath: EyePath = {
    sequence: pathConfig.sequence,
    dwell_ms: pathConfig.dwell_ms,
    total_ms: pathConfig.dwell_ms.reduce((a, b) => a + b, 0),
  };

  // Construire les aimants pour chaque zone
  const magnets: AttentionMagnet[] = [];
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];

  zones.forEach(zoneName => {
    const zone = (composition as any)[zoneName] as ZoneEffectDecision | undefined;
    if (!zone?.effet_id) return;

    // Force de l'aimant = base × boost secteur × position dans le chemin d'œil
    const baseStrength  = BASE_MAGNET_STRENGTH[zoneName] ?? 0.3;
    const pathBonus     = eyePath.sequence.indexOf(zoneName) >= 0
      ? 1 + (0.1 * (eyePath.sequence.length - eyePath.sequence.indexOf(zoneName))) / eyePath.sequence.length
      : 1;
    const strength      = Math.min(1, baseStrength * sectorBoost * pathBonus);

    // Direction : vers la prochaine zone dans le chemin d'œil
    const pathIndex  = eyePath.sequence.indexOf(zoneName);
    const nextZone   = pathIndex >= 0 && pathIndex < eyePath.sequence.length - 1
      ? eyePath.sequence[pathIndex + 1]
      : 'end';
    const direction  = `${zoneName}→${nextZone}`;

    const type    = ZONE_MAGNET_TYPE[zoneName] ?? 'micro_pulse';
    const cssHint = buildCssHint(type, strength, zoneName);

    magnets.push({ zone: zoneName, type, strength, direction, css_hint: cssHint });
  });

  // Appliquer les aimants sur la composition
  const guidedComposition = applyMagnetsToComposition(composition, magnets);
  const guideScore        = computeGuideScore(magnets, eyePath);

  return { composition: guidedComposition, magnets, eye_path: eyePath, guide_score: guideScore };
}
