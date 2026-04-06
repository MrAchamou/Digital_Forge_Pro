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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
export default function CodePreview(_a) {
    var _this = this;
    var code = _a.code, _b = _a.language, language = _b === void 0 ? "javascript" : _b, _c = _a.maxHeight, maxHeight = _c === void 0 ? "400px" : _c;
    var _d = useState(false), copied = _d[0], setCopied = _d[1];
    var toast = useToast().toast;
    var handleCopy = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(code)];
                case 1:
                    _a.sent();
                    setCopied(true);
                    toast({
                        title: "Code Copied",
                        description: "Code has been copied to clipboard",
                    });
                    setTimeout(function () { return setCopied(false); }, 2000);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    toast({
                        title: "Copy Failed",
                        description: "Failed to copy code to clipboard",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Simple syntax highlighting for JavaScript
    var highlightSyntax = function (code) {
        if (language !== 'javascript')
            return code;
        return code
            // Keywords
            .replace(/\b(class|function|const|let|var|if|else|for|while|return|import|export|async|await|try|catch|throw|new)\b/g, '<span class="keyword">$1</span>')
            // Strings
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span class="string">$1$2$1</span>')
            // Comments
            .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
            .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
            // Function names
            .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="function">$1</span>')
            // Numbers
            .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');
    };
    return (<div className="relative">
      {/* Copy Button */}
      <Button onClick={handleCopy} size="sm" variant="ghost" className="absolute top-2 right-2 z-10 text-gray-400 hover:text-white hover:bg-forge-dark/80" data-testid="button-copy-code">
        {copied ? (<>
            <Check className="w-4 h-4 mr-1"/>
            Copied!
          </>) : (<>
            <Copy className="w-4 h-4 mr-1"/>
            Copy
          </>)}
      </Button>

      {/* Code Container */}
      <div className="code-preview rounded-lg p-4 text-sm font-mono custom-scrollbar overflow-auto bg-forge-black/90 border border-forge-purple/30" style={{ maxHeight: maxHeight }} data-testid="code-preview-container">
        <pre className="text-gray-300 whitespace-pre-wrap">
          <code className="syntax-highlight block" dangerouslySetInnerHTML={{
            __html: highlightSyntax(code)
        }}/>
        </pre>
      </div>

      {/* Language Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="px-2 py-1 bg-forge-dark/80 text-xs text-gray-400 rounded border border-forge-purple/30">
          {language}
        </span>
      </div>
    </div>);
}
