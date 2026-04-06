class OrbitDanceEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'gravitational-orbital-mechanics-044',
            name: 'Mécanique Orbitale Gravitationnelle',
            category: 'IMAGE',
            version: '1.0',
            performance: 'medium',
            parameters: {
                intensite: { type: 'range', min: 0.1, max: 2.5, default: 1 },
                vitesse: { type: 'range', min: 0.2, max: 3, default: 1 },
                masseCentrale: { type: 'range', min: 0.5, max: 3, default: 1.5 },
                couleurOrbite: { type: 'color', default: '#00d4ff' },
                precessionRate: { type: 'range', min: 0.1, max: 2, default: 0.8 }
            }
        });

        // Variables orbitales fondamentales
        this.temps = 0;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.angularPosition = 0;
        this.orbitalRadius = 150;
        this.eccentricity = 0.3;
        
        // Centres de masse gravitationnels (N-corps)
        this.centresMasse = [
            {
                x: 400, y: 300,
                masse: 100000,
                rayon: 40,
                couleur: '#ff6b35',
                phase: 0,
                drift: { x: 0, y: 0 },
                influence: 1
            },
            {
                x: 250, y: 200,
                masse: 60000,
                rayon: 25,
                couleur: '#4ecdc4',
                phase: Math.PI / 2,
                drift: { x: 0, y: 0 },
                influence: 0.7
            },
            {
                x: 550, y: 400,
                masse: 80000,
                rayon: 30,
                couleur: '#ffe66d',
                phase: Math.PI,
                drift: { x: 0, y: 0 },
                influence: 0.9
            }
        ];
        
        // Paramètres orbitaux avancés
        this.orbitalElements = {
            semiMajorAxis: 180,
            eccentricity: 0.4,
            inclination: 0.2,
            argumentOfPeriapsis: 0,
            precessionRate: 0.01,
            meanAnomaly: 0
        };
        
        // Historique trajectoire pour traînée
        this.trajectoryHistory = [];
        this.maxTrajectoryPoints = 80;
        
        // Effets de marée gravitationnelle
        this.tidalForces = {
            stretch: { x: 1, y: 1 },
            shear: { x: 0, y: 0 },
            bulge: 0
        };
        
        // Particules orbitales
        this.particulesOrbitales = [];
        this.maxParticules = 20;
        this.particlePool = [];
        
        // Champ gravitationnel visualisé
        this.champGravite = [];
        this.generateGravityField();
        
        // Résonances orbitales
        this.resonances = [
            { ratio: 2/3, strength: 0.1 },
            { ratio: 1/2, strength: 0.15 },
            { ratio: 3/4, strength: 0.08 }
        ];
        
        // Pool particules
        for(let i = 0; i < this.maxParticules; i++) {
            this.particlePool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1,
                size: 0, opacity: 0,
                active: false, trail: []
            });
        }
        
        // Calcul position orbitale initiale
        this.calculateInitialOrbit();
    }

    calculateInitialOrbit() {
        // Position initiale basée sur éléments orbitaux
        const centerOfMass = this.calculateCenterOfMass();
        this.position.x = centerOfMass.x + this.orbitalElements.semiMajorAxis;
        this.position.y = centerOfMass.y;
        
        // Vitesse orbitale initiale (perpendiculaire au rayon)
        const orbitalSpeed = Math.sqrt(this.getTotalMass() / this.orbitalElements.semiMajorAxis) * 0.1;
        this.velocity.x = 0;
        this.velocity.y = orbitalSpeed;
    }

    calculateCenterOfMass() {
        let totalMass = 0;
        let centerX = 0;
        let centerY = 0;
        
        for(let centre of this.centresMasse) {
            totalMass += centre.masse;
            centerX += centre.x * centre.masse;
            centerY += centre.y * centre.masse;
        }
        
        return {
            x: centerX / totalMass,
            y: centerY / totalMass,
            mass: totalMass
        };
    }

    getTotalMass() {
        return this.centresMasse.reduce((sum, centre) => sum + centre.masse, 0);
    }

    generateGravityField() {
        this.champGravite = [];
        
        // Grille de visualisation du champ gravitationnel
        for(let x = 0; x < 800; x += 40) {
            for(let y = 0; y < 600; y += 40) {
                const force = this.calculateGravitationalForce(x, y);
                
                this.champGravite.push({
                    x, y,
                    forceX: force.x * 0.1,
                    forceY: force.y * 0.1,
                    magnitude: Math.sqrt(force.x * force.x + force.y * force.y)
                });
            }
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Ajuster orbite selon taille élément
        this.orbitalElements.semiMajorAxis = Math.max(element.width, element.height) * 2;
        
        // Initialiser particules orbitales
        this.initializeOrbitalParticles();
    }

    initializeOrbitalParticles() {
        for(let i = 0; i < 8; i++) {
            const particle = this.getParticle();
            if(particle) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 50 + Math.random() * 100;
                
                particle.x = this.position.x + Math.cos(angle) * radius;
                particle.y = this.position.y + Math.sin(angle) * radius;
                particle.vx = -Math.sin(angle) * 0.5;
                particle.vy = Math.cos(angle) * 0.5;
                particle.size = Math.random() * 2 + 1;
                particle.opacity = Math.random() * 0.8 + 0.2;
                particle.maxLife = Math.random() * 5 + 3;
                particle.life = Math.random() * particle.maxLife;
                
                this.particulesOrbitales.push(particle);
            }
        }
    }

    getParticle() {
        for(let particle of this.particlePool) {
            if(!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return null;
    }

    // Calcul forces gravitationnelles N-corps
    calculateGravitationalForce(x, y) {
        let totalForceX = 0;
        let totalForceY = 0;
        
        for(let centre of this.centresMasse) {
            const dx = centre.x - x;
            const dy = centre.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if(distance > 0) {
                // Loi de gravitation universelle (simplifiée)
                const force = (centre.masse * this.parameters.masseCentrale) / 
                             (distance * distance + 100);
                
                const forceX = (dx / distance) * force * centre.influence;
                const forceY = (dy / distance) * force * centre.influence;
                
                totalForceX += forceX;
                totalForceY += forceY;
            }
        }
        
        return { x: totalForceX, y: totalForceY };
    }

    // Calcul effets de marée gravitationnelle
    calculateTidalEffects() {
        const centerOfMass = this.calculateCenterOfMass();
        const dx = this.position.x - centerOfMass.x;
        const dy = this.position.y - centerOfMass.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if(distance > 0) {
            // Forces de marée (gradient gravitationnel)
            const tidalStrength = centerOfMass.mass / (distance * distance * distance);
            
            // Étirement radial (effet spaghetti)
            this.tidalForces.stretch.x = 1 + tidalStrength * Math.abs(dx) * 0.00001;
            this.tidalForces.stretch.y = 1 + tidalStrength * Math.abs(dy) * 0.00001;
            
            // Cisaillement
            this.tidalForces.shear.x = tidalStrength * dx * dy * 0.000005;
            this.tidalForces.shear.y = tidalStrength * dx * dy * 0.000005;
            
            // Renflement de marée
            this.tidalForces.bulge = Math.sin(this.angularPosition * 2) * tidalStrength * 0.0001;
        }
    }

    // Intégration mécanique orbitale
    updateOrbitalMechanics(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse * 0.01;
        
        // Calcul forces gravitationnelles
        const force = this.calculateGravitationalForce(this.position.x, this.position.y);
        
        // Intégration Verlet pour stabilité numérique
        const acceleration = {
            x: force.x * 0.00001,
            y: force.y * 0.00001
        };
        
        // Update vélocité
        this.velocity.x += acceleration.x * dt;
        this.velocity.y += acceleration.y * dt;
        
        // Update position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        
        // Calcul angle orbital pour précession
        const centerOfMass = this.calculateCenterOfMass();
        this.angularPosition = Math.atan2(
            this.position.y - centerOfMass.y,
            this.position.x - centerOfMass.x
        );
        
        // Précession du périapside
        this.orbitalElements.argumentOfPeriapsis += 
            this.orbitalElements.precessionRate * this.parameters.precessionRate * dt;
        
        // Résonances orbitales (perturbations)
        for(let resonance of this.resonances) {
            const perturbation = Math.sin(this.angularPosition * resonance.ratio * Math.PI * 2) * 
                               resonance.strength;
            this.velocity.x += perturbation * 0.1;
            this.velocity.y += perturbation * 0.1;
        }
        
        // Ajouter point à la trajectoire
        this.addTrajectoryPoint();
        
        // Calcul effets de marée
        this.calculateTidalEffects();
    }

    addTrajectoryPoint() {
        this.trajectoryHistory.push({
            x: this.position.x,
            y: this.position.y,
            time: this.temps
        });
        
        // Limiter historique
        if(this.trajectoryHistory.length > this.maxTrajectoryPoints) {
            this.trajectoryHistory.shift();
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // === UPDATE MÉCANIQUE ORBITALE ===
        this.updateOrbitalMechanics(deltaTime);
        
        // === RENDU CHAMP GRAVITATIONNEL ===
        this.renderGravityField(ctx);
        
        // === RENDU CENTRES DE MASSE ===
        this.renderMassCenters(ctx);
        
        // === RENDU TRAJECTOIRE ORBITALE ===
        this.renderOrbitalTrajectory(ctx);
        
        // === RENDU ÉLÉMENT AVEC DÉFORMATIONS DE MARÉE ===
        this.renderTidallyDeformedElement(ctx, element);
        
        // === PARTICULES ORBITALES ===
        this.updateOrbitalParticles(deltaTime);
        this.renderOrbitalParticles(ctx);
        
        ctx.restore();
    }

    renderGravityField(ctx) {
        ctx.save();
        
        // Visualisation lignes de force gravitationnelle
        for(let field of this.champGravite) {
            if(field.magnitude > 0.1) {
                const opacity = Math.min(0.3, field.magnitude * 0.001);
                
                ctx.strokeStyle = `${this.parameters.couleurOrbite}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = 1;
                
                const length = Math.min(20, field.magnitude * 0.01);
                const angle = Math.atan2(field.forceY, field.forceX);
                
                ctx.beginPath();
                ctx.moveTo(field.x, field.y);
                ctx.lineTo(
                    field.x + Math.cos(angle) * length,
                    field.y + Math.sin(angle) * length
                );
                ctx.stroke();
                
                // Flèche
                ctx.beginPath();
                ctx.moveTo(
                    field.x + Math.cos(angle) * length,
                    field.y + Math.sin(angle) * length
                );
                ctx.lineTo(
                    field.x + Math.cos(angle - 0.3) * (length - 3),
                    field.y + Math.sin(angle - 0.3) * (length - 3)
                );
                ctx.moveTo(
                    field.x + Math.cos(angle) * length,
                    field.y + Math.sin(angle) * length
                );
                ctx.lineTo(
                    field.x + Math.cos(angle + 0.3) * (length - 3),
                    field.y + Math.sin(angle + 0.3) * (length - 3)
                );
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    renderMassCenters(ctx) {
        ctx.save();
        
        for(let centre of this.centresMasse) {
            // Pulsation gravitationnelle
            const pulsation = 1 + Math.sin(this.temps * 2 + centre.phase) * 0.1;
            const rayon = centre.rayon * pulsation;
            
            // Gradient gravitationnel
            const gradient = ctx.createRadialGradient(
                centre.x, centre.y, 0,
                centre.x, centre.y, rayon * 2
            );
            gradient.addColorStop(0, `${centre.couleur}80`);
            gradient.addColorStop(0.5, `${centre.couleur}40`);
            gradient.addColorStop(1, `${centre.couleur}00`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centre.x, centre.y, rayon * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Noyau central
            ctx.fillStyle = centre.couleur;
            ctx.beginPath();
            ctx.arc(centre.x, centre.y, rayon * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Anneaux d'accrétion
            for(let i = 1; i <= 3; i++) {
                const ringRadius = rayon * (0.6 + i * 0.2);
                const ringOpacity = 0.3 - i * 0.08;
                
                ctx.strokeStyle = `${centre.couleur}${Math.floor(ringOpacity * 255).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centre.x, centre.y, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    renderOrbitalTrajectory(ctx) {
        ctx.save();
        
        if(this.trajectoryHistory.length > 1) {
            // Traînée orbitale avec dégradé
            for(let i = 1; i < this.trajectoryHistory.length; i++) {
                const point = this.trajectoryHistory[i];
                const prevPoint = this.trajectoryHistory[i - 1];
                
                const age = (this.trajectoryHistory.length - i) / this.trajectoryHistory.length;
                const opacity = age * 0.6;
                const width = age * 3 + 0.5;
                
                ctx.strokeStyle = `${this.parameters.couleurOrbite}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = width;
                
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            }
        }
        
        // Marqueur position actuelle
        ctx.fillStyle = this.parameters.couleurOrbite;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Aura orbitale
        const auraGradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, 15
        );
        auraGradient.addColorStop(0, `${this.parameters.couleurOrbite}60`);
        auraGradient.addColorStop(1, `${this.parameters.couleurOrbite}00`);
        
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    renderTidallyDeformedElement(ctx, element) {
        ctx.save();
        
        // Position élément sur orbite
        const elementX = this.position.x;
        const elementY = this.position.y;
        
        ctx.translate(elementX, elementY);
        
        // Rotation orbitale
        ctx.rotate(this.angularPosition + Math.PI / 2);
        
        // Déformations de marée
        const stretchX = this.tidalForces.stretch.x * this.parameters.intensite;
        const stretchY = this.tidalForces.stretch.y * this.parameters.intensite;
        const shearX = this.tidalForces.shear.x * this.parameters.intensite;
        const shearY = this.tidalForces.shear.y * this.parameters.intensite;
        
        // Matrice de transformation de marée
        ctx.transform(
            stretchX, shearX,
            shearY, stretchY,
            0, 0
        );
        
        // Renflement de marée (breathing effect)
        const bulgeScale = 1 + this.tidalForces.bulge * this.parameters.intensite;
        ctx.scale(bulgeScale, 1 / bulgeScale);
        
        // Vitesse orbitale affecte l'opacity (effet Doppler visuel)
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        const dopplerEffect = 0.8 + Math.min(0.2, speed * 0.01);
        
        ctx.globalAlpha = (element.opacity || 1) * dopplerEffect;
        
        // Effet gravitationnel (glow)
        const centerOfMass = this.calculateCenterOfMass();
        const distanceToCenter = Math.sqrt(
            Math.pow(this.position.x - centerOfMass.x, 2) +
            Math.pow(this.position.y - centerOfMass.y, 2)
        );
        const gravitationalGlow = Math.max(0, 20 - distanceToCenter * 0.05);
        
        ctx.shadowColor = this.parameters.couleurOrbite;
        ctx.shadowBlur = gravitationalGlow;
        
        // Rendu élément
        if(element.content && element.content.tagName === 'IMG') {
            ctx.drawImage(
                element.content,
                -element.width / 2,
                -element.height / 2,
                element.width,
                element.height
            );
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
        }
        
        ctx.restore();
    }

    updateOrbitalParticles(deltaTime) {
        // Update particules suivant leurs propres orbites
        for(let i = this.particulesOrbitales.length - 1; i >= 0; i--) {
            const particle = this.particulesOrbitales[i];
            
            // Forces gravitationnelles sur particule
            const force = this.calculateGravitationalForce(particle.x, particle.y);
            
            // Update vélocité particule
            particle.vx += force.x * deltaTime * 0.000001;
            particle.vy += force.y * deltaTime * 0.000001;
            
            // Update position
            particle.x += particle.vx * deltaTime * 0.1;
            particle.y += particle.vy * deltaTime * 0.1;
            
            // Historique traînée particule
            particle.trail.push({ x: particle.x, y: particle.y });
            if(particle.trail.length > 10) {
                particle.trail.shift();
            }
            
            // Vieillissement
            particle.life += deltaTime * 0.001;
            
            if(particle.life > particle.maxLife) {
                particle.active = false;
                this.particulesOrbitales.splice(i, 1);
            }
        }
        
        // Générer nouvelles particules
        if(this.particulesOrbitales.length < 5 && Math.random() < 0.02) {
            const particle = this.getParticle();
            if(particle) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 30 + Math.random() * 50;
                
                particle.x = this.position.x + Math.cos(angle) * radius;
                particle.y = this.position.y + Math.sin(angle) * radius;
                particle.vx = -Math.sin(angle) * 0.3;
                particle.vy = Math.cos(angle) * 0.3;
                particle.size = Math.random() * 1.5 + 0.5;
                particle.opacity = Math.random() * 0.6 + 0.4;
                particle.maxLife = Math.random() * 4 + 2;
                particle.life = 0;
                particle.trail = [];
                
                this.particulesOrbitales.push(particle);
            }
        }
    }

    renderOrbitalParticles(ctx) {
        ctx.save();
        
        for(let particle of this.particulesOrbitales) {
            const ageRatio = particle.life / particle.maxLife;
            const alpha = particle.opacity * (1 - ageRatio);
            
            // Traînée particule
            if(particle.trail.length > 1) {
                for(let i = 1; i < particle.trail.length; i++) {
                    const trailPoint = particle.trail[i];
                    const prevPoint = particle.trail[i - 1];
                    const trailAlpha = alpha * (i / particle.trail.length) * 0.3;
                    
                    ctx.strokeStyle = `${this.parameters.couleurOrbite}${Math.floor(trailAlpha * 255).toString(16).padStart(2, '0')}`;
                    ctx.lineWidth = 1;
                    
                    ctx.beginPath();
                    ctx.moveTo(prevPoint.x, prevPoint.y);
                    ctx.lineTo(trailPoint.x, trailPoint.y);
                    ctx.stroke();
                }
            }
            
            // Particule principale
            ctx.fillStyle = `${this.parameters.couleurOrbite}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse * 0.001;
        
        // Update centres de masse (mouvement subtil)
        for(let centre of this.centresMasse) {
            centre.drift.x = Math.sin(this.temps * 0.3 + centre.phase) * 10;
            centre.drift.y = Math.cos(this.temps * 0.2 + centre.phase) * 8;
            
            centre.x += centre.drift.x * deltaTime * 0.01;
            centre.y += centre.drift.y * deltaTime * 0.01;
            
            // Maintenir dans les limites
            centre.x = Math.max(100, Math.min(700, centre.x));
            centre.y = Math.max(100, Math.min(500, centre.y));
        }
        
        // Régénération périodique du champ gravitationnel
        if(Math.floor(this.temps * 10) % 100 === 0) {
            this.generateGravityField();
        }
    }

    destroy() {
        // Nettoyage mémoire
        this.particlePool.length = 0;
        this.particulesOrbitales.length = 0;
        this.trajectoryHistory.length = 0;
        this.champGravite.length = 0;
        this.centresMasse.length = 0;
        this.resonances.length = 0;
        
        this.canvas = null;
        this.element = null;
    }
}