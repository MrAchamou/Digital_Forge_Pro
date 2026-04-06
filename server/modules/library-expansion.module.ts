
import fs from "fs/promises";
import path from "path";
import { storage } from "../storage";
import { nlpProcessor } from "../ai-engine/nlp-processor";
import type { Effect } from "@shared/schema";

interface ExpansionRequest {
  targetCategory: string;
  targetType: string;
  descriptionCount: number;
  creativeLevel: 'conservative' | 'moderate' | 'creative' | 'experimental';
  avoidDuplicates: boolean;
}

interface LibraryAnalysis {
  totalEffects: number;
  categoriesDistribution: Record<string, number>;
  typesDistribution: Record<string, number>;
  commonPatterns: string[];
  semanticClusters: any[];
  combinationOpportunities: any[];
}

interface GeneratedDescription {
  description: string;
  confidence: number;
  uniquenessScore: number;
  sourceElements: string[];
  category: string;
  type: string;
  estimatedComplexity: number;
}

class LibraryExpansionModule {
  private analysisCache: Map<string, LibraryAnalysis> = new Map();
  private semanticIndex: Map<string, number[]> = new Map();
  private combinationRules: Map<string, any> = new Map();
  private localAI: LocalExpansionAI;

  constructor() {
    this.localAI = new LocalExpansionAI();
    this.initializeCombinationRules();
  }

