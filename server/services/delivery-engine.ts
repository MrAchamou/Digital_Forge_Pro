import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { log } from '../vite';
import { buildAllPackageFiles } from './package-builder';
import { generateAllContent, getFallbackContent } from './cerebras-content-generator';
import { generateInstructionsPdf } from './pdf-generator';
import { generatePreviewPage } from './preview-page-generator';
import { assembleZip } from './zip-assembler';
import { sendDeliveryEmail } from './delivery-email';
import type { CreativeBrief, NarrativeScenario, TechnicalConfig } from './triple-ai-director';

const EXPORTS_DIR = path.join(process.cwd(), 'exports');

export interface DeliveryInput {
  svgContent: string;
  clientEmail?: string;
  metadata: {
    nom: string;
    entreprise: string;
    secteur: string;
    titre?: string;
    email?: string;
    telephone?: string;
    site?: string;
    palette?: string[];
    cta?: string;
    [key: string]: any;
  };
  creativeConfig: {
    brief?: CreativeBrief;
    scenario?: NarrativeScenario;
    technique?: TechnicalConfig;
  };
}

export interface DeliveryStatus {
  step: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
}

export interface DeliveryResult {
  signature_id: string;
  preview_url: string;
  download_url: string;
  email_sent: boolean;
  package_contents: string[];
  steps: DeliveryStatus[];
}

