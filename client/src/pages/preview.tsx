import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Code,
  Video,
  Layers,
  Settings,
  Activity
} from "lucide-react";

interface PreviewMetrics {
  fps: number;
  gpuUsage: number;
  memoryUsage: number;
  renderTime: number;
  particleCount: number;
}

export default function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [effectParams, setEffectParams] = useState({
    particleCount: 150,
    explosionForce: 7,
    gravity: 0.1,
    colorScheme: "fire"
  });
  
  // Simulate performance metrics
  const [metrics, setMetrics] = useState<PreviewMetrics>({
    fps: 60,
    gpuUsage: 34,
    memoryUsage: 127,
    renderTime: 8.2,
    particleCount: 147
  });

  // Mock effect animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }> = [];

    const colors = {
      fire: ['#ff6b35', '#f7941e', '#fff200', '#ff9500'],
      electric: ['#00d4ff', '#0088ff', '#ffffff', '#88ddff'],
      plasma: ['#ff006e', '#8338ec', '#3a86ff', '#fb8500']
    };

    const createParticles = () => {
      particles = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < effectParams.particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * effectParams.explosionForce;
        
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[effectParams.colorScheme as keyof typeof colors][
            Math.floor(Math.random() * colors[effectParams.colorScheme as keyof typeof colors].length)
          ]
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = 'lighter';
      
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += effectParams.gravity;
        particle.life -= 0.01;
        
        if (particle.life <= 0) {
          particles.splice(index, 1);
          return;
        }
        
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      ctx.globalCompositeOperation = 'source-over';
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        particleCount: particles.length,
        fps: Math.floor(58 + Math.random() * 4),
        gpuUsage: Math.floor(30 + Math.random() * 20),
        renderTime: 6 + Math.random() * 4
      }));
      
      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    createParticles();
    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, effectParams]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleParamChange = (param: string, value: any) => {
    setEffectParams(prev => ({ ...prev, [param]: value }));
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const colorSchemeOptions = [
    { value: "fire", label: "Fire (Orange/Red)", colors: ["#ff6b35", "#f7941e"] },
    { value: "electric", label: "Electric (Blue/Cyan)", colors: ["#00d4ff", "#0088ff"] },
    { value: "plasma", label: "Plasma (Pink/Purple)", colors: ["#ff006e", "#8338ec"] }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-400 glow-text">
          LIVE PREVIEW
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Real-time visualization of your generated effects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Canvas */}
        <div className="lg:col-span-2">
          <Card className="glass-morphism border-forge-purple/30 bg-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  Effect Preview
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    onClick={handlePlay}
                    size="sm"
                    className={isPlaying ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    size="sm"
                    variant="outline"
                    className="border-forge-plasma text-forge-plasma hover:bg-forge-plasma/10"
                    data-testid="button-reset"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 bg-forge-black rounded-lg border-2 border-forge-purple"
                  style={{ minHeight: '384px' }}
                  data-testid="canvas-preview"
                />
                
                {/* Live indicator */}
                {isPlaying && (
                  <div className="absolute top-4 right-4 bg-forge-cyan/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-forge-cyan rounded-full animate-pulse" />
                      <span className="text-forge-cyan text-sm font-medium">LIVE</span>
                    </div>
                  </div>
                )}
                
                {/* Performance overlay */}
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
                  <p className="text-white">FPS: <span className="text-forge-cyan" data-testid="text-fps">{metrics.fps}</span></p>
                  <p className="text-white">Particles: <span className="text-forge-gold" data-testid="text-particle-count">{metrics.particleCount}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Effect Parameters */}
          <Card className="glass-morphism border-forge-purple/30 bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-forge-gold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-forge-cyan">
                  Particle Count: {effectParams.particleCount}
                </label>
                <Slider
                  value={[effectParams.particleCount]}
                  onValueChange={([value]) => handleParamChange('particleCount', value)}
                  min={50}
                  max={500}
                  step={10}
                  className="w-full"
                  data-testid="slider-particle-count"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>50</span>
                  <span>500</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-forge-plasma">
                  Explosion Force: {effectParams.explosionForce}
                </label>
                <Slider
                  value={[effectParams.explosionForce]}
                  onValueChange={([value]) => handleParamChange('explosionForce', value)}
                  min={1}
                  max={10}
                  step={0.5}
                  className="w-full"
                  data-testid="slider-explosion-force"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Weak</span>
                  <span>Strong</span>
                  <span>Max</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-forge-gold">
                  Gravity: {effectParams.gravity}
                </label>
                <Slider
                  value={[effectParams.gravity]}
                  onValueChange={([value]) => handleParamChange('gravity', value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                  data-testid="slider-gravity"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>None</span>
                  <span>Earth</span>
                  <span>Heavy</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-400">Color Scheme</label>
                <Select 
                  value={effectParams.colorScheme} 
                  onValueChange={(value) => handleParamChange('colorScheme', value)}
                >
                  <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-forge-dark border-forge-purple">
                    {colorSchemeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {option.colors.map((color, i) => (
                              <div 
                                key={i}
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => {
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
                }}
                className="w-full bg-gradient-to-r from-forge-gold to-forge-plasma text-white font-medium hover:shadow-lg transition-all"
                data-testid="button-apply-changes"
              >
                Apply Changes
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="glass-morphism border-forge-purple/30 bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-forge-cyan flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Frame Rate</span>
                <Badge className="bg-green-500 text-white">{metrics.fps} FPS</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">GPU Usage</span>
                <Badge className="bg-forge-cyan text-white">{metrics.gpuUsage}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Memory</span>
                <Badge className="bg-forge-gold text-black">{metrics.memoryUsage}MB</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Render Time</span>
                <Badge className="bg-forge-plasma text-white">{metrics.renderTime.toFixed(1)}ms</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="glass-morphism border-forge-purple/30 bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-forge-plasma flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-forge-electric text-white hover:bg-forge-cyan transition-colors"
                data-testid="button-export-js"
              >
                <Code className="w-4 h-4 mr-2" />
                Export as JS
              </Button>
              <Button 
                variant="outline"
                className="w-full border-forge-purple text-forge-purple hover:bg-forge-purple/10 transition-colors"
                data-testid="button-export-ae"
              >
                <Layers className="w-4 h-4 mr-2" />
                Export to AE
              </Button>
              <Button 
                variant="outline"
                className="w-full border-forge-plasma text-forge-plasma hover:bg-forge-plasma/10 transition-colors"
                data-testid="button-record-video"
              >
                <Video className="w-4 h-4 mr-2" />
                Record Video
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
