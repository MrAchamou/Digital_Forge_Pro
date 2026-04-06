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
import fs from 'fs/promises';
import path from 'path';
var LibraryInitializer = /** @class */ (function () {
    function LibraryInitializer() {
        this.libraryPath = path.join(process.cwd(), 'effects-library');
    }
    LibraryInitializer.prototype.initializeLibrary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var categories, _i, categories_1, category, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔧 Initialisation de la bibliothèque d\'effets...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        // Créer le dossier principal
                        return [4 /*yield*/, fs.mkdir(this.libraryPath, { recursive: true })];
                    case 2:
                        // Créer le dossier principal
                        _a.sent();
                        categories = [
                            'MANIPULATION_TEMPORELLE',
                            'PARTICULES',
                            'LUMIERE_OMBRE',
                            'MORPHING',
                            'PHYSIQUE',
                            'DIGITAL',
                            'ATMOSPHERIC'
                        ];
                        _i = 0, categories_1 = categories;
                        _a.label = 3;
                    case 3:
                        if (!(_i < categories_1.length)) return [3 /*break*/, 6];
                        category = categories_1[_i];
                        return [4 /*yield*/, this.createCategory(category)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: 
                    // Créer quelques effets d'exemple
                    return [4 /*yield*/, this.createSampleEffects()];
                    case 7:
                        // Créer quelques effets d'exemple
                        _a.sent();
                        // Créer l'index global
                        return [4 /*yield*/, this.createGlobalIndex(categories)];
                    case 8:
                        // Créer l'index global
                        _a.sent();
                        // Créer les index de recherche
                        return [4 /*yield*/, this.createSearchIndexes()];
                    case 9:
                        // Créer les index de recherche
                        _a.sent();
                        console.log('✅ Bibliothèque initialisée avec succès !');
                        console.log("\uD83D\uDCC1 Chemin: ".concat(this.libraryPath));
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _a.sent();
                        console.error('❌ Erreur lors de l\'initialisation:', error_1);
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    LibraryInitializer.prototype.createCategory = function (categoryName) {
        return __awaiter(this, void 0, void 0, function () {
            var categoryPath, categoryIndex, readmeContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        categoryPath = path.join(this.libraryPath, categoryName);
                        return [4 /*yield*/, fs.mkdir(categoryPath, { recursive: true })];
                    case 1:
                        _a.sent();
                        categoryIndex = {
                            category: categoryName,
                            totalEffects: 0,
                            subCategories: [],
                            effects: [],
                            created: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        };
                        return [4 /*yield*/, fs.writeFile(path.join(categoryPath, 'category-index.json'), JSON.stringify(categoryIndex, null, 2))];
                    case 2:
                        _a.sent();
                        readmeContent = "# ".concat(categoryName, "\n\nCette cat\u00E9gorie contient les effets de type: ").concat(categoryName, "\n\nEffets disponibles: 0\nDerni\u00E8re mise \u00E0 jour: ").concat(new Date().toISOString(), "\n");
                        return [4 /*yield*/, fs.writeFile(path.join(categoryPath, 'README.md'), readmeContent)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LibraryInitializer.prototype.createSampleEffects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sampleEffects, _i, sampleEffects_1, effect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sampleEffects = [
                            {
                                id: 'chronobreak_001',
                                name: 'Chronobreak',
                                type: 'TEMPORAL',
                                category: 'MANIPULATION_TEMPORELLE',
                                description: 'La vidéo se fige soudainement, puis des fragments de la scène se déplacent à des vitesses différentes.',
                                code: this.getChronobreakCode(),
                                complexity: 8,
                                tags: ['temps', 'chronos', 'vitesse', 'ralenti', 'accélé']
                            },
                            {
                                id: 'particle_explosion_001',
                                name: 'Particle Explosion',
                                type: 'PARTICLE',
                                category: 'PARTICULES',
                                description: 'Explosion de particules avec physique réaliste et effets de lumière.',
                                code: this.getParticleExplosionCode(),
                                complexity: 7,
                                tags: ['particules', 'explosion', 'physique', 'lumière']
                            },
                            {
                                id: 'neon_glow_001',
                                name: 'Neon Glow',
                                type: 'LIGHTING',
                                category: 'LUMIERE_OMBRE',
                                description: 'Effet de néon brillant avec halo et pulsation lumineuse.',
                                code: this.getNeonGlowCode(),
                                complexity: 6,
                                tags: ['néon', 'lumière', 'glow', 'pulsation']
                            }
                        ];
                        _i = 0, sampleEffects_1 = sampleEffects;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sampleEffects_1.length)) return [3 /*break*/, 4];
                        effect = sampleEffects_1[_i];
                        return [4 /*yield*/, this.saveEffect(effect)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LibraryInitializer.prototype.saveEffect = function (effect) {
        return __awaiter(this, void 0, void 0, function () {
            var categoryPath, effectPath, effectData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        categoryPath = path.join(this.libraryPath, effect.category);
                        effectPath = path.join(categoryPath, "".concat(effect.id, ".json"));
                        effectData = {
                            raw: "Effet g\u00E9n\u00E9r\u00E9: ".concat(effect.name),
                            parsed: effect,
                            confidence: 0.98,
                            errors: [],
                            generatedBy: 'LibraryInitializer',
                            generatedAt: new Date().toISOString(),
                            version: '1.0',
                            classification: {
                                primaryCategory: effect.category,
                                subCategories: ['BASIC'],
                                confidence: 0.98,
                                suggestedPath: effect.category,
                                metadata: {
                                    effectType: effect.type,
                                    complexity: effect.complexity,
                                    platform: ['javascript', 'web'],
                                    tags: effect.tags
                                }
                            }
                        };
                        return [4 /*yield*/, fs.writeFile(effectPath, JSON.stringify(effectData, null, 2))];
                    case 1:
                        _a.sent();
                        // Mettre à jour l'index de catégorie
                        return [4 /*yield*/, this.updateCategoryIndex(effect.category, effect)];
                    case 2:
                        // Mettre à jour l'index de catégorie
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LibraryInitializer.prototype.updateCategoryIndex = function (categoryName, effect) {
        return __awaiter(this, void 0, void 0, function () {
            var indexPath, index, content, _a, effectEntry;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        indexPath = path.join(this.libraryPath, categoryName, 'category-index.json');
                        index = {
                            category: categoryName,
                            totalEffects: 0,
                            subCategories: [],
                            effects: [],
                            created: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.readFile(indexPath, 'utf-8')];
                    case 2:
                        content = _b.sent();
                        index = JSON.parse(content);
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        effectEntry = {
                            id: effect.id,
                            name: effect.name,
                            description: effect.description.slice(0, 100) + '...',
                            complexity: effect.complexity,
                            confidence: 0.98,
                            tags: effect.tags,
                            storedAt: new Date().toISOString()
                        };
                        index.effects.push(effectEntry);
                        index.totalEffects = index.effects.length;
                        index.lastUpdated = new Date().toISOString();
                        return [4 /*yield*/, fs.writeFile(indexPath, JSON.stringify(index, null, 2))];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LibraryInitializer.prototype.createGlobalIndex = function (categories) {
        return __awaiter(this, void 0, void 0, function () {
            var globalIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        globalIndex = {
                            totalEffects: 3, // Nombre d'effets d'exemple
                            categories: categories,
                            lastInitialized: new Date().toISOString(),
                            stats: {
                                avgComplexity: 7,
                                avgConfidence: 0.98,
                                platformDistribution: {
                                    'javascript': 3,
                                    'web': 3
                                },
                                categoryDistribution: {
                                    'MANIPULATION_TEMPORELLE': 1,
                                    'PARTICULES': 1,
                                    'LUMIERE_OMBRE': 1
                                }
                            },
                            version: '1.0',
                            metadata: {
                                initialized: true,
                                sampleEffectsIncluded: true,
                                ready: true
                            }
                        };
                        return [4 /*yield*/, fs.writeFile(path.join(this.libraryPath, 'global-index.json'), JSON.stringify(globalIndex, null, 2))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LibraryInitializer.prototype.createSearchIndexes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var searchIndexes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        searchIndexes = {
                            byCategory: {
                                'MANIPULATION_TEMPORELLE': ['chronobreak_001'],
                                'PARTICULES': ['particle_explosion_001'],
                                'LUMIERE_OMBRE': ['neon_glow_001']
                            },
                            byComplexity: {
                                '6': ['neon_glow_001'],
                                '7': ['particle_explosion_001'],
                                '8': ['chronobreak_001']
                            },
                            byTags: {
                                'temps': ['chronobreak_001'],
                                'particules': ['particle_explosion_001'],
                                'lumière': ['neon_glow_001', 'particle_explosion_001'],
                                'explosion': ['particle_explosion_001']
                            },
                            fullTextSearch: {
                                'chronobreak': ['chronobreak_001'],
                                'particle': ['particle_explosion_001'],
                                'explosion': ['particle_explosion_001'],
                                'neon': ['neon_glow_001'],
                                'glow': ['neon_glow_001']
                            },
                            lastUpdated: new Date().toISOString()
                        };
                        return [4 /*yield*/, fs.writeFile(path.join(this.libraryPath, 'search-indexes.json'), JSON.stringify(searchIndexes, null, 2))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LibraryInitializer.prototype.getChronobreakCode = function () {
        return "// Chronobreak Effect - Manipulation Temporelle\nclass ChronobreakEffect {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.fragments = [];\n    this.frozenFrame = null;\n    this.isActive = false;\n    this.duration = options.duration || 3000;\n  }\n\n  activate() {\n    // Capturer le frame actuel\n    this.frozenFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);\n    this.createFragments();\n    this.isActive = true;\n  }\n\n  createFragments() {\n    const fragmentCount = 12;\n    for (let i = 0; i < fragmentCount; i++) {\n      this.fragments.push({\n        x: Math.random() * this.canvas.width,\n        y: Math.random() * this.canvas.height,\n        vx: (Math.random() - 0.5) * 5,\n        vy: (Math.random() - 0.5) * 5,\n        timeScale: 0.2 + Math.random() * 1.8,\n        size: 50 + Math.random() * 100\n      });\n    }\n  }\n\n  render() {\n    if (!this.isActive) return;\n    \n    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);\n    \n    // Dessiner les fragments \u00E0 diff\u00E9rentes vitesses\n    this.fragments.forEach(fragment => {\n      this.ctx.save();\n      this.ctx.translate(fragment.x, fragment.y);\n      this.ctx.scale(fragment.timeScale, fragment.timeScale);\n      \n      if (this.frozenFrame) {\n        this.ctx.putImageData(this.frozenFrame, -fragment.x, -fragment.y);\n      }\n      \n      this.ctx.restore();\n      \n      // Mise \u00E0 jour des fragments\n      fragment.x += fragment.vx * fragment.timeScale;\n      fragment.y += fragment.vy * fragment.timeScale;\n    });\n  }\n}";
    };
    LibraryInitializer.prototype.getParticleExplosionCode = function () {
        return "// Particle Explosion Effect\nclass ParticleExplosion {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.particles = [];\n    this.colors = options.colors || ['#ff4444', '#ff8844', '#ffaa44'];\n    this.maxParticles = options.maxParticles || 200;\n  }\n\n  explode(x, y) {\n    for (let i = 0; i < this.maxParticles; i++) {\n      this.particles.push({\n        x, y,\n        vx: (Math.random() - 0.5) * 15,\n        vy: (Math.random() - 0.5) * 15,\n        life: 1.0,\n        decay: 0.01 + Math.random() * 0.02,\n        size: 2 + Math.random() * 4,\n        color: this.colors[Math.floor(Math.random() * this.colors.length)]\n      });\n    }\n  }\n\n  render() {\n    this.ctx.globalCompositeOperation = 'lighter';\n    \n    this.particles = this.particles.filter(particle => {\n      if (particle.life <= 0) return false;\n      \n      particle.x += particle.vx;\n      particle.y += particle.vy;\n      particle.vy += 0.2; // Gravit\u00E9\n      particle.life -= particle.decay;\n      \n      this.ctx.save();\n      this.ctx.globalAlpha = particle.life;\n      this.ctx.fillStyle = particle.color;\n      this.ctx.shadowColor = particle.color;\n      this.ctx.shadowBlur = 10;\n      this.ctx.beginPath();\n      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);\n      this.ctx.fill();\n      this.ctx.restore();\n      \n      return true;\n    });\n  }\n}";
    };
    LibraryInitializer.prototype.getNeonGlowCode = function () {
        return "// Neon Glow Effect\nclass NeonGlowEffect {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.color = options.color || '#00ffff';\n    this.intensity = options.intensity || 1.0;\n    this.pulseSpeed = options.pulseSpeed || 2;\n    this.time = 0;\n  }\n\n  drawNeonText(text, x, y) {\n    const pulse = 0.5 + 0.5 * Math.sin(this.time * this.pulseSpeed);\n    const glowIntensity = this.intensity * pulse;\n    \n    this.ctx.save();\n    this.ctx.font = '48px Arial';\n    this.ctx.textAlign = 'center';\n    \n    // Effet de glow multiple\n    for (let i = 0; i < 3; i++) {\n      this.ctx.shadowColor = this.color;\n      this.ctx.shadowBlur = 10 + i * 20;\n      this.ctx.globalAlpha = glowIntensity / (i + 1);\n      this.ctx.fillStyle = this.color;\n      this.ctx.fillText(text, x, y);\n    }\n    \n    // Texte principal\n    this.ctx.shadowBlur = 0;\n    this.ctx.globalAlpha = 1;\n    this.ctx.fillStyle = '#ffffff';\n    this.ctx.fillText(text, x, y);\n    \n    this.ctx.restore();\n    this.time += 0.016; // ~60fps\n  }\n\n  render(text = 'NEON GLOW') {\n    const centerX = this.canvas.width / 2;\n    const centerY = this.canvas.height / 2;\n    this.drawNeonText(text, centerX, centerY);\n  }\n}";
    };
    return LibraryInitializer;
}());
export var libraryInitializer = new LibraryInitializer();
