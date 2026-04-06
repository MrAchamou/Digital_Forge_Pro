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
var AdvancedDecisionEngine = /** @class */ (function () {
    function AdvancedDecisionEngine() {
        this.moduleNeuralWeights = new Map();
        this.synergyMatrix = new Map();
        this.performanceHistory = new Map();
        this.decisionHistory = [];
        this.adaptiveThresholds = new Map();
        this.initializeNeuralWeights();
        this.initializeSynergyMatrix();
        this.initializeAdaptiveThresholds();
    }
    AdvancedDecisionEngine.prototype.selectModules = function (concepts, context) {
        return __awaiter(this, void 0, void 0, function () {
            var decisions, advancedModuleRules, _i, _a, _b, moduleName, rule, activationScore, matchCount, reasoning, contextualBoost, _loop_1, this_1, _c, concepts_1, concept, performanceImpact, adaptiveThreshold, baseConfidence, finalConfidence, synergyBoost, decision, optimizedDecisions;
            return __generator(this, function (_d) {
                decisions = [];
                advancedModuleRules = {
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
                for (_i = 0, _a = Object.entries(advancedModuleRules); _i < _a.length; _i++) {
                    _b = _a[_i], moduleName = _b[0], rule = _b[1];
                    activationScore = 0;
                    matchCount = 0;
                    reasoning = [];
                    contextualBoost = 1;
                    _loop_1 = function (concept) {
                        var conceptText = concept.name.toLowerCase();
                        // Direct neural activation
                        if (rule.neural_activations[conceptText]) {
                            activationScore += rule.neural_activations[conceptText] * concept.confidence;
                            reasoning.push("Strong neural activation for \"".concat(conceptText, "\" (").concat(rule.neural_activations[conceptText], ")"));
                        }
                        // Pattern matching with weighted importance
                        var matches = rule.keywords.filter(function (keyword) {
                            return conceptText.includes(keyword.toLowerCase());
                        });
                        if (matches.length > 0) {
                            var matchWeight = this_1.getConceptWeight(conceptText, moduleName);
                            activationScore += concept.confidence * matches.length * matchWeight;
                            matchCount += matches.length;
                            reasoning.push("Pattern match: \"".concat(conceptText, "\" -> ").concat(matches.join(', ')));
                        }
                    };
                    this_1 = this;
                    // Calculate neural activation
                    for (_c = 0, concepts_1 = concepts; _c < concepts_1.length; _c++) {
                        concept = concepts_1[_c];
                        _loop_1(concept);
                    }
                    // Apply contextual reasoning
                    if (context) {
                        contextualBoost = this.calculateContextualBoost(moduleName, context, reasoning);
                    }
                    performanceImpact = this.calculatePerformanceImpact(rule, concepts.length);
                    adaptiveThreshold = this.adaptiveThresholds.get(moduleName) || 0.5;
                    if (activationScore > 0 && matchCount > 0) {
                        baseConfidence = Math.min(rule.baseConfidence + (activationScore / Math.max(concepts.length, 1)) * 0.4, 0.98);
                        finalConfidence = baseConfidence * contextualBoost;
                        if (finalConfidence > adaptiveThreshold) {
                            synergyBoost = this.calculateSynergyBoost(moduleName, decisions, rule);
                            decision = {
                                name: moduleName,
                                confidence: Math.min(finalConfidence + synergyBoost, 0.98),
                                priority: this.calculateAdvancedPriority(moduleName, finalConfidence, matchCount, rule),
                                reasoning: reasoning,
                                performance_impact: performanceImpact,
                                complexity_score: rule.complexity,
                                synergy_boost: synergyBoost
                            };
                            decisions.push(decision);
                        }
                    }
                }
                optimizedDecisions = this.optimizeDecisionSet(decisions, context);
                // Update learning weights based on decision patterns
                this.updateNeuralWeights(concepts, optimizedDecisions);
                // Store decision history for learning
                this.decisionHistory.push(optimizedDecisions);
                if (this.decisionHistory.length > 1000) {
                    this.decisionHistory = this.decisionHistory.slice(-500);
                }
                return [2 /*return*/, optimizedDecisions];
            });
        });
    };
    AdvancedDecisionEngine.prototype.initializeNeuralWeights = function () {
        var modules = ['particles', 'physics', 'lighting', 'morphing', 'fluid', 'procedural'];
        var concepts = ['explosion', 'fire', 'water', 'light', 'gravity', 'transform'];
        for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
            var module_1 = modules_1[_i];
            var weights = new Map();
            for (var _a = 0, concepts_2 = concepts; _a < concepts_2.length; _a++) {
                var concept = concepts_2[_a];
                // Initialize with small random weights
                weights.set(concept, 0.5 + Math.random() * 0.3);
            }
            this.moduleNeuralWeights.set(module_1, weights);
        }
    };
    AdvancedDecisionEngine.prototype.initializeSynergyMatrix = function () {
        var synergyPairs = [
            ['particles', 'physics', 0.8],
            ['particles', 'lighting', 0.7],
            ['lighting', 'morphing', 0.6],
            ['physics', 'fluid', 0.9],
            ['morphing', 'procedural', 0.7]
        ];
        for (var _i = 0, synergyPairs_1 = synergyPairs; _i < synergyPairs_1.length; _i++) {
            var _a = synergyPairs_1[_i], moduleA = _a[0], moduleB = _a[1], strength = _a[2];
            if (!this.synergyMatrix.has(moduleA)) {
                this.synergyMatrix.set(moduleA, new Map());
            }
            if (!this.synergyMatrix.has(moduleB)) {
                this.synergyMatrix.set(moduleB, new Map());
            }
            this.synergyMatrix.get(moduleA).set(moduleB, strength);
            this.synergyMatrix.get(moduleB).set(moduleA, strength);
        }
    };
    AdvancedDecisionEngine.prototype.initializeAdaptiveThresholds = function () {
        this.adaptiveThresholds.set('particles', 0.4);
        this.adaptiveThresholds.set('physics', 0.5);
        this.adaptiveThresholds.set('lighting', 0.45);
        this.adaptiveThresholds.set('morphing', 0.5);
        this.adaptiveThresholds.set('fluid', 0.6);
        this.adaptiveThresholds.set('procedural', 0.55);
    };
    AdvancedDecisionEngine.prototype.getConceptWeight = function (conceptName, moduleName) {
        var weights = this.moduleNeuralWeights.get(moduleName);
        return (weights === null || weights === void 0 ? void 0 : weights.get(conceptName)) || 0.5;
    };
    AdvancedDecisionEngine.prototype.calculateContextualBoost = function (moduleName, context, reasoning) {
        var boost = 1.0;
        // Performance requirement consideration
        if (context.performanceRequirement === 'high') {
            var lowImpactModules = ['morphing', 'procedural'];
            if (lowImpactModules.includes(moduleName)) {
                boost *= 1.2;
                reasoning.push("Performance boost: high performance requirement favors ".concat(moduleName));
            }
        }
        // Complexity budget consideration
        var complexityPenalty = {
            'particles': 0.1,
            'physics': 0.3,
            'lighting': 0.2,
            'morphing': 0.15,
            'fluid': 0.35,
            'procedural': 0.2
        };
        var penalty = complexityPenalty[moduleName] || 0.1;
        if (context.complexityBudget < 5) {
            boost *= Math.max(0.5, 1 - penalty);
            reasoning.push("Complexity penalty: ".concat(penalty, " for low complexity budget"));
        }
        // Previous choices influence
        if (context.previousChoices.includes(moduleName)) {
            boost *= 0.8; // Slight penalty for repeated choices
            reasoning.push("Repetition penalty: module was used recently");
        }
        return boost;
    };
    AdvancedDecisionEngine.prototype.calculatePerformanceImpact = function (rule, conceptCount) {
        var baseImpact = rule.performance_cost || 1.0;
        var conceptMultiplier = Math.min(conceptCount / 5, 2.0);
        return baseImpact * conceptMultiplier;
    };
    AdvancedDecisionEngine.prototype.calculateSynergyBoost = function (moduleName, existingDecisions, rule) {
        var _a;
        var synergyBoost = 0;
        // Check for positive synergies
        for (var _i = 0, existingDecisions_1 = existingDecisions; _i < existingDecisions_1.length; _i++) {
            var decision = existingDecisions_1[_i];
            var synergyStrength = (_a = this.synergyMatrix.get(moduleName)) === null || _a === void 0 ? void 0 : _a.get(decision.name);
            if (synergyStrength) {
                synergyBoost += synergyStrength * 0.1;
            }
        }
        // Check for anti-synergies
        for (var _b = 0, existingDecisions_2 = existingDecisions; _b < existingDecisions_2.length; _b++) {
            var decision = existingDecisions_2[_b];
            if (rule.anti_synergies.includes(decision.name)) {
                synergyBoost -= 0.15;
            }
        }
        return Math.max(-0.3, Math.min(0.3, synergyBoost));
    };
    AdvancedDecisionEngine.prototype.calculateAdvancedPriority = function (moduleName, confidence, matchCount, rule) {
        var basePriorities = {
            particles: 100,
            physics: 90,
            lighting: 80,
            morphing: 70,
            fluid: 85,
            procedural: 60
        };
        var basePriority = basePriorities[moduleName] || 50;
        var confidenceBoost = confidence * 100;
        var matchBoost = Math.min(matchCount * 20, 100);
        var complexityPenalty = rule.complexity * 10;
        return Math.floor(basePriority + confidenceBoost + matchBoost - complexityPenalty);
    };
    AdvancedDecisionEngine.prototype.optimizeDecisionSet = function (decisions, context) {
        var _this = this;
        // Sort by priority and confidence
        decisions.sort(function (a, b) {
            var scoreA = a.priority + (a.confidence * 100) + (a.synergy_boost * 50);
            var scoreB = b.priority + (b.confidence * 100) + (b.synergy_boost * 50);
            return scoreB - scoreA;
        });
        // Apply budget constraints
        if (context === null || context === void 0 ? void 0 : context.complexityBudget) {
            var budget = context.complexityBudget;
            var currentComplexity = 0;
            var budgetedDecisions = [];
            for (var _i = 0, decisions_1 = decisions; _i < decisions_1.length; _i++) {
                var decision = decisions_1[_i];
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
            .filter(function (d) { return d.confidence > (_this.adaptiveThresholds.get(d.name) || 0.5); })
            .slice(0, 4);
    };
    AdvancedDecisionEngine.prototype.updateNeuralWeights = function (concepts, decisions) {
        // Simple hebbian learning: strengthen connections for selected modules
        for (var _i = 0, decisions_2 = decisions; _i < decisions_2.length; _i++) {
            var decision = decisions_2[_i];
            var weights = this.moduleNeuralWeights.get(decision.name);
            if (weights) {
                for (var _a = 0, concepts_3 = concepts; _a < concepts_3.length; _a++) {
                    var concept = concepts_3[_a];
                    var currentWeight = weights.get(concept.name) || 0.5;
                    var learningRate = 0.01;
                    var newWeight = currentWeight + learningRate * concept.confidence;
                    weights.set(concept.name, Math.min(1.0, Math.max(0.1, newWeight)));
                }
            }
        }
        // Update adaptive thresholds based on success patterns
        for (var _b = 0, decisions_3 = decisions; _b < decisions_3.length; _b++) {
            var decision = decisions_3[_b];
            var currentThreshold = this.adaptiveThresholds.get(decision.name) || 0.5;
            var adjustment = decision.confidence > 0.8 ? -0.001 : 0.002;
            var newThreshold = Math.min(0.8, Math.max(0.2, currentThreshold + adjustment));
            this.adaptiveThresholds.set(decision.name, newThreshold);
        }
    };
    // Performance tracking methods
    AdvancedDecisionEngine.prototype.recordModulePerformance = function (moduleName, performance) {
        if (!this.performanceHistory.has(moduleName)) {
            this.performanceHistory.set(moduleName, []);
        }
        var history = this.performanceHistory.get(moduleName);
        history.push(performance);
        if (history.length > 100) {
            history.splice(0, history.length - 50);
        }
    };
    AdvancedDecisionEngine.prototype.getDecisionMetrics = function () {
        return {
            totalDecisions: this.decisionHistory.length,
            averageModulesPerDecision: this.decisionHistory.length > 0
                ? this.decisionHistory.reduce(function (sum, decisions) { return sum + decisions.length; }, 0) / this.decisionHistory.length
                : 0,
            neuralWeightDiversity: this.moduleNeuralWeights.size,
            adaptiveThresholds: Object.fromEntries(this.adaptiveThresholds),
            synergyConnections: this.synergyMatrix.size
        };
    };
    AdvancedDecisionEngine.prototype.exportLearningState = function () {
        return {
            neuralWeights: Object.fromEntries(Array.from(this.moduleNeuralWeights.entries()).map(function (_a) {
                var key = _a[0], map = _a[1];
                return [key, Object.fromEntries(map)];
            })),
            synergyMatrix: Object.fromEntries(Array.from(this.synergyMatrix.entries()).map(function (_a) {
                var key = _a[0], map = _a[1];
                return [key, Object.fromEntries(map)];
            })),
            adaptiveThresholds: Object.fromEntries(this.adaptiveThresholds),
            performanceHistory: Object.fromEntries(this.performanceHistory)
        };
    };
    return AdvancedDecisionEngine;
}());
export var decisionEngine = new AdvancedDecisionEngine();
