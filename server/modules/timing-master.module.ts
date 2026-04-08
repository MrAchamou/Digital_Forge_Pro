/**
 * 🎵 TIMING MASTER — v3.0
 *
 * Orchestrateur temporel de précision militaire pour signatures email animées.
 *
 * ARCHITECTURE v3.0 :
 *  ┌─ MetronomeSync ────────────────────────────────────────────────────────┐
 *  │  Synchronise toutes les zones sur un métronome BPM commun.             │
 *  │  Chaque zone reçoit un "beat offset" au lieu d'un délai arbitraire.    │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ SectorAwareness ──────────────────────────────────────────────────────┐
 *  │  10 profils secteur : Finance (solennel) → Startup (vif).              │
 *  │  Vitesse, BPM, easing et jitter adaptés à chaque univers métier.       │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ NarrativeTimeline ────────────────────────────────────────────────────┐
 *  │  Mapping des zones sur un arc narratif :                                │
 *  │  intro → développement → climax → repos                                │
 *  │  Délais calculés comme des "actes" coordonnés sur le métronome.         │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ CSS Injection Engine ─────────────────────────────────────────────────┐
 *  │  Génère un bloc <style id="timing-master-v3"> injectable avant </head> │
 *  │  • animation-delay   par zone                                          │
 *  │  • animation-duration multiplié                                        │
 *  │  • animation-timing-function (easing φ-calibré)                       │
 *  │  • @media prefers-reduced-motion automatique                           │
 *  │  • Commentaire <!--[if mso]> Outlook fallback                         │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ CharacterStagger ─────────────────────────────────────────────────────┐
 *  │  Délai par lettre basé sur Fibonacci — pour TYPEWRITER, NAME_REVEAL.   │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ DeterministicJitter ──────────────────────────────────────────────────┐
 *  │  Math.random() remplacé par hash de zone — résultats reproductibles.   │
 *  └────────────────────────────────────────────────────────────────────────┘
 *
 * @version 3.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement
 */

// ─── Constantes mathématiques ────────────────────────────────────────────────

const PHI     = 1.6180339887;      // Nombre d'or φ
const PHI_INV = 1 / PHI;          // φ⁻¹ ≈ 0.618
const SQRT5   = Math.sqrt(5);     // √5 — pour la série de Fibonacci continue

// Fibonacci en secondes (8 premiers termes normalisés)
const FIB_S = [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.3, 2.1] as const;

// Garde-fous CSS absolus
const CSS_MIN_S = 0.1;   // 100 ms minimum
const CSS_MAX_S = 10.0;  // 10 s maximum
const DELAY_MAX_S = 8.0; // Délai max par zone

export const ENGINE_VERSION = '3.0.0';

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export type VariationContext = 'A' | 'B' | 'C' | 'D';
export type NarrativeAct     = 'intro' | 'develop' | 'climax' | 'rest';
export type AnimationSpeed   = 'slow' | 'medium' | 'fast';

/** Zones connues de la signature */
export type ZoneId = 'fond' | 'logo' | 'nom' | 'separateur' | 'titre' | 'contact' | 'cta';

/** Profil BPM d'un secteur métier */
export interface SectorTimingProfile {
  sectorId:    string;
  bpm:         number;         // Battements par minute — base du métronome
  globalMult:  number;         // Multiplicateur de durée global
  easing:      string;         // cubic-bezier signature du secteur
  jitterBase:  number;         // Amplitude de jitter déterministe [0…1]
  intensity:   'light' | 'medium' | 'strong';
}

/** Profil de timing d'une variation (A/B/C/D) */
export interface VariationTimingProfile {
  label:       string;
  globalMult:  number;
  bpm:         number;
  easing:      string;
  jitter:      number;
}

/** Profil de timing complet résolu pour une signature */
export interface ZoneTimingProfile {
  speed_multipliers: Record<AnimationSpeed, number>;
  zone_delays:       Record<ZoneId | string, number>;
  zone_acts:         Record<ZoneId | string, NarrativeAct>;
  cycle_duration:    number;
  bpm:               number;
  beat_duration_s:   number;       // Durée d'un battement (60/BPM)
  easing_signature:  string;
  jitter_factor:     number;
  static_fallback:   boolean;
  reduced_motion:    boolean;
  sector_id:         string | null;
  variation:         VariationContext;
}

