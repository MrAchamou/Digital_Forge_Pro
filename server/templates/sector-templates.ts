export type SectorId =
  | 'artisanat'
  | 'restauration'
  | 'sante'
  | 'immobilier'
  | 'commerce'
  | 'services_pro'
  | 'tech'
  | 'education'
  | 'loisirs'
  | 'transport';

export interface SectorField {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'phone' | 'email' | 'url' | 'badge' | 'hours' | 'rating';
}

export interface SectorLayout {
  format: 'compact-horizontal' | 'centered' | 'airy' | 'elegant-two-col' | 'colorful' | 'sober-vertical' | 'minimal-dark' | 'structured-light' | 'immersive-wide' | 'functional-direct';
  width: number;
  height: number;
  photoPosition: 'left' | 'top' | 'none';
  logoSize: 'small' | 'medium' | 'large';
  emphasis: 'phone' | 'email' | 'address' | 'web' | 'booking' | 'credentials' | 'portfolio' | 'subjects' | 'rating' | 'zone';
}

export interface SectorEffects {
  primary: string;
  secondary: string;
  accent: string;
  intensity: 'low' | 'medium' | 'high';
  locked: true;
}

export interface SectorTemplate {
  id: SectorId;
  label: string;
  emoji: string;
  description: string;
  keywords: string[];
  palette: {
    background: string;
    accent: string;
    text: string;
    muted: string;
  };
  fields: SectorField[];
  layout: SectorLayout;
  effects: SectorEffects;
  tone: string;
}

