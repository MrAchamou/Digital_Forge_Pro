import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { log } from '../vite';
import { callGemini } from './gemini-wrapper';
import {
  selectCandidatesForAllZones,
  buildGeminiPromptZones,
  type VariationContext,
  type IntensiteMouvement,
  type ZoneSelection,
} from './zone-effect-selector';
import { validateHarmony, type ZoneComposition } from './harmony-validator';
import { maximizeDiversity, logFitnessReport } from '../modules/variance-engine.module';
import { moderateComposition, normalizeSecteur } from '../modules/contextual-intelligence.module';
import { optimizeComposition, analyzeSignatureContent } from '../modules/smart-optimizer.module';
import { applyVisualFocus } from '../modules/visual-focus.module';
import { applyEffectFusion } from '../modules/effect-fusion-engine.module';
import { orchestrateFusion } from '../modules/dynamic-fusion-orchestrator.module';
import { orchestrateExperience } from '../modules/experience-orchestrator.module';

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
  zone_compositions?: {
    A: ZoneComposition;
    B: ZoneComposition;
    C: ZoneComposition;
    D: ZoneComposition;
  };
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

async function runZoneSelectionForVariation(
  variation: VariationContext,
  scenario: NarrativeScenario,
  brief: CreativeBrief,
  secteur: string,
  palette: string[],
  metadata: any,
  usedEffectsInOtherVariations: Set<string>
): Promise<ZoneComposition> {
  const intensite = brief.intensite_mouvement as IntensiteMouvement;
  const noteGMB = parseFloat(metadata?.note) || 0;
  const prixGamme = metadata?.prix_gamme || '';

  const selection = selectCandidatesForAllZones(secteur, intensite, variation, {
    noteGMB,
    prixGamme,
    usedEffects: usedEffectsInOtherVariations,
  });

  const varData   = scenario.variations[variation];
  const intention = varData?.intention || `Variation ${variation}`;
  const ton       = brief.ton_emotionnel;
  const primaryColor = palette[1] || '#6366f1';

  // Liste des effets déjà sélectionnés dans les autres variations (pour garantir la diversité)
  const effets_interdits = Array.from(usedEffectsInOtherVariations);

  const prompt = buildGeminiPromptZones(
    secteur,
    ton,
    intensite,
    variation,
    intention,
    selection,
    {
      brief,
      metadata,
      arc_emotionnel: scenario.arc_emotionnel,
      metaphore: varData?.metaphore,
      note_gmb: noteGMB,
      palette,
      effets_interdits,
    }
  );

  const fallbackComposition = (): ZoneComposition => {
    // Pour les zones catégorisées (logo, nom), on prend le premier candidat de la première catégorie
    const pickCat = (cats: any): import('./harmony-validator').ZoneEffectDecision => {
      const firstCat = Object.values(cats)[0] as any[];
      const first = firstCat?.[0];
      return {
        effet_id:  first?.id || 'LOGO_VOLUME_BREATHE',
        intensity: first?.intensite_recommandee || 0.3,
        speed:     'medium',
        color:     primaryColor,
        raison:    'fallback automatique',
      };
    };
    const pickFlat = (arr: any[]): import('./harmony-validator').ZoneEffectDecision => ({
      effet_id:  arr[0]?.id || 'SEP_BREATHING_CALM',
      intensity: arr[0]?.intensite_recommandee || 0.25,
      speed:     'medium',
      color:     primaryColor,
      raison:    'fallback automatique',
    });
    return {
      logo:       pickCat(selection.logo),
      nom:        pickCat(selection.nom),
      titre:      pickFlat(selection.titre as any[]),
      contact:    pickFlat(selection.contact as any[]),
      separateur: pickFlat(selection.separateur as any[]),
      fond:       pickFlat(selection.fond as any[]),
      cta:        pickFlat(selection.cta as any[]),
    };
  };

  try {
    const text = await callGemini(prompt, { temperature: 0.25, maxTokens: 1800 });
    const rawMulti = parseJsonSafely<any>(text);

    // ─── Convertit la réponse multi-couches de Gemini en ZoneComposition ───
    const convertLayered = (zoneRaw: any, zoneName: string): import('./harmony-validator').ZoneEffectDecision => {
      if (!zoneRaw) return fallbackComposition()[zoneName as keyof ZoneComposition];

      // Zone plate (titre, contact) → objet simple avec effet_id
      if (zoneRaw.effet_id) {
        return {
          effet_id:  zoneRaw.effet_id,
          intensity: zoneRaw.intensity || 0.2,
          speed:     zoneRaw.speed || 'medium',
          color:     (zoneRaw.color && zoneRaw.color !== '#000000') ? zoneRaw.color : primaryColor,
          raison:    zoneRaw.raison,
        };
      }

      // Zone multi-couches (logo, nom, separateur, fond, cta)
      const layers: import('./harmony-validator').EffectLayer[] = [];
      for (const [catName, catDecision] of Object.entries(zoneRaw) as [string, any][]) {
        if (!catDecision?.effet_id || catDecision.effet_id === 'null') continue;
        if (effets_interdits.includes(catDecision.effet_id)) {
          // Si interdit, chercher alternative dans la sélection
          const zoneSel = selection[zoneName as keyof ZoneSelection];
          const alternatives = Array.isArray(zoneSel)
            ? zoneSel
            : (zoneSel as any)[catName] || [];
          const alt = alternatives.find((c: any) => !effets_interdits.includes(c.id));
          if (alt) {
            log(`Cerveau 3 [${variation}/${zoneName}/${catName}] → ${alt.id} (diversité)`, 'triple-ai');
            layers.push({ effet_id: alt.id, category: catName, intensity: alt.intensite_recommandee, speed: catDecision.speed || 'medium', color: primaryColor, raison: 'Diversité inter-variations' });
          }
          continue;
        }
        layers.push({
          effet_id:  catDecision.effet_id,
          category:  catName,
          intensity: catDecision.intensity || 0.25,
          speed:     catDecision.speed || 'medium',
          color:     (catDecision.color && catDecision.color !== '#000000') ? catDecision.color : primaryColor,
          raison:    catDecision.raison,
        });
      }

      if (layers.length === 0) return fallbackComposition()[zoneName as keyof ZoneComposition];

      // La couche primaire (dimension pour logo, lumiere pour nom, primary pour flat)
      const primaryLayer = layers.find(l => l.category === 'dimension' || l.category === 'primary' || l.category === 'lumiere') || layers[0];

      return {
        effet_id:  primaryLayer.effet_id,
        intensity: primaryLayer.intensity,
        speed:     primaryLayer.speed,
        color:     primaryLayer.color,
        raison:    primaryLayer.raison,
        layers,  // ← toutes les couches pour le rendu multi-layer SVG
      };
    };

    const raw: ZoneComposition = {
      logo:       convertLayered(rawMulti.logo,       'logo'),
      nom:        convertLayered(rawMulti.nom,        'nom'),
      titre:      convertLayered(rawMulti.titre,      'titre'),
      contact:    convertLayered(rawMulti.contact,    'contact'),
      separateur: convertLayered(rawMulti.separateur, 'separateur'),
      fond:       convertLayered(rawMulti.fond,       'fond'),
      cta:        convertLayered(rawMulti.cta,        'cta'),
    };

    const validated = validateHarmony(raw, palette);
    if (validated.corrections.length > 0) {
      log(`Cerveau 3 zones ${variation} — ${validated.corrections.length} corrections harmoniques`, 'triple-ai');
    }

    const logoLayers = validated.config.logo.layers?.map(l => l.effet_id).join('+') || validated.config.logo.effet_id;
    const nomLayers  = validated.config.nom.layers?.map(l => l.effet_id).join('+') || validated.config.nom.effet_id;
    log(`✓ Variation ${variation} — Logo:[${logoLayers}] | Nom:[${nomLayers}] | Harmonie:${validated.score_harmonie}`, 'triple-ai');
    return validated.config;
  } catch (err: any) {
    log(`Cerveau 3 zone ${variation} erreur: ${err.message} — fallback`, 'triple-ai');
    const fb = fallbackComposition();
    return validateHarmony(fb, palette).config;
  }
}

