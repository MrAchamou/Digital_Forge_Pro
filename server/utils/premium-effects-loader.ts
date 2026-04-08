import fs from 'fs/promises';
import path from 'path';
import { storage } from '../storage';
import type { InsertEffect } from '@shared/schema';

const PREMIUM_EFFECTS_DIR = path.join(process.cwd(), 'Premium_Effect-main');

// ─── Maps statiques ───────────────────────────────────────────────────────────

const TYPE_MAP: Record<string, string> = {
  'BREATHING': 'ORGANIC', 'BREATHING OBJECT': 'ORGANIC', 'HEARTBEAT': 'ORGANIC', 'SOUL AURA': 'ORGANIC',
  'NEON GLOW': 'LIGHTING', 'HOLOGRAM': 'LIGHTING', 'ELECTRIC FORM': 'LIGHTING',
  'ELECTRIC HOVER': 'LIGHTING', 'ENERGY FLOW': 'LIGHTING', 'ENERGY IONIZE': 'LIGHTING', 'SPARKLE AURA': 'LIGHTING',
  'CRYSTAL GROW': 'CRYSTALLINE', 'CRYSTAL SHATTER': 'CRYSTALLINE', 'ICE FREEZE': 'CRYSTALLINE',
  'PRISM SPLIT': 'CRYSTALLINE', 'RAINBOW SHIFT': 'CRYSTALLINE',
  'LIQUID MORPH': 'MORPHING', 'LIQUID POUR': 'MORPHING', 'LIQUID STATE': 'MORPHING',
  'WAVE DISSOLVE': 'MORPHING', 'WAVE DISTORTION': 'MORPHING', 'WAVE SURF': 'MORPHING',
  'MORPH 3D': 'MORPHING', "MÉTAMORPHOSES D'IMAGES": 'MORPHING', 'MIRROR REALITY': 'MORPHING',
  'PARTICLE BUILD': 'PARTICLE', 'PARTICLE DISSOLVE': 'PARTICLE',
  'STAR DUST FORM': 'PARTICLE', 'STAR EXPLOSION': 'PARTICLE', 'SMOKE DISPERSE': 'PARTICLE', 'COSMIC DUST': 'PARTICLE',
  'GLITCH SPAWN': 'DIGITAL', 'REALITY GLITCH': 'DIGITAL', 'DIMENSION SHIFT': 'DIGITAL',
  'QUANTUM PHASE': 'DIGITAL', 'QUANTUM SPLIT': 'DIGITAL', 'DNA BUILD': 'DIGITAL',
  'NEURAL PULSE': 'DIGITAL', 'TYPEWRITER': 'DIGITAL', 'SHADOW CLONE': 'DIGITAL',
  'FIRE CONSUME': 'FIRE', 'FIRE WRITE': 'FIRE',
  'TORNADO ABSORB': 'ATMOSPHERIC', 'TORNADO SPIN': 'ATMOSPHERIC', 'TORNADO TWIST': 'ATMOSPHERIC',
  'MAGNETIC FIELD': 'PHYSICS', 'MAGNETIC PULL': 'PHYSICS',
  'GRAVITY REVERSE': 'PHYSICS', 'FLOAT DANCE': 'PHYSICS', 'FLOAT PHYSICS': 'PHYSICS',
  'PENDULUM SWING': 'PHYSICS', 'ORBIT DANCE': 'PHYSICS', 'GYROSCOPE SPIN': 'PHYSICS',
  'ECHO MULTIPLE': 'TEMPORAL', 'ECHO TRAIL': 'TEMPORAL', 'TIME ECHO': 'TEMPORAL', 'TIME REWIND': 'TEMPORAL',
  'PHASE THROUGH': 'ENERGY', 'PLASMA STATE': 'ENERGY',
  'STELLAR DRIFT': 'COSMIC', 'ROTATION 3D': 'TRANSFORMATION', 'FADE LAYERS': 'TRANSITION',
};

