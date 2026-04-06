class StellarDriftEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'cosmic-space-drift-navigation-049',
            name: 'Navigation Dérive Cosmique',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 0.8 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.6 },
                gravitation: { type: 'range', min: 0, max: 1, default: 0.4 },
                etoiles: { type: 'range', min: 50, max: 500, default: 200 },
                profondeur: { type: 'range', min: 0.5, max: 3, default: 1.5 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.angularVelocity = { x: 0, y: 0, z: 0 };
        
        // Système stellaire
        this.stars = [];
        this.starLayers = [];
        this.nebulaClouds = [];
        
        // Forces gravitationnelles invisibles
        this.gravitySources = [];
        this.lastGravityUpdate = 0;
        this.trajectoryHistory = [];
        
        // Inertie cosmique
        this.momentum = { linear: 0.999, angular: 0.995 };
        this.microCorrections = [];
        
        // Cache de rendu pour performance
        this.starCache = new Map();
        this.parallaxLayers = [];
        
        // Générateurs de bruit spatial
        this.noiseSeeds = {
            drift: Math.random() * 1000,
            gravity: Math.random() * 1000,
            rotation: Math.random() * 1000,
            stellar: Math.random() * 1000
        };
        
        this.initializeStarField();
        this.initializeGravitySources();
        this.initializeParallaxLayers();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Position initiale au centre
        this.position.x = element.x + element.width / 2;
        this.position.y = element.y + element.height / 2;
        this.position.z = 0;
        
        // Vélocité initiale aléatoire (dérive cosmique)
        const initialSpeed = 0.5 * this.getParameter('vitesse');
        const angle = Math.random() * Math.PI * 2;
        this.velocity.x = Math.cos(angle) * initialSpeed;
        this.velocity.y = Math.sin(angle) * initialSpeed;
        this.velocity.z = (Math.random() - 0.5) * initialSpeed * 0.3;
        
        // Rotation initiale lente
        this.angularVelocity.x = (Math.random() - 0.5) * 0.001;
        this.angularVelocity.y = (Math.random() - 0.5) * 0.001;
        this.angularVelocity.z = (Math.random() - 0.5) * 0.0005;
        
        this.generateStarField();
    }

    initializeStarField() {
        this.stars = [];
        const starCount = this.getParameter('etoiles');
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * 1600 - 800, // Étendu au-delà du canvas
                y: Math.random() * 1200 - 600,
                z: Math.random() * 2000 + 100, // Profondeur variable
                brightness: Math.random() * 0.8 + 0.2,
                size: Math.random() * 2 + 0.5,
                color: this.getRandomStarColor(),
                type: Math.random() > 0.95 ? 'pulsar' : 'normal',
                pulsePhase: Math.random() * Math.PI * 2,
                twinkle: Math.random() * 0.3 + 0.1
            });
        }
    }

    initializeGravitySources() {
        this.gravitySources = [];
        const sourceCount = 3 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < sourceCount; i++) {
            // Sources gravitationnelles invisibles hors écran
            const angle = Math.random() * Math.PI * 2;
            const distance = 1000 + Math.random() * 2000;
            
            this.gravitySources.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                z: (Math.random() - 0.5) * 1000,
                mass: 0.5 + Math.random() * 2,
                influence: 0.3 + Math.random() * 0.7,
                type: Math.random() > 0.7 ? 'blackhole' : 'star',
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    initializeParallaxLayers() {
        this.parallaxLayers = [];
        const layerCount = 5;
        
        for (let i = 0; i < layerCount; i++) {
            const layer = {
                depth: (i + 1) * 0.2,
                stars: [],
                speed: 1 - (i * 0.15),
                opacity: 0.8 - (i * 0.1)
            };
            
            // Étoiles pour cette couche de parallaxe
            const layerStarCount = Math.floor(this.getParameter('etoiles') * (0.3 - i * 0.05));
            for (let j = 0; j < layerStarCount; j++) {
                layer.stars.push({
                    x: Math.random() * 1600 - 800,
                    y: Math.random() * 1200 - 600,
                    brightness: Math.random() * 0.6 + 0.2,
                    size: (Math.random() * 1.5 + 0.3) * (1 - i * 0.1),
                    color: this.getRandomStarColor()
                });
            }
            
            this.parallaxLayers.push(layer);
        }
    }

    getRandomStarColor() {
        const colors = [
            'rgba(255, 255, 255, ', // Blanc
            'rgba(200, 220, 255, ', // Bleu
            'rgba(255, 220, 180, ', // Jaune
            'rgba(255, 180, 120, ', // Orange
            'rgba(180, 200, 255, '  // Bleu froid
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateStarField() {
        // Régénérer les étoiles selon les nouveaux paramètres
        this.initializeStarField();
        this.initializeParallaxLayers();
    }

    updateCosmicDrift(deltaTime) {
        const vitesse = this.getParameter('vitesse');
        const intensite = this.getParameter('intensite');
        const gravitation = this.getParameter('gravitation');
        
        // Mise à jour des forces gravitationnelles
        this.updateGravitationalForces(deltaTime, gravitation);
        
        // Dérive cosmique avec bruit de Perlin
        const driftInfluence = intensite * 0.1;
        const timeScale = this.temps * 0.0001 * vitesse;
        
        const driftX = this.perlinNoise(timeScale, this.noiseSeeds.drift) - 0.5;
        const driftY = this.perlinNoise(timeScale + 100, this.noiseSeeds.drift) - 0.5;
        const driftZ = this.perlinNoise(timeScale + 200, this.noiseSeeds.drift) - 0.5;
        
        // Application de la dérive
        this.velocity.x += driftX * driftInfluence * deltaTime * 0.001;
        this.velocity.y += driftY * driftInfluence * deltaTime * 0.001;
        this.velocity.z += driftZ * driftInfluence * deltaTime * 0.001;
        
        // Limitation de la vitesse maximale
        const maxSpeed = 2 * vitesse;
        const currentSpeed = Math.sqrt(
            this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2
        );
        
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
            this.velocity.z *= scale;
        }
        
        // Application de l'inertie cosmique
        this.velocity.x *= this.momentum.linear;
        this.velocity.y *= this.momentum.linear;
        this.velocity.z *= this.momentum.linear;
        
        // Mise à jour position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Enregistrer trajectoire pour analyse
        this.trajectoryHistory.push({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
            time: this.temps
        });
        
        // Limiter historique
        if (this.trajectoryHistory.length > 100) {
            this.trajectoryHistory.shift();
        }
    }

    updateGravitationalForces(deltaTime, gravitation) {
        if (this.temps - this.lastGravityUpdate < 16) return; // 60 FPS max
        
        this.microCorrections = [];
        
        for (let source of this.gravitySources) {
            // Distance à la source gravitationnelle
            const dx = source.x - this.position.x;
            const dy = source.y - this.position.y;
            const dz = source.z - this.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < 10) continue; // Éviter division par zéro
            
            // Force gravitationnelle (loi inverse du carré simplifiée)
            const force = (source.mass * source.influence * gravitation) / (distance * distance);
            const forceX = force * (dx / distance);
            const forceY = force * (dy / distance);
            const forceZ = force * (dz / distance);
            
            // Application de la force
            this.velocity.x += forceX * deltaTime * 0.0001;
            this.velocity.y += forceY * deltaTime * 0.0001;
            this.velocity.z += forceZ * deltaTime * 0.0001;
            
            // Enregistrer micro-correction
            this.microCorrections.push({
                sourceType: source.type,
                force: { x: forceX, y: forceY, z: forceZ },
                distance: distance
            });
            
            // Effet sur la rotation (couple gravitationnel)
            if (source.type === 'blackhole') {
                const torque = force * 0.00001;
                this.angularVelocity.x += torque * (dy / distance) * deltaTime;
                this.angularVelocity.y += torque * (-dx / distance) * deltaTime;
            }
        }
        
        this.lastGravityUpdate = this.temps;
    }

    updateCosmicRotation(deltaTime) {
        const vitesse = this.getParameter('vitesse');
        const intensite = this.getParameter('intensite');
        
        // Rotation cosmique avec bruit
        const rotTimeScale = this.temps * 0.00005 * vitesse;
        const rotInfluence = intensite * 0.0001;
        
        const rotNoiseX = this.perlinNoise(rotTimeScale, this.noiseSeeds.rotation) - 0.5;
        const rotNoiseY = this.perlinNoise(rotTimeScale + 50, this.noiseSeeds.rotation) - 0.5;
        const rotNoiseZ = this.perlinNoise(rotTimeScale + 100, this.noiseSeeds.rotation) - 0.5;
        
        // Application du bruit rotationnel
        this.angularVelocity.x += rotNoiseX * rotInfluence * deltaTime;
        this.angularVelocity.y += rotNoiseY * rotInfluence * deltaTime;
        this.angularVelocity.z += rotNoiseZ * rotInfluence * deltaTime;
        
        // Inertie angulaire
        this.angularVelocity.x *= this.momentum.angular;
        this.angularVelocity.y *= this.momentum.angular;
        this.angularVelocity.z *= this.momentum.angular;
        
        // Mise à jour rotation
        this.rotation.x += this.angularVelocity.x * deltaTime;
        this.rotation.y += this.angularVelocity.y * deltaTime;
        this.rotation.z += this.angularVelocity.z * deltaTime;
        
        // Normalisation angles
        this.rotation.x = this.rotation.x % (Math.PI * 2);
        this.rotation.y = this.rotation.y % (Math.PI * 2);
        this.rotation.z = this.rotation.z % (Math.PI * 2);
    }

    updateStarField(deltaTime) {
        const vitesse = this.getParameter('vitesse');
        const profondeur = this.getParameter('profondeur');
        
        // Parallaxe stellaire basée sur le mouvement
        for (let star of this.stars) {
            // Mouvement de parallaxe inverse
            const parallaxFactor = profondeur / star.z;
            star.x -= this.velocity.x * parallaxFactor * deltaTime * 0.1;
            star.y -= this.velocity.y * parallaxFactor * deltaTime * 0.1;
            
            // Recyclage des étoiles hors écran
            if (star.x < -900 || star.x > 900 || star.y < -700 || star.y > 700) {
                // Repositionner du côté opposé
                if (star.x < -900) star.x = 900;
                else if (star.x > 900) star.x = -900;
                if (star.y < -700) star.y = 700;
                else if (star.y > 700) star.y = -700;
                
                // Nouvelle profondeur aléatoire
                star.z = Math.random() * 2000 + 100;
            }
            
            // Scintillement des étoiles
            if (star.type === 'pulsar') {
                star.brightness = 0.3 + 0.7 * Math.abs(Math.sin(this.temps * 0.01 + star.pulsePhase));
            } else {
                const twinkleSpeed = 0.005 + star.twinkle * 0.002;
                star.brightness = 0.4 + 0.4 * Math.sin(this.temps * twinkleSpeed + star.pulsePhase);
            }
        }
        
        // Mise à jour couches de parallaxe
        for (let layer of this.parallaxLayers) {
            for (let star of layer.stars) {
                const parallaxFactor = layer.speed * profondeur;
                star.x -= this.velocity.x * parallaxFactor * deltaTime * 0.05;
                star.y -= this.velocity.y * parallaxFactor * deltaTime * 0.05;
                
                // Recyclage
                if (star.x < -900 || star.x > 900 || star.y < -700 || star.y > 700) {
                    if (star.x < -900) star.x = 900;
                    else if (star.x > 900) star.x = -900;
                    if (star.y < -700) star.y = 700;
                    else if (star.y > 700) star.y = -700;
                }
            }
        }
    }

    perlinNoise(x, seed) {
        const i = Math.floor(x + seed);
        const f = x + seed - i;
        const u = f * f * (3 - 2 * f);
        
        const a = this.hash(i) / 0x7fffffff;
        const b = this.hash(i + 1) / 0x7fffffff;
        
        return a * (1 - u) + b * u;
    }

    hash(n) {
        n = ((n << 13) ^ n);
        return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
    }

    renderStarField(ctx) {
        ctx.save();
        
        // Rendu couches de parallaxe (arrière-plan)
        for (let layer of this.parallaxLayers) {
            ctx.globalAlpha = layer.opacity;
            
            for (let star of layer.stars) {
                const screenX = 400 + star.x;
                const screenY = 300 + star.y;
                
                if (screenX >= -10 && screenX <= 810 && screenY >= -10 && screenY <= 610) {
                    ctx.fillStyle = star.color + star.brightness + ')';
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Rendu étoiles principales avec effet de profondeur
        ctx.globalAlpha = 1;
        for (let star of this.stars) {
            const perspective = 1000 / (1000 + star.z);
            const screenX = 400 + star.x * perspective;
            const screenY = 300 + star.y * perspective;
            const apparentSize = star.size * perspective * this.getParameter('profondeur');
            
            if (screenX >= -10 && screenX <= 810 && screenY >= -10 && screenY <= 610) {
                const brightness = star.brightness * Math.min(perspective * 2, 1);
                
                // Halo pour les étoiles brillantes
                if (brightness > 0.7 && apparentSize > 1) {
                    ctx.fillStyle = star.color + (brightness * 0.3) + ')';
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, apparentSize * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Étoile principale
                ctx.fillStyle = star.color + brightness + ')';
                ctx.beginPath();
                ctx.arc(screenX, screenY, Math.max(apparentSize, 0.5), 0, Math.PI * 2);
                ctx.fill();
                
                // Effet de pointes pour les pulsars
                if (star.type === 'pulsar' && brightness > 0.6) {
                    ctx.strokeStyle = star.color + (brightness * 0.8) + ')';
                    ctx.lineWidth = 1;
                    const spikeLength = apparentSize * 4;
                    
                    ctx.beginPath();
                    ctx.moveTo(screenX - spikeLength, screenY);
                    ctx.lineTo(screenX + spikeLength, screenY);
                    ctx.moveTo(screenX, screenY - spikeLength);
                    ctx.lineTo(screenX, screenY + spikeLength);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }

    renderSpaceDust(ctx) {
        ctx.save();
        
        // Particules de poussière spatiale pour accentuer le mouvement
        const dustCount = 30;
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < dustCount; i++) {
            const x = (this.temps * 0.01 * i) % 800;
            const y = (this.temps * 0.005 * i + i * 20) % 600;
            const size = 0.5 + (i % 3) * 0.5;
            
            ctx.fillStyle = 'rgba(100, 120, 150, 0.4)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    renderTrajectoryTrace(ctx) {
        if (this.trajectoryHistory.length < 2) return;
        
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let i = 0; i < this.trajectoryHistory.length; i++) {
            const point = this.trajectoryHistory[i];
            const screenX = point.x - this.position.x + 400;
            const screenY = point.y - this.position.y + 300;
            
            if (i === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        }
        ctx.stroke();
        
        ctx.restore();
    }

    render(ctx, element, deltaTime) {
        // Rendu champ stellaire
        this.renderStarField(ctx);
        
        // Rendu poussière spatiale
        this.renderSpaceDust(ctx);
        
        // Rendu trace de trajectoire (optionnel, subtil)
        if (this.getParameter('intensite') > 0.7) {
            this.renderTrajectoryTrace(ctx);
        }
        
        // Rendu de l'objet avec transformation 3D
        ctx.save();
        
        // Transformation au centre de rotation
        const centerX = this.position.x;
        const centerY = this.position.y;
        
        ctx.translate(centerX, centerY);
        
        // Rotation 3D simulée (projection)
        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);
        const cosY = Math.cos(this.rotation.y);
        const cosZ = Math.cos(this.rotation.z);
        const sinZ = Math.sin(this.rotation.z);
        
        // Matrice de rotation simplifiée
        ctx.transform(
            cosY * cosZ,
            cosY * sinZ,
            -sinX * cosZ,
            cosX,
            0,
            0
        );
        
        // Effet de perspective Z
        const zPerspective = 1 + this.position.z * 0.0001;
        ctx.scale(zPerspective, zPerspective);
        
        // Léger glow spatial autour de l'objet
        ctx.shadowColor = 'rgba(100, 150, 200, 0.3)';
        ctx.shadowBlur = 8;
        
        // Rendu de l'image centrée
        ctx.drawImage(element.image || this.canvas,
                     element.x, element.y, element.width, element.height,
                     -element.width / 2, -element.height / 2, 
                     element.width, element.height);
        
        ctx.restore();
    }

    update(deltaTime) {
        this.temps += deltaTime;
        
        this.updateCosmicDrift(deltaTime);
        this.updateCosmicRotation(deltaTime);
        this.updateStarField(deltaTime);
        
        // Régénération périodique du champ stellaire
        if (this.temps % 30000 < deltaTime) {
            this.generateStarField();
        }
    }

    destroy() {
        this.stars = [];
        this.starLayers = [];
        this.nebulaClouds = [];
        this.gravitySources = [];
        this.trajectoryHistory = [];
        this.microCorrections = [];
        this.parallaxLayers = [];
        this.starCache.clear();
        this.starCache = null;
    }
}