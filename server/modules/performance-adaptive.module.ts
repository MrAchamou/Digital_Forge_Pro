/**
 * ⚡ PERFORMANCE ADAPTIVE ENGINE — v3.0
 *
 * Génère 3 niveaux de CSS d'animation (Ultra / Standard / Lite) calibrés
 * selon les capacités déclarées de l'appareil et intègre des stratégies
 * de dégradation automatique pour assurer la fluidité sur tous les devices.
 *
 * ARCHITECTURE v3.0 :
 *  ┌─ TierResolver ─────────────────────────────────────────────────────────┐
 *  │  Sélectionne le tier (Ultra / Standard / Lite) depuis :                │
 *  │  • Hint explicite (deviceTier, gpuTier, connectionType)                │
 *  │  • User-Agent (détection mobile / bas de gamme)                        │
 *  │  • prefers-reduced-motion + prefers-data-saver                         │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ CSSLayerGenerator ────────────────────────────────────────────────────┐
 *  │  Ultra    — Toutes les animations actives, particles max, keyframes HD  │
 *  │  Standard — Animations réduites (durée ×1.5), particules ×0.5          │
 *  │  Lite     — Transitions douces uniquement, zéro keyframe complexe       │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ MediaQueryStack ───────────────────────────────────────────────────────┐
 *  │  @media prefers-reduced-motion — tier Lite forcé                        │
 *  │  @media prefers-data-saver — tier Standard ou Lite                      │
 *  │  @media (max-width: 480px) — mobile : tier réduit d'un cran            │
 *  │  @media (update: slow) — écran lent (e-ink) : tier Lite                │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ RuntimeDetectionSnippet ───────────────────────────────────────────────┐
 *  │  Génère un snippet JS inline à inclure dans la signature pour           │
 *  │  mesurer le FPS réel et upgrader/downgrader dynamiquement le tier.      │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ HTML Injector ─────────────────────────────────────────────────────────┐
 *  │  Injecte le CSS tier + media queries avant </head>.                     │
 *  │  Compatible VarianceEngine + TimingMaster + ColorHarmony + ContextAdapt.│
 *  └────────────────────────────────────────────────────────────────────────┘
 *
 * @version 3.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement
 */

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export type PerformanceTier = 'ultra' | 'standard' | 'lite';
export type DeviceTier      = 'high' | 'medium' | 'low';
export type GPUTier         = 'discrete' | 'integrated' | 'software';
export type ConnectionType  = '4g' | '3g' | '2g' | 'slow-2g' | 'wifi' | 'unknown';

/** Hints de performance fournis par le consommateur de l'API */
export interface PerformanceHints {
  deviceTier?:       DeviceTier;    // 'high' | 'medium' | 'low'
  gpuTier?:          GPUTier;       // 'discrete' | 'integrated' | 'software'
  connectionType?:   ConnectionType;
  isMobile?:         boolean;
  reducedMotion?:    boolean;       // prefers-reduced-motion
  dataSaver?:        boolean;       // prefers-data-saver
  maxFPS?:           number;        // FPS estimé (0…60)
  userAgent?:        string;        // Pour détection automatique
}

/** Paramètres CSS d'un tier */
export interface TierConfig {
  tier:              PerformanceTier;
  label:             string;
  animationEnabled:  boolean;
  particleDensity:   number;        // 0.0 … 1.0
  transitionDuration: number;       // en secondes
  keyframeComplexity: 'full' | 'reduced' | 'none';
  blurEnabled:       boolean;
  shadowEnabled:     boolean;
  gradientEnabled:   boolean;
  frameTarget:       number;        // FPS cible (60 / 30 / 15)
  cssCustomProps:    Record<string, string>;
}

/** Résultat complet du moteur */
export interface PerformanceAdaptResult {
  tier:             PerformanceTier;
  tierConfig:       TierConfig;
  cssBlock:         string;         // Bloc <style> complet
  mediaQueryBlock:  string;         // @media queries empilés
  runtimeSnippet:   string;         // Snippet JS de détection FPS
  inlineVars:       string;         // Style inline compact pour email
  reasoning:        string[];       // Trace de la décision tier
}

/** Résultat d'injection HTML */
export interface PerformanceInjectionResult {
  html:         string;
  injected:     boolean;
  tier:         PerformanceTier;
  blockSize:    number;
  reasoning:    string[];
}

export const ENGINE_VERSION = '3.0.0';

// ─── Configuration des tiers ──────────────────────────────────────────────────

