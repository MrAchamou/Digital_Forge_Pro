import { log } from '../vite';
import { rotator } from './api-key-rotator';

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
  artisan:      ['#0a0e1a', '#1e88e5', '#e8f4ff'],
  restaurant:   ['#1a0a00', '#c8601a', '#f5e6d3'],
  cafe:         ['#2c1810', '#8b5e3c', '#f0e0c8'],
  hotel:        ['#0a0a1a', '#b8960c', '#f5f0e8'],
  tech:         ['#0a0a1a', '#00d4ff', '#e8f4ff'],
  sante:        ['#0a1a10', '#00b894', '#e8fff4'],
  beaute:       ['#1a0a14', '#e84393', '#fff0f8'],
  fitness:      ['#0a0a0a', '#e84317', '#fff0e8'],
  juridique:    ['#0a0810', '#4a3c78', '#f0eeff'],
  finance:      ['#080810', '#1e40af', '#e8f0ff'],
  architecture: ['#0a0a08', '#78716c', '#f5f5f4'],
  mode:         ['#0a0a0a', '#d4a017', '#fff8e8'],
  education:    ['#0a0a1a', '#3b82f6', '#eff6ff'],
  immobilier:   ['#0a0a10', '#059669', '#ecfdf5'],
  auto:         ['#0a0808', '#dc2626', '#fff5f5'],
  art:          ['#08080a', '#9333ea', '#faf5ff'],
  default:      ['#0f0f0f', '#6366f1', '#e8e8ff'],
};

const SECTOR_TONE_MAP: Record<string, string> = {
  artisan:      'sérieux et réactif',
  restaurant:   'chaleureux et gourmand',
  cafe:         'convivial et artisanal',
  hotel:        'luxueux et élégant',
  tech:         'innovant et précis',
  sante:        'rassurant et professionnel',
  beaute:       'glamour et sophistiqué',
  fitness:      'énergique et motivant',
  juridique:    'autoritaire et fiable',
  finance:      'institutionnel et confiant',
  architecture: 'minimal et visionnaire',
  mode:         'élégant et tendance',
  education:    'inspirant et accessible',
  immobilier:   'ambitieux et rassurant',
  auto:         'dynamique et précis',
  art:          'créatif et avant-gardiste',
  default:      'professionnel et moderne',
};

const SECTOR_CTA_MAP: Record<string, string> = {
  artisan:      'Demander un devis gratuit',
  restaurant:   'Réserver une table',
  cafe:         'Passer une commande',
  hotel:        'Vérifier les disponibilités',
  tech:         'Demander une démo',
  sante:        'Prendre rendez-vous',
  beaute:       'Prendre rendez-vous',
  fitness:      'Essai gratuit',
  juridique:    'Consultation gratuite',
  finance:      'Prendre rendez-vous',
  architecture: 'Voir nos réalisations',
  mode:         'Découvrir la collection',
  education:    'En savoir plus',
  immobilier:   'Estimer votre bien',
  auto:         'Prendre rendez-vous',
  art:          'Voir mes œuvres',
  default:      'Nous contacter',
};

function detectSector(category: string, description: string = ''): string {
  const text = (category + ' ' + description).toLowerCase();
  if (text.match(/plombier|plomberie|électricien|chauffagiste|maçon|carreleur|menuisier|serruri|peintre|couvreur|artisan|bricolage|rénovation|dépannage urgence/)) return 'artisan';
  if (text.match(/restaurant|pizza|burger|cuisine|traiteur|brasserie|bistro|crêpe/)) return 'restaurant';
  if (text.match(/café|coffee|bar|salon de thé|tea/)) return 'cafe';
  if (text.match(/hôtel|hotel|hébergement|chambre|résidence|auberge/)) return 'hotel';
  if (text.match(/tech|logiciel|software|numérique|digital|informatique|développement|saas/)) return 'tech';
  if (text.match(/santé|médecin|dentiste|pharmacie|clinique|médical|dentaire|bien-être|kiné|docteur|chirurgien/)) return 'sante';
  if (text.match(/beauté|coiffeur|esthétique|spa|nail|salon|institut/)) return 'beaute';
  if (text.match(/fitness|sport|gym|musculation|yoga|pilates|coach/)) return 'fitness';
  if (text.match(/avocat|notaire|juridique|cabinet|droit|huissier/)) return 'juridique';
  if (text.match(/finance|banque|assurance|comptable|audit|investissement/)) return 'finance';
  if (text.match(/architecte|architecture|design intérieur|décoration/)) return 'architecture';
  if (text.match(/mode|vêtement|boutique|fashion|luxe|accessoire/)) return 'mode';
  if (text.match(/école|formation|cours|académie|éducation|université|tuteur/)) return 'education';
  if (text.match(/immobilier|agence immo|maison|appartement|location|vente/)) return 'immobilier';
  if (text.match(/auto|voiture|garage|concession|mécanique|carrosserie/)) return 'auto';
  if (text.match(/art|galerie|musée|peinture|sculpture|photographie|artiste/)) return 'art';
  return 'default';
}

