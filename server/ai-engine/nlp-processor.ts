interface Concept {
  name: string;
  confidence: number;
  category: string;
}

class NLPProcessor {
  async extractConcepts(description: string): Promise<Concept[]> {
    const concepts: Concept[] = [];
    const text = description.toLowerCase();
    
    // Predefined concept patterns
    const conceptPatterns = {
      // Visual effects
      explosion: { 
        patterns: ["explod", "burst", "blast", "boom"], 
        confidence: 0.9, 
        category: "effect" 
      },
      particles: { 
        patterns: ["particle", "dust", "spark", "debris", "fragment"], 
        confidence: 0.8, 
        category: "visual" 
      },
      fire: { 
        patterns: ["fire", "flame", "burn", "heat", "ember"], 
        confidence: 0.9, 
        category: "element" 
      },
      water: { 
        patterns: ["water", "liquid", "splash", "wave", "flow"], 
        confidence: 0.8, 
        category: "element" 
      },
      light: { 
        patterns: ["light", "glow", "shine", "bright", "illuminate"], 
        confidence: 0.7, 
        category: "visual" 
      },
      
      // Colors
      red: { 
        patterns: ["red", "crimson", "scarlet"], 
        confidence: 0.9, 
        category: "color" 
      },
      blue: { 
        patterns: ["blue", "cyan", "azure"], 
        confidence: 0.9, 
        category: "color" 
      },
      green: { 
        patterns: ["green", "emerald", "lime"], 
        confidence: 0.9, 
        category: "color" 
      },
      yellow: { 
        patterns: ["yellow", "gold", "amber"], 
        confidence: 0.9, 
        category: "color" 
      },
      purple: { 
        patterns: ["purple", "violet", "magenta"], 
        confidence: 0.9, 
        category: "color" 
      },
      orange: { 
        patterns: ["orange", "coral"], 
        confidence: 0.9, 
        category: "color" 
      },
      
      // Movement
      fast: { 
        patterns: ["fast", "quick", "rapid", "speed"], 
        confidence: 0.8, 
        category: "movement" 
      },
      slow: { 
        patterns: ["slow", "gradual", "gentle"], 
        confidence: 0.8, 
        category: "movement" 
      },
      spiral: { 
        patterns: ["spiral", "swirl", "twist", "rotate"], 
        confidence: 0.8, 
        category: "movement" 
      },
      
      // Physics
      gravity: { 
        patterns: ["gravity", "fall", "drop", "sink"], 
        confidence: 0.8, 
        category: "physics" 
      },
      bounce: { 
        patterns: ["bounce", "elastic", "rebound"], 
        confidence: 0.8, 
        category: "physics" 
      },
      
      // Duration
      short: { 
        patterns: ["brief", "quick", "instant", "flash"], 
        confidence: 0.7, 
        category: "duration" 
      },
      long: { 
        patterns: ["long", "extended", "lasting", "persistent"], 
        confidence: 0.7, 
        category: "duration" 
      },
      
      // Size
      large: { 
        patterns: ["large", "big", "huge", "massive"], 
        confidence: 0.8, 
        category: "size" 
      },
      small: { 
        patterns: ["small", "tiny", "mini", "little"], 
        confidence: 0.8, 
        category: "size" 
      },
      
      // Transitions
      fade: { 
        patterns: ["fade", "dissolve", "disappear"], 
        confidence: 0.8, 
        category: "transition" 
      },
      appear: { 
        patterns: ["appear", "emerge", "materialize"], 
        confidence: 0.8, 
        category: "transition" 
      }
    };
    
    // Extract concepts based on patterns
    for (const [conceptName, config] of Object.entries(conceptPatterns)) {
      let matchCount = 0;
      let totalMatches = 0;
      
      for (const pattern of config.patterns) {
        const matches = (text.match(new RegExp(pattern, 'gi')) || []).length;
        if (matches > 0) {
          matchCount++;
          totalMatches += matches;
        }
      }
      
      if (matchCount > 0) {
        // Adjust confidence based on match strength
        const matchStrength = Math.min(totalMatches / config.patterns.length, 2);
        const adjustedConfidence = Math.min(config.confidence * matchStrength, 0.95);
        
        concepts.push({
          name: conceptName,
          confidence: adjustedConfidence,
          category: config.category
        });
      }
    }
    
    // Add context-based concepts
    this.addContextualConcepts(text, concepts);
    
    // Sort by confidence
    concepts.sort((a, b) => b.confidence - a.confidence);
    
    return concepts;
  }

  private addContextualConcepts(text: string, concepts: Concept[]) {
    // Add concepts based on combinations
    const hasParticles = concepts.some(c => c.name === "particles");
    const hasFire = concepts.some(c => c.name === "fire");
    const hasExplosion = concepts.some(c => c.name === "explosion");
    
    // If explosion + particles, boost particle confidence
    if (hasExplosion && hasParticles) {
      const particleConcept = concepts.find(c => c.name === "particles");
      if (particleConcept) {
        particleConcept.confidence = Math.min(particleConcept.confidence + 0.1, 0.95);
      }
    }
    
    // If fire + particles, suggest combustion
    if (hasFire && hasParticles) {
      concepts.push({
        name: "combustion",
        confidence: 0.7,
        category: "effect"
      });
    }
    
    // Duration analysis
    if (text.includes("second") || text.includes("minute")) {
      const durationMatch = text.match(/(\d+)\s*(second|minute|sec|min)/i);
      if (durationMatch) {
        const duration = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        const seconds = unit.startsWith('min') ? duration * 60 : duration;
        
        concepts.push({
          name: "timed_duration",
          confidence: 0.9,
          category: "duration"
        });
      }
    }
    
    // Intensity analysis
    const intensityWords = ["intense", "powerful", "strong", "weak", "subtle", "gentle"];
    for (const word of intensityWords) {
      if (text.includes(word)) {
        concepts.push({
          name: `intensity_${word}`,
          confidence: 0.6,
          category: "intensity"
        });
      }
    }
  }
}

export const nlpProcessor = new NLPProcessor();
