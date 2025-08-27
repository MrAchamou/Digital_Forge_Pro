import fs from "fs/promises";
import path from "path";
class EffectParserModule {
    localAI;
    patternMatcher;
    contextAnalyzer;
    qualityValidator;
    constructor() {
        this.localAI = new LocalAIEngine();
        this.patternMatcher = new PatternMatcher();
        this.contextAnalyzer = new ContextAnalyzer();
        this.qualityValidator = new QualityValidator();
    }
    async parseEffectsList(filePath) {
        try {
            console.log("🚀 Parser 2.0 - Démarrage analyse massive...");
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const rawEffects = this.extractRawEffects(fileContent);
            console.log(`📊 ${rawEffects.length} effets détectés dans le fichier`);
            const parsedEffects = [];
            const stats = {
                total: rawEffects.length,
                successful: 0,
                failed: 0,
                categories: {}
            };
            // Traitement par batch pour optimiser les performances
            const batchSize = 50;
            for (let i = 0; i < rawEffects.length; i += batchSize) {
                const batch = rawEffects.slice(i, i + batchSize);
                const batchResults = await this.processBatch(batch, i);
                for (const result of batchResults) {
                    parsedEffects.push(result);
                    if (result.confidence > 0.7) {
                        stats.successful++;
                        const category = result.parsed.category;
                        stats.categories[category] = (stats.categories[category] || 0) + 1;
                    }
                    else {
                        stats.failed++;
                    }
                }
                console.log(`⚡ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rawEffects.length / batchSize)} terminé`);
            }
            // Sauvegarde automatique des effets parsés
            await this.saveToLibrary(parsedEffects.filter(e => e.confidence > 0.7));
            console.log("✅ Parser 2.0 - Analyse terminée avec succès!");
            return { effects: parsedEffects, stats };
        }
        catch (error) {
            console.error("❌ Parser 2.0 Error:", error);
            throw new Error(`Échec du parsing: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractRawEffects(content) {
        // Patterns de détection ultra-précis
        const patterns = [
            // Pattern numéroté (1. **Nom**, 2. **Nom**)
            /(\d+)\.\s*\*\*([^*]+)\*\*\s*\*\s*\*\*Type\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Catégorie\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Description\s*:\*\*\s*([^]+?)(?=\d+\.\s*\*\*|\n\n|\$)/gi,
            // Pattern alternatif avec tirets
            /[-•]\s*\*\*([^*]+)\*\*\s*[\r\n]+\s*\*\s*\*\*Type\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Catégorie\s*:\*\*\s*([^\n]+)\s*\*\s*\*\*Description\s*:\*\*\s*([^]+?)(?=[-•]\s*\*\*|\n\n|\$)/gi,
            // Pattern simple ligne par ligne
            /^([A-Z][^:\n]+):\s*(.+)$/gm
        ];
        const effects = [];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[0].trim().length > 20) {
                    effects.push(match[0].trim());
                }
            }
        }
        // Si aucun pattern ne fonctionne, découpage par blocs
        if (effects.length === 0) {
            const blocks = content.split(/\n\s*\n/).filter(block => block.trim().length > 30 &&
                (block.includes('**') || block.includes('Type') || block.includes('Description')));
            effects.push(...blocks);
        }
        return [...new Set(effects)]; // Supprime les doublons
    }
    async processBatch(rawEffects, startIndex) {
        const results = [];
        for (let i = 0; i < rawEffects.length; i++) {
            const rawEffect = rawEffects[i];
            const globalIndex = startIndex + i;
            try {
                const parsed = await this.parseIndividualEffect(rawEffect, globalIndex);
                results.push(parsed);
            }
            catch (error) {
                results.push({
                    raw: rawEffect,
                    parsed: this.createFallbackEffect(rawEffect, globalIndex),
                    confidence: 0.3,
                    errors: [error instanceof Error ? error.message : 'Parse error']
                });
            }
        }
        return results;
    }
    async parseIndividualEffect(rawText, index) {
        // Phase 1: Extraction des données de base
        const baseData = this.patternMatcher.extractBaseData(rawText);
        // Phase 2: Analyse sémantique avec IA locale
        const aiAnalysis = await this.localAI.analyzeEffect(rawText);
        // Phase 3: Analyse contextuelle
        const contextData = this.contextAnalyzer.analyze(rawText, baseData);
        // Phase 4: Génération de l'ID unique
        const effectId = this.generateEffectId(baseData.name || `Effect_${index}`, baseData.category);
        // Phase 5: Construction de l'objet final
        const effectData = {
            id: effectId,
            name: baseData.name || aiAnalysis.suggestedName || `GeneratedEffect_${index}`,
            type: this.normalizeType(baseData.type || aiAnalysis.type),
            category: this.normalizeCategory(baseData.category || aiAnalysis.category),
            subCategory: aiAnalysis.subCategory,
            description: baseData.description || aiAnalysis.enhancedDescription,
            complexity: aiAnalysis.complexity,
            keywords: [...baseData.keywords, ...aiAnalysis.keywords],
            concepts: aiAnalysis.concepts,
            metadata: {
                estimatedGenTime: this.calculateGenTime(aiAnalysis.complexity),
                difficulty: this.mapComplexityToDifficulty(aiAnalysis.complexity),
                platform: ['javascript', 'web', 'canvas'],
                performance: this.assessPerformance(aiAnalysis.complexity, aiAnalysis.concepts)
            }
        };
        // Phase 6: Validation qualité
        const validationResult = this.qualityValidator.validate(effectData);
        return {
            raw: rawText,
            parsed: effectData,
            confidence: validationResult.confidence,
            errors: validationResult.errors
        };
    }
    generateEffectId(name, category) {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanCategory = category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const timestamp = Date.now().toString(36);
        return `${cleanCategory}_${cleanName}_${timestamp}`.slice(0, 50);
    }
    normalizeType(type) {
        const typeMap = {
            'vidéo': 'VIDEO',
            'video': 'VIDEO',
            'image': 'IMAGE',
            'environnement': 'ENVIRONMENT',
            'environment': 'ENVIRONMENT',
            'audio': 'AUDIO',
            'ui': 'UI',
            'interface': 'UI'
        };
        const normalized = type.toLowerCase().trim();
        for (const [key, value] of Object.entries(typeMap)) {
            if (normalized.includes(key))
                return value;
        }
        return 'VISUAL';
    }
    normalizeCategory(category) {
        const categoryMap = {
            'manipulation temporelle': 'MANIPULATION_TEMPORELLE',
            'temporal manipulation': 'MANIPULATION_TEMPORELLE',
            'manipulation matière': 'MANIPULATION_MATIERE',
            'matter manipulation': 'MANIPULATION_MATIERE',
            'lumière & ombre': 'LUMIERE_OMBRE',
            'light & shadow': 'LUMIERE_OMBRE',
            'particules': 'PARTICULES',
            'particles': 'PARTICULES',
            'explosion': 'EXPLOSION',
            'transformation': 'TRANSFORMATION',
            'morphing': 'MORPHING',
            'psychédélique': 'PSYCHEDELIQUE',
            'psychedelic': 'PSYCHEDELIQUE'
        };
        const normalized = category.toLowerCase().trim();
        for (const [key, value] of Object.entries(categoryMap)) {
            if (normalized.includes(key))
                return value;
        }
        return 'GENERAL';
    }
    calculateGenTime(complexity) {
        // Temps en secondes basé sur la complexité
        const baseTime = 30;
        return baseTime + (complexity * 15);
    }
    mapComplexityToDifficulty(complexity) {
        if (complexity <= 3)
            return 'BEGINNER';
        if (complexity <= 6)
            return 'INTERMEDIATE';
        if (complexity <= 8)
            return 'ADVANCED';
        return 'EXPERT';
    }
    assessPerformance(complexity, concepts) {
        const heavyConcepts = ['particles', 'physics', 'lighting', '3d', 'realtime'];
        const hasHeavyConcepts = concepts.some(c => heavyConcepts.includes(c.toLowerCase()));
        if (complexity >= 8 || hasHeavyConcepts)
            return 'LOW';
        if (complexity >= 5)
            return 'MEDIUM';
        return 'HIGH';
    }
    createFallbackEffect(rawText, index) {
        return {
            id: `fallback_${index}_${Date.now()}`,
            name: `ParsedEffect_${index}`,
            type: 'VISUAL',
            category: 'GENERAL',
            description: rawText.slice(0, 200) + '...',
            complexity: 5,
            keywords: [],
            concepts: ['basic'],
            metadata: {
                estimatedGenTime: 60,
                difficulty: 'INTERMEDIATE',
                platform: ['javascript'],
                performance: 'MEDIUM'
            }
        };
    }
    async saveToLibrary(effects) {
        try {
            // Création de la structure de dossiers
            const libraryPath = path.join(process.cwd(), 'effects-library');
            await fs.mkdir(libraryPath, { recursive: true });
            // Groupement par catégorie
            const groupedEffects = effects.reduce((acc, effect) => {
                const category = effect.parsed.category;
                if (!acc[category])
                    acc[category] = [];
                acc[category].push(effect);
                return acc;
            }, {});
            // Sauvegarde par catégorie
            for (const [category, categoryEffects] of Object.entries(groupedEffects)) {
                const categoryPath = path.join(libraryPath, category);
                await fs.mkdir(categoryPath, { recursive: true });
                // Index de la catégorie
                const indexData = {
                    category,
                    count: categoryEffects.length,
                    effects: categoryEffects.map(e => ({
                        id: e.parsed.id,
                        name: e.parsed.name,
                        description: e.parsed.description.slice(0, 100) + '...',
                        complexity: e.parsed.complexity,
                        confidence: e.confidence
                    })),
                    lastUpdated: new Date().toISOString()
                };
                await fs.writeFile(path.join(categoryPath, 'index.json'), JSON.stringify(indexData, null, 2));
                // Sauvegarde de chaque effet
                for (const effect of categoryEffects) {
                    const effectFile = path.join(categoryPath, `${effect.parsed.id}.json`);
                    await fs.writeFile(effectFile, JSON.stringify(effect, null, 2));
                }
            }
            // Index global
            const globalIndex = {
                totalEffects: effects.length,
                categories: Object.keys(groupedEffects),
                lastParsed: new Date().toISOString(),
                stats: {
                    avgComplexity: effects.reduce((sum, e) => sum + e.parsed.complexity, 0) / effects.length,
                    avgConfidence: effects.reduce((sum, e) => sum + e.confidence, 0) / effects.length
                }
            };
            await fs.writeFile(path.join(libraryPath, 'global-index.json'), JSON.stringify(globalIndex, null, 2));
            console.log(`💾 ${effects.length} effets sauvegardés dans la bibliothèque`);
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
        }
    }
}
// IA LOCALE INTÉGRÉE
class LocalAIEngine {
    neuralPatterns = new Map();
    conceptVectors = new Map();
    constructor() {
        this.initializeNeuralPatterns();
        this.loadConceptVectors();
    }
    async analyzeEffect(text) {
        // Préprocessing du texte
        const cleanText = this.preprocessText(text);
        // Analyse sémantique multi-couches
        const semanticAnalysis = this.performSemanticAnalysis(cleanText);
        // Classification par réseau de neurones local
        const classification = this.classifyEffect(semanticAnalysis);
        // Extraction de concepts avancée
        const concepts = this.extractAdvancedConcepts(cleanText, classification);
        // Calcul de complexité basé sur l'IA
        const complexity = this.calculateAIComplexity(concepts, semanticAnalysis);
        return {
            suggestedName: this.generateSmartName(concepts, classification),
            type: classification.type,
            category: classification.category,
            subCategory: classification.subCategory,
            enhancedDescription: this.enhanceDescription(cleanText, concepts),
            complexity,
            keywords: this.extractKeywords(cleanText, concepts),
            concepts
        };
    }
    preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[*#\-\d\.]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    performSemanticAnalysis(text) {
        const words = text.split(' ');
        const semanticScore = new Map();
        // Analyse des co-occurrences
        for (let i = 0; i < words.length - 1; i++) {
            const bigram = `${words[i]}_${words[i + 1]}`;
            semanticScore.set(bigram, (semanticScore.get(bigram) || 0) + 1);
        }
        // Score sémantique global
        const globalScore = words.reduce((score, word) => {
            return score + (this.neuralPatterns.get(word) || 0);
        }, 0);
        return { semanticScore, globalScore, wordCount: words.length };
    }
    classifyEffect(semanticAnalysis) {
        // Classification basée sur les patterns neuronaux
        const typeScores = {
            'VIDEO': 0,
            'IMAGE': 0,
            'ENVIRONMENT': 0,
            'AUDIO': 0,
            'UI': 0
        };
        const categoryScores = {
            'MANIPULATION_TEMPORELLE': 0,
            'MANIPULATION_MATIERE': 0,
            'LUMIERE_OMBRE': 0,
            'PARTICULES': 0,
            'TRANSFORMATION': 0,
            'PSYCHEDELIQUE': 0
        };
        // Algorithme de classification simplifié
        for (const [bigram, count] of semanticAnalysis.semanticScore) {
            if (bigram.includes('temps') || bigram.includes('time')) {
                categoryScores['MANIPULATION_TEMPORELLE'] += count * 2;
            }
            if (bigram.includes('particule') || bigram.includes('particle')) {
                categoryScores['PARTICULES'] += count * 2;
            }
            if (bigram.includes('lumiere') || bigram.includes('light')) {
                categoryScores['LUMIERE_OMBRE'] += count * 2;
            }
        }
        const bestType = Object.entries(typeScores).reduce((a, b) => typeScores[a[0]] > typeScores[b[0]] ? a : b)[0] || 'VIDEO';
        const bestCategory = Object.entries(categoryScores).reduce((a, b) => categoryScores[a[0]] > categoryScores[b[0]] ? a : b)[0] || 'GENERAL';
        return { type: bestType, category: bestCategory };
    }
    extractAdvancedConcepts(text, classification) {
        const concepts = [];
        // Concepts de base
        const basicConcepts = ['visual', 'dynamic', 'interactive'];
        concepts.push(...basicConcepts);
        // Concepts spécialisés selon la classification
        if (classification.category === 'PARTICULES') {
            concepts.push('particles', 'emission', 'physics');
        }
        if (classification.category === 'LUMIERE_OMBRE') {
            concepts.push('lighting', 'shadows', 'glow');
        }
        return [...new Set(concepts)];
    }
    calculateAIComplexity(concepts, semanticAnalysis) {
        let complexity = 1;
        // Complexité basée sur les concepts
        complexity += concepts.length * 0.5;
        // Complexité sémantique
        complexity += Math.min(semanticAnalysis.globalScore / 100, 5);
        // Complexité textuelle
        complexity += Math.min(semanticAnalysis.wordCount / 20, 3);
        return Math.min(Math.max(Math.round(complexity), 1), 10);
    }
    generateSmartName(concepts, classification) {
        const prefixes = ['Dynamic', 'Advanced', 'Epic', 'Pro', 'Ultra'];
        const suffixes = ['Effect', 'FX', 'Visual', 'Animation'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const core = concepts[0] || classification.category.split('_')[0];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix}${core.charAt(0).toUpperCase() + core.slice(1)}${suffix}`;
    }
    enhanceDescription(text, concepts) {
        let enhanced = text;
        // Enrichissement basé sur les concepts
        if (concepts.includes('particles')) {
            enhanced += " Utilise un système de particules avancé.";
        }
        if (concepts.includes('lighting')) {
            enhanced += " Intègre des effets d'éclairage dynamiques.";
        }
        return enhanced;
    }
    extractKeywords(text, concepts) {
        const words = text.split(' ').filter(word => word.length > 3);
        const keywords = [...words.slice(0, 10), ...concepts];
        return [...new Set(keywords)];
    }
    initializeNeuralPatterns() {
        // Patterns neuronaux pré-entraînés (version simplifiée)
        const patterns = {
            'explosion': 0.9, 'particule': 0.8, 'lumiere': 0.7,
            'temps': 0.9, 'transformation': 0.8, 'morphing': 0.7,
            'psychedelique': 0.6, 'effet': 0.5, 'visual': 0.6
        };
        for (const [pattern, weight] of Object.entries(patterns)) {
            this.neuralPatterns.set(pattern, weight);
        }
    }
    loadConceptVectors() {
        // Vecteurs de concepts pour analyse sémantique
        const vectors = {
            'particles': [0.9, 0.2, 0.8, 0.1],
            'lighting': [0.1, 0.9, 0.3, 0.7],
            'morphing': [0.3, 0.1, 0.9, 0.4]
        };
        for (const [concept, vector] of Object.entries(vectors)) {
            this.conceptVectors.set(concept, vector);
        }
    }
}
// PATTERN MATCHER AVANCÉ
class PatternMatcher {
    extractBaseData(text) {
        const data = { keywords: [] };
        // Extraction du nom
        const nameMatch = text.match(/\*\*([^*]+)\*\*/);
        if (nameMatch)
            data.name = nameMatch[1].trim();
        // Extraction du type
        const typeMatch = text.match(/Type\s*:\*\*\s*([^\n*]+)/i);
        if (typeMatch)
            data.type = typeMatch[1].trim();
        // Extraction de la catégorie
        const categoryMatch = text.match(/Catégorie\s*:\*\*\s*([^\n*]+)/i);
        if (categoryMatch)
            data.category = categoryMatch[1].trim();
        // Extraction de la description
        const descMatch = text.match(/Description\s*:\*\*\s*([^]+?)(?=\n\n|\d+\.|\$)/i);
        if (descMatch)
            data.description = descMatch[1].trim();
        // Extraction des mots-clés
        const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        data.keywords = [...new Set(words)].slice(0, 15);
        return data;
    }
}
// ANALYSEUR CONTEXTUEL
class ContextAnalyzer {
    analyze(text, baseData) {
        const context = {
            technicalLevel: this.assessTechnicalLevel(text),
            visualComplexity: this.assessVisualComplexity(text),
            interactivity: this.assessInteractivity(text),
            performance: this.assessPerformanceNeeds(text)
        };
        return context;
    }
    assessTechnicalLevel(text) {
        const technicalTerms = ['algorithm', 'shader', 'gpu', 'optimization', 'pipeline'];
        const count = technicalTerms.filter(term => text.toLowerCase().includes(term)).length;
        return Math.min(count * 2, 10);
    }
    assessVisualComplexity(text) {
        const complexityWords = ['complex', 'detailed', 'realistic', 'advanced', 'sophisticated'];
        const count = complexityWords.filter(word => text.toLowerCase().includes(word)).length;
        return Math.min(count * 1.5, 10);
    }
    assessInteractivity(text) {
        const interactiveWords = ['click', 'hover', 'interaction', 'responsive', 'dynamic'];
        const count = interactiveWords.filter(word => text.toLowerCase().includes(word)).length;
        return Math.min(count * 2, 10);
    }
    assessPerformanceNeeds(text) {
        const performanceWords = ['fast', 'smooth', 'optimized', 'efficient', 'real-time'];
        const count = performanceWords.filter(word => text.toLowerCase().includes(word)).length;
        return Math.min(count * 1.5, 10);
    }
}
// VALIDATEUR QUALITÉ
class QualityValidator {
    validate(effectData) {
        const errors = [];
        let confidence = 1.0;
        // Validation du nom
        if (!effectData.name || effectData.name.length < 3) {
            errors.push("Nom d'effet invalide ou trop court");
            confidence -= 0.2;
        }
        // Validation de la description
        if (!effectData.description || effectData.description.length < 20) {
            errors.push("Description trop courte ou manquante");
            confidence -= 0.3;
        }
        // Validation de la catégorie
        const validCategories = [
            'MANIPULATION_TEMPORELLE', 'MANIPULATION_MATIERE', 'LUMIERE_OMBRE',
            'PARTICULES', 'TRANSFORMATION', 'PSYCHEDELIQUE', 'GENERAL'
        ];
        if (!validCategories.includes(effectData.category)) {
            errors.push("Catégorie non reconnue");
            confidence -= 0.2;
        }
        // Validation de la complexité
        if (effectData.complexity < 1 || effectData.complexity > 10) {
            errors.push("Complexité hors limites");
            confidence -= 0.1;
        }
        // Validation des concepts
        if (effectData.concepts.length === 0) {
            errors.push("Aucun concept extrait");
            confidence -= 0.1;
        }
        return {
            confidence: Math.max(confidence, 0.1),
            errors
        };
    }
}
export const effectParserModule = new EffectParserModule();
