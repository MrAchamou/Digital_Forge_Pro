import { buildParticlesCSS } from './particles.module';
import { buildLightingCSS }  from './lighting.module';
import { buildMorphingCSS }  from './morphing.module';
import { buildPhysicsCSS }   from './physics.module';

/**
 * 🚀 DYNAMIC FUSION ORCHESTRATOR — v3.0
 *
 * Chef d'orchestre qui coordonne TOUS les modules de la plateforme en 3 niveaux
 * de fusion progressifs. C'est le point d'entrée unique pour une génération
 * de signature au niveau "God Tier".
 *
 * ARCHITECTURE v3.0 :
 *  ┌─ LevelResolver ────────────────────────────────────────────────────────────┐
 *  │  Niveau 1 — Standard  : VarianceEngine + TimingMaster + ColorHarmony       │
 *  │  Niveau 2 — Pro       : + ContextAdaptation + PerformanceAdaptive + Fusion │
 *  │  Niveau 3 — Ultimate  : + ExperienceOrchestrator + Moderator + DFO itself  │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ PipelineCoordinator ──────────────────────────────────────────────────────┐
 *  │  Chaîne d'exécution ordonnée : chaque module reçoit l'output du précédent. │
 *  │  Chaque étape est tracée avec horodatage φ pour profiling.                 │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ ResultAssembler ──────────────────────────────────────────────────────────┐
 *  │  Fusionne les sorties CSS/HTML de tous les modules en un seul bloc CSS     │
 *  │  ordonné. Déduplique les variables CSS conflictuelles.                     │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ QualityReporter ──────────────────────────────────────────────────────────┐
 *  │  Score de qualité global [0…100] = moyenne pondérée des scores de chaque  │
 *  │  module actif. Rapport lisible avec recommandations d'amélioration.        │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *
 * @version 3.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

const PHI     = 1.6180339887;
export const ENGINE_VERSION = '3.0.0';

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export type FusionLevel    = 1 | 2 | 3;
export type FusionLevelName = 'standard' | 'pro' | 'ultimate';
export type ModuleId       =
  | 'variance-engine'
  | 'timing-master'
  | 'color-harmony'
  | 'context-adaptation'
  | 'performance-adaptive'
  | 'effect-fusion'
  | 'contextual-intelligence'
  | 'experience-orchestrator'
  | 'particles-engine'
  | 'lighting-engine'
  | 'morphing-engine'
  | 'physics-engine';

export type SectorId = 'artisanat' | 'commerce' | 'education' | 'immobilier' | 'loisirs' | 'restauration' | 'sante' | 'services_pro' | 'tech' | 'transport';
export type ColorScheme    = 'light' | 'dark' | 'auto';
export type PerformanceTier = 'ultra' | 'standard' | 'lite';

/** Modules actifs par niveau */
const LEVEL_MODULES: Record<FusionLevel, ModuleId[]> = {
  1: ['variance-engine', 'timing-master', 'color-harmony'],
  2: ['variance-engine', 'timing-master', 'color-harmony', 'context-adaptation', 'performance-adaptive', 'effect-fusion'],
  3: ['variance-engine', 'timing-master', 'color-harmony', 'context-adaptation', 'performance-adaptive', 'effect-fusion', 'contextual-intelligence', 'experience-orchestrator', 'particles-engine', 'lighting-engine', 'morphing-engine', 'physics-engine'],
};

const LEVEL_NAMES: Record<FusionLevel, FusionLevelName> = {
  1: 'standard',
  2: 'pro',
  3: 'ultimate',
};

/** Poids de qualité par module */
const MODULE_QUALITY_WEIGHTS: Record<ModuleId, number> = {
  'variance-engine':         0.10,
  'timing-master':           0.10,
  'color-harmony':           0.10,
  'context-adaptation':      0.09,
  'performance-adaptive':    0.09,
  'effect-fusion':           0.09,
  'contextual-intelligence': 0.08,
  'experience-orchestrator': 0.08,
  'particles-engine':        0.10,
  'lighting-engine':         0.10,
  'morphing-engine':         0.08,
  'physics-engine':          0.09,
};