/** Paramètres pour calcul de densité textuelle */
export interface TextDensityInput {
  charCount: number;
  zoneCount: number;
  hasCTA:    boolean;
}

/** Résultat d'injection CSS */
export interface TimingCSSBlock {
  styleTag:      string;   // Bloc <style> complet à injecter
  outlookBlock:  string;   // Commentaire conditionnel <!--[if mso]>
  reducedMotion: string;   // @media prefers-reduced-motion
  charStagger?:  string;   // CSS stagger par caractère (si applicable)
  profile:       ZoneTimingProfile;
}

/** Résultat d'application sur HTML complet */
export interface TimingInjectionResult {
  html:           string;
  injected:       boolean;
  profile:        ZoneTimingProfile;
  cssBlockSize:   number;
}

/** Input pour stagger par caractère */
export interface CharStaggerInput {
  text:        string;
  baseDelay:   number;    // Délai de départ (s)
  charDelayMs: number;    // Délai par caractère (ms)
  maxDelay:    number;    // Plafond total (s)
}

/** Résultat de stagger par caractère */
export interface CharStaggerResult {
  spans:   string;    // HTML avec spans inline-delay
  totalMs: number;    // Durée totale (ms)
}

// ─── Secteur — 10 profils métier ─────────────────────────────────────────────

const SECTOR_PROFILES: Record<string, SectorTimingProfile> = {
  tech: {
    sectorId:   'tech',
    bpm:        72,
    globalMult: 1.0,
    easing:     'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    jitterBase: 0.03,
    intensity:  'medium',
  },
  finance: {
    sectorId:   'finance',
    bpm:        44,
    globalMult: PHI,            // Majestueux — toutes les durées × 1.618
    easing:     'cubic-bezier(0.4, 0.0, 0.2, 1)',
    jitterBase: 0.01,           // Quasi-rigide — finance = précision
    intensity:  'light',
  },
  health: {
    sectorId:   'health',
    bpm:        60,
    globalMult: 1.2,
    easing:     'cubic-bezier(0.4, 0.0, 0.6, 1)',  // Doux, symétrique
    jitterBase: 0.04,
    intensity:  'light',
  },
  legal: {
    sectorId:   'legal',
    bpm:        40,
    globalMult: PHI * 1.1,      // Encore plus solennel que finance
    easing:     'cubic-bezier(0.0, 0.0, 0.2, 1)',
    jitterBase: 0.005,          // Rigidité absolue
    intensity:  'light',
  },
  realestate: {
    sectorId:   'realestate',
    bpm:        52,
    globalMult: 1.3,
    easing:     'cubic-bezier(0.25, 0.1, 0.25, 1)',
    jitterBase: 0.03,
    intensity:  'medium',
  },
  startup: {
    sectorId:   'startup',
    bpm:        96,
    globalMult: PHI_INV,        // Vif — toutes les durées × 0.618
    easing:     'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Overshoot
    jitterBase: 0.07,
    intensity:  'strong',
  },
  creative: {
    sectorId:   'creative',
    bpm:        80,
    globalMult: 0.9,
    easing:     'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Spring naturel
    jitterBase: 0.08,
    intensity:  'strong',
  },
  luxury: {
    sectorId:   'luxury',
    bpm:        37,
    globalMult: PHI * PHI_INV,  // = 1.0 mais calculé harmoniquement
    easing:     'cubic-bezier(0.1, 0.7, 0.1, 1)',    // Très lent départ, long glisse
    jitterBase: 0.02,
    intensity:  'light',
  },
  education: {
    sectorId:   'education',
    bpm:        65,
    globalMult: 1.1,
    easing:     'cubic-bezier(0.4, 0, 0.2, 1)',
    jitterBase: 0.03,
    intensity:  'medium',
  },
  standard: {
    sectorId:   'standard',
    bpm:        60,
    globalMult: 1.0,
    easing:     'cubic-bezier(0.4, 0, 0.2, 1)',
    jitterBase: 0.02,
    intensity:  'medium',
  },
};

