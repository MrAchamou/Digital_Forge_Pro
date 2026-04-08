import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SECTORS_DIR = path.resolve(__dirname, '../templates/sectors');
const HBS_DIR = path.resolve(__dirname, '../templates/hbs');

export interface SectorConfig {
  id: string;
  label: string;
  emoji: string;
  description: string;
  keywords: string[];
  palette: {
    background: string;
    accent: string;
    text: string;
    muted: string;
    border: string;
  };
  animation?: {
    name: string;
    intensity: 'low' | 'medium' | 'high';
    keyframes: string;
    selector: string;
    cssAnimation: string;
  };
  layout: {
    format: string;
    width: number;
    height: number;
    photoPosition: string;
    logoSize: string;
    emphasis: string;
  };
  effects: {
    primary: string;
    secondary: string;
    accent: string;
    intensity: string;
    locked: boolean;
  };
  fields: Array<{
    key: string;
    label: string;
    required: boolean;
    type: string;
  }>;
  tone: string;
  cta: string;
}

export interface SignatureData {
  nom?: string;
  titre?: string;
  entreprise?: string;
  telephone?: string;
  email?: string;
  site?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  note?: number;
  horaires?: string;
  photo_url?: string;
  logo_url?: string;
  instagram?: string;
  linkedin?: string;
  portfolio?: string;
  zone?: string;
  urgence?: string;
  siret?: string;
  diplome?: string;
  assurance?: string;
  agence?: string;
  cabinet?: string;
  ordre?: string;
  competences?: string;
  niveaux?: string;
  certifications?: string;
  etablissement?: string;
  disponibilite?: string;
  vehicule?: string;
  [key: string]: any;
}

const templateCache = new Map<string, HandlebarsTemplateDelegate>();
const configCache = new Map<string, SectorConfig>();

Handlebars.registerHelper('ifCond', function(this: any, v1: any, v2: any, options: any) {
  return v1 === v2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('formatPhone', function(phone: string) {
  if (!phone) return '';
  return phone.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
});

Handlebars.registerHelper('formatUrl', function(url: string) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
});

Handlebars.registerHelper('stars', function(note: number) {
  if (!note) return '';
  const full = Math.floor(note);
  return '★'.repeat(full) + (note % 1 >= 0.5 ? '½' : '');
});

function loadSectorConfig(sectorId: string): SectorConfig {
  if (configCache.has(sectorId)) return configCache.get(sectorId)!;
  const filePath = path.join(SECTORS_DIR, `${sectorId}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Secteur inconnu: ${sectorId}`);
  }
  const config = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SectorConfig;
  configCache.set(sectorId, config);
  return config;
}

function loadHbsTemplate(sectorId: string): HandlebarsTemplateDelegate {
  if (templateCache.has(sectorId)) return templateCache.get(sectorId)!;
  const filePath = path.join(HBS_DIR, `${sectorId}.hbs`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template HBS manquant: ${sectorId}.hbs`);
  }
  const source = fs.readFileSync(filePath, 'utf-8');
  const compiled = Handlebars.compile(source);
  templateCache.set(sectorId, compiled);
  return compiled;
}

function prepareData(raw: SignatureData): SignatureData {
  const d = { ...raw };
  if (d.competences && typeof d.competences === 'string') {
    (d as any).competencesList = d.competences.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean);
  }
  if (d.horaires && Array.isArray(d.horaires)) {
    d.horaires = (d.horaires as any[]).join(' | ');
  }
  if (d.note && typeof d.note === 'number') {
    d.note = Math.round(d.note * 10) / 10 as any;
  }
  return d;
}

export function getAllSectorIds(): string[] {
  return fs.readdirSync(SECTORS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

export function getAllSectorConfigs(): SectorConfig[] {
  return getAllSectorIds().map(id => loadSectorConfig(id));
}

export function getSectorConfig(sectorId: string): SectorConfig {
  return loadSectorConfig(sectorId);
}

export function renderSignature(sectorId: string, data: SignatureData): string {
  const config = loadSectorConfig(sectorId);
  const template = loadHbsTemplate(sectorId);

  const context = {
    palette: config.palette,
    animation: config.animation,
    layout: config.layout,
    effects: config.effects,
    tone: config.tone,
    cta: config.cta,
    sector: {
      id: config.id,
      label: config.label,
      emoji: config.emoji,
    },
    data: prepareData(data),
  };

  return template(context);
}

export function renderSignatureFragment(sectorId: string, data: SignatureData): string {
  const config = loadSectorConfig(sectorId);

  const styleBlock = buildStyleBlock(config);
  const bodyHtml = buildBodyHtml(config, prepareData(data));

  return `${styleBlock}\n${bodyHtml}`;
}

function buildStyleBlock(config: SectorConfig): string {
  return `<style>
:root {
  --sig-bg: ${config.palette.background};
  --sig-accent: ${config.palette.accent};
  --sig-text: ${config.palette.text};
  --sig-muted: ${config.palette.muted};
  --sig-border: ${config.palette.border};
}
${config.animation?.keyframes ?? ''}
</style>`;
}

function buildBodyHtml(config: SectorConfig, data: SignatureData): string {
  const template = loadHbsTemplate(config.id);
  const full = template({
    palette: config.palette,
    animation: config.animation,
    layout: config.layout,
    data,
  });
  const bodyMatch = full.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : full;
}

export function clearTemplateCache(): void {
  templateCache.clear();
  configCache.clear();
}