  async analyzeLibrary(): Promise<LibraryAnalysis> {
    console.log("🔍 Analyse complète de la bibliothèque en cours...");

    // Vérifier le cache
    const cacheKey = 'library_analysis';
    if (this.analysisCache.has(cacheKey)) {
      console.log("📊 Utilisation du cache d'analyse");
      return this.analysisCache.get(cacheKey)!;
    }

    try {
      // Récupération de tous les effets
      const allEffectsResult = await storage.getEffects({ limit: 10000 });
      const effects = allEffectsResult.effects;

      console.log(`📚 Analyse de ${effects.length} effets existants`);

      // Analyse des distributions
      const categoriesDistribution: Record<string, number> = {};
      const typesDistribution: Record<string, number> = {};
      const allDescriptions: string[] = [];

      effects.forEach(effect => {
        categoriesDistribution[effect.category] = (categoriesDistribution[effect.category] || 0) + 1;
        typesDistribution[effect.type] = (typesDistribution[effect.type] || 0) + 1;
        allDescriptions.push(effect.description);
      });

      // Analyse sémantique approfondie
      const semanticClusters = await this.performSemanticClustering(effects);
      const commonPatterns = await this.extractCommonPatterns(allDescriptions);
      const combinationOpportunities = await this.identifyCombinationOpportunities(effects);

      const analysis: LibraryAnalysis = {
        totalEffects: effects.length,
        categoriesDistribution,
        typesDistribution,
        commonPatterns,
        semanticClusters,
        combinationOpportunities
      };

      // Mise en cache
      this.analysisCache.set(cacheKey, analysis);

      console.log("✅ Analyse terminée avec succès");
      return analysis;

    } catch (error) {
      console.error("❌ Erreur lors de l'analyse:", error);
      throw new Error(`Échec de l'analyse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async expandLibrary(request: ExpansionRequest): Promise<{
    generated: GeneratedDescription[];
    stats: {
      totalGenerated: number;
      averageUniqueness: number;
      averageConfidence: number;
      duplicatesAvoided: number;
    };
    recommendations: string[];
  }> {
    console.log(`🚀 Expansion de la bibliothèque: ${request.descriptionCount} effets pour ${request.targetCategory}/${request.targetType}`);

    // Analyse préalable
    const analysis = await this.analyzeLibrary();

    // Génération intelligente
    const generated: GeneratedDescription[] = [];
    let duplicatesAvoided = 0;

    for (let i = 0; i < request.descriptionCount; i++) {
      console.log(`⚡ Génération ${i + 1}/${request.descriptionCount}`);

      try {
        const description = await this.generateUniqueDescription(
          request,
          analysis,
          generated
        );

        if (description) {
          // Vérification d'unicité
          if (request.avoidDuplicates) {
            const isDuplicate = await this.checkForDuplicates(description.description, analysis);
            if (isDuplicate) {
              duplicatesAvoided++;
              continue;
            }
          }

          generated.push(description);
        }
      } catch (error) {
        console.error(`Erreur génération ${i + 1}:`, error);
      }
    }

    // Calcul des statistiques
    const stats = {
      totalGenerated: generated.length,
      averageUniqueness: generated.reduce((sum, d) => sum + d.uniquenessScore, 0) / generated.length,
      averageConfidence: generated.reduce((sum, d) => sum + d.confidence, 0) / generated.length,
      duplicatesAvoided
    };

    // Génération de recommandations
    const recommendations = this.generateRecommendations(request, analysis, stats);

    console.log(`✅ Expansion terminée: ${generated.length} descriptions générées`);

    return { generated, stats, recommendations };
  }

  private async generateUniqueDescription(
    request: ExpansionRequest,
    analysis: LibraryAnalysis,
    alreadyGenerated: GeneratedDescription[]
  ): Promise<GeneratedDescription | null> {

    // Sélection d'éléments sources pour la combinaison
    const sourceElements = await this.selectSourceElements(request, analysis);

    // Génération par l'IA locale
    const description = await this.localAI.generateCombinedDescription({
      category: request.targetCategory,
      type: request.targetType,
      sourceElements,
      creativityLevel: request.creativeLevel,
      existingDescriptions: alreadyGenerated.map(d => d.description)
    });

    // Évaluation de la qualité
    const confidence = await this.evaluateDescriptionQuality(description, request);
    const uniquenessScore = await this.calculateUniquenessScore(description, analysis);

    if (confidence < 0.7 || uniquenessScore < 0.6) {
      return null;
    }

    return {
      description,
      confidence,
      uniquenessScore,
      sourceElements: sourceElements.map(e => e.name),
      category: request.targetCategory,
      type: request.targetType,
      estimatedComplexity: await this.estimateComplexity(description)
    };
  }

  private async selectSourceElements(request: ExpansionRequest, analysis: LibraryAnalysis): Promise<any[]> {
    const elements: any[] = [];

    // Sélection basée sur la catégorie cible
    const categoryEffects = analysis.semanticClusters.filter(cluster => 
      cluster.category === request.targetCategory
    );

    // Sélection d'éléments de la même catégorie (60%)
    if (categoryEffects.length > 0) {
      const primaryElements = this.randomSample(categoryEffects, Math.ceil(3 * 0.6));
      elements.push(...primaryElements);
    }

    // Sélection d'éléments complémentaires (40%)
    const complementaryCategories = this.findComplementaryCategories(request.targetCategory, analysis);
    for (const category of complementaryCategories.slice(0, 2)) {
      const complementaryEffects = analysis.semanticClusters.filter(cluster => 
        cluster.category === category
      );
      if (complementaryEffects.length > 0) {
        const complementaryElements = this.randomSample(complementaryEffects, 1);
        elements.push(...complementaryElements);
      }
    }

    return elements;
  }

  private async performSemanticClustering(effects: Effect[]): Promise<any[]> {
    const clusters: any[] = [];

    // Groupement par catégorie et analyse sémantique
    const categoryGroups = new Map<string, Effect[]>();
    effects.forEach(effect => {
      if (!categoryGroups.has(effect.category)) {
        categoryGroups.set(effect.category, []);
      }
      categoryGroups.get(effect.category)!.push(effect);
    });

    for (const [category, categoryEffects] of categoryGroups) {
      // Analyse NLP pour chaque groupe
      for (const effect of categoryEffects) {
        const concepts = await nlpProcessor.extractConcepts(effect.description);
        clusters.push({
          id: effect.id,
          name: effect.name,
          category: effect.category,
          type: effect.type,
          concepts: concepts.map(c => c.name),
          semanticVector: await this.generateSemanticVector(effect.description),
          complexity: effect.complexity,
          description: effect.description
        });
      }
    }

    return clusters;
  }

  private async extractCommonPatterns(descriptions: string[]): Promise<string[]> {
    const patterns: Map<string, number> = new Map();

    // Extraction de patterns linguistiques
    const commonWords = ['effet', 'animation', 'transition', 'mouvement', 'lumière', 'particule'];
    const commonPhrases = [
      'effet de', 'animation de', 'mouvement de', 'transition de',
      'avec des', 'utilisant des', 'créant un', 'générant des'
    ];

    descriptions.forEach(desc => {
      const lowerDesc = desc.toLowerCase();
      
      commonWords.forEach(word => {
        if (lowerDesc.includes(word)) {
          patterns.set(word, (patterns.get(word) || 0) + 1);
        }
      });

      commonPhrases.forEach(phrase => {
        if (lowerDesc.includes(phrase)) {
          patterns.set(phrase, (patterns.get(phrase) || 0) + 1);
        }
      });
    });

    return Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pattern]) => pattern);
  }

  private async identifyCombinationOpportunities(effects: Effect[]): Promise<any[]> {
    const opportunities: any[] = [];

    // Analyse des combinaisons réussies existantes
    const combinationPatterns = new Map<string, number>();

    effects.forEach(effect => {
      const concepts = effect.description.toLowerCase().split(' ');
      
      // Recherche de combinaisons dans la description
      for (let i = 0; i < concepts.length - 1; i++) {
        const combination = `${concepts[i]}_${concepts[i + 1]}`;
        combinationPatterns.set(combination, (combinationPatterns.get(combination) || 0) + 1);
      }
    });

    // Identification des opportunités non exploitées
    const potentialCombinations = [
      { elements: ['fire', 'water'], potential: 'steam_effects' },
      { elements: ['light', 'shadow'], potential: 'contrast_effects' },
      { elements: ['particle', 'gravity'], potential: 'physics_systems' },
      { elements: ['morphing', 'color'], potential: 'chromatic_transformation' }
    ];

    potentialCombinations.forEach(combo => {
      const existingCount = combinationPatterns.get(combo.elements.join('_')) || 0;
      opportunities.push({
        combination: combo.elements,
        potential: combo.potential,
        currentUsage: existingCount,
        expansionPotential: existingCount < 5 ? 'high' : 'medium'
      });
    });

    return opportunities;
  }

  private findComplementaryCategories(targetCategory: string, analysis: LibraryAnalysis): string[] {
    const complementaryMap: Record<string, string[]> = {
      'PARTICULES': ['LUMIERE_OMBRE', 'PHYSIQUE', 'EXPLOSION'],
      'LUMIERE_OMBRE': ['PARTICULES', 'MORPHING', 'ATMOSPHERIC'],
      'MORPHING': ['TRANSFORMATION', 'LUMIERE_OMBRE', 'DIGITAL'],
      'PHYSIQUE': ['PARTICULES', 'MANIPULATION_TEMPORELLE', 'EXPLOSION'],
      'EXPLOSION': ['PARTICULES', 'PHYSIQUE', 'LUMIERE_OMBRE'],
      'ATMOSPHERIC': ['LUMIERE_OMBRE', 'PARTICULES', 'PHYSIQUE'],
      'DIGITAL': ['MORPHING', 'LUMIERE_OMBRE', 'TRANSFORMATION']
    };

    return complementaryMap[targetCategory] || Object.keys(analysis.categoriesDistribution);
  }

  private async checkForDuplicates(description: string, analysis: LibraryAnalysis): Promise<boolean> {
    // Vérification sémantique avancée
    const descVector = await this.generateSemanticVector(description);
    
    for (const cluster of analysis.semanticClusters) {
      const similarity = this.calculateCosineSimilarity(descVector, cluster.semanticVector);
      if (similarity > 0.85) {
        return true;
      }
    }

    return false;
  }

  private async generateSemanticVector(text: string): Promise<number[]> {
    // Génération simplifiée de vecteur sémantique
    const concepts = await nlpProcessor.extractConcepts(text);
    const vector = new Array(100).fill(0);
    
    concepts.forEach((concept, index) => {
      if (index < vector.length) {
        vector[index] = concept.confidence * concept.weight;
      }
    });

    return vector;
  }

  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < Math.min(vector1.length, vector2.length); i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private randomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private async evaluateDescriptionQuality(description: string, request: ExpansionRequest): Promise<number> {
    let quality = 0.5;

    // Longueur appropriée
    if (description.length >= 50 && description.length <= 300) quality += 0.2;

    // Présence d'éléments techniques
    const technicalTerms = ['effet', 'animation', 'transition', 'shader', 'particule'];
    const techCount = technicalTerms.filter(term => description.toLowerCase().includes(term)).length;
    quality += Math.min(techCount * 0.1, 0.3);

    // Cohérence avec la catégorie
    if (description.toLowerCase().includes(request.targetCategory.toLowerCase())) {
      quality += 0.2;
    }

    return Math.min(quality, 1.0);
  }

  private async calculateUniquenessScore(description: string, analysis: LibraryAnalysis): Promise<number> {
    // Score basé sur la rareté des éléments utilisés
    const words = description.toLowerCase().split(' ');
    let uniquenessScore = 1.0;

    for (const pattern of analysis.commonPatterns) {
      if (description.toLowerCase().includes(pattern)) {
        uniquenessScore -= 0.05;
      }
    }

    return Math.max(uniquenessScore, 0.3);
  }

  private async estimateComplexity(description: string): Promise<number> {
    const complexityIndicators = [
      'avancé', 'complexe', 'détaillé', 'sophistiqué', 'multi-couches',
      'realistic', 'physics', 'shader', 'volumetric', 'raytracing'
    ];

    let complexity = 3;
    const lowerDesc = description.toLowerCase();

    complexityIndicators.forEach(indicator => {
      if (lowerDesc.includes(indicator)) {
        complexity += 1;
      }
    });

    return Math.min(complexity, 10);
  }

  private generateRecommendations(request: ExpansionRequest, analysis: LibraryAnalysis, stats: any): string[] {
    const recommendations: string[] = [];

    if (stats.averageConfidence < 0.8) {
      recommendations.push("Qualité moyenne faible - considérer l'ajustement des paramètres de créativité");
    }

    if (stats.averageUniqueness < 0.7) {
      recommendations.push("Score d'unicité faible - explorer d'autres combinaisons d'éléments");
    }

    if (stats.duplicatesAvoided > stats.totalGenerated * 0.3) {
      recommendations.push("Taux de doublons élevé - la bibliothèque pourrait être saturée pour cette catégorie");
    }

    const categoryCount = analysis.categoriesDistribution[request.targetCategory] || 0;
    if (categoryCount < 50) {
      recommendations.push(`Catégorie ${request.targetCategory} sous-représentée - expansion recommandée`);
    }

    return recommendations;
  }

  private initializeCombinationRules(): void {
    // Règles de combinaison créative
    this.combinationRules.set('fire_water', {
      result: 'steam_effects',
      probability: 0.8,
      complexity: 6
    });

    this.combinationRules.set('light_shadow', {
      result: 'contrast_effects',
      probability: 0.9,
      complexity: 5
    });

    this.combinationRules.set('particle_gravity', {
      result: 'physics_simulation',
      probability: 0.85,
      complexity: 7
    });
  }

  // API publiques
  async getAvailableCategories(): Promise<string[]> {
    const analysis = await this.analyzeLibrary();
    return Object.keys(analysis.categoriesDistribution);
  }

  async getAvailableTypes(): Promise<string[]> {
    const analysis = await this.analyzeLibrary();
    return Object.keys(analysis.typesDistribution);
  }

  async getCategoryStats(category: string): Promise<any> {
    const analysis = await this.analyzeLibrary();
    const count = analysis.categoriesDistribution[category] || 0;
    const clusters = analysis.semanticClusters.filter(c => c.category === category);
    
    return {
      effectCount: count,
      averageComplexity: clusters.reduce((sum, c) => sum + c.complexity, 0) / clusters.length,
      commonConcepts: this.extractTopConcepts(clusters),
      expansionPotential: count < 100 ? 'high' : count < 200 ? 'medium' : 'low'
    };
  }

  private extractTopConcepts(clusters: any[]): string[] {
    const conceptCounts = new Map<string, number>();
    
    clusters.forEach(cluster => {
      cluster.concepts.forEach((concept: string) => {
        conceptCounts.set(concept, (conceptCounts.get(concept) || 0) + 1);
      });
    });

    return Array.from(conceptCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concept]) => concept);
  }
}

// IA LOCALE POUR L'EXPANSION
class LocalExpansionAI {
  private creativePatterns: Map<string, string[]> = new Map();
  private combinationTemplates: string[] = [];

  constructor() {
    this.initializeCreativePatterns();
    this.initializeCombinationTemplates();
  }

  async generateCombinedDescription(params: {
    category: string;
    type: string;
    sourceElements: any[];
    creativityLevel: string;
    existingDescriptions: string[];
  }): Promise<string> {

    // Sélection du template de base
    const template = this.selectTemplate(params.category, params.type);

    // Extraction d'éléments créatifs des sources
    const creativeElements = this.extractCreativeElements(params.sourceElements);

    // Génération selon le niveau de créativité
    const description = await this.combineElements(template, creativeElements, params.creativityLevel);

    // Vérification d'unicité
    const uniqueDescription = this.ensureUniqueness(description, params.existingDescriptions);

    return uniqueDescription;
  }

  private selectTemplate(category: string, type: string): string {
    const templates = {
      'PARTICULES': [
        "Système de particules {ELEMENT1} avec {ELEMENT2} créant un effet {STYLE}",
        "Émission de {ELEMENT1} {STYLE} interagissant avec {ELEMENT2}",
        "Nuage de particules {ELEMENT1} avec comportement {STYLE} et {ELEMENT2}"
      ],
      'LUMIERE_OMBRE': [
        "Jeu d'éclairage {ELEMENT1} avec projection d'ombres {STYLE}",
        "Contraste lumineux entre {ELEMENT1} et {ELEMENT2} créant {STYLE}",
        "Illumination {STYLE} révélant des détails {ELEMENT1} avec {ELEMENT2}"
      ],
      'MORPHING': [
        "Transformation progressive de {ELEMENT1} vers {ELEMENT2} avec style {STYLE}",
        "Métamorphose {STYLE} combinant {ELEMENT1} et {ELEMENT2}",
        "Évolution {ELEMENT1} intégrant des aspects {ELEMENT2} de manière {STYLE}"
      ]
    };

    const categoryTemplates = templates[category as keyof typeof templates] || templates['PARTICULES'];
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }

  private extractCreativeElements(sourceElements: any[]): any {
    const elements: { primary: any[]; secondary: any[]; styles: string[] } = {
      primary: [],
      secondary: [],
      styles: []
    };

    sourceElements.forEach(element => {
      // Extraction des concepts principaux
      if (element.concepts) {
        elements.primary.push(...element.concepts.slice(0, 2));
        elements.secondary.push(...element.concepts.slice(2, 4));
      }

      // Extraction de styles
      const styleWords = ['dynamique', 'fluide', 'énergique', 'subtil', 'intense'];
      const elementStyle = styleWords[Math.floor(Math.random() * styleWords.length)];
      elements.styles.push(elementStyle);
    });

    return elements;
  }

  private async combineElements(template: string, elements: any, creativityLevel: string): Promise<string> {
    let description = template;

    // Remplacement des placeholders
    const element1 = elements.primary[0] || 'particules';
    const element2 = elements.secondary[0] || 'lumineuses';
    const style = elements.styles[0] || 'dynamique';

    description = description
      .replace('{ELEMENT1}', element1)
      .replace('{ELEMENT2}', element2)
      .replace('{STYLE}', style);

    // Enrichissement selon le niveau de créativité
    switch (creativityLevel) {
      case 'experimental':
        description = await this.addExperimentalElements(description);
        break;
      case 'creative':
        description = await this.addCreativeElements(description);
        break;
      case 'moderate':
        description = await this.addModerateElements(description);
        break;
      default:
        break;
    }

    return description;
  }

  private async addExperimentalElements(description: string): Promise<string> {
    const experimentalAdditions = [
      'avec des propriétés quantiques',
      'utilisant des algorithmes génératifs',
      'intégrant de la physique non-euclidienne',
      'avec des effets temporels non-linéaires'
    ];

    const addition = experimentalAdditions[Math.floor(Math.random() * experimentalAdditions.length)];
    return `${description} ${addition}`;
  }

  private async addCreativeElements(description: string): Promise<string> {
    const creativeAdditions = [
      'avec des variations procédurales',
      'incluant des réactions interactives',
      'présentant des détails fractaux',
      'avec synchronisation audiovisuelle'
    ];

    const addition = creativeAdditions[Math.floor(Math.random() * creativeAdditions.length)];
    return `${description} ${addition}`;
  }

  private async addModerateElements(description: string): Promise<string> {
    const moderateAdditions = [
      'avec des transitions fluides',
      'incluant des variations subtiles',
      'présentant un rendu optimisé',
      'avec contrôles utilisateur'
    ];

    const addition = moderateAdditions[Math.floor(Math.random() * moderateAdditions.length)];
    return `${description} ${addition}`;
  }

  private ensureUniqueness(description: string, existingDescriptions: string[]): string {
    // Vérification simple d'unicité et modification si nécessaire
    let uniqueDescription = description;
    let attempts = 0;

    while (existingDescriptions.includes(uniqueDescription) && attempts < 5) {
      const variations = [
        'avancé', 'amélioré', 'optimisé', 'personnalisé', 'adaptatif'
      ];
      const variation = variations[Math.floor(Math.random() * variations.length)];
      uniqueDescription = `${description} ${variation}`;
      attempts++;
    }

    return uniqueDescription;
  }

  private initializeCreativePatterns(): void {
    this.creativePatterns.set('fire', ['flammes', 'combustion', 'incandescence']);
    this.creativePatterns.set('water', ['liquide', 'fluidité', 'ondulation']);
    this.creativePatterns.set('light', ['luminescence', 'éclat', 'rayonnement']);
  }

  private initializeCombinationTemplates(): void {
    this.combinationTemplates = [
      "Effet combinant {A} et {B} pour créer {RESULT}",
      "Interaction entre {A} et {B} générant {RESULT}",
      "Fusion de {A} avec {B} produisant {RESULT}"
    ];
  }
}

export const libraryExpansionModule = new LibraryExpansionModule();
