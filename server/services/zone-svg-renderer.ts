import type { ZoneEffectDecision, ZoneComposition } from './harmony-validator';
import { getTimingProfile, buildDurationFn } from '../modules/timing-master.module';
import { enrichZoneColors } from '../modules/color-harmony.module';

export interface SVGEffectCode {
  keyframes: string;
  elements: string;
  filterDefs: string;
}

export interface ZoneSVGResult {
  logo: SVGEffectCode;
  nom: SVGEffectCode;
  titre: SVGEffectCode;
  contact: SVGEffectCode;
  separateur: SVGEffectCode;
  fond: SVGEffectCode;
  cta: SVGEffectCode;
}

const SPEED_DURATION: Record<string, number> = { slow: 1.6, medium: 1.0, fast: 0.65 };

function d(base: number, speed: string): string {
  return `${(base * (SPEED_DURATION[speed] ?? 1)).toFixed(1)}s`;
}

function hex2rgba(hex: string, alpha: number): string {
  if (!hex || hex.length < 7) return `rgba(99,102,241,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex: string, amount = 40): string {
  if (!hex || hex.length < 7) return '#ffffff';
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function empty(): SVGEffectCode {
  return { keyframes: '', elements: '', filterDefs: '' };
}

// ════════════════════════════════════════════
// ZONE LOGO
// ════════════════════════════════════════════

function renderLogoEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-logo`;

  switch (e.effet_id) {

    case 'LOGO_3D_FLOAT': {
      const deg = Math.round(8 * i);
      const dur = d_fn(8, sp);
      return {
        filterDefs: `<filter id="${pfx}-f3d"><feDropShadow dx="${deg/2}" dy="0" stdDeviation="${deg}" flood-color="${col}" flood-opacity="${i * 0.4}"/></filter>`,
        keyframes: `@keyframes ${pfx}-float {
          0%,100% { transform: perspective(600px) rotateY(-${deg}deg) translateZ(0); filter: url(#${pfx}-f3d); }
          50%      { transform: perspective(600px) rotateY(${deg}deg) translateZ(${Math.round(12*i)}px); filter: url(#${pfx}-f3d); }
        }`,
        elements: `<ellipse id="${pfx}-shadow" cx="76" cy="152" rx="${40*i}" ry="${6*i}" fill="${col}" fill-opacity="${i*0.3}" style="animation:${pfx}-float ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    case 'LOGO_VOLUME_BREATHE': {
      const dur = d_fn(6, sp);
      const sx  = 1 + 0.06 * i;
      const sy  = 1 + 0.04 * i;
      return {
        filterDefs: `<filter id="${pfx}-glow"><feGaussianBlur stdDeviation="${2*i}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
        keyframes: `@keyframes ${pfx}-breathe {
          0%,100% { transform: scale(1,1); filter: url(#${pfx}-glow); }
          50%      { transform: scale(${sx.toFixed(3)},${sy.toFixed(3)}); filter: url(#${pfx}-glow); }
        }`,
        elements: `<circle id="${pfx}-halo" cx="76" cy="76" r="${54 + 6*i}" fill="${col}" fill-opacity="${i*0.12}" style="animation:${pfx}-breathe ${dur} cubic-bezier(.4,0,.2,1) ${delay}s infinite; transform-origin:76px 76px;"/>`,
      };
    }

    case 'LOGO_GYRO_TILT': {
      const dur = d_fn(12, sp);
      const rx = Math.round(3 * i);
      const ry = Math.round(5 * i);
      return {
        filterDefs: `<filter id="${pfx}-gyro"><feDropShadow dx="${ry}" dy="${rx}" stdDeviation="${ry}" flood-color="${col}" flood-opacity="${i*0.35}"/></filter>`,
        keyframes: `@keyframes ${pfx}-gyro {
          0%   { transform: perspective(800px) rotateX(-${rx}deg) rotateY(${ry}deg); }
          100% { transform: perspective(800px) rotateX(${rx}deg) rotateY(-${ry}deg); }
        }`,
        elements: `<ellipse id="${pfx}-tilt-shadow" cx="76" cy="155" rx="${38*i}" ry="${5*i}" fill="${col}" fill-opacity="${i*0.25}" style="animation:${pfx}-gyro ${dur} ease-in-out ${delay}s infinite alternate; transform-origin:76px 76px;"/>`,
      };
    }

    case 'LOGO_HALO_PULSE': {
      const bpm = d_fn(0.83, sp);
      return {
        filterDefs: `<radialGradient id="${pfx}-halo-g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${col}" stop-opacity="${i*0.8}"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>`,
        keyframes: `@keyframes ${pfx}-halo {
          0%,100% { r: ${50+4*i}; opacity: ${i*0.5}; }
          50%      { r: ${58+8*i}; opacity: ${i}; }
        }`,
        elements: `<circle id="${pfx}-halopulse" cx="76" cy="76" r="${50}" fill="url(#${pfx}-halo-g)" style="animation:${pfx}-halo ${bpm} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    case 'LOGO_ORBITAL_PARTICLES': {
      const dur = d_fn(6, sp);
      const orbs = [
        { rx:45, ry:18, delay:0 }, { rx:55, ry:22, delay:1.5 },
        { rx:38, ry:14, delay:3 }, { rx:48, ry:20, delay:4.5 },
      ];
      const elements = orbs.map((orb, idx) => `
        <ellipse id="${pfx}-orb${idx}" cx="76" cy="76" rx="${orb.rx*i+20}" ry="${orb.ry*i+8}" fill="none" stroke="${col}" stroke-width="1" stroke-opacity="${i}" stroke-dasharray="3 8" style="animation:${pfx}-orbit${idx} ${(parseFloat(dur)*0.9+idx*0.4).toFixed(1)}s linear ${delay+orb.delay}s infinite;transform-origin:76px 76px;"/>`).join('');
      const keyframes = orbs.map((_, idx) => `@keyframes ${pfx}-orbit${idx} { from{transform:rotate(${idx*90}deg)}to{transform:rotate(${idx*90+360}deg)} }`).join('\n');
      return { filterDefs: '', keyframes, elements };
    }

    case 'LOGO_SOUL_AURA': {
      const dur = d_fn(10, sp);
      return {
        filterDefs: `<radialGradient id="${pfx}-aura1" cx="40%" cy="40%"><stop offset="0%" stop-color="${col}" stop-opacity="${i*0.4}"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>
          <radialGradient id="${pfx}-aura2" cx="60%" cy="60%"><stop offset="0%" stop-color="${lighten(col)}" stop-opacity="${i*0.3}"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>`,
        keyframes: `@keyframes ${pfx}-aura {
          0%,100% { transform: scale(1) rotate(0deg); opacity: ${i*0.6}; }
          33%      { transform: scale(${1+0.1*i}) rotate(3deg); }
          66%      { transform: scale(${1+0.05*i}) rotate(-3deg); }
        }`,
        elements: `<circle cx="76" cy="76" r="70" fill="url(#${pfx}-aura1)" style="animation:${pfx}-aura ${dur} ease-in-out ${delay}s infinite;transform-origin:76px 76px;"/>
          <circle cx="76" cy="76" r="56" fill="url(#${pfx}-aura2)" style="animation:${pfx}-aura ${(parseFloat(dur)*1.3).toFixed(1)}s ease-in-out ${delay+1}s infinite alternate;transform-origin:76px 76px;"/>`,
      };
    }

    case 'LOGO_ELECTRIC_CORONA': {
      const dur = d_fn(3, sp);
      const dash = Math.round(12 * i);
      return {
        filterDefs: `<filter id="${pfx}-glow-elec"><feGaussianBlur stdDeviation="${3*i}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
        keyframes: `@keyframes ${pfx}-corona {
          0%   { stroke-dashoffset: 0; opacity: ${i*0.8}; }
          50%  { opacity: ${i}; }
          100% { stroke-dashoffset: ${-dash*4}; opacity: ${i*0.8}; }
        }`,
        elements: `<circle cx="76" cy="76" r="${56+6*i}" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="${dash} ${dash/2}" filter="url(#${pfx}-glow-elec)" style="animation:${pfx}-corona ${dur} linear ${delay}s infinite; transform-origin:76px 76px;"/>`,
      };
    }

    case 'LOGO_METAL_BRUSH': {
      const dur = d_fn(4, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="${col}" stop-opacity="0"/>
          <stop offset="45%"  stop-color="${lighten(col,60)}" stop-opacity="${i*0.7}"/>
          <stop offset="55%"  stop-color="${lighten(col,80)}" stop-opacity="${i}"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<circle cx="76" cy="76" r="52" fill="url(#${pfx}-metal)" fill-opacity="1"/>`,
      };
    }

    case 'LOGO_GLASS_IRIS': {
      const dur = d_fn(5, sp);
      const colors = [col, lighten(col,50), '#ff6b9d', '#00d4ff', lighten(col,80)];
      return {
        filterDefs: `<linearGradient id="${pfx}-iris" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((c,idx) => `<stop offset="${idx*25}%" stop-color="${c}" stop-opacity="${i*0.6}"/>`).join('')}
          <animateTransform attributeName="gradientTransform" type="rotate" from="0 76 76" to="360 76 76" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: `@keyframes ${pfx}-iris-pulse { 0%,100%{opacity:${i*0.7}} 50%{opacity:${i}} }`,
        elements: `<circle cx="76" cy="76" r="54" fill="url(#${pfx}-iris)" style="animation:${pfx}-iris-pulse ${(parseFloat(dur)*1.5).toFixed(1)}s ease-in-out ${delay}s infinite;"/>`,
      };
    }

    case 'LOGO_GOLD_POLISH': {
      const dur = d_fn(5, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#8b6914" stop-opacity="${i*0.5}"/>
          <stop offset="30%"  stop-color="#c9a84c" stop-opacity="${i*0.8}"/>
          <stop offset="50%"  stop-color="#f0d080" stop-opacity="${i}"/>
          <stop offset="70%"  stop-color="#c9a84c" stop-opacity="${i*0.8}"/>
          <stop offset="100%" stop-color="#8b6914" stop-opacity="${i*0.5}"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<circle cx="76" cy="76" r="54" fill="url(#${pfx}-gold)"/>`,
      };
    }

    case 'LOGO_LIQUID_EDGE': {
      const dur = d_fn(10, sp);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-liquid {
          0%,100% { d: path("M76,24 C100,24 128,52 128,76 C128,100 100,128 76,128 C52,128 24,100 24,76 C24,52 52,24 76,24Z"); }
          25%      { d: path("M76,20 C108,20 132,50 132,76 C132,104 108,130 76,132 C44,132 22,104 20,76 C22,50 44,20 76,20Z"); }
          50%      { d: path("M76,26 C106,24 130,52 130,76 C130,100 106,128 76,128 C46,130 22,100 22,76 C24,52 46,24 76,26Z"); }
          75%      { d: path("M76,22 C102,22 130,50 130,78 C130,102 102,130 76,130 C50,128 20,102 22,76 C22,52 50,24 76,22Z"); }
        }`,
        elements: `<circle cx="76" cy="76" r="${52}" fill="none" stroke="${col}" stroke-width="2" stroke-opacity="${i*0.6}" style="animation:${pfx}-liquid ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    default: return empty();
  }
}

// ════════════════════════════════════════════
// ZONE NOM
// ════════════════════════════════════════════

function renderNomEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number, nomX = 195, nomY = 30, nomW = 220): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-nom`;

  switch (e.effet_id) {

    case 'NOM_SHIMMER_GOLD': {
      const dur = d_fn(6, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="${col}" stop-opacity="0"/>
          <stop offset="40%"  stop-color="${lighten(col,60)}" stop-opacity="${i*0.9}"/>
          <stop offset="60%"  stop-color="${lighten(col,80)}" stop-opacity="${i}"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="-2 0" to="2 0" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<rect x="${nomX}" y="${nomY-2}" width="${nomW}" height="28" fill="url(#${pfx}-shimmer)" rx="2"/>`,
      };
    }

    case 'NOM_NEON_GLOW': {
      const dur = d_fn(4, sp);
      const blur1 = Math.round(4 * i);
      const blur2 = Math.round(10 * i);
      return {
        filterDefs: `<filter id="${pfx}-neon"><feGaussianBlur stdDeviation="${blur2}" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
        keyframes: `@keyframes ${pfx}-neon {
          0%,100% { filter: drop-shadow(0 0 ${blur1}px ${col}) drop-shadow(0 0 ${blur2}px ${col}); }
          50%      { filter: drop-shadow(0 0 ${blur1*2}px ${col}) drop-shadow(0 0 ${blur2*2}px ${col}); }
        }`,
        elements: `<rect x="${nomX}" y="${nomY-2}" width="${nomW}" height="28" fill="none" rx="2" style="animation:${pfx}-neon ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    case 'NOM_HOLOGRAM_SCAN': {
      const dur = d_fn(8, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-scan" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stop-color="${col}" stop-opacity="0"/>
          <stop offset="48%"  stop-color="${col}" stop-opacity="0"/>
          <stop offset="50%"  stop-color="${lighten(col,80)}" stop-opacity="${i*0.8}"/>
          <stop offset="52%"  stop-color="${col}" stop-opacity="0"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="0 -2" to="0 2" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<rect x="${nomX}" y="${nomY-2}" width="${nomW}" height="28" fill="url(#${pfx}-scan)" rx="2"/>`,
      };
    }

    case 'NOM_CLEAN_BREATHE': {
      const dur = d_fn(10, sp);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-breathe {
          0%,100% { opacity: 1; }
          50%      { opacity: ${1 - i * 0.15}; }
        }`,
        elements: `<rect x="${nomX}" y="${nomY-2}" width="${nomW}" height="28" fill="${col}" fill-opacity="${i*0.06}" rx="2" style="animation:${pfx}-breathe ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    case 'NOM_FLOAT_SUBTLE': {
      const dur = d_fn(8, sp);
      const ty  = Math.round(3 * i);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-float {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-${ty}px); }
        }`,
        elements: `<rect x="${nomX}" y="${nomY-2}" width="${nomW}" height="28" fill="${col}" fill-opacity="${i*0.05}" rx="2" style="animation:${pfx}-float ${dur} ease-in-out ${delay}s infinite alternate;"/>`,
      };
    }

    case 'NOM_LETTER_WAVE': {
      const dur = d_fn(6, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-wave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="${col}" stop-opacity="0"/>
          <stop offset="30%"  stop-color="${col}" stop-opacity="${i*0.5}"/>
          <stop offset="50%"  stop-color="${lighten(col,40)}" stop-opacity="${i*0.8}"/>
          <stop offset="70%"  stop-color="${col}" stop-opacity="${i*0.5}"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="-2 0" to="2 0" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<rect x="${nomX}" y="${nomY+20}" width="${nomW}" height="4" fill="url(#${pfx}-wave)" rx="2"/>`,
      };
    }

    default: return empty();
  }
}

