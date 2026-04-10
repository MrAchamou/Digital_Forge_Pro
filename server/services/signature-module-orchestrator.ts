/**
 * 🚀 SIGNATURE MODULE ORCHESTRATOR — v2.0
 *
 * Injecte les 5 engines de modules dans chaque signature générée :
 *   1. LightingEngine  — halos, glows pulsants, neon, electric, aura (secteur-aware)
 *   2. MorphingEngine  — avatar liquid/geometric/elastic, text-reveal, card-entry
 *   3. PhysicsEngine   — spring/bounce/pendulum entrée, float résiduel, cubic-bezier Hooke
 *   4. ParticlesEngine — particules ambiantes CSS (sparkle/float/drift/orbit/pulse/smoke)
 *   5. TimingMaster    — BPM-sync sur métronome, narrativeArc, Fibonacci stagger
 *
 * v2.0 — AnimationMerger intégré : fusionne les déclarations animation: conflictuelles
 *         (LightingEngine, MorphingEngine et PhysicsEngine ciblaient les mêmes sélecteurs
 *          et s'écrasaient mutuellement via la cascade CSS)
 *
 * Stratégie d'injection :
 *   • CSS → injecté dans un <style id="sig-modules"> avant </head>
 *   • Particules HTML → div .sig-particle-field injecté dans .sig-card (ou body)
 *
 * @version 2.0.0
 * @server-side true
 */

import { renderSignature, getSectorConfig, SignatureData } from './signature-renderer.js';
import { buildLightingCSS }  from '../modules/lighting.module.js';
import { buildMorphingCSS }  from '../modules/morphing.module.js';
import { buildPhysicsCSS }   from '../modules/physics.module.js';
import { buildParticlesCSS } from '../modules/particles.module.js';
import {
  getTimingProfile,
  generateFullTimingBlock,
  type ZoneTimingProfile,
  type AnimationSpeed,
} from '../modules/timing-master.module.js';

// ─── Options ──────────────────────────────────────────────────────────────────

export interface ModuleOrchestrationOptions {
  tier?: 'ultra' | 'standard' | 'lite';
  colorScheme?: 'light' | 'dark' | 'auto';
  speed?: AnimationSpeed;
  particles?: boolean;
  morphing?: boolean;
  physics?: boolean;
  lighting?: boolean;
  timing?: boolean;
}

// ─── Résultat ────────────────────────────────────────────────────────────────

export interface OrchestratedSignature {
  html:           string;
  injectedModules: string[];
  sectorId:       string;
  accentColor:    string;
  tier:           string;
  cssBytes:       number;
}

// ─── AnimationMerger ─────────────────────────────────────────────────────────

type AnimEntry = {
  name: string;
  raw: string;
};

/**
 * Fusionne les déclarations `animation:` CSS conflictuelles pour le même sélecteur.
 *
 * Problème : LightingEngine, MorphingEngine et PhysicsEngine ciblent tous
 * `.sig-avatar`, `.sig-name`, etc. Chaque module écrase l'`animation:` du précédent
 * via la cascade CSS — seul le dernier moteur survit.
 *
 * Solution : après assemblage de tout le CSS, on parse tous les blocs de règles,
 * on regroupe les animations par sélecteur, puis on émet un bloc final
 * "AnimationMerger" qui déclare TOUTES les animations combinées.
 */
