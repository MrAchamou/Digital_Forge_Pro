import { useState, useEffect } from "react";
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
    refetchInterval: (query) => {
      const data = (query as any).state?.data as Job | undefined;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000;
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
  useEffect(() => {
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
