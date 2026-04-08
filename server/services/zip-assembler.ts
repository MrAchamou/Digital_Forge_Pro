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

// ── Email pitch de conversion client ─────────────────────────────────────────
function buildEmailPitchHtml(params: {
  svgContent: string;
  nom: string;
  titre: string;
  entreprise: string;
  email: string;
  telephone: string;
  site: string;
  secteur: string;
  description: string;
  note: number;
  avis: number;
  slogan: string;
  signatureId: string;
  palette: string[];
}): string {
  const { svgContent, nom, titre, entreprise, email, telephone, site,
          secteur, description, note, avis, slogan, signatureId, palette } = params;
  const [bg, accent, textLight] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const domaine = site ? site.replace(/https?:\/\//, '').replace(/\/$/, '') : `${entreprise.toLowerCase().replace(/\s+/g, '')}.com`;
  const emailFrom = email || `contact@${domaine}`;

  const stars = note > 0
    ? '★'.repeat(Math.round(note)) + '☆'.repeat(5 - Math.round(note))
    : '';
  const ratingLine = note > 0 ? `${stars} ${note.toFixed(1)}/5${avis > 0 ? ` · ${avis} avis Google` : ''}` : '';

  const sectorHooks: Record<string, { intro: string; value: string; cta: string }> = {
    'Santé & Bien-être':    { intro: `Je vous contacte car votre réputation dans le domaine de la santé et du bien-être m'a particulièrement impressionné.`, value: `Une signature email animée et professionnelle renforce immédiatement la confiance de vos patients et partenaires dès le premier contact.`, cta: `Accordons-nous 15 minutes pour vous montrer ce que cette signature peut faire pour votre cabinet.` },
    'Juridique & Finance':  { intro: `Votre positionnement dans le secteur juridique et financier reflète un niveau d'exigence que nous partageons.`, value: `Dans un milieu où la crédibilité se construit à chaque interaction, une signature email animée et sur-mesure est un signal fort de professionnalisme.`, cta: `Je serais ravi de vous présenter comment nos clients du secteur ont transformé leur image de marque.` },
    'Technologie & SaaS':   { intro: `En tant qu'acteur tech, vous savez mieux que quiconque que chaque détail de l'expérience utilisateur compte.`, value: `Une signature email animée illustre instantanément votre maîtrise de l'innovation — même dans une simple boîte de réception.`, cta: `Découvrez en 15 min comment nos clients SaaS ont boosté leur taux de réponse email.` },
    'Immobilier':           { intro: `Dans l'immobilier, la première impression est souvent décisive — et ça commence bien avant la visite.`, value: `Votre signature email est le premier aperçu de votre marque personnelle. Une signature animée vous distingue immédiatement de la concurrence.`, cta: `Je vous propose un échange rapide pour vous montrer des exemples concrets dans votre secteur.` },
    'Restauration & Food':  { intro: `Votre établissement dégage une identité forte que vos communications digitales méritent de refléter.`, value: `Une signature email animée aux couleurs de votre restaurant crée une expérience de marque cohérente, du menu à l'inbox.`, cta: `Prenons 15 minutes pour explorer ensemble ce que nous pourrions créer pour vous.` },
    'Beauté & Mode':        { intro: `Dans votre secteur, l'esthétique est tout — y compris dans vos emails professionnels.`, value: `Nos signatures animées sont conçues comme de véritables œuvres visuelles, taillées pour des marques qui ne transigent pas sur le style.`, cta: `Je serais ravi de vous montrer quelques créations adaptées à votre univers.` },
    'Éducation & Formation':{ intro: `Votre engagement pour la transmission et la qualité pédagogique mérite d'être mis en avant à chaque email envoyé.`, value: `Une signature professionnelle animée inspire confiance aux apprenants, parents et partenaires institutionnels dès le premier contact.`, cta: `Échangeons 15 minutes pour voir comment nous pouvons valoriser votre image.` },
    'Architecture & Design':{ intro: `En tant que professionnel du design, vous comprenez mieux que quiconque l'impact d'un détail bien exécuté.`, value: `Nos signatures email animées sont conçues avec la même rigueur créative que vos projets — elles reflètent votre ADN visuel avec précision.`, cta: `Je vous propose de vous montrer une démo sur-mesure en 15 minutes.` },
  };

  const fallbackHook = {
    intro: `Votre entreprise ${entreprise} m'a immédiatement interpellé par son positionnement et la qualité de ce qu'elle propose.`,
    value: 'Dans un monde où chaque email est une opportunité de marque, une signature animée et personnalisée vous distingue et marque les esprits durablement.',
    cta: 'Je vous propose un échange de 15 minutes pour vous présenter ce que nous avons conçu spécialement pour vous.',
  };

  const hook = sectorHooks[secteur] || fallbackHook;
  const descriptionLine = description && description !== `${entreprise} — importé depuis Google My Business`
    ? `<p style="margin:0 0 16px;color:#94a3b8;font-size:13px;font-style:italic;">"${escHtml(description.substring(0, 200))}${description.length > 200 ? '…' : ''}"</p>`
    : '';
  const sloganLine = slogan && slogan !== description?.split('.')[0]
    ? `<p style="margin:0 0 24px;color:${accent};font-size:14px;font-weight:600;">${escHtml(slogan)}</p>`
    : '';
  const ratingBlock = ratingLine
    ? `<div style="margin:0 0 24px;padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid ${accent};display:inline-block;">
        <span style="color:${accent};font-size:13px;letter-spacing:0.5px;">${ratingLine}</span>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email Pitch — ${escHtml(entreprise)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d1117;
    font-family: 'Segoe UI', Arial, sans-serif;
    padding: 40px 20px 80px;
    color: #e8e8ff;
  }
  .outer-wrap {
    max-width: 700px;
    margin: 0 auto;
  }
  .label-top {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${accent};
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .label-top::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${accent};
    box-shadow: 0 0 8px ${accent};
    animation: pulse 2s infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  /* ── Email shell ── */
  .email-shell {
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .email-titlebar {
    background: #1c1c1e;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 7px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
  .titlebar-text {
    margin-left: auto;
    font-size: 11px;
    color: #555;
    font-family: monospace;
    letter-spacing: 1px;
  }
  /* ── Email header ── */
  .email-header {
    background: #161b22;
    padding: 24px 32px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .meta-row {
    font-size: 12px;
    color: #6e7681;
    margin-bottom: 6px;
    display: flex;
    gap: 8px;
  }
  .meta-label { color: #484f58; min-width: 50px; }
  .meta-value { color: #adbac7; }
  .meta-value a { color: ${accent}; text-decoration: none; }
  .email-subject {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin-top: 14px;
    line-height: 1.3;
  }
  /* ── Email body ── */
  .email-body {
    background: #0d1117;
    padding: 32px 32px 28px;
  }
  .greeting {
    font-size: 15px;
    color: #e6edf3;
    margin-bottom: 20px;
    line-height: 1.7;
  }
  .paragraph {
    font-size: 14px;
    color: #8b949e;
    line-height: 1.8;
    margin-bottom: 20px;
  }
  .highlight-box {
    background: linear-gradient(135deg, ${accent}12, ${accent}06);
    border: 1px solid ${accent}33;
    border-radius: 10px;
    padding: 20px 24px;
    margin: 24px 0;
  }
  .highlight-box p {
    font-size: 14px;
    color: #adbac7;
    line-height: 1.7;
    margin: 0;
  }
  .highlight-box strong { color: ${accent}; }
  .cta-block {
    margin: 28px 0 24px;
    padding: 20px 24px;
    background: ${accent}15;
    border-radius: 10px;
    border: 1px solid ${accent}44;
    text-align: center;
  }
  .cta-block p {
    font-size: 14px;
    color: #e6edf3;
    margin-bottom: 16px;
    line-height: 1.6;
  }
  .cta-btn {
    display: inline-block;
    background: ${accent};
    color: #fff;
    padding: 11px 28px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: 0.3px;
  }
  .closing {
    font-size: 14px;
    color: #8b949e;
    line-height: 1.7;
    margin-bottom: 28px;
  }
  /* ── Separator ── */
  .sig-separator {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin: 24px 0;
  }
  /* ── Signature zone ── */
  .sig-label {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    margin-bottom: 16px;
  }
  .sig-zone svg, .sig-zone img {
    display: block;
    max-width: 100%;
    height: auto;
  }
  /* ── Footer meta ── */
  .email-footer {
    background: #161b22;
    padding: 16px 32px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 11px;
    color: #484f58;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  /* ── Usage note ── */
  .usage-note {
    margin-top: 32px;
    padding: 16px 20px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    font-size: 12px;
    color: rgba(255,255,255,0.25);
    line-height: 1.6;
  }
  .usage-note strong { color: rgba(255,255,255,0.4); }
</style>
</head>
<body>
<div class="outer-wrap">

  <div class="label-top">Email de pitch client · EffectForge AI · ${escHtml(entreprise)}</div>

  <!-- ── Shell email ── -->
  <div class="email-shell">

    <!-- Titlebar style macOS -->
    <div class="email-titlebar">
      <div class="dot" style="background:#ff5f57;"></div>
      <div class="dot" style="background:#ffbd2e;"></div>
      <div class="dot" style="background:#28ca41;"></div>
      <div class="titlebar-text">Nouveau message — ${escHtml(emailFrom)}</div>
    </div>

    <!-- Header email -->
    <div class="email-header">
      <div class="meta-row"><span class="meta-label">De :</span><span class="meta-value">${escHtml(nom)}${titre ? ` — ${escHtml(titre)}` : ''} &lt;<a href="mailto:${escHtml(emailFrom)}">${escHtml(emailFrom)}</a>&gt;</span></div>
      <div class="meta-row"><span class="meta-label">À :</span><span class="meta-value">Prénom Nom &lt;prospect@exemple.com&gt;</span></div>
      <div class="meta-row"><span class="meta-label">Date :</span><span class="meta-value">${dateStr}</span></div>
      <div class="meta-row"><span class="meta-label">Objet :</span><span class="meta-value" style="color:#e6edf3;font-weight:600;">Une idée pour renforcer votre image de marque dès demain</span></div>
      <div class="email-subject">Une idée pour renforcer votre image de marque dès demain</div>
    </div>

    <!-- Corps de l'email -->
    <div class="email-body">

      <p class="greeting">Bonjour,</p>

      ${descriptionLine}
      ${sloganLine}
      ${ratingBlock}

      <p class="paragraph">${escHtml(hook.intro)}</p>

      <div class="highlight-box">
        <p>${escHtml(hook.value)} <strong>C'est exactement ce que nous avons créé pour ${escHtml(entreprise)}.</strong></p>
      </div>

      <p class="paragraph">
        Grâce à notre pipeline IA triple-moteur (GPT-4o · Claude Opus · Gemini), nous avons analysé l'identité de marque de <strong style="color:#e6edf3;">${escHtml(entreprise)}</strong> et généré une signature email animée entièrement sur-mesure — palette de couleurs, effets visuels, typographie et contenu dynamique inclus.
      </p>

      <p class="paragraph">
        Cette signature s'installe en quelques minutes dans Gmail, Outlook ou Apple Mail, et laisse une impression mémorable à chaque email envoyé.
      </p>

      <div class="cta-block">
        <p><strong style="color:#e6edf3;">${escHtml(hook.cta)}</strong></p>
        ${email ? `<a href="mailto:${escHtml(email)}?subject=Signature%20Email%20%E2%80%94%20${encodeURIComponent(entreprise)}&body=Bonjour%2C%0A%0AJe%20souhaite%20en%20savoir%20plus%20sur%20votre%20signature%20email%20anim%C3%A9e." class="cta-btn">Répondre à cet email</a>` : ''}
        ${site ? `&nbsp;&nbsp;<a href="${escHtml(site)}" target="_blank" class="cta-btn" style="background:transparent;border:1px solid ${accent};color:${accent};">Voir le site</a>` : ''}
      </div>

      <p class="closing">
        Dans l'attente de votre retour,<br>
        Bien cordialement,
      </p>

      <!-- ── Séparateur signature ── -->
      <hr class="sig-separator">
      <div class="sig-label">Signature professionnelle animée — EffectForge AI</div>

      <!-- ── La signature SVG animée ── -->
      <div class="sig-zone">
        ${svgContent}
      </div>

    </div>

    <!-- Footer email -->
    <div class="email-footer">
      <span>${escHtml(nom)} · ${escHtml(entreprise)}</span>
      ${telephone ? `<span>${escHtml(telephone)}</span>` : ''}
      ${email ? `<span>${escHtml(email)}</span>` : ''}
      ${site ? `<span>${escHtml(domaine)}</span>` : ''}
    </div>

  </div><!-- /email-shell -->

  <!-- ── Note d'utilisation ── -->
  <div class="usage-note">
    <strong>Comment utiliser ce fichier :</strong> Cet email est un modèle de pitch prêt à l'emploi. Personnalisez le destinataire (champ "À :") et adaptez le contenu selon vos besoins. La signature animée ci-dessous est votre signature EffectForge AI générée le ${dateStr}. ID : ${escHtml(signatureId)}.
  </div>

</div>
</body>
</html>`;
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
    description?: string;
    note?: number;
    avis?: number;
    slogan?: string;
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
  const description = metadata.description || '';
  const note = metadata.note || 0;
  const avis = metadata.avis || 0;
  const slogan = metadata.slogan || '';

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

  // ── Email pitch de prospection client ──────────────────────────────────
  const emailPitchHtml = buildEmailPitchHtml({
    svgContent, nom, titre, entreprise, email, telephone, site, secteur,
    description, note, avis, slogan, signatureId, palette,
  });

  // ── Manifest ──────────────────────────────────────────────────────────
  const fileEntries = [
    { name: 'PREVIEW — Ouvrez ce fichier.html',      size: Buffer.byteLength(localPreviewHtml, 'utf-8'),  type: 'text/html',         description: 'Page de prévisualisation locale (ouvrir dans navigateur)' },
    { name: 'EMAIL-PITCH — Prospection client.html', size: Buffer.byteLength(emailPitchHtml, 'utf-8'),   type: 'text/html',         description: 'Email de pitch personnalisé pour convertir un nouveau client' },
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
    archive.append(emailPitchHtml,   { name: 'EMAIL-PITCH — Prospection client.html' });
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
