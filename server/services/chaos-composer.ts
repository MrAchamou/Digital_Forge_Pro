import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from './harmony-validator';
import type { ZoneSelection, CategoryCandidates, EffetCandidat } from './zone-effect-selector';

// ═══════════════════════════════════════════════════════
// CHAOS ORGANISÉ — Compositeur de couches multiples
//
// Principe : au lieu d'un seul effet par zone, on empile
// le TOP-1 de CHAQUE catégorie simultanément.
// Logo = 4 couches sémantiques. Nom = 2. Toutes les autres
// zones = 3 couches sémantiques (chacune avec son rôle visuel).
// ═══════════════════════════════════════════════════════

// ── Catégories sémantiques par zone ─────────────────────────

const LOGO_CATEGORY_ORDER   = ['energie', 'matiere', 'dimension', 'transformation'] as const;
const NOM_CATEGORY_ORDER    = ['lumiere', 'mouvement'] as const;

// Titre : comment le texte apparaît → sa couleur/style → son rythme continu
const TITRE_CATEGORY_ORDER  = ['apparition', 'texture', 'rythme'] as const;

// Contact : animation d'entrée → emphase sur les icônes → ligne de scan
const CONTACT_CATEGORY_ORDER = ['entree', 'emphasis', 'scan'] as const;

// Séparateur : rythme de base → flux d'énergie → éclat électrique/doré
const SEP_CATEGORY_ORDER = ['rythme', 'flux', 'eclat'] as const;

// Fond : couche épurée de base → ambiance atmosphérique → structure géométrique
const FOND_CATEGORY_ORDER = ['epure', 'ambiance', 'structure'] as const;

// CTA : invitation douce → brillance/electricity → attraction magnétique
const CTA_CATEGORY_ORDER = ['invitation', 'brillance', 'attraction'] as const;

// ── Mapping effet_id → catégorie sémantique ────────────────

const TITRE_FUSION_MAP: Record<string, string[]> = {
  apparition: ['TITRE_SLIDE_IN', 'TITRE_FADE_PRESENCE'],
  texture:    ['TITRE_COLOR_SHIFT'],
  rythme:     ['TITRE_LETTER_SPACING_BREATHE'],
};

const CONTACT_FUSION_MAP: Record<string, string[]> = {
  entree:   ['CONTACT_CASCADE_APPEAR'],
  emphasis: ['CONTACT_ICON_PULSE', 'CONTACT_HIGHLIGHT_HOVER'],
  scan:     ['CONTACT_SCAN_LINE'],
};

const SEP_FUSION_MAP: Record<string, string[]> = {
  rythme: ['SEP_BREATHING_CALM'],
  flux:   ['SEP_ENERGY_FLOW', 'SEP_PARTICLE_STREAM'],
  eclat:  ['SEP_ELECTRIC_PULSE', 'SEP_GOLD_SHINE'],
};

const FOND_FUSION_MAP: Record<string, string[]> = {
  epure:     ['FOND_MINIMAL_NOISE', 'FOND_CLEAN_DARK'],
  ambiance:  ['FOND_ATMOSPHERIC_BREATH', 'FOND_PLASMA_FIELD'],
  structure: ['FOND_NEURAL_GRID', 'FOND_STELLAR_DRIFT'],
};

const CTA_FUSION_MAP: Record<string, string[]> = {
  invitation: ['CTA_BREATH_INVITATION', 'CTA_STATIC_PRESENCE'],
  brillance:  ['CTA_SHIMMER_SWEEP', 'CTA_ELECTRIC_BORDER'],
  attraction: ['CTA_GRAVITY_PULSE', 'CTA_PARTICLE_ATTRACT'],
};

