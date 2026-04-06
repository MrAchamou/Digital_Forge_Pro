class SoulAuraEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'personalized-energy-aura-057',
            name: 'Aura Énergétique Personnalisée',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                intensiteAura: { type: 'range', min: 0.2, max: 2.0, default: 1.0 },
                couchesAuriques: { type: 'range', min: 3, max: 12, default: 7 },
                rythmeVital: { type: 'range', min: 0.3, max: 3.0, default: 1.2 },
                sensibiliteEmotionnelle: { type: 'range', min: 0.1, max: 1.0, default: 0.6 },
                interactionEnvironnement: { type: 'range', min: 0.0, max: 1.0, default: 0.7 },
                couleurBase: { type: 'color', default: '#7c4dff' }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.signatureVibratoire = this.genererSignatureVibratoire();
        this.etatEmotionnel = 'neutre';
        this.intensiteEmotion = 0.5;
        this.couchesAura = [];
        this.particulesEnergetiques = [];
        this.champsEnergetiques = [];
        this.rythmeCardiaque = 0;
        this.phaseRespiratoire = 0;
        
        // Pool d'objets pour optimisation
        this.particulesPool = [];
        this.maxParticules = 250;
        
        // États émotionnels et leurs signatures chromatiques
        this.etatsEmotionnels = {
            'sérénité': { hue: 240, saturation: 70, luminosite: 60, frequence: 0.8 },
            'joie': { hue: 45, saturation: 80, luminosite: 70, frequence: 1.8 },
            'colère': { hue: 15, saturation: 90, luminosite: 50, frequence: 2.5 },
            'tristesse': { hue: 210, saturation: 60, luminosite: 40, frequence: 0.6 },
            'passion': { hue: 320, saturation: 95, luminosite: 65, frequence: 2.0 },
            'peur': { hue: 270, saturation: 50, luminosite: 30, frequence: 3.0 },
            'amour': { hue: 350, saturation: 75, luminosite: 70, frequence: 1.1 },
            'neutre': { hue: 180, saturation: 40, luminosite: 50, frequence: 1.0 }
        };
        
        this.initCouchesAuriques();
        this.initParticulePool();
        this.initChampsEnergetiques();
    }

    genererSignatureVibratoire() {
        // Génère une signature unique basée sur des harmoniques
        const signature = {
            frequenceFondamentale: 0.5 + Math.random() * 2.0,
            harmoniques: [],
            phaseInitiale: Math.random() * Math.PI * 2,
            modulation: 0.1 + Math.random() * 0.4,
            complexite: Math.floor(Math.random() * 5) + 3
        };
        
        // Génération des harmoniques uniques
        for (let i = 0; i < signature.complexite; i++) {
            signature.harmoniques.push({
                frequence: signature.frequenceFondamentale * (i + 1) * (0.8 + Math.random() * 0.4),
                amplitude: (1 / (i + 1)) * (0.5 + Math.random() * 0.5),
                phase: Math.random() * Math.PI * 2
            });
        }
        
        return signature;
    }

    initCouchesAuriques() {
        this.couchesAura = [];
        const nombreCouches = this.config.parameters.couchesAuriques.default;
        
        for (let i = 0; i < nombreCouches; i++) {
            this.couchesAura.push({
                rayon: 20 + i * 15,
                epaisseur: 8 + Math.random() * 12,
                opacite: 1 - (i / nombreCouches) * 0.8,
                vitesseRotation: (Math.random() - 0.5) * 0.02,
                phaseVibration: Math.random() * Math.PI * 2,
                frequenceVibration: 0.01 + Math.random() * 0.03,
                distorsion: Math.random() * 0.3,
                couleurShift: Math.random() * 60 - 30
            });
        }
    }

    initParticulePool() {
        this.particulesPool = [];
        for (let i = 0; i < this.maxParticules; i++) {
            this.particulesPool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                taille: 1, alpha: 1, couleur: '#ffffff',
                actif: false, vie: 0, vieMax: 0,
                typeEnergie: 'normale', phaseOscillation: 0,
                frequencePersonnelle: 0, amplitudeVibration: 0
            });
        }
    }

    initChampsEnergetiques() {
        this.champsEnergetiques = [];
        const nombreChamps = 4 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < nombreChamps; i++) {
            this.champsEnergetiques.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                rayon: 50 + Math.random() * 100,
                intensite: 0.2 + Math.random() * 0.6,
                type: Math.random() > 0.5 ? 'attractif' : 'repulsif',
                frequence: 0.005 + Math.random() * 0.015,
                phase: Math.random() * Math.PI * 2,
                mobilite: Math.random() * 0.5
            });
        }
    }

    obtenirParticuleDuPool() {
        for (let particule of this.particulesPool) {
            if (!particule.actif) {
                particule.actif = true;
                return particule;
            }
        }
        return null;
    }

    calculerSignatureVibratoire(temps) {
        let valeur = 0;
        const signature = this.signatureVibratoire;
        
        for (let harmonique of signature.harmoniques) {
            const phase = temps * harmonique.frequence + harmonique.phase;
            valeur += Math.sin(phase) * harmonique.amplitude;
        }
        
        // Modulation globale
        const modulation = Math.sin(temps * signature.modulation + signature.phaseInitiale);
        return valeur * (0.7 + modulation * 0.3);
    }

    mettreAJourEtatEmotionnel() {
        // Changement d'état émotionnel basé sur la signature vibratoire
        const vibration = this.calculerSignatureVibratoire(this.temps * 0.001);
        const intensiteVibration = Math.abs(vibration);
        
        // Transition émotionnelle basée sur les patterns vibratoires
        if (intensiteVibration > 0.8) {
            this.etatEmotionnel = vibration > 0 ? 'joie' : 'passion';
        } else if (intensiteVibration > 0.6) {
            this.etatEmotionnel = vibration > 0 ? 'sérénité' : 'amour';
        } else if (intensiteVibration > 0.4) {
            this.etatEmotionnel = 'neutre';
        } else {
            this.etatEmotionnel = vibration > 0 ? 'tristesse' : 'peur';
        }
        
        // Transition douce de l'intensité émotionnelle
        const intensiteCible = intensiteVibration;
        this.intensiteEmotion += (intensiteCible - this.intensiteEmotion) * 0.02;
    }

    genererCouleurAurique(baseHue, couche, temps) {
        const etat = this.etatsEmotionnels[this.etatEmotionnel];
        const vibration = this.calculerSignatureVibratoire(temps);
        
        // Mélange de la couleur de base avec l'état émotionnel
        const hue = (baseHue + etat.hue + couche.couleurShift + vibration * 30) % 360;
        const saturation = Math.max(20, Math.min(100, etat.saturation + vibration * 20));
        const luminosite = Math.max(20, Math.min(80, etat.luminosite + vibration * 15));
        
        return { hue, saturation, luminosite };
    }

    creerParticulesEnergetiques(centreX, centreY) {
        const densite = this.config.parameters.intensiteAura.default * 0.3;
        
        for (let i = 0; i < densite; i++) {
            if (Math.random() > 0.7) continue;
            
            const particule = this.obtenirParticuleDuPool();
            if (!particule) continue;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 80;
            
            particule.x = centreX + Math.cos(angle) * distance;
            particule.y = centreY + Math.sin(angle) * distance;
            particule.vx = Math.cos(angle) * (0.5 + Math.random() * 1.5);
            particule.vy = Math.sin(angle) * (0.5 + Math.random() * 1.5);
            particule.taille = 1 + Math.random() * 3;
            particule.alpha = 0.6 + Math.random() * 0.4;
            particule.vie = 0;
            particule.vieMax = 120 + Math.random() * 180;
            particule.phaseOscillation = Math.random() * Math.PI * 2;
            particule.frequencePersonnelle = 0.02 + Math.random() * 0.08;
            particule.amplitudeVibration = 2 + Math.random() * 8;
            particule.typeEnergie = Math.random() > 0.7 ? 'chakra' : 'normale';
            
            const etat = this.etatsEmotionnels[this.etatEmotionnel];
            particule.couleur = `hsl(${etat.hue + Math.random() * 60 - 30}, 70%, 60%)`;
        }
    }

    appliquerInteractionsEnergetiques(particule) {
        for (let champ of this.champsEnergetiques) {
            const dx = particule.x - champ.x;
            const dy = particule.y - champ.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < champ.rayon) {
                const facteur = (1 - distance / champ.rayon) * champ.intensite;
                const angle = Math.atan2(dy, dx);
                
                if (champ.type === 'attractif') {
                    particule.vx -= Math.cos(angle) * facteur * 0.1;
                    particule.vy -= Math.sin(angle) * facteur * 0.1;
                } else {
                    particule.vx += Math.cos(angle) * facteur * 0.15;
                    particule.vy += Math.sin(angle) * facteur * 0.15;
                }
                
                // Modification de la couleur par interaction
                if (particule.typeEnergie === 'chakra') {
                    const nouveauHue = (parseInt(particule.couleur.match(/\d+/)[0]) + facteur * 30) % 360;
                    particule.couleur = `hsl(${nouveauHue}, 70%, 60%)`;
                }
            }
        }
    }

    dessinerCouchesAuriques(ctx, centreX, centreY) {
        ctx.save();
        
        const vibrationGlobale = this.calculerSignatureVibratoire(this.temps * 0.001);
        const etat = this.etatsEmotionnels[this.etatEmotionnel];
        
        for (let i = this.couchesAura.length - 1; i >= 0; i--) {
            const couche = this.couchesAura[i];
            
            // Mise à jour de la vibration de la couche
            couche.phaseVibration += couche.frequenceVibration;
            const vibrationCouche = Math.sin(couche.phaseVibration) * couche.distorsion;
            
            // Calcul du rayon avec vibration
            const rayonBase = couche.rayon * this.config.parameters.intensiteAura.default;
            const rayonVibrant = rayonBase + vibrationGlobale * 10 + vibrationCouche * 5;
            
            // Génération de la couleur aurique
            const couleur = this.genererCouleurAurique(200, couche, this.temps * 0.001);
            
            // Gradient radial complexe
            const gradient = ctx.createRadialGradient(
                centreX, centreY, rayonVibrant * 0.3,
                centreX, centreY, rayonVibrant
            );
            
            const alpha = couche.opacite * this.intensiteEmotion * 0.8;
            gradient.addColorStop(0, `hsla(${couleur.hue}, ${couleur.saturation}%, ${couleur.luminosite}%, ${alpha})`);
            gradient.addColorStop(0.5, `hsla(${couleur.hue}, ${couleur.saturation}%, ${couleur.luminosite - 10}%, ${alpha * 0.6})`);
            gradient.addColorStop(1, `hsla(${couleur.hue}, ${couleur.saturation}%, ${couleur.luminosite - 20}%, 0)`);
            
            ctx.fillStyle = gradient;
            
            // Dessin avec rotation et distorsion
            ctx.save();
            ctx.translate(centreX, centreY);
            ctx.rotate(couche.vitesseRotation * this.temps * 0.01);
            ctx.scale(1 + vibrationCouche * 0.1, 1 - vibrationCouche * 0.05);
            
            ctx.beginPath();
            ctx.arc(0, 0, rayonVibrant, 0, Math.PI * 2);
            ctx.fill();
            
            // Effet de pulsation sur les bords
            if (i % 2 === 0) {
                const pulsation = Math.sin(this.temps * etat.frequence * 0.01) * 0.5 + 0.5;
                ctx.strokeStyle = `hsla(${couleur.hue}, ${couleur.saturation + 20}%, ${couleur.luminosite + 10}%, ${alpha * pulsation})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, rayonVibrant * 0.95, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.restore();
        }
        
        ctx.restore();
    }

    dessinerChakras(ctx, centreX, centreY) {
        ctx.save();
        
        const chakras = [
            { nom: 'couronne', y: -60, couleur: '#9C27B0' },
            { nom: 'front', y: -40, couleur: '#3F51B5' },
            { nom: 'gorge', y: -20, couleur: '#03A9F4' },
            { nom: 'coeur', y: 0, couleur: '#4CAF50' },
            { nom: 'plexus', y: 20, couleur: '#FFEB3B' },
            { nom: 'sacré', y: 40, couleur: '#FF9800' },
            { nom: 'racine', y: 60, couleur: '#F44336' }
        ];
        
        const vibration = this.calculerSignatureVibratoire(this.temps * 0.001);
        
        for (let chakra of chakras) {
            const x = centreX + Math.sin(this.temps * 0.005) * 5;
            const y = centreY + chakra.y + Math.cos(this.temps * 0.007) * 3;
            const taille = 8 + vibration * 4;
            
            // Gradient pour le chakra
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, taille);
            gradient.addColorStop(0, chakra.couleur + 'CC');
            gradient.addColorStop(0.7, chakra.couleur + '66');
            gradient.addColorStop(1, chakra.couleur + '00');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, taille, 0, Math.PI * 2);
            ctx.fill();
            
            // Rotation spirituelle
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.temps * 0.01 * (chakras.indexOf(chakra) + 1));
            ctx.strokeStyle = chakra.couleur + '88';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const rayon = taille * 0.7;
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * rayon, Math.sin(angle) * rayon);
            }
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.restore();
    }

    dessinerParticules(ctx) {
        ctx.save();
        
        for (let particule of this.particulesPool) {
            if (!particule.actif) continue;
            
            const facteurVie = 1 - (particule.vie / particule.vieMax);
            const alpha = particule.alpha * facteurVie;
            if (alpha <= 0.01) continue;
            
            // Oscillation énergétique personnalisée
            const oscillation = Math.sin(particule.phaseOscillation) * particule.amplitudeVibration;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(particule.x + oscillation, particule.y);
            
            if (particule.typeEnergie === 'chakra') {
                // Particule chakra avec aura
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particule.taille * 3);
                gradient.addColorStop(0, particule.couleur);
                gradient.addColorStop(0.5, particule.couleur + '88');
                gradient.addColorStop(1, particule.couleur + '00');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, particule.taille * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Particule centrale
            ctx.fillStyle = particule.couleur;
            ctx.beginPath();
            ctx.arc(0, 0, particule.taille, 0, Math.PI * 2);
            ctx.fill();
            
            // Effet de connexion énergétique
            if (Math.random() < 0.05) {
                ctx.strokeStyle = particule.couleur + '44';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                const connectX = (Math.random() - 0.5) * 100;
                const connectY = (Math.random() - 0.5) * 100;
                ctx.moveTo(0, 0);
                ctx.lineTo(connectX, connectY);
                ctx.stroke();
            }
            
            ctx.restore();
        }
        
        ctx.restore();
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.ctx = canvas.getContext('2d');
        
        // Positionnement initial des champs énergétiques autour de l'élément
        if (element) {
            for (let champ of this.champsEnergetiques) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 100 + Math.random() * 200;
                champ.x = element.x + element.width/2 + Math.cos(angle) * distance;
                champ.y = element.y + element.height/2 + Math.sin(angle) * distance;
            }
        }
    }

    update(deltaTime) {
        this.temps += deltaTime;
        
        // Mise à jour du rythme vital
        this.rythmeCardiaque = Math.sin(this.temps * this.config.parameters.rythmeVital.default * 0.01);
        this.phaseRespiratoire = Math.sin(this.temps * this.config.parameters.rythmeVital.default * 0.005);
        
        // Évolution de l'état émotionnel
        this.mettreAJourEtatEmotionnel();
        
        // Mise à jour des champs énergétiques
        for (let champ of this.champsEnergetiques) {
            champ.phase += champ.frequence * deltaTime;
            champ.x += Math.sin(champ.phase) * champ.mobilite;
            champ.y += Math.cos(champ.phase * 1.1) * champ.mobilite * 0.7;
        }
        
        // Génération de particules énergétiques
        if (this.element && Math.random() < 0.3) {
            const centreX = this.element.x + this.element.width / 2;
            const centreY = this.element.y + this.element.height / 2;
            this.creerParticulesEnergetiques(centreX, centreY);
        }
        
        // Mise à jour des particules
        for (let particule of this.particulesPool) {
            if (!particule.actif) continue;
            
            particule.vie += deltaTime;
            if (particule.vie >= particule.vieMax) {
                particule.actif = false;
                continue;
            }
            
            // Oscillation personnelle
            particule.phaseOscillation += particule.frequencePersonnelle * deltaTime;
            
            // Application des interactions énergétiques
            if (this.config.parameters.interactionEnvironnement.default > 0.5) {
                this.appliquerInteractionsEnergetiques(particule);
            }
            
            // Mise à jour position
            particule.x += particule.vx * deltaTime * 0.1;
            particule.y += particule.vy * deltaTime * 0.1;
            
            // Attraction vers le centre de l'aura
            if (this.element) {
                const centreX = this.element.x + this.element.width / 2;
                const centreY = this.element.y + this.element.height / 2;
                const dx = centreX - particule.x;
                const dy = centreY - particule.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 150) {
                    particule.vx += (dx / distance) * 0.01;
                    particule.vy += (dy / distance) * 0.01;
                }
            }
            
            // Friction
            particule.vx *= 0.995;
            particule.vy *= 0.995;
        }
    }

    render(ctx, element, deltaTime) {
        if (!element) return;
        
        ctx.save();
        
        const centreX = element.x + element.width / 2;
        const centreY = element.y + element.height / 2;
        
        // Mode blend pour effet énergétique
        ctx.globalCompositeOperation = 'screen';
        
        // Couches auriques principales
        this.dessinerCouchesAuriques(ctx, centreX, centreY);
        
        // Retour au mode normal
        ctx.globalCompositeOperation = 'source-over';
        
        // Chakras énergétiques
        this.dessinerChakras(ctx, centreX, centreY);
        
        // Particules énergétiques
        ctx.globalCompositeOperation = 'lighter';
        this.dessinerParticules(ctx);
        
        // Effet de pulsation vitale global
        const pulsationVitale = Math.abs(this.rythmeCardiaque) * 0.1 + 0.9;
        ctx.globalAlpha = pulsationVitale;
        
        // Affichage de l'état émotionnel (optionnel, très subtil)
        const etat = this.etatsEmotionnels[this.etatEmotionnel];
        ctx.fillStyle = `hsla(${etat.hue}, ${etat.saturation}%, ${etat.luminosite}%, 0.02)`;
        ctx.fillRect(0, 0, 800, 600);
        
        ctx.restore();
    }

    destroy() {
        this.couchesAura = [];
        this.particulesEnergetiques = [];
        this.champsEnergetiques = [];
        this.particulesPool = [];
        this.signatureVibratoire = null;
        this.canvas = null;
        this.element = null;
        this.ctx = null;
    }
}