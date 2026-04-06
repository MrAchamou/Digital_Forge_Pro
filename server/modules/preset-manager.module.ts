/**
 * 🗂️ PRESET MANAGER — Module 17, Priorité 5
 *
 * Système de sauvegarde/restauration de configurations complètes :
 * - Sauvegarde une configuration complète (brief + scenario + composition)
 * - Génère 10 presets intelligents par secteur d'activité
 * - Tags automatiques : secteur, style, intensité, variation
 * - Recherche de presets par tags ou secteur
 *
 * API Endpoints :
 *   GET    /api/presets              → liste tous les presets
 *   POST   /api/presets              → créer un preset
 *   GET    /api/presets/:id          → récupérer un preset
 *   DELETE /api/presets/:id          → supprimer un preset
 *   GET    /api/presets/sector/:s    → presets par secteur
 *   GET    /api/presets/smart/:s     → presets intelligents générés pour un secteur
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Preset {
  id:           string;
  name:         string;
  description:  string;
  secteur:      string;
  tags:         string[];
  is_smart:     boolean;    // true = preset généré automatiquement par secteur
  configuration: PresetConfiguration;
  usage_count:  number;
  created_at:   number;
  last_used:    number | null;
}

export interface PresetConfiguration {
  style:       'minimal' | 'balanced' | 'expressif' | 'dramatique';
  intensite:   'minimal' | 'subtil' | 'expressif' | 'dramatique';
  palette:     string[];
  effects_hint: Record<string, string>;  // zone → effet suggéré
  timing_profile: string;                 // 'slow' | 'medium' | 'fast'
  sector:      string;
  metadata?:   Record<string, any>;       // données supplémentaires optionnelles
}

// ─── Store en mémoire ─────────────────────────────────────────────────────────

const presetsStore = new Map<string, Preset>();
let presetCounter  = 0;

// ─── Presets intelligents par secteur ─────────────────────────────────────────

const SMART_PRESETS: Record<string, Omit<Preset, 'id' | 'created_at' | 'last_used' | 'usage_count' | 'is_smart'>[]> = {
  finance: [
    {
      name: 'Finance Prestige',
      description: 'Élégance sobre avec animations minimalistes — parfait pour les cabinets de gestion',
      secteur: 'finance',
      tags: ['finance', 'minimal', 'prestige', 'bleu', 'corporate'],
      configuration: {
        style: 'minimal', intensite: 'subtil', palette: ['#1a3a5c', '#c9a84c', '#f5f5f5'],
        effects_hint: { logo: 'FADE_LAYERS', nom: 'HEARTBEAT', cta: 'NEON_GLOW' },
        timing_profile: 'slow', sector: 'finance',
      },
    },
    {
      name: 'Finance Dynamique',
      description: 'Animations ciblées sur les données clés — pour les fintech et banques digitales',
      secteur: 'finance',
      tags: ['finance', 'balanced', 'tech', 'bleu', 'data'],
      configuration: {
        style: 'balanced', intensite: 'subtil', palette: ['#0a2340', '#2d7dd2', '#ffffff'],
        effects_hint: { logo: 'NEURAL_PULSE', nom: 'BREATHING', cta: 'ELECTRIC_HOVER' },
        timing_profile: 'medium', sector: 'finance',
      },
    },
  ],
  luxe: [
    {
      name: 'Luxe Impérial',
      description: 'Animations dorées ultra-raffinées — pour maisons de luxe et joaillerie',
      secteur: 'luxe',
      tags: ['luxe', 'expressif', 'or', 'prestige', 'raffine'],
      configuration: {
        style: 'expressif', intensite: 'expressif', palette: ['#1a1410', '#c9a84c', '#f0ead6'],
        effects_hint: { logo: 'SPARKLE_AURA', nom: 'BREATHING', cta: 'SOUL_AURA' },
        timing_profile: 'slow', sector: 'luxe',
      },
    },
    {
      name: 'Luxe Contemporain',
      description: 'Luxe moderne avec effets fluides — pour mode haute couture',
      secteur: 'luxe',
      tags: ['luxe', 'mode', 'fluide', 'contemporain', 'blanc'],
      configuration: {
        style: 'expressif', intensite: 'subtil', palette: ['#f7f3ee', '#2c2c2c', '#b8860b'],
        effects_hint: { logo: 'LIQUID_MORPH', nom: 'FADE_LAYERS', cta: 'PRISM_SPLIT' },
        timing_profile: 'slow', sector: 'luxe',
      },
    },
  ],
  tech: [
    {
      name: 'Tech Futuriste',
      description: 'Effets quantiques et néons — pour startups deeptech et IA',
      secteur: 'tech',
      tags: ['tech', 'futuriste', 'neon', 'ia', 'dramatique'],
      configuration: {
        style: 'dramatique', intensite: 'expressif', palette: ['#0d1117', '#00ff88', '#7c3aed'],
        effects_hint: { logo: 'QUANTUM_PHASE', nom: 'NEURAL_PULSE', cta: 'GLITCH_SPAWN' },
        timing_profile: 'fast', sector: 'tech',
      },
    },
    {
      name: 'Tech Professionnel',
      description: 'Animations nettes et précises — pour SaaS B2B et entreprises tech',
      secteur: 'tech',
      tags: ['tech', 'balanced', 'bleu', 'professionnel', 'saas'],
      configuration: {
        style: 'balanced', intensite: 'subtil', palette: ['#1e293b', '#3b82f6', '#e2e8f0'],
        effects_hint: { logo: 'HOLOGRAM', nom: 'ROTATION_3D', cta: 'ENERGY_FLOW' },
        timing_profile: 'medium', sector: 'tech',
      },
    },
  ],
  creative: [
    {
      name: 'Creative Explosion',
      description: 'Effets dramatiques et colorés — pour agences créatives et studios design',
      secteur: 'creative',
      tags: ['creative', 'dramatique', 'coloré', 'bold', 'agence'],
      configuration: {
        style: 'dramatique', intensite: 'dramatique', palette: ['#ff006e', '#fb5607', '#ffbe0b'],
        effects_hint: { logo: 'STAR_EXPLOSION', nom: 'FIRE_WRITE', cta: 'TORNADO_SPIN' },
        timing_profile: 'fast', sector: 'creative',
      },
    },
    {
      name: 'Creative Flow',
      description: 'Animations fluides et artistiques — pour artistes, photographes, illustrateurs',
      secteur: 'creative',
      tags: ['creative', 'expressif', 'fluide', 'artistique', 'photo'],
      configuration: {
        style: 'expressif', intensite: 'expressif', palette: ['#2d00f7', '#f20089', '#00b4d8'],
        effects_hint: { logo: 'LIQUID_MORPH', nom: 'WAVE_SURF', cta: 'PRISM_SPLIT' },
        timing_profile: 'medium', sector: 'creative',
      },
    },
  ],
  medical: [
    {
      name: 'Medical Trust',
      description: 'Animations sereines et rassurantes — pour cabinets médicaux et cliniques',
      secteur: 'medical',
      tags: ['medical', 'minimal', 'confiance', 'bleu', 'sante'],
      configuration: {
        style: 'minimal', intensite: 'subtil', palette: ['#0077b6', '#ffffff', '#caf0f8'],
        effects_hint: { logo: 'BREATHING', nom: 'HEARTBEAT', cta: 'SOUL_AURA' },
        timing_profile: 'slow', sector: 'medical',
      },
    },
  ],
  default: [
    {
      name: 'Signature Universelle',
      description: 'Configuration équilibrée adaptée à tous les secteurs',
      secteur: 'default',
      tags: ['universel', 'balanced', 'professionnel'],
      configuration: {
        style: 'balanced', intensite: 'subtil', palette: ['#1e293b', '#6366f1', '#f1f5f9'],
        effects_hint: { logo: 'HEARTBEAT', nom: 'BREATHING', cta: 'NEON_GLOW' },
        timing_profile: 'medium', sector: 'default',
      },
    },
  ],
};

// ─── Génération d'un ID de preset ─────────────────────────────────────────────

function generatePresetId(): string {
  return `preset_${Date.now()}_${++presetCounter}`;
}

// ─── Tags automatiques ────────────────────────────────────────────────────────

function autoGenerateTags(config: PresetConfiguration): string[] {
  const tags: string[] = [config.sector];

  // Style
  tags.push(config.style);

  // Intensité
  if (config.intensite === 'dramatique') tags.push('high-impact');
  if (config.intensite === 'minimal')    tags.push('subtle');

  // Timing
  if (config.timing_profile === 'fast')  tags.push('dynamic');
  if (config.timing_profile === 'slow')  tags.push('serene');

  // Couleurs dominantes
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

// ─── Initialiser les presets intelligents ─────────────────────────────────────

function initSmartPresets(): void {
  if (presetsStore.size > 0) return;  // déjà initialisés

  Object.values(SMART_PRESETS).flat().forEach(smartPreset => {
    const id = generatePresetId();
    presetsStore.set(id, {
      ...smartPreset,
      id,
      is_smart:    true,
      usage_count: 0,
      created_at:  Date.now(),
      last_used:   null,
    });
  });
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getAllPresets(): Preset[] {
  initSmartPresets();
  return Array.from(presetsStore.values())
    .sort((a, b) => b.created_at - a.created_at);
}

export function getPresetById(id: string): Preset | null {
  return presetsStore.get(id) ?? null;
}

export function getPresetsBySector(secteur: string): Preset[] {
  initSmartPresets();
  return Array.from(presetsStore.values())
    .filter(p => p.secteur === secteur || p.tags.includes(secteur))
    .sort((a, b) => b.usage_count - a.usage_count);
}

export function getSmartPresets(secteur: string): Preset[] {
  initSmartPresets();
  const sectorPresets = Array.from(presetsStore.values()).filter(p => p.is_smart && p.secteur === secteur);
  if (sectorPresets.length > 0) return sectorPresets;
  // Fallback sur default
  return Array.from(presetsStore.values()).filter(p => p.is_smart && p.secteur === 'default');
}

export function createPreset(data: {
  name:          string;
  description?:  string;
  secteur:       string;
  configuration: PresetConfiguration;
  tags?:         string[];
}): Preset {
  initSmartPresets();
  const id          = generatePresetId();
  const autoTags    = autoGenerateTags(data.configuration);
  const allTags     = [...new Set([...(data.tags ?? []), ...autoTags])];

  const preset: Preset = {
    id,
    name:          data.name,
    description:   data.description ?? '',
    secteur:       data.secteur,
    tags:          allTags,
    is_smart:      false,
    configuration: data.configuration,
    usage_count:   0,
    created_at:    Date.now(),
    last_used:     null,
  };

  presetsStore.set(id, preset);
  return preset;
}

export function deletePreset(id: string): boolean {
  return presetsStore.delete(id);
}

export function usePreset(id: string): Preset | null {
  const preset = presetsStore.get(id);
  if (!preset) return null;
  preset.usage_count++;
  preset.last_used = Date.now();
  return preset;
}
