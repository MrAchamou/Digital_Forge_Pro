import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { log } from '../vite';
import type { TechnicalConfig, NarrativeScenario, CreativeBrief } from './triple-ai-director';

const EXPORT_DIR = path.join(process.cwd(), 'exports');

async function ensureExportDir() {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
}

function buildGodTierSVG(
  metadata: any,
  config: TechnicalConfig,
  scenario: NarrativeScenario
): string {
  const { nom = 'Jean Dupont', titre = 'Directeur', entreprise = 'Studio', email = '', telephone = '', site = '' } = metadata;
  const palette = metadata.palette || ['#0f0f0f', '#6366f1', '#e8e8ff'];
  const [bg, accent, text] = palette;

  const cycleTotal = config.cycle_total || 240;
  const dur = cycleTotal / 4;
  const trans = config.transitions?.duree || 2;

  const makeKeyframes = (id: string, fromOpacity: number, toOpacity: number, delay: number) =>
    `@keyframes fade_${id}{0%,100%{opacity:${fromOpacity}}50%{opacity:${toOpacity}}}`;

  const vA = config.variation_a;
  const vB = config.variation_b;
  const vC = config.variation_c;
  const vD = config.variation_d;

  const intensA = vA?.logo?.intensity ?? 0.6;
  const intensB = vB?.logo?.intensity ?? 0.5;
  const intensC = vC?.logo?.intensity ?? 0.4;
  const intensD = vD?.logo?.intensity ?? 0.7;

  const colorA = vA?.separateur?.color || accent;
  const colorB = vB?.separateur?.color || accent;
  const colorC = vC?.separateur?.color || accent;
  const colorD = vD?.separateur?.color || accent;

  const totalDur = cycleTotal;

  const titleA = scenario.variations?.A?.titre || 'Variation A';
  const titleB = scenario.variations?.B?.titre || 'Variation B';
  const titleC = scenario.variations?.C?.titre || 'Variation C';
  const titleD = scenario.variations?.D?.titre || 'Variation D';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="600" height="200" viewBox="0 0 600 200"
  style="font-family:system-ui,-apple-system,sans-serif;background:${bg}">

  <defs>
    <style>
      /* === ANIMATIONS GOD TIER === */
      @keyframes pulse_logo {
        0%,100%{opacity:0.85;transform:scale(1)}
        50%{opacity:1;transform:scale(1.04)}
      }
      @keyframes sep_glow_a {
        0%,100%{stroke:${colorA};stroke-width:2;filter:drop-shadow(0 0 4px ${colorA})}
        50%{stroke:${colorA};stroke-width:3;filter:drop-shadow(0 0 10px ${colorA})}
      }
      @keyframes sep_glow_b {
        0%,100%{stroke:${colorB};stroke-width:2;filter:drop-shadow(0 0 4px ${colorB})}
        50%{stroke:${colorB};stroke-width:3;filter:drop-shadow(0 0 10px ${colorB})}
      }
      @keyframes sep_glow_c {
        0%,100%{stroke:${colorC};stroke-width:2;filter:drop-shadow(0 0 4px ${colorC})}
        50%{stroke:${colorC};stroke-width:3;filter:drop-shadow(0 0 10px ${colorC})}
      }
      @keyframes sep_glow_d {
        0%,100%{stroke:${colorD};stroke-width:2;filter:drop-shadow(0 0 4px ${colorD})}
        50%{stroke:${colorD};stroke-width:3;filter:drop-shadow(0 0 10px ${colorD})}
      }
      @keyframes text_shimmer {
        0%,100%{opacity:0.9}
        50%{opacity:1}
      }
      @keyframes bg_cycle_a {
        0%{opacity:1} ${(dur/totalDur*100).toFixed(1)}%{opacity:1} ${((dur+trans)/totalDur*100).toFixed(1)}%{opacity:0} ${((totalDur-trans)/totalDur*100).toFixed(1)}%{opacity:0} 100%{opacity:1}
      }
      @keyframes bg_cycle_b {
        0%{opacity:0} ${((dur-trans)/totalDur*100).toFixed(1)}%{opacity:0} ${(dur/totalDur*100).toFixed(1)}%{opacity:1} ${((dur*2)/totalDur*100).toFixed(1)}%{opacity:1} ${((dur*2+trans)/totalDur*100).toFixed(1)}%{opacity:0} 100%{opacity:0}
      }
      @keyframes bg_cycle_c {
        0%{opacity:0} ${((dur*2-trans)/totalDur*100).toFixed(1)}%{opacity:0} ${((dur*2)/totalDur*100).toFixed(1)}%{opacity:1} ${((dur*3)/totalDur*100).toFixed(1)}%{opacity:1} ${((dur*3+trans)/totalDur*100).toFixed(1)}%{opacity:0} 100%{opacity:0}
      }
      @keyframes bg_cycle_d {
        0%{opacity:0} ${((dur*3-trans)/totalDur*100).toFixed(1)}%{opacity:0} ${((dur*3)/totalDur*100).toFixed(1)}%{opacity:1} ${((totalDur-trans)/totalDur*100).toFixed(1)}%{opacity:1} 100%{opacity:0}
      }

      .layer-a { animation: bg_cycle_a ${totalDur}s linear infinite; }
      .layer-b { animation: bg_cycle_b ${totalDur}s linear infinite; }
      .layer-c { animation: bg_cycle_c ${totalDur}s linear infinite; }
      .layer-d { animation: bg_cycle_d ${totalDur}s linear infinite; }
      .logo-pulse { animation: pulse_logo 4s ease-in-out infinite; transform-origin: center; }
      .text-shimmer { animation: text_shimmer 6s ease-in-out infinite; }
    </style>

    <radialGradient id="aura_a" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colorA}" stop-opacity="${intensA}"/>
      <stop offset="100%" stop-color="${colorA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aura_b" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colorB}" stop-opacity="${intensB}"/>
      <stop offset="100%" stop-color="${colorB}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aura_c" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colorC}" stop-opacity="${intensC}"/>
      <stop offset="100%" stop-color="${colorC}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aura_d" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colorD}" stop-opacity="${intensD}"/>
      <stop offset="100%" stop-color="${colorD}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg_gradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg}dd"/>
    </linearGradient>
    <clipPath id="avatar_clip">
      <circle cx="70" cy="100" r="55"/>
    </clipPath>
  </defs>

  <!-- Fond principal -->
  <rect width="600" height="200" fill="url(#bg_gradient)"/>

  <!-- Auras des variations -->
  <g class="layer-a"><ellipse cx="70" cy="100" rx="80" ry="80" fill="url(#aura_a)" opacity="0.4"/></g>
  <g class="layer-b"><ellipse cx="70" cy="100" rx="80" ry="80" fill="url(#aura_b)" opacity="0.4"/></g>
  <g class="layer-c"><ellipse cx="70" cy="100" rx="80" ry="80" fill="url(#aura_c)" opacity="0.4"/></g>
  <g class="layer-d"><ellipse cx="70" cy="100" rx="80" ry="80" fill="url(#aura_d)" opacity="0.4"/></g>

  <!-- Avatar -->
  <circle cx="70" cy="100" r="52" fill="${accent}22" class="logo-pulse"/>
  <circle cx="70" cy="100" r="52" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.6"/>
  <text x="70" y="107" text-anchor="middle" font-size="28" font-weight="700" fill="${accent}" opacity="0.9">
    ${nom.charAt(0).toUpperCase()}${(nom.split(' ')[1] || '').charAt(0).toUpperCase()}
  </text>

  <!-- Séparateurs par variation -->
  <g class="layer-a">
    <line x1="142" y1="20" x2="142" y2="180" style="animation: sep_glow_a 3s ease-in-out infinite;stroke:${colorA};stroke-width:2"/>
  </g>
  <g class="layer-b">
    <line x1="142" y1="20" x2="142" y2="180" style="animation: sep_glow_b 3s ease-in-out infinite;stroke:${colorB};stroke-width:2"/>
  </g>
  <g class="layer-c">
    <line x1="142" y1="20" x2="142" y2="180" style="animation: sep_glow_c 3s ease-in-out infinite;stroke:${colorC};stroke-width:2"/>
  </g>
  <g class="layer-d">
    <line x1="142" y1="20" x2="142" y2="180" style="animation: sep_glow_d 3s ease-in-out infinite;stroke:${colorD};stroke-width:2"/>
  </g>

  <!-- Contenu texte -->
  <g transform="translate(158, 0)">
    <!-- Nom -->
    <text x="0" y="60" font-size="22" font-weight="700" fill="${text}" class="text-shimmer">${nom}</text>
    <!-- Titre -->
    <text x="0" y="82" font-size="12" fill="${accent}" opacity="0.9" letter-spacing="1">${titre.toUpperCase()}</text>
    <!-- Entreprise -->
    <text x="0" y="100" font-size="13" fill="${text}" opacity="0.7">${entreprise}</text>

    <!-- Séparateur horizontal -->
    <line x1="0" y1="112" x2="200" y2="112" stroke="${text}" stroke-width="0.5" opacity="0.3"/>

    <!-- Contact -->
    ${email ? `<text x="0" y="128" font-size="11" fill="${text}" opacity="0.65">✉ ${email}</text>` : ''}
    ${telephone ? `<text x="0" y="${email ? '143' : '128'}" font-size="11" fill="${text}" opacity="0.65">✆ ${telephone}</text>` : ''}
    ${site ? `<text x="0" y="${email && telephone ? '158' : email || telephone ? '143' : '128'}" font-size="11" fill="${accent}" opacity="0.8" text-decoration="underline">${site.replace('https://', '')}</text>` : ''}

    <!-- Variation label (discret) -->
    <g class="layer-a"><text x="0" y="185" font-size="8" fill="${text}" opacity="0.2" letter-spacing="2">${titleA.toUpperCase()}</text></g>
    <g class="layer-b"><text x="0" y="185" font-size="8" fill="${text}" opacity="0.2" letter-spacing="2">${titleB.toUpperCase()}</text></g>
    <g class="layer-c"><text x="0" y="185" font-size="8" fill="${text}" opacity="0.2" letter-spacing="2">${titleC.toUpperCase()}</text></g>
    <g class="layer-d"><text x="0" y="185" font-size="8" fill="${text}" opacity="0.2" letter-spacing="2">${titleD.toUpperCase()}</text></g>
  </g>

  <!-- CTA -->
  ${metadata.cta ? `
  <g transform="translate(420, 80)">
    <rect width="160" height="36" rx="18" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.8"/>
    <rect width="160" height="36" rx="18" fill="${accent}" opacity="0.1"/>
    <text x="80" y="23" text-anchor="middle" font-size="11" font-weight="600" fill="${accent}">${metadata.cta}</text>
  </g>
  ` : ''}