// ── Résolution URL courte (goo.gl, maps.app.goo.gl, share.google, etc.) ─────
async function resolveShortUrl(url: string): Promise<string> {
  const isShort = /maps\.app\.goo\.gl|goo\.gl\/maps|share\.google/i.test(url);
  if (!isShort) return url;

  try {
    log(`Résolution URL courte Google Maps: ${url}`, 'gmb-scraper');
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });
    const resolved = response.url;
    log(`URL résolue → ${resolved.slice(0, 200)}`, 'gmb-scraper');

    // Si l'URL résolue contient le nom du lieu, on la retourne directement
    if (resolved.includes('/maps/place/') || resolved.includes('maps.google.com')) {
      return resolved;
    }

    // Sinon, tenter d'extraire le nom depuis le HTML de la page
    try {
      const html = await response.text();
      // Chercher le titre de la page Google Maps (contient le nom du lieu)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch?.[1]) {
        const titleText = titleMatch[1].replace(/\s*[-–|].*$/, '').trim(); // Enlever " - Google Maps"
        if (titleText && titleText.length > 2 && !titleText.toLowerCase().includes('google')) {
          log(`Nom extrait du HTML: "${titleText}"`, 'gmb-scraper');
          // Retourner une URL synthétique avec le nom encodé
          return `https://www.google.com/maps/place/${encodeURIComponent(titleText)}`;
        }
      }
    } catch { /* ignore */ }

    return resolved;
  } catch (err: any) {
    log(`Impossible de résoudre URL courte: ${err.message}`, 'gmb-scraper');
    return url;
  }
}

// ── Extraction du nom et coords depuis l'URL ─────────────────────────────────
function extractInfoFromUrl(url: string): { name: string; lat: number | null; lng: number | null; address: string } {
  try {
    const decoded = decodeURIComponent(url);

    // Nom depuis /maps/place/NOM/
    let name = '';
    const placeMatch = decoded.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch?.[1]) {
      name = placeMatch[1].replace(/\+/g, ' ').replace(/_/g, ' ').trim();
    }
    if (!name || name.length < 2) {
      const urlObj = new URL(url);
      const q = urlObj.searchParams.get('q');
      if (q && q.length > 2) name = q.trim();
    }

    // Coordonnées depuis @lat,lng,zoom
    let lat: number | null = null;
    let lng: number | null = null;
    const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }

    // Adresse partielle depuis URL (ex: /maps/place/NAME/CITY)
    let address = '';
    const addrMatch = decoded.match(/\/maps\/place\/[^/@]+\/([^@?]+)/);
    if (addrMatch?.[1] && addrMatch[1].length > 2) {
      address = addrMatch[1].replace(/\+/g, ' ').trim();
    }

    return { name, lat, lng, address };
  } catch {
    return { name: '', lat: null, lng: null, address: '' };
  }
}

