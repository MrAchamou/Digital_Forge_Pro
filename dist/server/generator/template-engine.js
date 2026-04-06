var TemplateEngine = /** @class */ (function () {
    function TemplateEngine() {
        this.templates = new Map();
        this.initializeTemplates();
    }
    TemplateEngine.prototype.initializeTemplates = function () {
        var _this = this;
        var templates = [
            {
                id: 'particles-basic',
                name: 'Basic Particle System',
                category: 'particles',
                complexity: 3,
                parameters: ['particleCount', 'colors', 'speed', 'size'],
                template: "\nclass {{className}} {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.particles = [];\n    this.config = {\n      particleCount: {{particleCount}},\n      colors: {{colors}},\n      speed: {{speed}},\n      size: {{size}},\n      gravity: {{gravity}},\n      life: {{life}}\n    };\n  }\n\n  createParticle(x, y) {\n    return {\n      x: x,\n      y: y,\n      vx: (Math.random() - 0.5) * this.config.speed,\n      vy: (Math.random() - 0.5) * this.config.speed,\n      life: this.config.life,\n      maxLife: this.config.life,\n      size: this.config.size + Math.random() * 2,\n      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]\n    };\n  }\n\n  emit(x, y, count = this.config.particleCount) {\n    for (let i = 0; i < count; i++) {\n      this.particles.push(this.createParticle(x, y));\n    }\n  }\n\n  update() {\n    this.particles = this.particles.filter(particle => {\n      particle.x += particle.vx;\n      particle.y += particle.vy;\n      particle.vy += this.config.gravity;\n      particle.life--;\n      return particle.life > 0;\n    });\n  }\n\n  render() {\n    this.ctx.save();\n    this.ctx.globalCompositeOperation = 'lighter';\n    \n    this.particles.forEach(particle => {\n      this.ctx.save();\n      this.ctx.globalAlpha = particle.life / particle.maxLife;\n      this.ctx.fillStyle = particle.color;\n      this.ctx.shadowColor = particle.color;\n      this.ctx.shadowBlur = particle.size;\n      \n      this.ctx.beginPath();\n      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);\n      this.ctx.fill();\n      this.ctx.restore();\n    });\n    \n    this.ctx.restore();\n  }\n}"
            },
            {
                id: 'lighting-basic',
                name: 'Basic Lighting System',
                category: 'lighting',
                complexity: 4,
                parameters: ['lightCount', 'intensity', 'color', 'radius'],
                template: "\nclass {{className}} {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.lights = [];\n    this.config = {\n      lightCount: {{lightCount}},\n      intensity: {{intensity}},\n      color: \"{{color}}\",\n      radius: {{radius}}\n    };\n  }\n\n  addLight(x, y, options = {}) {\n    this.lights.push({\n      x: x,\n      y: y,\n      intensity: options.intensity || this.config.intensity,\n      color: options.color || this.config.color,\n      radius: options.radius || this.config.radius,\n      flickering: options.flickering || false\n    });\n  }\n\n  render() {\n    this.lights.forEach(light => {\n      let intensity = light.intensity;\n      if (light.flickering) {\n        intensity *= (0.8 + Math.random() * 0.4);\n      }\n\n      const gradient = this.ctx.createRadialGradient(\n        light.x, light.y, 0,\n        light.x, light.y, light.radius\n      );\n      \n      gradient.addColorStop(0, `${light.color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`);\n      gradient.addColorStop(1, `${light.color}00`);\n      \n      this.ctx.save();\n      this.ctx.globalCompositeOperation = 'lighter';\n      this.ctx.fillStyle = gradient;\n      this.ctx.beginPath();\n      this.ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);\n      this.ctx.fill();\n      this.ctx.restore();\n    });\n  }\n}"
            },
            {
                id: 'morphing-basic',
                name: 'Basic Morphing System',
                category: 'morphing',
                complexity: 5,
                parameters: ['shapes', 'morphSpeed', 'easing'],
                template: "\nclass {{className}} {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.config = {\n      shapes: {{shapes}},\n      morphSpeed: {{morphSpeed}},\n      easing: \"{{easing}}\"\n    };\n    this.currentShape = 0;\n    this.nextShape = 1;\n    this.morphProgress = 0;\n  }\n\n  generateShapePoints(shapeType, resolution = 24) {\n    const points = [];\n    const angleStep = (Math.PI * 2) / resolution;\n    \n    switch (shapeType) {\n      case 'circle':\n        for (let i = 0; i < resolution; i++) {\n          const angle = i * angleStep;\n          points.push({\n            x: Math.cos(angle),\n            y: Math.sin(angle)\n          });\n        }\n        break;\n      case 'square':\n        const sideLength = resolution / 4;\n        for (let i = 0; i < resolution; i++) {\n          const side = Math.floor(i / sideLength);\n          const t = (i % sideLength) / sideLength;\n          switch (side) {\n            case 0: points.push({ x: -1 + 2 * t, y: -1 }); break;\n            case 1: points.push({ x: 1, y: -1 + 2 * t }); break;\n            case 2: points.push({ x: 1 - 2 * t, y: 1 }); break;\n            case 3: points.push({ x: -1, y: 1 - 2 * t }); break;\n          }\n        }\n        break;\n      default:\n        return this.generateShapePoints('circle', resolution);\n    }\n    return points;\n  }\n\n  update() {\n    this.morphProgress += this.config.morphSpeed * 0.01;\n    if (this.morphProgress >= 1) {\n      this.morphProgress = 0;\n      this.currentShape = this.nextShape;\n      this.nextShape = (this.nextShape + 1) % this.config.shapes.length;\n    }\n  }\n\n  render(centerX, centerY, scale = 50) {\n    const currentPoints = this.generateShapePoints(this.config.shapes[this.currentShape]);\n    const nextPoints = this.generateShapePoints(this.config.shapes[this.nextShape]);\n    \n    this.ctx.save();\n    this.ctx.translate(centerX, centerY);\n    this.ctx.scale(scale, scale);\n    \n    this.ctx.beginPath();\n    currentPoints.forEach((point, index) => {\n      const nextPoint = nextPoints[index % nextPoints.length];\n      const x = point.x + (nextPoint.x - point.x) * this.morphProgress;\n      const y = point.y + (nextPoint.y - point.y) * this.morphProgress;\n      \n      if (index === 0) {\n        this.ctx.moveTo(x, y);\n      } else {\n        this.ctx.lineTo(x, y);\n      }\n    });\n    this.ctx.closePath();\n    \n    this.ctx.strokeStyle = '#00d4ff';\n    this.ctx.lineWidth = 0.1;\n    this.ctx.stroke();\n    \n    this.ctx.restore();\n  }\n}"
            },
            {
                id: 'physics-basic',
                name: 'Basic Physics System',
                category: 'physics',
                complexity: 6,
                parameters: ['gravity', 'damping', 'bounce', 'friction'],
                template: "\nclass {{className}} {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.bodies = [];\n    this.config = {\n      gravity: {{gravity}},\n      damping: {{damping}},\n      bounce: {{bounce}},\n      friction: {{friction}}\n    };\n  }\n\n  createBody(x, y, options = {}) {\n    return {\n      x: x,\n      y: y,\n      oldX: x,\n      oldY: y,\n      mass: options.mass || 1,\n      radius: options.radius || 5,\n      color: options.color || '#ffffff'\n    };\n  }\n\n  addBody(body) {\n    this.bodies.push(body);\n  }\n\n  update() {\n    this.bodies.forEach(body => {\n      const tempX = body.x;\n      const tempY = body.y;\n      \n      body.x += (body.x - body.oldX) * this.config.damping;\n      body.y += (body.y - body.oldY) * this.config.damping + this.config.gravity;\n      \n      body.oldX = tempX;\n      body.oldY = tempY;\n      \n      // Boundary collision\n      if (body.y + body.radius > this.canvas.height) {\n        body.y = this.canvas.height - body.radius;\n        body.oldY = body.y + (body.y - body.oldY) * this.config.bounce;\n      }\n      \n      if (body.x + body.radius > this.canvas.width || body.x - body.radius < 0) {\n        body.oldX = body.x + (body.x - body.oldX) * this.config.bounce;\n      }\n    });\n  }\n\n  render() {\n    this.bodies.forEach(body => {\n      this.ctx.save();\n      this.ctx.fillStyle = body.color;\n      this.ctx.beginPath();\n      this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);\n      this.ctx.fill();\n      this.ctx.restore();\n    });\n  }\n}"
            }
        ];
        templates.forEach(function (template) {
            _this.templates.set(template.category, template);
        });
    };
    TemplateEngine.prototype.getTemplate = function (category) {
        var template = this.templates.get(category);
        return template ? template.template : this.getDefaultTemplate();
    };
    TemplateEngine.prototype.processTemplate = function (template, parameters) {
        var processed = template;
        // Replace parameter placeholders
        Object.entries(parameters).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var placeholder = new RegExp("{{".concat(key, "}}"), 'g');
            var replacement;
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
        var defaultValues = {
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
        Object.entries(defaultValues).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var placeholder = new RegExp("{{".concat(key, "}}"), 'g');
            var replacement;
            if (Array.isArray(value)) {
                replacement = JSON.stringify(value);
            }
            else {
                replacement = value.toString();
            }
            processed = processed.replace(placeholder, replacement);
        });
        return processed;
    };
    TemplateEngine.prototype.getDefaultTemplate = function () {
        var _a;
        return ((_a = this.templates.get('particles')) === null || _a === void 0 ? void 0 : _a.template) || "\nclass GeneratedEffect {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.config = options;\n  }\n\n  update() {\n    // Default update logic\n  }\n\n  render() {\n    // Default render logic\n    this.ctx.fillStyle = '#ffffff';\n    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);\n  }\n}";
    };
    TemplateEngine.prototype.addTemplate = function (template) {
        this.templates.set(template.id, template);
    };
    TemplateEngine.prototype.getTemplateList = function () {
        return Array.from(this.templates.values());
    };
    TemplateEngine.prototype.getTemplatesByCategory = function (category) {
        return Array.from(this.templates.values()).filter(function (t) { return t.category === category; });
    };
    TemplateEngine.prototype.templateExists = function (id) {
        return this.templates.has(id);
    };
    TemplateEngine.prototype.removeTemplate = function (id) {
        return this.templates.delete(id);
    };
    // Utility method to validate template syntax
    TemplateEngine.prototype.validateTemplate = function (template) {
        var errors = [];
        // Check for required methods
        if (!template.includes('constructor')) {
            errors.push('Template must include a constructor');
        }
        if (!template.includes('update') && !template.includes('render')) {
            errors.push('Template must include either update() or render() method');
        }
        // Check for placeholder format
        var placeholders = template.match(/{{[\w]+}}/g);
        if (placeholders) {
            placeholders.forEach(function (placeholder) {
                if (!/^{{[a-zA-Z_][a-zA-Z0-9_]*}}$/.test(placeholder)) {
                    errors.push("Invalid placeholder format: ".concat(placeholder));
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    return TemplateEngine;
}());
export var templateEngine = new TemplateEngine();
