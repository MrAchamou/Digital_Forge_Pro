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

## Bibliothèque d'Effets (50 effets)

| Catégorie | Effets |
|-----------|--------|
| **Vivants** | HEARTBEAT, SOUL_AURA, CRYSTAL_BREATH, SUBTLE_BREATHE |
| **Lumineux** | NEON_PULSE, GOLDEN_SHIMMER, EMBER_GLOW, SOLAR_FLARE, DIAMOND_FLASH |
| **Cosmiques** | PLASMA_DRIFT, AURORA_FLOW, COSMIC_DUST, STAR_DRIFT, LUNAR_TIDE |
| **Naturels** | SILK_WAVE, OCEAN_DEPTH, FOREST_MIST, INK_BLOOM, FROST_VEIL |
| **Précieux** | PEARL_SHIMMER, RUBY_PULSE, SAPPHIRE_GLOW, EMERALD_BREATH, GOLD_WEAVE |
| **Numériques** | DIGITAL_RAIN, DATA_STREAM, MATRIX_FALL, GLITCH_BLOOM, PIXEL_STORM |
| **Minimalistes** | SOFT_GRADIENT, DEEP_GLOW, MINIMAL_PULSE, CLEAN_FADE, VELVET_FADE |

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

## Structure du Projet

```
effectforge-ai/
├── server/
│   ├── services/
│   │   ├── gmb-scraper.ts          # Scraping complet GMB + logo
│   │   ├── triple-ai-director.ts   # Pipeline 3 cerveaux IA
│   │   └── signature-delivery.ts   # Export SVG/PDF/JSON
│   ├── routes.ts                   # API endpoints
│   └── index.ts                    # Serveur Express
├── client/src/
│   ├── pages/
│   │   ├── studio.tsx              # God Tier Studio (page principale)
│   │   └── ...                     # Autres pages
│   └── components/
│       └── ui/                     # shadcn/ui components
└── shared/
    └── schema.ts                   # Types Drizzle + Zod
```

---

*Version 3.0.0-GOD — Avril 2026*