// ════════════════════════════════════════════
// ZONE TITRE
// ════════════════════════════════════════════

function renderTitreEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-titre`;
  const tx  = 195, ty = 58;

  switch (e.effet_id) {

    case 'TITRE_SLIDE_IN': {
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-slide {
          0%   { transform: translateX(-12px); opacity: 0; }
          100% { transform: translateX(0);     opacity: 1; }
        }`,
        elements: `<rect x="${tx}" y="${ty-2}" width="180" height="16" fill="${col}" fill-opacity="${i*0.08}" rx="2" style="animation:${pfx}-slide 0.8s ease-out ${delay}s 1 both;"/>`,
      };
    }

    case 'TITRE_LETTER_SPACING_BREATHE': {
      const dur = d_fn(12, sp);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-space {
          0%,100% { letter-spacing: 1.5px; opacity: 0.85; }
          50%      { letter-spacing: 2.5px; opacity: 1; }
        }`,
        elements: `<rect x="${tx}" y="${ty-2}" width="180" height="16" fill="${col}" fill-opacity="${i*0.06}" rx="2" style="animation:${pfx}-space ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    case 'TITRE_COLOR_SHIFT': {
      const dur = d_fn(16, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-shift" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="${col}" stop-opacity="${i*0.8}"/>
          <stop offset="100%" stop-color="${lighten(col,50)}" stop-opacity="${i*0.4}"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<rect x="${tx}" y="${ty+12}" width="160" height="2" fill="url(#${pfx}-shift)" rx="1"/>`,
      };
    }

    case 'TITRE_FADE_PRESENCE': {
      const dur = d_fn(14, sp);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-fade {
          0%,100% { opacity: ${0.6 - i*0.1}; }
          50%      { opacity: ${0.9 + i*0.1}; }
        }`,
        elements: `<rect x="${tx}" y="${ty-2}" width="180" height="16" fill="${col}" fill-opacity="${i*0.07}" rx="2" style="animation:${pfx}-fade ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    default: return empty();
  }
}

// ════════════════════════════════════════════
// ZONE SÉPARATEUR
// ════════════════════════════════════════════

function renderSeparateurEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-sep`;
  const sx = 172, sy = 16, sh = 148;

  switch (e.effet_id) {

    case 'SEP_ENERGY_FLOW': {
      const dur = d_fn(3, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-flow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stop-color="${col}" stop-opacity="0"/>
          <stop offset="30%"  stop-color="${col}" stop-opacity="${i}"/>
          <stop offset="50%"  stop-color="${lighten(col,40)}" stop-opacity="${i}"/>
          <stop offset="70%"  stop-color="${col}" stop-opacity="${i}"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="0 -1" to="0 1" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<rect x="${sx}" y="${sy}" width="3" height="${sh}" fill="url(#${pfx}-flow)" rx="1.5"/>`,
      };
    }

    case 'SEP_ELECTRIC_PULSE': {
      const dur = d_fn(2, sp);
      return {
        filterDefs: `<filter id="${pfx}-glow"><feGaussianBlur stdDeviation="${2*i}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
        keyframes: `@keyframes ${pfx}-pulse {
          0%,100% { opacity: ${i*0.6}; stroke-width: 2; }
          50%      { opacity: ${i};     stroke-width: ${2+2*i}; }
        }`,
        elements: `<rect x="${sx}" y="${sy}" width="3" height="${sh}" fill="${col}" fill-opacity="${i}" filter="url(#${pfx}-glow)" rx="1.5" style="animation:${pfx}-pulse ${dur} ease-in-out ${delay}s infinite; transform-origin:${sx+1.5}px ${sy+sh/2}px;"/>`,
      };
    }

    case 'SEP_BREATHING_CALM': {
      const dur = d_fn(8, sp);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-calm {
          0%,100% { opacity: ${i*0.4}; transform: scaleX(1); }
          50%      { opacity: ${i};     transform: scaleX(${1 + 0.5*i}); }
        }`,
        elements: `<rect x="${sx}" y="${sy}" width="2" height="${sh}" fill="${col}" fill-opacity="1" rx="1" style="animation:${pfx}-calm ${dur} ease-in-out ${delay}s infinite; transform-origin:${sx+1}px ${sy+sh/2}px;"/>`,
      };
    }

    case 'SEP_PARTICLE_STREAM': {
      const dur = d_fn(4, sp);
      const particles = [0,1,2,3].map(idx => `
        <circle cx="${sx+1.5}" cy="${sy}" r="${1.5 + idx*0.3}" fill="${col}" fill-opacity="${i*0.8}" style="animation:${pfx}-particle ${dur} linear ${delay + idx * (parseFloat(dur)/4)}s infinite;"/>`).join('');
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-particle {
          0%   { transform: translateY(0);      opacity: 0; }
          10%  { opacity: ${i}; }
          90%  { opacity: ${i}; }
          100% { transform: translateY(${sh}px); opacity: 0; }
        }`,
        elements: `<rect x="${sx}" y="${sy}" width="3" height="${sh}" fill="${col}" fill-opacity="${i*0.25}" rx="1.5"/>
          ${particles}`,
      };
    }

    case 'SEP_GOLD_SHINE': {
      const dur = d_fn(6, sp);
      return {
        filterDefs: `<radialGradient id="${pfx}-gold-pt" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f0d080" stop-opacity="${i}"/><stop offset="100%" stop-color="#c9a84c" stop-opacity="0"/></radialGradient>`,
        keyframes: `@keyframes ${pfx}-shine {
          0%   { transform: translateY(${sh}px); opacity: 0; }
          10%  { opacity: ${i}; }
          90%  { opacity: ${i}; }
          100% { transform: translateY(0);       opacity: 0; }
        }`,
        elements: `<rect x="${sx}" y="${sy}" width="3" height="${sh}" fill="#c9a84c" fill-opacity="${i*0.5}" rx="1.5"/>
          <ellipse cx="${sx+1.5}" cy="${sy}" rx="4" ry="6" fill="url(#${pfx}-gold-pt)" style="animation:${pfx}-shine ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    default: return empty();
  }
}

// ════════════════════════════════════════════
// ZONE FOND
// ════════════════════════════════════════════

function renderFondEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number, w = 600, h = 180): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-fond`;

  switch (e.effet_id) {

    case 'FOND_STELLAR_DRIFT': {
      const dur = d_fn(30, sp);
      const rng = (seed: number) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); };
      const stars = Array.from({ length: 28 }, (_, idx) => {
        const cx = Math.round(rng(idx * 3.1) * w);
        const cy = Math.round(rng(idx * 7.3) * h);
        const r  = (0.5 + rng(idx * 5.7) * 1.5).toFixed(1);
        const d2  = (rng(idx * 2.9) * parseFloat(dur)).toFixed(1);
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" fill-opacity="${i * rng(idx)}" style="animation:${pfx}-star ${dur} linear ${d2}s infinite;"/>`;
      }).join('');
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-star {
          0%   { transform: translate(0,0); }
          100% { transform: translate(${Math.round(10*i)}px,${Math.round(6*i)}px); }
        }`,
        elements: `<g id="${pfx}-stars">${stars}</g>`,
      };
    }

    case 'FOND_ATMOSPHERIC_BREATH': {
      const dur = d_fn(16, sp);
      return {
        filterDefs: `<radialGradient id="${pfx}-atm" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="${col}" stop-opacity="${i*0.4}"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>`,
        keyframes: `@keyframes ${pfx}-atm {
          0%,100% { transform: scale(0.85); opacity: ${i*0.6}; }
          50%      { transform: scale(1.1);  opacity: ${i}; }
        }`,
        elements: `<ellipse cx="${w/2}" cy="${h/2}" rx="${w*0.4}" ry="${h*0.45}" fill="url(#${pfx}-atm)" style="animation:${pfx}-atm ${dur} ease-in-out ${delay}s infinite; transform-origin:${w/2}px ${h/2}px;"/>`,
      };
    }

    case 'FOND_PLASMA_FIELD': {
      const dur = d_fn(24, sp);
      return {
        filterDefs: `<radialGradient id="${pfx}-p1" cx="25%" cy="30%"><stop offset="0%" stop-color="${col}" stop-opacity="${i*0.3}"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>
          <radialGradient id="${pfx}-p2" cx="75%" cy="70%"><stop offset="0%" stop-color="${lighten(col,40)}" stop-opacity="${i*0.2}"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>`,
        keyframes: `@keyframes ${pfx}-plasma {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(${12*i}px,${-8*i}px) scale(1.1); }
          66%      { transform: translate(${-8*i}px,${10*i}px) scale(0.95); }
        }`,
        elements: `<ellipse cx="${w*0.3}" cy="${h*0.4}" rx="${w*0.35}" ry="${h*0.5}" fill="url(#${pfx}-p1)" style="animation:${pfx}-plasma ${dur} ease-in-out ${delay}s infinite;"/>
          <ellipse cx="${w*0.7}" cy="${h*0.6}" rx="${w*0.3}" ry="${h*0.45}" fill="url(#${pfx}-p2)" style="animation:${pfx}-plasma ${(parseFloat(dur)*1.2).toFixed(1)}s ease-in-out ${delay+3}s infinite alternate;"/>`,
      };
    }

    case 'FOND_NEURAL_GRID': {
      const dur = d_fn(20, sp);
      const lines = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          const x1 = c * 120 + 30, y1 = r * 45 + 22;
          const x2 = (c+1) * 120, y2 = (r+1) * 45;
          lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-opacity="${i}" stroke-width="0.5"/>`);
        }
      }
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-grid {
          0%,100% { opacity: ${i*0.6}; }
          50%      { opacity: ${i}; }
        }`,
        elements: `<g style="animation:${pfx}-grid ${dur} ease-in-out ${delay}s infinite;">${lines.join('')}</g>`,
      };
    }

    case 'FOND_MINIMAL_NOISE':
    case 'FOND_CLEAN_DARK':
      return empty();

    default: return empty();
  }
}

// ════════════════════════════════════════════
// ZONE CONTACT
// ════════════════════════════════════════════

function renderContactEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-contact`;

  switch (e.effet_id) {

    case 'CONTACT_CASCADE_APPEAR': {
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-cascade {
          0%   { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0);   opacity: 1; }
        }`,
        elements: `<rect x="195" y="78" width="180" height="12" fill="${col}" fill-opacity="${i*0.08}" rx="2" style="animation:${pfx}-cascade 0.6s ease-out ${delay+0.3}s 1 both;"/>
          <rect x="195" y="94" width="160" height="12" fill="${col}" fill-opacity="${i*0.06}" rx="2" style="animation:${pfx}-cascade 0.6s ease-out ${delay+0.6}s 1 both;"/>
          <rect x="195" y="110" width="170" height="12" fill="${col}" fill-opacity="${i*0.07}" rx="2" style="animation:${pfx}-cascade 0.6s ease-out ${delay+0.9}s 1 both;"/>`,
      };
    }

    case 'CONTACT_ICON_PULSE': {
      const dur = d_fn(4, sp);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-icon {
          0%,100% { transform: scale(1);    opacity: 0.7; }
          50%      { transform: scale(${1+0.15*i}); opacity: 1; }
        }`,
        elements: `<circle cx="193" cy="83"  r="5" fill="${col}" fill-opacity="${i*0.4}" style="animation:${pfx}-icon ${dur} ease-in-out ${delay}s infinite; transform-origin:193px 83px;"/>
          <circle cx="193" cy="99"  r="5" fill="${col}" fill-opacity="${i*0.4}" style="animation:${pfx}-icon ${dur} ease-in-out ${delay+1}s infinite; transform-origin:193px 99px;"/>
          <circle cx="193" cy="115" r="5" fill="${col}" fill-opacity="${i*0.4}" style="animation:${pfx}-icon ${dur} ease-in-out ${delay+2}s infinite; transform-origin:193px 115px;"/>`,
      };
    }

    case 'CONTACT_SCAN_LINE': {
      const dur = d_fn(20, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-scan-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stop-color="${col}" stop-opacity="0"/>
          <stop offset="50%" stop-color="${lighten(col,60)}" stop-opacity="${i*0.6}"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="0 -1" to="0 1" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<rect x="185" y="75" width="200" height="60" fill="url(#${pfx}-scan-g)" rx="4"/>`,
      };
    }

    default: return empty();
  }
}

// ════════════════════════════════════════════
// ZONE CTA
// ════════════════════════════════════════════

function renderCtaEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-cta`;
  const cx = 486, cy = 124, cw = 160, ch = 28, cr = 14;

  switch (e.effet_id) {

    case 'CTA_GRAVITY_PULSE': {
      const dur = d_fn(3, sp);
      return {
        filterDefs: `<filter id="${pfx}-shadow"><feDropShadow dx="0" dy="${2*i}" stdDeviation="${4*i}" flood-color="${col}" flood-opacity="${i*0.5}"/></filter>`,
        keyframes: `@keyframes ${pfx}-pulse {
          0%,100% { transform: scale(1);         filter: url(#${pfx}-shadow); }
          50%      { transform: scale(${1+0.03*i}); filter: url(#${pfx}-shadow); }
        }`,
        elements: `<rect x="${cx-cw/2}" y="${cy-ch/2}" width="${cw}" height="${ch}" rx="${cr}" fill="${col}" fill-opacity="${i*0.2}" style="animation:${pfx}-pulse ${dur} ease-in-out ${delay}s infinite; transform-origin:${cx}px ${cy}px;"/>`,
      };
    }

    case 'CTA_SHIMMER_SWEEP': {
      const dur = d_fn(4, sp);
      return {
        filterDefs: `<linearGradient id="${pfx}-sweep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="${col}" stop-opacity="0"/>
          <stop offset="50%"  stop-color="${lighten(col,80)}" stop-opacity="${i*0.9}"/>
          <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
          <animateTransform attributeName="gradientTransform" type="translate" from="-2 -1" to="2 1" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: '',
        elements: `<rect x="${cx-cw/2}" y="${cy-ch/2}" width="${cw}" height="${ch}" rx="${cr}" fill="url(#${pfx}-sweep)"/>`,
      };
    }

    case 'CTA_ELECTRIC_BORDER': {
      const dur = d_fn(3, sp);
      return {
        filterDefs: `<filter id="${pfx}-glow"><feGaussianBlur stdDeviation="${2*i}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
        keyframes: `@keyframes ${pfx}-border { from{stroke-dashoffset:0}to{stroke-dashoffset:${-Math.round(40+cw*2+ch*2)}} }`,
        elements: `<rect x="${cx-cw/2}" y="${cy-ch/2}" width="${cw}" height="${ch}" rx="${cr}" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="8 4" filter="url(#${pfx}-glow)" stroke-opacity="${i}" style="animation:${pfx}-border ${dur} linear ${delay}s infinite;"/>`,
      };
    }

    case 'CTA_BREATH_INVITATION': {
      const dur = d_fn(6, sp);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-breath {
          0%,100% { fill-opacity: ${i*0.15}; }
          50%      { fill-opacity: ${i*0.35}; }
        }`,
        elements: `<rect x="${cx-cw/2}" y="${cy-ch/2}" width="${cw}" height="${ch}" rx="${cr}" fill="${col}" style="animation:${pfx}-breath ${dur} ease-in-out ${delay}s infinite;"/>`,
      };
    }

    case 'CTA_PARTICLE_ATTRACT': {
      const dur = d_fn(8, sp);
      const particles = [0,1,2,3,4,5].map(idx => {
        const startX = cx - cw/2 - 20 + Math.random() * (cw + 40);
        const startY = cy - 40 - idx * 8;
        return `<circle cx="${startX.toFixed(0)}" cy="${startY.toFixed(0)}" r="2" fill="${col}" fill-opacity="${i*0.7}" style="animation:${pfx}-attract ${dur} ease-in ${delay + idx * 1.2}s infinite;"/>`;
      });
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-attract {
          0%   { transform: translate(0,0); opacity: 0; }
          20%  { opacity: ${i}; }
          100% { transform: translate(0,${30+Math.random()*20}px); opacity: 0; }
        }`,
        elements: particles.join(''),
      };
    }

    case 'CTA_STATIC_PRESENCE':
    default: return empty();
  }
}

