import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { log } from '../vite';
import type { TechnicalConfig, NarrativeScenario, CreativeBrief } from './triple-ai-director';
import { signatureBaseGenerator } from '../generator/signature-base-generator';
import { signatureVariationsGenerator } from '../generator/signature-variations-generator';
import { signatureSVGExporter } from '../generator/signature-svg-exporter';

const EXPORT_DIR = path.join(process.cwd(), 'exports');

async function ensureExportDir() {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
}

function buildGodTierSVG(
  metadata: any,
  config: TechnicalConfig,
  brief: CreativeBrief | null,
  scenario: NarrativeScenario
): string {
  const {
    nom = 'Jean Dupont',
    titre = 'Directeur',
    entreprise = 'Studio',
    email = '',
    telephone = '',
    site = '',
    cta = '',
    logo_url,
    logo_base64,
    logo3d,
  } = metadata;

  const palette: string[] = metadata.palette?.length >= 3
    ? metadata.palette
    : ['#0f0f0f', '#6366f1', '#e8e8ff'];

  const reseaux: string[] = [];
  if (metadata.reseaux_sociaux) {
    Object.keys(metadata.reseaux_sociaux).forEach(k => {
      if (metadata.reseaux_sociaux[k]) reseaux.push(k);
    });
  }

  const signatureData = {
    nom,
    titre,
    entreprise,
    email,
    telephone,
    site,
    reseaux,
    cta,
    logo_url: logo_base64 || logo_url || undefined,
    photo_url: undefined,
    logo3d: !!logo3d,
  };

  const ambiance = brief?.univers_visuel || brief?.style_detecte || 'professionnel moderne';
  const intensiteRaw = brief?.intensite_mouvement || 'subtil';
  const intensite: 'low' | 'medium' | 'high' =
    intensiteRaw === 'minimal' ? 'low' :
    intensiteRaw === 'expressif' || intensiteRaw === 'dramatique' ? 'high' :
    'medium';

  const styleData = {
    palette,
    ambiance,
    intensite,
    secteur: metadata.secteur || '',
  };

  const baseResult = signatureBaseGenerator.generate(signatureData, styleData);
  const variationsResult = signatureVariationsGenerator.generate(
    styleData,
    baseResult.palette,
    config.zone_compositions || undefined
  );
  const exportResult = signatureSVGExporter.export(nom, baseResult, variationsResult);

  return exportResult.svgContent;
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
  const svgContent = buildGodTierSVG(metadata, config, brief, scenario);
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
