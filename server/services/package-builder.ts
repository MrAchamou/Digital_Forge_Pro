import sharp from 'sharp';
import { log } from '../vite';

export interface PackageFiles {
  svgContent: string;
  pngBuffer: Buffer;
  outlookHtml: string;
  gmailHtml: string;
}

export async function buildSvgFallbackPng(
  svgContent: string,
  metadata?: { nom?: string; titre?: string; entreprise?: string; email?: string; palette?: string[] }
): Promise<Buffer> {
  try {
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .resize(1200, 360)
      .png({ quality: 100 })
      .toBuffer();
    return pngBuffer;
  } catch (err) {
    log(`Erreur conversion PNG sharp, fallback texte activé: ${err}`, 'package-builder');

    // ── Fallback intelligent : PNG avec données texte réelles ──
    const nom = metadata?.nom || 'Prénom Nom';
    const titre = metadata?.titre || '';
    const entreprise = metadata?.entreprise || '';
    const email = metadata?.email || '';
    const palette = metadata?.palette || ['#0f172a', '#6366f1', '#e8e8ff'];
    const [bg, accent, textLight] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];

    const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();

    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360" viewBox="0 0 1200 360">
  <rect width="1200" height="360" fill="${bg}"/>
  <rect x="0" y="0" width="6" height="360" fill="${accent}"/>
  <!-- Avatar cercle -->
  <circle cx="120" cy="180" r="64" fill="${accent}22" stroke="${accent}" stroke-width="2"/>
  <text x="120" y="192" font-family="Arial,sans-serif" font-size="38" font-weight="700"
        fill="${accent}" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  <!-- Séparateur vertical -->
  <rect x="210" y="80" width="2" height="200" fill="${accent}" opacity="0.4"/>
  <!-- Nom -->
  <text x="240" y="155" font-family="Arial,sans-serif" font-size="36" font-weight="700"
        fill="${textLight}">${esc(nom)}</text>
  <!-- Titre -->
  ${titre ? `<text x="240" y="193" font-family="Arial,sans-serif" font-size="18" letter-spacing="2"
        fill="${accent}" text-transform="uppercase">${esc(titre.toUpperCase())}</text>` : ''}
  <!-- Entreprise -->
  <text x="240" y="${titre ? '222' : '196'}" font-family="Arial,sans-serif" font-size="20"
        fill="${textLight}" opacity="0.65">${esc(entreprise)}</text>
  <!-- Ligne séparatrice -->
  <rect x="240" y="240" width="600" height="1" fill="${textLight}" opacity="0.15"/>
  <!-- Email -->
  ${email ? `<text x="240" y="264" font-family="Arial,sans-serif" font-size="16"
        fill="${textLight}" opacity="0.55">${esc(email)}</text>` : ''}
  <!-- Watermark -->
  <text x="1180" y="350" font-family="Arial,sans-serif" font-size="11"
        fill="${textLight}" opacity="0.15" text-anchor="end">EffectForge AI • Rendu approximatif</text>
</svg>`;

    const fallback = await sharp(Buffer.from(fallbackSvg))
      .resize(1200, 360)
      .png({ quality: 90 })
      .toBuffer();

    log(`PNG fallback texte généré pour: ${nom}`, 'package-builder');
    return fallback;
  }
}

function esc(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildOutlookVersion(svgContent: string, metadata: any, pngBase64: string): string {
  const { nom = 'Prénom Nom', titre = 'Directeur', entreprise = 'Entreprise',
    email = '', telephone = '', site = '', palette = [] } = metadata;
  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f0f0f', '#6366f1', '#e8e8ff'];
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if gte mso 15]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
<style>
  body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
  .signature-wrapper { max-width: 600px; }
  @media only screen and (max-width: 480px) {
    .signature-wrapper { width: 100% !important; }
    .sig-name { font-size: 16px !important; }
  }
</style>
</head>
<body>
<!--[if mso]>
<table cellpadding="0" cellspacing="0" border="0" style="background:${bg};max-width:600px;">
  <tr>
    <td width="110" valign="middle" align="center" style="padding:20px 10px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="80" height="80" align="center" valign="middle"
            style="background:${accent}22;border:1.5px solid ${accent};border-radius:50%;font-family:Arial;font-size:24px;font-weight:700;color:${accent};">
            ${initials}
          </td>
        </tr>
      </table>
    </td>
    <td width="2" valign="top" style="padding:16px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="2" height="120">
        <tr><td style="background:${accent};width:2px;"></td></tr>
      </table>
    </td>
    <td valign="middle" style="padding:20px 15px;">
      <p style="margin:0;font-family:Arial;font-size:18px;font-weight:700;color:${textColor};">${nom}</p>
      <p style="margin:4px 0 0;font-family:Arial;font-size:11px;color:${accent};letter-spacing:1px;text-transform:uppercase;">${titre}</p>
      <p style="margin:4px 0 0;font-family:Arial;font-size:12px;color:${textColor};opacity:0.7;">${entreprise}</p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
        <tr><td height="1" style="background:${textColor};opacity:0.2;" colspan="1"></td></tr>
      </table>
      ${email ? `<p style="margin:8px 0 0;font-family:Arial;font-size:11px;color:${textColor};opacity:0.7;">&#9993; ${email}</p>` : ''}
      ${telephone ? `<p style="margin:4px 0 0;font-family:Arial;font-size:11px;color:${textColor};opacity:0.7;">&#9990; ${telephone}</p>` : ''}
      ${site ? `<p style="margin:4px 0 0;font-family:Arial;font-size:11px;color:${accent};">${site.replace('https://', '')}</p>` : ''}
    </td>
  </tr>
</table>
<![endif]-->
<!--[if !mso]><!-->
<div class="signature-wrapper" style="background:${bg};padding:16px;border-radius:8px;max-width:600px;">
  <img src="data:image/png;base64,${pngBase64}" alt="Signature ${nom} - ${entreprise}" width="600" height="180"
    style="display:block;max-width:100%;border:0;" />
</div>
<!--<![endif]-->
</body>
</html>`;
}

export function buildGmailVersion(svgContent: string, metadata: any): string {
  const { nom = 'Prénom Nom', entreprise = 'Entreprise', palette = [] } = metadata;
  const [bg] = palette.length >= 3 ? palette : ['#0f0f0f', '#6366f1', '#e8e8ff'];

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Signature Gmail — ${nom}</title>
<style>
  body { margin: 0; padding: 0; background: #fff; font-family: Arial, sans-serif; }
  .sig-container { max-width: 600px; background: ${bg}; border-radius: 8px; overflow: hidden; }
  .sig-svg { display: block; width: 100%; }
  @media (prefers-color-scheme: light) {
    .sig-container { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
  }
  @media only screen and (max-width: 480px) {
    .sig-container { width: 100% !important; border-radius: 0; }
  }
</style>
</head>
<body>
<div class="sig-container">
  ${svgContent}
</div>
<!-- Signature ${nom} — ${entreprise} — Généré par EffectForge AI -->
</body>
</html>`;
}

export async function buildAllPackageFiles(svgContent: string, metadata: any): Promise<PackageFiles> {
  const pngBuffer = await buildSvgFallbackPng(svgContent, metadata);
  const pngBase64 = pngBuffer.toString('base64');
  const outlookHtml = buildOutlookVersion(svgContent, metadata, pngBase64);
  const gmailHtml = buildGmailVersion(svgContent, metadata);

  log('Fichiers package construits (SVG, PNG, Outlook, Gmail)', 'package-builder');

  return { svgContent, pngBuffer, outlookHtml, gmailHtml };
}
