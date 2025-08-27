
import fs from "fs/promises";
import path from "path";

interface ClassificationResult {
  primaryCategory: string;
  subCategories: string[];
  confidence: number;
  suggestedPath: string;
  metadata: {
    effectType: string;
    complexity: number;
    platform: string[];
    tags: string[];
  };
}

interface StorageStructure {
  rootPath: string;
  categoryPath: string;
  subCategoryPath?: string;
  effectPath: string;
}

class ClassificationStorageModule {
  private classificationRules: Map<string, any> = new Map();
  private storageStructure: Map<string, string> = new Map();
  
  constructor() {
    this.initializeClassificationRules();
    this.initializeStorageStructure();
  }

  async classifyEffect(effectData: any): Promise<ClassificationResult> {
    console.log(`🔍 Classification de l'effet: ${effectData.name}`);
    
    const analysis = this.analyzeContent(effectData);
    const category = this.determinePrimaryCategory(analysis);
    const subCategories = this.determineSubCategories(analysis, category);
    const confidence = this.calculateConfidence(analysis, category);
    const suggestedPath = this.generateStoragePath(category, subCategories[0]);
    
    const metadata = {
      effectType: this.determineEffectType(analysis),
      complexity: effectData.complexity || this.estimateComplexity(analysis),
      platform: this.determinePlatforms(analysis),
      tags: this.generateTags(analysis, category)
    };
    
    return {
      primaryCategory: category,
      subCategories,
      confidence,
      suggestedPath,
      metadata
    };
  }

