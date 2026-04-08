<img width="943" height="431" alt="NEXUS" src="https://github.com/user-attachments/assets/cac709ba-cb77-47b9-aaad-398a4c6892b0" />

<div align="center">

# EffectForge AI — God Tier Studio

<img src="https://img.shields.io/badge/Version-3.0.0--GOD-ff6b35?style=for-the-badge&logo=fire" alt="Version"/>
<img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
<img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react" alt="React"/>
<img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express" alt="Express"/>
<img src="https://img.shields.io/badge/PostgreSQL-Neon-00e5ff?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
<img src="https://img.shields.io/badge/AI-GPT--4o%20%7C%20Claude%20%7C%20Gemini-9333ea?style=for-the-badge" alt="AI"/>
<img src="https://img.shields.io/badge/Status-Production%20Ready-22c55e?style=for-the-badge" alt="Status"/>

**Plateforme full-stack de génération de signatures email SVG animées "God Tier" via Triple-AI Pipeline.**

Dépose n'importe quelle URL Google My Business → signature animée professionnelle avec quatre variations narratives, PDFs brandés et package ZIP prêt à installer — en moins de 60 secondes.

</div>

---

## Ce que ça fait

EffectForge AI fait passer un profil business par trois modèles d'IA en séquence — chacun avec un rôle créatif distinct — pour produire une signature email SVG animée. Le résultat n'est pas un template : chaque signature est générée from scratch en fonction de l'identité visuelle de la marque, du secteur, de la psychologie des couleurs et d'un arc narratif construit par l'IA.

Le package final inclut le SVG animé, des versions optimisées Gmail/Outlook/Apple Mail, trois guides PDF brandés, une page de prévisualisation live et un archive ZIP complet — client-ready.

---

## Architecture — Triple-AI Pipeline (3 cerveaux)

```
Google My Business URL
          │
          ▼
┌─────────────────────────────────────────┐
│  SERPER GMB SCRAPER                     │
│  ├── Extraction complète du profil      │
│  │   (nom, adresse, tél, horaires,      │
│  │    note, avis, photos, mots-clés)    │
│  ├── Détection automatique des réseaux  │
│  ├── Capture du logo via Clearbit API   │
│  └── Classification secteur + palette   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  CERVEAU 1 — GPT-4o Vision              │
│  Rôle : Directeur Créatif               │
│  ├── Analyse visuelle logo + metadata   │
│  ├── Brief créatif complet              │
│  ├── Références visuelles (3 top brands)│
│  ├── Psychologie des couleurs           │
│  ├── Mapping personnalité de marque     │
│  ├── Cible + différenciateur           │
│  └── Mot-clé narratif central          │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  CERVEAU 2 — Claude Opus                │
│  Rôle : Directeur Narratif & Poète      │
│  ├── Arc émotionnel  A → B → C → D      │
│  ├── Métaphore centrale + fil narratif  │
│  ├── 4 variations (titre, sous-titre,   │
│  │   intention, métaphore, émotion)     │
│  ├── Sélection d'effets cohérente (55+) │
│  └── Note de directeur artistique      │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  CERVEAU 3 — Gemini 1.5 Pro             │
│  Rôle : Ingénieur Créatif Senior        │
│  ├── Calibration technique par effet    │
│  ├── Paramètres spécifiques par effet   │
│  ├── Compatibilité clients email        │
│  ├── Timing des cycles (200–280 s)      │
│  ├── Courbes d'easing personnalisées    │
│  └── Notes techniques + optimisations  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  MOTEUR DE LIVRAISON (7 étapes)         │
│                                         │
│  Étape 1 ── SVG + fallback PNG          │
│  Étape 2 ── Gmail HTML + Outlook HTM    │
│  Étape 3 ── Cerebras génère le contenu  │
│  Étape 4 ── 3 PDFs brandés              │
│  Étape 5 ── Page de prévisualisation    │
│  Étape 6 ── Assemblage du ZIP           │
│  Étape 7 ── Email de livraison          │
└─────────────────────────────────────────┘
```

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Runtime** | Node.js 20, TypeScript 5 (ESM) |
| **Backend** | Express 4, Drizzle ORM, WebSocket (ws) |
| **Frontend** | React 18, Vite 5, TanStack Query v5 |
| **UI** | Tailwind CSS v4, shadcn/ui, Radix UI, Lucide |
| **Base de données** | PostgreSQL via Neon Serverless |
| **AI — Cerveau 1** | OpenAI GPT-4o Vision |
| **AI — Cerveau 2** | Anthropic Claude Opus |
| **AI — Cerveau 3** | Google Gemini 1.5 Pro |
| **AI — Contenu** | Cerebras (inférence ultra-rapide) |
| **Recherche** | Serper API (GMB scraping) |
| **PDF** | PDFKit (multi-pages, brandé) |
| **ZIP** | Archiver |
| **Image** | Sharp (SVG → PNG) |
| **Email** | Resend API |
| **Déploiement** | Replit Autoscale |

