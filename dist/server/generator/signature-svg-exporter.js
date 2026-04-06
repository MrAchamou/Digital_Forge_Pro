var SignatureSVGExporter = /** @class */ (function () {
    function SignatureSVGExporter() {
    }
    SignatureSVGExporter.prototype.export = function (nom, baseResult, variationsResult) {
        var svgBase = baseResult.svgBase, width = baseResult.width, height = baseResult.height, palette = baseResult.palette;
        var variations = variationsResult.variations, globalDefs = variationsResult.globalDefs;
        var c0 = palette[0], c1 = palette[1], c2 = palette[2];
        var timestamp = Date.now();
        var slug = nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        var filename = "signature-".concat(slug, "-").concat(timestamp, ".svg");
        var svgContent = this.buildFinalSVG(svgBase, variations, globalDefs, width, height, c0, c1, c2);
        return {
            svgContent: svgContent,
            filename: filename,
            metadata: {
                cycle_total: 240,
                variations_count: 4,
                dimensions: "".concat(width, "px x ").concat(height, "px"),
                compatible_clients: ['gmail', 'outlook', 'apple_mail'],
            },
        };
    };
    SignatureSVGExporter.prototype.buildFinalSVG = function (svgBase, variations, globalDefs, width, height, c0, c1, c2) {
        var varA = variations[0], varB = variations[1], varC = variations[2], varD = variations[3];
        var timing = this.buildTimingCSS();
        var transitionCSS = this.buildTransitionCSS();
        var allVariantCSS = variations.map(function (v) { return v.cssAnimations; }).join('\n');
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n     width=\"".concat(width, "\" height=\"").concat(height, "\" viewBox=\"0 0 ").concat(width, " ").concat(height, "\"\n     role=\"img\" aria-label=\"Email Signature\">\n  <title>Email Signature</title>\n\n  <defs>\n    ").concat(globalDefs, "\n\n    <style>\n      /* =============================================\n         EFFECTFORGE AI \u2014 Living Email Signature SVG\n         Cycle: 240s total | 4 Variations | Pure CSS\n         No JavaScript | Email-compatible\n         ============================================= */\n\n").concat(timing, "\n\n").concat(transitionCSS, "\n\n").concat(allVariantCSS, "\n\n      /* Variation layer visibility orchestration */\n      #layer-var-a, #layer-var-b, #layer-var-c, #layer-var-d {\n        opacity: 0;\n      }\n\n      /* === TIMING ORCHESTRATION (240s cycle) === */\n\n      /* VAR A: appears at 0s, fades at 8s, gone by 10s */\n      #layer-var-a {\n        animation: layer-fade-a 240s ease-in-out 0s infinite;\n      }\n      /* VAR B: appears at 60s, fades at 70s */\n      #layer-var-b {\n        animation: layer-fade-b 240s ease-in-out 0s infinite;\n      }\n      /* VAR C: appears at 120s, fades at 130s */\n      #layer-var-c {\n        animation: layer-fade-c 240s ease-in-out 0s infinite;\n      }\n      /* VAR D: appears at 180s, fades at 190s */\n      #layer-var-d {\n        animation: layer-fade-d 240s ease-in-out 0s infinite;\n      }\n\n      @keyframes layer-fade-a {\n        0%       { opacity: 0; }\n        0.5%     { opacity: 0; }\n        2%       { opacity: 1; }\n        22%      { opacity: 1; }\n        24%      { opacity: 0; }\n        100%     { opacity: 0; }\n      }\n\n      @keyframes layer-fade-b {\n        0%       { opacity: 0; }\n        24%      { opacity: 0; }\n        25.5%    { opacity: 1; }\n        48%      { opacity: 1; }\n        49.5%    { opacity: 0; }\n        100%     { opacity: 0; }\n      }\n\n      @keyframes layer-fade-c {\n        0%       { opacity: 0; }\n        49.5%    { opacity: 0; }\n        51%      { opacity: 1; }\n        73%      { opacity: 1; }\n        74.5%    { opacity: 0; }\n        100%     { opacity: 0; }\n      }\n\n      @keyframes layer-fade-d {\n        0%       { opacity: 0; }\n        74.5%    { opacity: 0; }\n        76%      { opacity: 1; }\n        98%      { opacity: 1; }\n        99.5%    { opacity: 0; }\n        100%     { opacity: 0; }\n      }\n\n      /* Internal variation animations timing */\n      /* VAR A internal elements */\n      #var-a, #var-a-particles > *, #var-a-halo, #var-a-shimmer, #var-a-sep {\n        animation-duration: 10s;\n        animation-iteration-count: infinite;\n      }\n\n      /* VAR B internal elements */\n      #var-b, #var-b-wave1, #var-b-wave2, #var-b-logo-glow, #var-b-sep {\n        animation-duration: 10s;\n        animation-iteration-count: infinite;\n      }\n\n      /* VAR C internal elements */\n      #var-c, #var-c-particles > *, #var-c-ring, #var-c-shimmer, #var-c-sep {\n        animation-duration: 10s;\n        animation-iteration-count: infinite;\n      }\n\n      /* VAR D internal elements */\n      #var-d, #var-d-outer, #var-d-inner, #var-d-cta, #var-d-sep, #var-d-logo {\n        animation-duration: 10s;\n        animation-iteration-count: infinite;\n      }\n\n      /* Micro-variation on repetitions: subtle scale + hue shift */\n      #layer-var-a { animation-timing-function: ease-in-out; }\n      #layer-var-b { animation-timing-function: ease-in-out; }\n      #layer-var-c { animation-timing-function: ease-in-out; }\n      #layer-var-d { animation-timing-function: ease-in-out; }\n\n      /* Base layer always on top */\n      #layer-base {\n        opacity: 1;\n      }\n\n      /* Static background always visible */\n      #bg-base {\n        opacity: 1;\n      }\n\n    </style>\n  </defs>\n\n  <!-- ===== LAYER 0: Static Background ===== -->\n  <rect id=\"bg-root\" x=\"0\" y=\"0\" width=\"").concat(width, "\" height=\"").concat(height, "\" fill=\"").concat(c0, "\" rx=\"12\"/>\n\n  <!-- ===== LAYER 2: Variation A \u2014 Breathing Particles ===== -->\n  <g id=\"layer-var-a\">\n    ").concat(varA.svgElements, "\n  </g>\n\n  <!-- ===== LAYER 3: Variation B \u2014 Chromatic Wave ===== -->\n  <g id=\"layer-var-b\">\n    ").concat(varB.svgElements, "\n  </g>\n\n  <!-- ===== LAYER 4: Variation C \u2014 Generative Noise ===== -->\n  <g id=\"layer-var-c\">\n    ").concat(varC.svgElements, "\n  </g>\n\n  <!-- ===== LAYER 5: Variation D \u2014 Luminous Respiration ===== -->\n  <g id=\"layer-var-d\">\n    ").concat(varD.svgElements, "\n  </g>\n\n  <!-- ===== LAYER 1: Static Base \u2014 Always Visible ===== -->\n  <g id=\"layer-base\">\n    ").concat(svgBase, "\n  </g>\n\n</svg>");
    };
    SignatureSVGExporter.prototype.buildTimingCSS = function () {
        return "      /* Timing custom properties */\n      :root {\n        --cycle: 240s;\n        --fade-dur: 2s;\n      }";
    };
    SignatureSVGExporter.prototype.buildTransitionCSS = function () {
        return "      /* Smooth cross-fade transitions between variations */\n      .var-layer-enter {\n        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n      }\n      .var-layer-exit {\n        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n      }";
    };
    return SignatureSVGExporter;
}());
export { SignatureSVGExporter };
export var signatureSVGExporter = new SignatureSVGExporter();
