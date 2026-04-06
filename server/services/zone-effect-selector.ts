import { readFileSync } from 'fs';
import { join } from 'path';

export interface EffetCandidat {
  id: string;
  nom: string;
  description: string;
  score: number;
  intensite_recommandee: number;
  css_technique: string;
  duree_cycle?: string;
}

export interface ZoneSelection {
  logo: EffetCandidat[];
  nom: EffetCandidat[];
  titre: EffetCandidat[];
  contact: EffetCandidat[];
  separateur: EffetCandidat[];
  fond: EffetCandidat[];
  cta: EffetCandidat[];
}

export type VariationContext = 'A' | 'B' | 'C' | 'D';
export type IntensiteMouvement = 'minimal' | 'subtil' | 'expressif' | 'dramatique';

// ═══════════════════════════════════════════════════════
// PROFILS DE VARIATION — personnalité de chaque acte
// ═══════════════════════════════════════════════════════
const VARIATION_PROFILES: Record<VariationContext, {
  label: string;
  emotion: string;
  energie: 'calme' | 'moderee' | 'intense' | 'explosive';
  intensite_mult: number;
  speed_bias: 'slow' | 'medium' | 'fast';
  keywords: string[];
}> = {
  A: {
    label: 'L\'Autorité Silencieuse',
    emotion: 'confiance profonde',
    energie: 'calme',
    intensite_mult: 0.7,
    speed_bias: 'slow',
    keywords: ['organique', 'respiration', 'sérénité', 'présence', 'ancré'],
  },
  B: {
    label: 'La Précision Tranchante',
    emotion: 'admiration technique',
    energie: 'moderee',
    intensite_mult: 1.0,
    speed_bias: 'medium',
    keywords: ['précis', 'géométrique', 'électrique', 'scanning', 'énergie'],
  },
  C: {
    label: 'La Profondeur Atmosphérique',
    emotion: 'fascination mystérieuse',
    energie: 'moderee',
    intensite_mult: 0.85,
    speed_bias: 'slow',
    keywords: ['profondeur', 'atmosphère', 'plasma', 'cosmique', 'aura'],
  },
  D: {
    label: 'L\'Éclat Mémorable',
    emotion: 'désir et prestige',
    energie: 'explosive',
    intensite_mult: 1.25,
    speed_bias: 'fast',
    keywords: ['prestige', 'or', 'éclat', 'particules', 'orbite', 'explosion'],
  },
};

// ═══════════════════════════════════════════════════════
// EFFETS PRIORITAIRES PAR VARIATION — garantit la diversité
// ═══════════════════════════════════════════════════════
const VARIATION_PREFERRED_EFFECTS: Record<VariationContext, string[]> = {
  A: [
    'LOGO_VOLUME_BREATHE', 'LOGO_HALO_PULSE', 'LOGO_SOUL_AURA', 'LOGO_MATTE_FLAT',
    'NOM_CLEAN_BREATHE', 'NOM_SHIMMER_GOLD',
    'SEP_BREATHING_CALM', 'SEP_SOFT_GLOW',
    'FOND_ATMOSPHERIC_BREATH', 'FOND_CLEAN_DARK', 'FOND_SUBTLE_TEXTURE',
    'CTA_BREATH_INVITATION', 'CTA_STATIC_PRESENCE',
    'TITRE_SUBTLE_FADE', 'CONTACT_FADE_IN',
  ],
  B: [
    'LOGO_3D_FLOAT', 'LOGO_ELECTRIC_CORONA', 'LOGO_METAL_BRUSH', 'LOGO_GLASS_IRIS',
    'NOM_HOLOGRAM_SCAN', 'NOM_ELECTRIC_TRACE',
    'SEP_ENERGY_FLOW', 'SEP_ELECTRIC_PULSE', 'SEP_LASER_CUT',
    'FOND_NEURAL_GRID', 'FOND_DIGITAL_RAIN', 'FOND_GEOMETRIC_PULSE',
    'CTA_ELECTRIC_BORDER', 'CTA_NEON_FLICKER',
    'TITRE_DIGITAL_GLITCH', 'CONTACT_TYPEWRITER',
  ],
  C: [
    'LOGO_GYRO_TILT', 'LOGO_NEURAL_MORPH', 'LOGO_PRISM_REFRACT', 'LOGO_MATTE_FLAT',
    'NOM_AURORA_SHIMMER', 'NOM_DEPTH_SHADOW',
    'SEP_PARTICLE_STREAM', 'SEP_PLASMA_WAVE',
    'FOND_STELLAR_DRIFT', 'FOND_PLASMA_FIELD', 'FOND_AURORA_NEBULA',
    'CTA_SHIMMER_SWEEP', 'CTA_PULSE_RING',
    'TITRE_WAVE_DISTORTION', 'CONTACT_CONSTELLATION',
  ],
  D: [
    'LOGO_ORBITAL_PARTICLES', 'LOGO_CRYSTAL_FRAGMENT', 'LOGO_GOLD_POLISH', 'LOGO_NEON_OUTLINE',
    'NOM_NEON_GLOW', 'NOM_PARTICLE_BURST',
    'SEP_GOLD_SHINE', 'SEP_SUPERNOVA_BURST',
    'FOND_VORTEX_SPIRAL', 'FOND_QUANTUM_FIELD', 'FOND_FIRE_AMBIENT',
    'CTA_GRAVITY_PULSE', 'CTA_PARTICLE_ATTRACT', 'CTA_EXPLOSION_REVEAL',
    'TITRE_GOLD_REVEAL', 'CONTACT_SHIMMER_CASCADE',
  ],
};