const CATEGORY_MAP: Record<string, string> = {
  'BREATHING': 'VIVANT', 'BREATHING OBJECT': 'VIVANT', 'HEARTBEAT': 'VIVANT', 'SOUL AURA': 'VIVANT',
  'NEON GLOW': 'LUMINEUX', 'SPARKLE AURA': 'LUMINEUX', 'ENERGY FLOW': 'LUMINEUX',
  'ENERGY IONIZE': 'LUMINEUX', 'HOLOGRAM': 'LUMINEUX',
  'ELECTRIC FORM': 'ELECTRIQUE', 'ELECTRIC HOVER': 'ELECTRIQUE', 'MAGNETIC FIELD': 'ELECTRIQUE',
  'MAGNETIC PULL': 'ELECTRIQUE', 'NEURAL PULSE': 'ELECTRIQUE',
  'CRYSTAL GROW': 'CRISTAL', 'CRYSTAL SHATTER': 'CRISTAL', 'ICE FREEZE': 'CRISTAL', 'PRISM SPLIT': 'CRISTAL',
  'RAINBOW SHIFT': 'CRISTAL',
  'LIQUID MORPH': 'LIQUIDE', 'LIQUID POUR': 'LIQUIDE', 'LIQUID STATE': 'LIQUIDE',
  'WAVE DISSOLVE': 'LIQUIDE', 'WAVE DISTORTION': 'LIQUIDE', 'WAVE SURF': 'LIQUIDE',
  'MORPH 3D': 'MORPHING', "MÉTAMORPHOSES D'IMAGES": 'MORPHING', 'MIRROR REALITY': 'MORPHING',
  'PARTICLE BUILD': 'PARTICULE', 'PARTICLE DISSOLVE': 'PARTICULE',
  'STAR DUST FORM': 'COSMIQUE', 'STAR EXPLOSION': 'COSMIQUE', 'STELLAR DRIFT': 'COSMIQUE',
  'SMOKE DISPERSE': 'ATMOSPHERIQUE', 'TORNADO ABSORB': 'ATMOSPHERIQUE',
  'TORNADO SPIN': 'ATMOSPHERIQUE', 'TORNADO TWIST': 'ATMOSPHERIQUE',
  'GLITCH SPAWN': 'DIGITAL', 'REALITY GLITCH': 'DIGITAL', 'DIMENSION SHIFT': 'DIGITAL',
  'QUANTUM PHASE': 'DIGITAL', 'QUANTUM SPLIT': 'DIGITAL', 'DNA BUILD': 'DIGITAL',
  'TYPEWRITER': 'DIGITAL', 'SHADOW CLONE': 'DIGITAL',
  'FIRE CONSUME': 'FEU', 'FIRE WRITE': 'FEU',
  'GRAVITY REVERSE': 'PHYSIQUE', 'FLOAT DANCE': 'PHYSIQUE', 'FLOAT PHYSICS': 'PHYSIQUE',
  'PENDULUM SWING': 'PHYSIQUE', 'ORBIT DANCE': 'PHYSIQUE', 'GYROSCOPE SPIN': 'PHYSIQUE',
  'ECHO MULTIPLE': 'TEMPOREL', 'ECHO TRAIL': 'TEMPOREL', 'TIME ECHO': 'TEMPOREL', 'TIME REWIND': 'TEMPOREL',
  'PHASE THROUGH': 'ENERGIE', 'PLASMA STATE': 'ENERGIE',
  'ROTATION 3D': 'TRANSFORMATION', 'FADE LAYERS': 'TRANSITION',
};

// CSS keyframes générés dans le moteur de rendu de signatures, indexés par folderName
const CSS_KEYFRAME_MAP: Record<string, string[]> = {
  'BREATHING':        ['sigBreathing'],
  'BREATHING OBJECT': ['sigBreathing'],
  'HEARTBEAT':        ['sigHeartbeat'],
  'SOUL AURA':        ['sigSoulAura'],
  'NEON GLOW':        ['sigNeonGlow', 'sigNeonEcho'],
  'HOLOGRAM':         ['sigCrystalHolo'],
  'ELECTRIC FORM':    ['sigElectricForm'],
  'ELECTRIC HOVER':   ['sigElectricHover'],
  'ENERGY FLOW':      ['sigEnergyFlow'],
  'ENERGY IONIZE':    ['sigEnergyIonize'],
  'SPARKLE AURA':     ['sigSparkleLoop', 'sigStarExplosion'],
  'CRYSTAL GROW':     ['sigCrystalHolo'],
  'ICE FREEZE':       ['sigIceFreeze'],
  'PRISM SPLIT':      ['sigPrismSplit'],
  'LIQUID MORPH':     ['sigLiquidMorph'],
  'WAVE DISSOLVE':    ['sigFadeWave', 'sigWaveDissolve'],
  'WAVE DISTORTION':  ['sigWaveDistort'],
  'WAVE SURF':        ['sigWaveSurf'],
  'PARTICLE BUILD':   ['sigParticleBuild'],
  'STAR DUST FORM':   ['sigStarDust'],
  'STAR EXPLOSION':   ['sigStarExplosion'],
  'STELLAR DRIFT':    ['sigStellarDrift', 'sigStellarFloat'],
  'GLITCH SPAWN':     ['sigGlitchIn', 'sigGlitch'],
  'REALITY GLITCH':   ['sigRealityGlitch'],
  'DIMENSION SHIFT':  ['sigDimensionShift'],
  'QUANTUM PHASE':    ['sigQuantumPhase'],
  'DNA BUILD':        ['sigDnaBuild'],
  'NEURAL PULSE':     ['sigNeuralPulse'],
  'TYPEWRITER':       ['sigTypewriter'],
  'SHADOW CLONE':     ['sigShadowClone'],
  'FIRE WRITE':       ['sigFireWrite'],
  'FIRE CONSUME':     ['sigFireConsume'],
  'TORNADO SPIN':     ['sigTornadoSpin'],
  'TORNADO ABSORB':   ['sigTornadoAbsorb'],
  'MAGNETIC PULL':    ['sigMagneticPull'],
  'MAGNETIC FIELD':   ['sigMagneticField'],
  'FLOAT DANCE':      ['sigFloatDance'],
  'ORBIT DANCE':      ['sigOrbitDance'],
  'GYROSCOPE SPIN':   ['sigGyroscopeSpin'],
  'PENDULUM SWING':   ['sigPendulumSwing'],
  'GRAVITY REVERSE':  ['sigGravityReverse'],
  'ECHO MULTIPLE':    ['sigEchoMultiple'],
  'ECHO TRAIL':       ['sigEchoTrail'],
  'TIME ECHO':        ['sigTimeEcho'],
  'TIME REWIND':      ['sigTimeRewind'],
  'FADE LAYERS':      ['sigFadeLayers'],
  'ROTATION 3D':      ['sigRotation3D'],
  'MIRROR REALITY':   ['sigMirrorReality'],
  'MORPH 3D':         ['sigMorph3D'],
  'SMOKE DISPERSE':   ['sigSmokeDisperse'],
  'FLOAT PHYSICS':    ['sigFloatPhysics'],
  'PHASE THROUGH':    ['sigPhaseThrough'],
  'RAINBOW SHIFT':    ['sigRainbow'],
  'LIQUID POUR':      ['sigLiquidPour'],
  'LIQUID STATE':     ['sigLiquidState'],
  'CRYSTAL SHATTER':  ['sigCrystalShatter'],
};

