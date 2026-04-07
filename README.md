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

**A full-stack AI platform that generates god-tier animated SVG email signatures through a 3-brain AI pipeline.**

Drop any Google My Business URL → get a professional animated signature with four narrative variations, branded PDFs, and a complete ready-to-install ZIP package — in under 60 seconds.

</div>

---

## What It Does

EffectForge AI runs a business profile through three AI models in sequence — each with a distinct creative role — to produce an animated SVG email signature. The output is not a template. Every signature is generated from scratch based on the brand's visual identity, sector, color psychology, and a custom narrative arc built by the AI.

The final package includes the animated SVG, Gmail/Outlook/Apple Mail optimized versions, three branded PDF guides, a live preview page, and a full ZIP archive — all client-ready.

---

## Architecture — The 3-Brain AI Pipeline

```
Google My Business URL
          │
          ▼
┌─────────────────────────────────────────┐
│  SERPER GMB SCRAPER                     │
│  ├── Full profile extraction            │
│  │   (name, address, phone, hours,      │
│  │    rating, reviews, photos, keywords)│
│  ├── Social networks auto-detection     │
│  ├── Logo capture via Clearbit API      │
│  └── Sector classification + palette    │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  BRAIN 1 — GPT-4o Vision                │
│  Role: Creative Director                │
│  ├── Logo + metadata visual analysis    │
│  ├── Full creative brief                │
│  ├── Visual references (3 top brands)   │
│  ├── Color psychology                   │
│  ├── Brand personality mapping          │
│  ├── Target audience + differentiator   │
│  └── Central narrative keyword          │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  BRAIN 2 — Claude Opus                  │
│  Role: Narrative Director & Poet        │
│  ├── Emotional arc  A → B → C → D       │
│  ├── Central metaphor + story thread    │
│  ├── 4 variations with title, subtitle, │
│  │   intention, metaphor, emotion       │
│  ├── Coherent effect selection (55+)    │
│  └── Artistic director's note          │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  BRAIN 3 — Gemini 1.5 Pro               │
│  Role: Senior Creative Engineer         │
│  ├── Technical calibration per effect   │
│  ├── Effect-specific parameters         │
│  ├── Email client compatibility tuning  │
│  ├── Cycle timing (200–280 seconds)     │
│  ├── Custom easing curves               │
│  └── Technical notes + optimizations   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  OUTPUT DELIVERY ENGINE  (7 steps)      │
│                                         │
│  Step 1 ── SVG + PNG fallback           │
│  Step 2 ── Gmail HTML + Outlook HTM     │
│  Step 3 ── Cerebras writes all content  │
│  Step 4 ── 3 branded PDFs               │
│  Step 5 ── Live preview HTML page       │
│  Step 6 ── ZIP package assembly         │
│  Step 7 ── Delivery email + attachments │
└─────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20, TypeScript 5 (ESM) |
| **Backend** | Express 4, Drizzle ORM, WebSocket (ws) |
| **Frontend** | React 18, Vite 5, TanStack Query v5 |
| **UI** | Tailwind CSS v4, shadcn/ui, Radix UI, Lucide |
| **Database** | PostgreSQL via Neon Serverless |
| **AI — Brain 1** | OpenAI GPT-4o Vision |
| **AI — Brain 2** | Anthropic Claude Opus |
| **AI — Brain 3** | Google Gemini 1.5 Pro |
| **AI — Content** | Cerebras (ultra-fast inference) |
| **Search** | Serper API (GMB scraping) |
| **PDF** | PDFKit (multi-page, branded) |
| **ZIP** | Archiver |
| **Image** | Sharp (SVG → PNG conversion) |
| **Email** | Resend API |
| **Deployment** | Replit Autoscale |

---

## Application Pages

| Page | Route | Description |
|------|-------|-------------|
| **Command Center** | `/` | Dashboard — system metrics, queue monitor, recent activity |
| **God Generator** | `/generator` | Main pipeline — GMB URL input, live progress, result viewer |
| **Neural Library** | `/library` | Browse and preview all 55+ animated effects |
| **Signature Vivante** | `/signature` | Multi-variation signature viewer with cycle playback |
| **Studio** | `/studio` | Animation studio — build and test custom SVG animations |
| **Reality Preview** | `/preview` | Live SVG renderer — paste any SVG and preview instantly |
| **AI Expansion** | `/expansion` | AI-powered library growth — describe and generate new effects |
| **System Matrix** | `/status` | Real-time health dashboard + API key management |
| **Core Modules** | `/modules` | Inspect all 26 internal modules and their live state |

---

## Output Package

Every generation produces a complete, client-ready ZIP archive:

```
signature-{company}-{id}.zip
├── signature.svg                   # Animated SVG — main signature file
├── signature-fallback.png          # High-res PNG fallback (1200×360)
├── signature-gmail.html            # Gmail-optimized HTML version
├── signature-outlook.htm           # Outlook VML + MSO-conditional version
├── instructions-gmail.pdf          # Branded installation guide — Gmail
├── instructions-outlook.pdf        # Branded installation guide — Outlook
├── instructions-apple-mail.pdf     # Branded installation guide — Apple Mail
├── config.json                     # Full AI generation config + decisions
├── manifest.json                   # Archive index with file metadata
└── LISEZ-MOI.txt                   # Human-readable README (AI-written)
```

Every ZIP includes a **live preview page** hosted at `/api/signature/preview/{id}`:
- Mock Gmail inbox rendering with the live signature
- 4-variation cycle counter (real-time)
- One-click install buttons per email client
- Direct PDF guide downloads

---

## Premium Effects Library — 55 Loaded, 61 Available

All effects are loaded at startup from `Premium_Effect-main/`. Each is a complete animation class with configurable parameters, inheriting from `BaseEffect`.

| Category | Effects |
|----------|---------|
| **Organic / Living** | BREATHING, BREATHING OBJECT, HEARTBEAT, SOUL AURA |
| **Electric / Light** | NEON GLOW, HOLOGRAM, ELECTRIC FORM, ELECTRIC HOVER, ENERGY FLOW, ENERGY IONIZE, SPARKLE AURA |
| **Crystal / Ice** | CRYSTAL GROW, ICE FREEZE, PRISM SPLIT |
| **Liquid / Wave** | LIQUID MORPH, LIQUID POUR, LIQUID STATE, WAVE DISSOLVE, WAVE DISTORTION, WAVE SURF |
| **Morphing / 3D** | MORPH 3D, MIRROR REALITY, DIMENSION SHIFT, ROTATION 3D |
| **Particles / Cosmic** | PARTICLE BUILD, STAR DUST FORM, STAR EXPLOSION, STELLAR DRIFT, SMOKE DISPERSE |
| **Digital / Quantum** | GLITCH SPAWN, REALITY GLITCH, QUANTUM PHASE, QUANTUM SPLIT, DNA BUILD, NEURAL PULSE, TYPEWRITER, SHADOW CLONE |
| **Fire** | FIRE CONSUME, FIRE WRITE |
| **Atmospheric** | TORNADO ABSORB, TORNADO SPIN |
| **Temporal** | ECHO MULTIPLE, ECHO TRAIL, TIME ECHO, TIME REWIND |
| **Physics** | FLOAT DANCE, FLOAT PHYSICS, GRAVITY REVERSE, GYROSCOPE SPIN, MAGNETIC FIELD, MAGNETIC PULL, PENDULUM SWING |
| **Phase / Depth** | PHASE THROUGH, FADE LAYERS |

---

## Internal Architecture — 26 Server Modules

```
server/
├── core/
│   ├── god-monitor.ts                        # Composite health scoring system
│   ├── autonomous-monitor.ts                 # Continuous self-monitoring + auto-repair
│   ├── decision-engine.ts                    # AI model priority routing
│   └── orchestrator.ts                       # Module lifecycle management
│
├── ai-engine/
│   ├── nlp-processor.ts                      # Natural language intent extraction
│   └── parameter-optimizer.ts               # AI parameter auto-calibration
│
├── modules/                                  # 26 specialized modules
│   ├── particles.module.ts                   # Particle system engine
│   ├── physics.module.ts                     # Physics simulation
│   ├── morphing.module.ts                    # Shape morphing engine
│   ├── lighting.module.ts                    # Dynamic lighting + glow
│   ├── timing-master.module.ts               # φ=1.618 Fibonacci easing engine
│   ├── color-harmony.module.ts               # WCAG 2.1 + OKLCH color engine
│   ├── quality-assurance.module.ts           # Output quality scoring
│   ├── smart-optimizer.module.ts             # Real-time performance optimizer
│   ├── effect-fusion-engine.module.ts        # Multi-effect composition
│   ├── adaptive-rendering-engine.module.ts   # Email client-aware rendering
│   ├── visual-signature-engine.module.ts     # LCG-based unique fingerprinting
│   ├── predictive-transition-engine.module.ts# Golden ratio transition curves
│   ├── attention-guide.module.ts             # Visual focal point orchestration
│   ├── analytics.module.ts                   # Usage and performance analytics
│   ├── contextual-intelligence.module.ts     # Sector-aware style decisions
│   ├── content-analyzer.module.ts            # Brand content deep analysis
│   ├── variance-engine.module.ts             # Controlled aesthetic variation
│   ├── dynamic-fusion-orchestrator.module.ts # Live multi-effect fusion
│   ├── experience-orchestrator.module.ts     # End-to-end UX orchestration
│   ├── library-expansion.module.ts           # AI-driven library growth
│   ├── preset-manager.module.ts              # 10 smart presets + custom CRUD
│   ├── batch-generator.module.ts             # Parallel batch generation
│   ├── classification-storage.module.ts      # Effect classification + indexing
│   ├── error-detection.module.ts             # Static + runtime error detection
│   └── user-preferences-engine.module.ts     # User preference memory
│
├── services/
│   ├── triple-ai-director.ts                 # 3-brain pipeline orchestrator
│   ├── delivery-engine.ts                    # 7-step output pipeline
│   ├── package-builder.ts                    # SVG→PNG + client-specific builds
│   ├── pdf-generator.ts                      # Multi-page branded PDFs (PDFKit)
│   ├── preview-page-generator.ts             # Live preview HTML builder
│   ├── zip-assembler.ts                      # ZIP assembly + manifest generation
│   ├── delivery-email.ts                     # Resend email + PDF attachments
│   ├── cerebras-content-generator.ts         # 6-section AI text generation
│   ├── api-key-rotator.ts                    # Key rotation + circuit breaker
│   ├── harmony-validator.ts                  # Color harmony WCAG validation
│   ├── gemini-wrapper.ts                     # Gemini API client
│   ├── cerebras-wrapper.ts                   # Cerebras API client
│   └── zone-svg-renderer.ts                  # SVG zone composition renderer
│
└── generator/
    ├── signature-base-generator.ts           # Base SVG structure builder
    ├── signature-svg-exporter.ts             # Final SVG export + cleanup
    ├── signature-variations-generator.ts     # A/B/C/D variation builder
    ├── js-generator.ts                       # Animation JavaScript generator
    └── template-engine.ts                    # SVG template system
