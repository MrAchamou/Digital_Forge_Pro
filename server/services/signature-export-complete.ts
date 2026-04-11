import sharp from 'sharp';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';
import { log } from '../vite';
import type { SectorConfig } from './signature-renderer';
import { selectEffectsForSector, renderEffectLayer, buildEffectCtx } from './gif-effect-engine';
import { buildLogoLivingSystem, buildLogoGifFrame } from './logo-living-system';
import { buildCorpNameLivingSystem } from './corp-name-living-system';
import { buildCTALivingSystem } from './cta-living-system';
import { buildContactInfoLivingSystem } from './contact-info-living-system';

// ── Dossier de stockage des assets hébergés ───────────────────────────────────
const SIG_ASSETS_DIR = path.join(process.cwd(), 'exports', 'hosted');

async function ensureSigDir() {
  await fs.promises.mkdir(SIG_ASSETS_DIR, { recursive: true });
}

// ── Sauvegarde des assets sur disque (pour hébergement public) ────────────────
export async function saveSignatureAssets(signatureId: string, assets: {
  gifBuffer: Buffer;
  svgContent: string;
  pngBuffer: Buffer;
}): Promise<void> {
  await ensureSigDir();
  await Promise.all([
    fs.promises.writeFile(path.join(SIG_ASSETS_DIR, `${signatureId}.gif`), assets.gifBuffer),
    fs.promises.writeFile(path.join(SIG_ASSETS_DIR, `${signatureId}.svg`), assets.svgContent, 'utf-8'),
    fs.promises.writeFile(path.join(SIG_ASSETS_DIR, `${signatureId}.png`), assets.pngBuffer),
  ]);
  log(`Assets hébergés sauvegardés: ${signatureId} (gif+svg+png)`, 'export-complete');
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExportMetadata {
  nom: string;
  titre: string;
  entreprise: string;
  email?: string;
  telephone?: string;
  site?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  note?: number;
  logo_url?: string;
  secteur: string;
  palette: string[];
  cta?: string;
  [key: string]: any;
}

export interface CompleteExportResult {
  signatureId: string;
  formats: {
    gmail:      { html: string; filename: string };
    outlook:    { html: string; filename: string };
    appleMail:  { html: string; filename: string };
    universal:  { html: string; filename: string };
    animatedSvg:{ svg: string; filename: string };
    staticPng:  { buffer: Buffer; filename: string };
    animatedGif:{ buffer: Buffer; filename: string };
  };
  guide: { html: string; filename: string };
  zip:   { buffer: Buffer; filename: string };
}

// ── Helpers couleur ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [15, 15, 31];
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const c = (v: number) => Math.min(255, Math.max(0, v + amount)).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function hex2hsl(hex: string): [number, number, number] {
  if (!hex || hex.length < 7) return [0, 0, 50];
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const l2 = (max+min)/2;
  if (max===min) return [0, 0, Math.round(l2*100)];
  const d = max-min;
  const s2 = l2 > 0.5 ? d/(2-max-min) : d/(max+min);
  const h2 = max===r ? (g-b)/d+(g<b?6:0) : max===g ? (b-r)/d+2 : (r-g)/d+4;
  return [Math.round(h2*60), Math.round(s2*100), Math.round(l2*100)];
}

function escXml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Génération SVG de base (inline, sans animation externe) ──────────────────

function buildSignatureSVGBase(meta: ExportMetadata, animated = false): string {
  const { nom = 'Prénom Nom', titre = 'Titre', entreprise = 'Entreprise',
          email = '', telephone = '', site = '', adresse = '', ville = '',
          code_postal = '', note, logo_url, cta = 'Nous contacter',
          palette = [] } = meta;

  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const accentLight = lighten(accent, 60);
  const textMuted = `${textColor}99`;

  // ── Couleurs dérivées pour le gradient cyclique (effet NEXUS COMMAND) ───────
  const [h, s, l] = hex2hsl(accent.length === 7 ? accent : '#6366f1');
  const gradCol1 = accentLight;
  const gradCol2 = accent;
  const gradCol3 = `hsl(${(h + 80) % 360},${s}%,${Math.min(85, l + 20)}%)`;
  const gradCol4 = `hsl(${(h + 160) % 360},${s}%,${l}%)`;
  const gradCol5 = `hsl(${(h + 240) % 360},${s}%,${Math.min(85, l + 15)}%)`;
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');
  const noteStars = note ? '★'.repeat(Math.floor(note)) : '';

  const breatheAttr = animated
    ? `<animateTransform attributeName="transform" type="scale" values="1;1.025;1" dur="2.8s" repeatCount="indefinite" additive="sum"/>`
    : '';
  const glowAttr = animated
    ? `<animate attributeName="opacity" values="0.35;0.75;0.35" dur="2.8s" repeatCount="indefinite"/>`
    : '';
  const fadeInName = animated
    ? `<animate attributeName="opacity" values="0;1" dur="0.8s" fill="freeze"/>`
    : '';
  const typewriterAttr = animated
    ? `<animate attributeName="clip-path" from="inset(0 100% 0 0)" to="inset(0 0% 0 0)" dur="1.4s" begin="0.5s" fill="freeze"/>`
    : '';

  // ── Logo Living System — 8 effets avec transitions fluides ────────────────
  const lls = animated
    ? buildLogoLivingSystem(50, accent, accentLight, palette, meta.secteur ?? 'default', 'A')
    : { defsHtml: '', stylesCSS: '', elements: '', innerWrap: { openTag: '<g>', closeTag: '</g>' } };

  // ── Corp Name Living System — effets orchestrés sur le nom d'entreprise ───
  const cnls = buildCorpNameLivingSystem(
    entreprise, accent, accentLight, meta.secteur ?? 'default', 'A', animated
  );

  // ── CTA Living System — 9 effets spectaculaires sur le bouton CTA ─────────
  const ctals = buildCTALivingSystem(
    cta, accent, accentLight, meta.secteur ?? 'default', 'A', animated
  );

  // ── Positions Y séquentielles — chaque champ présent occupe sa propre ligne ──
  // Espacement fixe 17px, aucun chevauchement possible quelle que soit la combinaison.
  const _DY = 17, _Y0 = 99;
  const yPhone = _Y0;
  const yEmail = _Y0 + (telephone    ? 1 : 0) * _DY;
  const yAddr  = _Y0 + (telephone    ? 1 : 0) * _DY + (email       ? 1 : 0) * _DY;
  const ySite  = _Y0 + (telephone    ? 1 : 0) * _DY + (email       ? 1 : 0) * _DY + (addressLine ? 1 : 0) * _DY;
  const yNote  = _Y0 + (telephone    ? 1 : 0) * _DY + (email       ? 1 : 0) * _DY + (addressLine ? 1 : 0) * _DY + (site ? 1 : 0) * _DY;

  // ── Contact Info Living System — Titre + Séparateurs + Contacts animés ────
  const cils = buildContactInfoLivingSystem(
    {
      titre, telephone, email, addressLine, site,
      note, noteStars,
      accent, accentLight, textColor, textMuted,
      yPhone, yEmail, yAddr, ySite, yNote,
    },
    meta.secteur ?? 'default',
    animated,
  );

  // ── Gradient cyclique pour le nom de l'entreprise (fallback statique) ─────
  const corpGradDef = `
    <linearGradient id="sg-corp-grad" x1="100" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="${gradCol1}"/>
      <stop offset="20%"  stop-color="${gradCol2}"/>
      <stop offset="40%"  stop-color="${gradCol3}"/>
      <stop offset="65%"  stop-color="${gradCol4}"/>
      <stop offset="85%"  stop-color="${gradCol5}"/>
      <stop offset="100%" stop-color="${gradCol1}"/>
      ${animated ? `<animateTransform attributeName="gradientTransform" type="translate" from="-400 0" to="400 0" dur="4s" repeatCount="indefinite"/>` : ''}
    </linearGradient>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 600 190" width="600" height="190">
  <defs>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accentLight}"/>
    </linearGradient>
    ${corpGradDef}
    ${cnls.filterDefs}
    ${ctals.filterDefs}
    ${cils.filterDefs}
    ${logo_url ? `<clipPath id="avatarLogoClip"><circle cx="0" cy="0" r="44"/></clipPath>` : ''}
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${lls.defsHtml}
    ${animated ? `<style>${lls.stylesCSS}${cnls.stylesCSS}${ctals.stylesCSS}${cils.stylesCSS}
    /* ── VarianceEngine Background — particules stellaires + scan diagonal ── */
    @keyframes vbg-twinkle { 0%,100%{opacity:0;transform:scale(0.4)} 50%{opacity:1;transform:scale(1)} }
    @keyframes vbg-drift   { 0%{transform:translate(0,0)} 50%{transform:translate(4px,-3px)} 100%{transform:translate(0,0)} }
    @keyframes vbg-scan    { 0%{transform:translateX(-80px) skewX(-12deg);opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{transform:translateX(680px) skewX(-12deg);opacity:0} }
    </style>` : ''}
  </defs>

  <!-- Background -->
  <rect width="600" height="190" fill="${bg}" rx="10"/>

  <!-- VarianceEngine — Fond stellaire spectaculaire (seed déterministe, 24 particules) -->
  ${animated ? (() => {
    const rng = (s: number) => { const x = Math.sin(s * 127.1 + 1.9) * 43758.5453; return x - Math.floor(x); };
    const ar2 = parseInt(accentLight.slice(1,3)||'99',16);
    const ag3 = parseInt(accentLight.slice(3,5)||'99',16);
    const ab2 = parseInt(accentLight.slice(5,7)||'ff',16);
    const aLight = `rgba(${ar2},${ag3},${ab2}`;
    const particles = Array.from({ length: 24 }, (_, i) => {
      const cx  = Math.round(80 + rng(i * 3.71) * 510);
      const cy  = Math.round(8  + rng(i * 7.33) * 174);
      const r   = (0.5 + rng(i * 5.11) * 2.2).toFixed(1);
      const dur = (2.8 + rng(i * 2.97) * 5.5).toFixed(1);
      const del = (rng(i * 11.3) * 5.0).toFixed(1);
      const op  = (0.12 + rng(i * 4.73) * 0.28).toFixed(2);
      const driftDur = (4.0 + rng(i * 1.77) * 6.0).toFixed(1);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${aLight},${op})" style="animation:vbg-twinkle ${dur}s ease-in-out ${del}s infinite,vbg-drift ${driftDur}s ease-in-out ${del}s infinite;"/>`;
    }).join('');
    const scanDelay1 = '0s', scanDelay2 = '6s', scanDelay3 = '12s';
    const scanDur = '18s';
    return `<g id="variance-bg-particles">${particles}</g>
  <rect x="-80" y="0" width="60" height="190" fill="url(#accentGrad)" opacity="0.06" style="animation:vbg-scan ${scanDur} ease-in-out ${scanDelay1} infinite;"/>
  <rect x="-80" y="0" width="40" height="190" fill="url(#accentGrad)" opacity="0.04" style="animation:vbg-scan ${scanDur} ease-in-out ${scanDelay2} infinite;"/>
  <rect x="-80" y="0" width="25" height="190" fill="url(#accentGrad)" opacity="0.03" style="animation:vbg-scan ${scanDur} ease-in-out ${scanDelay3} infinite;"/>`;
  })() : ''}

  <!-- Glow de fond (barre accent) -->
  <rect x="0" y="0" width="4" height="190" fill="url(#accentGrad)" rx="2">${glowAttr}</rect>

  <!-- Avatar cercle + Logo Living System -->
  <g transform="translate(24,95)">
    <!-- Effets logo derrière le cercle (Lighting + Morphing + cycle LLS) -->
    ${lls.elements}
    <!-- PhysicsEngine wrapper (float / bounce / pendulum selon secteur) -->
    ${lls.innerWrap?.openTag ?? '<g>'}
    <!-- Cercle avatar principal -->
    <circle r="50" fill="${accent}18" stroke="${accent}" stroke-width="1.5">${breatheAttr}</circle>
    <!-- Logo ou initiales -->
    ${logo_url
      ? `<image href="${escXml(logo_url)}" x="-44" y="-44" width="88" height="88" clip-path="url(#avatarLogoClip)" preserveAspectRatio="xMidYMid meet"/>`
      : `<text text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="${accent}">${escXml(initials)}</text>`
    }
    ${lls.innerWrap?.closeTag ?? '</g>'}
  </g>

  <!-- ENTREPRISE — Corp Name Living System (gradient + halo + typewriter + glitch) -->
  ${animated
    ? `<g transform="translate(124, 36)">${cnls.groupSVG}</g>`
    : `<text x="124" y="36" font-family="Arial,sans-serif" font-size="21" font-weight="900"
         fill="url(#sg-corp-grad)" letter-spacing="1">${escXml(entreprise.toUpperCase())}</text>`
  }

  <!-- NOM -->
  <text x="124" y="56" font-family="Arial,sans-serif" font-size="14" font-weight="700"
    fill="${textColor}" opacity="0">
    ${escXml(nom)}${fadeInName}
  </text>

  ${animated && cils.groupSVG
    ? /* Contact Info Living System — Titre + Séps + Contacts + Site + Étoiles animés */ cils.groupSVG
    : /* ── Fallback statique ─────────────────────────────────────────────────────── */ `
  <!-- Séparateur vertical (statique) — x=108 : 34px de marge depuis le bord droit de l'avatar (r=50,cx=24→74) -->
  <rect x="108" y="16" width="1.5" height="158" fill="${accent}" opacity="0.3" rx="1"/>

  <!-- TITRE (statique) -->
  <text x="124" y="71" font-family="Arial,sans-serif" font-size="10" font-weight="600"
    fill="${accent}" letter-spacing="1.5">
    ${escXml(titre.toUpperCase())}
  </text>

  <!-- Ligne séparatrice (statique) -->
  <line x1="124" y1="82" x2="568" y2="82" stroke="${accent}" stroke-width="0.8" opacity="0.25"/>

  ${telephone ? `<text x="124" y="${yPhone}" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="0.8">☎ ${escXml(telephone)}</text>` : ''}
  ${email     ? `<text x="124" y="${yEmail}" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="0.8">✉ ${escXml(email)}</text>` : ''}
  ${addressLine ? `<text x="124" y="${yAddr}" font-family="Arial,sans-serif" font-size="10" fill="${textMuted}">📍 ${escXml(addressLine)}</text>` : ''}
  ${site      ? `<text x="124" y="${ySite}" font-family="Arial,sans-serif" font-size="10" fill="${accent}">🌐 ${escXml(site.replace(/^https?:\/\//, ''))}</text>` : ''}
  ${noteStars ? `<text x="124" y="${yNote}" font-family="Arial,sans-serif" font-size="12" fill="#f59e0b">${noteStars} ${note?.toFixed(1)}</text>` : ''}`
  }

  <!-- CTA bouton — CTA Living System (9 effets) ou fallback statique -->
  ${animated && ctals.groupSVG
    ? ctals.groupSVG
    : `<g transform="translate(380, 140)">
    <rect width="148" height="32" rx="6" fill="${accent}" opacity="0.92"/>
    <text x="74" y="21" text-anchor="middle" font-family="Arial,sans-serif" font-size="11"
      font-weight="700" fill="#ffffff">${escXml(cta)}</text>
  </g>`
  }
</svg>`;
}

// ── 1. SVG Animé SMIL (embed en <img> → anime dans Gmail, Apple, iOS) ────────

export function buildAnimatedSVG(meta: ExportMetadata): string {
  return buildSignatureSVGBase(meta, true);
}

// ── 2. PNG Statique (fallback universel) ─────────────────────────────────────

export async function buildStaticPng(meta: ExportMetadata): Promise<Buffer> {
  const svg = buildSignatureSVGBase(meta, false);
  try {
    return await sharp(Buffer.from(svg)).resize(600, 180).png({ quality: 95 }).toBuffer();
  } catch (err: any) {
    log(`Sharp PNG error: ${err.message}`, 'export-complete');
    // Fallback minimal
    const fb = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180">
      <rect width="600" height="180" fill="${meta.palette?.[0] || '#0f172a'}"/>
      <text x="300" y="90" text-anchor="middle" font-family="Arial" font-size="20"
        fill="${meta.palette?.[2] || '#e8e8ff'}">${escXml(meta.nom)} — ${escXml(meta.entreprise)}</text>
    </svg>`;
    return sharp(Buffer.from(fb)).png().toBuffer();
  }
}

// ── 3. GIF Animé Spectaculaire — Triple-Phase Engine ─────────────────────────
//
//  Phase 1 BUILD  (frames  0-15) : avatar rings expansion, text reveal sweep
//  Phase 2 LIVE   (frames 16-35) : multi-ring breathing, floating particles, CTA pulse
//  Phase 3 SHINE  (frames 36-47) : diagonal light sweep, avatar burst, CTA flash
//
//  48 frames × 65ms ≈ 17fps → loop de 3.1s ultra-fluide

export async function buildAnimatedGif(meta: ExportMetadata): Promise<Buffer> {
  const [bg, accent] = meta.palette?.length >= 2 ? meta.palette : ['#0f172a', '#6366f1'];
  const textColor    = meta.palette?.[2] || '#e8e8ff';

  const { nom = '', titre = '', entreprise = '', telephone = '', email = '',
          adresse = '', code_postal = '', ville = '', site = '', note,
          logo_url, cta = 'Nous contacter' } = meta;

  const initials    = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');
  const noteStars   = note ? '★'.repeat(Math.floor(note)) : '';
  const textMuted   = `${textColor}99`;
  const accentLight = lighten(accent, 50);
  const [ar, ag2, ab] = hexToRgb(accent);

  // ─ Helper : couleur accent avec alpha
  const aRgba = (alpha: number) => `rgba(${ar},${ag2},${ab},${alpha.toFixed(2)})`;

  // ─ Sélection des effets SVG selon le secteur de la signature
  const activeEffects = selectEffectsForSector(meta.secteur || '');
  log(`GIF Effects actifs: ${activeEffects.length} effets pour secteur "${meta.secteur}"`, 'export-complete');

  // ─ Positions Y séquentielles (GIF) — espacement 17px, zéro chevauchement
  const _DGIF = 17, _Y0GIF = 113;
  const yPhone = _Y0GIF;
  const yEmail = _Y0GIF + (telephone    ? 1 : 0) * _DGIF;
  const yAddr  = _Y0GIF + (telephone    ? 1 : 0) * _DGIF + (email       ? 1 : 0) * _DGIF;
  const ySite  = _Y0GIF + (telephone    ? 1 : 0) * _DGIF + (email       ? 1 : 0) * _DGIF + (addressLine ? 1 : 0) * _DGIF;
  const yNote  = _Y0GIF + (telephone    ? 1 : 0) * _DGIF + (email       ? 1 : 0) * _DGIF + (addressLine ? 1 : 0) * _DGIF + (site ? 1 : 0) * _DGIF;

  // ─ Particules fixes (seed déterministe)
  const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
    x:  120 + ((i * 137.5) % 430),
    y:  10  + ((i * 97.3)  % 160),
    r:  1 + (i % 3) * 0.8,
    speed: 0.3 + (i % 5) * 0.15,
    phase: (i * 0.52) % (2 * Math.PI),
  }));

  const TOTAL   = 48;
  const PH_BUILD = 16;   // frames 0-15
  const PH_LIVE  = 36;   // frames 16-35
  // frames 36-47 → SHINE

  const frames: Buffer[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const tGlobal = i / TOTAL; // 0→1 boucle complète

    // ── Phase tags
    const inBuild = i < PH_BUILD;
    const inLive  = i >= PH_BUILD && i < PH_LIVE;
    const inShine = i >= PH_LIVE;

    const tBuild = inBuild ? i / PH_BUILD : 1;
    const tLive  = inLive  ? (i - PH_BUILD) / (PH_LIVE - PH_BUILD) : (inShine ? 1 : 0);
    const tShine = inShine ? (i - PH_LIVE) / (TOTAL - PH_LIVE) : 0;

    // ── Easing ease-out cubic
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const eBuild  = easeOut(tBuild);

    // ── Avatar multi-ring
    const breathe    = inBuild ? 1 : 1 + 0.022 * Math.sin(tGlobal * 2 * Math.PI * 2.5);
    const ring1Scale = breathe;
    const ring2Scale = inBuild ? eBuild * 0.9 : 0.9 + 0.03 * Math.sin(tGlobal * 2 * Math.PI * 1.8 + 0.8);
    const ring3Scale = inBuild ? eBuild * 0.75 : 0.75 + 0.02 * Math.sin(tGlobal * 2 * Math.PI * 3.2 + 1.6);

    const ring1Op = inBuild ? eBuild * 0.55 : 0.45 + 0.2 * Math.abs(Math.sin(tGlobal * Math.PI * 2.5));
    const ring2Op = inBuild ? eBuild * 0.3  : 0.22 + 0.15 * Math.abs(Math.sin(tGlobal * Math.PI * 1.8 + 0.5));
    const ring3Op = inBuild ? eBuild * 0.15 : 0.1  + 0.1  * Math.abs(Math.sin(tGlobal * Math.PI * 3.2 + 1.2));

    const initialsOp = inBuild ? Math.min(1, eBuild * 1.5) : 1;

    // ── Barre accent gauche
    const barH   = inBuild ? eBuild * 180 : 180;
    const barOp  = inBuild ? eBuild : (0.7 + 0.3 * Math.abs(Math.sin(tGlobal * Math.PI * 2)));

    // ── Séparateur vertical
    const sepH   = inBuild ? eBuild * 132 : 132;
    const sepOp  = inBuild ? eBuild * 0.35 : (0.2 + 0.15 * Math.abs(Math.sin(tGlobal * Math.PI * 1.5)));

    // ── Textes – apparition progressive
    const nomOp   = inBuild ? Math.min(1, tBuild * 3) : 1;
    const titreOp = inBuild ? Math.min(1, Math.max(0, (tBuild - 0.2) * 3)) : 1;
    const entOp   = inBuild ? Math.min(1, Math.max(0, (tBuild - 0.4) * 3)) : 1;
    const infoOp  = inBuild ? Math.min(1, Math.max(0, (tBuild - 0.6) * 3)) : 1;

    // ── CTA pulse
    const ctaScale = inBuild
      ? Math.min(1, eBuild)
      : (inShine
        ? 1 + 0.06 * Math.sin(tShine * Math.PI * 4)
        : 1 + 0.025 * Math.abs(Math.sin(tGlobal * Math.PI * 3)));
    const ctaOp   = inBuild ? eBuild : (0.88 + 0.12 * Math.abs(Math.sin(tGlobal * Math.PI * 3)));

    // ── Particules flottantes (actives seulement en LIVE + SHINE)
    const particleOp = inBuild ? 0 : (inLive ? tLive : 1);
    const particleSvg = PARTICLES.map(p => {
      const py = p.y + 4 * Math.sin(tGlobal * 2 * Math.PI * p.speed + p.phase);
      const px = p.x + 2 * Math.cos(tGlobal * 2 * Math.PI * p.speed * 0.7 + p.phase);
      const op = (0.2 + 0.5 * Math.abs(Math.sin(tGlobal * Math.PI * p.speed * 2 + p.phase))) * particleOp;
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${p.r}" fill="${aRgba(op)}" />`;
    }).join('');

    // ── Light sweep diagonal (SHINE uniquement)
    const sweepX    = -100 + tShine * 900;
    const sweepSvg  = inShine ? `
      <defs>
        <linearGradient id="sweep${i}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="white" stop-opacity="0"/>
          <stop offset="50%"  stop-color="white" stop-opacity="${(0.15 * Math.sin(tShine * Math.PI)).toFixed(3)}"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect x="${sweepX.toFixed(0)}" y="0" width="180" height="180"
        fill="url(#sweep${i})" transform="skewX(-15)" rx="0"/>
    ` : '';

    // ── Avatar burst final (SHINE frame 40-47)
    const burstOp = inShine && i >= 42
      ? (0.3 * Math.sin(((i - 42) / 6) * Math.PI)).toFixed(3)
      : '0';
    const burstR  = inShine ? 55 + (i - PH_LIVE) * 3 : 50;

    // ── Ligne séparatrice horizontale
    const lineX2  = inBuild ? 112 + eBuild * 456 : 568;

    // ── Effets SVG premium (GIF Effect Engine)
    const effectCtx = buildEffectCtx({
      frameIdx: i, totalFrames: TOTAL,
      phaseBuildup: PH_BUILD, phaseLive: PH_LIVE,
      accent, bg, textColor,
    });
    const effectLayerSvg = renderEffectLayer(activeEffects, effectCtx);

    const frameSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 600 180" width="600" height="180">
      <defs>
        <linearGradient id="bgGrad${i}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stop-color="${bg}"/>
          <stop offset="100%" stop-color="${lighten(bg, 8)}"/>
        </linearGradient>
        <linearGradient id="barGrad${i}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${accent}"/>
          <stop offset="100%" stop-color="${accentLight}"/>
        </linearGradient>
        <radialGradient id="avatarGlow${i}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${accent}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
        ${logo_url ? `<clipPath id="avatarGifClip${i}"><circle cx="60" cy="90" r="44"/></clipPath>` : ''}
      </defs>

      <!-- Fond -->
      <rect width="600" height="180" fill="url(#bgGrad${i})" rx="10"/>

      <!-- ═══ Calque effets premium SVG ═══ -->
      ${effectLayerSvg}

      <!-- Particules flottantes -->
      ${particleSvg}

      <!-- Sweep lumineux diagonal (SHINE) -->
      ${sweepSvg}

      <!-- Barre accent gauche -->
      <rect x="0" y="${(180 - barH).toFixed(1)}" width="4" height="${barH.toFixed(1)}"
        fill="url(#barGrad${i})" opacity="${barOp.toFixed(2)}" rx="2"/>

      <!-- Logo Living System — effets animés par frame -->
      ${buildLogoGifFrame(i, TOTAL, 60, 90, 50, accent, accentLight)}

      <!-- Avatar — ring externe burst (SHINE) -->
      <circle cx="60" cy="90" r="${burstR}"
        fill="none" stroke="${accent}" stroke-width="0.8"
        opacity="${burstOp}"/>

      <!-- Avatar — ring 3 (halo lointain) -->
      <circle cx="60" cy="90" r="${(50 * ring3Scale).toFixed(2)}"
        fill="none" stroke="${accent}" stroke-width="1"
        opacity="${ring3Op.toFixed(2)}"/>

      <!-- Avatar — ring 2 (orbit intermédiaire) -->
      <circle cx="60" cy="90" r="${(50 * ring2Scale).toFixed(2)}"
        fill="none" stroke="${accent}" stroke-width="1.5"
        opacity="${ring2Op.toFixed(2)}"/>

      <!-- Avatar — ring 1 principal avec glow -->
      <circle cx="60" cy="90" r="${(50 * ring1Scale).toFixed(2)}"
        fill="${aRgba(ring1Op)}" stroke="${accent}" stroke-width="2"
        opacity="1"/>

      <!-- Avatar — radial glow interne -->
      <circle cx="60" cy="90" r="${(44 * ring1Scale).toFixed(2)}"
        fill="url(#avatarGlow${i})" opacity="${ring1Op.toFixed(2)}"/>

      <!-- Avatar — logo ou initiales -->
      ${logo_url
        ? `<image href="${escXml(logo_url)}" x="16" y="46" width="88" height="88"
            preserveAspectRatio="xMidYMid meet" opacity="${initialsOp.toFixed(2)}"
            clip-path="url(#avatarGifClip${i})"/>`
        : `<text x="60" y="90" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial,sans-serif" font-size="22" font-weight="700"
            fill="${accent}" opacity="${initialsOp.toFixed(2)}">${escXml(initials)}</text>`
      }

      <!-- Séparateur vertical — x=108 pour donner plus d'espace au logo -->
      <rect x="108" y="${(24 + (132 - sepH)).toFixed(1)}" width="1.5" height="${sepH.toFixed(1)}"
        fill="${accent}" opacity="${sepOp.toFixed(2)}" rx="1"/>

      <!-- NOM -->
      <text x="124" y="48" font-family="Arial,sans-serif" font-size="18" font-weight="700"
        fill="${textColor}" opacity="${nomOp.toFixed(2)}">${escXml(nom)}</text>

      <!-- TITRE -->
      <text x="124" y="68" font-family="Arial,sans-serif" font-size="11" font-weight="600"
        fill="${accent}" letter-spacing="1.5" opacity="${titreOp.toFixed(2)}">${escXml(titre.toUpperCase())}</text>

      <!-- ENTREPRISE -->
      <text x="124" y="86" font-family="Arial,sans-serif" font-size="12"
        fill="${textMuted}" opacity="${entOp.toFixed(2)}">${escXml(entreprise)}</text>

      <!-- Ligne séparatrice -->
      <line x1="124" y1="96" x2="${lineX2.toFixed(0)}" y2="96"
        stroke="${accent}" stroke-width="0.8" opacity="${(inBuild ? eBuild * 0.25 : 0.25).toFixed(2)}"/>

      <!-- Infos contact -->
      ${telephone ? `<text x="124" y="${yPhone}" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="${infoOp.toFixed(2)}">☎ ${escXml(telephone)}</text>` : ''}
      ${email     ? `<text x="124" y="${yEmail}" font-family="Arial,sans-serif" font-size="11" fill="${textColor}" opacity="${infoOp.toFixed(2)}">✉ ${escXml(email)}</text>` : ''}
      ${addressLine ? `<text x="124" y="${yAddr}" font-family="Arial,sans-serif" font-size="10" fill="${textMuted}" opacity="${infoOp.toFixed(2)}">📍 ${escXml(addressLine)}</text>` : ''}
      ${site      ? `<text x="124" y="${ySite}" font-family="Arial,sans-serif" font-size="10" fill="${accent}" opacity="${infoOp.toFixed(2)}">🌐 ${escXml(site.replace(/^https?:\/\//, ''))}</text>` : ''}
      ${noteStars ? `<text x="124" y="${yNote}" font-family="Arial,sans-serif" font-size="12" fill="#f59e0b" opacity="${infoOp.toFixed(2)}">${noteStars} ${note?.toFixed(1)}</text>` : ''}

      <!-- CTA bouton — aligné à droite de la colonne info -->
      <g transform="translate(454,146) scale(${ctaScale.toFixed(4)}) translate(-74,-16)">
        <rect width="148" height="32" rx="6" fill="${accent}" opacity="${ctaOp.toFixed(2)}"/>
        <rect width="148" height="32" rx="6" fill="${accentLight}"
          opacity="${(inShine ? 0.2 * Math.sin(tShine * Math.PI * 4) : 0).toFixed(3)}"/>
        <text x="74" y="21" text-anchor="middle" font-family="Arial,sans-serif"
          font-size="11" font-weight="700" fill="#ffffff">${escXml(cta)}</text>
      </g>
    </svg>`;

    try {
      const pngBuf = await sharp(Buffer.from(frameSvg))
        .resize(600, 180)
        .png({ compressionLevel: 1 })
        .toBuffer();
      frames.push(pngBuf);
    } catch (e: any) {
      log(`Frame ${i} error: ${e.message}`, 'export-complete');
    }
  }

  if (frames.length === 0) return buildStaticPng(meta);

  // ── Encoder en GIF
  try {
    const GifEncoder = (await import('gif-encoder-2')).default;
    const encoder = new GifEncoder(600, 180, 'neuquant', true, frames.length);

    encoder.setRepeat(0);    // boucle infinie
    encoder.setDelay(65);    // 65ms/frame → ~15fps fluide
    encoder.setQuality(5);   // 1=best/lent, 20=fast/rough — bon compromis
    encoder.start();

    for (const framePng of frames) {
      const raw = await sharp(framePng)
        .resize(600, 180)
        .ensureAlpha()
        .raw()
        .toBuffer();
      encoder.addFrame(raw);
    }

    encoder.finish();
    const gifBuffer = encoder.out.getData();

    if (!gifBuffer || gifBuffer.length < 100) throw new Error('GIF vide');
    log(`GIF spectaculaire: ${Math.round(gifBuffer.length / 1024)}KB, ${frames.length} frames (BUILD+LIVE+SHINE)`, 'export-complete');
    return gifBuffer;
  } catch (err: any) {
    log(`GIF encoder error: ${err.message} — fallback PNG`, 'export-complete');
    return buildStaticPng(meta);
  }
}

// ── 4. HTML Gmail (CSS animations inline, full fidélité) ─────────────────────

// ── Génère une table 100% inline-styles, sans aucun <style> ni class ──────────
// Compatible Gmail, Outlook.com, Yahoo, tout webmail moderne.
// Gmail strip tout <style> et toute animation CSS — seuls les attributs
// style="" et les balises HTML4 de présentation sont conservés.

function buildInlineTable(meta: ExportMetadata): string {
  const { nom = 'Prénom Nom', titre = 'Titre', entreprise = 'Entreprise',
          email = '', telephone = '', site = '', adresse = '', ville = '',
          code_postal = '', note, cta = 'Nous contacter',
          palette = [] } = meta;

  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const textMuted = `${textColor}99`;
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');

  // Ligne de séparation (simulée avec une cellule colorée, compatible partout)
  const divider = `<tr><td colspan="3" height="1" style="height:1px;font-size:0;line-height:0;background:${accent};opacity:0.15;">&nbsp;</td></tr>`;

  const contactRows = [
    telephone ? `<tr><td style="padding:1px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${textMuted};">&#9990;&nbsp;<a href="tel:${escXml(telephone)}" style="color:${accent};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:11px;">${escXml(telephone)}</a></td></tr>` : '',
    email ? `<tr><td style="padding:1px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${textMuted};">&#9993;&nbsp;<a href="mailto:${escXml(email)}" style="color:${textMuted};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:11px;">${escXml(email)}</a></td></tr>` : '',
    addressLine ? `<tr><td style="padding:1px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${textMuted};">&#128205;&nbsp;${escXml(addressLine)}</td></tr>` : '',
    site ? `<tr><td style="padding:2px 0;"><a href="${escXml(site)}" style="color:${accent};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:10px;">${escXml(site.replace(/^https?:\/\//, ''))}</a></td></tr>` : '',
    note ? `<tr><td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733;&nbsp;${note.toFixed(1)}</td></tr>` : '',
  ].filter(Boolean).join('');

  return `<table cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:620px;background:${bg};border-radius:10px;border-collapse:collapse;">
  <tr>
    <!-- Barre accent gauche -->
    <td width="4" style="width:4px;background:${accent};border-radius:10px 0 0 10px;font-size:0;line-height:0;">&nbsp;</td>
    <!-- Avatar / initiales -->
    <td width="90" valign="middle" align="center" style="padding:18px 10px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="68" height="68" align="center" valign="middle"
            style="width:68px;height:68px;background:${accent}22;border:2px solid ${accent};border-radius:34px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:${accent};text-align:center;">
            ${escXml(initials)}
          </td>
        </tr>
      </table>
    </td>
    <!-- Séparateur vertical -->
    <td width="1" style="width:1px;padding:18px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="1">
        <tr><td height="100" width="1" style="width:1px;height:100px;background:${accent};opacity:0.25;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
    </td>
    <!-- Contenu texte -->
    <td valign="middle" style="padding:18px 16px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding-bottom:2px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:${textColor};">${escXml(nom)}</td></tr>
        <tr><td style="padding-bottom:2px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:1.5px;text-transform:uppercase;">${escXml(titre)}</td></tr>
        <tr><td style="padding-bottom:10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${textMuted};">${escXml(entreprise)}</td></tr>
        ${divider}
        <tr><td style="padding-top:8px;">
          <table cellpadding="0" cellspacing="0" border="0">
            ${contactRows}
          </table>
        </td></tr>
        ${cta ? `<tr><td style="padding-top:10px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr><td style="background:${accent};padding:7px 18px;border-radius:6px;">
              <a href="${site ? escXml(site) : '#'}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;text-decoration:none;">${escXml(cta)}</a>
            </td></tr>
          </table>
        </td></tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
}

export function buildGmailHtml(meta: ExportMetadata, _signatureHtml: string, hostedGifUrl?: string, animatedSvg?: string): string {
  const { nom = '', entreprise = '', telephone = '', email = '', site = '', palette = [], cta = 'Nous contacter' } = meta;
  const [, accent] = palette.length >= 2 ? palette : ['#0f172a', '#6366f1'];

  const linksRow = `
  <tr>
    <td style="padding:6px 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;">
        <tr>
          ${telephone ? `<td style="padding-right:14px;"><a href="tel:${escXml(telephone)}" style="font-size:11px;color:${accent};text-decoration:none;">&#9990; ${escXml(telephone)}</a></td>` : ''}
          ${email ? `<td style="padding-right:14px;"><a href="mailto:${escXml(email)}" style="font-size:11px;color:${accent};text-decoration:none;">&#9993; ${escXml(email)}</a></td>` : ''}
          ${site ? `<td style="padding-right:14px;"><a href="${escXml(site)}" style="font-size:11px;color:${accent};text-decoration:none;">&#127760; ${escXml(site.replace(/^https?:\/\//, ''))}</a></td>` : ''}
          ${cta && site ? `<td><a href="${escXml(site)}" style="display:inline-block;font-size:11px;font-weight:700;color:#ffffff;background:${accent};padding:5px 12px;border-radius:4px;text-decoration:none;">${escXml(cta)}</a></td>` : ''}
        </tr>
      </table>
    </td>
  </tr>`;

  // ── Priorité 1 : SVG animé embarqué inline (meilleure qualité, toutes animations)
  // Compatible Apple Mail, Thunderbird, webmails modernes. Pour Gmail web, le SVG
  // est accepté dans les signatures configurées dans Paramètres → Signature.
  if (animatedSvg) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<table cellpadding="0" cellspacing="0" border="0" width="620" style="max-width:620px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0;line-height:0;font-size:0;">
      ${animatedSvg}
    </td>
  </tr>${linksRow}
</table>
<!-- EffectForge AI — ${escXml(nom)} — SVG animé inline -->
</body>
</html>`;
  }

  // ── Priorité 2 : GIF hébergé (fallback pour les environnements sans SVG)
  if (hostedGifUrl) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<table cellpadding="0" cellspacing="0" border="0" width="620" style="max-width:620px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0;">
      <img src="${hostedGifUrl}" width="620" height="180"
        style="display:block;max-width:100%;border:0;border-radius:8px;"
        alt="${escXml(nom)} — ${escXml(entreprise)}" />
    </td>
  </tr>${linksRow}
</table>
<!-- EffectForge AI — ${escXml(nom)} — animated via hosted GIF -->
</body>
</html>`;
  }

  // ── Priorité 3 : table statique inline-styles (pas d'animation)
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#ffffff;">
${buildInlineTable(meta)}
<!-- EffectForge AI — ${escXml(nom)} -->
</body>
</html>`;
}

