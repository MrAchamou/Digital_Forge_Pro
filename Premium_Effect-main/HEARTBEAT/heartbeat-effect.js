class HeartbeatEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'cardiac-rhythm-pulse-015',
            name: 'Pulsation Cardiaque Vivante',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.5, max: 2.5, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                couleur: { type: 'color', default: '#ff4444' },
                emotion: { type: 'range', min: 0, max: 1, default: 0.5 },
                bpm: { type: 'range', min: 40, max: 180, default: 72 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.lettres = [];
        this.ondesPression = [];
        this.ecgPoints = [];
        this.cycleCardiaque = 0;
        this.dernierBattement = 0;
        
        // Paramètres médicaux réalistes
        this.rythmeCardiaque = 72; // BPM
        this.intervalleRR = 833; // ms (60000/72)
        this.phasesSystole = {
            lubDebut: 0,
            lubFin: 0.15,
            pauseCourte: 0.15,
            dubDebut: 0.25,
            dubFin: 0.45,
            diastole: 0.45
        };
        
        // États émotionnels
        this.etatsEmotionnels = {
            repos: { bpm: 72, variabilite: 5, amplitude: 1 },
            stress: { bpm: 95, variabilite: 15, amplitude: 1.3 },
            excitation: { bpm: 110, variabilite: 20, amplitude: 1.5 },
            anxiete: { bpm: 88, variabilite: 25, amplitude: 1.2 },
            meditation: { bpm: 58, variabilite: 3, amplitude: 0.8 }
        };
        
        // Variables d'animation
        this.variabiliteRythme = 0;
        this.amplitudePulsation = 1;
        this.etatEmotionnel = 'repos';
        this.transitionEmotion = 0;
        
        // Pool d'objets pour performance
        this.ondesPool = [];
        this.particulesEnergie = [];
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Initialiser les lettres avec propriétés cardiaques
        this.initializeLettres();
        
        // Créer les particules d'énergie
        this.createParticulesEnergie();
        
        // Initialiser l'ECG
        this.initializeECG();
        
        // Définir l'état émotionnel initial
        this.updateEtatEmotionnel();
    }

    initializeLettres() {
        this.lettres = [];
        const text = this.element.content || 'HEARTBEAT';
        const lettreWidth = this.element.width / text.length;
        
        for (let i = 0; i < text.length; i++) {
            const lettre = {
                char: text[i],
                x: this.element.x + (i * lettreWidth) + lettreWidth/2,
                y: this.element.y + this.element.height/2,
                baseX: this.element.x + (i * lettreWidth) + lettreWidth/2,
                baseY: this.element.y + this.element.height/2,
                width: lettreWidth,
                height: this.element.height,
                
                // Propriétés cardiaques
                pulsation: 0,
                phase: 'diastole', // systole, diastole
                amplitudePuls: 1 + (Math.random() * 0.3),
                delaiPropagation: i * 0.05, // Délai pour onde de pression
                
                // Animation
                scale: 1,
                rotation: 0,
                glow: 0,
                couleurPuls: { r: 255, g: 68, b: 68 },
                
                // Propriétés visuelles
                trail: [],
                energie: 0,
                contractionMax: 0,
                
                // Timing cardiaque
                derniereLub: 0,
                derniereDub: 0,
                intensitePuls: 0
            };
            
            this.lettres.push(lettre);
        }
    }

    createParticulesEnergie() {
        this.particulesEnergie = [];
        
        for (let i = 0; i < 15; i++) {
            const particule = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                
                // Propriétés énergétiques
                energie: Math.random(),
                taille: 1 + Math.random() * 2,
                couleur: this.generateEnergyColor(),
                pulsationSync: Math.random() * Math.PI * 2,
                
                // Animation
                trail: [],
                intensite: 0.5 + Math.random() * 0.5,
                frequence: 0.8 + Math.random() * 0.4
            };
            
            this.particulesEnergie.push(particule);
        }
    }

    initializeECG() {
        this.ecgPoints = [];
        this.ecgWidth = this.canvas.width;
        this.ecgHeight = 80;
        this.ecgY = this.canvas.height - this.ecgHeight - 20;
        this.ecgResolution = 2;
        
        // Ligne de base ECG
        for (let x = 0; x < this.ecgWidth; x += this.ecgResolution) {
            this.ecgPoints.push({
                x: x,
                y: this.ecgY + this.ecgHeight/2,
                amplitude: 0,
                age: 0
            });
        }
    }

    updateEtatEmotionnel() {
        // Changer d'état émotionnel basé sur le paramètre
        const emotionLevel = this.parameters.emotion.default;
        
        if (emotionLevel < 0.2) {
            this.etatEmotionnel = 'meditation';
        } else if (emotionLevel < 0.4) {
            this.etatEmotionnel = 'repos';
        } else if (emotionLevel < 0.6) {
            this.etatEmotionnel = 'anxiete';
        } else if (emotionLevel < 0.8) {
            this.etatEmotionnel = 'stress';
        } else {
            this.etatEmotionnel = 'excitation';
        }
        
        const etat = this.etatsEmotionnels[this.etatEmotionnel];
        this.rythmeCardiaque = etat.bpm;
        this.variabiliteRythme = etat.variabilite;
        this.amplitudePulsation = etat.amplitude;
        
        // Recalculer l'intervalle RR
        this.intervalleRR = 60000 / this.rythmeCardiaque;
    }

    calculateCardiacPhase(temps) {
        const cyclePosition = (temps % this.intervalleRR) / this.intervalleRR;
        
        if (cyclePosition < this.phasesSystole.lubFin) {
            // Phase Lub (S1) - Contraction ventriculaire
            const lubIntensity = Math.sin((cyclePosition / this.phasesSystole.lubFin) * Math.PI);
            return {
                phase: 'lub',
                intensite: lubIntensity * 0.8,
                type: 'systole'
            };
        } else if (cyclePosition < this.phasesSystole.pauseCourte) {
            // Pause courte
            return {
                phase: 'pause1',
                intensite: 0,
                type: 'transition'
            };
        } else if (cyclePosition < this.phasesSystole.dubFin) {
            // Phase Dub (S2) - Fermeture valves
            const dubStart = this.phasesSystole.dubDebut;
            const dubDuration = this.phasesSystole.dubFin - dubStart;
            const dubPosition = (cyclePosition - dubStart) / dubDuration;
            const dubIntensity = Math.sin(dubPosition * Math.PI);
            return {
                phase: 'dub',
                intensite: dubIntensity * 0.6,
                type: 'systole'
            };
        } else {
            // Diastole - Remplissage
            return {
                phase: 'diastole',
                intensite: 0,
                type: 'diastole'
            };
        }
    }

    updatePulsationCardiaque(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        this.temps += dt;
        
        // Variabilité du rythme cardiaque (HRV)
        const variabilite = Math.sin(this.temps * 0.0001) * this.variabiliteRythme;
        const intervalleActuel = this.intervalleRR + variabilite;
        
        // Calculer la phase cardiaque actuelle
        const phaseCardiaque = this.calculateCardiacPhase(this.temps);
        
        // Détecter les battements
        const cyclePosition = (this.temps % intervalleActuel) / intervalleActuel;
        const dernierCycle = ((this.temps - dt) % intervalleActuel) / intervalleActuel;
        
        // Nouveau battement lub
        if (cyclePosition < 0.1 && dernierCycle > 0.9) {
            this.triggerBattement('lub');
        }
        
        // Battement dub
        if (cyclePosition > 0.2 && cyclePosition < 0.3 && dernierCycle < 0.2) {
            this.triggerBattement('dub');
        }
        
        // Mise à jour des lettres
        this.lettres.forEach((lettre, index) => {
            // Délai de propagation de l'onde
            const tempsAjuste = this.temps - (lettre.delaiPropagation * intervalleActuel);
            const phaseLettre = this.calculateCardiacPhase(tempsAjuste);
            
            // Pulsation basée sur la phase cardiaque
            lettre.intensitePuls = phaseLettre.intensite * this.amplitudePulsation;
            lettre.phase = phaseLettre.phase;
            
            // Scale et animation
            const pulsBase = 1 + (lettre.intensitePuls * 0.3 * lettre.amplitudePuls);
            lettre.scale = this.easeInOutCubic(pulsBase);
            
            // Glow synchronisé
            lettre.glow = lettre.intensitePuls * this.parameters.intensite.default;
            
            // Couleur basée sur la phase
            if (phaseLettre.phase === 'lub') {
                lettre.couleurPuls = { r: 255, g: 100, b: 100 };
            } else if (phaseLettre.phase === 'dub') {
                lettre.couleurPuls = { r: 200, g: 50, b: 50 };
            } else {
                lettre.couleurPuls = { r: 255, g: 68, b: 68 };
            }
            
            // Énergie électrique
            lettre.energie = lettre.intensitePuls;
        });
    }

    triggerBattement(type) {
        // Créer une onde de pression
        const onde = {
            x: this.element.x,
            y: this.element.y + this.element.height/2,
            rayon: 0,
            intensite: type === 'lub' ? 1 : 0.7,
            type: type,
            age: 0,
            couleur: type === 'lub' ? '#ff6666' : '#ff4444'
        };
        
        this.ondesPression.push(onde);
        
        // Ajouter point ECG
        this.ajouterPointECG(type);
        
        // Synchroniser les particules d'énergie
        this.synchroniserParticules(type);
    }

    ajouterPointECG(type) {
        const amplitude = type === 'lub' ? 40 : 25;
        const largeur = type === 'lub' ? 15 : 10;
        
        // Trouver la position actuelle sur l'ECG
        const scrollX = (this.temps * 0.1) % this.ecgWidth;
        const startIndex = Math.floor(scrollX / this.ecgResolution);
        
        // Ajouter le complexe QRS ou T
        for (let i = 0; i < largeur && (startIndex + i) < this.ecgPoints.length; i++) {
            const point = this.ecgPoints[startIndex + i];
            
            if (type === 'lub') {
                // Complexe QRS - forme caractéristique
                const progress = i / largeur;
                if (progress < 0.2) {
                    point.amplitude = -amplitude * 0.2 * Math.sin(progress * Math.PI * 5);
                } else if (progress < 0.6) {
                    point.amplitude = amplitude * Math.sin((progress - 0.2) * Math.PI * 2.5);
                } else {
                    point.amplitude = -amplitude * 0.3 * Math.sin((progress - 0.6) * Math.PI * 2.5);
                }
            } else {
                // Onde T - plus douce
                point.amplitude = amplitude * Math.sin((i / largeur) * Math.PI);
            }
            
            point.age = 0;
        }
    }

    synchroniserParticules(type) {
        this.particulesEnergie.forEach(particule => {
            particule.pulsationSync = 0;
            particule.energie = type === 'lub' ? 1 : 0.7;
        });
    }

    updateOndesPression(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        for (let i = this.ondesPression.length - 1; i >= 0; i--) {
            const onde = this.ondesPression[i];
            
            onde.age += dt;
            onde.rayon += dt * 0.3;
            onde.intensite *= 0.995;
            
            // Supprimer les ondes trop faibles
            if (onde.intensite < 0.01 || onde.rayon > this.canvas.width) {
                this.ondesPression.splice(i, 1);
            }
        }
    }

    updateECG(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        this.ecgPoints.forEach(point => {
            point.age += dt;
            
            // Décroissance de l'amplitude
            if (point.amplitude !== 0) {
                point.amplitude *= 0.98;
                if (Math.abs(point.amplitude) < 1) {
                    point.amplitude = 0;
                }
            }
        });
    }

    updateParticulesEnergie(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        this.particulesEnergie.forEach(particule => {
            // Mouvement influencé par les battements
            particule.pulsationSync += dt * 0.002;
            const pulsInfluence = Math.sin(particule.pulsationSync) * particule.energie;
            
            particule.vx += (Math.random() - 0.5) * 0.1;
            particule.vy += (Math.random() - 0.5) * 0.1;
            
            particule.x += particule.vx * dt + pulsInfluence;
            particule.y += particule.vy * dt;
            
            // Friction
            particule.vx *= 0.98;
            particule.vy *= 0.98;
            
            // Rebonds
            if (particule.x < 0 || particule.x > this.canvas.width) {
                particule.vx *= -0.8;
                particule.x = Math.max(0, Math.min(this.canvas.width, particule.x));
            }
            if (particule.y < 0 || particule.y > this.canvas.height) {
                particule.vy *= -0.8;
                particule.y = Math.max(0, Math.min(this.canvas.height, particule.y));
            }
            
            // Décroissance de l'énergie
            particule.energie *= 0.995;
            if (particule.energie < 0.1) particule.energie = 0.1;
            
            // Trail
            particule.trail.push({ x: particule.x, y: particule.y });
            if (particule.trail.length > 5) {
                particule.trail.shift();
            }
        });
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    generateEnergyColor() {
        const colors = ['#ff6666', '#ff8888', '#ffaaaa', '#ff4444'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    render(ctx, element, deltaTime) {
        // Mise à jour de l'état émotionnel
        this.updateEtatEmotionnel();
        
        // Mise à jour des systèmes
        this.updatePulsationCardiaque(deltaTime);
        this.updateOndesPression(deltaTime);
        this.updateECG(deltaTime);
        this.updateParticulesEnergie(deltaTime);
        
        // Rendu des éléments
        this.renderOndesPression(ctx);
        this.renderParticulesEnergie(ctx);
        this.renderLettres(ctx);
        this.renderECG(ctx);
        this.renderInfosCardiaques(ctx);
    }

    renderOndesPression(ctx) {
        ctx.save();
        
        this.ondesPression.forEach(onde => {
            const alpha = onde.intensite;
            
            // Gradient circulaire pour l'onde
            const gradient = ctx.createRadialGradient(
                onde.x, onde.y, 0,
                onde.x, onde.y, onde.rayon
            );
            
            gradient.addColorStop(0, `rgba(255, 100, 100, ${alpha * 0.3})`);
            gradient.addColorStop(0.7, `rgba(255, 68, 68, ${alpha * 0.1})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(onde.x, onde.y, onde.rayon, 0, Math.PI * 2);
            ctx.fill();
            
            // Cercle externe
            ctx.strokeStyle = `rgba(255, 68, 68, ${alpha * 0.8})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(onde.x, onde.y, onde.rayon, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        ctx.restore();
    }

    renderParticulesEnergie(ctx) {
        ctx.save();
        
        this.particulesEnergie.forEach(particule => {
            // Trail énergétique
            if (particule.trail.length > 1) {
                ctx.strokeStyle = `rgba(255, 100, 100, ${particule.energie * 0.5})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particule.trail[0].x, particule.trail[0].y);
                
                for (let i = 1; i < particule.trail.length; i++) {
                    ctx.lineTo(particule.trail[i].x, particule.trail[i].y);
                }
                
                ctx.stroke();
            }
            
            // Particule avec glow
            const glowSize = particule.taille * (2 + particule.energie);
            const gradient = ctx.createRadialGradient(
                particule.x, particule.y, 0,
                particule.x, particule.y, glowSize
            );
            
            gradient.addColorStop(0, particule.couleur);
            gradient.addColorStop(0.7, `${particule.couleur}88`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particule.x, particule.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Core de la particule
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(particule.x, particule.y, particule.taille, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    renderLettres(ctx) {
        ctx.save();
        
        this.lettres.forEach(lettre => {
            ctx.save();
            ctx.translate(lettre.x, lettre.y);
            ctx.scale(lettre.scale, lettre.scale);
            
            // Aura cardiaque
            if (lettre.glow > 0) {
                const auraSize = 40 + lettre.glow * 30;
                const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
                
                const r = lettre.couleurPuls.r;
                const g = lettre.couleurPuls.g;
                const b = lettre.couleurPuls.b;
                
                auraGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${lettre.glow * 0.4})`);
                auraGradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${lettre.glow * 0.2})`);
                auraGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = auraGradient;
                ctx.beginPath();
                ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Pulsation électrique
            if (lettre.energie > 0.5) {
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
                    const length = 15 + lettre.energie * 10;
                    const x1 = Math.cos(angle) * length;
                    const y1 = Math.sin(angle) * length;
                    const x2 = Math.cos(angle) * (length + 8);
                    const y2 = Math.sin(angle) * (length + 8);
                    
                    ctx.strokeStyle = `rgba(255, 255, 255, ${lettre.energie})`;
                    ctx.lineWidth = 1 + lettre.energie;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
            
            // Texte avec glow cardiaque
            const fontSize = lettre.height * 0.8;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Shadow/glow
            ctx.shadowColor = this.parameters.couleur.default;
            ctx.shadowBlur = 15 + lettre.glow * 25;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText(lettre.char, 0, 0);
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    renderECG(ctx) {
        ctx.save();
        
        // Fond ECG
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, this.ecgY - 10, this.canvas.width, this.ecgHeight + 20);
        
        // Grille ECG
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.lineWidth = 0.5;
        
        // Lignes verticales
        for (let x = 0; x < this.canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, this.ecgY);
            ctx.lineTo(x, this.ecgY + this.ecgHeight);
            ctx.stroke();
        }
        
        // Lignes horizontales
        for (let y = this.ecgY; y < this.ecgY + this.ecgHeight; y += 10) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        // Ligne ECG
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let isFirst = true;
        this.ecgPoints.forEach(point => {
            const y = this.ecgY + this.ecgHeight/2 - point.amplitude;
            
            if (isFirst) {
                ctx.moveTo(point.x, y);
                isFirst = false;
            } else {
                ctx.lineTo(point.x, y);
            }
        });
        
        ctx.stroke();
        
        // Label ECG
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`ECG - ${Math.round(this.rythmeCardiaque)} BPM`, 10, this.ecgY - 15);
        
        ctx.restore();
    }

    renderInfosCardiaques(ctx) {
        ctx.save();
        
        // Affichage BPM
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = this.parameters.couleur.default;
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(this.rythmeCardiaque)} BPM`, this.canvas.width - 20, 40);
        
        // État émotionnel
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(this.etatEmotionnel.toUpperCase(), this.canvas.width - 20, 65);
        
        ctx.restore();
    }

    update(deltaTime) {
        // Mise à jour continue des paramètres
        this.rythmeCardiaque = this.parameters.bpm.default;
        this.intervalleRR = 60000 / this.rythmeCardiaque;
    }

    destroy() {
        // Nettoyage des ressources
        this.lettres = [];
        this.ondesPression = [];
        this.ecgPoints = [];
        this.particulesEnergie = [];
        this.ondesPool = [];
    }
}