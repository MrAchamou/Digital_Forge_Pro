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
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Bot, Database, FileSearch, Shield, Award, Settings, RefreshCw, Download, Upload, Zap, Gauge, Wrench } from "lucide-react";
// Import du hook de système (assurez-vous que le chemin est correct)
// import { useSystemStatus } from '../hooks/use-system-status'; // Ceci est un exemple, ajustez si nécessaire
// Mock du hook useSystemStatus s'il n'est pas disponible dans cet environnement
var useSystemStatus = function () {
    // Simuler un état de système pour que le code soit exécutable
    return {
        status: {
            modules: [
                { id: 'classification-storage', name: 'Classification & Storage', status: 'online', errors: 0, uptime: '99.9%' },
                { id: 'error-detection', name: 'Error Detection', status: 'active', errors: 1, uptime: '99.5%' },
                { id: 'quality-assurance', name: 'Quality Assurance', status: 'active', errors: 0, uptime: '99.8%' },
                { id: 'parser', name: 'Parser', status: 'online', errors: 0, uptime: '99.9%' },
            ],
            cpuUsage: 65,
            memoryUsage: 45,
            networkTraffic: 100,
            autoCorrections: 127,
            detectedErrors: 3,
        },
        loading: false,
        error: null,
        forceOptimization: function () { return console.log("Forcing optimization..."); },
        triggerAutoRepair: function () { return console.log("Triggering auto-repair..."); }
    };
};
export default function ModulesPage() {
    var _this = this;
    var _a, _b, _c, _d;
    var toast = useToast().toast;
    var _e = useState(""), selectedType = _e[0], setSelectedType = _e[1];
    var _f = useState(""), selectedCategory = _f[0], setSelectedCategory = _f[1];
    var _g = useState("10"), effectCount = _g[0], setEffectCount = _g[1];
    var _h = useState(false), isGenerating = _h[0], setIsGenerating = _h[1];
    // Utilisation du hook pour obtenir le statut du système et les nouvelles fonctionnalités
    var _j = useSystemStatus(), systemStatus = _j.status, loading = _j.loading, error = _j.error, forceOptimization = _j.forceOptimization, triggerAutoRepair = _j.triggerAutoRepair;
    // Query pour obtenir le statut des modules
    var moduleStatus = useQuery({
        queryKey: ["/api/modules/status"],
        refetchInterval: 5000,
    }).data;
    // Mutations pour contrôler les modules
    var generateBatchMutation = useMutation({
        mutationFn: function (params) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/modules/batch-generator/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(params),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            var _a;
            toast({
                title: "Génération terminée",
                description: "".concat(((_a = data.generated) === null || _a === void 0 ? void 0 : _a.length) || 0, " effets cr\u00E9\u00E9s avec succ\u00E8s"),
            });
            setIsGenerating(false);
        },
        onError: function () {
            toast({
                title: "Erreur",
                description: "Échec de la génération des effets",
                variant: "destructive",
            });
            setIsGenerating(false);
        }
    });
    var reorganizeLibraryMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/modules/classification-storage/reorganize", {
                            method: "POST",
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Réorganisation terminée",
                description: "".concat(data.moved, " effets d\u00E9plac\u00E9s"),
            });
        },
    });
    var runQualityCheckMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/modules/quality-assurance/batch-check", {
                            method: "POST",
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            var _a, _b;
            toast({
                title: "Contrôle qualité terminé",
                description: "".concat(((_a = data.stats) === null || _a === void 0 ? void 0 : _a.approved) || 0, "/").concat(((_b = data.stats) === null || _b === void 0 ? void 0 : _b.total) || 0, " effets approuv\u00E9s"),
            });
        },
    });
    var handleGenerateEffects = function () {
        if (!selectedType || !selectedCategory) {
            toast({
                title: "Paramètres manquants",
                description: "Veuillez sélectionner un type et une catégorie",
                variant: "destructive",
            });
            return;
        }
        setIsGenerating(true);
        generateBatchMutation.mutate({
            effectType: selectedType,
            category: selectedCategory,
            count: parseInt(effectCount),
        });
    };
    // Trouver les statuts spécifiques des modules à partir de systemStatus
    var classificationStatus = (_a = systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.modules) === null || _a === void 0 ? void 0 : _a.find(function (m) { return m.id === 'classification-storage'; });
    var errorDetectionStatus = (_b = systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.modules) === null || _b === void 0 ? void 0 : _b.find(function (m) { return m.id === 'error-detection'; });
    var qualityAssuranceStatus = (_c = systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.modules) === null || _c === void 0 ? void 0 : _c.find(function (m) { return m.id === 'quality-assurance'; });
    var parserStatus = (_d = systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.modules) === null || _d === void 0 ? void 0 : _d.find(function (m) { return m.id === 'parser'; });
    return (<div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-forge-cyan via-forge-plasma to-forge-electric bg-clip-text text-transparent">
          Module Control Center
        </h1>
        <p className="text-gray-300 text-lg">
          Contrôlez et configurez vos modules IA autonomes
        </p>
      </div>

      {/* System Status Overview */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-forge-electric flex items-center gap-3">
            <Gauge className="w-8 h-8"/>
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">CPU Usage</p>
              <p className="text-2xl font-bold text-forge-electric">{(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.cpuUsage) || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Memory Usage</p>
              <p className="text-2xl font-bold text-forge-electric">{(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.memoryUsage) || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Network Traffic</p>
              <p className="text-2xl font-bold text-forge-electric">{(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.networkTraffic) || 0} Mbps</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={forceOptimization} className="bg-gradient-to-r from-forge-electric to-forge-cyan hover:opacity-80">
              <Wrench className="w-4 h-4 mr-2"/>
              Force Optimization
            </Button>
            <Button onClick={triggerAutoRepair} className="bg-gradient-to-r from-forge-purple to-forge-plasma hover:opacity-80">
              <Shield className="w-4 h-4 mr-2"/>
              Trigger Auto-Repair
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Library Initialization */}
      <div className="mb-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-forge-plasma">Bibliothèque d'Effets</h3>
        <p className="text-gray-300 mb-4">
          Initialiser la structure de la bibliothèque avec des effets d'exemple.
        </p>
        <button onClick={function () { return __awaiter(_this, void 0, void 0, function () {
            var response, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/library/initialize', {
                                method: 'POST'
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (result.success) {
                            alert('✅ Bibliothèque initialisée ! Vérifiez le dossier "effects-library" dans l\'arborescence.');
                        }
                        else {
                            alert('❌ Erreur: ' + result.error);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        alert('❌ Erreur de connexion');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }} className="px-4 py-2 bg-forge-plasma text-black font-bold rounded hover:bg-forge-plasma/80 transition-colors">
          Initialiser la Bibliothèque
        </button>
      </div>

      {/* Batch Generator Module */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-forge-cyan flex items-center gap-3">
            <Bot className="w-8 h-8"/>
            Batch Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="effect-type" className="text-forge-gold">Type d'effet</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="glass-morphism border-forge-purple/30">
                  <SelectValue placeholder="Choisir un type"/>
                </SelectTrigger>
                <SelectContent className="glass-morphism border-forge-purple/30 bg-forge-dark">
                  <SelectItem value="VIDEO">VIDÉO</SelectItem>
                  <SelectItem value="IMAGE">IMAGE</SelectItem>
                  <SelectItem value="ENVIRONMENT">ENVIRONNEMENT</SelectItem>
                  <SelectItem value="AUDIO">AUDIO</SelectItem>
                  <SelectItem value="UI">INTERFACE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="effect-category" className="text-forge-plasma">Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="glass-morphism border-forge-purple/30">
                  <SelectValue placeholder="Choisir une catégorie"/>
                </SelectTrigger>
                <SelectContent className="glass-morphism border-forge-purple/30 bg-forge-dark">
                  <SelectItem value="MANIPULATION_TEMPORELLE">MANIPULATION TEMPORELLE</SelectItem>
                  <SelectItem value="MANIPULATION_MATIERE">MANIPULATION MATIÈRE</SelectItem>
                  <SelectItem value="LUMIERE_OMBRE">LUMIÈRE & OMBRE</SelectItem>
                  <SelectItem value="PARTICULES">PARTICULES</SelectItem>
                  <SelectItem value="TRANSFORMATION">TRANSFORMATION</SelectItem>
                  <SelectItem value="PSYCHEDELIQUE">PSYCHÉDÉLIQUE</SelectItem>
                  <SelectItem value="EXPLOSION">EXPLOSION</SelectItem>
                  <SelectItem value="ATMOSPHERIQUE">ATMOSPHÉRIQUE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="effect-count" className="text-forge-electric">Nombre d'effets</Label>
              <Input id="effect-count" type="number" min="1" max="100" value={effectCount} onChange={function (e) { return setEffectCount(e.target.value); }} className="glass-morphism border-forge-purple/30"/>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleGenerateEffects} disabled={isGenerating || generateBatchMutation.isPending} className="bg-gradient-to-r from-forge-cyan to-forge-electric hover:opacity-80">
              {isGenerating ? (<>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin"/>
                  Génération en cours...
                </>) : (<>
                  <Zap className="w-4 h-4 mr-2"/>
                  Générer les effets
                </>)}
            </Button>

            <Badge variant="outline" className="border-forge-cyan/50 text-forge-cyan">
              Module IA Autonome
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Module Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Classification & Storage */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-gold flex items-center gap-2">
              <Database className="w-5 h-5"/>
              Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Statut:</span>
                <Badge className={(classificationStatus === null || classificationStatus === void 0 ? void 0 : classificationStatus.status) === 'online' ? "bg-green-500" : "bg-red-500"}>{(classificationStatus === null || classificationStatus === void 0 ? void 0 : classificationStatus.status) || 'offline'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Effets classés:</span>
                <span className="text-forge-cyan">1,247</span> {/* Ce nombre devrait idéalement venir du système */}
              </div>
              <Progress value={85} className="h-2"/> {/* Valeur de progression à déterminer */}
            </div>
            <Button onClick={function () { return reorganizeLibraryMutation.mutate(); }} disabled={reorganizeLibraryMutation.isPending} size="sm" className="w-full bg-forge-gold hover:bg-forge-gold/80 text-forge-dark">
              {reorganizeLibraryMutation.isPending ? (<RefreshCw className="w-4 h-4 animate-spin"/>) : (<>
                  <RefreshCw className="w-4 h-4 mr-2"/>
                  Réorganiser
                </>)}
            </Button>
          </CardContent>
        </Card>

        {/* Error Detection */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-plasma flex items-center gap-2">
              <Shield className="w-5 h-5"/>
              Détection d'erreurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>IA locale:</span>
                <Badge className={(errorDetectionStatus === null || errorDetectionStatus === void 0 ? void 0 : errorDetectionStatus.status) === 'active' ? "bg-green-500" : "bg-red-500"}>{(errorDetectionStatus === null || errorDetectionStatus === void 0 ? void 0 : errorDetectionStatus.status) || 'inactive'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Erreurs détectées:</span>
                <span className="text-red-400">{(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.detectedErrors) || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Auto-corrections:</span>
                <span className="text-green-400">{(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.autoCorrections) || 0}</span>
              </div>
            </div>
            <Button size="sm" className="w-full bg-forge-plasma hover:bg-forge-plasma/80">
              <FileSearch className="w-4 h-4 mr-2"/>
              Scanner
            </Button>
          </CardContent>
        </Card>

        {/* Quality Assurance */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-electric flex items-center gap-2">
              <Award className="w-5 h-5"/>
              Assurance Qualité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score moyen:</span>
                <span className="text-forge-electric">87/100</span> {/* À synchroniser avec les données réelles */}
              </div>
              <div className="flex justify-between text-sm">
                <span>Approuvés:</span>
                <span className="text-green-400">94%</span> {/* À synchroniser avec les données réelles */}
              </div>
              <Progress value={94} className="h-2"/>
            </div>
            <Button onClick={function () { return runQualityCheckMutation.mutate(); }} disabled={runQualityCheckMutation.isPending} size="sm" className="w-full bg-forge-electric hover:bg-forge-electric/80">
              {runQualityCheckMutation.isPending ? (<RefreshCw className="w-4 h-4 animate-spin"/>) : (<>
                  <Award className="w-4 h-4 mr-2"/>
                  Contrôler
                </>)}
            </Button>
          </CardContent>
        </Card>

        {/* Parser Module */}
        <Card className="glass-morphism border-forge-purple/30 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-forge-cyan flex items-center gap-2">
              <Upload className="w-5 h-5"/>
              Parser
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Effets parsés:</span>
                <span className="text-forge-cyan">2,000</span> {/* À synchroniser avec les données réelles */}
              </div>
              <div className="flex justify-between text-sm">
                <span>Confiance moy.:</span>
                <span className="text-green-400">96%</span> {/* À synchroniser avec les données réelles */}
              </div>
              <Progress value={100} className="h-2"/>
            </div>
            <Button size="sm" className="w-full bg-forge-cyan hover:bg-forge-cyan/80 text-forge-dark">
              <Settings className="w-4 h-4 mr-2"/>
              Configurer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-morphism border-forge-purple/30 bg-transparent">
        <CardHeader>
          <CardTitle className="text-xl text-center text-forge-plasma">
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="border-forge-cyan/50 hover:bg-forge-cyan/10">
              <Download className="w-4 h-4 mr-2"/>
              Exporter Lib
            </Button>
            <Button variant="outline" className="border-forge-plasma/50 hover:bg-forge-plasma/10">
              <Upload className="w-4 h-4 mr-2"/>
              Importer
            </Button>
            <Button variant="outline" className="border-forge-electric/50 hover:bg-forge-electric/10">
              <RefreshCw className="w-4 h-4 mr-2"/>
              Sync Modules
            </Button>
            <Button variant="outline" className="border-forge-gold/50 hover:bg-forge-gold/10">
              <Settings className="w-4 h-4 mr-2"/>
              Config IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
}
