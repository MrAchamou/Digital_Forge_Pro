class WaveDistortionEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'fluid-wave-deformation-013',
            name: 'Distorsion Ondulatoire Fluide',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.5 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                couleur: { type: 'color', default: '#0088ff' },
                complexite: { type: 'range', min: 0.2, max: 1, default: 0.7 },
                refraction: { type: 'range', min: 0, max: 1, default: 0.6 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.vagues = [];
        this.points_interference = [];
        this.gradients_cache = new Map();
        
        // Configuration des vagues multiples
        this.nb_vagues = 5;
        this.frequences_base = [0.002, 0.0035, 0.0018, 0.0042, 0.0028];
        this.amplitudes_base = [0.3, 0.25, 0.4, 0.2, 0.35];
        this.directions = [0, Math.PI * 0.3, Math.PI * 0.7, Math.PI * 1.2, Math.PI * 1.8];
        
        // Système de réfraction
        this.indices_refraction = [];
        this.spectre_couleurs = [];
        
        // Cache pour optimisation
        this.cache_distorsion = new Float32Array(800 * 600);
        this.derniere_maj_cache = 0;
        
        // État des interférences
        this.points_convergence = [];
        this.explosions_visuelles = [];
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Initialiser les vagues
        this.initialiser_vagues();
        
        // Créer le spectre de réfraction
        this.creer_spectre_refraction();
        
        // Initialiser les points de convergence
        this.initialiser_points_convergence();
        
        // Pré-calculer les gradients
        this.precalculer_gradients();
    }

    initialiser_vagues() {
        this.vagues = [];
        
        for (let i = 0; i < this.nb_vagues; i++) {
            this.vagues.push({
                frequence: this.frequences_base[i],
                amplitude: this.amplitudes_base[i],
                direction: this.directions[i],
                phase: Math.random() * Math.PI * 2,
                vitesse: 0.8 + Math.random() * 0.4,
                longueur_onde: 40 + Math.random() * 60,
                type: i % 2 === 0 ? 'sin' : 'cos',
                modulation: Math.random() * 0.3 + 0.7,
                derive_frequence: (Math.random() - 0.5) * 0.0001,
                derive_amplitude: (Math.random() - 0.5) * 0.05
            });
        }
    }

    creer_spectre_refraction() {
        this.spectre_couleurs = [];
        
        // Créer un spectre de couleurs pour l'effet arc-en-ciel
        for (let i = 0; i < 7; i++) {
            const hue = (i / 7) * 360;
            this.spectre_couleurs.push({
                hue: hue,
                saturation: 70 + Math.random() * 30,
                lightness: 50 + Math.random() * 20,
                indice: 1.3 + Math.random() * 0.4
            });
        }
        
        // Indices de réfraction pour différentes longueurs d'onde
        this.indices_refraction = this.spectre_couleurs.map(c => c.indice);
    }

    initialiser_points_convergence() {
        this.points_convergence = [];
        
        for (let i = 0; i < 3; i++) {
            this.points_convergence.push({
                x: this.element.x + Math.random() * this.element.width,
                y: this.element.y + Math.random() * this.element.height,
                rayon_influence: 80 + Math.random() * 40,
                intensite: 0.5 + Math.random() * 0.5,
                vitesse_x: (Math.random() - 0.5) * 30,
                vitesse_y: (Math.random() - 0.5) * 30,
                phase: Math.random() * Math.PI * 2,
                duree_explosion: 0,
                derniere_explosion: 0
            });
        }
    }

    precalculer_gradients() {
        // Pré-calculer des gradients pour la réfraction
        for (let i = 0; i < this.spectre_couleurs.length; i++) {
            const couleur = this.spectre_couleurs[i];
            const gradient_key = `refraction_${i}`;
            this.gradients_cache.set(gradient_key, couleur);
        }
    }

    update(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.value;
        this.temps += dt;
        
        // Mettre à jour les vagues avec dérive
        this.mettre_a_jour_vagues(dt);
        
        // Calculer les interférences
        this.calculer_interferences();
        
        // Mettre à jour les points de convergence
        this.mettre_a_jour_convergence(dt);
        
        // Détecter et créer les explosions visuelles
        this.detecter_explosions();
        
        // Mettre à jour les explosions existantes
        this.mettre_a_jour_explosions(dt);
        
        // Mise à jour du cache si nécessaire
        if (this.temps - this.derniere_maj_cache > 16) {
            this.mettre_a_jour_cache_distorsion();
            this.derniere_maj_cache = this.temps;
        }
    }

    mettre_a_jour_vagues(dt) {
        this.vagues.forEach((vague, index) => {
            // Évolution de la phase
            vague.phase += vague.frequence * vague.vitesse * dt;
            
            // Dérive organique des paramètres
            vague.frequence += vague.derive_frequence * dt * 0.01;
            vague.amplitude += vague.derive_amplitude * dt * 0.001;
            
            // Oscillation de la direction
            vague.direction += Math.sin(this.temps * 0.0008 + index) * 0.0001 * dt;
            
            // Modulation de l'amplitude
            vague.modulation = 0.7 + 0.3 * Math.sin(this.temps * 0.002 + index * 0.7);
            
            // Limites pour éviter la dérive excessive
            vague.frequence = Math.max(0.001, Math.min(0.01, vague.frequence));
            vague.amplitude = Math.max(0.1, Math.min(0.8, vague.amplitude));
        });
    }

    calculer_interferences() {
        this.points_interference = [];
        
        // Échantillonner des points dans la zone du texte
        const pas = 20;
        for (let x = this.element.x; x < this.element.x + this.element.width; x += pas) {
            for (let y = this.element.y; y < this.element.y + this.element.height; y += pas) {
                let amplitude_totale = 0;
                let phase_resultante = 0;
                
                // Superposition de toutes les vagues
                this.vagues.forEach(vague => {
                    const distance_origine = Math.sqrt(
                        Math.pow(x - this.element.x - this.element.width / 2, 2) +
                        Math.pow(y - this.element.y - this.element.height / 2, 2)
                    );
                    
                    const coord_vague = 
                        (x - this.element.x) * Math.cos(vague.direction) +
                        (y - this.element.y) * Math.sin(vague.direction);
                    
                    const onde = vague.type === 'sin' ? 
                        Math.sin(coord_vague / vague.longueur_onde + vague.phase) :
                        Math.cos(coord_vague / vague.longueur_onde + vague.phase);
                    
                    const amplitude = vague.amplitude * vague.modulation * 
                                    (1 - distance_origine / 200); // Atténuation avec la distance
                    
                    amplitude_totale += amplitude * onde;
                    phase_resultante += vague.phase;
                });
                
                // Ajouter si l'interférence est significative
                if (Math.abs(amplitude_totale) > 0.3) {
                    this.points_interference.push({
                        x: x,
                        y: y,
                        amplitude: amplitude_totale,
                        phase: phase_resultante,
                        type: amplitude_totale > 0 ? 'constructive' : 'destructive'
                    });
                }
            }
        }
    }

    mettre_a_jour_convergence(dt) {
        this.points_convergence.forEach((point, index) => {
            // Mouvement organique
            point.phase += dt * 0.003;
            point.x += Math.sin(point.phase + index) * point.vitesse_x * dt * 0.01;
            point.y += Math.cos(point.phase * 1.2 + index) * point.vitesse_y * dt * 0.01;
            
            // Garder dans les limites étendues
            const marge = 50;
            point.x = Math.max(this.element.x - marge, 
                             Math.min(this.element.x + this.element.width + marge, point.x));
            point.y = Math.max(this.element.y - marge, 
                             Math.min(this.element.y + this.element.height + marge, point.y));
            
            // Pulsation de l'intensité
            point.intensite = 0.3 + 0.4 * (1 + Math.sin(this.temps * 0.004 + index * 2)) / 2;
            
            // Durée d'explosion
            if (point.duree_explosion > 0) {
                point.duree_explosion -= dt;
            }
        });
    }

    detecter_explosions() {
        this.points_convergence.forEach((point, index) => {
            // Calculer l'amplitude combinée des vagues au point de convergence
            let amplitude_locale = 0;
            
            this.vagues.forEach(vague => {
                const coord_vague = 
                    (point.x - this.element.x) * Math.cos(vague.direction) +
                    (point.y - this.element.y) * Math.sin(vague.direction);
                
                const onde = vague.type === 'sin' ? 
                    Math.sin(coord_vague / vague.longueur_onde + vague.phase) :
                    Math.cos(coord_vague / vague.longueur_onde + vague.phase);
                
                amplitude_locale += vague.amplitude * onde;
            });
            
            // Déclencher explosion si seuil dépassé
            if (Math.abs(amplitude_locale) > 1.2 && 
                this.temps - point.derniere_explosion > 1000 &&
                point.duree_explosion <= 0) {
                
                this.explosions_visuelles.push({
                    x: point.x,
                    y: point.y,
                    rayon: 0,
                    rayon_max: 60 + Math.random() * 40,
                    intensite: 1,
                    duree_vie: 800,
                    couleurs_spectre: [...this.spectre_couleurs],
                    type: amplitude_locale > 0 ? 'expansion' : 'implosion'
                });
                
                point.duree_explosion = 500;
                point.derniere_explosion = this.temps;
            }
        });
    }

    mettre_a_jour_explosions(dt) {
        this.explosions_visuelles = this.explosions_visuelles.filter(explosion => {
            explosion.duree_vie -= dt;
            
            if (explosion.duree_vie <= 0) return false;
            
            const progress = 1 - (explosion.duree_vie / 800);
            
            if (explosion.type === 'expansion') {
                explosion.rayon = explosion.rayon_max * this.easeOutElastic(progress);
                explosion.intensite = 1 - progress;
            } else {
                explosion.rayon = explosion.rayon_max * (1 - this.easeInQuart(progress));
                explosion.intensite = 0.8 - progress * 0.6;
            }
            
            return true;
        });
    }

    mettre_a_jour_cache_distorsion() {
        // Mise à jour simplifiée du cache pour optimiser les performances
        const largeur = 800;
        const hauteur = 600;
        
        for (let i = 0; i < largeur * hauteur; i += 10) { // Échantillonnage réduit
            const x = i % largeur;
            const y = Math.floor(i / largeur);
            
            let distorsion = 0;
            this.vagues.forEach(vague => {
                const coord = x * Math.cos(vague.direction) + y * Math.sin(vague.direction);
                distorsion += vague.amplitude * Math.sin(coord / vague.longueur_onde + vague.phase);
            });
            
            this.cache_distorsion[i] = distorsion;
        }
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Dessiner les ondulations de fond
        this.dessiner_ondulations_fond(ctx);
        
        // Dessiner les interférences
        this.dessiner_interferences(ctx);
        
        // Dessiner les explosions visuelles
        this.dessiner_explosions(ctx);
        
        // Dessiner le texte avec distorsion
        this.dessiner_texte_distordu(ctx);
        
        // Ajouter les effets de réfraction
        this.dessiner_effets_refraction(ctx);
        
        ctx.restore();
    }

    dessiner_ondulations_fond(ctx) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.1;
        
        const couleur_base = this.hexToRgb(this.parameters.couleur.value);
        
        // Dessiner les lignes d'onde
        this.vagues.forEach((vague, index) => {
            ctx.strokeStyle = `rgba(${couleur_base.r}, ${couleur_base.g}, ${couleur_base.b}, 0.3)`;
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            
            for (let x = this.element.x - 50; x < this.element.x + this.element.width + 50; x += 5) {
                const coord_vague = x * Math.cos(vague.direction);
                const y_offset = vague.amplitude * 20 * 
                               Math.sin(coord_vague / vague.longueur_onde + vague.phase);
                
                const y = this.element.y + this.element.height / 2 + y_offset;
                
                if (x === this.element.x - 50) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        });
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    dessiner_interferences(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.points_interference.forEach(point => {
            const couleur = this.hexToRgb(this.parameters.couleur.value);
            const alpha = Math.abs(point.amplitude) * this.parameters.intensite.value * 0.3;
            
            if (point.type === 'constructive') {
                ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`;
            } else {
                ctx.fillStyle = `rgba(${255 - couleur.r}, ${255 - couleur.g}, ${255 - couleur.b}, ${alpha})`;
            }
            
            const rayon = Math.abs(point.amplitude) * 8;
            ctx.beginPath();
            ctx.arc(point.x, point.y, rayon, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    dessiner_explosions(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.explosions_visuelles.forEach(explosion => {
            // Dessiner les anneaux de couleur du spectre
            explosion.couleurs_spectre.forEach((couleur_spec, index) => {
                const rayon_anneau = explosion.rayon * (0.7 + index * 0.1);
                const alpha = explosion.intensite * (0.8 - index * 0.1);
                
                const hsl = `hsla(${couleur_spec.hue}, ${couleur_spec.saturation}%, ${couleur_spec.lightness}%, ${alpha})`;
                
                ctx.strokeStyle = hsl;
                ctx.lineWidth = 3 - index * 0.3;
                ctx.beginPath();
                ctx.arc(explosion.x, explosion.y, rayon_anneau, 0, Math.PI * 2);
                ctx.stroke();
            });
            
            // Centre lumineux
            const gradient = ctx.createRadialGradient(
                explosion.x, explosion.y, 0,
                explosion.x, explosion.y, explosion.rayon * 0.3
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${explosion.intensite})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.rayon * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    dessiner_texte_distordu(ctx) {
        const texte = this.element.content || 'WAVE';
        const taille_police = this.element.height * 0.6;
        
        ctx.font = `bold ${taille_police}px Arial`;
        ctx.textAlign = 'center';
        
        const largeur_lettre = this.element.width / Math.max(texte.length, 1);
        
        texte.split('').forEach((lettre, index) => {
            const x_base = this.element.x + (index + 0.5) * largeur_lettre;
            const y_base = this.element.y + this.element.height / 2;
            
            // Calculer la distorsion pour cette position
            let distorsion_x = 0;
            let distorsion_y = 0;
            
            this.vagues.forEach(vague => {
                const coord_x = x_base * Math.cos(vague.direction) + y_base * Math.sin(vague.direction);
                const coord_y = -x_base * Math.sin(vague.direction) + y_base * Math.cos(vague.direction);
                
                const onde_x = Math.sin(coord_x / vague.longueur_onde + vague.phase);
                const onde_y = Math.cos(coord_y / vague.longueur_onde + vague.phase * 1.3);
                
                distorsion_x += vague.amplitude * onde_x * 15 * this.parameters.intensite.value;
                distorsion_y += vague.amplitude * onde_y * 8 * this.parameters.intensite.value;
            });
            
            // Position finale avec distorsion
            const x_final = x_base + distorsion_x;
            const y_final = y_base + distorsion_y;
            
            // Couleur avec effet de réfraction
            const couleur_base = this.hexToRgb(this.parameters.couleur.value);
            const variation_couleur = Math.sin(this.temps * 0.003 + index) * 0.3;
            
            ctx.fillStyle = `rgb(${Math.floor(couleur_base.r * (1 + variation_couleur))}, ${Math.floor(couleur_base.g)}, ${Math.floor(couleur_base.b * (1 - variation_couleur))})`;
            
            // Effet de lueur
            ctx.shadowColor = this.parameters.couleur.value;
            ctx.shadowBlur = 10 + Math.abs(distorsion_x + distorsion_y) * 0.3;
            
            // Rotation basée sur la distorsion
            const rotation = Math.atan2(distorsion_y, distorsion_x) * 0.1;
            
            ctx.save();
            ctx.translate(x_final, y_final);
            ctx.rotate(rotation);
            
            // Échelle basée sur l'amplitude des vagues
            const echelle = 1 + Math.abs(distorsion_x + distorsion_y) * 0.002;
            ctx.scale(echelle, echelle);
            
            ctx.fillText(lettre, 0, 0);
            ctx.restore();
        });
        
        ctx.shadowBlur = 0;
    }

    dessiner_effets_refraction(ctx) {
        if (this.parameters.refraction.value < 0.1) return;
        
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = this.parameters.refraction.value * 0.4;
        
        // Dessiner les prismes de réfraction
        const texte = this.element.content || 'WAVE';
        const largeur_lettre = this.element.width / Math.max(texte.length, 1);
        
        texte.split('').forEach((lettre, index) => {
            const x_centre = this.element.x + (index + 0.5) * largeur_lettre;
            const y_centre = this.element.y + this.element.height / 2;
            
            // Dessiner le spectre décomposé
            this.spectre_couleurs.forEach((couleur_spec, spec_index) => {
                const offset_x = (spec_index - 3) * 2 * this.parameters.refraction.value;
                const offset_y = Math.sin(this.temps * 0.005 + index + spec_index) * 3;
                
                ctx.font = `bold ${this.element.height * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillStyle = `hsla(${couleur_spec.hue}, ${couleur_spec.saturation}%, ${couleur_spec.lightness}%, 0.3)`;
                
                ctx.fillText(lettre, x_centre + offset_x, y_centre + offset_y);
            });
        });
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    // Fonctions utilitaires
    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    easeInQuart(t) {
        return t * t * t * t;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 136, b: 255};
    }

    destroy() {
        this.vagues = [];
        this.points_interference = [];
        this.gradients_cache.clear();
        this.points_convergence = [];
        this.explosions_visuelles = [];
        this.cache_distorsion = null;
        this.indices_refraction = [];
        this.spectre_couleurs = [];
    }
}