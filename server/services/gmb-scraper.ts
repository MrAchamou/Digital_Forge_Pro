import { log } from '../vite';

export interface GmbScrapedData {
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
  adresse: string;
  ville: string;
  pays: string;
  code_postal: string;
  note: number;
  avis: number;
  horaires: string[];
  logo_url: string;
  photos: string[];
  coordonnees: { lat: number; lng: number } | null;
  reseaux_sociaux: Record<string, string>;
  mots_cles: string[];
  slogan: string;
  annee_fondation: string;
  prix_gamme: string;
  accessibilite: string[];
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
  immobilier: ['#0a0a10', '#059669', '#ecfdf5'],
  auto: ['#0a0808', '#dc2626', '#fff5f5'],
  art: ['#08080a', '#9333ea', '#faf5ff'],
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
  immobilier: 'ambitieux et rassurant',
  auto: 'dynamique et précis',
  art: 'créatif et avant-gardiste',
  default: 'professionnel et moderne',
};

function detectSector(category: string, description: string): string {
  const text = (category + ' ' + description).toLowerCase();
  if (text.match(/restaurant|pizza|burger|cuisine|traiteur|brasserie|bistro|crêpe/)) return 'restaurant';
  if (text.match(/café|coffee|bar|salon de thé|tea/)) return 'cafe';
  if (text.match(/hôtel|hotel|hébergement|chambre|résidence|auberge/)) return 'hotel';
  if (text.match(/tech|logiciel|software|numérique|digital|informatique|développement|saas/)) return 'tech';
  if (text.match(/santé|médecin|dentiste|pharmacie|clinique|médical|bien-être|kiné/)) return 'sante';
  if (text.match(/beauté|coiffeur|esthétique|spa|nail|salon|institut/)) return 'beaute';
  if (text.match(/fitness|sport|gym|musculation|yoga|pilates|coach/)) return 'fitness';
  if (text.match(/avocat|notaire|juridique|cabinet|droit|huissier/)) return 'juridique';
  if (text.match(/finance|banque|assurance|comptable|audit|investissement/)) return 'finance';
  if (text.match(/architecte|architecture|design intérieur|décoration|rénovation/)) return 'architecture';
  if (text.match(/mode|vêtement|boutique|fashion|luxe|accessoire/)) return 'mode';
  if (text.match(/école|formation|cours|académie|éducation|université|tuteur/)) return 'education';
  if (text.match(/immobilier|agence immo|maison|appartement|location|vente/)) return 'immobilier';
  if (text.match(/auto|voiture|garage|concession|mécanique|carrosserie/)) return 'auto';
  if (text.match(/art|galerie|musée|peinture|sculpture|photographie|artiste/)) return 'art';
  return 'default';
}

async function fetchLogoUrl(website: string, entrepriseName: string): Promise<string> {
  if (!website) return '';

  try {
    const domain = website
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    // Essai 1 : Clearbit Logo API (haute qualité)
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    const clearbitRes = await fetch(clearbitUrl, { signal: AbortSignal.timeout(4000) });
    if (clearbitRes.ok && clearbitRes.headers.get('content-type')?.startsWith('image/')) {
      log(`Logo trouvé via Clearbit: ${clearbitUrl}`, 'gmb-scraper');
      return clearbitUrl;
    }
  } catch {
    // fallback
  }

  try {
    const domain = website
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
    // Essai 2 : Google Favicon haute résolution
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    log(`Logo via Google Favicon: ${faviconUrl}`, 'gmb-scraper');
    return faviconUrl;
  } catch {
    return '';
  }
}

function parseHoraires(openingHours: any): string[] {
  if (!openingHours) return [];
  if (Array.isArray(openingHours)) return openingHours.map((h: any) => String(h));
  if (typeof openingHours === 'object') {
    return Object.entries(openingHours).map(([day, hours]) => `${day}: ${hours}`);
  }
  return [];
}

function extractSocialLinks(links: any[]): Record<string, string> {
  const result: Record<string, string> = {};
  if (!Array.isArray(links)) return result;
  const patterns: Record<string, RegExp> = {
    facebook: /facebook\.com/i,
    instagram: /instagram\.com/i,
    linkedin: /linkedin\.com/i,
    twitter: /twitter\.com|x\.com/i,
    youtube: /youtube\.com/i,
    tiktok: /tiktok\.com/i,
  };
  for (const link of links) {
    const url = typeof link === 'string' ? link : link?.url || '';
    for (const [network, pattern] of Object.entries(patterns)) {
      if (pattern.test(url) && !result[network]) {
        result[network] = url;
      }
    }
  }
  return result;
}

