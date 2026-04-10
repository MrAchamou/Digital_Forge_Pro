// ═══════════════════════════════════════════════════════════════════════════════
// LOGO LIVING SYSTEM — 8 Effets Spectaculaires avec Transitions Fluides
// ═══════════════════════════════════════════════════════════════════════════════
// Cycle total : 36s | 8 effets × 4.5s | Crossfade 0.4s
// Coordonnées : locales au groupe translate(cx,cy), centre = (0,0)
// ═══════════════════════════════════════════════════════════════════════════════
//
//  Effet 0  — NEON SPECTRUM     (NEON GLOW)       : anneau neon chromatique
//  Effet 1  — SOUL AURA         (SOUL AURA)        : 4 couches auriques émotionnelles
//  Effet 2  — ORBITAL DANCE     (ORBIT DANCE)      : ellipses orbitales en rotation
//  Effet 3  — HEARTBEAT         (HEARTBEAT)        : pulsations cardiaques en cascade
//  Effet 4  — ELECTRIC CORONA   (ELECTRIC FORM)    : arcs électriques crépitants
//  Effet 5  — PRISM BURST       (PRISM SPLIT)      : rayons prismatiques rotatifs
//  Effet 6  — QUANTUM PHASE     (QUANTUM PHASE)    : matérialisation quantique
//  Effet 7  — SPARKLE AURA      (SPARKLE AURA)     : aurore scintillante
// ═══════════════════════════════════════════════════════════════════════════════

const CYCLE_S  = 36;
const N_SLOTS  = 8;
const SLOT_S   = CYCLE_S / N_SLOTS; // 4.5s
const FADE_S   = 0.4;

function pct(s: number): string {
  return ((Math.min(s, CYCLE_S) / CYCLE_S) * 100).toFixed(2);
}

function hex2hsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const l = (max+min)/2;
  if (max===min) return [0,0,Math.round(l*100)];
  const d = max-min;
  const s2 = l > 0.5 ? d/(2-max-min) : d/(max+min);
  let h = max===r ? (g-b)/d+(g<b?6:0)
        : max===g ? (b-r)/d+2
        :            (r-g)/d+4;
  return [Math.round(h*60), Math.round(s2*100), Math.round(l*100)];
}

