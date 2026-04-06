class TimeRewindEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'temporal-aging-reversal-051',
            name: 'Réversion Temporelle Cyclique',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                couleur: { type: 'color', default: '#8b4513' },
                degradation: { type: 'range', min: 0.1, max: 1, default: 0.6 },
                traces: { type: 'range', min: 0, max: 1, default: 0.8 }
            }
        });

        // Variables temporelles
        this.temps = 0;
        this.cycleDuration = 8000; // 8 secondes par cycle complet
        this.ageProgress = 0; // 0 = jeune, 1 = vieux
        this.isAging = true;
        
        // Pool de particules de dégradation
        this.degradationParticles = [];
        this.maxParticles = 150;
        this.initParticlePool();
        
        // Traces temporelles (versions fantômes)
        this.temporalTraces = [];
        this.maxTraces = 5;
        
        // Données de texture pour les effets
        this.originalImageData = null;
        this.currentImageData = null;
        this.noisePattern = this.generateNoisePattern();
        
        // Variables de dégradation
        this.cracksPattern = this.generateCracksPattern();
        this.fadeRegions = this.generateFadeRegions();
        
        // Cycle de variation (jamais identique)
        this.cycleVariation = Math.random() * 0.3 + 0.7;
        this.uniqueSeed = Math.random() * 1000;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Capture de l'image originale
        this.captureOriginalImage();
        
        // Initialisation des traces temporelles
        this.initTemporalTraces();
    }

    captureOriginalImage() {
        try {
            this.originalImageData = this.ctx.getImageData(
                this.element.x, 
                this.element.y, 
                this.element.width, 
                this.element.height
            );
            this.currentImageData = this.ctx.createImageData(
                this.element.width, 
                this.element.height
            );
        } catch(e) {
            // Fallback si pas d'accès aux données
            this.originalImageData = null;
        }
    }

    initParticlePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.degradationParticles.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                size: 1,
                opacity: 0,
                life: 0,
                maxLife: 1,
                type: Math.floor(Math.random() * 3), // 0: dust, 1: crack, 2: fade
                active: false
            });
        }
    }

    initTemporalTraces() {
        for (let i = 0; i < this.maxTraces; i++) {
            this.temporalTraces.push({
                age: i / this.maxTraces,
                opacity: 0,
                offsetX: (Math.random() - 0.5) * 20,
                offsetY: (Math.random() - 0.5) * 20,
                scale: 0.95 + i * 0.01,
                active: false
            });
        }
    }

    generateNoisePattern() {
        const pattern = [];
        for (let i = 0; i < 1000; i++) {
            pattern.push({
                x: Math.random(),
                y: Math.random(),
                intensity: Math.random(),
                frequency: Math.random() * 0.1 + 0.05
            });
        }
        return pattern;
    }

    generateCracksPattern() {
        const cracks = [];
        for (let i = 0; i < 20; i++) {
            const crack = {
                startX: Math.random(),
                startY: Math.random(),
                segments: []
            };
            
            let x = crack.startX;
            let y = crack.startY;
            for (let j = 0; j < 8; j++) {
                x += (Math.random() - 0.5) * 0.1;
                y += (Math.random() - 0.5) * 0.1;
                crack.segments.push({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
            }
            cracks.push(crack);
        }
        return cracks;
    }

    generateFadeRegions() {
        const regions = [];
        for (let i = 0; i < 15; i++) {
            regions.push({
                x: Math.random(),
                y: Math.random(),
                radius: Math.random() * 0.2 + 0.05,
                intensity: Math.random()
            });
        }
        return regions;
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Calcul du progrès du cycle avec variation unique
        const cycleProgress = (this.temps % this.cycleDuration) / this.cycleDuration;
        const easedProgress = this.easeInOutCubic(cycleProgress) * this.cycleVariation;
        
        // Détermination de la phase (vieillissement ou rajeunissement)
        if (easedProgress < 0.5) {
            this.isAging = true;
            this.ageProgress = easedProgress * 2;
        } else {
            this.isAging = false;
            this.ageProgress = 2 - (easedProgress * 2);
        }
        
        // Mise à jour des particules de dégradation
        this.updateDegradationParticles(deltaTime);
        
        // Mise à jour des traces temporelles
        this.updateTemporalTraces();
        
        // Génération aléatoire de nouvelles particules
        if (Math.random() < 0.3 && this.ageProgress > 0.2) {
            this.spawnDegradationParticle();
        }
    }

    updateDegradationParticles(deltaTime) {
        this.degradationParticles.forEach(particle => {
            if (!particle.active) return;
            
            particle.life += deltaTime / 1000;
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            
            // Mise à jour de l'opacité selon le cycle
            const lifeRatio = particle.life / particle.maxLife;
            if (this.isAging) {
                particle.opacity = Math.sin(lifeRatio * Math.PI) * this.ageProgress;
            } else {
                particle.opacity = Math.sin(lifeRatio * Math.PI) * (1 - this.ageProgress) * 0.5;
            }
            
            // Désactivation des particules mortes
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                particle.opacity = 0;
            }
        });
    }

    updateTemporalTraces() {
        this.temporalTraces.forEach((trace, index) => {
            // Activation progressive des traces selon l'âge
            const shouldBeActive = this.ageProgress > trace.age * 0.8;
            trace.active = shouldBeActive;
            
            if (trace.active) {
                // Opacité basée sur le progrès et la variation cyclique
                const baseOpacity = (1 - trace.age) * this.parameters.traces.value;
                trace.opacity = baseOpacity * (0.3 + 0.7 * Math.sin(this.temps * 0.001 + index));
            } else {
                trace.opacity = 0;
            }
        });
    }

    spawnDegradationParticle() {
        const particle = this.degradationParticles.find(p => !p.active);
        if (!particle) return;
        
        particle.active = true;
        particle.x = Math.random() * this.element.width;
        particle.y = Math.random() * this.element.height;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = (Math.random() - 0.5) * 0.5;
        particle.size = Math.random() * 3 + 1;
        particle.life = 0;
        particle.maxLife = Math.random() * 3 + 2;
        particle.type = Math.floor(Math.random() * 3);
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Rendu des traces temporelles (versions fantômes du passé)
        this.renderTemporalTraces(ctx, element);
        
        // Rendu de l'image principale avec effets de vieillissement
        this.renderAgedImage(ctx, element);
        
        // Rendu des particules de dégradation
        this.renderDegradationParticles(ctx, element);
        
        // Effets de surface (cracks, fading)
        this.renderSurfaceEffects(ctx, element);
        
        ctx.restore();
    }

    renderTemporalTraces(ctx, element) {
        this.temporalTraces.forEach(trace => {
            if (!trace.active || trace.opacity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = trace.opacity * 0.4;
            
            // Position décalée pour effet fantôme
            const x = element.x + trace.offsetX;
            const y = element.y + trace.offsetY;
            
            // Mise à l'échelle
            ctx.translate(x + element.width/2, y + element.height/2);
            ctx.scale(trace.scale, trace.scale);
            ctx.translate(-element.width/2, -element.height/2);
            
            // Filtre temporel (teinte sépia pour le passé)
            ctx.filter = `sepia(${trace.age * 100}%) contrast(${120 - trace.age * 20}%)`;
            
            // Dessiner l'image fantôme (simplifiée)
            ctx.fillStyle = this.parameters.couleur.value;
            ctx.globalAlpha *= 0.3;
            ctx.fillRect(0, 0, element.width, element.height);
            
            ctx.restore();
        });
    }

    renderAgedImage(ctx, element) {
        ctx.save();
        
        // Application des effets de vieillissement
        const aging = this.ageProgress * this.parameters.intensite.value;
        
        // Filtre de base selon l'âge
        const sepia = aging * 80;
        const contrast = 100 - aging * 30;
        const brightness = 100 - aging * 20;
        const saturation = 100 - aging * 60;
        
        ctx.filter = `sepia(${sepia}%) contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
        
        // Dessiner l'image de base
        ctx.fillStyle = this.parameters.couleur.value;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // Bruit de texture pour le vieillissement
        if (aging > 0.3) {
            this.renderTextureNoise(ctx, element, aging);
        }
        
        ctx.restore();
    }

    renderTextureNoise(ctx, element, intensity) {
        ctx.save();
        ctx.globalAlpha = intensity * 0.4;
        
        this.noisePattern.forEach(noise => {
            const x = element.x + noise.x * element.width;
            const y = element.y + noise.y * element.height;
            const size = noise.intensity * 2 * intensity;
            
            // Oscillation temporelle du bruit
            const oscillation = Math.sin(this.temps * noise.frequency + this.uniqueSeed);
            const finalOpacity = (noise.intensity + oscillation * 0.3) * intensity;
            
            ctx.globalAlpha = Math.max(0, finalOpacity * 0.2);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x, y, size, size);
        });
        
        ctx.restore();
    }

    renderDegradationParticles(ctx, element) {
        this.degradationParticles.forEach(particle => {
            if (!particle.active || particle.opacity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            
            const x = element.x + particle.x;
            const y = element.y + particle.y;
            
            switch(particle.type) {
                case 0: // Dust
                    ctx.fillStyle = '#8b7355';
                    ctx.fillRect(x, y, particle.size, particle.size);
                    break;
                    
                case 1: // Crack lines
                    ctx.strokeStyle = '#654321';
                    ctx.lineWidth = particle.size * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + particle.vx * 10, y + particle.vy * 10);
                    ctx.stroke();
                    break;
                    
                case 2: // Fade spots
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 3);
                    gradient.addColorStop(0, 'rgba(139, 69, 19, 0.3)');
                    gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, particle.size * 3, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
            
            ctx.restore();
        });
    }

    renderSurfaceEffects(ctx, element) {
        const aging = this.ageProgress * this.parameters.intensite.value;
        if (aging < 0.4) return;
        
        ctx.save();
        ctx.globalAlpha = (aging - 0.4) * 0.6;
        
        // Rendu des fissures
        ctx.strokeStyle = '#4a3c28';
        ctx.lineWidth = 1;
        this.cracksPattern.forEach(crack => {
            ctx.beginPath();
            const startX = element.x + crack.startX * element.width;
            const startY = element.y + crack.startY * element.height;
            ctx.moveTo(startX, startY);
            
            crack.segments.forEach(segment => {
                const x = element.x + segment.x * element.width;
                const y = element.y + segment.y * element.height;
                ctx.lineTo(x, y);
            });
            ctx.stroke();
        });
        
        // Zones de décoloration
        this.fadeRegions.forEach(region => {
            const x = element.x + region.x * element.width;
            const y = element.y + region.y * element.height;
            const radius = region.radius * Math.min(element.width, element.height);
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(139, 69, 19, ${region.intensity * aging * 0.3})`);
            gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    destroy() {
        this.degradationParticles = [];
        this.temporalTraces = [];
        this.noisePattern = [];
        this.cracksPattern = [];
        this.fadeRegions = [];
        this.originalImageData = null;
        this.currentImageData = null;
    }
}