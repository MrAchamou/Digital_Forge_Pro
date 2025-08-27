import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) {
      throw new Error("No files selected");
    }

    setIsUploading(true);
    const uploadedIds: string[] = [];

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Initialize progress tracking
      const progressMap: Record<string, number> = {};
      files.forEach((file) => {
        progressMap[file.name] = 0;
      });
      setUploadProgress(progressMap);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${errorData}`);
      }

      const result = await response.json();
      
      if (result.uploads) {
        result.uploads.forEach((upload: any) => {
          uploadedIds.push(upload.id);
        });
      }

      // Update progress to 100% for all files
      const completedProgress: Record<string, number> = {};
      files.forEach((file) => {
        completedProgress[file.name] = 100;
      });
      setUploadProgress(completedProgress);

      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully`,
      });

      return uploadedIds;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({});
      }, 3000);
    }
  };

  const uploadSingleFile = async (file: File): Promise<string> => {
    const result = await uploadFiles([file]);
    return result[0];
  };

  return {
    uploadFiles,
    uploadSingleFile,
    isUploading,
    uploadProgress,
  };
}
