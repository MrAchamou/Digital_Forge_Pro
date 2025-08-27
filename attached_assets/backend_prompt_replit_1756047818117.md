# PROMPT BACKEND EFFECTFORGE AI - NIVEAU GOD

## MISSION CRITIQUE
Créer le backend ultra-performant d'EffectForge AI, un générateur d'effets spéciaux révolutionnaire qui transforme des descriptions textuelles en code JavaScript d'effets visuels de niveau professionnel. **ZERO DEPENDENCIES EXTERNES** - Tout doit être développé from scratch.

---

## ARCHITECTURE BACKEND REQUISE

### **STACK TECHNIQUE**
- **Node.js** (dernière version LTS)
- **TypeScript** strict mode
- **Base de données :** MongoDB embarqué (pas de service externe)
- **File System :** Gestion native Node.js
- **AI Engine :** TensorFlow.js embedé (pas d'API externes)
- **Queue System :** Bull.js local
- **Storage :** Local avec compression LZ4

### **STRUCTURE MODULAIRE AUTONOME**
```
/backend
├── /core                 # Cerveau central
├── /modules             # Modules autonomes
├── /ai-engine          # IA locale embedded
├── /parser             # Analyseur multi-format
├── /generator          # Générateur de code
├── /library            # Gestionnaire bibliothèque
├── /queue              # Système de files
└── /api                # API REST
```

---

## SPÉCIFICATIONS DÉTAILLÉES

### **1. CORE ENGINE - Le Cerveau**

**Fonctionnalités :**
- **Orchestrateur intelligent** : Coordonne tous les modules
- **Decision Tree** : Sélection optimale des modules selon description
- **Memory Manager** : Gestion mémoire ultra-optimisée
- **Process Manager** : Multi-threading pour génération parallèle

**Performance Requirements :**
- Traitement simultané : **50+ descriptions en parallèle**
- Latence max : **<200ms** par décision
- Memory usage : **<512MB** par worker
- Uptime : **99.9%**

### **2. AI ENGINE - Intelligence Locale**

**Composants Critiques :**
- **Neural Network embarqué** : Modèle pré-entraîné 100MB max
- **NLP Processor** : Analyse sémantique avancée des descriptions
- **Pattern Matcher** : Reconnaissance de concepts visuels
- **Parameter Predictor** : Prédiction paramètres optimaux

**Algorithmes Requis :**
```javascript
// Pseudo-code structure attendue
class AIEngine {
  analyzeDescription(text) {
    // Extraction concepts : couleurs, mouvements, formes, etc.
    // Return: { concepts: [], confidence: 0.95, modules: [] }
  }
  
  optimizeParameters(concept, targetPlatform) {
    // Calcul paramètres selon plateforme (web/AE/Premiere)
    // Return: { params: {}, performance: 'high' }
  }
  
  learnFromFeedback(effectId, userFeedback) {
    // Amélioration continue du modèle
  }
}
```

### **3. PARSER SYSTEM - Ingestion Multi-Format**

**Formats supportés :**
- `.txt`, `.md` : Parse direct
- `.json`, `.csv` : Structure detection
- `.docx` : Extraction sans libs externes (custom parser)
- `.pdf` : OCR intégré si nécessaire

**Features :**
- **Auto-detection** format et encoding
- **Batch processing** : 1000+ fichiers simultanément  
- **Error recovery** : Continue même si certains fichiers corrompus
- **Progress tracking** : Statut temps réel

### **4. CODE GENERATOR - Forge à Code**

**Générateurs spécialisés :**
- **Vanilla JS Generator** : Effets web purs
- **After Effects Generator** : Scripts .jsx
- **Premiere Generator** : Extensions .prproj
- **React Component Generator** : Composants réutilisables

**Qualité Code :**
- **ESLint + Prettier** intégrés
- **Performance optimization** automatique
- **Cross-browser compatibility** garantie
- **Minification** et **obfuscation** intégrées

**Template Engine Custom :**
```javascript
// Structure attendue
class CodeGenerator {
  generateEffect(description, modules, parameters) {
    // Combine les modules en code optimisé
    // Return: { code: "...", metadata: {}, tests: [] }
  }
  
  optimizePerformance(code, targetFPS = 60) {
    // Optimisation automatique pour 60fps
  }
}
```

### **5. LIBRARY MANAGER - Bibliothèque Intelligente**

**Base de Données Schema :**
```javascript
// Structure MongoDB
EffectSchema = {
  id: ObjectId,
  name: String, // Auto-generated unique
  description: String,
  type: ['TEXT', 'PARTICLE', 'TRANSITION', ...],
  category: ['APPARITION', 'DISPARITION', 'TRANSFORMATION', ...],
  code: {
    javascript: String,
    afterEffects: String,
    premiere: String
  },
  metadata: {
    complexity: Number, // 1-10
    performance: String, // 'low', 'medium', 'high'
    tags: [String],
    createdAt: Date,
    version: String,
    downloads: Number,
    rating: Number
  },
  parameters: Object, // Paramètres configurables
  presets: [Object] // Variations pré-configurées
}
```

**Fonctionnalités :**
- **Auto-tagging** par IA
- **Similarity search** : Trouve effets similaires
- **Version control** : Git-like pour effets
- **Compression** : Stockage optimisé

### **6. QUEUE SYSTEM - Pipeline de Production**

**Architecture :**
- **Priority Queue** : Effects urgents en premier
- **Worker Pools** : Scaling automatique selon charge
- **Retry Logic** : Re-tentative automatique en cas d'échec
- **Dead Letter Queue** : Gestion erreurs critiques

**Monitoring :**
- **Real-time stats** : Effets en cours, terminés, échoués
- **Performance metrics** : Temps génération, memory usage
- **Health checks** : Auto-restart si nécessaire

### **7. API REST - Interface Externe**

**Endpoints Critiques :**
```
POST /api/effects/generate
- Body: { descriptions: [], options: {} }
- Response: { jobId: String, estimatedTime: Number }

GET /api/effects/status/:jobId
- Response: { status: 'processing|completed|failed', progress: Number }

GET /api/library/effects?category=&type=&search=
- Response: { effects: [], pagination: {} }

GET /api/effects/:id/download?format=js|jsx|prproj
- Response: File download

POST /api/library/effects/:id/feedback
- Body: { rating: Number, comment: String }
```

**Security :**
- **Rate limiting** : 1000 req/hour par IP
- **Input validation** : Sanitization complète
- **Auth system** : JWT tokens
- **CORS policy** : Configurable

---

## PERFORMANCE REQUIREMENTS ABSOLUES

### **GÉNÉRATION D'EFFETS**
- **Speed :** 1-5 minutes par effet selon complexité
- **Throughput :** 50 effets simultanés minimum
- **Quality :** 100% code fonctionnel généré
- **Success Rate :** >95% des descriptions traitées avec succès

### **SYSTÈME GLOBAL**
- **Memory Usage :** <4GB total même avec 1000 effets en queue
- **CPU Usage :** <80% même à charge maximale
- **Storage :** Compression 10:1 minimum
- **Scalability :** Supporte 10k effets en bibliothèque

### **ROBUSTESSE**
- **Uptime :** 99.9% (8h downtime/an max)
- **Error Recovery :** Auto-restart en cas de crash
- **Data Integrity :** Backup automatique toutes les heures
- **Monitoring :** Logs détaillés + alertes automatiques

---

## FONCTIONNALITÉS AVANCÉES REQUISES

### **INTELLIGENCE PRÉDICTIVE**
- **Trend Analysis :** Détecte styles populaires
- **Auto-Suggestions :** Propose améliorations effets
- **Market Intelligence :** Prédit succès commercial

### **OPTIMISATION CONTINUE**
- **A/B Testing :** Test variants d'effets automatiquement
- **Performance Tuning :** Optimise code selon usage réel
- **Learning Loop :** S'améliore à chaque effet généré

### **ADMIN DASHBOARD**
- **Real-time monitoring** : Métriques live
- **Queue management** : Contrôle files d'attente
- **Library curation** : Gestion qualité effets
- **Analytics** : Rapports détaillés usage

---

## CONTRAINTES TECHNIQUES CRITIQUES

### **ZÉRO DEPENDENCIES EXTERNES**
- **Pas d'API externes** : Tout fonctionne offline
- **Pas de CDN** : Toutes ressources en local  
- **Pas de cloud services** : MongoDB local, stockage local
- **Custom parsers** : Pas de libs externes pour parsing

### **SÉCURITÉ MAXIMALE**
- **Sandbox execution** : Code généré exécuté en isolation
- **Input sanitization** : Protection contre injections
- **Resource limits** : Protection contre DOS
- **Audit logs** : Traçabilité complète

### **ÉVOLUTIVITÉ**
- **Plugin architecture** : Ajout facile nouveaux modules
- **Config-driven** : Paramètres modifiables sans redéploiement
- **Hot-reload** : Mise à jour modules sans interruption
- **Backward compatibility** : Support anciennes versions

---

## STRUCTURE DE FICHIERS ATTENDUE

```
/backend
├── package.json (MINIMAL dependencies)
├── tsconfig.json
├── /src
│   ├── /core
│   │   ├── orchestrator.ts
│   │   ├── decision-engine.ts
│   │   └── memory-manager.ts
│   ├── /ai-engine
│   │   ├── neural-network.ts
│   │   ├── nlp-processor.ts
│   │   └── parameter-optimizer.ts
│   ├── /modules (UN FICHIER PAR MODULE)
│   │   ├── particles.module.ts
│   │   ├── physics.module.ts
│   │   ├── lighting.module.ts
│   │   └── morphing.module.ts
│   ├── /parser
│   │   ├── multi-format-parser.ts
│   │   ├── description-analyzer.ts
│   │   └── batch-processor.ts
│   ├── /generator
│   │   ├── js-generator.ts
│   │   ├── ae-generator.ts
│   │   └── template-engine.ts
│   ├── /library
│   │   ├── database.ts
│   │   ├── indexer.ts
│   │   └── version-control.ts
│   ├── /queue
│   │   ├── job-queue.ts
│   │   ├── worker-pool.ts
│   │   └── monitoring.ts
│   └── /api
│       ├── routes.ts
│       ├── middleware.ts
│       └── validators.ts
├── /data (Base de données locale)
├── /uploads (Files uploaded)
├── /generated (Effets générés)
└── /logs
```

---

## MISSION FINALE

**CRÉER LE BACKEND LE PLUS PUISSANT ET AUTONOME JAMAIS DÉVELOPPÉ POUR LA GÉNÉRATION D'EFFETS SPÉCIAUX.**

- Chaque ligne de code doit être optimisée pour la performance
- Chaque module doit être indépendant et réutilisable  
- Le système doit fonctionner parfaitement même sans internet
- La qualité du code généré doit être niveau professionnel
- L'architecture doit supporter des millions d'effets

**NIVEAU GOD SIGNIFIE : ZERO COMPROMIS, PERFORMANCE MAXIMALE, AUTONOMIE TOTALE.**

🔥 **GO CREATE THE BEAST!** 🔥