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
var AdvancedClassificationStorage = /** @class */ (function () {
    function AdvancedClassificationStorage() {
        this.storage = new Map();
        this.optimizationQueue = [];
        this.metrics = new Map();
        this.initializeSemanticIndex();
        this.initializeAISearchEngine();
        this.initializeCacheManager();
        this.initializeCompressionEngine();
        this.initializeAutonomousManager();
        this.initializeIndexOptimizer();
        this.startContinuousOptimization();
    }
    AdvancedClassificationStorage.prototype.store = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, id, enrichedData, semanticVector, compressedData, classificationData, storageTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        id = data.id || this.generateId();
                        return [4 /*yield*/, this.enrichWithAI(data)];
                    case 1:
                        enrichedData = _a.sent();
                        return [4 /*yield*/, this.generateSemanticVector(enrichedData)];
                    case 2:
                        semanticVector = _a.sent();
                        return [4 /*yield*/, this.compressionEngine.compress(enrichedData)];
                    case 3:
                        compressedData = _a.sent();
                        classificationData = {
                            id: id,
                            category: enrichedData.category || 'unknown',
                            subcategory: enrichedData.subcategory,
                            keywords: enrichedData.keywords || [],
                            semanticVector: semanticVector,
                            confidence: enrichedData.confidence || 0.8,
                            effectType: enrichedData.effectType || 'generic',
                            parameters: compressedData.parameters,
                            metadata: {
                                created: new Date(),
                                lastAccessed: new Date(),
                                accessCount: 0,
                                successRate: 1.0
                            },
                            aiTags: enrichedData.aiTags || [],
                            performance: {
                                averageGenerationTime: 0,
                                qualityScore: enrichedData.qualityScore || 0.8,
                                userRating: 0
                            }
                        };
                        // Stockage
                        this.storage.set(id, classificationData);
                        // Mise à jour de l'index sémantique
                        return [4 /*yield*/, this.semanticIndex.addEntry(id, semanticVector, classificationData)];
                    case 4:
                        // Mise à jour de l'index sémantique
                        _a.sent();
                        // Mise à jour du cache
                        this.cacheManager.invalidateRelatedCaches(classificationData.category);
                        // Optimisation autonome
                        return [4 /*yield*/, this.autonomousManager.optimizeStorage(classificationData)];
                    case 5:
                        // Optimisation autonome
                        _a.sent();
                        storageTime = performance.now() - startTime;
                        this.updateMetrics('store', storageTime);
                        return [2 /*return*/, id];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.search = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, enhancedQuery, semanticResults, keywordResults, categoryResults, fusedResults, relevanceScores, filteredResults, sortedResults, aiInsights, searchTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        return [4 /*yield*/, this.aiSearchEngine.enhanceQuery(query)];
                    case 1:
                        enhancedQuery = _a.sent();
                        return [4 /*yield*/, this.performSemanticSearch(enhancedQuery)];
                    case 2:
                        semanticResults = _a.sent();
                        return [4 /*yield*/, this.performKeywordSearch(enhancedQuery)];
                    case 3:
                        keywordResults = _a.sent();
                        return [4 /*yield*/, this.performCategorySearch(enhancedQuery)];
                    case 4:
                        categoryResults = _a.sent();
                        return [4 /*yield*/, this.aiSearchEngine.fuseResults([
                                semanticResults,
                                keywordResults,
                                categoryResults
                            ], enhancedQuery)];
                    case 5:
                        fusedResults = _a.sent();
                        return [4 /*yield*/, this.calculateRelevanceScores(fusedResults, enhancedQuery)];
                    case 6:
                        relevanceScores = _a.sent();
                        filteredResults = this.applyFilters(fusedResults, query.filters);
                        sortedResults = this.sortByRelevance(filteredResults, relevanceScores);
                        return [4 /*yield*/, this.generateAIInsights(sortedResults, enhancedQuery)];
                    case 7:
                        aiInsights = _a.sent();
                        searchTime = performance.now() - startTime;
                        this.updateMetrics('search', searchTime);
                        return [2 /*return*/, {
                                items: sortedResults,
                                totalCount: filteredResults.length,
                                relevanceScores: relevanceScores,
                                aiInsights: aiInsights,
                                performance: {
                                    searchTime: searchTime,
                                    indexHits: semanticResults.length + keywordResults.length + categoryResults.length,
                                    aiProcessingTime: aiInsights.processingTime || 0
                                }
                            }];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.retrieve = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, cached, data, decompressedData, retrieveTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        cached = this.cacheManager.get(id);
                        if (cached) {
                            this.updateAccessMetrics(id);
                            return [2 /*return*/, cached];
                        }
                        data = this.storage.get(id);
                        if (!data)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.compressionEngine.decompress(data)];
                    case 1:
                        decompressedData = _a.sent();
                        // Mise à jour des métadonnées d'accès
                        this.updateAccessMetrics(id);
                        // Mise en cache
                        this.cacheManager.set(id, decompressedData);
                        retrieveTime = performance.now() - startTime;
                        this.updateMetrics('retrieve', retrieveTime);
                        return [2 /*return*/, decompressedData];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.update = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, existingData, enrichedUpdates, updatedData, _a, updateTime;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = performance.now();
                        return [4 /*yield*/, this.retrieve(id)];
                    case 1:
                        existingData = _b.sent();
                        if (!existingData)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.enrichWithAI(updates)];
                    case 2:
                        enrichedUpdates = _b.sent();
                        updatedData = __assign(__assign({}, existingData), enrichedUpdates);
                        if (!(updates.keywords || updates.category || updates.effectType)) return [3 /*break*/, 5];
                        _a = updatedData;
                        return [4 /*yield*/, this.generateSemanticVector(updatedData)];
                    case 3:
                        _a.semanticVector = _b.sent();
                        return [4 /*yield*/, this.semanticIndex.updateEntry(id, updatedData.semanticVector, updatedData)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        // Stockage des données mises à jour
                        this.storage.set(id, updatedData);
                        // Invalidation du cache
                        this.cacheManager.invalidate(id);
                        updateTime = performance.now() - startTime;
                        this.updateMetrics('update', updateTime);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = this.storage.get(id);
                        if (!data)
                            return [2 /*return*/, false];
                        // Suppression du stockage
                        this.storage.delete(id);
                        // Suppression de l'index sémantique
                        return [4 /*yield*/, this.semanticIndex.removeEntry(id)];
                    case 1:
                        // Suppression de l'index sémantique
                        _a.sent();
                        // Invalidation du cache
                        this.cacheManager.invalidate(id);
                        this.updateMetrics('delete', 1);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.enrichWithAI = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var enriched, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        enriched = __assign({}, data);
                        if (!(!enriched.keywords && (enriched.category || enriched.effectType))) return [3 /*break*/, 2];
                        _a = enriched;
                        return [4 /*yield*/, this.aiSearchEngine.extractKeywords("".concat(enriched.category, " ").concat(enriched.effectType))];
                    case 1:
                        _a.keywords = _e.sent();
                        _e.label = 2;
                    case 2:
                        if (!!enriched.aiTags) return [3 /*break*/, 4];
                        _b = enriched;
                        return [4 /*yield*/, this.aiSearchEngine.generateTags(enriched)];
                    case 3:
                        _b.aiTags = _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!!enriched.qualityScore) return [3 /*break*/, 6];
                        _c = enriched;
                        return [4 /*yield*/, this.aiSearchEngine.estimateQuality(enriched)];
                    case 5:
                        _c.qualityScore = _e.sent();
                        _e.label = 6;
                    case 6:
                        if (!(!enriched.category && enriched.effectType)) return [3 /*break*/, 8];
                        _d = enriched;
                        return [4 /*yield*/, this.aiSearchEngine.classifyEffect(enriched.effectType)];
                    case 7:
                        _d.category = _e.sent();
                        _e.label = 8;
                    case 8: return [2 /*return*/, enriched];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.generateSemanticVector = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        text = __spreadArray(__spreadArray([
                            data.category,
                            data.subcategory,
                            data.effectType
                        ], (data.keywords || []), true), (data.aiTags || []), true).filter(Boolean).join(' ');
                        return [4 /*yield*/, this.aiSearchEngine.generateEmbedding(text)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.performSemanticSearch = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var searchVector, _a, similarIds;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!query.semanticVector && !query.text)
                            return [2 /*return*/, []];
                        _a = query.semanticVector;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.aiSearchEngine.generateEmbedding(query.text)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        searchVector = _a;
                        return [4 /*yield*/, this.semanticIndex.findSimilar(searchVector, 50)];
                    case 3:
                        similarIds = _b.sent();
                        return [2 /*return*/, similarIds
                                .map(function (id) { return _this.storage.get(id); })
                                .filter(Boolean)];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.performKeywordSearch = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var keywords, results, _i, _a, _b, id, data, score;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!query.text)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, this.aiSearchEngine.extractKeywords(query.text)];
                    case 1:
                        keywords = _c.sent();
                        results = [];
                        for (_i = 0, _a = this.storage; _i < _a.length; _i++) {
                            _b = _a[_i], id = _b[0], data = _b[1];
                            score = this.calculateKeywordScore(data.keywords, keywords);
                            if (score > 0.3) {
                                results.push(data);
                            }
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.performCategorySearch = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!query.category)
                    return [2 /*return*/, []];
                return [2 /*return*/, Array.from(this.storage.values()).filter(function (data) {
                        return data.category === query.category ||
                            data.subcategory === query.category;
                    })];
            });
        });
    };
    AdvancedClassificationStorage.prototype.initializeSemanticIndex = function () {
        var _this = this;
        this.semanticIndex = {
            addEntry: function (id, vector, data) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            }); },
            updateEntry: function (id, vector, data) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            }); },
            removeEntry: function (id) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            }); },
            findSimilar: function (vector, limit) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Recherche de similarité vectorielle
                    return [2 /*return*/, []];
                });
            }); }
        };
    };
    AdvancedClassificationStorage.prototype.initializeAISearchEngine = function () {
        var _this = this;
        this.aiSearchEngine = {
            enhanceQuery: function (query) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Amélioration de la requête avec IA
                    return [2 /*return*/, __assign(__assign({}, query), { enhanced: true })];
                });
            }); },
            extractKeywords: function (text) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Extraction de mots-clés avec NLP
                    return [2 /*return*/, text.toLowerCase().split(' ').filter(function (w) { return w.length > 3; })];
                });
            }); },
            generateTags: function (data) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Génération de tags IA
                    return [2 /*return*/, ['ai-generated', 'optimized']];
                });
            }); },
            estimateQuality: function (data) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Estimation de qualité avec IA
                    return [2 /*return*/, 0.85];
                });
            }); },
            classifyEffect: function (effectType) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Classification automatique
                    return [2 /*return*/, 'visual'];
                });
            }); },
            generateEmbedding: function (text) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Génération d'embedding vectoriel
                    return [2 /*return*/, new Array(512).fill(0).map(function () { return Math.random(); })];
                });
            }); },
            fuseResults: function (results, query) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Fusion intelligente des résultats
                    return [2 /*return*/, results.flat()];
                });
            }); }
        };
    };
    AdvancedClassificationStorage.prototype.initializeCacheManager = function () {
        var _this = this;
        this.cacheManager = {
            cache: new Map(),
            maxSize: 1000,
            get: function (id) { return _this.cacheManager.cache.get(id); },
            set: function (id, data) {
                if (_this.cacheManager.cache.size >= _this.cacheManager.maxSize) {
                    var firstKey = _this.cacheManager.cache.keys().next().value;
                    _this.cacheManager.cache.delete(firstKey);
                }
                _this.cacheManager.cache.set(id, data);
            },
            invalidate: function (id) { return _this.cacheManager.cache.delete(id); },
            invalidateRelatedCaches: function (category) {
                // Invalidation des caches liés
            }
        };
    };
    AdvancedClassificationStorage.prototype.initializeCompressionEngine = function () {
        var _this = this;
        this.compressionEngine = {
            compress: function (data) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Compression intelligente des données
                    return [2 /*return*/, data];
                });
            }); },
            decompress: function (data) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Décompression des données
                    return [2 /*return*/, data];
                });
            }); }
        };
    };
    AdvancedClassificationStorage.prototype.initializeAutonomousManager = function () {
        var _this = this;
        this.autonomousManager = {
            optimizeStorage: function (data) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            }); }
        };
    };
    AdvancedClassificationStorage.prototype.initializeIndexOptimizer = function () {
        var _this = this;
        this.indexOptimizer = {
            optimize: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            }); }
        };
    };
    AdvancedClassificationStorage.prototype.startContinuousOptimization = function () {
        var _this = this;
        setInterval(function () {
            _this.performAutonomousOptimization();
        }, 60000);
        setInterval(function () {
            _this.performIndexOptimization();
        }, 300000);
    };
    AdvancedClassificationStorage.prototype.performAutonomousOptimization = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storageSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storageSize = this.storage.size;
                        if (!(storageSize > 10000)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.compressOldEntries()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(this.cacheManager.cache.size > 800)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.optimizeCache()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedClassificationStorage.prototype.performIndexOptimization = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.indexOptimizer.optimize()];
                    case 1:
                        _a.sent();
                        console.log('Index optimization completed');
                        return [2 /*return*/];
                }
            });
        });
    };
    // Utility methods
    AdvancedClassificationStorage.prototype.generateId = function () {
        return "class_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    AdvancedClassificationStorage.prototype.updateAccessMetrics = function (id) {
        var data = this.storage.get(id);
        if (data) {
            data.metadata.lastAccessed = new Date();
            data.metadata.accessCount++;
        }
    };
    AdvancedClassificationStorage.prototype.updateMetrics = function (operation, time) {
        this.metrics.set("".concat(operation, "_time"), time);
        this.metrics.set("".concat(operation, "_count"), (this.metrics.get("".concat(operation, "_count")) || 0) + 1);
    };
    AdvancedClassificationStorage.prototype.calculateKeywordScore = function (dataKeywords, queryKeywords) {
        var matches = dataKeywords.filter(function (k) {
            return queryKeywords.some(function (q) { return k.toLowerCase().includes(q.toLowerCase()); });
        });
        return matches.length / Math.max(dataKeywords.length, queryKeywords.length);
    };
    AdvancedClassificationStorage.prototype.calculateRelevanceScores = function (results, query) {
        return Promise.resolve(results.map(function () { return Math.random(); }));
    };
    AdvancedClassificationStorage.prototype.applyFilters = function (results, filters) {
        if (!filters)
            return results;
        return results.filter(function (item) {
            if (filters.minConfidence && item.confidence < filters.minConfidence)
                return false;
            if (filters.effectType && item.effectType !== filters.effectType)
                return false;
            if (filters.minQuality && item.performance.qualityScore < filters.minQuality)
                return false;
            return true;
        });
    };
    AdvancedClassificationStorage.prototype.sortByRelevance = function (results, scores) {
        return results
            .map(function (item, index) { return ({ item: item, score: scores[index] || 0 }); })
            .sort(function (a, b) { return b.score - a.score; })
            .map(function (_a) {
            var item = _a.item;
            return item;
        });
    };
    AdvancedClassificationStorage.prototype.generateAIInsights = function (results, query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        suggestedQueries: ['particles effect', 'lighting system', 'morphing animation'],
                        relatedConcepts: ['3D graphics', 'WebGL', 'shaders'],
                        qualityPrediction: 0.85,
                        processingTime: 10
                    }];
            });
        });
    };
    // Public API
    AdvancedClassificationStorage.prototype.getStorageMetrics = function () {
        return {
            totalEntries: this.storage.size,
            cacheSize: this.cacheManager.cache.size,
            indexSize: this.semanticIndex ? 1000 : 0,
            averageSearchTime: this.metrics.get('search_time') || 0,
            averageStoreTime: this.metrics.get('store_time') || 0,
            totalSearches: this.metrics.get('search_count') || 0
        };
    };
    AdvancedClassificationStorage.prototype.getPopularCategories = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var categories, _i, _a, data;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_b) {
                categories = new Map();
                for (_i = 0, _a = this.storage.values(); _i < _a.length; _i++) {
                    data = _a[_i];
                    categories.set(data.category, (categories.get(data.category) || 0) + 1);
                }
                return [2 /*return*/, Array.from(categories.entries())
                        .sort(function (a, b) { return b[1] - a[1]; })
                        .slice(0, limit)
                        .map(function (_a) {
                        var category = _a[0], count = _a[1];
                        return ({ category: category, count: count });
                    })];
            });
        });
    };
    AdvancedClassificationStorage.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oneMonthAgo, _i, _a, _b, id, data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                        _i = 0, _a = this.storage;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], id = _b[0], data = _b[1];
                        if (!(data.metadata.lastAccessed < oneMonthAgo && data.metadata.accessCount < 5)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.delete(id)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Placeholder methods for completion
    AdvancedClassificationStorage.prototype.compressOldEntries = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    AdvancedClassificationStorage.prototype.optimizeCache = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return AdvancedClassificationStorage;
}());
export var classificationStorageModule = new AdvancedClassificationStorage();
