// ═══════════════════════════════════════════════════════════════════════════════
// CTA LIVING SYSTEM
// Orchestrateur de 9 effets SVG sur le bouton Call-To-Action de la signature.
//
// Dimensions du bouton : 148 × 32px, rx=6, centre à (74, 16)
// Position dans la signature : g transform="translate(380, 140)"
//
// Moteurs & effets intégrés :
//  QUANTUM PHASE   → entrée matérialisation (scale+translate+opacity)
//  HEARTBEAT       → 2 rings ripple synchronisés sur le BPM sectoriel
//  NEON GLOW       → aura floue permanente pulsante derrière le bouton
//  Gradient animé  → fill dégradé accent cyclique (angle tourne lentement)
//  BORDER DRAW     → contour qui se dessine à l'entrée (stroke-dashoffset)
//  ELECTRIC FORM   → scanner lumineux horizontal (clippé sur le bouton)
//  SPARKLE AURA    → 4 étoiles scintillantes aux coins (Fibonacci delays)
//  MAGNETIC PULL   → 6 particules orbitales (animateTransform rotate)
//  BREATHING text  → micro-breathing sur le label du bouton
//  VarianceEngine  → couleurs + vitesses modulées par variante A/B/C/D
//  TimingMaster    → toutes durées en beats BPM sectoriels
//  LightingEngine  → intensité glow + profondeur shadow selon secteur
// ═══════════════════════════════════════════════════════════════════════════════

import { getVarianceParams, applyVarianceToColor, type VariantId } from './logo-module-bridge';

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;
const FIB     = [0.0, 0.1, 0.2, 0.3, 0.5, 0.8, 1.3]; // delays Fibonacci (s)

// ── Bouton dimensions ─────────────────────────────────────────────────────────
const BTN_W   = 148;
const BTN_H   = 32;
const BTN_RX  = 6;
const BTN_CX  = BTN_W / 2;   // 74
const BTN_CY  = BTN_H / 2;   // 16
const PERIMETER = 350;        // périmètre approximatif du rect arrondi (px)

// ── Profils secteur ───────────────────────────────────────────────────────────

interface CTASectorProfile {
  bpm:          number;
  globalMult:   number;
  easing:       string;
  glowInt:      number;
  particles:    number;  // nombre de particules orbitales
  glitch:       boolean;
  sparkle:      boolean;
  morphStyle:   string;
  entryDelay:   number;  // délai avant l'entrée du bouton (s)
}

const SECTOR_PROFILES: Record<string, CTASectorProfile> = {
  tech:         { bpm: 72,  globalMult: 1.0,       easing: 'cubic-bezier(.25,.46,.45,.94)', glowInt: 0.85, particles: 6, glitch: true,  sparkle: true,  morphStyle: 'geometric', entryDelay: 0.9 },
  startup:      { bpm: 96,  globalMult: PHI_INV,   easing: 'cubic-bezier(.68,-.55,.265,1.55)', glowInt: 0.90, particles: 8, glitch: true,  sparkle: true,  morphStyle: 'elastic',   entryDelay: 0.7 },
  sante:        { bpm: 60,  globalMult: 1.2,       easing: 'cubic-bezier(.4,0,.6,1)',       glowInt: 0.45, particles: 3, glitch: false, sparkle: false, morphStyle: 'breathe',   entryDelay: 1.2 },
  beaute:       { bpm: 58,  globalMult: 1.0,       easing: 'cubic-bezier(.25,.1,.25,1)',    glowInt: 0.70, particles: 4, glitch: false, sparkle: true,  morphStyle: 'liquid',    entryDelay: 1.0 },
  finance:      { bpm: 44,  globalMult: PHI,       easing: 'cubic-bezier(.4,0,.2,1)',       glowInt: 0.30, particles: 2, glitch: false, sparkle: false, morphStyle: 'breathe',   entryDelay: 1.5 },
  juridique:    { bpm: 40,  globalMult: PHI * 1.1, easing: 'cubic-bezier(0,0,.2,1)',        glowInt: 0.25, particles: 0, glitch: false, sparkle: false, morphStyle: 'breathe',   entryDelay: 1.8 },
  creative:     { bpm: 80,  globalMult: 0.9,       easing: 'cubic-bezier(.34,1.56,.64,1)', glowInt: 0.95, particles: 8, glitch: true,  sparkle: true,  morphStyle: 'liquid',    entryDelay: 0.8 },
  immobilier:   { bpm: 52,  globalMult: 1.3,       easing: 'cubic-bezier(.25,.1,.25,1)',    glowInt: 0.40, particles: 3, glitch: false, sparkle: false, morphStyle: 'breathe',   entryDelay: 1.1 },
  restauration: { bpm: 68,  globalMult: 1.0,       easing: 'cubic-bezier(.4,0,.2,1)',       glowInt: 0.60, particles: 4, glitch: false, sparkle: true,  morphStyle: 'breathe',   entryDelay: 1.0 },
  sport:        { bpm: 110, globalMult: PHI_INV * 0.9, easing: 'cubic-bezier(.68,-.55,.27,1.55)', glowInt: 0.95, particles: 8, glitch: true,  sparkle: true,  morphStyle: 'elastic',   entryDelay: 0.6 },
  default:      { bpm: 60,  globalMult: 1.0,       easing: 'cubic-bezier(.4,0,.2,1)',       glowInt: 0.55, particles: 4, glitch: false, sparkle: true,  morphStyle: 'breathe',   entryDelay: 1.0 },
};

