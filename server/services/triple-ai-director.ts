import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { log } from '../vite';

const EFFECTS_LIBRARY = [
  'HEARTBEAT', 'SOUL_AURA', 'PLASMA_DRIFT', 'NEON_PULSE', 'GOLDEN_SHIMMER',
  'CRYSTAL_BREATH', 'SHADOW_DANCE', 'AURORA_FLOW', 'EMBER_GLOW', 'FROST_VEIL',
  'QUANTUM_RIPPLE', 'LUNAR_TIDE', 'SOLAR_FLARE', 'COSMIC_DUST', 'DIGITAL_RAIN',
  'SILK_WAVE', 'INK_BLOOM', 'FIRE_WHISPER', 'ICE_CRYSTAL', 'THUNDER_ECHO',
  'VOID_PULSE', 'LIGHT_BEAM', 'MIRROR_GHOST', 'PRISM_CASCADE', 'VELVET_FADE',
  'STORM_BREATH', 'OCEAN_DEPTH', 'FOREST_MIST', 'CITY_LIGHTS', 'STAR_DRIFT',
  'CHROME_WAVE', 'OBSIDIAN_FLOW', 'PEARL_SHIMMER', 'RUBY_PULSE', 'SAPPHIRE_GLOW',
  'EMERALD_BREATH', 'DIAMOND_FLASH', 'GOLD_WEAVE', 'SILVER_RAIN', 'BRONZE_ECHO',
  'STATIC_WHISPER', 'GLITCH_BLOOM', 'PIXEL_STORM', 'DATA_STREAM', 'MATRIX_FALL',
  'SOFT_GRADIENT', 'DEEP_GLOW', 'SUBTLE_BREATHE', 'MINIMAL_PULSE', 'CLEAN_FADE',
];

export interface CreativeBrief {
  style_detecte: string;
  references_visuelles: string[];
  ton_emotionnel: string;
  intensite_mouvement: 'minimal' | 'subtil' | 'expressif' | 'dramatique';
  univers_visuel: string;
  contraintes: string[];
  mot_clef_narratif: string;
}

export interface NarrativeScenario {
  arc_emotionnel: string;
  variations: {
    A: { titre: string; intention: string; fond: string; logo: string; texte: string; separateur: string };
    B: { titre: string; intention: string; fond: string; logo: string; texte: string; separateur: string };
    C: { titre: string; intention: string; fond: string; logo: string; texte: string; separateur: string };
    D: { titre: string; intention: string; fond: string; logo: string; texte: string; separateur: string };
  };
}

export interface TechnicalConfig {
  variation_a: VariationConfig;
  variation_b: VariationConfig;
  variation_c: VariationConfig;
  variation_d: VariationConfig;
  transitions: { duree: number; easing: string };
  cycle_total: number;
}

interface VariationConfig {
  fond: EffectConfig;
  logo: EffectConfig;
  texte: EffectConfig;
  separateur: EffectConfig;
  duree: number;
}

interface EffectConfig {
  effet: string;
  intensity: number;
  speed: string;
  color: string;
  params: Record<string, any>;
}

