class FireConsumeEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'combustion-consumption-flame-035',
            name: 'Combustion Progressive Dévorante',
            category: 'image',
            version: '1.0',
            performance: 'high',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                temperature: { type: 'range', min: 0.3, max: 2, default: 1.0 },
                propagation: { type: 'range', min: 0.1, max: 1, default: 0.6 },
                couleur: { type: 'color', default: '#ff4500' }
            }
        });

        // Variables principales
        this.temps = 0;
        this.flammeParticles = [];
        this.braiseParticles = [];
        this.combustionMap = [];
        this.temperatureField = [];
        this.convectionFlow = [];
        
        // Configuration combustion
        this.maxFlames = 600;
        this.maxEmbers = 300;
        this.particlePool = { flames: [], embers: [] };
        this.gridResolution = 32;
        this.ignitionPoints = [];
        
        // États de combustion
        this.combustionPhase = 0;
        this.heatIntensity = 0;
        this.convectionStrength = 0;
        this.carbonizationLevel = 0;
        
        // Simulation matériaux
        this.materialMap = [];
        this.burnedPixels = new Set();
        this.combustibilityCache = new Map();
        
        // Cache thermique
        this.thermalGradient = [];
        this.lastThermalUpdate = 0;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.ctx = canvas.getContext('2d');
        
        // Initialisation des pools de particules
        this.initializeParticlePools();
        
        // Analyse de l'image pour combustibilité
        this.analyzeMaterialCombustibility();
        
        // Génération de la carte de combustion
        this.generateCombustionMap();
        
        // Initialisation du champ de température
        this.initializeTemperatureField();
        
        // Création des points d'ignition
        this.createIgnitionPoints();
        
        // Démarrage de la combustion
        this.startCombustion();
    }

    initializeParticlePools() {
        // Pool flammes
        this.particlePool.flames = [];
        for (let i = 0; i < this.maxFlames; i++) {
            this.particlePool.flames.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                size: 0,
                intensity: 0,
                temperature: 0,
                life: 0,
                maxLife: 0,
                flickerPhase: Math.random() * Math.PI * 2,
                combustionRate: 0.5 + Math.random() * 0.5,
                active: false,
                type: 'flame'
            });
        }
        
        // Pool braises
        this.particlePool.embers = [];
        for (let i = 0; i < this.maxEmbers; i++) {
            this.particlePool.embers.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                size: 0,
                glow: 0,
                temperature: 0,
                life: 0,
                maxLife: 0,
                gravity: 0.1 + Math.random() * 0.05,
                sparkle: Math.random() > 0.7,
                active: false,
                type: 'ember'
            });
        }
    }

    analyzeMaterialCombustibility() {
        // Simulation de l'analyse des matériaux de l'image
        this.materialMap = [];
        const res = this.gridResolution;
        
        for (let x = 0; x < res; x++) {
            this.materialMap[x] = [];
            for (let y = 0; y < res; y++) {
                // Simulation basée sur la position et variation pseudo-aléatoire
                const noise = this.pseudoRandom(x, y);
                const centerDistance = Math.sqrt(
                    Math.pow(x - res/2, 2) + Math.pow(y - res/2, 2)
                ) / (res/2);
                
                // Combustibilité variable selon matériau simulé
                let combustibility;
                if (noise < 0.3) {
                    combustibility = 0.9; // Matériau très inflammable (papier, bois sec)
                } else if (noise < 0.6) {
                    combustibility = 0.6; // Matériau modérément inflammable (bois)
                } else if (noise < 0.8) {
                    combustibility = 0.3; // Matériau peu inflammable (plastique)
                } else {
                    combustibility = 0.1; // Matériau résistant (métal)
                }
                
                this.materialMap[x][y] = {
                    combustibility: combustibility,
                    burnSpeed: combustibility * (0.5 + noise * 0.5),
                    heatCapacity: 1 - combustibility * 0.7,
                    burned: false,
                    burnProgress: 0,
                    carbonization: 0
                };
            }
        }
    }

    generateCombustionMap() {
        this.combustionMap = [];
        const res = this.gridResolution;
        
        for (let x = 0; x < res; x++) {
            this.combustionMap[x] = [];
            for (let y = 0; y < res; y++) {
                this.combustionMap[x][y] = {
                    burning: false,
                    temperature: 20, // Température ambiante
                    oxygenLevel: 1.0,
                    fuelRemaining: this.materialMap[x][y].combustibility,
                    ignitionTime: 0,
                    propagationDelay: Math.random() * 500
                };
            }
        }
    }

    initializeTemperatureField() {
        this.temperatureField = [];
        const res = this.gridResolution;
        
        for (let x = 0; x < res; x++) {
            this.temperatureField[x] = [];
            for (let y = 0; y < res; y++) {
                this.temperatureField[x][y] = {
                    current: 20,
                    target: 20,
                    conductivity: 0.1 + Math.random() * 0.05,
                    convectionForce: { x: 0, y: 0 }
                };
            }
        }
    }

    createIgnitionPoints() {
        this.ignitionPoints = [];
        const numPoints = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numPoints; i++) {
            const x = Math.floor(Math.random() * this.gridResolution);
            const y = Math.floor(this.gridResolution * 0.7 + Math.random() * this.gridResolution * 0.3);
            
            this.ignitionPoints.push({
                x: x,
                y: y,
                intensity: 0.7 + Math.random() * 0.3,
                radius: 2 + Math.random() * 3,
                ignited: false
            });
        }
    }

    startCombustion() {
        // Ignition des points de départ
        this.ignitionPoints.forEach(point => {
            if (!point.ignited) {
                this.igniteCombustion(point.x, point.y, point.intensity);
                point.ignited = true;
            }
        });
    }

    igniteCombustion(gridX, gridY, intensity) {
        if (gridX >= 0 && gridX < this.gridResolution && gridY >= 0 && gridY < this.gridResolution) {
            const combustion = this.combustionMap[gridX][gridY];
            const material = this.materialMap[gridX][gridY];
            
            if (!combustion.burning && material.combustibility > 0.1) {
                combustion.burning = true;
                combustion.temperature = 300 + intensity * 700; // 300-1000°C
                combustion.ignitionTime = this.temps;
                
                // Création de particules de flamme
                this.createFlameParticles(gridX, gridY, intensity);
            }
        }
    }

    createFlameParticles(gridX, gridY, intensity) {
        const worldX = this.element.x + (gridX / this.gridResolution) * this.element.width;
        const worldY = this.element.y + (gridY / this.gridResolution) * this.element.height;
        
        const numFlames = Math.floor(intensity * 8);
        
        for (let i = 0; i < numFlames; i++) {
            const flame = this.getParticleFromPool('flames');
            if (flame) {
                this.resetFlameParticle(flame, worldX, worldY, intensity);
                this.flammeParticles.push(flame);
            }
        }
    }

    resetFlameParticle(flame, x, y, intensity) {
        flame.x = x + (Math.random() - 0.5) * 20;
        flame.y = y + (Math.random() - 0.5) * 10;
        flame.vx = (Math.random() - 0.5) * 2;
        flame.vy = -Math.random() * 3 - 1;
        flame.size = 3 + intensity * 12;
        flame.intensity = intensity;
        flame.temperature = 500 + intensity * 500;
        flame.life = 0;
        flame.maxLife = 800 + Math.random() * 1200;
        flame.flickerPhase = Math.random() * Math.PI * 2;
        flame.combustionRate = intensity;
        flame.active = true;
    }

    getParticleFromPool(type) {
        const pool = this.particlePool[type];
        for (let particle of pool) {
            if (!particle.active) {
                return particle;
            }
        }
        return null;
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Mise à jour des phases de combustion
        this.combustionPhase = (this.temps * 0.001) % (Math.PI * 2);
        this.heatIntensity = 0.7 + Math.sin(this.temps * 0.0008) * 0.3;
        this.convectionStrength = 0.5 + Math.sin(this.temps * 0.0012) * 0.3;
        
        // Propagation du feu
        this.propagateFire(deltaTime);
        
        // Mise à jour du champ de température
        this.updateTemperatureField(deltaTime);
        
        // Simulation de convection
        this.simulateConvection(deltaTime);
        
        // Mise à jour des particules
        this.updateFlameParticles(deltaTime);
        this.updateEmberParticles(deltaTime);
        
        // Génération continue de braises
        this.generateEmbers(deltaTime);
        
        // Mise à jour de la carbonisation
        this.updateCarbonization(deltaTime);
    }

    propagateFire(deltaTime) {
        const res = this.gridResolution;
        const propagationSpeed = this.parameters.propagation.value;
        
        for (let x = 0; x < res; x++) {
            for (let y = 0; y < res; y++) {
                const combustion = this.combustionMap[x][y];
                const material = this.materialMap[x][y];
                
                if (combustion.burning && combustion.fuelRemaining > 0) {
                    // Consommation du combustible
                    const consumptionRate = material.burnSpeed * propagationSpeed * deltaTime * 0.001;
                    combustion.fuelRemaining = Math.max(0, combustion.fuelRemaining - consumptionRate);
                    
                    // Progression de la combustion
                    material.burnProgress = Math.min(1, material.burnProgress + consumptionRate);
                    
                    // Propagation aux cellules adjacentes
                    this.propagateToNeighbors(x, y, deltaTime);
                    
                    // Extinction progressive
                    if (combustion.fuelRemaining <= 0) {
                        combustion.temperature *= 0.95;
                        if (combustion.temperature < 100) {
                            combustion.burning = false;
                        }
                    }
                }
            }
        }
    }

    propagateToNeighbors(x, y, deltaTime) {
        const directions = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
        const combustion = this.combustionMap[x][y];
        const propagationChance = this.parameters.intensite.value * deltaTime * 0.01;
        
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.gridResolution && ny >= 0 && ny < this.gridResolution) {
                const neighborCombustion = this.combustionMap[nx][ny];
                const neighborMaterial = this.materialMap[nx][ny];
                
                if (!neighborCombustion.burning && 
                    neighborMaterial.combustibility > 0.2 && 
                    Math.random() < propagationChance * neighborMaterial.combustibility) {
                    
                    // Délai de propagation
                    if (this.temps - combustion.ignitionTime > neighborCombustion.propagationDelay) {
                        const intensity = Math.min(0.8, combustion.temperature / 1000);
                        this.igniteCombustion(nx, ny, intensity);
                    }
                }
            }
        });
    }

    updateTemperatureField(deltaTime) {
        if (this.temps - this.lastThermalUpdate < 50) return;
        this.lastThermalUpdate = this.temps;
        
        const res = this.gridResolution;
        
        // Diffusion thermique
        for (let x = 0; x < res; x++) {
            for (let y = 0; y < res; y++) {
                const temp = this.temperatureField[x][y];
                const combustion = this.combustionMap[x][y];
                
                // Source de chaleur si en combustion
                if (combustion.burning) {
                    temp.target = combustion.temperature;
                } else {
                    temp.target = Math.max(20, temp.current * 0.98); // Refroidissement
                }
                
                // Lissage thermique
                temp.current += (temp.target - temp.current) * temp.conductivity * deltaTime * 0.01;
                
                // Calcul des forces de convection
                this.calculateConvectionForces(x, y);
            }
        }
    }

    calculateConvectionForces(x, y) {
        const temp = this.temperatureField[x][y];
        const res = this.gridResolution;
        
        // Force de convection basée sur les gradients de température
        let forceX = 0, forceY = 0;
        
        if (x > 0) forceX += this.temperatureField[x-1][y].current - temp.current;
        if (x < res-1) forceX += this.temperatureField[x+1][y].current - temp.current;
        if (y > 0) forceY += this.temperatureField[x][y-1].current - temp.current;
        if (y < res-1) forceY += this.temperatureField[x][y+1].current - temp.current;
        
        // Force de flottabilité (air chaud monte)
        const buoyancy = Math.max(0, (temp.current - 20) / 1000);
        forceY -= buoyancy * 2;
        
        temp.convectionForce.x = forceX * 0.001;
        temp.convectionForce.y = forceY * 0.001;
    }

    simulateConvection(deltaTime) {
        // Application des forces de convection aux particules
        this.flammeParticles.forEach(flame => {
            if (flame.active) {
                const gridX = Math.floor((flame.x - this.element.x) / this.element.width * this.gridResolution);
                const gridY = Math.floor((flame.y - this.element.y) / this.element.height * this.gridResolution);
                
                if (gridX >= 0 && gridX < this.gridResolution && gridY >= 0 && gridY < this.gridResolution) {
                    const convection = this.temperatureField[gridX][gridY].convectionForce;
                    const convectionStrength = this.convectionStrength * this.parameters.temperature.value;
                    
                    flame.vx += convection.x * convectionStrength * deltaTime * 0.1;
                    flame.vy += convection.y * convectionStrength * deltaTime * 0.1;
                }
            }
        });
    }

    updateFlameParticles(deltaTime) {
        this.flammeParticles.forEach((flame, index) => {
            if (!flame.active) return;
            
            flame.life += deltaTime;
            
            if (flame.life >= flame.maxLife) {
                flame.active = false;
                return;
            }
            
            const lifeRatio = flame.life / flame.maxLife;
            
            // Scintillement des flammes
            flame.flickerPhase += deltaTime * 0.01;
            const flicker = Math.sin(flame.flickerPhase) * 0.3 + Math.sin(flame.flickerPhase * 2.3) * 0.2;
            
            // Mise à jour position avec turbulences
            flame.vx += (Math.random() - 0.5) * 0.5 * deltaTime * 0.01;
            flame.vy += flicker * deltaTime * 0.01;
            
            flame.x += flame.vx * deltaTime * 0.1;
            flame.y += flame.vy * deltaTime * 0.1;
            
            // Évolution de la taille et intensité
            if (lifeRatio < 0.3) {
                flame.size *= 1.002; // Croissance
                flame.intensity = Math.min(1, flame.intensity * 1.001);
            } else {
                flame.size *= 0.999; // Rétrécissement
                flame.intensity *= 0.998;
            }
            
            // Modulation thermique
            flame.temperature = Math.max(100, flame.temperature * (0.999 + flicker * 0.001));
        });
    }

    updateEmberParticles(deltaTime) {
        this.braiseParticles.forEach(ember => {
            if (!ember.active) return;
            
            ember.life += deltaTime;
            
            if (ember.life >= ember.maxLife) {
                ember.active = false;
                return;
            }
            
            // Physique des braises
            ember.vy += ember.gravity * deltaTime * 0.01;
            ember.vx *= 0.999; // Friction air
            ember.vy *= 0.999;
            
            ember.x += ember.vx * deltaTime * 0.1;
            ember.y += ember.vy * deltaTime * 0.1;
            
            // Refroidissement
            ember.temperature *= 0.995;
            ember.glow = Math.max(0, ember.temperature / 800);
            
            // Scintillement des braises
            if (ember.sparkle) {
                ember.glow += Math.sin(this.temps * 0.02 + ember.x * 0.01) * 0.2;
            }
        });
    }

    generateEmbers(deltaTime) {
        if (Math.random() < 0.3 * deltaTime * 0.01) {
            // Génération depuis les zones en combustion
            for (let x = 0; x < this.gridResolution; x++) {
                for (let y = 0; y < this.gridResolution; y++) {
                    const combustion = this.combustionMap[x][y];
                    
                    if (combustion.burning && combustion.temperature > 400 && Math.random() < 0.1) {
                        const ember = this.getParticleFromPool('embers');
                        if (ember) {
                            this.createEmberParticle(ember, x, y, combustion.temperature);
                            this.braiseParticles.push(ember);
                        }
                    }
                }
            }
        }
    }

    createEmberParticle(ember, gridX, gridY, temperature) {
        const worldX = this.element.x + (gridX / this.gridResolution) * this.element.width;
        const worldY = this.element.y + (gridY / this.gridResolution) * this.element.height;
        
        ember.x = worldX + (Math.random() - 0.5) * 15;
        ember.y = worldY + (Math.random() - 0.5) * 10;
        ember.vx = (Math.random() - 0.5) * 4;
        ember.vy = -Math.random() * 2 - 0.5;
        ember.size = 1 + Math.random() * 3;
        ember.temperature = temperature;
        ember.glow = temperature / 1000;
        ember.life = 0;
        ember.maxLife = 2000 + Math.random() * 3000;
        ember.active = true;
        ember.sparkle = Math.random() > 0.7;
    }

    updateCarbonization(deltaTime) {
        this.carbonizationLevel = Math.min(1, this.carbonizationLevel + deltaTime * 0.0001);
        
        // Mise à jour de la carbonisation par cellule
        for (let x = 0; x < this.gridResolution; x++) {
            for (let y = 0; y < this.gridResolution; y++) {
                const material = this.materialMap[x][y];
                const combustion = this.combustionMap[x][y];
                
                if (material.burnProgress > 0.3) {
                    material.carbonization = Math.min(1, 
                        material.carbonization + material.burnProgress * deltaTime * 0.001
                    );
                }
            }
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Rendu des zones carbonisées (révélation de structure)
        this.renderCarbonization(ctx);
        
        // Rendu des flammes avec température de couleur
        this.renderFlames(ctx);
        
        // Rendu des braises dansantes
        this.renderEmbers(ctx);
        
        // Effet de distorsion thermique
        this.renderHeatDistortion(ctx);
        
        ctx.restore();
    }

    renderCarbonization(ctx) {
        const cellWidth = this.element.width / this.gridResolution;
        const cellHeight = this.element.height / this.gridResolution;
        
        for (let x = 0; x < this.gridResolution; x++) {
            for (let y = 0; y < this.gridResolution; y++) {
                const material = this.materialMap[x][y];
                
                if (material.carbonization > 0) {
                    const cellX = this.element.x + x * cellWidth;
                    const cellY = this.element.y + y * cellHeight;
                    
                    // Couleur de carbonisation
                    const carbonLevel = material.carbonization;
                    const r = Math.floor(50 * (1 - carbonLevel));
                    const g = Math.floor(30 * (1 - carbonLevel));
                    const b = Math.floor(20 * (1 - carbonLevel));
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${carbonLevel * 0.8})`;
                    ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
                    
                    // Texture carbonisée avec détails révélés
                    if (carbonLevel > 0.6) {
                        ctx.fillStyle = `rgba(80, 40, 20, ${(carbonLevel - 0.6) * 0.5})`;
                        const detailSize = cellWidth * 0.3;
                        ctx.fillRect(
                            cellX + cellWidth * 0.2, 
                            cellY + cellHeight * 0.2, 
                            detailSize, detailSize
                        );
                    }
                }
            }
        }
    }

    renderFlames(ctx) {
        // Tri des flammes par température (les plus chaudes devant)
        const sortedFlames = this.flammeParticles
            .filter(f => f.active)
            .sort((a, b) => a.temperature - b.temperature);
        
        sortedFlames.forEach(flame => {
            ctx.save();
            ctx.translate(flame.x, flame.y);
            
            // Couleur basée sur la température
            const tempColors = this.getTemperatureColor(flame.temperature);
            const flicker = Math.sin(flame.flickerPhase) * 0.2 + 1;
            
            // Gradient de flamme avec température de couleur
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flame.size * flicker);
            gradient.addColorStop(0, `rgba(${tempColors.core.r}, ${tempColors.core.g}, ${tempColors.core.b}, ${flame.intensity})`);
            gradient.addColorStop(0.4, `rgba(${tempColors.mid.r}, ${tempColors.mid.g}, ${tempColors.mid.b}, ${flame.intensity * 0.8})`);
            gradient.addColorStop(0.8, `rgba(${tempColors.outer.r}, ${tempColors.outer.g}, ${tempColors.outer.b}, ${flame.intensity * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient;
            
            // Forme de flamme déformée
            const flameHeight = flame.size * (1.5 + flicker * 0.3);
            const flameWidth = flame.size * (0.8 + Math.sin(flame.flickerPhase * 1.3) * 0.2);
            
            ctx.beginPath();
            ctx.ellipse(0, flameHeight * 0.3, flameWidth, flameHeight, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }

    renderEmbers(ctx) {
        this.braiseParticles.forEach(ember => {
            if (!ember.active || ember.glow <= 0) return;
            
            ctx.save();
            ctx.translate(ember.x, ember.y);
            
            // Couleur de braise selon température
            const intensity = ember.glow;
            const r = Math.floor(255 * intensity);
            const g = Math.floor(100 * intensity * intensity);
            const b = Math.floor(20 * intensity);
            
            // Effet de lueur
            const glowRadius = ember.size * (1 + intensity);
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity})`);
            gradient.addColorStop(0.7, `rgba(${r}, ${g*0.5}, ${b}, ${intensity * 0.3})`);
            gradient.addColorStop(1, `rgba(${r}, 0, 0, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Cœur de braise
            if (ember.sparkle) {
                const sparkIntensity = Math.sin(this.temps * 0.02 + ember.x * 0.01) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255, 255, 200, ${sparkIntensity * intensity})`;
                ctx.beginPath();
                ctx.arc(0, 0, ember.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
    }

    renderHeatDistortion(ctx) {
        // Effet de distorsion thermique sur les zones très chaudes
        const gradient = ctx.createLinearGradient(
            this.element.x, this.element.y,
            this.element.x, this.element.y + this.element.height
        );
        
        const heatColor = this.hexToRgb(this.parameters.couleur.value);
        const heatAlpha = 0.03 * this.parameters.temperature.value * this.heatIntensity;
        
        gradient.addColorStop(0, `rgba(${heatColor.r}, ${heatColor.g}, ${heatColor.b}, 0)`);
        gradient.addColorStop(0.6, `rgba(${heatColor.r}, ${heatColor.g}, ${heatColor.b}, ${heatAlpha})`);
        gradient.addColorStop(1, `rgba(${heatColor.r}, ${heatColor.g}, ${heatColor.b}, ${heatAlpha * 1.5})`);
        
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;
        ctx.fillRect(this.element.x, this.element.y, this.element.width, this.element.height);
    }

    getTemperatureColor(temperature) {
        // Simulation réaliste des couleurs de température
        const temp = Math.max(100, Math.min(2000, temperature));
        
        if (temp < 500) {
            // Rouge sombre
            return {
                core: { r: 150, g: 0, b: 0 },
                mid: { r: 120, g: 20, b: 0 },
                outer: { r: 80, g: 10, b: 0 }
            };
        } else if (temp < 800) {
            // Rouge-orange
            return {
                core: { r: 255, g: 100, b: 0 },
                mid: { r: 220, g: 80, b: 0 },
                outer: { r: 180, g: 60, b: 0 }
            };
        } else if (temp < 1200) {
            // Orange-jaune
            return {
                core: { r: 255, g: 200, b: 50 },
                mid: { r: 255, g: 150, b: 20 },
                outer: { r: 255, g: 100, b: 0 }
            };
        } else {
            // Blanc-bleu (très chaud)
            return {
                core: { r: 255, g: 255, b: 200 },
                mid: { r: 255, g: 220, b: 100 },
                outer: { r: 255, g: 180, b: 50 }
            };
        }
    }

    pseudoRandom(x, y) {
        // Générateur pseudo-aléatoire déterministe pour la cohérence
        const seed = x * 73856093 ^ y * 19349663;
        const noise = Math.sin(seed * 0.0001) * 43758.5453;
        return Math.abs(noise - Math.floor(noise));
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 69, b: 0 };
    }

    destroy() {
        // Nettoyage mémoire
        this.flammeParticles = [];
        this.braiseParticles = [];
        this.particlePool = { flames: [], embers: [] };
        this.combustionMap = [];
        this.temperatureField = [];
        this.convectionFlow = [];
        this.materialMap = [];
        this.burnedPixels.clear();
        this.combustibilityCache.clear();
        this.thermalGradient = [];
        this.ignitionPoints = [];
        
        // Reset des variables
        this.temps = 0;
        this.combustionPhase = 0;
        this.heatIntensity = 0;
        this.convectionStrength = 0;
        this.carbonizationLevel = 0;
        this.lastThermalUpdate = 0;
    }
}