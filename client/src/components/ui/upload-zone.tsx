import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  CloudUpload, 
  Upload, 
  File,
  X,
  AlertCircle
} from "lucide-react";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

const defaultAcceptedTypes = ['.txt', '.md', '.json', '.csv', '.docx', '.pdf'];
const defaultMaxFileSize = 10; // 10MB

export default function UploadZone({ 
  onFilesSelected, 
  isUploading = false,
  maxFiles = 10,
  acceptedTypes = defaultAcceptedTypes,
  maxFileSize = defaultMaxFileSize
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not supported`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    // Check total file count
    if (fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  }, [maxFiles, maxFileSize, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
      setErrors([]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card 
        className={cn(
          "border-4 border-dashed transition-all duration-300 cursor-pointer",
          isDragOver 
            ? "border-forge-cyan bg-forge-cyan/10 scale-[1.02]" 
            : "border-forge-cyan/30 hover:border-forge-cyan/50",
          isUploading && "pointer-events-none opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="upload-zone"
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6">
            <CloudUpload className={cn(
              "w-16 h-16 transition-colors",
              isDragOver ? "text-forge-cyan" : "text-gray-400"
            )} />
          </div>
          
          <h3 className={cn(
            "text-2xl font-bold mb-4 transition-colors",
            isDragOver ? "text-forge-cyan" : "text-white"
          )}>
            {isDragOver ? "Drop Files Here" : "Drop Files Here"}
          </h3>
          
          <p className="text-gray-300 mb-6">
            Support for {acceptedTypes.join(', ')} files up to {maxFileSize}MB each
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button 
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={isUploading}
              className="bg-gradient-to-r from-forge-cyan to-forge-plasma text-white px-8 py-3 font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50"
              data-testid="button-browse-files"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            
            <input
              id="file-input"
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              data-testid="input-file-upload"
            />
            
            <p className="text-sm text-gray-400">
              or drag and drop up to {maxFiles} files
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400 mb-2">Upload Errors</h4>
                <ul className="text-sm text-red-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-red-400">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-forge-cyan">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-forge-electric hover:bg-forge-cyan text-white"
                data-testid="button-upload-selected"
              >
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-forge-dark/50 rounded-lg"
                  data-testid={`selected-file-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-forge-cyan" />
                    <div>
                      <p className="font-medium text-white text-sm">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => removeFile(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
