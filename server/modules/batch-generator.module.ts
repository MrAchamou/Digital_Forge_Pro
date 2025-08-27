
import fs from "fs/promises";
import path from "path";
import { storage } from "../storage";

interface BatchGenerationRequest {
  effectType: string;
  category: string;
  count: number;
  baseParameters?: Record<string, any>;
}

interface GeneratedEffectData {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  complexity: number;
  keywords: string[];
  concepts: string[];
}

class BatchGeneratorModule {
  private patterns: Map<string, string[]> = new Map();
  private categories: Map<string, string[]> = new Map();
  private nameTemplates: Map<string, string[]> = new Map();
  
  constructor() {
    this.initializePatterns();
  }

  async generateEffects(request: BatchGenerationRequest): Promise<{
    generated: GeneratedEffectData[];
    duplicates: number;
    saved: number;
  }> {
    console.log(`🚀 Génération de ${request.count} effets de type ${request.effectType}/${request.category}`);
    
    const generated: GeneratedEffectData[] = [];
    let duplicates = 0;
    
    // Analyser la liste existante pour éviter les doublons
    const existingEffects = await this.loadExistingEffects();
    const existingSignatures = new Set(existingEffects.map(e => this.createSignature(e)));
    
    for (let i = 0; i < request.count; i++) {
      const effect = await this.generateSingleEffect(request, i);
      const signature = this.createSignature(effect);
      
      if (existingSignatures.has(signature)) {
        duplicates++;
        continue;
      }
      
      generated.push(effect);
      existingSignatures.add(signature);
    }
    
    // Sauvegarder les effets générés
    const saved = await this.saveGeneratedEffects(generated);
    
    console.log(`✅ Génération terminée: ${generated.length} créés, ${duplicates} doublons évités, ${saved} sauvegardés`);
    
    return { generated, duplicates, saved };
  }

  private async generateSingleEffect(request: BatchGenerationRequest, index: number): Promise<GeneratedEffectData> {
    const effectId = this.generateUniqueId(request.category, index);
    const name = this.generateEffectName(request.effectType, request.category, index);
    const description = this.generateDescription(request.effectType, request.category);
    const complexity = this.generateComplexity(request.category);
    const keywords = this.generateKeywords(request.effectType, request.category);
    const concepts = this.generateConcepts(request.effectType, request.category);
    
    return {
      id: effectId,
      name,
      type: request.effectType,
      category: request.category,
      description,
      complexity,
      keywords,
      concepts
    };
  }

