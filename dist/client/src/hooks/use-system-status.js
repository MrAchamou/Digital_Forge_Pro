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
export function useSystemStatus() {
    var _this = this;
    var _a = useState(null), status = _a[0], setStatus = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    useEffect(function () {
        var fetchStatus = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, transformedStatus, err_1;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch('/api/health/god-status')];
                    case 1:
                        response = _l.sent();
                        if (!response.ok) {
                            throw new Error('Failed to fetch GOD system status');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _l.sent();
                        transformedStatus = {
                            isHealthy: ((_a = data.godLevel) === null || _a === void 0 ? void 0 : _a.overallHealth) > 80,
                            performance: {
                                responseTime: ((_c = (_b = data.autonomous) === null || _b === void 0 ? void 0 : _b.performance) === null || _c === void 0 ? void 0 : _c.averageResponseTime) || 0,
                                throughput: ((_e = (_d = data.autonomous) === null || _d === void 0 ? void 0 : _d.performance) === null || _e === void 0 ? void 0 : _e.throughput) || 0,
                                errorRate: ((_g = (_f = data.autonomous) === null || _f === void 0 ? void 0 : _f.performance) === null || _g === void 0 ? void 0 : _g.errorRate) || 0,
                            },
                            modules: {
                                errorDetection: ((_h = data.errorDetection) === null || _h === void 0 ? void 0 : _h.isHealthy) || false,
                                qualityAssurance: ((_j = data.quality) === null || _j === void 0 ? void 0 : _j.totalReports) > 0 || false,
                                autonomousMonitor: data.autonomous !== null,
                            },
                            lastUpdate: new Date(data.timestamp),
                            // Nouvelles données GOD
                            godLevel: data.godLevel,
                            autonomous: data.autonomous,
                            errorDetection: data.errorDetection,
                            quality: data.quality,
                            systemVitals: data.systemVitals
                        };
                        setStatus(transformedStatus);
                        setError(null);
                        // Log pour debug
                        if ((_k = data.godLevel) === null || _k === void 0 ? void 0 : _k.overallHealth) {
                            console.log("\uD83D\uDE80 GOD Health: ".concat(data.godLevel.overallHealth, "%"));
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _l.sent();
                        console.error('❌ System status fetch error:', err_1);
                        setError(err_1 instanceof Error ? err_1.message : 'Unknown error');
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchStatus();
        // Monitoring plus fréquent pour le niveau GOD
        var interval = setInterval(fetchStatus, 15000); // Update every 15 seconds
        return function () { return clearInterval(interval); };
    }, []);
    // Fonction pour forcer l'optimisation
    var forceOptimization = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch('/api/health/force-optimization', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        console.log('✅ Optimisation forcée déclenchée');
                        // Recharge le statut après optimisation
                        setTimeout(function () { return window.location.reload(); }, 2000);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Échec optimisation forcée:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Fonction pour déclencher une auto-réparation
    var triggerAutoRepair = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/system/auto-repair', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    console.log('🔧 Auto-réparation:', result);
                    return [2 /*return*/, result];
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('❌ Échec auto-réparation:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return {
        status: status,
        loading: loading,
        error: error,
        forceOptimization: forceOptimization,
        triggerAutoRepair: triggerAutoRepair
    };
}
