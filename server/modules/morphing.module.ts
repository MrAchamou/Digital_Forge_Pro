/**
 * 🔮 MORPHING ENGINE — v2.0 (CSS Keyframe Morphing Generator)
 *
 * Génère des animations de métamorphose CSS pour signatures email :
 * avatar qui change de forme, text-reveal via clip-path, micro-transformations.
 *
 * Inspiré des effets premium : LIQUID MORPH, MORPH 3D, MIRROR REALITY,
 * WAVE DISTORTION, DIMENSION SHIFT, CRYSTAL GROW.
 *
 * OUTPUT : CSS @keyframes morphing + classes injectables dans signatures.
 *
 * @version 2.0.0
 * @server-side true
 */

export const ENGINE_VERSION = '2.0.0';
const PHI = 1.6180339887;

export type MorphingStyle = 'liquid' | 'geometric' | 'reveal' | 'breathe' | 'elastic' | 'crystal';

interface SectorMorphProfile {
  style:        MorphingStyle;
  intensity:    number;     // 0.1 - 1.0 — amplitude des morphings
  speed:        number;     // multiplicateur de vitesse
  stagger:      number;     // délai entre zones (ms)
  textReveal:   boolean;    // text-reveal sur le nom
  avatarMorph:  boolean;    // shape-shifting de l'avatar
}

const SECTOR_MORPHING: Record<string, SectorMorphProfile> = {
  tech:         { style: 'geometric', intensity: 0.80, speed: 1.2, stagger: 120, textReveal: true,  avatarMorph: true  },
  startup:      { style: 'elastic',   intensity: 0.90, speed: 1.5, stagger: 80,  textReveal: true,  avatarMorph: true  },
  sante:        { style: 'breathe',   intensity: 0.40, speed: 0.6, stagger: 200, textReveal: false, avatarMorph: true  },
  beaute:       { style: 'liquid',    intensity: 0.75, speed: 0.9, stagger: 150, textReveal: true,  avatarMorph: true  },
  finance:      { style: 'reveal',    intensity: 0.35, speed: 0.7, stagger: 250, textReveal: true,  avatarMorph: false },
  juridique:    { style: 'reveal',    intensity: 0.25, speed: 0.5, stagger: 300, textReveal: true,  avatarMorph: false },
  creative:     { style: 'liquid',    intensity: 0.95, speed: 1.6, stagger: 60,  textReveal: true,  avatarMorph: true  },
  immobilier:   { style: 'breathe',   intensity: 0.50, speed: 0.7, stagger: 180, textReveal: false, avatarMorph: true  },
  restauration: { style: 'breathe',   intensity: 0.55, speed: 0.8, stagger: 160, textReveal: false, avatarMorph: true  },
  sport:        { style: 'elastic',   intensity: 0.90, speed: 1.8, stagger: 70,  textReveal: true,  avatarMorph: true  },
  crystal:      { style: 'crystal',   intensity: 0.80, speed: 1.0, stagger: 100, textReveal: true,  avatarMorph: true  },
  default:      { style: 'reveal',    intensity: 0.55, speed: 0.9, stagger: 150, textReveal: true,  avatarMorph: true  },
};

function getSectorMorphing(sectorId: string): SectorMorphProfile {
  const key = (sectorId || '').toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/\s+/g, '');
  return Object.entries(SECTOR_MORPHING).find(([k]) => key.includes(k))?.[1]
    ?? SECTOR_MORPHING.default;
}

function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '99,102,241';
}

// ─── Générateurs de keyframes ─────────────────────────────────────────────────

function buildLiquidAvatarKF(intensity: number, speed: number): string {
  const dur = (4.5 / speed * PHI).toFixed(2);
  const v = (n: number) => (50 + n * intensity * 20).toFixed(0) + '%';
  return `@keyframes sig-avatar-morph {
  0%   { border-radius: ${v(0)} ${v(.5)} ${v(.3)} ${v(.7)} / ${v(.4)} ${v(.2)} ${v(.6)} ${v(.3)}; }
  16%  { border-radius: ${v(.8)} ${v(-.2)} ${v(.6)} ${v(.1)} / ${v(.7)} ${v(.4)} ${v(-.1)} ${v(.5)}; }
  33%  { border-radius: ${v(.3)} ${v(.7)} ${v(-.1)} ${v(.8)} / ${v(.2)} ${v(.9)} ${v(.4)} ${v(-.2)}; }
  50%  { border-radius: ${v(.6)} ${v(.1)} ${v(.9)} ${v(-.3)} / ${v(.5)} ${v(.1)} ${v(.8)} ${v(.2)}; }
  66%  { border-radius: ${v(-.2)} ${v(.8)} ${v(.2)} ${v(.5)} / ${v(.9)} ${v(-.1)} ${v(.3)} ${v(.7)}; }
  83%  { border-radius: ${v(.5)} ${v(.3)} ${v(.7)} ${v(0)} / ${v(.1)} ${v(.6)} ${v(.2)} ${v(.8)}; }
  100% { border-radius: ${v(0)} ${v(.5)} ${v(.3)} ${v(.7)} / ${v(.4)} ${v(.2)} ${v(.6)} ${v(.3)}; }
}
.sig-avatar { animation: sig-avatar-morph ${dur}s ease-in-out infinite; }`;
}