// ── 5. HTML Outlook (MSO table + PNG statique embarqué) ───────────────────────

export function buildOutlookHtml(meta: ExportMetadata, pngBase64: string): string {
  const { nom = 'Prénom Nom', titre = 'Titre', entreprise = 'Entreprise',
          email = '', telephone = '', site = '', adresse = '', ville = '',
          code_postal = '', note, palette = [], cta = 'Nous contacter' } = meta;
  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const textMuted = `${textColor}cc`;
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<!--[if gte mso 15]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
  a{color:${accent};text-decoration:none;}
</style>
</head>
<body>

<!--[if mso]>
<table cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:${bg};border-radius:8px;">
<tr>
  <td width="4" valign="top" style="background:${accent};border-radius:4px 0 0 4px;"></td>
  <td width="86" valign="middle" align="center" style="padding:16px 8px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td width="70" height="70" align="center" valign="middle"
        style="background:${accent}22;border:2px solid ${accent};border-radius:35px;font-family:Arial;font-size:22px;font-weight:700;color:${accent};">
        ${escXml(initials)}
      </td></tr>
    </table>
  </td>
  <td width="2" valign="top" style="padding:16px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="2"><tr><td height="140" style="background:${accent};opacity:0.25;width:2px;"></td></tr></table>
  </td>
  <td valign="middle" style="padding:16px 14px;">
    <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:${textColor};">${escXml(nom)}</p>
    <p style="margin:0 0 2px;font-size:10px;color:${accent};letter-spacing:1.5px;text-transform:uppercase;">${escXml(titre)}</p>
    <p style="margin:0 0 10px;font-size:11px;color:${textMuted};">${escXml(entreprise)}</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;"><tr><td height="1" width="280" style="background:${accent};opacity:0.2;font-size:0;line-height:0;">&nbsp;</td></tr></table>
    ${telephone ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9990; <a href="tel:${escXml(telephone)}" style="color:${accent};text-decoration:none;">${escXml(telephone)}</a></p>` : ''}
    ${email ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9993; <a href="mailto:${escXml(email)}" style="color:${textMuted};text-decoration:none;">${escXml(email)}</a></p>` : ''}
    ${addressLine ? `<p style="margin:0 0 3px;font-size:10px;color:${textMuted};">&#128205; ${escXml(addressLine)}</p>` : ''}
    ${site ? `<p style="margin:0 0 8px;font-size:10px;"><a href="${escXml(site)}" style="color:${accent};text-decoration:none;">${escXml(site.replace(/^https?:\/\//, ''))}</a></p>` : ''}
    ${note ? `<p style="margin:0;font-size:12px;color:#f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733; ${note.toFixed(1)}</p>` : ''}
    <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      <tr><td style="background:${accent};padding:7px 16px;border-radius:5px;">
        <a href="${site ? escXml(site) : '#'}" style="font-size:11px;font-weight:700;color:#ffffff;text-decoration:none;">${escXml(cta)}</a>
      </td></tr>
    </table>
  </td>
</tr>
</table>
<![endif]-->

<!--[if !mso]><!-->
<div style="max-width:620px;">
  <img src="data:image/png;base64,${pngBase64}" alt="Signature ${escXml(nom)} — ${escXml(entreprise)}"
    width="620" style="display:block;max-width:100%;border:0;" />
</div>
<!--<![endif]-->

</body>
</html>`;
}

// ── 6. HTML Apple Mail (CSS animé, compatible Webkit) ────────────────────────

export function buildAppleMailHtml(meta: ExportMetadata, signatureHtml: string): string {
  const { nom = '', entreprise = '', palette = [] } = meta;
  const [bg] = palette.length >= 1 ? palette : ['#0f172a'];
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Signature Apple Mail — ${escXml(nom)}</title>
<style>
  body{margin:0;padding:0;background:#fff;-webkit-font-smoothing:antialiased;}
  @media (prefers-color-scheme:dark){body{background:${bg};}}
</style>
</head>
<body>
${signatureHtml}
</body>
</html>`;
}

