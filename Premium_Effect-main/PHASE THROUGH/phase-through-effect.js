class PhaseThroughEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'matter-phase-intangibility-055',
            name: 'Intangibilité Phasique Sélective',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                couleur: { type: 'color', default: '#00ffff' },
                selectivite: { type: 'range', min: 0.1, max: 0.9, default: 0.4 },
                ondulation: { type: 'range', min: 0.3, max: 2, default: 0.8 }
            }
        });

        // Variables de phase
        this.temps = 0;
        this.phaseWaves = [];
        this.virtualObjects = [];
        this.phaseNodes = [];
        this.molecularGrid = [];
        this.interactionZones = [];
        
        // États de phase
        this.currentPhase = 'solid';
        this.phaseTransition = 0;
        this.nextPhaseChange = Math.random() * 3000 + 2000;
        
        // Pool d'objets pour performance
        this.wavePool = [];
        this.nodePool = [];
        this.maxWaves = 50;
        this.maxNodes = 200;
        
        this.initializePools();
    }

    initializePools() {
        // Pool de vagues de phase
        for (let i = 0; i < this.maxWaves; i++) {
            this.wavePool.push({
                x: 0, y: 0, radius: 0, intensity: 0,
                speed: 0, active: false, type: 'normal'
            });
        }
        
        // Pool de nœuds moléculaires
        for (let i = 0; i < this.maxNodes; i++) {
            this.nodePool.push({
                x: 0, y: 0, phase: 0, opacity: 0,
                size: 0, active: false, vibration: 0
            });
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Créer objets virtuels à traverser
        this.createVirtualObjects();
        
        // Initialiser grille moléculaire
        this.initializeMolecularGrid();
        
        // Zones d'interaction sélective
        this.setupInteractionZones();
    }

    createVirtualObjects() {
        this.virtualObjects = [];
        const count = 4 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < count; i++) {
            this.virtualObjects.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                width: 60 + Math.random() * 120,
                height: 60 + Math.random() * 120,
                type: Math.random() < this.parameters.selectivite.default ? 'passable' : 'solid',
                opacity: 0.3 + Math.random() * 0.4,
                rotation: Math.random() * Math.PI * 2,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }

    initializeMolecularGrid() {
        this.molecularGrid = [];
        const gridSize = 20;
        
        for (let x = 0; x < 800; x += gridSize) {
            for (let y = 0; y < 600; y += gridSize) {
                const node = this.getPooledNode();
                if (node) {
                    node.x = x;
                    node.y = y;
                    node.phase = Math.random() * Math.PI * 2;
                    node.size = 2 + Math.random() * 3;
                    node.vibration = Math.random() * 0.5;
                    node.active = true;
                    this.molecularGrid.push(node);
                }
            }
        }
    }

    setupInteractionZones() {
        this.interactionZones = [];
        for (let i = 0; i < 6; i++) {
            this.interactionZones.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                radius: 80 + Math.random() * 60,
                strength: 0.3 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2,
                type: Math.random() < 0.5 ? 'attract' : 'repel'
            });
        }
    }

    getPooledWave() {
        return this.wavePool.find(wave => !wave.active);
    }

    getPooledNode() {
        return this.nodePool.find(node => !node.active);
    }

    createPhaseWave(x, y, intensity, type = 'normal') {
        const wave = this.getPooledWave();
        if (wave) {
            wave.x = x;
            wave.y = y;
            wave.radius = 0;
            wave.intensity = intensity;
            wave.speed = 2 + Math.random() * 3;
            wave.active = true;
            wave.type = type;
            this.phaseWaves.push(wave);
        }
    }

    calculatePhaseState(x, y) {
        let phaseValue = 0;
        const elementCenterX = this.element.x + this.element.width / 2;
        const elementCenterY = this.element.y + this.element.height / 2;
        
        // Distance du centre de l'élément
        const distToCenter = Math.sqrt(
            Math.pow(x - elementCenterX, 2) + 
            Math.pow(y - elementCenterY, 2)
        );
        
        // Ondulations de base
        phaseValue += Math.sin(this.temps * 0.003 + distToCenter * 0.02) * 0.3;
        
        // Influence des vagues de phase
        for (const wave of this.phaseWaves) {
            if (!wave.active) continue;
            
            const dist = Math.sqrt(Math.pow(x - wave.x, 2) + Math.pow(y - wave.y, 2));
            if (dist < wave.radius) {
                const influence = (1 - dist / wave.radius) * wave.intensity;
                phaseValue += influence * Math.sin(this.temps * 0.005);
            }
        }
        
        // Zones d'interaction
        for (const zone of this.interactionZones) {
            const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
            if (dist < zone.radius) {
                const influence = (1 - dist / zone.radius) * zone.strength;
                const phaseShift = Math.sin(this.temps * 0.004 + zone.phase);
                phaseValue += influence * phaseShift * (zone.type === 'attract' ? 1 : -1);
            }
        }
        
        return Math.max(0, Math.min(1, (phaseValue + 1) / 2));
    }

    checkCollisionWithObjects(x, y) {
        for (const obj of this.virtualObjects) {
            if (x >= obj.x && x <= obj.x + obj.width &&
                y >= obj.y && y <= obj.y + obj.height) {
                return obj;
            }
        }
        return null;
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.default;
        
        // Gestion des changements de phase imprévisibles
        this.nextPhaseChange -= deltaTime;
        if (this.nextPhaseChange <= 0) {
            this.triggerPhaseChange();
            this.nextPhaseChange = 1500 + Math.random() * 3000;
        }
        
        // Mise à jour des vagues de phase
        this.phaseWaves = this.phaseWaves.filter(wave => {
            if (!wave.active) return false;
            
            wave.radius += wave.speed * deltaTime * 0.1;
            wave.intensity *= 0.995;
            
            if (wave.intensity < 0.01 || wave.radius > 400) {
                wave.active = false;
                return false;
            }
            return true;
        });
        
        // Mise à jour grille moléculaire
        for (const node of this.molecularGrid) {
            if (!node.active) continue;
            
            node.phase += deltaTime * 0.002 * (1 + node.vibration);
            node.opacity = this.calculatePhaseState(node.x, node.y);
            
            // Vibration moléculaire
            node.vibration = 0.3 + Math.sin(this.temps * 0.01 + node.phase) * 0.2;
        }
        
        // Mise à jour zones d'interaction
        for (const zone of this.interactionZones) {
            zone.phase += deltaTime * 0.001;
            zone.x += Math.sin(zone.phase) * 0.5;
            zone.y += Math.cos(zone.phase * 1.3) * 0.3;
            
            // Maintenir dans les limites
            zone.x = Math.max(50, Math.min(750, zone.x));
            zone.y = Math.max(50, Math.min(550, zone.y));
        }
        
        // Génération aléatoire de vagues
        if (Math.random() < 0.02) {
            this.createPhaseWave(
                Math.random() * 800,
                Math.random() * 600,
                0.4 + Math.random() * 0.6,
                Math.random() < 0.3 ? 'molecular' : 'normal'
            );
        }
    }

    triggerPhaseChange() {
        const phases = ['solid', 'liquid', 'gas', 'plasma'];
        const newPhase = phases[Math.floor(Math.random() * phases.length)];
        
        if (newPhase !== this.currentPhase) {
            this.currentPhase = newPhase;
            
            // Créer vague de changement de phase
            this.createPhaseWave(
                this.element.x + this.element.width / 2,
                this.element.y + this.element.height / 2,
                0.8,
                'phase-change'
            );
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Rendu des objets virtuels
        this.renderVirtualObjects(ctx);
        
        // Rendu de la grille moléculaire
        this.renderMolecularGrid(ctx);
        
        // Rendu des zones d'interaction
        this.renderInteractionZones(ctx);
        
        // Rendu de l'élément avec effet de phase
        this.renderPhasedElement(ctx, element);
        
        // Rendu des vagues de phase
        this.renderPhaseWaves(ctx);
        
        // Effets de profondeur
        this.renderDepthEffects(ctx);
        
        ctx.restore();
    }

    renderVirtualObjects(ctx) {
        for (const obj of this.virtualObjects) {
            ctx.save();
            ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2);
            ctx.rotate(obj.rotation);
            
            // Style selon le type
            if (obj.type === 'passable') {
                ctx.strokeStyle = obj.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = obj.opacity * 0.6;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            } else {
                ctx.fillStyle = obj.color;
                ctx.globalAlpha = obj.opacity;
                ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            }
            
            ctx.restore();
        }
    }

    renderMolecularGrid(ctx) {
        for (const node of this.molecularGrid) {
            if (!node.active || node.opacity < 0.1) continue;
            
            const phase = this.calculatePhaseState(node.x, node.y);
            const size = node.size * (0.5 + phase * 0.5);
            
            ctx.save();
            ctx.globalAlpha = node.opacity * this.parameters.intensite.default;
            
            // Couleur selon la phase
            const hue = (phase * 120 + this.temps * 0.1) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, ${50 + phase * 30}%)`;
            
            // Vibration moléculaire
            const offsetX = Math.sin(node.phase) * node.vibration;
            const offsetY = Math.cos(node.phase * 1.3) * node.vibration;
            
            ctx.beginPath();
            ctx.arc(node.x + offsetX, node.y + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Connexions entre nœuds proches
            if (Math.random() < 0.1) {
                this.renderMolecularBonds(ctx, node);
            }
            
            ctx.restore();
        }
    }

    renderMolecularBonds(ctx, node) {
        const bondLength = 40;
        
        for (const otherNode of this.molecularGrid) {
            if (otherNode === node || !otherNode.active) continue;
            
            const dist = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) + 
                Math.pow(node.y - otherNode.y, 2)
            );
            
            if (dist < bondLength && dist > 0) {
                const strength = 1 - (dist / bondLength);
                const phase1 = this.calculatePhaseState(node.x, node.y);
                const phase2 = this.calculatePhaseState(otherNode.x, otherNode.y);
                const avgPhase = (phase1 + phase2) / 2;
                
                ctx.save();
                ctx.globalAlpha = strength * avgPhase * 0.3;
                ctx.strokeStyle = this.parameters.couleur.default;
                ctx.lineWidth = strength * 2;
                
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(otherNode.x, otherNode.y);
                ctx.stroke();
                
                ctx.restore();
                break; // Une seule connexion par nœud pour performance
            }
        }
    }

    renderInteractionZones(ctx) {
        for (const zone of this.interactionZones) {
            ctx.save();
            
            const intensity = 0.5 + Math.sin(this.temps * 0.003 + zone.phase) * 0.3;
            ctx.globalAlpha = intensity * 0.15;
            
            // Gradient radial
            const gradient = ctx.createRadialGradient(
                zone.x, zone.y, 0,
                zone.x, zone.y, zone.radius
            );
            
            const color = zone.type === 'attract' ? '#00ffff' : '#ff6600';
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    renderPhasedElement(ctx, element) {
        ctx.save();
        
        // Calculer l'état de phase moyen de l'élément
        const samples = 16;
        let avgPhase = 0;
        
        for (let i = 0; i < samples; i++) {
            const x = element.x + (element.width / samples) * i;
            const y = element.y + element.height / 2;
            avgPhase += this.calculatePhaseState(x, y);
        }
        avgPhase /= samples;
        
        // Transparence basée sur la phase
        const baseOpacity = element.opacity || 1;
        ctx.globalAlpha = baseOpacity * (0.3 + avgPhase * 0.7);
        
        // Filtre de couleur selon la phase
        const phaseHue = avgPhase * 180;
        ctx.filter = `hue-rotate(${phaseHue}deg) saturate(${1 + avgPhase}) brightness(${0.8 + avgPhase * 0.4})`;
        
        // Rendu avec distorsion de phase
        this.renderWithPhaseDistortion(ctx, element, avgPhase);
        
        ctx.restore();
    }

    renderWithPhaseDistortion(ctx, element, phaseLevel) {
        const segments = 20;
        const segmentWidth = element.width / segments;
        
        for (let i = 0; i < segments; i++) {
            const x = element.x + i * segmentWidth;
            const localPhase = this.calculatePhaseState(x, element.y + element.height / 2);
            
            // Distorsion verticale
            const distortion = Math.sin(this.temps * 0.005 + i * 0.5) * localPhase * 10;
            
            ctx.save();
            ctx.globalAlpha *= 0.7 + localPhase * 0.3;
            
            // Transformation locale
            ctx.translate(x + segmentWidth/2, element.y + element.height/2);
            ctx.scale(1, 1 + localPhase * 0.2);
            ctx.translate(0, distortion);
            
            // Rendu du segment
            if (element.content && element.content.tagName === 'IMG') {
                const sourceX = (i / segments) * element.content.width;
                const sourceWidth = element.content.width / segments;
                
                ctx.drawImage(
                    element.content,
                    sourceX, 0, sourceWidth, element.content.height,
                    -segmentWidth/2, -element.height/2, segmentWidth, element.height
                );
            } else {
                ctx.fillStyle = element.color || '#ffffff';
                ctx.fillRect(-segmentWidth/2, -element.height/2, segmentWidth, element.height);
            }
            
            ctx.restore();
        }
    }

    renderPhaseWaves(ctx) {
        for (const wave of this.phaseWaves) {
            if (!wave.active) continue;
            
            ctx.save();
            ctx.globalAlpha = wave.intensity;
            
            // Style selon le type de vague
            let strokeStyle = this.parameters.couleur.default;
            let lineWidth = 2;
            
            if (wave.type === 'molecular') {
                strokeStyle = '#ff00ff';
                lineWidth = 1;
                ctx.setLineDash([2, 2]);
            } else if (wave.type === 'phase-change') {
                strokeStyle = '#ffff00';
                lineWidth = 3;
            }
            
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            
            // Cercles concentriques
            const rings = 3;
            for (let r = 0; r < rings; r++) {
                const radius = wave.radius - (r * 15);
                if (radius > 0) {
                    ctx.globalAlpha = wave.intensity * (1 - r / rings);
                    ctx.beginPath();
                    ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        }
    }

    renderDepthEffects(ctx) {
        // Effet de profondeur avec particules flottantes
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const x = (this.temps * 0.1 + i * 40) % 820 - 10;
            const y = (this.temps * 0.05 + i * 30) % 620 - 10;
            const phase = this.calculatePhaseState(x, y);
            const size = 1 + phase * 2;
            
            ctx.fillStyle = `hsla(${180 + phase * 60}, 70%, 70%, ${phase})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    destroy() {
        // Désactiver tous les objets poolés
        this.wavePool.forEach(wave => wave.active = false);
        this.nodePool.forEach(node => node.active = false);
        
        // Vider les arrays
        this.phaseWaves.length = 0;
        this.virtualObjects.length = 0;
        this.phaseNodes.length = 0;
        this.molecularGrid.length = 0;
        this.interactionZones.length = 0;
        
        // Reset des variables
        this.temps = 0;
        this.currentPhase = 'solid';
        this.phaseTransition = 0;
    }
}