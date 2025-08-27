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
import fs from "fs/promises";
import path from "path";
var EffectParserModule = /** @class */ (function () {
    function EffectParserModule() {
        this.localAI = new LocalAIEngine();
        this.patternMatcher = new PatternMatcher();
        this.contextAnalyzer = new ContextAnalyzer();
        this.qualityValidator = new QualityValidator();
    }
    EffectParserModule.prototype.parseEffectsList = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent, rawEffects, parsedEffects, stats, batchSize, i, batch, batchResults, _i, batchResults_1, result, category, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        console.log("🚀 Parser 2.0 - Démarrage analyse massive...");
                        return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                    case 1:
                        fileContent = _a.sent();
                        rawEffects = this.extractRawEffects(fileContent);
                        console.log("\uD83D\uDCCA ".concat(rawEffects.length, " effets d\u00E9tect\u00E9s dans le fichier"));
                        parsedEffects = [];
                        stats = {
                            total: rawEffects.length,
                            successful: 0,
                            failed: 0,
                            categories: {}
                        };
                        batchSize = 50;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < rawEffects.length)) return [3 /*break*/, 5];
                        batch = rawEffects.slice(i, i + batchSize);
                        return [4 /*yield*/, this.processBatch(batch, i)];
                    case 3:
                        batchResults = _a.sent();
                        for (_i = 0, batchResults_1 = batchResults; _i < batchResults_1.length; _i++) {
                            result = batchResults_1[_i];
                            parsedEffects.push(result);
                            if (result.confidence > 0.7) {
                                stats.successful++;
                                category = result.parsed.category;
                                stats.categories[category] = (stats.categories[category] || 0) + 1;
                            }
                            else {
                                stats.failed++;
                            }
                        }
                        console.log("\u26A1 Batch ".concat(Math.floor(i / batchSize) + 1, "/").concat(Math.ceil(rawEffects.length / batchSize), " termin\u00E9"));
                        _a.label = 4;
                    case 4:
                        i += batchSize;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Sauvegarde automatique des effets parsés
                    return [4 /*yield*/, this.saveToLibrary(parsedEffects.filter(function (e) { return e.confidence > 0.7; }))];
                    case 6:
                        // Sauvegarde automatique des effets parsés
                        _a.sent();
                        console.log("✅ Parser 2.0 - Analyse terminée avec succès!");
                        return [2 /*return*/, { effects: parsedEffects, stats: stats }];
                    case 7:
                        error_1 = _a.sent();
                        console.error("❌ Parser 2.0 Error:", error_1);
                        throw new Error("\u00C9chec du parsing: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    EffectParserModule.prototype.extractRawEffects = function (content) {
        // Patterns de détection ultra-précis
        var patterns = [
            // Pattern numéroté (1. **Nom**, 2. **Nom**)
            /(\d+)\.\s*\*\*([^*]+)\*\*\s*\*\s*\*\*Type\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Catégorie\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Description\s*:\*\*\s*([^]+?)(?=\d+\.\s*\*\*|\n\n|\$)/gi,
            // Pattern alternatif avec tirets
            /[-•]\s*\*\*([^*]+)\*\*\s*[\r\n]+\s*\*\s*\*\*Type\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Catégorie\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Description\s*:\*\*\s*([^]+?)(?=[-•]\s*\*\*|\n\n|\$)/gi,
            // Pattern simple ligne par ligne
            /^([A-Z][^:\n]+):\s*(.+)$/gm
        ];
        var effects = [];
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            var match = void 0;
            while ((match = pattern.exec(content)) !== null) {
                if (match[0].trim().length > 20) {
                    effects.push(match[0].trim());
                }
            }
        }
        // Si aucun pattern ne fonctionne, découpage par blocs
        if (effects.length === 0) {
            var blocks = content.split(/\n\s*\n/).filter(function (block) {
                return block.trim().length > 30 &&
                    (block.includes('**') || block.includes('Type') || block.includes('Description'));
            });
            effects.push.apply(effects, blocks);
        }
        return __spreadArray([], new Set(effects), true); // Supprime les doublons
    };
    EffectParserModule.prototype.processBatch = function (rawEffects, startIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var results, i, rawEffect, globalIndex, parsed, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < rawEffects.length)) return [3 /*break*/, 6];
                        rawEffect = rawEffects[i];
                        globalIndex = startIndex + i;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.parseIndividualEffect(rawEffect, globalIndex)];
                    case 3:
                        parsed = _a.sent();
                        results.push(parsed);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        results.push({
                            raw: rawEffect,
                            parsed: this.createFallbackEffect(rawEffect, globalIndex),
                            confidence: 0.3,
                            errors: [error_2 instanceof Error ? error_2.message : 'Parse error']
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    EffectParserModule.prototype.parseIndividualEffect = function (rawText, index) {
        return __awaiter(this, void 0, void 0, function () {
            var baseData, aiAnalysis, contextData, effectId, effectData, validationResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseData = this.patternMatcher.extractBaseData(rawText);
                        return [4 /*yield*/, this.localAI.analyzeEffect(rawText)];
                    case 1:
                        aiAnalysis = _a.sent();
                        contextData = this.contextAnalyzer.analyze(rawText, baseData);
                        effectId = this.generateEffectId(baseData.name || "Effect_".concat(index), baseData.category);
                        effectData = {
                            id: effectId,
                            name: baseData.name || aiAnalysis.suggestedName || "GeneratedEffect_".concat(index),
                            type: this.normalizeType(baseData.type || aiAnalysis.type),
                            category: this.normalizeCategory(baseData.category || aiAnalysis.category),
                            subCategory: aiAnalysis.subCategory,
                            description: baseData.description || aiAnalysis.enhancedDescription,
                            complexity: aiAnalysis.complexity,
                            keywords: __spreadArray(__spreadArray([], baseData.keywords, true), aiAnalysis.keywords, true),
                            concepts: aiAnalysis.concepts,
                            metadata: {
                                estimatedGenTime: this.calculateGenTime(aiAnalysis.complexity),
                                difficulty: this.mapComplexityToDifficulty(aiAnalysis.complexity),
                                platform: ['javascript', 'web', 'canvas'],
                                performance: this.assessPerformance(aiAnalysis.complexity, aiAnalysis.concepts)
                            }
                        };
                        validationResult = this.qualityValidator.validate(effectData);
                        return [2 /*return*/, {
                                raw: rawText,
                                parsed: effectData,
                                confidence: validationResult.confidence,
                                errors: validationResult.errors
                            }];
                }
            });
        });
    };
    EffectParserModule.prototype.generateEffectId = function (name, category) {
        var cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        var cleanCategory = category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        var timestamp = Date.now().toString(36);
        return "".concat(cleanCategory, "_").concat(cleanName, "_").concat(timestamp).slice(0, 50);
    };
    EffectParserModule.prototype.normalizeType = function (type) {
        var typeMap = {
            'vidéo': 'VIDEO',
            'video': 'VIDEO',
            'image': 'IMAGE',
            'environnement': 'ENVIRONMENT',
            'environment': 'ENVIRONMENT',
            'audio': 'AUDIO',
            'ui': 'UI',
            'interface': 'UI'
        };
        var normalized = type.toLowerCase().trim();
        for (var _i = 0, _a = Object.entries(typeMap); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (normalized.includes(key))
                return value;
        }
        return 'VISUAL';
    };
    EffectParserModule.prototype.normalizeCategory = function (category) {
        var categoryMap = {
            'manipulation temporelle': 'MANIPULATION_TEMPORELLE',
            'temporal manipulation': 'MANIPULATION_TEMPORELLE',
            'manipulation matière': 'MANIPULATION_MATIERE',
            'matter manipulation': 'MANIPULATION_MATIERE',
            'lumière & ombre': 'LUMIERE_OMBRE',
            'light & shadow': 'LUMIERE_OMBRE',
            'particules': 'PARTICULES',
            'particles': 'PARTICULES',
            'explosion': 'EXPLOSION',
            'transformation': 'TRANSFORMATION',
            'morphing': 'MORPHING',
            'psychédélique': 'PSYCHEDELIQUE',
            'psychedelic': 'PSYCHEDELIQUE'
        };
        var normalized = category.toLowerCase().trim();
        for (var _i = 0, _a = Object.entries(categoryMap); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (normalized.includes(key))
                return value;
        }
        return 'GENERAL';
    };
    EffectParserModule.prototype.calculateGenTime = function (complexity) {
        // Temps en secondes basé sur la complexité
        var baseTime = 30;
        return baseTime + (complexity * 15);
    };
    EffectParserModule.prototype.mapComplexityToDifficulty = function (complexity) {
        if (complexity <= 3)
            return 'BEGINNER';
        if (complexity <= 6)
            return 'INTERMEDIATE';
        if (complexity <= 8)
            return 'ADVANCED';
        return 'EXPERT';
    };
    EffectParserModule.prototype.assessPerformance = function (complexity, concepts) {
        var heavyConcepts = ['particles', 'physics', 'lighting', '3d', 'realtime'];
        var hasHeavyConcepts = concepts.some(function (c) { return heavyConcepts.includes(c.toLowerCase()); });
        if (complexity >= 8 || hasHeavyConcepts)
            return 'LOW';
        if (complexity >= 5)
            return 'MEDIUM';
        return 'HIGH';
    };
    EffectParserModule.prototype.createFallbackEffect = function (rawText, index) {
        return {
            id: "fallback_".concat(index, "_").concat(Date.now()),
            name: "ParsedEffect_".concat(index),
            type: 'VISUAL',
            category: 'GENERAL',
            description: rawText.slice(0, 200) + '...',
            complexity: 5,
            keywords: [],
            concepts: ['basic'],
            metadata: {
                estimatedGenTime: 60,
                difficulty: 'INTERMEDIATE',
                platform: ['javascript'],
                performance: 'MEDIUM'
            }
        };
    };
    EffectParserModule.prototype.saveToLibrary = function (effects) {
        return __awaiter(this, void 0, void 0, function () {
            var libraryPath, groupedEffects, _i, _a, _b, category, categoryEffects, categoryPath, indexData, _c, categoryEffects_1, effect, effectFile, globalIndex, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 11, , 12]);
                        libraryPath = path.join(process.cwd(), 'effects-library');
                        return [4 /*yield*/, fs.mkdir(libraryPath, { recursive: true })];
                    case 1:
                        _d.sent();
                        groupedEffects = effects.reduce(function (acc, effect) {
                            var category = effect.parsed.category;
                            if (!acc[category])
                                acc[category] = [];
                            acc[category].push(effect);
                            return acc;
                        }, {});
                        _i = 0, _a = Object.entries(groupedEffects);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        _b = _a[_i], category = _b[0], categoryEffects = _b[1];
                        categoryPath = path.join(libraryPath, category);
                        return [4 /*yield*/, fs.mkdir(categoryPath, { recursive: true })];
                    case 3:
                        _d.sent();
                        indexData = {
                            category: category,
                            count: categoryEffects.length,
                            effects: categoryEffects.map(function (e) { return ({
                                id: e.parsed.id,
                                name: e.parsed.name,
                                description: e.parsed.description.slice(0, 100) + '...',
                                complexity: e.parsed.complexity,
                                confidence: e.confidence
                            }); }),
                            lastUpdated: new Date().toISOString()
                        };
                        return [4 /*yield*/, fs.writeFile(path.join(categoryPath, 'index.json'), JSON.stringify(indexData, null, 2))];
                    case 4:
                        _d.sent();
                        _c = 0, categoryEffects_1 = categoryEffects;
                        _d.label = 5;
                    case 5:
                        if (!(_c < categoryEffects_1.length)) return [3 /*break*/, 8];
                        effect = categoryEffects_1[_c];
                        effectFile = path.join(categoryPath, "".concat(effect.parsed.id, ".json"));
                        return [4 /*yield*/, fs.writeFile(effectFile, JSON.stringify(effect, null, 2))];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _c++;
                        return [3 /*break*/, 5];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9:
                        globalIndex = {
                            totalEffects: effects.length,
                            categories: Object.keys(groupedEffects),
                            lastParsed: new Date().toISOString(),
                            stats: {
                                avgComplexity: effects.reduce(function (sum, e) { return sum + e.parsed.complexity; }, 0) / effects.length,
                                avgConfidence: effects.reduce(function (sum, e) { return sum + e.confidence; }, 0) / effects.length
                            }
                        };
                        return [4 /*yield*/, fs.writeFile(path.join(libraryPath, 'global-index.json'), JSON.stringify(globalIndex, null, 2))];
                    case 10:
                        _d.sent();
                        console.log("\uD83D\uDCBE ".concat(effects.length, " effets sauvegard\u00E9s dans la biblioth\u00E8que"));
                        return [3 /*break*/, 12];
                    case 11:
                        error_3 = _d.sent();
                        console.error("Erreur lors de la sauvegarde:", error_3);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    return EffectParserModule;
}());
// IA LOCALE INTÉGRÉE
var LocalAIEngine = /** @class */ (function () {
    function LocalAIEngine() {
        this.neuralPatterns = new Map();
        this.conceptVectors = new Map();
        this.initializeNeuralPatterns();
        this.loadConceptVectors();
    }
    LocalAIEngine.prototype.analyzeEffect = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanText, semanticAnalysis, classification, concepts, complexity;
            return __generator(this, function (_a) {
                cleanText = this.preprocessText(text);
                semanticAnalysis = this.performSemanticAnalysis(cleanText);
                classification = this.classifyEffect(semanticAnalysis);
                concepts = this.extractAdvancedConcepts(cleanText, classification);
                complexity = this.calculateAIComplexity(concepts, semanticAnalysis);
                return [2 /*return*/, {
                        suggestedName: this.generateSmartName(concepts, classification),
                        type: classification.type,
                        category: classification.category,
                        subCategory: classification.subCategory,
                        enhancedDescription: this.enhanceDescription(cleanText, concepts),
                        complexity: complexity,
                        keywords: this.extractKeywords(cleanText, concepts),
                        concepts: concepts
                    }];
            });
        });
    };
    LocalAIEngine.prototype.preprocessText = function (text) {
        return text
            .toLowerCase()
            .replace(/[*#\-\d\.]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };
    LocalAIEngine.prototype.performSemanticAnalysis = function (text) {
        var _this = this;
        var words = text.split(' ');
        var semanticScore = new Map();
        // Analyse des co-occurrences
        for (var i = 0; i < words.length - 1; i++) {
            var bigram = "".concat(words[i], "_").concat(words[i + 1]);
            semanticScore.set(bigram, (semanticScore.get(bigram) || 0) + 1);
        }
        // Score sémantique global
        var globalScore = words.reduce(function (score, word) {
            return score + (_this.neuralPatterns.get(word) || 0);
        }, 0);
        return { semanticScore: semanticScore, globalScore: globalScore, wordCount: words.length };
    };
    LocalAIEngine.prototype.classifyEffect = function (semanticAnalysis) {
        // Classification basée sur les patterns neuronaux
        var typeScores = {
            'VIDEO': 0,
            'IMAGE': 0,
            'ENVIRONMENT': 0,
            'AUDIO': 0,
            'UI': 0
        };
        var categoryScores = {
            'MANIPULATION_TEMPORELLE': 0,
            'MANIPULATION_MATIERE': 0,
            'LUMIERE_OMBRE': 0,
            'PARTICULES': 0,
            'TRANSFORMATION': 0,
            'PSYCHEDELIQUE': 0
        };
        // Algorithme de classification simplifié
        for (var _i = 0, _a = semanticAnalysis.semanticScore; _i < _a.length; _i++) {
            var _b = _a[_i], bigram = _b[0], count = _b[1];
            if (bigram.includes('temps') || bigram.includes('time')) {
                categoryScores['MANIPULATION_TEMPORELLE'] += count * 2;
            }
            if (bigram.includes('particule') || bigram.includes('particle')) {
                categoryScores['PARTICULES'] += count * 2;
            }
            if (bigram.includes('lumiere') || bigram.includes('light')) {
                categoryScores['LUMIERE_OMBRE'] += count * 2;
            }
        }
        var bestType = Object.entries(typeScores).reduce(function (a, b) {
            return typeScores[a[0]] > typeScores[b[0]] ? a : b;
        })[0] || 'VIDEO';
        var bestCategory = Object.entries(categoryScores).reduce(function (a, b) {
            return categoryScores[a[0]] > categoryScores[b[0]] ? a : b;
        })[0] || 'GENERAL';
        return { type: bestType, category: bestCategory };
    };
    LocalAIEngine.prototype.extractAdvancedConcepts = function (text, classification) {
        var concepts = [];
        // Concepts de base
        var basicConcepts = ['visual', 'dynamic', 'interactive'];
        concepts.push.apply(concepts, basicConcepts);
        // Concepts spécialisés selon la classification
        if (classification.category === 'PARTICULES') {
            concepts.push('particles', 'emission', 'physics');
        }
        if (classification.category === 'LUMIERE_OMBRE') {
            concepts.push('lighting', 'shadows', 'glow');
        }
        return __spreadArray([], new Set(concepts), true);
    };
    LocalAIEngine.prototype.calculateAIComplexity = function (concepts, semanticAnalysis) {
        var complexity = 1;
        // Complexité basée sur les concepts
        complexity += concepts.length * 0.5;
        // Complexité sémantique
        complexity += Math.min(semanticAnalysis.globalScore / 100, 5);
        // Complexité textuelle
        complexity += Math.min(semanticAnalysis.wordCount / 20, 3);
        return Math.min(Math.max(Math.round(complexity), 1), 10);
    };
    LocalAIEngine.prototype.generateSmartName = function (concepts, classification) {
        var prefixes = ['Dynamic', 'Advanced', 'Epic', 'Pro', 'Ultra'];
        var suffixes = ['Effect', 'FX', 'Visual', 'Animation'];
        var prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        var core = concepts[0] || classification.category.split('_')[0];
        var suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return "".concat(prefix).concat(core.charAt(0).toUpperCase() + core.slice(1)).concat(suffix);
    };
    LocalAIEngine.prototype.enhanceDescription = function (text, concepts) {
        var enhanced = text;
        // Enrichissement basé sur les concepts
        if (concepts.includes('particles')) {
            enhanced += " Utilise un système de particules avancé.";
        }
        if (concepts.includes('lighting')) {
            enhanced += " Intègre des effets d'éclairage dynamiques.";
        }
        return enhanced;
    };
    LocalAIEngine.prototype.extractKeywords = function (text, concepts) {
        var words = text.split(' ').filter(function (word) { return word.length > 3; });
        var keywords = __spreadArray(__spreadArray([], words.slice(0, 10), true), concepts, true);
        return __spreadArray([], new Set(keywords), true);
    };
    LocalAIEngine.prototype.initializeNeuralPatterns = function () {
        // Patterns neuronaux pré-entraînés (version simplifiée)
        var patterns = {
            'explosion': 0.9, 'particule': 0.8, 'lumiere': 0.7,
            'temps': 0.9, 'transformation': 0.8, 'morphing': 0.7,
            'psychedelique': 0.6, 'effet': 0.5, 'visual': 0.6
        };
        for (var _i = 0, _a = Object.entries(patterns); _i < _a.length; _i++) {
            var _b = _a[_i], pattern = _b[0], weight = _b[1];
            this.neuralPatterns.set(pattern, weight);
        }
    };
    LocalAIEngine.prototype.loadConceptVectors = function () {
        // Vecteurs de concepts pour analyse sémantique
        var vectors = {
            'particles': [0.9, 0.2, 0.8, 0.1],
            'lighting': [0.1, 0.9, 0.3, 0.7],
            'morphing': [0.3, 0.1, 0.9, 0.4]
        };
        for (var _i = 0, _a = Object.entries(vectors); _i < _a.length; _i++) {
            var _b = _a[_i], concept = _b[0], vector = _b[1];
            this.conceptVectors.set(concept, vector);
        }
    };
    return LocalAIEngine;
}());
// PATTERN MATCHER AVANCÉ
var PatternMatcher = /** @class */ (function () {
    function PatternMatcher() {
    }
    PatternMatcher.prototype.extractBaseData = function (text) {
        var data = { keywords: [] };
        // Extraction du nom
        var nameMatch = text.match(/\*\*([^*]+)\*\*/);
        if (nameMatch)
            data.name = nameMatch[1].trim();
        // Extraction du type
        var typeMatch = text.match(/Type\s*:\*\*\s*([^\n*]+)/i);
        if (typeMatch)
            data.type = typeMatch[1].trim();
        // Extraction de la catégorie
        var categoryMatch = text.match(/Catégorie\s*:\*\*\s*([^\n*]+)/i);
        if (categoryMatch)
            data.category = categoryMatch[1].trim();
        // Extraction de la description
        var descMatch = text.match(/Description\s*:\*\*\s*([^]+?)(?=\n\n|\d+\.|\$)/i);
        if (descMatch)
            data.description = descMatch[1].trim();
        // Extraction des mots-clés
        var words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        data.keywords = __spreadArray([], new Set(words), true).slice(0, 15);
        return data;
    };
    return PatternMatcher;
}());
// ANALYSEUR CONTEXTUEL
var ContextAnalyzer = /** @class */ (function () {
    function ContextAnalyzer() {
    }
    ContextAnalyzer.prototype.analyze = function (text, baseData) {
        var context = {
            technicalLevel: this.assessTechnicalLevel(text),
            visualComplexity: this.assessVisualComplexity(text),
            interactivity: this.assessInteractivity(text),
            performance: this.assessPerformanceNeeds(text)
        };
        return context;
    };
    ContextAnalyzer.prototype.assessTechnicalLevel = function (text) {
        var technicalTerms = ['algorithm', 'shader', 'gpu', 'optimization', 'pipeline'];
        var count = technicalTerms.filter(function (term) {
            return text.toLowerCase().includes(term);
        }).length;
        return Math.min(count * 2, 10);
    };
    ContextAnalyzer.prototype.assessVisualComplexity = function (text) {
        var complexityWords = ['complex', 'detailed', 'realistic', 'advanced', 'sophisticated'];
        var count = complexityWords.filter(function (word) {
            return text.toLowerCase().includes(word);
        }).length;
        return Math.min(count * 1.5, 10);
    };
    ContextAnalyzer.prototype.assessInteractivity = function (text) {
        var interactiveWords = ['click', 'hover', 'interaction', 'responsive', 'dynamic'];
        var count = interactiveWords.filter(function (word) {
            return text.toLowerCase().includes(word);
        }).length;
        return Math.min(count * 2, 10);
    };
    ContextAnalyzer.prototype.assessPerformanceNeeds = function (text) {
        var performanceWords = ['fast', 'smooth', 'optimized', 'efficient', 'real-time'];
        var count = performanceWords.filter(function (word) {
            return text.toLowerCase().includes(word);
        }).length;
        return Math.min(count * 1.5, 10);
    };
    return ContextAnalyzer;
}());
// VALIDATEUR QUALITÉ
var QualityValidator = /** @class */ (function () {
    function QualityValidator() {
    }
    QualityValidator.prototype.validate = function (effectData) {
        var errors = [];
        var confidence = 1.0;
        // Validation du nom
        if (!effectData.name || effectData.name.length < 3) {
            errors.push("Nom d'effet invalide ou trop court");
            confidence -= 0.2;
        }
        // Validation de la description
        if (!effectData.description || effectData.description.length < 20) {
            errors.push("Description trop courte ou manquante");
            confidence -= 0.3;
        }
        // Validation de la catégorie
        var validCategories = [
            'MANIPULATION_TEMPORELLE', 'MANIPULATION_MATIERE', 'LUMIERE_OMBRE',
            'PARTICULES', 'TRANSFORMATION', 'PSYCHEDELIQUE', 'GENERAL'
        ];
        if (!validCategories.includes(effectData.category)) {
            errors.push("Catégorie non reconnue");
            confidence -= 0.2;
        }
        // Validation de la complexité
        if (effectData.complexity < 1 || effectData.complexity > 10) {
            errors.push("Complexité hors limites");
            confidence -= 0.1;
        }
        // Validation des concepts
        if (effectData.concepts.length === 0) {
            errors.push("Aucun concept extrait");
            confidence -= 0.1;
        }
        return {
            confidence: Math.max(confidence, 0.1),
            errors: errors
        };
    };
    return QualityValidator;
}());
export var effectParserModule = new EffectParserModule();