// ── Parse adresse Serper → ville / code_postal ───────────────────────────────
function parseAddress(address: string): { rue: string; ville: string; code_postal: string; pays: string } {
  if (!address) return { rue: '', ville: '', code_postal: '', pays: 'France' };

  let rue = '';
  let ville = '';
  let code_postal = '';
  let pays = 'France';

  // Format 1 : "RUE, CP VILLE" (avec virgule — typique Serper Places)
  // Format 2 : "RUE CP VILLE" (sans virgule — typique snippets)
  // Détecte d'abord la présence d'un code postal 5 chiffres
  const cpMatch = address.match(/\b(\d{5})\b\s*([A-ZÀ-Ÿa-zà-ÿ][^\n,|]{1,40})?/);
  if (cpMatch) {
    code_postal = cpMatch[1];
    ville = (cpMatch[2] || '').trim().replace(/[.,]$/, '');

    // La rue est tout ce qui précède le code postal
    const cpPos = address.indexOf(cpMatch[0]);
    if (cpPos > 0) {
      rue = address.substring(0, cpPos).replace(/[,\s]+$/, '').trim();
    }
  } else {
    // Pas de code postal : on split par virgule
    const parts = address.split(',').map(p => p.trim());
    rue = parts[0] || '';
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const cpInline = part.match(/^(\d{4,5})\s+(.+)$/);
      if (cpInline) {
        code_postal = cpInline[1];
        ville = cpInline[2].trim();
      } else if (part.match(/^(France|Belgique|Suisse|Canada|Maroc|Tunisie)$/i)) {
        pays = part.trim();
      } else if (!ville) {
        ville = part;
      }
    }
  }

  // Détection pays depuis ville ou adresse
  if (address.match(/\bFrance\b/i)) pays = 'France';
  else if (address.match(/\bBelgique\b/i)) pays = 'Belgique';
  else if (address.match(/\bSuisse\b/i)) pays = 'Suisse';

  // Nettoyage ville (enlever le pays si collé)
  ville = ville.replace(/,?\s*(France|Belgique|Suisse|Canada|Maroc|Tunisie)$/i, '').trim();

  return { rue: rue || address, ville, code_postal, pays };
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

// ── Extraction réseaux sociaux ───────────────────────────────────────────────
const SOCIAL_PATTERNS: Record<string, RegExp> = {
  facebook:  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s"'<>)]+/i,
  instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s"'<>)]+/i,
  linkedin:  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/[^\s"'<>)]+/i,
  twitter:   /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[^\s"'<>)]+/i,
  youtube:   /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:channel|c|user|@)[^\s"'<>)]+/i,
  tiktok:    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\s"'<>)]+/i,
};

function extractSocialLinks(texts: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [platform, regex] of Object.entries(SOCIAL_PATTERNS)) {
    for (const text of texts) {
      const match = text.match(regex);
      if (match?.[0]) {
        let url = match[0].trim();
        if (!url.startsWith('http')) url = 'https://' + url;
        result[platform] = url;
        break;
      }
    }
  }
  return result;
}

// ── Logo via Clearbit → Brandfetch → Google Favicon ─────────────────────────
async function fetchLogoUrl(website: string): Promise<string> {
  if (!website) return '';
  try {
    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!domain) return '';

    // 1. Clearbit
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    try {
      const res = await fetch(clearbitUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
        log(`Logo Clearbit: ${clearbitUrl}`, 'gmb-scraper');
        return clearbitUrl;
      }
    } catch { /* ignore */ }

    // 2. Brandfetch
    const bfUrl = `https://cdn.brandfetch.io/${domain}/w/400/h/400`;
    try {
      const res = await fetch(bfUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
        log(`Logo Brandfetch: ${bfUrl}`, 'gmb-scraper');
        return bfUrl;
      }
    } catch { /* ignore */ }

    // 3. Google Favicon (fallback garanti)
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    log(`Logo Google Favicon: ${faviconUrl}`, 'gmb-scraper');
    return faviconUrl;
  } catch {
    return '';
  }
}

async function fetchLogoBase64(logoUrl: string): Promise<string> {
  if (!logoUrl) return '';
  try {
    const res = await fetch(logoUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return '';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = res.headers.get('content-type') || 'image/png';
    log(`Logo base64: ${Math.round(base64.length / 1024)}KB`, 'gmb-scraper');
    return `data:${mime};base64,${base64}`;
  } catch (err: any) {
    log(`Logo base64 échoué: ${err.message}`, 'gmb-scraper');
    return '';
  }
}

// ── Appel Serper Places API (avec rotateur) ───────────────────────────────────
async function callSerperPlaces(query: string): Promise<any[]> {
  let activeKey: any = null;
  const start = Date.now();
  try {
    activeKey = await rotator.selectBestKey('serper');
    log(`Serper Places: "${query}" [clé: ${activeKey.id}]`, 'gmb-scraper');
    const res = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': activeKey.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'fr', hl: 'fr' }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const text = await res.text();
      log(`Serper Places HTTP ${res.status} [clé: ${activeKey.id}]`, 'gmb-scraper');
      await rotator.handleError(activeKey, res.status, text);
      return [];
    }
    await rotator.recordSuccess(activeKey, Date.now() - start);
    const data = await res.json() as any;
    return (data.places as any[]) || [];
  } catch (err: any) {
    if (activeKey) await rotator.handleError(activeKey, 0, err.message);
    log(`Serper Places erreur: ${err.message}`, 'gmb-scraper');
    return [];
  }
}