async function scrapeWithSerper(gmbUrl: string): Promise<GmbScrapedData> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    log('SERPER_API_KEY manquant — utilisation des données de démo', 'gmb-scraper');
    return generateDemoData(gmbUrl);
  }

  try {
    const rawName = decodeURIComponent(gmbUrl)
      .replace(/.*maps\/place\//, '')
      .split('/')[0]
      .replace(/\+/g, ' ')
      .trim();

    // Requête 1 : endpoint /places pour les données GMB
    const [placesRes, searchRes] = await Promise.all([
      fetch('https://google.serper.dev/places', {
        method: 'POST',
        headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: rawName, gl: 'fr', hl: 'fr' }),
      }),
      fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${rawName} site officiel contact email`, gl: 'fr', hl: 'fr', num: 5 }),
      }),
    ]);

    if (!placesRes.ok) throw new Error(`Serper places API error: ${placesRes.status}`);

    const placesData = await placesRes.json();
    const searchData = searchRes.ok ? await searchRes.json() : {};

    const place = placesData.places?.[0];
    if (!place) return generateDemoData(gmbUrl);

    const category = place.category || place.type || '';
    const description = place.description || place.snippet || '';
    const sectorKey = detectSector(category, description);
    const website = place.website || place.url || '';

    // Extraire email depuis les résultats de recherche
    let email = '';
    const searchResults = searchData.organic || [];
    for (const result of searchResults) {
      const emailMatch = (result.snippet || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
      if (emailMatch) { email = emailMatch[0]; break; }
    }

    // Extraire adresse composants
    const addressFull = place.address || place.formattedAddress || '';
    const adresseMatch = addressFull.match(/^(.+?),\s*(\d{5})\s+(.+?)(?:,\s*(.+))?$/);
    const adresse = adresseMatch?.[1] || addressFull;
    const code_postal = adresseMatch?.[2] || place.postalCode || '';
    const ville = adresseMatch?.[3] || place.city || '';
    const pays = adresseMatch?.[4] || place.country || 'France';

    // Horaires
    const horaires = parseHoraires(place.openingHours || place.hours);

    // Photos GMB
    const photos: string[] = [];
    if (place.thumbnailUrl) photos.push(place.thumbnailUrl);
    if (Array.isArray(place.photos)) {
      for (const p of place.photos.slice(0, 5)) {
        const url = typeof p === 'string' ? p : p?.url || p?.thumbnailUrl;
        if (url) photos.push(url);
      }
    }

    // Coordonnées
    const coordonnees = place.latitude && place.longitude
      ? { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) }
      : null;

    // Liens sociaux
    const reseaux_sociaux = extractSocialLinks([
      ...(place.socialLinks || []),
      ...(searchData.organic?.map((r: any) => r.link) || []),
    ]);

    // Logo
    const logo_url = await fetchLogoUrl(website, place.title || rawName);

    // Mots clés depuis la description et catégorie
    const mots_cles = [
      ...category.split(/[,/]/).map((s: string) => s.trim()).filter(Boolean),
      ...(place.attributes || []).slice(0, 5),
    ].filter(Boolean).slice(0, 10);

    log(`GMB scrapé complet: ${place.title} — ${mots_cles.length} mots-clés, logo: ${logo_url ? 'oui' : 'non'}`, 'gmb-scraper');

    return {
      nom: '',
      titre: place.title || 'Professionnel',
      entreprise: place.title || rawName,
      telephone: place.phoneNumber || place.phone || '',
      email,
      site: website,
      secteur: category || 'Commerce',
      palette: SECTOR_COLOR_MAP[sectorKey] || SECTOR_COLOR_MAP.default,
      ton: SECTOR_TONE_MAP[sectorKey] || SECTOR_TONE_MAP.default,
      description: description || `${place.title} — ${category}`,
      adresse,
      ville,
      pays,
      code_postal,
      note: parseFloat(place.rating) || 0,
      avis: parseInt(place.reviewCount || place.reviews) || 0,
      horaires,
      logo_url,
      photos,
      coordonnees,
      reseaux_sociaux,
      mots_cles,
      slogan: place.slogan || place.tagline || '',
      annee_fondation: place.yearFounded || place.foundingDate || '',
      prix_gamme: place.priceRange || place.priceLevel || '',
      accessibilite: place.accessibility || [],
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
    adresse: '',
    ville: '',
    pays: 'France',
    code_postal: '',
    note: 0,
    avis: 0,
    horaires: [],
    logo_url: '',
    photos: [],
    coordonnees: null,
    reseaux_sociaux: {},
    mots_cles: [],
    slogan: '',
    annee_fondation: '',
    prix_gamme: '',
    accessibilite: [],
  };
}

export async function scrapeGMB(gmbUrl: string): Promise<GmbScrapedData> {
  log(`Scraping GMB complet: ${gmbUrl}`, 'gmb-scraper');
  return scrapeWithSerper(gmbUrl);
}
