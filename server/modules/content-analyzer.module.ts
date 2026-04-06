/**
 * 🔬 CONTENT ANALYZER — v2.0
 *
 * - Scoring sémantique avancé NLP + regex sur le brief (50+ signaux)
 * - Analyse de sentiment de marque (positif / neutre / négatif)
 * - Complexité logo détectée par type d'image (photo/illustration/icône/vectoriel)
 * - Vecteur de style 8D exportable pour calibration des modules P1-P4
 */

import type { ZoneComposition } from '../services/harmony-validator';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaletteAnalysis {
  dominant_hue:      number;
  saturation_avg:    number;
  lightness_avg:     number;
  contrast_ratio:    number;
  palette_richness:  number;
  color_temperature: 'warm' | 'cool' | 'neutral';
  color_harmony:     'monochromatic' | 'complementary' | 'triadic' | 'analogous' | 'complex';
}

export interface TextDensity {
  nom_chars:      number;
  titre_chars:    number;
  contact_chars:  number;
  cta_chars:      number;
  total_chars:    number;
  density_level:  'minimal' | 'light' | 'medium' | 'dense' | 'heavy';
}

export type LogoComplexityLevel = 'none' | 'icon' | 'logotype' | 'illustration' | 'photo' | 'complex';
export type BrandSentiment      = 'very_positive' | 'positive' | 'neutral' | 'reserved' | 'negative';

export interface LogoAnalysis {
  has_logo:       boolean;
  complexity:     LogoComplexityLevel;
  /** Score de complexité 0-1 (0=absent, 1=photo) */
  complexity_score: number;
  /** Taille estimée de l'image en bytes */
  estimated_bytes:  number;
  /** Présence d'un fond transparent */
  has_transparency: boolean;
}

export interface BrandSentimentAnalysis {
  sentiment:       BrandSentiment;
  sentiment_score: number;    // -1 (négatif) à +1 (très positif)
  signals:         string[];  // signaux détectés dans le brief
  energy_level:    'low' | 'medium' | 'high' | 'very_high';
}

/**
 * Vecteur de style 8D exportable :
 * [dynamisme, luxe, modernité, chaleur, technicité, créativité, sobriété, impact]
 * Chaque dimension 0-1.
 */
export type StyleVector8D = [number, number, number, number, number, number, number, number];

export interface ContentProfile {
  has_logo:          boolean;
  has_cta:           boolean;
  has_social:        boolean;
  element_count:     number;
  active_zones:      string[];

  palette:           PaletteAnalysis;
  text:              TextDensity;
  logo:              LogoAnalysis;
  brand_sentiment:   BrandSentimentAnalysis;

  visual_complexity: number;   // 0-1
  content_richness:  number;   // 0-1
  nlp_score:         number;   // 0-1 : richesse sémantique du brief
  style_vector:      StyleVector8D;

  thresholds: {
    max_intensity:    number;
    min_intensity:    number;
    max_layers:       number;
    animation_budget: number;
    effect_cap:       number;
  };

  recommended_profile: 'minimal' | 'balanced' | 'rich' | 'spectacular';
  sector_boost:        number;
}

// ─── Conversion hex → HSL ─────────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!hex || hex.length < 7) return { h: 0, s: 0, l: 0.5 };
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, h = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s, l };
}

// ─── Analyse de la palette ────────────────────────────────────────────────────

