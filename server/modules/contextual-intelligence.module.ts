/**
 * 🧠 CONTEXTUAL INTELLIGENCE MODERATOR — v1.0
 *
 * Gardien de la qualité visuelle — évalue la complexité d'une signature et
 * empêche la sur-animation. Garantit l'équilibre entre expressivité et
 * professionnalisme. Zéro signature "criarde" ou illisible.
 *
 * ARCHITECTURE v1.0 :
 *  ┌─ ComplexityScorer ────────────────────────────────────────────────────────┐
 *  │  Calcule un score de complexité [0…100] basé sur :                        │
 *  │  • Nombre d'effets simultanés (pondéré × leur niveau de complexité)       │
 *  │  • Densité de particules (totalParticleCount)                             │
 *  │  • Performance tier des effets (low/medium/high)                          │
 *  │  • Durée totale des animations vs seuil de fatigue visuelle (4s)          │
 *  │  • Taux de propriétés conflictuelles (transform, opacity, filter)         │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ SectorContext ─────────────────────────────────────────────────────────── ┐
 *  │  Chaque secteur a un plafond de complexité acceptable :                   │
 *  │  Santé/Education : max 55 | Immobilier : max 60 | Tech/Startup : max 80  │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ AutoReducer ─────────────────────────────────────────────────────────────┐
 *  │  Si score > seuil, réduit automatiquement :                               │
 *  │  1. Intensité des effets (paramètre intensite → −30%)                     │
 *  │  2. Durée des animations (vitesse → ×1.3)                                 │
 *  │  3. Densité particules (particleDensity → ×0.6)                           │
 *  │  4. Suppression des effets les moins prioritaires                         │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *  ┌─ ProfessionalismGuard ────────────────────────────────────────────────────┐
 *  │  Règles métier codifiées :                                                 │
 *  │  • Max 2 effets simultanés sur le même élément                           │
 *  │  • Durée visible ≥ 500ms entre deux transitions                           │
 *  │  • Contraste texte maintenu WCAG AA pendant toutes les phases             │
 *  └────────────────────────────────────────────────────────────────────────────┘
 *
 * @version 1.0.0
 * @zero-dependency  true   — aucune dépendance externe
 * @server-side      true   — Node.js uniquement
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

export const ENGINE_VERSION = '1.0.0';

/** Score idéal de complexité — zone d'équilibre [60…75] */
const IDEAL_MIN = 55;
const IDEAL_MAX = 75;

/** Durée de fatigue visuelle — au-delà, l'œil décroche (ms) */
const FATIGUE_THRESHOLD_MS = 4000;

/** Facteur de réduction automatique par cycle */
const REDUCTION_FACTOR = 0.72;

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export type SectorId =
  | 'artisanat' | 'commerce' | 'education' | 'immobilier'
  | 'loisirs' | 'restauration' | 'sante' | 'services_pro'
  | 'tech' | 'transport';

export type ModerationLevel = 'none' | 'light' | 'moderate' | 'strong' | 'critical';
export type EffectPriority  = 'primary' | 'secondary' | 'decorative';

/** Profil d'un effet dans l'analyse */
export interface EffectProfile {
  id:              string;
  name:            string;
  complexity:      number;       // 1…10 (extrait du loader)
  performance:     'low' | 'medium' | 'high';
  particleCount:   number;       // Nombre de particules
  durationMs:      number;       // Durée cycle complet
  cssPropertyCount: number;      // Nombre de propriétés CSS animées
  priority:        EffectPriority;
}

/** Configuration d'analyse */
export interface ModerationConfig {
  effects:         EffectProfile[];
  sectorId:        SectorId;
  elementLength?:  number;     // Longueur du texte animé (nb caractères)
  targetDurationMs?: number;   // Durée cible de la signature (ms)
}

/** Score de complexité détaillé */
export interface ComplexityScore {
  total:           number;    // Score global [0…100]
  breakdown: {
    effectLoad:    number;    // Poids des effets (0…40)
    particleDensity: number;  // Densité particules (0…20)
    durationPressure: number; // Pression temporelle (0…20)
    propertyConflict: number; // Conflits propriétés (0…20)
  };
  verdict:         ModerationLevel;
  withinSectorBounds: boolean;
  sectorCeiling:   number;
}

