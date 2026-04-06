class CrystalShatterEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'crystalline-fracture-dynamics-033',
            name: 'Dynamiques de Fracture Cristalline',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                couleur: { type: 'color', default: '#ffffff' },
                fragilite: { type: 'range', min: 0.1, max: 1, default: 0.7 },
                refraction: { type: 'range', min: 0, max: 1, default: 0.6 },
                geometrie: { type: 'range', min: 0, max: 1, default: 0.8 }
            }
        });

        // Variables principales
        this.temps = 0;
        this.fissures = [];
        this.eclats = [];
        this.pointsStress = [];
        this.lignesTension = [];
        
        // Phase du cristal
        this.phase = 0; // 0: intact, 1: tension, 2: fissuration, 3: éclatement, 4: dispersion
        this.phaseTimer = 0;
        this.phaseDurations = [1500, 800, 1200, 1000, 1500]; // ms
        
        // Structure cristalline
        this.structureLattice = [];
        this.voronoi = [];
        this.tensionMap = [];
        
        // Physics
        this.gravity = 0.0003;
        this.friction = 0.98;
        this.stressThreshold = 0.6;
        
        // Performance
        this.maxFissures = 50;
        this.maxEclats = 200;
        this.fragmentationLevel = 0;
        
        // Effets prismatiques
        this.prismColors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff'];
        this.refractionIndex = 1.5;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Générer la structure cristalline
        this.generateCrystalStructure();
        
        // Initialiser les points de stress
        this.initializeStressPoints();
        
        // Créer le réseau de tensions
        this.createTensionNetwork();
        
        // Générer le diagramme de Voronoi
        this.generateVoronoi();
    }

    generateCrystalStructure() {
        const width = this.element.width || 200;
        const height = this.element.height || 150;
        const spacing = 20;
        
        this.structureLattice = [];
        
        // Créer un réseau hexagonal
        for (let y = 0; y < height; y += spacing) {
            for (let x = 0; x < width; x += spacing) {
                const offsetX = (y / spacing) % 2 === 0 ? 0 : spacing / 2;
                const latticePoint = {
                    x: this.element.x + x + offsetX,
                    y: this.element.y + y,
                    stress: 0,
                    connections: [],
                    energy: Math.random(),
                    crystallineAxis: Math.random() * Math.PI * 2,
                    stability: 0.5 + Math.random() * 0.5
                };
                
                this.structureLattice.push(latticePoint);
            }
        }
        
        // Connecter les points adjacents
        this.connectLatticePoints();
    }

    connectLatticePoints() {
        const connectionDistance = 35;
        
        for (let i = 0; i < this.structureLattice.length; i++) {
            const point = this.structureLattice[i];
            
            for (let j = i + 1; j < this.structureLattice.length; j++) {
                const other = this.structureLattice[j];
                const distance = Math.sqrt(
                    Math.pow(point.x - other.x, 2) + 
                    Math.pow(point.y - other.y, 2)
                );
                
                if (distance <= connectionDistance) {
                    point.connections.push({
                        target: j,
                        distance: distance,
                        tension: 0,
                        broken: false
                    });
                }
            }
        }
    }

    initializeStressPoints() {
        const numStressPoints = 8 + Math.floor(Math.random() * 12);
        this.pointsStress = [];
        
        for (let i = 0; i < numStressPoints; i++) {
            this.pointsStress.push({
                x: this.element.x + Math.random() * (this.element.width || 200),
                y: this.element.y + Math.random() * (this.element.height || 150),
                intensity: 0.3 + Math.random() * 0.7,
                radius: 20 + Math.random() * 40,
                growth: 0,
                maxGrowth: 0.5 + Math.random() * 0.5,
                propagationSpeed: 0.001 + Math.random() * 0.002,
                active: false,
                activationTime: Math.random() * 2000
            });
        }
    }

    createTensionNetwork() {
        this.lignesTension = [];
        
        // Créer des lignes de tension entre points de stress
        for (let i = 0; i < this.pointsStress.length; i++) {
            for (let j = i + 1; j < this.pointsStress.length; j++) {
                const p1 = this.pointsStress[i];
                const p2 = this.pointsStress[j];
                const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                
                if (distance < 100) {
                    this.lignesTension.push({
                        start: i,
                        end: j,
                        tension: 0,
                        maxTension: 1.0,
                        visible: false,
                        crackProbability: 0.1 + Math.random() * 0.3
                    });
                }
            }
        }
    }

    generateVoronoi() {
        // Simplification du diagramme de Voronoi pour la fragmentation
        const seeds = [];
        const numSeeds = 15 + Math.floor(Math.random() * 25);
        
        for (let i = 0; i < numSeeds; i++) {
            seeds.push({
                x: this.element.x + Math.random() * (this.element.width || 200),
                y: this.element.y + Math.random() * (this.element.height || 150),
                id: i
            });
        }
        
        this.voronoi = seeds;
    }

    createFissure(startX, startY, direction, energy) {
        if (this.fissures.length >= this.maxFissures) return;
        
        const fissure = {
            points: [{x: startX, y: startY}],
            direction: direction,
            energy: energy,
            speed: 0.5 + Math.random() * 1.5,
            width: 1 + Math.random() * 3,
            growth: 0,
            maxLength: 30 + Math.random() * 80,
            branching: Math.random() < 0.3,
            branchAngle: (Math.random() - 0.5) * Math.PI * 0.5,
            crystallineDeviation: 0,
            active: true,
            age: 0
        };
        
        this.fissures.push(fissure);
    }

    createEclat(x, y, vx, vy, size, color) {
        if (this.eclats.length >= this.maxEclats) return;
        
        const eclat = {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            size: size,
            originalSize: size,
            color: color,
            prismColor: this.prismColors[Math.floor(Math.random() * this.prismColors.length)],
            faces: 3 + Math.floor(Math.random() * 5), // 3-7 faces
            depth: Math.random(),
            refractionAngle: Math.random() * Math.PI * 2,
            life: 1.0,
            opacity: 1.0,
            sparkle: Math.random() < 0.3
        };
        
        this.eclats.push(eclat);
    }

    propagateFissure(fissure, deltaTime) {
        if (!fissure.active || fissure.points.length === 0) return;
        
        const lastPoint = fissure.points[fissure.points.length - 1];
        const progress = fissure.speed * deltaTime * 0.01;
        
        // Calculer la direction avec déviation cristalline
        let currentDirection = fissure.direction + fissure.crystallineDeviation;
        
        // Suivre la structure cristalline
        const nearestLattice = this.findNearestLatticePoint(lastPoint.x, lastPoint.y);
        if (nearestLattice) {
            const attractionAngle = Math.atan2(
                nearestLattice.y - lastPoint.y,
                nearestLattice.x - lastPoint.x
            );
            currentDirection += (attractionAngle - currentDirection) * 0.1;
        }
        
        // Ajouter du bruit pour le réalisme
        currentDirection += (Math.random() - 0.5) * 0.2;
        
        // Calculer la nouvelle position
        const newX = lastPoint.x + Math.cos(currentDirection) * progress;
        const newY = lastPoint.y + Math.sin(currentDirection) * progress;
        
        // Vérifier les limites
        if (newX < this.element.x || newX > this.element.x + (this.element.width || 200) ||
            newY < this.element.y || newY > this.element.y + (this.element.height || 150)) {
            fissure.active = false;
            return;
        }
        
        fissure.points.push({x: newX, y: newY});
        fissure.growth += progress;
        fissure.age += deltaTime;
        
        // Arrêter la propagation si trop longue
        if (fissure.growth >= fissure.maxLength) {
            fissure.active = false;
        }
        
        // Créer des branches
        if (fissure.branching && fissure.points.length > 5 && Math.random() < 0.05) {
            this.createFissure(
                newX, newY,
                currentDirection + fissure.branchAngle,
                fissure.energy * 0.7
            );
            fissure.branching = false; // Une seule branche par fissure
        }
        
        // Mettre à jour la direction pour les courbes naturelles
        fissure.crystallineDeviation += (Math.random() - 0.5) * 0.1;
        fissure.crystallineDeviation *= 0.95; // Amortissement
    }

    findNearestLatticePoint(x, y) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (let point of this.structureLattice) {
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            if (distance < minDistance && distance < 30) {
                minDistance = distance;
                nearest = point;
            }
        }
        
        return nearest;
    }

    updatePhase(deltaTime) {
        this.phaseTimer += deltaTime;
        
        if (this.phaseTimer >= this.phaseDurations[this.phase]) {
            this.phase = (this.phase + 1) % 5;
            this.phaseTimer = 0;
            
            switch (this.phase) {
                case 1: // Début de tension
                    this.startTensionPhase();
                    break;
                case 2: // Début fissuration
                    this.startCrackingPhase();
                    break;
                case 3: // Début éclatement
                    this.startShatteringPhase();
                    break;
                case 4: // Début dispersion
                    this.startDispersionPhase();
                    break;
                case 0: // Reset
                    this.resetCrystal();
                    break;
            }
        }
    }

    startTensionPhase() {
        // Activer progressivement les points de stress
        for (let point of this.pointsStress) {
            point.active = true;
        }
    }

    startCrackingPhase() {
        // Créer les premières fissures aux points de stress
        for (let point of this.pointsStress) {
            if (point.intensity > this.stressThreshold) {
                const numCracks = 2 + Math.floor(Math.random() * 4);
                for (let i = 0; i < numCracks; i++) {
                    const angle = (Math.PI * 2 * i / numCracks) + Math.random() * 0.3;
                    this.createFissure(point.x, point.y, angle, point.intensity);
                }
            }
        }
    }

    startShatteringPhase() {
        // Créer des éclats le long des fissures
        for (let fissure of this.fissures) {
            const numShards = Math.floor(fissure.points.length / 3);
            
            for (let i = 0; i < numShards; i++) {
                const pointIndex = Math.floor(Math.random() * fissure.points.length);
                const point = fissure.points[pointIndex];
                
                const velocity = 0.5 + Math.random() * 2;
                const angle = Math.random() * Math.PI * 2;
                
                this.createEclat(
                    point.x, point.y,
                    Math.cos(angle) * velocity,
                    Math.sin(angle) * velocity,
                    2 + Math.random() * 8,
                    this.config.couleur
                );
            }
        }
    }

    startDispersionPhase() {
        // Augmenter la vélocité des éclats
        for (let eclat of this.eclats) {
            eclat.vx *= 1.5;
            eclat.vy *= 1.5;
        }
    }

    resetCrystal() {
        this.fissures = [];
        this.eclats = [];
        this.fragmentationLevel = 0;
        
        for (let point of this.pointsStress) {
            point.active = false;
            point.growth = 0;
        }
    }

    update(deltaTime) {
        this.temps += deltaTime * this.config.vitesse;
        this.updatePhase(deltaTime);
        
        // Mettre à jour les points de stress
        for (let point of this.pointsStress) {
            if (point.active && point.growth < point.maxGrowth) {
                point.growth += point.propagationSpeed * deltaTime;
            }
        }
        
        // Propager les fissures
        for (let fissure of this.fissures) {
            this.propagateFissure(fissure, deltaTime);
        }
        
        // Mettre à jour les éclats
        for (let i = this.eclats.length - 1; i >= 0; i--) {
            const eclat = this.eclats[i];
            
            // Physics
            eclat.vy += this.gravity * deltaTime;
            eclat.vx *= this.friction;
            eclat.vy *= this.friction;
            
            eclat.x += eclat.vx * deltaTime * 0.1;
            eclat.y += eclat.vy * deltaTime * 0.1;
            
            eclat.rotation += eclat.rotationSpeed * deltaTime * 0.01;
            eclat.refractionAngle += deltaTime * 0.001;
            
            // Diminuer la taille et l'opacité
            eclat.size *= 0.9995;
            eclat.life -= deltaTime * 0.0003;
            eclat.opacity = eclat.life;
            
            // Supprimer les éclats trop petits ou transparents
            if (eclat.size < 0.5 || eclat.life <= 0) {
                this.eclats.splice(i, 1);
            }
        }
        
        // Mettre à jour les lignes de tension
        for (let ligne of this.lignesTension) {
            const p1 = this.pointsStress[ligne.start];
            const p2 = this.pointsStress[ligne.end];
            
            if (p1.active && p2.active) {
                ligne.visible = true;
                ligne.tension = Math.min(ligne.maxTension, 
                    (p1.growth + p2.growth) * 0.5);
            }
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        if (this.phase === 0) {
            // Phase intacte
            this.renderIntactCrystal(ctx, element);
        } else {
            // Phases de destruction
            this.renderFragmentedCrystal(ctx, element);
        }
        
        // Effets prismatiques
        this.renderPrismaticEffects(ctx);
        
        // Post-traitement
        this.renderCrystallineGlow(ctx);
        
        ctx.restore();
    }

    renderIntactCrystal(ctx, element) {
        // Rendu cristal intact avec effets de surface
        ctx.globalAlpha = element.opacity || 1;
        
        // Base cristalline
        ctx.fillStyle = this.config.couleur;
        ctx.fillRect(element.x, element.y, element.width || 200, element.height || 150);
        
        // Reflets cristallins
        ctx.globalCompositeOperation = 'overlay';
        const gradient = ctx.createLinearGradient(
            element.x, element.y,
            element.x + (element.width || 200), element.y + (element.height || 150)
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(element.x, element.y, element.width || 200, element.height || 150);
        
        // Structure cristalline visible si tension
        if (this.phase === 1) {
            this.renderLatticeStructure(ctx);
            this.renderStressVisualization(ctx);
        }
    }

    renderFragmentedCrystal(ctx, element) {
        // Rendu des zones non fissurées
        ctx.globalAlpha = (element.opacity || 1) * (1 - this.fragmentationLevel * 0.5);
        ctx.fillStyle = this.config.couleur;
        
        // Dessiner les polygones de Voronoi non affectés
        this.renderVoronoiFragments(ctx);
        
        // Rendu des fissures
        this.renderFissures(ctx);
        
        // Rendu des éclats
        this.renderShards(ctx);
        
        // Lignes de tension
        if (this.phase === 1 || this.phase === 2) {
            this.renderTensionLines(ctx);
        }
    }

    renderLatticeStructure(ctx) {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        for (let point of this.structureLattice) {
            for (let connection of point.connections) {
                if (!connection.broken) {
                    const other = this.structureLattice[connection.target];
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        }
    }

    renderStressVisualization(ctx) {
        ctx.globalCompositeOperation = 'multiply';
        
        for (let point of this.pointsStress) {
            if (!point.active) continue;
            
            const radius = point.radius * point.growth;
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, radius
            );
            
            gradient.addColorStop(0, `rgba(255,0,0,${point.intensity * 0.3})`);
            gradient.addColorStop(1, 'rgba(255,0,0,0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderVoronoiFragments(ctx) {
        // Simulation simplifiée des fragments de Voronoi
        for (let seed of this.voronoi) {
            if (this.isFragmentIntact(seed)) {
                ctx.fillStyle = this.config.couleur;
                ctx.beginPath();
                ctx.arc(seed.x, seed.y, 15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    isFragmentIntact(seed) {
        // Vérifier si le fragment est touché par des fissures
        for (let fissure of this.fissures) {
            for (let point of fissure.points) {
                const distance = Math.sqrt(
                    Math.pow(seed.x - point.x, 2) + 
                    Math.pow(seed.y - point.y, 2)
                );
                if (distance < 20) return false;
            }
        }
        return true;
    }

    renderFissures(ctx) {
        ctx.globalCompositeOperation = 'multiply';
        
        for (let fissure of this.fissures) {
            if (fissure.points.length < 2) continue;
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = fissure.width * this.config.intensite;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(fissure.points[0].x, fissure.points[0].y);
            
            for (let i = 1; i < fissure.points.length; i++) {
                ctx.lineTo(fissure.points[i].x, fissure.points[i].y);
            }
            
            ctx.stroke();
            
            // Effet de profondeur
            ctx.globalCompositeOperation = 'screen';
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalCompositeOperation = 'multiply';
        }
    }

    renderShards(ctx) {
        ctx.globalCompositeOperation = 'source-over';
        
        for (let eclat of this.eclats) {
            if (eclat.opacity <= 0) continue;
            
            ctx.save();
            ctx.translate(eclat.x, eclat.y);
            ctx.rotate(eclat.rotation);
            ctx.globalAlpha = eclat.opacity;
            
            // Corps de l'éclat
            ctx.fillStyle = eclat.color;
            ctx.beginPath();
            this.drawCrystalShard(ctx, eclat.size, eclat.faces);
            ctx.fill();
            
            // Effets prismatiques
            if (this.config.refraction > 0.3) {
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = eclat.prismColor;
                ctx.globalAlpha = eclat.opacity * this.config.refraction * 0.5;
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }
            
            // Éclat scintillant
            if (eclat.sparkle) {
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = Math.sin(this.temps * 0.01 + eclat.refractionAngle) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(0, 0, eclat.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    drawCrystalShard(ctx, size, faces) {
        const angleStep = (Math.PI * 2) / faces;
        
        ctx.moveTo(size, 0);
        for (let i = 1; i <= faces; i++) {
            const angle = angleStep * i;
            const radius = size * (0.8 + Math.random() * 0.4); // Variation pour irrégularité
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
    }

    renderTensionLines(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        for (let ligne of this.lignesTension) {
            if (!ligne.visible) continue;
            
            const p1 = this.pointsStress[ligne.start];
            const p2 = this.pointsStress[ligne.end];
            
            ctx.strokeStyle = `rgba(255,100,100,${ligne.tension * 0.5})`;
            ctx.lineWidth = ligne.tension * 3;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    renderPrismaticEffects(ctx) {
        if (this.config.refraction < 0.3) return;
        
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.1;
        
        // Effets de réfraction globaux
        const time = this.temps * 0.001;
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(time + i * Math.PI * 0.66) * 2;
            ctx.fillStyle = this.prismColors[i];
            ctx.fillRect(
                this.element.x + offset, 
                this.element.y, 
                this.element.width || 200, 
                this.element.height || 150
            );
        }
    }

    renderCrystallineGlow(ctx) {
        // Lueur cristalline générale
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.05;
        
        const gradient = ctx.createRadialGradient(
            this.element.x + (this.element.width || 200) / 2,
            this.element.y + (this.element.height || 150) / 2,
            0,
            this.element.x + (this.element.width || 200) / 2,
            this.element.y + (this.element.height || 150) / 2,
            Math.max(this.element.width || 200, this.element.height || 150)
        );
        
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.element.x - 50, 
            this.element.y - 50, 
            (this.element.width || 200) + 100, 
            (this.element.height || 150) + 100
        );
    }

    destroy() {
        this.fissures = [];
        this.eclats = [];
        this.pointsStress = [];
        this.lignesTension = [];
        this.structureLattice = [];
        this.voronoi = [];
        this.tensionMap = [];
        
        this.canvas = null;
        this.ctx = null;
        this.element = null;
    }
}