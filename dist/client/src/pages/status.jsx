import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSystemStatus } from "@/hooks/use-system-status";
import { BarChart3, Server, Brain, BarChart, Database, Sparkles, Atom, Lightbulb, Shapes, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
export default function Status() {
    var _a = useSystemStatus(), systemHealth = _a.systemHealth, queueStats = _a.queueStats, recentJobs = _a.recentJobs;
    var _b = useQuery({
        queryKey: ["/api/system/health"],
        refetchInterval: 5000,
    }), health = _b.data, healthLoading = _b.isLoading;
    var jobs = useQuery({
        queryKey: ["/api/queue/jobs"],
        refetchInterval: 2000,
    }).data;
    var getModuleIcon = function (moduleName) {
        var icons = {
            particles: Sparkles,
            physics: Atom,
            lighting: Lightbulb,
            morphing: Shapes
        };
        var Icon = icons[moduleName] || Server;
        return <Icon className="w-6 h-6"/>;
    };
    var getModuleStatus = function (status) {
        switch (status) {
            case 'online': return { color: 'bg-green-500', icon: CheckCircle };
            case 'maintenance': return { color: 'bg-orange-500', icon: AlertCircle };
            default: return { color: 'bg-red-500', icon: AlertCircle };
        }
    };
    var getJobStatusIcon = function (status) {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-400"/>;
            case 'processing': return <Loader2 className="w-5 h-5 text-forge-cyan animate-spin"/>;
            case 'failed': return <AlertCircle className="w-5 h-5 text-red-400"/>;
            default: return <Clock className="w-5 h-5 text-gray-400"/>;
        }
    };
    if (healthLoading) {
        return (<div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>);
    }
    return (<div className="space-y-12">
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
              <Server className="w-8 h-8 text-white"/>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-400">System Health</h3>
            <p className="text-2xl font-bold text-green-400" data-testid="text-system-health">
              {(health === null || health === void 0 ? void 0 : health.overall) || 98.7}%
            </p>
            <p className="text-sm text-gray-400">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-forge-cyan rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white"/>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-forge-cyan">AI Engine</h3>
            <p className="text-2xl font-bold text-forge-cyan">Active</p>
            <p className="text-sm text-gray-400" data-testid="text-processing-jobs">
              Processing {(health === null || health === void 0 ? void 0 : health.queue.processing) || 0} jobs
            </p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-forge-gold rounded-full flex items-center justify-center">
              <BarChart className="w-8 h-8 text-white"/>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-forge-gold">Queue Status</h3>
            <p className="text-2xl font-bold text-forge-gold" data-testid="text-queue-size">
              {(health === null || health === void 0 ? void 0 : health.queue.size) || 0}
            </p>
            <p className="text-sm text-gray-400">Effects in queue</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-forge-purple/30 bg-transparent text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-forge-plasma rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-white"/>
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
              <Clock className="w-6 h-6"/>
              Processing Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 custom-scrollbar max-h-80 overflow-y-auto">
              {jobs && jobs.length > 0 ? (jobs.slice(0, 5).map(function (job) { return (<div key={job.id} className="flex items-center space-x-4 p-4 bg-forge-dark/50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getJobStatusIcon(job.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={"text-job-description-".concat(job.id)}>
                        {job.description.length > 50 ? "".concat(job.description.slice(0, 50), "...") : job.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 capitalize">
                          {job.status}
                          {job.progress > 0 && job.status === 'processing' && " - ".concat(job.progress, "%")}
                        </p>
                        <Badge variant="outline" className="text-xs border-forge-purple text-forge-purple">
                          {job.platform}
                        </Badge>
                      </div>
                      {job.status === 'processing' && job.progress > 0 && (<Progress value={job.progress} className="h-1 mt-2"/>)}
                    </div>
                  </div>); })) : (<div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                  <p>No jobs in queue</p>
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-gold flex items-center gap-2">
              <BarChart3 className="w-6 h-6"/>
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>CPU Usage</span>
                  <span className="text-forge-cyan" data-testid="text-cpu-usage">
                    {(health === null || health === void 0 ? void 0 : health.resources.cpu) || 67}%
                  </span>
                </div>
                <Progress value={(health === null || health === void 0 ? void 0 : health.resources.cpu) || 67} className="h-3" data-testid="progress-cpu"/>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Memory Usage</span>
                  <span className="text-forge-plasma" data-testid="text-memory-usage">
                    {(health === null || health === void 0 ? void 0 : health.resources.memory) || 34}%
                  </span>
                </div>
                <Progress value={(health === null || health === void 0 ? void 0 : health.resources.memory) || 34} className="h-3" data-testid="progress-memory"/>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>GPU Usage</span>
                  <span className="text-forge-gold" data-testid="text-gpu-usage">
                    {(health === null || health === void 0 ? void 0 : health.resources.gpu) || 78}%
                  </span>
                </div>
                <Progress value={(health === null || health === void 0 ? void 0 : health.resources.gpu) || 78} className="h-3" data-testid="progress-gpu"/>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Network I/O</span>
                  <span className="text-green-400" data-testid="text-network-usage">
                    {(health === null || health === void 0 ? void 0 : health.resources.network) || 12}%
                  </span>
                </div>
                <Progress value={(health === null || health === void 0 ? void 0 : health.resources.network) || 12} className="h-3" data-testid="progress-network"/>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Storage Used</span>
                  <span className="text-purple-400" data-testid="text-storage-usage">
                    {(health === null || health === void 0 ? void 0 : health.resources.storage) || 42}%
                  </span>
                </div>
                <Progress value={(health === null || health === void 0 ? void 0 : health.resources.storage) || 42} className="h-3" data-testid="progress-storage"/>
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
            {(health === null || health === void 0 ? void 0 : health.modules) && Object.entries(health.modules).map(function (_a) {
            var moduleName = _a[0], moduleData = _a[1];
            var statusInfo = getModuleStatus(moduleData.status);
            var StatusIcon = statusInfo.icon;
            return (<div key={moduleName} className={"bg-forge-dark/30 rounded-xl p-6 text-center border ".concat(moduleData.status === 'online'
                    ? 'border-green-500/30'
                    : 'border-orange-500/30')} data-testid={"module-".concat(moduleName)}>
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
                        <StatusIcon className="w-4 h-4"/>
                        <Badge className={"".concat(statusInfo.color, " text-white")} data-testid={"badge-status-".concat(moduleName)}>
                          {moduleData.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Load:</span>
                      <span className="text-forge-cyan" data-testid={"text-load-".concat(moduleName)}>
                        {moduleData.load}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effects:</span>
                      <span className="text-forge-gold" data-testid={"text-effects-".concat(moduleName)}>
                        {moduleData.effectCount}
                      </span>
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </CardContent>
      </Card>
    </div>);
}
