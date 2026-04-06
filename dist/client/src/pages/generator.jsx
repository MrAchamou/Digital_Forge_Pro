var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
import { Brain, Download, Zap, Settings, Sparkles, Target, Activity, TrendingUp, Shield, Layers, Clock, BarChart3 } from "lucide-react";
import { useEffectGenerator } from "@/hooks/use-effect-generator";
var platformOptions = [
    { value: "javascript", label: "Web (JavaScript)" },
    { value: "react", label: "React Component" },
    { value: "aftereffects", label: "After Effects" },
    { value: "premiere", label: "Premiere Pro" },
];
var performanceOptions = [
    { value: "high", label: "60 FPS (High)" },
    { value: "medium", label: "30 FPS (Medium)" },
    { value: "low", label: "Quality Priority" },
];
var complexityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];
var performanceTargetOptions = [
    { value: "balanced", label: "Balanced" },
    { value: "speed", label: "Speed Priority" },
    { value: "quality", label: "Quality Priority" },
];
export default function Generator() {
    var _this = this;
    var toast = useToast().toast;
    var _a = useState(""), description = _a[0], setDescription = _a[1];
    var _b = useState("javascript"), platform = _b[0], setPlatform = _b[1];
    var _c = useState(false), isAnalyzing = _c[0], setIsAnalyzing = _c[1];
    var _d = useState(null), analysis = _d[0], setAnalysis = _d[1];
    var _e = useState(false), advancedMode = _e[0], setAdvancedMode = _e[1];
    var _f = useState([0.8]), aiIntensity = _f[0], setAiIntensity = _f[1];
    var _g = useState("balanced"), performanceTarget = _g[0], setPerformanceTarget = _g[1];
    var _h = useState([7]), complexityBudget = _h[0], setComplexityBudget = _h[1];
    var _j = useState(true), autoOptimize = _j[0], setAutoOptimize = _j[1];
    var _k = useState(false), realTimeAnalysis = _k[0], setRealTimeAnalysis = _k[1];
    var _l = useState(0), generationProgress = _l[0], setGenerationProgress = _l[1];
    var _m = useState(""), currentPhase = _m[0], setCurrentPhase = _m[1];
    var _o = useState([]), aiThinking = _o[0], setAiThinking = _o[1];
    var _p = useEffectGenerator(), generateEffect = _p.generateEffect, isGenerating = _p.isGenerating, currentJob = _p.currentJob;
    // Real-time AI analysis
    var _q = useQuery({
        queryKey: ["/api/ai/analyze", { description: description }],
        enabled: description.length > 10 && realTimeAnalysis,
        refetchOnWindowFocus: false,
        staleTime: 5000,
    }), analysisData = _q.data, isAnalyzingData = _q.isLoading;
    useEffect(function () {
        if (analysisData) {
            setAnalysis(analysisData);
            setIsAnalyzing(false);
        }
    }, [analysisData]);
    var handleGenerate = function () { return __awaiter(_this, void 0, void 0, function () {
        var generationConfig, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!description.trim()) {
                        toast({
                            title: "Description Required",
                            description: "Please enter an effect description",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    generationConfig = {
                        performance: performanceTarget, // Use the new performance target state
                        complexityBudget: complexityBudget[0],
                        autoOptimize: autoOptimize,
                        aiIntensity: aiIntensity[0],
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, generateEffect(description, platform, generationConfig)];
                case 2:
                    _a.sent();
                    toast({
                        title: "Generation Started",
                        description: "Your effect is being generated...",
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    toast({
                        title: "Generation Failed",
                        description: "Failed to start effect generation",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyCode = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!((_a = currentJob === null || currentJob === void 0 ? void 0 : currentJob.result) === null || _a === void 0 ? void 0 : _a.code)) return [3 /*break*/, 2];
                    return [4 /*yield*/, navigator.clipboard.writeText(currentJob.result.code)];
                case 1:
                    _b.sent();
                    toast({
                        title: "Code Copied",
                        description: "Code copied to clipboard",
                    });
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleDownload = function () {
        var _a;
        if ((_a = currentJob === null || currentJob === void 0 ? void 0 : currentJob.result) === null || _a === void 0 ? void 0 : _a.code) {
            var blob = new Blob([currentJob.result.code], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = "effect.".concat(platform === 'javascript' ? 'js' : platform);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };
    var handleAnalyze = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (description.length < 10) {
                        setAnalysis(null);
                        return [2 /*return*/];
                    }
                    setIsAnalyzing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/ai/analyze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ description: description }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error("Failed to analyze");
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    setAnalysis(data);
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error("Analysis error:", error_2);
                    toast({ title: "Analysis Failed", description: "Could not analyze the description.", variant: "destructive" });
                    setAnalysis(null);
                    return [3 /*break*/, 6];
                case 5:
                    setIsAnalyzing(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [description, toast]);
    useEffect(function () {
        if (realTimeAnalysis) {
            handleAnalyze();
        }
    }, [description, realTimeAnalysis, handleAnalyze]);
    return (<div className="space-y-12">
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
              <Wand2 className="w-6 h-6"/>
              Effect Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea placeholder="Describe your visual effect here...&#10;&#10;Example: 'Create a particle explosion with bright orange and red colors, particles should scatter in all directions with gravity effect, lasting 3 seconds'" value={description} onChange={function (e) { return setDescription(e.target.value); }} className="min-h-48 bg-forge-dark border-forge-purple text-white placeholder:text-gray-400 focus:border-forge-cyan resize-none" data-testid="textarea-effect-description"/>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-forge-cyan">Target Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="bg-forge-dark border-forge-purple text-white focus:border-forge-cyan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-forge-dark border-forge-purple">
                    {platformOptions.map(function (option) { return (<SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                        {option.label}
                      </SelectItem>); })}
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
                    {performanceTargetOptions.map(function (option) { return (<SelectItem key={option.value} value={option.value} className="text-white focus:bg-forge-purple">
                        {option.label}
                      </SelectItem>); })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !description.trim()} className="w-full bg-gradient-to-r from-forge-gold to-forge-plasma text-white font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed" data-testid="button-generate-effect">
              {isGenerating ? (<>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                  Generating...
                </>) : (<>
                  <Sparkles className="w-4 h-4 mr-2"/>
                  Generate Effect
                </>)}
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Configuration Panel */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-forge-plasma flex items-center gap-2">
              <Settings className="w-6 h-6"/>
              Advanced Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="advanced-mode">Enable Advanced Mode</Label>
              <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode}/>
            </div>

            {advancedMode && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-intensity">AI Processing Intensity ({Math.round(aiIntensity[0] * 100)}%)</Label>
                  <Slider id="ai-intensity" min={0.1} max={1.0} step={0.1} value={aiIntensity} onValueChange={setAiIntensity}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexity-budget">Complexity Budget ({complexityBudget[0]}/10)</Label>
                  <Slider id="complexity-budget" min={1} max={10} step={1} value={complexityBudget} onValueChange={setComplexityBudget}/>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-optimize">Auto-Optimize Resources</Label>
                  <Switch id="auto-optimize" checked={autoOptimize} onCheckedChange={setAutoOptimize}/>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="real-time-analysis">Real-time AI Analysis</Label>
                  <Switch id="real-time-analysis" checked={realTimeAnalysis} onCheckedChange={setRealTimeAnalysis}/>
                </div>
              </motion.div>)}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Analysis and Progress */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-morphism border-forge-purple/30 bg-transparent">
          <TabsTrigger value="analysis" className="text-forge-cyan data-[state=active]:bg-forge-cyan/20 data-[state=active]:text-forge-cyan">
            <Brain className="w-5 h-5 mr-2"/> AI Analysis
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-forge-plasma data-[state=active]:bg-forge-plasma/20 data-[state=active]:text-forge-plasma">
            <Activity className="w-5 h-5 mr-2"/> Generation Progress
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis">
          <Card className="glass-morphism border-forge-purple/30 bg-transparent mt-4">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-forge-plasma flex items-center gap-2">
                <Brain className="w-6 h-6"/>
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAnalyzingData || (isAnalyzing && !analysis) ? (<div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-forge-cyan"/>
                  <span className="ml-2 text-gray-400">Analyzing description...</span>
                </div>) : analysis ? (<>
                  <div className="bg-forge-dark/50 rounded-lg p-4">
                    <h4 className="font-medium text-forge-cyan mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4"/> Detected Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.concepts.map(function (concept, index) { return (<Badge key={index} variant="secondary" className="bg-forge-cyan/20 text-forge-cyan border-forge-cyan/30" data-testid={"badge-concept-".concat(concept)}>
                          {concept}
                        </Badge>); })}
                    </div>
                  </div>

                  <div className="bg-forge-dark/50 rounded-lg p-4">
                    <h4 className="font-medium text-forge-gold mb-2 flex items-center gap-1">
                      <Layers className="w-4 h-4"/> Recommended Modules
                    </h4>
                    <div className="space-y-2">
                      {analysis.modules.map(function (moduleName, index) { return (<div key={index} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{moduleName}</span>
                          <span className="text-green-400">
                            {Math.round(analysis.confidence * 100)}% Match
                          </span>
                        </div>); })}
                    </div>
                  </div>

                  <div className="bg-forge-dark/50 rounded-lg p-4">
                    <h4 className="font-medium text-forge-plasma mb-2 flex items-center gap-1">
                      <BarChart3 className="w-4 h-4"/> Estimated Parameters
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
                </>) : (<div className="text-center py-8 text-gray-400">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                  <p>Enter a description and enable analysis to see AI insights.</p>
                </div>)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generation Progress Tab */}
        <TabsContent value="progress">
          <Card className="glass-morphism border-forge-purple/30 bg-transparent mt-4">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
                <Activity className="w-6 h-6"/> Generation Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating && currentJob ? (<div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Status: <span className="font-medium text-white">{currentJob.status}</span></span>
                    <span className="text-forge-cyan font-medium">{currentJob.progress}%</span>
                  </div>
                  <Progress value={currentJob.progress} className="h-2 bg-forge-purple"/>
                  {currentJob.estimatedTime && (<p className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4"/> Estimated time remaining: {Math.max(0, Math.round(currentJob.estimatedTime * (1 - currentJob.progress / 100) / 60))} minutes
                    </p>)}
                  {currentPhase && (<p className="text-sm text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4"/> Current Phase: <span className="text-white">{currentPhase}</span>
                    </p>)}
                  {aiThinking.length > 0 && (<div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400">AI Thinking:</p>
                      <div className="flex space-x-2">
                        {aiThinking.map(function (thought, index) { return (<Badge key={index} variant="outline" className="border-forge-electric/50 text-forge-electric/80">{thought}</Badge>); })}
                      </div>
                    </div>)}
                </div>) : (<div className="text-center py-8 text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                  <p>Generate an effect to see progress details.</p>
                </div>)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Code */}
      {(currentJob === null || currentJob === void 0 ? void 0 : currentJob.status) === 'completed' && currentJob.result && (<Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-forge-cyan flex items-center gap-2">
                <Code className="w-6 h-6"/>
                Generated Code
              </CardTitle>
              <div className="flex space-x-2">
                <Button onClick={handleCopyCode} variant="outline" size="sm" className="border-forge-electric text-forge-electric hover:bg-forge-electric/10" data-testid="button-copy-code">
                  <Copy className="w-4 h-4 mr-1"/>
                  Copy
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm" className="border-forge-plasma text-forge-plasma hover:bg-forge-plasma/10" data-testid="button-download-code">
                  <Download className="w-4 h-4 mr-1"/>
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CodePreview code={currentJob.result.code} language={platform === 'javascript' ? 'javascript' : 'text'}/>
          </CardContent>
        </Card>)}

      {(currentJob === null || currentJob === void 0 ? void 0 : currentJob.status) === 'failed' && (<Card className="glass-morphism border-red-500/30 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-400 flex items-center gap-2">
              <Shield className="w-6 h-6"/> Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300 mb-4">{currentJob.error || "An unknown error occurred"}</p>
            <Button onClick={handleGenerate} className="bg-red-500 hover:bg-red-600 text-white" data-testid="button-retry-generation">
              Retry Generation
            </Button>
          </CardContent>
        </Card>)}
    </div>);
}
