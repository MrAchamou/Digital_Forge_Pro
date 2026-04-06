class DimensionShiftEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'dimensional-2d3d-transition-052',
            name: 'Transition Dimensionnelle Fluide',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                couleur: { type: 'color', default: '#4a90e2' },
                profondeur: { type: 'range', min: 0.1, max: 2, default: 1 },
                paradoxe: { type: 'range', min: 0, max: 1, default: 0.7 }
            }
        });

        // Variables dimensionnelles
        this.temps = 0;
        this.cycleDuration = 10000; // 10 secondes par cycle
        this.dimensionProgress = 0; // 0 = 2D, 1 = 3D
        this.isExtruding = true;
        
        // Géométrie secrète (points de contrôle 3D)
        this.secretGeometry = this.generateSecretGeometry();
        this.dimensionalLayers = [];
        this.maxLayers = 12;
        this.initDimensionalLayers();
        
        // Angles impossibles
        this.impossibleAngles = [];
        this.maxImpossibleAngles = 8;
        this.initImpossibleAngles();
        
        // Particules dimensionnelles
        this.dimensionalParticles = [];
        this.maxParticles = 80;
        this.initDimensionalParticles();
        
        // Matrice de transformation 3D
        this.transformMatrix = this.createIdentityMatrix();
        this.perspectiveDistance = 800;
        
        // Paradoxes visuels
        this.paradoxPoints = this.generateParadoxPoints();
        this.dimensionalMemory = new Map(); // Conservation des infos volumétriques
        
        // Variation unique par cycle
        this.geometryVariation = Math.random() * 0.4 + 0.6;
        this.uniqueRotation = Math.random() * Math.PI;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Calcul du centre de transformation
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        // Initialisation de la mémoire dimensionnelle
        this.initDimensionalMemory();
    }

    generateSecretGeometry() {
        const geometry = [];
        const sections = 16; // Plus de sections pour plus de fluidité
        
        for (let i = 0; i < sections; i++) {
            const angle = (i / sections) * Math.PI * 2;
            const variation = Math.sin(angle * 3) * 0.3 + 0.7;
            
            geometry.push({
                angle: angle,
                radius: 0.5 * variation,
                depth: Math.sin(angle * 2) * 0.4,
                twist: Math.cos(angle * 5) * 0.2,
                originalIndex: i
            });
        }
        
        return geometry;
    }

    initDimensionalLayers() {
        for (let i = 0; i < this.maxLayers; i++) {
            const layer = {
                depth: i / this.maxLayers,
                opacity: 0,
                scale: 1 - (i * 0.02),
                rotation: (i * Math.PI) / this.maxLayers,
                offset: {
                    x: Math.sin(i * 0.5) * 2,
                    y: Math.cos(i * 0.7) * 2
                },
                active: false,
                color: this.generateLayerColor(i)
            };
            this.dimensionalLayers.push(layer);
        }
    }

    initImpossibleAngles() {
        for (let i = 0; i < this.maxImpossibleAngles; i++) {
            this.impossibleAngles.push({
                startAngle: (i / this.maxImpossibleAngles) * Math.PI * 2,
                endAngle: ((i + 1) / this.maxImpossibleAngles) * Math.PI * 2,
                twist: Math.random() * Math.PI,
                visibility: 0,
                paradoxIntensity: Math.random(),
                geometryIndex: Math.floor(Math.random() * this.secretGeometry.length)
            });
        }
    }

    initDimensionalParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.dimensionalParticles.push({
                x: 0, y: 0, z: 0,
                vx: 0, vy: 0, vz: 0,
                size: 1,
                opacity: 0,
                life: 0,
                maxLife: 1,
                dimensionState: 0, // État dimensionnel de la particule
                active: false,
                type: Math.floor(Math.random() * 3), // 0: extrusion, 1: compression, 2: twist
                originalPos: { x: 0, y: 0 }
            });
        }
    }

    generateLayerColor(index) {
        const hue = (index * 30) % 360;
        const saturation = 60 + (index * 5) % 40;
        const lightness = 50 + (index * 8) % 30;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    generateParadoxPoints() {
        const points = [];
        for (let i = 0; i < 20; i++) {
            points.push({
                x: Math.random(),
                y: Math.random(),
                z: Math.random() * 2 - 1,
                intensity: Math.random(),
                frequency: Math.random() * 0.05 + 0.02,
                phase: Math.random() * Math.PI * 2
            });
        }
        return points;
    }

    initDimensionalMemory() {
        // Stockage des informations volumétriques pour créer des paradoxes
        const segments = 32;
        for (let i = 0; i < segments; i++) {
            const key = `segment_${i}`;
            this.dimensionalMemory.set(key, {
                original2D: { x: Math.random(), y: Math.random() },
                projected3D: { x: 0, y: 0, z: 0 },
                volumetricData: Math.random() * 0.5 + 0.5,
                lastSeen: 0
            });
        }
    }

    createIdentityMatrix() {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Calcul du progrès dimensionnel avec easing complexe
        const cycleProgress = (this.temps % this.cycleDuration) / this.cycleDuration;
        const easedProgress = this.easeInOutElastic(cycleProgress);
        
        // Détermination de la phase (2D→3D ou 3D→2D)
        if (easedProgress < 0.5) {
            this.isExtruding = true;
            this.dimensionProgress = easedProgress * 2;
        } else {
            this.isExtruding = false;
            this.dimensionProgress = 2 - (easedProgress * 2);
        }
        
        // Application de la variation géométrique
        this.dimensionProgress *= this.geometryVariation;
        
        // Mise à jour des couches dimensionnelles
        this.updateDimensionalLayers();
        
        // Mise à jour des angles impossibles
        this.updateImpossibleAngles();
        
        // Mise à jour des particules
        this.updateDimensionalParticles(deltaTime);
        
        // Mise à jour de la matrice de transformation 3D
        this.updateTransformMatrix();
        
        // Génération de nouvelles particules
        if (Math.random() < 0.4 && this.dimensionProgress > 0.1) {
            this.spawnDimensionalParticle();
        }
    }

    updateDimensionalLayers() {
        this.dimensionalLayers.forEach((layer, index) => {
            // Activation progressive selon la progression dimensionnelle
            const activationThreshold = index / this.maxLayers;
            layer.active = this.dimensionProgress > activationThreshold;
            
            if (layer.active) {
                // Opacité basée sur la profondeur et la progression
                const depthFactor = 1 - Math.abs(layer.depth - this.dimensionProgress);
                layer.opacity = depthFactor * this.parameters.intensite.value * 0.6;
                
                // Rotation evolutive
                layer.rotation += Math.sin(this.temps * 0.001 + index) * 0.01;
                
                // Décalage basé sur la géométrie secrète
                const geometryPoint = this.secretGeometry[index % this.secretGeometry.length];
                layer.offset.x = Math.sin(geometryPoint.angle + this.uniqueRotation) * geometryPoint.radius * 20;
                layer.offset.y = Math.cos(geometryPoint.angle + this.uniqueRotation) * geometryPoint.radius * 20;
            } else {
                layer.opacity = 0;
            }
        });
    }

    updateImpossibleAngles() {
        this.impossibleAngles.forEach((angle, index) => {
            // Visibilité des angles impossibles pendant la transition
            const transitionZone = Math.abs(0.5 - (this.dimensionProgress % 1));
            const isInTransition = transitionZone > 0.3;
            
            if (isInTransition) {
                angle.visibility = Math.min(1, angle.visibility + 0.05);
                
                // Twist évolutif pendant la transition
                angle.twist += Math.sin(this.temps * 0.002 + index) * 0.02;
                
                // Intensité du paradoxe
                angle.paradoxIntensity = Math.sin(this.temps * 0.003 + index * 0.5) * 0.5 + 0.5;
            } else {
                angle.visibility = Math.max(0, angle.visibility - 0.03);
            }
        });
    }

    updateDimensionalParticles(deltaTime) {
        this.dimensionalParticles.forEach(particle => {
            if (!particle.active) return;
            
            particle.life += deltaTime / 1000;
            
            // Mouvement dimensionnel
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            particle.z += particle.vz * deltaTime / 16;
            
            // État dimensionnel de la particule
            particle.dimensionState = this.dimensionProgress;
            
            // Opacité basée sur l'état dimensionnel
            const lifeRatio = Math.min(1, particle.life / particle.maxLife);
            particle.opacity = Math.sin(lifeRatio * Math.PI) * particle.dimensionState;
            
            // Comportement selon le type
            switch(particle.type) {
                case 0: // Extrusion
                    particle.vz = Math.sin(this.temps * 0.001) * 0.1;
                    break;
                case 1: // Compression
                    particle.vz = -Math.cos(this.temps * 0.001) * 0.1;
                    break;
                case 2: // Twist
                    const twist = Math.sin(this.temps * 0.002 + particle.originalPos.x);
                    particle.vx += twist * 0.02;
                    particle.vy += Math.cos(twist) * 0.02;
                    break;
            }
            
            // Désactivation
            if (particle.life >= particle.maxLife) {
                particle.active = false;
            }
        });
    }

    updateTransformMatrix() {
        const rotationX = Math.sin(this.temps * 0.0008) * this.dimensionProgress * 0.3;
        const rotationY = Math.cos(this.temps * 0.001) * this.dimensionProgress * 0.2;
        const rotationZ = this.uniqueRotation * this.dimensionProgress * 0.1;
        
        // Matrice de rotation combinée (simplifiée pour performance)
        this.transformMatrix = [
            [Math.cos(rotationY), 0, Math.sin(rotationY), 0],
            [0, Math.cos(rotationX), -Math.sin(rotationX), 0],
            [-Math.sin(rotationY), Math.sin(rotationX), Math.cos(rotationY) * Math.cos(rotationX), 0],
            [0, 0, 0, 1]
        ];
    }

    spawnDimensionalParticle() {
        const particle = this.dimensionalParticles.find(p => !p.active);
        if (!particle) return;
        
        particle.active = true;
        
        // Position basée sur la géométrie secrète
        const geometryPoint = this.secretGeometry[Math.floor(Math.random() * this.secretGeometry.length)];
        particle.originalPos.x = geometryPoint.angle / (Math.PI * 2);
        particle.originalPos.y = geometryPoint.radius;
        
        particle.x = this.centerX + Math.sin(geometryPoint.angle) * geometryPoint.radius * 100;
        particle.y = this.centerY + Math.cos(geometryPoint.angle) * geometryPoint.radius * 100;
        particle.z = geometryPoint.depth * 50;
        
        particle.vx = (Math.random() - 0.5) * 0.3;
        particle.vy = (Math.random() - 0.5) * 0.3;
        particle.vz = (Math.random() - 0.5) * 0.2;
        
        particle.size = Math.random() * 2 + 1;
        particle.life = 0;
        particle.maxLife = Math.random() * 4 + 3;
        particle.type = Math.floor(Math.random() * 3);
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Rendu des couches dimensionnelles (du fond vers l'avant)
        this.renderDimensionalLayers(ctx, element);
        
        // Rendu de l'image principale avec transformation 3D
        this.render3DTransformedImage(ctx, element);
        
        // Rendu des angles impossibles
        this.renderImpossibleAngles(ctx, element);
        
        // Rendu des particules dimensionnelles
        this.renderDimensionalParticles(ctx, element);
        
        // Rendu des paradoxes visuels
        this.renderParadoxes(ctx, element);
        
        ctx.restore();
    }

    renderDimensionalLayers(ctx, element) {
        // Tri des couches par profondeur
        const sortedLayers = [...this.dimensionalLayers]
            .filter(layer => layer.active && layer.opacity > 0)
            .sort((a, b) => b.depth - a.depth);
        
        sortedLayers.forEach(layer => {
            ctx.save();
            ctx.globalAlpha = layer.opacity;
            
            // Position avec décalage dimensionnel
            const x = element.x + layer.offset.x;
            const y = element.y + layer.offset.y;
            
            // Transformation 3D simulée
            ctx.translate(x + element.width/2, y + element.height/2);
            ctx.rotate(layer.rotation);
            ctx.scale(layer.scale, layer.scale * (1 - layer.depth * 0.2));
            ctx.translate(-element.width/2, -element.height/2);
            
            // Couleur basée sur la profondeur
            ctx.fillStyle = layer.color;
            ctx.fillRect(0, 0, element.width, element.height);
            
            // Effet de profondeur avec dégradé
            if (layer.depth > 0.5) {
                const gradient = ctx.createLinearGradient(0, 0, element.width, element.height);
                gradient.addColorStop(0, `rgba(74, 144, 226, ${layer.depth * 0.3})`);
                gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, element.width, element.height);
            }
            
            ctx.restore();
        });
    }

    render3DTransformedImage(ctx, element) {
        ctx.save();
        
        // Application de la perspective 3D
        const perspective = 1 - (this.dimensionProgress * 0.3);
        const skewX = Math.sin(this.temps * 0.001) * this.dimensionProgress * 0.1;
        const skewY = Math.cos(this.temps * 0.0008) * this.dimensionProgress * 0.05;
        
        ctx.translate(this.centerX, this.centerY);
        
        // Transformation 3D simulée
        ctx.transform(perspective, skewY, skewX, perspective, 0, 0);
        
        // Extrusion visuelle
        const extrusionDepth = this.dimensionProgress * this.parameters.profondeur.value * 20;
        for (let i = 0; i < extrusionDepth; i++) {
            ctx.save();
            ctx.globalAlpha = (1 - i / extrusionDepth) * 0.1;
            ctx.translate(-i * 0.5, -i * 0.3);
            
            ctx.fillStyle = this.parameters.couleur.value;
            ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
            
            ctx.restore();
        }
        
        // Image principale
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.parameters.couleur.value;
        ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
        
        ctx.restore();
    }

    renderImpossibleAngles(ctx, element) {
        this.impossibleAngles.forEach((angle, index) => {
            if (angle.visibility <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = angle.visibility * angle.paradoxIntensity;
            
            // Position basée sur la géométrie secrète
            const geometryRef = this.secretGeometry[angle.geometryIndex];
            const centerX = element.x + element.width/2;
            const centerY = element.y + element.height/2;
            
            // Calcul des points de l'angle impossible
            const radius = Math.min(element.width, element.height) * 0.3;
            const startX = centerX + Math.cos(angle.startAngle + angle.twist) * radius;
            const startY = centerY + Math.sin(angle.startAngle + angle.twist) * radius;
            const endX = centerX + Math.cos(angle.endAngle - angle.twist) * radius;
            const endY = centerY + Math.sin(angle.endAngle - angle.twist) * radius;
            
            // Ligne impossible (paradoxale)
            ctx.strokeStyle = `rgba(255, 255, 255, ${angle.visibility})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            // Courbe impossible
            const midX = centerX + Math.cos(angle.startAngle + (angle.endAngle - angle.startAngle)/2) * radius * 1.5;
            const midY = centerY + Math.sin(angle.startAngle + (angle.endAngle - angle.startAngle)/2) * radius * 1.5;
            ctx.quadraticCurveTo(midX, midY, endX, endY);
            ctx.stroke();
            
            ctx.restore();
        });
    }

    renderDimensionalParticles(ctx, element) {
        this.dimensionalParticles.forEach(particle => {
            if (!particle.active || particle.opacity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            
            // Projection 3D vers 2D
            const projectedX = particle.x + (particle.z * 0.3);
            const projectedY = particle.y + (particle.z * 0.2);
            const projectedSize = particle.size * (1 + particle.z * 0.01);
            
            // Couleur selon le type
            let color;
            switch(particle.type) {
                case 0: color = '#4a90e2'; break;
                case 1: color = '#e24a4a'; break;
                case 2: color = '#4ae290'; break;
                default: color = '#ffffff';
            }
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Trail dimensionnel
            if (particle.dimensionState > 0.5) {
                ctx.globalAlpha *= 0.3;
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.originalPos.x * element.width + element.x, 
                          particle.originalPos.y * element.height + element.y);
                ctx.lineTo(projectedX, projectedY);
                ctx.stroke();
            }
            
            ctx.restore();
        });
    }

    renderParadoxes(ctx, element) {
        const paradoxIntensity = this.parameters.paradoxe.value * this.dimensionProgress;
        if (paradoxIntensity < 0.1) return;
        
        ctx.save();
        ctx.globalAlpha = paradoxIntensity * 0.4;
        
        this.paradoxPoints.forEach((point, index) => {
            const oscillation = Math.sin(this.temps * point.frequency + point.phase);
            const x = element.x + point.x * element.width;
            const y = element.y + point.y * element.height;
            const z = point.z * oscillation;
            
            // Point paradoxal (existe en 2D et 3D simultanément)
            const size = (3 + z * 2) * point.intensity;
            const hue = (index * 45 + this.temps * 0.1) % 360;
            
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${point.intensity})`;
            ctx.beginPath();
            ctx.arc(x + z * 5, y + z * 3, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Information volumétrique conservée
            if (Math.abs(z) > 0.5) {
                ctx.strokeStyle = `hsla(${hue}, 50%, 80%, 0.3)`;
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 2]);
                ctx.beginPath();
                ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }

    easeInOutElastic(t) {
        const c5 = (2 * Math.PI) / 4.5;
        
        return t === 0 ? 0 : t === 1 ? 1 :
               t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2 :
               (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    }

    destroy() {
        this.secretGeometry = [];
        this.dimensionalLayers = [];
        this.impossibleAngles = [];
        this.dimensionalParticles = [];
        this.paradoxPoints = [];
        this.dimensionalMemory.clear();
        this.transformMatrix = null;
    }
}