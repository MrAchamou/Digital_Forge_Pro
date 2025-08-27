import { storage } from "../storage";
import { orchestrator } from "../core/orchestrator";
import type { Job } from "@shared/schema";

interface JobProcessor {
  processJob(job: Job): Promise<void>;
}

class JobQueue implements JobProcessor {
  private processingJobs = new Map<string, Job>();
  private maxConcurrentJobs = 5;
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startProcessing();
  }

  async addJob(job: Job): Promise<void> {
    console.log(`Job added to queue: ${job.id}`);
    // Job is already in storage, just trigger processing
    this.processNextJobs();
  }

  private startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processNextJobs();
      }
    }, 2000); // Check for new jobs every 2 seconds
  }

  private async processNextJobs(): Promise<void> {
    if (this.processingJobs.size >= this.maxConcurrentJobs) {
      return; // Already at max capacity
    }

    try {
      this.isProcessing = true;
      
      // Get queued jobs
      const queuedJobs = await storage.getJobs('queued');
      const availableSlots = this.maxConcurrentJobs - this.processingJobs.size;
      const jobsToProcess = queuedJobs.slice(0, availableSlots);

      // Process each job
      const processingPromises = jobsToProcess.map(job => this.processJob(job));
      await Promise.allSettled(processingPromises);

    } catch (error) {
      console.error('Error processing job queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async processJob(job: Job): Promise<void> {
    try {
      // Mark job as processing
      this.processingJobs.set(job.id, job);
      await storage.updateJob(job.id, { 
        status: 'processing', 
        progress: 0 
      });

      console.log(`Processing job: ${job.id} - ${job.description.slice(0, 50)}...`);

      // Simulate progress updates
      const progressSteps = [10, 25, 40, 60, 80, 95];
      for (let i = 0; i < progressSteps.length; i++) {
        await this.delay(500); // Simulate processing time
        await storage.updateJob(job.id, { progress: progressSteps[i] });
      }

      // Generate the actual effect
      const startTime = Date.now();
      const result = await orchestrator.generateEffect(
        job.description,
        job.platform,
        job.options
      );

      const actualTime = Math.round((Date.now() - startTime) / 1000);

      // Mark job as completed
      await storage.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        result: result,
        actualTime: actualTime
      });

      // Create effect entry in library
      await this.createLibraryEntry(job, result);

      console.log(`Job completed: ${job.id} in ${actualTime}s`);

    } catch (error) {
      console.error(`Job failed: ${job.id}`, error);
      
      await storage.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      this.processingJobs.delete(job.id);
    }
  }

  private async createLibraryEntry(job: Job, result: any): Promise<void> {
    try {
      // Extract effect name from description
      const name = this.generateEffectName(job.description);
      
      // Determine category and type from the generated code
      const { category, type } = this.analyzeGeneratedCode(result.code);

      await storage.createEffect({
        name: name,
        description: job.description,
        type: type,
        category: category,
        platform: job.platform,
        code: result.code,
        parameters: result.metadata?.analysis?.parameters || {},
        metadata: {
          generatedAt: new Date().toISOString(),
          jobId: job.id,
          complexity: result.metadata?.analysis?.complexity || 5,
          modules: result.metadata?.modules || [],
          estimatedPerformance: result.metadata?.estimatedPerformance || 'medium'
        },
        tags: this.extractTags(job.description),
        complexity: result.metadata?.analysis?.complexity || 5,
        performance: result.metadata?.estimatedPerformance || 'medium',
        version: '1.0.0'
      });
    } catch (error) {
      console.error('Failed to create library entry:', error);
    }
  }

  private generateEffectName(description: string): string {
    // Extract a meaningful name from the description
    const words = description
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Pick key words (first few meaningful words)
    const keyWords = words.slice(0, 3);
    
    // Capitalize and join
    return keyWords
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Effect';
  }

  private analyzeGeneratedCode(code: string): { category: string; type: string } {
    const codeLower = code.toLowerCase();
    
    // Determine type based on code content
    let type = 'PARTICLE'; // default
    if (codeLower.includes('lighting') || codeLower.includes('light')) {
      type = 'LIGHTING';
    } else if (codeLower.includes('morph') || codeLower.includes('shape')) {
      type = 'MORPHING';
    } else if (codeLower.includes('physics') || codeLower.includes('collision')) {
      type = 'PHYSICS';
    } else if (codeLower.includes('glitch') || codeLower.includes('digital')) {
      type = 'DIGITAL';
    }

    // Determine category based on code content
    let category = 'EFFECT'; // default
    if (codeLower.includes('explosion') || codeLower.includes('burst')) {
      category = 'EXPLOSION';
    } else if (codeLower.includes('transition') || codeLower.includes('morph')) {
      category = 'TRANSITION';
    } else if (codeLower.includes('fire') || codeLower.includes('flame')) {
      category = 'FIRE';
    } else if (codeLower.includes('lightning') || codeLower.includes('storm')) {
      category = 'ATMOSPHERIC';
    } else if (codeLower.includes('transform') || codeLower.includes('shape')) {
      category = 'TRANSFORMATION';
    } else if (codeLower.includes('glitch') || codeLower.includes('distort')) {
      category = 'DISTORTION';
    }

    return { category, type };
  }

  private extractTags(description: string): string[] {
    const commonTags = [
      'particles', 'explosion', 'fire', 'water', 'light', 'glow', 'smoke',
      'magic', 'energy', 'plasma', 'electric', 'storm', 'wind', 'dust',
      'sparkle', 'trail', 'burst', 'flash', 'beam', 'aura', 'wave',
      'ripple', 'dissolve', 'materialize', 'transform', 'morph'
    ];

    const descriptionLower = description.toLowerCase();
    const tags = commonTags.filter(tag => 
      descriptionLower.includes(tag) || 
      descriptionLower.includes(tag + 's') || 
      descriptionLower.includes(tag + 'ing')
    );

    // Add color tags
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'white', 'black'];
    colors.forEach(color => {
      if (descriptionLower.includes(color)) {
        tags.push(color);
      }
    });

    // Add size tags
    const sizes = ['small', 'large', 'tiny', 'huge', 'massive', 'mini'];
    sizes.forEach(size => {
      if (descriptionLower.includes(size)) {
        tags.push(size);
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for queue management
  async getQueueStatus(): Promise<{
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    totalProcessed: number;
  }> {
    const stats = await storage.getQueueStats();
    return {
      ...stats,
      totalProcessed: stats.completed + stats.failed
    };
  }

  async pauseProcessing(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Job queue processing paused');
    }
  }

  async resumeProcessing(): Promise<void> {
    if (!this.processingInterval) {
      this.startProcessing();
      console.log('Job queue processing resumed');
    }
  }

  async retryFailedJob(jobId: string): Promise<void> {
    const job = await storage.getJob(jobId);
    if (job && job.status === 'failed') {
      await storage.updateJob(jobId, {
        status: 'queued',
        progress: 0,
        error: null
      });
      console.log(`Job ${jobId} queued for retry`);
    }
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = await storage.getJob(jobId);
    if (job && (job.status === 'queued' || job.status === 'processing')) {
      await storage.updateJob(jobId, {
        status: 'failed',
        error: 'Job cancelled by user'
      });
      this.processingJobs.delete(jobId);
      console.log(`Job ${jobId} cancelled`);
    }
  }

  getProcessingJobs(): Job[] {
    return Array.from(this.processingJobs.values());
  }

  setMaxConcurrentJobs(max: number): void {
    this.maxConcurrentJobs = Math.max(1, Math.min(10, max));
    console.log(`Max concurrent jobs set to: ${this.maxConcurrentJobs}`);
  }

  // Cleanup method
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.processingJobs.clear();
    console.log('Job queue destroyed');
  }
}

export const jobQueue = new JobQueue();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down job queue...');
  jobQueue.destroy();
});

process.on('SIGINT', () => {
  console.log('Shutting down job queue...');
  jobQueue.destroy();
  process.exit(0);
});