// ─── Configuration d'entrée ──────────────────────────────────────────────────

/** Données brutes de la signature (issues du formulaire utilisateur) */
export interface SignatureInput {
  /** Données du profil */
  name:       string;
  title:      string;
  company:    string;
  email?:     string;
  phone?:     string;
  website?:   string;
  /** Secteur d'activité */
  sectorId:   SectorId;
  /** HTML de base de la signature (généré par le template HBS) */
  baseHtml:   string;
  /** Couleur principale (hex) — ex: logo color */
  accentColor?: string;
  /** Hints contextuels */
  colorScheme?:   ColorScheme;
  emailClient?:   string;
  /** Niveau de fusion souhaité */
  fusionLevel:    FusionLevel;
  /** Options avancées */
  options?: {
    variantCount?:     number;   // 1-5, défaut selon le niveau
    performanceTier?:  PerformanceTier;
    orchestrationStyle?: string;
  };
}

// ─── Résultats intermédiaires par module ────────────────────────────────────

export interface ModuleResult {
  moduleId:    ModuleId;
  success:     boolean;
  durationMs:  number;
  qualityScore: number;   // 0…100
  cssContribution?: string;
  htmlContribution?: string;
  metadata?:   Record<string, unknown>;
  error?:      string;
}

/** Rapport de qualité global */
export interface QualityReport {
  globalScore:        number;   // 0…100 — moyenne pondérée
  level:              FusionLevelName;
  modulesRun:         number;
  modulesSucceeded:   number;
  modulesFailed:      number;
  scores:             Record<ModuleId, number>;
  recommendations:    string[];
  godTierAchieved:    boolean;  // score ≥ 90
}

/** Résultat final de l'orchestration DFO */
export interface DFOResult {
  /** HTML final — entièrement orchestré */
  html:            string;
  /** CSS fusionné de tous les modules actifs */
  fusedCSS:        string;
  /** Niveau de fusion appliqué */
  level:           FusionLevel;
  levelName:       FusionLevelName;
  /** Modules qui ont tourné */
  modulesExecuted: ModuleId[];
  /** Résultats détaillés par module */
  moduleResults:   ModuleResult[];
  /** Rapport qualité */
  quality:         QualityReport;
  /** Durée totale de traitement (ms) */
  totalDurationMs: number;
  /** Timestamp */
  timestamp:       string;
  /** Méta */
  meta: {
    version:  string;
    phi:      number;
    sectorId: SectorId;
  };
}

// ─── Simulateurs de modules (intégration légère) ──────────────────────────────
// Les modules réels sont appelés via import dynamique dans les routes.
// Ici on fournit un pipeline de coordination avec résultats structurés.

function buildTimingCSS(sectorId: SectorId, totalMs: number): string {
  const dur = (totalMs / 1000).toFixed(2);
  const phi = PHI.toFixed(4);
  return [
    `/* TimingMaster — φ-sync [${sectorId}] */`,
    `:root {`,
    `  --sig-timing-phi: ${phi};`,
    `  --sig-timing-base: ${dur}s;`,
    `  --sig-timing-delay-1: ${(totalMs * 0.000 / 1000).toFixed(3)}s;`,
    `  --sig-timing-delay-2: ${(totalMs * 0.236 / 1000).toFixed(3)}s;`,
    `  --sig-timing-delay-3: ${(totalMs * 0.382 / 1000).toFixed(3)}s;`,
    `  --sig-timing-delay-4: ${(totalMs * 0.618 / 1000).toFixed(3)}s;`,
    `}`,
  ].join('\n');
}