const TIER_CONFIGS: Record<PerformanceTier, TierConfig> = {
  ultra: {
    tier:               'ultra',
    label:              'Ultra — Toutes animations actives',
    animationEnabled:   true,
    particleDensity:    1.0,
    transitionDuration: 0.3,
    keyframeComplexity: 'full',
    blurEnabled:        true,
    shadowEnabled:      true,
    gradientEnabled:    true,
    frameTarget:        60,
    cssCustomProps: {
      '--perf-anim-enabled':      '1',
      '--perf-particle-density':  '1',
      '--perf-transition':        '0.3s',
      '--perf-blur':              'blur(8px)',
      '--perf-shadow':            '0 4px 24px rgba(0,0,0,0.25)',
      '--perf-gradient-opacity':  '1',
      '--perf-iteration':         'infinite',
      '--perf-frame-target':      '60',
    },
  },
  standard: {
    tier:               'standard',
    label:              'Standard — Animations réduites',
    animationEnabled:   true,
    particleDensity:    0.5,
    transitionDuration: 0.45,
    keyframeComplexity: 'reduced',
    blurEnabled:        false,
    shadowEnabled:      true,
    gradientEnabled:    true,
    frameTarget:        30,
    cssCustomProps: {
      '--perf-anim-enabled':      '1',
      '--perf-particle-density':  '0.5',
      '--perf-transition':        '0.45s',
      '--perf-blur':              'none',
      '--perf-shadow':            '0 2px 8px rgba(0,0,0,0.15)',
      '--perf-gradient-opacity':  '0.7',
      '--perf-iteration':         'infinite',
      '--perf-frame-target':      '30',
    },
  },
  lite: {
    tier:               'lite',
    label:              'Lite — Transitions douces uniquement',
    animationEnabled:   false,
    particleDensity:    0.0,
    transitionDuration: 0.6,
    keyframeComplexity: 'none',
    blurEnabled:        false,
    shadowEnabled:      false,
    gradientEnabled:    false,
    frameTarget:        15,
    cssCustomProps: {
      '--perf-anim-enabled':      '0',
      '--perf-particle-density':  '0',
      '--perf-transition':        '0.6s',
      '--perf-blur':              'none',
      '--perf-shadow':            'none',
      '--perf-gradient-opacity':  '0',
      '--perf-iteration':         '1',
      '--perf-frame-target':      '15',
    },
  },
};

// ─── TierResolver ────────────────────────────────────────────────────────────

/**
 * Résout le tier optimal depuis les hints fournis.
 * Retourne le tier et les raisons de la décision.
 */
export function resolveTier(hints: PerformanceHints): { tier: PerformanceTier; reasoning: string[] } {
  const reasoning: string[] = [];
  let score = 100; // 100 = Ultra, 50-99 = Standard, <50 = Lite

  // prefers-reduced-motion → force Lite
  if (hints.reducedMotion) {
    reasoning.push('prefers-reduced-motion détecté → tier Lite forcé');
    return { tier: 'lite', reasoning };
  }

  // Data saver → force Standard minimum
  if (hints.dataSaver) {
    score = Math.min(score, 65);
    reasoning.push('prefers-data-saver → pénalité -35');
  }

  // FPS réel
  if (hints.maxFPS !== undefined) {
    if (hints.maxFPS < 20) {
      score -= 60;
      reasoning.push(`FPS estimé ${hints.maxFPS} < 20 → pénalité -60`);
    } else if (hints.maxFPS < 40) {
      score -= 30;
      reasoning.push(`FPS estimé ${hints.maxFPS} < 40 → pénalité -30`);
    } else {
      reasoning.push(`FPS estimé ${hints.maxFPS} ≥ 40 → pas de pénalité`);
    }
  }

  // Device tier
  if (hints.deviceTier === 'low') {
    score -= 50;
    reasoning.push('deviceTier=low → pénalité -50');
  } else if (hints.deviceTier === 'medium') {
    score -= 20;
    reasoning.push('deviceTier=medium → pénalité -20');
  } else if (hints.deviceTier === 'high') {
    reasoning.push('deviceTier=high → aucune pénalité');
  }

  // GPU tier
  if (hints.gpuTier === 'software') {
    score -= 40;
    reasoning.push('gpuTier=software → pénalité -40');
  } else if (hints.gpuTier === 'integrated') {
    score -= 15;
    reasoning.push('gpuTier=integrated → pénalité -15');
  } else if (hints.gpuTier === 'discrete') {
    reasoning.push('gpuTier=discrete → aucune pénalité');
  }

  // Connexion
  if (hints.connectionType === '2g' || hints.connectionType === 'slow-2g') {
    score -= 25;
    reasoning.push(`connexion ${hints.connectionType} → pénalité -25`);
  } else if (hints.connectionType === '3g') {
    score -= 10;
    reasoning.push('connexion 3g → pénalité -10');
  }

  // Mobile
  if (hints.isMobile) {
    score -= 20;
    reasoning.push('isMobile=true → pénalité -20');
  }

  // User-Agent auto-detection
  if (hints.userAgent) {
    const ua = hints.userAgent.toLowerCase();
    if (ua.includes('android') && !ua.includes('chrome/')) {
      score -= 20;
      reasoning.push('Android non-Chrome détecté → pénalité -20');
    }
    if (ua.includes('msie') || ua.includes('trident')) {
      score -= 50;
      reasoning.push('Internet Explorer détecté → pénalité -50');
    }
  }

  // Score → tier
  const tier: PerformanceTier = score >= 80 ? 'ultra' : score >= 45 ? 'standard' : 'lite';
  reasoning.push(`Score final : ${score} → tier ${tier.toUpperCase()}`);

  return { tier, reasoning };
}

