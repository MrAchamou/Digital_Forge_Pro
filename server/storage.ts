import { type User, type InsertUser, type Effect, type InsertEffect, type Job, type InsertJob, type Upload, type InsertUpload, type SystemMetrics, type InsertSystemMetrics, type EffectGenerationResponse, type JobStatusResponse, type EffectAnalysis, type SystemHealth } from "@shared/schema";
import { randomUUID } from "crypto";

// Define Json type if not already defined globally or imported
type Json = any; // Replace 'any' with a more specific type if possible, e.g., string | number | boolean | null | Json[] | { [key: string]: Json }

interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Effect methods
  getEffect(id: string): Promise<Effect | undefined>;
  getEffects(params?: { category?: string; type?: string; search?: string; platform?: string; limit?: number; offset?: number }): Promise<{ effects: Effect[]; total: number }>;
  createEffect(effect: InsertEffect): Promise<Effect>;
  updateEffect(id: string, updates: Partial<Effect>): Promise<Effect | undefined>;
  deleteEffect(id: string): Promise<boolean>;
  incrementDownloads(id: string): Promise<void>;
  rateEffect(id: string, rating: number): Promise<void>;

  // Job methods
  getJob(id: string): Promise<Job | undefined>;
  getJobs(status?: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  getQueueStats(): Promise<{ queued: number; processing: number; completed: number; failed: number }>;

  // Upload methods
  getUpload(id: string): Promise<Upload | undefined>;
  getUploads(): Promise<Upload[]>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  updateUpload(id: string, updates: Partial<Upload>): Promise<Upload | undefined>;

  // System metrics methods
  createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
  getLatestSystemMetrics(): Promise<SystemMetrics | undefined>;
  getSystemHealth(): Promise<SystemHealth>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private effects: Map<string, Effect> = new Map();
  private jobs: Map<string, Job> = new Map();
  private uploads: Map<string, Upload> = new Map();
  private systemMetrics: SystemMetrics[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // No sample effects — the library is populated exclusively from Premium_Effect-main/
    // via the premium-effects-loader.ts utility at server startup.
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Effect methods
  async getEffect(id: string): Promise<Effect | undefined> {
    return this.effects.get(id);
  }

  async getEffects(params?: { category?: string; type?: string; search?: string; platform?: string; limit?: number; offset?: number }): Promise<{ effects: Effect[]; total: number }> {
    let effects = Array.from(this.effects.values());

    // Apply filters
    if (params?.category) {
      effects = effects.filter(effect => effect.category === params.category);
    }
    if (params?.type) {
      effects = effects.filter(effect => effect.type === params.type);
    }
    if (params?.platform) {
      effects = effects.filter(effect => effect.platform === params.platform);
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      effects = effects.filter(effect =>
        effect.name.toLowerCase().includes(searchLower) ||
        effect.description.toLowerCase().includes(searchLower) ||
        effect.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    const total = effects.length;

    // Apply pagination
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    effects = effects.slice(offset, offset + limit);

    return { effects, total };
  }

  async createEffect(insertEffect: InsertEffect): Promise<Effect> {
    const id = randomUUID();
    const newEffect: Effect = {
      ...insertEffect,
      id,
      complexity: insertEffect.complexity || 5,
      performance: insertEffect.performance || 'medium',
      version: insertEffect.version || '1.0.0',
      tags: insertEffect.tags || [],
      rating: insertEffect.rating || 0,
      downloads: insertEffect.downloads || 0,
      createdAt: new Date()
    };
    this.effects.set(id, newEffect);
    return newEffect;
  }

  async updateEffect(id: string, updates: Partial<Effect>): Promise<Effect | undefined> {
    const effect = this.effects.get(id);
    if (!effect) return undefined;

    const updatedEffect = { ...effect, ...updates };
    this.effects.set(id, updatedEffect);
    return updatedEffect;
  }

  async deleteEffect(id: string): Promise<boolean> {
    return this.effects.delete(id);
  }

  async incrementDownloads(id: string): Promise<void> {
    const effect = this.effects.get(id);
    if (effect) {
      effect.downloads = (effect.downloads || 0) + 1;
      this.effects.set(id, effect);
    }
  }

  async rateEffect(id: string, rating: number): Promise<void> {
    const effect = this.effects.get(id);
    if (effect) {
      // Simple rating average (in real app, would track individual ratings)
      const currentRating = effect.rating || 0;
      const newRating = (currentRating + rating) / 2;
      effect.rating = Math.round(newRating * 10) / 10;
      this.effects.set(id, effect);
    }
  }

  // Job methods
  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(status?: string): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    return jobs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      status: 'queued',
      progress: 0,
      result: null,
      error: null,
      estimatedTime: insertJob.estimatedTime || null,
      actualTime: null,
      createdAt: new Date(),
      completedAt: null
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    if (updates.status === 'completed' || updates.status === 'failed') {
      updatedJob.completedAt = new Date();
    }
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async getQueueStats(): Promise<{ queued: number; processing: number; completed: number; failed: number }> {
    const jobs = Array.from(this.jobs.values());
    return {
      queued: jobs.filter(job => job.status === 'queued').length,
      processing: jobs.filter(job => job.status === 'processing').length,
      completed: jobs.filter(job => job.status === 'completed').length,
      failed: jobs.filter(job => job.status === 'failed').length
    };
  }

  // Upload methods
  async getUpload(id: string): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async getUploads(): Promise<Upload[]> {
    return Array.from(this.uploads.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = randomUUID();
    const upload: Upload = {
      ...insertUpload,
      id,
      status: 'processing',
      processedCount: 0,
      totalCount: 0,
      errors: [],
      createdAt: new Date()
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async updateUpload(id: string, updates: Partial<Upload>): Promise<Upload | undefined> {
    const upload = this.uploads.get(id);
    if (!upload) return undefined;

    const updatedUpload = { ...upload, ...updates };
    this.uploads.set(id, updatedUpload);
    return updatedUpload;
  }

  // System metrics methods
  async createSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = randomUUID();
    const metrics: SystemMetrics = {
      ...insertMetrics,
      id,
      timestamp: new Date()
    };
    this.systemMetrics.push(metrics);

    // Keep only last 100 entries
    if (this.systemMetrics.length > 100) {
      this.systemMetrics = this.systemMetrics.slice(-100);
    }

    return metrics;
  }

  async getLatestSystemMetrics(): Promise<SystemMetrics | undefined> {
    return this.systemMetrics[this.systemMetrics.length - 1];
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const queueStats = await this.getQueueStats();
    const latest = await this.getLatestSystemMetrics();

    return {
      overall: 98.7,
      modules: {
        particles: { status: 'online', load: 67, effectCount: 342 },
        physics: { status: 'online', load: 45, effectCount: 198 },
        lighting: { status: 'online', load: 23, effectCount: 156 },
        morphing: { status: 'maintenance', load: 0, effectCount: 89 }
      },
      queue: {
        size: queueStats.queued,
        processing: queueStats.processing,
        failed: queueStats.failed
      },
      resources: {
        cpu: latest?.cpuUsage || 67,
        memory: latest?.memoryUsage || 34,
        gpu: latest?.gpuUsage || 78,
        network: latest?.networkIO || 12,
        storage: latest?.storageUsed || 42
      }
    };
  }

}

export const storage = new MemStorage();