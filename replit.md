# EffectForge AI — Signatures Email Animées "God Tier"

## Vue d'ensemble

Application full-stack (React + Express + TypeScript) qui génère des **signatures email animées premium** via un **pipeline Triple-IA** (GPT-4o → Claude Opus → Gemini Flash). Le rendu utilise une architecture multi-couches par zones avec une bibliothèque de 55 effets premium et un système de modules intelligents.

**Langue de communication** : Français.

---

## Architecture Générale

```
Frontend (React + Vite)           Backend (Express + TypeScript)
─────────────────────────         ──────────────────────────────────────
client/src/                       server/
  pages/                            index.ts          ← Serveur principal
  hooks/                            routes.ts         ← API REST
    use-effect-generator.ts         services/         ← Pipeline IA
  components/                         triple-ai-director.ts  ← Orchestrateur 3 IA
  lib/                                zone-effect-selector.ts
    queryClient.ts                    zone-svg-renderer.ts
                                      harmony-validator.ts
                                      gemini-wrapper.ts
                                    modules/          ← Modules intelligents
                                    data/
                                      zone-effects-library.json
```

---

## Pipeline Triple-IA

```
1. GPT-4o (Cerveau 1)
   → Analyse de la signature (secteur, palette, ton, marque)
   → Génère le CreativeBrief + NarrativeScenario (4 variations A/B/C/D)

2. Claude Opus (Cerveau 2)
   → Reçoit le brief de GPT-4o
   → Génère la TechnicalConfig (intensités, vitesses, paramètres par zone)

3. Gemini Flash (Cerveau 3)
   → Sélection multi-couches par zone (zone-effect-selector.ts)
   → 4 passes séquentielles A→B→C→D pour garantir diversité
   → Validation harmonique (harmony-validator.ts)
   → Post-traitement par les modules Priorité 1+2

4. zone-svg-renderer.ts
   → Convertit les ZoneComposition en SVG+CSS animé
   → Rendu multi-couches (renderZoneWithLayers + mergeEffects)
```

---

## Architecture Multi-Couches par Zone

Chaque signature est composée de **7 zones** :

| Zone | Type | Couches max |
|------|------|-------------|
| `logo` | Multi-couches | 4 (dimension + matière + énergie + transformation) |
| `nom` | Multi-couches | 2 (lumière + mouvement) |
| `titre` | Plat | 1 |
| `contact` | Plat | 1 |
| `séparateur` | 2 couches | primary + secondary optionnel |
| `fond` | 2 couches | primary + secondary (très subtil) |
| `cta` | 2 couches | primary + secondary |

---

## Modules Intelligents (server/modules/)

### ✅ Module 1 — VarianceEngine v1.0 (opérationnel)

**Fichier** : `server/modules/variance-engine.module.ts`

Génère 4 variantes visuelles distinctes d'une même signature secteur par mutation génétique de 3 couches :

| Couche | Paramètres |
|--------|-----------|
| **PaletteGene** | Mutation HSL : hue shift, saturation ×, lightness offset pour fond + accent + texte |
| **TimingGene** | Délais × (φ⁻¹ rapide / φ lent / staccato) + durées × + jitter déterministe |
| **IntensityGene** | brightness(), scale factor, shadow alpha, glow radius |

**4 profils génétiques :**
- `A — Canon` : aucune mutation, fidèle au JSON secteur (fitness=0.85)
- `B — Intense` : palette +35% saturation, délais ×φ⁻¹=0.618, brightness ×1.35 (fitness=0.91)
- `C — Éthéré` : palette délavée -35% sat, délais ×φ=1.618, luminosité +18% (fitness=0.87)
- `D — Contrasté` : accent hue +180° (complémentaire), staccato Δ0.25s (fitness=0.88)

**Injection** : bloc `<style id="variance-override-X" data-engine="VarianceEngine-1.0.0">` injecté avant `</head>` — zéro modification HBS/JSON.

**Routes API exposées :**
```
GET  /api/signature/variants/profiles          — 4 profils génétiques (sans rendu)
POST /api/signature/variants                   — métadonnées + CSS overrides (sans HTML)
POST /api/signature/variants/render            — 4 HTMLs complets (A+B+C+D)
POST /api/signature/variants/:id/render        — 1 HTML (A ou B ou C ou D)
```

**Performance** : 4 variantes en ~40ms, 0 dépendance externe, 10/10 secteurs validés.

### Modules existants (hérités)

| Module | Fichier | Rôle |
|--------|---------|------|
| **TimingMaster** | `timing-master.module.ts` | Durées basées sur φ et Fibonacci. Fallback Outlook. prefers-reduced-motion. |
| ColorHarmonyEngine | `color-harmony.module.ts` | Harmonies triadiques/analogues/split-comp |
| Physics | `physics.module.ts` | Calculs physiques pour effets dynamiques |
| Particles | `particles.module.ts` | Système de particules |
| Morphing | `morphing.module.ts` | Transformations morphologiques |
| Lighting | `lighting.module.ts` | Éclairage et ombres |
| PresetManager | `preset-manager.module.ts` | Gestionnaire de presets |

### ✅ Priorité 2 — Intelligence de rendu

| Module | Fichier | Rôle |
|--------|---------|------|
| **ContextualIntelligenceModerator** | `contextual-intelligence.module.ts` | Analyse la complexité des compositions générées. Écrête les couches excessives. Protège les zones lisibilité (titre, contact). Règles par secteur (finance=discret, startup=explosif). |
| **SmartOptimizer** | `smart-optimizer.module.ts` | Calibre les intensités/vitesses selon le secteur, le profil de variation (A/B/C/D), la complexité du logo et le ton émotionnel. Matrices secteur × variation × contenu. |
| **VisualFocusEngine** | `visual-focus.module.ts` | Guide l'œil selon un chemin adaptatif : A=logo→nom→CTA, B=logo→CTA→nom, C=fond→logo→nom→CTA, D=logo→CTA. Cascade Fibonacci d'apparition. Contraste adaptatif par zone. |

