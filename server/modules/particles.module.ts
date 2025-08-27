interface ParticleConfig {
  count: number;
  size: number;
  colors: string[];
  speed: number;
  life: number;
  gravity: number;
}

class ParticlesModule {
  getName(): string {
    return "particles";
  }

  generateCode(config: ParticleConfig): string {
    return `
// Particle System Module
class ParticleSystem {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.config = {
      count: ${config.count || 100},
      size: ${config.size || 3},
      colors: ${JSON.stringify(config.colors || ['#ff6b35', '#f7941e', '#fff200'])},
      speed: ${config.speed || 2},
      life: ${config.life || 100},
      gravity: ${config.gravity || 0.1}
    };
  }

  createParticle(x, y) {
    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * this.config.speed,
      vy: (Math.random() - 0.5) * this.config.speed,
      life: this.config.life,
      maxLife: this.config.life,
      size: this.config.size + Math.random() * 2,
      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
    };
  }

  updateParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += this.config.gravity;
    particle.life--;
    
    // Fade out over time
    particle.alpha = particle.life / particle.maxLife;
  }

  emit(x, y, count = this.config.count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(x, y));
    }
  }

  update() {
    this.particles = this.particles.filter(particle => {
      this.updateParticle(particle);
      return particle.life > 0;
    });
  }

  render() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = particle.size;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
    
    this.ctx.restore();
  }

  getParticleCount() {
    return this.particles.length;
  }
}`;
  }

  getEstimatedComplexity(config: ParticleConfig): number {
    let complexity = 1;
    complexity += Math.min(config.count / 50, 5);
    if (config.gravity > 0) complexity += 1;
    return Math.min(complexity, 8);
  }
}

export const particlesModule = new ParticlesModule();
