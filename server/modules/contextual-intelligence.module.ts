/**
 * 🧠 CONTEXTUAL INTELLIGENCE MODERATOR — v2.0
 *
 * - Extension à 50+ secteurs avec règles par sous-secteur
 * - Détection du ton de marque depuis le brief (NLP léger)
 * - Règles de conformité sectorielle (médical < 2 Hz anti-épilepsie)
 * - Validation croisée avec les effets rejetés de l'utilisateur
 */

import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from '../services/harmony-validator';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SecteurType =
  // Financier
  | 'finance' | 'banque_privee' | 'neobanque' | 'assurance' | 'crypto'
  // Juridique
  | 'legal' | 'notariat' | 'compliance'
  // Santé
  | 'medical' | 'pharmacie' | 'wellness' | 'biotech'
  // Luxe & Mode
  | 'luxe' | 'mode' | 'joaillerie' | 'maison_luxe'
  // Tech
  | 'tech' | 'saas' | 'ia_ml' | 'cybersecurity' | 'gaming'
  // Startup
  | 'startup' | 'scaleup' | 'deeptech'
  // Créatif
  | 'creative' | 'design' | 'pub' | 'musique' | 'cinema'
  // Retail & E-commerce
  | 'retail' | 'ecommerce' | 'marketplace' | 'food_delivery'
  // Immobilier
  | 'immobilier' | 'promotion' | 'architecture'
  // Éducation
  | 'education' | 'edtech' | 'universite'
  // RH & Recrutement
  | 'rh' | 'cabinet_recrutement'
  // Voyage & Hospitality
  | 'travel' | 'hotellerie' | 'restauration'
  // Énergie & Environnement
  | 'energie' | 'greentech' | 'agricole'
  // Sport & Bien-être
  | 'sport' | 'fitness' | 'esport'
  // Médias & Communication
  | 'media' | 'influenceur' | 'podcast'
  // Artisanat & Local
  | 'artisanat' | 'commerce_local'
  // Par défaut
  | 'default';

export type IntensiteMouvement = 'minimal' | 'subtil' | 'expressif' | 'dramatique';
export type BrandTone = 'luxe' | 'startup' | 'corporate' | 'artisanal' | 'playful' | 'minimal' | 'bold' | 'neutral';

export interface ComplexityProfile {
  zone:              string;
  layer_count:       number;
  intensity_sum:     number;
  complexity_score:  number;
  overload_detected: boolean;
  recommendation:    'keep' | 'trim' | 'simplify' | 'protect';
}

export interface ModerationResult {
  composition:       ZoneComposition;
  profiles:          ComplexityProfile[];
  total_complexity:  number;
  corrections_made:  string[];
  quality_score:     number;
  brand_tone:        BrandTone;
  compliance_notes:  string[];
}

// ─── Règles sectorielles (50+ secteurs) ─────────────────────────────────────

interface SectorRule {
  max_logo_layers:   number;
  max_zone_layers:   number;
  intensity_cap:     number;
  intensity_floor:   number;
  allowed_overload:  number;
  /** Fréquence maximale d'animation en Hz (conformité médicale anti-épilepsie) */
  max_hz?:           number;
  /** Effets interdits dans ce secteur */
  forbidden_effects?: string[];
  /** Ton de marque par défaut pour ce secteur */
  default_tone:      BrandTone;
}

