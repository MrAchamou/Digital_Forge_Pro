/**
 * ⚙️ PHYSICS ENGINE — v2.0 (Spring-Physics CSS Easing Generator)
 *
 * Calcule des courbes d'easing spring réalistes et génère des animations
 * d'entrée gravitationnelles pour les éléments de signature email.
 *
 * Inspiré des effets premium : FLOAT PHYSICS, GRAVITY REVERSE, MAGNETIC PULL,
 * PENDULUM SWING, ORBIT DANCE, GYROSCOPE SPIN, FLOAT DANCE.
 *
 * OUTPUT : CSS cubic-bezier calculés + @keyframes d'entrée physique.
 *
 * @version 2.0.0
 * @server-side true
 */

export const ENGINE_VERSION = '2.0.0';
const PHI = 1.6180339887;

export type PhysicsPreset = 'spring' | 'bounce' | 'gravity' | 'magnetic' | 'pendulum' | 'float';

interface PhysicsProfile {
  preset:    PhysicsPreset;
  mass:      number;    // 0.5 - 2.0
  stiffness: number;    // 50 - 400
  damping:   number;    // 5 - 60
  entryDir:  'top' | 'bottom' | 'left' | 'right' | 'fade' | 'scale';
  entryDist: number;    // px
  floatAmp:  number;    // amplitude du flottement résiduel
}

const SECTOR_PHYSICS: Record<string, PhysicsProfile> = {
  tech:         { preset: 'spring',    mass: 0.8, stiffness: 200, damping: 18, entryDir: 'bottom', entryDist: 30, floatAmp: 3  },
  startup:      { preset: 'bounce',    mass: 0.6, stiffness: 300, damping: 12, entryDir: 'bottom', entryDist: 40, floatAmp: 5  },
  sante:        { preset: 'float',     mass: 1.2, stiffness: 80,  damping: 30, entryDir: 'fade',   entryDist: 0,  floatAmp: 8  },
  beaute:       { preset: 'float',     mass: 0.9, stiffness: 100, damping: 22, entryDir: 'scale',  entryDist: 0,  floatAmp: 6  },
  finance:      { preset: 'gravity',   mass: 1.5, stiffness: 160, damping: 40, entryDir: 'top',    entryDist: 20, floatAmp: 1  },
  juridique:    { preset: 'gravity',   mass: 1.8, stiffness: 120, damping: 50, entryDir: 'left',   entryDist: 15, floatAmp: 0  },
  creative:     { preset: 'bounce',    mass: 0.5, stiffness: 350, damping: 10, entryDir: 'bottom', entryDist: 50, floatAmp: 8  },
  immobilier:   { preset: 'spring',    mass: 1.0, stiffness: 140, damping: 25, entryDir: 'bottom', entryDist: 25, floatAmp: 2  },
  restauration: { preset: 'pendulum',  mass: 1.1, stiffness: 110, damping: 20, entryDir: 'scale',  entryDist: 0,  floatAmp: 5  },
  sport:        { preset: 'bounce',    mass: 0.7, stiffness: 380, damping: 8,  entryDir: 'bottom', entryDist: 60, floatAmp: 6  },
  default:      { preset: 'spring',    mass: 1.0, stiffness: 150, damping: 22, entryDir: 'bottom', entryDist: 24, floatAmp: 4  },
};

function getSectorPhysics(sectorId: string): PhysicsProfile {
  const key = (sectorId || '').toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/\s+/g, '');
  return Object.entries(SECTOR_PHYSICS).find(([k]) => key.includes(k))?.[1]
    ?? SECTOR_PHYSICS.default;
}

// ─── Calcul Spring → cubic-bezier ─────────────────────────────────────────────

/**
 * Approximation d'un ressort amorti (Hooke) en cubic-bezier 4 points.
 * Basé sur l'équation : x(t) = 1 - e^(-ζωt) * cos(ωd*t)
 * où ωd = ω * sqrt(1 - ζ²) et ζ = damping/(2*sqrt(stiffness*mass))
 */
