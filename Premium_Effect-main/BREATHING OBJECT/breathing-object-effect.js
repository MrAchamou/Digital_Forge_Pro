class BreathingObjectEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'organic-life-respiration-041',
            name: 'Respiration Organique Vivante',
            category: 'image',
            version: '1.0',
            performance: 'low',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.6 },
                amplitude: { type: 'range', min: 0.05, max: 0.3, default: 0.15 },
                rythme: { type: 'range', min: 0.5, max: 2, default: 1 },
                circulation: { type: 'range', min: 0, max: 1, default: 0.7 },
                stress: { type: 'range', min: 0, max: 1, default: 0.3 }
            }
        });

        // Système de respiration physiologique
        this.temps = 0;
        this.phaseRespiration = 'inspiration'; // inspiration, expiration, pause
        this.cycleRespiration = 0; // Position dans le cycle (0-1)
        this.dureeInspiration = 4000; // 4 secondes
        this.dureeExpiration = 6000;  // 6 secondes
        this.dureePause = 1000;       // 1 seconde de pause
        
        // Variables physiologiques
        this.frequenceCardiaque = 72; // BPM
        this.variabilite = 0;         // Variabilité du rythme
        this.niveauStress = 0.3;      // Niveau de stress actuel
        this.profondeurRespiration = 1; // Profondeur de la respiration
        
        // Système de déformation organique
        this.pointsDeformation = [];
        this.nombrePoints = 16; // Points de contrôle pour déformation
        this.rayonInfluence = 100;
        
        // Pulsation chromatique et circulation
        this.pulsationChromatique = 0;
        this.intensiteCouleur = 0;
        this.teinteSanguine = { r: 220, g: 100, b: 100 };
        this.teinteOxygenee = { r: 255, g: 160, b: 160 };
        
        // Canvas pour effets complexes
        this.canvasDeformation = null;
        this.ctxDeformation = null;
        this.canvasCirculation = null;
        this.ctxCirculation = null;
        
        // Micro-variations organiques
        this.microVibrations = [];
        this.tensionMusculaire = 0;
        
        // Système de pauses dramatiques
        this.pauseActive = false;
        this.prochainePause = 15000; // Première pause dans 15s
        this.dureePauseActuelle = 0;
        
        // Mémoire des cycles précédents pour adaptation
        this.historiqueCycles = [];
        this.adaptationRythme = 0;
    }

    initialize(canvas, element) {
        // Canvas pour déformations organiques
        this.canvasDeformation = document.createElement('canvas');
        this.canvasDeformation.width = canvas.width;
        this.canvasDeformation.height = canvas.height;
        this.ctxDeformation = this.canvasDeformation.getContext('2d');
        
        // Canvas pour circulation sanguine
        this.canvasCirculation = document.createElement('canvas');
        this.canvasCirculation.width = canvas.width;
        this.canvasCirculation.height = canvas.height;
        this.ctxCirculation = this.canvasCirculation.getContext('2d');
        
        // Initialisation des points de déformation
        this.initPointsDeformation(element);
        
        // Initialisation des micro-vibrations
        this.initMicroVibrations();
        
        // Ajustement du rythme selon l'élément
        this.ajusterRythmeInitial(element);
    }

    initPointsDeformation(element) {
        this.pointsDeformation = [];
        const centreX = element.x + element.width / 2;
        const centreY = element.y + element.height / 2;
        
        for (let i = 0; i < this.nombrePoints; i++) {
            const angle = (i / this.nombrePoints) * Math.PI * 2;
            const rayon = Math.max(element.width, element.height) * 0.6;
            
            this.pointsDeformation.push({
                x: centreX + Math.cos(angle) * rayon,
                y: centreY + Math.sin(angle) * rayon,
                angle: angle,
                rayonBase: rayon,
                intensite: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                vitessePhase: 0.8 + Math.random() * 0.4
            });
        }
    }

    initMicroVibrations() {
        this.microVibrations = [];
        for (let i = 0; i < 8; i++) {
            this.microVibrations.push({
                amplitude: 0.5 + Math.random() * 1.5,
                frequence: 0.02 + Math.random() * 0.08,
                phase: Math.random() * Math.PI * 2,
                actif: true
            });
        }
    }

    ajusterRythmeInitial(element) {
        // Ajustement du rythme selon la taille (plus grand = plus lent)
        const taille = Math.sqrt(element.width * element.height);
        const facteurTaille = Math.max(0.7, Math.min(1.3, taille / 200));
        
        this.dureeInspiration *= facteurTaille;
        this.dureeExpiration *= facteurTaille;
        this.dureePause *= facteurTaille;
    }

    // Noise organique pour variations
    noise(x, y = 0, z = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return (n - Math.floor(n));
    }

    // Fonction d'easing pour respiration naturelle
    easingRespiration(t, type) {
        switch(type) {
            case 'inspiration':
                // Inspiration plus rapide au début, ralentit
                return 1 - Math.pow(1 - t, 3);
            case 'expiration':
                // Expiration douce et régulière
                return Math.sin(t * Math.PI * 0.5);
            case 'pause':
                // Plateau stable avec micro-variations
                return 1 + Math.sin(t * Math.PI * 4) * 0.02;
            default:
                return t;
        }
    }

    update(deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.value;
        
        // Mise à jour du niveau de stress
        this.updateNiveauStress(deltaTime);
        
        // Mise à jour du cycle respiratoire
        this.updateCycleRespiration(deltaTime);
        
        // Mise à jour des déformations organiques
        this.updateDeformationsOrganiques(deltaTime);
        
        // Mise à jour de la circulation chromatique
        this.updateCirculationChromatique(deltaTime);
        
        // Mise à jour des micro-vibrations
        this.updateMicroVibrations(deltaTime);
        
        // Gestion des pauses dramatiques
        this.updatePausesDramatiques(deltaTime);
        
        // Adaptation du rythme basée sur l'historique
        this.updateAdaptationRythme();
    }

    updateNiveauStress(deltaTime) {
        // Évolution du stress avec variations organiques
        const stressBase = this.parameters.stress.value;
        const variationStress = Math.sin(this.temps * 0.0003) * 0.2;
        
        // Événements de stress aléatoires
        if (Math.random() < 0.0001 * deltaTime) {
            this.niveauStress += (Math.random() - 0.5) * 0.3;
        }
        
        // Retour progressif vers le niveau de base
        const targetStress = stressBase + variationStress;
        this.niveauStress += (targetStress - this.niveauStress) * deltaTime * 0.001;
        this.niveauStress = Math.max(0, Math.min(1, this.niveauStress));
        
        // Ajustement des durées selon le stress
        const facteurStress = 1 + this.niveauStress * 0.5;
        this.frequenceCardiaque = 72 + this.niveauStress * 28; // 72-100 BPM
    }

    updateCycleRespiration(deltaTime) {
        const facteurRythme = this.parameters.rythme.value;
        const deltaAjuste = deltaTime * facteurRythme;
        
        // Ajustement des durées selon le stress
        const facteurStress = 1 - this.niveauStress * 0.3;
        const inspirationAjustee = this.dureeInspiration * facteurStress;
        const expirationAjustee = this.dureeExpiration * facteurStress;
        
        if (this.pauseActive) {
            this.dureePauseActuelle += deltaAjuste;
            this.cycleRespiration = 1; // Maintenir position haute
            
            if (this.dureePauseActuelle >= this.dureePause * (2 + this.niveauStress)) {
                this.pauseActive = false;
                this.dureePauseActuelle = 0;
                this.phaseRespiration = 'expiration';
                this.cycleRespiration = 0;
                
                // Programmer la prochaine pause
                this.prochainePause = this.temps + 20000 + Math.random() * 15000;
            }
            return;
        }
        
        if (this.phaseRespiration === 'inspiration') {
            this.cycleRespiration += deltaAjuste / inspirationAjustee;
            
            if (this.cycleRespiration >= 1) {
                this.cycleRespiration = 1;
                this.phaseRespiration = 'expiration';
                
                // Enregistrer le cycle pour adaptation
                this.historiqueCycles.push({
                    duree: inspirationAjustee,
                    profondeur: this.profondeurRespiration,
                    stress: this.niveauStress
                });
                
                if (this.historiqueCycles.length > 10) {
                    this.historiqueCycles.shift();
                }
            }
        } else if (this.phaseRespiration === 'expiration') {
            this.cycleRespiration -= deltaAjuste / expirationAjustee;
            
            if (this.cycleRespiration <= 0) {
                this.cycleRespiration = 0;
                this.phaseRespiration = 'inspiration';
            }
        }
        
        // Calcul de la profondeur avec easing naturel
        const easedCycle = this.easingRespiration(this.cycleRespiration, this.phaseRespiration);
        this.profondeurRespiration = easedCycle * this.parameters.amplitude.value;
        
        // Ajout de variabilité naturelle
        const variabilite = this.noise(this.temps * 0.001) * 0.1;
        this.profondeurRespiration += variabilite * this.parameters.amplitude.value;
    }

    updateDeformationsOrganiques(deltaTime) {
        this.pointsDeformation.forEach(point => {
            // Mise à jour de la phase individuelle
            point.phase += deltaTime * point.vitessePhase * 0.001;
            
            // Déformation basée sur la respiration
            const deformationRespiration = this.profondeurRespiration * point.intensite;
            
            // Déformation cardiaque (plus rapide)
            const pulsationCardiaque = Math.sin(this.temps * 0.001 * this.frequenceCardiaque / 60 * Math.PI * 2);
            const deformationCardiaque = pulsationCardiaque * 0.05 * this.parameters.circulation.value;
            
            // Déformation organique complexe
            const deformationOrganique = Math.sin(point.phase) * 0.02;
            
            // Déformation totale
            const deformationTotale = deformationRespiration + deformationCardiaque + deformationOrganique;
            
            // Application de la tension musculaire
            this.tensionMusculaire = this.niveauStress * 0.1;
            const facteurTension = 1 + this.tensionMusculaire;
            
            point.rayonActuel = point.rayonBase * (1 + deformationTotale * facteurTension);
        });
    }

    updateCirculationChromatique(deltaTime) {
        // Pulsation synchronisée avec le rythme cardiaque
        const pulsationCardiaque = Math.sin(this.temps * 0.001 * this.frequenceCardiaque / 60 * Math.PI * 2);
        this.pulsationChromatique = (pulsationCardiaque + 1) * 0.5; // 0-1
        
        // Intensité basée sur la respiration (oxygénation)
        const oxygenation = this.profondeurRespiration * 0.7 + 0.3;
        this.intensiteCouleur = oxygenation * this.parameters.circulation.value;
        
        // Interpolation entre teintes selon l'oxygénation
        const facteurOxygene = Math.max(0, Math.min(1, oxygenation));
        this.teinteCourante = {
            r: this.teinteSanguine.r + (this.teinteOxygenee.r - this.teinteSanguine.r) * facteurOxygene,
            g: this.teinteSanguine.g + (this.teinteOxygenee.g - this.teinteSanguine.g) * facteurOxygene,
            b: this.teinteSanguine.b + (this.teinteOxygenee.b - this.teinteSanguine.b) * facteurOxygene
        };
    }

    updateMicroVibrations(deltaTime) {
        this.microVibrations.forEach(vibration => {
            vibration.phase += deltaTime * vibration.frequence;
            
            // Modulation par le stress
            vibration.amplitudeActuelle = vibration.amplitude * (1 + this.niveauStress * 2);
            
            // Désactivation aléatoire pour effet naturel
            if (Math.random() < 0.001 * deltaTime) {
                vibration.actif = !vibration.actif;
            }
        });
    }

    updatePausesDramatiques(deltaTime) {
        // Vérification si c'est le moment d'une pause
        if (!this.pauseActive && this.temps >= this.prochainePause) {
            // Conditions pour déclencher une pause
            const probabilitePause = 0.3 + this.niveauStress * 0.4;
            
            if (Math.random() < probabilitePause && this.phaseRespiration === 'inspiration' && this.cycleRespiration > 0.8) {
                this.pauseActive = true;
                this.dureePauseActuelle = 0;
                this.phaseRespiration = 'pause';
            } else {
                // Reporter la pause
                this.prochainePause = this.temps + 5000 + Math.random() * 10000;
            }
        }
    }

    updateAdaptationRythme() {
        if (this.historiqueCycles.length < 3) return;
        
        // Analyse de l'historique pour adaptation
        const moyenneStress = this.historiqueCycles.reduce((sum, cycle) => sum + cycle.stress, 0) / this.historiqueCycles.length;
        
        // Adaptation progressive du rythme
        this.adaptationRythme = moyenneStress * 0.2;
    }

    render(ctx, element, deltaTime) {
        const { width, height } = ctx.canvas;
        
        ctx.save();
        
        // Nettoyage des canvas temporaires
        this.ctxDeformation.clearRect(0, 0, width, height);
        this.ctxCirculation.clearRect(0, 0, width, height);
        
        // Calcul des transformations de respiration
        const scaleRespiration = 1 + this.profondeurRespiration;
        const centreX = element.x + element.width / 2;
        const centreY = element.y + element.height / 2;
        
        // Application des micro-vibrations
        let offsetX = 0, offsetY = 0;
        this.microVibrations.forEach(vibration => {
            if (!vibration.actif) return;
            offsetX += Math.sin(vibration.phase) * vibration.amplitudeActuelle;
            offsetY += Math.cos(vibration.phase * 1.3) * vibration.amplitudeActuelle;
        });
        
        // Rendu de l'effet de circulation sanguine
        this.renderCirculationSanguine(ctx, element, centreX, centreY);
        
        // Rendu de l'élément avec déformations organiques
        this.renderElementAvecDeformations(ctx, element, scaleRespiration, offsetX, offsetY);
        
        // Rendu des effets de surface (micro-pulsations)
        this.renderEffetsSurface(ctx, element, centreX, centreY);
        
        // Indication visuelle de la phase respiratoire (subtile)
        this.renderIndicationPhase(ctx, centreX, centreY);
        
        ctx.restore();
    }

    renderCirculationSanguine(ctx, element, centreX, centreY) {
        if (this.parameters.circulation.value < 0.1) return;
        
        ctx.save();
        
        // Effet de circulation avec pulsation
        const intensiteCirculation = this.intensiteCouleur * this.pulsationChromatique;
        
        if (intensiteCirculation > 0.05) {
            // Dégradé radial pulsant
            const rayonCirculation = Math.max(element.width, element.height) * 0.7;
            const gradient = ctx.createRadialGradient(
                centreX, centreY, 0,
                centreX, centreY, rayonCirculation
            );
            
            const alpha = intensiteCirculation * 0.15;
            const couleur = this.teinteCourante;
            
            gradient.addColorStop(0, `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`);
            gradient.addColorStop(0.6, `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centreX, centreY, rayonCirculation, 0, Math.PI * 2);
            ctx.fill();
            
            // Pulsations de surface
            for (let i = 0; i < 3; i++) {
                const rayonPulsation = rayonCirculation * (0.3 + i * 0.2) * (1 + this.pulsationChromatique * 0.1);
                const alphaPulsation = alpha * (1 - i * 0.3) * this.pulsationChromatique;
                
                if (alphaPulsation > 0.02) {
                    ctx.strokeStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alphaPulsation})`;
                    ctx.lineWidth = 1 + i;
                    ctx.beginPath();
                    ctx.arc(centreX, centreY, rayonPulsation, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }

    renderElementAvecDeformations(ctx, element, scaleRespiration, offsetX, offsetY) {
        ctx.save();
        
        // Translation vers le centre avec micro-vibrations
        ctx.translate(
            element.x + element.width / 2 + offsetX,
            element.y + element.height / 2 + offsetY
        );
        
        // Rotation de base
        ctx.rotate(element.rotation);
        
        // Échelle de respiration avec déformations organiques
        const scaleX = scaleRespiration;
        const scaleY = scaleRespiration * (1 + Math.sin(this.temps * 0.002) * 0.02);
        ctx.scale(scaleX, scaleY);
        
        // Application de l'opacité avec variations physiologiques
        const opaciteBase = element.opacity;
        const variationOpacite = Math.sin(this.frequenceCardiaque / 60 * this.temps * 0.001 * Math.PI * 2) * 0.05;
        ctx.globalAlpha = opaciteBase * (1 + variationOpacite * this.parameters.circulation.value);
        
        // Rendu du contenu
        if (element.content) {
            if (typeof element.content === 'string') {
                // Effet de "souffle" sur le texte
                const souffleIntensity = this.profondeurRespiration * 0.1;
                ctx.shadowColor = `rgba(255, 255, 255, ${souffleIntensity})`;
                ctx.shadowBlur = 10 * souffleIntensity;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(element.content, 0, 0);
            }
        }
        
        ctx.restore();
    }

    renderEffetsSurface(ctx, element, centreX, centreY) {
        if (this.parameters.intensite.value < 0.3) return;
        
        ctx.save();
        
        // Micro-pulsations de surface
        const nombrePulsations = Math.floor(4 + this.niveauStress * 6);
        
        for (let i = 0; i < nombrePulsations; i++) {
            const angle = (i / nombrePulsations) * Math.PI * 2 + this.temps * 0.001;
            const rayon = Math.max(element.width, element.height) * (0.3 + Math.random() * 0.4);
            
            const x = centreX + Math.cos(angle) * rayon;
            const y = centreY + Math.sin(angle) * rayon;
            
            const pulsation = Math.sin(this.temps * 0.003 + i) * 0.5 + 0.5;
            const alpha = pulsation * this.parameters.intensite.value * 0.1;
            
            if (alpha > 0.02) {
                const gradientMicro = ctx.createRadialGradient(x, y, 0, x, y, 15);
                gradientMicro.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                gradientMicro.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = gradientMicro;
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    renderIndicationPhase(ctx, centreX, centreY) {
        if (this.parameters.intensite.value < 0.7) return;
        
        ctx.save();
        
        // Indication subtile de la phase respiratoire
        let couleurPhase, intensitePhase;
        
        switch(this.phaseRespiration) {
            case 'inspiration':
                couleurPhase = 'rgba(100, 200, 255, ';
                intensitePhase = this.cycleRespiration * 0.1;
                break;
            case 'expiration':
                couleurPhase = 'rgba(255, 150, 100, ';
                intensitePhase = (1 - this.cycleRespiration) * 0.1;
                break;
            case 'pause':
                couleurPhase = 'rgba(255, 255, 100, ';
                intensitePhase = (Math.sin(this.temps * 0.01) * 0.5 + 0.5) * 0.15;
                break;
            default:
                intensitePhase = 0;
        }
        
        if (intensitePhase > 0.02) {
            // Halo très subtil indiquant la phase
            const rayonPhase = Math.max(element.width, element.height) * 1.2;
            const gradientPhase = ctx.createRadialGradient(
                centreX, centreY, rayonPhase * 0.8,
                centreX, centreY, rayonPhase
            );
            
            gradientPhase.addColorStop(0, couleurPhase + '0)');
            gradientPhase.addColorStop(1, couleurPhase + intensitePhase + ')');
            
            ctx.fillStyle = gradientPhase;
            ctx.beginPath();
            ctx.arc(centreX, centreY, rayonPhase, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    destroy() {
        this.pointsDeformation = [];
        this.microVibrations = [];
        this.historiqueCycles = [];
        
        if (this.canvasDeformation) {
            this.canvasDeformation = null;
            this.ctxDeformation = null;
        }
        
        if (this.canvasCirculation) {
            this.canvasCirculation = null;
            this.ctxCirculation = null;
        }
    }
}