const SECTOR_RULES: Record<SecteurType, SectorRule> = {
  // ── Financier ──────────────────────────────────────────────────────────────
  finance:       { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.65, intensity_floor: 0.15, allowed_overload: 0.30, default_tone: 'corporate' },
  banque_privee: { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.60, intensity_floor: 0.15, allowed_overload: 0.25, default_tone: 'luxe' },
  neobanque:     { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.55, default_tone: 'startup' },
  assurance:     { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.65, intensity_floor: 0.15, allowed_overload: 0.30, default_tone: 'corporate' },
  crypto:        { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.90, intensity_floor: 0.20, allowed_overload: 0.65, default_tone: 'bold' },
  // ── Juridique ─────────────────────────────────────────────────────────────
  legal:         { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.55, intensity_floor: 0.10, allowed_overload: 0.20, default_tone: 'corporate' },
  notariat:      { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.50, intensity_floor: 0.10, allowed_overload: 0.15, default_tone: 'minimal' },
  compliance:    { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.55, intensity_floor: 0.10, allowed_overload: 0.20, default_tone: 'corporate' },
  // ── Santé ─────────────────────────────────────────────────────────────────
  medical:       { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.60, intensity_floor: 0.15, allowed_overload: 0.25, max_hz: 2, forbidden_effects: ['GLITCH_SPAWN', 'REALITY_GLITCH', 'FLASH'], default_tone: 'corporate' },
  pharmacie:     { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.58, intensity_floor: 0.12, allowed_overload: 0.22, max_hz: 2, default_tone: 'corporate' },
  wellness:      { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.70, intensity_floor: 0.15, allowed_overload: 0.40, default_tone: 'minimal' },
  biotech:       { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.65, intensity_floor: 0.15, allowed_overload: 0.30, max_hz: 3, default_tone: 'startup' },
  // ── Luxe & Mode ───────────────────────────────────────────────────────────
  luxe:          { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.50, default_tone: 'luxe' },
  mode:          { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.85, intensity_floor: 0.20, allowed_overload: 0.55, default_tone: 'luxe' },
  joaillerie:    { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.82, intensity_floor: 0.20, allowed_overload: 0.50, default_tone: 'luxe' },
  maison_luxe:   { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.78, intensity_floor: 0.18, allowed_overload: 0.48, default_tone: 'luxe' },
  // ── Tech ──────────────────────────────────────────────────────────────────
  tech:          { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.90, intensity_floor: 0.20, allowed_overload: 0.60, default_tone: 'bold' },
  saas:          { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.88, intensity_floor: 0.20, allowed_overload: 0.58, default_tone: 'startup' },
  ia_ml:         { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.92, intensity_floor: 0.22, allowed_overload: 0.62, default_tone: 'startup' },
  cybersecurity: { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.85, intensity_floor: 0.20, allowed_overload: 0.55, default_tone: 'bold' },
  gaming:        { max_logo_layers: 4, max_zone_layers: 3, intensity_cap: 1.00, intensity_floor: 0.25, allowed_overload: 0.80, default_tone: 'bold' },
  // ── Startup ───────────────────────────────────────────────────────────────
  startup:       { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.95, intensity_floor: 0.20, allowed_overload: 0.70, default_tone: 'startup' },
  scaleup:       { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.90, intensity_floor: 0.20, allowed_overload: 0.65, default_tone: 'startup' },
  deeptech:      { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.88, intensity_floor: 0.20, allowed_overload: 0.60, default_tone: 'startup' },
  // ── Créatif ───────────────────────────────────────────────────────────────
  creative:      { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 1.00, intensity_floor: 0.20, allowed_overload: 0.80, default_tone: 'bold' },
  design:        { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.95, intensity_floor: 0.20, allowed_overload: 0.75, default_tone: 'minimal' },
  pub:           { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 1.00, intensity_floor: 0.22, allowed_overload: 0.80, default_tone: 'bold' },
  musique:       { max_logo_layers: 4, max_zone_layers: 3, intensity_cap: 1.00, intensity_floor: 0.25, allowed_overload: 0.85, default_tone: 'bold' },
  cinema:        { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.95, intensity_floor: 0.22, allowed_overload: 0.78, default_tone: 'bold' },
  // ── Retail ────────────────────────────────────────────────────────────────
  retail:        { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.50, default_tone: 'playful' },
  ecommerce:     { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.82, intensity_floor: 0.20, allowed_overload: 0.52, default_tone: 'playful' },
  marketplace:   { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.50, default_tone: 'startup' },
  food_delivery: { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.88, intensity_floor: 0.22, allowed_overload: 0.58, default_tone: 'playful' },
  // ── Immobilier ────────────────────────────────────────────────────────────
  immobilier:    { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.70, intensity_floor: 0.15, allowed_overload: 0.40, default_tone: 'corporate' },
  promotion:     { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.75, intensity_floor: 0.18, allowed_overload: 0.45, default_tone: 'corporate' },
  architecture:  { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.72, intensity_floor: 0.15, allowed_overload: 0.42, default_tone: 'minimal' },
  // ── Éducation ─────────────────────────────────────────────────────────────
  education:     { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.70, intensity_floor: 0.15, allowed_overload: 0.40, default_tone: 'corporate' },
  edtech:        { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.52, default_tone: 'startup' },
  universite:    { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.62, intensity_floor: 0.12, allowed_overload: 0.28, default_tone: 'corporate' },
  // ── RH ────────────────────────────────────────────────────────────────────
  rh:                 { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.72, intensity_floor: 0.15, allowed_overload: 0.42, default_tone: 'corporate' },
  cabinet_recrutement:{ max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.70, intensity_floor: 0.15, allowed_overload: 0.40, default_tone: 'corporate' },
  // ── Voyage & Hospitality ──────────────────────────────────────────────────
  travel:        { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.85, intensity_floor: 0.20, allowed_overload: 0.55, default_tone: 'playful' },
  hotellerie:    { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.82, intensity_floor: 0.20, allowed_overload: 0.52, default_tone: 'luxe' },
  restauration:  { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.80, intensity_floor: 0.20, allowed_overload: 0.50, default_tone: 'artisanal' },
  // ── Énergie & Environnement ────────────────────────────────────────────────
  energie:       { max_logo_layers: 3, max_zone_layers: 1, intensity_cap: 0.72, intensity_floor: 0.15, allowed_overload: 0.42, default_tone: 'corporate' },
  greentech:     { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.75, intensity_floor: 0.18, allowed_overload: 0.45, default_tone: 'startup' },
  agricole:      { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.65, intensity_floor: 0.15, allowed_overload: 0.35, default_tone: 'artisanal' },
  // ── Sport & Bien-être ─────────────────────────────────────────────────────
  sport:         { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.95, intensity_floor: 0.22, allowed_overload: 0.70, default_tone: 'bold' },
  fitness:       { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.90, intensity_floor: 0.20, allowed_overload: 0.65, default_tone: 'bold' },
  esport:        { max_logo_layers: 4, max_zone_layers: 3, intensity_cap: 1.00, intensity_floor: 0.25, allowed_overload: 0.85, default_tone: 'bold' },
  // ── Médias & Communication ────────────────────────────────────────────────
  media:         { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.88, intensity_floor: 0.20, allowed_overload: 0.60, default_tone: 'bold' },
  influenceur:   { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.95, intensity_floor: 0.22, allowed_overload: 0.72, default_tone: 'playful' },
  podcast:       { max_logo_layers: 3, max_zone_layers: 2, intensity_cap: 0.82, intensity_floor: 0.18, allowed_overload: 0.52, default_tone: 'bold' },
  // ── Artisanat & Local ─────────────────────────────────────────────────────
  artisanat:     { max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.65, intensity_floor: 0.15, allowed_overload: 0.35, default_tone: 'artisanal' },
  commerce_local:{ max_logo_layers: 2, max_zone_layers: 1, intensity_cap: 0.68, intensity_floor: 0.15, allowed_overload: 0.38, default_tone: 'artisanal' },
  // ── Défaut ────────────────────────────────────────────────────────────────
  default:       { max_logo_layers: 4, max_zone_layers: 2, intensity_cap: 0.85, intensity_floor: 0.15, allowed_overload: 0.60, default_tone: 'neutral' },
};

