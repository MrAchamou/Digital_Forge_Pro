# EffectForge AI — Signatures Email Animées "God Tier"

## Vue d'ensemble

Application full-stack (React + Express + TypeScript) qui génère des **signatures email animées premium** via un **pipeline Triple-IA** (GPT-4o → Claude Opus → Gemini Flash). Le rendu utilise une architecture multi-couches par zones avec une bibliothèque de **55 effets premium** et un système de modules intelligents.

**Langue de communication** : Français.

---

## Architecture Générale

```
Frontend (React + Vite)           Backend (Express + TypeScript)
─────────────────────────         ──────────────────────────────────────
client/src/                       server/
  pages/                            index.ts          ← Serveur principal
    export-studio.tsx               routes.ts         ← API REST
  hooks/                            services/         ← Pipeline IA
    use-effect-generator.ts           triple-ai-director.ts  ← Orchestrateur 3 IA
  components/                         zone-effect-selector.ts
  lib/                                zone-svg-renderer.ts
    queryClient.ts                    harmony-validator.ts
                                      gemini-wrapper.ts
                                      signature-export-complete.ts  ← Moteur SVG animé + GIF
                                      contact-info-living-system.ts ← CILS (zone contact)
                                      preview-page-generator.ts     ← Preview email client
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

## Moteur SVG Animé (`signature-export-complete.ts`)

### Layout de référence (viewBox 0 0 600 190)

```
x=0    x=4   x=24(cx)   x=108   x=124             x=568/600
│      │      │           │       │                 │
│ glow │      │  avatar   │  sep  │  contenu CILS   │
│ bar  │      │  r=50     │  V    │                 │
│      │      │  cy=95    │       │                 │
```

| Élément | Position |
|---------|----------|
| Barre accent (glow) | `x=0, width=4` |
| Avatar/Logo centré | `cx=24, cy=95, r=50` |
| **Séparateur vertical** | `x=108` (34 px de marge depuis le bord droit du logo) |
| **Contenu CILS** | `x=124` (icônes), `x=137/138` (textes) |
| Séparateur horizontal | `x1=124, x2=568` |
| `SEP_H_LEN` | `444` (568 − 124) |

### VarianceEngine Background (animé uniquement)

Injecté après le `<rect>` de fond, avant la barre glow :

- **24 particules stellaires** déterministes (seed index × constante) — chacune animée `twinkle + drift`
- **3 balayages diagonaux** `skewX(-12deg)` traversant la signature en 18 s (délais 0 / 6 / 12 s)
- Désactivé en mode statique (`animated === false`)

### Positions Y du CILS (séquentielles, pas de chevauchement)

```typescript
const _DY = 17;    // espacement entre champs
const _Y0 = 99;    // Y de départ
// yPhone   = _Y0 + _DY × 0   = 99
// yEmail   = _Y0 + _DY × 1   = 116
// yAddr    = _Y0 + _DY × 2   = 133
// ySite    = _Y0 + _DY × 3   = 150
// yNote    = _Y0 + _DY × 4   = 167
```

---

## Export Studio (`/export`)

Page de génération manuelle de signatures sans IA :

- **Onglet Google Maps** : extraction automatique depuis une URL Maps
- **Onglet Saisie manuelle** : formulaire complet (nom, titre, entreprise, téléphone, email, site, adresse, CP, ville, CTA, note étoiles, upload logo)
- Génère un SVG animé identique au pipeline IA
- Produit le même lien de preview premium

---

## Preview Premium (`preview-page-generator.ts`)

Le lien de preview généré après chaque signature produit une **page livrable de niveau client** :

### Fenêtre email macOS complète

```
┌─────────────────────────────────────────────────────────────┐
│ ● ● ●                    Gmail — Boîte de réception         │  ← Chrome macOS
├─────────────────────────────────────────────────────────────┤
│ [✏ Nouveau message]  [ 🔍 Rechercher dans les e-mails ]    │  ← Toolbar
├──────────┬──────────────┬────────────────────────────────────┤
│          │ Boîte de     │  Objet : [généré selon secteur]    │
│  Nav     │ réception    │  De : Nom Client · Titre           │
│  sidebar │              │  À : Destinataire fictif           │
│  (icônes │  6 fausses   │                                    │
│  Gmail)  │  emails      │  [Corps email personnalisé]        │
│          │  contextuels │  — secteur/nom/entreprise/CTA —    │
│          │  (Calendly,  │                                    │
│          │  Stripe,     │  ── Signature professionnelle ──   │
│          │  LinkedIn…)  │  [SVG ANIMÉ VIVANT]                │
│          │              │  ════ VAR A · 00:00 ════           │
└──────────┴──────────────┴────────────────────────────────────┘
```

### Contenu email contextualisé (`buildEmailContent`)

Génère un email réaliste selon le secteur détecté dans les métadonnées :

| Secteur | Destinataire | Sujet exemple |
|---------|-------------|---------------|
| Santé / Médical | Dr. Sophie Lambert | "Suite à votre consultation" |
| Tech / Digital | Thomas Renard | "Proposition de collaboration" |
| Artisanat / Bâtiment | Jean-Luc Perrin | "Devis pour vos travaux" |
| Immobilier | Claire Fontaine | "Votre projet immobilier" |
| Restauration | Isabelle Moreau | "Prestation traiteur" |
| Coaching / Conseil | Alexandre Petit | "Programme sur mesure" |
| Défaut | Marie Durand | "Suite à notre échange" |

### Interactions premium

| Interaction | Effet |
|------------|-------|
| Survol fenêtre email | Tilt 3D parallax (perspective 1400px, ±2.5°) + sparkles |
| Survol zone signature | Restart animations SVG (mouseenter) |
| Bouton "Rejouer" | Restart complet + burst 16 sparkles |
| IntersectionObserver | Restart au scroll into viewport |
| Pulse 25 s | Brightness flash + 5 sparkles |
| Starfield (70 étoiles) | Fond twinkle animé |

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

### ✅ Module 2 — TimingMaster v3.0 (opérationnel)

**Fichier** : `server/modules/timing-master.module.ts`

Orchestrateur temporel de précision militaire — synchronise toutes les zones sur un métronome BPM commun via un arc narratif intro→développement→climax→repos.

| Composant | Description |
|-----------|-------------|
| **MetronomeSync** | Délais calculés en beats (60/BPM) — toutes les zones respirent ensemble |
| **SectorAwareness** | 10 profils métier : Finance(BPM=44, ×φ=1.618) → Startup(BPM=96, ×φ⁻¹=0.618) |
| **NarrativeTimeline** | fond=intro(0 beats) → logo/nom/sep=develop(2) → titre/contact=climax(4) → cta=rest(7) |
| **DeterministicJitter** | Jitter djb2-hash — 100% reproductible, zéro Math.random() |
| **CharacterStagger** | Délai Fibonacci par lettre pour TYPEWRITER/NAME_REVEAL |
| **CSS Injection** | Bloc `<style id="timing-master-v3">` + MSO Outlook + prefers-reduced-motion |

**Routes API exposées :**
```
GET  /api/timing/sectors           — 10 profils secteur (BPM, easing, intensity)
GET  /api/timing/profile           — Profil complet variation + secteur
GET  /api/timing/profiles/all      — Matrice 40 profils (10 secteurs × 4 variations)
POST /api/timing/css               — Bloc CSS injectable (style + Outlook + reduced-motion)
POST /api/timing/inject            — Injection CSS dans un HTML complet
```

### ✅ Module 3 — ColorHarmonyEngine v3.0 (opérationnel)

**Fichier** : `server/modules/color-harmony.module.ts`

Moteur de cohérence chromatique — génère des harmonies, adapte la palette secteur au logo uploadé, valide WCAG et injecte les variables CSS.

| Composant | Description |
|-----------|-------------|
| **HarmonyGenerator** | 7 types : complementary, triadic, analogous, split-comp, tetradic, monochromatic, square |
| **SectorPaletteAdapter** | Adapte bg + accent + text + muted + border à une couleur dominante de logo |
| **AccessibilityGuard** | WCAG 2.1 AA (ratio ≥ 4.5) / AAA (≥ 7.0) — ajustement automatique par itération HSL |
| **GradientEngine** | linear + radial + conic CSS générés automatiquement depuis la palette |
| **CSS Variable Injector** | `--sig-bg` `--sig-accent` `--sig-text` `--sig-muted` `--sig-border` avant `</head>` |

**Routes API exposées :**
```
GET  /api/color/types           — 7 types d'harmonies disponibles
POST /api/color/analyze         — Analyse HSL + luminance + contraste WCAG
POST /api/color/harmony         — Génère une harmonie + palette + CSS variables
POST /api/color/harmonies/all   — Les 7 harmonies pour une couleur
POST /api/color/adapt           — Adapte palette secteur à couleur dominante logo
POST /api/color/inject          — Injecte CSS (WCAG auto-enforced) dans un HTML
```

### ✅ Module 4 — ContextAdaptationEngine v3.0 (opérationnel)

**Fichier** : `server/modules/context-adaptation.module.ts`

Adapte automatiquement la signature à chaque client email et mode couleur — élimine le problème "texte blanc sur fond blanc" en mode clair.

| Composant | Description |
|-----------|-------------|
| **ClientDetector** | Identifie le client email depuis User-Agent ou hint (10 clients) |
| **ColorSchemeAdapter** | Génère palettes light + dark automatiquement, prefers-color-scheme natif |
| **ClientCSSGenerator** | Overrides spécifiques : MSO/Outlook, Gmail inline-only, Apple Mail webkit |
| **SafetyValidator** | Garantit contraste ≥ 4.5 (WCAG AA) dans les 4 combinaisons client×mode |
| **HTML Injector** | CSS + MSO + dark-mode avant `</head>`, compatible VarianceEngine+Timing+Color |

**Routes API exposées :**
```
GET  /api/context/clients         — 10 profils clients email
POST /api/context/detect          — Détecte le client depuis hint/User-Agent
POST /api/context/adapt           — CSS + inline + MSO pour un client + scheme
POST /api/context/adapt/all       — Matrice 10 clients en une passe
POST /api/context/inject          — Injecte dans un HTML complet
```

### ✅ Module 5 — PerformanceAdaptiveEngine v3.0 (opérationnel)

**Fichier** : `server/modules/performance-adaptive.module.ts`

Génère 3 niveaux de CSS d'animation (Ultra / Standard / Lite) et dégrade automatiquement selon les capacités détectées de l'appareil.

| Composant | Description |
|-----------|-------------|
| **TierResolver** | Score (0-100) → tier depuis 7 hints (device, GPU, connexion, FPS, mobile, reducedMotion, dataSaver) |
| **CSSLayerGenerator** | Ultra (fps60/100% particules), Standard (fps30/50%), Lite (fps15/0% → transitions seules) |
| **MediaQueryStack** | `prefers-reduced-motion` + `prefers-data-saver` + `update:slow` + mobile 480px 1.5dppx |
| **RuntimeDetectionSnippet** | Snippet JS inline — mesure FPS réel sur 30 frames, ajuste tier via CSS vars dynamiquement |
| **HTML Injector** | CSS + media queries avant `</head>`, snippet JS avant `</body>`, compatible tous modules antérieurs |

**Routes API exposées :**
```
GET  /api/performance/tiers         — 3 configs Ultra/Standard/Lite
POST /api/performance/resolve       — Résout le tier depuis les hints
POST /api/performance/adapt         — CSS adaptatif complet pour les hints
GET  /api/performance/tiers/all     — Matrice 3 tiers pré-générée
POST /api/performance/inject        — Injecte dans un HTML complet + snippet JS FPS
```

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

### ✅ Priorité 2 — Intelligence de rendu

| Module | Fichier | Rôle |
|--------|---------|------|
| **ContextualIntelligenceModerator** | `contextual-intelligence.module.ts` | Analyse la complexité des compositions générées. Écrête les couches excessives. Protège les zones lisibilité (titre, contact). Règles par secteur (finance=discret, startup=explosif). |
| **SmartOptimizer** | `smart-optimizer.module.ts` | Calibre les intensités/vitesses selon le secteur, le profil de variation (A/B/C/D), la complexité du logo et le ton émotionnel. Matrices secteur × variation × contenu. |
| **VisualFocusEngine** | `visual-focus.module.ts` | Guide l'œil selon un chemin adaptatif : A=logo→nom→CTA, B=logo→CTA→nom, C=fond→logo→nom→CTA, D=logo→CTA. Cascade Fibonacci d'apparition. Contraste adaptatif par zone. |

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
- **P6** ✅ Export Studio (`/export`) — saisie manuelle complète + logo upload
- **P7** ✅ Alignements CILS — séparateur x=108, contenu x=124, SEP_H_LEN=444, positions Y séquentielles (Δ17px)
- **P8** ✅ VarianceEngine Background — 24 particules stellaires + 3 scan diagonaux dans SVG animé
- **P9** ✅ Preview Premium — client email macOS complet (fenêtre + sidebar + liste + email personnalisé par secteur + signature vivante)
