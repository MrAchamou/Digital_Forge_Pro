// ═══════════════════════════════════════════════════════════════════════════════
// CORP NAME LIVING SYSTEM
// Orchestrateur d'effets SVG pour le nom d'entreprise dans la signature email.
//
// Moteurs intégrés :
//  VarianceEngine  → mutation teinte/sat/vitesse selon variante A/B/C/D
//  TimingMaster    → BPM + globalMult sectoriel → vitesses harmoniques
//  LightingEngine  → glowIntensity sectorielle → halo + shimmer
//  MorphingEngine  → breathe/elastic → micro-animation du groupe texte
//  TYPEWRITER      → révélation lettre par lettre (clip-path croissant)
//  NEON GLOW       → gradient cyclique variant-aware
//  GLITCH SPAWN    → distorsion chromatique occasionnelle (secteurs dynamiques)
//  SOUL AURA       → halo auroral périodique
//  ELECTRIC FORM   → scanner lumineux horizontal
// ═══════════════════════════════════════════════════════════════════════════════

import { getVarianceParams, applyVarianceToColor, type VariantId } from './logo-module-bridge';

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;

// ── Profils secteur extraits du TimingMaster ──────────────────────────────────

interface SectorProfile {
  bpm:        number;
  globalMult: number;
  easing:     string;
  glowInt:    number;    // LightingEngine glowIntensity
  glowStyle:  string;    // LightingEngine style
  glitch:     boolean;   // GLITCH SPAWN activé
  haloPeriod: number;    // secondes entre apparitions du halo (SOUL AURA)
  morphStyle: string;    // MorphingEngine style sur le groupe texte
}

const SECTOR_PROFILES: Record<string, SectorProfile> = {
  tech:         { bpm: 72,  globalMult: 1.0,       easing: 'cubic-bezier(.25,.46,.45,.94)', glowInt: 0.85, glowStyle: 'electric', glitch: true,  haloPeriod: 7,  morphStyle: 'geometric' },
  startup:      { bpm: 96,  globalMult: PHI_INV,   easing: 'cubic-bezier(.68,-.55,.265,1.55)', glowInt: 0.90, glowStyle: 'neon',     glitch: true,  haloPeriod: 5,  morphStyle: 'elastic'  },
  sante:        { bpm: 60,  globalMult: 1.2,       easing: 'cubic-bezier(.4,0,.6,1)',       glowInt: 0.45, glowStyle: 'soft',     glitch: false, haloPeriod: 10, morphStyle: 'breathe'  },
  beaute:       { bpm: 58,  globalMult: 1.0,       easing: 'cubic-bezier(.25,.1,.25,1)',    glowInt: 0.70, glowStyle: 'aura',     glitch: false, haloPeriod: 8,  morphStyle: 'liquid'   },
  finance:      { bpm: 44,  globalMult: PHI,       easing: 'cubic-bezier(.4,0,.2,1)',       glowInt: 0.30, glowStyle: 'subtle',   glitch: false, haloPeriod: 14, morphStyle: 'breathe'  },
  juridique:    { bpm: 40,  globalMult: PHI * 1.1, easing: 'cubic-bezier(0,0,.2,1)',        glowInt: 0.25, glowStyle: 'subtle',   glitch: false, haloPeriod: 18, morphStyle: 'breathe'  },
  creative:     { bpm: 80,  globalMult: 0.9,       easing: 'cubic-bezier(.34,1.56,.64,1)', glowInt: 0.95, glowStyle: 'dramatic', glitch: true,  haloPeriod: 4,  morphStyle: 'liquid'   },
  immobilier:   { bpm: 52,  globalMult: 1.3,       easing: 'cubic-bezier(.25,.1,.25,1)',    glowInt: 0.40, glowStyle: 'soft',     glitch: false, haloPeriod: 10, morphStyle: 'breathe'  },
  restauration: { bpm: 68,  globalMult: 1.0,       easing: 'cubic-bezier(.4,0,.2,1)',       glowInt: 0.60, glowStyle: 'aura',     glitch: false, haloPeriod: 9,  morphStyle: 'breathe'  },
  sport:        { bpm: 110, globalMult: PHI_INV * 0.9, easing: 'cubic-bezier(.68,-.55,.27,1.55)', glowInt: 0.95, glowStyle: 'electric', glitch: true,  haloPeriod: 4,  morphStyle: 'elastic'  },
  default:      { bpm: 60,  globalMult: 1.0,       easing: 'cubic-bezier(.4,0,.2,1)',       glowInt: 0.55, glowStyle: 'soft',     glitch: false, haloPeriod: 8,  morphStyle: 'breathe'  },
};

