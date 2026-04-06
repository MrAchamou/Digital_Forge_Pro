import path from 'path';
import fs from 'fs/promises';
import { log } from '../vite';
import type { PreviewPageContent } from './cerebras-content-generator';
import type { NarrativeScenario } from './triple-ai-director';

function esc(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function generatePreviewPage(params: {
  signatureId: string;
  svgContent: string;
  metadata: any;
  scenario: NarrativeScenario;
  pageContent: PreviewPageContent;
  baseUrl: string;
  outputDir: string;
}): Promise<string> {
  const { signatureId, svgContent, metadata, scenario, pageContent, baseUrl, outputDir } = params;
  const { nom = 'Client', entreprise = 'Entreprise', palette = [] } = metadata;
  const [bg, accent] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];

  const variations = scenario?.variations || {};
  const varKeys = ['A', 'B', 'C', 'D'] as const;

  const variationsHtml = varKeys.map((key) => {
    const v = (variations as any)[key] || {};
    return `
    <div class="variation-card">
      <div class="variation-label" style="color:${accent}">${key}</div>
      <div class="variation-title">${v.titre || `Variation ${key}`}</div>
      <div class="variation-subtitle">${v.sous_titre || ''}</div>
      <div class="variation-intention">${v.intention || ''}</div>
      <div class="variation-emotion" style="color:${accent}">${v.emotion_dominante || ''}</div>
    </div>`;
  }).join('');

  const previewUrl = `${baseUrl}/api/signature/preview/${signatureId}`;
  const downloadUrl = `${baseUrl}/api/signature/download/${signatureId}`;
  const gmailFileUrl = `${baseUrl}/api/signature/export-file/${signatureId}/gmail`;
  const outlookFileUrl = `${baseUrl}/api/signature/export-file/${signatureId}/outlook`;
  const appleFileUrl = `${baseUrl}/api/signature/export-file/${signatureId}/svg`;
  const gmailPdfUrl = `${baseUrl}/api/signature/export-file/${signatureId}/pdf-gmail`;
  const outlookPdfUrl = `${baseUrl}/api/signature/export-file/${signatureId}/pdf-outlook`;
  const applePdfUrl = `${baseUrl}/api/signature/export-file/${signatureId}/pdf-apple`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageContent.titre_page}</title>
