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
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Target, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
export default function ExpansionPage() {
    var _this = this;
    var _a, _b;
    var _c = useState([]), categories = _c[0], setCategories = _c[1];
    var _d = useState([]), types = _d[0], setTypes = _d[1];
    var _e = useState(null), libraryStats = _e[0], setLibraryStats = _e[1];
    var _f = useState(''), selectedCategory = _f[0], setSelectedCategory = _f[1];
    var _g = useState(''), selectedType = _g[0], setSelectedType = _g[1];
    var _h = useState(5), descriptionCount = _h[0], setDescriptionCount = _h[1];
    var _j = useState('moderate'), creativityLevel = _j[0], setCreativityLevel = _j[1];
    var _k = useState(true), avoidDuplicates = _k[0], setAvoidDuplicates = _k[1];
    var _l = useState(false), isAnalyzing = _l[0], setIsAnalyzing = _l[1];
    var _m = useState(false), isExpanding = _m[0], setIsExpanding = _m[1];
    var _o = useState(false), analysisComplete = _o[0], setAnalysisComplete = _o[1];
    var _p = useState(null), expansionResult = _p[0], setExpansionResult = _p[1];
    var _q = useState(null), categoryStats = _q[0], setCategoryStats = _q[1];
    useEffect(function () {
        loadInitialData();
    }, []);
    useEffect(function () {
        if (selectedCategory) {
            loadCategoryStats();
        }
    }, [selectedCategory]);
    var loadInitialData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, categoriesRes, typesRes, statsRes, categoriesData, typesData, statsData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, Promise.all([
                            fetch('/api/expansion/categories'),
                            fetch('/api/expansion/types'),
                            fetch('/api/expansion/library-stats')
                        ])];
                case 1:
                    _a = _b.sent(), categoriesRes = _a[0], typesRes = _a[1], statsRes = _a[2];
                    return [4 /*yield*/, categoriesRes.json()];
                case 2:
                    categoriesData = _b.sent();
                    return [4 /*yield*/, typesRes.json()];
                case 3:
                    typesData = _b.sent();
                    return [4 /*yield*/, statsRes.json()];
                case 4:
                    statsData = _b.sent();
                    setCategories(categoriesData.categories || []);
                    setTypes(typesData.types || []);
                    setLibraryStats(statsData);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error('Erreur chargement données:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var loadCategoryStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, stats, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/expansion/category-stats/".concat(selectedCategory))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    stats = _a.sent();
                    setCategoryStats(stats);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Erreur chargement stats catégorie:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var analyzeLibrary = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsAnalyzing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/expansion/analyze-library', { method: 'POST' })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        setAnalysisComplete(true);
                        setLibraryStats(result.analysis);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    console.error('Erreur analyse:', error_3);
                    return [3 /*break*/, 6];
                case 5:
                    setIsAnalyzing(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var expandLibrary = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedCategory || !selectedType || descriptionCount <= 0) {
                        alert('Veuillez remplir tous les champs requis');
                        return [2 /*return*/];
                    }
                    setIsExpanding(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/expansion/expand', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                targetCategory: selectedCategory,
                                targetType: selectedType,
                                descriptionCount: descriptionCount,
                                creativeLevel: creativityLevel,
                                avoidDuplicates: avoidDuplicates
                            })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        setExpansionResult(result);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_4 = _a.sent();
                    console.error('Erreur expansion:', error_4);
                    return [3 /*break*/, 6];
                case 5:
                    setIsExpanding(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var getCreativityLabel = function (level) {
        var labels = {
            conservative: 'Conservateur',
            moderate: 'Modéré',
            creative: 'Créatif',
            experimental: 'Expérimental'
        };
        return labels[level] || level;
    };
    var getCreativityColor = function (level) {
        var colors = {
            conservative: 'bg-blue-500',
            moderate: 'bg-green-500',
            creative: 'bg-yellow-500',
            experimental: 'bg-red-500'
        };
        return colors[level] || 'bg-gray-500';
    };
    return (<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-purple-300"/>
            <h1 className="text-4xl font-bold text-white">Module d'Expansion Intelligente</h1>
          </div>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Analysez votre bibliothèque de 2000 effets et générez automatiquement de nouveaux contenus uniques grâce à l'IA locale
          </p>
        </div>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/20">
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600">
              📊 Analyse
            </TabsTrigger>
            <TabsTrigger value="expansion" className="data-[state=active]:bg-purple-600">
              🚀 Expansion
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-600">
              📈 Résultats
            </TabsTrigger>
          </TabsList>

          {/* Onglet Analyse */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistiques globales */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="mr-2 h-5 w-5"/>
                    Statistiques de la Bibliothèque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {libraryStats ? (<>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-300">
                          {libraryStats.totalEffects}
                        </div>
                        <div className="text-purple-200">Effets totaux</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Distribution par catégorie</Label>
                        {Object.entries(libraryStats.categoriesDistribution).map(function (_a) {
                var cat = _a[0], count = _a[1];
                return (<div key={cat} className="flex justify-between items-center">
                            <span className="text-purple-200">{cat}</span>
                            <Badge variant="outline" className="text-purple-300">
                              {count}
                            </Badge>
                          </div>);
            })}
                      </div>
                    </>) : (<div className="text-center text-purple-300">
                      Lancez l'analyse pour voir les statistiques
                    </div>)}
                </CardContent>
              </Card>

              {/* Contrôle d'analyse */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="mr-2 h-5 w-5"/>
                    Analyse Intelligente
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Analysez votre bibliothèque pour identifier les opportunités d'expansion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={analyzeLibrary} disabled={isAnalyzing} className="w-full bg-purple-600 hover:bg-purple-700">
                    {isAnalyzing ? (<>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyse en cours...
                      </>) : (<>
                        <Brain className="mr-2 h-4 w-4"/>
                        Analyser la Bibliothèque
                      </>)}
                  </Button>

                  {analysisComplete && (<Alert className="bg-green-900/50 border-green-500/50">
                      <CheckCircle className="h-4 w-4"/>
                      <AlertDescription className="text-green-300">
                        Analyse terminée avec succès ! Vous pouvez maintenant procéder à l'expansion.
                      </AlertDescription>
                    </Alert>)}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Expansion */}
          <TabsContent value="expansion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration d'expansion */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="mr-2 h-5 w-5"/>
                    Configuration d'Expansion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sélection catégorie */}
                  <div className="space-y-2">
                    <Label className="text-white">Catégorie cible</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                        <SelectValue placeholder="Choisir une catégorie"/>
                      </SelectTrigger>
                      <SelectContent className="bg-black border-purple-500">
                        {categories.map(function (cat) { return (<SelectItem key={cat} value={cat} className="text-white">
                            {cat}
                          </SelectItem>); })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sélection type */}
                  <div className="space-y-2">
                    <Label className="text-white">Type d'effet</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                        <SelectValue placeholder="Choisir un type"/>
                      </SelectTrigger>
                      <SelectContent className="bg-black border-purple-500">
                        {types.map(function (type) { return (<SelectItem key={type} value={type} className="text-white">
                            {type}
                          </SelectItem>); })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nombre de descriptions */}
                  <div className="space-y-2">
                    <Label className="text-white">Nombre de descriptions à créer</Label>
                    <Input type="number" value={descriptionCount} onChange={function (e) { return setDescriptionCount(parseInt(e.target.value) || 1); }} min="1" max="50" className="bg-black/50 border-purple-500/50 text-white"/>
                  </div>

                  {/* Niveau de créativité */}
                  <div className="space-y-3">
                    <Label className="text-white">Niveau de créativité</Label>
                    <div className="space-y-2">
                      <Select value={creativityLevel} onValueChange={setCreativityLevel}>
                        <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-purple-500">
                          <SelectItem value="conservative">🔒 Conservateur</SelectItem>
                          <SelectItem value="moderate">⚖️ Modéré</SelectItem>
                          <SelectItem value="creative">🎨 Créatif</SelectItem>
                          <SelectItem value="experimental">🧪 Expérimental</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className={"h-2 rounded-full ".concat(getCreativityColor(creativityLevel))}></div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center space-x-2">
                    <Switch id="avoid-duplicates" checked={avoidDuplicates} onCheckedChange={setAvoidDuplicates}/>
                    <Label htmlFor="avoid-duplicates" className="text-white">
                      Éviter les doublons
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Aperçu de la catégorie */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5"/>
                    Aperçu de la Catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryStats && selectedCategory ? (<div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-300">
                            {categoryStats.effectCount}
                          </div>
                          <div className="text-purple-200 text-sm">Effets existants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-300">
                            {(_a = categoryStats.averageComplexity) === null || _a === void 0 ? void 0 : _a.toFixed(1)}
                          </div>
                          <div className="text-purple-200 text-sm">Complexité moyenne</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Potentiel d'expansion</Label>
                        <Badge variant="outline" className={"".concat(categoryStats.expansionPotential === 'high' ? 'text-green-300 border-green-500' :
                categoryStats.expansionPotential === 'medium' ? 'text-yellow-300 border-yellow-500' :
                    'text-red-300 border-red-500')}>
                          {categoryStats.expansionPotential === 'high' ? '🚀 Élevé' :
                categoryStats.expansionPotential === 'medium' ? '📈 Moyen' : '⚠️ Limité'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Concepts populaires</Label>
                        <div className="flex flex-wrap gap-1">
                          {(_b = categoryStats.commonConcepts) === null || _b === void 0 ? void 0 : _b.slice(0, 5).map(function (concept) { return (<Badge key={concept} variant="secondary" className="text-xs">
                              {concept}
                            </Badge>); })}
                        </div>
                      </div>
                    </div>) : (<div className="text-center text-purple-300">
                      Sélectionnez une catégorie pour voir l'aperçu
                    </div>)}
                </CardContent>
              </Card>
            </div>

            {/* Bouton d'expansion */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-6">
                <Button onClick={expandLibrary} disabled={!analysisComplete || isExpanding || !selectedCategory || !selectedType} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6">
                  {isExpanding ? (<>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Expansion en cours...
                    </>) : (<>
                      <Zap className="mr-2 h-5 w-5"/>
                      Lancer l'Expansion Intelligente
                    </>)}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Résultats */}
          <TabsContent value="results" className="space-y-6">
            {expansionResult ? (<div className="space-y-6">
                {/* Statistiques des résultats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-black/40 border-green-500/30">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-300">
                        {expansionResult.stats.totalGenerated}
                      </div>
                      <div className="text-green-200 text-sm">Descriptions générées</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/40 border-blue-500/30">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-300">
                        {(expansionResult.stats.averageConfidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-blue-200 text-sm">Confiance moyenne</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/40 border-purple-500/30">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-300">
                        {(expansionResult.stats.averageUniqueness * 100).toFixed(1)}%
                      </div>
                      <div className="text-purple-200 text-sm">Unicité moyenne</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/40 border-yellow-500/30">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-yellow-300">
                        {expansionResult.stats.duplicatesAvoided}
                      </div>
                      <div className="text-yellow-200 text-sm">Doublons évités</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Descriptions générées */}
                <Card className="bg-black/40 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Descriptions Générées</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {expansionResult.generated.map(function (desc, index) {
                var _a;
                return (<div key={index} className="p-4 bg-black/30 rounded-lg border border-purple-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-purple-300">
                            #{index + 1}
                          </Badge>
                          <div className="flex space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              Confiance: {(desc.confidence * 100).toFixed(0)}%
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Unicité: {(desc.uniquenessScore * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-white mb-2">{desc.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {(_a = desc.sourceElements) === null || _a === void 0 ? void 0 : _a.map(function (element) { return (<Badge key={element} variant="outline" className="text-xs text-purple-400">
                              {element}
                            </Badge>); })}
                        </div>
                      </div>);
            })}
                  </CardContent>
                </Card>

                {/* Recommandations */}
                {expansionResult.recommendations.length > 0 && (<Card className="bg-black/40 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">Recommandations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {expansionResult.recommendations.map(function (rec, index) { return (<Alert key={index} className="bg-yellow-900/20 border-yellow-500/50">
                            <AlertDescription className="text-yellow-300">
                              {rec}
                            </AlertDescription>
                          </Alert>); })}
                      </div>
                    </CardContent>
                  </Card>)}
              </div>) : (<Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-12 text-center">
                  <div className="text-purple-300 text-lg">
                    Aucun résultat disponible. Lancez une expansion pour voir les résultats.
                  </div>
                </CardContent>
              </Card>)}
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}