---

## Pages de l'application

| Page | Route | Description |
|------|-------|-------------|
| **Command Center** | `/` | Dashboard — métriques système, queue, activité récente |
| **God Generator** | `/generator` | Pipeline principal — saisie URL GMB, progression live, viewer résultat |
| **Neural Library** | `/library` | Parcourir et prévisualiser les 55 effets animés avec métriques enrichies |
| **Studio** | `/studio` | Studio d'animation — construire et tester des animations SVG personnalisées |
| **Reality Preview** | `/preview` | Renderer SVG live — coller un SVG et prévisualiser instantanément |
| **AI Expansion** | `/expansion` | Croissance de la librairie par IA — décrire et générer de nouveaux effets |
| **Upload** | `/upload` | Import de signatures existantes pour transformation |
| **System Matrix** | `/status` | Dashboard santé temps réel + gestion des clés API |
| **Core Modules** | `/modules` | Inspecter les 14 modules internes et leur état live |

---

## Package de sortie

Chaque génération produit une archive ZIP complète et client-ready :

```
signature-{company}-{id}.zip
├── signature.svg                   # SVG animé — fichier signature principal
├── signature-fallback.png          # PNG haute résolution (1200×360)
├── signature-gmail.html            # Version HTML optimisée Gmail
├── signature-outlook.htm           # Version Outlook avec VML + conditions MSO
├── instructions-gmail.pdf          # Guide d'installation brandé — Gmail
├── instructions-outlook.pdf        # Guide d'installation brandé — Outlook
├── instructions-apple-mail.pdf     # Guide d'installation brandé — Apple Mail
├── config.json                     # Config complète de génération AI + décisions
├── manifest.json                   # Index de l'archive avec métadonnées fichiers
└── LISEZ-MOI.txt                   # README lisible par un humain (rédigé par AI)
```

Chaque ZIP inclut une **page de prévisualisation live** hébergée sur `/api/signature/preview/{id}` :
- Rendu simulé boîte Gmail avec la signature live
- Compteur de cycle 4 variations (temps réel)
- Boutons d'installation one-click par client email
- Téléchargement direct des guides PDF

---

## Librairie d'effets premium — 55 chargés, 61 disponibles

Tous les effets sont chargés au démarrage depuis `Premium_Effect-main/`. Chaque effet est une classe d'animation complète avec paramètres configurables. L'API expose des métriques enrichies pour chaque effet : `particleCount`, `performanceTier`, `phases`, `physicsConstants`, `particleSystems`, `addictionMechanics`, `cssKeyframes` et plus.

| Catégorie | Effets |
|-----------|--------|
| **Organique / Vivant** | BREATHING, BREATHING OBJECT, HEARTBEAT, SOUL AURA |
| **Électrique / Lumière** | NEON GLOW, HOLOGRAM, ELECTRIC FORM, ELECTRIC HOVER, ENERGY FLOW, ENERGY IONIZE, SPARKLE AURA |
| **Cristal / Glace** | CRYSTAL GROW, ICE FREEZE, PRISM SPLIT |
| **Liquide / Vague** | LIQUID MORPH, LIQUID POUR, LIQUID STATE, WAVE DISSOLVE, WAVE DISTORTION, WAVE SURF |
| **Morphing / 3D** | MORPH 3D, MIRROR REALITY, DIMENSION SHIFT, ROTATION 3D |
| **Particules / Cosmique** | PARTICLE BUILD, STAR DUST FORM, STAR EXPLOSION, STELLAR DRIFT, SMOKE DISPERSE |
| **Digital / Quantique** | GLITCH SPAWN, REALITY GLITCH, QUANTUM PHASE, QUANTUM SPLIT, DNA BUILD, NEURAL PULSE, TYPEWRITER, SHADOW CLONE |
| **Feu** | FIRE CONSUME, FIRE WRITE |
| **Atmosphérique** | TORNADO ABSORB, TORNADO SPIN |
| **Temporel** | ECHO MULTIPLE, ECHO TRAIL, TIME ECHO, TIME REWIND |
| **Physique** | FLOAT DANCE, FLOAT PHYSICS, GRAVITY REVERSE, GYROSCOPE SPIN, MAGNETIC FIELD, MAGNETIC PULL, PENDULUM SWING |
| **Phase / Profondeur** | PHASE THROUGH, FADE LAYERS |