function getSector(sectorId: string): string {
  return (sectorId || '').toLowerCase().split(/[_\s-]/)[0] || 'default';
}

// ── Résultat du système ───────────────────────────────────────────────────────

export interface CorpNameResult {
  filterDefs: string;   // <filter> + <linearGradient> à injecter dans <defs>
  stylesCSS:  string;   // @keyframes à injecter dans <style>
  groupSVG:   string;   // <g> complet remplaçant le <text> d'entreprise
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Estime la largeur d'un texte en majuscules, police Arial 21px
function estimateTextWidth(text: string): number {
  const avgCharWidth = 13.8; // px pour Arial 21px majuscule
  return Math.ceil(text.length * avgCharWidth);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function buildCorpNameLivingSystem(
  text:      string,
  accent:    string,
  accentLight: string,
  sectorId:  string  = 'default',
  variantId: VariantId = 'A',
  animated:  boolean = true,
): CorpNameResult {

  if (!animated || !text) {
    return { filterDefs: '', stylesCSS: '', groupSVG: '' };
  }

  const sec  = getSector(sectorId);
  const prof = SECTOR_PROFILES[sec] || SECTOR_PROFILES.default;

  // ── VarianceEngine ─────────────────────────────────────────────────────────
  const variance = getVarianceParams(variantId);
  const tMult    = variance.timingMult * prof.globalMult;

  // Couleurs variant-aware
  const vAccent      = applyVarianceToColor(accent,      variance.hueShift, variance.satMult, variance.lightOffset);
  const vAccentLight = applyVarianceToColor(accentLight, variance.hueShift, variance.satMult, variance.lightOffset);

  // Palette étendue (hue rotations) × VarianceEngine
  const baseH = (() => {
    const r = parseInt(accent.slice(1,3),16)/255, g = parseInt(accent.slice(3,5),16)/255, b = parseInt(accent.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
    if (d === 0) return 0;
    const hRaw = max===r ? (g-b)/d+(g<b?6:0) : max===g ? (b-r)/d+2 : (r-g)/d+4;
    return Math.round(hRaw * 60);
  })();
  const baseS = (() => {
    const r = parseInt(accent.slice(1,3),16)/255, g = parseInt(accent.slice(3,5),16)/255, b = parseInt(accent.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), l = (max+min)/2, d = max - min;
    if (d === 0) return 0;
    return Math.round((l > 0.5 ? d/(2-max-min) : d/(max+min)) * 100);
  })();
  const baseL = (() => {
    const r = parseInt(accent.slice(1,3),16)/255, g = parseInt(accent.slice(3,5),16)/255, b = parseInt(accent.slice(5,7),16)/255;
    return Math.round(((Math.max(r,g,b) + Math.min(r,g,b)) / 2) * 100);
  })();

  const h = (baseH + variance.hueShift + 360) % 360;
  const s = clamp(baseS * variance.satMult, 20, 100);
  const l = clamp(baseL + variance.lightOffset, 20, 85);

  const gc1 = vAccentLight;
  const gc2 = vAccent;
  const gc3 = `hsl(${(h + 80) % 360},${s}%,${Math.min(85, l + 18)}%)`;
  const gc4 = `hsl(${(h + 160) % 360},${s}%,${l}%)`;
  const gc5 = `hsl(${(h + 240) % 360},${s}%,${Math.min(85, l + 12)}%)`;
  const gcGhost = `hsl(${(h + 180) % 360},${clamp(s * 1.2, 20, 100)}%,${Math.min(90, l + 25)}%)`;

  // ── Métriques temporelles ──────────────────────────────────────────────────
  const beatS       = 60 / prof.bpm;                                  // durée d'un beat
  const typewriterS = clamp(beatS * 4 / tMult, 0.6, 3.0);            // TYPEWRITER: 4 beats
  const haloS       = clamp(prof.haloPeriod / tMult, 3, 20);          // SOUL AURA période
  const shimmerS    = clamp((beatS * 6) / tMult, 1.5, 6.0);           // ELECTRIC FORM
  const gradShiftS  = clamp((beatS * 8) / tMult, 2.5, 6.0);           // NEON GLOW
  const breatheS    = clamp((beatS * 8) * tMult, 2, 8);               // BREATHING
  const glitchPeriod= clamp((prof.haloPeriod * 1.3) / tMult, 4, 16);  // GLITCH SPAWN

  // ── Largeur estimée du texte ───────────────────────────────────────────────
  const textW = estimateTextWidth(text);
  const textH = 26;   // hauteur ~de la police
  const padX  = 8;    // padding horizontal du halo

  // ─────────────────────────────────────────────────────────────────────────
  // DEFS : filtres + gradients
  // ─────────────────────────────────────────────────────────────────────────

  const filterDefs = `
    <!-- Corp Name Living System — Filtres & Gradients -->

    <!-- NEON GLOW / gradient cyclique variant-aware -->
    <linearGradient id="cnls-grad" x1="0" y1="0" x2="${textW + 300}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="${gc1}"/>
      <stop offset="18%"  stop-color="${gc2}"/>
      <stop offset="36%"  stop-color="${gc3}"/>
      <stop offset="54%"  stop-color="${gc4}"/>
      <stop offset="72%"  stop-color="${gc5}"/>
      <stop offset="90%"  stop-color="${gc3}"/>
      <stop offset="100%" stop-color="${gc1}"/>
      <animateTransform attributeName="gradientTransform" type="translate"
        from="-${textW} 0" to="${textW + 150} 0" dur="${gradShiftS.toFixed(2)}s" repeatCount="indefinite"/>
    </linearGradient>

    <!-- SOUL AURA — gradient radial pour halo périodique -->
    <radialGradient id="cnls-halo-rg" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${gc2}" stop-opacity="0.35"/>
      <stop offset="50%"  stop-color="${gc3}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${gc4}" stop-opacity="0"/>
    </radialGradient>

    <!-- SHIMMER — gradient linéaire pour scanner lumineux -->
    <linearGradient id="cnls-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="white" stop-opacity="0"/>
      <stop offset="40%"  stop-color="white" stop-opacity="${(prof.glowInt * 0.4).toFixed(2)}"/>
      <stop offset="55%"  stop-color="${gc1}" stop-opacity="${(prof.glowInt * 0.6).toFixed(2)}"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>

    <!-- NEON GLOW filter — blur + merge -->
    <filter id="cnls-glow-f" x="-8%" y="-40%" width="116%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${(prof.glowInt * 4).toFixed(1)}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- HALO filter — très doux -->
    <filter id="cnls-halo-f" x="-15%" y="-80%" width="130%" height="260%">
      <feGaussianBlur stdDeviation="${(prof.glowInt * 7).toFixed(1)}"/>
    </filter>

    <!-- GLITCH filter — décalage chromatique -->
    <filter id="cnls-glitch-f" x="-2%" y="-10%" width="104%" height="120%" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix"
        values="1 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0" result="r"/>
      <feColorMatrix type="matrix"
        values="0 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 1 0" in="SourceGraphic" result="gb"/>
      <feOffset dx="2" dy="0" in="r" result="r-off"/>
      <feBlend in="r-off" in2="gb" mode="screen"/>
    </filter>

    <!-- Clip TYPEWRITER — révélation gauche→droite -->
    <clipPath id="cnls-type-clip">
      <rect x="-4" y="-${textH + 4}" width="0" height="${textH + 10}">
        <animate attributeName="width"
          from="0" to="${textW + 20}"
          dur="${typewriterS.toFixed(2)}s"
          begin="0.2s" fill="freeze"/>
      </rect>
    </clipPath>`;

  // ─────────────────────────────────────────────────────────────────────────
  // CSS @keyframes
  // ─────────────────────────────────────────────────────────────────────────

  const glowOpMin = (prof.glowInt * 0.0).toFixed(2);
  const glowOpMax = (prof.glowInt * 0.22).toFixed(2);
  const glitchCSS = prof.glitch ? `
    @keyframes cnls-glitch {
      0%,${(100 - 100/glitchPeriod).toFixed(1)}%,100% {
        transform: translateX(0) skewX(0deg); opacity: 1; filter: none;
      }
      ${(100 - 100/glitchPeriod + 0.8).toFixed(1)}% {
        transform: translateX(-2px) skewX(-0.8deg); opacity: 0.85;
        filter: url(#cnls-glitch-f);
      }
      ${(100 - 100/glitchPeriod + 1.6).toFixed(1)}% {
        transform: translateX(2px) skewX(0.5deg); opacity: 0.92;
        filter: url(#cnls-glitch-f);
      }
      ${(100 - 100/glitchPeriod + 2.4).toFixed(1)}% {
        transform: translateX(-1px); opacity: 0.96; filter: none;
      }
    }` : '';

  const stylesCSS = `
    /* CNLS — Corp Name Living System */

    /* SOUL AURA — halo périodique */
    @keyframes cnls-halo {
      0%,${(100 * (1 - 3/haloS)).toFixed(1)}%,100% { opacity: 0; transform: scaleX(1) scaleY(1); }
      ${(100 * (1 - 2.5/haloS)).toFixed(1)}% { opacity: 1; transform: scaleX(1.04) scaleY(1.3); }
      ${(100 * (1 - 1.5/haloS)).toFixed(1)}% { opacity: 0.6; transform: scaleX(1.02) scaleY(1.15); }
    }

    /* BREATHING — micro-respiration du groupe texte */
    @keyframes cnls-breathe {
      0%,100% { transform: scaleX(1) scaleY(1); }
      50%     { transform: scaleX(${(1 + 0.004 * prof.glowInt).toFixed(4)}) scaleY(${(1 + 0.006 * prof.glowInt).toFixed(4)}); }
    }

    /* ELECTRIC FORM — scanner lumineux */
    @keyframes cnls-shimmer-move {
      0%   { transform: translateX(-${textW + 60}px); opacity: 0; }
      5%   { opacity: 1; }
      95%  { opacity: 1; }
      100% { transform: translateX(${textW + 60}px); opacity: 0; }
    }

    /* NEON GLOW — pulsation lumineuse douce */
    @keyframes cnls-glow-pulse {
      0%,100% { opacity: ${glowOpMin}; transform: scaleY(1); }
      50%     { opacity: ${glowOpMax}; transform: scaleY(1.1); }
    }

    /* Cursor clignotant (typewriter) */
    @keyframes cnls-cursor {
      0%,49%  { opacity: 1; }
      50%,100%{ opacity: 0; }
    }

    /* Fade-in global du groupe */
    @keyframes cnls-fadein {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    ${glitchCSS}`;

  // ─────────────────────────────────────────────────────────────────────────
  // ÉLÉMENTS SVG — le groupe complet
  //
  // Coordonnées : relatives au <g> parent positionné en translate(112, 36)
  // → origine (0,0) = baseline du texte à gauche
  // ─────────────────────────────────────────────────────────────────────────

  const hasBreathe   = ['breathe','liquid','elastic'].includes(prof.morphStyle);
  const breatheStyle = hasBreathe
    ? `animation: cnls-breathe ${breatheS.toFixed(2)}s ${prof.easing} 0s infinite; transform-origin: 0px 0px;`
    : '';

  const glitchStyle = prof.glitch
    ? `animation: cnls-glitch ${glitchPeriod.toFixed(2)}s linear ${typewriterS.toFixed(2)}s infinite; transform-origin: 0px 0px;`
    : '';

  // ── Curseur typewriter ─────────────────────────────────────────────────
  const cursorEl = `
    <rect x="${textW + 3}" y="-${textH - 2}" width="2" height="${textH - 4}"
      fill="${gc2}" rx="1"
      style="animation: cnls-cursor 0.65s step-end ${typewriterS.toFixed(2)}s 6; transform-origin:0px 0px; opacity:0;">
      <animate attributeName="opacity" values="0" dur="${typewriterS.toFixed(2)}s" fill="freeze"/>
    </rect>`;

  // ── Halo SOUL AURA ────────────────────────────────────────────────────
  const haloEl = `
    <!-- SOUL AURA — halo périodique -->
    <rect x="${-padX}" y="-${textH + 2}" width="${textW + padX * 2}" height="${textH + 6}" rx="4"
      fill="url(#cnls-halo-rg)"
      filter="url(#cnls-halo-f)"
      style="opacity:0; animation: cnls-halo ${haloS.toFixed(2)}s ease-in-out ${(typewriterS + 0.5).toFixed(2)}s infinite; transform-origin: ${(textW/2).toFixed(0)}px -${(textH/2).toFixed(0)}px;"/>`;

  // ── Glow doux derrière le texte (NEON GLOW) ──────────────────────────
  const glowEl = `
    <!-- NEON GLOW — aura douce permanente -->
    <rect x="${-padX}" y="-${textH + 2}" width="${textW + padX * 2}" height="${textH + 6}" rx="4"
      fill="${gc2}" fill-opacity="${(prof.glowInt * 0.08).toFixed(2)}"
      filter="url(#cnls-halo-f)"
      style="animation: cnls-glow-pulse ${(breatheS * 1.2).toFixed(2)}s ease-in-out 0s infinite; transform-origin: ${(textW/2).toFixed(0)}px -${(textH/2).toFixed(0)}px;"/>`;

  // ── Texte principal (clip typewriter) ─────────────────────────────────
  const mainTextEl = `
    <!-- Texte principal — révélation typewriter + gradient cyclique -->
    <g clip-path="url(#cnls-type-clip)">
      <text x="0" y="0"
        font-family="Arial,sans-serif" font-size="21" font-weight="900"
        fill="url(#cnls-grad)" letter-spacing="1"
        style="${breatheStyle}">
        ${text.toUpperCase().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
      </text>
    </g>`;

  // ── Ghost text (effet double / echo léger) ────────────────────────────
  const ghostEl = prof.glowInt > 0.5 ? `
    <!-- Ghost text — ombre colorée en décalage (ECHO TRAIL) -->
    <text x="1" y="1"
      font-family="Arial,sans-serif" font-size="21" font-weight="900"
      fill="${gcGhost}" fill-opacity="${(prof.glowInt * 0.12).toFixed(2)}" letter-spacing="1"
      filter="url(#cnls-glow-f)"
      aria-hidden="true">
      ${text.toUpperCase().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
    </text>` : '';

  // ── Shimmer ELECTRIC FORM ─────────────────────────────────────────────
  const shimmerEl = `
    <!-- ELECTRIC FORM — scanner lumineux -->
    <g clip-path="url(#cnls-type-clip)" style="opacity:0; animation: cnls-fadein 0.1s linear ${(typewriterS + 0.1).toFixed(2)}s forwards;">
      <rect x="-30" y="-${textH + 2}" width="90" height="${textH + 6}"
        fill="url(#cnls-shimmer)"
        style="animation: cnls-shimmer-move ${shimmerS.toFixed(2)}s ${prof.easing} ${(typewriterS + 1).toFixed(2)}s infinite; transform-origin:0px 0px;"/>
    </g>`;

  // ── Glitch GLITCH SPAWN ───────────────────────────────────────────────
  const glitchWrapOpen  = prof.glitch ? `<g style="${glitchStyle}">` : '';
  const glitchWrapClose = prof.glitch ? `</g>` : '';

  // ── Fade-in global ────────────────────────────────────────────────────
  const groupSVG = `
    <!-- ═══ Corp Name Living System ═══════════════════════════════════════ -->
    <!-- Sector: ${sec} | Variant: ${variantId} | BPM: ${prof.bpm} | Glow: ${(prof.glowInt*100).toFixed(0)}% -->
    <g style="animation: cnls-fadein 0.4s ease-out 0s forwards; opacity:0; transform-origin: 0px 0px;">
      <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0s" fill="freeze"/>

      ${haloEl}
      ${glowEl}

      ${glitchWrapOpen}
        ${ghostEl}
        ${mainTextEl}
        ${cursorEl}
      ${glitchWrapClose}

      ${shimmerEl}

    </g>
    <!-- ═══════════════════════════════════════════════════════════════════ -->`;

  return { filterDefs, stylesCSS, groupSVG };
}
