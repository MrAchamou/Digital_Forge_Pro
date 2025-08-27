import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertEffectSchema, insertUploadSchema } from "@shared/schema";
import { orchestrator } from "./core/orchestrator";
import { jobQueue } from "./queue/job-queue";
import { multiFormatParser } from "./parser/multi-format-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.md', '.json', '.csv', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported`));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate effect from description
  app.post("/api/effects/generate", async (req, res) => {
    try {
      const { description, platform = "javascript", options = {} } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      // Validate and create job
      const jobData = insertJobSchema.parse({
        description,
        platform,
        options,
        estimatedTime: 180 // 3 minutes default
      });

      const job = await storage.createJob(jobData);
      
      // Add to processing queue
      await jobQueue.addJob(job);
      
      res.json({
        jobId: job.id,
        estimatedTime: job.estimatedTime,
        status: job.status
      });
    } catch (error) {
      console.error("Generate effect error:", error);
      res.status(500).json({ message: "Failed to generate effect" });
    }
  });

  // Get job status
  app.get("/api/effects/status/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error,
        estimatedTime: job.estimatedTime,
        actualTime: job.actualTime
      });
    } catch (error) {
      console.error("Get job status error:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  // Get effects library
  app.get("/api/library/effects", async (req, res) => {
    try {
      const { category, type, search, platform, page = "1", limit = "20" } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const result = await storage.getEffects({
        category: category as string,
        type: type as string,
        search: search as string,
        platform: platform as string,
        limit: limitNum,
        offset: offset
      });

      res.json({
        effects: result.effects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          pages: Math.ceil(result.total / limitNum)
        }
      });
    } catch (error) {
      console.error("Get effects error:", error);
      res.status(500).json({ message: "Failed to get effects" });
    }
  });

  // Download effect
  app.get("/api/effects/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const { format = "js" } = req.query;
      
      const effect = await storage.getEffect(id);
      if (!effect) {
        return res.status(404).json({ message: "Effect not found" });
      }

      // Increment download counter
      await storage.incrementDownloads(id);

      // Set appropriate headers for download
      const filename = `${effect.name.replace(/\s+/g, '_')}.${format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'text/plain');
      
      res.send(effect.code);
    } catch (error) {
      console.error("Download effect error:", error);
      res.status(500).json({ message: "Failed to download effect" });
    }
  });

  // Rate effect
  app.post("/api/library/effects/:id/feedback", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      await storage.rateEffect(id, rating);
      res.json({ message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Rate effect error:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Upload files for processing
  app.post("/api/upload", upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadPromises = files.map(async (file) => {
        const uploadData = insertUploadSchema.parse({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        });

        const upload = await storage.createUpload(uploadData);
        
        // Start processing the file
        multiFormatParser.processFile(upload);
        
        return upload;
      });

      const uploads = await Promise.all(uploadPromises);
      
      res.json({
        message: "Files uploaded successfully",
        uploads: uploads.map(upload => ({
          id: upload.id,
          filename: upload.originalName,
          status: upload.status
        }))
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Get upload status
  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const upload = await storage.getUpload(id);
      
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      res.json(upload);
    } catch (error) {
      console.error("Get upload error:", error);
      res.status(500).json({ message: "Failed to get upload status" });
    }
  });

  // Get all uploads
  app.get("/api/uploads", async (req, res) => {
    try {
      const uploads = await storage.getUploads();
      res.json(uploads);
    } catch (error) {
      console.error("Get uploads error:", error);
      res.status(500).json({ message: "Failed to get uploads" });
    }
  });

  // Get queue statistics
  app.get("/api/queue/stats", async (req, res) => {
    try {
      const stats = await storage.getQueueStats();
      res.json(stats);
    } catch (error) {
      console.error("Get queue stats error:", error);
      res.status(500).json({ message: "Failed to get queue stats" });
    }
  });

  // Get queue jobs
  app.get("/api/queue/jobs", async (req, res) => {
    try {
      const { status } = req.query;
      const jobs = await storage.getJobs(status as string);
      res.json(jobs);
    } catch (error) {
      console.error("Get queue jobs error:", error);
      res.status(500).json({ message: "Failed to get queue jobs" });
    }
  });

  // Get system health
  app.get("/api/system/health", async (req, res) => {
    try {
      const health = await storage.getSystemHealth();
      res.json(health);
    } catch (error) {
      console.error("Get system health error:", error);
      res.status(500).json({ message: "Failed to get system health" });
    }
  });

  // Get system metrics
  app.get("/api/system/metrics", async (req, res) => {
    try {
      const metrics = await storage.getLatestSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Get system metrics error:", error);
      res.status(500).json({ message: "Failed to get system metrics" });
    }
  });

  // Analyze description (for real-time AI analysis)
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const analysis = await orchestrator.analyzeDescription(description);
      res.json(analysis);
    } catch (error) {
      console.error("Analyze description error:", error);
      res.status(500).json({ message: "Failed to analyze description" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