  private generateUniqueId(category: string, index: number): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${category.toLowerCase()}_gen_${index}_${timestamp}_${randomStr}`;
  }

  private generateEffectName(type: string, category: string, index: number): string {
    const templates = this.nameTemplates.get(category) || this.nameTemplates.get('DEFAULT') || [];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const variations = ['Pro', 'Ultra', 'Epic', 'Advanced', 'Dynamic', 'Extreme', 'Master', 'Elite'];
    const variation = variations[Math.floor(Math.random() * variations.length)];
    
    return template
      .replace('{VARIATION}', variation)
      .replace('{INDEX}', (index + 1).toString())
      .replace('{TYPE}', type);
  }

  private generateDescription(type: string, category: string): string {
    const patterns = this.patterns.get(category) || this.patterns.get('DEFAULT') || [];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const intensities = ['subtil', 'modéré', 'intense', 'extrême', 'dramatique'];
    const durations = ['instantané', 'progressif', 'continu', 'pulsé', 'cyclique'];
    const directions = ['vers le haut', 'vers le bas', 'radialement', 'en spirale', 'de manière chaotique'];
    
    return pattern
      .replace('{INTENSITY}', intensities[Math.floor(Math.random() * intensities.length)])
      .replace('{DURATION}', durations[Math.floor(Math.random() * durations.length)])
      .replace('{DIRECTION}', directions[Math.floor(Math.random() * directions.length)]);
  }

  private generateComplexity(category: string): number {
    const complexityMap: Record<string, [number, number]> = {
      'MANIPULATION_TEMPORELLE': [7, 10],
      'MANIPULATION_MATIERE': [6, 9],
      'LUMIERE_OMBRE': [4, 7],
      'PARTICULES': [3, 8],
      'TRANSFORMATION': [5, 8],
      'PSYCHEDELIQUE': [6, 10],
      'EXPLOSION': [4, 7],
      'DEFAULT': [3, 6]
    };
    
    const [min, max] = complexityMap[category] || complexityMap['DEFAULT'];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateKeywords(type: string, category: string): string[] {
    const baseKeywords = ['effet', 'visual', 'animation', 'dynamique'];
    const typeKeywords = {
      'VIDEO': ['video', 'frame', 'timeline', 'sequence'],
      'IMAGE': ['image', 'static', 'photo', 'picture'],
      'ENVIRONMENT': ['environnement', 'scene', 'background', 'atmosphere']
    };
    
    const categoryKeywords = {
      'MANIPULATION_TEMPORELLE': ['temps', 'chronologie', 'temporal', 'vitesse'],
      'PARTICULES': ['particule', 'emission', 'dispersion', 'nuage'],
      'LUMIERE_OMBRE': ['lumiere', 'ombre', 'eclairage', 'brillance'],
      'EXPLOSION': ['explosion', 'deflagration', 'burst', 'impact']
    };
    
    return [
      ...baseKeywords,
      ...(typeKeywords[type as keyof typeof typeKeywords] || []),
      ...(categoryKeywords[category as keyof typeof categoryKeywords] || [])
    ].slice(0, 10);
  }

  private generateConcepts(type: string, category: string): string[] {
    const conceptMap: Record<string, string[]> = {
      'MANIPULATION_TEMPORELLE': ['time-warp', 'chronos', 'temporal-shift'],
      'PARTICULES': ['particle-system', 'emission', 'physics-simulation'],
      'LUMIERE_OMBRE': ['lighting-engine', 'shadow-casting', 'illumination'],
      'EXPLOSION': ['force-field', 'impact-wave', 'energy-burst'],
      'TRANSFORMATION': ['morphing', 'shape-shift', 'metamorphosis'],
      'PSYCHEDELIQUE': ['kaleidoscope', 'fractal', 'trippy-visual']
    };
    
    return conceptMap[category] || ['basic-effect', 'visual-enhancement'];
  }

  private createSignature(effect: GeneratedEffectData | any): string {
    const name = effect.name || effect.parsed?.name || '';
    const category = effect.category || effect.parsed?.category || '';
    const description = effect.description || effect.parsed?.description || '';
    
    return `${category}_${name.slice(0, 15)}_${description.slice(0, 25)}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }

  private async loadExistingEffects(): Promise<any[]> {
    try {
      const libraryPath = path.join(process.cwd(), 'effects-library');
      const globalIndexPath = path.join(libraryPath, 'global-index.json');
      
      if (await this.fileExists(globalIndexPath)) {
        const indexContent = await fs.readFile(globalIndexPath, 'utf-8');
        const index = JSON.parse(indexContent);
        
        // Charger tous les effets de toutes les catégories
        const allEffects: any[] = [];
        for (const category of index.categories || []) {
          const categoryPath = path.join(libraryPath, category);
          const categoryIndexPath = path.join(categoryPath, 'index.json');
          
          if (await this.fileExists(categoryIndexPath)) {
            const categoryContent = await fs.readFile(categoryIndexPath, 'utf-8');
            const categoryIndex = JSON.parse(categoryContent);
            allEffects.push(...categoryIndex.effects);
          }
        }
        
        return allEffects;
      }
    } catch (error) {
      console.warn("Impossible de charger les effets existants:", error);
    }
    
    return [];
  }

  private async saveGeneratedEffects(effects: GeneratedEffectData[]): Promise<number> {
    let saved = 0;
    
    try {
      const libraryPath = path.join(process.cwd(), 'effects-library');
      await fs.mkdir(libraryPath, { recursive: true });
      
      // Grouper par catégorie
      const groupedEffects = effects.reduce((acc, effect) => {
        if (!acc[effect.category]) acc[effect.category] = [];
        acc[effect.category].push(effect);
        return acc;
      }, {} as Record<string, GeneratedEffectData[]>);
      
      // Sauvegarder chaque catégorie
      for (const [category, categoryEffects] of Object.entries(groupedEffects)) {
        const categoryPath = path.join(libraryPath, category);
        await fs.mkdir(categoryPath, { recursive: true });
        
        // Sauvegarder chaque effet
        for (const effect of categoryEffects) {
          const effectFile = path.join(categoryPath, `${effect.id}.json`);
          await fs.writeFile(effectFile, JSON.stringify({
            raw: `Generated effect: ${effect.name}`,
            parsed: effect,
            confidence: 0.95,
            errors: [],
            generatedBy: 'BatchGeneratorModule',
            generatedAt: new Date().toISOString()
          }, null, 2));
          saved++;
        }
        
        // Mettre à jour l'index de la catégorie
        await this.updateCategoryIndex(category, categoryEffects);
      }
      
      // Mettre à jour l'index global
      await this.updateGlobalIndex(effects);
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
    
    return saved;
  }

  private async updateCategoryIndex(category: string, newEffects: GeneratedEffectData[]): Promise<void> {
    const categoryPath = path.join(process.cwd(), 'effects-library', category);
    const indexPath = path.join(categoryPath, 'index.json');
    
    let existingIndex: any = { category, count: 0, effects: [] };
    
    if (await this.fileExists(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf-8');
      existingIndex = JSON.parse(content);
    }
    
    // Ajouter les nouveaux effets
    const newIndexEffects = newEffects.map(effect => ({
      id: effect.id,
      name: effect.name,
      description: effect.description.slice(0, 100) + '...',
      complexity: effect.complexity,
      confidence: 0.95,
      generated: true
    }));
    
    existingIndex.effects.push(...newIndexEffects);
    existingIndex.count = existingIndex.effects.length;
    existingIndex.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(indexPath, JSON.stringify(existingIndex, null, 2));
  }

  private async updateGlobalIndex(newEffects: GeneratedEffectData[]): Promise<void> {
    const libraryPath = path.join(process.cwd(), 'effects-library');
    const globalIndexPath = path.join(libraryPath, 'global-index.json');
    
    let globalIndex: any = {
      totalEffects: 0,
      categories: [],
      lastParsed: new Date().toISOString(),
      stats: { avgComplexity: 0, avgConfidence: 0.95 }
    };
    
    if (await this.fileExists(globalIndexPath)) {
      const content = await fs.readFile(globalIndexPath, 'utf-8');
      globalIndex = JSON.parse(content);
    }
    
    globalIndex.totalEffects += newEffects.length;
    globalIndex.lastGenerated = new Date().toISOString();
    globalIndex.stats.generatedCount = (globalIndex.stats.generatedCount || 0) + newEffects.length;
    
    // Ajouter les nouvelles catégories
    const newCategories = [...new Set(newEffects.map(e => e.category))];
    for (const category of newCategories) {
      if (!globalIndex.categories.includes(category)) {
        globalIndex.categories.push(category);
      }
    }
    
    await fs.writeFile(globalIndexPath, JSON.stringify(globalIndex, null, 2));
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private initializePatterns(): void {
    // Patterns de description par catégorie
    this.patterns.set('MANIPULATION_TEMPORELLE', [
      'Un effet qui manipule le flux temporel de manière {INTENSITY}, créant une distorsion {DURATION} qui se propage {DIRECTION}.',
      'La timeline se fragmente {INTENSITY}, avec des segments temporels qui évoluent {DURATION} dans des rythmes différents.',
      'Un phénomène chronologique {INTENSITY} qui fait varier la vitesse de certains éléments {DURATION}.'
    ]);
    
    this.patterns.set('PARTICULES', [
      'Un système de particules {INTENSITY} qui génère des éléments {DURATION} se dispersant {DIRECTION}.',
      'Des particules énergétiques apparaissent {INTENSITY} et évoluent {DURATION} en créant des patterns complexes.',
      'Un flux de particules {INTENSITY} qui forme des structures {DURATION} évoluant dynamiquement.'
    ]);
    
    this.patterns.set('LUMIERE_OMBRE', [
      'Un jeu d\'éclairage {INTENSITY} qui modifie l\'atmosphère {DURATION} en projetant des ombres {DIRECTION}.',
      'Des faisceaux lumineux {INTENSITY} traversent la scène {DURATION} créant des contrastes dramatiques.',
      'Un effet d\'illumination {INTENSITY} qui révèle ou cache des éléments {DURATION}.'
    ]);
    
    this.patterns.set('EXPLOSION', [
      'Une déflagration {INTENSITY} qui propage une onde de choc {DURATION} déformant l\'espace {DIRECTION}.',
      'Un impact énergétique {INTENSITY} générant des fragments {DURATION} dispersés dans toutes les directions.',
      'Une explosion {INTENSITY} qui crée une perturbation {DURATION} de l\'environnement visuel.'
    ]);
    
    this.patterns.set('DEFAULT', [
      'Un effet visuel {INTENSITY} qui transforme l\'apparence {DURATION} des éléments de manière {DIRECTION}.',
      'Une animation {INTENSITY} qui modifie la perception {DURATION} de la scène.',
      'Un phénomène visuel {INTENSITY} créant une altération {DURATION} de l\'image.'
    ]);
    
    // Templates de noms par catégorie
    this.nameTemplates.set('MANIPULATION_TEMPORELLE', [
      '{VARIATION} Chronoshift {INDEX}',
      'Temporal {VARIATION} Wave',
      'Time {VARIATION} Distortion',
      '{VARIATION} Chronobreak',
      'Quantum {VARIATION} Flux'
    ]);
    
    this.nameTemplates.set('PARTICULES', [
      '{VARIATION} Particle Storm {INDEX}',
      'Quantum {VARIATION} Emission',
      '{VARIATION} Particle Flow',
      'Cosmic {VARIATION} Burst',
      'Energy {VARIATION} Cloud'
    ]);
    
    this.nameTemplates.set('LUMIERE_OMBRE', [
      '{VARIATION} Light Ray {INDEX}',
      'Shadow {VARIATION} Cast',
      '{VARIATION} Illumination',
      'Photonic {VARIATION} Beam',
      'Darkness {VARIATION} Veil'
    ]);
    
    this.nameTemplates.set('DEFAULT', [
      '{VARIATION} {TYPE} Effect {INDEX}',
      'Enhanced {VARIATION} Visual',
      '{VARIATION} Animation FX',
      'Dynamic {VARIATION} Transform'
    ]);
  }

  // Méthodes utilitaires pour l'interface
  getSupportedTypes(): string[] {
    return ['VIDEO', 'IMAGE', 'ENVIRONMENT', 'AUDIO', 'UI'];
  }

  getSupportedCategories(): string[] {
    return [
      'MANIPULATION_TEMPORELLE',
      'MANIPULATION_MATIERE',
      'LUMIERE_OMBRE',
      'PARTICULES',
      'TRANSFORMATION',
      'PSYCHEDELIQUE',
      'EXPLOSION',
      'ATMOSPHERIQUE',
      'DISTORSION',
      'GLITCH',
      'FIRE',
      'WATER',
      'EARTH',
      'AIR'
    ];
  }
}

export const batchGeneratorModule = new BatchGeneratorModule();