---

## Architecture interne — 14 modules serveur

```
server/
├── modules/                                     # 14 modules spécialisés
│   ├── color-harmony.module.ts                  # Moteur couleurs OKLCH + WCAG 2.1
│   ├── context-adaptation.module.ts             # Adaptation contextuelle multi-client email
│   ├── contextual-intelligence.module.ts        # Intelligence sectorielle + modération de style
│   ├── dynamic-fusion-orchestrator.module.ts    # Orchestrateur live multi-effets (3 niveaux)
│   ├── effect-fusion.module.ts                  # Composition multi-effets avec blend modes
│   ├── experience-orchestrator.module.ts        # Orchestration UX end-to-end (arc narratif φ)
│   ├── lighting.module.ts                       # Lumière dynamique + effets de glow
│   ├── morphing.module.ts                       # Morphing de formes SVG
│   ├── particles.module.ts                      # Moteur de systèmes de particules
│   ├── performance-adaptive.module.ts           # Optimiseur de performance adaptatif
│   ├── physics.module.ts                        # Simulation physique (gravité, élasticité)
│   ├── preset-manager.module.ts                 # Gestion des presets + CRUD + versioning
│   ├── timing-master.module.ts                  # Timing φ=1.618 Fibonacci + easing
│   └── variance-engine.module.ts               # Variation esthétique contrôlée
│
├── services/                                    # 18 services
│   ├── triple-ai-director.ts                    # Orchestrateur pipeline 3 cerveaux
│   ├── delivery-engine.ts                       # Pipeline de livraison 7 étapes
│   ├── package-builder.ts                       # Construction SVG→PNG + versions client
│   ├── pdf-generator.ts                         # PDFs multi-pages brandés (PDFKit)
│   ├── preview-page-generator.ts               # Constructeur de page de prévisualisation HTML
│   ├── zip-assembler.ts                         # Assemblage ZIP + génération manifest
│   ├── delivery-email.ts                        # Email Resend + pièces jointes PDF
│   ├── cerebras-content-generator.ts           # Génération de texte AI 6 sections
│   ├── api-key-rotator.ts                       # Rotation des clés + circuit breaker
│   ├── gemini-wrapper.ts                        # Client API Gemini
│   ├── cerebras-wrapper.ts                      # Client API Cerebras
│   ├── gmb-scraper.ts                           # Scraping profil Google My Business
│   ├── sector-classifier.ts                     # Classification sectorielle
│   ├── signature-renderer.ts                    # Renderer SVG de signature
│   ├── signature-delivery.ts                    # Livraison finale de signature
│   ├── effect-preview-generator.ts              # Génération de prévisualisations d'effets
│   ├── key-state-persistence.ts                # Persistance état des clés API en DB
│   └── zone-svg-renderer.ts                    # Composition SVG par zones
│
├── generator/                                   # 5 fichiers de génération SVG
│   ├── signature-base-generator.ts             # Constructeur de structure SVG de base
│   ├── signature-svg-exporter.ts               # Export SVG final + nettoyage
│   ├── signature-variations-generator.ts       # Constructeur de variations A/B/C/D
│   ├── js-generator.ts                          # Générateur de JavaScript d'animation
│   └── template-engine.ts                       # Moteur de templates SVG
│
├── utils/                                       # Utilitaires
│   ├── premium-effects-loader.ts               # Chargeur d'effets + parseur de métriques
│   ├── library-initializer.ts                  # Initialisation de la librairie au démarrage
│   └── dependency-checker.ts                   # Vérificateur de dépendances système
│
├── queue/
│   └── job-queue.ts                            # Gestionnaire de file de jobs
│
├── routes.ts                                   # 84 endpoints API
├── storage.ts                                  # Interface de stockage Drizzle
└── index.ts                                    # Point d'entrée Express
```

