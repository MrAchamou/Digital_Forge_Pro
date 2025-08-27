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
import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import { DependencyChecker } from "./utils/dependency-checker";
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    var start = Date.now();
    var path = req.path;
    var capturedJsonResponse = undefined;
    var originalResJson = res.json;
    res.json = function (bodyJson) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, __spreadArray([bodyJson], args, true));
    };
    res.on("finish", function () {
        var duration = Date.now() - start;
        if (path.startsWith("/api")) {
            var logLine = "".concat(req.method, " ").concat(path, " ").concat(res.statusCode, " in ").concat(duration, "ms");
            if (capturedJsonResponse) {
                logLine += " :: ".concat(JSON.stringify(capturedJsonResponse));
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            log(logLine);
        }
    });
    next();
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var createServer, server, dependenciesOk, port, godMonitor, autonomousMonitor, errorDetection, qualityAssurance, godInitialized, error_1, initialScan, error_2, godStatus;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                registerRoutes(app);
                app.use(function (err, _req, res, _next) {
                    var status = err.status || err.statusCode || 500;
                    var message = err.message || "Internal Server Error";
                    res.status(status).json({ message: message });
                    throw err;
                });
                return [4 /*yield*/, import('http')];
            case 1:
                createServer = (_a.sent()).createServer;
                server = createServer(app);
                if (!(app.get("env") === "development")) return [3 /*break*/, 4];
                // Vérifier et corriger les dépendances automatiquement
                log("Vérification des dépendances...");
                return [4 /*yield*/, DependencyChecker.autoFixDependencies()];
            case 2:
                dependenciesOk = _a.sent();
                if (!dependenciesOk) {
                    log("❌ Impossible de résoudre les problèmes de dépendances", "error");
                    process.exit(1);
                }
                return [4 /*yield*/, setupVite(app, server)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                serveStatic(app);
                _a.label = 5;
            case 5:
                port = parseInt(process.env.PORT || '5000', 10);
                return [4 /*yield*/, import('./core/god-monitor')];
            case 6:
                godMonitor = (_a.sent()).godMonitor;
                return [4 /*yield*/, import('./core/autonomous-monitor')];
            case 7:
                autonomousMonitor = (_a.sent()).autonomousMonitor;
                return [4 /*yield*/, import('./modules/error-detection.module')];
            case 8:
                errorDetection = (_a.sent()).errorDetection;
                return [4 /*yield*/, import('./modules/quality-assurance.module')];
            case 9:
                qualityAssurance = (_a.sent()).qualityAssurance;
                // Initialisation des systèmes globaux
                global.systemCache = new Map();
                global.activeSessions = 0;
                global.processedRequests = 0;
                global.systemMetrics = {
                    responseTime: 0,
                    errorCount: 0
                };
                // Surveillance des métriques de base
                app.use(function (req, res, next) {
                    var startTime = Date.now();
                    global.activeSessions++;
                    res.on('finish', function () {
                        global.activeSessions--;
                        global.processedRequests++;
                        global.systemMetrics.responseTime = Date.now() - startTime;
                    });
                    next();
                });
                // === ACTIVATION SYSTÈME GOD ===
                console.log('🚀 Activation du système GOD...');
                godInitialized = godMonitor.initialize();
                if (godInitialized) {
                    console.log('✅ GOD Monitor activé');
                }
                // Démarrage monitoring autonome
                console.log('🤖 Autonomous Monitor démarré');
                autonomousMonitor.start(); // Assurez-vous que autonomousMonitor.start() est implémenté
                // Activation détection d'erreurs continue
                console.log('🔍 Activation détection d\'erreurs continue...');
                _a.label = 10;
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4 /*yield*/, errorDetection.startContinuousFileMonitoring()];
            case 11:
                _a.sent();
                console.log('✅ Surveillance continue des fichiers activée');
                return [3 /*break*/, 13];
            case 12:
                error_1 = _a.sent();
                console.warn('⚠️ Surveillance fichiers partiellement activée:', error_1.message);
                return [3 /*break*/, 13];
            case 13:
                // Scan initial du système
                console.log('🔍 Scan initial du système...');
                _a.label = 14;
            case 14:
                _a.trys.push([14, 16, , 17]);
                return [4 /*yield*/, errorDetection.scanProjectFiles()];
            case 15:
                initialScan = _a.sent();
                console.log("\uD83D\uDCCA Scan initial: ".concat(initialScan.errors.length, " erreurs trouv\u00E9es, ").concat(initialScan.autoFixed, " auto-corrig\u00E9es"));
                return [3 /*break*/, 17];
            case 16:
                error_2 = _a.sent();
                console.warn('⚠️ Scan initial échoué:', error_2.message);
                return [3 /*break*/, 17];
            case 17:
                godStatus = godMonitor.getGodStatus();
                console.log('\n🎭 === EFFET GENERATOR SERVER - NIVEAU GOD ===');
                console.log("\uD83C\uDF10 API accessible sur: http://localhost:".concat(port));
                console.log("\uD83D\uDD17 WebSocket sur: ws://localhost:".concat(port));
                console.log("\uD83D\uDCCA Sant\u00E9 syst\u00E8me: ".concat(godStatus.overallHealth, "%"));
                console.log("\uD83E\uDDE0 IA confidence: ".concat((godStatus.ai.confidenceLevel * 100).toFixed(1), "%"));
                console.log("\uD83D\uDD2E Pr\u00E9cision pr\u00E9dictive: ".concat((godStatus.predictiveAccuracy * 100).toFixed(1), "%"));
                console.log('🚀 Système GOD opérationnel et autonome!');
                return [2 /*return*/];
        }
    });
}); })();
app.listen(port, '0.0.0.0', function () {
    console.log("\uD83D\uDE80 Serveur d\u00E9marr\u00E9 sur http://0.0.0.0:".concat(port));
    console.log("\uD83D\uDCCA Dashboard disponible sur http://0.0.0.0:".concat(port, "/api/system/health"));
    console.log('🎯 Système GOD entièrement opérationnel');
    console.log('🔍 Auto-détection et correction des erreurs: ACTIVE');
});
