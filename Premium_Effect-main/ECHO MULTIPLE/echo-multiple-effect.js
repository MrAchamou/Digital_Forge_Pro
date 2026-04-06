class EchoMultipleEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'temporal-echo-multiplication-059',
            name: 'Multiplication Échos Temporels',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                nombreEchos: { type: 'range', min: 3, max: 15, default: 8 },
                decalageTemporel: { type: 'range', min: 0.1, max: 3.0, default: 1.2 },
                intensiteInteraction: { type: 'range', min: 0.0, max: 1.0, default: 0.7 },
                vitesseConvergence: { type: 'range', min: 0.2, max: 2.5, default: 1.0 },
                distorsionTemporelle: { type: 'range', min: 0.1, max: 2.0, default: 0.8 },
                couleurEcho: { type: 'color', default: '#00ffff' }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.echos = [];
        this.paradoxesVisuels = [];
        this.convergences = [];
        this.divergences = [];
        this.lignestemporelles = [];
        this.phaseGlobale = 0;
        
        // Pool d'objets pour optimisation
        this.particulesInteraction = [];
        this.maxParticules = 200;
        
        // États temporels
        this.modeTemporel = 'normal'; // normal, convergence, divergence, paradoxe
        this.intensiteDistorsion = 0;
        this.chronoSeed = Math.random() * 1000;
        
        // Configuration temporelle
        this.vitessesTemporelles = [];
        this.phasesTemporelles = [];
        this.decalagesInitiaux = [];
        
        this.initEchosTemporels();
        this.initLignesTemporelles();
        this.initParadoxesVisuels();
    }

    initEchosTemporels() {
        this.echos = [];
        const nombreEchos = this.config.parameters.nombreEchos.default;
        
        for (let i = 0; i < nombreEchos; i++) {
            const echo = {
                id: i,
                x: 0, y: 0, // Position sera copiée de l'élément
                width: 0, height: 0,
                alpha: 1 - (i / nombreEchos) * 0.8,
                vitesseTemporelle: 0.5 + (i * 0.3) + Math.random() * 0.4,
                phaseTemporelle: i * (Math.PI * 2 / nombreEchos),
                decalageTemporel: i * this.config.parameters.decalageTemporel.default * 100,
                couleurShift: i * 30, // Décalage de teinte
                distorsion: {
                    x: 0, y: 0, rotation: 0, scale: 1,
                    offset: Math.random() * Math.PI * 2
                },
                historique: [], // Stockage des positions précédentes
                maxHistorique: 60,
                etatTemporal: 'actif', // actif, convergent, divergent, fantome
                intensiteExistence: 1,
                interactionAvecAutres: [],
                ligneTemporelle: i
            };
            
            this.echos.push(echo);
            this.vitessesTemporelles.push(echo.vitesseTemporelle);
            this.phasesTemporelles.push(echo.phaseTemporelle);
            this.decalagesInitiaux.push(echo.decalageTemporel);
        }
    }

    initLignesTemporelles() {
        this.lignestemporelles = [];
        const nombreLignes = Math.ceil(this.echos.length / 2);
        
        for (let i = 0; i < nombreLignes; i++) {
            this.lignestemporelles.push({
                id: i,
                echosAssocies: [],
                vitessePropagation: 0.8 + Math.random() * 0.4,
                couleurLigne: `hsl(${180 + i * 60}, 70%, 50%)`,
                intensite: 0.3 + Math.random() * 0.4,
                noeudsTemporels: [],
                etatLigne: 'stable' // stable, convergente, divergente, chaotique
            });
        }
        
        // Attribution des échos aux lignes temporelles
        this.echos.forEach((echo, index) => {
            const ligneIndex = index % nombreLignes;
            this.lignestemporelles[ligneIndex].echosAssocies.push(echo.id);
            echo.ligneTemporelle = ligneIndex;
        });
    }

    initParadoxesVisuels() {
        this.paradoxesVisuels = [];
        
        // Initialisation du pool de particules d'interaction
        this.particulesInteraction = [];
        for (let i = 0; i < this.maxParticules; i++) {
            this.particulesInteraction.push({
                x: 0, y: 0, vx: 0, vy: 0,
                taille: 1, alpha: 1, couleur: '#ffffff',
                actif: false, vie: 0, vieMax: 0,
                typeInteraction: 'normal', // normal, paradoxe, convergence, divergence
                echoSource: -1, echoCible: -1,
                intensiteTemporelle: 1
            });
        }
    }

    obtenirParticuleDuPool() {
        for (let particule of this.particulesInteraction) {
            if (!particule.actif) {
                particule.actif = true;
                return particule;
            }
        }
        return null;
    }

    calculerPositionTemporelle(echo, temps) {
        const tempsAjuste = temps * echo.vitesseTemporelle - echo.decalageTemporel;
        const phase = echo.phaseTemporelle + tempsAjuste * 0.001;
        
        // Distorsion temporelle
        const distorsionX = Math.sin(phase + echo.distorsion.offset) * 
                           this.config.parameters.distorsionTemporelle.default * 15;
        const distorsionY = Math.cos(phase * 1.1 + echo.distorsion.offset) * 
                           this.config.parameters.distorsionTemporelle.default * 10;
        const rotation = Math.sin(phase * 0.7) * 0.1;
        const scale = 1 + Math.sin(phase * 0.5) * 0.1;
        
        return {
            x: distorsionX,
            y: distorsionY,
            rotation: rotation,
            scale: scale,
            phase: phase
        };
    }

    detecterInteractionsEchos() {
        const seuil = 50; // Distance minimum pour interaction
        
        for (let i = 0; i < this.echos.length; i++) {
            for (let j = i + 1; j < this.echos.length; j++) {
                const echo1 = this.echos[i];
                const echo2 = this.echos[j];
                
                const dx = echo1.x - echo2.x;
                const dy = echo1.y - echo2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < seuil) {
                    this.creerInteractionTemporelle(echo1, echo2, distance);
                }
            }
        }
    }

    creerInteractionTemporelle(echo1, echo2, distance) {
        const particule = this.obtenirParticuleDuPool();
        if (!particule) return;
        
        const intensite = 1 - (distance / 50);
        const typeInteraction = this.determinerTypeInteraction(echo1, echo2);
        
        particule.x = (echo1.x + echo2.x) / 2;
        particule.y = (echo1.y + echo2.y) / 2;
        particule.vx = (Math.random() - 0.5) * 2;
        particule.vy = (Math.random() - 0.5) * 2;
        particule.taille = 2 + intensite * 4;
        particule.alpha = 0.8;
        particule.vie = 0;
        particule.vieMax = 30 + Math.random() * 60;
        particule.typeInteraction = typeInteraction;
        particule.echoSource = echo1.id;
        particule.echoCible = echo2.id;
        particule.intensiteTemporelle = intensite;
        
        // Couleur basée sur le type d'interaction
        switch (typeInteraction) {
            case 'convergence':
                particule.couleur = '#00ff88';
                break;
            case 'divergence':
                particule.couleur = '#ff4444';
                break;
            case 'paradoxe':
                particule.couleur = '#ff00ff';
                break;
            default:
                particule.couleur = '#88ccff';
        }
    }

    determinerTypeInteraction(echo1, echo2) {
        const diffVitesse = Math.abs(echo1.vitesseTemporelle - echo2.vitesseTemporelle);
        const diffPhase = Math.abs(echo1.phaseTemporelle - echo2.phaseTemporelle);
        
        if (diffVitesse < 0.2 && diffPhase < 0.5) {
            return 'convergence';
        } else if (diffVitesse > 0.8) {
            return 'divergence';
        } else if (echo1.ligneTemporelle === echo2.ligneTemporelle) {
            return 'paradoxe';
        }
        
        return 'normal';
    }

    mettreAJourModeTemporel() {
        // Analyse des interactions pour déterminer le mode global
        let convergences = 0;
        let divergences = 0;
        let paradoxes = 0;
        
        for (let particule of this.particulesInteraction) {
            if (!particule.actif) continue;
            
            switch (particule.typeInteraction) {
                case 'convergence': convergences++; break;
                case 'divergence': divergences++; break;
                case 'paradoxe': paradoxes++; break;
            }
        }
        
        const total = convergences + divergences + paradoxes;
        if (total === 0) {
            this.modeTemporel = 'normal';
        } else if (convergences > divergences && convergences > paradoxes) {
            this.modeTemporel = 'convergence';
        } else if (divergences > convergences && divergences > paradoxes) {
            this.modeTemporel = 'divergence';
        } else {
            this.modeTemporel = 'paradoxe';
        }
    }

    genererParadoxeVisuel(x, y) {
        const paradoxe = {
            x: x, y: y,
            rayon: 20 + Math.random() * 40,
            intensite: 0.5 + Math.random() * 0.5,
            rotation: 0,
            vitesseRotation: (Math.random() - 0.5) * 0.1,
            couleurs: [
                '#ff0066', '#00ff66', '#6600ff',
                '#ff6600', '#00ffff', '#ffff00'
            ],
            vie: 0,
            vieMax: 120 + Math.random() * 180,
            typeParadoxe: Math.random() > 0.5 ? 'temporel' : 'spatial'
        };
        
        this.paradoxesVisuels.push(paradoxe);
    }

    calculerInfluenceConvergence() {
        // Force de convergence basée sur la synchronisation des échos
        let synchronisation = 0;
        const vitesseMoyenne = this.vitessesTemporelles.reduce((a, b) => a + b, 0) / this.vitessesTemporelles.length;
        
        for (let vitesse of this.vitessesTemporelles) {
            synchronisation += 1 - Math.abs(vitesse - vitesseMoyenne);
        }
        
        return synchronisation / this.vitessesTemporelles.length;
    }

    dessinerLignesTemporelles(ctx) {
        ctx.save();
        
        for (let ligne of this.lignestemporelles) {
            if (ligne.echosAssocies.length < 2) continue;
            
            ctx.strokeStyle = ligne.couleurLigne + '44';
            ctx.lineWidth = 1 + ligne.intensite * 2;
            ctx.setLineDash([5, 10]);
            ctx.lineDashOffset = this.temps * 0.1;
            
            ctx.beginPath();
            let premierPoint = true;
            
            for (let echoId of ligne.echosAssocies) {
                const echo = this.echos[echoId];
                if (premierPoint) {
                    ctx.moveTo(echo.x + echo.width/2, echo.y + echo.height/2);
                    premierPoint = false;
                } else {
                    ctx.lineTo(echo.x + echo.width/2, echo.y + echo.height/2);
                }
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }

    dessinerEcho(ctx, echo, element, facteurTemps) {
        if (echo.intensiteExistence <= 0.01) return;
        
        const position = this.calculerPositionTemporelle(echo, this.temps * facteurTemps);
        
        // Mise à jour de la position de l'écho
        echo.x = element.x + position.x;
        echo.y = element.y + position.y;
        echo.width = element.width;
        echo.height = element.height;
        
        // Stockage dans l'historique
        echo.historique.push({ x: echo.x, y: echo.y, temps: this.temps });
        if (echo.historique.length > echo.maxHistorique) {
            echo.historique.shift();
        }
        
        ctx.save();
        
        // Application des transformations temporelles
        ctx.translate(echo.x + echo.width/2, echo.y + echo.height/2);
        ctx.rotate(position.rotation);
        ctx.scale(position.scale, position.scale);
        ctx.translate(-echo.width/2, -echo.height/2);
        
        // Calcul de l'alpha basé sur l'existence temporelle
        const alpha = echo.alpha * echo.intensiteExistence;
        ctx.globalAlpha = alpha;
        
        // Effet de couleur temporelle
        const hueShift = (echo.couleurShift + position.phase * 20) % 360;
        ctx.filter = `hue-rotate(${hueShift}deg) brightness(${0.8 + position.scale * 0.4})`;
        
        // Simulation du rendu de l'image écho
        const gradient = ctx.createLinearGradient(0, 0, echo.width, echo.height);
        gradient.addColorStop(0, `hsl(${200 + hueShift}, 60%, 50%)`);
        gradient.addColorStop(0.5, `hsl(${220 + hueShift}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${240 + hueShift}, 50%, 40%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, echo.width, echo.height);
        
        // Bordure temporelle
        if (echo.etatTemporal !== 'fantome') {
            ctx.strokeStyle = `hsl(${180 + hueShift}, 80%, 70%)`;
            ctx.lineWidth = 1 + Math.sin(position.phase) * 0.5;
            ctx.strokeRect(0, 0, echo.width, echo.height);
        }
        
        // Traînée temporelle (historique)
        if (echo.historique.length > 5) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.strokeStyle = `hsl(${160 + hueShift}, 60%, 50%)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 1; i < echo.historique.length; i++) {
                const point = echo.historique[i];
                const pointPrec = echo.historique[i-1];
                
                if (i === 1) {
                    ctx.moveTo(pointPrec.x - echo.x + echo.width/2, pointPrec.y - echo.y + echo.height/2);
                }
                ctx.lineTo(point.x - echo.x + echo.width/2, point.y - echo.y + echo.height/2);
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }

    dessinerParticuleInteraction(ctx, particule) {
        if (!particule.actif) return;
        
        const facteurVie = 1 - (particule.vie / particule.vieMax);
        const alpha = particule.alpha * facteurVie;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(particule.x, particule.y);
        
        // Effet visuel basé sur le type d'interaction
        switch (particule.typeInteraction) {
            case 'convergence':
                // Spirale convergente
                ctx.strokeStyle = particule.couleur;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 20; i++) {
                    const angle = (i / 20) * Math.PI * 4;
                    const rayon = particule.taille * (1 - i / 20);
                    const x = Math.cos(angle) * rayon;
                    const y = Math.sin(angle) * rayon;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                break;
                
            case 'divergence':
                // Explosion divergente
                ctx.strokeStyle = particule.couleur;
                ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const longueur = particule.taille * 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * longueur, Math.sin(angle) * longueur);
                    ctx.stroke();
                }
                break;
                
            case 'paradoxe':
                // Forme impossible
                ctx.fillStyle = particule.couleur;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const rayon = particule.taille * (1 + Math.sin(i * 3) * 0.5);
                    const x = Math.cos(angle) * rayon;
                    const y = Math.sin(angle) * rayon;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            default:
                // Particule normale
                ctx.fillStyle = particule.couleur;
                ctx.beginPath();
                ctx.arc(0, 0, particule.taille, 0, Math.PI * 2);
                ctx.fill();
        }
        
        ctx.restore();
    }

    dessinerParadoxesVisuels(ctx) {
        for (let paradoxe of this.paradoxesVisuels) {
            const facteurVie = 1 - (paradoxe.vie / paradoxe.vieMax);
            if (facteurVie <= 0.01) continue;
            
            ctx.save();
            ctx.globalAlpha = paradoxe.intensite * facteurVie;
            ctx.translate(paradoxe.x, paradoxe.y);
            ctx.rotate(paradoxe.rotation);
            
            if (paradoxe.typeParadoxe === 'temporel') {
                // Paradoxe temporel - cercles concentriques pulsants
                for (let i = 0; i < 5; i++) {
                    const couleur = paradoxe.couleurs[i % paradoxe.couleurs.length];
                    const rayon = paradoxe.rayon * (0.2 + i * 0.2) * (1 + Math.sin(this.temps * 0.01 + i) * 0.3);
                    
                    ctx.strokeStyle = couleur + '66';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, rayon, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } else {
                // Paradoxe spatial - forme géométrique impossible
                ctx.strokeStyle = paradoxe.couleurs[0] + '88';
                ctx.lineWidth = 3;
                ctx.beginPath();
                
                const points = 8;
                for (let i = 0; i <= points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    const rayon = paradoxe.rayon * (0.5 + Math.sin(i * 2) * 0.5);
                    const x = Math.cos(angle) * rayon;
                    const y = Math.sin(angle) * rayon;
                    
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.ctx = canvas.getContext('2d');
        
        // Initialisation des positions des échos
        if (element) {
            for (let echo of this.echos) {
                echo.x = element.x;
                echo.y = element.y;
                echo.width = element.width;
                echo.height = element.height;
            }
        }
    }

    update(deltaTime) {
        this.temps += deltaTime;
        this.phaseGlobale += deltaTime * 0.001;
        
        // Mise à jour des échos temporels
        for (let echo of this.echos) {
            // Évolution de l'état temporal
            if (Math.random() < 0.001) {
                const etats = ['actif', 'convergent', 'divergent', 'fantome'];
                echo.etatTemporal = etats[Math.floor(Math.random() * etats.length)];
            }
            
            // Ajustement de l'intensité d'existence
            const cible = echo.etatTemporal === 'fantome' ? 0.3 : 1.0;
            echo.intensiteExistence += (cible - echo.intensiteExistence) * 0.02;
            
            // Modulation de la vitesse temporelle
            if (this.modeTemporel === 'convergence') {
                const vitesseMoyenne = this.vitessesTemporelles.reduce((a, b) => a + b, 0) / this.vitessesTemporelles.length;
                echo.vitesseTemporelle += (vitesseMoyenne - echo.vitesseTemporelle) * 0.01;
            }
        }
        
        // Détection des interactions
        if (this.config.parameters.intensiteInteraction.default > 0.5) {
            this.detecterInteractionsEchos();
        }
        
        // Mise à jour du mode temporel
        this.mettreAJourModeTemporel();
        
        // Génération occasionnelle de paradoxes
        if (this.modeTemporel === 'paradoxe' && Math.random() < 0.02) {
            const x = 200 + Math.random() * 400;
            const y = 150 + Math.random() * 300;
            this.genererParadoxeVisuel(x, y);
        }
        
        // Mise à jour des particules d'interaction
        for (let particule of this.particulesInteraction) {
            if (!particule.actif) continue;
            
            particule.vie += deltaTime;
            if (particule.vie >= particule.vieMax) {
                particule.actif = false;
                continue;
            }
            
            particule.x += particule.vx * deltaTime * 0.1;
            particule.y += particule.vy * deltaTime * 0.1;
            
            // Friction
            particule.vx *= 0.98;
            particule.vy *= 0.98;
        }
        
        // Mise à jour des paradoxes visuels
        for (let i = this.paradoxesVisuels.length - 1; i >= 0; i--) {
            const paradoxe = this.paradoxesVisuels[i];
            paradoxe.vie += deltaTime;
            paradoxe.rotation += paradoxe.vitesseRotation * deltaTime;
            
            if (paradoxe.vie >= paradoxe.vieMax) {
                this.paradoxesVisuels.splice(i, 1);
            }
        }
    }

    render(ctx, element, deltaTime) {
        if (!element) return;
        
        ctx.save();
        
        // Fond avec indication du mode temporel
        const modeColors = {
            'normal': 'rgba(0, 20, 40, 0.1)',
            'convergence': 'rgba(0, 40, 20, 0.1)',
            'divergence': 'rgba(40, 20, 0, 0.1)',
            'paradoxe': 'rgba(40, 0, 40, 0.1)'
        };
        
        ctx.fillStyle = modeColors[this.modeTemporel] || modeColors['normal'];
        ctx.fillRect(0, 0, 800, 600);
        
        // Lignes temporelles (très subtiles)
        this.dessinerLignesTemporelles(ctx);
        
        // Rendu des échos dans l'ordre inverse (du plus ancien au plus récent)
        ctx.globalCompositeOperation = 'screen';
        
        for (let i = this.echos.length - 1; i >= 0; i--) {
            const echo = this.echos[i];
            const facteurTemps = this.config.parameters.vitesseConvergence.default;
            this.dessinerEcho(ctx, echo, element, facteurTemps);
        }
        
        ctx.globalCompositeOperation = 'source-over';
        
        // Particules d'interaction
        ctx.globalCompositeOperation = 'lighter';
        for (let particule of this.particulesInteraction) {
            this.dessinerParticuleInteraction(ctx, particule);
        }
        
        // Paradoxes visuels
        ctx.globalCompositeOperation = 'multiply';
        this.dessinerParadoxesVisuels(ctx);
        
        // Effet de pulsation globale
        const pulsation = Math.sin(this.phaseGlobale) * 0.1 + 0.9;
        ctx.globalAlpha = pulsation;
        
        ctx.restore();
    }

    destroy() {
        this.echos = [];
        this.paradoxesVisuels = [];
        this.convergences = [];
        this.divergences = [];
        this.lignestemporelles = [];
        this.particulesInteraction = [];
        this.vitessesTemporelles = [];
        this.phasesTemporelles = [];
        this.decalagesInitiaux = [];
        this.canvas = null;
        this.element = null;
        this.ctx = null;
    }
}