function buildGeometricAvatarKF(intensity: number, speed: number): string {
  const dur = (3.5 / speed).toFixed(2);
  const i = intensity;
  return `@keyframes sig-avatar-morph {
  0%   { border-radius: 50%; transform: rotate(0deg) scale(1); }
  25%  { border-radius: ${Math.round(20*i)}% ${Math.round(80*i)}% ${Math.round(20*i)}% ${Math.round(80*i)}%; transform: rotate(${Math.round(45*i)}deg) scale(${(1+.05*i).toFixed(2)}); }
  50%  { border-radius: ${Math.round(10*i+5)}%; transform: rotate(${Math.round(90*i)}deg) scale(${(1-.03*i).toFixed(2)}); }
  75%  { border-radius: ${Math.round(80*i)}% ${Math.round(20*i)}% ${Math.round(80*i)}% ${Math.round(20*i)}%; transform: rotate(${Math.round(135*i)}deg) scale(${(1+.05*i).toFixed(2)}); }
  100% { border-radius: 50%; transform: rotate(360deg) scale(1); }
}
.sig-avatar { animation: sig-avatar-morph ${dur}s ease-in-out infinite; }`;
}

function buildBreatheAvatarKF(intensity: number, speed: number): string {
  const dur = (5.0 / speed).toFixed(2);
  const maxScale = (1 + 0.08 * intensity).toFixed(3);
  const minScale = (1 - 0.04 * intensity).toFixed(3);
  return `@keyframes sig-avatar-morph {
  0%,100% { transform: scale(1);           border-radius: 50%; }
  33%     { transform: scale(${maxScale}); border-radius: ${Math.round(45+5*intensity)}%; }
  66%     { transform: scale(${minScale}); border-radius: ${Math.round(55-5*intensity)}%; }
}
.sig-avatar { animation: sig-avatar-morph ${dur}s ease-in-out infinite; }`;
}

function buildElasticAvatarKF(intensity: number, speed: number): string {
  const dur = (2.8 / speed).toFixed(2);
  const sx = (1 + 0.12 * intensity).toFixed(3), sy = (1 - 0.10 * intensity).toFixed(3);
  const sx2 = (1 - 0.08 * intensity).toFixed(3), sy2 = (1 + 0.06 * intensity).toFixed(3);
  return `@keyframes sig-avatar-morph {
  0%   { transform: scale(1,1); border-radius: 50%; }
  20%  { transform: scale(${sx},${sy}); border-radius: 55% 45% 55% 45%; }
  40%  { transform: scale(${sx2},${sy2}); border-radius: 45% 55% 45% 55%; }
  60%  { transform: scale(${(1+.06*intensity).toFixed(3)},${(1-.04*intensity).toFixed(3)}); border-radius: 52% 48% 52% 48%; }
  80%  { transform: scale(${(1-.03*intensity).toFixed(3)},${(1+.04*intensity).toFixed(3)}); border-radius: 48% 52% 48% 52%; }
  100% { transform: scale(1,1); border-radius: 50%; }
}
.sig-avatar { animation: sig-avatar-morph ${dur}s cubic-bezier(.68,-.55,.27,1.55) infinite; }`;
}

function buildCrystalAvatarKF(intensity: number, speed: number): string {
  const dur = (4.0 / speed).toFixed(2);
  return `@keyframes sig-avatar-morph {
  0%   { border-radius: 50%; clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%); }
  25%  { border-radius: 30%; clip-path: polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%); }
  50%  { border-radius: 10%; clip-path: polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); }
  75%  { border-radius: 30%; clip-path: polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%); }
  100% { border-radius: 50%; clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%); }
}
.sig-avatar { animation: sig-avatar-morph ${dur}s ease-in-out infinite; }`;
}

