import type { ZoneComposition, ZoneEffectDecision, LayerDecision } from './harmony-validator';

// ─── Types ─────────────────────────────────────────────────────────────────────

type VariationKey = 'A' | 'B' | 'C' | 'D';
type SectorGroup  = 'tech' | 'luxe' | 'sante' | 'creation' | 'sport' | 'default';

// ─── Détection du groupe sectoriel ─────────────────────────────────────────────

function sectorGroup(secteur: string): SectorGroup {
  const s = (secteur || '').toLowerCase();
  if (/tech|digital|ia|it|web|logiciel|saas|startup|dev|code|cyber/.test(s))          return 'tech';
  if (/luxe|luxury|bijou|mode|haute|premium|prestige|joaill|couture|watch/.test(s))    return 'luxe';
  if (/sant[eé]|health|m[eé]dical|pharma|clinique|doctor|bien.?[eê]tre|psy/.test(s))  return 'sante';
  if (/design|art|cr[eé]atif|creative|photo|media|agence|studio|architect/.test(s))   return 'creation';
  if (/sport|fitness|coach|gym|yoga|[eé]nergie|running|trail|muscl/.test(s))          return 'sport';
  return 'default';
}

// ─── Catalogue de couches LOGO par variation ────────────────────────────────────
//
// Catégories de rendu (LAYER_RENDER_ORDER logo) :
//   ['energie', 'matiere', 'dimension', 'transformation']
// → rendu du fond vers le premier plan dans cet ordre.

const LOGO_LAYERS: Record<VariationKey, LayerDecision[]> = {

  // A — Stable et Rassurant : respiration douce + halo bpm + aura subtile
  A: [
    { category: 'energie',        effet_id: 'LOGO_SOUL_AURA',         intensity: 0.60, speed: 'slow',   color: '', raison: 'aura ambiante apaisante' },
    { category: 'matiere',        effet_id: 'LOGO_VOLUME_BREATHE',    intensity: 0.80, speed: 'slow',   color: '', raison: 'respiration naturelle et douce' },
    { category: 'dimension',      effet_id: 'LOGO_HALO_PULSE',        intensity: 0.65, speed: 'slow',   color: '', raison: 'halo bpm rassurant' },
    { category: 'transformation', effet_id: 'LOGO_METAL_BRUSH',       intensity: 0.45, speed: 'slow',   color: '', raison: 'reflet métal premium' },
  ],

  // B — Précis et Dynamique : 3D float + orbites + corona + métal
  B: [
    { category: 'energie',        effet_id: 'LOGO_ELECTRIC_CORONA',   intensity: 0.70, speed: 'medium', color: '', raison: 'corona électrique active' },
    { category: 'matiere',        effet_id: 'LOGO_METAL_BRUSH',       intensity: 0.80, speed: 'medium', color: '', raison: 'brossage métal dynamique' },
    { category: 'dimension',      effet_id: 'LOGO_ORBITAL_PARTICLES', intensity: 0.75, speed: 'medium', color: '', raison: 'orbites de précision' },
    { category: 'transformation', effet_id: 'LOGO_3D_FLOAT',          intensity: 0.80, speed: 'medium', color: '', raison: 'flottement 3D dynamique' },
  ],

  // C — Profond et Atmosphérique : prisme + bord liquide + gyro + halo profond
  C: [
    { category: 'energie',        effet_id: 'LOGO_HALO_PULSE',        intensity: 0.60, speed: 'slow',   color: '', raison: 'halo atmosphérique profond' },
    { category: 'matiere',        effet_id: 'LOGO_LIQUID_EDGE',       intensity: 0.70, speed: 'slow',   color: '', raison: 'contour liquide organique' },
    { category: 'dimension',      effet_id: 'LOGO_PRISM_REFRACT',     intensity: 0.65, speed: 'slow',   color: '', raison: 'réfraction prismatique profonde' },
    { category: 'transformation', effet_id: 'LOGO_GYRO_TILT',         intensity: 0.55, speed: 'slow',   color: '', raison: 'tilt gyroscopique subtil' },
  ],

  // D — Puissant et Mémorable : 5 couches max-impact
  D: [
    { category: 'energie',        effet_id: 'LOGO_SOUL_AURA',         intensity: 0.90, speed: 'medium', color: '', raison: 'aura puissante maximale' },
    { category: 'matiere',        effet_id: 'LOGO_GLASS_IRIS',        intensity: 0.90, speed: 'medium', color: '', raison: 'iris prismatique mémorable' },
    { category: 'dimension',      effet_id: 'LOGO_CRYSTAL_FRAGMENT',  intensity: 0.80, speed: 'medium', color: '', raison: 'fragments cristallins saillants' },
    { category: 'transformation', effet_id: 'LOGO_3D_FLOAT',          intensity: 0.90, speed: 'medium', color: '', raison: 'flottement 3D puissant' },
  ],
};