---

## Référence API — 84 Endpoints

### Génération de signature
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/effects/generate` | Lancer une génération dans la queue |
| `GET` | `/api/effects/status/:jobId` | Statut d'un job de génération |
| `POST` | `/api/signature/render` | Rendre un SVG de signature |
| `GET` | `/api/signature/preview/:id` | Page de prévisualisation live |
| `GET` | `/api/signature/download/:id` | Télécharger le package ZIP complet |
| `GET` | `/api/signature/export-file/:id/:type` | Télécharger un fichier individuel (`svg`, `gmail`, `outlook`, `pdf-gmail`, `pdf-outlook`, `pdf-apple`, `png`, `config`) |
| `POST` | `/api/signature/export` | Export de signature |
| `GET` | `/api/signature/latest-svg` | Dernier SVG généré |

### Librairie d'effets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/library/effects` | Lister tous les effets avec métriques enrichies |
| `GET` | `/api/library/effects/:id/download` | Télécharger le fichier source d'un effet |
| `GET` | `/api/library/real-time-stats` | Statistiques de la librairie (count, catégories) |
| `GET` | `/api/effect/preview/:id` | Prévisualisation d'un effet spécifique |
| `POST` | `/api/library/effects/enrich` | Re-enrichir tous les effets avec métriques parsées |

### Templates & Variantes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/signature/templates` | Lister les templates disponibles |
| `GET` | `/api/signature/templates/:sectorId` | Templates par secteur |
| `GET` | `/api/signature/variants/profiles` | Profils de variantes disponibles |
| `POST` | `/api/signature/variants` | Générer des variantes |
| `POST` | `/api/signature/variants/render` | Rendre une variante |
| `POST` | `/api/signature/variants/:variantId/render` | Rendre une variante spécifique |

### Module 1 — Timing Master (φ=1.618)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/timing/sectors` | Secteurs supportés |
| `GET` | `/api/timing/profiles/all` | Tous les profils de timing |
| `GET` | `/api/timing/profile` | Profil de timing courant |
| `POST` | `/api/timing/css` | Générer le CSS de timing |
| `POST` | `/api/timing/inject` | Injecter le timing dans un SVG |

### Module 2 — Color Harmony (OKLCH + WCAG 2.1)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/color/types` | Types d'harmonies disponibles |
| `POST` | `/api/color/analyze` | Analyser une palette |
| `POST` | `/api/color/harmony` | Générer une harmonie de couleurs |
| `POST` | `/api/color/harmonies/all` | Toutes les harmonies d'une couleur |
| `POST` | `/api/color/adapt` | Adapter une palette au secteur |
| `POST` | `/api/color/inject` | Injecter les couleurs dans un SVG |

### Module 3 — Context Adaptation
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/context/clients` | Clients email supportés |
| `POST` | `/api/context/detect` | Détecter le client email |
| `POST` | `/api/context/adapt` | Adapter le SVG à un client |
| `POST` | `/api/context/adapt/all` | Adapter à tous les clients |
| `POST` | `/api/context/inject` | Injecter l'adaptation dans le HTML |

### Module 4 — Performance Adaptive
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/performance/tiers` | Tiers de performance disponibles |
| `GET` | `/api/performance/tiers/all` | Détails de tous les tiers |
| `POST` | `/api/performance/resolve` | Résoudre le tier optimal |
| `POST` | `/api/performance/adapt` | Adapter au tier de performance |
| `POST` | `/api/performance/inject` | Injecter les optimisations dans le SVG |

