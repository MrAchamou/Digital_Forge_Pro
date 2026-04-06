var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ParameterOptimizer = /** @class */ (function () {
    function ParameterOptimizer() {
    }
    ParameterOptimizer.prototype.optimizeParameters = function (concepts, modules) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, _i, concepts_1, concept, _a, modules_1, module_1;
            return __generator(this, function (_b) {
                parameters = {};
                // Base parameters
                parameters.quality = "high";
                parameters.performance = "optimized";
                // Optimize based on concepts
                for (_i = 0, concepts_1 = concepts; _i < concepts_1.length; _i++) {
                    concept = concepts_1[_i];
                    this.optimizeForConcept(concept, parameters);
                }
                // Optimize based on modules
                for (_a = 0, modules_1 = modules; _a < modules_1.length; _a++) {
                    module_1 = modules_1[_a];
                    this.optimizeForModule(module_1, parameters);
                }
                // Apply cross-parameter optimizations
                this.applyCrossOptimizations(parameters);
                return [2 /*return*/, parameters];
            });
        });
    };
    ParameterOptimizer.prototype.optimizeForConcept = function (concept, parameters) {
        var conceptName = concept.name.toLowerCase();
        var confidence = concept.confidence;
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
    };
    ParameterOptimizer.prototype.optimizeForModule = function (module, parameters) {
        var moduleName = module.name.toLowerCase();
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
    };
    ParameterOptimizer.prototype.applyCrossOptimizations = function (parameters) {
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
        var complexity = this.calculateComplexity(parameters);
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
    };
    ParameterOptimizer.prototype.calculateComplexity = function (parameters) {
        var complexity = 1;
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
    };
    return ParameterOptimizer;
}());
export var parameterOptimizer = new ParameterOptimizer();
