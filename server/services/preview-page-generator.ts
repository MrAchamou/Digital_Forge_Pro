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

// ── Génère un email réaliste et personnalisé selon les métadonnées du client ──
function buildEmailContent(metadata: any): { subject: string; to: string; toEmail: string; body: string } {
  const nom       = metadata.nom       || 'Votre Nom';
  const titre     = metadata.titre     || '';
  const entreprise = metadata.entreprise || 'Votre Entreprise';
  const cta       = metadata.cta       || '';
  const site      = (metadata.site || '').replace(/https?:\/\//, '').replace(/\/$/, '');
  const secteur   = (metadata.secteur  || '').toLowerCase();

  // Destinataire fictif contextuel selon secteur
  let toName = 'Marie Durand';
  let toEmail = 'marie.durand@outlook.com';
  let subject = `Présentation — ${entreprise}`;
  let bodyLines: string[] = [];

  if (secteur.includes('santé') || secteur.includes('medical') || secteur.includes('dentist') || secteur.includes('médecin')) {
    toName   = 'Dr. Sophie Lambert';
    toEmail  = 'sophie.lambert@clinique-centre.fr';
    subject  = `Suite à votre consultation — ${entreprise}`;
    bodyLines = [
      `Chère Dr. Lambert,`,
      ``,
      `Merci pour notre échange lors du dernier congrès. Comme convenu, je vous fais parvenir les informations concernant notre approche et nos disponibilités.`,
      ``,
      `N'hésitez pas à me contacter pour organiser une rencontre à votre convenance.`,
      titre ? `Je reste à votre disposition en tant que ${titre}.` : `Je reste à votre entière disposition.`,
    ];
  } else if (secteur.includes('tech') || secteur.includes('digital') || secteur.includes('logiciel') || secteur.includes('software')) {
    toName   = 'Thomas Renard';
    toEmail  = 'thomas.renard@nextech-group.io';
    subject  = `Proposition de collaboration — ${entreprise}`;
    bodyLines = [
      `Bonjour Thomas,`,
      ``,
      `Suite à notre appel de la semaine dernière, je vous transmets notre proposition détaillée pour l'intégration de notre solution au sein de votre stack technique.`,
      ``,
      `Notre équipe est disponible pour une démo live dès la semaine prochaine.`,
      cta ? `${cta}` : `Dans l'attente de votre retour,`,
    ];
  } else if (secteur.includes('artisan') || secteur.includes('menuisier') || secteur.includes('plombier') || secteur.includes('maçon') || secteur.includes('bâtiment')) {
    toName   = 'Jean-Luc Perrin';
    toEmail  = 'jlperrin@chantiers-perrin.fr';
    subject  = `Devis pour vos travaux — ${entreprise}`;
    bodyLines = [
      `Bonjour M. Perrin,`,
      ``,
      `Comme discuté lors de notre visite de chantier, je vous adresse le devis détaillé correspondant à vos besoins. Tous les matériaux et délais d'intervention y figurent.`,
      ``,
      `Je reste disponible pour en discuter et affiner le projet ensemble.`,
      titre ? `Cordialement, ${titre} chez ${entreprise}` : `Cordialement depuis ${entreprise}`,
    ];
  } else if (secteur.includes('immobil') || secteur.includes('agence') || secteur.includes('notaire')) {
    toName   = 'Claire Fontaine';
    toEmail  = 'claire.fontaine@particulier.net';
    subject  = `Votre projet immobilier — ${entreprise}`;
    bodyLines = [
      `Bonjour Claire,`,
      ``,
      `J'ai le plaisir de vous présenter deux biens correspondant parfaitement à vos critères. Les visites peuvent être organisées dès cette semaine selon vos disponibilités.`,
      ``,
      `Vous trouverez en pièce jointe les fiches techniques de chaque propriété.`,
      `Je vous appelle demain matin pour confirmer.`,
    ];
  } else if (secteur.includes('restaur') || secteur.includes('traiteur') || secteur.includes('chef') || secteur.includes('boulang') || secteur.includes('pâtiss')) {
    toName   = 'Isabelle Moreau';
    toEmail  = 'i.moreau@evenements-pro.fr';
    subject  = `Prestation traiteur — ${entreprise}`;
    bodyLines = [
      `Chère Isabelle,`,
      ``,
      `Merci pour votre confiance. Je vous confirme notre disponibilité pour votre événement du 15 juin et vous transmets notre menu de saison avec les options personnalisées discutées.`,
      ``,
      `Nos produits sont sourcés localement et nous garantissons une présentation soignée.`,
      cta ? cta : `Restant à votre écoute,`,
    ];
  } else if (secteur.includes('coach') || secteur.includes('format') || secteur.includes('conseil') || secteur.includes('consultant')) {
    toName   = 'Alexandre Petit';
    toEmail  = 'alex.petit@groupe-impact.com';
    subject  = `Programme sur mesure — ${entreprise}`;
    bodyLines = [
      `Bonjour Alexandre,`,
      ``,
      `Suite à notre diagnostic initial, je vous adresse le programme d'accompagnement sur mesure ainsi que le plan d'action sur 90 jours.`,
      ``,
      `L'objectif est clair : vous donner les outils pour atteindre vos résultats durablement.`,
      titre ? `En tant que ${titre}, je m'engage personnellement sur chaque étape.` : `Je m'engage personnellement sur chaque étape.`,
    ];
  } else {
    toName   = 'Marie Durand';
    toEmail  = 'marie.durand@partenaires.fr';
    subject  = `Suite à notre échange — ${entreprise}`;
    bodyLines = [
      `Bonjour Marie,`,
      ``,
      `Merci pour notre échange et l'intérêt que vous portez à notre activité. Comme promis, je vous fais parvenir tous les éléments nécessaires pour avancer ensemble.`,
      ``,
      cta ? cta : `N'hésitez pas à me contacter à tout moment.`,
      `Au plaisir d'une prochaine collaboration,`,
    ];
  }

  return {
    subject,
    to: toName,
    toEmail,
    body: bodyLines.join('\n'),
  };
}

// ── Avatar initiale (cercle coloré avec initiales) pour les fausses emails de la liste ──
function fakeEmailRow(opts: { from: string; subject: string; preview: string; time: string; unread?: boolean; avatarColor?: string; initials?: string; accent: string }) {
  const { from, subject, preview, time, unread = false, avatarColor = '#555', initials = '?', accent } = opts;
  return `
    <div class="email-row ${unread ? 'email-row--unread' : ''}" style="${unread ? `border-left:2px solid ${accent};` : 'border-left:2px solid transparent;'}">
      <div class="email-avatar" style="background:${avatarColor};">${esc(initials)}</div>
      <div class="email-row-body">
        <div class="email-row-top">
          <span class="email-row-from ${unread ? 'email-row-from--bold' : ''}">${esc(from)}</span>
          <span class="email-row-time">${esc(time)}</span>
        </div>
        <div class="email-row-subject ${unread ? 'email-row-from--bold' : ''}">${esc(subject)}</div>
        <div class="email-row-preview">${esc(preview)}</div>
      </div>
    </div>`;
}

export async function generatePreviewPage(params: {
  signatureId: string;
  svgContent: string;
  metadata: any;
  scenario: NarrativeScenario;
  pageContent: PreviewPageContent;
  baseUrl: string;
  outputDir: string;
  gmailHtml?: string;
  outlookHtml?: string;
  whiteLabel?: boolean;
}): Promise<string> {
  const {
    signatureId, svgContent, metadata, scenario,
    pageContent, baseUrl, outputDir,
    gmailHtml = '', outlookHtml = '',
    whiteLabel = Boolean(metadata?.white_label),
  } = params;
  const { nom = 'Client', entreprise = 'Entreprise', palette = [] } = metadata;
  const [bg, accent, accentAlt = '#e8e8ff'] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const brandLabel = whiteLabel ? entreprise : 'EffectForge AI';

  const siteRaw   = (metadata.site || '').replace(/https?:\/\//, '').replace(/\/$/, '') || `${entreprise.toLowerCase().replace(/\s+/g, '')}.fr`;
  const emailAddr = metadata.email || `contact@${siteRaw}`;
  const titre     = metadata.titre || '';

  const emailContent = buildEmailContent(metadata);

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

  const previewUrl    = `${baseUrl}/api/signature/preview/${signatureId}`;
  const downloadUrl   = `${baseUrl}/api/signature/download/${signatureId}`;
  const gmailFileUrl  = `${baseUrl}/api/signature/export-file/${signatureId}/gmail`;
  const outlookFileUrl= `${baseUrl}/api/signature/export-file/${signatureId}/outlook`;
  const appleFileUrl  = `${baseUrl}/api/signature/export-file/${signatureId}/svg`;
  const gmailPdfUrl   = `${baseUrl}/api/signature/export-file/${signatureId}/pdf-gmail`;
  const outlookPdfUrl = `${baseUrl}/api/signature/export-file/${signatureId}/pdf-outlook`;
  const applePdfUrl   = `${baseUrl}/api/signature/export-file/${signatureId}/pdf-apple`;
  const pngUrl        = `${baseUrl}/api/signature/export-file/${signatureId}/png`;

  const gmailCodeB64   = Buffer.from(gmailHtml || '',   'utf-8').toString('base64');
  const outlookCodeB64 = Buffer.from(outlookHtml || '', 'utf-8').toString('base64');
  const svgCodeB64     = Buffer.from(svgContent || '',  'utf-8').toString('base64');

  const ogTitle       = `Signature ${esc(nom)} — ${esc(entreprise)}`;
  const ogDescription = `${esc(pageContent.description || `Signature email animée générée par ${brandLabel}`)}`;

  // Corps de l'email avec sauts de ligne → <br>
  const bodyHtml = emailContent.body.split('\n').map(l => l === '' ? '<br>' : `${esc(l)}<br>`).join('');

  // Fausses emails dans la liste (sidebar)
  const fakeRows = [
    fakeEmailRow({ from: emailContent.to, subject: emailContent.subject, preview: emailContent.body.split('\n').filter(l => l.trim()).slice(1, 2).join(' '), time: 'Maintenant', unread: true, avatarColor: accent, initials: emailContent.to.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase(), accent }),
    fakeEmailRow({ from: 'Noreply Calendly', subject: 'Rappel : RDV confirmé demain à 14h', preview: 'Votre rendez-vous avec Jean est confirmé.', time: '10h22', unread: false, avatarColor: '#2563eb', initials: 'CA', accent }),
    fakeEmailRow({ from: 'Stripe Payments', subject: 'Paiement reçu — Facture #2047', preview: 'Votre paiement de 1 200,00 € a été traité avec succès.', time: '09h14', unread: false, avatarColor: '#6772e5', initials: 'SP', accent }),
    fakeEmailRow({ from: 'LinkedIn', subject: `${nom} a 3 nouvelles connexions`, preview: 'Découvrez qui vous a récemment suivi sur LinkedIn.', time: 'Hier', unread: false, avatarColor: '#0a66c2', initials: 'LI', accent }),
    fakeEmailRow({ from: 'Notion', subject: 'Votre espace de travail — résumé hebdo', preview: '5 pages mises à jour cette semaine dans votre workspace.', time: 'Lun.', unread: false, avatarColor: '#1a1a1a', initials: 'NO', accent }),
    fakeEmailRow({ from: 'Google Analytics', subject: 'Rapport mensuel — Trafic site', preview: '+23 % de sessions par rapport au mois dernier.', time: '12 mai', unread: false, avatarColor: '#ea4335', initials: 'GA', accent }),
  ].join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(pageContent.titre_page)}</title>
<meta name="description" content="${ogDescription}">
<meta property="og:type"        content="website">
<meta property="og:title"       content="${ogTitle} | ${esc(brandLabel)}">
<meta property="og:description" content="${ogDescription}">
<meta property="og:image"       content="${pngUrl}">
<meta property="og:url"         content="${previewUrl}">
<meta property="og:site_name"   content="${esc(brandLabel)}">
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="${ogTitle} | ${esc(brandLabel)}">
<meta name="twitter:description" content="${ogDescription}">
<meta name="twitter:image"       content="${pngUrl}">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:${bg};
    --accent:${accent};
    --accent-alt:${accentAlt};
    --text:#e8e8ff;
    --card:rgba(255,255,255,0.04);
    --border:rgba(255,255,255,0.08);
    --glass:rgba(255,255,255,0.03);
  }
  body{
    background:var(--bg);
    color:var(--text);
    font-family:'Arial',sans-serif;
    min-height:100vh;
    overflow-x:hidden;
  }
  #starfield{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
  .star{position:absolute;border-radius:50%;background:${accent};opacity:0;animation:star-twinkle var(--dur,4s) ease-in-out var(--delay,0s) infinite;}
  @keyframes star-twinkle{0%,100%{opacity:0;transform:scale(0.5)}50%{opacity:var(--max-opacity,0.4);transform:scale(1)}}
  body>*:not(#starfield){position:relative;z-index:1;}

  /* ── HERO ── */
  .hero{text-align:center;padding:72px 20px 48px;position:relative;}
  .hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:900px;height:450px;
    background:radial-gradient(ellipse at center,${accent}1a 0%,transparent 65%);pointer-events:none;
    animation:hero-glow 8s ease-in-out infinite alternate;}
  @keyframes hero-glow{0%{opacity:0.6;transform:translateX(-50%) scale(1)}100%{opacity:1;transform:translateX(-50%) scale(1.15)}}

  .livrable-badge{
    display:inline-flex;align-items:center;gap:10px;
    font-size:10px;letter-spacing:4px;text-transform:uppercase;
    color:#fff;
    border-radius:24px;padding:8px 20px;margin-bottom:28px;
    animation:fadeInDown 0.6s ease;
    background:linear-gradient(135deg,${accent}cc,${accent}88);
    box-shadow:0 4px 20px ${accent}55;
    border:1px solid ${accent}99;
  }
  .livrable-badge::before{content:'';width:7px;height:7px;border-radius:50%;background:#fff;
    box-shadow:0 0 10px #fff;animation:pulse-dot 2s ease-in-out infinite;}
  @keyframes pulse-dot{0%,100%{opacity:1;box-shadow:0 0 6px #fff}50%{opacity:0.5;box-shadow:0 0 16px #fff}}

  .hero-company{font-size:11px;letter-spacing:5px;text-transform:uppercase;color:${accent};
    font-weight:400;margin-bottom:12px;animation:fadeInUp 0.6s ease;opacity:0.85;}
  .hero h1{font-size:clamp(28px,4.5vw,52px);font-weight:300;line-height:1.15;margin-bottom:16px;
    animation:fadeInUp 0.8s ease;
    background:linear-gradient(135deg,#ffffff 0%,${accent} 55%,#fff 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .hero-desc{font-size:15px;color:rgba(232,232,255,0.5);max-width:500px;margin:0 auto 36px;
    line-height:1.7;animation:fadeInUp 1s ease;}

  /* ── REPLAY BUTTON ── */
  .replay-btn{display:inline-flex;align-items:center;gap:8px;background:transparent;
    border:1px solid ${accent}55;color:${accent};border-radius:50px;padding:9px 22px;
    font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;
    transition:all 0.3s ease;margin-bottom:44px;animation:fadeInUp 1.2s ease;}
  .replay-btn:hover{background:${accent}22;border-color:${accent};box-shadow:0 0 20px ${accent}44;transform:translateY(-1px);}
  .replay-btn svg{width:13px;height:13px;fill:currentColor;transition:transform 0.4s ease;}
  .replay-btn:hover svg{transform:rotate(360deg);}

  /* ══════════════════════════════════════════════════
     EMAIL CLIENT WINDOW — macOS Chrome
  ══════════════════════════════════════════════════ */
  .email-client-wrapper{
    max-width:980px;
    margin:0 auto 16px;
    animation:slideUpReveal 1.0s cubic-bezier(0.4,0,0.2,1) 0.2s both;
    filter:drop-shadow(0 40px 80px rgba(0,0,0,0.7));
  }
  @keyframes slideUpReveal{from{opacity:0;transform:translateY(40px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}

  .email-client{
    border-radius:14px;
    overflow:hidden;
    border:1px solid rgba(255,255,255,0.12);
    background:#1c1c1e;
  }

  /* ── Window Chrome ── */
  .win-chrome{
    background:linear-gradient(180deg,#3a3a3c 0%,#2c2c2e 100%);
    padding:12px 16px;
    display:flex;
    align-items:center;
    gap:8px;
    border-bottom:1px solid rgba(0,0,0,0.4);
    position:relative;
  }
  .win-dot{width:12px;height:12px;border-radius:50%;cursor:pointer;transition:filter 0.2s;}
  .win-dot:hover{filter:brightness(1.2);}
  .win-chrome-title{
    position:absolute;left:50%;transform:translateX(-50%);
    font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);
    letter-spacing:0.3px;
    display:flex;align-items:center;gap:6px;
  }
  .win-chrome-title::before{content:'M';display:inline-flex;align-items:center;justify-content:center;
    width:16px;height:16px;background:#ea4335;border-radius:50%;font-size:9px;color:#fff;font-weight:700;}

  /* ── Toolbar ── */
  .win-toolbar{
    background:#252526;
    padding:8px 16px;
    display:flex;
    align-items:center;
    gap:8px;
    border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .win-compose-btn{
    background:linear-gradient(135deg,${accent},${accent}bb);
    color:#fff;border:none;border-radius:20px;
    padding:7px 16px;font-size:12px;font-weight:600;
    cursor:pointer;display:flex;align-items:center;gap:6px;
    box-shadow:0 2px 8px ${accent}55;
    white-space:nowrap;
  }
  .win-toolbar-search{
    flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);
    border-radius:20px;padding:5px 14px;font-size:12px;color:rgba(255,255,255,0.4);
    display:flex;align-items:center;gap:8px;
  }

  /* ── Layout: Sidebar + Content ── */
  .email-layout{
    display:flex;
    height:520px;
  }

  /* ── Sidebar nav ── */
  .email-nav{
    width:190px;
    min-width:190px;
    background:#1e1e1f;
    border-right:1px solid rgba(255,255,255,0.05);
    padding:12px 8px;
    display:flex;
    flex-direction:column;
    gap:2px;
    overflow:hidden;
  }
  .email-nav-item{
    display:flex;align-items:center;gap:10px;
    padding:7px 10px;border-radius:8px;
    font-size:12px;color:rgba(255,255,255,0.55);
    cursor:pointer;transition:background 0.15s;
    white-space:nowrap;
  }
  .email-nav-item:hover{background:rgba(255,255,255,0.06);}
  .email-nav-item.active{background:${accent}22;color:${accent};}
  .email-nav-item .nav-icon{font-size:14px;width:18px;text-align:center;}
  .email-nav-count{margin-left:auto;background:${accent};color:#fff;border-radius:10px;
    padding:1px 7px;font-size:10px;font-weight:700;}
  .nav-section{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.25);
    padding:10px 10px 4px;margin-top:6px;}

  /* ── Email List Panel ── */
  .email-list-panel{
    width:280px;
    min-width:280px;
    background:#202021;
    border-right:1px solid rgba(255,255,255,0.05);
    overflow-y:auto;
    scrollbar-width:none;
  }
  .email-list-panel::-webkit-scrollbar{display:none;}
  .email-list-header{
    padding:10px 14px 8px;
    display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid rgba(255,255,255,0.05);
    position:sticky;top:0;background:#202021;z-index:2;
  }
  .email-list-title{font-size:13px;font-weight:700;color:#fff;}
  .email-list-count{font-size:11px;color:${accent};font-weight:600;}

  .email-row{
    display:flex;align-items:flex-start;gap:10px;
    padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);
    cursor:pointer;transition:background 0.15s;
    border-left:2px solid transparent;
  }
  .email-row:hover{background:rgba(255,255,255,0.04);}
  .email-row--unread{background:rgba(255,255,255,0.03);}
  .email-avatar{
    width:34px;height:34px;min-width:34px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:700;color:#fff;
    flex-shrink:0;margin-top:1px;
  }
  .email-row-body{flex:1;min-width:0;}
  .email-row-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;}
  .email-row-from{font-size:12px;color:rgba(255,255,255,0.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;}
  .email-row-from--bold{font-weight:700;color:#fff;}
  .email-row-time{font-size:10px;color:rgba(255,255,255,0.3);white-space:nowrap;flex-shrink:0;}
  .email-row-subject{font-size:12px;color:rgba(255,255,255,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;}
  .email-row-preview{font-size:11px;color:rgba(255,255,255,0.25);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

  /* ── Email Detail Panel ── */
  .email-detail{
    flex:1;
    overflow-y:auto;
    background:#1a1a1c;
    scrollbar-width:thin;
    scrollbar-color:rgba(255,255,255,0.1) transparent;
  }
  .email-detail::-webkit-scrollbar{width:4px;}
  .email-detail::-webkit-scrollbar-track{background:transparent;}
  .email-detail::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}

  .email-detail-header{
    padding:18px 24px 14px;
    border-bottom:1px solid rgba(255,255,255,0.06);
    background:linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 100%);
  }
  .email-detail-subject{font-size:18px;font-weight:700;color:#fff;margin-bottom:12px;line-height:1.3;}
  .email-detail-meta{display:flex;align-items:flex-start;gap:12px;}
  .email-sender-avatar{
    width:38px;height:38px;min-width:38px;border-radius:50%;
    background:linear-gradient(135deg,${accent},${accent}88);
    display:flex;align-items:center;justify-content:center;
    font-size:14px;font-weight:700;color:#fff;
    box-shadow:0 2px 12px ${accent}55;
    flex-shrink:0;
  }
  .email-detail-from-block{flex:1;}
  .email-detail-from-name{font-size:13px;font-weight:600;color:#fff;margin-bottom:2px;}
  .email-detail-from-email{font-size:11px;color:rgba(255,255,255,0.35);}
  .email-detail-to{font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;}
  .email-detail-time-stamp{font-size:11px;color:rgba(255,255,255,0.25);white-space:nowrap;}
  .email-actions{display:flex;gap:6px;align-items:center;margin-top:10px;}
  .email-action-btn{
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
    border-radius:6px;padding:4px 10px;font-size:11px;color:rgba(255,255,255,0.5);
    cursor:pointer;transition:all 0.2s;
  }
  .email-action-btn:hover{background:rgba(255,255,255,0.09);color:#fff;}
  .email-action-btn.primary{background:${accent}22;border-color:${accent}44;color:${accent};}

  /* ── Corps du message ── */
  .email-body-content{
    padding:24px 24px 0;
    font-size:14px;
    line-height:2;
    color:rgba(232,232,255,0.8);
  }
  .email-body-content br{line-height:1;}

  /* ── Zone Signature ── */
  .email-sig-divider{
    margin:20px 24px 0;
    border:none;
    border-top:1px solid rgba(255,255,255,0.06);
  }
  .email-sig-label{
    padding:8px 24px 4px;
    font-size:9px;letter-spacing:3px;text-transform:uppercase;
    color:rgba(255,255,255,0.15);display:flex;align-items:center;gap:8px;
  }
  .email-sig-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.05);}
  .gmail-sig-zone{
    padding:12px 24px 20px;
  }

  /* ── Barre énergie ── */
  .energy-footer{
    padding:6px 24px 14px;
    display:flex;align-items:center;gap:10px;
  }
  #energy-bar{flex:1;height:2px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;}
  #energy-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,${accent}55,${accent});border-radius:2px;transition:width 0.5s ease;}
  .cycle-counter{font-family:monospace;font-size:9px;color:rgba(255,255,255,0.18);letter-spacing:1.5px;white-space:nowrap;}

  /* ── SECTION LIVRÉE ── */
  .delivered-banner{
    max-width:980px;margin:0 auto 0;
    background:linear-gradient(135deg,${accent}0d,rgba(255,255,255,0.03));
    border:1px solid ${accent}22;border-radius:12px;
    padding:20px 28px;display:flex;align-items:center;gap:16px;
    animation:fadeInUp 1.4s ease both;
  }
  .delivered-icon{font-size:28px;}
  .delivered-text{flex:1;}
  .delivered-title{font-size:14px;font-weight:600;color:${accent};margin-bottom:4px;}
  .delivered-desc{font-size:12px;color:rgba(255,255,255,0.4);line-height:1.5;}
  .delivered-btn{
    background:linear-gradient(135deg,${accent},${accent}bb);
    color:#fff;border:none;border-radius:8px;padding:10px 20px;
    font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;
    white-space:nowrap;box-shadow:0 4px 16px ${accent}44;
    transition:all 0.2s;
  }
  .delivered-btn:hover{transform:translateY(-1px);box-shadow:0 6px 22px ${accent}66;}

  /* ── SECTION VARIATIONS ── */
  .section{max-width:980px;margin:0 auto;padding:60px 20px;}
  .section-label{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${accent};margin-bottom:8px;text-align:center;}
  .section-headline{font-size:26px;text-align:center;margin-bottom:36px;font-weight:300;}
  .variations-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;}
  .variation-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;transition:all 0.3s ease;}
  .variation-card:hover{border-color:${accent}55;transform:translateY(-4px);}
  .variation-label{font-size:26px;font-weight:700;margin-bottom:8px;font-family:'Georgia',serif;}
  .variation-title{font-size:14px;font-weight:600;margin-bottom:4px;}
  .variation-subtitle{font-size:11px;color:rgba(232,232,255,0.4);margin-bottom:8px;}
  .variation-intention{font-size:11px;color:rgba(232,232,255,0.6);line-height:1.5;margin-bottom:8px;}
  .variation-emotion{font-size:10px;letter-spacing:1px;text-transform:uppercase;}

  /* ── INSTALLATION ── */
  .install-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:28px;}
  .install-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;
    text-align:center;text-decoration:none;color:var(--text);transition:all 0.3s ease;
    display:flex;flex-direction:column;align-items:center;gap:12px;}
  .install-card:hover{border-color:${accent}55;background:${accent}0d;transform:translateY(-4px);}
  .install-icon{font-size:30px;}
  .install-name{font-size:14px;font-weight:600;}
  .install-btn{display:inline-block;background:${accent}22;border:1px solid ${accent}55;color:var(--accent);
    border-radius:20px;padding:6px 16px;font-size:12px;margin-top:4px;transition:all 0.2s;
    text-decoration:none;cursor:pointer;}
  .install-card:hover .install-btn{background:${accent}44;}
  .copy-btn{display:inline-flex;align-items:center;gap:6px;background:transparent;
    border:1px solid rgba(255,255,255,0.15);color:rgba(232,232,255,0.55);border-radius:20px;
    padding:6px 14px;font-size:12px;cursor:pointer;transition:all 0.2s;}
  .copy-btn:hover{border-color:${accent}55;color:var(--accent);background:${accent}11;}
  .copy-btn.copied{border-color:#22c55e88;color:#22c55e;background:#22c55e11;}

  /* ── DOWNLOAD ── */
  .download-zone{text-align:center;padding:60px 20px;background:linear-gradient(135deg,${accent}08,transparent);
    border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
  .download-btn{display:inline-flex;align-items:center;gap:12px;
    background:linear-gradient(135deg,${accent},${accent}bb);
    color:white;border:none;border-radius:50px;padding:18px 40px;font-size:16px;font-weight:600;
    cursor:pointer;text-decoration:none;transition:all 0.3s;box-shadow:0 8px 30px ${accent}44;}
  .download-btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px ${accent}66;}

  /* ── FOOTER ── */
  .footer{text-align:center;padding:40px 20px;font-size:13px;color:rgba(232,232,255,0.3);}
  .footer a{color:var(--accent);text-decoration:none;}

  /* ── ANIMATIONS ── */
  @keyframes fadeInDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @media(max-width:768px){
    .email-nav{display:none;}
    .email-list-panel{width:200px;min-width:200px;}
    .email-client-wrapper{max-width:100%;}
    .hero{padding:48px 16px 32px;}
  }
  @media(max-width:580px){
    .email-list-panel{display:none;}
    .email-layout{height:auto;}
  }
</style>
</head>
<body>

<div id="starfield"></div>

<!-- ══════════════════════════════════════════════════
     HERO
══════════════════════════════════════════════════ -->
<section class="hero">
  <div class="livrable-badge">✦ Livrable ${esc(brandLabel)} · Signature Vivante</div>
  <div class="hero-company">${esc(nom)} · ${esc(entreprise)}</div>
  <h1>${pageContent.headline}</h1>
  <p class="hero-desc">${pageContent.description}</p>
  <button class="replay-btn" id="btn-replay-sig" data-testid="btn-replay-signature">
    <svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
    Rejouer l'animation
  </button>

  <!-- ══ EMAIL CLIENT WINDOW ══ -->
  <div class="email-client-wrapper">
    <div class="email-client" id="email-client-mock">

      <!-- Window Chrome macOS -->
      <div class="win-chrome">
        <div class="win-dot" style="background:#ff5f57" title="Fermer"></div>
        <div class="win-dot" style="background:#ffbd2e" title="Réduire"></div>
        <div class="win-dot" style="background:#28ca41" title="Plein écran"></div>
        <div class="win-chrome-title">Gmail — Boîte de réception</div>
      </div>

      <!-- Toolbar -->
      <div class="win-toolbar">
        <button class="win-compose-btn">✏ Nouveau message</button>
        <div class="win-toolbar-search">
          <span style="opacity:0.4">🔍</span>
          <span>Rechercher dans les e-mails</span>
        </div>
        <div style="font-size:20px;opacity:0.25;cursor:pointer;padding:0 4px;">⋮</div>
      </div>

      <!-- Layout -->
      <div class="email-layout">

        <!-- Sidebar navigation -->
        <nav class="email-nav">
          <div class="email-nav-item active">
            <span class="nav-icon">📥</span> Boîte de réception
            <span class="email-nav-count">1</span>
          </div>
          <div class="email-nav-item"><span class="nav-icon">⭐</span> Favoris</div>
          <div class="email-nav-item"><span class="nav-icon">📤</span> Envoyés</div>
          <div class="email-nav-item"><span class="nav-icon">📝</span> Brouillons</div>
          <div class="email-nav-item"><span class="nav-icon">🗂</span> Toutes les boîtes</div>
          <div class="nav-section">Dossiers</div>
          <div class="email-nav-item"><span class="nav-icon">💼</span> Professionnel</div>
          <div class="email-nav-item"><span class="nav-icon">🏷</span> Clients</div>
          <div class="email-nav-item"><span class="nav-icon">📂</span> Archives</div>
          <div class="nav-section">Smart</div>
          <div class="email-nav-item"><span class="nav-icon">🔔</span> Notifications</div>
          <div class="email-nav-item"><span class="nav-icon">🗑</span> Corbeille</div>
        </nav>

        <!-- Liste emails -->
        <div class="email-list-panel">
          <div class="email-list-header">
            <span class="email-list-title">Boîte de réception</span>
            <span class="email-list-count">1 non lu</span>
          </div>
          ${fakeRows}
        </div>

        <!-- Email Detail -->
        <div class="email-detail">

          <div class="email-detail-header">
            <div class="email-detail-subject">${esc(emailContent.subject)}</div>
            <div class="email-detail-meta">
              <div class="email-sender-avatar">${esc(nom.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase())}</div>
              <div class="email-detail-from-block">
                <div class="email-detail-from-name">${esc(nom)}${titre ? ` · ${esc(titre)}` : ''}</div>
                <div class="email-detail-from-email">&lt;${esc(emailAddr)}&gt;</div>
                <div class="email-detail-to">À : ${esc(emailContent.to)} &lt;${esc(emailContent.toEmail)}&gt;</div>
              </div>
              <div class="email-detail-time-stamp">Aujourd'hui, 10h47</div>
            </div>
            <div class="email-actions">
              <button class="email-action-btn primary">↩ Répondre</button>
              <button class="email-action-btn">↪ Transférer</button>
              <button class="email-action-btn">🗂 Archiver</button>
              <button class="email-action-btn">⋯</button>
            </div>
          </div>

          <!-- Corps du message -->
          <div class="email-body-content">
            ${bodyHtml}
          </div>

          <!-- Séparateur signature -->
          <hr class="email-sig-divider">
          <div class="email-sig-label">Signature professionnelle</div>

          <!-- La vraie signature vivante -->
          <div class="gmail-sig-zone">
            ${svgContent}
          </div>

          <!-- Énergie cycle -->
          <div class="energy-footer">
            <div id="energy-bar"><div id="energy-bar-fill"></div></div>
            <div class="cycle-counter" id="cycle-counter">ANIMATION · 00:00</div>
          </div>

        </div><!-- /email-detail -->
      </div><!-- /email-layout -->
    </div><!-- /email-client -->
  </div><!-- /wrapper -->

  <!-- Bannière livrable -->
  <div class="delivered-banner">
    <div class="delivered-icon">🎯</div>
    <div class="delivered-text">
      <div class="delivered-title">Votre signature est prête à installer</div>
      <div class="delivered-desc">Compatible Gmail · Outlook · Apple Mail — animation SVG haute fidélité · export immédiat</div>
    </div>
    <a href="${downloadUrl}" class="delivered-btn" data-testid="btn-download-hero">⬇ Télécharger</a>
  </div>

</section>

<!-- ── VARIATIONS ── -->
<section class="section">
  <div class="section-label">Les 4 variations vivantes</div>
  <div class="section-headline">${pageContent.section_effets}</div>
  <div class="variations-grid">${variationsHtml}</div>
</section>

<!-- ── INSTALLATION ── -->
<section class="section" style="padding-top:0;">
  <div class="section-label">Installation</div>
  <div class="section-headline">Choisissez votre client email</div>
  <div class="install-grid">
    <div class="install-card">
      <div class="install-icon">📧</div>
      <div class="install-name">Gmail</div>
      <a href="${gmailFileUrl}" class="install-btn" download data-testid="btn-install-gmail">${pageContent.texte_bouton_gmail}</a>
      <a href="${gmailPdfUrl}" class="install-btn" style="background:transparent;border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);" download>Guide PDF</a>
      <button class="copy-btn" data-testid="btn-copy-gmail" data-code="${gmailCodeB64}" onclick="copyCode(this)">📋 Copier le code HTML</button>
    </div>
    <div class="install-card">
      <div class="install-icon">🖥️</div>
      <div class="install-name">Outlook</div>
      <a href="${outlookFileUrl}" class="install-btn" download data-testid="btn-install-outlook">${pageContent.texte_bouton_outlook}</a>
      <a href="${outlookPdfUrl}" class="install-btn" style="background:transparent;border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);" download>Guide PDF</a>
      <button class="copy-btn" data-testid="btn-copy-outlook" data-code="${outlookCodeB64}" onclick="copyCode(this)">📋 Copier le code HTML</button>
    </div>
    <div class="install-card">
      <div class="install-icon">🍎</div>
      <div class="install-name">Apple Mail</div>
      <a href="${appleFileUrl}" class="install-btn" download data-testid="btn-install-apple">${pageContent.texte_bouton_apple}</a>
      <a href="${applePdfUrl}" class="install-btn" style="background:transparent;border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);" download>Guide PDF</a>
      <button class="copy-btn" data-testid="btn-copy-apple" data-code="${svgCodeB64}" onclick="copyCode(this)">📋 Copier le SVG</button>
    </div>
  </div>
</section>

<!-- ── DOWNLOAD ── -->
<div class="download-zone">
  <a href="${downloadUrl}" class="download-btn" data-testid="btn-download-package">
    <span>⬇</span> ${pageContent.texte_bouton_download}
  </a>
  <p style="margin-top:16px;font-size:13px;color:rgba(232,232,255,0.4);">
    Package ZIP complet · SVG · PNG · Outlook · Gmail · 3 guides PDF · manifest.json
  </p>
</div>

<!-- ── FOOTER ── -->
<footer class="footer">
  <p>${whiteLabel ? `© ${esc(brandLabel)} · Signature vivante` : pageContent.footer}</p>
  <p style="margin-top:8px;font-size:11px;opacity:0.4;">ID: ${signatureId}</p>
</footer>

<script>
  // ── STARFIELD ──
  (function(){
    const sf=document.getElementById('starfield');if(!sf)return;
    for(let i=0;i<70;i++){
      const el=document.createElement('div');el.className='star';
      const size=1+Math.random()*2.5;
      el.style.cssText=['width:'+size+'px','height:'+size+'px','left:'+(Math.random()*100)+'%','top:'+(Math.random()*100)+'%',
        '--dur:'+(3+Math.random()*6).toFixed(2)+'s','--delay:'+(Math.random()*8).toFixed(2)+'s',
        '--max-opacity:'+(0.08+Math.random()*0.3).toFixed(2)].join(';');
      sf.appendChild(el);
    }
  })();

  // ══════════════════════════════════════════════════════
  //  EFFECTFORGE — MOTEUR INTERACTIF v3
  // ══════════════════════════════════════════════════════
  (function(){
    const CYCLE=${metadata.cycle_total||80};
    const VAR_DUR=CYCLE/4;
    const VARS=['A','B','C','D'];
    let elapsed=0;
    const counterEl=document.getElementById('cycle-counter');
    const energyFill=document.getElementById('energy-bar-fill');

    setInterval(function(){
      elapsed=(elapsed+1)%CYCLE;
      const varIdx=Math.floor(elapsed/VAR_DUR);
      const varElapsed=elapsed%VAR_DUR;
      const m=Math.floor(varElapsed/60).toString().padStart(2,'0');
      const s=(varElapsed%60).toString().padStart(2,'0');
      if(counterEl)counterEl.textContent='VAR '+VARS[varIdx]+' · '+m+':'+s;
      if(energyFill)energyFill.style.width=((elapsed/CYCLE)*100).toFixed(1)+'%';
    },1000);

    // ── REPLAY ──
    const replayBtn=document.getElementById('btn-replay-sig');
    if(replayBtn){
      replayBtn.addEventListener('click',function(){
        const sig=document.querySelector('.gmail-sig-zone');
        if(sig)restartSVGAnimations(sig);
        elapsed=0;
        if(sig){
          const rect=sig.getBoundingClientRect();
          for(let i=0;i<16;i++)setTimeout(function(){spawnSparkle(rect.left+Math.random()*rect.width,rect.top+Math.random()*rect.height,'${accent}');},i*50);
        }
        replayBtn.textContent='✨ Animation relancée !';
        setTimeout(function(){
          replayBtn.innerHTML='<svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:currentColor;vertical-align:middle;margin-right:8px"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>Rejouer l\'animation';
        },2200);
      });
    }

    // ── 3D TILT PARALLAX SUR LE CLIENT EMAIL ──
    const mock=document.getElementById('email-client-mock');
    if(mock){
      mock.addEventListener('mousemove',function(e){
        const rect=mock.getBoundingClientRect();
        const mx=(e.clientX-rect.left)/rect.width;
        const my=(e.clientY-rect.top)/rect.height;
        const tx=(my-0.5)*-2.5;const ty=(mx-0.5)*2.5;
        mock.style.transform='perspective(1400px) rotateX('+tx+'deg) rotateY('+ty+'deg) scale(1.003)';
        mock.style.transition='transform 0.12s ease-out';
        const svgEl=mock.querySelector('svg');
        if(svgEl){svgEl.style.setProperty('--mouse-x',mx.toFixed(3));svgEl.style.setProperty('--mouse-y',my.toFixed(3));}
        if(!mock._lastSparkle||Date.now()-mock._lastSparkle>130){
          mock._lastSparkle=Date.now();
          spawnSparkle(e.clientX,e.clientY,'${accent}');
        }
      });
      mock.addEventListener('mouseleave',function(){
        mock.style.transform='perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1)';
        mock.style.transition='transform 0.7s cubic-bezier(0.4,0,0.2,1)';
      });
    }

    // ── RESTART AU SURVOL SIGNATURE ──
    const sigZone=document.querySelector('.gmail-sig-zone');
    let rTimeout=null;
    if(sigZone){
      sigZone.addEventListener('mouseenter',function(){
        if(rTimeout)clearTimeout(rTimeout);
        rTimeout=setTimeout(function(){restartSVGAnimations(sigZone);},80);
      });
    }

    function restartSVGAnimations(container){
      const svgEl=container.querySelector('svg');if(!svgEl)return;
      const animated=svgEl.querySelectorAll('[style*="animation"]');
      animated.forEach(function(el){el.style.animationPlayState='paused';});
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        animated.forEach(function(el){el.style.animationPlayState='running';});
      });});
    }

    // ── INTERSECTION OBSERVER ──
    if('IntersectionObserver' in window&&sigZone){
      const obs=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            setTimeout(function(){restartSVGAnimations(entry.target);},200);
          }
        });
      },{threshold:0.3});
      obs.observe(sigZone);
    }

    // ── PULSE PÉRIODIQUE 25s ──
    setInterval(function(){
      if(!sigZone)return;
      const svgEl=sigZone.querySelector('svg');if(!svgEl)return;
      svgEl.style.filter='brightness(1.08) saturate(1.12)';
      svgEl.style.transition='filter 1.2s ease';
      setTimeout(function(){svgEl.style.filter='brightness(1) saturate(1)';},1200);
      const rect=sigZone.getBoundingClientRect();
      for(let i=0;i<5;i++)setTimeout(function(){
        spawnSparkle(rect.left+Math.random()*rect.width,rect.top+Math.random()*rect.height,'${accent}');
      },i*180);
    },25000);

    // ── SPARKLE ──
    function spawnSparkle(x,y,color){
      const spark=document.createElement('div');
      const size=3+Math.random()*4;
      const vx=(Math.random()-0.5)*60;const vy=-20-Math.random()*40;
      spark.style.cssText=['position:fixed','pointer-events:none','border-radius:50%','z-index:9999',
        'width:'+size+'px','height:'+size+'px','left:'+(x-size/2)+'px','top:'+(y-size/2)+'px',
        'background:'+color,'box-shadow:0 0 '+(size*2)+'px '+color,'opacity:0.9'].join(';');
      document.body.appendChild(spark);
      let frame=0;const totalFrames=30+Math.floor(Math.random()*20);
      function tick(){
        frame++;const p=frame/totalFrames;
        const cy=y+vy*p+30*p*p;const cx=x+vx*p;
        spark.style.left=(cx-size/2)+'px';spark.style.top=(cy-size/2)+'px';
        spark.style.opacity=(0.9*(1-p)).toString();
        if(frame<totalFrames)requestAnimationFrame(tick);else spark.remove();
      }
      requestAnimationFrame(tick);
    }

  })();

  // ── COPIER CODE ──
  function copyCode(btn){
    const b64=btn.getAttribute('data-code');if(!b64)return;
    let decoded;try{decoded=decodeURIComponent(escape(atob(b64)));}catch(e){decoded=atob(b64);}
    navigator.clipboard.writeText(decoded).then(function(){
      const orig=btn.innerHTML;btn.innerHTML='✅ Copié !';btn.classList.add('copied');
      setTimeout(function(){btn.innerHTML=orig;btn.classList.remove('copied');},2000);
    }).catch(function(){
      const ta=document.createElement('textarea');ta.value=decoded;
      ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();
      document.execCommand('copy');document.body.removeChild(ta);
      const orig=btn.innerHTML;btn.innerHTML='✅ Copié !';btn.classList.add('copied');
      setTimeout(function(){btn.innerHTML=orig;btn.classList.remove('copied');},2000);
    });
  }
</script>
</body>
</html>`;

  // ── Écriture du fichier HTML ──
  try {
    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, 'preview.html');
    await fs.writeFile(filePath, html, 'utf-8');
    log(`[preview] Fichier écrit : ${filePath}`);
  } catch (err) {
    log(`[preview] ERREUR écriture : ${err}`);
  }

  return html;
}