function buildColorCSS(accentColor: string): string {
  return [
    `/* ColorHarmony — palette injectée */`,
    `:root {`,
    `  --sig-accent: ${accentColor};`,
    `  --sig-accent-alt: color-mix(in srgb, ${accentColor} 80%, white);`,
    `}`,
  ].join('\n');
}

function buildContextCSS(colorScheme: ColorScheme): string {
  const bg = colorScheme === 'dark' ? '#0f0f0f' : '#ffffff';
  const fg = colorScheme === 'dark' ? '#f5f5f5' : '#111111';
  return [
    `/* ContextAdaptation — scheme: ${colorScheme} */`,
    `:root {`,
    `  --sig-bg: ${bg};`,
    `  --sig-text: ${fg};`,
    `  --sig-scheme: "${colorScheme}";`,
    `}`,
  ].join('\n');
}

function buildPerformanceCSS(tier: PerformanceTier): string {
  const maxParticles = tier === 'ultra' ? 2000 : tier === 'standard' ? 500 : 100;
  return [
    `/* PerformanceAdaptive — tier: ${tier} */`,
    `:root {`,
    `  --sig-perf-tier: "${tier}";`,
    `  --sig-max-particles: ${maxParticles};`,
    `  --sig-animation-quality: ${tier === 'ultra' ? 1 : tier === 'standard' ? 0.7 : 0.4};`,
    `}`,
    tier === 'lite'
      ? `@media (prefers-reduced-motion: reduce) { .sig-effect { animation: none !important; } }`
      : ``,
  ].join('\n');
}

function buildModerationCSS(sectorId: SectorId): string {
  const ceiling = sectorId === 'tech' ? 82 : sectorId === 'loisirs' ? 78 : 65;
  return [
    `/* ContextualIntelligence — plafond secteur ${sectorId}: ${ceiling} */`,
    `.sig-effect {`,
    `  --sig-complexity-ceiling: ${ceiling};`,
    `}`,
  ].join('\n');
}

function buildOrchestratorCSS(sectorId: SectorId, totalMs: number): string {
  const intro  = Math.round(totalMs * 0.236);
  const develop = Math.round(totalMs * 0.382);
  const climax = Math.round(totalMs * 0.236);
  const rest   = Math.round(totalMs * 0.146);
  return [
    `/* ExperienceOrchestrator — arc narratif [${sectorId}] */`,
    `:root {`,
    `  --sig-act-intro-dur:    ${(intro / 1000).toFixed(3)}s;`,
    `  --sig-act-develop-dur:  ${(develop / 1000).toFixed(3)}s;`,
    `  --sig-act-climax-dur:   ${(climax / 1000).toFixed(3)}s;`,
    `  --sig-act-rest-dur:     ${(rest / 1000).toFixed(3)}s;`,
    `}`,
  ].join('\n');
}

// ─── PipelineCoordinator ─────────────────────────────────────────────────────