/**
 * 🔧 Pipeline Priorité 2 : Modération → Optimisation → Focus visuel
 * Appliqué à chaque variation juste après la sélection Gemini.
 */
function applyPriority2Pipeline(
  comp:      ZoneComposition,
  variation: 'A' | 'B' | 'C' | 'D',
  secteur:   string,
  metadata:  any,
  brief:     CreativeBrief
): ZoneComposition {
  const intensite = brief.intensite_mouvement as any ?? 'subtil';

  // 1. Modération contextuelle — écrêtage selon secteur + complexité
  const moderated = moderateComposition(comp, secteur, variation, intensite);

  // 2. Optimisation SmartOptimizer — calibration des intensités/vitesses
  const sigContent = analyzeSignatureContent(metadata, secteur);
  const optimized  = optimizeComposition(moderated.composition, variation, secteur, { ...sigContent, intensite });

  // 3. Focus visuel — guide l'œil logo → nom → CTA
  const focused = applyVisualFocus(optimized.composition, variation);

  return focused.composition;
}

/**
 * 🎛️ Pipeline Priorité 3 : Fusion des effets → Orchestration → Arc d'expérience
 * Appliqué à chaque variation après le VarianceEngine.
 * Rend les effets hybrides, orchestrés et narrativement engageants.
 */
