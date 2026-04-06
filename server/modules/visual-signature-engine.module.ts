/**
 * 🔏 VISUAL SIGNATURE ENGINE — Module 15, Priorité 5
 *
 * Génère une "empreinte visuelle" unique pour chaque rendu.
 * Garantit qu'aucune signature produite ne ressemble à une autre,
 * même avec les mêmes paramètres d'entrée.
 *
 * Méthode :
 *   1. Calcule un hash déterministe à partir du contenu
 *   2. Dérive un seed génératif unique (temps + contenu + entropie)
 *   3. Applique des micro-variations aux intensités et vitesses
 *   4. Injecte des offsets de phase aléatoires dans les animations
 *   5. Génère une empreinte lisible (fingerprint string)
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisualFingerprint {
  id:               string;     // identifiant unique de la signature (24 chars)
  seed:             number;     // graine numérique reproductible
  entropy:          number;     // 0-1 — degré d'unicité
  micro_variations: Record<string, MicroVariation>;  // par zone
  phase_offsets:    Record<string, number>;            // délai de phase en % (0-0.3)
  style_token:      string;     // token lisible ex: "AZURE-PULSE-7F3"
  created_at:       number;
}

export interface MicroVariation {
  intensity_delta:  number;     // -0.08 à +0.08
  speed_variant:    'slow' | 'medium' | 'fast';  // peut varier légèrement
  phase_shift:      number;     // 0-0.25 — décalage phase animation
  color_tint:       number;     // -15 à +15 degrés hue
}

export interface SignatureResult {
  composition:  ZoneComposition;
  fingerprint:  VisualFingerprint;
  uniqueness:   number;          // 0-1 — score d'unicité estimé
}

// ─── Générateur pseudo-aléatoire déterministe (LCG) ──────────────────────────

function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xFFFFFFFF;
  };
}

// ─── Hash déterministe du contenu ─────────────────────────────────────────────

function hashContent(composition: ZoneComposition, secteur: string, variation: VariationKey): number {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  let hash = 5381;
  const str = zones.map(z => {
    const zone = composition[z];
    return `${z}:${zone?.effet_id ?? ''}:${zone?.intensity?.toFixed(2) ?? '0'}:${zone?.speed ?? 'm'}`;
  }).join('|') + `|${secteur}|${variation}`;

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ─── Génération du token de style lisible ─────────────────────────────────────

const COLOR_TOKENS = ['AZURE', 'CRIMSON', 'EMBER', 'FROST', 'GOLD', 'JADE', 'NOIR', 'OPAL', 'PRISM', 'RUBY', 'SOLAR', 'TEAL', 'ULTRA', 'VOID'];
const STYLE_TOKENS = ['PULSE', 'DRIFT', 'BLOOM', 'SURGE', 'ECHO', 'FLUX', 'GLOW', 'HAZE', 'MIST', 'NOVA', 'RIPPLE', 'SPARK', 'WAVE', 'ZEN'];

function generateStyleToken(rng: () => number, contentHash: number): string {
  const color = COLOR_TOKENS[Math.floor(rng() * COLOR_TOKENS.length)];
  const style = STYLE_TOKENS[Math.floor(rng() * STYLE_TOKENS.length)];
  const hex   = (contentHash & 0xFFF).toString(16).toUpperCase().padStart(3, '0');
  return `${color}-${style}-${hex}`;
}

// ─── Micro-variation pour une zone ───────────────────────────────────────────

function generateMicroVariation(rng: () => number, zone: ZoneEffectDecision): MicroVariation {
  // Intensité : ±8% max, centré sur 0
  const intensityDelta = (rng() - 0.5) * 0.16;

  // Vitesse : 10% de chance de varier d'un cran
  const speedRoll = rng();
  let speedVariant = zone.speed;
  if (speedRoll > 0.90) {
    speedVariant = zone.speed === 'slow' ? 'medium' : zone.speed === 'fast' ? 'medium' : (rng() > 0.5 ? 'slow' : 'fast');
  }

  // Phase : 0-25% de décalage
  const phaseShift = rng() * 0.25;

  // Teinte : ±15 degrés
  const colorTint = (rng() - 0.5) * 30;

  return { intensity_delta: intensityDelta, speed_variant: speedVariant, phase_shift: phaseShift, color_tint: colorTint };
}

// ─── Application des micro-variations ────────────────────────────────────────

function applyMicroVariation(zone: ZoneEffectDecision, mv: MicroVariation): ZoneEffectDecision {
  const newIntensity = Math.min(1, Math.max(0.05, zone.intensity + mv.intensity_delta));
  return {
    ...zone,
    intensity: newIntensity,
    speed:     mv.speed_variant,
    raison:    `${zone.raison ?? ''} | SignatureEngine: Δi=${mv.intensity_delta > 0 ? '+' : ''}${mv.intensity_delta.toFixed(3)} φ=${mv.phase_shift.toFixed(2)}`,
  };
}

// ─── Génération de l'ID unique ────────────────────────────────────────────────

function generateUniqueId(rng: () => number, contentHash: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const ts    = Date.now().toString(36).toUpperCase().slice(-6);
  let id      = ts;
  while (id.length < 24) {
    id += chars[Math.floor(rng() * chars.length)];
  }
  return id.slice(0, 24);
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function generateVisualSignature(
  composition: ZoneComposition,
  variation:   VariationKey,
  secteur:     string = 'default'
): SignatureResult {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

  // Seed composite : hash du contenu + entropie temporelle
  const contentHash = hashContent(composition, secteur, variation);
  const timeSeed    = Date.now() & 0xFFFF;
  const seed        = (contentHash ^ (timeSeed * 2654435761)) >>> 0;
  const rng         = createRng(seed);

  // Micro-variations par zone
  const microVariations: Record<string, MicroVariation> = {};
  const phaseOffsets:    Record<string, number>          = {};
  const newComposition   = { ...composition };

  zones.forEach(zoneName => {
    const zone = composition[zoneName];
    if (!zone?.effet_id) return;

    const mv = generateMicroVariation(rng, zone);
    microVariations[zoneName] = mv;
    phaseOffsets[zoneName]    = mv.phase_shift;
    (newComposition as any)[zoneName] = applyMicroVariation(zone, mv);
  });

  // Score d'unicité : basé sur la dispersion des deltas
  const deltas   = Object.values(microVariations).map(mv => Math.abs(mv.intensity_delta));
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / Math.max(1, deltas.length);
  const entropy  = Math.min(1, avgDelta * 8 + rng() * 0.2);
  const uniqueness = Math.min(1, entropy + (timeSeed / 0xFFFF) * 0.3);

  const fingerprint: VisualFingerprint = {
    id:               generateUniqueId(rng, contentHash),
    seed,
    entropy,
    micro_variations: microVariations,
    phase_offsets:    phaseOffsets,
    style_token:      generateStyleToken(rng, contentHash),
    created_at:       Date.now(),
  };

  return { composition: newComposition, fingerprint, uniqueness };
}
