class HologramEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'holographic-interference-025',
            name: 'Instabilité Holographique',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.5 },
                intensite: { type: 'range', min: 0.2, max: 1, default: 0.7 },
                couleurBase: { type: 'color', default: '#00ffff' },
                couleurInterference: { type: 'color', default: '#ff00ff' },
                frequenceScan: { type: 'range', min: 0.5, max: 3, default: 1.2 },
                instabilite: { type: 'range', min: 0.1, max: 1, default: 0.6 }
            }
        });
        
        // Variables privées de l'effet
        this.temps = 0;
        this.stabiliteProjection = 1.0;
        this.lignesScan = [];
        this.glitches = [];
        this.zonesResolution = [];
        this.interferenceMap = [];
        this.profondeurZ = 0;
        
        // Pattern d'interférence holographique
        this.interferencePattern = new Array(100).fill(0).map(() => Math.random());
        
        // Initialisation des systèmes
        this.initLignesScan();
        this.initGlitches();
        this.initZonesResolution();
    }
    
    initLignesScan() {
        // Pool de lignes de scan horizontales
        for (let i = 0; i < 25; i++) {
            this.lignesScan.push({
                y: Math.random() * 600,
                vitesse: Math.random() * 2 + 0.5,
                intensite: Math.random() * 0.8 + 0.2,
                epaisseur: Math.random() * 3 + 1,
                direction: Math.random() > 0.5 ? 1 : -1,
                cycle: Math.random() * Math.PI * 2,
                actif: Math.random() > 0.3
            });
        }
    }
    
    initGlitches() {
        // Pool de glitches de reconstruction
        for (let i = 0; i < 12; i++) {
            this.glitches.push({
                x: 0,
                y: 0,
                largeur: 0,
                hauteur: 0,
                decalageX: 0,
                decalageY: 0,
                duree: 0,
                maxDuree: 0,
                intensite: 1,
                type: Math.random() > 0.5 ? 'horizontal' : 'vertical',
                couleur: { r: 0, g: 255, b: 255 },
                actif: false
            });
        }
    }
    
    initZonesResolution() {
        // Zones de résolution variable qui migrent
        for (let i = 0; i < 8; i++) {
            this.zonesResolution.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                rayon: Math.random() * 80 + 40,
                resolution: Math.random() * 0.8 + 0.2, // 0.2 = basse, 1.0 = haute
                vitesseX: (Math.random() - 0.5) * 0.8,
                vitesseY: (Math.random() - 0.5) * 0.8,
                pulsation: Math.random() * Math.PI * 2,
                actif: true
            });
        }
    }
    
    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Calcul des dimensions du texte
        this.ctx.font = `${element.fontSize || 48}px Arial`;
        this.textMetrics = this.ctx.measureText(element.content || 'HOLOGRAM');
        this.textWidth = this.textMetrics.width;
        this.textHeight = element.fontSize || 48;
        
        // Position centrée
        this.textX = element.x || (canvas.width - this.textWidth) / 2;
        this.textY = element.y || canvas.height / 2;
        
        // Création de la carte d'interférence
        this.generateInterferenceMap();
    }
    
    generateInterferenceMap() {
        this.interferenceMap = [];
        const resolution = 50;
        
        for (let y = 0; y < resolution; y++) {
            this.interferenceMap[y] = [];
            for (let x = 0; x < resolution; x++) {
                // Pattern d'interférence basé sur des ondes sinusoïdales
                const wave1 = Math.sin(x * 0.3) * Math.sin(y * 0.2);
                const wave2 = Math.cos(x * 0.2) * Math.cos(y * 0.3);
                const wave3 = Math.sin(x * 0.1 + y * 0.1);
                
                this.interferenceMap[y][x] = (wave1 + wave2 + wave3) / 3;
            }
        }
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 255, b: 255};
    }
    
    updateStabiliteProjection(deltaTime) {
        // Simulation d'instabilité de projection holographique
        const baseFreq = 0.002 * this.parameters.vitesse.default;
        
        // Oscillations de stabilité avec perturbations
        const stabiliteBase = 0.8 + Math.sin(this.temps * baseFreq) * 0.15;
        const perturbation1 = Math.sin(this.temps * baseFreq * 2.3) * 0.08;
        const perturbation2 = Math.cos(this.temps * baseFreq * 1.7) * 0.05;
        
        this.stabiliteProjection = stabiliteBase + perturbation1 + perturbation2;
        
        // Glitches soudains d'instabilité (30% imprévisibilité)
        if (Math.random() < 0.004 * this.parameters.instabilite.default) {
            this.stabiliteProjection *= 0.3 + Math.random() * 0.4;
        }
        
        // Effet de profondeur Z oscillant
        this.profondeurZ = Math.sin(this.temps * baseFreq * 0.8) * 10 * this.parameters.intensite.default;
    }
    
    updateLignesScan(deltaTime) {
        this.lignesScan.forEach(ligne => {
            if (ligne.actif) {
                ligne.y += ligne.vitesse * ligne.direction * this.parameters.frequenceScan.default;
                ligne.cycle += deltaTime * 0.01;
                
                // Variation d'intensité sinusoïdale
                ligne.intensite = 0.3 + Math.sin(ligne.cycle) * 0.5;
                
                // Rebond aux bords
                if (ligne.y < 0 || ligne.y > 600) {
                    ligne.direction *= -1;
                    ligne.y = Math.max(0, Math.min(600, ligne.y));
                }
            }
            
            // Activation/désactivation aléatoire
            if (Math.random() < 0.002) {
                ligne.actif = !ligne.actif;
            }
        });
    }
    
    updateGlitches(deltaTime) {
        this.glitches.forEach(glitch => {
            if (!glitch.actif && Math.random() < 0.008 * this.parameters.instabilite.default) {
                // Activation d'un nouveau glitch
                glitch.x = this.textX + Math.random() * this.textWidth;
                glitch.y = this.textY - this.textHeight/2 + Math.random() * this.textHeight;
                glitch.largeur = Math.random() * 100 + 20;
                glitch.hauteur = Math.random() * 30 + 5;
                glitch.decalageX = (Math.random() - 0.5) * 15;
                glitch.decalageY = (Math.random() - 0.5) * 8;
                glitch.duree = 0;
                glitch.maxDuree = Math.random() * 150 + 50;
                glitch.intensite = Math.random() * 0.8 + 0.2;
                
                // Couleur d'interférence
                const couleurBase = this.hexToRgb(this.parameters.couleurInterference.default);
                glitch.couleur = {
                    r: couleurBase.r + (Math.random() - 0.5) * 100,
                    g: couleurBase.g + (Math.random() - 0.5) * 100,
                    b: couleurBase.b + (Math.random() - 0.5) * 100
                };
                
                glitch.actif = true;
            }
            
            if (glitch.actif) {
                glitch.duree += deltaTime;
                
                // Oscillation du décalage pendant le glitch
                glitch.decalageX += (Math.random() - 0.5) * 2;
                glitch.decalageY += (Math.random() - 0.5) * 1;
                
                if (glitch.duree >= glitch.maxDuree) {
                    glitch.actif = false;
                }
            }
        });
    }
    
    updateZonesResolution(deltaTime) {
        this.zonesResolution.forEach(zone => {
            // Mouvement des zones
            zone.x += zone.vitesseX;
            zone.y += zone.vitesseY;
            
            // Rebond aux bords
            if (zone.x < 0 || zone.x > 800) zone.vitesseX *= -1;
            if (zone.y < 0 || zone.y > 600) zone.vitesseY *= -1;
            
            // Pulsation de la résolution
            zone.pulsation += deltaTime * 0.003;
            zone.resolution = 0.5 + Math.sin(zone.pulsation) * 0.3;
            
            // Variation aléatoire du rayon
            if (Math.random() < 0.01) {
                zone.rayon += (Math.random() - 0.5) * 10;
                zone.rayon = Math.max(20, Math.min(120, zone.rayon));
            }
        });
    }
    
    drawHologramBase(ctx) {
        const couleurBase = this.hexToRgb(this.parameters.couleurBase.default);
        const intensiteGlobale = this.stabiliteProjection * this.parameters.intensite.default;
        
        ctx.save();
        ctx.font = `${this.textHeight}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Effet de profondeur Z
        ctx.translate(this.profondeurZ * 0.5, this.profondeurZ * 0.3);
        
        // Couches multiples pour effet holographique
        const layers = [
            { offset: { x: -2, y: -1 }, alpha: 0.15, couleur: { r: 255, g: 0, b: 100 } },
            { offset: { x: 2, y: 1 }, alpha: 0.15, couleur: { r: 0, g: 255, b: 100 } },
            { offset: { x: 0, y: 0 }, alpha: 0.8, couleur: couleurBase }
        ];
        
        layers.forEach(layer => {
            ctx.fillStyle = `rgba(${layer.couleur.r}, ${layer.couleur.g}, ${layer.couleur.b}, ${layer.alpha * intensiteGlobale})`;
            ctx.shadowColor = `rgba(${layer.couleur.r}, ${layer.couleur.g}, ${layer.couleur.b}, ${layer.alpha * 0.5})`;
            ctx.shadowBlur = 8;
            
            ctx.fillText(
                this.element.content || 'HOLOGRAM',
                this.textX + layer.offset.x,
                this.textY + layer.offset.y
            );
        });
        
        ctx.restore();
    }
    
    drawLignesScan(ctx) {
        ctx.save();
        
        this.lignesScan.forEach(ligne => {
            if (!ligne.actif) return;
            
            const gradient = ctx.createLinearGradient(0, ligne.y, 800, ligne.y);
            gradient.addColorStop(0, `rgba(0, 255, 255, 0)`);
            gradient.addColorStop(0.5, `rgba(0, 255, 255, ${ligne.intensite * 0.3})`);
            gradient.addColorStop(1, `rgba(0, 255, 255, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, ligne.y - ligne.epaisseur/2, 800, ligne.epaisseur);
        });
        
        ctx.restore();
    }
    
    drawInterferencePattern(ctx) {
        ctx.save();
        
        const imageData = ctx.createImageData(800, 600);
        const data = imageData.data;
        
        for (let y = 0; y < 600; y += 4) {
            for (let x = 0; x < 800; x += 4) {
                const mapX = Math.floor((x / 800) * 50);
                const mapY = Math.floor((y / 600) * 50);
                const interferenceValue = this.interferenceMap[mapY] ? this.interferenceMap[mapY][mapX] || 0 : 0;
                
                // Animation des interférences
                const animatedValue = interferenceValue * Math.sin(this.temps * 0.005 + x * 0.01 + y * 0.01);
                const intensity = Math.abs(animatedValue) * 30 * this.parameters.intensite.default;
                
                const index = (y * 800 + x) * 4;
                if (index < data.length) {
                    data[index] = intensity;     // R
                    data[index + 1] = intensity * 0.8; // G
                    data[index + 2] = intensity * 1.2; // B
                    data[index + 3] = intensity * 0.1; // A
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
    }
    
    drawGlitches(ctx) {
        ctx.save();
        
        this.glitches.forEach(glitch => {
            if (!glitch.actif) return;
            
            const progression = glitch.duree / glitch.maxDuree;
            const intensiteGlitch = Math.sin(progression * Math.PI) * glitch.intensite;
            
            // Rectangle de glitch avec décalage
            ctx.fillStyle = `rgba(${glitch.couleur.r}, ${glitch.couleur.g}, ${glitch.couleur.b}, ${intensiteGlitch * 0.3})`;
            ctx.fillRect(
                glitch.x + glitch.decalageX,
                glitch.y + glitch.decalageY,
                glitch.largeur,
                glitch.hauteur
            );
            
            // Lignes de reconstruction
            ctx.strokeStyle = `rgba(${glitch.couleur.r}, ${glitch.couleur.g}, ${glitch.couleur.b}, ${intensiteGlitch})`;
            ctx.lineWidth = 1;
            
            if (glitch.type === 'horizontal') {
                for (let i = 0; i < 3; i++) {
                    const y = glitch.y + (i * glitch.hauteur / 3);
                    ctx.beginPath();
                    ctx.moveTo(glitch.x, y);
                    ctx.lineTo(glitch.x + glitch.largeur, y);
                    ctx.stroke();
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    const x = glitch.x + (i * glitch.largeur / 3);
                    ctx.beginPath();
                    ctx.moveTo(x, glitch.y);
                    ctx.lineTo(x, glitch.y + glitch.hauteur);
                    ctx.stroke();
                }
            }
        });
        
        ctx.restore();
    }
    
    drawZonesResolution(ctx) {
        ctx.save();
        
        // Masque de résolution variable
        this.zonesResolution.forEach(zone => {
            const gradient = ctx.createRadialGradient(
                zone.x, zone.y, 0,
                zone.x, zone.y, zone.rayon
            );
            
            const intensiteZone = zone.resolution * 0.2;
            gradient.addColorStop(0, `rgba(255, 255, 255, ${intensiteZone})`);
            gradient.addColorStop(0.7, `rgba(255, 255, 255, ${intensiteZone * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.globalCompositeOperation = 'multiply';
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.rayon, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    render(ctx, element, deltaTime) {
        // Mise à jour des systèmes
        this.updateStabiliteProjection(deltaTime);
        this.updateLignesScan(deltaTime);
        this.updateGlitches(deltaTime);
        this.updateZonesResolution(deltaTime);
        
        // Rendu des couches
        this.drawInterferencePattern(ctx);  // Pattern d'interférence en arrière-plan
        this.drawHologramBase(ctx);         // Texte holographique de base
        this.drawLignesScan(ctx);           // Lignes de scan horizontales
        this.drawGlitches(ctx);             // Glitches de reconstruction
        this.drawZonesResolution(ctx);      // Zones de résolution variable
    }
    
    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.default;
        
        // Régénération périodique de la carte d'interférence
        if (this.temps % 2000 < deltaTime) {
            this.generateInterferenceMap();
        }
    }
    
    destroy() {
        // Nettoyage mémoire
        this.lignesScan = null;
        this.glitches = null;
        this.zonesResolution = null;
        this.interferenceMap = null;
        this.interferencePattern = null;
        this.ctx = null;
        this.canvas = null;
        this.element = null;
    }
}