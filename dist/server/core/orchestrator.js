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
import { parameterOptimizer } from "../ai-engine/parameter-optimizer";
import { jsGenerator } from "../generator/js-generator";
import { particlesModule } from "../modules/particles.module";
import { physicsModule } from "../modules/physics.module";
import { lightingModule } from "../modules/lighting.module";
import { morphingModule } from "../modules/morphing.module";
// Mocking AI Engine, Decision Engine, and Template Engine for demonstration
var aiEngine = {
    extractConcepts: function (description) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("AI Engine: Extracting concepts for \"".concat(description, "\""));
            // Simulate NLP processing
            if (description.includes("fire"))
                return [2 /*return*/, [{ name: "fire", confidence: 0.8, type: "element" }]];
            if (description.includes("water"))
                return [2 /*return*/, [{ name: "water", confidence: 0.7, type: "element" }]];
            if (description.includes("particles"))
                return [2 /*return*/, [{ name: "particles", confidence: 0.9, type: "effect" }]];
            if (description.includes("physics"))
                return [2 /*return*/, [{ name: "physics", confidence: 0.8, type: "simulation" }]];
            if (description.includes("lighting"))
                return [2 /*return*/, [{ name: "lighting", confidence: 0.7, type: "visual" }]];
            return [2 /*return*/, [{ name: "generic", confidence: 0.5, type: "effect" }]];
        });
    }); }
};
var decisionEngine = {
    selectModules: function (concepts, context) { return __awaiter(void 0, void 0, void 0, function () {
        var selected, conceptNames, uniqueModules;
        return __generator(this, function (_a) {
            console.log("Decision Engine: Selecting modules with context:", context);
            selected = [];
            conceptNames = concepts.map(function (c) { return c.name; });
            if (conceptNames.includes("fire") || context.userIntent.includes("fire")) {
                selected.push({ name: "particles", getName: function () { return "particles"; } }); // Mock module object
            }
            if (conceptNames.includes("water") || context.userIntent.includes("water")) {
                selected.push({ name: "physics", getName: function () { return "physics"; } }); // Mock module object
            }
            if (conceptNames.includes("particles") || context.userIntent.includes("particles")) {
                selected.push({ name: "particles", getName: function () { return "particles"; } }); // Mock module object
            }
            if (conceptNames.includes("physics") || context.userIntent.includes("physics")) {
                selected.push({ name: "physics", getName: function () { return "physics"; } }); // Mock module object
            }
            if (conceptNames.includes("lighting") || context.userIntent.includes("lighting")) {
                selected.push({ name: "lighting", getName: function () { return "lighting"; } }); // Mock module object
            }
            // Fallback if no modules are selected based on concepts
            if (selected.length === 0 && context.userIntent) {
                if (context.userIntent.includes("animation")) {
                    selected.push({ name: "morphing", getName: function () { return "morphing"; } });
                }
                else {
                    selected.push({ name: "particles", getName: function () { return "particles"; } });
                }
            }
            uniqueModules = Array.from(new Map(selected.map(function (item) { return [item.name, item]; })).values());
            return [2 /*return*/, uniqueModules];
        });
    }); }
};
var templateEngine = {
    optimize: function (code, platform) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Template Engine: Optimizing code for ".concat(platform));
            // Simulate optimization
            return [2 /*return*/, code.replace(/\s+/g, ' ').trim()];
        });
    }); }
};
var Orchestrator = /** @class */ (function () {
    function Orchestrator() {
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
    Orchestrator.prototype.analyzeDescription = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var concepts, moduleDecisions, parameters, complexity, estimatedDuration, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.aiEngine.extractConcepts(description)];
                    case 1:
                        concepts = _a.sent();
                        return [4 /*yield*/, this.decisionEngine.selectModules(concepts, { userIntent: description })];
                    case 2:
                        moduleDecisions = _a.sent();
                        return [4 /*yield*/, parameterOptimizer.optimizeParameters(concepts, moduleDecisions)];
                    case 3:
                        parameters = _a.sent();
                        complexity = this.calculateComplexity(concepts, moduleDecisions);
                        estimatedDuration = this.estimateDuration(complexity);
                        return [2 /*return*/, {
                                concepts: concepts.map(function (c) { return c.name; }),
                                confidence: this.calculateConfidence(concepts),
                                modules: moduleDecisions.map(function (m) { return m.name; }),
                                parameters: parameters,
                                complexity: complexity,
                                estimatedDuration: estimatedDuration
                            }];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Orchestrator analysis error:", error_1);
                        // Fallback analysis
                        return [2 /*return*/, {
                                concepts: ["basic", "effect"],
                                confidence: 0.5,
                                modules: ["particles"],
                                parameters: { basic: true },
                                complexity: 3,
                                estimatedDuration: 120
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Orchestrator.prototype.generateEffect = function (description_1) {
        return __awaiter(this, arguments, void 0, function (description, platform, options) {
            var concepts_1, decisionContext, selectedModules, results, successfulResults, combinedCode, optimizedCode, validationResult, error_2, fallbackCode;
            var _a, _b;
            var _this = this;
            if (platform === void 0) { platform = "javascript"; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 9]);
                        // Validation des entrées
                        if (!description || description.trim().length < 3) {
                            throw new Error("Description trop courte pour générer un effet");
                        }
                        return [4 /*yield*/, this.aiEngine.extractConcepts(description)];
                    case 1:
                        concepts_1 = _c.sent();
                        if (!concepts_1 || concepts_1.length === 0) {
                            throw new Error("Impossible d'extraire des concepts de la description");
                        }
                        decisionContext = {
                            userIntent: description,
                            performanceRequirement: options.performance || 'medium',
                            complexityBudget: options.complexity || 10,
                            platformConstraints: [platform],
                            previousChoices: options.previousModules || []
                        };
                        return [4 /*yield*/, this.decisionEngine.selectModules(concepts_1, decisionContext)];
                    case 2:
                        selectedModules = _c.sent();
                        if (!selectedModules || selectedModules.length === 0) {
                            throw new Error("Aucun module approprié trouvé pour cette description");
                        }
                        return [4 /*yield*/, Promise.allSettled(selectedModules.map(function (module) {
                                return _this.generateModuleEffectWithRetry(module, concepts_1, platform, options);
                            }))];
                    case 3:
                        results = _c.sent();
                        successfulResults = results
                            .filter(function (result) { return result.status === 'fulfilled'; })
                            .map(function (result) { return result.value; });
                        if (successfulResults.length === 0) {
                            throw new Error("Échec de génération de tous les modules");
                        }
                        combinedCode = this.combineResults(successfulResults);
                        return [4 /*yield*/, this.templateEngine.optimize(combinedCode, platform)];
                    case 4:
                        optimizedCode = _c.sent();
                        return [4 /*yield*/, this.validateGeneratedCode(optimizedCode, description)];
                    case 5:
                        validationResult = _c.sent();
                        _a = {
                            code: optimizedCode
                        };
                        _b = {
                            modules: selectedModules.map(function (m) { return m.name; }),
                            confidence: this.calculateConfidence(selectedModules)
                        };
                        return [4 /*yield*/, this.estimatePerformance(optimizedCode)];
                    case 6: return [2 /*return*/, (_a.metadata = (_b.performance = _c.sent(),
                            _b.platform = platform,
                            _b.validation = validationResult,
                            _b.generationTime = Date.now(),
                            _b.concepts = concepts_1.map(function (c) { return c.name; }),
                            _b.warnings = this.extractWarnings(results),
                            _b),
                            _a)];
                    case 7:
                        error_2 = _c.sent();
                        console.error("Erreur dans generateEffect:", error_2);
                        return [4 /*yield*/, this.generateFallbackCode(description, platform)];
                    case 8:
                        fallbackCode = _c.sent();
                        return [2 /*return*/, {
                                code: fallbackCode,
                                metadata: {
                                    modules: ['fallback'],
                                    confidence: 0.3,
                                    performance: { score: 50, warnings: ['Fallback mode'] },
                                    platform: platform,
                                    error: error_2.message,
                                    isFallback: true
                                }
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // Helper to generate effect for a single module
    Orchestrator.prototype.generateModuleEffect = function (module, concepts, platform, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Generating effect for module: ".concat(module.name));
                        if (!(this.jsGenerator && this.jsGenerator.generate)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.jsGenerator.generate(concepts.map(function (c) { return c.name; }).join(' ') + ' ' + concepts.map(function (c) { return c.type; }).join(' '), // Simplified description for generator
                            { concepts: concepts.map(function (c) { return c.name; }), modules: [module.name], parameters: { /* optimized params */} }, [module], // Pass the module itself
                            options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, "// Generated code for ".concat(module.name, " based on concepts: ").concat(concepts.map(function (c) { return c.name; }).join(', '))];
                }
            });
        });
    };
    Orchestrator.prototype.generateModuleEffectWithRetry = function (module_1, concepts_2, platform_1, options_1) {
        return __awaiter(this, arguments, void 0, function (module, concepts, platform, options, retries) {
            var _loop_1, this_1, attempt, state_1;
            if (retries === void 0) { retries = 2; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (attempt) {
                            var _b, error_3;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 4]);
                                        _b = {};
                                        return [4 /*yield*/, this_1.generateModuleEffect(module, concepts, platform, options)];
                                    case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                    case 2:
                                        error_3 = _c.sent();
                                        if (attempt === retries) {
                                            console.error("Failed to generate effect for module ".concat(module.name, " after ").concat(retries + 1, " attempts:"), error_3);
                                            throw error_3;
                                        }
                                        console.warn("Retry ".concat(attempt + 1, " for module ").concat(module.name, ":"), error_3.message);
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100 * (attempt + 1)); })];
                                    case 3:
                                        _c.sent(); // Exponential backoff
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= retries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Orchestrator.prototype.validateGeneratedCode = function (code, originalDescription) {
        return __awaiter(this, void 0, void 0, function () {
            var syntaxValid, semanticValid, securityValid, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        syntaxValid = this.validateSyntax(code);
                        return [4 /*yield*/, this.validateSemantics(code, originalDescription)];
                    case 1:
                        semanticValid = _a.sent();
                        securityValid = this.validateSecurity(code);
                        return [2 /*return*/, {
                                isValid: syntaxValid && semanticValid && securityValid,
                                syntax: syntaxValid,
                                semantic: semanticValid,
                                security: securityValid,
                                score: (syntaxValid ? 0.4 : 0) + (semanticValid ? 0.4 : 0) + (securityValid ? 0.2 : 0)
                            }];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                isValid: false,
                                error: error_4.message,
                                score: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Orchestrator.prototype.validateSyntax = function (code) {
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
    };
    Orchestrator.prototype.validateSemantics = function (code, description) {
        return __awaiter(this, void 0, void 0, function () {
            var descriptionWords, codeContent, relevantWords, matchCount, threshold;
            return __generator(this, function (_a) {
                descriptionWords = description.toLowerCase().split(/\s+/);
                codeContent = code.toLowerCase();
                relevantWords = descriptionWords.filter(function (word) {
                    return word.length > 3 && !['the', 'and', 'with', 'that', 'this', 'for', 'a', 'is', 'it', 'of', 'to'].includes(word);
                });
                if (relevantWords.length === 0)
                    return [2 /*return*/, true]; // Cannot validate semantics if no relevant words
                matchCount = relevantWords.filter(function (word) { return codeContent.includes(word); }).length;
                threshold = Math.max(Math.min(relevantWords.length * 0.3, 5), 2);
                return [2 /*return*/, matchCount >= threshold];
            });
        });
    };
    Orchestrator.prototype.validateSecurity = function (code) {
        var dangerousPatterns = [
            /eval\s*\(/,
            /document\.write\s*\(/,
            /innerHTML\s*=\s*.*\+\s*\(/, // More specific to avoid false positives
            /exec\s*\(/,
            /require\s*\(/ // Potentially dangerous if not controlled
        ];
        var hasDangerousPattern = dangerousPatterns.some(function (pattern) { return pattern.test(code); });
        if (hasDangerousPattern) {
            console.error("Security validation failed: Dangerous pattern detected.");
        }
        return !hasDangerousPattern;
    };
    Orchestrator.prototype.extractWarnings = function (results) {
        var warnings = [];
        results.forEach(function (result, index) {
            if (result.status === 'rejected') {
                // Attempt to get a meaningful error message
                var errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
                warnings.push("Module ".concat(index, " failed: ").concat(errorMessage));
            }
        });
        return warnings;
    };
    Orchestrator.prototype.generateFallbackCode = function (description, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var fallbackTemplate;
            return __generator(this, function (_a) {
                fallbackTemplate = "\n// Generated fallback effect for: ".concat(description, "\n// Platform: ").concat(platform, "\nfunction createEffect() {\n  console.log(\"Fallback Effect: ").concat(description, "\");\n  const element = document.createElement('div');\n  element.style.padding = '20px';\n  element.style.border = '2px dashed grey';\n  element.style.textAlign = 'center';\n  element.textContent = 'Fallback Effect: ").concat(description, "';\n  document.body.appendChild(element); // Append to body for visibility\n\n  return {\n    type: \"fallback\",\n    description: \"").concat(description, "\",\n    platform: \"").concat(platform, "\",\n    created: new Date(),\n    cleanup: () => {\n      console.log(\"Cleaning up fallback effect\");\n      if (element.parentNode) {\n        element.parentNode.removeChild(element);\n      }\n    }\n  };\n}\n\n// Initialize effect\nconst effect = createEffect();\n// Example of how to use the effect object\n// console.log(effect); \n// if (effect.cleanup) effect.cleanup(); // Example cleanup call\n\nexport default effect;\n");
                return [2 /*return*/, fallbackTemplate];
            });
        });
    };
    // The rest of the original methods remain unchanged but are included for completeness
    // (analyzeDescription, selectModulesForGeneration, generateCode, calculateComplexity, estimateDuration, calculateConfidence, estimatePerformance)
    Orchestrator.prototype.selectModulesForGeneration = function (moduleNames) {
        var modules = [];
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
    };
    Orchestrator.prototype.generateCode = function (description, analysis, modules, platform, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = platform;
                        switch (_a) {
                            case "javascript": return [3 /*break*/, 1];
                            case "react": return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 1];
                    case 1: return [4 /*yield*/, this.jsGenerator.generate(description, analysis, modules, options)];
                    case 2: 
                    // Assuming jsGenerator.generate expects the analysis object and modules array
                    return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Orchestrator.prototype.calculateComplexity = function (concepts, modules) {
        var complexity = 1;
        // Base complexity from number of concepts
        complexity += Math.min(concepts.length, 5);
        // Module complexity
        complexity += modules.length * 2;
        // Specific concept complexities
        var complexConcepts = ["physics", "lighting", "3d", "realistic", "advanced", "simulation", "complex"];
        complexity += concepts.filter(function (c) {
            return complexConcepts.some(function (cc) { return c.name.toLowerCase().includes(cc); });
        }).length;
        // Consider the type of concepts too
        var conceptTypes = ["simulation", "complex", "advanced"];
        complexity += concepts.filter(function (c) {
            return conceptTypes.some(function (ct) { return c.type && c.type.toLowerCase().includes(ct); });
        }).length * 1.5; // Higher weight for complex types
        return Math.min(Math.max(complexity, 1), 10);
    };
    Orchestrator.prototype.estimateDuration = function (complexity) {
        // Base duration in seconds
        var baseDuration = 60;
        return baseDuration + (complexity * 20);
    };
    Orchestrator.prototype.calculateConfidence = function (modules) {
        if (!modules || modules.length === 0)
            return 0.3;
        // Simplified confidence calculation based on number of modules selected
        // In a real scenario, this would be more sophisticated, possibly using concept confidences
        var confidence = Math.min(0.5 + modules.length * 0.15, 0.95);
        return Math.max(confidence, 0.3);
    };
    Orchestrator.prototype.estimatePerformance = function (code) {
        // Placeholder for performance estimation based on code analysis
        // In a real scenario, this would involve static code analysis or profiling
        var score = 50; // Default score
        var warnings = [];
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
        return { score: Math.max(0, Math.min(100, score)), warnings: warnings };
    };
    Orchestrator.prototype.combineResults = function (results) {
        console.log("Combining results...");
        // This is a simplistic combination. A real implementation would need to handle dependencies,
        // scope, and potential conflicts between module code.
        return results.join("\n\n");
    };
    return Orchestrator;
}());
export var orchestrator = new Orchestrator();
