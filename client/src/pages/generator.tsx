import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CodePreview from "@/components/ui/code-preview";
import { useEffectGenerator } from "@/hooks/use-effect-generator";
import { useToast } from "@/hooks/use-toast";
import { 
  Wand2, 
  Brain, 
  Sparkles, 
  Code, 
  Download,
  Copy,
  Loader2
} from "lucide-react";
import type { EffectAnalysis } from "@shared/schema";

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

export default function Generator() {
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("javascript");
  const [performance, setPerformance] = useState("high");
  const { toast } = useToast();
  
  const { generateEffect, isGenerating, currentJob } = useEffectGenerator();

  // Real-time AI analysis
  const { data: analysis, isLoading: isAnalyzing } = useQuery<EffectAnalysis>({
    queryKey: ["/api/ai/analyze", { description }],
    enabled: description.length > 10,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter an effect description",
        variant: "destructive"
      });
      return;
    }

    try {
      await generateEffect(description, platform, { performance });
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

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-forge-gold glow-text">
          EFFECT GENERATOR
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Transform descriptions into professional-grade visual effects code
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
                <Select value={performance} onValueChange={setPerformance}>
                  <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-plasma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-forge-dark border-forge-purple">
                    {performanceOptions.map((option) => (
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

        {/* AI Analysis Panel */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-plasma flex items-center gap-2">
              <Brain className="w-6 h-6" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-forge-cyan" />
                <span className="ml-2 text-gray-400">Analyzing description...</span>
              </div>
            )}

            {analysis && (
              <>
                <div className="bg-forge-dark/50 rounded-lg p-4">
                  <h4 className="font-medium text-forge-cyan mb-2">Detected Concepts</h4>
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
                  <h4 className="font-medium text-forge-gold mb-2">Recommended Modules</h4>
                  <div className="space-y-2">
                    {analysis.modules.map((moduleName, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{moduleName}</span>
                        <span className="text-green-400 text-sm">
                          {Math.round(analysis.confidence * 100)}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-forge-dark/50 rounded-lg p-4">
                  <h4 className="font-medium text-forge-plasma mb-2">Estimated Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Complexity:</span>
                      <span className="text-forge-gold">{analysis.complexity}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Duration:</span>
                      <span className="text-forge-cyan">{Math.round(analysis.estimatedDuration / 60)}min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="text-green-400">{Math.round(analysis.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!description && (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Enter a description to see AI analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generation Progress */}
      {isGenerating && currentJob && (
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-cyan">Generation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Status: {currentJob.status}</span>
                <span>{currentJob.progress}%</span>
              </div>
              <Progress value={currentJob.progress} className="h-2" />
              {currentJob.estimatedTime && (
                <p className="text-sm text-gray-400">
                  Estimated time remaining: {Math.max(0, Math.round(currentJob.estimatedTime * (1 - currentJob.progress / 100) / 60))} minutes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
            <CardTitle className="text-xl font-semibold text-red-400">Generation Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300">{currentJob.error || "An unknown error occurred"}</p>
            <Button 
              onClick={handleGenerate}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white"
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
