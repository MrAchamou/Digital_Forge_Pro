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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
export function useFileUpload() {
    var _this = this;
    var _a = useState(false), isUploading = _a[0], setIsUploading = _a[1];
    var _b = useState({}), uploadProgress = _b[0], setUploadProgress = _b[1];
    var toast = useToast().toast;
    var uploadFiles = function (files) { return __awaiter(_this, void 0, void 0, function () {
        var uploadedIds, formData_1, progressMap_1, response, errorData, result, completedProgress_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (files.length === 0) {
                        throw new Error("No files selected");
                    }
                    setIsUploading(true);
                    uploadedIds = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    formData_1 = new FormData();
                    files.forEach(function (file) {
                        formData_1.append('files', file);
                    });
                    progressMap_1 = {};
                    files.forEach(function (file) {
                        progressMap_1[file.name] = 0;
                    });
                    setUploadProgress(progressMap_1);
                    return [4 /*yield*/, fetch('/api/upload', {
                            method: 'POST',
                            body: formData_1,
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorData = _a.sent();
                    throw new Error("Upload failed: ".concat(errorData));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _a.sent();
                    if (result.uploads) {
                        result.uploads.forEach(function (upload) {
                            uploadedIds.push(upload.id);
                        });
                    }
                    completedProgress_1 = {};
                    files.forEach(function (file) {
                        completedProgress_1[file.name] = 100;
                    });
                    setUploadProgress(completedProgress_1);
                    toast({
                        title: "Upload Successful",
                        description: "".concat(files.length, " file(s) uploaded successfully"),
                    });
                    return [2 /*return*/, uploadedIds];
                case 6:
                    error_1 = _a.sent();
                    console.error("Upload error:", error_1);
                    toast({
                        title: "Upload Failed",
                        description: error_1 instanceof Error ? error_1.message : "Failed to upload files",
                        variant: "destructive"
                    });
                    throw error_1;
                case 7:
                    setIsUploading(false);
                    // Clear progress after a delay
                    setTimeout(function () {
                        setUploadProgress({});
                    }, 3000);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var uploadSingleFile = function (file) { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, uploadFiles([file])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); };
    return {
        uploadFiles: uploadFiles,
        uploadSingleFile: uploadSingleFile,
        isUploading: isUploading,
        uploadProgress: uploadProgress,
    };
}
