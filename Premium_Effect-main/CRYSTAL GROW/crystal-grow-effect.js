class CrystalGrowEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'crystalline-formation-023',
            name: 'Cristallogenèse Progressive',
            category: 'text',
            version: '1.0',
            performance: 'high',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.3 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                complexite: { type: 'range', min: 0.3, max: 1, default: 0.7 },
                dispersion: { type: 'range', min: 0, max: 1, default: 0.6 },
                couleurBase: { type: 'color', default: '#8b5cf6' },
                brillance: { type: 'range', min: 0, max: 1, default: 0.9 }
            }
        });

        // Variables de cristallogenèse
        this.temps = 0;
        this.crystals = [];
        this.nucleationPoints = [];
        this.facets = [];
        this.maxCrystals = 150;
        
        // Système de croissance fractale
        this.growthPatterns = [];
        this.geometryTypes = ['hexagonal', 'cubic', 'orthorhombic', 'tetragonal'];
        this.currentGeometry = 'hexagonal';
        
        // Physique cristalline
        this.growthRate = 0.8;
        this.nucleationRate = 0.3;
        this.crystallineOrder = 0;
        
        // Propriétés optiques
        this.refractionIndex = 1.5;
        this.dispersionCoefficient = 0.3;
        this.lightSources = [];
        this.spectrumColors = [
            '#ff0000', '#ff4500', '#ffa500', '#ffff00', 
            '#9aff9a', '#00ffff', '#0000ff', '#8a2be2'
        ];
        
        // Pool de cristaux pour performance
        this.crystalPool = [];
        this.facetPool = [];
        this.initializePools();
        
        // États de croissance
        this.growthStates = {
            nucleation: 0,
            growth: 1,
            faceting: 2,
            dispersion: 3,
            reformation: 4
        };
        this.currentState = this.growthStates.nucleation;
    }

    initializePools() {
        // Pool de cristaux
        for (let i = 0; i < this.maxCrystals; i++) {
            this.crystalPool.push({
                x: 0, y: 0, z: 0,
                size: 0, maxSize: 0,
                geometry: 'hexagonal',
                vertices: [],
                faces: [],
                age: 0, growth: 0,
                active: false,
                generation: 0,
                parent: null,
                children: [],
                nucleationPoint: null,
                refractionAngle: 0,
                spectrum: []
            });
        }
        
        // Pool de facettes
        for (let i = 0; i < 500; i++) {
            this.facetPool.push({
                vertices: [],
                normal: { x: 0, y: 0, z: 1 },
                center: { x: 0, y: 0, z: 0 },
                area: 0,
                reflectance: 0,
                color: '#ffffff',
                active: false,
                parent: null
            });
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        // Initialisation des sources lumineuses
        this.initializeLighting();
        
        // Génération des points de nucléation
        this.generateNucleationPoints();
        
        // Initialisation des patterns de croissance
        this.initializeGrowthPatterns();
    }

    initializeLighting() {
        this.lightSources = [
            { 
                x: this.centerX - 150, 
                y: this.centerY - 200, 
                z: 100,
                intensity: 1.0,
                color: '#ffffff'
            },
            { 
                x: this.centerX + 100, 
                y: this.centerY - 100, 
                z: 80,
                intensity: 0.7,
                color: '#f8fafc'
            },
            { 
                x: this.centerX, 
                y: this.centerY + 150, 
                z: 60,
                intensity: 0.5,
                color: '#e0e7ff'
            }
        ];
    }

    generateNucleationPoints() {
        this.nucleationPoints = [];
        const pointCount = Math.floor(8 + this.parameters.complexite.value * 12);
        
        for (let i = 0; i < pointCount; i++) {
            this.nucleationPoints.push({
                x: this.element.x + Math.random() * this.element.width,
                y: this.element.y + Math.random() * this.element.height,
                energy: 0.5 + Math.random() * 0.5,
                geometry: this.geometryTypes[Math.floor(Math.random() * this.geometryTypes.length)],
                activated: false,
                activationTime: Math.random() * 3000,
                crystalsSpawned: 0,
                maxCrystals: 3 + Math.floor(Math.random() * 5)
            });
        }
    }

    initializeGrowthPatterns() {
        this.growthPatterns = {
            hexagonal: {
                angles: [0, 60, 120, 180, 240, 300],
                vertices: 6,
                symmetry: 6,
                growthVectors: []
            },
            cubic: {
                angles: [0, 90, 180, 270],
                vertices: 8,
                symmetry: 4,
                growthVectors: []
            },
            orthorhombic: {
                angles: [0, 72, 144, 216, 288],
                vertices: 5,
                symmetry: 5,
                growthVectors: []
            },
            tetragonal: {
                angles: [0, 45, 90, 135, 180, 225, 270, 315],
                vertices: 8,
                symmetry: 4,
                growthVectors: []
            }
        };
        
        // Précalcul des vecteurs de croissance
        Object.keys(this.growthPatterns).forEach(geometry => {
            const pattern = this.growthPatterns[geometry];
            pattern.growthVectors = pattern.angles.map(angle => ({
                x: Math.cos(angle * Math.PI / 180),
                y: Math.sin(angle * Math.PI / 180),
                z: Math.sin(angle * Math.PI / 90) * 0.3
            }));
        });
    }

    getStateProgress() {
        const cycle = (this.temps * 0.0004) % 5;
        
        if (cycle < 1) {
            this.currentState = this.growthStates.nucleation;
            return { state: 'nucleation', progress: cycle };
        } else if (cycle < 2) {
            this.currentState = this.growthStates.growth;
            return { state: 'growth', progress: cycle - 1 };
        } else if (cycle < 3) {
            this.currentState = this.growthStates.faceting;
            return { state: 'faceting', progress: cycle - 2 };
        } else if (cycle < 4) {
            this.currentState = this.growthStates.dispersion;
            return { state: 'dispersion', progress: cycle - 3 };
        } else {
            this.currentState = this.growthStates.reformation;
            return { state: 'reformation', progress: cycle - 4 };
        }
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Mise à jour du centre
        this.centerX = element.x + element.width / 2;
        this.centerY = element.y + element.height / 2;
        
        const stateInfo = this.getStateProgress();
        this.crystallineOrder = this.calculateCrystallineOrder(stateInfo);
        
        // Mise à jour de la cristallogenèse
        this.updateCrystallogenesis(deltaTime, stateInfo);
        
        ctx.save();
        
        // Rendu selon l'état de croissance
        this.renderCrystallineState(ctx, stateInfo);
        
        ctx.restore();
    }

    calculateCrystallineOrder(stateInfo) {
        const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        switch (stateInfo.state) {
            case 'nucleation':
                return easeInOut(stateInfo.progress) * 0.3;
            case 'growth':
                return 0.3 + easeInOut(stateInfo.progress) * 0.4;
            case 'faceting':
                return 0.7 + easeInOut(stateInfo.progress) * 0.2;
            case 'dispersion':
                return 0.9 + easeInOut(stateInfo.progress) * 0.1;
            case 'reformation':
                return 1.0 - easeInOut(stateInfo.progress) * 0.7;
            default:
                return 0;
        }
    }

    updateCrystallogenesis(deltaTime, stateInfo) {
        // Activation des points de nucléation
        this.updateNucleationPoints(deltaTime);
        
        // Croissance des cristaux existants
        this.updateCrystalGrowth(deltaTime);
        
        // Génération de nouvelles facettes
        this.updateFacets(deltaTime);
        
        // Mise à jour des propriétés optiques
        this.updateOpticalProperties(deltaTime, stateInfo);
        
        // Nettoyage des cristaux inactifs
        this.cleanupInactiveCrystals();
    }

    updateNucleationPoints(deltaTime) {
        this.nucleationPoints.forEach(point => {
            if (!point.activated && this.temps > point.activationTime) {
                point.activated = true;
                this.nucleateCrystal(point);
            }
            
            if (point.activated && point.crystalsSpawned < point.maxCrystals) {
                if (Math.random() < 0.01 * this.crystallineOrder) {
                    this.nucleateCrystal(point);
                }
            }
        });
    }

    nucleateCrystal(nucleationPoint) {
        const crystal = this.getFreeCrystal();
        if (!crystal) return;
        
        // Position avec variation aléatoire
        const variation = 20 * (1 - this.crystallineOrder);
        crystal.x = nucleationPoint.x + (Math.random() - 0.5) * variation;
        crystal.y = nucleationPoint.y + (Math.random() - 0.5) * variation;
        crystal.z = (Math.random() - 0.5) * 10;
        
        // Propriétés cristallines
        crystal.geometry = nucleationPoint.geometry;
        crystal.size = 0;
        crystal.maxSize = 15 + Math.random() * 25 * this.parameters.intensite.value;
        crystal.age = 0;
        crystal.growth = 0;
        crystal.active = true;
        crystal.nucleationPoint = nucleationPoint;
        crystal.generation = 0;
        crystal.refractionAngle = Math.random() * Math.PI * 2;
        
        // Génération du spectre de couleurs
        this.generateSpectrum(crystal);
        
        // Génération de la géométrie initiale
        this.generateCrystalGeometry(crystal);
        
        this.crystals.push(crystal);
        nucleationPoint.crystalsSpawned++;
    }

    generateSpectrum(crystal) {
        crystal.spectrum = [];
        const baseHue = this.hexToHsl(this.parameters.couleurBase.value).h;
        
        this.spectrumColors.forEach((color, index) => {
            const intensity = Math.random() * this.parameters.dispersion.value;
            const refraction = 1 + (index / this.spectrumColors.length) * this.dispersionCoefficient;
            
            crystal.spectrum.push({
                color: color,
                intensity: intensity,
                refraction: refraction,
                angle: crystal.refractionAngle + index * 0.1
            });
        });
    }

    generateCrystalGeometry(crystal) {
        const pattern = this.growthPatterns[crystal.geometry];
        crystal.vertices = [];
        crystal.faces = [];
        
        // Génération des vertices selon la géométrie
        pattern.growthVectors.forEach((vector, index) => {
            const distance = crystal.size;
            crystal.vertices.push({
                x: crystal.x + vector.x * distance,
                y: crystal.y + vector.y * distance,
                z: crystal.z + vector.z * distance,
                original: { x: vector.x, y: vector.y, z: vector.z }
            });
        });
        
        // Génération des faces
        this.generateCrystalFaces(crystal);
    }

    generateCrystalFaces(crystal) {
        const pattern = this.growthPatterns[crystal.geometry];
        crystal.faces = [];
        
        // Face centrale
        for (let i = 0; i < pattern.vertices; i++) {
            const nextIndex = (i + 1) % pattern.vertices;
            crystal.faces.push({
                vertices: [
                    { x: crystal.x, y: crystal.y, z: crystal.z },
                    crystal.vertices[i],
                    crystal.vertices[nextIndex]
                ],
                normal: this.calculateFaceNormal(
                    { x: crystal.x, y: crystal.y, z: crystal.z },
                    crystal.vertices[i],
                    crystal.vertices[nextIndex]
                )
            });
        }
    }

    calculateFaceNormal(v1, v2, v3) {
        const a = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
        const b = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
        
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    updateCrystalGrowth(deltaTime) {
        this.crystals.forEach(crystal => {
            if (!crystal.active) return;
            
            crystal.age += deltaTime;
            
            // Croissance fractale
            if (crystal.size < crystal.maxSize) {
                const growthSpeed = this.growthRate * this.crystallineOrder * 
                                 (1 - crystal.size / crystal.maxSize);
                crystal.size += growthSpeed * deltaTime * 0.01;
                crystal.growth = crystal.size / crystal.maxSize;
                
                // Mise à jour de la géométrie
                this.updateCrystalGeometry(crystal);
                
                // Génération de cristaux enfants (croissance fractale)
                if (crystal.growth > 0.6 && crystal.children.length === 0 && 
                    crystal.generation < 2 && Math.random() < 0.1) {
                    this.generateChildCrystals(crystal);
                }
            }
            
            // Mort naturelle
            if (crystal.age > 8000 + Math.random() * 4000) {
                crystal.active = false;
            }
        });
    }

    updateCrystalGeometry(crystal) {
        const pattern = this.growthPatterns[crystal.geometry];
        
        pattern.growthVectors.forEach((vector, index) => {
            if (crystal.vertices[index]) {
                const distance = crystal.size;
                crystal.vertices[index].x = crystal.x + vector.x * distance;
                crystal.vertices[index].y = crystal.y + vector.y * distance;
                crystal.vertices[index].z = crystal.z + vector.z * distance;
            }
        });
        
        // Mise à jour des faces
        this.generateCrystalFaces(crystal);
    }

    generateChildCrystals(parent) {
        const childCount = 2 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < childCount; i++) {
            const child = this.getFreeCrystal();
            if (!child) continue;
            
            // Position sur le périmètre du parent
            const angle = (i / childCount) * Math.PI * 2;
            const distance = parent.size * 1.2;
            
            child.x = parent.x + Math.cos(angle) * distance;
            child.y = parent.y + Math.sin(angle) * distance;
            child.z = parent.z + (Math.random() - 0.5) * 5;
            
            child.geometry = parent.geometry;
            child.size = 0;
            child.maxSize = parent.maxSize * (0.4 + Math.random() * 0.3);
            child.age = 0;
            child.growth = 0;
            child.active = true;
            child.parent = parent;
            child.generation = parent.generation + 1;
            child.nucleationPoint = parent.nucleationPoint;
            child.refractionAngle = parent.refractionAngle + angle;
            
            this.generateSpectrum(child);
            this.generateCrystalGeometry(child);
            
            parent.children.push(child);
            this.crystals.push(child);
        }
    }

    updateFacets(deltaTime) {
        // Génération dynamique de facettes pour les reflets
        this.crystals.forEach(crystal => {
            if (!crystal.active || crystal.growth < 0.3) return;
            
            crystal.faces.forEach(face => {
                if (Math.random() < 0.05) {
                    const facet = this.getFreeFacet();
                    if (facet) {
                        facet.vertices = [...face.vertices];
                        facet.normal = face.normal;
                        facet.center = this.calculateFaceCenter(face.vertices);
                        facet.area = this.calculateFaceArea(face.vertices);
                        facet.reflectance = this.calculateReflectance(facet, crystal);
                        facet.color = this.calculateFacetColor(facet, crystal);
                        facet.active = true;
                        facet.parent = crystal;
                        
                        this.facets.push(facet);
                    }
                }
            });
        });
    }

    calculateFaceCenter(vertices) {
        let centerX = 0, centerY = 0, centerZ = 0;
        vertices.forEach(vertex => {
            centerX += vertex.x;
            centerY += vertex.y;
            centerZ += vertex.z;
        });
        
        return {
            x: centerX / vertices.length,
            y: centerY / vertices.length,
            z: centerZ / vertices.length
        };
    }

    calculateFaceArea(vertices) {
        // Approximation triangulaire
        if (vertices.length < 3) return 0;
        
        const v1 = vertices[0];
        const v2 = vertices[1];
        const v3 = vertices[2];
        
        const a = Math.sqrt(
            Math.pow(v2.x - v1.x, 2) + 
            Math.pow(v2.y - v1.y, 2) + 
            Math.pow(v2.z - v1.z, 2)
        );
        const b = Math.sqrt(
            Math.pow(v3.x - v2.x, 2) + 
            Math.pow(v3.y - v2.y, 2) + 
            Math.pow(v3.z - v2.z, 2)
        );
        const c = Math.sqrt(
            Math.pow(v1.x - v3.x, 2) + 
            Math.pow(v1.y - v3.y, 2) + 
            Math.pow(v1.z - v3.z, 2)
        );
        
        const s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }

    calculateReflectance(facet, crystal) {
        // Calcul basé sur l'angle avec les sources lumineuses
        let maxReflectance = 0;
        
        this.lightSources.forEach(light => {
            const lightVector = {
                x: light.x - facet.center.x,
                y: light.y - facet.center.y,
                z: light.z - facet.center.z
            };
            
            const dotProduct = 
                lightVector.x * facet.normal.x +
                lightVector.y * facet.normal.y +
                lightVector.z * facet.normal.z;
            
            const reflectance = Math.max(0, dotProduct) * light.intensity;
            maxReflectance = Math.max(maxReflectance, reflectance);
        });
        
        return maxReflectance * this.parameters.brillance.value;
    }

    calculateFacetColor(facet, crystal) {
        // Mélange spectral basé sur l'angle de réfraction
        let r = 0, g = 0, b = 0, totalIntensity = 0;
        
        crystal.spectrum.forEach(spectrum => {
            const angle = Math.abs(facet.normal.x * Math.cos(spectrum.angle) + 
                                 facet.normal.y * Math.sin(spectrum.angle));
            const intensity = spectrum.intensity * angle * facet.reflectance;
            
            if (intensity > 0) {
                const color = this.hexToRgb(spectrum.color);
                r += color.r * intensity;
                g += color.g * intensity;
                b += color.b * intensity;
                totalIntensity += intensity;
            }
        });
        
        if (totalIntensity > 0) {
            r = Math.floor(r / totalIntensity);
            g = Math.floor(g / totalIntensity);
            b = Math.floor(b / totalIntensity);
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        return this.parameters.couleurBase.value;
    }

    updateOpticalProperties(deltaTime, stateInfo) {
        // Mise à jour des propriétés de réfraction et dispersion
        this.crystals.forEach(crystal => {
            if (!crystal.active) return;
            
            crystal.refractionAngle += deltaTime * 0.0001 * this.parameters.vitesse.value;
            
            // Mise à jour du spectre
            crystal.spectrum.forEach(spectrum => {
                spectrum.angle += deltaTime * 0.0002;
                spectrum.intensity = Math.max(0, 
                    spectrum.intensity + (Math.random() - 0.5) * 0.01);
            });
        });
    }

    cleanupInactiveCrystals() {
        this.crystals = this.crystals.filter(crystal => crystal.active);
        this.facets = this.facets.filter(facet => facet.active && facet.parent && facet.parent.active);
        
        // Retour au pool
        this.crystals.forEach(crystal => {
            if (!crystal.active) {
                crystal.children = [];
                crystal.parent = null;
                crystal.nucleationPoint = null;
            }
        });
    }

    renderCrystallineState(ctx, stateInfo) {
        // Rendu selon l'état de croissance
        switch (stateInfo.state) {
            case 'nucleation':
                this.renderNucleation(ctx, stateInfo.progress);
                break;
            case 'growth':
                this.renderGrowth(ctx, stateInfo.progress);
                break;
            case 'faceting':
                this.renderFaceting(ctx, stateInfo.progress);
                break;
            case 'dispersion':
                this.renderDispersion(ctx, stateInfo.progress);
                break;
            case 'reformation':
                this.renderReformation(ctx, stateInfo.progress);
                break;
        }
        
        // Rendu des points de nucléation
        this.renderNucleationPoints(ctx);
    }

    renderNucleation(ctx, progress) {
        // Points de nucléation qui s'activent
        ctx.save();
        
        this.nucleationPoints.forEach(point => {
            if (point.activated) {
                const pulseIntensity = Math.sin(this.temps * 0.01) * 0.5 + 0.5;
                const alpha = progress * point.energy * pulseIntensity;
                
                ctx.fillStyle = `${this.parameters.couleurBase.value}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3 + pulseIntensity * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Cristaux naissants
        this.renderCrystals(ctx, progress * 0.3);
        
        ctx.restore();
    }

    renderGrowth(ctx, progress) {
        // Croissance fractale visible
        ctx.save();
        
        this.renderCrystals(ctx, 0.3 + progress * 0.4);
        this.renderGrowthVectors(ctx, progress);
        
        ctx.restore();
    }

    renderFaceting(ctx, progress) {
        // Apparition des facettes
        ctx.save();
        
        this.renderCrystals(ctx, 0.7 + progress * 0.2);
        this.renderFacets(ctx, progress);
        
        ctx.restore();
    }

    renderDispersion(ctx, progress) {
        // Dispersion spectrale complète
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        this.renderCrystals(ctx, 0.9);
        this.renderFacets(ctx, 1.0);
        this.renderSpectralDispersion(ctx, progress);
        
        ctx.restore();
    }

    renderReformation(ctx, progress) {
        // Dissolution et reformation
        ctx.save();
        
        const dissolveAlpha = 1 - progress * 0.3;
        ctx.globalAlpha = dissolveAlpha;
        
        this.renderCrystals(ctx, 0.9 * dissolveAlpha);
        
        ctx.restore();
    }

    renderCrystals(ctx, intensity) {
        this.crystals.forEach(crystal => {
            if (!crystal.active || crystal.size < 1) return;
            
            this.renderCrystal(ctx, crystal, intensity);
        });
    }

    renderCrystal(ctx, crystal, intensity) {
        ctx.save();
        
        // Corps du cristal
        const alpha = Math.min(1, intensity * crystal.growth);
        const baseColor = this.hexToRgb(this.parameters.couleurBase.value);
        
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha * 0.6})`;
        ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`;
        ctx.lineWidth = 1 + crystal.size * 0.05;
        
        // Rendu des faces
        crystal.faces.forEach(face => {
            ctx.beginPath();
            face.vertices.forEach((vertex, index) => {
                if (index === 0) {
                    ctx.moveTo(vertex.x, vertex.y);
                } else {
                    ctx.lineTo(vertex.x, vertex.y);
                }
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
        
        // Point central brillant
        if (crystal.growth > 0.5) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(crystal.x, crystal.y, 1 + crystal.size * 0.02, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    renderGrowthVectors(ctx, progress) {
        if (progress < 0.3) return;
        
        ctx.save();
        ctx.strokeStyle = `${this.parameters.couleurBase.value}40`;
        ctx.lineWidth = 1;
        
        this.crystals.forEach(crystal => {
            if (!crystal.active || crystal.growth < 0.3) return;
            
            const pattern = this.growthPatterns[crystal.geometry];
            pattern.growthVectors.forEach(vector => {
                const length = crystal.size * progress;
                ctx.beginPath();
                ctx.moveTo(crystal.x, crystal.y);
                ctx.lineTo(
                    crystal.x + vector.x * length,
                    crystal.y + vector.y * length
                );
                ctx.stroke();
            });
        });
        
        ctx.restore();
    }

    renderFacets(ctx, progress) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        this.facets.forEach(facet => {
            if (!facet.active || facet.reflectance < 0.1) return;
            
            const alpha = facet.reflectance * progress;
            ctx.fillStyle = `${facet.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            
            ctx.beginPath();
            facet.vertices.forEach((vertex, index) => {
                if (index === 0) {
                    ctx.moveTo(vertex.x, vertex.y);
                } else {
                    ctx.lineTo(vertex.x, vertex.y);
                }
            });
            ctx.closePath();
            ctx.fill();
        });
        
        ctx.restore();
    }

    renderSpectralDispersion(ctx, progress) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        this.crystals.forEach(crystal => {
            if (!crystal.active || crystal.growth < 0.7) return;
            
            crystal.spectrum.forEach(spectrum => {
                if (spectrum.intensity < 0.1) return;
                
                const dispersionDistance = 20 + progress * 30;
                const angle = spectrum.angle + crystal.refractionAngle;
                
                const dispersedX = crystal.x + Math.cos(angle) * dispersionDistance;
                const dispersedY = crystal.y + Math.sin(angle) * dispersionDistance;
                
                const alpha = spectrum.intensity * progress * this.parameters.dispersion.value;
                const color = this.hexToRgb(spectrum.color);
                
                // Rayon dispersé
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                ctx.lineWidth = 2 + spectrum.intensity * 3;
                ctx.beginPath();
                ctx.moveTo(crystal.x, crystal.y);
                ctx.lineTo(dispersedX, dispersedY);
                ctx.stroke();
                
                // Point de lumière dispersée
                const gradient = ctx.createRadialGradient(
                    dispersedX, dispersedY, 0,
                    dispersedX, dispersedY, 8
                );
                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(dispersedX, dispersedY, 8, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        
        ctx.restore();
    }

    renderNucleationPoints(ctx) {
        ctx.save();
        
        this.nucleationPoints.forEach(point => {
            if (!point.activated) return;
            
            const pulsePhase = this.temps * 0.005 + point.x * 0.01;
            const pulseIntensity = Math.sin(pulsePhase) * 0.3 + 0.7;
            const energyRadius = 2 + point.energy * 3 * pulseIntensity;
            
            // Aura énergétique
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, energyRadius * 2
            );
            gradient.addColorStop(0, `${this.parameters.couleurBase.value}60`);
            gradient.addColorStop(0.7, `${this.parameters.couleurBase.value}20`);
            gradient.addColorStop(1, `${this.parameters.couleurBase.value}00`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, energyRadius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Noyau cristallin
            ctx.fillStyle = this.parameters.couleurBase.value;
            ctx.beginPath();
            ctx.arc(point.x, point.y, energyRadius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Géométrie indicative
            if (point.crystalsSpawned === 0) {
                const pattern = this.growthPatterns[point.geometry];
                ctx.strokeStyle = `${this.parameters.couleurBase.value}40`;
                ctx.lineWidth = 1;
                
                pattern.angles.forEach(angle => {
                    const radian = angle * Math.PI / 180;
                    const length = energyRadius * 1.5;
                    
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(
                        point.x + Math.cos(radian) * length,
                        point.y + Math.sin(radian) * length
                    );
                    ctx.stroke();
                });
            }
        });
        
        ctx.restore();
    }

    getFreeCrystal() {
        return this.crystalPool.find(crystal => !crystal.active);
    }

    getFreeFacet() {
        return this.facetPool.find(facet => !facet.active);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s, l: l };
    }

    update(deltaTime) {
        // Mise à jour continue de la cristallogenèse
    }

    destroy() {
        this.crystals = [];
        this.nucleationPoints = [];
        this.facets = [];
        this.crystalPool = [];
        this.facetPool = [];
        this.growthPatterns = {};
        this.lightSources = [];
        this.spectrumColors = [];
    }
}