// Alias secteur → clé normalisée
const SECTOR_ALIAS: Record<string, string> = {
  technologie: 'tech', digital: 'tech', informatique: 'tech',
  finances: 'finance', banque: 'finance', assurance: 'finance',
  sante: 'health', médecine: 'health', medical: 'health', médicale: 'health',
  juridique: 'legal', droit: 'legal', avocat: 'legal',
  immobilier: 'realestate', real_estate: 'realestate',
  startup: 'startup', innovation: 'startup',
  creativite: 'creative', design: 'creative', art: 'creative', agence: 'creative',
  luxe: 'luxury', premium: 'luxury', mode: 'luxury',
  education: 'education', formation: 'education', université: 'education',
};

function resolveSectorKey(sectorId?: string): string {
  if (!sectorId) return 'standard';
  const normalized = sectorId.toLowerCase().replace(/[-\s]/g, '');
  return SECTOR_PROFILES[normalized]
    ? normalized
    : SECTOR_ALIAS[normalized] ?? 'standard';
}

// ─── Variation — 4 profils A/B/C/D ───────────────────────────────────────────

const VARIATION_TIMING: Record<VariationContext, VariationTimingProfile> = {
  A: {
    label:       'Majestueux φ',
    globalMult:  PHI,
    bpm:         37,
    easing:      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    jitter:      0.03,
  },
  B: {
    label:       'Précision 1:1',
    globalMult:  1.0,
    bpm:         60,
    easing:      'cubic-bezier(0.4, 0, 0.2, 1)',
    jitter:      0.01,
  },
  C: {
    label:       'Atmosphérique φ/√5',
    globalMult:  1 / Math.sqrt(PHI),
    bpm:         48,
    easing:      'cubic-bezier(0.55, 0, 1, 0.45)',
    jitter:      0.05,
  },
  D: {
    label:       'Explosif 1/φ',
    globalMult:  PHI_INV,
    bpm:         96,
    easing:      'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    jitter:      0.07,
  },
};

// ─── Arc Narratif — mapping zones → actes ────────────────────────────────────

const NARRATIVE_MAP: Record<ZoneId, NarrativeAct> = {
  fond:       'intro',    // Le fond s'installe en premier (décor)
  logo:       'develop',  // Le logo apparaît — développement de l'identité
  nom:        'develop',  // Le nom suit le logo
  separateur: 'develop',  // Séparateur — ponctuation visuelle
  titre:      'climax',   // Titre/poste — pic d'information
  contact:    'climax',   // Contact — information clé
  cta:        'rest',     // CTA — invitation au calme, appel à l'action final
};

// Multiplicateur de délai par acte (relatif au beat_duration)
const ACT_BEAT_OFFSETS: Record<NarrativeAct, number> = {
  intro:   0,    // Beat 0 — début immédiat
  develop: 2,    // Beats 2 — après 2 pulsations
  climax:  4,    // Beats 4 — montée en puissance
  rest:    7,    // Beats 7 — respiration finale (nombre Fibonacci)
};

// ─── Helpers mathématiques ───────────────────────────────────────────────────

function clampDuration(value: number, context = ''): number {
  if (value < CSS_MIN_S) {
    if (context) console.warn(`⚠️  TimingMaster — durée trop courte (${value.toFixed(3)}s) en "${context}", ramenée à ${CSS_MIN_S}s`);
    return CSS_MIN_S;
  }
  if (value > CSS_MAX_S) {
    if (context) console.warn(`⚠️  TimingMaster — durée trop longue (${value.toFixed(3)}s) en "${context}", plafonnée à ${CSS_MAX_S}s`);
    return CSS_MAX_S;
  }
  return value;
}

function clampDelay(value: number): number {
  return Math.max(0, Math.min(value, DELAY_MAX_S));
}

/**
 * Jitter déterministe — basé sur un hash djb2 de la chaîne zone.
 * Résultats 100% reproductibles — pas de Math.random().
 */
function deterministicJitter(seed: string, amplitude: number): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
    hash = hash >>> 0; // Convertit en uint32
  }
  // Normalise [0…1] puis centre sur [-amplitude, +amplitude]
  const norm = (hash % 10000) / 10000;  // [0…1]
  return (norm * 2 - 1) * amplitude;    // [-amplitude, +amplitude]
}

