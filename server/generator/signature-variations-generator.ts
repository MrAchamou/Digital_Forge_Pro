import type { StyleData } from './signature-base-generator';
import { renderZoneComposition, assembleSVGEffects } from '../services/zone-svg-renderer';
import type { ZoneComposition } from '../services/harmony-validator';

export interface VariationEffect {
  id: string;
  label: string;
  cssAnimations: string;
  svgElements: string;
}

export interface VariationsResult {
  variations: [VariationEffect, VariationEffect, VariationEffect, VariationEffect];
  globalDefs: string;
}

const INTENSITY_MAP = {
  low:    { particleCount: 6,  speed: 'slow',   opacity: 0.25, blur: 1 },
  medium: { particleCount: 12, speed: 'normal',  opacity: 0.45, blur: 2 },
  high:   { particleCount: 20, speed: 'fast',    opacity: 0.65, blur: 3 },
};

const VARIATION_LABELS: Record<string, string> = {
  A: 'Stable et Rassurant',
  B: 'Précis et Dynamique',
  C: 'Profond et Atmosphérique',
  D: 'Puissant et Mémorable',
};

export class SignatureVariationsGenerator {
  generate(
    style: StyleData,
    palette: string[],
    zoneCompositions?: { A: ZoneComposition; B: ZoneComposition; C: ZoneComposition; D: ZoneComposition },
    logoUrl?: string
  ): VariationsResult {
    const [c0, c1, c2] = palette;
    const cfg = INTENSITY_MAP[style.intensite] || INTENSITY_MAP.medium;

    if (zoneCompositions) {
      return this.buildZoneVariations(palette, zoneCompositions, logoUrl);
    }

    const varA = this.buildVariationA(c0, c1, c2, cfg, style);
    const varB = this.buildVariationB(c0, c1, c2, cfg, style);
    const varC = this.buildVariationC(c0, c1, c2, cfg, style);
    const varD = this.buildVariationD(c0, c1, c2, cfg, style);
    const globalDefs = this.buildGlobalDefs(c0, c1, c2, cfg);

    return { variations: [varA, varB, varC, varD], globalDefs };
  }

  private buildZoneVariations(
    palette: string[],
    zoneCompositions: { A: ZoneComposition; B: ZoneComposition; C: ZoneComposition; D: ZoneComposition },
    logoUrl?: string
  ): VariationsResult {
    const [c0, c1, c2] = palette;
    const variations = (['A', 'B', 'C', 'D'] as const).map((varKey, idx) => {
      const composition = zoneCompositions[varKey];
      const delayOffset = idx === 0 ? 0 : 0;
      const zoneResult  = renderZoneComposition(composition, varKey, delayOffset, palette, logoUrl);
      const assembled   = assembleSVGEffects(zoneResult);

      const varId = `var-${varKey.toLowerCase()}`;

      return {
        id:            varId,
        label:         VARIATION_LABELS[varKey] || varKey,
        cssAnimations: assembled.allKeyframes
          ? `/* === VARIATION ${varKey}: ${VARIATION_LABELS[varKey]} — Zone System === */\n${assembled.allKeyframes}`
          : `/* === VARIATION ${varKey}: ${VARIATION_LABELS[varKey]} === */`,
        svgElements: `<g id="${varId}">${assembled.allElements}</g>`,
        filterDefsExtra: assembled.allFilterDefs,
      };
    }) as any[];

    const globalDefs = this.buildGlobalDefsZone(palette, variations);

    return {
      variations: variations as [VariationEffect, VariationEffect, VariationEffect, VariationEffect],
      globalDefs,
    };
  }

  private buildGlobalDefsZone(palette: string[], variations: any[]): string {
    const [c0, c1, c2] = palette;
    const extraDefs = variations.map((v: any) => v.filterDefsExtra || '').filter(Boolean).join('\n');

    return `<!-- Gradients de base pour toutes les variations -->
    <linearGradient id="grad-bg-a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="grad-bg-b" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="grad-shimmer" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${c1}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="grad-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="grad-sep-flow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0"/>
      <stop offset="40%" stop-color="${c1}" stop-opacity="1"/>
      <stop offset="60%" stop-color="${c2}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
    </linearGradient>
    ${extraDefs}`;
  }

