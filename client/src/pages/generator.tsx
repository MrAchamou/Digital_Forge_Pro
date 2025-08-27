import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/ui/code-preview";
import AIAdvancedOrb from "@/components/ui/ai-orb";
import { 
  Brain, 
  Download, 
  Eye, 
  Zap, 
  Settings, 
  Sparkles, 
  Target,
  Cpu,
  Activity,
  TrendingUp,
  Shield,
  Layers,
  Clock,
  BarChart3
} from "lucide-react";
import type { EffectAnalysis } from "@shared/schema";
import { useEffectGenerator } from "@/hooks/use-effect-generator";


const platformOptions = [
  { value: "javascript", label: "Web (JavaScript)" },
  { value: "react", label: "React Component" },
  { value: "aftereffects", label: "After Effects" },
  { value: "premiere", label: "Premiere Pro" },
];

const performanceOptions = [
  { value: "high", label: "60 FPS (High)" },
  { value: "medium", label: "30 FPS (Medium)" },
  { value: "low", label: "Quality Priority" },
];

const complexityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const performanceTargetOptions = [
  { value: "balanced", label: "Balanced" },
  { value: "speed", label: "Speed Priority" },
  { value: "quality", label: "Quality Priority" },
];


export default function Generator() {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [aiIntensity, setAiIntensity] = useState([0.8]);
  const [performanceTarget, setPerformanceTarget] = useState("balanced");
  const [complexityBudget, setComplexityBudget] = useState([7]);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");
  const [aiThinking, setAiThinking] = useState([]);

  const { generateEffect, isGenerating, currentJob } = useEffectGenerator();

  // Real-time AI analysis
  const { data: analysisData, isLoading: isAnalyzingData } = useQuery<EffectAnalysis>({
    queryKey: ["/api/ai/analyze", { description }],
    enabled: description.length > 10 && realTimeAnalysis,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  useEffect(() => {
    if (analysisData) {
      setAnalysis(analysisData);
      setIsAnalyzing(false);
    }
  }, [analysisData]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter an effect description",
        variant: "destructive"
      });
      return;
    }

    const generationConfig = {
      performance: performanceTarget, // Use the new performance target state
      complexityBudget: complexityBudget[0],
      autoOptimize,
      aiIntensity: aiIntensity[0],
    };

    try {
      await generateEffect(description, platform, generationConfig);
      toast({
        title: "Generation Started",
        description: "Your effect is being generated...",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to start effect generation",
        variant: "destructive"
      });
    }
  };

  const handleCopyCode = async () => {
    if (currentJob?.result?.code) {
      await navigator.clipboard.writeText(currentJob.result.code);
      toast({
        title: "Code Copied",
        description: "Code copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (currentJob?.result?.code) {
      const blob = new Blob([currentJob.result.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `effect.${platform === 'javascript' ? 'js' : platform}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (description.length < 10) {
      setAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!response.ok) throw new Error("Failed to analyze");
      const data: EffectAnalysis = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ title: "Analysis Failed", description: "Could not analyze the description.", variant: "destructive"});
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [description, toast]);

  useEffect(() => {
    if (realTimeAnalysis) {
      handleAnalyze();
    }
  }, [description, realTimeAnalysis, handleAnalyze]);


  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-forge-gold glow-text">
          EFFECT GENERATOR 2.0
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Transform descriptions into professional-grade visual effects code with enhanced AI capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
              <Wand2 className="w-6 h-6" />
              Effect Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea 
              placeholder="Describe your visual effect here...&#10;&#10;Example: 'Create a particle explosion with bright orange and red colors, particles should scatter in all directions with gravity effect, lasting 3 seconds'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-48 bg-forge-dark border-forge-purple text-white placeholder:text-gray-400 focus:border-forge-cyan resize-none"
              data-testid="textarea-effect-description"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-forge-cyan">Target Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-cyan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-forge-dark border-forge-purple">
                    {platformOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-forge-plasma">Performance Target</label>
                <Select value={performanceTarget} onValueChange={setPerformanceTarget}>
                  <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-plasma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-forge-dark border-forge-purple">
                    {performanceTargetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="w-full bg-gradient-to-r from-forge-gold to-forge-plasma text-white font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-generate-effect"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Effect
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Configuration Panel */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-plasma flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Advanced Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="advanced-mode">Enable Advanced Mode</Label>
              <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode} />
            </div>

            {advancedMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-intensity">AI Processing Intensity ({Math.round(aiIntensity[0] * 100)}%)</Label>
                  <Slider 
                    id="ai-intensity" 
                    min={0.1} 
                    max={1.0} 
                    step={0.1} 
                    value={aiIntensity} 
                    onValueChange={setAiIntensity} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexity-budget">Complexity Budget ({complexityBudget[0]}/10)</Label>
                  <Slider 
                    id="complexity-budget" 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={complexityBudget} 
                    onValueChange={setComplexityBudget} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-optimize">Auto-Optimize Resources</Label>
                  <Switch id="auto-optimize" checked={autoOptimize} onCheckedChange={setAutoOptimize} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="real-time-analysis">Real-time AI Analysis</Label>
                  <Switch id="real-time-analysis" checked={realTimeAnalysis} onCheckedChange={setRealTimeAnalysis} />
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Analysis and Progress */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-morphism border-forge-purple/30 bg-transparent">
          <TabsTrigger value="analysis" className="text-forge-cyan data-[state=active]:bg-forge-cyan/20 data-[state=active]:text-forge-cyan">
            <Brain className="w-5 h-5 mr-2" /> AI Analysis
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-forge-plasma data-[state=active]:bg-forge-plasma/20 data-[state=active]:text-forge-plasma">
            <Activity className="w-5 h-5 mr-2" /> Generation Progress
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis">
          <Card className="glass-morphism border-forge-purple/30 bg-transparent mt-4">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-forge-plasma flex items-center gap-2">
                <Brain className="w-6 h-6" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAnalyzingData || (isAnalyzing && !analysis) ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-forge-cyan" />
                  <span className="ml-2 text-gray-400">Analyzing description...</span>
                </div>
              ) : analysis ? (
                <>
                  <div className="bg-forge-dark/50 rounded-lg p-4">
                    <h4 className="font-medium text-forge-cyan mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" /> Detected Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.concepts.map((concept, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-forge-cyan/20 text-forge-cyan border-forge-cyan/30"
                          data-testid={`badge-concept-${concept}`}
                        >
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-forge-dark/50 rounded-lg p-4">
                    <h4 className="font-medium text-forge-gold mb-2 flex items-center gap-1">
                      <Layers className="w-4 h-4" /> Recommended Modules
                    </h4>
                    <div className="space-y-2">
                      {analysis.modules.map((moduleName, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{moduleName}</span>
                          <span className="text-green-400">
                            {Math.round(analysis.confidence * 100)}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-forge-dark/50 rounded-lg p-4">
                    <h4 className="font-medium text-forge-plasma mb-2 flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" /> Estimated Parameters
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Complexity:</span>
                        <span className="text-forge-gold">{analysis.complexity}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Duration:</span>
                        <span className="text-forge-cyan">{Math.round(analysis.estimatedDuration / 60)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Robustness Score:</span>
                        <span className="text-blue-400">{analysis.robustness}/10</span>
                      </div>
                       <div className="flex justify-between">
                        <span>AI Power Index:</span>
                        <span className="text-purple-400">{analysis.aiPower}/10</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Enter a description and enable analysis to see AI insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generation Progress Tab */}
        <TabsContent value="progress">
          <Card className="glass-morphism border-forge-purple/30 bg-transparent mt-4">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
                <Activity className="w-6 h-6" /> Generation Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating && currentJob ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Status: <span className="font-medium text-white">{currentJob.status}</span></span>
                    <span className="text-forge-cyan font-medium">{currentJob.progress}%</span>
                  </div>
                  <Progress value={currentJob.progress} className="h-2 bg-forge-purple" />
                  {currentJob.estimatedTime && (
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Estimated time remaining: {Math.max(0, Math.round(currentJob.estimatedTime * (1 - currentJob.progress / 100) / 60))} minutes
                    </p>
                  )}
                  {currentPhase && (
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Current Phase: <span className="text-white">{currentPhase}</span>
                    </p>
                  )}
                  {aiThinking.length > 0 && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400">AI Thinking:</p>
                      <div className="flex space-x-2">
                        {aiThinking.map((thought, index) => (
                          <Badge key={index} variant="outline" className="border-forge-electric/50 text-forge-electric/80">{thought}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Generate an effect to see progress details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Code */}
      {currentJob?.status === 'completed' && currentJob.result && (
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
                <Code className="w-6 h-6" />
                Generated Code
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCopyCode}
                  variant="outline"
                  size="sm"
                  className="border-forge-electric text-forge-electric hover:bg-forge-electric/10"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="border-forge-plasma text-forge-plasma hover:bg-forge-plasma/10"
                  data-testid="button-download-code"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CodePreview 
              code={currentJob.result.code} 
              language={platform === 'javascript' ? 'javascript' : 'text'}
            />
          </CardContent>
        </Card>
      )}

      {currentJob?.status === 'failed' && (
        <Card className="glass-morphism border-red-500/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-400 flex items-center gap-2">
              <Shield className="w-6 h-6" /> Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300 mb-4">{currentJob.error || "An unknown error occurred"}</p>
            <Button 
              onClick={handleGenerate}
              className="bg-red-500 hover:bg-red-600 text-white"
              data-testid="button-retry-generation"
            >
              Retry Generation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}