/**
 * Fusion des multiplicateurs secteur + variation.
 * Priorité variation > secteur > défaut.
 */
function mergeMultipliers(
  sectorMult: number,
  variationMult: number
): number {
  // Moyenne géométrique : préserve les deux contributions
  return parseFloat(Math.sqrt(sectorMult * variationMult).toFixed(4));
}

// ─── MetronomeSync ───────────────────────────────────────────────────────────

/**
 * Calcule la durée d'un battement en secondes depuis un BPM.
 */
function beatDuration(bpm: number): number {
  return parseFloat((60 / Math.max(10, Math.min(240, bpm))).toFixed(4));
}

/**
 * Génère les délais de zone synchronisés sur le métronome.
 * Chaque zone est assignée à un acte narratif avec un offset en beats.
 */
function buildMetronomeDelays(
  beatDur: number,
  globalMult: number,
  reducedMotion: boolean
): Record<ZoneId, number> {
  if (reducedMotion) {
    return { fond: 0, logo: 0, nom: 0, separateur: 0, titre: 0, contact: 0, cta: 0 };
  }

  const delays: Partial<Record<ZoneId, number>> = {};
  const zones: ZoneId[] = ['fond', 'logo', 'nom', 'separateur', 'titre', 'contact', 'cta'];

  for (const zone of zones) {
    const act       = NARRATIVE_MAP[zone];
    const beatOffset = ACT_BEAT_OFFSETS[act];
    // Délai = beat_offset × beat_duration × globalMult + jitter déterministe
    const rawDelay  = beatOffset * beatDur * globalMult;
    const jitter    = deterministicJitter(`metronome-${zone}`, beatDur * 0.05);
    delays[zone]    = parseFloat(clampDelay(rawDelay + jitter).toFixed(3));
  }

  return delays as Record<ZoneId, number>;
}

// ─── Speed Multipliers ───────────────────────────────────────────────────────

function buildSpeedMultipliers(globalMult: number): Record<AnimationSpeed, number> {
  const BASE = { slow: 1.6, medium: 1.0, fast: 0.65 };
  return {
    slow:   parseFloat(clampDuration(BASE.slow   * globalMult, 'slow').toFixed(3)),
    medium: parseFloat(clampDuration(BASE.medium * globalMult, 'medium').toFixed(3)),
    fast:   parseFloat(clampDuration(BASE.fast   * globalMult, 'fast').toFixed(3)),
  };
}

// ─── API publique — Profils ───────────────────────────────────────────────────

/**
 * Retourne le profil de timing complet pour une variation + secteur donnés.
 */
export function getTimingProfile(
  variation: VariationContext = 'B',
  options?: {
    sectorId?:      string;
    reducedMotion?: boolean;
    staticFallback?: boolean;
    textDensity?:   TextDensityInput;
  }
): ZoneTimingProfile {
  const varCfg    = VARIATION_TIMING[variation] ?? VARIATION_TIMING.B;
  const sectorKey = resolveSectorKey(options?.sectorId);
  const secCfg    = SECTOR_PROFILES[sectorKey];

  const isReduced = options?.reducedMotion ?? false;

  // Fusionne les multiplicateurs variation + secteur
  const globalMult = isReduced
    ? 0.01
    : mergeMultipliers(secCfg.globalMult, varCfg.globalMult);

  // BPM : variation prend la main si différent du standard
  const bpm = varCfg.bpm !== 60 ? varCfg.bpm : secCfg.bpm;
  const beat = beatDuration(bpm);

  // Jitter fusionné : max des deux (plus expressif si l'un des deux est fort)
  const jitter = isReduced ? 0 : Math.max(secCfg.jitterBase, varCfg.jitter);

  // Durée de cycle : base 5s calibrée sur les animations email (4-8s typique)
  // On n'émet pas d'avertissement sur la valeur brute — le clamp est le comportement normal
  const rawCycle = Math.min(5.0 * globalMult, CSS_MAX_S);
  let cycleDuration = parseFloat(rawCycle.toFixed(1));
  if (options?.textDensity) {
    const densityMult = computeTextDensityMultiplier(options.textDensity);
    cycleDuration     = parseFloat(Math.min(cycleDuration * densityMult, CSS_MAX_S).toFixed(1));
  }

  return {
    speed_multipliers: buildSpeedMultipliers(isReduced ? 0.01 : globalMult),
    zone_delays:       buildMetronomeDelays(beat, isReduced ? 0 : globalMult, isReduced),
    zone_acts:         { ...NARRATIVE_MAP },
    cycle_duration:    parseFloat(cycleDuration.toFixed(1)),
    bpm,
    beat_duration_s:   beat,
    easing_signature:  isReduced ? 'linear' : (secCfg.easing || varCfg.easing),
    jitter_factor:     jitter,
    static_fallback:   options?.staticFallback ?? false,
    reduced_motion:    isReduced,
    sector_id:         sectorKey,
    variation,
  };
}

