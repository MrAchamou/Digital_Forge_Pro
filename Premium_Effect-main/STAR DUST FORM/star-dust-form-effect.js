class StarDustFormEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'cosmic-dust-aggregation-010',
            name: 'Agrégation Poussière Cosmique',
            category: 'text',
            version: '1.0',
            performance: 'high',
            parameters: {
                vitesse: { type: 'range', min: 0.3, max: 2.5, default: 1 },
                intensite: { type: 'range', min: 0.4, max: 1, default: 0.8 },
                couleurBase: { type: 'color', default: '#ffffff' },
                couleurCosmic: { type: 'color', default: '#ff6b9d' },
                couleurAurora: { type: 'color', default: '#4ecdc4' },
                densite: { type: 'range', min: 0.5, max: 2, default: 1.2 },
                forceGravite: { type: 'range', min: 0.1, max: 1, default: 0.6 },
                scintillementRate: { type: 'range', min: 0.5, max: 3, default: 1.5 }
            }
        });

        // Variables temporelles
        this.temps = 0;
        this.formationPhase = 0;
        this.gravityPhase = 0;
        this.scintillementTimer = 0;
        
        // Système de particules principal
        this.particules = [];
        this.particulePool = [];
        this.maxParticules = 2000;
        
        // Micro-explosions stellaires
        this.explosions = [];
        this.explosionPool = [];
        
        // Points cibles pour formation du texte
        this.targetPoints = [];
        this.letterBounds = [];
        
        // Champs gravitationnels
        this.gravityWells = [];
        this.gravityIntensity = 0;
        
        // Effets visuels cosmiques
        this.nebulaEffect = {
            particles: [],
            colors: [],
            intensity: 0
        };
        
        // Aurora borealis
        this.auroraStrips = [];
        this.auroraPhase = 0;
        
        // Cache des gradients cosmiques
        this.gradientCache = new Map();
        
        // États de formation
        this.formationStates = {
            DISPERSED: 0,
            ATTRACTION: 1,
            AGGREGATION: 2,
            STABILIZED: 3,
            EXPLOSION: 4
        };
        this.currentState = this.formationStates.DISPERSED;
        this.stateTimer = 0;
        
        // Couleurs cosmiques évolutives
        this.cosmicPalette = [];
        this.palettePhase = 0;
        
        // Lentille gravitationnelle
        this.lensEffect = {
            active: false,
            centerX: 0,
            centerY: 0,
            intensity: 0,
            radius: 0
        };
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Calcul des points cibles du texte
        this.calculateTextTargets();
        
        // Initialisation des pools de particules
        this.initializeParticlePools();
        
        // Génération de la palette cosmique
        this.generateCosmicPalette();
        
        // Création des particules initiales
        this.createInitialParticles();
        
        // Configuration des champs gravitationnels
        this.setupGravityWells();
        
        // Initialisation des effets aurora
        this.initializeAurora();
        
        // Reset des timers
        this.temps = 0;
        this.formationPhase = 0;
        this.currentState = this.formationStates.DISPERSED;
    }

    calculateTextTargets() {
        this.targetPoints = [];
        this.letterBounds = [];
        
        const text = this.element.content || 'COSMIC';
        const fontSize = Math.min(this.element.width / text.length * 1.2, this.element.height * 0.8);
        
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        
        // Échantillonnage dense des lettres
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = this.ctx.measureText(char).width;
            const startX = centerX - (this.ctx.measureText(text).width / 2) + 
                          this.ctx.measureText(text.substring(0, i)).width + charWidth / 2;
            
            const letterPoints = this.sampleLetterPoints(char, startX, centerY, fontSize);
            this.targetPoints.push(...letterPoints);
            
            // Bounds pour effets gravitationnels
            this.letterBounds.push({
                x: startX - charWidth / 2,
                y: centerY - fontSize / 2,
                width: charWidth,
                height: fontSize,
                centerX: startX,
                centerY: centerY
            });
        }
    }

    sampleLetterPoints(char, x, y, size) {
        const points = [];
        const density = Math.floor(this.config.parameters.densite.default * 80 + 40);
        
        // Canvas temporaire pour échantillonnage
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size * 2;
        tempCanvas.height = size * 2;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.font = `bold ${size}px Arial`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillText(char, size, size);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Échantillonnage avec pondération de densité
        for (let i = 0; i < density; i++) {
            let attempts = 0;
            while (attempts < 150) {
                const px = Math.floor(Math.random() * tempCanvas.width);
                const py = Math.floor(Math.random() * tempCanvas.height);
                const index = (py * tempCanvas.width + px) * 4;
                
                if (imageData.data[index + 3] > 100) {
                    points.push({
                        x: x + (px - size),
                        y: y + (py - size),
                        density: imageData.data[index + 3] / 255,
                        priority: Math.random(),
                        assigned: false
                    });
                    break;
                }
                attempts++;
            }
        }
        
        return points;
    }

    initializeParticlePools() {
        // Pool principal de particules
        this.particulePool = [];
        for (let i = 0; i < this.maxParticules; i++) {
            this.particulePool.push(this.createParticle());
        }
        
        // Pool d'explosions
        this.explosionPool = [];
        for (let i = 0; i < 50; i++) {
            this.explosionPool.push(this.createExplosion());
        }
    }

    createParticle() {
        return {
            active: false,
            x: 0, y: 0,
            vx: 0, vy: 0,
            targetX: 0, targetY: 0,
            
            // Propriétés visuelles
            size: 1,
            brightness: 1,
            color: '#ffffff',
            scintillation: 0,
            scintillationPhase: 0,
            
            // Propriétés physiques
            mass: 1,
            attracted: false,
            attractionForce: 0,
            
            // États de vie
            life: 0,
            maxLife: 0,
            formationProgress: 0,
            
            // Effet cosmique
            cosmicTrail: [],
            trailLength: 0,
            
            // Propriétés stellaires
            stellar: false,
            explosionPotential: 0,
            
            // Type de particule
            type: 'dust' // dust, star, nebula, aurora
        };
    }

    createExplosion() {
        return {
            active: false,
            x: 0, y: 0,
            particles: [],
            intensity: 0,
            life: 0,
            maxLife: 0,
            color: '#ffffff',
            type: 'stellar' // stellar, formation, aurora
        };
    }

    generateCosmicPalette() {
        this.cosmicPalette = [
            '#ffffff', // Blanc stellaire
            '#ff6b9d', // Rose cosmique
            '#4ecdc4', // Cyan aurora
            '#95e1d3', // Vert néon
            '#ffeaa7', // Jaune stellaire
            '#fd79a8', // Magenta cosmic
            '#74b9ff', // Bleu galactique
            '#a29bfe'  // Violet nébuleuse
        ];
    }

    createInitialParticles() {
        this.particules = [];
        const baseCount = Math.floor(this.maxParticules * 0.7);
        
        for (let i = 0; i < baseCount; i++) {
            const particle = this.getParticleFromPool();
            
            // Position aléatoire dans un rayon élargi
            const angle = Math.random() * Math.PI * 2;
            const distance = 200 + Math.random() * 400;
            const centerX = this.element.x + this.element.width / 2;
            const centerY = this.element.y + this.element.height / 2;
            
            particle.x = centerX + Math.cos(angle) * distance;
            particle.y = centerY + Math.sin(angle) * distance;
            
            // Vélocité orbitale initiale
            particle.vx = (-Math.sin(angle) * 0.5 + (Math.random() - 0.5) * 2) * 0.3;
            particle.vy = (Math.cos(angle) * 0.5 + (Math.random() - 0.5) * 2) * 0.3;
            
            // Propriétés cosmiques
            particle.size = 0.5 + Math.random() * 2;
            particle.brightness = 0.3 + Math.random() * 0.7;
            particle.scintillationPhase = Math.random() * Math.PI * 2;
            particle.mass = 0.1 + Math.random() * 0.9;
            
            // Couleur cosmique aléatoire
            particle.color = this.cosmicPalette[Math.floor(Math.random() * this.cosmicPalette.length)];
            
            // Types spéciaux
            if (Math.random() < 0.1) {
                particle.type = 'star';
                particle.stellar = true;
                particle.size *= 1.5;
                particle.explosionPotential = Math.random();
            } else if (Math.random() < 0.05) {
                particle.type = 'nebula';
                particle.size *= 2;
                particle.brightness *= 0.6;
            }
            
            // Assignation de cible aléatoire
            if (this.targetPoints.length > 0) {
                const targetIndex = Math.floor(Math.random() * this.targetPoints.length);
                const target = this.targetPoints[targetIndex];
                particle.targetX = target.x;
                particle.targetY = target.y;
            }
            
            particle.life = 0;
            particle.maxLife = 5000 + Math.random() * 10000;
        }
    }

    setupGravityWells() {
        this.gravityWells = [];
        
        // Puits gravitationnels basés sur les lettres
        for (let bound of this.letterBounds) {
            this.gravityWells.push({
                x: bound.centerX,
                y: bound.centerY,
                strength: 0.8 + Math.random() * 0.4,
                radius: Math.max(bound.width, bound.height) * 1.5,
                active: false,
                pulsation: Math.random() * Math.PI * 2
            });
        }
        
        // Puits central pour agrégation initiale
        this.gravityWells.push({
            x: this.element.x + this.element.width / 2,
            y: this.element.y + this.element.height / 2,
            strength: 1.2,
            radius: Math.max(this.element.width, this.element.height) * 0.8,
            active: true,
            pulsation: 0,
            type: 'central'
        });
    }

    initializeAurora() {
        this.auroraStrips = [];
        const stripCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < stripCount; i++) {
            this.auroraStrips.push({
                points: this.generateAuroraPath(),
                color: this.cosmicPalette[Math.floor(Math.random() * this.cosmicPalette.length)],
                intensity: 0.3 + Math.random() * 0.4,
                speed: 0.5 + Math.random() * 1,
                phase: Math.random() * Math.PI * 2,
                width: 20 + Math.random() * 40
            });
        }
    }

    generateAuroraPath() {
        const points = [];
        const segmentCount = 8 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < segmentCount; i++) {
            const t = i / (segmentCount - 1);
            const baseX = this.element.x + t * this.element.width;
            const baseY = this.element.y + this.element.height * 0.5;
            
            points.push({
                x: baseX,
                y: baseY + (Math.random() - 0.5) * this.element.height * 0.8,
                offset: 0
            });
        }
        
        return points;
    }

    getParticleFromPool() {
        for (let particle of this.particulePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return this.createParticle();
    }

    getExplosionFromPool() {
        for (let explosion of this.explosionPool) {
            if (!explosion.active) {
                explosion.active = true;
                return explosion;
            }
        }
        return this.createExplosion();
    }

    update(deltaTime) {
        this.temps += deltaTime * this.config.parameters.vitesse.default * 0.001;
        this.formationPhase += deltaTime * 0.0003;
        this.gravityPhase += deltaTime * 0.0008;
        this.scintillementTimer += deltaTime * this.config.parameters.scintillementRate.default * 0.01;
        this.auroraPhase += deltaTime * 0.001;
        this.palettePhase += deltaTime * 0.0005;
        this.stateTimer += deltaTime;
        
        // Gestion des états de formation
        this.updateFormationState(deltaTime);
        
        // Mise à jour des particules
        this.updateParticles(deltaTime);
        
        // Mise à jour des champs gravitationnels
        this.updateGravityFields(deltaTime);
        
        // Mise à jour des effets cosmiques
        this.updateCosmicEffects(deltaTime);
        
        // Gestion des explosions stellaires
        this.updateExplosions(deltaTime);
        
        // Mise à jour de l'aurora
        this.updateAurora(deltaTime);
        
        // Effet de lentille gravitationnelle
        this.updateGravitationalLens(deltaTime);
    }

    updateFormationState(deltaTime) {
        const cycleTime = 12000; // 12 secondes par cycle
        const phaseProgress = (this.stateTimer % cycleTime) / cycleTime;
        
        let newState = this.currentState;
        
        if (phaseProgress < 0.2) {
            newState = this.formationStates.DISPERSED;
            this.gravityIntensity = phaseProgress / 0.2 * 0.3;
        } else if (phaseProgress < 0.4) {
            newState = this.formationStates.ATTRACTION;
            this.gravityIntensity = 0.3 + ((phaseProgress - 0.2) / 0.2) * 0.4;
        } else if (phaseProgress < 0.7) {
            newState = this.formationStates.AGGREGATION;
            this.gravityIntensity = 0.7 + ((phaseProgress - 0.4) / 0.3) * 0.3;
        } else if (phaseProgress < 0.9) {
            newState = this.formationStates.STABILIZED;
            this.gravityIntensity = 1.0;
        } else {
            newState = this.formationStates.EXPLOSION;
            this.gravityIntensity = 1.0 - ((phaseProgress - 0.9) / 0.1) * 0.7;
        }
        
        // Changement d'état
        if (newState !== this.currentState) {
            this.onStateChange(this.currentState, newState);
            this.currentState = newState;
        }
        
        // Activation des puits gravitationnels selon l'état
        for (let i = 0; i < this.gravityWells.length; i++) {
            const well = this.gravityWells[i];
            if (well.type === 'central') {
                well.active = this.currentState <= this.formationStates.ATTRACTION;
            } else {
                well.active = this.currentState >= this.formationStates.AGGREGATION;
            }
        }
    }

    onStateChange(oldState, newState) {
        // Effets spéciaux lors des changements d'état
        if (newState === this.formationStates.EXPLOSION) {
            this.triggerMassExplosion();
        } else if (newState === this.formationStates.AGGREGATION) {
            this.activateGravitationalLens();
        }
    }

    updateParticles(deltaTime) {
        for (let particle of this.particules) {
            if (!particle.active) continue;
            
            particle.life += deltaTime;
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                continue;
            }
            
            // Mise à jour de la scintillation
            particle.scintillationPhase += deltaTime * 0.01;
            particle.scintillation = 0.5 + 0.5 * Math.sin(particle.scintillationPhase + 
                                                          Math.sin(this.scintillementTimer + particle.x * 0.01) * 0.5);
            
            // Forces gravitationnelles
            this.applyGravitationalForces(particle, deltaTime);
            
            // Mise à jour de la position
            particle.x += particle.vx * deltaTime * 0.1;
            particle.y += particle.vy * deltaTime * 0.1;
            
            // Friction cosmique
            particle.vx *= 0.995;
            particle.vy *= 0.995;
            
            // Mise à jour du trail cosmique
            this.updateCosmicTrail(particle);
            
            // Vérification des explosions stellaires
            if (particle.stellar && this.shouldExplode(particle)) {
                this.triggerStellarExplosion(particle);
            }
        }
        
        // Génération continue de nouvelles particules si nécessaire
        if (this.currentState === this.formationStates.DISPERSED && Math.random() < 0.1) {
            this.createNewCosmicParticle();
        }
    }

    applyGravitationalForces(particle, deltaTime) {
        let totalForceX = 0;
        let totalForceY = 0;
        
        for (let well of this.gravityWells) {
            if (!well.active) continue;
            
            const dx = well.x - particle.x;
            const dy = well.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < well.radius && distance > 1) {
                const force = (well.strength * particle.mass * this.gravityIntensity * 
                              this.config.parameters.forceGravite.default) / (distance * distance);
                
                totalForceX += (dx / distance) * force;
                totalForceY += (dy / distance) * force;
                
                particle.attracted = true;
                particle.attractionForce = Math.max(particle.attractionForce, force);
            }
        }
        
        // Application des forces
        particle.vx += totalForceX * deltaTime * 0.01;
        particle.vy += totalForceY * deltaTime * 0.01;
        
        // Décroissance de l'attraction
        particle.attractionForce *= 0.98;
    }

    updateCosmicTrail(particle) {
        // Ajout de la position actuelle au trail
        particle.cosmicTrail.unshift({ x: particle.x, y: particle.y, alpha: 1 });
        
        // Limitation de la longueur du trail
        const maxTrailLength = Math.floor(particle.size * 5 + 5);
        if (particle.cosmicTrail.length > maxTrailLength) {
            particle.cosmicTrail.pop();
        }
        
        // Mise à jour de l'alpha du trail
        for (let i = 0; i < particle.cosmicTrail.length; i++) {
            particle.cosmicTrail[i].alpha = 1 - (i / particle.cosmicTrail.length);
        }
    }

    shouldExplode(particle) {
        return particle.attractionForce > 0.8 && 
               Math.random() < particle.explosionPotential * 0.001 &&
               this.currentState >= this.formationStates.AGGREGATION;
    }

    triggerStellarExplosion(particle) {
        const explosion = this.getExplosionFromPool();
        
        explosion.x = particle.x;
        explosion.y = particle.y;
        explosion.intensity = 1;
        explosion.life = 0;
        explosion.maxLife = 800 + Math.random() * 400;
        explosion.color = particle.color;
        explosion.type = 'stellar';
        
        // Génération de particules d'explosion
        explosion.particles = [];
        const particleCount = 8 + Math.floor(Math.random() * 12);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;
            
            explosion.particles.push({
                x: 0, y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                life: 0,
                maxLife: 300 + Math.random() * 200
            });
        }
        
        // Désactivation de la particule originale
        particle.active = false;
    }

    triggerMassExplosion() {
        // Explosion massive lors du changement d'état
        for (let particle of this.particules) {
            if (particle.active && particle.stellar && Math.random() < 0.3) {
                this.triggerStellarExplosion(particle);
            }
        }
    }

    activateGravitationalLens() {
        this.lensEffect.active = true;
        this.lensEffect.centerX = this.element.x + this.element.width / 2;
        this.lensEffect.centerY = this.element.y + this.element.height / 2;
        this.lensEffect.intensity = 0.5;
        this.lensEffect.radius = Math.max(this.element.width, this.element.height) * 0.6;
    }

    updateGravityFields(deltaTime) {
        for (let well of this.gravityWells) {
            well.pulsation += deltaTime * 0.003;
            
            // Pulsation de la force gravitationnelle
            const pulseFactor = 1 + 0.2 * Math.sin(well.pulsation);
            well.currentStrength = well.strength * pulseFactor * this.gravityIntensity;
        }
    }

    updateCosmicEffects(deltaTime) {
        // Mise à jour de l'effet nébuleuse
        this.updateNebulaEffect(deltaTime);
        
        // Évolution de la palette cosmique
        this.evolveCosmicPalette(deltaTime);
    }

    updateNebulaEffect(deltaTime) {
        // Génération de particules nébuleuses
        if (Math.random() < 0.05 && this.nebulaEffect.particles.length < 50) {
            this.nebulaEffect.particles.push({
                x: this.element.x + Math.random() * this.element.width,
                y: this.element.y + Math.random() * this.element.height,
                size: 10 + Math.random() * 30,
                alpha: 0.1 + Math.random() * 0.3,
                color: this.cosmicPalette[Math.floor(Math.random() * this.cosmicPalette.length)],
                drift: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 },
                life: 0,
                maxLife: 3000 + Math.random() * 2000
            });
        }
        
        // Mise à jour des particules nébuleuses
        for (let i = this.nebulaEffect.particles.length - 1; i >= 0; i--) {
            const nebula = this.nebulaEffect.particles[i];
            nebula.life += deltaTime;
            
            if (nebula.life >= nebula.maxLife) {
                this.nebulaEffect.particles.splice(i, 1);
                continue;
            }
            
            nebula.x += nebula.drift.x * deltaTime * 0.1;
            nebula.y += nebula.drift.y * deltaTime * 0.1;
            
            // Fade in/out
            const lifeRatio = nebula.life / nebula.maxLife;
            nebula.currentAlpha = nebula.alpha * Math.sin(lifeRatio * Math.PI);
        }
    }

    evolveCosmicPalette(deltaTime) {
        // Évolution des couleurs selon la phase cosmique
        const evolutionFactor = Math.sin(this.palettePhase) * 0.5 + 0.5;
        
        // Mise à jour graduelle des couleurs des particules
        for (let particle of this.particules) {
            if (particle.active && Math.random() < 0.001) {
                const newColorIndex = Math.floor(Math.random() * this.cosmicPalette.length);
                particle.color = this.cosmicPalette[newColorIndex];
            }
        }
    }

    updateExplosions(deltaTime) {
        for (let explosion of this.explosions) {
            if (!explosion.active) continue;
            
            explosion.life += deltaTime;
            
            if (explosion.life >= explosion.maxLife) {
                explosion.active = false;
                continue;
            }
            
            // Mise à jour de l'intensité
            const lifeRatio = explosion.life / explosion.maxLife;
            explosion.intensity = Math.sin(lifeRatio * Math.PI) * 2;
            
            // Mise à jour des particules d'explosion
            for (let particle of explosion.particles) {
                particle.life += deltaTime;
                
                if (particle.life < particle.maxLife) {
                    particle.x += particle.vx * deltaTime * 0.1;
                    particle.y += particle.vy * deltaTime * 0.1;
                    
                    // Décélération
                    particle.vx *= 0.98;
                    particle.vy *= 0.98;
                }
            }
        }
    }

    updateAurora(deltaTime) {
        for (let strip of this.auroraStrips) {
            strip.phase += deltaTime * 0.001 * strip.speed;
            
            // Ondulation des points aurora
            for (let i = 0; i < strip.points.length; i++) {
                const point = strip.points[i];
                point.offset = Math.sin(strip.phase + i * 0.5) * 20;
            }
        }
    }

    updateGravitationalLens(deltaTime) {
        if (this.lensEffect.active) {
            // Pulsation de l'effet de lentille
            this.lensEffect.intensity = 0.3 + 0.4 * Math.sin(this.temps * 2);
            
            // Désactivation après un certain temps
            if (this.currentState === this.formationStates.DISPERSED) {
                this.lensEffect.active = false;
            }
        }
    }

    createNewCosmicParticle() {
        const particle = this.getParticleFromPool();
        
        // Position en bordure de l'écran
        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: // Haut
                particle.x = this.element.x + Math.random() * this.element.width;
                particle.y = this.element.y - 50;
                break;
            case 1: // Droite
                particle.x = this.element.x + this.element.width + 50;
                particle.y = this.element.y + Math.random() * this.element.height;
                break;
            case 2: // Bas
                particle.x = this.element.x + Math.random() * this.element.width;
                particle.y = this.element.y + this.element.height + 50;
                break;
            case 3: // Gauche
                particle.x = this.element.x - 50;
                particle.y = this.element.y + Math.random() * this.element.height;
                break;
        }
        
        // Vélocité vers le centre
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        particle.vx = (dx / distance) * (0.5 + Math.random() * 1);
        particle.vy = (dy / distance) * (0.5 + Math.random() * 1);
        
        // Propriétés cosmiques
        particle.size = 0.5 + Math.random() * 1.5;
        particle.brightness = 0.4 + Math.random() * 0.6;
        particle.color = this.cosmicPalette[Math.floor(Math.random() * this.cosmicPalette.length)];
        particle.scintillationPhase = Math.random() * Math.PI * 2;
        particle.mass = 0.2 + Math.random() * 0.8;
        particle.type = 'dust';
        
        particle.life = 0;
        particle.maxLife = 8000 + Math.random() * 5000;
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Fond cosmique avec nébuleuses
        this.renderCosmicBackground(ctx);
        
        // Aurora borealis
        this.renderAurora(ctx);
        
        // Effet de lentille gravitationnelle
        if (this.lensEffect.active) {
            this.renderGravitationalLens(ctx);
        }
        
        // Particules avec trails cosmiques
        this.renderParticles(ctx);
        
        // Explosions stellaires
        this.renderExplosions(ctx);
        
        // Champs gravitationnels visibles
        this.renderGravityFields(ctx);
        
        // Post-processing cosmique
        this.renderCosmicPostProcessing(ctx);
        
        ctx.restore();
    }

    renderCosmicBackground(ctx) {
        // Gradient de fond cosmique
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        const radius = Math.max(this.element.width, this.element.height) * 0.8;
        
        const backgroundIntensity = 0.1 + 0.05 * Math.sin(this.temps * 0.5);
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(30, 30, 60, ${backgroundIntensity})`);
        gradient.addColorStop(0.5, `rgba(15, 15, 40, ${backgroundIntensity * 0.7})`);
        gradient.addColorStop(1, `rgba(5, 5, 20, ${backgroundIntensity * 0.3})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.element.x - 100, this.element.y - 100, 
                    this.element.width + 200, this.element.height + 200);
        
        // Particules nébuleuses
        for (let nebula of this.nebulaEffect.particles) {
            const alpha = nebula.currentAlpha * this.config.parameters.intensite.default;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = nebula.color;
            ctx.shadowColor = nebula.color;
            ctx.shadowBlur = nebula.size;
            
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, nebula.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }

    renderAurora(ctx) {
        for (let strip of this.auroraStrips) {
            const alpha = strip.intensity * this.config.parameters.intensite.default * 0.6;
            
            // Gradient pour l'effet aurora
            const startX = strip.points[0].x;
            const startY = strip.points[0].y + strip.points[0].offset;
            const endX = strip.points[strip.points.length - 1].x;
            const endY = strip.points[strip.points.length - 1].y + strip.points[strip.points.length - 1].offset;
            
            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
            gradient.addColorStop(0, `rgba(${this.hexToRgb(strip.color)}, 0)`);
            gradient.addColorStop(0.5, `rgba(${this.hexToRgb(strip.color)}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${this.hexToRgb(strip.color)}, 0)`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = strip.width;
            ctx.lineCap = 'round';
            ctx.shadowColor = strip.color;
            ctx.shadowBlur = strip.width * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(strip.points[0].x, strip.points[0].y + strip.points[0].offset);
            
            for (let i = 1; i < strip.points.length; i++) {
                const point = strip.points[i];
                ctx.lineTo(point.x, point.y + point.offset);
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    renderGravitationalLens(ctx) {
        const centerX = this.lensEffect.centerX;
        const centerY = this.lensEffect.centerY;
        const radius = this.lensEffect.radius;
        const intensity = this.lensEffect.intensity;
        
        // Effet de distorsion visuelle
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.1})`);
        gradient.addColorStop(0.3, `rgba(100, 200, 255, ${intensity * 0.05})`);
        gradient.addColorStop(0.7, `rgba(255, 100, 200, ${intensity * 0.03})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Anneaux de lentille
        for (let i = 1; i <= 3; i++) {
            const ringRadius = radius * (i / 4);
            const ringAlpha = intensity * 0.2 * (1 - i / 4);
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    renderParticles(ctx) {
        // Tri des particules par profondeur pour rendu correct
        const sortedParticles = this.particules.filter(p => p.active)
            .sort((a, b) => a.size - b.size);
        
        for (let particle of sortedParticles) {
            // Rendu du trail cosmique
            this.renderCosmicTrail(ctx, particle);
            
            // Calcul de l'intensité de scintillation
            const scintillation = particle.scintillation * particle.brightness * 
                                 this.config.parameters.intensite.default;
            
            // Taille dynamique basée sur l'attraction
            const dynamicSize = particle.size * (1 + particle.attractionForce * 0.5);
            
            // Couleur avec scintillation
            const alpha = scintillation * 0.8 + 0.2;
            ctx.globalAlpha = alpha;
            
            // Effet de lueur
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = dynamicSize * 4 * scintillation;
            
            // Particule principale
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, dynamicSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Core brillant pour les étoiles
            if (particle.type === 'star') {
                ctx.shadowBlur = dynamicSize * 2;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, dynamicSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Rayons stellaires pour les particules très brillantes
            if (scintillation > 0.8) {
                this.renderStellarRays(ctx, particle, dynamicSize, scintillation);
            }
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }

    renderCosmicTrail(ctx, particle) {
        if (particle.cosmicTrail.length < 2) return;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 0; i < particle.cosmicTrail.length - 1; i++) {
            const current = particle.cosmicTrail[i];
            const next = particle.cosmicTrail[i + 1];
            
            const alpha = current.alpha * 0.3 * particle.brightness;
            const width = (particle.size * current.alpha * 0.5);
            
            if (alpha > 0.01 && width > 0.1) {
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = particle.color;
                ctx.lineWidth = width;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = width * 2;
                
                ctx.beginPath();
                ctx.moveTo(current.x, current.y);
                ctx.lineTo(next.x, next.y);
                ctx.stroke();
            }
        }
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    renderStellarRays(ctx, particle, size, intensity) {
        const rayCount = 4 + Math.floor(intensity * 4);
        const rayLength = size * (3 + intensity * 5);
        
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = intensity * 0.4;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 2;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2 + this.temps * 2;
            const startX = particle.x + Math.cos(angle) * size;
            const startY = particle.y + Math.sin(angle) * size;
            const endX = particle.x + Math.cos(angle) * rayLength;
            const endY = particle.y + Math.sin(angle) * rayLength;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
    }

    renderExplosions(ctx) {
        for (let explosion of this.explosions) {
            if (!explosion.active || explosion.intensity <= 0) continue;
            
            // Flash central de l'explosion
            const alpha = explosion.intensity * 0.8;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = explosion.color;
            ctx.shadowColor = explosion.color;
            ctx.shadowBlur = 30 * explosion.intensity;
            
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, 8 * explosion.intensity, 0, Math.PI * 2);
            ctx.fill();
            
            // Particules d'explosion
            for (let particle of explosion.particles) {
                if (particle.life >= particle.maxLife) continue;
                
                const lifeRatio = particle.life / particle.maxLife;
                const particleAlpha = (1 - lifeRatio) * alpha * 0.6;
                
                if (particleAlpha > 0.01) {
                    ctx.globalAlpha = particleAlpha;
                    ctx.fillStyle = explosion.color;
                    ctx.shadowBlur = particle.size * 3;
                    
                    const px = explosion.x + particle.x;
                    const py = explosion.y + particle.y;
                    
                    ctx.beginPath();
                    ctx.arc(px, py, particle.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }

    renderGravityFields(ctx) {
        if (this.currentState < this.formationStates.AGGREGATION) return;
        
        for (let well of this.gravityWells) {
            if (!well.active || well.type === 'central') continue;
            
            const fieldIntensity = well.currentStrength * 0.1;
            const pulsation = 0.5 + 0.5 * Math.sin(well.pulsation);
            
            // Visualisation du champ gravitationnel
            const gradient = ctx.createRadialGradient(
                well.x, well.y, 0,
                well.x, well.y, well.radius
            );
            gradient.addColorStop(0, `rgba(100, 150, 255, ${fieldIntensity * pulsation})`);
            gradient.addColorStop(0.5, `rgba(150, 100, 255, ${fieldIntensity * pulsation * 0.5})`);
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Point central du puits
            ctx.fillStyle = `rgba(255, 255, 255, ${fieldIntensity * 2})`;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 5 * pulsation;
            
            ctx.beginPath();
            ctx.arc(well.x, well.y, 2 * pulsation, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
    }

    renderCosmicPostProcessing(ctx) {
        // Effet de brillance cosmique globale
        const globalGlow = 0.02 + 0.03 * Math.sin(this.temps * 1.5);
        
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        const maxRadius = Math.max(this.element.width, this.element.height) * 0.7;
        
        const postGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        postGradient.addColorStop(0, `rgba(255, 255, 255, ${globalGlow})`);
        postGradient.addColorStop(0.6, `rgba(100, 200, 255, ${globalGlow * 0.5})`);
        postGradient.addColorStop(1, 'rgba(255, 100, 200, 0)');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = postGradient;
        ctx.fillRect(this.element.x, this.element.y, this.element.width, this.element.height);
        ctx.globalCompositeOperation = 'source-over';
        
        // Particules de poussière cosmique ambiante
        for (let i = 0; i < 20; i++) {
            const x = this.element.x + Math.random() * this.element.width;
            const y = this.element.y + Math.random() * this.element.height;
            const size = 0.5 + Math.random();
            const alpha = 0.1 + Math.random() * 0.2;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '255, 255, 255';
    }

    destroy() {
        // Nettoyage des particules
        this.particules.length = 0;
        this.explosions.length = 0;
        this.targetPoints.length = 0;
        this.letterBounds.length = 0;
        this.gravityWells.length = 0;
        this.auroraStrips.length = 0;
        this.cosmicPalette.length = 0;
        this.nebulaEffect.particles.length = 0;
        
        // Nettoyage des pools
        this.particulePool.forEach(p => p.active = false);
        this.explosionPool.forEach(e => e.active = false);
        
        // Nettoyage du cache
        this.gradientCache.clear();
        
        // Reset des variables
        this.temps = 0;
        this.formationPhase = 0;
        this.gravityPhase = 0;
        this.scintillementTimer = 0;
        this.auroraPhase = 0;
        this.palettePhase = 0;
        this.stateTimer = 0;
        this.currentState = this.formationStates.DISPERSED;
        this.gravityIntensity = 0;
        this.lensEffect.active = false;
    }
}