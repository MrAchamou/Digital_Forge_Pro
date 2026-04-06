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

const VARIATION_PROFILES: Record<VariationContext, { label: string; preference: string; intensite_mult: number }> = {
  A: { label: 'Stable et Rassurant', preference: 'organic_calm',    intensite_mult: 0.75 },
  B: { label: 'Précis et Dynamique', preference: 'precision_energy', intensite_mult: 1.0  },
  C: { label: 'Profond et Atmosphérique', preference: 'depth_atmosphere', intensite_mult: 0.85 },
  D: { label: 'Puissant et Mémorable', preference: 'power_impact',   intensite_mult: 1.2  },
};

const VARIATION_PREFERRED_EFFECTS: Record<VariationContext, string[]> = {
  A: ['LOGO_VOLUME_BREATHE', 'LOGO_HALO_PULSE', 'LOGO_SOUL_AURA', 'NOM_CLEAN_BREATHE', 'SEP_BREATHING_CALM', 'FOND_ATMOSPHERIC_BREATH', 'CTA_BREATH_INVITATION'],
  B: ['LOGO_3D_FLOAT', 'LOGO_ELECTRIC_CORONA', 'NOM_HOLOGRAM_SCAN', 'SEP_ENERGY_FLOW', 'SEP_ELECTRIC_PULSE', 'FOND_NEURAL_GRID', 'CTA_ELECTRIC_BORDER'],
  C: ['LOGO_GYRO_TILT', 'LOGO_SOUL_AURA', 'LOGO_NEURAL_MORPH', 'NOM_SHIMMER_GOLD', 'SEP_PARTICLE_STREAM', 'FOND_STELLAR_DRIFT', 'FOND_PLASMA_FIELD', 'CTA_SHIMMER_SWEEP'],
  D: ['LOGO_3D_FLOAT', 'LOGO_ORBITAL_PARTICLES', 'LOGO_CRYSTAL_FRAGMENT', 'NOM_NEON_GLOW', 'SEP_GOLD_SHINE', 'SEP_PARTICLE_STREAM', 'CTA_GRAVITY_PULSE', 'CTA_PARTICLE_ATTRACT'],
};

let libraryCache: any = null;

function getLibrary(): any {
  if (!libraryCache) {
    const libPath = join(process.cwd(), 'server', 'data', 'zone-effects-library.json');
    libraryCache = JSON.parse(readFileSync(libPath, 'utf-8'));
  }
  return libraryCache;
}

function normaliseSecteur(secteur: string): string {
  const s = secteur.toLowerCase();
  if (s.includes('tech') || s.includes('ia') || s.includes('start')) return 'tech';
  if (s.includes('jurid') || s.includes('avocat') || s.includes('droit')) return 'juridique';
  if (s.includes('luxe') || s.includes('prestige') || s.includes('premium')) return 'luxe';
  if (s.includes('créat') || s.includes('design') || s.includes('studio')) return 'créatif';
  if (s.includes('financ') || s.includes('banque') || s.includes('invest')) return 'finance';
  if (s.includes('santé') || s.includes('méd') || s.includes('pharma')) return 'médical';
  if (s.includes('mode') || s.includes('fashion') || s.includes('beauté')) return 'beauté';
  if (s.includes('min') || s.includes('insti')) return 'minimaliste';
  if (s.includes('innov') || s.includes('science')) return 'innovation';
  return 'tous';
}

