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
import { randomUUID } from "crypto";
var MemStorage = /** @class */ (function () {
    function MemStorage() {
        this.users = new Map();
        this.effects = new Map();
        this.jobs = new Map();
        this.uploads = new Map();
        this.systemMetrics = [];
        this.initializeData();
    }
    MemStorage.prototype.initializeData = function () {
        var _this = this;
        // Initialize with some sample effects for the library
        var sampleEffects = [
            {
                name: "Particle Explosion",
                description: "High-energy particle burst effect with physics simulation",
                type: "PARTICLE",
                category: "EXPLOSION",
                platform: "javascript",
                code: this.getParticleExplosionCode(),
                parameters: { particleCount: 150, duration: 3000, colors: ["#ff6b35", "#f7941e", "#fff200"] },
                metadata: { complexity: 7, performance: "high", author: "EffectForge AI" },
                tags: ["particles", "explosion", "physics", "energy"],
                complexity: 7,
                performance: "high",
                rating: 4.8,
                downloads: 1247,
                version: "1.0.0"
            },
            {
                name: "Fluid Wave Transition",
                description: "Smooth liquid-like transition with organic movement",
                type: "MORPHING",
                category: "TRANSITION",
                platform: "javascript",
                code: this.getFluidWaveCode(),
                parameters: { amplitude: 50, frequency: 2, speed: 1.5, viscosity: 0.8 },
                metadata: { complexity: 5, performance: "medium", author: "EffectForge AI" },
                tags: ["fluid", "wave", "transition", "organic"],
                complexity: 5,
                performance: "medium",
                rating: 4.6,
                downloads: 856,
                version: "1.0.0"
            },
            {
                name: "Digital Matrix Glitch",
                description: "Cyberpunk-style digital distortion and glitch effects",
                type: "DIGITAL",
                category: "DISTORTION",
                platform: "javascript",
                code: this.getMatrixGlitchCode(),
                parameters: { intensity: 0.7, frequency: 5, colorShift: true, scanlines: true },
                metadata: { complexity: 8, performance: "high", author: "EffectForge AI" },
                tags: ["glitch", "cyberpunk", "digital", "matrix", "distortion"],
                complexity: 8,
                performance: "high",
                rating: 4.9,
                downloads: 2134,
                version: "1.0.0"
            },
            {
                name: "Electric Lightning Storm",
                description: "Realistic lightning bolts with branching patterns",
                type: "LIGHTING",
                category: "ATMOSPHERIC",
                platform: "javascript",
                code: this.getLightningCode(),
                parameters: { branches: 6, intensity: 0.9, color: "#00d4ff", duration: 2000 },
                metadata: { complexity: 9, performance: "high", author: "EffectForge AI" },
                tags: ["lightning", "electric", "storm", "atmospheric", "energy"],
                complexity: 9,
                performance: "high",
                rating: 4.7,
                downloads: 1543,
                version: "1.0.0"
            },
            {
                name: "Geometric Shape Morph",
                description: "Smooth transformation between geometric shapes",
                type: "MORPHING",
                category: "TRANSFORMATION",
                platform: "javascript",
                code: this.getShapeMorphCode(),
                parameters: { shapes: ["circle", "square", "triangle"], morphSpeed: 1.2, easing: "easeInOutQuad" },
                metadata: { complexity: 4, performance: "medium", author: "EffectForge AI" },
                tags: ["geometry", "morph", "shapes", "transformation"],
                complexity: 4,
                performance: "medium",
                rating: 4.5,
                downloads: 743,
                version: "1.0.0"
            },
            {
                name: "Digital Fire Flames",
                description: "Realistic fire simulation with heat distortion",
                type: "PARTICLE",
                category: "FIRE",
                platform: "javascript",
                code: this.getDigitalFireCode(),
                parameters: { intensity: 0.8, heat: 0.6, windForce: 0.3, particleLife: 4000 },
                metadata: { complexity: 8, performance: "high", author: "EffectForge AI" },
                tags: ["fire", "flames", "heat", "realistic", "particles"],
                complexity: 8,
                performance: "high",
                rating: 4.8,
                downloads: 1876,
                version: "1.0.0"
            }
        ];
        sampleEffects.forEach(function (effect) {
            var id = randomUUID();
            _this.effects.set(id, __assign(__assign({}, effect), { id: id, createdAt: new Date() }));
        });
    };
    // User methods
    MemStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    MemStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).find(function (user) { return user.username === username; })];
            });
        });
    };
    MemStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var id, user;
            return __generator(this, function (_a) {
                id = randomUUID();
                user = __assign(__assign({}, insertUser), { id: id });
                this.users.set(id, user);
                return [2 /*return*/, user];
            });
        });
    };
    // Effect methods
    MemStorage.prototype.getEffect = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.effects.get(id)];
            });
        });
    };
    MemStorage.prototype.getEffects = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var effects, searchLower_1, total, offset, limit;
            return __generator(this, function (_a) {
                effects = Array.from(this.effects.values());
                // Apply filters
                if (params === null || params === void 0 ? void 0 : params.category) {
                    effects = effects.filter(function (effect) { return effect.category === params.category; });
                }
                if (params === null || params === void 0 ? void 0 : params.type) {
                    effects = effects.filter(function (effect) { return effect.type === params.type; });
                }
                if (params === null || params === void 0 ? void 0 : params.platform) {
                    effects = effects.filter(function (effect) { return effect.platform === params.platform; });
                }
                if (params === null || params === void 0 ? void 0 : params.search) {
                    searchLower_1 = params.search.toLowerCase();
                    effects = effects.filter(function (effect) {
                        return effect.name.toLowerCase().includes(searchLower_1) ||
                            effect.description.toLowerCase().includes(searchLower_1) ||
                            effect.tags.some(function (tag) { return tag.toLowerCase().includes(searchLower_1); });
                    });
                }
                total = effects.length;
                offset = (params === null || params === void 0 ? void 0 : params.offset) || 0;
                limit = (params === null || params === void 0 ? void 0 : params.limit) || 20;
                effects = effects.slice(offset, offset + limit);
                return [2 /*return*/, { effects: effects, total: total }];
            });
        });
    };
    MemStorage.prototype.createEffect = function (insertEffect) {
        return __awaiter(this, void 0, void 0, function () {
            var id, effect;
            return __generator(this, function (_a) {
                id = randomUUID();
                effect = __assign(__assign({}, insertEffect), { id: id, rating: 0, downloads: 0, createdAt: new Date() });
                this.effects.set(id, effect);
                return [2 /*return*/, effect];
            });
        });
    };
    MemStorage.prototype.updateEffect = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var effect, updatedEffect;
            return __generator(this, function (_a) {
                effect = this.effects.get(id);
                if (!effect)
                    return [2 /*return*/, undefined];
                updatedEffect = __assign(__assign({}, effect), updates);
                this.effects.set(id, updatedEffect);
                return [2 /*return*/, updatedEffect];
            });
        });
    };
    MemStorage.prototype.deleteEffect = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.effects.delete(id)];
            });
        });
    };
    MemStorage.prototype.incrementDownloads = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var effect;
            return __generator(this, function (_a) {
                effect = this.effects.get(id);
                if (effect) {
                    effect.downloads = (effect.downloads || 0) + 1;
                    this.effects.set(id, effect);
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.rateEffect = function (id, rating) {
        return __awaiter(this, void 0, void 0, function () {
            var effect, currentRating, newRating;
            return __generator(this, function (_a) {
                effect = this.effects.get(id);
                if (effect) {
                    currentRating = effect.rating || 0;
                    newRating = (currentRating + rating) / 2;
                    effect.rating = Math.round(newRating * 10) / 10;
                    this.effects.set(id, effect);
                }
                return [2 /*return*/];
            });
        });
    };
    // Job methods
    MemStorage.prototype.getJob = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.jobs.get(id)];
            });
        });
    };
    MemStorage.prototype.getJobs = function (status) {
        return __awaiter(this, void 0, void 0, function () {
            var jobs;
            return __generator(this, function (_a) {
                jobs = Array.from(this.jobs.values());
                if (status) {
                    jobs = jobs.filter(function (job) { return job.status === status; });
                }
                return [2 /*return*/, jobs.sort(function (a, b) { return b.createdAt.getTime() - a.createdAt.getTime(); })];
            });
        });
    };
    MemStorage.prototype.createJob = function (insertJob) {
        return __awaiter(this, void 0, void 0, function () {
            var id, job;
            return __generator(this, function (_a) {
                id = randomUUID();
                job = __assign(__assign({}, insertJob), { id: id, status: 'queued', progress: 0, result: null, error: null, actualTime: null, createdAt: new Date(), completedAt: null });
                this.jobs.set(id, job);
                return [2 /*return*/, job];
            });
        });
    };
    MemStorage.prototype.updateJob = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var job, updatedJob;
            return __generator(this, function (_a) {
                job = this.jobs.get(id);
                if (!job)
                    return [2 /*return*/, undefined];
                updatedJob = __assign(__assign({}, job), updates);
                if (updates.status === 'completed' || updates.status === 'failed') {
                    updatedJob.completedAt = new Date();
                }
                this.jobs.set(id, updatedJob);
                return [2 /*return*/, updatedJob];
            });
        });
    };
    MemStorage.prototype.getQueueStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobs;
            return __generator(this, function (_a) {
                jobs = Array.from(this.jobs.values());
                return [2 /*return*/, {
                        queued: jobs.filter(function (job) { return job.status === 'queued'; }).length,
                        processing: jobs.filter(function (job) { return job.status === 'processing'; }).length,
                        completed: jobs.filter(function (job) { return job.status === 'completed'; }).length,
                        failed: jobs.filter(function (job) { return job.status === 'failed'; }).length
                    }];
            });
        });
    };
    // Upload methods
    MemStorage.prototype.getUpload = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.uploads.get(id)];
            });
        });
    };
    MemStorage.prototype.getUploads = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.uploads.values()).sort(function (a, b) { return b.createdAt.getTime() - a.createdAt.getTime(); })];
            });
        });
    };
    MemStorage.prototype.createUpload = function (insertUpload) {
        return __awaiter(this, void 0, void 0, function () {
            var id, upload;
            return __generator(this, function (_a) {
                id = randomUUID();
                upload = __assign(__assign({}, insertUpload), { id: id, status: 'processing', processedCount: 0, totalCount: 0, errors: [], createdAt: new Date() });
                this.uploads.set(id, upload);
                return [2 /*return*/, upload];
            });
        });
    };
    MemStorage.prototype.updateUpload = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var upload, updatedUpload;
            return __generator(this, function (_a) {
                upload = this.uploads.get(id);
                if (!upload)
                    return [2 /*return*/, undefined];
                updatedUpload = __assign(__assign({}, upload), updates);
                this.uploads.set(id, updatedUpload);
                return [2 /*return*/, updatedUpload];
            });
        });
    };
    // System metrics methods
    MemStorage.prototype.createSystemMetrics = function (insertMetrics) {
        return __awaiter(this, void 0, void 0, function () {
            var id, metrics;
            return __generator(this, function (_a) {
                id = randomUUID();
                metrics = __assign(__assign({}, insertMetrics), { id: id, timestamp: new Date() });
                this.systemMetrics.push(metrics);
                // Keep only last 100 entries
                if (this.systemMetrics.length > 100) {
                    this.systemMetrics = this.systemMetrics.slice(-100);
                }
                return [2 /*return*/, metrics];
            });
        });
    };
    MemStorage.prototype.getLatestSystemMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.systemMetrics[this.systemMetrics.length - 1]];
            });
        });
    };
    MemStorage.prototype.getSystemHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queueStats, latest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getQueueStats()];
                    case 1:
                        queueStats = _a.sent();
                        return [4 /*yield*/, this.getLatestSystemMetrics()];
                    case 2:
                        latest = _a.sent();
                        return [2 /*return*/, {
                                overall: 98.7,
                                modules: {
                                    particles: { status: 'online', load: 67, effectCount: 342 },
                                    physics: { status: 'online', load: 45, effectCount: 198 },
                                    lighting: { status: 'online', load: 23, effectCount: 156 },
                                    morphing: { status: 'maintenance', load: 0, effectCount: 89 }
                                },
                                queue: {
                                    size: queueStats.queued,
                                    processing: queueStats.processing,
                                    failed: queueStats.failed
                                },
                                resources: {
                                    cpu: (latest === null || latest === void 0 ? void 0 : latest.cpuUsage) || 67,
                                    memory: (latest === null || latest === void 0 ? void 0 : latest.memoryUsage) || 34,
                                    gpu: (latest === null || latest === void 0 ? void 0 : latest.gpuUsage) || 78,
                                    network: (latest === null || latest === void 0 ? void 0 : latest.networkIO) || 12,
                                    storage: (latest === null || latest === void 0 ? void 0 : latest.storageUsed) || 42
                                }
                            }];
                }
            });
        });
    };
    // Code templates for sample effects
    MemStorage.prototype.getParticleExplosionCode = function () {
        return "// Auto-generated by EffectForge AI\n// Particle Explosion Effect\n\nclass ParticleExplosion {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.particles = [];\n    this.colors = options.colors || ['#ff6b35', '#f7941e', '#fff200'];\n    this.maxParticles = options.particleCount || 150;\n    this.duration = options.duration || 3000;\n  }\n\n  createParticle(x, y) {\n    return {\n      x: x,\n      y: y,\n      vx: (Math.random() - 0.5) * 10,\n      vy: (Math.random() - 0.5) * 10,\n      life: 1.0,\n      decay: Math.random() * 0.02 + 0.01,\n      color: this.colors[Math.floor(Math.random() * this.colors.length)]\n    };\n  }\n\n  updateParticle(particle) {\n    particle.x += particle.vx;\n    particle.y += particle.vy;\n    particle.vy += 0.1; // Gravity\n    particle.life -= particle.decay;\n  }\n\n  explode(centerX, centerY) {\n    for (let i = 0; i < this.maxParticles; i++) {\n      this.particles.push(this.createParticle(centerX, centerY));\n    }\n  }\n\n  render() {\n    this.ctx.globalCompositeOperation = 'lighter';\n    \n    this.particles.forEach(particle => {\n      if (particle.life > 0) {\n        this.updateParticle(particle);\n        \n        this.ctx.save();\n        this.ctx.globalAlpha = particle.life;\n        this.ctx.fillStyle = particle.color;\n        this.ctx.beginPath();\n        this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);\n        this.ctx.fill();\n        this.ctx.restore();\n      }\n    });\n    \n    this.particles = this.particles.filter(p => p.life > 0);\n  }\n}";
    };
    MemStorage.prototype.getFluidWaveCode = function () {
        return "// Fluid Wave Transition Effect\nclass FluidWave {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.amplitude = options.amplitude || 50;\n    this.frequency = options.frequency || 2;\n    this.speed = options.speed || 1.5;\n    this.time = 0;\n  }\n\n  render() {\n    const { width, height } = this.canvas;\n    this.ctx.clearRect(0, 0, width, height);\n    \n    this.ctx.beginPath();\n    this.ctx.moveTo(0, height / 2);\n    \n    for (let x = 0; x < width; x++) {\n      const y = height / 2 + Math.sin((x * this.frequency + this.time) * 0.01) * this.amplitude;\n      this.ctx.lineTo(x, y);\n    }\n    \n    this.ctx.lineTo(width, height);\n    this.ctx.lineTo(0, height);\n    this.ctx.closePath();\n    \n    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);\n    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');\n    gradient.addColorStop(1, 'rgba(255, 0, 110, 0.3)');\n    \n    this.ctx.fillStyle = gradient;\n    this.ctx.fill();\n    \n    this.time += this.speed;\n  }\n}";
    };
    MemStorage.prototype.getMatrixGlitchCode = function () {
        return "// Digital Matrix Glitch Effect\nclass MatrixGlitch {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.intensity = options.intensity || 0.7;\n    this.frequency = options.frequency || 5;\n    this.time = 0;\n  }\n\n  render() {\n    const { width, height } = this.canvas;\n    const imageData = this.ctx.getImageData(0, 0, width, height);\n    const data = imageData.data;\n    \n    // Glitch effect\n    for (let i = 0; i < data.length; i += 4) {\n      if (Math.random() < this.intensity * 0.01) {\n        const offset = Math.floor(Math.random() * this.frequency) * 4;\n        data[i] = data[i + offset] || 0;     // Red\n        data[i + 1] = data[i + 1 + offset] || 255; // Green\n        data[i + 2] = data[i + 2 + offset] || 0;   // Blue\n      }\n    }\n    \n    this.ctx.putImageData(imageData, 0, 0);\n    this.time++;\n  }\n}";
    };
    MemStorage.prototype.getLightningCode = function () {
        return "// Electric Lightning Storm Effect\nclass LightningStorm {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.branches = options.branches || 6;\n    this.intensity = options.intensity || 0.9;\n    this.color = options.color || '#00d4ff';\n  }\n\n  generateBolt(startX, startY, endX, endY) {\n    const points = [{ x: startX, y: startY }];\n    const segments = 20;\n    \n    for (let i = 1; i < segments; i++) {\n      const progress = i / segments;\n      const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 50;\n      const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 20;\n      points.push({ x, y });\n    }\n    \n    points.push({ x: endX, y: endY });\n    return points;\n  }\n\n  render() {\n    const { width, height } = this.canvas;\n    this.ctx.clearRect(0, 0, width, height);\n    \n    for (let i = 0; i < this.branches; i++) {\n      const startX = Math.random() * width;\n      const endX = Math.random() * width;\n      const bolt = this.generateBolt(startX, 0, endX, height);\n      \n      this.ctx.strokeStyle = this.color;\n      this.ctx.lineWidth = 2 + Math.random() * 3;\n      this.ctx.shadowColor = this.color;\n      this.ctx.shadowBlur = 10;\n      \n      this.ctx.beginPath();\n      this.ctx.moveTo(bolt[0].x, bolt[0].y);\n      \n      for (let j = 1; j < bolt.length; j++) {\n        this.ctx.lineTo(bolt[j].x, bolt[j].y);\n      }\n      \n      this.ctx.stroke();\n    }\n  }\n}";
    };
    MemStorage.prototype.getShapeMorphCode = function () {
        return "// Geometric Shape Morph Effect\nclass ShapeMorph {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.shapes = options.shapes || ['circle', 'square', 'triangle'];\n    this.morphSpeed = options.morphSpeed || 1.2;\n    this.currentShape = 0;\n    this.morphProgress = 0;\n  }\n\n  drawShape(shape, progress, centerX, centerY, size) {\n    this.ctx.beginPath();\n    \n    switch (shape) {\n      case 'circle':\n        this.ctx.arc(centerX, centerY, size, 0, Math.PI * 2);\n        break;\n      case 'square':\n        this.ctx.rect(centerX - size, centerY - size, size * 2, size * 2);\n        break;\n      case 'triangle':\n        this.ctx.moveTo(centerX, centerY - size);\n        this.ctx.lineTo(centerX - size, centerY + size);\n        this.ctx.lineTo(centerX + size, centerY + size);\n        this.ctx.closePath();\n        break;\n    }\n  }\n\n  render() {\n    const { width, height } = this.canvas;\n    const centerX = width / 2;\n    const centerY = height / 2;\n    const size = 50;\n    \n    this.ctx.clearRect(0, 0, width, height);\n    \n    // Current shape\n    this.ctx.fillStyle = `rgba(0, 212, 255, ${1 - this.morphProgress})`;\n    this.drawShape(this.shapes[this.currentShape], this.morphProgress, centerX, centerY, size);\n    this.ctx.fill();\n    \n    // Next shape\n    const nextShape = (this.currentShape + 1) % this.shapes.length;\n    this.ctx.fillStyle = `rgba(255, 0, 110, ${this.morphProgress})`;\n    this.drawShape(this.shapes[nextShape], this.morphProgress, centerX, centerY, size);\n    this.ctx.fill();\n    \n    this.morphProgress += 0.01 * this.morphSpeed;\n    \n    if (this.morphProgress >= 1) {\n      this.morphProgress = 0;\n      this.currentShape = nextShape;\n    }\n  }\n}";
    };
    MemStorage.prototype.getDigitalFireCode = function () {
        return "// Digital Fire Flames Effect\nclass DigitalFire {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.particles = [];\n    this.intensity = options.intensity || 0.8;\n    this.heat = options.heat || 0.6;\n    this.windForce = options.windForce || 0.3;\n  }\n\n  createFlameParticle(x, y) {\n    return {\n      x: x + (Math.random() - 0.5) * 20,\n      y: y,\n      vx: (Math.random() - 0.5) * this.windForce,\n      vy: -Math.random() * 3 - 1,\n      life: 1.0,\n      decay: Math.random() * 0.02 + 0.01,\n      size: Math.random() * 8 + 4,\n      heat: Math.random() * this.heat + 0.3\n    };\n  }\n\n  render() {\n    const { width, height } = this.canvas;\n    this.ctx.clearRect(0, 0, width, height);\n    \n    // Add new particles at the bottom\n    for (let i = 0; i < 5; i++) {\n      this.particles.push(this.createFlameParticle(width / 2, height - 20));\n    }\n    \n    // Update and render particles\n    this.particles = this.particles.filter(particle => {\n      particle.x += particle.vx;\n      particle.y += particle.vy;\n      particle.life -= particle.decay;\n      \n      if (particle.life > 0) {\n        const alpha = particle.life * this.intensity;\n        const hue = particle.heat * 60; // Red to yellow\n        \n        this.ctx.save();\n        this.ctx.globalAlpha = alpha;\n        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;\n        this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;\n        this.ctx.shadowBlur = particle.size;\n        \n        this.ctx.beginPath();\n        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);\n        this.ctx.fill();\n        this.ctx.restore();\n        \n        return true;\n      }\n      return false;\n    });\n  }\n}";
    };
    return MemStorage;
}());
export { MemStorage };
export var storage = new MemStorage();