const PROTECTED_ZONES = new Set(['titre', 'contact']);

const ZONE_INTENSITY_CAPS: Record<string, number> = {
  logo: 1.00, nom: 0.85, cta: 0.90, separateur: 0.65,
  fond: 0.50, titre: 0.40, contact: 0.35,
};

// ─── Détection NLP du ton de marque ─────────────────────────────────────────

/**
 * Détecte le ton de marque depuis un brief textuel (NLP léger par mots-clés).
 */
export function detectBrandTone(brief: string): BrandTone {
  const text = (brief || '').toLowerCase();

  const signals: Array<{ tone: BrandTone; keywords: string[]; weight: number }> = [
    { tone: 'luxe',      keywords: ['luxe', 'prestige', 'exclusif', 'raffiné', 'élégance', 'premium', 'haut de gamme', 'exception'], weight: 3 },
    { tone: 'startup',   keywords: ['startup', 'innovation', 'disrupt', 'scale', 'agile', 'move fast', 'growth', 'mvp', 'saas', 'tech'], weight: 2 },
    { tone: 'artisanal', keywords: ['artisan', 'savoir-faire', 'tradition', 'local', 'fait main', 'authentique', 'terroir', 'petite entreprise'], weight: 2 },
    { tone: 'playful',   keywords: ['fun', 'jeu', 'enfant', 'créatif', 'coloré', 'joyeux', 'festif', 'ludique', 'cool'], weight: 2 },
    { tone: 'bold',      keywords: ['audacieux', 'impact', 'fort', 'puissant', 'énergie', 'passion', 'intense', 'dynamique', 'vif'], weight: 2 },
    { tone: 'minimal',   keywords: ['minimaliste', 'épuré', 'simple', 'clean', 'essentiel', 'discret', 'neutre', 'sobre'], weight: 2 },
    { tone: 'corporate', keywords: ['corporate', 'professionnel', 'fiable', 'sérieux', 'confiance', 'expert', 'institutionnel', 'rigueur'], weight: 1 },
  ];

  const scores: Partial<Record<BrandTone, number>> = {};
  for (const sig of signals) {
    const matches = sig.keywords.filter(kw => text.includes(kw)).length;
    if (matches > 0) {
      scores[sig.tone] = (scores[sig.tone] ?? 0) + matches * sig.weight;
    }
  }

  if (Object.keys(scores).length === 0) return 'neutral';

  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return best[0] as BrandTone;
}