function applyPriority3Pipeline(
  comp:      ZoneComposition,
  variation: 'A' | 'B' | 'C' | 'D',
  cycleMs:   number = 8000
): ZoneComposition {
  // 1. EffectFusionEngine — recettes de mélange hybrides entre effets
  const fusionResult = applyEffectFusion(comp, variation);

  // 2. DynamicFusionOrchestrator — blueprint d'orchestration cross-zones
  const orchestratorResult = orchestrateFusion(comp, fusionResult, variation);

  // 3. ExperienceOrchestrator — arc émotionnel intro→climax→outro
  const experienceResult = orchestrateExperience(orchestratorResult, variation, cycleMs);

  return experienceResult.composition;
}

async function runBrain3Gemini(scenario: NarrativeScenario, brief: CreativeBrief, palette: string[], secteur: string, metadata: any): Promise<TechnicalConfig> {
  log('Cerveau 3 — Sélection zones par variation (séquentiel pour garantir diversité)...', 'triple-ai');

  // Traitement séquentiel A→B→C→D pour accumuler les effets déjà utilisés
  // et garantir une diversité totale entre les 4 variations
  const usedEffects = new Set<string>();

  const extractUsedEffects = (comp: ZoneComposition) => {
    Object.values(comp).forEach(zone => {
      if (zone?.effet_id) usedEffects.add(zone.effet_id);
      // Extraire aussi toutes les couches secondaires pour garantir diversité totale
      zone?.layers?.forEach(layer => {
        if (layer?.effet_id) usedEffects.add(layer.effet_id);
      });
    });
  };

  log('Cerveau 3 — Variation A...', 'triple-ai');
  const rawA  = await runZoneSelectionForVariation('A', scenario, brief, secteur, palette, metadata, new Set(usedEffects));
  const compA = applyPriority2Pipeline(rawA, 'A', secteur, metadata, brief);
  extractUsedEffects(compA);

  log('Cerveau 3 — Variation B...', 'triple-ai');
  const rawB  = await runZoneSelectionForVariation('B', scenario, brief, secteur, palette, metadata, new Set(usedEffects));
  const compB = applyPriority2Pipeline(rawB, 'B', secteur, metadata, brief);
  extractUsedEffects(compB);

  log('Cerveau 3 — Variation C...', 'triple-ai');
  const rawC  = await runZoneSelectionForVariation('C', scenario, brief, secteur, palette, metadata, new Set(usedEffects));
  const compC = applyPriority2Pipeline(rawC, 'C', secteur, metadata, brief);
  extractUsedEffects(compC);

  log('Cerveau 3 — Variation D...', 'triple-ai');
  const rawD  = await runZoneSelectionForVariation('D', scenario, brief, secteur, palette, metadata, new Set(usedEffects));
  const compD = applyPriority2Pipeline(rawD, 'D', secteur, metadata, brief);

  log(`✓ Cerveau 3 + P2 complet — A:${compA.logo.effet_id} | B:${compB.logo.effet_id} | C:${compC.logo.effet_id} | D:${compD.logo.effet_id}`, 'triple-ai');
  log(`  Intensités logo — A:${compA.logo.intensity?.toFixed(2)} | B:${compB.logo.intensity?.toFixed(2)} | C:${compC.logo.intensity?.toFixed(2)} | D:${compD.logo.intensity?.toFixed(2)}`, 'triple-ai');

  // ── VarianceEngine : maximisation génétique de la diversité A/B/C/D ───────
  const diversityReport = maximizeDiversity({ A: compA, B: compB, C: compC, D: compD });
  const optimizedComps  = diversityReport.compositions;
  log(`🧬 Variance Engine — Diversité: ${(diversityReport.overall_diversity * 100).toFixed(1)}% | ${logFitnessReport(optimizedComps)} | Mutations: ${diversityReport.mutations_applied}`, 'triple-ai');

  // ── Priorité 3 : Fusion + Orchestration + Arc d'expérience ───────────────
  const cycleMs = (metadata?.cycle_total ?? 8) * 1000;
  const p3A = applyPriority3Pipeline(optimizedComps.A, 'A', cycleMs);
  const p3B = applyPriority3Pipeline(optimizedComps.B, 'B', cycleMs);
  const p3C = applyPriority3Pipeline(optimizedComps.C, 'C', cycleMs);
  const p3D = applyPriority3Pipeline(optimizedComps.D, 'D', cycleMs);
  log(`🎛️ P3 complet — Fusion+Orchestration+Expérience appliquées sur A/B/C/D`, 'triple-ai');

  const baseConfig = buildFallbackTechnical(scenario, palette);

  return {
    ...baseConfig,
    optimisations_email: [
      'CSS animations uniquement — zéro JS',
      'Chirurgie visuelle par zones — logique métier secteur',
      'Harmony validator — 5 règles appliquées',
      `Variance Engine — Diversité génétique: ${(diversityReport.overall_diversity * 100).toFixed(1)}%`,
      'Timing Master — Durées φ et Fibonacci actives',
      'Color Harmony Engine — Palettes enrichies par zone',
      'Effect Fusion Engine — Recettes hybrides cross-effets',
      'Dynamic Fusion Orchestrator — Blueprint cross-zones Standard/Pro/Ultimate',
      'Experience Orchestrator — Arc émotionnel Intro→Climax→Outro',
    ],
    notes_techniques: `Zone+Variance+P3-Fusion+Orchestration+Experience | Secteur:${secteur} | A:${p3A.logo.effet_id} B:${p3B.logo.effet_id} C:${p3C.logo.effet_id} D:${p3D.logo.effet_id}`,
    zone_compositions: { A: p3A, B: p3B, C: p3C, D: p3D },
  };
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

  onProgress?.(3, { status: 'running', label: 'Cerveau 3 — Gemini Flash : Chirurgie visuelle par zones' });
  const config = await runBrain3Gemini(scenario, brief, metadata?.palette || [], metadata?.secteur || '', metadata);
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
