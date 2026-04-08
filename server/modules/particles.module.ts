/**
 * 🌌 PARTICLES ENGINE — v2.0 (CSS Particle System Generator)
 *
 * Génère de vraies animations CSS de particules ambiantes pour signatures email.
 * Inspiré des 55 effets premium (STAR DUST FORM, SPARKLE AURA, FLOAT DANCE...).
 *
 * OUTPUT : blocs CSS @keyframes + variables custom injectables dans signatures.
 *
 * 6 styles de particules × 10 profils secteur × 3 tiers perf = comportement unique
 * garanti par seeding déterministe (pas de Math.random).
 *
 * @version 2.0.0
 * @server-side true
 */

export const ENGINE_VERSION = '2.0.0';
const PHI = 1.6180339887;

export type ParticleStyle = 'sparkle' | 'float' | 'drift' | 'orbit' | 'pulse' | 'smoke';

interface SectorParticleProfile {
  style:   ParticleStyle;
  count:   number;
  speed:   number;
  size:    number;
  opacity: number;
}

const SECTOR_PROFILES: Record<string, SectorParticleProfile> = {
  tech:         { style: 'drift',   count: 10, speed: 1.2, size: 2.0, opacity: 0.35 },
  startup:      { style: 'sparkle', count: 12, speed: 1.5, size: 2.5, opacity: 0.45 },
  sante:        { style: 'float',   count: 6,  speed: 0.7, size: 3.0, opacity: 0.25 },
  beaute:       { style: 'sparkle', count: 10, speed: 0.9, size: 2.0, opacity: 0.40 },
  finance:      { style: 'drift',   count: 5,  speed: 0.6, size: 1.5, opacity: 0.18 },
  juridique:    { style: 'pulse',   count: 4,  speed: 0.5, size: 2.0, opacity: 0.15 },
  creative:     { style: 'orbit',   count: 10, speed: 1.4, size: 3.0, opacity: 0.45 },
  immobilier:   { style: 'float',   count: 5,  speed: 0.7, size: 2.0, opacity: 0.20 },
  restauration: { style: 'smoke',   count: 7,  speed: 1.0, size: 3.5, opacity: 0.25 },
  sport:        { style: 'sparkle', count: 12, speed: 1.8, size: 2.0, opacity: 0.50 },
  default:      { style: 'float',   count: 6,  speed: 0.9, size: 2.0, opacity: 0.25 },
};

function getSectorProfile(sectorId: string): SectorParticleProfile {
  const key = (sectorId || '').toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/\s+/g, '');
  return Object.entries(SECTOR_PROFILES).find(([k]) => key.includes(k))?.[1]
    ?? SECTOR_PROFILES.default;
}

function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '99,102,241';
}

function dv(seed: number, i: number, min: number, max: number): number {
  const h = Math.abs(Math.sin(seed * 127.1 + i * 311.7)) * 43758.5453;
  return min + (h - Math.floor(h)) * (max - min);
}

function buildSparkleKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(3, i, 1.5, 4.5) * PHI).toFixed(2);
    const delay = dv(7, i, 0, 3).toFixed(2);
    const x1 = dv(11, i, -6, 6).toFixed(1), y1 = dv(13, i, -8, 8).toFixed(1);
    const sc = dv(5, i, 0.4, 1.2).toFixed(2);
    return `@keyframes sig-p${i}{0%{transform:translate(0,0) scale(0);opacity:0}20%{transform:translate(${x1}px,${y1}px) scale(${sc});opacity:1}60%{transform:translate(${(+x1*.5).toFixed(1)}px,${(+y1*1.2).toFixed(1)}px) scale(${(+sc*.8).toFixed(2)});opacity:.6}100%{transform:translate(0,0) scale(0);opacity:0}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-in-out infinite}`;
  }).join('\n');
}

function buildFloatKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(7, i, 3, 7) * PHI).toFixed(2);
    const delay = dv(17, i, 0, 4).toFixed(2);
    const x1 = dv(23, i, -10, 10).toFixed(1), y1 = dv(19, i, -15, -5).toFixed(1);
    const x2 = dv(29, i, -5, 5).toFixed(1), rot = dv(31, i, -180, 180).toFixed(0);
    return `@keyframes sig-p${i}{0%{transform:translate(0,0) rotate(0deg);opacity:0}15%{opacity:1}50%{transform:translate(${x1}px,${y1}px) rotate(${rot}deg);opacity:.8}85%{opacity:.4}100%{transform:translate(${x2}px,${(+y1*2).toFixed(1)}px) rotate(360deg);opacity:0}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-in-out infinite}`;
  }).join('\n');
}

function buildDriftKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = dv(11, i, 4, 9).toFixed(2);
    const delay = dv(41, i, 0, 5).toFixed(2);
    const dx = dv(37, i, 20, 80).toFixed(0), dy = dv(43, i, -20, 20).toFixed(0);
    const op1 = dv(7, i, 0.2, 0.6).toFixed(2), op2 = dv(9, i, 0.1, 0.4).toFixed(2);
    return `@keyframes sig-p${i}{0%{transform:translateX(0) translateY(0);opacity:0}10%{opacity:${op1}}90%{opacity:${op2}}100%{transform:translateX(${dx}px) translateY(${dy}px);opacity:0}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s linear infinite}`;
  }).join('\n');
}

function buildOrbitKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(13, i, 2, 6) * PHI).toFixed(2);
    const delay = dv(53, i, 0, 2).toFixed(2);
    const r = dv(59, i, 20, 50).toFixed(0);
    const a = dv(61, i, 0, 360).toFixed(0);
    const a2 = (+a + 180).toFixed(0), a3 = (+a + 360).toFixed(0);
    return `@keyframes sig-p${i}{0%{transform:rotate(${a}deg) translateX(${r}px) rotate(-${a}deg) scale(.8);opacity:.2}25%{opacity:.8}50%{transform:rotate(${a2}deg) translateX(${r}px) rotate(-${a2}deg) scale(1.2);opacity:.9}75%{opacity:.6}100%{transform:rotate(${a3}deg) translateX(${r}px) rotate(-${a3}deg) scale(.8);opacity:.2}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s linear infinite}`;
  }).join('\n');
}

function buildPulseKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(17, i, 1, 3) * PHI).toFixed(2);
    const delay = dv(67, i, 0, 3).toFixed(2);
    return `@keyframes sig-p${i}{0%,100%{transform:scale(.6);opacity:.1}50%{transform:scale(1.4);opacity:.5}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-in-out infinite}`;
  }).join('\n');
}

function buildSmokeKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = dv(19, i, 4, 10).toFixed(2);
    const delay = dv(71, i, 0, 4).toFixed(2);
    const dx = dv(73, i, -15, 15).toFixed(1);
    const op = dv(7, i, 0.15, 0.35).toFixed(2);
    return `@keyframes sig-p${i}{0%{transform:translate(0,0) scale(.5);opacity:0;filter:blur(0)}20%{opacity:${op}}100%{transform:translate(${dx}px,-30px) scale(2.5);opacity:0;filter:blur(3px)}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-out infinite}`;
  }).join('\n');
}

export function buildParticlesCSS(sectorId: string, accentColor: string, tier: string): string {
  const profile = getSectorProfile(sectorId);
  const count = tier === 'lite' ? Math.min(4, profile.count) :
                tier === 'ultra' ? Math.min(12, profile.count + 2) : profile.count;
  const rgb = hexToRgb(accentColor);
  const szMax = profile.size, szMin = Math.max(0.8, szMax - 1);

  const positions = Array.from({ length: count }, (_, i) => ({
    x: dv(89, i, 8, 92), y: dv(97, i, 8, 92),
  }));

  const KF_MAP = {
    sparkle: buildSparkleKF, float: buildFloatKF, drift: buildDriftKF,
    orbit: buildOrbitKF, pulse: buildPulseKF, smoke: buildSmokeKF,
  };
  const keyframes = KF_MAP[profile.style](count);

  const particleStyles = positions.map((pos, i) => {
    const sz = dv(101, i, szMin, szMax).toFixed(1);
    const op = (profile.opacity * dv(103, i, 0.6, 1.0)).toFixed(2);
    return `.sig-pt-${i}{position:absolute;left:${pos.x.toFixed(1)}%;top:${pos.y.toFixed(1)}%;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(${rgb},${op});pointer-events:none;z-index:0;will-change:transform,opacity}`;
  }).join('\n');

  return [
    `/* ── ParticlesEngine v${ENGINE_VERSION} — ${profile.style} | ${count} pts | ${sectorId} */`,
    `:root{--sig-particle-count:${count};--sig-particle-style:"${profile.style}";--sig-particle-color:rgba(${rgb},${profile.opacity});--sig-particle-speed:${profile.speed}}`,
    `.sig-particle-field{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}`,
    particleStyles,
    keyframes,
    `@media(prefers-reduced-motion:reduce){.sig-particle-field,.sig-particle-field *{display:none!important}}`,
  ].join('\n\n');
}

export const PARTICLES_VERSION = ENGINE_VERSION;
console.log(`🌌 ParticlesEngine v${ENGINE_VERSION} chargé — 6 styles | SectorAware(10) | DeterministicSeeding | perf-tier`);
