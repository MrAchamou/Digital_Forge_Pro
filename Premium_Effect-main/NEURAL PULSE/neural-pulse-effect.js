class NeuralPulseEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'synaptic-network-pulse-012',
            name: 'Réseau Synaptique Pulsant',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1.2 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.7 },
                couleur: { type: 'color', default: '#00ffff' },
                densite: { type: 'range', min: 0.2, max: 1, default: 0.6 },
                activite: { type: 'range', min: 0.1, max: 2, default: 0.8 }
            }
        });

        // Variables privées de l'effet
        this.temps = 0;
        this.neurones = [];
        this.connexions = [];
        this.impulsions = [];
        this.zones_activite = [];
        this.lettres_positions = [];
        
        // Pool d'objets pour optimisation
        this.impulsion_pool = [];
        this.connexion_pool = [];
        
        // État du réseau
        this.derniere_vague = 0;
        this.cycle_activite = 0;
        this.pattern_neural = 0;
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Initialiser les positions des lettres
        this.calculer_positions_lettres();
        
        // Créer le réseau de neurones
        this.creer_reseau_neural();
        
        // Initialiser les zones d'activité
        this.initialiser_zones_activite();
        
        // Pré-charger le pool d'objets
        this.precharger_pools();
    }

    calculer_positions_lettres() {
        const texte = this.element.content || 'NEURAL';
        const largeur_totale = this.element.width;
        const hauteur = this.element.height;
        const espacement = largeur_totale / Math.max(texte.length - 1, 1);
        
        this.lettres_positions = [];
        
        for (let i = 0; i < texte.length; i++) {
            this.lettres_positions.push({
                x: this.element.x + (i * espacement),
                y: this.element.y + hauteur / 2,
                lettre: texte[i],
                activite: 0,
                derniere_impulsion: 0
            });
        }
    }

    creer_reseau_neural() {
        this.neurones = [];
        this.connexions = [];
        
        const nb_neurones_extra = Math.floor(this.lettres_positions.length * 2.5);
        
        // Neurones sur les lettres (neurones principaux)
        this.lettres_positions.forEach((pos, index) => {
            this.neurones.push({
                x: pos.x,
                y: pos.y,
                type: 'principal',
                activite: 0,
                derniere_activation: 0,
                connexions: [],
                index_lettre: index,
                potentiel: Math.random()
            });
        });
        
        // Neurones satellites autour du texte
        for (let i = 0; i < nb_neurones_extra; i++) {
            const angle = (i / nb_neurones_extra) * Math.PI * 2;
            const rayon = 60 + Math.random() * 40;
            const centre_x = this.element.x + this.element.width / 2;
            const centre_y = this.element.y + this.element.height / 2;
            
            this.neurones.push({
                x: centre_x + Math.cos(angle) * rayon,
                y: centre_y + Math.sin(angle) * rayon,
                type: 'satellite',
                activite: 0,
                derniere_activation: 0,
                connexions: [],
                potentiel: Math.random(),
                derive_x: (Math.random() - 0.5) * 0.3,
                derive_y: (Math.random() - 0.5) * 0.3
            });
        }
        
        // Créer les connexions synaptiques
        this.creer_connexions_synaptiques();
    }

    creer_connexions_synaptiques() {
        const seuil_distance = 120;
        
        for (let i = 0; i < this.neurones.length; i++) {
            for (let j = i + 1; j < this.neurones.length; j++) {
                const neurone_a = this.neurones[i];
                const neurone_b = this.neurones[j];
                
                const distance = Math.sqrt(
                    Math.pow(neurone_a.x - neurone_b.x, 2) + 
                    Math.pow(neurone_a.y - neurone_b.y, 2)
                );
                
                if (distance < seuil_distance) {
                    const force = 1 - (distance / seuil_distance);
                    const connexion = {
                        neurone_a: i,
                        neurone_b: j,
                        force: force,
                        activite: 0,
                        derniere_impulsion: 0,
                        distance: distance,
                        visible: Math.random() > 0.3
                    };
                    
                    this.connexions.push(connexion);
                    neurone_a.connexions.push(connexion);
                    neurone_b.connexions.push(connexion);
                }
            }
        }
    }

    initialiser_zones_activite() {
        this.zones_activite = [];
        
        for (let i = 0; i < 3; i++) {
            this.zones_activite.push({
                x: this.element.x + Math.random() * this.element.width,
                y: this.element.y + Math.random() * this.element.height,
                rayon: 40 + Math.random() * 60,
                intensite: 0.3 + Math.random() * 0.7,
                vitesse_x: (Math.random() - 0.5) * 20,
                vitesse_y: (Math.random() - 0.5) * 20,
                phase: Math.random() * Math.PI * 2,
                duree_vie: 3000 + Math.random() * 2000
            });
        }
    }

    precharger_pools() {
        // Pool d'impulsions
        for (let i = 0; i < 50; i++) {
            this.impulsion_pool.push({
                actif: false,
                x: 0, y: 0,
                cible_x: 0, cible_y: 0,
                progress: 0,
                vitesse: 1,
                intensite: 1,
                couleur: '#00ffff',
                trail: []
            });
        }
    }

    obtenir_impulsion() {
        for (let impulsion of this.impulsion_pool) {
            if (!impulsion.actif) {
                impulsion.actif = true;
                impulsion.progress = 0;
                impulsion.trail = [];
                return impulsion;
            }
        }
        return null;
    }

    update(deltaTime) {
        const dt = deltaTime * this.parameters.vitesse.value;
        this.temps += dt;
        this.cycle_activite += dt * 0.001;
        
        // Mettre à jour les zones d'activité
        this.mettre_a_jour_zones_activite(dt);
        
        // Simulation de l'activité neuronale
        this.simuler_activite_neuronale(dt);
        
        // Propagation des impulsions
        this.propager_impulsions(dt);
        
        // Générer nouvelles impulsions
        this.generer_impulsions(dt);
        
        // Mettre à jour les connexions
        this.mettre_a_jour_connexions(dt);
    }

    mettre_a_jour_zones_activite(dt) {
        this.zones_activite.forEach((zone, index) => {
            // Mouvement organique
            zone.phase += dt * 0.002;
            zone.x += Math.sin(zone.phase) * zone.vitesse_x * dt * 0.01;
            zone.y += Math.cos(zone.phase * 1.3) * zone.vitesse_y * dt * 0.01;
            
            // Garder dans les limites
            zone.x = Math.max(this.element.x - 50, Math.min(this.element.x + this.element.width + 50, zone.x));
            zone.y = Math.max(this.element.y - 50, Math.min(this.element.y + this.element.height + 50, zone.y));
            
            // Pulsation d'intensité
            zone.intensite = 0.3 + 0.4 * (1 + Math.sin(this.temps * 0.003 + index)) / 2;
            
            // Renouvellement des zones
            zone.duree_vie -= dt;
            if (zone.duree_vie <= 0) {
                zone.x = this.element.x + Math.random() * this.element.width;
                zone.y = this.element.y + Math.random() * this.element.height;
                zone.duree_vie = 3000 + Math.random() * 2000;
                zone.vitesse_x = (Math.random() - 0.5) * 20;
                zone.vitesse_y = (Math.random() - 0.5) * 20;
            }
        });
    }

    simuler_activite_neuronale(dt) {
        this.neurones.forEach((neurone, index) => {
            // Influence des zones d'activité
            let influence_externe = 0;
            this.zones_activite.forEach(zone => {
                const distance = Math.sqrt(
                    Math.pow(neurone.x - zone.x, 2) + 
                    Math.pow(neurone.y - zone.y, 2)
                );
                if (distance < zone.rayon) {
                    influence_externe += zone.intensite * (1 - distance / zone.rayon);
                }
            });
            
            // Potentiel du neurone
            neurone.potentiel += (influence_externe * 0.5 + Math.random() * 0.1 - 0.05) * dt * 0.01;
            neurone.potentiel = Math.max(0, Math.min(1, neurone.potentiel));
            
            // Décharge si seuil atteint
            if (neurone.potentiel > 0.7 && this.temps - neurone.derniere_activation > 100) {
                neurone.activite = 1;
                neurone.derniere_activation = this.temps;
                neurone.potentiel = 0.2;
                
                // Propager aux connexions
                this.propager_depuis_neurone(index);
            }
            
            // Décroissance de l'activité
            neurone.activite *= Math.pow(0.95, dt * 0.1);
            
            // Mouvement subtil des neurones satellites
            if (neurone.type === 'satellite') {
                neurone.x += neurone.derive_x * dt * 0.01;
                neurone.y += neurone.derive_y * dt * 0.01;
            }
        });
    }

    propager_depuis_neurone(index_neurone) {
        const neurone = this.neurones[index_neurone];
        
        neurone.connexions.forEach(connexion => {
            if (Math.random() < connexion.force * this.parameters.activite.value) {
                const impulsion = this.obtenir_impulsion();
                if (impulsion) {
                    const cible_index = connexion.neurone_a === index_neurone ? 
                                      connexion.neurone_b : connexion.neurone_a;
                    const cible = this.neurones[cible_index];
                    
                    impulsion.x = neurone.x;
                    impulsion.y = neurone.y;
                    impulsion.cible_x = cible.x;
                    impulsion.cible_y = cible.y;
                    impulsion.vitesse = 0.8 + Math.random() * 0.4;
                    impulsion.intensite = connexion.force;
                    impulsion.couleur = this.parameters.couleur.value;
                }
                
                connexion.activite = 1;
                connexion.derniere_impulsion = this.temps;
            }
        });
    }

    generer_impulsions(dt) {
        // Vagues d'activité périodiques
        if (this.temps - this.derniere_vague > 1500 + Math.random() * 1000) {
            this.derniere_vague = this.temps;
            
            // Choisir un neurone source aléatoire
            const source_index = Math.floor(Math.random() * this.neurones.length);
            this.neurones[source_index].potentiel = 0.8;
        }
    }

    propager_impulsions(dt) {
        this.impulsion_pool.forEach(impulsion => {
            if (!impulsion.actif) return;
            
            impulsion.progress += impulsion.vitesse * dt * 0.002;
            
            if (impulsion.progress >= 1) {
                impulsion.actif = false;
                return;
            }
            
            // Position interpolée avec easing
            const t = this.easeInOutCubic(impulsion.progress);
            impulsion.x = impulsion.x + (impulsion.cible_x - impulsion.x) * t * 0.1;
            impulsion.y = impulsion.y + (impulsion.cible_y - impulsion.y) * t * 0.1;
            
            // Trail pour effet de traînée
            impulsion.trail.push({x: impulsion.x, y: impulsion.y});
            if (impulsion.trail.length > 8) {
                impulsion.trail.shift();
            }
        });
    }

    mettre_a_jour_connexions(dt) {
        this.connexions.forEach(connexion => {
            connexion.activite *= Math.pow(0.98, dt * 0.1);
            
            // Visibilité dynamique des connexions
            if (Math.random() < 0.002 * dt) {
                connexion.visible = !connexion.visible;
            }
        });
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        
        // Dessiner les connexions synaptiques
        this.dessiner_connexions(ctx);
        
        // Dessiner les zones d'activité
        this.dessiner_zones_activite(ctx);
        
        // Dessiner les impulsions
        this.dessiner_impulsions(ctx);
        
        // Dessiner les neurones
        this.dessiner_neurones(ctx);
        
        // Dessiner le texte avec effet neural
        this.dessiner_texte_neural(ctx);
        
        ctx.restore();
    }

    dessiner_connexions(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.connexions.forEach(connexion => {
            if (!connexion.visible || connexion.activite < 0.1) return;
            
            const neurone_a = this.neurones[connexion.neurone_a];
            const neurone_b = this.neurones[connexion.neurone_b];
            
            const alpha = connexion.activite * this.parameters.intensite.value * 0.6;
            const couleur = this.hexToRgb(this.parameters.couleur.value);
            
            ctx.strokeStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`;
            ctx.lineWidth = 1 + connexion.force * 2;
            
            // Ligne avec variation organique
            ctx.beginPath();
            ctx.moveTo(neurone_a.x, neurone_a.y);
            
            const mid_x = (neurone_a.x + neurone_b.x) / 2 + Math.sin(this.temps * 0.005 + connexion.distance) * 3;
            const mid_y = (neurone_a.y + neurone_b.y) / 2 + Math.cos(this.temps * 0.007 + connexion.distance) * 3;
            
            ctx.quadraticCurveTo(mid_x, mid_y, neurone_b.x, neurone_b.y);
            ctx.stroke();
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    dessiner_zones_activite(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.zones_activite.forEach(zone => {
            const couleur = this.hexToRgb(this.parameters.couleur.value);
            const alpha = zone.intensite * 0.1;
            
            const gradient = ctx.createRadialGradient(
                zone.x, zone.y, 0,
                zone.x, zone.y, zone.rayon
            );
            gradient.addColorStop(0, `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.rayon, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    dessiner_impulsions(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.impulsion_pool.forEach(impulsion => {
            if (!impulsion.actif) return;
            
            const couleur = this.hexToRgb(impulsion.couleur);
            const alpha = (1 - impulsion.progress) * impulsion.intensite;
            
            // Trail de l'impulsion
            impulsion.trail.forEach((point, index) => {
                const trail_alpha = alpha * (index / impulsion.trail.length) * 0.5;
                const rayon = 2 + (index / impulsion.trail.length) * 3;
                
                ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${trail_alpha})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, rayon, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Impulsion principale
            ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`;
            ctx.shadowColor = impulsion.couleur;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(impulsion.x, impulsion.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    dessiner_neurones(ctx) {
        ctx.globalCompositeOperation = 'screen';
        
        this.neurones.forEach(neurone => {
            if (neurone.activite < 0.1) return;
            
            const couleur = this.hexToRgb(this.parameters.couleur.value);
            const alpha = neurone.activite * this.parameters.intensite.value;
            const rayon = neurone.type === 'principal' ? 4 : 2;
            
            ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`;
            ctx.shadowColor = this.parameters.couleur.value;
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.arc(neurone.x, neurone.y, rayon, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        });
        
        ctx.globalCompositeOperation = 'source-over';
    }

    dessiner_texte_neural(ctx) {
        const texte = this.element.content || 'NEURAL';
        const taille_police = this.element.height * 0.6;
        
        ctx.font = `bold ${taille_police}px Arial`;
        ctx.textAlign = 'center';
        
        // Effet de pulsation globale
        const pulsation = 1 + Math.sin(this.temps * 0.003) * 0.1;
        
        texte.split('').forEach((lettre, index) => {
            if (index >= this.lettres_positions.length) return;
            
            const pos = this.lettres_positions[index];
            const neurone = this.neurones[index];
            
            // Couleur basée sur l'activité neuronale
            const activite_lettre = neurone ? neurone.activite : 0;
            const couleur = this.hexToRgb(this.parameters.couleur.value);
            
            // Effet de lueur
            ctx.shadowColor = this.parameters.couleur.value;
            ctx.shadowBlur = 15 + activite_lettre * 20;
            
            // Couleur avec intensité variable
            const alpha = 0.8 + activite_lettre * 0.2;
            ctx.fillStyle = `rgba(${couleur.r}, ${couleur.g}, ${couleur.b}, ${alpha})`;
            
            // Position avec micro-tremblements lors d'activité
            const shake_x = activite_lettre * (Math.random() - 0.5) * 2;
            const shake_y = activite_lettre * (Math.random() - 0.5) * 2;
            
            ctx.save();
            ctx.translate(pos.x + shake_x, pos.y + shake_y);
            ctx.scale(pulsation + activite_lettre * 0.1, pulsation + activite_lettre * 0.1);
            ctx.fillText(lettre, 0, 0);
            ctx.restore();
        });
        
        ctx.shadowBlur = 0;
    }

    // Fonctions utilitaires
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 255, b: 255};
    }

    destroy() {
        this.neurones = [];
        this.connexions = [];
        this.impulsions = [];
        this.zones_activite = [];
        this.lettres_positions = [];
        this.impulsion_pool = [];
        this.connexion_pool = [];
    }
}