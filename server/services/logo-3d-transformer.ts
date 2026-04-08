import sharp from 'sharp';
import { log } from '../vite';

const DEPTH_LAYERS = 10;
const STEP_PX = 2;
const SHADOW_EXTRA = 6;

/**
 * Logo 3D Pipeline — Pseudo-extrusion engine
 *
 * Appliqué dès la capture du logo (post-scraping),
 * avant toute injection d'effets spéciaux.
 *
 * Effet produit :
 *  - Ombre portée douce (blurred, décalée bas-droite)
 *  - Couches d'extrusion progressives (fond sombre → clair)
 *  - Logo original net au premier plan
 *
 * @param logoBase64  data URI du logo original (data:image/...;base64,...)
 * @returns           data URI PNG avec effet 3D appliqué
 */
export async function applyLogo3D(logoBase64: string): Promise<string> {
  if (!logoBase64 || !logoBase64.startsWith('data:')) return logoBase64;

  try {
    const match = logoBase64.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) return logoBase64;

    const inputBuffer = Buffer.from(match[2], 'base64');

    const meta = await sharp(inputBuffer).metadata();
    const W = meta.width  || 256;
    const H = meta.height || 256;

    const totalOffset = DEPTH_LAYERS * STEP_PX;
    const FW = W + totalOffset + SHADOW_EXTRA;
    const FH = H + totalOffset + SHADOW_EXTRA;

    const logoBuffer = await sharp(inputBuffer)
      .ensureAlpha()
      .png()
      .toBuffer();

    const layers: sharp.OverlayOptions[] = [];

    // ── 1. Ombre portée ────────────────────────────────────────────────────────
    const shadowBuffer = await sharp(logoBuffer)
      .modulate({ brightness: 0.12, saturation: 0 })
      .blur(SHADOW_EXTRA)
      .png()
      .toBuffer();

    layers.push({
      input: shadowBuffer,
      left: totalOffset + SHADOW_EXTRA,
      top:  totalOffset + SHADOW_EXTRA,
      blend: 'over',
    });

    // ── 2. Couches d'extrusion (fond → surface) ────────────────────────────────
    for (let i = 0; i < DEPTH_LAYERS; i++) {
      const offsetX = (DEPTH_LAYERS - i) * STEP_PX;
      const offsetY = (DEPTH_LAYERS - i) * STEP_PX;

      // Progression : sombre au fond (i=0), plus clair vers le devant (i=DEPTH-1)
      const brightness = 0.18 + (i / (DEPTH_LAYERS - 1)) * 0.52;
      // Légère désaturation pour donner l'effet de profondeur
      const saturation = 0.4 + (i / (DEPTH_LAYERS - 1)) * 0.6;

      const layerBuffer = await sharp(logoBuffer)
        .modulate({ brightness, saturation })
        .png()
        .toBuffer();

      layers.push({
        input: layerBuffer,
        left:  offsetX,
        top:   offsetY,
        blend: 'over',
      });
    }

    // ── 3. Logo original au premier plan (position 0,0) ───────────────────────
    layers.push({
      input: logoBuffer,
      left:  0,
      top:   0,
      blend: 'over',
    });

    // ── 4. Composition finale sur fond transparent ────────────────────────────
    const result = await sharp({
      create: {
        width:      FW,
        height:     FH,
        channels:   4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(layers)
      .png({ compressionLevel: 7 })
      .toBuffer();

    const resultB64 = result.toString('base64');
    log(
      `✅ Logo 3D: ${W}x${H} → ${FW}x${FH} | ` +
      `${DEPTH_LAYERS} couches | ${Math.round(resultB64.length / 1024)}KB`,
      'logo-3d'
    );

    return `data:image/png;base64,${resultB64}`;

  } catch (err: any) {
    log(`⚠️  Logo 3D échoué — fallback original: ${err.message}`, 'logo-3d');
    return logoBase64;
  }
}
