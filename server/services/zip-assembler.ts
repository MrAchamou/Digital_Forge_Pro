import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { log } from '../vite';

// ── Générateur de la page preview locale (offline) ────────────────────────────
function buildLocalPreviewHtml(params: {
  svgContent: string;
  nom: string;
  titre: string;
  entreprise: string;
  email: string;
  telephone: string;
  site: string;
  secteur: string;
  signatureId: string;
  palette: string[];
  effectsUsed: string[];
}): string {
  const { svgContent, nom, titre, entreprise, email, telephone, site, secteur, signatureId, palette, effectsUsed } = params;
  const [bg, accent, textLight] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const effectsList = effectsUsed.length > 0 ? effectsUsed.join(' · ') : 'SOUL_AURA · NEON_PULSE';
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Signature Vivante — ${nom} · ${entreprise}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${bg};
    --accent: ${accent};
    --text: ${textLight};
    --card: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.10);
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Segoe UI', Arial, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px 80px;
  }
  /* ── Header ── */
  .header { text-align: center; margin-bottom: 48px; }
  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--accent); border-radius: 100px;
    padding: 6px 16px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 24px;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
  .badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  .headline {
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 12px;
  }
  .headline span { color: var(--accent); }
  .subline { font-size: 15px; opacity: 0.5; max-width: 500px; margin: 0 auto; }

  /* ── Preview card ── */
  .preview-card {
    width: 100%; max-width: 720px;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.5),
                0 0 60px color-mix(in srgb, var(--accent) 12%, transparent);
    margin-bottom: 40px;
    position: relative;
  }
  .preview-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
  }
  .preview-inner { padding: 0; }
  .preview-inner svg, .preview-inner img { display: block; width: 100%; height: auto; }

  /* ── Info section ── */
  .info-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; width: 100%; max-width: 720px; margin-bottom: 40px;
  }
  @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  .info-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
  }
  .info-card-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.35; margin-bottom: 8px; }
  .info-card-value { font-size: 14px; font-weight: 500; opacity: 0.85; }
  .info-card-value a { color: var(--accent); text-decoration: none; }

  /* ── Palette ── */
  .palette-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .swatch {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    flex-shrink: 0;
  }
  .swatch-label { font-size: 10px; font-family: monospace; opacity: 0.4; margin-top: 4px; text-align: center; }

  /* ── Effects chips ── */
  .effects-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .effect-chip {
    font-size: 10px; padding: 3px 10px; border-radius: 100px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--accent); letter-spacing: 0.5px;
  }

  /* ── Buttons ── */
  .buttons { display: flex; gap: 12px; flex-wrap: wrap; width: 100%; max-width: 720px; margin-bottom: 48px; }
  .btn {
    flex: 1; min-width: 160px; padding: 13px 20px; border-radius: 10px;
    font-size: 13px; font-weight: 600; text-align: center;
    border: none; cursor: pointer; text-decoration: none; display: block;
    transition: opacity 0.2s;
  }
  .btn:hover { opacity: 0.85; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); opacity: 0.7; }

  /* ── ID Card ── */
  .id-card {
    width: 100%; max-width: 720px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: gap;
    margin-bottom: 40px;
  }
  .id-info { }
  .id-info p { font-size: 12px; opacity: 0.35; margin-bottom: 4px; }
  .id-info code { font-size: 13px; font-family: monospace; opacity: 0.65; letter-spacing: 1px; }

  /* ── Footer ── */
  footer {
    text-align: center; font-size: 11px; opacity: 0.2; letter-spacing: 1px;
  }
</style>
</head>
<body>

<!-- ── Header ── -->
<div class="header">
  <div class="badge">
    <span class="dot"></span>
    Signature Vivante · EffectForge AI
  </div>
  <h1 class="headline">${escHtml(nom)}<br><span>${escHtml(entreprise)}</span></h1>
  <p class="subline">${escHtml(titre || secteur)} · Créée le ${dateStr}</p>
</div>

<!-- ── Preview animée ── -->
<div class="preview-card">
  <div class="preview-inner">
    ${svgContent}
  </div>
</div>

<!-- ── Info grid ── -->
<div class="info-grid">
  <div class="info-card">
    <div class="info-card-label">Identité</div>
    <div class="info-card-value">
      ${escHtml(nom)}<br>
      <span style="opacity:0.55;font-size:12px;">${escHtml(titre || '')}</span>
    </div>
  </div>
  <div class="info-card">
    <div class="info-card-label">Entreprise</div>
    <div class="info-card-value">
      ${escHtml(entreprise)}<br>
      <span style="opacity:0.55;font-size:12px;">${escHtml(secteur)}</span>
    </div>
  </div>
  ${email ? `<div class="info-card">
    <div class="info-card-label">Email</div>
    <div class="info-card-value"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></div>
  </div>` : ''}
  ${telephone ? `<div class="info-card">
    <div class="info-card-label">Téléphone</div>
    <div class="info-card-value">${escHtml(telephone)}</div>
  </div>` : ''}
  ${site ? `<div class="info-card">
    <div class="info-card-label">Site web</div>
    <div class="info-card-value"><a href="${escHtml(site)}" target="_blank">${escHtml(site.replace('https://',''))}</a></div>
  </div>` : ''}
  <div class="info-card">
    <div class="info-card-label">Palette de marque</div>
    <div class="info-card-value">
      <div class="palette-row">
        ${palette.map(c => `<div><div class="swatch" style="background:${c};"></div><div class="swatch-label">${c}</div></div>`).join('')}
      </div>
    </div>
  </div>
  <div class="info-card">
    <div class="info-card-label">Effets visuels actifs</div>
    <div class="info-card-value">
      <div class="effects-list">
        ${effectsUsed.map(e => `<span class="effect-chip">${escHtml(e)}</span>`).join('')}
      </div>
    </div>
  </div>
