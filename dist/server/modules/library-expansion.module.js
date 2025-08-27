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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { storage } from "../storage";
import { nlpProcessor } from "../ai-engine/nlp-processor";
var LibraryExpansionModule = /** @class */ (function () {
    function LibraryExpansionModule() {
        this.analysisCache = new Map();
        this.semanticIndex = new Map();
        this.combinationRules = new Map();
        this.localAI = new LocalExpansionAI();
        this.initializeCombinationRules();
    }
    LibraryExpansionModule.prototype.analyzeLibrary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, allEffectsResult, effects, categoriesDistribution_1, typesDistribution_1, allDescriptions_1, semanticClusters, commonPatterns, combinationOpportunities, analysis, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("🔍 Analyse complète de la bibliothèque en cours...");
                        cacheKey = 'library_analysis';
                        if (this.analysisCache.has(cacheKey)) {
                            console.log("📊 Utilisation du cache d'analyse");
                            return [2 /*return*/, this.analysisCache.get(cacheKey)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, storage.getEffects({ limit: 10000 })];
                    case 2:
                        allEffectsResult = _a.sent();
                        effects = allEffectsResult.effects;
                        console.log("\uD83D\uDCDA Analyse de ".concat(effects.length, " effets existants"));
                        categoriesDistribution_1 = {};
                        typesDistribution_1 = {};
                        allDescriptions_1 = [];
                        effects.forEach(function (effect) {
                            categoriesDistribution_1[effect.category] = (categoriesDistribution_1[effect.category] || 0) + 1;
                            typesDistribution_1[effect.type] = (typesDistribution_1[effect.type] || 0) + 1;
                            allDescriptions_1.push(effect.description);
                        });
                        return [4 /*yield*/, this.performSemanticClustering(effects)];
                    case 3:
                        semanticClusters = _a.sent();
                        return [4 /*yield*/, this.extractCommonPatterns(allDescriptions_1)];
                    case 4:
                        commonPatterns = _a.sent();
                        return [4 /*yield*/, this.identifyCombinationOpportunities(effects)];
                    case 5:
                        combinationOpportunities = _a.sent();
                        analysis = {
                            totalEffects: effects.length,
                            categoriesDistribution: categoriesDistribution_1,
                            typesDistribution: typesDistribution_1,
                            commonPatterns: commonPatterns,
                            semanticClusters: semanticClusters,
                            combinationOpportunities: combinationOpportunities
                        };
                        // Mise en cache
                        this.analysisCache.set(cacheKey, analysis);
                        console.log("✅ Analyse terminée avec succès");
                        return [2 /*return*/, analysis];
                    case 6:
                        error_1 = _a.sent();
                        console.error("❌ Erreur lors de l'analyse:", error_1);
                        throw new Error("\u00C9chec de l'analyse: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.expandLibrary = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, generated, duplicatesAvoided, i, description, isDuplicate, error_2, stats, recommendations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDE80 Expansion de la biblioth\u00E8que: ".concat(request.descriptionCount, " effets pour ").concat(request.targetCategory, "/").concat(request.targetType));
                        return [4 /*yield*/, this.analyzeLibrary()];
                    case 1:
                        analysis = _a.sent();
                        generated = [];
                        duplicatesAvoided = 0;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < request.descriptionCount)) return [3 /*break*/, 10];
                        console.log("\u26A1 G\u00E9n\u00E9ration ".concat(i + 1, "/").concat(request.descriptionCount));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 8, , 9]);
                        return [4 /*yield*/, this.generateUniqueDescription(request, analysis, generated)];
                    case 4:
                        description = _a.sent();
                        if (!description) return [3 /*break*/, 7];
                        if (!request.avoidDuplicates) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.checkForDuplicates(description.description, analysis)];
                    case 5:
                        isDuplicate = _a.sent();
                        if (isDuplicate) {
                            duplicatesAvoided++;
                            return [3 /*break*/, 9];
                        }
                        _a.label = 6;
                    case 6:
                        generated.push(description);
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_2 = _a.sent();
                        console.error("Erreur g\u00E9n\u00E9ration ".concat(i + 1, ":"), error_2);
                        return [3 /*break*/, 9];
                    case 9:
                        i++;
                        return [3 /*break*/, 2];
                    case 10:
                        stats = {
                            totalGenerated: generated.length,
                            averageUniqueness: generated.reduce(function (sum, d) { return sum + d.uniquenessScore; }, 0) / generated.length,
                            averageConfidence: generated.reduce(function (sum, d) { return sum + d.confidence; }, 0) / generated.length,
                            duplicatesAvoided: duplicatesAvoided
                        };
                        recommendations = this.generateRecommendations(request, analysis, stats);
                        console.log("\u2705 Expansion termin\u00E9e: ".concat(generated.length, " descriptions g\u00E9n\u00E9r\u00E9es"));
                        return [2 /*return*/, { generated: generated, stats: stats, recommendations: recommendations }];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.generateUniqueDescription = function (request, analysis, alreadyGenerated) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceElements, description, confidence, uniquenessScore;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.selectSourceElements(request, analysis)];
                    case 1:
                        sourceElements = _b.sent();
                        return [4 /*yield*/, this.localAI.generateCombinedDescription({
                                category: request.targetCategory,
                                type: request.targetType,
                                sourceElements: sourceElements,
                                creativityLevel: request.creativeLevel,
                                existingDescriptions: alreadyGenerated.map(function (d) { return d.description; })
                            })];
                    case 2:
                        description = _b.sent();
                        return [4 /*yield*/, this.evaluateDescriptionQuality(description, request)];
                    case 3:
                        confidence = _b.sent();
                        return [4 /*yield*/, this.calculateUniquenessScore(description, analysis)];
                    case 4:
                        uniquenessScore = _b.sent();
                        if (confidence < 0.7 || uniquenessScore < 0.6) {
                            return [2 /*return*/, null];
                        }
                        _a = {
                            description: description,
                            confidence: confidence,
                            uniquenessScore: uniquenessScore,
                            sourceElements: sourceElements.map(function (e) { return e.name; }),
                            category: request.targetCategory,
                            type: request.targetType
                        };
                        return [4 /*yield*/, this.estimateComplexity(description)];
                    case 5: return [2 /*return*/, (_a.estimatedComplexity = _b.sent(),
                            _a)];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.selectSourceElements = function (request, analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var elements, categoryEffects, primaryElements, complementaryCategories, _loop_1, this_1, _i, _a, category;
            return __generator(this, function (_b) {
                elements = [];
                categoryEffects = analysis.semanticClusters.filter(function (cluster) {
                    return cluster.category === request.targetCategory;
                });
                // Sélection d'éléments de la même catégorie (60%)
                if (categoryEffects.length > 0) {
                    primaryElements = this.randomSample(categoryEffects, Math.ceil(3 * 0.6));
                    elements.push.apply(elements, primaryElements);
                }
                complementaryCategories = this.findComplementaryCategories(request.targetCategory, analysis);
                _loop_1 = function (category) {
                    var complementaryEffects = analysis.semanticClusters.filter(function (cluster) {
                        return cluster.category === category;
                    });
                    if (complementaryEffects.length > 0) {
                        var complementaryElements = this_1.randomSample(complementaryEffects, 1);
                        elements.push.apply(elements, complementaryElements);
                    }
                };
                this_1 = this;
                for (_i = 0, _a = complementaryCategories.slice(0, 2); _i < _a.length; _i++) {
                    category = _a[_i];
                    _loop_1(category);
                }
                return [2 /*return*/, elements];
            });
        });
    };
    LibraryExpansionModule.prototype.performSemanticClustering = function (effects) {
        return __awaiter(this, void 0, void 0, function () {
            var clusters, categoryGroups, _i, categoryGroups_1, _a, category, categoryEffects, _b, categoryEffects_1, effect, concepts, _c, _d;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        clusters = [];
                        categoryGroups = new Map();
                        effects.forEach(function (effect) {
                            if (!categoryGroups.has(effect.category)) {
                                categoryGroups.set(effect.category, []);
                            }
                            categoryGroups.get(effect.category).push(effect);
                        });
                        _i = 0, categoryGroups_1 = categoryGroups;
                        _f.label = 1;
                    case 1:
                        if (!(_i < categoryGroups_1.length)) return [3 /*break*/, 7];
                        _a = categoryGroups_1[_i], category = _a[0], categoryEffects = _a[1];
                        _b = 0, categoryEffects_1 = categoryEffects;
                        _f.label = 2;
                    case 2:
                        if (!(_b < categoryEffects_1.length)) return [3 /*break*/, 6];
                        effect = categoryEffects_1[_b];
                        return [4 /*yield*/, nlpProcessor.extractConcepts(effect.description)];
                    case 3:
                        concepts = _f.sent();
                        _d = (_c = clusters).push;
                        _e = {
                            id: effect.id,
                            name: effect.name,
                            category: effect.category,
                            type: effect.type,
                            concepts: concepts.map(function (c) { return c.name; })
                        };
                        return [4 /*yield*/, this.generateSemanticVector(effect.description)];
                    case 4:
                        _d.apply(_c, [(_e.semanticVector = _f.sent(),
                                _e.complexity = effect.complexity,
                                _e.description = effect.description,
                                _e)]);
                        _f.label = 5;
                    case 5:
                        _b++;
                        return [3 /*break*/, 2];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, clusters];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.extractCommonPatterns = function (descriptions) {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, commonWords, commonPhrases;
            return __generator(this, function (_a) {
                patterns = new Map();
                commonWords = ['effet', 'animation', 'transition', 'mouvement', 'lumière', 'particule'];
                commonPhrases = [
                    'effet de', 'animation de', 'mouvement de', 'transition de',
                    'avec des', 'utilisant des', 'créant un', 'générant des'
                ];
                descriptions.forEach(function (desc) {
                    var lowerDesc = desc.toLowerCase();
                    commonWords.forEach(function (word) {
                        if (lowerDesc.includes(word)) {
                            patterns.set(word, (patterns.get(word) || 0) + 1);
                        }
                    });
                    commonPhrases.forEach(function (phrase) {
                        if (lowerDesc.includes(phrase)) {
                            patterns.set(phrase, (patterns.get(phrase) || 0) + 1);
                        }
                    });
                });
                return [2 /*return*/, Array.from(patterns.entries())
                        .sort(function (a, b) { return b[1] - a[1]; })
                        .slice(0, 20)
                        .map(function (_a) {
                        var pattern = _a[0];
                        return pattern;
                    })];
            });
        });
    };
    LibraryExpansionModule.prototype.identifyCombinationOpportunities = function (effects) {
        return __awaiter(this, void 0, void 0, function () {
            var opportunities, combinationPatterns, potentialCombinations;
            return __generator(this, function (_a) {
                opportunities = [];
                combinationPatterns = new Map();
                effects.forEach(function (effect) {
                    var concepts = effect.description.toLowerCase().split(' ');
                    // Recherche de combinaisons dans la description
                    for (var i = 0; i < concepts.length - 1; i++) {
                        var combination = "".concat(concepts[i], "_").concat(concepts[i + 1]);
                        combinationPatterns.set(combination, (combinationPatterns.get(combination) || 0) + 1);
                    }
                });
                potentialCombinations = [
                    { elements: ['fire', 'water'], potential: 'steam_effects' },
                    { elements: ['light', 'shadow'], potential: 'contrast_effects' },
                    { elements: ['particle', 'gravity'], potential: 'physics_systems' },
                    { elements: ['morphing', 'color'], potential: 'chromatic_transformation' }
                ];
                potentialCombinations.forEach(function (combo) {
                    var existingCount = combinationPatterns.get(combo.elements.join('_')) || 0;
                    opportunities.push({
                        combination: combo.elements,
                        potential: combo.potential,
                        currentUsage: existingCount,
                        expansionPotential: existingCount < 5 ? 'high' : 'medium'
                    });
                });
                return [2 /*return*/, opportunities];
            });
        });
    };
    LibraryExpansionModule.prototype.findComplementaryCategories = function (targetCategory, analysis) {
        var complementaryMap = {
            'PARTICULES': ['LUMIERE_OMBRE', 'PHYSIQUE', 'EXPLOSION'],
            'LUMIERE_OMBRE': ['PARTICULES', 'MORPHING', 'ATMOSPHERIC'],
            'MORPHING': ['TRANSFORMATION', 'LUMIERE_OMBRE', 'DIGITAL'],
            'PHYSIQUE': ['PARTICULES', 'MANIPULATION_TEMPORELLE', 'EXPLOSION'],
            'EXPLOSION': ['PARTICULES', 'PHYSIQUE', 'LUMIERE_OMBRE'],
            'ATMOSPHERIC': ['LUMIERE_OMBRE', 'PARTICULES', 'PHYSIQUE'],
            'DIGITAL': ['MORPHING', 'LUMIERE_OMBRE', 'TRANSFORMATION']
        };
        return complementaryMap[targetCategory] || Object.keys(analysis.categoriesDistribution);
    };
    LibraryExpansionModule.prototype.checkForDuplicates = function (description, analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var descVector, _i, _a, cluster, similarity;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.generateSemanticVector(description)];
                    case 1:
                        descVector = _b.sent();
                        for (_i = 0, _a = analysis.semanticClusters; _i < _a.length; _i++) {
                            cluster = _a[_i];
                            similarity = this.calculateCosineSimilarity(descVector, cluster.semanticVector);
                            if (similarity > 0.85) {
                                return [2 /*return*/, true];
                            }
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.generateSemanticVector = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var concepts, vector;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nlpProcessor.extractConcepts(text)];
                    case 1:
                        concepts = _a.sent();
                        vector = new Array(100).fill(0);
                        concepts.forEach(function (concept, index) {
                            if (index < vector.length) {
                                vector[index] = concept.confidence * concept.weight;
                            }
                        });
                        return [2 /*return*/, vector];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.calculateCosineSimilarity = function (vector1, vector2) {
        var dotProduct = 0;
        var norm1 = 0;
        var norm2 = 0;
        for (var i = 0; i < Math.min(vector1.length, vector2.length); i++) {
            dotProduct += vector1[i] * vector2[i];
            norm1 += vector1[i] * vector1[i];
            norm2 += vector2[i] * vector2[i];
        }
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    };
    LibraryExpansionModule.prototype.randomSample = function (array, count) {
        var shuffled = __spreadArray([], array, true).sort(function () { return 0.5 - Math.random(); });
        return shuffled.slice(0, count);
    };
    LibraryExpansionModule.prototype.evaluateDescriptionQuality = function (description, request) {
        return __awaiter(this, void 0, void 0, function () {
            var quality, technicalTerms, techCount;
            return __generator(this, function (_a) {
                quality = 0.5;
                // Longueur appropriée
                if (description.length >= 50 && description.length <= 300)
                    quality += 0.2;
                technicalTerms = ['effet', 'animation', 'transition', 'shader', 'particule'];
                techCount = technicalTerms.filter(function (term) { return description.toLowerCase().includes(term); }).length;
                quality += Math.min(techCount * 0.1, 0.3);
                // Cohérence avec la catégorie
                if (description.toLowerCase().includes(request.targetCategory.toLowerCase())) {
                    quality += 0.2;
                }
                return [2 /*return*/, Math.min(quality, 1.0)];
            });
        });
    };
    LibraryExpansionModule.prototype.calculateUniquenessScore = function (description, analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var words, uniquenessScore, _i, _a, pattern;
            return __generator(this, function (_b) {
                words = description.toLowerCase().split(' ');
                uniquenessScore = 1.0;
                for (_i = 0, _a = analysis.commonPatterns; _i < _a.length; _i++) {
                    pattern = _a[_i];
                    if (description.toLowerCase().includes(pattern)) {
                        uniquenessScore -= 0.05;
                    }
                }
                return [2 /*return*/, Math.max(uniquenessScore, 0.3)];
            });
        });
    };
    LibraryExpansionModule.prototype.estimateComplexity = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var complexityIndicators, complexity, lowerDesc;
            return __generator(this, function (_a) {
                complexityIndicators = [
                    'avancé', 'complexe', 'détaillé', 'sophistiqué', 'multi-couches',
                    'realistic', 'physics', 'shader', 'volumetric', 'raytracing'
                ];
                complexity = 3;
                lowerDesc = description.toLowerCase();
                complexityIndicators.forEach(function (indicator) {
                    if (lowerDesc.includes(indicator)) {
                        complexity += 1;
                    }
                });
                return [2 /*return*/, Math.min(complexity, 10)];
            });
        });
    };
    LibraryExpansionModule.prototype.generateRecommendations = function (request, analysis, stats) {
        var recommendations = [];
        if (stats.averageConfidence < 0.8) {
            recommendations.push("Qualité moyenne faible - considérer l'ajustement des paramètres de créativité");
        }
        if (stats.averageUniqueness < 0.7) {
            recommendations.push("Score d'unicité faible - explorer d'autres combinaisons d'éléments");
        }
        if (stats.duplicatesAvoided > stats.totalGenerated * 0.3) {
            recommendations.push("Taux de doublons élevé - la bibliothèque pourrait être saturée pour cette catégorie");
        }
        var categoryCount = analysis.categoriesDistribution[request.targetCategory] || 0;
        if (categoryCount < 50) {
            recommendations.push("Cat\u00E9gorie ".concat(request.targetCategory, " sous-repr\u00E9sent\u00E9e - expansion recommand\u00E9e"));
        }
        return recommendations;
    };
    LibraryExpansionModule.prototype.initializeCombinationRules = function () {
        // Règles de combinaison créative
        this.combinationRules.set('fire_water', {
            result: 'steam_effects',
            probability: 0.8,
            complexity: 6
        });
        this.combinationRules.set('light_shadow', {
            result: 'contrast_effects',
            probability: 0.9,
            complexity: 5
        });
        this.combinationRules.set('particle_gravity', {
            result: 'physics_simulation',
            probability: 0.85,
            complexity: 7
        });
    };
    // API publiques
    LibraryExpansionModule.prototype.getAvailableCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var analysis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeLibrary()];
                    case 1:
                        analysis = _a.sent();
                        return [2 /*return*/, Object.keys(analysis.categoriesDistribution)];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.getAvailableTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var analysis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeLibrary()];
                    case 1:
                        analysis = _a.sent();
                        return [2 /*return*/, Object.keys(analysis.typesDistribution)];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.getCategoryStats = function (category) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, count, clusters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeLibrary()];
                    case 1:
                        analysis = _a.sent();
                        count = analysis.categoriesDistribution[category] || 0;
                        clusters = analysis.semanticClusters.filter(function (c) { return c.category === category; });
                        return [2 /*return*/, {
                                effectCount: count,
                                averageComplexity: clusters.reduce(function (sum, c) { return sum + c.complexity; }, 0) / clusters.length,
                                commonConcepts: this.extractTopConcepts(clusters),
                                expansionPotential: count < 100 ? 'high' : count < 200 ? 'medium' : 'low'
                            }];
                }
            });
        });
    };
    LibraryExpansionModule.prototype.extractTopConcepts = function (clusters) {
        var conceptCounts = new Map();
        clusters.forEach(function (cluster) {
            cluster.concepts.forEach(function (concept) {
                conceptCounts.set(concept, (conceptCounts.get(concept) || 0) + 1);
            });
        });
        return Array.from(conceptCounts.entries())
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, 10)
            .map(function (_a) {
            var concept = _a[0];
            return concept;
        });
    };
    return LibraryExpansionModule;
}());
// IA LOCALE POUR L'EXPANSION
var LocalExpansionAI = /** @class */ (function () {
    function LocalExpansionAI() {
        this.creativePatterns = new Map();
        this.combinationTemplates = [];
        this.initializeCreativePatterns();
        this.initializeCombinationTemplates();
    }
    LocalExpansionAI.prototype.generateCombinedDescription = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var template, creativeElements, description, uniqueDescription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.selectTemplate(params.category, params.type);
                        creativeElements = this.extractCreativeElements(params.sourceElements);
                        return [4 /*yield*/, this.combineElements(template, creativeElements, params.creativityLevel)];
                    case 1:
                        description = _a.sent();
                        uniqueDescription = this.ensureUniqueness(description, params.existingDescriptions);
                        return [2 /*return*/, uniqueDescription];
                }
            });
        });
    };
    LocalExpansionAI.prototype.selectTemplate = function (category, type) {
        var templates = {
            'PARTICULES': [
                "Système de particules {ELEMENT1} avec {ELEMENT2} créant un effet {STYLE}",
                "Émission de {ELEMENT1} {STYLE} interagissant avec {ELEMENT2}",
                "Nuage de particules {ELEMENT1} avec comportement {STYLE} et {ELEMENT2}"
            ],
            'LUMIERE_OMBRE': [
                "Jeu d'éclairage {ELEMENT1} avec projection d'ombres {STYLE}",
                "Contraste lumineux entre {ELEMENT1} et {ELEMENT2} créant {STYLE}",
                "Illumination {STYLE} révélant des détails {ELEMENT1} avec {ELEMENT2}"
            ],
            'MORPHING': [
                "Transformation progressive de {ELEMENT1} vers {ELEMENT2} avec style {STYLE}",
                "Métamorphose {STYLE} combinant {ELEMENT1} et {ELEMENT2}",
                "Évolution {ELEMENT1} intégrant des aspects {ELEMENT2} de manière {STYLE}"
            ]
        };
        var categoryTemplates = templates[category] || templates['PARTICULES'];
        return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    };
    LocalExpansionAI.prototype.extractCreativeElements = function (sourceElements) {
        var elements = {
            primary: [],
            secondary: [],
            styles: []
        };
        sourceElements.forEach(function (element) {
            var _a, _b;
            // Extraction des concepts principaux
            if (element.concepts) {
                (_a = elements.primary).push.apply(_a, element.concepts.slice(0, 2));
                (_b = elements.secondary).push.apply(_b, element.concepts.slice(2, 4));
            }
            // Extraction de styles
            var styleWords = ['dynamique', 'fluide', 'énergique', 'subtil', 'intense'];
            var elementStyle = styleWords[Math.floor(Math.random() * styleWords.length)];
            elements.styles.push(elementStyle);
        });
        return elements;
    };
    LocalExpansionAI.prototype.combineElements = function (template, elements, creativityLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var description, element1, element2, style, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        description = template;
                        element1 = elements.primary[0] || 'particules';
                        element2 = elements.secondary[0] || 'lumineuses';
                        style = elements.styles[0] || 'dynamique';
                        description = description
                            .replace('{ELEMENT1}', element1)
                            .replace('{ELEMENT2}', element2)
                            .replace('{STYLE}', style);
                        _a = creativityLevel;
                        switch (_a) {
                            case 'experimental': return [3 /*break*/, 1];
                            case 'creative': return [3 /*break*/, 3];
                            case 'moderate': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.addExperimentalElements(description)];
                    case 2:
                        description = _b.sent();
                        return [3 /*break*/, 8];
                    case 3: return [4 /*yield*/, this.addCreativeElements(description)];
                    case 4:
                        description = _b.sent();
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, this.addModerateElements(description)];
                    case 6:
                        description = _b.sent();
                        return [3 /*break*/, 8];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, description];
                }
            });
        });
    };
    LocalExpansionAI.prototype.addExperimentalElements = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var experimentalAdditions, addition;
            return __generator(this, function (_a) {
                experimentalAdditions = [
                    'avec des propriétés quantiques',
                    'utilisant des algorithmes génératifs',
                    'intégrant de la physique non-euclidienne',
                    'avec des effets temporels non-linéaires'
                ];
                addition = experimentalAdditions[Math.floor(Math.random() * experimentalAdditions.length)];
                return [2 /*return*/, "".concat(description, " ").concat(addition)];
            });
        });
    };
    LocalExpansionAI.prototype.addCreativeElements = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var creativeAdditions, addition;
            return __generator(this, function (_a) {
                creativeAdditions = [
                    'avec des variations procédurales',
                    'incluant des réactions interactives',
                    'présentant des détails fractaux',
                    'avec synchronisation audiovisuelle'
                ];
                addition = creativeAdditions[Math.floor(Math.random() * creativeAdditions.length)];
                return [2 /*return*/, "".concat(description, " ").concat(addition)];
            });
        });
    };
    LocalExpansionAI.prototype.addModerateElements = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var moderateAdditions, addition;
            return __generator(this, function (_a) {
                moderateAdditions = [
                    'avec des transitions fluides',
                    'incluant des variations subtiles',
                    'présentant un rendu optimisé',
                    'avec contrôles utilisateur'
                ];
                addition = moderateAdditions[Math.floor(Math.random() * moderateAdditions.length)];
                return [2 /*return*/, "".concat(description, " ").concat(addition)];
            });
        });
    };
    LocalExpansionAI.prototype.ensureUniqueness = function (description, existingDescriptions) {
        // Vérification simple d'unicité et modification si nécessaire
        var uniqueDescription = description;
        var attempts = 0;
        while (existingDescriptions.includes(uniqueDescription) && attempts < 5) {
            var variations = [
                'avancé', 'amélioré', 'optimisé', 'personnalisé', 'adaptatif'
            ];
            var variation = variations[Math.floor(Math.random() * variations.length)];
            uniqueDescription = "".concat(description, " ").concat(variation);
            attempts++;
        }
        return uniqueDescription;
    };
    LocalExpansionAI.prototype.initializeCreativePatterns = function () {
        this.creativePatterns.set('fire', ['flammes', 'combustion', 'incandescence']);
        this.creativePatterns.set('water', ['liquide', 'fluidité', 'ondulation']);
        this.creativePatterns.set('light', ['luminescence', 'éclat', 'rayonnement']);
    };
    LocalExpansionAI.prototype.initializeCombinationTemplates = function () {
        this.combinationTemplates = [
            "Effet combinant {A} et {B} pour créer {RESULT}",
            "Interaction entre {A} et {B} générant {RESULT}",
            "Fusion de {A} avec {B} produisant {RESULT}"
        ];
    };
    return LocalExpansionAI;
}());
export var libraryExpansionModule = new LibraryExpansionModule();
