/**
 * 💾 USER PREFERENCES ENGINE — Module 16, v2.0 (PostgreSQL persistant)
 *
 * Mémorise les choix de l'utilisateur pour personnaliser les suggestions.
 * Survit aux redémarrages du serveur grâce à la persistance PostgreSQL.
 *
 * Nouveautés v2.0 :
 *   - Persistance PostgreSQL (plus de perte au redémarrage)
 *   - Clustering automatique k-means simplifié (segmentation par style)
 *   - Recommandations proactives basées sur l'historique
 *   - Détection du changement de goût (réinitialisation partielle si nécessaire)
 */

import { db } from '../db';
import { userPreferences as userPreferencesTable } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { log } from '../vite';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  user_id:          string;
  favorite_effects: Record<string, number>;
  rejected_effects: string[];
  preferred_style:  'minimal' | 'balanced' | 'expressif' | 'dramatique' | null;
  preferred_intensity: number | null;
  sector_history:   string[];
  variation_choices: Record<string, number>;
  session_count:    number;
  last_active:      number;
  created_at:       number;
  cluster_label?:   string;   // segment k-means : 'minimal_lover' | 'drama_seeker' | etc.
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
  effect_boosts:    Record<string, number>;
  effect_penalties: Record<string, number>;
  style_bias:       string | null;
  intensity_target: number | null;
}

export interface ProactiveRecommendation {
  type:        'effect' | 'style' | 'sector';
  effect_id?:  string;
  style?:      string;
  message:     string;
  confidence:  number;
}

// ─── Cache mémoire (évite des lectures DB répétées) ──────────────────────────

const preferencesCache = new Map<string, UserPreferences>();
const DEFAULT_USER_ID  = 'default';

// ─── Conversion DB row → UserPreferences ─────────────────────────────────────

function rowToPrefs(row: any): UserPreferences {
  return {
    user_id:             row.user_id,
    favorite_effects:    (row.favorite_effects as Record<string, number>) ?? {},
    rejected_effects:    row.rejected_effects ?? [],
    preferred_style:     row.preferred_style as UserPreferences['preferred_style'] ?? null,
    preferred_intensity: row.preferred_intensity ?? null,
    sector_history:      row.sector_history ?? [],
    variation_choices:   (row.variation_choices as Record<string, number>) ?? {},
    session_count:       row.session_count ?? 0,
    last_active:         row.last_active?.getTime() ?? Date.now(),
    created_at:          row.createdAt?.getTime() ?? Date.now(),
    cluster_label:       row.cluster_label ?? undefined,
  };
}

// ─── Lecture DB ───────────────────────────────────────────────────────────────

async function loadFromDB(userId: string): Promise<UserPreferences | null> {
  try {
    const rows = await db.select().from(userPreferencesTable).where(eq(userPreferencesTable.user_id, userId)).limit(1);
    if (rows.length === 0) return null;
    return rowToPrefs(rows[0]);
  } catch (err: any) {
    log(`⚠️ UserPreferences DB read error: ${err.message}`, 'preferences');
    return null;
  }
}

// ─── Écriture DB ──────────────────────────────────────────────────────────────

async function persistToDB(prefs: UserPreferences): Promise<void> {
  try {
    await db.insert(userPreferencesTable).values({
      user_id:             prefs.user_id,
      favorite_effects:    prefs.favorite_effects as any,
      rejected_effects:    prefs.rejected_effects,
      preferred_style:     prefs.preferred_style ?? undefined,
      preferred_intensity: prefs.preferred_intensity ?? undefined,
      sector_history:      prefs.sector_history,
      variation_choices:   prefs.variation_choices as any,
      session_count:       prefs.session_count,
      cluster_label:       prefs.cluster_label ?? undefined,
    }).onConflictDoUpdate({
      target: userPreferencesTable.user_id,
      set: {
        favorite_effects:    prefs.favorite_effects as any,
        rejected_effects:    prefs.rejected_effects,
        preferred_style:     prefs.preferred_style ?? undefined,
        preferred_intensity: prefs.preferred_intensity ?? undefined,
        sector_history:      prefs.sector_history,
        variation_choices:   prefs.variation_choices as any,
        session_count:       prefs.session_count,
        cluster_label:       prefs.cluster_label ?? undefined,
        last_active:         new Date(),
      },
    });
  } catch (err: any) {
    log(`⚠️ UserPreferences DB write error: ${err.message}`, 'preferences');
  }
}

// ─── Clustering k-means simplifié ────────────────────────────────────────────