// ═══════════════════════════════════════════════════════
// MATRICE SÉMANTIQUE SECTEUR → ADN VISUEL
// Logique métier profonde : chaque secteur a son identité
// ═══════════════════════════════════════════════════════
interface SectorProfile {
  label: string;
  valeurs_cles: string[];
  intensite_naturelle: number;
  effets_affinis: string[];
  effets_proscrits: string[];
  couleur_energie: 'froide' | 'chaude' | 'neutre' | 'dorée';
  speed_naturel: 'slow' | 'medium' | 'fast';
}

const SECTOR_PROFILES: Record<string, SectorProfile> = {
  tech: {
    label: 'Technologie & Digital',
    valeurs_cles: ['innovation', 'précision', 'vitesse', 'intelligence'],
    intensite_naturelle: 0.65,
    effets_affinis: ['LOGO_ELECTRIC_CORONA', 'LOGO_NEURAL_MORPH', 'LOGO_3D_FLOAT', 'NOM_HOLOGRAM_SCAN', 'FOND_NEURAL_GRID', 'SEP_ELECTRIC_PULSE', 'CTA_ELECTRIC_BORDER'],
    effets_proscrits: ['LOGO_GOLD_POLISH', 'FOND_AURORA_NEBULA', 'CTA_BREATH_INVITATION'],
    couleur_energie: 'froide',
    speed_naturel: 'medium',
  },
  luxe: {
    label: 'Luxe & Prestige',
    valeurs_cles: ['excellence', 'rareté', 'artisanat', 'émotion'],
    intensite_naturelle: 0.55,
    effets_affinis: ['LOGO_GOLD_POLISH', 'LOGO_HALO_PULSE', 'NOM_SHIMMER_GOLD', 'SEP_GOLD_SHINE', 'FOND_STELLAR_DRIFT', 'CTA_SHIMMER_SWEEP'],
    effets_proscrits: ['LOGO_ELECTRIC_CORONA', 'FOND_DIGITAL_RAIN', 'FOND_NEURAL_GRID', 'CTA_ELECTRIC_BORDER', 'TITRE_DIGITAL_GLITCH'],
    couleur_energie: 'dorée',
    speed_naturel: 'slow',
  },
  juridique: {
    label: 'Droit & Juridique',
    valeurs_cles: ['autorité', 'rigueur', 'confiance', 'sobriété'],
    intensite_naturelle: 0.35,
    effets_affinis: ['LOGO_VOLUME_BREATHE', 'LOGO_METAL_BRUSH', 'NOM_CLEAN_BREATHE', 'SEP_BREATHING_CALM', 'FOND_CLEAN_DARK', 'CTA_STATIC_PRESENCE'],
    effets_proscrits: ['LOGO_CRYSTAL_FRAGMENT', 'LOGO_NEON_OUTLINE', 'FOND_VORTEX_SPIRAL', 'FOND_FIRE_AMBIENT', 'NOM_NEON_GLOW'],
    couleur_energie: 'froide',
    speed_naturel: 'slow',
  },
  finance: {
    label: 'Finance & Banque',
    valeurs_cles: ['stabilité', 'croissance', 'confiance', 'performance'],
    intensite_naturelle: 0.4,
    effets_affinis: ['LOGO_METAL_BRUSH', 'LOGO_HALO_PULSE', 'NOM_CLEAN_BREATHE', 'SEP_ENERGY_FLOW', 'FOND_GEOMETRIC_PULSE', 'CTA_PULSE_RING'],
    effets_proscrits: ['LOGO_PRISM_REFRACT', 'FOND_AURORA_NEBULA', 'FOND_FIRE_AMBIENT', 'NOM_NEON_GLOW'],
    couleur_energie: 'froide',
    speed_naturel: 'slow',
  },
  créatif: {
    label: 'Créatif & Design',
    valeurs_cles: ['originalité', 'expression', 'audace', 'esthétique'],
    intensite_naturelle: 0.75,
    effets_affinis: ['LOGO_PRISM_REFRACT', 'LOGO_GLASS_IRIS', 'NOM_AURORA_SHIMMER', 'SEP_PLASMA_WAVE', 'FOND_AURORA_NEBULA', 'CTA_EXPLOSION_REVEAL'],
    effets_proscrits: ['FOND_CLEAN_DARK', 'CTA_STATIC_PRESENCE', 'LOGO_MATTE_FLAT'],
    couleur_energie: 'froide',
    speed_naturel: 'fast',
  },
  médical: {
    label: 'Santé & Médical',
    valeurs_cles: ['sérénité', 'confiance', 'soin', 'précision'],
    intensite_naturelle: 0.3,
    effets_affinis: ['LOGO_SOUL_AURA', 'LOGO_VOLUME_BREATHE', 'NOM_CLEAN_BREATHE', 'SEP_BREATHING_CALM', 'FOND_ATMOSPHERIC_BREATH', 'CTA_BREATH_INVITATION'],
    effets_proscrits: ['LOGO_ELECTRIC_CORONA', 'FOND_VORTEX_SPIRAL', 'FOND_FIRE_AMBIENT', 'NOM_PARTICLE_BURST', 'CTA_EXPLOSION_REVEAL'],
    couleur_energie: 'froide',
    speed_naturel: 'slow',
  },
  beauté: {
    label: 'Beauté & Mode',
    valeurs_cles: ['séduction', 'élégance', 'désirabilité', 'raffinement'],
    intensite_naturelle: 0.6,
    effets_affinis: ['LOGO_GLASS_IRIS', 'LOGO_HALO_PULSE', 'NOM_AURORA_SHIMMER', 'NOM_SHIMMER_GOLD', 'FOND_STELLAR_DRIFT', 'CTA_SHIMMER_SWEEP'],
    effets_proscrits: ['FOND_DIGITAL_RAIN', 'LOGO_ELECTRIC_CORONA', 'FOND_NEURAL_GRID'],
    couleur_energie: 'chaude',
    speed_naturel: 'slow',
  },
  innovation: {
    label: 'Innovation & Science',
    valeurs_cles: ['découverte', 'futur', 'disruption', 'intelligence'],
    intensite_naturelle: 0.7,
    effets_affinis: ['LOGO_NEURAL_MORPH', 'LOGO_ORBITAL_PARTICLES', 'NOM_HOLOGRAM_SCAN', 'FOND_QUANTUM_FIELD', 'SEP_PARTICLE_STREAM', 'CTA_GRAVITY_PULSE'],
    effets_proscrits: ['LOGO_MATTE_FLAT', 'CTA_STATIC_PRESENCE', 'FOND_CLEAN_DARK'],
    couleur_energie: 'froide',
    speed_naturel: 'fast',
  },
  artisanat: {
    label: 'Artisanat & Services',
    valeurs_cles: ['savoir-faire', 'authenticité', 'solidité', 'proximité'],
    intensite_naturelle: 0.4,
    effets_affinis: ['LOGO_VOLUME_BREATHE', 'LOGO_SOUL_AURA', 'NOM_CLEAN_BREATHE', 'SEP_SOFT_GLOW', 'FOND_SUBTLE_TEXTURE', 'CTA_BREATH_INVITATION'],
    effets_proscrits: ['LOGO_CRYSTAL_FRAGMENT', 'FOND_QUANTUM_FIELD', 'NOM_PARTICLE_BURST', 'CTA_EXPLOSION_REVEAL'],
    couleur_energie: 'chaude',
    speed_naturel: 'slow',
  },
  restauration: {
    label: 'Restauration & Food',
    valeurs_cles: ['chaleur', 'convivialité', 'authenticité', 'plaisir'],
    intensite_naturelle: 0.5,
    effets_affinis: ['LOGO_HALO_PULSE', 'LOGO_SOUL_AURA', 'NOM_SHIMMER_GOLD', 'SEP_SOFT_GLOW', 'FOND_ATMOSPHERIC_BREATH', 'CTA_PULSE_RING'],
    effets_proscrits: ['FOND_DIGITAL_RAIN', 'LOGO_ELECTRIC_CORONA', 'FOND_NEURAL_GRID', 'TITRE_DIGITAL_GLITCH'],
    couleur_energie: 'chaude',
    speed_naturel: 'slow',
  },
  minimaliste: {
    label: 'Minimaliste & Institutionnel',
    valeurs_cles: ['clarté', 'sobriété', 'efficacité', 'intelligence'],
    intensite_naturelle: 0.25,
    effets_affinis: ['LOGO_MATTE_FLAT', 'LOGO_VOLUME_BREATHE', 'NOM_CLEAN_BREATHE', 'SEP_BREATHING_CALM', 'FOND_CLEAN_DARK', 'CTA_STATIC_PRESENCE'],
    effets_proscrits: ['LOGO_ORBITAL_PARTICLES', 'FOND_VORTEX_SPIRAL', 'FOND_FIRE_AMBIENT', 'NOM_PARTICLE_BURST'],
    couleur_energie: 'neutre',
    speed_naturel: 'slow',
  },
  default: {
    label: 'Professionnel Généraliste',
    valeurs_cles: ['professionnalisme', 'confiance', 'modernité', 'qualité'],
    intensite_naturelle: 0.45,
    effets_affinis: ['LOGO_VOLUME_BREATHE', 'LOGO_HALO_PULSE', 'NOM_CLEAN_BREATHE', 'SEP_ENERGY_FLOW', 'FOND_ATMOSPHERIC_BREATH', 'CTA_PULSE_RING'],
    effets_proscrits: ['FOND_VORTEX_SPIRAL', 'FOND_FIRE_AMBIENT', 'CTA_EXPLOSION_REVEAL'],
    couleur_energie: 'froide',
    speed_naturel: 'medium',
  },
};

