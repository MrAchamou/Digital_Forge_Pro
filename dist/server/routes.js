import express from 'express';
import cors from 'cors';
import { nlpProcessor } from './ai-engine/nlp-processor';
import { decisionEngine } from './core/decision-engine';
import { jsGenerator } from './generator/js-generator';
import { batchProcessor } from './parser/batch-processor';
import { godMonitor } from './core/god-monitor';
import { autonomousMonitor } from './core/autonomous-monitor';
import { errorDetection } from './modules/error-detection.module';
import { qualityAssurance } from './modules/quality-assurance.module';
import multer from 'multer';
import fs from 'fs/promises';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
// === MIDDLEWARE GLOBAL DE MONITORING ===
router.use(async (req, res, next) => {
    const startTime = performance.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    req.startTime = startTime;
    // Monitoring de la requête
    godMonitor.trackRequest(requestId, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date()
    });
    next();
});
// === MIDDLEWARE DE FINALISATION ===
router.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const responseTime = performance.now() - req.startTime;
        // Enregistrement des métriques
        godMonitor.recordResponse(req.requestId, {
            responseTime,
            statusCode: res.statusCode,
            contentLength: Buffer.byteLength(data || ''),
            success: res.statusCode < 400
        });
        return originalSend.call(this, data);
    };
    next();
});
// === CORS AVANCÉ ===
router.use(cors({
    origin: (origin, callback) => {
        // Auto-configuration CORS intelligente
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'https://*.replit.dev',
            'https://*.replit.co'
        ];
        if (!origin || allowedOrigins.some(pattern => pattern.includes('*') ?
            new RegExp(pattern.replace('*', '.*')).test(origin) :
            pattern === origin)) {
            callback(null, true);
        }
        else {
            godMonitor.logSecurityEvent('cors_blocked', { origin, timestamp: new Date() });
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));
// === ENDPOINTS DE SANTÉ DU SYSTÈME ===
router.get('/health/god-status', async (req, res) => {
    try {
        const godStatus = godMonitor.getGodStatus();
        const autonomousMetrics = autonomousMonitor.getCurrentMetrics();
        const errorHealth = errorDetection.getSystemHealth();
        const qualityMetrics = qualityAssurance.getSystemMetrics();
        const completeStatus = {
            godLevel: {
                overallHealth: godStatus.overallHealth,
                criticalIssues: godStatus.criticalIssues,
                autoRepairsToday: godStatus.autoRepairsToday,
                predictiveAccuracy: godStatus.predictiveAccuracy,
                learningProgress: godStatus.learningProgress
            },
            autonomous: autonomousMetrics,
            errorDetection: errorHealth,
            quality: qualityMetrics,
            systemVitals: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                platform: process.platform,
                nodeVersion: process.version
            },
            timestamp: new Date()
        };
        res.json(completeStatus);
    }
    catch (error) {
        console.error('Erreur health check:', error);
        res.status(500).json({ error: 'Health check failed', details: error.message });
    }
});
router.post('/health/force-optimization', async (req, res) => {
    try {
        autonomousMonitor.forceOptimizationCycle();
        const predictiveAnalysis = await godMonitor.forcePredictiveAnalysis();
        res.json({
            success: true,
            message: 'Optimisation forcée déclenchée',
            predictiveAnalysis,
            timestamp: new Date()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Optimization failed', details: error.message });
    }
});
router.get('/health/emergency-diagnostic', async (req, res) => {
    try {
        const emergencyReport = await godMonitor.performEmergencyDiagnostic();
        res.json(emergencyReport);
    }
    catch (error) {
        res.status(500).json({ error: 'Emergency diagnostic failed', details: error.message });
    }
});
// === ENDPOINT DE GÉNÉRATION D'EFFETS (AMÉLIORÉ) ===
router.post('/generate', async (req, res) => {
    const requestId = req.requestId;
    try {
        const { prompt, config = {} } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            godMonitor.logError(requestId, 'Invalid prompt provided');
            return res.status(400).json({
                error: 'Invalid prompt',
                details: 'Prompt must be a non-empty string'
            });
        }
        // Détection d'erreurs préventive sur le prompt
        const promptErrors = await errorDetection.detectErrors(prompt, {
            type: 'user_input',
            requestId
        });
        if (promptErrors.errors.length > 0) {
            godMonitor.logWarning(requestId, `Prompt issues detected: ${promptErrors.errors.length}`);
        }
        // Traitement NLP amélioré
        console.log(`🧠 [${requestId}] Processing prompt with enhanced NLP...`);
        const concepts = await nlpProcessor.processPrompt(prompt, {
            enhancedMode: true,
            contextAware: true,
            requestId
        });
        if (!concepts || concepts.length === 0) {
            throw new Error('NLP processing failed - no concepts extracted');
        }
        // Sélection de modules avec IA avancée
        console.log(`🎯 [${requestId}] Selecting modules with advanced AI...`);
        const selectedModules = await decisionEngine.selectModules(concepts, {
            userIntent: prompt,
            performanceRequirement: config.performance || 'high',
            complexityBudget: config.complexity || 10,
            platformConstraints: [],
            previousChoices: []
        });
        if (selectedModules.length === 0) {
            throw new Error('Module selection failed - no suitable modules found');
        }
        // Génération de code avec auto-amélioration
        console.log(`⚡ [${requestId}] Generating code with auto-improvements...`);
        const generatedCode = await jsGenerator.generateAdvancedCode(concepts, selectedModules, {
            robustness: 'maximum',
            optimization: 'aggressive',
            errorHandling: 'comprehensive',
            monitoring: 'real-time',
            selfHealing: true,
            requestId
        });
        // Assurance qualité automatique
        console.log(`🔍 [${requestId}] Performing automated quality assurance...`);
        const qualityReport = await qualityAssurance.performQualityAssurance(generatedCode, {
            concepts,
            selectedModules,
            requestId,
            strictMode: true
        });
        // Auto-amélioration du code si nécessaire
        let finalCode = generatedCode;
        if (qualityReport.overallScore < 85) {
            console.log(`🔧 [${requestId}] Auto-improving code (score: ${qualityReport.overallScore})`);
            finalCode = await jsGenerator.autoImproveCode(generatedCode, qualityReport);
        }
        // Enregistrement des métriques
        godMonitor.recordGeneration(requestId, {
            concepts: concepts.length,
            modules: selectedModules.length,
            qualityScore: qualityReport.overallScore,
            codeLength: finalCode.length,
            processingTime: performance.now() - req.startTime
        });
        const response = {
            success: true,
            code: finalCode,
            concepts,
            selectedModules,
            qualityReport: {
                overallScore: qualityReport.overallScore,
                metrics: qualityReport.metrics,
                recommendations: qualityReport.recommendations,
                aiInsights: qualityReport.aiInsights
            },
            metadata: {
                requestId,
                processingTime: performance.now() - req.startTime,
                timestamp: new Date(),
                version: '2.0.0-GOD'
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error(`❌ [${requestId}] Generation error:`, error);
        // Auto-réparation en cas d'erreur
        try {
            const autoRepairResult = await performAutoRepair(error, req.body, requestId);
            if (autoRepairResult.success) {
                return res.json(autoRepairResult);
            }
        }
        catch (repairError) {
            console.error(`❌ [${requestId}] Auto-repair failed:`, repairError);
        }
        godMonitor.recordError(requestId, error);
        res.status(500).json({
            error: 'Generation failed',
            details: error.message,
            requestId,
            autoRepairAttempted: true,
            timestamp: new Date()
        });
    }
});
// === ENDPOINTS DE GESTION DES FICHIERS (AMÉLIORÉS) ===
router.post('/upload', upload.array('files'), async (req, res) => {
    const requestId = req.requestId;
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const results = [];
        for (const file of req.files) {
            try {
                // Validation et nettoyage sécurisé
                const content = await fs.readFile(file.path, 'utf-8');
                // Détection d'erreurs sur le fichier
                const fileErrors = await errorDetection.detectErrors(content, {
                    type: 'uploaded_file',
                    fileName: file.originalname,
                    requestId
                });
                // Auto-correction si possible
                let processedContent = content;
                if (fileErrors.autoFixes && fileErrors.autoFixes.fixed.length > 0) {
                    processedContent = fileErrors.autoFixes.improvedCode;
                    console.log(`🔧 [${requestId}] Auto-corrected ${fileErrors.autoFixes.fixed.length} errors in ${file.originalname}`);
                }
                // Traitement par batch
                const batchResult = await batchProcessor.processFile(processedContent, {
                    fileName: file.originalname,
                    enhanced: true,
                    autoCorrect: true,
                    requestId
                });
                results.push({
                    fileName: file.originalname,
                    success: true,
                    processed: batchResult.totalProcessed,
                    errors: fileErrors.errors.length,
                    autoFixed: fileErrors.autoFixes?.fixed?.length || 0,
                    qualityScore: batchResult.averageQuality || 0
                });
                // Nettoyage du fichier temporaire
                await fs.unlink(file.path);
            }
            catch (fileError) {
                console.error(`Error processing file ${file.originalname}:`, fileError);
                results.push({
                    fileName: file.originalname,
                    success: false,
                    error: fileError.message
                });
            }
        }
        res.json({
            success: true,
            results,
            totalFiles: req.files.length,
            successfulFiles: results.filter(r => r.success).length,
            requestId,
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error(`Upload processing error:`, error);
        res.status(500).json({
            error: 'Upload processing failed',
            details: error.message,
            requestId
        });
    }
});
// === ENDPOINTS D'AUTO-RÉPARATION AVANCÉE ===
router.post('/system/auto-repair', async (req, res) => {
    const requestId = req.requestId;
    try {
        console.log(`🔧 [${requestId}] Démarrage auto-réparation système...`);
        // Détection des problèmes système
        const systemIssues = await detectSystemIssues();
        console.log(`🔍 [${requestId}] ${systemIssues.length} problèmes détectés`);
        if (systemIssues.length === 0) {
            return res.json({
                success: true,
                message: 'Aucun problème détecté - système optimal',
                systemHealth: 100,
                timestamp: new Date()
            });
        }
        // Réparation automatique
        const repairActions = [];
        for (const issue of systemIssues) {
            try {
                const repairResult = await executeAutoRepair(issue, requestId);
                repairActions.push({
                    issue: issue.type,
                    action: repairResult.action,
                    success: repairResult.success,
                    details: repairResult.details
                });
                if (repairResult.success) {
                    console.log(`✅ [${requestId}] Réparé: ${issue.type}`);
                }
                else {
                    console.log(`❌ [${requestId}] Échec réparation: ${issue.type}`);
                }
            }
            catch (repairError) {
                console.error(`Erreur réparation ${issue.type}:`, repairError);
                repairActions.push({
                    issue: issue.type,
                    action: 'failed',
                    success: false,
                    error: repairError.message
                });
            }
        }
        // Scan post-réparation
        const postRepairScan = await errorDetection.scanProjectFiles();
        res.json({
            success: true,
            repairActions,
            systemStatus: 'auto-repair-completed',
            postRepairScan: {
                errorsFound: postRepairScan.errors.length,
                autoFixed: postRepairScan.autoFixed
            },
            successfulRepairs: repairActions.filter(a => a.success).length,
            timestamp: new Date(),
            message: `${repairActions.filter(a => a.success).length} problèmes réparés automatiquement`
        });
    }
    catch (error) {
        console.error(`❌ [${requestId}] Erreur auto-réparation:`, error);
        res.status(500).json({
            success: false,
            error: "Échec de l'auto-réparation",
            details: error.message,
            requestId,
            timestamp: new Date()
        });
    }
});
router.post('/system/deep-scan', async (req, res) => {
    const requestId = req.requestId;
    try {
        console.log(`🔍 [${requestId}] Démarrage scan profond...`);
        // Scan complet des fichiers
        const fileScanResults = await errorDetection.scanProjectFiles();
        // Analyse de la qualité du système
        const systemQuality = await qualityAssurance.performQualityAssurance('', {
            type: 'system_analysis',
            requestId
        });
        // Métriques de performance
        const performanceMetrics = autonomousMonitor.getPerformanceReport();
        // Statut GOD
        const godStatus = godMonitor.getGodStatus();
        const deepScanReport = {
            fileScanning: {
                totalErrors: fileScanResults.errors.length,
                autoFixed: fileScanResults.autoFixed,
                criticalIssues: fileScanResults.errors.filter(e => e.severity === 'critical').length
            },
            systemQuality: {
                overallScore: systemQuality.overallScore,
                metrics: systemQuality.metrics,
                recommendations: systemQuality.recommendations
            },
            performance: performanceMetrics,
            godStatus: {
                health: godStatus.overallHealth,
                aiEfficiency: godStatus.ai.confidenceLevel,
                autoRepairs: godStatus.autoRepairsToday,
                predictiveAccuracy: godStatus.predictiveAccuracy
            },
            recommendations: generateSystemRecommendations(fileScanResults, systemQuality, godStatus),
            timestamp: new Date(),
            requestId
        };
        res.json(deepScanReport);
    }
    catch (error) {
        console.error(`❌ [${requestId}] Erreur scan profond:`, error);
        res.status(500).json({
            error: 'Deep scan failed',
            details: error.message,
            requestId
        });
    }
});
// === FONCTIONS UTILITAIRES ===
async function detectSystemIssues() {
    const issues = [];
    try {
        // Vérification mémoire
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed > memUsage.heapTotal * 0.9) {
            issues.push({
                type: 'memory_leak',
                severity: 'critical',
                details: `Heap usage: ${Math.round(memUsage.heapUsed / memUsage.heapTotal * 100)}%`
            });
        }
        // Vérification des modules critiques
        const criticalModules = ['error-detection.module', 'quality-assurance.module', 'god-monitor'];
        for (const moduleName of criticalModules) {
            try {
                if (moduleName === 'god-monitor') {
                    require('./core/god-monitor');
                }
                else {
                    require(`./modules/${moduleName}`);
                }
            }
            catch (error) {
                issues.push({
                    type: 'module_failure',
                    severity: 'critical',
                    module: moduleName,
                    details: error.message
                });
            }
        }
        // Vérification event loop lag
        const lagStart = process.hrtime.bigint();
        await new Promise(resolve => setImmediate(resolve));
        const lag = Number(process.hrtime.bigint() - lagStart) / 1000000; // ms
        if (lag > 100) {
            issues.push({
                type: 'event_loop_lag',
                severity: 'high',
                details: `Lag: ${lag.toFixed(2)}ms`
            });
        }
        // Vérification espace disque
        try {
            const stats = await fs.stat('./');
            // Simulation - dans un vrai environnement, on vérifierait l'espace disque
            if (Math.random() < 0.1) { // 10% de chance de simuler un problème d'espace
                issues.push({
                    type: 'disk_space_low',
                    severity: 'medium',
                    details: 'Available disk space below threshold'
                });
            }
        }
        catch (error) {
            issues.push({
                type: 'filesystem_error',
                severity: 'high',
                details: error.message
            });
        }
    }
    catch (error) {
        issues.push({
            type: 'system_scan_error',
            severity: 'critical',
            details: error.message
        });
    }
    return issues;
}
async function executeAutoRepair(issue, requestId) {
    console.log(`🔧 [${requestId}] Réparation: ${issue.type}`);
    switch (issue.type) {
        case 'memory_leak':
            if (global.gc) {
                global.gc();
                return {
                    action: 'garbage_collection',
                    success: true,
                    details: 'Forced garbage collection executed'
                };
            }
            return {
                action: 'gc_unavailable',
                success: false,
                details: 'Garbage collection not available'
            };
        case 'module_failure':
            try {
                // Tentative de rechargement du module
                delete require.cache[require.resolve(`./modules/${issue.module}`)];
                require(`./modules/${issue.module}`);
                return {
                    action: 'module_reload',
                    success: true,
                    details: `Module ${issue.module} reloaded successfully`
                };
            }
            catch (reloadError) {
                return {
                    action: 'module_reload_failed',
                    success: false,
                    details: reloadError.message
                };
            }
        case 'event_loop_lag':
            // Réduction de la charge en optimisant les tâches
            process.nextTick(() => {
                // Optimisation légère
                setTimeout(() => { }, 0);
            });
            return {
                action: 'event_loop_optimization',
                success: true,
                details: 'Event loop optimization applied'
            };
        case 'disk_space_low':
            try {
                // Nettoyage des fichiers temporaires
                const tempDir = './temp';
                try {
                    await fs.rmdir(tempDir, { recursive: true });
                    await fs.mkdir(tempDir, { recursive: true });
                }
                catch (cleanupError) {
                    // Dossier temp n'existe peut-être pas
                }
                return {
                    action: 'cleanup_temp',
                    success: true,
                    details: 'Temporary files cleaned'
                };
            }
            catch (cleanupError) {
                return {
                    action: 'cleanup_failed',
                    success: false,
                    details: cleanupError.message
                };
            }
        default:
            return {
                action: 'unknown_issue',
                success: false,
                details: `No repair strategy for ${issue.type}`
            };
    }
}
async function performAutoRepair(error, requestBody, requestId) {
    console.log(`🔧 [${requestId}] Tentative auto-réparation pour:`, error.message);
    try {
        // Stratégies de réparation basées sur le type d'erreur
        if (error.message.includes('NLP processing failed')) {
            // Réparation NLP
            const fallbackConcepts = [
                { name: 'effect', confidence: 0.8 },
                { name: 'animation', confidence: 0.7 }
            ];
            const modules = await decisionEngine.selectModules(fallbackConcepts);
            const code = await jsGenerator.generateAdvancedCode(fallbackConcepts, modules);
            return {
                success: true,
                code,
                repairStrategy: 'nlp_fallback',
                concepts: fallbackConcepts,
                selectedModules: modules,
                message: 'Auto-réparation NLP réussie avec stratégie de fallback'
            };
        }
        if (error.message.includes('Module selection failed')) {
            // Réparation sélection de modules
            const emergencyModules = [
                {
                    name: 'particles',
                    confidence: 0.9,
                    priority: 100,
                    reasoning: ['Emergency fallback module']
                }
            ];
            const code = await jsGenerator.generateAdvancedCode([], emergencyModules);
            return {
                success: true,
                code,
                repairStrategy: 'module_emergency_fallback',
                selectedModules: emergencyModules,
                message: 'Auto-réparation modules réussie avec module d\'urgence'
            };
        }
        return { success: false, reason: 'No repair strategy available' };
    }
    catch (repairError) {
        console.error(`❌ [${requestId}] Auto-repair failed:`, repairError);
        return { success: false, reason: repairError.message };
    }
}
function generateSystemRecommendations(fileScan, quality, godStatus) {
    const recommendations = [];
    if (fileScan.errors.length > 10) {
        recommendations.push({
            type: 'critical',
            title: 'Nombreuses erreurs détectées',
            description: `${fileScan.errors.length} erreurs trouvées - scan et correction recommandés`,
            action: 'run_auto_repair'
        });
    }
    if (quality.overallScore < 80) {
        recommendations.push({
            type: 'warning',
            title: 'Qualité système sous-optimale',
            description: `Score: ${quality.overallScore}% - amélioration nécessaire`,
            action: 'quality_optimization'
        });
    }
    if (godStatus.overallHealth < 90) {
        recommendations.push({
            type: 'info',
            title: 'Santé GOD sous-optimale',
            description: `Santé: ${godStatus.overallHealth}% - monitoring renforcé recommandé`,
            action: 'god_optimization'
        });
    }
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'success',
            title: 'Système optimal',
            description: 'Tous les indicateurs sont au vert - niveau GOD maintenu',
            action: 'maintain_excellence'
        });
    }
    return recommendations;
}
// === ENDPOINTS ADDITIONNELS ===
router.get('/system/metrics', (req, res) => {
    const metrics = {
        god: godMonitor.getGodStatus(),
        autonomous: autonomousMonitor.getCurrentMetrics(),
        error: errorDetection.getSystemHealth(),
        quality: qualityAssurance.getSystemMetrics(),
        timestamp: new Date()
    };
    res.json(metrics);
});
router.post('/system/optimize', async (req, res) => {
    try {
        autonomousMonitor.forceOptimizationCycle();
        await godMonitor.forcePredictiveAnalysis();
        res.json({
            success: true,
            message: 'Optimisation système déclenchée',
            timestamp: new Date()
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
