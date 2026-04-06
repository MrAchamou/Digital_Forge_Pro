class TornadoTwistEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'vortex-spiral-deformation-030',
            name: 'Déformation Vortex Spiral',
            category: 'text',
            version: '1.0',
            performance: 'high',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.4 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.85 },
                taille: { type: 'range', min: 0.3, max: 2, default: 1.2 },
                aspiration: { type: 'range', min: 0.1, max: 1, default: 0.7 },
                particules: { type: 'range', min: 50, max: 300, default: 180 },
                coriolis: { type: 'range', min: 0, max: 1, default: 0.6 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.canvas = null;
        this.ctx = null;
        
        // Système de vortex
        this.vortex = {
            centerX: 0,
            centerY: 0,
            radius: 0,
            intensity: 1,
            angularVelocity: 0,
            coreRadius: 0,
            eyeRadius: 0
        };
        
        // Physics de fluide tourbillonnaire
        this.fluidField = {
            velocityField: null,
            pressureField: null,
            gridSize: 32,
            viscosity: 0.02
        };
        
        // Particules aspirées
        this.debris = [];
        this.maxDebris = 180;
        
        // Déformation du texte
        this.textVertices = [];
        this.deformedVertices = [];
        
        // Cache et optimisations
        this.textPath = null;
        this.lastText = '';
        this.fieldCache = new Map();
        
        // Générateur de bruit tourbillonnaire
        this.turbulenceNoise = this.generateTurbulenceNoise();
        
        // Pool d'objets pour performance
        this.debrisPool = [];
        this.initializeDebrisPool();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.updateTextMetrics(element);
        this.initializeVortex(element);
        this.initializeFluidField(element);
        this.initializeDebris(element);
        this.createTextVertices(element);
    }

    generateTurbulenceNoise() {
        const size = 256;
        const noise = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            // Bruit turbulent multi-échelle
            noise[i] = Math.sin(i * 0.1) * 0.5 + 
                      Math.sin(i * 0.31) * 0.3 + 
                      Math.sin(i * 0.67) * 0.2 +
                      (Math.random() - 0.5) * 0.1;
        }
        return noise;
    }

    initializeDebrisPool() {
        this.debrisPool = [];
        for (let i = 0; i < 400; i++) {
            this.debrisPool.push({
                active: false,
                x: 0, y: 0,
                vx: 0, vy: 0,
                angle: 0,
                angularVel: 0,
                size: 1,
                mass: 1,
                trail: [],
                color: { r: 100, g: 100, b: 100 },
                life: 1,
                height: 0,
                spiralPhase: 0
            });
        }
    }

    updateTextMetrics(element) {
        if (element.content !== this.lastText) {
            this.lastText = element.content;
            this.ctx.font = `${element.height * 0.8}px Arial, sans-serif`;
            this.textPath = this.createDetailedTextPath(element);
        }
    }

    createDetailedTextPath(element) {
        const path = [];
        const text = element.content;
        const fontSize = element.height * 0.8;
        
        this.ctx.font = `${fontSize}px Arial, sans-serif`;
        const metrics = this.ctx.measureText(text);
        
        let x = element.x + (element.width - metrics.width) / 2;
        const y = element.y + element.height / 2 + fontSize * 0.3;
        
        // Créer un maillage dense du texte pour la déformation
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = this.ctx.measureText(char).width;
            
            // Points détaillés pour chaque caractère
            const samples = Math.max(10, Math.floor(charWidth / 3));
            for (let s = 0; s < samples; s++) {
                const progress = s / samples;
                const charX = x + progress * charWidth;
                
                // Créer des points sur plusieurs hauteurs pour la 3D
                for (let h = -3; h <= 3; h++) {
                    path.push({
                        x: charX,
                        y: y + h * fontSize * 0.1,
                        originalX: charX,
                        originalY: y + h * fontSize * 0.1,
                        char: char,
                        charIndex: i,
                        height: h,
                        globalProgress: (i + progress) / text.length
                    });
                }
            }
            x += charWidth;
        }
        
        return path;
    }

    initializeVortex(element) {
        this.vortex.centerX = element.x + element.width / 2;
        this.vortex.centerY = element.y + element.height / 2;
        this.vortex.radius = Math.max(element.width, element.height) * this.parameters.taille.default;
        this.vortex.coreRadius = this.vortex.radius * 0.1;
        this.vortex.eyeRadius = this.vortex.radius * 0.05;
        this.vortex.intensity = this.parameters.intensite.default;
        this.vortex.angularVelocity = 0;
    }

    initializeFluidField(element) {
        const gridSize = this.fluidField.gridSize;
        const fieldWidth = Math.ceil(element.width / gridSize) + 4;
        const fieldHeight = Math.ceil(element.height / gridSize) + 4;
        
        this.fluidField.velocityField = {
            u: new Float32Array(fieldWidth * fieldHeight), // Composante X
            v: new Float32Array(fieldWidth * fieldHeight), // Composante Y
            w: new Float32Array(fieldWidth * fieldHeight), // Composante Z (verticale)
            width: fieldWidth,
            height: fieldHeight
        };
        
        this.fluidField.pressureField = new Float32Array(fieldWidth * fieldHeight);
    }

    initializeDebris(element) {
        this.debris = [];
        const count = this.parameters.particules.default;
        
        for (let i = 0; i < count; i++) {
            const debris = this.getDebrisFromPool();
            if (debris) {
                this.resetDebris(debris, element);
                this.debris.push(debris);
            }
        }
    }

    getDebrisFromPool() {
        return this.debrisPool.find(d => !d.active) || null;
    }

    resetDebris(debris, element) {
        // Positionner aléatoirement autour de la zone de texte
        const angle = Math.random() * Math.PI * 2;
        const distance = this.vortex.radius * (1.2 + Math.random() * 0.8);
        
        debris.active = true;
        debris.x = this.vortex.centerX + Math.cos(angle) * distance;
        debris.y = this.vortex.centerY + Math.sin(angle) * distance;
        debris.vx = 0;
        debris.vy = 0;
        debris.angle = Math.random() * Math.PI * 2;
        debris.angularVel = (Math.random() - 0.5) * 0.2;
        debris.size = 1 + Math.random() * 3;
        debris.mass = debris.size * debris.size;
        debris.trail = [];
        debris.life = 1;
        debris.height = (Math.random() - 0.5) * 50;
        debris.spiralPhase = Math.random() * Math.PI * 2;
        
        // Couleur basée sur la distance du centre
        const distanceNorm = Math.min(1, distance / this.vortex.radius);
        debris.color = {
            r: Math.floor(50 + distanceNorm * 100),
            g: Math.floor(30 + distanceNorm * 80),
            b: Math.floor(20 + distanceNorm * 60)
        };
    }

    createTextVertices(element) {
        if (!this.textPath) return;
        
        this.textVertices = this.textPath.map(point => ({
            ...point,
            deformedX: point.x,
            deformedY: point.y,
            velocity: { x: 0, y: 0 }
        }));
    }

    // Calcul du champ de vitesse tourbillonnaire
    calculateVortexField(x, y) {
        const dx = x - this.vortex.centerX;
        const dy = y - this.vortex.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.1) return { vx: 0, vy: 0, pressure: 1 };
        
        // Profil de vitesse réaliste (combinaison vortex libre + forcé)
        let tangentialVel;
        if (distance < this.vortex.coreRadius) {
            // Vortex forcé (rotation solide)
            tangentialVel = this.vortex.angularVelocity * distance;
        } else {
            // Vortex libre (circulation constante)
            tangentialVel = (this.vortex.angularVelocity * this.vortex.coreRadius * this.vortex.coreRadius) / distance;
        }
        
        // Ajout de turbulence
        const noiseIndex = Math.floor((x + y + this.temps * 0.1) % this.turbulenceNoise.length);
        const turbulence = this.turbulenceNoise[noiseIndex] * 0.3;
        tangentialVel *= (1 + turbulence);
        
        // Composantes de vitesse
        const vx = -tangentialVel * dy / distance;
        const vy = tangentialVel * dx / distance;
        
        // Vitesse radiale (aspiration vers le centre)
        const radialVel = this.parameters.aspiration.default * 20 / (1 + distance * 0.05);
        const radialVx = -radialVel * dx / distance;
        const radialVy = -radialVel * dy / distance;
        
        // Effet Coriolis (déviation des particules)
        const coriolisForce = this.parameters.coriolis.default * 0.1;
        const coriolisVx = -coriolisForce * vy;
        const coriolisVy = coriolisForce * vx;
        
        return {
            vx: vx + radialVx + coriolisVx,
            vy: vy + radialVy + coriolisVy,
            pressure: 1 / (1 + distance * 0.01)
        };
    }

    updateVortex(deltaTime) {
        const dt = deltaTime * 0.001;
        
        // Évolution de la vitesse angulaire
        const targetAngularVel = this.parameters.vitesse.default * 10;
        this.vortex.angularVelocity += (targetAngularVel - this.vortex.angularVelocity) * dt * 2;
        
        // Pulsation du vortex
        const pulsation = Math.sin(this.temps * 0.002) * 0.2 + 1;
        this.vortex.intensity = this.parameters.intensite.default * pulsation;
        
        // Variation du rayon du cœur
        this.vortex.coreRadius = this.vortex.radius * 0.1 * (1 + Math.sin(this.temps * 0.003) * 0.3);
        
        // Mouvement du centre (instabilité)
        if (Math.random() < 0.01) {
            const wobble = 5;
            this.vortex.centerX += (Math.random() - 0.5) * wobble;
            this.vortex.centerY += (Math.random() - 0.5) * wobble;
        }
        
        // Retour vers le centre
        const originalCenterX = this.canvas.width / 2;
        const originalCenterY = this.canvas.height / 2;
        this.vortex.centerX += (originalCenterX - this.vortex.centerX) * dt * 0.5;
        this.vortex.centerY += (originalCenterY - this.vortex.centerY) * dt * 0.5;
    }

    updateDebris(deltaTime) {
        const dt = deltaTime * 0.001;
        
        this.debris.forEach((debris, index) => {
            if (!debris.active) return;
            
            // Calcul des forces du vortex
            const field = this.calculateVortexField(debris.x, debris.y);
            
            // Intégration physique
            debris.vx += field.vx * dt * 60 / debris.mass;
            debris.vy += field.vy * dt * 60 / debris.mass;
            
            // Mouvement vertical (aspiration/élévation)
            const distanceFromCenter = Math.sqrt(
                (debris.x - this.vortex.centerX) ** 2 + 
                (debris.y - this.vortex.centerY) ** 2
            );
            
            if (distanceFromCenter < this.vortex.coreRadius * 2) {
                debris.height += 100 * dt; // Aspiration vers le haut
            } else {
                debris.height *= 0.95; // Retombée
            }
            
            // Phase spirale pour mouvement 3D
            debris.spiralPhase += this.vortex.angularVelocity * dt;
            const spiralRadius = Math.max(0, distanceFromCenter - this.vortex.coreRadius);
            debris.x += Math.cos(debris.spiralPhase) * spiralRadius * 0.01;
            debris.y += Math.sin(debris.spiralPhase) * spiralRadius * 0.01;
            
            // Friction atmosphérique
            debris.vx *= 0.98;
            debris.vy *= 0.98;
            
            // Mise à jour position
            debris.x += debris.vx * dt * 60;
            debris.y += debris.vy * dt * 60;
            
            // Rotation
            debris.angularVel += field.vx * 0.001;
            debris.angle += debris.angularVel * dt * 60;
            
            // Trail
            debris.trail.unshift({ 
                x: debris.x, 
                y: debris.y, 
                height: debris.height,
                alpha: 1
            });
            if (debris.trail.length > 12) {
                debris.trail.pop();
            }
            
            // Mise à jour des alphas du trail
            debris.trail.forEach((point, i) => {
                point.alpha = (1 - i / debris.trail.length) * 0.8;
            });
            
            // Réinitialisation si trop éloigné
            if (distanceFromCenter > this.vortex.radius * 3) {
                debris.active = false;
                const newDebris = this.getDebrisFromPool();
                if (newDebris) {
                    this.resetDebris(newDebris, { 
                        x: this.vortex.centerX - this.vortex.radius,
                        y: this.vortex.centerY - this.vortex.radius,
                        width: this.vortex.radius * 2,
                        height: this.vortex.radius * 2
                    });
                    this.debris[index] = newDebris;
                }
            }
        });
    }

    updateTextDeformation(deltaTime) {
        if (!this.textVertices) return;
        
        const dt = deltaTime * 0.001;
        
        this.textVertices.forEach(vertex => {
            // Calcul de la déformation due au vortex
            const field = this.calculateVortexField(vertex.originalX, vertex.originalY);
            
            // Distance du centre pour moduler l'effet
            const dx = vertex.originalX - this.vortex.centerX;
            const dy = vertex.originalY - this.vortex.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Facteur de déformation basé sur la distance
            const deformationFactor = Math.max(0, 1 - distance / (this.vortex.radius * 1.5));
            
            // Torsion progressive
            const twistAngle = (this.temps * 0.001 * this.vortex.angularVelocity * deformationFactor) / (1 + distance * 0.01);
            const cos = Math.cos(twistAngle);
            const sin = Math.sin(twistAngle);
            
            // Application de la rotation
            const relX = vertex.originalX - this.vortex.centerX;
            const relY = vertex.originalY - this.vortex.centerY;
            
            vertex.deformedX = this.vortex.centerX + relX * cos - relY * sin;
            vertex.deformedY = this.vortex.centerY + relX * sin + relY * cos;
            
            // Ajout de la déformation du champ de vitesse
            vertex.deformedX += field.vx * deformationFactor * 0.5;
            vertex.deformedY += field.vy * deformationFactor * 0.5;
            
            // Effet 3D basé sur la hauteur
            const heightFactor = vertex.height * deformationFactor * 0.1;
            vertex.deformedX += heightFactor * Math.cos(twistAngle + Math.PI / 2);
            vertex.deformedY += heightFactor * Math.sin(twistAngle + Math.PI / 2);
        });
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.default;
        this.updateTextMetrics(element);
        
        if (!this.textPath) return;
        
        ctx.save();
        
        // Mise à jour des systèmes
        this.updateVortex(deltaTime);
        this.updateDebris(deltaTime);
        this.updateTextDeformation(deltaTime);
        
        // Rendu du champ de vortex (visualisation)
        this.renderVortexField(ctx);
        
        // Rendu des debris avec trails
        this.renderDebris(ctx);
        
        // Rendu du texte déformé
        this.renderDeformedText(ctx, element);
        
        // Rendu du centre du vortex (œil du cyclone)
        this.renderVortexCore(ctx);
        
        ctx.restore();
    }

    renderVortexField(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        
        // Visualisation des lignes de champ
        const step = 40;
        for (let x = 0; x < this.canvas.width; x += step) {
            for (let y = 0; y < this.canvas.height; y += step) {
                const field = this.calculateVortexField(x, y);
                const magnitude = Math.sqrt(field.vx * field.vx + field.vy * field.vy);
                
                if (magnitude > 1) {
                    ctx.strokeStyle = `rgba(100, 150, 200, ${Math.min(0.3, magnitude * 0.01)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + field.vx * 0.5, y + field.vy * 0.5);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }

    renderDebris(ctx) {
        this.debris.forEach(debris => {
            if (!debris.active) return;
            
            // Rendu du trail
            ctx.save();
            debris.trail.forEach((point, index) => {
                if (index === 0) return;
                
                const prevPoint = debris.trail[index - 1];
                const alpha = point.alpha * 0.6;
                const width = (debris.size * point.alpha) * 0.5;
                
                // Perspective 3D simple
                const perspective = 1 + point.height * 0.001;
                const displayX = point.x * perspective;
                const displayY = point.y * perspective;
                const prevDisplayX = prevPoint.x * (1 + prevPoint.height * 0.001);
                const prevDisplayY = prevPoint.y * (1 + prevPoint.height * 0.001);
                
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = `rgb(${debris.color.r}, ${debris.color.g}, ${debris.color.b})`;
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(prevDisplayX, prevDisplayY);
                ctx.lineTo(displayX, displayY);
                ctx.stroke();
            });
            ctx.restore();
            
            // Rendu du debris principal
            ctx.save();
            
            // Perspective 3D
            const perspective = 1 + debris.height * 0.001;
            const displayX = debris.x * perspective;
            const displayY = debris.y * perspective;
            const displaySize = debris.size * perspective;
            
            ctx.translate(displayX, displayY);
            ctx.rotate(debris.angle);
            
            // Glow effect
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, displaySize * 3);
            gradient.addColorStop(0, `rgba(${debris.color.r + 50}, ${debris.color.g + 30}, ${debris.color.b + 20}, 0.8)`);
            gradient.addColorStop(1, `rgba(${debris.color.r}, ${debris.color.g}, ${debris.color.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, displaySize * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Core du debris
            ctx.fillStyle = `rgb(${Math.min(255, debris.color.r + 100)}, ${Math.min(255, debris.color.g + 80)}, ${Math.min(255, debris.color.b + 60)})`;
            ctx.beginPath();
            ctx.arc(0, 0, displaySize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }

    renderDeformedText(ctx, element) {
        if (!this.textVertices || this.textVertices.length === 0) return;
        
        ctx.save();
        
        const fontSize = element.height * 0.8;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Regrouper les vertices par caractère
        const charGroups = {};
        this.textVertices.forEach(vertex => {
            if (!charGroups[vertex.charIndex]) {
                charGroups[vertex.charIndex] = [];
            }
            charGroups[vertex.charIndex].push(vertex);
        });
        
        // Rendu de chaque caractère déformé
        Object.keys(charGroups).forEach(charIndex => {
            const vertices = charGroups[charIndex];
            if (vertices.length === 0) return;
            
            const char = vertices[0].char;
            
            // Calculer la position moyenne déformée
            let avgX = 0, avgY = 0;
            vertices.forEach(v => {
                avgX += v.deformedX;
                avgY += v.deformedY;
            });
            avgX /= vertices.length;
            avgY /= vertices.length;
            
            // Calculer l'angle de déformation moyen
            const centerDx = avgX - this.vortex.centerX;
            const centerDy = avgY - this.vortex.centerY;
            const distanceFromCenter = Math.sqrt(centerDx * centerDx + centerDy * centerDy);
            
            const deformationAngle = (this.temps * 0.001 * this.vortex.angularVelocity) / (1 + distanceFromCenter * 0.01);
            
            // Couleur basée sur la déformation
            const deformationIntensity = Math.min(1, Math.abs(deformationAngle) * 2);
            const r = Math.floor(200 + deformationIntensity * 55);
            const g = Math.floor(150 + deformationIntensity * 105);
            const b = Math.floor(50 + deformationIntensity * 205);
            
            ctx.save();
            ctx.translate(avgX, avgY);
            ctx.rotate(deformationAngle * 0.5);
            
            // Glow effect intense
            ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
            ctx.shadowBlur = 15 + deformationIntensity * 10;
            
            // Gradient basé sur la position dans le vortex
            const gradient = ctx.createRadialGradient(-fontSize/4, -fontSize/4, 0, fontSize/4, fontSize/4, fontSize);
            gradient.addColorStop(0, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 1)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.8)`);
            
            ctx.fillStyle = gradient;
            ctx.fillText(char, 0, 0);
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    renderVortexCore(ctx) {
        ctx.save();
        
        // Œil du cyclone
        const eyeRadius = this.vortex.eyeRadius * (1 + Math.sin(this.temps * 0.005) * 0.3);
        
        // Gradient radial pour l'œil
        const gradient = ctx.createRadialGradient(
            this.vortex.centerX, this.vortex.centerY, 0,
            this.vortex.centerX, this.vortex.centerY, eyeRadius * 3
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)');
        gradient.addColorStop(0.7, 'rgba(100, 150, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(50, 100, 200, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.vortex.centerX, this.vortex.centerY, eyeRadius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Centre hypnotique
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.vortex.centerX, this.vortex.centerY, eyeRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    update(deltaTime) {
        // Évolution de l'intensité du vortex
        const intensityVariation = Math.sin(this.temps * 0.001) * 0.2 + 1;
        this.vortex.intensity *= intensityVariation;
        
        // Ajout de turbulence aléatoire
        if (Math.random() < 0.01) {
            this.vortex.angularVelocity += (Math.random() - 0.5) * 2;
        }
        
        // Gestion du pool de debris
        const activeDebris = this.debris.filter(d => d.active).length;
        if (activeDebris < this.parameters.particules.default * 0.8) {
            const newDebris = this.getDebrisFromPool();
            if (newDebris) {
                this.resetDebris(newDebris, {
                    x: this.vortex.centerX - this.vortex.radius,
                    y: this.vortex.centerY - this.vortex.radius,
                    width: this.vortex.radius * 2,
                    height: this.vortex.radius * 2
                });
                this.debris.push(newDebris);
            }
        }
    }

    destroy() {
        this.debris = [];
        this.debrisPool = [];
        this.textVertices = [];
        this.deformedVertices = [];
        this.fieldCache.clear();
        this.textPath = null;
        this.turbulenceNoise = null;
        this.fluidField.velocityField = null;
        this.fluidField.pressureField = null;
        this.canvas = null;
        this.ctx = null;
    }
}