  private buildGlobalDefs(c0: string, c1: string, c2: string, cfg: any): string {
    return `<!-- Gradient definitions for all variations -->
    <linearGradient id="grad-bg-a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="grad-bg-b" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="grad-shimmer" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${c1}" stop-opacity="${cfg.opacity}"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="grad-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="${cfg.opacity}"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="grad-sep-flow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0"/>
      <stop offset="40%" stop-color="${c1}" stop-opacity="1"/>
      <stop offset="60%" stop-color="${c2}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
    </linearGradient>`;
  }

  private buildVariationA(c0: string, c1: string, c2: string, cfg: any, style: StyleData): VariationEffect {
    const particles = this.generateParticleRects(cfg.particleCount, c1, 600, 180, 'pA');

    const css = `
      /* === VARIATION A: Breathing Particles === */
      @keyframes breathe-bg-a {
        0%, 100% { opacity: 0; }
        10% { opacity: ${cfg.opacity * 0.8}; }
        90% { opacity: ${cfg.opacity * 0.8}; }
      }
      @keyframes float-pA {
        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
        10% { opacity: ${cfg.opacity}; }
        50% { transform: translateY(-18px) translateX(8px); opacity: ${cfg.opacity}; }
        90% { opacity: 0; }
      }
      @keyframes pulse-photo-a {
        0%, 100% { opacity: 0; }
        20% { opacity: ${cfg.opacity * 0.5}; }
        80% { opacity: ${cfg.opacity * 0.5}; }
      }
      @keyframes shimmer-name-a {
        0%, 100% { opacity: 0; }
        15% { opacity: 0; }
        30% { opacity: 1; }
        60% { opacity: 1; }
        80% { opacity: 0; }
      }
      @keyframes sep-flow-a {
        0%, 100% { opacity: 0; }
        10% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        90% { opacity: 0; }
      }
      #var-a { animation: breathe-bg-a 10s ease-in-out 0s infinite; }
      #var-a-particles > * { animation: float-pA calc(3s + var(--i) * 0.4s) ease-in-out 0s infinite; }
      #var-a-halo { animation: pulse-photo-a 10s ease-in-out 0s infinite; }
      #var-a-shimmer { animation: shimmer-name-a 10s ease-in-out 0s infinite; }
      #var-a-sep { animation: sep-flow-a 10s ease-in-out 0s infinite; }`;

    const svg = `<g id="var-a">
      <!-- Subtle background wash -->
      <rect x="0" y="0" width="600" height="180" fill="url(#grad-bg-a)" rx="12"/>
      <!-- Floating particles -->
      <g id="var-a-particles">${particles}</g>
      <!-- Photo halo -->
      <circle id="var-a-halo" cx="76" cy="76" r="58" fill="url(#grad-halo)"/>
      <!-- Name shimmer bar -->
      <rect id="var-a-shimmer" x="186" y="12" width="200" height="24" fill="url(#grad-shimmer)" rx="4"/>
      <!-- Separator glow -->
      <rect id="var-a-sep" x="170" y="16" width="4" height="148" fill="url(#grad-sep-flow)" rx="2"/>
    </g>`;

    return { id: 'var-a', label: 'Breathing Particles', cssAnimations: css, svgElements: svg };
  }

