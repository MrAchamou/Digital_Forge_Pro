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
import { exec } from 'child_process';
import { promisify } from 'util';
var execAsync = promisify(exec);
var DependencyChecker = /** @class */ (function () {
    function DependencyChecker() {
    }
    DependencyChecker.checkAllDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, _i, _a, command, error_1, npxError_1, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        issues = [];
                        _i = 0, _a = this.requiredCommands;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 11];
                        command = _a[_i];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, execAsync("which ".concat(command))];
                    case 3:
                        _e.sent();
                        return [3 /*break*/, 10];
                    case 4:
                        error_1 = _e.sent();
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 7, , 9]);
                        return [4 /*yield*/, execAsync("npx ".concat(command, " --version"))];
                    case 6:
                        _e.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        npxError_1 = _e.sent();
                        _c = (_b = issues).push;
                        _d = {
                            command: command,
                            missing: true
                        };
                        return [4 /*yield*/, this.getSolution(command)];
                    case 8:
                        _c.apply(_b, [(_d.solution = _e.sent(),
                                _d)]);
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 1];
                    case 11: return [2 /*return*/, issues];
                }
            });
        });
    };
    DependencyChecker.getSolution = function (command) {
        var solutions = {
            'tsx': 'npm install -g tsx',
            'tsc': 'npm install -g typescript',
            'vite': 'npm install vite',
            'drizzle-kit': 'npm install drizzle-kit'
        };
        return solutions[command] || "npm install ".concat(command);
    };
    DependencyChecker.autoFixDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, _i, issues_1, issue, installError_1, finalCheck, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        console.log('🔍 Vérification des dépendances...');
                        return [4 /*yield*/, this.checkAllDependencies()];
                    case 1:
                        issues = _a.sent();
                        if (issues.length === 0) {
                            console.log('✅ Toutes les dépendances sont présentes');
                            return [2 /*return*/, true];
                        }
                        console.log("\u274C ".concat(issues.length, " d\u00E9pendances manquantes d\u00E9tect\u00E9es"));
                        _i = 0, issues_1 = issues;
                        _a.label = 2;
                    case 2:
                        if (!(_i < issues_1.length)) return [3 /*break*/, 7];
                        issue = issues_1[_i];
                        console.log("\uD83D\uDCE6 Installation de ".concat(issue.command, "..."));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, execAsync(issue.solution)];
                    case 4:
                        _a.sent();
                        console.log("\u2705 ".concat(issue.command, " install\u00E9 avec succ\u00E8s"));
                        return [3 /*break*/, 6];
                    case 5:
                        installError_1 = _a.sent();
                        console.log("\u274C \u00C9chec installation ".concat(issue.command, ":"), installError_1.message);
                        return [2 /*return*/, false];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [4 /*yield*/, this.checkAllDependencies()];
                    case 8:
                        finalCheck = _a.sent();
                        if (finalCheck.length === 0) {
                            console.log('🎉 Toutes les dépendances sont maintenant installées');
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 9:
                        error_2 = _a.sent();
                        console.error('❌ Erreur lors de la vérification des dépendances:', error_2);
                        return [2 /*return*/, false];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    DependencyChecker.requiredCommands = [
        'tsx',
        'tsc',
        'vite',
        'drizzle-kit'
    ];
    return DependencyChecker;
}());
export { DependencyChecker };