// ════════════════════════════════════════════
// MOTEUR MULTI-COUCHES
// ════════════════════════════════════════════

function mergeEffects(effects: SVGEffectCode[]): SVGEffectCode {
  return {
    keyframes:  effects.map(e => e.keyframes).filter(Boolean).join('\n'),
    elements:   effects.map(e => e.elements).filter(Boolean).join('\n'),
    filterDefs: effects.map(e => e.filterDefs).filter(Boolean).join('\n'),
  };
}

// Ordre de rendu des catégories pour chaque zone (du fond vers le premier plan)
// 🌀 Chaos Organisé : supporte jusqu'à 4 couches simultanées par zone
const LAYER_RENDER_ORDER: Record<string, string[]> = {
  logo:       ['energie', 'matiere', 'dimension', 'transformation'],  // aura → matière → 3D → morph
  nom:        ['lumiere', 'mouvement'],
  separateur: ['tertiary', 'secondary', 'primary'],  // fond d'abord, puis couches successives
  fond:       ['tertiary', 'secondary', 'primary'],
  cta:        ['tertiary', 'secondary', 'primary'],
  titre:      ['secondary', 'primary'],
  contact:    ['secondary', 'primary'],
};

function renderZoneWithLayers(
  zoneName: string,
  decision: ZoneEffectDecision,
  baseVarId: string,
  baseDelay: number,
  renderFn: (decision: ZoneEffectDecision, layerVarId: string, delay: number) => SVGEffectCode,
  fallbackColor: string
): SVGEffectCode {
  const layers = decision.layers;

  // Pas de couches → rendu mono-effet (backward compat)
  if (!layers || layers.length === 0) {
    const dec = { ...decision, color: decision.color || fallbackColor };
    return renderFn(dec, baseVarId, baseDelay);
  }

  // Multi-couches : trier selon l'ordre de rendu puis combiner
  const order = LAYER_RENDER_ORDER[zoneName] || [];
  const sorted = [...layers].sort((a, b) => {
    const ai = order.indexOf(a.category);
    const bi = order.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const results = sorted
    .filter(layer => layer.effet_id && layer.effet_id !== 'null')
    .map((layer, idx) => {
      const layerDecision: ZoneEffectDecision = {
        effet_id: layer.effet_id,
        intensity: layer.intensity,
        speed: layer.speed,
        color: (layer.color && layer.color !== '#000000') ? layer.color : fallbackColor,
        raison: layer.raison,
      };
      // Chaque couche a un varId unique pour éviter les conflits d'IDs SVG
      return renderFn(layerDecision, `${baseVarId}-${layer.category.slice(0,3)}${idx}`, baseDelay + idx * 0.15);
    });

  return mergeEffects(results);
}

// ════════════════════════════════════════════
// MOTEUR PRINCIPAL
// ════════════════════════════════════════════

export function renderZoneComposition(
  composition: ZoneComposition,
  variationIndex: 'A' | 'B' | 'C' | 'D',
  delayOffset: number,
  palette: string[]
): ZoneSVGResult {
  const varId  = `v${variationIndex.toLowerCase()}`;

  // ── TimingMaster : durées basées sur le nombre d'or et Fibonacci ──────────
  const timingProfile = getTimingProfile(variationIndex);
  const d_fn = buildDurationFn(timingProfile);

  const c0 = palette[0] ?? '#0f172a';
  const c1 = palette[1] ?? '#6366f1';
  const c2 = palette[2] ?? '#e2e8f0';

  // ── ColorHarmonyEngine : palette enrichie par zone ────────────────────────
  const zoneColors = enrichZoneColors(c1, c0, variationIndex);

  const resolveColor = (decision: ZoneEffectDecision, zone: string, fallback: string) => {
    if (decision.color && decision.color !== '#000000') return decision.color;
    return (zoneColors as any)[zone] ?? fallback;
  };

  const withColor = (z: ZoneEffectDecision, zone: string, fb: string): ZoneEffectDecision => ({
    ...z,
    color: resolveColor(z, zone, fb),
  });

  // Rendu multi-couches pour chaque zone
  // ── Délais Fibonacci par zone via TimingMaster ────────────────────────────
  const zd = timingProfile.zone_delays;
  const logoDelay  = delayOffset + (zd['logo']       ?? 0);
  const nomDelay   = delayOffset + (zd['nom']        ?? 0);
  const sepDelay   = delayOffset + (zd['separateur'] ?? 0);
  const fondDelay  = delayOffset + (zd['fond']       ?? 0);
  const ctaDelay   = delayOffset + (zd['cta']        ?? 0);
  const titreDelay = delayOffset + (zd['titre']      ?? 0);
  const contDelay  = delayOffset + (zd['contact']    ?? 0);

  const logoResult = renderZoneWithLayers(
    'logo', withColor(composition.logo, 'logo', c1), varId, logoDelay,
    (dec, vid, delay) => renderLogoEffect(d_fn, dec, vid, delay), c1
  );

  const nomResult = renderZoneWithLayers(
    'nom', withColor(composition.nom, 'nom', c1), varId, nomDelay,
    (dec, vid, delay) => renderNomEffect(d_fn, dec, vid, delay), c1
  );

  const sepResult = renderZoneWithLayers(
    'separateur', withColor(composition.separateur, 'separateur', c1), varId, sepDelay,
    (dec, vid, delay) => renderSeparateurEffect(d_fn, dec, vid, delay), c1
  );

  const fondResult = renderZoneWithLayers(
    'fond', withColor(composition.fond, 'fond', c1), varId, fondDelay,
    (dec, vid, delay) => renderFondEffect(d_fn, dec, vid, delay), c1
  );

  const ctaResult = renderZoneWithLayers(
    'cta', withColor(composition.cta, 'cta', c1), varId, ctaDelay,
    (dec, vid, delay) => renderCtaEffect(d_fn, dec, vid, delay), c1
  );

  const titreResult = renderZoneWithLayers(
    'titre', withColor(composition.titre, 'titre', c2), varId, titreDelay,
    (dec, vid, delay) => renderTitreEffect(d_fn, dec, vid, delay), c2
  );

  const contactResult = renderZoneWithLayers(
    'contact', withColor(composition.contact, 'contact', c1), varId, contDelay,
    (dec, vid, delay) => renderContactEffect(d_fn, dec, vid, delay), c1
  );

  return {
    logo:       logoResult,
    nom:        nomResult,
    titre:      titreResult,
    contact:    contactResult,
    separateur: sepResult,
    fond:       fondResult,
    cta:        ctaResult,
  };
}

export function assembleSVGEffects(zoneResult: ZoneSVGResult): {
  allKeyframes: string;
  allElements: string;
  allFilterDefs: string;
} {
  const zones = Object.values(zoneResult);
  return {
    allKeyframes:  zones.map(z => z.keyframes).filter(Boolean).join('\n'),
    allElements:   zones.map(z => z.elements).filter(Boolean).join('\n'),
    allFilterDefs: zones.map(z => z.filterDefs).filter(Boolean).join('\n'),
  };
}