/**
 * Retourne le profil TimingMaster pour tous les secteurs × variations.
 * Utile pour pré-calcul et cache.
 */
export function getAllTimingProfiles(): Record<string, ZoneTimingProfile> {
  const result: Record<string, ZoneTimingProfile> = {};
  const sectors = Object.keys(SECTOR_PROFILES);
  const variants: VariationContext[] = ['A', 'B', 'C', 'D'];

  for (const sector of sectors) {
    for (const variant of variants) {
      result[`${sector}-${variant}`] = getTimingProfile(variant, { sectorId: sector });
    }
  }
  return result;
}

// ─── Densité textuelle ───────────────────────────────────────────────────────

export function computeTextDensityMultiplier(density: TextDensityInput): number {
  const { charCount, zoneCount, hasCTA } = density;
  let mult = 1.0;

  if (charCount > 100) {
    mult += Math.min((charCount - 100) / 500, 0.5);
  }
  if (zoneCount > 4) {
    mult += (zoneCount - 4) * 0.05;
  }
  if (hasCTA) mult += 0.08;

  return parseFloat(Math.min(mult, 1.8).toFixed(3));
}

// ─── CharacterStagger ────────────────────────────────────────────────────────

/**
 * Génère des spans CSS avec animation-delay progressif par caractère.
 * Basé sur la suite de Fibonacci normalisée pour des délais naturels.
 * Utilisé pour effets TYPEWRITER, NAME_REVEAL, etc.
 */
export function buildCharacterStagger(input: CharStaggerInput): CharStaggerResult {
  const { text, baseDelay, charDelayMs, maxDelay } = input;
  const chars   = text.split('');
  let   totalMs = 0;
  const spans: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    // Progression Fibonacci normalisée
    const fibIndex = Math.min(i, FIB_S.length - 1);
    const fibScale = FIB_S[fibIndex] / FIB_S[FIB_S.length - 1]; // 0…1
    const rawDelay = baseDelay + (i * charDelayMs / 1000) * (1 + fibScale * 0.3);
    const delay    = clampDelay(Math.min(rawDelay, maxDelay));
    totalMs        = Math.max(totalMs, delay * 1000 + charDelayMs);

    spans.push(
      `<span style="display:inline-block;animation-delay:${delay.toFixed(3)}s">${
        chars[i] === ' ' ? '&nbsp;' : chars[i]
      }</span>`
    );
  }

  return { spans: spans.join(''), totalMs };
}

// ─── CSS Injection Engine ────────────────────────────────────────────────────

/**
 * Génère le bloc <style> complet du TimingMaster pour injection avant </head>.
 */
