
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Database, 
  Brain,
  Zap,
  Target,
  TrendingUp,
  Cpu,
  Activity,
  Layers,
  Eye,
  Settings,
  ChevronRight,
  Gauge,
  Network,
  Shield,
  Rocket,
  Atom,
  Binary
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

interface SystemHealth {
  overall: number;
  modules: Record<string, { status: string; performance: number; uptime: string }>;
}

export default function Dashboard() {
  const { data: stats } = useQuery<LibraryStats>({
    queryKey: ["/api/library/real-time-stats"],
    refetchInterval: 3000,
  });

  const { data: health } = useQuery<SystemHealth>({
    queryKey: ["/api/system/health"],
    refetchInterval: 5000,
  });

  const completionRate = stats ? (stats.effectsGenerated / stats.totalDescriptions) * 100 : 0;

  const getHealthColor = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBgColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Header Hero */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-forge-cyan/20 via-forge-purple/20 to-forge-plasma/20 rounded-3xl blur-3xl -z-10" />
        <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-forge-cyan via-forge-purple to-forge-plasma bg-clip-text text-transparent">
          NEXUS COMMAND CENTER
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Neural Effect Generation System • GOD Mode Active • Quantum Processing Online
        </p>
        <div className="flex justify-center items-center mt-6 space-x-4">
          <Badge className={`${getHealthBgColor(health?.overall || 0)} text-white px-4 py-2`}>
            System Health: {health?.overall || 0}%
          </Badge>
          <Badge className="bg-forge-electric text-white px-4 py-2">
            {stats?.expansionRate > 0 ? 'AI Expansion Active' : 'Quantum Standby'}
          </Badge>
          <Badge className="bg-forge-plasma text-white px-4 py-2">
            Quality Score: {(stats?.qualityScore || 0).toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Critical Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Library Power */}
        <Card className="glass-morphism border-forge-cyan/30 bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-forge-cyan/10 to-transparent" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-cyan flex items-center gap-2">
              <Database className="w-6 h-6" />
              Neural Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {(stats?.totalDescriptions || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">Total Descriptions</div>
            <Progress value={completionRate} className="h-3" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Processed: {stats?.effectsGenerated || 0}</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Generation Engine */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-forge-purple/10 to-transparent" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-purple flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Generation Core
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {stats?.averageGenerationTime || 0}ms
            </div>
            <div className="text-sm text-gray-300">Avg Processing Time</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+23% Faster</span>
            </div>
            <Badge className="bg-green-500 text-white">
              Success: {(stats?.successRate || 0).toFixed(1)}%
            </Badge>
          </CardContent>
        </Card>

        {/* AI Expansion */}
        <Card className="glass-morphism border-forge-plasma/30 bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-forge-plasma/10 to-transparent" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-plasma flex items-center gap-2">
              <Brain className="w-6 h-6" />
              AI Expansion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {stats?.expansionRate.toFixed(1) || 0}
            </div>
            <div className="text-sm text-gray-300">Expansion Rate/Hour</div>
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-forge-plasma" />
              <span className="text-forge-plasma text-sm">Quantum Learning</span>
            </div>
            <Badge className={`${stats?.expansionRate > 0 ? 'bg-forge-plasma' : 'bg-gray-500'} text-white`}>
              {stats?.expansionRate > 0 ? 'ACTIVE' : 'STANDBY'}
            </Badge>
          </CardContent>
        </Card>

        {/* System Matrix */}
        <Card className="glass-morphism border-forge-gold/30 bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-forge-gold/10 to-transparent" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-gold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              System Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {health?.overall || 0}%
            </div>
            <div className="text-sm text-gray-300">Overall Health</div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-forge-gold" />
              <span className="text-forge-gold text-sm">All Nodes Online</span>
            </div>
            <Badge className="bg-forge-gold text-forge-dark">
              GOD MODE
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-forge-gold flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Neural Commands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/generator">
              <Button className="w-full bg-gradient-to-r from-forge-cyan to-forge-purple text-white hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <Sparkles className="w-4 h-4 mr-2" />
                Launch God Generator
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link to="/expansion">
              <Button className="w-full bg-gradient-to-r from-forge-purple to-forge-plasma text-white hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <Brain className="w-4 h-4 mr-2" />
                AI Expansion Matrix
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link to="/library">
              <Button className="w-full bg-gradient-to-r from-forge-plasma to-forge-gold text-white hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <Database className="w-4 h-4 mr-2" />
                Neural Library Access
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link to="/status">
              <Button className="w-full bg-gradient-to-r from-forge-gold to-forge-electric text-white hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <Activity className="w-4 h-4 mr-2" />
                System Matrix View
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Modules Status */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-forge-cyan flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Core Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {health?.modules && Object.entries(health.modules).map(([name, module]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-forge-dark/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getHealthBgColor(module.performance)}`} />
                  <span className="text-white font-medium capitalize">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${getHealthColor(module.performance)}`}>
                    {module.performance.toFixed(1)}%
                  </span>
                  <Badge className={`${getHealthBgColor(module.performance)} text-white text-xs`}>
                    {module.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Neural Network Activity */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-forge-plasma flex items-center gap-2">
              <Binary className="w-5 h-5" />
              Neural Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Processing Threads</span>
                <span className="text-forge-cyan font-mono">8/8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Memory Usage</span>
                <span className="text-forge-purple font-mono">2.1GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Neural Connections</span>
                <span className="text-forge-plasma font-mono">∞</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum State</span>
                <span className="text-forge-gold font-mono">COHERENT</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-forge-dark/50 to-forge-purple/20 rounded-lg border border-forge-purple/30">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-forge-electric" />
                <span className="text-sm text-forge-electric">Real-Time Metrics</span>
              </div>
              <div className="text-xs text-gray-400">
                System optimizing in real-time • Neural patterns learning • Quantum effects stabilizing
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
