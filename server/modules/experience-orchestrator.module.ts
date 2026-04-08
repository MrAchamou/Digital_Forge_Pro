/**
 * 🎬 EXPERIENCE ORCHESTRATOR — v3.0
 *
 * Définit un arc narratif complet (intro → développement → climax → repos)
 * pour l'ensemble de la signature animée. Coordonne les actes de la
 * sequence_narrative en une chorégraphie cohérente, comme un mini-film de 4s.
 *
 * ARCHITECTURE v3.0 :
 *  ┌─ NarrativeArcBuilder ──────────────────────────────────────────────────────┐
 *  │  Construit la timeline narrative selon le secteur et le nombre d'éléments. │
 *  │  Arc canonique φ : intro(23%) → develop(38%) → climax(23%) → rest(16%)    │
 *  │  Ratios dérivés du nombre d'or (φ=1.618) pour un rendu organique.          │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ ActDirector ──────────────────────────────────────────────────────────────┐
 *  │  Chaque acte reçoit : timing CSS (delay/duration/easing), intensité        │
 *  │  d'animation, courbe d'entrée/sortie. Les actes s'enchaînent sans coupure. │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ ElementScheduler ─────────────────────────────────────────────────────────┐
 *  │  Distribue chaque élément (nom, titre, email, avatar…) dans l'arc.         │
 *  │  Priorité : avatar en intro, CTA au climax, séparateurs au repos.          │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ CSSChoreographer ─────────────────────────────────────────────────────────┐
 *  │  Génère le bloc CSS complet avec :                                         │
 *  │  • custom-properties par acte (--sig-act-delay, --sig-act-dur…)            │
 *  │  • @keyframes d'orchestration (fade-in séquentiel φ-synchronisé)           │
 *  │  • prefers-reduced-motion : animation condensée 0.5s                       │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *
 * @version 3.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement
 */

// ─── Constantes mathématiques ─────────────────────────────────────────────────

const PHI      = 1.6180339887;
const PHI_INV  = 1 / PHI;         // ≈ 0.618
const PHI_INV2 = PHI_INV * PHI_INV; // ≈ 0.382

export const ENGINE_VERSION = '3.0.0';

/** Durée totale de référence de la signature (ms) */
const SIGNATURE_DURATION_MS = 4000;

/** Durée minimale d'un acte (ms) */
const ACT_MIN_MS = 400;

// ─── Arc narratif canonique (ratios φ) ───────────────────────────────────────

const ARC_RATIOS = {
  intro:   PHI_INV2,                              // ≈ 0.236
  develop: PHI_INV - PHI_INV2,                    // ≈ 0.382
  climax:  PHI_INV2,                              // ≈ 0.236
  rest:    1 - PHI_INV,                           // ≈ 0.146
} as const;

// ─── Types & Interfaces ───────────────────────────────────────────────────────

export type NarrativeAct    = 'intro' | 'develop' | 'climax' | 'rest';
export type ElementRole     = 'avatar' | 'name' | 'title' | 'company' | 'email' | 'phone' | 'cta' | 'separator' | 'logo' | 'badge';
export type SectorId        = 'artisanat' | 'commerce' | 'education' | 'immobilier' | 'loisirs' | 'restauration' | 'sante' | 'services_pro' | 'tech' | 'transport';
export type OrchestrationStyle = 'cinematic' | 'cascade' | 'burst' | 'wave' | 'staggered';

/** Définition d'un élément à orchestrer */
export interface SignatureElement {
  id:       string;
  role:     ElementRole;
  cssClass: string;
  /** Priorité narrative : 1 = plus tôt, 5 = plus tard */
  priority?: number;
}

/** Configuration de l'orchestration */
export interface OrchestratorConfig {
  elements:           SignatureElement[];
  sectorId:           SectorId;
  totalDurationMs?:   number;
  style?:             OrchestrationStyle;
  /** Acte à accentuer (le climax sera plus long pour ce secteur) */
  accentAct?:         NarrativeAct;
}