function scoreEffect(
  effet: any,
  secteurNorm: string,
  intensiteMouvement: IntensiteMouvement,
  variation: VariationContext
): number {
  let score = 0.5;

  const secteurs: string[] = effet.compatible_secteurs || [];
  if (secteurs.includes('tous') || secteurs.includes(secteurNorm)) {
    score += 0.3;
  } else if (secteurs.length > 0) {
    score -= 0.15;
  }

  const intensiteDefaut = effet.intensite?.defaut ?? 0.3;

  if (intensiteMouvement === 'minimal'    && intensiteDefaut < 0.2) score += 0.2;
  if (intensiteMouvement === 'subtil'     && intensiteDefaut < 0.4) score += 0.15;
  if (intensiteMouvement === 'expressif')                            score += 0.05;
  if (intensiteMouvement === 'dramatique' && (effet.intensite?.max ?? 0) > 0.5) score += 0.25;

  if (VARIATION_PREFERRED_EFFECTS[variation].includes(effet.id)) {
    score += 0.35;
  }

  score += Math.random() * 0.05;

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
  zoneName: string,
  zoneData: any,
  secteurNorm: string,
  intensiteMouvement: IntensiteMouvement,
  variation: VariationContext,
  maxReturn = 4
): EffetCandidat[] {
  const variationMult = VARIATION_PROFILES[variation].intensite_mult;

  const allEffets: any[] = zoneData.effets
    ? zoneData.effets
    : Object.values(zoneData.categories ?? {}).flatMap((cat: any) => cat.effets ?? []);

  const scored = allEffets.map((effet: any) => {
    const score = scoreEffect(effet, secteurNorm, intensiteMouvement, variation);
    const intensiteBase = effet.intensite?.defaut ?? 0.3;
    const intensiteRec = Math.min(
      effet.intensite?.max ?? intensiteBase,
      intensiteBase * variationMult
    );

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

export function selectCandidatesForAllZones(
  secteur: string,
  intensiteMouvement: IntensiteMouvement,
  variation: VariationContext
): ZoneSelection {
  const lib = getLibrary();
  const secteurNorm = normaliseSecteur(secteur);

  const result: ZoneSelection = {
    logo:       selectZoneCandidates('logo',       lib.zones.logo,       secteurNorm, intensiteMouvement, variation, 4),
    nom:        selectZoneCandidates('nom',        lib.zones.nom,        secteurNorm, intensiteMouvement, variation, 4),
    titre:      selectZoneCandidates('titre',      lib.zones.titre,      secteurNorm, intensiteMouvement, variation, 3),
    contact:    selectZoneCandidates('contact',    lib.zones.contact,    secteurNorm, intensiteMouvement, variation, 3),
    separateur: selectZoneCandidates('separateur', lib.zones.separateur, secteurNorm, intensiteMouvement, variation, 4),
    fond:       selectZoneCandidates('fond',       lib.zones.fond,       secteurNorm, intensiteMouvement, variation, 3),
    cta:        selectZoneCandidates('cta',        lib.zones.cta,        secteurNorm, intensiteMouvement, variation, 4),
  };

  applyInterZoneRules(result);

  return result;
}

function applyInterZoneRules(selection: ZoneSelection) {
  const hasOrbitalParticles = selection.logo.some(e => e.id === 'LOGO_ORBITAL_PARTICLES');
  if (hasOrbitalParticles) {
    selection.fond = selection.fond.map(e =>
      e.id === 'FOND_STELLAR_DRIFT'
        ? { ...e, intensite_recommandee: parseFloat((e.intensite_recommandee * 0.5).toFixed(3)) }
        : e
    );
  }
}

export function buildGeminiPromptZones(
  secteur: string,
  ton: string,
  intensiteLabel: string,
  variation: VariationContext,
  intention: string,
  selection: ZoneSelection
): string {
  const formatZone = (zone: EffetCandidat[]) =>
    zone.map(e => `  - ${e.id}: ${e.description} (score: ${e.score})`).join('\n');

  return `Tu es un ingénieur créatif expert en signatures email vivantes.
Sélectionne 1 effet par zone parmi les candidats pré-validés.
Définis les paramètres techniques exacts.

CONTEXTE CLIENT :
Secteur : ${secteur}
Ton émotionnel : ${ton}
Intensité globale : ${intensiteLabel}
Variation : ${variation} — ${VARIATION_PROFILES[variation].label}
Intention : ${intention}

CANDIDATS PAR ZONE :

LOGO :
${formatZone(selection.logo)}

NOM :
${formatZone(selection.nom)}

TITRE :
${formatZone(selection.titre)}

CONTACT :
${formatZone(selection.contact)}

SÉPARATEUR :
${formatZone(selection.separateur)}

FOND :
${formatZone(selection.fond)}

CTA :
${formatZone(selection.cta)}

RÈGLES ABSOLUES :
- Sélectionne EXACTEMENT 1 effet par zone
- L'intensité doit respecter : Logo > Nom > CTA > Séparateur > Fond > Titre > Contact
- Respecte les limites d'intensité recommandées
- speed doit être cohérent (si logo est slow, fond aussi)

Réponds UNIQUEMENT en JSON valide :
{
  "logo":       { "effet_id": "string", "intensity": 0.0, "speed": "slow|medium|fast", "color": "#hex", "raison": "1 phrase" },
  "nom":        { "effet_id": "string", "intensity": 0.0, "speed": "slow|medium|fast", "color": "#hex", "raison": "1 phrase" },
  "titre":      { "effet_id": "string", "intensity": 0.0, "speed": "slow|medium|fast", "color": "#hex", "raison": "1 phrase" },
  "contact":    { "effet_id": "string", "intensity": 0.0, "speed": "slow|medium|fast", "color": "#hex", "raison": "1 phrase" },
  "separateur": { "effet_id": "string", "intensity": 0.0, "speed": "slow|medium|fast", "color": "#hex", "raison": "1 phrase" },
  "fond":       { "effet_id": "string", "intensity": 0.0, "speed": "slow|medium|fast", "color": "#hex", "raison": "1 phrase" },
  "cta":        { "effet_id": "string", "intensity": 0.0, "speed": "slow|medium|fast", "color": "#hex", "raison": "1 phrase" }
}`;
}