// Couche sectorielle supplémentaire pour le logo (injectée en 5e position)
const LOGO_SECTOR_LAYER: Record<SectorGroup, LayerDecision> = {
  tech:     { category: 'dimension',      effet_id: 'LOGO_NEURAL_MORPH',    intensity: 0.65, speed: 'medium', color: '', raison: 'morphologie neuronale tech' },
  luxe:     { category: 'matiere',        effet_id: 'LOGO_GOLD_POLISH',     intensity: 0.80, speed: 'slow',   color: '', raison: 'polish doré prestige' },
  sante:    { category: 'energie',        effet_id: 'LOGO_HALO_PULSE',      intensity: 0.50, speed: 'slow',   color: '', raison: 'halo douceur santé' },
  creation: { category: 'dimension',      effet_id: 'LOGO_PRISM_REFRACT',   intensity: 0.70, speed: 'medium', color: '', raison: 'réfraction créative vibrante' },
  sport:    { category: 'energie',        effet_id: 'LOGO_ELECTRIC_CORONA', intensity: 0.80, speed: 'fast',   color: '', raison: 'corona énergie sport' },
  default:  { category: 'transformation', effet_id: 'LOGO_NEON_OUTLINE',    intensity: 0.50, speed: 'slow',   color: '', raison: 'contour néon universel' },
};

// ─── Catalogue de couches NOM par variation ────────────────────────────────────
//
// Catégories : ['lumiere', 'mouvement']
// Règle : jamais de rotation, flip ou transformation géométrique sur le texte.

const NOM_LAYERS: Record<VariationKey, LayerDecision[]> = {
  A: [
    { category: 'lumiere',   effet_id: 'NOM_SHIMMER_GOLD',  intensity: 0.70, speed: 'slow',   color: '', raison: 'shimmer doré apaisant' },
    { category: 'mouvement', effet_id: 'NOM_CLEAN_BREATHE', intensity: 0.50, speed: 'slow',   color: '', raison: 'respiration opacité subtile' },
  ],
  B: [
    { category: 'lumiere',   effet_id: 'NOM_NEON_GLOW',     intensity: 0.80, speed: 'medium', color: '', raison: 'néon dynamique précis' },
    { category: 'mouvement', effet_id: 'NOM_LETTER_WAVE',   intensity: 0.60, speed: 'medium', color: '', raison: 'vague lettres active' },
  ],
  C: [
    { category: 'lumiere',   effet_id: 'NOM_HOLOGRAM_SCAN', intensity: 0.70, speed: 'slow',   color: '', raison: 'scan hologramme profond' },
    { category: 'mouvement', effet_id: 'NOM_FLOAT_SUBTLE',  intensity: 0.50, speed: 'slow',   color: '', raison: 'flottement atmosphérique' },
  ],
  D: [
    { category: 'lumiere',   effet_id: 'NOM_NEON_GLOW',     intensity: 1.00, speed: 'medium', color: '', raison: 'néon maximum impact' },
    { category: 'mouvement', effet_id: 'NOM_SHIMMER_GOLD',  intensity: 0.90, speed: 'medium', color: '', raison: 'shimmer doré puissant' },
  ],
};

