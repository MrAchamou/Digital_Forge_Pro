import { parameterOptimizer } from "../ai-engine/parameter-optimizer";
import { jsGenerator } from "../generator/js-generator";
import { particlesModule } from "../modules/particles.module";
import { physicsModule } from "../modules/physics.module";
import { lightingModule } from "../modules/lighting.module";
import { morphingModule } from "../modules/morphing.module";
// Mocking AI Engine, Decision Engine, and Template Engine for demonstration
const aiEngine = {
    extractConcepts: async (description) => {
        console.log(`AI Engine: Extracting concepts for "${description}"`);
        // Simulate NLP processing
        if (description.includes("fire"))
            return [{ name: "fire", confidence: 0.8, type: "element" }];
        if (description.includes("water"))
            return [{ name: "water", confidence: 0.7, type: "element" }];
        if (description.includes("particles"))
            return [{ name: "particles", confidence: 0.9, type: "effect" }];
        if (description.includes("physics"))
            return [{ name: "physics", confidence: 0.8, type: "simulation" }];
        if (description.includes("lighting"))
            return [{ name: "lighting", confidence: 0.7, type: "visual" }];
        return [{ name: "generic", confidence: 0.5, type: "effect" }];
    }
};
const decisionEngine = {
    selectModules: async (concepts, context) => {
        console.log("Decision Engine: Selecting modules with context:", context);
        const selected = [];
        const conceptNames = concepts.map(c => c.name);
        if (conceptNames.includes("fire") || context.userIntent.includes("fire")) {
            selected.push({ name: "particles", getName: () => "particles" }); // Mock module object
        }
        if (conceptNames.includes("water") || context.userIntent.includes("water")) {
            selected.push({ name: "physics", getName: () => "physics" }); // Mock module object
        }
        if (conceptNames.includes("particles") || context.userIntent.includes("particles")) {
            selected.push({ name: "particles", getName: () => "particles" }); // Mock module object
        }
        if (conceptNames.includes("physics") || context.userIntent.includes("physics")) {
            selected.push({ name: "physics", getName: () => "physics" }); // Mock module object
        }
        if (conceptNames.includes("lighting") || context.userIntent.includes("lighting")) {
            selected.push({ name: "lighting", getName: () => "lighting" }); // Mock module object
        }
        // Fallback if no modules are selected based on concepts
        if (selected.length === 0 && context.userIntent) {
            if (context.userIntent.includes("animation")) {
                selected.push({ name: "morphing", getName: () => "morphing" });
            }
            else {
                selected.push({ name: "particles", getName: () => "particles" });
            }
        }
        // Ensure unique modules
        const uniqueModules = Array.from(new Map(selected.map(item => [item.name, item])).values());
        return uniqueModules;
    }
};
const templateEngine = {
    optimize: async (code, platform) => {
        console.log(`Template Engine: Optimizing code for ${platform}`);
        // Simulate optimization
        return code.replace(/\s+/g, ' ').trim();
    }
};
class Orchestrator {
    aiEngine;
    decisionEngine;
    jsGenerator;
    templateEngine;
    modules;
    constructor() {
        // Initialize dependencies (replace with actual imports/dependency injection in a real app)
        this.aiEngine = aiEngine; // Mocked AI Engine
        this.decisionEngine = decisionEngine; // Mocked Decision Engine
        this.jsGenerator = jsGenerator; // Assume jsGenerator is correctly imported
        this.templateEngine = templateEngine; // Mocked Template Engine
        this.modules = {
            particles: particlesModule,
            physics: physicsModule,
            lighting: lightingModule,
            morphing: morphingModule,
        };
    }
    async analyzeDescription(description) {
        try {
            // Step 1: Extract concepts using NLP
            const concepts = await this.aiEngine.extractConcepts(description);
            // Step 2: Make module decisions
            const moduleDecisions = await this.decisionEngine.selectModules(concepts, { userIntent: description });
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
        }
        catch (error) {
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
    async generateEffect(description, platform = "javascript", options = {}) {
        try {
            // Validation des entrées
            if (!description || description.trim().length < 3) {
                throw new Error("Description trop courte pour générer un effet");
            }
            // Extraction de concepts avec IA avancée
            const concepts = await this.aiEngine.extractConcepts(description);
            if (!concepts || concepts.length === 0) {
                throw new Error("Impossible d'extraire des concepts de la description");
            }
            // Contexte enrichi pour la sélection de modules
            const decisionContext = {
                userIntent: description,
                performanceRequirement: options.performance || 'medium',
                complexityBudget: options.complexity || 10,
                platformConstraints: [platform],
                previousChoices: options.previousModules || []
            };
            // Sélection intelligente des modules
            const selectedModules = await this.decisionEngine.selectModules(concepts, decisionContext);
            if (!selectedModules || selectedModules.length === 0) {
                throw new Error("Aucun module approprié trouvé pour cette description");
            }
            // Génération parallèle avec gestion d'erreurs
            const results = await Promise.allSettled(selectedModules.map(module => this.generateModuleEffectWithRetry(module, concepts, platform, options)));
            // Filtrage des résultats réussis
            const successfulResults = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            if (successfulResults.length === 0) {
                throw new Error("Échec de génération de tous les modules");
            }
            // Combinaison et optimisation du code
            const combinedCode = this.combineResults(successfulResults);
            const optimizedCode = await this.templateEngine.optimize(combinedCode, platform);
            // Validation automatique du code généré
            const validationResult = await this.validateGeneratedCode(optimizedCode, description);
            return {
                code: optimizedCode,
                metadata: {
                    modules: selectedModules.map(m => m.name),
                    confidence: this.calculateConfidence(selectedModules),
                    performance: await this.estimatePerformance(optimizedCode),
                    platform,
                    validation: validationResult,
                    generationTime: Date.now(),
                    concepts: concepts.map(c => c.name),
                    warnings: this.extractWarnings(results)
                }
            };
        }
        catch (error) {
            console.error("Erreur dans generateEffect:", error);
            // Génération de code de secours
            const fallbackCode = await this.generateFallbackCode(description, platform);
            return {
                code: fallbackCode,
                metadata: {
                    modules: ['fallback'],
                    confidence: 0.3,
                    performance: { score: 50, warnings: ['Fallback mode'] },
                    platform,
                    error: error.message,
                    isFallback: true
                }
            };
        }
    }
    // Helper to generate effect for a single module
    async generateModuleEffect(module, concepts, platform, options) {
        console.log(`Generating effect for module: ${module.name}`);
        // In a real scenario, you'd call the specific module's generation logic
        // For demonstration, we'll use a placeholder that returns a simple string
        if (this.jsGenerator && this.jsGenerator.generate) {
            return await this.jsGenerator.generate(concepts.map(c => c.name).join(' ') + ' ' + concepts.map(c => c.type).join(' '), // Simplified description for generator
            { concepts: concepts.map(c => c.name), modules: [module.name], parameters: { /* optimized params */} }, [module], // Pass the module itself
            options);
        }
        else {
            return `// Generated code for ${module.name} based on concepts: ${concepts.map(c => c.name).join(', ')}`;
        }
    }
    async generateModuleEffectWithRetry(module, concepts, platform, options, retries = 2) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                // Ensure we are calling the correct generateModuleEffect or a specific module's method
                // For this mock, we'll just use the placeholder generateModuleEffect
                return await this.generateModuleEffect(module, concepts, platform, options);
            }
            catch (error) {
                if (attempt === retries) {
                    console.error(`Failed to generate effect for module ${module.name} after ${retries + 1} attempts:`, error);
                    throw error;
                }
                console.warn(`Retry ${attempt + 1} for module ${module.name}:`, error.message);
                await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1))); // Exponential backoff
            }
        }
    }
    async validateGeneratedCode(code, originalDescription) {
        try {
            // Validation syntaxique basique
            const syntaxValid = this.validateSyntax(code);
            // Validation sémantique (cohérence avec description)
            const semanticValid = await this.validateSemantics(code, originalDescription);
            // Validation de sécurité
            const securityValid = this.validateSecurity(code);
            return {
                isValid: syntaxValid && semanticValid && securityValid,
                syntax: syntaxValid,
                semantic: semanticValid,
                security: securityValid,
                score: (syntaxValid ? 0.4 : 0) + (semanticValid ? 0.4 : 0) + (securityValid ? 0.2 : 0)
            };
        }
        catch (error) {
            return {
                isValid: false,
                error: error.message,
                score: 0
            };
        }
    }
    validateSyntax(code) {
        try {
            // Validation basique de la syntaxe JavaScript
            // In a real environment, you might use a more robust parser like Acorn or Esprima
            new Function(code);
            return true;
        }
        catch (e) {
            console.error("Syntax validation failed:", e);
            return false;
        }
    }
    async validateSemantics(code, description) {
        // Validation sémantique simple basée sur des mots-clés
        const descriptionWords = description.toLowerCase().split(/\s+/);
        const codeContent = code.toLowerCase();
        const relevantWords = descriptionWords.filter(word => word.length > 3 && !['the', 'and', 'with', 'that', 'this', 'for', 'a', 'is', 'it', 'of', 'to'].includes(word));
        if (relevantWords.length === 0)
            return true; // Cannot validate semantics if no relevant words
        const matchCount = relevantWords.filter(word => codeContent.includes(word)).length;
        const threshold = Math.max(Math.min(relevantWords.length * 0.3, 5), 2); // Ensure at least 2 matches or 30%
        return matchCount >= threshold;
    }
    validateSecurity(code) {
        const dangerousPatterns = [
            /eval\s*\(/,
            /document\.write\s*\(/,
            /innerHTML\s*=\s*.*\+\s*\(/, // More specific to avoid false positives
            /exec\s*\(/,
            /require\s*\(/ // Potentially dangerous if not controlled
        ];
        const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(code));
        if (hasDangerousPattern) {
            console.error("Security validation failed: Dangerous pattern detected.");
        }
        return !hasDangerousPattern;
    }
    extractWarnings(results) {
        const warnings = [];
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                // Attempt to get a meaningful error message
                const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
                warnings.push(`Module ${index} failed: ${errorMessage}`);
            }
        });
        return warnings;
    }
    async generateFallbackCode(description, platform) {
        // Code de secours basique
        const fallbackTemplate = `
// Generated fallback effect for: ${description}
// Platform: ${platform}
function createEffect() {
  console.log("Fallback Effect: ${description}");
  const element = document.createElement('div');
  element.style.padding = '20px';
  element.style.border = '2px dashed grey';
  element.style.textAlign = 'center';
  element.textContent = 'Fallback Effect: ${description}';
  document.body.appendChild(element); // Append to body for visibility

  return {
    type: "fallback",
    description: "${description}",
    platform: "${platform}",
    created: new Date(),
    cleanup: () => {
      console.log("Cleaning up fallback effect");
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  };
}

// Initialize effect
const effect = createEffect();
// Example of how to use the effect object
// console.log(effect); 
// if (effect.cleanup) effect.cleanup(); // Example cleanup call

export default effect;
`;
        return fallbackTemplate;
    }
    // The rest of the original methods remain unchanged but are included for completeness
    // (analyzeDescription, selectModulesForGeneration, generateCode, calculateComplexity, estimateDuration, calculateConfidence, estimatePerformance)
    selectModulesForGeneration(moduleNames) {
        const modules = [];
        if (moduleNames.includes("particles")) {
            modules.push(this.modules.particles);
        }
        if (moduleNames.includes("physics")) {
            modules.push(this.modules.physics);
        }
        if (moduleNames.includes("lighting")) {
            modules.push(this.modules.lighting);
        }
        if (moduleNames.includes("morphing")) {
            modules.push(this.modules.morphing);
        }
        // Default to particles if no modules selected
        if (modules.length === 0) {
            modules.push(this.modules.particles);
        }
        return modules;
    }
    async generateCode(description, analysis, modules, platform, options) {
        switch (platform) {
            case "javascript":
            case "react":
            default:
                // Assuming jsGenerator.generate expects the analysis object and modules array
                return await this.jsGenerator.generate(description, analysis, modules, options);
        }
    }
    calculateComplexity(concepts, modules) {
        let complexity = 1;
        // Base complexity from number of concepts
        complexity += Math.min(concepts.length, 5);
        // Module complexity
        complexity += modules.length * 2;
        // Specific concept complexities
        const complexConcepts = ["physics", "lighting", "3d", "realistic", "advanced", "simulation", "complex"];
        complexity += concepts.filter(c => complexConcepts.some(cc => c.name.toLowerCase().includes(cc))).length;
        // Consider the type of concepts too
        const conceptTypes = ["simulation", "complex", "advanced"];
        complexity += concepts.filter(c => conceptTypes.some(ct => c.type && c.type.toLowerCase().includes(ct))).length * 1.5; // Higher weight for complex types
        return Math.min(Math.max(complexity, 1), 10);
    }
    estimateDuration(complexity) {
        // Base duration in seconds
        const baseDuration = 60;
        return baseDuration + (complexity * 20);
    }
    calculateConfidence(modules) {
        if (!modules || modules.length === 0)
            return 0.3;
        // Simplified confidence calculation based on number of modules selected
        // In a real scenario, this would be more sophisticated, possibly using concept confidences
        const confidence = Math.min(0.5 + modules.length * 0.15, 0.95);
        return Math.max(confidence, 0.3);
    }
    estimatePerformance(code) {
        // Placeholder for performance estimation based on code analysis
        // In a real scenario, this would involve static code analysis or profiling
        let score = 50; // Default score
        const warnings = [];
        if (code.length > 2000) { // Arbitrary length check
            score -= 10;
            warnings.push("Code is quite long, potential performance impact.");
        }
        if (code.includes("requestAnimationFrame")) {
            score += 5; // Suggests potentially better rendering loop
        }
        if (code.includes("setInterval") || code.includes("setTimeout")) {
            warnings.push("Use of setInterval/setTimeout might impact performance if not managed carefully.");
        }
        if (code.includes("heavy computation")) { // Example of a keyword that might indicate performance issues
            score -= 15;
            warnings.push("Contains heavy computation, may impact performance.");
        }
        return { score: Math.max(0, Math.min(100, score)), warnings };
    }
    combineResults(results) {
        console.log("Combining results...");
        // This is a simplistic combination. A real implementation would need to handle dependencies,
        // scope, and potential conflicts between module code.
        return results.join("\n\n");
    }
}
export const orchestrator = new Orchestrator();
