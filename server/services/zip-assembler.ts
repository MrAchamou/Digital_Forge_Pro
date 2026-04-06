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

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      log(`ZIP assemblé: ${zipFilename} (${archive.pointer()} bytes)`, 'zip-assembler');
      resolve(zipPath);
    });

    archive.on('error', reject);
    archive.pipe(output);

    archive.append(svgContent, { name: 'signature.svg' });
    archive.append(pngBuffer, { name: 'signature-fallback.png' });
    archive.append(outlookHtml, { name: 'signature-outlook.htm' });
    archive.append(gmailHtml, { name: 'signature-gmail.html' });
    archive.append(gmailPdfBuffer, { name: 'instructions-gmail.pdf' });
    archive.append(outlookPdfBuffer, { name: 'instructions-outlook.pdf' });
    archive.append(applePdfBuffer, { name: 'instructions-apple-mail.pdf' });
    archive.append(configJson, { name: 'config.json' });
    archive.append(readmeTxt, { name: 'LISEZ-MOI.txt' });

    archive.finalize();
  });
}
