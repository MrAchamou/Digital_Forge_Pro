import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import UploadZone from "@/components/ui/upload-zone";
import { useFileUpload } from "@/hooks/use-file-upload";
import { 
  CloudUpload, 
  FileText, 
  FileCode, 
  FileType, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Upload {
  id: string;
  filename: string;
  originalName: string;
  status: string;
  processedCount: number;
  totalCount: number;
  errors: string[];
  createdAt: string;
}

export default function Upload() {
  const { uploadFiles, isUploading } = useFileUpload();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: uploads, refetch } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
    refetchInterval: 2000,
  });

  const handleFilesSelected = async (files: File[]) => {
    setSelectedFiles(files);
    await uploadFiles(files);
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-forge-cyan';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-12">
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
        <UploadZone onFilesSelected={handleFilesSelected} isUploading={isUploading} />
      </div>

      {/* Upload Progress */}
      {uploads && uploads.length > 0 && (
        <Card className="glass-morphism border-forge-purple/30 bg-transparent max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-gold flex items-center gap-2">
              <CloudUpload className="w-6 h-6" />
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center space-x-4 p-4 bg-forge-dark/50 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(upload.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium truncate" data-testid={`text-filename-${upload.id}`}>
                      {upload.originalName}
                    </p>
                    <Badge 
                      className={`${getStatusColor(upload.status)} text-white`}
                      data-testid={`badge-status-${upload.id}`}
                    >
                      {upload.status}
                    </Badge>
                  </div>
                  
                  {upload.status === 'processing' && upload.totalCount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Processing: {upload.processedCount}/{upload.totalCount}</span>
                        <span>{Math.round((upload.processedCount / upload.totalCount) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(upload.processedCount / upload.totalCount) * 100}
                        className="h-2"
                        data-testid={`progress-${upload.id}`}
                      />
                    </>
                  )}
                  
                  {upload.errors && upload.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-400 text-sm">Errors:</p>
                      <ul className="text-red-300 text-xs list-disc list-inside">
                        {upload.errors.slice(0, 3).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {upload.errors.length > 3 && (
                          <li>... and {upload.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* File Format Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-forge-cyan/50 transition-colors">
          <FileText className="w-12 h-12 text-forge-cyan mx-auto mb-4" />
          <h3 className="font-medium text-forge-cyan mb-2">Text Files</h3>
          <p className="text-sm text-gray-400">.txt, .md</p>
          <p className="text-xs text-gray-500 mt-2">Plain text descriptions</p>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-forge-plasma/50 transition-colors">
          <FileCode className="w-12 h-12 text-forge-plasma mx-auto mb-4" />
          <h3 className="font-medium text-forge-plasma mb-2">Data Files</h3>
          <p className="text-sm text-gray-400">.json, .csv</p>
          <p className="text-xs text-gray-500 mt-2">Structured data formats</p>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-forge-gold/50 transition-colors">
          <FileType className="w-12 h-12 text-forge-gold mx-auto mb-4" />
          <h3 className="font-medium text-forge-gold mb-2">Documents</h3>
          <p className="text-sm text-gray-400">.docx</p>
          <p className="text-xs text-gray-500 mt-2">Word documents</p>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center p-6 hover:border-red-400/50 transition-colors">
          <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="font-medium text-red-400 mb-2">PDF Files</h3>
          <p className="text-sm text-gray-400">.pdf</p>
          <p className="text-xs text-gray-500 mt-2">OCR Support</p>
        </Card>
      </div>
    </div>
  );
}
