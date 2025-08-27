import { randomUUID } from "crypto";
export class MemStorage {
    users = new Map();
    effects = new Map();
    jobs = new Map();
    uploads = new Map();
    systemMetrics = [];
    constructor() {
        this.initializeData();
    }
    initializeData() {
        // Initialize with some sample effects for the library
        const sampleEffects = [
            {
                name: "Particle Explosion",
                description: "High-energy particle burst effect with physics simulation",
                type: "PARTICLE",
                category: "EXPLOSION",
                platform: "javascript",
                code: this.getParticleExplosionCode(),
                parameters: { particleCount: 150, duration: 3000, colors: ["#ff6b35", "#f7941e", "#fff200"] },
                metadata: { complexity: 7, performance: "high", author: "EffectForge AI" },
                tags: ["particles", "explosion", "physics", "energy"],
                complexity: 7,
                performance: "high",
                rating: 4.8,
                downloads: 1247,
                version: "1.0.0"
            },
            {
                name: "Fluid Wave Transition",
                description: "Smooth liquid-like transition with organic movement",
                type: "MORPHING",
                category: "TRANSITION",
                platform: "javascript",
                code: this.getFluidWaveCode(),
                parameters: { amplitude: 50, frequency: 2, speed: 1.5, viscosity: 0.8 },
                metadata: { complexity: 5, performance: "medium", author: "EffectForge AI" },
                tags: ["fluid", "wave", "transition", "organic"],
                complexity: 5,
                performance: "medium",
                rating: 4.6,
                downloads: 856,
                version: "1.0.0"
            },
            {
                name: "Digital Matrix Glitch",
                description: "Cyberpunk-style digital distortion and glitch effects",
                type: "DIGITAL",
                category: "DISTORTION",
                platform: "javascript",
                code: this.getMatrixGlitchCode(),
                parameters: { intensity: 0.7, frequency: 5, colorShift: true, scanlines: true },
                metadata: { complexity: 8, performance: "high", author: "EffectForge AI" },
                tags: ["glitch", "cyberpunk", "digital", "matrix", "distortion"],
                complexity: 8,
                performance: "high",
                rating: 4.9,
                downloads: 2134,
                version: "1.0.0"
            },
            {
                name: "Electric Lightning Storm",
                description: "Realistic lightning bolts with branching patterns",
                type: "LIGHTING",
                category: "ATMOSPHERIC",
                platform: "javascript",
                code: this.getLightningCode(),
                parameters: { branches: 6, intensity: 0.9, color: "#00d4ff", duration: 2000 },
                metadata: { complexity: 9, performance: "high", author: "EffectForge AI" },
                tags: ["lightning", "electric", "storm", "atmospheric", "energy"],
                complexity: 9,
                performance: "high",
                rating: 4.7,
                downloads: 1543,
                version: "1.0.0"
            },
            {
                name: "Geometric Shape Morph",
                description: "Smooth transformation between geometric shapes",
                type: "MORPHING",
                category: "TRANSFORMATION",
                platform: "javascript",
                code: this.getShapeMorphCode(),
                parameters: { shapes: ["circle", "square", "triangle"], morphSpeed: 1.2, easing: "easeInOutQuad" },
                metadata: { complexity: 4, performance: "medium", author: "EffectForge AI" },
                tags: ["geometry", "morph", "shapes", "transformation"],
                complexity: 4,
                performance: "medium",
                rating: 4.5,
                downloads: 743,
                version: "1.0.0"
            },
            {
                name: "Digital Fire Flames",
                description: "Realistic fire simulation with heat distortion",
                type: "PARTICLE",
                category: "FIRE",
                platform: "javascript",
                code: this.getDigitalFireCode(),
                parameters: { intensity: 0.8, heat: 0.6, windForce: 0.3, particleLife: 4000 },
                metadata: { complexity: 8, performance: "high", author: "EffectForge AI" },
                tags: ["fire", "flames", "heat", "realistic", "particles"],
                complexity: 8,
                performance: "high",
                rating: 4.8,
                downloads: 1876,
                version: "1.0.0"
            }
        ];
        sampleEffects.forEach(effect => {
            const id = randomUUID();
            this.effects.set(id, {
                ...effect,
                id,
                createdAt: new Date()
            });
        });
    }
    // User methods
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find(user => user.username === username);
    }
    async createUser(insertUser) {
        const id = randomUUID();
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    // Effect methods
    async getEffect(id) {
        return this.effects.get(id);
    }
    async getEffects(params) {
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
            effects = effects.filter(effect => effect.name.toLowerCase().includes(searchLower) ||
                effect.description.toLowerCase().includes(searchLower) ||
                effect.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        }
        const total = effects.length;
        // Apply pagination
        const offset = params?.offset || 0;
        const limit = params?.limit || 20;
        effects = effects.slice(offset, offset + limit);
        return { effects, total };
    }
    async createEffect(insertEffect) {
        const id = randomUUID();
        const effect = {
            ...insertEffect,
            id,
            rating: 0,
            downloads: 0,
            createdAt: new Date()
        };
        this.effects.set(id, effect);
        return effect;
    }
    async updateEffect(id, updates) {
        const effect = this.effects.get(id);
        if (!effect)
            return undefined;
        const updatedEffect = { ...effect, ...updates };
        this.effects.set(id, updatedEffect);
        return updatedEffect;
    }
    async deleteEffect(id) {
        return this.effects.delete(id);
    }
    async incrementDownloads(id) {
        const effect = this.effects.get(id);
        if (effect) {
            effect.downloads = (effect.downloads || 0) + 1;
            this.effects.set(id, effect);
        }
    }
    async rateEffect(id, rating) {
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
    async getJob(id) {
        return this.jobs.get(id);
    }
    async getJobs(status) {
        let jobs = Array.from(this.jobs.values());
        if (status) {
            jobs = jobs.filter(job => job.status === status);
        }
        return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async createJob(insertJob) {
        const id = randomUUID();
        const job = {
            ...insertJob,
            id,
            status: 'queued',
            progress: 0,
            result: null,
            error: null,
            actualTime: null,
            createdAt: new Date(),
            completedAt: null
        };
        this.jobs.set(id, job);
        return job;
    }
    async updateJob(id, updates) {
        const job = this.jobs.get(id);
        if (!job)
            return undefined;
        const updatedJob = { ...job, ...updates };
        if (updates.status === 'completed' || updates.status === 'failed') {
            updatedJob.completedAt = new Date();
        }
        this.jobs.set(id, updatedJob);
        return updatedJob;
    }
    async getQueueStats() {
        const jobs = Array.from(this.jobs.values());
        return {
            queued: jobs.filter(job => job.status === 'queued').length,
            processing: jobs.filter(job => job.status === 'processing').length,
            completed: jobs.filter(job => job.status === 'completed').length,
            failed: jobs.filter(job => job.status === 'failed').length
        };
    }
    // Upload methods
    async getUpload(id) {
        return this.uploads.get(id);
    }
    async getUploads() {
        return Array.from(this.uploads.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async createUpload(insertUpload) {
        const id = randomUUID();
        const upload = {
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
    async updateUpload(id, updates) {
        const upload = this.uploads.get(id);
        if (!upload)
            return undefined;
        const updatedUpload = { ...upload, ...updates };
        this.uploads.set(id, updatedUpload);
        return updatedUpload;
    }
    // System metrics methods
    async createSystemMetrics(insertMetrics) {
        const id = randomUUID();
        const metrics = {
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
    async getLatestSystemMetrics() {
        return this.systemMetrics[this.systemMetrics.length - 1];
    }
    async getSystemHealth() {
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
    // Code templates for sample effects
    getParticleExplosionCode() {
        return `// Auto-generated by EffectForge AI
// Particle Explosion Effect

class ParticleExplosion {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.colors = options.colors || ['#ff6b35', '#f7941e', '#fff200'];
    this.maxParticles = options.particleCount || 150;
    this.duration = options.duration || 3000;
  }

  createParticle(x, y) {
    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.01,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    };
  }

  updateParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.1; // Gravity
    particle.life -= particle.decay;
  }

  explode(centerX, centerY) {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(centerX, centerY));
    }
  }

  render() {
    this.ctx.globalCompositeOperation = 'lighter';
    
    this.particles.forEach(particle => {
      if (particle.life > 0) {
        this.updateParticle(particle);
        
        this.ctx.save();
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });
    
    this.particles = this.particles.filter(p => p.life > 0);
  }
}`;
    }
    getFluidWaveCode() {
        return `// Fluid Wave Transition Effect
class FluidWave {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.amplitude = options.amplitude || 50;
    this.frequency = options.frequency || 2;
    this.speed = options.speed || 1.5;
    this.time = 0;
  }

  render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin((x * this.frequency + this.time) * 0.01) * this.amplitude;
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.lineTo(width, height);
    this.ctx.lineTo(0, height);
    this.ctx.closePath();
    
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 0, 110, 0.3)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    this.time += this.speed;
  }
}`;
    }
    getMatrixGlitchCode() {
        return `// Digital Matrix Glitch Effect
class MatrixGlitch {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.intensity = options.intensity || 0.7;
    this.frequency = options.frequency || 5;
    this.time = 0;
  }

  render() {
    const { width, height } = this.canvas;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Glitch effect
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < this.intensity * 0.01) {
        const offset = Math.floor(Math.random() * this.frequency) * 4;
        data[i] = data[i + offset] || 0;     // Red
        data[i + 1] = data[i + 1 + offset] || 255; // Green
        data[i + 2] = data[i + 2 + offset] || 0;   // Blue
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    this.time++;
  }
}`;
    }
    getLightningCode() {
        return `// Electric Lightning Storm Effect
class LightningStorm {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.branches = options.branches || 6;
    this.intensity = options.intensity || 0.9;
    this.color = options.color || '#00d4ff';
  }

  generateBolt(startX, startY, endX, endY) {
    const points = [{ x: startX, y: startY }];
    const segments = 20;
    
    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 50;
      const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 20;
      points.push({ x, y });
    }
    
    points.push({ x: endX, y: endY });
    return points;
  }

  render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < this.branches; i++) {
      const startX = Math.random() * width;
      const endX = Math.random() * width;
      const bolt = this.generateBolt(startX, 0, endX, height);
      
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 2 + Math.random() * 3;
      this.ctx.shadowColor = this.color;
      this.ctx.shadowBlur = 10;
      
      this.ctx.beginPath();
      this.ctx.moveTo(bolt[0].x, bolt[0].y);
      
      for (let j = 1; j < bolt.length; j++) {
        this.ctx.lineTo(bolt[j].x, bolt[j].y);
      }
      
      this.ctx.stroke();
    }
  }
}`;
    }
    getShapeMorphCode() {
        return `// Geometric Shape Morph Effect
class ShapeMorph {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shapes = options.shapes || ['circle', 'square', 'triangle'];
    this.morphSpeed = options.morphSpeed || 1.2;
    this.currentShape = 0;
    this.morphProgress = 0;
  }

  drawShape(shape, progress, centerX, centerY, size) {
    this.ctx.beginPath();
    
    switch (shape) {
      case 'circle':
        this.ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        break;
      case 'square':
        this.ctx.rect(centerX - size, centerY - size, size * 2, size * 2);
        break;
      case 'triangle':
        this.ctx.moveTo(centerX, centerY - size);
        this.ctx.lineTo(centerX - size, centerY + size);
        this.ctx.lineTo(centerX + size, centerY + size);
        this.ctx.closePath();
        break;
    }
  }

  render() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 50;
    
    this.ctx.clearRect(0, 0, width, height);
    
    // Current shape
    this.ctx.fillStyle = \`rgba(0, 212, 255, \${1 - this.morphProgress})\`;
    this.drawShape(this.shapes[this.currentShape], this.morphProgress, centerX, centerY, size);
    this.ctx.fill();
    
    // Next shape
    const nextShape = (this.currentShape + 1) % this.shapes.length;
    this.ctx.fillStyle = \`rgba(255, 0, 110, \${this.morphProgress})\`;
    this.drawShape(this.shapes[nextShape], this.morphProgress, centerX, centerY, size);
    this.ctx.fill();
    
    this.morphProgress += 0.01 * this.morphSpeed;
    
    if (this.morphProgress >= 1) {
      this.morphProgress = 0;
      this.currentShape = nextShape;
    }
  }
}`;
    }
    getDigitalFireCode() {
        return `// Digital Fire Flames Effect
class DigitalFire {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.intensity = options.intensity || 0.8;
    this.heat = options.heat || 0.6;
    this.windForce = options.windForce || 0.3;
  }

  createFlameParticle(x, y) {
    return {
      x: x + (Math.random() - 0.5) * 20,
      y: y,
      vx: (Math.random() - 0.5) * this.windForce,
      vy: -Math.random() * 3 - 1,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 8 + 4,
      heat: Math.random() * this.heat + 0.3
    };
  }

  render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    // Add new particles at the bottom
    for (let i = 0; i < 5; i++) {
      this.particles.push(this.createFlameParticle(width / 2, height - 20));
    }
    
    // Update and render particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      
      if (particle.life > 0) {
        const alpha = particle.life * this.intensity;
        const hue = particle.heat * 60; // Red to yellow
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = \`hsl(\${hue}, 100%, 50%)\`;
        this.ctx.shadowColor = \`hsl(\${hue}, 100%, 50%)\`;
        this.ctx.shadowBlur = particle.size;
        
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        return true;
      }
      return false;
    });
  }
}`;
    }
}
export const storage = new MemStorage();
