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
import fs from "fs";
import path from "path";
import { storage } from "../storage";
var MultiFormatParser = /** @class */ (function () {
    function MultiFormatParser() {
        this.supportedFormats = ['.txt', '.md', '.json', '.csv', '.docx'];
    }
    MultiFormatParser.prototype.processFile = function (upload) {
        return __awaiter(this, void 0, void 0, function () {
            var fileExtension, fileContent, parsed, _i, _a, description, error_1, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 14]);
                        fileExtension = path.extname(upload.originalName).toLowerCase();
                        if (!!this.supportedFormats.includes(fileExtension)) return [3 /*break*/, 2];
                        return [4 /*yield*/, storage.updateUpload(upload.id, {
                                status: 'failed',
                                errors: ["Unsupported file format: ".concat(fileExtension)]
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, fs.promises.readFile(upload.path)];
                    case 3:
                        fileContent = _b.sent();
                        return [4 /*yield*/, this.parseContent(fileContent, fileExtension, upload.originalName)];
                    case 4:
                        parsed = _b.sent();
                        return [4 /*yield*/, storage.updateUpload(upload.id, {
                                status: 'completed',
                                processedCount: parsed.descriptions.length,
                                totalCount: parsed.descriptions.length,
                                errors: parsed.metadata.errors
                            })];
                    case 5:
                        _b.sent();
                        _i = 0, _a = parsed.descriptions;
                        _b.label = 6;
                    case 6:
                        if (!(_i < _a.length)) return [3 /*break*/, 11];
                        description = _a[_i];
                        if (!(description.trim().length > 10)) return [3 /*break*/, 10];
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.createEffectJob(description.trim())];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _b.sent();
                        console.error("Failed to create effect job:", error_1);
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 6];
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        error_2 = _b.sent();
                        console.error("File processing error:", error_2);
                        return [4 /*yield*/, storage.updateUpload(upload.id, {
                                status: 'failed',
                                errors: [error_2 instanceof Error ? error_2.message : 'Unknown processing error']
                            })];
                    case 13:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    MultiFormatParser.prototype.parseContent = function (content, format, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, descriptions, _a, error_3, validDescriptions, allText, wordCount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        errors = [];
                        descriptions = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        _a = format;
                        switch (_a) {
                            case '.txt': return [3 /*break*/, 2];
                            case '.md': return [3 /*break*/, 2];
                            case '.json': return [3 /*break*/, 3];
                            case '.csv': return [3 /*break*/, 4];
                            case '.docx': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 2:
                        descriptions = this.parseTextFile(content);
                        return [3 /*break*/, 8];
                    case 3:
                        descriptions = this.parseJsonFile(content);
                        return [3 /*break*/, 8];
                    case 4:
                        descriptions = this.parseCsvFile(content);
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, this.parseDocxFile(content)];
                    case 6:
                        descriptions = _b.sent();
                        return [3 /*break*/, 8];
                    case 7: throw new Error("Unsupported format: ".concat(format));
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_3 = _b.sent();
                        errors.push("Parsing error: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error'));
                        // Try fallback text parsing
                        try {
                            descriptions = this.parseTextFile(content);
                            errors.push("Falling back to text parsing");
                        }
                        catch (fallbackError) {
                            errors.push("Fallback parsing also failed");
                        }
                        return [3 /*break*/, 10];
                    case 10:
                        validDescriptions = descriptions.filter(function (desc) { return desc.trim().length > 5; });
                        if (validDescriptions.length === 0) {
                            errors.push("No valid effect descriptions found in file");
                        }
                        allText = descriptions.join(' ');
                        wordCount = allText.split(/\s+/).filter(function (word) { return word.length > 0; }).length;
                        return [2 /*return*/, {
                                descriptions: validDescriptions,
                                metadata: {
                                    format: format,
                                    lineCount: descriptions.length,
                                    wordCount: wordCount,
                                    errors: errors
                                }
                            }];
                }
            });
        });
    };
    MultiFormatParser.prototype.parseTextFile = function (content) {
        var text = content.toString('utf-8');
        // Split by lines and filter out empty ones
        var lines = text.split(/\r?\n/)
            .map(function (line) { return line.trim(); })
            .filter(function (line) { return line.length > 0 && !line.startsWith('#') && !line.startsWith('//'); });
        // Also try to split by common delimiters
        var additionalSplits = text.split(/[.!?]+/)
            .map(function (sentence) { return sentence.trim(); })
            .filter(function (sentence) { return sentence.length > 10; });
        return __spreadArray(__spreadArray([], lines, true), additionalSplits, true);
    };
    MultiFormatParser.prototype.parseJsonFile = function (content) {
        var _this = this;
        var text = content.toString('utf-8');
        var jsonData = JSON.parse(text);
        var descriptions = [];
        // Handle different JSON structures
        if (Array.isArray(jsonData)) {
            jsonData.forEach(function (item) {
                if (typeof item === 'string') {
                    descriptions.push(item);
                }
                else if (typeof item === 'object' && item !== null) {
                    _this.extractStringsFromObject(item, descriptions);
                }
            });
        }
        else if (typeof jsonData === 'object' && jsonData !== null) {
            this.extractStringsFromObject(jsonData, descriptions);
        }
        return descriptions;
    };
    MultiFormatParser.prototype.extractStringsFromObject = function (obj, descriptions) {
        var _this = this;
        var potentialFields = ['description', 'effect', 'text', 'content', 'prompt', 'instruction'];
        var _loop_1 = function (key, value) {
            if (typeof value === 'string' && value.length > 5) {
                // Prioritize known description fields
                if (potentialFields.some(function (field) { return key.toLowerCase().includes(field); })) {
                    descriptions.unshift(value);
                }
                else {
                    descriptions.push(value);
                }
            }
            else if (Array.isArray(value)) {
                value.forEach(function (item) {
                    if (typeof item === 'string' && item.length > 5) {
                        descriptions.push(item);
                    }
                    else if (typeof item === 'object' && item !== null) {
                        _this.extractStringsFromObject(item, descriptions);
                    }
                });
            }
            else if (typeof value === 'object' && value !== null) {
                this_1.extractStringsFromObject(value, descriptions);
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            _loop_1(key, value);
        }
    };
    MultiFormatParser.prototype.parseCsvFile = function (content) {
        var _a;
        var text = content.toString('utf-8');
        var lines = text.split(/\r?\n/);
        var descriptions = [];
        // Try to detect CSV structure
        var headers = (_a = lines[0]) === null || _a === void 0 ? void 0 : _a.split(',').map(function (h) { return h.trim().toLowerCase(); });
        var descriptionColumnIndex = headers === null || headers === void 0 ? void 0 : headers.findIndex(function (header) {
            return header.includes('description') ||
                header.includes('effect') ||
                header.includes('text') ||
                header.includes('prompt');
        });
        if (descriptionColumnIndex !== undefined && descriptionColumnIndex >= 0) {
            // Use the identified description column
            for (var i = 1; i < lines.length; i++) {
                var columns = this.parseCsvLine(lines[i]);
                if (columns && columns[descriptionColumnIndex]) {
                    descriptions.push(columns[descriptionColumnIndex].trim());
                }
            }
        }
        else {
            // Fall back to extracting from all columns
            for (var i = 1; i < lines.length; i++) {
                var columns = this.parseCsvLine(lines[i]);
                if (columns) {
                    columns.forEach(function (column) {
                        if (column && column.trim().length > 10) {
                            descriptions.push(column.trim());
                        }
                    });
                }
            }
        }
        return descriptions;
    };
    MultiFormatParser.prototype.parseCsvLine = function (line) {
        var result = [];
        var current = '';
        var inQuotes = false;
        for (var i = 0; i < line.length; i++) {
            var char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current);
        return result.length > 0 ? result : null;
    };
    MultiFormatParser.prototype.parseDocxFile = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var text, textMatches, descriptions_1, readableText;
            return __generator(this, function (_a) {
                // Basic DOCX parsing without external libraries
                // DOCX files are ZIP archives containing XML files
                try {
                    text = content.toString('binary');
                    textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
                    descriptions_1 = [];
                    if (textMatches) {
                        textMatches.forEach(function (match) {
                            var textContent = match.replace(/<[^>]*>/g, '').trim();
                            if (textContent.length > 5) {
                                descriptions_1.push(textContent);
                            }
                        });
                    }
                    // If no text found, try a different approach
                    if (descriptions_1.length === 0) {
                        readableText = content.toString('utf-8', 0, Math.min(content.length, 10000))
                            .replace(/[^\x20-\x7E\s]/g, '') // Keep only printable ASCII
                            .split(/\s+/)
                            .filter(function (word) { return word.length > 3; })
                            .join(' ');
                        if (readableText.length > 20) {
                            descriptions_1.push(readableText);
                        }
                    }
                    return [2 /*return*/, descriptions_1];
                }
                catch (error) {
                    throw new Error("Failed to parse DOCX file: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                }
                return [2 /*return*/];
            });
        });
    };
    MultiFormatParser.prototype.createEffectJob = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, storage.createJob({
                                description: description,
                                platform: 'javascript',
                                options: {
                                    source: 'file_upload',
                                    performance: 'medium'
                                },
                                estimatedTime: 180 // 3 minutes default
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Failed to create job from parsed description:", error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Utility method to validate file format
    MultiFormatParser.prototype.isFormatSupported = function (filename) {
        var extension = path.extname(filename).toLowerCase();
        return this.supportedFormats.includes(extension);
    };
    // Get file format info
    MultiFormatParser.prototype.getFormatInfo = function (filename) {
        var extension = path.extname(filename).toLowerCase();
        var formatInfo = {
            '.txt': { name: 'Plain Text', description: 'Simple text file with effect descriptions' },
            '.md': { name: 'Markdown', description: 'Markdown formatted text with effect descriptions' },
            '.json': { name: 'JSON', description: 'Structured data with effect descriptions' },
            '.csv': { name: 'CSV', description: 'Comma-separated values with effect data' },
            '.docx': { name: 'Word Document', description: 'Microsoft Word document with effect descriptions' }
        };
        return formatInfo[extension] || {
            name: 'Unknown',
            description: 'Unsupported file format'
        };
    };
    // Batch process multiple files
    MultiFormatParser.prototype.processBatch = function (uploads) {
        return __awaiter(this, void 0, void 0, function () {
            var processingPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        processingPromises = uploads.map(function (upload) { return _this.processFile(upload); });
                        return [4 /*yield*/, Promise.allSettled(processingPromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MultiFormatParser;
}());
export var multiFormatParser = new MultiFormatParser();
