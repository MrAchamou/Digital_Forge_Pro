class WaveSurfEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'oceanic-wave-surfing-dynamics-046',
            name: 'Dynamiques de Surf Océanique',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                amplitude: { type: 'range', min: 0.3, max: 1.5, default: 0.8 },
                frequence: { type: 'range', min: 0.5, max: 2.5, default: 1.2 },
                turbulence: { type: 'range', min: 0, max: 1, default: 0.4 },
                eclaboussures: { type: 'range', min: 0, max: 1, default: 0.7 }
            }
        });

        // Variables de l'effet
        this.temps = 0;
        this.waveOffset = 0;
        this.currentWavePhase = 0;
        this.waveAmplitude = 60;
        this.waveFrequency = 0.008;
        this.surfPosition = { x: 0, y: 0 };
        this.surfVelocity = { x: 2, y: 0 };
        this.surfRotation = 0;
        this.targetRotation = 0;
        
        // Système de vagues multiples
        this.waveData = [];
        this.initializeWaves();
        
        // Particules d'éclaboussures
        this.splashParticles = [];
        this.maxParticles = 50;
        this.particlePool = [];
        this.initializeParticlePool();
        
        // Profil de vague complexe
        this.waveProfile = [];
        this.profileResolution = 200;
        this.generateWaveProfile();
        
        // Animation de tube
        this.tubeIntensity = 0;
        this.tubePosition = 0;
        this.inTube = false;
        
        // Variations océaniques
        this.oceanVariation = {
            swellDirection: Math.random() * Math.PI * 2,
            swellIntensity: 0.5 + Math.random() * 0.5,
            windEffect: Math.random() * 0.3,
            tideLevel: Math.random() * 20 - 10
        };
    }

    initializeWaves() {
        // Création de multiples couches de vagues pour réalisme
        this.waveData = [
            { amplitude: 80, frequency: 0.006, speed: 1.2, phase: 0 },
            { amplitude: 40, frequency: 0.012, speed: 0.8, phase: Math.PI * 0.3 },
            { amplitude: 25, frequency: 0.018, speed: 1.5, phase: Math.PI * 0.7 },
            { amplitude: 15, frequency: 0.025, speed: 2.1, phase: Math.PI * 1.2 }
        ];
    }

    initializeParticlePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 0, maxLife: 1,
                size: 0, opacity: 0,
                active: false
            });
        }
    }

    generateWaveProfile() {
        this.waveProfile = [];
        for (let i = 0; i < this.profileResolution; i++) {
            const x = (i / this.profileResolution) * 800;
            this.waveProfile.push({
                x: x,
                baseY: 300,
                currentY: 300,
                slope: 0,
                intensity: 1
            });
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Position initiale de surf
        this.surfPosition.x = element.x;
        this.surfPosition.y = element.y;
        
        // Génération du premier profil de vague
        this.updateWaveProfile();
    }

    updateWaveProfile() {
        const params = this.getParameters();
        const time = this.temps * 0.001 * params.vitesse;
        
        for (let i = 0; i < this.waveProfile.length; i++) {
            const point = this.waveProfile[i];
            const x = point.x + this.waveOffset;
            
            // Combinaison de multiples vagues pour profil naturel
            let totalY = point.baseY + this.oceanVariation.tideLevel;
            let totalSlope = 0;
            
            this.waveData.forEach(wave => {
                const waveX = x * wave.frequency + time * wave.speed + wave.phase;
                const waveY = Math.sin(waveX) * wave.amplitude * params.amplitude;
                const slopeY = Math.cos(waveX) * wave.amplitude * wave.frequency * params.amplitude;
                
                // Ajout de turbulence océanique
                const turbulence = this.generateTurbulence(x, time) * params.turbulence * wave.amplitude * 0.3;
                
                totalY += waveY + turbulence;
                totalSlope += slopeY;
            });
            
            // Effet de houle directionnelle
            const swellEffect = Math.sin(x * 0.003 + time * 0.5 + this.oceanVariation.swellDirection) 
                             * this.oceanVariation.swellIntensity * 30;
            totalY += swellEffect;
            
            point.currentY = totalY;
            point.slope = totalSlope * 0.1;
            
            // Calcul de l'intensité pour effets de tube
            const tubeZone = this.calculateTubeZone(point, i);
            point.intensity = tubeZone;
        }
    }

    generateTurbulence(x, time) {
        // Simulation de turbulence océanique avec multiple octaves
        let turbulence = 0;
        let amplitude = 1;
        let frequency = 0.02;
        
        for (let octave = 0; octave < 4; octave++) {
            turbulence += Math.sin(x * frequency + time * (2 + octave)) * amplitude;
            turbulence += Math.cos(x * frequency * 1.3 + time * (1.5 + octave * 0.7)) * amplitude * 0.7;
            amplitude *= 0.6;
            frequency *= 2.1;
        }
        
        return turbulence * this.oceanVariation.windEffect;
    }

    calculateTubeZone(point, index) {
        // Détection des zones de tube (vagues qui se replient)
        if (index < 2 || index >= this.waveProfile.length - 2) return 0;
        
        const prev = this.waveProfile[index - 1];
        const next = this.waveProfile[index + 1];
        const curvature = (prev.currentY + next.currentY - 2 * point.currentY);
        
        // Tube formé quand courbure négative significative
        return Math.max(0, -curvature * 0.02);
    }

    updateSurfPosition() {
        // Trouver la position sur la vague la plus proche
        let closestPoint = null;
        let minDistance = Infinity;
        let pointIndex = 0;
        
        for (let i = 0; i < this.waveProfile.length; i++) {
            const point = this.waveProfile[i];
            const distance = Math.abs(point.x - this.waveOffset - this.surfPosition.x);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
                pointIndex = i;
            }
        }
        
        if (closestPoint) {
            // Position verticale suit la vague
            const targetY = closestPoint.currentY - this.element.height * 0.7;
            this.surfPosition.y += (targetY - this.surfPosition.y) * 0.15;
            
            // Rotation selon la pente de la vague
            this.targetRotation = Math.atan(closestPoint.slope) * 0.7;
            
            // Effet de tube
            this.tubeIntensity = closestPoint.intensity;
            this.inTube = this.tubeIntensity > 0.3;
            
            // Vitesse adaptée à la pente
            const slopeSpeed = 1 + Math.abs(closestPoint.slope) * 0.5;
            this.surfVelocity.x = this.getParameters().vitesse * slopeSpeed;
            
            // Génération d'éclaboussures aux points de contact
            if (Math.random() < this.getParameters().eclaboussures * 0.3) {
                this.createSplash(this.surfPosition.x, closestPoint.currentY, closestPoint.slope);
            }
        }
        
        // Rotation fluide
        this.surfRotation += (this.targetRotation - this.surfRotation) * 0.1;
        
        // Mouvement horizontal continu
        this.surfPosition.x += this.surfVelocity.x;
        this.waveOffset -= this.surfVelocity.x;
        
        // Reset cyclique
        if (this.waveOffset < -800) {
            this.waveOffset += 800;
            this.generateNewWaveSession();
        }
    }

    generateNewWaveSession() {
        // Nouvelle session avec vagues différentes
        this.waveData.forEach(wave => {
            wave.amplitude *= (0.7 + Math.random() * 0.6); // Variation amplitude
            wave.phase += (Math.random() - 0.5) * Math.PI; // Nouveau déphasage
        });
        
        // Nouvelles conditions océaniques
        this.oceanVariation.swellDirection += (Math.random() - 0.5) * 0.5;
        this.oceanVariation.swellIntensity = 0.4 + Math.random() * 0.6;
        this.oceanVariation.windEffect = Math.random() * 0.4;
        this.oceanVariation.tideLevel += (Math.random() - 0.5) * 10;
    }

    createSplash(x, y, slope) {
        const params = this.getParameters();
        
        for (let i = 0; i < 5; i++) {
            const particle = this.getPooledParticle();
            if (!particle) break;
            
            particle.x = x + (Math.random() - 0.5) * 20;
            particle.y = y + (Math.random() - 0.5) * 10;
            
            // Vitesse influencée par la pente
            const slopeInfluence = slope * 2;
            particle.vx = (Math.random() - 0.5) * 8 + slopeInfluence;
            particle.vy = -Math.random() * 12 - 3;
            
            particle.life = 0;
            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.size = 2 + Math.random() * 4;
            particle.opacity = 0.8;
            particle.active = true;
        }
    }

    getPooledParticle() {
        return this.particlePool.find(p => !p.active);
    }

    updateParticles(deltaTime) {
        const dt = deltaTime * 0.001;
        
        this.splashParticles = this.splashParticles.filter(particle => {
            particle.life += dt;
            
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                return false;
            }
            
            // Physique aquatique
            particle.x += particle.vx * dt * 60;
            particle.y += particle.vy * dt * 60;
            particle.vy += 400 * dt; // Gravité
            particle.vx *= 0.99; // Résistance
            
            // Fade out
            const lifeRatio = particle.life / particle.maxLife;
            particle.opacity = 0.8 * (1 - lifeRatio);
            particle.size *= 0.998;
            
            return true;
        });
        
        // Mise à jour du pool
        this.particlePool.forEach(particle => {
            if (particle.active) {
                particle.life += dt;
                
                if (particle.life >= particle.maxLife) {
                    particle.active = false;
                    return;
                }
                
                particle.x += particle.vx * dt * 60;
                particle.y += particle.vy * dt * 60;
                particle.vy += 400 * dt;
                particle.vx *= 0.99;
                
                const lifeRatio = particle.life / particle.maxLife;
                particle.opacity = 0.8 * (1 - lifeRatio);
                particle.size *= 0.998;
            }
        });
    }

    render(ctx, element, deltaTime) {
        this.updateWaveProfile();
        this.updateSurfPosition();
        this.updateParticles(deltaTime);
        
        ctx.save();
        
        // Rendu des vagues (optionnel pour debug)
        this.renderWaveDebug(ctx);
        
        // Effet de tube environnemental
        if (this.inTube) {
            this.renderTubeEffect(ctx);
        }
        
        // Rendu de l'élément en surf
        this.renderSurfingElement(ctx, element);
        
        // Rendu des éclaboussures
        this.renderSplashes(ctx);
        
        ctx.restore();
    }

    renderWaveDebug(ctx) {
        // Ligne de vague (pour visualisation - peut être supprimée)
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.waveProfile.length; i++) {
            const point = this.waveProfile[i];
            const x = point.x + this.waveOffset;
            
            if (i === 0) {
                ctx.moveTo(x, point.currentY);
            } else {
                ctx.lineTo(x, point.currentY);
            }
        }
        ctx.stroke();
    }

    renderTubeEffect(ctx) {
        // Effet visuel de tube avec gradient
        const gradient = ctx.createRadialGradient(
            this.surfPosition.x, this.surfPosition.y, 0,
            this.surfPosition.x, this.surfPosition.y, 200
        );
        
        const alpha = this.tubeIntensity * 0.3;
        gradient.addColorStop(0, `rgba(0, 200, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(0, 150, 200, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 100, 150, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Particules de brume dans le tube
        if (Math.random() < 0.7) {
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * this.tubeIntensity})`;
                const x = this.surfPosition.x + (Math.random() - 0.5) * 100;
                const y = this.surfPosition.y + (Math.random() - 0.5) * 50;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 8 + 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    renderSurfingElement(ctx, element) {
        ctx.save();
        
        // Position et rotation de surf
        ctx.translate(this.surfPosition.x + element.width/2, this.surfPosition.y + element.height/2);
        ctx.rotate(this.surfRotation);
        
        // Effet de vitesse avec motion blur simulé
        const speed = Math.abs(this.surfVelocity.x);
        if (speed > 2) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = speed * 2;
            ctx.shadowOffsetX = -this.surfVelocity.x * 0.5;
        }
        
        // Rendu de l'élément
        ctx.globalAlpha = element.opacity;
        
        if (element.content && element.content.tagName === 'IMG') {
            ctx.drawImage(
                element.content,
                -element.width/2, -element.height/2,
                element.width, element.height
            );
        } else {
            // Fallback rectangle
            ctx.fillStyle = '#0066CC';
            ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
        }
        
        ctx.restore();
    }

    renderSplashes(ctx) {
        ctx.save();
        
        // Rendu des particules actives du pool
        this.particlePool.forEach(particle => {
            if (!particle.active) return;
            
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Traînée pour effet de mouvement
            if (Math.abs(particle.vx) > 2 || Math.abs(particle.vy) > 2) {
                ctx.strokeStyle = `rgba(135, 206, 235, ${particle.opacity * 0.5})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particle.x - particle.vx * 0.1, particle.y - particle.vy * 0.1);
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }

    update(deltaTime) {
        this.temps += deltaTime;
        
        // Mise à jour des phases de vagues
        this.waveData.forEach(wave => {
            wave.phase += deltaTime * 0.001 * wave.speed;
        });
        
        // Évolution des conditions océaniques
        this.oceanVariation.swellDirection += deltaTime * 0.0001;
        this.oceanVariation.windEffect += Math.sin(this.temps * 0.001) * 0.001;
    }

    destroy() {
        this.waveData = null;
        this.waveProfile = null;
        this.splashParticles = null;
        this.particlePool = null;
        this.oceanVariation = null;
    }
}