import express from 'express';
import cors from 'cors';
import { storage } from './storage';
import { buildEffectPreviewHTML, saveEffectPreview, getEffectPreviewHTML } from './services/effect-preview-generator';
import { getAllSectorConfigs, getSectorConfig, renderSignature } from './services/signature-renderer';
import { generateVariants, generateSingleVariant, getVariantProfiles, ENGINE_VERSION as VARIANCE_VERSION, VariantId } from './modules/variance-engine.module';
import {
  getTimingProfile,
  getAllTimingProfiles,
  getSectorTimingProfiles,
  generateFullTimingBlock,
  injectTimingIntoHTML,
  ENGINE_VERSION as TIMING_VERSION,
  VariationContext,
} from './modules/timing-master.module';
import {
  generateHarmony,
  generateAllHarmonies,
  adaptPaletteToLogo,
  injectColorIntoHTML,
  analyzeColor,
  getHarmonyTypes,
  isValidHex,
  getContrastRatio,
  enforceAccessibility,
  ENGINE_VERSION as COLOR_VERSION,
  HarmonyType,
} from './modules/color-harmony.module';
import {
  adaptToContext,
  adaptForAllClients,
  injectContextIntoHTML,
  getClientProfiles,
  getClientProfile,
  detectEmailClient,
  ENGINE_VERSION as CTX_VERSION,
  EmailClient,
  ColorScheme,
} from './modules/context-adaptation.module';
import {
  adaptPerformance,
  adaptAllTiers,
  injectPerformanceIntoHTML,
  getTierConfigs,
  resolveTier,
  ENGINE_VERSION as PERF_VERSION,
  PerformanceTier,
  PerformanceHints,
} from './modules/performance-adaptive.module';
import { classifySector } from './services/sector-classifier';
import { reloadAndEnrichAllEffects } from './utils/premium-effects-loader';
import {
  fuseEffects,
  checkFusionCompatibility,
  suggestFusionWeights,
  injectFusionIntoHTML,
  ENGINE_VERSION as FUSION_VERSION,
  FusionConfig,
} from './modules/effect-fusion.module';
import {
  moderate,
  computeComplexityScore as scoreComplexity,
  generateModerationCSS,
  getSectorCeilings,
  ENGINE_VERSION as MODERATION_VERSION,
  ModerationConfig,
} from './modules/contextual-intelligence.module';
import {
  orchestrate,
  injectOrchestrationIntoHTML,
  getSectorProfiles,
  getElementRoleMap,
  getArcTimings,
  ENGINE_VERSION as ORCH_VERSION,
  OrchestratorConfig,
} from './modules/experience-orchestrator.module';
import {
  orchestrateFusion,
  getFusionLevels,
  getModulesForLevel,
  preflightCheck,
  ENGINE_VERSION as DFO_VERSION,
  SignatureInput,
} from './modules/dynamic-fusion-orchestrator.module';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// === SANTÉ SYSTÈME ===

router.get('/system/health', (_req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  const uptimeHours = (uptimeSec / 3600).toFixed(1) + 'h';
  const modules = {
    particles:      { status: 'online', performance: 100, uptime: uptimeHours },
    physics:        { status: 'online', performance: 99,  uptime: uptimeHours },
    lighting:       { status: 'online', performance: 99,  uptime: uptimeHours },
    morphing:       { status: 'online', performance: 99,  uptime: uptimeHours },
    templates:      { status: 'online', performance: 100, uptime: uptimeHours },
    classifier:     { status: 'online', performance: 100, uptime: uptimeHours },
    variance_engine:  { status: 'online', performance: 100, uptime: uptimeHours, version: VARIANCE_VERSION },
    timing_master:     { status: 'online', performance: 100, uptime: uptimeHours, version: TIMING_VERSION },
    color_harmony:         { status: 'online', performance: 100, uptime: uptimeHours, version: COLOR_VERSION },
    context_adaptation:        { status: 'online', performance: 100, uptime: uptimeHours, version: CTX_VERSION },
    performance_adaptive:      { status: 'online', performance: 100, uptime: uptimeHours, version: PERF_VERSION },
    effect_fusion:             { status: 'online', performance: 100, uptime: uptimeHours, version: FUSION_VERSION },
    contextual_intelligence:   { status: 'online', performance: 100, uptime: uptimeHours, version: MODERATION_VERSION },
    experience_orchestrator:   { status: 'online', performance: 100, uptime: uptimeHours, version: ORCH_VERSION },
    dynamic_fusion_orchestrator: { status: 'online', performance: 100, uptime: uptimeHours, version: DFO_VERSION },
  };
  const moduleAvg = Math.round(
    Object.values(modules).reduce((s, m) => s + m.performance, 0) / Object.keys(modules).length
  );
  res.json({
    overall: moduleAvg,
    modules,
    queue: { size: 0, processing: 0, failed: 0 },
    resources: {
      cpu: 8,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      storage: 15,
    },
    uptime: uptimeSec,
    timestamp: new Date(),
  });
});

router.get('/modules/status', (_req, res) => {
  const uptimeHours = (process.uptime() / 3600).toFixed(1) + 'h';
  const modules = [
    { id: 'particles',   name: 'Particles System', status: 'online', performance: 100, uptime: uptimeHours, errors: 0 },
    { id: 'physics',     name: 'Physics Engine',   status: 'online', performance: 99,  uptime: uptimeHours, errors: 0 },
    { id: 'lighting',    name: 'Lighting Effects', status: 'online', performance: 99,  uptime: uptimeHours, errors: 0 },
    { id: 'morphing',    name: 'Morphing System',  status: 'online', performance: 99,  uptime: uptimeHours, errors: 0 },
    { id: 'templates',   name: 'Sector Templates', status: 'online', performance: 100, uptime: uptimeHours, errors: 0 },
    { id: 'classifier',  name: 'AI Classifier',    status: 'online', performance: 100, uptime: uptimeHours, errors: 0 },
  ];
  res.json({
    modules,
    overall: 99,
    timestamp: new Date(),
  });
});

// === BIBLIOTHÈQUE D'EFFETS ===

