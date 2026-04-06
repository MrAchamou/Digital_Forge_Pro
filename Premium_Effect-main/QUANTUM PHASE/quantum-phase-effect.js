class QuantumPhaseEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'multidimensional-phase-007',
            name: 'Matérialisation Quantique',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                couleurBase: { type: 'color', default: '#00ffff' },
                dimensions: { type: 'range', min: 3, max: 8, default: 5 },
                distorsion: { type: 'range', min: 0.1, max: 2, default: 1 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.particules = [];
        this.dimensionVersions = [];
        this.waveField = [];
        this.maxParticules = 200;
        this.convergencePhase = 0;
        
        // Pool d'objets pour performance
        this.particulesPool = [];
        
        // États quantiques
        this.quantumStates = [];
        this.phaseCoherence = 0;
        this.spacetimeRipples = [];
        
        // Cache pour le texte
        this.textMetrics = null;
        this.textPoints = [];
        
        // Constantes physiques simulées
        this.PLANCK_SCALE = 0.1;
        this.COHERENCE_DECAY = 0.02;
        this.DIMENSION_SEPARATION = 25;
    }

    // Initialisation de l'effet
    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Initialisation des pools et structures
        this.initializeObjectPools();
        this.initializeQuantumField();
        this.analyzeTextGeometry();
        
        // Reset des variables
        this.temps = 0;
        this.convergencePhase = 0;
        this.phaseCoherence = 0;
    }

    // Initialisation des pools d'objets
    initializeObjectPools() {
        // Pool de particules quantiques
        for (let i = 0; i < this.maxParticules; i++) {
            this.particulesPool.push({
                x: 0, y: 0, z: 0,
                vx: 0, vy: 0, vz: 0,
                life: 0, maxLife: 1,
                size: 1, opacity: 1,
                quantum: 0, spin: 0,
                dimension: 0, active: false,
                waveFunction: { amplitude: 1, phase: 0, frequency: 1 }
            });
        }
    }

    // Initialisation du champ quantique
    initializeQuantumField() {
        const dimensions = this.getParam('dimensions');
        
        // Création des versions dimensionnelles du texte
        this.dimensionVersions = [];
        for (let d = 0; d < dimensions; d++) {
            this.dimensionVersions.push({
                dimension: d,
                offset: {
                    x: (Math.random() - 0.5) * this.DIMENSION_SEPARATION * 2,
                    y: (Math.random() - 0.5) * this.DIMENSION_SEPARATION * 2,
                    rotation: (Math.random() - 0.5) * Math.PI * 0.2
                },
                opacity: 0.3 + Math.random() * 0.4,
                phase: Math.random() * Math.PI * 2,
                frequency: 0.5 + Math.random() * 2,
                coherence: 0
            });
        }

        // Champ d'ondes spatiales
        this.waveField = [];
        const fieldResolution = 20;
        for (let x = 0; x < fieldResolution; x++) {
            this.waveField[x] = [];
            for (let y = 0; y < fieldResolution; y++) {
                this.waveField[x][y] = {
                    amplitude: 0,
                    phase: Math.random() * Math.PI * 2,
                    distortion: 0
                };
            }
        }

        // Ondulations spatio-temporelles
        this.spacetimeRipples = [];
    }

    // Analyse de la géométrie du texte
    analyzeTextGeometry() {
        const ctx = this.ctx;
        const text = this.element.content || 'QUANTUM';
        
        // Configuration de la police
        const fontSize = Math.min(this.element.width * 0.7, this.element.height * 0.5);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        this.textMetrics = ctx.measureText(text);
        
        // Extraction des points du texte pour les particules
        this.textPoints = [];
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        
        // Simulation du tracé pour obtenir les points
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.font = ctx.font;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(text, centerX, centerY);
        
        // Échantillonnage des points
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const step = 4;
        
        for (let y = 0; y < tempCanvas.height; y += step) {
            for (let x = 0; x < tempCanvas.width; x += step) {
                const index = (y * tempCanvas.width + x) * 4;
                if (imageData.data[index + 3] > 128) {
                    this.textPoints.push({
                        x: x,
                        y: y,
                        targetX: x,
                        targetY: y
                    });
                }
            }
        }
    }

    // Création d'une particule quantique
    createQuantumParticle(x, y, dimension = 0) {
        const particle = this.particulesPool.find(p => !p.active);
        if (!particle) return;

        particle.active = true;
        particle.dimension = dimension;
        
        // Position dans l'espace-temps
        particle.x = x + (Math.random() - 0.5) * 50;
        particle.y = y + (Math.random() - 0.5) * 50;
        particle.z = (Math.random() - 0.5) * 100;
        
        // Vélocité quantique
        particle.vx = (Math.random() - 0.5) * 5;
        particle.vy = (Math.random() - 0.5) * 5;
        particle.vz = (Math.random() - 0.5) * 3;
        
        // Propriétés quantiques
        particle.maxLife = 2 + Math.random() * 3;
        particle.life = particle.maxLife;
        particle.size = 1 + Math.random() * 3;
        particle.quantum = Math.random();
        particle.spin = Math.random() * Math.PI * 2;
        
        // Fonction d'onde
        particle.waveFunction = {
            amplitude: 0.5 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
            frequency: 1 + Math.random() * 3
        };

        this.particules.push(particle);
    }

    // Création d'ondulation spatio-temporelle
    createSpacetimeRipple(x, y, intensity = 1) {
        this.spacetimeRipples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 50 + intensity * 50,
            intensity: intensity,
            life: 1,
            phase: 0
        });
    }

    // Calcul de la couleur quantique
    getQuantumColor(quantum, opacity = 1, dimension = 0) {
        const baseHue = dimension * 60; // Chaque dimension a sa teinte
        const saturation = 80 + quantum * 20;
        const lightness = 50 + quantum * 30;
        
        return `hsla(${baseHue % 360}, ${saturation}%, ${lightness}%, ${opacity})`;
    }

    // Calcul de la distorsion spatio-temporelle
    calculateSpacetimeDistortion(x, y) {
        let distortion = { dx: 0, dy: 0 };
        
        // Influence des ondulations
        for (let ripple of this.spacetimeRipples) {
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ripple.radius && distance > 0) {
                const influence = ripple.intensity * Math.sin(ripple.phase) / (distance + 1);
                distortion.dx += (dx / distance) * influence * 10;
                distortion.dy += (dy / distance) * influence * 10;
            }
        }
        
        // Distorsion du champ quantique
        const fieldX = Math.floor((x / this.canvas.width) * this.waveField.length);
        const fieldY = Math.floor((y / this.canvas.height) * this.waveField[0].length);
        
        if (fieldX >= 0 && fieldX < this.waveField.length && 
            fieldY >= 0 && fieldY < this.waveField[0].length) {
            const field = this.waveField[fieldX][fieldY];
            distortion.dx += Math.cos(field.phase) * field.distortion * 5;
            distortion.dy += Math.sin(field.phase) * field.distortion * 5;
        }
        
        return distortion;
    }

    // Rendu des versions dimensionnelles fantômes
    renderDimensionalGhosts(ctx) {
        const text = this.element.content || 'QUANTUM';
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        
        ctx.save();
        
        for (let version of this.dimensionVersions) {
            if (version.coherence > 0.95) continue; // Version principale
            
            const opacity = (1 - version.coherence) * version.opacity * this.getParam('intensite');
            if (opacity < 0.05) continue;
            
            ctx.save();
            
            // Transformation dimensionnelle
            const distortion = this.calculateSpacetimeDistortion(
                centerX + version.offset.x, 
                centerY + version.offset.y
            );
            
            ctx.translate(
                centerX + version.offset.x + distortion.dx,
                centerY + version.offset.y + distortion.dy
            );
            ctx.rotate(version.offset.rotation * (1 - version.coherence));
            
            // Effet de superposition quantique
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = opacity;
            
            // Distorsion temporelle
            const scale = 0.8 + 0.4 * Math.sin(this.temps * 0.001 * version.frequency + version.phase);
            ctx.scale(scale, scale);
            
            // Couleur dimensionnelle
            ctx.fillStyle = this.getQuantumColor(version.coherence, 1, version.dimension);
            ctx.strokeStyle = this.getQuantumColor(version.coherence, 0.5, version.dimension);
            ctx.lineWidth = 2;
            
            // Rendu du texte fantôme
            const fontSize = Math.min(this.element.width * 0.7, this.element.height * 0.5);
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.strokeText(text, 0, 0);
            ctx.fillText(text, 0, 0);
            
            ctx.restore();
        }
        
        ctx.restore();
    }

    // Rendu des particules quantiques
    renderQuantumParticles(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (let particle of this.particules) {
            if (!particle.active) continue;
            
            const lifeRatio = particle.life / particle.maxLife;
            
            // Position avec distorsion spatio-temporelle
            const distortion = this.calculateSpacetimeDistortion(particle.x, particle.y);
            const x = particle.x + distortion.dx;
            const y = particle.y + distortion.dy;
            
            // Fonction d'onde
            const wave = particle.waveFunction;
            const waveValue = wave.amplitude * Math.sin(
                this.temps * 0.001 * wave.frequency + wave.phase
            );
            
            // Propriétés visuelles
            const size = particle.size * (1 + waveValue * 0.3) * lifeRatio;
            const opacity = lifeRatio * Math.abs(waveValue) * 0.8;
            
            if (opacity < 0.05) continue;
            
            // Effet quantique : particule/onde dualité
            if (particle.quantum > 0.7) {
                // Mode onde
                ctx.globalAlpha = opacity * 0.3;
                ctx.strokeStyle = this.getQuantumColor(particle.quantum, 1, particle.dimension);
                ctx.lineWidth = size * 0.5;
                
                ctx.beginPath();
                const waveLength = 20;
                for (let i = 0; i < waveLength; i++) {
                    const wx = x + (i - waveLength/2) * 2;
                    const wy = y + Math.sin(i * 0.5 + particle.spin) * size;
                    if (i === 0) ctx.moveTo(wx, wy);
                    else ctx.lineTo(wx, wy);
                }
                ctx.stroke();
            } else {
                // Mode particule
                ctx.globalAlpha = opacity;
                
                // Gradient quantique
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, this.getQuantumColor(particle.quantum, 1, particle.dimension));
                gradient.addColorStop(0.5, this.getQuantumColor(particle.quantum, 0.6, particle.dimension));
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Halo quantique
                ctx.shadowColor = this.getQuantumColor(particle.quantum, 0.5, particle.dimension);
                ctx.shadowBlur = size * 2;
                ctx.beginPath();
                ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        
        ctx.restore();
    }

    // Rendu des ondulations spatio-temporelles
    renderSpacetimeRipples(ctx) {
        ctx.save();
        
        for (let ripple of this.spacetimeRipples) {
            if (ripple.life <= 0) continue;
            
            const opacity = ripple.life * ripple.intensity * 0.3;
            if (opacity < 0.05) continue;
            
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 2;
            
            // Ondulation concentrique
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Effet de distorsion visuelle
            const segments = 32;
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const r = ripple.radius + Math.sin(angle * 4 + ripple.phase) * 5;
                const x = ripple.x + Math.cos(angle) * r;
                const y = ripple.y + Math.sin(angle) * r;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // Rendu du texte final convergé
    renderConvergedText(ctx) {
        if (this.phaseCoherence < 0.8) return;
        
        const text = this.element.content || 'QUANTUM';
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        
        ctx.save();
        
        const opacity = (this.phaseCoherence - 0.8) * 5; // Apparition progressive
        ctx.globalAlpha = opacity * this.getParam('intensite');
        
        // Effet de matérialisation
        const fontSize = Math.min(this.element.width * 0.7, this.element.height * 0.5);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Couleur finale quantique
        ctx.fillStyle = this.getParam('couleurBase');
        ctx.shadowColor = this.getParam('couleurBase');
        ctx.shadowBlur = 10 * opacity;
        
        ctx.fillText(text, centerX, centerY);
        
        ctx.restore();
    }

    // Mise à jour logique
    update(deltaTime) {
        const dt = deltaTime * 0.001 * this.getParam('vitesse');
        this.temps += deltaTime;
        
        // Évolution de la cohérence quantique
        this.convergencePhase += dt * 0.3;
        this.phaseCoherence = Math.min(1, this.convergencePhase);
        
        // Mise à jour des versions dimensionnelles
        for (let version of this.dimensionVersions) {
            version.coherence = Math.min(1, version.coherence + dt * 0.2);
            version.phase += dt * version.frequency;
        }
        
        // Mise à jour du champ quantique
        for (let x = 0; x < this.waveField.length; x++) {
            for (let y = 0; y < this.waveField[0].length; y++) {
                const field = this.waveField[x][y];
                field.phase += dt * 2;
                field.distortion = Math.sin(field.phase) * this.getParam('distorsion') * 
                                 (1 - this.phaseCoherence) * 0.5;
            }
        }
        
        // Mise à jour des particules quantiques
        for (let i = this.particules.length - 1; i >= 0; i--) {
            const particle = this.particules[i];
            
            particle.life -= dt;
            
            // Mouvement quantique avec incertitude
            particle.x += particle.vx * dt * 60 * (1 + Math.random() * 0.2 - 0.1);
            particle.y += particle.vy * dt * 60 * (1 + Math.random() * 0.2 - 0.1);
            particle.z += particle.vz * dt * 60;
            
            // Évolution de la fonction d'onde
            particle.waveFunction.phase += dt * particle.waveFunction.frequency * 3;
            particle.spin += dt * 5;
            
            // Attraction vers les points du texte lors de la convergence
            if (this.phaseCoherence > 0.3 && this.textPoints.length > 0) {
                const targetPoint = this.textPoints[Math.floor(Math.random() * this.textPoints.length)];
                const dx = targetPoint.x - particle.x;
                const dy = targetPoint.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 5) {
                    const force = this.phaseCoherence * 0.1;
                    particle.vx += (dx / distance) * force * 60;
                    particle.vy += (dy / distance) * force * 60;
                }
            }
            
            if (particle.life <= 0) {
                particle.active = false;
                this.particules.splice(i, 1);
            }
        }
        
        // Mise à jour des ondulations spatio-temporelles
        for (let i = this.spacetimeRipples.length - 1; i >= 0; i--) {
            const ripple = this.spacetimeRipples[i];
            
            ripple.radius += dt * 100;
            ripple.life -= dt * 0.5;
            ripple.phase += dt * 8;
            
            if (ripple.life <= 0 || ripple.radius > ripple.maxRadius) {
                this.spacetimeRipples.splice(i, 1);
            }
        }
        
        // Génération de nouvelles particules
        if (this.particules.length < this.maxParticules * this.getParam('intensite')) {
            const numToCreate = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numToCreate; i++) {
                const dimension = Math.floor(Math.random() * this.getParam('dimensions'));
                const version = this.dimensionVersions[dimension];
                
                const x = this.element.x + this.element.width / 2 + version.offset.x;
                const y = this.element.y + this.element.height / 2 + version.offset.y;
                
                this.createQuantumParticle(x, y, dimension);
            }
        }
        
        // Génération d'ondulations périodiques
        if (Math.random() < 0.02) {
            const x = this.element.x + Math.random() * this.element.width;
            const y = this.element.y + Math.random() * this.element.height;
            this.createSpacetimeRipple(x, y, Math.random() * 0.5 + 0.5);
        }
        
        // Reset cyclique pour loop parfait
        if (this.convergencePhase > 3) {
            this.convergencePhase = 0;
            this.phaseCoherence = 0;
            
            // Reset des versions dimensionnelles
            for (let version of this.dimensionVersions) {
                version.coherence = 0;
                version.offset.x = (Math.random() - 0.5) * this.DIMENSION_SEPARATION * 2;
                version.offset.y = (Math.random() - 0.5) * this.DIMENSION_SEPARATION * 2;
                version.offset.rotation = (Math.random() - 0.5) * Math.PI * 0.2;
            }
        }
    }

    // Rendu principal
    render(ctx, element, deltaTime) {
        this.update(deltaTime);
        
        ctx.save();
        
        // Rendu dans l'ordre de profondeur
        this.renderSpacetimeRipples(ctx);    // Fond : ondulations
        this.renderDimensionalGhosts(ctx);   // Versions fantômes
        this.renderQuantumParticles(ctx);    // Particules quantiques
        this.renderConvergedText(ctx);       // Texte final convergé
        
        ctx.restore();
    }

    // Nettoyage
    destroy() {
        this.particules.length = 0;
        this.dimensionVersions.length = 0;
        this.waveField.length = 0;
        this.spacetimeRipples.length = 0;
        this.particulesPool.length = 0;
        this.textPoints.length = 0;
        this.quantumStates.length = 0;
        this.textMetrics = null;
    }
}