function analyzePalette(palette: string[]): PaletteAnalysis {
  if (!palette || palette.length === 0) {
    return { dominant_hue: 220, saturation_avg: 0.5, lightness_avg: 0.5, contrast_ratio: 0.5, palette_richness: 1, color_temperature: 'cool', color_harmony: 'monochromatic' };
  }

  const hslValues     = palette.map(hexToHsl).filter(h => h.s > 0 || h.l !== 0.5);
  const satAvg        = hslValues.reduce((s, c) => s + c.s, 0) / hslValues.length;
  const ligAvg        = hslValues.reduce((s, c) => s + c.l, 0) / hslValues.length;
  const hues          = hslValues.map(c => c.h);
  const dominantH     = hues.reduce((a, b) => a + b, 0) / hues.length;

  const colorTemperature: PaletteAnalysis['color_temperature'] =
    dominantH < 60 || dominantH > 300 ? 'warm' :
    dominantH > 150 && dominantH < 270 ? 'cool' : 'neutral';

  const hueRange = Math.max(...hues) - Math.min(...hues);
  const colorHarmony: PaletteAnalysis['color_harmony'] =
    hueRange < 30                    ? 'monochromatic' :
    hueRange > 150 && hueRange < 210 ? 'complementary' :
    hueRange > 100 && hueRange < 140 ? 'triadic'       :
    hueRange < 60                    ? 'analogous'      : 'complex';

  const contrastRatio = Math.abs(Math.max(...hslValues.map(c => c.l)) - Math.min(...hslValues.map(c => c.l)));

  return {
    dominant_hue:     Math.round(dominantH),
    saturation_avg:   Math.min(1, satAvg),
    lightness_avg:    Math.min(1, ligAvg),
    contrast_ratio:   Math.min(1, contrastRatio),
    palette_richness: Math.min(palette.length, 8),
    color_temperature: colorTemperature,
    color_harmony:    colorHarmony,
  };
}

// ─── Analyse textuelle ────────────────────────────────────────────────────────

function analyzeText(metadata: any): TextDensity {
  const nom     = String(metadata?.nom      || metadata?.entreprise || '').length;
  const titre   = String(metadata?.titre    || metadata?.slogan     || '').length;
  const contact = String(metadata?.contact  || metadata?.telephone  || metadata?.email || '').length;
  const cta     = String(metadata?.cta_text || metadata?.site_web   || '').length;
  const total   = nom + titre + contact + cta;

  const densityLevel: TextDensity['density_level'] =
    total < 20  ? 'minimal' :
    total < 50  ? 'light'   :
    total < 100 ? 'medium'  :
    total < 180 ? 'dense'   : 'heavy';

  return { nom_chars: nom, titre_chars: titre, contact_chars: contact, cta_chars: cta, total_chars: total, density_level: densityLevel };
}

// ─── Analyse de la complexité logo ───────────────────────────────────────────

/**
 * Détecte la complexité du logo à partir des métadonnées.
 * Priorité : type explicite → URL/extension → flags.
 */
function analyzeLogo(metadata: any): LogoAnalysis {
  const hasLogo = !!(metadata?.logo_url || metadata?.logo || metadata?.has_logo);

  if (!hasLogo) {
    return { has_logo: false, complexity: 'none', complexity_score: 0, estimated_bytes: 0, has_transparency: false };
  }

  const logoUrl   = String(metadata?.logo_url || metadata?.logo || '').toLowerCase();
  const logoType  = String(metadata?.logo_type || '').toLowerCase();

  let complexity: LogoComplexityLevel = 'logotype';
  let complexityScore = 0.40;
  let estimatedBytes  = 8000;
  let hasTransparency = logoUrl.endsWith('.png') || logoUrl.endsWith('.webp') || logoUrl.endsWith('.svg');

  // Détection par type explicite
  if (logoType === 'photo' || logoType === 'photographie') {
    complexity = 'photo'; complexityScore = 1.0; estimatedBytes = 80000; hasTransparency = false;
  } else if (logoType === 'illustration') {
    complexity = 'illustration'; complexityScore = 0.75; estimatedBytes = 30000;
  } else if (logoType === 'icône' || logoType === 'icon' || logoType === 'picto') {
    complexity = 'icon'; complexityScore = 0.20; estimatedBytes = 2000;
  } else if (logoType === 'vectoriel' || logoType === 'vector' || logoType === 'svg') {
    complexity = 'logotype'; complexityScore = 0.45; estimatedBytes = 10000;
  } else if (logoType === 'complexe' || logoType === 'complex') {
    complexity = 'complex'; complexityScore = 0.90; estimatedBytes = 60000;
  }

  // Fallback par URL/extension
  if (logoType === '') {
    if (logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg')) {
      complexity = 'photo'; complexityScore = 0.85; estimatedBytes = 50000; hasTransparency = false;
    } else if (logoUrl.endsWith('.svg')) {
      complexity = 'logotype'; complexityScore = 0.40; estimatedBytes = 8000;
    } else if (logoUrl.endsWith('.png') && metadata?.logo_size_kb > 50) {
      complexity = 'illustration'; complexityScore = 0.70; estimatedBytes = 40000;
    }
  }

  return { has_logo: true, complexity, complexity_score: complexityScore, estimated_bytes: estimatedBytes, has_transparency: hasTransparency };
}

