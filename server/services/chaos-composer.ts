import type { ZoneComposition, ZoneEffectDecision, EffectLayer } from './harmony-validator';
import type { ZoneSelection, CategoryCandidates, EffetCandidat } from './zone-effect-selector';

// ═══════════════════════════════════════════════════════
// CHAOS ORGANISÉ — Compositeur de couches multiples
//
// Principe : au lieu d'un seul effet par zone, on empile
// le TOP-1 de CHAQUE catégorie simultanément.
// Logo = 4 couches. Nom = 2. Sep/Fond/CTA = 3.
// Résultat : effets spectaculaires "waooow" garantis.
// ═══════════════════════════════════════════════════════

const LOGO_CATEGORY_ORDER   = ['energie', 'matiere', 'dimension', 'transformation'] as const;
const NOM_CATEGORY_ORDER    = ['lumiere', 'mouvement'] as const;
const FLAT_CATEGORY_ORDER   = ['primary', 'secondary', 'tertiary'] as const;

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

    // Chaque couche suivante est légèrement moins intense (hiérarchie visuelle)
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

function pickFlatLayers(
  candidates: EffetCandidat[],
  maxLayers: number,
  primaryColor: string,
  speed: 'slow' | 'medium' | 'fast' = 'medium',
): { primary: ZoneEffectDecision; layers: EffectLayer[] } {
  const top = candidates.slice(0, maxLayers);
  const layers: EffectLayer[] = top.map((c, idx) => ({
    effet_id:  c.id,
    category:  FLAT_CATEGORY_ORDER[idx] || `extra${idx}`,
    intensity: parseFloat((c.intensite_recommandee * (1 - idx * 0.2)).toFixed(3)),
    speed,
    color:     primaryColor,
    raison:    `Chaos flat ${idx + 1}: ${c.nom}`,
  }));

  const first = candidates[0];
  const primary: ZoneEffectDecision = {
    effet_id:  first?.id || 'SEP_BREATHING_CALM',
    intensity: first?.intensite_recommandee || 0.25,
    speed,
    color:     primaryColor,
    raison:    'Chaos primary',
  };

  return { primary, layers };
}

// ─────────────────────────────────────────────────────
// buildChaosComposition
// Construit une ZoneComposition MAXIMUM-COUCHES à partir
// des candidats déjà scorés par le sélecteur.
// Utilisé comme fallback enrichi si Gemini échoue.
// ─────────────────────────────────────────────────────
export function buildChaosComposition(
  selection: ZoneSelection,
  primaryColor: string,
  speed: 'slow' | 'medium' | 'fast' = 'medium',
): ZoneComposition {
  const logoCats   = selection.logo as CategoryCandidates;
  const nomCats    = selection.nom  as CategoryCandidates;
  const sepArr     = selection.separateur as EffetCandidat[];
  const fondArr    = selection.fond       as EffetCandidat[];
  const ctaArr     = selection.cta        as EffetCandidat[];
  const titreArr   = selection.titre      as EffetCandidat[];
  const contactArr = selection.contact    as EffetCandidat[];

  const { primary: logoPrimary, layers: logoLayers }     = pickCatLayers(logoCats,  LOGO_CATEGORY_ORDER, primaryColor, speed);
  const { primary: nomPrimary,  layers: nomLayers  }     = pickCatLayers(nomCats,   NOM_CATEGORY_ORDER,  primaryColor, speed);
  const { primary: sepPrimary,  layers: sepLayers  }     = pickFlatLayers(sepArr,     3, primaryColor, speed);
  const { primary: fondPrimary, layers: fondLayers }     = pickFlatLayers(fondArr,    3, primaryColor, speed);
  const { primary: ctaPrimary,  layers: ctaLayers  }     = pickFlatLayers(ctaArr,     3, primaryColor, speed);
  const { primary: titrePrimary, layers: titreLayers }   = pickFlatLayers(titreArr,   2, primaryColor, speed);
  const { primary: contactPrimary, layers: contactLayers } = pickFlatLayers(contactArr, 2, primaryColor, speed);

  return {
    logo:       { ...logoPrimary, layers: logoLayers },
    nom:        { ...nomPrimary,  layers: nomLayers  },
    separateur: { ...sepPrimary,  layers: sepLayers  },
    fond:       { ...fondPrimary, layers: fondLayers },
    cta:        { ...ctaPrimary,  layers: ctaLayers  },
    titre:      { ...titrePrimary,   layers: titreLayers   },
    contact:    { ...contactPrimary, layers: contactLayers },
  };
}

// ─────────────────────────────────────────────────────
// enrichWithChaos
// Enrichit une composition existante (post-Gemini) avec
// des couches manquantes depuis le sélecteur.
// Garantit que TOUTES les catégories sont représentées.
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

  // ── Nom : forcer lumiere + mouvement ─────────────
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

  // ── Zones plates : ajouter couche secondary si absente ──
  const addSecondaryLayer = (
    zone: ZoneEffectDecision,
    candidates: EffetCandidat[],
    fallbackColor: string,
    targetLayers = 2,
  ): ZoneEffectDecision => {
    const currentLayers = (zone.layers || []) as EffectLayer[];
    if (currentLayers.length >= targetLayers) return zone;
    const usedIds = new Set(currentLayers.map(l => l.effet_id));
    const extra = candidates.filter(c => !usedIds.has(c.id));

    const newLayers = [...currentLayers];
    for (let i = 0; i < Math.min(targetLayers - currentLayers.length, extra.length); i++) {
      const c = extra[i];
      newLayers.push({
        effet_id:  c.id,
        category:  FLAT_CATEGORY_ORDER[currentLayers.length + i] || `extra${i}`,
        intensity: parseFloat((c.intensite_recommandee * (0.6 - i * 0.15)).toFixed(3)),
        speed:     zone.speed || 'medium',
        color:     zone.color || fallbackColor,
        raison:    `Auto-chaos extra couche`,
      });
    }

    return { ...zone, layers: newLayers };
  };

  result.separateur = addSecondaryLayer(result.separateur, selection.separateur as EffetCandidat[], primaryColor, 2);
  result.fond       = addSecondaryLayer(result.fond,       selection.fond       as EffetCandidat[], primaryColor, 2);
  result.cta        = addSecondaryLayer(result.cta,        selection.cta        as EffetCandidat[], primaryColor, 2);
  result.titre      = addSecondaryLayer(result.titre,      selection.titre      as EffetCandidat[], primaryColor, 2);
  result.contact    = addSecondaryLayer(result.contact,    selection.contact    as EffetCandidat[], primaryColor, 2);

  return result;
}