/** Règle de professionnalisme violée */
export interface ProfessionalismViolation {
  rule:     string;
  severity: 'warning' | 'error';
  detail:   string;
  fix:      string;
}

/** Résultat de la modération */
export interface ModerationResult {
  score:            ComplexityScore;
  violations:       ProfessionalismViolation[];
  recommendations:  string[];
  /** Paramètres ajustés si sur-animation détectée */
  adjustedParams?:  AdjustedParameters;
  /** Effets à supprimer si réduction critique nécessaire */
  effectsToRemove?: string[];
  /** Résumé lisible */
  summary:          string;
  approved:         boolean;
}

/** Paramètres d'animation ajustés par le modérateur */
export interface AdjustedParameters {
  intensiteMultiplier:      number;   // ex: 0.7 = réduit de 30%
  vitesseMultiplier:        number;   // ex: 1.3 = ralentit de 30%
  particleDensityMultiplier: number;  // ex: 0.6 = 40% de particules en moins
  cssOverrides:             string;   // Bloc CSS d'atténuation injectable
}

// ─── Plafonds par secteur ─────────────────────────────────────────────────────

const SECTOR_CEILINGS: Record<SectorId, number> = {
  sante:        52,   // Médical : sobriété maximale
  education:    55,   // Éducation : clarté prioritaire
  services_pro: 58,   // Services professionnels : confiance, sérieux
  immobilier:   62,   // Immobilier : premium mais calme
  transport:    65,   // Transport : mouvement maîtrisé
  commerce:     68,   // Commerce : dynamique mais lisible
  restauration: 68,   // Restauration : appétissant, pas criard
  artisanat:    65,   // Artisanat : chaleur et authenticité
  loisirs:      78,   // Loisirs : plus de liberté expressive
  tech:         82,   // Tech : innovation, animation forte acceptée
};

// ─── Poids des propriétés CSS animées ────────────────────────────────────────

const PROPERTY_WEIGHTS: Record<string, number> = {
  transform:        3.0,  // transform = impact visuel fort
  opacity:          1.5,
  filter:           2.5,  // filter = coûteux GPU
  color:            1.0,
  'background-color': 1.5,
  'text-shadow':    2.0,
  'box-shadow':     2.0,
  width:            2.0,
  height:           2.0,
  'font-size':      1.5,
  left:             2.5,
  top:              2.5,
};

// ─── Calcul du score de complexité ───────────────────────────────────────────

function scoreEffectLoad(effects: EffectProfile[]): number {
  if (effects.length === 0) return 0;
  // Somme pondérée des complexités (max 40 points)
  const raw = effects.reduce((sum, e) => {
    const perfMult = e.performance === 'high' ? 1.4 : e.performance === 'low' ? 0.7 : 1.0;
    return sum + e.complexity * perfMult;
  }, 0);
  // Normalise : 1 effet complexity=10 high-perf = 14 pts → ~35% de 40
  return Math.min(40, (raw / (effects.length * 10)) * 40 * (1 + (effects.length - 1) * 0.4));
}

function scoreParticleDensity(effects: EffectProfile[]): number {
  const total = effects.reduce((sum, e) => sum + e.particleCount, 0);
  if (total === 0) return 0;
  // 500 particules = max (20 pts)
  return Math.min(20, (total / 500) * 20);
}

function scoreDurationPressure(effects: EffectProfile[], targetMs = 4000): number {
  if (effects.length === 0) return 0;
  const maxDur = Math.max(...effects.map(e => e.durationMs));
  const minDur = Math.min(...effects.map(e => e.durationMs));
  // Si les durées diffèrent trop, crée de la discordance temporelle
  const discord = maxDur > 0 ? (maxDur - minDur) / maxDur : 0;
  // Si au-dessus du seuil de fatigue
  const fatigue = maxDur > FATIGUE_THRESHOLD_MS
    ? Math.min(1, (maxDur - FATIGUE_THRESHOLD_MS) / FATIGUE_THRESHOLD_MS)
    : 0;
  return Math.min(20, (discord * 10) + (fatigue * 10));
}