// ─── Catalogue de couches TITRE par variation ──────────────────────────────────
//
// Catégories : ['rythme', 'texture', 'apparition']

const TITRE_LAYERS: Record<VariationKey, LayerDecision[]> = {
  A: [
    { category: 'rythme',    effet_id: 'TITRE_FADE_PRESENCE',          intensity: 0.60, speed: 'slow',   color: '', raison: 'présence apaisante' },
    { category: 'texture',   effet_id: 'TITRE_COLOR_SHIFT',            intensity: 0.50, speed: 'slow',   color: '', raison: 'glissement coloré doux' },
  ],
  B: [
    { category: 'rythme',    effet_id: 'TITRE_LETTER_SPACING_BREATHE', intensity: 0.70, speed: 'medium', color: '', raison: 'espacement dynamique actif' },
    { category: 'texture',   effet_id: 'TITRE_COLOR_SHIFT',            intensity: 0.70, speed: 'medium', color: '', raison: 'texture colorée dynamique' },
  ],
  C: [
    { category: 'rythme',    effet_id: 'TITRE_FADE_PRESENCE',          intensity: 0.70, speed: 'slow',   color: '', raison: 'présence atmosphérique profonde' },
    { category: 'apparition',effet_id: 'TITRE_SLIDE_IN',               intensity: 0.60, speed: 'slow',   color: '', raison: 'entrée glissée subtile' },
  ],
  D: [
    { category: 'rythme',    effet_id: 'TITRE_LETTER_SPACING_BREATHE', intensity: 0.90, speed: 'medium', color: '', raison: 'espacement mémorable fort' },
    { category: 'texture',   effet_id: 'TITRE_COLOR_SHIFT',            intensity: 0.80, speed: 'medium', color: '', raison: 'couleur puissante' },
    { category: 'apparition',effet_id: 'TITRE_FADE_PRESENCE',          intensity: 0.80, speed: 'medium', color: '', raison: 'présence maximale' },
  ],
};

// ─── Catalogue de couches SÉPARATEUR par variation ─────────────────────────────
//
// Catégories : ['rythme', 'flux', 'eclat']

const SEP_LAYERS: Record<VariationKey, LayerDecision[]> = {
  A: [
    { category: 'rythme', effet_id: 'SEP_BREATHING_CALM',  intensity: 0.60, speed: 'slow',   color: '', raison: 'respiration calme du séparateur' },
    { category: 'flux',   effet_id: 'SEP_ENERGY_FLOW',     intensity: 0.50, speed: 'slow',   color: '', raison: 'flux doux descendant' },
  ],
  B: [
    { category: 'rythme', effet_id: 'SEP_ELECTRIC_PULSE',  intensity: 0.80, speed: 'medium', color: '', raison: 'pulsation électrique précise' },
    { category: 'flux',   effet_id: 'SEP_PARTICLE_STREAM', intensity: 0.70, speed: 'medium', color: '', raison: 'flux particules actif' },
  ],
  C: [
    { category: 'rythme', effet_id: 'SEP_BREATHING_CALM',  intensity: 0.60, speed: 'slow',   color: '', raison: 'respiration profonde atmosphérique' },
    { category: 'flux',   effet_id: 'SEP_PARTICLE_STREAM', intensity: 0.60, speed: 'slow',   color: '', raison: 'flux atmosphérique descendant' },
  ],
  D: [
    { category: 'rythme', effet_id: 'SEP_ELECTRIC_PULSE',  intensity: 0.90, speed: 'medium', color: '', raison: 'pulsation électrique maximale' },
    { category: 'flux',   effet_id: 'SEP_ENERGY_FLOW',     intensity: 0.80, speed: 'medium', color: '', raison: 'flux énergétique puissant' },
    { category: 'eclat',  effet_id: 'SEP_GOLD_SHINE',      intensity: 0.80, speed: 'medium', color: '', raison: 'éclat doré mémorable' },
  ],
};

