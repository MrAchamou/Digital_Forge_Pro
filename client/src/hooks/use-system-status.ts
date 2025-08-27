import { useQuery } from "@tanstack/react-query";
import type { SystemHealth, Job } from "@shared/schema";

export function useSystemStatus() {
  // System health data with error handling
  const { 
    data: systemHealth, 
    isLoading: healthLoading, 
    error: healthError,
    isError: isHealthError 
  } = useQuery<SystemHealth>({
    queryKey: ["/api/system/health"],
    refetchInterval: 5000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2000,
    gcTime: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    onError: (error) => {
      console.error('System health check failed:', error);
    }
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

  // Enhanced error detection
  const systemErrors = [];
  if (isHealthError) {
    systemErrors.push({
      type: 'health',
      message: 'System health monitoring unavailable',
      severity: 'high'
    });
  }
  if (queueStats?.failed > 5) {
    systemErrors.push({
      type: 'queue',
      message: `${queueStats.failed} failed jobs detected`,
      severity: 'medium'
    });
  }

  // System performance indicators
  const performanceIndicators = {
    responseTime: systemHealth?.performance?.responseTime || 0,
    throughput: queueStats?.processing || 0,
    errorRate: systemHealth?.performance?.errorRate || 0,
    availability: isSystemHealthy ? 99.9 : 85.0
  };

  // Auto-recovery status
  const recoveryStatus = {
    isRecovering: false,
    lastRecoveryTime: null,
    recoveryActions: []
  };

  // Real-time monitoring
  const monitoringStatus = {
    isMonitoring: !isHealthError,
    lastUpdate: new Date(),
    nextUpdate: new Date(Date.now() + 5000),
    dataFreshness: systemHealth ? 'fresh' : 'stale'
  };

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
    systemErrors,
    isHealthError,
    
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
    
    // Enhanced monitoring
    performanceIndicators,
    recoveryStatus,
    monitoringStatus,
    
    // Helper functions
    getModuleByName: (name: string) => moduleStatus.find(m => m.name === name),
    isModuleOnline: (name: string) => moduleStatus.find(m => m.name === name)?.isOnline || false,
    
    // System management
    refreshSystemHealth: () => window.location.reload(), // Simple refresh for now
    acknowledgeAlert: (alertId: string) => {
      console.log(`Alert ${alertId} acknowledged`);
    },
    triggerSystemCheck: () => {
      console.log('Manual system check triggered');
    }
  };
}