/** Timing d'un acte narratif */
export interface ActTiming {
  act:           NarrativeAct;
  startMs:       number;
  durationMs:    number;
  endMs:         number;
  easingIn:      string;
  easingOut:     string;
  intensityScale: number;  // 0.0…1.0 — amplitude d'animation pendant cet acte
  cssDelay:      string;   // ex: "0.8s"
  cssDuration:   string;   // ex: "0.92s"
}

/** Ordonnancement d'un élément dans l'arc */
export interface ElementSchedule {
  element:       SignatureElement;
  assignedAct:   NarrativeAct;
  delayMs:       number;
  durationMs:    number;
  easing:        string;
  cssDelay:      string;
  cssDuration:   string;
  cssClass:      string;
}

/** Résultat complet de l'orchestration */
export interface OrchestrationResult {
  /** Durée totale effective (ms) */
  totalDurationMs: number;
  /** Les 4 actes avec leurs timings */
  acts:            ActTiming[];
  /** Planning de chaque élément */
  schedule:        ElementSchedule[];
  /** Bloc CSS complet à injecter */
  css:             string;
  /** Résumé narratif lisible */
  narrative:       string;
  /** Méta-données */
  meta: {
    version:  string;
    sector:   SectorId;
    style:    OrchestrationStyle;
    phi:      number;
  };
}

// ─── Ajustements par secteur ──────────────────────────────────────────────────

interface SectorProfile {
  /** Acte à amplifier (durée +20%) */
  accentAct:     NarrativeAct;
  /** Durée totale préférée (ms) */
  preferredMs:   number;
  /** Style d'orchestration par défaut */
  defaultStyle:  OrchestrationStyle;
  /** Courbe d'easing dominante */
  mainEasing:    string;
}

