// ══════════════════════════════════════════════════════════════════════════════
//  GIF Effect Engine — SVG Translation Layer
//  Traduit l'ADN mathématique des 55 effets premium en SVG pur (rendu Sharp)
//
//  Chaque effet est une fonction pure :
//    (t: 0→1, meta, phase) => string  (fragments SVG)
//
//  Le moteur sélectionne 3-4 effets selon le secteur + palette et les
//  applique en calques sur chaque frame du GIF.
// ══════════════════════════════════════════════════════════════════════════════

export type AnimPhase = 'BUILD' | 'LIVE' | 'SHINE';

export interface EffectCtx {
  t: number;        // temps global 0→1 (boucle complète)
  tPhase: number;   // temps dans la phase courante 0→1
  phase: AnimPhase;
  accent: string;
  accentRgb: [number, number, number];
  bg: string;
  textColor: string;
  frameIdx: number;
  totalFrames: number;
  width: number;
  height: number;
}

type EffectFn = (ctx: EffectCtx) => string;

// ─── Helpers mathématiques ────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const PHI = 1.6180339887;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }
function easeOut3(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function sin01(t: number) { return (Math.sin(t) + 1) / 2; }

function rgba(rgb: [number, number, number], a: number) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${clamp(a).toFixed(3)})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [99, 102, 241];
}

