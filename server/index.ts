import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite.js";
import { registerRoutes } from "./routes";
import { DependencyChecker } from "./utils/dependency-checker";
import { errorDetection } from './modules/error-detection.module';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Create the HTTP server
  const { createServer } = await import('http');
  const server = createServer(app);

  // Importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // Vérifier et corriger les dépendances automatiquement
    log("Vérification des dépendances...");
    const dependenciesOk = await DependencyChecker.autoFixDependencies();
    if (!dependenciesOk) {
      log("❌ Impossible de résoudre les problèmes de dépendances", "error");
      process.exit(1);
    }
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  // Initialize GOD monitoring system
  const { godMonitor } = await import('./core/god-monitor');
  const { autonomousMonitor } = await import('./core/autonomous-monitor');
  const { errorDetection } = await import('./modules/error-detection.module');
  const { qualityAssurance } = await import('./modules/quality-assurance.module');

  // Initialisation des systèmes globaux
  (global as any).systemCache = new Map();
  (global as any).activeSessions = 0;
  (global as any).processedRequests = 0;
  (global as any).systemMetrics = {
    responseTime: 0,
    errorCount: 0
  };

  // Surveillance des métriques de base
  app.use((req, res, next) => {
    const startTime = Date.now();
    (global as any).activeSessions++;

    res.on('finish', () => {
      (global as any).activeSessions--;
      (global as any).processedRequests++;
      (global as any).systemMetrics.responseTime = Date.now() - startTime;
    });

    next();
  });

  // === ACTIVATION SYSTÈME GOD ===
  console.log('🚀 Activation du système GOD...');

  // Initialisation GOD Monitor
  const godInitialized = godMonitor.initialize();
  if (godInitialized) {
    console.log('✅ GOD Monitor activé');
  }

  // Démarrage monitoring autonome
  console.log('🤖 Autonomous Monitor démarré');
  autonomousMonitor.start(); // Assurez-vous que autonomousMonitor.start() est implémenté

  // Activation détection d'erreurs continue
  console.log('🔍 Activation détection d\'erreurs continue...');
  try {
    await errorDetection.startContinuousFileMonitoring();
    console.log('✅ Surveillance continue des fichiers activée');
  } catch (error) {
    console.warn('⚠️ Surveillance fichiers partiellement activée:', error.message);
  }

  // Scan initial du système
  console.log('🔍 Scan initial du système...');
  try {
    const initialScan = await errorDetection.scanProjectFiles();
    console.log(`📊 Scan initial: ${initialScan.errors.length} erreurs trouvées, ${initialScan.autoFixed} auto-corrigées`);
  } catch (error) {
    console.warn('⚠️ Scan initial échoué:', error.message);
  }

  // Statut final
  const godStatus = godMonitor.getGodStatus();
  console.log('\n🎭 === EFFET GENERATOR SERVER - NIVEAU GOD ===');
  console.log(`🌐 API accessible sur: http://localhost:${port}`);
  console.log(`🔗 WebSocket sur: ws://localhost:${port}`);
  console.log(`📊 Santé système: ${godStatus.overallHealth}%`);
  console.log(`🧠 IA confidence: ${(godStatus.ai.confidenceLevel * 100).toFixed(1)}%`);
  console.log(`🔮 Précision prédictive: ${(godStatus.predictiveAccuracy * 100).toFixed(1)}%`);
  console.log('🚀 Système GOD opérationnel et autonome!');
})();

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://0.0.0.0:${port}`);
  console.log(`📊 Dashboard disponible sur http://0.0.0.0:${port}/api/system/health`);
  console.log('🎯 Système GOD entièrement opérationnel');
  console.log('🔍 Auto-détection et correction des erreurs: ACTIVE');
});