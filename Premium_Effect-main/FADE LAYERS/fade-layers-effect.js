class FadeLayersEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'opacity-depth-stacking-009',
            name: 'Stratification Profondeur',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.3, max: 2.5, default: 1 },
                intensite: { type: 'range', min: 0.2, max: 1, default: 0.7 },
                couleurBase: { type: 'color', default: '#ffffff' },
                couleurProfondeur: { type: 'color', default: '#00ffff' },
                nombreCouches: { type: 'range', min: 5, max: 15, default: 9 },
                profondeurMax: { type: 'range', min: 20, max: 80, default: 40 },
                interferenceRate: { type: 'range', min: 0.1, max: 0.8, default: 0.3 }
            }
        });

        // Variables temporelles
        this.temps = 0;
        this.cyclePhase = 0;
        this.interferencePhase = 0;
        
        // Système de couches
        this.couches = [];
        this.layerStates = [];
        
        // Cache des mesures de texte
        this.textMetrics = null;
        this.basePosition = { x: 0, y: 0 };
        
        // Oscillateurs pour rythmes complexes
        this.oscillateurs = [];
        
        // États d'interférence
        this.interferenceZones = [];
        this.revealPhase = 0;
        
        // Profondeur dynamique
        this.depthAnimation = 0;
        this.depthDirection = 1;
        
        // Noise pour variations organiques
        this.noiseSeeds = [];
        
        // Cache des gradients pour performance
        this.gradientCache = new Map();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Configuration des métriques de texte
        this.setupTextMetrics();
        
        // Initialisation des couches
        this.setupLayers();
        
        // Configuration des oscillateurs
        this.setupOscillators();
        
        // Initialisation des zones d'interférence
        this.setupInterferenceZones();
        
        // Génération des seeds de bruit
        this.generateNoiseSeeds();
        
        // Reset des timers
        this.temps = 0;
        this.cyclePhase = 0;
        this.revealPhase = 0;
    }

    setupTextMetrics() {
        const text = this.element.content || 'LAYERS';
        const fontSize = Math.min(this.element.width / text.length * 1.2, this.element.height * 0.8);
        
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.textMetrics = {
            text: text,
            fontSize: fontSize,
            width: this.ctx.measureText(text).width,
            height: fontSize
        };
        
        this.basePosition = {
            x: this.element.x + this.element.width / 2,
            y: this.element.y + this.element.height / 2
        };
    }

    setupLayers() {
        this.couches = [];
        this.layerStates = [];
        
        const nombreCouches = Math.floor(this.config.parameters.nombreCouches.default);
        const profondeurMax = this.config.parameters.profondeurMax.default;
        
        for (let i = 0; i < nombreCouches; i++) {
            const depth = (i / (nombreCouches - 1)) * profondeurMax;
            const layerIndex = i / (nombreCouches - 1);
            
            // Configuration de chaque couche
            const couche = {
                index: i,
                depth: depth,
                baseOpacity: this.calculateLayerOpacity(layerIndex, nombreCouches),
                currentOpacity: 0,
                
                // Décalages de position pour effet de profondeur
                offsetX: (Math.random() - 0.5) * depth * 0.3,
                offsetY: (Math.random() - 0.5) * depth * 0.3,
                
                // Échelle basée sur la profondeur
                scale: 1 + depth * 0.02,
                
                // Couleur interpolée selon la profondeur
                color: this.interpolateColor(
                    this.config.parameters.couleurBase.default,
                    this.config.parameters.couleurProfondeur.default,
                    layerIndex
                ),
                
                // Phase de pulsation unique
                pulsePhase: (i * Math.PI * 2) / nombreCouches + Math.random() * 0.5,
                pulseFrequency: 1 + (Math.random() - 0.5) * 0.3,
                
                // Paramètres de flou
                blur: depth * 0.5,
                
                // Mode de rendu (normal, multiply, screen, overlay)
                blendMode: this.getLayerBlendMode(i, nombreCouches)
            };
            
            this.couches.push(couche);
            
            // État dynamique de la couche
            this.layerStates.push({
                pulsation: 0,
                interference: 0,
                reveal: 0,
                dynamicOffset: { x: 0, y: 0 },
                temporalShift: Math.random() * Math.PI * 2
            });
        }
    }

    calculateLayerOpacity(layerIndex, totalLayers) {
        // Distribution non-linéaire des opacités pour effet de profondeur
        const curve = Math.pow(1 - layerIndex, 1.5);
        return 0.1 + curve * 0.6;
    }

    interpolateColor(color1, color2, factor) {
        // Conversion hex vers RGB puis interpolation
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    getLayerBlendMode(index, total) {
        const modes = ['source-over', 'multiply', 'screen', 'overlay', 'soft-light'];
        if (index === 0) return 'source-over'; // Couche de base
        if (index === total - 1) return 'screen'; // Couche du dessus
        return modes[index % modes.length];
    }

    setupOscillators() {
        this.oscillateurs = [];
        
        // Oscillateurs primaires pour rythmes de base
        for (let i = 0; i < 3; i++) {
            this.oscillateurs.push({
                frequency: 0.8 + i * 0.4,
                amplitude: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                type: ['sine', 'cosine', 'triangle'][i]
            });
        }
        
        // Oscillateurs secondaires pour interférences
        for (let i = 0; i < 2; i++) {
            this.oscillateurs.push({
                frequency: 2.1 + i * 0.7,
                amplitude: 0.3 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                type: 'interference'
            });
        }
    }

    setupInterferenceZones() {
        this.interferenceZones = [];
        
        // Zones d'interférence constructive/destructive
        const zoneCount = 4 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < zoneCount; i++) {
            this.interferenceZones.push({
                centerX: this.element.x + Math.random() * this.element.width,
                centerY: this.element.y + Math.random() * this.element.height,
                radius: 50 + Math.random() * 100,
                strength: 0.3 + Math.random() * 0.4,
                frequency: 1.2 + Math.random() * 0.8,
                phase: Math.random() * Math.PI * 2,
                type: Math.random() > 0.5 ? 'constructive' : 'destructive'
            });
        }
    }

    generateNoiseSeeds() {
        this.noiseSeeds = [];
        for (let i = 0; i < this.couches.length; i++) {
            this.noiseSeeds.push(Math.random() * 1000);
        }
    }

    // Générateur de bruit Perlin simplifié
    noise(x, y, seed = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }

    update(deltaTime) {
        this.temps += deltaTime * this.config.parameters.vitesse.default * 0.001;
        this.cyclePhase += deltaTime * 0.0005;
        this.interferencePhase += deltaTime * 0.001;
        this.revealPhase += deltaTime * 0.0003;
        
        // Animation de profondeur dynamique
        this.updateDepthAnimation(deltaTime);
        
        // Mise à jour des oscillateurs
        this.updateOscillators(deltaTime);
        
        // Mise à jour des états de couches
        this.updateLayerStates(deltaTime);
        
        // Calcul des interférences
        this.updateInterferences(deltaTime);
        
        // Phase de révélation progressive
        this.updateRevealPhase(deltaTime);
    }

    updateDepthAnimation(deltaTime) {
        this.depthAnimation += deltaTime * 0.0008 * this.depthDirection;
        
        // Oscillation de la profondeur avec changements de direction
        if (this.depthAnimation > 1) {
            this.depthAnimation = 1;
            this.depthDirection = -1;
        } else if (this.depthAnimation < -1) {
            this.depthAnimation = -1;
            this.depthDirection = 1;
        }
    }

    updateOscillators(deltaTime) {
        for (let osc of this.oscillateurs) {
            osc.phase += deltaTime * 0.001 * osc.frequency;
        }
    }

    updateLayerStates(deltaTime) {
        for (let i = 0; i < this.couches.length; i++) {
            const couche = this.couches[i];
            const state = this.layerStates[i];
            
            // Mise à jour de la phase temporelle
            state.temporalShift += deltaTime * 0.001 * couche.pulseFrequency;
            
            // Calcul de la pulsation complexe
            state.pulsation = this.calculateComplexPulsation(couche, state);
            
            // Décalage dynamique basé sur le bruit
            const noiseScale = 0.005;
            state.dynamicOffset.x = this.noise(this.temps * noiseScale, i * 0.1, this.noiseSeeds[i]) * 3;
            state.dynamicOffset.y = this.noise(this.temps * noiseScale + 100, i * 0.1, this.noiseSeeds[i]) * 3;
            
            // Calcul de l'opacité finale
            couche.currentOpacity = this.calculateFinalOpacity(couche, state);
        }
    }

    calculateComplexPulsation(couche, state) {
        let pulsation = 0;
        
        // Combinaison des oscillateurs
        for (let osc of this.oscillateurs) {
            let value = 0;
            
            switch (osc.type) {
                case 'sine':
                    value = Math.sin(osc.phase + couche.pulsePhase);
                    break;
                case 'cosine':
                    value = Math.cos(osc.phase + couche.pulsePhase);
                    break;
                case 'triangle':
                    value = Math.asin(Math.sin(osc.phase + couche.pulsePhase)) * (2 / Math.PI);
                    break;
                case 'interference':
                    value = Math.sin(osc.phase) * Math.cos(osc.phase * 1.618 + couche.pulsePhase);
                    break;
            }
            
            pulsation += value * osc.amplitude;
        }
        
        // Normalisation et ajustement
        return (pulsation * 0.5 + 0.5) * this.config.parameters.intensite.default;
    }

    updateInterferences(deltaTime) {
        for (let zone of this.interferenceZones) {
            zone.phase += deltaTime * 0.001 * zone.frequency;
        }
        
        // Calcul des interférences pour chaque couche
        for (let i = 0; i < this.couches.length; i++) {
            const couche = this.couches[i];
            const state = this.layerStates[i];
            
            let interference = 0;
            
            // Distance aux zones d'interférence
            for (let zone of this.interferenceZones) {
                const dx = (this.basePosition.x + couche.offsetX) - zone.centerX;
                const dy = (this.basePosition.y + couche.offsetY) - zone.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < zone.radius) {
                    const influence = (1 - distance / zone.radius) * zone.strength;
                    const waveValue = Math.sin(zone.phase + distance * 0.05);
                    
                    if (zone.type === 'constructive') {
                        interference += influence * waveValue;
                    } else {
                        interference -= influence * waveValue;
                    }
                }
            }
            
            state.interference = Math.max(-0.5, Math.min(0.5, interference));
        }
    }

    updateRevealPhase(deltaTime) {
        // Cycle de révélation progressive des détails
        const revealCycle = Math.sin(this.revealPhase) * 0.5 + 0.5;
        
        for (let i = 0; i < this.layerStates.length; i++) {
            const state = this.layerStates[i];
            const layerPhase = (i / this.layerStates.length + revealCycle) % 1;
            
            // Révélation en vagues avec des moments de "clarté totale"
            state.reveal = Math.pow(Math.sin(layerPhase * Math.PI), 2);
        }
    }

    calculateFinalOpacity(couche, state) {
        let opacity = couche.baseOpacity;
        
        // Application de la pulsation
        opacity *= (0.4 + 0.6 * state.pulsation);
        
        // Application des interférences
        opacity += state.interference * this.config.parameters.interferenceRate.default;
        
        // Application de la révélation
        opacity *= (0.3 + 0.7 * state.reveal);
        
        // Animation de profondeur globale
        const depthFactor = 1 + this.depthAnimation * 0.3 * (couche.depth / this.config.parameters.profondeurMax.default);
        opacity *= depthFactor;
        
        // Limitation des valeurs
        return Math.max(0.02, Math.min(0.95, opacity));
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Configuration de base
        ctx.font = `bold ${this.textMetrics.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Rendu des couches de la plus profonde à la plus proche
        for (let i = this.couches.length - 1; i >= 0; i--) {
            this.renderLayer(ctx, this.couches[i], this.layerStates[i]);
        }
        
        // Effet de post-processing pour unifier les couches
        this.renderUnificationEffect(ctx);
        
        ctx.restore();
    }

    renderLayer(ctx, couche, state) {
        ctx.save();
        
        // Configuration du mode de mélange
        ctx.globalCompositeOperation = couche.blendMode;
        
        // Calcul de la position finale
        const finalX = this.basePosition.x + couche.offsetX + state.dynamicOffset.x;
        const finalY = this.basePosition.y + couche.offsetY + state.dynamicOffset.y;
        
        // Application de la transformation
        ctx.translate(finalX, finalY);
        ctx.scale(couche.scale, couche.scale);
        
        // Configuration de l'opacité
        ctx.globalAlpha = couche.currentOpacity;
        
        // Configuration du flou si nécessaire
        if (couche.blur > 0) {
            ctx.shadowColor = couche.color;
            ctx.shadowBlur = couche.blur * state.pulsation;
        }
        
        // Couleur avec variation dynamique
        const colorIntensity = 0.7 + 0.3 * state.reveal;
        ctx.fillStyle = this.adjustColorIntensity(couche.color, colorIntensity);
        
        // Rendu du texte principal
        ctx.fillText(this.textMetrics.text, 0, 0);
        
        // Effet de contour pour certaines couches
        if (couche.index % 3 === 0 && state.reveal > 0.7) {
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.globalAlpha *= 0.5;
            ctx.strokeText(this.textMetrics.text, 0, 0);
        }
        
        // Effet de surbrillance pour la couche de surface
        if (couche.index === 0 && state.pulsation > 0.8) {
            ctx.globalAlpha = (state.pulsation - 0.8) * 0.3;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.textMetrics.text, 0, 0);
        }
        
        ctx.restore();
    }

    adjustColorIntensity(color, intensity) {
        // Extraction RGB et ajustement de l'intensité
        const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
        if (match) {
            const r = Math.floor(parseInt(match[1]) * intensity);
            const g = Math.floor(parseInt(match[2]) * intensity);
            const b = Math.floor(parseInt(match[3]) * intensity);
            return `rgb(${r}, ${g}, ${b})`;
        }
        return color;
    }

    renderUnificationEffect(ctx) {
        // Gradient radial subtil pour unifier visuellement les couches
        const centerX = this.basePosition.x;
        const centerY = this.basePosition.y;
        const radius = Math.max(this.textMetrics.width, this.textMetrics.height) * 0.8;
        
        const unificationIntensity = 0.05 + 0.05 * Math.sin(this.temps * 2);
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${unificationIntensity})`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${unificationIntensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;
        ctx.fillRect(this.element.x - 50, this.element.y - 50, 
                    this.element.width + 100, this.element.height + 100);
        
        // Effet de "respiration" globale
        const breatheIntensity = 0.02 * Math.sin(this.temps * 0.8);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = breatheIntensity;
        ctx.fillStyle = this.config.parameters.couleurProfondeur.default;
        ctx.fillRect(this.element.x, this.element.y, this.element.width, this.element.height);
    }

    destroy() {
        // Nettoyage des couches
        this.couches.length = 0;
        this.layerStates.length = 0;
        this.oscillateurs.length = 0;
        this.interferenceZones.length = 0;
        this.noiseSeeds.length = 0;
        
        // Nettoyage du cache
        this.gradientCache.clear();
        
        // Reset des variables
        this.textMetrics = null;
        this.temps = 0;
        this.cyclePhase = 0;
        this.interferencePhase = 0;
        this.revealPhase = 0;
        this.depthAnimation = 0;
        this.depthDirection = 1;
    }
}