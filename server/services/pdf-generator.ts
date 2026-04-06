import PDFDocument from 'pdfkit';
import { log } from '../vite';
import type { InstructionsContent } from './cerebras-content-generator';

export async function generateInstructionsPdf(
  instructions: InstructionsContent,
  clientName: string,
  clientEntreprise: string,
  signatureId: string,
  svgContent: string,
  palette: string[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const [bg, accent] = palette.length >= 3 ? palette : ['#0f0f0f', '#6366f1', '#e8e8ff'];

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: instructions.titre,
        Author: 'EffectForge AI',
        Subject: `Instructions — ${clientName} — ${clientEntreprise}`,
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const accentRgb = hexToRgb(accent) || [99, 102, 241];
    const bgRgb = hexToRgb(bg) || [15, 23, 42];

    // ── FOND ──
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(bgToColor(bgRgb));

    // ── EN-TÊTE ──
    doc.rect(0, 0, doc.page.width, 80).fill(accentToColor(accentRgb, 0.15));

    // Logo texte EffectForge AI
    doc.fillColor(accentToColor(accentRgb))
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('EffectForge AI', 50, 25);

    doc.fillColor('#ffffff')
       .fontSize(8)
       .font('Helvetica')
       .text('God Tier Signatures™', 50, 40);

    // Infos client
    doc.fillColor('#ffffff')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(clientName, 50, 58);

    doc.fillColor(accentToColor(accentRgb))
       .fontSize(9)
       .font('Helvetica')
       .text(clientEntreprise, 50, 72, { lineBreak: false });

    // ── TITRE PRINCIPAL ──
    doc.moveDown(4);
    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(instructions.titre, 50, 100);

    // Ligne déco
    doc.moveTo(50, 128)
       .lineTo(doc.page.width - 50, 128)
       .lineWidth(1)
       .strokeColor(accentToColor(accentRgb))
       .stroke();

    // ── INTRO ──
    doc.fillColor(lightColor())
       .fontSize(11)
       .font('Helvetica')
       .text(instructions.intro, 50, 140, { width: doc.page.width - 100, lineGap: 4 });

    // ── ÉTAPES ──
    let y = 175;

    for (const etape of instructions.etapes) {
      if (y > doc.page.height - 120) break;

      // Cercle numéro
      doc.circle(66, y + 8, 12)
         .fill(accentToColor(accentRgb));

      doc.fillColor('#ffffff')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(String(etape.numero), 61, y + 2);

      // Titre étape
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(etape.titre, 90, y, { width: doc.page.width - 140 });

      y += 20;

      // Description
      doc.fillColor(lightColor())
         .fontSize(10)
         .font('Helvetica')
         .text(etape.description, 90, y, { width: doc.page.width - 140, lineGap: 2 });

      y += doc.heightOfString(etape.description, { width: doc.page.width - 140 }) + 8;

      // Conseil
      if (etape.conseil) {
        doc.rect(90, y, doc.page.width - 140, 1).fill(accentToColor(accentRgb, 0.3));
        y += 4;
        doc.fillColor(accentToColor(accentRgb))
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text(`💡 ${etape.conseil}`, 90, y, { width: doc.page.width - 140 });
        y += doc.heightOfString(etape.conseil, { width: doc.page.width - 140 }) + 16;
      } else {
        y += 12;
      }
    }

    // ── NOTE FINALE ──
    if (instructions.note_finale && y < doc.page.height - 80) {
      doc.moveTo(50, y)
         .lineTo(doc.page.width - 50, y)
         .lineWidth(0.5)
         .strokeColor(lightColor(0.2))
         .stroke();

      y += 12;
      doc.fillColor(lightColor(0.6))
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text(instructions.note_finale, 50, y, { width: doc.page.width - 100 });
    }

    // ── PIED DE PAGE ──
    const footerY = doc.page.height - 45;
    doc.rect(0, footerY - 5, doc.page.width, 50).fill(accentToColor(accentRgb, 0.1));
    doc.moveTo(50, footerY - 5).lineTo(doc.page.width - 50, footerY - 5)
       .lineWidth(0.5).strokeColor(accentToColor(accentRgb, 0.4)).stroke();

    doc.fillColor(lightColor(0.4))
       .fontSize(8)
       .font('Helvetica')
       .text(`ID: ${signatureId}`, 50, footerY + 2, { lineBreak: false });

    doc.text(new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' }),
             doc.page.width - 200, footerY + 2, { align: 'right', width: 150 });

    doc.end();
    log(`PDF généré: ${instructions.titre}`, 'pdf-generator');
  });
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return null;
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

function accentToColor(rgb: [number, number, number], opacity?: number): string {
  if (opacity !== undefined) return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

function bgToColor(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

function lightColor(opacity = 0.85): string {
  return `rgba(232,232,255,${opacity})`;
}