export async function runDeliveryEngine(
  input: DeliveryInput,
  baseUrl: string,
  onProgress?: (steps: DeliveryStatus[]) => void
): Promise<DeliveryResult> {
  const signatureId = `sig_${randomUUID().split('-')[0]}_${Date.now()}`;
  const { svgContent, clientEmail, metadata, creativeConfig } = input;
  const { nom, entreprise, secteur, palette = ['#0f172a', '#6366f1', '#e8e8ff'] } = metadata;
  const [,accent] = palette;

  await fs.mkdir(EXPORTS_DIR, { recursive: true });

  const steps: DeliveryStatus[] = [
    { step: 'png', label: 'Génération du fallback PNG', status: 'pending' },
    { step: 'formats', label: 'Création versions Outlook + Gmail', status: 'pending' },
    { step: 'cerebras', label: 'Cerebras rédige les instructions', status: 'pending' },
    { step: 'pdfs', label: 'Génération des PDFs', status: 'pending' },
    { step: 'preview', label: 'Construction de la page preview', status: 'pending' },
    { step: 'zip', label: 'Assemblage du package ZIP', status: 'pending' },
    { step: 'email', label: 'Envoi de l\'email client', status: 'pending' },
  ];

  const emit = () => onProgress?.([...steps]);
  const setStep = (idx: number, status: DeliveryStatus['status'], error?: string) => {
    steps[idx] = { ...steps[idx], status, error };
    emit();
  };

  // ── ÉTAPE 1 & 2 : PNG + Formats ──
  setStep(0, 'running');
  setStep(1, 'running');

  let packageFiles: Awaited<ReturnType<typeof buildAllPackageFiles>>;
  try {
    packageFiles = await buildAllPackageFiles(svgContent, metadata);
    setStep(0, 'done');
    setStep(1, 'done');
  } catch (err: any) {
    setStep(0, 'error', err.message);
    setStep(1, 'error', err.message);
    throw new Error(`Erreur construction package: ${err.message}`);
  }

  // ── ÉTAPE 3 : Cerebras ──
  setStep(2, 'running');

  const effectsUsed = [
    ...(creativeConfig.technique?.variation_a ? [creativeConfig.technique.variation_a.fond?.effet] : []),
    ...(creativeConfig.technique?.variation_b ? [creativeConfig.technique.variation_b.fond?.effet] : []),
    ...(creativeConfig.technique?.variation_c ? [creativeConfig.technique.variation_c.fond?.effet] : []),
  ].filter(Boolean) as string[];

  const arcNarratif = creativeConfig.scenario?.arc_emotionnel || 'Transformation professionnelle';

  let cerebrasContent: Awaited<ReturnType<typeof generateAllContent>>;
  try {
    cerebrasContent = await generateAllContent(
      { nom, entreprise, secteur },
      effectsUsed.length > 0 ? effectsUsed : ['SOUL_AURA', 'NEON_PULSE'],
      arcNarratif
    );
    setStep(2, 'done');
  } catch (err: any) {
    log(`Cerebras indisponible, fallback utilisé: ${err.message}`, 'delivery-engine');
    cerebrasContent = getFallbackContent(
      { nom, entreprise, secteur },
      effectsUsed.length > 0 ? effectsUsed : ['SOUL_AURA', 'NEON_PULSE']
    );
    setStep(2, 'done');
  }

  // ── ÉTAPE 4 : PDFs ──
  setStep(3, 'running');

  let gmailPdfBuffer: Buffer;
  let outlookPdfBuffer: Buffer;
  let applePdfBuffer: Buffer;

  try {
    [gmailPdfBuffer, outlookPdfBuffer, applePdfBuffer] = await Promise.all([
      generateInstructionsPdf(cerebrasContent.instructionsGmail, nom, entreprise, signatureId, svgContent, palette),
      generateInstructionsPdf(cerebrasContent.instructionsOutlook, nom, entreprise, signatureId, svgContent, palette),
      generateInstructionsPdf(cerebrasContent.instructionsApple, nom, entreprise, signatureId, svgContent, palette),
    ]);
    setStep(3, 'done');
  } catch (err: any) {
    setStep(3, 'error', err.message);
    throw new Error(`Erreur PDFs: ${err.message}`);
  }

  // ── ÉTAPE 5 : Page preview ──
  setStep(4, 'running');

  try {
    await generatePreviewPage({
      signatureId,
      svgContent,
      metadata: {
        ...metadata,
        cycle_total: creativeConfig.technique?.cycle_total ?? 240,
      },
      scenario: creativeConfig.scenario as NarrativeScenario,
      pageContent: cerebrasContent.previewPage,
      baseUrl,
      outputDir: EXPORTS_DIR,
    });
    setStep(4, 'done');
  } catch (err: any) {
    setStep(4, 'error', err.message);
    log(`Erreur page preview (non bloquant): ${err.message}`, 'delivery-engine');
    setStep(4, 'done');
  }

  // ── ÉTAPE 6 : ZIP ──
  setStep(5, 'running');

  const configJson = JSON.stringify({
    signature_id: signatureId,
    generated_at: new Date().toISOString(),
    client: { nom, entreprise, secteur },
    creative_decisions: {
      brief_creatif: creativeConfig.brief || null,
      scenario_narratif: creativeConfig.scenario || null,
      configuration_technique: creativeConfig.technique || null,
    },
    effects_used: effectsUsed,
    cycle_total: creativeConfig.technique?.cycle_total || 240,
    variations: ['A', 'B', 'C', 'D'],
    version: '1.0',
  }, null, 2);

  let zipPath: string;
  try {
    zipPath = await assembleZip({
      signatureId,
      entreprise,
      svgContent: packageFiles.svgContent,
      pngBuffer: packageFiles.pngBuffer,
      outlookHtml: packageFiles.outlookHtml,
      gmailHtml: packageFiles.gmailHtml,
      gmailPdfBuffer,
      outlookPdfBuffer,
      applePdfBuffer,
      configJson,
      readmeTxt: cerebrasContent.readme.contenu,
      outputDir: EXPORTS_DIR,
    });
    // Référence exacte vers le fichier ZIP pour la lookup déterministe
    await fs.writeFile(
      path.join(EXPORTS_DIR, `${signatureId}.zipref`),
      path.basename(zipPath),
      'utf-8'
    );
    setStep(5, 'done');
  } catch (err: any) {
    setStep(5, 'error', err.message);
    throw new Error(`Erreur ZIP: ${err.message}`);
  }

  // Sauvegarder les fichiers individuels pour les endpoints
  await Promise.all([
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}.svg`), svgContent, 'utf-8'),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-outlook.htm`), packageFiles.outlookHtml, 'utf-8'),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-gmail.html`), packageFiles.gmailHtml, 'utf-8'),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-gmail.pdf`), gmailPdfBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-outlook.pdf`), outlookPdfBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-apple.pdf`), applePdfBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-fallback.png`), packageFiles.pngBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-config.json`), configJson, 'utf-8'),
  ]);

  // ── ÉTAPE 7 : Email ──
  setStep(6, 'running');

  let emailSent = false;
  if (clientEmail) {
    const emailResult = await sendDeliveryEmail({
      toEmail: clientEmail,
      clientName: nom,
      content: cerebrasContent.emailLivraison,
      signatureId,
      previewUrl: `${baseUrl}/api/signature/preview/${signatureId}`,
      downloadUrl: `${baseUrl}/api/signature/download/${signatureId}`,
      accent,
      gmailPdfBuffer,
      outlookPdfBuffer,
      applePdfBuffer,
    });
    emailSent = emailResult.success;
    setStep(6, emailResult.success ? 'done' : 'error', emailResult.error);
  } else {
    setStep(6, 'done');
  }

  const previewUrl = `${baseUrl}/api/signature/preview/${signatureId}`;
  const downloadUrl = `${baseUrl}/api/signature/download/${signatureId}`;

  log(`Livraison complète: ${signatureId}`, 'delivery-engine');

  return {
    signature_id: signatureId,
    preview_url: previewUrl,
    download_url: downloadUrl,
    email_sent: emailSent,
    package_contents: [
      'signature.svg',
      'signature-fallback.png',
      'signature-outlook.htm',
      'signature-gmail.html',
      'instructions-gmail.pdf',
      'instructions-outlook.pdf',
      'instructions-apple-mail.pdf',
      'config.json',
      'LISEZ-MOI.txt',
    ],
    steps,
  };
}

