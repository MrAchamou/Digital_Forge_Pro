export interface EffectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  complexity: number;
  template: string;
  parameters: Record<string, any>;
  tags: string[];
}

export const effectTemplates: EffectTemplate[] = [
  {
    id: "particle-explosion",
    name: "Particle Explosion",
    description: "High-energy particle burst effect with physics simulation",
    category: "EXPLOSION",
    type: "PARTICLE",
    complexity: 7,
    tags: ["particles", "explosion", "physics", "energy"],
    parameters: {
      particleCount: 150,
      explosionForce: 7,
      duration: 3000,
      colors: ["#ff6b35", "#f7941e", "#fff200"],
      gravity: 0.1,
      fadeOut: true
    },
    template: `
// Particle Explosion Effect
class ParticleExplosion {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.config = {
      particleCount: {{particleCount}},
      explosionForce: {{explosionForce}},
      duration: {{duration}},
      colors: {{colors}},
      gravity: {{gravity}},
      fadeOut: {{fadeOut}}
    };
  }

  createParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * this.config.explosionForce;
    
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      maxLife: 1.0,
      size: Math.random() * 4 + 2,
      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
    };
  }

  explode(centerX, centerY) {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(this.createParticle(centerX, centerY));
    }
  }

  update() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += this.config.gravity;
      
      if (this.config.fadeOut) {
        particle.life -= 0.02;
      }
      
      return particle.life > 0;
    });
  }

  render() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
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

  isComplete() {
    return this.particles.length === 0;
  }
}`
  },
  
  {
    id: "fluid-wave",
    name: "Fluid Wave",
    description: "Smooth liquid-like transition with organic movement",
    category: "TRANSITION",
    type: "MORPHING",
    complexity: 5,
    tags: ["fluid", "wave", "transition", "organic"],
    parameters: {
      amplitude: 50,
      frequency: 2,
      speed: 1.5,
      viscosity: 0.8,
      colors: ["#00d4ff", "#8338ec"]
    },
    template: `
// Fluid Wave Transition Effect
class FluidWave {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = {
      amplitude: {{amplitude}},
      frequency: {{frequency}},
      speed: {{speed}},
      viscosity: {{viscosity}},
      colors: {{colors}}
    };
    this.time = 0;
    this.points = [];
  }

  generateWave() {
    const { width, height } = this.canvas;
    this.points = [];
    
    for (let x = 0; x <= width; x += 10) {
      const y = height / 2 + 
        Math.sin((x * this.config.frequency + this.time) * 0.01) * this.config.amplitude +
        Math.sin((x * this.config.frequency * 0.5 + this.time * 0.7) * 0.01) * this.config.amplitude * 0.5;
      
      this.points.push({ x, y });
    }
  }

  render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    this.generateWave();
    
    // Create gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.config.colors[0] + '80');
    gradient.addColorStop(1, this.config.colors[1] + '40');
    
    // Draw wave
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    
    this.points.forEach(point => {
      this.ctx.lineTo(point.x, point.y);
    });
    
    this.ctx.lineTo(width, height);
    this.ctx.closePath();
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    this.time += this.config.speed;
  }

  setViscosity(viscosity) {
    this.config.viscosity = viscosity;
  }
}`
  },

  {
    id: "matrix-glitch",
    name: "Matrix Glitch",
    description: "Cyberpunk-style digital distortion and glitch effects",
    category: "DISTORTION",
    type: "DIGITAL",
    complexity: 8,
    tags: ["glitch", "cyberpunk", "digital", "matrix", "distortion"],
    parameters: {
      intensity: 0.7,
      frequency: 5,
      colorShift: true,
      scanlines: true,
      colors: ["#00ff41", "#0066cc", "#ffffff"]
    },
    template: `
// Matrix Glitch Effect
class MatrixGlitch {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = {
      intensity: {{intensity}},
      frequency: {{frequency}},
      colorShift: {{colorShift}},
      scanlines: {{scanlines}},
      colors: {{colors}}
    };
    this.glitchData = [];
  }

  generateGlitch() {
    const { width, height } = this.canvas;
    this.glitchData = [];
    
    for (let i = 0; i < this.config.frequency; i++) {
      this.glitchData.push({
        y: Math.random() * height,
        height: Math.random() * 20 + 5,
        offset: (Math.random() - 0.5) * 50 * this.config.intensity,
        color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
      });
    }
  }

  applyGlitch() {
    const { width, height } = this.canvas;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    
    if (Math.random() < this.config.intensity * 0.1) {
      this.generateGlitch();
    }

    // Apply glitch strips
    this.glitchData.forEach(glitch => {
      const startY = Math.floor(glitch.y);
      const endY = Math.floor(glitch.y + glitch.height);
      
      for (let y = startY; y < endY && y < height; y++) {
        for (let x = 0; x < width; x++) {
          const sourceX = Math.max(0, Math.min(width - 1, x + glitch.offset));
          const sourceIndex = (y * width + sourceX) * 4;
          const targetIndex = (y * width + x) * 4;
          
          if (this.config.colorShift) {
            imageData.data[targetIndex] = imageData.data[sourceIndex + 2]; // R = B
            imageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1]; // G = G
            imageData.data[targetIndex + 2] = imageData.data[sourceIndex]; // B = R
          }
        }
      }
    });

    this.ctx.putImageData(imageData, 0, 0);

    // Add scanlines
    if (this.config.scanlines) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.1;
      this.ctx.fillStyle = '#ffffff';
      
      for (let y = 0; y < height; y += 4) {
        this.ctx.fillRect(0, y, width, 1);
      }
      
      this.ctx.restore();
    }
  }

  render() {
    this.applyGlitch();
  }
}`
  },

  {
    id: "lightning-storm",
    name: "Lightning Storm",
    description: "Realistic lightning bolts with branching patterns",
    category: "ATMOSPHERIC",
    type: "LIGHTING",
    complexity: 9,
    tags: ["lightning", "electric", "storm", "atmospheric", "energy"],
    parameters: {
      branches: 6,
      intensity: 0.9,
      color: "#00d4ff",
      duration: 2000,
      thickness: 3
    },
    template: `
// Lightning Storm Effect
class LightningStorm {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = {
      branches: {{branches}},
      intensity: {{intensity}},
      color: "{{color}}",
      duration: {{duration}},
      thickness: {{thickness}}
    };
    this.bolts = [];
  }

  generateBolt(startX, startY, endX, endY, generation = 0) {
    const points = [{ x: startX, y: startY }];
    const segments = 15 + generation * 5;
    const chaos = Math.max(1, 50 - generation * 10);
    
    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      const x = startX + (endX - startX) * progress + 
                (Math.random() - 0.5) * chaos;
      const y = startY + (endY - startY) * progress + 
                (Math.random() - 0.5) * chaos * 0.5;
      points.push({ x, y });
      
      // Create branches
      if (generation < 2 && Math.random() < 0.3) {
        const branchEndX = x + (Math.random() - 0.5) * 100;
        const branchEndY = y + Math.random() * 50 + 20;
        this.bolts.push({
          points: this.generateBolt(x, y, branchEndX, branchEndY, generation + 1),
          thickness: this.config.thickness * (0.7 - generation * 0.2),
          intensity: this.config.intensity * (0.8 - generation * 0.2)
        });
      }
    }
    
    points.push({ x: endX, y: endY });
    return points;
  }

  createLightning() {
    this.bolts = [];
    const { width, height } = this.canvas;
    
    for (let i = 0; i < this.config.branches; i++) {
      const startX = Math.random() * width;
      const endX = startX + (Math.random() - 0.5) * 200;
      const points = this.generateBolt(startX, 0, endX, height, 0);
      
      this.bolts.push({
        points,
        thickness: this.config.thickness,
        intensity: this.config.intensity
      });
    }
  }

  render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    this.bolts.forEach(bolt => {
      this.ctx.save();
      this.ctx.strokeStyle = this.config.color;
      this.ctx.lineWidth = bolt.thickness;
      this.ctx.shadowColor = this.config.color;
      this.ctx.shadowBlur = 15 * bolt.intensity;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      this.ctx.beginPath();
      bolt.points.forEach((point, index) => {
        if (index === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  strike() {
    this.createLightning();
    
    setTimeout(() => {
      this.bolts = [];
    }, this.config.duration);
  }
}`
  }
];

// Template processing function
export function processTemplate(template: string, parameters: Record<string, any>): string {
  let processedTemplate = template;
  
  // Replace parameter placeholders
  Object.entries(parameters).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    let replacementValue: string;
    
    if (Array.isArray(value)) {
      replacementValue = JSON.stringify(value);
    } else if (typeof value === 'string') {
      replacementValue = `"${value}"`;
    } else {
      replacementValue = String(value);
    }
    
    processedTemplate = processedTemplate.replace(placeholder, replacementValue);
  });
  
  return processedTemplate;
}

// Get template by ID
export function getTemplate(id: string): EffectTemplate | undefined {
  return effectTemplates.find(template => template.id === id);
}

// Get templates by category
export function getTemplatesByCategory(category: string): EffectTemplate[] {
  return effectTemplates.filter(template => template.category === category);
}

// Get templates by type
export function getTemplatesByType(type: string): EffectTemplate[] {
  return effectTemplates.filter(template => template.type === type);
}

// Search templates
export function searchTemplates(query: string): EffectTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return effectTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
