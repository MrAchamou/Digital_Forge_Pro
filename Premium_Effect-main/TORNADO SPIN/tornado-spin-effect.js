class TornadoSpinEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'cyclonic-vortex-rotation-047',
            name: 'Rotation Cyclonique Vortex',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                turbulence: { type: 'range', min: 0, max: 1, default: 0.5 },
                debris: { type: 'range', min: 10, max: 100, default: 40 },
                coriolis: { type: 'range', min: 0, max: 1, default: 0.6 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.centerX = 400;
        this.centerY = 300;
        this.maxRadius = 350;
        
        // Pool de debris pour performance
        this.debrisPool = [];
        this.activeDebris = [];
        this.vortexGrid = [];
        
        // Cache de déformation pour optimisation
        this.deformationCache = new Map();
        this.cacheSize = 0;
        
        // Paramètres physiques du vortex
        this.eyeRadius = 40;
        this.spiralTightness = 0.15;
        this.coriolisStrength = 0.0008;
        
        this.initializeDebrisPool();
        this.initializeVortexGrid();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        // Réinitialiser debris actifs
        this.resetDebris();
    }

    initializeDebrisPool() {
        // Pool de 200 debris pour éviter allocation/déallocation
        for (let i = 0; i < 200; i++) {
            this.debrisPool.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                angle: 0, rotation: 0,
                size: 0, opacity: 0,
                life: 0, maxLife: 0,
                type: Math.floor(Math.random() * 3),
                active: false
            });
        }
    }

    initializeVortexGrid() {
        // Grille de déformation précalculée pour performance
        const gridSize = 20;
        this.vortexGrid = [];
        
        for (let x = 0; x < gridSize; x++) {
            this.vortexGrid[x] = [];
            for (let y = 0; y < gridSize; y++) {
                const worldX = (x / (gridSize - 1)) * 800;
                const worldY = (y / (gridSize - 1)) * 600;
                
                const dx = worldX - this.centerX;
                const dy = worldY - this.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                this.vortexGrid[x][y] = {
                    distance: distance,
                    angle: Math.atan2(dy, dx),
                    strength: Math.max(0, 1 - distance / this.maxRadius)
                };
            }
        }
    }

    getDebrisFromPool() {
        for (let debris of this.debrisPool) {
            if (!debris.active) {
                debris.active = true;
                return debris;
            }
        }
        return null; // Pool épuisé
    }

    returnDebrisToPool(debris) {
        debris.active = false;
        const index = this.activeDebris.indexOf(debris);
        if (index > -1) {
            this.activeDebris.splice(index, 1);
        }
    }

    resetDebris() {
        // Retourner tous les debris au pool
        for (let debris of this.activeDebris) {
            debris.active = false;
        }
        this.activeDebris = [];
        
        // Créer nouveaux debris selon paramètre
        const debrisCount = this.getParameter('debris');
        for (let i = 0; i < debrisCount; i++) {
            this.spawnDebris();
        }
    }

    spawnDebris() {
        const debris = this.getDebrisFromPool();
        if (!debris) return;

        // Spawn aléatoire en périphérie
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnRadius = this.maxRadius + Math.random() * 100;
        
        debris.x = this.centerX + Math.cos(spawnAngle) * spawnRadius;
        debris.y = this.centerY + Math.sin(spawnAngle) * spawnRadius;
        debris.vx = 0;
        debris.vy = 0;
        debris.angle = spawnAngle;
        debris.rotation = Math.random() * Math.PI * 2;
        debris.size = 2 + Math.random() * 8;
        debris.opacity = 0.8 + Math.random() * 0.2;
        debris.life = 0;
        debris.maxLife = 5000 + Math.random() * 10000; // 5-15 secondes
        
        this.activeDebris.push(debris);
    }

    calculateVortexForce(x, y, time) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1) return { fx: 0, fy: 0, rotation: 0 };
        
        // Force centripète basique
        const baseStrength = Math.max(0, 1 - distance / this.maxRadius);
        const eyeEffect = distance < this.eyeRadius ? distance / this.eyeRadius : 1;
        const strength = baseStrength * eyeEffect * this.getParameter('intensite');
        
        // Composante tangentielle (rotation)
        const tangentAngle = Math.atan2(dy, dx) + Math.PI / 2;
        const tangentStrength = strength * this.getParameter('vitesse');
        
        // Composante radiale (aspiration vers centre)
        const radialStrength = strength * 0.3;
        const radialAngle = Math.atan2(dy, dx) + Math.PI;
        
        // Effet Coriolis (déflection perpendiculaire)
        const coriolisStrength = this.getParameter('coriolis') * this.coriolisStrength;
        const coriolisAngle = tangentAngle + Math.PI / 2;
        
        // Turbulence chaotique
        const turbulence = this.getParameter('turbulence');
        const turbulenceX = (Math.sin(time * 0.003 + x * 0.01) * turbulence * 0.1);
        const turbulenceY = (Math.cos(time * 0.004 + y * 0.01) * turbulence * 0.1);
        
        // Combinaison des forces
        const fx = Math.cos(tangentAngle) * tangentStrength +
                  Math.cos(radialAngle) * radialStrength +
                  Math.cos(coriolisAngle) * coriolisStrength +
                  turbulenceX;
                  
        const fy = Math.sin(tangentAngle) * tangentStrength +
                  Math.sin(radialAngle) * radialStrength +
                  Math.sin(coriolisAngle) * coriolisStrength +
                  turbulenceY;
        
        // Vitesse de rotation angulaire
        const rotationSpeed = strength * this.getParameter('vitesse') * 0.1;
        
        return { fx, fy, rotation: rotationSpeed };
    }

    updateDebris(deltaTime) {
        const time = this.temps;
        
        for (let i = this.activeDebris.length - 1; i >= 0; i--) {
            const debris = this.activeDebris[i];
            
            // Vieillissement
            debris.life += deltaTime;
            if (debris.life > debris.maxLife) {
                this.returnDebrisToPool(debris);
                this.spawnDebris(); // Remplacer immédiatement
                continue;
            }
            
            // Calcul des forces du vortex
            const force = this.calculateVortexForce(debris.x, debris.y, time);
            
            // Mise à jour vélocité
            debris.vx += force.fx * deltaTime * 0.001;
            debris.vy += force.fy * deltaTime * 0.001;
            
            // Friction pour éviter accélération infinie
            debris.vx *= 0.98;
            debris.vy *= 0.98;
            
            // Mise à jour position
            debris.x += debris.vx * deltaTime;
            debris.y += debris.vy * deltaTime;
            
            // Rotation du debris
            debris.rotation += force.rotation * deltaTime;
            
            // Fade out si trop près du centre
            const distanceToCenter = Math.sqrt(
                (debris.x - this.centerX) ** 2 + 
                (debris.y - this.centerY) ** 2
            );
            
            if (distanceToCenter < this.eyeRadius) {
                debris.opacity *= 0.95;
                if (debris.opacity < 0.1) {
                    this.returnDebrisToPool(debris);
                    this.spawnDebris();
                }
            }
        }
    }

    getVortexDeformation(x, y) {
        // Cache key pour éviter recalculs
        const cacheKey = `${Math.floor(x/10)}_${Math.floor(y/10)}`;
        if (this.deformationCache.has(cacheKey)) {
            return this.deformationCache.get(cacheKey);
        }
        
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1) {
            const result = { offsetX: 0, offsetY: 0, scale: 1 };
            this.deformationCache.set(cacheKey, result);
            return result;
        }
        
        // Déformation spiralée
        const angle = Math.atan2(dy, dx);
        const strength = Math.max(0, 1 - distance / this.maxRadius);
        const eyeEffect = distance < this.eyeRadius ? distance / this.eyeRadius : 1;
        const finalStrength = strength * eyeEffect * this.getParameter('intensite');
        
        // Rotation spiralée avec effet temporel
        const spiralOffset = this.spiralTightness * distance;
        const rotationAngle = angle + spiralOffset + this.temps * 0.002 * this.getParameter('vitesse');
        
        // Déplacement en spirale
        const spiralRadius = distance * (1 - finalStrength * 0.3);
        const newX = this.centerX + Math.cos(rotationAngle) * spiralRadius;
        const newY = this.centerY + Math.sin(rotationAngle) * spiralRadius;
        
        const offsetX = newX - x;
        const offsetY = newY - y;
        
        // Effet de scale (compression vers le centre)
        const scale = 1 - finalStrength * 0.2;
        
        const result = { offsetX, offsetY, scale };
        
        // Gestion cache (limiter taille)
        if (this.cacheSize > 1000) {
            this.deformationCache.clear();
            this.cacheSize = 0;
        }
        this.deformationCache.set(cacheKey, result);
        this.cacheSize++;
        
        return result;
    }

    renderVortexEffect(ctx, element) {
        // Sauvegarde état du contexte
        ctx.save();
        
        // Créer mask circulaire pour l'effet
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.maxRadius, 0, Math.PI * 2);
        ctx.clip();
        
        // Rendu de l'image avec déformation par sampling
        const imageData = ctx.getImageData(element.x, element.y, element.width, element.height);
        const samplingRate = 4; // Réduction pour performance
        
        for (let x = element.x; x < element.x + element.width; x += samplingRate) {
            for (let y = element.y; y < element.y + element.height; y += samplingRate) {
                const deform = this.getVortexDeformation(x, y);
                
                ctx.save();
                ctx.translate(x + deform.offsetX, y + deform.offsetY);
                ctx.scale(deform.scale, deform.scale);
                
                // Échantillonnage pixel couleur originale
                const imgX = Math.floor(x - element.x);
                const imgY = Math.floor(y - element.y);
                const pixelIndex = (imgY * element.width + imgX) * 4;
                
                if (pixelIndex >= 0 && pixelIndex < imageData.data.length) {
                    const r = imageData.data[pixelIndex];
                    const g = imageData.data[pixelIndex + 1];
                    const b = imageData.data[pixelIndex + 2];
                    const a = imageData.data[pixelIndex + 3] / 255;
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                    ctx.fillRect(-samplingRate/2, -samplingRate/2, samplingRate, samplingRate);
                }
                
                ctx.restore();
            }
        }
        
        ctx.restore();
    }

    renderDebris(ctx) {
        ctx.save();
        
        for (let debris of this.activeDebris) {
            ctx.save();
            ctx.translate(debris.x, debris.y);
            ctx.rotate(debris.rotation);
            ctx.globalAlpha = debris.opacity;
            
            // Différents types de debris
            switch (debris.type) {
                case 0: // Particule circulaire
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(0, 0, debris.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 1: // Fragment triangulaire
                    ctx.fillStyle = '#cccccc';
                    ctx.beginPath();
                    ctx.moveTo(-debris.size, debris.size);
                    ctx.lineTo(debris.size, debris.size);
                    ctx.lineTo(0, -debris.size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 2: // Ligne de mouvement
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-debris.size, 0);
                    ctx.lineTo(debris.size, 0);
                    ctx.stroke();
                    break;
            }
            
            ctx.restore();
        }
        
        ctx.restore();
    }

    renderVortexCenter(ctx) {
        // Oeil du cyclone avec effet hypnotique
        ctx.save();
        
        const pulseIntensity = 0.5 + 0.5 * Math.sin(this.temps * 0.008);
        const eyeSize = this.eyeRadius * (0.7 + 0.3 * pulseIntensity);
        
        // Gradient radial pour l'oeil
        const gradient = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, eyeSize
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * this.getParameter('intensite')})`);
        gradient.addColorStop(0.7, `rgba(200, 200, 255, ${0.3 * this.getParameter('intensite')})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    render(ctx, element, deltaTime) {
        // Rendu de l'effet vortex sur l'image
        this.renderVortexEffect(ctx, element);
        
        // Rendu des debris
        this.renderDebris(ctx);
        
        // Rendu du centre hypnotique
        this.renderVortexCenter(ctx);
    }

    update(deltaTime) {
        this.temps += deltaTime;
        this.updateDebris(deltaTime);
        
        // Nettoyage cache périodique
        if (this.temps % 5000 < deltaTime) {
            this.deformationCache.clear();
            this.cacheSize = 0;
        }
    }

    destroy() {
        // Nettoyage mémoire
        this.debrisPool = [];
        this.activeDebris = [];
        this.vortexGrid = [];
        this.deformationCache.clear();
        this.deformationCache = null;
    }
}