function springToCubicBezier(mass: number, stiffness: number, damping: number): string {
  const omega = Math.sqrt(stiffness / mass);
  const zeta  = damping / (2 * Math.sqrt(stiffness * mass));
  const zeta_clamped = Math.min(0.99, Math.max(0.01, zeta));

  if (zeta_clamped >= 1) {
    // Sur-amorti → ease-out classique
    return 'cubic-bezier(0.25, 1.0, 0.5, 1.0)';
  }

  // Sous-amorti — calcul des 2 handles intermédiaires
  const omegaD = omega * Math.sqrt(1 - zeta_clamped * zeta_clamped);
  const t1 = 1 / (omega * PHI);
  const y1 = 1 - Math.exp(-zeta_clamped * omega * t1) * Math.cos(omegaD * t1);

  const t2 = t1 * PHI;
  const y2 = 1 - Math.exp(-zeta_clamped * omega * t2) * Math.cos(omegaD * t2);

  // Normaliser t → [0,1] sur 3× la période
  const tNorm1 = Math.min(0.95, Math.max(0.05, t1 / (t2 * 3)));
  const tNorm2 = Math.min(0.95, Math.max(0.05, t2 / (t2 * 3)));
  const yN1    = Math.min(1.4, Math.max(-0.1, y1));
  const yN2    = Math.min(1.2, Math.max(-0.1, y2));

  return `cubic-bezier(${tNorm1.toFixed(3)},${yN1.toFixed(3)},${tNorm2.toFixed(3)},${yN2.toFixed(3)})`;
}

/** Courbe bounce — rebonds progressifs */
function buildBounceEasing(damping: number): string {
  const d = Math.max(8, Math.min(60, damping));
  const o = 1.0 + (60 - d) / 60 * 0.45;  // overshoot 0→0.45
  return `cubic-bezier(0.34,${o.toFixed(3)},0.64,1)`;
}

/** Courbe pendule — inertie et retour */
function buildPendulumEasing(mass: number): string {
  const h1 = Math.min(1.5, 0.6 + mass * 0.3);
  const h2 = Math.max(0.7, 1.1 - mass * 0.1);
  return `cubic-bezier(0.4,${h1.toFixed(3)},0.2,${h2.toFixed(3)})`;
}

/** Courbe magnétique — attraction progressive */
function buildMagneticEasing(): string {
  return `cubic-bezier(0.12,0.8,0.32,1.0)`;
}

// ─── Générateurs de keyframes d'entrée ────────────────────────────────────────

function buildEntryKF(profile: PhysicsProfile, easing: string, stagger: number): string {
  const dist = profile.entryDist;
  const dur = (0.6 + profile.mass * 0.2).toFixed(2);
  const dir = profile.entryDir;

  let from = '';
  if (dir === 'bottom') from = `transform:translateY(${dist}px);opacity:0`;
  else if (dir === 'top')   from = `transform:translateY(-${dist}px);opacity:0`;
  else if (dir === 'left')  from = `transform:translateX(-${dist}px);opacity:0`;
  else if (dir === 'right') from = `transform:translateX(${dist}px);opacity:0`;
  else if (dir === 'scale') from = `transform:scale(0.85);opacity:0`;
  else                       from = `opacity:0`;

  const zoneOrder = ['sig-logo', 'sig-avatar', 'sig-name', 'sig-title', 'sig-company', 'sig-contact', 'sig-cta'];
  const zoneCSS = zoneOrder.map((cls, i) => {
    const del = (i * stagger / 1000).toFixed(3);
    return `.${cls}{animation:sig-entry ${dur}s ${easing} ${del}s both}`;
  }).join('\n');

  const resetTo = dir === 'fade' ? 'opacity:1' :
                  dir === 'scale' ? 'transform:scale(1);opacity:1' :
                  'transform:translate(0,0);opacity:1';

  return `@keyframes sig-entry{0%{${from}}100%{${resetTo}}}
${zoneCSS}`;
}

/** Float résiduel — lévitation douce post-entrée */
function buildFloatResidualKF(amp: number, speed: number): string {
  if (amp <= 0) return '';
  const dur = (3.5 + amp * 0.3).toFixed(2);
  const del = (speed * 0.6).toFixed(2);
  return `@keyframes sig-float-residual {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  33%     { transform: translateY(-${(amp * 0.7).toFixed(1)}px) rotate(${(amp * 0.15).toFixed(2)}deg); }
  66%     { transform: translateY(${(amp * 0.4).toFixed(1)}px) rotate(-${(amp * 0.1).toFixed(2)}deg); }
}
.sig-avatar { animation-name: sig-avatar-morph, sig-float-residual; animation-duration: 4s, ${dur}s; animation-delay: 0s, ${del}s; animation-timing-function: ease-in-out, ease-in-out; animation-iteration-count: infinite, infinite; }`;
}

