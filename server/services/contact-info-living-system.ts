// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT INFO LIVING SYSTEM v1.0.0
// Anime les 6 sections de la zone contact de la signature :
//   • Séparateur Vertical  — grow from top + gradient + pulse
//   • Titre/Poste          — shimmer reveal + underline draw + breathing
//   • Séparateur Horizontal— draw L→R + gradient scan + glow pulse
//   • Téléphone            — slide-in + icon pulse sectoriel + shimmer
//   • Email                — slide-in décalé + icon bounce + scan
//   • Adresse              — slide-in tardif + icon fade
//   • Site web             — accent pulse + icon orbit
//   • Note/Étoiles         — reveal séquentiel + twinkle
//
// Pattern identique aux autres Living Systems : { filterDefs, stylesCSS, groupSVG }
// ═══════════════════════════════════════════════════════════════════════════════

import { LIGHTING_PROFILES, MORPH_PROFILES } from './logo-module-bridge';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PHI = 1.618033988749895;
const FIB = [0.000, 0.090, 0.146, 0.236, 0.382, 0.618, 1.000];

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function getSector(s: string): string {
  return (s || '').toLowerCase().split(/[_\s-]/)[0] || 'default';
}

function escXml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Profils BPM et personnalité par secteur ────────────────────────────────────
const SECTOR_BPM: Record<string, number> = {
  tech: 76, startup: 88, sante: 58, beaute: 66, finance: 60,
  juridique: 55, creative: 90, immobilier: 62, restauration: 70, sport: 95, default: 68,
};

// ── Résultat ──────────────────────────────────────────────────────────────────
export interface CIResult {
  filterDefs: string;
  stylesCSS:  string;
  groupSVG:   string;
}

// ── Paramètres ────────────────────────────────────────────────────────────────
export interface ContactInfoParams {
  titre:      string;
  telephone?: string;
  email?:     string;
  addressLine?: string;
  site?:      string;
  note?:      number;
  noteStars?: string;
  accent:     string;
  accentLight: string;
  textColor:  string;
  textMuted:  string;
  // Positions Y absolues calculées par l'appelant
  yPhone:  number;
  yEmail:  number;
  yAddr:   number;
  ySite:   number;
  yNote:   number;
}

// ═══════════════════════════════════════════════════════════════════════════════

