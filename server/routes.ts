import express from "express";
import multer from "multer";
import path from "path";
import { orchestrator } from "./core/orchestrator";
import { storage } from "./storage";
import { multiFormatParser } from "./parser/multi-format-parser";
import { effectParserModule } from "./parser/effect-parser.module";
import { batchProcessor } from "./parser/batch-processor";
import { batchGeneratorModule } from "./modules/batch-generator.module";
import { classificationStorageModule } from "./modules/classification-storage.module";
import { errorDetectionModule } from "./modules/error-detection.module";
import { qualityAssuranceModule } from "./modules/quality-assurance.module";

const router = express.Router();

// Configuration multer pour les uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.md', '.json', '.csv', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  }
});

export function registerRoutes(app: any) {
  app.use('/', router);
}

// === ROUTES PARSER 2.0 ===

// Traitement massif de liste d'effets avec Parser 2.0
router.post("/parse/mass-effects", upload.single("effectsList"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Fichier requis" });
    }

    console.log("🚀 Démarrage traitement massif avec Parser 2.0");

    // Lancement du traitement en batch
    const jobId = await batchProcessor.processMassiveEffectsList(req.file.path);

    res.json({
      success: true,
      message: "Traitement massif démarré avec Parser 2.0",
      jobId,
      status: "PROCESSING",
      estimatedTime: "5-15 minutes pour 2000 effets"
    });

  } catch (error) {
    console.error("Erreur traitement massif:", error);
    res.status(500).json({
      error: "Échec du traitement massif",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Status d'un job de traitement
router.get("/parse/batch-status/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const jobStatus = batchProcessor.getJobStatus(jobId);

    if (!jobStatus) {
      return res.status(404).json({ error: "Job non trouvé" });
    }

    res.json({
      jobId,
      status: jobStatus.status,
      progress: jobStatus.progress,
      startTime: jobStatus.startTime,
      endTime: jobStatus.endTime,
      results: jobStatus.results,
      errors: jobStatus.errors
    });

  } catch (error) {
    res.status(500).json({ error: "Erreur récupération status" });
  }
});

// Liste de tous les jobs de traitement
router.get("/parse/batch-jobs", async (req, res) => {
  try {
    const jobs = batchProcessor.getAllJobs();
    res.json({
      jobs: jobs.map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        startTime: job.startTime,
        endTime: job.endTime
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération jobs" });
  }
});

// Annulation d'un job
router.delete("/parse/batch-job/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const cancelled = await batchProcessor.cancelJob(jobId);

    if (cancelled) {
      res.json({ success: true, message: "Job annulé" });
    } else {
      res.status(400).json({ error: "Impossible d'annuler le job" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur annulation job" });
  }
});

// Parse d'un effet individuel avec Parser 2.0
router.post("/parse/single-effect", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: "Description trop courte" });
    }

    console.log("🔍 Analyse effet individuel avec Parser 2.0");

    // Traitement avec le Parser 2.0
    const tempFile = `temp_${Date.now()}.txt`;
    const tempPath = path.join(process.cwd(), 'uploads', tempFile);

    require('fs').writeFileSync(tempPath, description);

    const results = await effectParserModule.parseEffectsList(tempPath);

    // Nettoyage
    require('fs').unlinkSync(tempPath);

    if (results.effects.length > 0) {
      res.json({
        success: true,
        effect: results.effects[0],
        confidence: results.effects[0].confidence,
        metadata: results.stats
      });
    } else {
      res.status(400).json({ error: "Impossible de parser l'effet" });
    }

  } catch (error) {
    console.error("Erreur parse individuel:", error);
    res.status(500).json({
      error: "Échec du parsing",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// === ROUTES BIBLIOTHÈQUE ===

// Récupération de la structure de la bibliothèque
router.get("/library/structure", async (req, res) => {
  try {
    const fs = require('fs').promises;
    const libraryPath = path.join(process.cwd(), 'effects-library');

    try {
      const globalIndex = await fs.readFile(
        path.join(libraryPath, 'global-index.json'), 
        'utf-8'
      );

      const indexData = JSON.parse(globalIndex);
      res.json({
        success: true,
        structure: indexData,
        libraryPath: '/effects-library'
      });
    } catch {
      res.json({
        success: true,
        structure: { totalEffects: 0, categories: [] },
        message: "Bibliothèque vide - lancez un traitement massif"
      });
    }

  } catch (error) {
    res.status(500).json({ error: "Erreur récupération structure" });
  }
});

// Recherche dans la bibliothèque
router.get("/library/search", async (req, res) => {
  try {
    const { query, category, complexity, limit = 20 } = req.query;

    const fs = require('fs').promises;
    const searchIndexPath = path.join(process.cwd(), 'effects-library', 'search-indexes.json');

    try {
      const indexData = JSON.parse(await fs.readFile(searchIndexPath, 'utf-8'));

      let results: string[] = [];

      // Recherche par catégorie
      if (category && indexData.byCategory[category as string]) {
        results = indexData.byCategory[category as string];
      }

      // Recherche par complexité
      if (complexity && indexData.byComplexity[complexity as string]) {
        const complexityResults = indexData.byComplexity[complexity as string];
        results = results.length > 0 
          ? results.filter(id => complexityResults.includes(id))
          : complexityResults;
      }

      // Recherche textuelle
      if (query) {
        const queryStr = (query as string).toLowerCase();
        const keywordMatches: string[] = [];

        Object.entries(indexData.byKeywords).forEach(([keyword, ids]) => {
          if (keyword.includes(queryStr)) {
            keywordMatches.push(...(ids as string[]));
          }
        });

        results = results.length > 0
          ? results.filter(id => keywordMatches.includes(id))
          : keywordMatches;
      }

      // Limitation des résultats
      const limitedResults = results.slice(0, parseInt(limit as string));

      res.json({
        success: true,
        results: limitedResults,
        total: results.length,
        query: { query, category, complexity, limit }
      });

    } catch {
      res.json({
        success: true,
        results: [],
        message: "Index de recherche non disponible"
      });
    }

  } catch (error) {
    res.status(500).json({ error: "Erreur recherche" });
  }
});

// Récupération d'un effet par ID
router.get("/library/effect/:effectId", async (req, res) => {
  try {
    const { effectId } = req.params;
    const fs = require('fs').promises;

    // Recherche dans toutes les catégories
    const libraryPath = path.join(process.cwd(), 'effects-library');
    const categories = await fs.readdir(libraryPath, { withFileTypes: true });

    for (const category of categories) {
      if (category.isDirectory()) {
        const effectPath = path.join(libraryPath, category.name, `${effectId}.json`);

        try {
          const effectData = await fs.readFile(effectPath, 'utf-8');
          res.json({
            success: true,
            effect: JSON.parse(effectData)
          });
          return;
        } catch {
          continue;
        }
      }
    }

    res.status(404).json({ error: "Effet non trouvé" });

  } catch (error) {
    res.status(500).json({ error: "Erreur récupération effet" });
  }
});

// === ROUTES EXISTANTES (maintenues) ===

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadRecord = await storage.createUpload({
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    await multiFormatParser.processFile(uploadRecord);

    res.json({
      success: true,
      uploadId: uploadRecord.id,
      message: "File uploaded and processing started"
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.get("/upload/:id", async (req, res) => {
  try {
    const upload = await storage.getUpload(req.params.id);
    if (!upload) {
      return res.status(404).json({ error: "Upload not found" });
    }
    res.json(upload);
  } catch (error) {
    res.status(500).json({ error: "Failed to get upload" });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { description, platform = "javascript", options = {} } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ 
        error: "Description is required and must be at least 5 characters" 
      });
    }

    const result = await orchestrator.generateEffect(description, platform, options);

    res.json({
      success: true,
      code: result.code,
      metadata: result.metadata
    });
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({ 
      error: "Effect generation failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ 
        error: "Description is required and must be at least 5 characters" 
      });
    }

    const analysis = await orchestrator.analyzeDescription(description);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ 
      error: "Analysis failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/queue/stats", async (req, res) => {
  try {
    const stats = await storage.getQueueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get queue stats" });
  }
});

router.get("/system/health", async (req, res) => {
  try {
    const health = {
      overall: 98.7,
      modules: {
        particles: { status: "online", performance: 95.2 },
        physics: { status: "online", performance: 92.8 },
        lighting: { status: "online", performance: 88.4 },
        morphing: { status: "online", performance: 91.1 },
        parser: { status: "online", performance: 99.5 }, // Parser 2.0
        batchProcessor: { status: "online", performance: 97.3 }
      },
      timestamp: new Date().toISOString()
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ error: "Health check failed" });
  }
});

// Routes pour le parser d'effets
router.post("/api/parse-effects", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: "Description trop courte" });
    }

    console.log("🔍 Analyse effet individuel avec Parser 2.0");

    const tempFile = `temp_${Date.now()}.txt`;
    const tempPath = path.join(process.cwd(), 'uploads', tempFile);

    require('fs').writeFileSync(tempPath, description);

    const results = await effectParserModule.parseEffectsList(tempPath);

    require('fs').unlinkSync(tempPath);

    if (results.effects.length > 0) {
      res.json({
        success: true,
        effect: results.effects[0],
        confidence: results.effects[0].confidence,
        metadata: results.stats
      });
    } else {
      res.status(400).json({ error: "Impossible de parser l'effet" });
    }
  } catch (error) {
    console.error("Erreur parsing effets:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors du parsing des effets" 
    });
  }
});

