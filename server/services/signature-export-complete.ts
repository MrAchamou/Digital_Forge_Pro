import sharp from 'sharp';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { log } from '../vite';
import type { SectorConfig } from './signature-renderer';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExportMetadata {
  nom: string;
  titre: string;
  entreprise: string;
  email?: string;
  telephone?: string;
  site?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  note?: number;
  logo_url?: string;
  secteur: string;
  palette: string[];
  cta?: string;
  [key: string]: any;
}

export interface CompleteExportResult {
  signatureId: string;
  formats: {
    gmail:      { html: string; filename: string };
    outlook:    { html: string; filename: string };
    appleMail:  { html: string; filename: string };
    universal:  { html: string; filename: string };
    animatedSvg:{ svg: string; filename: string };
    staticPng:  { buffer: Buffer; filename: string };
    animatedGif:{ buffer: Buffer; filename: string };
  };
  guide: { html: string; filename: string };
  zip:   { buffer: Buffer; filename: string };
}

// ── Helpers couleur ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [15, 15, 31];
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const c = (v: number) => Math.min(255, Math.max(0, v + amount)).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function escXml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Génération SVG de base (inline, sans animation externe) ──────────────────

function buildSignatureSVGBase(meta: ExportMetadata, animated = false): string {
  const { nom = 'Prénom Nom', titre = 'Titre', entreprise = 'Entreprise',
          email = '', telephone = '', site = '', adresse = '', ville = '',
          code_postal = '', note, logo_url, cta = 'Nous contacter',
          palette = [] } = meta;

  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const accentLight = lighten(accent, 60);
  const textMuted = `${textColor}99`;
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');
  const noteStars = note ? '★'.repeat(Math.floor(note)) : '';

  const breatheAttr = animated
    ? `<animateTransform attributeName="transform" type="scale" values="1;1.025;1" dur="2.8s" repeatCount="indefinite" additive="sum"/>`
    : '';
  const glowAttr = animated
    ? `<animate attributeName="opacity" values="0.35;0.75;0.35" dur="2.8s" repeatCount="indefinite"/>`
    : '';
  const fadeInName = animated
    ? `<animate attributeName="opacity" values="0;1" dur="0.8s" fill="freeze"/>`
    : '';
  const typewriterAttr = animated
    ? `<animate attributeName="clip-path" from="inset(0 100% 0 0)" to="inset(0 0% 0 0)" dur="1.4s" begin="0.5s" fill="freeze"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 600 180" width="600" height="180">
  <defs>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accentLight}"/>
    </linearGradient>
    <clipPath id="photoClip"><circle cx="60" cy="90" r="50"/></clipPath>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="600" height="180" fill="${bg}" rx="10"/>

  <!-- Glow de fond (barre accent) -->
  <rect x="0" y="0" width="4" height="180" fill="url(#accentGrad)" rx="2">${glowAttr}</rect>

  <!-- Avatar cercle -->
  <g transform="translate(24,90)">
    <circle r="50" fill="${accent}18" stroke="${accent}" stroke-width="1.5">${breatheAttr}</circle>
    <text text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif"
      font-size="22" font-weight="700" fill="${accent}">${escXml(initials)}</text>
  </g>

  <!-- Séparateur vertical -->
  <rect x="96" y="24" width="1.5" height="132" fill="${accent}" opacity="0.3" rx="1"/>

  <!-- NOM -->
  <text x="112" y="48" font-family="Arial,sans-serif" font-size="18" font-weight="700"
    fill="${textColor}" opacity="0">
    ${escXml(nom)}${fadeInName}
  </text>

  <!-- TITRE -->
  <text x="112" y="68" font-family="Arial,sans-serif" font-size="11" font-weight="600"
    fill="${accent}" letter-spacing="1.5" text-transform="uppercase"
    style="clip-path:inset(0 100% 0 0)">
    ${escXml(titre.toUpperCase())}
    ${typewriterAttr}
  </text>

  <!-- ENTREPRISE -->
  <text x="112" y="86" font-family="Arial,sans-serif" font-size="12" fill="${textMuted}">
    ${escXml(entreprise)}
  </text>

  <!-- Ligne séparatrice -->
  <line x1="112" y1="96" x2="568" y2="96" stroke="${accent}" stroke-width="0.8" opacity="0.25"/>

  <!-- Téléphone -->
  ${telephone ? `<text x="112" y="113" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="0.8">☎ ${escXml(telephone)}</text>` : ''}

  <!-- Email -->
  ${email ? `<text x="112" y="${telephone ? '130' : '113'}" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="0.8">✉ ${escXml(email)}</text>` : ''}

  <!-- Adresse -->
  ${addressLine ? `<text x="112" y="${(telephone && email) ? '147' : (telephone || email) ? '147' : '130'}" font-family="Arial,sans-serif" font-size="10" fill="${textMuted}">📍 ${escXml(addressLine)}</text>` : ''}

  <!-- Note -->
  ${noteStars ? `<text x="112" y="168" font-family="Arial,sans-serif" font-size="12" fill="#f59e0b">${noteStars} ${note?.toFixed(1)}</text>` : ''}

  <!-- CTA bouton -->
  <g transform="translate(440, 132)">
    <rect width="140" height="32" rx="6" fill="${accent}" opacity="0.92"/>
    <text x="70" y="21" text-anchor="middle" font-family="Arial,sans-serif" font-size="11"
      font-weight="700" fill="#ffffff">${escXml(cta)}</text>
  </g>

  ${logo_url ? `
  <!-- Logo -->
  <image href="${escXml(logo_url)}" x="540" y="10" width="48" height="48" preserveAspectRatio="xMidYMid meet"/>
  ` : ''}

  <!-- Site -->
  ${site ? `<text x="112" y="${(telephone || email || addressLine || noteStars) ? '165' : '148'}" font-family="Arial,sans-serif" font-size="10" fill="${accent}">🌐 ${escXml(site.replace(/^https?:\/\//, ''))}</text>` : ''}
</svg>`;
}

// ── 1. SVG Animé SMIL (embed en <img> → anime dans Gmail, Apple, iOS) ────────

export function buildAnimatedSVG(meta: ExportMetadata): string {
  return buildSignatureSVGBase(meta, true);
}

// ── 2. PNG Statique (fallback universel) ─────────────────────────────────────

export async function buildStaticPng(meta: ExportMetadata): Promise<Buffer> {
  const svg = buildSignatureSVGBase(meta, false);
  try {
    return await sharp(Buffer.from(svg)).resize(600, 180).png({ quality: 95 }).toBuffer();
  } catch (err: any) {
    log(`Sharp PNG error: ${err.message}`, 'export-complete');
    // Fallback minimal
    const fb = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180">
      <rect width="600" height="180" fill="${meta.palette?.[0] || '#0f172a'}"/>
      <text x="300" y="90" text-anchor="middle" font-family="Arial" font-size="20"
        fill="${meta.palette?.[2] || '#e8e8ff'}">${escXml(meta.nom)} — ${escXml(meta.entreprise)}</text>
    </svg>`;
    return sharp(Buffer.from(fb)).png().toBuffer();
  }
}

// ── 3. GIF Animé (frame-by-frame avec Sharp + gif-encoder-2) ─────────────────

export async function buildAnimatedGif(meta: ExportMetadata): Promise<Buffer> {
  const [bg, accent] = meta.palette?.length >= 2 ? meta.palette : ['#0f172a', '#6366f1'];
  const FRAMES = 20;
  const DELAY = 8; // centisecondes (80ms/frame → ~12fps → 1.6s loop)

  const frames: Buffer[] = [];

  for (let i = 0; i < FRAMES; i++) {
    const t = i / FRAMES; // 0..1
    // Simulation BREATHING : scale 1.0 → 1.025 → 1.0 (sinusoïde)
    const scale = 1 + 0.02 * Math.sin(t * 2 * Math.PI);
    // Glow opacity : 0.3 → 0.75 → 0.3
    const glowOpacity = 0.3 + 0.45 * Math.abs(Math.sin(t * Math.PI));
    // Accent bar opacity
    const barOpacity = 0.5 + 0.5 * Math.abs(Math.sin(t * Math.PI));

    const [r, g, b] = hexToRgb(accent);
    const glowColor = `rgba(${r},${g},${b},${glowOpacity.toFixed(2)})`;

    const { nom = '', titre = '', entreprise = '', telephone = '', email = '',
            adresse = '', code_postal = '', ville = '', site = '', note,
            logo_url, cta = 'Nous contacter' } = meta;
    const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
    const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');
    const textColor = meta.palette?.[2] || '#e8e8ff';
    const textMuted = `${textColor}99`;
    const noteStars = note ? '★'.repeat(Math.floor(note)) : '';
    const accentLight = lighten(accent, 60);

    const frameSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 600 180" width="600" height="180">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="${accentLight}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="180" fill="${bg}" rx="10"/>
      <rect x="0" y="0" width="4" height="180" fill="${accent}" opacity="${barOpacity.toFixed(2)}" rx="2"/>
      <g transform="translate(24,90) scale(${scale.toFixed(4)})">
        <circle r="50" fill="${glowColor}" stroke="${accent}" stroke-width="1.5"/>
        <text text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif"
          font-size="22" font-weight="700" fill="${accent}">${escXml(initials)}</text>
      </g>
      <rect x="96" y="24" width="1.5" height="132" fill="${accent}" opacity="${(0.2 + 0.15 * glowOpacity).toFixed(2)}" rx="1"/>
      <text x="112" y="48" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="${textColor}">${escXml(nom)}</text>
      <text x="112" y="68" font-family="Arial,sans-serif" font-size="11" font-weight="600" fill="${accent}" letter-spacing="1.5">${escXml(titre.toUpperCase())}</text>
      <text x="112" y="86" font-family="Arial,sans-serif" font-size="12" fill="${textMuted}">${escXml(entreprise)}</text>
      <line x1="112" y1="96" x2="568" y2="96" stroke="${accent}" stroke-width="0.8" opacity="0.25"/>
      ${telephone ? `<text x="112" y="113" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="0.8">☎ ${escXml(telephone)}</text>` : ''}
      ${email ? `<text x="112" y="${telephone ? '130' : '113'}" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="0.8">✉ ${escXml(email)}</text>` : ''}
      ${addressLine ? `<text x="112" y="${(telephone && email) ? '147' : '130'}" font-family="Arial,sans-serif" font-size="10" fill="${textMuted}">📍 ${escXml(addressLine)}</text>` : ''}
      ${noteStars ? `<text x="112" y="165" font-family="Arial,sans-serif" font-size="12" fill="#f59e0b">${noteStars} ${note?.toFixed(1)}</text>` : ''}
      <g transform="translate(440, 132)">
        <rect width="140" height="32" rx="6" fill="${accent}" opacity="${(0.85 + 0.1 * glowOpacity).toFixed(2)}"/>
        <text x="70" y="21" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#ffffff">${escXml(cta)}</text>
      </g>
      ${logo_url ? `<image href="${escXml(logo_url)}" x="540" y="10" width="48" height="48"/>` : ''}
      ${site ? `<text x="112" y="165" font-family="Arial,sans-serif" font-size="10" fill="${accent}">🌐 ${escXml(site.replace(/^https?:\/\//, ''))}</text>` : ''}
    </svg>`;

    try {
      const pngBuf = await sharp(Buffer.from(frameSvg))
        .resize(600, 180)
        .png({ compressionLevel: 1 })
        .toBuffer();
      frames.push(pngBuf);
    } catch (e: any) {
      log(`Frame ${i} error: ${e.message}`, 'export-complete');
    }
  }

  if (frames.length === 0) {
    return buildStaticPng(meta);
  }

  // Encoder les frames en GIF animé via gif-encoder-2
  try {
    const GifEncoder = (await import('gif-encoder-2')).default;
    const encoder = new GifEncoder(600, 180, 'neuquant', true, frames.length);

    encoder.setRepeat(0);      // boucle infinie
    encoder.setDelay(DELAY * 10); // delay en ms
    encoder.setQuality(12);    // qualité (1=best, 20=fast)
    encoder.start();

    for (const framePng of frames) {
      // Sharp → raw RGBA (600×180×4 bytes)
      const raw = await sharp(framePng)
        .resize(600, 180)
        .ensureAlpha()
        .raw()
        .toBuffer();
      encoder.addFrame(raw);
    }

    encoder.finish();
    const gifBuffer = encoder.out.getData();

    if (!gifBuffer || gifBuffer.length < 100) throw new Error('GIF vide');
    log(`GIF animé généré: ${Math.round(gifBuffer.length / 1024)}KB, ${frames.length} frames`, 'export-complete');
    return gifBuffer;
  } catch (err: any) {
    log(`GIF encoder error: ${err.message} — fallback PNG`, 'export-complete');
    return buildStaticPng(meta);
  }
}

// ── 4. HTML Gmail (CSS animations inline, full fidélité) ─────────────────────

export function buildGmailHtml(meta: ExportMetadata, signatureHtml: string): string {
  const { nom = '', entreprise = '' } = meta;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Signature Gmail — ${escXml(nom)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
${signatureHtml}
<!-- Signature ${escXml(nom)} — ${escXml(entreprise)} — EffectForge AI -->
</body>
</html>`;
}

// ── 5. HTML Outlook (MSO table + PNG statique embarqué) ───────────────────────

export function buildOutlookHtml(meta: ExportMetadata, pngBase64: string): string {
  const { nom = 'Prénom Nom', titre = 'Titre', entreprise = 'Entreprise',
          email = '', telephone = '', site = '', adresse = '', ville = '',
          code_postal = '', note, palette = [], cta = 'Nous contacter' } = meta;
  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const textMuted = `${textColor}cc`;
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<!--[if gte mso 15]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
  a{color:${accent};text-decoration:none;}
</style>
</head>
<body>

<!--[if mso]>
<table cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:${bg};border-radius:8px;">
<tr>
  <td width="4" valign="top" style="background:${accent};border-radius:4px 0 0 4px;"></td>
  <td width="86" valign="middle" align="center" style="padding:16px 8px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td width="70" height="70" align="center" valign="middle"
        style="background:${accent}22;border:2px solid ${accent};border-radius:35px;font-family:Arial;font-size:22px;font-weight:700;color:${accent};">
        ${escXml(initials)}
      </td></tr>
    </table>
  </td>
  <td width="2" valign="top" style="padding:16px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="2"><tr><td height="140" style="background:${accent};opacity:0.25;width:2px;"></td></tr></table>
  </td>
  <td valign="middle" style="padding:16px 14px;">
    <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:${textColor};">${escXml(nom)}</p>
    <p style="margin:0 0 2px;font-size:10px;color:${accent};letter-spacing:1.5px;text-transform:uppercase;">${escXml(titre)}</p>
    <p style="margin:0 0 10px;font-size:11px;color:${textMuted};">${escXml(entreprise)}</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;"><tr><td height="1" width="280" style="background:${accent};opacity:0.2;font-size:0;line-height:0;">&nbsp;</td></tr></table>
    ${telephone ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9990; <a href="tel:${escXml(telephone)}" style="color:${accent};text-decoration:none;">${escXml(telephone)}</a></p>` : ''}
    ${email ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9993; <a href="mailto:${escXml(email)}" style="color:${textMuted};text-decoration:none;">${escXml(email)}</a></p>` : ''}
    ${addressLine ? `<p style="margin:0 0 3px;font-size:10px;color:${textMuted};">&#128205; ${escXml(addressLine)}</p>` : ''}
    ${site ? `<p style="margin:0 0 8px;font-size:10px;"><a href="${escXml(site)}" style="color:${accent};text-decoration:none;">${escXml(site.replace(/^https?:\/\//, ''))}</a></p>` : ''}
    ${note ? `<p style="margin:0;font-size:12px;color:#f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733; ${note.toFixed(1)}</p>` : ''}
    <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      <tr><td style="background:${accent};padding:7px 16px;border-radius:5px;">
        <a href="${site ? escXml(site) : '#'}" style="font-size:11px;font-weight:700;color:#ffffff;text-decoration:none;">${escXml(cta)}</a>
      </td></tr>
    </table>
  </td>
</tr>
</table>
<![endif]-->

<!--[if !mso]><!-->
<div style="max-width:620px;">
  <img src="data:image/png;base64,${pngBase64}" alt="Signature ${escXml(nom)} — ${escXml(entreprise)}"
    width="620" style="display:block;max-width:100%;border:0;" />
</div>
<!--<![endif]-->

</body>
</html>`;
}

// ── 6. HTML Apple Mail (CSS animé, compatible Webkit) ────────────────────────

export function buildAppleMailHtml(meta: ExportMetadata, signatureHtml: string): string {
  const { nom = '', entreprise = '', palette = [] } = meta;
  const [bg] = palette.length >= 1 ? palette : ['#0f172a'];
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Signature Apple Mail — ${escXml(nom)}</title>
<style>
  body{margin:0;padding:0;background:#fff;-webkit-font-smoothing:antialiased;}
  @media (prefers-color-scheme:dark){body{background:${bg};}}
</style>
</head>
<body>
${signatureHtml}
</body>
</html>`;
}

// ── 7. HTML Universel hybride (smart multi-client) ───────────────────────────
// Stratégie : MSO Outlook → table, non-MSO → SVG animé en <img>

export function buildUniversalHtml(
  meta: ExportMetadata,
  svgContent: string,
  pngBase64: string,
  svgBase64: string
): string {
  const { nom = '', entreprise = '', palette = [], titre = '',
          telephone = '', email = '', site = '', adresse = '',
          code_postal = '', ville = '', note, cta = '' } = meta;
  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const textMuted = `${textColor}cc`;
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!--[if gte mso 15]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
  a{color:${accent};text-decoration:none;}
  .sig-animated{display:block;max-width:100%;border:0;}
</style>
</head>
<body>

<!-- ══ Outlook / Word — version table statique ══ -->
<!--[if mso]>
<table cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:${bg};border-radius:8px;">
<tr>
  <td width="4" valign="top" style="background:${accent};border-radius:4px 0 0 4px;"></td>
  <td width="86" valign="middle" align="center" style="padding:16px 8px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td width="70" height="70" align="center" valign="middle"
        style="background:${accent}22;border:2px solid ${accent};border-radius:35px;font-family:Arial;font-size:22px;font-weight:700;color:${accent};">
        ${escXml(initials)}
      </td></tr>
    </table>
  </td>
  <td width="2" valign="top" style="padding:16px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="2"><tr><td height="140" style="background:${accent};width:2px;opacity:0.25;font-size:0;line-height:0;">&nbsp;</td></tr></table>
  </td>
  <td valign="middle" style="padding:16px 14px;">
    <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:${textColor};">${escXml(nom)}</p>
    <p style="margin:0 0 2px;font-size:10px;color:${accent};letter-spacing:1.5px;">${escXml(titre.toUpperCase())}</p>
    <p style="margin:0 0 10px;font-size:11px;color:${textMuted};">${escXml(entreprise)}</p>
    ${telephone ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9990; ${escXml(telephone)}</p>` : ''}
    ${email ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9993; ${escXml(email)}</p>` : ''}
    ${addressLine ? `<p style="margin:0 0 3px;font-size:10px;color:${textMuted};">&#128205; ${escXml(addressLine)}</p>` : ''}
    ${site ? `<p style="margin:0 0 8px;font-size:10px;color:${accent};">${escXml(site.replace(/^https?:\/\//, ''))}</p>` : ''}
    ${note ? `<p style="margin:0 0 6px;font-size:12px;color:#f59e0b;">&#9733; ${note.toFixed(1)}</p>` : ''}
    ${cta ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${accent};padding:7px 16px;border-radius:5px;"><a href="${site ? escXml(site) : '#'}" style="font-size:11px;font-weight:700;color:#ffffff;text-decoration:none;">${escXml(cta)}</a></td></tr></table>` : ''}
  </td>
</tr>
</table>
<![endif]-->

<!-- ══ Gmail / Apple Mail / Webmail — SVG animé en <img> ══ -->
<!--[if !mso]><!-->
<img src="data:image/svg+xml;base64,${svgBase64}"
  alt="Signature ${escXml(nom)} — ${escXml(entreprise)}"
  width="620"
  class="sig-animated"
  style="display:block;max-width:100%;border:0;" />
<!--<![endif]-->

</body>
</html>`;
}

// ── 8. Guide d'installation HTML multi-client ─────────────────────────────────

export function buildInstallationGuide(
  meta: ExportMetadata,
  signatureId: string
): string {
  const { nom = '', entreprise = '', secteur = '', palette = [] } = meta;
  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];

  const steps = [
    {
      client: 'Gmail',
      icon: '📧',
      color: '#EA4335',
      steps: [
        'Ouvrez Gmail → Paramètres (⚙️) → "Voir tous les paramètres"',
        'Onglet <strong>Général</strong> → section <strong>Signature</strong>',
        'Cliquez <strong>Créer une signature</strong>, donnez-lui un nom',
        'Cliquez sur l\'icône <strong>HTML</strong> (&lt;&gt;) dans l\'éditeur de signature',
        'Copiez-collez le contenu du fichier <code>signature-gmail.html</code>',
        'Faites défiler vers le bas, cliquez <strong>Enregistrer les modifications</strong>',
      ],
      file: 'signature-gmail.html',
      badge: '✅ CSS Animé',
    },
    {
      client: 'Outlook (Windows & Mac)',
      icon: '📮',
      color: '#0078D4',
      steps: [
        'Ouvrez Outlook → Fichier → Options (ou Outlook → Préférences sur Mac)',
        'Courrier → <strong>Signatures</strong>',
        'Cliquez <strong>Nouveau</strong>, donnez un nom à votre signature',
        'Dans l\'éditeur de signature, cliquez droit → <strong>Modifier la source HTML</strong>',
        'Copiez-collez le contenu du fichier <code>signature-outlook.htm</code>',
        'Cliquez <strong>OK</strong> puis <strong>Enregistrer</strong>',
      ],
      file: 'signature-outlook.htm',
      badge: '✅ Compatible MSO',
    },
    {
      client: 'Apple Mail',
      icon: '🍎',
      color: '#007AFF',
      steps: [
        'Ouvrez Mail → Préférences → <strong>Signatures</strong>',
        'Sélectionnez votre compte email à gauche',
        'Cliquez <strong>+</strong> pour créer une nouvelle signature',
        'Fermez Préférences. Allez dans <code>~/Library/Mail/V10/MailData/Signatures/</code>',
        'Trouvez le fichier .mailsignature le plus récent, remplacez son contenu par <code>signature-apple-mail.html</code>',
        'Verrouillez le fichier (Cmd+I → "Verrouillé") pour empêcher Mail de le réécrire',
      ],
      file: 'signature-apple-mail.html',
      badge: '✅ CSS Animé',
    },
    {
      client: 'Thunderbird',
      icon: '⚡',
      color: '#FF6611',
      steps: [
        'Ouvrez Thunderbird → Outils → Paramètres du compte',
        'Sélectionnez votre compte → <strong>Composition & Adressage</strong>',
        'Cochez "Joindre ma signature depuis un fichier (texte, HTML ou image)"',
        'Cliquez <strong>Choisir...</strong> et sélectionnez le fichier <code>signature-apple-mail.html</code>',
      ],
      file: 'signature-apple-mail.html',
      badge: '✅ CSS Animé',
    },
    {
      client: 'Webmail (Yahoo, Outlook.com, etc.)',
      icon: '🌐',
      color: '#6366F1',
      steps: [
        'Paramètres → Signature',
        'Activez le mode HTML si disponible',
        'Copiez-collez le contenu du fichier <code>signature-gmail.html</code>',
        'Si pas de mode HTML, utilisez directement l\'image <code>signature-statique.png</code>',
      ],
      file: 'signature-gmail.html',
      badge: '✅ Compatible',
    },
  ];

  const stepsHtml = steps.map(s => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <span style="font-size:28px;">${s.icon}</span>
        <div>
          <h3 style="margin:0;font-size:16px;color:#111827;">${s.client}</h3>
          <span style="display:inline-block;background:${s.color}18;color:${s.color};border:1px solid ${s.color}44;border-radius:20px;padding:2px 10px;font-size:11px;margin-top:4px;">${s.badge}</span>
        </div>
        <span style="margin-left:auto;font-family:monospace;font-size:11px;background:#f3f4f6;padding:4px 10px;border-radius:6px;color:#6b7280;">${s.file}</span>
      </div>
      <ol style="margin:0;padding-left:20px;line-height:1.8;">
        ${s.steps.map(st => `<li style="font-size:13px;color:#374151;">${st}</li>`).join('')}
      </ol>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Guide d'installation — Signature ${escXml(nom)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;color:#111827;padding:32px 16px;}
  code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:12px;color:#6b7280;}
  strong{color:#111827;}
</style>
</head>
<body>
<div style="max-width:720px;margin:0 auto;">

  <div style="text-align:center;margin-bottom:40px;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:${accent}18;
      border:1px solid ${accent}44;border-radius:100px;padding:6px 18px;font-size:11px;
      letter-spacing:2px;text-transform:uppercase;color:${accent};margin-bottom:20px;">
      ✦ EffectForge AI — Signature Vivante
    </div>
    <h1 style="font-size:28px;font-weight:700;color:${accent};margin-bottom:8px;">${escXml(nom)}</h1>
    <p style="color:#6b7280;font-size:14px;">${escXml(entreprise)} · Secteur ${escXml(secteur)} · ID: ${signatureId.slice(0, 8)}</p>
  </div>

  <div style="background:${bg};border-radius:12px;padding:20px;margin-bottom:32px;text-align:center;">
    <p style="color:${textColor};font-size:13px;opacity:0.7;margin-bottom:8px;">Aperçu de votre signature</p>
    <div style="display:inline-block;border-radius:8px;overflow:hidden;max-width:100%;">
    </div>
  </div>

  <h2 style="font-size:18px;font-weight:700;margin-bottom:20px;color:#111827;">
    📦 Fichiers inclus dans votre package
  </h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;font-size:13px;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-weight:600;">Fichier</th>
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-weight:600;">Usage</th>
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-weight:600;">Compatibilité</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-gmail.html</code></td><td style="padding:10px 14px;">Gmail, Webmail</td><td style="padding:10px 14px;color:#059669;">✅ CSS Animé</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-outlook.htm</code></td><td style="padding:10px 14px;">Outlook (Windows/Mac)</td><td style="padding:10px 14px;color:#0078D4;">✅ MSO Compatible</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-apple-mail.html</code></td><td style="padding:10px 14px;">Apple Mail, Thunderbird</td><td style="padding:10px 14px;color:#059669;">✅ CSS Animé</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-universelle.html</code></td><td style="padding:10px 14px;">Copier-coller universel</td><td style="padding:10px 14px;color:#6366f1;">✅ Multi-client</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-animee.svg</code></td><td style="padding:10px 14px;">Embed &lt;img&gt; SVG animé</td><td style="padding:10px 14px;color:#059669;">✅ SMIL Natif</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-animee.gif</code></td><td style="padding:10px 14px;">GIF animé universel</td><td style="padding:10px 14px;color:#f59e0b;">✅ Outlook (1er frame)</td></tr>
      <tr><td style="padding:10px 14px;"><code>signature-statique.png</code></td><td style="padding:10px 14px;">Fallback image</td><td style="padding:10px 14px;color:#6b7280;">✅ Universel</td></tr>
    </tbody>
  </table>

  <h2 style="font-size:18px;font-weight:700;margin-bottom:20px;color:#111827;">
    🔧 Instructions par client email
  </h2>
  ${stepsHtml}

  <div style="margin-top:40px;text-align:center;padding:20px;background:${accent}0a;border-radius:12px;border:1px solid ${accent}22;">
    <p style="font-size:13px;color:#6b7280;">Signature générée par <strong style="color:${accent};">EffectForge AI</strong> · ID: ${signatureId}</p>
    <p style="font-size:11px;color:#9ca3af;margin-top:4px;">Pour toute assistance : hello@effectforge.ai</p>
  </div>

</div>
</body>
</html>`;
}

// ── 9. Assemblage ZIP complet ─────────────────────────────────────────────────

export async function buildCompleteZip(params: {
  signatureId: string;
  gmailHtml: string;
  outlookHtml: string;
  appleHtml: string;
  universalHtml: string;
  animatedSvg: string;
  staticPng: Buffer;
  animatedGif: Buffer;
  guideHtml: string;
  nom: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk: Buffer) => chunks.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(chunks)));
    passthrough.on('error', reject);
    archive.on('error', reject);
    archive.pipe(passthrough);

    const slug = params.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'signature';

    archive.append(params.gmailHtml,        { name: `${slug}/signature-gmail.html` });
    archive.append(params.outlookHtml,      { name: `${slug}/signature-outlook.htm` });
    archive.append(params.appleHtml,        { name: `${slug}/signature-apple-mail.html` });
    archive.append(params.universalHtml,    { name: `${slug}/signature-universelle.html` });
    archive.append(params.animatedSvg,      { name: `${slug}/signature-animee.svg` });
    archive.append(params.staticPng,        { name: `${slug}/signature-statique.png` });
    archive.append(params.animatedGif,      { name: `${slug}/signature-animee.gif` });
    archive.append(params.guideHtml,        { name: `${slug}/GUIDE_INSTALLATION.html` });
    archive.append(JSON.stringify({
      signatureId: params.signatureId,
      generatedAt: new Date().toISOString(),
      engine: 'EffectForge AI v3.0',
      compatibility: {
        gmail:    'CSS animated',
        outlook:  'MSO table + static PNG',
        apple:    'CSS animated',
        mobile:   'Responsive',
        universal: 'SVG SMIL animated',
      },
      files: [
        'signature-gmail.html', 'signature-outlook.htm',
        'signature-apple-mail.html', 'signature-universelle.html',
        'signature-animee.svg', 'signature-animee.gif',
        'signature-statique.png', 'GUIDE_INSTALLATION.html',
      ],
    }, null, 2), { name: `${slug}/metadata.json` });

    archive.finalize();
  });
}

