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
import { storage } from "../storage";
import { orchestrator } from "../core/orchestrator";
var JobQueue = /** @class */ (function () {
    function JobQueue() {
        this.processingJobs = new Map();
        this.maxConcurrentJobs = 5;
        this.processingInterval = null;
        this.isProcessing = false;
        this.startProcessing();
    }
    JobQueue.prototype.addJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Job added to queue: ".concat(job.id));
                // Job is already in storage, just trigger processing
                this.processNextJobs();
                return [2 /*return*/];
            });
        });
    };
    JobQueue.prototype.startProcessing = function () {
        var _this = this;
        if (this.processingInterval)
            return;
        this.processingInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isProcessing) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.processNextJobs()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }, 2000); // Check for new jobs every 2 seconds
    };
    JobQueue.prototype.processNextJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queuedJobs, availableSlots, jobsToProcess, processingPromises, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.processingJobs.size >= this.maxConcurrentJobs) {
                            return [2 /*return*/]; // Already at max capacity
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        this.isProcessing = true;
                        return [4 /*yield*/, storage.getJobs('queued')];
                    case 2:
                        queuedJobs = _a.sent();
                        availableSlots = this.maxConcurrentJobs - this.processingJobs.size;
                        jobsToProcess = queuedJobs.slice(0, availableSlots);
                        processingPromises = jobsToProcess.map(function (job) { return _this.processJob(job); });
                        return [4 /*yield*/, Promise.allSettled(processingPromises)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error processing job queue:', error_1);
                        return [3 /*break*/, 6];
                    case 5:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    JobQueue.prototype.processJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var progressSteps, i, startTime, result, actualTime, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, 12, 13]);
                        // Mark job as processing
                        this.processingJobs.set(job.id, job);
                        return [4 /*yield*/, storage.updateJob(job.id, {
                                status: 'processing',
                                progress: 0
                            })];
                    case 1:
                        _a.sent();
                        console.log("Processing job: ".concat(job.id, " - ").concat(job.description.slice(0, 50), "..."));
                        progressSteps = [10, 25, 40, 60, 80, 95];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < progressSteps.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.delay(500)];
                    case 3:
                        _a.sent(); // Simulate processing time
                        return [4 /*yield*/, storage.updateJob(job.id, { progress: progressSteps[i] })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6:
                        startTime = Date.now();
                        return [4 /*yield*/, orchestrator.generateEffect(job.description, job.platform, job.options)];
                    case 7:
                        result = _a.sent();
                        actualTime = Math.round((Date.now() - startTime) / 1000);
                        // Mark job as completed
                        return [4 /*yield*/, storage.updateJob(job.id, {
                                status: 'completed',
                                progress: 100,
                                result: result,
                                actualTime: actualTime
                            })];
                    case 8:
                        // Mark job as completed
                        _a.sent();
                        // Create effect entry in library
                        return [4 /*yield*/, this.createLibraryEntry(job, result)];
                    case 9:
                        // Create effect entry in library
                        _a.sent();
                        console.log("Job completed: ".concat(job.id, " in ").concat(actualTime, "s"));
                        return [3 /*break*/, 13];
                    case 10:
                        error_2 = _a.sent();
                        console.error("Job failed: ".concat(job.id), error_2);
                        return [4 /*yield*/, storage.updateJob(job.id, {
                                status: 'failed',
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error occurred'
                            })];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        this.processingJobs.delete(job.id);
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    JobQueue.prototype.createLibraryEntry = function (job, result) {
        return __awaiter(this, void 0, void 0, function () {
            var name_1, _a, category, type, error_3;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 2, , 3]);
                        name_1 = this.generateEffectName(job.description);
                        _a = this.analyzeGeneratedCode(result.code), category = _a.category, type = _a.type;
                        return [4 /*yield*/, storage.createEffect({
                                name: name_1,
                                description: job.description,
                                type: type,
                                category: category,
                                platform: job.platform,
                                code: result.code,
                                parameters: ((_c = (_b = result.metadata) === null || _b === void 0 ? void 0 : _b.analysis) === null || _c === void 0 ? void 0 : _c.parameters) || {},
                                metadata: {
                                    generatedAt: new Date().toISOString(),
                                    jobId: job.id,
                                    complexity: ((_e = (_d = result.metadata) === null || _d === void 0 ? void 0 : _d.analysis) === null || _e === void 0 ? void 0 : _e.complexity) || 5,
                                    modules: ((_f = result.metadata) === null || _f === void 0 ? void 0 : _f.modules) || [],
                                    estimatedPerformance: ((_g = result.metadata) === null || _g === void 0 ? void 0 : _g.estimatedPerformance) || 'medium'
                                },
                                tags: this.extractTags(job.description),
                                complexity: ((_j = (_h = result.metadata) === null || _h === void 0 ? void 0 : _h.analysis) === null || _j === void 0 ? void 0 : _j.complexity) || 5,
                                performance: ((_k = result.metadata) === null || _k === void 0 ? void 0 : _k.estimatedPerformance) || 'medium',
                                version: '1.0.0'
                            })];
                    case 1:
                        _l.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _l.sent();
                        console.error('Failed to create library entry:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JobQueue.prototype.generateEffectName = function (description) {
        // Extract a meaningful name from the description
        var words = description
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(function (word) { return word.length > 2; });
        // Pick key words (first few meaningful words)
        var keyWords = words.slice(0, 3);
        // Capitalize and join
        return keyWords
            .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
            .join(' ') + ' Effect';
    };
    JobQueue.prototype.analyzeGeneratedCode = function (code) {
        var codeLower = code.toLowerCase();
        // Determine type based on code content
        var type = 'PARTICLE'; // default
        if (codeLower.includes('lighting') || codeLower.includes('light')) {
            type = 'LIGHTING';
        }
        else if (codeLower.includes('morph') || codeLower.includes('shape')) {
            type = 'MORPHING';
        }
        else if (codeLower.includes('physics') || codeLower.includes('collision')) {
            type = 'PHYSICS';
        }
        else if (codeLower.includes('glitch') || codeLower.includes('digital')) {
            type = 'DIGITAL';
        }
        // Determine category based on code content
        var category = 'EFFECT'; // default
        if (codeLower.includes('explosion') || codeLower.includes('burst')) {
            category = 'EXPLOSION';
        }
        else if (codeLower.includes('transition') || codeLower.includes('morph')) {
            category = 'TRANSITION';
        }
        else if (codeLower.includes('fire') || codeLower.includes('flame')) {
            category = 'FIRE';
        }
        else if (codeLower.includes('lightning') || codeLower.includes('storm')) {
            category = 'ATMOSPHERIC';
        }
        else if (codeLower.includes('transform') || codeLower.includes('shape')) {
            category = 'TRANSFORMATION';
        }
        else if (codeLower.includes('glitch') || codeLower.includes('distort')) {
            category = 'DISTORTION';
        }
        return { category: category, type: type };
    };
    JobQueue.prototype.extractTags = function (description) {
        var commonTags = [
            'particles', 'explosion', 'fire', 'water', 'light', 'glow', 'smoke',
            'magic', 'energy', 'plasma', 'electric', 'storm', 'wind', 'dust',
            'sparkle', 'trail', 'burst', 'flash', 'beam', 'aura', 'wave',
            'ripple', 'dissolve', 'materialize', 'transform', 'morph'
        ];
        var descriptionLower = description.toLowerCase();
        var tags = commonTags.filter(function (tag) {
            return descriptionLower.includes(tag) ||
                descriptionLower.includes(tag + 's') ||
                descriptionLower.includes(tag + 'ing');
        });
        // Add color tags
        var colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'white', 'black'];
        colors.forEach(function (color) {
            if (descriptionLower.includes(color)) {
                tags.push(color);
            }
        });
        // Add size tags
        var sizes = ['small', 'large', 'tiny', 'huge', 'massive', 'mini'];
        sizes.forEach(function (size) {
            if (descriptionLower.includes(size)) {
                tags.push(size);
            }
        });
        return __spreadArray([], new Set(tags), true); // Remove duplicates
    };
    JobQueue.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    // Public methods for queue management
    JobQueue.prototype.getQueueStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getQueueStats()];
                    case 1:
                        stats = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, stats), { totalProcessed: stats.completed + stats.failed })];
                }
            });
        });
    };
    JobQueue.prototype.pauseProcessing = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.processingInterval) {
                    clearInterval(this.processingInterval);
                    this.processingInterval = null;
                    console.log('Job queue processing paused');
                }
                return [2 /*return*/];
            });
        });
    };
    JobQueue.prototype.resumeProcessing = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.processingInterval) {
                    this.startProcessing();
                    console.log('Job queue processing resumed');
                }
                return [2 /*return*/];
            });
        });
    };
    JobQueue.prototype.retryFailedJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getJob(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!(job && job.status === 'failed')) return [3 /*break*/, 3];
                        return [4 /*yield*/, storage.updateJob(jobId, {
                                status: 'queued',
                                progress: 0,
                                error: null
                            })];
                    case 2:
                        _a.sent();
                        console.log("Job ".concat(jobId, " queued for retry"));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JobQueue.prototype.cancelJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getJob(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!(job && (job.status === 'queued' || job.status === 'processing'))) return [3 /*break*/, 3];
                        return [4 /*yield*/, storage.updateJob(jobId, {
                                status: 'failed',
                                error: 'Job cancelled by user'
                            })];
                    case 2:
                        _a.sent();
                        this.processingJobs.delete(jobId);
                        console.log("Job ".concat(jobId, " cancelled"));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JobQueue.prototype.getProcessingJobs = function () {
        return Array.from(this.processingJobs.values());
    };
    JobQueue.prototype.setMaxConcurrentJobs = function (max) {
        this.maxConcurrentJobs = Math.max(1, Math.min(10, max));
        console.log("Max concurrent jobs set to: ".concat(this.maxConcurrentJobs));
    };
    // Cleanup method
    JobQueue.prototype.destroy = function () {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        this.processingJobs.clear();
        console.log('Job queue destroyed');
    };
    return JobQueue;
}());
export var jobQueue = new JobQueue();
// Graceful shutdown
process.on('SIGTERM', function () {
    console.log('Shutting down job queue...');
    jobQueue.destroy();
});
process.on('SIGINT', function () {
    console.log('Shutting down job queue...');
    jobQueue.destroy();
    process.exit(0);
});
