export var effectTemplates = [
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
        template: "\n// Particle Explosion Effect\nclass ParticleExplosion {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.particles = [];\n    this.config = {\n      particleCount: {{particleCount}},\n      explosionForce: {{explosionForce}},\n      duration: {{duration}},\n      colors: {{colors}},\n      gravity: {{gravity}},\n      fadeOut: {{fadeOut}}\n    };\n  }\n\n  createParticle(x, y) {\n    const angle = Math.random() * Math.PI * 2;\n    const speed = Math.random() * this.config.explosionForce;\n    \n    return {\n      x: x,\n      y: y,\n      vx: Math.cos(angle) * speed,\n      vy: Math.sin(angle) * speed,\n      life: 1.0,\n      maxLife: 1.0,\n      size: Math.random() * 4 + 2,\n      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]\n    };\n  }\n\n  explode(centerX, centerY) {\n    this.particles = [];\n    for (let i = 0; i < this.config.particleCount; i++) {\n      this.particles.push(this.createParticle(centerX, centerY));\n    }\n  }\n\n  update() {\n    this.particles = this.particles.filter(particle => {\n      particle.x += particle.vx;\n      particle.y += particle.vy;\n      particle.vy += this.config.gravity;\n      \n      if (this.config.fadeOut) {\n        particle.life -= 0.02;\n      }\n      \n      return particle.life > 0;\n    });\n  }\n\n  render() {\n    this.ctx.save();\n    this.ctx.globalCompositeOperation = 'lighter';\n    \n    this.particles.forEach(particle => {\n      this.ctx.save();\n      this.ctx.globalAlpha = particle.life;\n      this.ctx.fillStyle = particle.color;\n      this.ctx.shadowColor = particle.color;\n      this.ctx.shadowBlur = particle.size;\n      \n      this.ctx.beginPath();\n      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);\n      this.ctx.fill();\n      this.ctx.restore();\n    });\n    \n    this.ctx.restore();\n  }\n\n  isComplete() {\n    return this.particles.length === 0;\n  }\n}"
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
        template: "\n// Fluid Wave Transition Effect\nclass FluidWave {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.config = {\n      amplitude: {{amplitude}},\n      frequency: {{frequency}},\n      speed: {{speed}},\n      viscosity: {{viscosity}},\n      colors: {{colors}}\n    };\n    this.time = 0;\n    this.points = [];\n  }\n\n  generateWave() {\n    const { width, height } = this.canvas;\n    this.points = [];\n    \n    for (let x = 0; x <= width; x += 10) {\n      const y = height / 2 + \n        Math.sin((x * this.config.frequency + this.time) * 0.01) * this.config.amplitude +\n        Math.sin((x * this.config.frequency * 0.5 + this.time * 0.7) * 0.01) * this.config.amplitude * 0.5;\n      \n      this.points.push({ x, y });\n    }\n  }\n\n  render() {\n    const { width, height } = this.canvas;\n    this.ctx.clearRect(0, 0, width, height);\n    \n    this.generateWave();\n    \n    // Create gradient\n    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);\n    gradient.addColorStop(0, this.config.colors[0] + '80');\n    gradient.addColorStop(1, this.config.colors[1] + '40');\n    \n    // Draw wave\n    this.ctx.beginPath();\n    this.ctx.moveTo(0, height);\n    \n    this.points.forEach(point => {\n      this.ctx.lineTo(point.x, point.y);\n    });\n    \n    this.ctx.lineTo(width, height);\n    this.ctx.closePath();\n    \n    this.ctx.fillStyle = gradient;\n    this.ctx.fill();\n    \n    this.time += this.config.speed;\n  }\n\n  setViscosity(viscosity) {\n    this.config.viscosity = viscosity;\n  }\n}"
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
        template: "\n// Matrix Glitch Effect\nclass MatrixGlitch {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.config = {\n      intensity: {{intensity}},\n      frequency: {{frequency}},\n      colorShift: {{colorShift}},\n      scanlines: {{scanlines}},\n      colors: {{colors}}\n    };\n    this.glitchData = [];\n  }\n\n  generateGlitch() {\n    const { width, height } = this.canvas;\n    this.glitchData = [];\n    \n    for (let i = 0; i < this.config.frequency; i++) {\n      this.glitchData.push({\n        y: Math.random() * height,\n        height: Math.random() * 20 + 5,\n        offset: (Math.random() - 0.5) * 50 * this.config.intensity,\n        color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]\n      });\n    }\n  }\n\n  applyGlitch() {\n    const { width, height } = this.canvas;\n    const imageData = this.ctx.getImageData(0, 0, width, height);\n    \n    if (Math.random() < this.config.intensity * 0.1) {\n      this.generateGlitch();\n    }\n\n    // Apply glitch strips\n    this.glitchData.forEach(glitch => {\n      const startY = Math.floor(glitch.y);\n      const endY = Math.floor(glitch.y + glitch.height);\n      \n      for (let y = startY; y < endY && y < height; y++) {\n        for (let x = 0; x < width; x++) {\n          const sourceX = Math.max(0, Math.min(width - 1, x + glitch.offset));\n          const sourceIndex = (y * width + sourceX) * 4;\n          const targetIndex = (y * width + x) * 4;\n          \n          if (this.config.colorShift) {\n            imageData.data[targetIndex] = imageData.data[sourceIndex + 2]; // R = B\n            imageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1]; // G = G\n            imageData.data[targetIndex + 2] = imageData.data[sourceIndex]; // B = R\n          }\n        }\n      }\n    });\n\n    this.ctx.putImageData(imageData, 0, 0);\n\n    // Add scanlines\n    if (this.config.scanlines) {\n      this.ctx.save();\n      this.ctx.globalAlpha = 0.1;\n      this.ctx.fillStyle = '#ffffff';\n      \n      for (let y = 0; y < height; y += 4) {\n        this.ctx.fillRect(0, y, width, 1);\n      }\n      \n      this.ctx.restore();\n    }\n  }\n\n  render() {\n    this.applyGlitch();\n  }\n}"
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
        template: "\n// Lightning Storm Effect\nclass LightningStorm {\n  constructor(canvas, options = {}) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext('2d');\n    this.config = {\n      branches: {{branches}},\n      intensity: {{intensity}},\n      color: \"{{color}}\",\n      duration: {{duration}},\n      thickness: {{thickness}}\n    };\n    this.bolts = [];\n  }\n\n  generateBolt(startX, startY, endX, endY, generation = 0) {\n    const points = [{ x: startX, y: startY }];\n    const segments = 15 + generation * 5;\n    const chaos = Math.max(1, 50 - generation * 10);\n    \n    for (let i = 1; i < segments; i++) {\n      const progress = i / segments;\n      const x = startX + (endX - startX) * progress + \n                (Math.random() - 0.5) * chaos;\n      const y = startY + (endY - startY) * progress + \n                (Math.random() - 0.5) * chaos * 0.5;\n      points.push({ x, y });\n      \n      // Create branches\n      if (generation < 2 && Math.random() < 0.3) {\n        const branchEndX = x + (Math.random() - 0.5) * 100;\n        const branchEndY = y + Math.random() * 50 + 20;\n        this.bolts.push({\n          points: this.generateBolt(x, y, branchEndX, branchEndY, generation + 1),\n          thickness: this.config.thickness * (0.7 - generation * 0.2),\n          intensity: this.config.intensity * (0.8 - generation * 0.2)\n        });\n      }\n    }\n    \n    points.push({ x: endX, y: endY });\n    return points;\n  }\n\n  createLightning() {\n    this.bolts = [];\n    const { width, height } = this.canvas;\n    \n    for (let i = 0; i < this.config.branches; i++) {\n      const startX = Math.random() * width;\n      const endX = startX + (Math.random() - 0.5) * 200;\n      const points = this.generateBolt(startX, 0, endX, height, 0);\n      \n      this.bolts.push({\n        points,\n        thickness: this.config.thickness,\n        intensity: this.config.intensity\n      });\n    }\n  }\n\n  render() {\n    const { width, height } = this.canvas;\n    this.ctx.clearRect(0, 0, width, height);\n    \n    this.bolts.forEach(bolt => {\n      this.ctx.save();\n      this.ctx.strokeStyle = this.config.color;\n      this.ctx.lineWidth = bolt.thickness;\n      this.ctx.shadowColor = this.config.color;\n      this.ctx.shadowBlur = 15 * bolt.intensity;\n      this.ctx.lineCap = 'round';\n      this.ctx.lineJoin = 'round';\n      \n      this.ctx.beginPath();\n      bolt.points.forEach((point, index) => {\n        if (index === 0) {\n          this.ctx.moveTo(point.x, point.y);\n        } else {\n          this.ctx.lineTo(point.x, point.y);\n        }\n      });\n      this.ctx.stroke();\n      this.ctx.restore();\n    });\n  }\n\n  strike() {\n    this.createLightning();\n    \n    setTimeout(() => {\n      this.bolts = [];\n    }, this.config.duration);\n  }\n}"
    }
];
// Template processing function
export function processTemplate(template, parameters) {
    var processedTemplate = template;
    // Replace parameter placeholders
    Object.entries(parameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var placeholder = new RegExp("{{".concat(key, "}}"), 'g');
        var replacementValue;
        if (Array.isArray(value)) {
            replacementValue = JSON.stringify(value);
        }
        else if (typeof value === 'string') {
            replacementValue = "\"".concat(value, "\"");
        }
        else {
            replacementValue = String(value);
        }
        processedTemplate = processedTemplate.replace(placeholder, replacementValue);
    });
    return processedTemplate;
}
// Get template by ID
export function getTemplate(id) {
    return effectTemplates.find(function (template) { return template.id === id; });
}
// Get templates by category
export function getTemplatesByCategory(category) {
    return effectTemplates.filter(function (template) { return template.category === category; });
}
// Get templates by type
export function getTemplatesByType(type) {
    return effectTemplates.filter(function (template) { return template.type === type; });
}
// Search templates
export function searchTemplates(query) {
    var lowercaseQuery = query.toLowerCase();
    return effectTemplates.filter(function (template) {
        return template.name.toLowerCase().includes(lowercaseQuery) ||
            template.description.toLowerCase().includes(lowercaseQuery) ||
            template.tags.some(function (tag) { return tag.toLowerCase().includes(lowercaseQuery); });
    });
}