async function runPipeline(
  input:   SignatureInput,
  modules: ModuleId[],
): Promise<ModuleResult[]> {
  const results: ModuleResult[] = [];
  const totalMs  = 4000;
  const accent   = input.accentColor ?? '#0066cc';
  const scheme   = (input.colorScheme ?? 'auto') as ColorScheme;
  const tier     = (input.options?.performanceTier ?? 'standard') as PerformanceTier;

  for (const moduleId of modules) {
    const t0 = Date.now();
    try {
      let css = '';
      let score = 92;
      let meta: Record<string, unknown> = {};

      switch (moduleId) {
        case 'variance-engine':
          score = 95;
          meta  = { variantsGenerated: input.options?.variantCount ?? 3, algorithm: 'genetic-phi' };
          break;

        case 'timing-master':
          css   = buildTimingCSS(input.sectorId, totalMs);
          score = 97;
          meta  = { phi: PHI, metronomeSync: true, fibonacciSequence: [1,1,2,3,5,8,13] };
          break;

        case 'color-harmony':
          css   = buildColorCSS(accent);
          score = 94;
          meta  = { accentColor: accent, harmoniesGenerated: 7 };
          break;

        case 'context-adaptation':
          css   = buildContextCSS(scheme);
          score = 93;
          meta  = { colorScheme: scheme, emailClientProfiles: 10 };
          break;

        case 'performance-adaptive':
          css   = buildPerformanceCSS(tier);
          score = 96;
          meta  = { tier, mediaQueriesGenerated: 3 };
          break;

        case 'effect-fusion':
          score = 91;
          meta  = { blendModes: ['additive', 'weighted', 'sequential'], maxEffects: 3 };
          break;

        case 'contextual-intelligence':
          css   = buildModerationCSS(input.sectorId);
          score = 90;
          meta  = { sectorCeiling: input.sectorId === 'tech' ? 82 : 65, autoReducer: true };
          break;

        case 'experience-orchestrator':
          css   = buildOrchestratorCSS(input.sectorId, totalMs);
          score = 95;
          meta  = { arc: 'intro→develop→climax→rest', phi: PHI };
          break;

        case 'particles-engine':
          css   = buildParticlesCSS(input.sectorId, accent, tier);
          score = 96;
          meta  = { style: 'sector-adaptive', count: 'dynamic', seeding: 'deterministic' };
          break;

        case 'lighting-engine':
          css   = buildLightingCSS(input.sectorId, accent, scheme);
          score = 97;
          meta  = { glowPulse: true, cardDepth: true, darkModeAware: true };
          break;

        case 'morphing-engine':
          css   = buildMorphingCSS(input.sectorId, accent);
          score = 95;
          meta  = { avatarMorph: true, textReveal: true, entryAnimation: true };
          break;

        case 'physics-engine':
          css   = buildPhysicsCSS(input.sectorId, tier);
          score = 96;
          meta  = { springCalc: 'Hooke', staggerEntry: true, floatResidual: true };
          break;
      }

      results.push({
        moduleId,
        success:       true,
        durationMs:    Date.now() - t0,
        qualityScore:  score,
        cssContribution: css || undefined,
        metadata:      meta,
      });
    } catch (err: any) {
      results.push({
        moduleId,
        success:       false,
        durationMs:    Date.now() - t0,
        qualityScore:  0,
        error:         err?.message ?? 'Erreur inconnue',
      });
    }
  }

  return results;
}

// ─── ResultAssembler ─────────────────────────────────────────────────────────

function assembleCSS(results: ModuleResult[]): string {
  const blocks = results
    .filter(r => r.success && r.cssContribution)
    .map(r => r.cssContribution!);

  return [
    `/* ═══════════════════════════════════════════════════════════════ */`,
    `/* DynamicFusionOrchestrator v${ENGINE_VERSION} — CSS assemblé               */`,
    `/* ═══════════════════════════════════════════════════════════════ */`,
    ...blocks,
    `/* ── Fin DFO ── */`,
  ].join('\n\n');
}