// ─── Catalogue de couches FOND par variation ───────────────────────────────────
//
// Catégories : ['epure', 'ambiance', 'structure']
// Intensités basses (≤ 0.5) pour ne pas masquer le contenu.

const FOND_LAYERS: Record<VariationKey, LayerDecision[]> = {
  A: [
    { category: 'ambiance',  effet_id: 'FOND_ATMOSPHERIC_BREATH', intensity: 0.35, speed: 'slow',   color: '', raison: 'ambiance apaisante légère' },
  ],
  B: [
    { category: 'ambiance',  effet_id: 'FOND_ATMOSPHERIC_BREATH', intensity: 0.35, speed: 'medium', color: '', raison: 'ambiance dynamique discrète' },
    { category: 'structure', effet_id: 'FOND_NEURAL_GRID',        intensity: 0.25, speed: 'slow',   color: '', raison: 'grille tech structurée' },
  ],
  C: [
    { category: 'ambiance',  effet_id: 'FOND_PLASMA_FIELD',       intensity: 0.35, speed: 'slow',   color: '', raison: 'champ plasma profond cosmique' },
    { category: 'structure', effet_id: 'FOND_STELLAR_DRIFT',      intensity: 0.25, speed: 'slow',   color: '', raison: 'dérive stellaire subtile' },
  ],
  D: [
    { category: 'ambiance',  effet_id: 'FOND_PLASMA_FIELD',       intensity: 0.40, speed: 'medium', color: '', raison: 'plasma puissant mémorable' },
    { category: 'structure', effet_id: 'FOND_STELLAR_DRIFT',      intensity: 0.30, speed: 'medium', color: '', raison: 'étoiles mémorables en mouvement' },
  ],
};

// ─── Catalogue de couches CONTACT par variation ────────────────────────────────
//
// Catégories : ['scan', 'emphasis', 'entree']

const CONTACT_LAYERS: Record<VariationKey, LayerDecision[]> = {
  A: [
    { category: 'emphasis', effet_id: 'CONTACT_HIGHLIGHT_HOVER', intensity: 0.60, speed: 'slow',   color: '', raison: 'surbrillance apaisante' },
  ],
  B: [
    { category: 'scan',     effet_id: 'CONTACT_SCAN_LINE',       intensity: 0.50, speed: 'medium', color: '', raison: 'scan dynamique hologramme' },
    { category: 'emphasis', effet_id: 'CONTACT_ICON_PULSE',      intensity: 0.70, speed: 'medium', color: '', raison: 'pulsation icônes active' },
  ],
  C: [
    { category: 'entree',   effet_id: 'CONTACT_CASCADE_APPEAR',  intensity: 0.70, speed: 'slow',   color: '', raison: 'cascade atmosphérique' },
    { category: 'emphasis', effet_id: 'CONTACT_HIGHLIGHT_HOVER', intensity: 0.50, speed: 'slow',   color: '', raison: 'surbrillance subtile douce' },
  ],
  D: [
    { category: 'scan',     effet_id: 'CONTACT_SCAN_LINE',       intensity: 0.60, speed: 'medium', color: '', raison: 'scan hologramme puissant' },
    { category: 'emphasis', effet_id: 'CONTACT_ICON_PULSE',      intensity: 0.90, speed: 'medium', color: '', raison: 'pulsation icônes maximale' },
    { category: 'entree',   effet_id: 'CONTACT_CASCADE_APPEAR',  intensity: 0.80, speed: 'medium', color: '', raison: 'cascade mémorable' },
  ],
};

// ─── Catalogue de couches CTA par variation ────────────────────────────────────
//
// Catégories : ['invitation', 'brillance', 'attraction']
// Le CTA est TOUJOURS en animation continue — jamais statique.