function parseJsonSafely<T>(text: string): T {
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

function buildFallbackBrief(metadata: any): CreativeBrief {
  return {
    style_detecte: 'professionnel moderne',
    references_visuelles: ['Apple', 'Linear', 'Notion'],
    ton_emotionnel: metadata?.ton || 'confiant et élégant',
    intensite_mouvement: 'subtil',
    univers_visuel: 'Espace numérique épuré avec des accents de lumière froide',
    contraintes: ['compatibilité email', 'animations CSS uniquement'],
    mot_clef_narratif: 'Précision Silencieuse',
  };
}

function buildFallbackScenario(): NarrativeScenario {
  return {
    arc_emotionnel: 'Calme → Précision → Profondeur → Prestige',
    variations: {
      A: { titre: "L'Autorité", intention: "Une pulsation dorée, constante, comme un cœur certain", fond: 'SOFT_GRADIENT', logo: 'HEARTBEAT', texte: 'MINIMAL_PULSE', separateur: 'GOLDEN_SHIMMER' },
      B: { titre: "La Précision", intention: "L'exactitude géométrique d'un esprit tranchant", fond: 'DEEP_GLOW', logo: 'CRYSTAL_BREATH', texte: 'CLEAN_FADE', separateur: 'NEON_PULSE' },
      C: { titre: "La Profondeur", intention: "Un silence habité, plein de sens et de gravité", fond: 'VOID_PULSE', logo: 'SOUL_AURA', texte: 'SUBTLE_BREATHE', separateur: 'PLASMA_DRIFT' },
      D: { titre: "Le Prestige", intention: "L'éclat discret de l'excellence accomplie", fond: 'AURORA_FLOW', logo: 'PEARL_SHIMMER', texte: 'VELVET_FADE', separateur: 'STAR_DRIFT' },
    },
  };
}

function buildFallbackTechnical(scenario: NarrativeScenario, palette: string[]): TechnicalConfig {
  const primaryColor = palette?.[1] || '#6366f1';
  const makeConfig = (v: keyof NarrativeScenario['variations'], duree: number): VariationConfig => ({
    fond: { effet: scenario.variations[v].fond, intensity: 0.4, speed: 'slow', color: palette?.[0] || '#0f0f0f', params: { opacity: 0.8 } },
    logo: { effet: scenario.variations[v].logo, intensity: 0.6, speed: 'medium', color: primaryColor, params: { radius: 40 } },
    texte: { effet: scenario.variations[v].texte, intensity: 0.3, speed: 'slow', color: palette?.[2] || '#e8e8ff', params: { blur: 0 } },
    separateur: { effet: scenario.variations[v].separateur, intensity: 0.5, speed: 'medium', color: primaryColor, params: { width: 2 } },
    duree,
  });
  return {
    variation_a: makeConfig('A', 60),
    variation_b: makeConfig('B', 60),
    variation_c: makeConfig('C', 60),
    variation_d: makeConfig('D', 60),
    transitions: { duree: 2, easing: 'cubic-bezier(0.4,0,0.2,1)' },
    cycle_total: 240,
  };
}

async function runBrain1GPT(imageBase64: string | null, metadata: any): Promise<CreativeBrief> {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log('OPENAI_API_KEY manquant — fallback Cerveau 1', 'triple-ai');
    return buildFallbackBrief(metadata);
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
  });

  const messages: any[] = [
    {
      role: 'system',
      content: `Tu es un directeur artistique expert en branding visuel de luxe. Tu analyses une signature email statique et les métadonnées de l'entreprise.

Ta mission est de produire un brief créatif précis en JSON :
{
  "style_detecte": "string",
  "references_visuelles": ["brand1", "brand2", "brand3"],
  "ton_emotionnel": "string",
  "intensite_mouvement": "minimal|subtil|expressif|dramatique",
  "univers_visuel": "string description poétique",
  "contraintes": ["contrainte1", "contrainte2"],
  "mot_clef_narratif": "string en 2-3 mots maximum"
}

Réponds UNIQUEMENT en JSON valide. Aucun texte autour.`,
    },
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: `Métadonnées entreprise: ${JSON.stringify(metadata)}` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } },
          ]
        : `Analyse cette entreprise et produis le brief créatif: ${JSON.stringify(metadata)}`,
    },
  ];

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || '';
    return parseJsonSafely<CreativeBrief>(content);
  } catch (err: any) {
    log(`Cerveau 1 erreur: ${err.message}`, 'triple-ai');
    return buildFallbackBrief(metadata);
  }
}

