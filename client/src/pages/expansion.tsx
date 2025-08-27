
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Target, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';

interface LibraryStats {
  totalEffects: number;
  categoriesDistribution: Record<string, number>;
  typesDistribution: Record<string, number>;
}

interface ExpansionResult {
  generated: any[];
  stats: {
    totalGenerated: number;
    averageUniqueness: number;
    averageConfidence: number;
    duplicatesAvoided: number;
  };
  recommendations: string[];
}

export default function ExpansionPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [libraryStats, setLibraryStats] = useState<LibraryStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [descriptionCount, setDescriptionCount] = useState<number>(5);
  const [creativityLevel, setCreativityLevel] = useState<string>('moderate');
  const [avoidDuplicates, setAvoidDuplicates] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  const [expansionResult, setExpansionResult] = useState<ExpansionResult | null>(null);
  const [categoryStats, setCategoryStats] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryStats();
    }
  }, [selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, typesRes, statsRes] = await Promise.all([
        fetch('/api/expansion/categories'),
        fetch('/api/expansion/types'),
        fetch('/api/expansion/library-stats')
      ]);

      const categoriesData = await categoriesRes.json();
      const typesData = await typesRes.json();
      const statsData = await statsRes.json();

      setCategories(categoriesData.categories || []);
      setTypes(typesData.types || []);
      setLibraryStats(statsData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadCategoryStats = async () => {
    try {
      const res = await fetch(`/api/expansion/category-stats/${selectedCategory}`);
      const stats = await res.json();
      setCategoryStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats catégorie:', error);
    }
  };

  const analyzeLibrary = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/expansion/analyze-library', { method: 'POST' });
      const result = await res.json();
      
      if (result.success) {
        setAnalysisComplete(true);
        setLibraryStats(result.analysis);
      }
    } catch (error) {
      console.error('Erreur analyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const expandLibrary = async () => {
    if (!selectedCategory || !selectedType || descriptionCount <= 0) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setIsExpanding(true);
    try {
      const res = await fetch('/api/expansion/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCategory: selectedCategory,
          targetType: selectedType,
          descriptionCount,
          creativeLevel: creativityLevel,
          avoidDuplicates
        })
      });

      const result = await res.json();
      
      if (result.success) {
        setExpansionResult(result);
      }
    } catch (error) {
      console.error('Erreur expansion:', error);
    } finally {
      setIsExpanding(false);
    }
  };

  const getCreativityLabel = (level: string) => {
    const labels = {
      conservative: 'Conservateur',
      moderate: 'Modéré',
      creative: 'Créatif',
      experimental: 'Expérimental'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getCreativityColor = (level: string) => {
    const colors = {
      conservative: 'bg-blue-500',
      moderate: 'bg-green-500',
      creative: 'bg-yellow-500',
      experimental: 'bg-red-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-purple-300" />
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
                    <BookOpen className="mr-2 h-5 w-5" />
                    Statistiques de la Bibliothèque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {libraryStats ? (
                    <>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-300">
                          {libraryStats.totalEffects}
                        </div>
                        <div className="text-purple-200">Effets totaux</div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Distribution par catégorie</Label>
                        {Object.entries(libraryStats.categoriesDistribution).map(([cat, count]) => (
                          <div key={cat} className="flex justify-between items-center">
                            <span className="text-purple-200">{cat}</span>
                            <Badge variant="outline" className="text-purple-300">
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-purple-300">
                      Lancez l'analyse pour voir les statistiques
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contrôle d'analyse */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Analyse Intelligente
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Analysez votre bibliothèque pour identifier les opportunités d'expansion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={analyzeLibrary}
                    disabled={isAnalyzing}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Analyser la Bibliothèque
                      </>
                    )}
                  </Button>

                  {analysisComplete && (
                    <Alert className="bg-green-900/50 border-green-500/50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-300">
                        Analyse terminée avec succès ! Vous pouvez maintenant procéder à l'expansion.
                      </AlertDescription>
                    </Alert>
                  )}
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
                    <Zap className="mr-2 h-5 w-5" />
                    Configuration d'Expansion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sélection catégorie */}
                  <div className="space-y-2">
                    <Label className="text-white">Catégorie cible</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-purple-500">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="text-white">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sélection type */}
                  <div className="space-y-2">
                    <Label className="text-white">Type d'effet</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                        <SelectValue placeholder="Choisir un type" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-purple-500">
                        {types.map(type => (
                          <SelectItem key={type} value={type} className="text-white">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nombre de descriptions */}
                  <div className="space-y-2">
                    <Label className="text-white">Nombre de descriptions à créer</Label>
                    <Input
                      type="number"
                      value={descriptionCount}
                      onChange={(e) => setDescriptionCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max="50"
                      className="bg-black/50 border-purple-500/50 text-white"
                    />
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
                      <div className={`h-2 rounded-full ${getCreativityColor(creativityLevel)}`}></div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="avoid-duplicates"
                      checked={avoidDuplicates}
                      onCheckedChange={setAvoidDuplicates}
                    />
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
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Aperçu de la Catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryStats && selectedCategory ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-300">
                            {categoryStats.effectCount}
                          </div>
                          <div className="text-purple-200 text-sm">Effets existants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-300">
                            {categoryStats.averageComplexity?.toFixed(1)}
                          </div>
                          <div className="text-purple-200 text-sm">Complexité moyenne</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Potentiel d'expansion</Label>
                        <Badge 
                          variant="outline" 
                          className={`${
                            categoryStats.expansionPotential === 'high' ? 'text-green-300 border-green-500' :
                            categoryStats.expansionPotential === 'medium' ? 'text-yellow-300 border-yellow-500' :
                            'text-red-300 border-red-500'
                          }`}
                        >
                          {categoryStats.expansionPotential === 'high' ? '🚀 Élevé' :
                           categoryStats.expansionPotential === 'medium' ? '📈 Moyen' : '⚠️ Limité'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Concepts populaires</Label>
                        <div className="flex flex-wrap gap-1">
                          {categoryStats.commonConcepts?.slice(0, 5).map((concept: string) => (
                            <Badge key={concept} variant="secondary" className="text-xs">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-purple-300">
                      Sélectionnez une catégorie pour voir l'aperçu
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bouton d'expansion */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-6">
                <Button 
                  onClick={expandLibrary}
                  disabled={!analysisComplete || isExpanding || !selectedCategory || !selectedType}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                >
                  {isExpanding ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Expansion en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Lancer l'Expansion Intelligente
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Résultats */}
          <TabsContent value="results" className="space-y-6">
            {expansionResult ? (
              <div className="space-y-6">
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
                    {expansionResult.generated.map((desc, index) => (
                      <div key={index} className="p-4 bg-black/30 rounded-lg border border-purple-500/20">
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
                          {desc.sourceElements?.map((element: string) => (
                            <Badge key={element} variant="outline" className="text-xs text-purple-400">
                              {element}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommandations */}
                {expansionResult.recommendations.length > 0 && (
                  <Card className="bg-black/40 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">Recommandations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {expansionResult.recommendations.map((rec, index) => (
                          <Alert key={index} className="bg-yellow-900/20 border-yellow-500/50">
                            <AlertDescription className="text-yellow-300">
                              {rec}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-12 text-center">
                  <div className="text-purple-300 text-lg">
                    Aucun résultat disponible. Lancez une expansion pour voir les résultats.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
