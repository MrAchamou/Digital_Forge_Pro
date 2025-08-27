import { useQuery } from "@tanstack/react-query";
import type { SystemHealth, Job } from "@shared/schema";

export function useSystemStatus() {
  // System health data
  const { 
    data: systemHealth, 
    isLoading: healthLoading, 
    error: healthError 
  } = useQuery<SystemHealth>({
    queryKey: ["/api/system/health"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Queue statistics
  const { 
    data: queueStats, 
    isLoading: queueLoading 
  } = useQuery({
    queryKey: ["/api/queue/stats"],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Recent jobs
  const { 
    data: recentJobs, 
    isLoading: jobsLoading 
  } = useQuery<Job[]>({
    queryKey: ["/api/queue/jobs"],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // System metrics
  const { 
    data: metrics, 
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ["/api/system/metrics"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Computed status indicators
  const isSystemHealthy = systemHealth ? systemHealth.overall > 90 : false;
  const hasActiveJobs = queueStats ? queueStats.processing > 0 : false;
  const queueSize = queueStats ? queueStats.queued : 0;

  // Module status summary
  const moduleStatus = systemHealth?.modules ? Object.entries(systemHealth.modules).map(([name, data]) => ({
    name,
    status: data.status,
    load: data.load,
    effectCount: data.effectCount,
    isOnline: data.status === 'online'
  })) : [];

  const onlineModules = moduleStatus.filter(m => m.isOnline).length;
  const totalModules = moduleStatus.length;

  // Resource usage averages
  const averageResourceUsage = systemHealth?.resources ? {
    cpu: systemHealth.resources.cpu,
    memory: systemHealth.resources.memory,
    gpu: systemHealth.resources.gpu,
    network: systemHealth.resources.network,
    storage: systemHealth.resources.storage,
    overall: (
      systemHealth.resources.cpu + 
      systemHealth.resources.memory + 
      systemHealth.resources.gpu + 
      systemHealth.resources.network + 
      systemHealth.resources.storage
    ) / 5
  } : null;

  // Job processing rate (jobs completed in last hour - mock calculation)
  const processingRate = recentJobs 
    ? recentJobs.filter(job => 
        job.status === 'completed' && 
        job.completedAt && 
        new Date(job.completedAt).getTime() > Date.now() - 3600000
      ).length 
    : 0;

  // System alerts
  const alerts = [];
  if (systemHealth?.overall && systemHealth.overall < 85) {
    alerts.push({
      type: 'warning' as const,
      message: 'System health below optimal',
      value: systemHealth.overall
    });
  }
  if (averageResourceUsage && averageResourceUsage.overall > 80) {
    alerts.push({
      type: 'warning' as const,
      message: 'High resource usage detected',
      value: averageResourceUsage.overall
    });
  }
  if (onlineModules < totalModules) {
    alerts.push({
      type: 'error' as const,
      message: `${totalModules - onlineModules} modules offline`,
      value: onlineModules
    });
  }

  return {
    // Raw data
    systemHealth,
    queueStats,
    recentJobs,
    metrics,
    
    // Loading states
    isLoading: healthLoading || queueLoading || jobsLoading || metricsLoading,
    healthLoading,
    queueLoading,
    jobsLoading,
    metricsLoading,
    
    // Errors
    healthError,
    
    // Computed values
    isSystemHealthy,
    hasActiveJobs,
    queueSize,
    moduleStatus,
    onlineModules,
    totalModules,
    averageResourceUsage,
    processingRate,
    alerts,
    
    // Helper functions
    getModuleByName: (name: string) => moduleStatus.find(m => m.name === name),
    isModuleOnline: (name: string) => moduleStatus.find(m => m.name === name)?.isOnline || false,
  };
}