async function runBrain2Claude(brief: CreativeBrief): Promise<NarrativeScenario> {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log('ANTHROPIC_API_KEY manquant — fallback Cerveau 2', 'triple-ai');
    return buildFallbackScenario();
  }

  const client = new Anthropic({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined,
  });
  const effectsList = EFFECTS_LIBRARY.join(', ');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `Tu es un narrateur créatif spécialisé en motion design et storytelling visuel. Tu reçois un brief créatif et une bibliothèque d'effets disponibles.

Ta mission est de construire le scénario narratif des 4 variations de la signature vivante :

Pour chaque variation A, B, C, D tu dois définir :
- Un titre poétique (2-3 mots)
- Une intention narrative (1 phrase)
- L'effet principal pour chaque zone : fond / logo / texte / separateur
- L'arc émotionnel global A→B→C→D

Les 4 variations doivent raconter une histoire cohérente. La non-répétition doit être garantie par la complémentarité des variations entre elles.

Réponds UNIQUEMENT en JSON valide :
{
  "arc_emotionnel": "string",
  "variations": {
    "A": { "titre": "string", "intention": "string", "fond": "NOM_EFFET", "logo": "NOM_EFFET", "texte": "NOM_EFFET", "separateur": "NOM_EFFET" },
    "B": { ... },
    "C": { ... },
    "D": { ... }
  }
}`,
      messages: [
        {
          role: 'user',
          content: `Brief créatif: ${JSON.stringify(brief)}\n\nEffets disponibles (utilise UNIQUEMENT ces noms): ${effectsList}`,
        },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    return parseJsonSafely<NarrativeScenario>(content);
  } catch (err: any) {
    log(`Cerveau 2 erreur: ${err.message}`, 'triple-ai');
    return buildFallbackScenario();
  }
}

async function runBrain3Gemini(scenario: NarrativeScenario, palette: string[]): Promise<TechnicalConfig> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    log('GEMINI_API_KEY manquant — fallback Cerveau 3', 'triple-ai');
    return buildFallbackTechnical(scenario, palette);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Tu es un ingénieur créatif expert en optimisation d'effets visuels pour email. Tu reçois un scénario narratif et tu dois produire la configuration technique finale optimisée.

Pour chaque effet sélectionné tu dois définir :
- L'intensité exacte (0.0 à 1.0)
- La vitesse (slow|medium|fast)
- La couleur dominante en hex
- La durée de la variation en secondes
- Les paramètres spécifiques à l'effet

Contraintes techniques absolues :
- Zéro JavaScript dans le SVG final
- Animations CSS natives uniquement
- Largeur max 600px
- Compatibilité Gmail + Outlook garantie
- Cycle total entre 200s et 280s

Réponds UNIQUEMENT en JSON valide :
{
  "variation_a": {
    "fond": { "effet": "NOM", "intensity": 0.0, "speed": "string", "color": "#hex", "params": {} },
    "logo": { ... },
    "texte": { ... },
    "separateur": { ... },
    "duree": 60
  },
  "variation_b": { ... },
  "variation_c": { ... },
  "variation_d": { ... },
  "transitions": { "duree": 2, "easing": "cubic-bezier(0.4,0,0.2,1)" },
  "cycle_total": 240
}

Scénario narratif: ${JSON.stringify(scenario)}
Palette de couleurs: ${JSON.stringify(palette)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonSafely<TechnicalConfig>(text);
  } catch (err: any) {
    log(`Cerveau 3 erreur: ${err.message}`, 'triple-ai');
    return buildFallbackTechnical(scenario, palette);
  }
}

export async function runTripleAIPipeline(
  signatureImageBase64: string | null,
  metadata: any,
  onProgress?: (step: number, data: any) => void
): Promise<{
  brief_creatif: CreativeBrief;
  scenario_narratif: NarrativeScenario;
  configuration_technique: TechnicalConfig;
  status_pipeline: string;
}> {
  log('Démarrage pipeline 3 cerveaux IA', 'triple-ai');

  onProgress?.(1, { status: 'running', label: 'Cerveau 1 — GPT-4o Vision' });
  const brief = await runBrain1GPT(signatureImageBase64, metadata);
  log(`Cerveau 1 terminé: ${brief.mot_clef_narratif}`, 'triple-ai');
  onProgress?.(1, { status: 'done', data: brief });

  onProgress?.(2, { status: 'running', label: 'Cerveau 2 — Claude Sonnet' });
  const scenario = await runBrain2Claude(brief);
  log(`Cerveau 2 terminé: ${scenario.arc_emotionnel}`, 'triple-ai');
  onProgress?.(2, { status: 'done', data: scenario });

  onProgress?.(3, { status: 'running', label: 'Cerveau 3 — Gemini Flash' });
  const config = await runBrain3Gemini(scenario, metadata?.palette || []);
  log(`Cerveau 3 terminé: cycle ${config.cycle_total}s`, 'triple-ai');
  onProgress?.(3, { status: 'done', data: config });

  return {
    brief_creatif: brief,
    scenario_narratif: scenario,
    configuration_technique: config,
    status_pipeline: 'complete',
  };
}