export async function getDeliveryFile(
  signatureId: string,
  type: 'svg' | 'outlook' | 'gmail' | 'pdf-gmail' | 'pdf-outlook' | 'pdf-apple' | 'png' | 'config' | 'zip' | 'preview'
): Promise<{ buffer: Buffer; contentType: string; filename: string } | null> {
  try {
    const typeMap: Record<string, { ext: string; ct: string }> = {
      svg: { ext: '.svg', ct: 'image/svg+xml' },
      outlook: { ext: '-outlook.htm', ct: 'text/html' },
      gmail: { ext: '-gmail.html', ct: 'text/html' },
      'pdf-gmail': { ext: '-gmail.pdf', ct: 'application/pdf' },
      'pdf-outlook': { ext: '-outlook.pdf', ct: 'application/pdf' },
      'pdf-apple': { ext: '-apple.pdf', ct: 'application/pdf' },
      png: { ext: '-fallback.png', ct: 'image/png' },
      config: { ext: '-config.json', ct: 'application/json' },
    };

    if (type === 'preview') {
      const previewPath = path.join(EXPORTS_DIR, 'preview', `${signatureId}.html`);
      const buffer = await fs.readFile(previewPath);
      return { buffer, contentType: 'text/html', filename: `preview-${signatureId}.html` };
    }

    if (type === 'zip') {
      // Lecture déterministe via le fichier de référence créé à l'assemblage
      const refPath = path.join(EXPORTS_DIR, `${signatureId}.zipref`);
      let zipFilename: string;
      try {
        zipFilename = (await fs.readFile(refPath, 'utf-8')).trim();
      } catch {
        // Fallback : scan du répertoire si la référence est absente (anciennes signatures)
        const files = await fs.readdir(EXPORTS_DIR);
        const uuidPart = signatureId.split('_')[1] || signatureId;
        const found = files.find(f => f.includes(uuidPart) && f.endsWith('.zip'));
        if (!found) return null;
        zipFilename = found;
      }
      const buffer = await fs.readFile(path.join(EXPORTS_DIR, zipFilename));
      return { buffer, contentType: 'application/zip', filename: zipFilename };
    }

    const { ext, ct } = typeMap[type] || {};
    if (!ext) return null;

    const filePath = path.join(EXPORTS_DIR, `${signatureId}${ext}`);
    const buffer = await fs.readFile(filePath);
    const filename = `signature-${type}-${signatureId}${ext}`;
    return { buffer, contentType: ct, filename };
  } catch {
    return null;
  }
}
