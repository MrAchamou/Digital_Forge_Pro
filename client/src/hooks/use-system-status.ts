import { useQuery } from "@tanstack/react-query";
import type { SystemHealth, Job } from "@shared/schema";

// Interface for SystemStatus with enhanced GOD-level properties
export interface SystemStatus {
  isHealthy: boolean;
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
  modules: {
    errorDetection: boolean;
    qualityAssurance: boolean;
    autonomousMonitor: boolean;
  };
  lastUpdate: Date;
  // Nouvelles propriétés GOD
  godLevel?: {
    overallHealth: number;
    criticalIssues: number;
    autoRepairsToday: number;
    predictiveAccuracy: number;
    learningProgress: number;
  };
  autonomous?: any;
  errorDetection?: any;
  quality?: any;
  systemVitals?: {
    uptime: number;
    memory: any;
    cpu: any;
    platform: string;
    nodeVersion: string;
  };
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Utilisation du nouveau endpoint GOD
        const response = await fetch('/api/health/god-status');
        if (!response.ok) {
          throw new Error('Failed to fetch GOD system status');
        }
        const data = await response.json();

        // Transformation pour compatibilité
        const transformedStatus: SystemStatus = {
          isHealthy: data.godLevel?.overallHealth > 80,
          performance: {
            responseTime: data.autonomous?.performance?.averageResponseTime || 0,
            throughput: data.autonomous?.performance?.throughput || 0,
            errorRate: data.autonomous?.performance?.errorRate || 0,
          },
          modules: {
            errorDetection: data.errorDetection?.isHealthy || false,
            qualityAssurance: data.quality?.totalReports > 0 || false,
            autonomousMonitor: data.autonomous !== null,
          },
          lastUpdate: new Date(data.timestamp),
          // Nouvelles données GOD
          godLevel: data.godLevel,
          autonomous: data.autonomous,
          errorDetection: data.errorDetection,
          quality: data.quality,
          systemVitals: data.systemVitals
        };

        setStatus(transformedStatus);
        setError(null);

        // Log pour debug
        if (data.godLevel?.overallHealth) {
          console.log(`🚀 GOD Health: ${data.godLevel.overallHealth}%`);
        }

      } catch (err) {
        console.error('❌ System status fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Monitoring plus fréquent pour le niveau GOD
    const interval = setInterval(fetchStatus, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Fonction pour forcer l'optimisation
  const forceOptimization = async () => {
    try {
      const response = await fetch('/api/health/force-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('✅ Optimisation forcée déclenchée');
        // Recharge le statut après optimisation
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error('❌ Échec optimisation forcée:', error);
    }
  };

  // Fonction pour déclencher une auto-réparation
  const triggerAutoRepair = async () => {
    try {
      const response = await fetch('/api/system/auto-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔧 Auto-réparation:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ Échec auto-réparation:', error);
    }
  };

  return { 
    status, 
    loading, 
    error, 
    forceOptimization, 
    triggerAutoRepair 
  };
}