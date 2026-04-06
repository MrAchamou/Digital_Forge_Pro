import { log } from '../vite';

interface GmbScrapedData {
  nom: string;
  titre: string;
  entreprise: string;
  telephone: string;
  email: string;
  site: string;
  secteur: string;
  palette: string[];
  ton: string;
  description: string;
}

const SECTOR_COLOR_MAP: Record<string, string[]> = {
  restaurant: ['#1a0a00', '#c8601a', '#f5e6d3'],
  cafe: ['#2c1810', '#8b5e3c', '#f0e0c8'],
  hotel: ['#0a0a1a', '#b8960c', '#f5f0e8'],
  tech: ['#0a0a1a', '#00d4ff', '#e8f4ff'],
  sante: ['#0a1a10', '#00b894', '#e8fff4'],
  beaute: ['#1a0a14', '#e84393', '#fff0f8'],
  fitness: ['#0a0a0a', '#e84317', '#fff0e8'],
  juridique: ['#0a0810', '#4a3c78', '#f0eeff'],
  finance: ['#080810', '#1e40af', '#e8f0ff'],
  architecture: ['#0a0a08', '#78716c', '#f5f5f4'],
  mode: ['#0a0a0a', '#d4a017', '#fff8e8'],
  education: ['#0a0a1a', '#3b82f6', '#eff6ff'],
  default: ['#0f0f0f', '#6366f1', '#e8e8ff'],
};

const SECTOR_TONE_MAP: Record<string, string> = {
  restaurant: 'chaleureux et gourmand',
  cafe: 'convivial et artisanal',
  hotel: 'luxueux et élégant',
  tech: 'innovant et précis',
  sante: 'rassurant et professionnel',
  beaute: 'glamour et sophistiqué',
  fitness: 'énergique et motivant',
  juridique: 'autoritaire et fiable',
  finance: 'institutionnel et confiant',
  architecture: 'minimal et visionnaire',
  mode: 'élégant et tendance',
  education: 'inspirant et accessible',
  default: 'professionnel et moderne',
};

function detectSector(category: string, description: string): string {
  const text = (category + ' ' + description).toLowerCase();
  if (text.match(/restaurant|pizza|burger|cuisine|traiteur|brasserie/)) return 'restaurant';
  if (text.match(/café|coffee|bar|salon de thé/)) return 'cafe';
  if (text.match(/hôtel|hotel|hébergement|chambre/)) return 'hotel';
  if (text.match(/tech|logiciel|software|numérique|digital/)) return 'tech';
  if (text.match(/santé|médecin|dentiste|pharmacie|clinique/)) return 'sante';
  if (text.match(/beauté|coiffeur|esthétique|spa|nail/)) return 'beaute';
  if (text.match(/fitness|sport|gym|musculation/)) return 'fitness';
  if (text.match(/avocat|notaire|juridique|cabinet|droit/)) return 'juridique';
  if (text.match(/finance|banque|assurance|comptable|audit/)) return 'finance';
  if (text.match(/architecte|architecture|design intérieur/)) return 'architecture';
  if (text.match(/mode|vêtement|boutique|fashion/)) return 'mode';
  if (text.match(/école|formation|cours|académie|éducation/)) return 'education';
  return 'default';
}

async function scrapeWithSerper(gmbUrl: string): Promise<GmbScrapedData> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    log('SERPER_API_KEY manquant — utilisation des données de démo', 'gmb-scraper');
    return generateDemoData(gmbUrl);
  }

  try {
    const searchQuery = decodeURIComponent(gmbUrl).replace(/.*maps\/place\//, '').split('/')[0].replace(/\+/g, ' ');

    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: searchQuery, gl: 'fr', hl: 'fr' }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();
    const place = data.places?.[0];

    if (!place) {
      return generateDemoData(gmbUrl);
    }

    const category = place.category || '';
    const description = place.description || '';
    const sectorKey = detectSector(category, description);

    return {
      nom: '',
      titre: place.title || 'Professionnel',
      entreprise: place.title || 'Mon Entreprise',
      telephone: place.phoneNumber || '',
      email: '',
      site: place.website || '',
      secteur: category || 'Commerce',
      palette: SECTOR_COLOR_MAP[sectorKey] || SECTOR_COLOR_MAP.default,
      ton: SECTOR_TONE_MAP[sectorKey] || SECTOR_TONE_MAP.default,
      description: place.description || `${place.title} — ${category}`,
    };
  } catch (error: any) {
    log(`Erreur scraping GMB: ${error.message}`, 'gmb-scraper');
    return generateDemoData(gmbUrl);
  }
}

function generateDemoData(gmbUrl: string): GmbScrapedData {
  const name = decodeURIComponent(gmbUrl)
    .replace(/.*maps\/place\//, '')
    .split('/')[0]
    .replace(/\+/g, ' ')
    .slice(0, 40) || 'Mon Entreprise';

  return {
    nom: '',
    titre: 'Directeur',
    entreprise: name,
    telephone: '',
    email: '',
    site: '',
    secteur: 'Commerce & Services',
    palette: SECTOR_COLOR_MAP.default,
    ton: SECTOR_TONE_MAP.default,
    description: `${name} — Entreprise professionnelle de qualité`,
  };
}

export async function scrapeGMB(gmbUrl: string): Promise<GmbScrapedData> {
  log(`Scraping GMB: ${gmbUrl}`, 'gmb-scraper');
  return scrapeWithSerper(gmbUrl);
}