export function generateTimingCSS(profile: ZoneTimingProfile, instanceId = 'default'): string {
  const delays  = profile.zone_delays;
  const mults   = profile.speed_multipliers;
  const easing  = profile.easing_signature;
  const zones   = Object.keys(delays) as ZoneId[];

  const zoneRules = zones.map(zone => {
    const delay      = delays[zone] ?? 0;
    const act        = NARRATIVE_MAP[zone] ?? 'intro';
    const speedMult  = act === 'climax' ? mults.fast : act === 'rest' ? mults.slow : mults.medium;
    const durScale   = `calc(var(--sig-anim-duration, 1s) * ${speedMult.toFixed(3)})`;

    return `
  /* Zone ${zone} — Acte: ${act} | Délai: ${delay}s | Mult: ×${speedMult} */
  .zone-${zone},
  [data-zone="${zone}"],
  .sig-${zone} {
    animation-delay: ${delay}s !important;
    animation-duration: ${durScale} !important;
    animation-timing-function: ${easing} !important;
  }`;
  }).join('\n');

  // Variables CSS globales du métronome
  const globalVars = `
  :root {
    --tm-bpm: ${profile.bpm};
    --tm-beat: ${profile.beat_duration_s.toFixed(4)}s;
    --tm-cycle: ${profile.cycle_duration.toFixed(1)}s;
    --tm-easing: ${easing};
    --tm-variation: "${profile.variation}";
    --tm-sector: "${profile.sector_id ?? 'standard'}";
    --tm-global-mult: ${profile.speed_multipliers.medium.toFixed(3)};
  }`;

  return `<style id="timing-master-v3-${instanceId}" data-engine="TimingMaster-${ENGINE_VERSION}" data-variation="${profile.variation}" data-sector="${profile.sector_id ?? 'standard'}">
  /* ═══════════════════════════════════════════════════════════════════
     🎵 TIMING MASTER v${ENGINE_VERSION} — Métronome Synchronisé
     BPM: ${profile.bpm} | Beat: ${profile.beat_duration_s.toFixed(4)}s | Cycle: ${profile.cycle_duration}s
     Variation: ${profile.variation} | Secteur: ${profile.sector_id ?? 'standard'}
     Jitter: ±${(profile.jitter_factor * 100).toFixed(1)}% (déterministe — reproductible)
     ═══════════════════════════════════════════════════════════════════ */
  ${globalVars}
  ${zoneRules}
</style>`;
}

/**
 * Génère le commentaire conditionnel Outlook 2016/2019.
 * Désactive toutes les animations — rendu statique parfait.
 */
export function generateOutlookFallback(
  zoneColors: Record<string, string> = {}
): { inlineCSS: string; note: string; msoBlock: string } {
  const colorRules = Object.entries(zoneColors)
    .map(([zone, color]) => `    .zone-${zone} { color: ${color}; opacity: 1; }`)
    .join('\n');

  const inlineCSS = `/* Fallback statique Outlook — animations désactivées */
  .animated-zone, [data-zone] {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
${colorRules ? colorRules + '\n' : ''}`;

  const msoBlock = `<!--[if mso]>
<style type="text/css">
${inlineCSS}
</style>
<![endif]-->`;

  return {
    inlineCSS,
    note:     'CSS statique Outlook 2016/2019 — aucune animation.',
    msoBlock,
  };
}

/**
 * Génère le bloc @media prefers-reduced-motion.
 */
export function generateReducedMotionCSS(): string {
  return `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
    scroll-behavior:           auto   !important;
  }
}`;
}

/**
 * Génère le bloc CSS complet : timing + reduced-motion.
 */
export function generateFullTimingBlock(
  profile: ZoneTimingProfile,
  options?: {
    instanceId?:   string;
    zoneColors?:   Record<string, string>;
    withOutlook?:  boolean;
    withCharStagger?: { zone: ZoneId; text: string };
  }
): TimingCSSBlock {
  const instanceId   = options?.instanceId ?? 'default';
  const styleTag     = generateTimingCSS(profile, instanceId);
  const reducedMotion = generateReducedMotionCSS();
  const outlook      = options?.withOutlook !== false
    ? generateOutlookFallback(options?.zoneColors)
    : { msoBlock: '', inlineCSS: '', note: '' };

  let charStagger: string | undefined;
  if (options?.withCharStagger) {
    const beat = profile.beat_duration_s;
    const baseDelay = profile.zone_delays[options.withCharStagger.zone] ?? 0;
    const result = buildCharacterStagger({
      text:        options.withCharStagger.text,
      baseDelay,
      charDelayMs: Math.round(beat * 80),  // ~80% du beat en ms par caractère
      maxDelay:    4.0,
    });
    charStagger = `/* Char Stagger — Zone ${options.withCharStagger.zone} */\n${result.spans}`;
  }

  return {
    styleTag,
    outlookBlock:  outlook.msoBlock,
    reducedMotion: `<style id="tm-reduced-motion">\n${reducedMotion}\n</style>`,
    charStagger,
    profile,
  };
}

