class ElectricFormEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'lightning-text-genesis-008',
            name: 'Genèse par Arcs Électriques',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.5, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0.3, max: 1, default: 0.8 },
                couleurPrimaire: { type: 'color', default: '#00ffff' },
                couleurSecondaire: { type: 'color', default: '#ffffff' },
                epaisseurArc: { type: 'range', min: 1, max: 5, default: 2 },
                densite: { type: 'range', min: 0.3, max: 1, default: 0.6 },
                chaosFactor: { type: 'range', min: 0.1, max: 0.8, default: 0.4 }
            }
        });

        // Variables temporelles
        this.temps = 0;
        this.pulseTimer = 0;
        this.formationProgress = 0;

        // Systèmes de particules
        this.arcs = [];
        this.etincelles = [];
        this.noeuds = [];
        this.connections = [];
        
        // Pool d'objets pour performance
        this.arcPool = [];
        this.etincellePool = [];
        
        // Cache des chemins de lettres
        this.letterPaths = new Map();
        this.targetPoints = [];
        
        // États de formation
        this.formationPhase = 0; // 0: chaos, 1: connexion, 2: formation, 3: maintenance
        this.phaseTimer = 0;
        
        // Noise pour chaos organique
        this.noiseOffset = Math.random() * 1000;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Calcul des points cibles du texte
        this.calculateLetterPoints();
        
        // Initialisation des pools
        this.initializePools();
        
        // Génération des noeuds électriques initiaux
        this.generateElectricNodes();
        
        // Reset des timers
        this.temps = 0;
        this.formationProgress = 0;
        this.formationPhase = 0;
    }

    calculateLetterPoints() {
        this.targetPoints = [];
        const text = this.element.content || 'ELECTRIC';
        const fontSize = Math.min(this.element.width / text.length * 1.2, this.element.height * 0.8);
        
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        
        // Échantillonnage des contours de lettres
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = this.ctx.measureText(char).width;
            const startX = centerX - (this.ctx.measureText(text).width / 2) + 
                          this.ctx.measureText(text.substring(0, i)).width + charWidth / 2;
            
            // Points d'échantillonnage pour chaque lettre
            const points = this.sampleCharacterPoints(char, startX, centerY, fontSize);
            this.targetPoints.push(...points);
        }
    }

    sampleCharacterPoints(char, x, y, size) {
        const points = [];
        const density = Math.floor(this.config.parameters.densite.default * 50 + 20);
        
        // Création d'un canvas temporaire pour échantillonner
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size * 2;
        tempCanvas.height = size * 2;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.font = `bold ${size}px Arial`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillText(char, size, size);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Échantillonnage des pixels non transparents
        for (let i = 0; i < density; i++) {
            let attempts = 0;
            while (attempts < 100) {
                const px = Math.floor(Math.random() * tempCanvas.width);
                const py = Math.floor(Math.random() * tempCanvas.height);
                const index = (py * tempCanvas.width + px) * 4;
                
                if (imageData.data[index + 3] > 128) { // Alpha > 128
                    points.push({
                        x: x + (px - size),
                        y: y + (py - size),
                        targetReached: false,
                        connectionStrength: 0
                    });
                    break;
                }
                attempts++;
            }
        }
        
        return points;
    }

    initializePools() {
        // Pool d'arcs électriques
        for (let i = 0; i < 100; i++) {
            this.arcPool.push(this.createArc());
        }
        
        // Pool d'étincelles
        for (let i = 0; i < 200; i++) {
            this.etincellePool.push(this.createEtincelle());
        }
    }

    createArc() {
        return {
            active: false,
            startX: 0, startY: 0,
            endX: 0, endY: 0,
            controlPoints: [],
            intensity: 0,
            life: 0,
            maxLife: 0,
            thickness: 1,
            branches: []
        };
    }

    createEtincelle() {
        return {
            active: false,
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0,
            maxLife: 0,
            intensity: 0,
            size: 1
        };
    }

    generateElectricNodes() {
        this.noeuds = [];
        const nodeCount = Math.floor(this.targetPoints.length * 0.3);
        
        for (let i = 0; i < nodeCount; i++) {
            this.noeuds.push({
                x: this.element.x + Math.random() * this.element.width,
                y: this.element.y + Math.random() * this.element.height,
                charge: Math.random() * 2 - 1,
                connections: [],
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

    getArcFromPool() {
        for (let arc of this.arcPool) {
            if (!arc.active) {
                arc.active = true;
                return arc;
            }
        }
        return this.createArc();
    }

    getEtincelleFromPool() {
        for (let etincelle of this.etincellePool) {
            if (!etincelle.active) {
                etincelle.active = true;
                return etincelle;
            }
        }
        return this.createEtincelle();
    }

    // Générateur de bruit simplifié pour chaos organique
    noise(x, y, z = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return (n - Math.floor(n));
    }

    update(deltaTime) {
        this.temps += deltaTime * this.config.parameters.vitesse.default;
        this.pulseTimer += deltaTime * 0.003;
        this.phaseTimer += deltaTime * 0.001;
        
        // Évolution des phases de formation
        this.updateFormationPhase();
        
        // Mise à jour des arcs actifs
        this.updateArcs(deltaTime);
        
        // Mise à jour des étincelles
        this.updateEtincelles(deltaTime);
        
        // Génération continue d'effets
        this.generateElectricEffects(deltaTime);
        
        // Gestion des connexions intelligentes
        this.updateConnections(deltaTime);
    }

    updateFormationPhase() {
        const cycleTime = 8000; // 8 secondes par cycle complet
        const phaseProgress = (this.phaseTimer % cycleTime) / cycleTime;
        
        if (phaseProgress < 0.2) {
            this.formationPhase = 0; // Chaos initial
            this.formationProgress = phaseProgress / 0.2;
        } else if (phaseProgress < 0.5) {
            this.formationPhase = 1; // Connexion
            this.formationProgress = (phaseProgress - 0.2) / 0.3;
        } else if (phaseProgress < 0.8) {
            this.formationPhase = 2; // Formation
            this.formationProgress = (phaseProgress - 0.5) / 0.3;
        } else {
            this.formationPhase = 3; // Maintenance
            this.formationProgress = (phaseProgress - 0.8) / 0.2;
        }
    }

    updateArcs(deltaTime) {
        for (let arc of this.arcs) {
            if (!arc.active) continue;
            
            arc.life += deltaTime;
            
            if (arc.life >= arc.maxLife) {
                arc.active = false;
                continue;
            }
            
            // Pulsation d'intensité
            const lifeRatio = arc.life / arc.maxLife;
            arc.intensity = Math.sin(lifeRatio * Math.PI) * 
                           (0.5 + 0.5 * Math.sin(this.pulseTimer * 8 + arc.startX * 0.01));
            
            // Chaos dans les points de contrôle
            for (let i = 0; i < arc.controlPoints.length; i++) {
                const cp = arc.controlPoints[i];
                const chaos = this.config.parameters.chaosFactor.default;
                cp.offsetX = Math.sin(this.temps * 0.01 + i) * chaos * 10;
                cp.offsetY = Math.cos(this.temps * 0.008 + i * 1.5) * chaos * 8;
            }
        }
    }

    updateEtincelles(deltaTime) {
        for (let etincelle of this.etincelles) {
            if (!etincelle.active) continue;
            
            etincelle.life += deltaTime;
            
            if (etincelle.life >= etincelle.maxLife) {
                etincelle.active = false;
                continue;
            }
            
            // Mouvement et décélération
            etincelle.x += etincelle.vx * deltaTime * 0.1;
            etincelle.y += etincelle.vy * deltaTime * 0.1;
            etincelle.vx *= 0.98;
            etincelle.vy *= 0.98;
            
            // Fadein/fadeout
            const lifeRatio = etincelle.life / etincelle.maxLife;
            etincelle.intensity = Math.sin(lifeRatio * Math.PI) * 
                                 (0.7 + 0.3 * Math.sin(this.pulseTimer * 12));
        }
    }

    generateElectricEffects(deltaTime) {
        // Génération d'arcs selon la phase
        if (Math.random() < 0.3 * this.config.parameters.intensite.default) {
            this.generateArc();
        }
        
        // Génération d'étincelles
        if (Math.random() < 0.5) {
            this.generateEtincelles();
        }
    }

    generateArc() {
        const arc = this.getArcFromPool();
        
        if (this.formationPhase <= 1) {
            // Phase chaos/connexion - arcs aléatoires
            arc.startX = this.element.x + Math.random() * this.element.width;
            arc.startY = this.element.y + Math.random() * this.element.height;
            arc.endX = this.element.x + Math.random() * this.element.width;
            arc.endY = this.element.y + Math.random() * this.element.height;
        } else {
            // Phase formation - arcs vers points cibles
            const targetPoint = this.targetPoints[Math.floor(Math.random() * this.targetPoints.length)];
            arc.startX = this.element.x + Math.random() * this.element.width;
            arc.startY = this.element.y + Math.random() * this.element.height;
            arc.endX = targetPoint.x + (Math.random() - 0.5) * 20;
            arc.endY = targetPoint.y + (Math.random() - 0.5) * 20;
        }
        
        // Génération des points de contrôle pour l'effet organique
        arc.controlPoints = this.generateArcControlPoints(arc.startX, arc.startY, arc.endX, arc.endY);
        
        arc.life = 0;
        arc.maxLife = 100 + Math.random() * 300;
        arc.thickness = this.config.parameters.epaisseurArc.default * (0.5 + Math.random() * 0.5);
        arc.intensity = 0;
    }

    generateArcControlPoints(startX, startY, endX, endY) {
        const points = [];
        const segments = 3 + Math.floor(Math.random() * 4);
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const baseX = startX + (endX - startX) * t;
            const baseY = startY + (endY - startY) * t;
            
            // Perpendiculaire pour le chaos
            const perpX = -(endY - startY) / distance;
            const perpY = (endX - startX) / distance;
            
            const chaos = (Math.random() - 0.5) * distance * 0.3;
            
            points.push({
                x: baseX + perpX * chaos,
                y: baseY + perpY * chaos,
                offsetX: 0,
                offsetY: 0
            });
        }
        
        return points;
    }

    generateEtincelles() {
        const count = 2 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < count; i++) {
            const etincelle = this.getEtincelleFromPool();
            
            // Position aléatoire ou sur les arcs existants
            if (this.arcs.length > 0 && Math.random() < 0.7) {
                const arc = this.arcs[Math.floor(Math.random() * this.arcs.length)];
                if (arc.active) {
                    const t = Math.random();
                    etincelle.x = arc.startX + (arc.endX - arc.startX) * t;
                    etincelle.y = arc.startY + (arc.endY - arc.startY) * t;
                }
            } else {
                etincelle.x = this.element.x + Math.random() * this.element.width;
                etincelle.y = this.element.y + Math.random() * this.element.height;
            }
            
            // Vélocité radiale
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            etincelle.vx = Math.cos(angle) * speed;
            etincelle.vy = Math.sin(angle) * speed;
            
            etincelle.life = 0;
            etincelle.maxLife = 200 + Math.random() * 400;
            etincelle.size = 1 + Math.random() * 3;
            etincelle.intensity = 0;
        }
    }

    updateConnections(deltaTime) {
        // Logique de connexion intelligente entre noeuds et points cibles
        for (let noeud of this.noeuds) {
            noeud.pulsePhase += deltaTime * 0.005;
            
            // Recherche de connexions potentielles
            if (this.formationPhase >= 1 && Math.random() < 0.02) {
                const nearestTarget = this.findNearestTarget(noeud);
                if (nearestTarget && !this.hasConnection(noeud, nearestTarget)) {
                    this.createConnection(noeud, nearestTarget);
                }
            }
        }
    }

    findNearestTarget(noeud) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (let target of this.targetPoints) {
            const distance = Math.sqrt((target.x - noeud.x) ** 2 + (target.y - noeud.y) ** 2);
            if (distance < minDistance && distance < 150) {
                minDistance = distance;
                nearest = target;
            }
        }
        
        return nearest;
    }

    hasConnection(noeud, target) {
        return noeud.connections.some(conn => conn.target === target);
    }

    createConnection(noeud, target) {
        noeud.connections.push({
            target: target,
            strength: 0,
            maxStrength: 0.3 + Math.random() * 0.7
        });
    }

    render(ctx, element, deltaTime) {
        // Configuration du contexte
        ctx.save();
        
        // Glow global électromagnétique
        this.renderElectromagneticField(ctx);
        
        // Rendu des arcs électriques
        this.renderArcs(ctx);
        
        // Rendu des étincelles
        this.renderEtincelles(ctx);
        
        // Rendu des noeuds électriques
        this.renderNoeuds(ctx);
        
        // Rendu des connexions intelligentes
        this.renderConnections(ctx);
        
        // Effet de lueur post-processing
        this.renderGlow(ctx);
        
        ctx.restore();
    }

    renderElectromagneticField(ctx) {
        const intensity = this.config.parameters.intensite.default;
        const pulseIntensity = 0.3 + 0.7 * Math.sin(this.pulseTimer * 4);
        
        // Gradient radial électromagnétique
        const centerX = this.element.x + this.element.width / 2;
        const centerY = this.element.y + this.element.height / 2;
        const radius = Math.max(this.element.width, this.element.height) * 0.8;
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${intensity * pulseIntensity * 0.1})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * pulseIntensity * 0.05})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.element.x - 50, this.element.y - 50, 
                    this.element.width + 100, this.element.height + 100);
    }

    renderArcs(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let arc of this.arcs) {
            if (!arc.active || arc.intensity <= 0) continue;
            
            const alpha = arc.intensity * this.config.parameters.intensite.default;
            
            // Arc principal
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = arc.thickness;
            ctx.shadowColor = this.config.parameters.couleurPrimaire.default;
            ctx.shadowBlur = 10 * arc.intensity;
            
            ctx.beginPath();
            ctx.moveTo(arc.startX, arc.startY);
            
            if (arc.controlPoints.length > 0) {
                for (let i = 0; i < arc.controlPoints.length; i++) {
                    const cp = arc.controlPoints[i];
                    const nextCP = arc.controlPoints[i + 1];
                    
                    if (nextCP) {
                        ctx.quadraticCurveTo(
                            cp.x + cp.offsetX, cp.y + cp.offsetY,
                            (cp.x + nextCP.x) / 2 + (cp.offsetX + nextCP.offsetX) / 2,
                            (cp.y + nextCP.y) / 2 + (cp.offsetY + nextCP.offsetY) / 2
                        );
                    } else {
                        ctx.quadraticCurveTo(
                            cp.x + cp.offsetX, cp.y + cp.offsetY,
                            arc.endX, arc.endY
                        );
                    }
                }
            } else {
                ctx.lineTo(arc.endX, arc.endY);
            }
            
            ctx.stroke();
            
            // Arc coloré interne
            ctx.strokeStyle = this.config.parameters.couleurPrimaire.default;
            ctx.lineWidth = arc.thickness * 0.3;
            ctx.shadowBlur = 5;
            ctx.stroke();
            
            ctx.shadowBlur = 0;
        }
    }

    renderEtincelles(ctx) {
        for (let etincelle of this.etincelles) {
            if (!etincelle.active || etincelle.intensity <= 0) continue;
            
            const alpha = etincelle.intensity * this.config.parameters.intensite.default;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = this.config.parameters.couleurSecondaire.default;
            ctx.shadowBlur = etincelle.size * 3;
            
            ctx.beginPath();
            ctx.arc(etincelle.x, etincelle.y, etincelle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
    }

    renderNoeuds(ctx) {
        for (let noeud of this.noeuds) {
            const pulseIntensity = 0.5 + 0.5 * Math.sin(noeud.pulsePhase);
            const alpha = pulseIntensity * this.config.parameters.intensite.default * 0.8;
            
            // Noeud principal
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.shadowColor = this.config.parameters.couleurPrimaire.default;
            ctx.shadowBlur = 8 * pulseIntensity;
            
            ctx.beginPath();
            ctx.arc(noeud.x, noeud.y, 3 * pulseIntensity, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
    }

    renderConnections(ctx) {
        for (let noeud of this.noeuds) {
            for (let connection of noeud.connections) {
                if (connection.strength <= 0) continue;
                
                const alpha = connection.strength * this.config.parameters.intensite.default;
                
                ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.shadowColor = this.config.parameters.couleurPrimaire.default;
                ctx.shadowBlur = 5;
                
                ctx.beginPath();
                ctx.moveTo(noeud.x, noeud.y);
                ctx.lineTo(connection.target.x, connection.target.y);
                ctx.stroke();
                
                ctx.shadowBlur = 0;
                
                // Augmentation progressive de la force de connexion
                connection.strength = Math.min(connection.maxStrength, 
                                             connection.strength + 0.01);
            }
        }
    }

    renderGlow(ctx) {
        // Effet de post-glow sur toute la zone
        const pulseGlow = 0.1 + 0.1 * Math.sin(this.pulseTimer * 6);
        ctx.shadowColor = this.config.parameters.couleurPrimaire.default;
        ctx.shadowBlur = 20 * pulseGlow * this.config.parameters.intensite.default;
        
        ctx.strokeStyle = 'transparent';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.element.x, this.element.y, this.element.width, this.element.height);
        ctx.shadowBlur = 0;
    }

    destroy() {
        // Nettoyage des pools
        this.arcs.length = 0;
        this.etincelles.length = 0;
        this.noeuds.length = 0;
        this.connections.length = 0;
        this.targetPoints.length = 0;
        this.letterPaths.clear();
        
        // Reset des pools
        this.arcPool.forEach(arc => arc.active = false);
        this.etincellePool.forEach(etincelle => etincelle.active = false);
        
        // Variables temporelles
        this.temps = 0;
        this.pulseTimer = 0;
        this.formationProgress = 0;
        this.formationPhase = 0;
        this.phaseTimer = 0;
    }
}