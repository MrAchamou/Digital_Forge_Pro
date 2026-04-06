class EnergyFlowEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'plasma-energy-stream-018',
            name: 'Flux Énergétique Plasma',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                couleur: { type: 'color', default: '#00ffff' },
                densite: { type: 'range', min: 0.3, max: 2, default: 1 },
                turbulence: { type: 'range', min: 0, max: 1, default: 0.4 }
            }
        });

        // Variables système énergétique
        this.temps = 0;
        this.energyNodes = [];
        this.energyStreams = [];
        this.electricArcs = [];
        this.chargedParticles = [];
        this.pulsePhases = [];
        
        // Pool d'objets pour optimisation
        this.particlePool = [];
        this.arcPool = [];
        
        // Données de flux énergétique
        this.flowPaths = [];
        this.energyLevel = 0;
        this.lastPulse = 0;
        this.circuitComplexity = 8;
        
        // Système de couleurs énergétiques
        this.energyColors = {
            low: [0, 100, 255],     // Bleu froid
            medium: [0, 255, 150],  // Cyan
            high: [255, 255, 0],    // Jaune chaud
            peak: [255, 100, 255]   // Magenta électrique
        };
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Création du système circulatoire énergétique
        this.createEnergyNetwork();
        this.initializeParticlePools();
        this.setupFlowPaths();
    }

    createEnergyNetwork() {
        const { width, height } = this.element;
        this.energyNodes = [];
        
        // Création des nœuds énergétiques principaux
        const nodeCount = Math.floor(this.circuitComplexity * this.parameters.densite.value);
        
        for (let i = 0; i < nodeCount; i++) {
            this.energyNodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                charge: Math.random() * 2 - 1,
                radius: 2 + Math.random() * 4,
                connections: [],
                pulsePhase: Math.random() * Math.PI * 2,
                lastDischarge: 0
            });
        }
        
        // Connexions entre nœuds (système circulatoire)
        this.energyNodes.forEach((node, i) => {
            const connectionCount = 2 + Math.floor(Math.random() * 3);
            for (let j = 0; j < connectionCount; j++) {
                const targetIndex = Math.floor(Math.random() * this.energyNodes.length);
                if (targetIndex !== i && !node.connections.includes(targetIndex)) {
                    node.connections.push(targetIndex);
                }
            }
        });
    }

    initializeParticlePools() {
        // Pool de particules chargées
        for (let i = 0; i < 100; i++) {
            this.particlePool.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 0, maxLife: 1,
                charge: 0, size: 1,
                active: false,
                trail: []
            });
        }
        
        // Pool d'arcs électriques
        for (let i = 0; i < 50; i++) {
            this.arcPool.push({
                startX: 0, startY: 0,
                endX: 0, endY: 0,
                intensity: 0,
                duration: 0,
                segments: [],
                active: false
            });
        }
    }

    setupFlowPaths() {
        this.flowPaths = [];
        const { width, height } = this.element;
        
        // Création de chemins de flux énergétique complexes
        for (let i = 0; i < 6; i++) {
            const path = {
                points: [],
                flow: Math.random() * 0.02 + 0.01,
                width: 1 + Math.random() * 3,
                energy: Math.random()
            };
            
            // Génération de courbes organiques
            const segments = 8 + Math.floor(Math.random() * 6);
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const baseX = t * width;
                const baseY = height * 0.5 + Math.sin(t * Math.PI * 3 + i) * height * 0.3;
                
                path.points.push({
                    x: baseX + (Math.random() - 0.5) * 20,
                    y: baseY + (Math.random() - 0.5) * 20,
                    energy: Math.random()
                });
            }
            
            this.flowPaths.push(path);
        }
    }

    getEnergyColor(energy) {
        const { energyColors } = this;
        let color1, color2, t;
        
        if (energy < 0.33) {
            color1 = energyColors.low;
            color2 = energyColors.medium;
            t = energy / 0.33;
        } else if (energy < 0.66) {
            color1 = energyColors.medium;
            color2 = energyColors.high;
            t = (energy - 0.33) / 0.33;
        } else {
            color1 = energyColors.high;
            color2 = energyColors.peak;
            t = (energy - 0.66) / 0.34;
        }
        
        return [
            Math.floor(color1[0] + (color2[0] - color1[0]) * t),
            Math.floor(color1[1] + (color2[1] - color1[1]) * t),
            Math.floor(color1[2] + (color2[2] - color1[2]) * t)
        ];
    }

    spawnChargedParticle() {
        const particle = this.particlePool.find(p => !p.active);
        if (!particle) return;
        
        const node = this.energyNodes[Math.floor(Math.random() * this.energyNodes.length)];
        
        particle.active = true;
        particle.x = node.x;
        particle.y = node.y;
        particle.vx = (Math.random() - 0.5) * 4;
        particle.vy = (Math.random() - 0.5) * 4;
        particle.life = 1;
        particle.maxLife = 0.5 + Math.random() * 1;
        particle.charge = Math.random() > 0.5 ? 1 : -1;
        particle.size = 1 + Math.random() * 2;
        particle.trail = [];
    }

    createElectricArc(startNode, endNode) {
        const arc = this.arcPool.find(a => !a.active);
        if (!arc) return;
        
        arc.active = true;
        arc.startX = startNode.x;
        arc.startY = startNode.y;
        arc.endX = endNode.x;
        arc.endY = endNode.y;
        arc.intensity = 0.5 + Math.random() * 0.5;
        arc.duration = 0.1 + Math.random() * 0.2;
        arc.segments = [];
        
        // Génération de segments d'arc avec turbulence
        const segmentCount = 5 + Math.floor(Math.random() * 8);
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const baseX = arc.startX + (arc.endX - arc.startX) * t;
            const baseY = arc.startY + (arc.endY - arc.startY) * t;
            
            const turbulence = this.parameters.turbulence.value * 20;
            arc.segments.push({
                x: baseX + (Math.random() - 0.5) * turbulence,
                y: baseY + (Math.random() - 0.5) * turbulence
            });
        }
    }

    updateEnergySystem(deltaTime) {
        const dt = deltaTime * 0.001;
        this.energyLevel = 0.5 + Math.sin(this.temps * 2) * 0.3 + 
                          Math.sin(this.temps * 5.7) * 0.1 + 
                          Math.sin(this.temps * 11.3) * 0.05;
        
        // Mise à jour des nœuds énergétiques
        this.energyNodes.forEach((node, i) => {
            node.pulsePhase += dt * Math.PI * this.parameters.vitesse.value;
            node.charge = Math.sin(node.pulsePhase) * this.energyLevel;
            
            // Décharge spontanée (arcs électriques)
            if (Math.abs(node.charge) > 0.8 && this.temps - node.lastDischarge > 0.5) {
                if (Math.random() < 0.3) {
                    const connections = node.connections;
                    if (connections.length > 0) {
                        const targetIndex = connections[Math.floor(Math.random() * connections.length)];
                        this.createElectricArc(node, this.energyNodes[targetIndex]);
                        node.lastDischarge = this.temps;
                    }
                }
            }
        });
        
        // Génération de particules chargées
        if (Math.random() < this.parameters.densite.value * 0.1) {
            this.spawnChargedParticle();
        }
    }

    updateParticles(deltaTime) {
        const dt = deltaTime * 0.001;
        
        this.chargedParticles = this.particlePool.filter(p => p.active);
        
        this.chargedParticles.forEach(particle => {
            particle.life -= dt / particle.maxLife;
            
            if (particle.life <= 0) {
                particle.active = false;
                return;
            }
            
            // Attraction vers nœuds énergétiques
            let fx = 0, fy = 0;
            this.energyNodes.forEach(node => {
                const dx = node.x - particle.x;
                const dy = node.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const force = (node.charge * particle.charge) / (distance * distance) * 100;
                    fx += (dx / distance) * force;
                    fy += (dy / distance) * force;
                }
            });
            
            particle.vx += fx * dt;
            particle.vy += fy * dt;
            particle.vx *= 0.98; // Friction
            particle.vy *= 0.98;
            
            // Mise à jour position
            particle.x += particle.vx * dt * 60;
            particle.y += particle.vy * dt * 60;
            
            // Trail
            particle.trail.push({ x: particle.x, y: particle.y, life: particle.life });
            if (particle.trail.length > 8) {
                particle.trail.shift();
            }
        });
    }

    updateElectricArcs(deltaTime) {
        const dt = deltaTime * 0.001;
        
        this.electricArcs = this.arcPool.filter(a => a.active);
        
        this.electricArcs.forEach(arc => {
            arc.duration -= dt;
            
            if (arc.duration <= 0) {
                arc.active = false;
                return;
            }
            
            // Régénération périodique des segments pour effet scintillant
            if (Math.random() < 0.3) {
                const segmentIndex = Math.floor(Math.random() * arc.segments.length);
                const segment = arc.segments[segmentIndex];
                const turbulence = this.parameters.turbulence.value * 15;
                
                segment.x += (Math.random() - 0.5) * turbulence;
                segment.y += (Math.random() - 0.5) * turbulence;
            }
        });
    }

    renderFlowPaths(ctx) {
        this.flowPaths.forEach(path => {
            const flowOffset = this.temps * path.flow * this.parameters.vitesse.value;
            const currentEnergy = path.energy * this.energyLevel;
            const [r, g, b] = this.getEnergyColor(currentEnergy);
            
            // Rendu du flux principal
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * this.parameters.intensite.value})`;
            ctx.lineWidth = path.width * (1 + currentEnergy * 0.5);
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            path.points.forEach((point, i) => {
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    const prevPoint = path.points[i - 1];
                    const cpx = (prevPoint.x + point.x) / 2;
                    const cpy = (prevPoint.y + point.y) / 2;
                    ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
                }
            });
            ctx.stroke();
            
            // Particules de flux
            for (let i = 0; i < path.points.length - 1; i++) {
                const t = (flowOffset + i / path.points.length) % 1;
                const point1 = path.points[i];
                const point2 = path.points[i + 1];
                
                const x = point1.x + (point2.x - point1.x) * t;
                const y = point1.y + (point2.y - point1.y) * t;
                
                const particleEnergy = point1.energy * this.energyLevel;
                const [pr, pg, pb] = this.getEnergyColor(particleEnergy);
                
                ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${0.8 * this.parameters.intensite.value})`;
                ctx.beginPath();
                ctx.arc(x, y, 1 + particleEnergy * 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Glow effect
                ctx.shadowColor = `rgb(${pr}, ${pg}, ${pb})`;
                ctx.shadowBlur = 4 + particleEnergy * 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }

    renderEnergyNodes(ctx) {
        this.energyNodes.forEach(node => {
            const energy = Math.abs(node.charge);
            const [r, g, b] = this.getEnergyColor(energy);
            
            // Nœud principal
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.8 * this.parameters.intensite.value})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * (1 + energy * 0.5), 0, Math.PI * 2);
            ctx.fill();
            
            // Glow pulsant
            const glowRadius = node.radius * (2 + energy * 3);
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 * energy * this.parameters.intensite.value})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    renderElectricArcs(ctx) {
        this.electricArcs.forEach(arc => {
            const intensity = arc.intensity * (arc.duration / 0.3);
            const [r, g, b] = this.getEnergyColor(intensity);
            
            // Arc principal
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${intensity * this.parameters.intensite.value})`;
            ctx.lineWidth = 1 + intensity * 2;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            arc.segments.forEach((segment, i) => {
                if (i === 0) {
                    ctx.moveTo(segment.x, segment.y);
                } else {
                    ctx.lineTo(segment.x, segment.y);
                }
            });
            ctx.stroke();
            
            // Glow de l'arc
            ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
            ctx.shadowBlur = 8 * intensity;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
    }

    renderChargedParticles(ctx) {
        this.chargedParticles.forEach(particle => {
            const energy = particle.life;
            const [r, g, b] = this.getEnergyColor(energy);
            
            // Trail
            particle.trail.forEach((point, i) => {
                const alpha = (point.life * i / particle.trail.length) * this.parameters.intensite.value;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, particle.size * (i / particle.trail.length), 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Particule principale
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${energy * this.parameters.intensite.value})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow
            ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate(element.rotation);
        ctx.globalAlpha = element.opacity;
        
        // Mode de composition pour effet énergétique
        ctx.globalCompositeOperation = 'screen';
        
        // Rendu des composants énergétiques
        this.renderFlowPaths(ctx);
        this.renderEnergyNodes(ctx);
        this.renderElectricArcs(ctx);
        this.renderChargedParticles(ctx);
        
        ctx.restore();
    }

    update(deltaTime) {
        this.temps += deltaTime * 0.001 * this.parameters.vitesse.value;
        
        this.updateEnergySystem(deltaTime);
        this.updateParticles(deltaTime);
        this.updateElectricArcs(deltaTime);
    }

    destroy() {
        this.energyNodes = [];
        this.energyStreams = [];
        this.electricArcs = [];
        this.chargedParticles = [];
        this.particlePool = [];
        this.arcPool = [];
        this.flowPaths = [];
        this.pulsePhases = [];
    }
}