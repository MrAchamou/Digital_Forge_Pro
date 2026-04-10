// ═══════════════════════════════════════════════════════════════════════════════
// LOGO MODULE BRIDGE
// Traduit les 4 moteurs existants (Morphing, Lighting, Physics, Variance)
// en animations SVG pour la zone logo du Logo Living System.
// ═══════════════════════════════════════════════════════════════════════════════
//
//  MorphingEngine  → Déformation/morphing de l'anneau avatar selon le secteur
//  LightingEngine  → Glow ambiant + halo pulsant selon l'intensité sectorielle
//  PhysicsEngine   → Float/pendule/bounce de l'ensemble logo
//  VarianceEngine  → Teinte/saturation selon la variante (A/B/C/D)
//
// Coordonnées : locales au groupe translate(cx,cy), centre = (0,0)
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;

// ── Configs secteur extraites des modules existants ───────────────────────────

const MORPH_PROFILES: Record<string, { style: string; intensity: number; speed: number }> = {
  tech:         { style: 'geometric', intensity: 0.80, speed: 1.2 },
  startup:      { style: 'elastic',   intensity: 0.90, speed: 1.5 },
  sante:        { style: 'breathe',   intensity: 0.40, speed: 0.6 },
  beaute:       { style: 'liquid',    intensity: 0.75, speed: 0.9 },
  finance:      { style: 'breathe',   intensity: 0.35, speed: 0.7 },
  juridique:    { style: 'breathe',   intensity: 0.25, speed: 0.5 },
  creative:     { style: 'liquid',    intensity: 0.95, speed: 1.6 },
  immobilier:   { style: 'breathe',   intensity: 0.50, speed: 0.7 },
  restauration: { style: 'breathe',   intensity: 0.55, speed: 0.8 },
  sport:        { style: 'elastic',   intensity: 0.90, speed: 1.8 },
  default:      { style: 'breathe',   intensity: 0.55, speed: 0.9 },
};

const LIGHTING_PROFILES: Record<string, { style: string; glowIntensity: number; pulseSpeed: number }> = {
  tech:         { style: 'electric', glowIntensity: 0.85, pulseSpeed: 1.2 },
  startup:      { style: 'neon',     glowIntensity: 0.90, pulseSpeed: 1.4 },
  sante:        { style: 'soft',     glowIntensity: 0.45, pulseSpeed: 0.6 },
  beaute:       { style: 'aura',     glowIntensity: 0.70, pulseSpeed: 0.8 },
  finance:      { style: 'subtle',   glowIntensity: 0.30, pulseSpeed: 0.5 },
  juridique:    { style: 'subtle',   glowIntensity: 0.25, pulseSpeed: 0.4 },
  creative:     { style: 'dramatic', glowIntensity: 0.95, pulseSpeed: 1.5 },
  immobilier:   { style: 'soft',     glowIntensity: 0.40, pulseSpeed: 0.6 },
  restauration: { style: 'aura',     glowIntensity: 0.60, pulseSpeed: 0.9 },
  sport:        { style: 'electric', glowIntensity: 0.95, pulseSpeed: 1.8 },
  default:      { style: 'soft',     glowIntensity: 0.50, pulseSpeed: 0.8 },
};

const PHYSICS_PROFILES: Record<string, { preset: string; floatAmp: number; mass: number; stiffness: number; damping: number }> = {
  tech:         { preset: 'spring',   floatAmp: 3, mass: 0.8, stiffness: 200, damping: 18 },
  startup:      { preset: 'bounce',   floatAmp: 5, mass: 0.6, stiffness: 300, damping: 12 },
  sante:        { preset: 'float',    floatAmp: 8, mass: 1.2, stiffness: 80,  damping: 30 },
  beaute:       { preset: 'float',    floatAmp: 6, mass: 0.9, stiffness: 100, damping: 22 },
  finance:      { preset: 'gravity',  floatAmp: 1, mass: 1.5, stiffness: 160, damping: 40 },
  juridique:    { preset: 'gravity',  floatAmp: 0, mass: 1.8, stiffness: 120, damping: 50 },
  creative:     { preset: 'bounce',   floatAmp: 8, mass: 0.5, stiffness: 350, damping: 10 },
  immobilier:   { preset: 'spring',   floatAmp: 2, mass: 1.0, stiffness: 140, damping: 25 },
  restauration: { preset: 'pendulum', floatAmp: 5, mass: 1.1, stiffness: 110, damping: 20 },
  sport:        { preset: 'bounce',   floatAmp: 6, mass: 0.7, stiffness: 380, damping: 8  },
  default:      { preset: 'spring',   floatAmp: 4, mass: 1.0, stiffness: 150, damping: 22 },
};