function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const c = (v: number) => Math.min(255, Math.max(0, Math.round(v + amt))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

// ─── Seed déterministe pour positions stables entre frames ───────────────────

function seededPoints(n: number, seed: number, xRange: [number, number], yRange: [number, number]) {
  return Array.from({ length: n }, (_, i) => ({
    x: xRange[0] + ((i * 137.508 + seed * 31.41) % 1) * (xRange[1] - xRange[0]),
    y: yRange[0] + ((i * 97.316 + seed * 17.13) % 1) * (yRange[1] - yRange[0]),
    phase: (i * 0.618 * TAU) % TAU,
    speed: 0.5 + ((i * 0.382) % 1) * 1.5,
    size: 0.8 + ((i * 0.271) % 1) * 2.2,
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 1 — NEURAL PULSE (inspiré NEURAL PULSE + DNA BUILD)
//  Réseau de nœuds synaptiques interconnectés qui pulsent
// ══════════════════════════════════════════════════════════════════════════════

const neuralPulseEffect: EffectFn = (ctx) => {
  if (ctx.phase === 'BUILD' && ctx.tPhase < 0.3) return '';
  const { t, accentRgb, tPhase, phase } = ctx;
  const opacity = phase === 'BUILD' ? easeOut3(tPhase) : 1;

  const NODES = 8;
  const nodes = [
    { x: 140, y: 30 }, { x: 280, y: 20 }, { x: 400, y: 35 },
    { x: 520, y: 25 }, { x: 180, y: 160 }, { x: 330, y: 155 },
    { x: 460, y: 165 }, { x: 565, y: 150 },
  ];
  const EDGES = [[0,1],[1,2],[2,3],[1,5],[2,5],[4,5],[5,6],[6,7],[3,6],[0,4]];

  const pulseT = (t * TAU * 1.7);

  const svgLines = EDGES.map(([a, b]) => {
    const pulse = 0.1 + 0.15 * sin01(pulseT + a * 0.8);
    return `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}"
      stroke="${rgba(accentRgb, pulse * opacity)}" stroke-width="0.6"/>`;
  }).join('');

  const svgNodes = nodes.map((n, i) => {
    const nodeP = 0.15 + 0.35 * sin01(pulseT + i * PHI);
    const r = 1.5 + 1.5 * sin01(pulseT * 1.3 + i * 0.9);
    return `<circle cx="${n.x}" cy="${n.y}" r="${r.toFixed(1)}"
      fill="${rgba(accentRgb, nodeP * opacity)}" />`;
  }).join('');

  return `<!-- NEURAL PULSE -->${svgLines}${svgNodes}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 2 — SPARKLE AURA (inspiré SPARKLE AURA + STAR DUST FORM)
//  Étoiles scintillantes distribuées sur toute la signature
// ══════════════════════════════════════════════════════════════════════════════

const sparkleAuraEffect: EffectFn = (ctx) => {
  if (ctx.phase === 'BUILD' && ctx.tPhase < 0.5) return '';
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'BUILD' ? easeOut3(Math.max(0, (tPhase - 0.5) * 2)) : 1;

  const stars = seededPoints(24, 7, [110, 590], [5, 175]);

  return `<!-- SPARKLE AURA -->${stars.map((s, i) => {
    const blink = sin01(t * TAU * s.speed + s.phase);
    const twinkle = Math.pow(blink, 3); // très piqué
    const op = twinkle * 0.7 * masterOp;
    if (op < 0.02) return '';

    const r = s.size * (0.5 + 0.5 * twinkle);
    // Étoile à 4 branches (SVG path)
    const arm = r * 2.5;
    return `<g transform="translate(${s.x.toFixed(1)},${s.y.toFixed(1)})">
      <path d="M0,-${arm.toFixed(1)} L${(r*0.3).toFixed(1)},0 L0,${arm.toFixed(1)} L-${(r*0.3).toFixed(1)},0 Z"
        fill="${rgba(accentRgb, op)}" />
      <path d="-${arm.toFixed(1)},0 L0,${(r*0.3).toFixed(1)} ${arm.toFixed(1)},0 L0,-${(r*0.3).toFixed(1)} Z"
        fill="${rgba(accentRgb, op * 0.7)}" />
      <circle r="${r.toFixed(1)}" fill="${rgba(accentRgb, op * 0.5)}" />
    </g>`;
  }).join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 3 — ORBITAL RINGS (inspiré ORBIT DANCE + GYROSCOPE SPIN)
//  Anneaux orbitaux autour de l'avatar à vitesses angulaires différentes
// ══════════════════════════════════════════════════════════════════════════════

const orbitalRingsEffect: EffectFn = (ctx) => {
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'BUILD' ? easeOut3(tPhase) * 0.6 : 0.6;

  // 3 orbites avec inclinaisons différentes (simulé en 2D avec ellipses)
  const rings = [
    { rx: 56, ry: 18, tilt: 0,   speed: 1.0,  op: 0.30, dotR: 2.5 },
    { rx: 62, ry: 22, tilt: 60,  speed: -0.7, op: 0.20, dotR: 2.0 },
    { rx: 70, ry: 14, tilt: 120, speed: 1.4,  op: 0.15, dotR: 1.8 },
  ];

  return `<!-- ORBITAL RINGS -->${rings.map((ring, ri) => {
    const angle = t * TAU * ring.speed + ri * TAU / 3;
    // Position du satellite sur l'ellipse
    const dotX = 60 + ring.rx * Math.cos(angle);
    const dotY = 90 + ring.ry * Math.sin(angle);

    return `<ellipse cx="60" cy="90" rx="${ring.rx}" ry="${ring.ry}"
      fill="none" stroke="${rgba(accentRgb, ring.op * masterOp)}"
      stroke-width="0.8" transform="rotate(${ring.tilt},60,90)"/>
    <circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="${ring.dotR}"
      fill="${rgba(accentRgb, (ring.op * 2.5) * masterOp)}" />`;
  }).join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 4 — ELECTRIC ARCS (inspiré ELECTRIC FORM + ENERGY IONIZE)
//  Arcs électriques qui jaillissent de l'avatar vers la signature
// ══════════════════════════════════════════════════════════════════════════════

const electricArcsEffect: EffectFn = (ctx) => {
  if (ctx.phase !== 'SHINE' && (ctx.phase !== 'LIVE' || ctx.tPhase < 0.6)) return '';
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'SHINE' ? sin01(ctx.tPhase * TAU * 2) * 0.8 :
                   (tPhase - 0.6) / 0.4 * 0.5;

  // 4 arcs qui partent du bord avatar vers des points de la signature
  const arcs = [
    { ex: 130, ey: 50 },
    { ex: 200, ey: 80 },
    { ex: 130, ey: 130 },
    { ex: 180, ey: 110 },
  ];

  return `<!-- ELECTRIC ARCS -->${arcs.map((arc, i) => {
    if (sin01(t * TAU * 3 + i * 1.7) < 0.6) return '';
    // Point de départ sur le bord de l'avatar (r≈52)
    const ang = Math.atan2(arc.ey - 90, arc.ex - 60);
    const sx = 60 + 52 * Math.cos(ang);
    const sy = 90 + 52 * Math.sin(ang);
    // Point de contrôle avec jitter
    const jitter = 15 * Math.sin(t * TAU * 7 + i * 2.3);
    const cx1 = (sx + arc.ex) / 2 + jitter;
    const cy1 = (sy + arc.ey) / 2 - jitter;
    const op = masterOp * sin01(t * TAU * 5 + i * PHI);
    return `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx1.toFixed(1)},${cy1.toFixed(1)} ${arc.ex},${arc.ey}"
      fill="none" stroke="${rgba(accentRgb, op)}" stroke-width="${(0.5 + op).toFixed(1)}"
      stroke-linecap="round"/>`;
  }).join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 5 — WAVE DISTORTION (inspiré WAVE DISTORTION + LIQUID STATE)
//  Lignes ondulantes en fond de signature
// ══════════════════════════════════════════════════════════════════════════════

const waveDistortionEffect: EffectFn = (ctx) => {
  if (ctx.phase === 'BUILD' && ctx.tPhase < 0.4) return '';
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'BUILD' ? easeOut3((tPhase - 0.4) / 0.6) * 0.15 : 0.15;

  const LINES = 5;
  const lines = Array.from({ length: LINES }, (_, li) => {
    const baseY = 20 + li * 35;
    const pts: string[] = [];
    for (let x = 110; x <= 590; x += 15) {
      const y = baseY +
        4 * Math.sin(x * 0.018 + t * TAU * 0.8 + li * 0.7) +
        2 * Math.sin(x * 0.032 + t * TAU * 1.3 + li * 1.1);
      pts.push(`${x},${y.toFixed(1)}`);
    }
    const op = (0.06 + 0.06 * sin01(t * TAU * 0.5 + li * 0.8)) * masterOp / 0.15;
    return `<polyline points="${pts.join(' ')}" fill="none"
      stroke="${rgba(accentRgb, op * masterOp / 0.15 * 0.15)}" stroke-width="0.7"/>`;
  });

  return `<!-- WAVE DISTORTION -->${lines.join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 6 — NEON GLOW (inspiré NEON GLOW + HOLOGRAM)
//  Halos lumineux qui pulsent sur les bords de la carte
// ══════════════════════════════════════════════════════════════════════════════

const neonGlowEffect: EffectFn = (ctx) => {
  if (ctx.phase === 'BUILD' && ctx.tPhase < 0.6) return '';
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'BUILD' ? easeOut3((tPhase - 0.6) / 0.4) : 1;

  const glow1 = 0.06 + 0.05 * sin01(t * TAU * 1.3);
  const glow2 = 0.04 + 0.04 * sin01(t * TAU * 0.9 + 1.2);
  const cornerGlow = 0.12 + 0.10 * sin01(t * TAU * 2.1);

  return `<!-- NEON GLOW -->
    <rect x="1" y="1" width="598" height="178" rx="10" fill="none"
      stroke="${rgba(accentRgb, glow1 * masterOp)}" stroke-width="2"/>
    <rect x="3" y="3" width="594" height="174" rx="9" fill="none"
      stroke="${rgba(accentRgb, glow2 * masterOp)}" stroke-width="1"/>
    <circle cx="10" cy="10" r="8" fill="${rgba(accentRgb, cornerGlow * masterOp)}"/>
    <circle cx="590" cy="10" r="8" fill="${rgba(accentRgb, cornerGlow * 0.7 * masterOp)}"/>
    <circle cx="590" cy="170" r="8" fill="${rgba(accentRgb, cornerGlow * 0.5 * masterOp)}"/>
    <circle cx="10" cy="170" r="8" fill="${rgba(accentRgb, cornerGlow * 0.6 * masterOp)}"/>`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 7 — PARTICLE STREAM (inspiré PARTICLE BUILD + STAR DUST FORM)
//  Flux de particules qui convergent vers l'avatar depuis la droite
// ══════════════════════════════════════════════════════════════════════════════

const particleStreamEffect: EffectFn = (ctx) => {
  const { t, accentRgb, tPhase, phase } = ctx;

  let masterOp: number;
  if (phase === 'BUILD') masterOp = easeOut3(tPhase) * 0.8;
  else if (phase === 'LIVE') masterOp = 0.8;
  else masterOp = 1 - tPhase * 0.5;

  const particles = seededPoints(18, 42, [110, 590], [10, 170]);

  return `<!-- PARTICLE STREAM -->${particles.map((p, i) => {
    // Phase de la particule : elle voyage de la droite vers l'avatar en BUILD
    let px = p.x, py = p.y, op: number;

    if (phase === 'BUILD') {
      // Voyage vers avatar (60, 90) pendant BUILD
      const tTravel = clamp((tPhase - (i / particles.length) * 0.5) * 2);
      px = lerp(p.x, 60, easeOut3(tTravel));
      py = lerp(p.y, 90, easeOut3(tTravel));
      op = tTravel < 0.95 ? sin01(tTravel * Math.PI) * 0.6 * masterOp : 0;
    } else {
      // En LIVE/SHINE : flottement orbital
      px = p.x + 3 * Math.sin(t * TAU * p.speed + p.phase);
      py = p.y + 2 * Math.cos(t * TAU * p.speed * 0.7 + p.phase + 1);
      op = (0.1 + 0.3 * sin01(t * TAU * p.speed * 1.5 + p.phase)) * masterOp;
    }

    return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${p.size.toFixed(1)}"
      fill="${rgba(accentRgb, op)}" />`;
  }).join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 8 — GLITCH SCAN (inspiré REALITY GLITCH + DIMENSION SHIFT)
//  Lignes de scan glitch qui traversent la signature
// ══════════════════════════════════════════════════════════════════════════════

const glitchScanEffect: EffectFn = (ctx) => {
  if (ctx.phase !== 'SHINE') return '';
  const { t, accentRgb, tPhase } = ctx;

  const lines = Array.from({ length: 4 }, (_, i) => {
    const trigger = sin01(t * TAU * 4.3 + i * 1.9);
    if (trigger < 0.75) return '';
    const y = 10 + ((i * 47 + Math.floor(t * 8) * 17) % 160);
    const h = 1 + (i % 3);
    const op = (trigger - 0.75) * 4 * 0.4;
    const xShift = (i % 2 === 0 ? 1 : -1) * 5 * trigger;
    return `<rect x="${110 + xShift}" y="${y}" width="460" height="${h}"
      fill="${rgba(accentRgb, op)}" opacity="${op.toFixed(3)}" rx="1"/>`;
  });

  return `<!-- GLITCH SCAN -->${lines.join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 9 — CRYSTAL FACETS (inspiré CRYSTAL GROW + ICE FREEZE)
//  Facettes géométriques cristallines en fond
// ══════════════════════════════════════════════════════════════════════════════

const crystalFacetsEffect: EffectFn = (ctx) => {
  if (ctx.phase === 'BUILD' && ctx.tPhase < 0.5) return '';
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'BUILD' ? easeOut3((tPhase - 0.5) / 0.5) * 0.08 : 0.08;

  const FACETS = [
    { x: 490, y: 25,  size: 22, angle: 15 },
    { x: 555, y: 60,  size: 16, angle: 45 },
    { x: 510, y: 85,  size: 18, angle: -20 },
    { x: 560, y: 110, size: 14, angle: 60 },
    { x: 530, y: 140, size: 20, angle: 30 },
    { x: 480, y: 155, size: 12, angle: -45 },
  ];

  return `<!-- CRYSTAL FACETS -->${FACETS.map((f, i) => {
    const pulse = 0.3 + 0.7 * sin01(t * TAU * 0.8 + i * PHI);
    const a = (f.angle * Math.PI / 180) + t * 0.15;
    const s = f.size;
    const pts = [
      [f.x, f.y - s],
      [f.x + s * 0.7, f.y - s * 0.3],
      [f.x + s * 0.7, f.y + s * 0.5],
      [f.x, f.y + s],
      [f.x - s * 0.7, f.y + s * 0.5],
      [f.x - s * 0.7, f.y - s * 0.3],
    ].map(([px, py]) => {
      const dx = px - f.x, dy = py - f.y;
      return `${(f.x + dx * Math.cos(a) - dy * Math.sin(a)).toFixed(1)},${(f.y + dx * Math.sin(a) + dy * Math.cos(a)).toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="${rgba(accentRgb, pulse * masterOp * 0.5)}"
      stroke="${rgba(accentRgb, pulse * masterOp * 2)}" stroke-width="0.5"/>`;
  }).join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 10 — MAGNETIC FIELD LINES (inspiré MAGNETIC FIELD + FLOAT PHYSICS)
//  Lignes de champ magnétique courbées autour de l'avatar
// ══════════════════════════════════════════════════════════════════════════════

const magneticFieldEffect: EffectFn = (ctx) => {
  if (ctx.phase === 'BUILD' && ctx.tPhase < 0.7) return '';
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'BUILD' ? easeOut3((tPhase - 0.7) / 0.3) * 0.12 : 0.12;

  const fieldLines = Array.from({ length: 5 }, (_, i) => {
    const startAngle = (i / 5) * TAU + t * 0.4;
    const r1 = 58 + i * 4;
    const r2 = 90 + i * 12;
    const sx = 60 + r1 * Math.cos(startAngle);
    const sy = 90 + r1 * Math.sin(startAngle);
    const ex = 60 + r2 * Math.cos(startAngle + 0.8);
    const ey = 90 + r2 * Math.sin(startAngle + 0.8);
    const cpx = 60 + (r1 + r2) / 2 * Math.cos(startAngle + 0.4) + 20;
    const cpy = 90 + (r1 + r2) / 2 * Math.sin(startAngle + 0.4);
    const op = (0.4 + 0.4 * sin01(t * TAU + i * PHI)) * masterOp;
    return `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${cpx.toFixed(1)},${cpy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}"
      fill="none" stroke="${rgba(accentRgb, op)}" stroke-width="0.7"/>`;
  });

  return `<!-- MAGNETIC FIELD -->${fieldLines.join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 11 — ECHO TRAIL (inspiré ECHO TRAIL + TIME ECHO)
//  Copies fantômes décalées de la barre accent
// ══════════════════════════════════════════════════════════════════════════════

const echoTrailEffect: EffectFn = (ctx) => {
  if (ctx.phase === 'BUILD') return '';
  const { t, accentRgb } = ctx;

  const echoes = Array.from({ length: 3 }, (_, i) => {
    const delay = (i + 1) * 0.08;
    const tEcho = (t - delay + 1) % 1;
    const xShift = (i + 1) * 6;
    const h = 30 + 150 * easeInOut(Math.abs(Math.sin(tEcho * Math.PI)));
    const op = (0.04 - i * 0.01) * sin01(tEcho * TAU);
    return `<rect x="${xShift}" y="${(180 - h) / 2}" width="2" height="${h.toFixed(0)}"
      fill="${rgba(accentRgb, op)}" rx="1"/>`;
  });

  return `<!-- ECHO TRAIL -->${echoes.join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EFFET 12 — STELLAR DRIFT (inspiré STELLAR DRIFT + FLOAT DANCE)
//  Micro-étoiles qui dérivent lentement en fond
// ══════════════════════════════════════════════════════════════════════════════

const stellarDriftEffect: EffectFn = (ctx) => {
  const { t, accentRgb, tPhase, phase } = ctx;
  const masterOp = phase === 'BUILD' ? easeOut3(tPhase) * 0.3 : 0.3;

  const stars = seededPoints(30, 99, [110, 590], [5, 175]);

  return `<!-- STELLAR DRIFT -->${stars.map((s, i) => {
    const drift = t * 60 * s.speed;
    const px = ((s.x - 110 + drift) % 480) + 110;
    const py = s.y + 1.5 * Math.sin(t * TAU * 0.4 + s.phase);
    const twink = sin01(t * TAU * s.speed * 1.2 + s.phase);
    const op = twink * 0.25 * masterOp;
    return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(s.size * 0.5).toFixed(1)}"
      fill="${rgba(accentRgb, op)}" />`;
  }).join('')}`;
};

// ══════════════════════════════════════════════════════════════════════════════
//  REGISTRE DES EFFETS PAR CATÉGORIE DE SECTEUR
// ══════════════════════════════════════════════════════════════════════════════

type EffectSet = { name: string; fn: EffectFn }[];

const ALL_EFFECTS: Record<string, EffectFn> = {
  neuralPulse:      neuralPulseEffect,
  sparkleAura:      sparkleAuraEffect,
  orbitalRings:     orbitalRingsEffect,
  electricArcs:     electricArcsEffect,
  waveDistortion:   waveDistortionEffect,
  neonGlow:         neonGlowEffect,
  particleStream:   particleStreamEffect,
  glitchScan:       glitchScanEffect,
  crystalFacets:    crystalFacetsEffect,
  magneticField:    magneticFieldEffect,
  echoTrail:        echoTrailEffect,
  stellarDrift:     stellarDriftEffect,
};

// Preset par secteur — jusqu'à 5 effets combinés
const SECTOR_PRESETS: Record<string, string[]> = {
  // Tech / Digital
  technology:   ['neuralPulse', 'glitchScan', 'electricArcs', 'stellarDrift', 'neonGlow'],
  digital:      ['glitchScan', 'neuralPulse', 'particleStream', 'echoTrail', 'neonGlow'],
  startup:      ['particleStream', 'neuralPulse', 'electricArcs', 'sparkleAura', 'neonGlow'],
  // Santé / Bien-être
  sante:        ['orbitalRings', 'sparkleAura', 'waveDistortion', 'stellarDrift', 'neonGlow'],
  health:       ['orbitalRings', 'sparkleAura', 'waveDistortion', 'magneticField', 'neonGlow'],
  beaute:       ['sparkleAura', 'crystalFacets', 'waveDistortion', 'stellarDrift', 'neonGlow'],
  // Finance / Juridique
  finance:      ['crystalFacets', 'neonGlow', 'echoTrail', 'magneticField', 'waveDistortion'],
  juridique:    ['crystalFacets', 'echoTrail', 'magneticField', 'neonGlow', 'stellarDrift'],
  // Créatif / Design
  creative:     ['sparkleAura', 'crystalFacets', 'electricArcs', 'waveDistortion', 'neonGlow'],
  design:       ['sparkleAura', 'orbitalRings', 'waveDistortion', 'crystalFacets', 'neonGlow'],
  // Immobilier / Industrie
  immobilier:   ['magneticField', 'echoTrail', 'neonGlow', 'waveDistortion', 'stellarDrift'],
  industrie:    ['magneticField', 'electricArcs', 'echoTrail', 'particleStream', 'neonGlow'],
  // Sport
  sport:        ['particleStream', 'electricArcs', 'orbitalRings', 'neuralPulse', 'neonGlow'],
  // Default
  default:      ['orbitalRings', 'sparkleAura', 'waveDistortion', 'neonGlow', 'particleStream'],
};

// ── Sélection du preset selon le secteur ──────────────────────────────────────

export function selectEffectsForSector(secteur: string): EffectFn[] {
  const key = (secteur || '').toLowerCase()
    .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a')
    .replace(/[ùûü]/g, 'u').replace(/[îï]/g, 'i')
    .replace(/\s+/g, '');

  // Recherche par sous-chaîne
  const matchedKey = Object.keys(SECTOR_PRESETS).find(k => key.includes(k) || k.includes(key));
  const effectNames = SECTOR_PRESETS[matchedKey || 'default'];

  return effectNames.map(n => ALL_EFFECTS[n]).filter(Boolean);
}

// ── Zones géométriques de la signature (coordonnées absolues GIF 600×220) ────

export interface ZoneBounds {
  shape: 'rect' | 'circle';
  x?: number; y?: number; w?: number; h?: number;   // pour rect
  cx?: number; cy?: number; r?: number;              // pour circle
}

export const SIGNATURE_ZONES: Record<string, ZoneBounds> = {
  fond:     { shape: 'rect',   x: 0,   y: 0,   w: 600, h: 220 },   // fond entier
  avatar:   { shape: 'circle', cx: 60, cy: 110, r: 52 },            // cercle avatar
  nom:      { shape: 'rect',   x: 120, y: 44,   w: 380, h: 62 },   // nom + titre
  contact:  { shape: 'rect',   x: 120, y: 106,  w: 310, h: 80 },   // contacts
  cta:      { shape: 'rect',   x: 372, y: 126,  w: 160, h: 50 },   // bouton CTA
};

// Mapping nom public → clé interne de ALL_EFFECTS
export const EFFECT_DISPLAY_NAMES: Record<string, string> = {
  neuralPulse:    'Neural Pulse',
  sparkleAura:    'Sparkle Aura',
  orbitalRings:   'Orbital Rings',
  electricArcs:   'Electric Arcs',
  waveDistortion: 'Wave Distortion',
  neonGlow:       'Neon Glow',
  particleStream: 'Particle Stream',
  glitchScan:     'Glitch Scan',
  crystalFacets:  'Crystal Facets',
  magneticField:  'Magnetic Field',
  echoTrail:      'Echo Trail',
  stellarDrift:   'Stellar Drift',
};

// Type pour la combinaison d'effets par zone
export type ZoneEffectsMap = Partial<Record<keyof typeof SIGNATURE_ZONES, string[]>>;

// ─── Fonction principale : génère les fragments SVG d'effets pour une frame ──

export function renderEffectLayer(
  effects: EffectFn[],
  ctx: EffectCtx,
): string {
  return effects.map(fn => {
    try { return fn(ctx); }
    catch { return ''; }
  }).join('\n');
}

// ─── Rendu d'effets clippés par zone (Zone Effect Composer) ──────────────────

export function renderZonedEffects(
  zoneEffects: ZoneEffectsMap,
  ctx: EffectCtx,
  frameIdx: number,
): string {
  const parts: string[] = [];

  Object.entries(zoneEffects).forEach(([zoneName, effectIds]) => {
    if (!effectIds || effectIds.length === 0) return;
    const zone = SIGNATURE_ZONES[zoneName];
    if (!zone) return;

    const clipId = `zone-clip-${zoneName}-${frameIdx}`;

    // Générer le clipPath selon la géométrie de la zone
    let clipShape: string;
    if (zone.shape === 'circle') {
      clipShape = `<circle cx="${zone.cx}" cy="${zone.cy}" r="${zone.r}" />`;
    } else {
      clipShape = `<rect x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}" />`;
    }

    // Rendre chaque effet de la zone et le clipper
    const effectSvgs = effectIds.map(effectId => {
      const effectFn = ALL_EFFECTS[effectId];
      if (!effectFn) return '';
      try {
        const svgFragment = effectFn(ctx);
        if (!svgFragment.trim()) return '';
        // Intensité réduite quand multiple effets (évite la surcharge visuelle)
        const opacity = effectIds.length > 1 ? 0.65 : 0.85;
        return `<g opacity="${opacity}">${svgFragment}</g>`;
      } catch { return ''; }
    }).filter(Boolean).join('\n');

    if (!effectSvgs) return;

    parts.push(`
      <defs><clipPath id="${clipId}">${clipShape}</clipPath></defs>
      <g clip-path="url(#${clipId})">${effectSvgs}</g>
    `);
  });

  return parts.join('\n');
}

// ─── Résoudre un ZoneEffectsMap depuis les noms envoyés par le client ────────

export function resolveZoneEffects(raw: ZoneEffectsMap): ZoneEffectsMap {
  const resolved: ZoneEffectsMap = {};
  for (const [zone, ids] of Object.entries(raw)) {
    if (!ids) continue;
    const valid = ids.filter(id => ALL_EFFECTS[id]);
    if (valid.length > 0) resolved[zone as keyof typeof SIGNATURE_ZONES] = valid.slice(0, 3);
  }
  return resolved;
}

// ─── Construit un EffectCtx depuis les paramètres de frame ───────────────────

export function buildEffectCtx(opts: {
  frameIdx: number;
  totalFrames: number;
  phaseBuildup: number;
  phaseLive: number;
  accent: string;
  bg: string;
  textColor: string;
}): EffectCtx {
  const { frameIdx, totalFrames, phaseBuildup, phaseLive, accent, bg, textColor } = opts;
  const t = frameIdx / totalFrames;

  let phase: AnimPhase;
  let tPhase: number;
  if (frameIdx < phaseBuildup) {
    phase = 'BUILD';
    tPhase = frameIdx / phaseBuildup;
  } else if (frameIdx < phaseLive) {
    phase = 'LIVE';
    tPhase = (frameIdx - phaseBuildup) / (phaseLive - phaseBuildup);
  } else {
    phase = 'SHINE';
    tPhase = (frameIdx - phaseLive) / (totalFrames - phaseLive);
  }

  return {
    t, tPhase, phase,
    accent, bg, textColor,
    accentRgb: hexToRgb(accent),
    frameIdx, totalFrames,
    width: 600, height: 180,
  };
}
