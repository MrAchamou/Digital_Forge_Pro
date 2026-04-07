import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import { loadPremiumEffects } from './utils/premium-effects-loader';
import { cleanOldExports } from './services/exports-cleaner';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

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

  const { createServer } = await import('http');
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur http://0.0.0.0:${port}`);

    import('./services/api-key-rotator').then(({ rotator }) => {
      const openaiOk = !!(
        process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY?.startsWith('sk-')
      );
      const anthropicOk = !!(
        process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ||
        process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-')
      );

      if (openaiOk) {
        console.log('✅ OpenAI : clé détectée');
      } else {
        console.warn('⚠️  OpenAI : clé non trouvée — vérifiez l\'intégration Replit');
      }
      if (anthropicOk) {
        console.log('✅ Anthropic : clé détectée');
      } else {
        console.warn('⚠️  Anthropic : clé non trouvée — vérifiez l\'intégration Replit');
      }

      rotator.init().then(() => {
        console.log('🔑 Rotateur API initialisé');
      }).catch((e: Error) => {
        console.warn('⚠️  Rotateur API init partiel:', e.message);
      });
    }).catch(() => {});

    cleanOldExports(7).catch(err =>
      console.warn('⚠️ Nettoyage exports au démarrage échoué:', err.message)
    );

    console.log('📦 Chargement des effets premium...');
    loadPremiumEffects().then(result => {
      if (result.loaded > 0) {
        console.log(`✅ ${result.loaded} effets premium chargés`);
      }
      if (result.skipped > 0) {
        console.log(`⏭️  ${result.skipped} effets déjà présents`);
      }
    }).catch(err => {
      console.warn('⚠️ Chargement des effets premium échoué:', err.message);
    });
  });
})();