// ── 10. Orchestrateur principal ───────────────────────────────────────────────

export async function generateCompleteExport(
  sectorId: string,
  signatureHtml: string,
  meta: ExportMetadata,
): Promise<CompleteExportResult> {
  const { randomUUID } = await import('crypto');
  const signatureId = randomUUID();
  const slug = (meta.nom || 'signature').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);

  log(`Export complet démarré — ID: ${signatureId}, secteur: ${sectorId}`, 'export-complete');

  // Génération en parallèle des assets lourds
  const [staticPng, animatedGif] = await Promise.all([
    buildStaticPng(meta),
    buildAnimatedGif(meta),
  ]);

  const animatedSvg = buildAnimatedSVG(meta);
  const svgBase64 = Buffer.from(animatedSvg).toString('base64');
  const pngBase64 = staticPng.toString('base64');

  const gmailHtml     = buildGmailHtml(meta, signatureHtml);
  const outlookHtml   = buildOutlookHtml(meta, pngBase64);
  const appleHtml     = buildAppleMailHtml(meta, signatureHtml);
  const universalHtml = buildUniversalHtml(meta, animatedSvg, pngBase64, svgBase64);
  const guideHtml     = buildInstallationGuide(meta, signatureId);

  const zip = await buildCompleteZip({
    signatureId, nom: meta.nom || 'signature',
    gmailHtml, outlookHtml, appleHtml, universalHtml,
    animatedSvg, staticPng, animatedGif, guideHtml,
  });

  log(`Export complet terminé — ZIP: ${Math.round(zip.length / 1024)}KB`, 'export-complete');

  return {
    signatureId,
    formats: {
      gmail:       { html: gmailHtml,     filename: `${slug}-gmail.html` },
      outlook:     { html: outlookHtml,   filename: `${slug}-outlook.htm` },
      appleMail:   { html: appleHtml,     filename: `${slug}-apple-mail.html` },
      universal:   { html: universalHtml, filename: `${slug}-universelle.html` },
      animatedSvg: { svg: animatedSvg,    filename: `${slug}-animee.svg` },
      staticPng:   { buffer: staticPng,   filename: `${slug}-statique.png` },
      animatedGif: { buffer: animatedGif, filename: `${slug}-animee.gif` },
    },
    guide: { html: guideHtml, filename: `${slug}-guide-installation.html` },
    zip:   { buffer: zip,     filename: `signature-${slug}-effectforge.zip` },
  };
}
