var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { effectParserModule } from "./effect-parser.module";
import path from "path";
import fs from "fs/promises";
var BatchProcessor = /** @class */ (function () {
    function BatchProcessor() {
        this.activeJobs = new Map();
        this.maxConcurrentJobs = 3;
        this.currentJobs = 0;
    }
    BatchProcessor.prototype.processMassiveEffectsList = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var jobId, job;
            return __generator(this, function (_a) {
                jobId = "batch_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                job = {
                    id: jobId,
                    filePath: filePath,
                    status: 'PENDING',
                    progress: 0
                };
                this.activeJobs.set(jobId, job);
                // Démarrage asynchrone du traitement
                this.processJobAsync(jobId);
                return [2 /*return*/, jobId];
            });
        });
    };
    BatchProcessor.prototype.processJobAsync = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, fileExists, results, report, error_1;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        job = this.activeJobs.get(jobId);
                        if (!job)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        // Vérification de la capacité
                        if (this.currentJobs >= this.maxConcurrentJobs) {
                            setTimeout(function () { return _this.processJobAsync(jobId); }, 5000);
                            return [2 /*return*/];
                        }
                        this.currentJobs++;
                        job.status = 'PROCESSING';
                        job.startTime = new Date();
                        job.progress = 5;
                        console.log("\uD83D\uDE80 [Batch ".concat(jobId, "] D\u00E9marrage du traitement massif"));
                        return [4 /*yield*/, this.verifyFile(job.filePath)];
                    case 2:
                        fileExists = _b.sent();
                        if (!fileExists) {
                            throw new Error("Fichier non trouv\u00E9: ".concat(job.filePath));
                        }
                        job.progress = 10;
                        // Traitement principal avec le Parser 2.0
                        console.log("\u26A1 [Batch ".concat(jobId, "] Analyse avec Parser 2.0..."));
                        return [4 /*yield*/, effectParserModule.parseEffectsList(job.filePath)];
                    case 3:
                        results = _b.sent();
                        job.progress = 80;
                        // Post-processing et optimisations
                        return [4 /*yield*/, this.postProcessResults(results, jobId)];
                    case 4:
                        // Post-processing et optimisations
                        _b.sent();
                        job.progress = 95;
                        return [4 /*yield*/, this.generateComprehensiveReport(results, jobId)];
                    case 5:
                        report = _b.sent();
                        job.results = __assign(__assign({}, results), { report: report, libraryPath: path.join(process.cwd(), 'effects-library'), totalProcessingTime: Date.now() - (((_a = job.startTime) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) });
                        job.progress = 100;
                        job.status = 'COMPLETED';
                        job.endTime = new Date();
                        console.log("\u2705 [Batch ".concat(jobId, "] Traitement termin\u00E9 avec succ\u00E8s!"));
                        console.log("\uD83D\uDCCA ".concat(results.stats.successful, "/").concat(results.stats.total, " effets trait\u00E9s"));
                        return [3 /*break*/, 8];
                    case 6:
                        error_1 = _b.sent();
                        job.status = 'FAILED';
                        job.errors = [error_1 instanceof Error ? error_1.message : 'Unknown error'];
                        job.endTime = new Date();
                        console.error("\u274C [Batch ".concat(jobId, "] \u00C9chec:"), error_1);
                        return [3 /*break*/, 8];
                    case 7:
                        this.currentJobs--;
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BatchProcessor.prototype.verifyFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var stat, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.stat(filePath)];
                    case 1:
                        stat = _b.sent();
                        return [2 /*return*/, stat.isFile() && stat.size > 0];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BatchProcessor.prototype.postProcessResults = function (results, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var categoryOptimization, duplicateDetection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD27 [Batch ".concat(jobId, "] Post-processing des r\u00E9sultats..."));
                        categoryOptimization = this.optimizeCategories(results.effects);
                        duplicateDetection = this.detectDuplicates(results.effects);
                        // Amélioration des métadonnées
                        return [4 /*yield*/, this.enhanceMetadata(results.effects)];
                    case 1:
                        // Amélioration des métadonnées
                        _a.sent();
                        // Indexation pour recherche rapide
                        return [4 /*yield*/, this.createSearchIndexes(results.effects)];
                    case 2:
                        // Indexation pour recherche rapide
                        _a.sent();
                        console.log("\u2728 [Batch ".concat(jobId, "] Post-processing termin\u00E9"));
                        return [2 /*return*/];
                }
            });
        });
    };
    BatchProcessor.prototype.optimizeCategories = function (effects) {
        // Réorganisation intelligente des catégories
        var categoryMap = new Map();
        effects.forEach(function (effect) {
            var category = effect.parsed.category;
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });
        // Fusion des catégories similaires
        effects.forEach(function (effect) {
            if (effect.parsed.category === 'GENERAL' && effect.parsed.concepts.includes('particles')) {
                effect.parsed.category = 'PARTICULES';
            }
        });
    };
    BatchProcessor.prototype.detectDuplicates = function (effects) {
        var _this = this;
        var duplicates = [];
        var seen = new Set();
        effects.forEach(function (effect) {
            var signature = _this.createEffectSignature(effect);
            if (seen.has(signature)) {
                duplicates.push(effect);
            }
            else {
                seen.add(signature);
            }
        });
        return duplicates;
    };
    BatchProcessor.prototype.createEffectSignature = function (effect) {
        var _a = effect.parsed, name = _a.name, category = _a.category, description = _a.description;
        return "".concat(category, "_").concat(name.slice(0, 10), "_").concat(description.slice(0, 20)).toLowerCase();
    };
    BatchProcessor.prototype.enhanceMetadata = function (effects) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, effects_1, effect;
            return __generator(this, function (_a) {
                for (_i = 0, effects_1 = effects; _i < effects_1.length; _i++) {
                    effect = effects_1[_i];
                    // Ajout de tags automatiques
                    effect.parsed.autoTags = this.generateAutoTags(effect.parsed);
                    // Score de popularité prédictif
                    effect.parsed.predictedPopularity = this.predictPopularity(effect.parsed);
                    // Compatibilité plateforme
                    effect.parsed.platformCompatibility = this.assessPlatformCompatibility(effect.parsed);
                }
                return [2 /*return*/];
            });
        });
    };
    BatchProcessor.prototype.generateAutoTags = function (effectData) {
        var tags = [];
        // Tags basés sur la complexité
        if (effectData.complexity <= 3)
            tags.push('simple', 'beginner-friendly');
        if (effectData.complexity >= 8)
            tags.push('advanced', 'complex');
        // Tags basés sur les concepts
        effectData.concepts.forEach(function (concept) {
            tags.push("concept-".concat(concept));
        });
        // Tags basés sur la catégorie
        tags.push("category-".concat(effectData.category.toLowerCase()));
        return __spreadArray([], new Set(tags), true);
    };
    BatchProcessor.prototype.predictPopularity = function (effectData) {
        var score = 5; // Score de base
        // Bonus pour certaines catégories populaires
        if (effectData.category === 'PARTICULES')
            score += 2;
        if (effectData.category === 'LUMIERE_OMBRE')
            score += 1.5;
        // Bonus pour complexité moyenne
        if (effectData.complexity >= 4 && effectData.complexity <= 7)
            score += 1;
        // Bonus pour performance élevée
        if (effectData.metadata.performance === 'HIGH')
            score += 1;
        return Math.min(Math.max(score, 1), 10);
    };
    BatchProcessor.prototype.assessPlatformCompatibility = function (effectData) {
        return {
            web: true,
            mobile: effectData.metadata.performance !== 'LOW',
            desktop: true,
            vr: effectData.category === 'PARTICULES' || effectData.category === 'LUMIERE_OMBRE',
            canvas: true,
            webgl: effectData.complexity >= 6
        };
    };
    BatchProcessor.prototype.createSearchIndexes = function (effects) {
        return __awaiter(this, void 0, void 0, function () {
            var indexes, indexPath, indexData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        indexes = {
                            byCategory: new Map(),
                            byComplexity: new Map(),
                            byKeywords: new Map(),
                            byConcepts: new Map()
                        };
                        effects.forEach(function (effect) {
                            var id = effect.parsed.id;
                            // Index par catégorie
                            var category = effect.parsed.category;
                            if (!indexes.byCategory.has(category)) {
                                indexes.byCategory.set(category, []);
                            }
                            indexes.byCategory.get(category).push(id);
                            // Index par complexité
                            var complexity = effect.parsed.complexity;
                            if (!indexes.byComplexity.has(complexity)) {
                                indexes.byComplexity.set(complexity, []);
                            }
                            indexes.byComplexity.get(complexity).push(id);
                            // Index par mots-clés
                            effect.parsed.keywords.forEach(function (keyword) {
                                if (!indexes.byKeywords.has(keyword)) {
                                    indexes.byKeywords.set(keyword, []);
                                }
                                indexes.byKeywords.get(keyword).push(id);
                            });
                            // Index par concepts
                            effect.parsed.concepts.forEach(function (concept) {
                                if (!indexes.byConcepts.has(concept)) {
                                    indexes.byConcepts.set(concept, []);
                                }
                                indexes.byConcepts.get(concept).push(id);
                            });
                        });
                        indexPath = path.join(process.cwd(), 'effects-library', 'search-indexes.json');
                        indexData = {
                            byCategory: Object.fromEntries(indexes.byCategory),
                            byComplexity: Object.fromEntries(indexes.byComplexity),
                            byKeywords: Object.fromEntries(indexes.byKeywords),
                            byConcepts: Object.fromEntries(indexes.byConcepts),
                            lastUpdated: new Date().toISOString()
                        };
                        return [4 /*yield*/, fs.writeFile(indexPath, JSON.stringify(indexData, null, 2))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BatchProcessor.prototype.generateComprehensiveReport = function (results, jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var report, reportPath;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            jobId: jobId,
                            summary: {
                                totalEffects: results.stats.total,
                                successfullyParsed: results.stats.successful,
                                failed: results.stats.failed,
                                successRate: (results.stats.successful / results.stats.total * 100).toFixed(2) + '%'
                            },
                            categoryBreakdown: results.stats.categories,
                            complexityDistribution: this.calculateComplexityDistribution(results.effects),
                            topKeywords: this.extractTopKeywords(results.effects),
                            qualityMetrics: this.calculateQualityMetrics(results.effects),
                            recommendations: this.generateRecommendations(results)
                        };
                        return [4 /*yield*/, this.getLibraryStructure()];
                    case 1:
                        report = (_a.libraryStructure = _b.sent(),
                            _a.generatedAt = new Date().toISOString(),
                            _a);
                        reportPath = path.join(process.cwd(), 'effects-library', "report_".concat(jobId, ".json"));
                        return [4 /*yield*/, fs.writeFile(reportPath, JSON.stringify(report, null, 2))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, report];
                }
            });
        });
    };
    BatchProcessor.prototype.calculateComplexityDistribution = function (effects) {
        var distribution = Array(10).fill(0);
        effects.forEach(function (effect) {
            if (effect.confidence > 0.7) {
                var complexity = Math.min(effect.parsed.complexity - 1, 9);
                distribution[complexity]++;
            }
        });
        return distribution;
    };
    BatchProcessor.prototype.extractTopKeywords = function (effects) {
        var keywordCount = new Map();
        effects.forEach(function (effect) {
            if (effect.confidence > 0.7) {
                effect.parsed.keywords.forEach(function (keyword) {
                    keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
                });
            }
        });
        return Array.from(keywordCount.entries())
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, 20)
            .map(function (entry) { return entry[0]; });
    };
    BatchProcessor.prototype.calculateQualityMetrics = function (effects) {
        var validEffects = effects.filter(function (e) { return e.confidence > 0.7; });
        return {
            averageConfidence: validEffects.reduce(function (sum, e) { return sum + e.confidence; }, 0) / validEffects.length,
            averageComplexity: validEffects.reduce(function (sum, e) { return sum + e.parsed.complexity; }, 0) / validEffects.length,
            averageKeywords: validEffects.reduce(function (sum, e) { return sum + e.parsed.keywords.length; }, 0) / validEffects.length,
            uniqueCategories: new Set(validEffects.map(function (e) { return e.parsed.category; })).size
        };
    };
    BatchProcessor.prototype.generateRecommendations = function (results) {
        var recommendations = [];
        if (results.stats.failed > results.stats.successful * 0.2) {
            recommendations.push("Taux d'échec élevé - considérer l'amélioration des patterns de parsing");
        }
        if (Object.keys(results.stats.categories).length < 5) {
            recommendations.push("Faible diversité de catégories - vérifier la classification");
        }
        recommendations.push("Génération automatique des effets recommandée pour maximiser la bibliothèque");
        return recommendations;
    };
    BatchProcessor.prototype.getLibraryStructure = function () {
        return __awaiter(this, void 0, void 0, function () {
            var libraryPath, entries, structure, _i, entries_1, entry, categoryPath, categoryFiles, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        libraryPath = path.join(process.cwd(), 'effects-library');
                        return [4 /*yield*/, fs.readdir(libraryPath, { withFileTypes: true })];
                    case 1:
                        entries = _b.sent();
                        structure = {};
                        _i = 0, entries_1 = entries;
                        _b.label = 2;
                    case 2:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 5];
                        entry = entries_1[_i];
                        if (!entry.isDirectory()) return [3 /*break*/, 4];
                        categoryPath = path.join(libraryPath, entry.name);
                        return [4 /*yield*/, fs.readdir(categoryPath)];
                    case 3:
                        categoryFiles = _b.sent();
                        structure[entry.name] = {
                            effectCount: categoryFiles.filter(function (f) { return f.endsWith('.json') && f !== 'index.json'; }).length,
                            hasIndex: categoryFiles.includes('index.json')
                        };
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, structure];
                    case 6:
                        _a = _b.sent();
                        return [2 /*return*/, {}];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // API publiques
    BatchProcessor.prototype.getJobStatus = function (jobId) {
        return this.activeJobs.get(jobId) || null;
    };
    BatchProcessor.prototype.getAllJobs = function () {
        return Array.from(this.activeJobs.values());
    };
    BatchProcessor.prototype.cancelJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job;
            return __generator(this, function (_a) {
                job = this.activeJobs.get(jobId);
                if (job && job.status === 'PROCESSING') {
                    job.status = 'FAILED';
                    job.errors = ['Job cancelled by user'];
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            });
        });
    };
    return BatchProcessor;
}());
export var batchProcessor = new BatchProcessor();