```

---

## API Reference — 65 Endpoints

### Signature Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/signature/generate` | Full God Tier generation pipeline |
| `POST` | `/api/signature/generate-god` | God Tier with SSE live progress |
| `GET` | `/api/signature/preview/:id` | Render live preview page |
| `GET` | `/api/signature/download/:id` | Download full ZIP package |
| `GET` | `/api/signature/export-file/:id/:type` | Download individual file (`svg`, `gmail`, `outlook`, `pdf-gmail`, `pdf-outlook`, `pdf-apple`, `png`, `config`) |

### GMB Scraping
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/gmb/scrape` | Scrape Google My Business profile |
| `POST` | `/api/gmb/extract-logo` | Extract and base64-encode brand logo |

### Effects Library
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/effects` | List all loaded effects |
| `GET` | `/api/effects/:id` | Effect details + parameters |
| `GET` | `/api/library/real-time-stats` | Library stats (count, categories) |

### System & Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health/god-status` | Full GOD health report (all modules) |
| `GET` | `/api/system/health` | Module health overview |
| `GET` | `/api/queue/jobs` | Processing queue state |

### API Key Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/keys/status` | All keys health + usage state |
| `POST` | `/api/keys/add` | Add key (persisted to DB) |
| `DELETE` | `/api/keys/:service/:index` | Remove key by service + index |
| `POST` | `/api/keys/reset` | Reset all key states |
| `GET` | `/api/keys/replit` | Detect Replit-managed integration keys |

