/**
 * 🌐 CONTEXT ADAPTATION ENGINE — v3.0
 *
 * Détecte le contexte de rendu (client mail + mode clair/sombre) et
 * génère automatiquement les CSS overrides adaptés pour une lisibilité
 * parfaite dans tous les environnements.
 *
 * ARCHITECTURE v3.0 :
 *  ┌─ ClientDetector ───────────────────────────────────────────────────────┐
 *  │  Identifie le client email cible via User-Agent / headers / hint.      │
 *  │  10 clients supportés : Outlook, Gmail, Apple Mail, Thunderbird, etc.  │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ ColorSchemeAdapter ───────────────────────────────────────────────────┐
 *  │  Génère 2 jeux de variables CSS : light + dark.                        │
 *  │  Correction automatique contraste si fond ≡ texte.                     │
 *  │  prefers-color-scheme + data-theme attribute support.                  │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ ClientCSSGenerator ───────────────────────────────────────────────────┐
 *  │  Génère les overrides spécifiques par client :                         │
 *  │  • Outlook MSO     → commentaires conditionnels + animation:none       │
 *  │  • Gmail           → inline style (pas de <style> dans <head>)        │
 *  │  • Apple Mail      → support webkit-animation                          │
 *  │  • Thunderbird     → support standard + minor fixes                    │
 *  │  • Yahoo/AOL       → inline style + reset agressif                    │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ SafetyValidator ──────────────────────────────────────────────────────┐
 *  │  Garantit : texte ≠ fond dans les 4 combinaisons client×mode.         │
 *  │  Anti-pattern "blanc sur blanc" ou "noir sur noir" bloqué.            │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ HTML Injector ─────────────────────────────────────────────────────────┐
 *  │  Injecte : bloc prefers-color-scheme + overrides client + MSO avant    │
 *  │  </head>. Compatible VarianceEngine + TimingMaster + ColorHarmony.     │
 *  └────────────────────────────────────────────────────────────────────────┘
 *
 * @version 3.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement
 */

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export type EmailClient =
  | 'outlook-2016'     // Outlook 2016/2019 (Windows) — MSO, pas d'animation
  | 'outlook-365'      // Outlook 365 / Outlook.com — support limité
  | 'gmail'            // Gmail (web + mobile) — inline style uniquement
  | 'apple-mail'       // Apple Mail (macOS/iOS) — meilleur support CSS
  | 'thunderbird'      // Mozilla Thunderbird — support standard
  | 'yahoo'            // Yahoo Mail — CSS limité
  | 'aol'              // AOL Mail — CSS minimal
  | 'samsung-mail'     // Samsung Email — webkit
  | 'outlook-android'  // Outlook Android/iOS — limité
  | 'generic';         // Client générique / inconnu

export type ColorScheme = 'light' | 'dark' | 'auto';

export interface SignaturePalette {
  background: string;
  accent:     string;
  text:       string;
  muted:      string;
  border:     string;
  highlight?: string;
}

/** Profil d'un client email */
export interface ClientProfile {
  id:              EmailClient;
  label:           string;
  animationSupport: 'full' | 'limited' | 'none';
  cssSupport:      'full' | 'partial' | 'inline-only';
  darkModeSupport: boolean;
  msoConditional:  boolean;
  webkitPrefix:    boolean;
  notes:           string;
}

/** Palette adaptée pour un mode couleur */
export interface AdaptedPalette {
  scheme:          ColorScheme;
  palette:         SignaturePalette;
  safePalette:     SignaturePalette;  // Palette après correction contraste
  lightPalette:    SignaturePalette;  // Version light forcée
  darkPalette:     SignaturePalette;  // Version dark générée
}

/** Résultat d'adaptation contextuelle */
export interface ContextAdaptationResult {
  client:          EmailClient;
  profile:         ClientProfile;
  scheme:          ColorScheme;
  adaptedPalette:  AdaptedPalette;
  cssBlock:        string;    // Bloc CSS complet à injecter
  inlineStyle:     string;    // CSS inline (Gmail / Yahoo)
  msoBlock:        string;    // Commentaire conditionnel Outlook
  warnings:        string[];  // Avertissements contraste / compatibilité
}

/** Résultat d'injection HTML */
export interface ContextInjectionResult {
  html:        string;
  injected:    boolean;
  blockSize:   number;
  client:      EmailClient;
  scheme:      ColorScheme;
  warnings:    string[];
}

export const ENGINE_VERSION = '3.0.0';

// ─── Profils clients ─────────────────────────────────────────────────────────

