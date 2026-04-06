class MirrorRealityEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'autonomous-reflection-behavior-053',
            name: 'Réflexion Autonome Divergente',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.4 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.75 },
                couleur: { type: 'color', default: '#87ceeb' },
                desync: { type: 'range', min: 0, max: 1, default: 0.8 },
                autonomie: { type: 'range', min: 0, max: 1, default: 0.9 }
            }
        });

        // Variables temporelles
        this.temps = 0;
        this.cycleDuration = 12000; // 12 secondes
        
        // État de la réalité principale
        this.realityState = {
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            opacity: 1,
            color: { r: 135, g: 206, b: 235 },
            energy: 1
        };
        
        // État du reflet (autonome)
        this.mirrorState = {
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            opacity: 0.8,
            color: { r: 100, g: 150, b: 200 },
            energy: 1,
            autonomyLevel: 0,
            rebellion: 0
        };
        
        // Délai temporel entre réalité et reflet
        this.temporalBuffer = [];
        this.maxBufferSize = 180; // 3 secondes à 60fps
        this.currentDelay = 60; // 1 seconde de base
        
        // Actions autonomes du reflet
        this.autonomousActions = [];
        this.maxActions = 8;
        this.initAutonomousActions();
        
        // Versions alternatives révélées
        this.alternativeVersions = [];
        this.maxVersions = 5;
        this.initAlternativeVersions();
        
        // Interface miroir
        this.mirrorSurface = this.generateMirrorSurface();
        this.surfaceRipples = [];
        this.maxRipples = 12;
        
        // Interactions bidirectionnelles
        this.interactions = [];
        this.maxInteractions = 6;
        this.initInteractions();
        
        // Particules de transition réalité/reflet
        this.transitionParticles = [];
        this.maxParticles = 100;
        this.initTransitionParticles();
        
        // Variables de rebellion du reflet
        this.rebellionCycle = Math.random() * Math.PI * 2;
        this.uniqueMirrorId = Math.random() * 1000;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Position du miroir
        this.mirrorLine = element.y + element.height + 20;
        
        // Initialisation du buffer temporel
        this.initTemporalBuffer();
    }

    initTemporalBuffer() {
        // Pré-remplir le buffer avec l'état initial
        for (let i = 0; i < this.maxBufferSize; i++) {
            this.temporalBuffer.push({
                position: { ...this.realityState.position },
                rotation: this.realityState.rotation,
                scale: this.realityState.scale,
                opacity: this.realityState.opacity,
                timestamp: this.temps - i * 16.67
            });
        }
    }

    initAutonomousActions() {
        const actionTypes = [
            'wave', 'nod', 'stretch', 'fade', 'rotate', 'drift', 'pulse', 'shake'
        ];
        
        for (let i = 0; i < this.maxActions; i++) {
            this.autonomousActions.push({
                type: actionTypes[i % actionTypes.length],
                intensity: Math.random(),
                frequency: Math.random() * 0.02 + 0.005,
                phase: Math.random() * Math.PI * 2,
                duration: Math.random() * 3000 + 1000,
                active: false,
                progress: 0,
                autonomyRequired: i * 0.125 // Niveau d'autonomie requis
            });
        }
    }

    initAlternativeVersions() {
        for (let i = 0; i < this.maxVersions; i++) {
            this.alternativeVersions.push({
                id: i,
                color: {
                    r: Math.floor(Math.random() * 255),
                    g: Math.floor(Math.random() * 255),  
                    b: Math.floor(Math.random() * 255)
                },
                scale: 0.7 + Math.random() * 0.6,
                rotation: (Math.random() - 0.5) * Math.PI * 0.5,
                opacity: 0,
                visibility: 0,
                alternativeLevel: i / this.maxVersions,
                personality: Math.random() // Personnalité unique
            });
        }
    }

    generateMirrorSurface() {
        const surface = {
            segments: [],
            distortion: [],
            clarity: 0.9
        };
        
        // Segments de la surface miroir
        for (let i = 0; i < 50; i++) {
            surface.segments.push({
                x: i / 49,
                y: 0,
                normalY: Math.sin(i * 0.3) * 0.02,
                reflectivity: 0.8 + Math.random() * 0.2
            });
        }
        
        // Distorsions locales
        for (let i = 0; i < 20; i++) {
            surface.distortion.push({
                x: Math.random(),
                y: Math.random(),
                radius: Math.random() * 0.1 + 0.05,
                intensity: Math.random() * 0.3,
                frequency: Math.random() * 0.01 + 0.002
            });
        }
        
        return surface;
    }

    initInteractions() {
        for (let i = 0; i < this.maxInteractions; i++) {
            this.interactions.push({
                type: Math.floor(Math.random() * 3), // 0: pull, 1: push, 2: exchange
                sourceReality: Math.random() > 0.5, // true = reality→mirror, false = mirror→reality
                position: { x: Math.random(), y: Math.random() },
                strength: 0,
                active: false,
                progress: 0,
                duration: Math.random() * 2000 + 1000
            });
        }
    }

    initTransitionParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.transitionParticles.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                size: 1,
                opacity: 0,
                life: 0,
                maxLife: 1,
                dimension: 0, // 0 = reality, 1 = mirror
                transitioning: false,
                active: false,
                color: { r: 255, g: 255, b: 255 }
            });
        }
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Mise à jour de l'état de la réalité
        this.updateRealityState();
        
        // Mise à jour du buffer temporel
        this.updateTemporalBuffer();
        
        // Calcul du niveau d'autonomie du reflet
        this.updateMirrorAutonomy();
        
        // Mise à jour de l'état du reflet (avec autonomie)
        this.updateMirrorState();
        
        // Mise à jour des actions autonomes
        this.updateAutonomousActions(deltaTime);
        
        // Mise à jour des versions alternatives
        this.updateAlternativeVersions();
        
        // Mise à jour de la surface miroir
        this.updateMirrorSurface();
        
        // Mise à jour des interactions bidirectionnelles
        this.updateInteractions(deltaTime);
        
        // Mise à jour des particules de transition
        this.updateTransitionParticles(deltaTime);
        
        // Génération d'ondulations sur le miroir
        if (Math.random() < 0.15) {
            this.createSurfaceRipple();
        }
        
        // Génération de nouvelles particules
        if (Math.random() < 0.3) {
            this.spawnTransitionParticle();
        }
    }

    updateRealityState() {
        // Animation naturelle de la réalité
        this.realityState.position.x = Math.sin(this.temps * 0.001) * 10;
        this.realityState.position.y = Math.cos(this.temps * 0.0008) * 5;
        this.realityState.rotation = Math.sin(this.temps * 0.0005) * 0.1;
        this.realityState.scale = 1 + Math.sin(this.temps * 0.002) * 0.05;
        
        // Oscillation de l'énergie
        this.realityState.energy = 0.8 + Math.sin(this.temps * 0.0015) * 0.2;
    }

    updateTemporalBuffer() {
        // Ajout du nouvel état au buffer
        this.temporalBuffer.unshift({
            position: { ...this.realityState.position },
            rotation: this.realityState.rotation,
            scale: this.realityState.scale,
            opacity: this.realityState.opacity,
            timestamp: this.temps
        });
        
        // Limitation de la taille du buffer
        if (this.temporalBuffer.length > this.maxBufferSize) {
            this.temporalBuffer.pop();
        }
        
        // Variation du délai temporel
        const delayVariation = Math.sin(this.temps * 0.0003) * 30 + 30;
        this.currentDelay = Math.floor(60 + delayVariation * this.parameters.desync.value);
    }

    updateMirrorAutonomy() {
        // Calcul du niveau d'autonomie basé sur le temps et les paramètres
        const baseAutonomy = Math.sin(this.temps * 0.0002) * 0.5 + 0.5;
        const rebellionFactor = Math.sin(this.rebellionCycle + this.temps * 0.0001) * 0.3 + 0.7;
        
        this.mirrorState.autonomyLevel = baseAutonomy * rebellionFactor * this.parameters.autonomie.value;
        
        // Niveau de rébellion du reflet
        this.mirrorState.rebellion = Math.max(0, this.mirrorState.autonomyLevel - 0.6);
    }

    updateMirrorState() {
        const delayedState = this.temporalBuffer[Math.min(this.currentDelay, this.temporalBuffer.length - 1)];
        
        if (delayedState) {
            // Base : copie de l'état retardé
            let targetPosition = { ...delayedState.position };
            let targetRotation = delayedState.rotation;
            let targetScale = delayedState.scale;
            
            // Application de l'autonomie
            const autonomy = this.mirrorState.autonomyLevel;
            
            if (autonomy > 0.2) {
                // Le reflet commence à dévier
                targetPosition.x += Math.sin(this.temps * 0.0012 + this.uniqueMirrorId) * autonomy * 20;
                targetPosition.y += Math.cos(this.temps * 0.001 + this.uniqueMirrorId) * autonomy * 15;
                targetRotation += Math.sin(this.temps * 0.0008) * autonomy * 0.3;
                targetScale *= (1 + Math.sin(this.temps * 0.0015) * autonomy * 0.2);
            }
            
            // Interpolation douce vers l'état cible
            const smooth = 0.1;
            this.mirrorState.position.x += (targetPosition.x - this.mirrorState.position.x) * smooth;
            this.mirrorState.position.y += (targetPosition.y - this.mirrorState.position.y) * smooth;
            this.mirrorState.rotation += (targetRotation - this.mirrorState.rotation) * smooth;
            this.mirrorState.scale += (targetScale - this.mirrorState.scale) * smooth;
            
            // Évolution de la couleur du reflet
            if (autonomy > 0.5) {
                const colorShift = Math.sin(this.temps * 0.0005) * autonomy;
                this.mirrorState.color.r = Math.floor(135 + colorShift * 50);
                this.mirrorState.color.g = Math.floor(206 - colorShift * 30);
                this.mirrorState.color.b = Math.floor(235 + colorShift * 20);
            }
        }
    }

    updateAutonomousActions(deltaTime) {
        this.autonomousActions.forEach(action => {
            // Activation basée sur le niveau d'autonomie
            if (this.mirrorState.autonomyLevel >= action.autonomyRequired) {
                if (!action.active && Math.random() < 0.02) {
                    action.active = true;
                    action.progress = 0;
                }
            }
            
            if (action.active) {
                action.progress += deltaTime;
                
                // Application de l'action
                const progress = Math.min(1, action.progress / action.duration);
                const intensity = Math.sin(progress * Math.PI) * action.intensity;
                
                switch(action.type) {
                    case 'wave':
                        this.mirrorState.position.x += Math.sin(this.temps * action.frequency) * intensity * 15;
                        break;
                    case 'nod':
                        this.mirrorState.rotation += Math.sin(this.temps * action.frequency) * intensity * 0.2;
                        break;
                    case 'stretch':
                        this.mirrorState.scale += Math.sin(this.temps * action.frequency) * intensity * 0.1;
                        break;
                    case 'fade':
                        this.mirrorState.opacity = 0.8 - intensity * 0.3;
                        break;
                    case 'pulse':
                        this.mirrorState.energy = 1 + Math.sin(this.temps * action.frequency * 10) * intensity;
                        break;
                }
                
                // Fin de l'action
                if (action.progress >= action.duration) {
                    action.active = false;
                    action.progress = 0;
                }
            }
        });
    }

    updateAlternativeVersions() {
        this.alternativeVersions.forEach((version, index) => {
            // Visibilité basée sur l'autonomie et la rébellion
            const shouldBeVisible = this.mirrorState.rebellion > version.alternativeLevel;
            
            if (shouldBeVisible) {
                version.visibility = Math.min(1, version.visibility + 0.02);
                version.opacity = version.visibility * this.mirrorState.rebellion * 0.4;
                
                // Animation unique par version
                version.rotation += Math.sin(this.temps * 0.0003 + version.personality * 10) * 0.01;
                version.scale = (0.7 + Math.random() * 0.6) * (1 + Math.sin(this.temps * 0.001 + index) * 0.1);
            } else {
                version.visibility = Math.max(0, version.visibility - 0.01);
                version.opacity = version.visibility * 0.2;
            }
        });
    }

    updateMirrorSurface() {
        // Mise à jour des distorsions de la surface
        this.mirrorSurface.distortion.forEach(distortion => {
            distortion.intensity = Math.sin(this.temps * distortion.frequency + distortion.x * 10) * 0.2;
        });
        
        // Clarté du miroir basée sur l'autonomie
        this.mirrorSurface.clarity = 0.9 - this.mirrorState.autonomyLevel * 0.3;
        
        // Mise à jour des ondulations
        this.surfaceRipples = this.surfaceRipples.filter(ripple => {
            ripple.life += 0.02;
            ripple.radius += ripple.speed;
            ripple.opacity = (1 - ripple.life) * 0.6;
            return ripple.life < 1;
        });
    }

    updateInteractions(deltaTime) {
        this.interactions.forEach(interaction => {
            if (!interaction.active && Math.random() < 0.015 && this.mirrorState.autonomyLevel > 0.3) {
                interaction.active = true;
                interaction.progress = 0;
                interaction.strength = Math.random() * this.mirrorState.rebellion;
            }
            
            if (interaction.active) {
                interaction.progress += deltaTime;
                const progress = Math.min(1, interaction.progress / interaction.duration);
                interaction.strength = Math.sin(progress * Math.PI) * this.mirrorState.rebellion;
                
                // Application de l'interaction
                if (interaction.sourceReality) {
                    // Réalité influence le reflet
                    this.mirrorState.position.x += Math.sin(progress * Math.PI * 4) * interaction.strength * 5;
                } else {
                    // Reflet influence la réalité (paradoxal!)
                    this.realityState.position.x += Math.cos(progress * Math.PI * 3) * interaction.strength * 2;
                }
                
                // Fin de l'interaction
                if (interaction.progress >= interaction.duration) {
                    interaction.active = false;
                }
            }
        });
    }

    updateTransitionParticles(deltaTime) {
        this.transitionParticles.forEach(particle => {
            if (!particle.active) return;
            
            particle.life += deltaTime / 1000;
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            
            // Transition entre dimensions
            if (particle.transitioning) {
                particle.dimension += (particle.targetDimension - particle.dimension) * 0.05;
                
                // Changement de couleur pendant la transition
                const t = Math.abs(particle.dimension - 0.5) * 2;
                particle.color.r = Math.floor(255 * t + 135 * (1-t));
                particle.color.g = Math.floor(255 * t + 206 * (1-t));
                particle.color.b = Math.floor(255 * t + 235 * (1-t));
            }
            
            // Opacité basée sur la vie et la dimension
            const lifeRatio = Math.min(1, particle.life / particle.maxLife);
            particle.opacity = Math.sin(lifeRatio * Math.PI) * 0.8;
            
            // Désactivation
            if (particle.life >= particle.maxLife) {
                particle.active = false;
            }
        });
    }

    createSurfaceRipple() {
        if (this.surfaceRipples.length >= this.maxRipples) return;
        
        this.surfaceRipples.push({
            x: Math.random(),
            y: 0.5,
            radius: 0,
            speed: Math.random() * 0.02 + 0.01,
            life: 0,
            opacity: 0.6,
            intensity: Math.random() * 0.5 + 0.3
        });
    }

    spawnTransitionParticle() {
        const particle = this.transitionParticles.find(p => !p.active);
        if (!particle) return;
        
        particle.active = true;
        particle.x = this.element.x + Math.random() * this.element.width;
        particle.y = this.element.y + Math.random() * this.element.height * 2; // Include mirror space
        particle.vx = (Math.random() - 0.5) * 2;
        particle.vy = (Math.random() - 0.5) * 1;
        particle.size = Math.random() * 3 + 1;
        particle.life = 0;
        particle.maxLife = Math.random() * 3 + 2;
        particle.dimension = Math.random() > 0.5 ? 0 : 1;
        particle.transitioning = Math.random() < 0.3;
        if (particle.transitioning) {
            particle.targetDimension = 1 - particle.dimension;
        }
        particle.color = { r: 255, g: 255, b: 255 };
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Rendu de l'image de la réalité
        this.renderReality(ctx, element);
        
        // Rendu de la surface miroir
        this.renderMirrorSurface(ctx, element);
        
        // Rendu du reflet principal
        this.renderMirrorReflection(ctx, element);
        
        // Rendu des versions alternatives
        this.renderAlternativeVersions(ctx, element);
        
        // Rendu des interactions bidirectionnelles
        this.renderInteractions(ctx, element);
        
        // Rendu des particules de transition
        this.renderTransitionParticles(ctx, element);
        
        ctx.restore();
    }

    renderReality(ctx, element) {
        ctx.save();
        
        // Application des transformations de la réalité
        ctx.translate(
            element.x + element.width/2 + this.realityState.position.x,
            element.y + element.height/2 + this.realityState.position.y
        );
        ctx.rotate(this.realityState.rotation);
        ctx.scale(this.realityState.scale, this.realityState.scale);
        
        // Effet d'énergie
        ctx.globalAlpha = this.realityState.opacity * this.realityState.energy;
        
        // Couleur de la réalité
        const r = this.realityState.color.r;
        const g = this.realityState.color.g;
        const b = this.realityState.color.b;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Image principale
        ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
        
        // Aura d'énergie
        if (this.realityState.energy > 1) {
            ctx.globalAlpha = (this.realityState.energy - 1) * 0.3;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.lineWidth = 2;
            ctx.strokeRect(-element.width/2 - 2, -element.height/2 - 2, element.width + 4, element.height + 4);
        }
        
        ctx.restore();
    }

    renderMirrorSurface(ctx, element) {
        const mirrorY = this.mirrorLine;
        
        ctx.save();
        
        // Surface du miroir avec distorsions
        ctx.strokeStyle = `rgba(200, 200, 255, ${this.mirrorSurface.clarity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.mirrorSurface.segments.length; i++) {
            const segment = this.mirrorSurface.segments[i];
            let x = element.x + segment.x * element.width;
            let y = mirrorY + segment.normalY * 10;
            
            // Application des distorsions locales
            this.mirrorSurface.distortion.forEach(distortion => {
                const distance = Math.abs(segment.x - distortion.x);
                if (distance < distortion.radius) {
                    const influence = (1 - distance / distortion.radius);
                    y += Math.sin(this.temps * distortion.frequency + distortion.x * 20) * distortion.intensity * influence * 15;
                }
            });
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Rendu des ondulations
        this.surfaceRipples.forEach(ripple => {
            ctx.globalAlpha = ripple.opacity;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(
                element.x + ripple.x * element.width,
                mirrorY,
                ripple.radius * element.width,
                0, Math.PI * 2
            );
            ctx.stroke();
        });
        
        ctx.restore();
    }

    renderMirrorReflection(ctx, element) {
        const mirrorY = this.mirrorLine;
        
        ctx.save();
        
        // Position du reflet (inversée verticalement)
        const mirrorCenterX = element.x + element.width/2 + this.mirrorState.position.x;
        const mirrorCenterY = mirrorY + (mirrorY - (element.y + element.height/2)) + this.mirrorState.position.y;
        
        ctx.translate(mirrorCenterX, mirrorCenterY);
        ctx.rotate(this.mirrorState.rotation);
        ctx.scale(this.mirrorState.scale, -this.mirrorState.scale); // Inversion verticale
        
        // Opacité du reflet
        ctx.globalAlpha = this.mirrorState.opacity * this.parameters.intensite.value;
        
        // Couleur du reflet (peut être différente)
        const r = this.mirrorState.color.r;
        const g = this.mirrorState.color.g;
        const b = this.mirrorState.color.b;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Image reflet
        ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
        
        // Effets d'autonomie visibles
        if (this.mirrorState.autonomyLevel > 0.4) {
            ctx.globalAlpha = this.mirrorState.autonomyLevel * 0.4;
            
            // Aura d'autonomie
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, element.width);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(-element.width/2 - 10, -element.height/2 - 10, element.width + 20, element.height + 20);
        }
        
        // Indicateur de rébellion
        if (this.mirrorState.rebellion > 0.5) {
            ctx.globalAlpha = this.mirrorState.rebellion;
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(-element.width/2, -element.height/2, element.width, element.height);
        }
        
        ctx.restore();
    }

    renderAlternativeVersions(ctx, element) {
        const mirrorY = this.mirrorLine;
        
        this.alternativeVersions.forEach((version, index) => {
            if (version.opacity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = version.opacity;
            
            // Position décalée pour chaque version alternative
            const offsetX = Math.sin(index * 2 + this.temps * 0.001) * 30;
            const offsetY = Math.cos(index * 1.5 + this.temps * 0.0008) * 20;
            
            const mirrorCenterX = element.x + element.width/2 + offsetX;
            const mirrorCenterY = mirrorY + (mirrorY - (element.y + element.height/2)) + offsetY;
            
            ctx.translate(mirrorCenterX, mirrorCenterY);
            ctx.rotate(version.rotation);
            ctx.scale(version.scale, -version.scale);
            
            // Couleur unique de cette version
            const r = version.color.r;
            const g = version.color.g;
            const b = version.color.b;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
            
            // Image de la version alternative
            ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
            
            // Effet de "ghosting"
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(-element.width/2, -element.height/2, element.width, element.height);
            
            ctx.restore();
        });
    }

    renderInteractions(ctx, element) {
        this.interactions.forEach(interaction => {
            if (!interaction.active || interaction.strength <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = interaction.strength;
            
            const x = element.x + interaction.position.x * element.width;
            const realityY = element.y + interaction.position.y * element.height;
            const mirrorY = this.mirrorLine + (this.mirrorLine - realityY);
            
            // Ligne d'interaction entre réalité et reflet
            if (interaction.sourceReality) {
                ctx.strokeStyle = 'rgba(135, 206, 235, 0.8)';
            } else {
                ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
            }
            
            ctx.lineWidth = interaction.strength * 3;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(x, realityY);
            ctx.lineTo(x, mirrorY);
            ctx.stroke();
            
            // Particules d'échange
            const particleCount = Math.floor(interaction.strength * 5);
            for (let i = 0; i < particleCount; i++) {
                const progress = (i / particleCount + this.temps * 0.005) % 1;
                const particleY = realityY + (mirrorY - realityY) * progress;
                
                ctx.fillStyle = interaction.sourceReality ? 
                    'rgba(135, 206, 235, 0.6)' : 'rgba(255, 100, 100, 0.6)';
                ctx.beginPath();
                ctx.arc(x + Math.sin(progress * Math.PI * 4) * 10, particleY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
    }

    renderTransitionParticles(ctx, element) {
        this.transitionParticles.forEach(particle => {
            if (!particle.active || particle.opacity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            
            // Couleur basée sur la dimension
            const r = particle.color.r;
            const g = particle.color.g;
            const b = particle.color.b;
            const alpha = particle.dimension < 0.5 ? 0.8 : 0.6;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            
            // Taille basée sur la dimension
            const size = particle.size * (1 + Math.abs(particle.dimension - 0.5));
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Trail de transition
            if (particle.transitioning) {
                ctx.globalAlpha *= 0.3;
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
                ctx.lineTo(particle.x + particle.vx * 5, particle.y + particle.vy * 5);
                ctx.stroke();
            }
            
            ctx.restore();
        });
    }

    destroy() {
        this.temporalBuffer = [];
        this.autonomousActions = [];
        this.alternativeVersions = [];
        this.surfaceRipples = [];
        this.interactions = [];
        this.transitionParticles = [];
        this.mirrorSurface = null;
    }
}