// ═══════════════════════════════════════════════════════
// RÈGLES DE COHÉRENCE INTER-ZONES
// Si effet X dans zone A, alors zone B doit/ne doit pas avoir effet Y
// ═══════════════════════════════════════════════════════
interface InterZoneRule {
  trigger_zone: keyof ZoneSelection;
  trigger_effect_contains: string;
  target_zone: keyof ZoneSelection;
  action: 'boost' | 'penalize';
  target_effects_containing: string[];
  factor: number;
  raison: string;
}

const INTER_ZONE_RULES: InterZoneRule[] = [
  // Cohérence or/prestige
  { trigger_zone: 'logo', trigger_effect_contains: 'GOLD', target_zone: 'separateur', action: 'boost', target_effects_containing: ['GOLD', 'SHINE', 'SHIMMER'], factor: 0.3, raison: 'Cohérence or — séparateur brillant renforce le logo doré' },
  { trigger_zone: 'logo', trigger_effect_contains: 'GOLD', target_zone: 'cta', action: 'boost', target_effects_containing: ['SHIMMER', 'GOLD'], factor: 0.25, raison: 'Univers or cohérent sur CTA' },
  // Cohérence électrique/digital
  { trigger_zone: 'logo', trigger_effect_contains: 'ELECTRIC', target_zone: 'separateur', action: 'boost', target_effects_containing: ['ELECTRIC', 'ENERGY', 'LASER'], factor: 0.3, raison: 'Énergie électrique propagée au séparateur' },
  { trigger_zone: 'logo', trigger_effect_contains: 'ELECTRIC', target_zone: 'fond', action: 'boost', target_effects_containing: ['NEURAL', 'DIGITAL', 'GEOMETRIC'], factor: 0.2, raison: 'Environnement digital cohérent avec logo électrique' },
  // Cohérence particules/cosmos
  { trigger_zone: 'logo', trigger_effect_contains: 'ORBITAL', target_zone: 'fond', action: 'boost', target_effects_containing: ['STELLAR', 'QUANTUM', 'VORTEX'], factor: 0.25, raison: 'Univers cosmique cohérent entre logo orbital et fond' },
  { trigger_zone: 'logo', trigger_effect_contains: 'ORBITAL', target_zone: 'fond', action: 'penalize', target_effects_containing: ['DIGITAL_RAIN', 'GEOMETRIC'], factor: 0.25, raison: 'Conflit visuel cosmos vs digital' },
  // Cohérence organique/respiration
  { trigger_zone: 'logo', trigger_effect_contains: 'BREATHE', target_zone: 'fond', action: 'boost', target_effects_containing: ['ATMOSPHERIC', 'SUBTLE', 'CLEAN'], factor: 0.2, raison: 'Ambiance douce cohérente entre logo respirant et fond calme' },
  { trigger_zone: 'logo', trigger_effect_contains: 'SOUL', target_zone: 'fond', action: 'boost', target_effects_containing: ['ATMOSPHERIC', 'AURORA'], factor: 0.2, raison: 'Aura soul cohérente avec fond atmosphérique' },
  // Cohérence NOM → CTA
  { trigger_zone: 'nom', trigger_effect_contains: 'NEON', target_zone: 'cta', action: 'boost', target_effects_containing: ['ELECTRIC', 'NEON', 'FLICKER'], factor: 0.2, raison: 'Énergie néon propagée au CTA' },
  { trigger_zone: 'nom', trigger_effect_contains: 'SHIMMER', target_zone: 'cta', action: 'boost', target_effects_containing: ['SHIMMER', 'PULSE'], factor: 0.15, raison: 'Cohérence shimmer nom → CTA' },
  // Atténuation quand fond trop chargé
  { trigger_zone: 'fond', trigger_effect_contains: 'VORTEX', target_zone: 'logo', action: 'penalize', target_effects_containing: ['ORBITAL', 'CRYSTAL'], factor: 0.2, raison: 'Fond vortex + logo complexe = surcharge visuelle' },
  { trigger_zone: 'fond', trigger_effect_contains: 'FIRE', target_zone: 'cta', action: 'boost', target_effects_containing: ['EXPLOSION', 'GRAVITY'], factor: 0.2, raison: 'Feu ambiant renforce CTA explosif' },
];

