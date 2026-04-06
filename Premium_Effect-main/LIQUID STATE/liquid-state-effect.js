class LiquidStateEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'fluid-phase-transition-022',
            name: 'Transition Phase Liquide',
            category: 'text',
            version: '1.0',
            performance: 'high',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                viscosite: { type: 'range', min: 0.1, max: 2, default: 0.7 },
                tension: { type: 'range', min: 0, max: 1, default: 0.6 },
                couleurBase: { type: 'color', default: '#0ea5e9' },
                brillance: { type: 'range', min: 0, max: 1, default: 0.8 }
            }
        });

        // Variables de physique fluide
        this.temps = 0;
        this.particules = [];
        this.metaballs = [];
        this.maxParticules = 200;
        this.phaseTransition = 0; // 0=solide, 1=liquide
        
        // Propriétés physiques
        this.gravity = 0.3;
        this.damping = 0.99;
        this.cohesion = 0.8;
        this.separation = 0.5;
        this.alignment = 0.3;
        
        // Surface et tension
        this.surfacePoints = [];
        this.waves = [];
        this.droplets = [];
        
        // Rendu et reflets
        this.lightPositions = [];
        this.reflections = [];
        this.surfaceNormals = [];
        
        // Pool de particules pour performance
        this.particulePool = [];
        this.initializePool();
        
        // États de transition
        this.transitionStates = {
            solid: 0,
            melting: 1,
            liquid: 2,
            flowing: 3,
            reforming: 4
        };
        this.currentState = this.transitionStates.solid;
        this.stateTimer = 0;
    }

    initializePool() {
        for (let i = 0; i < this.maxParticules; i++) {
            this.particulePool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                originalX: 0, originalY: 0,
                radius: 3, mass: 1,
                density: 1, pressure: 0,
                active: false, age: 0,
                type: 'fluid', // fluid, droplet, surface
                connections: [],
                surface: false,
                viscosity: 1
            });
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        // Initialisation des sources de lumière
        this.initializeLighting();
        
        // Génération de la grille de particules initiale
        this.generateParticleGrid();
        
        // Initialisation des vagues de surface
        this.initializeSurfaceWaves();
    }

    initializeLighting() {
        this.lightPositions = [
            { x: this.centerX - 100, y: this.centerY - 150, intensity: 0.8 },
            { x: this.centerX + 100, y: this.centerY - 100, intensity: 0.6 },
            { x: this.centerX, y: this.centerY - 200, intensity: 0.4 }
        ];
    }

    generateParticleGrid() {
        const gridResolution = 8;
        const particleSpacing = Math.min(this.element.width, this.element.height) / gridResolution;
        let particleIndex = 0;
        
        for (let y = 0; y < gridResolution && particleIndex < this.maxParticules; y++) {
            for (let x = 0; x < gridResolution && particleIndex < this.maxParticules; x++) {
                const particle = this.particulePool[particleIndex];
                
                particle.x = this.element.x + (x + 0.5) * (this.element.width / gridResolution);
                particle.y = this.element.y + (y + 0.5) * (this.element.height / gridResolution);
                particle.originalX = particle.x;
                particle.originalY = particle.y;
                particle.vx = 0;
                particle.vy = 0;
                particle.radius = particleSpacing * 0.4;
                particle.mass = 1;
                particle.active = true;
                particle.age = 0;
                particle.type = 'fluid';
                
                this.particules.push(particle);
                particleIndex++;
            }
        }
    }

    initializeSurfaceWaves() {
        this.waves = [];
        const waveCount = 8;
        
        for (let i = 0; i < waveCount; i++) {
            this.waves.push({
                amplitude: 5 + Math.random() * 10,
                frequency: 0.02 + Math.random() * 0.03,
                phase: Math.random() * Math.PI * 2,
                speed: 0.01 + Math.random() * 0.02
            });
        }
    }

    getStateProgress() {
        const cycle = (this.temps * 0.0003) % 5;
        
        if (cycle < 1) {
            this.currentState = this.transitionStates.melting;
            return { state: 'melting', progress: cycle };
        } else if (cycle < 2) {
            this.currentState = this.transitionStates.liquid;
            return { state: 'liquid', progress: cycle - 1 };
        } else if (cycle < 3) {
            this.currentState = this.transitionStates.flowing;
            return { state: 'flowing', progress: cycle - 2 };
        } else if (cycle < 4) {
            this.currentState = this.transitionStates.reforming;
            return { state: 'reforming', progress: cycle - 3 };
        } else {
            this.currentState = this.transitionStates.solid;
            return { state: 'solid', progress: cycle - 4 };
        }
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Mise à jour du centre
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        const stateInfo = this.getStateProgress();
        this.phaseTransition = this.calculatePhaseTransition(stateInfo);
        
        // Mise à jour de la physique fluide
        this.updateFluidPhysics(deltaTime, stateInfo);
        
        ctx.save();
        
        // Rendu selon l'état de transition
        this.renderLiquidState(ctx, stateInfo);
        
        ctx.restore();
    }

    calculatePhaseTransition(stateInfo) {
        const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        switch (stateInfo.state) {
            case 'solid':
                return 0;
            case 'melting':
                return easeInOut(stateInfo.progress) * this.parameters.intensite.value;
            case 'liquid':
                return this.parameters.intensite.value;
            case 'flowing':
                return this.parameters.intensite.value;
            case 'reforming':
                return this.parameters.intensite.value * (1 - easeInOut(stateInfo.progress));
            default:
                return 0;
        }
    }

    updateFluidPhysics(deltaTime, stateInfo) {
        // Mise à jour des forces et positions
        this.calculateDensityPressure();
        this.calculateForces(stateInfo);
        this.integrateParticles(deltaTime);
        this.handleBoundaries();
        this.updateSurfaceWaves(deltaTime);
        this.updateDroplets(deltaTime);
        
        // Gestion des connexions fluides
        if (this.phaseTransition > 0.3) {
            this.updateFluidConnections();
        }
    }

    calculateDensityPressure() {
        const h = 20; // Smoothing radius
        const h2 = h * h;
        
        this.particules.forEach(particle => {
            if (!particle.active) return;
            
            particle.density = 0;
            particle.pressure = 0;
            
            // Calcul de la densité locale
            this.particules.forEach(neighbor => {
                if (!neighbor.active || particle === neighbor) return;
                
                const dx = particle.x - neighbor.x;
                const dy = particle.y - neighbor.y;
                const r2 = dx * dx + dy * dy;
                
                if (r2 < h2) {
                    const factor = (h2 - r2) / h2;
                    particle.density += neighbor.mass * factor * factor * factor;
                }
            });
            
            // Calcul de la pression
            const restDensity = 1;
            const stiffness = 0.5;
            particle.pressure = stiffness * (particle.density - restDensity);
        });
    }

    calculateForces(stateInfo) {
        this.particules.forEach(particle => {
            if (!particle.active) return;
            
            let fx = 0, fy = 0;
            
            // Force de gravité (augmente avec la liquidité)
            fy += this.gravity * this.phaseTransition;
            
            // Forces de pression et viscosité
            this.particules.forEach(neighbor => {
                if (!neighbor.active || particle === neighbor) return;
                
                const dx = particle.x - neighbor.x;
                const dy = particle.y - neighbor.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30 && distance > 0) {
                    const unitX = dx / distance;
                    const unitY = dy / distance;
                    
                    // Force de pression
                    const pressureForce = (particle.pressure + neighbor.pressure) / (2 * particle.density);
                    fx += unitX * pressureForce * this.phaseTransition;
                    fy += unitY * pressureForce * this.phaseTransition;
                    
                    // Force de viscosité
                    const viscosityForce = this.parameters.viscosite.value * 0.1;
                    fx += (neighbor.vx - particle.vx) * viscosityForce * this.phaseTransition;
                    fy += (neighbor.vy - particle.vy) * viscosityForce * this.phaseTransition;
                }
            });
            
            // Force de rappel vers position originale (pour conservation de masse)
            const restoreForce = (1 - this.phaseTransition) * 0.05;
            fx += (particle.originalX - particle.x) * restoreForce;
            fy += (particle.originalY - particle.y) * restoreForce;
            
            // Force de tension de surface
            if (particle.surface) {
                const tensionForce = this.parameters.tension.value * 0.02;
                fx += Math.sin(this.temps * 0.01 + particle.x * 0.1) * tensionForce;
                fy += Math.cos(this.temps * 0.01 + particle.y * 0.1) * tensionForce;
            }
            
            // Application des forces
            particle.vx += fx * 0.1;
            particle.vy += fy * 0.1;
        });
    }

    integrateParticles(deltaTime) {
        this.particules.forEach(particle => {
            if (!particle.active) return;
            
            // Intégration de Verlet
            particle.vx *= this.damping;
            particle.vy *= this.damping;
            
            particle.x += particle.vx * deltaTime * 0.1;
            particle.y += particle.vy * deltaTime * 0.1;
            
            particle.age += deltaTime;
        });
    }

    handleBoundaries() {
        const margin = 10;
        
        this.particules.forEach(particle => {
            if (!particle.active) return;
            
            // Collision avec les bords
            if (particle.x < this.element.x - margin) {
                particle.x = this.element.x - margin;
                particle.vx *= -0.5;
            }
            if (particle.x > this.element.x + this.element.width + margin) {
                particle.x = this.element.x + this.element.width + margin;
                particle.vx *= -0.5;
            }
            if (particle.y < this.element.y - margin) {
                particle.y = this.element.y - margin;
                particle.vy *= -0.5;
            }
            if (particle.y > this.element.y + this.element.height + margin) {
                particle.y = this.element.y + this.element.height + margin;
                particle.vy *= -0.5;
                
                // Création de gouttes qui se détachent
                if (Math.random() < 0.1 && this.phaseTransition > 0.6) {
                    this.createDroplet(particle);
                }
            }
        });
    }

    updateSurfaceWaves(deltaTime) {
        this.waves.forEach(wave => {
            wave.phase += wave.speed * deltaTime * this.parameters.vitesse.value;
        });
    }

    updateDroplets(deltaTime) {
        this.droplets.forEach((droplet, index) => {
            droplet.vy += this.gravity * 0.5;
            droplet.x += droplet.vx * deltaTime * 0.1;
            droplet.y += droplet.vy * deltaTime * 0.1;
            droplet.life -= deltaTime;
            
            // Tentative de reconnexion
            if (droplet.life > 0) {
                const reconnectDistance = 30;
                for (let particle of this.particules) {
                    if (!particle.active) continue;
                    
                    const dx = droplet.x - particle.x;
                    const dy = droplet.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < reconnectDistance) {
                        // Reconnexion réussie
                        particle.vx += droplet.vx * 0.3;
                        particle.vy += droplet.vy * 0.3;
                        this.droplets.splice(index, 1);
                        break;
                    }
                }
            } else {
                this.droplets.splice(index, 1);
            }
        });
    }

    createDroplet(sourceParticle) {
        this.droplets.push({
            x: sourceParticle.x,
            y: sourceParticle.y,
            vx: sourceParticle.vx + (Math.random() - 0.5) * 2,
            vy: sourceParticle.vy + Math.random() * 2,
            radius: 2 + Math.random() * 3,
            life: 2000 + Math.random() * 3000
        });
    }

    updateFluidConnections() {
        const connectionDistance = 25;
        
        this.particules.forEach(particle => {
            if (!particle.active) return;
            
            particle.connections = [];
            particle.surface = true;
            
            this.particules.forEach(neighbor => {
                if (!neighbor.active || particle === neighbor) return;
                
                const dx = particle.x - neighbor.x;
                const dy = particle.y - neighbor.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    particle.connections.push(neighbor);
                    if (particle.connections.length >= 4) {
                        particle.surface = false;
                    }
                }
            });
        });
    }

    renderLiquidState(ctx, stateInfo) {
        // Rendu selon l'état de transition
        switch (stateInfo.state) {
            case 'solid':
                this.renderSolidState(ctx);
                break;
            case 'melting':
                this.renderMeltingTransition(ctx, stateInfo.progress);
                break;
            case 'liquid':
                this.renderFullLiquid(ctx);
                break;
            case 'flowing':
                this.renderFlowingState(ctx, stateInfo.progress);
                break;
            case 'reforming':
                this.renderReformingState(ctx, stateInfo.progress);
                break;
        }
        
        // Rendu des gouttes détachées
        this.renderDroplets(ctx);
        
        // Rendu des reflets lumineux
        this.renderReflections(ctx);
    }

    renderSolidState(ctx) {
        // Rendu du texte solide avec légères ondulations
        ctx.fillStyle = this.parameters.couleurBase.value;
        
        const waveIntensity = 2;
        const segments = 20;
        
        for (let i = 0; i < segments; i++) {
            const y = this.element.y + (this.element.height / segments) * i;
            const wave = Math.sin(this.temps * 0.005 + i * 0.5) * waveIntensity;
            
            ctx.fillRect(
                this.element.x + wave,
                y,
                this.element.width,
                this.element.height / segments + 1
            );
        }
    }

    renderMeltingTransition(ctx, progress) {
        // Transition progressive solide vers liquide
        ctx.save();
        
        // Partie solide (haut)
        const solidHeight = this.element.height * (1 - progress);
        ctx.fillStyle = this.parameters.couleurBase.value;
        ctx.fillRect(this.element.x, this.element.y, this.element.width, solidHeight);
        
        // Partie liquide (bas)
        ctx.globalCompositeOperation = 'source-over';
        this.renderMetaballs(ctx, progress);
        
        ctx.restore();
    }

    renderFullLiquid(ctx) {
        // Rendu complet en mode liquide
        this.renderMetaballs(ctx, 1.0);
        this.renderSurfaceWaves(ctx);
    }

    renderFlowingState(ctx, progress) {
        // État d'écoulement avec déformations
        ctx.save();
        
        const flowIntensity = Math.sin(progress * Math.PI) * 10;
        ctx.transform(1, 0, Math.sin(this.temps * 0.003) * 0.1, 1, flowIntensity, 0);
        
        this.renderMetaballs(ctx, 1.0);
        
        ctx.restore();
    }

    renderReformingState(ctx, progress) {
        // Retour vers l'état solide
        const liquidAlpha = 1 - progress;
        const solidAlpha = progress;
        
        // Rendu liquide avec transparence décroissante
        ctx.save();
        ctx.globalAlpha = liquidAlpha;
        this.renderMetaballs(ctx, liquidAlpha);
        ctx.restore();
        
        // Rendu solide avec transparence croissante
        ctx.save();
        ctx.globalAlpha = solidAlpha;
        this.renderSolidState(ctx);
        ctx.restore();
    }

    renderMetaballs(ctx, intensity) {
        // Création d'un canvas temporaire pour les metaballs
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.element.width + 100;
        tempCanvas.height = this.element.height + 100;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Rendu des particules comme metaballs
        this.particules.forEach(particle => {
            if (!particle.active) return;
            
            const x = particle.x - this.element.x + 50;
            const y = particle.y - this.element.y + 50;
            const radius = particle.radius * (1 + intensity * 0.5);
            
            const gradient = tempCtx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            tempCtx.fillStyle = gradient;
            tempCtx.beginPath();
            tempCtx.arc(x, y, radius, 0, Math.PI * 2);
            tempCtx.fill();
        });
        
        // Application du threshold pour effet metaball
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 128) {
                const baseColor = this.hexToRgb(this.parameters.couleurBase.value);
                data[i] = baseColor.r;
                data[i + 1] = baseColor.g;
                data[i + 2] = baseColor.b;
                data[i + 3] = Math.min(255, alpha * 1.5);
            } else {
                data[i + 3] = 0;
            }
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // Rendu final
        ctx.drawImage(tempCanvas, this.element.x - 50, this.element.y - 50);
    }

    renderSurfaceWaves(ctx) {
        if (this.phaseTransition < 0.5) return;
        
        ctx.save();
        ctx.strokeStyle = `${this.parameters.couleurBase.value}80`;
        ctx.lineWidth = 1;
        
        // Ondulations de surface
        for (let wave of this.waves) {
            ctx.beginPath();
            
            for (let x = 0; x <= this.element.width; x += 2) {
                const y = this.element.y + this.element.height * 0.3 + 
                         Math.sin(x * wave.frequency + wave.phase) * wave.amplitude * this.phaseTransition;
                
                if (x === 0) ctx.moveTo(this.element.x + x, y);
                else ctx.lineTo(this.element.x + x, y);
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }

    renderDroplets(ctx) {
        ctx.save();
        
        this.droplets.forEach(droplet => {
            const alpha = Math.min(1, droplet.life / 1000);
            const baseColor = this.hexToRgb(this.parameters.couleurBase.value);
            
            // Corps de la goutte
            const gradient = ctx.createRadialGradient(
                droplet.x, droplet.y, 0,
                droplet.x, droplet.y, droplet.radius
            );
            gradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(droplet.x, droplet.y, droplet.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Reflet sur la goutte
            if (this.parameters.brillance.value > 0.5) {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(droplet.x - droplet.radius * 0.3, droplet.y - droplet.radius * 0.3, 
                       droplet.radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.restore();
    }

    renderReflections(ctx) {
        if (this.parameters.brillance.value < 0.3) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // Reflets lumineux sur les surfaces
        this.particules.forEach(particle => {
            if (!particle.active || !particle.surface) return;
            
            this.lightPositions.forEach(light => {
                const dx = light.x - particle.x;
                const dy = light.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const intensity = (1 - distance / 100) * light.intensity * this.parameters.brillance.value;
                    
                    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });
        
        ctx.restore();
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    update(deltaTime) {
        // Mise à jour continue des états liquides
    }

    destroy() {
        this.particules = [];
        this.metaballs = [];
        this.particulePool = [];
        this.surfacePoints = [];
        this.waves = [];
        this.droplets = [];
        this.lightPositions = [];
        this.reflections = [];
        this.surfaceNormals = [];
    }
}