// ─── PARSER JS — extraction militaire des métriques du code ─────────────────

interface JSMetrics {
  id: string;
  performanceTier: string;
  version: string;
  parameters: Record<string, { type: string; min?: number; max?: number; default?: any; options?: string[] }>;
  phases: Record<string, number>;           // dureesPhases: { inspiration: 4000, ... }
  particlePools: Record<string, number>;   // maxParticules: 80, maxBraises: 150, ...
  poolCounts: Record<string, number>;      // for-loop counts: { scintillements: 15, bloom: 25 }
  physicsConstants: Record<string, number>; // G: 100, coefficientFriction: 0.999, ...
  phaseSequence: string[];                  // ['matrix', 'debugging', 'correcting', 'stable']
  timingConstants: Record<string, number>;  // intervalleCalcul: 16, frequence: 1.2, ...
  animRanges: Record<string, { min: number; max: number; unit: string }>;
}

// Extrait un bloc délimité par des accolades à partir d'une position donnée
// Retourne le contenu INTÉRIEUR du bloc (sans les accolades englobantes)
function extractBraceBlock(code: string, startIdx: number): string {
  let depth = 0;
  let start = -1;
  for (let i = startIdx; i < code.length; i++) {
    if (code[i] === '{') {
      depth++;
      if (depth === 1) start = i;
    } else if (code[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        return code.slice(start + 1, i);
      }
    }
  }
  return '';
}

