import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { log } from '../vite';
import { callGemini } from './gemini-wrapper';

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
  analyse_logo: string;
  psychologie_couleurs: string;
  personnalite_marque: string[];
  cible_audience: string;
  differentiateur: string;
}

export interface NarrativeScenario {
  arc_emotionnel: string;
  fil_conducteur: string;
  variations: {
    A: VariationNarrative;
    B: VariationNarrative;
    C: VariationNarrative;
    D: VariationNarrative;
  };
  note_du_directeur: string;
}

interface VariationNarrative {
  titre: string;
  sous_titre: string;
  intention: string;
  metaphore: string;
  fond: string;
  logo: string;
  texte: string;
  separateur: string;
  emotion_dominante: string;
  moment_cle: string;
}

export interface TechnicalConfig {
  variation_a: VariationConfig;
  variation_b: VariationConfig;
  variation_c: VariationConfig;
  variation_d: VariationConfig;
  transitions: TransitionConfig;
  cycle_total: number;
  optimisations_email: string[];
  notes_techniques: string;
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

interface TransitionConfig {
  duree: number;
  easing: string;
  type: string;
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
    analyse_logo: 'Logo professionnel sobre',
    psychologie_couleurs: 'Palette neutre évoquant la confiance et la modernité',
    personnalite_marque: ['fiable', 'moderne', 'professionnel'],
    cible_audience: 'Professionnels et entreprises',
    differentiateur: 'Excellence et précision',
  };
}

function buildFallbackScenario(): NarrativeScenario {
  return {
    arc_emotionnel: 'Calme → Précision → Profondeur → Prestige',
    fil_conducteur: 'Une marque qui maîtrise son art dans le silence de l\'excellence',
    variations: {
      A: {
        titre: "L'Autorité",
        sous_titre: 'Premier regard',
        intention: 'Une pulsation dorée, constante, comme un cœur certain',
        metaphore: 'Le battement régulier d\'un horloger suisse',
        fond: 'SOFT_GRADIENT', logo: 'HEARTBEAT', texte: 'MINIMAL_PULSE', separateur: 'GOLDEN_SHIMMER',
        emotion_dominante: 'Confiance',
        moment_cle: 'L\'ouverture de l\'email',
      },
      B: {
        titre: 'La Précision',
        sous_titre: 'La maîtrise',
        intention: 'L\'exactitude géométrique d\'un esprit tranchant',
        metaphore: 'Un scalpel de lumière dans la nuit numérique',
        fond: 'DEEP_GLOW', logo: 'CRYSTAL_BREATH', texte: 'CLEAN_FADE', separateur: 'NEON_PULSE',
        emotion_dominante: 'Admiration',
        moment_cle: 'La lecture du nom',
      },
      C: {
        titre: 'La Profondeur',
        sous_titre: 'L\'âme',
        intention: 'Un silence habité, plein de sens et de gravité',
        metaphore: 'Les eaux profondes d\'un lac de montagne en hiver',
        fond: 'VOID_PULSE', logo: 'SOUL_AURA', texte: 'SUBTLE_BREATHE', separateur: 'PLASMA_DRIFT',
        emotion_dominante: 'Mystère',
        moment_cle: 'La contemplation',
      },
      D: {
        titre: 'Le Prestige',
        sous_titre: 'L\'apothéose',
        intention: 'L\'éclat discret de l\'excellence accomplie',
        metaphore: 'Un diamant qui capte toute la lumière de la pièce',
        fond: 'AURORA_FLOW', logo: 'PEARL_SHIMMER', texte: 'VELVET_FADE', separateur: 'STAR_DRIFT',
        emotion_dominante: 'Désir',
        moment_cle: 'L\'appel à l\'action',
      },
    },
    note_du_directeur: 'Chaque variation amplifie la précédente comme les mouvements d\'une symphonie',
  };
}

