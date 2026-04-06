class SparkleAuraEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'stellar-shimmer-aura-020',
            name: 'Aura Scintillante Stellaire',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0.2, max: 1, default: 0.7 },
                densite: { type: 'range', min: 0.3, max: 1, default: 0.6 },
                taille: { type: 'range', min: 0.5, max: 2, default: 1 },
                couleurBase: { type: 'color', default: '#4f46e5' },
                prismatique: { type: 'range', min: 0, max: 1, default: 0.8 }
            }
        });

        // Variables de l'effet
        this.temps = 0;
        this.particules = [];
        this.maxParticules = 300;
        this.breathingPhase = 0;
        this.prismColors = [
            '#ff006e', '#8338ec', '#3a86ff', '#06ffa5', 
            '#ffbe0b', '#fb5607', '#ff4081', '#9c27b0'
        ];
        
        // Pool de particules pour performance
        this.particulePool = [];
        this.initializePool();
    }

    initializePool() {
        for (let i = 0; i < this.maxParticules; i++) {
            this.particulePool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                size: 0, life: 0, maxLife: 0,
                brightness: 0, twinkle: 0,
                colorIndex: 0, hue: 0,
                active: false, birth: 0
            });
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        // Précalcul des zones d'aura
        this.auraRadius = Math.max(element.width, element.height) * 0.8;
        this.innerRadius = Math.max(element.width, element.height) * 0.3;
        
        this.spawnInitialParticles();
    }

    spawnInitialParticles() {
        const particleCount = Math.floor(this.maxParticules * this.parameters.densite.value);
        
        for (let i = 0; i < particleCount; i++) {
            this.spawnParticle();
        }
    }

    spawnParticle() {
        const particle = this.getFromPool();
        if (!particle) return;

        // Position aléatoire autour du texte
        const angle = Math.random() * Math.PI * 2;
        const distance = this.innerRadius + Math.random() * (this.auraRadius - this.innerRadius);
        
        particle.x = this.centerX + Math.cos(angle) * distance;
        particle.y = this.centerY + Math.sin(angle) * distance;
        
        // Vélocité orbitale subtile
        const orbitalSpeed = 0.02 * this.parameters.vitesse.value;
        particle.vx = -Math.sin(angle) * orbitalSpeed * (0.5 + Math.random() * 0.5);
        particle.vy = Math.cos(angle) * orbitalSpeed * (0.5 + Math.random() * 0.5);
        
        // Propriétés visuelles
        particle.size = (0.5 + Math.random() * 1.5) * this.parameters.taille.value;
        particle.maxLife = 2000 + Math.random() * 3000;
        particle.life = particle.maxLife;
        particle.brightness = 0;
        particle.twinkle = Math.random() * Math.PI * 2;
        particle.colorIndex = Math.floor(Math.random() * this.prismColors.length);
        particle.hue = Math.random() * 360;
        particle.birth = this.temps;
        particle.active = true;
    }

    getFromPool() {
        return this.particulePool.find(p => !p.active);
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        this.breathingPhase += deltaTime * 0.001;
        
        // Mise à jour du centre si l'élément bouge
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        // Respiration cosmique - pulse de densité
        const breathingIntensity = 0.7 + 0.3 * Math.sin(this.breathingPhase);
        
        // Spawn de nouvelles particules selon la respiration
        if (Math.random() < 0.1 * breathingIntensity * this.parameters.densite.value) {
            this.spawnParticle();
        }
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // Rendu des particules par couches pour profondeur
        this.renderParticleLayer(ctx, 0.3, 'background');
        this.renderParticleLayer(ctx, 0.7, 'midground');
        this.renderParticleLayer(ctx, 1.0, 'foreground');
        
        ctx.restore();
    }

    renderParticleLayer(ctx, sizeMultiplier, layer) {
        this.particules.forEach(particle => {
            if (!particle.active) return;
            
            // Filtre par couche selon la taille
            const layerSize = particle.size * sizeMultiplier;
            if ((layer === 'background' && layerSize > 0.8) ||
                (layer === 'midground' && (layerSize <= 0.8 || layerSize > 1.3)) ||
                (layer === 'foreground' && layerSize <= 1.3)) return;
            
            this.renderParticle(ctx, particle, sizeMultiplier);
        });
    }

    renderParticle(ctx, particle, sizeMultiplier) {
        const age = (this.temps - particle.birth) / particle.maxLife;
        
        // Courbe de vie réaliste
        let alpha;
        if (age < 0.1) {
            // Naissance progressive
            alpha = age / 0.1;
        } else if (age > 0.8) {
            // Mort progressive
            alpha = (1 - age) / 0.2;
        } else {
            // Vie stable avec scintillement
            alpha = 0.6 + 0.4 * Math.sin(particle.twinkle + this.temps * 0.01);
        }
        
        alpha *= this.parameters.intensite.value;
        
        // Couleur prismatique évolutive
        let color;
        if (this.parameters.prismatique.value > 0.5) {
            const prismShift = (this.temps * 0.001 + particle.birth * 0.0001) % 1;
            const colorIndex = Math.floor(prismShift * this.prismColors.length);
            color = this.prismColors[colorIndex];
        } else {
            color = this.parameters.couleurBase.value;
        }
        
        const size = particle.size * sizeMultiplier;
        
        ctx.save();
        ctx.translate(particle.x, particle.y);
        
        // Effet de scintillement stellaire
        const twinkleIntensity = Math.sin(particle.twinkle + this.temps * 0.005) * 0.5 + 0.5;
        const finalSize = size * (0.7 + 0.3 * twinkleIntensity);
        
        // Gradient radial pour l'étoile
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, finalSize * 2);
        gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.3, `${color}${Math.floor(alpha * 180).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${color}00`);
        
        // Corps de l'étoile
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, finalSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Éclat central brillant
        if (twinkleIntensity > 0.7) {
            ctx.fillStyle = `${color}${Math.floor(alpha * 200).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(0, 0, finalSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Rayons d'étoile pour les plus brillantes
            if (size > 1.2 && twinkleIntensity > 0.85) {
                ctx.strokeStyle = `${color}${Math.floor(alpha * 150).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-finalSize * 1.5, 0);
                ctx.lineTo(finalSize * 1.5, 0);
                ctx.moveTo(0, -finalSize * 1.5);
                ctx.lineTo(0, finalSize * 1.5);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    update(deltaTime) {
        // Mise à jour des particules actives
        this.particules = this.particulePool.filter(p => p.active);
        
        this.particules.forEach(particle => {
            // Mouvement orbital
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Vieillissement
            particle.life -= deltaTime;
            
            // Mise à jour du scintillement
            particle.twinkle += deltaTime * 0.003 * (0.8 + Math.random() * 0.4);
            
            // Attraction gravitationnelle vers le centre
            const dx = this.centerX - particle.x;
            const dy = this.centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.auraRadius * 1.2) {
                // Particule trop loin, on la ramène
                const force = 0.00005 * deltaTime;
                particle.vx += dx * force;
                particle.vy += dy * force;
            }
            
            // Mort de la particule
            if (particle.life <= 0) {
                particle.active = false;
            }
        });
    }

    destroy() {
        this.particules = [];
        this.particulePool = [];
        this.prismColors = null;
    }
}