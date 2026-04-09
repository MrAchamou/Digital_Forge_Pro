/**
 * 🚀 SIGNATURE MODULE ORCHESTRATOR — v1.0
 *
 * Injecte les 5 engines de modules dans chaque signature générée :
 *   1. LightingEngine  — halos, glows pulsants, neon, electric, aura (secteur-aware)
 *   2. MorphingEngine  — avatar liquid/geometric/elastic, text-reveal, card-entry
 *   3. PhysicsEngine   — spring/bounce/pendulum entrée, float résiduel, cubic-bezier Hooke
 *   4. ParticlesEngine — particules ambiantes CSS (sparkle/float/drift/orbit/pulse/smoke)
 *   5. TimingMaster    — BPM-sync sur métronome, narrativeArc, Fibonacci stagger
 *
 * Stratégie d'injection :
 *   • CSS → injecté dans un <style id="sig-modules"> avant </head>
 *   • Particules HTML → div .sig-particle-field injecté dans .sig-card (ou body)
 *
 * @version 1.0.0
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
  /** Tier de performance : ultra | standard | lite (défaut: standard) */
  tier?: 'ultra' | 'standard' | 'lite';
  /** Schéma couleur : light | dark | auto (défaut: light) */
  colorScheme?: 'light' | 'dark' | 'auto';
  /** Vitesse d'animation : slow | medium | fast (défaut: medium) */
  speed?: AnimationSpeed;
  /** Activer les particules CSS ambiantes (défaut: true pour ultra/standard) */
  particles?: boolean;
  /** Activer le morphing avatar/text (défaut: true) */
  morphing?: boolean;
  /** Activer la physique d'entrée (défaut: true) */
  physics?: boolean;
  /** Activer le lighting/glow (défaut: true) */
  lighting?: boolean;
  /** Activer le timing BPM-synchronized (défaut: true) */
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

// ─── Utilitaires d'injection ─────────────────────────────────────────────────

/** Injecte un bloc CSS dans le HTML avant </head> (ou en tête si pas de </head>) */
function injectCSS(html: string, cssBlock: string, id: string): string {
  if (!cssBlock.trim()) return html;
  const tag = `<style id="${id}" data-engine="ModuleOrchestrator-v1">\n${cssBlock}\n</style>`;
  const headClose = html.lastIndexOf('</head>');
  if (headClose !== -1) return html.slice(0, headClose) + tag + '\n' + html.slice(headClose);
  return tag + '\n' + html;
}

/** Injecte le champ de particules HTML dans .sig-card ou en premier enfant de body */
function injectParticleField(html: string, count: number, accentHex: string): string {
  const pts = Array.from({ length: count }, (_, i) => `<div class="sig-pt-${i}"></div>`).join('');
  const field = `<div class="sig-particle-field" aria-hidden="true">${pts}</div>`;

  // Tente d'injecter juste après l'ouverture de .sig-card
  const cardOpen = html.search(/<div[^>]*class="[^"]*sig-card[^"]*"[^>]*>/);
  if (cardOpen !== -1) {
    const tagEnd = html.indexOf('>', cardOpen) + 1;
    return html.slice(0, tagEnd) + field + html.slice(tagEnd);
  }

  // Fallback : après <body>
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

      // Compte de particules selon le tier
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

  // 7. Injection du bloc CSS global
  if (allCSS) {
    html = injectCSS(html, allCSS, 'sig-modules-v1');
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

export const ORCHESTRATOR_VERSION = '1.0.0';
console.log(`🚀 SignatureModuleOrchestrator v${ORCHESTRATOR_VERSION} — Lighting+Morphing+Physics+Particles+Timing`);
