interface MorphingConfig {
  shapes: string[];
  morphSpeed: number;
  easing: string;
  interpolation: string;
  autoReverse: boolean;
  seamless: boolean;
}

class MorphingModule {
  getName(): string {
    return "morphing";
  }

  generateCode(config: MorphingConfig): string {
    return `
// Morphing Module - Shape Transformation
class MorphingEngine {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = {
      shapes: ${JSON.stringify(config.shapes || ['circle', 'square', 'triangle'])},
      morphSpeed: ${config.morphSpeed || 1.0},
      easing: "${config.easing || 'easeInOutQuad'}",
      interpolation: "${config.interpolation || 'smooth'}",
      autoReverse: ${config.autoReverse || false},
      seamless: ${config.seamless || true}
    };
    
    this.currentShape = 0;
    this.nextShape = 1;
    this.morphProgress = 0;
    this.direction = 1;
    this.morphTargets = [];
    
    this.initializeShapes();
  }

  initializeShapes() {
    this.morphTargets = this.config.shapes.map(shape => this.generateShapePoints(shape));
  }

  generateShapePoints(shapeType, resolution = 36) {
    const points = [];
    const angleStep = (Math.PI * 2) / resolution;
    
    switch (shapeType.toLowerCase()) {
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
      case 'rectangle':
        const sides = 4;
        const sideLength = resolution / sides;
        
        // Top side
        for (let i = 0; i < sideLength; i++) {
          points.push({
            x: -1 + (2 * i / sideLength),
            y: -1
          });
        }
        // Right side
        for (let i = 0; i < sideLength; i++) {
          points.push({
            x: 1,
            y: -1 + (2 * i / sideLength)
          });
        }
        // Bottom side
        for (let i = 0; i < sideLength; i++) {
          points.push({
            x: 1 - (2 * i / sideLength),
            y: 1
          });
        }
        // Left side
        for (let i = 0; i < sideLength; i++) {
          points.push({
            x: -1,
            y: 1 - (2 * i / sideLength)
          });
        }
        break;
        
      case 'triangle':
        const trianglePoints = [
          { x: 0, y: -1 },
          { x: Math.cos(2 * Math.PI / 3), y: Math.sin(2 * Math.PI / 3) },
          { x: Math.cos(4 * Math.PI / 3), y: Math.sin(4 * Math.PI / 3) }
        ];
        
        for (let i = 0; i < resolution; i++) {
          const segment = Math.floor(i / (resolution / 3));
          const t = (i % (resolution / 3)) / (resolution / 3);
          const p1 = trianglePoints[segment];
          const p2 = trianglePoints[(segment + 1) % 3];
          
          points.push({
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
          });
        }
        break;
        
      case 'star':
        const starPoints = 5;
        const outerRadius = 1;
        const innerRadius = 0.4;
        
        for (let i = 0; i < resolution; i++) {
          const angle = (i / resolution) * Math.PI * 2;
          const pointIndex = Math.floor((i / resolution) * starPoints * 2);
          const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
          
          points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          });
        }
        break;
        
      case 'heart':
        for (let i = 0; i < resolution; i++) {
          const t = (i / resolution) * Math.PI * 2;
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
          
          points.push({
            x: x / 20,
            y: y / 20
          });
        }
        break;
        
      default:
        // Default to circle
        for (let i = 0; i < resolution; i++) {
          const angle = i * angleStep;
          points.push({
            x: Math.cos(angle),
            y: Math.sin(angle)
          });
        }
    }
    
    return points;
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  easeInOutElastic(t) {
    const c5 = (2 * Math.PI) / 4.5;
    
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  }

  applyEasing(progress) {
    switch (this.config.easing) {
      case 'linear': return progress;
      case 'easeInOutQuad': return this.easeInOutQuad(progress);
      case 'easeInOutCubic': return this.easeInOutCubic(progress);
      case 'easeInOutSine': return this.easeInOutSine(progress);
      case 'easeInOutElastic': return this.easeInOutElastic(progress);
      default: return this.easeInOutQuad(progress);
    }
  }

  interpolatePoints(points1, points2, t) {
    const interpolated = [];
    const easedT = this.applyEasing(t);
    
    for (let i = 0; i < Math.min(points1.length, points2.length); i++) {
      if (this.config.interpolation === 'smooth') {
        // Smooth interpolation with curve fitting
        interpolated.push({
          x: points1[i].x + (points2[i].x - points1[i].x) * easedT,
          y: points1[i].y + (points2[i].y - points1[i].y) * easedT
        });
      } else {
        // Linear interpolation
        interpolated.push({
          x: points1[i].x + (points2[i].x - points1[i].x) * t,
          y: points1[i].y + (points2[i].y - points1[i].y) * t
        });
      }
    }
    
    return interpolated;
  }

  getCurrentPoints() {
    if (this.morphTargets.length === 0) return [];
    
    const currentPoints = this.morphTargets[this.currentShape];
    const nextPoints = this.morphTargets[this.nextShape];
    
    return this.interpolatePoints(currentPoints, nextPoints, this.morphProgress);
  }

  update() {
    this.morphProgress += this.config.morphSpeed * 0.01 * this.direction;
    
    if (this.morphProgress >= 1) {
      if (this.config.autoReverse) {
        this.direction = -1;
        this.morphProgress = 1;
      } else {
        this.morphProgress = this.config.seamless ? 0 : 1;
        this.currentShape = this.nextShape;
        this.nextShape = (this.nextShape + 1) % this.morphTargets.length;
      }
    } else if (this.morphProgress <= 0 && this.config.autoReverse) {
      this.direction = 1;
      this.morphProgress = 0;
      if (!this.config.seamless) {
        this.currentShape = this.nextShape;
        this.nextShape = (this.nextShape + 1) % this.morphTargets.length;
      }
    }
  }

  render(centerX, centerY, scale = 50) {
    const points = this.getCurrentPoints();
    if (points.length === 0) return;
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);
    
    // Create gradient based on morph progress
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 2);
    const hue1 = (this.currentShape * 60) % 360;
    const hue2 = (this.nextShape * 60) % 360;
    const currentHue = hue1 + (hue2 - hue1) * this.morphProgress;
    
    gradient.addColorStop(0, \`hsl(\${currentHue}, 70%, 60%)\`);
    gradient.addColorStop(1, \`hsl(\${currentHue + 30}, 70%, 40%)\`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.strokeStyle = \`hsl(\${currentHue}, 80%, 80%)\`;
    this.ctx.lineWidth = 0.05;
    
    // Draw the morphed shape
    this.ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    this.ctx.closePath();
    
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  addShape(shapeType) {
    const newPoints = this.generateShapePoints(shapeType);
    this.morphTargets.push(newPoints);
    this.config.shapes.push(shapeType);
  }

  removeShape(index) {
    if (this.morphTargets.length > 2 && index < this.morphTargets.length) {
      this.morphTargets.splice(index, 1);
      this.config.shapes.splice(index, 1);
      
      // Adjust current indices if necessary
      if (this.currentShape >= index) {
        this.currentShape = Math.max(0, this.currentShape - 1);
      }
      if (this.nextShape >= index) {
        this.nextShape = Math.max(0, this.nextShape - 1);
      }
    }
  }

  setMorphSpeed(speed) {
    this.config.morphSpeed = Math.max(0.1, Math.min(5, speed));
  }

  setEasing(easingFunction) {
    this.config.easing = easingFunction;
  }

  reset() {
    this.currentShape = 0;
    this.nextShape = 1;
    this.morphProgress = 0;
    this.direction = 1;
  }

  getCurrentShapeName() {
    return this.config.shapes[this.currentShape] || 'unknown';
  }

  getNextShapeName() {
    return this.config.shapes[this.nextShape] || 'unknown';
  }

  getMorphProgress() {
    return this.morphProgress;
  }
}`;
  }

  getEstimatedComplexity(config: MorphingConfig): number {
    let complexity = 2; // Base complexity
    
    complexity += Math.min(config.shapes.length, 4);
    if (config.easing !== 'linear') complexity += 1;
    if (config.interpolation === 'smooth') complexity += 1;
    if (config.seamless) complexity += 1;
    
    return Math.min(complexity, 9);
  }

  getPerformanceImpact(config: MorphingConfig): string {
    const complexity = this.getEstimatedComplexity(config);
    
    if (complexity <= 3) return "low";
    if (complexity <= 6) return "medium";
    return "high";
  }
}

export const morphingModule = new MorphingModule();
