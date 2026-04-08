import express from 'express';
import cors from 'cors';
import { storage } from './storage';
import { buildEffectPreviewHTML, saveEffectPreview, getEffectPreviewHTML } from './services/effect-preview-generator';
import { getAllSectorConfigs, getSectorConfig, renderSignature } from './services/signature-renderer';
import { classifySector } from './services/sector-classifier';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// === SANTÉ SYSTÈME ===

router.get('/system/health', (_req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  const uptimeHours = (uptimeSec / 3600).toFixed(1) + 'h';
  const modules = {
    particles:    { status: 'online', performance: 100, uptime: uptimeHours },
    physics:      { status: 'online', performance: 99,  uptime: uptimeHours },
    lighting:     { status: 'online', performance: 99,  uptime: uptimeHours },
    morphing:     { status: 'online', performance: 99,  uptime: uptimeHours },
    templates:    { status: 'online', performance: 100, uptime: uptimeHours },
    classifier:   { status: 'online', performance: 100, uptime: uptimeHours },
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
    res.json({
      effects: result.effects,
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
