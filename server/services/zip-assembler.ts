import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { log } from '../vite';

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
}): Promise<string> {
  const {
    signatureId, entreprise,
    svgContent, pngBuffer, outlookHtml, gmailHtml,
    gmailPdfBuffer, outlookPdfBuffer, applePdfBuffer,
    configJson, readmeTxt, outputDir,
  } = params;

  const safeName = entreprise
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  const zipFilename = `signature-${safeName}-${signatureId.split('_')[1] || signatureId}.zip`;
  const zipPath = path.join(outputDir, zipFilename);

  await fs.promises.mkdir(outputDir, { recursive: true });

  // ── Manifest JSON ──
  const fileEntries = [
    { name: 'signature.svg',                size: Buffer.byteLength(svgContent, 'utf-8'),   type: 'image/svg+xml' },
    { name: 'signature-fallback.png',        size: pngBuffer.length,                         type: 'image/png' },
    { name: 'signature-outlook.htm',         size: Buffer.byteLength(outlookHtml, 'utf-8'),  type: 'text/html' },
    { name: 'signature-gmail.html',          size: Buffer.byteLength(gmailHtml, 'utf-8'),    type: 'text/html' },
    { name: 'instructions-gmail.pdf',        size: gmailPdfBuffer.length,                    type: 'application/pdf' },
    { name: 'instructions-outlook.pdf',      size: outlookPdfBuffer.length,                  type: 'application/pdf' },
    { name: 'instructions-apple-mail.pdf',   size: applePdfBuffer.length,                    type: 'application/pdf' },
    { name: 'config.json',                   size: Buffer.byteLength(configJson, 'utf-8'),   type: 'application/json' },
    { name: 'LISEZ-MOI.txt',                 size: Buffer.byteLength(readmeTxt, 'utf-8'),    type: 'text/plain' },
  ];

  const manifest = {
    signature_id: signatureId,
    generated_at: new Date().toISOString(),
    client: { entreprise },
    total_files: fileEntries.length + 1, // +1 pour ce manifest
    total_size_bytes: fileEntries.reduce((acc, f) => acc + f.size, 0),
    files: fileEntries,
    version: '2.0',
    generator: 'EffectForge AI',
  };
  const manifestJson = JSON.stringify(manifest, null, 2);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    // Niveau 6 : bon équilibre CPU/compression (vs 9 = CPU maximal, gain marginal)
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', () => {
      log(`ZIP assemblé: ${zipFilename} (${archive.pointer()} bytes, niveau 6)`, 'zip-assembler');
      resolve(zipPath);
    });

    archive.on('error', reject);
    archive.pipe(output);

    archive.append(svgContent,        { name: 'signature.svg' });
    archive.append(pngBuffer,         { name: 'signature-fallback.png' });
    archive.append(outlookHtml,       { name: 'signature-outlook.htm' });
    archive.append(gmailHtml,         { name: 'signature-gmail.html' });
    archive.append(gmailPdfBuffer,    { name: 'instructions-gmail.pdf' });
    archive.append(outlookPdfBuffer,  { name: 'instructions-outlook.pdf' });
    archive.append(applePdfBuffer,    { name: 'instructions-apple-mail.pdf' });
    archive.append(configJson,        { name: 'config.json' });
    archive.append(readmeTxt,         { name: 'LISEZ-MOI.txt' });
    archive.append(manifestJson,      { name: 'manifest.json' });

    archive.finalize();
  });
}
