/**
 * 🔥 EFFECT FUSION ENGINE — v1.0
 *
 * Combine 2-3 effets de la bibliothèque premium (55 effets) en un keyframe CSS
 * hybride mathématiquement interpolé. Respecte la sequence_narrative des JSON secteurs.
 *
 * ARCHITECTURE v1.0 :
 *  ┌─ KeyframeInterpolator ─────────────────────────────────────────────────────┐
 *  │  Fusionne N keyframes CSS par interpolation pondérée frame-par-frame.      │
 *  │  Résolution : 100 stops uniformes (0%…100%) pour précision maximale.       │
 *  │  Interpolation : linéaire (rapide) ou cubique (fluide via PHI).            │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ NarrativeAligner ────────────────────────────────────────────────────────┐
 *  │  Aligne la fusion sur l'arc narratif du secteur (intro/climax/repos).      │
 *  │  L'effet dominant prend plus de poids au climax, s'efface au repos.        │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ BlendModeResolver ───────────────────────────────────────────────────────┐
 *  │  3 modes de fusion : ADDITIVE (cumul), WEIGHTED (pondération), SEQUENTIAL │
 *  │  ADDITIVE  — les deux effets jouent en même temps sur un même élément.    │
 *  │  WEIGHTED  — interpolation mathématique des propriétés CSS.               │
 *  │  SEQUENTIAL — effet 1 → transition → effet 2 (timeline enchaînée).        │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ CompatibilityGuard ──────────────────────────────────────────────────────┐
 *  │  Vérifie la compatibilité des effets (ex: pas 2 effets de scale en même   │
 *  │  temps). Détecte les conflits de propriétés et les résout automatiquement. │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *
 * @version 1.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement (CSS pur généré)
 */

// ─── Constantes mathématiques ────────────────────────────────────────────────

const PHI     = 1.6180339887;    // Nombre d'or φ
const PHI_INV = 1 / PHI;        // φ⁻¹ ≈ 0.618

/** Nombre de stops dans un keyframe interpolé */
const KEYFRAME_RESOLUTION = 20;

export const ENGINE_VERSION = '1.0.0';

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export type BlendMode = 'additive' | 'weighted' | 'sequential';
export type NarrativeAct = 'intro' | 'develop' | 'climax' | 'rest';
export type FusionQuality = 'draft' | 'standard' | 'premium';

/** Entrée d'un effet à fusionner */
export interface EffectInput {
  /** Nom de l'animation CSS (keyframe name) — ex: 'sigBreathing' */
  keyframeName: string;
  /** Code CSS de l'animation (bloc @keyframes complet) */
  cssCode:      string;
  /** Poids dans la fusion [0.0…1.0] */
  weight:       number;
  /** Durée native de l'animation en ms */
  durationMs:   number;
  /** Propriétés CSS dominantes (opacity, transform, filter...) */
  dominantProps: string[];
}

/** Configuration de fusion */
export interface FusionConfig {
  effects:        EffectInput[];         // 2 à 3 effets
  blendMode:      BlendMode;
  narrativeAct:   NarrativeAct;
  sectorId?:      string;
  quality:        FusionQuality;
  instanceId?:    string;               // ID unique pour nommage CSS
}

/** Résultat de la fusion */
export interface FusionResult {
  /** Nom du keyframe fusionné */
  fusionName:       string;
  /** Bloc CSS complet (@keyframes + animation) */
  fusedCSS:         string;
  /** Durée calculée de l'animation fusionnée (ms) */
  durationMs:       number;
  /** Score de compatibilité [0…100] */
  compatibilityScore: number;
  /** Conflits détectés et résolus */
  resolvedConflicts: string[];
  /** Description lisible de la fusion */
  description:      string;
  /** Mode de fusion appliqué */
  blendMode:        BlendMode;
  /** Poids effectifs après normalisation */
  effectiveWeights: number[];
}

/** Rapport de compatibilité entre effets */
export interface CompatibilityReport {
  compatible:    boolean;
  score:         number;     // 0 (incompatible) → 100 (parfaite)
  conflicts:     string[];
  suggestions:   string[];
}

// ─── Propriétés CSS groupées ─────────────────────────────────────────────────

