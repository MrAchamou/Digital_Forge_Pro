export interface Sections3D {
  photo?: boolean;
  separator?: boolean;
  nom?: boolean;
  titre?: boolean;
  contact?: boolean;
  social?: boolean;
  cta?: boolean;
}

export interface SignatureData {
  nom: string;
  titre: string;
  entreprise: string;
  email: string;
  telephone: string;
  site: string;
  reseaux: string[];
  cta: string;
  logo_url?: string;
  photo_url?: string;
  logo3d?: boolean;
  sections3d?: Sections3D;
}

export interface StyleData {
  palette: string[];
  ambiance: string;
  intensite: 'low' | 'medium' | 'high';
  secteur: string;
}

export interface SignatureBaseResult {
  svgBase: string;
  width: number;
  height: number;
  palette: string[];
  logo_url?: string;
}

const SOCIAL_ICONS: Record<string, string> = {
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 5.86zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  youtube: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 30, g: 30, b: 46 };
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export class SignatureBaseGenerator {
  generate(signature: SignatureData, style: StyleData): SignatureBaseResult {
    const palette = style.palette.length >= 3
      ? style.palette
      : ['#0f172a', '#6366f1', '#e2e8f0'];

    const [colorBg, colorAccent, colorText] = palette;
    const colorSecondary = palette[3] || this.lightenHex(colorAccent, 40);
    const colorMuted = palette[4] || this.lightenHex(colorText, -80);

    const textOnBg = luminance(colorBg) < 128 ? '#ffffff' : '#0f172a';
    const textMuted = luminance(colorBg) < 128 ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)';

    const svgBase = this.buildBaseSVG(signature, style, {
      colorBg,
      colorAccent,
      colorText,
      colorSecondary,
      colorMuted,
      textOnBg,
      textMuted,
    });

    return { svgBase, width: 600, height: 180, palette, logo_url: signature.logo_url };
  }

  private lightenHex(hex: string, amount: number): string {
    const { r, g, b } = hexToRgb(hex);
    const clamp = (v: number) => Math.max(0, Math.min(255, v));
    return `rgb(${clamp(r + amount)},${clamp(g + amount)},${clamp(b + amount)})`;
  }

  private buildBaseSVG(sig: SignatureData, style: StyleData, colors: any): string {
    const s3d = sig.sections3d || {};
    const { colorBg, colorAccent, colorSecondary, textOnBg, textMuted } = colors;

    // ═══════════════════════════════════════════════════════════════════════════
    // GRILLE FIXE — toutes les zones sont définies en coordonnées absolues SVG.
    // Aucun élément ne peut sortir de sa zone grâce aux clipPath.
    // SVG : 600 × 180 px
    // ═══════════════════════════════════════════════════════════════════════════
    //
    //  ┌─────────────────┬──┬────────────────────────────────────────────────┐
    //  │   LEFT COL      │SE│               RIGHT COL                        │
    //  │  x=0  w=158     │P │  x=170  w=426                                  │
    //  │                 │  │  [Name  ─────────────clip 230─────]  [CTA    ] │
    //  │  Avatar         │  │  [Titre ─────────────clip 230─────]            │
    //  │  cx=76 cy=76    │  │  [Company ─────clip 230────────────]            │
    //  │  r=52           │  │  ── divider ────────────────────── ─           │
    //  │                 │  │  [Email  ──────────────────────────]            │
    //  │  Logo/Text      │  │  [Phone  ──────────────────────────]            │
    //  │  y=136 h=28     │  │  [Site   ──────────────────────────]            │
    //  │                 │  │  [Social icons ──clip 216──]  [CTA pill       ]│
    //  └─────────────────┴──┴────────────────────────────────────────────────┘
    //
    // Clip zones (local to their parent group) :
    //   clip-left-col    : 0,0 → 142,152   (left content area)
    //   clip-right-col   : 0,0 → 424,152   (right content area)
    //   clip-name-zone   : 0,0 → 230,30    (name — avoids CTA overlap)
    //   clip-titre-zone  : 0,0 → 230,20    (titre)
    //   clip-company-zone: 0,0 → 380,18    (company)
    //   clip-contact-zone: 0,0 → 408,60    (3 rows × 18px + 6px guard)
    //   clip-social-zone : 0,0 → 214,22    (social icons — stops before CTA)
    // ═══════════════════════════════════════════════════════════════════════════

    const photoXML    = this.buildPhotoOrPlaceholder(sig.photo_url, sig.nom, colorAccent, textOnBg, s3d.photo);
    const logoXML     = this.buildLogoOrText(sig.logo_url, sig.entreprise, colorAccent, textOnBg, sig.logo3d);
    const separatorXML= this.buildSeparator(colorAccent, colorSecondary, s3d.separator);
    const nameXML     = this.buildNameText(sig.nom, textOnBg, s3d.nom);
    const titreXML    = this.buildTitreText(sig.titre, colorAccent, s3d.titre);
    const contactXML  = this.buildContactBlock(sig.email, sig.telephone, sig.site, textOnBg, textMuted, colorAccent, s3d.contact);
    const socialXML   = this.buildSocialIcons(sig.reseaux, colorAccent, textOnBg, s3d.social);
    const ctaXML      = this.buildCTA(sig.cta, colorAccent, textOnBg, s3d.cta);

    return `<g id="base-static">

  <!-- ── Clip paths — zones fixes inviolables ── -->
  <!-- Règle : les clips Y sont très larges (-500 / +2000) pour ne jamais tronquer -->
  <!-- la hauteur ; seul le X est contraint selon la colonne ou la zone.           -->
  <defs>
    <!-- Colonne gauche : limite physique x=0→142, y=0→152 -->
    <clipPath id="clip-left-col">
      <rect x="0" y="0" width="142" height="152"/>
    </clipPath>
    <!-- Colonne droite : limite physique x=0→424, y=0→152 -->
    <clipPath id="clip-right-col">
      <rect x="0" y="0" width="424" height="152"/>
    </clipPath>
    <!-- Textes étroits (nom + titre) : largeur max 230px, hauteur libre -->
    <clipPath id="clip-text-narrow">
      <rect x="0" y="-500" width="230" height="2000"/>
    </clipPath>
    <!-- Textes larges (entreprise + contact) : largeur max 408px, hauteur libre -->
    <clipPath id="clip-text-wide">
      <rect x="-4" y="-500" width="416" height="2000"/>
    </clipPath>
    <!-- Icônes sociales : s'arrête strictement avant le CTA (x=220) -->
    <clipPath id="clip-social-zone">
      <rect x="0" y="-500" width="214" height="2000"/>
    </clipPath>
  </defs>

  <!-- ── Background ── -->
  <rect id="bg-base" x="0" y="0" width="600" height="180" fill="${colorBg}" rx="12"/>

  <!-- ── COLONNE GAUCHE : avatar + logo ── -->
  <!-- Zone : x=0→158, y=0→180 | Contenu offset translate(16,16) -->
  <g id="left-col" transform="translate(16, 16)" clip-path="url(#clip-left-col)">
    <!-- Avatar : cx=60 cy=60 r=52 → abs cx=76 cy=76 | top=24 bottom=128 -->
    ${photoXML}
    <!-- Logo/texte entreprise : y=120 h=28 → abs y=136 bottom=164 -->
    ${logoXML}
  </g>

  <!-- ── SÉPARATEUR VERTICAL ── -->
  <!-- Fixe : x=170, y=16, height=148, bottom=164 -->
  <g id="separator-v" transform="translate(170, 16)">
    ${separatorXML}
  </g>

  <!-- ── COLONNE DROITE : informations ── -->
  <!-- Zone : x=186→610 clippée à 424px | y=20→172 clippée à 152px -->
  <g id="right-col" transform="translate(186, 20)" clip-path="url(#clip-right-col)">

    <!-- Nom — baseline local y=22, abs y=42 — largeur max 230px -->
    <g clip-path="url(#clip-text-narrow)">
      ${nameXML}
    </g>

    <!-- Titre — baseline local y=40, abs y=60 — largeur max 230px -->
    <g clip-path="url(#clip-text-narrow)">
      ${titreXML}
    </g>

    <!-- Entreprise — baseline local y=56, abs y=76 — largeur max 408px -->
    <g clip-path="url(#clip-text-wide)">
      <text id="sig-company" x="0" y="56" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="${textMuted}">${this.escapeXml(sig.entreprise)}</text>
    </g>

    <!-- Diviseur horizontal — local y=64, abs y=84 -->
    <line x1="0" y1="64" x2="408" y2="64" stroke="${colorAccent}" stroke-width="1" stroke-opacity="0.35"/>

    <!-- Contact — translate(0,72) → email abs y=92 | phone abs y=110 | site abs y=128 -->
    <!-- Espacement 18px uniforme (flat et 3D). Largeur max 408px. -->
    <g id="contact-block" transform="translate(0, 72)" clip-path="url(#clip-text-wide)">
      ${contactXML}
    </g>

    <!-- Icônes sociales — translate(0,118) → abs y=138 — max 214px (avant CTA) -->
    <!-- Position fixe : toujours à gauche, indépendante du nombre d'icônes -->
    <g id="social-icons" transform="translate(0, 118)" clip-path="url(#clip-social-zone)">
      ${socialXML}
    </g>

    <!-- CTA — translate(220,108) → abs x=406 y=128 — fixe en bas à droite -->
    <!-- Ne bouge JAMAIS quelle que soit la longueur des autres éléments -->
    <g id="cta-block" transform="translate(220, 108)">
      ${ctaXML}
    </g>

  </g>
</g>`;
  }

  // ── PHOTO ────────────────────────────────────────────────────────────────────

  private buildPhotoOrPlaceholder(photoUrl: string | undefined, nom: string, accent: string, textColor: string, is3d?: boolean): string {
    const initials = nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const dark   = this.lightenHex(accent, -80);
    const bright = this.lightenHex(accent, 55);

    if (!is3d) {
      if (photoUrl) {
        return `<clipPath id="photo-clip">
    <circle cx="60" cy="60" r="52"/>
  </clipPath>
  <image href="${this.escapeXml(photoUrl)}" x="8" y="8" width="104" height="104" clip-path="url(#photo-clip)" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="60" cy="60" r="52" fill="none" stroke="${accent}" stroke-width="2" id="photo-ring"/>`;
      }
      return `<circle cx="60" cy="60" r="52" fill="${accent}" fill-opacity="0.15" stroke="${accent}" stroke-width="2" id="photo-ring"/>
  <text x="60" y="67" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="${textColor}">${initials}</text>`;
    }

    if (photoUrl) {
      return `<defs>
    <clipPath id="photo-clip"><circle cx="60" cy="60" r="52"/></clipPath>
    <filter id="photo3d-drop" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feColorMatrix type="matrix" in="blur" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"/>
    </filter>
  </defs>
  <!-- ══ 3D Photo: shadow platform ══ -->
  <ellipse cx="64" cy="120" rx="50" ry="7" fill="black" fill-opacity="0.32" filter="url(#photo3d-drop)"/>
  <!-- ══ Extrusion rings ══ -->
  <circle cx="63" cy="63" r="53" fill="${dark}" fill-opacity="0.45"/>
  <circle cx="61" cy="61" r="53" fill="${dark}" fill-opacity="0.25"/>
  <!-- ══ Photo ══ -->
  <image href="${this.escapeXml(photoUrl)}" x="8" y="8" width="104" height="104" clip-path="url(#photo-clip)" preserveAspectRatio="xMidYMid slice"/>
  <!-- ══ Accent ring ══ -->
  <circle cx="60" cy="60" r="52" fill="none" stroke="${accent}" stroke-width="3" id="photo-ring"/>
  <!-- ══ Inner glow ring ══ -->
  <circle cx="60" cy="60" r="49" fill="none" stroke="${bright}" stroke-width="1" stroke-opacity="0.35"/>
  <!-- ══ Specular arc (top highlight) ══ -->
  <path d="M 22 26 A 44 44 0 0 1 98 26" stroke="white" stroke-width="2.5" fill="none" stroke-opacity="0.38" stroke-linecap="round"/>`;
    }

    return `<defs>
    <linearGradient id="photo3d-fill" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%"   stop-color="${bright}" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="${accent}"  stop-opacity="1"/>
    </linearGradient>
  </defs>
  <!-- ══ 3D Initials: shadow platform ══ -->
  <ellipse cx="63" cy="118" rx="48" ry="6" fill="black" fill-opacity="0.25"/>
  <!-- ══ Extrusion circles ══ -->
  <circle cx="63" cy="63" r="53" fill="${dark}" fill-opacity="0.50"/>
  <circle cx="62" cy="62" r="53" fill="${dark}" fill-opacity="0.28"/>
  <!-- ══ Main face ══ -->
  <circle cx="60" cy="60" r="52" fill="url(#photo3d-fill)" stroke="${accent}" stroke-width="2.5" id="photo-ring"/>
  <!-- ══ Initials ══ -->
  <text x="60" y="67" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="${textColor}">${initials}</text>
  <!-- ══ Specular arc ══ -->
  <path d="M 22 28 A 42 42 0 0 1 98 28" stroke="white" stroke-width="2.5" fill="none" stroke-opacity="0.42" stroke-linecap="round"/>`;
  }

  // ── LOGO ─────────────────────────────────────────────────────────────────────

  private buildLogoOrText(logoUrl: string | undefined, company: string, accent: string, textColor: string, logo3d?: boolean): string {
    if (logo3d) {
      return logoUrl ? this.build3DLogoImage(logoUrl, accent) : this.build3DLogoText(company, accent);
    }
    if (logoUrl) {
      return `<image href="${this.escapeXml(logoUrl)}" x="10" y="120" width="100" height="36" preserveAspectRatio="xMidYMid meet" id="company-logo"/>`;
    }
    const shortName = company.slice(0, 12);
    return `<rect x="10" y="122" width="120" height="26" rx="4" fill="${accent}" fill-opacity="0.15" id="logo-bg"/>
  <text x="70" y="139" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="${accent}" letter-spacing="1" id="company-logo-text">${this.escapeXml(shortName.toUpperCase())}</text>`;
  }

  private build3DLogoText(company: string, accent: string): string {
    const shortName = this.escapeXml(company.slice(0, 12).toUpperCase());
    const d = (amt: number) => this.lightenHex(accent, amt);
    const bright = d(55);
    const fontAttrs = `text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" letter-spacing="1"`;
    const extLayers = [
      { dx: 4, dy: 4, fill: d(-160) },
      { dx: 3, dy: 3, fill: d(-130) },
      { dx: 2, dy: 2, fill: d(-95)  },
      { dx: 1, dy: 1, fill: d(-60)  },
    ];
    const extRects = extLayers.map(l =>
      `<rect x="${10 + l.dx}" y="${122 + l.dy}" width="120" height="26" rx="4" fill="${l.fill}"/>`
    ).join('\n  ');
    const extTexts = extLayers.map(l =>
      `<text x="${70 + l.dx}" y="${139 + l.dy}" ${fontAttrs} fill="${l.fill}">${shortName}</text>`
    ).join('\n  ');
    return `<defs>
    <linearGradient id="logo3d-toplight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.38"/>
      <stop offset="55%"  stop-color="white" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.14"/>
    </linearGradient>
    <linearGradient id="logo3d-shine" x1="15%" y1="0%" x2="85%" y2="0%">
      <stop offset="0%"   stop-color="white" stop-opacity="0"/>
      <stop offset="50%"  stop-color="white" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- ══ Logo 3D Extrusion — rect layers (back → front) ══ -->
  ${extRects}
  <!-- ══ Logo 3D Extrusion — text shadow layers ══ -->
  ${extTexts}
  <!-- ══ Top face: rect principale ══ -->
  <rect x="10" y="122" width="120" height="26" rx="4" fill="${accent}" fill-opacity="0.22" id="logo-bg"/>
  <!-- ══ Lighting gradient (top-lit) ══ -->
  <rect x="10" y="122" width="120" height="26" rx="4" fill="url(#logo3d-toplight)" pointer-events="none"/>
  <!-- ══ Top edge specular (bevel) ══ -->
  <rect x="10" y="122" width="120" height="3" rx="2" fill="${bright}" fill-opacity="0.50" pointer-events="none"/>
  <!-- ══ Right edge bevel ══ -->
  <rect x="128" y="122" width="2" height="26" rx="1" fill="${bright}" fill-opacity="0.20" pointer-events="none"/>
  <!-- ══ Main text (top face) ══ -->
  <text x="70" y="139" ${fontAttrs} fill="${accent}" id="company-logo-text">${shortName}</text>
  <!-- ══ Text specular shimmer ══ -->
  <text x="70" y="139" ${fontAttrs} fill="url(#logo3d-shine)" pointer-events="none">${shortName}</text>`;
  }

  private build3DLogoImage(logoUrl: string, accent: string): string {
    const safeUrl = this.escapeXml(logoUrl);
    const d = (amt: number) => this.lightenHex(accent, amt);
    const bright = d(55);
    return `<defs>
    <filter id="logo3d-img-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feColorMatrix type="matrix" in="blur"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.65 0"/>
    </filter>
    <linearGradient id="logo3d-img-light" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.32"/>
      <stop offset="50%"  stop-color="white" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.10"/>
    </linearGradient>
  </defs>
  <!-- ══ 3D Shadow clones (profondeur perspective) ══ -->
  <image href="${safeUrl}" x="14" y="124" width="100" height="36" preserveAspectRatio="xMidYMid meet" filter="url(#logo3d-img-shadow)" opacity="0.55"/>
  <image href="${safeUrl}" x="12" y="122" width="100" height="36" preserveAspectRatio="xMidYMid meet" filter="url(#logo3d-img-shadow)" opacity="0.35"/>
  <!-- ══ Bevel rect derrière l'image ══ -->
  <rect x="9" y="119" width="102" height="38" rx="4" fill="${d(-80)}" opacity="0.6"/>
  <!-- ══ Image principale (top face) ══ -->
  <image href="${safeUrl}" x="10" y="120" width="100" height="36" preserveAspectRatio="xMidYMid meet" id="company-logo"/>
  <!-- ══ Lighting gradient overlay ══ -->
  <rect x="10" y="120" width="100" height="38" rx="3" fill="url(#logo3d-img-light)" pointer-events="none"/>
  <!-- ══ Top edge highlight ══ -->
  <rect x="10" y="120" width="100" height="3" rx="2" fill="${bright}" fill-opacity="0.45" pointer-events="none"/>`;
  }

  // ── SEPARATOR ────────────────────────────────────────────────────────────────

  private buildSeparator(colorAccent: string, colorSecondary: string, is3d?: boolean): string {
    const defs = `<defs>
    <linearGradient id="sep-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${colorAccent}" stop-opacity="0.1"/>
      <stop offset="30%" stop-color="${colorAccent}" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="${colorSecondary}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${colorSecondary}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>`;
    if (!is3d) {
      return `${defs}
  <rect id="sep-bar" x="0" y="0" width="2" height="148" fill="url(#sep-grad)" rx="1"/>`;
    }
    return `${defs}
  <!-- ══ 3D Separator: shadow depth ══ -->
  <rect x="4" y="3" width="3" height="148" fill="black" fill-opacity="0.28" rx="1"/>
  <rect x="3" y="2" width="3" height="148" fill="black" fill-opacity="0.16" rx="1"/>
  <!-- ══ Main bar (wider) ══ -->
  <rect id="sep-bar" x="0" y="0" width="4" height="148" fill="url(#sep-grad)" rx="1"/>
  <!-- ══ Left edge specular highlight ══ -->
  <rect x="0" y="6" width="1" height="136" fill="white" fill-opacity="0.42" rx="1"/>`;
  }

  // ── NAME ─────────────────────────────────────────────────────────────────────

  private buildNameText(nom: string, textColor: string, is3d?: boolean): string {
    const name = this.escapeXml(nom);
    const fa = `font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700" letter-spacing="0.5"`;
    if (!is3d) {
      return `<text id="sig-name" x="0" y="22" ${fa} fill="${textColor}">${name}</text>`;
    }
    const layers = [
      { dx: 3, dy: 3, op: '0.16' },
      { dx: 2, dy: 2, op: '0.22' },
      { dx: 1, dy: 1, op: '0.32' },
    ];
    const shadows = layers.map(l =>
      `<text x="${l.dx}" y="${22 + l.dy}" ${fa} fill="black" fill-opacity="${l.op}">${name}</text>`
    ).join('\n  ');
    return `<defs>
    <linearGradient id="name3d-shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="white" stop-opacity="0"/>
      <stop offset="40%"  stop-color="white" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- ══ Name 3D: shadow extrusion ══ -->
  ${shadows}
  <!-- ══ Main text ══ -->
  <text id="sig-name" x="0" y="22" ${fa} fill="${textColor}">${name}</text>
  <!-- ══ Specular shimmer ══ -->
  <text x="0" y="22" ${fa} fill="url(#name3d-shine)" pointer-events="none">${name}</text>`;
  }

  // ── TITRE ────────────────────────────────────────────────────────────────────

  private buildTitreText(titre: string, accent: string, is3d?: boolean): string {
    const t = this.escapeXml(titre.toUpperCase());
    const fa = `font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="500" letter-spacing="1.5"`;
    if (!is3d) {
      return `<text id="sig-titre" x="0" y="40" ${fa} fill="${accent}">${t}</text>`;
    }
    const d1 = this.lightenHex(accent, -80);
    const d2 = this.lightenHex(accent, -45);
    return `<!-- ══ Titre 3D: colored depth layers ══ -->
  <text x="3" y="43" ${fa} fill="${d1}" fill-opacity="0.55">${t}</text>
  <text x="2" y="42" ${fa} fill="${d1}" fill-opacity="0.40">${t}</text>
  <text x="1" y="41" ${fa} fill="${d2}" fill-opacity="0.55">${t}</text>
  <!-- ══ Main text ══ -->
  <text id="sig-titre" x="0" y="40" ${fa} fill="${accent}">${t}</text>`;
  }

  // ── CONTACT ──────────────────────────────────────────────────────────────────

  private buildContactBlock(email: string, telephone: string, site: string, textOnBg: string, textMuted: string, accent: string, is3d?: boolean): string {
    const emailText = email ? this.escapeXml(email) : '';
    const phoneText = telephone ? this.escapeXml(telephone) : '';
    const siteText  = site ? this.escapeXml(site.replace(/^https?:\/\//, '')) : '';

    if (!is3d) {
      // Espacement 18px uniforme — identique au mode 3D pour cohérence de layout
      return [
        emailText ? `<text x="0" y="0"  font-family="Arial, Helvetica, sans-serif" font-size="10" fill="${textMuted}">✉  <tspan fill="${textOnBg}">${emailText}</tspan></text>` : '',
        phoneText ? `<text x="0" y="18" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="${textMuted}">✆  <tspan fill="${textOnBg}">${phoneText}</tspan></text>` : '',
        siteText  ? `<text x="0" y="36" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="${textMuted}">⊕  <tspan fill="${accent}">${siteText}</tspan></text>` : '',
      ].join('\n  ');
    }

    const dark   = this.lightenHex(accent, -90);
    const bright = this.lightenHex(accent, 50);
    const items = [
      { y: 0,  icon: '✉', text: emailText, color: textOnBg },
      { y: 18, icon: '✆', text: phoneText, color: textOnBg },
      { y: 36, icon: '⊕', text: siteText,  color: accent  },
    ].filter(item => item.text);

    return items.map(item => `<!-- ══ Contact 3D row ══ -->
  <rect x="-3" y="${item.y - 12}" width="242" height="15" rx="3" fill="${dark}" fill-opacity="0.40"/>
  <rect x="-3" y="${item.y - 12}" width="242" height="2"  rx="1" fill="${bright}" fill-opacity="0.18"/>
  <text x="0" y="${item.y}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="${textMuted}">${item.icon}  <tspan fill="${item.color}">${item.text}</tspan></text>`
    ).join('\n  ');
  }

  // ── SOCIAL ICONS ─────────────────────────────────────────────────────────────

  private buildSocialIcons(reseaux: string[] | undefined, accent: string, textColor: string, is3d?: boolean): string {
    if (!reseaux || !Array.isArray(reseaux)) return '';
    const icons = reseaux.filter(r => SOCIAL_ICONS[r?.toLowerCase?.() || '']);
    if (icons.length === 0) return '';

    if (!is3d) {
      return icons.map((r, i) => {
        const path = SOCIAL_ICONS[r.toLowerCase()];
        const x = i * 26;
        return `<g transform="translate(${x}, 0) scale(0.75)" id="icon-${r}">
        <rect x="-2" y="-2" width="20" height="20" rx="4" fill="${accent}" fill-opacity="0.15"/>
        <path d="${path}" fill="${textColor}" fill-opacity="0.85"/>
      </g>`;
      }).join('\n      ');
    }

    const dark   = this.lightenHex(accent, -80);
    const bright = this.lightenHex(accent, 55);
    return icons.map((r, i) => {
      const path = SOCIAL_ICONS[r.toLowerCase()];
      const x = i * 26;
      return `<g transform="translate(${x}, 0) scale(0.75)" id="icon-${r}">
        <!-- ══ 3D Social icon extrusion ══ -->
        <rect x="1"  y="3" width="20" height="20" rx="4" fill="${dark}" fill-opacity="0.55"/>
        <rect x="0"  y="2" width="20" height="20" rx="4" fill="${dark}" fill-opacity="0.35"/>
        <!-- ══ Main face ══ -->
        <rect x="-2" y="-2" width="20" height="20" rx="4" fill="${accent}" fill-opacity="0.22"/>
        <!-- ══ Top highlight ══ -->
        <rect x="-2" y="-2" width="20" height="3" rx="2" fill="${bright}" fill-opacity="0.48"/>
        <!-- ══ Right bevel ══ -->
        <rect x="16" y="-2" width="2" height="20" rx="1" fill="${bright}" fill-opacity="0.20"/>
        <!-- ══ Icon path ══ -->
        <path d="${path}" fill="${textColor}" fill-opacity="0.90"/>
      </g>`;
    }).join('\n      ');
  }

  // ── CTA ──────────────────────────────────────────────────────────────────────

  private buildCTA(cta: string, accent: string, textColor: string, is3d?: boolean): string {
    if (!cta) return '';
    const label = cta.length > 20 ? cta.slice(0, 20) + '…' : cta;
    const width = Math.min(160, label.length * 7 + 24);
    const dark   = this.lightenHex(accent, -60);
    const bright = this.lightenHex(accent, 55);

    if (!is3d) {
      return `<rect x="0" y="0" width="${width}" height="28" rx="14" fill="${accent}" id="cta-btn"/>
    <text x="${width / 2}" y="18" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="${textColor}" letter-spacing="0.5">${this.escapeXml(label.toUpperCase())}</text>`;
    }

    return `<defs>
    <linearGradient id="cta3d-light" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="cta3d-shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="white" stop-opacity="0"/>
      <stop offset="50%"  stop-color="white" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- ══ CTA 3D: extrusion layers ══ -->
  <rect x="5" y="6" width="${width}" height="28" rx="14" fill="${dark}" fill-opacity="0.65"/>
  <rect x="4" y="4" width="${width}" height="28" rx="14" fill="${dark}" fill-opacity="0.48"/>
  <rect x="2" y="2" width="${width}" height="28" rx="14" fill="${dark}" fill-opacity="0.30"/>
  <!-- ══ Main face ══ -->
  <rect x="0" y="0" width="${width}" height="28" rx="14" fill="${accent}" id="cta-btn"/>
  <!-- ══ Lighting overlay ══ -->
  <rect x="0" y="0" width="${width}" height="28" rx="14" fill="url(#cta3d-light)" pointer-events="none"/>
  <!-- ══ Top edge highlight ══ -->
  <rect x="5" y="1" width="${width - 10}" height="3" rx="2" fill="${bright}" fill-opacity="0.55" pointer-events="none"/>
  <!-- ══ Text ══ -->
  <text x="${width / 2}" y="18" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="${textColor}" letter-spacing="0.5">${this.escapeXml(label.toUpperCase())}</text>
  <!-- ══ Text shimmer ══ -->
  <text x="${width / 2}" y="18" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="url(#cta3d-shine)" letter-spacing="0.5" pointer-events="none">${this.escapeXml(label.toUpperCase())}</text>`;
  }

  // ── UTILS ────────────────────────────────────────────────────────────────────

  private buildSocialIconsLegacy(reseaux: string[] | undefined, accent: string, textColor: string): string {
    return this.buildSocialIcons(reseaux, accent, textColor, false);
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const signatureBaseGenerator = new SignatureBaseGenerator();
