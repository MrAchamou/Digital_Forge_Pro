class TemplateEngine {
    templates = new Map();
    constructor() {
        this.initializeTemplates();
    }
    initializeTemplates() {
        const templates = [
            {
                id: 'particles-basic',
                name: 'Basic Particle System',
                category: 'particles',
                complexity: 3,
                parameters: ['particleCount', 'colors', 'speed', 'size'],
                template: `
class {{className}} {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.config = {
      particleCount: {{particleCount}},
      colors: {{colors}},
      speed: {{speed}},
      size: {{size}},
      gravity: {{gravity}},
      life: {{life}}
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

  emit(x, y, count = this.config.particleCount) {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(x, y));
    }
  }

  update() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += this.config.gravity;
      particle.life--;
      return particle.life > 0;
    });
  }

  render() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life / particle.maxLife;
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
}`
            },
            {
                id: 'lighting-basic',
                name: 'Basic Lighting System',
                category: 'lighting',
                complexity: 4,
                parameters: ['lightCount', 'intensity', 'color', 'radius'],
                template: `
class {{className}} {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lights = [];
    this.config = {
      lightCount: {{lightCount}},
      intensity: {{intensity}},
      color: "{{color}}",
      radius: {{radius}}
    };
  }

  addLight(x, y, options = {}) {
    this.lights.push({
      x: x,
      y: y,
      intensity: options.intensity || this.config.intensity,
      color: options.color || this.config.color,
      radius: options.radius || this.config.radius,
      flickering: options.flickering || false
    });
  }

  render() {
    this.lights.forEach(light => {
      let intensity = light.intensity;
      if (light.flickering) {
        intensity *= (0.8 + Math.random() * 0.4);
      }

      const gradient = this.ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, light.radius
      );
      
      gradient.addColorStop(0, \`\${light.color}\${Math.floor(intensity * 255).toString(16).padStart(2, '0')}\`);
      gradient.addColorStop(1, \`\${light.color}00\`);
      
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
}`
            },
            {
                id: 'morphing-basic',
                name: 'Basic Morphing System',
                category: 'morphing',
                complexity: 5,
                parameters: ['shapes', 'morphSpeed', 'easing'],
                template: `
class {{className}} {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = {
      shapes: {{shapes}},
      morphSpeed: {{morphSpeed}},
      easing: "{{easing}}"
    };
    this.currentShape = 0;
    this.nextShape = 1;
    this.morphProgress = 0;
  }

  generateShapePoints(shapeType, resolution = 24) {
    const points = [];
    const angleStep = (Math.PI * 2) / resolution;
    
    switch (shapeType) {
      case 'circle':
        for (let i = 0; i < resolution; i++) {
          const angle = i * angleStep;
          points.push({
            x: Math.cos(angle),
            y: Math.sin(angle)
          });
        }
        break;
      case 'square':
        const sideLength = resolution / 4;
        for (let i = 0; i < resolution; i++) {
          const side = Math.floor(i / sideLength);
          const t = (i % sideLength) / sideLength;
          switch (side) {
            case 0: points.push({ x: -1 + 2 * t, y: -1 }); break;
            case 1: points.push({ x: 1, y: -1 + 2 * t }); break;
            case 2: points.push({ x: 1 - 2 * t, y: 1 }); break;
            case 3: points.push({ x: -1, y: 1 - 2 * t }); break;
          }
        }
        break;
      default:
        return this.generateShapePoints('circle', resolution);
    }
    return points;
  }

  update() {
    this.morphProgress += this.config.morphSpeed * 0.01;
    if (this.morphProgress >= 1) {
      this.morphProgress = 0;
      this.currentShape = this.nextShape;
      this.nextShape = (this.nextShape + 1) % this.config.shapes.length;
    }
  }

  render(centerX, centerY, scale = 50) {
    const currentPoints = this.generateShapePoints(this.config.shapes[this.currentShape]);
    const nextPoints = this.generateShapePoints(this.config.shapes[this.nextShape]);
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);
    
    this.ctx.beginPath();
    currentPoints.forEach((point, index) => {
      const nextPoint = nextPoints[index % nextPoints.length];
      const x = point.x + (nextPoint.x - point.x) * this.morphProgress;
      const y = point.y + (nextPoint.y - point.y) * this.morphProgress;
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.closePath();
    
    this.ctx.strokeStyle = '#00d4ff';
    this.ctx.lineWidth = 0.1;
    this.ctx.stroke();
    
    this.ctx.restore();
  }
}`
            },
            {
                id: 'physics-basic',
                name: 'Basic Physics System',
                category: 'physics',
                complexity: 6,
                parameters: ['gravity', 'damping', 'bounce', 'friction'],
                template: `
class {{className}} {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bodies = [];
    this.config = {
      gravity: {{gravity}},
      damping: {{damping}},
      bounce: {{bounce}},
      friction: {{friction}}
    };
  }

  createBody(x, y, options = {}) {
    return {
      x: x,
      y: y,
      oldX: x,
      oldY: y,
      mass: options.mass || 1,
      radius: options.radius || 5,
      color: options.color || '#ffffff'
    };
  }

  addBody(body) {
    this.bodies.push(body);
  }

  update() {
    this.bodies.forEach(body => {
      const tempX = body.x;
      const tempY = body.y;
      
      body.x += (body.x - body.oldX) * this.config.damping;
      body.y += (body.y - body.oldY) * this.config.damping + this.config.gravity;
      
      body.oldX = tempX;
      body.oldY = tempY;
      
      // Boundary collision
      if (body.y + body.radius > this.canvas.height) {
        body.y = this.canvas.height - body.radius;
        body.oldY = body.y + (body.y - body.oldY) * this.config.bounce;
      }
      
      if (body.x + body.radius > this.canvas.width || body.x - body.radius < 0) {
        body.oldX = body.x + (body.x - body.oldX) * this.config.bounce;
      }
    });
  }

  render() {
    this.bodies.forEach(body => {
      this.ctx.save();
      this.ctx.fillStyle = body.color;
      this.ctx.beginPath();
      this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
}`
            }
        ];
        templates.forEach(template => {
            this.templates.set(template.category, template);
        });
    }
    getTemplate(category) {
        const template = this.templates.get(category);
        return template ? template.template : this.getDefaultTemplate();
    }
    processTemplate(template, parameters) {
        let processed = template;
        // Replace parameter placeholders
        Object.entries(parameters).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            let replacement;
            if (Array.isArray(value)) {
                replacement = JSON.stringify(value);
            }
            else if (typeof value === 'string') {
                replacement = value;
            }
            else if (typeof value === 'boolean') {
                replacement = value.toString();
            }
            else if (typeof value === 'number') {
                replacement = value.toString();
            }
            else {
                replacement = JSON.stringify(value);
            }
            processed = processed.replace(placeholder, replacement);
        });
        // Set default className if not provided
        if (!parameters.className) {
            processed = processed.replace(/{{className}}/g, 'GeneratedEffect');
        }
        // Set default values for common parameters
        const defaultValues = {
            particleCount: 100,
            colors: ['#ff6b35', '#f7941e', '#fff200'],
            speed: 2,
            size: 3,
            gravity: 0.1,
            life: 100,
            lightCount: 3,
            intensity: 0.8,
            color: '#ffffff',
            radius: 100,
            shapes: ['circle', 'square'],
            morphSpeed: 1.0,
            easing: 'easeInOutQuad',
            damping: 0.99,
            bounce: 0.8,
            friction: 0.95
        };
        // Replace any remaining placeholders with defaults
        Object.entries(defaultValues).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            let replacement;
            if (Array.isArray(value)) {
                replacement = JSON.stringify(value);
            }
            else {
                replacement = value.toString();
            }
            processed = processed.replace(placeholder, replacement);
        });
        return processed;
    }
    getDefaultTemplate() {
        return this.templates.get('particles')?.template || `
class GeneratedEffect {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = options;
  }

  update() {
    // Default update logic
  }

  render() {
    // Default render logic
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}`;
    }
    addTemplate(template) {
        this.templates.set(template.id, template);
    }
    getTemplateList() {
        return Array.from(this.templates.values());
    }
    getTemplatesByCategory(category) {
        return Array.from(this.templates.values()).filter(t => t.category === category);
    }
    templateExists(id) {
        return this.templates.has(id);
    }
    removeTemplate(id) {
        return this.templates.delete(id);
    }
    // Utility method to validate template syntax
    validateTemplate(template) {
        const errors = [];
        // Check for required methods
        if (!template.includes('constructor')) {
            errors.push('Template must include a constructor');
        }
        if (!template.includes('update') && !template.includes('render')) {
            errors.push('Template must include either update() or render() method');
        }
        // Check for placeholder format
        const placeholders = template.match(/{{[\w]+}}/g);
        if (placeholders) {
            placeholders.forEach(placeholder => {
                if (!/^{{[a-zA-Z_][a-zA-Z0-9_]*}}$/.test(placeholder)) {
                    errors.push(`Invalid placeholder format: ${placeholder}`);
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
export const templateEngine = new TemplateEngine();