---

## API Key Rotation System

Production-grade key management built into the platform:

- **Multi-key pooling** — unlimited keys per service, auto-rotated on failure
- **Composite health scoring** — weighted score from success rate, response latency, and cooldown state
- **Circuit breaker** — 5 consecutive failures triggers a 2-minute automatic pause per key
- **Predictive exhaustion** — monitors hourly velocity to detect rate limit approach before it hits
- **PostgreSQL persistence** — key states and configs survive server restarts (`api_key_configs` + `api_key_states` tables)
- **Replit integration** — auto-detects `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_API_KEY`
- **UI management** — add, inspect, and delete keys directly from System Matrix without touching environment variables

---

## GOD Monitor — Health System

The GOD Monitor computes a composite system health score every 5 seconds:

| Signal | Weight |
|--------|--------|
| CPU usage | Infrastructure |
| Memory usage | Infrastructure |
| Disk usage | Infrastructure |
| AI model confidence | Intelligence |
| Predictive precision | Intelligence |
| Effect library integrity | Library |
| Queue saturation | Performance |
| Module error rate | Reliability |

Live health is exposed at `/api/health/god-status` and displayed in real-time on the System Matrix dashboard.

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Install dependencies
npm install

# Push the database schema
npm run db:push

# Start the development server (port 5000)
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