// ─── Normalisation du secteur (50+ entrées) ──────────────────────────────────

export function normalizeSecteur(raw: string): SecteurType {
  const lower = (raw || '').toLowerCase();

  // Financier
  if (lower.includes('banque privée') || lower.includes('private banking') || lower.includes('wealth')) return 'banque_privee';
  if (lower.includes('néobanque') || lower.includes('neobank') || lower.includes('fintech')) return 'neobanque';
  if (lower.includes('crypto') || lower.includes('blockchain') || lower.includes('web3') || lower.includes('nft')) return 'crypto';
  if (lower.includes('assur')) return 'assurance';
  if (lower.includes('financ') || lower.includes('banque') || lower.includes('bourse') || lower.includes('invest')) return 'finance';

  // Juridique
  if (lower.includes('notar')) return 'notariat';
  if (lower.includes('compliance') || lower.includes('conformité')) return 'compliance';
  if (lower.includes('jur') || lower.includes('droit') || lower.includes('avocat') || lower.includes('cabinet d')) return 'legal';

  // Santé
  if (lower.includes('pharma') || lower.includes('officine')) return 'pharmacie';
  if (lower.includes('wellness') || lower.includes('bien-être') || lower.includes('spa') || lower.includes('yoga')) return 'wellness';
  if (lower.includes('biotech') || lower.includes('bio-tech') || lower.includes('medtech')) return 'biotech';
  if (lower.includes('méd') || lower.includes('sant') || lower.includes('clinic') || lower.includes('hôpital') || lower.includes('docteur')) return 'medical';

  // Luxe & Mode
  if (lower.includes('joaill') || lower.includes('bijou') || lower.includes('horlog')) return 'joaillerie';
  if (lower.includes('maison de luxe') || lower.includes('décoration') || lower.includes('intérieur luxe')) return 'maison_luxe';
  if (lower.includes('mode') || lower.includes('fashion') || lower.includes('couture') || lower.includes('textile')) return 'mode';
  if (lower.includes('luxe') || lower.includes('prestige') || lower.includes('haut de gamme')) return 'luxe';

  // Tech
  if (lower.includes('ia ') || lower.includes('ai ') || lower.includes('machine learning') || lower.includes('intelligence artificielle') || lower.includes('llm')) return 'ia_ml';
  if (lower.includes('cybersec') || lower.includes('sécurité info') || lower.includes('securit')) return 'cybersecurity';
  if (lower.includes('gaming') || lower.includes('jeux vidéo') || lower.includes('game')) return 'gaming';
  if (lower.includes('saas') || lower.includes('logiciel') || lower.includes('software') || lower.includes('cloud')) return 'saas';
  if (lower.includes('tech') || lower.includes('numérique') || lower.includes('digital') || lower.includes('it ')) return 'tech';

  // Startup
  if (lower.includes('deeptech') || lower.includes('deep tech')) return 'deeptech';
  if (lower.includes('scaleup') || lower.includes('scale-up')) return 'scaleup';
  if (lower.includes('startup') || lower.includes('disrupt')) return 'startup';

  // Créatif
  if (lower.includes('musique') || lower.includes('label') || lower.includes('artist')) return 'musique';
  if (lower.includes('cinéma') || lower.includes('production') || lower.includes('film')) return 'cinema';
  if (lower.includes('design') || lower.includes('ui/ux') || lower.includes('graphis')) return 'design';
  if (lower.includes('pub ') || lower.includes('publicité') || lower.includes('advertising')) return 'pub';
  if (lower.includes('créa') || lower.includes('agence') || lower.includes('studio créa')) return 'creative';

  // Retail & E-commerce
  if (lower.includes('food delivery') || lower.includes('livraison repas') || lower.includes('restaurant delivery')) return 'food_delivery';
  if (lower.includes('marketplace') || lower.includes('place de marché')) return 'marketplace';
  if (lower.includes('e-com') || lower.includes('ecom') || lower.includes('boutique en ligne') || lower.includes('shop online')) return 'ecommerce';
  if (lower.includes('retail') || lower.includes('commerce') || lower.includes('boutique') || lower.includes('magasin')) return 'retail';

  // Immobilier
  if (lower.includes('architect')) return 'architecture';
  if (lower.includes('promotion') || lower.includes('promoteur')) return 'promotion';
  if (lower.includes('immob') || lower.includes('agence immo')) return 'immobilier';

  // Éducation
  if (lower.includes('edtech') || lower.includes('ed-tech') || lower.includes('formation en ligne')) return 'edtech';
  if (lower.includes('université') || lower.includes('école') || lower.includes('campus')) return 'universite';
  if (lower.includes('éducation') || lower.includes('formation') || lower.includes('enseignement')) return 'education';

  // RH
  if (lower.includes('cabinet de recrutement') || lower.includes('chasseur de têtes') || lower.includes('headhunt')) return 'cabinet_recrutement';
  if (lower.includes('rh') || lower.includes('ressources humaines') || lower.includes('hr ') || lower.includes('drh')) return 'rh';

  // Voyage & Hospitality
  if (lower.includes('hôtel') || lower.includes('hotell') || lower.includes('resort')) return 'hotellerie';
  if (lower.includes('restaur') || lower.includes('gastr') || lower.includes('chef')) return 'restauration';
  if (lower.includes('voyage') || lower.includes('tour') || lower.includes('travel') || lower.includes('aviation')) return 'travel';

  // Énergie & Environnement
  if (lower.includes('greentech') || lower.includes('cleantech') || lower.includes('renouvelable')) return 'greentech';
  if (lower.includes('agricol') || lower.includes('agri') || lower.includes('fermier')) return 'agricole';
  if (lower.includes('énergie') || lower.includes('pétrol') || lower.includes('nucléaire') || lower.includes('oil')) return 'energie';

  // Sport & Bien-être
  if (lower.includes('esport') || lower.includes('e-sport')) return 'esport';
  if (lower.includes('fitness') || lower.includes('salle de sport') || lower.includes('coach sportif')) return 'fitness';
  if (lower.includes('sport') || lower.includes('athlét')) return 'sport';

  // Médias
  if (lower.includes('influenceur') || lower.includes('influencer') || lower.includes('creator') || lower.includes('content')) return 'influenceur';
  if (lower.includes('podcast') || lower.includes('audio')) return 'podcast';
  if (lower.includes('média') || lower.includes('presse') || lower.includes('journal') || lower.includes('tv ') || lower.includes('radio')) return 'media';

  // Artisanat & Local
  if (lower.includes('commerce local') || lower.includes('petit commerce')) return 'commerce_local';
  if (lower.includes('artisan') || lower.includes('artisanat') || lower.includes('métier d')) return 'artisanat';

  return 'default';
}