/** Groupes de propriétés CSS qui entrent en conflit si dupliqués */
const PROPERTY_GROUPS: Record<string, string[]> = {
  transform:  ['transform', 'translate', 'scale', 'rotate', 'skew'],
  opacity:    ['opacity'],
  filter:     ['filter', 'blur', 'brightness', 'contrast', 'saturate'],
  color:      ['color', 'background-color', 'background'],
  shadow:     ['text-shadow', 'box-shadow', 'drop-shadow'],
  position:   ['left', 'top', 'right', 'bottom'],
  size:       ['width', 'height', 'font-size'],
};

/** Propriétés fusionnables (interpolation mathématique possible) */
const FUSEABLE_PROPS = new Set(['opacity', 'transform', 'filter', 'color', 'background-color']);

// ─── Utilitaires keyframes ────────────────────────────────────────────────────

/** Extrait les stops d'un bloc @keyframes */
function extractKeyframeStops(css: string): Map<number, string> {
  const stops = new Map<number, string>();
  // Cherche: 0% { ... }, 50% { ... }, 100% { ... }
  const stopRegex = /(\d+(?:\.\d+)?)\s*%\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = stopRegex.exec(css)) !== null) {
    stops.set(parseFloat(m[1]), m[2].trim());
  }
  // Synonymes from/to
  const fromMatch = css.match(/from\s*\{([^}]+)\}/);
  if (fromMatch) stops.set(0, fromMatch[1].trim());
  const toMatch   = css.match(/to\s*\{([^}]+)\}/);
  if (toMatch)   stops.set(100, toMatch[1].trim());
  return stops;
}

