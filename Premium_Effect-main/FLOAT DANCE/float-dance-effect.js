class FloatDanceEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'gravitational-ballet-016',
            name: 'Ballet Gravitationnel Spatial',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                couleur: { type: 'color', default: '#ffffff' },
                gravite: { type: 'range', min: 0.1, max: 2, default: 0.8 },
                masses: { type: 'range', min: 2, max: 8, default: 4 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.lettres = [];
        this.centresMasse = [];
        this.particulesStellarites = [];
        this.chainlesGravitationelles = [];
        
        // Constantes physiques ajustées pour l'animation
        this.G = 100; // Constante gravitationnelle
        this.vitesseLumiere = 1000; // Pour effets de lentille
        this.coefficientFriction = 0.999; // Très faible friction spatiale
        
        // Système chorégraphique
        this.tempsChoreographie = 0;
        this.phaseDanse = 0;
        this.cycleHarmonique = 0;
        this.resonances = [];
        
        // Variables d'animation
        this.distorsionEspaceTempgs = new Map();
        this.champGravitationnel = [];
        this.trajectoires = new Map();
        
        // Performance
        this.dernierCalculGravite = 0;
        this.intervalleCalcul = 16; // ms
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Initialiser les lettres comme corps célestes
        this.initializeLettres();
        
        // Créer les centres de masse invisibles
        this.createCentresMasse();
        
        // Générer les particules stellaires
        this.createParticulesStellaires();
        
        // Initialiser le système gravitationnel
        this.initializeGravitationalSystem();
        
        // Créer la chorégraphie initiale
        this.initializeChoreography();
    }

    initializeLettres() {
        this.lettres = [];
        const text = this.element.content || 'FLOAT';
        const lettreWidth = this.element.width / text.length;
        
        for (let i = 0; i < text.length; i++) {
            const lettre = {
                char: text[i],
                
                // Position et mouvement
                x: this.element.x + (i * lettreWidth) + lettreWidth/2,
                y: this.element.y + this.element.height/2,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                
                // Propriétés physiques
                masse: 1 + Math.random() * 2,
                rayon: lettreWidth * 0.4,
                charge: (Math.random() - 0.5) * 2,
                
                // Propriétés orbitales
                orbiteCentreX: 0,
                orbiteCentreY: 0,
                excentricite: Math.random() * 0.7,
                periapsis: 50 + Math.random() * 100,
                apoapsis: 100 + Math.random() * 200,
                inclinaison: Math.random() * Math.PI,
                
                // Animation
                rotation: 0,
                vitesseRotation: (Math.random() - 0.5) * 0.02,
                scale: 1,
                distorsionLentille: 1,
                
                // Propriétés visuelles
                luminosite: 0.8 + Math.random() * 0.2,
                couleurSpectrale: this.generateSpectralColor(),
                trail: [],
                energie: Math.random(),
                
                // Chorégraphie
                phaseDanse: Math.random() * Math.PI * 2,
                amplitudeDanse: 20 + Math.random() * 30,
                frequenceDanse: 0.3 + Math.random() * 0.4,
                
                // Historique pour trajectoires
                historique: [],
                derniereForce: { x: 0, y: 0 },
                acceleration: { x: 0, y: 0 }
            };
            
            // Calculer l'orbite initiale
            this.calculateInitialOrbit(lettre, i);
            
            this.lettres.push(lettre);
            this.trajectoires.set(i, []);
        }
    }

    calculateInitialOrbit(lettre, index) {
        // Définir un centre orbital basé sur la position
        const centreX = this.canvas.width/2 + Math.sin(index) * 100;
        const centreY = this.canvas.height/2 + Math.cos(index) * 100;
        
        lettre.orbiteCentreX = centreX;
        lettre.orbiteCentreY = centreY;
        
        // Calculer la vitesse orbitale initiale
        const distance = Math.sqrt(
            Math.pow(lettre.x - centreX, 2) + 
            Math.pow(lettre.y - centreY, 2)
        );
        
        const vitesseOrbitale = Math.sqrt(this.G * 10 / distance);
        const angle = Math.atan2(lettre.y - centreY, lettre.x - centreX);
        
        lettre.vx = -Math.sin(angle) * vitesseOrbitale * (0.8 + Math.random() * 0.4);
        lettre.vy = Math.cos(angle) * vitesseOrbitale * (0.8 + Math.random() * 0.4);
    }

    createCentresMasse() {
        this.centresMasse = [];
        const nombreCentres = this.parameters.masses.default;
        
        for (let i = 0; i < nombreCentres; i++) {
            const centre = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                masse: 5 + Math.random() * 15,
                
                // Mouvement du centre de masse
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                
                // Migration orbitale
                orbiteCentreX: this.canvas.width/2,
                orbiteCentreY: this.canvas.height/2,
                rayonOrbite: 50 + Math.random() * 150,
                vitesseAngulaire: (Math.random() - 0.5) * 0.001,
                phaseOrbitale: Math.random() * Math.PI * 2,
                
                // Propriétés visuelles
                visible: false, // Centres invisibles
                rayonInfluence: 100 + Math.random() * 200,
                pulsation: Math.random() * Math.PI * 2,
                
                // Chorégraphie
                cycleMigration: Math.random() * Math.PI * 2,
                amplitudeMigration: 30 + Math.random() * 70
            };
            
            this.centresMasse.push(centre);
        }
    }

    createParticulesStellaires() {
        this.particulesStellarites = [];
        
        for (let i = 0; i < 25; i++) {
            const particule = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                
                // Propriétés stellaires
                taille: 0.5 + Math.random() * 2,
                luminosite: Math.random(),
                couleur: this.generateCosmicColor(),
                
                // Animation
                scintillement: Math.random() * Math.PI * 2,
                vitesseScintillement: 0.02 + Math.random() * 0.03,
                
                // Trajectoire
                trail: [],
                energie: Math.random()
            };
            
            this.particulesStellarites.push(particule);
        }
    }

    initializeGravitationalSystem() {
        // Initialiser le champ gravitationnel
        this.champGravitationnel = [];
        const resolution = 50;
        
        for (let x = 0; x < this.canvas.width; x += resolution) {
            for (let y = 0; y < this.canvas.height; y += resolution) {
                this.champGravitationnel.push({
                    x: x,
                    y: y,
                    forceBrute: { x: 0, y: 0 },
                    intensite: 0,
                    courbureEspaceTemps: 0
                });
            }
        }
    }

    initializeChoreography() {
        // Créer les résonances harmoniques
        this.resonances = [];
        
        for (let i = 0; i < 5; i++) {
            this.resonances.push({
                frequence: 0.1 + i * 0.15,
                amplitude: 10 + i * 5,
                phase: Math.random() * Math.PI * 2,
                type: i % 2 === 0 ? 'attraction' : 'repulsion'
            });
        }
    }

    updateGravitationalForces(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        // Limiter les calculs pour performance
        if (this.temps - this.dernierCalculGravite < this.intervalleCalcul) {
            return;
        }
        this.dernierCalculGravite = this.temps;
        
        // Mise à jour des centres de masse (migration)
        this.updateCentresMasse(dt);
        
        // Calculer les forces gravitationnelles sur chaque lettre
        this.lettres.forEach((lettre, index) => {
            let forceX = 0, forceY = 0;
            
            // Forces des centres de masse invisibles
            this.centresMasse.forEach(centre => {
                const dx = centre.x - lettre.x;
                const dy = centre.y - lettre.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const force = (this.G * centre.masse * lettre.masse) / 
                                 Math.pow(distance, 2);
                    
                    forceX += force * dx / distance;
                    forceY += force * dy / distance;
                }
            });
            
            // Interactions entre lettres (N-corps)
            this.lettres.forEach((autreLettere, autreIndex) => {
                if (index === autreIndex) return;
                
                const dx = autreLettere.x - lettre.x;
                const dy = autreLettere.y - lettre.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < 300) {
                    const force = (this.G * autreLettere.masse * lettre.masse * 0.1) / 
                                 Math.pow(distance, 2);
                    
                    forceX += force * dx / distance;
                    forceY += force * dy / distance;
                }
            });
            
            // Chorégraphie harmonique
            const harmonique = this.calculateHarmonicForce(lettre, this.temps);
            forceX += harmonique.x;
            forceY += harmonique.y;
            
            // Mise à jour physique
            lettre.acceleration.x = forceX / lettre.masse;
            lettre.acceleration.y = forceY / lettre.masse;
            
            lettre.vx += lettre.acceleration.x * dt;
            lettre.vy += lettre.acceleration.y * dt;
            
            // Friction spatiale très légère
            lettre.vx *= this.coefficientFriction;
            lettre.vy *= this.coefficientFriction;
            
            // Position
            lettre.x += lettre.vx * dt;
            lettre.y += lettre.vy * dt;
            
            // Contraintes douces (pas de rebond dur)
            this.applySoftBoundaries(lettre);
            
            // Rotation basée sur la vitesse angulaire
            lettre.rotation += lettre.vitesseRotation * dt;
            
            // Enregistrer la trajectoire
            const trajectoire = this.trajectoires.get(index);
            trajectoire.push({ x: lettre.x, y: lettre.y, temps: this.temps });
            if (trajectoire.length > 100) {
                trajectoire.shift();
            }
            
            // Historique pour analyse
            lettre.historique.push({ 
                x: lettre.x, 
                y: lettre.y, 
                vx: lettre.vx, 
                vy: lettre.vy 
            });
            if (lettre.historique.length > 20) {
                lettre.historique.shift();
            }
        });
    }

    updateCentresMasse(dt) {
        this.centresMasse.forEach(centre => {
            // Migration orbitale des centres
            centre.phaseOrbitale += centre.vitesseAngulaire * dt;
            centre.cycleMigration += dt * 0.0005;
            
            // Mouvement orbital + migration
            const rayonVariable = centre.rayonOrbite * 
                                 (1 + 0.3 * Math.sin(centre.cycleMigration));
            
            centre.x = centre.orbiteCentreX + 
                      Math.cos(centre.phaseOrbitale) * rayonVariable +
                      Math.sin(centre.cycleMigration) * centre.amplitudeMigration;
            
            centre.y = centre.orbiteCentreY + 
                      Math.sin(centre.phaseOrbitale) * rayonVariable +
                      Math.cos(centre.cycleMigration * 0.7) * centre.amplitudeMigration;
            
            // Pulsation pour effets visuels
            centre.pulsation += dt * 0.001;
        });
    }

    calculateHarmonicForce(lettre, temps) {
        let forceX = 0, forceY = 0;
        
        this.resonances.forEach(resonance => {
            const phase = temps * resonance.frequence * 0.001 + resonance.phase;
            const amplitude = resonance.amplitude * this.parameters.intensite.default;
            
            if (resonance.type === 'attraction') {
                // Force vers le centre harmonique
                const centreX = this.canvas.width/2 + 
                              Math.sin(phase * 0.5) * 100;
                const centreY = this.canvas.height/2 + 
                              Math.cos(phase * 0.3) * 100;
                
                const dx = centreX - lettre.x;
                const dy = centreY - lettre.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const force = amplitude * Math.sin(phase) / distance;
                    forceX += force * dx / distance;
                    forceY += force * dy / distance;
                }
            } else {
                // Force oscillatoire
                forceX += amplitude * Math.sin(phase + lettre.phaseDanse) * 0.1;
                forceY += amplitude * Math.cos(phase * 1.3 + lettre.phaseDanse) * 0.1;
            }
        });
        
        return { x: forceX, y: forceY };
    }

    applySoftBoundaries(lettre) {
        const marge = 50;
        const forceBord = 0.1;
        
        // Attraction douce vers les bords
        if (lettre.x < marge) {
            lettre.vx += (marge - lettre.x) * forceBord;
        } else if (lettre.x > this.canvas.width - marge) {
            lettre.vx -= (lettre.x - (this.canvas.width - marge)) * forceBord;
        }
        
        if (lettre.y < marge) {
            lettre.vy += (marge - lettre.y) * forceBord;
        } else if (lettre.y > this.canvas.height - marge) {
            lettre.vy -= (lettre.y - (this.canvas.height - marge)) * forceBord;
        }
    }

    calculateGravitationalLensing(lettre) {
        let distorsion = 1;
        let courbure = 0;
        
        // Calculer la distorsion basée sur les centres de masse proches
        this.centresMasse.forEach(centre => {
            const dx = centre.x - lettre.x;
            const dy = centre.y - lettre.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < centre.rayonInfluence) {
                // Effet de lentille gravitationnelle
                const facteurLentille = (centre.masse * this.G) / 
                                       (distance * this.vitesseLumiere);
                
                distorsion += facteurLentille * 0.001;
                courbure += facteurLentille * 0.1;
            }
        });
        
        lettre.distorsionLentille = Math.max(0.5, Math.min(2, distorsion));
        lettre.courbureEspaceTemps = courbure;
    }

    updateParticulesStellaires(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        this.particulesStellarites.forEach(particule => {
            // Mouvement influencé par la gravité
            let forceX = 0, forceY = 0;
            
            this.centresMasse.forEach(centre => {
                const dx = centre.x - particule.x;
                const dy = centre.y - particule.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const force = (this.G * centre.masse * 0.1) / 
                                 Math.pow(distance, 2);
                    
                    forceX += force * dx / distance;
                    forceY += force * dy / distance;
                }
            });
            
            particule.vx += forceX * dt * 0.1;
            particule.vy += forceY * dt * 0.1;
            
            particule.x += particule.vx * dt;
            particule.y += particule.vy * dt;
            
            // Friction
            particule.vx *= 0.995;
            particule.vy *= 0.995;
            
            // Rebonds souples
            if (particule.x < 0 || particule.x > this.canvas.width) {
                particule.vx *= -0.9;
                particule.x = Math.max(0, Math.min(this.canvas.width, particule.x));
            }
            if (particule.y < 0 || particule.y > this.canvas.height) {
                particule.vy *= -0.9;
                particule.y = Math.max(0, Math.min(this.canvas.height, particule.y));
            }
            
            // Animation
            particule.scintillement += particule.vitesseScintillement * dt;
            particule.energie = 0.5 + 0.5 * Math.sin(particule.scintillement);
            
            // Trail
            particule.trail.push({ x: particule.x, y: particule.y });
            if (particule.trail.length > 8) {
                particule.trail.shift();
            }
        });
    }

    generateSpectralColor() {
        const spectre = [
            '#ff4444', // Rouge
            '#ff8844', // Orange
            '#ffff44', // Jaune
            '#44ff44', // Vert
            '#4444ff', // Bleu
            '#8844ff', // Violet
            '#ff44ff'  // Magenta
        ];
        return spectre[Math.floor(Math.random() * spectre.length)];
    }

    generateCosmicColor() {
        const cosmique = [
            '#ffffff', // Blanc stellaire
            '#ffffaa', // Jaune stellaire
            '#aaaaff', // Bleu stellaire
            '#ffaaaa', // Rouge stellaire
            '#aaffaa'  // Vert stellaire
        ];
        return cosmique[Math.floor(Math.random() * cosmique.length)];
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.default;
        this.tempsChoreographie += deltaTime;
        
        // Mise à jour des systèmes
        this.updateGravitationalForces(deltaTime);
        this.updateParticulesStellaires(deltaTime);
        
        // Rendu des éléments
        this.renderSpaceBackground(ctx);
        this.renderGravitationalField(ctx);
        this.renderTrajectoires(ctx);
        this.renderParticulesStellaires(ctx);
        this.renderLettres(ctx);
        this.renderGravitationalEffects(ctx);
    }

    renderSpaceBackground(ctx) {
        // Fond spatial avec gradient
        const gradient = ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, 
            Math.max(this.canvas.width, this.canvas.height)/2
        );
        
        gradient.addColorStop(0, 'rgba(10, 10, 30, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderGravitationalField(ctx) {
        if (Math.random() > 0.95) { // Affichage occasionnel
            ctx.save();
            ctx.globalAlpha = 0.1;
            
            // Lignes de champ gravitationnel
            this.centresMasse.forEach(centre => {
                const rayons = 8;
                for (let i = 0; i < rayons; i++) {
                    const angle = (i / rayons) * Math.PI * 2;
                    const longueur = centre.rayonInfluence;
                    
                    ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(centre.x, centre.y);
                    ctx.lineTo(
                        centre.x + Math.cos(angle) * longueur,
                        centre.y + Math.sin(angle) * longueur
                    );
                    ctx.stroke();
                }
            });
            
            ctx.restore();
        }
    }

    renderTrajectoires(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        this.trajectoires.forEach((trajectoire, index) => {
            if (trajectoire.length < 2) return;
            
            const lettre = this.lettres[index];
            ctx.strokeStyle = lettre.couleurSpectrale + '66';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.moveTo(trajectoire[0].x, trajectoire[0].y);
            
            for (let i = 1; i < trajectoire.length; i++) {
                const alpha = i / trajectoire.length;
                ctx.globalAlpha = alpha * 0.3;
                ctx.lineTo(trajectoire[i].x, trajectoire[i].y);
            }
            
            ctx.stroke();
        });
        
        ctx.restore();
    }

    renderParticulesStellaires(ctx) {
        ctx.save();
        
        this.particulesStellarites.forEach(particule => {
            // Trail stellaire
            if (particule.trail.length > 1) {
                ctx.strokeStyle = particule.couleur + '44';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particule.trail[0].x, particule.trail[0].y);
                
                for (let i = 1; i < particule.trail.length; i++) {
                    ctx.lineTo(particule.trail[i].x, particule.trail[i].y);
                }
                
                ctx.stroke();
            }
            
            // Particule avec scintillement
            const taille = particule.taille * (0.8 + 0.4 * particule.energie);
            const glow = taille * 3;
            
            // Glow
            const gradient = ctx.createRadialGradient(
                particule.x, particule.y, 0,
                particule.x, particule.y, glow
            );
            gradient.addColorStop(0, particule.couleur);
            gradient.addColorStop(0.7, particule.couleur + '44');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particule.x, particule.y, glow, 0, Math.PI * 2);
            ctx.fill();
            
            // Core
            ctx.fillStyle = particule.couleur;
            ctx.beginPath();
            ctx.arc(particule.x, particule.y, taille, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    renderLettres(ctx) {
        ctx.save();
        
        this.lettres.forEach(lettre => {
            // Calculer l'effet de lentille gravitationnelle
            this.calculateGravitationalLensing(lettre);
            
            ctx.save();
            ctx.translate(lettre.x, lettre.y);
            ctx.rotate(lettre.rotation);
            ctx.scale(lettre.scale * lettre.distorsionLentille, lettre.scale);
            
            // Champ gravitationnel autour de la lettre
            if (lettre.masse > 1.5) {
                const champSize = 30 + lettre.masse * 10;
                const champGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, champSize);
                
                champGradient.addColorStop(0, 'rgba(100, 150, 255, 0.1)');
                champGradient.addColorStop(0.8, 'rgba(100, 150, 255, 0.05)');
                champGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = champGradient;
                ctx.beginPath();
                ctx.arc(0, 0, champSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Aura de la lettre
            const auraSize = 25 + lettre.luminosite * 20;
            const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
            
            auraGradient.addColorStop(0, lettre.couleurSpectrale + 'AA');
            auraGradient.addColorStop(0.6, lettre.couleurSpectrale + '44');
            auraGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Distorsion de l'espace-temps
            if (lettre.courbureEspaceTemps > 0.1) {
                const distorsionRayons = 6;
                for (let i = 0; i < distorsionRayons; i++) {
                    const angle = (i / distorsionRayons) * Math.PI * 2;
                    const longueur = 15 + lettre.courbureEspaceTemps * 10;
                    
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    
                    // Ligne courbée par la gravité
                    const controlX = Math.cos(angle) * longueur * 0.7;
                    const controlY = Math.sin(angle) * longueur * 0.7;
                    const endX = Math.cos(angle) * longueur;
                    const endY = Math.sin(angle) * longueur;
                    
                    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
                    ctx.stroke();
                }
            }
            
            // Texte de la lettre
            const fontSize = this.element.height * 0.8;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Effet de lentille sur le texte
            ctx.shadowColor = lettre.couleurSpectrale;
            ctx.shadowBlur = 10 + lettre.luminosite * 15;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(lettre.char, 0, 0);
            
            // Vecteur vitesse (occasionnel)
            if (Math.random() > 0.97) {
                const vitesse = Math.sqrt(lettre.vx * lettre.vx + lettre.vy * lettre.vy);
                if (vitesse > 0.5) {
                    const longueurVecteur = Math.min(vitesse * 5, 30);
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    const angle = Math.atan2(lettre.vy, lettre.vx);
                    ctx.lineTo(
                        Math.cos(angle) * longueurVecteur,
                        Math.sin(angle) * longueurVecteur
                    );
                    ctx.stroke();
                    
                    // Flèche
                    ctx.save();
                    ctx.translate(
                        Math.cos(angle) * longueurVecteur,
                        Math.sin(angle) * longueurVecteur
                    );
                    ctx.rotate(angle);
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
                    ctx.beginPath();
                    ctx.moveTo(5, 0);
                    ctx.lineTo(-3, 2);
                    ctx.lineTo(-3, -2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    renderGravitationalEffects(ctx) {
        ctx.save();
        
        // Effet de courbure de l'espace-temps
        this.centresMasse.forEach(centre => {
            if (Math.random() > 0.9) { // Affichage occasionnel pour performance
                const rayonCourbure = centre.rayonInfluence * 0.3;
                
                // Anneaux de courbure
                for (let r = 20; r < rayonCourbure; r += 25) {
                    const alpha = Math.max(0, 0.3 - (r / rayonCourbure) * 0.3);
                    ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 10]);
                    
                    ctx.beginPath();
                    ctx.arc(centre.x, centre.y, r, 0, Math.PI * 2);
                    ctx.stroke();
                }
                
                ctx.setLineDash([]);
            }
            
            // Point de singularité (centre de masse visualisé)
            if (centre.visible || Math.random() > 0.98) {
                const pulsSize = 3 + 2 * Math.sin(centre.pulsation);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(centre.x, centre.y, pulsSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Croix de singularité
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(centre.x - 8, centre.y);
                ctx.lineTo(centre.x + 8, centre.y);
                ctx.moveTo(centre.x, centre.y - 8);
                ctx.lineTo(centre.x, centre.y + 8);
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }

    renderChoreographyInfo(ctx) {
        // Informations sur la chorégraphie actuelle
        ctx.save();
        ctx.font = '14px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'left';
        
        const info = [
            `Phase: ${(this.phaseDanse % (Math.PI * 2)).toFixed(2)}`,
            `Centres: ${this.centresMasse.length}`,
            `Résonances: ${this.resonances.length}`,
            `G: ${this.G.toFixed(1)}`
        ];
        
        info.forEach((text, index) => {
            ctx.fillText(text, 10, 20 + index * 18);
        });
        
        ctx.restore();
    }

    update(deltaTime) {
        // Mise à jour continue des paramètres
        this.G = this.parameters.gravite.default * 100;
        
        // Évolution chorégraphique
        this.phaseDanse += deltaTime * 0.0001;
        this.cycleHarmonique += deltaTime * 0.00005;
        
        // Mise à jour périodique des résonances
        if (this.temps % 5000 < deltaTime) {
            this.updateResonances();
        }
        
        // Migration des centres de masse
        if (this.temps % 10000 < deltaTime) {
            this.migrateGravitationalCenters();
        }
    }

    updateResonances() {
        // Évolution des résonances harmoniques
        this.resonances.forEach(resonance => {
            resonance.phase += (Math.random() - 0.5) * 0.5;
            resonance.amplitude *= 0.95 + Math.random() * 0.1;
            
            // Mutation occasionnelle
            if (Math.random() > 0.8) {
                resonance.type = resonance.type === 'attraction' ? 'repulsion' : 'attraction';
            }
        });
        
        // Ajouter une nouvelle résonance occasionnellement
        if (Math.random() > 0.7 && this.resonances.length < 8) {
            this.resonances.push({
                frequence: 0.05 + Math.random() * 0.3,
                amplitude: 5 + Math.random() * 15,
                phase: Math.random() * Math.PI * 2,
                type: Math.random() > 0.5 ? 'attraction' : 'repulsion'
            });
        }
    }

    migrateGravitationalCenters() {
        // Migration des centres de masse pour créer de nouvelles danses
        this.centresMasse.forEach(centre => {
            // Nouveau centre orbital
            centre.orbiteCentreX = this.canvas.width * (0.2 + Math.random() * 0.6);
            centre.orbiteCentreY = this.canvas.height * (0.2 + Math.random() * 0.6);
            
            // Nouveaux paramètres orbitaux
            centre.rayonOrbite = 30 + Math.random() * 120;
            centre.vitesseAngulaire = (Math.random() - 0.5) * 0.002;
            centre.amplitudeMigration = 20 + Math.random() * 60;
            
            // Variation de masse
            centre.masse *= 0.8 + Math.random() * 0.4;
        });
        
        // Ajouter ou supprimer des centres
        if (Math.random() > 0.6) {
            if (this.centresMasse.length < this.parameters.masses.default * 1.5) {
                // Ajouter un centre
                const nouveauCentre = {
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    masse: 3 + Math.random() * 10,
                    vx: 0, vy: 0,
                    orbiteCentreX: this.canvas.width/2,
                    orbiteCentreY: this.canvas.height/2,
                    rayonOrbite: 50 + Math.random() * 100,
                    vitesseAngulaire: (Math.random() - 0.5) * 0.001,
                    phaseOrbitale: Math.random() * Math.PI * 2,
                    visible: false,
                    rayonInfluence: 80 + Math.random() * 150,
                    pulsation: Math.random() * Math.PI * 2,
                    cycleMigration: Math.random() * Math.PI * 2,
                    amplitudeMigration: 20 + Math.random() * 50
                };
                this.centresMasse.push(nouveauCentre);
            }
        } else if (this.centresMasse.length > 2) {
            // Supprimer un centre
            this.centresMasse.splice(Math.floor(Math.random() * this.centresMasse.length), 1);
        }
    }

    destroy() {
        // Nettoyage des ressources
        this.lettres = [];
        this.centresMasse = [];
        this.particulesStellarites = [];
        this.chainlesGravitationelles = [];
        this.champGravitationnel = [];
        this.trajectoires.clear();
        this.distorsionEspaceTempgs.clear();
        this.resonances = [];
    }
}