const SECTOR_PROFILES: Record<SectorId, SectorProfile> = {
  sante:        { accentAct: 'develop', preferredMs: 3500, defaultStyle: 'wave',      mainEasing: 'ease-in-out' },
  education:    { accentAct: 'develop', preferredMs: 3800, defaultStyle: 'cascade',   mainEasing: 'ease-in-out' },
  services_pro: { accentAct: 'climax',  preferredMs: 3600, defaultStyle: 'staggered', mainEasing: 'ease-out' },
  immobilier:   { accentAct: 'climax',  preferredMs: 4000, defaultStyle: 'cinematic', mainEasing: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
  transport:    { accentAct: 'intro',   preferredMs: 3200, defaultStyle: 'burst',     mainEasing: 'cubic-bezier(0.0,0.0,0.2,1)' },
  commerce:     { accentAct: 'climax',  preferredMs: 3500, defaultStyle: 'cascade',   mainEasing: 'ease-out' },
  restauration: { accentAct: 'intro',   preferredMs: 3800, defaultStyle: 'wave',      mainEasing: 'ease-in-out' },
  artisanat:    { accentAct: 'develop', preferredMs: 4000, defaultStyle: 'staggered', mainEasing: 'cubic-bezier(0.4,0,0.6,1)' },
  loisirs:      { accentAct: 'climax',  preferredMs: 3200, defaultStyle: 'burst',     mainEasing: 'cubic-bezier(0.68,-0.55,0.27,1.55)' },
  tech:         { accentAct: 'climax',  preferredMs: 3600, defaultStyle: 'cinematic', mainEasing: 'cubic-bezier(0.77,0,0.175,1)' },
};

// ─── Affectation des éléments aux actes ──────────────────────────────────────

/** Acte préféré par rôle d'élément */
const ROLE_ACT_MAP: Record<ElementRole, NarrativeAct> = {
  avatar:    'intro',
  logo:      'intro',
  name:      'develop',
  title:     'develop',
  company:   'develop',
  email:     'climax',
  phone:     'climax',
  cta:       'climax',
  badge:     'climax',
  separator: 'rest',
};

// ─── Courbes d'easing par acte ────────────────────────────────────────────────

const ACT_EASING_IN: Record<NarrativeAct, string> = {
  intro:   'cubic-bezier(0.0, 0.0, 0.2, 1)',       // Accélère rapidement
  develop: 'cubic-bezier(0.4, 0.0, 0.2, 1)',       // Standard Material
  climax:  'cubic-bezier(0.0, 0.0, 0.2, 1)',       // Impact fort
  rest:    'cubic-bezier(0.4, 0.0, 1.0, 1)',       // Décélère doucement
};

const ACT_EASING_OUT: Record<NarrativeAct, string> = {
  intro:   'cubic-bezier(0.4, 0.0, 0.6, 1)',
  develop: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  climax:  'cubic-bezier(0.0, 0.0, 0.2, 1)',
  rest:    'cubic-bezier(0.0, 0.0, 0.2, 1)',
};

const ACT_INTENSITY: Record<NarrativeAct, number> = {
  intro:   0.6,
  develop: 0.8,
  climax:  1.0,
  rest:    0.4,
};

// ─── NarrativeArcBuilder ──────────────────────────────────────────────────────

function buildNarrativeArc(
  totalMs:    number,
  accentAct:  NarrativeAct,
): ActTiming[] {
  // Ratios ajustés : l'acte accent gagne 20%, les autres se réduisent proportionnellement
  const rawRatios = { ...ARC_RATIOS };
  const boost     = 0.20 * rawRatios[accentAct];
  const boostPerOther = boost / 3;

  const acts: NarrativeAct[] = ['intro', 'develop', 'climax', 'rest'];
  const adjustedRatios: Record<NarrativeAct, number> = { intro: 0, develop: 0, climax: 0, rest: 0 };
  for (const act of acts) {
    adjustedRatios[act] = act === accentAct
      ? rawRatios[act] + boost
      : rawRatios[act] - boostPerOther;
  }

  // Construit les timings
  let cursor = 0;
  return acts.map(act => {
    const durationMs = Math.max(ACT_MIN_MS, Math.round(totalMs * adjustedRatios[act]));
    const timing: ActTiming = {
      act,
      startMs:        cursor,
      durationMs,
      endMs:          cursor + durationMs,
      easingIn:       ACT_EASING_IN[act],
      easingOut:      ACT_EASING_OUT[act],
      intensityScale: ACT_INTENSITY[act],
      cssDelay:       `${(cursor / 1000).toFixed(3)}s`,
      cssDuration:    `${(durationMs / 1000).toFixed(3)}s`,
    };
    cursor += durationMs;
    return timing;
  });
}

// ─── ElementScheduler ─────────────────────────────────────────────────────────

function scheduleElements(
  elements: SignatureElement[],
  acts:     ActTiming[],
  style:    OrchestrationStyle,
): ElementSchedule[] {
  const actMap = new Map<NarrativeAct, ActTiming>(acts.map(a => [a.act, a]));

  // Groupe les éléments par acte préféré
  const groups = new Map<NarrativeAct, SignatureElement[]>();
  for (const el of elements) {
    const preferredAct = ROLE_ACT_MAP[el.role] ?? 'develop';
    if (!groups.has(preferredAct)) groups.set(preferredAct, []);
    groups.get(preferredAct)!.push(el);
  }

  const schedules: ElementSchedule[] = [];

  for (const [actName, actElements] of groups) {
    const act = actMap.get(actName);
    if (!act) continue;

    // Distribue les éléments dans l'acte selon le style
    actElements.forEach((el, idx) => {
      let delayMs: number;
      const elDurationMs = Math.round(act.durationMs * PHI_INV);

      switch (style) {
        case 'burst':
          // Tous en même temps dès le début de l'acte
          delayMs = act.startMs;
          break;
        case 'wave':
          // Vague sinusoïdale φ-synchronisée
          delayMs = act.startMs + Math.round(idx * (act.durationMs / actElements.length) * PHI_INV);
          break;
        case 'cascade':
          // Cascade linéaire, chaque élément après le précédent
          delayMs = act.startMs + idx * Math.round(act.durationMs / (actElements.length + 1));
          break;
        case 'cinematic':
          // Décalage φ entre chaque élément pour effet cinématographique
          delayMs = act.startMs + Math.round(idx * elDurationMs * PHI_INV2);
          break;
        case 'staggered':
        default:
          // Décalage régulier φ-pondéré
          delayMs = act.startMs + Math.round(idx * (act.durationMs * PHI_INV2));
      }

      schedules.push({
        element:     el,
        assignedAct: actName,
        delayMs,
        durationMs:  elDurationMs,
        easing:      act.easingIn,
        cssDelay:    `${(delayMs / 1000).toFixed(3)}s`,
        cssDuration: `${(elDurationMs / 1000).toFixed(3)}s`,
        cssClass:    `sig-act-${actName}`,
      });
    });
  }

  // Trie par delayMs
  return schedules.sort((a, b) => a.delayMs - b.delayMs);
}

// ─── CSSChoreographer ─────────────────────────────────────────────────────────

function generateOrchestrationCSS(
  acts:      ActTiming[],
  schedules: ElementSchedule[],
  totalMs:   number,
  style:     OrchestrationStyle,
  instanceId: string,
): string {
  const id  = instanceId.replace(/[^a-zA-Z0-9]/g, '');
  const dur = (totalMs / 1000).toFixed(3);

  const lines: string[] = [
    `/* ═══════════════════════════════════════════════════════════════ */`,
    `/* ExperienceOrchestrator v${ENGINE_VERSION} — style: ${style} — φ=${PHI.toFixed(4)} */`,
    `/* ═══════════════════════════════════════════════════════════════ */`,
    ``,
    `/* ── Variables d'actes narratifs ── */`,
    `:root {`,
    `  --sig-orch-total: ${dur}s;`,
    `  --sig-orch-phi:   ${PHI.toFixed(4)};`,
  ];

  for (const act of acts) {
    lines.push(
      `  --sig-act-${act.act}-delay:    ${act.cssDelay};`,
      `  --sig-act-${act.act}-dur:      ${act.cssDuration};`,
      `  --sig-act-${act.act}-intensity: ${act.intensityScale.toFixed(2)};`,
    );
  }
  lines.push(`}`, ``);

  // @keyframes d'orchestration par acte
  for (const act of acts) {
    const inPct   = ((act.startMs / totalMs) * 100).toFixed(1);
    const peakPct = (((act.startMs + act.durationMs * PHI_INV) / totalMs) * 100).toFixed(1);
    const outPct  = ((act.endMs / totalMs) * 100).toFixed(1);
    const opIn    = (act.intensityScale * 0.8).toFixed(2);
    const opPeak  = act.intensityScale.toFixed(2);
    const opOut   = (act.intensityScale * (act.act === 'rest' ? 0.5 : 0.7)).toFixed(2);

    lines.push(
      `/* ── Acte : ${act.act.toUpperCase()} [${inPct}%→${outPct}%] — intensité ${opPeak} ── */`,
      `@keyframes sig-enter-${act.act}-${id} {`,
      `  from   { opacity: 0; transform: translateY(${act.act === 'rest' ? '-4px' : '6px'}); }`,
      `  ${inPct}% { opacity: 0; transform: translateY(${act.act === 'rest' ? '-4px' : '6px'}); }`,
      `  ${peakPct}% { opacity: ${opPeak}; transform: translateY(0); }`,
      `  ${outPct}%  { opacity: ${opOut}; transform: translateY(0); }`,
      `  to     { opacity: ${opOut}; transform: translateY(0); }`,
      `}`,
      ``,
    );
  }

  // Règles CSS par élément planifié
  lines.push(`/* ── Planning des éléments ── */`);
  for (const s of schedules) {
    lines.push(
      `.${s.element.cssClass} {`,
      `  animation-delay:    ${s.cssDelay} !important;`,
      `  animation-duration: ${s.cssDuration} !important;`,
      `  animation-timing-function: ${s.easing} !important;`,
      `  opacity: 0;`,
      `  animation-fill-mode: forwards;`,
      `}`,
    );
  }
  lines.push(``);

  // Classes génériques par acte
  for (const act of acts) {
    lines.push(
      `.sig-act-${act.act} {`,
      `  animation-delay:    var(--sig-act-${act.act}-delay);`,
      `  animation-duration: var(--sig-act-${act.act}-dur);`,
      `  opacity: 0;`,
      `  animation-fill-mode: forwards;`,
      `}`,
    );
  }
  lines.push(``);

  // Reduced motion
  lines.push(
    `/* ── prefers-reduced-motion ── */`,
    `@media (prefers-reduced-motion: reduce) {`,
    `  [class*="sig-act-"], [class*="sig-enter"] {`,
    `    animation-duration: 0.5s !important;`,
    `    animation-delay: 0s !important;`,
    `  }`,
    `}`,
  );

  return lines.join('\n');
}

// ─── Génération du résumé narratif ───────────────────────────────────────────

function buildNarrativeSummary(acts: ActTiming[], style: OrchestrationStyle, sector: SectorId): string {
  const [intro, develop, climax, rest] = acts;
  return [
    `🎬 Arc narratif [${sector}] — style: ${style}`,
    `  INTRO    : ${intro.cssDelay} → ${intro.cssDuration} (ouverture, intensité ${(intro.intensityScale * 100).toFixed(0)}%)`,
    `  DÉVELOPPE: ${develop.cssDelay} → ${develop.cssDuration} (déploiement, intensité ${(develop.intensityScale * 100).toFixed(0)}%)`,
    `  CLIMAX   : ${climax.cssDelay} → ${climax.cssDuration} (moment fort, intensité ${(climax.intensityScale * 100).toFixed(0)}%)`,
    `  REPOS    : ${rest.cssDelay} → ${rest.cssDuration} (conclusion, intensité ${(rest.intensityScale * 100).toFixed(0)}%)`,
  ].join('\n');
}

// ─── API Publique ──────────────────────────────────────────────────────────────

/**
 * Point d'entrée principal — orchestre une signature complète selon un arc narratif φ.
 */
export function orchestrate(
  config:     OrchestratorConfig,
  instanceId?: string,
): OrchestrationResult {
  const profile   = SECTOR_PROFILES[config.sectorId];
  const totalMs   = config.totalDurationMs ?? profile.preferredMs ?? SIGNATURE_DURATION_MS;
  const style     = config.style ?? profile.defaultStyle;
  const accentAct = config.accentAct ?? profile.accentAct;
  const id        = instanceId ?? Date.now().toString(36);

  const acts     = buildNarrativeArc(totalMs, accentAct);
  const schedule = scheduleElements(config.elements, acts, style);
  const css      = generateOrchestrationCSS(acts, schedule, totalMs, style, id);
  const narrative = buildNarrativeSummary(acts, style, config.sectorId);

  return {
    totalDurationMs: totalMs,
    acts,
    schedule,
    css,
    narrative,
    meta: { version: ENGINE_VERSION, sector: config.sectorId, style, phi: PHI },
  };
}

/**
 * Injecte le CSS d'orchestration dans un HTML existant.
 */
export function injectOrchestrationIntoHTML(
  html:   string,
  result: OrchestrationResult,
): { html: string; injected: boolean } {
  const styleBlock = [
    `<style id="experience-orchestrator-v3">`,
    `/* ExperienceOrchestrator v${ENGINE_VERSION} — ${result.meta.sector} / ${result.meta.style} */`,
    result.css,
    `</style>`,
  ].join('\n');

  const hasHead = /<\/head>/i.test(html);
  return {
    html:     hasHead ? html.replace(/<\/head>/i, `${styleBlock}\n</head>`) : `${styleBlock}\n${html}`,
    injected: hasHead,
  };
}

/**
 * Retourne les profils narratifs disponibles par secteur.
 */
export function getSectorProfiles(): typeof SECTOR_PROFILES {
  return { ...SECTOR_PROFILES };
}

/**
 * Retourne les rôles d'éléments disponibles et leur acte préféré.
 */
export function getElementRoleMap(): typeof ROLE_ACT_MAP {
  return { ...ROLE_ACT_MAP };
}

/**
 * Calcule uniquement les timings de l'arc narratif pour un secteur.
 */
export function getArcTimings(
  sectorId:      SectorId,
  totalDurationMs?: number,
): ActTiming[] {
  const profile = SECTOR_PROFILES[sectorId];
  return buildNarrativeArc(
    totalDurationMs ?? profile.preferredMs,
    profile.accentAct,
  );
}

console.log(
  `🎬 ExperienceOrchestrator v${ENGINE_VERSION} chargé — ` +
  `NarrativeArcBuilder | ActDirector | ElementScheduler(10 rôles) | CSSChoreographer | φ=${PHI.toFixed(4)}`
);