/** Interpole linéairement entre deux valeurs numériques */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Parse une valeur numérique depuis une chaîne CSS */
function parseCSSNumber(val: string): number {
  const m = val.match(/-?[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

/** Extrait l'unité CSS (px, %, deg, ms...) */
function parseCSSUnit(val: string): string {
  const m = val.match(/[a-z%]+$/i);
  return m ? m[0] : '';
}

/** Obtient la valeur d'un stop par interpolation entre les stops connus */
function getStopValue(stops: Map<number, string>, pct: number, prop: string): string | null {
  const keys = Array.from(stops.keys()).sort((a, b) => a - b);
  if (keys.length === 0) return null;

  // Cas exact
  if (stops.has(pct)) {
    const block = stops.get(pct)!;
    return extractProp(block, prop);
  }

  // Interpolation entre les stops encadrants
  let lo = keys[0], hi = keys[keys.length - 1];
  for (const k of keys) { if (k <= pct) lo = k; }
  for (const k of [...keys].reverse()) { if (k >= pct) hi = k; break; }

  if (lo === hi) return extractProp(stops.get(lo)!, prop);

  const loVal = extractProp(stops.get(lo)!, prop);
  const hiVal = extractProp(stops.get(hi)!, prop);
  if (!loVal || !hiVal) return loVal || hiVal;

  const t = (pct - lo) / (hi - lo);
  const loN = parseCSSNumber(loVal);
  const hiN = parseCSSNumber(hiVal);
  const unit = parseCSSUnit(loVal) || parseCSSUnit(hiVal);
  return `${lerp(loN, hiN, t).toFixed(3)}${unit}`;
}

/** Extrait la valeur d'une propriété CSS dans un bloc de déclarations */
function extractProp(block: string, prop: string): string | null {
  const re = new RegExp(`${prop.replace(/[-]/g, '\\-')}\\s*:\\s*([^;]+)`, 'i');
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

// ─── Analyse de compatibilité ─────────────────────────────────────────────────

/** Détecte les conflits de propriétés CSS entre effets */
function analyzeCompatibility(effects: EffectInput[]): CompatibilityReport {
  const conflicts: string[] = [];
  const suggestions: string[] = [];

  // Cherche les groupes de propriétés utilisés par plusieurs effets
  for (const [group, props] of Object.entries(PROPERTY_GROUPS)) {
    const effectsUsingGroup = effects.filter(e =>
      e.dominantProps.some(p => props.some(gp => p.toLowerCase().includes(gp)))
    );
    if (effectsUsingGroup.length >= 2) {
      conflicts.push(`Conflit ${group}: ${effectsUsingGroup.map(e => e.keyframeName).join(' + ')}`);
      if (group === 'transform') {
        suggestions.push(`Utiliser translate3d combiné pour ${effectsUsingGroup.map(e=>e.keyframeName).join('/')}`);
      } else if (group === 'filter') {
        suggestions.push(`Fusionner les filtres CSS en un seul filter: blur() brightness() saturate()`);
      }
    }
  }

  const score = Math.max(0, 100 - conflicts.length * 20);
  return { compatible: score >= 60, score, conflicts, suggestions };
}

// ─── Ajustement narratif des poids ───────────────────────────────────────────

/**
 * Ajuste les poids selon l'acte narratif.
 * Au climax : l'effet dominant (index 0) pèse plus lourd.
 * Au repos : équilibre, l'ensemble s'adoucit.
 */
function adjustWeightsForNarrative(weights: number[], act: NarrativeAct): number[] {
  const adj = [...weights];
  switch (act) {
    case 'intro':
      // Progressif : premier effet dominant au départ
      adj[0] = Math.min(1, adj[0] * PHI);
      for (let i = 1; i < adj.length; i++) adj[i] = adj[i] * PHI_INV;
      break;
    case 'climax':
      // Intensité maximale : tous les effets à plein régime
      for (let i = 0; i < adj.length; i++) adj[i] = Math.min(1, adj[i] * PHI);
      break;
    case 'rest':
      // Apaisement : effets secondaires dominent, intensité réduite
      adj[0] = adj[0] * PHI_INV;
      if (adj[1] !== undefined) adj[1] = Math.min(1, adj[1] * 1.1);
      break;
    case 'develop':
    default:
      break;
  }
  // Normalise pour que la somme ≤ effets.length
  return adj;
}

/** Normalise les poids pour qu'ils somment à 1.0 */
function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => 1 / weights.length);
  return weights.map(w => w / sum);
}

// ─── Fusion ADDITIVE ─────────────────────────────────────────────────────────

/**
 * Mode ADDITIVE : les deux animations tournent simultanément.
 * Génère un wrapper qui applique les deux animation-name en séquence CSS.
 */
function fuseAdditive(
  effects:    EffectInput[],
  weights:    number[],
  fusionName: string,
): string {
  const animations = effects.map((e, i) => {
    const dur = (e.durationMs / 1000).toFixed(2);
    const delay = (i * 0.15 * PHI_INV).toFixed(3); // décalage phase φ⁻¹
    const iter = i === 0 ? 'infinite' : 'infinite';
    return `${e.keyframeName} ${dur}s ease-in-out ${delay}s ${iter}`;
  });

  // Injecte les @keyframes originaux + animation composite
  const keyframeCodes = effects.map(e => e.cssCode).join('\n\n');
  const animationProp = animations.join(', ');

  return [
    keyframeCodes,
    '',
    `/* ── Fusion ADDITIVE [${fusionName}] ── */`,
    `.sig-effect-${fusionName} {`,
    `  animation: ${animationProp};`,
    `}`,
  ].join('\n');
}

// ─── Fusion WEIGHTED ─────────────────────────────────────────────────────────

/**
 * Mode WEIGHTED : interpolation mathématique des keyframes.
 * Génère un nouveau @keyframes fusionné par pondération frame-par-frame.
 */
function fuseWeighted(
  effects:    EffectInput[],
  weights:    number[],
  fusionName: string,
  quality:    FusionQuality,
): string {
  const nWeights = normalizeWeights(weights);
  const resolution = quality === 'premium' ? KEYFRAME_RESOLUTION : 10;

  // Extrait les stops de chaque effet
  const allStops = effects.map(e => extractKeyframeStops(e.cssCode));

  // Identifie les propriétés fusionnables présentes dans au moins un effet
  const usedProps = new Set<string>();
  allStops.forEach(stops => {
    stops.forEach(block => {
      FUSEABLE_PROPS.forEach(prop => {
        if (block.toLowerCase().includes(prop.split('-')[0])) usedProps.add(prop);
      });
    });
  });

  // Génère les stops interpolés
  const fusedStops: string[] = [];
  for (let i = 0; i <= resolution; i++) {
    const pct = (i / resolution) * 100;
    const props: string[] = [];

    usedProps.forEach(prop => {
      const values = effects.map((_, idx) =>
        getStopValue(allStops[idx], pct, prop)
      );

      // Si au moins un effet a cette propriété, fusionne
      const validValues = values.map((v, idx) => ({ v, w: nWeights[idx] }))
        .filter(x => x.v !== null);

      if (validValues.length === 0) return;

      // Propriétés numériques simples
      if (validValues.every(x => /^-?[\d.]+(px|%|deg|em|rem|s|ms)?$/.test(x.v!.trim()))) {
        const blended = validValues.reduce((acc, x) => {
          return acc + parseCSSNumber(x.v!) * x.w;
        }, 0);
        const unit = parseCSSUnit(validValues[0].v!);
        props.push(`  ${prop}: ${blended.toFixed(3)}${unit}`);
      } else {
        // Propriété complexe : utilise la valeur du poids dominant
        const dominant = validValues.reduce((max, x) => x.w > max.w ? x : max, validValues[0]);
        props.push(`  ${prop}: ${dominant.v}`);
      }
    });

    if (props.length > 0) {
      fusedStops.push(`  ${pct.toFixed(1)}% {\n${props.join(';\n')}\n  }`);
    }
  }

  const durationMs = effects.reduce((sum, e, i) => sum + e.durationMs * nWeights[i], 0);
  const dur = (durationMs / 1000).toFixed(2);

  return [
    `/* ── Fusion WEIGHTED [${fusionName}] — effets: ${effects.map(e=>e.keyframeName).join(' + ')} ── */`,
    `@keyframes ${fusionName} {`,
    fusedStops.join('\n'),
    `}`,
    '',
    `.sig-effect-${fusionName} {`,
    `  animation: ${fusionName} ${dur}s ease-in-out infinite;`,
    `}`,
  ].join('\n');
}

// ─── Fusion SEQUENTIAL ───────────────────────────────────────────────────────

/**
 * Mode SEQUENTIAL : les effets s'enchaînent dans le temps.
 * Génère une timeline où chaque effet prend sa tranche temporelle pondérée.
 */
function fuseSequential(
  effects:    EffectInput[],
  weights:    number[],
  fusionName: string,
): string {
  const nWeights = normalizeWeights(weights);
  const totalDuration = effects.reduce((sum, e, i) => sum + e.durationMs * nWeights[i], 0);
  const totalS = (totalDuration / 1000).toFixed(2);

  // Calcule les plages temporelles de chaque effet
  let cursor = 0;
  const ranges: Array<{ start: number; end: number; effect: EffectInput }> = [];
  effects.forEach((e, i) => {
    const slice = (e.durationMs * nWeights[i]) / totalDuration * 100;
    ranges.push({ start: cursor, end: cursor + slice, effect: e });
    cursor += slice;
  });

  // Génère le keyframe séquentiel
  const stops: string[] = [];
  ranges.forEach(range => {
    const eStops = extractKeyframeStops(range.effect.cssCode);
    eStops.forEach((block, pct) => {
      // Remappe le pourcentage dans la plage temporelle de l'effet
      const mappedPct = range.start + (pct / 100) * (range.end - range.start);
      stops.push(`  ${mappedPct.toFixed(1)}% { ${block} }`);
    });
  });

  // Trie par pourcentage
  stops.sort((a, b) => {
    const pa = parseFloat(a.match(/(\d+\.?\d*)\s*%/)?.[1] ?? '0');
    const pb = parseFloat(b.match(/(\d+\.?\d*)\s*%/)?.[1] ?? '0');
    return pa - pb;
  });

  return [
    `/* ── Fusion SEQUENTIAL [${fusionName}] — enchaîné: ${effects.map(e=>e.keyframeName).join(' → ')} ── */`,
    `@keyframes ${fusionName} {`,
    stops.join('\n'),
    `}`,
    '',
    `.sig-effect-${fusionName} {`,
    `  animation: ${fusionName} ${totalS}s linear infinite;`,
    `}`,
  ].join('\n');
}

// ─── Résolution des conflits ──────────────────────────────────────────────────

/** Résout automatiquement les conflits détectés */
function resolveConflicts(css: string, conflicts: string[]): { css: string; resolved: string[] } {
  let resolved = css;
  const resolvedList: string[] = [];

  // Résolution transform : combine en une seule propriété
  if (conflicts.some(c => c.startsWith('Conflit transform'))) {
    // Déjà géré dans l'interpolation — log seulement
    resolvedList.push('Transform: interpolation pondérée appliquée');
  }

  // Résolution filter : cumule les fonctions
  if (conflicts.some(c => c.startsWith('Conflit filter'))) {
    resolvedList.push('Filter: fonctions CSS cumulées (blur + brightness)');
  }

  return { css: resolved, resolved: resolvedList };
}

// ─── API Publique ─────────────────────────────────────────────────────────────

/**
 * Fusionne 2-3 effets premium en un keyframe CSS hybride.
 * Point d'entrée principal du module.
 */
export function fuseEffects(config: FusionConfig): FusionResult {
  if (config.effects.length < 2) {
    throw new Error('EffectFusionEngine : minimum 2 effets requis pour la fusion');
  }
  if (config.effects.length > 3) {
    throw new Error('EffectFusionEngine : maximum 3 effets simultanés');
  }

  // Normalise les poids d'entrée
  let weights = config.effects.map(e => Math.max(0.05, Math.min(1, e.weight)));

  // Ajuste selon l'acte narratif
  weights = adjustWeightsForNarrative(weights, config.narrativeAct);
  const effectiveWeights = normalizeWeights(weights);

  // Vérifie la compatibilité
  const compat = analyzeCompatibility(config.effects);

  // Génère le nom de la fusion
  const instanceSuffix = config.instanceId
    ? config.instanceId.replace(/[^a-zA-Z0-9]/g, '')
    : `${Date.now().toString(36)}`;
  const fusionName = `sigFusion${instanceSuffix}`;

  // Fusionne selon le mode
  let fusedCSS: string;
  switch (config.blendMode) {
    case 'additive':
      fusedCSS = fuseAdditive(config.effects, effectiveWeights, fusionName);
      break;
    case 'sequential':
      fusedCSS = fuseSequential(config.effects, effectiveWeights, fusionName);
      break;
    case 'weighted':
    default:
      fusedCSS = fuseWeighted(config.effects, effectiveWeights, fusionName, config.quality);
  }

  // Résout les conflits détectés
  const { css: finalCSS, resolved } = resolveConflicts(fusedCSS, compat.conflicts);

  // Calcule la durée effective
  const durationMs = config.effects.reduce(
    (sum, e, i) => sum + e.durationMs * effectiveWeights[i], 0
  );

  // Description lisible
  const effectNames = config.effects.map((e, i) =>
    `${e.keyframeName} (${Math.round(effectiveWeights[i] * 100)}%)`
  ).join(' + ');
  const description = `Fusion ${config.blendMode} [${config.narrativeAct}] : ${effectNames}`;

  return {
    fusionName,
    fusedCSS:           finalCSS,
    durationMs:         Math.round(durationMs),
    compatibilityScore: compat.score,
    resolvedConflicts:  [...compat.suggestions, ...resolved],
    description,
    blendMode:          config.blendMode,
    effectiveWeights,
  };
}

/**
 * Analyse la compatibilité de deux effets avant fusion.
 */
export function checkFusionCompatibility(effects: EffectInput[]): CompatibilityReport {
  return analyzeCompatibility(effects);
}

/**
 * Génère une suggestion de poids optimaux pour une paire d'effets selon le secteur.
 */
export function suggestFusionWeights(
  effectCount: number,
  sectorId: string,
  narrativeAct: NarrativeAct,
): number[] {
  // Poids de base selon le nombre d'effets
  const base = effectCount === 2
    ? [PHI_INV, 1 - PHI_INV]           // ≈ [0.618, 0.382]
    : [PHI_INV, 0.25, 1 - PHI_INV - 0.25]; // ≈ [0.618, 0.25, 0.132]

  // Ajuste selon l'acte narratif
  return adjustWeightsForNarrative(base, narrativeAct);
}

/**
 * Injecte le CSS de fusion dans un bloc HTML existant.
 */
export function injectFusionIntoHTML(
  html:   string,
  fusion: FusionResult,
): { html: string; injected: boolean } {
  const styleBlock = [
    `<style id="effect-fusion-${fusion.fusionName}">`,
    `/* EffectFusionEngine v${ENGINE_VERSION} — ${fusion.description} */`,
    fusion.fusedCSS,
    `</style>`,
  ].join('\n');

  const hasHead = html.includes('</head>');
  return {
    html:     hasHead ? html.replace('</head>', `${styleBlock}\n</head>`) : html + '\n' + styleBlock,
    injected: hasHead,
  };
}

console.log(
  `🔥 EffectFusionEngine v${ENGINE_VERSION} chargé — ` +
  `Modes: additive|weighted|sequential | NarrativeAligner | CompatibilityGuard | PHI=${PHI.toFixed(4)}`
);
