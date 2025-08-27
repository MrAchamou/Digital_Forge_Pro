import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import { DependencyChecker } from "./utils/dependency-checker";

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
  // Initialisation du système de monitoring GOD
  import { godMonitor } from './core/god-monitor';
  import { DependencyChecker } from './utils/dependency-checker';

  // Vérification et auto-réparation des dépendances au démarrage
  DependencyChecker.autoFixDependencies().then((success) => {
    if (success) {
      console.log('✅ Dépendances vérifiées et corrigées');
    } else {
      console.warn('⚠️ Certaines dépendances pourraient être manquantes');
    }
  });

  // Initialisation des systèmes globaux
  global.systemCache = new Map();
  global.activeSessions = 0;
  global.processedRequests = 0;
  global.systemMetrics = {
    responseTime: 0,
    errorCount: 0
  };

  // Surveillance des métriques de base
  app.use((req, res, next) => {
    const startTime = Date.now();
    global.activeSessions++;

    res.on('finish', () => {
      global.activeSessions--;
      global.processedRequests++;
      global.systemMetrics.responseTime = Date.now() - startTime;
    });

    next();
  });

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.log("🚀 Serveur démarré sur le port 5000");
    console.log("🌐 Frontend disponible sur http://localhost:5000");
    console.log("🔧 API disponible sur http://localhost:5000/api");
    console.log("🧠 Système de monitoring GOD activé");
    console.log("🛡️ Auto-réparation et prédiction intelligente en cours");

    // Diagnostic initial
    setTimeout(async () => {
      const initialStatus = godMonitor.getGodStatus();
      console.log('📊 État initial du système GOD:', JSON.stringify(initialStatus, null, 2));
    }, 5000);
  });
})();