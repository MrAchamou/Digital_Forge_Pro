class EnergyIonizeEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'electromagnetic-ionization-037',
            name: 'Ionisation Électromagnétique Pure',
            category: 'IMAGE',
            version: '1.0',
            performance: 'medium',
            parameters: {
                intensite: { type: 'range', min: 0.1, max: 2.0, default: 1.2 },
                vitesse: { type: 'range', min: 0.5, max: 3.0, default: 1.5 },
                conductivite: { type: 'range', min: 0.3, max: 1.0, default: 0.7 },
                temperature: { type: 'range', min: 1000, max: 8000, default: 4000 },
                champs: { type: 'range', min: 0.2, max: 1.5, default: 0.8 },
                arcs: { type: 'range', min: 5, max: 25, default: 12 }
            }
        });

        // Variables de l'effet
        this.temps = 0;
        this.imageData = null;
        this.plasmaGrid = [];
        this.electricArcs = [];
        this.fieldDistortion = [];
        this.conductivityMap = [];
        this.temperatureField = [];
        
        // Pool d'objets pour performance
        this.arcPool = [];
        this.particlePool = [];
        
        // Constantes physiques simulées
        this.ELECTRON_CHARGE = 1.602e-19;
        this.BOLTZMANN = 1.380e-23;
        this.PLASMA_THRESHOLD = 0.4;
        
        // Palettes de température
        this.temperaturePalette = this.generateTemperaturePalette();
        
        this.initializePools();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Capture de l'image source
        this.captureImageData();
        
        // Initialisation des grilles
        this.initializePlasmaGrid();
        this.generateConductivityMap();
        this.initializeFieldDistortion();
        
        // Génération des arcs électriques initiaux
        this.generateElectricArcs();
    }

    captureImageData() {
        try {
            this.imageData = this.ctx.getImageData(
                this.element.x, 
                this.element.y, 
                this.element.width, 
                this.element.height
            );
        } catch(e) {
            // Fallback si l'image n'est pas accessible
            this.imageData = this.ctx.createImageData(this.element.width, this.element.height);
        }
    }

    initializePlasmaGrid() {
        const gridSize = 8;
        this.plasmaGrid = [];
        
        for (let y = 0; y < this.element.height; y += gridSize) {
            for (let x = 0; x < this.element.width; x += gridSize) {
                this.plasmaGrid.push({
                    x, y,
                    ionization: Math.random() * 0.3,
                    temperature: 2000 + Math.random() * 2000,
                    charge: (Math.random() - 0.5) * 2,
                    energy: Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }

    generateConductivityMap() {
        if (!this.imageData) return;
        
        const data = this.imageData.data;
        this.conductivityMap = [];
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Conductivité basée sur la luminosité et contraste
            const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            const contrast = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
            
            const conductivity = (luminance * 0.7 + (contrast / 765) * 0.3) * this.parameters.conductivite.value;
            this.conductivityMap.push(conductivity);
        }
    }

    initializeFieldDistortion() {
        this.fieldDistortion = [];
        const resolution = 16;
        
        for (let y = 0; y < this.element.height; y += resolution) {
            for (let x = 0; x < this.element.width; x += resolution) {
                this.fieldDistortion.push({
                    x, y,
                    fieldX: (Math.random() - 0.5) * 20,
                    fieldY: (Math.random() - 0.5) * 20,
                    intensity: Math.random(),
                    frequency: 0.02 + Math.random() * 0.05
                });
            }
        }
    }

    generateElectricArcs() {
        this.electricArcs = [];
        const numArcs = Math.floor(this.parameters.arcs.value);
        
        for (let i = 0; i < numArcs; i++) {
            if (this.arcPool.length > 0) {
                this.electricArcs.push(this.arcPool.pop());
            } else {
                this.electricArcs.push(this.createElectricArc());
            }
        }
    }

    createElectricArc() {
        const startX = Math.random() * this.element.width;
        const startY = Math.random() * this.element.height;
        
        return {
            points: this.generateArcPath(startX, startY),
            intensity: 0.5 + Math.random() * 0.5,
            lifetime: 0.3 + Math.random() * 0.4,
            age: 0,
            color: this.getTemperatureColor(3000 + Math.random() * 4000),
            thickness: 1 + Math.random() * 3,
            energy: Math.random(),
            frequency: 8 + Math.random() * 12
        };
    }

    generateArcPath(startX, startY) {
        const points = [{ x: startX, y: startY }];
        let currentX = startX;
        let currentY = startY;
        
        const numSegments = 6 + Math.floor(Math.random() * 8);
        const baseLength = 30 + Math.random() * 50;
        
        for (let i = 1; i < numSegments; i++) {
            // Direction préférentielle vers zones conductrices
            const targetAngle = this.findConductivePath(currentX, currentY);
            const randomness = (Math.random() - 0.5) * Math.PI * 0.8;
            const angle = targetAngle + randomness;
            
            const length = baseLength * (0.7 + Math.random() * 0.6);
            currentX += Math.cos(angle) * length;
            currentY += Math.sin(angle) * length;
            
            // Contraindre dans les limites
            currentX = Math.max(0, Math.min(this.element.width, currentX));
            currentY = Math.max(0, Math.min(this.element.height, currentY));
            
            points.push({ x: currentX, y: currentY });
        }
        
        return points;
    }

    findConductivePath(x, y) {
        const radius = 50;
        let bestAngle = Math.random() * Math.PI * 2;
        let bestConductivity = 0;
        
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const testX = Math.floor(x + Math.cos(angle) * radius);
            const testY = Math.floor(y + Math.sin(angle) * radius);
            
            if (testX >= 0 && testX < this.element.width && testY >= 0 && testY < this.element.height) {
                const index = testY * this.element.width + testX;
                const conductivity = this.conductivityMap[index] || 0;
                
                if (conductivity > bestConductivity) {
                    bestConductivity = conductivity;
                    bestAngle = angle;
                }
            }
        }
        
        return bestAngle;
    }

    generateTemperaturePalette() {
        const palette = [];
        
        // Température -> Couleur (spectre de corps noir)
        for (let t = 1000; t <= 8000; t += 100) {
            const color = this.temperatureToRGB(t);
            palette.push({ temp: t, color });
        }
        
        return palette;
    }

    temperatureToRGB(temp) {
        // Approximation du spectre de corps noir
        let r, g, b;
        
        if (temp < 3000) {
            r = 255;
            g = Math.floor(99.4708025861 * Math.log(temp / 100) - 161.1195681661);
            b = temp < 2000 ? 0 : Math.floor(138.5177312231 * Math.log(temp / 100 - 10) - 305.0447927307);
        } else if (temp < 6600) {
            r = Math.floor(329.698727446 * Math.pow(temp / 100 - 60, -0.1332047592));
            g = Math.floor(288.1221695283 * Math.pow(temp / 100 - 60, -0.0755148492));
            b = 255;
        } else {
            r = 255;
            g = 255;
            b = Math.floor(138.5177312231 * Math.log(temp / 100 - 50) - 305.0447927307);
        }
        
        return {
            r: Math.max(0, Math.min(255, r)),
            g: Math.max(0, Math.min(255, g)),
            b: Math.max(0, Math.min(255, b))
        };
    }

    getTemperatureColor(temp) {
        const rgb = this.temperatureToRGB(temp);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    initializePools() {
        // Pool d'arcs électriques
        for (let i = 0; i < 50; i++) {
            this.arcPool.push({
                points: [],
                intensity: 0,
                lifetime: 0,
                age: 0,
                color: '#ffffff',
                thickness: 1,
                energy: 0,
                frequency: 10
            });
        }
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Mise à jour du plasma
        this.updatePlasmaGrid(deltaTime);
        
        // Mise à jour des arcs électriques
        this.updateElectricArcs(deltaTime);
        
        // Mise à jour des champs de distorsion
        this.updateFieldDistortion(deltaTime);
        
        // Génération d'nouveaux arcs (addiction factor)
        if (Math.random() < 0.02 * this.parameters.intensite.value) {
            this.generateNewArc();
        }
    }

    updatePlasmaGrid(deltaTime) {
        this.plasmaGrid.forEach(plasma => {
            // Évolution de l'ionisation
            const baseIonization = Math.sin(this.temps * 0.003 + plasma.phase) * 0.3 + 0.5;
            plasma.ionization = baseIonization * this.parameters.intensite.value;
            
            // Fluctuation de température
            const tempVar = Math.sin(this.temps * 0.005 + plasma.phase * 2) * 500;
            plasma.temperature = this.parameters.temperature.value + tempVar;
            
            // Oscillation de charge
            plasma.charge = Math.sin(this.temps * 0.004 + plasma.phase * 1.5) * plasma.ionization;
            
            // Énergie évolutive
            plasma.energy = (plasma.ionization + Math.abs(plasma.charge)) * 0.5;
        });
    }

    updateElectricArcs(deltaTime) {
        for (let i = this.electricArcs.length - 1; i >= 0; i--) {
            const arc = this.electricArcs[i];
            arc.age += deltaTime;
            
            // Intensité décroissante avec oscillations
            const lifeRatio = arc.age / arc.lifetime;
            arc.intensity = (1 - lifeRatio) * (0.7 + Math.sin(this.temps * arc.frequency) * 0.3);
            
            if (arc.age >= arc.lifetime) {
                // Recycler l'arc
                this.arcPool.push(this.electricArcs.splice(i, 1)[0]);
            }
        }
    }

    updateFieldDistortion(deltaTime) {
        this.fieldDistortion.forEach(field => {
            const oscillation = Math.sin(this.temps * field.frequency) * this.parameters.champs.value;
            field.fieldX = oscillation * 15 * field.intensity;
            field.fieldY = Math.cos(this.temps * field.frequency * 1.3) * 10 * field.intensity;
        });
    }

    generateNewArc() {
        if (this.arcPool.length > 0 && this.electricArcs.length < this.parameters.arcs.value * 2) {
            const arc = this.arcPool.pop();
            
            // Régénérer l'arc
            const startX = Math.random() * this.element.width;
            const startY = Math.random() * this.element.height;
            arc.points = this.generateArcPath(startX, startY);
            arc.intensity = 0.8 + Math.random() * 0.2;
            arc.lifetime = 0.2 + Math.random() * 0.3;
            arc.age = 0;
            arc.color = this.getTemperatureColor(4000 + Math.random() * 3000);
            arc.thickness = 0.5 + Math.random() * 2;
            arc.frequency = 10 + Math.random() * 15;
            
            this.electricArcs.push(arc);
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Position de l'élément
        ctx.translate(element.x, element.y);
        
        // Rendu du plasma ionisé
        this.renderPlasmaField(ctx);
        
        // Rendu des distorsions électromagnétiques
        this.renderFieldDistortion(ctx);
        
        // Rendu des arcs électriques
        this.renderElectricArcs(ctx);
        
        // Rendu de l'image avec effet d'ionisation
        this.renderIonizedImage(ctx);
        
        // Effets de post-traitement
        this.renderEnergyGlow(ctx);
        
        ctx.restore();
    }

    renderPlasmaField(ctx) {
        this.plasmaGrid.forEach(plasma => {
            if (plasma.ionization > this.PLASMA_THRESHOLD) {
                const alpha = (plasma.ionization - this.PLASMA_THRESHOLD) * 0.8;
                const size = plasma.energy * 12 + 4;
                
                // Couleur basée sur la température
                const color = this.getTemperatureColor(plasma.temperature);
                
                // Gradient radial pour effet plasma
                const gradient = ctx.createRadialGradient(
                    plasma.x, plasma.y, 0,
                    plasma.x, plasma.y, size
                );
                gradient.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `, ${alpha})`));
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(plasma.x, plasma.y, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Effet de charge électrique
                if (Math.abs(plasma.charge) > 0.5) {
                    ctx.strokeStyle = plasma.charge > 0 ? '#ff4444' : '#4444ff';
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = Math.abs(plasma.charge) * 0.5;
                    ctx.beginPath();
                    ctx.arc(plasma.x, plasma.y, size * 1.2, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        });
    }

    renderFieldDistortion(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.fieldDistortion.forEach(field => {
            const intensity = field.intensity * this.parameters.champs.value;
            
            if (intensity > 0.3) {
                // Lignes de champ électromagnétique
                ctx.strokeStyle = `rgba(100, 200, 255, ${intensity * 0.4})`;
                ctx.lineWidth = 0.5;
                
                ctx.beginPath();
                ctx.moveTo(field.x - field.fieldX, field.y - field.fieldY);
                ctx.lineTo(field.x + field.fieldX, field.y + field.fieldY);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(field.x - field.fieldY * 0.5, field.y + field.fieldX * 0.5);
                ctx.lineTo(field.x + field.fieldY * 0.5, field.y - field.fieldX * 0.5);
                ctx.stroke();
            }
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    renderElectricArcs(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.electricArcs.forEach(arc => {
            if (arc.intensity > 0.1) {
                ctx.strokeStyle = arc.color.replace('rgb', 'rgba').replace(')', `, ${arc.intensity})`);
                ctx.lineWidth = arc.thickness * arc.intensity;
                ctx.lineCap = 'round';
                
                // Arc principal
                ctx.beginPath();
                ctx.moveTo(arc.points[0].x, arc.points[0].y);
                
                for (let i = 1; i < arc.points.length; i++) {
                    // Effet de tremblement électrique
                    const trembleX = (Math.random() - 0.5) * 3 * arc.intensity;
                    const trembleY = (Math.random() - 0.5) * 3 * arc.intensity;
                    
                    ctx.lineTo(
                        arc.points[i].x + trembleX,
                        arc.points[i].y + trembleY
                    );
                }
                ctx.stroke();
                
                // Éclairs secondaires (30% de chance)
                if (Math.random() < 0.3 * arc.intensity) {
                    ctx.lineWidth = arc.thickness * 0.5;
                    ctx.globalAlpha = arc.intensity * 0.6;
                    
                    const midPoint = arc.points[Math.floor(arc.points.length / 2)];
                    const branchLength = 20 + Math.random() * 30;
                    const branchAngle = Math.random() * Math.PI * 2;
                    
                    ctx.beginPath();
                    ctx.moveTo(midPoint.x, midPoint.y);
                    ctx.lineTo(
                        midPoint.x + Math.cos(branchAngle) * branchLength,
                        midPoint.y + Math.sin(branchAngle) * branchLength
                    );
                    ctx.stroke();
                    
                    ctx.globalAlpha = 1;
                }
            }
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    renderIonizedImage(ctx) {
        if (!this.imageData) return;
        
        // Créer une copie modifiée de l'image
        const ionizedData = ctx.createImageData(this.element.width, this.element.height);
        const sourceData = this.imageData.data;
        const targetData = ionizedData.data;
        
        for (let i = 0; i < sourceData.length; i += 4) {
            const pixelIndex = i / 4;
            const conductivity = this.conductivityMap[pixelIndex] || 0;
            
            // Effet d'ionisation sur les pixels
            const ionizationFactor = conductivity * this.parameters.intensite.value;
            const energyBoost = Math.sin(this.temps * 0.01 + pixelIndex * 0.001) * ionizationFactor;
            
            // Couleurs originales
            let r = sourceData[i];
            let g = sourceData[i + 1];
            let b = sourceData[i + 2];
            let a = sourceData[i + 3];
            
            // Application des effets d'ionisation
            if (ionizationFactor > 0.3) {
                // Shift vers les couleurs chaudes
                r = Math.min(255, r + energyBoost * 60);
                g = Math.min(255, g + energyBoost * 30);
                b = Math.max(0, b - energyBoost * 10);
                
                // Effet de plasma
                const plasmaIntensity = ionizationFactor * 0.5;
                r = Math.min(255, r + plasmaIntensity * 100);
                g = Math.min(255, g + plasmaIntensity * 50);
            }
            
            targetData[i] = r;
            targetData[i + 1] = g;
            targetData[i + 2] = b;
            targetData[i + 3] = a;
        }
        
        // Appliquer l'image ionisée
        ctx.putImageData(ionizedData, 0, 0);
    }

    renderEnergyGlow(ctx) {
        // Effet de lueur énergétique globale
        const glowIntensity = Math.sin(this.temps * 0.008) * 0.1 + 0.1;
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(100, 200, 255, ${glowIntensity * this.parameters.intensite.value})`;
        ctx.fillRect(0, 0, this.element.width, this.element.height);
        
        // Pulsation énergétique
        const pulseRadius = Math.sin(this.temps * 0.006) * 50 + 100;
        const centerX = this.element.width / 2;
        const centerY = this.element.height / 2;
        
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, pulseRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.element.width, this.element.height);
        
        ctx.globalCompositeOperation = 'source-over';
    }

    destroy() {
        // Nettoyage des ressources
        this.plasmaGrid = [];
        this.electricArcs = [];
        this.fieldDistortion = [];
        this.conductivityMap = [];
        this.temperatureField = [];
        this.arcPool = [];
        this.particlePool = [];
        this.imageData = null;
        this.temperaturePalette = [];
    }
}