// ─── Génération CSS ───────────────────────────────────────────────────────────

/**
 * Génère le bloc CSS pour un tier donné.
 */
function buildTierCSS(config: TierConfig, instanceId: string): string {
  const vars = Object.entries(config.cssCustomProps)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  const animBlock = !config.animationEnabled ? `
  /* Tier LITE — animations désactivées */
  .animated-zone, [data-zone], .sig-* {
    animation:   none !important;
    transition:  opacity ${config.transitionDuration}s ease, transform ${config.transitionDuration}s ease;
  }` : config.keyframeComplexity === 'reduced' ? `
  /* Tier STANDARD — animations simplifiées */
  .animated-zone, [data-zone] {
    animation-duration:         calc(var(--tm-cycle, 3s) * 1.5) !important;
    animation-iteration-count:  3 !important;
    filter:                     none !important;
  }` : `
  /* Tier ULTRA — animations complètes */
  .animated-zone, [data-zone] {
    animation-play-state: running;
  }`;

  const blurBlock = !config.blurEnabled
    ? '  * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }'
    : '';

  const shadowBlock = !config.shadowEnabled
    ? '  * { box-shadow: none !important; text-shadow: none !important; }'
    : '';

  return `<style id="perf-adapt-v3-${instanceId}" data-engine="PerformanceAdaptiveEngine-${ENGINE_VERSION}" data-tier="${config.tier}">
  /* ═══════════════════════════════════════════════════════════════════
     ⚡ PERFORMANCE ADAPTIVE ENGINE v${ENGINE_VERSION}
     Tier: ${config.label}
     Particules: ${config.particleDensity * 100}% | FPS cible: ${config.frameTarget}
     ═══════════════════════════════════════════════════════════════════ */
  :root {
${vars}
  }
${animBlock}
${blurBlock ? blurBlock + '\n' : ''}${shadowBlock ? shadowBlock + '\n' : ''}
</style>`;
}

/**
 * Génère le bloc de media queries empilées.
 */
function buildMediaQueries(tier: PerformanceTier): string {
  const liteCfg     = TIER_CONFIGS.lite;
  const standardCfg = TIER_CONFIGS.standard;

  const liteVars     = Object.entries(liteCfg.cssCustomProps).map(([k, v]) => `    ${k}: ${v};`).join('\n');
  const standardVars = Object.entries(standardCfg.cssCustomProps).map(([k, v]) => `    ${k}: ${v};`).join('\n');

  return `<style id="perf-media-queries" data-engine="PerformanceAdaptiveEngine-${ENGINE_VERSION}">
  /* @media prefers-reduced-motion → Lite forcé */
  @media (prefers-reduced-motion: reduce) {
    :root {
${liteVars}
    }
    .animated-zone, [data-zone], .sig-* {
      animation:  none !important;
      transition: opacity 0.6s ease !important;
    }
  }

  /* @media prefers-data-saver → Standard */
  @media (prefers-data-saver: on) {
    :root {
${standardVars}
    }
    .animated-zone, [data-zone] {
      animation-iteration-count: 2 !important;
    }
  }

  /* @media (update: slow) → e-ink / écrans lents → Lite */
  @media (update: slow) {
    :root {
${liteVars}
    }
    .animated-zone, [data-zone], .sig-* {
      animation:  none !important;
      transition: none !important;
    }
  }

  /* @media mobile bas de gamme → tier réduit */
  @media (max-width: 480px) and (max-resolution: 1.5dppx) {
    :root {
      --perf-particle-density: ${tier === 'ultra' ? '0.5' : '0'};
      --perf-iteration:        ${tier === 'ultra' ? '3' : '1'};
    }
    .animated-zone {
      animation-iteration-count: ${tier === 'ultra' ? '3' : '1'} !important;
    }
  }
</style>`;
}