// ─────────────────────────────────────────────────────
// pickCatLayers
// Sélectionne le meilleur candidat par catégorie sémantique
// (utilisé pour Logo et Nom dont les catégories viennent
//  déjà de zone-effect-selector via CategoryCandidates).
// ─────────────────────────────────────────────────────
function pickCatLayers(
  cats: CategoryCandidates,
  categoryOrder: readonly string[],
  primaryColor: string,
  speed: 'slow' | 'medium' | 'fast' = 'medium',
): { primary: ZoneEffectDecision; layers: EffectLayer[] } {
  const layers: EffectLayer[] = [];

  for (let idx = 0; idx < categoryOrder.length; idx++) {
    const catName = categoryOrder[idx];
    const candidates = (cats[catName] || []) as EffetCandidat[];
    const top = candidates[0];
    if (!top || top.score < 0.05) continue;

    const intensityMult = 1 - idx * 0.12;
    layers.push({
      effet_id:  top.id,
      category:  catName,
      intensity: parseFloat((top.intensite_recommandee * intensityMult).toFixed(3)),
      speed,
      color:     primaryColor,
      raison:    `Chaos ${catName}: ${top.nom}`,
    });
  }

  const first = layers[0];
  const primary: ZoneEffectDecision = {
    effet_id:  first?.effet_id || 'LOGO_VOLUME_BREATHE',
    intensity: first?.intensity || 0.3,
    speed,
    color:     primaryColor,
    raison:    'Chaos primary layer',
  };

  return { primary, layers };
}

// ─────────────────────────────────────────────────────
// pickSemanticFusionLayers
// Pour une zone avec une liste plate de candidats scorés,
// classe chacun dans sa catégorie sémantique (via fusionMap)
// et prend le meilleur par catégorie.
// Résultat : 3 couches aux rôles visuels distincts.
// ─────────────────────────────────────────────────────
function pickSemanticFusionLayers(
  candidates: EffetCandidat[],
  fusionMap: Record<string, string[]>,
  categoryOrder: readonly string[],
  primaryColor: string,
  fallbackId: string,
  speed: 'slow' | 'medium' | 'fast' = 'medium',
): { primary: ZoneEffectDecision; layers: EffectLayer[] } {
  const layers: EffectLayer[] = [];

  for (let idx = 0; idx < categoryOrder.length; idx++) {
    const catName = categoryOrder[idx];
    const allowedIds = new Set(fusionMap[catName] || []);

    // Trouver le meilleur candidat de cette catégorie sémantique
    const best = candidates
      .filter(c => allowedIds.has(c.id))
      .sort((a, b) => b.score - a.score)[0];

    if (!best) continue;

    // Hiérarchie visuelle : couches plus profondes légèrement atténuées
    const intensityMult = 1 - idx * 0.15;
    layers.push({
      effet_id:  best.id,
      category:  catName,
      intensity: parseFloat((best.intensite_recommandee * intensityMult).toFixed(3)),
      speed,
      color:     primaryColor,
      raison:    `Fusion sémantique ${catName}: ${best.nom}`,
    });
  }

  const first = layers[0];
  const primary: ZoneEffectDecision = {
    effet_id:  first?.effet_id || fallbackId,
    intensity: first?.intensity || 0.25,
    speed,
    color:     primaryColor,
    raison:    'Fusion primary layer',
  };

  return { primary, layers };
}