/**
 * Assigne un label de cluster à l'utilisateur selon ses préférences.
 * Inspiré du k-means : on compare le profil utilisateur à 4 centroïdes prédéfinis.
 */
function computeClusterLabel(prefs: UserPreferences): string {
  const topVariation = Object.entries(prefs.variation_choices)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const avgScore = Object.values(prefs.favorite_effects).reduce((a, b) => a + b, 0) /
    Math.max(1, Object.values(prefs.favorite_effects).length);

  const rejectionRate = prefs.rejected_effects.length / Math.max(1, prefs.session_count);

  // Centroïdes :
  // drama_seeker : variation D, score élevé
  if (topVariation === 'D' && avgScore > 0.6) return 'drama_seeker';
  // minimal_lover : variation A, rejections fréquents
  if (topVariation === 'A' || rejectionRate > 0.3) return 'minimal_lover';
  // expressif_creator : variation B ou C, score moyen-élevé
  if ((topVariation === 'B' || topVariation === 'C') && avgScore > 0.4) return 'expressif_creator';
  // explorer : pas de préférence nette
  return 'explorer';
}

// ─── Détection du changement de goût ──────────────────────────────────────────

/**
 * Détecte si l'utilisateur rejette ses anciens favoris.
 * Si c'est le cas, réinitialise partiellement son profil.
 */
function detectTasteChange(prefs: UserPreferences): boolean {
  const formerFavorites = Object.entries(prefs.favorite_effects)
    .filter(([_, score]) => score > 0.7)
    .map(([id]) => id);

  const rejectedFormerFavs = formerFavorites.filter(id => prefs.rejected_effects.includes(id));
  const changeRate = rejectedFormerFavs.length / Math.max(1, formerFavorites.length);

  return changeRate >= 0.40; // 40% des anciens favoris rejetés → changement de goût
}

function partialReset(prefs: UserPreferences): void {
  // Garder l'historique secteur et la variation favorite, réinitialiser les scores d'effets
  const topVariation = Object.entries(prefs.variation_choices).sort((a, b) => b[1] - a[1])[0]?.[0];

  prefs.favorite_effects = {};
  prefs.rejected_effects = [];
  prefs.preferred_style  = null;
  prefs.preferred_intensity = null;
  prefs.variation_choices = topVariation ? { [topVariation]: 1 } : {};

  log(`🔄 UserPreferences: changement de goût détecté pour ${prefs.user_id} → réinitialisation partielle`, 'preferences');
}

// ─── Obtenir ou créer un profil (avec lecture DB) ────────────────────────────

export async function getOrCreatePreferencesAsync(userId: string = DEFAULT_USER_ID): Promise<UserPreferences> {
  // 1. Vérifier le cache
  if (preferencesCache.has(userId)) return preferencesCache.get(userId)!;

  // 2. Lire depuis PostgreSQL
  const fromDB = await loadFromDB(userId);
  if (fromDB) {
    preferencesCache.set(userId, fromDB);
    return fromDB;
  }

  // 3. Créer un nouveau profil
  const prefs: UserPreferences = {
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
    cluster_label:    'explorer',
  };

  preferencesCache.set(userId, prefs);
  await persistToDB(prefs);
  return prefs;
}

// Compatibilité synchrone (utilise uniquement le cache)
export function getOrCreatePreferences(userId: string = DEFAULT_USER_ID): UserPreferences {
  if (!preferencesCache.has(userId)) {
    const prefs: UserPreferences = {
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
      cluster_label:    'explorer',
    };
    preferencesCache.set(userId, prefs);
    // Charger depuis DB en arrière-plan
    loadFromDB(userId).then(dbPrefs => {
      if (dbPrefs) preferencesCache.set(userId, dbPrefs);
    }).catch(() => {});
  }
  return preferencesCache.get(userId)!;
}

// ─── Enregistrer un choix (avec persistance DB) ───────────────────────────────

