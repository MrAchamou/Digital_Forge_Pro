import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { log } from '../vite';
import type { InstructionsContent } from './cerebras-content-generator';

const MARGIN = 50;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 45;
const HEADER_H = 80;
const SAFE_BOTTOM = PAGE_H - FOOTER_H - 20;

// Largeur et hauteur de l'aperçu SVG dans le PDF (ratio 10:3)
const PREVIEW_W = CONTENT_W;
const PREVIEW_H = Math.round(PREVIEW_W * 0.3);

export async function generateInstructionsPdf(
  instructions: InstructionsContent,
  clientName: string,
  clientEntreprise: string,
  signatureId: string,
  svgContent: string,
  palette: string[]
): Promise<Buffer> {
  // ── Pré-conversion SVG → PNG pour l'aperçu dans le PDF ──
  let svgPreviewBuffer: Buffer | null = null;
  try {
    svgPreviewBuffer = await sharp(Buffer.from(svgContent))
      .resize(Math.round(PREVIEW_W * 2), Math.round(PREVIEW_H * 2)) // 2× pour la densité
      .png({ quality: 90 })
      .toBuffer();
  } catch (err) {
    log(`Aperçu SVG non disponible dans le PDF (non bloquant): ${err}`, 'pdf-generator');
    svgPreviewBuffer = null;
  }

  return new Promise((resolve, reject) => {
    const [bg, accent] = palette.length >= 3 ? palette : ['#0f0f0f', '#6366f1', '#e8e8ff'];
    const accentRgb = hexToRgb(accent) || [99, 102, 241];
    const bgRgb    = hexToRgb(bg)     || [15, 23, 42];

    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      autoFirstPage: false,
      info: {
        Title:   instructions.titre,
        Author:  'EffectForge AI',
        Subject: `Instructions — ${clientName} — ${clientEntreprise}`,
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data',  (chunk: Buffer) => chunks.push(chunk));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    let pageNum = 0;
    let y = 0;

    // ── helpers ──────────────────────────────────────────────────────────────

    function drawBackground() {
      doc.rect(0, 0, PAGE_W, PAGE_H).fill(bgToColor(bgRgb));
    }

    function drawHeader(isFirst: boolean) {
      doc.rect(0, 0, PAGE_W, HEADER_H).fill(accentToColor(accentRgb, 0.15));

      doc.fillColor(accentToColor(accentRgb))
         .fontSize(10).font('Helvetica-Bold')
         .text('EffectForge AI', MARGIN, 25);
      doc.fillColor('#ffffff')
         .fontSize(8).font('Helvetica')
         .text('God Tier Signatures', MARGIN, 40);

      if (isFirst) {
        doc.fillColor('#ffffff')
           .fontSize(11).font('Helvetica-Bold')
           .text(clientName, MARGIN, 58);
        doc.fillColor(accentToColor(accentRgb))
           .fontSize(9).font('Helvetica')
           .text(clientEntreprise, MARGIN, 72, { lineBreak: false });
      } else {
        doc.fillColor(lightColor(0.4))
           .fontSize(9).font('Helvetica-Oblique')
           .text(`${instructions.titre} (suite)`, MARGIN, 55, { lineBreak: false });
      }

      if (pageNum > 0) {
        doc.fillColor(lightColor(0.3))
           .fontSize(8).font('Helvetica')
           .text(`Page ${pageNum + 1}`, PAGE_W - MARGIN - 40, 35, { lineBreak: false });
      }
    }

    function drawFooter() {
      const fy = PAGE_H - FOOTER_H;
      doc.rect(0, fy - 5, PAGE_W, FOOTER_H + 5).fill(accentToColor(accentRgb, 0.1));
      doc.moveTo(MARGIN, fy - 5).lineTo(PAGE_W - MARGIN, fy - 5)
         .lineWidth(0.5).strokeColor(accentToColor(accentRgb, 0.4)).stroke();

      doc.fillColor(lightColor(0.4))
         .fontSize(8).font('Helvetica')
         .text(`ID: ${signatureId}`, MARGIN, fy + 2, { lineBreak: false });
      doc.text(
        new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' }),
        PAGE_W - MARGIN - 150, fy + 2,
        { align: 'right', width: 150 }
      );
    }

    function addPage() {
      doc.addPage({ size: 'A4', margin: MARGIN });
      pageNum++;
      drawBackground();
      drawHeader(pageNum === 1);
      drawFooter();
      y = HEADER_H + 20;
    }

    function ensureSpace(needed: number) {
      if (y + needed > SAFE_BOTTOM) addPage();
    }

    // ── PREMIÈRE PAGE ────────────────────────────────────────────────────────
    addPage();

    // Titre principal
    ensureSpace(60);
    doc.fillColor('#ffffff')
       .fontSize(20).font('Helvetica-Bold')
       .text(instructions.titre, MARGIN, y);
    y += 32;

    // Ligne déco
    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y)
       .lineWidth(1).strokeColor(accentToColor(accentRgb)).stroke();
    y += 14;

    // ── APERÇU DE LA SIGNATURE ──────────────────────────────────────────────
    if (svgPreviewBuffer) {
      const previewBlockH = PREVIEW_H + 50;
      ensureSpace(previewBlockH);

      // Encadré titre section
      doc.fillColor(accentToColor(accentRgb, 0.12))
         .rect(MARGIN, y, CONTENT_W, 22).fill();
      doc.fillColor(accentToColor(accentRgb))
         .fontSize(9).font('Helvetica-Bold')
         .text('APERÇU DE VOTRE SIGNATURE', MARGIN + 8, y + 6);
      y += 28;

      // Image PNG de la signature
      try {
        doc.image(svgPreviewBuffer, MARGIN, y, { width: PREVIEW_W, height: PREVIEW_H });
        y += PREVIEW_H + 6;
      } catch {
        // Si l'embed image échoue on passe silencieusement
      }

      // Mention sous l'aperçu
      doc.fillColor(lightColor(0.3))
         .fontSize(8).font('Helvetica-Oblique')
         .text('Rendu approximatif — voir le fichier SVG pour l\'animation complète', MARGIN, y);
      y += 22;

      // Ligne séparatrice
      doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y)
         .lineWidth(0.5).strokeColor(lightColor(0.15)).stroke();
      y += 16;
    }

    // Intro
    const introH = doc.heightOfString(instructions.intro, { width: CONTENT_W });
    ensureSpace(introH + 20);
    doc.fillColor(lightColor())
       .fontSize(11).font('Helvetica')
       .text(instructions.intro, MARGIN, y, { width: CONTENT_W, lineGap: 4 });
    y += introH + 20;

    // ── ÉTAPES ───────────────────────────────────────────────────────────────
    for (const etape of instructions.etapes) {
      const titreH   = doc.heightOfString(etape.titre,       { width: CONTENT_W - 40 });
      const descH    = doc.heightOfString(etape.description,  { width: CONTENT_W - 40 });
      const conseilH = etape.conseil
        ? doc.heightOfString(`> ${etape.conseil}`, { width: CONTENT_W - 40 }) + 12
        : 0;
      const blockH = 24 + titreH + descH + conseilH + 24;

      ensureSpace(blockH);

      // Cercle numéro
      doc.circle(MARGIN + 16, y + 10, 13).fill(accentToColor(accentRgb));
      doc.fillColor('#ffffff')
         .fontSize(11).font('Helvetica-Bold')
         .text(String(etape.numero), MARGIN + 11, y + 4);

      // Titre étape
      doc.fillColor('#ffffff')
         .fontSize(12).font('Helvetica-Bold')
         .text(etape.titre, MARGIN + 38, y, { width: CONTENT_W - 38 });
      y += Math.max(titreH, 22) + 4;

      // Description
      doc.fillColor(lightColor())
         .fontSize(10).font('Helvetica')
         .text(etape.description, MARGIN + 38, y, { width: CONTENT_W - 38, lineGap: 2 });
      y += descH + 8;

      // Conseil (astuce pro)
      if (etape.conseil) {
        doc.rect(MARGIN + 38, y, CONTENT_W - 38, 1).fill(accentToColor(accentRgb, 0.3));
        y += 5;
        doc.fillColor(accentToColor(accentRgb))
           .fontSize(9).font('Helvetica-Oblique')
           .text(`> ${etape.conseil}`, MARGIN + 38, y, { width: CONTENT_W - 38 });
        y += doc.heightOfString(`> ${etape.conseil}`, { width: CONTENT_W - 38 }) + 18;
      } else {
        y += 14;
      }
    }

    // ── NOTE FINALE ──────────────────────────────────────────────────────────
    if (instructions.note_finale) {
      const noteH = doc.heightOfString(instructions.note_finale, { width: CONTENT_W });
      ensureSpace(noteH + 28);

      doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y)
         .lineWidth(0.5).strokeColor(lightColor(0.2)).stroke();
      y += 14;

      doc.fillColor(lightColor(0.6))
         .fontSize(10).font('Helvetica-Oblique')
         .text(instructions.note_finale, MARGIN, y, { width: CONTENT_W });
    }

    doc.end();
    log(`PDF généré (${pageNum} page(s)): ${instructions.titre}${svgPreviewBuffer ? ' [avec aperçu]' : ''}`, 'pdf-generator');
  });
}

// ── Helpers couleur ──────────────────────────────────────────────────────────

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