const CTA_LAYERS: Record<VariationKey, LayerDecision[]> = {
  A: [
    { category: 'invitation', effet_id: 'CTA_BREATH_INVITATION', intensity: 0.70, speed: 'slow',   color: '', raison: 'invitation douce pulsée' },
    { category: 'brillance',  effet_id: 'CTA_SHIMMER_SWEEP',     intensity: 0.60, speed: 'slow',   color: '', raison: 'shimmer apaisant' },
  ],
  B: [
    { category: 'invitation', effet_id: 'CTA_GRAVITY_PULSE',     intensity: 0.80, speed: 'medium', color: '', raison: 'pulse gravitationnel actif' },
    { category: 'brillance',  effet_id: 'CTA_SHIMMER_SWEEP',     intensity: 0.80, speed: 'medium', color: '', raison: 'shimmer dynamique fort' },
    { category: 'attraction', effet_id: 'CTA_ELECTRIC_BORDER',   intensity: 0.70, speed: 'medium', color: '', raison: 'bordure électrique précise' },
  ],
  C: [
    { category: 'invitation', effet_id: 'CTA_BREATH_INVITATION', intensity: 0.70, speed: 'slow',   color: '', raison: 'invitation atmosphérique' },
    { category: 'attraction', effet_id: 'CTA_PARTICLE_ATTRACT',  intensity: 0.60, speed: 'slow',   color: '', raison: 'attraction particules profonde' },
  ],
  D: [
    { category: 'invitation', effet_id: 'CTA_GRAVITY_PULSE',     intensity: 1.00, speed: 'medium', color: '', raison: 'pulse maximum impact' },
    { category: 'brillance',  effet_id: 'CTA_SHIMMER_SWEEP',     intensity: 1.00, speed: 'medium', color: '', raison: 'shimmer maximal permanent' },
    { category: 'attraction', effet_id: 'CTA_ELECTRIC_BORDER',   intensity: 0.90, speed: 'medium', color: '', raison: 'bordure électrique puissante' },
  ],
};

// ─── Effet primaire par zone et par variation ──────────────────────────────────
// (celui affiché dans ZoneEffectDecision.effet_id — sert de référence pour le rendu principal)

const ZONE_PRIMARY: Record<VariationKey, {
  logo: string; nom: string; titre: string;
  contact: string; separateur: string; fond: string; cta: string;
}> = {
  A: {
    logo:       'LOGO_VOLUME_BREATHE',
    nom:        'NOM_SHIMMER_GOLD',
    titre:      'TITRE_FADE_PRESENCE',
    contact:    'CONTACT_HIGHLIGHT_HOVER',
    separateur: 'SEP_BREATHING_CALM',
    fond:       'FOND_ATMOSPHERIC_BREATH',
    cta:        'CTA_BREATH_INVITATION',
  },
  B: {
    logo:       'LOGO_3D_FLOAT',
    nom:        'NOM_NEON_GLOW',
    titre:      'TITRE_LETTER_SPACING_BREATHE',
    contact:    'CONTACT_ICON_PULSE',
    separateur: 'SEP_ELECTRIC_PULSE',
    fond:       'FOND_NEURAL_GRID',
    cta:        'CTA_SHIMMER_SWEEP',
  },
  C: {
    logo:       'LOGO_PRISM_REFRACT',
    nom:        'NOM_HOLOGRAM_SCAN',
    titre:      'TITRE_FADE_PRESENCE',
    contact:    'CONTACT_CASCADE_APPEAR',
    separateur: 'SEP_ENERGY_FLOW',
    fond:       'FOND_PLASMA_FIELD',
    cta:        'CTA_PARTICLE_ATTRACT',
  },
  D: {
    logo:       'LOGO_GLASS_IRIS',
    nom:        'NOM_NEON_GLOW',
    titre:      'TITRE_COLOR_SHIFT',
    contact:    'CONTACT_ICON_PULSE',
    separateur: 'SEP_GOLD_SHINE',
    fond:       'FOND_STELLAR_DRIFT',
    cta:        'CTA_ELECTRIC_BORDER',
  },
};

// ─── Fonction principale ────────────────────────────────────────────────────────
//
// Construit les 4 ZoneCompositions chorégraphiées (A, B, C, D) avec couches riches.
// Chaque zone reçoit un tableau `layers` ordonné du fond vers le premier plan.