function getSector(sectorId: string): string {
  return (sectorId || '').toLowerCase().split(/[_\s-]/)[0] || 'default';
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ── Résultat ──────────────────────────────────────────────────────────────────

export interface CTAResult {
  filterDefs: string;
  stylesCSS:  string;
  groupSVG:   string;
}

// ── Fonction principale ───────────────────────────────────────────────────────

export function buildCTALivingSystem(
  ctaText:    string,
  accent:     string,
  accentLight: string,
  sectorId:   string   = 'default',
  variantId:  VariantId = 'A',
  animated:   boolean  = true,
): CTAResult {

  if (!animated || !ctaText) {
    return { filterDefs: '', stylesCSS: '', groupSVG: '' };
  }

  const sec  = getSector(sectorId);
  const prof = SECTOR_PROFILES[sec] || SECTOR_PROFILES.default;

  // ── VarianceEngine ─────────────────────────────────────────────────────────
  const variance    = getVarianceParams(variantId);
  const tMult       = variance.timingMult * prof.globalMult;
  const vAccent     = applyVarianceToColor(accent,      variance.hueShift, variance.satMult, variance.lightOffset);
  const vAccentLt   = applyVarianceToColor(accentLight, variance.hueShift, variance.satMult, variance.lightOffset);

  // Teinte complémentaire pour le gradient bouton
  const baseH = (() => {
    const r = parseInt(accent.slice(1,3),16)/255, g = parseInt(accent.slice(3,5),16)/255, b = parseInt(accent.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
    if(d===0) return 0;
    const hRaw = max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4;
    return Math.round(hRaw*60);
  })();
  const baseS = (() => {
    const r=parseInt(accent.slice(1,3),16)/255,g=parseInt(accent.slice(3,5),16)/255,b=parseInt(accent.slice(5,7),16)/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min;
    if(d===0)return 0;
    return Math.round((l>0.5?d/(2-max-min):d/(max+min))*100);
  })();
  const baseL = (() => {
    const r=parseInt(accent.slice(1,3),16)/255,g=parseInt(accent.slice(3,5),16)/255,b=parseInt(accent.slice(5,7),16)/255;
    return Math.round(((Math.max(r,g,b)+Math.min(r,g,b))/2)*100);
  })();

  const h  = (baseH + variance.hueShift + 360) % 360;
  const s  = clamp(baseS * variance.satMult, 30, 100);
  const l  = clamp(baseL + variance.lightOffset, 15, 80);

  const cDark   = `hsl(${h},${s}%,${Math.max(15, l - 18)}%)`;    // accent assombri
  const cMid    = vAccent;
  const cLight  = vAccentLt;
  const cShift1 = `hsl(${(h+40)%360},${s}%,${Math.min(85,l+20)}%)`;  // teinte +40°
  const cShift2 = `hsl(${(h+180)%360},${clamp(s*0.7,20,100)}%,${Math.min(90,l+30)}%)`; // complémentaire

  // ── Métriques temporelles ──────────────────────────────────────────────────
  const beatS       = 60 / prof.bpm;
  const heartbeatS  = clamp(beatS * 2 / tMult, 0.8, 4.0);     // 2 beats par heartbeat
  const glowPulseS  = clamp(beatS * 4 / tMult, 1.5, 6.0);     // 4 beats par glow
  const shimmerS    = clamp(beatS * 8 / tMult, 2.5, 8.0);     // 8 beats pour un scan
  const orbitS      = clamp(60 / prof.bpm * 4 / tMult, 2, 8); // 4 beats par orbite
  const gradRotS    = clamp(beatS * 16 / tMult, 4, 12);        // rotation gradient
  const sparkleS    = clamp(beatS * 6 / tMult, 2, 10);        // périodicité sparkle
  const breatheS    = clamp(beatS * 4 * tMult, 1, 6);         // BREATHING texte
  const borderDrawS = clamp(0.6 / tMult, 0.3, 1.2);           // dessin contour

  // Durée entrée QUANTUM PHASE
  const entryDur    = clamp(0.55 / tMult, 0.35, 1.0);
  const entryDelay  = prof.entryDelay;

  const gi = prof.glowInt; // glowIntensity

  // ─────────────────────────────────────────────────────────────────────────
  // DEFS
  // ─────────────────────────────────────────────────────────────────────────

  const filterDefs = `
    <!-- ═══ CTA Living System — Defs ═══════════════════════════════════════ -->

    <!-- Gradient fill bouton — accent cyclique -->
    <linearGradient id="cta-bg-grad" x1="0" y1="0" x2="${BTN_W}" y2="${BTN_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="${cLight}"/>
      <stop offset="40%"  stop-color="${cMid}"/>
      <stop offset="80%"  stop-color="${cDark}"/>
      <stop offset="100%" stop-color="${cShift1}"/>
      <animateTransform attributeName="gradientTransform" type="rotate"
        from="0 ${BTN_CX} ${BTN_CY}" to="360 ${BTN_CX} ${BTN_CY}"
        dur="${gradRotS.toFixed(2)}s" repeatCount="indefinite"/>
    </linearGradient>

    <!-- Gradient border animé -->
    <linearGradient id="cta-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${cLight}" stop-opacity="0.9"/>
      <stop offset="50%"  stop-color="${cShift2}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${cLight}" stop-opacity="0.9"/>
      <animateTransform attributeName="gradientTransform" type="rotate"
        from="0 ${BTN_CX} ${BTN_CY}" to="360 ${BTN_CX} ${BTN_CY}"
        dur="${(gradRotS * 0.7).toFixed(2)}s" repeatCount="indefinite"/>
    </linearGradient>

    <!-- Gradient shimmer ELECTRIC FORM -->
    <linearGradient id="cta-shimmer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="white" stop-opacity="0"/>
      <stop offset="35%"  stop-color="white" stop-opacity="${(gi * 0.45).toFixed(2)}"/>
      <stop offset="55%"  stop-color="${cLight}" stop-opacity="${(gi * 0.65).toFixed(2)}"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>

    <!-- Gradient SPARKLE star fill -->
    <radialGradient id="cta-sparkle-rg" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="white" stop-opacity="1"/>
      <stop offset="60%"  stop-color="${cLight}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${cMid}" stop-opacity="0"/>
    </radialGradient>

    <!-- Gradient halo radial NEON GLOW -->
    <radialGradient id="cta-halo-rg" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${cMid}"  stop-opacity="${(gi * 0.35).toFixed(2)}"/>
      <stop offset="50%"  stop-color="${cLight}" stop-opacity="${(gi * 0.15).toFixed(2)}"/>
      <stop offset="100%" stop-color="${cMid}"  stop-opacity="0"/>
    </radialGradient>

    <!-- NEON GLOW filter — blur pour halo -->
    <filter id="cta-glow-f" x="-20%" y="-60%" width="140%" height="220%">
      <feGaussianBlur stdDeviation="${(gi * 6).toFixed(1)}"/>
    </filter>

    <!-- MAGNETIC PULL — filter glow particule -->
    <filter id="cta-particle-f" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="${(gi * 1.5).toFixed(1)}"/>
    </filter>

    <!-- Clip path pour shimmer (limité au bouton) -->
    <clipPath id="cta-btn-clip">
      <rect width="${BTN_W}" height="${BTN_H}" rx="${BTN_RX}"/>
    </clipPath>`;

  // ─────────────────────────────────────────────────────────────────────────
  // CSS @keyframes
  // ─────────────────────────────────────────────────────────────────────────

  const sparkleCSS = prof.sparkle ? `
    @keyframes cta-sparkle {
      0%,60%,100% { transform: scale(0) rotate(0deg);   opacity: 0; }
      70%         { transform: scale(1.3) rotate(15deg); opacity: 1; }
      80%         { transform: scale(0.9) rotate(-5deg); opacity: 0.9; }
      90%         { transform: scale(1.1) rotate(8deg);  opacity: 0.7; }
    }` : '';

  const particleGlowCSS = prof.particles > 0 ? `
    @keyframes cta-particle-fade {
      0%,100% { opacity: ${(gi * 0.4).toFixed(2)}; }
      50%     { opacity: ${(gi * 0.85).toFixed(2)}; }
    }` : '';

  const stylesCSS = `
    /* ─── CTA Living System ─────────────────────────────────── */

    /* QUANTUM PHASE — entrée matérialisation */
    @keyframes cta-enter {
      0%   { opacity: 0; transform: translateX(18px) scale(0.86); }
      55%  { opacity: 1; transform: translateX(-3px) scale(${variantId === 'B' ? '1.04' : '1.02'}); }
      78%  { transform: translateX(1px) scale(0.99); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }

    /* HEARTBEAT — ring 1 (externe, propagation rapide) */
    @keyframes cta-ring1 {
      0%   { transform: scale(1);    opacity: ${(gi * 0.55).toFixed(2)}; }
      65%  { transform: scale(1.18); opacity: 0; }
      100% { transform: scale(1.18); opacity: 0; }
    }

    /* HEARTBEAT — ring 2 (interne, décalé d'un demi-beat) */
    @keyframes cta-ring2 {
      0%,30%  { transform: scale(1);    opacity: 0; }
      75%     { transform: scale(1.10); opacity: ${(gi * 0.40).toFixed(2)}; }
      100%    { transform: scale(1.10); opacity: 0; }
    }

    /* NEON GLOW — aura pulsante permanente */
    @keyframes cta-glow-pulse {
      0%,100% { opacity: ${(gi * 0.20).toFixed(2)}; transform: scaleX(1)   scaleY(1); }
      50%     { opacity: ${(gi * 0.45).toFixed(2)}; transform: scaleX(1.03) scaleY(1.08); }
    }

    /* ELECTRIC FORM — scanner horizontal */
    @keyframes cta-shimmer {
      0%   { transform: translateX(-${BTN_W + 30}px); opacity: 0; }
      8%   { opacity: 1; }
      92%  { opacity: 1; }
      100% { transform: translateX(${BTN_W + 60}px); opacity: 0; }
    }

    /* BREATHING — micro-respiration du texte */
    @keyframes cta-text-breathe {
      0%,100% { transform: scale(1);    opacity: 1; }
      50%     { transform: scale(${variantId === 'B' ? '1.025' : '1.012'}); opacity: 0.95; }
    }

    /* BORDER — fade-in de l'opacité du contour après le draw */
    @keyframes cta-border-pulse {
      0%,100% { stroke-opacity: ${(gi * 0.55).toFixed(2)}; }
      50%     { stroke-opacity: ${(gi * 0.95).toFixed(2)}; }
    }

    /* Fade-in global */
    @keyframes cta-fadein {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    ${sparkleCSS}
    ${particleGlowCSS}`;

  // ─────────────────────────────────────────────────────────────────────────
  // ÉLÉMENTS SVG — 9 couches empilées
  // ─────────────────────────────────────────────────────────────────────────

  // ── COUCHE 1 : NEON GLOW — halo derrière le bouton ──────────────────────
  const haloEl = `
    <!-- NEON GLOW — halo radial flou derrière le bouton -->
    <rect x="-14" y="-10" width="${BTN_W + 28}" height="${BTN_H + 20}" rx="${BTN_RX + 6}"
      fill="url(#cta-halo-rg)"
      filter="url(#cta-glow-f)"
      style="animation: cta-glow-pulse ${glowPulseS.toFixed(2)}s ease-in-out 0s infinite;
             transform-origin: ${BTN_CX}px ${BTN_CY}px;"/>`;

  // ── COUCHE 2 : HEARTBEAT — rings de propagation ──────────────────────────
  const heartbeatEl = `
    <!-- HEARTBEAT — ring externe (propagation 1) -->
    <rect x="0" y="0" width="${BTN_W}" height="${BTN_H}" rx="${BTN_RX}"
      fill="none" stroke="${cMid}" stroke-width="1.8"
      style="opacity:0; animation: cta-ring1 ${heartbeatS.toFixed(2)}s ease-out ${entryDelay + 0.3}s infinite;
             transform-origin: ${BTN_CX}px ${BTN_CY}px;"/>

    <!-- HEARTBEAT — ring interne (propagation 2, délai demi-beat) -->
    <rect x="0" y="0" width="${BTN_W}" height="${BTN_H}" rx="${BTN_RX}"
      fill="none" stroke="${cLight}" stroke-width="1.2"
      style="opacity:0; animation: cta-ring2 ${heartbeatS.toFixed(2)}s ease-out ${(entryDelay + 0.3 + heartbeatS * 0.4).toFixed(2)}s infinite;
             transform-origin: ${BTN_CX}px ${BTN_CY}px;"/>`;

  // ── COUCHE 3 : MAGNETIC PULL — particules orbitales ──────────────────────
  let particlesEl = '';
  if (prof.particles > 0) {
    const orbitR  = 32;  // rayon de l'orbite en px depuis le centre
    const count   = prof.particles;
    particlesEl = `\n    <!-- MAGNETIC PULL — ${count} particules orbitales -->`;

    for (let i = 0; i < count; i++) {
      // Placement initial sur le périmètre de l'orbite
      const angle    = (360 / count) * i;  // en degrés
      const rad      = angle * Math.PI / 180;
      const px       = BTN_CX + orbitR * Math.cos(rad);
      const py       = BTN_CY + orbitR * Math.sin(rad);
      const size     = 1.5 + (i % 3) * 0.8; // 1.5, 2.3, 3.1 alternés
      const dur      = orbitS * (1 + (i % 3) * 0.12); // légère variation
      const delay    = FIB[i % FIB.length];
      const opacity  = (gi * (0.45 + (i % 3) * 0.18)).toFixed(2);
      const blurSize = (size * gi * 1.5).toFixed(1);

      particlesEl += `
    <!-- Particule orbitale ${i + 1} -->
    <g>
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${size.toFixed(1)}"
        fill="${i % 3 === 0 ? cLight : i % 3 === 1 ? cMid : cShift1}"
        opacity="${opacity}"
        style="animation: cta-particle-fade ${(dur * 0.8).toFixed(2)}s ease-in-out ${delay}s infinite;
               filter: url(#cta-particle-f);">
        <animateTransform attributeName="transform" type="rotate"
          from="${angle} ${BTN_CX} ${BTN_CY}"
          to="${angle + 360} ${BTN_CX} ${BTN_CY}"
          dur="${dur.toFixed(2)}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>
    </g>`;
    }
  }

  // ── COUCHE 4 : Bouton principal ───────────────────────────────────────────
  const btnBodyEl = `
    <!-- Bouton principal — fill gradient animé -->
    <rect width="${BTN_W}" height="${BTN_H}" rx="${BTN_RX}"
      fill="url(#cta-bg-grad)" opacity="0.95"/>`;

  // ── COUCHE 5 : BORDER DRAW — contour qui se dessine ──────────────────────
  const borderEl = `
    <!-- BORDER DRAW — contour progressif + pulsation -->
    <rect x="0.75" y="0.75" width="${BTN_W - 1.5}" height="${BTN_H - 1.5}" rx="${BTN_RX - 0.5}"
      fill="none"
      stroke="url(#cta-border-grad)"
      stroke-width="1.5"
      stroke-dasharray="${PERIMETER}"
      stroke-dashoffset="${PERIMETER}"
      style="animation: cta-border-pulse ${glowPulseS.toFixed(2)}s ease-in-out ${entryDelay + borderDrawS + 0.1}s infinite;">
      <!-- Dessin progressif à l'entrée -->
      <animate attributeName="stroke-dashoffset"
        from="${PERIMETER}" to="0"
        dur="${borderDrawS.toFixed(2)}s" begin="${entryDelay}s" fill="freeze"/>
    </rect>`;

  // ── COUCHE 6 : SPARKLE AURA — étoiles aux coins ──────────────────────────
  let sparkleEl = '';
  if (prof.sparkle) {
    const corners = [
      { x: 4,           y: 4,           delay: FIB[0] },
      { x: BTN_W - 4,   y: 4,           delay: FIB[2] },
      { x: BTN_W - 4,   y: BTN_H - 4,   delay: FIB[1] },
      { x: 4,           y: BTN_H - 4,   delay: FIB[3] },
    ];
    sparkleEl = `\n    <!-- SPARKLE AURA — 4 étoiles scintillantes aux coins -->`;
    for (const [idx, corner] of corners.entries()) {
      const sSize  = 4 + (idx % 2) * 1.5;  // 4px ou 5.5px
      const period = sparkleS * (1 + idx * 0.25); // périodes légèrement différentes
      const dly    = entryDelay + 0.5 + corner.delay;
      // Chemin étoile à 4 branches (cross/plus lumineux)
      sparkleEl += `
    <g transform="translate(${corner.x}, ${corner.y})"
       style="opacity:0; animation: cta-sparkle ${period.toFixed(2)}s ease-in-out ${dly.toFixed(2)}s infinite;
              transform-origin: 0px 0px;">
      <!-- Sparkle corps -->
      <ellipse rx="${sSize}" ry="${(sSize * 0.3).toFixed(1)}" fill="url(#cta-sparkle-rg)" opacity="0.9"/>
      <ellipse ry="${sSize}" rx="${(sSize * 0.3).toFixed(1)}" fill="url(#cta-sparkle-rg)" opacity="0.9"/>
      <!-- Noyau central -->
      <circle r="${(sSize * 0.25).toFixed(1)}" fill="white" opacity="0.95"/>
    </g>`;
    }
  }

  // ── COUCHE 7 : ELECTRIC FORM shimmer ─────────────────────────────────────
  const shimmerEl = `
    <!-- ELECTRIC FORM — scanner lumineux horizontal (clippé) -->
    <g clip-path="url(#cta-btn-clip)"
       style="opacity:0; animation: cta-fadein 0.1s linear ${(entryDelay + borderDrawS + 0.3).toFixed(2)}s forwards;">
      <rect x="-40" y="0" width="80" height="${BTN_H}"
        fill="url(#cta-shimmer-grad)"
        style="animation: cta-shimmer ${shimmerS.toFixed(2)}s ${prof.easing} ${(entryDelay + 0.8).toFixed(2)}s infinite;
               transform-origin: 0px 0px;"/>
    </g>`;

  // ── COUCHE 8 : Texte CTA avec BREATHING ──────────────────────────────────
  const textEl = `
    <!-- CTA Text — label + BREATHING micro-animation -->
    <text x="${BTN_CX}" y="${BTN_CY + 5}"
      text-anchor="middle" dominant-baseline="middle"
      font-family="Arial,sans-serif" font-size="11" font-weight="700"
      fill="#ffffff"
      style="animation: cta-text-breathe ${breatheS.toFixed(2)}s ease-in-out ${(entryDelay + 0.2).toFixed(2)}s infinite;
             transform-origin: ${BTN_CX}px ${BTN_CY}px;">
      ${ctaText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
    </text>`;

  // ── Assemblage final ──────────────────────────────────────────────────────

  const sectorTag = `<!-- Sector: ${sec} | Variant: ${variantId} | BPM: ${prof.bpm} | Glow: ${(gi*100).toFixed(0)}% | Particles: ${prof.particles} -->`;

  const groupSVG = `
    <!-- ═══ CTA Living System ══════════════════════════════════════════════ -->
    ${sectorTag}
    <g style="opacity:0; animation: cta-enter ${entryDur.toFixed(2)}s ${prof.easing} ${entryDelay.toFixed(2)}s forwards;
              transform-origin: ${BTN_CX}px ${BTN_CY}px;">

      ${haloEl}
      ${heartbeatEl}
      ${particlesEl}
      ${btnBodyEl}
      ${borderEl}
      ${sparkleEl}
      ${shimmerEl}
      ${textEl}

    </g>
    <!-- ═══════════════════════════════════════════════════════════════════ -->`;

  return { filterDefs, stylesCSS, groupSVG };
}