function buildFallbackTechnical(scenario: NarrativeScenario, palette: string[]): TechnicalConfig {
  const primaryColor = palette?.[1] || '#6366f1';
  const bgColor = palette?.[0] || '#0f0f0f';
  const accentColor = palette?.[2] || '#e8e8ff';

  const makeConfig = (v: keyof NarrativeScenario['variations'], duree: number): VariationConfig => ({
    fond: { effet: scenario.variations[v].fond, intensity: 0.4, speed: 'slow', color: bgColor, params: { opacity: 0.8, blur: 0, scale: 1.02 } },
    logo: { effet: scenario.variations[v].logo, intensity: 0.6, speed: 'medium', color: primaryColor, params: { radius: 40, glow: 0.3, pulse_scale: 1.05 } },
    texte: { effet: scenario.variations[v].texte, intensity: 0.3, speed: 'slow', color: accentColor, params: { blur: 0, letter_spacing: 0.02, opacity_min: 0.85 } },
    separateur: { effet: scenario.variations[v].separateur, intensity: 0.5, speed: 'medium', color: primaryColor, params: { width: 2, glow_spread: 4 } },
    duree,
  });

  return {
    variation_a: makeConfig('A', 60),
    variation_b: makeConfig('B', 60),
    variation_c: makeConfig('C', 60),
    variation_d: makeConfig('D', 60),
    transitions: { duree: 2, easing: 'cubic-bezier(0.4,0,0.2,1)', type: 'cross-fade' },
    cycle_total: 248,
    optimisations_email: ['CSS animations seulement', 'Pas de JS', 'Max 600px largeur'],
    notes_techniques: 'Configuration fallback — pipeline IA non disponible',
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

  const entrepriseContext = [
    metadata?.entreprise && `Nom: ${metadata.entreprise}`,
    metadata?.secteur && `Secteur: ${metadata.secteur}`,
    metadata?.description && `Description: ${metadata.description}`,
    metadata?.ton && `Ton de marque: ${metadata.ton}`,
    metadata?.note && `Note GMB: ${metadata.note}/5 (${metadata.avis || 0} avis)`,
    metadata?.adresse && `Localisation: ${metadata.adresse}, ${metadata.ville}`,
    metadata?.mots_cles?.length && `Mots-clés: ${metadata.mots_cles.join(', ')}`,
    metadata?.prix_gamme && `Gamme de prix: ${metadata.prix_gamme}`,
    metadata?.slogan && `Slogan: ${metadata.slogan}`,
    metadata?.annee_fondation && `Fondée en: ${metadata.annee_fondation}`,
    metadata?.reseaux_sociaux && Object.keys(metadata.reseaux_sociaux).length > 0
      && `Réseaux sociaux: ${Object.keys(metadata.reseaux_sociaux).join(', ')}`,
    metadata?.palette?.length && `Palette couleurs: ${metadata.palette.join(', ')}`,
    metadata?.logo_url && `Logo disponible: ${metadata.logo_url}`,
  ].filter(Boolean).join('\n');

  const messages: any[] = [
    {
      role: 'system',
      content: `Tu es le Directeur Artistique Principal d'une agence de branding de luxe internationale. Tu as créé les identités visuelles de marques comme Hermès, Apple, Rolex et Balenciaga. Ton regard est chirurgical : tu décèles en une seconde l'essence profonde d'une marque et tu la transformes en langage visuel animé d'une précision absolue.

Ta mission aujourd'hui : analyser cette entreprise dans ses moindres détails et produire un brief créatif qui guidera la génération de sa signature email vivante — une œuvre qui devra transmettre son identité en quelques secondes.

Tu dois analyser :
1. **L'identité profonde** : Quelle est l'âme de cette marque ? Quelles émotions doit-elle déclencher ?
2. **Le positionnement visuel** : À quelles grandes marques ressemble-t-elle ? Quel univers graphique lui appartient ?
3. **La psychologie des couleurs** : Que disent ses couleurs de sa personnalité et de ses ambitions ?
4. **Son audience** : Qui reçoit ces emails ? Quelles sont leurs attentes implicites ?
5. **Son différenciateur** : Qu'est-ce qui la rend unique dans son secteur ?
6. **Le logo** (si disponible en image) : Forme, style, symbolique, poids visuel, complémentarité avec le mouvement.

Réponds UNIQUEMENT en JSON valide, aucun texte autour :
{
  "style_detecte": "description précise du style visuel en 5-10 mots",
  "references_visuelles": ["marque1", "marque2", "marque3"],
  "ton_emotionnel": "description du registre émotionnel en 5-8 mots",
  "intensite_mouvement": "minimal|subtil|expressif|dramatique",
  "univers_visuel": "description poétique et précise de l'univers visuel en 2-3 phrases",
  "contraintes": ["contrainte1 spécifique au secteur", "contrainte2", "contrainte3"],
  "mot_clef_narratif": "2-3 mots qui résument l'essence",
  "analyse_logo": "analyse du logo en 1-2 phrases : forme, symbolique, énergie visuelle",
  "psychologie_couleurs": "analyse des couleurs en 1-2 phrases : ce qu'elles disent de la marque",
  "personnalite_marque": ["trait1", "trait2", "trait3", "trait4"],
  "cible_audience": "description de l'audience cible en 1 phrase",
  "differentiateur": "ce qui rend cette marque unique en 1 phrase"
}`,
    },
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: `Analyse complète de l'entreprise :\n${entrepriseContext}` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}`, detail: 'high' } },
          ]
        : `Analyse complète de l'entreprise :\n${entrepriseContext}`,
    },
  ];

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1200,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const brief = parseJsonSafely<CreativeBrief>(content);
    log(`Cerveau 1 (GPT-4o) — Style: ${brief.style_detecte} | Mot-clef: ${brief.mot_clef_narratif}`, 'triple-ai');
    return brief;
  } catch (err: any) {
    log(`Cerveau 1 erreur: ${err.message}`, 'triple-ai');
    return buildFallbackBrief(metadata);
  }
}

