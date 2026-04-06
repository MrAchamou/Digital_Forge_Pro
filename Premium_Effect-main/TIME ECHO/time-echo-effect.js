class TimeEchoEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'temporal-version-overlay-027',
            name: 'Superposition Temporelle',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.4 },
                intensite: { type: 'range', min: 0.3, max: 1, default: 0.75 },
                couleurPasse: { type: 'color', default: '#ff6b35' },
                couleurPresent: { type: 'color', default: '#ffffff' },
                couleurFutur: { type: 'color', default: '#00d4ff' },
                nombreVersions: { type: 'range', min: 3, max: 12, default: 7 },
                interferenceLevel: { type: 'range', min: 0.2, max: 1, default: 0.6 }
            }
        });
        
        // Variables privées de l'effet
        this.temps = 0;
        this.versionsTempore = [];
        this.paradoxesActifs = [];
        this.interferenceMap = new Map();
        this.revelationFutur = 0;
        
        // Machine temporelle
        this.machineTemporelle = {
            vitesseTemporelle: 1,
            distorsion: 0,
            cycleQuantique: 0,
            stabilite: 1
        };
        
        // Versions futures possibles
        this.versionsFutures = [
            'EVOLVED',
            'TRANSCEND',
            'QUANTUM',
            'INFINITY',
            'BEYOND',
            'ETERNAL'
        ];
        
        // Particules temporelles
        this.particulesTemporelles = [];
        this.ondesTorque = [];
        
        this.initVersionsTemporelles();
        this.initParticules();
    }
    
    initVersionsTemporelles() {
        const nbVersions = this.parameters.nombreVersions.default;
        
        for (let i = 0; i < nbVersions; i++) {
            const relativeTime = (i - Math.floor(nbVersions/2)) / (nbVersions/2); // -1 à 1
            
            this.versionsTempore.push({
                id: i,
                decalageTemporel: relativeTime, // -1=passé lointain, 0=présent, 1=futur lointain
                vitesseTemporelle: 1 + relativeTime * 0.3, // Le futur va plus vite
                position: { x: 0, y: 0 },
                rotation: 0,
                scale: 1 + Math.abs(relativeTime) * 0.1,
                opacite: Math.max(0.1, 1 - Math.abs(relativeTime) * 0.8),
                couleur: this.calculerCouleurTemporelle(relativeTime),
                distorsion: { x: 0, y: 0 },
                etat: relativeTime < -0.3 ? 'passe' : relativeTime > 0.3 ? 'futur' : 'present',
                stabilite: Math.max(0.3, 1 - Math.abs(relativeTime) * 0.5),
                contenu: this.genererContenuTemporel(relativeTime)
            });
        }
    }
    
    initParticules() {
        // Particules de flux temporel
        for (let i = 0; i < 30; i++) {
            this.particulesTemporelles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                taille: Math.random() * 3 + 1,
                age: Math.random() * 1000,
                maxAge: Math.random() * 2000 + 1000,
                epoque: Math.random() * 2 - 1, // -1 à 1
                actif: true
            });
        }
        
        // Ondes de distorsion temporelle
        for (let i = 0; i < 5; i++) {
            this.ondesTorque.push({
                centreX: 400,
                centreY: 300,
                rayon: 0,
                vitesse: Math.random() * 2 + 1,
                intensite: Math.random() * 0.5 + 0.3,
                frequence: Math.random() * 0.01 + 0.005,
                actif: false
            });
        }
    }
    
    calculerCouleurTemporelle(relativeTime) {
        if (relativeTime < -0.1) {
            // Couleurs du passé
            return this.hexToRgb(this.parameters.couleurPasse.default);
        } else if (relativeTime > 0.1) {
            // Couleurs du futur
            return this.hexToRgb(this.parameters.couleurFutur.default);
        } else {
            // Couleur du présent
            return this.hexToRgb(this.parameters.couleurPresent.default);
        }
    }
    
    genererContenuTemporel(relativeTime) {
        if (relativeTime < -0.5) {
            // Passé lointain - versions dégradées
            return 'ANCIENT';
        } else if (relativeTime > 0.5) {
            // Futur lointain - versions évoluées
            const index = Math.floor((relativeTime + 1) * this.versionsFutures.length / 2);
            return this.versionsFutures[Math.min(index, this.versionsFutures.length - 1)];
        } else {
            // Proche du présent
            return this.element?.content || 'TIME';
        }
    }
    
    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Calcul des dimensions du texte
        this.ctx.font = `${element.fontSize || 48}px Arial`;
        this.textMetrics = this.ctx.measureText(element.content || 'TIME');
        this.textWidth = this.textMetrics.width;
        this.textHeight = element.fontSize || 48;
        
        // Position centrée
        this.textX = element.x || (canvas.width - this.textWidth) / 2;
        this.textY = element.y || canvas.height / 2;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 255, g: 255, b: 255};
    }
    
    updateMachineTemporelle(deltaTime) {
        // Mise à jour des paramètres temporels
        this.machineTemporelle.cycleQuantique += deltaTime * 0.001;
        
        // Vitesse temporelle variable
        const baseSpeed = this.parameters.vitesse.default;
        this.machineTemporelle.vitesseTemporelle = baseSpeed * (1 + Math.sin(this.machineTemporelle.cycleQuantique) * 0.3);
        
        // Distorsion temporelle
        this.machineTemporelle.distorsion = Math.sin(this.machineTemporelle.cycleQuantique * 1.7) * 0.2;
        
        // Stabilité temporelle (influence les paradoxes)
        this.machineTemporelle.stabilite = 0.7 + Math.cos(this.machineTemporelle.cycleQuantique * 0.8) * 0.3;
        
        // Déclenchement de paradoxes temporels (30% imprévisibilité)
        if (Math.random() < 0.005 * (1 - this.machineTemporelle.stabilite)) {
            this.declencherParadoxe();
        }
    }
    
    declencherParadoxe() {
        // Création d'un paradoxe temporel
        const paradoxe = {
            type: Math.random() > 0.5 ? 'collision' : 'bifurcation',
            centreX: this.textX + (Math.random() - 0.5) * this.textWidth,
            centreY: this.textY + (Math.random() - 0.5) * this.textHeight,
            rayon: 0,
            maxRayon: Math.random() * 80 + 40,
            intensite: Math.random() * 0.8 + 0.2,
            duree: 0,
            maxDuree: Math.random() * 1000 + 500,
            actif: true
        };
        
        this.paradoxesActifs.push(paradoxe);
    }
    
    updateVersionsTemporelles(deltaTime) {
        this.versionsTempore.forEach(version => {
            const tempsAjuste = this.temps * version.vitesseTemporelle;
            
            // Position basée sur la distorsion temporelle
            const distortionX = Math.sin(tempsAjuste * 0.002 + version.decalageTemporel) * 10 * this.machineTemporelle.distorsion;
            const distortionY = Math.cos(tempsAjuste * 0.0015 + version.decalageTemporel) * 8 * this.machineTemporelle.distorsion;
            
            version.position.x = this.textX + distortionX + version.decalageTemporel * 5;
            version.position.y = this.textY + distortionY + Math.sin(tempsAjuste * 0.001) * version.decalageTemporel * 3;
            
            // Rotation temporelle
            version.rotation = tempsAjuste * 0.0001 * version.decalageTemporel;
            
            // Distorsion locale
            version.distorsion.x = Math.sin(tempsAjuste * 0.003) * Math.abs(version.decalageTemporel) * 2;
            version.distorsion.y = Math.cos(tempsAjuste * 0.0025) * Math.abs(version.decalageTemporel) * 1.5;
            
            // Opacité basée sur la stabilité temporelle
            const baseOpacity = Math.max(0.1, 1 - Math.abs(version.decalageTemporel) * 0.7);
            version.opacite = baseOpacity * this.machineTemporelle.stabilite * this.parameters.intensite.default;
            
            // Évolution du contenu futur
            if (version.etat === 'futur') {
                this.revelationFutur += deltaTime * 0.0001;
                if (this.revelationFutur > 1 && Math.random() < 0.01) {
                    version.contenu = this.versionsFutures[Math.floor(Math.random() * this.versionsFutures.length)];
                    this.revelationFutur = 0;
                }
            }
        });
    }
    
    updateParadoxes(deltaTime) {
        for (let i = this.paradoxesActifs.length - 1; i >= 0; i--) {
            const paradoxe = this.paradoxesActifs[i];
            
            paradoxe.duree += deltaTime;
            paradoxe.rayon = (paradoxe.duree / paradoxe.maxDuree) * paradoxe.maxRayon;
            
            // Effet sur les versions temporelles
            this.versionsTempore.forEach(version => {
                const distance = Math.sqrt(
                    Math.pow(version.position.x - paradoxe.centreX, 2) +
                    Math.pow(version.position.y - paradoxe.centreY, 2)
                );
                
                if (distance < paradoxe.rayon) {
                    const force = (1 - distance / paradoxe.rayon) * paradoxe.intensite;
                    if (paradoxe.type === 'collision') {
                        version.stabilite *= (1 - force * 0.3);
                    } else { // bifurcation
                        version.distorsion.x += force * 10;
                        version.distorsion.y += force * 8;
                    }
                }
            });
            
            if (paradoxe.duree >= paradoxe.maxDuree) {
                this.paradoxesActifs.splice(i, 1);
            }
        }
    }
    
    updateParticules(deltaTime) {
        this.particulesTemporelles.forEach(particule => {
            if (!particule.actif) return;
            
            // Mouvement influencé par l'époque
            const vitesseTemporelle = 1 + particule.epoque * 0.5;
            particule.x += particule.vx * vitesseTemporelle;
            particule.y += particule.vy * vitesseTemporelle;
            
            // Rebond aux bords avec distorsion temporelle
            if (particule.x < 0 || particule.x > 800) {
                particule.vx *= -1;
                particule.epoque += (Math.random() - 0.5) * 0.2; // Changement d'époque
            }
            if (particule.y < 0 || particule.y > 600) {
                particule.vy *= -1;
                particule.epoque += (Math.random() - 0.5) * 0.2;
            }
            
            particule.age += deltaTime;
            if (particule.age >= particule.maxAge) {
                // Réinitialisation avec nouvelle époque
                particule.age = 0;
                particule.epoque = Math.random() * 2 - 1;
                particule.taille = Math.random() * 3 + 1;
            }
        });
        
        // Mise à jour des ondes de distorsion
        this.ondesTorque.forEach(onde => {
            if (!onde.actif && Math.random() < 0.003) {
                onde.centreX = this.textX + (Math.random() - 0.5) * this.textWidth * 2;
                onde.centreY = this.textY + (Math.random() - 0.5) * this.textHeight * 2;
                onde.rayon = 0;
                onde.actif = true;
            }
            
            if (onde.actif) {
                onde.rayon += onde.vitesse;
                if (onde.rayon > 200) {
                    onde.actif = false;
                }
            }
        });
    }
    
    calculateInterference(version1, version2) {
        // Calcul des interférences entre versions temporelles
        const distance = Math.sqrt(
            Math.pow(version1.position.x - version2.position.x, 2) +
            Math.pow(version1.position.y - version2.position.y, 2)
        );
        
        if (distance < 50) {
            const interference = (50 - distance) / 50;
            return {
                intensite: interference * this.parameters.interferenceLevel.default,
                type: version1.etat !== version2.etat ? 'temporelle' : 'spatiale'
            };
        }
        return null;
    }
    
    drawVersionTemporelle(ctx, version) {
        ctx.save();
        
        // Transformation temporelle
        ctx.translate(version.position.x, version.position.y);
        ctx.rotate(version.rotation);
        ctx.scale(version.scale, version.scale);
        
        // Distorsion
        ctx.transform(
            1, version.distorsion.y * 0.1,
            version.distorsion.x * 0.1, 1,
            0, 0
        );
        
        ctx.font = `${this.textHeight}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Couleur avec opacité
        const couleur = version.couleur;
        const opacite = version.opacite * version.stabilite;
        
        // Couches multiples selon l'époque
        if (version.etat === 'passe') {
            // Effet de désintégration pour le passé
            ctx.shadowColor = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${opacite * 0.5})`;
            ctx.shadowBlur = 15;
            ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${opacite * 0.8})`;
        } else if (version.etat === 'futur') {
            // Effet de formation pour le futur
            ctx.shadowColor = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${opacite * 0.8})`;
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${opacite})`;
        } else {
            // Présent - le plus stable
            ctx.shadowColor = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${opacite})`;
            ctx.shadowBlur = 5;
            ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${opacite})`;
        }
        
        ctx.fillText(version.contenu, 0, 0);
        ctx.restore();
    }
    
    drawInterferences(ctx) {
        ctx.save();
        
        // Interférences entre versions temporelles
        for (let i = 0; i < this.versionsTempore.length; i++) {
            for (let j = i + 1; j < this.versionsTempore.length; j++) {
                const interference = this.calculateInterference(
                    this.versionsTempore[i], 
                    this.versionsTempore[j]
                );
                
                if (interference) {
                    const v1 = this.versionsTempore[i];
                    const v2 = this.versionsTempore[j];
                    
                    // Ligne d'interférence
                    const gradient = ctx.createLinearGradient(
                        v1.position.x, v1.position.y,
                        v2.position.x, v2.position.y
                    );
                    
                    if (interference.type === 'temporelle') {
                        gradient.addColorStop(0, `rgba(255, 255, 0, ${interference.intensite})`);
                        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${interference.intensite * 0.8})`);
                        gradient.addColorStop(1, `rgba(255, 0, 255, ${interference.intensite})`);
                    } else {
                        gradient.addColorStop(0, `rgba(100, 255, 255, ${interference.intensite * 0.5})`);
                        gradient.addColorStop(1, `rgba(100, 255, 255, 0)`);
                    }
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = interference.intensite * 3;
                    ctx.beginPath();
                    ctx.moveTo(v1.position.x, v1.position.y);
                    ctx.lineTo(v2.position.x, v2.position.y);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }
    
    drawParticules(ctx) {
        ctx.save();
        
        this.particulesTemporelles.forEach(particule => {
            const progression = particule.age / particule.maxAge;
            const alpha = Math.sin(progression * Math.PI) * 0.6;
            
            // Couleur basée sur l'époque
            let couleur = { r: 255, g: 255, b: 255 };
            if (particule.epoque < -0.3) {
                couleur = this.hexToRgb(this.parameters.couleurPasse.default);
            } else if (particule.epoque > 0.3) {
                couleur = this.hexToRgb(this.parameters.couleurFutur.default);
            }
            
            ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`;
            ctx.shadowColor = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha * 0.5})`;
            ctx.shadowBlur = particule.taille;
            
            ctx.beginPath();
            ctx.arc(particule.x, particule.y, particule.taille, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    drawOndesDistorsion(ctx) {
        ctx.save();
        
        this.ondesTorque.forEach(onde => {
            if (!onde.actif) return;
            
            const alpha = Math.max(0, 1 - onde.rayon / 200) * onde.intensite;
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.arc(onde.centreX, onde.centreY, onde.rayon, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.setLineDash([]);
        });
        
        ctx.restore();
    }
    
    drawParadoxes(ctx) {
        ctx.save();
        
        this.paradoxesActifs.forEach(paradoxe => {
            const progression = paradoxe.duree / paradoxe.maxDuree;
            const alpha = Math.sin(progression * Math.PI) * paradoxe.intensite;
            
            if (paradoxe.type === 'collision') {
                // Explosion temporelle
                const gradient = ctx.createRadialGradient(
                    paradoxe.centreX, paradoxe.centreY, 0,
                    paradoxe.centreX, paradoxe.centreY, paradoxe.rayon
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(255, 200, 0, ${alpha * 0.8})`);
                gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(paradoxe.centreX, paradoxe.centreY, paradoxe.rayon, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Bifurcation temporelle
                ctx.strokeStyle = `rgba(150, 0, 255, ${alpha})`;
                ctx.lineWidth = 3;
                
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(paradoxe.centreX, paradoxe.centreY);
                    ctx.lineTo(
                        paradoxe.centreX + Math.cos(angle) * paradoxe.rayon,
                        paradoxe.centreY + Math.sin(angle) * paradoxe.rayon
                    );
                    ctx.stroke();
                }
            }
        });
        
        ctx.restore();
    }
    
    render(ctx, element, deltaTime) {
        // Mise à jour des systèmes temporels
        this.updateMachineTemporelle(deltaTime);
        this.updateVersionsTemporelles(deltaTime);
        this.updateParadoxes(deltaTime);
        this.updateParticules(deltaTime);
        
        // Rendu des couches temporelles
        this.drawOndesDistorsion(ctx);      // Ondes de distorsion en arrière-plan
        this.drawParticules(ctx);           // Particules temporelles
        
        // Rendu des versions dans l'ordre temporel (passé -> futur)
        const versionsTriees = [...this.versionsTempore].sort((a, b) => a.decalageTemporel - b.decalageTemporel);
        versionsTriees.forEach(version => {
            this.drawVersionTemporelle(ctx, version);
        });
        
        this.drawInterferences(ctx);        // Interférences entre versions
        this.drawParadoxes(ctx);           // Paradoxes temporels
    }
    
    update(deltaTime) {
        this.temps += deltaTime * this.machineTemporelle.vitesseTemporelle;
    }
    
    destroy() {
        // Nettoyage mémoire
        this.versionsTempore = null;
        this.paradoxesActifs = null;
        this.interferenceMap = null;
        this.particulesTemporelles = null;
        this.ondesTorque = null;
        this.machineTemporelle = null;
        this.ctx = null;
        this.canvas = null;
        this.element = null;
    }
}