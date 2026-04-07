import { log } from '../vite';
import { callSerper } from './serper-wrapper';

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
  logo_base64: string;
  photos: string[];
  coordonnees: { lat: number; lng: number } | null;
  reseaux_sociaux: Record<string, string>;
  mots_cles: string[];
  slogan: string;
  cta: string;
  annee_fondation: string;
  prix_gamme: string;
  accessibilite: string[];
}

const SECTOR_COLOR_MAP: Record<string, string[]> = {
  artisan: ['#0a0e1a', '#1e88e5', '#e8f4ff'],
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
  artisan: 'sérieux et réactif',
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

const SECTOR_CTA_MAP: Record<string, string> = {
  artisan: 'Demander un devis gratuit',
  restaurant: 'Réserver une table',
  cafe: 'Passer une commande',
  hotel: 'Vérifier les disponibilités',
  tech: 'Demander une démo',
  sante: 'Prendre rendez-vous',
  beaute: 'Prendre rendez-vous',
  fitness: 'Essai gratuit',
  juridique: 'Consultation gratuite',
  finance: 'Prendre rendez-vous',
  architecture: 'Voir nos réalisations',
  mode: 'Découvrir la collection',
  education: 'En savoir plus',
  immobilier: 'Estimer votre bien',
  auto: 'Prendre rendez-vous',
  art: 'Voir mes œuvres',
  default: 'Nous contacter',
};

function detectSector(category: string, description: string): string {
  const text = (category + ' ' + description).toLowerCase();
  if (text.match(/plombier|plomberie|électricien|chauffagiste|maçon|carreleur|menuisier|serruri|peintre|couvreur|artisan|bricolage|rénovation|dépannage urgence/)) return 'artisan';
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

// ── Résolution URL courte ────────────────────────────────────────────────────
async function resolveShortUrl(url: string): Promise<string> {
  const isShort = /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);
  if (!isShort) return url;

  try {
    log(`Résolution URL courte Google Maps: ${url}`, 'gmb-scraper');
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });
    const resolved = response.url;
    log(`URL résolue → ${resolved.slice(0, 120)}`, 'gmb-scraper');
    return resolved;
  } catch (err: any) {
    log(`Impossible de résoudre URL courte: ${err.message}`, 'gmb-scraper');
    return url;
  }
}

// ── Extraction du nom depuis l'URL ───────────────────────────────────────────
function extractPlaceNameFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(url);
    const placeMatch = decoded.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch?.[1]) {
      const name = placeMatch[1].replace(/\+/g, ' ').replace(/_/g, ' ').trim();
      if (name.length > 2) return name;
    }
    const urlObj = new URL(url);
    const q = urlObj.searchParams.get('q');
    if (q && q.length > 2) return q.trim();
    return '';
  } catch {
    return '';
  }
}

// ── Extraction email depuis texte libre ──────────────────────────────────────
const EMAIL_BLACKLIST_DOMAINS = [
  'example', 'sentry', 'noreply', 'no-reply', 'test@', 'agence--web',
  'agenceweb', 'webagency', 'seoweb', 'seoagence', 'marketing',
  'wixsite', 'wordpress', 'jimdo', 'webflow', 'mailchimp',
  'spamgourmet', 'mailnull', 'guerrillamail', 'yopmail',
  'privacy@', 'webmaster@', 'admin@', 'info@apple', 'info@google',
  'example.com', 'example.fr', 'exemple.fr',
];

function extractEmails(texts: string[]): string {
  for (const text of texts) {
    const matches = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-z]{2,6}/gi) || [];
    for (const m of matches) {
      const lower = m.toLowerCase();
      if (!EMAIL_BLACKLIST_DOMAINS.some(bad => lower.includes(bad))) return lower;
    }
  }
  return '';
}