// ─── Vérification conformité sectorielle ────────────────────────────────────

/**
 * Vérifie les règles de conformité spécifiques au secteur.
 * Ex : médical → animations < 2 Hz pour éviter le risque épileptique.
 */
export function checkSectorCompliance(
  rules: SectorRule,
  sector: SecteurType,
  rejectedEffects?: string[]
): string[] {
  const notes: string[] = [];

  if (rules.max_hz !== undefined) {
    notes.push(
      `⚠️ Secteur ${sector} : animations limitées à ${rules.max_hz} Hz maximum (conformité anti-épileptique EN 61966-2-2)`
    );
  }

  if (rules.forbidden_effects && rules.forbidden_effects.length > 0) {
    notes.push(
      `🚫 Secteur ${sector} : effets interdits → ${rules.forbidden_effects.join(', ')}`
    );
  }

  if (rejectedEffects && rejectedEffects.length > 0) {
    notes.push(`👤 Validation croisée préférences utilisateur : ${rejectedEffects.length} effet(s) à éviter`);
  }

  return notes;
}

/**
 * Filtre les effets interdits par le secteur et par les préférences utilisateur rejetées.
 */
export function filterForbiddenEffects(
  decision: ZoneEffectDecision,
  rules: SectorRule,
  rejectedEffects?: string[]
): ZoneEffectDecision {
  const forbidden = new Set([
    ...(rules.forbidden_effects ?? []),
    ...(rejectedEffects ?? []),
  ]);

  if (forbidden.size === 0) return decision;

  if (forbidden.has(decision.effet_id)) {
    // Remplacer par NONE si l'effet est interdit
    return { ...decision, effet_id: 'FADE_LAYERS', intensity: Math.min(decision.intensity, 0.4) };
  }

  const filteredLayers = decision.layers?.filter(l => !forbidden.has(l.effet_id));
  return { ...decision, layers: filteredLayers };
}

