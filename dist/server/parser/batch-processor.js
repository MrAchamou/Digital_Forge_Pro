import { effectParserModule } from "./effect-parser.module";
import path from "path";
import fs from "fs/promises";
class BatchProcessor {
    activeJobs = new Map();
    maxConcurrentJobs = 3;
    currentJobs = 0;
    async processMassiveEffectsList(filePath) {
        const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            filePath,
            status: 'PENDING',
            progress: 0
        };
        this.activeJobs.set(jobId, job);
        // Démarrage asynchrone du traitement
        this.processJobAsync(jobId);
        return jobId;
    }
    async processJobAsync(jobId) {
        const job = this.activeJobs.get(jobId);
        if (!job)
            return;
        try {
            // Vérification de la capacité
            if (this.currentJobs >= this.maxConcurrentJobs) {
                setTimeout(() => this.processJobAsync(jobId), 5000);
                return;
            }
            this.currentJobs++;
            job.status = 'PROCESSING';
            job.startTime = new Date();
            job.progress = 5;
            console.log(`🚀 [Batch ${jobId}] Démarrage du traitement massif`);
            // Vérification du fichier
            const fileExists = await this.verifyFile(job.filePath);
            if (!fileExists) {
                throw new Error(`Fichier non trouvé: ${job.filePath}`);
            }
            job.progress = 10;
            // Traitement principal avec le Parser 2.0
            console.log(`⚡ [Batch ${jobId}] Analyse avec Parser 2.0...`);
            const results = await effectParserModule.parseEffectsList(job.filePath);
            job.progress = 80;
            // Post-processing et optimisations
            await this.postProcessResults(results, jobId);
            job.progress = 95;
            // Génération du rapport final
            const report = await this.generateComprehensiveReport(results, jobId);
            job.results = {
                ...results,
                report,
                libraryPath: path.join(process.cwd(), 'effects-library'),
                totalProcessingTime: Date.now() - (job.startTime?.getTime() || 0)
            };
            job.progress = 100;
            job.status = 'COMPLETED';
            job.endTime = new Date();
            console.log(`✅ [Batch ${jobId}] Traitement terminé avec succès!`);
            console.log(`📊 ${results.stats.successful}/${results.stats.total} effets traités`);
        }
        catch (error) {
            job.status = 'FAILED';
            job.errors = [error instanceof Error ? error.message : 'Unknown error'];
            job.endTime = new Date();
            console.error(`❌ [Batch ${jobId}] Échec:`, error);
        }
        finally {
            this.currentJobs--;
        }
    }
    async verifyFile(filePath) {
        try {
            const stat = await fs.stat(filePath);
            return stat.isFile() && stat.size > 0;
        }
        catch {
            return false;
        }
    }
    async postProcessResults(results, jobId) {
        console.log(`🔧 [Batch ${jobId}] Post-processing des résultats...`);
        // Optimisation de la classification
        const categoryOptimization = this.optimizeCategories(results.effects);
        // Détection de doublons
        const duplicateDetection = this.detectDuplicates(results.effects);
        // Amélioration des métadonnées
        await this.enhanceMetadata(results.effects);
        // Indexation pour recherche rapide
        await this.createSearchIndexes(results.effects);
        console.log(`✨ [Batch ${jobId}] Post-processing terminé`);
    }
    optimizeCategories(effects) {
        // Réorganisation intelligente des catégories
        const categoryMap = new Map();
        effects.forEach(effect => {
            const category = effect.parsed.category;
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });
        // Fusion des catégories similaires
        effects.forEach(effect => {
            if (effect.parsed.category === 'GENERAL' && effect.parsed.concepts.includes('particles')) {
                effect.parsed.category = 'PARTICULES';
            }
        });
    }
    detectDuplicates(effects) {
        const duplicates = [];
        const seen = new Set();
        effects.forEach(effect => {
            const signature = this.createEffectSignature(effect);
            if (seen.has(signature)) {
                duplicates.push(effect);
            }
            else {
                seen.add(signature);
            }
        });
        return duplicates;
    }
    createEffectSignature(effect) {
        const { name, category, description } = effect.parsed;
        return `${category}_${name.slice(0, 10)}_${description.slice(0, 20)}`.toLowerCase();
    }
    async enhanceMetadata(effects) {
        for (const effect of effects) {
            // Ajout de tags automatiques
            effect.parsed.autoTags = this.generateAutoTags(effect.parsed);
            // Score de popularité prédictif
            effect.parsed.predictedPopularity = this.predictPopularity(effect.parsed);
            // Compatibilité plateforme
            effect.parsed.platformCompatibility = this.assessPlatformCompatibility(effect.parsed);
        }
    }
    generateAutoTags(effectData) {
        const tags = [];
        // Tags basés sur la complexité
        if (effectData.complexity <= 3)
            tags.push('simple', 'beginner-friendly');
        if (effectData.complexity >= 8)
            tags.push('advanced', 'complex');
        // Tags basés sur les concepts
        effectData.concepts.forEach((concept) => {
            tags.push(`concept-${concept}`);
        });
        // Tags basés sur la catégorie
        tags.push(`category-${effectData.category.toLowerCase()}`);
        return [...new Set(tags)];
    }
    predictPopularity(effectData) {
        let score = 5; // Score de base
        // Bonus pour certaines catégories populaires
        if (effectData.category === 'PARTICULES')
            score += 2;
        if (effectData.category === 'LUMIERE_OMBRE')
            score += 1.5;
        // Bonus pour complexité moyenne
        if (effectData.complexity >= 4 && effectData.complexity <= 7)
            score += 1;
        // Bonus pour performance élevée
        if (effectData.metadata.performance === 'HIGH')
            score += 1;
        return Math.min(Math.max(score, 1), 10);
    }
    assessPlatformCompatibility(effectData) {
        return {
            web: true,
            mobile: effectData.metadata.performance !== 'LOW',
            desktop: true,
            vr: effectData.category === 'PARTICULES' || effectData.category === 'LUMIERE_OMBRE',
            canvas: true,
            webgl: effectData.complexity >= 6
        };
    }
    async createSearchIndexes(effects) {
        const indexes = {
            byCategory: new Map(),
            byComplexity: new Map(),
            byKeywords: new Map(),
            byConcepts: new Map()
        };
        effects.forEach(effect => {
            const id = effect.parsed.id;
            // Index par catégorie
            const category = effect.parsed.category;
            if (!indexes.byCategory.has(category)) {
                indexes.byCategory.set(category, []);
            }
            indexes.byCategory.get(category).push(id);
            // Index par complexité
            const complexity = effect.parsed.complexity;
            if (!indexes.byComplexity.has(complexity)) {
                indexes.byComplexity.set(complexity, []);
            }
            indexes.byComplexity.get(complexity).push(id);
            // Index par mots-clés
            effect.parsed.keywords.forEach((keyword) => {
                if (!indexes.byKeywords.has(keyword)) {
                    indexes.byKeywords.set(keyword, []);
                }
                indexes.byKeywords.get(keyword).push(id);
            });
            // Index par concepts
            effect.parsed.concepts.forEach((concept) => {
                if (!indexes.byConcepts.has(concept)) {
                    indexes.byConcepts.set(concept, []);
                }
                indexes.byConcepts.get(concept).push(id);
            });
        });
        // Sauvegarde des indexes
        const indexPath = path.join(process.cwd(), 'effects-library', 'search-indexes.json');
        const indexData = {
            byCategory: Object.fromEntries(indexes.byCategory),
            byComplexity: Object.fromEntries(indexes.byComplexity),
            byKeywords: Object.fromEntries(indexes.byKeywords),
            byConcepts: Object.fromEntries(indexes.byConcepts),
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
    }
    async generateComprehensiveReport(results, jobId) {
        const report = {
            jobId,
            summary: {
                totalEffects: results.stats.total,
                successfullyParsed: results.stats.successful,
                failed: results.stats.failed,
                successRate: (results.stats.successful / results.stats.total * 100).toFixed(2) + '%'
            },
            categoryBreakdown: results.stats.categories,
            complexityDistribution: this.calculateComplexityDistribution(results.effects),
            topKeywords: this.extractTopKeywords(results.effects),
            qualityMetrics: this.calculateQualityMetrics(results.effects),
            recommendations: this.generateRecommendations(results),
            libraryStructure: await this.getLibraryStructure(),
            generatedAt: new Date().toISOString()
        };
        // Sauvegarde du rapport
        const reportPath = path.join(process.cwd(), 'effects-library', `report_${jobId}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        return report;
    }
    calculateComplexityDistribution(effects) {
        const distribution = Array(10).fill(0);
        effects.forEach(effect => {
            if (effect.confidence > 0.7) {
                const complexity = Math.min(effect.parsed.complexity - 1, 9);
                distribution[complexity]++;
            }
        });
        return distribution;
    }
    extractTopKeywords(effects) {
        const keywordCount = new Map();
        effects.forEach(effect => {
            if (effect.confidence > 0.7) {
                effect.parsed.keywords.forEach((keyword) => {
                    keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
                });
            }
        });
        return Array.from(keywordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(entry => entry[0]);
    }
    calculateQualityMetrics(effects) {
        const validEffects = effects.filter(e => e.confidence > 0.7);
        return {
            averageConfidence: validEffects.reduce((sum, e) => sum + e.confidence, 0) / validEffects.length,
            averageComplexity: validEffects.reduce((sum, e) => sum + e.parsed.complexity, 0) / validEffects.length,
            averageKeywords: validEffects.reduce((sum, e) => sum + e.parsed.keywords.length, 0) / validEffects.length,
            uniqueCategories: new Set(validEffects.map(e => e.parsed.category)).size
        };
    }
    generateRecommendations(results) {
        const recommendations = [];
        if (results.stats.failed > results.stats.successful * 0.2) {
            recommendations.push("Taux d'échec élevé - considérer l'amélioration des patterns de parsing");
        }
        if (Object.keys(results.stats.categories).length < 5) {
            recommendations.push("Faible diversité de catégories - vérifier la classification");
        }
        recommendations.push("Génération automatique des effets recommandée pour maximiser la bibliothèque");
        return recommendations;
    }
    async getLibraryStructure() {
        try {
            const libraryPath = path.join(process.cwd(), 'effects-library');
            const entries = await fs.readdir(libraryPath, { withFileTypes: true });
            const structure = {};
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const categoryPath = path.join(libraryPath, entry.name);
                    const categoryFiles = await fs.readdir(categoryPath);
                    structure[entry.name] = {
                        effectCount: categoryFiles.filter(f => f.endsWith('.json') && f !== 'index.json').length,
                        hasIndex: categoryFiles.includes('index.json')
                    };
                }
            }
            return structure;
        }
        catch {
            return {};
        }
    }
    // API publiques
    getJobStatus(jobId) {
        return this.activeJobs.get(jobId) || null;
    }
    getAllJobs() {
        return Array.from(this.activeJobs.values());
    }
    async cancelJob(jobId) {
        const job = this.activeJobs.get(jobId);
        if (job && job.status === 'PROCESSING') {
            job.status = 'FAILED';
            job.errors = ['Job cancelled by user'];
            return true;
        }
        return false;
    }
}
export const batchProcessor = new BatchProcessor();