let libraryCache: any = null;

function getLibrary(): any {
  if (!libraryCache) {
    const libPath = join(process.cwd(), 'server', 'data', 'zone-effects-library.json');
    libraryCache = JSON.parse(readFileSync(libPath, 'utf-8'));
  }
  return libraryCache;
}

// ═══════════════════════════════════════════════════════
// NORMALISATION SECTEUR ENRICHIE
// ═══════════════════════════════════════════════════════
export function normaliseSecteur(secteur: string): string {
  const s = (secteur || '').toLowerCase();
  if (s.match(/tech|logiciel|software|numérique|digital|informatique|développ|saas|data|cloud|cyber|ia\b|ai\b|intelligence artificielle/)) return 'tech';
  if (s.match(/luxe|prestige|premium|haute couture|maison de|joaill|horlog|yacht|palace/)) return 'luxe';
  if (s.match(/avocat|notaire|juridique|cabinet|droit|huissier|barreau|judiciaire/)) return 'juridique';
  if (s.match(/financ|banque|assurance|comptabl|audit|investissement|bourse|patrimoine|crédit/)) return 'finance';
  if (s.match(/créat|design|studio|agence|graphic|art director|motion|brand/)) return 'créatif';
  if (s.match(/santé|médecin|dentiste|pharmacie|clinique|médical|bien-être|kiné|orthop|chirurg|infirmier/)) return 'médical';
  if (s.match(/beauté|coiffeur|esthétique|spa|nail|salon|institut|make.?up|cosmétique|mode|fashion|vêtement|boutique/)) return 'beauté';
  if (s.match(/innovati|recherche|biotech|laboratoire|science|r&d|incubateur|startup/)) return 'innovation';
  if (s.match(/plombier|électricien|menuisier|charpentier|maçon|artisan|bâtiment|rénovation|travaux|peinture|couvreur|chauffagiste/)) return 'artisanat';
  if (s.match(/restaurant|pizza|burger|cuisine|traiteur|brasserie|bistro|crêpe|café|coffee|bar|pâtisserie|boulanger/)) return 'restauration';
  if (s.match(/hotel|hébergement|chambre|résidence|auberge|gîte|airbnb|camping|resort/)) return 'luxe';
  if (s.match(/immobilier|agence immo|maison|appartement|location|vente immob|promoteur/)) return 'finance';
  if (s.match(/auto|voiture|garage|concession|mécanique|carrosserie|moto/)) return 'artisanat';
  if (s.match(/sport|fitness|gym|yoga|pilates|coach|bien être|natation/)) return 'médical';
  if (s.match(/école|formation|cours|académie|éducation|université|tuteur|enseignement/)) return 'minimaliste';
  if (s.match(/minimal|institution|administration|collectivité|commune|mairie|préfecture/)) return 'minimaliste';
  return 'default';
}

