/**
 * 🎵 TIMING MASTER
 *
 * Génère des séquences temporelles basées sur des principes mathématiques naturels.
 * - Nombre d'or (φ = 1.618) pour les transitions majestueuses
 * - Suite de Fibonacci pour les délais inter-zones
 * - Métronome principal synchronisant toutes les zones
 * - Micro-variations anti-monotonie
 */

export type VariationContext = 'A' | 'B' | 'C' | 'D';

// φ — nombre d'or
const PHI   = 1.6180339887;
// Premiers 8 termes Fibonacci normalisés (en secondes)
const FIB_S = [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.3, 2.1];

export interface ZoneTimingProfile {
  // Multiplicateurs de durée (remplacent SPEED_DURATION)
  speed_multipliers: Record<'slow' | 'medium' | 'fast', number>;
  // Délai de départ par zone (secondes)
  zone_delays: Record<string, number>;
  // Durée du cycle complet de la variation (secondes)
  cycle_duration: number;
  // BPM du métronome interne
  bpm: number;
  // Coefficient d'easing signature de la variation
  easing_signature: string;
  // Facteur de micro-variation (empêche la répétition mécanique)
  jitter_factor: number;
}

// ─── Profils par variation ───────────────────────────────────────────────────

const VARIATION_TIMING: Record<VariationContext, {
  label:         string;
  global_mult:   number;  // multiplicateur global de durée
  bpm:           number;
  easing:        string;
  jitter:        number;
}> = {
  // A — Autorité Silencieuse : respirations longues, majestueux
  A: {
    label:       'Majestueux φ',
    global_mult: PHI,          // 1.618× plus lent → dignité
    bpm:         37,           // battement lent quasi-méditatif
    easing:      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    jitter:      0.03,
  },
  // B — Précision Tranchante : cadences exactes, sans bavure
  B: {
    label:       'Précision 1:1',
    global_mult: 1.0,          // baseline → clarté
    bpm:         60,           // métronome parfait
    easing:      'cubic-bezier(0.4, 0, 0.2, 1)',
    jitter:      0.01,
  },
  // C — Profondeur Atmosphérique : légèrement plus lent que baseline, flottant
  C: {
    label:       'Atmosphérique φ/√5',
    global_mult: 1 / Math.sqrt(PHI),  // ~1.273 → doux intermédiaire
    bpm:         48,
    easing:      'cubic-bezier(0.55, 0, 1, 0.45)',
    jitter:      0.05,         // légères variations fluides
  },
  // D — Éclat Mémorable : vif, percutant, mémorable
  D: {
    label:       'Explosif 1/φ',
    global_mult: 1 / PHI,     // 0.618× plus rapide → énergie
    bpm:         96,           // beat énergique
    easing:      'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    jitter:      0.07,
  },
};

// ─── Délais Fibonacci par zone ──────────────────────────────────────────────

/**
 * Assigne les délais de départ en ordre Fibonacci :
 * fond (0) → logo (fib[1]) → nom (fib[2]) → séparateur (fib[3]) → titre (fib[4]) → contact (fib[5]) → cta (fib[6])
 * Plus le délai est grand, plus l'apparition est tardive → séquençage naturel.
 */
function buildZoneDelays(globalMult: number): Record<string, number> {
  const scale = (s: number) => parseFloat((s * globalMult).toFixed(3));
  return {
    fond:       0,
    logo:       scale(FIB_S[1]),   // 0.1s × mult
    nom:        scale(FIB_S[2]),   // 0.2s × mult
    separateur: scale(FIB_S[3]),   // 0.3s × mult
    titre:      scale(FIB_S[4]),   // 0.5s × mult
    contact:    scale(FIB_S[5]),   // 0.8s × mult
    cta:        scale(FIB_S[6]),   // 1.3s × mult
  };
}

// ─── Multiplicateurs de vitesse ─────────────────────────────────────────────

/**
 * Retourne des multiplicateurs de durée adaptés à la variation.
 * Remplace les constantes statiques { slow:1.6, medium:1.0, fast:0.65 }.
 *
 * Exemple variation A (mult=1.618) :
 *   slow   → 1.6 × 1.618 = 2.59s (respiration vraiment longue)
 *   medium → 1.0 × 1.618 = 1.62s
 *   fast   → 0.65× 1.618 = 1.05s
 */
function buildSpeedMultipliers(globalMult: number): Record<'slow' | 'medium' | 'fast', number> {
  const BASE = { slow: 1.6, medium: 1.0, fast: 0.65 };
  return {
    slow:   parseFloat((BASE.slow   * globalMult).toFixed(3)),
    medium: parseFloat((BASE.medium * globalMult).toFixed(3)),
    fast:   parseFloat((BASE.fast   * globalMult).toFixed(3)),
  };
}

// ─── API publique ────────────────────────────────────────────────────────────

/**
 * Retourne le profil de timing complet pour une variation donnée.
 */
export function getTimingProfile(variation: VariationContext): ZoneTimingProfile {
  const cfg = VARIATION_TIMING[variation] ?? VARIATION_TIMING.B;
  const mult = cfg.global_mult;

  return {
    speed_multipliers: buildSpeedMultipliers(mult),
    zone_delays:       buildZoneDelays(mult),
    cycle_duration:    parseFloat((60 * mult).toFixed(1)),  // ~60s à 1:1
    bpm:               cfg.bpm,
    easing_signature:  cfg.easing,
    jitter_factor:     cfg.jitter,
  };
}

/**
 * Construit la fonction `d(base, speed)` typée pour le rendu SVG,
 * en utilisant les multiplicateurs du TimingMaster plutôt que les constantes.
 */
export function buildDurationFn(profile: ZoneTimingProfile): (base: number, speed: string) => string {
  const mults = profile.speed_multipliers;
  return (base: number, speed: string): string => {
    const mult = mults[speed as 'slow' | 'medium' | 'fast'] ?? 1.0;
    // Jitter : micro-variation ±jitter_factor% pour l'aspect naturel
    const jitter = 1 + (Math.random() * 2 - 1) * profile.jitter_factor;
    return `${(base * mult * jitter).toFixed(2)}s`;
  };
}

/**
 * Retourne les délais de zone ajustés à partir d'un délai de base.
 */
export function buildZoneDelayOffsets(
  profile: ZoneTimingProfile,
  baseOffset: number
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [zone, delay] of Object.entries(profile.zone_delays)) {
    result[zone] = parseFloat((baseOffset + delay).toFixed(3));
  }
  return result;
}

/**
 * Génère la séquence Fibonacci sur n termes, utilisable pour les timelines SVG.
 */
export function fibonacciSequence(n = 8): number[] {
  const seq = [1, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  return seq;
}

/**
 * Multiplie une durée par le nombre d'or (vers le haut ou vers le bas).
 */
export function goldenRatio(value: number, direction: 'up' | 'down' = 'up'): number {
  return direction === 'up'
    ? parseFloat((value * PHI).toFixed(3))
    : parseFloat((value / PHI).toFixed(3));
}

console.log(`🎵 Timing Master chargé — φ=${PHI.toFixed(4)} | Fibonacci actif | 4 profils de variation`);