</svg>`;
}

function buildInstallationPDF(signatureId: string, svgUrl: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Guide Installation — Signature ${signatureId}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
  h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 12px; }
  h2 { color: #374151; margin-top: 32px; }
  .step { background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
  .step-num { display: inline-block; background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; margin-right: 8px; }
  .id { background: #f1f5f9; padding: 8px 16px; border-radius: 6px; font-family: monospace; font-size: 14px; }
  footer { margin-top: 60px; text-align: center; color: #9ca3af; font-size: 12px; }
</style>
</head>
<body>
<h1>📧 Guide d'installation — Signature Vivante</h1>
<p>ID Signature : <span class="id">${signatureId}</span></p>
<p>Générée le : ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>

<h2>📱 Gmail</h2>
<div class="step"><span class="step-num">1</span> Ouvrez Gmail → Paramètres → "Voir tous les paramètres"</div>
<div class="step"><span class="step-num">2</span> Rubrique "Signature" → créez une nouvelle signature → cliquez sur l'icône image</div>
<div class="step"><span class="step-num">3</span> Collez l'URL SVG ou utilisez l'outil d'intégration HTML fourni</div>

<h2>🖥️ Outlook</h2>
<div class="step"><span class="step-num">1</span> Fichier → Options → Courrier → Signatures</div>
<div class="step"><span class="step-num">2</span> Créez une nouvelle signature → basculez en mode HTML</div>
<div class="step"><span class="step-num">3</span> Collez le code SVG directement dans l'éditeur HTML</div>

<h2>🍎 Apple Mail</h2>
<div class="step"><span class="step-num">1</span> Mail → Préférences → Signatures</div>
<div class="step"><span class="step-num">2</span> Ajoutez une signature → ouvrez l'éditeur</div>
<div class="step"><span class="step-num">3</span> Collez le contenu SVG (désactivez le format RTF si nécessaire)</div>

<footer>EffectForge AI — Signature Vivante God Tier™ — ${signatureId}</footer>
</body>
</html>`;
}

