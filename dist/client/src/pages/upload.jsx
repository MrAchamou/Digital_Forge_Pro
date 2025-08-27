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
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import UploadZone from "@/components/ui/upload-zone";
import { useFileUpload } from "@/hooks/use-file-upload";
import { CloudUpload, FileText, FileCode, FileType, AlertCircle, CheckCircle, Clock } from "lucide-react";
export default function Upload() {
    var _this = this;
    var _a = useFileUpload(), uploadFiles = _a.uploadFiles, isUploading = _a.isUploading;
    var _b = useState([]), selectedFiles = _b[0], setSelectedFiles = _b[1];
    var _c = useQuery({
        queryKey: ["/api/uploads"],
        refetchInterval: 2000,
    }), uploads = _c.data, refetch = _c.refetch;
    var handleFilesSelected = function (files) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSelectedFiles(files);
                    return [4 /*yield*/, uploadFiles(files)];
                case 1:
                    _a.sent();
                    refetch();
                    return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'processing': return 'bg-forge-cyan';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4"/>;
            case 'processing': return <Clock className="w-4 h-4"/>;
            case 'failed': return <AlertCircle className="w-4 h-4"/>;
            default: return <Clock className="w-4 h-4"/>;
        }
    };
    return (<div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-forge-cyan glow-text">
          DIMENSIONAL PORTAL
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Upload your effect descriptions and watch them transform into stunning visual effects
        </p>
      </div>

      {/* Upload Zone */}
      <div className="max-w-4xl mx-auto">
        <UploadZone onFilesSelected={handleFilesSelected} isUploading={isUploading}/>
      </div>

      {/* Upload Progress */}
      {uploads && uploads.length > 0 && (<Card className="glass-morphism border-forge-purple/30 bg-transparent max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-gold flex items-center gap-2">
              <CloudUpload className="w-6 h-6"/>
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
            {uploads.map(function (upload) { return (<div key={upload.id} className="flex items-center space-x-4 p-4 bg-forge-dark/50 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(upload.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium truncate" data-testid={"text-filename-".concat(upload.id)}>
                      {upload.originalName}
                    </p>
                    <Badge className={"".concat(getStatusColor(upload.status), " text-white")} data-testid={"badge-status-".concat(upload.id)}>
                      {upload.status}
                    </Badge>
                  </div>
                  
                  {upload.status === 'processing' && upload.totalCount > 0 && (<>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Processing: {upload.processedCount}/{upload.totalCount}</span>
                        <span>{Math.round((upload.processedCount / upload.totalCount) * 100)}%</span>
                      </div>
                      <Progress value={(upload.processedCount / upload.totalCount) * 100} className="h-2" data-testid={"progress-".concat(upload.id)}/>
                    </>)}
                  
                  {upload.errors && upload.errors.length > 0 && (<div className="mt-2">
                      <p className="text-red-400 text-sm">Errors:</p>
                      <ul className="text-red-300 text-xs list-disc list-inside">
                        {upload.errors.slice(0, 3).map(function (error, index) { return (<li key={index}>{error}</li>); })}
                        {upload.errors.length > 3 && (<li>... and {upload.errors.length - 3} more</li>)}
                      </ul>
                    </div>)}
                </div>
              </div>); })}
          </CardContent>
        </Card>)}

      {/* File Format Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-forge-cyan/50 transition-colors">
          <FileText className="w-12 h-12 text-forge-cyan mx-auto mb-4"/>
          <h3 className="font-medium text-forge-cyan mb-2">Text Files</h3>
          <p className="text-sm text-gray-400">.txt, .md</p>
          <p className="text-xs text-gray-500 mt-2">Plain text descriptions</p>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-forge-plasma/50 transition-colors">
          <FileCode className="w-12 h-12 text-forge-plasma mx-auto mb-4"/>
          <h3 className="font-medium text-forge-plasma mb-2">Data Files</h3>
          <p className="text-sm text-gray-400">.json, .csv</p>
          <p className="text-xs text-gray-500 mt-2">Structured data formats</p>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-forge-gold/50 transition-colors">
          <FileType className="w-12 h-12 text-forge-gold mx-auto mb-4"/>
          <h3 className="font-medium text-forge-gold mb-2">Documents</h3>
          <p className="text-sm text-gray-400">.docx</p>
          <p className="text-xs text-gray-500 mt-2">Word documents</p>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-red-400/50 transition-colors">
          <FileText className="w-12 h-12 text-red-400 mx-auto mb-4"/>
          <h3 className="font-medium text-red-400 mb-2">PDF Files</h3>
          <p className="text-sm text-gray-400">.pdf</p>
          <p className="text-xs text-gray-500 mt-2">OCR Support</p>
        </Card>
      </div>
    </div>);
}
