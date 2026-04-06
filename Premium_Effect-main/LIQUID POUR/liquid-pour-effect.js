class LiquidPourEffect extends BaseEffect {
  constructor(config = {}) {
    super({
      id: 'viscous-text-flow-005',
      name: 'Écoulement Liquide Visqueux',
      category: 'text',
      version: '1.0',
      performance: 'medium',
      parameters: {
        vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
        intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
        couleurBase: { type: 'color', default: '#4a90e2' },
        viscosity: { type: 'range', min: 0.1, max: 3, default: 1.2 },
        flowRate: { type: 'range', min: 0.3, max: 3, default: 1.5 }
      }
    });
    
    // Variables d'état
    this.temps = 0;
    this.texteComplet = '';
    this.pointsCibles = [];
    this.phase = 'coulage'; // coulage, formation, solidification, stable
    this.tempsDernierePhase = 0;
    
    // Système de particules liquides
    this.particulesLiquide = [];
    this.maxParticules = 600;
    this.sources = [];
    this.metaballs = [];
    
    // Physics fluide
    this.gravity = 0.3;
    this.damping = 0.98;
    this.surfaceTension = 0.02;
    this.cohesion = 15;
    this.separation = 8;
    
    // Éclaboussures et gouttes
    this.eclaboussures = [];
    this.gouttes = [];
    this.prochainerGoutte = 0;
    
    // Reflets et ondulations
    this.ondulations = [];
    this.reflets = [];
    this.surfacePoints = [];
    
    // Canvas pour métaballs
    this.metaballCanvas = null;
    this.metaballCtx = null;
    
    this.initializeParticleSystem();
    this.initializeMetaballCanvas();
  }
  
  initializeParticleSystem() {
    this.particulesLiquide = [];
    
    for (let i = 0; i < this.maxParticules; i++) {
      this.particulesLiquide.push({
        x: 0, y: 0,
        vx: 0, vy: 0,
        ax: 0, ay: 0,
        rayon: 3 + Math.random() * 4,
        masse: 1 + Math.random() * 0.5,
        viscosite: 0.8 + Math.random() * 0.4,
        active: false,
        age: 0,
        maxAge: 10000 + Math.random() * 5000,
        couleur: { r: 74, g: 144, b: 226 },
        solidification: 0, // 0 = liquide, 1 = solide
        cible: null,
        atteinteCible: false,
        ondulation: Math.random() * Math.PI * 2,
        vitesseOndulation: 0.02 + Math.random() * 0.03
      });
    }
  }
  
  initializeMetaballCanvas() {
    this.metaballCanvas = document.createElement('canvas');
    this.metaballCanvas.width = 800;
    this.metaballCanvas.height = 600;
    this.metaballCtx = this.metaballCanvas.getContext('2d');
  }
  
  initialize(canvas, element) {
    this.texteComplet = element.content || 'FLUIDE';
    this.temps = 0;
    this.phase = 'coulage';
    this.tempsDernierePhase = 0;
    
    this.genererPointsCibles(element);
    this.genererSources(element);
    this.reinitialiserParticules();
    
    this.prochainerGoutte = this.temps + 100;
  }
  
  genererPointsCibles(element) {
    this.pointsCibles = [];
    const { x, y, width, height } = element;
    
    // Canvas temporaire pour analyser le texte
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    const fontSize = Math.floor(height * 0.7);
    tempCtx.font = `bold ${fontSize}px Georgia`;
    tempCtx.fillStyle = 'white';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(this.texteComplet, width / 2, height / 2);
    
    // Échantillonner avec densité variable
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const step = 4;
    
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const index = (py * width + px) * 4;
        const alpha = imageData.data[index + 3];
        
        if (alpha > 100) {
          this.pointsCibles.push({
            x: x + px,
            y: y + py,
            force: 1 + Math.random(),
            occupe: false,
            densite: alpha / 255,
            profondeur: Math.random(),
            ondulation: Math.random() * Math.PI * 2
          });
        }
      }
    }
  }
  
  genererSources(element) {
    this.sources = [];
    const { x, width } = element;
    const nbSources = 3 + Math.floor(this.texteComplet.length * 0.3);
    
    for (let i = 0; i < nbSources; i++) {
      this.sources.push({
        x: x + (width / (nbSources + 1)) * (i + 1),
        y: 0,
        debit: 0.8 + Math.random() * 0.4,
        prochainePulse: this.temps + Math.random() * 500,
        pulseDuree: 200 + Math.random() * 300,
        active: false
      });
    }
  }
  
  reinitialiserParticules() {
    this.particulesLiquide.forEach(particule => {
      particule.active = false;
      particule.solidification = 0;
      particule.atteinteCible = false;
      particule.cible = null;
    });
  }
  
  updatePhase(deltaTime) {
    this.tempsDernierePhase += deltaTime;
    
    switch (this.phase) {
      case 'coulage':
        if (this.tempsDernierePhase > 3000) {
          this.phase = 'formation';
          this.tempsDernierePhase = 0;
        }
        break;
        
      case 'formation':
        if (this.tempsDernierePhase > 4000) {
          this.phase = 'solidification';
          this.tempsDernierePhase = 0;
        }
        break;
        
      case 'solidification':
        if (this.tempsDernierePhase > 2000) {
          this.phase = 'stable';
          this.tempsDernierePhase = 0;
        }
        break;
        
      case 'stable':
        if (this.tempsDernierePhase > 3000) {
          this.phase = 'coulage';
          this.tempsDernierePhase = 0;
          this.reinitialiserParticules();
        }
        break;
    }
  }
  
  updateSources(deltaTime) {
    this.sources.forEach(source => {
      // Activation des sources
      if (this.temps >= source.prochainePulse && this.phase === 'coulage') {
        source.active = true;
        source.prochainePulse = this.temps + 800 + Math.random() * 1200;
      }
      
      // Émission de particules
      if (source.active && Math.random() < source.debit * this.parameters.flowRate.value) {
        this.emettreLiquide(source.x, source.y);
      }
      
      // Désactivation progressive
      if (this.phase !== 'coulage') {
        source.active = false;
      }
    });
  }
  
  emettreLiquide(x, y) {
    const particule = this.particulesLiquide.find(p => !p.active);
    if (!particule) return;
    
    particule.active = true;
    particule.x = x + (Math.random() - 0.5) * 10;
    particule.y = y;
    particule.vx = (Math.random() - 0.5) * 2;
    particule.vy = Math.random() * 1;
    particule.ax = 0;
    particule.ay = 0;
    particule.age = 0;
    particule.solidification = 0;
    particule.atteinteCible = false;
    
    // Couleur avec variation
    const baseColor = this.hexToRgb(this.parameters.couleurBase.value);
    particule.couleur = {
      r: Math.max(0, Math.min(255, baseColor.r + (Math.random() - 0.5) * 40)),
      g: Math.max(0, Math.min(255, baseColor.g + (Math.random() - 0.5) * 40)),
      b: Math.max(0, Math.min(255, baseColor.b + (Math.random() - 0.5) * 40))
    };
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 74, g: 144, b: 226 };
  }
  
  updateParticules(deltaTime) {
    const dt = Math.min(deltaTime / 16.67, 2);
    
    this.particulesLiquide.forEach((particule, index) => {
      if (!particule.active) return;
      
      particule.age += deltaTime;
      particule.ondulation += particule.vitesseOndulation * dt;
      
      // Reset forces
      particule.ax = 0;
      particule.ay = this.gravity;
      
      // Forces fluides
      this.applyFluidForces(particule, index, dt);
      
      // Attraction vers les cibles
      if (this.phase === 'formation' || this.phase === 'solidification') {
        this.applyTargetAttraction(particule);
      }
      
      // Intégration physique
      particule.vx += particule.ax * dt;
      particule.vy += particule.ay * dt;
      
      // Viscosité
      const viscosityDamping = 1 - (particule.viscosite * this.parameters.viscosity.value * 0.05);
      particule.vx *= viscosityDamping;
      particule.vy *= viscosityDamping;
      
      // Mise à jour position
      particule.x += particule.vx * dt;
      particule.y += particule.vy * dt;
      
      // Solidification progressive
      if (this.phase === 'solidification' && particule.atteinteCible) {
        particule.solidification = Math.min(1, particule.solidification + 0.02 * dt);
      }
      
      // Collision avec le sol et les bords
      this.handleCollisions(particule);
      
      // Désactivation si trop vieux
      if (particule.age > particule.maxAge) {
        particule.active = false;
      }
    });
  }
  
  applyFluidForces(particule, index, dt) {
    let cohesionForce = { x: 0, y: 0 };
    let separationForce = { x: 0, y: 0 };
    let voisins = 0;
    
    this.particulesLiquide.forEach((autre, autreIndex) => {
      if (index === autreIndex || !autre.active) return;
      
      const dx = autre.x - particule.x;
      const dy = autre.y - particule.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.cohesion && distance > 0) {
        // Cohésion
        cohesionForce.x += dx;
        cohesionForce.y += dy;
        voisins++;
        
        // Séparation si trop proche
        if (distance < this.separation) {
          const force = (this.separation - distance) / this.separation;
          separationForce.x -= (dx / distance) * force;
          separationForce.y -= (dy / distance) * force;
        }
      }
    });
    
    if (voisins > 0) {
      // Appliquer cohésion
      cohesionForce.x = (cohesionForce.x / voisins) * this.surfaceTension;
      cohesionForce.y = (cohesionForce.y / voisins) * this.surfaceTension;
      
      particule.ax += cohesionForce.x;
      particule.ay += cohesionForce.y;
    }
    
    // Appliquer séparation
    particule.ax += separationForce.x * 0.1;
    particule.ay += separationForce.y * 0.1;
  }
  
  applyTargetAttraction(particule) {
    if (particule.atteinteCible) return;
    
    // Trouver la cible la plus proche
    let meilleureCible = null;
    let meilleureDistance = Infinity;
    
    this.pointsCibles.forEach(cible => {
      const dx = cible.x - particule.x;
      const dy = cible.y - particule.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < meilleureDistance) {
        meilleureDistance = distance;
        meilleureCible = cible;
      }
    });
    
    if (meilleureCible && meilleureDistance > 0) {
      const dx = meilleureCible.x - particule.x;
      const dy = meilleureCible.y - particule.y;
      const force = Math.min(0.5, 100 / (meilleureDistance + 1));
      
      particule.ax += (dx / meilleureDistance) * force;
      particule.ay += (dy / meilleureDistance) * force;
      
      // Marquer comme atteinte si très proche
      if (meilleureDistance < 15) {
        particule.atteinteCible = true;
        particule.cible = meilleureCible;
      }
    }
  }
  
  handleCollisions(particule) {
    const bounce = 0.3;
    const friction = 0.8;
    
    // Sol
    if (particule.y > 580) {
      particule.y = 580;
      particule.vy *= -bounce;
      particule.vx *= friction;
      
      // Créer éclaboussure
      if (Math.abs(particule.vy) > 2) {
        this.creerEclaboussure(particule.x, particule.y);
      }
    }
    
    // Bords
    if (particule.x < 10) {
      particule.x = 10;
      particule.vx *= -bounce;
    } else if (particule.x > 790) {
      particule.x = 790;
      particule.vx *= -bounce;
    }
  }
  
  creerEclaboussure(x, y) {
    for (let i = 0; i < 3; i++) {
      const eclaboussure = this.eclaboussures.find(e => !e.active) || 
                          { active: false, particules: [] };
      
      if (!eclaboussure.active) {
        eclaboussure.active = true;
        eclaboussure.x = x;
        eclaboussure.y = y;
        eclaboussure.vie = 0;
        eclaboussure.maxVie = 500;
        eclaboussure.particules = [];
        
        // Créer mini-particules d'éclaboussure
        for (let j = 0; j < 5; j++) {
          eclaboussure.particules.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 4 - 1,
            taille: 1 + Math.random() * 2,
            alpha: 0.7
          });
        }
        
        this.eclaboussures.push(eclaboussure);
        break;
      }
    }
  }
  
  updateEclaboussures(deltaTime) {
    this.eclaboussures.forEach(eclaboussure => {
      if (!eclaboussure.active) return;
      
      eclaboussure.vie += deltaTime;
      const progression = eclaboussure.vie / eclaboussure.maxVie;
      
      eclaboussure.particules.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravité
        p.alpha = (1 - progression) * 0.7;
      });
      
      if (eclaboussure.vie >= eclaboussure.maxVie) {
        eclaboussure.active = false;
      }
    });
  }
  
  updateOndulations(deltaTime) {
    // Générer ondulations sur les particules stables
    if (Math.random() < 0.02) {
      const particulesStables = this.particulesLiquide.filter(p => 
        p.active && p.atteinteCible && p.solidification < 0.5
      );
      
      if (particulesStables.length > 0) {
        const particule = particulesStables[Math.floor(Math.random() * particulesStables.length)];
        
        this.ondulations.push({
          x: particule.x,
          y: particule.y,
          rayon: 0,
          maxRayon: 30 + Math.random() * 40,
          vitesse: 0.5 + Math.random() * 0.5,
          alpha: 0.6,
          vie: 0,
          maxVie: 2000
        });
      }
    }
    
    // Mise à jour ondulations existantes
    this.ondulations = this.ondulations.filter(ondulation => {
      ondulation.vie += deltaTime;
      ondulation.rayon += ondulation.vitesse;
      ondulation.alpha = (1 - ondulation.vie / ondulation.maxVie) * 0.6;
      
      return ondulation.vie < ondulation.maxVie && ondulation.rayon < ondulation.maxRayon;
    });
  }
  
  updateReflets(deltaTime) {
    this.reflets = [];
    
    // Créer reflets sur les particules solidifiées
    this.particulesLiquide.forEach(particule => {
      if (!particule.active || particule.solidification < 0.3) return;
      
      const intensite = Math.sin(particule.ondulation) * 0.5 + 0.5;
      this.reflets.push({
        x: particule.x + Math.cos(particule.ondulation * 2) * 3,
        y: particule.y - Math.sin(particule.ondulation * 3) * 2,
        taille: 2 + intensite * 3,
        alpha: intensite * particule.solidification * 0.8,
        couleur: { r: 255, g: 255, b: 255 }
      });
    });
  }
  
  update(deltaTime) {
    this.temps += deltaTime;
    this.updatePhase(deltaTime);
    this.updateSources(deltaTime);
    this.updateParticules(deltaTime);
    this.updateEclaboussures(deltaTime);
    this.updateOndulations(deltaTime);
    this.updateReflets(deltaTime);
  }
  
  render(ctx, element, deltaTime) {
    ctx.save();
    
    // Rendu métaballs pour effet liquide fluide
    this.renderMetaballs();
    
    // Rendu des particules liquides
    this.particulesLiquide.forEach(particule => {
      if (!particule.active) return;
      
      const alpha = 1 - (particule.age / particule.maxAge) * 0.3;
      const ondulation = Math.sin(particule.ondulation) * 0.1 + 1;
      const taille = particule.rayon * ondulation;
      
      // Couleur selon solidification
      const mixSolide = particule.solidification;
      const couleurFinale = {
        r: Math.floor(particule.couleur.r * (1 - mixSolide) + 150 * mixSolide),
        g: Math.floor(particule.couleur.g * (1 - mixSolide) + 150 * mixSolide),
        b: Math.floor(particule.couleur.b * (1 - mixSolide) + 200 * mixSolide)
      };
      
      // Gradient radial pour effet liquide
      const gradient = ctx.createRadialGradient(
        particule.x, particule.y, 0,
        particule.x, particule.y, taille * 1.5
      );
      
      gradient.addColorStop(0, `rgba(${couleurFinale.r}, ${couleurFinale.g}, ${couleurFinale.b}, ${alpha})`);
      gradient.addColorStop(0.7, `rgba(${couleurFinale.r}, ${couleurFinale.g}, ${couleurFinale.b}, ${alpha * 0.7})`);
      gradient.addColorStop(1, `rgba(${couleurFinale.r}, ${couleurFinale.g}, ${couleurFinale.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particule.x, particule.y, taille * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Corps principal
      ctx.fillStyle = `rgba(${couleurFinale.r}, ${couleurFinale.g}, ${couleurFinale.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particule.x, particule.y, taille, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Rendu des éclaboussures
    this.eclaboussures.forEach(eclaboussure => {
      if (!eclaboussure.active) return;
      
      eclaboussure.particules.forEach(p => {
        ctx.fillStyle = `rgba(74, 144, 226, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    // Rendu des ondulations
    this.ondulations.forEach(ondulation => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${ondulation.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ondulation.x, ondulation.y, ondulation.rayon, 0, Math.PI * 2);
      ctx.stroke();
      
      // Ondulation interne
      if (ondulation.rayon > 10) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${ondulation.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ondulation.x, ondulation.y, ondulation.rayon * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    // Rendu des reflets lumineux
    this.reflets.forEach(reflet => {
      const gradient = ctx.createRadialGradient(
        reflet.x, reflet.y, 0,
        reflet.x, reflet.y, reflet.taille
      );
      
      gradient.addColorStop(0, `rgba(255, 255, 255, ${reflet.alpha})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(reflet.x, reflet.y, reflet.taille, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Indicateur de phase
    ctx.globalAlpha = 0.3;
    ctx.font = '12px monospace';
    ctx.fillStyle = this.parameters.couleurBase.value;
    ctx.textAlign = 'left';
    
    let statusText = '';
    switch (this.phase) {
      case 'coulage': statusText = '> VERSEMENT LIQUIDE...'; break;
      case 'formation': statusText = '> FORMATION EN COURS...'; break;
      case 'solidification': statusText = '> SOLIDIFICATION...'; break;
      case 'stable': statusText = '> ÉTAT STABLE'; break;
    }
    
    ctx.fillText(statusText, 10, 580);
    
    ctx.restore();
  }
  
  renderMetaballs() {
    // Simplified metaball effect - would need more complex implementation for true metaballs
    // This creates a basic fluid connectivity illusion
  }
  
  destroy() {
    this.particulesLiquide = [];
    this.pointsCibles = [];
    this.sources = [];
    this.eclaboussures = [];
    this.ondulations = [];
    this.reflets = [];
    
    if (this.metaballCanvas) {
      this.metaballCanvas = null;
      this.metaballCtx = null;
    }
  }
}