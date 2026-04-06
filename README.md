# EffectForge AI — God Tier Studio

![Version](https://img.shields.io/badge/Version-3.0.0--GOD-ff6b35?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20TypeScript-00d4ff?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-GPT--4o%20%7C%20Claude%20Opus%20%7C%20Gemini%20Pro-9333ea?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-00ff00?style=for-the-badge)

**EffectForge AI** génère des signatures email animées "God Tier" en SVG à partir de n'importe quel profil Google My Business. Trois intelligences artificielles travaillent en cascade pour produire des signatures visuellement exceptionnelles et techniquement parfaites pour tous les clients email.

---

## Architecture — Pipeline 3 Cerveaux IA

```
URL Google My Business
        │
        ▼
┌───────────────────────────────────────┐
│  SERPER GMB SCRAPER                   │
│  • Toutes les données GMB (nom,       │
│    adresse, téléphone, horaires,      │
│    note, avis, photos, réseaux        │
│    sociaux, mots-clés, slogan…)       │
│  • Capture logo via Clearbit API      │
│  • Détection secteur & palette auto   │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│  CERVEAU 1 — GPT-4o Vision            │
│  Rôle : Directeur Artistique          │
│  • Analyse logo + métadonnées         │
│  • Brief créatif complet              │
│  • Références visuelles (3 marques)   │
│  • Psychologie des couleurs           │
│  • Personnalité de marque             │
│  • Cible audience & différenciateur   │
│  • Mot-clef narratif central          │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│  CERVEAU 2 — Claude Opus              │
│  Rôle : Directeur Narratif & Poète    │
│  • Arc émotionnel A→B→C→D             │
│  • Fil conducteur & métaphore centrale│
│  • 4 variations avec titre, sous-titre│
│    intention, métaphore, émotion      │
│  • Sélection cohérente des 50 effets  │
│  • Note du directeur artistique       │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│  CERVEAU 3 — Gemini 1.5 Pro           │
│  Rôle : Ingénieur Créatif Senior      │
│  • Calibration technique des effets   │
│  • Paramètres spécifiques par effet   │
│  • Optimisation compatibilité email   │
│  • Timing cycle (200-280s)            │
│  • Courbes d'easing sur mesure        │
│  • Notes techniques & optimisations   │
└──────────────────┬────────────────────┘
                   │
                   ▼
        Signature SVG Animée
     Export SVG / PDF / JSON
```

---

## Bibliothèque d'Effets Premium (62 effets réels)

Tous les effets sont chargés au démarrage depuis le dossier `Premium_Effect-main/`.
Chaque effet est une classe JavaScript complète héritant de `BaseEffect` avec son propre code d'animation.

| Catégorie | Effets |
|-----------|--------|
| **Vivants** | HEARTBEAT, SOUL AURA, BREATHING, BREATHING OBJECT |
| **Lumineux / Électrique** | NEON GLOW, HOLOGRAM, ELECTRIC FORM, ELECTRIC HOVER, ENERGY FLOW, ENERGY IONIZE, SPARKLE AURA |
| **Cristal / Glace** | CRYSTAL GROW, CRYSTAL SHATTER, ICE FREEZE, PRISM SPLIT, RAINBOW SHIFT |
| **Liquide / Vague** | LIQUID MORPH, LIQUID POUR, LIQUID STATE, WAVE DISSOLVE, WAVE DISTORTION, WAVE SURF |
| **Morphing** | MORPH 3D, MÉTAMORPHOSES D'IMAGES, MIRROR REALITY, DIMENSION SHIFT |
| **Particules / Cosmique** | PARTICLE BUILD, PARTICLE DISSOLVE, STAR DUST FORM, STAR EXPLOSION, STELLAR DRIFT, SMOKE DISPERSE |
| **Digital / Quantique** | GLITCH SPAWN, REALITY GLITCH, QUANTUM PHASE, QUANTUM SPLIT, DNA BUILD, NEURAL PULSE, TYPEWRITER, SHADOW CLONE |
| **Feu** | FIRE CONSUME, FIRE WRITE |
| **Atmosphérique** | TORNADO ABSORB, TORNADO SPIN, TORNADO TWIST |
| **Physique / Gravité** | MAGNETIC FIELD, MAGNETIC PULL, GRAVITY REVERSE, FLOAT DANCE, FLOAT PHYSICS, PENDULUM SWING, ORBIT DANCE, GYROSCOPE SPIN |
| **Temporel** | ECHO MULTIPLE, ECHO TRAIL, TIME ECHO, TIME REWIND |
| **Énergie** | PHASE THROUGH, PLASMA STATE |
| **Transformation** | ROTATION 3D, FADE LAYERS |

> **Chargement automatique** : Le serveur lit `Premium_Effect-main/*/Description.txt` et le fichier `.js` correspondant à chaque démarrage.
> Les doublons sont détectés par `premiumId` unique — aucune duplication possible même après redémarrage.

---

## Stack Technique

### Backend
- **Node.js 20 + TypeScript** — Serveur Express
- **PostgreSQL + Drizzle ORM** — Base de données
- **OpenAI SDK** — GPT-4o Vision (Cerveau 1)
- **Anthropic SDK** — Claude Opus (Cerveau 2)
- **Google Generative AI SDK** — Gemini 1.5 Pro (Cerveau 3)
- **Serper API** — Scraping Google My Business
- **Clearbit API** — Capture logo entreprise

### Frontend
- **React 18 + TypeScript** — Interface
- **Vite** — Build & HMR
- **TanStack Query v5** — État serveur
- **Tailwind CSS + shadcn/ui** — Design system
- **Canvas API** — Prévisualisation live

---

## Variables d'Environnement

| Variable | Description | Source |
|----------|-------------|--------|
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Clé OpenAI pour GPT-4o | Replit Integration |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Base URL OpenAI | Replit Integration |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Clé Anthropic pour Claude | Replit Integration |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Base URL Anthropic | Replit Integration |
| `GEMINI_API_KEY` | Clé Google Gemini | Replit Secrets |
| `SERPER_API_KEY` | Clé Serper pour GMB | Replit Secrets |
| `DATABASE_URL` | PostgreSQL | Replit Database |

---

## API Endpoints

```
POST /api/signature/scrape-gmb
  Body: { gmb_url: string }
  → Données complètes GMB + logo + palette

POST /api/signature/analyze-and-configure
  Body: { metadata, signatureImageBase64? }
  → Pipeline 3 cerveaux complet

POST /api/signature/generate-svg
  Body: { metadata, config, scenario }
  → Signature SVG animée

POST /api/signature/export
  Body: { svgContent, format: "svg"|"pdf"|"json", metadata }
  → Fichier exporté

GET  /api/system/health
  → Statut système GOD
```

---

## Scraper GMB — Données Capturées

Le scraper collecte l'intégralité des données disponibles sur Google My Business :

- **Identité** : Nom, catégorie, description, slogan, année fondation
- **Contact** : Téléphone, email (extraction depuis recherche web), site web
- **Localisation** : Adresse complète, ville, code postal, pays, coordonnées GPS
- **Réputation** : Note (★), nombre d'avis
- **Horaires** : Horaires d'ouverture jour par jour
- **Visuels** : Logo (Clearbit HD → Google Favicon fallback), photos GMB
- **Social** : Facebook, Instagram, LinkedIn, Twitter, YouTube, TikTok
- **Enrichissement** : Mots-clés, gamme de prix, accessibilité
- **Branding auto** : Palette couleurs par secteur, ton de communication

---

## Démarrage

```bash
# Développement (port 5000)
npm run dev

# Build production
npm run build

# Démarrage production
npm start
```

---

## Modules Avancés — Pipeline d'Intelligence

### ✅ Priorité 1 — Fondamentaux visuels
| Module | Fichier | Rôle |
|--------|---------|------|
| **ColorHarmonyEngine** | `server/modules/color-harmony.module.ts` | Palettes complémentaires (triadiques, analogues, split-complémentaires) |
| **TimingMaster** | `server/modules/timing-master.module.ts` | Durées basées sur le nombre d'or (φ=1.618) + séquences Fibonacci |
| **VarianceEngine** | `server/modules/variance-engine.module.ts` | Moteur génétique ADN — garantit que A/B/C/D sont maximalement distincts |

### ✅ Priorité 2 — Intelligence de rendu
| Module | Fichier | Rôle |
|--------|---------|------|
| **ContextualIntelligenceModerator** | `server/modules/contextual-intelligence.module.ts` | Modère la complexité par secteur, évite la sur-complexification |
| **SmartOptimizer** | `server/modules/smart-optimizer.module.ts` | Calibration adaptative des intensités/vitesses selon le contenu |
| **VisualFocusEngine** | `server/modules/visual-focus.module.ts` | Guide l'œil logo → nom → CTA via règle des tiers |

### ✅ Priorité 3 — Orchestration des couches
| Module | Fichier | Rôle |
|--------|---------|------|
| **EffectFusionEngine** | `server/modules/effect-fusion-engine.module.ts` | Recettes de mélange hybrides (40% PARTICLE + 30% ENERGY + 30% FLUID) |
| **DynamicFusionOrchestrator** | `server/modules/dynamic-fusion-orchestrator.module.ts` | Blueprint cross-zones + matrice de compatibilité, niveaux Standard/Pro/Ultimate |
| **ExperienceOrchestrator** | `server/modules/experience-orchestrator.module.ts` | Arc émotionnel Intro→Développement→Climax→Outro + micro-récompenses visuelles |

---

## Structure du Projet

```
effectforge-ai/
├── server/
│   ├── services/
│   │   ├── gmb-scraper.ts              # Scraping complet GMB + logo
│   │   ├── triple-ai-director.ts       # Pipeline 3 cerveaux IA + P1/P2/P3
│   │   ├── zone-svg-renderer.ts        # Rendu SVG par zone (TimingMaster + ColorHarmony)
│   │   └── signature-delivery.ts       # Export SVG/PDF/JSON
│   ├── modules/
│   │   ├── color-harmony.module.ts     # P1 — Palettes intelligentes
│   │   ├── timing-master.module.ts     # P1 — Durées φ et Fibonacci
│   │   ├── variance-engine.module.ts   # P1 — Diversité génétique A/B/C/D
│   │   ├── contextual-intelligence.module.ts  # P2 — Modération par secteur
│   │   ├── smart-optimizer.module.ts   # P2 — Calibration adaptative
│   │   ├── visual-focus.module.ts      # P2 — Guide œil logo→CTA
│   │   ├── effect-fusion-engine.module.ts      # P3 — Recettes hybrides
│   │   ├── dynamic-fusion-orchestrator.module.ts # P3 — Blueprint cross-zones
│   │   └── experience-orchestrator.module.ts   # P3 — Arc émotionnel
│   ├── routes.ts                       # API endpoints
│   └── index.ts                        # Serveur Express
├── client/src/
│   ├── pages/
│   │   ├── studio.tsx                  # God Tier Studio (page principale)
│   │   └── ...                         # Autres pages
│   └── components/
│       └── ui/                         # shadcn/ui components
└── shared/
    └── schema.ts                       # Types Drizzle + Zod
```

---

*Version 3.0.0-GOD — Avril 2026*