function lighten(hex: string, amt: number): string {
  if (!hex || hex.length < 7) return '#ffffff';
  const r = Math.min(255, parseInt(hex.slice(1,3),16)+amt);
  const g = Math.min(255, parseInt(hex.slice(3,5),16)+amt);
  const b = Math.min(255, parseInt(hex.slice(5,7),16)+amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Keyframe de slot : visible uniquement pendant sa plage de temps ──────────
function slotKF(name: string, slot: number): string {
  const s0 = slot * SLOT_S;
  const s1 = s0 + FADE_S;
  const s2 = (slot + 1) * SLOT_S - FADE_S;
  const s3 = (slot + 1) * SLOT_S;

  if (slot === 0) {
    return `@keyframes ${name} {
      0%           { opacity: 1; }
      ${pct(s2)}%  { opacity: 1; }
      ${pct(s3)}%  { opacity: 0; }
      ${pct(CYCLE_S - FADE_S)}% { opacity: 0; }
      100%         { opacity: 1; }
    }`;
  }
  return `@keyframes ${name} {
    0%           { opacity: 0; }
    ${pct(s0)}%  { opacity: 0; }
    ${pct(s1)}%  { opacity: 1; }
    ${pct(s2)}%  { opacity: 1; }
    ${pct(s3)}%  { opacity: 0; }
    100%         { opacity: 0; }
  }`;
}

// ── Slot wrapper : groupe avec animation de visibilité cyclique ───────────────
function slotGroup(id: string, slot: number, content: string): string {
  return `<g id="${id}" style="opacity:${slot===0?'1':'0'}; animation:${id}-slot ${CYCLE_S}s linear 0s infinite;">${content}</g>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export interface LogoLivingResult {
  defsHtml: string;    // à placer dans <defs>
  stylesCSS: string;   // à placer dans <style>
  elements: string;    // à insérer dans le groupe translate(cx,cy)
}

export function buildLogoLivingSystem(
  r: number,           // rayon du cercle avatar (ex: 50)
  accent: string,      // couleur principale
  accentLight: string, // couleur claire
  palette: string[],   // palette complète [bg, accent, text, ...]
): LogoLivingResult {

  const [h, s, l] = hex2hsl(accent.length === 7 ? accent : '#6366f1');
  const col1 = accent;
  const col2 = lighten(accent, 50);
  const col3 = `hsl(${(h+60)%360},${s}%,${l+10}%)`;   // +60° hue
  const col4 = `hsl(${(h+120)%360},${s}%,${l}%)`;     // +120°
  const col5 = `hsl(${(h+200)%360},${s}%,${l+5}%)`;   // +200°
  const col6 = `hsl(${(h+280)%360},${s}%,${l}%)`;     // +280°

  const allDefs: string[] = [];
  const allStyles: string[] = [];
  const allGroups: string[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 0 — NEON SPECTRUM (NEON GLOW)
  // Anneau unique qui cycle à travers le spectre de couleurs neon
  // Métriques NEON GLOW : intensite glow, vitesse pulsation
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-neon';
    const ringR = r + 6;
    allDefs.push(`
      <filter id="${id}-f" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`);
    allStyles.push(slotKF(`${id}-slot`, 0));
    allStyles.push(`
      @keyframes ${id}-ring {
        0%   { stroke: ${col1}; stroke-width: 2.5; r: ${ringR};   opacity: 0.9; }
        16%  { stroke: ${col3}; stroke-width: 3.5; r: ${ringR+3}; opacity: 1;   }
        33%  { stroke: ${col4}; stroke-width: 2;   r: ${ringR};   opacity: 0.7; }
        50%  { stroke: ${col5}; stroke-width: 3.5; r: ${ringR+4}; opacity: 1;   }
        66%  { stroke: ${col6}; stroke-width: 2;   r: ${ringR};   opacity: 0.8; }
        83%  { stroke: ${col2}; stroke-width: 3;   r: ${ringR+2}; opacity: 1;   }
        100% { stroke: ${col1}; stroke-width: 2.5; r: ${ringR};   opacity: 0.9; }
      }
      @keyframes ${id}-ring2 {
        0%,100% { r: ${ringR+10}; opacity: 0.35; stroke-width: 1.5; }
        50%     { r: ${ringR+16}; opacity: 0.6;  stroke-width: 0.8; }
      }
      @keyframes ${id}-ring3 {
        0%,100% { r: ${ringR+18}; opacity: 0.15; }
        50%     { r: ${ringR+28}; opacity: 0.35; }
      }`);
    allGroups.push(slotGroup(`${id}`, 0, `
      <circle r="${ringR}" fill="none" stroke="${col1}" stroke-width="2.5"
        filter="url(#${id}-f)"
        style="animation:${id}-ring 3s ease-in-out 0s infinite; transform-origin:0px 0px;"/>
      <circle r="${ringR+10}" fill="none" stroke="${col2}" stroke-width="1.5"
        style="animation:${id}-ring2 3s ease-in-out 0.5s infinite; transform-origin:0px 0px;"/>
      <circle r="${ringR+18}" fill="none" stroke="${col3}" stroke-width="0.8"
        style="animation:${id}-ring3 3.5s ease-in-out 1s infinite; transform-origin:0px 0px;"/>
    `));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 1 — SOUL AURA (SOUL AURA)
  // 4 couches auriques avec couleurs émotionnelles et rotation
  // Métriques : rythmeVital=1.2, 7 couches, sensibiliteEmotionnelle=0.6
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-soul';
    const emotHues = [h, (h+60)%360, (h+120)%360, (h+200)%360];
    allDefs.push(`
      <filter id="${id}-f" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`);
    allStyles.push(slotKF(`${id}-slot`, 1));
    const layers = emotHues.map((eh, k) => {
      const lr = r + 8 + k * 10;
      const dur = (3 + k * 0.4).toFixed(1);
      const rot = k % 2 === 0 ? 1 : -1;
      const col = `hsl(${eh},${s}%,${l+k*5}%)`;
      allStyles.push(`@keyframes ${id}-l${k} {
        0%,100% { transform: scale(1) rotate(0deg); opacity: ${(0.55 - k*0.08).toFixed(2)}; }
        30%     { transform: scale(${1+0.07+k*0.02}) rotate(${rot*8}deg); opacity: ${(0.85 - k*0.08).toFixed(2)}; }
        60%     { transform: scale(${1+0.04}) rotate(${rot*14}deg); opacity: ${(0.65 - k*0.07).toFixed(2)}; }
        80%     { transform: scale(${1+0.09}) rotate(${rot*18}deg); opacity: ${(0.9 - k*0.1).toFixed(2)}; }
      }`);
      return `<circle r="${lr}" fill="${col}" fill-opacity="${(0.3-k*0.05).toFixed(2)}"
        filter="url(#${id}-f)"
        style="animation:${id}-l${k} ${dur}s cubic-bezier(.4,0,.2,1) ${(k*0.35).toFixed(2)}s infinite; transform-origin:0px 0px;"/>`;
    });
    allGroups.push(slotGroup(`${id}`, 1, layers.join('\n')));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 2 — ORBITAL DANCE (ORBIT DANCE)
  // 4 ellipses orbitales pointillées avec points lumineux en orbite
  // Métriques : 100 particules → 4 orbites, périodes différenciées
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-orbit';
    allDefs.push(`
      <filter id="${id}-f" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`);
    allStyles.push(slotKF(`${id}-slot`, 2));
    const orbits = [
      { rx: r+10, ry: r+6,  dur: 4,   dir: 1,  col: col1, sw: 1.2, dash: '3 8',  dotR: 2.5 },
      { rx: r+18, ry: r+11, dur: 6,   dir:-1,  col: col3, sw: 0.9, dash: '2 12', dotR: 2   },
      { rx: r+26, ry: r+15, dur: 8.5, dir: 1,  col: col5, sw: 0.7, dash: '5 15', dotR: 1.5 },
      { rx: r+36, ry: r+20, dur: 11,  dir:-1,  col: col2, sw: 0.5, dash: '2 20', dotR: 1.2 },
    ];
    const orbitEls = orbits.map((o, k) => {
      allStyles.push(`@keyframes ${id}-rot${k} { from { transform:rotate(${k*40}deg); } to { transform:rotate(${k*40+o.dir*360}deg); } }`);
      return `<ellipse rx="${o.rx}" ry="${o.ry}" fill="none"
          stroke="${o.col}" stroke-width="${o.sw}" stroke-dasharray="${o.dash}" stroke-opacity="0.7"
          style="animation:${id}-rot${k} ${o.dur}s linear ${(k*0.5).toFixed(1)}s infinite; transform-origin:0px 0px;"/>
        <circle r="${o.dotR}" fill="${o.col}" fill-opacity="0.95" cx="${o.rx}" cy="0"
          filter="url(#${id}-f)"
          style="animation:${id}-rot${k} ${o.dur}s linear ${(k*0.5).toFixed(1)}s infinite; transform-origin:0px 0px;"/>`;
    });
    allGroups.push(slotGroup(`${id}`, 2, orbitEls.join('\n')));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 3 — HEARTBEAT (HEARTBEAT)
  // 3 ondes de choc cardiaques en cascade — rythme 72 BPM
  // Métriques : HEARTBEAT phases: systole(0.12s) + diastole(0.25s) + pause(0.46s)
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-hb';
    const bpm72 = 0.83; // ~0.83s par battement
    const wave = [
      { rBase: r+2,  rMax: r+22, op: 0.9, sw: 2.5, phD: 0          },
      { rBase: r+4,  rMax: r+30, op: 0.6, sw: 1.5, phD: bpm72/3    },
      { rBase: r+6,  rMax: r+38, op: 0.3, sw: 0.8, phD: bpm72*2/3  },
    ];
    allDefs.push(`
      <filter id="${id}-f" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`);
    allStyles.push(slotKF(`${id}-slot`, 3));
    allStyles.push(`@keyframes ${id}-core {
      0%,100% { transform: scale(1);    opacity: 0.8; }
      10%     { transform: scale(1.08); opacity: 1;   }
      20%     { transform: scale(0.97); opacity: 0.85;}
      30%     { transform: scale(1.04); opacity: 0.95;}
      40%     { transform: scale(1);    opacity: 0.8; }
    }`);
    const waveEls = wave.map((w, k) => {
      const totalDur = bpm72 * 2.4;
      allStyles.push(`@keyframes ${id}-w${k} {
        0%   { r: ${w.rBase}; opacity: ${w.op}; stroke-width: ${w.sw}; }
        18%  { r: ${w.rMax};  opacity: ${(w.op*0.4).toFixed(2)}; stroke-width: ${(w.sw*0.3).toFixed(1)}; }
        100% { r: ${w.rMax+8}; opacity: 0; stroke-width: 0; }
      }`);
      return `<circle r="${w.rBase}" fill="none" stroke="${col1}" stroke-width="${w.sw}"
        filter="url(#${id}-f)"
        style="animation:${id}-w${k} ${totalDur.toFixed(2)}s cubic-bezier(.22,1,.36,1) ${w.phD.toFixed(2)}s infinite; transform-origin:0px 0px;"/>`;
    });
    allGroups.push(slotGroup(`${id}`, 3, `
      <circle r="${r}" fill="${col1}" fill-opacity="0.06"
        style="animation:${id}-core ${bpm72*2.4}s ease-in-out 0s infinite; transform-origin:0px 0px;"/>
      ${waveEls.join('\n')}
    `));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 4 — ELECTRIC CORONA (ELECTRIC FORM)
  // 5 arcs électriques en rotation, dasharray décalé — intensite=0.8
  // Métriques : intensiteElectrique=0.8, nombreArcs=5, couleurElec
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-elec';
    const nArcs = 5;
    allDefs.push(`
      <filter id="${id}-f" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="b"/>
        <feColorMatrix type="matrix" in="b"
          values="1 0.5 0 0 0  0.5 1 0 0 0  0 0.5 1 0 0  0 0 0 0.9 0" result="c"/>
        <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`);
    allStyles.push(slotKF(`${id}-slot`, 4));
    const arcEls = Array.from({length: nArcs}, (_, k) => {
      const rx = r + 6 + k * 5;
      const ry = r + 4 + k * 3;
      const dash = Math.round(6 + k * 4);
      const arcCol = k % 2 === 0 ? col1 : col2;
      const dur = (1.8 + k * 0.35).toFixed(2);
      const dir = k % 2 === 0 ? 1 : -1;
      const dashTotal = dash * 3;
      allStyles.push(`@keyframes ${id}-arc${k} {
        0%   { stroke-dashoffset: 0;            opacity: 0.8; }
        50%  { stroke-dashoffset: ${-dashTotal}; opacity: 1;   }
        100% { stroke-dashoffset: ${-dashTotal*2}; opacity: 0.8; }
      }`);
      allStyles.push(`@keyframes ${id}-rot${k} { from { transform: rotate(${k*36}deg); } to { transform: rotate(${k*36+dir*360}deg); } }`);
      return `<ellipse rx="${rx}" ry="${ry}" fill="none"
          stroke="${arcCol}" stroke-width="${(1.8-k*0.2).toFixed(1)}"
          stroke-dasharray="${dash} ${dash*2}"
          filter="url(#${id}-f)"
          style="animation:${id}-rot${k} ${(3+k*0.8).toFixed(1)}s linear ${(k*0.2).toFixed(1)}s infinite, ${id}-arc${k} ${dur}s linear ${(k*0.3).toFixed(1)}s infinite; transform-origin:0px 0px;"/>`;
    });
    allGroups.push(slotGroup(`${id}`, 4, arcEls.join('\n')));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 5 — PRISM BURST (PRISM SPLIT)
  // 6 rayons lumineux prismatiques rotatifs avec couleurs spectrales
  // Métriques : PRISM SPLIT — décomposition spectrale en 6 axes
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-prism';
    const spectrumColors = [col1, col3, col4, col5, col6, col2];
    allDefs.push(`
      <filter id="${id}-f" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`);
    allStyles.push(slotKF(`${id}-slot`, 5));
    allStyles.push(`@keyframes ${id}-rot { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`);
    allStyles.push(`@keyframes ${id}-rot-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }`);
    allStyles.push(`@keyframes ${id}-ray-pulse {
      0%,100% { opacity: 0.7; stroke-width: 1.5; }
      50%     { opacity: 1;   stroke-width: 2.5; }
    }`);
    const rayEls = spectrumColors.map((rc, k) => {
      const angle = k * 60;
      const rInner = r + 4;
      const rOuter = r + 22 + (k % 3) * 8;
      const x1 = (rInner * Math.cos((angle * Math.PI) / 180)).toFixed(1);
      const y1 = (rInner * Math.sin((angle * Math.PI) / 180)).toFixed(1);
      const x2 = (rOuter * Math.cos((angle * Math.PI) / 180)).toFixed(1);
      const y2 = (rOuter * Math.sin((angle * Math.PI) / 180)).toFixed(1);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${rc}" stroke-width="1.5" stroke-linecap="round" opacity="0.8"
          filter="url(#${id}-f)"
          style="animation:${id}-ray-pulse ${(2+k*0.3).toFixed(1)}s ease-in-out ${(k*0.2).toFixed(1)}s infinite;"/>`;
    });
    allStyles.push(`@keyframes ${id}-halo {
      0%,100% { transform: scale(1); opacity: 0.4; }
      50%     { transform: scale(1.15); opacity: 0.6; }
    }`);
    allGroups.push(slotGroup(`${id}`, 5, `
      <g style="animation:${id}-rot 7s linear 0s infinite; transform-origin:0px 0px;">
        ${rayEls.join('\n')}
      </g>
      <g style="animation:${id}-rot-rev 11s linear 0s infinite; transform-origin:0px 0px;">
        ${spectrumColors.map((rc, k) => {
          const angle = k * 60 + 30;
          const rI = r + 6;
          const rO = r + 16;
          const x1 = (rI * Math.cos((angle * Math.PI) / 180)).toFixed(1);
          const y1 = (rI * Math.sin((angle * Math.PI) / 180)).toFixed(1);
          const x2 = (rO * Math.cos((angle * Math.PI) / 180)).toFixed(1);
          const y2 = (rO * Math.sin((angle * Math.PI) / 180)).toFixed(1);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${rc}" stroke-width="1" opacity="0.5"/>`;
        }).join('')}
      </g>
      <circle r="${r+28}" fill="none" stroke="${col2}" stroke-width="0.8" stroke-dasharray="4 8"
        style="animation:${id}-halo 4s ease-in-out 0s infinite, ${id}-rot 15s linear 0s infinite; transform-origin:0px 0px;"/>
    `));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 6 — QUANTUM PHASE (QUANTUM PHASE)
  // Matérialisation/dématérialisation quantique avec anneaux de phase
  // Métriques : particules=200, phases d'apparition/disparition
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-qph';
    allDefs.push(`
      <filter id="${id}-f" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feColorMatrix type="matrix" in="b"
          values="0 0 1 0 0  0 1 1 0 0  1 0 1 0 0  0 0 0 1 0" result="c"/>
        <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="${id}-rg" cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stop-color="${col1}" stop-opacity="0.5"/>
        <stop offset="60%" stop-color="${col5}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="${col6}" stop-opacity="0"/>
      </radialGradient>`);
    allStyles.push(slotKF(`${id}-slot`, 6));
    allStyles.push(`
      @keyframes ${id}-phase {
        0%,100% { transform: scale(1);    opacity: 1;   filter: none; }
        15%     { transform: scale(1.02); opacity: 0.6; filter: hue-rotate(60deg); }
        30%     { transform: scale(0.97); opacity: 0.9; filter: hue-rotate(120deg); }
        50%     { transform: scale(1.04); opacity: 0.4; filter: hue-rotate(220deg) brightness(1.5); }
        70%     { transform: scale(0.98); opacity: 0.85; filter: hue-rotate(300deg); }
        85%     { transform: scale(1.01); opacity: 1; filter: hue-rotate(360deg); }
      }
      @keyframes ${id}-ring1 {
        0%,100% { r: ${r+5};  opacity: 0.8; stroke-width: 2; }
        40%     { r: ${r+18}; opacity: 0.2; stroke-width: 0.5; }
        41%     { r: ${r+5};  opacity: 0; }
        42%     { r: ${r+5};  opacity: 0.8; stroke-width: 2; }
      }
      @keyframes ${id}-ring2 {
        0%,100% { r: ${r+12}; opacity: 0.5; }
        50%     { r: ${r+28}; opacity: 0; }
        51%     { r: ${r+12}; opacity: 0.5; }
      }
      @keyframes ${id}-bg {
        0%,100% { opacity: 0.3; transform: scale(1); }
        50%     { opacity: 0.6; transform: scale(1.2); }
      }`);
    allGroups.push(slotGroup(`${id}`, 6, `
      <circle r="${r+30}" fill="url(#${id}-rg)"
        style="animation:${id}-bg 2s ease-in-out 0s infinite; transform-origin:0px 0px;"/>
      <circle r="${r+5}" fill="none" stroke="${col4}" stroke-width="2"
        filter="url(#${id}-f)"
        style="animation:${id}-ring1 2s cubic-bezier(.25,0,.75,1) 0s infinite; transform-origin:0px 0px;"/>
      <circle r="${r+12}" fill="none" stroke="${col5}" stroke-width="1"
        style="animation:${id}-ring2 2s cubic-bezier(.25,0,.75,1) 0.3s infinite; transform-origin:0px 0px;"/>
    `));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EFFET 7 — SPARKLE AURA (SPARKLE AURA)
  // 12 étoiles scintillantes en orbite déterministe
  // Métriques : SPARKLE AURA — 300 particules, 6 catégories
  // ─────────────────────────────────────────────────────────────────────────
  {
    const id = 'lls-spk';
    allDefs.push(`
      <filter id="${id}-f" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`);
    allStyles.push(slotKF(`${id}-slot`, 7));
    // Génère N étoiles à des positions orbitales déterministes
    const nStars = 12;
    const rng = (seed: number) => { const x = Math.sin(seed*127.1)*43758.5453; return x-Math.floor(x); };
    const starEls: string[] = [];
    const starKFs: string[] = [];
    // Anneau de fond qui pulse doucement
    allStyles.push(`@keyframes ${id}-bg {
      0%,100% { opacity: 0.12; transform: scale(1); }
      50%     { opacity: 0.25; transform: scale(1.1); }
    }`);
    Array.from({length: nStars}, (_, k) => {
      const orbitR   = r + 10 + rng(k*3) * 20;
      const angle    = (k / nStars) * 360 + rng(k*7) * 30;
      const dur      = (3 + rng(k*11) * 4).toFixed(1);
      const blinkDur = (0.6 + rng(k*5) * 1.4).toFixed(1);
      const starSize = (0.8 + rng(k*13) * 2.2).toFixed(1);
      const colIdx   = k % 6;
      const starCol  = [col1, col2, col3, col4, col5, col6][colIdx];
      const initAngle = angle;
      const dir = k % 2 === 0 ? 1 : -1;
      // Position initiale sur l'orbite
      const sx = (orbitR * Math.cos((angle * Math.PI) / 180)).toFixed(1);
      const sy = (orbitR * Math.sin((angle * Math.PI) / 180)).toFixed(1);
      starKFs.push(`@keyframes ${id}-rot${k} {
        from { transform: rotate(${initAngle}deg); }
        to   { transform: rotate(${initAngle + dir*360}deg); }
      }
      @keyframes ${id}-blink${k} {
        0%,100% { opacity: ${(0.4 + rng(k)*0.6).toFixed(2)}; r: ${starSize}; }
        50%     { opacity: 1; r: ${(parseFloat(starSize)*1.8).toFixed(1)}; }
      }`);
      starEls.push(`<circle r="${starSize}" fill="${starCol}"
          cx="${sx}" cy="${sy}"
          filter="url(#${id}-f)"
          style="animation:${id}-rot${k} ${dur}s linear ${(k*0.3).toFixed(1)}s infinite, ${id}-blink${k} ${blinkDur}s ease-in-out ${(rng(k)*2).toFixed(1)}s infinite; transform-origin:0px 0px;"/>`);
    });
    allStyles.push(...starKFs);
    // Anneau de base léger
    allStyles.push(`@keyframes ${id}-ring-rot { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }`);
    allGroups.push(slotGroup(`${id}`, 7, `
      <circle r="${r+22}" fill="${col1}" fill-opacity="0.08"
        style="animation:${id}-bg 3s ease-in-out 0s infinite; transform-origin:0px 0px;"/>
      <circle r="${r+22}" fill="none" stroke="${col2}" stroke-width="0.6"
        stroke-dasharray="1 8"
        style="animation:${id}-ring-rot 20s linear 0s infinite; transform-origin:0px 0px;"/>
      ${starEls.join('\n')}
    `));
  }

  return {
    defsHtml: allDefs.join('\n'),
    stylesCSS: allStyles.join('\n'),
    elements: allGroups.join('\n'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VERSION GIF FRAME — effet logo selon le frame index
// Retourne des SVG elements en coordonnées absolues (cx, cy dans root SVG)
// ─────────────────────────────────────────────────────────────────────────────

export function buildLogoGifFrame(
  frame: number,
  totalFrames: number,
  cx: number,
  cy: number,
  r: number,
  accent: string,
  accentLight: string,
): string {
  const t = frame / totalFrames;
  // Sélection de l'effet selon la phase temporelle
  const slotIdx = Math.floor((t * N_SLOTS)) % N_SLOTS;
  const slotT   = (t * N_SLOTS) % 1; // 0→1 dans le slot courant

  const col1 = accent;
  const col2 = accentLight;
  const [h, s, l] = hex2hsl(accent.length === 7 ? accent : '#6366f1');
  const col3 = `hsl(${(h+120)%360},${s}%,${l}%)`;

  switch (slotIdx % 4) {
    case 0: { // NEON RING
      const ringR = r + 4 + 2 * Math.sin(slotT * Math.PI * 4);
      const glow  = 0.7 + 0.3 * Math.sin(slotT * Math.PI * 2);
      return `<circle cx="${cx}" cy="${cy}" r="${ringR.toFixed(1)}" fill="none"
        stroke="${col1}" stroke-width="${(2+Math.sin(slotT*Math.PI*2)).toFixed(1)}"
        opacity="${glow.toFixed(2)}"/>
        <circle cx="${cx}" cy="${cy}" r="${(ringR+10).toFixed(1)}" fill="none"
        stroke="${col2}" stroke-width="0.8" opacity="${(glow*0.4).toFixed(2)}"/>`;
    }
    case 1: { // SOUL AURA
      const scale1 = 1 + 0.08 * Math.sin(slotT * Math.PI * 2);
      const scale2 = 1 + 0.05 * Math.sin(slotT * Math.PI * 2 + 1);
      return `<circle cx="${cx}" cy="${cy}" r="${(r*scale1+8).toFixed(1)}" fill="${col1}"
        fill-opacity="${(0.18*scale1).toFixed(2)}"/>
        <circle cx="${cx}" cy="${cy}" r="${(r*scale2+16).toFixed(1)}" fill="${col3}"
        fill-opacity="${(0.1*scale2).toFixed(2)}"/>
        <circle cx="${cx}" cy="${cy}" r="${(r+22).toFixed(1)}" fill="${col2}"
        fill-opacity="${(0.05).toFixed(2)}"/>`;
    }
    case 2: { // ORBITAL DANCE
      const angle = slotT * 360;
      const x1 = (cx + (r+12) * Math.cos((angle * Math.PI)/180)).toFixed(1);
      const y1 = (cy + (r+8)  * Math.sin((angle * Math.PI)/180)).toFixed(1);
      const x2 = (cx + (r+20) * Math.cos(((angle+120) * Math.PI)/180)).toFixed(1);
      const y2 = (cy + (r+12) * Math.sin(((angle+120) * Math.PI)/180)).toFixed(1);
      return `<ellipse cx="${cx}" cy="${cy}" rx="${r+12}" ry="${r+8}" fill="none"
        stroke="${col1}" stroke-width="0.8" stroke-dasharray="4 8" opacity="0.6"/>
        <circle cx="${x1}" cy="${y1}" r="2.5" fill="${col1}" opacity="0.9"/>
        <circle cx="${x2}" cy="${y2}" r="1.8" fill="${col2}" opacity="0.7"/>`;
    }
    case 3: { // HEARTBEAT
      const bpm  = Math.floor(slotT * 3); // 0, 1, 2 battements dans le slot
      const beat = slotT * 3 - bpm;
      const wave = beat < 0.3 ? beat/0.3 : 1 - (beat-0.3)/0.7;
      const wR1 = r + 2 + wave * 16;
      const wR2 = r + 4 + wave * 24;
      return `<circle cx="${cx}" cy="${cy}" r="${wR1.toFixed(1)}" fill="none"
        stroke="${col1}" stroke-width="${(2*Math.max(0,1-wave)).toFixed(1)}"
        opacity="${(0.8*(1-wave)).toFixed(2)}"/>
        <circle cx="${cx}" cy="${cy}" r="${wR2.toFixed(1)}" fill="none"
        stroke="${col2}" stroke-width="${(1.2*Math.max(0,1-wave)).toFixed(1)}"
        opacity="${(0.5*(1-wave)).toFixed(2)}"/>`;
    }
    default: return '';
  }
}