</div>

<!-- ── Boutons d'installation ── -->
<div class="buttons">
  <a href="signature-gmail.html" class="btn btn-primary" target="_blank">📧 Installer dans Gmail</a>
  <a href="instructions-gmail.pdf" class="btn btn-outline" target="_blank">📋 Guide Gmail (PDF)</a>
  <a href="instructions-outlook.pdf" class="btn btn-outline" target="_blank">📋 Guide Outlook (PDF)</a>
  <a href="instructions-apple-mail.pdf" class="btn btn-outline" target="_blank">📋 Guide Apple Mail (PDF)</a>
</div>

<!-- ── ID Signature ── -->
<div class="id-card">
  <div class="id-info">
    <p>Identifiant de signature</p>
    <code>${escHtml(signatureId)}</code>
  </div>
  <div style="text-align:right;">
    <p style="font-size:11px;opacity:0.3;margin-bottom:4px;">Générée par</p>
    <p style="font-size:13px;opacity:0.6;font-weight:600;">EffectForge AI</p>
  </div>
</div>

<footer>© EffectForge AI · ${nom} · ${entreprise} · ${dateStr}</footer>

</body>
</html>`;
}

// ── Carte palette de marque ───────────────────────────────────────────────────
function buildPaletteHtml(params: {
  nom: string;
  entreprise: string;
  palette: string[];
  signatureId: string;
}): string {
  const { nom, entreprise, palette, signatureId } = params;
  const [bg, accent, textLight] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];

  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Palette de Marque — ${nom} · ${entreprise}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${bg}; color: ${textLight}; font-family: 'Segoe UI', Arial, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
  .title { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.35; margin-bottom: 12px; }
  h1 { font-size: clamp(22px, 4vw, 36px); font-weight: 700; margin-bottom: 8px; }
  h1 span { color: ${accent}; }
  .sub { font-size: 14px; opacity: 0.45; margin-bottom: 48px; }
  .swatches { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 48px; }
  .swatch-block { text-align: center; }
  .swatch-big { width: 120px; height: 120px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 8px 24px rgba(0,0,0,0.4); margin-bottom: 12px; }
  .swatch-name { font-size: 11px; opacity: 0.4; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .swatch-hex { font-size: 14px; font-family: monospace; font-weight: 600; opacity: 0.8; }
  .swatch-rgb { font-size: 10px; opacity: 0.3; font-family: monospace; margin-top: 2px; }
  footer { font-size: 11px; opacity: 0.2; }
</style>
</head>
<body>
  <p class="title">Charte Colorimétrique · EffectForge AI</p>
  <h1>${escHtml(nom)} · <span>${escHtml(entreprise)}</span></h1>
  <p class="sub">Palette officielle de votre signature email animée</p>
  <div class="swatches">
    ${palette.map((c, i) => {
      const labels = ['Fond principal', 'Couleur d\'accent', 'Texte clair'];
      return `<div class="swatch-block">
        <div class="swatch-big" style="background:${c};"></div>
        <div class="swatch-name">${labels[i] || `Couleur ${i + 1}`}</div>
        <div class="swatch-hex">${c.toUpperCase()}</div>
        <div class="swatch-rgb">rgb(${hexToRgb(c)})</div>
      </div>`;
    }).join('')}
  </div>
  <footer>Signature ${signatureId} · EffectForge AI</footer>
</body>
</html>`;
}

function escHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Interface principale ──────────────────────────────────────────────────────
export async function assembleZip(params: {
  signatureId: string;
  entreprise: string;
  svgContent: string;
  pngBuffer: Buffer;
  outlookHtml: string;
  gmailHtml: string;
  gmailPdfBuffer: Buffer;
  outlookPdfBuffer: Buffer;
  applePdfBuffer: Buffer;
  configJson: string;
  readmeTxt: string;
  outputDir: string;
  metadata?: {
    nom?: string;
    titre?: string;
    email?: string;
    telephone?: string;
    site?: string;
    secteur?: string;
    palette?: string[];
  };
  effectsUsed?: string[];
}): Promise<string> {
  const {
    signatureId, entreprise,
    svgContent, pngBuffer, outlookHtml, gmailHtml,
    gmailPdfBuffer, outlookPdfBuffer, applePdfBuffer,
    configJson, readmeTxt, outputDir,
    metadata = {}, effectsUsed = [],
  } = params;

  const nom = metadata.nom || entreprise;
  const titre = metadata.titre || '';
  const email = metadata.email || '';
  const telephone = metadata.telephone || '';
  const site = metadata.site || '';
  const secteur = metadata.secteur || '';
  const palette = metadata.palette || ['#0f172a', '#6366f1', '#e8e8ff'];

  const safeName = entreprise
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  const zipFilename = `signature-${safeName}-${signatureId.split('_')[1] || signatureId}.zip`;
  const zipPath = path.join(outputDir, zipFilename);

  await fs.promises.mkdir(outputDir, { recursive: true });

  // ── Preview locale premium ──────────────────────────────────────────────
  const localPreviewHtml = buildLocalPreviewHtml({
    svgContent, nom, titre, entreprise, email, telephone, site, secteur,
    signatureId, palette, effectsUsed,
  });

  // ── Carte palette de marque ─────────────────────────────────────────────
  const paletteHtml = buildPaletteHtml({ nom, entreprise, palette, signatureId });

  // ── Manifest ──────────────────────────────────────────────────────────
  const fileEntries = [
    { name: 'PREVIEW — Ouvrez ce fichier.html',      size: Buffer.byteLength(localPreviewHtml, 'utf-8'),  type: 'text/html',         description: 'Page de prévisualisation locale (ouvrir dans navigateur)' },
    { name: 'signature.svg',                          size: Buffer.byteLength(svgContent, 'utf-8'),        type: 'image/svg+xml',     description: 'Signature animée principale (SVG)' },
    { name: 'signature-fallback.png',                 size: pngBuffer.length,                              type: 'image/png',         description: 'Version statique haute résolution (PNG)' },
    { name: 'signature-gmail.html',                   size: Buffer.byteLength(gmailHtml, 'utf-8'),         type: 'text/html',         description: 'Version optimisée Gmail (HTML)' },
    { name: 'signature-outlook.htm',                  size: Buffer.byteLength(outlookHtml, 'utf-8'),       type: 'text/html',         description: 'Version optimisée Outlook (HTM)' },
    { name: 'instructions-gmail.pdf',                 size: gmailPdfBuffer.length,                         type: 'application/pdf',   description: 'Guide d\'installation Gmail (PDF)' },
    { name: 'instructions-outlook.pdf',               size: outlookPdfBuffer.length,                       type: 'application/pdf',   description: 'Guide d\'installation Outlook (PDF)' },
    { name: 'instructions-apple-mail.pdf',            size: applePdfBuffer.length,                         type: 'application/pdf',   description: 'Guide d\'installation Apple Mail (PDF)' },
    { name: 'palette-de-marque.html',                 size: Buffer.byteLength(paletteHtml, 'utf-8'),      type: 'text/html',         description: 'Charte colorimétrique de la signature' },
    { name: 'config.json',                            size: Buffer.byteLength(configJson, 'utf-8'),        type: 'application/json',  description: 'Configuration technique complète' },
    { name: 'LISEZ-MOI.txt',                          size: Buffer.byteLength(readmeTxt, 'utf-8'),        type: 'text/plain',        description: 'Instructions et informations importantes' },
  ];

  const manifest = {
    signature_id:       signatureId,
    generated_at:       new Date().toISOString(),
    client:             { nom, entreprise, secteur, email, titre },
    effects_used:       effectsUsed,
    palette,
    total_files:        fileEntries.length + 1,
    total_size_bytes:   fileEntries.reduce((acc, f) => acc + f.size, 0),
    files:              fileEntries,
    generator:          'EffectForge AI — God Tier',
    version:            '3.0',
    instructions:       '→ Commencez par ouvrir "PREVIEW — Ouvrez ce fichier.html" dans votre navigateur.',
  };
  const manifestJson = JSON.stringify(manifest, null, 2);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', () => {
      log(`ZIP assemblé: ${zipFilename} (${archive.pointer()} bytes) — ${fileEntries.length + 1} fichiers`, 'zip-assembler');
      resolve(zipPath);
    });

    archive.on('error', reject);
    archive.pipe(output);

    // Fichier phare en premier
    archive.append(localPreviewHtml, { name: 'PREVIEW — Ouvrez ce fichier.html' });
    archive.append(svgContent,       { name: 'signature.svg' });
    archive.append(pngBuffer,        { name: 'signature-fallback.png' });
    archive.append(gmailHtml,        { name: 'signature-gmail.html' });
    archive.append(outlookHtml,      { name: 'signature-outlook.htm' });
    archive.append(gmailPdfBuffer,   { name: 'instructions-gmail.pdf' });
    archive.append(outlookPdfBuffer, { name: 'instructions-outlook.pdf' });
    archive.append(applePdfBuffer,   { name: 'instructions-apple-mail.pdf' });
    archive.append(paletteHtml,      { name: 'palette-de-marque.html' });
    archive.append(configJson,       { name: 'config.json' });
    archive.append(readmeTxt,        { name: 'LISEZ-MOI.txt' });
    archive.append(manifestJson,     { name: 'manifest.json' });

    archive.finalize();
  });
}
