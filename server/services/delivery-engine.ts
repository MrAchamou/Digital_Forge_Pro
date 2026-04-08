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
import { cleanOldExports } from './exports-cleaner';
import type { CreativeBrief, NarrativeScenario, TechnicalConfig } from './triple-ai-director';

const EXPORTS_DIR = path.join(process.cwd(), 'exports');

// ── Timeouts par étape (ms) ───────────────────────────────────────────────────
const TIMEOUT_PNG      = 30_000;
const TIMEOUT_CEREBRAS = 45_000;
const TIMEOUT_PDFS     = 60_000;
const TIMEOUT_PREVIEW  = 20_000;
const TIMEOUT_ZIP      = 30_000;
const TIMEOUT_EMAIL    = 20_000;

// ── Wrapper timeout universel ────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Délai dépassé (${ms / 1000}s) — étape: ${label}`)),
      ms
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

// ── Validation SVG ────────────────────────────────────────────────────────────
function validateSvgInput(svgContent: string): void {
  if (!svgContent || typeof svgContent !== 'string') {
    throw new Error('SVG invalide : contenu null ou non-string.');
  }
  if (svgContent.length < 100) {
    throw new Error(`SVG invalide : trop court (${svgContent.length} car., minimum 100).`);
  }
  if (!svgContent.includes('<svg')) {
    throw new Error('SVG invalide : balise <svg absente.');
  }
  const hasViewBox  = /viewBox\s*=/i.test(svgContent);
  const hasWidth    = /\bwidth\s*=/i.test(svgContent);
  const hasHeight   = /\bheight\s*=/i.test(svgContent);
  if (!hasViewBox && !(hasWidth && hasHeight)) {
    throw new Error('SVG invalide : viewBox ou dimensions (width/height) absents.');
  }
}

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
  duration_ms?: number;
  started_at?: number;
}

export interface DeliveryResult {
  signature_id: string;
  preview_url: string;
  download_url: string;
  email_sent: boolean;
  package_contents: string[];
  steps: DeliveryStatus[];
  total_duration_ms: number;
}

