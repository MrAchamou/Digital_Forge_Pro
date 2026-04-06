/**
 * 🗂️ PRESET MANAGER — Module 17, v2.0 (PostgreSQL persistant)
 *
 * Système de sauvegarde/restauration de configurations complètes.
 * Survit aux redémarrages du serveur grâce à la persistance PostgreSQL.
 *
 * Nouveautés v2.0 :
 *   - Persistance PostgreSQL (plus de perte au redémarrage)
 *   - Versioning des presets (historique + rollback)
 *   - Miniature SVG automatique pour chaque preset (~200×60 px)
 *   - Presets publics/privés avec partage entre utilisateurs
 *   - Recommandation : "Les utilisateurs avec un profil similaire ont préféré ce preset"
 */

import { db } from '../db';
import { presets as presetsTable } from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { log } from '../vite';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PresetConfiguration {
  style:       'minimal' | 'balanced' | 'expressif' | 'dramatique';
  intensite:   'minimal' | 'subtil' | 'expressif' | 'dramatique';
  palette:     string[];
  effects_hint: Record<string, string>;
  timing_profile: string;
  sector:      string;
  metadata?:   Record<string, any>;
}

export interface Preset {
  id:            string;
  name:          string;
  description:   string;
  secteur:       string;
  tags:          string[];
  is_smart:      boolean;
  is_public:     boolean;
  configuration: PresetConfiguration;
  thumbnail_svg: string | null;
  usage_count:   number;
  version:       number;
  parent_id:     string | null;
  created_by:    string;
  created_at:    number;
  last_used:     number | null;
}

export interface PresetVersion {
  preset_id:     string;
  version:       number;
  configuration: PresetConfiguration;
  created_at:    number;
}

// ─── Cache en mémoire ─────────────────────────────────────────────────────────

const presetsCache = new Map<string, Preset>();
let   smartPresetsInitialized = false;

// ─── Conversion DB row → Preset ───────────────────────────────────────────────

function rowToPreset(row: any): Preset {
  return {
    id:            row.id,
    name:          row.name,
    description:   row.description ?? '',
    secteur:       row.secteur,
    tags:          row.tags ?? [],
    is_smart:      row.is_smart ?? false,
    is_public:     row.is_public ?? false,
    configuration: row.configuration as PresetConfiguration,
    thumbnail_svg: row.thumbnail_svg ?? null,
    usage_count:   row.usage_count ?? 0,
    version:       row.version ?? 1,
    parent_id:     row.parent_id ?? null,
    created_by:    row.created_by ?? 'system',
    created_at:    row.createdAt?.getTime() ?? Date.now(),
    last_used:     row.last_used?.getTime() ?? null,
  };
}

// ─── Génération de miniature SVG (~200×60 px) ─────────────────────────────────

/**
 * Génère une miniature SVG minimaliste représentant le preset.
 * Palette de couleurs + icônes des zones principales.
 */
