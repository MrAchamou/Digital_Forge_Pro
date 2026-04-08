/**
 * 💡 LIGHTING ENGINE — v2.0 (CSS Glow & Shadow Generator)
 *
 * Génère des effets de lumière CSS réalistes pour signatures email :
 * halos pulsants, drop-shadows layered, profondeur de carte, ambient glow.
 *
 * Inspiré des effets premium : NEON GLOW, ELECTRIC HOVER, SOUL AURA,
 * SPARKLE AURA, HOLOGRAM, ENERGY IONIZE.
 *
 * OUTPUT : CSS @keyframes de glow + variables de lumière + classes injectables.
 *
 * @version 2.0.0
 * @server-side true
 */

export const ENGINE_VERSION = '2.0.0';
const PHI = 1.6180339887;

export type LightingStyle = 'neon' | 'soft' | 'dramatic' | 'subtle' | 'electric' | 'aura';

interface SectorLightingProfile {
  style:         LightingStyle;
  glowIntensity: number;   // 0.1 - 1.0
  shadowDepth:   'flat' | 'medium' | 'deep';
  pulseSpeed:    number;   // multiplicateur de durée
  colorShift:    number;   // degré de rotation hue pour le glow (-30 à +30)
  cardDepth:     boolean;  // active box-shadow multicouche pour la carte
}

const SECTOR_LIGHTING: Record<string, SectorLightingProfile> = {
  tech:         { style: 'electric', glowIntensity: 0.85, shadowDepth: 'deep',   pulseSpeed: 1.2, colorShift:  10, cardDepth: true  },
  startup:      { style: 'neon',     glowIntensity: 0.90, shadowDepth: 'deep',   pulseSpeed: 1.4, colorShift:  15, cardDepth: true  },
  sante:        { style: 'soft',     glowIntensity: 0.45, shadowDepth: 'flat',   pulseSpeed: 0.6, colorShift: -10, cardDepth: false },
  beaute:       { style: 'aura',     glowIntensity: 0.70, shadowDepth: 'medium', pulseSpeed: 0.8, colorShift:  20, cardDepth: true  },
  finance:      { style: 'subtle',   glowIntensity: 0.30, shadowDepth: 'medium', pulseSpeed: 0.5, colorShift:   0, cardDepth: true  },
  juridique:    { style: 'subtle',   glowIntensity: 0.25, shadowDepth: 'flat',   pulseSpeed: 0.4, colorShift:  -5, cardDepth: false },
  creative:     { style: 'dramatic', glowIntensity: 0.95, shadowDepth: 'deep',   pulseSpeed: 1.5, colorShift:  25, cardDepth: true  },
  immobilier:   { style: 'soft',     glowIntensity: 0.40, shadowDepth: 'medium', pulseSpeed: 0.6, colorShift:   5, cardDepth: true  },
  restauration: { style: 'aura',     glowIntensity: 0.60, shadowDepth: 'medium', pulseSpeed: 0.9, colorShift:  15, cardDepth: true  },
  sport:        { style: 'electric', glowIntensity: 0.95, shadowDepth: 'deep',   pulseSpeed: 1.8, colorShift:  20, cardDepth: true  },
  default:      { style: 'soft',     glowIntensity: 0.50, shadowDepth: 'medium', pulseSpeed: 0.8, colorShift:   0, cardDepth: true  },
};

function getSectorLighting(sectorId: string): SectorLightingProfile {
  const key = (sectorId || '').toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/\s+/g, '');
  return Object.entries(SECTOR_LIGHTING).find(([k]) => key.includes(k))?.[1]
    ?? SECTOR_LIGHTING.default;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16), parseInt(r[2],16), parseInt(r[3],16)] : [99,102,241];
}

