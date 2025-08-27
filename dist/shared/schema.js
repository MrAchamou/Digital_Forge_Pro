var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export var users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export var effects = pgTable("effects", {
    id: varchar("id").primaryKey().default(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    name: text("name").notNull(),
    description: text("description").notNull(),
    type: text("type").notNull(), // 'PARTICLE', 'PHYSICS', 'LIGHTING', 'MORPHING'
    category: text("category").notNull(), // 'EXPLOSION', 'TRANSITION', 'AMBIENT', etc.
    platform: text("platform").notNull(), // 'javascript', 'react', 'aftereffects', 'premiere'
    code: text("code").notNull(),
    parameters: jsonb("parameters").notNull(),
    metadata: jsonb("metadata").notNull(),
    tags: text("tags").array().notNull().default(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["'{}'"], ["'{}'"])))),
    complexity: integer("complexity").notNull().default(1), // 1-10
    performance: text("performance").notNull().default('medium'), // 'low', 'medium', 'high'
    rating: real("rating").default(0),
    downloads: integer("downloads").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    version: text("version").notNull().default('1.0.0'),
});
export var jobs = pgTable("jobs", {
    id: varchar("id").primaryKey().default(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    description: text("description").notNull(),
    platform: text("platform").notNull(),
    options: jsonb("options").notNull(),
    status: text("status").notNull().default('queued'), // 'queued', 'processing', 'completed', 'failed'
    progress: integer("progress").default(0), // 0-100
    result: jsonb("result"),
    error: text("error"),
    estimatedTime: integer("estimated_time"), // in seconds
    actualTime: integer("actual_time"), // in seconds
    createdAt: timestamp("created_at").defaultNow(),
    completedAt: timestamp("completed_at"),
});
export var uploads = pgTable("uploads", {
    id: varchar("id").primaryKey().default(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    path: text("path").notNull(),
    status: text("status").notNull().default('processing'), // 'processing', 'completed', 'failed'
    processedCount: integer("processed_count").default(0),
    totalCount: integer("total_count").default(0),
    errors: text("errors").array().default(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["'{}'"], ["'{}'"])))),
    createdAt: timestamp("created_at").defaultNow(),
});
export var systemMetrics = pgTable("system_metrics", {
    id: varchar("id").primaryKey().default(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
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
// Insert schemas
export var insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export var insertEffectSchema = createInsertSchema(effects).omit({
    id: true,
    createdAt: true,
    rating: true,
    downloads: true,
});
export var insertJobSchema = createInsertSchema(jobs).omit({
    id: true,
    status: true,
    progress: true,
    result: true,
    error: true,
    actualTime: true,
    createdAt: true,
    completedAt: true,
});
export var insertUploadSchema = createInsertSchema(uploads).omit({
    id: true,
    status: true,
    processedCount: true,
    totalCount: true,
    errors: true,
    createdAt: true,
});
export var insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
    id: true,
    timestamp: true,
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
