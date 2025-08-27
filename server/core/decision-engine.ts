
interface ModuleDecision {
  name: string;
  confidence: number;
  priority: number;
  reasoning: string[];
  performance_impact: number;
  complexity_score: number;
  synergy_boost: number;
}

interface DecisionContext {
  userIntent: string;
  performanceRequirement: 'high' | 'medium' | 'low';
  complexityBudget: number;
  platformConstraints: string[];
  previousChoices: string[];
}

class AdvancedDecisionEngine {
  private moduleNeuralWeights: Map<string, Map<string, number>> = new Map();
  private synergyMatrix: Map<string, Map<string, number>> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();
  private decisionHistory: ModuleDecision[][] = [];
  private adaptiveThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeNeuralWeights();
    this.initializeSynergyMatrix();
    this.initializeAdaptiveThresholds();
  }

  async selectModules(concepts: any[], context?: DecisionContext): Promise<ModuleDecision[]> {
    const decisions: ModuleDecision[] = [];
    
    // Enhanced module rules with neural network weights
    const advancedModuleRules = {
      particles: {
        keywords: ["particle", "explosion", "spark", "dust", "fire", "smoke", "snow", "rain", "debris", "fragment"],
        baseConfidence: 0.85,
        complexity: 1.2,
        performance_cost: 0.7,
        synergies: ["physics", "lighting"],
        anti_synergies: ["morphing"],
        neural_activations: {
          "explosion": 0.95,
          "fire": 0.9,
          "dust": 0.8,
          "spark": 0.85
        }
      },
      physics: {
        keywords: ["gravity", "bounce", "collision", "force", "velocity", "acceleration", "realistic", "mass", "momentum"],
        baseConfidence: 0.8,
        complexity: 1.8,
        performance_cost: 1.2,
        synergies: ["particles"],
        anti_synergies: [],
        neural_activations: {
          "gravity": 0.9,
          "collision": 0.85,
          "realistic": 0.8,
          "bounce": 0.8
        }
      },
      lighting: {
        keywords: ["light", "glow", "shine", "bright", "illuminate", "shadow", "flash", "beam", "volumetric", "ambient"],
        baseConfidence: 0.75,
        complexity: 1.5,
        performance_cost: 1.0,
        synergies: ["particles", "morphing"],
        anti_synergies: [],
        neural_activations: {
          "glow": 0.9,
          "illuminate": 0.85,
          "volumetric": 0.95,
          "shadow": 0.8
        }
      },
      morphing: {
        keywords: ["transform", "morph", "shape", "change", "transition", "animate", "deform", "evolve", "shift"],
        baseConfidence: 0.7,
        complexity: 1.4,
        performance_cost: 0.9,
        synergies: ["lighting"],
        anti_synergies: ["particles"],
        neural_activations: {
          "transform": 0.9,
          "morph": 0.95,
          "transition": 0.8,
          "evolve": 0.85
        }
      },
      fluid: {
        keywords: ["water", "liquid", "flow", "wave", "splash", "ripple", "fluid", "viscous"],
        baseConfidence: 0.8,
        complexity: 2.0,
        performance_cost: 1.4,
        synergies: ["physics", "lighting"],
        anti_synergies: [],
        neural_activations: {
          "water": 0.9,
          "fluid": 0.95,
          "viscous": 0.8,
          "flow": 0.85
        }
      },
      procedural: {
        keywords: ["random", "generated", "procedural", "algorithmic", "pattern", "fractal"],
        baseConfidence: 0.65,
        complexity: 1.6,
        performance_cost: 0.8,
        synergies: ["morphing"],
        anti_synergies: [],
        neural_activations: {
          "procedural": 0.9,
          "fractal": 0.95,
          "pattern": 0.8,
          "algorithmic": 0.85
        }
      }
    };

    // Neural network-like evaluation
    for (const [moduleName, rule] of Object.entries(advancedModuleRules)) {
      let activationScore = 0;
      let matchCount = 0;
      let reasoning: string[] = [];
      let contextualBoost = 1;

      // Calculate neural activation
      for (const concept of concepts) {
        const conceptText = concept.name.toLowerCase();
        
        // Direct neural activation
        if (rule.neural_activations[conceptText]) {
          activationScore += rule.neural_activations[conceptText] * concept.confidence;
          reasoning.push(`Strong neural activation for "${conceptText}" (${rule.neural_activations[conceptText]})`);
        }

        // Pattern matching with weighted importance
        const matches = rule.keywords.filter(keyword => 
          conceptText.includes(keyword.toLowerCase())
        );
        
        if (matches.length > 0) {
          const matchWeight = this.getConceptWeight(conceptText, moduleName);
          activationScore += concept.confidence * matches.length * matchWeight;
          matchCount += matches.length;
          reasoning.push(`Pattern match: "${conceptText}" -> ${matches.join(', ')}`);
        }
      }

      // Apply contextual reasoning
      if (context) {
        contextualBoost = this.calculateContextualBoost(moduleName, context, reasoning);
      }

      // Calculate performance impact
      const performanceImpact = this.calculatePerformanceImpact(rule, concepts.length);

      // Apply adaptive thresholds
      const adaptiveThreshold = this.adaptiveThresholds.get(moduleName) || 0.5;

      if (activationScore > 0 && matchCount > 0) {
        const baseConfidence = Math.min(
          rule.baseConfidence + (activationScore / Math.max(concepts.length, 1)) * 0.4,
          0.98
        );

        const finalConfidence = baseConfidence * contextualBoost;

        if (finalConfidence > adaptiveThreshold) {
          // Calculate synergy boost
          const synergyBoost = this.calculateSynergyBoost(moduleName, decisions, rule);

          const decision: ModuleDecision = {
            name: moduleName,
            confidence: Math.min(finalConfidence + synergyBoost, 0.98),
            priority: this.calculateAdvancedPriority(moduleName, finalConfidence, matchCount, rule),
            reasoning,
            performance_impact: performanceImpact,
            complexity_score: rule.complexity,
            synergy_boost: synergyBoost
          };

          decisions.push(decision);
        }
      }
    }

    // Apply advanced filtering and optimization
    const optimizedDecisions = this.optimizeDecisionSet(decisions, context);

    // Update learning weights based on decision patterns
    this.updateNeuralWeights(concepts, optimizedDecisions);

    // Store decision history for learning
    this.decisionHistory.push(optimizedDecisions);
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory = this.decisionHistory.slice(-500);
    }

    return optimizedDecisions;
  }

  private initializeNeuralWeights() {
    const modules = ['particles', 'physics', 'lighting', 'morphing', 'fluid', 'procedural'];
    const concepts = ['explosion', 'fire', 'water', 'light', 'gravity', 'transform'];

    for (const module of modules) {
      const weights = new Map<string, number>();
      for (const concept of concepts) {
        // Initialize with small random weights
        weights.set(concept, 0.5 + Math.random() * 0.3);
      }
      this.moduleNeuralWeights.set(module, weights);
    }
  }

  private initializeSynergyMatrix() {
    const synergyPairs = [
      ['particles', 'physics', 0.8],
      ['particles', 'lighting', 0.7],
      ['lighting', 'morphing', 0.6],
      ['physics', 'fluid', 0.9],
      ['morphing', 'procedural', 0.7]
    ];

    for (const [moduleA, moduleB, strength] of synergyPairs) {
      if (!this.synergyMatrix.has(moduleA)) {
        this.synergyMatrix.set(moduleA, new Map());
      }
      if (!this.synergyMatrix.has(moduleB)) {
        this.synergyMatrix.set(moduleB, new Map());
      }
      
      this.synergyMatrix.get(moduleA)!.set(moduleB, strength as number);
      this.synergyMatrix.get(moduleB)!.set(moduleA, strength as number);
    }
  }

  private initializeAdaptiveThresholds() {
    this.adaptiveThresholds.set('particles', 0.4);
    this.adaptiveThresholds.set('physics', 0.5);
    this.adaptiveThresholds.set('lighting', 0.45);
    this.adaptiveThresholds.set('morphing', 0.5);
    this.adaptiveThresholds.set('fluid', 0.6);
    this.adaptiveThresholds.set('procedural', 0.55);
  }

  private getConceptWeight(conceptName: string, moduleName: string): number {
    const weights = this.moduleNeuralWeights.get(moduleName);
    return weights?.get(conceptName) || 0.5;
  }

  private calculateContextualBoost(moduleName: string, context: DecisionContext, reasoning: string[]): number {
    let boost = 1.0;

    // Performance requirement consideration
    if (context.performanceRequirement === 'high') {
      const lowImpactModules = ['morphing', 'procedural'];
      if (lowImpactModules.includes(moduleName)) {
        boost *= 1.2;
        reasoning.push(`Performance boost: high performance requirement favors ${moduleName}`);
      }
    }

    // Complexity budget consideration
    const complexityPenalty = {
      'particles': 0.1,
      'physics': 0.3,
      'lighting': 0.2,
      'morphing': 0.15,
      'fluid': 0.35,
      'procedural': 0.2
    };

    const penalty = complexityPenalty[moduleName] || 0.1;
    if (context.complexityBudget < 5) {
      boost *= Math.max(0.5, 1 - penalty);
      reasoning.push(`Complexity penalty: ${penalty} for low complexity budget`);
    }

    // Previous choices influence
    if (context.previousChoices.includes(moduleName)) {
      boost *= 0.8; // Slight penalty for repeated choices
      reasoning.push(`Repetition penalty: module was used recently`);
    }

    return boost;
  }

  private calculatePerformanceImpact(rule: any, conceptCount: number): number {
    const baseImpact = rule.performance_cost || 1.0;
    const conceptMultiplier = Math.min(conceptCount / 5, 2.0);
    return baseImpact * conceptMultiplier;
  }

  private calculateSynergyBoost(moduleName: string, existingDecisions: ModuleDecision[], rule: any): number {
    let synergyBoost = 0;

    // Check for positive synergies
    for (const decision of existingDecisions) {
      const synergyStrength = this.synergyMatrix.get(moduleName)?.get(decision.name);
      if (synergyStrength) {
        synergyBoost += synergyStrength * 0.1;
      }
    }

    // Check for anti-synergies
    for (const decision of existingDecisions) {
      if (rule.anti_synergies.includes(decision.name)) {
        synergyBoost -= 0.15;
      }
    }

    return Math.max(-0.3, Math.min(0.3, synergyBoost));
  }

  private calculateAdvancedPriority(moduleName: string, confidence: number, matchCount: number, rule: any): number {
    const basePriorities = {
      particles: 100,
      physics: 90,
      lighting: 80,
      morphing: 70,
      fluid: 85,
      procedural: 60
    };

    const basePriority = basePriorities[moduleName] || 50;
    const confidenceBoost = confidence * 100;
    const matchBoost = Math.min(matchCount * 20, 100);
    const complexityPenalty = rule.complexity * 10;

    return Math.floor(basePriority + confidenceBoost + matchBoost - complexityPenalty);
  }

  private optimizeDecisionSet(decisions: ModuleDecision[], context?: DecisionContext): ModuleDecision[] {
    // Sort by priority and confidence
    decisions.sort((a, b) => {
      const scoreA = a.priority + (a.confidence * 100) + (a.synergy_boost * 50);
      const scoreB = b.priority + (b.confidence * 100) + (b.synergy_boost * 50);
      return scoreB - scoreA;
    });

    // Apply budget constraints
    if (context?.complexityBudget) {
      const budget = context.complexityBudget;
      let currentComplexity = 0;
      const budgetedDecisions: ModuleDecision[] = [];

      for (const decision of decisions) {
        if (currentComplexity + decision.complexity_score <= budget) {
          budgetedDecisions.push(decision);
          currentComplexity += decision.complexity_score;
        }
      }

      if (budgetedDecisions.length > 0) {
        return budgetedDecisions.slice(0, 4);
      }
    }

    // Return top modules with confidence > adaptive threshold
    return decisions
      .filter(d => d.confidence > (this.adaptiveThresholds.get(d.name) || 0.5))
      .slice(0, 4);
  }

  private updateNeuralWeights(concepts: any[], decisions: ModuleDecision[]) {
    // Simple hebbian learning: strengthen connections for selected modules
    for (const decision of decisions) {
      const weights = this.moduleNeuralWeights.get(decision.name);
      if (weights) {
        for (const concept of concepts) {
          const currentWeight = weights.get(concept.name) || 0.5;
          const learningRate = 0.01;
          const newWeight = currentWeight + learningRate * concept.confidence;
          weights.set(concept.name, Math.min(1.0, Math.max(0.1, newWeight)));
        }
      }
    }

    // Update adaptive thresholds based on success patterns
    for (const decision of decisions) {
      const currentThreshold = this.adaptiveThresholds.get(decision.name) || 0.5;
      const adjustment = decision.confidence > 0.8 ? -0.001 : 0.002;
      const newThreshold = Math.min(0.8, Math.max(0.2, currentThreshold + adjustment));
      this.adaptiveThresholds.set(decision.name, newThreshold);
    }
  }

  // Performance tracking methods
  public recordModulePerformance(moduleName: string, performance: number) {
    if (!this.performanceHistory.has(moduleName)) {
      this.performanceHistory.set(moduleName, []);
    }
    
    const history = this.performanceHistory.get(moduleName)!;
    history.push(performance);
    
    if (history.length > 100) {
      history.splice(0, history.length - 50);
    }
  }

  public getDecisionMetrics() {
    return {
      totalDecisions: this.decisionHistory.length,
      averageModulesPerDecision: this.decisionHistory.length > 0 
        ? this.decisionHistory.reduce((sum, decisions) => sum + decisions.length, 0) / this.decisionHistory.length 
        : 0,
      neuralWeightDiversity: this.moduleNeuralWeights.size,
      adaptiveThresholds: Object.fromEntries(this.adaptiveThresholds),
      synergyConnections: this.synergyMatrix.size
    };
  }

  public exportLearningState() {
    return {
      neuralWeights: Object.fromEntries(
        Array.from(this.moduleNeuralWeights.entries()).map(([key, map]) => 
          [key, Object.fromEntries(map)]
        )
      ),
      synergyMatrix: Object.fromEntries(
        Array.from(this.synergyMatrix.entries()).map(([key, map]) => 
          [key, Object.fromEntries(map)]
        )
      ),
      adaptiveThresholds: Object.fromEntries(this.adaptiveThresholds),
      performanceHistory: Object.fromEntries(this.performanceHistory)
    };
  }
}

export const decisionEngine = new AdvancedDecisionEngine();