function lighten(hex: string, amt: number): string {
  const [r,g,b] = hexToRgb(hex);
  const c = (v: number) => Math.min(255, Math.max(0, Math.round(v + amt))).toString(16).padStart(2,'0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function buildLightingCSS(sectorId: string, accentColor: string, colorScheme: string): string {
  const profile = getSectorLighting(sectorId);
  const [r, g, b] = hexToRgb(accentColor);
  const isDark = colorScheme === 'dark';
  const gi = profile.glowIntensity;
  const speed = (3.2 / profile.pulseSpeed).toFixed(2);
  const speedFast = (speed / PHI).toFixed(2);

  // ── Glow avatar (halo animé autour du cercle avatar)
  const glowMin = (gi * 0.3).toFixed(2);
  const glowMax = (gi * 0.85).toFixed(2);
  const glowSpreadMin = Math.round(gi * 8);
  const glowSpreadMax = Math.round(gi * 22);
  const glowBlurMin   = Math.round(gi * 12);
  const glowBlurMax   = Math.round(gi * 32);

  const avatarGlowKF = `@keyframes sig-avatar-glow {
  0%,100% {
    filter: drop-shadow(0 0 ${glowBlurMin}px rgba(${r},${g},${b},${glowMin}))
            drop-shadow(0 0 ${glowSpreadMin}px rgba(${r},${g},${b},${(+glowMin*.5).toFixed(2)}));
  }
  50% {
    filter: drop-shadow(0 0 ${glowBlurMax}px rgba(${r},${g},${b},${glowMax}))
            drop-shadow(0 0 ${glowSpreadMax}px rgba(${r},${g},${b},${(+glowMax*.6).toFixed(2)}))
            drop-shadow(0 0 ${Math.round(glowBlurMax*1.5)}px rgba(${r},${g},${b},${(+glowMin*.3).toFixed(2)}));
  }
}`;

  // ── Glow barre accent (côté gauche de la carte)
  const barGlowKF = `@keyframes sig-bar-glow {
  0%,100% { box-shadow: 2px 0 ${Math.round(gi*8)}px rgba(${r},${g},${b},${(gi*.4).toFixed(2)}); }
  50%     { box-shadow: 2px 0 ${Math.round(gi*20)}px rgba(${r},${g},${b},${(gi*.8).toFixed(2)}),
                        2px 0 ${Math.round(gi*35)}px rgba(${r},${g},${b},${(gi*.3).toFixed(2)}); }
}`;

  // ── Pulse néon sur le CTA
  const ctaGlowKF = `@keyframes sig-cta-glow {
  0%,100% { box-shadow: 0 0 ${Math.round(gi*6)}px rgba(${r},${g},${b},${(gi*.5).toFixed(2)}),
                        0 2px ${Math.round(gi*10)}px rgba(${r},${g},${b},${(gi*.3).toFixed(2)}); }
  50%     { box-shadow: 0 0 ${Math.round(gi*14)}px rgba(${r},${g},${b},${(gi*.9).toFixed(2)}),
                        0 2px ${Math.round(gi*22)}px rgba(${r},${g},${b},${(gi*.5).toFixed(2)}),
                        0 0 ${Math.round(gi*30)}px rgba(${r},${g},${b},${(gi*.2).toFixed(2)}); }
}`;

  // ── Ambient glow de la carte entière (style selon profil)
  let cardShadow = '';
  if (profile.cardDepth) {
    const depth = profile.shadowDepth;
    const bg = isDark ? '0,0,0' : '0,0,0';
    const shadowLayers = depth === 'deep'
      ? `0 4px 6px rgba(${bg},.07),0 8px 15px rgba(${bg},.10),0 20px 40px rgba(${bg},.12),0 0 ${Math.round(gi*25)}px rgba(${r},${g},${b},${(gi*.12).toFixed(2)})`
      : depth === 'medium'
      ? `0 2px 4px rgba(${bg},.06),0 6px 12px rgba(${bg},.08),0 0 ${Math.round(gi*15)}px rgba(${r},${g},${b},${(gi*.08).toFixed(2)})`
      : `0 1px 3px rgba(${bg},.05),0 3px 6px rgba(${bg},.06)`;

    cardShadow = `.sig-card { box-shadow: ${shadowLayers}; border: 1px solid rgba(${r},${g},${b},${(gi*.12).toFixed(2)}); }`;
  }

  // ── Style-specific extras
  let extraCSS = '';
  if (profile.style === 'electric') {
    extraCSS = `@keyframes sig-electric-flicker {
  0%,95%,100% { opacity: 1; }
  96% { opacity: .85; }
  97% { opacity: 1; }
  98% { opacity: .9; }
}
.sig-avatar { animation: sig-avatar-glow ${speed}s ease-in-out infinite, sig-electric-flicker ${speedFast}s linear infinite; }`;
  } else if (profile.style === 'neon') {
    extraCSS = `.sig-avatar { animation: sig-avatar-glow ${speed}s ease-in-out infinite; }
.sig-name { text-shadow: 0 0 ${Math.round(gi*8)}px rgba(${r},${g},${b},${(gi*.4).toFixed(2)}); }`;
  } else if (profile.style === 'dramatic') {
    extraCSS = `.sig-avatar { animation: sig-avatar-glow ${speedFast}s ease-in-out infinite; }
.sig-title { text-shadow: 0 0 ${Math.round(gi*6)}px rgba(${r},${g},${b},${(gi*.5).toFixed(2)}); }
.sig-cta { animation: sig-cta-glow ${speed}s ease-in-out infinite; }`;
  } else if (profile.style === 'aura') {
    const accentAlt = lighten(accentColor, 30);
    extraCSS = `@keyframes sig-aura-rotate {
  0%   { background: radial-gradient(circle at 30% 40%, rgba(${r},${g},${b},${(gi*.25).toFixed(2)}) 0%, transparent 60%); }
  50%  { background: radial-gradient(circle at 70% 60%, rgba(${r},${g},${b},${(gi*.35).toFixed(2)}) 0%, transparent 60%); }
  100% { background: radial-gradient(circle at 30% 40%, rgba(${r},${g},${b},${(gi*.25).toFixed(2)}) 0%, transparent 60%); }
}
.sig-avatar { animation: sig-avatar-glow ${speed}s ease-in-out infinite; }
.sig-card::before { content:''; position:absolute; inset:0; border-radius:inherit; animation:sig-aura-rotate ${(+speed*1.5).toFixed(2)}s ease-in-out infinite; pointer-events:none; }`;
  } else {
    // soft / subtle
    extraCSS = `.sig-avatar { animation: sig-avatar-glow ${speed}s ease-in-out infinite; }`;
  }

  const rootVars = `:root {
  --sig-glow-color: rgba(${r},${g},${b},${gi.toFixed(2)});
  --sig-glow-intensity: ${gi.toFixed(2)};
  --sig-glow-speed: ${speed}s;
  --sig-lighting-style: "${profile.style}";
  --sig-shadow-depth: "${profile.shadowDepth}";
}`;

  const reducedMotion = `@media (prefers-reduced-motion: reduce) {
  .sig-avatar, .sig-bar, .sig-cta { animation: none !important; filter: none !important; }
}`;

  return [
    `/* ── LightingEngine v${ENGINE_VERSION} — ${profile.style} | glow:${gi.toFixed(1)} | ${sectorId} */`,
    rootVars,
    avatarGlowKF,
    barGlowKF,
    ctaGlowKF,
    `.sig-bar { animation: sig-bar-glow ${speed}s ease-in-out infinite; }`,
    cardShadow,
    extraCSS,
    reducedMotion,
  ].filter(Boolean).join('\n\n');
}

export const LIGHTING_VERSION = ENGINE_VERSION;
console.log(`💡 LightingEngine v${ENGINE_VERSION} chargé — 6 styles | GlowPulse | CardDepth | SectorAware(10) | WCAG-safe`);