// ── Appel Serper Search API (avec rotateur) ───────────────────────────────────
async function callSerperSearch(query: string): Promise<any> {
  let activeKey: any = null;
  const start = Date.now();
  try {
    activeKey = await rotator.selectBestKey('serper');
    log(`Serper Search: "${query}" [clé: ${activeKey.id}]`, 'gmb-scraper');
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': activeKey.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'fr', hl: 'fr', num: 5 }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const text = await res.text();
      await rotator.handleError(activeKey, res.status, text);
      return null;
    }
    await rotator.recordSuccess(activeKey, Date.now() - start);
    return await res.json();
  } catch (err: any) {
    if (activeKey) await rotator.handleError(activeKey, 0, err.message);
    log(`Serper Search erreur: ${err.message}`, 'gmb-scraper');
    return null;
  }
}

// ── Extraction téléphone depuis snippets organiques ───────────────────────────
function extractPhoneFromSnippets(searchData: any): string {
  if (!searchData) return '';
  const FR_PHONE = /(?:\+33|0)[1-9](?:[\s.\-]?\d{2}){4}/g;
  const texts: string[] = [
    searchData.knowledgeGraph?.phoneNumber || '',
    ...(searchData.organic || []).map((r: any) => r.snippet || ''),
    ...(searchData.organic || []).map((r: any) => r.title || ''),
  ];
  for (const text of texts) {
    const match = text.match(FR_PHONE);
    if (match?.[0]) {
      const cleaned = match[0].replace(/\s+/g, ' ').trim();
      if (cleaned.length >= 10) return cleaned;
    }
  }
  return '';
}

// ── Extraction adresse complète depuis snippets ───────────────────────────────
function extractAddressFromSnippets(searchData: any): string {
  if (!searchData) return '';
  const ADDR_PATTERN = /\d{1,4}\s+(?:Av(?:enue)?|Rue|Bd|Boulevard|Impasse|Place|Allée|Chemin|Route|Passage)[^\|,\n]{5,60},?\s*\d{5}/i;
  const texts: string[] = [
    searchData.knowledgeGraph?.address || '',
    ...(searchData.organic || []).map((r: any) => r.snippet || ''),
  ];
  for (const text of texts) {
    const match = text.match(ADDR_PATTERN);
    if (match?.[0]) return match[0].trim();
  }
  return '';
}