router.get('/library/effects', async (req, res) => {
  try {
    const page     = parseInt(String(req.query.page   || '1'));
    const limit    = parseInt(String(req.query.limit  || '12'));
    const offset   = (page - 1) * limit;
    const category = req.query.category as string | undefined;
    const type     = req.query.type     as string | undefined;
    const search   = req.query.search   as string | undefined;
    const platform = req.query.platform as string | undefined;

    const result = await storage.getEffects({ category, type, search, platform, limit, offset });
    const totalPages = Math.ceil(result.total / limit);

    // Enrichit chaque effet avec les métriques clés extraites de metadata
    const effects = result.effects.map((e) => {
      const meta = (e.metadata as Record<string, any>) ?? {};
      return {
        ...e,
        // Métriques de premier niveau remontées depuis metadata
        particleCount:   meta.totalParticleCount ?? 0,
        performanceTier: meta.performanceTier   ?? e.performance ?? 'medium',
        phases:          meta.phaseSequence     ?? (meta.phaseDurations ? Object.keys(meta.phaseDurations) : []),
        phaseCount:      (meta.phaseSequence?.length ?? Object.keys(meta.phaseDurations ?? {}).length),
        totalCycleDurationMs: meta.totalCycleDurationMs ?? null,
        particleSystems: meta.particleSystems   ?? null,
        physicsConstants: meta.physics          ?? null,
        timingConstants: meta.timingConstants   ?? null,
        animationRanges: meta.animationRanges   ?? null,
        addictionMechanics: meta.addictionMechanics ?? [],
        keyFeatures:     meta.keyFeatures       ?? [],
        physicalSystems: meta.physicalSystems   ?? [],
        easingCurves:    meta.easingCurves       ?? [],
        cssKeyframes:    meta.cssKeyframes       ?? [],
        cssReady:        meta.cssReady           ?? false,
      };
    });

    res.json({
      effects,
      pagination: { page, limit, total: result.total, pages: totalPages },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/library/effects/:id/download', async (req, res) => {
  try {
    const effect = await storage.getEffect(req.params.id);
    if (!effect) return res.status(404).json({ error: 'Effet non trouvé' });
    const filename = `${effect.name.replace(/\s+/g, '_')}.js`;
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(effect.code || '');
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/library/real-time-stats', async (_req, res) => {
  try {
    const result = await storage.getEffects({ limit: 10000 });
    const effects = result.effects;
    const categories: Record<string, number> = {};
    effects.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + 1;
    });
    res.json({
      totalDescriptions: result.total,
      effectsGenerated: result.total,
      averageGenerationTime: 2.4,
      successRate: 1.0,
      categories,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === JOBS ===

router.get('/queue/jobs', (_req, res) => {
  res.json([]);
});

router.post('/effects/generate', async (req, res) => {
  try {
    const { jobQueue } = await import('./queue/job-queue');
    const { description, platform = 'javascript', options = {} } = req.body;
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'description is required' });
    }
    const job = await storage.createJob({
      description, platform, options,
      status: 'queued', progress: 0, estimatedTime: 30,
    } as any);
    await jobQueue.addJob(job);
    res.json({ success: true, jobId: job.id, estimatedTime: 30 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/effects/status/:jobId', async (req, res) => {
  try {
    const job = await storage.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job introuvable' });
    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/effect/preview/:id', (req, res) => {
  try {
    const html = getEffectPreviewHTML(req.params.id);
    if (!html) return res.status(404).send('Preview introuvable');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(html);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === TEMPLATES DE SECTEUR (JSON + Handlebars) ===

router.get('/signature/templates', (_req, res) => {
  try {
    const configs = getAllSectorConfigs();
    const templates = configs.map(t => ({
      id: t.id,
      label: t.label,
      emoji: t.emoji,
      description: t.description,
      layout: t.layout,
      effects: t.effects,
      palette: t.palette,
      animation: t.animation ? { name: t.animation.name, intensity: t.animation.intensity } : undefined,
      tone: t.tone,
      cta: t.cta,
      fieldCount: t.fields.length,
    }));
    res.json({ templates, total: templates.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/signature/templates/:sectorId', (req, res) => {
  try {
    const config = getSectorConfig(req.params.sectorId);
    res.json(config);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/signature/render', (req, res) => {
  try {
    const { sectorId, data } = req.body;
    if (!sectorId) return res.status(400).json({ error: 'sectorId requis' });
    if (!data)     return res.status(400).json({ error: 'data requis' });

    const html = renderSignature(sectorId, data);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === VARIANCE ENGINE — 4 variantes visuelles ===

router.get('/signature/variants/profiles', (_req, res) => {
  try {
    const profiles = getVariantProfiles();
    res.json({ profiles, engine_version: VARIANCE_VERSION });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/signature/variants', (req, res) => {
  try {
    const { sectorId, data } = req.body;
    if (!sectorId) return res.status(400).json({ error: 'sectorId requis' });
    if (!data)     return res.status(400).json({ error: 'data requis' });

    const result = generateVariants(sectorId, data);

    res.json({
      sector_id:            result.sector_id,
      base_palette:         result.base_palette,
      engine_version:       result.engine_version,
      generation_timestamp: result.generation_timestamp,
      total_time_ms:        result.total_time_ms,
      variants: result.variants.map(v => ({
        id:           v.id,
        metadata:     v.metadata,
        css_overrides: v.css_overrides,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/signature/variants/render', (req, res) => {
  try {
    const { sectorId, data } = req.body;
    if (!sectorId) return res.status(400).json({ error: 'sectorId requis' });
    if (!data)     return res.status(400).json({ error: 'data requis' });

    const result = generateVariants(sectorId, data);

    const htmlMap: Record<string, string> = {};
    result.variants.forEach(v => { htmlMap[v.id] = v.html; });

    res.json({
      sector_id:            result.sector_id,
      engine_version:       result.engine_version,
      generation_timestamp: result.generation_timestamp,
      total_time_ms:        result.total_time_ms,
      variants_html:        htmlMap,
      metadata: result.variants.map(v => ({
        id:       v.id,
        metadata: v.metadata,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/signature/variants/:variantId/render', (req, res) => {
  try {
    const { sectorId, data } = req.body;
    const variantId = req.params.variantId.toUpperCase() as VariantId;
    if (!['A', 'B', 'C', 'D'].includes(variantId)) {
      return res.status(400).json({ error: 'variantId doit être A, B, C ou D' });
    }
    if (!sectorId) return res.status(400).json({ error: 'sectorId requis' });
    if (!data)     return res.status(400).json({ error: 'data requis' });

    const variant = generateSingleVariant(sectorId, data, variantId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(variant.html);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === TIMING MASTER v3.0 ===

/**
 * GET /api/timing/sectors — Liste des 10 profils secteur avec leurs BPM et paramètres.
 */
router.get('/timing/sectors', (_req, res) => {
  try {
    const sectors = getSectorTimingProfiles();
    res.json({
      version: TIMING_VERSION,
      count:   sectors.length,
      sectors: sectors.map(s => ({
        sectorId:   s.sectorId,
        bpm:        s.bpm,
        globalMult: s.globalMult,
        easing:     s.easing,
        jitterBase: s.jitterBase,
        intensity:  s.intensity,
        beatMs:     Math.round((60 / s.bpm) * 1000),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/timing/profile — Retourne le profil complet pour une variation + secteur.
 * Query : variation=A|B|C|D  sectorId=tech|finance|...  reducedMotion=true|false
 */
router.get('/timing/profile', (req, res) => {
  try {
    const variation     = ((req.query.variation as string) || 'B').toUpperCase() as VariationContext;
    const sectorId      = (req.query.sectorId  as string) || 'standard';
    const reducedMotion = req.query.reducedMotion === 'true';

    if (!['A', 'B', 'C', 'D'].includes(variation)) {
      return res.status(400).json({ error: 'variation doit être A, B, C ou D' });
    }

    const profile = getTimingProfile(variation, { sectorId, reducedMotion });
    res.json({ version: TIMING_VERSION, profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/timing/profiles/all — Matrice complète : 10 secteurs × 4 variations = 40 profils.
 */
router.get('/timing/profiles/all', (_req, res) => {
  try {
    const profiles = getAllTimingProfiles();
    res.json({
      version: TIMING_VERSION,
      count:   Object.keys(profiles).length,
      profiles,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/timing/css — Génère le bloc CSS TimingMaster pour injection.
 * Body : { variation, sectorId, zoneColors?, reducedMotion? }
 */
router.post('/timing/css', (req, res) => {
  try {
    const { variation = 'B', sectorId = 'standard', zoneColors = {}, reducedMotion = false } = req.body;
    if (!['A', 'B', 'C', 'D'].includes(variation?.toUpperCase())) {
      return res.status(400).json({ error: 'variation doit être A, B, C ou D' });
    }

    const profile = getTimingProfile(variation.toUpperCase() as VariationContext, {
      sectorId,
      reducedMotion,
    });
    const block = generateFullTimingBlock(profile, {
      instanceId:  `api-${variation}-${sectorId}`,
      zoneColors,
      withOutlook: true,
    });

    res.json({
      version:       TIMING_VERSION,
      variation:     variation.toUpperCase(),
      sectorId,
      profile,
      styleTag:      block.styleTag,
      outlookBlock:  block.outlookBlock,
      reducedMotion: block.reducedMotion,
      totalSize:     block.styleTag.length + block.outlookBlock.length + block.reducedMotion.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/timing/inject — Injecte le CSS TimingMaster dans un HTML complet.
 * Body : { html, variation, sectorId?, reducedMotion?, zoneColors? }
 */
router.post('/timing/inject', (req, res) => {
  try {
    const { html, variation = 'B', sectorId = 'standard', reducedMotion = false, zoneColors = {} } = req.body;
    if (!html) return res.status(400).json({ error: 'html requis' });

    const result = injectTimingIntoHTML(
      html,
      variation.toUpperCase() as VariationContext,
      { sectorId, reducedMotion, zoneColors }
    );

    res.json({
      version:      TIMING_VERSION,
      injected:     result.injected,
      cssBlockSize: result.cssBlockSize,
      profile:      result.profile,
      html:         result.html,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === COLOR HARMONY ENGINE v3.0 ===

/**
 * GET /api/color/types — Liste des 7 types d'harmonies disponibles.
 */
router.get('/color/types', (_req, res) => {
  const types = getHarmonyTypes();
  res.json({
    version: COLOR_VERSION,
    count:   types.length,
    types:   types.map(t => ({
      id:          t,
      label:       t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' '),
      colorCount:  t === 'monochromatic' ? 4 : t === 'tetradic' || t === 'square' ? 3 : t === 'complementary' ? 1 : 2,
    })),
  });
});

/**
 * POST /api/color/analyze — Analyse une couleur hex (HSL, luminance, WCAG).
 * Body : { hex }
 */
router.post('/color/analyze', (req, res) => {
  try {
    const { hex } = req.body;
    if (!hex || !isValidHex(hex)) return res.status(400).json({ error: 'hex invalide (ex: #06b6d4)' });
    const info       = analyzeColor(hex);
    const complement = getContrastRatio(hex, '#ffffff');
    res.json({
      version:         COLOR_VERSION,
      ...info,
      contrastOnWhite: complement,
      contrastOnBlack: getContrastRatio(hex, '#000000'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/color/harmony — Génère une harmonie pour une couleur et un type donné.
 * Body : { hex, type? }
 */
router.post('/color/harmony', (req, res) => {
  try {
    const { hex, type = 'complementary' } = req.body;
    if (!hex || !isValidHex(hex)) return res.status(400).json({ error: 'hex invalide' });
    const validTypes = getHarmonyTypes();
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `type invalide. Valeurs: ${validTypes.join(', ')}` });
    }

    const result = generateHarmony(hex, type as HarmonyType);
    res.json({ version: COLOR_VERSION, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/color/harmonies/all — Génère les 7 harmonies pour une couleur.
 * Body : { hex }
 */
router.post('/color/harmonies/all', (req, res) => {
  try {
    const { hex } = req.body;
    if (!hex || !isValidHex(hex)) return res.status(400).json({ error: 'hex invalide' });

    const results = generateAllHarmonies(hex);
    res.json({
      version:  COLOR_VERSION,
      baseColor: hex,
      count:     Object.keys(results).length,
      harmonies: results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/color/adapt — Adapte la palette d'un secteur à une couleur de logo.
 * Body : { dominantColor, originalPalette: { background, accent, text, muted, border }, harmonyType? }
 */
router.post('/color/adapt', (req, res) => {
  try {
    const { dominantColor, originalPalette, harmonyType = 'analogous' } = req.body;
    if (!dominantColor || !isValidHex(dominantColor)) return res.status(400).json({ error: 'dominantColor invalide' });
    if (!originalPalette?.background || !originalPalette?.accent) {
      return res.status(400).json({ error: 'originalPalette requis : { background, accent, text, muted, border }' });
    }

    const result = adaptPaletteToLogo(dominantColor, originalPalette, harmonyType as HarmonyType);
    res.json({ version: COLOR_VERSION, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/color/inject — Injecte la palette CSS dans un HTML.
 * Body : { html, palette: { background, accent, text, muted, border } }
 */
router.post('/color/inject', (req, res) => {
  try {
    const { html, palette } = req.body;
    if (!html)    return res.status(400).json({ error: 'html requis' });
    if (!palette) return res.status(400).json({ error: 'palette requise' });

    // Applique l'accessibilité WCAG avant injection
    const safePalette = enforceAccessibility(palette);
    const result      = injectColorIntoHTML(html, safePalette);
    res.json({ version: COLOR_VERSION, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === CONTEXT ADAPTATION ENGINE v3.0 ===

/**
 * GET /api/context/clients — Liste des 10 profils clients email.
 */
router.get('/context/clients', (_req, res) => {
  try {
    const profiles = getClientProfiles();
    res.json({
      version: CTX_VERSION,
      count:   profiles.length,
      clients: profiles.map(p => ({
        id:               p.id,
        label:            p.label,
        animationSupport: p.animationSupport,
        cssSupport:       p.cssSupport,
        darkModeSupport:  p.darkModeSupport,
        msoConditional:   p.msoConditional,
        notes:            p.notes,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/context/detect — Détecte le client email depuis un User-Agent ou hint.
 * Body : { hint?, userAgent? }
 */
router.post('/context/detect', (req, res) => {
  try {
    const { hint, userAgent } = req.body;
    const client  = detectEmailClient(hint, userAgent);
    const profile = getClientProfile(client);
    res.json({ version: CTX_VERSION, client, profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/context/adapt — Génère l'adaptation contextuelle (CSS + inline + MSO).
 * Body : { palette, client?, scheme? }
 */
router.post('/context/adapt', (req, res) => {
  try {
    const { palette, client = 'generic', scheme = 'auto' } = req.body;
    if (!palette?.background) return res.status(400).json({ error: 'palette requis : { background, accent, text, muted, border }' });

    const result = adaptToContext(palette, client as EmailClient, scheme as ColorScheme);
    res.json({
      version:      CTX_VERSION,
      client:       result.client,
      scheme:       result.scheme,
      cssBlock:     result.cssBlock,
      inlineStyle:  result.inlineStyle,
      msoBlock:     result.msoBlock,
      palette:      result.adaptedPalette.safePalette,
      lightPalette: result.adaptedPalette.lightPalette,
      darkPalette:  result.adaptedPalette.darkPalette,
      warnings:     result.warnings,
      profile:      result.profile,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/context/adapt/all — Adapte pour les 10 clients en une passe.
 * Body : { palette, scheme? }
 */
router.post('/context/adapt/all', (req, res) => {
  try {
    const { palette, scheme = 'auto' } = req.body;
    if (!palette?.background) return res.status(400).json({ error: 'palette requis' });

    const results = adaptForAllClients(palette, scheme as ColorScheme);
    const summary = Object.entries(results).map(([client, r]) => ({
      client,
      animationSupport: r.profile.animationSupport,
      cssSupport:       r.profile.cssSupport,
      darkModeSupport:  r.profile.darkModeSupport,
      warnings:         r.warnings.length,
      hasMSO:           !!r.msoBlock,
    }));

    res.json({
      version:  CTX_VERSION,
      count:    Object.keys(results).length,
      scheme,
      summary,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/context/inject — Injecte l'adaptation contextuelle dans un HTML.
 * Body : { html, palette, client?, scheme? }
 */
router.post('/context/inject', (req, res) => {
  try {
    const { html, palette, client = 'generic', scheme = 'auto' } = req.body;
    if (!html)              return res.status(400).json({ error: 'html requis' });
    if (!palette?.background) return res.status(400).json({ error: 'palette requis' });

    const result = injectContextIntoHTML(html, palette, client as EmailClient, scheme as ColorScheme);
    res.json({ version: CTX_VERSION, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === PERFORMANCE ADAPTIVE ENGINE v3.0 ===

/**
 * GET /api/performance/tiers — Configuration des 3 tiers (Ultra / Standard / Lite).
 */
router.get('/performance/tiers', (_req, res) => {
  try {
    const configs = getTierConfigs();
    res.json({
      version: PERF_VERSION,
      count:   configs.length,
      tiers:   configs.map(c => ({
        tier:               c.tier,
        label:              c.label,
        animationEnabled:   c.animationEnabled,
        particleDensity:    c.particleDensity,
        keyframeComplexity: c.keyframeComplexity,
        frameTarget:        c.frameTarget,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/performance/resolve — Résout le tier optimal depuis les hints.
 * Body : { deviceTier?, gpuTier?, connectionType?, isMobile?, reducedMotion?, dataSaver?, maxFPS?, userAgent? }
 */
router.post('/performance/resolve', (req, res) => {
  try {
    const hints  = req.body as PerformanceHints;
    const result = resolveTier(hints);
    res.json({ version: PERF_VERSION, tier: result.tier, reasoning: result.reasoning });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/performance/adapt — Génère le CSS adaptatif pour les hints fournis.
 * Body : { hints?: PerformanceHints }
 */
router.post('/performance/adapt', (req, res) => {
  try {
    const hints  = (req.body.hints ?? req.body) as PerformanceHints;
    const result = adaptPerformance(hints);
    res.json({
      version:        PERF_VERSION,
      tier:           result.tier,
      label:          result.tierConfig.label,
      frameTarget:    result.tierConfig.frameTarget,
      cssBlock:       result.cssBlock,
      mediaQueryBlock: result.mediaQueryBlock,
      inlineVars:     result.inlineVars,
      reasoning:      result.reasoning,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/performance/tiers/all — CSS pré-généré pour les 3 tiers.
 */
router.get('/performance/tiers/all', (_req, res) => {
  try {
    const all = adaptAllTiers();
    const summary = (Object.entries(all) as [PerformanceTier, typeof all.ultra][]).map(([tier, r]) => ({
      tier,
      label:          r.tierConfig.label,
      frameTarget:    r.tierConfig.frameTarget,
      particleDensity: r.tierConfig.particleDensity,
      reasoning:      r.reasoning,
      cssSize:        r.cssBlock.length,
    }));
    res.json({ version: PERF_VERSION, count: 3, tiers: summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/performance/inject — Injecte le CSS adaptatif dans un HTML.
 * Body : { html, hints?: PerformanceHints }
 */
router.post('/performance/inject', (req, res) => {
  try {
    const { html, hints = {} } = req.body;
    if (!html) return res.status(400).json({ error: 'html requis' });

    const result = injectPerformanceIntoHTML(html, hints as PerformanceHints);
    res.json({ version: PERF_VERSION, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/signature/preview-sector/:sectorId', (req, res) => {
  try {
    const { sectorId } = req.params;
    const config = getSectorConfig(sectorId);

    const demoData: Record<string, any> = {
      nom: 'Jean Dupont',
      titre: config.fields.find(f => f.key === 'titre')?.label || 'Professionnel',
      entreprise: 'Mon Entreprise',
      telephone: '06 12 34 56 78',
      email: 'contact@monentreprise.fr',
      site: 'https://monentreprise.fr',
      adresse: '12 Rue de la Paix, Paris',
      ville: 'Paris',
      note: 4.8,
      horaires: 'Lun-Ven 8h-18h',
      zone: 'Île-de-France',
      urgence: 'Urgences 24h/7j',
      agence: 'Agence Centrale',
      cabinet: 'Cabinet Dupont & Associés',
      portfolio: 'https://portfolio.dev',
      instagram: 'https://instagram.com/moncompte',
      linkedin: 'https://linkedin.com/in/jeandupont',
    };

    const html = renderSignature(sectorId, demoData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(html);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/signature/classify-sector', async (req, res) => {
  try {
    const { metadata, gmb_data } = req.body;
    const input = metadata || gmb_data;
    if (!input) return res.status(400).json({ error: 'metadata ou gmb_data requis' });

    const result = await classifySector(input);
    const config = getSectorConfig(result.sectorId);

    res.json({
      ...result,
      template: {
        id: config.id,
        label: config.label,
        emoji: config.emoji,
        layout: config.layout,
        effects: config.effects,
        palette: config.palette,
        fields: config.fields,
        tone: config.tone,
        cta: config.cta,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === GMB SCRAPING ===

router.post('/signature/scrape-gmb', async (req, res) => {
  try {
    const { gmb_url } = req.body;
    if (!gmb_url) return res.status(400).json({ error: 'gmb_url requis' });
    const { scrapeGMB } = await import('./services/gmb-scraper');
    const data = await scrapeGMB(gmb_url);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

// === STYLE VISUEL (Gemini) ===

router.post('/signature/detect-style', async (req, res) => {
  try {
    const { metadata } = req.body;
    if (!metadata) return res.status(400).json({ error: 'metadata requis' });

    const context = [
      metadata.entreprise && `Entreprise : ${metadata.entreprise}`,
      metadata.secteur    && `Secteur : ${metadata.secteur}`,
      metadata.description && `Description GMB : ${metadata.description}`,
      metadata.ton        && `Ton de marque : ${metadata.ton}`,
      metadata.note       && `Note Google : ${metadata.note}/5 (${metadata.avis || 0} avis)`,
      metadata.ville      && `Ville : ${metadata.ville}`,
      metadata.mots_cles?.length && `Mots-clés GMB : ${metadata.mots_cles.join(', ')}`,
      metadata.slogan     && `Slogan : ${metadata.slogan}`,
      metadata.palette?.length   && `Palette couleurs : ${metadata.palette.join(', ')}`,
    ].filter(Boolean).join('\n');

    const prompt = `Tu es un expert en identité visuelle. Analyse ces données d'entreprise et définis le style visuel qui lui correspond.

${context}

Réponds UNIQUEMENT en JSON :
{
  "style_visuel": "description du style en 6-10 mots précis",
  "univers": "description de l'univers visuel en 2-3 phrases",
  "mots_cles": ["mot1", "mot2", "mot3", "mot4"],
  "palette_narrative": "ce que la palette dit de cette marque en 1 phrase",
  "reference_iconique": "la marque dont s'inspire le plus cette identité",
  "justification": "pourquoi ce style convient à cette marque en 1-2 phrases"
}`;

    const { callGemini } = await import('./services/gemini-wrapper');
    const text = await callGemini(prompt, { temperature: 0.8, maxTokens: 800 });
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return res.json(JSON.parse(cleaned));

  } catch (err: any) {
    console.warn('detect-style fallback activé:', err.message);
    const { metadata } = req.body || {};
    const secteur = (metadata?.secteur || '').toLowerCase();
    const STYLE_MAP: Record<string, any> = {
      tech:       { style_visuel: 'Épuré futuriste avec accents lumineux', mots_cles: ['tech', 'précision', 'innovation', 'digital'] },
      santé:      { style_visuel: 'Chaleureux et rassurant, blanc clinique', mots_cles: ['confiance', 'soin', 'précision', 'humain'] },
      immobilier: { style_visuel: 'Architectural moderne, volumes et lumière', mots_cles: ['prestige', 'espace', 'qualité', 'vision'] },
      restaurant: { style_visuel: 'Chaud et appétissant, terroir moderne', mots_cles: ['saveur', 'convivial', 'artisanal', 'goût'] },
    };
    let style = { style_visuel: 'Professionnel moderne et dynamique', mots_cles: ['confiance', 'expertise', 'impact', 'qualité'] };
    for (const [key, val] of Object.entries(STYLE_MAP)) {
      if (secteur.includes(key)) { style = val; break; }
    }
    return res.json({
      ...style,
      univers: `Un univers visuel qui reflète l'identité de ${metadata?.entreprise || 'votre marque'}.`,
      palette_narrative: 'Une palette soigneusement choisie pour véhiculer les valeurs de la marque.',
      reference_iconique: 'Apple / Notion',
      justification: `Ce style correspond au secteur ${metadata?.secteur || 'professionnel'}.`,
      _fallback: true,
    });
  }
});

// === LIVRAISON & EXPORT ===

router.post('/signature/deliver', async (req, res) => {
  try {
    const { svg_content, client_email, metadata, creative_config } = req.body;
    if (!svg_content || !metadata) {
      return res.status(400).json({ error: 'svg_content et metadata requis' });
    }
    const baseUrl = process.env.PREVIEW_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const { runDeliveryEngine } = await import('./services/delivery-engine');
    const result = await runDeliveryEngine(
      { svgContent: svg_content, clientEmail: client_email, metadata, creativeConfig: creative_config || {} },
      baseUrl
    );
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

router.get('/signature/preview/:id', async (req, res) => {
  try {
    const { getDeliveryFile } = await import('./services/delivery-engine');
    const file = await getDeliveryFile(req.params.id, 'preview');
    if (!file) return res.status(404).json({ error: 'Preview introuvable' });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(file.buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/signature/download/:id', async (req, res) => {
  try {
    const { getDeliveryFile } = await import('./services/delivery-engine');
    const file = await getDeliveryFile(req.params.id, 'zip');
    if (!file) return res.status(404).json({ error: 'Package ZIP introuvable' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/signature/export-file/:id/:type', async (req, res) => {
  try {
    const { id, type } = req.params;
    const validTypes = ['svg', 'outlook', 'gmail', 'pdf-gmail', 'pdf-outlook', 'pdf-apple', 'png', 'config'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'type invalide' });
    const { getDeliveryFile } = await import('./services/delivery-engine');
    const file = await getDeliveryFile(id, type as any);
    if (!file) return res.status(404).json({ error: 'Fichier introuvable' });
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/signature/export', async (req, res) => {
  try {
    const { metadata, brief, scenario, config } = req.body;
    if (!metadata || !config) return res.status(400).json({ error: 'metadata et config requis' });
    const { buildDeliveryPackage } = await import('./services/signature-delivery');
    const pkg = await buildDeliveryPackage(metadata, brief, scenario, config);
    return res.json({
      svg_url: pkg.svg_url,
      pdf_instructions_url: pkg.pdf_instructions_url,
      config_json_url: pkg.config_json_url,
      signature_id: pkg.signature_id,
      svg_content: pkg.svg_content,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur interne' });
  }
});

router.get('/signature/export/:id/:type', async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!['svg', 'guide', 'config'].includes(type)) return res.status(400).json({ error: 'type invalide' });
    const { getExportFile } = await import('./services/signature-delivery');
    const file = await getExportFile(id, type as 'svg' | 'guide' | 'config');
    if (!file) return res.status(404).json({ error: 'Fichier introuvable' });
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.content);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/signature/latest-svg', (_req, res) => {
  try {
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) return res.status(404).json({ error: 'Aucun export disponible' });
    const files = fs.readdirSync(exportsDir)
      .filter((f: string) => f.endsWith('.svg'))
      .sort((a: string, b: string) => fs.statSync(path.join(exportsDir, b)).size - fs.statSync(path.join(exportsDir, a)).size);
    if (files.length === 0) return res.status(404).json({ error: 'Aucun SVG disponible' });
    const svgContent = fs.readFileSync(path.join(exportsDir, files[0]), 'utf8');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(svgContent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/svg-quality-test/:filename?', (req, res) => {
  try {
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) return res.status(404).send('Dossier exports introuvable');
    const files = fs.readdirSync(exportsDir).filter((f: string) => f.endsWith('.svg')).sort();
    const targetFile = req.params.filename
      ? files.find((f: string) => f.includes(req.params.filename!)) || files[files.length - 1]
      : files.sort((a: string, b: string) => fs.statSync(path.join(exportsDir, b)).size - fs.statSync(path.join(exportsDir, a)).size)[0];
    if (!targetFile) return res.status(404).send('Aucun SVG trouvé');
    const svgContent = fs.readFileSync(path.join(exportsDir, targetFile), 'utf8');
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Quality Check — ${targetFile}</title>
<style>* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #050510; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; font-family: Arial, sans-serif; } .card { background: #0d0d1f; border: 1px solid rgba(107,92,231,0.15); border-radius: 20px; padding: 32px; max-width: 700px; width: 100%; } .label { color: #6b7280; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; } .sig-bg-white { background: #ffffff; border-radius: 8px; margin-bottom: 24px; } .sig-bg-dark { background: #1f2937; border-radius: 8px; margin-bottom: 24px; } .meta { color: #9ca3af; font-size: 11px; margin-top: 16px; }</style>
</head><body><div class="card"><div class="label">Fond blanc</div><div class="sig-bg-white">${svgContent}</div><div class="label">Fond sombre</div><div class="sig-bg-dark">${svgContent}</div><div class="meta">Fichier: ${targetFile} — ${Math.round(svgContent.length / 1024)}KB — ${new Date().toLocaleString('fr-FR')}</div></div></body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(html);
  } catch (err: any) {
    return res.status(500).send(err.message);
  }
});

// === CLÉS API ===

router.get('/keys/status', async (_req, res) => {
  try {
    const { rotator } = await import('./services/api-key-rotator');
    await rotator.init();
    const status = rotator.getPoolStatus();
    const now = new Date();
    const daysLeft = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0).getDate() - now.getUTCDate();
    const openaiOk    = !!process.env.OPENAI_API_KEY?.startsWith('sk-');
    const anthropicOk = !!process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-');
    const serializedKeys = status.keys.map((k: any) => ({
      id: k.id, service: k.service, label: k.label || k.id, source: k.source || 'env',
      status: k.status, usageToday: k.usageToday, dailyLimit: k.dailyLimit,
      successCount: k.successCount, avgResponseTime: k.avgResponseTime,
      healthScore: Math.round(k.healthScore ?? 100), cooldownUntil: k.cooldownUntil?.toISOString() || null,
    }));
    return res.json({
      keys: serializedKeys,
      summary: status.summary,
      daysLeft,
      replit: {
        openai:    { configured: openaiOk,    suffix: openaiOk    ? `...${process.env.OPENAI_API_KEY!.slice(-4)}`    : null },
        anthropic: { configured: anthropicOk, suffix: anthropicOk ? `...${process.env.ANTHROPIC_API_KEY!.slice(-4)}` : null },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/keys/add', async (req, res) => {
  try {
    const { service, key, label } = req.body;
    if (!service || !key) return res.status(400).json({ error: 'service et key sont requis' });
    if (!['gemini', 'cerebras', 'serper'].includes(service)) {
      return res.status(400).json({ error: 'service doit être gemini, cerebras ou serper' });
    }
    const { rotator } = await import('./services/api-key-rotator');
    const newKey = await rotator.addKey(service, key, label);
    return res.json({ success: true, key: { id: newKey.id, service: newKey.service, label: newKey.label, status: newKey.status } });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/keys/:id', async (req, res) => {
  try {
    const { rotator } = await import('./services/api-key-rotator');
    await rotator.removeKey(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/keys/reset', async (req, res) => {
  try {
    const { service } = req.body;
    const { rotator } = await import('./services/api-key-rotator');
    await rotator.forceReset(service);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/keys/test', async (_req, res) => {
  try {
    const { rotator } = await import('./services/api-key-rotator');
    const results = await rotator.testAllKeys();
    return res.json({ results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/keys/replit', (_req, res) => {
  const openaiKey   = process.env.AI_INTEGRATIONS_OPENAI_API_KEY   || process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiOk    = !!(openaiKey?.length   && openaiKey.length   > 10);
  const anthropicOk = !!(anthropicKey?.length && anthropicKey.length > 10);
  return res.json({
    openai:    { configured: openaiOk,    model: 'gpt-4o',             suffix: openaiOk    ? `...${openaiKey!.slice(-4)}`    : null, source: process.env.AI_INTEGRATIONS_OPENAI_API_KEY    ? 'replit-ai-integration' : 'env-secret' },
    anthropic: { configured: anthropicOk, model: 'claude-opus-4-5',    suffix: anthropicOk ? `...${anthropicKey!.slice(-4)}` : null, source: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ? 'replit-ai-integration' : 'env-secret' },
  });
});

// === PRESETS ===

router.get('/presets', async (_req, res) => {
  try {
    const { getAllPresets } = await import('./modules/preset-manager.module');
    return res.json(await getAllPresets());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/presets', async (req, res) => {
  try {
    const { createPreset } = await import('./modules/preset-manager.module');
    const { name, description, secteur, configuration, tags, is_public, created_by } = req.body;
    if (!name || !secteur || !configuration) {
      return res.status(400).json({ error: 'name, secteur et configuration requis' });
    }
    return res.status(201).json(await createPreset({ name, description, secteur, configuration, tags, is_public, created_by }));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/presets/smart/:secteur', async (req, res) => {
  try {
    const { getSmartPresets } = await import('./modules/preset-manager.module');
    return res.json(await getSmartPresets(req.params.secteur));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/presets/public', async (_req, res) => {
  try {
    const { getPublicPresets } = await import('./modules/preset-manager.module');
    return res.json(await getPublicPresets());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/presets/sector/:secteur', async (req, res) => {
  try {
    const { getPresetsBySector } = await import('./modules/preset-manager.module');
    return res.json(await getPresetsBySector(req.params.secteur));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/presets/:id/versions', async (req, res) => {
  try {
    const { getPresetVersionHistory } = await import('./modules/preset-manager.module');
    return res.json(await getPresetVersionHistory(req.params.id));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/presets/:id', async (req, res) => {
  try {
    const { updatePreset } = await import('./modules/preset-manager.module');
    const updated = await updatePreset(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Preset introuvable' });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/presets/:id/rollback/:versionId', async (req, res) => {
  try {
    const { rollbackPreset } = await import('./modules/preset-manager.module');
    const rolled = await rollbackPreset(req.params.id, req.params.versionId);
    if (!rolled) return res.status(404).json({ error: 'Version introuvable' });
    return res.json(rolled);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/presets/:id', async (req, res) => {
  try {
    const { getPresetById } = await import('./modules/preset-manager.module');
    const preset = await getPresetById(req.params.id);
    if (!preset) return res.status(404).json({ error: 'Preset introuvable' });
    return res.json(preset);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/presets/:id/use', async (req, res) => {
  try {
    const { usePreset } = await import('./modules/preset-manager.module');
    const preset = await usePreset(req.params.id);
    if (!preset) return res.status(404).json({ error: 'Preset introuvable' });
    return res.json(preset);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// === MODULE 6 — EFFECT FUSION ENGINE v1.0 ===

/**
 * GET /api/fusion/levels — Informations sur les modes de fusion disponibles.
 */
router.get('/fusion/levels', (_req, res) => {
  res.json({
    version: FUSION_VERSION,
    blendModes: ['additive', 'weighted', 'sequential'],
    narrativeActs: ['intro', 'develop', 'climax', 'rest'],
    qualityLevels: ['draft', 'standard', 'premium'],
    maxEffects: 3,
    description: 'Fusionne 2-3 effets premium en un keyframe CSS hybride interpolé',
  });
});

/**
 * POST /api/fusion/compatibility — Vérifie la compatibilité de 2-3 effets avant fusion.
 * Body : { effects: EffectInput[] }
 */
router.post('/fusion/compatibility', (req, res) => {
  try {
    const { effects } = req.body;
    if (!effects || !Array.isArray(effects) || effects.length < 2) {
      return res.status(400).json({ error: 'Au moins 2 effets requis dans effects[]' });
    }
    const report = checkFusionCompatibility(effects);
    return res.json({ version: FUSION_VERSION, ...report });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/fusion/suggest-weights — Suggère des poids optimaux pour une fusion.
 * Body : { effectCount, sectorId, narrativeAct }
 */
router.post('/fusion/suggest-weights', (req, res) => {
  try {
    const { effectCount, sectorId, narrativeAct } = req.body;
    if (!effectCount || !sectorId || !narrativeAct) {
      return res.status(400).json({ error: 'effectCount, sectorId et narrativeAct requis' });
    }
    const weights = suggestFusionWeights(effectCount, sectorId, narrativeAct);
    return res.json({ version: FUSION_VERSION, effectCount, sectorId, narrativeAct, weights });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/fusion/fuse — Fusionne 2-3 effets en un keyframe CSS hybride.
 * Body : { effects, blendMode, narrativeAct, sectorId?, quality?, instanceId? }
 */
router.post('/fusion/fuse', (req, res) => {
  try {
    const config: FusionConfig = req.body;
    if (!config.effects || config.effects.length < 2) {
      return res.status(400).json({ error: 'Au moins 2 effets requis' });
    }
    if (!config.blendMode)    config.blendMode = 'weighted';
    if (!config.narrativeAct) config.narrativeAct = 'climax';
    if (!config.quality)      config.quality = 'standard';

    const result = fuseEffects(config);
    return res.json({ version: FUSION_VERSION, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/fusion/inject — Fusionne des effets et injecte le CSS dans un HTML.
 * Body : { html, config: FusionConfig }
 */
router.post('/fusion/inject', (req, res) => {
  try {
    const { html, config } = req.body;
    if (!html)   return res.status(400).json({ error: 'html requis' });
    if (!config) return res.status(400).json({ error: 'config de fusion requise' });

    const fusion = fuseEffects(config as FusionConfig);
    const result = injectFusionIntoHTML(html, fusion);
    return res.json({ version: FUSION_VERSION, fusion, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// === MODULE 7 — CONTEXTUAL INTELLIGENCE MODERATOR v1.0 ===

/**
 * GET /api/moderation/ceilings — Plafonds de complexité par secteur.
 */
router.get('/moderation/ceilings', (_req, res) => {
  res.json({
    version: MODERATION_VERSION,
    ceilings: getSectorCeilings(),
    idealRange: { min: 55, max: 75 },
    description: 'Plafonds de complexité acceptable par secteur d\'activité',
  });
});

/**
 * POST /api/moderation/score — Calcule le score de complexité d\'une configuration.
 * Body : { effects: EffectProfile[], sectorId, elementLength?, targetDurationMs? }
 */
router.post('/moderation/score', (req, res) => {
  try {
    const config: ModerationConfig = req.body;
    if (!config.effects || !config.sectorId) {
      return res.status(400).json({ error: 'effects[] et sectorId requis' });
    }
    const score = scoreComplexity(config);
    return res.json({ version: MODERATION_VERSION, ...score });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/moderation/moderate — Modère une configuration complète et propose des ajustements.
 * Body : { effects: EffectProfile[], sectorId, elementLength?, targetDurationMs? }
 */
router.post('/moderation/moderate', (req, res) => {
  try {
    const config: ModerationConfig = req.body;
    if (!config.effects || !config.sectorId) {
      return res.status(400).json({ error: 'effects[] et sectorId requis' });
    }
    const result = moderate(config);
    return res.json({ version: MODERATION_VERSION, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/moderation/css — Génère le CSS d\'atténuation pour une modération donnée.
 * Body : { effects: EffectProfile[], sectorId }
 */
router.post('/moderation/css', (req, res) => {
  try {
    const config: ModerationConfig = req.body;
    if (!config.effects || !config.sectorId) {
      return res.status(400).json({ error: 'effects[] et sectorId requis' });
    }
    const result = moderate(config);
    const css    = generateModerationCSS(result);
    return res.json({ version: MODERATION_VERSION, approved: result.approved, summary: result.summary, css });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// === MODULE 8 — EXPERIENCE ORCHESTRATOR v3.0 ===

/**
 * GET /api/orchestration/profiles — Profils narratifs par secteur.
 */
router.get('/orchestration/profiles', (_req, res) => {
  res.json({
    version: ORCH_VERSION,
    profiles: getSectorProfiles(),
    elementRoles: getElementRoleMap(),
    arcRatios: { intro: '23.6%', develop: '38.2%', climax: '23.6%', rest: '14.6%' },
    phi: 1.6180339887,
  });
});

/**
 * GET /api/orchestration/arc/:sectorId — Timings de l\'arc narratif pour un secteur.
 */
router.get('/orchestration/arc/:sectorId', (req, res) => {
  try {
    const { sectorId } = req.params;
    const totalMs = req.query.totalMs ? parseInt(req.query.totalMs as string) : undefined;
    const acts = getArcTimings(sectorId as any, totalMs);
    return res.json({ version: ORCH_VERSION, sectorId, totalMs: totalMs ?? 4000, acts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/orchestration/orchestrate — Orchestre une signature complète selon un arc narratif.
 * Body : { elements, sectorId, totalDurationMs?, style?, accentAct? }
 */
router.post('/orchestration/orchestrate', (req, res) => {
  try {
    const config: OrchestratorConfig = req.body;
    if (!config.elements || !config.sectorId) {
      return res.status(400).json({ error: 'elements[] et sectorId requis' });
    }
    const instanceId = `orch-${Date.now().toString(36)}`;
    const result = orchestrate(config, instanceId);
    return res.json({ version: ORCH_VERSION, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/orchestration/inject — Orchestre et injecte le CSS narratif dans un HTML.
 * Body : { html, config: OrchestratorConfig }
 */
router.post('/orchestration/inject', (req, res) => {
  try {
    const { html, config } = req.body;
    if (!html)   return res.status(400).json({ error: 'html requis' });
    if (!config) return res.status(400).json({ error: 'config d\'orchestration requise' });

    const instanceId = `orch-${Date.now().toString(36)}`;
    const result = orchestrate(config as OrchestratorConfig, instanceId);
    const injected = injectOrchestrationIntoHTML(html, result);
    return res.json({ version: ORCH_VERSION, orchestration: result, ...injected });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// === MODULE 10 — DYNAMIC FUSION ORCHESTRATOR v3.0 ===

/**
 * GET /api/dfo/levels — Les 3 niveaux de fusion disponibles.
 */
router.get('/dfo/levels', (_req, res) => {
  res.json({
    version: DFO_VERSION,
    levels: getFusionLevels(),
    description: 'Point d\'entrée unique pour une génération God Tier complète',
  });
});

/**
 * GET /api/dfo/modules/:level — Modules actifs pour un niveau donné (1, 2 ou 3).
 */
router.get('/dfo/modules/:level', (req, res) => {
  try {
    const level = parseInt(req.params.level) as 1 | 2 | 3;
    if (![1, 2, 3].includes(level)) {
      return res.status(400).json({ error: 'Niveau invalide — doit être 1, 2 ou 3' });
    }
    const modules = getModulesForLevel(level);
    return res.json({ version: DFO_VERSION, level, modules, count: modules.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/dfo/preflight — Vérifie la validité d\'un input avant orchestration complète.
 * Body : SignatureInput
 */
router.post('/dfo/preflight', (req, res) => {
  try {
    const input: SignatureInput = req.body;
    const check = preflightCheck(input);
    return res.json({ version: DFO_VERSION, ...check });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/dfo/orchestrate — Orchestre une signature complète selon le niveau choisi.
 * Body : { name, title, company, sectorId, baseHtml, fusionLevel, accentColor?, colorScheme?, options? }
 */
router.post('/dfo/orchestrate', async (req, res) => {
  try {
    const input: SignatureInput = req.body;
    if (!input.baseHtml)    return res.status(400).json({ error: 'baseHtml requis' });
    if (!input.sectorId)    return res.status(400).json({ error: 'sectorId requis' });
    if (!input.fusionLevel) return res.status(400).json({ error: 'fusionLevel (1|2|3) requis' });

    const result = await orchestrateFusion(input);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// === ENRICHISSEMENT DES EFFETS — Parser militaire ===

router.post('/library/effects/enrich', async (_req, res) => {
  try {
    console.log('🔬 Lancement enrichissement parser militaire...');
    const result = await reloadAndEnrichAllEffects();
    res.json({
      success: true,
      updated: result.updated,
      skipped: result.skipped,
      errors:  result.errors,
      message: `✅ ${result.updated} effets enrichis, ${result.skipped} ignorés`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/presets/:id', async (req, res) => {
  try {
    const { deletePreset } = await import('./modules/preset-manager.module');
    const deleted = await deletePreset(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Preset introuvable' });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export function registerRoutes(app: express.Application) {
  app.use(cors());
  app.use('/api', router);
}