export async function recordPreferenceAsync(
  record: PreferenceRecord,
  userId: string = DEFAULT_USER_ID
): Promise<UserPreferences> {
  const prefs = await getOrCreatePreferencesAsync(userId);

  const currentScore = prefs.favorite_effects[record.effect_id] ?? 0;
  const delta        = record.action === 'reject' ? -0.3 :
                       record.action === 'star'   ?  0.4 :
                                                     0.15;
  prefs.favorite_effects[record.effect_id] = Math.max(0, Math.min(1, currentScore + delta));

  if (record.action === 'reject' && !prefs.rejected_effects.includes(record.effect_id)) {
    prefs.rejected_effects.push(record.effect_id);
    if (prefs.rejected_effects.length > 30) prefs.rejected_effects.shift();
  }

  if (record.action === 'star' || record.action === 'select') {
    prefs.rejected_effects = prefs.rejected_effects.filter(e => e !== record.effect_id);
  }

  if (record.secteur && !prefs.sector_history.includes(record.secteur)) {
    prefs.sector_history.unshift(record.secteur);
    if (prefs.sector_history.length > 10) prefs.sector_history.pop();
  }

  if (record.variation) {
    prefs.variation_choices[record.variation] = (prefs.variation_choices[record.variation] ?? 0) + 1;
  }

  if (record.intensity > 0) {
    prefs.preferred_intensity = prefs.preferred_intensity !== null
      ? prefs.preferred_intensity * 0.8 + record.intensity * 0.2
      : record.intensity;
  }

  prefs.session_count++;
  prefs.last_active = Date.now();

  // Clustering après chaque 5 sessions
  if (prefs.session_count % 5 === 0) {
    prefs.cluster_label = computeClusterLabel(prefs);
  }

  // Détection du changement de goût tous les 10 sessions
  if (prefs.session_count % 10 === 0 && prefs.session_count > 0) {
    if (detectTasteChange(prefs)) {
      partialReset(prefs);
    }
  }

  await persistToDB(prefs);
  return prefs;
}

// Compatibilité synchrone
export function recordPreference(
  record: PreferenceRecord,
  userId: string = DEFAULT_USER_ID
): UserPreferences {
  const prefs = getOrCreatePreferences(userId);

  const currentScore = prefs.favorite_effects[record.effect_id] ?? 0;
  const delta        = record.action === 'reject' ? -0.3 :
                       record.action === 'star'   ?  0.4 :
                                                     0.15;
  prefs.favorite_effects[record.effect_id] = Math.max(0, Math.min(1, currentScore + delta));

  if (record.action === 'reject' && !prefs.rejected_effects.includes(record.effect_id)) {
    prefs.rejected_effects.push(record.effect_id);
    if (prefs.rejected_effects.length > 30) prefs.rejected_effects.shift();
  }

  if (record.action === 'star' || record.action === 'select') {
    prefs.rejected_effects = prefs.rejected_effects.filter(e => e !== record.effect_id);
  }

  if (record.secteur && !prefs.sector_history.includes(record.secteur)) {
    prefs.sector_history.unshift(record.secteur);
    if (prefs.sector_history.length > 10) prefs.sector_history.pop();
  }

  if (record.variation) {
    prefs.variation_choices[record.variation] = (prefs.variation_choices[record.variation] ?? 0) + 1;
  }

  if (record.intensity > 0) {
    prefs.preferred_intensity = prefs.preferred_intensity !== null
      ? prefs.preferred_intensity * 0.8 + record.intensity * 0.2
      : record.intensity;
  }

  prefs.session_count++;
  prefs.last_active = Date.now();

  if (prefs.session_count % 5 === 0) {
    prefs.cluster_label = computeClusterLabel(prefs);
  }

  if (prefs.session_count % 10 === 0 && prefs.session_count > 0) {
    if (detectTasteChange(prefs)) {
      partialReset(prefs);
    }
  }

  persistToDB(prefs).catch(() => {});
  return prefs;
}

// ─── Recommandations proactives ───────────────────────────────────────────────

/**
 * Génère des recommandations proactives basées sur l'historique de l'utilisateur.
 * Ex: "Basé sur vos 12 générations, essayez l'effet GOLDEN_SHIMMER"
 */