// ─── Scoring NLP du brief (50+ signaux) ─────────────────────────────────────

interface NLPSignal {
  pattern:    RegExp;
  dimension:  keyof StyleDimensions;
  weight:     number;
}

interface StyleDimensions {
  dynamisme:   number;
  luxe:        number;
  modernite:   number;
  chaleur:     number;
  technicite:  number;
  creativite:  number;
  sobriete:    number;
  impact:      number;
}

const NLP_SIGNALS: NLPSignal[] = [
  // Dynamisme
  { pattern: /\b(rapide|vitesse|agile|dynami|énergie|puissant|vif|sport|action|actif)\b/gi, dimension: 'dynamisme', weight: 0.12 },
  { pattern: /\b(slow|lent|tranquille|reposant|calm|doux|apaisé)\b/gi,                     dimension: 'dynamisme', weight: -0.10 },
  // Luxe
  { pattern: /\b(luxe|prestige|exclusif|premium|haut de gamme|raffiné|élégant|exception)\b/gi, dimension: 'luxe', weight: 0.15 },
  { pattern: /\b(abordable|populaire|accessible|bas prix|économique)\b/gi,                 dimension: 'luxe', weight: -0.10 },
  // Modernité
  { pattern: /\b(modern|innov|digital|numérique|tech|ai|ia|futur|avant-garde|disruption)\b/gi, dimension: 'modernite', weight: 0.12 },
  { pattern: /\b(tradition|classique|héritage|artisan|ancien|vintage|savoir-faire)\b/gi,   dimension: 'modernite', weight: -0.08 },
  // Chaleur
  { pattern: /\b(chaleur|chaud|accueillant|convivial|humain|authentique|sincère|proche)\b/gi, dimension: 'chaleur', weight: 0.12 },
  { pattern: /\b(froid|distancié|corporate|formel|institutionnel|sévère)\b/gi,             dimension: 'chaleur', weight: -0.08 },
  // Technicité
  { pattern: /\b(tech|saas|logiciel|software|cloud|data|api|algorithme|code|dev|ia|llm)\b/gi, dimension: 'technicite', weight: 0.14 },
  { pattern: /\b(artisan|manuel|naturel|bio|écolo|terroir|fait main)\b/gi,                 dimension: 'technicite', weight: -0.10 },
  // Créativité
  { pattern: /\b(créa|design|art|studio|agence|unique|signature|original|singul|bol|mode)\b/gi, dimension: 'creativite', weight: 0.13 },
  { pattern: /\b(standardisé|générique|commun|basique|simple|neutre)\b/gi,                 dimension: 'creativite', weight: -0.08 },
  // Sobriété
  { pattern: /\b(sobre|minimal|épuré|clean|simple|essentiel|discret|neutre|blanc)\b/gi,   dimension: 'sobriete', weight: 0.12 },
  { pattern: /\b(riche|chargé|complexe|dense|coloré|festif|flamboyant)\b/gi,              dimension: 'sobriete', weight: -0.10 },
  // Impact
  { pattern: /\b(impact|fort|percutant|audacieux|mémorable|puissant|intense|wow)\b/gi,    dimension: 'impact', weight: 0.14 },
  { pattern: /\b(discret|invisible|effacé|neutre|sobre|fondre dans le décor)\b/gi,        dimension: 'impact', weight: -0.10 },
];