// ─────────────────────────────────────────────────────
// buildChaosComposition
// Construit une ZoneComposition MAXIMUM-COUCHES à partir
// des candidats déjà scorés par le sélecteur.
// Chaque zone reçoit ses catégories sémantiques propres.
// ─────────────────────────────────────────────────────
export function buildChaosComposition(
  selection: ZoneSelection,
  primaryColor: string,
  speed: 'slow' | 'medium' | 'fast' = 'medium',
): ZoneComposition {
  const logoCats    = selection.logo     as CategoryCandidates;
  const nomCats     = selection.nom      as CategoryCandidates;
  const titreCats   = selection.titre    as CategoryCandidates;
  const contactCats = selection.contact  as CategoryCandidates;
  const sepArr      = selection.separateur as EffetCandidat[];
  const fondArr     = selection.fond       as EffetCandidat[];
  const ctaArr      = selection.cta        as EffetCandidat[];

  const { primary: logoPrimary,    layers: logoLayers    } = pickCatLayers(logoCats,    LOGO_CATEGORY_ORDER,    primaryColor, speed);
  const { primary: nomPrimary,     layers: nomLayers     } = pickCatLayers(nomCats,     NOM_CATEGORY_ORDER,     primaryColor, speed);
  const { primary: titrePrimary,   layers: titreLayers   } = pickCatLayers(titreCats,   TITRE_CATEGORY_ORDER,   primaryColor, speed);
  const { primary: contactPrimary, layers: contactLayers } = pickCatLayers(contactCats, CONTACT_CATEGORY_ORDER, primaryColor, speed);
  const { primary: sepPrimary,  layers: sepLayers  } = pickSemanticFusionLayers(
    sepArr, SEP_FUSION_MAP, SEP_CATEGORY_ORDER, primaryColor, 'SEP_BREATHING_CALM', speed,
  );
  const { primary: fondPrimary, layers: fondLayers } = pickSemanticFusionLayers(
    fondArr, FOND_FUSION_MAP, FOND_CATEGORY_ORDER, primaryColor, 'FOND_ATMOSPHERIC_BREATH', speed,
  );
  const { primary: ctaPrimary,  layers: ctaLayers  } = pickSemanticFusionLayers(
    ctaArr, CTA_FUSION_MAP, CTA_CATEGORY_ORDER, primaryColor, 'CTA_BREATH_INVITATION', speed,
  );

  return {
    logo:       { ...logoPrimary,    layers: logoLayers    },
    nom:        { ...nomPrimary,     layers: nomLayers     },
    separateur: { ...sepPrimary,     layers: sepLayers     },
    fond:       { ...fondPrimary,    layers: fondLayers    },
    cta:        { ...ctaPrimary,     layers: ctaLayers     },
    titre:      { ...titrePrimary,   layers: titreLayers   },
    contact:    { ...contactPrimary, layers: contactLayers },
  };
}

