class ParticleBuildEffect extends BaseEffect {
  constructor(config = {}) {
    super({
      id: 'particle-swarm-text-003',
      name: 'Formation Particules Magnétiques',
      category: 'text',
      version: '1.0',
      performance: 'medium',
      parameters: {
        vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
        intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
        couleurBase: { type: 'color', default: '#ff6b6b' },
        particleCount: { type: 'range', min: 100, max: 800, default: 400 },
        magnetForce: { type: 'range', min: 0.1, max: 3, default: 1.5 }
      }
    });
    
    // Variables d'état
    this.temps = 0;
    this.texteComplet = '';
    this.particules = [];
    this.pointsCibles = [];
    this.phase = 'chaos'; // chaos, formation, stable, explosion
    this.tempsDernierePhase = 0;
    this.cycleDuree = 4000; // 4 secondes par cycle
    
    // Système de forces
    this.attracteurs = [];
    this.repulseurs = [];
    this.ventGlobal = { x: 0, y: 0 };
    
    // Gradient évolutif
    this.paletteGradient = [
      { r: 255, g: 107, b: 107 }, // Rouge corail
      { r: 255, g: 159, b: 64 },  // Orange
      { r: 255, g: 206, b: 84 },  // Jaune
      { r: 72, g: 219, b: 251 },  // Cyan
      { r: 101, g: 116, b: 255 }, // Bleu
      { r: 158, g: 101, b: 255 }  // Violet
    ];
    
    // Traînées lumineuses
    this.trainees = [];
    this.maxTrainees = 50;
    
    this.initializeParticleSystem();
  }
  