// ── Variantes (VarianceEngine) ────────────────────────────────────────────────

export type VariantId = 'A' | 'B' | 'C' | 'D';

const VARIANT_PROFILES: Record<VariantId, { hueShift: number; satMult: number; lightOffset: number; timingMult: number; label: string }> = {
  A: { hueShift:  0,  satMult: 1.00, lightOffset:  0, timingMult: 1.00, label: 'Canonique' },
  B: { hueShift: 20,  satMult: 1.35, lightOffset: -5, timingMult: 0.75, label: 'Intense'   },
  C: { hueShift:-15,  satMult: 0.65, lightOffset: 12, timingMult: 1.62, label: 'Éthéré'    },
  D: { hueShift: 40,  satMult: 1.15, lightOffset: -2, timingMult: 0.88, label: 'Énergique' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
}

function lighten(hex: string, amt: number): string {
  if (!hex || hex.length < 7) return '#ffffff';
  const r = Math.min(255, parseInt(hex.slice(1,3),16)+amt);
  const g = Math.min(255, parseInt(hex.slice(3,5),16)+amt);
  const b = Math.min(255, parseInt(hex.slice(5,7),16)+amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function getSector(sectorId: string): string {
  return (sectorId || '').toLowerCase().split(/[_\s-]/)[0] || 'default';
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉSULTAT DU PONT
// ─────────────────────────────────────────────────────────────────────────────

export interface ModuleBridgeResult {
  filterDefs: string;    // Defs SVG (filtres, gradients)
  stylesCSS:  string;    // @keyframes CSS pour <style> SVG
  baseLayer:  string;    // Éléments SVG (couche permanente derrière le cycle LLS)
  innerWrap:  {          // Wrapper pour animation physique (appliqué sur <g> interne)
    openTag:  string;
    closeTag: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1 : MORPHINGENGINE → SVG
// Traduit le style de morphing sectoriel en animation SVG sur l'anneau avatar
// ─────────────────────────────────────────────────────────────────────────────

function buildMorphingSVG(
  sectorId: string, r: number, accent: string, accentLight: string, timingMult: number
): { defs: string; styles: string; elements: string } {

  const sec = getSector(sectorId);
  const { style, intensity: i, speed } = MORPH_PROFILES[sec] || MORPH_PROFILES.default;
  const effectiveSpeed = speed * timingMult;
  const rRing = r + 3; // anneau légèrement plus grand que le cercle avatar

  let styles = '';
  let elements = '';
  let defs = '';

  // ── Anneau morphing commun ─────────────────────────────────────────────────
  switch (style) {
    case 'breathe': {
      const dur = (5.0 / effectiveSpeed).toFixed(2);
      const sMax = (1 + 0.09 * i).toFixed(3);
      const sMin = (1 - 0.04 * i).toFixed(3);
      styles += `@keyframes lmb-morph {
        0%,100% { transform: scale(1);     opacity: ${(0.45+i*0.15).toFixed(2)}; }
        33%     { transform: scale(${sMax}); opacity: ${(0.65+i*0.2).toFixed(2)};  }
        66%     { transform: scale(${sMin}); opacity: ${(0.35+i*0.1).toFixed(2)};  }
      }`;
      elements += `<circle r="${rRing}" fill="none" stroke="${accent}"
        stroke-width="${(1.2+i*0.8).toFixed(1)}" opacity="0.5"
        style="animation:lmb-morph ${dur}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
    case 'elastic': {
      const dur = (2.8 / effectiveSpeed).toFixed(2);
      const sx  = (1 + 0.12 * i).toFixed(3), sy  = (1 - 0.10 * i).toFixed(3);
      const sx2 = (1 - 0.08 * i).toFixed(3), sy2 = (1 + 0.06 * i).toFixed(3);
      styles += `@keyframes lmb-morph {
        0%   { transform: scale(1,1);       }
        20%  { transform: scale(${sx},${sy});   }
        40%  { transform: scale(${sx2},${sy2}); }
        60%  { transform: scale(${(1+.07*i).toFixed(3)},${(1-.05*i).toFixed(3)}); }
        80%  { transform: scale(${(1-.04*i).toFixed(3)},${(1+.04*i).toFixed(3)}); }
        100% { transform: scale(1,1);       }
      }`;
      elements += `<circle r="${rRing}" fill="none" stroke="${accentLight}"
        stroke-width="${(1.5+i*0.5).toFixed(1)}" opacity="0.6"
        style="animation:lmb-morph ${dur}s cubic-bezier(.68,-.55,.27,1.55) 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
    case 'geometric': {
      const dur = (3.5 / effectiveSpeed).toFixed(2);
      const rotMax = Math.round(45 * i);
      styles += `@keyframes lmb-morph {
        0%   { transform: rotate(0deg)        scale(1); }
        25%  { transform: rotate(${rotMax}deg)  scale(${(1+.05*i).toFixed(2)}); }
        50%  { transform: rotate(${rotMax*2}deg) scale(${(1-.03*i).toFixed(2)}); }
        75%  { transform: rotate(${rotMax*3}deg) scale(${(1+.05*i).toFixed(2)}); }
        100% { transform: rotate(360deg)       scale(1); }
      }`;
      // Anneau octogonal simulé avec dasharray
      const circ = Math.round(2 * Math.PI * rRing);
      const segLen = Math.round(circ / 8);
      elements += `<circle r="${rRing}" fill="none" stroke="${accent}"
        stroke-width="${(1+i*0.7).toFixed(1)}" stroke-dasharray="${segLen} ${Math.round(segLen*0.3)}"
        opacity="0.65"
        style="animation:lmb-morph ${dur}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
    case 'liquid': {
      const dur = (4.5 / effectiveSpeed * PHI).toFixed(2);
      // 3 anneaux décalés de phase pour simuler le fluide
      styles += `@keyframes lmb-liq0 {
        0%,100% { transform: scaleX(1) scaleY(1);             }
        25%     { transform: scaleX(${(1+.10*i).toFixed(3)}) scaleY(${(1-.06*i).toFixed(3)}); }
        50%     { transform: scaleX(${(1-.05*i).toFixed(3)}) scaleY(${(1+.09*i).toFixed(3)}); }
        75%     { transform: scaleX(${(1+.07*i).toFixed(3)}) scaleY(${(1-.04*i).toFixed(3)}); }
      }
      @keyframes lmb-liq1 {
        0%,100% { transform: scaleX(1) scaleY(1);             }
        33%     { transform: scaleX(${(1-.08*i).toFixed(3)}) scaleY(${(1+.11*i).toFixed(3)}); }
        66%     { transform: scaleX(${(1+.09*i).toFixed(3)}) scaleY(${(1-.07*i).toFixed(3)}); }
      }`;
      [0,1,2].forEach(k => {
        const op = (0.4 + k * 0.1).toFixed(2);
        const sw = (1.8 - k * 0.4).toFixed(1);
        elements += `<circle r="${rRing+k*2}" fill="none" stroke="${k%2===0?accent:accentLight}"
          stroke-width="${sw}" opacity="${op}"
          style="animation:lmb-liq${k<2?k:0} ${(parseFloat(dur)*(1+k*0.15)).toFixed(2)}s ease-in-out ${(k*0.4).toFixed(1)}s infinite; transform-origin:0px 0px;"/>`;
      });
      break;
    }
    case 'crystal': {
      const dur = (4.0 / effectiveSpeed).toFixed(2);
      // Animation de rotation + alternance tirets/plein pour effect cristallin
      styles += `@keyframes lmb-crystal-rot {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes lmb-crystal-inner {
        0%,100% { transform: rotate(0deg) scale(1);    opacity: 0.6; }
        25%     { transform: rotate(-15deg) scale(${(1+.06*i).toFixed(3)}); opacity: 0.8; }
        50%     { transform: rotate(-30deg) scale(1); opacity: 0.5; }
        75%     { transform: rotate(-15deg) scale(${(1+.04*i).toFixed(3)}); opacity: 0.7; }
      }`;
      // Triangle simulé avec dasharray précis
      const circ2 = Math.round(2 * Math.PI * (rRing+4));
      const sides3 = Math.round(circ2 / 3);
      defs += `<filter id="lmb-crystal-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
      elements += `<circle r="${rRing+4}" fill="none" stroke="${accent}"
          stroke-width="1.2" stroke-dasharray="${sides3} ${Math.round(sides3*0.6)}"
          filter="url(#lmb-crystal-glow)"
          style="animation:lmb-crystal-rot ${dur}s linear 0s infinite; transform-origin:0px 0px;"/>
        <circle r="${rRing}" fill="none" stroke="${accentLight}"
          stroke-width="0.8" opacity="0.5"
          style="animation:lmb-crystal-inner ${dur}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
  }

  return { defs, styles, elements };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 2 : LIGHTINGENGINE → SVG
// Traduit l'intensité et le style de glow sectoriel en filtre SVG animé
// ─────────────────────────────────────────────────────────────────────────────

function buildLightingSVG(
  sectorId: string, r: number, accent: string, accentLight: string, timingMult: number
): { defs: string; styles: string; elements: string } {

  const sec = getSector(sectorId);
  const { style, glowIntensity: gi, pulseSpeed } = LIGHTING_PROFILES[sec] || LIGHTING_PROFILES.default;
  const [rr, rg, rb] = hexToRgb(accent);
  const speed = (3.2 / pulseSpeed * timingMult).toFixed(2);

  // Valeurs de glow basées sur glowIntensity
  const blurMin  = (gi * 3).toFixed(1);
  const blurMax  = (gi * 9).toFixed(1);
  const opMin    = (gi * 0.25).toFixed(2);
  const opMax    = (gi * 0.70).toFixed(2);

  let defs = '';
  let styles = '';
  let elements = '';

  // Filtre glow commun
  defs += `
    <filter id="lmb-glow-filter" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blurMin}" result="b1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blurMax}" result="b2"/>
      <feBlend in="b1" in2="b2" mode="screen" result="merged"/>
      <feMerge><feMergeNode in="merged"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="lmb-glow-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="${accent}" stop-opacity="${opMax}"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="${opMin}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>`;

  switch (style) {
    case 'electric': {
      styles += `@keyframes lmb-light-glow {
        0%,100% { opacity: ${opMin}; transform: scale(1); }
        48%     { opacity: ${opMax}; transform: scale(1.1); }
        50%     { opacity: 0.7; transform: scale(1.08); }
        52%     { opacity: ${opMax}; transform: scale(1.1); }
      }
      @keyframes lmb-elec-flicker {
        0%,85%,100% { opacity: 1; }
        86% { opacity: 0.7; }
        87% { opacity: 1; }
        88% { opacity: 0.8; }
        94% { opacity: 0.6; }
        95% { opacity: 1; }
      }`;
      elements += `<circle r="${r+gi*25}" fill="url(#lmb-glow-grad)"
          style="animation:lmb-light-glow ${speed}s ease-in-out 0s infinite, lmb-elec-flicker 3s linear 1s infinite; transform-origin:0px 0px;"/>`;
      // Petits arcs électriques fixes
      elements += `<circle r="${r+4}" fill="none" stroke="rgba(${rr},${rg},${rb},0.7)" stroke-width="0.8"
          stroke-dasharray="2 16"
          style="animation:lmb-elec-flicker 2s linear 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
    case 'neon': {
      styles += `@keyframes lmb-neon-pulse {
        0%,100% { opacity: ${opMin}; transform: scale(1);    }
        50%     { opacity: ${opMax}; transform: scale(1.12); }
      }
      @keyframes lmb-neon-ring {
        0%,100% { stroke-opacity: ${(gi*0.4).toFixed(2)}; stroke-width: 1; }
        50%     { stroke-opacity: ${(gi*0.9).toFixed(2)}; stroke-width: 2.5; }
      }`;
      elements += `<circle r="${r+gi*20}" fill="url(#lmb-glow-grad)"
          style="animation:lmb-neon-pulse ${speed}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>
        <circle r="${r+3}" fill="none" stroke="${accentLight}" stroke-width="1"
          style="animation:lmb-neon-ring ${speed}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
    case 'aura': {
      styles += `@keyframes lmb-aura0 {
        0%,100% { transform: scale(1) rotate(0deg);   opacity: ${(gi*0.4).toFixed(2)}; }
        33%     { transform: scale(1.08) rotate(8deg);  opacity: ${(gi*0.7).toFixed(2)}; }
        66%     { transform: scale(1.04) rotate(-5deg); opacity: ${(gi*0.5).toFixed(2)}; }
      }
      @keyframes lmb-aura1 {
        0%,100% { transform: scale(1) rotate(0deg);   opacity: ${(gi*0.25).toFixed(2)}; }
        50%     { transform: scale(1.12) rotate(-12deg); opacity: ${(gi*0.45).toFixed(2)}; }
      }`;
      elements += `<circle r="${r+gi*18}" fill="${accent}" fill-opacity="${(gi*0.15).toFixed(2)}"
          style="animation:lmb-aura0 ${speed}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>
        <circle r="${r+gi*30}" fill="${accentLight}" fill-opacity="${(gi*0.07).toFixed(2)}"
          style="animation:lmb-aura1 ${(+speed*1.4).toFixed(2)}s ease-in-out 0.6s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
    case 'dramatic': {
      styles += `@keyframes lmb-drama {
        0%,100% { opacity: ${(gi*0.3).toFixed(2)}; transform: scale(1); }
        40%     { opacity: ${(gi*0.8).toFixed(2)}; transform: scale(1.08); }
        60%     { opacity: ${(gi*0.6).toFixed(2)}; transform: scale(1.05); }
      }`;
      elements += `<circle r="${r+gi*22}" fill="url(#lmb-glow-grad)"
          style="animation:lmb-drama ${(+speed*0.9).toFixed(2)}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
    default: { // soft / subtle
      styles += `@keyframes lmb-soft {
        0%,100% { opacity: ${(gi*0.2).toFixed(2)}; transform: scale(1);    }
        50%     { opacity: ${(gi*0.55).toFixed(2)}; transform: scale(1.06); }
      }`;
      elements += `<circle r="${r+gi*15}" fill="url(#lmb-glow-grad)"
          style="animation:lmb-soft ${speed}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>`;
      break;
    }
  }

  return { defs, styles, elements };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 3 : PHYSICSENGINE → SVG
// Traduit le preset physique en animation CSS appliquée sur un wrapper interne
// ─────────────────────────────────────────────────────────────────────────────

function buildPhysicsSVG(
  sectorId: string, timingMult: number
): { styles: string; openTag: string; closeTag: string } {

  const sec = getSector(sectorId);
  const { preset, floatAmp, mass, stiffness, damping } = PHYSICS_PROFILES[sec] || PHYSICS_PROFILES.default;

  if (floatAmp === 0) {
    return { styles: '', openTag: '<g>', closeTag: '</g>' };
  }

  // Calcul période spring (formule de Hooke)
  const omega = Math.sqrt(stiffness / mass);
  const period = Math.max(1.2, (2 * Math.PI / omega) * timingMult).toFixed(2);
  const amp = floatAmp.toFixed(1);

  let styles = '';
  let animCss = '';

  switch (preset) {
    case 'float': {
      styles += `@keyframes lmb-physics {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-${amp}px); }
      }`;
      animCss = `animation:lmb-physics ${period}s ease-in-out 0s infinite;`;
      break;
    }
    case 'bounce': {
      // Bounce énergétique avec rebond sur la descente
      const dampenedAmp = (floatAmp * 0.7).toFixed(1);
      styles += `@keyframes lmb-physics {
        0%         { transform: translateY(0px); }
        35%        { transform: translateY(-${amp}px); }
        50%        { transform: translateY(-${(floatAmp*0.2).toFixed(1)}px); }
        65%        { transform: translateY(-${dampenedAmp}px); }
        80%        { transform: translateY(-${(floatAmp*0.1).toFixed(1)}px); }
        100%       { transform: translateY(0px); }
      }`;
      animCss = `animation:lmb-physics ${period}s cubic-bezier(.68,-.55,.27,1.55) 0s infinite;`;
      break;
    }
    case 'pendulum': {
      const rotAmp = Math.min(12, floatAmp * 1.5).toFixed(1);
      styles += `@keyframes lmb-physics {
        0%,100% { transform: rotate(0deg); }
        25%     { transform: rotate(-${rotAmp}deg); }
        75%     { transform: rotate(${rotAmp}deg); }
      }`;
      animCss = `animation:lmb-physics ${(+period*1.4).toFixed(2)}s ease-in-out 0s infinite;`;
      break;
    }
    case 'spring': {
      // Spring légèrement oscillant avec amortissement progressif
      const sp1 = (floatAmp * 0.9).toFixed(1);
      const sp2 = (floatAmp * 0.4).toFixed(1);
      const sp3 = (floatAmp * 0.15).toFixed(1);
      styles += `@keyframes lmb-physics {
        0%   { transform: translateY(0px); }
        15%  { transform: translateY(-${amp}px); }
        30%  { transform: translateY(-${sp1}px); }
        45%  { transform: translateY(-${sp2}px); }
        60%  { transform: translateY(-${sp3}px); }
        100% { transform: translateY(0px); }
      }`;
      animCss = `animation:lmb-physics ${period}s cubic-bezier(.22,1,.36,1) 0s infinite;`;
      break;
    }
    default: {
      styles += `@keyframes lmb-physics {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-${amp}px); }
      }`;
      animCss = `animation:lmb-physics ${period}s ease-in-out 0s infinite;`;
    }
  }

  return {
    styles,
    openTag:  `<g style="${animCss}">`,
    closeTag: `</g>`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 4 : VARIANCEENGINE → Paramètres de teinte pour le LLS
// ─────────────────────────────────────────────────────────────────────────────

export interface VarianceParams {
  hueShift:    number;
  satMult:     number;
  lightOffset: number;
  timingMult:  number;
  label:       string;
}

export function getVarianceParams(variantId: VariantId = 'A'): VarianceParams {
  return VARIANT_PROFILES[variantId] ?? VARIANT_PROFILES.A;
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION PRINCIPALE : assemble tous les modules
// ─────────────────────────────────────────────────────────────────────────────

export function buildLogoModuleBridge(
  sectorId: string,
  variantId: VariantId = 'A',
  r: number,
  accent: string,
  accentLight: string,
  animated: boolean,
): ModuleBridgeResult {

  if (!animated) {
    return {
      filterDefs: '',
      stylesCSS:  '',
      baseLayer:  '',
      innerWrap:  { openTag: '<g>', closeTag: '</g>' },
    };
  }

  const variance   = getVarianceParams(variantId);
  const timingMult = variance.timingMult;

  // ── 1. MorphingEngine ────────────────────────────────────────────────────
  const morph = buildMorphingSVG(sectorId, r, accent, accentLight, timingMult);

  // ── 2. LightingEngine ────────────────────────────────────────────────────
  const light = buildLightingSVG(sectorId, r, accent, accentLight, timingMult);

  // ── 3. PhysicsEngine ─────────────────────────────────────────────────────
  const phys  = buildPhysicsSVG(sectorId, timingMult);

  // Assemblage
  return {
    filterDefs: [morph.defs, light.defs].filter(Boolean).join('\n'),
    stylesCSS:  [morph.styles, light.styles, phys.styles].filter(Boolean).join('\n'),
    baseLayer:  `
      <!-- ── LightingEngine — glow ambiant sectoriel ── -->
      ${light.elements}
      <!-- ── MorphingEngine — morphing anneau sectoriel ── -->
      ${morph.elements}`,
    innerWrap: {
      openTag:  phys.openTag,
      closeTag: phys.closeTag,
    },
  };
}
