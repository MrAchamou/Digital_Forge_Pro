class Rotation3DEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            id: 'spatial-axis-rotation-019',
            name: 'Rotation Multi-Axiale Spatiale',
            category: 'text',
            version: '1.0',
            performance: 'medium',
            parameters: {
                vitesse: { type: 'range', min: 0.1, max: 3, default: 1 },
                intensite: { type: 'range', min: 0, max: 1, default: 0.8 },
                couleur: { type: 'color', default: '#ffffff' },
                complexite: { type: 'range', min: 0.2, max: 2, default: 1 },
                perspective: { type: 'range', min: 0.3, max: 1.5, default: 0.8 }
            }
        });

        // Variables de rotation 3D
        this.temps = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        
        // Axes de rotation évolutifs
        this.axisEvolution = {
            x: { phase: 0, amplitude: 1, frequency: 0.7 },
            y: { phase: Math.PI / 3, amplitude: 1.2, frequency: 0.9 },
            z: { phase: Math.PI * 2 / 3, amplitude: 0.8, frequency: 1.1 }
        };
        
        // Configuration 3D
        this.camera = {
            distance: 300,
            fov: 60,
            near: 1,
            far: 1000
        };
        
        // Système d'éclairage
        this.lighting = {
            ambient: 0.2,
            directional: {
                x: 1, y: -0.5, z: 0.8,
                intensity: 0.8
            },
            rimLight: {
                x: -0.3, y: 0.8, z: -0.5,
                intensity: 0.5
            }
        };
        
        // Surfaces virtuelles et reflets
        this.virtualSurfaces = [];
        this.reflectionPlanes = [];
        
        // Particules de profondeur
        this.depthParticles = [];
        
        // Matrice de transformation 3D
        this.transformMatrix = this.createIdentityMatrix();
        this.projectionMatrix = this.createIdentityMatrix();
        
        // Buffer pour les calculs 3D
        this.vertices3D = [];
        this.projectedVertices = [];
        
        // Variables de précession (rotation des axes)
        this.precessionAngles = {
            xy: 0, xz: 0, yz: 0
        };
        
        // Système de DOF (Depth of Field)
        this.dofSettings = {
            focusDistance: 300,
            blurRadius: 2,
            bokehIntensity: 0.3
        };
    }

    initialize(canvas, element) {
        this.canvas = canvas;
        this.element = element;
        
        this.setupVirtualSurfaces();
        this.createDepthParticles();
        this.initializeVertices();
        this.updateProjectionMatrix();
    }

    setupVirtualSurfaces() {
        const { width, height } = this.element;
        
        // Surface principale (sol virtuel)
        this.virtualSurfaces.push({
            type: 'floor',
            y: height * 0.8,
            opacity: 0.15,
            reflectivity: 0.3,
            size: width * 2
        });
        
        // Surfaces latérales pour reflets
        this.virtualSurfaces.push({
            type: 'wall',
            x: -width * 0.3,
            opacity: 0.08,
            reflectivity: 0.2,
            normal: { x: 1, y: 0, z: 0 }
        });
        
        this.virtualSurfaces.push({
            type: 'wall',
            x: width * 1.3,
            opacity: 0.08,
            reflectivity: 0.2,
            normal: { x: -1, y: 0, z: 0 }
        });
    }

    createDepthParticles() {
        this.depthParticles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            this.depthParticles.push({
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 300,
                z: (Math.random() - 0.5) * 500,
                size: 0.5 + Math.random() * 2,
                opacity: 0.1 + Math.random() * 0.2,
                speed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    initializeVertices() {
        const { width, height } = this.element;
        
        // Création des vertices du texte/élément en 3D
        this.vertices3D = [
            // Rectangle de base avec profondeur
            { x: -width/2, y: -height/2, z: -10 },
            { x: width/2, y: -height/2, z: -10 },
            { x: width/2, y: height/2, z: -10 },
            { x: -width/2, y: height/2, z: -10 },
            
            // Face arrière
            { x: -width/2, y: -height/2, z: 10 },
            { x: width/2, y: -height/2, z: 10 },
            { x: width/2, y: height/2, z: 10 },
            { x: -width/2, y: height/2, z: 10 }
        ];
    }

    createIdentityMatrix() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    multiplyMatrices(a, b) {
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        return result;
    }

    createRotationMatrix(rx, ry, rz) {
        const cos = Math.cos, sin = Math.sin;
        
        // Matrice rotation X
        const rotX = [
            1, 0, 0, 0,
            0, cos(rx), -sin(rx), 0,
            0, sin(rx), cos(rx), 0,
            0, 0, 0, 1
        ];
        
        // Matrice rotation Y
        const rotY = [
            cos(ry), 0, sin(ry), 0,
            0, 1, 0, 0,
            -sin(ry), 0, cos(ry), 0,
            0, 0, 0, 1
        ];
        
        // Matrice rotation Z
        const rotZ = [
            cos(rz), -sin(rz), 0, 0,
            sin(rz), cos(rz), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        
        // Combinaison des rotations
        let result = this.multiplyMatrices(rotZ, rotY);
        return this.multiplyMatrices(result, rotX);
    }

    updateProjectionMatrix() {
        const fov = this.camera.fov * Math.PI / 180;
        const aspect = 800 / 600; // Canvas aspect ratio
        const near = this.camera.near;
        const far = this.camera.far;
        
        const f = 1 / Math.tan(fov / 2);
        
        this.projectionMatrix = [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
            0, 0, -1, 0
        ];
    }

    transformVertex(vertex, matrix) {
        const x = vertex.x * matrix[0] + vertex.y * matrix[4] + vertex.z * matrix[8] + matrix[12];
        const y = vertex.x * matrix[1] + vertex.y * matrix[5] + vertex.z * matrix[9] + matrix[13];
        const z = vertex.x * matrix[2] + vertex.y * matrix[6] + vertex.z * matrix[10] + matrix[14];
        const w = vertex.x * matrix[3] + vertex.y * matrix[7] + vertex.z * matrix[11] + matrix[15];
        
        return { x, y, z, w };
    }

    projectVertex(vertex) {
        const distance = this.camera.distance;
        const perspectiveFactor = this.parameters.perspective.value;
        
        if (vertex.z + distance <= 0) return { x: 0, y: 0, depth: 0 };
        
        const depth = vertex.z + distance;
        const scale = distance / depth * perspectiveFactor;
        
        return {
            x: vertex.x * scale,
            y: vertex.y * scale,
            depth: depth,
            scale: scale
        };
    }

    calculateLighting(normal, position) {
        const { directional, rimLight, ambient } = this.lighting;
        
        // Normalisation de la normale
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        const nx = normal.x / length;
        const ny = normal.y / length;
        const nz = normal.z / length;
        
        // Éclairage directionnel
        const dotProduct = nx * directional.x + ny * directional.y + nz * directional.z;
        const diffuse = Math.max(0, dotProduct) * directional.intensity;
        
        // Rim lighting
        const rimDot = nx * rimLight.x + ny * rimLight.y + nz * rimLight.z;
        const rim = Math.pow(Math.max(0, 1 - Math.abs(rimDot)), 2) * rimLight.intensity;
        
        return Math.min(1, ambient + diffuse + rim);
    }

    updateRotationAxes(deltaTime) {
        const dt = deltaTime * 0.001 * this.parameters.vitesse.value;
        const complexity = this.parameters.complexite.value;
        
        // Évolution organique des axes de rotation
        Object.keys(this.axisEvolution).forEach(axis => {
            const config = this.axisEvolution[axis];
            config.phase += dt * config.frequency * complexity;
            
            // Variation de l'amplitude pour imprévisibilité
            config.amplitude = 1 + Math.sin(config.phase * 0.3) * 0.5;
        });
        
        // Calcul des rotations avec précession
        this.rotationX = Math.sin(this.axisEvolution.x.phase) * 
                        this.axisEvolution.x.amplitude * Math.PI * complexity;
        this.rotationY = Math.sin(this.axisEvolution.y.phase) * 
                        this.axisEvolution.y.amplitude * Math.PI * complexity;
        this.rotationZ = Math.sin(this.axisEvolution.z.phase) * 
                        this.axisEvolution.z.amplitude * Math.PI * complexity;
        
        // Précession des axes (rotation des axes eux-mêmes)
        this.precessionAngles.xy += dt * 0.2 * complexity;
        this.precessionAngles.xz += dt * 0.15 * complexity;
        this.precessionAngles.yz += dt * 0.25 * complexity;
        
        // Application de la précession
        const precessionX = Math.cos(this.precessionAngles.xy) * this.rotationX + 
                           Math.sin(this.precessionAngles.xz) * this.rotationZ;
        const precessionY = Math.sin(this.precessionAngles.xy) * this.rotationX + 
                           Math.cos(this.precessionAngles.yz) * this.rotationY;
        const precessionZ = Math.cos(this.precessionAngles.xz) * this.rotationZ + 
                           Math.sin(this.precessionAngles.yz) * this.rotationY;
        
        this.rotationX = precessionX;
        this.rotationY = precessionY;
        this.rotationZ = precessionZ;
    }

    updateDepthParticles(deltaTime) {
        const dt = deltaTime * 0.001;
        
        this.depthParticles.forEach(particle => {
            particle.phase += dt * particle.speed;
            
            // Mouvement orbital autour de l'élément
            const radius = 200 + Math.sin(particle.phase) * 100;
            particle.x = Math.cos(particle.phase) * radius;
            particle.z = Math.sin(particle.phase * 0.7) * radius;
            particle.y += Math.sin(particle.phase * 1.3) * 0.5;
        });
    }

    renderDepthOfField(ctx, renderCallback) {
        const { focusDistance, blurRadius, bokehIntensity } = this.dofSettings;
        
        // Rendu en plusieurs passes pour effet DOF
        const passes = [
            { blur: 0, opacity: 1 },
            { blur: blurRadius * 0.5, opacity: bokehIntensity * 0.7 },
            { blur: blurRadius, opacity: bokehIntensity * 0.3 }
        ];
        
        passes.forEach(pass => {
            ctx.save();
            ctx.globalAlpha *= pass.opacity;
            
            if (pass.blur > 0) {
                ctx.filter = `blur(${pass.blur}px)`;
            }
            
            renderCallback();
            
            ctx.restore();
        });
    }

    renderVirtualSurfaces(ctx) {
        this.virtualSurfaces.forEach(surface => {
            ctx.save();
            
            if (surface.type === 'floor') {
                // Surface de sol avec perspective
                const floorY = surface.y;
                const size = surface.size;
                
                ctx.globalAlpha = surface.opacity * this.parameters.intensite.value;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                
                // Grille perspective pour le sol
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                
                for (let i = -5; i <= 5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-size, floorY + i * 20);
                    ctx.lineTo(size, floorY + i * 20);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(i * 40, floorY - 100);
                    ctx.lineTo(i * 40, floorY + 100);
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        });
    }

    renderShadow(ctx) {
        const shadowOffset = this.projectVertex({ 
            x: 0, 
            y: this.element.height * 0.7, 
            z: -50 
        });
        
        ctx.save();
        ctx.translate(shadowOffset.x, shadowOffset.y);
        
        // Ombre projetée déformée par la rotation
        const skewX = Math.sin(this.rotationY) * 0.3;
        const skewY = Math.sin(this.rotationX) * 0.2;
        const scaleX = 1 + Math.abs(Math.sin(this.rotationZ)) * 0.3;
        const scaleY = 0.3 + Math.abs(Math.cos(this.rotationX)) * 0.2;
        
        ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0);
        ctx.globalAlpha = 0.2 * this.parameters.intensite.value;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        
        // Ombre gaussienne
        ctx.filter = 'blur(8px)';
        ctx.fillRect(-this.element.width/2, -this.element.height/2, 
                    this.element.width, this.element.height);
        
        ctx.restore();
    }

    renderReflection(ctx) {
        const floorSurface = this.virtualSurfaces.find(s => s.type === 'floor');
        if (!floorSurface) return;
        
        ctx.save();
        
        // Position du reflet
        const reflectionY = floorSurface.y + (floorSurface.y - 0) * 0.5;
        ctx.translate(0, reflectionY);
        ctx.scale(1, -0.4); // Reflet déformé
        
        // Opacité du reflet basée sur la distance et l'angle
        const reflectionOpacity = floorSurface.reflectivity * 
                                 (1 - Math.abs(Math.sin(this.rotationX)) * 0.5) *
                                 this.parameters.intensite.value;
        
        ctx.globalAlpha = reflectionOpacity;
        ctx.globalCompositeOperation = 'overlay';
        
        // Gradient de masquage pour le reflet
        const gradient = ctx.createLinearGradient(0, -this.element.height/2, 0, this.element.height/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.element.width/2, -this.element.height/2, 
                    this.element.width, this.element.height);
        
        ctx.restore();
    }

    renderDepthParticles(ctx) {
        this.depthParticles.forEach(particle => {
            const projected = this.projectVertex(particle);
            
            if (projected.depth > 0) {
                const size = particle.size * projected.scale;
                const alpha = particle.opacity * projected.scale * this.parameters.intensite.value;
                
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                
                // Effet bokeh pour les particules floues
                if (Math.abs(projected.depth - this.dofSettings.focusDistance) > 50) {
                    ctx.filter = 'blur(2px)';
                }
                
                ctx.beginPath();
                ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
        });
    }

    render(ctx, element, deltaTime) {
        ctx.save();
        ctx.translate(element.x + element.width/2, element.y + element.height/2);
        
        // Création de la matrice de transformation 3D
        this.transformMatrix = this.createRotationMatrix(
            this.rotationX, this.rotationY, this.rotationZ
        );
        
        // Calcul des vertices transformés
        this.projectedVertices = this.vertices3D.map(vertex => {
            const transformed = this.transformVertex(vertex, this.transformMatrix);
            return this.projectVertex(transformed);
        });
        
        // Rendu avec depth of field
        this.renderDepthOfField(ctx, () => {
            // Rendu des surfaces virtuelles
            this.renderVirtualSurfaces(ctx);
            
            // Rendu de l'ombre
            this.renderShadow(ctx);
            
            // Rendu du reflet
            this.renderReflection(ctx);
            
            // Rendu des particules de profondeur
            this.renderDepthParticles(ctx);
        });
        
        // Rendu de l'élément principal avec transformation 3D
        const averageDepth = this.projectedVertices.reduce((sum, v) => sum + v.depth, 0) / this.projectedVertices.length;
        const lightingFactor = this.calculateLighting(
            { x: Math.sin(this.rotationY), y: Math.sin(this.rotationX), z: Math.cos(this.rotationZ) },
            { x: 0, y: 0, z: averageDepth }
        );
        
        ctx.save();
        
        // Application de la transformation 3D simulée
        const perspective = 1 - (averageDepth - this.camera.distance) / this.camera.distance * 0.3;
        const skewX = Math.sin(this.rotationY) * 0.4;
        const skewY = Math.sin(this.rotationX) * 0.3;
        const scaleX = Math.cos(this.rotationY) * perspective;
        const scaleY = Math.cos(this.rotationX) * perspective;
        
        ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0);
        ctx.globalAlpha = element.opacity * lightingFactor * this.parameters.intensite.value;
        
        // Rendu de l'élément avec éclairage
        if (element.content) {
            ctx.fillStyle = this.parameters.couleur.value;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(element.content, 0, 0);
        } else {
            ctx.fillStyle = this.parameters.couleur.value;
            ctx.fillRect(-element.width/2, -element.height/2, element.width, element.height);
        }
        
        ctx.restore();
        ctx.restore();
    }

    update(deltaTime) {
        this.temps += deltaTime * 0.001;
        
        this.updateRotationAxes(deltaTime);
        this.updateDepthParticles(deltaTime);
        
        // Mise à jour dynamique du focus DOF
        this.dofSettings.focusDistance = this.camera.distance + 
                                        Math.sin(this.temps * 0.5) * 100;
    }

    destroy() {
        this.vertices3D = [];
        this.projectedVertices = [];
        this.depthParticles = [];
        this.virtualSurfaces = [];
        this.reflectionPlanes = [];
        this.transformMatrix = null;
        this.projectionMatrix = null;
    }
}