export const SECTOR_TEMPLATES: Record<SectorId, SectorTemplate> = {

  artisanat: {
    id: 'artisanat',
    label: 'Artisanat & Travaux',
    emoji: '🔧',
    description: 'Plombier, électricien, mécanicien, menuisier, peintre, maçon, serrurier...',
    keywords: ['plombier', 'électricien', 'mécanicien', 'menuisier', 'peintre', 'maçon', 'serrurier', 'chauffagiste', 'carreleur', 'vitrier', 'couvreur', 'artisan', 'travaux', 'btp', 'construction', 'dépannage', 'rénovation'],
    palette: {
      background: '#0d1117',
      accent: '#f59e0b',
      text: '#f1f5f9',
      muted: '#94a3b8',
    },
    fields: [
      { key: 'nom', label: 'Nom & Prénom', required: true, type: 'text' },
      { key: 'titre', label: 'Métier', required: true, type: 'text' },
      { key: 'telephone', label: 'Téléphone', required: true, type: 'phone' },
      { key: 'zone', label: 'Zone d\'intervention', required: true, type: 'badge' },
      { key: 'urgence', label: 'Disponibilité Urgence', required: false, type: 'badge' },
      { key: 'siret', label: 'SIRET / Certification', required: false, type: 'text' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'site', label: 'Site Web', required: false, type: 'url' },
    ],
    layout: {
      format: 'compact-horizontal',
      width: 600,
      height: 180,
      photoPosition: 'left',
      logoSize: 'medium',
      emphasis: 'phone',
    },
    effects: {
      primary: 'ELECTRIC HOVER',
      secondary: 'MAGNETIC PULL',
      accent: 'NEON GLOW',
      intensity: 'high',
      locked: true,
    },
    tone: 'Sérieux, réactif, disponible',
  },

  restauration: {
    id: 'restauration',
    label: 'Restauration & Alimentation',
    emoji: '🍽️',
    description: 'Restaurant, café, boulangerie, traiteur, food truck, épicerie fine...',
    keywords: ['restaurant', 'café', 'boulangerie', 'traiteur', 'food truck', 'épicerie', 'pizzeria', 'brasserie', 'bar', 'bistrot', 'pâtisserie', 'chocolatier', 'glacier', 'snack', 'sandwicherie', 'restauration'],
    palette: {
      background: '#1a0a00',
      accent: '#d97706',
      text: '#fef3c7',
      muted: '#92400e',
    },
    fields: [
      { key: 'nom', label: 'Nom de l\'établissement', required: true, type: 'text' },
      { key: 'titre', label: 'Type de cuisine / Spécialité', required: true, type: 'text' },
      { key: 'adresse', label: 'Adresse', required: true, type: 'text' },
      { key: 'telephone', label: 'Réservation', required: true, type: 'phone' },
      { key: 'horaires', label: 'Horaires d\'ouverture', required: true, type: 'hours' },
      { key: 'note', label: 'Note Google', required: false, type: 'rating' },
      { key: 'site', label: 'Menu en ligne / Site', required: false, type: 'url' },
      { key: 'instagram', label: 'Instagram', required: false, type: 'url' },
    ],
    layout: {
      format: 'centered',
      width: 620,
      height: 220,
      photoPosition: 'top',
      logoSize: 'large',
      emphasis: 'address',
    },
    effects: {
      primary: 'FIRE WRITE',
      secondary: 'LIQUID MORPH',
      accent: 'SOUL AURA',
      intensity: 'medium',
      locked: true,
    },
    tone: 'Chaleureux, gourmand, accueillant',
  },

  sante: {
    id: 'sante',
    label: 'Santé & Bien-être',
    emoji: '💆',
    description: 'Médecin, dentiste, kiné, coiffeur, esthéticienne, naturopathe, spa...',
    keywords: ['médecin', 'docteur', 'dentiste', 'kiné', 'kinésithérapeute', 'coiffeur', 'esthéticienne', 'naturopathe', 'spa', 'ostéopathe', 'psychologue', 'diététicien', 'pharmacien', 'infirmier', 'sage-femme', 'opticien', 'santé', 'bien-être', 'beauté'],
    palette: {
      background: '#f0fdf4',
      accent: '#059669',
      text: '#064e3b',
      muted: '#6ee7b7',
    },
    fields: [
      { key: 'nom', label: 'Dr / Praticien', required: true, type: 'text' },
      { key: 'titre', label: 'Spécialité', required: true, type: 'text' },
      { key: 'diplome', label: 'Diplôme / Certification', required: false, type: 'badge' },
      { key: 'telephone', label: 'Prise de RDV', required: true, type: 'phone' },
      { key: 'adresse', label: 'Cabinet / Adresse', required: true, type: 'text' },
      { key: 'assurance', label: 'Conventionné / Mutuelle', required: false, type: 'badge' },
      { key: 'email', label: 'Email', required: false, type: 'email' },
      { key: 'site', label: 'Site / Doctolib', required: false, type: 'url' },
    ],
    layout: {
      format: 'airy',
      width: 600,
      height: 200,
      photoPosition: 'left',
      logoSize: 'medium',
      emphasis: 'booking',
    },
    effects: {
      primary: 'BREATHING',
      secondary: 'WAVE DISSOLVE',
      accent: 'NEURAL PULSE',
      intensity: 'low',
      locked: true,
    },
    tone: 'Rassurant, professionnel, bienveillant',
  },

  immobilier: {
    id: 'immobilier',
    label: 'Immobilier',
    emoji: '🏠',
    description: 'Agent immobilier, promoteur, architecte, syndic, gestionnaire de biens...',
    keywords: ['immobilier', 'agent immobilier', 'promoteur', 'architecte', 'syndic', 'gestionnaire', 'notaire', 'diagnostiqueur', 'home stager', 'transaction', 'location', 'vente', 'achat', 'investissement', 'patrimoine'],
    palette: {
      background: '#0f172a',
      accent: '#0ea5e9',
      text: '#f1f5f9',
      muted: '#64748b',
    },
    fields: [
      { key: 'nom', label: 'Nom & Prénom', required: true, type: 'text' },
      { key: 'titre', label: 'Titre / Poste', required: true, type: 'text' },
      { key: 'agence', label: 'Agence / Cabinet', required: true, type: 'text' },
      { key: 'telephone', label: 'Téléphone direct', required: true, type: 'phone' },
      { key: 'zone', label: 'Zone couverte', required: true, type: 'badge' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'site', label: 'Site / Annonces', required: false, type: 'url' },
      { key: 'linkedin', label: 'LinkedIn', required: false, type: 'url' },
    ],
    layout: {
      format: 'elegant-two-col',
      width: 680,
      height: 220,
      photoPosition: 'left',
      logoSize: 'medium',
      emphasis: 'phone',
    },
    effects: {
      primary: 'HOLOGRAM',
      secondary: 'CRYSTAL GROW',
      accent: 'PRISM SPLIT',
      intensity: 'medium',
      locked: true,
    },
    tone: 'Prestige, confiance, expertise locale',
  },

  commerce: {
    id: 'commerce',
    label: 'Commerce & Retail',
    emoji: '🛍️',
    description: 'Boutique mode, pharmacie, librairie, fleuriste, animalerie, bijouterie...',
    keywords: ['boutique', 'magasin', 'commerce', 'retail', 'mode', 'vêtements', 'pharmacie', 'librairie', 'fleuriste', 'animalerie', 'bijouterie', 'maroquinerie', 'chaussures', 'lingerie', 'optique', 'décoration', 'mobilier', 'épicerie', 'supermarché'],
    palette: {
      background: '#0a0a0a',
      accent: '#ec4899',
      text: '#fdf4ff',
      muted: '#a21caf',
    },
    fields: [
      { key: 'nom', label: 'Nom de la boutique', required: true, type: 'text' },
      { key: 'titre', label: 'Slogan / Spécialité', required: true, type: 'text' },
      { key: 'adresse', label: 'Adresse', required: true, type: 'text' },
      { key: 'horaires', label: 'Horaires', required: true, type: 'hours' },
      { key: 'telephone', label: 'Téléphone', required: false, type: 'phone' },
      { key: 'instagram', label: 'Instagram', required: false, type: 'url' },
      { key: 'site', label: 'Boutique en ligne', required: false, type: 'url' },
    ],
    layout: {
      format: 'colorful',
      width: 600,
      height: 190,
      photoPosition: 'none',
      logoSize: 'large',
      emphasis: 'address',
    },
    effects: {
      primary: 'SPARKLE AURA',
      secondary: 'NEON GLOW',
      accent: 'STAR DUST FORM',
      intensity: 'high',
      locked: true,
    },
    tone: 'Dynamique, accrocheur, tendance',
  },

  services_pro: {
    id: 'services_pro',
    label: 'Services Professionnels',
    emoji: '⚖️',
    description: 'Avocat, comptable, notaire, consultant, RH, assurance, banque...',
    keywords: ['avocat', 'comptable', 'notaire', 'consultant', 'rh', 'ressources humaines', 'assurance', 'banque', 'expert-comptable', 'commissaire', 'auditeur', 'conseiller', 'cabinet', 'juridique', 'finance', 'fiscaliste', 'juriste'],
    palette: {
      background: '#1e1b4b',
      accent: '#6366f1',
      text: '#e0e7ff',
      muted: '#818cf8',
    },
    fields: [
      { key: 'nom', label: 'Nom & Prénom', required: true, type: 'text' },
      { key: 'titre', label: 'Titre / Fonction', required: true, type: 'text' },
      { key: 'cabinet', label: 'Cabinet / Entreprise', required: true, type: 'text' },
      { key: 'ordre', label: 'N° Ordre / Barreau', required: false, type: 'badge' },
      { key: 'email', label: 'Email professionnel', required: true, type: 'email' },
      { key: 'telephone', label: 'Téléphone', required: true, type: 'phone' },
      { key: 'site', label: 'Site Web', required: false, type: 'url' },
      { key: 'linkedin', label: 'LinkedIn', required: false, type: 'url' },
    ],
    layout: {
      format: 'sober-vertical',
      width: 580,
      height: 210,
      photoPosition: 'left',
      logoSize: 'small',
      emphasis: 'credentials',
    },
    effects: {
      primary: 'FADE LAYERS',
      secondary: 'TIME ECHO',
      accent: 'DIMENSION SHIFT',
      intensity: 'low',
      locked: true,
    },
    tone: 'Sobre, formel, autorité',
  },

  tech: {
    id: 'tech',
    label: 'Tech & Digital',
    emoji: '💻',
    description: 'Développeur, agence web, startup, infographiste, community manager...',
    keywords: ['développeur', 'dev', 'agence web', 'startup', 'infographiste', 'community manager', 'designer', 'ux', 'ui', 'data', 'ia', 'intelligence artificielle', 'cybersécurité', 'cloud', 'it', 'informatique', 'digital', 'tech', 'software', 'seo', 'marketing digital'],
    palette: {
      background: '#030712',
      accent: '#06b6d4',
      text: '#e2e8f0',
      muted: '#475569',
    },
    fields: [
      { key: 'nom', label: 'Nom / Pseudo', required: true, type: 'text' },
      { key: 'titre', label: 'Titre / Stack', required: true, type: 'text' },
      { key: 'entreprise', label: 'Entreprise / Freelance', required: false, type: 'text' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'portfolio', label: 'Portfolio / GitHub', required: true, type: 'url' },
      { key: 'linkedin', label: 'LinkedIn', required: false, type: 'url' },
      { key: 'site', label: 'Site Web', required: false, type: 'url' },
      { key: 'competences', label: 'Compétences clés', required: false, type: 'badge' },
    ],
    layout: {
      format: 'minimal-dark',
      width: 640,
      height: 195,
      photoPosition: 'none',
      logoSize: 'small',
      emphasis: 'portfolio',
    },
    effects: {
      primary: 'GLITCH SPAWN',
      secondary: 'QUANTUM PHASE',
      accent: 'REALITY GLITCH',
      intensity: 'medium',
      locked: true,
    },
    tone: 'Futuriste, précis, innovant',
  },

  education: {
    id: 'education',
    label: 'Éducation & Formation',
    emoji: '🎓',
    description: 'École, coach, formateur, tuteur, auto-école, soutien scolaire...',
    keywords: ['école', 'formation', 'coach', 'formateur', 'tuteur', 'auto-école', 'soutien scolaire', 'professeur', 'enseignant', 'université', 'lycée', 'collège', 'cours', 'apprentissage', 'certification', 'cpf', 'stage', 'alternance'],
    palette: {
      background: '#eff6ff',
      accent: '#3b82f6',
      text: '#1e3a5f',
      muted: '#93c5fd',
    },
    fields: [
      { key: 'nom', label: 'Nom & Prénom', required: true, type: 'text' },
      { key: 'titre', label: 'Matières / Spécialités', required: true, type: 'text' },
      { key: 'etablissement', label: 'Établissement / Structure', required: false, type: 'text' },
      { key: 'niveaux', label: 'Niveaux enseignés', required: false, type: 'badge' },
      { key: 'telephone', label: 'Contact', required: true, type: 'phone' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'certifications', label: 'Certifications', required: false, type: 'badge' },
      { key: 'site', label: 'Site / Plateforme', required: false, type: 'url' },
    ],
    layout: {
      format: 'structured-light',
      width: 600,
      height: 200,
      photoPosition: 'left',
      logoSize: 'medium',
      emphasis: 'subjects',
    },
    effects: {
      primary: 'TYPEWRITER',
      secondary: 'DNA BUILD',
      accent: 'PARTICLE BUILD',
      intensity: 'medium',
      locked: true,
    },
    tone: 'Clair, bienveillant, progressif',
  },

  loisirs: {
    id: 'loisirs',
    label: 'Loisirs & Tourisme',
    emoji: '🏨',
    description: 'Hôtel, agence voyage, salle de sport, photographe, événementiel...',
    keywords: ['hôtel', 'agence voyage', 'tourisme', 'salle de sport', 'fitness', 'photographe', 'vidéaste', 'événementiel', 'traiteur', 'dj', 'animateur', 'loisirs', 'spa', 'resort', 'camping', 'gîte', 'chambre hôtes', 'location vacances', 'activités'],
    palette: {
      background: '#020617',
      accent: '#8b5cf6',
      text: '#f1f5f9',
      muted: '#6d28d9',
    },
    fields: [
      { key: 'nom', label: 'Nom / Établissement', required: true, type: 'text' },
      { key: 'titre', label: 'Type d\'activité', required: true, type: 'text' },
      { key: 'adresse', label: 'Lieu / Adresse', required: true, type: 'text' },
      { key: 'note', label: 'Note Google / TripAdvisor', required: false, type: 'rating' },
      { key: 'telephone', label: 'Réservation', required: true, type: 'phone' },
      { key: 'site', label: 'Site / Réservation en ligne', required: false, type: 'url' },
      { key: 'instagram', label: 'Instagram', required: false, type: 'url' },
    ],
    layout: {
      format: 'immersive-wide',
      width: 700,
      height: 230,
      photoPosition: 'top',
      logoSize: 'large',
      emphasis: 'rating',
    },
    effects: {
      primary: 'STELLAR DRIFT',
      secondary: 'FLOAT DANCE',
      accent: 'ORBIT DANCE',
      intensity: 'high',
      locked: true,
    },
    tone: 'Cinématique, immersif, inspirant',
  },

  transport: {
    id: 'transport',
    label: 'Transport & Logistique',
    emoji: '🚚',
    description: 'Taxi, VTC, déménageur, livreur, transporteur, ambulancier...',
    keywords: ['taxi', 'vtc', 'uber', 'chauffeur', 'déménageur', 'déménagement', 'livreur', 'livraison', 'transporteur', 'ambulancier', 'ambulance', 'coursier', 'messagerie', 'fret', 'logistique', 'camion', 'bus', 'navette', 'transfer'],
    palette: {
      background: '#0c0a09',
      accent: '#ef4444',
      text: '#fafaf9',
      muted: '#78716c',
    },
    fields: [
      { key: 'nom', label: 'Nom / Entreprise', required: true, type: 'text' },
      { key: 'titre', label: 'Type de service', required: true, type: 'text' },
      { key: 'telephone', label: 'Téléphone / Réservation', required: true, type: 'phone' },
      { key: 'zone', label: 'Zone couverte', required: true, type: 'badge' },
      { key: 'disponibilite', label: 'Disponibilité', required: false, type: 'badge' },
      { key: 'vehicule', label: 'Type de véhicule', required: false, type: 'badge' },
      { key: 'email', label: 'Email / Devis', required: false, type: 'email' },
      { key: 'site', label: 'Site Web', required: false, type: 'url' },
    ],
    layout: {
      format: 'functional-direct',
      width: 580,
      height: 175,
      photoPosition: 'none',
      logoSize: 'medium',
      emphasis: 'phone',
    },
    effects: {
      primary: 'TORNADO SPIN',
      secondary: 'WAVE SURF',
      accent: 'GYROSCOPE SPIN',
      intensity: 'high',
      locked: true,
    },
    tone: 'Rapide, direct, disponible',
  },
};

export const ALL_SECTOR_IDS = Object.keys(SECTOR_TEMPLATES) as SectorId[];

export function getSectorTemplate(id: SectorId): SectorTemplate {
  return SECTOR_TEMPLATES[id];
}

export function getAllTemplates(): SectorTemplate[] {
  return Object.values(SECTOR_TEMPLATES);
}

export function getSectorByKeyword(keyword: string): SectorTemplate | null {
  const kw = keyword.toLowerCase().trim();
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    if (template.keywords.some(k => kw.includes(k) || k.includes(kw))) {
      return template;
    }
  }
  return null;
}