// ── 7. HTML Universel hybride (smart multi-client) ───────────────────────────
// Stratégie : MSO Outlook → table inline, non-MSO → table inline-styles
// Les data URIs SVG/PNG sont bloqués par Gmail, on utilise uniquement des tables.

export function buildUniversalHtml(
  meta: ExportMetadata,
  hostedGifUrl?: string,
): string {
  const { nom = '', entreprise = '', palette = [], titre = '',
          telephone = '', email = '', site = '', adresse = '',
          code_postal = '', ville = '', note, cta = '' } = meta;
  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const textMuted = `${textColor}cc`;
  const initials = `${nom.charAt(0)}${(nom.split(' ')[1] || '').charAt(0)}`.toUpperCase();
  const addressLine = [adresse, code_postal && ville ? `${code_postal} ${ville}` : (ville || code_postal)].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!--[if gte mso 15]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;}
  a{color:${accent};text-decoration:none;}
  .sig-animated{display:block;max-width:100%;border:0;}
</style>
</head>
<body>

<!-- ══ Outlook / Word — version table statique ══ -->
<!--[if mso]>
<table cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:${bg};border-radius:8px;">
<tr>
  <td width="4" valign="top" style="background:${accent};border-radius:4px 0 0 4px;"></td>
  <td width="86" valign="middle" align="center" style="padding:16px 8px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td width="70" height="70" align="center" valign="middle"
        style="background:${accent}22;border:2px solid ${accent};border-radius:35px;font-family:Arial;font-size:22px;font-weight:700;color:${accent};">
        ${escXml(initials)}
      </td></tr>
    </table>
  </td>
  <td width="2" valign="top" style="padding:16px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="2"><tr><td height="140" style="background:${accent};width:2px;opacity:0.25;font-size:0;line-height:0;">&nbsp;</td></tr></table>
  </td>
  <td valign="middle" style="padding:16px 14px;">
    <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:${textColor};">${escXml(nom)}</p>
    <p style="margin:0 0 2px;font-size:10px;color:${accent};letter-spacing:1.5px;">${escXml(titre.toUpperCase())}</p>
    <p style="margin:0 0 10px;font-size:11px;color:${textMuted};">${escXml(entreprise)}</p>
    ${telephone ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9990; ${escXml(telephone)}</p>` : ''}
    ${email ? `<p style="margin:0 0 3px;font-size:11px;color:${textMuted};">&#9993; ${escXml(email)}</p>` : ''}
    ${addressLine ? `<p style="margin:0 0 3px;font-size:10px;color:${textMuted};">&#128205; ${escXml(addressLine)}</p>` : ''}
    ${site ? `<p style="margin:0 0 8px;font-size:10px;color:${accent};">${escXml(site.replace(/^https?:\/\//, ''))}</p>` : ''}
    ${note ? `<p style="margin:0 0 6px;font-size:12px;color:#f59e0b;">&#9733; ${note.toFixed(1)}</p>` : ''}
    ${cta ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${accent};padding:7px 16px;border-radius:5px;"><a href="${site ? escXml(site) : '#'}" style="font-size:11px;font-weight:700;color:#ffffff;text-decoration:none;">${escXml(cta)}</a></td></tr></table>` : ''}
  </td>
</tr>
</table>
<![endif]-->

<!-- ══ Non-Outlook (Gmail, Webmail, mobile) ══ -->
<!--[if !mso]><!-->
${hostedGifUrl ? `
<table cellpadding="0" cellspacing="0" border="0" width="620" style="max-width:620px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0;">
      <img src="${hostedGifUrl}" width="620" height="180"
        style="display:block;max-width:100%;border:0;border-radius:8px;"
        alt="${escXml(nom)} — ${escXml(entreprise)}" />
    </td>
  </tr>
  <tr>
    <td style="padding:6px 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;">
        <tr>
          ${telephone ? `<td style="padding-right:14px;"><a href="tel:${escXml(telephone)}" style="font-size:11px;color:${accent};text-decoration:none;">&#9990; ${escXml(telephone)}</a></td>` : ''}
          ${email ? `<td style="padding-right:14px;"><a href="mailto:${escXml(email)}" style="font-size:11px;color:${accent};text-decoration:none;">&#9993; ${escXml(email)}</a></td>` : ''}
          ${site ? `<td style="padding-right:14px;"><a href="${escXml(site)}" style="font-size:11px;color:${accent};text-decoration:none;">&#127760; ${escXml(site.replace(/^https?:\/\//, ''))}</a></td>` : ''}
          ${cta && site ? `<td><a href="${escXml(site)}" style="display:inline-block;font-size:11px;font-weight:700;color:#ffffff;background:${accent};padding:5px 12px;border-radius:4px;text-decoration:none;">${escXml(cta)}</a></td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
</table>` : buildInlineTable(meta)}
<!--<![endif]-->

</body>
</html>`;
}

// ── 8. Guide d'installation HTML multi-client ─────────────────────────────────

export function buildInstallationGuide(
  meta: ExportMetadata,
  signatureId: string
): string {
  const { nom = '', entreprise = '', secteur = '', palette = [] } = meta;
  const [bg, accent, textColor] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];

  const steps = [
    {
      client: 'Gmail',
      icon: '📧',
      color: '#EA4335',
      steps: [
        'Ouvrez Gmail → Paramètres (⚙️) → "Voir tous les paramètres"',
        'Onglet <strong>Général</strong> → section <strong>Signature</strong>',
        'Cliquez <strong>Créer une signature</strong>, donnez-lui un nom',
        'Cliquez sur l\'icône <strong>HTML</strong> (&lt;&gt;) dans l\'éditeur de signature',
        'Copiez-collez le contenu du fichier <code>signature-gmail.html</code>',
        'Faites défiler vers le bas, cliquez <strong>Enregistrer les modifications</strong>',
      ],
      file: 'signature-gmail.html',
      badge: '✅ CSS Animé',
    },
    {
      client: 'Outlook (Windows & Mac)',
      icon: '📮',
      color: '#0078D4',
      steps: [
        'Ouvrez Outlook → Fichier → Options (ou Outlook → Préférences sur Mac)',
        'Courrier → <strong>Signatures</strong>',
        'Cliquez <strong>Nouveau</strong>, donnez un nom à votre signature',
        'Dans l\'éditeur de signature, cliquez droit → <strong>Modifier la source HTML</strong>',
        'Copiez-collez le contenu du fichier <code>signature-outlook.htm</code>',
        'Cliquez <strong>OK</strong> puis <strong>Enregistrer</strong>',
      ],
      file: 'signature-outlook.htm',
      badge: '✅ Compatible MSO',
    },
    {
      client: 'Apple Mail',
      icon: '🍎',
      color: '#007AFF',
      steps: [
        'Ouvrez Mail → Préférences → <strong>Signatures</strong>',
        'Sélectionnez votre compte email à gauche',
        'Cliquez <strong>+</strong> pour créer une nouvelle signature',
        'Fermez Préférences. Allez dans <code>~/Library/Mail/V10/MailData/Signatures/</code>',
        'Trouvez le fichier .mailsignature le plus récent, remplacez son contenu par <code>signature-apple-mail.html</code>',
        'Verrouillez le fichier (Cmd+I → "Verrouillé") pour empêcher Mail de le réécrire',
      ],
      file: 'signature-apple-mail.html',
      badge: '✅ CSS Animé',
    },
    {
      client: 'Thunderbird',
      icon: '⚡',
      color: '#FF6611',
      steps: [
        'Ouvrez Thunderbird → Outils → Paramètres du compte',
        'Sélectionnez votre compte → <strong>Composition & Adressage</strong>',
        'Cochez "Joindre ma signature depuis un fichier (texte, HTML ou image)"',
        'Cliquez <strong>Choisir...</strong> et sélectionnez le fichier <code>signature-apple-mail.html</code>',
      ],
      file: 'signature-apple-mail.html',
      badge: '✅ CSS Animé',
    },
    {
      client: 'Webmail (Yahoo, Outlook.com, etc.)',
      icon: '🌐',
      color: '#6366F1',
      steps: [
        'Paramètres → Signature',
        'Activez le mode HTML si disponible',
        'Copiez-collez le contenu du fichier <code>signature-gmail.html</code>',
        'Si pas de mode HTML, utilisez directement l\'image <code>signature-statique.png</code>',
      ],
      file: 'signature-gmail.html',
      badge: '✅ Compatible',
    },
  ];

  const stepsHtml = steps.map(s => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <span style="font-size:28px;">${s.icon}</span>
        <div>
          <h3 style="margin:0;font-size:16px;color:#111827;">${s.client}</h3>
          <span style="display:inline-block;background:${s.color}18;color:${s.color};border:1px solid ${s.color}44;border-radius:20px;padding:2px 10px;font-size:11px;margin-top:4px;">${s.badge}</span>
        </div>
        <span style="margin-left:auto;font-family:monospace;font-size:11px;background:#f3f4f6;padding:4px 10px;border-radius:6px;color:#6b7280;">${s.file}</span>
      </div>
      <ol style="margin:0;padding-left:20px;line-height:1.8;">
        ${s.steps.map(st => `<li style="font-size:13px;color:#374151;">${st}</li>`).join('')}
      </ol>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Guide d'installation — Signature ${escXml(nom)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;color:#111827;padding:32px 16px;}
  code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:12px;color:#6b7280;}
  strong{color:#111827;}
</style>
</head>
<body>
<div style="max-width:720px;margin:0 auto;">

  <div style="text-align:center;margin-bottom:40px;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:${accent}18;
      border:1px solid ${accent}44;border-radius:100px;padding:6px 18px;font-size:11px;
      letter-spacing:2px;text-transform:uppercase;color:${accent};margin-bottom:20px;">
      ✦ EffectForge AI — Signature Vivante
    </div>
    <h1 style="font-size:28px;font-weight:700;color:${accent};margin-bottom:8px;">${escXml(nom)}</h1>
    <p style="color:#6b7280;font-size:14px;">${escXml(entreprise)} · Secteur ${escXml(secteur)} · ID: ${signatureId.slice(0, 8)}</p>
  </div>

  <div style="background:${bg};border-radius:12px;padding:20px;margin-bottom:32px;text-align:center;">
    <p style="color:${textColor};font-size:13px;opacity:0.7;margin-bottom:8px;">Aperçu de votre signature</p>
    <div style="display:inline-block;border-radius:8px;overflow:hidden;max-width:100%;">
    </div>
  </div>

  <h2 style="font-size:18px;font-weight:700;margin-bottom:20px;color:#111827;">
    📦 Fichiers inclus dans votre package
  </h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;font-size:13px;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-weight:600;">Fichier</th>
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-weight:600;">Usage</th>
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-weight:600;">Compatibilité</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-gmail.html</code></td><td style="padding:10px 14px;">Gmail, Webmail</td><td style="padding:10px 14px;color:#059669;">✅ CSS Animé</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-outlook.htm</code></td><td style="padding:10px 14px;">Outlook (Windows/Mac)</td><td style="padding:10px 14px;color:#0078D4;">✅ MSO Compatible</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-apple-mail.html</code></td><td style="padding:10px 14px;">Apple Mail, Thunderbird</td><td style="padding:10px 14px;color:#059669;">✅ CSS Animé</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-universelle.html</code></td><td style="padding:10px 14px;">Copier-coller universel</td><td style="padding:10px 14px;color:#6366f1;">✅ Multi-client</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-animee.svg</code></td><td style="padding:10px 14px;">Embed &lt;img&gt; SVG animé</td><td style="padding:10px 14px;color:#059669;">✅ SMIL Natif</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 14px;"><code>signature-animee.gif</code></td><td style="padding:10px 14px;">GIF animé universel</td><td style="padding:10px 14px;color:#f59e0b;">✅ Outlook (1er frame)</td></tr>
      <tr><td style="padding:10px 14px;"><code>signature-statique.png</code></td><td style="padding:10px 14px;">Fallback image</td><td style="padding:10px 14px;color:#6b7280;">✅ Universel</td></tr>
    </tbody>
  </table>

  <h2 style="font-size:18px;font-weight:700;margin-bottom:20px;color:#111827;">
    🔧 Instructions par client email
  </h2>
  ${stepsHtml}

  <div style="margin-top:40px;text-align:center;padding:20px;background:${accent}0a;border-radius:12px;border:1px solid ${accent}22;">
    <p style="font-size:13px;color:#6b7280;">Signature générée par <strong style="color:${accent};">EffectForge AI</strong> · ID: ${signatureId}</p>
    <p style="font-size:11px;color:#9ca3af;margin-top:4px;">Pour toute assistance : hello@effectforge.ai</p>
  </div>

</div>
</body>
</html>`;
}

// ── 9. Assemblage ZIP complet ─────────────────────────────────────────────────

// ── Générateurs de fichiers premium pour le ZIP ───────────────────────────────

function escZip(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildReadmeMd(params: {
  signatureId: string;
  nom: string;
  titre: string;
  entreprise: string;
  email: string;
  telephone: string;
  site: string;
  secteur: string;
  palette: string[];
  effectsUsed?: string[];
}): string {
  const { signatureId, nom, titre, entreprise, email, telephone, site, secteur, palette, effectsUsed = [] } = params;
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return `# 🎨 Signature Email Animée — ${nom}
> Générée par **EffectForge AI** · ${dateStr}

---

## 👤 Identité

| Champ | Valeur |
|-------|--------|
| **Nom** | ${nom} |
| **Titre** | ${titre || '—'} |
| **Entreprise** | ${entreprise || '—'} |
| **Secteur** | ${secteur} |
| **Email** | ${email || '—'} |
| **Téléphone** | ${telephone || '—'} |
| **Site web** | ${site || '—'} |
| **ID Signature** | \`${signatureId}\` |

---

## 📦 Contenu du package

| Fichier | Description | Client recommandé |
|---------|-------------|-------------------|
| \`PREVIEW — Ouvrez ce fichier.html\` | **Commencez ici** — aperçu interactif de votre signature | Navigateur |
| \`signature-gmail.html\` | Version CSS animée | Gmail, Outlook.com, Yahoo |
| \`signature-outlook.htm\` | Version MSO compatible, table HTML | Outlook 2016–2024 (Windows) |
| \`signature-apple-mail.html\` | Version CSS webkit animée | Apple Mail, iOS Mail |
| \`signature-universelle.html\` | Version hybride SVG/CSS | Thunderbird, autres |
| \`signature-animee.svg\` | SVG animé standalone | Intégration web, embed |
| \`signature-animee.gif\` | GIF animé universel | Clients sans CSS |
| \`signature-statique.png\` | Image PNG haute résolution | Fallback universel |
| \`GUIDE_INSTALLATION.html\` | Guide pas-à-pas interactif | — |
| \`palette-de-marque.html\` | Charte colorimétrique officielle | — |
| \`metadata.json\` | Configuration technique complète | Développeurs |

---

## 🚀 Installation rapide

### Gmail
1. Ouvrir **Gmail** → ⚙️ Paramètres → *Voir tous les paramètres*
2. Onglet **Général** → section **Signature** → *Créer une signature*
3. Cliquer sur l'icône **\`< >\`** (HTML) dans l'éditeur de signature
4. Copier-coller le contenu de \`signature-gmail.html\`
5. **Enregistrer les modifications** en bas de page

### Outlook 2016–2024
1. **Fichier** → **Options** → **Courrier** → **Signatures**
2. Cliquer **Nouveau** → donner un nom
3. Dans l'onglet **Message**, cliquer sur l'icône HTML
4. Coller le contenu de \`signature-outlook.htm\`
5. **OK** pour enregistrer

### Apple Mail
1. **Mail** → **Préférences** → **Signatures**
2. Sélectionner votre compte → cliquer **+**
3. Désactiver *"Toujours utiliser la police par défaut"*
4. Glisser \`signature-apple-mail.html\` dans la zone de signature
5. Redémarrer Apple Mail

> 💡 **Conseil** : Ouvrez d'abord \`GUIDE_INSTALLATION.html\` pour un guide visuel complet avec captures d'écran.

---

## 🎨 Palette de marque

${palette.map((c, i) => {
  const labels = ['Fond principal', "Couleur d'accent", 'Texte clair'];
  return `- **${labels[i] || `Couleur ${i + 1}`}** : \`${c.toUpperCase()}\``;
}).join('\n')}

${effectsUsed.length > 0 ? `\n## ✦ Effets visuels actifs\n\n${effectsUsed.map(e => `- \`${e}\``).join('\n')}` : ''}

---

## ⚠️ Compatibilité

| Client | Animation | Format recommandé |
|--------|-----------|-------------------|
| Gmail | ✅ CSS animé | signature-gmail.html |
| Outlook 2016–2024 | 🖼 GIF (1er frame statique possible) | signature-outlook.htm |
| Apple Mail | ✅ CSS animé | signature-apple-mail.html |
| iOS Mail | ✅ SVG animé | signature-universelle.html |
| Outlook.com | ✅ CSS animé | signature-gmail.html |
| Thunderbird | ✅ CSS animé | signature-apple-mail.html |
| Yahoo Mail | 🖼 GIF | signature-gmail.html |

---

## 📞 Support

Ce package a été généré par **EffectForge AI — God Tier Engine v3.0**.
Pour toute assistance, consultez le \`GUIDE_INSTALLATION.html\` inclus.

---

*© EffectForge AI · ${nom} · ${entreprise} · ${dateStr}*
`;
}