### Module 5 — Preset Manager
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/presets` | Lister tous les presets |
| `POST` | `/api/presets` | Créer un preset |
| `GET` | `/api/presets/smart/:secteur` | Preset intelligent par secteur |
| `GET` | `/api/presets/public` | Presets publics |
| `GET` | `/api/presets/sector/:secteur` | Presets par secteur |
| `GET` | `/api/presets/:id` | Détails d'un preset |
| `PATCH` | `/api/presets/:id` | Modifier un preset |
| `DELETE` | `/api/presets/:id` | Supprimer un preset |
| `GET` | `/api/presets/:id/versions` | Versions d'un preset |
| `POST` | `/api/presets/:id/rollback/:versionId` | Restaurer une version |
| `POST` | `/api/presets/:id/use` | Utiliser un preset |

### Module 6 — Effect Fusion Engine
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/fusion/levels` | Niveaux de fusion disponibles |
| `POST` | `/api/fusion/compatibility` | Calculer la compatibilité entre effets |
| `POST` | `/api/fusion/suggest-weights` | Suggérer les poids de fusion optimaux |
| `POST` | `/api/fusion/fuse` | Fusionner plusieurs effets |
| `POST` | `/api/fusion/inject` | Injecter la fusion dans un SVG |

### Module 7 — Contextual Intelligence Moderator
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/moderation/ceilings` | Plafonds de modération par secteur |
| `POST` | `/api/moderation/score` | Scorer une combinaison d'effets |
| `POST` | `/api/moderation/moderate` | Modérer et ajuster une sélection d'effets |
| `POST` | `/api/moderation/css` | Générer le CSS modéré |

### Module 8 — Experience Orchestrator v3.0
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/orchestration/profiles` | Profils d'orchestration disponibles (10 rôles, 5 styles) |
| `GET` | `/api/orchestration/arc/:sectorId` | Arc narratif généré pour un secteur |
| `POST` | `/api/orchestration/orchestrate` | Orchestrer une expérience complète |
| `POST` | `/api/orchestration/inject` | Injecter l'orchestration dans le HTML |

### Module 10 — Dynamic Fusion Orchestrator v3.0
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/dfo/levels` | Niveaux d'orchestration (Standard/Pro/Ultimate) |
| `GET` | `/api/dfo/modules/:level` | Modules actifs pour un niveau |
| `POST` | `/api/dfo/preflight` | Validation pré-vol des paramètres |
| `POST` | `/api/dfo/orchestrate` | Pipeline DFO complet (jusqu'à score 94/100 God Tier) |

### Scraping GMB
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/signature/scrape-gmb` | Scraper un profil Google My Business |
| `POST` | `/api/signature/classify-sector` | Classifier le secteur d'activité |
| `POST` | `/api/signature/detect-style` | Détecter le style visuel |
| `GET` | `/api/signature/preview-sector/:sectorId` | Prévisualisation par secteur |
| `POST` | `/api/signature/deliver` | Déclencher la livraison |

### Système & Santé
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/system/health` | Aperçu de santé des modules |
| `GET` | `/api/modules/status` | État détaillé de tous les modules |
| `GET` | `/api/queue/jobs` | État de la file de traitement |
| `GET` | `/api/svg-quality-test/:filename?` | Test qualité SVG |

### Gestion des clés API
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/keys/status` | Santé + état d'usage de toutes les clés |
| `POST` | `/api/keys/add` | Ajouter une clé (persistée en DB) |
| `DELETE` | `/api/keys/:id` | Supprimer une clé |
| `POST` | `/api/keys/reset` | Réinitialiser tous les états de clés |
| `POST` | `/api/keys/test` | Tester une clé |
| `GET` | `/api/keys/replit` | Détecter les clés gérées par Replit |

---

## Système de rotation des clés API

Gestion de clés de niveau production intégrée à la plateforme :

- **Pool multi-clés** — clés illimitées par service, rotation automatique en cas d'échec
- **Score de santé composite** — pondération sur taux de succès, latence et état de refroidissement
- **Circuit breaker** — 5 échecs consécutifs déclenche une pause automatique de 2 minutes par clé
- **Épuisement prédictif** — surveillance de la vélocité horaire pour anticiper la limite de débit
- **Persistance PostgreSQL** — états des clés et configs survivent aux redémarrages (`api_key_configs` + `api_key_states`)
- **Intégration Replit** — détection automatique de `AI_INTEGRATIONS_OPENAI_API_KEY` et `AI_INTEGRATIONS_ANTHROPIC_API_KEY`
- **UI de gestion** — ajouter, inspecter et supprimer des clés depuis le System Matrix sans toucher aux variables d'environnement

---

## Module DFO — Dynamic Fusion Orchestrator v3.0

Le module 10 coordonne l'ensemble du pipeline en trois niveaux :