// ─── Seed déterministe par utilisateur ─────────────────────────────────────────
// Produit une empreinte d'animation unique pour chaque utilisateur (même secteur,
// animations légèrement différentes). Hash Jenkins one-at-a-time.

function hashUserSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
    hash += hash << 10;
    hash ^= hash >> 6;
    hash |= 0;
  }
  hash += hash << 3;
  hash ^= hash >> 11;
  hash += hash << 15;
  return Math.abs(hash);
}

// Extrait un facteur normalisé [0,1] à partir d'un hash et d'un décalage de bits
function seedFactor(hash: number, shift: number, range: number): number {
  return ((hash >> shift) & 0xff) / 255 * range;
}

export function buildChoreographedCompositions(
  style: { intensite?: string; secteur?: string; userSeed?: string },
  palette: string[]
): { A: ZoneComposition; B: ZoneComposition; C: ZoneComposition; D: ZoneComposition } {

  const group      = sectorGroup(style.secteur || '');
  const intensite  = style.intensite || 'medium';

  // iScale relevé : medium passe de 0.78 → 0.92 pour montrer la vraie puissance des effets
  const iScale     = intensite === 'high' ? 1.00 : intensite === 'low' ? 0.72 : 0.92;
  const c1         = palette[1] ?? '#6366f1';

  // Hash déterministe unique par utilisateur (0 si pas de seed → comportement standard)
  const hash = style.userSeed ? hashUserSeed(style.userSeed) : 0;

  // Perturbation d'intensité par variation — chaque variation utilise des bits différents
  // Range ±0.12 centré sur 0 → chaque utilisateur a son empreinte d'animation unique
  const varPerturbation: Record<VariationKey, number> = {
    A: hash > 0 ? (seedFactor(hash,  0, 0.24) - 0.12) : 0,
    B: hash > 0 ? (seedFactor(hash,  8, 0.20) - 0.10) : 0,
    C: hash > 0 ? (seedFactor(hash, 16, 0.22) - 0.11) : 0,
    D: hash > 0 ? (seedFactor(hash, 24, 0.18) - 0.09) : 0,
  };

  // Micro-variation de vitesse par utilisateur pour les variations B et D
  const speedVariant = (varKey: VariationKey, base: 'slow' | 'medium'): 'slow' | 'medium' | 'fast' => {
    if (hash === 0) return base;
    if (varKey === 'B' || varKey === 'D') {
      const bit = (hash >> (varKey === 'B' ? 4 : 12)) & 0x3;
      if (bit === 3) return 'fast';
    }
    return base;
  };

  const buildComposition = (varKey: VariationKey): ZoneComposition => {

    const primary     = ZONE_PRIMARY[varKey];
    const baseSpeed: 'slow' | 'medium' = (varKey === 'A' || varKey === 'C') ? 'slow' : 'medium';
    const effectiveSpeed = speedVariant(varKey, baseSpeed);
    const perturbation   = varPerturbation[varKey];

    // Applique la couleur palette, le scale d'intensité et la perturbation unique par utilisateur
    const scaleLayers = (layers: LayerDecision[]): LayerDecision[] =>
      layers.map(l => ({
        ...l,
        color:     l.color || c1,
        intensity: Math.min(1, Math.max(0.15, l.intensity * iScale + perturbation)),
      }));

    // Construit une décision de zone avec couches (layers) et effet primaire
    // intensityBase relevé de 0.80 → 0.92 pour un rendu plus affirmé
    const makeDecision = (
      effet_id: string,
      layers: LayerDecision[],
      intensityMult = 1.0
    ): ZoneEffectDecision => ({
      effet_id,
      intensity: Math.min(1, Math.max(0.15, (0.92 + perturbation) * iScale * intensityMult)),
      speed: effectiveSpeed as any,
      color: c1,
      layers: scaleLayers(layers),
    });

    // Logo : 4 couches standard + 1 couche sectorielle = 5 couches
    const sectorLayer = LOGO_SECTOR_LAYER[group];
    const logoLayers: LayerDecision[] = [
      ...scaleLayers(LOGO_LAYERS[varKey]),
      {
        ...sectorLayer,
        color:     sectorLayer.color || c1,
        intensity: Math.min(1, Math.max(0.15, sectorLayer.intensity * iScale + perturbation)),
      },
    ];

    return {
      logo:        { ...makeDecision(primary.logo,       logoLayers),       },
      nom:          makeDecision(primary.nom,        scaleLayers(NOM_LAYERS[varKey])),
      titre:        makeDecision(primary.titre,      scaleLayers(TITRE_LAYERS[varKey]),  0.88),
      contact:      makeDecision(primary.contact,    scaleLayers(CONTACT_LAYERS[varKey]), 0.85),
      separateur:   makeDecision(primary.separateur, scaleLayers(SEP_LAYERS[varKey])),
      fond:         makeDecision(primary.fond,       scaleLayers(FOND_LAYERS[varKey]),   0.62),
      cta:          makeDecision(primary.cta,        scaleLayers(CTA_LAYERS[varKey])),
      compatibilityScore: 95,
      wcagCompliant:     true,
      performanceTier:   varKey === 'D' ? 'ultra' : varKey === 'B' ? 'ultra' : 'standard',
    };
  };

  return {
    A: buildComposition('A'),
    B: buildComposition('B'),
    C: buildComposition('C'),
    D: buildComposition('D'),
  };
}