function generateThumbnailSVG(config: PresetConfiguration): string {
  const colors = config.palette ?? ['#1e293b', '#6366f1', '#f1f5f9'];
  const c1 = colors[0] ?? '#1e293b';
  const c2 = colors[1] ?? '#6366f1';
  const c3 = colors[2] ?? '#f1f5f9';

  const speedMap: Record<string, string> = { slow: '3s', medium: '1.5s', fast: '0.7s' };
  const dur = speedMap[config.timing_profile] ?? '1.5s';

  const styleLabel: Record<string, string> = {
    minimal:    'MIN',
    balanced:   'BAL',
    expressif:  'EXP',
    dramatique: 'DRA',
  };
  const label = styleLabel[config.style] ?? 'BAL';

  const effectNames = Object.values(config.effects_hint ?? {}).slice(0, 3);
  const effectText = effectNames.join(' · ') || 'Signature';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <defs>
    <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="60" fill="url(#pg)" rx="6"/>
  <rect x="8" y="8" width="36" height="36" rx="4" fill="${c3}" opacity="0.25"/>
  <text x="26" y="31" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="${c3}">${label}</text>
  <text x="54" y="22" font-family="sans-serif" font-size="9" font-weight="bold" fill="${c3}" opacity="0.9">${effectText.slice(0, 24)}</text>
  <text x="54" y="36" font-family="sans-serif" font-size="7" fill="${c3}" opacity="0.6">${config.intensite} · ${config.timing_profile}</text>
  <rect x="8" y="50" width="184" height="3" rx="1.5" fill="${c2}" opacity="0.5">
    <animate attributeName="width" values="0;184;0" dur="${dur}" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

// ─── Tags automatiques ────────────────────────────────────────────────────────

function autoGenerateTags(config: PresetConfiguration): string[] {
  const tags: string[] = [config.sector];
  tags.push(config.style);
  if (config.intensite === 'dramatique') tags.push('high-impact');
  if (config.intensite === 'minimal')    tags.push('subtle');
  if (config.timing_profile === 'fast')  tags.push('dynamic');
  if (config.timing_profile === 'slow')  tags.push('serene');

  if (config.palette?.[0]) {
    const hex = config.palette[0];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (r > 180 && g < 100 && b < 100)  tags.push('rouge');
    if (r < 100 && g < 100 && b > 180)  tags.push('bleu');
    if (r < 60  && g < 60  && b < 60)   tags.push('sombre');
    if (r > 220 && g > 220 && b > 220)  tags.push('clair');
  }

  return [...new Set(tags)];
}

// ─── Presets intelligents par secteur ─────────────────────────────────────────

const SMART_PRESETS_DATA: Omit<Preset, 'id' | 'created_at' | 'last_used' | 'usage_count' | 'is_smart' | 'thumbnail_svg' | 'version' | 'parent_id'>[] = [
  {
    name: 'Finance Prestige', description: 'Élégance sobre — parfait pour les cabinets de gestion',
    secteur: 'finance', tags: ['finance', 'minimal', 'prestige', 'bleu', 'corporate'], is_public: true, created_by: 'system',
    configuration: { style: 'minimal', intensite: 'subtil', palette: ['#1a3a5c', '#c9a84c', '#f5f5f5'], effects_hint: { logo: 'FADE_LAYERS', nom: 'HEARTBEAT', cta: 'NEON_GLOW' }, timing_profile: 'slow', sector: 'finance' },
  },
  {
    name: 'Finance Dynamique', description: 'Animations ciblées — pour les fintech et banques digitales',
    secteur: 'finance', tags: ['finance', 'balanced', 'tech', 'bleu', 'data'], is_public: true, created_by: 'system',
    configuration: { style: 'balanced', intensite: 'subtil', palette: ['#0a2340', '#2d7dd2', '#ffffff'], effects_hint: { logo: 'NEURAL_PULSE', nom: 'BREATHING', cta: 'ELECTRIC_HOVER' }, timing_profile: 'medium', sector: 'finance' },
  },
  {
    name: 'Luxe Impérial', description: 'Animations dorées ultra-raffinées — maisons de luxe et joaillerie',
    secteur: 'luxe', tags: ['luxe', 'expressif', 'or', 'prestige', 'raffine'], is_public: true, created_by: 'system',
    configuration: { style: 'expressif', intensite: 'expressif', palette: ['#1a1410', '#c9a84c', '#f0ead6'], effects_hint: { logo: 'SPARKLE_AURA', nom: 'BREATHING', cta: 'SOUL_AURA' }, timing_profile: 'slow', sector: 'luxe' },
  },
  {
    name: 'Luxe Contemporain', description: 'Luxe moderne avec effets fluides — mode haute couture',
    secteur: 'luxe', tags: ['luxe', 'mode', 'fluide', 'contemporain', 'blanc'], is_public: true, created_by: 'system',
    configuration: { style: 'expressif', intensite: 'subtil', palette: ['#f7f3ee', '#2c2c2c', '#b8860b'], effects_hint: { logo: 'LIQUID_MORPH', nom: 'FADE_LAYERS', cta: 'PRISM_SPLIT' }, timing_profile: 'slow', sector: 'luxe' },
  },
  {
    name: 'Tech Futuriste', description: 'Effets quantiques et néons — pour startups deeptech et IA',
    secteur: 'tech', tags: ['tech', 'futuriste', 'neon', 'ia', 'dramatique'], is_public: true, created_by: 'system',
    configuration: { style: 'dramatique', intensite: 'expressif', palette: ['#0d1117', '#00ff88', '#7c3aed'], effects_hint: { logo: 'QUANTUM_PHASE', nom: 'NEURAL_PULSE', cta: 'GLITCH_SPAWN' }, timing_profile: 'fast', sector: 'tech' },
  },
  {
    name: 'Tech Professionnel', description: 'Animations nettes — pour SaaS B2B et entreprises tech',
    secteur: 'tech', tags: ['tech', 'balanced', 'bleu', 'professionnel', 'saas'], is_public: true, created_by: 'system',
    configuration: { style: 'balanced', intensite: 'subtil', palette: ['#1e293b', '#3b82f6', '#e2e8f0'], effects_hint: { logo: 'HOLOGRAM', nom: 'ROTATION_3D', cta: 'ENERGY_FLOW' }, timing_profile: 'medium', sector: 'tech' },
  },
  {
    name: 'Creative Explosion', description: 'Effets dramatiques — pour agences créatives et studios design',
    secteur: 'creative', tags: ['creative', 'dramatique', 'coloré', 'bold', 'agence'], is_public: true, created_by: 'system',
    configuration: { style: 'dramatique', intensite: 'dramatique', palette: ['#ff006e', '#fb5607', '#ffbe0b'], effects_hint: { logo: 'STAR_EXPLOSION', nom: 'FIRE_WRITE', cta: 'TORNADO_SPIN' }, timing_profile: 'fast', sector: 'creative' },
  },
  {
    name: 'Creative Flow', description: 'Animations fluides et artistiques — artistes, photographes',
    secteur: 'creative', tags: ['creative', 'expressif', 'fluide', 'artistique', 'photo'], is_public: true, created_by: 'system',
    configuration: { style: 'expressif', intensite: 'expressif', palette: ['#2d00f7', '#f20089', '#00b4d8'], effects_hint: { logo: 'LIQUID_MORPH', nom: 'WAVE_SURF', cta: 'PRISM_SPLIT' }, timing_profile: 'medium', sector: 'creative' },
  },
  {
    name: 'Medical Trust', description: 'Animations sereines — pour cabinets médicaux et cliniques',
    secteur: 'medical', tags: ['medical', 'minimal', 'confiance', 'bleu', 'sante'], is_public: true, created_by: 'system',
    configuration: { style: 'minimal', intensite: 'subtil', palette: ['#0077b6', '#ffffff', '#caf0f8'], effects_hint: { logo: 'BREATHING', nom: 'HEARTBEAT', cta: 'SOUL_AURA' }, timing_profile: 'slow', sector: 'medical' },
  },
  {
    name: 'Signature Universelle', description: 'Configuration équilibrée adaptée à tous les secteurs',
    secteur: 'default', tags: ['universel', 'balanced', 'professionnel'], is_public: true, created_by: 'system',
    configuration: { style: 'balanced', intensite: 'subtil', palette: ['#1e293b', '#6366f1', '#f1f5f9'], effects_hint: { logo: 'HEARTBEAT', nom: 'BREATHING', cta: 'NEON_GLOW' }, timing_profile: 'medium', sector: 'default' },
  },
];

// ─── Initialiser les presets intelligents en PostgreSQL ───────────────────────

async function initSmartPresetsInDB(): Promise<void> {
  if (smartPresetsInitialized) return;
  smartPresetsInitialized = true;

  try {
    const existing = await db.select({ id: presetsTable.id })
      .from(presetsTable)
      .where(eq(presetsTable.is_smart, true))
      .limit(1);

    if (existing.length > 0) {
      log(`🗂️ PresetManager — Presets intelligents déjà présents en DB`, 'presets');
      return;
    }

    for (const smartData of SMART_PRESETS_DATA) {
      const thumbnail = generateThumbnailSVG(smartData.configuration);
      const autoTags  = autoGenerateTags(smartData.configuration);
      const allTags   = [...new Set([...smartData.tags, ...autoTags])];

      await db.insert(presetsTable).values({
        name:          smartData.name,
        description:   smartData.description,
        secteur:       smartData.secteur,
        tags:          allTags,
        is_smart:      true,
        is_public:     true,
        configuration: smartData.configuration as any,
        thumbnail_svg: thumbnail,
        created_by:    'system',
      }).onConflictDoNothing();
    }

    log(`🗂️ PresetManager — ${SMART_PRESETS_DATA.length} presets intelligents initialisés en DB`, 'presets');
  } catch (err: any) {
    log(`⚠️ PresetManager init error: ${err.message}`, 'presets');
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getAllPresets(): Promise<Preset[]> {
  await initSmartPresetsInDB();
  try {
    const rows = await db.select().from(presetsTable).orderBy(desc(presetsTable.createdAt));
    return rows.map(rowToPreset);
  } catch {
    return Array.from(presetsCache.values());
  }
}

export async function getPresetById(id: string): Promise<Preset | null> {
  if (presetsCache.has(id)) return presetsCache.get(id)!;
  try {
    const rows = await db.select().from(presetsTable).where(eq(presetsTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    const preset = rowToPreset(rows[0]);
    presetsCache.set(id, preset);
    return preset;
  } catch {
    return null;
  }
}

export async function getPresetsBySector(secteur: string): Promise<Preset[]> {
  await initSmartPresetsInDB();
  try {
    const rows = await db.select().from(presetsTable).where(eq(presetsTable.secteur, secteur)).orderBy(desc(presetsTable.usage_count));
    return rows.map(rowToPreset);
  } catch {
    return [];
  }
}

export async function getSmartPresets(secteur: string): Promise<Preset[]> {
  await initSmartPresetsInDB();
  try {
    const rows = await db.select().from(presetsTable)
      .where(and(eq(presetsTable.is_smart, true), eq(presetsTable.secteur, secteur)))
      .orderBy(desc(presetsTable.usage_count));

    if (rows.length > 0) return rows.map(rowToPreset);

    // Fallback sur default
    const defaultRows = await db.select().from(presetsTable)
      .where(and(eq(presetsTable.is_smart, true), eq(presetsTable.secteur, 'default')));
    return defaultRows.map(rowToPreset);
  } catch {
    return [];
  }
}

export async function getPublicPresets(): Promise<Preset[]> {
  try {
    const rows = await db.select().from(presetsTable)
      .where(eq(presetsTable.is_public, true))
      .orderBy(desc(presetsTable.usage_count));
    return rows.map(rowToPreset);
  } catch {
    return [];
  }
}

export async function createPreset(data: {
  name:          string;
  description?:  string;
  secteur:       string;
  configuration: PresetConfiguration;
  tags?:         string[];
  is_public?:    boolean;
  created_by?:   string;
}): Promise<Preset> {
  await initSmartPresetsInDB();

  const autoTags   = autoGenerateTags(data.configuration);
  const allTags    = [...new Set([...(data.tags ?? []), ...autoTags])];
  const thumbnail  = generateThumbnailSVG(data.configuration);

  try {
    const rows = await db.insert(presetsTable).values({
      name:          data.name,
      description:   data.description ?? '',
      secteur:       data.secteur,
      tags:          allTags,
      is_smart:      false,
      is_public:     data.is_public ?? false,
      configuration: data.configuration as any,
      thumbnail_svg: thumbnail,
      created_by:    data.created_by ?? 'user',
    }).returning();

    const preset = rowToPreset(rows[0]);
    presetsCache.set(preset.id, preset);
    log(`🗂️ PresetManager — Preset créé: "${preset.name}" (${preset.secteur})`, 'presets');
    return preset;
  } catch (err: any) {
    log(`⚠️ PresetManager createPreset error: ${err.message}`, 'presets');
    throw err;
  }
}

export async function deletePreset(id: string): Promise<boolean> {
  try {
    await db.delete(presetsTable).where(and(eq(presetsTable.id, id), eq(presetsTable.is_smart, false)));
    presetsCache.delete(id);
    return true;
  } catch {
    return false;
  }
}

export async function usePreset(id: string): Promise<Preset | null> {
  try {
    const rows = await db.update(presetsTable)
      .set({ usage_count: sql`${presetsTable.usage_count} + 1`, last_used: new Date() })
      .where(eq(presetsTable.id, id))
      .returning();
    if (rows.length === 0) return null;
    const preset = rowToPreset(rows[0]);
    presetsCache.set(id, preset);
    return preset;
  } catch {
    return presetsCache.get(id) ?? null;
  }
}

// ─── Versioning ───────────────────────────────────────────────────────────────

/**
 * Met à jour un preset en créant une nouvelle version.
 * L'ancienne configuration est sauvegardée comme version parente.
 */
export async function updatePreset(
  id:      string,
  updates: Partial<Pick<Preset, 'name' | 'description' | 'configuration' | 'tags' | 'is_public'>>
): Promise<Preset | null> {
  const existing = await getPresetById(id);
  if (!existing || existing.is_smart) return null;

  try {
    // Sauvegarder l'ancienne version comme enfant
    if (updates.configuration) {
      await db.insert(presetsTable).values({
        name:          `${existing.name} (v${existing.version})`,
        description:   `Version archivée — ${new Date().toLocaleDateString('fr-FR')}`,
        secteur:       existing.secteur,
        tags:          existing.tags,
        is_smart:      false,
        is_public:     false,
        configuration: existing.configuration as any,
        thumbnail_svg: existing.thumbnail_svg,
        created_by:    existing.created_by,
        parent_id:     id,
        version:       existing.version,
      });
    }

    const newThumbnail = updates.configuration ? generateThumbnailSVG(updates.configuration) : existing.thumbnail_svg;
    const newTags = updates.tags
      ? [...new Set([...updates.tags, ...autoGenerateTags(updates.configuration ?? existing.configuration)])]
      : existing.tags;

    const rows = await db.update(presetsTable).set({
      name:          updates.name          ?? existing.name,
      description:   updates.description   ?? existing.description,
      configuration: (updates.configuration as any) ?? (existing.configuration as any),
      tags:          newTags,
      is_public:     updates.is_public     ?? existing.is_public,
      thumbnail_svg: newThumbnail,
      version:       existing.version + 1,
    }).where(eq(presetsTable.id, id)).returning();

    if (rows.length === 0) return null;
    const updated = rowToPreset(rows[0]);
    presetsCache.set(id, updated);
    log(`🗂️ PresetManager — Preset mis à jour: "${updated.name}" → v${updated.version}`, 'presets');
    return updated;
  } catch (err: any) {
    log(`⚠️ PresetManager updatePreset error: ${err.message}`, 'presets');
    return null;
  }
}

/**
 * Récupère l'historique des versions d'un preset.
 */
export async function getPresetVersionHistory(id: string): Promise<Preset[]> {
  try {
    const rows = await db.select().from(presetsTable)
      .where(eq(presetsTable.parent_id, id))
      .orderBy(desc(presetsTable.version));
    return rows.map(rowToPreset);
  } catch {
    return [];
  }
}

/**
 * Rollback vers une version précédente.
 */
export async function rollbackPreset(id: string, versionPresetId: string): Promise<Preset | null> {
  const versionPreset = await getPresetById(versionPresetId);
  if (!versionPreset) return null;

  return updatePreset(id, {
    configuration: versionPreset.configuration,
    name:          versionPreset.name.replace(/ \(v\d+\)$/, ''),
  });
}

// ─── Recommandations ─────────────────────────────────────────────────────────

/**
 * Recommande des presets basés sur le secteur et le style de l'utilisateur.
 */
export async function getRecommendedPresets(
  secteur:      string,
  clusterLabel: string = 'explorer',
  limit:        number = 5
): Promise<Preset[]> {
  const clusterToStyle: Record<string, string> = {
    'drama_seeker':      'dramatique',
    'minimal_lover':     'minimal',
    'expressif_creator': 'expressif',
    'explorer':          'balanced',
  };
  const preferredStyle = clusterToStyle[clusterLabel] ?? 'balanced';

  try {
    // D'abord les presets du même secteur et style
    const sectorRows = await db.select().from(presetsTable)
      .where(and(eq(presetsTable.secteur, secteur), eq(presetsTable.is_public, true)))
      .orderBy(desc(presetsTable.usage_count))
      .limit(limit);

    const results = sectorRows.map(rowToPreset);

    // Si pas assez, compléter avec les presets du style préféré
    if (results.length < limit) {
      const styleRows = await db.select().from(presetsTable)
        .where(eq(presetsTable.is_public, true))
        .orderBy(desc(presetsTable.usage_count))
        .limit(limit - results.length);

      for (const row of styleRows) {
        const p = rowToPreset(row);
        if (!results.find(r => r.id === p.id)) {
          results.push(p);
        }
      }
    }

    // Trier : presets dont le style correspond au cluster en premier
    return results.sort((a, b) => {
      const aMatch = a.configuration.style === preferredStyle ? 1 : 0;
      const bMatch = b.configuration.style === preferredStyle ? 1 : 0;
      return bMatch - aMatch || b.usage_count - a.usage_count;
    });
  } catch {
    return [];
  }
}

// ─── Chargement du cache depuis PostgreSQL au démarrage ──────────────────────

export async function warmupPresetsCache(): Promise<void> {
  await initSmartPresetsInDB();
  try {
    const rows = await db.select().from(presetsTable).orderBy(desc(presetsTable.usage_count)).limit(50);
    for (const row of rows) {
      const preset = rowToPreset(row);
      presetsCache.set(preset.id, preset);
    }
    log(`🗂️ PresetManager — Cache réchauffé avec ${rows.length} presets depuis PostgreSQL`, 'presets');
  } catch (err: any) {
    log(`⚠️ PresetManager warmup échoué: ${err.message}`, 'presets');
  }
}
