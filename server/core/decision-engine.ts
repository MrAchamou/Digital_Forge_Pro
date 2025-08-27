interface ModuleDecision {
  name: string;
  confidence: number;
  priority: number;
}

class DecisionEngine {
  async selectModules(concepts: any[]): Promise<ModuleDecision[]> {
    const decisions: ModuleDecision[] = [];
    
    // Module selection rules based on concepts
    const moduleRules = {
      particles: {
        keywords: ["particle", "explosion", "spark", "dust", "fire", "smoke", "snow", "rain"],
        baseConfidence: 0.8
      },
      physics: {
        keywords: ["gravity", "bounce", "collision", "force", "velocity", "acceleration", "realistic"],
        baseConfidence: 0.7
      },
      lighting: {
        keywords: ["light", "glow", "shine", "bright", "illuminate", "shadow", "flash", "beam"],
        baseConfidence: 0.6
      },
      morphing: {
        keywords: ["transform", "morph", "shape", "change", "transition", "animate", "deform"],
        baseConfidence: 0.5
      }
    };
    
    // Evaluate each module
    for (const [moduleName, rule] of Object.entries(moduleRules)) {
      let confidence = 0;
      let matchCount = 0;
      
      for (const concept of concepts) {
        const conceptText = concept.name.toLowerCase();
        const matches = rule.keywords.filter(keyword => 
          conceptText.includes(keyword.toLowerCase())
        );
        
        if (matches.length > 0) {
          confidence += concept.confidence * matches.length;
          matchCount += matches.length;
        }
      }
      
      if (matchCount > 0) {
        const normalizedConfidence = Math.min(
          rule.baseConfidence + (confidence / matchCount) * 0.3,
          0.95
        );
        
        decisions.push({
          name: moduleName,
          confidence: normalizedConfidence,
          priority: this.calculatePriority(moduleName, normalizedConfidence, matchCount)
        });
      }
    }
    
    // Sort by priority and confidence
    decisions.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.confidence - a.confidence;
    });
    
    // Return top modules with confidence > 0.5
    return decisions.filter(d => d.confidence > 0.5).slice(0, 3);
  }

  private calculatePriority(moduleName: string, confidence: number, matchCount: number): number {
    const basePriorities = {
      particles: 100,
      physics: 80,
      lighting: 60,
      morphing: 40
    };
    
    const basePriority = (basePriorities as any)[moduleName] || 50;
    return Math.floor(basePriority + (confidence * 50) + (matchCount * 10));
  }
}

export const decisionEngine = new DecisionEngine();