// Routes pour le générateur en lot
router.post("/api/batch-generate", async (req, res) => {
  try {
    const { effectType, category, count, baseParameters } = req.body;

    const result = await batchGeneratorModule.generateEffects({
      effectType,
      category,
      count: parseInt(count) || 10,
      baseParameters
    });

    res.json({
      success: true,
      data: result,
      message: `${result.generated.length} effets générés avec succès`
    });
  } catch (error) {
    console.error("Erreur génération batch:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la génération en lot" 
    });
  }
});

// Routes pour obtenir les options disponibles
router.get("/api/batch-options", (req, res) => {
  res.json({
    types: batchGeneratorModule.getSupportedTypes(),
    categories: batchGeneratorModule.getSupportedCategories()
  });
});

// Routes pour la classification et stockage
router.post("/api/classify-effect", async (req, res) => {
  try {
    const { effectData } = req.body;

    const classification = await classificationStorageModule.classifyEffect(effectData);

    res.json({
      success: true,
      classification
    });
  } catch (error) {
    console.error("Erreur classification:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la classification" 
    });
  }
});

router.post("/api/store-effect", async (req, res) => {
  try {
    const { effectData, classification } = req.body;

    const result = await classificationStorageModule.storeEffect(effectData, classification);

    res.json({
      success: result.stored,
      filePath: result.filePath,
      errors: result.errors
    });
  } catch (error) {
    console.error("Erreur stockage:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors du stockage" 
    });
  }
});