export async function runDeliveryEngine(
  input: DeliveryInput,
  baseUrl: string,
  onProgress?: (steps: DeliveryStatus[]) => void
): Promise<DeliveryResult> {
  const engineStart = Date.now();
  const signatureId = `sig_${randomUUID().split('-')[0]}_${Date.now()}`;
  const { svgContent, clientEmail, metadata, creativeConfig } = input;
  const { nom, entreprise, secteur, palette = ['#0f172a', '#6366f1', '#e8e8ff'] } = metadata;
  const [, accent] = palette;

  // ── 2.1 : Validation SVG à l'entrée ─────────────────────────────────────
  validateSvgInput(svgContent);

  await fs.mkdir(EXPORTS_DIR, { recursive: true });

  const steps: DeliveryStatus[] = [
    { step: 'png',     label: 'Génération du fallback PNG',          status: 'pending' },
    { step: 'formats', label: 'Création versions Outlook + Gmail',   status: 'pending' },
    { step: 'cerebras',label: 'Cerebras rédige les instructions',    status: 'pending' },
    { step: 'pdfs',    label: 'Génération des PDFs',                 status: 'pending' },
    { step: 'preview', label: 'Construction de la page preview',     status: 'pending' },
    { step: 'zip',     label: 'Assemblage du package ZIP',           status: 'pending' },
    { step: 'email',   label: 'Envoi de l\'email client',            status: 'pending' },
  ];

  const emit = () => onProgress?.([...steps]);

  // setStep gère le timing : started_at au 'running', duration_ms au 'done'/'error'
  const setStep = (idx: number, status: DeliveryStatus['status'], error?: string) => {
    const now = Date.now();
    const prev = steps[idx];
    const started_at  = status === 'running' ? now : prev.started_at;
    const duration_ms = (status === 'done' || status === 'error') && prev.started_at
      ? now - prev.started_at
      : prev.duration_ms;
    steps[idx] = { ...prev, status, error, started_at, duration_ms };
    emit();
  };

  // ── ÉTAPE 1 & 2 : PNG + Formats (critique) ───────────────────────────────
  setStep(0, 'running');
  setStep(1, 'running');

  let packageFiles: Awaited<ReturnType<typeof buildAllPackageFiles>>;
  try {
    packageFiles = await withTimeout(
      buildAllPackageFiles(svgContent, metadata),
      TIMEOUT_PNG,
      'PNG + Formats'
    );
    setStep(0, 'done');
    setStep(1, 'done');
  } catch (err: any) {
    setStep(0, 'error', err.message);
    setStep(1, 'error', err.message);
    throw new Error(`Erreur construction package: ${err.message}`);
  }

  // ── ÉTAPE 3 : Cerebras (non bloquant, fallback si timeout) ───────────────
  setStep(2, 'running');

  const effectsUsed = [
    ...(creativeConfig.technique?.variation_a ? [creativeConfig.technique.variation_a.fond?.effet] : []),
    ...(creativeConfig.technique?.variation_b ? [creativeConfig.technique.variation_b.fond?.effet] : []),
    ...(creativeConfig.technique?.variation_c ? [creativeConfig.technique.variation_c.fond?.effet] : []),
  ].filter(Boolean) as string[];

  const arcNarratif = creativeConfig.scenario?.arc_emotionnel || 'Transformation professionnelle';

  let cerebrasContent: Awaited<ReturnType<typeof generateAllContent>>;
  try {
    cerebrasContent = await withTimeout(
      generateAllContent(
        { nom, entreprise, secteur },
        effectsUsed.length > 0 ? effectsUsed : ['SOUL_AURA', 'NEON_PULSE'],
        arcNarratif
      ),
      TIMEOUT_CEREBRAS,
      'Cerebras'
    );
    setStep(2, 'done');
  } catch (err: any) {
    log(`Cerebras indisponible/timeout, fallback utilisé: ${err.message}`, 'delivery-engine');
    cerebrasContent = getFallbackContent(
      { nom, entreprise, secteur },
      effectsUsed.length > 0 ? effectsUsed : ['SOUL_AURA', 'NEON_PULSE']
    );
    setStep(2, 'done');
  }

  // ── ÉTAPE 4 : PDFs (critique) ─────────────────────────────────────────────
  setStep(3, 'running');

  let gmailPdfBuffer: Buffer;
  let outlookPdfBuffer: Buffer;
  let applePdfBuffer: Buffer;

  try {
    [gmailPdfBuffer, outlookPdfBuffer, applePdfBuffer] = await withTimeout(
      Promise.all([
        generateInstructionsPdf(cerebrasContent.instructionsGmail,   nom, entreprise, signatureId, svgContent, palette),
        generateInstructionsPdf(cerebrasContent.instructionsOutlook, nom, entreprise, signatureId, svgContent, palette),
        generateInstructionsPdf(cerebrasContent.instructionsApple,   nom, entreprise, signatureId, svgContent, palette),
      ]),
      TIMEOUT_PDFS,
      'PDFs'
    );
    setStep(3, 'done');
  } catch (err: any) {
    setStep(3, 'error', err.message);
    throw new Error(`Erreur PDFs: ${err.message}`);
  }

  // ── ÉTAPE 5 : Page preview (non bloquante) ───────────────────────────────
  setStep(4, 'running');

  try {
    await withTimeout(
      generatePreviewPage({
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
        gmailHtml: packageFiles.gmailHtml,
        outlookHtml: packageFiles.outlookHtml,
      }),
      TIMEOUT_PREVIEW,
      'Preview'
    );
    setStep(4, 'done');
  } catch (err: any) {
    setStep(4, 'error', err.message);
    log(`Erreur page preview (non bloquant): ${err.message}`, 'delivery-engine');
    setStep(4, 'done');
  }

  // ── ÉTAPE 6 : ZIP (critique) ──────────────────────────────────────────────
  setStep(5, 'running');

  const configJson = JSON.stringify({
    signature_id: signatureId,
    generated_at: new Date().toISOString(),
    client: { nom, entreprise, secteur },
    creative_decisions: {
      brief_creatif:           creativeConfig.brief    || null,
      scenario_narratif:       creativeConfig.scenario || null,
      configuration_technique: creativeConfig.technique || null,
    },
    effects_used: effectsUsed,
    cycle_total:  creativeConfig.technique?.cycle_total || 240,
    variations: ['A', 'B', 'C', 'D'],
    version: '2.0',
  }, null, 2);

  let zipPath: string;
  try {
    zipPath = await withTimeout(
      assembleZip({
        signatureId,
        entreprise,
        svgContent: packageFiles.svgContent,
        pngBuffer:  packageFiles.pngBuffer,
        outlookHtml: packageFiles.outlookHtml,
        gmailHtml:   packageFiles.gmailHtml,
        gmailPdfBuffer,
        outlookPdfBuffer,
        applePdfBuffer,
        configJson,
        readmeTxt: cerebrasContent.readme.contenu,
        outputDir: EXPORTS_DIR,
        metadata: {
          nom:         metadata.nom,
          titre:       metadata.titre,
          email:       metadata.email,
          telephone:   metadata.telephone,
          site:        metadata.site,
          secteur:     metadata.secteur,
          palette,
          description: metadata.description,
          note:        metadata.note,
          avis:        metadata.avis,
          slogan:      metadata.slogan,
        },
        effectsUsed,
      }),
      TIMEOUT_ZIP,
      'ZIP'
    );
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
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}.svg`),            svgContent,                 'utf-8'),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-outlook.htm`),    packageFiles.outlookHtml,   'utf-8'),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-gmail.html`),     packageFiles.gmailHtml,     'utf-8'),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-gmail.pdf`),      gmailPdfBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-outlook.pdf`),    outlookPdfBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-apple.pdf`),      applePdfBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-fallback.png`),   packageFiles.pngBuffer),
    fs.writeFile(path.join(EXPORTS_DIR, `${signatureId}-config.json`),    configJson, 'utf-8'),
  ]);

  // ── ÉTAPE 7 : Email (non bloquant) ────────────────────────────────────────
  setStep(6, 'running');

  let emailSent = false;
  if (clientEmail) {
    try {
      const emailResult = await withTimeout(
        sendDeliveryEmail({
          toEmail: clientEmail,
          clientName: nom,
          content: cerebrasContent.emailLivraison,
          signatureId,
          previewUrl:  `${baseUrl}/api/signature/preview/${signatureId}`,
          downloadUrl: `${baseUrl}/api/signature/download/${signatureId}`,
          accent,
          gmailPdfBuffer,
          outlookPdfBuffer,
          applePdfBuffer,
        }),
        TIMEOUT_EMAIL,
        'Email'
      );
      emailSent = emailResult.success;
      setStep(6, emailResult.success ? 'done' : 'error', emailResult.error);
    } catch (err: any) {
      setStep(6, 'error', err.message);
    }
  } else {
    setStep(6, 'done');
  }

  const previewUrl  = `${baseUrl}/api/signature/preview/${signatureId}`;
  const downloadUrl = `${baseUrl}/api/signature/download/${signatureId}`;

  const total_duration_ms = Date.now() - engineStart;
  log(`Livraison complète: ${signatureId} (${total_duration_ms}ms)`, 'delivery-engine');

  // ── 4.1 : Nettoyage background (sans bloquer la réponse) ─────────────────
  setImmediate(() => {
    cleanOldExports(7).catch((err) =>
      log(`Nettoyage background échoué: ${err}`, 'delivery-engine')
    );
  });

  return {
    signature_id:    signatureId,
    preview_url:     previewUrl,
    download_url:    downloadUrl,
    email_sent:      emailSent,
    package_contents: [
      'PREVIEW — Ouvrez ce fichier.html',
      'signature.svg',
      'signature-fallback.png',
      'signature-gmail.html',
      'signature-outlook.htm',
      'instructions-gmail.pdf',
      'instructions-outlook.pdf',
      'instructions-apple-mail.pdf',
      'palette-de-marque.html',
      'config.json',
      'LISEZ-MOI.txt',
      'manifest.json',
    ],
    steps,
    total_duration_ms,
  };
}

export async function getDeliveryFile(
  signatureId: string,
  type: 'svg' | 'outlook' | 'gmail' | 'pdf-gmail' | 'pdf-outlook' | 'pdf-apple' | 'png' | 'config' | 'zip' | 'preview'
): Promise<{ buffer: Buffer; contentType: string; filename: string } | null> {
  try {
    const typeMap: Record<string, { ext: string; ct: string }> = {
      svg:          { ext: '.svg',          ct: 'image/svg+xml' },
      outlook:      { ext: '-outlook.htm',  ct: 'text/html' },
      gmail:        { ext: '-gmail.html',   ct: 'text/html' },
      'pdf-gmail':  { ext: '-gmail.pdf',    ct: 'application/pdf' },
      'pdf-outlook':{ ext: '-outlook.pdf',  ct: 'application/pdf' },
      'pdf-apple':  { ext: '-apple.pdf',    ct: 'application/pdf' },
      png:          { ext: '-fallback.png', ct: 'image/png' },
      config:       { ext: '-config.json',  ct: 'application/json' },
    };

    if (type === 'preview') {
      const previewPath = path.join(EXPORTS_DIR, 'preview', `${signatureId}.html`);
      const buffer = await fs.readFile(previewPath);
      return { buffer, contentType: 'text/html', filename: `preview-${signatureId}.html` };
    }

    if (type === 'zip') {
      const refPath = path.join(EXPORTS_DIR, `${signatureId}.zipref`);
      let zipFilename: string;
      try {
        zipFilename = (await fs.readFile(refPath, 'utf-8')).trim();
      } catch {
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