// ─── Enrichissement AI + Chorégraphie ─────────────────────────────────────────
//
// Quand l'AI fournit ses propres ZoneCompositions, on conserve l'effet_id de l'AI
// mais on INJECTE les couches (layers) chorégraphiées pour enrichir l'animation.
// Règle : l'AI pilote QUOI animer, le chorégraphe pilote COMMENT et COMBIEN.

export function mergeWithChoreography(
  aiCompositions: { A: ZoneComposition; B: ZoneComposition; C: ZoneComposition; D: ZoneComposition },
  choreoCompositions: { A: ZoneComposition; B: ZoneComposition; C: ZoneComposition; D: ZoneComposition }
): { A: ZoneComposition; B: ZoneComposition; C: ZoneComposition; D: ZoneComposition } {

  const ZONE_KEYS: (keyof ZoneComposition)[] = ['logo', 'nom', 'titre', 'contact', 'separateur', 'fond', 'cta'];

  const mergeVariation = (ai: ZoneComposition, choreo: ZoneComposition): ZoneComposition => {
    const merged: ZoneComposition = { ...choreo };

    for (const zone of ZONE_KEYS) {
      const aiZone     = ai[zone]     as ZoneEffectDecision | undefined;
      const choreoZone = choreo[zone] as ZoneEffectDecision | undefined;

      if (!choreoZone) continue;

      if (aiZone?.effet_id && aiZone.effet_id !== 'null' && aiZone.effet_id !== 'FADE LAYERS') {
        // L'AI a choisi un effet primaire : on le garde, on injecte les couches chorégraphiées
        (merged as any)[zone] = {
          ...choreoZone,
          effet_id:  aiZone.effet_id,
          color:     (aiZone.color && aiZone.color !== '#000000') ? aiZone.color : choreoZone.color,
          intensity: aiZone.intensity ?? choreoZone.intensity,
          // layers vient du chorégraphe (déjà dans choreoZone)
        } as ZoneEffectDecision;
      }
      // Sinon on garde la décision chorégraphiée complète (effet_id + layers)
    }

    return {
      ...merged,
      compatibilityScore: ai.compatibilityScore ?? choreo.compatibilityScore,
      wcagCompliant:      ai.wcagCompliant      ?? choreo.wcagCompliant,
      performanceTier:    choreo.performanceTier,
    };
  };

  return {
    A: mergeVariation(aiCompositions.A, choreoCompositions.A),
    B: mergeVariation(aiCompositions.B, choreoCompositions.B),
    C: mergeVariation(aiCompositions.C, choreoCompositions.C),
    D: mergeVariation(aiCompositions.D, choreoCompositions.D),
  };
}