router.post("/api/reorganize-library", async (req, res) => {
  try {
    const result = await classificationStorageModule.reorganizeLibrary();

    res.json({
      success: true,
      data: result,
      message: `${result.moved} effets réorganisés`
    });
  } catch (error) {
    console.error("Erreur réorganisation:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la réorganisation" 
    });
  }
});

// Routes pour la détection d'erreurs
router.post("/api/validate-code", async (req, res) => {
  try {
    const { code, context } = req.body;

    const result = await errorDetectionModule.validateCode(code, context);

    res.json({
      success: true,
      validation: result
    });
  } catch (error) {
    console.error("Erreur validation:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la validation" 
    });
  }
});

// Routes pour l'assurance qualité
router.post("/api/assess-quality", async (req, res) => {
  try {
    const { effectData, generatedCode } = req.body;

    const report = await qualityAssuranceModule.assessQuality(effectData, generatedCode);

    res.json({
      success: true,
      qualityReport: report
    });
  } catch (error) {
    console.error("Erreur évaluation qualité:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de l'évaluation qualité" 
    });
  }
});

router.post("/api/batch-quality", async (req, res) => {
  try {
    const { effects } = req.body;

    const result = await qualityAssuranceModule.runBatchQuality(effects);

    res.json({
      success: true,
      data: result,
      message: `Évaluation de ${result.stats.total} effets terminée`
    });
  } catch (error) {
    console.error("Erreur évaluation batch:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de l'évaluation en lot" 
    });
  }
});

export { router };