async function runBrain2Claude(brief: CreativeBrief, metadata: any): Promise<NarrativeScenario> {
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

  const systemPrompt = `Tu es le Directeur Narratif et Poète Visuel d'un studio de motion design d'exception. Ton travail est de transformer des briefs créatifs en scénarios narratifs d'une profondeur et d'une cohérence artistique absolues. Tu as signé des signatures animées pour des marques qui font l'histoire.

Ton rôle dans cette pipeline : tu reçois le brief du Directeur Artistique (Cerveau 1) et tu construis la DRAMATURGIE COMPLÈTE des 4 variations de la signature vivante. Chaque variation est un chapitre d'une même histoire. Ensemble, elles forment une symphonie visuelle.

Principes sacrés de ta création :
1. **L'arc émotionnel A→B→C→D** : Chaque variation doit progresser comme les actes d'une pièce de théâtre. L'arc doit être irrésistible et cohérent.
2. **Le fil conducteur** : Une métaphore centrale relie les 4 variations. Elle doit être profonde et ancrée dans l'univers de la marque.
3. **La non-répétition** : Les 4 effets par zone (fond/logo/texte/separateur) doivent être tous différents. Aucune redondance tolérée.
4. **La complémentarité** : Chaque variation révèle un aspect que les autres ne montrent pas. Ensemble elles sont complètes.
5. **La métaphore** : Chaque variation doit avoir sa propre métaphore poétique, ancrée dans le réel et dans le monde de la marque.

Tu dois IMPÉRATIVEMENT choisir des effets parmi cette liste : ${effectsList}

Réponds UNIQUEMENT en JSON valide :
{
  "arc_emotionnel": "description de l'arc A→B→C→D en 1 phrase évocatrice",
  "fil_conducteur": "la métaphore centrale en 1-2 phrases",
  "variations": {
    "A": {
      "titre": "2-3 mots poétiques",
      "sous_titre": "1-3 mots complémentaires",
      "intention": "l'intention narrative de cette variation en 1 phrase forte",
      "metaphore": "la métaphore spécifique à cette variation en 1 phrase",
      "fond": "NOM_EFFET_EXACT",
      "logo": "NOM_EFFET_EXACT",
      "texte": "NOM_EFFET_EXACT",
      "separateur": "NOM_EFFET_EXACT",
      "emotion_dominante": "1 mot",
      "moment_cle": "le moment de la lecture de l'email que capture cette variation"
    },
    "B": { ... },
    "C": { ... },
    "D": { ... }
  },
  "note_du_directeur": "ta note d'intention en tant que directeur en 1-2 phrases"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Brief créatif du Directeur Artistique :\n${JSON.stringify(brief, null, 2)}\n\nContexte entreprise complémentaire :\nEntreprise: ${metadata?.entreprise || 'Inconnue'}\nSecteur: ${metadata?.secteur || 'Inconnu'}\nTon: ${metadata?.ton || 'Professionnel'}\nPalette: ${JSON.stringify(metadata?.palette || [])}\n\nConstruit le scénario narratif des 4 variations. Rappel effets disponibles: ${effectsList}`,
        },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const scenario = parseJsonSafely<NarrativeScenario>(content);
    log(`Cerveau 2 (Claude) — Arc: ${scenario.arc_emotionnel?.slice(0, 60)}...`, 'triple-ai');
    return scenario;
  } catch (err: any) {
    log(`Cerveau 2 erreur: ${err.message}`, 'triple-ai');
    return buildFallbackScenario();
  }
}

