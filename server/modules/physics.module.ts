interface PhysicsConfig {
  gravity: number;
  damping: number;
  bounce: number;
  friction: number;
  collision: boolean;
  constraints: boolean;
}

class PhysicsModule {
  getName(): string {
    return "physics";
  }

  generateCode(config: PhysicsConfig): string {
    return `
// Physics Module - Realistic Physics Simulation
class PhysicsEngine {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bodies = [];
    this.constraints = [];
    this.config = {
      gravity: ${config.gravity || 0.2},
      damping: ${config.damping || 0.99},
      bounce: ${config.bounce || 0.8},
      friction: ${config.friction || 0.95},
      collision: ${config.collision || true},
      constraints: ${config.constraints || false}
    };
    this.timeStep = 1/60;
  }

  createBody(x, y, options = {}) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: x,
      y: y,
      oldX: x,
      oldY: y,
      vx: options.vx || 0,
      vy: options.vy || 0,
      ax: 0,
      ay: 0,
      mass: options.mass || 1,
      radius: options.radius || 5,
      fixed: options.fixed || false,
      color: options.color || '#ffffff',
      restitution: options.restitution || this.config.bounce
    };
  }

  addBody(body) {
    this.bodies.push(body);
    return body;
  }

  createConstraint(bodyA, bodyB, restLength = null) {
    const constraint = {
      bodyA: bodyA,
      bodyB: bodyB,
      restLength: restLength || this.distance(bodyA, bodyB),
      stiffness: 0.8
    };
    this.constraints.push(constraint);
    return constraint;
  }

  distance(bodyA, bodyB) {
    const dx = bodyA.x - bodyB.x;
    const dy = bodyA.y - bodyB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  updateVerlet() {
    this.bodies.forEach(body => {
      if (body.fixed) return;

      // Store current position
      const tempX = body.x;
      const tempY = body.y;

      // Apply gravity
      body.ay += this.config.gravity;

      // Verlet integration
      body.x += (body.x - body.oldX) * this.config.damping + body.ax * this.timeStep * this.timeStep;
      body.y += (body.y - body.oldY) * this.config.damping + body.ay * this.timeStep * this.timeStep;

      // Update old position
      body.oldX = tempX;
      body.oldY = tempY;

      // Reset acceleration
      body.ax = 0;
      body.ay = 0;
    });
  }

  updateConstraints() {
    if (!this.config.constraints) return;

    this.constraints.forEach(constraint => {
      const { bodyA, bodyB, restLength, stiffness } = constraint;
      
      const dx = bodyB.x - bodyA.x;
      const dy = bodyB.y - bodyA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return;
      
      const difference = restLength - distance;
      const percent = difference / distance / 2;
      const offsetX = dx * percent * stiffness;
      const offsetY = dy * percent * stiffness;

      if (!bodyA.fixed) {
        bodyA.x -= offsetX;
        bodyA.y -= offsetY;
      }
      if (!bodyB.fixed) {
        bodyB.x += offsetX;
        bodyB.y += offsetY;
      }
    });
  }

  checkCollisions() {
    if (!this.config.collision) return;

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i];
        const bodyB = this.bodies[j];
        
        const dx = bodyB.x - bodyA.x;
        const dy = bodyB.y - bodyA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bodyA.radius + bodyB.radius;

        if (distance < minDistance) {
          // Collision detected
          const overlap = minDistance - distance;
          const separationX = (dx / distance) * overlap * 0.5;
          const separationY = (dy / distance) * overlap * 0.5;

          if (!bodyA.fixed) {
            bodyA.x -= separationX;
            bodyA.y -= separationY;
          }
          if (!bodyB.fixed) {
            bodyB.x += separationX;
            bodyB.y += separationY;
          }

          // Apply restitution (bounce)
          const relativeVelX = (bodyA.x - bodyA.oldX) - (bodyB.x - bodyB.oldX);
          const relativeVelY = (bodyA.y - bodyA.oldY) - (bodyB.y - bodyB.oldY);
          
          const normalX = dx / distance;
          const normalY = dy / distance;
          
          const relativeVelInNormal = relativeVelX * normalX + relativeVelY * normalY;
          
          if (relativeVelInNormal > 0) return; // Objects separating
          
          const restitution = Math.min(bodyA.restitution, bodyB.restitution);
          const impulse = -(1 + restitution) * relativeVelInNormal;
          const impulseX = impulse * normalX;
          const impulseY = impulse * normalY;

          if (!bodyA.fixed) {
            bodyA.oldX += impulseX / bodyA.mass;
            bodyA.oldY += impulseY / bodyA.mass;
          }
          if (!bodyB.fixed) {
            bodyB.oldX -= impulseX / bodyB.mass;
            bodyB.oldY -= impulseY / bodyB.mass;
          }
        }
      }
    }
  }

  checkBoundaries() {
    const { width, height } = this.canvas;
    
    this.bodies.forEach(body => {
      if (body.fixed) return;

      // Bottom boundary
      if (body.y + body.radius > height) {
        body.y = height - body.radius;
        body.oldY = body.y + (body.y - body.oldY) * body.restitution;
        body.oldX *= this.config.friction;
      }

      // Top boundary
      if (body.y - body.radius < 0) {
        body.y = body.radius;
        body.oldY = body.y + (body.y - body.oldY) * body.restitution;
      }

      // Right boundary
      if (body.x + body.radius > width) {
        body.x = width - body.radius;
        body.oldX = body.x + (body.x - body.oldX) * body.restitution;
        body.oldY *= this.config.friction;
      }

      // Left boundary
      if (body.x - body.radius < 0) {
        body.x = body.radius;
        body.oldX = body.x + (body.x - body.oldX) * body.restitution;
        body.oldY *= this.config.friction;
      }
    });
  }

  applyForce(body, fx, fy) {
    if (!body.fixed) {
      body.ax += fx / body.mass;
      body.ay += fy / body.mass;
    }
  }

  update() {
    this.updateVerlet();
    this.updateConstraints();
    this.checkCollisions();
    this.checkBoundaries();
  }

  render() {
    this.ctx.save();
    
    // Render constraints
    if (this.config.constraints) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      
      this.constraints.forEach(constraint => {
        this.ctx.beginPath();
        this.ctx.moveTo(constraint.bodyA.x, constraint.bodyA.y);
        this.ctx.lineTo(constraint.bodyB.x, constraint.bodyB.y);
        this.ctx.stroke();
      });
    }

    // Render bodies
    this.bodies.forEach(body => {
      this.ctx.save();
      this.ctx.fillStyle = body.color;
      this.ctx.shadowColor = body.color;
      this.ctx.shadowBlur = 5;
      
      this.ctx.beginPath();
      this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
    
    this.ctx.restore();
  }

  clear() {
    this.bodies = [];
    this.constraints = [];
  }

  getBodies() {
    return this.bodies;
  }

  getBodyById(id) {
    return this.bodies.find(body => body.id === id);
  }
}`;
  }

  getEstimatedComplexity(config: PhysicsConfig): number {
    let complexity = 3; // Base complexity
    
    if (config.collision) complexity += 2;
    if (config.constraints) complexity += 2;
    if (config.gravity > 0) complexity += 1;
    
    return Math.min(complexity, 10);
  }

  getPerformanceImpact(config: PhysicsConfig): string {
    const complexity = this.getEstimatedComplexity(config);
    
    if (complexity <= 4) return "low";
    if (complexity <= 7) return "medium";
    return "high";
  }
}

export const physicsModule = new PhysicsModule();
