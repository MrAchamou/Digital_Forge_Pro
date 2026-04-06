class FireWriteEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'flame-inscription-006',
            name: 'Écriture Flammes Vivantes',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                couleurBase: { type: 'color', default: '#ffffff' },
                densite: { type: 'range', min: 0.3, max: 1, default: 0.6 },
                tailleFlame: { type: 'range', min: 0.5, max: 2, default: 1 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.particules = [];
        this.braises = [];
        this.traces = [];
        this.maxParticules = 150;
        this.maxBraises = 80;
        this.maxTraces = 100;
        
        // Pool d'objets pour performance
        this.particulesPool = [];
        this.braisesPool = [];
        this.tracesPool = [];
        
        // État de l'écriture
        this.progression = 0;
        this.lettresEcrites = 0;
        this.pulseBreathe = 0;
        
        // Cache pour le texte
        this.textPath = [];
        this.textMetrics = null;
    }

    // Initialisation de l'effet
    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Préparation des pools d'objets
        this.initializeObjectPools();
        
        // Analyse du texte pour créer le chemin d'écriture
        this.analyzeTextPath();
        
        // Reset des variables
        this.temps = 0;
        this.progression = 0;
        this.pulseBreathe = 0;
    }

    // Initialisation des pools d'objets pour performance
    initializeObjectPools() {
        // Pool de particules de flammes
        for (let i = 0; i < this.maxParticules; i++) {
            this.particulesPool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1,
                size: 1, opacity: 1,
                temperature: 1, active: false
            });
        }
        
        // Pool de braises
        for (let i = 0; i < this.maxBraises; i++) {
            this.braisesPool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1,
                size: 1, opacity: 1,
                heat: 1, active: false
            });
        }
        
        // Pool de traces de combustion
        for (let i = 0; i < this.maxTraces; i++) {
            this.tracesPool.push({
                x: 0, y: 0, width: 1, height: 1,
                life: 0, maxLife: 1,
                opacity: 1, temperature: 1,
                active: false
            });
        }
    }

    // Analyse du texte pour créer le chemin d'écriture
    analyzeTextPath() {
        const ctx = this.ctx;
        const text = this.element.content || 'FIRE';
        
        // Configuration de la police
        const fontSize = Math.min(this.element.width * 0.8, this.element.height * 0.6);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Mesures du texte
        this.textMetrics = ctx.measureText(text);
        
        // Création des points le long du texte
        this.textPath = [];
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
        
        // Échantillonnage des points le long du contour
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const step = 3;
        
        for (let y = 0; y < tempCanvas.height; y += step) {
            for (let x = 0; x < tempCanvas.width; x += step) {
                const index = (y * tempCanvas.width + x) * 4;
                if (imageData.data[index + 3] > 128) { // Si pixel visible
                    this.textPath.push({
                        x: x,
                        y: y,
                        written: false
                    });
                }
            }
        }
        
        // Tri des points pour simuler l'écriture de gauche à droite
        this.textPath.sort((a, b) => {
            const deltaY = Math.abs(a.y - b.y);
            if (deltaY < 20) return a.x - b.x; // Même ligne
            return a.y - b.y; // Ligne différente
        });
    }

    // Création d'une particule de flamme
    createFlameParticle(x, y, intensity = 1) {
        const particle = this.particulesPool.find(p => !p.active);
        if (!particle) return;

        particle.active = true;
        particle.x = x + (Math.random() - 0.5) * 8;
        particle.y = y + (Math.random() - 0.5) * 4;
        
        // Vélocité vers le haut avec ondulation
        particle.vx = (Math.random() - 0.5) * 3 * intensity;
        particle.vy = -Math.random() * 4 - 2;
        
        particle.maxLife = 0.8 + Math.random() * 0.4;
        particle.life = particle.maxLife;
        particle.size = (2 + Math.random() * 4) * this.getParam('tailleFlame');
        particle.temperature = 0.8 + Math.random() * 0.2;
        particle.opacity = intensity;

        this.particules.push(particle);
    }

    // Création d'une braise
    createEmber(x, y) {
        const ember = this.braisesPool.find(e => !e.active);
        if (!ember) return;

        ember.active = true;
        ember.x = x + (Math.random() - 0.5) * 12;
        ember.y = y + (Math.random() - 0.5) * 6;
        
        ember.vx = (Math.random() - 0.5) * 2;
        ember.vy = -Math.random() * 3 - 1;
        
        ember.maxLife = 1.5 + Math.random() * 1;
        ember.life = ember.maxLife;
        ember.size = 1 + Math.random() * 3;
        ember.heat = 0.9 + Math.random() * 0.1;
        ember.opacity = 0.8;

        this.braises.push(ember);
    }

    // Création d'une trace de combustion
    createBurnTrace(x, y, width, height) {
        const trace = this.tracesPool.find(t => !t.active);
        if (!trace) return;

        trace.active = true;
        trace.x = x;
        trace.y = y;
        trace.width = width;
        trace.height = height;
        trace.maxLife = 2 + Math.random() * 2;
        trace.life = trace.maxLife;
        trace.temperature = 0.6;
        trace.opacity = 0.3;

        this.traces.push(trace);
    }

    // Obtention de la couleur de flamme selon la température
    getFlameColor(temperature, opacity = 1) {
        const baseColor = this.getParam('couleurBase');
        
        if (temperature > 0.8) {
            // Blanc chaud
            return `rgba(255, 255, 255, ${opacity})`;
        } else if (temperature > 0.6) {
            // Jaune-orange
            return `rgba(255, 200, 100, ${opacity})`;
        } else if (temperature > 0.4) {
            // Orange
            return `rgba(255, 150, 50, ${opacity})`;
        } else if (temperature > 0.2) {
            // Rouge-orange
            return `rgba(255, 100, 30, ${opacity})`;
        } else {
            // Rouge sombre
            return `rgba(180, 50, 20, ${opacity})`;
        }
    }

    // Rendu des traces de combustion
    renderBurnTraces(ctx) {
        ctx.save();
        
        for (let trace of this.traces) {
            if (!trace.active) continue;
            
            const lifeRatio = trace.life / trace.maxLife;
            const opacity = trace.opacity * lifeRatio * 0.5;
            
            // Gradient de combustion
            const gradient = ctx.createRadialGradient(
                trace.x + trace.width/2, trace.y + trace.height/2, 0,
                trace.x + trace.width/2, trace.y + trace.height/2, 
                Math.max(trace.width, trace.height) / 2
            );
            
            const temp = trace.temperature * lifeRatio;
            gradient.addColorStop(0, this.getFlameColor(temp, opacity));
            gradient.addColorStop(0.7, this.getFlameColor(temp * 0.6, opacity * 0.5));
            gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity * 0.2})`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(trace.x, trace.y, trace.width, trace.height);
        }
        
        ctx.restore();
    }

    // Rendu des particules de flammes
    renderFlameParticles(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (let particle of this.particules) {
            if (!particle.active) continue;
            
            const lifeRatio = particle.life / particle.maxLife;
            const opacity = particle.opacity * lifeRatio;
            
            // Ondulation de la flamme
            const wobble = Math.sin(this.temps * 0.01 + particle.x * 0.1) * 2;
            const x = particle.x + wobble;
            
            // Gradient radial pour la flamme
            const gradient = ctx.createRadialGradient(x, particle.y, 0, x, particle.y, particle.size);
            
            const temp = particle.temperature * lifeRatio;
            gradient.addColorStop(0, this.getFlameColor(temp, opacity));
            gradient.addColorStop(0.4, this.getFlameColor(temp * 0.8, opacity * 0.8));
            gradient.addColorStop(0.8, this.getFlameColor(temp * 0.4, opacity * 0.4));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    // Rendu des braises
    renderEmbers(ctx) {
        ctx.save();
        
        for (let ember of this.braises) {
            if (!ember.active) continue;
            
            const lifeRatio = ember.life / ember.maxLife;
            const opacity = ember.opacity * lifeRatio;
            
            // Scintillement des braises
            const twinkle = 0.7 + 0.3 * Math.sin(this.temps * 0.02 + ember.x * 0.05);
            const finalOpacity = opacity * twinkle;
            
            ctx.fillStyle = this.getFlameColor(ember.heat, finalOpacity);
            ctx.shadowColor = this.getFlameColor(ember.heat, finalOpacity * 0.5);
            ctx.shadowBlur = ember.size * 2;
            
            ctx.beginPath();
            ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
    }

    // Mise à jour logique
    update(deltaTime) {
        const dt = deltaTime * 0.001 * this.getParam('vitesse');
        this.temps += deltaTime;
        
        // Respiration de l'intensité du feu
        this.pulseBreathe += dt * 2;
        const breatheIntensity = 0.8 + 0.2 * Math.sin(this.pulseBreathe);
        
        // Progression de l'écriture
        const writeSpeed = 50 * this.getParam('vitesse');
        this.progression += writeSpeed * dt;
        
        // Mise à jour des particules de flammes
        for (let i = this.particules.length - 1; i >= 0; i--) {
            const particle = this.particules[i];
            
            particle.life -= dt;
            particle.x += particle.vx * dt * 60;
            particle.y += particle.vy * dt * 60;
            
            // Ondulation naturelle
            particle.vx += Math.sin(this.temps * 0.005 + particle.y * 0.01) * 0.5 * dt;
            particle.vy -= 0.5 * dt; // Gravité inverse
            
            if (particle.life <= 0) {
                particle.active = false;
                this.particules.splice(i, 1);
            }
        }
        
        // Mise à jour des braises
        for (let i = this.braises.length - 1; i >= 0; i--) {
            const ember = this.braises[i];
            
            ember.life -= dt;
            ember.x += ember.vx * dt * 60;
            ember.y += ember.vy * dt * 60;
            ember.vy += 0.2 * dt; // Gravité légère
            
            if (ember.life <= 0) {
                ember.active = false;
                this.braises.splice(i, 1);
            }
        }
        
        // Mise à jour des traces
        for (let i = this.traces.length - 1; i >= 0; i--) {
            const trace = this.traces[i];
            
            trace.life -= dt * 0.5; // Traces persistent plus longtemps
            trace.temperature *= 0.995; // Refroidissement lent
            
            if (trace.life <= 0) {
                trace.active = false;
                this.traces.splice(i, 1);
            }
        }
        
        // Génération de nouvelles particules selon progression
        const currentWriteIndex = Math.floor(this.progression);
        
        for (let i = Math.max(0, currentWriteIndex - 10); i < Math.min(this.textPath.length, currentWriteIndex + 5); i++) {
            const point = this.textPath[i];
            if (!point || point.written) continue;
            
            const intensity = breatheIntensity * this.getParam('intensite') * this.getParam('densite');
            
            // Création des flammes
            if (Math.random() < intensity * 0.3) {
                this.createFlameParticle(point.x, point.y, intensity);
            }
            
            // Création des braises
            if (Math.random() < intensity * 0.1) {
                this.createEmber(point.x, point.y);
            }
            
            // Création des traces
            if (Math.random() < intensity * 0.05) {
                this.createBurnTrace(point.x - 2, point.y - 2, 4, 4);
            }
            
            point.written = true;
        }
        
        // Reset cyclique pour loop parfait
        if (currentWriteIndex >= this.textPath.length) {
            this.progression = 0;
            this.textPath.forEach(point => point.written = false);
        }
    }

    // Rendu principal
    render(ctx, element, deltaTime) {
        this.update(deltaTime);
        
        ctx.save();
        
        // Rendu dans l'ordre de profondeur
        this.renderBurnTraces(ctx);  // Arrière-plan
        this.renderFlameParticles(ctx); // Flammes principales
        this.renderEmbers(ctx);      // Braises au premier plan
        
        ctx.restore();
    }

    // Nettoyage
    destroy() {
        this.particules.length = 0;
        this.braises.length = 0;
        this.traces.length = 0;
        this.particulesPool.length = 0;
        this.braisesPool.length = 0;
        this.tracesPool.length = 0;
        this.textPath.length = 0;
        this.textMetrics = null;
    }
}