  async storeEffect(effectData: any, classification: ClassificationResult): Promise<{
    stored: boolean;
    filePath: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      console.log(`💾 Stockage de l'effet dans: ${classification.suggestedPath}`);
      
      // Créer la structure de dossiers
      const structure = this.buildStorageStructure(classification);
      await this.ensureDirectoryStructure(structure);
      
      // Enrichir les données avec la classification
      const enrichedData = {
        ...effectData,
        classification,
        storedAt: new Date().toISOString(),
        version: '1.0',
        auto_generated: true
      };
      
      // Sauvegarder le fichier principal
      const effectFilePath = path.join(structure.effectPath, `${effectData.id}.json`);
      await fs.writeFile(effectFilePath, JSON.stringify(enrichedData, null, 2));
      
      // Mettre à jour les index
      await this.updateIndexes(structure, enrichedData, classification);
      
      // Créer des métadonnées de recherche
      await this.createSearchMetadata(structure, enrichedData, classification);
      
      console.log(`✅ Effet stocké avec succès: ${effectFilePath}`);
      
      return {
        stored: true,
        filePath: effectFilePath,
        errors
      };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown storage error';
      errors.push(errorMsg);
      console.error(`❌ Erreur de stockage:`, error);
      
      return {
        stored: false,
        filePath: '',
        errors
      };
    }
  }

  async reorganizeLibrary(): Promise<{
    moved: number;
    errors: string[];
    report: any;
  }> {
    console.log('🔄 Réorganisation de la bibliothèque...');
    
    const errors: string[] = [];
    let moved = 0;
    const report = {
      totalEffects: 0,
      categoriesCreated: 0,
      duplicatesFound: 0,
      orphanedFiles: 0
    };
    
    try {
      const libraryPath = path.join(process.cwd(), 'effects-library');
      
      // Scanner tous les effets existants
      const allEffects = await this.scanAllEffects(libraryPath);
      report.totalEffects = allEffects.length;
      
      // Reclassifier et déplacer
      for (const effect of allEffects) {
        try {
          const classification = await this.classifyEffect(effect.data);
          const currentPath = effect.filePath;
          const newPath = this.buildStorageStructure(classification).effectPath;
          
          if (currentPath !== path.dirname(newPath)) {
            await this.moveEffect(effect, classification);
            moved++;
          }
          
        } catch (error) {
          errors.push(`Erreur avec ${effect.filePath}: ${error}`);
        }
      }
      
      // Nettoyer les dossiers vides
      await this.cleanupEmptyDirectories(libraryPath);
      
      // Régénérer tous les index
      await this.rebuildAllIndexes(libraryPath);
      
      console.log(`✅ Réorganisation terminée: ${moved} effets déplacés`);
      
    } catch (error) {
      errors.push(`Erreur générale: ${error}`);
    }
    
    return { moved, errors, report };
  }

  private analyzeContent(effectData: any): any {
    const content = `${effectData.name} ${effectData.description}`.toLowerCase();
    const analysis = {
      keywords: this.extractKeywords(content),
      concepts: effectData.concepts || [],
      technicalTerms: this.extractTechnicalTerms(content),
      visualElements: this.extractVisualElements(content),
      temporalAspects: this.extractTemporalAspects(content),
      emotionalTone: this.extractEmotionalTone(content)
    };
    
    return analysis;
  }

  private determinePrimaryCategory(analysis: any): string {
    const scores: Record<string, number> = {};
    
    // Calculer les scores pour chaque catégorie
    for (const [category, rules] of this.classificationRules) {
      scores[category] = this.calculateCategoryScore(analysis, rules);
    }
    
    // Retourner la catégorie avec le score le plus élevé
    const bestCategory = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];
    
    return bestCategory || 'GENERAL';
  }

  private determineSubCategories(analysis: any, primaryCategory: string): string[] {
    const subCategories: string[] = [];
    
    // Sous-catégories basées sur l'analyse détaillée
    if (analysis.technicalTerms.length > 3) {
      subCategories.push('ADVANCED');
    }
    
    if (analysis.temporalAspects.length > 0) {
      subCategories.push('TEMPORAL');
    }
    
    if (analysis.visualElements.includes('3d') || analysis.visualElements.includes('depth')) {
      subCategories.push('3D');
    }
    
    return subCategories.length > 0 ? subCategories : ['BASIC'];
  }

  private calculateConfidence(analysis: any, category: string): number {
    const rules = this.classificationRules.get(category);
    if (!rules) return 0.5;
    
    const score = this.calculateCategoryScore(analysis, rules);
    return Math.min(score / 10, 1.0); // Normaliser entre 0 et 1
  }

  private calculateCategoryScore(analysis: any, rules: any): number {
    let score = 0;
    
    // Score basé sur les mots-clés
    for (const keyword of analysis.keywords) {
      if (rules.keywords?.includes(keyword)) {
        score += 2;
      }
    }
    
    // Score basé sur les concepts
    for (const concept of analysis.concepts) {
      if (rules.concepts?.includes(concept)) {
        score += 3;
      }
    }
    
    // Score basé sur les termes techniques
    for (const term of analysis.technicalTerms) {
      if (rules.technicalTerms?.includes(term)) {
        score += 1.5;
      }
    }
    
    return score;
  }

  private generateStoragePath(category: string, subCategory?: string): string {
    const basePath = path.join('effects-library', category);
    
    if (subCategory && subCategory !== 'BASIC') {
      return path.join(basePath, subCategory);
    }
    
    return basePath;
  }

  private buildStorageStructure(classification: ClassificationResult): StorageStructure {
    const rootPath = path.join(process.cwd(), 'effects-library');
    const categoryPath = path.join(rootPath, classification.primaryCategory);
    
    let effectPath = categoryPath;
    let subCategoryPath: string | undefined;
    
    if (classification.subCategories.length > 0 && classification.subCategories[0] !== 'BASIC') {
      subCategoryPath = path.join(categoryPath, classification.subCategories[0]);
      effectPath = subCategoryPath;
    }
    
    return {
      rootPath,
      categoryPath,
      subCategoryPath,
      effectPath
    };
  }

  private async ensureDirectoryStructure(structure: StorageStructure): Promise<void> {
    await fs.mkdir(structure.rootPath, { recursive: true });
    await fs.mkdir(structure.categoryPath, { recursive: true });
    
    if (structure.subCategoryPath) {
      await fs.mkdir(structure.subCategoryPath, { recursive: true });
    }
    
    await fs.mkdir(structure.effectPath, { recursive: true });
  }

  private async updateIndexes(structure: StorageStructure, effectData: any, classification: ClassificationResult): Promise<void> {
    // Mettre à jour l'index de catégorie
    await this.updateCategoryIndex(structure.categoryPath, effectData, classification);
    
    // Mettre à jour l'index de sous-catégorie si nécessaire
    if (structure.subCategoryPath) {
      await this.updateSubCategoryIndex(structure.subCategoryPath, effectData, classification);
    }
    
    // Mettre à jour l'index global
    await this.updateGlobalIndex(structure.rootPath, effectData, classification);
  }

  private async updateCategoryIndex(categoryPath: string, effectData: any, classification: ClassificationResult): Promise<void> {
    const indexPath = path.join(categoryPath, 'category-index.json');
    
    let index: any = {
      category: classification.primaryCategory,
      totalEffects: 0,
      subCategories: [],
      effects: [],
      lastUpdated: new Date().toISOString()
    };
    
    try {
      if (await this.fileExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf-8');
        index = JSON.parse(content);
      }
    } catch (error) {
      console.warn('Impossible de charger l\'index de catégorie, création d\'un nouveau');
    }
    
    // Ajouter l'effet
    const effectEntry = {
      id: effectData.id,
      name: effectData.name,
      description: effectData.description?.slice(0, 100) + '...' || '',
      complexity: classification.metadata.complexity,
      confidence: classification.confidence,
      tags: classification.metadata.tags,
      storedAt: new Date().toISOString()
    };
    
    index.effects.push(effectEntry);
    index.totalEffects = index.effects.length;
    index.lastUpdated = new Date().toISOString();
    
    // Ajouter la sous-catégorie si elle n'existe pas
    if (classification.subCategories.length > 0) {
      const subCat = classification.subCategories[0];
      if (!index.subCategories.includes(subCat)) {
        index.subCategories.push(subCat);
      }
    }
    
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  private async updateSubCategoryIndex(subCategoryPath: string, effectData: any, classification: ClassificationResult): Promise<void> {
    const indexPath = path.join(subCategoryPath, 'subcategory-index.json');
    
    let index: any = {
      subCategory: classification.subCategories[0],
      parentCategory: classification.primaryCategory,
      totalEffects: 0,
      effects: [],
      lastUpdated: new Date().toISOString()
    };
    
    try {
      if (await this.fileExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf-8');
        index = JSON.parse(content);
      }
    } catch (error) {
      console.warn('Création d\'un nouvel index de sous-catégorie');
    }
    
    const effectEntry = {
      id: effectData.id,
      name: effectData.name,
      complexity: classification.metadata.complexity,
      confidence: classification.confidence
    };
    
    index.effects.push(effectEntry);
    index.totalEffects = index.effects.length;
    index.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  private async updateGlobalIndex(rootPath: string, effectData: any, classification: ClassificationResult): Promise<void> {
    const globalIndexPath = path.join(rootPath, 'global-index.json');
    
    let globalIndex: any = {
      totalEffects: 0,
      categories: [],
      classifications: {},
      stats: {
        avgComplexity: 0,
        avgConfidence: 0,
        platformDistribution: {},
        categoryDistribution: {}
      },
      lastUpdated: new Date().toISOString()
    };
    
    try {
      if (await this.fileExists(globalIndexPath)) {
        const content = await fs.readFile(globalIndexPath, 'utf-8');
        globalIndex = JSON.parse(content);
      }
    } catch (error) {
      console.warn('Création d\'un nouvel index global');
    }
    
    // Mettre à jour les statistiques
    globalIndex.totalEffects++;
    
    if (!globalIndex.categories.includes(classification.primaryCategory)) {
      globalIndex.categories.push(classification.primaryCategory);
    }
    
    // Distribution des catégories
    const catDist = globalIndex.stats.categoryDistribution;
    catDist[classification.primaryCategory] = (catDist[classification.primaryCategory] || 0) + 1;
    
    // Distribution des plateformes
    const platDist = globalIndex.stats.platformDistribution;
    for (const platform of classification.metadata.platform) {
      platDist[platform] = (platDist[platform] || 0) + 1;
    }
    
    globalIndex.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(globalIndexPath, JSON.stringify(globalIndex, null, 2));
  }

  private async createSearchMetadata(structure: StorageStructure, effectData: any, classification: ClassificationResult): Promise<void> {
    const searchMetaPath = path.join(structure.effectPath, `${effectData.id}_search.json`);
    
    const searchData = {
      id: effectData.id,
      name: effectData.name,
      searchTerms: [
        ...classification.metadata.tags,
        classification.primaryCategory.toLowerCase(),
        ...(effectData.keywords || []),
        ...(classification.subCategories.map((s: string) => s.toLowerCase()))
      ],
      fullText: `${effectData.name} ${effectData.description}`.toLowerCase(),
      classification,
      lastIndexed: new Date().toISOString()
    };
    
    await fs.writeFile(searchMetaPath, JSON.stringify(searchData, null, 2));
  }

  // Méthodes utilitaires
  private extractKeywords(content: string): string[] {
    return content.match(/\b\w{4,}\b/g)?.slice(0, 20) || [];
  }

  private extractTechnicalTerms(content: string): string[] {
    const technicalTerms = ['shader', 'gpu', 'opengl', 'webgl', 'canvas', 'buffer', 'texture', 'vertex', 'fragment'];
    return technicalTerms.filter(term => content.includes(term));
  }

  private extractVisualElements(content: string): string[] {
    const visualElements = ['color', 'light', 'shadow', 'particle', 'explosion', 'glow', 'blur', 'distortion'];
    return visualElements.filter(element => content.includes(element));
  }

  private extractTemporalAspects(content: string): string[] {
    const temporalTerms = ['time', 'duration', 'speed', 'slow', 'fast', 'pause', 'loop', 'delay'];
    return temporalTerms.filter(term => content.includes(term));
  }

  private extractEmotionalTone(content: string): string[] {
    const emotionalTerms = ['intense', 'subtle', 'dramatic', 'smooth', 'aggressive', 'gentle', 'powerful'];
    return emotionalTerms.filter(term => content.includes(term));
  }

  private determineEffectType(analysis: any): string {
    if (analysis.visualElements.includes('particle')) return 'PARTICLE';
    if (analysis.visualElements.includes('light')) return 'LIGHTING';
    if (analysis.concepts.includes('morphing')) return 'MORPHING';
    if (analysis.technicalTerms.includes('physics')) return 'PHYSICS';
    return 'VISUAL';
  }

  private estimateComplexity(analysis: any): number {
    let complexity = 1;
    complexity += analysis.technicalTerms.length * 0.5;
    complexity += analysis.concepts.length * 0.3;
    complexity += analysis.visualElements.length * 0.2;
    return Math.min(Math.max(Math.round(complexity), 1), 10);
  }

  private determinePlatforms(analysis: any): string[] {
    const platforms = ['javascript', 'web'];
    
    if (analysis.technicalTerms.includes('webgl')) {
      platforms.push('webgl');
    }
    if (analysis.technicalTerms.includes('canvas')) {
      platforms.push('canvas');
    }
    
    return platforms;
  }

  private generateTags(analysis: any, category: string): string[] {
    return [
      ...analysis.keywords.slice(0, 5),
      category.toLowerCase(),
      ...analysis.visualElements.slice(0, 3),
      ...analysis.concepts.slice(0, 3)
    ].filter((tag, index, self) => self.indexOf(tag) === index);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async scanAllEffects(libraryPath: string): Promise<any[]> {
    // Implementation pour scanner tous les effets existants
    const effects: any[] = [];
    // Code de scan récursif...
    return effects;
  }

  private async moveEffect(effect: any, classification: ClassificationResult): Promise<void> {
    // Implementation pour déplacer un effet
    // Code de déplacement...
  }

  private async cleanupEmptyDirectories(libraryPath: string): Promise<void> {
    // Implementation pour nettoyer les dossiers vides
    // Code de nettoyage...
  }

  private async rebuildAllIndexes(libraryPath: string): Promise<void> {
    // Implementation pour régénérer tous les index
    // Code de reconstruction...
  }

  private initializeClassificationRules(): void {
    this.classificationRules.set('MANIPULATION_TEMPORELLE', {
      keywords: ['temps', 'time', 'chronos', 'temporal', 'vitesse', 'speed', 'ralenti', 'accélé'],
      concepts: ['time-warp', 'chronos', 'temporal-shift', 'speed-change'],
      technicalTerms: ['timeline', 'framerate', 'interpolation']
    });
    
    this.classificationRules.set('PARTICULES', {
      keywords: ['particule', 'particle', 'emission', 'dispersion', 'nuage', 'cloud'],
      concepts: ['particle-system', 'emission', 'physics-simulation'],
      technicalTerms: ['emitter', 'physics', 'collision']
    });
    
    this.classificationRules.set('LUMIERE_OMBRE', {
      keywords: ['lumiere', 'light', 'ombre', 'shadow', 'eclairage', 'illumination'],
      concepts: ['lighting-engine', 'shadow-casting', 'illumination'],
      technicalTerms: ['shader', 'lighting', 'ray-tracing']
    });
    
    // Ajouter d'autres règles...
  }

  private initializeStorageStructure(): void {
    this.storageStructure.set('MANIPULATION_TEMPORELLE', 'temporal-effects');
    this.storageStructure.set('PARTICULES', 'particle-effects');
    this.storageStructure.set('LUMIERE_OMBRE', 'lighting-effects');
    // Ajouter d'autres mappings...
  }
}

export const classificationStorageModule = new ClassificationStorageModule();