/**
 * Génère le snippet JS de détection FPS pour inclusion dans la signature.
 * Mesure le FPS réel sur 30 frames et ajuste le tier dynamiquement.
 */
function buildRuntimeSnippet(instanceId: string): string {
  return `<script id="perf-runtime-${instanceId}">
(function(){
  var t=0,frames=0,fps=60;
  function tick(ts){
    if(t===0){t=ts;}
    frames++;
    var elapsed=ts-t;
    if(elapsed>500){
      fps=Math.round(frames*1000/elapsed);
      var root=document.documentElement;
      if(fps<20){
        root.style.setProperty('--perf-anim-enabled','0');
        root.style.setProperty('--perf-particle-density','0');
        root.style.setProperty('--perf-iteration','1');
        root.setAttribute('data-perf-tier','lite');
      } else if(fps<40){
        root.style.setProperty('--perf-particle-density','0.5');
        root.style.setProperty('--perf-iteration','3');
        root.setAttribute('data-perf-tier','standard');
      } else {
        root.setAttribute('data-perf-tier','ultra');
      }
      return;
    }
    requestAnimationFrame(tick);
  }
  if(typeof requestAnimationFrame!=='undefined'){
    requestAnimationFrame(tick);
  }
})();
</script>`;
}

/**
 * Génère les variables CSS inline compactes pour email.
 */
function buildInlineVars(config: TierConfig): string {
  return Object.entries(config.cssCustomProps)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

// ─── API publique ────────────────────────────────────────────────────────────

/**
 * Retourne les configurations des 3 tiers.
 */
export function getTierConfigs(): TierConfig[] {
  return Object.values(TIER_CONFIGS);
}

/**
 * Retourne la configuration d'un tier spécifique.
 */
export function getTierConfig(tier: PerformanceTier): TierConfig {
  return TIER_CONFIGS[tier] ?? TIER_CONFIGS.standard;
}

/**
 * Génère l'adaptation de performance complète.
 */
export function adaptPerformance(
  hints:      PerformanceHints = {},
  instanceId?: string
): PerformanceAdaptResult {
  const id                   = instanceId ?? 'default';
  const { tier, reasoning }  = resolveTier(hints);
  const tierConfig           = TIER_CONFIGS[tier];

  return {
    tier,
    tierConfig,
    cssBlock:        buildTierCSS(tierConfig, id),
    mediaQueryBlock: buildMediaQueries(tier),
    runtimeSnippet:  buildRuntimeSnippet(id),
    inlineVars:      buildInlineVars(tierConfig),
    reasoning,
  };
}

/**
 * Génère l'adaptation pour les 3 tiers en une passe (utile pour comparaison).
 */
export function adaptAllTiers(instanceId = 'all'): Record<PerformanceTier, PerformanceAdaptResult> {
  return {
    ultra:    adaptPerformance({ deviceTier: 'high',   gpuTier: 'discrete', isMobile: false }, `${instanceId}-ultra`),
    standard: adaptPerformance({ deviceTier: 'medium', gpuTier: 'integrated', isMobile: true }, `${instanceId}-std`),
    lite:     adaptPerformance({ deviceTier: 'low',    gpuTier: 'software',   isMobile: true, reducedMotion: false, maxFPS: 15 }, `${instanceId}-lite`),
  };
}

/**
 * Injecte le CSS d'adaptation de performance dans un HTML complet.
 */
export function injectPerformanceIntoHTML(
  html:       string,
  hints:      PerformanceHints = {},
  instanceId?: string
): PerformanceInjectionResult {
  const result  = adaptPerformance(hints, instanceId ?? 'inject');
  const blocks  = [result.cssBlock, result.mediaQueryBlock].join('\n');

  const hasHead       = /<\/head>/i.test(html);
  const hasBody       = /<\/body>/i.test(html);
  const injectedHtml  = hasHead
    ? html
        .replace(/<\/head>/i, `${blocks}\n</head>`)
        .replace(/<\/body>/i, `${result.runtimeSnippet}\n</body>`)
    : `${blocks}\n${html}`;

  return {
    html:      injectedHtml,
    injected:  true,
    tier:      result.tier,
    blockSize: blocks.length,
    reasoning: result.reasoning,
  };
}

console.log(
  `⚡ PerformanceAdaptiveEngine v${ENGINE_VERSION} chargé — Ultra/Standard/Lite | TierResolver | MediaQueryStack | FPS RuntimeDetect | 7 hints`
);