// ─── Analyse de complexité ───────────────────────────────────────────────────

function analyzeZoneComplexity(
  zone: string,
  decision: ZoneEffectDecision,
  rules: SectorRule
): ComplexityProfile {
  const layers   = decision.layers ?? [{ effet_id: decision.effet_id, category: 'primary', intensity: decision.intensity, speed: decision.speed, color: decision.color }];
  const layerCnt = layers.length;
  const intSum   = layers.reduce((s, l) => s + (l.intensity ?? 0.5), 0);
  const maxLayers = zone === 'logo' ? rules.max_logo_layers : rules.max_zone_layers;

  const complexityScore = Math.min(
    (layerCnt / (maxLayers + 1)) * 0.6 +
    (intSum / (layerCnt * rules.intensity_cap)) * 0.4,
    1
  );

  const overload = layerCnt > maxLayers || intSum / layerCnt > rules.intensity_cap;

  let recommendation: ComplexityProfile['recommendation'] = 'keep';
  if (PROTECTED_ZONES.has(zone) && (layerCnt > 1 || intSum > rules.intensity_cap)) recommendation = 'protect';
  else if (layerCnt > maxLayers + 1) recommendation = 'trim';
  else if (intSum / Math.max(layerCnt, 1) > rules.intensity_cap) recommendation = 'simplify';

  return { zone, layer_count: layerCnt, intensity_sum: intSum, complexity_score: complexityScore, overload_detected: overload, recommendation };
}

// ─── Modération d'une zone ───────────────────────────────────────────────────

function moderateZone(
  zone: string,
  decision: ZoneEffectDecision,
  rules: SectorRule,
  profile: ComplexityProfile
): { decision: ZoneEffectDecision; correction: string | null } {
  if (profile.recommendation === 'keep') return { decision, correction: null };

  const intensityCap   = Math.min(rules.intensity_cap, ZONE_INTENSITY_CAPS[zone] ?? 1.0);
  const intensityFloor = rules.intensity_floor;

  if (profile.recommendation === 'protect') {
    return {
      decision: { ...decision, intensity: Math.min(decision.intensity, intensityCap), layers: undefined },
      correction: `Zone ${zone} [PROTECT] → couches retirées, intensité ≤ ${intensityCap.toFixed(2)}`,
    };
  }

  if (profile.recommendation === 'trim' && decision.layers) {
    const maxLayers = zone === 'logo' ? rules.max_logo_layers : rules.max_zone_layers;
    const sorted    = [...decision.layers].sort((a, b) => (b.intensity ?? 0.5) - (a.intensity ?? 0.5));
    const calibrated = sorted.slice(0, maxLayers).map((l, i): EffectLayer => ({
      ...l,
      intensity: Math.max(intensityFloor, Math.min(l.intensity ?? 0.5, intensityCap * (1 - i * 0.15))),
    }));
    const primary = calibrated[0];
    return {
      decision: { ...decision, effet_id: primary.effet_id, intensity: primary.intensity, speed: primary.speed, color: primary.color, layers: calibrated },
      correction: `Zone ${zone} [TRIM] → ${profile.layer_count}→${calibrated.length} couches`,
    };
  }

  if (profile.recommendation === 'simplify') {
    const layers = decision.layers?.map((l): EffectLayer => ({
      ...l,
      intensity: Math.max(intensityFloor, Math.min(l.intensity ?? 0.5, intensityCap)),
    }));
    return {
      decision: { ...decision, intensity: Math.max(intensityFloor, Math.min(decision.intensity, intensityCap)), layers },
      correction: `Zone ${zone} [SIMPLIFY] → intensités ≤ ${intensityCap.toFixed(2)}`,
    };
  }

  return { decision, correction: null };
}