// ═══════════════════════════════════════════════════════
// SCORING MULTI-DIMENSIONNEL — le cœur de l'intelligence
// ═══════════════════════════════════════════════════════
function scoreEffect(
  effet: any,
  secteurNorm: string,
  sectorProfile: SectorProfile,
  intensiteMouvement: IntensiteMouvement,
  variation: VariationContext,
  noteGMB: number,
  prixGamme: string,
  usedEffectsInOtherVariations: Set<string>
): number {
  let score = 0.4; // base

  // ── 1. Affinité secteur (logique métier profonde)
  const secteurs: string[] = effet.compatible_secteurs || [];
  const isCompatible = secteurs.includes('tous') || secteurs.includes(secteurNorm);
  if (isCompatible) score += 0.25;
  else if (secteurs.length > 0) score -= 0.1;

  // Bonus si l'effet est dans les affinités directes du secteur
  if (sectorProfile.effets_affinis.some(aff => effet.id.includes(aff) || aff.includes(effet.id))) {
    score += 0.3;
  }
  // Malus si l'effet est proscrit pour ce secteur
  if (sectorProfile.effets_proscrits.some(pros => effet.id.includes(pros) || pros.includes(effet.id))) {
    score -= 0.45;
  }

  // ── 2. Intensité mouvement vs intensité naturelle de l'effet
  const intensiteDefaut = effet.intensite?.defaut ?? 0.3;
  const intensiteMax = effet.intensite?.max ?? 0.5;
  const intensiteNaturelle = sectorProfile.intensite_naturelle;

  if (intensiteMouvement === 'minimal' && intensiteMax < 0.25) score += 0.2;
  if (intensiteMouvement === 'minimal' && intensiteDefaut > 0.5) score -= 0.3;
  if (intensiteMouvement === 'subtil' && intensiteDefaut < 0.45) score += 0.15;
  if (intensiteMouvement === 'expressif' && intensiteMax > 0.5) score += 0.15;
  if (intensiteMouvement === 'dramatique' && intensiteMax > 0.6) score += 0.25;

  // Cohérence intensité naturelle secteur
  const intensiteDiff = Math.abs(intensiteDefaut - intensiteNaturelle);
  score += Math.max(0, 0.15 - intensiteDiff * 0.4);

  // ── 3. Préférence de variation (diversité d'ambiance)
  if (VARIATION_PREFERRED_EFFECTS[variation].some(pref =>
    effet.id === pref || effet.id.includes(pref.split('_').slice(0, 2).join('_'))
  )) {
    score += 0.3;
  }

  // ── 4. Cohérence énergie de la variation
  const varProfile = VARIATION_PROFILES[variation];
  const effetId = effet.id.toLowerCase();
  for (const keyword of varProfile.keywords) {
    if (
      effetId.includes(keyword.replace('é', 'e').replace('è', 'e').replace('ê', 'e')) ||
      (effet.description || '').toLowerCase().includes(keyword)
    ) {
      score += 0.08;
    }
  }

  // ── 5. Note GMB → indice de qualité (prestige vs accessibilité)
  if (noteGMB >= 4.5) {
    // Haute qualité : effets plus sophistiqués
    if (effet.id.includes('GOLD') || effet.id.includes('CRYSTAL') || effet.id.includes('ORBITAL')) {
      score += 0.12;
    }
  }
  if (noteGMB < 3.5 && noteGMB > 0) {
    // Qualité modérée : effets plus sereins
    if (effet.id.includes('BREATHE') || effet.id.includes('CALM') || effet.id.includes('CLEAN')) {
      score += 0.1;
    }
  }

  // ── 6. Gamme de prix → raffinement vs accessibilité
  const prix = (prixGamme || '').toLowerCase();
  if (prix.includes('$$$') || prix.includes('premium') || prix.includes('luxe')) {
    if (sectorProfile.couleur_energie === 'dorée') score += 0.15;
  }

  // ── 7. Diversité : pénaliser les effets déjà utilisés dans d'autres variations
  if (usedEffectsInOtherVariations.has(effet.id)) {
    score -= 0.5; // forte pénalité pour éviter la répétition
  }

  // ── 8. Micro-randomisation pour éviter la monotonie (très faible)
  score += (Math.random() - 0.5) * 0.04;

  return Math.min(1, Math.max(0, score));
}

