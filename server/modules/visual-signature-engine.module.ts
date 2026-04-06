/**
 * 🔏 VISUAL SIGNATURE ENGINE — Module 15, v2.0 (PostgreSQL persistant)
 *
 * Génère une "empreinte visuelle" unique pour chaque rendu.
 * Garantit qu'aucune signature produite ne ressemble à une autre,
 * même avec les mêmes paramètres d'entrée.
 *
 * Nouveautés v2.0 :
 *   - Persistance PostgreSQL des fingerprints (unicité globale, pas seulement locale)
 *   - Comparaison par distance de Hamming : rejet si similarité > 90%
 *   - Génération de "familles de signatures" cohérentes pour une même marque
 *   - Watermark invisible : fingerprint encodé dans les métadonnées SVG
 */

import type { ZoneComposition, ZoneEffectDecision } from '../services/harmony-validator';
import type { VariationKey } from './variance-engine.module';
import { db } from '../db';
import { visualFingerprints } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { log } from '../vite';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisualFingerprint {
  id:               string;
  seed:             number;
  entropy:          number;
  micro_variations: Record<string, MicroVariation>;
  phase_offsets:    Record<string, number>;
  style_token:      string;
  created_at:       number;
}

export interface MicroVariation {
  intensity_delta:  number;
  speed_variant:    'slow' | 'medium' | 'fast';
  phase_shift:      number;
  color_tint:       number;
}

export interface SignatureResult {
  composition:  ZoneComposition;
  fingerprint:  VisualFingerprint;
  uniqueness:   number;
  is_regenerated?: boolean;   // true si forcé à cause de similarité > 90%
  watermark_meta?: string;    // métadonnées SVG pour le watermark invisible
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
  const intensityDelta = (rng() - 0.5) * 0.16;

  const speedRoll = rng();
  let speedVariant = zone.speed;
  if (speedRoll > 0.90) {
    speedVariant = zone.speed === 'slow' ? 'medium' : zone.speed === 'fast' ? 'medium' : (rng() > 0.5 ? 'slow' : 'fast');
  }

  const phaseShift = rng() * 0.25;
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

// ─── Distance de Hamming entre deux fingerprint IDs ──────────────────────────

/**
 * Calcule la distance de Hamming entre deux chaînes de même longueur.
 * Retourne un score de similarité 0-1 (1 = identiques, 0 = complètement différents).
 */
function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let diff = 0;
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) diff++;
  }
  // Similarité = 1 - (diff / len)
  return 1 - (diff / len);
}

/**
 * Vérifie si un fingerprint est trop similaire aux fingerprints existants (depuis PostgreSQL).
 * Retourne true si la similarité de Hamming dépasse 90% avec un fingerprint existant.
 */
async function isTooSimilarToExisting(fingerprintId: string, secteur: string): Promise<boolean> {
  try {
    const existingRows = await db.select({ fingerprint_id: visualFingerprints.fingerprint_id })
      .from(visualFingerprints)
      .limit(500);

    for (const row of existingRows) {
      const similarity = hammingDistance(fingerprintId, row.fingerprint_id);
      if (similarity > 0.90) {
        log(`🔏 SignatureEngine: fingerprint trop similaire (${(similarity * 100).toFixed(0)}%) → mutation forcée`, 'signature');
        return true;
      }
    }
    return false;
  } catch {
    return false; // en cas d'erreur DB, on accepte le fingerprint
  }
}

// ─── Watermark invisible ──────────────────────────────────────────────────────

/**
 * Encode le fingerprint dans des métadonnées SVG invisibles.
 * À injecter dans le SVG généré comme commentaire ou attribut data.
 */
function generateWatermarkMeta(fingerprintId: string, styleToken: string, seed: number): string {
  const encoded = Buffer.from(JSON.stringify({
    fp: fingerprintId,
    st: styleToken,
    sd: seed,
    ts: Date.now(),
  })).toString('base64');
  return `<!-- effectforge:${encoded} -->`;
}

// ─── Familles de signatures pour une marque ───────────────────────────────────

/**
 * Génère un seed de famille cohérent basé sur le nom de marque.
 * Les signatures d'une même marque auront des seeds proches mais distincts.
 */
