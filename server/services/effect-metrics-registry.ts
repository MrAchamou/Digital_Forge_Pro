/**
 * EffectMetricsRegistry
 * ─────────────────────
 * Parse tous les effets premium au démarrage et garde leurs métriques en mémoire.
 * Fournit les vraies valeurs (couches, particules, phases, constantes physiques)
 * au zone-svg-renderer pour produire des SVG qui exploitent 100% de chaque effet.
 */

import fs from 'fs/promises';
import path from 'path';

export interface EffectParameter {
  type: string;
  min?: number;
  max?: number;
  default?: any;
  options?: string[];
}

export interface EffectMetrics {
  folderName: string;
  parameters: Record<string, EffectParameter>;
  phases: Record<string, number>;
  particlePools: Record<string, number>;
  poolCounts: Record<string, number>;
  physicsConstants: Record<string, number>;
  phaseSequence: string[];
  timingConstants: Record<string, number>;
  animRanges: Record<string, { min: number; max: number; unit: string }>;
  totalParticles: number;
  totalCycleDurationMs: number;
  performanceTier: string;
  version: string;
}

const PREMIUM_EFFECTS_DIR = path.join(process.cwd(), 'Premium_Effect-main');

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

function extractParametersBlock(code: string): string {
  const idx = code.search(/parameters\s*:\s*\{/);
  if (idx === -1) return '';
  const openBrace = code.indexOf('{', idx + 'parameters'.length);
  if (openBrace === -1) return '';
  return extractBraceBlock(code, openBrace);
}

function parseParameterEntries(block: string): Record<string, EffectParameter> {
  const params: Record<string, any> = {};
  let i = 0;
  while (i < block.length) {
    const sub = block.slice(i);
    const nameMatch = /(\w+)\s*:\s*\{/.exec(sub);
    if (!nameMatch) break;
    const pName = nameMatch[1];
    const openIdx = i + nameMatch.index + nameMatch[0].length - 1;
    const pBody = extractBraceBlock(block, openIdx);
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
    if (param.type || param.min !== undefined || param.max !== undefined) {
      params[pName] = param;
    }
    i = openIdx + 1 + pBody.length + 1;
  }
  return params;
}

function parseMetricsFromCode(code: string, folderName: string): EffectMetrics {
  const m: EffectMetrics = {
    folderName,
    parameters: {},
    phases: {},
    particlePools: {},
    poolCounts: {},
    physicsConstants: {},
    phaseSequence: [],
    timingConstants: {},
    animRanges: {},
    totalParticles: 0,
    totalCycleDurationMs: 0,
    performanceTier: 'medium',
    version: '1.0',
  };

  const superIdx = code.search(/super\s*\(/);
  if (superIdx !== -1) {
    const openParen = code.indexOf('(', superIdx);
    const openBrace = code.indexOf('{', openParen);
    if (openBrace !== -1) {
      const superBlock = extractBraceBlock(code, openBrace);
      const perfMatch = superBlock.match(/performance\s*:\s*['"]([^'"]+)['"]/);
      if (perfMatch) m.performanceTier = perfMatch[1];
      const verMatch = superBlock.match(/version\s*:\s*['"]([^'"]+)['"]/);
      if (verMatch) m.version = verMatch[1];
      const paramBlock = extractParametersBlock(superBlock);
      if (paramBlock) m.parameters = parseParameterEntries(paramBlock);
    }
  }

  const phasesMatch = code.match(/this\.\w*[Pp]hases?\w*\s*=\s*\{([\s\S]*?)\};/g);
  if (phasesMatch) {
    for (const block of phasesMatch) {
      if (!block.includes(':')) continue;
      const inner = block.match(/\{([\s\S]*?)\}/)?.[1] ?? '';
      const phaseRegex = /(\w+)\s*:\s*([\d.]+)/g;
      let pm: RegExpExecArray | null;
      while ((pm = phaseRegex.exec(inner)) !== null) {
        m.phases[pm[1]] = parseFloat(pm[2]);
      }
    }
  }

  const poolRegex = /this\.(max[A-Z]\w+)\s*=\s*(\d+)/g;
  let pm: RegExpExecArray | null;
  while ((pm = poolRegex.exec(code)) !== null) {
    m.particlePools[pm[1]] = parseInt(pm[2]);
  }

  const forLoopRegex = /for\s*\([^)]*i\s*<\s*(\d+)[^)]*\)\s*\{[^}]*this\.(\w+)\.push\(/g;
  while ((pm = forLoopRegex.exec(code)) !== null) {
    const count = parseInt(pm[1]);
    if (count > 0) m.poolCounts[pm[2]] = count;
  }

  const physRegex = /this\.(G|coefficientFriction|vitesseLumiere|masse|densite|elasticite|restitution|amortissement)\s*=\s*([-\d.]+)/g;
  while ((pm = physRegex.exec(code)) !== null) {
    m.physicsConstants[pm[1]] = parseFloat(pm[2]);
  }

  const phaseSeqRegex = /this\.phase\s*=\s*['"]([^'"]+)['"]/g;
  const seenPhases = new Set<string>();
  while ((pm = phaseSeqRegex.exec(code)) !== null) {
    if (!seenPhases.has(pm[1])) {
      seenPhases.add(pm[1]);
      m.phaseSequence.push(pm[1]);
    }
  }

  const timingRegex = /this\.(intervalleCalcul|frequence|bpm|targetFps|frameRate|tickRate|refreshRate|cycleMs|cycleDuration)\s*=\s*([\d.]+)/g;
  while ((pm = timingRegex.exec(code)) !== null) {
    m.timingConstants[pm[1]] = parseFloat(pm[2]);
  }

  const rangeRegex = /(\w+(?:Scale|Opacity|Amplitude|Radius|Speed))\s*:\s*\{\s*min\s*:\s*([\d.]+)\s*,\s*max\s*:\s*([\d.]+)/gi;
  while ((pm = rangeRegex.exec(code)) !== null) {
    m.animRanges[pm[1]] = { min: parseFloat(pm[2]), max: parseFloat(pm[3]), unit: '' };
  }

  m.totalParticles = Object.values(m.particlePools).reduce((a, b) => a + b, 0);
  m.totalCycleDurationMs = Object.values(m.phases).reduce((a, b) => a + b, 0);

  return m;
}

class EffectMetricsRegistryImpl {
  private registry = new Map<string, EffectMetrics>();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const entries = await fs.readdir(PREMIUM_EFFECTS_DIR);
      for (const entry of entries) {
        const effectDir = path.join(PREMIUM_EFFECTS_DIR, entry);
        const stat = await fs.stat(effectDir).catch(() => null);
        if (!stat?.isDirectory()) continue;
        try {
          const dirFiles = await fs.readdir(effectDir);
          const jsFile = dirFiles.find(f => f.endsWith('.js'));
          if (!jsFile) continue;
          const code = await fs.readFile(path.join(effectDir, jsFile), 'utf-8');
          const metrics = parseMetricsFromCode(code, entry);
          this.registry.set(entry.toUpperCase(), metrics);
        } catch {
          // Silently skip
        }
      }
      this.initialized = true;
      console.log(`🔬 EffectMetricsRegistry: ${this.registry.size} effets chargés en mémoire`);
    } catch {
      console.warn('⚠️ EffectMetricsRegistry: dossier Premium_Effect-main introuvable');
    }
  }

  get(folderName: string): EffectMetrics | null {
    return this.registry.get(folderName.toUpperCase()) ?? null;
  }

  /**
   * Retourne la valeur par défaut d'un paramètre, avec fallback si non trouvé.
   */
  param(folderName: string, paramName: string, fallback: number): number {
    const m = this.get(folderName);
    if (!m) return fallback;
    const p = m.parameters[paramName];
    if (!p || p.default === undefined) return fallback;
    const v = parseFloat(String(p.default));
    return isNaN(v) ? fallback : v;
  }

  paramMax(folderName: string, paramName: string, fallback: number): number {
    const m = this.get(folderName);
    if (!m) return fallback;
    const p = m.parameters[paramName];
    if (!p || p.max === undefined) return fallback;
    return p.max;
  }

  paramMin(folderName: string, paramName: string, fallback: number): number {
    const m = this.get(folderName);
    if (!m) return fallback;
    const p = m.parameters[paramName];
    if (!p || p.min === undefined) return fallback;
    return p.min;
  }

  /**
   * Retourne la durée totale du cycle en secondes (depuis les phases).
   */
  cycleSecs(folderName: string, fallbackSecs: number): number {
    const m = this.get(folderName);
    if (!m || m.totalCycleDurationMs <= 0) return fallbackSecs;
    return m.totalCycleDurationMs / 1000;
  }

  /**
   * Retourne les durées de phases individuelles en secondes.
   */
  phaseSecs(folderName: string, phaseName: string, fallbackSecs: number): number {
    const m = this.get(folderName);
    if (!m) return fallbackSecs;
    const ph = m.phases[phaseName];
    if (!ph || ph <= 0) return fallbackSecs;
    return ph / 1000;
  }

  /**
   * Retourne le nombre réel de particules d'un pool.
   */
  particles(folderName: string, fallback: number): number {
    const m = this.get(folderName);
    if (!m || m.totalParticles <= 0) return fallback;
    return m.totalParticles;
  }

  /**
   * Retourne le count d'un pool spécifique.
   */
  poolCount(folderName: string, poolName: string, fallback: number): number {
    const m = this.get(folderName);
    if (!m) return fallback;
    return m.particlePools[poolName] ?? m.poolCounts[poolName] ?? fallback;
  }

  /**
   * Retourne le nombre de couches/layers d'un effet (depuis couchesAuriques, nombreCouches, etc.)
   */
  layers(folderName: string, fallback: number): number {
    const m = this.get(folderName);
    if (!m) return fallback;
    // Cherche les paramètres qui contiennent "couche", "layer", "layer"
    for (const [name, p] of Object.entries(m.parameters)) {
      if (/couche|layer|nombre/i.test(name) && p.default !== undefined) {
        const v = parseFloat(String(p.default));
        if (!isNaN(v) && v >= 1 && v <= 20) return Math.round(v);
      }
    }
    return fallback;
  }

  /**
   * Fréquence/BPM de l'effet.
   */
  bpm(folderName: string, fallback: number): number {
    const m = this.get(folderName);
    if (!m) return fallback;
    if (m.timingConstants.bpm) return m.timingConstants.bpm;
    // Chercher dans les paramètres
    for (const [name, p] of Object.entries(m.parameters)) {
      if (/rythme|bpm|frequence|vitesse/i.test(name) && p.default !== undefined) {
        const v = parseFloat(String(p.default));
        if (!isNaN(v)) return v;
      }
    }
    return fallback;
  }

  /**
   * Retourne une couleur de base de l'effet.
   */
  baseColor(folderName: string, fallback: string): string {
    const m = this.get(folderName);
    if (!m) return fallback;
    for (const [name, p] of Object.entries(m.parameters)) {
      if (p.type === 'color' && p.default && typeof p.default === 'string') {
        return p.default;
      }
    }
    return fallback;
  }

  all(): Map<string, EffectMetrics> {
    return this.registry;
  }
}

export const effectMetricsRegistry = new EffectMetricsRegistryImpl();