export function buildContactInfoLivingSystem(
  params:    ContactInfoParams,
  sectorId:  string  = 'default',
  animated:  boolean = true,
): CIResult {

  if (!animated) {
    return { filterDefs: '', stylesCSS: '', groupSVG: '' };
  }

  const {
    titre, telephone = '', email = '', addressLine = '', site = '',
    note, noteStars = '',
    accent, accentLight, textColor, textMuted,
    yPhone, yEmail, yAddr, ySite, yNote,
  } = params;

  const sec        = getSector(sectorId);
  const lightProf  = LIGHTING_PROFILES[sec] || LIGHTING_PROFILES['default'];
  const morphProf  = MORPH_PROFILES[sec]    || MORPH_PROFILES['default'];
  const gi         = lightProf.glowIntensity;
  const morphStyle = morphProf.style;

  // ── Métriques temporelles ──────────────────────────────────────────────────
  const bpm        = SECTOR_BPM[sec] ?? 68;
  const beatS      = 60 / bpm;
  const pulseS     = clamp(beatS * 4 / lightProf.pulseSpeed, 1.8, 7.0);
  const shimmerS   = clamp(beatS * 8, 2.5, 9.0);
  const breatheS   = clamp(beatS * 4 * morphProf.speed, 1.2, 6.0);
  const iconPulseS = clamp(beatS * 2, 0.8, 3.5);
  const sepDrawS   = clamp(0.9 / morphProf.speed, 0.5, 1.6);   // séparateur H
  const sepVGrowS  = clamp(1.1 / morphProf.speed, 0.6, 2.0);   // séparateur V

  // Délais d'entrée séquentiels (Fibonacci)
  const D_SEP_V    = 0.15;
  const D_TITRE    = 0.30;
  const D_SEP_H    = D_TITRE + 0.55;
  const D_PHONE    = D_SEP_H + sepDrawS + 0.25;
  const D_EMAIL    = D_PHONE + FIB[2];
  const D_ADDR     = D_EMAIL + FIB[2];
  const D_SITE     = D_ADDR  + FIB[2];
  const D_STARS    = D_SEP_H + 0.2;

  // ── DEFS ──────────────────────────────────────────────────────────────────

  // Longueur du séparateur horizontal — contenu débute à x=124, finit à x=568
  const SEP_H_LEN = 444; // 568 - 124

  // Filtre glow doux pour icônes
  const filterDefs = `
    <!-- Contact Info Living System — filtres & gradients -->
    <filter id="ci-icon-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${(1.5 * gi).toFixed(1)}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ci-titre-glow" x="-10%" y="-30%" width="120%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${(gi * 2).toFixed(1)}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ci-sep-glow" x="-5%" y="-200%" width="110%" height="500%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${(gi * 1.5).toFixed(1)}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Gradient séparateur H (shimmer scan) -->
    <linearGradient id="ci-sep-h-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${accent}" stop-opacity="0"/>
      <stop offset="20%"  stop-color="${accent}" stop-opacity="${(gi * 0.5).toFixed(2)}"/>
      <stop offset="50%"  stop-color="${accentLight}" stop-opacity="${(gi * 0.9).toFixed(2)}"/>
      <stop offset="80%"  stop-color="${accent}" stop-opacity="${(gi * 0.5).toFixed(2)}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>

    <!-- Gradient séparateur V (dégradé vertical) -->
    <linearGradient id="ci-sep-v-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${accent}" stop-opacity="0"/>
      <stop offset="20%"  stop-color="${accent}" stop-opacity="${(gi * 0.4).toFixed(2)}"/>
      <stop offset="60%"  stop-color="${accentLight}" stop-opacity="${(gi * 0.35).toFixed(2)}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.1"/>
    </linearGradient>

    <!-- Gradient shimmer scan pour titre -->
    <linearGradient id="ci-titre-shimmer-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${textColor}" stop-opacity="0"/>
      <stop offset="40%"  stop-color="${accent}"    stop-opacity="${(gi * 0.6).toFixed(2)}"/>
      <stop offset="60%"  stop-color="${accentLight}" stop-opacity="${(gi * 0.9).toFixed(2)}"/>
      <stop offset="100%" stop-color="${textColor}" stop-opacity="0"/>
    </linearGradient>

    <!-- Clip rect pour séparateur H draw animation — x=124 aligné avec le contenu -->
    <clipPath id="ci-sep-h-clip">
      <rect x="124" y="78" width="${SEP_H_LEN}" height="8"/>
    </clipPath>`;

  // ── CSS keyframes ──────────────────────────────────────────────────────────

  // Morphing style : dicte le comportement du séparateur H après le draw
  const sepHPulseCSS = (() => {
    switch (morphStyle) {
      case 'elastic': return `
        @keyframes ci-sep-pulse {
          0%,100% { stroke-opacity: ${(gi*0.25).toFixed(2)}; stroke-width: 0.8; }
          30%     { stroke-opacity: ${(gi*0.80).toFixed(2)}; stroke-width: 1.4; }
          60%     { stroke-opacity: ${(gi*0.50).toFixed(2)}; stroke-width: 1.0; }
        }`;
      case 'geometric': return `
        @keyframes ci-sep-pulse {
          0%,100% { stroke-opacity: ${(gi*0.22).toFixed(2)}; }
          25%     { stroke-opacity: ${(gi*0.90).toFixed(2)}; }
          50%     { stroke-opacity: ${(gi*0.40).toFixed(2)}; }
          75%     { stroke-opacity: ${(gi*0.90).toFixed(2)}; }
        }`;
      case 'liquid': return `
        @keyframes ci-sep-pulse {
          0%,100% { stroke-opacity: ${(gi*0.20).toFixed(2)}; stroke-dashoffset: 0; }
          50%     { stroke-opacity: ${(gi*0.70).toFixed(2)}; stroke-dashoffset: -20; }
        }`;
      default: return `  /* breathe/crystal */
        @keyframes ci-sep-pulse {
          0%,100% { stroke-opacity: ${(gi*0.22).toFixed(2)}; }
          50%     { stroke-opacity: ${(gi*0.60).toFixed(2)}; }
        }`;
    }
  })();

  // Lighting style : dicte l'aura du titre
  const titreGlowCSS = (() => {
    switch (lightProf.style) {
      case 'electric': return `
        @keyframes ci-titre-glow {
          0%,85%,100% { opacity: 0; }
          48%  { opacity: ${(gi*0.6).toFixed(2)}; }
          50%  { opacity: ${(gi*0.9).toFixed(2)}; }
          52%  { opacity: ${(gi*0.6).toFixed(2)}; }
          86%  { opacity: ${(gi*0.2).toFixed(2)}; }
          87%  { opacity: ${(gi*0.5).toFixed(2)}; }
        }`;
      case 'neon': return `
        @keyframes ci-titre-glow {
          0%,100% { opacity: ${(gi*0.15).toFixed(2)}; }
          50%     { opacity: ${(gi*0.55).toFixed(2)}; }
        }`;
      case 'dramatic': return `
        @keyframes ci-titre-glow {
          0%,100% { opacity: ${(gi*0.10).toFixed(2)}; }
          40%     { opacity: ${(gi*0.70).toFixed(2)}; }
          60%     { opacity: ${(gi*0.50).toFixed(2)}; }
        }`;
      case 'aura': return `
        @keyframes ci-titre-glow {
          0%,100% { opacity: ${(gi*0.18).toFixed(2)}; transform: scaleX(1); }
          50%     { opacity: ${(gi*0.45).toFixed(2)}; transform: scaleX(1.02); }
        }`;
      default: return `  /* soft/subtle */
        @keyframes ci-titre-glow {
          0%,100% { opacity: ${(gi*0.10).toFixed(2)}; }
          50%     { opacity: ${(gi*0.35).toFixed(2)}; }
        }`;
    }
  })();

  const stylesCSS = `
    /* ─── Contact Info Living System — Sector:${sec} Light:${lightProf.style} Morph:${morphStyle} ─── */

    /* Séparateur V — grow from top */
    @keyframes ci-sep-v-grow {
      from { transform: scaleY(0); }
      to   { transform: scaleY(1); }
    }

    /* Séparateur V — glow pulse après grow */
    @keyframes ci-sep-v-pulse {
      0%,100% { opacity: ${(gi*0.28).toFixed(2)}; }
      50%     { opacity: ${(gi*0.55).toFixed(2)}; }
    }

    /* Titre — respiration du texte */
    @keyframes ci-titre-breathe {
      0%,100% { opacity: 1; letter-spacing: 1.5px; }
      50%     { opacity: 0.88; letter-spacing: 1.8px; }
    }

    /* Titre — glow ambiant sectoriel */
    ${titreGlowCSS}

    /* Titre — underline draw L→R */
    @keyframes ci-underline-draw {
      from { stroke-dashoffset: 120; }
      to   { stroke-dashoffset: 0; }
    }

    /* Séparateur H — pulse après draw (morphing sectoriel) */
    ${sepHPulseCSS}

    /* Éléments contact — slide-in + fade */
    @keyframes ci-info-enter {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* Icône — micro-pulse sectoriel */
    @keyframes ci-icon-pulse {
      0%,100% { opacity: ${(gi*0.70).toFixed(2)}; }
      50%     { opacity: 1; }
    }

    /* Icône ✉ — léger bounce vertical */
    @keyframes ci-icon-bounce {
      0%,100% { transform: translateY(0); }
      40%     { transform: translateY(-1.5px); }
      60%     { transform: translateY(0.5px); }
    }

    /* Icône 📍 — pulse radial */
    @keyframes ci-icon-pin {
      0%,100% { transform: scale(1); opacity: ${(gi*0.65).toFixed(2)}; }
      50%     { transform: scale(1.18); opacity: 1; }
    }

    /* Icône 🌐 — rotation lente */
    @keyframes ci-icon-orbit {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* Site — pulse accent */
    @keyframes ci-site-pulse {
      0%,100% { opacity: 0.78; }
      50%     { opacity: 1; }
    }

    /* Étoiles — reveal séquentiel + twinkle */
    @keyframes ci-star-enter {
      from { opacity: 0; transform: scale(0.4); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes ci-star-twinkle {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.55; }
    }

    /* Shimmer scan sur le titre */
    @keyframes ci-shimmer-scan {
      0%   { transform: translateX(-180px); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateX(320px);  opacity: 0; }
    }`;

  // ── ÉLÉMENTS SVG ─────────────────────────────────────────────────────────

  // ── Séparateur Vertical — x=108 : 34px d'espace libre pour les animations du logo ──
  const sepVEl = `
    <!-- SEPARATEUR VERTICAL — grow from top + gradient + pulse -->
    <g>
      <!-- Fond statique très léger (fallback) -->
      <rect x="108" y="16" width="1.5" height="158" fill="${accent}" opacity="0.08" rx="1"/>
      <!-- Barre principale animée : grow from top -->
      <rect x="108" y="16" width="1.5" height="158"
        fill="url(#ci-sep-v-grad)" rx="1"
        filter="url(#ci-sep-glow)"
        style="transform-origin: 108px 16px;
               opacity: 0;
               animation:
                 ci-sep-v-grow ${sepVGrowS.toFixed(2)}s ${morphProf.speed > 1 ? 'cubic-bezier(0.34,1.56,0.64,1)' : 'ease-out'} ${D_SEP_V.toFixed(2)}s forwards,
                 ci-sep-v-pulse ${pulseS.toFixed(2)}s ease-in-out ${(D_SEP_V + sepVGrowS + 0.1).toFixed(2)}s infinite;">
      </rect>
    </g>`;

  // ── Titre / Poste ──────────────────────────────────────────────────────────
  const TITRE_W = 120; // largeur approximative pour l'underline
  const titreEl = titre ? `
    <!-- TITRE / POSTE — shimmer reveal + underline draw + breathing + glow -->
    <g>
      <!-- Glow ambiant derrière le titre -->
      <text x="124" y="71"
        font-family="Arial,sans-serif" font-size="10" font-weight="700"
        fill="${accent}"
        filter="url(#ci-titre-glow)"
        style="opacity:0;
               animation: ci-titre-glow ${pulseS.toFixed(2)}s ease-in-out ${(D_TITRE + 0.6).toFixed(2)}s infinite;">
        ${escXml(titre.toUpperCase())}
      </text>

      <!-- Texte titre principal : typewriter reveal puis breathing -->
      <text x="124" y="71"
        font-family="Arial,sans-serif" font-size="10" font-weight="700"
        fill="${accent}" letter-spacing="1.5"
        style="clip-path: inset(0 100% 0 0);
               animation: ci-titre-breathe ${breatheS.toFixed(2)}s ease-in-out ${(D_TITRE + 1.4).toFixed(2)}s infinite;">
        ${escXml(titre.toUpperCase())}
        <!-- Typewriter clip reveal -->
        <animate attributeName="clip-path"
          from="inset(0 100% 0 0)" to="inset(0 0% 0 0)"
          dur="${(sepDrawS * 1.2).toFixed(2)}s" begin="${D_TITRE.toFixed(2)}s" fill="freeze"/>
      </text>

      <!-- Shimmer scan au-dessus du texte (s'active après le reveal) -->
      <rect x="124" y="61" width="55" height="13"
        fill="url(#ci-titre-shimmer-grad)"
        style="opacity:0;
               animation: ci-shimmer-scan ${shimmerS.toFixed(2)}s ease-in-out ${(D_TITRE + sepDrawS * 1.2 + 0.3).toFixed(2)}s infinite;">
      </rect>

      <!-- Underline accent draw L→R (sous le titre) -->
      <line x1="124" y1="74.5" x2="${124 + TITRE_W}" y2="74.5"
        stroke="${accentLight}" stroke-width="1"
        stroke-dasharray="${TITRE_W}" stroke-dashoffset="${TITRE_W}"
        opacity="${(gi * 0.7).toFixed(2)}"
        filter="url(#ci-sep-glow)">
        <animate attributeName="stroke-dashoffset"
          from="${TITRE_W}" to="0"
          dur="${(sepDrawS * 0.8).toFixed(2)}s" begin="${(D_TITRE + 0.25).toFixed(2)}s" fill="freeze"/>
      </line>
    </g>` : '';

  // ── Séparateur Horizontal ─────────────────────────────────────────────────
  const sepHEl = `
    <!-- SEPARATEUR HORIZONTAL — draw L→R + gradient scan + glow pulse -->
    <g>
      <!-- Ligne statique très légère (fallback) -->
      <line x1="124" y1="82" x2="568" y2="82"
        stroke="${accent}" stroke-width="0.8" opacity="0.10"/>
      <!-- Ligne principale : draw gauche → droite -->
      <line x1="124" y1="82" x2="568" y2="82"
        stroke="url(#ci-sep-h-grad)" stroke-width="0.8"
        stroke-dasharray="${SEP_H_LEN}" stroke-dashoffset="${SEP_H_LEN}"
        filter="url(#ci-sep-glow)"
        style="animation: ci-sep-pulse ${pulseS.toFixed(2)}s ease-in-out ${(D_SEP_H + sepDrawS + 0.1).toFixed(2)}s infinite;">
        <!-- Draw animation -->
        <animate attributeName="stroke-dashoffset"
          from="${SEP_H_LEN}" to="0"
          dur="${sepDrawS.toFixed(2)}s" begin="${D_SEP_H.toFixed(2)}s" fill="freeze"/>
      </line>
    </g>`;

  // ── Téléphone ─────────────────────────────────────────────────────────────
  const phoneEl = telephone ? `
    <!-- TELEPHONE — slide-in + icon pulse -->
    <g style="opacity:0; animation: ci-info-enter 0.5s ease-out ${D_PHONE.toFixed(2)}s forwards;">
      <!-- Icône ☎ avec pulse -->
      <text x="124" y="${yPhone}"
        font-family="Arial,sans-serif" font-size="11" fill="${accent}"
        filter="url(#ci-icon-glow)"
        style="animation: ci-icon-pulse ${iconPulseS.toFixed(2)}s ease-in-out ${(D_PHONE + 0.5).toFixed(2)}s infinite;">☎</text>
      <!-- Numéro -->
      <text x="137" y="${yPhone}"
        font-family="Arial,sans-serif" font-size="11" fill="${textColor}">${escXml(telephone)}</text>
    </g>` : '';

  // ── Email ─────────────────────────────────────────────────────────────────
  const emailEl = email ? `
    <!-- EMAIL — slide-in décalé + icon bounce -->
    <g style="opacity:0; animation: ci-info-enter 0.5s ease-out ${D_EMAIL.toFixed(2)}s forwards;">
      <!-- Icône ✉ avec bounce -->
      <text x="124" y="${yEmail}"
        font-family="Arial,sans-serif" font-size="11" fill="${accent}"
        filter="url(#ci-icon-glow)"
        style="display:inline-block; animation: ci-icon-bounce ${iconPulseS.toFixed(2)}s ease-in-out ${(D_EMAIL + 0.5).toFixed(2)}s infinite;">✉</text>
      <!-- Adresse email -->
      <text x="137" y="${yEmail}"
        font-family="Arial,sans-serif" font-size="11" fill="${textColor}">${escXml(email)}</text>
    </g>` : '';

  // ── Adresse ───────────────────────────────────────────────────────────────
  const adresseEl = addressLine ? `
    <!-- ADRESSE — slide-in tardif + icon pin pulse -->
    <g style="opacity:0; animation: ci-info-enter 0.5s ease-out ${D_ADDR.toFixed(2)}s forwards;">
      <!-- Icône 📍 avec pulse radial -->
      <text x="124" y="${yAddr}"
        font-family="Arial,sans-serif" font-size="10" fill="${accent}"
        style="transform-origin: 128px ${yAddr - 2}px;
               animation: ci-icon-pin ${(iconPulseS * PHI).toFixed(2)}s ease-in-out ${(D_ADDR + 0.6).toFixed(2)}s infinite;">📍</text>
      <!-- Texte adresse -->
      <text x="138" y="${yAddr}"
        font-family="Arial,sans-serif" font-size="10" fill="${textMuted}">${escXml(addressLine)}</text>
    </g>` : '';

  // ── Site web ──────────────────────────────────────────────────────────────
  const siteEl = params.site ? `
    <!-- SITE WEB — slide-in + icon orbit + pulse accent -->
    <g style="opacity:0; animation: ci-info-enter 0.5s ease-out ${D_SITE.toFixed(2)}s forwards;">
      <!-- Icône 🌐 avec rotation lente -->
      <text x="124" y="${ySite}"
        font-family="Arial,sans-serif" font-size="10" fill="${accent}"
        style="transform-origin: 128px ${ySite - 2}px;
               animation: ci-icon-orbit ${(pulseS * 3).toFixed(2)}s linear ${(D_SITE + 0.5).toFixed(2)}s infinite;">🌐</text>
      <!-- URL avec pulse accent -->
      <text x="138" y="${ySite}"
        font-family="Arial,sans-serif" font-size="10" fill="${accent}"
        style="animation: ci-site-pulse ${pulseS.toFixed(2)}s ease-in-out ${(D_SITE + 0.7).toFixed(2)}s infinite;">
        ${escXml((params.site).replace(/^https?:\/\//, ''))}
      </text>
    </g>` : '';

  // ── Note / Étoiles ────────────────────────────────────────────────────────
  let starsEl = '';
  if (noteStars && note) {
    const count = Math.floor(note);
    starsEl = `\n    <!-- ÉTOILES — reveal séquentiel + twinkle -->`;
    let xOffset = 124;
    for (let i = 0; i < count; i++) {
      const delay   = D_STARS + i * 0.12;
      const twDelay = delay + 0.5 + i * 0.08;
      starsEl += `
    <text x="${xOffset}" y="${yNote}"
      font-family="Arial,sans-serif" font-size="12" fill="#f59e0b"
      style="opacity:0;
             transform-origin: ${xOffset + 6}px ${yNote - 4}px;
             animation:
               ci-star-enter 0.3s cubic-bezier(0.34,1.56,0.64,1) ${delay.toFixed(2)}s forwards,
               ci-star-twinkle ${(iconPulseS * 1.5).toFixed(2)}s ease-in-out ${twDelay.toFixed(2)}s infinite;">★</text>`;
      xOffset += 14;
    }
    starsEl += `
    <text x="${xOffset + 2}" y="${yNote}"
      font-family="Arial,sans-serif" font-size="10" fill="${textMuted}"
      style="opacity:0; animation: ci-info-enter 0.4s ease-out ${(D_STARS + count * 0.12 + 0.2).toFixed(2)}s forwards;">
      ${note.toFixed(1)}
    </text>`;
  }

  // ── Assemblage ────────────────────────────────────────────────────────────
  const sectorTag = `<!-- ContactInfo Living System | Sector:${sec} | Light:${lightProf.style}(${(gi*100).toFixed(0)}%) | Morph:${morphStyle} -->`;

  const groupSVG = `
  <!-- ═══ Contact Info Living System ══════════════════════════════════════ -->
  ${sectorTag}

  ${sepVEl}
  ${titreEl}
  ${sepHEl}
  ${phoneEl}
  ${emailEl}
  ${adresseEl}
  ${siteEl}
  ${starsEl}

  <!-- ═══════════════════════════════════════════════════════════════════════ -->`;

  return { filterDefs, stylesCSS, groupSVG };
}
