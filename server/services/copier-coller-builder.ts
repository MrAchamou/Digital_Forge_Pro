export interface CopierCollerConfig {
  nomClient:     string;
  gifUrl:        string;
  palette:       string[];
  signatureId:   string;
  signatureHtml?: string;
}

function escHtml(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildCopierCollerHtml(cfg: CopierCollerConfig): string {
  const { nomClient, gifUrl, palette, signatureId, signatureHtml } = cfg;
  const accent = palette?.[0] || '#6366f1';

  const gmailCode = `<img src="${gifUrl}" width="600" alt="Signature ${nomClient}" style="display:block;border:0;max-width:100%;">`;
  const outlookCode = `<!--[if mso]><v:image xmlns:v="urn:schemas-microsoft-com:vml" style="width:600px;height:220px;" src="${gifUrl}"/><![endif]--><!--[if !mso]><!--><img src="${gifUrl}" width="600" alt="Signature ${nomClient}" style="display:block;border:0;"><!--<![endif]-->`;
  const htmlCode = `<img src="${gifUrl}" width="600" alt="Signature ${nomClient}" style="display:block;border:0;max-width:100%;" />`;

  const previewBlock = signatureHtml
    ? `<div class="sig-preview sig-preview--css">
        <div class="sig-live">${signatureHtml}</div>
        <div class="preview-badge">✨ Aperçu animé CSS — rendu identique à la version finale</div>
      </div>`
    : `<div class="sig-preview">
        <img src="${escHtml(gifUrl)}" alt="Signature ${escHtml(nomClient)}" onerror="this.style.background='#1a1a2e';this.style.height='120px'">
      </div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Copier-Coller — ${escHtml(nomClient)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0f0f1a;color:#e8e8ff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px}
  .card{background:#13131f;border:1px solid ${accent}33;border-radius:20px;padding:40px;max-width:680px;width:100%;box-shadow:0 0 60px ${accent}18}
  h1{font-size:22px;font-weight:700;margin-bottom:4px}
  .sub{font-size:13px;color:#ffffff66;margin-bottom:32px}
  .sig-preview{margin-bottom:28px;border-radius:12px;overflow:hidden;border:1px solid ${accent}22;background:#fff}
  .sig-preview--css{background:#fff;padding:20px;position:relative}
  .sig-live{display:flex;align-items:flex-start;justify-content:flex-start;overflow:hidden}
  .sig-live > *{max-width:100%;flex-shrink:0}
  .preview-badge{margin-top:10px;font-size:11px;color:${accent};opacity:.8;text-align:center}
  .sig-preview img{width:100%;display:block}
  .section{margin-bottom:20px}
  .label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${accent};margin-bottom:8px;display:flex;align-items:center;gap:6px}
  .note{font-size:11px;color:#ffffff44;margin-bottom:6px;line-height:1.5}
  .code-box{background:#0a0a14;border:1px solid #ffffff14;border-radius:12px;padding:14px 16px;font-family:monospace;font-size:11.5px;line-height:1.7;color:#a0a8c8;word-break:break-all;white-space:pre-wrap;max-height:80px;overflow:hidden;cursor:text;user-select:all}
  .btn{display:block;width:100%;padding:14px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;border:none;margin-top:8px;transition:all .15s;letter-spacing:.02em}
  .btn:active{transform:scale(.98)}
  .btn-primary{background:${accent};color:#fff}
  .btn-primary:hover{opacity:.9}
  .btn-outline{background:transparent;border:1px solid ${accent}55;color:${accent}}
  .btn-outline:hover{background:${accent}12}
  .ok{color:#22c55e;font-size:12px;text-align:center;margin-top:6px;opacity:0;transition:opacity .3s}
  .ok.show{opacity:1}
  .url-section{margin-top:24px;padding-top:24px;border-top:1px solid #ffffff0a;text-align:center}
  .url-text{font-size:11px;color:#ffffff44;margin-bottom:6px}
  .url-val{font-family:monospace;font-size:11px;color:${accent};word-break:break-all}
  .footer{margin-top:24px;text-align:center;font-size:11px;color:#ffffff22}
  .compat-note{display:flex;align-items:flex-start;gap:8px;background:#1a1a2e;border:1px solid ${accent}22;border-radius:10px;padding:12px;margin-bottom:16px;font-size:12px;color:#ffffff88;line-height:1.5}
  .compat-icon{font-size:16px;flex-shrink:0}
</style>
</head>
<body>
<div class="card">
  <h1>📋 Votre signature prête à coller</h1>
  <p class="sub">3 boutons — Gmail · Outlook · HTML universel</p>

  ${previewBlock}

  <div class="compat-note">
    <span class="compat-icon">ℹ️</span>
    <span>L'aperçu ci-dessus montre la signature avec toutes ses animations CSS. Dans un client email, la compatibilité varie : Gmail web affiche le GIF animé, Outlook utilise le code de compatibilité.</span>
  </div>

  <div class="section">
    <div class="label">📧 Gmail</div>
    <div class="code-box" id="code-gmail">${escHtml(gmailCode)}</div>
    <button class="btn btn-primary" onclick="copyCode('gmail')">Copier pour Gmail</button>
    <div class="ok" id="ok-gmail">✓ Copié dans le presse-papier !</div>
  </div>

  <div class="section">
    <div class="label">📮 Outlook</div>
    <div class="code-box" id="code-outlook">${escHtml(outlookCode)}</div>
    <button class="btn btn-outline" onclick="copyCode('outlook')">Copier pour Outlook</button>
    <div class="ok" id="ok-outlook">✓ Copié dans le presse-papier !</div>
  </div>

  <div class="section">
    <div class="label">🌐 HTML universel</div>
    <div class="code-box" id="code-html">${escHtml(htmlCode)}</div>
    <button class="btn btn-outline" onclick="copyCode('html')">Copier code HTML universel</button>
    <div class="ok" id="ok-html">✓ Copié dans le presse-papier !</div>
  </div>

  <div class="url-section">
    <div class="url-text">Votre URL permanente (ne change jamais)</div>
    <div class="url-val">${escHtml(gifUrl)}</div>
  </div>

  <div class="footer">Signature EffectForge AI · ID: ${escHtml(signatureId.slice(0, 8))}</div>
</div>

<script>
const codes = {
  gmail:   ${JSON.stringify(gmailCode)},
  outlook: ${JSON.stringify(outlookCode)},
  html:    ${JSON.stringify(htmlCode)},
};
function copyCode(type) {
  navigator.clipboard.writeText(codes[type]).then(() => {
    const el = document.getElementById('ok-' + type);
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }).catch(() => {
    const box = document.getElementById('code-' + type);
    const range = document.createRange();
    range.selectNode(box);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
  });
}
</script>
</body>
</html>`;
}