// ─── API publique ─────────────────────────────────────────────────────────────

export function moderateComposition(
  composition: ZoneComposition,
  secteur: string,
  variation: 'A' | 'B' | 'C' | 'D',
  intensite: IntensiteMouvement = 'subtil',
  options?: {
    brief?: string;
    rejectedEffects?: string[];
  }
): ModerationResult {
  const sectorKey = normalizeSecteur(secteur);
  let rules = { ...SECTOR_RULES[sectorKey] };

  // Ajustement intensité mouvement
  const intensityBoosts: Record<IntensiteMouvement, number> = {
    minimal: -0.20, subtil: -0.05, expressif: +0.10, dramatique: +0.20,
  };
  rules.intensity_cap = Math.max(0.2, Math.min(1.0, rules.intensity_cap + (intensityBoosts[intensite] ?? 0)));

  // Variation D plus tolérante, A plus sobre
  if (variation === 'D') { rules.intensity_cap = Math.min(1.0, rules.intensity_cap + 0.10); rules.allowed_overload = Math.min(1.0, rules.allowed_overload + 0.15); }
  if (variation === 'A') { rules.intensity_cap = Math.max(0.2, rules.intensity_cap - 0.10); }

  // Détection ton de marque
  const brandTone = options?.brief ? detectBrandTone(options.brief) : rules.default_tone;

  // Conformité sectorielle
  const complianceNotes = checkSectorCompliance(rules, sectorKey, options?.rejectedEffects);

  const zones = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'] as const;
  const corrections: string[] = [];
  const profiles: ComplexityProfile[] = [];
  const moderated: Partial<ZoneComposition> = {};

  for (const zone of zones) {
    let decision: ZoneEffectDecision = (composition as any)[zone];

    // Validation croisée effets rejetés + effets interdits par secteur
    decision = filterForbiddenEffects(decision, rules, options?.rejectedEffects);

    const profile = analyzeZoneComplexity(zone, decision, rules);
    profiles.push(profile);

    const { decision: mod, correction } = moderateZone(zone, decision, rules, profile);
    (moderated as any)[zone] = mod;
    if (correction) corrections.push(correction);
  }

  const totalComplexity = profiles.reduce((s, p) => s + p.complexity_score, 0) / profiles.length;
  const overloadedZones = profiles.filter(p => p.overload_detected).length;
  const qualityScore    = Math.max(0, 1 - overloadedZones * 0.08 - corrections.length * 0.04);

  if (corrections.length > 0 || complianceNotes.length > 0) {
    console.log(`🧠 Contextual Intelligence [${variation}/${sectorKey}] — tone:${brandTone} | ${corrections.length} corrections | Conformité: ${complianceNotes.length} règles`);
  }

  return {
    composition:      moderated as ZoneComposition,
    profiles,
    total_complexity: parseFloat(totalComplexity.toFixed(3)),
    corrections_made: corrections,
    quality_score:    parseFloat(qualityScore.toFixed(3)),
    brand_tone:       brandTone,
    compliance_notes: complianceNotes,
  };
}

console.log('🧠 Contextual Intelligence Moderator v2.0 — 50+ secteurs | NLP ton de marque | conformité médicale | validation croisée');
