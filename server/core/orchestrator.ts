import { nlpProcessor } from "../ai-engine/nlp-processor";
import { parameterOptimizer } from "../ai-engine/parameter-optimizer";
import { decisionEngine } from "./decision-engine";
import { jsGenerator } from "../generator/js-generator";
import { particlesModule } from "../modules/particles.module";
import { physicsModule } from "../modules/physics.module";
import { lightingModule } from "../modules/lighting.module";
import { morphingModule } from "../modules/morphing.module";
import type { EffectAnalysis } from "@shared/schema";

class Orchestrator {
  async analyzeDescription(description: string): Promise<EffectAnalysis> {
    try {
      // Step 1: Extract concepts using NLP
      const concepts = await nlpProcessor.extractConcepts(description);
      
      // Step 2: Make module decisions
      const moduleDecisions = await decisionEngine.selectModules(concepts);
      
      // Step 3: Optimize parameters
      const parameters = await parameterOptimizer.optimizeParameters(concepts, moduleDecisions);
      
      // Step 4: Calculate complexity and duration
      const complexity = this.calculateComplexity(concepts, moduleDecisions);
      const estimatedDuration = this.estimateDuration(complexity);
      
      return {
        concepts: concepts.map(c => c.name),
        confidence: this.calculateConfidence(concepts),
        modules: moduleDecisions.map(m => m.name),
        parameters,
        complexity,
        estimatedDuration
      };
    } catch (error) {
      console.error("Orchestrator analysis error:", error);
      
      // Fallback analysis
      return {
        concepts: ["basic", "effect"],
        confidence: 0.5,
        modules: ["particles"],
        parameters: { basic: true },
        complexity: 3,
        estimatedDuration: 120
      };
    }
  }

  async generateEffect(description: string, platform: string, options: any): Promise<{ code: string; metadata: any }> {
    try {
      // Get analysis
      const analysis = await this.analyzeDescription(description);
      
      // Select appropriate modules
      const selectedModules = this.selectModulesForGeneration(analysis.modules);
      
      // Generate code based on platform
      const code = await this.generateCode(description, analysis, selectedModules, platform, options);
      
      const metadata = {
        analysis,
        modules: selectedModules.map(m => m.getName()),
        generatedAt: new Date().toISOString(),
        platform,
        estimatedPerformance: this.estimatePerformance(analysis.complexity)
      };
      
      return { code, metadata };
    } catch (error) {
      console.error("Effect generation error:", error);
      throw new Error("Failed to generate effect");
    }
  }

  private selectModulesForGeneration(moduleNames: string[]) {
    const modules = [];
    
    if (moduleNames.includes("particles")) {
      modules.push(particlesModule);
    }
    if (moduleNames.includes("physics")) {
      modules.push(physicsModule);
    }
    if (moduleNames.includes("lighting")) {
      modules.push(lightingModule);
    }
    if (moduleNames.includes("morphing")) {
      modules.push(morphingModule);
    }
    
    // Default to particles if no modules selected
    if (modules.length === 0) {
      modules.push(particlesModule);
    }
    
    return modules;
  }

  private async generateCode(
    description: string, 
    analysis: EffectAnalysis, 
    modules: any[], 
    platform: string, 
    options: any
  ): Promise<string> {
    switch (platform) {
      case "javascript":
      case "react":
      default:
        return await jsGenerator.generate(description, analysis, modules, options);
    }
  }

  private calculateComplexity(concepts: any[], modules: any[]): number {
    let complexity = 1;
    
    // Base complexity from number of concepts
    complexity += Math.min(concepts.length, 5);
    
    // Module complexity
    complexity += modules.length * 2;
    
    // Specific concept complexities
    const complexConcepts = ["physics", "lighting", "3d", "realistic", "advanced"];
    complexity += concepts.filter(c => 
      complexConcepts.some(cc => c.name.toLowerCase().includes(cc))
    ).length;
    
    return Math.min(Math.max(complexity, 1), 10);
  }

  private estimateDuration(complexity: number): number {
    // Base duration in seconds
    const baseDuration = 60;
    return baseDuration + (complexity * 20);
  }

  private calculateConfidence(concepts: any[]): number {
    if (concepts.length === 0) return 0.3;
    
    const avgConfidence = concepts.reduce((sum, c) => sum + c.confidence, 0) / concepts.length;
    return Math.min(Math.max(avgConfidence, 0.3), 0.95);
  }

  private estimatePerformance(complexity: number): string {
    if (complexity <= 3) return "high";
    if (complexity <= 6) return "medium";
    return "low";
  }
}

export const orchestrator = new Orchestrator();