function scoreBriefNLP(brief: string): { dimensions: StyleDimensions; nlp_score: number; signals_detected: string[] } {
  const text   = (brief || '').toLowerCase();
  const dims: StyleDimensions = {
    dynamisme: 0.5, luxe: 0.5, modernite: 0.5, chaleur: 0.5,
    technicite: 0.5, creativite: 0.5, sobriete: 0.5, impact: 0.5,
  };
  const detected: string[] = [];

  for (const sig of NLP_SIGNALS) {
    const matches = text.match(sig.pattern);
    if (matches && matches.length > 0) {
      dims[sig.dimension] = Math.max(0, Math.min(1, dims[sig.dimension] + sig.weight * Math.min(matches.length, 3)));
      detected.push(`${sig.dimension}+${sig.weight > 0 ? '+' : ''}${(sig.weight * 100).toFixed(0)}% (${matches[0]})`);
    }
  }

  // Score NLP = variance des dimensions × richesse des signaux
  const values   = Object.values(dims);
  const mean     = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.abs(v - mean), 0) / values.length;
  const nlp_score = parseFloat(Math.min(1, variance * 3 + detected.length * 0.02).toFixed(3));

  return { dimensions: dims, nlp_score, signals_detected: detected.slice(0, 15) };
}

// ─── Analyse de sentiment de marque ──────────────────────────────────────────

function analyzeBrandSentiment(metadata: any, brief: string): BrandSentimentAnalysis {
  const text = ((brief || '') + ' ' + (metadata?.ton || '') + ' ' + (metadata?.slogan || '')).toLowerCase();

  const positiveSignals = [
    'innovant', 'excellence', 'leader', 'passion', 'confiance', 'engagement',
    'performance', 'qualité', 'succès', 'réussite', 'avant-garde', 'expertise',
    'champion', 'meilleur', 'premium', 'référence', 'partenaire',
  ];
  const negativeSignals = [
    'risque', 'problème', 'difficulté', 'crise', 'budget', 'contrainte',
    'limitation', 'interdit', 'impossible', 'jamais', 'échec',
  ];
  const energySignals = {
    very_high: ['révolution', 'explosion', 'disruption', 'game-changer', 'waouh', 'incroyable'],
    high:      ['innovation', 'dynamique', 'audacieux', 'impactant', 'fort', 'puissant'],
    medium:    ['professionnel', 'fiable', 'sérieux', 'qualité', 'expertise'],
    low:       ['discret', 'sobre', 'calme', 'tranquille', 'minimaliste'],
  };

  const posCount = positiveSignals.filter(s => text.includes(s)).length;
  const negCount = negativeSignals.filter(s => text.includes(s)).length;
  const sentimentRaw = (posCount - negCount * 1.5) / Math.max(positiveSignals.length * 0.3, 1);
  const sentimentScore = Math.max(-1, Math.min(1, parseFloat(sentimentRaw.toFixed(2))));

  const sentiment: BrandSentiment =
    sentimentScore > 0.50 ? 'very_positive' :
    sentimentScore > 0.15 ? 'positive'      :
    sentimentScore > -0.15 ? 'neutral'      :
    sentimentScore > -0.40 ? 'reserved'     : 'negative';

  let energy_level: BrandSentimentAnalysis['energy_level'] = 'medium';
  for (const [level, keywords] of Object.entries(energySignals)) {
    if (keywords.some(kw => text.includes(kw))) {
      energy_level = level as BrandSentimentAnalysis['energy_level'];
      break;
    }
  }

  const signals = [...positiveSignals.filter(s => text.includes(s)), ...negativeSignals.filter(s => text.includes(s))].slice(0, 8);

  return { sentiment, sentiment_score: sentimentScore, signals, energy_level };
}

// ─── Vecteur de style 8D ─────────────────────────────────────────────────────

