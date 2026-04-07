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
        cycle_total: 80,
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
     role="img" aria-label="Email Signature">
  <title>Email Signature</title>

  <defs>
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
         TIMING ORCHESTRATION — 80s cycle | CROSSFADE CONTINU (no gap)
         Principe : chaque variation se CHEVAUCHE avec la suivante.
         A s'éteint pendant que B s'allume → zéro zone morte.
         Chaque variation visible ~20s | Transition crossfade 2s
         ================================================================ */

      /* Cycle 80s : A→B→C→D→A en boucle parfaite sans blanc */
      #layer-var-a { animation: layer-fade-a 80s cubic-bezier(0.4,0,0.2,1) 0s infinite; }
      #layer-var-b { animation: layer-fade-b 80s cubic-bezier(0.4,0,0.2,1) 0s infinite; }
      #layer-var-c { animation: layer-fade-c 80s cubic-bezier(0.4,0,0.2,1) 0s infinite; }
      #layer-var-d { animation: layer-fade-d 80s cubic-bezier(0.4,0,0.2,1) 0s infinite; }

      /* A : 0%→2.5% montée | 2.5%→22.5% présent | 22.5%→25% descente  */
      @keyframes layer-fade-a {
        0%      { opacity: 0; }
        2.5%    { opacity: 1; }
        22.5%   { opacity: 1; }
        25%     { opacity: 0; }
        98%     { opacity: 0; }
        100%    { opacity: 0; }
      }

      /* B : 22.5%→25% montée (chevauche la descente de A) | 25%→47.5% présent | 47.5%→50% descente */
      @keyframes layer-fade-b {
        0%      { opacity: 0; }
        22.5%   { opacity: 0; }
        25%     { opacity: 1; }
        47.5%   { opacity: 1; }
        50%     { opacity: 0; }
        100%    { opacity: 0; }
      }

      /* C : 47.5%→50% montée | 50%→72.5% présent | 72.5%→75% descente */
      @keyframes layer-fade-c {
        0%      { opacity: 0; }
        47.5%   { opacity: 0; }
        50%     { opacity: 1; }
        72.5%   { opacity: 1; }
        75%     { opacity: 0; }
        100%    { opacity: 0; }
      }

      /* D : 72.5%→75% montée | 75%→97.5% présent | 97.5%→100% descente → retour à A */
      @keyframes layer-fade-d {
        0%      { opacity: 0; }
        72.5%   { opacity: 0; }
        75%     { opacity: 1; }
        97.5%   { opacity: 1; }
        100%    { opacity: 0; }
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

  <!-- ===== LAYER 0: Static Background ===== -->
  <rect id="bg-root" x="0" y="0" width="${width}" height="${height}" fill="${c0}" rx="12"/>

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
        --cycle: 80s;
        --fade-dur: 2s;
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
