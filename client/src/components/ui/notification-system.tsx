
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Zap, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  Cpu
} from "lucide-react";

interface LibraryStats {
  totalDescriptions: number;
  effectsGenerated: number;
  effectsRemaining: number;
  averageGenerationTime: number;
  successRate: number;
  categories: Record<string, number>;
  expansionRate: number;
  qualityScore: number;
}

interface SystemNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'expansion' | 'generation';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoHide?: boolean;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Stats en temps réel
  const { data: libraryStats, refetch: refetchStats } = useQuery<LibraryStats>({
    queryKey: ["/api/library/real-time-stats"],
    refetchInterval: 3000,
    staleTime: 2000,
  });

  // Notifications en temps réel
  const { data: systemNotifications } = useQuery<SystemNotification[]>({
    queryKey: ["/api/notifications/system"],
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (systemNotifications) {
      setNotifications(prev => {
        const newNotifications = systemNotifications.filter(
          notif => !prev.some(existing => existing.id === notif.id)
        );
        return [...prev, ...newNotifications].slice(-10); // Garder les 10 dernières
      });
    }
  }, [systemNotifications]);

  const getNotificationIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'expansion': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'generation': return <Zap className="w-4 h-4 text-forge-cyan" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const completionPercentage = libraryStats 
    ? (libraryStats.effectsGenerated / libraryStats.totalDescriptions) * 100 
    : 0;

  const remainingPercentage = libraryStats 
    ? (libraryStats.effectsRemaining / libraryStats.totalDescriptions) * 100 
    : 0;

  return (
    <>
      {/* Barre de stats fixe en haut */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-forge-dark/95 backdrop-blur-sm border-b border-forge-purple/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Stats principales */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-forge-gold" />
                <span className="text-sm text-white font-medium">
                  Descriptions: <span className="text-forge-gold">{libraryStats?.totalDescriptions || 0}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-forge-cyan" />
                <span className="text-sm text-white font-medium">
                  Générés: <span className="text-forge-cyan">{libraryStats?.effectsGenerated || 0}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-forge-plasma" />
                <span className="text-sm text-white font-medium">
                  Restants: <span className="text-forge-plasma">{libraryStats?.effectsRemaining || 0}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white font-medium">
                  Qualité: <span className="text-green-400">{(libraryStats?.qualityScore || 0).toFixed(1)}%</span>
                </span>
              </div>
            </div>

            {/* Progress bar et contrôles */}
            <div className="flex items-center space-x-4">
              <div className="w-32">
                <Progress 
                  value={completionPercentage} 
                  className="h-2"
                  style={{
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)'
                  }}
                />
              </div>
              
              <Badge 
                className={`${
                  libraryStats?.expansionRate > 0 ? 'bg-green-500' : 'bg-gray-500'
                } text-white`}
              >
                {libraryStats?.expansionRate > 0 ? 'Expansion Active' : 'Standby'}
              </Badge>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative p-2 bg-forge-purple/20 rounded-lg hover:bg-forge-purple/30 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-forge-purple" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de notifications extensible */}
      {isExpanded && (
        <div className="fixed top-16 right-4 w-96 max-h-[60vh] z-40">
          <Card className="glass-morphism border-forge-purple/30 bg-forge-dark/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-forge-gold flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  Système GOD
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              {/* Stats détaillées */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-forge-dark/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">Temps Moyen</div>
                  <div className="text-forge-cyan font-medium">
                    {libraryStats?.averageGenerationTime || 0}ms
                  </div>
                </div>
                <div className="bg-forge-dark/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">Taux Succès</div>
                  <div className="text-green-400 font-medium">
                    {(libraryStats?.successRate || 0).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Système en veille</p>
                  </div>
                ) : (
                  notifications.slice().reverse().map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.type === 'error' ? 'border-red-400 bg-red-400/10' :
                        notification.type === 'success' ? 'border-green-400 bg-green-400/10' :
                        notification.type === 'warning' ? 'border-yellow-400 bg-yellow-400/10' :
                        notification.type === 'expansion' ? 'border-purple-400 bg-purple-400/10' :
                        notification.type === 'generation' ? 'border-forge-cyan bg-forge-cyan/10' :
                        'border-blue-400 bg-blue-400/10'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-300 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