async function runBrain3Gemini(scenario: NarrativeScenario, brief: CreativeBrief, palette: string[]): Promise<TechnicalConfig> {
  const bgColor = palette?.[0] || '#0f0f0f';
  const primaryColor = palette?.[1] || '#6366f1';
  const accentColor = palette?.[2] || '#e8e8ff';

  const prompt = `Tu es l'Ingénieur Créatif Senior et expert en animation SVG/CSS pour email. Tu maîtrises parfaitement les contraintes techniques des clients email (Gmail, Outlook, Apple Mail, Yahoo) et tu sais transformer des intentions narratives en configurations d'effets mathématiquement parfaites.

Tu reçois le scénario narratif du Directeur Narratif et le brief du Directeur Artistique. Ton rôle : traduire chaque intention créative en valeurs techniques précises et optimisées.

**Contraintes techniques absolues (non négociables) :**
- Zéro JavaScript dans le SVG final
- CSS animations et SVG SMIL uniquement
- Largeur maximum 600px
- Compatibilité Gmail + Outlook 2019+ garantie
- Cycle total entre 200s et 280s (optimal 240-260s pour engagement maximal)
- Intensités calibrées pour ne jamais fatiguer l'œil sur un écran email
- Performance : aucun effet ne doit dépasser 60fps équivalent en CSS

**Principes de calibration :**
- Fond : intensity 0.2-0.5 (doit rester discret, support du contenu)
- Logo : intensity 0.4-0.8 (point focal principal, peut être expressif)
- Texte : intensity 0.1-0.4 (lisibilité primordiale, mouvement subtil)
- Séparateur : intensity 0.3-0.7 (lien visuel, rythme de lecture)

**Palette à utiliser :**
- Fond/Background: ${bgColor}
- Primaire/Accent: ${primaryColor}
- Secondaire/Texte: ${accentColor}

Pour chaque variation, définis des paramètres SPÉCIFIQUES à l'effet nommé (par ex: pour HEARTBEAT → {bpm: 72, amplitude: 0.08}, pour NEON_PULSE → {frequency: 0.5, glow_radius: 8}).

Réponds UNIQUEMENT en JSON valide :
{
  "variation_a": {
    "fond": { "effet": "NOM_EXACT", "intensity": 0.0-1.0, "speed": "slow|medium|fast", "color": "#hex", "params": { "parametres_specifiques": "valeurs" } },
    "logo": { ... },
    "texte": { ... },
    "separateur": { ... },
    "duree": 55-65
  },
  "variation_b": { ... },
  "variation_c": { ... },
  "variation_d": { ... },
  "transitions": {
    "duree": 1.5-3.0,
    "easing": "cubic-bezier(x,x,x,x)",
    "type": "cross-fade|slide|dissolve"
  },
  "cycle_total": 200-280,
  "optimisations_email": ["optimisation1 spécifique", "optimisation2", "optimisation3"],
  "notes_techniques": "tes remarques techniques importantes en 1-2 phrases"
}

Scénario narratif à traduire :
${JSON.stringify(scenario, null, 2)}

Brief créatif de référence :
Intensité mouvement souhaitée: ${brief.intensite_mouvement}
Univers visuel: ${brief.univers_visuel}
Contraintes: ${JSON.stringify(brief.contraintes)}`;

  try {
    const text = await callGemini(prompt, { temperature: 0.4, maxTokens: 2500 });
    const config = parseJsonSafely<TechnicalConfig>(text);
    log(`Cerveau 3 (Gemini) — Cycle: ${config.cycle_total}s | Optimisations: ${config.optimisations_email?.length || 0}`, 'triple-ai');
    return config;
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
  log('=== Démarrage pipeline 3 cerveaux IA ===', 'triple-ai');
  log(`Entreprise: ${metadata?.entreprise || 'Inconnue'} | Secteur: ${metadata?.secteur || 'Inconnu'}`, 'triple-ai');

  onProgress?.(1, { status: 'running', label: 'Cerveau 1 — GPT-4o Vision : Analyse artistique' });
  const brief = await runBrain1GPT(signatureImageBase64, metadata);
  log(`✓ Cerveau 1 — ${brief.mot_clef_narratif} | ${brief.intensite_mouvement}`, 'triple-ai');
  onProgress?.(1, { status: 'done', data: brief });

  onProgress?.(2, { status: 'running', label: 'Cerveau 2 — Claude Opus : Construction narrative' });
  const scenario = await runBrain2Claude(brief, metadata);
  log(`✓ Cerveau 2 — Arc: ${scenario.arc_emotionnel?.slice(0, 50)}`, 'triple-ai');
  onProgress?.(2, { status: 'done', data: scenario });

  onProgress?.(3, { status: 'running', label: 'Cerveau 3 — Gemini Pro : Optimisation technique' });
  const config = await runBrain3Gemini(scenario, brief, metadata?.palette || []);
  log(`✓ Cerveau 3 — Cycle ${config.cycle_total}s | ${config.optimisations_email?.length || 0} optimisations`, 'triple-ai');
  onProgress?.(3, { status: 'done', data: config });

  log('=== Pipeline 3 cerveaux complète ===', 'triple-ai');

  return {
    brief_creatif: brief,
    scenario_narratif: scenario,
    configuration_technique: config,
    status_pipeline: 'complete',
  };
}