// ── Sélectionne le meilleur résultat Places parmi plusieurs ─────────────────
function pickBestPlace(places: any[], targetName: string): any | null {
  if (!places || places.length === 0) return null;
  if (places.length === 1) return places[0];

  const target = targetName.toLowerCase();
  let best = places[0];
  let bestScore = 0;

  for (const p of places) {
    const title = (p.title || '').toLowerCase();
    // Score basé sur similarité titre
    let score = 0;
    const targetWords = target.split(/\s+/).filter(w => w.length > 2);
    for (const word of targetWords) {
      if (title.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

// ── Génération données de démo si tout échoue ────────────────────────────────
function generateDemoData(name: string, url: string): GmbScrapedData {
  const sector = detectSector('', name);
  return {
    nom: '', titre: '', entreprise: name || 'Mon Entreprise',
    telephone: '', email: '', site: '',
    secteur: sector,
    palette: SECTOR_COLOR_MAP[sector] || SECTOR_COLOR_MAP.default,
    ton: SECTOR_TONE_MAP[sector] || SECTOR_TONE_MAP.default,
    description: `${name} — importé depuis Google My Business`,
    adresse: '', ville: '', pays: 'France', code_postal: '',
    note: 0, avis: 0, horaires: [],
    logo_url: '', logo_base64: '', photos: [],
    coordonnees: null, reseaux_sociaux: {},
    mots_cles: [], slogan: '',
    cta: SECTOR_CTA_MAP[sector] || SECTOR_CTA_MAP.default,
    annee_fondation: '', prix_gamme: '', accessibilite: [],
  };
}

// ── Extraction nom depuis CID Google Maps ─────────────────────────────────────
async function resolveNameFromCid(resolvedUrl: string): Promise<string> {
  try {
    // Extraire le CID depuis l'URL (ex: ?cid=1234567890)
    const cidMatch = resolvedUrl.match(/[?&]cid=(\d+)/);
    if (!cidMatch) return '';

    // Chercher dans le HTML si disponible, ou via une requête directe
    const res = await fetch(resolvedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });

    const html = await res.text();
    // Chercher le nom dans le titre ou les métadonnées
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) {
      const name = titleMatch[1].replace(/\s*[-–|].*Google.*$/i, '').trim();
      if (name.length > 2) {
        log(`Nom depuis CID HTML: "${name}"`, 'gmb-scraper');
        return name;
      }
    }
    return '';
  } catch {
    return '';
  }
}

// ── Scraping principal via Serper ─────────────────────────────────────────────
async function scrapeWithSerper(gmbUrl: string): Promise<GmbScrapedData> {
  // 1. Résolution URL courte
  const resolvedUrl = await resolveShortUrl(gmbUrl);
  let { name: extractedName, lat, lng } = extractInfoFromUrl(resolvedUrl);

  log(`Nom extrait depuis l'URL: "${extractedName}"`, 'gmb-scraper');

  // 1b. Fallback : extraire le nom depuis un CID Google Maps si présent
  if (!extractedName && resolvedUrl.includes('cid=')) {
    extractedName = await resolveNameFromCid(resolvedUrl);
  }

  // 1c. Fallback ultime : extraire le paramètre q= de l'URL résolue
  if (!extractedName) {
    try {
      const urlObj = new URL(resolvedUrl.includes('://') ? resolvedUrl : 'https://placeholder.com/' + resolvedUrl);
      const qParam = urlObj.searchParams.get('q');
      if (qParam && qParam.length > 2) extractedName = qParam.trim();
    } catch { /* URL malformée, on ignore */ }
  }

  if (!extractedName) {
    log(`Aucun nom extractible après toutes les tentatives, retour données démo`, 'gmb-scraper');
    return generateDemoData('Mon Entreprise', gmbUrl);
  }

  log(`Nom final utilisé pour le scraping: "${extractedName}"`, 'gmb-scraper');

  // 2. Appels Serper Places + Search en parallèle (le rotateur gère les clés)
  const [places, searchData] = await Promise.all([
    callSerperPlaces(extractedName),
    callSerperSearch(`${extractedName} téléphone adresse`),
  ]);

  // Si aucun résultat Places, essayer avec les coordonnées
  let allPlaces = places;
  if (allPlaces.length === 0 && lat && lng) {
    allPlaces = await callSerperPlaces(`${extractedName} France`);
  }

  // Sélection du meilleur résultat
  const place = pickBestPlace(allPlaces, extractedName);

  if (!place) {
    log(`Aucun résultat Serper Places pour: "${extractedName}"`, 'gmb-scraper');
    return generateDemoData(extractedName, gmbUrl);
  }

  log(`Place sélectionnée: "${place.title}" — ${place.address || 'adresse N/A'}`, 'gmb-scraper');

  // 4. Parsing de l'adresse
  //    Stratégie en cascade : Places → snippets organiques → vide
  let rawAddress = (place.address as string) || '';
  if (!rawAddress) {
    rawAddress = extractAddressFromSnippets(searchData);
    if (rawAddress) log(`Adresse extraite des snippets: ${rawAddress}`, 'gmb-scraper');
  }

  // Si Places a fourni une adresse incomplète (sans CP), enrichir avec les snippets
  if (rawAddress && !/\d{5}/.test(rawAddress)) {
    const addrFromSnippets = extractAddressFromSnippets(searchData);
    if (addrFromSnippets && /\d{5}/.test(addrFromSnippets)) {
      rawAddress = addrFromSnippets;
      log(`Adresse enrichie (CP depuis snippets): ${rawAddress}`, 'gmb-scraper');
    }
  }

  const { rue, ville, code_postal, pays } = parseAddress(rawAddress);

  // 5. Détection secteur
  const category = (place.category as string) || '';
  const sector = detectSector(category, place.title || '');
  log(`Secteur détecté: ${sector} (catégorie: ${category})`, 'gmb-scraper');

  // 6. Téléphone — cascade : Places → snippets organiques
  let telephone = (place.phoneNumber as string) || '';
  if (!telephone) {
    telephone = extractPhoneFromSnippets(searchData);
    if (telephone) log(`Téléphone extrait des snippets: ${telephone}`, 'gmb-scraper');
  }

  // Si téléphone toujours manquant, second appel Places avec adresse connue
  if (!telephone && rawAddress) {
    const rawAddrSanitized = rawAddress.replace(/[.,]/g, '');
    const detailedPlaces = await callSerperPlaces(
      `${place.title} ${rawAddrSanitized}`.trim()
    );
    const detailedPlace = pickBestPlace(detailedPlaces, place.title);
    if (detailedPlace?.phoneNumber) {
      telephone = detailedPlace.phoneNumber;
      log(`Téléphone depuis 2ème appel Places: ${telephone}`, 'gmb-scraper');
      // Enrichir l'adresse si besoin
      if (!rawAddress || !/\d{5}/.test(rawAddress)) {
        rawAddress = (detailedPlace.address as string) || rawAddress;
        const reparsed = parseAddress(rawAddress);
        Object.assign({ rue, ville, code_postal }, reparsed);
      }
    }
  }

  // 7. Email + réseaux sociaux depuis les textes bruts
  const kg = searchData?.knowledgeGraph;
  const rawTexts: string[] = [
    place.title || '',
    rawAddress,
    kg?.description || '',
    ...(searchData?.organic || []).map((o: any) => `${o.title} ${o.snippet || ''} ${o.link || ''}`),
  ];

  const email = extractEmails(rawTexts);
  const reseaux_sociaux = extractSocialLinks(rawTexts);

  // 8. Mots-clés
  const mots_cles: string[] = [];
  if (category) mots_cles.push(category);
  if (ville) mots_cles.push(ville);
  if (searchData?.organic) {
    for (const r of searchData.organic.slice(0, 3)) {
      const words = (r.title || '').split(/[\s\-|]+/).filter((w: string) => w.length > 4);
      mots_cles.push(...words.slice(0, 2));
    }
  }

  // 9. Horaires depuis Serper Places
  const horaires: string[] = [];
  if (place.openingHours) {
    if (Array.isArray(place.openingHours)) {
      horaires.push(...place.openingHours);
    } else if (typeof place.openingHours === 'object') {
      for (const [day, hours] of Object.entries(place.openingHours)) {
        horaires.push(`${day}: ${hours}`);
      }
    }
  }

  // 10. Description
  const description = kg?.description
    || `${place.title} — ${category}${ville ? `, ${ville}` : ''}`;

  // 11. Logo (parallèle avec le reste)
  const website = (place.website as string) || kg?.website || '';
  const logo_url = await fetchLogoUrl(website);
  const logo_base64 = logo_url ? await fetchLogoBase64(logo_url) : '';

  // 12. Coordonnées
  const coordonnees = (place.latitude && place.longitude)
    ? { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) }
    : (lat && lng ? { lat, lng } : null);

  const addressFinal = parseAddress(rawAddress);

  log(
    `Extraction terminée: nom="${place.title}" | note=${place.rating} | ` +
    `tel=${telephone || 'N/A'} | site=${website ? 'OK' : 'absent'} | logo=${logo_url ? 'OK' : 'absent'}`,
    'gmb-scraper'
  );

  return {
    nom: '',
    titre: '',
    entreprise: (place.title as string) || extractedName,
    telephone,
    email,
    site: website,
    secteur: sector,
    palette: SECTOR_COLOR_MAP[sector] || SECTOR_COLOR_MAP.default,
    ton: SECTOR_TONE_MAP[sector] || SECTOR_TONE_MAP.default,
    description,
    adresse: addressFinal.rue || rawAddress,
    ville: addressFinal.ville || ville || '',
    pays: addressFinal.pays || pays || 'France',
    code_postal: addressFinal.code_postal || code_postal || '',
    note: typeof place.rating === 'number' ? place.rating : parseFloat(place.rating as string) || 0,
    avis: typeof place.ratingCount === 'number' ? place.ratingCount : parseInt(place.ratingCount as string) || 0,
    horaires,
    logo_url,
    logo_base64,
    photos: [],
    coordonnees,
    reseaux_sociaux,
    mots_cles: [...new Set(mots_cles)].slice(0, 10),
    slogan: kg?.description?.split('.')[0] || '',
    cta: SECTOR_CTA_MAP[sector] || SECTOR_CTA_MAP.default,
    annee_fondation: '',
    prix_gamme: '',
    accessibilite: [],
  };
}

export async function scrapeGMB(gmbUrl: string): Promise<GmbScrapedData> {
  log(`Scraping GMB: ${gmbUrl}`, 'gmb-scraper');
  try {
    return await scrapeWithSerper(gmbUrl);
  } catch (error: any) {
    log(`Erreur critique scraper: ${error.message}`, 'gmb-scraper');
    const { name } = extractInfoFromUrl(gmbUrl);
    return generateDemoData(name || 'Mon Entreprise', gmbUrl);
  }
}
