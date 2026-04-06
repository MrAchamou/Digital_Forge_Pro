/**
 * 🎵 TIMING MASTER — v2.0
 *
 * Génère des séquences temporelles basées sur des principes mathématiques naturels.
 * - Nombre d'or (φ = 1.618) pour les transitions majestueuses
 * - Suite de Fibonacci pour les délais inter-zones
 * - Métronome principal synchronisant toutes les zones
 * - Micro-variations anti-monotonie
 * - Fallback statique automatique pour Outlook 2016/2019
 * - Calcul durée optimale selon densité textuelle
 * - Respect de prefers-reduced-motion
 * - Garde-fous CSS : durée min 100ms / max 10s
 */

export type VariationContext = 'A' | 'B' | 'C' | 'D';

// φ — nombre d'or
const PHI   = 1.6180339887;
// Premiers 8 termes Fibonacci normalisés (en secondes)
const FIB_S = [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.3, 2.1];

// ─── Garde-fous CSS ──────────────────────────────────────────────────────────

const CSS_DURATION_MIN_S = 0.1;   // 100 ms minimum
const CSS_DURATION_MAX_S = 10.0;  // 10 s maximum

/**
 * Contraint une durée entre les garde-fous CSS et émet une alerte si dépassement.
 */
function clampDuration(value: number, context = ''): number {
  if (value < CSS_DURATION_MIN_S) {
    console.warn(`⚠️  TimingMaster — durée trop courte (${value.toFixed(3)}s) en "${context}", ramenée à ${CSS_DURATION_MIN_S}s`);
    return CSS_DURATION_MIN_S;
  }
  if (value > CSS_DURATION_MAX_S) {
    console.warn(`⚠️  TimingMaster — durée trop longue (${value.toFixed(3)}s) en "${context}", plafonnée à ${CSS_DURATION_MAX_S}s`);
    return CSS_DURATION_MAX_S;
  }
  return value;
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ZoneTimingProfile {
  speed_multipliers: Record<'slow' | 'medium' | 'fast', number>;
  zone_delays:       Record<string, number>;
  cycle_duration:    number;
  bpm:               number;
  easing_signature:  string;
  jitter_factor:     number;
  /** Indique si le profil doit générer un fallback statique (clients email sans animation) */
  static_fallback:   boolean;
  /** Indique si les animations doivent être réduites (prefers-reduced-motion) */
  reduced_motion:    boolean;
}

export interface TextDensityInput {
  /** Nombre de caractères total dans la signature */
  charCount: number;
  /** Nombre de zones remplies (logo, nom, titre, contact…) */
  zoneCount: number;
  /** Présence d'un CTA */
  hasCTA: boolean;
}

export interface OutlookFallback {
  /** CSS statique inline pour Outlook 2016/2019 (pas d'animations) */
  inlineCSS: string;
  /** Message descriptif */
  note: string;
}

// ─── Profils par variation ───────────────────────────────────────────────────

const VARIATION_TIMING: Record<VariationContext, {
  label:       string;
  global_mult: number;
  bpm:         number;
  easing:      string;
  jitter:      number;
}> = {
  A: {
    label:       'Majestueux φ',
    global_mult: PHI,
    bpm:         37,
    easing:      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    jitter:      0.03,
  },
  B: {
    label:       'Précision 1:1',
    global_mult: 1.0,
    bpm:         60,
    easing:      'cubic-bezier(0.4, 0, 0.2, 1)',
    jitter:      0.01,
  },
  C: {
    label:       'Atmosphérique φ/√5',
    global_mult: 1 / Math.sqrt(PHI),
    bpm:         48,
    easing:      'cubic-bezier(0.55, 0, 1, 0.45)',
    jitter:      0.05,
  },
  D: {
    label:       'Explosif 1/φ',
    global_mult: 1 / PHI,
    bpm:         96,
    easing:      'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    jitter:      0.07,
  },
};

// ─── Délais Fibonacci par zone ──────────────────────────────────────────────

function buildZoneDelays(globalMult: number): Record<string, number> {
  const scale = (s: number) => parseFloat(clampDuration(s * globalMult, 'zone_delay').toFixed(3));
  return {
    fond:       0,
    logo:       scale(FIB_S[1]),
    nom:        scale(FIB_S[2]),
    separateur: scale(FIB_S[3]),
    titre:      scale(FIB_S[4]),
    contact:    scale(FIB_S[5]),
    cta:        scale(FIB_S[6]),
  };
}

// ─── Multiplicateurs de vitesse ─────────────────────────────────────────────

function buildSpeedMultipliers(globalMult: number): Record<'slow' | 'medium' | 'fast', number> {
  const BASE = { slow: 1.6, medium: 1.0, fast: 0.65 };
  return {
    slow:   parseFloat(clampDuration(BASE.slow   * globalMult, 'slow').toFixed(3)),
    medium: parseFloat(clampDuration(BASE.medium * globalMult, 'medium').toFixed(3)),
    fast:   parseFloat(clampDuration(BASE.fast   * globalMult, 'fast').toFixed(3)),
  };
}

// ─── Durée optimale selon densité textuelle ──────────────────────────────────

/**
 * Calcule un multiplicateur de durée en fonction de la densité textuelle.
 * Plus il y a de texte, plus le cycle est long pour laisser le temps à la lecture.
 *
 * Règle : +0.1× par tranche de 50 caractères supplémentaires (au-delà de 100)
 */
export function computeTextDensityMultiplier(density: TextDensityInput): number {
  const { charCount, zoneCount, hasCTA } = density;
  let mult = 1.0;

  // Bonus densité textuelle
  if (charCount > 100) {
    mult += Math.min((charCount - 100) / 500, 0.5);  // max +50%
  }

  // Bonus nombre de zones
  if (zoneCount > 4) {
    mult += (zoneCount - 4) * 0.05;  // +5% par zone supplémentaire
  }

  // CTA : un peu plus long pour que le regard s'attarde
  if (hasCTA) mult += 0.08;

  return parseFloat(Math.min(mult, 1.8).toFixed(3));  // cap à 180%
}

/**
 * Retourne le profil de timing ajusté avec la densité textuelle.
 */
export function getTimingProfileWithDensity(
  variation: VariationContext,
  density: TextDensityInput
): ZoneTimingProfile {
  const base   = getTimingProfile(variation);
  const factor = computeTextDensityMultiplier(density);

  return {
    ...base,
    cycle_duration: parseFloat(clampDuration(base.cycle_duration * factor, 'cycle').toFixed(1)),
  };
}

// ─── Fallback statique Outlook 2016/2019 ────────────────────────────────────

/**
 * Génère le CSS inline statique pour Outlook 2016/2019 qui ne supporte pas les animations CSS.
 * Ce CSS doit être inséré dans des commentaires conditionnels <!--[if mso]> … <![endif]-->.
 */
export function generateOutlookFallback(zoneColors: Record<string, string>): OutlookFallback {
  const rules = Object.entries(zoneColors)
    .map(([zone, color]) => `.zone-${zone} { color: ${color}; opacity: 1; }`)
    .join('\n  ');

  const inlineCSS = `
/* Fallback statique Outlook 2016/2019 — animations désactivées */
@media all {
  .animated-zone {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
  ${rules}
}`;

  return {
    inlineCSS,
    note: 'CSS statique pour Outlook 2016/2019 — aucune animation prise en charge par ce client email.',
  };
}

// ─── prefers-reduced-motion ──────────────────────────────────────────────────

/**
 * Génère le bloc CSS @media (prefers-reduced-motion: reduce) pour respecter
 * les préférences d'accessibilité de l'utilisateur.
 */
export function generateReducedMotionCSS(): string {
  return `
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`;
}

/**
 * Vérifie si le contexte serveur indique une préférence de mouvement réduit.
 * Sur le serveur, on s'appuie sur un header HTTP ou un flag de session.
 */
export function detectReducedMotion(headers?: Record<string, string>): boolean {
  if (!headers) return false;
  const hint = headers['sec-ch-prefers-reduced-motion'] || headers['prefers-reduced-motion'] || '';
  return hint.toLowerCase() === 'reduce';
}

// ─── API publique ────────────────────────────────────────────────────────────

export function getTimingProfile(
  variation: VariationContext,
  options?: { reducedMotion?: boolean; staticFallback?: boolean }
): ZoneTimingProfile {
  const cfg  = VARIATION_TIMING[variation] ?? VARIATION_TIMING.B;
  const mult = cfg.global_mult;
  const isReduced = options?.reducedMotion ?? false;

  // En mode reduced motion : durées minimum, pas de jitter
  const effectiveMult = isReduced ? 0.01 : mult;

  return {
    speed_multipliers: buildSpeedMultipliers(effectiveMult),
    zone_delays:       isReduced ? buildZeroDelays() : buildZoneDelays(mult),
    cycle_duration:    isReduced ? 0.01 : parseFloat(clampDuration(60 * mult, 'cycle').toFixed(1)),
    bpm:               cfg.bpm,
    easing_signature:  isReduced ? 'linear' : cfg.easing,
    jitter_factor:     isReduced ? 0 : cfg.jitter,
    static_fallback:   options?.staticFallback ?? false,
    reduced_motion:    isReduced,
  };
}

function buildZeroDelays(): Record<string, number> {
  return { fond: 0, logo: 0, nom: 0, separateur: 0, titre: 0, contact: 0, cta: 0 };
}

export function buildDurationFn(profile: ZoneTimingProfile): (base: number, speed: string) => string {
  const mults = profile.speed_multipliers;
  return (base: number, speed: string): string => {
    const mult   = mults[speed as 'slow' | 'medium' | 'fast'] ?? 1.0;
    const jitter = profile.reduced_motion ? 1 : 1 + (Math.random() * 2 - 1) * profile.jitter_factor;
    const raw    = base * mult * jitter;
    return `${clampDuration(raw, `duration(${speed})`).toFixed(2)}s`;
  };
}

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

export function fibonacciSequence(n = 8): number[] {
  const seq = [1, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  return seq;
}

export function goldenRatio(value: number, direction: 'up' | 'down' = 'up'): number {
  return direction === 'up'
    ? parseFloat((value * PHI).toFixed(3))
    : parseFloat((value / PHI).toFixed(3));
}

console.log(`🎵 Timing Master v2.0 chargé — φ=${PHI.toFixed(4)} | Fibonacci | prefers-reduced-motion | Outlook fallback | Garde-fous CSS`);
