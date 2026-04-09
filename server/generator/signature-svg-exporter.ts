import type { SignatureBaseResult } from './signature-base-generator';
import type { VariationsResult } from './signature-variations-generator';

export interface SVGExportResult {
  svgContent: string;
  filename: string;
  metadata: {
    cycle_total: number;
    variations_count: number;
    dimensions: string;
    compatible_clients: string[];
  };
}

export class SignatureSVGExporter {
  export(
    nom: string,
    baseResult: SignatureBaseResult,
    variationsResult: VariationsResult
  ): SVGExportResult {
    const { svgBase, width, height, palette, logo_url } = baseResult;
    const { variations, globalDefs } = variationsResult;
    const [c0, c1, c2] = palette;

    const timestamp = Date.now();
    const slug = nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const filename = `signature-${slug}-${timestamp}.svg`;

    const svgContent = this.buildFinalSVG(svgBase, variations, globalDefs, width, height, c0, c1, c2, logo_url);

    return {
      svgContent,
      filename,
      metadata: {
        cycle_total: 16,
        variations_count: 4,
        dimensions: `${width}px x ${height}px`,
        compatible_clients: ['gmail', 'outlook', 'apple_mail'],
      },
    };
  }

  private buildFinalSVG(
    svgBase: string,
    variations: any[],
    globalDefs: string,
    width: number,
    height: number,
    c0: string,
    c1: string,
    c2: string,
    logoUrl?: string
  ): string {
    const [varA, varB, varC, varD] = variations;

    const timing = this.buildTimingCSS();
    const transitionCSS = this.buildTransitionCSS();
    const allVariantCSS = variations.map(v => v.cssAnimations).join('\n');
    const logoHideCSS = logoUrl
      ? `#company-logo-text { display: none; }` // masque le texte si vrai logo
      : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
     overflow="hidden"
     role="img" aria-label="Email Signature">
  <title>Email Signature</title>

  <defs>
    <!-- Dégradé de fond principal — profondeur premium -->
    <linearGradient id="grad-bg-main" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="70%" stop-color="${c0}"/>
      <stop offset="100%" stop-color="${c0}" stop-opacity="0.82"/>
    </linearGradient>
    <!-- Lumière directionnelle douce depuis le logo -->
    <radialGradient id="grad-logo-spotlight" cx="76" cy="90" r="72" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${c0}" stop-opacity="0"/>
    </radialGradient>
    <!-- Halo angulaire depuis le coin supérieur droit (accent) -->
    <radialGradient id="grad-corner-glow" cx="100%" cy="0%" r="60%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${c0}" stop-opacity="0"/>
    </radialGradient>

    ${globalDefs}

    <style>
      /* =============================================
         EFFECTFORGE AI — Living Email Signature SVG
         Cycle: 240s total | 4 Variations | Pure CSS
         No JavaScript | Email-compatible
         ============================================= */

${timing}

${transitionCSS}

${allVariantCSS}
${logoHideCSS}

      /* Variation layer visibility orchestration */
      #layer-var-a, #layer-var-b, #layer-var-c, #layer-var-d {
        opacity: 0;
        will-change: opacity;
      }

      /* ================================================================
         TIMING ORCHESTRATION — 16s cycle | CROSSFADE CONTINU (no gap)
         Principe : chaque variation se CHEVAUCHE avec la suivante.
         A s'éteint pendant que B s'allume → zéro zone morte.
         Chaque variation visible ~4s | Transition crossfade 0.5s
         Layer A démarre IMMÉDIATEMENT visible (opacity:1 à 0%)
         ================================================================ */

      /* Cycle 16s : A→B→C→D→A en boucle parfaite sans blanc */
      #layer-var-a { animation: layer-fade-a 16s cubic-bezier(0.4,0,0.2,1) 0s infinite; }
      #layer-var-b { animation: layer-fade-b 16s cubic-bezier(0.4,0,0.2,1) 0s infinite; }
      #layer-var-c { animation: layer-fade-c 16s cubic-bezier(0.4,0,0.2,1) 0s infinite; }
      #layer-var-d { animation: layer-fade-d 16s cubic-bezier(0.4,0,0.2,1) 0s infinite; }