/** Découpe une liste de valeurs séparées par des virgules en respectant les parenthèses */
function splitRespectingParens(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Tokenise une valeur animation individuelle (ex: "sig-entry 0.76s cubic-bezier(0.2,0.4,0.3,0.6) 0.08s both")
 * en respectant les parenthèses dans les fonctions timing (cubic-bezier, steps).
 */
function tokenizeAnimValue(part: string): string[] {
  const tokens: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < part.length; i++) {
    const ch = part[i];
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (/\s/.test(ch) && depth === 0) {
      if (current.trim()) tokens.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function mergeModuleAnimations(css: string): string {
  const bySelector = new Map<string, AnimEntry[]>();

  // Supprimer les blocs @media pour ne parser que les règles globales
  const mainCss = css.replace(/@media[^{]*\{[\s\S]*?\}\s*\}/g, '');

  // Capturer les blocs CSS simples (pas de nesting)
  const blockRe = /([.#_-][\w.#:\s,>+~[\]()_-]*?)\s*\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;

  while ((m = blockRe.exec(mainCss)) !== null) {
    const rawSel = m[1].trim();
    const body   = m[2];

    if (rawSel.includes('::') || rawSel.startsWith('@')) continue;

    const selectors = rawSel.split(',').map(s => s.trim()).filter(Boolean);
    const entries: AnimEntry[] = [];

    // ① Shorthand: animation: val1, val2, ...
    //    Stocker chaque valeur brute telle quelle (ne pas décomposer positionellement)
    const shortRe = /(?:^|;)\s*animation:\s*([^;]+)/g;
    let sm: RegExpExecArray | null;
    while ((sm = shortRe.exec(body)) !== null) {
      const rawVal = sm[1].replace(/!important/gi, '').trim();
      if (!rawVal || rawVal === 'none') continue;
      for (const part of splitRespectingParens(rawVal)) {
        const tokens = tokenizeAnimValue(part);
        const name = tokens[0];
        if (!name || name === 'none') continue;
        entries.push({ name, raw: part.trim() });
      }
    }

    // ② Long-form: animation-name + animation-duration + animation-timing-function etc.
    //    Reconstruire chaque animation shorthand depuis les propriétés individuelles
    const nameM = body.match(/animation-name:\s*([^;]+)/);
    if (nameM) {
      const names = nameM[1].split(',').map(s => s.trim()).filter(s => s && s !== 'none');
      if (names.length) {
        const durM   = body.match(/animation-duration:\s*([^;]+)/);
        const timM   = body.match(/animation-timing-function:\s*([^;]+)/);
        const delM   = body.match(/animation-delay:\s*([^;]+)/);
        const iterM  = body.match(/animation-iteration-count:\s*([^;]+)/);
        const fillM  = body.match(/animation-fill-mode:\s*([^;]+)/);

        const durs  = durM  ? durM[1].split(',').map(s => s.trim())  : ['1s'];
        const tims  = timM  ? splitRespectingParens(timM[1]).map(s => s.trim()) : ['ease'];
        const dels  = delM  ? delM[1].split(',').map(s => s.trim())  : ['0s'];
        const iters = iterM ? iterM[1].split(',').map(s => s.trim()) : ['1'];
        const fills = fillM ? fillM[1].split(',').map(s => s.trim()) : ['none'];

        names.forEach((name, i) => {
          const dur   = durs[i]  ?? durs[0]  ?? '1s';
          const tim   = tims[i]  ?? tims[0]  ?? 'ease';
          const del   = dels[i]  ?? dels[0]  ?? '0s';
          const iter  = iters[i] ?? iters[0] ?? '1';
          const fill  = fills[i] ?? fills[0] ?? 'none';
          const parts = [name, dur, tim, del, iter];
          if (fill && fill !== 'none') parts.push(fill);
          entries.push({ name, raw: parts.join(' ') });
        });
      }
    }

    if (entries.length === 0) continue;
    for (const sel of selectors) {
      const existing = bySelector.get(sel) ?? [];
      existing.push(...entries);
      bySelector.set(sel, existing);
    }
  }

  // Construire le bloc de fusion
  const lines: string[] = ['', '/* == AnimationMerger v2 — combinaison multi-moteurs == */'];
  const mergedSels: string[] = [];

  for (const [sel, entries] of bySelector.entries()) {
    if (entries.length < 2) continue;

    // Dédupliquer par nom (priorité à la DERNIÈRE occurrence — la plus récente du pipeline)
    const seen = new Set<string>();
    const unique = [...entries].reverse().filter(e => {
      if (seen.has(e.name)) return false;
      seen.add(e.name);
      return true;
    }).reverse();

    if (unique.length < 2) continue;

    const animStr = unique.map(e => e.raw).join(',\n    ');
    lines.push(`${sel} {\n  animation:\n    ${animStr};\n}`);
    mergedSels.push(sel);
  }

  if (mergedSels.length === 0) return css;

  lines.push(`@media (prefers-reduced-motion: reduce) {`);
  lines.push(`  ${mergedSels.join(', ')} { animation: none !important; }`);
  lines.push(`}`);

  return css + lines.join('\n') + '\n';
}

// ─── Utilitaires d'injection ─────────────────────────────────────────────────

/** Injecte un bloc CSS dans le HTML avant </head> (ou en tête si pas de </head>) */
function injectCSS(html: string, cssBlock: string, id: string): string {
  if (!cssBlock.trim()) return html;
  const tag = `<style id="${id}" data-engine="ModuleOrchestrator-v2">\n${cssBlock}\n</style>`;
  const headClose = html.lastIndexOf('</head>');
  if (headClose !== -1) return html.slice(0, headClose) + tag + '\n' + html.slice(headClose);
  return tag + '\n' + html;
}

/** Injecte le champ de particules HTML dans .sig-card ou en premier enfant de body */
function injectParticleField(html: string, count: number, accentHex: string): string {
  const pts = Array.from({ length: count }, (_, i) => `<div class="sig-pt-${i}"></div>`).join('');
  const field = `<div class="sig-particle-field" aria-hidden="true">${pts}</div>`;

  const cardOpen = html.search(/<div[^>]*class="[^"]*sig-card[^"]*"[^>]*>/);
  if (cardOpen !== -1) {
    const tagEnd = html.indexOf('>', cardOpen) + 1;
    return html.slice(0, tagEnd) + field + html.slice(tagEnd);
  }

  const bodyOpen = html.search(/<body[^>]*>/i);
  if (bodyOpen !== -1) {
    const tagEnd = html.indexOf('>', bodyOpen) + 1;
    return html.slice(0, tagEnd) + field + html.slice(tagEnd);
  }

  return html;
}

// ─── Résolution de la couleur d'accent ───────────────────────────────────────

function resolveAccentColor(sectorId: string, data: SignatureData): string {
  try {
    const config = getSectorConfig(sectorId);
    return config.palette.accent ?? '#6366f1';
  } catch {
    return '#6366f1';
  }
}

// ─── Orchestrateur principal ─────────────────────────────────────────────────

/**
 * Génère une signature avec tous les modules injectés.
 *
 * @param sectorId  Identifiant du secteur
 * @param data      Données utilisateur
 * @param options   Configuration des modules
 */
export function renderSignatureWithModules(
  sectorId: string,
  data: SignatureData,
  options: ModuleOrchestrationOptions = {}
): OrchestratedSignature {
  const tier        = options.tier        ?? 'standard';
  const colorScheme = options.colorScheme ?? 'light';
  const speed       = options.speed       ?? 'medium';
  const doParticles = options.particles   ?? (tier !== 'lite');
  const doMorphing  = options.morphing    ?? true;
  const doPhysics   = options.physics     ?? true;
  const doLighting  = options.lighting    ?? true;
  const doTiming    = options.timing      ?? true;

  // 1. Rendu de base via Handlebars
  let html = renderSignature(sectorId, data);

  const accent = resolveAccentColor(sectorId, data);
  const injectedModules: string[] = [];
  let allCSS = '';

  // 2. LightingEngine — glows, halos pulsants, neon/electric/aura
  if (doLighting) {
    try {
      const lightingCSS = buildLightingCSS(sectorId, accent, colorScheme);
      allCSS += `\n/* == LightingEngine == */\n` + lightingCSS;
      injectedModules.push('LightingEngine');
    } catch (e: any) {
      console.warn('[ModuleOrchestrator] LightingEngine erreur:', e.message);
    }
  }

  // 3. MorphingEngine — avatar morphing, text-reveal, card entry
  if (doMorphing) {
    try {
      const morphingCSS = buildMorphingCSS(sectorId, accent);
      allCSS += `\n/* == MorphingEngine == */\n` + morphingCSS;
      injectedModules.push('MorphingEngine');
    } catch (e: any) {
      console.warn('[ModuleOrchestrator] MorphingEngine erreur:', e.message);
    }
  }

  // 4. PhysicsEngine — spring/bounce/pendulum entry, float résiduel
  if (doPhysics) {
    try {
      const physicsCSS = buildPhysicsCSS(sectorId, tier);
      allCSS += `\n/* == PhysicsEngine == */\n` + physicsCSS;
      injectedModules.push('PhysicsEngine');
    } catch (e: any) {
      console.warn('[ModuleOrchestrator] PhysicsEngine erreur:', e.message);
    }
  }

  // 5. ParticlesEngine — particules CSS ambiantes (secteur-specific)
  if (doParticles) {
    try {
      const particlesCSS = buildParticlesCSS(sectorId, accent, tier);
      allCSS += `\n/* == ParticlesEngine == */\n` + particlesCSS;

      const countMap: Record<string, number> = { lite: 4, standard: 8, ultra: 12 };
      const ptCount = countMap[tier] ?? 8;

      html = injectParticleField(html, ptCount, accent);
      injectedModules.push('ParticlesEngine');
    } catch (e: any) {
      console.warn('[ModuleOrchestrator] ParticlesEngine erreur:', e.message);
    }
  }

  // 6. TimingMaster — BPM synchronisé, NarrativeArc, Fibonacci stagger
  if (doTiming) {
    try {
      const profile: ZoneTimingProfile = getTimingProfile('A', {
        sectorId,
        textDensity: { charCount: 80, zoneCount: 6, hasCTA: !!(data.site || data.linkedin) },
      });
      const timingBlock = generateFullTimingBlock(profile, { instanceId: `sig-${sectorId}`, withOutlook: false });
      allCSS += `\n/* == TimingMaster == */\n` + timingBlock.styleTag
                  .replace(/<style[^>]*>/i, '').replace(/<\/style>/i, '');
      injectedModules.push('TimingMaster');
    } catch (e: any) {
      console.warn('[ModuleOrchestrator] TimingMaster erreur:', e.message);
    }
  }

  // 7. AnimationMerger — fusionner toutes les animations par sélecteur
  //    OBLIGATOIRE : les modules ciblent les mêmes sélecteurs (.sig-avatar, .sig-name...)
  //    et s'écrasent via la cascade CSS. Le merger les réunit dans une seule règle finale.
  if (allCSS) {
    allCSS = mergeModuleAnimations(allCSS);
    injectedModules.push('AnimationMerger');
  }

  // 8. Injection du bloc CSS global
  if (allCSS) {
    html = injectCSS(html, allCSS, 'sig-modules-v2');
  }

  return {
    html,
    injectedModules,
    sectorId,
    accentColor: accent,
    tier,
    cssBytes: allCSS.length,
  };
}

/**
 * Variante légère — inject uniquement le lighting + morphing (pour prévisualisations rapides)
 */
export function renderSignatureLite(sectorId: string, data: SignatureData): OrchestratedSignature {
  return renderSignatureWithModules(sectorId, data, {
    tier:      'lite',
    particles: false,
    physics:   true,
    morphing:  true,
    lighting:  true,
    timing:    false,
  });
}

export const ORCHESTRATOR_VERSION = '2.0.0';
console.log(`🚀 SignatureModuleOrchestrator v${ORCHESTRATOR_VERSION} — Lighting+Morphing+Physics+Particles+Timing+AnimationMerger`);