function buildTextRevealKF(intensity: number, speed: number, stagger: number): string {
  const dur = (1.2 / speed * PHI).toFixed(2);
  const del = (stagger / 1000).toFixed(3);
  const del2 = (stagger * 2 / 1000).toFixed(3);
  const del3 = (stagger * 3 / 1000).toFixed(3);
  return `@keyframes sig-text-reveal {
  0%   { clip-path: inset(0 ${Math.round(100 - intensity*10)}% 0 0); opacity: 0; transform: translateY(${Math.round(6*intensity)}px); }
  60%  { opacity: 1; }
  100% { clip-path: inset(0 0% 0 0); opacity: 1; transform: translateY(0); }
}
.sig-name  { animation: sig-text-reveal ${dur}s cubic-bezier(.22,1,.36,1) 0.1s both; }
.sig-title { animation: sig-text-reveal ${dur}s cubic-bezier(.22,1,.36,1) ${del}s both; }
.sig-company { animation: sig-text-reveal ${dur}s cubic-bezier(.22,1,.36,1) ${del2}s both; }
.sig-contact { animation: sig-text-reveal ${(+dur*.8).toFixed(2)}s cubic-bezier(.22,1,.36,1) ${del3}s both; }`;
}

function buildEntryMorphKF(intensity: number, speed: number): string {
  const dur = (0.8 / speed).toFixed(2);
  const scale = (0.85 + 0.15 * (1 - intensity)).toFixed(3);
  return `@keyframes sig-card-entry {
  0%   { transform: translateY(${Math.round(12*intensity)}px) scale(${scale}); opacity: 0; }
  60%  { transform: translateY(${Math.round(-2*intensity)}px) scale(${(1+.01*intensity).toFixed(3)}); opacity: 1; }
  80%  { transform: translateY(${Math.round(1*intensity)}px) scale(1); }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
.sig-card { animation: sig-card-entry ${dur}s cubic-bezier(.22,1,.36,1) 0s both; }`;
}

export function buildMorphingCSS(sectorId: string, accentColor: string): string {
  const profile = getSectorMorphing(sectorId);
  const { style, intensity, speed, stagger, textReveal, avatarMorph } = profile;
  const rgb = hexToRgb(accentColor);

  const avatarKF = !avatarMorph ? '' :
    style === 'liquid'    ? buildLiquidAvatarKF(intensity, speed)    :
    style === 'geometric' ? buildGeometricAvatarKF(intensity, speed)  :
    style === 'breathe'   ? buildBreatheAvatarKF(intensity, speed)    :
    style === 'elastic'   ? buildElasticAvatarKF(intensity, speed)    :
    style === 'crystal'   ? buildCrystalAvatarKF(intensity, speed)    :
    buildBreatheAvatarKF(intensity, speed);

  const textKF = textReveal ? buildTextRevealKF(intensity, speed, stagger) : '';

  const entryKF = buildEntryMorphKF(intensity, speed);

  // Accent underline animé sur le nom
  const underlineKF = `@keyframes sig-underline-grow {
  0%   { transform: scaleX(0); transform-origin: left; opacity: 0; }
  100% { transform: scaleX(1); transform-origin: left; opacity: 1; }
}
.sig-name::after {
  content: '';
  display: block;
  height: 2px;
  background: rgba(${rgb}, 0.7);
  animation: sig-underline-grow ${(0.6/speed).toFixed(2)}s cubic-bezier(.22,1,.36,1) ${(stagger/1000).toFixed(3)}s both;
}`;

  const rootVars = `:root {
  --sig-morph-style: "${style}";
  --sig-morph-intensity: ${intensity.toFixed(2)};
  --sig-morph-speed: ${speed.toFixed(2)};
  --sig-morph-stagger: ${stagger}ms;
}`;

  const reducedMotion = `@media (prefers-reduced-motion: reduce) {
  .sig-avatar { animation: none !important; border-radius: 50% !important; clip-path: none !important; }
  .sig-name, .sig-title, .sig-company, .sig-contact, .sig-card { animation: none !important; opacity: 1 !important; clip-path: none !important; }
  .sig-name::after { animation: none !important; transform: scaleX(1) !important; opacity: 1 !important; }
}`;

  return [
    `/* ── MorphingEngine v${ENGINE_VERSION} — ${style} | intensity:${intensity.toFixed(1)} | ${sectorId} */`,
    rootVars,
    entryKF,
    avatarKF,
    textKF,
    underlineKF,
    reducedMotion,
  ].filter(Boolean).join('\n\n');
}

export const MORPHING_VERSION = ENGINE_VERSION;
console.log(`🔮 MorphingEngine v${ENGINE_VERSION} chargé — 6 styles | AvatarMorph | TextReveal | EntryAnim | SectorAware(10)`);