// ─────────────────────────────────────────────────────
// enrichWithChaos
// Enrichit une composition existante (post-IA) avec des
// couches sémantiques manquantes. Garantit que TOUTES
// les catégories sont représentées pour chaque zone.
// ─────────────────────────────────────────────────────
export function enrichWithChaos(
  composition: ZoneComposition,
  selection: ZoneSelection,
  primaryColor: string,
): ZoneComposition {
  const result = JSON.parse(JSON.stringify(composition)) as ZoneComposition;

  // ── Logo : forcer les 4 catégories ────────────────
  const logoCats         = selection.logo as CategoryCandidates;
  const existingLogoCats = new Set((result.logo.layers || []).map((l: EffectLayer) => l.category));
  const logoLayers       = [...(result.logo.layers || [])] as EffectLayer[];

  for (const catName of LOGO_CATEGORY_ORDER) {
    if (existingLogoCats.has(catName)) continue;
    const top = ((logoCats[catName] || []) as EffetCandidat[])[0];
    if (!top || top.score < 0.05) continue;
    logoLayers.push({
      effet_id:  top.id,
      category:  catName,
      intensity: parseFloat((top.intensite_recommandee * 0.65).toFixed(3)),
      speed:     result.logo.speed || 'medium',
      color:     result.logo.color || primaryColor,
      raison:    `Auto-chaos logo ${catName}`,
    });
  }
  result.logo.layers = logoLayers;

  // ── Nom : forcer lumiere + mouvement ──────────────
  const nomCats         = selection.nom as CategoryCandidates;
  const existingNomCats = new Set((result.nom.layers || []).map((l: EffectLayer) => l.category));
  const nomLayers       = [...(result.nom.layers || [])] as EffectLayer[];

  for (const catName of NOM_CATEGORY_ORDER) {
    if (existingNomCats.has(catName)) continue;
    const top = ((nomCats[catName] || []) as EffetCandidat[])[0];
    if (!top || top.score < 0.05) continue;
    nomLayers.push({
      effet_id:  top.id,
      category:  catName,
      intensity: parseFloat((top.intensite_recommandee * 0.7).toFixed(3)),
      speed:     result.nom.speed || 'medium',
      color:     result.nom.color || primaryColor,
      raison:    `Auto-chaos nom ${catName}`,
    });
  }
  result.nom.layers = nomLayers;

  // ── Enrichissement sémantique des zones plates ────
  const enrichSemantic = (
    zone: ZoneEffectDecision,
    candidates: EffetCandidat[],
    fusionMap: Record<string, string[]>,
    categoryOrder: readonly string[],
    fallbackColor: string,
  ): ZoneEffectDecision => {
    const currentLayers = (zone.layers || []) as EffectLayer[];
    const existingCats  = new Set(currentLayers.map(l => l.category));
    const existingIds   = new Set(currentLayers.map(l => l.effet_id));
    const newLayers     = [...currentLayers];

    for (const catName of categoryOrder) {
      if (existingCats.has(catName)) continue;

      const allowedIds = new Set(fusionMap[catName] || []);
      const best = candidates
        .filter(c => allowedIds.has(c.id) && !existingIds.has(c.id))
        .sort((a, b) => b.score - a.score)[0];

      if (!best) continue;

      newLayers.push({
        effet_id:  best.id,
        category:  catName,
        intensity: parseFloat((best.intensite_recommandee * 0.6).toFixed(3)),
        speed:     zone.speed || 'medium',
        color:     zone.color || fallbackColor,
        raison:    `Auto-chaos ${catName}`,
      });
      existingIds.add(best.id);
    }

    return { ...zone, layers: newLayers };
  };

  // ── Titre : forcer apparition + texture + rythme ─────
  const titreCats2         = selection.titre   as CategoryCandidates;
  const existingTitreCats  = new Set((result.titre.layers || []).map((l: EffectLayer) => l.category));
  const titreLayers2       = [...(result.titre.layers || [])] as EffectLayer[];
  for (const catName of TITRE_CATEGORY_ORDER) {
    if (existingTitreCats.has(catName)) continue;
    const top = ((titreCats2[catName] || []) as EffetCandidat[])[0];
    if (!top || top.score < 0.05) continue;
    titreLayers2.push({
      effet_id:  top.id,
      category:  catName,
      intensity: parseFloat((top.intensite_recommandee * 0.65).toFixed(3)),
      speed:     result.titre.speed || 'medium',
      color:     result.titre.color || primaryColor,
      raison:    `Auto-chaos titre ${catName}`,
    });
  }
  result.titre.layers = titreLayers2;

  // ── Contact : forcer entree + emphasis + scan ─────────
  const contactCats2        = selection.contact  as CategoryCandidates;
  const existingContactCats = new Set((result.contact.layers || []).map((l: EffectLayer) => l.category));
  const contactLayers2      = [...(result.contact.layers || [])] as EffectLayer[];
  for (const catName of CONTACT_CATEGORY_ORDER) {
    if (existingContactCats.has(catName)) continue;
    const top = ((contactCats2[catName] || []) as EffetCandidat[])[0];
    if (!top || top.score < 0.05) continue;
    contactLayers2.push({
      effet_id:  top.id,
      category:  catName,
      intensity: parseFloat((top.intensite_recommandee * 0.65).toFixed(3)),
      speed:     result.contact.speed || 'medium',
      color:     result.contact.color || primaryColor,
      raison:    `Auto-chaos contact ${catName}`,
    });
  }
  result.contact.layers = contactLayers2;
  result.separateur = enrichSemantic(result.separateur, selection.separateur as EffetCandidat[], SEP_FUSION_MAP,   SEP_CATEGORY_ORDER,  primaryColor);
  result.fond       = enrichSemantic(result.fond,       selection.fond        as EffetCandidat[], FOND_FUSION_MAP,  FOND_CATEGORY_ORDER, primaryColor);
  result.cta        = enrichSemantic(result.cta,        selection.cta         as EffetCandidat[], CTA_FUSION_MAP,   CTA_CATEGORY_ORDER,  primaryColor);

  return result;
}