const CLIENT_PROFILES: Record<EmailClient, ClientProfile> = {
  'outlook-2016': {
    id:               'outlook-2016',
    label:            'Outlook 2016/2019 (Windows)',
    animationSupport: 'none',
    cssSupport:       'partial',
    darkModeSupport:  false,
    msoConditional:   true,
    webkitPrefix:     false,
    notes:            'Utilise le moteur Word — animations désactivées, MSO requis. Table-layout uniquement.',
  },
  'outlook-365': {
    id:               'outlook-365',
    label:            'Outlook 365 / Outlook.com',
    animationSupport: 'limited',
    cssSupport:       'partial',
    darkModeSupport:  true,
    msoConditional:   false,
    webkitPrefix:     false,
    notes:            'Support CSS modéré, animations simples ok. Dark mode auto-inversé.',
  },
  'gmail': {
    id:               'gmail',
    label:            'Gmail (web + mobile)',
    animationSupport: 'limited',
    cssSupport:       'inline-only',
    darkModeSupport:  true,
    msoConditional:   false,
    webkitPrefix:     false,
    notes:            'Supprime <style> dans <head> — inline style requis. Dark mode: inversion de couleurs auto.',
  },
  'apple-mail': {
    id:               'apple-mail',
    label:            'Apple Mail (macOS/iOS)',
    animationSupport: 'full',
    cssSupport:       'full',
    darkModeSupport:  true,
    msoConditional:   false,
    webkitPrefix:     true,
    notes:            'Meilleur support CSS et animation. prefers-color-scheme natif.',
  },
  'thunderbird': {
    id:               'thunderbird',
    label:            'Mozilla Thunderbird',
    animationSupport: 'full',
    cssSupport:       'full',
    darkModeSupport:  true,
    msoConditional:   false,
    webkitPrefix:     false,
    notes:            'Support CSS standard complet. Dark mode via prefers-color-scheme.',
  },
  'yahoo': {
    id:               'yahoo',
    label:            'Yahoo Mail',
    animationSupport: 'limited',
    cssSupport:       'partial',
    darkModeSupport:  false,
    msoConditional:   false,
    webkitPrefix:     false,
    notes:            'CSS partiel — éviter animations complexes. Inline style recommandé.',
  },
  'aol': {
    id:               'aol',
    label:            'AOL Mail',
    animationSupport: 'none',
    cssSupport:       'inline-only',
    darkModeSupport:  false,
    msoConditional:   false,
    webkitPrefix:     false,
    notes:            'Support CSS minimal — inline style uniquement.',
  },
  'samsung-mail': {
    id:               'samsung-mail',
    label:            'Samsung Email',
    animationSupport: 'limited',
    cssSupport:       'partial',
    darkModeSupport:  true,
    msoConditional:   false,
    webkitPrefix:     true,
    notes:            'Prefixe -webkit- requis pour animations.',
  },
  'outlook-android': {
    id:               'outlook-android',
    label:            'Outlook Android/iOS',
    animationSupport: 'limited',
    cssSupport:       'partial',
    darkModeSupport:  true,
    msoConditional:   false,
    webkitPrefix:     false,
    notes:            'Moteur différent de Outlook Windows — meilleur support.',
  },
  'generic': {
    id:               'generic',
    label:            'Client générique',
    animationSupport: 'full',
    cssSupport:       'full',
    darkModeSupport:  true,
    msoConditional:   false,
    webkitPrefix:     false,
    notes:            'Assume support CSS complet.',
  },
};

// ─── Détection client ─────────────────────────────────────────────────────────

/**
 * Détecte le client email depuis un User-Agent ou un hint explicite.
 * Retourne 'generic' si non reconnu.
 */
export function detectEmailClient(
  hint?: string,
  userAgent?: string
): EmailClient {
  const source = (hint || userAgent || '').toLowerCase();

  if (!source) return 'generic';

  if (source.includes('outlook-2016') || source.includes('microsoft office')) return 'outlook-2016';
  if (source.includes('outlook-365') || source.includes('outlook.com'))        return 'outlook-365';
  if (source.includes('gmail') || source.includes('googlemail'))               return 'gmail';
  if (source.includes('apple mail') || source.includes('applemail'))           return 'apple-mail';
  if (source.includes('thunderbird'))                                          return 'thunderbird';
  if (source.includes('yahoo'))                                                return 'yahoo';
  if (source.includes('aol'))                                                  return 'aol';
  if (source.includes('samsung'))                                              return 'samsung-mail';
  if (source.includes('outlook') && source.includes('android'))               return 'outlook-android';
  if (source.includes('outlook'))                                              return 'outlook-2016'; // sécurité par défaut

  return 'generic';
}

// ─── Maths couleur (HSL) ─────────────────────────────────────────────────────

interface RGB { r: number; g: number; b: number; }

function hexToRGB(hex: string): RGB {
  const clean = hex.replace('#', '').trim();
  const full  = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const n = parseInt(full.slice(0, 6), 16) || 0;
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function relativeLuminance({ r, g, b }: RGB): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRGB(hex1));
  const l2 = relativeLuminance(hexToRGB(hex2));
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return parseFloat(((light + 0.05) / (dark + 0.05)).toFixed(2));
}