export function buildStandalonePreviewHtml(params: {
  signatureId: string;
  nom: string;
  titre: string;
  entreprise: string;
  email: string;
  telephone: string;
  site: string;
  secteur: string;
  palette: string[];
  animatedSvg: string;
  effectsUsed?: string[];
}): string {
  const { signatureId, nom, titre, entreprise, email, secteur, palette, animatedSvg } = params;
  const [, accent] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Ne pas modifier le SVG — il doit rester à ses dimensions natives (600×190)
  // pour que tous les éléments internes restent correctement positionnés
  const responsiveSvg = animatedSvg;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aperçu Signature — ${escZip(nom)} · ${escZip(entreprise)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f1f3f4;font-family:'Google Sans','Segoe UI',Arial,sans-serif;min-height:100vh;padding:0;}

  /* ── Barre de navigation Gmail simulée ── */
  .gmail-nav{background:#fff;border-bottom:1px solid #e0e0e0;padding:8px 20px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:100;box-shadow:0 1px 3px rgba(0,0,0,.08);}
  .gmail-logo{display:flex;align-items:center;gap:6px;font-size:22px;font-weight:400;color:#5f6368;letter-spacing:-0.5px;}
  .gmail-logo span{color:${accent};font-weight:700;}
  .gmail-search{flex:1;max-width:680px;background:#f1f3f4;border-radius:24px;padding:10px 20px;font-size:14px;color:#202124;border:none;outline:none;}
  .nav-label{margin-left:auto;font-size:12px;color:#5f6368;background:#f1f3f4;padding:6px 14px;border-radius:20px;}

  /* ── Layout deux colonnes (sidebar + contenu) ── */
  .gmail-layout{display:flex;min-height:calc(100vh - 57px);}
  .gmail-sidebar{width:236px;padding:8px;flex-shrink:0;background:#f6f8fc;}
  @media(max-width:700px){.gmail-sidebar{display:none;}}
  .sidebar-btn{display:flex;align-items:center;gap:12px;padding:0 16px;height:40px;border-radius:0 20px 20px 0;font-size:14px;cursor:pointer;color:#202124;}
  .sidebar-btn.active{background:#fce8e6;color:#c5221f;font-weight:600;}
  .sidebar-btn .icon{font-size:18px;width:20px;text-align:center;}
  .sidebar-compose{background:${accent};color:#fff;border:none;border-radius:16px;padding:16px 24px;font-size:15px;font-weight:500;display:flex;align-items:center;gap:10px;cursor:pointer;margin:8px 8px 16px;box-shadow:0 1px 3px rgba(0,0,0,.2);}

  /* ── Fil de discussion (email ouvert) ── */
  /* max-width:700px → carte email = ~620px → SVG 600px s'intègre sans débordement */
  .gmail-content{flex:1;overflow:auto;padding:24px 40px 60px;max-width:700px;}
  @media(max-width:700px){.gmail-content{padding:16px 12px 40px;max-width:100%;}}
  .thread-subject{font-size:22px;font-weight:400;color:#202124;margin-bottom:24px;line-height:1.3;}
  .thread-subject .tag{display:inline-block;background:${accent}22;color:${accent};border-radius:4px;font-size:12px;padding:2px 8px;margin-left:10px;font-weight:500;vertical-align:middle;}

  /* ── Message card — pas d'overflow:hidden pour ne pas clipper la signature ── */
  .message-card{background:#fff;border:1px solid #e0e0e0;border-radius:8px;margin-bottom:12px;overflow:visible;box-shadow:0 1px 3px rgba(0,0,0,.06);}
  .message-header{display:flex;align-items:flex-start;justify-content:space-between;padding:20px 24px 16px;cursor:pointer;gap:12px;}
  .avatar{width:40px;height:40px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;flex-shrink:0;}
  .sender-info{flex:1;}
  .sender-name{font-size:14px;font-weight:600;color:#202124;margin-bottom:2px;}
  .sender-detail{font-size:12px;color:#5f6368;}
  .sender-detail a{color:#1a73e8;text-decoration:none;}
  .msg-date{font-size:12px;color:#5f6368;white-space:nowrap;padding-top:2px;}
  .message-body{padding:0 24px 20px;}
  .msg-text{font-size:14px;line-height:1.7;color:#202124;margin-bottom:20px;}
  .msg-text p{margin-bottom:12px;}
  .msg-text strong{color:${accent};}
  .msg-cta{display:inline-block;background:${accent};color:#fff;padding:10px 24px;border-radius:4px;font-size:14px;font-weight:500;text-decoration:none;margin-bottom:20px;}
  .sig-divider{border:none;border-top:1px solid #e0e0e0;margin:16px 0;}
  .sig-label{font-size:11px;color:#9aa0a6;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;}

  /* ── Signature SVG — en dehors du padding du corps, collée aux bords de la carte ── */
  /* Reproduit exactement ce que le client verra dans son email (600px natif) */
  .sig-container{width:100%;overflow-x:auto;overflow-y:visible;line-height:0;border-radius:0 0 8px 8px;}
  .sig-container svg{display:block;}

  /* ── Barre d'actions reply ── */
  .reply-bar{border-top:1px solid #e0e0e0;padding:16px 24px;display:flex;gap:12px;background:#fff;border-radius:0 0 8px 8px;}
  .reply-btn{border:1px solid #dadce0;background:#fff;border-radius:4px;padding:9px 20px;font-size:14px;cursor:pointer;color:#202124;display:flex;align-items:center;gap:6px;}
  .reply-btn:hover{background:#f6f8fc;}

  /* ── Bannière EffectForge en bas ── */
  .effectforge-banner{background:#fff;border-top:1px solid #e0e0e0;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
  .ef-brand{font-size:13px;color:#5f6368;}
  .ef-brand strong{color:${accent};}
  .ef-actions{display:flex;gap:10px;flex-wrap:wrap;}
  .ef-btn{font-size:12px;border:1px solid #dadce0;background:#fff;padding:7px 16px;border-radius:4px;cursor:pointer;color:#5f6368;text-decoration:none;}
  .ef-btn.primary{background:${accent};color:#fff;border-color:${accent};}

  /* ── Badge animé ── */
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
  .live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:${accent};animation:pulse 2s infinite;vertical-align:middle;margin-right:5px;}
</style>
</head>
<body>

<!-- Barre Gmail simulée -->
<div class="gmail-nav">
  <div class="gmail-logo">M<span>ail</span></div>
  <input class="gmail-search" type="text" value="Votre nouvelle signature EffectForge AI" readonly />
  <div class="nav-label">Aperçu client</div>
</div>

<div class="gmail-layout">

  <!-- Sidebar Gmail simulée -->
  <aside class="gmail-sidebar">
    <button class="sidebar-compose">✏️ Nouveau message</button>
    <div class="sidebar-btn active"><span class="icon">📥</span>Boîte de réception <span style="margin-left:auto;font-size:12px;">1</span></div>
    <div class="sidebar-btn"><span class="icon">⭐</span>Messages suivis</div>
    <div class="sidebar-btn"><span class="icon">🕐</span>En attente</div>
    <div class="sidebar-btn"><span class="icon">📤</span>Messages envoyés</div>
    <div class="sidebar-btn"><span class="icon">📝</span>Brouillons</div>
    <hr style="margin:12px 0;border:none;border-top:1px solid #e0e0e0;">
    <div class="sidebar-btn" style="font-size:12px;color:#5f6368;">Plus de libellés</div>
  </aside>

  <!-- Contenu principal -->
  <main class="gmail-content">

    <div class="thread-subject">
      Votre nouvelle signature email animée est prête ✨
      <span class="tag"><span class="live-dot"></span>Signature vivante</span>
    </div>

    <!-- Email d'EffectForge au client -->
    <div class="message-card">
      <div class="message-header">
        <div class="avatar">EF</div>
        <div class="sender-info">
          <div class="sender-name">EffectForge AI <span style="font-weight:400;color:#5f6368;">&lt;studio@effectforge.ai&gt;</span></div>
          <div class="sender-detail">À : <a href="mailto:${escZip(email || '')}">${escZip(nom || 'vous')}</a>${email ? ` &lt;${escZip(email)}&gt;` : ''}</div>
        </div>
        <div class="msg-date">${dateStr} à ${timeStr}</div>
      </div>

      <div class="message-body">
        <div class="msg-text">
          <p>Bonjour <strong>${escZip(nom)}</strong>,</p>

          <p>Votre nouvelle <strong>signature email animée</strong> est prête. Nous avons conçu pour vous une signature vivante aux couleurs de <strong>${escZip(entreprise)}</strong>, avec des effets d'animation personnalisés selon votre secteur d'activité.</p>

          <p>Ci-dessous, vous trouverez un aperçu exact de ce que verront vos correspondants lorsque vous enverrez un email avec cette signature. Elle s'animera automatiquement dans Gmail, Apple Mail et la plupart des webmails modernes.</p>

          <p>Avez-vous des retouches à apporter ? Couleurs, texte, disposition, effets… N'hésitez pas à nous contacter, nous ajustons tout sous 24h.</p>
        </div>

        <a href="mailto:studio@effectforge.ai?subject=Retouche signature ${encodeURIComponent(nom + ' — ' + entreprise)}" class="msg-cta">
          ✉️ Demander des modifications
        </a>

        <hr class="sig-divider" />
        <p class="sig-label">— Votre signature, telle qu'elle apparaîtra dans vos emails —</p>
      </div>

      <!-- Signature directement dans la carte, hors du padding message-body -->
      <!-- La carte email fait ~620px, la signature 600px → rendu fidèle à l'email réel -->
      <div class="sig-container">
        ${responsiveSvg}
      </div>

      <div class="reply-bar">
        <button class="reply-btn">↩ Répondre</button>
        <button class="reply-btn">↪ Transférer</button>
      </div>
    </div>

  </main>
</div>

<!-- Barre EffectForge -->
<div class="effectforge-banner">
  <div class="ef-brand">
    <strong>EffectForge AI</strong> · Signature ID : <code style="font-size:11px;color:#9aa0a6;">${escZip(signatureId)}</code><br>
    <span style="font-size:11px;">${escZip(nom)} · ${escZip(titre || secteur)} · ${escZip(entreprise)} · ${dateStr}</span>
  </div>
  <div class="ef-actions">
    <a href="signature-gmail.html" class="ef-btn primary" target="_blank">📧 Installer Gmail</a>
    <a href="signature-outlook.htm" class="ef-btn" target="_blank">📮 Outlook</a>
    <a href="signature-apple-mail.html" class="ef-btn" target="_blank">🍎 Apple Mail</a>
    <a href="GUIDE_INSTALLATION.html" class="ef-btn" target="_blank">📋 Guide</a>
  </div>
</div>

</body>
</html>`;
}

function buildPaletteHtmlZip(params: {
  nom: string;
  entreprise: string;
  palette: string[];
  signatureId: string;
}): string {
  const { nom, entreprise, palette, signatureId } = params;
  const [bg, accent, textLight] = palette.length >= 3 ? palette : ['#0f172a', '#6366f1', '#e8e8ff'];
  function hexToRgb(hex: string): string {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : '0, 0, 0';
  }
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Palette de Marque — ${escZip(nom)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${bg};color:${textLight};font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;}
  .label{font-size:11px;text-transform:uppercase;letter-spacing:3px;opacity:.35;margin-bottom:12px;}
  h1{font-size:clamp(22px,4vw,36px);font-weight:700;margin-bottom:8px;}
  h1 span{color:${accent};}
  .sub{font-size:14px;opacity:.45;margin-bottom:48px;}
  .swatches{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;margin-bottom:48px;}
  .swatch-block{text-align:center;}
  .swatch-big{width:120px;height:120px;border-radius:20px;border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 24px rgba(0,0,0,.4);margin-bottom:12px;}
  .swatch-name{font-size:11px;opacity:.4;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;}
  .swatch-hex{font-size:14px;font-family:monospace;font-weight:600;opacity:.8;}
  .swatch-rgb{font-size:10px;opacity:.3;font-family:monospace;margin-top:2px;}
  footer{font-size:11px;opacity:.2;}
</style>
</head>
<body>
  <p class="label">Charte Colorimétrique · EffectForge AI</p>
  <h1>${escZip(nom)} · <span>${escZip(entreprise)}</span></h1>
  <p class="sub">Palette officielle de votre signature email animée</p>
  <div class="swatches">
    ${palette.map((c, i) => {
      const labels = ["Fond principal", "Couleur d'accent", "Texte clair"];
      return `<div class="swatch-block">
        <div class="swatch-big" style="background:${c};"></div>
        <div class="swatch-name">${labels[i] || `Couleur ${i+1}`}</div>
        <div class="swatch-hex">${c.toUpperCase()}</div>
        <div class="swatch-rgb">rgb(${hexToRgb(c)})</div>
      </div>`;
    }).join('')}
  </div>
  <footer>Signature ${escZip(signatureId)} · EffectForge AI</footer>
</body>
</html>`;
}

export async function buildCompleteZip(params: {
  signatureId: string;
  gmailHtml: string;
  outlookHtml: string;
  appleHtml: string;
  universalHtml: string;
  animatedSvg: string;
  staticPng: Buffer;
  animatedGif: Buffer;
  guideHtml: string;
  nom: string;
  meta?: ExportMetadata;
  effectsUsed?: string[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk: Buffer) => chunks.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(chunks)));
    passthrough.on('error', reject);
    archive.on('error', reject);
    archive.pipe(passthrough);

    const { meta = {} as ExportMetadata, effectsUsed = [] } = params;
    const slug = params.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'signature';

    const readmeParams = {
      signatureId: params.signatureId,
      nom: params.nom,
      titre: meta.titre || '',
      entreprise: meta.entreprise || params.nom,
      email: meta.email || '',
      telephone: meta.telephone || '',
      site: meta.site || '',
      secteur: meta.secteur || '',
      palette: meta.palette || ['#0f172a', '#6366f1', '#e8e8ff'],
      effectsUsed,
    };

    const readmeMd = buildReadmeMd(readmeParams);
    const previewHtml = buildStandalonePreviewHtml({
      ...readmeParams,
      animatedSvg: params.animatedSvg,
    });
    const paletteHtml = buildPaletteHtmlZip({
      nom: params.nom,
      entreprise: meta.entreprise || params.nom,
      palette: meta.palette || ['#0f172a', '#6366f1', '#e8e8ff'],
      signatureId: params.signatureId,
    });

    archive.append(previewHtml,          { name: `${slug}/PREVIEW — Ouvrez ce fichier.html` });
    archive.append(params.gmailHtml,     { name: `${slug}/signature-gmail.html` });
    archive.append(params.outlookHtml,   { name: `${slug}/signature-outlook.htm` });
    archive.append(params.appleHtml,     { name: `${slug}/signature-apple-mail.html` });
    archive.append(params.universalHtml, { name: `${slug}/signature-universelle.html` });
    archive.append(params.animatedSvg,   { name: `${slug}/signature-animee.svg` });
    archive.append(params.staticPng,     { name: `${slug}/signature-statique.png` });
    archive.append(params.animatedGif,   { name: `${slug}/signature-animee.gif` });
    archive.append(params.guideHtml,     { name: `${slug}/GUIDE_INSTALLATION.html` });
    archive.append(paletteHtml,          { name: `${slug}/palette-de-marque.html` });
    archive.append(readmeMd,             { name: `${slug}/README.md` });
    archive.append(JSON.stringify({
      signatureId: params.signatureId,
      generatedAt: new Date().toISOString(),
      engine: 'EffectForge AI v3.0',
      client: {
        nom: params.nom,
        titre: meta.titre || '',
        entreprise: meta.entreprise || params.nom,
        secteur: meta.secteur || '',
        email: meta.email || '',
      },
      palette: meta.palette || [],
      effectsUsed,
      compatibility: {
        gmail:    'CSS animated',
        outlook:  'MSO table + GIF fallback',
        apple:    'CSS animated webkit',
        mobile:   'Responsive SVG',
        universal: 'SVG SMIL + CSS hybrid',
      },
      files: [
        '📋 PREVIEW — Ouvrez ce fichier.html',
        'signature-gmail.html', 'signature-outlook.htm',
        'signature-apple-mail.html', 'signature-universelle.html',
        'signature-animee.svg', 'signature-animee.gif',
        'signature-statique.png', 'GUIDE_INSTALLATION.html',
        'palette-de-marque.html', 'README.md',
      ],
    }, null, 2), { name: `${slug}/metadata.json` });

    archive.finalize();
  });
}

// ── 10. Orchestrateur principal ───────────────────────────────────────────────

export async function generateCompleteExport(
  sectorId: string,
  signatureHtml: string,
  meta: ExportMetadata,
  hostedBaseUrl?: string,
): Promise<CompleteExportResult> {
  const { randomUUID } = await import('crypto');
  const signatureId = randomUUID();
  const slug = (meta.nom || 'signature').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);

  log(`Export complet démarré — ID: ${signatureId}, secteur: ${sectorId}`, 'export-complete');

  // Génération en parallèle des assets lourds
  const [staticPng, animatedGif] = await Promise.all([
    buildStaticPng(meta),
    buildAnimatedGif(meta),
  ]);

  const animatedSvg = buildAnimatedSVG(meta);
  const pngBase64 = staticPng.toString('base64');

  // ── Sauvegarde des assets sur disque pour hébergement public ──────────────
  const hostedGifUrl = hostedBaseUrl
    ? `${hostedBaseUrl}/api/sig/${signatureId}.gif`
    : undefined;

  // Sauvegarder en arrière-plan (ne bloque pas la génération du ZIP)
  saveSignatureAssets(signatureId, {
    gifBuffer: animatedGif,
    svgContent: animatedSvg,
    pngBuffer: staticPng,
  }).catch(err => log(`Erreur sauvegarde assets: ${err.message}`, 'export-complete'));

  // URL hébergée SVG (meilleure qualité que GIF pour l'export)
  const hostedSvgUrl = hostedBaseUrl
    ? `${hostedBaseUrl}/api/sig/${signatureId}.svg`
    : undefined;

  const gmailHtml     = buildGmailHtml(meta, signatureHtml, hostedGifUrl, animatedSvg);
  const outlookHtml   = buildOutlookHtml(meta, pngBase64);
  const appleHtml     = buildAppleMailHtml(meta, signatureHtml);
  const universalHtml = buildUniversalHtml(meta, hostedGifUrl);
  const guideHtml     = buildInstallationGuide(meta, signatureId);

  const zip = await buildCompleteZip({
    signatureId, nom: meta.nom || 'signature',
    gmailHtml, outlookHtml, appleHtml, universalHtml,
    animatedSvg, staticPng, animatedGif, guideHtml,
    meta,
    effectsUsed: [],
  });

  log(`Export complet terminé — ZIP: ${Math.round(zip.length / 1024)}KB`, 'export-complete');

  return {
    signatureId,
    hostedSvgUrl,
    hostedGifUrl,
    formats: {
      gmail:       { html: gmailHtml,     filename: `${slug}-gmail.html` },
      outlook:     { html: outlookHtml,   filename: `${slug}-outlook.htm` },
      appleMail:   { html: appleHtml,     filename: `${slug}-apple-mail.html` },
      universal:   { html: universalHtml, filename: `${slug}-universelle.html` },
      animatedSvg: { svg: animatedSvg,    filename: `${slug}-animee.svg` },
      staticPng:   { buffer: staticPng,   filename: `${slug}-statique.png` },
      animatedGif: { buffer: animatedGif, filename: `${slug}-animee.gif` },
    },
    guide: { html: guideHtml, filename: `${slug}-guide-installation.html` },
    zip:   { buffer: zip,     filename: `signature-${slug}-effectforge.zip` },
  };
}