// ─── Injection HTML ──────────────────────────────────────────────────────────

/**
 * Injecte le bloc CSS TimingMaster dans un HTML avant </head>.
 * Compatible avec l'injection du VarianceEngine (non-destructif).
 */
export function injectTimingIntoHTML(
  html:      string,
  variation: VariationContext,
  options?: {
    sectorId?:     string;
    reducedMotion?: boolean;
    zoneColors?:   Record<string, string>;
    instanceId?:   string;
    textDensity?:  TextDensityInput;
  }
): TimingInjectionResult {
  const profile  = getTimingProfile(variation, {
    sectorId:      options?.sectorId,
    reducedMotion: options?.reducedMotion,
    staticFallback: false,
    textDensity:   options?.textDensity,
  });

  const block = generateFullTimingBlock(profile, {
    instanceId:  options?.instanceId ?? `${variation}-${options?.sectorId ?? 'std'}`,
    zoneColors:  options?.zoneColors,
    withOutlook: true,
  });

  const injection = `${block.outlookBlock}\n${block.reducedMotion}\n${block.styleTag}`;
  const hasHead   = /<\/head>/i.test(html);

  const injectedHtml = hasHead
    ? html.replace(/<\/head>/i, `${injection}\n</head>`)
    : `${injection}\n${html}`;

  return {
    html:         injectedHtml,
    injected:     true,
    profile,
    cssBlockSize: injection.length,
  };
}

// ─── Utilitaires publics ─────────────────────────────────────────────────────

/** Retourne la suite de Fibonacci sur n termes */
export function fibonacciSequence(n = 8): number[] {
  const seq = [1, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
  return seq;
}

/** Applique le nombre d'or dans une direction */
export function goldenRatio(value: number, direction: 'up' | 'down' = 'up'): number {
  return direction === 'up'
    ? parseFloat((value * PHI).toFixed(3))
    : parseFloat((value / PHI).toFixed(3));
}

/** Détecte si le header HTTP indique prefers-reduced-motion */
export function detectReducedMotion(headers?: Record<string, string>): boolean {
  if (!headers) return false;
  const hint = headers['sec-ch-prefers-reduced-motion'] ?? headers['prefers-reduced-motion'] ?? '';
  return hint.toLowerCase() === 'reduce';
}

/** Retourne le profil de timing avec densité textuelle */
export function getTimingProfileWithDensity(
  variation: VariationContext,
  density: TextDensityInput,
  sectorId?: string
): ZoneTimingProfile {
  return getTimingProfile(variation, { sectorId, textDensity: density });
}

/** Retourne la liste des profils secteur disponibles */
export function getSectorTimingProfiles(): SectorTimingProfile[] {
  return Object.values(SECTOR_PROFILES);
}

/** Construit la fonction de durée appliquée */
export function buildDurationFn(
  profile: ZoneTimingProfile
): (base: number, speed: AnimationSpeed) => string {
  const mults = profile.speed_multipliers;
  return (base: number, speed: AnimationSpeed): string => {
    const mult   = mults[speed] ?? 1.0;
    const zone   = speed;
    const jitter = profile.reduced_motion
      ? 1
      : 1 + deterministicJitter(`durationFn-${zone}-${base}`, profile.jitter_factor);
    const raw    = base * mult * jitter;
    return `${clampDuration(raw, `duration(${speed})`).toFixed(2)}s`;
  };
}

/** Ajoute les offsets de base aux délais de zone */
export function buildZoneDelayOffsets(
  profile: ZoneTimingProfile,
  baseOffset: number
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [zone, delay] of Object.entries(profile.zone_delays)) {
    result[zone] = parseFloat(clampDelay(baseOffset + delay).toFixed(3));
  }
  return result;
}

console.log(
  `🎵 TimingMaster v${ENGINE_VERSION} chargé — φ=${PHI.toFixed(4)} | MetronomeSync | SectorAwareness(10) | NarrativeTimeline | CSS Injection | CharStagger | DeterministicJitter`
);