function filterIncompatibles(candidats: EffetCandidat[], maxReturn: number): EffetCandidat[] {
  const selected: EffetCandidat[] = [];
  const selectedIds = new Set<string>();

  for (const candidat of candidats) {
    if (selected.length >= maxReturn) break;
    const effetDef = findEffectDef(candidat.id);
    const incompatibles: string[] = effetDef?.incompatible_avec ?? [];
    const conflit = incompatibles.some(id => selectedIds.has(id));
    if (!conflit) {
      selected.push(candidat);
      selectedIds.add(candidat.id);
    }
  }
  return selected;
}

function findEffectDef(id: string): any {
  const lib = getLibrary();
  for (const zone of Object.values(lib.zones) as any[]) {
    const allEffets: any[] = zone.effets
      ? zone.effets
      : Object.values(zone.categories ?? {}).flatMap((cat: any) => cat.effets ?? []);
    const found = allEffets.find((e: any) => e.id === id);
    if (found) return found;
  }
  return null;
}

function selectZoneCandidates(
  zoneData: any,
  secteurNorm: string,
  sectorProfile: SectorProfile,
  intensiteMouvement: IntensiteMouvement,
  variation: VariationContext,
  noteGMB: number,
  prixGamme: string,
  usedEffectsInOtherVariations: Set<string>,
  maxReturn = 4
): EffetCandidat[] {
  const variationMult = VARIATION_PROFILES[variation].intensite_mult;

  const allEffets: any[] = zoneData.effets
    ? zoneData.effets
    : Object.values(zoneData.categories ?? {}).flatMap((cat: any) => cat.effets ?? []);

  const scored = allEffets.map((effet: any) => {
    const score = scoreEffect(effet, secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffectsInOtherVariations);
    const intensiteBase = effet.intensite?.defaut ?? 0.3;
    const intensiteMax  = effet.intensite?.max ?? intensiteBase;
    const intensiteRec  = Math.min(intensiteMax, Math.max(effet.intensite?.min ?? 0.1, intensiteBase * variationMult * (sectorProfile.intensite_naturelle / 0.45)));

    return {
      id: effet.id,
      nom: effet.nom,
      description: effet.description,
      score: parseFloat(score.toFixed(3)),
      intensite_recommandee: parseFloat(intensiteRec.toFixed(3)),
      css_technique: effet.css_technique,
      duree_cycle: effet.duree_cycle,
    } as EffetCandidat;
  });

  scored.sort((a, b) => b.score - a.score);
  return filterIncompatibles(scored, maxReturn);
}

