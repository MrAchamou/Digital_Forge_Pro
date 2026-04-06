class GravityReverseEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'inverted-gravitational-field-056',
            name: 'Inversion Gravitationnelle Sélective',
            category: 'image',
            version: '1.0',
            performance: 'medium',
            parameters: {
                intensiteGravite: { type: 'range', min: 0.1, max: 2.0, default: 1.0 },
                nombreZones: { type: 'range', min: 2, max: 8, default: 4 },
                vitesseTransition: { type: 'range', min: 0.5, max: 3.0, default: 1.5 },
                densiteParticules: { type: 'range', min: 20, max: 200, default: 80 },
                courbureEspace: { type: 'range', min: 0.2, max: 1.5, default: 0.8 },
                couleurChamp: { type: 'color', default: '#4a90e2' }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.zones = [];
        this.particules = [];
        this.grille = [];
        this.distorsions = [];
        this.transitionPhase = 0;
        
        // Pool d'objets pour optimisation
        this.particulesPool = [];
        this.maxParticules = 300;
        
        // Configuration physique
        this.graviteNormale = 0.3;
        this.graviteInverse = -0.3;
        this.friction = 0.98;
        this.elasticite = 0.7;
        
        // Initialisation des zones gravitationnelles
        this.initZonesGravitationnelles();
        this.initParticulePool();
        this.initGrilleDistorsion();
    }

    initZonesGravitationnelles() {
        this.zones = [];
        const nombreZones = this.config.parameters.nombreZones.default;
        
        for (let i = 0; i < nombreZones; i++) {
            this.zones.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                rayon: 80 + Math.random() * 120,
                force: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 1.5),
                phase: Math.random() * Math.PI * 2,
                vitessePhase: 0.01 + Math.random() * 0.03,
                type: Math.random() > 0.3 ? 'inverse' : 'normale',
                intensite: 0.3 + Math.random() * 0.7,
                pulsation: Math.random() * 0.02 + 0.01
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
                masse: 1, charge: 1
            });
        }
    }

    initGrilleDistorsion() {
        this.grille = [];
        const resolution = 20;
        for (let x = 0; x <= 800; x += resolution) {
            for (let y = 0; y <= 600; y += resolution) {
                this.grille.push({
                    x: x, y: y,
                    origX: x, origY: y,
                    offsetX: 0, offsetY: 0,
                    intensite: 0
                });
            }
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

    creerParticuleIndicatrice(x, y, zone) {
        const particule = this.obtenirParticuleDuPool();
        if (!particule) return;

        particule.x = x;
        particule.y = y;
        particule.vx = (Math.random() - 0.5) * 2;
        particule.vy = (Math.random() - 0.5) * 2;
        particule.taille = 1 + Math.random() * 3;
        particule.alpha = 0.8;
        particule.vie = 0;
        particule.vieMax = 60 + Math.random() * 120;
        particule.masse = 0.5 + Math.random() * 1.5;
        particule.charge = zone.type === 'inverse' ? -1 : 1;
        
        // Couleur basée sur le type de zone
        if (zone.type === 'inverse') {
            particule.couleur = `hsl(${240 + Math.random() * 60}, 70%, 60%)`;
        } else {
            particule.couleur = `hsl(${30 + Math.random() * 60}, 70%, 60%)`;
        }
    }

    calculerForceGravitationnelle(x, y) {
        let forceX = 0;
        let forceY = 0;
        let intensiteMax = 0;

        for (let zone of this.zones) {
            const dx = x - zone.x;
            const dy = y - zone.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < zone.rayon) {
                const facteurDistance = 1 - (distance / zone.rayon);
                const intensite = zone.intensite * facteurDistance;
                intensiteMax = Math.max(intensiteMax, intensite);
                
                const angle = Math.atan2(dy, dx);
                const force = zone.force * intensite * this.config.parameters.intensiteGravite.default;
                
                if (zone.type === 'inverse') {
                    forceX += Math.cos(angle) * force * -1;
                    forceY += Math.sin(angle) * force * -1;
                } else {
                    forceX += Math.cos(angle) * force;
                    forceY += Math.sin(angle) * force;
                }
            }
        }

        return { forceX, forceY, intensite: intensiteMax };
    }

    mettreAJourDistorsions() {
        for (let point of this.grille) {
            const force = this.calculerForceGravitationnelle(point.origX, point.origY);
            
            // Courbure de l'espace-temps basée sur la force gravitationnelle
            const courbure = force.intensite * this.config.parameters.courbureEspace.default;
            point.offsetX = Math.sin(this.temps * 0.01 + point.origX * 0.01) * courbure * 10;
            point.offsetY = Math.cos(this.temps * 0.01 + point.origY * 0.01) * courbure * 10;
            
            point.x = point.origX + point.offsetX;
            point.y = point.origY + point.offsetY;
            point.intensite = force.intensite;
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        this.ctx = canvas.getContext('2d');
        
        // Générer des particules initiales
        const densite = this.config.parameters.densiteParticules.default;
        for (let i = 0; i < densite; i++) {
            if (Math.random() > 0.7) {
                const zoneIndex = Math.floor(Math.random() * this.zones.length);
                const zone = this.zones[zoneIndex];
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * zone.rayon;
                const x = zone.x + Math.cos(angle) * distance;
                const y = zone.y + Math.sin(angle) * distance;
                
                this.creerParticuleIndicatrice(x, y, zone);
            }
        }
    }

    dessinerChampsGravitationnels(ctx) {
        ctx.save();
        
        for (let zone of this.zones) {
            // Mise à jour de la phase
            zone.phase += zone.vitessePhase;
            const pulsation = Math.sin(zone.phase) * 0.3 + 0.7;
            
            // Gradient radial pour visualiser le champ
            const gradient = ctx.createRadialGradient(
                zone.x, zone.y, 0,
                zone.x, zone.y, zone.rayon * pulsation
            );
            
            if (zone.type === 'inverse') {
                gradient.addColorStop(0, 'rgba(74, 144, 226, 0.4)');
                gradient.addColorStop(0.5, 'rgba(74, 144, 226, 0.2)');
                gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(226, 144, 74, 0.4)');
                gradient.addColorStop(0.5, 'rgba(226, 144, 74, 0.2)');
                gradient.addColorStop(1, 'rgba(226, 144, 74, 0)');
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.rayon * pulsation, 0, Math.PI * 2);
            ctx.fill();
            
            // Cercle de bordure pulsant
            ctx.strokeStyle = zone.type === 'inverse' ? 
                `rgba(74, 144, 226, ${0.6 * pulsation})` : 
                `rgba(226, 144, 74, ${0.6 * pulsation})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.rayon * pulsation * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    dessinerGrilleDistordue(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Lignes horizontales
        for (let y = 0; y <= 600; y += 20) {
            ctx.beginPath();
            let premierPoint = true;
            
            for (let x = 0; x <= 800; x += 20) {
                const point = this.grille.find(p => p.origX === x && p.origY === y);
                if (point) {
                    if (premierPoint) {
                        ctx.moveTo(point.x, point.y);
                        premierPoint = false;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }
            ctx.stroke();
        }
        
        // Lignes verticales
        for (let x = 0; x <= 800; x += 20) {
            ctx.beginPath();
            let premierPoint = true;
            
            for (let y = 0; y <= 600; y += 20) {
                const point = this.grille.find(p => p.origX === x && p.origY === y);
                if (point) {
                    if (premierPoint) {
                        ctx.moveTo(point.x, point.y);
                        premierPoint = false;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }
            ctx.stroke();
        }
        
        ctx.restore();
    }

    dessinerParticules(ctx) {
        ctx.save();
        
        for (let particule of this.particulesPool) {
            if (!particule.actif) continue;
            
            const alpha = particule.alpha * (1 - particule.vie / particule.vieMax);
            if (alpha <= 0) continue;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particule.couleur;
            
            // Effet de traînée
            ctx.save();
            ctx.translate(particule.x, particule.y);
            
            // Particule principale
            ctx.beginPath();
            ctx.arc(0, 0, particule.taille, 0, Math.PI * 2);
            ctx.fill();
            
            // Traînée basée sur la vitesse
            const vitesse = Math.sqrt(particule.vx * particule.vx + particule.vy * particule.vy);
            if (vitesse > 1) {
                const longueurTrainee = Math.min(vitesse * 3, 15);
                const angle = Math.atan2(particule.vy, particule.vx);
                
                ctx.globalAlpha = alpha * 0.3;
                ctx.strokeStyle = particule.couleur;
                ctx.lineWidth = particule.taille * 0.5;
                ctx.beginPath();
                ctx.moveTo(-Math.cos(angle) * longueurTrainee, -Math.sin(angle) * longueurTrainee);
                ctx.lineTo(0, 0);
                ctx.stroke();
            }
            
            ctx.restore();
        }
        
        ctx.restore();
    }

    appliquerDistorsionImage(ctx, element) {
        if (!element || !element.content) return;
        
        ctx.save();
        
        // Créer une version distordue de l'image
        const segments = 10;
        const largeurSegment = element.width / segments;
        const hauteurSegment = element.height / segments;
        
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const x = element.x + i * largeurSegment;
                const y = element.y + j * hauteurSegment;
                
                const force = this.calculerForceGravitationnelle(x + largeurSegment/2, y + hauteurSegment/2);
                const distorsion = force.intensite * 20;
                
                ctx.save();
                ctx.translate(x + largeurSegment/2, y + hauteurSegment/2);
                ctx.rotate(force.intensite * 0.1 * Math.sin(this.temps * 0.01));
                ctx.scale(1 + force.intensite * 0.2, 1 + force.intensite * 0.2);
                
                // Simuler le rendu d'un segment d'image
                ctx.fillStyle = `hsl(${200 + force.intensite * 60}, 50%, ${50 + force.intensite * 30}%)`;
                ctx.globalAlpha = 0.7;
                ctx.fillRect(-largeurSegment/2, -hauteurSegment/2, largeurSegment, hauteurSegment);
                
                ctx.restore();
            }
        }
        
        ctx.restore();
    }

    update(deltaTime) {
        this.temps += deltaTime;
        this.transitionPhase += deltaTime * this.config.parameters.vitesseTransition.default * 0.01;
        
        // Mise à jour des zones gravitationnelles
        for (let zone of this.zones) {
            zone.x += Math.sin(this.temps * zone.pulsation) * 0.5;
            zone.y += Math.cos(this.temps * zone.pulsation * 1.1) * 0.3;
            
            // Changement occasionnel de type
            if (Math.random() < 0.002) {
                zone.type = zone.type === 'inverse' ? 'normale' : 'inverse';
            }
        }
        
        // Mise à jour des particules
        for (let particule of this.particulesPool) {
            if (!particule.actif) continue;
            
            particule.vie += deltaTime;
            if (particule.vie >= particule.vieMax) {
                particule.actif = false;
                continue;
            }
            
            // Application des forces gravitationnelles
            const force = this.calculerForceGravitationnelle(particule.x, particule.y);
            particule.vx += force.forceX * particule.charge * deltaTime * 0.01;
            particule.vy += force.forceY * particule.charge * deltaTime * 0.01;
            
            // Friction
            particule.vx *= this.friction;
            particule.vy *= this.friction;
            
            // Mise à jour position
            particule.x += particule.vx * deltaTime * 0.1;
            particule.y += particule.vy * deltaTime * 0.1;
            
            // Rebonds sur les bords
            if (particule.x < 0 || particule.x > 800) {
                particule.vx *= -this.elasticite;
                particule.x = Math.max(0, Math.min(800, particule.x));
            }
            if (particule.y < 0 || particule.y > 600) {
                particule.vy *= -this.elasticite;
                particule.y = Math.max(0, Math.min(600, particule.y));
            }
        }
        
        // Génération occasionnelle de nouvelles particules
        if (Math.random() < 0.1) {
            const zone = this.zones[Math.floor(Math.random() * this.zones.length)];
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * zone.rayon;
            const x = zone.x + Math.cos(angle) * distance;
            const y = zone.y + Math.sin(angle) * distance;
            
            this.creerParticuleIndicatrice(x, y, zone);
        }
        
        this.mettreAJourDistorsions();
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Fond avec gradient subtil
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, 'rgba(10, 10, 30, 0.1)');
        gradient.addColorStop(1, 'rgba(30, 10, 50, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Grille de l'espace-temps distordue (optionnelle, très subtile)
        this.dessinerGrilleDistordue(ctx);
        
        // Application de la distorsion à l'image
        this.appliquerDistorsionImage(ctx, element);
        
        // Champs gravitationnels visuels
        this.dessinerChampsGravitationnels(ctx);
        
        // Particules indicatrices
        this.dessinerParticules(ctx);
        
        // Effet de transition global
        const pulse = Math.sin(this.temps * 0.005) * 0.1 + 0.9;
        ctx.globalAlpha = pulse;
        
        ctx.restore();
    }

    destroy() {
        this.zones = [];
        this.particules = [];
        this.grille = [];
        this.distorsions = [];
        this.particulesPool = [];
        this.canvas = null;
        this.element = null;
        this.ctx = null;
    }
}