  private buildVariationB(c0: string, c1: string, c2: string, cfg: any, style: StyleData): VariationEffect {
    const css = `
      /* === VARIATION B: Chromatic Wave === */
      @keyframes breathe-bg-b {
        0%, 100% { opacity: 0; }
        10% { opacity: ${cfg.opacity * 0.7}; }
        90% { opacity: ${cfg.opacity * 0.7}; }
      }
      @keyframes wave-b {
        0%, 100% { transform: translateX(-600px); opacity: 0; }
        5% { opacity: 0; }
        10% { opacity: ${cfg.opacity * 0.6}; }
        50% { transform: translateX(0px); opacity: ${cfg.opacity * 0.6}; }
        90% { opacity: ${cfg.opacity * 0.6}; }
        95% { opacity: 0; }
      }
      @keyframes wave-b2 {
        0%, 100% { transform: translateX(600px); opacity: 0; }
        5% { opacity: 0; }
        15% { opacity: ${cfg.opacity * 0.4}; }
        50% { transform: translateX(0px); }
        85% { opacity: ${cfg.opacity * 0.4}; }
        95% { opacity: 0; }
      }
      @keyframes hue-logo-b {
        0%, 100% { opacity: 0; }
        10% { opacity: 0; }
        20%, 80% { opacity: ${cfg.opacity}; }
        90% { opacity: 0; }
      }
      @keyframes sep-pulse-b {
        0%, 100% { opacity: 0; transform: scaleY(0.8); }
        15%, 85% { opacity: 0.8; transform: scaleY(1); }
      }
      #var-b { animation: breathe-bg-b 10s ease-in-out 0s infinite; }
      #var-b-wave1 { animation: wave-b 10s ease-in-out 0s infinite; }
      #var-b-wave2 { animation: wave-b2 10s ease-in-out 0s infinite; }
      #var-b-logo-glow { animation: hue-logo-b 10s ease-in-out 0s infinite; }
      #var-b-sep { animation: sep-pulse-b 10s ease-in-out 0s infinite; transform-origin: 170px 90px; }`;

    const svg = `<g id="var-b">
      <rect x="0" y="0" width="600" height="180" fill="${c1}" fill-opacity="0.05" rx="12"/>
      <rect id="var-b-wave1" x="-600" y="0" width="600" height="180" fill="url(#grad-bg-b)" rx="12"/>
      <rect id="var-b-wave2" x="0" y="0" width="600" height="180" fill="${c2}" fill-opacity="0.08" rx="12"/>
      <ellipse id="var-b-logo-glow" cx="76" cy="154" rx="55" ry="18" fill="${c1}" fill-opacity="0.2"/>
      <rect id="var-b-sep" x="170" y="16" width="4" height="148" fill="${c1}" fill-opacity="0.5" rx="2"/>
    </g>`;

    return { id: 'var-b', label: 'Chromatic Wave', cssAnimations: css, svgElements: svg };
  }

  private buildVariationC(c0: string, c1: string, c2: string, cfg: any, style: StyleData): VariationEffect {
    const particles = this.generateParticleRects(Math.ceil(cfg.particleCount * 0.6), c2, 600, 180, 'pC', true);

    const css = `
      /* === VARIATION C: Generative Noise === */
      @keyframes breathe-bg-c {
        0%, 100% { opacity: 0; }
        10% { opacity: ${cfg.opacity * 0.6}; }
        90% { opacity: ${cfg.opacity * 0.6}; }
      }
      @keyframes noise-pC {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
        10% { opacity: ${cfg.opacity * 0.8}; }
        33% { transform: translateY(-12px) scale(1.1); }
        66% { transform: translateY(8px) scale(0.9); }
        90% { opacity: 0; }
      }
      @keyframes ring-expand-c {
        0%, 100% { r: 52; opacity: 0; }
        10% { opacity: 0; }
        20%, 80% { r: 58; opacity: ${cfg.opacity * 0.6}; }
        90% { opacity: 0; }
      }
      @keyframes text-shimmer-c {
        0%, 100% { opacity: 0; }
        15% { opacity: 0; }
        25%, 75% { opacity: 1; }
        85% { opacity: 0; }
      }
      @keyframes sep-noise-c {
        0%, 100% { opacity: 0; }
        10%, 90% { opacity: 0.6; }
      }
      #var-c { animation: breathe-bg-c 10s ease-in-out 0s infinite; }
      #var-c-particles > * { animation: noise-pC calc(2.5s + var(--i) * 0.3s) ease-in-out 0s infinite; }
      #var-c-ring { animation: ring-expand-c 10s ease-in-out 0s infinite; }
      #var-c-shimmer { animation: text-shimmer-c 10s ease-in-out 0s infinite; }
      #var-c-sep { animation: sep-noise-c 10s ease-in-out 0s infinite; }`;

    const svg = `<g id="var-c">
      <rect x="0" y="0" width="600" height="180" fill="${c0}" fill-opacity="0.3" rx="12"/>
      <g id="var-c-particles">${particles}</g>
      <circle id="var-c-ring" cx="76" cy="76" r="52" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="8 4"/>
      <rect id="var-c-shimmer" x="186" y="34" width="280" height="14" fill="url(#grad-shimmer)" rx="2"/>
      <rect id="var-c-sep" x="170" y="16" width="2" height="148" fill="${c2}" fill-opacity="0.4" rx="1"/>
    </g>`;

    return { id: 'var-c', label: 'Generative Noise', cssAnimations: css, svgElements: svg };
  }

