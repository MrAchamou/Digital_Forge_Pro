import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp, boolean, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const effects = pgTable("effects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  platform: text("platform").notNull(),
  code: text("code").notNull(),
  parameters: jsonb("parameters").notNull(),
  metadata: jsonb("metadata").notNull(),
  tags: text("tags").array().notNull().default(sql`'{}'`),
  complexity: integer("complexity").notNull().default(1),
  performance: text("performance").notNull().default('medium'),
  rating: real("rating").default(0),
  downloads: integer("downloads").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  version: text("version").notNull().default('1.0.0'),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  platform: text("platform").notNull(),
  options: jsonb("options").notNull(),
  status: text("status").notNull().default('queued'),
  progress: integer("progress").default(0),
  result: jsonb("result"),
  error: text("error"),
  estimatedTime: integer("estimated_time"),
  actualTime: integer("actual_time"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  status: text("status").notNull().default('processing'),
  processedCount: integer("processed_count").default(0),
  totalCount: integer("total_count").default(0),
  errors: text("errors").array().default(sql`'{}'`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpuUsage: real("cpu_usage").notNull(),
  memoryUsage: real("memory_usage").notNull(),
  gpuUsage: real("gpu_usage").notNull(),
  networkIO: real("network_io").notNull(),
  storageUsed: real("storage_used").notNull(),
  queueSize: integer("queue_size").notNull(),
  activeJobs: integer("active_jobs").notNull(),
  completedJobs: integer("completed_jobs").notNull(),
  failedJobs: integer("failed_jobs").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// ─── Analytics Events ─────────────────────────────────────────────────────────
export const analyticsEvents = pgTable("analytics_events", {
  id:                  varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  secteur:             text("secteur").notNull(),
  entreprise:          text("entreprise").notNull(),
  duration_ms:         integer("duration_ms").notNull(),
  variations:          jsonb("variations").notNull(),
  pipeline_scores:     jsonb("pipeline_scores").notNull(),
  rendering_profiles:  jsonb("rendering_profiles").notNull(),
  optimisations_count: integer("optimisations_count").notNull().default(0),
  status:              text("status").notNull().default('success'),
  config_hash:         text("config_hash"),
  createdAt:           timestamp("created_at").defaultNow(),
});

// ─── Visual Fingerprints ───────────────────────────────────────────────────────
export const visualFingerprints = pgTable("visual_fingerprints", {
  id:              varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fingerprint_id:  text("fingerprint_id").notNull().unique(),
  seed:            bigint("seed", { mode: "number" }).notNull(),
  entropy:         real("entropy").notNull(),
  style_token:     text("style_token").notNull(),
  micro_variations: jsonb("micro_variations").notNull(),
  phase_offsets:   jsonb("phase_offsets").notNull(),
  secteur:         text("secteur").notNull().default('default'),
  variation:       text("variation").notNull().default('A'),
  createdAt:       timestamp("created_at").defaultNow(),
});

// ─── User Preferences ─────────────────────────────────────────────────────────
export const userPreferences = pgTable("user_preferences", {
  id:                  varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id:             text("user_id").notNull().unique(),
  favorite_effects:    jsonb("favorite_effects").notNull().default(sql`'{}'::jsonb`),
  rejected_effects:    text("rejected_effects").array().notNull().default(sql`'{}'`),
  preferred_style:     text("preferred_style"),
  preferred_intensity: real("preferred_intensity"),
  sector_history:      text("sector_history").array().notNull().default(sql`'{}'`),
  variation_choices:   jsonb("variation_choices").notNull().default(sql`'{}'::jsonb`),
  session_count:       integer("session_count").notNull().default(0),
  cluster_label:       text("cluster_label"),
  last_active:         timestamp("last_active").defaultNow(),
  createdAt:           timestamp("created_at").defaultNow(),
});

// ─── Presets ──────────────────────────────────────────────────────────────────
export const presets = pgTable("presets", {
  id:            varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name:          text("name").notNull(),
  description:   text("description").notNull().default(''),
  secteur:       text("secteur").notNull(),
  tags:          text("tags").array().notNull().default(sql`'{}'`),
  is_smart:      boolean("is_smart").notNull().default(false),
  is_public:     boolean("is_public").notNull().default(false),
  configuration: jsonb("configuration").notNull(),
  thumbnail_svg: text("thumbnail_svg"),
  usage_count:   integer("usage_count").notNull().default(0),
  version:       integer("version").notNull().default(1),
  parent_id:     varchar("parent_id"),
  created_by:    text("created_by").notNull().default('system'),
  last_used:     timestamp("last_used"),
  createdAt:     timestamp("created_at").defaultNow(),
});

// ─── API Key Configs ──────────────────────────────────────────────────────────
export const apiKeyConfigs = pgTable("api_key_configs", {
  id:         varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  service:    text("service").notNull(),
  key_value:  text("key_value").notNull(),
  label:      text("label").notNull().default(''),
  is_active:  boolean("is_active").notNull().default(true),
  source:     text("source").notNull().default('manual'),
  added_at:   timestamp("added_at").defaultNow(),
});

// ─── API Key States ───────────────────────────────────────────────────────────
export const apiKeyStates = pgTable("api_key_states", {
  key_id:           text("key_id").primaryKey(),
  service:          text("service").notNull(),
  status:           text("status").notNull().default('active'),
  usage_today:      integer("usage_today").notNull().default(0),
  cooldown_until:   timestamp("cooldown_until"),
  cooldown_count:   integer("cooldown_count").notNull().default(0),
  error_count:      integer("error_count").notNull().default(0),
  success_count:    integer("success_count").notNull().default(0),
  avg_response_ms:  integer("avg_response_ms").notNull().default(0),
  health_score:     real("health_score").notNull().default(100),
  calls_last_hour:  integer("calls_last_hour").notNull().default(0),
  hour_window_start: timestamp("hour_window_start").defaultNow(),
  last_used:        timestamp("last_used"),
  last_error:       text("last_error"),
  last_saved:       timestamp("last_saved").defaultNow(),
});

// ─── Pipeline Clients ─────────────────────────────────────────────────────────
export const pipelineClients = pgTable("pipeline_clients", {
  id:               varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // CRM
  numero_commande:  text("numero_commande").notNull().default(''),
  mode:             text("mode").notNull().default('demo'),        // 'demo' | 'reel'
  statut_crm:       text("statut_crm").notNull().default('en_attente'), // 'en_attente'|'en_cours'|'livre'|'confirme'|'annule'
  notes_interne:    text("notes_interne").notNull().default(''),
  montant:          text("montant").notNull().default(''),
  // Identité client
  nom:              text("nom").notNull(),
  prenom:           text("prenom").notNull().default(''),
  titre:            text("titre").notNull().default(''),
  entreprise:       text("entreprise").notNull().default(''),
  secteur:          text("secteur").notNull().default('autre'),
  telephone:        text("telephone").notNull().default(''),
  email:            text("email").notNull().default(''),
  site:             text("site").notNull().default(''),
  ville:            text("ville").notNull().default(''),
  logo_url:         text("logo_url").notNull().default(''),
  palette:          text("palette").array().notNull().default(sql`'{}'`),
  banniere_texte:   text("banniere_texte").notNull().default(''),
  banniere_lien:    text("banniere_lien").notNull().default(''),
  cta:              text("cta").notNull().default('Nous contacter'),
  white_label:      boolean("white_label").notNull().default(false),
  destinataire_nom:   text("destinataire_nom").notNull().default(''),
  destinataire_email: text("destinataire_email").notNull().default(''),
  objet_mail:       text("objet_mail").notNull().default(''),
  corps_mail:       text("corps_mail").notNull().default(''),
  // Pipeline technique
  status:           text("status").notNull().default('pending'),   // 'pending'|'en_cours'|'livre'|'erreur'
  signature_id:     text("signature_id"),
  gif_url:          text("gif_url"),
  demo_url:         text("demo_url"),
  zip_url:          text("zip_url"),
  copier_url:       text("copier_url"),
  error:            text("error"),
  createdAt:        timestamp("created_at").defaultNow(),
  updatedAt:        timestamp("updated_at").defaultNow(),
});

export const insertPipelineClientSchema = createInsertSchema(pipelineClients).omit({
  id: true, numero_commande: true, status: true, statut_crm: true,
  signature_id: true, gif_url: true, demo_url: true, zip_url: true,
  copier_url: true, error: true, createdAt: true, updatedAt: true,
});

export type PipelineClient = typeof pipelineClients.$inferSelect;
export type InsertPipelineClient = z.infer<typeof insertPipelineClientSchema>;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEffectSchema = createInsertSchema(effects).omit({
  id: true,
  createdAt: true,
  rating: true,
  downloads: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  status: true,
  progress: true,
  result: true,
  error: true,
  actualTime: true,
  createdAt: true,
  completedAt: true,
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  status: true,
  processedCount: true,
  totalCount: true,
  errors: true,
  createdAt: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export const insertVisualFingerprintSchema = createInsertSchema(visualFingerprints).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  last_active: true,
});

export const insertPresetSchema = createInsertSchema(presets).omit({
  id: true,
  createdAt: true,
  last_used: true,
  usage_count: true,
  version: true,
});

export const insertApiKeyConfigSchema = createInsertSchema(apiKeyConfigs).omit({
  id: true,
  added_at: true,
});

export const insertApiKeyStateSchema = createInsertSchema(apiKeyStates).omit({
  last_saved: true,
});

// Unified types from schema inference
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Effect = typeof effects.$inferSelect;
export type InsertEffect = z.infer<typeof insertEffectSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;

export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type VisualFingerprint = typeof visualFingerprints.$inferSelect;
export type InsertVisualFingerprint = z.infer<typeof insertVisualFingerprintSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferencesSchema>;

export type Preset = typeof presets.$inferSelect;
export type InsertPreset = z.infer<typeof insertPresetSchema>;

export type ApiKeyConfig = typeof apiKeyConfigs.$inferSelect;
export type InsertApiKeyConfig = z.infer<typeof insertApiKeyConfigSchema>;

export type ApiKeyState = typeof apiKeyStates.$inferSelect;
export type InsertApiKeyState = z.infer<typeof insertApiKeyStateSchema>;

// API Response types
export interface EffectGenerationResponse {
  jobId: string;
  estimatedTime: number;
  status: string;
}

export interface JobStatusResponse {
  id: string;
  status: string;
  progress: number;
  result?: any;
  error?: string;
  estimatedTime?: number;
  actualTime?: number;
}

export interface EffectAnalysis {
  concepts: string[];
  confidence: number;
  modules: string[];
  parameters: Record<string, any>;
  complexity: number;
  estimatedDuration: number;
}

export interface SystemHealth {
  overall: number;
  modules: Record<string, { status: string; load: number; effectCount: number }>;
  queue: { size: number; processing: number; failed: number };
  resources: {
    cpu: number;
    memory: number;
    gpu: number;
    network: number;
    storage: number;
  };
}

// Express extensions for custom properties
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
      files?: any[];
    }
  }
}