function buildStyleVector(
  dims:      StyleDimensions,
  palette:   PaletteAnalysis,
  logo:      LogoAnalysis,
  sentiment: BrandSentimentAnalysis
): StyleVector8D {
  const normalize = (v: number) => parseFloat(Math.max(0, Math.min(1, v)).toFixed(2));

  return [
    normalize(dims.dynamisme  + (sentiment.energy_level === 'very_high' ? 0.2 : sentiment.energy_level === 'high' ? 0.1 : 0)),
    normalize(dims.luxe       + (palette.saturation_avg > 0.7 ? 0.1 : 0)),
    normalize(dims.modernite  + (palette.color_temperature === 'cool' ? 0.05 : 0)),
    normalize(dims.chaleur    + (palette.color_temperature === 'warm' ? 0.1 : 0)),
    normalize(dims.technicite),
    normalize(dims.creativite + (logo.complexity === 'illustration' || logo.complexity === 'complex' ? 0.1 : 0)),
    normalize(dims.sobriete   + (logo.complexity === 'icon' ? 0.1 : 0)),
    normalize(dims.impact     + (sentiment.sentiment_score > 0.5 ? 0.15 : 0)),
  ];
}

// ─── Boost sectoriel (50+ secteurs, aligné sur ContextualIntelligence) ────────

const SECTOR_BOOST_MAP: Record<string, number> = {
  creative: 0.95, pub: 0.95, musique: 0.92, cinema: 0.90, gaming: 0.90,
  startup: 0.85, ia_ml: 0.85, scaleup: 0.82, deeptech: 0.80, esport: 0.90,
  tech: 0.80, saas: 0.78, cybersecurity: 0.75, mode: 0.80, joaillerie: 0.78,
  luxe: 0.75, maison_luxe: 0.72, travel: 0.72, hotellerie: 0.70,
  retail: 0.70, ecommerce: 0.68, sport: 0.72, fitness: 0.70,
  media: 0.68, influenceur: 0.70, podcast: 0.65, greentech: 0.65,
  immobilier: 0.65, promotion: 0.62, restauration: 0.62, food_delivery: 0.65,
  education: 0.58, edtech: 0.65, wellness: 0.60, biotech: 0.60,
  rh: 0.55, cabinet_recrutement: 0.55, architecture: 0.60,
  default: 0.60, finance: 0.45, assurance: 0.45, banque_privee: 0.50,
  neobanque: 0.62, crypto: 0.70, medical: 0.40, pharmacie: 0.38,
  legal: 0.35, notariat: 0.30, compliance: 0.35, universite: 0.42,
  artisanat: 0.48, commerce_local: 0.50, energie: 0.45, agricole: 0.42,
};