      /* A : démarre IMMÉDIATEMENT visible | présent 0%→25% | descente 25%→28.125% | retour à 100% */
      @keyframes layer-fade-a {
        0%       { opacity: 1; }
        25%      { opacity: 1; }
        28.125%  { opacity: 0; }
        96.875%  { opacity: 0; }
        100%     { opacity: 1; }
      }

      /* B : 21.875%→25% montée (chevauche A) | 25%→50% présent | 50%→53.125% descente */
      @keyframes layer-fade-b {
        0%       { opacity: 0; }
        21.875%  { opacity: 0; }
        25%      { opacity: 1; }
        50%      { opacity: 1; }
        53.125%  { opacity: 0; }
        100%     { opacity: 0; }
      }

      /* C : 46.875%→50% montée | 50%→75% présent | 75%→78.125% descente */
      @keyframes layer-fade-c {
        0%       { opacity: 0; }
        46.875%  { opacity: 0; }
        50%      { opacity: 1; }
        75%      { opacity: 1; }
        78.125%  { opacity: 0; }
        100%     { opacity: 0; }
      }

      /* D : 71.875%→75% montée | 75%→96.875% présent | 96.875%→100% descente → A reprend à 1 */
      @keyframes layer-fade-d {
        0%       { opacity: 0; }
        71.875%  { opacity: 0; }
        75%      { opacity: 1; }
        96.875%  { opacity: 1; }
        100%     { opacity: 0; }
      }

      /* Couche de base — toujours visible, fond de scène permanent */
      #layer-base { opacity: 1; }
      #bg-base    { opacity: 1; }

      /* Respiration légère sur le fond : la signature est vivante même au repos */
      @keyframes sig-base-breathe {
        0%, 100% { filter: brightness(1);   }
        50%      { filter: brightness(1.04); }
      }
      #layer-base {
        animation: sig-base-breathe 14s ease-in-out 0s infinite;
      }

      /* Internal variation animations timing */
      #var-a, #var-a-halo, #var-a-shimmer, #var-a-sep {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }
      #var-b, #var-b-wave1, #var-b-wave2, #var-b-logo-glow, #var-b-sep {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }
      #var-c, #var-c-ring, #var-c-shimmer, #var-c-sep {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }
      #var-d, #var-d-outer, #var-d-inner, #var-d-cta, #var-d-sep, #var-d-logo {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }

    </style>
  </defs>

  <!-- ===== LAYER 0: Background dégradé premium ===== -->
  <rect id="bg-root" x="0" y="0" width="${width}" height="${height}" fill="url(#grad-bg-main)" rx="12"/>
  <!-- Lumière douce autour du logo -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#grad-logo-spotlight)" rx="12"/>
  <!-- Halo accent depuis le coin -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#grad-corner-glow)" rx="12"/>

  <!-- ===== LAYER 1: Static Base — Always Visible ===== -->
  <!-- Logo statique masqué par CSS ; chaque variation en fournit une copie animée -->
  <g id="layer-base">
    ${svgBase}
  </g>

  <!-- ===== LAYER 2: Variation A — Breathing Particles ===== -->
  <g id="layer-var-a">
    ${varA.svgElements}
  </g>

  <!-- ===== LAYER 3: Variation B — Chromatic Wave ===== -->
  <g id="layer-var-b">
    ${varB.svgElements}
  </g>

  <!-- ===== LAYER 4: Variation C — Generative Noise ===== -->
  <g id="layer-var-c">
    ${varC.svgElements}
  </g>

  <!-- ===== LAYER 5: Variation D — Luminous Respiration ===== -->
  <g id="layer-var-d">
    ${varD.svgElements}
  </g>

</svg>`;
  }

  private buildTimingCSS(): string {
    return `      /* Timing custom properties */
      :root {
        --cycle: 16s;
        --fade-dur: 0.5s;
        --mouse-x: 0.5;
        --mouse-y: 0.5;
        --energy: 1;
      }`;
  }

  private buildTransitionCSS(): string {
    return `      /* Smooth cross-fade transitions between variations — cubic-bezier */
      .var-layer-enter { animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      .var-layer-exit  { animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      /* Micro-parallax réactif à la souris via CSS custom properties */
      #layer-var-a, #layer-var-b, #layer-var-c, #layer-var-d {
        transform-origin: center;
        transition: filter 0.8s ease;
      }`;
  }
}

export const signatureSVGExporter = new SignatureSVGExporter();
