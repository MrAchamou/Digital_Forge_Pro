/**
 * 🌌 PARTICLES ENGINE — v3.0 (CSS Particle System Generator)
 *
 * Génère des particules CSS animées multi-couleurs avec halo lumineux,
 * inspirées de l'animation de fond du frontend (canvas particleBackground).
 *
 * Nouveautés v3 :
 * - Palette multi-couleurs par secteur (palette frontend : #00d4ff, #8b5cf6...)
 * - Glow box-shadow sur chaque particule (effet nébuleux lumineux)
 * - Color cycling : certaines particules changent de couleur
 * - Count augmenté (12-18), visibilité renforcée
 *
 * @version 3.0.0
 * @server-side true
 */

export const ENGINE_VERSION = '3.0.0';
const PHI = 1.6180339887;

export type ParticleStyle = 'sparkle' | 'float' | 'drift' | 'orbit' | 'pulse' | 'smoke';

interface SectorParticleProfile {
  style:    ParticleStyle;
  count:    number;
  speed:    number;
  size:     number;
  opacity:  number;
  palette:  string[];  // couleurs hex (4-6 couleurs)
}

const SECTOR_PROFILES: Record<string, SectorParticleProfile> = {
  tech:         { style: 'drift',   count: 14, speed: 1.2, size: 3.0, opacity: 0.55,
                  palette: ['#00d4ff','#8b5cf6','#0ea5e9','#a855f7','#22d3ee','#6366f1'] },
  startup:      { style: 'sparkle', count: 14, speed: 1.5, size: 2.5, opacity: 0.60,
                  palette: ['#ff006e','#8b5cf6','#00d4ff','#06b6d4','#a855f7','#f472b6'] },
  sante:        { style: 'float',   count: 8,  speed: 0.7, size: 3.0, opacity: 0.35,
                  palette: ['#06d6a0','#0ea5e9','#a8dadc','#34d399','#67e8f9','#4ade80'] },
  beaute:       { style: 'sparkle', count: 12, speed: 0.9, size: 2.5, opacity: 0.50,
                  palette: ['#ff89bb','#ff006e','#a855f7','#ffd6ff','#f9a8d4','#e879f9'] },
  finance:      { style: 'drift',   count: 8,  speed: 0.6, size: 2.0, opacity: 0.28,
                  palette: ['#c9b037','#b4b4b4','#0ea5e9','#fbbf24','#94a3b8','#38bdf8'] },
  juridique:    { style: 'pulse',   count: 6,  speed: 0.5, size: 2.0, opacity: 0.20,
                  palette: ['#495867','#bec5ad','#577590','#9ca3af','#64748b','#94a3b8'] },
  creative:     { style: 'orbit',   count: 14, speed: 1.4, size: 3.5, opacity: 0.55,
                  palette: ['#ff6b35','#f7d708','#ff006e','#8b5cf6','#06b6d4','#10b981'] },
  immobilier:   { style: 'float',   count: 8,  speed: 0.7, size: 2.5, opacity: 0.30,
                  palette: ['#06d6a0','#0ea5e9','#118ab2','#14b8a6','#38bdf8','#34d399'] },
  restauration: { style: 'smoke',   count: 10, speed: 1.0, size: 4.0, opacity: 0.35,
                  palette: ['#ff6b35','#ff9f1c','#e71d36','#fb923c','#fbbf24','#f87171'] },
  sport:        { style: 'sparkle', count: 14, speed: 1.8, size: 2.5, opacity: 0.65,
                  palette: ['#ff006e','#ff9f1c','#0ea5e9','#00d4ff','#f472b6','#38bdf8'] },
  default:      { style: 'float',   count: 8,  speed: 0.9, size: 2.5, opacity: 0.35,
                  palette: ['#00d4ff','#8b5cf6','#06b6d4','#a855f7','#0ea5e9','#22d3ee'] },
};

function getSectorProfile(sectorId: string): SectorParticleProfile {
  const key = (sectorId || '').toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/\s+/g, '');
  return Object.entries(SECTOR_PROFILES).find(([k]) => key.includes(k))?.[1]
    ?? SECTOR_PROFILES.default;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) }
           : { r: 99, g: 102, b: 241 };
}

function dv(seed: number, i: number, min: number, max: number): number {
  const h = Math.abs(Math.sin(seed * 127.1 + i * 311.7)) * 43758.5453;
  return min + (h - Math.floor(h)) * (max - min);
}

function buildSparkleKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(3, i, 1.5, 4.5) * PHI).toFixed(2);
    const delay = dv(7, i, 0, 4).toFixed(2);
    const x1 = dv(11, i, -8, 8).toFixed(1), y1 = dv(13, i, -12, 12).toFixed(1);
    const sc = dv(5, i, 0.3, 1.4).toFixed(2);
    return `@keyframes sig-p${i}{
  0%{transform:translate(0,0) scale(0);opacity:0;filter:blur(2px)}
  20%{transform:translate(${x1}px,${y1}px) scale(${sc});opacity:1;filter:blur(0)}
  60%{transform:translate(${(+x1*.5).toFixed(1)}px,${(+y1*1.3).toFixed(1)}px) scale(${(+sc*.7).toFixed(2)});opacity:.7}
  100%{transform:translate(0,0) scale(0);opacity:0;filter:blur(2px)}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-in-out infinite}`;
  }).join('\n');
}

function buildFloatKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(7, i, 4, 9) * PHI).toFixed(2);
    const delay = dv(17, i, 0, 5).toFixed(2);
    const x1 = dv(23, i, -12, 12).toFixed(1), y1 = dv(19, i, -18, -6).toFixed(1);
    const x2 = dv(29, i, -6, 6).toFixed(1);
    return `@keyframes sig-p${i}{
  0%{transform:translate(0,0);opacity:0;filter:blur(1px)}
  15%{opacity:1;filter:blur(0)}
  50%{transform:translate(${x1}px,${y1}px);opacity:.9}
  85%{opacity:.4}
  100%{transform:translate(${x2}px,${(+y1*2).toFixed(1)}px);opacity:0;filter:blur(2px)}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-in-out infinite}`;
  }).join('\n');
}

function buildDriftKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = dv(11, i, 5, 11).toFixed(2);
    const delay = dv(41, i, 0, 6).toFixed(2);
    const dx = dv(37, i, 15, 70).toFixed(0), dy = dv(43, i, -25, 25).toFixed(0);
    const op1 = dv(7, i, 0.4, 0.9).toFixed(2), op2 = dv(9, i, 0.2, 0.5).toFixed(2);
    return `@keyframes sig-p${i}{
  0%{transform:translateX(0) translateY(0) scale(.6);opacity:0}
  10%{opacity:${op1};transform:translateX(0) translateY(0) scale(1)}
  90%{opacity:${op2};transform:translateX(${dx}px) translateY(${dy}px) scale(.8)}
  100%{transform:translateX(${dx}px) translateY(${dy}px) scale(.4);opacity:0}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s linear infinite}`;
  }).join('\n');
}

function buildOrbitKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(13, i, 3, 7) * PHI).toFixed(2);
    const delay = dv(53, i, 0, 3).toFixed(2);
    const r = dv(59, i, 25, 60).toFixed(0);
    const a = dv(61, i, 0, 360).toFixed(0);
    return `@keyframes sig-p${i}{
  0%{transform:rotate(${a}deg) translateX(${r}px) rotate(-${a}deg) scale(.7);opacity:.2}
  25%{opacity:.9}
  50%{transform:rotate(${+a+180}deg) translateX(${r}px) rotate(-${+a+180}deg) scale(1.3);opacity:1}
  75%{opacity:.7}
  100%{transform:rotate(${+a+360}deg) translateX(${r}px) rotate(-${+a+360}deg) scale(.7);opacity:.2}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s linear infinite}`;
  }).join('\n');
}

function buildPulseKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = (dv(17, i, 1.5, 4) * PHI).toFixed(2);
    const delay = dv(67, i, 0, 4).toFixed(2);
    return `@keyframes sig-p${i}{
  0%,100%{transform:scale(.5);opacity:.1;filter:blur(1px)}
  50%{transform:scale(1.6);opacity:.7;filter:blur(0)}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-in-out infinite}`;
  }).join('\n');
}

function buildSmokeKF(n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const dur = dv(19, i, 5, 12).toFixed(2);
    const delay = dv(71, i, 0, 5).toFixed(2);
    const dx = dv(73, i, -20, 20).toFixed(1);
    const op = dv(7, i, 0.20, 0.45).toFixed(2);
    return `@keyframes sig-p${i}{
  0%{transform:translate(0,0) scale(.4);opacity:0;filter:blur(0)}
  20%{opacity:${op}}
  100%{transform:translate(${dx}px,-35px) scale(3);opacity:0;filter:blur(4px)}}
.sig-pt-${i}{animation:sig-p${i} ${dur}s ${delay}s ease-out infinite}`;
  }).join('\n');
}

export function buildParticlesCSS(sectorId: string, accentColor: string, tier: string): string {
  const profile = getSectorProfile(sectorId);
  const count = tier === 'lite'  ? Math.min(5,  profile.count) :
                tier === 'ultra' ? Math.min(16, profile.count + 2) : profile.count;

  const palette = profile.palette;

  const positions = Array.from({ length: count }, (_, i) => ({
    x: dv(89, i, 5, 95),
    y: dv(97, i, 5, 95),
  }));

  const KF_MAP = {
    sparkle: buildSparkleKF,
    float:   buildFloatKF,
    drift:   buildDriftKF,
    orbit:   buildOrbitKF,
    pulse:   buildPulseKF,
    smoke:   buildSmokeKF,
  };
  const keyframes = KF_MAP[profile.style](count);

  const particleStyles = positions.map((pos, i) => {
    const sz   = dv(101, i, Math.max(1.5, profile.size - 1.2), profile.size + 1).toFixed(1);
    const op   = (profile.opacity * dv(103, i, 0.65, 1.0)).toFixed(2);
    const hex  = palette[i % palette.length];
    const col  = hexToRgb(hex);
    const glow = (profile.opacity * 1.4 > 1 ? 1 : profile.opacity * 1.4).toFixed(2);
    const blurPx = Math.round(parseFloat(sz) * 5);
    return `.sig-pt-${i}{position:absolute;left:${pos.x.toFixed(1)}%;top:${pos.y.toFixed(1)}%;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(${col.r},${col.g},${col.b},${op});box-shadow:0 0 ${blurPx}px rgba(${col.r},${col.g},${col.b},${glow}),0 0 ${Math.round(blurPx*1.8)}px rgba(${col.r},${col.g},${col.b},${(parseFloat(glow)*.5).toFixed(2)});pointer-events:none;z-index:0;will-change:transform,opacity}`;
  }).join('\n');

  return [
    `/* ── ParticlesEngine v${ENGINE_VERSION} — ${profile.style} | ${count} pts | palette×${palette.length} | ${sectorId} */`,
    `.sig-particle-field{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}`,
    particleStyles,
    keyframes,
    `@media(prefers-reduced-motion:reduce){.sig-particle-field,.sig-particle-field *{display:none!important}}`,
  ].join('\n\n');
}

export const PARTICLES_VERSION = ENGINE_VERSION;
console.log(`🌌 ParticlesEngine v${ENGINE_VERSION} chargé — 6 styles | SectorAware(10) | DeterministicSeeding | perf-tier`);