// ═══════════════════════════════════════════════════════
// RÈGLES INTER-ZONES APPLIQUÉES SUR LES CANDIDATS
// ═══════════════════════════════════════════════════════
function applyInterZoneBoosts(
  selection: ZoneSelection,
  topChoices: Record<keyof ZoneSelection, string>
): void {
  for (const rule of INTER_ZONE_RULES) {
    const triggerTopId = topChoices[rule.trigger_zone] || '';
    if (!triggerTopId.includes(rule.trigger_effect_contains)) continue;

    const targetList = selection[rule.target_zone];
    for (const candidat of targetList) {
      const matches = rule.target_effects_containing.some(kw => candidat.id.includes(kw));
      if (matches) {
        if (rule.action === 'boost') {
          candidat.score = Math.min(1, candidat.score + rule.factor);
        } else {
          candidat.score = Math.max(0, candidat.score - rule.factor);
        }
      }
    }
    // Retrier après modification
    targetList.sort((a, b) => b.score - a.score);
  }
}

// ═══════════════════════════════════════════════════════
// FONCTION PRINCIPALE D'EXPORT
// ═══════════════════════════════════════════════════════
export function selectCandidatesForAllZones(
  secteur: string,
  intensiteMouvement: IntensiteMouvement,
  variation: VariationContext,
  options?: {
    noteGMB?: number;
    prixGamme?: string;
    usedEffects?: Set<string>;
  }
): ZoneSelection {
  const lib = getLibrary();
  const secteurNorm = normaliseSecteur(secteur);
  const sectorProfile = SECTOR_PROFILES[secteurNorm] || SECTOR_PROFILES.default;
  const noteGMB = options?.noteGMB ?? 0;
  const prixGamme = options?.prixGamme ?? '';
  const usedEffects = options?.usedEffects ?? new Set<string>();

  const result: ZoneSelection = {
    logo:       selectZoneCandidates(lib.zones.logo,       secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffects, 5),
    nom:        selectZoneCandidates(lib.zones.nom,        secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffects, 4),
    titre:      selectZoneCandidates(lib.zones.titre,      secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffects, 3),
    contact:    selectZoneCandidates(lib.zones.contact,    secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffects, 3),
    separateur: selectZoneCandidates(lib.zones.separateur, secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffects, 5),
    fond:       selectZoneCandidates(lib.zones.fond,       secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffects, 4),
    cta:        selectZoneCandidates(lib.zones.cta,        secteurNorm, sectorProfile, intensiteMouvement, variation, noteGMB, prixGamme, usedEffects, 4),
  };

  // Top choices actuels (avant inter-zone)
  const topChoices: Record<keyof ZoneSelection, string> = {
    logo:       result.logo[0]?.id || '',
    nom:        result.nom[0]?.id || '',
    titre:      result.titre[0]?.id || '',
    contact:    result.contact[0]?.id || '',
    separateur: result.separateur[0]?.id || '',
    fond:       result.fond[0]?.id || '',
    cta:        result.cta[0]?.id || '',
  };

  // Application des règles de cohérence inter-zones
  applyInterZoneBoosts(result, topChoices);

  return result;
}