<meta name="description" content="${pageContent.description}">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${bg};
    --accent: ${accent};
    --text: #e8e8ff;
    --card: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.08);
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Georgia', 'Arial', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }
  /* ── HERO ── */
  .hero {
    text-align: center;
    padding: 80px 20px 60px;
    position: relative;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse at center, ${accent}22 0%, transparent 70%);
    pointer-events: none;
  }
  .badge {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid ${accent}44;
    border-radius: 20px;
    padding: 6px 16px;
    margin-bottom: 24px;
    animation: fadeInDown 0.6s ease;
  }
  .hero h1 {
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 400;
    line-height: 1.2;
    margin-bottom: 16px;
    animation: fadeInUp 0.8s ease;
  }
  .hero p {
    font-size: 16px;
    color: rgba(232,232,255,0.6);
    max-width: 500px;
    margin: 0 auto 48px;
    line-height: 1.6;
    animation: fadeInUp 1s ease;
  }
  /* ── MOCK GMAIL ── */
  .gmail-mock {
    max-width: 700px;
    margin: 0 auto 20px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    animation: scaleIn 1.2s ease;
  }
  .gmail-header {
    background: #202124;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #333;
  }
  .gmail-dot { width: 12px; height: 12px; border-radius: 50%; }
  .gmail-label {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #9aa0a6;
    margin-left: auto;
  }
  .gmail-body {
    background: #1a1a2e;
    padding: 24px 28px;
  }
  .gmail-from { font-family: Arial; font-size: 13px; color: #fff; margin-bottom: 4px; }
  .gmail-subject { font-family: Arial; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 16px; }
  .gmail-message { font-family: Arial; font-size: 13px; color: #ccc; line-height: 1.6; margin-bottom: 24px; }
  .gmail-sig-zone {
    border-top: 1px solid #333;
    padding-top: 20px;
  }
  .cycle-counter {
    font-family: monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    text-align: right;
    margin-top: 8px;
    letter-spacing: 2px;
  }
  /* ── SECTION VARIATIONS ── */
  .section {
    max-width: 900px;
    margin: 0 auto;
    padding: 60px 20px;
  }
  .section-title {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
    text-align: center;
  }
  .section-headline {
    font-size: 28px;
    text-align: center;
    margin-bottom: 40px;
    font-weight: 400;
  }
  .variations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .variation-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: border-color 0.3s ease, transform 0.3s ease;
  }
  .variation-card:hover {
    border-color: ${accent}55;
    transform: translateY(-4px);
  }
  .variation-label {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    font-family: 'Georgia', serif;
  }
  .variation-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .variation-subtitle { font-size: 11px; color: rgba(232,232,255,0.4); margin-bottom: 8px; }
  .variation-intention { font-size: 11px; color: rgba(232,232,255,0.6); line-height: 1.5; margin-bottom: 8px; }
  .variation-emotion { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
  /* ── BOUTONS INSTALLATION ── */
  .install-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 32px;
  }
  .install-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    text-decoration: none;
    color: var(--text);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .install-card:hover {
    border-color: ${accent}66;
    background: ${accent}11;
    transform: translateY(-4px);
  }
  .install-icon { font-size: 32px; }
  .install-name { font-size: 14px; font-weight: 600; }
  .install-btn {
    display: inline-block;
    background: ${accent}22;
    border: 1px solid ${accent}55;
    color: var(--accent);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 12px;
    margin-top: 4px;
    transition: all 0.2s ease;
    text-decoration: none;
  }
  .install-card:hover .install-btn {
    background: ${accent}44;
  }
  /* ── TÉLÉCHARGEMENT ── */
  .download-zone {
    text-align: center;
    padding: 60px 20px;
    background: linear-gradient(135deg, ${accent}08, transparent);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin: 0;
  }
  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, ${accent}, ${accent}bb);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 18px 40px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 8px 30px ${accent}44;
  }
  .download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px ${accent}66;
  }
  /* ── FOOTER ── */
  .footer {
    text-align: center;
    padding: 40px 20px;
    font-size: 13px;
    color: rgba(232,232,255,0.3);
  }
  .footer a { color: var(--accent); text-decoration: none; }
  /* ── ANIMATIONS ── */
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @media (max-width: 600px) {
    .hero { padding: 40px 16px 40px; }
    .install-grid { grid-template-columns: 1fr; }
    .variations-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
</head>
<body>

<!-- ── HERO ── -->
<section class="hero">
  <div class="badge">EffectForge AI — God Tier Signature</div>
  <h1>${pageContent.headline}</h1>
  <p>${pageContent.description}</p>

  <!-- Mock Gmail -->
  <div class="gmail-mock">
    <div class="gmail-header">
      <div class="gmail-dot" style="background:#ff5f57"></div>
      <div class="gmail-dot" style="background:#ffbd2e"></div>
      <div class="gmail-dot" style="background:#28ca41"></div>
      <div class="gmail-label">Gmail — Boîte de réception</div>
    </div>
    <div class="gmail-body">
      <div class="gmail-from">De : ${esc(nom)} &lt;contact@${esc((metadata.site || 'entreprise.com').replace(/https?:\/\//, '').replace(/\/$/, ''))}&gt;</div>
      <div class="gmail-subject">Objet : Présentation de notre collaboration</div>
      <div class="gmail-message">Bonjour,<br><br>Merci pour notre échange. Je reste disponible pour toute question.<br><br>Cordialement,</div>
      <div class="gmail-sig-zone">
        ${svgContent}
      </div>
      <div class="cycle-counter" id="cycle-counter">CYCLE A · 00:00</div>
    </div>
  </div>
</section>

<!-- ── VARIATIONS ── -->
<section class="section">
  <div class="section-title">Les 4 variations vivantes</div>
  <div class="section-headline">${pageContent.section_effets}</div>
  <div class="variations-grid">
    ${variationsHtml}
  </div>
</section>

<!-- ── INSTALLATION ── -->
<section class="section" style="padding-top: 0;">
  <div class="section-title">Installation</div>
  <div class="section-headline">Choisissez votre client email</div>
  <div class="install-grid">
    <div class="install-card">
      <div class="install-icon">📧</div>
      <div class="install-name">Gmail</div>
      <a href="${gmailFileUrl}" class="install-btn" download data-testid="btn-install-gmail">${pageContent.texte_bouton_gmail}</a>
      <a href="${gmailPdfUrl}" class="install-btn" style="background:transparent;border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);" download>Guide PDF</a>
    </div>
    <div class="install-card">
      <div class="install-icon">🖥️</div>
      <div class="install-name">Outlook</div>
      <a href="${outlookFileUrl}" class="install-btn" download data-testid="btn-install-outlook">${pageContent.texte_bouton_outlook}</a>
      <a href="${outlookPdfUrl}" class="install-btn" style="background:transparent;border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);" download>Guide PDF</a>
    </div>
    <div class="install-card">
      <div class="install-icon">🍎</div>
      <div class="install-name">Apple Mail</div>
      <a href="${appleFileUrl}" class="install-btn" download data-testid="btn-install-apple">${pageContent.texte_bouton_apple}</a>
      <a href="${applePdfUrl}" class="install-btn" style="background:transparent;border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);" download>Guide PDF</a>
    </div>
  </div>
</section>

<!-- ── TÉLÉCHARGEMENT ── -->
<div class="download-zone">
  <a href="${downloadUrl}" class="download-btn" data-testid="btn-download-package">
    <span>⬇</span> ${pageContent.texte_bouton_download}
  </a>
  <p style="margin-top:16px;font-size:13px;color:rgba(232,232,255,0.4);">
    Package ZIP complet · SVG · PNG · Outlook · Gmail · 3 guides PDF
  </p>
</div>

<!-- ── FOOTER ── -->
<footer class="footer">
  <p>${pageContent.footer}</p>
  <p style="margin-top:8px;font-size:11px;opacity:0.4;">ID: ${signatureId}</p>
</footer>

<script>
  // Cycle counter
  (function() {
    const variants = ['A', 'B', 'C', 'D'];
    const cycleTotal = ${metadata.cycle_total || 240};
    const varDur = cycleTotal / 4;
    let elapsed = 0;
    const el = document.getElementById('cycle-counter');
    if (!el) return;
    setInterval(() => {
      elapsed = (elapsed + 1) % cycleTotal;
      const varIdx = Math.floor(elapsed / varDur);
      const varElapsed = elapsed % varDur;
      const m = Math.floor(varElapsed / 60).toString().padStart(2, '0');
      const s = (varElapsed % 60).toString().padStart(2, '0');
      el.textContent = 'CYCLE ' + variants[varIdx] + ' · ' + m + ':' + s;
    }, 1000);
  })();
</script>
</body>
</html>`;

  const previewDir = path.join(outputDir, 'preview');
  await fs.mkdir(previewDir, { recursive: true });
  const previewPath = path.join(previewDir, `${signatureId}.html`);
  await fs.writeFile(previewPath, html, 'utf-8');

  log(`Page preview générée: ${signatureId}.html`, 'preview-page-generator');
  return previewPath;
}