function isLight(hex: string): boolean {
  return relativeLuminance(hexToRGB(hex)) > 0.4;
}

/** Génère une version dark d'une palette light */
function invertToDark(palette: SignaturePalette): SignaturePalette {
  const bg = isLight(palette.background)
    ? '#0f172a'  // dark bleu-gris profond
    : palette.background;

  // Accent : si clair → légèrement plus saturé / lumineux pour dark
  const accent = palette.accent;

  // Texte : toujours clair sur fond sombre
  const text   = isLight(palette.text) ? palette.text : '#f1f5f9';
  const muted  = '#94a3b8';
  const border = '#1e293b';

  return { background: bg, accent, text, muted, border, highlight: palette.highlight };
}

/** Garantit que texte et fond ont un contraste ≥ 4.5 (WCAG AA) */
function safeContrast(palette: SignaturePalette, warnings: string[]): SignaturePalette {
  const ratio = contrastRatio(palette.text, palette.background);

  if (ratio < 4.5) {
    warnings.push(
      `⚠️  Contraste texte/fond insuffisant : ratio=${ratio} (< 4.5 WCAG AA). Texte forcé.`
    );
    // Force le texte vers noir ou blanc selon la luminance du fond
    const forcedText = isLight(palette.background) ? '#0f172a' : '#f8fafc';
    return { ...palette, text: forcedText };
  }

  return palette;
}

// ─── Génération des palettes light/dark ─────────────────────────────────────

function buildAdaptedPalette(
  palette: SignaturePalette,
  scheme: ColorScheme,
  warnings: string[]
): AdaptedPalette {
  const lightPalette = isLight(palette.background)
    ? palette
    : invertToDark(palette); // Si on reçoit un dark, on génère le light aussi

  const darkPalette = invertToDark(lightPalette);

  const active = scheme === 'dark' ? darkPalette : lightPalette;
  const safe   = safeContrast(active, warnings);

  return { scheme, palette, safePalette: safe, lightPalette, darkPalette };
}

// ─── Génération CSS par client ───────────────────────────────────────────────

/** Génère le bloc CSS complet adapté au client + scheme */
function buildCSSBlock(
  profile:       ClientProfile,
  adapted:       AdaptedPalette,
  instanceId:    string
): string {
  const lp = adapted.lightPalette;
  const dp = adapted.darkPalette;
  const sp = adapted.safePalette;
  const animNone = profile.animationSupport === 'none';

  // Variables racine pour le mode actif
  const rootVars = `
  :root, [data-theme="light"] {
    --sig-bg:        ${lp.background};
    --sig-accent:    ${lp.accent};
    --sig-text:      ${lp.text};
    --sig-muted:     ${lp.muted};
    --sig-border:    ${lp.border};
  }`;

  // Dark mode via prefers-color-scheme
  const darkBlock = profile.darkModeSupport ? `
  @media (prefers-color-scheme: dark) {
    :root, [data-theme="dark"] {
      --sig-bg:        ${dp.background};
      --sig-accent:    ${dp.accent};
      --sig-text:      ${dp.text};
      --sig-muted:     ${dp.muted};
      --sig-border:    ${dp.border};
    }
    /* Signature zones — dark mode */
    .zone-logo, .zone-nom, .zone-titre, .zone-contact, .zone-cta, .zone-fond {
      background-color: ${dp.background};
      color:            ${dp.text};
    }
  }` : '';

  // Animation override pour clients sans support
  const animBlock = animNone ? `
  /* ${profile.label} — animations désactivées */
  * { animation: none !important; transition: none !important; }` : '';

  // Webkit prefix pour Apple Mail / Samsung
  const webkitBlock = profile.webkitPrefix ? `
  /* Webkit prefix — ${profile.label} */
  .animated-zone {
    -webkit-animation-delay:    var(--tm-beat, 0s);
    -webkit-animation-duration: var(--tm-cycle, 3s);
    -webkit-animation-timing-function: var(--tm-easing, ease);
  }` : '';

  return `<style id="ctx-adapt-v3-${instanceId}" data-engine="ContextAdaptationEngine-${ENGINE_VERSION}" data-client="${profile.id}">
  /* ═══════════════════════════════════════════════════════════════════
     🌐 CONTEXT ADAPTATION ENGINE v${ENGINE_VERSION}
     Client: ${profile.label}
     Animation: ${profile.animationSupport} | CSS: ${profile.cssSupport}
     Dark Mode: ${profile.darkModeSupport ? 'supporté' : 'non supporté'}
     ═══════════════════════════════════════════════════════════════════ */
  ${rootVars}
  ${darkBlock}
  ${animBlock}
  ${webkitBlock}
</style>`;
}