function getSectorBoost(secteur: string): number {
  const key = (secteur ?? '').toLowerCase().replace(/ /g, '_');
  if (SECTOR_BOOST_MAP[key] !== undefined) return SECTOR_BOOST_MAP[key];
  for (const [k, v] of Object.entries(SECTOR_BOOST_MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return SECTOR_BOOST_MAP.default;
}

// ─── Complexité visuelle ──────────────────────────────────────────────────────

function computeVisualComplexity(
  metadata:    any,
  composition: ZoneComposition | null,
  text:        TextDensity,
  logo:        LogoAnalysis
): number {
  let score = 0.20;

  score += logo.complexity_score * 0.15;

  const socialCount = Object.keys(metadata?.reseaux_sociaux ?? {}).length;
  score += Math.min(0.15, socialCount * 0.03);

  const textBoost = text.density_level === 'heavy' ? 0.15 : text.density_level === 'dense' ? 0.10 : text.density_level === 'medium' ? 0.05 : 0;
  score += textBoost;

  if (composition) {
    const totalLayers = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta']
      .reduce((s, z) => s + ((composition as any)[z]?.layers?.length ?? 0), 0);
    score += Math.min(0.20, totalLayers * 0.02);
  }

  return parseFloat(Math.min(1, score).toFixed(3));
}

// ─── Seuils dynamiques ───────────────────────────────────────────────────────

function computeThresholds(
  complexity:  number,
  sectorBoost: number,
  text:        TextDensity,
  sentiment:   BrandSentimentAnalysis
): ContentProfile['thresholds'] {
  const energyMult = sentiment.energy_level === 'very_high' ? 1.15 :
                     sentiment.energy_level === 'high'      ? 1.07 :
                     sentiment.energy_level === 'low'       ? 0.85 : 1.0;

  const animBudget = Math.max(0.15, (1 - complexity * 0.4 - text.total_chars / 700) * energyMult);

  return {
    max_intensity:    parseFloat(Math.min(1, (0.45 + sectorBoost * 0.55) * energyMult).toFixed(2)),
    min_intensity:    parseFloat(Math.max(0.05, 0.10 - complexity * 0.05).toFixed(2)),
    max_layers:       Math.round(2 + sectorBoost * 5),
    animation_budget: parseFloat(Math.min(1, animBudget).toFixed(2)),
    effect_cap:       Math.round(3 + sectorBoost * 4),
  };
}

// ─── Profil recommandé ────────────────────────────────────────────────────────

function recommendProfile(
  complexity:  number,
  sectorBoost: number,
  text:        TextDensity,
  nlpScore:    number
): ContentProfile['recommended_profile'] {
  const score = complexity * 0.30 + sectorBoost * 0.35 + nlpScore * 0.15 + (1 - text.total_chars / 350) * 0.20;
  if (score > 0.78) return 'spectacular';
  if (score > 0.55) return 'rich';
  if (score > 0.35) return 'balanced';
  return 'minimal';
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function analyzeContent(
  metadata:    any,
  composition: ZoneComposition | null = null,
  brief?:      string
): ContentProfile {
  const palette      = analyzePalette(metadata?.palette ?? []);
  const text         = analyzeText(metadata);
  const logo         = analyzeLogo(metadata);
  const sectorBoost  = getSectorBoost(metadata?.secteur ?? 'default');

  // NLP du brief (50+ signaux)
  const briefText = brief ?? metadata?.brief ?? metadata?.description ?? metadata?.slogan ?? '';
  const { dimensions, nlp_score, signals_detected } = scoreBriefNLP(briefText);
  if (signals_detected.length > 0) {
    console.log(`🔬 ContentAnalyzer NLP — ${signals_detected.length} signaux détectés`);
  }

  // Sentiment de marque
  const brand_sentiment = analyzeBrandSentiment(metadata, briefText);

  // Zones actives
  const allZones     = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];
  const activeZones  = composition
    ? allZones.filter(z => (composition as any)[z]?.effet_id)
    : allZones.slice(0, 5);

  const visualComplexity  = computeVisualComplexity(metadata, composition, text, logo);
  const contentRichness   = parseFloat(Math.min(1,
    (activeZones.length / 7) * 0.40 +
    (palette.palette_richness / 8) * 0.25 +
    sectorBoost * 0.20 +
    nlp_score * 0.15
  ).toFixed(3));

  const thresholds         = computeThresholds(visualComplexity, sectorBoost, text, brand_sentiment);
  const recommendedProfile = recommendProfile(visualComplexity, sectorBoost, text, nlp_score);

  // Vecteur de style 8D
  const style_vector = buildStyleVector(dimensions, palette, logo, brand_sentiment);

  return {
    has_logo:         logo.has_logo,
    has_cta:          !!(metadata?.cta_text || metadata?.site_web),
    has_social:       Object.keys(metadata?.reseaux_sociaux ?? {}).length > 0,
    element_count:    activeZones.length,
    active_zones:     activeZones,
    palette,
    text,
    logo,
    brand_sentiment,
    visual_complexity:  visualComplexity,
    content_richness:   contentRichness,
    nlp_score,
    style_vector,
    thresholds,
    recommended_profile: recommendedProfile,
    sector_boost:       sectorBoost,
  };
}