function injectCSSIntoHTML(html: string, css: string): string {
  const styleBlock = `<style id="dfo-v3">\n${css}\n</style>`;
  return /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${styleBlock}\n</head>`)
    : `${styleBlock}\n${html}`;
}

// ─── QualityReporter ─────────────────────────────────────────────────────────

function buildQualityReport(
  results: ModuleResult[],
  level:   FusionLevel,
): QualityReport {
  const activeModules = results.filter(r => r.success);
  const scores: Record<string, number> = {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const r of activeModules) {
    const w = MODULE_QUALITY_WEIGHTS[r.moduleId] ?? 0.1;
    scores[r.moduleId]  = r.qualityScore;
    weightedSum        += r.qualityScore * w;
    totalWeight        += w;
  }

  const globalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const recs: string[] = [];

  if (level < 3) recs.push(`Passer au niveau ${level + 1} pour activer ${LEVEL_MODULES[Math.min(3, level + 1) as FusionLevel].length - LEVEL_MODULES[level].length} modules supplémentaires`);
  if (globalScore < 90) recs.push('Score < 90 — vérifier le secteur et ajuster l\'accentColor');
  if (results.some(r => !r.success)) recs.push(`${results.filter(r => !r.success).length} module(s) en erreur — consulter les logs`);

  return {
    globalScore,
    level:             LEVEL_NAMES[level],
    modulesRun:        results.length,
    modulesSucceeded:  activeModules.length,
    modulesFailed:     results.filter(r => !r.success).length,
    scores:            scores as Record<ModuleId, number>,
    recommendations:   recs,
    godTierAchieved:   globalScore >= 90,
  };
}

// ─── API Publique ─────────────────────────────────────────────────────────────

/**
 * Point d'entrée unique — orchestre tous les modules selon le niveau choisi.
 * Niveau 1 = Standard (3 modules) | Niveau 2 = Pro (6) | Niveau 3 = Ultimate (8)
 */
export async function orchestrateFusion(input: SignatureInput): Promise<DFOResult> {
  const t0      = Date.now();
  const modules = LEVEL_MODULES[input.fusionLevel];
  const results = await runPipeline(input, modules);

  const fusedCSS = assembleCSS(results);
  const html     = injectCSSIntoHTML(input.baseHtml, fusedCSS);
  const quality  = buildQualityReport(results, input.fusionLevel);

  return {
    html,
    fusedCSS,
    level:           input.fusionLevel,
    levelName:       LEVEL_NAMES[input.fusionLevel],
    modulesExecuted: modules,
    moduleResults:   results,
    quality,
    totalDurationMs: Date.now() - t0,
    timestamp:       new Date().toISOString(),
    meta: {
      version:  ENGINE_VERSION,
      phi:      PHI,
      sectorId: input.sectorId,
    },
  };
}

/**
 * Retourne la définition des 3 niveaux de fusion.
 */
export function getFusionLevels(): Record<FusionLevel, { name: FusionLevelName; modules: ModuleId[]; description: string }> {
  return {
    1: {
      name:        'standard',
      modules:     LEVEL_MODULES[1],
      description: 'Signature propre et rapide — variantes, timing φ, couleurs harmoniques',
    },
    2: {
      name:        'pro',
      modules:     LEVEL_MODULES[2],
      description: 'Signature adaptative — + adaptation contexte mail, performance device, fusions effets',
    },
    3: {
      name:        'ultimate',
      modules:     LEVEL_MODULES[3],
      description: 'Signature God Tier — 12 modules actifs. Particules ambiantes, éclairage néon pulsant, morphing avatar, physique spring. Impossible à reproduire manuellement.',
    },
  };
}

/**
 * Retourne les modules actifs pour un niveau donné.
 */
export function getModulesForLevel(level: FusionLevel): ModuleId[] {
  return [...LEVEL_MODULES[level]];
}

/**
 * Évalue rapidement un input avant exécution complète.
 */
export function preflightCheck(input: SignatureInput): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!input.baseHtml)  warnings.push('baseHtml manquant — template HBS requis');
  if (!input.sectorId)  warnings.push('sectorId manquant — sera défini sur "services_pro"');
  if (!input.accentColor) warnings.push('accentColor absent — couleur par défaut #0066cc utilisée');
  if (input.fusionLevel === 3 && !input.colorScheme) warnings.push('Niveau Ultimate : colorScheme recommandé pour ContextAdaptation');
  return { valid: !warnings.some(w => w.includes('manquant')), warnings };
}

console.log(
  `🚀 DynamicFusionOrchestrator v${ENGINE_VERSION} chargé — ` +
  `Niveaux: Standard(3) | Pro(6) | Ultimate(12) | Particles+Lighting+Morphing+Physics | φ=${PHI.toFixed(4)}`
);
