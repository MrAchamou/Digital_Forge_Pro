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
        cycle_total: 240,
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
    // Si un logo image est fourni, le logo statique est masqué car chaque variation active
    // fournit sa propre copie animée positionnée exactement par-dessus
    const logoHideCSS = logoUrl
      ? `\n      /* Logo statique caché — copies animées dans chaque variation */\n      #company-logo { visibility: hidden; }`
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
      }

      /* === TIMING ORCHESTRATION (240s cycle) === */

      /* VAR A: appears at 0s, fades at 8s, gone by 10s */
      #layer-var-a {
        animation: layer-fade-a 240s ease-in-out 0s infinite;
      }
      /* VAR B: appears at 60s, fades at 70s */
      #layer-var-b {
        animation: layer-fade-b 240s ease-in-out 0s infinite;
      }
      /* VAR C: appears at 120s, fades at 130s */
      #layer-var-c {
        animation: layer-fade-c 240s ease-in-out 0s infinite;
      }
      /* VAR D: appears at 180s, fades at 190s */
      #layer-var-d {
        animation: layer-fade-d 240s ease-in-out 0s infinite;
      }

      @keyframes layer-fade-a {
        0%       { opacity: 0; }
        0.5%     { opacity: 0; }
        2%       { opacity: 1; }
        22%      { opacity: 1; }
        24%      { opacity: 0; }
        100%     { opacity: 0; }
      }

      @keyframes layer-fade-b {
        0%       { opacity: 0; }
        24%      { opacity: 0; }
        25.5%    { opacity: 1; }
        48%      { opacity: 1; }
        49.5%    { opacity: 0; }
        100%     { opacity: 0; }
      }

      @keyframes layer-fade-c {
        0%       { opacity: 0; }
        49.5%    { opacity: 0; }
        51%      { opacity: 1; }
        73%      { opacity: 1; }
        74.5%    { opacity: 0; }
        100%     { opacity: 0; }
      }

      @keyframes layer-fade-d {
        0%       { opacity: 0; }
        74.5%    { opacity: 0; }
        76%      { opacity: 1; }
        98%      { opacity: 1; }
        99.5%    { opacity: 0; }
        100%     { opacity: 0; }
      }

      /* Internal variation animations timing */
      /* VAR A internal elements (particles excluded — they have individual calc() durations) */
      #var-a, #var-a-halo, #var-a-shimmer, #var-a-sep {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }

      /* VAR B internal elements */
      #var-b, #var-b-wave1, #var-b-wave2, #var-b-logo-glow, #var-b-sep {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }

      /* VAR C internal elements (particles excluded — they have individual calc() durations) */
      #var-c, #var-c-ring, #var-c-shimmer, #var-c-sep {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }

      /* VAR D internal elements */
      #var-d, #var-d-outer, #var-d-inner, #var-d-cta, #var-d-sep, #var-d-logo {
        animation-duration: 10s;
        animation-iteration-count: infinite;
      }

      /* Micro-variation on repetitions: subtle scale + hue shift */
      #layer-var-a { animation-timing-function: ease-in-out; }
      #layer-var-b { animation-timing-function: ease-in-out; }
      #layer-var-c { animation-timing-function: ease-in-out; }
      #layer-var-d { animation-timing-function: ease-in-out; }

      /* Base layer always on top */
      #layer-base {
        opacity: 1;
      }

      /* Static background always visible */
      #bg-base {
        opacity: 1;
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
        --cycle: 240s;
        --fade-dur: 2s;
      }`;
  }

  private buildTransitionCSS(): string {
    return `      /* Smooth cross-fade transitions between variations */
      .var-layer-enter {
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      .var-layer-exit {
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }`;
  }
}

export const signatureSVGExporter = new SignatureSVGExporter();