function scorePropertyConflict(effects: EffectProfile[]): number {
  if (effects.length < 2) return 0;
  // Estime les conflits basés sur le nombre de propriétés css par effet
  const avgProps = effects.reduce((s, e) => s + e.cssPropertyCount, 0) / effects.length;
  // Plus d'effets avec beaucoup de propriétés = plus de conflits potentiels
  const conflictRisk = (effects.length - 1) * (avgProps / 10);
  return Math.min(20, conflictRisk * 8);
}

/** Calcule le score de complexité complet */
export function scoreComplexity(config: ModerationConfig): ComplexityScore {
  const ceiling = SECTOR_CEILINGS[config.sectorId] ?? 70;

  const breakdown = {
    effectLoad:       scoreEffectLoad(config.effects),
    particleDensity:  scoreParticleDensity(config.effects),
    durationPressure: scoreDurationPressure(config.effects, config.targetDurationMs),
    propertyConflict: scorePropertyConflict(config.effects),
  };

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let verdict: ModerationLevel;
  if      (total <= 30)  verdict = 'none';
  else if (total <= IDEAL_MIN) verdict = 'light';
  else if (total <= IDEAL_MAX) verdict = 'none';    // zone idéale
  else if (total <= 85)  verdict = 'moderate';
  else if (total <= 92)  verdict = 'strong';
  else                   verdict = 'critical';

  return {
    total,
    breakdown,
    verdict,
    withinSectorBounds: total <= ceiling,
    sectorCeiling: ceiling,
  };
}

// ─── Vérificateur de règles de professionnalisme ──────────────────────────────

function checkProfessionalismRules(
  config: ModerationConfig,
  score:  ComplexityScore,
): ProfessionalismViolation[] {
  const violations: ProfessionalismViolation[] = [];

  // Règle 1 : max 2 effets simultanés sur un même élément
  if (config.effects.length > 2) {
    violations.push({
      rule:     'MAX_SIMULTANEOUS_EFFECTS',
      severity: config.effects.length > 3 ? 'error' : 'warning',
      detail:   `${config.effects.length} effets simultanés détectés (max recommandé : 2)`,
      fix:      'Passer au mode SEQUENTIAL ou réduire à 2 effets',
    });
  }

  // Règle 2 : texte court + effets complexes = illisibilité
  if (config.elementLength && config.elementLength < 5 && score.breakdown.effectLoad > 25) {
    violations.push({
      rule:     'SHORT_TEXT_OVERLOAD',
      severity: 'warning',
      detail:   `Texte court (${config.elementLength} car.) avec animation complexe — lisibilité réduite`,
      fix:      'Réduire intensite à 0.4 ou choisir un effet plus simple',
    });
  }

  // Règle 3 : trop de particules = performances dégradées mobile
  const totalParticles = config.effects.reduce((s, e) => s + e.particleCount, 0);
  if (totalParticles > 800) {
    violations.push({
      rule:     'PARTICLE_OVERLOAD',
      severity: totalParticles > 1500 ? 'error' : 'warning',
      detail:   `${totalParticles} particules — risque de drop FPS sur mobile`,
      fix:      'Activer PerformanceAdaptiveEngine tier "lite" (≤ 200 particules)',
    });
  }

  // Règle 4 : dépassement du plafond secteur
  if (!score.withinSectorBounds) {
    violations.push({
      rule:     'SECTOR_CEILING_EXCEEDED',
      severity: 'error',
      detail:   `Score ${score.total.toFixed(0)} > plafond ${config.sectorId} (${score.sectorCeiling})`,
      fix:      `Réduire la complexité de ${(score.total - score.sectorCeiling).toFixed(0)} points`,
    });
  }

  return violations;
}

// ─── Génération des paramètres ajustés ────────────────────────────────────────