// ── Extraction téléphone depuis texte libre ──────────────────────────────────
function extractPhones(texts: string[]): string {
  // Patterns FR/international
  const patterns = [
    /(?:\+33|0033|0)[1-9](?:[\s.\-]?\d{2}){4}/g,           // FR
    /\+\d{1,3}[\s.\-]?\(?\d{1,4}\)?[\s.\-]?\d{1,4}[\s.\-]?\d{4,}/g, // Intl
    /\b\d{2}[\s.\-]\d{2}[\s.\-]\d{2}[\s.\-]\d{2}[\s.\-]\d{2}\b/g,   // XX XX XX XX XX
  ];
  for (const text of texts) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[0]) {
        const cleaned = match[0].trim().replace(/\s+/g, ' ');
        if (cleaned.length >= 10) return cleaned;
      }
    }
  }
  return '';
}

// ── Extraction réseaux sociaux ───────────────────────────────────────────────
const SOCIAL_PATTERNS: Record<string, RegExp> = {
  facebook:  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s"'<>)]+/i,
  instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s"'<>)]+/i,
  linkedin:  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/[^\s"'<>)]+/i,
  twitter:   /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[^\s"'<>)]+/i,
  youtube:   /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:channel|c|user|@)[^\s"'<>)]+/i,
  tiktok:    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\s"'<>)]+/i,
  pinterest: /(?:https?:\/\/)?(?:www\.)?pinterest\.(?:fr|com)\/[^\s"'<>)]+/i,
  whatsapp:  /(?:https?:\/\/)?(?:api\.)?whatsapp\.com\/(?:send|message)[^\s"'<>)]+/i,
};

function extractSocialLinks(links: string[], extraText?: string): Record<string, string> {
  const result: Record<string, string> = {};
  const corpus = [...links, extraText || ''].join(' ');

  for (const [network, pattern] of Object.entries(SOCIAL_PATTERNS)) {
    const match = corpus.match(pattern);
    if (match?.[0]) {
      let url = match[0];
      if (!url.startsWith('http')) url = 'https://' + url;
      result[network] = url;
    }
  }
  return result;
}

// ── Logo avec fallbacks multiples ────────────────────────────────────────────
async function fetchLogoUrl(website: string, searchData?: any): Promise<string> {
  const getDomain = (site: string) =>
    site.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  // 1. Knowledge graph logo depuis Serper
  if (searchData?.knowledgeGraph?.imageUrl) {
    return searchData.knowledgeGraph.imageUrl;
  }

  // 2. Clearbit Logo API (haute qualité SVG/PNG)
  if (website) {
    try {
      const domain = getDomain(website);
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      const res = await fetch(clearbitUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
        log(`Logo Clearbit: ${clearbitUrl}`, 'gmb-scraper');
        return clearbitUrl;
      }
    } catch { /* fallback */ }
  }

  // 3. Brandfetch (alternatif à Clearbit)
  if (website) {
    try {
      const domain = getDomain(website);
      const bfUrl = `https://cdn.brandfetch.io/${domain}/w/400/h/400`;
      const res = await fetch(bfUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
        log(`Logo Brandfetch: ${bfUrl}`, 'gmb-scraper');
        return bfUrl;
      }
    } catch { /* fallback */ }
  }

  // 4. Google Favicon haute résolution
  if (website) {
    const domain = getDomain(website);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    log(`Logo Google Favicon: ${faviconUrl}`, 'gmb-scraper');
    return faviconUrl;
  }

  return '';
}

async function fetchLogoBase64(logoUrl: string): Promise<string> {
  if (!logoUrl) return '';
  try {
    const res = await fetch(logoUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return '';
    const contentType = res.headers.get('content-type') || 'image/png';
    const mimeType = contentType.split(';')[0].trim();
    if (!mimeType.startsWith('image/')) return '';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    log(`Logo base64: ${Math.round(base64.length / 1024)}KB`, 'gmb-scraper');
    return `data:${mimeType};base64,${base64}`;
  } catch (err: any) {
    log(`Logo base64 échoué: ${err.message}`, 'gmb-scraper');
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

// ── Scraping principal avec 3 requêtes Serper parallèles ─────────────────────
async function scrapeWithSerper(gmbUrl: string): Promise<GmbScrapedData> {
  try {
    // 1. Résoudre l'URL courte
    const resolvedUrl = await resolveShortUrl(gmbUrl);
    let rawName = extractPlaceNameFromUrl(resolvedUrl);

    if (!rawName) {
      log(`Impossible d'extraire un nom depuis: ${resolvedUrl.slice(0, 100)}`, 'gmb-scraper');
      return generateDemoData(gmbUrl);
    }

    log(`Nom extrait: "${rawName}" — lancement de 3 requêtes Serper parallèles`, 'gmb-scraper');

    // 2. 3 requêtes Serper en parallèle
    const [placesData, contactData, socialData] = await Promise.all([
      // Places: données structurées GMB (nom, adresse, téléphone, note, horaires, site)
      callSerper(rawName, { type: 'places', num: 5 }),

      // Contact: email, téléphone, site depuis résultats web
      callSerper(`"${rawName}" contact email téléphone adresse`, { type: 'search', num: 8 }),

      // Social: réseaux sociaux + knowledge graph + logo
      callSerper(`"${rawName}" site:facebook.com OR site:instagram.com OR site:linkedin.com OR site:twitter.com`, { type: 'search', num: 10 }),
    ]);

    const place = placesData.places?.[0];
    if (!place) {
      log(`Aucun résultat Places pour "${rawName}"`, 'gmb-scraper');
      return generateDemoData(gmbUrl);
    }

    // ── Données de base depuis Places ──────────────────────────────────────
    const category  = place.category || place.type || '';
    const description = place.description || place.snippet || '';
    const sectorKey = detectSector(category, description);
    const website   = place.website || place.url || contactData?.knowledgeGraph?.website || '';

    // ── Téléphone — Places en priorité, sinon extraction des snippets ──────
    let telephone = place.phoneNumber || place.phone || '';
    if (!telephone) {
      const snippets = [
        ...(contactData?.organic || []).map((r: any) => (r.snippet || '') + ' ' + (r.title || '')),
        ...(contactData?.knowledgeGraph ? [JSON.stringify(contactData.knowledgeGraph)] : []),
      ];
      telephone = extractPhones(snippets);
    }

    // ── Email — extraction depuis résultats organiques ─────────────────────
    let email = '';
    const contactSnippets: string[] = [
      ...(contactData?.organic || []).map((r: any) => (r.snippet || '') + ' ' + (r.link || '') + ' ' + (r.title || '')),
      ...(contactData?.sitelinks || []).map((s: any) => s.link || ''),
      description,
    ];
    email = extractEmails(contactSnippets);

    // ── Adresse décomposée ─────────────────────────────────────────────────
    const addressFull  = place.address || place.formattedAddress || '';
    const adresseMatch = addressFull.match(/^(.+?),\s*(\d{4,5})\s+(.+?)(?:,\s*(.+))?$/);
    const adresse      = adresseMatch?.[1] || addressFull;
    const code_postal  = adresseMatch?.[2] || place.postalCode || '';
    const ville        = adresseMatch?.[3]?.split(',')[0].trim() || place.city || '';
    const pays         = adresseMatch?.[4] || place.country || 'France';

    // ── Horaires ───────────────────────────────────────────────────────────
    const horaires = parseHoraires(place.openingHours || place.hours);

    // ── Photos GMB ─────────────────────────────────────────────────────────
    const photos: string[] = [];
    if (place.thumbnailUrl) photos.push(place.thumbnailUrl);
    if (Array.isArray(place.photos)) {
      for (const p of place.photos.slice(0, 5)) {
        const url = typeof p === 'string' ? p : p?.url || p?.thumbnailUrl;
        if (url) photos.push(url);
      }
    }

    // ── Coordonnées ────────────────────────────────────────────────────────
    const coordonnees = place.latitude && place.longitude
      ? { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) }
      : null;

    // ── Réseaux sociaux — fusion de toutes les sources ─────────────────────
    const allLinks: string[] = [
      ...(place.socialLinks || []).map((l: any) => (typeof l === 'string' ? l : l?.url || '')),
      ...(socialData?.organic || []).map((r: any) => r.link || ''),
      ...(contactData?.organic || []).map((r: any) => r.link || ''),
    ].filter(Boolean);

    // Aussi extraire depuis knowledgeGraph si disponible
    const kgText = contactData?.knowledgeGraph
      ? JSON.stringify(contactData.knowledgeGraph)
      : '';

    const reseaux_sociaux = extractSocialLinks(allLinks, kgText);

    // ── Logo — 4 fallbacks ─────────────────────────────────────────────────
    const logo_url    = await fetchLogoUrl(website, contactData);
    const logo_base64 = await fetchLogoBase64(logo_url);

    // ── Mots-clés ──────────────────────────────────────────────────────────
    const mots_cles = [
      ...category.split(/[,\/]/).map((s: string) => s.trim()).filter(Boolean),
      ...(place.attributes || []).slice(0, 5),
    ].filter(Boolean).slice(0, 10);

    // ── Description enrichie depuis knowledge graph ────────────────────────
    const enrichedDesc = contactData?.knowledgeGraph?.description
      || description
      || `${place.title} — ${category}`;

    // ── Slogan depuis knowledge graph ──────────────────────────────────────
    const slogan = place.slogan || place.tagline || contactData?.knowledgeGraph?.title || '';

    // ── CTA auto selon secteur ─────────────────────────────────────────────
    const cta = SECTOR_CTA_MAP[sectorKey] || SECTOR_CTA_MAP.default;

    log(
      `✅ GMB: "${place.title}" | ${category} | ${ville} | ★${place.rating} | tél:${telephone ? 'oui' : 'non'} | email:${email ? 'oui' : 'non'} | logo:${logo_url ? 'oui' : 'non'} | réseaux:${Object.keys(reseaux_sociaux).join(',')||'aucun'}`,
      'gmb-scraper'
    );

    return {
      nom: '',
      titre: '',
      entreprise: place.title || rawName,
      telephone,
      email,
      site: website,
      secteur: category || 'Commerce',
      palette: SECTOR_COLOR_MAP[sectorKey] || SECTOR_COLOR_MAP.default,
      ton: SECTOR_TONE_MAP[sectorKey] || SECTOR_TONE_MAP.default,
      description: enrichedDesc,
      adresse,
      ville,
      pays,
      code_postal,
      note: parseFloat(place.rating) || 0,
      avis: parseInt(
        place.reviewCount || place.ratingCount || place.numReviews ||
        place.totalReviews || place.reviews || '0'
      ) || 0,
      horaires,
      logo_url,
      logo_base64,
      photos,
      coordonnees,
      reseaux_sociaux,
      mots_cles,
      slogan,
      cta,
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
  const name = extractPlaceNameFromUrl(gmbUrl) || 'Mon Entreprise';
  return {
    nom: '', titre: '', entreprise: name,
    telephone: '', email: '', site: '',
    secteur: 'Commerce & Services',
    palette: SECTOR_COLOR_MAP.default,
    ton: SECTOR_TONE_MAP.default,
    description: `${name} — Entreprise professionnelle`,
    adresse: '', ville: '', pays: 'France', code_postal: '',
    note: 0, avis: 0, horaires: [],
    logo_url: '', logo_base64: '', photos: [],
    coordonnees: null, reseaux_sociaux: {},
    mots_cles: [], slogan: '',
    cta: SECTOR_CTA_MAP.default,
    annee_fondation: '', prix_gamme: '', accessibilite: [],
  };
}

export async function scrapeGMB(gmbUrl: string): Promise<GmbScrapedData> {
  log(`Scraping GMB: ${gmbUrl}`, 'gmb-scraper');
  return scrapeWithSerper(gmbUrl);
}

// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion