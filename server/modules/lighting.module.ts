interface LightingConfig {
  lightCount: number;
  intensity: number;
  color: string;
  shadows: boolean;
  glowEffect: boolean;
  lightType: 'point' | 'directional' | 'ambient';
}

class LightingModule {
  getName(): string {
    return "lighting";
  }

  generateCode(config: LightingConfig): string {
    return `
// Lighting Module - Dynamic Lighting Effects
class LightingSystem {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lights = [];
    this.shadows = [];
    this.config = {
      lightCount: ${config.lightCount || 3},
      intensity: ${config.intensity || 0.8},
      color: "${config.color || '#ffffff'}",
      shadows: ${config.shadows || true},
      glowEffect: ${config.glowEffect || true},
      lightType: "${config.lightType || 'point'}"
    };
    this.ambientLight = 0.1;
  }

  createLight(x, y, options = {}) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: x,
      y: y,
      intensity: options.intensity || this.config.intensity,
      color: options.color || this.config.color,
      radius: options.radius || 100,
      type: options.type || this.config.lightType,
      flickering: options.flickering || false,
      flickerSpeed: options.flickerSpeed || 0.1,
      flickerIntensity: options.flickerIntensity || 0.2,
      angle: options.angle || 0,
      spread: options.spread || Math.PI * 2,
      falloff: options.falloff || 'quadratic' // linear, quadratic, exponential
    };
  }

  addLight(light) {
    this.lights.push(light);
    return light;
  }

  removeLight(lightId) {
    this.lights = this.lights.filter(light => light.id !== lightId);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateLightIntensity(light, x, y) {
    const dx = x - light.x;
    const dy = y - light.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > light.radius) return 0;
    
    let intensity = light.intensity;
    
    // Apply flickering
    if (light.flickering) {
      const flicker = Math.sin(Date.now() * light.flickerSpeed) * light.flickerIntensity;
      intensity *= (1 + flicker);
    }
    
    // Apply falloff
    let falloffFactor = 1;
    switch (light.falloff) {
      case 'linear':
        falloffFactor = 1 - (distance / light.radius);
        break;
      case 'quadratic':
        falloffFactor = 1 - Math.pow(distance / light.radius, 2);
        break;
      case 'exponential':
        falloffFactor = Math.exp(-distance / (light.radius * 0.5));
        break;
    }
    
    // Check if point is within light cone (for directional lights)
    if (light.type === 'directional' && light.spread < Math.PI * 2) {
      const angle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(angle - light.angle);
      const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
      
      if (normalizedAngleDiff > light.spread / 2) return 0;
      
      const coneIntensity = 1 - (normalizedAngleDiff / (light.spread / 2));
      falloffFactor *= coneIntensity;
    }
    
    return Math.max(0, intensity * falloffFactor);
  }

  createLightMap() {
    const { width, height } = this.canvas;
    const lightMap = this.ctx.createImageData(width, height);
    const data = lightMap.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        let totalR = 0, totalG = 0, totalB = 0, totalIntensity = 0;
        
        // Calculate lighting from all light sources
        this.lights.forEach(light => {
          const intensity = this.calculateLightIntensity(light, x, y);
          if (intensity > 0) {
            const lightColor = this.hexToRgb(light.color);
            if (lightColor) {
              totalR += lightColor.r * intensity;
              totalG += lightColor.g * intensity;
              totalB += lightColor.b * intensity;
              totalIntensity += intensity;
            }
          }
        });
        
        // Add ambient lighting
        totalR += 255 * this.ambientLight;
        totalG += 255 * this.ambientLight;
        totalB += 255 * this.ambientLight;
        totalIntensity += this.ambientLight;
        
        // Normalize and clamp values
        data[index] = Math.min(255, totalR);
        data[index + 1] = Math.min(255, totalG);
        data[index + 2] = Math.min(255, totalB);
        data[index + 3] = Math.min(255, totalIntensity * 255);
      }
    }
    
    return lightMap;
  }

  renderVolumetricLighting() {
    if (!this.config.glowEffect) return;
    
    this.lights.forEach(light => {
      const gradient = this.ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, light.radius
      );
      
      const lightColor = this.hexToRgb(light.color);
      if (lightColor) {
        let intensity = light.intensity;
        
        if (light.flickering) {
          const flicker = Math.sin(Date.now() * light.flickerSpeed) * light.flickerIntensity;
          intensity *= (1 + flicker);
        }
        
        gradient.addColorStop(0, \`rgba(\${lightColor.r}, \${lightColor.g}, \${lightColor.b}, \${intensity * 0.8})\`);
        gradient.addColorStop(0.5, \`rgba(\${lightColor.r}, \${lightColor.g}, \${lightColor.b}, \${intensity * 0.4})\`);
        gradient.addColorStop(1, \`rgba(\${lightColor.r}, \${lightColor.g}, \${lightColor.b}, 0)\`);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });
  }

  renderDirectionalBeam(light) {
    if (light.type !== 'directional') return;
    
    this.ctx.save();
    this.ctx.translate(light.x, light.y);
    this.ctx.rotate(light.angle);
    
    const gradient = this.ctx.createLinearGradient(0, -light.spread * 50, light.radius, light.spread * 50);
    const lightColor = this.hexToRgb(light.color);
    
    if (lightColor) {
      gradient.addColorStop(0, \`rgba(\${lightColor.r}, \${lightColor.g}, \${lightColor.b}, 0)\`);
      gradient.addColorStop(0.5, \`rgba(\${lightColor.r}, \${lightColor.g}, \${lightColor.b}, \${light.intensity * 0.6})\`);
      gradient.addColorStop(1, \`rgba(\${lightColor.r}, \${lightColor.g}, \${lightColor.b}, 0)\`);
      
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.fillStyle = gradient;
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, light.radius, -light.spread / 2, light.spread / 2);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  castShadow(light, obstacles) {
    if (!this.config.shadows || !obstacles) return;
    
    obstacles.forEach(obstacle => {
      const dx = obstacle.x - light.x;
      const dy = obstacle.y - light.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < light.radius) {
        const angle = Math.atan2(dy, dx);
        const shadowLength = light.radius - distance + obstacle.radius;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        
        // Create shadow polygon
        const shadowStartX = obstacle.x + Math.cos(angle + Math.PI/2) * obstacle.radius;
        const shadowStartY = obstacle.y + Math.sin(angle + Math.PI/2) * obstacle.radius;
        const shadowEndX = obstacle.x + Math.cos(angle - Math.PI/2) * obstacle.radius;
        const shadowEndY = obstacle.y + Math.sin(angle - Math.PI/2) * obstacle.radius;
        
        const shadowTipX = obstacle.x + Math.cos(angle) * shadowLength;
        const shadowTipY = obstacle.y + Math.sin(angle) * shadowLength;
        
        this.ctx.beginPath();
        this.ctx.moveTo(shadowStartX, shadowStartY);
        this.ctx.lineTo(shadowEndX, shadowEndY);
        this.ctx.lineTo(shadowTipX, shadowTipY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      }
    });
  }

  render(obstacles = []) {
    this.ctx.save();
    
    // Render volumetric lighting
    this.renderVolumetricLighting();
    
    // Render directional beams
    this.lights.forEach(light => {
      if (light.type === 'directional') {
        this.renderDirectionalBeam(light);
      }
    });
    
    // Cast shadows
    if (this.config.shadows) {
      this.lights.forEach(light => {
        this.castShadow(light, obstacles);
      });
    }
    
    this.ctx.restore();
  }

  update() {
    // Update light animations, flickering, etc.
    this.lights.forEach(light => {
      if (light.flickering) {
        // Flickering is handled in intensity calculation
      }
    });
  }

  setAmbientLight(level) {
    this.ambientLight = Math.max(0, Math.min(1, level));
  }

  getLights() {
    return this.lights;
  }

  getLightById(id) {
    return this.lights.find(light => light.id === id);
  }
}`;
  }

  getEstimatedComplexity(config: LightingConfig): number {
    let complexity = 2; // Base complexity
    
    complexity += Math.min(config.lightCount, 5);
    if (config.shadows) complexity += 3;
    if (config.glowEffect) complexity += 2;
    if (config.lightType === 'directional') complexity += 1;
    
    return Math.min(complexity, 10);
  }

  getPerformanceImpact(config: LightingConfig): string {
    const complexity = this.getEstimatedComplexity(config);
    
    if (complexity <= 4) return "low";
    if (complexity <= 7) return "medium";
    return "high";
  }
}

export const lightingModule = new LightingModule();
