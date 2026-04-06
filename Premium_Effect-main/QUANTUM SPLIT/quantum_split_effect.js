class QuantumSplitEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'quantum-superposition-bilocation-054',
            name: 'Superposition Quantique Bilocalisée',
            category: 'image',
            version: '1.0',
            performance: 'high',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                superposition: { type: 'range', min: 0, max: 1, default: 0.7 },
                interference: { type: 'range', min: 0, max: 1, default: 0.8 },
                intrication: { type: 'range', min: 0, max: 1, default: 0.6 },
                instabilite: { type: 'range', min: 0, max: 1, default: 0.5 }
            }
        });

        // Variables quantiques de base
        this.temps = 0;
        this.quantumField = new Array(80).fill().map(() => new Array(60).fill(0));
        this.fieldWidth = 80;
        this.fieldHeight = 60;
        
        // États quantiques des deux versions
        this.quantumStates = [
            {
                id: 'alpha',
                position: { x: 200, y: 200 },
                velocity: { x: 0, y: 0 },
                phase: 0,
                amplitude: 1,
                spin: 1,
                energy: 1,
                coherence: 1,
                waveFunction: [],
                probability: 0.5,
                observable: true,
                entangled: true
            },
            {
                id: 'beta', 
                position: { x: 500, y: 300 },
                velocity: { x: 0, y: 0 },
                phase: Math.PI,
                amplitude: 1,
                spin: -1,
                energy: 1,
                coherence: 1,
                waveFunction: [],
                probability: 0.5,
                observable: true,
                entangled: true
            }
        ];
        
        // Fonction d'onde globale
        this.waveFunction = {
            collapsed: false,
            collapseTimer: 0,
            collapseDuration: 0,
            targetState: null,
            superpositionStrength: 1,
            decoherenceRate: 0.01
        };
        
        // Interférences quantiques
        this.interferencePattern = [];
        this.interferenceNodes = [];
        this.initializeInterference();
        
        // Particules quantiques d'intrication
        this.entanglementParticles = [];
        this.maxEntanglementParticles = 40;
        this.initializeEntanglementParticles();
        
        // Tunneling quantique
        this.tunnelingEvents = [];
        this.tunnelingProbability = 0.005;
        
        // Mesures quantiques (moments d'observation)
        this.measurement = {
            active: false,
            observer: null,
            duration: 0,
            intensity: 0,
            collapsing: false
        };
        
        // Champs d'énergie quantique
        this.energyFields = [
            { x: 0, y: 0, radius: 100, energy: 1, frequency: 0.01, phase: 0 },
            { x: 0, y: 0, radius: 120, energy: -0.8, frequency: 0.013, phase: Math.PI * 0.7 }
        ];
        
        // Fluctuations du vide quantique
        this.vacuumFluctuations = [];
        this.initializeVacuumFluctuations();
        
        // Historique des états pour l'intrication
        this.stateHistory = [];
        this.maxHistoryLength = 60;
        
        // Probabilités de phénomènes quantiques
        this.quantumEvents = {
            tunneling: 0.002,
            collapse: 0.001,
            interference: 0.8,
            decoherence: 0.003,
            measurement: 0.0015
        };
    }

    initializeInterference() {
        // Grille pour les motifs d'interférence
        for (let i = 0; i < 50; i++) {
            this.interferenceNodes.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                phase: Math.random() * Math.PI * 2,
                amplitude: 0.5 + Math.random() * 0.5,
                frequency: 0.01 + Math.random() * 0.02
            });
        }
    }

    initializeEntanglementParticles() {
        for (let i = 0; i < this.maxEntanglementParticles; i++) {
            this.entanglementParticles.push({
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 0, maxLife: 1,
                active: false,
                connectedState: null,
                quantumSpin: Math.random() > 0.5 ? 1 : -1,
                phaseOffset: Math.random() * Math.PI * 2,
                entanglementStrength: 0
            });
        }
    }

    initializeVacuumFluctuations() {
        for (let i = 0; i < 100; i++) {
            this.vacuumFluctuations.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                energy: (Math.random() - 0.5) * 0.1,
                frequency: 0.1 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                lifetime: 0.1 + Math.random() * 0.3
            });
        }
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        // Positionnement initial des états quantiques
        this.quantumStates[0].position.x = element.x - 100;
        this.quantumStates[0].position.y = element.y;
        this.quantumStates[1].position.x = element.x + 100;
        this.quantumStates[1].position.y = element.y;
        
        // Initialisation des fonctions d'onde
        this.updateWaveFunctions();
    }

    updateWaveFunctions() {
        this.quantumStates.forEach(state => {
            state.waveFunction = [];
            
            // Génération de la fonction d'onde gaussienne
            for (let i = 0; i < 50; i++) {
                const x = (i - 25) * 10;
                const amplitude = state.amplitude * Math.exp(-(x * x) / (2 * 30 * 30));
                const phase = state.phase + x * 0.01;
                
                state.waveFunction.push({
                    x: state.position.x + x,
                    real: amplitude * Math.cos(phase),
                    imaginary: amplitude * Math.sin(phase),
                    probability: amplitude * amplitude
                });
            }
        });
    }

    updateQuantumField() {
        const params = this.getParameters();
        
        // Réinitialisation du champ
        for (let i = 0; i < this.fieldHeight; i++) {
            for (let j = 0; j < this.fieldWidth; j++) {
                this.quantumField[j][i] = 0;
            }
        }
        
        // Contribution de chaque état quantique
        this.quantumStates.forEach((state, index) => {
            if (!state.observable) return;
            
            const gridX = Math.floor(state.position.x / 10);
            const gridY = Math.floor(state.position.y / 10);
            
            // Propagation de l'onde
            for (let dx = -15; dx <= 15; dx++) {
                for (let dy = -15; dy <= 15; dy++) {
                    const x = gridX + dx;
                    const y = gridY + dy;
                    
                    if (x >= 0 && x < this.fieldWidth && y >= 0 && y < this.fieldHeight) {
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const waveAmplitude = state.amplitude * Math.exp(-distance * 0.1);
                        const wavePhase = state.phase + distance * 0.2 + this.temps * 0.01 * params.vitesse;
                        
                        this.quantumField[x][y] += waveAmplitude * Math.cos(wavePhase) * state.coherence;
                    }
                }
            }
        });
        
        // Calcul des interférences
        this.calculateInterferencePattern(params);
    }

    calculateInterferencePattern(params) {
        this.interferencePattern = [];
        
        if (!params.interference) return;
        
        // Interférence entre les deux états quantiques
        const state1 = this.quantumStates[0];
        const state2 = this.quantumStates[1];
        
        if (!state1.observable || !state2.observable) return;
        
        const dx = state2.position.x - state1.position.x;
        const dy = state2.position.y - state1.position.y;
        const separation = Math.sqrt(dx * dx + dy * dy);
        
        // Génération du motif d'interférence
        for (let i = 0; i < 200; i++) {
            const angle = (i / 200) * Math.PI * 2;
            const radius = 50 + i * 2;
            
            const x = (state1.position.x + state2.position.x) / 2 + Math.cos(angle) * radius;
            const y = (state1.position.y + state2.position.y) / 2 + Math.sin(angle) * radius;
            
            // Différence de phase
            const pathDiff1 = Math.sqrt((x - state1.position.x) ** 2 + (y - state1.position.y) ** 2);
            const pathDiff2 = Math.sqrt((x - state2.position.x) ** 2 + (y - state2.position.y) ** 2);
            const phaseDiff = (pathDiff2 - pathDiff1) * 0.1 + (state2.phase - state1.phase);
            
            // Amplitude d'interférence
            const amplitude1 = state1.amplitude * Math.exp(-pathDiff1 * 0.005);
            const amplitude2 = state2.amplitude * Math.exp(-pathDiff2 * 0.005);
            const interference = 2 * amplitude1 * amplitude2 * Math.cos(phaseDiff);
            
            this.interferencePattern.push({
                x, y,
                intensity: Math.abs(interference) * params.interference,
                phase: phaseDiff,
                constructive: interference > 0
            });
        }
    }

    updateQuantumStates(deltaTime) {
        const params = this.getParameters();
        const dt = deltaTime * 0.001;
        
        this.quantumStates.forEach((state, index) => {
            // Évolution temporelle de la phase
            state.phase += dt * state.energy * params.vitesse;
            
            // Décohérence progressive
            if (!this.waveFunction.collapsed) {
                state.coherence *= (1 - this.waveFunction.decoherenceRate * dt);
                state.coherence = Math.max(0.1, state.coherence);
            }
            
            // Mouvement quantique brownien
            if (params.instabilite > 0) {
                state.velocity.x += (Math.random() - 0.5) * params.instabilite * 50 * dt;
                state.velocity.y += (Math.random() - 0.5) * params.instabilite * 50 * dt;
                state.velocity.x *= 0.95; // Amortissement
                state.velocity.y *= 0.95;
                
                state.position.x += state.velocity.x * dt;
                state.position.y += state.velocity.y * dt;
            }
            
            // Contrainte d'intrication (corrélation inverse des spins)
            if (params.intrication > 0 && state.entangled) {
                const otherState = this.quantumStates[1 - index];
                const correlation = params.intrication;
                
                // Synchronisation inversée des phases
                const targetPhase = -otherState.phase + Math.PI;
                const phaseDiff = targetPhase - state.phase;
                state.phase += phaseDiff * correlation * dt;
                
                // Intrication des amplitudes
                const amplitudeBalance = (state.amplitude + otherState.amplitude) / 2;
                state.amplitude += (amplitudeBalance - state.amplitude) * correlation * dt * 0.5;
            }
        });
        
        // Événements quantiques aléatoires
        this.processQuantumEvents(params);
        
        // Mise à jour des fonctions d'onde
        this.updateWaveFunctions();
        
        // Enregistrement de l'état pour l'historique
        this.recordStateHistory();
    }

    processQuantumEvents(params) {
        // Effondrement de la fonction d'onde
        if (!this.waveFunction.collapsed && Math.random() < this.quantumEvents.collapse * params.superposition) {
            this.triggerWaveCollapse();
        }
        
        // Tunneling quantique
        if (Math.random() < this.quantumEvents.tunneling) {
            this.triggerQuantumTunneling();
        }
        
        // Mesure quantique
        if (Math.random() < this.quantumEvents.measurement) {
            this.triggerQuantumMeasurement();
        }
        
        // Décohérence spontanée
        if (Math.random() < this.quantumEvents.decoherence) {
            this.triggerDecoherence();
        }
    }

    triggerWaveCollapse() {
        this.waveFunction.collapsed = true;
        this.waveFunction.collapseTimer = 0;
        this.waveFunction.collapseDuration = 1 + Math.random() * 2;
        
        // Choix aléatoire de l'état final
        this.waveFunction.targetState = Math.random() > 0.5 ? 0 : 1;
        
        // L'état non choisi devient invisible
        this.quantumStates.forEach((state, index) => {
            if (index !== this.waveFunction.targetState) {
                state.observable = false;
                state.amplitude *= 0.3;
            } else {
                state.amplitude = 1.5; // Renforcement de l'état observé
            }
        });
        
        // Particules d'effondrement
        this.createCollapseParticles();
    }

    triggerQuantumTunneling() {
        const state = this.quantumStates[Math.floor(Math.random() * 2)];
        
        // Téléportation instantanée
        const tunnel = {
            startX: state.position.x,
            startY: state.position.y,
            endX: state.position.x + (Math.random() - 0.5) * 200,
            endY: state.position.y + (Math.random() - 0.5) * 200,
            progress: 0,
            duration: 0.5
        };
        
        this.tunnelingEvents.push(tunnel);
        
        // Effet visuel de tunneling
        this.createTunnelingEffect(tunnel);
    }

    triggerQuantumMeasurement() {
        this.measurement.active = true;
        this.measurement.duration = 0.8 + Math.random() * 0.7;
        this.measurement.intensity = 0.7 + Math.random() * 0.3;
        this.measurement.observer = {
            x: 100 + Math.random() * 600,
            y: 100 + Math.random() * 400
        };
        
        // La mesure affecte les états quantiques
        this.quantumStates.forEach(state => {
            state.coherence *= 0.7; // Réduction de cohérence
            state.phase += (Math.random() - 0.5) * 0.5; // Perturbation de phase
        });
    }

    triggerDecoherence() {
        this.quantumStates.forEach(state => {
            state.coherence *= 0.8;
            state.amplitude += (Math.random() - 0.5) * 0.1;
        });
        
        // Augmentation temporaire du taux de décohérence
        this.waveFunction.decoherenceRate = 0.05;
        setTimeout(() => {
            this.waveFunction.decoherenceRate = 0.01;
        }, 1000);
    }

    createCollapseParticles() {
        for (let i = 0; i < 15; i++) {
            const particle = this.getAvailableEntanglementParticle();
            if (particle) {
                const centerX = (this.quantumStates[0].position.x + this.quantumStates[1].position.x) / 2;
                const centerY = (this.quantumStates[0].position.y + this.quantumStates[1].position.y) / 2;
                
                particle.x = centerX + (Math.random() - 0.5) * 100;
                particle.y = centerY + (Math.random() - 0.5) * 100;
                particle.vx = (Math.random() - 0.5) * 200;
                particle.vy = (Math.random() - 0.5) * 200;
                particle.life = 0;
                particle.maxLife = 1.5;
                particle.active = true;
                particle.entanglementStrength = 1;
            }
        }
    }

    createTunnelingEffect(tunnel) {
        for (let i = 0; i < 8; i++) {
            const particle = this.getAvailableEntanglementParticle();
            if (particle) {
                particle.x = tunnel.startX;
                particle.y = tunnel.startY;
                particle.vx = (tunnel.endX - tunnel.startX) / tunnel.duration;
                particle.vy = (tunnel.endY - tunnel.startY) / tunnel.duration;
                particle.life = 0;
                particle.maxLife = tunnel.duration;
                particle.active = true;
                particle.entanglementStrength = 0.8;
            }
        }
    }

    getAvailableEntanglementParticle() {
        return this.entanglementParticles.find(p => !p.active);
    }

    recordStateHistory() {
        const snapshot = {
            timestamp: this.temps,
            states: this.quantumStates.map(state => ({
                position: { ...state.position },
                phase: state.phase,
                amplitude: state.amplitude,
                coherence: state.coherence
            }))
        };
        
        this.stateHistory.push(snapshot);
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
    }

    updateEntanglementParticles(deltaTime) {
        const dt = deltaTime * 0.001;
        
        this.entanglementParticles.forEach(particle => {
            if (!particle.active) return;
            
            particle.life += dt;
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                return;
            }
            
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            
            // Attraction vers les états quantiques
            this.quantumStates.forEach(state => {
                if (!state.observable) return;
                
                const dx = state.position.x - particle.x;
                const dy = state.position.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = particle.entanglementStrength / (distance * distance + 1);
                    particle.vx += dx * force * dt * 50;
                    particle.vy += dy * force * dt * 50;
                }
            });
            
            // Amortissement
            particle.vx *= 0.98;
            particle.vy *= 0.98;
        });
    }

    render(ctx, element, deltaTime) {
        this.updateQuantumField();
        this.updateQuantumStates(deltaTime);
        this.updateEntanglementParticles(deltaTime);
        
        ctx.save();
        
        // Rendu du champ quantique de fond
        this.renderQuantumField(ctx);
        
        // Rendu des interférences
        this.renderInterferencePattern(ctx);
        
        // Rendu des états quantiques
        this.renderQuantumStates(ctx, element);
        
        // Rendu des particules d'intrication
        this.renderEntanglementParticles(ctx);
        
        // Rendu des effets spéciaux
        if (this.measurement.active) {
            this.renderQuantumMeasurement(ctx);
        }
        
        // Rendu des événements de tunneling
        this.renderTunnelingEvents(ctx);
        
        ctx.restore();
    }

    renderQuantumField(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        
        for (let i = 0; i < this.fieldWidth; i++) {
            for (let j = 0; j < this.fieldHeight; j++) {
                const intensity = Math.abs(this.quantumField[i][j]);
                if (intensity > 0.1) {
                    const hue = (this.quantumField[i][j] + 1) * 180;
                    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                    ctx.globalAlpha = intensity * 0.3;
                    ctx.fillRect(i * 10, j * 10, 10, 10);
                }
            }
        }
        
        ctx.restore();
    }

    renderInterferencePattern(ctx) {
        if (this.interferencePattern.length === 0) return;
        
        ctx.save();
        
        this.interferencePattern.forEach(point => {
            const alpha = point.intensity * 0.4;
            const color = point.constructive ? `rgba(0, 255, 255, ${alpha})` : `rgba(255, 0, 255, ${alpha})`;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    renderQuantumStates(ctx, element) {
        this.quantumStates.forEach((state, index) => {
            if (!state.observable) return;
            
            ctx.save();
            
            // Position et transformations quantiques
            ctx.translate(state.position.x, state.position.y);
            ctx.rotate(state.phase * 0.1);
            
            // Effet de superposition
            const params = this.getParameters();
            const superpositionAlpha = state.coherence * params.superposition;
            ctx.globalAlpha = superpositionAlpha;
            
            // Effet de spin quantique
            const spinScale = 1 + Math.sin(this.temps * 0.01 + state.phase) * 0.1;
            ctx.scale(spinScale, spinScale);
            
            // Rendu de l'élément avec effet quantique
            if (element.content && element.content.tagName === 'IMG') {
                // Effet de couleur selon l'état
                const hue = index * 60 + state.phase * 30;
                ctx.filter = `hue-rotate(${hue}deg) brightness(${state.amplitude})`;
                
                ctx.drawImage(
                    element.content,
                    -element.width/2, -element.height/2,
                    element.width, element.height
                );
            } else {
                // Fallback avec couleur quantique
                const colors = ['#00FFFF', '#FF00FF'];
                ctx.fillStyle = colors[index];
                ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
            }
            
            // Fonction d'onde visualisée
            this.renderWaveFunction(ctx, state);
            
            ctx.restore();
        });
    }

    renderWaveFunction(ctx, state) {
        if (!state.waveFunction.length) return;
        
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${state.coherence * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        state.waveFunction.forEach((point, i) => {
            const x = point.x - state.position.x;
            const y = point.real * 20;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        ctx.restore();
    }

    renderEntanglementParticles(ctx) {
        ctx.save();
        
        this.entanglementParticles.forEach(particle => {
            if (!particle.active) return;
            
            const lifeRatio = particle.life / particle.maxLife;
            const alpha = (1 - lifeRatio) * particle.entanglementStrength;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Traînée quantique
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x - particle.vx * 0.1, particle.y - particle.vy * 0.1);
            ctx.stroke();
        });
        
        ctx.restore();
    }

    renderQuantumMeasurement(ctx) {
        if (!this.measurement.active) return;
        
        ctx.save();
        
        // Faisceau d'observation
        const observer = this.measurement.observer;
        this.quantumStates.forEach(state => {
            if (!state.observable) return;
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.measurement.intensity * 0.3})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(observer.x, observer.y);
            ctx.lineTo(state.position.x, state.position.y);
            ctx.stroke();
        });
        
        // Observateur quantique
        ctx.fillStyle = `rgba(255, 255, 255, ${this.measurement.intensity})`;
        ctx.beginPath();
        ctx.arc(observer.x, observer.y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Réduction de la durée
        this.measurement.duration -= 0.016;
        if (this.measurement.duration <= 0) {
            this.measurement.active = false;
        }
    }

    renderTunnelingEvents(ctx) {
        this.tunnelingEvents = this.tunnelingEvents.filter(tunnel => {
            tunnel.progress += 0.016 / tunnel.duration;
            
            if (tunnel.progress >= 1) return false;
            
            // Effet visuel du tunneling
            ctx.save();
            
            const x = tunnel.startX + (tunnel.endX - tunnel.startX) * tunnel.progress;
            const y = tunnel.startY + (tunnel.endY - tunnel.startY) * tunnel.progress;
            
            ctx.strokeStyle = `rgba(0, 255, 0, ${1 - tunnel.progress})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(tunnel.startX, tunnel.startY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            ctx.restore();
            
            return true;
        });
    }

    update(deltaTime) {
        this.temps += deltaTime;
        
        // Gestion de l'effondrement de la fonction d'onde
        if (this.waveFunction.collapsed) {
            this.waveFunction.collapseTimer += deltaTime * 0.001;
            
            if (this.waveFunction.collapseTimer >= this.waveFunction.collapseDuration) {
                // Restauration de la superposition
                this.waveFunction.collapsed = false;
                this.quantumStates.forEach(state => {
                    state.observable = true;
                    state.amplitude = 1;
                    state.coherence = 1;
                });
            }
        }
    }

    destroy() {
        this.quantumField = null;
        this.quantumStates = null;
        this.interferencePattern = null;
        this.entanglementParticles = null;
        this.stateHistory = null;
        this.vacuumFluctuations = null;
    }
}