// ═══════════════════════════════════════════════════════
// CONSTRUCTION DU PROMPT GEMINI — riche et précis
// ═══════════════════════════════════════════════════════
export function buildGeminiPromptZones(
  secteur: string,
  ton: string,
  intensiteLabel: string,
  variation: VariationContext,
  intention: string,
  selection: ZoneSelection,
  options?: {
    brief?: any;
    metadata?: any;
    arc_emotionnel?: string;
    metaphore?: string;
    note_gmb?: number;
    palette?: string[];
    effets_interdits?: string[]; // effets déjà utilisés dans d'autres variations
  }
): string {
  const secteurNorm = normaliseSecteur(secteur);
  const sectorProfile = SECTOR_PROFILES[secteurNorm] || SECTOR_PROFILES.default;
  const varProfile = VARIATION_PROFILES[variation];
  const palette = options?.palette || [];
  const primaryColor = palette[1] || '#6366f1';
  const bgColor = palette[0] || '#0f0f0f';

  const formatZone = (zone: EffetCandidat[]) =>
    zone.map(e =>
      `  • [${e.id}] ${e.nom} — ${e.description}\n    Score métier: ${e.score} | Intensité recommandée: ${e.intensite_recommandee} | Technique: ${e.css_technique}`
    ).join('\n');

  const interdits = options?.effets_interdits?.length
    ? `\nEFFETS INTERDITS (déjà utilisés dans d'autres variations — diversité absolue requise) :\n${options.effets_interdits.map(e => `  ✗ ${e}`).join('\n')}`
    : '';

  const metaContext = options?.metadata ? [
    options.metadata.entreprise && `Entreprise : ${options.metadata.entreprise}`,
    options.metadata.note && `Note GMB : ${options.metadata.note}/5 (${options.metadata.avis || 0} avis)`,
    options.metadata.prix_gamme && `Gamme de prix : ${options.metadata.prix_gamme}`,
    options.metadata.slogan && `Slogan : "${options.metadata.slogan}"`,
    options.metadata.ville && `Ville : ${options.metadata.ville}`,
  ].filter(Boolean).join('\n') : '';

  const briefContext = options?.brief ? [
    options.brief.mot_clef_narratif && `Mot-clef narratif : "${options.brief.mot_clef_narratif}"`,
    options.brief.univers_visuel && `Univers visuel : ${options.brief.univers_visuel}`,
    options.brief.personnalite_marque?.length && `Traits de marque : ${options.brief.personnalite_marque.join(', ')}`,
    options.brief.differentiateur && `Différenciateur : ${options.brief.differentiateur}`,
    options.brief.psychologie_couleurs && `Psychologie couleurs : ${options.brief.psychologie_couleurs}`,
  ].filter(Boolean).join('\n') : '';

  return `Tu es le Chirurgien Visuel IA — expert en orchestration d'effets CSS pour signatures email vivantes.
Ta mission : sélectionner avec une précision chirurgicale 1 effet par zone pour créer une variation qui RESPIRE l'identité de cette marque.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTITÉ DE LA MARQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Secteur : ${secteur} (profil : ${sectorProfile.label})
Valeurs secteur : ${sectorProfile.valeurs_cles.join(', ')}
Ton émotionnel : ${ton}
Intensité globale : ${intensiteLabel}
${metaContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRIEF CRÉATIF (Cerveau 1 — GPT-4o)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${briefContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VARIATION ${variation} — ${varProfile.label}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Émotion dominante : ${varProfile.emotion}
Énergie : ${varProfile.energie}
Vitesse naturelle : ${varProfile.speed_bias}
Intention narrative : "${intention}"
${options?.metaphore ? `Métaphore : "${options.metaphore}"` : ''}
${options?.arc_emotionnel ? `Arc global A→D : ${options.arc_emotionnel}` : ''}

Mots-clés de cette variation : ${varProfile.keywords.join(', ')}
Couleur primaire palette : ${primaryColor} | Fond : ${bgColor}
${interdits}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANDIDATS PRÉ-VALIDÉS PAR ZONE
(classés par score métier décroissant)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOGO (pièce maîtresse — intensité maximale) :
${formatZone(selection.logo)}

NOM (identité textuelle primaire) :
${formatZone(selection.nom)}

TITRE / POSTE (hiérarchie secondaire) :
${formatZone(selection.titre)}

CONTACT (discrétion requise) :
${formatZone(selection.contact)}

SÉPARATEUR (rythme et respiration) :
${formatZone(selection.separateur)}

FOND (atmosphère ambiante) :
${formatZone(selection.fond)}

CTA / BOUTON (appel à l'action) :
${formatZone(selection.cta)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES ABSOLUES DE SÉLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Hiérarchie intensité OBLIGATOIRE : Logo > Nom > CTA > Séparateur > Fond > Titre > Contact
2. Cohérence de vitesse : si logo est slow, fond aussi — pas d'incohérence rythmique
3. Cohérence d'univers : les 7 zones doivent raconter la MÊME histoire visuelle
4. Aucun effet interdit (liste ci-dessus) — diversité absolue entre les 4 variations
5. Les couleurs doivent être des codes hex valides tirés de la palette ou proches
6. Pour une marque ${sectorProfile.label}, respecter les valeurs : ${sectorProfile.valeurs_cles.join(', ')}
7. L'intensité doit rester dans les limites recommandées par zone

Réponds UNIQUEMENT en JSON strict (aucun texte avant ou après) :
{
  "logo":       { "effet_id": "string", "intensity": 0.00, "speed": "slow|medium|fast", "color": "#hex", "raison": "explication précise en lien avec l'identité de la marque" },
  "nom":        { "effet_id": "string", "intensity": 0.00, "speed": "slow|medium|fast", "color": "#hex", "raison": "..." },
  "titre":      { "effet_id": "string", "intensity": 0.00, "speed": "slow|medium|fast", "color": "#hex", "raison": "..." },
  "contact":    { "effet_id": "string", "intensity": 0.00, "speed": "slow|medium|fast", "color": "#hex", "raison": "..." },
  "separateur": { "effet_id": "string", "intensity": 0.00, "speed": "slow|medium|fast", "color": "#hex", "raison": "..." },
  "fond":       { "effet_id": "string", "intensity": 0.00, "speed": "slow|medium|fast", "color": "#hex", "raison": "..." },
  "cta":        { "effet_id": "string", "intensity": 0.00, "speed": "slow|medium|fast", "color": "#hex", "raison": "..." }
}`;
}