Build output: `dist/index.cjs` (server) + `dist/public/` (frontend).

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |

### AI Models

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | GPT-4o Vision — Brain 1 |
| `ANTHROPIC_API_KEY` | Claude Opus — Brain 2 |
| `GEMINI_KEY_1` | Gemini 1.5 Pro — Brain 3 |
| `CEREBRAS_KEY_1` | Cerebras — content generation |
| `SERPER_KEY_1` | Serper — GMB scraping |

> Additional keys (`GEMINI_KEY_2`, `CEREBRAS_KEY_2`, etc.) can be added at runtime through the System Matrix UI and are persisted in the database.

### Optional

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Email delivery (Resend) |

---

## Project Structure

```
effectforge-ai/
├── client/src/
│   ├── pages/               # 10 application pages
│   └── components/ui/       # shadcn/ui component library
├── server/
│   ├── ai-engine/           # NLP + parameter optimization (2 files)
│   ├── core/                # GOD monitor, orchestrator, decision engine (4 files)
│   ├── generator/           # SVG generation pipeline (5 files)
│   ├── modules/             # 26 specialized modules
│   ├── parser/              # Effect parser + batch processor
│   ├── queue/               # Job queue manager
│   ├── services/            # Delivery engine, AI wrappers, key rotation (16 files)
│   ├── utils/               # Library initializer, dependency checker
│   ├── routes.ts            # 65 API endpoints
│   ├── storage.ts           # Drizzle storage interface
│   └── index.ts             # Express server entry point
├── shared/
│   └── schema.ts            # Drizzle schema + Zod validation types
├── Premium_Effect-main/     # 61 premium animation effect classes
└── exports/                 # Generated packages (auto-cleaned, 7-day TTL)
```

---

## Codebase Stats

| Metric | Value |
|--------|-------|
| Server TypeScript | 30,000+ lines |
| API endpoints | 65 |
| Internal modules | 26 |
| Premium effects | 55 loaded / 61 available |
| Database tables | 8 |
| Frontend pages | 10 |
| Output files per generation | 10 |

---

<div align="center">

**EffectForge AI — God Tier Signatures™**  
Version 3.0.0-GOD — April 2026

</div>
