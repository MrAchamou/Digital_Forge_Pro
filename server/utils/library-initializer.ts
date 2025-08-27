
import fs from 'fs/promises';
import path from 'path';

interface SampleEffect {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  code: string;
  complexity: number;
  tags: string[];
}

class LibraryInitializer {
  private libraryPath: string;

  constructor() {
    this.libraryPath = path.join(process.cwd(), 'effects-library');
  }

  async initializeLibrary(): Promise<void> {
    console.log('🔧 Initialisation de la bibliothèque d\'effets...');
    
    try {
      // Créer le dossier principal
      await fs.mkdir(this.libraryPath, { recursive: true });
      
      // Créer les catégories de base
      const categories = [
        'MANIPULATION_TEMPORELLE',
        'PARTICULES',
        'LUMIERE_OMBRE',
        'MORPHING',
        'PHYSIQUE',
        'DIGITAL',
        'ATMOSPHERIC'
      ];
      
      for (const category of categories) {
        await this.createCategory(category);
      }
      
      // Créer quelques effets d'exemple
      await this.createSampleEffects();
      
      // Créer l'index global
      await this.createGlobalIndex(categories);
      
      // Créer les index de recherche
      await this.createSearchIndexes();
      
      console.log('✅ Bibliothèque initialisée avec succès !');
      console.log(`📁 Chemin: ${this.libraryPath}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  private async createCategory(categoryName: string): Promise<void> {
    const categoryPath = path.join(this.libraryPath, categoryName);
    await fs.mkdir(categoryPath, { recursive: true });
    
    // Créer l'index de catégorie
    const categoryIndex = {
      category: categoryName,
      totalEffects: 0,
      subCategories: [],
      effects: [],
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(categoryPath, 'category-index.json'),
      JSON.stringify(categoryIndex, null, 2)
    );
    
    // Créer un fichier README pour la catégorie
    const readmeContent = `# ${categoryName}\n\nCette catégorie contient les effets de type: ${categoryName}\n\nEffets disponibles: 0\nDernière mise à jour: ${new Date().toISOString()}\n`;
    
    await fs.writeFile(
      path.join(categoryPath, 'README.md'),
      readmeContent
    );
  }

  private async createSampleEffects(): Promise<void> {
    const sampleEffects: SampleEffect[] = [
      {
        id: 'chronobreak_001',
        name: 'Chronobreak',
        type: 'TEMPORAL',
        category: 'MANIPULATION_TEMPORELLE',
        description: 'La vidéo se fige soudainement, puis des fragments de la scène se déplacent à des vitesses différentes.',
        code: this.getChronobreakCode(),
        complexity: 8,
        tags: ['temps', 'chronos', 'vitesse', 'ralenti', 'accélé']
      },
      {
        id: 'particle_explosion_001',
        name: 'Particle Explosion',
        type: 'PARTICLE',
        category: 'PARTICULES',
        description: 'Explosion de particules avec physique réaliste et effets de lumière.',
        code: this.getParticleExplosionCode(),
        complexity: 7,
        tags: ['particules', 'explosion', 'physique', 'lumière']
      },
      {
        id: 'neon_glow_001',
        name: 'Neon Glow',
        type: 'LIGHTING',
        category: 'LUMIERE_OMBRE',
        description: 'Effet de néon brillant avec halo et pulsation lumineuse.',
        code: this.getNeonGlowCode(),
        complexity: 6,
        tags: ['néon', 'lumière', 'glow', 'pulsation']
      }
    ];

    for (const effect of sampleEffects) {
      await this.saveEffect(effect);
    }
  }

  private async saveEffect(effect: SampleEffect): Promise<void> {
    const categoryPath = path.join(this.libraryPath, effect.category);
    const effectPath = path.join(categoryPath, `${effect.id}.json`);
    
    const effectData = {
      raw: `Effet généré: ${effect.name}`,
      parsed: effect,
      confidence: 0.98,
      errors: [],
      generatedBy: 'LibraryInitializer',
      generatedAt: new Date().toISOString(),
      version: '1.0',
      classification: {
        primaryCategory: effect.category,
        subCategories: ['BASIC'],
        confidence: 0.98,
        suggestedPath: effect.category,
        metadata: {
          effectType: effect.type,
          complexity: effect.complexity,
          platform: ['javascript', 'web'],
          tags: effect.tags
        }
      }
    };
    
    await fs.writeFile(effectPath, JSON.stringify(effectData, null, 2));
    
    // Mettre à jour l'index de catégorie
    await this.updateCategoryIndex(effect.category, effect);
  }

  private async updateCategoryIndex(categoryName: string, effect: SampleEffect): Promise<void> {
    const indexPath = path.join(this.libraryPath, categoryName, 'category-index.json');
    
    let index: any = {
      category: categoryName,
      totalEffects: 0,
      subCategories: [],
      effects: [],
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      index = JSON.parse(content);
    } catch {
      // Nouvel index si le fichier n'existe pas
    }
    
    // Ajouter l'effet
    const effectEntry = {
      id: effect.id,
      name: effect.name,
      description: effect.description.slice(0, 100) + '...',
      complexity: effect.complexity,
      confidence: 0.98,
      tags: effect.tags,
      storedAt: new Date().toISOString()
    };
    
    index.effects.push(effectEntry);
    index.totalEffects = index.effects.length;
    index.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  private async createGlobalIndex(categories: string[]): Promise<void> {
    const globalIndex = {
      totalEffects: 3, // Nombre d'effets d'exemple
      categories,
      lastInitialized: new Date().toISOString(),
      stats: {
        avgComplexity: 7,
        avgConfidence: 0.98,
        platformDistribution: {
          'javascript': 3,
          'web': 3
        },
        categoryDistribution: {
          'MANIPULATION_TEMPORELLE': 1,
          'PARTICULES': 1,
          'LUMIERE_OMBRE': 1
        }
      },
      version: '1.0',
      metadata: {
        initialized: true,
        sampleEffectsIncluded: true,
        ready: true
      }
    };
    
    await fs.writeFile(
      path.join(this.libraryPath, 'global-index.json'),
      JSON.stringify(globalIndex, null, 2)
    );
  }

  private async createSearchIndexes(): Promise<void> {
    const searchIndexes = {
      byCategory: {
        'MANIPULATION_TEMPORELLE': ['chronobreak_001'],
        'PARTICULES': ['particle_explosion_001'],
        'LUMIERE_OMBRE': ['neon_glow_001']
      },
      byComplexity: {
        '6': ['neon_glow_001'],
        '7': ['particle_explosion_001'],
        '8': ['chronobreak_001']
      },
      byTags: {
        'temps': ['chronobreak_001'],
        'particules': ['particle_explosion_001'],
        'lumière': ['neon_glow_001', 'particle_explosion_001'],
        'explosion': ['particle_explosion_001']
      },
      fullTextSearch: {
        'chronobreak': ['chronobreak_001'],
        'particle': ['particle_explosion_001'],
        'explosion': ['particle_explosion_001'],
        'neon': ['neon_glow_001'],
        'glow': ['neon_glow_001']
      },
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(this.libraryPath, 'search-indexes.json'),
      JSON.stringify(searchIndexes, null, 2)
    );
  }

  private getChronobreakCode(): string {
    return `// Chronobreak Effect - Manipulation Temporelle
class ChronobreakEffect {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fragments = [];
    this.frozenFrame = null;
    this.isActive = false;
    this.duration = options.duration || 3000;
  }

  activate() {
    // Capturer le frame actuel
    this.frozenFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.createFragments();
    this.isActive = true;
  }

  createFragments() {
    const fragmentCount = 12;
    for (let i = 0; i < fragmentCount; i++) {
      this.fragments.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        timeScale: 0.2 + Math.random() * 1.8,
        size: 50 + Math.random() * 100
      });
    }
  }

  render() {
    if (!this.isActive) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dessiner les fragments à différentes vitesses
    this.fragments.forEach(fragment => {
      this.ctx.save();
      this.ctx.translate(fragment.x, fragment.y);
      this.ctx.scale(fragment.timeScale, fragment.timeScale);
      
      if (this.frozenFrame) {
        this.ctx.putImageData(this.frozenFrame, -fragment.x, -fragment.y);
      }
      
      this.ctx.restore();
      
      // Mise à jour des fragments
      fragment.x += fragment.vx * fragment.timeScale;
      fragment.y += fragment.vy * fragment.timeScale;
    });
  }
}`;
  }

  private getParticleExplosionCode(): string {
    return `// Particle Explosion Effect
class ParticleExplosion {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.colors = options.colors || ['#ff4444', '#ff8844', '#ffaa44'];
    this.maxParticles = options.maxParticles || 200;
  }

  explode(x, y) {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        size: 2 + Math.random() * 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)]
      });
    }
  }

  render() {
    this.ctx.globalCompositeOperation = 'lighter';
    
    this.particles = this.particles.filter(particle => {
      if (particle.life <= 0) return false;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravité
      particle.life -= particle.decay;
      
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      
      return true;
    });
  }
}`;
  }

  private getNeonGlowCode(): string {
    return `// Neon Glow Effect
class NeonGlowEffect {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.color = options.color || '#00ffff';
    this.intensity = options.intensity || 1.0;
    this.pulseSpeed = options.pulseSpeed || 2;
    this.time = 0;
  }

  drawNeonText(text, x, y) {
    const pulse = 0.5 + 0.5 * Math.sin(this.time * this.pulseSpeed);
    const glowIntensity = this.intensity * pulse;
    
    this.ctx.save();
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    
    // Effet de glow multiple
    for (let i = 0; i < 3; i++) {
      this.ctx.shadowColor = this.color;
      this.ctx.shadowBlur = 10 + i * 20;
      this.ctx.globalAlpha = glowIntensity / (i + 1);
      this.ctx.fillStyle = this.color;
      this.ctx.fillText(text, x, y);
    }
    
    // Texte principal
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, x, y);
    
    this.ctx.restore();
    this.time += 0.016; // ~60fps
  }

  render(text = 'NEON GLOW') {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.drawNeonText(text, centerX, centerY);
  }
}`;
  }
}

export const libraryInitializer = new LibraryInitializer();
