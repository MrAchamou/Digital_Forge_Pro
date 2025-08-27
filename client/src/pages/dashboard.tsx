import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AIOrb from "@/components/ui/ai-orb";
import { Link } from "wouter";
import { 
  Brain, 
  Zap, 
  FolderOpen, 
  Upload, 
  Sparkles, 
  Atom, 
  Lightbulb, 
  Shapes,
  Check,
  Cog,
  TrendingUp
} from "lucide-react";

interface SystemHealth {
  overall: number;
  modules: Record<string, { status: string; load: number; effectCount: number }>;
  queue: { size: number; processing: number; failed: number };
  resources: {
    cpu: number;
    memory: number;
    gpu: number;
    network: number;
    storage: number;
  };
}

export default function Dashboard() {
  const { data: health, isLoading } = useQuery<SystemHealth>({
    queryKey: ["/api/system/health"],
    refetchInterval: 5000,
  });

  const { data: queueStats } = useQuery({
    queryKey: ["/api/queue/stats"],
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent forge-gradient glow-text">
          DIGITAL FORGE
        </h1>
        <p className="text-lg md:text-xl text-forge-cyan opacity-80 max-w-3xl mx-auto">
          Autonomous AI-Powered Visual Effects Generator
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Status Panel */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
              <Brain className="w-6 h-6" />
              AI Core Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-6">
              <AIOrb />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Neural Network</span>
                <Badge variant="default" className="bg-green-500 text-white">
                  Online
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Speed</span>
                <span className="text-forge-cyan">Real-time</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Queue Status</span>
                <span className="text-forge-gold">
                  {queueStats?.queued || 0} waiting
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-plasma flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/generator">
              <Button 
                className="w-full bg-forge-electric hover:bg-forge-cyan text-white font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all"
                data-testid="button-generate-effect"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Effect
              </Button>
            </Link>
            <Link href="/library">
              <Button 
                variant="outline" 
                className="w-full border-forge-purple hover:border-forge-cyan text-forge-cyan font-medium hover:shadow-lg transition-all"
                data-testid="button-browse-library"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Browse Library
              </Button>
            </Link>
            <Link href="/upload">
              <Button 
                variant="outline" 
                className="w-full border-forge-purple hover:border-forge-gold text-forge-gold font-medium hover:shadow-lg transition-all"
                data-testid="button-upload-descriptions"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Descriptions
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-gold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Effects Generated</span>
                <span className="text-forge-cyan">1,247</span>
              </div>
              <div className="w-full bg-forge-dark rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-forge-cyan to-forge-plasma h-2 rounded-full transition-all duration-500" 
                  style={{ width: "75%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Processing Power</span>
                <span className="text-forge-gold">{health?.resources.cpu || 0}%</span>
              </div>
              <div className="w-full bg-forge-dark rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-forge-gold to-forge-plasma h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${health?.resources.cpu || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Memory Usage</span>
                <span className="text-green-400">{health?.resources.memory || 0}%</span>
              </div>
              <div className="w-full bg-forge-dark rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-forge-cyan h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${health?.resources.memory || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Grid */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-forge-cyan">
            Available Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Particles Module */}
            <div className="module-card glass-morphism rounded-xl p-6 text-center border border-forge-purple/20 hover:border-forge-cyan/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-forge-cyan to-forge-electric rounded-lg flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-forge-cyan">Particles</h4>
              <p className="text-sm text-gray-300">Advanced particle systems</p>
              <div className="mt-4">
                <Badge 
                  variant={health?.modules.particles?.status === 'online' ? 'default' : 'secondary'}
                  className={health?.modules.particles?.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {health?.modules.particles?.status || 'offline'}
                </Badge>
              </div>
            </div>

            {/* Physics Module */}
            <div className="module-card glass-morphism rounded-xl p-6 text-center border border-forge-purple/20 hover:border-forge-plasma/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-forge-plasma to-forge-purple rounded-lg flex items-center justify-center">
                <Atom className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-forge-plasma">Physics</h4>
              <p className="text-sm text-gray-300">Realistic physics simulation</p>
              <div className="mt-4">
                <Badge 
                  variant={health?.modules.physics?.status === 'online' ? 'default' : 'secondary'}
                  className={health?.modules.physics?.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {health?.modules.physics?.status || 'offline'}
                </Badge>
              </div>
            </div>

            {/* Lighting Module */}
            <div className="module-card glass-morphism rounded-xl p-6 text-center border border-forge-purple/20 hover:border-forge-gold/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-forge-gold to-orange-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-forge-gold">Lighting</h4>
              <p className="text-sm text-gray-300">Dynamic lighting effects</p>
              <div className="mt-4">
                <Badge 
                  variant={health?.modules.lighting?.status === 'online' ? 'default' : 'secondary'}
                  className={health?.modules.lighting?.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {health?.modules.lighting?.status || 'offline'}
                </Badge>
              </div>
            </div>

            {/* Morphing Module */}
            <div className="module-card glass-morphism rounded-xl p-6 text-center border border-forge-purple/20 hover:border-purple-400/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-forge-purple rounded-lg flex items-center justify-center">
                <Shapes className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-purple-400">Morphing</h4>
              <p className="text-sm text-gray-300">Shape transformation</p>
              <div className="mt-4">
                <Badge 
                  variant={health?.modules.morphing?.status === 'online' ? 'default' : 'secondary'}
                  className={health?.modules.morphing?.status === 'online' ? 'bg-green-500' : 'bg-orange-500'}
                >
                  {health?.modules.morphing?.status || 'offline'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-forge-cyan">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 custom-scrollbar max-h-64 overflow-y-auto">
            <div className="flex items-center space-x-4 p-4 bg-forge-dark/50 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Particle explosion effect generated</p>
                <p className="text-sm text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-forge-dark/50 rounded-lg">
              <div className="w-10 h-10 bg-forge-cyan rounded-full flex items-center justify-center">
                <Cog className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Physics module optimized</p>
                <p className="text-sm text-gray-400">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-forge-dark/50 rounded-lg">
              <div className="w-10 h-10 bg-forge-plasma rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">5 new descriptions processed</p>
                <p className="text-sm text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
