class EchoTrailEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'temporal-ghost-trail-017',
            name: 'Traînée Temporelle Fantôme',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                couleur: { type: 'color', default: '#00ffff' },
                echos: { type: 'range', min: 3, max: 20, default: 12 },
                delai: { type: 'range', min: 50, max: 500, default: 150 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.lettres = [];
        this.echoStates = [];
        this.interferences = [];
        this.distortionsTemporelles = [];
        
        // Configuration temporelle
        this.nombreEchos = 12;
        this.delaiEcho = 150; // ms
        this.facteurDecroissance = 0.15;
        this.vitesseDistorsion = 0.002;
        
        // Historique temporel
        this.historiquePositions = new Map();
        this.historiqueTransformations = new Map();
        this.tempsSnapshot = [];
        
        // Système d'interférence
        this.noeudsInterference = [];
        this.ondesTemporelles = [];
        this.paradoxesTemporels = [];
        
        // Révélations progressives
        this.secretsCache = [];
        this.niveauRevelation = 0;
        this.seuilsRevelation = [0.2, 0.4, 0.6, 0.8];
        
        // Performance
        this.poolEchos = [];
        this.derniereMiseAJour = 0;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Initialiser les lettres avec propriétés temporelles
        this.initializeLettres();
        
        // Créer le système d'échos
        this.initializeEchoSystem();
        
        // Initialiser les interférences
        this.initializeInterferences();
        
        // Créer les secrets cachés
        this.initializeSecrets();
        
        // Setup du voyage temporel
        this.initializeTimeTravel();
    }

    initializeLettres() {
        this.lettres = [];
        const text = this.element.content || 'ECHO';
        const lettreWidth = this.element.width / text.length;
        
        for (let i = 0; i < text.length; i++) {
            const lettre = {
                char: text[i],
                index: i,
                
                // Position et mouvement
                x: this.element.x + (i * lettreWidth) + lettreWidth/2,
                y: this.element.y + this.element.height/2,
                baseX: this.element.x + (i * lettreWidth) + lettreWidth/2,
                baseY: this.element.y + this.element.height/2,
                
                // Propriétés temporelles
                tempsLocal: 0,
                vitesseTemporelle: 1 + (Math.random() - 0.5) * 0.2,
                distorsionTemporelle: 0,
                phaseTemporelle: Math.random() * Math.PI * 2,
                
                // Animation
                oscillation: Math.random() * Math.PI * 2,
                amplitude: 5 + Math.random() * 10,
                frequence: 0.002 + Math.random() * 0.003,
                
                // Propriétés visuelles
                scale: 1,
                rotation: 0,
                opacite: 1,
                couleurTemporelle: this.generateTemporalColor(),
                
                // État quantique
                coherence: 1,
                superposition: 0,
                entanglement: Math.random() > 0.7 ? i + 1 : -1,
                
                // Métadonnées
                width: lettreWidth,
                height: this.element.height,
                energie: Math.random(),
                dernierEcho: 0
            };
            
            this.lettres.push(lettre);
            
            // Initialiser l'historique
            this.historiquePositions.set(i, []);
            this.historiqueTransformations.set(i, []);
        }
    }

    initializeEchoSystem() {
        this.echoStates = [];
        
        // Créer les états d'écho pour chaque lettre
        this.lettres.forEach((lettre, lettreIndex) => {
            const echoLettre = [];
            
            for (let echoIndex = 0; echoIndex < this.nombreEchos; echoIndex++) {
                const echo = {
                    lettreIndex: lettreIndex,
                    echoIndex: echoIndex,
                    
                    // Position temporelle
                    x: lettre.x,
                    y: lettre.y,
                    tempsDecalage: echoIndex * this.delaiEcho,
                    tempsActivation: 0,
                    
                    // Propriétés visuelles
                    opacite: Math.pow(1 - (echoIndex / this.nombreEchos), 2),
                    scale: 1 - (echoIndex * 0.05),
                    rotation: 0,
                    distorsion: echoIndex * 0.1,
                    
                    // Propriétés temporelles
                    vitesseDecroissance: 0.02 + echoIndex * 0.01,
                    coherenceTemporelle: 1 - (echoIndex * 0.08),
                    phaseQuantique: Math.random() * Math.PI * 2,
                    
                    // Animation
                    oscillationPhase: Math.random() * Math.PI * 2,
                    frequenceOscillation: 0.001 + Math.random() * 0.002,
                    amplitudeDistorsion: echoIndex * 2,
                    
                    // États
                    actif: false,
                    age: 0,
                    energie: 1 - (echoIndex * 0.1),
                    
                    // Interférence
                    interferenceAvec: [],
                    noeudInterference: null
                };
                
                echoLettre.push(echo);
            }
            
            this.echoStates.push(echoLettre);
        });
    }

    initializeInterferences() {
        this.noeudsInterference = [];
        this.ondesTemporelles = [];
        
        // Créer des nœuds d'interférence entre échos
        for (let i = 0; i < 8; i++) {
            const noeud = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                rayon: 20 + Math.random() * 60,
                intensite: 0.5 + Math.random() * 0.5,
                
                // Propriétés temporelles
                frequenceBattement: 0.001 + Math.random() * 0.003,
                phaseBattement: Math.random() * Math.PI * 2,
                coherence: Math.random(),
                
                // Animation
                pulsation: 0,
                croissance: true,
                
                // Interactions
                echosInfluences: [],
                ondesEmises: []
            };
            
            this.noeudsInterference.push(noeud);
        }
    }

    initializeSecrets() {
        // Messages cachés révélés dans les traînées
        this.secretsCache = [
            "TIME",
            "PARADOX", 
            "QUANTUM",
            "ECHO",
            "TEMPORAL",
            "GHOST",
            "VOID",
            "FLUX"
        ];
        
        this.niveauRevelation = 0;
    }

    initializeTimeTravel() {
        // Points de voyage temporel
        this.paradoxesTemporels = [];
        
        for (let i = 0; i < 3; i++) {
            const paradoxe = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                rayon: 30 + Math.random() * 40,
                intensiteDistorsion: 0.3 + Math.random() * 0.7,
                
                // Propriétés temporelles
                vitesseRotation: (Math.random() - 0.5) * 0.02,
                facteurTemps: 0.5 + Math.random() * 1.5,
                
                // Animation
                pulsation: Math.random() * Math.PI * 2,
                spirale: 0,
                
                // Effets
                vortexActif: false,
                echosAspires: []
            };
            
            this.paradoxesTemporels.push(paradoxe);
        }
    }

    updatePositionHistory(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        this.lettres.forEach((lettre, index) => {
            // Mouvement temporel
            lettre.tempsLocal += dt * lettre.vitesseTemporelle;
            lettre.oscillation += lettre.frequence * dt;
            
            // Position avec oscillation temporelle
            const oscillationX = Math.sin(lettre.oscillation) * lettre.amplitude;
            const oscillationY = Math.cos(lettre.oscillation * 1.3) * lettre.amplitude * 0.5;
            
            lettre.x = lettre.baseX + oscillationX;
            lettre.y = lettre.baseY + oscillationY;
            
            // Distorsion temporelle
            lettre.distorsionTemporelle = Math.sin(lettre.tempsLocal * 0.001 + lettre.phaseTemporelle) * 0.3;
            
            // Enregistrer dans l'historique
            const historique = this.historiquePositions.get(index);
            const snapshot = {
                temps: this.temps,
                x: lettre.x,
                y: lettre.y,
                scale: lettre.scale,
                rotation: lettre.rotation,
                opacite: lettre.opacite,
                distorsion: lettre.distorsionTemporelle,
                coherence: lettre.coherence
            };
            
            historique.push(snapshot);
            
            // Limiter la taille de l'historique
            const tailleMaxHistorique = Math.max(50, this.nombreEchos * 3);
            if (historique.length > tailleMaxHistorique) {
                historique.shift();
            }
        });
        
        // Enregistrer timestamp global
        this.tempsSnapshot.push(this.temps);
        if (this.tempsSnapshot.length > 100) {
            this.tempsSnapshot.shift();
        }
    }

    updateEchos(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        this.echoStates.forEach((echosLettre, lettreIndex) => {
            const lettre = this.lettres[lettreIndex];
            const historique = this.historiquePositions.get(lettreIndex);
            
            echosLettre.forEach((echo, echoIndex) => {
                echo.age += dt;
                
                // Trouver l'état historique correspondant
                const tempsEcho = this.temps - echo.tempsDecalage;
                const snapshotCorrespondant = this.findHistoricalSnapshot(historique, tempsEcho);
                
                if (snapshotCorrespondant) {
                    // Mise à jour position basée sur l'historique
                    echo.x = snapshotCorrespondant.x;
                    echo.y = snapshotCorrespondant.y;
                    echo.rotation = snapshotCorrespondant.rotation;
                    echo.actif = true;
                    
                    // Dégradation temporelle
                    echo.opacite = snapshotCorrespondant.opacite * 
                                  Math.pow(1 - (echoIndex / this.nombreEchos), 1.5) *
                                  echo.coherenceTemporelle;
                    
                    echo.scale = snapshotCorrespondant.scale * (1 - (echoIndex * 0.03));
                    
                    // Distorsion cumulative
                    echo.distorsion = snapshotCorrespondant.distorsion + 
                                     (echoIndex * 0.15) +
                                     Math.sin(echo.age * echo.frequenceOscillation) * echo.amplitudeDistorsion;
                    
                    // Oscillation temporelle
                    echo.oscillationPhase += echo.frequenceOscillation * dt;
                    const oscillationTemporelle = Math.sin(echo.oscillationPhase) * (echoIndex * 2);
                    
                    echo.x += oscillationTemporelle;
                    echo.y += oscillationTemporelle * 0.5;
                    
                    // Décroissance de cohérence
                    echo.coherenceTemporelle *= (1 - echo.vitesseDecroissance * dt * 0.01);
                    
                    // Phase quantique
                    echo.phaseQuantique += dt * 0.002 * (echoIndex + 1);
                    
                    // Énergie
                    echo.energie *= 0.999;
                } else {
                    echo.actif = false;
                }
                
                // Effets d'intrication quantique
                if (lettre.entanglement >= 0 && lettre.entanglement < this.lettres.length) {
                    const lettreIntrique = this.lettres[lettre.entanglement];
                    if (lettreIntrique) {
                        const correlation = Math.sin(echo.phaseQuantique) * 0.1;
                        echo.x += correlation * (lettreIntrique.x - lettre.x) * 0.05;
                        echo.y += correlation * (lettreIntrique.y - lettre.y) * 0.05;
                    }
                }
            });
        });
    }

    findHistoricalSnapshot(historique, tempsRecherche) {
        if (historique.length === 0) return null;
        
        // Recherche du snapshot le plus proche
        let meilleurMatch = null;
        let meilleureDistance = Infinity;
        
        for (let i = historique.length - 1; i >= 0; i--) {
            const snapshot = historique[i];
            const distance = Math.abs(snapshot.temps - tempsRecherche);
            
            if (distance < meilleureDistance) {
                meilleureDistance = distance;
                meilleurMatch = snapshot;
            }
            
            // Si on trouve un match exact ou qu'on s'éloigne, on s'arrête
            if (distance < 10 || (i < historique.length - 1 && distance > meilleureDistance)) {
                break;
            }
        }
        
        return meilleurMatch;
    }

    updateInterferences(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        // Mise à jour des nœuds d'interférence
        this.noeudsInterference.forEach(noeud => {
            noeud.pulsation += dt * noeud.frequenceBattement;
            noeud.phaseBattement += dt * 0.001;
            
            // Pulsation du nœud
            const pulsationFactor = 1 + Math.sin(noeud.pulsation) * 0.3;
            noeud.intensite = (0.5 + 0.5 * Math.sin(noeud.phaseBattement)) * pulsationFactor;
            
            // Croissance/décroissance du rayon
            if (noeud.croissance) {
                noeud.rayon += dt * 0.02;
                if (noeud.rayon > 80) noeud.croissance = false;
            } else {
                noeud.rayon -= dt * 0.02;
                if (noeud.rayon < 20) noeud.croissance = true;
            }
            
            // Effets sur les échos à proximité
            noeud.echosInfluences = [];
            
            this.echoStates.forEach((echosLettre, lettreIndex) => {
                echosLettre.forEach((echo, echoIndex) => {
                    if (!echo.actif) return;
                    
                    const distance = Math.sqrt(
                        Math.pow(echo.x - noeud.x, 2) +
                        Math.pow(echo.y - noeud.y, 2)
                    );
                    
                    if (distance < noeud.rayon) {
                        const facteurInfluence = 1 - (distance / noeud.rayon);
                        
                        // Modulation d'interférence
                        echo.opacite *= 1 + Math.sin(noeud.phaseBattement * 3) * 
                                       facteurInfluence * noeud.intensite * 0.3;
                        
                        // Distorsion spatiale
                        const angleDistorsion = Math.atan2(echo.y - noeud.y, echo.x - noeud.x);
                        const distorsionMagnitude = facteurInfluence * noeud.intensite * 5;
                        
                        echo.x += Math.cos(angleDistorsion + noeud.phaseBattement) * distorsionMagnitude;
                        echo.y += Math.sin(angleDistorsion + noeud.phaseBattement) * distorsionMagnitude;
                        
                        noeud.echosInfluences.push({
                            echo: echo,
                            facteur: facteurInfluence
                        });
                    }
                });
            });
        });
        
        // Génération d'ondes temporelles
        if (Math.random() > 0.95) {
            const onde = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                rayon: 0,
                vitesse: 50 + Math.random() * 100,
                intensite: 0.5 + Math.random() * 0.5,
                age: 0,
                couleur: this.generateTemporalColor()
            };
            
            this.ondesTemporelles.push(onde);
        }
        
        // Mise à jour des ondes
        for (let i = this.ondesTemporelles.length - 1; i >= 0; i--) {
            const onde = this.ondesTemporelles[i];
            onde.age += dt;
            onde.rayon += onde.vitesse * dt * 0.01;
            onde.intensite *= 0.995;
            
            if (onde.intensite < 0.01 || onde.rayon > Math.max(this.canvas.width, this.canvas.height)) {
                this.ondesTemporelles.splice(i, 1);
            }
        }
    }

    updateTemporalParadoxes(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        this.paradoxesTemporels.forEach(paradoxe => {
            paradoxe.pulsation += dt * 0.003;
            paradoxe.spirale += paradoxe.vitesseRotation * dt;
            
            // Activation aléatoire du vortex
            if (Math.random() > 0.995) {
                paradoxe.vortexActif = !paradoxe.vortexActif;
            }
            
            if (paradoxe.vortexActif) {
                // Aspirer les échos proches
                this.echoStates.forEach((echosLettre, lettreIndex) => {
                    echosLettre.forEach((echo, echoIndex) => {
                        if (!echo.actif) return;
                        
                        const distance = Math.sqrt(
                            Math.pow(echo.x - paradoxe.x, 2) +
                            Math.pow(echo.y - paradoxe.y, 2)
                        );
                        
                        if (distance < paradoxe.rayon * 2) {
                            const attraction = (paradoxe.intensiteDistorsion / distance) * dt * 0.1;
                            const angle = Math.atan2(paradoxe.y - echo.y, paradoxe.x - echo.x);
                            
                            echo.x += Math.cos(angle) * attraction;
                            echo.y += Math.sin(angle) * attraction;
                            
                            // Distorsion temporelle extrême
                            echo.distorsion += attraction * 10;
                            echo.opacite *= 1 + attraction;
                        }
                    });
                });
            }
        });
    }

    updateRevelations() {
        // Calculer le niveau global d'activité des échos
        let activiteGlobale = 0;
        let nombreEchosActifs = 0;
        
        this.echoStates.forEach(echosLettre => {
            echosLettre.forEach(echo => {
                if (echo.actif && echo.opacite > 0.1) {
                    activiteGlobale += echo.opacite * echo.coherenceTemporelle;
                    nombreEchosActifs++;
                }
            });
        });
        
        const activiteMoyenne = nombreEchosActifs > 0 ? activiteGlobale / nombreEchosActifs : 0;
        
        // Mise à jour du niveau de révélation
        const ancienNiveau = this.niveauRevelation;
        this.niveauRevelation = Math.min(activiteMoyenne * 2, 1);
        
        // Déclencher des révélations
        this.seuilsRevelation.forEach((seuil, index) => {
            if (ancienNiveau < seuil && this.niveauRevelation >= seuil) {
                this.triggerRevelation(index);
            }
        });
    }

    triggerRevelation(niveau) {
        // Révéler un secret caché
        if (niveau < this.secretsCache.length) {
            const secret = this.secretsCache[niveau];
            
            // Créer des échos du secret
            for (let i = 0; i < secret.length; i++) {
                const echoSecret = {
                    char: secret[i],
                    x: this.canvas.width/2 + (i - secret.length/2) * 30,
                    y: this.canvas.height - 100,
                    opacite: 0,
                    scale: 0.5,
                    age: 0,
                    dureeVie: 3000,
                    couleur: '#ffaa00',
                    type: 'revelation'
                };
                
                // Ajouter à une liste spéciale de révélations
                if (!this.revelations) this.revelations = [];
                this.revelations.push(echoSecret);
            }
        }
    }

    generateTemporalColor() {
        const couleurs = [
            '#00ffff', // Cyan temporel
            '#ff0099', // Magenta quantique
            '#99ff00', // Vert énergie
            '#ffff00', // Jaune plasma
            '#0099ff', // Bleu cosmos
            '#ff9900'  // Orange fusion
        ];
        return couleurs[Math.floor(Math.random() * couleurs.length)];
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.default;
        
        // Mise à jour des systèmes
        this.updatePositionHistory(deltaTime);
        this.updateEchos(deltaTime);
        this.updateInterferences(deltaTime);
        this.updateTemporalParadoxes(deltaTime);
        this.updateRevelations();
        
        // Rendu des éléments
        this.renderTemporalBackground(ctx);
        this.renderOndesTemporelles(ctx);
        this.renderParadoxesTemporels(ctx);
        this.renderEchos(ctx);
        this.renderLettresOriginales(ctx);
        this.renderInterferences(ctx);
        this.renderRevelations(ctx);
    }

    renderTemporalBackground(ctx) {
        // Fond avec distorsions temporelles
        ctx.save();
        ctx.globalAlpha = 0.05;
        
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Lignes temporelles
        for (let i = 0; i < 5; i++) {
            const y = (this.canvas.height / 5) * i;
            const ondulation = Math.sin(this.temps * 0.001 + i) * 10;
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y + ondulation);
            
            for (let x = 0; x < this.canvas.width; x += 20) {
                const distorsion = Math.sin((x + this.temps) * 0.01) * 5;
                ctx.lineTo(x, y + ondulation + distorsion);
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }

    renderOndesTemporelles(ctx) {
        ctx.save();
        
        this.ondesTemporelles.forEach(onde => {
            const gradient = ctx.createRadialGradient(
                onde.x, onde.y, 0,
                onde.x, onde.y, onde.rayon
            );
            
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.8, onde.couleur + Math.floor(onde.intensite * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, 'transparent');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(onde.x, onde.y, onde.rayon, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        ctx.restore();
    }

    renderParadoxesTemporels(ctx) {
        ctx.save();
        
        this.paradoxesTemporels.forEach(paradoxe => {
            ctx.save();
            ctx.translate(paradoxe.x, paradoxe.y);
            ctx.rotate(paradoxe.spirale);
            
            // Vortex temporel
            const nombreSpirales = 8;
            for (let i = 0; i < nombreSpirales; i++) {
                const angle = (i / nombreSpirales) * Math.PI * 2;
                const rayon = paradoxe.rayon * (1 + Math.sin(paradoxe.pulsation + i) * 0.3);
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${paradoxe.intensiteDistorsion * 0.5})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                
                // Spirale logarithmique
                for (let r = 0; r < rayon; r += 5) {
                    const spiraleAngle = angle + (r / rayon) * Math.PI * 4;
                    const x = Math.cos(spiraleAngle) * r;
                    const y = Math.sin(spiraleAngle) * r;
                    ctx.lineTo(x, y);
                }
                
                ctx.stroke();
            }
            
            // Centre du paradoxe
            if (paradoxe.vortexActif) {
                const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
                coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                coreGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = coreGradient;
                ctx.beginPath();
                ctx.arc(0, 0, 15, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    renderEchos(ctx) {
        ctx.save();
        
        // Rendu des échos de l'arrière vers l'avant
        for (let echoIndex = this.nombreEchos - 1; echoIndex >= 0; echoIndex--) {
            this.echoStates.forEach((echosLettre, lettreIndex) => {
                const echo = echosLettre[echoIndex];
                if (!echo.actif || echo.opacite < 0.01) return;
                
                const lettre = this.lettres[lettreIndex];
                
                ctx.save();
                ctx.translate(echo.x, echo.y);
                ctx.rotate(echo.rotation);
                ctx.scale(echo.scale, echo.scale);
                
                // Distorsion temporelle
                if (echo.distorsion > 0) {
                    const distortionScale = 1 + echo.distorsion;
                    ctx.scale(distortionScale, 1 / distortionScale);
                }
                
                // Effet quantique
                const phaseQuantique = Math.sin(echo.phaseQuantique) * 0.1;
                ctx.translate(phaseQuantique * 10, phaseQuantique * 5);
                
                // Couleur de l'écho
                const alpha = Math.floor(echo.opacite * 255).toString(16).padStart(2, '0');
                let couleurEcho = lettre.couleurTemporelle;
                
                // Modification de couleur selon l'âge
                if (echoIndex > this.nombreEchos * 0.7) {
                    couleurEcho = '#ff6666'; // Rouge pour les échos très anciens
                } else if (echoIndex > this.nombreEchos * 0.4) {
                    couleurEcho = '#ffaa66'; // Orange pour les échos moyens
                }
                
                // Aura fantomatique
                const auraSize = 20 + echo.energie * 15;
                const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
                
                auraGradient.addColorStop(0, couleurEcho + alpha);
                auraGradient.addColorStop(0.7, couleurEcho + Math.floor(echo.opacite * 0.3 * 255).toString(16).padStart(2, '0'));
                auraGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = auraGradient;
                ctx.beginPath();
                ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Glitch temporel
                if (echo.coherenceTemporelle < 0.5 && Math.random() > 0.8) {
                    ctx.save();
                    ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
                    ctx.scale(1 + (Math.random() - 0.5) * 0.5, 1 + (Math.random() - 0.5) * 0.5);
                }
                
                // Texte de l'écho
                const fontSize = lettre.height * 0.8;
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Shadow/glow
                ctx.shadowColor = couleurEcho;
                ctx.shadowBlur = 10 + echo.energie * 20;
                ctx.globalAlpha = echo.opacite;
                
                ctx.fillStyle = couleurEcho + alpha;
                ctx.fillText(lettre.char, 0, 0);
                
                // Lignes de connexion temporelle (occasionnel)
                if (echo.coherenceTemporelle > 0.7 && Math.random() > 0.95) {
                    const lettreOriginale = this.lettres[lettreIndex];
                    ctx.strokeStyle = couleurEcho + '44';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(
                        lettreOriginale.x - echo.x,
                        lettreOriginale.y - echo.y
                    );
                    ctx.stroke();
                }
                
                if (echo.coherenceTemporelle < 0.5 && Math.random() > 0.8) {
                    ctx.restore(); // Restore du glitch
                }
                
                ctx.restore();
            });
        }
        
        ctx.restore();
    }

    renderLettresOriginales(ctx) {
        ctx.save();
        
        this.lettres.forEach(lettre => {
            ctx.save();
            ctx.translate(lettre.x, lettre.y);
            ctx.rotate(lettre.rotation);
            ctx.scale(lettre.scale, lettre.scale);
            
            // Aura de la lettre originale
            const auraSize = 30 + lettre.energie * 20;
            const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
            
            auraGradient.addColorStop(0, this.parameters.couleur.default + 'AA');
            auraGradient.addColorStop(0.6, this.parameters.couleur.default + '44');
            auraGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Effet de superposition quantique
            if (lettre.superposition > 0) {
                for (let i = 0; i < 3; i++) {
                    ctx.save();
                    ctx.translate(
                        Math.sin(lettre.tempsLocal * 0.01 + i * Math.PI * 2/3) * lettre.superposition * 5,
                        Math.cos(lettre.tempsLocal * 0.01 + i * Math.PI * 2/3) * lettre.superposition * 3
                    );
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = lettre.couleurTemporelle;
                    ctx.font = `bold ${lettre.height * 0.8}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(lettre.char, 0, 0);
                    ctx.restore();
                }
            }
            
            // Texte principal
            const fontSize = lettre.height * 0.8;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Glow principal
            ctx.shadowColor = this.parameters.couleur.default;
            ctx.shadowBlur = 15 + lettre.energie * 25;
            ctx.globalAlpha = lettre.opacite;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(lettre.char, 0, 0);
            
            // Indicateurs d'intrication
            if (lettre.entanglement >= 0 && lettre.entanglement < this.lettres.length) {
                const lettreIntrique = this.lettres[lettre.entanglement];
                if (lettreIntrique && Math.random() > 0.95) {
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(
                        lettreIntrique.x - lettre.x,
                        lettreIntrique.y - lettre.y
                    );
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    renderInterferences(ctx) {
        ctx.save();
        
        this.noeudsInterference.forEach(noeud => {
            // Cercles d'interférence
            const nombreCercles = 3;
            for (let i = 0; i < nombreCercles; i++) {
                const rayon = noeud.rayon * (0.3 + i * 0.35);
                const alpha = Math.floor((noeud.intensite * (1 - i * 0.3) * 100)).toString(16).padStart(2, '0');
                
                ctx.strokeStyle = '#ffffff' + alpha;
                ctx.lineWidth = 2 - i * 0.5;
                ctx.beginPath();
                ctx.arc(noeud.x, noeud.y, rayon, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Patterns d'interférence
            if (noeud.echosInfluences.length > 1) {
                noeud.echosInfluences.forEach((influence, index) => {
                    if (index === 0) return;
                    
                    const echoA = noeud.echosInfluences[0].echo;
                    const echoB = influence.echo;
                    
                    // Ligne d'interférence
                    ctx.strokeStyle = `rgba(255, 255, 100, ${influence.facteur * 0.7})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(echoA.x, echoA.y);
                    ctx.lineTo(echoB.x, echoB.y);
                    ctx.stroke();
                    
                    // Point d'interférence
                    const midX = (echoA.x + echoB.x) / 2;
                    const midY = (echoA.y + echoB.y) / 2;
                    
                    ctx.fillStyle = `rgba(255, 255, 255, ${influence.facteur})`;
                    ctx.beginPath();
                    ctx.arc(midX, midY, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        });
        
        ctx.restore();
    }

    renderRevelations(ctx) {
        if (!this.revelations) return;
        
        ctx.save();
        
        // Mise à jour et rendu des révélations
        for (let i = this.revelations.length - 1; i >= 0; i--) {
            const revelation = this.revelations[i];
            revelation.age += 16; // deltaTime approximatif
            
            // Animation d'apparition
            if (revelation.age < 1000) {
                revelation.opacite = Math.min(1, revelation.age / 1000);
                revelation.scale = 0.5 + (revelation.age / 1000) * 0.5;
            } else if (revelation.age > revelation.dureeVie - 1000) {
                revelation.opacite = Math.max(0, (revelation.dureeVie - revelation.age) / 1000);
            }
            
            // Mouvement flottant
            revelation.y -= 0.2;
            revelation.x += Math.sin(revelation.age * 0.002) * 0.5;
            
            // Rendu
            ctx.save();
            ctx.translate(revelation.x, revelation.y);
            ctx.scale(revelation.scale, revelation.scale);
            ctx.globalAlpha = revelation.opacite;
            
            // Glow de révélation
            ctx.shadowColor = revelation.couleur;
            ctx.shadowBlur = 20;
            
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = revelation.couleur;
            ctx.fillText(revelation.char, 0, 0);
            
            ctx.restore();
            
            // Supprimer si terminé
            if (revelation.age > revelation.dureeVie) {
                this.revelations.splice(i, 1);
            }
        }
        
        ctx.restore();
    }

    update(deltaTime) {
        // Mise à jour continue des paramètres
        this.nombreEchos = Math.floor(this.parameters.echos.default);
        this.delaiEcho = this.parameters.delai.default;
        
        // Ajuster le nombre d'échos si nécessaire
        if (this.echoStates.length > 0 && this.echoStates[0].length !== this.nombreEchos) {
            this.initializeEchoSystem();
        }
        
        // Évolution de la cohérence temporelle
        this.lettres.forEach(lettre => {
            lettre.coherence *= 0.999;
            if (lettre.coherence < 0.1) lettre.coherence = 1;
            
            // Superposition quantique occasionnelle
            if (Math.random() > 0.995) {
                lettre.superposition = Math.random() * 0.5;
            } else {
                lettre.superposition *= 0.95;
            }
            
            // Évolution de l'énergie
            lettre.energie = 0.5 + 0.5 * Math.sin(lettre.tempsLocal * 0.001);
        });
        
        // Migration des nœuds d'interférence
        if (this.temps % 8000 < deltaTime) {
            this.noeudsInterference.forEach(noeud => {
                noeud.x = Math.random() * this.canvas.width;
                noeud.y = Math.random() * this.canvas.height;
                noeud.frequenceBattement = 0.001 + Math.random() * 0.003;
            });
        }
        
        // Évolution des paradoxes temporels
        if (this.temps % 12000 < deltaTime) {
            this.paradoxesTemporels.forEach(paradoxe => {
                paradoxe.x = Math.random() * this.canvas.width;
                paradoxe.y = Math.random() * this.canvas.height;
                paradoxe.intensiteDistorsion = 0.3 + Math.random() * 0.7;
            });
        }
    }

    destroy() {
        // Nettoyage des ressources
        this.lettres = [];
        this.echoStates = [];
        this.interferences = [];
        this.distortionsTemporelles = [];
        this.historiquePositions.clear();
        this.historiqueTransformations.clear();
        this.tempsSnapshot = [];
        this.noeudsInterference = [];
        this.ondesTemporelles = [];
        this.paradoxesTemporels = [];
        this.secretsCache = [];
        this.poolEchos = [];
        if (this.revelations) this.revelations = [];
    }
}