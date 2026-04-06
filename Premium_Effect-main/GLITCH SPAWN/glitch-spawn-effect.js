class GlitchSpawnEffect extends BaseEffect {
  constructor(config = {}) {
    super({
      id: 'matrix-error-correction-004',
      name: 'Erreur Matrix Autocorrectrice',
      category: 'text',
      version: '1.0',
      performance: 'medium',
      parameters: {
        vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
        intensite: { type: 'range', min: 0, max: 1, default: 0.75 },
        couleurBase: { type: 'color', default: '#00ff41' },
        glitchFrequency: { type: 'range', min: 0.1, max: 3, default: 1.5 },
        correctionSpeed: { type: 'range', min: 0.5, max: 3, default: 1.2 }
      }
    });
    
    // Variables d'état
    this.temps = 0;
    this.texteComplet = '';
    this.caracteres = [];
    this.phase = 'matrix'; // matrix, debugging, correcting, stable
    this.tempsDernierePhase = 0;
    
    // Système de glitch
    this.glitchActif = false;
    this.intensiteGlitch = 0;
    this.prochainGlitch = 0;
    this.dureeGlitch = 0;
    
    // Effets visuels
    this.scanLines = [];
    this.parasites = [];
    this.decalagesRGB = { r: 0, g: 0, b: 0 };
    this.freezeTime = 0;
    this.isFrozen = false;
    
    // Caractères Matrix
    this.matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    // Correction progressive
    this.correctionQueue = [];
    this.prochaineCorrectionTime = 0;
    
    this.initializeScanLines();
    this.initializeParasites();
  }
  
  initializeScanLines() {
    this.scanLines = [];
    for (let i = 0; i < 8; i++) {
      this.scanLines.push({
        y: Math.random() * 600,
        vitesse: 0.5 + Math.random() * 2,
        intensite: 0.3 + Math.random() * 0.4,
        hauteur: 2 + Math.random() * 6,
        pulsation: Math.random() * Math.PI * 2,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
  }
  
  initializeParasites() {
    this.parasites = [];
    for (let i = 0; i < 50; i++) {
      this.parasites.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        taille: 1 + Math.random() * 3,
        vie: Math.random() * 1000,
        maxVie: 500 + Math.random() * 1500,
        alpha: 0.2 + Math.random() * 0.6,
        type: Math.floor(Math.random() * 3) // 0=point, 1=ligne, 2=rectangle
      });
    }
  }
  
  initialize(canvas, element) {
    this.texteComplet = element.content || 'SYSTEM ERROR';
    this.temps = 0;
    this.phase = 'matrix';
    this.tempsDernierePhase = 0;
    this.caracteres = [];
    this.correctionQueue = [];
    
    // Initialiser caractères avec versions Matrix
    for (let i = 0; i < this.texteComplet.length; i++) {
      const char = {
        original: this.texteComplet[i],
        actuel: this.getRandomMatrixChar(),
        progression: 0,
        corrige: false,
        derniereModif: 0,
        freqModif: 100 + Math.random() * 300,
        glitchHistory: [],
        freezeProb: 0.15 + Math.random() * 0.1,
        correctionPriority: Math.random()
      };
      
      this.caracteres.push(char);
    }
    
    // Créer queue de correction prioritaire
    this.genererQueueCorrection();
    this.planifierProchainGlitch();
  }
  
  getRandomMatrixChar() {
    return this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
  }
  
  genererQueueCorrection() {
    // Trier par priorité et distance au centre
    const indices = [...Array(this.caracteres.length).keys()];
    const centre = Math.floor(this.caracteres.length / 2);
    
    indices.sort((a, b) => {
      const priorityA = this.caracteres[a].correctionPriority + Math.abs(a - centre) * 0.1;
      const priorityB = this.caracteres[b].correctionPriority + Math.abs(b - centre) * 0.1;
      return priorityA - priorityB;
    });
    
    this.correctionQueue = indices;
    this.prochaineCorrectionTime = this.temps + 500;
  }
  
  planifierProchainGlitch() {
    const interval = (2000 / this.parameters.glitchFrequency.value) + Math.random() * 1000;
    this.prochainGlitch = this.temps + interval;
    this.dureeGlitch = 100 + Math.random() * 400;
  }
  
  updatePhase(deltaTime) {
    this.tempsDernierePhase += deltaTime;
    
    switch (this.phase) {
      case 'matrix':
        if (this.tempsDernierePhase > 2000) {
          this.phase = 'debugging';
          this.tempsDernierePhase = 0;
        }
        break;
        
      case 'debugging':
        if (this.tempsDernierePhase > 1000) {
          this.phase = 'correcting';
          this.tempsDernierePhase = 0;
        }
        break;
        
      case 'correcting':
        if (this.correctionQueue.length === 0) {
          this.phase = 'stable';
          this.tempsDernierePhase = 0;
        }
        break;
        
      case 'stable':
        if (this.tempsDernierePhase > 3000) {
          // Recommencer le cycle
          this.phase = 'matrix';
          this.tempsDernierePhase = 0;
          this.reinitialiserCaracteres();
        }
        break;
    }
  }
  
  reinitialiserCaracteres() {
    this.caracteres.forEach(char => {
      char.actuel = this.getRandomMatrixChar();
      char.corrige = false;
      char.progression = 0;
    });
    this.genererQueueCorrection();
  }
  
  updateGlitch(deltaTime) {
    // Gestion des glitches planifiés
    if (this.temps >= this.prochainGlitch && !this.glitchActif) {
      this.glitchActif = true;
      this.intensiteGlitch = 0.7 + Math.random() * 0.3;
      this.planifierProchainGlitch();
    }
    
    if (this.glitchActif) {
      this.dureeGlitch -= deltaTime;
      
      // Effet de freeze aléatoire
      if (Math.random() < 0.1 && !this.isFrozen) {
        this.isFrozen = true;
        this.freezeTime = 50 + Math.random() * 200;
      }
      
      if (this.dureeGlitch <= 0) {
        this.glitchActif = false;
        this.intensiteGlitch = 0;
        this.isFrozen = false;
      }
    }
    
    // Gestion du freeze
    if (this.isFrozen) {
      this.freezeTime -= deltaTime;
      if (this.freezeTime <= 0) {
        this.isFrozen = false;
      }
      return; // Pas d'autres updates pendant le freeze
    }
    
    // Décalages RGB pendant glitch
    if (this.glitchActif) {
      this.decalagesRGB.r = (Math.random() - 0.5) * 8 * this.intensiteGlitch;
      this.decalagesRGB.g = (Math.random() - 0.5) * 6 * this.intensiteGlitch;
      this.decalagesRGB.b = (Math.random() - 0.5) * 10 * this.intensiteGlitch;
    } else {
      // Retour progressif à la normale
      this.decalagesRGB.r *= 0.9;
      this.decalagesRGB.g *= 0.9;
      this.decalagesRGB.b *= 0.9;
    }
  }
  
  updateCaracteres(deltaTime) {
    if (this.isFrozen) return;
    
    this.caracteres.forEach((char, index) => {
      // Phase Matrix: changement aléatoire constant
      if (this.phase === 'matrix' && !char.corrige) {
        char.derniereModif += deltaTime;
        if (char.derniereModif >= char.freqModif) {
          char.actuel = this.getRandomMatrixChar();
          char.derniereModif = 0;
          char.freqModif = 50 + Math.random() * 200;
        }
      }
      
      // Phase debugging: ralentissement progressif
      if (this.phase === 'debugging' && !char.corrige) {
        char.derniereModif += deltaTime;
        const slowdown = 1 + (this.tempsDernierePhase / 1000) * 3;
        if (char.derniereModif >= char.freqModif * slowdown) {
          char.actuel = this.getRandomMatrixChar();
          char.derniereModif = 0;
        }
      }
      
      // Glitches pendant correction
      if (this.glitchActif && !char.corrige && Math.random() < 0.3) {
        char.actuel = this.getRandomMatrixChar();
      }
    });
    
    // Correction progressive
    if (this.phase === 'correcting' && this.temps >= this.prochaineCorrectionTime) {
      this.effectuerProchainCorrection();
    }
  }
  
  effectuerProchainCorrection() {
    if (this.correctionQueue.length === 0) return;
    
    const index = this.correctionQueue.shift();
    const char = this.caracteres[index];
    
    if (!char.corrige) {
      // Séquence de correction avec plusieurs tentatives
      this.lancerSequenceCorrection(char, index);
    }
    
    // Planifier prochaine correction
    const interval = 200 / this.parameters.correctionSpeed.value;
    this.prochaineCorrectionTime = this.temps + interval + Math.random() * 100;
  }
  
  lancerSequenceCorrection(char, index) {
    let etapes = 0;
    const maxEtapes = 3 + Math.floor(Math.random() * 4);
    
    const corriger = () => {
      etapes++;
      
      if (etapes < maxEtapes) {
        // Étapes intermédiaires avec caractères proches
        char.actuel = this.getRandomMatrixChar();
        setTimeout(corriger, 50 + Math.random() * 100);
      } else {
        // Correction finale
        char.actuel = char.original;
        char.corrige = true;
        char.progression = 1;
        
        // Effet visuel de validation
        this.creerEffetValidation(index);
      }
    };
    
    corriger();
  }
  
  creerEffetValidation(index) {
    // Ajouter particules de validation (parasites verts)
    for (let i = 0; i < 5; i++) {
      const parasite = this.parasites.find(p => p.vie >= p.maxVie);
      if (parasite) {
        parasite.x = 100 + index * 30 + (Math.random() - 0.5) * 40;
        parasite.y = 300 + (Math.random() - 0.5) * 60;
        parasite.vie = 0;
        parasite.maxVie = 300;
        parasite.alpha = 0.8;
        parasite.type = 0; // Point brillant
        parasite.taille = 2 + Math.random() * 3;
      }
    }
  }
  
  updateScanLines(deltaTime) {
    this.scanLines.forEach(line => {
      line.y += line.vitesse * line.direction;
      line.pulsation += deltaTime * 0.005;
      
      // Rebond sur les bords
      if (line.y <= 0 || line.y >= 600) {
        line.direction *= -1;
        line.y = Math.max(0, Math.min(600, line.y));
      }
      
      // Intensité pulsante
      line.intensite = 0.2 + Math.abs(Math.sin(line.pulsation)) * 0.4;
      
      // Modification aléatoire de vitesse
      if (Math.random() < 0.01) {
        line.vitesse = 0.5 + Math.random() * 2;
      }
    });
  }
  
  updateParasites(deltaTime) {
    this.parasites.forEach(parasite => {
      parasite.vie += deltaTime;
      
      if (parasite.vie < parasite.maxVie) {
        parasite.x += parasite.vx;
        parasite.y += parasite.vy;
        
        // Rebonds
        if (parasite.x <= 0 || parasite.x >= 800) parasite.vx *= -1;
        if (parasite.y <= 0 || parasite.y >= 600) parasite.vy *= -1;
        
        // Fade out
        const progression = parasite.vie / parasite.maxVie;
        parasite.alpha = (1 - progression) * 0.6;
      } else {
        // Réinitialiser
        parasite.x = Math.random() * 800;
        parasite.y = Math.random() * 600;
        parasite.vx = (Math.random() - 0.5) * 4;
        parasite.vy = (Math.random() - 0.5) * 4;
        parasite.vie = 0;
        parasite.maxVie = 500 + Math.random() * 1500;
      }
    });
  }
  
  update(deltaTime) {
    this.temps += deltaTime;
    this.updatePhase(deltaTime);
    this.updateGlitch(deltaTime);
    this.updateCaracteres(deltaTime);
    this.updateScanLines(deltaTime);
    this.updateParasites(deltaTime);
  }
  
  render(ctx, element, deltaTime) {
    const { x, y, width, height } = element;
    
    ctx.save();
    
    // Rendu des scan lines
    this.scanLines.forEach(line => {
      const gradient = ctx.createLinearGradient(0, line.y - line.hauteur, 0, line.y + line.hauteur);
      gradient.addColorStop(0, `rgba(0, 255, 65, 0)`);
      gradient.addColorStop(0.5, `rgba(0, 255, 65, ${line.intensite})`);
      gradient.addColorStop(1, `rgba(0, 255, 65, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, line.y - line.hauteur, 800, line.hauteur * 2);
    });
    
    // Rendu des parasites
    this.parasites.forEach(parasite => {
      if (parasite.alpha <= 0) return;
      
      ctx.globalAlpha = parasite.alpha;
      ctx.fillStyle = 'rgba(0, 255, 65, 1)';
      
      switch (parasite.type) {
        case 0: // Point
          ctx.fillRect(parasite.x, parasite.y, parasite.taille, parasite.taille);
          break;
        case 1: // Ligne horizontale
          ctx.fillRect(parasite.x, parasite.y, parasite.taille * 4, 1);
          break;
        case 2: // Rectangle
          ctx.fillRect(parasite.x, parasite.y, parasite.taille, parasite.taille * 2);
          break;
      }
    });
    
    // Rendu du texte avec décalages RGB
    const fontSize = Math.floor(height * 0.6);
    ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const espacement = fontSize * 0.8;
    const debutX = centerX - (this.caracteres.length * espacement) / 2;
    
    // Canal Rouge
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.globalAlpha = this.glitchActif ? 0.7 : 0.3;
    this.caracteres.forEach((char, index) => {
      const charX = debutX + index * espacement + this.decalagesRGB.r;
      ctx.fillText(char.actuel, charX, centerY);
    });
    
    // Canal Vert (principal)
    ctx.fillStyle = this.parameters.couleurBase.value;
    ctx.globalAlpha = 1;
    this.caracteres.forEach((char, index) => {
      const charX = debutX + index * espacement + this.decalagesRGB.g;
      
      // Effet de validation pour caractères corrigés
      if (char.corrige) {
        ctx.shadowColor = this.parameters.couleurBase.value;
        ctx.shadowBlur = 5;
      }
      
      ctx.fillText(char.actuel, charX, centerY);
      ctx.shadowBlur = 0;
    });
    
    // Canal Bleu
    ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
    ctx.globalAlpha = this.glitchActif ? 0.8 : 0.2;
    this.caracteres.forEach((char, index) => {
      const charX = debutX + index * espacement + this.decalagesRGB.b;
      ctx.fillText(char.actuel, charX, centerY);
    });
    
    // Overlay de glitch global
    if (this.glitchActif) {
      ctx.globalAlpha = this.intensiteGlitch * 0.1;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 800, 600);
      
      // Lignes de glitch horizontales
      for (let i = 0; i < 5; i++) {
        const glitchY = Math.random() * 600;
        const glitchHeight = 2 + Math.random() * 8;
        ctx.globalAlpha = this.intensiteGlitch * 0.3;
        ctx.fillRect(0, glitchY, 800, glitchHeight);
      }
    }
    
    // Indicateur de phase
    ctx.globalAlpha = 0.3;
    ctx.font = '12px monospace';
    ctx.fillStyle = this.parameters.couleurBase.value;
    ctx.textAlign = 'left';
    
    let statusText = '';
    switch (this.phase) {
      case 'matrix': statusText = '> INITIALIZING MATRIX...'; break;
      case 'debugging': statusText = '> DEBUGGING ERRORS...'; break;
      case 'correcting': statusText = `> CORRECTING [${this.correctionQueue.length} PENDING]`; break;
      case 'stable': statusText = '> SYSTEM STABLE'; break;
    }
    
    ctx.fillText(statusText, 10, 580);
    
    // Freeze overlay
    if (this.isFrozen) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.globalAlpha = 0.8;
      ctx.font = '14px monospace';
      ctx.fillStyle = 'red';
      ctx.fillText('SYSTEM FREEZE', 10, 560);
    }
    
    ctx.restore();
  }
  
  destroy() {
    this.caracteres = [];
    this.correctionQueue = [];
    this.scanLines = [];
    this.parasites = [];
  }
}