| Niveau | Nom | Modules actifs | Capacités |
|--------|-----|---------------|-----------|
| **1** | Standard | 4 modules | Timing + Couleurs + Performance + Contexte |
| **2** | Pro | 6 modules | + Fusion d'effets + Intelligence sectorielle |
| **3** | Ultimate | 8 modules | + Experience Orchestrator + Quality Reporter |

Le niveau Ultimate atteint un **score qualité de 94/100 God Tier** avec 8 modules coordonnés en pipeline séquentiel.

---

## Métriques des effets — ce que l'API expose

Chaque effet dans `/api/library/effects` remonte ses métriques parsées depuis le code source :

| Champ | Type | Description |
|-------|------|-------------|
| `particleCount` | number | Nombre total de particules simulées |
| `performanceTier` | string | `"low"` / `"medium"` / `"high"` |
| `phases` | string[] | Noms des phases d'animation |
| `phaseCount` | number | Nombre de phases |
| `totalCycleDurationMs` | number | Durée totale d'un cycle en ms |
| `particleSystems` | object | Paramètres max par système de particules |
| `physicsConstants` | object | Constantes physiques (élasticité, masse, gravité…) |
| `timingConstants` | object | Constantes de timing (BPS, FPS, intervalles…) |
| `addictionMechanics` | string[] | Mécaniques d'accroche visuelles |
| `keyFeatures` | string[] | Fonctionnalités clés de l'effet |
| `physicalSystems` | string[] | Systèmes physiques actifs |
| `easingCurves` | string[] | Courbes d'easing utilisées |
| `cssKeyframes` | string[] | Noms des keyframes CSS générées |
| `cssReady` | boolean | SVG/CSS directement exploitable |

---

## Démarrage rapide

### Prérequis
- Node.js 20+
- Base de données PostgreSQL (Neon recommandé)

### Installation

```bash
# Installer les dépendances
npm install

# Pousser le schéma de base de données
npm run db:push

# Démarrer le serveur de développement (port 5000)
npm run dev
```

### Build production

```bash
npm run build
npm start
```

Sortie du build : `dist/index.cjs` (serveur) + `dist/public/` (frontend).

---

## Variables d'environnement

### Requise

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |

### Modèles AI

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | GPT-4o Vision — Cerveau 1 |
| `ANTHROPIC_API_KEY` | Claude Opus — Cerveau 2 |
| `GEMINI_KEY_1` | Gemini 1.5 Pro — Cerveau 3 |
| `CEREBRAS_KEY_1` | Cerebras — génération de contenu |
| `SERPER_KEY_1` | Serper — scraping GMB |

> Des clés supplémentaires (`GEMINI_KEY_2`, `CEREBRAS_KEY_2`, etc.) peuvent être ajoutées à runtime depuis l'UI System Matrix et sont persistées en base.

### Optionnelle

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Livraison email (Resend) |

---

## Structure du projet

```
effectforge-ai/
├── client/src/
│   ├── pages/               # 9 pages de l'application
│   └── components/ui/       # Librairie de composants shadcn/ui
├── server/
│   ├── modules/             # 14 modules spécialisés
│   ├── services/            # 18 services (delivery, AI, clés, ZIP, PDF…)
│   ├── generator/           # Pipeline de génération SVG (5 fichiers)
│   ├── utils/               # Chargeur d'effets, initialiseur, checker
│   ├── queue/               # Gestionnaire de file de jobs
│   ├── routes.ts            # 84 endpoints API
│   ├── storage.ts           # Interface de stockage Drizzle
│   └── index.ts             # Point d'entrée Express
├── shared/
│   └── schema.ts            # Schema Drizzle + types Zod
├── Premium_Effect-main/     # 61 classes d'effets d'animation premium
└── exports/                 # Packages générés (nettoyage automatique, TTL 7j)
```

---

## Statistiques du codebase

| Métrique | Valeur |
|----------|--------|
| TypeScript total | ~30 000 lignes |
| Endpoints API | 84 |
| Modules internes | 14 |
| Effets premium | 55 chargés / 61 disponibles |
| Tables en base | 8 |
| Pages frontend | 9 |
| Fichiers générés par génération | 10 |
| Score qualité DFO Ultimate | 94/100 God Tier ✓ |

---

<div align="center">

**EffectForge AI — God Tier Signatures™**  
Version 3.0.0-GOD — Avril 2026

</div>
