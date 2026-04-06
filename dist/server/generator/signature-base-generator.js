var SOCIAL_ICONS = {
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
    twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 5.86zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    youtube: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
};
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 30, g: 30, b: 46 };
}
function luminance(hex) {
    var _a = hexToRgb(hex), r = _a.r, g = _a.g, b = _a.b;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}
var SignatureBaseGenerator = /** @class */ (function () {
    function SignatureBaseGenerator() {
    }
    SignatureBaseGenerator.prototype.generate = function (signature, style) {
        var palette = style.palette.length >= 3
            ? style.palette
            : ['#0f172a', '#6366f1', '#e2e8f0'];
        var colorBg = palette[0], colorAccent = palette[1], colorText = palette[2];
        var colorSecondary = palette[3] || this.lightenHex(colorAccent, 40);
        var colorMuted = palette[4] || this.lightenHex(colorText, -80);
        var textOnBg = luminance(colorBg) < 128 ? '#ffffff' : '#0f172a';
        var textMuted = luminance(colorBg) < 128 ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)';
        var svgBase = this.buildBaseSVG(signature, style, {
            colorBg: colorBg,
            colorAccent: colorAccent,
            colorText: colorText,
            colorSecondary: colorSecondary,
            colorMuted: colorMuted,
            textOnBg: textOnBg,
            textMuted: textMuted,
        });
        return { svgBase: svgBase, width: 600, height: 180, palette: palette };
    };
    SignatureBaseGenerator.prototype.lightenHex = function (hex, amount) {
        var _a = hexToRgb(hex), r = _a.r, g = _a.g, b = _a.b;
        var clamp = function (v) { return Math.max(0, Math.min(255, v)); };
        return "rgb(".concat(clamp(r + amount), ",").concat(clamp(g + amount), ",").concat(clamp(b + amount), ")");
    };
    SignatureBaseGenerator.prototype.buildBaseSVG = function (sig, style, colors) {
        var colorBg = colors.colorBg, colorAccent = colors.colorAccent, colorText = colors.colorText, colorSecondary = colors.colorSecondary, textOnBg = colors.textOnBg, textMuted = colors.textMuted;
        var socialIconsXML = this.buildSocialIcons(sig.reseaux, colorAccent, textOnBg);
        var separatorXML = this.buildSeparator(colorAccent, colorSecondary);
        var photoXML = this.buildPhotoOrPlaceholder(sig.photo_url, sig.nom, colorAccent, textOnBg);
        var logoXML = this.buildLogoOrText(sig.logo_url, sig.entreprise, colorAccent, textOnBg);
        var ctaXML = this.buildCTA(sig.cta, colorAccent, textOnBg);
        var emailText = sig.email ? this.escapeXml(sig.email) : '';
        var phoneText = sig.telephone ? this.escapeXml(sig.telephone) : '';
        var siteText = sig.site ? this.escapeXml(sig.site.replace(/^https?:\/\//, '')) : '';
        return "<g id=\"base-static\">\n  <!-- Background base -->\n  <rect id=\"bg-base\" x=\"0\" y=\"0\" width=\"600\" height=\"180\" fill=\"".concat(colorBg, "\" rx=\"12\"/>\n\n  <!-- Left column: photo + logo -->\n  <g id=\"left-col\" transform=\"translate(16, 16)\">\n    ").concat(photoXML, "\n    ").concat(logoXML, "\n  </g>\n\n  <!-- Separator vertical -->\n  <g id=\"separator-v\" transform=\"translate(170, 16)\">\n    ").concat(separatorXML, "\n  </g>\n\n  <!-- Right column: info -->\n  <g id=\"right-col\" transform=\"translate(186, 20)\">\n    <!-- Name -->\n    <text id=\"sig-name\" x=\"0\" y=\"22\" font-family=\"Georgia, 'Times New Roman', serif\" font-size=\"20\" font-weight=\"700\" fill=\"").concat(textOnBg, "\" letter-spacing=\"0.5\">").concat(this.escapeXml(sig.nom), "</text>\n\n    <!-- Title -->\n    <text id=\"sig-titre\" x=\"0\" y=\"40\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"11\" font-weight=\"500\" fill=\"").concat(colorAccent, "\" letter-spacing=\"1.5\" text-transform=\"uppercase\">").concat(this.escapeXml(sig.titre.toUpperCase()), "</text>\n\n    <!-- Company -->\n    <text id=\"sig-company\" x=\"0\" y=\"56\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"11\" fill=\"").concat(textMuted, "\">").concat(this.escapeXml(sig.entreprise), "</text>\n\n    <!-- Separator horizontal thin -->\n    <line x1=\"0\" y1=\"64\" x2=\"380\" y2=\"64\" stroke=\"").concat(colorAccent, "\" stroke-width=\"1\" stroke-opacity=\"0.4\"/>\n\n    <!-- Contact info -->\n    <g id=\"contact-block\" transform=\"translate(0, 72)\">\n      ").concat(emailText ? "<text x=\"0\" y=\"0\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\" fill=\"".concat(textMuted, "\">\u2709  <tspan fill=\"").concat(textOnBg, "\">").concat(emailText, "</tspan></text>") : '', "\n      ").concat(phoneText ? "<text x=\"0\" y=\"15\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\" fill=\"".concat(textMuted, "\">\u2706  <tspan fill=\"").concat(textOnBg, "\">").concat(phoneText, "</tspan></text>") : '', "\n      ").concat(siteText ? "<text x=\"0\" y=\"30\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\" fill=\"".concat(textMuted, "\">\u2295  <tspan fill=\"").concat(colorAccent, "\">").concat(siteText, "</tspan></text>") : '', "\n    </g>\n\n    <!-- Social icons -->\n    <g id=\"social-icons\" transform=\"translate(0, 120)\">\n      ").concat(socialIconsXML, "\n    </g>\n\n    <!-- CTA -->\n    <g id=\"cta-block\" transform=\"translate(220, 110)\">\n      ").concat(ctaXML, "\n    </g>\n  </g>\n</g>");
    };
    SignatureBaseGenerator.prototype.buildPhotoOrPlaceholder = function (photoUrl, nom, accent, textColor) {
        var initials = nom.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        if (photoUrl) {
            return "<clipPath id=\"photo-clip\">\n    <circle cx=\"60\" cy=\"60\" r=\"52\"/>\n  </clipPath>\n  <image href=\"".concat(this.escapeXml(photoUrl), "\" x=\"8\" y=\"8\" width=\"104\" height=\"104\" clip-path=\"url(#photo-clip)\" preserveAspectRatio=\"xMidYMid slice\"/>\n  <circle cx=\"60\" cy=\"60\" r=\"52\" fill=\"none\" stroke=\"").concat(accent, "\" stroke-width=\"2\" id=\"photo-ring\"/>");
        }
        return "<circle cx=\"60\" cy=\"60\" r=\"52\" fill=\"".concat(accent, "\" fill-opacity=\"0.15\" stroke=\"").concat(accent, "\" stroke-width=\"2\" id=\"photo-ring\"/>\n  <text x=\"60\" y=\"67\" text-anchor=\"middle\" font-family=\"Georgia, serif\" font-size=\"28\" font-weight=\"700\" fill=\"").concat(textColor, "\">").concat(initials, "</text>");
    };
    SignatureBaseGenerator.prototype.buildLogoOrText = function (logoUrl, company, accent, textColor) {
        if (logoUrl) {
            return "<image href=\"".concat(this.escapeXml(logoUrl), "\" x=\"10\" y=\"120\" width=\"100\" height=\"36\" preserveAspectRatio=\"xMidYMid meet\" id=\"company-logo\"/>");
        }
        var shortName = company.slice(0, 12);
        return "<rect x=\"10\" y=\"122\" width=\"120\" height=\"26\" rx=\"4\" fill=\"".concat(accent, "\" fill-opacity=\"0.15\" id=\"logo-bg\"/>\n  <text x=\"70\" y=\"139\" text-anchor=\"middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\" font-weight=\"700\" fill=\"").concat(accent, "\" letter-spacing=\"1\" id=\"company-logo-text\">").concat(this.escapeXml(shortName.toUpperCase()), "</text>");
    };
    SignatureBaseGenerator.prototype.buildSeparator = function (colorAccent, colorSecondary) {
        return "<defs>\n    <linearGradient id=\"sep-grad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"".concat(colorAccent, "\" stop-opacity=\"0.1\"/>\n      <stop offset=\"30%\" stop-color=\"").concat(colorAccent, "\" stop-opacity=\"0.8\"/>\n      <stop offset=\"70%\" stop-color=\"").concat(colorSecondary, "\" stop-opacity=\"0.8\"/>\n      <stop offset=\"100%\" stop-color=\"").concat(colorSecondary, "\" stop-opacity=\"0.1\"/>\n    </linearGradient>\n  </defs>\n  <rect id=\"sep-bar\" x=\"0\" y=\"0\" width=\"2\" height=\"148\" fill=\"url(#sep-grad)\" rx=\"1\"/>");
    };
    SignatureBaseGenerator.prototype.buildSocialIcons = function (reseaux, accent, textColor) {
        var icons = reseaux.filter(function (r) { return SOCIAL_ICONS[r.toLowerCase()]; });
        if (icons.length === 0)
            return '';
        return icons.map(function (r, i) {
            var path = SOCIAL_ICONS[r.toLowerCase()];
            var x = i * 26;
            return "<g transform=\"translate(".concat(x, ", 0) scale(0.75)\" id=\"icon-").concat(r, "\">\n        <rect x=\"-2\" y=\"-2\" width=\"20\" height=\"20\" rx=\"4\" fill=\"").concat(accent, "\" fill-opacity=\"0.15\"/>\n        <path d=\"").concat(path, "\" fill=\"").concat(textColor, "\" fill-opacity=\"0.85\"/>\n      </g>");
        }).join('\n      ');
    };
    SignatureBaseGenerator.prototype.buildCTA = function (cta, accent, textColor) {
        if (!cta)
            return '';
        var label = cta.length > 20 ? cta.slice(0, 20) + '…' : cta;
        var width = Math.min(160, label.length * 7 + 24);
        return "<rect x=\"0\" y=\"0\" width=\"".concat(width, "\" height=\"28\" rx=\"14\" fill=\"").concat(accent, "\" id=\"cta-btn\"/>\n    <text x=\"").concat(width / 2, "\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\" font-weight=\"700\" fill=\"").concat(textColor, "\" letter-spacing=\"0.5\">").concat(this.escapeXml(label.toUpperCase()), "</text>");
    };
    SignatureBaseGenerator.prototype.escapeXml = function (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    return SignatureBaseGenerator;
}());
export { SignatureBaseGenerator };
export var signatureBaseGenerator = new SignatureBaseGenerator();
