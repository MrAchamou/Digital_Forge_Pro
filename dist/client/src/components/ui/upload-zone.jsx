import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CloudUpload, Upload, File, X, AlertCircle } from "lucide-react";
var defaultAcceptedTypes = ['.txt', '.md', '.json', '.csv', '.docx', '.pdf'];
var defaultMaxFileSize = 10; // 10MB
export default function UploadZone(_a) {
    var onFilesSelected = _a.onFilesSelected, _b = _a.isUploading, isUploading = _b === void 0 ? false : _b, _c = _a.maxFiles, maxFiles = _c === void 0 ? 10 : _c, _d = _a.acceptedTypes, acceptedTypes = _d === void 0 ? defaultAcceptedTypes : _d, _e = _a.maxFileSize, maxFileSize = _e === void 0 ? defaultMaxFileSize : _e;
    var _f = useState(false), isDragOver = _f[0], setIsDragOver = _f[1];
    var _g = useState([]), selectedFiles = _g[0], setSelectedFiles = _g[1];
    var _h = useState([]), errors = _h[0], setErrors = _h[1];
    var validateFile = function (file) {
        var _a;
        // Check file type
        var fileExtension = '.' + ((_a = file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        if (!acceptedTypes.includes(fileExtension)) {
            return "File type ".concat(fileExtension, " is not supported");
        }
        // Check file size
        var fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
            return "File size (".concat(fileSizeMB.toFixed(1), "MB) exceeds limit of ").concat(maxFileSize, "MB");
        }
        return null;
    };
    var handleFiles = useCallback(function (files) {
        var fileArray = Array.from(files);
        var validFiles = [];
        var newErrors = [];
        // Check total file count
        if (fileArray.length > maxFiles) {
            newErrors.push("Maximum ".concat(maxFiles, " files allowed"));
            return;
        }
        // Validate each file
        fileArray.forEach(function (file) {
            var error = validateFile(file);
            if (error) {
                newErrors.push("".concat(file.name, ": ").concat(error));
            }
            else {
                validFiles.push(file);
            }
        });
        setErrors(newErrors);
        if (validFiles.length > 0) {
            setSelectedFiles(validFiles);
        }
    }, [maxFiles, maxFileSize, acceptedTypes]);
    var handleDragOver = useCallback(function (e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);
    var handleDragLeave = useCallback(function (e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);
    var handleDrop = useCallback(function (e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        var files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [handleFiles]);
    var handleFileInputChange = useCallback(function (e) {
        var files = e.target.files;
        if (files) {
            handleFiles(files);
        }
    }, [handleFiles]);
    var handleUpload = function () {
        if (selectedFiles.length > 0) {
            onFilesSelected(selectedFiles);
            setSelectedFiles([]);
            setErrors([]);
        }
    };
    var removeFile = function (index) {
        setSelectedFiles(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    };
    var formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return (<div className="space-y-4">
      {/* Upload Zone */}
      <Card className={cn("border-4 border-dashed transition-all duration-300 cursor-pointer", isDragOver
            ? "border-forge-cyan bg-forge-cyan/10 scale-[1.02]"
            : "border-forge-cyan/30 hover:border-forge-cyan/50", isUploading && "pointer-events-none opacity-50")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} data-testid="upload-zone">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6">
            <CloudUpload className={cn("w-16 h-16 transition-colors", isDragOver ? "text-forge-cyan" : "text-gray-400")}/>
          </div>
          
          <h3 className={cn("text-2xl font-bold mb-4 transition-colors", isDragOver ? "text-forge-cyan" : "text-white")}>
            {isDragOver ? "Drop Files Here" : "Drop Files Here"}
          </h3>
          
          <p className="text-gray-300 mb-6">
            Support for {acceptedTypes.join(', ')} files up to {maxFileSize}MB each
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button onClick={function () { var _a; return (_a = document.getElementById('file-input')) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={isUploading} className="bg-gradient-to-r from-forge-cyan to-forge-plasma text-white px-8 py-3 font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50" data-testid="button-browse-files">
              <Upload className="w-4 h-4 mr-2"/>
              Browse Files
            </Button>
            
            <input id="file-input" type="file" multiple accept={acceptedTypes.join(',')} onChange={handleFileInputChange} className="hidden" data-testid="input-file-upload"/>
            
            <p className="text-sm text-gray-400">
              or drag and drop up to {maxFiles} files
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (<Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
              <div>
                <h4 className="font-medium text-red-400 mb-2">Upload Errors</h4>
                <ul className="text-sm text-red-300 space-y-1">
                  {errors.map(function (error, index) { return (<li key={index} className="flex items-start gap-1">
                      <span className="text-red-400">•</span>
                      {error}
                    </li>); })}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>)}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (<Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-forge-cyan">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button onClick={handleUpload} disabled={isUploading} className="bg-forge-electric hover:bg-forge-cyan text-white" data-testid="button-upload-selected">
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {selectedFiles.map(function (file, index) { return (<div key={index} className="flex items-center justify-between p-3 bg-forge-dark/50 rounded-lg" data-testid={"selected-file-".concat(index)}>
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-forge-cyan"/>
                    <div>
                      <p className="font-medium text-white text-sm">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <Button onClick={function () { return removeFile(index); }} size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" data-testid={"button-remove-file-".concat(index)}>
                    <X className="w-4 h-4"/>
                  </Button>
                </div>); })}
            </div>
          </CardContent>
        </Card>)}
    </div>);
}