  private buildVariationD(c0: string, c1: string, c2: string, cfg: any, style: StyleData): VariationEffect {
    const css = `
      /* === VARIATION D: Luminous Respiration === */
      @keyframes breathe-bg-d {
        0%, 100% { opacity: 0; }
        10% { opacity: ${cfg.opacity * 0.9}; }
        90% { opacity: ${cfg.opacity * 0.9}; }
      }
      @keyframes resp-outer-d {
        0%, 100% { r: 58; opacity: 0; }
        10% { opacity: 0; }
        20% { r: 64; opacity: ${cfg.opacity * 0.4}; }
        50% { r: 58; opacity: ${cfg.opacity * 0.2}; }
        80% { r: 64; opacity: ${cfg.opacity * 0.4}; }
        90% { opacity: 0; }
      }
      @keyframes resp-inner-d {
        0%, 100% { r: 52; opacity: 0; }
        10% { opacity: 0; }
        20%, 80% { r: 54; opacity: ${cfg.opacity * 0.7}; }
        50% { r: 52; opacity: ${cfg.opacity * 0.5}; }
        90% { opacity: 0; }
      }
      @keyframes cta-glow-d {
        0%, 100% { opacity: 0; }
        15%, 85% { opacity: 0.5; }
        50% { opacity: 0.8; }
      }
      @keyframes sep-resp-d {
        0%, 100% { opacity: 0; }
        15% { opacity: 0.3; }
        50% { opacity: 1; }
        85% { opacity: 0.3; }
      }
      @keyframes logo-rotate-d {
        0%, 100% { opacity: 0; transform: rotate(0deg); }
        10% { opacity: ${cfg.opacity * 0.3}; }
        50% { transform: rotate(${cfg.speed === 'fast' ? '6' : '3'}deg); }
        90% { opacity: 0; }
      }
      #var-d { animation: breathe-bg-d 10s ease-in-out 0s infinite; }
      #var-d-outer { animation: resp-outer-d 10s ease-in-out 0s infinite; }
      #var-d-inner { animation: resp-inner-d 10s ease-in-out 0s infinite; }
      #var-d-cta { animation: cta-glow-d 10s ease-in-out 0s infinite; }
      #var-d-sep { animation: sep-resp-d 10s ease-in-out 0s infinite; }
      #var-d-logo { animation: logo-rotate-d 10s ease-in-out 0s infinite; transform-origin: 76px 154px; }`;

    const svg = `<g id="var-d">
      <rect x="0" y="0" width="600" height="180" fill="${c1}" fill-opacity="0.06" rx="12"/>
      <circle id="var-d-outer" cx="76" cy="76" r="58" fill="url(#grad-halo)" stroke="${c1}" stroke-width="1"/>
      <circle id="var-d-inner" cx="76" cy="76" r="52" fill="url(#grad-halo)"/>
      <ellipse id="var-d-logo" cx="76" cy="154" rx="50" ry="15" fill="${c1}" fill-opacity="0.15"/>
      <rect id="var-d-cta" x="406" y="130" width="160" height="28" rx="14" fill="${c1}" fill-opacity="0.4"/>
      <rect id="var-d-sep" x="170" y="16" width="4" height="148" fill="url(#grad-sep-flow)" rx="2"/>
    </g>`;

    return { id: 'var-d', label: 'Luminous Respiration', cssAnimations: css, svgElements: svg };
  }

  private generateParticleRects(
    count: number,
    color: string,
    maxW: number,
    maxH: number,
    prefix: string,
    asCircles = false
  ): string {
    const items: string[] = [];
    const rng = (seed: number) => {
      let x = Math.sin(seed + 1) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      const x = Math.round(rng(i * 3.1) * maxW);
      const y = Math.round(rng(i * 7.3) * maxH);
      const r = Math.round(1 + rng(i * 5.7) * 4);
      if (asCircles) {
        items.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity="0.6" style="--i:${i}" />`);
      } else {
        items.push(`<rect x="${x}" y="${y}" width="${r * 2}" height="${r * 2}" rx="${r}" fill="${color}" fill-opacity="0.5" style="--i:${i}"/>`);
      }
    }
    return items.join('\n        ');
  }
}

export const signatureVariationsGenerator = new SignatureVariationsGenerator();
