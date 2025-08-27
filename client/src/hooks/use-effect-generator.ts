import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Job, EffectGenerationResponse } from "@shared/schema";

export function useEffectGenerator() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Poll current job status
  const { data: currentJob, refetch: refetchJob } = useQuery<Job>({
    queryKey: ["/api/effects/status", currentJobId],
    enabled: !!currentJobId,
    refetchInterval: (data) => {
      // Stop polling if job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  const generateEffect = async (
    description: string, 
    platform: string = "javascript", 
    options: Record<string, any> = {}
  ): Promise<string> => {
    try {
      setIsGenerating(true);
      
      const response = await apiRequest("POST", "/api/effects/generate", {
        description,
        platform,
        options
      });
      
      const result: EffectGenerationResponse = await response.json();
      setCurrentJobId(result.jobId);
      
      // Start polling job status
      refetchJob();
      
      return result.jobId;
    } catch (error) {
      setIsGenerating(false);
      throw error;
    }
  };

  // Update generating state based on job status
  React.useEffect(() => {
    if (currentJob) {
      if (currentJob.status === 'completed' || currentJob.status === 'failed') {
        setIsGenerating(false);
      } else {
        setIsGenerating(true);
      }
    }
  }, [currentJob?.status]);

  const resetGenerator = () => {
    setCurrentJobId(null);
    setIsGenerating(false);
  };

  return {
    generateEffect,
    currentJob,
    isGenerating,
    resetGenerator,
  };
}
