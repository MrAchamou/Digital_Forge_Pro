import type { ZoneEffectDecision, ZoneComposition } from './harmony-validator';
import { getTimingProfile, buildDurationFn } from '../modules/timing-master.module';
import { enrichZoneColors } from '../modules/color-harmony.module';
import { effectMetricsRegistry } from './effect-metrics-registry';

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

// Coordonnées absolues du logo dans le SVG final (left-col translate(16,16) + image x=10,y=120)
const LOGO_X = 26, LOGO_Y = 136, LOGO_W = 100, LOGO_H = 36;

function renderLogoEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number, logoUrl?: string): SVGEffectCode {
  const col = e.color;
  const i   = e.intensity;
  const sp  = e.speed;
  const pfx = `${varId}-logo`;

  const hasLogo = !!logoUrl;

  // ── Helpers : élément logo animable (image OU groupe texte) ──────────────
  // Pour les effets de TRANSFORMATION (3D, scale, gyro…) — avec style CSS d'animation
  const animLogoEl = (animStyle: string, extraFilter = '') => {
    if (hasLogo) {
      return `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet" style="${animStyle}${extraFilter ? ` filter:url(#${extraFilter});` : ''}"/>`;
    }
    // Pas d'image : on anime le groupe logo-texte via <use> dans son espace local (translate 16,16)
    return `<g transform="translate(16,16)"><g id="${pfx}-txt-anim" style="${animStyle}${extraFilter ? ` filter:url(#${extraFilter});` : ''} transform-box:fill-box; transform-origin:center;"><use href="#logo-bg"/><use href="#company-logo-text"/></g></g>`;
  };

  // Pour les effets DÉCORATIFS autour du logo (halo, orbite…) — logo statique en référence
  const staticLogoEl = () => {
    if (hasLogo) {
      return `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    return `<g transform="translate(16,16)"><use href="#logo-bg"/><use href="#company-logo-text"/></g>`;
  };

  switch (e.effet_id) {

    case 'LOGO_3D_FLOAT': {
      const deg = Math.round(8 * i);
      const dur = d_fn(8, sp);
      const animStyle = `animation:${pfx}-float3d ${dur} ease-in-out ${delay}s infinite; transform-box:fill-box; transform-origin:center;`;
      return {
        filterDefs: `<filter id="${pfx}-f3d"><feDropShadow dx="${deg/2}" dy="0" stdDeviation="${deg}" flood-color="${col}" flood-opacity="${i * 0.4}"/></filter>`,
        keyframes: `@keyframes ${pfx}-float3d {
          0%,100% { transform: perspective(600px) rotateY(-${deg}deg) translateZ(0px); }
          50%      { transform: perspective(600px) rotateY(${deg}deg) translateZ(${Math.round(12*i)}px); }
        }`,
        elements: `${animLogoEl(animStyle, `${pfx}-f3d`)}
        <ellipse id="${pfx}-shadow" cx="${LOGO_X + LOGO_W/2}" cy="${LOGO_Y + LOGO_H + 6}" rx="${40*i}" ry="${6*i}" fill="${col}" fill-opacity="${i*0.3}" style="animation:${pfx}-float3d ${dur} ease-in-out ${delay}s infinite; transform-box:fill-box; transform-origin:center;"/>`,
      };
    }

    case 'LOGO_VOLUME_BREATHE': {
      // Exploite les vraies phases du BREATHING : inspiration, rétention, expiration, pause
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const R = Math.max(LOGO_W, LOGO_H) / 2;
      // Phases réelles extraites du BREATHING.js (retournées en secondes par phaseSecs)
      const inspSecs  = effectMetricsRegistry.phaseSecs('BREATHING', 'inspiration', 1.8) * (SPEED_DURATION[sp] ?? 1);
      const retSecs   = effectMetricsRegistry.phaseSecs('BREATHING', 'retention',  0.8)  * (SPEED_DURATION[sp] ?? 1);
      const expirSecs = effectMetricsRegistry.phaseSecs('BREATHING', 'expiration', 2.2) * (SPEED_DURATION[sp] ?? 1);
      const pauseSecs = effectMetricsRegistry.phaseSecs('BREATHING', 'pause',      0.6)  * (SPEED_DURATION[sp] ?? 1);
      const totalSecs = Math.max(inspSecs + retSecs + expirSecs + pauseSecs, 3.0);
      // Calcul des % de keyframe selon les durées réelles
      const pInsp  = ((inspSecs / totalSecs) * 100).toFixed(1);
      const pRet   = (((inspSecs + retSecs) / totalSecs) * 100).toFixed(1);
      const pExpir = (((inspSecs + retSecs + expirSecs) / totalSecs) * 100).toFixed(1);
      // 3 halos respiratoires avec déphasage naturel (1/3 de cycle chacun)
      const halos = [
        { r: R + 4,  opPeak: i * 0.60, opBase: i * 0.18, scaleMax: 1 + 0.08*i, phaseD: 0 },
        { r: R + 11, opPeak: i * 0.35, opBase: i * 0.10, scaleMax: 1 + 0.055*i, phaseD: totalSecs / 3 },
        { r: R + 20, opPeak: i * 0.18, opBase: i * 0.04, scaleMax: 1 + 0.03*i,  phaseD: (totalSecs / 3) * 2 },
      ];
      const breathFilter = `<filter id="${pfx}-breathe-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="${(2.8*i).toFixed(1)}" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
      const haloEls = halos.map((h, k) =>
        `<circle cx="${CX}" cy="${CY}" r="${h.r.toFixed(1)}" fill="${col}" fill-opacity="${h.opBase.toFixed(3)}"
          filter="url(#${pfx}-breathe-glow)"
          style="animation:${pfx}-haloB${k} ${totalSecs.toFixed(2)}s cubic-bezier(0.4,0,0.2,1) ${(delay + h.phaseD).toFixed(2)}s infinite; transform-origin:${CX}px ${CY}px; transform-box:fill-box;"/>`
      ).join('\n');
      const haloKFs = halos.map((h, k) => `@keyframes ${pfx}-haloB${k} {
        0%         { transform: scale(1); opacity: ${h.opBase.toFixed(3)}; }
        ${pInsp}%  { transform: scale(${h.scaleMax.toFixed(3)}); opacity: ${h.opPeak.toFixed(3)}; }
        ${pRet}%   { transform: scale(${(h.scaleMax * 1.01).toFixed(3)}); opacity: ${h.opPeak.toFixed(3)}; }
        ${pExpir}% { transform: scale(1); opacity: ${h.opBase.toFixed(3)}; }
        100%       { transform: scale(${(1 - 0.01*i).toFixed(3)}); opacity: ${(h.opBase * 0.7).toFixed(3)}; }
      }`).join('\n');
      // Respiration asymétrique du logo (sx ≠ sy = mouvement thoracique réel)
      const sx = (1 + 0.055*i).toFixed(3), sy = (1 + 0.035*i).toFixed(3);
      const imgStyle = `animation:${pfx}-breathe-img ${totalSecs.toFixed(2)}s cubic-bezier(0.4,0,0.2,1) ${delay}s infinite; transform-box:fill-box; transform-origin:center;`;
      return {
        filterDefs: breathFilter,
        keyframes: `@keyframes ${pfx}-breathe-img {
          0%         { transform: scale(1,1); }
          ${pInsp}%  { transform: scale(${sx},${sy}); }
          ${pRet}%   { transform: scale(${sx},${sy}); }
          ${pExpir}% { transform: scale(1,1); }
          100%       { transform: scale(${(1-0.008*i).toFixed(3)},${(1-0.005*i).toFixed(3)}); }
        }\n${haloKFs}`,
        elements: `${haloEls}\n${animLogoEl(imgStyle, '')}`,
      };
    }

    case 'LOGO_GYRO_TILT': {
      const dur = d_fn(12, sp);
      const rx = Math.round(3 * i);
      const ry = Math.round(5 * i);
      const gyroStyle = `animation:${pfx}-gyro-img ${dur} ease-in-out ${delay}s infinite alternate; transform-box:fill-box; transform-origin:center;`;
      return {
        filterDefs: `<filter id="${pfx}-gyro"><feDropShadow dx="${ry}" dy="${rx}" stdDeviation="${ry}" flood-color="${col}" flood-opacity="${i*0.35}"/></filter>`,
        keyframes: `@keyframes ${pfx}-gyro-img {
          0%   { transform: perspective(800px) rotateX(-${rx}deg) rotateY(${ry}deg); }
          100% { transform: perspective(800px) rotateX(${rx}deg) rotateY(-${ry}deg); }
        }`,
        elements: `${animLogoEl(gyroStyle, `${pfx}-gyro`)}
        <ellipse id="${pfx}-tilt-shadow" cx="${LOGO_X + LOGO_W/2}" cy="${LOGO_Y + LOGO_H + 5}" rx="${38*i}" ry="${5*i}" fill="${col}" fill-opacity="${i*0.25}" style="animation:${pfx}-gyro-img ${dur} ease-in-out ${delay}s infinite alternate; transform-box:fill-box; transform-origin:center;"/>`,
      };
    }

    case 'LOGO_HALO_PULSE': {
      // Inspiré du rythme cardiaque du SOUL AURA : 3 anneaux en cascade à 120° de déphasage
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const R = Math.max(LOGO_W, LOGO_H) / 2;
      const bpmSecs = parseFloat(d_fn(0.83, sp)); // ~0.83s ≈ 72 BPM
      const cycleDur = bpmSecs * 2.4; // cycle complet : systole + diastole
      // 3 ondes concentriques en cascade (comme des ondes de choc cardiaques)
      const waves = [
        { rBase: R + 2,  rMax: R + 18*i, opPeak: i * 0.9, sw: 2.0*i, phaseD: 0             },
        { rBase: R + 6,  rMax: R + 26*i, opPeak: i * 0.6, sw: 1.2*i, phaseD: cycleDur / 3  },
        { rBase: R + 10, rMax: R + 34*i, opPeak: i * 0.3, sw: 0.7*i, phaseD: cycleDur * 2/3 },
      ];
      const haloGradDef = `<radialGradient id="${pfx}-halo-fill" cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stop-color="${col}" stop-opacity="0"/>
        <stop offset="55%" stop-color="${col}" stop-opacity="${(i*0.25).toFixed(2)}"/>
        <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
      </radialGradient>`;
      const haloGlowFilter = `<filter id="${pfx}-halo-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="${(1.8*i).toFixed(1)}" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
      const waveEls = waves.map((w, k) =>
        `<circle cx="${CX}" cy="${CY}" r="${w.rBase.toFixed(1)}" fill="none"
          stroke="${col}" stroke-width="${w.sw.toFixed(1)}" stroke-opacity="${(w.opPeak * 0.3).toFixed(2)}"
          filter="url(#${pfx}-halo-glow)"
          style="animation:${pfx}-wave${k} ${cycleDur.toFixed(2)}s cubic-bezier(0.22,1,0.36,1) ${(delay + w.phaseD).toFixed(2)}s infinite;"/>`
      ).join('\n');
      const waveKFs = waves.map((w, k) => `@keyframes ${pfx}-wave${k} {
        0%   { r: ${w.rBase.toFixed(1)}; opacity: ${w.opPeak.toFixed(2)}; stroke-width: ${w.sw.toFixed(1)}; }
        18%  { r: ${w.rMax.toFixed(1)}; opacity: ${(w.opPeak * 0.4).toFixed(2)}; stroke-width: ${(w.sw * 0.4).toFixed(1)}; }
        100% { r: ${(w.rMax + 8).toFixed(1)}; opacity: 0; stroke-width: 0; }
      }`).join('\n');
      // Glow fill intérieur qui pulse
      const innerFill = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#${pfx}-halo-fill)"
        style="animation:${pfx}-inner-pulse ${cycleDur.toFixed(2)}s ease-in-out ${delay}s infinite; transform-origin:${CX}px ${CY}px; transform-box:fill-box;"/>`;
      const innerKF = `@keyframes ${pfx}-inner-pulse {
        0%,100% { transform: scale(0.92); opacity: ${(i*0.4).toFixed(2)}; }
        18%      { transform: scale(1.06); opacity: ${(i*0.8).toFixed(2)}; }
        35%      { transform: scale(0.96); opacity: ${(i*0.3).toFixed(2)}; }
      }`;
      return {
        filterDefs: haloGradDef + '\n' + haloGlowFilter,
        keyframes: waveKFs + '\n' + innerKF,
        elements: `${innerFill}\n${waveEls}\n${staticLogoEl()}`,
      };
    }

    case 'LOGO_ORBITAL_PARTICLES': {
      // Exploite les métriques ORBIT DANCE : maxParticules, periodes orbitales, angles de déphasage
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const RX_BASE = LOGO_W/2 + 6, RY_BASE = LOGO_H/2 + 4;
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      // Nombre d'orbites basé sur les vraies métriques ORBIT DANCE
      const totalParticles = effectMetricsRegistry.particles('ORBIT DANCE', 100);
      const nOrbits = Math.max(3, Math.min(8, Math.round(Math.sqrt(totalParticles / 10))));
      const rng = (seed: number) => { const x = Math.sin(seed * 127.1) * 43758.5453; return x - Math.floor(x); };
      // Orbites déterministes : angles, dimensions, sens de rotation différenciés
      const orbEls = Array.from({ length: nOrbits }, (_, k) => {
        const orbitDur = d_fn(5 + k * 1.2, sp);
        const rxOrb = RX_BASE + 4 + k * 5 + rng(k * 3) * 8 * i;
        const ryOrb = RY_BASE + 2 + k * 3 + rng(k * 7) * 5 * i;
        const dashLen = 2 + k * 0.5;
        const gapLen = 6 + k * 2;
        const rotDir = k % 2 === 0 ? 1 : -1;
        const initAngle = k * 45;
        const sw = (0.8 + (nOrbits - k) * 0.1 * i).toFixed(2);
        const op = (i * (0.5 + rng(k) * 0.5)).toFixed(2);
        // Point orbital brillant sur chaque orbite
        const dotX = CX + rxOrb * Math.cos((initAngle * Math.PI) / 180);
        const dotY = CY + ryOrb * Math.sin((initAngle * Math.PI) / 180);
        return `<ellipse cx="${CX}" cy="${CY}" rx="${rxOrb.toFixed(1)}" ry="${ryOrb.toFixed(1)}"
          fill="none" stroke="${col}" stroke-width="${sw}" stroke-opacity="${op}"
          stroke-dasharray="${dashLen.toFixed(1)} ${gapLen.toFixed(1)}"
          style="animation:${pfx}-orbit${k} ${orbitDur} linear ${(delay + k * 0.6).toFixed(1)}s infinite; transform-origin:${CX}px ${CY}px; transform-box:fill-box;"/>
        <circle r="${(1.5 + (k === 0 ? 1 : 0)).toFixed(1)}" fill="${col}" fill-opacity="${(parseFloat(op) * 1.8).toFixed(2)}"
          style="animation:${pfx}-dot${k} ${orbitDur} linear ${(delay + k * 0.6).toFixed(1)}s infinite; transform-origin:${CX}px ${CY}px; transform-box:fill-box; offset-path:ellipse(${rxOrb.toFixed(1)}px ${ryOrb.toFixed(1)}px at ${CX}px ${CY}px);" cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}"/>`;
      }).join('');
      const keyframes = Array.from({ length: nOrbits }, (_, k) => {
        const rotDir = k % 2 === 0 ? 1 : -1;
        const initAngle = k * 45;
        return `@keyframes ${pfx}-orbit${k} { from{transform:rotate(${initAngle}deg)} to{transform:rotate(${initAngle + rotDir * 360}deg)} }
        @keyframes ${pfx}-dot${k} { from{transform:rotate(${initAngle}deg)} to{transform:rotate(${initAngle + rotDir * 360}deg)} }`;
      }).join('\n');
      return { filterDefs: '', keyframes, elements: `${logoEl}\n${orbEls}` };
    }

    case 'LOGO_SOUL_AURA': {
      // Exploite les vraies métriques SOUL AURA : 7 couches auriques, harmoniques vibratoires, rythme vital
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const R = Math.max(LOGO_W, LOGO_H) / 2;
      const rythme = effectMetricsRegistry.param('SOUL AURA', 'rythmeVital', 1.2);
      const baseDurSecs = (1 / rythme) * 8;
      const nLayers = effectMetricsRegistry.layers('SOUL AURA', 7);
      const intensiteAura = effectMetricsRegistry.param('SOUL AURA', 'intensiteAura', 1.0) * i;
      const sensib = effectMetricsRegistry.param('SOUL AURA', 'sensibiliteEmotionnelle', 0.6);
      // Signatures chromatiques des 8 états émotionnels du SOUL AURA
      const emotionalHues = [240, 45, 15, 210, 320, 270, 350, 180];
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      // Génère N couches auriques — chacune avec spacing, vitesse de rotation et opacité différenciés
      const layerEls = Array.from({ length: nLayers }, (_, k) => {
        const layerR = R + 5 + k * 12;
        const opacity = (intensiteAura * (1 - (k / nLayers) * 0.7) * 0.6).toFixed(3);
        const layerDur = (baseDurSecs * (1 + k * 0.12) * (SPEED_DURATION[sp] ?? 1)).toFixed(1);
        const hShift = emotionalHues[k % emotionalHues.length];
        const hue = (hShift * sensib) % 360;
        const layerCol = k === 0 ? col : `hsl(${hue},${Math.round(60 + k * 3)}%,${Math.round(50 + k * 2)}%)`;
        return `<circle cx="${CX}" cy="${CY}" r="${layerR.toFixed(1)}"
          fill="${layerCol}" fill-opacity="${opacity}"
          style="animation:${pfx}-aura${k} ${layerDur}s cubic-bezier(0.4,0,0.2,1) ${(delay + k * 0.3).toFixed(2)}s infinite; transform-origin:${CX}px ${CY}px; transform-box:fill-box;"/>`;
      }).join('\n');
      const filterGlow = `<filter id="${pfx}-aura-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="${(3 * intensiteAura).toFixed(1)}" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="${pfx}-aura-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${col}" stop-opacity="${(intensiteAura * 0.35).toFixed(2)}"/>
        <stop offset="60%" stop-color="${col}" stop-opacity="${(intensiteAura * 0.12).toFixed(2)}"/>
        <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
      </radialGradient>`;
      const keyframes = Array.from({ length: nLayers }, (_, k) => {
        const distortion = (0.04 + k * 0.015) * i;
        const rot = (k % 2 === 0 ? 1 : -1) * (3 + k * 0.5);
        return `@keyframes ${pfx}-aura${k} {
          0%,100% { transform: scale(1) rotate(${-rot * 0.5}deg); opacity: ${(intensiteAura * (1 - k/nLayers * 0.6) * 0.5).toFixed(2)}; }
          25%      { transform: scale(${(1 + distortion).toFixed(3)}) rotate(${rot * 0.3}deg); }
          50%      { transform: scale(${(1 + distortion * 1.6).toFixed(3)}) rotate(${rot}deg); opacity: ${(intensiteAura * (1 - k/nLayers * 0.5) * 0.9).toFixed(2)}; }
          75%      { transform: scale(${(1 + distortion * 0.8).toFixed(3)}) rotate(${rot * 0.6}deg); }
        }`;
      }).join('\n');
      return {
        filterDefs: filterGlow,
        keyframes,
        elements: `<circle cx="${CX}" cy="${CY}" r="${R + nLayers * 12 + 8}" fill="url(#${pfx}-aura-bg)" filter="url(#${pfx}-aura-glow)"/>
          ${layerEls}
          ${logoEl}`,
      };
    }

    case 'LOGO_ELECTRIC_CORONA': {
      // Exploite les métriques ELECTRIC FORM : intensiteElectrique, couleurA/B, nombreArcs
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      const intensElec = effectMetricsRegistry.param('ELECTRIC FORM', 'intensiteElectrique', 0.8) * i;
      const colorB = effectMetricsRegistry.baseColor('ELECTRIC FORM', lighten(col, 60));
      const nArcs = Math.min(Math.round(effectMetricsRegistry.param('ELECTRIC FORM', 'nombreArcs', 5)), 7);
      const glowBlur = (3 * intensElec).toFixed(1);
      // Génère nArcs arcs électriques à des angles et rayons différents
      const arcEls = Array.from({ length: nArcs }, (_, k) => {
        const arcDur = d_fn(2.0 + k * 0.3, sp);
        const rxArc = LOGO_W/2 + 6 + k * 4 + 5 * i;
        const ryArc = LOGO_H/2 + 4 + k * 3 + 4 * i;
        const dash = Math.round((8 + k * 3) * i);
        const arcCol = k % 2 === 0 ? col : colorB;
        return `<ellipse cx="${CX}" cy="${CY}" rx="${rxArc}" ry="${ryArc}" fill="none"
          stroke="${arcCol}" stroke-width="${(1.5 + (nArcs - k) * 0.2).toFixed(1)}"
          stroke-dasharray="${dash} ${dash * 2}"
          filter="url(#${pfx}-glow-elec)"
          style="animation:${pfx}-arc${k} ${arcDur} linear ${(delay + k * 0.25).toFixed(2)}s infinite;
            transform-origin:${CX}px ${CY}px; transform-box:fill-box; transform:rotate(${k * 40}deg);"/>`;
      }).join('\n');
      const arcKFs = Array.from({ length: nArcs }, (_, k) => {
        const totalDash = Math.round((8 + k * 3) * i) * 3;
        return `@keyframes ${pfx}-arc${k} {
          0%   { stroke-dashoffset: 0; opacity: ${(intensElec * 0.7).toFixed(2)}; }
          50%  { opacity: ${intensElec.toFixed(2)}; stroke-dashoffset: ${-totalDash}; }
          100% { stroke-dashoffset: ${-totalDash * 2}; opacity: ${(intensElec * 0.7).toFixed(2)}; }
        }`;
      }).join('\n');
      return {
        filterDefs: `<filter id="${pfx}-glow-elec" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="${glowBlur}" result="b"/>
          <feColorMatrix type="matrix" in="b" values="1 0.5 0 0 0  0.5 1 0 0 0  0 0.5 1 0 0  0 0 0 0.8 0" result="colored"/>
          <feMerge><feMergeNode in="colored"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`,
        keyframes: arcKFs,
        elements: `${arcEls}\n${logoEl}`,
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
        </linearGradient>
        <filter id="${pfx}-metal-over" x="-10%" y="-10%" width="120%" height="120%">
          <feFlood flood-color="${lighten(col,80)}" flood-opacity="${i*0.3}" result="shine"/>
          <feBlend in="SourceGraphic" in2="shine" mode="screen"/>
        </filter>`,
        keyframes: '',
        elements: `<rect x="${LOGO_X-2}" y="${LOGO_Y-2}" width="${LOGO_W+4}" height="${LOGO_H+4}" fill="url(#${pfx}-metal)" fill-opacity="1" rx="3"/>
        ${animLogoEl('', `${pfx}-metal-over`)}`,
      };
    }

    case 'LOGO_GLASS_IRIS': {
      const dur = d_fn(5, sp);
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const colors = [col, lighten(col,50), '#ff6b9d', '#00d4ff', lighten(col,80)];
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      return {
        filterDefs: `<linearGradient id="${pfx}-iris" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((c,idx) => `<stop offset="${idx*25}%" stop-color="${c}" stop-opacity="${i*0.4}"/>`).join('')}
          <animateTransform attributeName="gradientTransform" type="rotate" from="0 ${CX} ${CY}" to="360 ${CX} ${CY}" dur="${dur}" repeatCount="indefinite"/>
        </linearGradient>`,
        keyframes: `@keyframes ${pfx}-iris-pulse { 0%,100%{opacity:${i*0.7}} 50%{opacity:${i}} }`,
        elements: `<rect x="${LOGO_X-2}" y="${LOGO_Y-2}" width="${LOGO_W+4}" height="${LOGO_H+4}" fill="url(#${pfx}-iris)" rx="4" style="animation:${pfx}-iris-pulse ${(parseFloat(dur)*1.5).toFixed(1)}s ease-in-out ${delay}s infinite;"/>
        ${logoEl}`,
      };
    }

    case 'LOGO_GOLD_POLISH': {
      const dur = d_fn(5, sp);
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
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
        elements: `<rect x="${LOGO_X-2}" y="${LOGO_Y-2}" width="${LOGO_W+4}" height="${LOGO_H+4}" fill="url(#${pfx}-gold)" rx="3"/>
        ${logoEl}`,
      };
    }

    case 'LOGO_LIQUID_EDGE': {
      const dur = d_fn(10, sp);
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const RX = LOGO_W/2+4, RY = LOGO_H/2+4;
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-liquid {
          0%,100% { rx: ${RX}; ry: ${RY}; }
          25%      { rx: ${RX+4}; ry: ${RY-2}; }
          50%      { rx: ${RX-2}; ry: ${RY+4}; }
          75%      { rx: ${RX+2}; ry: ${RY+2}; }
        }`,
        elements: `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="none" stroke="${col}" stroke-width="2" stroke-opacity="${i*0.6}" style="animation:${pfx}-liquid ${dur} ease-in-out ${delay}s infinite;"/>
        ${logoEl}`,
      };
    }

    case 'LOGO_NEURAL_MORPH': {
      const dur = d_fn(9, sp);
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const R = Math.max(LOGO_W, LOGO_H) / 2;
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet" style="filter:url(#${pfx}-morph-f);"/>` : '';
      const nodes = Array.from({ length: 6 }, (_, k) => ({
        angle: k * 60,
        r: (R + 8 + k * 3) * i,
        delay: k * 0.4,
      }));
      const nodeEls = nodes.map((n, k) => {
        const nx = CX + Math.cos((n.angle * Math.PI) / 180) * n.r;
        const ny = CY + Math.sin((n.angle * Math.PI) / 180) * n.r;
        return `<circle key="${k}" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${1.5*i}" fill="${col}" fill-opacity="${i*0.7}" style="animation:${pfx}-node-pulse ${dur} ease-in-out ${delay + n.delay}s infinite;"/>
        <line x1="${CX}" y1="${CY}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${col}" stroke-width="0.5" stroke-opacity="${i*0.3}" style="animation:${pfx}-node-pulse ${dur} ease-in-out ${delay + n.delay}s infinite;"/>`;
      }).join('');
      return {
        filterDefs: `<filter id="${pfx}-morph-f"><feGaussianBlur stdDeviation="${1.5*i}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
        keyframes: `@keyframes ${pfx}-node-pulse {
          0%,100% { opacity: ${i*0.4}; transform: scale(0.8); }
          50%      { opacity: ${i}; transform: scale(1.2); }
        }`,
        elements: `${logoEl}\n${nodeEls}`,
      };
    }

    case 'LOGO_PRISM_REFRACT': {
      const dur = d_fn(7, sp);
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      const prismColors = ['#ff006e', '#ffbe0b', '#06d6a0', '#00d4ff', '#8338ec'];
      const prismEls = prismColors.map((c, k) => {
        const angle = k * 72;
        const r = (LOGO_W / 2 + 6 + k * 3) * i;
        return `<ellipse cx="${CX}" cy="${CY}" rx="${r}" ry="${r*0.4}" fill="none" stroke="${c}" stroke-width="1" stroke-opacity="${i * 0.5}" style="animation:${pfx}-prism${k} ${(parseFloat(dur) + k * 0.6).toFixed(1)}s linear ${delay + k * 0.3}s infinite; transform-origin:${CX}px ${CY}px; transform:rotate(${angle}deg);"/>`;
      }).join('');
      const prismKeyframes = prismColors.map((_, k) =>
        `@keyframes ${pfx}-prism${k} { from{transform:rotate(${k*72}deg)} to{transform:rotate(${k*72+360}deg)} }`
      ).join('\n');
      return {
        filterDefs: '',
        keyframes: prismKeyframes,
        elements: `${prismEls}\n${logoEl}`,
      };
    }

    case 'LOGO_NEON_OUTLINE': {
      const dur = d_fn(3.5, sp);
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const dash = Math.round(10 * i);
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      return {
        filterDefs: `<filter id="${pfx}-neon-f"><feGaussianBlur stdDeviation="${3*i}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
        keyframes: `@keyframes ${pfx}-neon-trace {
          0%   { stroke-dashoffset: 0; opacity: ${i*0.9}; }
          50%  { opacity: ${i}; }
          100% { stroke-dashoffset: ${-dash * 6}; opacity: ${i*0.9}; }
        }
        @keyframes ${pfx}-neon-glow {
          0%,100% { filter: drop-shadow(0 0 ${2*i}px ${col}); }
          50%      { filter: drop-shadow(0 0 ${6*i}px ${col}) drop-shadow(0 0 ${12*i}px ${col}); }
        }`,
        elements: `<rect x="${LOGO_X-3}" y="${LOGO_Y-3}" width="${LOGO_W+6}" height="${LOGO_H+6}" rx="4" fill="none"
          stroke="${col}" stroke-width="${1.5*i}" stroke-dasharray="${dash} ${dash/2}"
          filter="url(#${pfx}-neon-f)"
          style="animation:${pfx}-neon-trace ${dur} linear ${delay}s infinite, ${pfx}-neon-glow ${(parseFloat(dur)*2).toFixed(1)}s ease-in-out ${delay}s infinite;"/>
        ${logoEl}`,
      };
    }

    case 'LOGO_CRYSTAL_FRAGMENT': {
      const dur = d_fn(8, sp);
      const CX = LOGO_X + LOGO_W/2, CY = LOGO_Y + LOGO_H/2;
      const logoEl = hasLogo ? `<image id="${pfx}-img-anim" href="${logoUrl!.replace(/"/g, '&quot;')}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>` : '';
      const shards = [
        { x: CX-LOGO_W*0.3, y: CY-LOGO_H*0.35, r: 3, d: 0 },
        { x: CX+LOGO_W*0.38, y: CY-LOGO_H*0.2, r: 2.5, d: 1.2 },
        { x: CX-LOGO_W*0.1, y: CY+LOGO_H*0.4, r: 2, d: 2.4 },
        { x: CX+LOGO_W*0.25, y: CY+LOGO_H*0.35, r: 1.5, d: 0.8 },
        { x: CX-LOGO_W*0.4, y: CY+LOGO_H*0.1, r: 2, d: 1.8 },
        { x: CX+LOGO_W*0.1, y: CY-LOGO_H*0.42, r: 1.5, d: 3.0 },
      ];
      const shardEls = shards.map((s, k) =>
        `<polygon points="${s.x},${s.y-s.r*2} ${s.x-s.r*1.5},${s.y+s.r} ${s.x+s.r*1.5},${s.y+s.r}" fill="${col}" fill-opacity="${i*0.5}" style="animation:${pfx}-shard ${dur} ease-in-out ${delay + s.d}s infinite alternate; filter:url(#${pfx}-cryst-f);"/>`
      ).join('');
      return {
        filterDefs: `<filter id="${pfx}-cryst-f"><feGaussianBlur stdDeviation="${1*i}"/></filter>`,
        keyframes: `@keyframes ${pfx}-shard {
          0%   { opacity: ${i*0.3}; transform: scale(0.8) rotate(-10deg); }
          100% { opacity: ${i*0.8}; transform: scale(1.2) rotate(10deg); }
        }`,
        elements: `${shardEls}\n${logoEl}`,
      };
    }

    default: return empty();
  }
}

// ════════════════════════════════════════════
// ZONE NOM
// ════════════════════════════════════════════

function renderNomEffect(d_fn: Function, e: ZoneEffectDecision, varId: string, delay: number, nomX = 186, nomY = 30, nomW = 220): SVGEffectCode {
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
      // Utilise les vraies phases respiratoires du BREATHING pour le rythme exact
      const inspSecs  = effectMetricsRegistry.phaseSecs('BREATHING', 'inspiration', 1.8) * (SPEED_DURATION[sp] ?? 1);
      const retSecs   = effectMetricsRegistry.phaseSecs('BREATHING', 'retention',  0.8)  * (SPEED_DURATION[sp] ?? 1);
      const expirSecs = effectMetricsRegistry.phaseSecs('BREATHING', 'expiration', 2.2) * (SPEED_DURATION[sp] ?? 1);
      const pauseSecs = effectMetricsRegistry.phaseSecs('BREATHING', 'pause',      0.6)  * (SPEED_DURATION[sp] ?? 1);
      const totalSecs = Math.max(inspSecs + retSecs + expirSecs + pauseSecs, 3.5);
      const pInsp = ((inspSecs / totalSecs) * 100).toFixed(1);
      const pRet  = (((inspSecs + retSecs) / totalSecs) * 100).toFixed(1);
      const pExp  = (((inspSecs + retSecs + expirSecs) / totalSecs) * 100).toFixed(1);
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-breathe {
          0%         { opacity: ${(0.85 + i * 0.05).toFixed(2)}; transform: scaleX(1); }
          ${pInsp}%  { opacity: 1; transform: scaleX(${(1 + 0.008*i).toFixed(3)}); }
          ${pRet}%   { opacity: 1; transform: scaleX(${(1 + 0.008*i).toFixed(3)}); }
          ${pExp}%   { opacity: ${(0.85 + i * 0.05).toFixed(2)}; transform: scaleX(1); }
          100%       { opacity: ${(0.82 + i * 0.05).toFixed(2)}; transform: scaleX(${(1 - 0.003*i).toFixed(3)}); }
        }`,
        elements: `<rect x="${nomX}" y="${nomY-2}" width="${nomW}" height="28" fill="${col}" fill-opacity="${(i*0.06).toFixed(3)}" rx="2"
          style="animation:${pfx}-breathe ${totalSecs.toFixed(2)}s cubic-bezier(0.4,0,0.2,1) ${delay}s infinite; transform-box:fill-box; transform-origin:left center;"/>`,
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
  const tx  = 186, ty = 54;

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
  const sx = 170, sy = 16, sh = 148;

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
      // Exploite les vraies métriques STELLAR DRIFT : nombre d'étoiles, vitesse de dérive cosmique
      const dur = d_fn(30, sp);
      const rng = (seed: number) => { const x = Math.sin(seed * 127.1 + 1.9) * 43758.5453; return x - Math.floor(x); };
      // Compte d'étoiles basé sur les métriques réelles + pools de particules
      const nStars = Math.max(20, Math.min(45, effectMetricsRegistry.particles('STELLAR DRIFT', 28)));
      // Vitesse de dérive depuis les paramètres réels
      const vitesse = effectMetricsRegistry.param('STELLAR DRIFT', 'vitesseDeriveCosmique', 0.3) * i;
      const driftX = Math.round(vitesse * 40);
      const driftY = Math.round(vitesse * 25);
      const stars = Array.from({ length: nStars }, (_, idx) => {
        const cx = Math.round(rng(idx * 3.14) * w);
        const cy = Math.round(rng(idx * 7.39) * h);
        const r   = (0.5 + rng(idx * 5.71) * 2.0).toFixed(1);
        const d2  = (rng(idx * 2.97) * parseFloat(dur)).toFixed(1);
        const brightness = (i * (0.3 + rng(idx * 11.3) * 0.7)).toFixed(2);
        // Étoiles plus grandes clignotent aussi
        const r2 = parseFloat(r);
        const twinkle = r2 > 1.5
          ? ` style="animation:${pfx}-star ${dur} linear ${d2}s infinite, ${pfx}-twinkle ${(2 + rng(idx) * 4).toFixed(1)}s ease-in-out ${rng(idx * 3.7).toFixed(1)}s infinite;"`
          : ` style="animation:${pfx}-star ${dur} linear ${d2}s infinite;"`;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" fill-opacity="${brightness}"${twinkle}/>`;
      }).join('');
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-star {
          0%   { transform: translate(0,0); }
          50%  { transform: translate(${driftX}px,${driftY}px); }
          100% { transform: translate(${driftX * 2}px,${driftY}px); }
        }
        @keyframes ${pfx}-twinkle {
          0%,100% { opacity: 1; }
          50%      { opacity: ${(0.2 + i * 0.3).toFixed(2)}; }
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
        elements: `<rect x="186" y="87" width="180" height="12" fill="${col}" fill-opacity="${i*0.08}" rx="2" style="animation:${pfx}-cascade 0.6s ease-out ${delay+0.05}s 1 both;"/>
          <rect x="186" y="102" width="160" height="12" fill="${col}" fill-opacity="${i*0.06}" rx="2" style="animation:${pfx}-cascade 0.6s ease-out ${delay+0.12}s 1 both;"/>
          <rect x="186" y="117" width="170" height="12" fill="${col}" fill-opacity="${i*0.07}" rx="2" style="animation:${pfx}-cascade 0.6s ease-out ${delay+0.2}s 1 both;"/>`,
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
        elements: `<circle cx="186" cy="92"  r="5" fill="${col}" fill-opacity="${i*0.4}" style="animation:${pfx}-icon ${dur} ease-in-out ${delay}s infinite; transform-origin:186px 92px;"/>
          <circle cx="186" cy="107" r="5" fill="${col}" fill-opacity="${i*0.4}" style="animation:${pfx}-icon ${dur} ease-in-out ${delay+1}s infinite; transform-origin:186px 107px;"/>
          <circle cx="186" cy="122" r="5" fill="${col}" fill-opacity="${i*0.4}" style="animation:${pfx}-icon ${dur} ease-in-out ${delay+2}s infinite; transform-origin:186px 122px;"/>`,
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
        elements: `<rect x="185" y="86" width="200" height="46" fill="url(#${pfx}-scan-g)" rx="4"/>`,
      };
    }

    case 'CONTACT_HIGHLIGHT_HOVER': {
      // Surbrillance douce qui parcourt chaque ligne de contact
      const dur = d_fn(8, sp);
      const lineHighlights = [87, 102, 117].map((y, idx) =>
        `<rect x="186" y="${y}" width="190" height="11" fill="${col}" fill-opacity="${i*0.12}" rx="3"
          style="animation:${pfx}-hl ${dur} ease-in-out ${delay + idx * 1.5}s infinite;"/>`
      ).join('');
      return {
        filterDefs: '',
        keyframes: `@keyframes ${pfx}-hl {
          0%,100% { fill-opacity: ${i*0.06}; transform: scaleX(0.95); }
          50%      { fill-opacity: ${i*0.18}; transform: scaleX(1); }
        }`,
        elements: lineHighlights,
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
  const cx = 486, cy = 144, cw = 160, ch = 28, cr = 14;

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
// Chaque zone a ses catégories sémantiques propres — rendu couche la plus profonde en premier.
const LAYER_RENDER_ORDER: Record<string, string[]> = {
  // Logo : aura énergétique → matière physique → effet 3D → transformation finale
  logo:       ['energie', 'matiere', 'dimension', 'transformation'],
  // Nom : lumière ambiante → mouvement continu
  nom:        ['lumiere', 'mouvement'],
  // Titre : rythme de fond continu → texture colorée → animation d'apparition (au premier plan)
  titre:      ['rythme', 'texture', 'apparition'],
  // Contact : ligne de scan en fond → pulsation des icônes → entrée en cascade (au premier plan)
  contact:    ['scan', 'emphasis', 'entree'],
  // Séparateur : respiration de base → flux d'énergie → éclat électrique (le plus visible)
  separateur: ['rythme', 'flux', 'eclat'],
  // Fond : couche épurée → ambiance atmosphérique → structure géométrique (au premier plan)
  fond:       ['epure', 'ambiance', 'structure'],
  // CTA : invitation douce → brillance/shimmer → attraction magnétique (le plus saillant)
  cta:        ['invitation', 'brillance', 'attraction'],
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
  palette: string[],
  logoUrl?: string
): ZoneSVGResult {
  const varId  = `v${variationIndex.toLowerCase()}`;

  // ── TimingMaster : durées basées sur le nombre d'or et Fibonacci ──────────
  const timingProfile = getTimingProfile(variationIndex);
  const d_fn = buildDurationFn(timingProfile);

  const c0 = palette[0] ?? '#0f172a';
  const c1 = palette[1] ?? '#6366f1';
  const c2 = palette[2] ?? '#e2e8f0';

  // ── ColorHarmonyEngine : palette enrichie par zone ────────────────────────
  const varIndexNum = ['A', 'B', 'C', 'D'].indexOf(variationIndex);
  const zoneColors = enrichZoneColors(c1, c0, varIndexNum >= 0 ? varIndexNum : 0);

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

  // Décision par défaut pour les zones non fournies
  const defaultDecision: ZoneEffectDecision = {
    effet_id: 'FADE LAYERS',
    intensity: 0.5,
    speed: 'medium' as any,
    color: c1,
    opacity: 1,
  };

  const logoResult = renderZoneWithLayers(
    'logo', withColor(composition.logo ?? defaultDecision, 'logo', c1), varId, logoDelay,
    (dec, vid, delay) => renderLogoEffect(d_fn, dec, vid, delay, logoUrl), c1
  );

  const nomResult = renderZoneWithLayers(
    'nom', withColor(composition.nom ?? defaultDecision, 'nom', c1), varId, nomDelay,
    (dec, vid, delay) => renderNomEffect(d_fn, dec, vid, delay), c1
  );

  const sepResult = renderZoneWithLayers(
    'separateur', withColor(composition.separateur ?? defaultDecision, 'separateur', c1), varId, sepDelay,
    (dec, vid, delay) => renderSeparateurEffect(d_fn, dec, vid, delay), c1
  );

  const fondResult = renderZoneWithLayers(
    'fond', withColor(composition.fond ?? defaultDecision, 'fond', c1), varId, fondDelay,
    (dec, vid, delay) => renderFondEffect(d_fn, dec, vid, delay), c1
  );

  const ctaResult = renderZoneWithLayers(
    'cta', withColor(composition.cta ?? defaultDecision, 'cta', c1), varId, ctaDelay,
    (dec, vid, delay) => renderCtaEffect(d_fn, dec, vid, delay), c1
  );

  const titreResult = renderZoneWithLayers(
    'titre', withColor(composition.titre ?? { ...defaultDecision, color: c2 }, 'titre', c2), varId, titreDelay,
    (dec, vid, delay) => renderTitreEffect(d_fn, dec, vid, delay), c2
  );

  const contactResult = renderZoneWithLayers(
    'contact', withColor(composition.contact ?? defaultDecision, 'contact', c1), varId, contDelay,
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