/** Pendule — oscillation douce pour logo ou avatar */
function buildPendulumKF(amp: number): string {
  const dur = (2.5 * PHI).toFixed(2);
  return `@keyframes sig-pendulum {
  0%   { transform: rotate(-${(amp * 2).toFixed(1)}deg) translateY(0); }
  25%  { transform: rotate(${(amp * 2).toFixed(1)}deg) translateY(-${(amp * 0.3).toFixed(1)}px); }
  50%  { transform: rotate(-${(amp * 1.5).toFixed(1)}deg) translateY(0); }
  75%  { transform: rotate(${(amp * 1.5).toFixed(1)}deg) translateY(-${(amp * 0.2).toFixed(1)}px); }
  100% { transform: rotate(-${(amp * 2).toFixed(1)}deg) translateY(0); }
}
.sig-logo { animation: sig-pendulum ${dur}s ease-in-out infinite; }`;
}

// ─── Stagger secteur ──────────────────────────────────────────────────────────

function getStagger(sectorId: string): number {
  const staggerMap: Record<string, number> = {
    tech: 80, startup: 60, sante: 150, beaute: 120, finance: 200,
    juridique: 250, creative: 50, immobilier: 140, restauration: 130, sport: 55,
  };
  const key = (sectorId || '').toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/\s+/g, '');
  return Object.entries(staggerMap).find(([k]) => key.includes(k))?.[1] ?? 120;
}

// ─── Générateur principal ──────────────────────────────────────────────────────

export function buildPhysicsCSS(sectorId: string, tier: string): string {
  const profile = getSectorPhysics(sectorId);
  const stagger = getStagger(sectorId);

  // Calcul de la courbe d'easing
  let easing: string;
  switch (profile.preset) {
    case 'bounce':    easing = buildBounceEasing(profile.damping);                              break;
    case 'pendulum':  easing = buildPendulumEasing(profile.mass);                              break;
    case 'magnetic':  easing = buildMagneticEasing();                                          break;
    default:          easing = springToCubicBezier(profile.mass, profile.stiffness, profile.damping); break;
  }

  const omega  = Math.sqrt(profile.stiffness / profile.mass);
  const zeta   = profile.damping / (2 * Math.sqrt(profile.stiffness * profile.mass));
  const period = (2 * Math.PI / (omega * Math.sqrt(Math.max(0.001, 1 - zeta * zeta)))).toFixed(3);

  const entryKF = buildEntryKF(profile, easing, stagger);

  const floatAmp = tier === 'lite' ? 0 : tier === 'ultra' ? profile.floatAmp * 1.5 : profile.floatAmp;
  const floatKF  = buildFloatResidualKF(floatAmp, +period);

  const pendulumKF = (profile.preset === 'pendulum' && floatAmp > 0)
    ? buildPendulumKF(floatAmp) : '';

  // Gravité CSS — accélération apparente (entrée plus naturelle)
  const gravityCSS = profile.entryDir === 'bottom' || profile.entryDir === 'top'
    ? `/* Gravity: g=${(profile.stiffness / profile.mass).toFixed(1)} u/s² | ζ=${zeta.toFixed(3)} */` : '';

  const rootVars = `:root {
  --sig-spring-ease: ${easing};
  --sig-physics-preset: "${profile.preset}";
  --sig-spring-mass: ${profile.mass};
  --sig-spring-stiffness: ${profile.stiffness};
  --sig-spring-damping: ${profile.damping};
  --sig-spring-period: ${period}s;
  --sig-entry-dir: "${profile.entryDir}";
  --sig-float-amp: ${floatAmp.toFixed(1)}px;
}`;

  const reducedMotion = `@media (prefers-reduced-motion: reduce) {
  .sig-logo, .sig-avatar, .sig-name, .sig-title, .sig-company, .sig-contact, .sig-cta {
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}`;

  return [
    `/* ── PhysicsEngine v${ENGINE_VERSION} — ${profile.preset} | m=${profile.mass} k=${profile.stiffness} d=${profile.damping} | ${sectorId} */`,
    gravityCSS,
    rootVars,
    entryKF,
    floatKF,
    pendulumKF,
    reducedMotion,
  ].filter(Boolean).join('\n\n');
}

export const PHYSICS_VERSION = ENGINE_VERSION;
console.log(`⚙️  PhysicsEngine v${ENGINE_VERSION} chargé — 6 presets | SpringCalc(Hooke) | StaggerEntry | FloatResidual | SectorAware(10)`);
