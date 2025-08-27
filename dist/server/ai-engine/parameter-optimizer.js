class ParameterOptimizer {
    async optimizeParameters(concepts, modules) {
        const parameters = {};
        // Base parameters
        parameters.quality = "high";
        parameters.performance = "optimized";
        // Optimize based on concepts
        for (const concept of concepts) {
            this.optimizeForConcept(concept, parameters);
        }
        // Optimize based on modules
        for (const module of modules) {
            this.optimizeForModule(module, parameters);
        }
        // Apply cross-parameter optimizations
        this.applyCrossOptimizations(parameters);
        return parameters;
    }
    optimizeForConcept(concept, parameters) {
        const conceptName = concept.name.toLowerCase();
        const confidence = concept.confidence;
        switch (conceptName) {
            case "explosion":
                parameters.particleCount = Math.floor(100 + (confidence * 200));
                parameters.explosionForce = 5 + (confidence * 5);
                parameters.duration = 2000 + (confidence * 2000);
                break;
            case "particles":
                parameters.particleCount = Math.floor(50 + (confidence * 150));
                parameters.particleSize = 2 + (confidence * 4);
                break;
            case "fire":
                parameters.colors = ["#ff4500", "#ff6b35", "#f7941e", "#fff200"];
                parameters.heat = 0.5 + (confidence * 0.4);
                parameters.flicker = true;
                break;
            case "water":
                parameters.colors = ["#0077be", "#00a8cc", "#87ceeb"];
                parameters.viscosity = 0.7 + (confidence * 0.3);
                parameters.flow = true;
                break;
            case "gravity":
                parameters.gravity = 0.1 + (confidence * 0.4);
                parameters.physics = true;
                break;
            case "fast":
                parameters.speed = 2 + (confidence * 3);
                parameters.velocity = 1.5 + (confidence * 2);
                break;
            case "slow":
                parameters.speed = Math.max(0.2, 1 - (confidence * 0.7));
                parameters.velocity = Math.max(0.1, 1 - (confidence * 0.8));
                break;
            case "large":
                parameters.scale = 1.5 + (confidence * 1);
                parameters.particleSize = (parameters.particleSize || 3) * (1 + confidence);
                break;
            case "small":
                parameters.scale = Math.max(0.3, 1 - (confidence * 0.6));
                parameters.particleSize = (parameters.particleSize || 3) * Math.max(0.3, 1 - confidence * 0.7);
                break;
            // Color optimizations
            case "red":
                parameters.colors = ["#ff0000", "#cc0000", "#ff3333"];
                break;
            case "blue":
                parameters.colors = ["#0077ff", "#0055cc", "#3388ff"];
                break;
            case "green":
                parameters.colors = ["#00ff00", "#00cc00", "#33ff33"];
                break;
            case "yellow":
                parameters.colors = ["#ffff00", "#ffcc00", "#ffff33"];
                break;
            case "purple":
                parameters.colors = ["#8000ff", "#6600cc", "#9933ff"];
                break;
            case "orange":
                parameters.colors = ["#ff8000", "#ff6600", "#ff9933"];
                break;
        }
    }
    optimizeForModule(module, parameters) {
        const moduleName = module.name.toLowerCase();
        switch (moduleName) {
            case "particles":
                parameters.renderMode = "additive";
                parameters.blending = "lighter";
                if (!parameters.particleCount) {
                    parameters.particleCount = 100;
                }
                break;
            case "physics":
                parameters.physics = true;
                parameters.collision = true;
                parameters.gravity = parameters.gravity || 0.2;
                parameters.damping = 0.99;
                break;
            case "lighting":
                parameters.lighting = true;
                parameters.shadows = true;
                parameters.glowEffect = true;
                parameters.lightIntensity = 0.8;
                break;
            case "morphing":
                parameters.morphing = true;
                parameters.interpolation = "smooth";
                parameters.morphSpeed = 1.0;
                parameters.easing = "easeInOutQuad";
                break;
        }
    }
    applyCrossOptimizations(parameters) {
        // Performance vs Quality trade-offs
        if (parameters.particleCount > 300) {
            parameters.performance = "medium";
            if (parameters.particleCount > 500) {
                parameters.performance = "low";
            }
        }
        // Auto-adjust frame rate targets
        if (parameters.performance === "high") {
            parameters.targetFPS = 60;
        }
        else if (parameters.performance === "medium") {
            parameters.targetFPS = 30;
        }
        else {
            parameters.targetFPS = 24;
        }
        // Color harmony adjustments
        if (parameters.colors && parameters.colors.length > 1) {
            parameters.colorHarmony = "complementary";
        }
        // Duration adjustments based on complexity
        const complexity = this.calculateComplexity(parameters);
        if (complexity > 7 && !parameters.duration) {
            parameters.duration = 3000; // 3 seconds for complex effects
        }
        else if (!parameters.duration) {
            parameters.duration = 2000; // 2 seconds default
        }
        // Memory optimization
        if (parameters.particleCount > 200) {
            parameters.particlePooling = true;
            parameters.memoryOptimization = true;
        }
    }
    calculateComplexity(parameters) {
        let complexity = 1;
        // Particle count complexity
        if (parameters.particleCount) {
            complexity += Math.min(parameters.particleCount / 100, 5);
        }
        // Feature complexity
        if (parameters.physics)
            complexity += 2;
        if (parameters.lighting)
            complexity += 2;
        if (parameters.morphing)
            complexity += 1;
        if (parameters.collision)
            complexity += 1;
        if (parameters.shadows)
            complexity += 1;
        return Math.min(complexity, 10);
    }
}
export const parameterOptimizer = new ParameterOptimizer();
