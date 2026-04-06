/**
 * 💾 USER PREFERENCES ENGINE — Module 16, Priorité 5
 *
 * Mémorise les choix de l'utilisateur pour personnaliser les suggestions :
 * - Effets favoris et effets rejetés
 * - Intensités préférées par secteur
 * - Styles visuels favoris (minimal / expressif / dramatique)
 * - Historique de sélection des variations A/B/C/D
 *
 * Adapte progressivement les poids de sélection des effets
 * selon les préférences individuelles accumulées.
 *
 * API Endpoints :
 *   GET  /api/preferences          → récupérer les préférences
 *   POST /api/preferences/record   → enregistrer un choix
 *   POST /api/preferences/reject   → marquer un effet comme rejeté
 *   DELETE /api/preferences/reset  → réinitialiser
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  user_id:          string;
  favorite_effects: Record<string, number>;  // effet → score de préférence (0-1)
  rejected_effects: string[];
  preferred_style:  'minimal' | 'balanced' | 'expressif' | 'dramatique' | null;
  preferred_intensity: number | null;        // 0-1
  sector_history:   string[];               // secteurs utilisés (ordre chronologique)
  variation_choices: Record<string, number>; // variation → nb de fois choisie
  session_count:    number;
  last_active:      number;
  created_at:       number;
}

export interface PreferenceRecord {
  effect_id:   string;
  action:      'select' | 'reject' | 'star';
  variation:   string;
  secteur:     string;
  intensity:   number;
  timestamp:   number;
}

export interface PreferenceWeights {
  effect_boosts:    Record<string, number>;   // effet → multiplicateur (0.5-1.5)
  effect_penalties: Record<string, number>;   // effet → pénalité (0-0.5)
  style_bias:       string | null;
  intensity_target: number | null;
}

// ─── Store en mémoire (un profil par user_id) ────────────────────────────────

const preferencesStore = new Map<string, UserPreferences>();
const DEFAULT_USER_ID  = 'default';

// ─── Obtenir ou créer un profil ───────────────────────────────────────────────

export function getOrCreatePreferences(userId: string = DEFAULT_USER_ID): UserPreferences {
  if (!preferencesStore.has(userId)) {
    preferencesStore.set(userId, {
      user_id:          userId,
      favorite_effects: {},
      rejected_effects: [],
      preferred_style:  null,
      preferred_intensity: null,
      sector_history:   [],
      variation_choices: {},
      session_count:    0,
      last_active:      Date.now(),
      created_at:       Date.now(),
    });
  }
  return preferencesStore.get(userId)!;
}

// ─── Enregistrer un choix ─────────────────────────────────────────────────────

export function recordPreference(
  record:  PreferenceRecord,
  userId:  string = DEFAULT_USER_ID
): UserPreferences {
  const prefs = getOrCreatePreferences(userId);

  // Mettre à jour le score de l'effet
  const currentScore = prefs.favorite_effects[record.effect_id] ?? 0;
  const delta        = record.action === 'reject' ? -0.3 :
                       record.action === 'star'   ?  0.4 :
                                                     0.15;  // 'select'
  prefs.favorite_effects[record.effect_id] = Math.max(0, Math.min(1, currentScore + delta));

  // Gérer le rejet
  if (record.action === 'reject' && !prefs.rejected_effects.includes(record.effect_id)) {
    prefs.rejected_effects.push(record.effect_id);
    // Garder max 30 effets rejetés (rotation FIFO)
    if (prefs.rejected_effects.length > 30) prefs.rejected_effects.shift();
  }

  // Enlever du rejeté si sélectionné positivement
  if (record.action === 'star' || record.action === 'select') {
    prefs.rejected_effects = prefs.rejected_effects.filter(e => e !== record.effect_id);
  }

  // Historique secteur
  if (record.secteur && !prefs.sector_history.includes(record.secteur)) {
    prefs.sector_history.unshift(record.secteur);
    if (prefs.sector_history.length > 10) prefs.sector_history.pop();
  }

  // Choix de variation
  if (record.variation) {
    prefs.variation_choices[record.variation] = (prefs.variation_choices[record.variation] ?? 0) + 1;
  }

  // Intensité préférée (moyenne glissante)
  if (record.intensity > 0) {
    prefs.preferred_intensity = prefs.preferred_intensity !== null
      ? prefs.preferred_intensity * 0.8 + record.intensity * 0.2
      : record.intensity;
  }

  prefs.session_count++;
  prefs.last_active = Date.now();

  return prefs;
}

// ─── Calculer les poids de préférence pour le pipeline ───────────────────────

export function computePreferenceWeights(userId: string = DEFAULT_USER_ID): PreferenceWeights {
  const prefs = getOrCreatePreferences(userId);

  const effectBoosts:    Record<string, number> = {};
  const effectPenalties: Record<string, number> = {};

  // Boost pour les effets favoris (score > 0.5 → boost proportionnel jusqu'à 1.5×)
  Object.entries(prefs.favorite_effects).forEach(([effectId, score]) => {
    if (score > 0.5) {
      effectBoosts[effectId] = 1.0 + (score - 0.5);   // 1.0 → 1.5
    } else if (score < 0.2) {
      effectPenalties[effectId] = score;                // 0 → 0.2 (pénalité)
    }
  });

  // Pénalité complète pour les rejets
  prefs.rejected_effects.forEach(effectId => {
    effectPenalties[effectId] = 0.05;   // quasi-exclusion (5% de chance résiduelle)
  });

  // Style dominant : variation la plus choisie
  const sortedVariations = Object.entries(prefs.variation_choices)
    .sort((a, b) => b[1] - a[1]);
  const topVariation = sortedVariations[0]?.[0];
  const styleBias: PreferenceWeights['style_bias'] =
    topVariation === 'D' ? 'dramatique' :
    topVariation === 'B' ? 'expressif'  :
    topVariation === 'C' ? 'balanced'   :
    topVariation === 'A' ? 'minimal'    : null;

  return {
    effect_boosts:    effectBoosts,
    effect_penalties: effectPenalties,
    style_bias:       styleBias,
    intensity_target: prefs.preferred_intensity,
  };
}

// ─── Reset des préférences ────────────────────────────────────────────────────

export function resetPreferences(userId: string = DEFAULT_USER_ID): void {
  preferencesStore.delete(userId);
}

// ─── Liste tous les profils ───────────────────────────────────────────────────

export function getAllProfiles(): UserPreferences[] {
  return Array.from(preferencesStore.values());
}