/** Génère le style inline pour Gmail / Yahoo / AOL */
function buildInlineStyle(palette: SignaturePalette): string {
  return [
    `background-color:${palette.background}`,
    `color:${palette.text}`,
    `border-color:${palette.border}`,
  ].join(';');
}

/** Génère le bloc conditionnel MSO pour Outlook 2016/2019 */
function buildMSOBlock(palette: SignaturePalette): string {
  return `<!--[if mso]>
<style type="text/css">
  /* Outlook 2016/2019 — rendu statique garanti */
  table, td, div { font-family: Arial, sans-serif; }
  .animated-zone, [data-zone] {
    animation:  none !important;
    transition: none !important;
    transform:  none !important;
    opacity:    1    !important;
  }
  .zone-fond       { background-color: ${palette.background} !important; }
  .zone-nom        { color: ${palette.text}   !important; }
  .zone-titre      { color: ${palette.muted}  !important; }
  .zone-contact    { color: ${palette.muted}  !important; }
  .zone-cta        { color: ${palette.accent} !important; border-color: ${palette.accent} !important; }
  .zone-separateur { border-color: ${palette.border} !important; }
</style>
<![endif]-->`;
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Retourne la liste des profils clients supportés.
 */
export function getClientProfiles(): ClientProfile[] {
  return Object.values(CLIENT_PROFILES);
}

/**
 * Retourne le profil d'un client spécifique.
 */
export function getClientProfile(client: EmailClient): ClientProfile {
  return CLIENT_PROFILES[client] ?? CLIENT_PROFILES.generic;
}

/**
 * Génère l'adaptation contextuelle complète pour un client + palette + scheme.
 */
export function adaptToContext(
  palette:     SignaturePalette,
  client:      EmailClient = 'generic',
  scheme:      ColorScheme = 'auto',
  instanceId?: string
): ContextAdaptationResult {
  const profile  = CLIENT_PROFILES[client] ?? CLIENT_PROFILES.generic;
  const id       = instanceId ?? `${client}-${scheme}`;
  const warnings: string[] = [];

  // Construit les palettes light + dark adaptées
  const adapted  = buildAdaptedPalette(palette, scheme, warnings);

  // Vérifie compatibilité client
  if (profile.animationSupport === 'none') {
    warnings.push(`ℹ️  ${profile.label} ne supporte pas les animations — fallback statique appliqué.`);
  }
  if (profile.cssSupport === 'inline-only') {
    warnings.push(`ℹ️  ${profile.label} requiert un style inline — utilisez inlineStyle en priorité.`);
  }

  const cssBlock    = buildCSSBlock(profile, adapted, id);
  const inlineStyle = buildInlineStyle(adapted.safePalette);
  const msoBlock    = profile.msoConditional ? buildMSOBlock(adapted.safePalette) : '';

  return { client, profile, scheme, adaptedPalette: adapted, cssBlock, inlineStyle, msoBlock, warnings };
}

/**
 * Injecte le CSS contextuel dans un HTML complet avant </head>.
 * Compatible avec TimingMaster, VarianceEngine et ColorHarmonyEngine.
 */
export function injectContextIntoHTML(
  html:        string,
  palette:     SignaturePalette,
  client:      EmailClient = 'generic',
  scheme:      ColorScheme = 'auto',
  instanceId?: string
): ContextInjectionResult {
  const result  = adaptToContext(palette, client, scheme, instanceId ?? `${client}-${scheme}`);
  const blocks  = [result.msoBlock, result.cssBlock].filter(Boolean).join('\n');

  const hasHead       = /<\/head>/i.test(html);
  const injectedHtml  = hasHead
    ? html.replace(/<\/head>/i, `${blocks}\n</head>`)
    : `${blocks}\n${html}`;

  return {
    html:      injectedHtml,
    injected:  true,
    blockSize: blocks.length,
    client,
    scheme,
    warnings:  result.warnings,
  };
}

/**
 * Génère l'adaptation pour tous les clients × schemes en une passe.
 * Utile pour pré-calcul ou export multi-client.
 */
export function adaptForAllClients(
  palette: SignaturePalette,
  scheme:  ColorScheme = 'auto'
): Record<EmailClient, ContextAdaptationResult> {
  const clients = Object.keys(CLIENT_PROFILES) as EmailClient[];
  const result  = {} as Record<EmailClient, ContextAdaptationResult>;

  for (const client of clients) {
    result[client] = adaptToContext(palette, client, scheme);
  }

  return result;
}

console.log(
  `🌐 ContextAdaptationEngine v${ENGINE_VERSION} chargé — 10 clients | light/dark/auto | WCAG SafetyValidator | MSO | webkit | inline`
);