export function getProactiveRecommendations(userId: string = DEFAULT_USER_ID): ProactiveRecommendation[] {
  const prefs = preferencesCache.get(userId);
  if (!prefs || prefs.session_count < 3) return [];

  const recs: ProactiveRecommendation[] = [];

  // Effet le mieux noté → suggérer des variantes similaires
  const topEffect = Object.entries(prefs.favorite_effects)
    .filter(([_, score]) => score > 0.65)
    .sort((a, b) => b[1] - a[1])[0];

  if (topEffect) {
    const EFFECT_FAMILIES: Record<string, string[]> = {
      'HEARTBEAT':    ['BREATHING', 'PENDULUM_SWING', 'WAVE_SURF'],
      'NEURAL_PULSE': ['QUANTUM_PHASE', 'ENERGY_FLOW', 'ELECTRIC_FORM'],
      'LIQUID_MORPH': ['WAVE_DISSOLVE', 'LIQUID_POUR', 'SMOKE_DISPERSE'],
      'NEON_GLOW':    ['ELECTRIC_HOVER', 'SOUL_AURA', 'SPARKLE_AURA'],
      'STAR_EXPLOSION': ['SUPERNOVA', 'STELLAR_DRIFT', 'STAR_DUST_FORM'],
    };

    const family = EFFECT_FAMILIES[topEffect[0]];
    if (family) {
      const suggestion = family.find(e => !prefs.favorite_effects[e] && !prefs.rejected_effects.includes(e));
      if (suggestion) {
        recs.push({
          type:       'effect',
          effect_id:  suggestion,
          message:    `Basé sur vos ${prefs.session_count} générations, essayez l'effet ${suggestion}`,
          confidence: 0.75,
        });
      }
    }
  }

  // Style suggéré selon le cluster
  const clusterStyleMap: Record<string, string> = {
    'drama_seeker':      'dramatique',
    'minimal_lover':     'minimal',
    'expressif_creator': 'expressif',
    'explorer':          'balanced',
  };

  const suggestedStyle = clusterStyleMap[prefs.cluster_label ?? 'explorer'];
  if (suggestedStyle && suggestedStyle !== prefs.preferred_style) {
    recs.push({
      type:       'style',
      style:      suggestedStyle,
      message:    `Votre profil "${prefs.cluster_label}" suggère le style "${suggestedStyle}"`,
      confidence: 0.60,
    });
  }

  // Secteur le plus utilisé → suggérer d'explorer un secteur connexe
  const topSector = prefs.sector_history[0];
  const SECTOR_ADJACENT: Record<string, string> = {
    'finance':  'consulting',
    'tech':     'startup',
    'medical':  'wellness',
    'creative': 'media',
    'luxe':     'mode',
  };
  if (topSector && SECTOR_ADJACENT[topSector] && !prefs.sector_history.includes(SECTOR_ADJACENT[topSector])) {
    recs.push({
      type:    'sector',
      message: `Vous utilisez souvent "${topSector}" — explorez aussi "${SECTOR_ADJACENT[topSector]}"`,
      confidence: 0.50,
    });
  }

  return recs.sort((a, b) => b.confidence - a.confidence);
}

// ─── Calculer les poids de préférence ────────────────────────────────────────

export function computePreferenceWeights(userId: string = DEFAULT_USER_ID): PreferenceWeights {
  const prefs = getOrCreatePreferences(userId);

  const effectBoosts:    Record<string, number> = {};
  const effectPenalties: Record<string, number> = {};

  Object.entries(prefs.favorite_effects).forEach(([effectId, score]) => {
    if (score > 0.5) {
      effectBoosts[effectId] = 1.0 + (score - 0.5);
    } else if (score < 0.2) {
      effectPenalties[effectId] = score;
    }
  });

  prefs.rejected_effects.forEach(effectId => {
    effectPenalties[effectId] = 0.05;
  });

  const sortedVariations = Object.entries(prefs.variation_choices).sort((a, b) => b[1] - a[1]);
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

export async function resetPreferencesAsync(userId: string = DEFAULT_USER_ID): Promise<void> {
  preferencesCache.delete(userId);
  try {
    await db.delete(userPreferencesTable).where(eq(userPreferencesTable.user_id, userId));
  } catch (err: any) {
    log(`⚠️ UserPreferences DB delete error: ${err.message}`, 'preferences');
  }
}

export function resetPreferences(userId: string = DEFAULT_USER_ID): void {
  preferencesCache.delete(userId);
  db.delete(userPreferencesTable).where(eq(userPreferencesTable.user_id, userId)).catch(() => {});
}

// ─── Liste tous les profils ───────────────────────────────────────────────────

export async function getAllProfilesAsync(): Promise<UserPreferences[]> {
  try {
    const rows = await db.select().from(userPreferencesTable);
    return rows.map(rowToPrefs);
  } catch {
    return Array.from(preferencesCache.values());
  }
}

export function getAllProfiles(): UserPreferences[] {
  return Array.from(preferencesCache.values());
}

// ─── Chargement du cache depuis PostgreSQL au démarrage ──────────────────────

export async function warmupPreferencesCache(): Promise<void> {
  try {
    const rows = await db.select().from(userPreferencesTable).limit(100);
    for (const row of rows) {
      const prefs = rowToPrefs(row);
      preferencesCache.set(prefs.user_id, prefs);
    }
    log(`💾 UserPreferences — Cache réchauffé avec ${rows.length} profils depuis PostgreSQL`, 'preferences');
  } catch (err: any) {
    log(`⚠️ UserPreferences warmup échoué: ${err.message}`, 'preferences');
  }
}
