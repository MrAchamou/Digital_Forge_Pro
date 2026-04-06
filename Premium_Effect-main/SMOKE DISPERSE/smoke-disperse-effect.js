class SmokeDisperseEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'gaseous-diffusion-cloud-034',
            name: 'Diffusion Gazeuse Turbulente',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                turbulence: { type: 'range', min: 0.1, max: 2, default: 1.2 },
                densite: { type: 'range', min: 0.3, max: 1, default: 0.6 },
                couleur: { type: 'color', default: '#e8e8e8' }
            }
        });

        // Variables principales
        this.temps = 0;
        this.smokeParticles = [];
        this.turbulenceField = [];
        this.vortexCenters = [];
        this.densityMap = [];
        
        // Configuration physique
        this.maxParticles = 800;
        this.particlePool = [];
        this.fieldResolution = 20;
        this.noiseOffset = 0;
        
        // États d'animation
        this.dispersePhase = 0;
        this.vortexStrength = 0;
        this.atmosphericPressure = 1;
        
        // Cache pour optimisation
        this.noiseCache = new Map();
        this.lastFrameTime = 0;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.ctx = canvas.getContext('2d');
        
        // Initialisation du pool de particules
        this.initializeParticlePool();
        
        // Génération du champ de turbulence
        this.generateTurbulenceField();
        
        // Création des centres de vortex
        this.initializeVortexCenters();
        
        // Émission initiale de fumée
        this.emitInitialSmoke();
        
        // Génération de la carte de densité
        this.generateDensityMap();
    }

    initializeParticlePool() {
        this.particlePool = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                size: 0,
                opacity: 0,
                life: 0,
                maxLife: 0,
                density: 0,
                temperature: 0,
                active: false,
                turbulenceInfluence: Math.random(),
                spiralPhase: Math.random() * Math.PI * 2,
                disperseRate: 0.5 + Math.random() * 0.5
            });
        }
    }

    generateTurbulenceField() {
        this.turbulenceField = [];
        const res = this.fieldResolution;
        
        for (let x = 0; x < res; x++) {
            this.turbulenceField[x] = [];
            for (let y = 0; y < res; y++) {
                const noise1 = this.perlinNoise(x * 0.1, y * 0.1, this.temps * 0.001);
                const noise2 = this.perlinNoise(x * 0.05, y * 0.05, this.temps * 0.0005);
                
                this.turbulenceField[x][y] = {
                    vx: (noise1 - 0.5) * 2,
                    vy: (noise2 - 0.5) * 2,
                    intensity: Math.abs(noise1 + noise2) * 0.5
                };
            }
        }
    }

    initializeVortexCenters() {
        this.vortexCenters = [];
        const numVortex = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numVortex; i++) {
            this.vortexCenters.push({
                x: this.element.x + Math.random() * this.element.width,
                y: this.element.y + Math.random() * this.element.height,
                strength: 0.5 + Math.random() * 0.5,
                direction: Math.random() > 0.5 ? 1 : -1,
                phase: Math.random() * Math.PI * 2,
                radius: 50 + Math.random() * 100
            });
        }
    }

    emitInitialSmoke() {
        const numParticles = Math.floor(this.maxParticles * 0.3);
        
        for (let i = 0; i < numParticles; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                this.resetParticle(particle, 
                    this.element.x + Math.random() * this.element.width,
                    this.element.y + Math.random() * this.element.height * 0.5
                );
            }
        }
    }

    generateDensityMap() {
        this.densityMap = [];
        const width = Math.ceil(this.element.width / 10);
        const height = Math.ceil(this.element.height / 10);
        
        for (let x = 0; x < width; x++) {
            this.densityMap[x] = [];
            for (let y = 0; y < height; y++) {
                const centerX = width * 0.5;
                const centerY = height * 0.3;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                
                this.densityMap[x][y] = Math.max(0, 1 - (distance / maxDistance));
            }
        }
    }

    getParticleFromPool() {
        for (let particle of this.particlePool) {
            if (!particle.active) {
                return particle;
            }
        }
        return null;
    }

    resetParticle(particle, x, y) {
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * 2;
        particle.vy = -Math.random() * 2 - 1;
        particle.size = 2 + Math.random() * 8;
        particle.opacity = 0.8 + Math.random() * 0.2;
        particle.life = 0;
        particle.maxLife = 3000 + Math.random() * 4000;
        particle.density = 0.5 + Math.random() * 0.5;
        particle.temperature = 1.0;
        particle.active = true;
        particle.spiralPhase = Math.random() * Math.PI * 2;
        particle.disperseRate = 0.3 + Math.random() * 0.4;
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        this.noiseOffset += deltaTime * 0.001;
        
        // Mise à jour des phases d'animation
        this.dispersePhase = (this.temps * 0.001) % (Math.PI * 2);
        this.vortexStrength = 0.5 + Math.sin(this.temps * 0.0008) * 0.3;
        this.atmosphericPressure = 0.8 + Math.sin(this.temps * 0.0005) * 0.2;
        
        // Régénération périodique du champ de turbulence
        if (this.temps - this.lastFrameTime > 100) {
            this.generateTurbulenceField();
            this.lastFrameTime = this.temps;
        }
        
        // Émission continue de nouvelles particules
        if (Math.random() < 0.1) {
            this.emitSmoke();
        }
        
        // Mise à jour des centres de vortex
        this.updateVortexCenters(deltaTime);
        
        // Mise à jour des particules
        this.updateParticles(deltaTime);
    }

    updateVortexCenters(deltaTime) {
        this.vortexCenters.forEach(vortex => {
            vortex.phase += deltaTime * 0.001;
            vortex.x += Math.sin(vortex.phase) * 0.5;
            vortex.y += Math.cos(vortex.phase * 0.7) * 0.3;
            vortex.strength = 0.3 + Math.sin(this.temps * 0.001 + vortex.phase) * 0.4;
        });
    }

    updateParticles(deltaTime) {
        this.smokeParticles.forEach((particle, index) => {
            if (!particle.active) return;
            
            particle.life += deltaTime;
            
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                return;
            }
            
            // Progression de vie (0 à 1)
            const lifeRatio = particle.life / particle.maxLife;
            
            // Application des forces de turbulence
            this.applyTurbulence(particle, deltaTime);
            
            // Application des forces de vortex
            this.applyVortexForces(particle, deltaTime);
            
            // Simulation de diffusion gazeuse
            this.applyGaseousDiffusion(particle, deltaTime, lifeRatio);
            
            // Mise à jour position
            particle.x += particle.vx * deltaTime * 0.1;
            particle.y += particle.vy * deltaTime * 0.1;
            
            // Évolution des propriétés visuelles
            this.updateParticleVisuals(particle, lifeRatio);
            
            // Friction atmosphérique
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    applyTurbulence(particle, deltaTime) {
        const fieldX = Math.floor((particle.x - this.element.x) / this.element.width * this.fieldResolution);
        const fieldY = Math.floor((particle.y - this.element.y) / this.element.height * this.fieldResolution);
        
        if (fieldX >= 0 && fieldX < this.fieldResolution && fieldY >= 0 && fieldY < this.fieldResolution) {
            const field = this.turbulenceField[fieldX][fieldY];
            const turbulenceStrength = this.parameters.turbulence.value * particle.turbulenceInfluence;
            
            particle.vx += field.vx * turbulenceStrength * deltaTime * 0.01;
            particle.vy += field.vy * turbulenceStrength * deltaTime * 0.01;
        }
    }

    applyVortexForces(particle, deltaTime) {
        this.vortexCenters.forEach(vortex => {
            const dx = particle.x - vortex.x;
            const dy = particle.y - vortex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < vortex.radius && distance > 1) {
                const angle = Math.atan2(dy, dx);
                const vortexForce = (vortex.strength * this.vortexStrength) / (distance * 0.01);
                
                // Force tangentielle (rotation)
                const tangentAngle = angle + Math.PI * 0.5 * vortex.direction;
                particle.vx += Math.cos(tangentAngle) * vortexForce * deltaTime * 0.001;
                particle.vy += Math.sin(tangentAngle) * vortexForce * deltaTime * 0.001;
                
                // Force spirale
                particle.spiralPhase += vortexForce * deltaTime * 0.0001;
                const spiralForce = Math.sin(particle.spiralPhase) * 0.5;
                particle.vx += Math.cos(angle) * spiralForce * deltaTime * 0.001;
                particle.vy += Math.sin(angle) * spiralForce * deltaTime * 0.001;
            }
        });
    }

    applyGaseousDiffusion(particle, deltaTime, lifeRatio) {
        // Simulation de la diffusion selon la densité
        const densityInfluence = this.getDensityAt(particle.x, particle.y);
        const diffusionRate = particle.disperseRate * (1 - densityInfluence) * this.atmosphericPressure;
        
        // Force de dispersion vers les zones de faible densité
        const dispersionForce = diffusionRate * this.parameters.intensite.value;
        particle.vx += (Math.random() - 0.5) * dispersionForce * deltaTime * 0.01;
        particle.vy += (Math.random() - 0.5) * dispersionForce * deltaTime * 0.01;
        
        // Refroidissement et expansion
        particle.temperature *= 0.999;
        if (lifeRatio > 0.3) {
            particle.size *= 1.001; // Expansion progressive
        }
        
        // Force de flottabilité (fumée chaude monte)
        const buoyancy = particle.temperature * particle.density * 0.1;
        particle.vy -= buoyancy * deltaTime * 0.001;
    }

    updateParticleVisuals(particle, lifeRatio) {
        // Évolution de l'opacité selon les phases
        if (lifeRatio < 0.2) {
            // Phase d'apparition
            particle.opacity = Math.min(0.9, lifeRatio * 5);
        } else if (lifeRatio > 0.7) {
            // Phase de dispersion
            const fadeRatio = (lifeRatio - 0.7) / 0.3;
            particle.opacity = 0.9 * (1 - fadeRatio * fadeRatio);
        }
        
        // Modulation de densité avec micro-variations
        particle.density += Math.sin(this.temps * 0.01 + particle.spiralPhase) * 0.001;
        particle.density = Math.max(0.1, Math.min(1, particle.density));
    }

    getDensityAt(x, y) {
        const mapX = Math.floor((x - this.element.x) / this.element.width * this.densityMap.length);
        const mapY = Math.floor((y - this.element.y) / this.element.height * this.densityMap[0].length);
        
        if (mapX >= 0 && mapX < this.densityMap.length && mapY >= 0 && mapY < this.densityMap[0].length) {
            return this.densityMap[mapX][mapY];
        }
        return 0;
    }

    emitSmoke() {
        const numParticles = 2 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numParticles; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                // Émission depuis des points variés
                const emitX = this.element.x + Math.random() * this.element.width;
                const emitY = this.element.y + this.element.height * (0.8 + Math.random() * 0.2);
                
                this.resetParticle(particle, emitX, emitY);
                this.smokeParticles.push(particle);
            }
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Préparation du contexte pour la fumée
        ctx.globalCompositeOperation = 'multiply';
        
        // Rendu des particules avec effets atmosphériques
        this.renderSmokeParticles(ctx);
        
        // Effet de profondeur atmosphérique
        this.renderAtmosphericDepth(ctx);
        
        ctx.restore();
    }

    renderSmokeParticles(ctx) {
        // Tri des particules par profondeur (opacité)
        const sortedParticles = this.smokeParticles
            .filter(p => p.active)
            .sort((a, b) => a.opacity - b.opacity);
        
        sortedParticles.forEach(particle => {
            ctx.save();
            
            // Position et transformation
            ctx.translate(particle.x, particle.y);
            
            // Calcul de la couleur avec variation de densité
            const baseColor = this.hexToRgb(this.parameters.couleur.value);
            const densityVariation = 0.7 + particle.density * 0.3;
            
            const r = Math.floor(baseColor.r * densityVariation);
            const g = Math.floor(baseColor.g * densityVariation);
            const b = Math.floor(baseColor.b * densityVariation);
            const alpha = particle.opacity * this.parameters.densite.value;
            
            // Gradient radial pour simulation volumétrique
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = gradient;
            
            // Rendu avec déformation turbulente
            const turbulentSize = particle.size * (0.8 + Math.sin(this.temps * 0.005 + particle.spiralPhase) * 0.2);
            
            ctx.beginPath();
            ctx.arc(0, 0, turbulentSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Effet de tourbillon pour les particules proches des vortex
            this.renderVortexDistortion(ctx, particle);
            
            ctx.restore();
        });
    }

    renderVortexDistortion(ctx, particle) {
        this.vortexCenters.forEach(vortex => {
            const dx = particle.x - vortex.x;
            const dy = particle.y - vortex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < vortex.radius * 0.5) {
                const distortionStrength = (1 - distance / (vortex.radius * 0.5)) * 0.3;
                const angle = Math.atan2(dy, dx) + vortex.phase;
                
                ctx.save();
                ctx.globalAlpha *= distortionStrength;
                ctx.transform(
                    Math.cos(angle * 0.1), Math.sin(angle * 0.1),
                    -Math.sin(angle * 0.1), Math.cos(angle * 0.1),
                    0, 0
                );
                ctx.restore();
            }
        });
    }

    renderAtmosphericDepth(ctx) {
        // Effet de brume atmosphérique pour la profondeur
        const gradient = ctx.createLinearGradient(
            this.element.x, this.element.y,
            this.element.x, this.element.y + this.element.height
        );
        
        const atmosphereColor = this.hexToRgb(this.parameters.couleur.value);
        const atmosphereAlpha = 0.05 * this.parameters.intensite.value;
        
        gradient.addColorStop(0, `rgba(${atmosphereColor.r}, ${atmosphereColor.g}, ${atmosphereColor.b}, 0)`);
        gradient.addColorStop(0.7, `rgba(${atmosphereColor.r}, ${atmosphereColor.g}, ${atmosphereColor.b}, ${atmosphereAlpha})`);
        gradient.addColorStop(1, `rgba(${atmosphereColor.r}, ${atmosphereColor.g}, ${atmosphereColor.b}, ${atmosphereAlpha * 1.5})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.element.x, this.element.y, this.element.width, this.element.height);
    }

    perlinNoise(x, y, z = 0) {
        // Implémentation simplifiée du bruit de Perlin pour les turbulences
        const cacheKey = `${Math.floor(x * 100)}_${Math.floor(y * 100)}_${Math.floor(z * 100)}`;
        
        if (this.noiseCache.has(cacheKey)) {
            return this.noiseCache.get(cacheKey);
        }
        
        const noise = (Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) % 1;
        const result = Math.abs(noise);
        
        // Cache avec limite de taille
        if (this.noiseCache.size > 1000) {
            this.noiseCache.clear();
        }
        this.noiseCache.set(cacheKey, result);
        
        return result;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 232, g: 232, b: 232 };
    }

    destroy() {
        // Nettoyage mémoire
        this.smokeParticles = [];
        this.particlePool = [];
        this.turbulenceField = [];
        this.vortexCenters = [];
        this.densityMap = [];
        this.noiseCache.clear();
        
        // Reset des variables
        this.temps = 0;
        this.dispersePhase = 0;
        this.vortexStrength = 0;
        this.atmosphericPressure = 1;
    }
}