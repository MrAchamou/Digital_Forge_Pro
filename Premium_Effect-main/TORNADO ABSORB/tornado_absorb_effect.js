class TornadoAbsorbEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'vortex-absorption-cyclone-038',
            name: 'Absorption Cyclonique Gravitationnelle',
            category: 'IMAGE',
            version: '1.0',
            performance: 'medium',
            parameters: {
                intensite: { type: 'range', min: 0.2, max: 2.5, default: 1.4 },
                vitesse: { type: 'range', min: 0.3, max: 3.0, default: 1.2 },
                gravite: { type: 'range', min: 0.5, max: 3.0, default: 1.8 },
                coriolis: { type: 'range', min: 0.1, max: 2.0, default: 0.8 },
                densite: { type: 'range', min: 0.3, max: 1.5, default: 1.0 },
                particules: { type: 'range', min: 50, max: 300, default: 150 }
            }
        });

        // Variables physiques du vortex
        this.temps = 0;
        this.imageData = null;
        this.pixelParticles = [];
        this.orbitalRings = [];
        this.vortexCenter = { x: 0, y: 0 };
        this.vortexRadius = 0;
        this.maxRadius = 0;
        
        // Grille de déformation spatio-temporelle
        this.deformationGrid = [];
        this.velocityField = [];
        this.densityField = [];
        
        // Pools d'objets pour performance
        this.particlePool = [];
        this.ringPool = [];
        
        // Constantes physiques simulées
        this.SCHWARZSCHILD_RADIUS = 15; // Rayon critique du vortex
        this.ESCAPE_VELOCITY = 850; // Vitesse d'échappement
        this.ANGULAR_MOMENTUM = 0.97; // Conservation du moment angulaire
        this.CORIOLIS_FORCE = 2.0; // Force de Coriolis simulée
        
        // Historique de positions pour traînées
        this.particleTrails = new Map();
        
        this.initializePools();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Centre du vortex gravitationnel
        this.vortexCenter = {
            x: element.width / 2,
            y: element.height / 2
        };
        
        this.maxRadius = Math.sqrt(element.width * element.width + element.height * element.height) / 2;
        this.vortexRadius = this.SCHWARZSCHILD_RADIUS;
        
        // Capture et analyse de l'image
        this.captureImageData();
        this.createPixelParticles();
        
        // Initialisation des grilles physiques
        this.initializeDeformationGrid();
        this.initializeVelocityField();
        this.createOrbitalRings();
    }

    captureImageData() {
        try {
            this.imageData = this.ctx.getImageData(
                this.element.x, 
                this.element.y, 
                this.element.width, 
                this.element.height
            );
        } catch(e) {
            this.imageData = this.ctx.createImageData(this.element.width, this.element.height);
        }
    }

    createPixelParticles() {
        this.pixelParticles = [];
        const data = this.imageData.data;
        const sampleRate = Math.ceil(this.element.width * this.element.height / this.parameters.particules.value);
        
        for (let y = 0; y < this.element.height; y += 4) {
            for (let x = 0; x < this.element.width; x += 4) {
                if (Math.random() < 1 / sampleRate) {
                    const index = (y * this.element.width + x) * 4;
                    
                    if (data[index + 3] > 50) { // Alpha threshold
                        const particle = this.getParticleFromPool() || this.createPixelParticle();
                        
                        particle.originalX = x;
                        particle.originalY = y;
                        particle.x = x;
                        particle.y = y;
                        particle.color = {
                            r: data[index],
                            g: data[index + 1],
                            b: data[index + 2],
                            a: data[index + 3] / 255
                        };
                        
                        // Propriétés physiques
                        const distanceToCenter = this.getDistance(x, y, this.vortexCenter.x, this.vortexCenter.y);
                        particle.mass = (particle.color.r + particle.color.g + particle.color.b) / (3 * 255) + 0.1;
                        particle.orbitalRadius = distanceToCenter;
                        particle.angularVelocity = this.calculateOrbitalVelocity(distanceToCenter, particle.mass);
                        particle.angle = Math.atan2(y - this.vortexCenter.y, x - this.vortexCenter.x);
                        
                        // État dynamique
                        particle.velocityX = 0;
                        particle.velocityY = 0;
                        particle.absorbed = false;
                        particle.energy = particle.mass * particle.orbitalRadius * 0.01;
                        particle.lifetime = 1.0;
                        
                        this.pixelParticles.push(particle);
                        
                        // Initialiser la traînée
                        this.particleTrails.set(particle, []);
                    }
                }
            }
        }
    }

    createPixelParticle() {
        return {
            originalX: 0, originalY: 0,
            x: 0, y: 0,
            velocityX: 0, velocityY: 0,
            color: { r: 255, g: 255, b: 255, a: 1 },
            mass: 1,
            orbitalRadius: 0,
            angularVelocity: 0,
            angle: 0,
            absorbed: false,
            energy: 0,
            lifetime: 1
        };
    }

    initializeDeformationGrid() {
        this.deformationGrid = [];
        const resolution = 20;
        
        for (let y = 0; y < this.element.height; y += resolution) {
            for (let x = 0; x < this.element.width; x += resolution) {
                const distance = this.getDistance(x, y, this.vortexCenter.x, this.vortexCenter.y);
                const deformation = this.calculateSpaceTimeDeformation(distance);
                
                this.deformationGrid.push({
                    x, y, distance,
                    deformation,
                    curvature: deformation * deformation,
                    timeDialation: Math.sqrt(1 - (2 * this.SCHWARZSCHILD_RADIUS) / Math.max(distance, this.SCHWARZSCHILD_RADIUS + 1))
                });
            }
        }
    }

    initializeVelocityField() {
        this.velocityField = [];
        const resolution = 15;
        
        for (let y = 0; y < this.element.height; y += resolution) {
            for (let x = 0; x < this.element.width; x += resolution) {
                const distance = this.getDistance(x, y, this.vortexCenter.x, this.vortexCenter.y);
                const angle = Math.atan2(y - this.vortexCenter.y, x - this.vortexCenter.x);
                
                // Vitesse tangentielle (rotation) et radiale (absorption)
                const tangentialVel = this.calculateOrbitalVelocity(distance, 1.0);
                const radialVel = -this.parameters.gravite.value * (this.SCHWARZSCHILD_RADIUS * this.SCHWARZSCHILD_RADIUS) / (distance * distance);
                
                this.velocityField.push({
                    x, y,
                    vx: Math.cos(angle + Math.PI/2) * tangentialVel + Math.cos(angle) * radialVel,
                    vy: Math.sin(angle + Math.PI/2) * tangentialVel + Math.sin(angle) * radialVel,
                    magnitude: Math.sqrt(tangentialVel * tangentialVel + radialVel * radialVel)
                });
            }
        }
    }

    createOrbitalRings() {
        this.orbitalRings = [];
        const numRings = 8 + Math.floor(this.parameters.densite.value * 4);
        
        for (let i = 0; i < numRings; i++) {
            const ring = this.getRingFromPool() || this.createOrbitalRing();
            
            ring.radius = this.SCHWARZSCHILD_RADIUS * 2 + (i * this.maxRadius / numRings);
            ring.particles = [];
            ring.angularVelocity = this.calculateOrbitalVelocity(ring.radius, 0.5);
            ring.opacity = 1 - (i / numRings) * 0.7;
            ring.thickness = 2 + (numRings - i) * 0.5;
            ring.phase = (i / numRings) * Math.PI * 2;
            
            // Particules orbitales dans l'anneau
            const particlesInRing = 12 + Math.floor(ring.opacity * 20);
            for (let j = 0; j < particlesInRing; j++) {
                const angle = (j / particlesInRing) * Math.PI * 2 + ring.phase;
                ring.particles.push({
                    angle: angle,
                    brightness: 0.5 + Math.random() * 0.5,
                    size: 1 + Math.random() * 2,
                    phase: Math.random() * Math.PI * 2
                });
            }
            
            this.orbitalRings.push(ring);
        }
    }

    createOrbitalRing() {
        return {
            radius: 0,
            particles: [],
            angularVelocity: 0,
            opacity: 1,
            thickness: 2,
            phase: 0
        };
    }

    calculateOrbitalVelocity(radius, mass) {
        // Vitesse orbitale basée sur la mécanique gravitationnelle
        const gravitationalParameter = this.SCHWARZSCHILD_RADIUS * this.parameters.gravite.value * 100;
        return Math.sqrt(gravitationalParameter / Math.max(radius, this.SCHWARZSCHILD_RADIUS)) * this.parameters.coriolis.value;
    }

    calculateSpaceTimeDeformation(distance) {
        // Courbure de l'espace-temps près du vortex
        const rs = this.SCHWARZSCHILD_RADIUS;
        if (distance <= rs) return 10; // Singularité
        
        return (rs / distance) * this.parameters.intensite.value;
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }

    initializePools() {
        // Pool de particules
        for (let i = 0; i < 500; i++) {
            this.particlePool.push(this.createPixelParticle());
        }
        
        // Pool d'anneaux orbitaux
        for (let i = 0; i < 20; i++) {
            this.ringPool.push(this.createOrbitalRing());
        }
    }

    getParticleFromPool() {
        return this.particlePool.pop();
    }

    returnParticleToPool(particle) {
        this.particlePool.push(particle);
    }

    getRingFromPool() {
        return this.ringPool.pop();
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Évolution du vortex
        this.updateVortexProperties(deltaTime);
        
        // Mise à jour des particules
        this.updatePixelParticles(deltaTime);
        
        // Mise à jour des anneaux orbitaux
        this.updateOrbitalRings(deltaTime);
        
        // Mise à jour du champ de vitesse
        this.updateVelocityField(deltaTime);
        
        // Nettoyage des particules absorbées
        this.cleanupAbsorbedParticles();
    }

    updateVortexProperties(deltaTime) {
        // Pulsation du rayon du vortex
        const pulsation = Math.sin(this.temps * 0.003) * 0.2 + 1;
        this.vortexRadius = this.SCHWARZSCHILD_RADIUS * pulsation * this.parameters.intensite.value;
        
        // Oscillation légère du centre (effet Coriolis)
        const coriolisOffset = this.parameters.coriolis.value * 2;
        this.vortexCenter.x = this.element.width / 2 + Math.sin(this.temps * 0.001) * coriolisOffset;
        this.vortexCenter.y = this.element.height / 2 + Math.cos(this.temps * 0.0013) * coriolisOffset;
    }

    updatePixelParticles(deltaTime) {
        for (let i = this.pixelParticles.length - 1; i >= 0; i--) {
            const particle = this.pixelParticles[i];
            
            if (particle.absorbed) continue;
            
            // Distance au centre du vortex
            const dx = this.vortexCenter.x - particle.x;
            const dy = this.vortexCenter.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Vérification d'absorption
            if (distance <= this.vortexRadius) {
                particle.absorbed = true;
                particle.lifetime = 0;
                continue;
            }
            
            // Forces gravitationnelles
            const gravityForce = (this.parameters.gravite.value * this.SCHWARZSCHILD_RADIUS * this.SCHWARZSCHILD_RADIUS) / (distance * distance * particle.mass);
            const gravityX = (dx / distance) * gravityForce;
            const gravityY = (dy / distance) * gravityForce;
            
            // Force de Coriolis (rotation)
            const coriolisForce = this.parameters.coriolis.value * this.CORIOLIS_FORCE / distance;
            const coriolisX = -dy / distance * coriolisForce;
            const coriolisY = dx / distance * coriolisForce;
            
            // Application des forces
            particle.velocityX += (gravityX + coriolisX) * deltaTime * 0.001;
            particle.velocityY += (gravityY + coriolisY) * deltaTime * 0.001;
            
            // Limitation de vitesse (éviter l'instabilité)
            const maxVel = this.ESCAPE_VELOCITY * 0.01;
            const velMag = Math.sqrt(particle.velocityX * particle.velocityX + particle.velocityY * particle.velocityY);
            if (velMag > maxVel) {
                particle.velocityX = (particle.velocityX / velMag) * maxVel;
                particle.velocityY = (particle.velocityY / velMag) * maxVel;
            }
            
            // Conservation du moment angulaire (effet orbital)
            const angularMomentum = particle.mass * distance * velMag * this.ANGULAR_MOMENTUM;
            const orbitalVel = angularMomentum / (particle.mass * distance);
            const orbitalAngle = Math.atan2(dy, dx) + Math.PI / 2;
            
            particle.velocityX += Math.cos(orbitalAngle) * orbitalVel * deltaTime * 0.0001;
            particle.velocityY += Math.sin(orbitalAngle) * orbitalVel * deltaTime * 0.0001;
            
            // Mise à jour de position
            particle.x += particle.velocityX * deltaTime * 0.1;
            particle.y += particle.velocityY * deltaTime * 0.1;
            
            // Diminution progressive de l'énergie
            particle.energy *= 0.999;
            particle.lifetime = Math.max(0, particle.lifetime - deltaTime * 0.0001);
            
            // Mise à jour de la traînée
            this.updateParticleTrail(particle);
        }
    }

    updateParticleTrail(particle) {
        let trail = this.particleTrails.get(particle);
        if (!trail) {
            trail = [];
            this.particleTrails.set(particle, trail);
        }
        
        // Ajouter position actuelle
        trail.push({ x: particle.x, y: particle.y, time: this.temps });
        
        // Limiter la longueur de la traînée
        const maxTrailLength = 8;
        if (trail.length > maxTrailLength) {
            trail.shift();
        }
        
        // Supprimer les points trop anciens
        const maxAge = 200;
        while (trail.length > 0 && this.temps - trail[0].time > maxAge) {
            trail.shift();
        }
    }

    updateOrbitalRings(deltaTime) {
        this.orbitalRings.forEach(ring => {
            // Rotation de l'anneau
            ring.phase += ring.angularVelocity * deltaTime * 0.0001;
            
            // Mise à jour des particules dans l'anneau
            ring.particles.forEach(particle => {
                particle.angle += ring.angularVelocity * deltaTime * 0.0001;
                particle.brightness = 0.3 + Math.sin(this.temps * 0.005 + particle.phase) * 0.4 + 0.3;
                particle.size = 1 + Math.sin(this.temps * 0.003 + particle.phase * 2) * 0.5 + 0.5;
            });
            
            // Pulsation de l'opacité
            ring.opacity = (0.3 + Math.sin(this.temps * 0.002 + ring.phase) * 0.2) * this.parameters.densite.value;
        });
    }

    updateVelocityField(deltaTime) {
        // Recalcul périodique du champ de vitesse
        if (this.temps % 100 < deltaTime) {
            this.initializeVelocityField();
        }
    }

    cleanupAbsorbedParticles() {
        for (let i = this.pixelParticles.length - 1; i >= 0; i--) {
            const particle = this.pixelParticles[i];
            
            if (particle.absorbed || particle.lifetime <= 0) {
                // Nettoyer la traînée
                this.particleTrails.delete(particle);
                
                // Retourner au pool
                this.returnParticleToPool(particle);
                this.pixelParticles.splice(i, 1);
            }
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        ctx.translate(element.x, element.y);
        
        // Rendu du vortex gravitationnel de fond
        this.renderGravitationalField(ctx);
        
        // Rendu des anneaux orbitaux
        this.renderOrbitalRings(ctx);
        
        // Rendu des traînées de particules
        this.renderParticleTrails(ctx);
        
        // Rendu des particules pixel
        this.renderPixelParticles(ctx);
        
        // Rendu du centre du vortex (singularité)
        this.renderVortexCore(ctx);
        
        // Effets de post-traitement
        this.renderSpaceTimeDistortion(ctx);
        
        ctx.restore();
    }

    renderGravitationalField(ctx) {
        // Champ gravitationnel visualisé par distorsion
        const gradient = ctx.createRadialGradient(
            this.vortexCenter.x, this.vortexCenter.y, 0,
            this.vortexCenter.x, this.vortexCenter.y, this.maxRadius
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(0.1, 'rgba(20, 20, 40, 0.6)');
        gradient.addColorStop(0.3, 'rgba(10, 30, 60, 0.3)');
        gradient.addColorStop(0.6, 'rgba(5, 15, 30, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.element.width, this.element.height);
    }

    renderOrbitalRings(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.orbitalRings.forEach(ring => {
            if (ring.opacity > 0.05) {
                // Anneau principal
                ctx.strokeStyle = `rgba(100, 150, 255, ${ring.opacity * 0.3})`;
                ctx.lineWidth = ring.thickness * 0.5;
                ctx.beginPath();
                ctx.arc(this.vortexCenter.x, this.vortexCenter.y, ring.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Particules orbitales
                ring.particles.forEach(particle => {
                    const x = this.vortexCenter.x + Math.cos(particle.angle) * ring.radius;
                    const y = this.vortexCenter.y + Math.sin(particle.angle) * ring.radius;
                    
                    const alpha = particle.brightness * ring.opacity;
                    ctx.fillStyle = `rgba(150, 200, 255, ${alpha})`;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Effet de lueur
                    if (particle.brightness > 0.7) {
                        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 3);
                        glowGradient.addColorStop(0, `rgba(200, 230, 255, ${alpha * 0.5})`);
                        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        
                        ctx.fillStyle = glowGradient;
                        ctx.beginPath();
                        ctx.arc(x, y, particle.size * 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    renderParticleTrails(ctx) {
        ctx.globalCompositeOperation = 'screen';
        ctx.lineCap = 'round';
        
        this.particleTrails.forEach((trail, particle) => {
            if (trail.length < 2) return;
            
            for (let i = 1; i < trail.length; i++) {
                const prevPoint = trail[i - 1];
                const currPoint = trail[i];
                
                const age = this.temps - currPoint.time;
                const alpha = Math.max(0, (200 - age) / 200) * particle.color.a * 0.6;
                
                if (alpha > 0.01) {
                    const thickness = (alpha * 2) + 0.5;
                    
                    ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
                    ctx.lineWidth = thickness;
                    
                    ctx.beginPath();
                    ctx.moveTo(prevPoint.x, prevPoint.y);
                    ctx.lineTo(currPoint.x, currPoint.y);
                    ctx.stroke();
                }
            }
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    renderPixelParticles(ctx) {
        this.pixelParticles.forEach(particle => {
            if (particle.absorbed || particle.lifetime <= 0) return;
            
            const distance = this.getDistance(particle.x, particle.y, this.vortexCenter.x, this.vortexCenter.y);
            
            // Effet de redshift gravitationnel
            const redshift = Math.max(0, 1 - (this.vortexRadius * 2) / distance);
            const size = Math.max(0.5, particle.energy * 3 * redshift);
            const alpha = particle.color.a * particle.lifetime * redshift;
            
            if (alpha > 0.01 && size > 0.1) {
                // Couleur avec redshift
                const r = Math.floor(particle.color.r * redshift + (1 - redshift) * 255);
                const g = Math.floor(particle.color.g * redshift);
                const b = Math.floor(particle.color.b * redshift);
                
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Effet de distorsion près du vortex
                if (distance < this.vortexRadius * 3) {
                    const distortionFactor = 1 - (distance / (this.vortexRadius * 3));
                    const stretchX = 1 + distortionFactor * 2;
                    const stretchY = 1 - distortionFactor * 0.5;
                    
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.scale(stretchX, stretchY);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        });
    }

    renderVortexCore(ctx) {
        // Singularité centrale
        const coreIntensity = Math.sin(this.temps * 0.01) * 0.3 + 0.7;
        const coreRadius = this.vortexRadius * coreIntensity;
        
        // Gradient de densité infinie
        const coreGradient = ctx.createRadialGradient(
            this.vortexCenter.x, this.vortexCenter.y, 0,
            this.vortexCenter.x, this.vortexCenter.y, coreRadius * 2
        );
        
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${coreIntensity})`);
        coreGradient.addColorStop(0.3, `rgba(200, 230, 255, ${coreIntensity * 0.8})`);
        coreGradient.addColorStop(0.7, `rgba(100, 150, 255, ${coreIntensity * 0.4})`);
        coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.vortexCenter.x, this.vortexCenter.y, coreRadius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Point de singularité
        ctx.fillStyle = `rgba(255, 255, 255, ${coreIntensity})`;
        ctx.beginPath();
        ctx.arc(this.vortexCenter.x, this.vortexCenter.y, Math.max(1, coreRadius * 0.3), 0, Math.PI * 2);
        ctx.fill();
    }

    renderSpaceTimeDistortion(ctx) {
        // Effet de lentille gravitationnelle
        ctx.globalCompositeOperation = 'multiply';
        
        const distortionRadius = this.vortexRadius * 4;
        const distortionGradient = ctx.createRadialGradient(
            this.vortexCenter.x, this.vortexCenter.y, 0,
            this.vortexCenter.x, this.vortexCenter.y, distortionRadius
        );
        
        distortionGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        distortionGradient.addColorStop(0.5, 'rgba(50, 50, 100, 0.3)');
        distortionGradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
        
        ctx.fillStyle = distortionGradient;
        ctx.beginPath();
        ctx.arc(this.vortexCenter.x, this.vortexCenter.y, distortionRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalCompositeOperation = 'source-over';
        
        // Ondes gravitationnelles
        const waveIntensity = Math.sin(this.temps * 0.005) * 0.1 + 0.1;
        for (let i = 1; i <= 3; i++) {
            const waveRadius = this.vortexRadius * (2 + i * 2) + (this.temps * 0.1) % (this.maxRadius);
            
            ctx.strokeStyle = `rgba(100, 150, 255, ${waveIntensity / i})`;
            ctx.lineWidth = 2 / i;
            ctx.beginPath();
            ctx.arc(this.vortexCenter.x, this.vortexCenter.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    destroy() {
        // Nettoyage des ressources
        this.pixelParticles = [];
        this.orbitalRings = [];
        this.deformationGrid = [];
        this.velocityField = [];
        this.densityField = [];
        this.particlePool = [];
        this.ringPool = [];
        this.particleTrails.clear();
        this.imageData = null;
    }
}