export interface DeliveryPackage {
  signature_id: string;
  svg_content: string;
  svg_url: string;
  pdf_instructions_url: string;
  config_json_url: string;
  config: {
    brief: any;
    scenario: any;
    technique: any;
    metadata: any;
    generated_at: string;
    signature_id: string;
  };
}

export async function buildDeliveryPackage(
  metadata: any,
  brief: CreativeBrief,
  scenario: NarrativeScenario,
  config: TechnicalConfig
): Promise<DeliveryPackage> {
  await ensureExportDir();

  const signatureId = `sig_${randomUUID().split('-')[0]}_${Date.now()}`;
  const svgContent = buildGodTierSVG(metadata, config, scenario);
  const pdfHtml = buildInstallationPDF(signatureId, '');

  const svgPath = path.join(EXPORT_DIR, `${signatureId}.svg`);
  const pdfPath = path.join(EXPORT_DIR, `${signatureId}_guide.html`);
  const jsonPath = path.join(EXPORT_DIR, `${signatureId}_config.json`);

  const configData = {
    brief,
    scenario,
    technique: config,
    metadata,
    generated_at: new Date().toISOString(),
    signature_id: signatureId,
  };

  await Promise.all([
    fs.writeFile(svgPath, svgContent, 'utf-8'),
    fs.writeFile(pdfPath, pdfHtml, 'utf-8'),
    fs.writeFile(jsonPath, JSON.stringify(configData, null, 2), 'utf-8'),
  ]);

  log(`Package livraison créé: ${signatureId}`, 'signature-delivery');

  return {
    signature_id: signatureId,
    svg_content: svgContent,
    svg_url: `/api/signature/export/${signatureId}/svg`,
    pdf_instructions_url: `/api/signature/export/${signatureId}/guide`,
    config_json_url: `/api/signature/export/${signatureId}/config`,
    config: configData,
  };
}

export async function getExportFile(signatureId: string, type: 'svg' | 'guide' | 'config'): Promise<{ content: string; contentType: string; filename: string } | null> {
  const ext = type === 'svg' ? '.svg' : type === 'guide' ? '_guide.html' : '_config.json';
  const filePath = path.join(EXPORT_DIR, `${signatureId}${ext}`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const contentType = type === 'svg' ? 'image/svg+xml' : type === 'guide' ? 'text/html' : 'application/json';
    const filename = `signature_${signatureId}${ext}`;
    return { content, contentType, filename };
  } catch {
    return null;
  }
}
