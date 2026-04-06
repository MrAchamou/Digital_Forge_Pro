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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
export function useEffectGenerator() {
    var _this = this;
    var _a = useState(null), currentJobId = _a[0], setCurrentJobId = _a[1];
    var _b = useState(false), isGenerating = _b[0], setIsGenerating = _b[1];
    // Poll current job status
    var _c = useQuery({
        queryKey: ["/api/effects/status", currentJobId],
        enabled: !!currentJobId,
        refetchInterval: function (data) {
            // Stop polling if job is completed or failed
            if ((data === null || data === void 0 ? void 0 : data.status) === 'completed' || (data === null || data === void 0 ? void 0 : data.status) === 'failed') {
                return false;
            }
            return 2000; // Poll every 2 seconds
        },
    }), currentJob = _c.data, refetchJob = _c.refetch;
    var generateEffect = function (description_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([description_1], args_1, true), void 0, function (description, platform, options) {
            var response, result, error_1;
            if (platform === void 0) { platform = "javascript"; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        setIsGenerating(true);
                        return [4 /*yield*/, apiRequest("POST", "/api/effects/generate", {
                                description: description,
                                platform: platform,
                                options: options
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        setCurrentJobId(result.jobId);
                        // Start polling job status
                        refetchJob();
                        return [2 /*return*/, result.jobId];
                    case 3:
                        error_1 = _a.sent();
                        setIsGenerating(false);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Update generating state based on job status
    React.useEffect(function () {
        if (currentJob) {
            if (currentJob.status === 'completed' || currentJob.status === 'failed') {
                setIsGenerating(false);
            }
            else {
                setIsGenerating(true);
            }
        }
    }, [currentJob === null || currentJob === void 0 ? void 0 : currentJob.status]);
    var resetGenerator = function () {
        setCurrentJobId(null);
        setIsGenerating(false);
    };
    return {
        generateEffect: generateEffect,
        currentJob: currentJob,
        isGenerating: isGenerating,
        resetGenerator: resetGenerator,
    };
}
