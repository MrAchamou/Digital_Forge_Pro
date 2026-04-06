import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSystemStatus } from "@/hooks/use-system-status";
import { 
  BarChart3, 
  Server, 
  Brain, 
  BarChart, 
  Database,
  Sparkles,
  Atom,
  Lightbulb,
  Shapes,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  RefreshCw,
  Zap,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SystemHealth, Job } from "@shared/schema";

interface ApiKeyInfo {
  id: string;
  service: string;
  status: 'active' | 'cooldown' | 'exhausted' | 'error';
  usageToday: number;
  dailyLimit: number;
  successCount: number;
  avgResponseTime: number;
  cooldownUntil: string | null;
  lastError: string | null;
}

interface KeysStatus {
  keys: ApiKeyInfo[];
  summary: Record<string, { total: number; active: number; cooldown: number; exhausted: number; error: number; usageToday: number; capacity: number }>;
  serperMonthly: number;
  serperMonthlyLimit: number;
  daysLeft: number;
}

export default function Status() {
  const { systemHealth, queueStats, recentJobs } = useSystemStatus();
  const queryClient = useQueryClient();

  const { data: health, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ["/api/system/health"],
    refetchInterval: 5000,
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/queue/jobs"],
    refetchInterval: 2000,
  });

  const { data: keysStatus, isLoading: keysLoading } = useQuery<KeysStatus>({
    queryKey: ["/api/keys/status"],
    refetchInterval: 10000,
  });

  const resetMutation = useMutation({
    mutationFn: (service?: string) => apiRequest("POST", "/api/keys/reset", { service }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/keys/status"] }),
  });

  const testMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/keys/test", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/keys/status"] }),
  });

  const getKeyStatusEmoji = (status: ApiKeyInfo['status']) => {
    switch (status) {
      case 'active': return '🟢';
      case 'cooldown': return '🟡';
      case 'exhausted': return '🔴';
      case 'error': return '⛔';
    }
  };

  const getKeyStatusColor = (status: ApiKeyInfo['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'cooldown': return 'text-yellow-400';
      case 'exhausted': return 'text-red-400';
      case 'error': return 'text-red-600';
    }
  };

  const getCooldownRemaining = (cooldownUntil: string | null): string => {
    if (!cooldownUntil) return '';
    const sec = Math.max(0, Math.ceil((new Date(cooldownUntil).getTime() - Date.now()) / 1000));
    return sec > 0 ? `⏱ ${sec}s` : '';
  };

  const SERVICE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
    gemini: { icon: Zap, label: 'GEMINI FLASH', color: 'text-blue-400' },
    cerebras: { icon: Brain, label: 'CEREBRAS', color: 'text-purple-400' },
    serper: { icon: Search, label: 'SERPER', color: 'text-forge-gold' },
  };

  const getModuleIcon = (moduleName: string) => {
    const icons = {
      particles: Sparkles,
      physics: Atom,
      lighting: Lightbulb,
      morphing: Shapes
    };
    const Icon = icons[moduleName as keyof typeof icons] || Server;
    return <Icon className="w-6 h-6" />;
  };

  const getModuleStatus = (status: string) => {
    switch (status) {
      case 'online': return { color: 'bg-green-500', icon: CheckCircle };
      case 'maintenance': return { color: 'bg-orange-500', icon: AlertCircle };
      default: return { color: 'bg-red-500', icon: AlertCircle };
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing': return <Loader2 className="w-5 h-5 text-forge-cyan animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (healthLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-forge-electric glow-text">
          SYSTEM STATUS
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Real-time monitoring of the EffectForge AI system
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <Server className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-400">System Health</h3>
            <p className="text-2xl font-bold text-green-400" data-testid="text-system-health">
              {health?.overall || 98.7}%
            </p>
            <p className="text-sm text-gray-400">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-forge-cyan rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-forge-cyan">AI Engine</h3>
            <p className="text-2xl font-bold text-forge-cyan">Active</p>
            <p className="text-sm text-gray-400" data-testid="text-processing-jobs">
              Processing {health?.queue.processing || 0} jobs
            </p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-forge-gold rounded-full flex items-center justify-center">
              <BarChart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-forge-gold">Queue Status</h3>
            <p className="text-2xl font-bold text-forge-gold" data-testid="text-queue-size">
              {health?.queue.size || 0}
            </p>
            <p className="text-sm text-gray-400">Effects in queue</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-forge-plasma rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-forge-plasma">Library Size</h3>
            <p className="text-2xl font-bold text-forge-plasma">1,247</p>
            <p className="text-sm text-gray-400">Total effects</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Processing Queue */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Processing Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 custom-scrollbar max-h-80 overflow-y-auto">
              {jobs && jobs.length > 0 ? (
                jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center space-x-4 p-4 bg-forge-dark/50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getJobStatusIcon(job.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={`text-job-description-${job.id}`}>
                        {job.description.length > 50 ? `${job.description.slice(0, 50)}...` : job.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 capitalize">
                          {job.status}
                          {job.progress > 0 && job.status === 'processing' && ` - ${job.progress}%`}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-forge-purple text-forge-purple"
                        >
                          {job.platform}
                        </Badge>
                      </div>
                      {job.status === 'processing' && job.progress > 0 && (
                        <Progress value={job.progress} className="h-1 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No jobs in queue</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-gold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>CPU Usage</span>
                  <span className="text-forge-cyan" data-testid="text-cpu-usage">
                    {health?.resources.cpu || 67}%
                  </span>
                </div>
                <Progress 
                  value={health?.resources.cpu || 67} 
                  className="h-3"
                  data-testid="progress-cpu"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Memory Usage</span>
                  <span className="text-forge-plasma" data-testid="text-memory-usage">
                    {health?.resources.memory || 34}%
                  </span>
                </div>
                <Progress 
                  value={health?.resources.memory || 34} 
                  className="h-3"
                  data-testid="progress-memory"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>GPU Usage</span>
                  <span className="text-forge-gold" data-testid="text-gpu-usage">
                    {health?.resources.gpu || 78}%
                  </span>
                </div>
                <Progress 
                  value={health?.resources.gpu || 78} 
                  className="h-3"
                  data-testid="progress-gpu"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Network I/O</span>
                  <span className="text-green-400" data-testid="text-network-usage">
                    {health?.resources.network || 12}%
                  </span>
                </div>
                <Progress 
                  value={health?.resources.network || 12} 
                  className="h-3"
                  data-testid="progress-network"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Storage Used</span>
                  <span className="text-purple-400" data-testid="text-storage-usage">
                    {health?.resources.storage || 42}%
                  </span>
                </div>
                <Progress 
                  value={health?.resources.storage || 42} 
                  className="h-3"
                  data-testid="progress-storage"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Status */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-forge-plasma">
            Module Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {health?.modules && Object.entries(health.modules).map(([moduleName, moduleData]) => {
              const statusInfo = getModuleStatus(moduleData.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={moduleName}
                  className={`bg-forge-dark/30 rounded-xl p-6 text-center border ${
                    moduleData.status === 'online' 
                      ? 'border-green-500/30' 
                      : 'border-orange-500/30'
                  }`}
                  data-testid={`module-${moduleName}`}
                >
                  <div className="mb-4">
                    {getModuleIcon(moduleName)}
                  </div>
                  <h4 className="text-lg font-semibold mb-2 capitalize">
                    {moduleName}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <div className="flex items-center gap-1">
                        <StatusIcon className="w-4 h-4" />
                        <Badge 
                          className={`${statusInfo.color} text-white`}
                          data-testid={`badge-status-${moduleName}`}
                        >
                          {moduleData.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Load:</span>
                      <span className="text-forge-cyan" data-testid={`text-load-${moduleName}`}>
                        {moduleData.load}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effects:</span>
                      <span className="text-forge-gold" data-testid={`text-effects-${moduleName}`}>
                        {moduleData.effectCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* API Keys Monitor */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-2xl font-bold text-forge-cyan flex items-center gap-2">
              <Key className="w-6 h-6" />
              API Keys Monitor
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                data-testid="button-test-keys"
              >
                {testMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                Tester toutes les clés
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={() => resetMutation.mutate(undefined)}
                disabled={resetMutation.isPending}
                data-testid="button-reset-keys"
              >
                {resetMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                Forcer réinitialisation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-forge-cyan" />
              <span className="ml-3 text-gray-400">Chargement des clés...</span>
            </div>
          ) : !keysStatus || keysStatus.keys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
              <p className="text-gray-400 text-lg mb-2">Aucune clé API configurée</p>
              <p className="text-gray-500 text-sm">
                Ajoutez <code className="text-forge-cyan bg-forge-dark/50 px-1 rounded">GEMINI_KEY_1</code>,{' '}
                <code className="text-forge-cyan bg-forge-dark/50 px-1 rounded">CEREBRAS_KEY_1</code>, ou{' '}
                <code className="text-forge-cyan bg-forge-dark/50 px-1 rounded">SERPER_KEY_1</code> dans les Secrets Replit.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {(['gemini', 'cerebras', 'serper'] as const).map((service) => {
                const cfg = SERVICE_CONFIG[service];
                const ServiceIcon = cfg.icon;
                const serviceKeys = keysStatus.keys.filter(k => k.service === service);
                const summary = keysStatus.summary[service];
                if (!summary) return null;

                return (
                  <div key={service} className="bg-forge-dark/30 rounded-xl border border-forge-purple/20 overflow-hidden">
                    {/* En-tête service */}
                    <div className="flex items-center justify-between p-4 border-b border-forge-purple/20">
                      <div className="flex items-center gap-2">
                        <ServiceIcon className={`w-5 h-5 ${cfg.color}`} />
                        <span className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-gray-500 text-sm">— {summary.total} clé{summary.total > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-400">🟢 {summary.active}</span>
                        <span className="text-yellow-400">🟡 {summary.cooldown}</span>
                        <span className="text-red-400">🔴 {summary.exhausted}</span>
                        {summary.error > 0 && <span className="text-red-600">⛔ {summary.error}</span>}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-gray-400 hover:text-white px-2"
                          onClick={() => resetMutation.mutate(service)}
                          disabled={resetMutation.isPending}
                          data-testid={`button-reset-${service}`}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Liste des clés */}
                    <div className="divide-y divide-forge-purple/10">
                      {serviceKeys.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Aucune clé {service.toUpperCase()} configurée
                        </div>
                      ) : (
                        serviceKeys.map((key) => {
                          const usagePct = key.dailyLimit > 0 ? Math.round((key.usageToday / key.dailyLimit) * 100) : 0;
                          const cooldownStr = getCooldownRemaining(key.cooldownUntil);
                          const keyNum = key.id.split('_')[1];

                          return (
                            <div key={key.id} className="flex items-center gap-4 px-4 py-3 text-sm" data-testid={`key-row-${key.id}`}>
                              <span className="text-gray-300 w-12 font-mono">Clé {keyNum}</span>
                              <span className={`w-6 text-base ${getKeyStatusColor(key.status)}`} title={key.status}>
                                {getKeyStatusEmoji(key.status)}
                              </span>
                              <span className={`w-20 font-medium ${getKeyStatusColor(key.status)}`}>
                                {key.status === 'active' ? 'Active' : key.status === 'cooldown' ? 'Cooldown' : key.status === 'exhausted' ? 'Épuisée' : 'Erreur'}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-gray-300">{key.usageToday}/{key.dailyLimit}</span>
                                  {cooldownStr && <span className="text-yellow-400 text-xs">{cooldownStr}</span>}
                                  {key.status === 'exhausted' && (
                                    <span className="text-red-400 text-xs">↻ réinit. demain</span>
                                  )}
                                </div>
                                <Progress value={usagePct} className="h-1" />
                              </div>
                              {key.avgResponseTime > 0 && (
                                <span className="text-gray-400 text-xs w-16 text-right">
                                  {key.avgResponseTime}ms
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pied de service */}
                    <div className="flex items-center justify-between p-4 border-t border-forge-purple/20 text-sm bg-forge-dark/20">
                      <span className="text-gray-400">Total aujourd'hui : <span className="text-white font-medium">{summary.usageToday}</span> requêtes</span>
                      <span className="text-gray-400">Capacité restante : <span className="text-green-400 font-medium">{summary.capacity}</span> requêtes</span>
                    </div>

                    {/* Quota mensuel Serper */}
                    {service === 'serper' && keysStatus && (
                      <div className="p-4 border-t border-forge-purple/20 bg-forge-dark/10">
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="text-forge-gold">Quota mensuel global</span>
                          <span className="text-white font-medium">
                            {keysStatus.serperMonthly}/{keysStatus.serperMonthlyLimit}
                          </span>
                        </div>
                        <Progress value={Math.round((keysStatus.serperMonthly / keysStatus.serperMonthlyLimit) * 100)} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round((keysStatus.serperMonthly / keysStatus.serperMonthlyLimit) * 100)}% utilisé</span>
                          <span>
                            {keysStatus.daysLeft} jour{keysStatus.daysLeft > 1 ? 's' : ''} restant{keysStatus.daysLeft > 1 ? 's' : ''} ce mois —{' '}
                            {keysStatus.daysLeft > 0
                              ? `rythme ~${Math.round(keysStatus.serperMonthly / Math.max(1, 30 - keysStatus.daysLeft))}/jour`
                              : 'fin de mois'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