  initializeParticleSystem() {
    const count = this.parameters.particleCount.value;
    this.particules = [];
    
    for (let i = 0; i < count; i++) {
      this.particules.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        ax: 0, ay: 0, // Accélération
        taille: 2 + Math.random() * 4,
        masse: 0.5 + Math.random() * 1.5,
        couleur: this.getRandomGradientColor(i / count),
        energie: Math.random(),
        pulsation: Math.random() * Math.PI * 2,
        vitessePulsation: 0.02 + Math.random() * 0.03,
        cibleX: 0, cibleY: 0,
        hasCible: false,
        distanceCible: Infinity,
        orbiteAngle: Math.random() * Math.PI * 2,
        orbiteRayon: 5 + Math.random() * 15,
        trainee: []
      });
    }
    
    // Initialiser traînées
    for (let i = 0; i < this.maxTrainees; i++) {
      this.trainees.push({
        active: false,
        points: [],
        couleur: { r: 255, g: 255, b: 255 },
        alpha: 0,
        dureeVie: 0
      });
    }
  }
  
  initialize(canvas, element) {
    this.texteComplet = element.content || 'MAGNÉTISME';
    this.temps = 0;
    this.phase = 'chaos';
    this.tempsDernierePhase = 0;
    
    this.genererPointsCibles(element);
    this.initializeParticleSystem();
  }
  
  genererPointsCibles(element) {
    this.pointsCibles = [];
    const { x, y, width, height } = element;
    
    // Créer canvas temporaire pour analyser le texte
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Dessiner le texte
    const fontSize = Math.floor(height * 0.6);
    tempCtx.font = `bold ${fontSize}px Arial`;
    tempCtx.fillStyle = 'white';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(this.texteComplet, width / 2, height / 2);
    
    // Échantillonner les pixels
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const step = 3; // Résolution d'échantillonnage
    
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const index = (py * width + px) * 4;
        const alpha = imageData.data[index + 3];
        
        if (alpha > 128) { // Pixel visible
          this.pointsCibles.push({
            x: x + px,
            y: y + py,
            force: 1 + Math.random() * 2,
            occupe: false,
            particuleId: -1,
            pulsation: Math.random() * Math.PI * 2
          });
        }
      }
    }
  }
  
  getRandomGradientColor(position) {
    const index = position * (this.paletteGradient.length - 1);
    const i = Math.floor(index);
    const t = index - i;
    
    const couleurA = this.paletteGradient[i] || this.paletteGradient[0];
    const couleurB = this.paletteGradient[i + 1] || this.paletteGradient[this.paletteGradient.length - 1];
    
    return {
      r: Math.floor(couleurA.r + (couleurB.r - couleurA.r) * t),
      g: Math.floor(couleurA.g + (couleurB.g - couleurA.g) * t),
      b: Math.floor(couleurB.b + (couleurB.b - couleurA.b) * t)
    };
  }
  
  updatePhase(deltaTime) {
    this.tempsDernierePhase += deltaTime;
    
    if (this.tempsDernierePhase >= this.cycleDuree) {
      this.tempsDernierePhase = 0;
      
      switch (this.phase) {
        case 'chaos':
          this.phase = 'formation';
          this.assignerCibles();
          break;
        case 'formation':
          this.phase = 'stable';
          break;
        case 'stable':
          this.phase = 'explosion';
          this.creerExplosion();
          break;
        case 'explosion':
          this.phase = 'chaos';
          this.libererParticules();
          break;
      }
    }
  }
  
  assignerCibles() {
    // Réinitialiser cibles
    this.pointsCibles.forEach(point => {
      point.occupe = false;
      point.particuleId = -1;
    });
    
    // Assigner particules aux points les plus proches
    this.particules.forEach(particule => {
      let meilleureCible = null;
      let meilleureDistance = Infinity;
      
      this.pointsCibles.forEach(point => {
        if (point.occupe) return;
        
        const dx = point.x - particule.x;
        const dy = point.y - particule.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < meilleureDistance) {
          meilleureDistance = distance;
          meilleureCible = point;
        }
      });
      
      if (meilleureCible) {
        meilleureCible.occupe = true;
        meilleureCible.particuleId = particule.id;
        particule.cibleX = meilleureCible.x;
        particule.cibleY = meilleureCible.y;
        particule.hasCible = true;
        particule.distanceCible = meilleureDistance;
      } else {
        particule.hasCible = false;
      }
    });
  }
  
  creerExplosion() {
    this.particules.forEach(particule => {
      const angle = Math.random() * Math.PI * 2;
      const force = 2 + Math.random() * 4;
      
      particule.vx += Math.cos(angle) * force;
      particule.vy += Math.sin(angle) * force;
      particule.energie = 1;
      particule.hasCible = false;
    });
  }
  
  libererParticules() {
    this.particules.forEach(particule => {
      particule.hasCible = false;
      particule.vx = (Math.random() - 0.5) * 3;
      particule.vy = (Math.random() - 0.5) * 3;
    });
  }
  
  updateParticules(deltaTime) {
    const dt = Math.min(deltaTime / 16.67, 2); // Normaliser à 60fps
    
    this.particules.forEach((particule, index) => {
      // Reset accélération
      particule.ax = 0;
      particule.ay = 0;
      
      // Forces selon la phase
      switch (this.phase) {
        case 'chaos':
          this.applyFlockingBehavior(particule, index);
          this.applyRandomForces(particule);
          break;
          
        case 'formation':
        case 'stable':
          this.applyMagneticAttraction(particule);
          this.applyOrbitForces(particule);
          break;
          
        case 'explosion':
          this.applyExplosionForces(particule);
          break;
      }
      
      // Intégration physique (Verlet)
      particule.vx += particule.ax * dt;
      particule.vy += particule.ay * dt;
      
      // Friction
      const friction = 0.98;
      particule.vx *= friction;
      particule.vy *= friction;
      
      // Mise à jour position
      particule.x += particule.vx * dt;
      particule.y += particule.vy * dt;
      
      // Limites du canvas avec rebond doux
      this.handleBoundaryCollision(particule);
      
      // Mise à jour propriétés visuelles
      particule.pulsation += particule.vitessePulsation * dt;
      particule.energie = Math.max(0, particule.energie - 0.01 * dt);
      
      // Mise à jour couleur selon position et énergie
      this.updateParticleColor(particule, index);
      
      // Traînée lumineuse
      this.updateTrainee(particule);
    });
  }
  
  applyFlockingBehavior(particule, index) {
    let separation = { x: 0, y: 0 };
    let alignment = { x: 0, y: 0 };
    let cohesion = { x: 0, y: 0 };
    let count = 0;
    
    const perceptionRadius = 50;
    
    this.particules.forEach((autre, autreIndex) => {
      if (index === autreIndex) return;
      
      const dx = autre.x - particule.x;
      const dy = autre.y - particule.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < perceptionRadius && distance > 0) {
        // Séparation
        separation.x -= dx / distance;
        separation.y -= dy / distance;
        
        // Alignement
        alignment.x += autre.vx;
        alignment.y += autre.vy;
        
        // Cohésion
        cohesion.x += autre.x;
        cohesion.y += autre.y;
        
        count++;
      }
    });
    
    if (count > 0) {
      // Appliquer forces de flocking
      particule.ax += separation.x * 0.5;
      particule.ay += separation.y * 0.5;
      
      alignment.x /= count;
      alignment.y /= count;
      particule.ax += (alignment.x - particule.vx) * 0.1;
      particule.ay += (alignment.y - particule.vy) * 0.1;
      
      cohesion.x /= count;
      cohesion.y /= count;
      particule.ax += (cohesion.x - particule.x) * 0.001;
      particule.ay += (cohesion.y - particule.y) * 0.001;
    }
  }
  
  applyRandomForces(particule) {
    const turbulence = 0.2;
    particule.ax += (Math.random() - 0.5) * turbulence;
    particule.ay += (Math.random() - 0.5) * turbulence;
  }
  
  applyMagneticAttraction(particule) {
    if (!particule.hasCible) return;
    
    const dx = particule.cibleX - particule.x;
    const dy = particule.cibleY - particule.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const force = this.parameters.magnetForce.value * particule.masse;
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;
      
      particule.ax += forceX;
      particule.ay += forceY;
      
      particule.distanceCible = distance;
    }
  }
  
  applyOrbitForces(particule) {
    if (!particule.hasCible || particule.distanceCible > 20) return;
    
    // Micro-orbites autour des points de formation
    particule.orbiteAngle += 0.05;
    const orbiteX = Math.cos(particule.orbiteAngle) * particule.orbiteRayon;
    const orbiteY = Math.sin(particule.orbiteAngle) * particule.orbiteRayon;
    
    particule.ax += orbiteX * 0.01;
    particule.ay += orbiteY * 0.01;
  }
  
  applyExplosionForces(particule) {
    // Force centrifuge
    const centerX = 400;
    const centerY = 300;
    const dx = particule.x - centerX;
    const dy = particule.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      particule.ax += (dx / distance) * 0.5;
      particule.ay += (dy / distance) * 0.5;
    }
  }
  
  handleBoundaryCollision(particule) {
    const bounce = 0.7;
    const margin = 10;
    
    if (particule.x < margin) {
      particule.x = margin;
      particule.vx = Math.abs(particule.vx) * bounce;
    } else if (particule.x > 800 - margin) {
      particule.x = 800 - margin;
      particule.vx = -Math.abs(particule.vx) * bounce;
    }
    
    if (particule.y < margin) {
      particule.y = margin;
      particule.vy = Math.abs(particule.vy) * bounce;
    } else if (particule.y > 600 - margin) {
      particule.y = 600 - margin;
      particule.vy = -Math.abs(particule.vy) * bounce;
    }
  }
  
  updateParticleColor(particule, index) {
    const baseColor = this.getRandomGradientColor((index + this.temps * 0.0001) % 1);
    const energyMult = 0.7 + particule.energie * 0.3;
    
    particule.couleur = {
      r: Math.floor(baseColor.r * energyMult),
      g: Math.floor(baseColor.g * energyMult),
      b: Math.floor(baseColor.b * energyMult)
    };
  }
  
  updateTrainee(particule) {
    // Ajouter point à la traînée
    particule.trainee.push({
      x: particule.x,
      y: particule.y,
      alpha: 1
    });
    
    // Limiter longueur traînée
    if (particule.trainee.length > 8) {
      particule.trainee.shift();
    }
    
    // Diminuer alpha des points anciens
    particule.trainee.forEach((point, i) => {
      point.alpha = (i + 1) / particule.trainee.length * 0.5;
    });
  }
  
  update(deltaTime) {
    this.temps += deltaTime;
    this.updatePhase(deltaTime);
    this.updateParticules(deltaTime);
  }
  
  render(ctx, element, deltaTime) {
    ctx.save();
    
    // Rendu des traînées
    this.particules.forEach(particule => {
      if (particule.trainee.length < 2) return;
      
      ctx.strokeStyle = `rgba(${particule.couleur.r}, ${particule.couleur.g}, ${particule.couleur.b}, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      particule.trainee.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.globalAlpha = point.alpha;
          ctx.lineTo(point.x, point.y);
        }
      });
      
      ctx.stroke();
    });
    
    // Rendu des particules
    this.particules.forEach(particule => {
      const pulsation = 0.8 + Math.sin(particule.pulsation) * 0.2;
      const taille = particule.taille * pulsation * (1 + particule.energie * 0.5);
      
      // Corps de la particule
      ctx.fillStyle = `rgba(${particule.couleur.r}, ${particule.couleur.g}, ${particule.couleur.b}, 0.9)`;
      ctx.globalAlpha = 0.9;
      
      ctx.beginPath();
      ctx.arc(particule.x, particule.y, taille, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow effect
      const glowSize = taille * 2;
      const gradient = ctx.createRadialGradient(
        particule.x, particule.y, 0,
        particule.x, particule.y, glowSize
      );
      
      gradient.addColorStop(0, `rgba(${particule.couleur.r}, ${particule.couleur.g}, ${particule.couleur.b}, 0.3)`);
      gradient.addColorStop(1, `rgba(${particule.couleur.r}, ${particule.couleur.g}, ${particule.couleur.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = particule.energie * 0.5;
      
      ctx.beginPath();
      ctx.arc(particule.x, particule.y, glowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Point central brillant
      if (particule.energie > 0.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.globalAlpha = particule.energie;
        
        ctx.beginPath();
        ctx.arc(particule.x, particule.y, taille * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Indication de phase (debug visuel)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = '14px Arial';
    ctx.globalAlpha = 0.3;
    ctx.fillText(`Phase: ${this.phase}`, 10, 580);
    
    ctx.restore();
  }
  
  destroy() {
    this.particules = [];
    this.pointsCibles = [];
    this.trainees = [];
    this.attracteurs = [];
    this.repulseurs = [];
  }
}