### Modules existants (hérités)

| Module | Rôle |
|--------|------|
| `quality-assurance.module.ts` | QA du rendu final |
| `physics.module.ts` | Calculs physiques pour effets dynamiques |
| `particles.module.ts` | Système de particules |
| `morphing.module.ts` | Transformations morphologiques |
| `lighting.module.ts` | Éclairage et ombres |
| `library-expansion.module.ts` | Extension de la bibliothèque d'effets |
| `error-detection.module.ts` | Détection et correction automatique d'erreurs |
| `batch-generator.module.ts` | Génération en lot |

---

## Bibliothèque d'effets

**55 effets premium** dans `server/data/zone-effects-library.json`, organisés par zones et catégories :

- **Logo** : dimension (3D_FLOAT, GYROSCOPE…), matière (GOLD_POLISH, CRYSTAL…), énergie (HALO_PULSE, ELECTRIC_FIELD…), transformation (LIQUID_EDGE…)
- **Nom** : lumière (NEON_GLOW, GOLDEN_SHIMMER…), mouvement (WAVE_MOTION, FLOAT…)
- **Titre / Contact** : effets subtils (FADE_IN, SLIDE, TYPEWRITER…)
- **Séparateur** : lignes animées (WAVE, PULSE, ELECTRIC…)
- **Fond** : ambiances (AURORA, COSMIC, PLASMA_DRIFT…)
- **CTA** : impacts forts (HEARTBEAT, FIRE_BORDER, PRISM…)

---

## Types clés

```typescript
// harmony-validator.ts
interface EffectLayer { effet_id, category, intensity, speed, color }
interface ZoneEffectDecision { effet_id, intensity, speed, color, layers?: EffectLayer[] }
interface ZoneComposition { logo, nom, titre, contact, separateur, fond, cta }

// zone-effect-selector.ts
interface CategoryCandidates { [category: string]: EffetCandidat[] }
interface ZoneSelection { logo: CategoryCandidates, nom: CategoryCandidates, ... }
```

---

## Base de données PostgreSQL (Neon)

**Driver** : `@neondatabase/serverless` Pool + `drizzle-orm/neon-serverless` + `ws` (WebSocket)

**IMPORTANT** : Utiliser `drizzle-orm/neon-serverless` avec `Pool` (PAS `drizzle-orm/neon-http` + `neon()`) — ce dernier retourne `null` pour les tables vides et casse les `.map()` dans Drizzle.

```typescript
// server/db.ts — pattern correct
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

### Tables PostgreSQL (`shared/schema.ts`)

| Table | Rôle |
|-------|------|
| `analytics_events` | Évènements de génération (variation, secteur, effets utilisés) |
| `visual_fingerprints` | Empreintes visuelles MD5 pour détecter les doublons (distance Hamming) |
| `user_preferences` | Préférences utilisateur persistées (k-means clustering) |
| `presets` | Presets sauvegardés + 10 presets intelligents auto-initialisés |

### Modules v2 avec persistance PostgreSQL

| Module | Version | Fonctionnalités DB |
|--------|---------|-------------------|
| `analytics.module.ts` | v3.0 | Persistance évènements, alertes configurables, export CSV/JSON, segmentation |
| `visual-signature-engine.module.ts` | v2.0 | Persistance fingerprints, watermark SVG, distance Hamming |
| `user-preferences-engine.module.ts` | v2.0 | Persistance préférences, clustering, recommandations proactives |
| `preset-manager.module.ts` | v2.0 | Persistance presets, versioning, thumbnails SVG animées, partage public |

### Nouvelles routes API

```
GET  /api/analytics/alerts           — alertes configurables
GET  /api/analytics/segmentation     — segmentation par variation/profil
GET  /api/analytics/export/csv       — export CSV
GET  /api/analytics/export/json      — export JSON complet
GET  /api/signatures/history         — historique fingerprints
GET  /api/presets/smart/:sector      — presets intelligents par secteur
GET  /api/presets/public             — presets partagés publiquement
POST /api/presets/:id/version        — créer nouvelle version
POST /api/presets/:id/rollback       — rollback vers version précédente
GET  /api/preferences/recommendations — recommandations proactives
```

---

## Dépendances principales

- **OpenAI** (GPT-4o) + **Anthropic** (Claude Opus) + **Google Gemini Flash** — pipeline Triple-IA
- **Express** + **TypeScript** + **tsx** — serveur (via `npx tsx server/index.ts`)
- **React** + **Vite** + **TanStack Query** — frontend
- **shadcn/ui** + **Tailwind CSS** + **Wouter** — UI
- **Neon PostgreSQL** + **Drizzle ORM** + **ws** — base de données

---

## Lancement

```bash
# Workflow : NODE_ENV=development npx tsx server/index.ts
# Port : 5000 (Express + Vite proxy)
```

---

## État du projet

- **P1** ✅ ColorHarmonyEngine + TimingMaster + VarianceEngine
- **P2** ✅ ContextualIntelligenceModerator + SmartOptimizer + VisualFocusEngine
- **P3** ✅ DynamicFusionOrchestrator + EffectFusionEngine + ExperienceOrchestrator
- **P4** ✅ AdaptiveRenderingEngine + ContentAnalyzer + AnalyticsModule (v3 PostgreSQL)
- **P5** ✅ PredictiveTransitionEngine + AttentionGuide + VisualSignatureEngine (v2 DB) + UserPreferencesEngine (v2 DB) + PresetManager (v2 DB)