// Extrait les paramètres d'un bloc "parameters: { ... }" en comptant les braces
function extractParametersBlock(code: string): string {
  const idx = code.search(/parameters\s*:\s*\{/);
  if (idx === -1) return '';
  const openBrace = code.indexOf('{', idx + 'parameters'.length);
  if (openBrace === -1) return '';
  return extractBraceBlock(code, openBrace);
}

// Parse les paramètres individuels { type, min, max, default } depuis le bloc
function parseParameterEntries(
  block: string
): Record<string, { type: string; min?: number; max?: number; default?: any; options?: string[] }> {
  const params: Record<string, any> = {};
  let i = 0;

  while (i < block.length) {
    const sub = block.slice(i);
    // Cherche: nomParam: { — le { est le dernier char du match
    const nameMatch = /(\w+)\s*:\s*\{/.exec(sub);
    if (!nameMatch) break;

    const pName = nameMatch[1];
    // Position exacte du '{' ouvrant dans `block`
    const openIdx = i + nameMatch.index + nameMatch[0].length - 1;

    // Extraire le corps du paramètre par comptage de braces
    const pBody = extractBraceBlock(block, openIdx);
    if (!pBody && pBody !== '') { i++; continue; }

    const param: Record<string, any> = {};

    const typeM = pBody.match(/type\s*:\s*['"]([^'"]+)['"]/);
    if (typeM) param.type = typeM[1];

    const minM = pBody.match(/\bmin\s*:\s*([-\d.]+)/);
    if (minM) param.min = parseFloat(minM[1]);

    const maxM = pBody.match(/\bmax\s*:\s*([-\d.]+)/);
    if (maxM) param.max = parseFloat(maxM[1]);

    const defM = pBody.match(/default\s*:\s*([^,}\n]+)/);
    if (defM) {
      const raw = defM[1].trim();
      if (raw.startsWith("'") || raw.startsWith('"')) {
        param.default = raw.replace(/['"]/g, '');
      } else if (!isNaN(Number(raw))) {
        param.default = parseFloat(raw);
      } else {
        param.default = raw;
      }
    }

    const optsM = pBody.match(/options\s*:\s*\[([^\]]+)\]/);
    if (optsM) {
      param.options = optsM[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
    }

    // N'enregistre que si c'est bien un paramètre d'effet (type ou min/max)
    if (param.type || param.min !== undefined || param.max !== undefined) {
      params[pName] = param;
    }

    // Avancer juste après la fermeture du bloc { }
    // openIdx = position de '{', pBody.length = contenu intérieur, +1 pour '}'
    i = openIdx + 1 + pBody.length + 1;
  }
  return params;
}

function parseJSMetrics(code: string): JSMetrics {
  const metrics: JSMetrics = {
    id: '',
    performanceTier: 'medium',
    version: '1.0',
    parameters: {},
    phases: {},
    particlePools: {},
    poolCounts: {},
    physicsConstants: {},
    phaseSequence: [],
    timingConstants: {},
    animRanges: {},
  };

  // 1. Extraire le bloc super({...}) avec comptage de braces — fiable et précis
  const superIdx = code.search(/super\s*\(/);
  if (superIdx !== -1) {
    const openParen = code.indexOf('(', superIdx);
    const openBrace = code.indexOf('{', openParen);
    if (openBrace !== -1) {
      const superBlock = extractBraceBlock(code, openBrace);

      // id
      const idMatch = superBlock.match(/id\s*:\s*['"]([^'"]+)['"]/);
      if (idMatch) metrics.id = idMatch[1];

      // performance
      const perfMatch = superBlock.match(/performance\s*:\s*['"]([^'"]+)['"]/);
      if (perfMatch) metrics.performanceTier = perfMatch[1];

      // version
      const verMatch = superBlock.match(/version\s*:\s*['"]([^'"]+)['"]/);
      if (verMatch) metrics.version = verMatch[1];

      // parameters — extraction par comptage de braces (capture TOUS les paramètres)
      const paramBlock = extractParametersBlock(superBlock);
      if (paramBlock) {
        metrics.parameters = parseParameterEntries(paramBlock);
      }
    }
  }

  // 2. Phases temporelles — dureesPhases, phaseDurations, phaseTimings
  const phasesMatch = code.match(/this\.\w*[Pp]hases?\w*\s*=\s*\{([\s\S]*?)\};/g);
  if (phasesMatch) {
    for (const block of phasesMatch) {
      if (!block.includes(':')) continue;
      const inner = block.match(/\{([\s\S]*?)\}/)?.[1] ?? '';
      const phaseRegex = /(\w+)\s*:\s*([\d.]+)/g;
      let pm: RegExpExecArray | null;
      while ((pm = phaseRegex.exec(inner)) !== null) {
        metrics.phases[pm[1]] = parseFloat(pm[2]);
      }
    }
  }

  // 3. Pools de particules — this.maxParticules, this.maxBraises, this.maxTraces, etc.
  const poolRegex = /this\.(max[A-Z]\w+)\s*=\s*(\d+)/g;
  let pm: RegExpExecArray | null;
  while ((pm = poolRegex.exec(code)) !== null) {
    metrics.particlePools[pm[1]] = parseInt(pm[2]);
  }

  // 4. Comptages de for-loops pour pools initialisés en boucle
  // Ex: for (let i = 0; i < 15; i++) { this.scintillements.push(...) }
  const forLoopRegex = /for\s*\([^)]*i\s*<\s*(\d+)[^)]*\)\s*\{[^}]*this\.(\w+)\.push\(/g;
  while ((pm = forLoopRegex.exec(code)) !== null) {
    const count = parseInt(pm[1]);
    const array = pm[2];
    if (count > 0) metrics.poolCounts[array] = count;
  }

  // 5. Constantes physiques — this.G, this.coefficientFriction, etc.
  const physRegex = /this\.(G|coefficientFriction|vitesseLumiere|masse|densite|elasticite|restitution|amortissement)\s*=\s*([-\d.]+)/g;
  while ((pm = physRegex.exec(code)) !== null) {
    metrics.physicsConstants[pm[1]] = parseFloat(pm[2]);
  }

  // 6. Séquence des phases — this.phase = 'xxx' (ordre d'apparition dans le code)
  const phaseSeqRegex = /this\.phase\s*=\s*['"]([^'"]+)['"]/g;
  const seenPhases = new Set<string>();
  while ((pm = phaseSeqRegex.exec(code)) !== null) {
    if (!seenPhases.has(pm[1])) {
      seenPhases.add(pm[1]);
      metrics.phaseSequence.push(pm[1]);
    }
  }

  // 7. Constantes de timing — intervalleCalcul, frequence, bpm, fps
  const timingRegex = /this\.(intervalleCalcul|frequence|bpm|targetFps|frameRate|tickRate|refreshRate|cycleMs|cycleDuration)\s*=\s*([\d.]+)/g;
  while ((pm = timingRegex.exec(code)) !== null) {
    metrics.timingConstants[pm[1]] = parseFloat(pm[2]);
  }

  // 8. Plages d'animation — détecter patterns comme (min + Math.random() * (max-min)) ou scale(X, Y)
  // Chercher: min: X, max: Y dans le corps du constructeur (hors parameters)
  const rangeRegex = /(\w+(?:Scale|Opacity|Amplitude|Radius|Speed))\s*:\s*\{\s*min\s*:\s*([\d.]+)\s*,\s*max\s*:\s*([\d.]+)/gi;
  while ((pm = rangeRegex.exec(code)) !== null) {
    metrics.animRanges[pm[1]] = { min: parseFloat(pm[2]), max: parseFloat(pm[3]), unit: '' };
  }

  return metrics;
}

// ─── PARSER DESCRIPTION — extraction de toutes les métriques du texte ────────

interface DescriptionMetrics {
  effectNumber?: number;
  uniqueId: string;
  displayName: string;
  targetCategory: string;
  shortDescription: string;
  addictionSpecs: string[];
  performanceMentions: string[];
  phaseMentions: { label: string; durationMs?: number }[];
  numericMetrics: Record<string, number>;    // particules: 80, scanLines: 8, ...
  percentageRanges: Record<string, { min: number; max: number }>;
  easingMentions: string[];
  configurableParams: string[];              // liste des param nommés dans la section PARAMÈTRES
  keyFeatures: string[];                     // sections marquées 🔥🎯⚡etc.
  physicalSystems: string[];                 // noms des systèmes physiques détectés
}

function parseDescription(content: string): DescriptionMetrics {
  const metrics: DescriptionMetrics = {
    uniqueId: '',
    displayName: '',
    targetCategory: '',
    shortDescription: '',
    addictionSpecs: [],
    performanceMentions: [],
    phaseMentions: [],
    numericMetrics: {},
    percentageRanges: {},
    easingMentions: [],
    configurableParams: [],
    keyFeatures: [],
    physicalSystems: [],
  };

  const lines = content.split('\n');

  // Header structuré
  const titleLine = lines.find(l => l.startsWith('## ') && l.includes('EFFET'));
  if (titleLine) {
    const nm = titleLine.match(/EFFET\s+(\d+)/i);
    if (nm) metrics.effectNumber = parseInt(nm[1]);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('**CATÉGORIE')) {
      metrics.targetCategory = (line.match(/:\*\*\s*(.+)/)?.[1] ?? '').trim();
    } else if (line.startsWith('**ID UNIQUE')) {
      metrics.uniqueId = (line.match(/:\*\*\s*(.+)/)?.[1] ?? '').trim();
    } else if (line.startsWith('**NOM AFFICHAGE')) {
      metrics.displayName = (line.match(/:\*\*\s*(.+)/)?.[1] ?? '').trim();
    } else if (line.startsWith('**DESCRIPTION')) {
      const inlineMatch = line.match(/:\*\*\s*(.{20,})/);
      if (inlineMatch) {
        metrics.shortDescription = inlineMatch[1].trim();
      } else {
        // Description sur la ligne suivante
        const next = lines.slice(i + 1).find(l => l.trim().length > 20 && !l.trim().startsWith('**'));
        if (next) metrics.shortDescription = next.trim();
      }
    }
  }

  // Addiction specs — section SPÉCIFICATIONS ADDICTION
  const addIdx = lines.findIndex(l => l.includes('SPÉCIFICATIONS ADDICTION') || l.includes('ADDICTION'));
  if (addIdx >= 0) {
    for (let i = addIdx + 1; i < Math.min(addIdx + 10, lines.length); i++) {
      const l = lines[i].trim();
      if (!l) continue;
      if (l.startsWith('##') || l.startsWith('**') || l.startsWith('---')) break;
      const clean = l.replace(/^[-*•]\s*/, '').trim();
      if (clean.length > 10) metrics.addictionSpecs.push(clean);
    }
  }

  const fullText = content;

  // Mentions de durées — Xms ou X secondes ou Xs
  const durationRegex = /([A-Za-zÀ-ÿ\s]+?)\s*[:(]\s*(\d+(?:\.\d+)?)\s*(ms|ms\b|s\b|secondes?)\b/gi;
  let dm: RegExpExecArray | null;
  while ((dm = durationRegex.exec(fullText)) !== null) {
    const label = dm[1].trim().split(/\s+/).slice(-3).join(' ');
    const val = parseFloat(dm[2]);
    const unit = dm[3].toLowerCase();
    const ms = unit.startsWith('ms') ? val : val * 1000;
    if (ms >= 50 && ms <= 30000 && label.length > 2) {
      metrics.phaseMentions.push({ label, durationMs: ms });
    }
  }

  // Métriques numériques — "X particules", "X étoiles", "X couches", "X scan lines", etc.
  const countRegex = /(\d+)\s+(particule[s]?|étoile[s]?|star[s]?|particle[s]?|couche[s]?|layer[s]?|scan line[s]?|phase[s]?|ligne[s]?|source[s]?|géné?rateur[s]?|harmonique[s]?|masse[s]?|résonance[s]?|point[s]?)/gi;
  let cm: RegExpExecArray | null;
  while ((cm = countRegex.exec(fullText)) !== null) {
    const key = cm[2].toLowerCase().replace(/[s]$/, '').trim().replace(/\s+/g, '_');
    const val = parseInt(cm[1]);
    if (val > 0 && val < 10000) metrics.numericMetrics[key] = val;
  }

  // Plages en pourcentage — "X-Y%" ou "X% à Y%"
  const pctRegex = /([\w\s]+?)[:\s]+(\d+)[-–à]\s*(\d+)\s*%/gi;
  let pr: RegExpExecArray | null;
  while ((pr = pctRegex.exec(fullText)) !== null) {
    const label = pr[1].trim().split(/\s+/).slice(-2).join('_').toLowerCase();
    metrics.percentageRanges[label] = { min: parseInt(pr[2]), max: parseInt(pr[3]) };
  }

  // Courbes d'easing mentionnées
  const easingKeywords = ['ease-in-out', 'ease-in', 'ease-out', 'ease-in-quart', 'ease-in-back',
    'linear', 'cubic-bezier', 'spring', 'elastic', 'bounce', 'sinusoidal'];
  for (const kw of easingKeywords) {
    if (fullText.toLowerCase().includes(kw)) metrics.easingMentions.push(kw);
  }

  // Paramètres configurables — section "PARAMÈTRES CONFIGURABLES"
  const paramSectionIdx = lines.findIndex(l =>
    l.includes('PARAMÈTRE') || l.includes('CONFIGURABLE') || l.includes('PARAM ')
  );
  if (paramSectionIdx >= 0) {
    for (let i = paramSectionIdx + 1; i < Math.min(paramSectionIdx + 20, lines.length); i++) {
      const l = lines[i].trim();
      if (!l) continue;
      if (l.startsWith('##') || l.startsWith('🚀') || l.startsWith('🏆') || l.startsWith('---')) break;
      const clean = l.replace(/^[-*•🎯]\s*/, '').trim();
      // Format attendu: "nomParam : description"
      const colonIdx = clean.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        const paramName = clean.slice(0, colonIdx).trim();
        if (paramName.length > 0 && !/[.!?,]/.test(paramName)) {
          metrics.configurableParams.push(paramName);
        }
      }
    }
  }

  // Features clés — lignes emoji avec titre
  const featureRegex = /^[🎯🔥⚡🌟🎭🔮🚀💫🧬🌈🎮💀📡🖥️🌌]\s+(.+)$/gm;
  let fr: RegExpExecArray | null;
  while ((fr = featureRegex.exec(fullText)) !== null) {
    const feat = fr[1].trim();
    if (feat.length > 5 && feat.length < 80) metrics.keyFeatures.push(feat);
  }

  // Systèmes physiques mentionnés
  const physSystems: Record<string, string[]> = {
    'gravite': ['gravitationnel', 'gravit', 'gravity'],
    'particules': ['particule', 'particle', 'pooling'],
    'physique': ['physique', 'physic', 'friction', 'inertie', 'momentum'],
    'optique': ['luminos', 'lueur', 'halo', 'glow', 'bloom', 'parallaxe'],
    'ondes': ['harmonique', 'sinusoïd', 'fréquence', 'frequence', 'oscillat'],
    'thermique': ['chaleur', 'température', 'ignition', 'combustion'],
    'quantique': ['quantique', 'quantum', 'superposition', 'phase'],
  };
  const fullLower = fullText.toLowerCase();
  for (const [sys, keywords] of Object.entries(physSystems)) {
    if (keywords.some(kw => fullLower.includes(kw))) {
      metrics.physicalSystems.push(sys);
    }
  }

  // Performance mentionnée dans la description
  const perfKeywords = ['performance low', 'performance medium', 'performance high',
    'très léger', 'léger', 'optimisé', 'objet pooling', 'object pooling', '60fps', '60 fps'];
  for (const kw of perfKeywords) {
    if (fullLower.includes(kw)) metrics.performanceMentions.push(kw);
  }

  return metrics;
}

// ─── CALCUL COMPLEXITÉ PRÉCISE ─────────────────────────────────────────────────

function computeComplexity(desc: DescriptionMetrics, js: JSMetrics, codeLen: number): number {
  let score = 3;

  // Nombre de paramètres configurables
  const paramCount = Object.keys(js.parameters).length;
  if (paramCount >= 5) score++;
  if (paramCount >= 8) score++;

  // Nombre de systèmes de particules
  const totalParticles = Object.values(js.particlePools).reduce((a, b) => a + b, 0);
  if (totalParticles > 100) score++;
  if (totalParticles > 300) score++;

  // Nombre de phases
  if (Object.keys(js.phases).length >= 3) score++;
  if (js.phaseSequence.length >= 3) score++;

  // Constantes physiques → simulation physique réelle
  if (Object.keys(js.physicsConstants).length > 0) score++;

  // Systèmes physiques mentionnés
  if (desc.physicalSystems.length >= 3) score++;

  // Taille du code
  if (codeLen > 10000) score++;
  if (codeLen > 20000) score++;

  // Easing curves sophistiquées
  if (desc.easingMentions.length >= 3) score++;

  return Math.min(Math.max(score, 1), 10);
}

// ─── CALCUL PERFORMANCE PRÉCISE ───────────────────────────────────────────────

function computePerformance(js: JSMetrics, descMentions: string[], codeLen: number): string {
  // La valeur dans super() est la plus fiable
  if (js.performanceTier && ['low', 'medium', 'high'].includes(js.performanceTier)) {
    return js.performanceTier;
  }

  // Fallback heuristique
  const totalParticles = Object.values(js.particlePools).reduce((a, b) => a + b, 0);
  if (totalParticles > 200 || codeLen > 20000) return 'high';
  if (totalParticles > 80 || codeLen > 10000) return 'medium';
  return 'low';
}

// ─── TAGS ENRICHIS ─────────────────────────────────────────────────────────────

function buildTags(folderName: string, desc: DescriptionMetrics, js: JSMetrics): string[] {
  const tags = new Set<string>();

  // Mots du nom de dossier
  folderName.toLowerCase().split(/[\s_-]+/).forEach(w => { if (w.length > 2) tags.add(w); });

  // Catégorie
  if (desc.targetCategory) tags.add(desc.targetCategory.toLowerCase());

  // Systèmes physiques
  desc.physicalSystems.forEach(s => tags.add(s));

  // Paramètres configurables significatifs
  Object.keys(js.parameters).forEach(p => {
    if (p.length > 3 && !['type', 'min', 'max', 'default'].includes(p)) {
      tags.add(p.toLowerCase());
    }
  });

  // Métriques de particules → tag
  if (Object.keys(js.particlePools).length > 0) tags.add('particles');
  if (Object.keys(js.physicsConstants).length > 0) tags.add('physics');
  if (js.phaseSequence.length > 1) tags.add('multi-phase');
  if (desc.easingMentions.length > 0) tags.add('animation');

  // CSS keyframes associés
  const cssKf = CSS_KEYFRAME_MAP[folderName] ?? [];
  if (cssKf.length > 0) tags.add('css-ready');

  return Array.from(tags).slice(0, 12);
}

// ─── CONSTRUCTION METADATA COMPLÈTE ───────────────────────────────────────────

function buildMetadata(
  desc: DescriptionMetrics,
  js: JSMetrics,
  jsFile: string,
  folderName: string
): Record<string, any> {
  const cssKeyframes = CSS_KEYFRAME_MAP[folderName] ?? [];

  const meta: Record<string, any> = {
    // Identification
    premiumId:      desc.uniqueId || js.id,
    folderName,
    targetCategory: desc.targetCategory,
    effectNumber:   desc.effectNumber,
    author:         'Premium Effects Library',
    jsFile,

    // Performance réelle depuis le code JS
    performanceTier: js.performanceTier,
    version:         js.version || '1.0',

    // Intégration CSS signatures
    cssKeyframes,
    cssReady: cssKeyframes.length > 0,
  };

  // Phases temporelles (si présentes)
  if (Object.keys(js.phases).length > 0) {
    meta.phaseDurations = js.phases;
    meta.totalCycleDurationMs = Object.values(js.phases).reduce((a, b) => a + b, 0);
  }

  // Séquence de phases
  if (js.phaseSequence.length > 0) {
    meta.phaseSequence = js.phaseSequence;
  }

  // Systèmes de particules
  const totalParticles = Object.values(js.particlePools).reduce((a, b) => a + b, 0);
  if (totalParticles > 0) {
    meta.particleSystems = js.particlePools;
    meta.totalParticleCount = totalParticles;
  }

  // Pools initialisés en boucle
  if (Object.keys(js.poolCounts).length > 0) {
    meta.poolCounts = js.poolCounts;
  }

  // Constantes physiques
  if (Object.keys(js.physicsConstants).length > 0) {
    meta.physics = js.physicsConstants;
  }

  // Timing interne
  if (Object.keys(js.timingConstants).length > 0) {
    meta.timingConstants = js.timingConstants;
  }

  // Plages d'animation
  if (Object.keys(js.animRanges).length > 0) {
    meta.animationRanges = js.animRanges;
  }

  // Métriques depuis la description
  if (Object.keys(desc.numericMetrics).length > 0) {
    meta.descMetrics = desc.numericMetrics;
  }

  // Plages pourcentage
  if (Object.keys(desc.percentageRanges).length > 0) {
    meta.percentageRanges = desc.percentageRanges;
  }

  // Phases mentionnées dans la description (avec durées en ms)
  const descPhasesWithDuration = desc.phaseMentions.filter(p => p.durationMs !== undefined);
  if (descPhasesWithDuration.length > 0) {
    meta.descPhaseTiming = descPhasesWithDuration;
  }

  // Mécaniques d'addiction
  if (desc.addictionSpecs.length > 0) {
    meta.addictionMechanics = desc.addictionSpecs;
  }

  // Courbes d'easing
  if (desc.easingMentions.length > 0) {
    meta.easingCurves = desc.easingMentions;
  }

  // Systèmes physiques
  if (desc.physicalSystems.length > 0) {
    meta.physicalSystems = desc.physicalSystems;
  }

  // Features clés
  if (desc.keyFeatures.length > 0) {
    meta.keyFeatures = desc.keyFeatures.slice(0, 10);
  }

  // Paramètres configurables (noms depuis la description)
  if (desc.configurableParams.length > 0) {
    meta.configurableParamNames = desc.configurableParams;
  }

  return meta;
}

// ─── CHARGEUR PRINCIPAL ────────────────────────────────────────────────────────

export async function loadPremiumEffects(): Promise<{ loaded: number; skipped: number; errors: string[] }> {
  const result = { loaded: 0, skipped: 0, errors: [] as string[] };

  let entries: string[];
  try {
    entries = await fs.readdir(PREMIUM_EFFECTS_DIR);
  } catch {
    console.warn('⚠️ Dossier Premium_Effect-main introuvable, chargement ignoré');
    return result;
  }

  const existing = await storage.getEffects({ limit: 10000 });
  const existingIds = new Set(
    existing.effects.map(e => (e.metadata as any)?.premiumId).filter(Boolean)
  );

  for (const entry of entries) {
    const effectDir = path.join(PREMIUM_EFFECTS_DIR, entry);
    const stat = await fs.stat(effectDir).catch(() => null);
    if (!stat?.isDirectory()) continue;

    try {
      // Lecture Description.txt
      const descPath = path.join(effectDir, 'Description.txt');
      const descContent = await fs.readFile(descPath, 'utf-8').catch(() => '');
      if (!descContent) { result.skipped++; continue; }

      // Parse description
      const descMetrics = parseDescription(descContent);
      if (!descMetrics.uniqueId) { result.skipped++; continue; }

      // Skip si déjà chargé
      if (existingIds.has(descMetrics.uniqueId)) { result.skipped++; continue; }

      // Lecture fichier JS
      const dirFiles = await fs.readdir(effectDir);
      const jsFile = dirFiles.find(f => f.endsWith('.js'));
      if (!jsFile) { result.skipped++; continue; }

      const code = await fs.readFile(path.join(effectDir, jsFile), 'utf-8');

      // Parse JS — extraction militaire
      const jsMetrics = parseJSMetrics(code);

      // Type et catégorie
      const type = TYPE_MAP[entry] || 'EFFECT';
      const category = CATEGORY_MAP[entry] || (
        descMetrics.targetCategory === 'TEXT' ? 'TEXT_EFFECT' :
        descMetrics.targetCategory === 'IMAGE' ? 'IMAGE_EFFECT' : 'GENERAL'
      );

      // Tags enrichis
      const tags = buildTags(entry, descMetrics, jsMetrics);

      // Complexité et performance précises
      const complexity = computeComplexity(descMetrics, jsMetrics, code.length);
      const performance = computePerformance(jsMetrics, descMetrics.performanceMentions, code.length);

      // Metadata complète
      const metadata = buildMetadata(descMetrics, jsMetrics, jsFile, entry);

      const effect: InsertEffect = {
        name:        descMetrics.displayName || entry,
        description: descMetrics.shortDescription || `Effet premium : ${entry}`,
        type,
        category,
        platform:    'javascript',
        code,
        parameters:  jsMetrics.parameters,   // ✅ Paramètres réels avec min/max/default
        metadata,                             // ✅ Toutes les métriques extraites
        tags,
        complexity,
        performance,
        version:     jsMetrics.version || '1.0.0',
      };

      await storage.createEffect(effect as any);
      result.loaded++;

      // Log détaillé
      const paramCount = Object.keys(jsMetrics.parameters).length;
      const particleTotal = Object.values(jsMetrics.particlePools).reduce((a, b) => a + b, 0);
      const phaseCount = Object.keys(jsMetrics.phases).length;
      console.log(
        `✅ Chargé: ${entry} → ${descMetrics.displayName} | ` +
        `params:${paramCount} | particles:${particleTotal} | phases:${phaseCount} | ` +
        `complexity:${complexity} | perf:${performance}`
      );

    } catch (err: any) {
      const msg = `❌ Erreur ${entry}: ${err.message}`;
      result.errors.push(msg);
      console.warn(msg);
    }
  }

  return result;
}

// ─── RE-PARSEUR POUR MISE À JOUR DES EFFETS EXISTANTS ─────────────────────────

export async function reloadAndEnrichAllEffects(): Promise<{
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const result = { updated: 0, skipped: 0, errors: [] as string[] };

  let entries: string[];
  try {
    entries = await fs.readdir(PREMIUM_EFFECTS_DIR);
  } catch {
    return result;
  }

  const existing = await storage.getEffects({ limit: 10000 });
  const existingByPremiumId = new Map<string, any>(
    existing.effects
      .filter(e => (e.metadata as any)?.premiumId)
      .map(e => [(e.metadata as any).premiumId, e])
  );

  for (const entry of entries) {
    const effectDir = path.join(PREMIUM_EFFECTS_DIR, entry);
    const stat = await fs.stat(effectDir).catch(() => null);
    if (!stat?.isDirectory()) continue;

    try {
      const descContent = await fs.readFile(path.join(effectDir, 'Description.txt'), 'utf-8').catch(() => '');
      if (!descContent) { result.skipped++; continue; }

      const descMetrics = parseDescription(descContent);
      if (!descMetrics.uniqueId) { result.skipped++; continue; }

      const dirFiles = await fs.readdir(effectDir);
      const jsFile = dirFiles.find(f => f.endsWith('.js'));
      if (!jsFile) { result.skipped++; continue; }

      const code = await fs.readFile(path.join(effectDir, jsFile), 'utf-8');
      const jsMetrics = parseJSMetrics(code);

      const type = TYPE_MAP[entry] || 'EFFECT';
      const category = CATEGORY_MAP[entry] || 'GENERAL';
      const tags = buildTags(entry, descMetrics, jsMetrics);
      const complexity = computeComplexity(descMetrics, jsMetrics, code.length);
      const performance = computePerformance(jsMetrics, descMetrics.performanceMentions, code.length);
      const metadata = buildMetadata(descMetrics, jsMetrics, jsFile, entry);

      const existing_effect = existingByPremiumId.get(descMetrics.uniqueId);

      if (existing_effect) {
        // Mise à jour de l'effet existant
        await storage.updateEffect(existing_effect.id, {
          parameters: jsMetrics.parameters,
          metadata,
          tags,
          complexity,
          performance,
          version: jsMetrics.version || '1.0.0',
          description: descMetrics.shortDescription || existing_effect.description,
        });
        result.updated++;

        const paramCount = Object.keys(jsMetrics.parameters).length;
        const particleTotal = Object.values(jsMetrics.particlePools).reduce((a, b) => a + b, 0);
        console.log(
          `🔄 Enrichi: ${entry} | params:${paramCount} | particles:${particleTotal} | ` +
          `phases:${Object.keys(jsMetrics.phases).length} | complexity:${complexity}`
        );
      } else {
        // Nouvel effet non encore chargé
        const effect: InsertEffect = {
          name: descMetrics.displayName || entry,
          description: descMetrics.shortDescription || `Effet premium : ${entry}`,
          type, category, platform: 'javascript', code,
          parameters: jsMetrics.parameters,
          metadata, tags, complexity, performance,
          version: jsMetrics.version || '1.0.0',
        };
        await storage.createEffect(effect as any);
        result.updated++;
        console.log(`✅ Nouveau: ${entry} → ${descMetrics.displayName}`);
      }
    } catch (err: any) {
      const msg = `❌ Erreur ${entry}: ${err.message}`;
      result.errors.push(msg);
      console.warn(msg);
    }
  }

  return result;
}