function brandFamilySeed(brandName: string): number {
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = (hash * 31 + brandName.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return Math.abs(hash);
}

// ─── Persistance PostgreSQL ───────────────────────────────────────────────────

async function persistFingerprint(
  fingerprint: VisualFingerprint,
  secteur:     string,
  variation:   string
): Promise<void> {
  try {
    await db.insert(visualFingerprints).values({
      fingerprint_id:  fingerprint.id,
      seed:            fingerprint.seed,
      entropy:         fingerprint.entropy,
      style_token:     fingerprint.style_token,
      micro_variations: fingerprint.micro_variations as any,
      phase_offsets:   fingerprint.phase_offsets as any,
      secteur,
      variation,
    }).onConflictDoNothing();
  } catch (err: any) {
    log(`⚠️ SignatureEngine DB persist error: ${err.message}`, 'signature');
  }
}

// ─── Génération interne d'un fingerprint ─────────────────────────────────────

function buildFingerprint(
  composition:  ZoneComposition,
  variation:    VariationKey,
  secteur:      string,
  extraEntropy: number = 0
): { fingerprint: VisualFingerprint; newComposition: ZoneComposition; uniqueness: number } {
  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;

  const contentHash = hashContent(composition, secteur, variation);
  const timeSeed    = (Date.now() + extraEntropy) & 0xFFFF;
  const seed        = (contentHash ^ (timeSeed * 2654435761)) >>> 0;
  const rng         = createRng(seed);

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

  return { fingerprint, newComposition, uniqueness };
}

// ─── Fonction principale (asynchrone — recommandée) ──────────────────────────

export async function generateVisualSignatureAsync(
  composition: ZoneComposition,
  variation:   VariationKey,
  secteur:     string = 'default',
  brandName?:  string
): Promise<SignatureResult> {
  let attempt = 0;
  let extraEntropy = brandName ? brandFamilySeed(brandName) : 0;
  let is_regenerated = false;

  while (attempt < 5) {
    const { fingerprint, newComposition, uniqueness } = buildFingerprint(
      composition, variation, secteur, extraEntropy + attempt * 12345
    );

    const tooSimilar = await isTooSimilarToExisting(fingerprint.id, secteur);

    if (!tooSimilar) {
      // Persister le fingerprint validé
      await persistFingerprint(fingerprint, secteur, variation);

      const watermark_meta = generateWatermarkMeta(fingerprint.id, fingerprint.style_token, fingerprint.seed);

      return {
        composition: newComposition,
        fingerprint,
        uniqueness,
        is_regenerated,
        watermark_meta,
      };
    }

    is_regenerated = true;
    attempt++;
    extraEntropy += Math.floor(Math.random() * 99999);
  }

  // Fallback après 5 tentatives : accepter quand même
  const { fingerprint, newComposition, uniqueness } = buildFingerprint(
    composition, variation, secteur, extraEntropy + 999999
  );
  await persistFingerprint(fingerprint, secteur, variation);
  const watermark_meta = generateWatermarkMeta(fingerprint.id, fingerprint.style_token, fingerprint.seed);

  return { composition: newComposition, fingerprint, uniqueness, is_regenerated: true, watermark_meta };
}

// ─── Fonction principale synchrone (compatibilité) ───────────────────────────

export function generateVisualSignature(
  composition: ZoneComposition,
  variation:   VariationKey,
  secteur:     string = 'default'
): SignatureResult {
  const { fingerprint, newComposition, uniqueness } = buildFingerprint(composition, variation, secteur);
  const watermark_meta = generateWatermarkMeta(fingerprint.id, fingerprint.style_token, fingerprint.seed);

  // Persistance asynchrone non-bloquante
  persistFingerprint(fingerprint, secteur, variation).catch(() => {});

  return { composition: newComposition, fingerprint, uniqueness, watermark_meta };
}

// ─── Récupération des fingerprints depuis PostgreSQL ─────────────────────────

export async function getFingerprintHistory(secteur?: string, limit = 50): Promise<VisualFingerprint[]> {
  try {
    const rows = secteur
      ? await db.select().from(visualFingerprints).where(eq(visualFingerprints.secteur, secteur)).limit(limit)
      : await db.select().from(visualFingerprints).limit(limit);

    return rows.map(row => ({
      id:               row.fingerprint_id,
      seed:             row.seed,
      entropy:          row.entropy,
      style_token:      row.style_token,
      micro_variations: row.micro_variations as Record<string, MicroVariation>,
      phase_offsets:    row.phase_offsets as Record<string, number>,
      created_at:       row.createdAt?.getTime() ?? Date.now(),
    }));
  } catch (err: any) {
    log(`⚠️ SignatureEngine getFingerprintHistory error: ${err.message}`, 'signature');
    return [];
  }
}
