class PlasmaStateEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'ionized-plasma-energy-029',
            name: 'État Plasma Ionisé',
            category: 'text',
            version: '1.0',
            performance: 'high',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                temperature: { type: 'range', min: 0, max: 1, default: 0.6 },
                confinement: { type: 'range', min: 0.1, max: 1, default: 0.7 },
                arcs: { type: 'range', min: 3, max: 15, default: 8 },
                ionisation: { type: 'range', min: 0.3, max: 1, default: 0.75 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.canvas = null;
        this.ctx = null;
        
        // Système de particules ionisées
        this.particules = [];
        this.maxParticules = 150;
        
        // Arcs électriques
        this.arcsElectriques = [];
        this.arcPool = [];
        
        // Champ magnétique de confinement
        this.champMagnetique = {
            intensite: 1,
            stabilite: 0.8,
            fluctuations: []
        };
        
        // Température du plasma
        this.temperaturePlasma = {
            valeur: 3000, // Kelvin
            cible: 3000,
            evolution: 0
        };
        
        // Cache pour optimisation
        this.textPath = null;
        this.lastText = '';
        this.gradientCache = new Map();
        
        // Générateur de bruit électromagnétique
        this.noiseField = this.generateElectromagneticNoise();
        
        // Pool d'objets pour performance
        this.initializeObjectPools();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.updateTextMetrics(element);
        this.initializeParticules(element);
        this.initializeChampMagnetique(element);
        this.initializeArcsElectriques();
    }

    generateElectromagneticNoise() {
        const size = 512;
        const noise = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            // Bruit électromagnétique multi-fréquence
            noise[i] = Math.sin(i * 0.05) * 0.4 + 
                      Math.sin(i * 0.17) * 0.3 + 
                      Math.sin(i * 0.31) * 0.2 +
                      Math.random() * 0.1;
        }
        return noise;
    }

    initializeObjectPools() {
        // Pool d'arcs électriques pour réutilisation
        this.arcPool = [];
        for (let i = 0; i < 20; i++) {
            this.arcPool.push({
                active: false,
                points: [],
                intensite: 0,
                duree: 0,
                maxDuree: 0
            });
        }
    }

    updateTextMetrics(element) {
        if (element.content !== this.lastText) {
            this.lastText = element.content;
            this.ctx.font = `${element.height * 0.8}px Arial, sans-serif`;
            this.textPath = this.createTextPath(element);
        }
    }

    createTextPath(element) {
        const path = [];
        const text = element.content;
        const fontSize = element.height * 0.8;
        
        this.ctx.font = `${fontSize}px Arial, sans-serif`;
        const metrics = this.ctx.measureText(text);
        
        let x = element.x + (element.width - metrics.width) / 2;
        const y = element.y + element.height / 2 + fontSize * 0.3;
        
        // Créer un contour détaillé du texte
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = this.ctx.measureText(char).width;
            
            // Points de contour pour chaque caractère
            const samples = Math.max(8, Math.floor(charWidth / 4));
            for (let s = 0; s < samples; s++) {
                const progress = s / samples;
                const charX = x + progress * charWidth;
                
                // Points sur le contour du caractère
                const contourPoints = this.generateCharacterContour(charX, y, fontSize * 0.4);
                path.push(...contourPoints.map(p => ({
                    ...p,
                    char: char,
                    charIndex: i,
                    globalProgress: (i + progress) / text.length
                })));
            }
            x += charWidth;
        }
        
        return path;
    }

    generateCharacterContour(centerX, centerY, radius) {
        const points = [];
        const segments = 12;
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = radius * (0.8 + Math.random() * 0.4); // Variation du rayon
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r,
                angle: angle,
                radius: r
            });
        }
        
        return points;
    }

    initializeParticules(element) {
        this.particules = [];
        
        if (!this.textPath) return;
        
        for (let i = 0; i < this.maxParticules; i++) {
            const pathPoint = this.textPath[Math.floor(Math.random() * this.textPath.length)];
            
            this.particules.push({
                x: pathPoint.x + (Math.random() - 0.5) * 20,
                y: pathPoint.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                masse: 0.5 + Math.random() * 0.5,
                charge: Math.random() > 0.5 ? 1 : -1,
                energie: 0.5 + Math.random() * 0.5,
                vie: 1,
                couleur: { r: 255, g: 100, b: 50 },
                trail: []
            });
        }
    }

    initializeChampMagnetique(element) {
        // Générer des lignes de champ magnétique
        this.champMagnetique.fluctuations = [];
        const lignes = 8;
        
        for (let i = 0; i < lignes; i++) {
            this.champMagnetique.fluctuations.push({
                angle: (i / lignes) * Math.PI * 2,
                amplitude: 20 + Math.random() * 30,
                frequence: 0.02 + Math.random() * 0.03,
                phase: Math.random() * Math.PI * 2,
                stabilite: 0.7 + Math.random() * 0.3
            });
        }
    }

    initializeArcsElectriques() {
        this.arcsElectriques = [];
        
        // Initialiser quelques arcs de base
        for (let i = 0; i < this.parameters.arcs.default; i++) {
            const arc = this.getArcFromPool();
            if (arc) {
                this.resetArc(arc);
                this.arcsElectriques.push(arc);
            }
        }
    }

    getArcFromPool() {
        return this.arcPool.find(arc => !arc.active) || null;
    }

    resetArc(arc) {
        if (!this.textPath || this.textPath.length < 2) return;
        
        const start = this.textPath[Math.floor(Math.random() * this.textPath.length)];
        const end = this.textPath[Math.floor(Math.random() * this.textPath.length)];
        
        arc.active = true;
        arc.points = this.generateArcPath(start, end);
        arc.intensite = 0.7 + Math.random() * 0.3;
        arc.duree = 0;
        arc.maxDuree = 200 + Math.random() * 300; // ms
    }

    generateArcPath(start, end) {
        const points = [{ x: start.x, y: start.y }];
        const segments = 8 + Math.floor(Math.random() * 6);
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            
            // Interpolation de base
            let x = start.x + (end.x - start.x) * t;
            let y = start.y + (end.y - start.y) * t;
            
            // Ajout de chaos électrique
            const chaos = Math.sin(t * Math.PI) * 30; // Maximum au milieu
            x += (Math.random() - 0.5) * chaos;
            y += (Math.random() - 0.5) * chaos;
            
            points.push({ x, y });
        }
        
        points.push({ x: end.x, y: end.y });
        return points;
    }

    // Conversion température vers couleur (approximation corps noir)
    temperatureToColor(temp) {
        // Température en Kelvin vers RGB
        temp = Math.max(1000, Math.min(12000, temp));
        
        let r, g, b;
        
        if (temp < 3500) {
            // Rouge dominant (plasma froid)
            r = 255;
            g = Math.min(255, (temp - 1000) / 2500 * 180);
            b = 0;
        } else if (temp < 6500) {
            // Blanc chaud
            r = 255;
            g = 220 + (temp - 3500) / 3000 * 35;
            b = (temp - 3500) / 3000 * 255;
        } else {
            // Bleu dominant (plasma chaud)
            r = Math.max(200, 255 - (temp - 6500) / 5500 * 55);
            g = Math.max(220, 255 - (temp - 6500) / 5500 * 35);
            b = 255;
        }
        
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    }

    updateTemperaturePlasma(deltaTime) {
        // Evolution cyclique de la température
        const tempsNorm = this.temps * 0.001;
        
        // Température oscille entre 2000K et 10000K
        this.temperaturePlasma.cible = 4000 + Math.sin(tempsNorm * 0.5) * 3000 + 
                                      Math.sin(tempsNorm * 1.3) * 1500;
        
        // Ajout d'instabilité
        if (Math.random() < 0.02) {
            this.temperaturePlasma.cible += (Math.random() - 0.5) * 2000;
        }
        
        // Transition fluide
        const diff = this.temperaturePlasma.cible - this.temperaturePlasma.valeur;
        this.temperaturePlasma.valeur += diff * deltaTime * 0.003;
    }

    updateParticules(deltaTime) {
        if (!this.textPath) return;
        
        const dt = deltaTime * 0.001;
        const confinementForce = this.parameters.confinement.default;
        
        this.particules.forEach((particule, index) => {
            // Forces électromagnétiques
            let fx = 0, fy = 0;
            
            // Confinement magnétique vers le contour du texte
            const nearestPoint = this.findNearestPathPoint(particule);
            if (nearestPoint) {
                const dx = nearestPoint.x - particule.x;
                const dy = nearestPoint.y - particule.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 25) {
                    const force = confinementForce * 100 / (distance * distance);
                    fx += (dx / distance) * force;
                    fy += (dy / distance) * force;
                }
            }
            
            // Forces entre particules (répulsion/attraction selon la charge)
            this.particules.forEach((autre, autreIndex) => {
                if (index === autreIndex) return;
                
                const dx = autre.x - particule.x;
                const dy = autre.y - particule.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < 50) {
                    const force = (particule.charge * autre.charge) * -200 / (distance * distance);
                    fx += (dx / distance) * force;
                    fy += (dy / distance) * force;
                }
            });
            
            // Bruit électromagnétique
            const noiseIndex = Math.floor((particule.x + particule.y + this.temps * 0.1) % this.noiseField.length);
            const noise = this.noiseField[noiseIndex];
            fx += noise * 50;
            fy += noise * 30;
            
            // Intégration physique
            particule.vx += fx * dt / particule.masse;
            particule.vy += fy * dt / particule.masse;
            
            // Amortissement
            particule.vx *= 0.98;
            particule.vy *= 0.98;
            
            // Mise à jour position
            particule.x += particule.vx * dt * 60;
            particule.y += particule.vy * dt * 60;
            
            // Mise à jour couleur selon température
            const tempColor = this.temperatureToColor(this.temperaturePlasma.valeur);
            particule.couleur = tempColor;
            
            // Trail de particule
            particule.trail.unshift({ x: particule.x, y: particule.y });
            if (particule.trail.length > 8) {
                particule.trail.pop();
            }
        });
    }

    findNearestPathPoint(particule) {
        if (!this.textPath || this.textPath.length === 0) return null;
        
        let nearest = this.textPath[0];
        let minDistance = Infinity;
        
        for (let point of this.textPath) {
            const dx = point.x - particule.x;
            const dy = point.y - particule.y;
            const distance = dx * dx + dy * dy;
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = point;
            }
        }
        
        return nearest;
    }

    updateArcsElectriques(deltaTime) {
        // Mise à jour des arcs existants
        this.arcsElectriques.forEach(arc => {
            if (arc.active) {
                arc.duree += deltaTime;
                
                if (arc.duree >= arc.maxDuree) {
                    arc.active = false;
                }
                
                // Perturbation des points d'arc
                arc.points.forEach((point, index) => {
                    if (index > 0 && index < arc.points.length - 1) {
                        point.x += (Math.random() - 0.5) * 4;
                        point.y += (Math.random() - 0.5) * 4;
                    }
                });
            }
        });
        
        // Supprimer les arcs inactifs
        this.arcsElectriques = this.arcsElectriques.filter(arc => arc.active);
        
        // Créer de nouveaux arcs
        if (Math.random() < 0.05 && this.arcsElectriques.length < this.parameters.arcs.default) {
            const arc = this.getArcFromPool();
            if (arc) {
                this.resetArc(arc);
                this.arcsElectriques.push(arc);
            }
        }
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.default;
        this.updateTextMetrics(element);
        
        if (!this.textPath) return;
        
        ctx.save();
        
        // Mise à jour des systèmes
        this.updateTemperaturePlasma(deltaTime);
        this.updateParticules(deltaTime);
        this.updateArcsElectriques(deltaTime);
        
        // Couleur de base du plasma
        const plasmaColor = this.temperatureToColor(this.temperaturePlasma.valeur);
        
        // Rendu du champ de confinement magnétique
        this.renderChampMagnetique(ctx, element, plasmaColor);
        
        // Rendu des particules ionisées
        this.renderParticules(ctx, plasmaColor);
        
        // Rendu des arcs électriques
        this.renderArcsElectriques(ctx, plasmaColor);
        
        // Rendu du texte plasma
        this.renderTextePlasma(ctx, element, plasmaColor);
        
        ctx.restore();
    }

    renderChampMagnetique(ctx, element, plasmaColor) {
        ctx.save();
        ctx.globalAlpha = 0.1 * this.parameters.confinement.default;
        ctx.strokeStyle = `rgb(${plasmaColor.r}, ${plasmaColor.g}, ${plasmaColor.b})`;
        ctx.lineWidth = 1;
        
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        this.champMagnetique.fluctuations.forEach(ligne => {
            ctx.beginPath();
            
            const points = 20;
            for (let i = 0; i <= points; i++) {
                const t = i / points;
                const angle = ligne.angle + Math.sin(this.temps * ligne.frequence + ligne.phase) * 0.5;
                const radius = ligne.amplitude * (1 + Math.sin(this.temps * ligne.frequence * 2) * 0.3);
                
                const x = centerX + Math.cos(angle + t * Math.PI * 2) * radius;
                const y = centerY + Math.sin(angle + t * Math.PI * 2) * radius * 0.6;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        });
        
        ctx.restore();
    }

    renderParticules(ctx, plasmaColor) {
        this.particules.forEach(particule => {
            // Trail de la particule
            ctx.save();
            particule.trail.forEach((point, index) => {
                const alpha = (1 - index / particule.trail.length) * 0.3;
                const size = (1 - index / particule.trail.length) * 2;
                
                ctx.globalAlpha = alpha;
                ctx.fillStyle = `rgb(${particule.couleur.r}, ${particule.couleur.g}, ${particule.couleur.b})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
            
            // Particule principale
            ctx.save();
            ctx.globalAlpha = 0.8;
            
            // Glow effect
            const gradient = ctx.createRadialGradient(
                particule.x, particule.y, 0,
                particule.x, particule.y, 8
            );
            gradient.addColorStop(0, `rgba(${particule.couleur.r}, ${particule.couleur.g}, ${particule.couleur.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${particule.couleur.r}, ${particule.couleur.g}, ${particule.couleur.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particule.x, particule.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Core
            ctx.fillStyle = `rgb(${Math.min(255, particule.couleur.r + 50)}, ${Math.min(255, particule.couleur.g + 50)}, ${Math.min(255, particule.couleur.b + 50)})`;
            ctx.beginPath();
            ctx.arc(particule.x, particule.y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }

    renderArcsElectriques(ctx, plasmaColor) {
        this.arcsElectriques.forEach(arc => {
            if (!arc.active || arc.points.length < 2) return;
            
            ctx.save();
            
            // Intensité basée sur la durée de vie
            const lifeRatio = 1 - (arc.duree / arc.maxDuree);
            const alpha = lifeRatio * arc.intensite * 0.8;
            
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = `rgb(${Math.min(255, plasmaColor.r + 100)}, ${Math.min(255, plasmaColor.g + 100)}, ${plasmaColor.b})`;
            ctx.lineWidth = 2 + Math.random() * 2;
            ctx.lineCap = 'round';
            
            // Glow effect
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.moveTo(arc.points[0].x, arc.points[0].y);
            
            for (let i = 1; i < arc.points.length; i++) {
                ctx.lineTo(arc.points[i].x, arc.points[i].y);
            }
            
            ctx.stroke();
            ctx.restore();
        });
    }

    renderTextePlasma(ctx, element, plasmaColor) {
        ctx.save();
        
        const fontSize = element.height * 0.8;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        // Effet de plasma sur le texte
        const gradient = ctx.createLinearGradient(
            centerX - element.width / 2, centerY,
            centerX + element.width / 2, centerY
        );
        
        // Dégradé basé sur la température
        const temp1 = this.temperatureToColor(this.temperaturePlasma.valeur * 0.8);
        const temp2 = this.temperatureToColor(this.temperaturePlasma.valeur * 1.2);
        
        gradient.addColorStop(0, `rgba(${temp1.r}, ${temp1.g}, ${temp1.b}, 0.9)`);
        gradient.addColorStop(0.5, `rgba(${plasmaColor.r}, ${plasmaColor.g}, ${plasmaColor.b}, 1)`);
        gradient.addColorStop(1, `rgba(${temp2.r}, ${temp2.g}, ${temp2.b}, 0.9)`);
        
        // Glow intense
        ctx.shadowColor = `rgb(${plasmaColor.r}, ${plasmaColor.g}, ${plasmaColor.b})`;
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = gradient;
        ctx.fillText(element.content, centerX, centerY);
        
        // Contour énergétique
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${Math.min(255, plasmaColor.r + 50)}, ${Math.min(255, plasmaColor.g + 50)}, ${Math.min(255, plasmaColor.b + 50)}, 0.6)`;
        ctx.lineWidth = 1;
        ctx.strokeText(element.content, centerX, centerY);
        
        ctx.restore();
    }

    update(deltaTime) {
        // Mise à jour du champ électromagnétique
        this.champMagnetique.intensite = 0.8 + Math.sin(this.temps * 0.001) * 0.2;
        
        // Fluctuations du champ magnétique
        this.champMagnetique.fluctuations.forEach(ligne => {
            ligne.phase += deltaTime * ligne.frequence;
            ligne.stabilite += (Math.random() - 0.5) * deltaTime * 0.0001;
            ligne.stabilite = Math.max(0.3, Math.min(1, ligne.stabilite));
        });
    }

    destroy() {
        this.particules = [];
        this.arcsElectriques = [];
        this.arcPool = [];
        this.champMagnetique.fluctuations = [];
        this.gradientCache.clear();
        this.textPath = null;
        this.noiseField = null;
        this.canvas = null;
        this.ctx = null;
    }
}