class MagneticFieldEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'electromagnetic-attraction-014',
            name: 'Champ Magnétique Interactif',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                couleur: { type: 'color', default: '#00ffff' },
                particules: { type: 'range', min: 20, max: 100, default: 60 },
                polarite: { type: 'range', min: 0.5, max: 5, default: 2 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.lettres = [];
        this.particules = [];
        this.lignesChamp = [];
        this.cyclePolarite = 0;
        this.forcesMagnetiques = new Map();
        
        // Configuration magnétique
        this.forceMagnetique = 0.8;
        this.rayonInfluence = 120;
        this.decroissanceForce = 2.2;
        this.vitesseOscillation = 0.003;
        
        // Pool d'objets pour performance
        this.particulesPool = [];
        this.lignesPool = [];
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.element = element;
        
        // Initialiser les lettres comme dipôles magnétiques
        this.initializeLettres();
        
        // Créer les particules métalliques
        this.createParticules();
        
        // Générer les lignes de champ
        this.generateFieldLines();
    }

    initializeLettres() {
        this.lettres = [];
        const text = this.element.content || 'MAGNETO';
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
                
                // Propriétés magnétiques
                polarite: (i % 2 === 0) ? 1 : -1, // Alternance N/S
                intensiteMagnetique: 0.5 + Math.random() * 0.5,
                chargeMagnetique: 0,
                vitesseX: 0,
                vitesseY: 0,
                
                // Animation
                oscillation: Math.random() * Math.PI * 2,
                amplitude: 2 + Math.random() * 3,
                frequence: 0.8 + Math.random() * 0.4,
                
                // Propriétés visuelles
                rotation: 0,
                scale: 1,
                glow: 0,
                trailPoints: []
            };
            
            this.lettres.push(lettre);
        }
    }

    createParticules() {
        const nombreParticules = this.parameters.particules.default;
        
        for (let i = 0; i < nombreParticules; i++) {
            const particule = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                
                // Propriétés magnétiques
                charge: (Math.random() > 0.5) ? 1 : -1,
                masse: 0.5 + Math.random() * 1.5,
                magnetisme: 0.3 + Math.random() * 0.7,
                
                // Propriétés visuelles
                taille: 1 + Math.random() * 3,
                couleur: this.generateMetallicColor(),
                trail: [],
                energie: Math.random(),
                
                // Animation
                rotation: Math.random() * Math.PI * 2,
                vitesseRotation: (Math.random() - 0.5) * 0.1,
                pulsation: Math.random() * Math.PI * 2
            };
            
            this.particules.push(particule);
        }
    }

    generateFieldLines() {
        this.lignesChamp = [];
        const resolution = 25;
        
        for (let x = 0; x < this.canvas.width; x += resolution) {
            for (let y = 0; y < this.canvas.height; y += resolution) {
                const ligne = this.traceFieldLine(x, y);
                if (ligne.length > 3) {
                    this.lignesChamp.push({
                        points: ligne,
                        intensite: this.calculateFieldIntensity(x, y),
                        age: Math.random() * Math.PI * 2,
                        visible: Math.random() > 0.7
                    });
                }
            }
        }
    }

    traceFieldLine(startX, startY) {
        const points = [];
        let x = startX, y = startY;
        const step = 3;
        const maxPoints = 50;
        
        for (let i = 0; i < maxPoints; i++) {
            const champ = this.calculateMagneticField(x, y);
            if (champ.magnitude < 0.01) break;
            
            points.push({ x, y, intensity: champ.magnitude });
            
            // Suivre la direction du champ
            x += champ.dx * step;
            y += champ.dy * step;
            
            // Vérifier les limites
            if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) break;
        }
        
        return points;
    }

    calculateMagneticField(x, y) {
        let fx = 0, fy = 0;
        
        this.lettres.forEach(lettre => {
            const dx = x - lettre.x;
            const dy = y - lettre.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < this.rayonInfluence) {
                const force = (lettre.intensiteMagnetique * lettre.polarite) / 
                             Math.pow(distance, this.decroissanceForce);
                
                fx += force * dx / distance;
                fy += force * dy / distance;
            }
        });
        
        const magnitude = Math.sqrt(fx * fx + fy * fy);
        return {
            dx: magnitude > 0 ? fx / magnitude : 0,
            dy: magnitude > 0 ? fy / magnitude : 0,
            magnitude
        };
    }

    calculateFieldIntensity(x, y) {
        let intensite = 0;
        
        this.lettres.forEach(lettre => {
            const dx = x - lettre.x;
            const dy = y - lettre.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                intensite += Math.abs(lettre.intensiteMagnetique) / 
                            Math.pow(distance + 1, 1.5);
            }
        });
        
        return Math.min(intensite, 1);
    }

    updateMagneticForces(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        // Cycle de polarité pour créer des inversions dramatiques
        this.cyclePolarite += dt * this.parameters.polarite.default * 0.001;
        const inversionFactor = Math.sin(this.cyclePolarite);
        
        // Interactions entre lettres
        for (let i = 0; i < this.lettres.length; i++) {
            const lettreA = this.lettres[i];
            let forceX = 0, forceY = 0;
            
            // Forces d'attraction/répulsion avec autres lettres
            for (let j = 0; j < this.lettres.length; j++) {
                if (i === j) continue;
                
                const lettreB = this.lettres[j];
                const dx = lettreB.x - lettreA.x;
                const dy = lettreB.y - lettreA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.rayonInfluence * 2) {
                    // Force magnétique avec inversion cyclique
                    const polariteEffective = lettreA.polarite * lettreB.polarite * 
                                            (1 + inversionFactor * 0.3);
                    
                    const forceMag = (this.forceMagnetique * polariteEffective * 
                                     lettreA.intensiteMagnetique * lettreB.intensiteMagnetique) /
                                    Math.pow(distance, 2);
                    
                    forceX -= forceMag * dx / distance;
                    forceY -= forceMag * dy / distance;
                }
            }
            
            // Force de rappel vers position de base
            const rappelX = (lettreA.baseX - lettreA.x) * 0.02;
            const rappelY = (lettreA.baseY - lettreA.y) * 0.02;
            
            forceX += rappelX;
            forceY += rappelY;
            
            // Mise à jour physique
            lettreA.vitesseX += forceX * dt;
            lettreA.vitesseY += forceY * dt;
            
            // Friction
            lettreA.vitesseX *= 0.95;
            lettreA.vitesseY *= 0.95;
            
            // Position
            lettreA.x += lettreA.vitesseX * dt;
            lettreA.y += lettreA.vitesseY * dt;
            
            // Oscillation magnétique
            lettreA.oscillation += lettreA.frequence * dt;
            lettreA.chargeMagnetique = Math.sin(lettreA.oscillation) * 0.5;
            
            // Rotation basée sur le champ magnétique
            const champ = this.calculateMagneticField(lettreA.x, lettreA.y);
            lettreA.rotation += champ.magnitude * dt * 0.1;
            
            // Glow basé sur l'intensité magnétique
            lettreA.glow = Math.abs(lettreA.chargeMagnetique) * lettreA.intensiteMagnetique;
        }
    }

    updateParticules(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.default;
        
        this.particules.forEach(particule => {
            let forceX = 0, forceY = 0;
            
            // Forces magnétiques des lettres
            this.lettres.forEach(lettre => {
                const dx = lettre.x - particule.x;
                const dy = lettre.y - particule.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.rayonInfluence) {
                    const force = (lettre.polarite * particule.charge * 
                                  lettre.intensiteMagnetique * particule.magnetisme) /
                                 Math.pow(distance, 1.8);
                    
                    forceX += force * dx / distance;
                    forceY += force * dy / distance;
                }
            });
            
            // Force de Lorentz (particule en mouvement dans champ magnétique)
            const lorentzX = particule.vy * particule.charge * 0.001;
            const lorentzY = -particule.vx * particule.charge * 0.001;
            
            forceX += lorentzX;
            forceY += lorentzY;
            
            // Mise à jour physique
            particule.vx += (forceX / particule.masse) * dt;
            particule.vy += (forceY / particule.masse) * dt;
            
            // Friction atmosphérique
            particule.vx *= 0.98;
            particule.vy *= 0.98;
            
            // Position
            particule.x += particule.vx * dt;
            particule.y += particule.vy * dt;
            
            // Rebond sur les bords
            if (particule.x < 0 || particule.x > this.canvas.width) {
                particule.vx *= -0.8;
                particule.x = Math.max(0, Math.min(this.canvas.width, particule.x));
            }
            if (particule.y < 0 || particule.y > this.canvas.height) {
                particule.vy *= -0.8;
                particule.y = Math.max(0, Math.min(this.canvas.height, particule.y));
            }
            
            // Animation
            particule.rotation += particule.vitesseRotation * dt;
            particule.pulsation += dt * 0.002;
            particule.energie = 0.5 + 0.5 * Math.sin(particule.pulsation);
            
            // Trail de particule
            particule.trail.push({ x: particule.x, y: particule.y });
            if (particule.trail.length > 8) {
                particule.trail.shift();
            }
        });
    }

    generateMetallicColor() {
        const colors = [
            '#C0C0C0', // Argent
            '#FFD700', // Or
            '#CD7F32', // Bronze
            '#B87333', // Cuivre
            '#708090'  // Acier
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    render(ctx, element, deltaTime) {
        this.temps += deltaTime * this.parameters.vitesse.default;
        
        // Mise à jour des forces magnétiques
        this.updateMagneticForces(deltaTime);
        this.updateParticules(deltaTime);
        
        // Rendu des lignes de champ magnétique
        this.renderFieldLines(ctx);
        
        // Rendu des particules métalliques
        this.renderParticules(ctx);
        
        // Rendu des lettres magnétiques
        this.renderLettres(ctx);
        
        // Effets atmosphériques
        this.renderAtmosphere(ctx);
    }

    renderFieldLines(ctx) {
        ctx.save();
        
        this.lignesChamp.forEach((ligne, index) => {
            if (!ligne.visible) return;
            
            ligne.age += 0.02;
            const visibility = 0.3 + 0.2 * Math.sin(ligne.age);
            
            if (ligne.points.length < 2) return;
            
            // Gradient basé sur l'intensité
            const gradient = ctx.createLinearGradient(
                ligne.points[0].x, ligne.points[0].y,
                ligne.points[ligne.points.length-1].x, ligne.points[ligne.points.length-1].y
            );
            
            gradient.addColorStop(0, `rgba(0, 255, 255, ${visibility * ligne.intensite})`);
            gradient.addColorStop(0.5, `rgba(255, 100, 255, ${visibility * ligne.intensite * 0.7})`);
            gradient.addColorStop(1, `rgba(0, 255, 255, ${visibility * ligne.intensite * 0.3})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5 + ligne.intensite;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(ligne.points[0].x, ligne.points[0].y);
            
            for (let i = 1; i < ligne.points.length; i++) {
                const point = ligne.points[i];
                const ondulation = Math.sin(this.temps * 0.001 + i * 0.1) * 0.5;
                ctx.lineTo(point.x + ondulation, point.y + ondulation);
            }
            
            ctx.stroke();
            
            // Flèches directionnelles
            if (ligne.points.length > 5) {
                const midIndex = Math.floor(ligne.points.length / 2);
                const point = ligne.points[midIndex];
                const nextPoint = ligne.points[midIndex + 1];
                
                if (nextPoint) {
                    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
                    this.drawArrow(ctx, point.x, point.y, angle, ligne.intensite);
                }
            }
        });
        
        ctx.restore();
    }

    drawArrow(ctx, x, y, angle, intensite) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        const size = 3 + intensite * 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${intensite * 0.8})`;
        
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size, size/2);
        ctx.lineTo(-size, -size/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    renderParticules(ctx) {
        ctx.save();
        
        this.particules.forEach(particule => {
            // Trail de la particule
            if (particule.trail.length > 1) {
                ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particule.trail[0].x, particule.trail[0].y);
                
                for (let i = 1; i < particule.trail.length; i++) {
                    const alpha = i / particule.trail.length;
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.lineTo(particule.trail[i].x, particule.trail[i].y);
                }
                
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            
            // Particule principale
            ctx.save();
            ctx.translate(particule.x, particule.y);
            ctx.rotate(particule.rotation);
            
            // Glow électromagnétique
            const glowSize = particule.taille * (2 + particule.energie);
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            gradient.addColorStop(0, particule.couleur);
            gradient.addColorStop(0.7, `${particule.couleur}66`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Corps de la particule
            ctx.fillStyle = particule.couleur;
            ctx.beginPath();
            ctx.arc(0, 0, particule.taille, 0, Math.PI * 2);
            ctx.fill();
            
            // Indication de charge
            if (Math.abs(particule.charge) > 0.8) {
                ctx.strokeStyle = particule.charge > 0 ? '#ff4444' : '#4444ff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, particule.taille + 2, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    renderLettres(ctx) {
        ctx.save();
        
        this.lettres.forEach(lettre => {
            ctx.save();
            ctx.translate(lettre.x, lettre.y);
            ctx.rotate(lettre.rotation);
            
            // Aura magnétique
            const auraSize = 30 + lettre.glow * 20;
            const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
            
            const couleurPolarite = lettre.polarite > 0 ? 
                'rgba(255, 100, 100, ' : 'rgba(100, 100, 255, ';
            
            auraGradient.addColorStop(0, couleurPolarite + (lettre.glow * 0.3) + ')');
            auraGradient.addColorStop(0.6, couleurPolarite + (lettre.glow * 0.1) + ')');
            auraGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Lignes de force locales
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                const length = 15 + lettre.glow * 10;
                const x1 = Math.cos(angle) * length;
                const y1 = Math.sin(angle) * length;
                const x2 = Math.cos(angle) * (length + 8);
                const y2 = Math.sin(angle) * (length + 8);
                
                ctx.strokeStyle = couleurPolarite + (lettre.glow * 0.6) + ')';
                ctx.lineWidth = 1 + lettre.glow;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            // Texte de la lettre
            const fontSize = lettre.height * (0.8 + lettre.glow * 0.2);
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Glow du texte
            ctx.shadowColor = this.parameters.couleur.default;
            ctx.shadowBlur = 10 + lettre.glow * 20;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(lettre.char, 0, 0);
            
            // Indicateur de polarité
            const symbole = lettre.polarite > 0 ? 'N' : 'S';
            ctx.font = `${fontSize * 0.3}px Arial`;
            ctx.shadowBlur = 5;
            ctx.fillStyle = lettre.polarite > 0 ? '#ff6666' : '#6666ff';
            ctx.fillText(symbole, 0, -fontSize * 0.6);
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    renderAtmosphere(ctx) {
        // Effet de distorsion électromagnétique
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.1;
        
        const gradient = ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height)
        );
        
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 255, 0.05)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.restore();
    }

    update(deltaTime) {
        // Mise à jour continue des paramètres
        this.forceMagnetique = this.parameters.intensite.default * 1.5;
        
        // Régénération périodique des lignes de champ
        if (this.temps % 2000 < deltaTime) {
            this.generateFieldLines();
        }
    }

    destroy() {
        // Nettoyage des ressources
        this.lettres = [];
        this.particules = [];
        this.lignesChamp = [];
        this.forcesMagnetiques.clear();
        this.particulesPool = [];
        this.lignesPool = [];
    }
}