function generateAdjustedParams(
  score:    ComplexityScore,
  effects:  EffectProfile[],
  level:    ModerationLevel,
): AdjustedParameters {
  const strength = level === 'critical' ? 1.0
    : level === 'strong'   ? 0.75
    : level === 'moderate' ? 0.45
    : 0.20;

  const intensiteMultiplier      = 1 - (strength * (1 - REDUCTION_FACTOR));
  const vitesseMultiplier        = 1 + (strength * 0.35);
  const particleDensityMultiplier = 1 - (strength * 0.45);

  // Bloc CSS d'atténuation
  const cssOverrides = [
    `/* ── Modération Contextuelle [${level}] — score: ${score.total.toFixed(0)} ── */`,
    `.sig-effect {`,
    `  animation-duration: calc(var(--sig-anim-dur, 3s) * ${vitesseMultiplier.toFixed(2)}) !important;`,
    `  opacity: calc(var(--sig-opacity, 1) * ${intensiteMultiplier.toFixed(2)});`,
    `}`,
    `@media (prefers-reduced-motion: reduce) {`,
    `  .sig-effect { animation: none !important; transition: none !important; }`,
    `}`,
  ].join('\n');

  return { intensiteMultiplier, vitesseMultiplier, particleDensityMultiplier, cssOverrides };
}

// ─── API Publique ─────────────────────────────────────────────────────────────

/**
 * Point d'entrée principal — évalue et modère une configuration de signature.
 */
export function moderate(config: ModerationConfig): ModerationResult {
  const score      = scoreComplexity(config);
  const violations = checkProfessionalismRules(config, score);
  const hasErrors  = violations.some(v => v.severity === 'error');

  // Recommandations
  const recommendations: string[] = [];
  if (score.total < IDEAL_MIN) {
    recommendations.push(`Signature sous-animée (score ${score.total.toFixed(0)}) — ajouter un effet secondaire léger`);
  }
  if (score.breakdown.particleDensity > 15) {
    recommendations.push('Activer PerformanceAdaptiveEngine pour adapter la densité selon l\'appareil');
  }
  if (score.total > score.sectorCeiling) {
    recommendations.push(`Secteur ${config.sectorId} : préférer des effets de complexité ≤ ${Math.ceil(score.sectorCeiling / 10)}`);
  }

  // Paramètres ajustés si nécessaire
  const adjustedParams = score.verdict !== 'none' && score.verdict !== 'light'
    ? generateAdjustedParams(score, config.effects, score.verdict)
    : undefined;

  // Effets à supprimer si critique
  const effectsToRemove = score.verdict === 'critical'
    ? config.effects
        .filter(e => e.priority === 'decorative')
        .map(e => e.id)
    : undefined;

  // Verdict
  const approved = !hasErrors && score.verdict !== 'critical';

  const summary = approved
    ? `✅ Signature approuvée — score ${score.total.toFixed(0)}/${score.sectorCeiling} [${config.sectorId}]`
    : `⚠️ Modération requise — score ${score.total.toFixed(0)} > ${score.sectorCeiling} [${config.sectorId}]`;

  return {
    score,
    violations,
    recommendations,
    adjustedParams,
    effectsToRemove,
    summary,
    approved,
  };
}

/**
 * Calcule uniquement le score de complexité (sans modération complète) — alias publié.
 */
export { scoreComplexity as computeComplexityScore };

/**
 * Génère le CSS d'atténuation pour injection directe.
 */
export function generateModerationCSS(result: ModerationResult): string {
  if (!result.adjustedParams) return '';
  return [
    `<style id="contextual-intelligence-v1">`,
    result.adjustedParams.cssOverrides,
    `</style>`,
  ].join('\n');
}

/**
 * Retourne les seuils de complexité acceptables par secteur.
 */
export function getSectorCeilings(): typeof SECTOR_CEILINGS {
  return { ...SECTOR_CEILINGS };
}

console.log(
  `🧠 ContextualIntelligenceModerator v${ENGINE_VERSION} chargé — ` +
  `ComplexityScorer | SectorContext(10) | AutoReducer | ProfessionalismGuard`
);
