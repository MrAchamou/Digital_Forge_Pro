class ElectricHoverEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'electrostatic-levitation-field-048',
            name: 'Lévitation Électrostatique Chargée',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.5 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                instabilite: { type: 'range', min: 0, max: 1, default: 0.4 },
                arcsCount: { type: 'range', min: 5, max: 30, default: 12 },
                haloSize: { type: 'range', min: 0.5, max: 3, default: 1.2 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.baseX = 0;
        this.baseY = 0;
        this.currentX = 0;
        this.currentY = 0;
        
        // Système de charges électriques
        this.charges = [];
        this.arcs = [];
        this.fieldLines = [];
        
        // Oscillations électrostatiques
        this.oscillationPhases = [];
        this.microVibrations = { x: 0, y: 0 };
        this.lastFieldUpdate = 0;
        
        // Halo électromagnétique
        this.haloIntensity = 0;
        this.haloRadius = 0;
        this.haloPulse = 0;
        
        // Cache pour performance
        this.fieldCache = new Map();
        this.arcPool = [];
        
        // Générateur de bruit électrique
        this.noiseSeeds = {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            field: Math.random() * 1000
        };
        
        this.initializeElectricField();
        this.initializeArcPool();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.baseX = element.x;
        this.baseY = element.y;
        this.currentX = this.baseX;
        this.currentY = this.baseY;
        
        // Initialiser les charges électriques
        this.setupElectricCharges();
        this.generateFieldLines();
    }

    initializeElectricField() {
        // Phases d'oscillation multi-fréquentielles
        for (let i = 0; i < 8; i++) {
            this.oscillationPhases.push({
                frequency: 0.001 + Math.random() * 0.005,
                amplitude: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                type: Math.random() > 0.5 ? 'sine' : 'cosine'
            });
        }
    }

    initializeArcPool() {
        // Pool d'arcs électriques pour performance
        for (let i = 0; i < 50; i++) {
            this.arcPool.push({
                startX: 0, startY: 0,
                endX: 0, endY: 0,
                controlPoints: [],
                intensity: 0,
                life: 0,
                maxLife: 0,
                active: false,
                branchPoints: []
            });
        }
    }

    setupElectricCharges() {
        this.charges = [];
        const centerX = this.baseX + this.element.width / 2;
        const centerY = this.baseY + this.element.height / 2;
        
        // Charge principale (objet en lévitation)
        this.charges.push({
            x: centerX,
            y: centerY,
            charge: 1,
            intensity: this.getParameter('intensite'),
            radius: Math.max(this.element.width, this.element.height) / 2
        });
        
        // Charges stabilisatrices autour
        const stabilizers = 6;
        const stabilizeRadius = Math.max(this.element.width, this.element.height) * 0.8;
        
        for (let i = 0; i < stabilizers; i++) {
            const angle = (i / stabilizers) * Math.PI * 2;
            this.charges.push({
                x: centerX + Math.cos(angle) * stabilizeRadius,
                y: centerY + Math.sin(angle) * stabilizeRadius,
                charge: -0.3 - Math.random() * 0.4,
                intensity: 0.6 + Math.random() * 0.4,
                radius: 20 + Math.random() * 30
            });
        }
    }

    generateFieldLines() {
        this.fieldLines = [];
        const lineCount = 24;
        const centerX = this.baseX + this.element.width / 2;
        const centerY = this.baseY + this.element.height / 2;
        
        for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2;
            const line = {
                points: [],
                intensity: 0.3 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2
            };
            
            // Générer points le long de la ligne de champ
            const maxRadius = Math.max(this.element.width, this.element.height) * 1.5;
            for (let r = 20; r < maxRadius; r += 15) {
                const fieldInfluence = this.calculateFieldAt(
                    centerX + Math.cos(angle) * r,
                    centerY + Math.sin(angle) * r
                );
                
                line.points.push({
                    x: centerX + Math.cos(angle + fieldInfluence.deflection) * r,
                    y: centerY + Math.sin(angle + fieldInfluence.deflection) * r,
                    strength: fieldInfluence.strength
                });
            }
            
            this.fieldLines.push(line);
        }
    }

    calculateFieldAt(x, y) {
        const cacheKey = `${Math.floor(x/5)}_${Math.floor(y/5)}`;
        if (this.fieldCache.has(cacheKey)) {
            return this.fieldCache.get(cacheKey);
        }
        
        let totalForceX = 0;
        let totalForceY = 0;
        let totalStrength = 0;
        
        for (let charge of this.charges) {
            const dx = x - charge.x;
            const dy = y - charge.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 1) continue;
            
            // Loi de Coulomb simplifiée
            const force = (charge.charge * charge.intensity) / (distance * distance);
            const forceX = force * (dx / distance);
            const forceY = force * (dy / distance);
            
            totalForceX += forceX;
            totalForceY += forceY;
            totalStrength += Math.abs(force);
        }
        
        const result = {
            forceX: totalForceX,
            forceY: totalForceY,
            strength: Math.min(totalStrength, 2),
            deflection: Math.atan2(totalForceY, totalForceX) * 0.1
        };
        
        this.fieldCache.set(cacheKey, result);
        return result;
    }

    updateElectricOscillations(deltaTime) {
        const instability = this.getParameter('instabilite');
        const vitesse = this.getParameter('vitesse');
        
        // Micro-oscillations multi-fréquentielles
        let totalX = 0;
        let totalY = 0;
        
        for (let i = 0; i < this.oscillationPhases.length; i++) {
            const phase = this.oscillationPhases[i];
            const time = this.temps * phase.frequency * vitesse + phase.phase;
            
            let wave;
            if (phase.type === 'sine') {
                wave = Math.sin(time);
            } else {
                wave = Math.cos(time);
            }
            
            // Oscillations imprévisibles (30% chaos)
            const chaos = (Math.random() - 0.5) * instability * 0.3;
            wave += chaos;
            
            if (i % 2 === 0) {
                totalX += wave * phase.amplitude;
            } else {
                totalY += wave * phase.amplitude;
            }
        }
        
        // Bruit électrique haute fréquence
        const electricNoise = {
            x: (this.perlinNoise(this.temps * 0.01, this.noiseSeeds.x) - 0.5) * instability * 2,
            y: (this.perlinNoise(this.temps * 0.01, this.noiseSeeds.y) - 0.5) * instability * 2
        };
        
        this.microVibrations.x = totalX + electricNoise.x;
        this.microVibrations.y = totalY + electricNoise.y;
        
        // Position finale avec lévitation
        const levitation = Math.sin(this.temps * 0.002 * vitesse) * 8;
        this.currentX = this.baseX + this.microVibrations.x;
        this.currentY = this.baseY + this.microVibrations.y - levitation;
    }

    updateElectricArcs(deltaTime) {
        // Retourner arcs expirés au pool
        for (let i = this.arcs.length - 1; i >= 0; i--) {
            const arc = this.arcs[i];
            arc.life += deltaTime;
            
            if (arc.life > arc.maxLife) {
                arc.active = false;
                this.arcs.splice(i, 1);
            }
        }
        
        // Générer nouveaux arcs selon l'instabilité
        const arcCount = this.getParameter('arcsCount');
        const instability = this.getParameter('instabilite');
        const shouldSpawn = Math.random() < (instability * 0.02 + 0.005);
        
        if (shouldSpawn && this.arcs.length < arcCount) {
            this.spawnElectricArc();
        }
    }

    spawnElectricArc() {
        const arc = this.getArcFromPool();
        if (!arc) return;
        
        const centerX = this.currentX + this.element.width / 2;
        const centerY = this.currentY + this.element.height / 2;
        
        // Choisir charge source et destination
        const sourceCharge = this.charges[0]; // Charge principale
        const targetIndex = 1 + Math.floor(Math.random() * (this.charges.length - 1));
        const targetCharge = this.charges[targetIndex];
        
        arc.startX = sourceCharge.x;
        arc.startY = sourceCharge.y;
        arc.endX = targetCharge.x;
        arc.endY = targetCharge.y;
        arc.intensity = 0.7 + Math.random() * 0.3;
        arc.life = 0;
        arc.maxLife = 100 + Math.random() * 300; // 0.1-0.4 secondes
        arc.active = true;
        
        // Générer points de contrôle pour arc courbe
        arc.controlPoints = this.generateArcPath(arc.startX, arc.startY, arc.endX, arc.endY);
        
        // Points de branchement secondaires
        arc.branchPoints = [];
        const branchCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < branchCount; i++) {
            const t = 0.3 + Math.random() * 0.4;
            const branchPoint = this.getPointOnArc(arc.controlPoints, t);
            const branchAngle = Math.random() * Math.PI * 2;
            const branchLength = 20 + Math.random() * 40;
            
            arc.branchPoints.push({
                x: branchPoint.x,
                y: branchPoint.y,
                endX: branchPoint.x + Math.cos(branchAngle) * branchLength,
                endY: branchPoint.y + Math.sin(branchAngle) * branchLength,
                intensity: 0.3 + Math.random() * 0.4
            });
        }
        
        this.arcs.push(arc);
    }

    getArcFromPool() {
        for (let arc of this.arcPool) {
            if (!arc.active) {
                return arc;
            }
        }
        return null;
    }

    generateArcPath(startX, startY, endX, endY) {
        const points = [];
        const segments = 8;
        const chaos = this.getParameter('instabilite') * 20;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            
            // Ajout de chaos électrique
            const chaosX = (Math.random() - 0.5) * chaos * (1 - Math.abs(t - 0.5) * 2);
            const chaosY = (Math.random() - 0.5) * chaos * (1 - Math.abs(t - 0.5) * 2);
            
            points.push({
                x: x + chaosX,
                y: y + chaosY
            });
        }
        
        return points;
    }

    getPointOnArc(points, t) {
        const index = t * (points.length - 1);
        const floorIndex = Math.floor(index);
        const ceilIndex = Math.min(floorIndex + 1, points.length - 1);
        const localT = index - floorIndex;
        
        const p1 = points[floorIndex];
        const p2 = points[ceilIndex];
        
        return {
            x: p1.x + (p2.x - p1.x) * localT,
            y: p1.y + (p2.y - p1.y) * localT
        };
    }

    updateElectricHalo(deltaTime) {
        const intensite = this.getParameter('intensite');
        const haloSize = this.getParameter('haloSize');
        const vitesse = this.getParameter('vitesse');
        
        // Pulsation du halo selon l'activité électrique
        this.haloPulse = 0.7 + 0.3 * Math.sin(this.temps * 0.008 * vitesse);
        
        // Intensité basée sur l'activité des arcs
        const arcActivity = this.arcs.length / this.getParameter('arcsCount');
        this.haloIntensity = (intensite * 0.6 + arcActivity * 0.4) * this.haloPulse;
        
        // Rayon dynamique
        const baseRadius = Math.max(this.element.width, this.element.height) * 0.6 * haloSize;
        this.haloRadius = baseRadius * (1 + this.haloIntensity * 0.3);
    }

    perlinNoise(x, seed) {
        // Implémentation simple de bruit de Perlin pour les fluctuations électriques
        const i = Math.floor(x + seed);
        const f = x + seed - i;
        const u = f * f * (3 - 2 * f);
        
        const a = this.hash(i) / 256;
        const b = this.hash(i + 1) / 256;
        
        return a * (1 - u) + b * u;
    }

    hash(n) {
        // Hash simple pour le bruit
        n = ((n << 13) ^ n);
        return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
    }

    renderElectricHalo(ctx) {
        if (this.haloIntensity < 0.1) return;
        
        ctx.save();
        
        const centerX = this.currentX + this.element.width / 2;
        const centerY = this.currentY + this.element.height / 2;
        
        // Halo électromagnétique principal
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.haloRadius
        );
        
        const alpha = this.haloIntensity * 0.6;
        gradient.addColorStop(0, `rgba(100, 150, 255, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(150, 200, 255, ${alpha * 0.8})`);
        gradient.addColorStop(0.7, `rgba(200, 230, 255, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.haloRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Anneaux électriques pulsants
        for (let i = 0; i < 3; i++) {
            const ringRadius = this.haloRadius * (0.4 + i * 0.2);
            const ringAlpha = alpha * (0.8 - i * 0.2) * this.haloPulse;
            
            ctx.strokeStyle = `rgba(100, 200, 255, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    renderFieldLines(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.3 * this.getParameter('intensite');
        
        for (let line of this.fieldLines) {
            const phaseOffset = Math.sin(this.temps * 0.003 + line.phase) * 0.5;
            const intensity = (line.intensity + phaseOffset) * 0.5;
            
            if (intensity < 0.1) continue;
            
            ctx.strokeStyle = `rgba(150, 200, 255, ${intensity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let i = 0; i < line.points.length; i++) {
                const point = line.points[i];
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }

    renderElectricArcs(ctx) {
        ctx.save();
        
        for (let arc of this.arcs) {
            const ageRatio = 1 - (arc.life / arc.maxLife);
            const intensity = arc.intensity * ageRatio;
            
            if (intensity < 0.1) continue;
            
            // Arc principal
            ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
            ctx.lineWidth = 2 + intensity;
            ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.moveTo(arc.controlPoints[0].x, arc.controlPoints[0].y);
            
            for (let i = 1; i < arc.controlPoints.length; i++) {
                ctx.lineTo(arc.controlPoints[i].x, arc.controlPoints[i].y);
            }
            
            ctx.stroke();
            
            // Arcs secondaires (branchements)
            for (let branch of arc.branchPoints) {
                const branchIntensity = branch.intensity * ageRatio * 0.7;
                
                ctx.strokeStyle = `rgba(200, 220, 255, ${branchIntensity})`;
                ctx.lineWidth = 1 + branchIntensity;
                
                ctx.beginPath();
                ctx.moveTo(branch.x, branch.y);
                ctx.lineTo(branch.endX, branch.endY);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }

    renderChargeIndicators(ctx) {
        ctx.save();
        
        for (let i = 1; i < this.charges.length; i++) { // Skip main charge
            const charge = this.charges[i];
            const pulse = 0.7 + 0.3 * Math.sin(this.temps * 0.005 + i);
            const alpha = charge.intensity * pulse * 0.4;
            
            // Indicateur de charge négative
            const gradient = ctx.createRadialGradient(
                charge.x, charge.y, 0,
                charge.x, charge.y, charge.radius
            );
            
            gradient.addColorStop(0, `rgba(255, 100, 100, ${alpha})`);
            gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(charge.x, charge.y, charge.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    render(ctx, element, deltaTime) {
        // Rendu halo électromagnétique en arrière-plan
        this.renderElectricHalo(ctx);
        
        // Rendu lignes de champ
        this.renderFieldLines(ctx);
        
        // Rendu indicateurs de charges
        this.renderChargeIndicators(ctx);
        
        // Rendu de l'image en lévitation (position modifiée)
        ctx.save();
        ctx.translate(this.currentX, this.currentY);
        
        // Léger glow autour de l'objet
        ctx.shadowColor = 'rgba(100, 150, 255, 0.6)';
        ctx.shadowBlur = 15;
        
        ctx.drawImage(element.image || this.canvas, 
                     element.x, element.y, element.width, element.height,
                     0, 0, element.width, element.height);
        
        ctx.restore();
        
        // Rendu arcs électriques en premier plan
        this.renderElectricArcs(ctx);
    }

    update(deltaTime) {
        this.temps += deltaTime;
        
        this.updateElectricOscillations(deltaTime);
        this.updateElectricArcs(deltaTime);
        this.updateElectricHalo(deltaTime);
        
        // Nettoyage cache périodique
        if (this.temps % 3000 < deltaTime) {
            this.fieldCache.clear();
        }
        
        // Régénération lignes de champ périodique
        if (this.temps % 5000 < deltaTime) {
            this.generateFieldLines();
        }
    }

    destroy() {
        this.charges = [];
        this.arcs = [];
        this.fieldLines = [];
        this.oscillationPhases = [];
        this.arcPool = [];
        this.fieldCache.clear();
        this.fieldCache = null;
    }
}