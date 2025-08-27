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
import { storage } from "../storage";
var LibraryDatabase = /** @class */ (function () {
    function LibraryDatabase() {
    }
    // Advanced search with filtering and sorting
    LibraryDatabase.prototype.search = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var query, category, type, platform, tags_1, complexity_1, performance_1, _a, sortBy_1, _b, sortOrder_1, _c, limit, _d, offset, allEffectsResult, filteredEffects, stats, paginatedEffects, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        query = options.query, category = options.category, type = options.type, platform = options.platform, tags_1 = options.tags, complexity_1 = options.complexity, performance_1 = options.performance, _a = options.sortBy, sortBy_1 = _a === void 0 ? 'createdAt' : _a, _b = options.sortOrder, sortOrder_1 = _b === void 0 ? 'desc' : _b, _c = options.limit, limit = _c === void 0 ? 20 : _c, _d = options.offset, offset = _d === void 0 ? 0 : _d;
                        return [4 /*yield*/, storage.getEffects({
                                category: category,
                                type: type,
                                platform: platform,
                                search: query,
                                limit: 1000, // Get all for advanced filtering
                                offset: 0
                            })];
                    case 1:
                        allEffectsResult = _e.sent();
                        filteredEffects = allEffectsResult.effects;
                        // Apply advanced filters
                        if (tags_1 && tags_1.length > 0) {
                            filteredEffects = filteredEffects.filter(function (effect) {
                                return tags_1.some(function (tag) { return effect.tags.includes(tag); });
                            });
                        }
                        if (complexity_1 !== undefined) {
                            filteredEffects = filteredEffects.filter(function (effect) {
                                return effect.complexity === complexity_1;
                            });
                        }
                        if (performance_1) {
                            filteredEffects = filteredEffects.filter(function (effect) {
                                return effect.performance === performance_1;
                            });
                        }
                        // Apply sorting
                        filteredEffects.sort(function (a, b) {
                            var compareValue = 0;
                            switch (sortBy_1) {
                                case 'name':
                                    compareValue = a.name.localeCompare(b.name);
                                    break;
                                case 'rating':
                                    compareValue = (a.rating || 0) - (b.rating || 0);
                                    break;
                                case 'downloads':
                                    compareValue = (a.downloads || 0) - (b.downloads || 0);
                                    break;
                                case 'complexity':
                                    compareValue = a.complexity - b.complexity;
                                    break;
                                case 'createdAt':
                                default:
                                    compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                                    break;
                            }
                            return sortOrder_1 === 'desc' ? -compareValue : compareValue;
                        });
                        stats = {
                            avgComplexity: filteredEffects.length > 0
                                ? filteredEffects.reduce(function (sum, e) { return sum + e.complexity; }, 0) / filteredEffects.length
                                : 0,
                            avgRating: filteredEffects.length > 0
                                ? filteredEffects.reduce(function (sum, e) { return sum + (e.rating || 0); }, 0) / filteredEffects.length
                                : 0,
                            totalDownloads: filteredEffects.reduce(function (sum, e) { return sum + (e.downloads || 0); }, 0)
                        };
                        paginatedEffects = filteredEffects.slice(offset, offset + limit);
                        return [2 /*return*/, {
                                effects: paginatedEffects,
                                total: filteredEffects.length,
                                stats: stats
                            }];
                    case 2:
                        error_1 = _e.sent();
                        console.error('Library search error:', error_1);
                        throw new Error("Search failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get library statistics
    LibraryDatabase.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allEffectsResult, effects, stats_1, effectsWithRating, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, storage.getEffects({ limit: 10000 })];
                    case 1:
                        allEffectsResult = _a.sent();
                        effects = allEffectsResult.effects;
                        stats_1 = {
                            totalEffects: effects.length,
                            byCategory: {},
                            byType: {},
                            byPlatform: {},
                            averageRating: 0,
                            totalDownloads: 0,
                            complexityDistribution: {}
                        };
                        // Calculate distributions
                        effects.forEach(function (effect) {
                            // Category distribution
                            stats_1.byCategory[effect.category] = (stats_1.byCategory[effect.category] || 0) + 1;
                            // Type distribution
                            stats_1.byType[effect.type] = (stats_1.byType[effect.type] || 0) + 1;
                            // Platform distribution
                            stats_1.byPlatform[effect.platform] = (stats_1.byPlatform[effect.platform] || 0) + 1;
                            // Complexity distribution
                            var complexityRange = _this.getComplexityRange(effect.complexity);
                            stats_1.complexityDistribution[complexityRange] = (stats_1.complexityDistribution[complexityRange] || 0) + 1;
                            // Accumulate totals
                            stats_1.totalDownloads += effect.downloads || 0;
                        });
                        effectsWithRating = effects.filter(function (e) { return e.rating && e.rating > 0; });
                        stats_1.averageRating = effectsWithRating.length > 0
                            ? effectsWithRating.reduce(function (sum, e) { return sum + (e.rating || 0); }, 0) / effectsWithRating.length
                            : 0;
                        return [2 /*return*/, stats_1];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error getting library stats:', error_2);
                        throw new Error("Failed to get library stats: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LibraryDatabase.prototype.getComplexityRange = function (complexity) {
        if (complexity <= 3)
            return 'Simple';
        if (complexity <= 6)
            return 'Medium';
        if (complexity <= 8)
            return 'Complex';
        return 'Advanced';
    };
    // Get similar effects based on tags and type
    LibraryDatabase.prototype.getSimilarEffects = function (effectId_1) {
        return __awaiter(this, arguments, void 0, function (effectId, limit) {
            var targetEffect_1, allEffectsResult, allEffects, scored, error_3;
            var _this = this;
            if (limit === void 0) { limit = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, storage.getEffect(effectId)];
                    case 1:
                        targetEffect_1 = _a.sent();
                        if (!targetEffect_1)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, storage.getEffects({ limit: 1000 })];
                    case 2:
                        allEffectsResult = _a.sent();
                        allEffects = allEffectsResult.effects.filter(function (e) { return e.id !== effectId; });
                        scored = allEffects.map(function (effect) { return ({
                            effect: effect,
                            score: _this.calculateSimilarityScore(targetEffect_1, effect)
                        }); });
                        // Sort by similarity score and return top results
                        return [2 /*return*/, scored
                                .sort(function (a, b) { return b.score - a.score; })
                                .slice(0, limit)
                                .map(function (item) { return item.effect; })];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error getting similar effects:', error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LibraryDatabase.prototype.calculateSimilarityScore = function (effect1, effect2) {
        var score = 0;
        // Type match (highest weight)
        if (effect1.type === effect2.type)
            score += 10;
        // Category match (high weight)
        if (effect1.category === effect2.category)
            score += 8;
        // Platform match (medium weight)
        if (effect1.platform === effect2.platform)
            score += 5;
        // Complexity similarity (medium weight)
        var complexityDiff = Math.abs(effect1.complexity - effect2.complexity);
        score += Math.max(0, 5 - complexityDiff);
        // Tag overlap (variable weight based on number of matching tags)
        var commonTags = effect1.tags.filter(function (tag) { return effect2.tags.includes(tag); });
        score += commonTags.length * 2;
        // Performance match (low weight)
        if (effect1.performance === effect2.performance)
            score += 2;
        return score;
    };
    // Get trending effects (high download rate, recent, good ratings)
    LibraryDatabase.prototype.getTrendingEffects = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var allEffectsResult, effects, now_1, oneDayMs_1, scored, error_4;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, storage.getEffects({ limit: 1000 })];
                    case 1:
                        allEffectsResult = _a.sent();
                        effects = allEffectsResult.effects;
                        now_1 = Date.now();
                        oneDayMs_1 = 24 * 60 * 60 * 1000;
                        scored = effects.map(function (effect) {
                            var daysOld = (now_1 - new Date(effect.createdAt).getTime()) / oneDayMs_1;
                            var recencyFactor = Math.max(0, 1 - daysOld / 30); // Favor effects less than 30 days old
                            var downloadScore = (effect.downloads || 0) / 100; // Normalize downloads
                            var ratingScore = (effect.rating || 0) * 2; // Rating out of 5, weight by 2
                            return {
                                effect: effect,
                                score: (downloadScore + ratingScore) * recencyFactor
                            };
                        });
                        return [2 /*return*/, scored
                                .sort(function (a, b) { return b.score - a.score; })
                                .slice(0, limit)
                                .map(function (item) { return item.effect; })];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error getting trending effects:', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Auto-tag effects based on content analysis
    LibraryDatabase.prototype.autoTagEffect = function (effectId) {
        return __awaiter(this, void 0, void 0, function () {
            var effect, newTags_1, codeContent, descriptionContent, allContent_1, tagRules, colors, sizes, updatedTags, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, storage.getEffect(effectId)];
                    case 1:
                        effect = _a.sent();
                        if (!effect)
                            return [2 /*return*/, []];
                        newTags_1 = new Set(effect.tags);
                        codeContent = effect.code.toLowerCase();
                        descriptionContent = effect.description.toLowerCase();
                        allContent_1 = "".concat(codeContent, " ").concat(descriptionContent);
                        tagRules = [
                            { keywords: ['particle', 'spark', 'dust', 'debris'], tag: 'particles' },
                            { keywords: ['explosion', 'burst', 'blast', 'boom'], tag: 'explosion' },
                            { keywords: ['fire', 'flame', 'burn', 'ember'], tag: 'fire' },
                            { keywords: ['water', 'liquid', 'splash', 'wave'], tag: 'water' },
                            { keywords: ['light', 'glow', 'shine', 'bright'], tag: 'lighting' },
                            { keywords: ['smoke', 'fog', 'mist', 'vapor'], tag: 'atmospheric' },
                            { keywords: ['electric', 'lightning', 'bolt', 'shock'], tag: 'electric' },
                            { keywords: ['magic', 'spell', 'enchant', 'mystical'], tag: 'magic' },
                            { keywords: ['energy', 'power', 'force', 'aura'], tag: 'energy' },
                            { keywords: ['transform', 'morph', 'change', 'shift'], tag: 'transformation' },
                            { keywords: ['trail', 'path', 'trace', 'follow'], tag: 'trail' },
                            { keywords: ['dissolve', 'fade', 'disappear'], tag: 'fade' },
                            { keywords: ['appear', 'materialize', 'spawn'], tag: 'spawn' },
                            { keywords: ['rotate', 'spin', 'twist', 'swirl'], tag: 'rotation' },
                            { keywords: ['scale', 'grow', 'shrink', 'resize'], tag: 'scaling' }
                        ];
                        // Apply tagging rules
                        tagRules.forEach(function (rule) {
                            if (rule.keywords.some(function (keyword) { return allContent_1.includes(keyword); })) {
                                newTags_1.add(rule.tag);
                            }
                        });
                        colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'white', 'black'];
                        colors.forEach(function (color) {
                            if (allContent_1.includes(color)) {
                                newTags_1.add(color);
                            }
                        });
                        sizes = ['small', 'large', 'tiny', 'huge', 'massive', 'mini', 'big'];
                        sizes.forEach(function (size) {
                            if (allContent_1.includes(size)) {
                                newTags_1.add(size);
                            }
                        });
                        updatedTags = Array.from(newTags_1);
                        // Update the effect with new tags
                        return [4 /*yield*/, storage.updateEffect(effectId, { tags: updatedTags })];
                    case 2:
                        // Update the effect with new tags
                        _a.sent();
                        return [2 /*return*/, updatedTags];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error auto-tagging effect:', error_5);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Cleanup and maintenance methods
    LibraryDatabase.prototype.cleanupLibrary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allEffectsResult, effects, duplicatesRemoved, invalidEffectsRemoved, tagsUpdated, seen, _i, effects_1, effect, signature, _a, effects_2, effect, _b, effects_3, effect, newTags, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 15, , 16]);
                        return [4 /*yield*/, storage.getEffects({ limit: 10000 })];
                    case 1:
                        allEffectsResult = _c.sent();
                        effects = allEffectsResult.effects;
                        duplicatesRemoved = 0;
                        invalidEffectsRemoved = 0;
                        tagsUpdated = 0;
                        seen = new Set();
                        _i = 0, effects_1 = effects;
                        _c.label = 2;
                    case 2:
                        if (!(_i < effects_1.length)) return [3 /*break*/, 6];
                        effect = effects_1[_i];
                        signature = "".concat(effect.name, ":").concat(effect.code.slice(0, 100));
                        if (!seen.has(signature)) return [3 /*break*/, 4];
                        return [4 /*yield*/, storage.deleteEffect(effect.id)];
                    case 3:
                        _c.sent();
                        duplicatesRemoved++;
                        return [3 /*break*/, 5];
                    case 4:
                        seen.add(signature);
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6:
                        _a = 0, effects_2 = effects;
                        _c.label = 7;
                    case 7:
                        if (!(_a < effects_2.length)) return [3 /*break*/, 10];
                        effect = effects_2[_a];
                        if (!(!effect.code || effect.code.trim().length < 50 || !effect.name || effect.name.trim().length === 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, storage.deleteEffect(effect.id)];
                    case 8:
                        _c.sent();
                        invalidEffectsRemoved++;
                        _c.label = 9;
                    case 9:
                        _a++;
                        return [3 /*break*/, 7];
                    case 10:
                        _b = 0, effects_3 = effects;
                        _c.label = 11;
                    case 11:
                        if (!(_b < effects_3.length)) return [3 /*break*/, 14];
                        effect = effects_3[_b];
                        if (!(effect.tags.length < 3)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.autoTagEffect(effect.id)];
                    case 12:
                        newTags = _c.sent();
                        if (newTags.length > effect.tags.length) {
                            tagsUpdated++;
                        }
                        _c.label = 13;
                    case 13:
                        _b++;
                        return [3 /*break*/, 11];
                    case 14: return [2 /*return*/, {
                            duplicatesRemoved: duplicatesRemoved,
                            invalidEffectsRemoved: invalidEffectsRemoved,
                            tagsUpdated: tagsUpdated
                        }];
                    case 15:
                        error_6 = _c.sent();
                        console.error('Error cleaning up library:', error_6);
                        throw new Error("Cleanup failed: ".concat(error_6 instanceof Error ? error_6.message : 'Unknown error'));
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    // Export/Import functionality
    LibraryDatabase.prototype.exportLibrary = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var searchResult, effects, error_7;
            if (options === void 0) { options = { format: 'json' }; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.search(options.filters || {})];
                    case 1:
                        searchResult = _a.sent();
                        effects = searchResult.effects;
                        if (options.format === 'csv') {
                            return [2 /*return*/, this.exportToCSV(effects)];
                        }
                        else {
                            return [2 /*return*/, JSON.stringify({
                                    exportedAt: new Date().toISOString(),
                                    count: effects.length,
                                    effects: effects
                                }, null, 2)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Error exporting library:', error_7);
                        throw new Error("Export failed: ".concat(error_7 instanceof Error ? error_7.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LibraryDatabase.prototype.exportToCSV = function (effects) {
        var headers = ['id', 'name', 'description', 'type', 'category', 'platform', 'complexity', 'performance', 'rating', 'downloads', 'tags', 'createdAt'];
        var csvRows = [headers.join(',')];
        effects.forEach(function (effect) {
            var row = [
                effect.id,
                "\"".concat(effect.name.replace(/"/g, '""'), "\""),
                "\"".concat(effect.description.replace(/"/g, '""'), "\""),
                effect.type,
                effect.category,
                effect.platform,
                effect.complexity,
                effect.performance,
                effect.rating || 0,
                effect.downloads || 0,
                "\"".concat(effect.tags.join(', '), "\""),
                effect.createdAt
            ];
            csvRows.push(row.join(','));
        });
        return csvRows.join('\n');
    };
    // Get recommendations for a user based on their usage patterns
    LibraryDatabase.prototype.getRecommendations = function (recentDownloads_1) {
        return __awaiter(this, arguments, void 0, function (recentDownloads, limit) {
            var downloadedEffects, validDownloaded, preferredTypes, preferredCategories, preferredTags, recommendations_1, _i, validDownloaded_1, effect, similar, searchResult, error_8;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        if (recentDownloads.length === 0) {
                            // If no download history, return trending effects
                            return [2 /*return*/, this.getTrendingEffects(limit)];
                        }
                        return [4 /*yield*/, Promise.all(recentDownloads.map(function (id) { return storage.getEffect(id); }))];
                    case 1:
                        downloadedEffects = _a.sent();
                        validDownloaded = downloadedEffects.filter(Boolean);
                        preferredTypes = this.getTopValues(validDownloaded.map(function (e) { return e.type; }));
                        preferredCategories = this.getTopValues(validDownloaded.map(function (e) { return e.category; }));
                        preferredTags = this.getTopValues(validDownloaded.flatMap(function (e) { return e.tags; }));
                        recommendations_1 = new Set();
                        _i = 0, validDownloaded_1 = validDownloaded;
                        _a.label = 2;
                    case 2:
                        if (!(_i < validDownloaded_1.length)) return [3 /*break*/, 5];
                        effect = validDownloaded_1[_i];
                        return [4 /*yield*/, this.getSimilarEffects(effect.id, 3)];
                    case 3:
                        similar = _a.sent();
                        similar.forEach(function (e) { return recommendations_1.add(e); });
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.search({
                            type: preferredTypes[0],
                            category: preferredCategories[0],
                            tags: preferredTags.slice(0, 3),
                            limit: limit * 2
                        })];
                    case 6:
                        searchResult = _a.sent();
                        searchResult.effects.forEach(function (e) {
                            if (!recentDownloads.includes(e.id)) {
                                recommendations_1.add(e);
                            }
                        });
                        return [2 /*return*/, Array.from(recommendations_1).slice(0, limit)];
                    case 7:
                        error_8 = _a.sent();
                        console.error('Error getting recommendations:', error_8);
                        return [2 /*return*/, this.getTrendingEffects(limit)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    LibraryDatabase.prototype.getTopValues = function (values) {
        var counts = new Map();
        values.forEach(function (value) {
            counts.set(value, (counts.get(value) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort(function (a, b) { return b[1] - a[1]; })
            .map(function (_a) {
            var value = _a[0];
            return value;
        });
    };
    return LibraryDatabase;
}());
export var libraryDatabase = new LibraryDatabase();
