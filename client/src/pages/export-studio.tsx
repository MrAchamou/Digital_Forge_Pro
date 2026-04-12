import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Mail, Smartphone, Monitor, Globe, Zap,
  CheckCircle, Loader2, ExternalLink, Copy, Package,
  Sparkles, ChevronDown, ChevronRight, Eye, Upload, X, Star,
  Palette, RotateCcw, Layers
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExportResult {
  signatureId: string;
  hostedSvgUrl?: string;
  hostedGifUrl?: string;
  gmbData?: any;
  sectorId?: string;
  sectorLabel?: string;
  formats: Record<string, { filename: string }>;
  preview: {
    gmailHtml: string;
    universalHtml: string;
    animatedSvgB64: string;
    staticPngB64: string;
    animatedGifB64: string;
    guideHtml: string;
    zipB64: string;
  };
}

// ── Composant téléchargement ──────────────────────────────────────────────────

function downloadB64(b64: string, filename: string, mime: string) {
  const blob = new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function downloadText(text: string, filename: string, mime = 'text/html') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ── Carte format export ───────────────────────────────────────────────────────

function FormatCard({
  icon, title, subtitle, badge, color, onDownload, filename
}: {
  icon: string; title: string; subtitle: string; badge: string; color: string;
  onDownload: () => void; filename: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-3 hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-white/40">{subtitle}</p>
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full border shrink-0"
          style={{ color, borderColor: `${color}44`, background: `${color}18` }}
        >{badge}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDownload}
          data-testid={`btn-download-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
        >
          <Download size={12} /> Télécharger
        </button>
      </div>
      <p className="text-[10px] text-white/25 font-mono truncate">{filename}</p>
    </motion.div>
  );
}

// ── Section preview ───────────────────────────────────────────────────────────

function PreviewSection({ result, defaultTab = 'gif' }: { result: ExportResult; defaultTab?: 'animated' | 'gif' | 'gmail' | 'static' }) {
  const [activeTab, setActiveTab] = useState<'animated' | 'gmail' | 'gif' | 'static'>(defaultTab);
  const [showGuide, setShowGuide] = useState(false);

  const tabs = [
    { id: 'animated' as const, label: 'SVG Animé', icon: '✦' },
    { id: 'gif'      as const, label: 'GIF Animé', icon: '🎞' },
    { id: 'gmail'    as const, label: 'Gmail HTML', icon: '📧' },
    { id: 'static'   as const, label: 'PNG Statique', icon: '🖼' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            data-testid={`tab-preview-${t.id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === t.id
                ? 'bg-forge-purple text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl overflow-hidden border border-white/10 min-h-[200px] flex items-center justify-center">
        {activeTab === 'animated' && (
          <img
            src={`data:image/svg+xml;base64,${result.preview.animatedSvgB64}`}
            alt="Signature animée SVG"
            className="w-full max-w-[620px] block"
          />
        )}
        {activeTab === 'gif' && (
          <img
            src={`data:image/gif;base64,${result.preview.animatedGifB64}`}
            alt="Signature GIF animé"
            className="w-full max-w-[620px] block"
          />
        )}
        {activeTab === 'gmail' && (
          <iframe
            srcDoc={result.preview.gmailHtml}
            className="w-full h-[220px] border-0"
            title="Aperçu Gmail"
            sandbox="allow-same-origin"
          />
        )}
        {activeTab === 'static' && (
          <img
            src={`data:image/png;base64,${result.preview.staticPngB64}`}
            alt="Signature PNG statique"
            className="w-full max-w-[620px] block"
          />
        )}
      </div>

      {(result.hostedSvgUrl || result.hostedGifUrl) && (() => {
        const svgUrl = result.hostedSvgUrl;
        const gifUrl = result.hostedGifUrl;
        const activeUrl = svgUrl || gifUrl!;
        const isSvg = !!svgUrl;
        return (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-300">
                Signature hébergée — {isSvg ? 'SVG Animé (qualité maximale)' : 'GIF Animé'}
              </span>
            </div>
            <p className="text-xs text-white/50 mb-3">
              {isSvg
                ? 'Le SVG animé est embarqué directement dans votre fichier Gmail/Apple Mail. Toutes les animations CSS et SMIL sont actives — rendu identique au preview.'
                : "Cette URL est embarquée dans votre fichier Gmail. Quand votre destinataire ouvre l'email, le GIF animé se charge automatiquement."}
            </p>
            <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
              <code className="text-xs text-emerald-300 flex-1 truncate">{activeUrl}</code>
              <button
                data-testid="btn-copy-hosted-url"
                onClick={() => { navigator.clipboard.writeText(activeUrl); }}
                className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                title="Copier l'URL"
              >
                <Copy size={13} className="text-white/60" />
              </button>
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-test-hosted-url"
                className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                title="Tester l'URL"
              >
                <ExternalLink size={13} className="text-white/60" />
              </a>
            </div>
            {isSvg && gifUrl && (
              <p className="text-[10px] text-white/30 mt-2">
                Fallback GIF disponible : <code className="text-white/40">{gifUrl}</code>
              </p>
            )}
          </div>
        );
      })()}

      <button
        onClick={() => setShowGuide(!showGuide)}
        data-testid="btn-toggle-guide"
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        {showGuide ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Guide d'installation
      </button>

      {showGuide && (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white">
          <iframe
            srcDoc={result.preview.guideHtml}
            className="w-full h-[600px] border-0"
            title="Guide d'installation"
          />
        </div>
      )}
    </div>
  );
}

// ── Formulaire de données ─────────────────────────────────────────────────────

interface FormData {
  gmbUrl: string;
  nom: string;
  titre: string;
  entreprise: string;
  sectorId: string;
  telephone: string;
  email: string;
  site: string;
  adresse: string;
  ville: string;
  code_postal: string;
  cta: string;
  cta2: string;
  cta3: string;
  banniereTexte: string;
  banniereLien: string;
  note: string;
  whiteLabel: boolean;
}

const SECTORS = [
  { id: 'sante', label: '💆 Santé & Bien-être' },
  { id: 'tech', label: '💻 Tech & Numérique' },
  { id: 'immobilier', label: '🏠 Immobilier' },
  { id: 'restauration', label: '🍽 Restauration' },
  { id: 'education', label: '🎓 Éducation' },
  { id: 'artisanat', label: '🔨 Artisanat' },
  { id: 'commerce', label: '🛒 Commerce' },
  { id: 'services_pro', label: '💼 Services Pro' },
  { id: 'loisirs', label: '🎭 Loisirs' },
  { id: 'transport', label: '🚗 Transport' },
];

// ── Presets LiveSign ──────────────────────────────────────────────────────────

const LIVESIGN_PRESETS = [
  {
    id: 'ember',
    name: 'Ember',
    tagline: 'Lueur dorée · Corporate premium',
    icon: '🔥',
    palette: ['#1a0d00', '#f59e0b', '#fef3c7'] as [string, string, string],
    sectorId: 'restauration',
    preview: ['#1a0d00', '#f59e0b'],
  },
  {
    id: 'pulse',
    name: 'Pulse',
    tagline: 'Néon subtil · Tech & Startup',
    icon: '⚡',
    palette: ['#0f172a', '#6366f1', '#e8e8ff'] as [string, string, string],
    sectorId: 'tech',
    preview: ['#0f172a', '#6366f1'],
  },
  {
    id: 'flow',
    name: 'Flow',
    tagline: 'Dégradé pastel · Créatif & Agence',
    icon: '🌊',
    palette: ['#1a0a1f', '#a855f7', '#f3e8ff'] as [string, string, string],
    sectorId: 'loisirs',
    preview: ['#1a0a1f', '#a855f7'],
  },
  {
    id: 'crystal',
    name: 'Crystal',
    tagline: 'Reflets argentés · Luxe & Finance',
    icon: '💎',
    palette: ['#0d1b2a', '#0ea5e9', '#e0f2fe'] as [string, string, string],
    sectorId: 'services_pro',
    preview: ['#0d1b2a', '#0ea5e9'],
  },
  {
    id: 'jungle',
    name: 'Jungle',
    tagline: 'Vert organique · Durable & RSE',
    icon: '🌿',
    palette: ['#0a1a0d', '#22c55e', '#dcfce7'] as [string, string, string],
    sectorId: 'sante',
    preview: ['#0a1a0d', '#22c55e'],
  },
];

// ── Effect Composer — zones et catalogue d'effets ─────────────────────────────

type ZoneName = 'fond' | 'avatar' | 'nom' | 'contact' | 'cta';
type ZoneEffectsMap = Partial<Record<ZoneName, string[]>>;

const COMPOSER_ZONES: { id: ZoneName; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'fond',    label: 'Fond',          icon: '🌌', desc: 'Arrière-plan complet (600×220)', color: '#6366f1' },
  { id: 'avatar',  label: 'Avatar',        icon: '👤', desc: 'Cercle logo / initiales',       color: '#00d4ff' },
  { id: 'nom',     label: 'Nom & Titre',   icon: '✍️', desc: 'Zone texte principal',          color: '#a855f7' },
  { id: 'contact', label: 'Contacts',      icon: '📋', desc: 'Infos tél / email / adresse',   color: '#22c55e' },
  { id: 'cta',     label: 'Bouton CTA',    icon: '🎯', desc: 'Bouton call-to-action',         color: '#f59e0b' },
];

const EFFECT_CATALOG: { id: string; label: string; icon: string; vibe: string }[] = [
  { id: 'neuralPulse',    label: 'Neural Pulse',    icon: '🧠', vibe: 'Réseau' },
  { id: 'sparkleAura',    label: 'Sparkle Aura',    icon: '✨', vibe: 'Étoiles' },
  { id: 'orbitalRings',   label: 'Orbital Rings',   icon: '🔄', vibe: 'Anneaux' },
  { id: 'electricArcs',   label: 'Electric Arcs',   icon: '⚡', vibe: 'Éclairs' },
  { id: 'waveDistortion', label: 'Wave Distortion', icon: '〰', vibe: 'Vagues' },
  { id: 'neonGlow',       label: 'Neon Glow',       icon: '💫', vibe: 'Lueur' },
  { id: 'particleStream', label: 'Particle Stream', icon: '🌊', vibe: 'Flux' },
  { id: 'glitchScan',     label: 'Glitch Scan',     icon: '📡', vibe: 'Scanner' },
  { id: 'crystalFacets',  label: 'Crystal Facets',  icon: '💎', vibe: 'Cristaux' },
  { id: 'magneticField',  label: 'Magnetic Field',  icon: '🔮', vibe: 'Magnétique' },
  { id: 'echoTrail',      label: 'Echo Trail',      icon: '👁', vibe: 'Écho' },
  { id: 'stellarDrift',   label: 'Stellar Drift',   icon: '⭐', vibe: 'Cosmique' },
];

const MAX_EFFECTS_PER_ZONE = 3;

const COMBINATION_PRESETS: {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  color: string;
  zoneEffects: ZoneEffectsMap;
}[] = [
  {
    id: 'corporate-glow',
    name: 'Corporate Glow',
    icon: '🏛️',
    tagline: 'Sobre, premium, lisible',
    color: '#0ea5e9',
    zoneEffects: {
      fond: ['sparkleAura'],
      avatar: ['neonGlow'],
      nom: ['neuralPulse'],
      contact: ['echoTrail'],
      cta: ['neonGlow'],
    },
  },
  {
    id: 'tech-pulse',
    name: 'Tech Pulse',
    icon: '⚡',
    tagline: 'Nerveux, digital, startup',
    color: '#6366f1',
    zoneEffects: {
      fond: ['neuralPulse', 'glitchScan'],
      avatar: ['orbitalRings', 'electricArcs'],
      nom: ['neonGlow'],
      contact: ['particleStream'],
      cta: ['electricArcs', 'neonGlow'],
    },
  },
  {
    id: 'luxury-crystal',
    name: 'Luxury Crystal',
    icon: '💎',
    tagline: 'Luxe, reflets, confiance',
    color: '#38bdf8',
    zoneEffects: {
      fond: ['crystalFacets', 'stellarDrift'],
      avatar: ['crystalFacets', 'sparkleAura'],
      nom: ['neonGlow', 'echoTrail'],
      cta: ['sparkleAura'],
    },
  },
  {
    id: 'organic-flow',
    name: 'Organic Flow',
    icon: '🌿',
    tagline: 'Naturel, fluide, humain',
    color: '#22c55e',
    zoneEffects: {
      fond: ['waveDistortion', 'particleStream'],
      avatar: ['magneticField'],
      nom: ['echoTrail'],
      contact: ['sparkleAura'],
      cta: ['waveDistortion'],
    },
  },
  {
    id: 'sales-impact',
    name: 'Sales Impact',
    icon: '🎯',
    tagline: 'CTA fort, conversion',
    color: '#f59e0b',
    zoneEffects: {
      fond: ['stellarDrift'],
      avatar: ['orbitalRings'],
      nom: ['electricArcs'],
      contact: ['neuralPulse'],
      cta: ['electricArcs', 'particleStream', 'neonGlow'],
    },
  },
];

// ── Palettes par secteur (mirroir du serveur) ─────────────────────────────────

const SECTOR_PALETTES: Record<string, [string, string, string]> = {
  sante:        ['#0b1628', '#2dd4bf', '#e0f7f5'],
  tech:         ['#0f172a', '#6366f1', '#e8e8ff'],
  immobilier:   ['#0f1a0a', '#f59e0b', '#fef3c7'],
  restauration: ['#1a0a00', '#e07b39', '#fff0e5'],
  education:    ['#0f1f3a', '#3b82f6', '#dbeafe'],
  artisanat:    ['#1a1208', '#a16207', '#fef9e7'],
  commerce:     ['#1a0813', '#ec4899', '#fce7f3'],
  services_pro: ['#0d1b2a', '#0ea5e9', '#e0f2fe'],
  loisirs:      ['#1a0a1f', '#a855f7', '#f3e8ff'],
  transport:    ['#0f1a1a', '#14b8a6', '#ccfbf1'],
};

function hex2hslClient(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function clampC(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

// ── Composant aperçu en temps réel ───────────────────────────────────────────

interface LivePreviewProps {
  nom: string; titre: string; entreprise: string;
  telephone: string; email: string; site: string;
  cta: string; cta2?: string; cta3?: string;
  banniereTexte?: string; banniereLien?: string;
  note: string; sectorId: string; logoPreview: string | null;
  paletteOverride?: [string, string, string] | null;
  zoneEffects?: ZoneEffectsMap;
}

function escapeSvgText(value: string) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[char] ?? char));
}

// ─── renderLiveEffectPreview ─────────────────────────────────────────────────
// Reproduit EXACTEMENT les effets du moteur GIF (gif-effect-engine.ts) en SMIL.
// Coordonnées absolues identiques : avatar cx=60,cy=90 | zone contenu x=110-590
// PAS de clippage de zone : chaque effet couvre la pleine carte 600×190.
// ─────────────────────────────────────────────────────────────────────────────
function renderLiveEffectPreview(effectId: string, accent: string, textColor: string, layerIndex: number = 0): string {
  const AX = 60, AY = 90; // avatar center — identique au moteur GIF
  const seed = (i: number, s: number) => ((i * 137.508 + s * 31.41) % 1);
  const TAU = Math.PI * 2;

  const starPath4 = (x: number, y: number, r: number) => {
    const arm = (r * 2.5).toFixed(1);
    const rh  = (r * 0.3).toFixed(1);
    return `M${x},${(y - parseFloat(arm)).toFixed(1)} L${(x + parseFloat(rh)).toFixed(1)},${y} L${x},${(y + parseFloat(arm)).toFixed(1)} L${(x - parseFloat(rh)).toFixed(1)},${y} Z`;
  };

  let body = '';

  switch (effectId) {

    // ── 1. NEURAL PULSE — réseau de nœuds synaptiques (même coords que GIF) ──
    case 'neuralPulse': {
      const nodes = [
        { x: 140, y: 30 }, { x: 280, y: 20 }, { x: 400, y: 35 },
        { x: 520, y: 25 }, { x: 180, y: 160 }, { x: 330, y: 155 },
        { x: 460, y: 165 }, { x: 565, y: 150 },
      ];
      const edges = [[0,1],[1,2],[2,3],[1,5],[2,5],[4,5],[5,6],[6,7],[3,6],[0,4]];
      const lines = edges.map(([a, b], ei) =>
        `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="${accent}" stroke-width="0.6" opacity="0.08">
          <animate attributeName="opacity" values="0.06;0.28;0.06" dur="${(1.8 + ei * 0.15).toFixed(1)}s" begin="${(ei * 0.1).toFixed(2)}s" repeatCount="indefinite"/>
        </line>`
      ).join('');
      const dots = nodes.map((n, i) =>
        `<circle cx="${n.x}" cy="${n.y}" r="1.5" fill="${accent}" opacity="0">
          <animate attributeName="r" values="1;3;1" dur="${(2.4 + i * 0.28).toFixed(1)}s" begin="${(i * 0.22).toFixed(2)}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.7;0.15;0.7;0" dur="${(2.4 + i * 0.28).toFixed(1)}s" begin="${(i * 0.22).toFixed(2)}s" repeatCount="indefinite"/>
        </circle>`
      ).join('');
      const pulse = `<circle cx="${AX}" cy="${AY}" r="3.5" fill="${accent}" opacity="0.85"/>
        <circle cx="${AX}" cy="${AY}" r="9" fill="none" stroke="${accent}" stroke-width="1.4" opacity="0">
          <animate attributeName="r" values="9;44;9" dur="2.2s" begin="${(layerIndex * 0.35).toFixed(2)}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" begin="${(layerIndex * 0.35).toFixed(2)}s" repeatCount="indefinite"/>
        </circle>`;
      body = lines + dots + pulse;
      break;
    }

    // ── 2. SPARKLE AURA — 24 étoiles scintillantes (seededPoints GIF identiques) ──
    case 'sparkleAura': {
      body = Array.from({ length: 24 }, (_, i) => {
        const x = 110 + seed(i, 7) * 480;
        const y = 5   + seed(i, 3) * 170;
        const r    = 0.8 + seed(i, 5) * 1.8;
        const dur  = (1.6 + seed(i, 2) * 2.5).toFixed(2);
        const del  = (seed(i, 11) * 3).toFixed(2);
        return `<path d="${starPath4(x, y, r)}" fill="${accent}" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
        </path>`;
      }).join('');
      break;
    }

    // ── 3. ORBITAL RINGS — 3 anneaux autour de l'avatar (même rayon que GIF) ──
    case 'orbitalRings': {
      const rings = [
        { rx: 56, ry: 18, tilt: 0,   dur: '4.5s', rev: false, op: 0.30, dotR: 2.5 },
        { rx: 62, ry: 22, tilt: 60,  dur: '6.4s', rev: true,  op: 0.20, dotR: 2.0 },
        { rx: 70, ry: 14, tilt: 120, dur: '3.2s', rev: false, op: 0.15, dotR: 1.8 },
      ];
      body = rings.map(ring => {
        const satX = `${(AX + ring.rx).toFixed(1)};${(AX - ring.rx).toFixed(1)};${(AX + ring.rx).toFixed(1)}`;
        const satY = `${AY};${AY};${AY}`;
        return `<ellipse cx="${AX}" cy="${AY}" rx="${ring.rx}" ry="${ring.ry}" fill="none"
            stroke="${accent}" stroke-width="0.8" opacity="${(ring.op * 0.6).toFixed(2)}"
            transform="rotate(${ring.tilt},${AX},${AY})"/>
          <circle r="${ring.dotR}" fill="${accent}" opacity="${(ring.op * 2.5).toFixed(2)}">
            <animate attributeName="cx" values="${satX}" dur="${ring.dur}" ${ring.rev ? 'keyTimes="0;0.5;1" calcMode="linear"' : ''} repeatCount="indefinite"/>
            <animate attributeName="cy" values="${satY}" dur="${ring.dur}" repeatCount="indefinite"/>
          </circle>`;
      }).join('');
      break;
    }

    // ── 4. ELECTRIC ARCS — Q-bezier du bord avatar vers la zone contenu ──
    case 'electricArcs': {
      const targets = [
        { ex: 130, ey: 50 }, { ex: 200, ey: 80 },
        { ex: 130, ey: 130 }, { ex: 180, ey: 110 },
      ];
      body = targets.map((t, i) => {
        const ang = Math.atan2(t.ey - AY, t.ex - AX);
        const sx  = (AX + 52 * Math.cos(ang)).toFixed(1);
        const sy  = (AY + 52 * Math.sin(ang)).toFixed(1);
        const cx1 = ((parseFloat(sx) + t.ex) / 2 + 10).toFixed(1);
        const cy1 = ((parseFloat(sy) + t.ey) / 2 - 12).toFixed(1);
        return `<path d="M${sx},${sy} Q${cx1},${cy1} ${t.ex},${t.ey}"
          fill="none" stroke="${accent}" stroke-width="1" stroke-linecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0;0.45;0" dur="${(1.3 + i * 0.2).toFixed(1)}s" begin="${(i * 0.25).toFixed(2)}s" repeatCount="indefinite"/>
          <animate attributeName="stroke-dasharray" values="0 120;60 30;0 120" dur="${(1.3 + i * 0.2).toFixed(1)}s" begin="${(i * 0.25).toFixed(2)}s" repeatCount="indefinite"/>
        </path>`;
      }).join('');
      break;
    }

    // ── 5. WAVE DISTORTION — 5 ondes de x=110 à x=590, même amplitude que GIF ──
    case 'waveDistortion': {
      body = Array.from({ length: 5 }, (_, li) => {
        const baseY = 20 + li * 35;
        const w1 = `M110,${baseY} Q195,${baseY - 10} 280,${baseY} Q365,${baseY + 10} 450,${baseY} Q520,${baseY - 7} 590,${baseY}`;
        const w2 = `M110,${baseY + 4} Q195,${baseY + 18} 280,${baseY + 3} Q365,${baseY - 15} 450,${baseY + 5} Q520,${baseY + 11} 590,${baseY + 2}`;
        const op = (0.08 + li * 0.015).toFixed(3);
        return `<path d="${w1}" fill="none" stroke="${accent}" stroke-width="0.7" opacity="${op}">
          <animate attributeName="d" values="${w1};${w2};${w1}" dur="${(2.8 + li * 0.4).toFixed(1)}s" begin="${(li * 0.3).toFixed(2)}s" repeatCount="indefinite"/>
        </path>`;
      }).join('');
      break;
    }

    // ── 6. NEON GLOW — bord lumineux pleine carte + 4 orbes de coin (idem GIF) ──
    case 'neonGlow': {
      body = `
        <rect x="1" y="1" width="598" height="178" rx="10" fill="none" stroke="${accent}" stroke-width="2" opacity="0">
          <animate attributeName="opacity" values="0.06;0.14;0.06" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="3" y="3" width="594" height="174" rx="9" fill="none" stroke="${accent}" stroke-width="1" opacity="0">
          <animate attributeName="opacity" values="0.03;0.08;0.03" dur="2.1s" begin="0.3s" repeatCount="indefinite"/>
        </rect>
        <circle cx="10" cy="10" r="8" fill="${accent}" opacity="0">
          <animate attributeName="opacity" values="0.08;0.24;0.08" dur="2.1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="590" cy="10" r="8" fill="${accent}" opacity="0">
          <animate attributeName="opacity" values="0.06;0.18;0.06" dur="2.1s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="590" cy="170" r="8" fill="${accent}" opacity="0">
          <animate attributeName="opacity" values="0.04;0.14;0.04" dur="2.1s" begin="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="10" cy="170" r="8" fill="${accent}" opacity="0">
          <animate attributeName="opacity" values="0.05;0.17;0.05" dur="2.1s" begin="0.8s" repeatCount="indefinite"/>
        </circle>`;
      break;
    }

    // ── 7. PARTICLE STREAM — 18 particules orbitant en LIVE (seededPoints GIF) ──
    case 'particleStream': {
      body = Array.from({ length: 18 }, (_, i) => {
        const x  = 110 + seed(i, 42) * 480;
        const y  = 10  + seed(i, 17) * 160;
        const sz = (0.8 + seed(i, 5) * 2.2).toFixed(1);
        const dx = (Math.sin(i * 2.3) * 6).toFixed(1);
        const dy = (Math.cos(i * 1.7) * 4).toFixed(1);
        const dur = (2.5 + seed(i, 9) * 3).toFixed(1);
        const del = (seed(i, 3) * 3).toFixed(2);
        const op  = (0.1 + seed(i, 11) * 0.32).toFixed(2);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz}" fill="${accent}" opacity="0">
          <animate attributeName="cx" values="${x.toFixed(1)};${(x + parseFloat(dx)).toFixed(1)};${x.toFixed(1)}" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="${y.toFixed(1)};${(y + parseFloat(dy)).toFixed(1)};${y.toFixed(1)}" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;${op};0" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
        </circle>`;
      }).join('');
      break;
    }

    // ── 8. GLITCH SCAN — barres horizontales qui scannent (idem GIF) ──
    case 'glitchScan': {
      body = Array.from({ length: 4 }, (_, i) => {
        const y0 = 15 + i * 40;
        const h  = 1 + (i % 3);
        const xShift = i % 2 === 0 ? 5 : -5;
        return `<rect x="110" y="${y0}" width="460" height="${h}" fill="${accent}" rx="1" opacity="0">
          <animate attributeName="y" values="${y0};${y0 + 130};${y0}" dur="${(3.2 + i * 0.5).toFixed(1)}s" begin="${(i * 0.4).toFixed(2)}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.42;0.1;0.5;0" dur="${(1.7 + i * 0.22).toFixed(1)}s" begin="${(i * 0.4).toFixed(2)}s" repeatCount="indefinite"/>
          <animate attributeName="x" values="110;${110 + xShift};110" dur="${(1.7 + i * 0.22).toFixed(1)}s" begin="${(i * 0.4).toFixed(2)}s" repeatCount="indefinite"/>
        </rect>`;
      }).join('');
      break;
    }

    // ── 9. CRYSTAL FACETS — 6 facettes côté droit (positions exactes du GIF) ──
    case 'crystalFacets': {
      const FACETS = [
        { x: 490, y: 25,  s: 22, angle: 15 },
        { x: 555, y: 60,  s: 16, angle: 45 },
        { x: 510, y: 85,  s: 18, angle: -20 },
        { x: 560, y: 110, s: 14, angle: 60 },
        { x: 530, y: 140, s: 20, angle: 30 },
        { x: 480, y: 155, s: 12, angle: -45 },
      ];
      body = FACETS.map((f, fi) => {
        const a = f.angle * Math.PI / 180;
        const pts = [
          [f.x, f.y - f.s], [f.x + f.s*0.7, f.y - f.s*0.3],
          [f.x + f.s*0.7, f.y + f.s*0.5], [f.x, f.y + f.s],
          [f.x - f.s*0.7, f.y + f.s*0.5], [f.x - f.s*0.7, f.y - f.s*0.3],
        ].map(([px, py]) => {
          const dx = px - f.x, dy = py - f.y;
          return `${(f.x + dx*Math.cos(a) - dy*Math.sin(a)).toFixed(1)},${(f.y + dx*Math.sin(a) + dy*Math.cos(a)).toFixed(1)}`;
        }).join(' ');
        const dur = (2.2 + fi * 0.55).toFixed(1);
        return `<polygon points="${pts}" fill="${accent}" stroke="${accent}" stroke-width="0.5" opacity="0.04">
          <animate attributeName="opacity" values="0.02;0.14;0.02" dur="${dur}s" begin="${(fi * 0.18).toFixed(2)}s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="0 ${f.x} ${f.y};5 ${f.x} ${f.y};0 ${f.x} ${f.y}" dur="${(dur)}s" begin="${(fi * 0.18).toFixed(2)}s" repeatCount="indefinite"/>
        </polygon>`;
      }).join('');
      break;
    }

    // ── 10. MAGNETIC FIELD — lignes de champ courbées depuis avatar (idem GIF) ──
    case 'magneticField': {
      body = Array.from({ length: 5 }, (_, i) => {
        const ang = (i / 5) * TAU;
        const r1 = 58 + i * 4, r2 = 90 + i * 12;
        const sx  = (AX + r1 * Math.cos(ang)).toFixed(1);
        const sy  = (AY + r1 * Math.sin(ang)).toFixed(1);
        const ex  = (AX + r2 * Math.cos(ang + 0.8)).toFixed(1);
        const ey  = (AY + r2 * Math.sin(ang + 0.8)).toFixed(1);
        const cpx = (AX + (r1 + r2) / 2 * Math.cos(ang + 0.4) + 20).toFixed(1);
        const cpy = (AY + (r1 + r2) / 2 * Math.sin(ang + 0.4)).toFixed(1);
        return `<path d="M${sx},${sy} Q${cpx},${cpy} ${ex},${ey}" fill="none"
          stroke="${accent}" stroke-width="0.7" opacity="0.08">
          <animate attributeName="opacity" values="0.05;0.3;0.05" dur="${(2.5 + i * 0.4).toFixed(1)}s" begin="${(i * 0.3).toFixed(2)}s" repeatCount="indefinite"/>
        </path>`;
      }).join('');
      break;
    }

    // ── 11. ECHO TRAIL — copies fantômes de la barre accent (idem GIF) ──
    case 'echoTrail': {
      body = [1, 2, 3].map(i => {
        const h  = (30 + 150 * 0.5).toFixed(0); // ~105px (milieu de cycle)
        const y0 = ((190 - parseInt(h)) / 2).toFixed(0);
        const op = (0.04 - i * 0.01).toFixed(3);
        return `<rect x="${i * 6}" y="${y0}" width="2" height="${h}" fill="${accent}" rx="1" opacity="0">
          <animate attributeName="opacity" values="0;${op};0" dur="${(2.1 + i * 0.3).toFixed(1)}s" begin="${(i * 0.08).toFixed(2)}s" repeatCount="indefinite"/>
          <animate attributeName="height" values="20;${h};20" dur="${(2.1 + i * 0.3).toFixed(1)}s" begin="${(i * 0.08).toFixed(2)}s" repeatCount="indefinite"/>
          <animate attributeName="y" values="${Math.round(190/2 - 10)};${y0};${Math.round(190/2 - 10)}" dur="${(2.1 + i * 0.3).toFixed(1)}s" begin="${(i * 0.08).toFixed(2)}s" repeatCount="indefinite"/>
        </rect>`;
      }).join('');
      break;
    }

    // ── 12. STELLAR DRIFT — 30 micro-étoiles qui dérivent (seededPoints GIF) ──
    case 'stellarDrift': {
      body = Array.from({ length: 30 }, (_, i) => {
        const x   = 110 + seed(i, 99) * 480;
        const y   = 5   + seed(i, 77) * 170;
        const sz  = (seed(i, 5) * 0.6 + 0.3).toFixed(1);
        const dx  = (seed(i, 13) * 40).toFixed(1);
        const dur = (3.5 + seed(i, 9) * 4).toFixed(1);
        const del = (seed(i, 11) * 3).toFixed(2);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz}" fill="${accent}" opacity="0">
          <animate attributeName="cx" values="${x.toFixed(1)};${(x + parseFloat(dx)).toFixed(1)};${x.toFixed(1)}" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.22;0" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
        </circle>`;
      }).join('');
      break;
    }

    // ── Fallback ─────────────────────────────────────────────────────────────
    default: {
      body = Array.from({ length: 14 }, (_, i) => {
        const x = 110 + seed(i, 7) * 480, y = 5 + seed(i, 3) * 170;
        const r = 0.8 + seed(i, 5) * 1.8;
        const dur = (1.8 + seed(i, 2) * 2.5).toFixed(2);
        const del = (seed(i, 11) * 3).toFixed(2);
        return `<path d="${starPath4(x, y, r)}" fill="${accent}" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
        </path>`;
      }).join('');
    }
  }

  return `<g data-live-effect="${effectId}" opacity="0.92">${body}</g>`;
}

function LiveSignaturePreview({ nom, titre, entreprise, telephone, email, site, cta, cta2 = '', cta3 = '', banniereTexte = '', banniereLien = '', note, sectorId, logoPreview, paletteOverride, zoneEffects = {} }: LivePreviewProps) {
  const palette = paletteOverride ?? SECTOR_PALETTES[sectorId] ?? SECTOR_PALETTES['tech'];
  const [bg, accent, textColor] = palette;

  const [bgH, bgS, bgL] = hex2hslClient(bg);
  const bgLight      = `hsl(${bgH},${bgS}%,${clampC(bgL + 28, 18, 62)}%)`;
  const bgUltraLight = `hsl(${bgH},${clampC(bgS - 15, 8, 100)}%,${clampC(bgL + 46, 42, 80)}%)`;
  const bgHue2       = `hsl(${bgH},${bgS}%,${clampC(bgL - 6, 8, 48)}%)`;
  const bgHue2Light  = `hsl(${bgH},${bgS}%,${clampC(bgL + 32, 18, 60)}%)`;
  const bgHue3       = `hsl(${bgH},${clampC(bgS - 8, 8, 100)}%,${clampC(bgL - 12, 6, 42)}%)`;
  const bgHue3Light  = `hsl(${bgH},${bgS}%,${clampC(bgL + 24, 14, 55)}%)`;

  const displayNom = escapeSvgText(nom || 'Votre Nom');
  const displayTitre = escapeSvgText(titre || 'Votre Titre');
  const displayEntreprise = escapeSvgText(entreprise || 'Votre Entreprise');
  const safeTelephone = escapeSvgText(telephone);
  const safeEmail = escapeSvgText(email);
  const safeSite = escapeSvgText(site.replace(/^https?:\/\//, ''));
  const initiale = displayNom.charAt(0).toUpperCase();

  const starRating = note ? parseInt(note) : 0;
  const stars = starRating > 0 ? '★'.repeat(starRating) + '☆'.repeat(5 - starRating) : '';

  const rng = (s: number) => { const x = Math.sin(s * 127.1 + 1.9) * 43758.5453; return x - Math.floor(x); };
  const ar = parseInt(accent.slice(1, 3) || '99', 16);
  const ag = parseInt(accent.slice(3, 5) || '99', 16);
  const ab = parseInt(accent.slice(5, 7) || 'ff', 16);

  const particles = Array.from({ length: 18 }, (_, i) => {
    const cx  = Math.round(80 + rng(i * 3.71) * 510);
    const cy  = Math.round(8  + rng(i * 7.33) * 174);
    const r   = (0.5 + rng(i * 5.11) * 1.8).toFixed(1);
    const dur = (2.8 + rng(i * 2.97) * 5.5).toFixed(1);
    const del = (rng(i * 11.3) * 5.0).toFixed(1);
    const op  = (0.1 + rng(i * 4.73) * 0.25).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(${ar},${ag},${ab},${op})">
      <animate attributeName="opacity" values="0;${op};0" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');

  const selectedEffectEntries = Object.entries(zoneEffects).flatMap(([zone, ids]) =>
    (ids ?? []).map((effectId, index) => ({ zone: zone as ZoneName, effectId, index }))
  );

  const displayCta1 = escapeSvgText(cta || 'Nous contacter');
  const displayCta2 = escapeSvgText(cta2);
  const displayCta3 = escapeSvgText(cta3);
  const displayBanniere = escapeSvgText(banniereTexte);
  const hasMultiCta = !!(cta2 || cta3);
  const hasBanniere = !!banniereTexte;
  const svgHeight = hasBanniere ? 250 : 197;

  const ctaW1 = Math.min(displayCta1.length * 7.2 + 24, 175);
  const ctaW2 = displayCta2 ? Math.min(displayCta2.length * 7.2 + 24, 175) : ctaW1;
  const ctaW3 = displayCta3 ? Math.min(displayCta3.length * 7.2 + 24, 175) : ctaW1;

  // Dédupliquer : chaque effet est rendu UNE FOIS à l'échelle de la pleine carte
  // (identique au moteur GIF — pas de clippage par zone)
  const uniqueEffects = Array.from(new Set(selectedEffectEntries.map(e => e.effectId)));
  const liveEffectLayers = uniqueEffects.map((effectId, i) =>
    renderLiveEffectPreview(effectId, accent, textColor, i)
  ).join('');

  const activeEffectLabels = selectedEffectEntries.map(({ zone, effectId }) => {
    const zoneLabel = COMPOSER_ZONES.find(z => z.id === zone)?.label ?? zone;
    const effect = EFFECT_CATALOG.find(e => e.id === effectId);
    return `${zoneLabel}: ${effect?.label ?? effectId}`;
  });

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 ${svgHeight}" width="600" height="${svgHeight}">
  <defs>
    <style>
      @keyframes vbg-scan { 0%{transform:translateX(-80px) skewX(-12deg);opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{transform:translateX(680px) skewX(-12deg);opacity:0} }
    </style>
    <linearGradient id="lp-anim-bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%">
        <animate attributeName="stop-color" values="${bg};${bgLight};${bgHue2Light};${bgUltraLight};${bgHue3Light};${bgLight};${bg}" dur="16s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      </stop>
      <stop offset="45%">
        <animate attributeName="stop-color" values="${bgHue2};${bg};${bgLight};${bgHue3};${bg};${bgHue2Light};${bgHue2}" dur="16s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="stop-opacity" values="0.7;1;0.85;1;0.75;0.9;0.7" dur="16s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%">
        <animate attributeName="stop-color" values="${bgHue3};${bgUltraLight};${bg};${bgHue2};${bgLight};${bgHue3Light};${bgHue3}" dur="16s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      </stop>
    </linearGradient>
    <linearGradient id="lp-accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent}99"/>
    </linearGradient>
    <linearGradient id="lp-avatar-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent}66"/>
    </linearGradient>
    <clipPath id="lp-avatar-clip"><circle cx="60" cy="90" r="40"/></clipPath>
    <filter id="lp-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="lp-soft"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>

  <!-- Fond animé -->
  <rect width="600" height="${svgHeight}" fill="url(#lp-anim-bg)" rx="10"/>

  <!-- Particules ambiantes -->
  <g opacity="0.8">${particles}</g>

  ${liveEffectLayers}

  <!-- Scan diagonal -->
  <rect x="-80" y="0" width="50" height="190" fill="url(#lp-accent)" opacity="0.05" style="animation:vbg-scan 18s ease-in-out 0s infinite;"/>
  <rect x="-80" y="0" width="30" height="190" fill="url(#lp-accent)" opacity="0.03" style="animation:vbg-scan 18s ease-in-out 9s infinite;"/>

  <!-- Bande latérale accent -->
  <rect x="0" y="0" width="4" height="190" fill="url(#lp-accent)" rx="2" opacity="0.9">
    <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
  </rect>

  <!-- Halo derrière avatar -->
  <circle cx="60" cy="90" r="48" fill="${accent}" opacity="0.08" filter="url(#lp-soft)">
    <animate attributeName="r" values="44;50;44" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.06;0.13;0.06" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- Avatar -->
  ${logoPreview
    ? `<image href="${logoPreview}" x="20" y="50" width="80" height="80" clip-path="url(#lp-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="60" cy="90" r="40" fill="url(#lp-avatar-grad)" opacity="0.9"/>
       <text x="60" y="96" text-anchor="middle" font-size="26" font-weight="700" fill="${textColor}" font-family="system-ui,sans-serif">${initiale}</text>`
  }
  <circle cx="60" cy="90" r="40" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.6">
    <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- Nom -->
  <text x="112" y="52" font-size="17" font-weight="700" fill="${textColor}" font-family="system-ui,sans-serif" opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.6s" fill="freeze"/>
    ${displayNom.slice(0, 32)}
  </text>

  <!-- Trait séparateur sous le nom -->
  <rect x="112" y="58" width="0" height="1.5" fill="${accent}" opacity="0.6" rx="1">
    <animate attributeName="width" from="0" to="160" dur="0.8s" begin="0.3s" fill="freeze"/>
  </rect>

  <!-- Titre -->
  <text x="112" y="76" font-size="11" fill="${accent}" font-family="system-ui,sans-serif" opacity="0.85">
    ${displayTitre.slice(0, 40)}
  </text>

  <!-- Entreprise -->
  <text x="112" y="94" font-size="10.5" fill="${textColor}" font-family="system-ui,sans-serif" opacity="0.6">
    ${displayEntreprise.slice(0, 40)}
  </text>

  <!-- Étoiles -->
  ${stars ? `<text x="112" y="110" font-size="11" fill="#f59e0b" font-family="system-ui,sans-serif">${stars}</text>` : ''}

  <!-- Ligne de séparation -->
  <rect x="112" y="${stars ? '118' : '104'}" width="350" height="0.5" fill="${accent}" opacity="0.15"/>

  <!-- Infos contact -->
  ${telephone ? `<text x="112" y="${stars ? '133' : '119'}" font-size="10" fill="${textColor}" font-family="system-ui,sans-serif" opacity="0.65">📞 ${safeTelephone.slice(0, 30)}</text>` : ''}
  ${email ? `<text x="${telephone ? '230' : '112'}" y="${stars ? '133' : '119'}" font-size="10" fill="${textColor}" font-family="system-ui,sans-serif" opacity="0.65">✉ ${safeEmail.slice(0, 30)}</text>` : ''}
  ${site ? `<text x="112" y="${stars ? '148' : '134'}" font-size="10" fill="${accent}" font-family="system-ui,sans-serif" opacity="0.75">🌐 ${safeSite.slice(0, 35)}</text>` : ''}

  <!-- CTAs rotatifs -->
  ${hasMultiCta ? `
  <!-- CTA 1 -->
  <g>
    <rect x="112" y="158" width="${ctaW1}" height="22" rx="11" fill="${accent}" opacity="0">
      <animate attributeName="opacity" values="0;0.9;0.9;0;0;0;0" keyTimes="0;0.04;0.30;0.36;0.66;0.69;1" dur="9s" repeatCount="indefinite"/>
    </rect>
    <text x="${112 + ctaW1 / 2}" y="173" text-anchor="middle" font-size="9.5" font-weight="600" fill="${bg}" font-family="system-ui,sans-serif" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0" keyTimes="0;0.04;0.30;0.36;0.66;0.69;1" dur="9s" repeatCount="indefinite"/>
      ${displayCta1.slice(0, 22)}
    </text>
  </g>
  <!-- CTA 2 -->
  <g>
    <rect x="112" y="158" width="${ctaW2}" height="22" rx="11" fill="${accent}" opacity="0">
      <animate attributeName="opacity" values="0;0.9;0.9;0;0;0;0" keyTimes="0;0.04;0.30;0.36;0.66;0.69;1" dur="9s" begin="3s" repeatCount="indefinite"/>
    </rect>
    <text x="${112 + ctaW2 / 2}" y="173" text-anchor="middle" font-size="9.5" font-weight="600" fill="${bg}" font-family="system-ui,sans-serif" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0" keyTimes="0;0.04;0.30;0.36;0.66;0.69;1" dur="9s" begin="3s" repeatCount="indefinite"/>
      ${displayCta2.slice(0, 22)}
    </text>
  </g>
  <!-- CTA 3 -->
  ${displayCta3 ? `<g>
    <rect x="112" y="158" width="${ctaW3}" height="22" rx="11" fill="${accent}" opacity="0">
      <animate attributeName="opacity" values="0;0.9;0.9;0;0;0;0" keyTimes="0;0.04;0.30;0.36;0.66;0.69;1" dur="9s" begin="6s" repeatCount="indefinite"/>
    </rect>
    <text x="${112 + ctaW3 / 2}" y="173" text-anchor="middle" font-size="9.5" font-weight="600" fill="${bg}" font-family="system-ui,sans-serif" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0;0;0" keyTimes="0;0.04;0.30;0.36;0.66;0.69;1" dur="9s" begin="6s" repeatCount="indefinite"/>
      ${displayCta3.slice(0, 22)}
    </text>
  </g>` : ''}
  ` : `
  <!-- CTA unique pulsant -->
  <rect x="112" y="158" width="${ctaW1}" height="22" rx="11" fill="${accent}" opacity="0.9">
    <animate attributeName="opacity" values="0.75;1;0.75" dur="2.5s" repeatCount="indefinite"/>
  </rect>
  <text x="${112 + ctaW1 / 2}" y="173" text-anchor="middle" font-size="9.5" font-weight="600" fill="${bg}" font-family="system-ui,sans-serif">${displayCta1.slice(0, 22)}</text>
  `}

  <!-- Bannière pub -->
  ${hasBanniere ? `
  <rect x="4" y="197" width="592" height="44" rx="8" fill="${accent}" opacity="0.04">
    <animate attributeName="opacity" values="0.03;0.08;0.03" dur="4s" repeatCount="indefinite"/>
  </rect>
  <rect x="4" y="197" width="592" height="44" rx="8" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.18"/>
  <rect x="14" y="207" width="40" height="14" rx="7" fill="${accent}" opacity="0.22"/>
  <text x="34" y="217.5" text-anchor="middle" font-size="7" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif" opacity="0.9" letter-spacing="0.5">PROMO</text>
  <text x="62" y="222" font-size="10.5" font-weight="600" fill="${textColor}" font-family="system-ui,sans-serif">
    <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite"/>
    ${displayBanniere.slice(0, 58)}
  </text>
  <text x="574" y="222" font-size="13" fill="${accent}" font-family="system-ui,sans-serif" opacity="0">
    <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite"/>
    →
  </text>
  ` : ''}

  <!-- Coin badge LIVE -->
  <rect x="552" y="6" width="40" height="14" rx="7" fill="${accent}" opacity="0.15"/>
  <text x="572" y="16.5" text-anchor="middle" font-size="7" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif" opacity="0.8">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
    LIVE
  </text>

  <!-- Indicateur de phases GIF -->
  <g opacity="0.55">
    <text x="450" y="183" font-size="6.5" fill="${textColor}" font-family="system-ui,sans-serif" opacity="0.4">GIF :</text>
    <rect x="472" y="176" width="28" height="9" rx="4.5" fill="${accent}" opacity="0.18"/>
    <text x="486" y="183" text-anchor="middle" font-size="6" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif">BUILD</text>
    <rect x="504" y="176" width="24" height="9" rx="4.5" fill="${accent}" opacity="0.28"/>
    <text x="516" y="183" text-anchor="middle" font-size="6" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif">LIVE</text>
    <rect x="532" y="176" width="28" height="9" rx="4.5" fill="${accent}" opacity="0.18"/>
    <text x="546" y="183" text-anchor="middle" font-size="6" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif">SHINE</text>
    <line x1="500" y1="180.5" x2="503" y2="180.5" stroke="${accent}" stroke-width="0.8" opacity="0.35"/>
    <line x1="528" y1="180.5" x2="531" y2="180.5" stroke="${accent}" stroke-width="0.8" opacity="0.35"/>
    <rect x="504" y="177.5" width="24" height="6" rx="3">
      <animate attributeName="x" values="472;504;532;504;472" dur="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      <animate attributeName="width" values="28;24;28;24;28" dur="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      <animate attributeName="fill" values="${accent};${accent};${accent};${accent};${accent}" dur="4.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.45;0;0.45;0" dur="4.5s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
      data-testid="live-preview-panel"
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Aperçu en direct</span>
      </div>
      <div className="rounded-xl overflow-hidden border border-white/[0.10] shadow-lg shadow-black/40">
        <div
          className="w-full"
          style={{ lineHeight: 0 }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
      <p className="text-[10px] text-white/25 text-right">
        {paletteOverride ? (
          <span className="text-forge-cyan/50">Palette personnalisée · </span>
        ) : (
          <span>Secteur : {SECTORS.find(s => s.id === sectorId)?.label ?? sectorId} · </span>
        )}
        Aperçu simplifié — le rendu final est plus riche
      </p>
      {activeEffectLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-end" data-testid="list-live-effect-preview">
          {activeEffectLabels.map(label => (
            <span
              key={label}
              className="px-2 py-0.5 rounded-full border border-forge-cyan/20 bg-forge-cyan/[0.06] text-[9px] text-forge-cyan/70"
              data-testid={`text-live-effect-${label.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ExportStudio() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'gmb' | 'manual'>('gmb');
  const [result, setResult] = useState<ExportResult | null>(null);
  const [form, setForm] = useState<FormData>({
    gmbUrl: '', nom: '', titre: '', entreprise: '', sectorId: 'sante',
    telephone: '', email: '', site: '', adresse: '',
    ville: '', code_postal: '', cta: 'Nous contacter',
    cta2: '', cta3: '', banniereTexte: '', banniereLien: '', note: '',
    whiteLabel: false,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [customPalette, setCustomPalette] = useState<[string, string, string] | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('pulse');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);
  const [bannerUpdateText, setBannerUpdateText] = useState('');
  const [bannerUpdateLien, setBannerUpdateLien] = useState('');
  const [bannerUpdating, setBannerUpdating] = useState(false);
  const [bannerUpdateDone, setBannerUpdateDone] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [zoneEffects, setZoneEffects] = useState<ZoneEffectsMap>({});
  const [selectedCombinationPreset, setSelectedCombinationPreset] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState(0);
  const prevSectorRef = useRef(form.sectorId);
  const resultRef = useRef<HTMLDivElement>(null);

  const GENERATION_STEPS = [
    { label: 'Calcul palette & harmonies de couleurs…',  pct: 15 },
    { label: 'Génération des 80 frames SVG…',           pct: 35 },
    { label: 'Encodage GIF haute qualité (dithering)…', pct: 60 },
    { label: 'Assemblage ZIP 7 formats…',               pct: 80 },
    { label: 'Finalisation & hébergement CDN…',         pct: 95 },
  ];

  useEffect(() => {
    if (prevSectorRef.current !== form.sectorId) {
      prevSectorRef.current = form.sectorId;
      setCustomPalette(null);
    }
  }, [form.sectorId]);


  const activePreset = LIVESIGN_PRESETS.find(p => p.id === selectedPreset) ?? LIVESIGN_PRESETS[1];
  const effectivePalette: [string, string, string] = customPalette ?? activePreset.palette ?? SECTOR_PALETTES[form.sectorId] ?? SECTOR_PALETTES['tech'];

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  const update = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));
  const updateBool = (k: keyof FormData, v: boolean) => setForm(f => ({ ...f, [k]: v }));

  const toggleZoneEffect = (zone: ZoneName, effectId: string) => {
    setSelectedCombinationPreset(null);
    setZoneEffects(prev => {
      const current = prev[zone] ?? [];
      if (current.includes(effectId)) {
        const next = current.filter(e => e !== effectId);
        return { ...prev, [zone]: next };
      }
      if (current.length >= MAX_EFFECTS_PER_ZONE) return prev;
      return { ...prev, [zone]: [...current, effectId] };
    });
  };

  const applyCombinationPreset = (presetId: string) => {
    const preset = COMBINATION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const nextEffects = Object.fromEntries(
      Object.entries(preset.zoneEffects).map(([zone, effects]) => [zone, [...(effects ?? [])]])
    ) as ZoneEffectsMap;
    setZoneEffects(nextEffects);
    setSelectedCombinationPreset(preset.id);
    setComposerOpen(true);
  };

  const clearZoneEffects = () => {
    setZoneEffects({});
    setSelectedCombinationPreset(null);
  };

  const totalEffectsSelected = Object.values(zoneEffects).flat().length;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Logo trop lourd', description: 'Max 2 Mo', variant: 'destructive' }); return;
    }
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Mutation GMB pipeline complet
  const gmbExport = useMutation({
    mutationFn: async (body: { gmb_url: string; extra_data: any }): Promise<ExportResult> => {
      const res = await apiRequest('POST', '/api/signature/full-export-gmb', body);
      return res.json();
    },
    onSuccess: (data: ExportResult) => {
      setResult(data);
      setBannerUpdateText(form.banniereTexte || '');
      setBannerUpdateLien(form.banniereLien || '');
      setBannerUpdateDone(null);
      toast({ title: 'Export complet généré !', description: `7 formats prêts pour ${data.sectorLabel || data.sectorId}` });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  // Mutation export manuel
  const manualExport = useMutation({
    mutationFn: async (body: { sectorId: string; data: any }): Promise<ExportResult> => {
      const res = await apiRequest('POST', '/api/signature/full-export', body);
      return res.json();
    },
    onSuccess: (data: ExportResult) => {
      setResult(data);
      setBannerUpdateText(form.banniereTexte || '');
      setBannerUpdateLien(form.banniereLien || '');
      setBannerUpdateDone(null);
      toast({ title: 'Export complet généré !', description: '7 formats exportés avec succès' });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const isPending = gmbExport.isPending || manualExport.isPending;

  useEffect(() => {
    if (!isPending) { setGenerationStep(0); return; }
    setGenerationStep(0);
    const timings = [0, 900, 2200, 3600, 4800];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setGenerationStep(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [isPending]);

  const handleSubmit = () => {
    if (mode === 'gmb') {
      if (!form.gmbUrl) return toast({ title: 'URL Google Maps requise', variant: 'destructive' });
      gmbExport.mutate({
        gmb_url: form.gmbUrl,
        extra_data: {
          nom: form.nom || undefined,
          titre: form.titre || undefined,
          email: form.email || undefined,
          white_label: form.whiteLabel,
        },
      });
    } else {
      if (!form.nom) return toast({ title: 'Le nom est requis', variant: 'destructive' });
      const cleanZoneEffects = Object.fromEntries(
        Object.entries(zoneEffects).filter(([, v]) => v && v.length > 0)
      );
      manualExport.mutate({
        sectorId: form.sectorId,
        data: {
          nom: form.nom, titre: form.titre, entreprise: form.entreprise,
          telephone: form.telephone, email: form.email, site: form.site,
          adresse: form.adresse, ville: form.ville, code_postal: form.code_postal,
          cta: form.cta,
          ...(form.cta2 ? { cta2: form.cta2 } : {}),
          ...(form.cta3 ? { cta3: form.cta3 } : {}),
          ...(form.banniereTexte ? { banniere_texte: form.banniereTexte } : {}),
          ...(form.banniereLien ? { banniere_lien: form.banniereLien } : {}),
          white_label: form.whiteLabel,
          palette: effectivePalette,
          preset: selectedPreset,
          ...(Object.keys(cleanZoneEffects).length > 0 ? { zoneEffects: cleanZoneEffects } : {}),
          ...(form.note ? { note: parseFloat(form.note) } : {}),
          ...(logoPreview ? { logo_url: logoPreview } : {}),
        },
      });
    }
  };

  const downloadAll = () => {
    if (!result) return;
    downloadB64(result.preview.zipB64, result.formats.gmail?.filename?.replace('gmail.html', 'package.zip') || 'signature-package.zip', 'application/zip');
  };

  const handleBannerUpdate = async () => {
    if (!result?.signatureId) return;
    setBannerUpdating(true);
    setBannerUpdateDone(null);
    try {
      const res = await apiRequest('POST', `/api/sig/${result.signatureId}/update-banner`, {
        banniere_texte: bannerUpdateText,
        banniere_lien:  bannerUpdateLien,
      });
      const data = await res.json();
      if (data.success) {
        setBannerUpdateDone(data.message || 'Bannière mise à jour !');
        toast({ title: '✅ Bannière mise à jour', description: 'Le GIF à la même URL affiche maintenant la nouvelle bannière.' });
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur réseau', description: err.message, variant: 'destructive' });
    } finally {
      setBannerUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-forge-purple/20 border border-forge-purple/40 flex items-center justify-center">
            <Package size={16} className="text-forge-purple" />
          </div>
          <h1 className="text-2xl font-bold text-white">Export Studio</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-forge-cyan/10 border border-forge-cyan/30 text-forge-cyan">
            Multi-client universel
          </span>
        </div>
        <p className="text-white/50 text-sm">
          Génère en un clic : Gmail animé · Outlook compatible · Apple Mail · GIF universel · Guide d'installation
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] w-fit">
        {[
          { id: 'gmb' as const, label: '🔗 Depuis Google Maps' },
          { id: 'manual' as const, label: '✏️ Saisie manuelle' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            data-testid={`btn-mode-${m.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m.id ? 'bg-forge-purple text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Formulaire */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-5">
        <AnimatePresence mode="wait">
          {mode === 'gmb' ? (
            <motion.div key="gmb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">URL Google Maps *</label>
                <input
                  type="url"
                  value={form.gmbUrl}
                  onChange={e => update('gmbUrl', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  data-testid="input-gmb-url"
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Prénom Nom (optionnel)</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={e => update('nom', e.target.value)}
                    placeholder="Dr. Jean Martin"
                    data-testid="input-nom"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Titre / Spécialité (optionnel)</label>
                  <input
                    type="text"
                    value={form.titre}
                    onChange={e => update('titre', e.target.value)}
                    placeholder="Chirurgien-Dentiste"
                    data-testid="input-titre"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* ── LiveSign Preset Selector ─────────────────────────────── */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-forge-cyan" /> Preset d'animation
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {LIVESIGN_PRESETS.map(preset => {
                    const isActive = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(preset.id);
                          setCustomPalette(null);
                        }}
                        data-testid={`btn-preset-${preset.id}`}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          isActive
                            ? 'border-white/40 bg-white/[0.08] scale-[1.03]'
                            : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        {isActive && (
                          <div
                            className="absolute inset-0 rounded-xl opacity-20"
                            style={{ background: `linear-gradient(135deg, ${preset.preview[0]}, ${preset.preview[1]})` }}
                          />
                        )}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg relative"
                          style={{ background: `linear-gradient(135deg, ${preset.preview[0]}, ${preset.preview[1]})` }}
                        >
                          {preset.icon}
                        </div>
                        <div className="text-center relative">
                          <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-white/60'}`}>{preset.name}</p>
                          <p className="text-[9px] text-white/30 leading-tight mt-0.5 hidden lg:block">{preset.tagline.split('·')[0].trim()}</p>
                        </div>
                        {isActive && (
                          <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                            style={{ background: preset.preview[1] }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-white/25 mt-2">{activePreset.tagline}</p>
              </div>

              {/* ── Effect Composer ─────────────────────────────────────── */}
              <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                {/* Header cliquable */}
                <button
                  type="button"
                  onClick={() => setComposerOpen(o => !o)}
                  data-testid="btn-toggle-composer"
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-forge-purple/20 flex items-center justify-center">
                      <Layers size={12} className="text-forge-purple" />
                    </div>
                    <span className="text-xs font-semibold text-white/70">Compositeur d'effets par zone</span>
                    {totalEffectsSelected > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: '#6366f120', color: '#a5b4fc', border: '1px solid #6366f130' }}
                      >
                        {totalEffectsSelected} actif{totalEffectsSelected > 1 ? 's' : ''}
                      </span>
                    )}
                    {selectedCombinationPreset && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-400/10 text-green-300 border border-green-400/20">
                        Pack {COMBINATION_PRESETS.find(p => p.id === selectedCombinationPreset)?.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25">Empiler jusqu'à 3 effets par zone</span>
                    {composerOpen ? <ChevronDown size={13} className="text-white/40" /> : <ChevronRight size={13} className="text-white/40" />}
                  </div>
                </button>

                {/* Corps — zones */}
                <AnimatePresence>
                  {composerOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/[0.06]"
                    >
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-white/45 uppercase tracking-wider font-semibold">Packs de combinaison</p>
                              <p className="text-[9px] text-white/25">Applique automatiquement des effets cohérents sur toutes les zones</p>
                            </div>
                            {totalEffectsSelected > 0 && (
                              <button
                                type="button"
                                onClick={clearZoneEffects}
                                data-testid="btn-clear-effect-pack"
                                className="text-[10px] text-white/30 hover:text-red-300 transition-colors"
                              >
                                Vider les effets
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {COMBINATION_PRESETS.map(preset => {
                              const isActive = selectedCombinationPreset === preset.id;
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => applyCombinationPreset(preset.id)}
                                  data-testid={`btn-effect-pack-${preset.id}`}
                                  className={`relative p-2 rounded-xl border text-left transition-all ${
                                    isActive
                                      ? 'bg-white/[0.08] scale-[1.02]'
                                      : 'bg-white/[0.025] hover:bg-white/[0.05]'
                                  }`}
                                  style={{ borderColor: isActive ? `${preset.color}80` : 'rgba(255,255,255,0.08)' }}
                                >
                                  <div
                                    className="absolute inset-0 rounded-xl opacity-10"
                                    style={{ background: `linear-gradient(135deg, ${preset.color}, transparent)` }}
                                  />
                                  <div className="relative flex items-center gap-2">
                                    <span className="text-base">{preset.icon}</span>
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-bold text-white/75 truncate">{preset.name}</p>
                                      <p className="text-[8px] text-white/30 truncate">{preset.tagline}</p>
                                    </div>
                                  </div>
                                  <div className="relative mt-2 flex gap-0.5">
                                    {COMPOSER_ZONES.map(zone => {
                                      const count = preset.zoneEffects[zone.id]?.length ?? 0;
                                      return (
                                        <span
                                          key={zone.id}
                                          title={`${zone.label}: ${count} effet${count > 1 ? 's' : ''}`}
                                          className="h-1.5 flex-1 rounded-full"
                                          style={{ background: count > 0 ? zone.color : 'rgba(255,255,255,0.08)', opacity: count > 0 ? Math.min(1, 0.35 + count * 0.22) : 1 }}
                                        />
                                      );
                                    })}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {COMPOSER_ZONES.map(zone => {
                          const selected = zoneEffects[zone.id] ?? [];
                          return (
                            <div key={zone.id} className="space-y-2">
                              {/* Zone header */}
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                                  style={{ background: `${zone.color}18`, border: `1px solid ${zone.color}30` }}
                                >
                                  {zone.icon}
                                </div>
                                <span className="text-xs font-semibold" style={{ color: zone.color }}>{zone.label}</span>
                                <span className="text-[9px] text-white/25">{zone.desc}</span>
                                {selected.length >= MAX_EFFECTS_PER_ZONE && (
                                  <span className="ml-auto text-[9px] text-amber-400/70">Max {MAX_EFFECTS_PER_ZONE} atteint</span>
                                )}
                              </div>

                              {/* Grille d'effets */}
                              <div className="flex flex-wrap gap-1.5">
                                {EFFECT_CATALOG.map(effect => {
                                  const isSelected = selected.includes(effect.id);
                                  const isDisabled = !isSelected && selected.length >= MAX_EFFECTS_PER_ZONE;
                                  return (
                                    <button
                                      key={effect.id}
                                      type="button"
                                      onClick={() => !isDisabled && toggleZoneEffect(zone.id, effect.id)}
                                      data-testid={`btn-effect-${zone.id}-${effect.id}`}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                                        isDisabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                                      }`}
                                      style={{
                                        background: isSelected ? `${zone.color}20` : 'rgba(255,255,255,0.04)',
                                        color: isSelected ? zone.color : 'rgba(255,255,255,0.4)',
                                        border: `1px solid ${isSelected ? `${zone.color}50` : 'rgba(255,255,255,0.08)'}`,
                                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                      }}
                                    >
                                      <span>{effect.icon}</span>
                                      <span>{effect.label}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Effets sélectionnés */}
                              {selected.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] text-white/25">Actifs :</span>
                                  {selected.map((effectId, idx) => {
                                    const ef = EFFECT_CATALOG.find(e => e.id === effectId);
                                    return (
                                      <div
                                        key={effectId}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                                        style={{ background: `${zone.color}15`, color: zone.color, border: `1px solid ${zone.color}30` }}
                                      >
                                        <span>{idx + 1}.</span>
                                        <span>{ef?.icon} {ef?.label}</span>
                                        <button
                                          type="button"
                                          onClick={() => toggleZoneEffect(zone.id, effectId)}
                                          className="ml-0.5 hover:opacity-100 opacity-60"
                                        >
                                          <X size={8} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {totalEffectsSelected === 0 && (
                          <p className="text-[10px] text-white/20 text-center py-2">
                            Clique sur les effets pour les assigner à chaque zone · Sans sélection = preset automatique
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Logo Upload ─────────────────────────────────────────── */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Logo de l'entreprise</label>
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-16 h-16 rounded-full object-cover border-2 border-forge-purple/40"
                        data-testid="img-logo-preview"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoPreview(null)}
                        data-testid="btn-remove-logo"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white/70 font-medium">Logo chargé</p>
                      <p className="text-xs text-white/30 mt-0.5">Apparaîtra dans le cercle avatar de la signature</p>
                      <label
                        htmlFor="logo-upload"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-forge-purple cursor-pointer hover:text-forge-cyan transition-colors"
                      >
                        <Upload size={11} /> Remplacer
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="logo-upload"
                    data-testid="label-logo-upload"
                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/[0.12] rounded-xl py-5 cursor-pointer hover:border-forge-purple/50 hover:bg-forge-purple/[0.04] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.10] flex items-center justify-center group-hover:border-forge-purple/40 transition-colors">
                      <Upload size={16} className="text-white/30 group-hover:text-forge-purple transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Cliquer pour uploader un logo</p>
                      <p className="text-xs text-white/25 mt-0.5">PNG, JPG, SVG — max 2 Mo</p>
                    </div>
                  </label>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  data-testid="input-logo-upload"
                  className="hidden"
                />
              </div>

              {/* ── Ligne 1 : Secteur + Entreprise ─────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Secteur *</label>
                  <select
                    value={form.sectorId}
                    onChange={e => update('sectorId', e.target.value)}
                    data-testid="select-sector"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-forge-purple/60 transition-colors"
                  >
                    {SECTORS.map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Nom de l'entreprise</label>
                  <input type="text" value={form.entreprise} onChange={e => update('entreprise', e.target.value)}
                    placeholder="Cabinet Médical Martin" data-testid="input-entreprise"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
              </div>

              {/* ── Palette de couleurs personnalisée ───────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette size={11} /> Charte graphique
                  </label>
                  {customPalette && (
                    <button
                      type="button"
                      onClick={() => setCustomPalette(null)}
                      data-testid="btn-reset-palette"
                      className="flex items-center gap-1 text-[10px] text-white/30 hover:text-forge-cyan transition-colors"
                    >
                      <RotateCcw size={9} /> Réinitialiser secteur
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                  {([
                    { label: 'Fond', index: 0, tip: 'Couleur de fond de la signature' },
                    { label: 'Accent', index: 1, tip: 'Couleur principale (icônes, bouton, traits)' },
                    { label: 'Texte', index: 2, tip: 'Couleur du texte principal' },
                  ] as const).map(({ label, index, tip }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="relative group">
                        <label
                          htmlFor={`color-picker-${index}`}
                          data-testid={`color-swatch-${label.toLowerCase()}`}
                          className="block w-8 h-8 rounded-lg cursor-pointer border-2 border-white/20 hover:border-white/50 transition-all shadow-lg hover:scale-110 active:scale-95"
                          style={{ background: effectivePalette[index] }}
                          title={tip}
                        />
                        <input
                          id={`color-picker-${index}`}
                          type="color"
                          value={effectivePalette[index]}
                          onChange={e => {
                            const next: [string, string, string] = [...effectivePalette] as [string, string, string];
                            next[index] = e.target.value;
                            setCustomPalette(next);
                          }}
                          data-testid={`input-color-${label.toLowerCase()}`}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/35 whitespace-nowrap pointer-events-none">
                          {label}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mx-2 h-7 w-px bg-white/10"/>

                  {/* Swatches rapides par secteur */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Object.entries(SECTOR_PALETTES).map(([sid, pal]) => {
                      const sector = SECTORS.find(s => s.id === sid);
                      const isActive = effectivePalette[0] === pal[0] && effectivePalette[1] === pal[1];
                      return (
                        <button
                          key={sid}
                          type="button"
                          onClick={() => { setCustomPalette(pal as [string, string, string]); update('sectorId', sid); prevSectorRef.current = sid; }}
                          data-testid={`btn-palette-preset-${sid}`}
                          title={sector?.label ?? sid}
                          className={`w-5 h-5 rounded-md border transition-all hover:scale-110 ${isActive ? 'border-white/60 scale-110' : 'border-white/10'}`}
                          style={{ background: `linear-gradient(135deg, ${pal[0]} 40%, ${pal[1]})` }}
                        />
                      );
                    })}
                  </div>

                  <div className="ml-auto text-[10px] text-white/20 hidden xl:block">
                    Cliquer sur une couleur pour la modifier
                  </div>
                </div>
              </div>

              {/* ── Ligne 2 : Nom + Titre ───────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Nom complet *</label>
                  <input type="text" value={form.nom} onChange={e => update('nom', e.target.value)}
                    placeholder="Dr. Jean Martin" data-testid="input-nom-manual"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Titre / Poste</label>
                  <input type="text" value={form.titre} onChange={e => update('titre', e.target.value)}
                    placeholder="Chirurgien-Dentiste" data-testid="input-titre-manual"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
              </div>

              {/* ── Ligne 3 : Téléphone + Email ─────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Téléphone</label>
                  <input type="text" value={form.telephone} onChange={e => update('telephone', e.target.value)}
                    placeholder="01 88 33 49 41" data-testid="input-telephone"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="contact@cabinet.fr" data-testid="input-email"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
              </div>

              {/* ── Ligne 4 : Site web ──────────────────────────────────── */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Site web</label>
                <input type="url" value={form.site} onChange={e => update('site', e.target.value)}
                  placeholder="https://cabinet.fr" data-testid="input-site"
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
              </div>

              {/* ── CTAs rotatifs ────────────────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Boutons CTA</label>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-forge-cyan/10 border border-forge-cyan/20 text-forge-cyan/70">rotatifs en animation</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-5 shrink-0">1</span>
                    <input type="text" value={form.cta} onChange={e => update('cta', e.target.value)}
                      placeholder="Nous contacter" data-testid="input-cta"
                      className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-5 shrink-0">2</span>
                    <input type="text" value={form.cta2} onChange={e => update('cta2', e.target.value)}
                      placeholder="Prendre rendez-vous (optionnel)" data-testid="input-cta2"
                      className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-5 shrink-0">3</span>
                    <input type="text" value={form.cta3} onChange={e => update('cta3', e.target.value)}
                      placeholder="Voir nos offres (optionnel)" data-testid="input-cta3"
                      className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                  </div>
                </div>
                {(form.cta2 || form.cta3) && (
                  <p className="text-[10px] text-forge-cyan/50 mt-1.5">Les boutons s'affichent en alternance dans l'animation</p>
                )}
              </div>

              {/* ── Bannière pub ─────────────────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Bannière pub</label>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-forge-purple/10 border border-forge-purple/20 text-forge-purple/70">zone premium · modifiable sans regénérer</span>
                </div>
                <div className="space-y-2">
                  <input type="text" value={form.banniereTexte} onChange={e => update('banniereTexte', e.target.value)}
                    placeholder="Nouveau : consultation en ligne disponible" data-testid="input-banniere-texte"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                  <input type="url" value={form.banniereLien} onChange={e => update('banniereLien', e.target.value)}
                    placeholder="https://... (lien cliquable, optionnel)" data-testid="input-banniere-lien"
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-forge-purple/40 transition-colors" />
                </div>
                {form.banniereTexte && (
                  <p className="text-[10px] text-forge-purple/60 mt-1.5">Apparaît en bas de la signature dans la prévisualisation</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => updateBool('whiteLabel', !form.whiteLabel)}
                data-testid="btn-white-label-export"
                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left"
                style={{
                  background: form.whiteLabel ? '#8b5cf612' : 'rgba(255,255,255,0.03)',
                  borderColor: form.whiteLabel ? '#8b5cf660' : 'rgba(255,255,255,0.08)',
                }}
              >
                <span className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 ${form.whiteLabel ? 'bg-forge-purple border-forge-purple' : 'border-white/20'}`} />
                <span>
                  <span className={`block text-sm font-bold ${form.whiteLabel ? 'text-white' : 'text-white/60'}`}>White-label +50€</span>
                  <span className="block text-[11px] text-white/35 leading-relaxed mt-1">
                    Les pages d'installation et exports remplacent EffectForge AI par le nom du client.
                  </span>
                </span>
              </button>

              {/* ── Ligne 5 : Adresse + Code postal ─────────────────────── */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Adresse</label>
                  <input type="text" value={form.adresse} onChange={e => update('adresse', e.target.value)}
                    placeholder="139 Avenue de France" data-testid="input-adresse"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Code postal</label>
                  <input type="text" value={form.code_postal} onChange={e => update('code_postal', e.target.value)}
                    placeholder="75013" data-testid="input-cp"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
              </div>

              {/* ── Ligne 6 : Ville + Note ───────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Ville</label>
                  <input type="text" value={form.ville} onChange={e => update('ville', e.target.value)}
                    placeholder="Paris" data-testid="input-ville"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Star size={11} className="text-amber-400" /> Note (étoiles, optionnel)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => update('note', form.note === String(n) ? '' : String(n))}
                        data-testid={`btn-star-${n}`}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={22}
                          className={`transition-colors ${parseInt(form.note) >= n ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                        />
                      </button>
                    ))}
                    {form.note && (
                      <span className="text-xs text-amber-400 font-semibold ml-1">{form.note}/5</span>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Aperçu en temps réel — uniquement en mode saisie manuelle */}
        <AnimatePresence>
          {mode === 'manual' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <LiveSignaturePreview
                nom={form.nom}
                titre={form.titre}
                entreprise={form.entreprise}
                telephone={form.telephone}
                email={form.email}
                site={form.site}
                cta={form.cta}
                cta2={form.cta2}
                cta3={form.cta3}
                banniereTexte={form.banniereTexte}
                banniereLien={form.banniereLien}
                note={form.note}
                sectorId={form.sectorId}
                logoPreview={logoPreview}
                paletteOverride={effectivePalette}
                zoneEffects={zoneEffects}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton génération */}
        <div className="space-y-2">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            data-testid="btn-generate-export"
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)', color: '#fff' }}
          >
            {isPending ? (
              <div className="flex flex-col items-center gap-1.5 w-full px-4">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin shrink-0" />
                  <span className="text-sm font-semibold">{GENERATION_STEPS[generationStep]?.label}</span>
                </div>
                <div className="w-full max-w-xs h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${GENERATION_STEPS[generationStep]?.pct ?? 5}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <Sparkles size={18} />
                Générer la Signature Vivante Complète
              </>
            )}
          </button>
          {isPending && (
            <p className="text-center text-[10px] text-white/30">
              Étape {generationStep + 1}/{GENERATION_STEPS.length} · SVG · GIF · 5 formats HTML · ZIP
            </p>
          )}
        </div>
      </div>

      {/* Résultat */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Badge succès */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-white">7 formats générés avec succès</p>
                  <p className="text-xs text-white/40">ID: {result.signatureId?.slice(0, 8)} · {result.sectorLabel || result.sectorId}</p>
                </div>
              </div>
              <button
                onClick={downloadAll}
                data-testid="btn-download-all"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)', color: '#fff' }}
              >
                <Download size={14} />
                Tout télécharger (.zip)
              </button>
            </div>

            {/* ── LiveSign Hero ────────────────────────────────────────────── */}
            {mode === 'manual' && result.signatureId && (() => {
              const gifUrl = `/api/sig/${result.signatureId}.gif`;
              const imgTag = `<img src="${gifUrl}" alt="Signature ${form.nom}" style="max-width:600px;display:block;" />`;
              const preset = LIVESIGN_PRESETS.find(p => p.id === selectedPreset) ?? LIVESIGN_PRESETS[1];
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border border-white/[0.10] bg-white/[0.03]"
                >
                  {/* Glow accent */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${preset.preview[1]}, transparent 60%)` }}
                  />

                  {/* Header */}
                  <div className="relative px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ background: `linear-gradient(135deg, ${preset.preview[0]}, ${preset.preview[1]})` }}
                      >
                        {preset.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Votre signature est vivante</p>
                        <p className="text-[10px] text-white/40">Preset {preset.name} · GIF animé hébergé · Universel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] text-green-400 font-medium">LIVE</span>
                    </div>
                  </div>

                  {/* GIF Preview + URL */}
                  <div className="relative p-6 flex flex-col lg:flex-row gap-6">
                    {/* GIF preview */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                      <div
                        className="rounded-xl overflow-hidden border border-white/[0.10] p-2"
                        style={{ background: preset.preview[0] }}
                      >
                        <img
                          src={gifUrl}
                          alt="Aperçu signature animée"
                          data-testid="img-livesign-gif-preview"
                          className="w-64 h-auto rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <p className="text-[9px] text-white/25">Aperçu du GIF animé en boucle</p>
                    </div>

                    {/* URL + instructions */}
                    <div className="flex-1 flex flex-col gap-4">
                      {/* URL hébergée */}
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Zap size={10} className="text-forge-cyan" /> URL de votre signature GIF
                        </p>
                        <div className="flex items-center gap-2 bg-black/20 border border-white/[0.10] rounded-xl px-4 py-3">
                          <code className="flex-1 text-xs text-forge-cyan font-mono truncate" data-testid="text-gif-url">
                            {gifUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard(gifUrl, setCopiedUrl)}
                            data-testid="btn-copy-gif-url"
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              background: copiedUrl ? '#22c55e20' : 'rgba(255,255,255,0.06)',
                              color: copiedUrl ? '#22c55e' : 'rgba(255,255,255,0.5)',
                              border: `1px solid ${copiedUrl ? '#22c55e40' : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            {copiedUrl ? <><CheckCircle size={11} /> Copié !</> : <><Copy size={11} /> Copier</>}
                          </button>
                        </div>
                      </div>

                      {/* Tag img */}
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Package size={10} className="text-forge-purple" /> Tag HTML à coller dans votre email
                        </p>
                        <div className="flex flex-col gap-2 bg-black/20 border border-white/[0.10] rounded-xl px-4 py-3">
                          <code className="text-xs text-white/50 font-mono break-all leading-relaxed" data-testid="text-img-tag">
                            {imgTag}
                          </code>
                          <button
                            onClick={() => copyToClipboard(imgTag, setCopiedTag)}
                            data-testid="btn-copy-img-tag"
                            className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              background: copiedTag ? '#22c55e20' : 'rgba(99,102,241,0.12)',
                              color: copiedTag ? '#22c55e' : '#a5b4fc',
                              border: `1px solid ${copiedTag ? '#22c55e40' : 'rgba(99,102,241,0.25)'}`,
                            }}
                          >
                            {copiedTag ? <><CheckCircle size={11} /> Copié !</> : <><Copy size={11} /> Copier le tag</>}
                          </button>
                        </div>
                      </div>

                      {/* Instructions rapides */}
                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs text-white/40 uppercase tracking-wider">Intégration en 2 étapes</p>
                        {[
                          { step: '1', text: 'Téléchargez le fichier HTML correspondant à votre client email', color: '#6366f1' },
                          { step: '2', text: 'Ou collez le tag <img> ci-dessus directement dans la signature HTML de votre client', color: '#00d4ff' },
                        ].map(({ step, text, color }) => (
                          <div key={step} className="flex items-start gap-2.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                              style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                            >
                              {step}
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* ── Panel "Mettre à jour la bannière" ─────────────────────────── */}
            {result.signatureId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-forge-purple/30 bg-forge-purple/[0.06] overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-forge-purple/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forge-purple/20 border border-forge-purple/40 flex items-center justify-center">
                    <Zap size={14} className="text-forge-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Mettre à jour la bannière</p>
                    <p className="text-[10px] text-white/40">Le GIF est régénéré à la même URL — aucun changement dans votre email</p>
                  </div>
                  <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-forge-cyan/10 border border-forge-cyan/25 text-forge-cyan font-medium tracking-wider uppercase">
                    URL permanente
                  </span>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">
                        Texte de la bannière
                      </label>
                      <input
                        type="text"
                        value={bannerUpdateText}
                        onChange={e => setBannerUpdateText(e.target.value)}
                        placeholder="Ex : Promo été — 20% de réduction"
                        data-testid="input-banner-update-text"
                        className="w-full bg-black/20 border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-forge-purple/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">
                        Lien cliquable (optionnel)
                      </label>
                      <input
                        type="url"
                        value={bannerUpdateLien}
                        onChange={e => setBannerUpdateLien(e.target.value)}
                        placeholder="https://..."
                        data-testid="input-banner-update-lien"
                        className="w-full bg-black/20 border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-forge-purple/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBannerUpdate}
                      disabled={bannerUpdating}
                      data-testid="btn-update-banner"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
                    >
                      {bannerUpdating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Régénération en cours…
                        </>
                      ) : (
                        <>
                          <Zap size={13} />
                          {bannerUpdateText ? 'Appliquer la bannière' : 'Supprimer la bannière'}
                        </>
                      )}
                    </button>

                    {bannerUpdateDone && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 text-xs text-green-400"
                        data-testid="text-banner-update-done"
                      >
                        <CheckCircle size={13} />
                        {bannerUpdateDone}
                      </motion.div>
                    )}
                  </div>

                  <p className="text-[10px] text-white/30 leading-relaxed">
                    💡 Laissez le texte vide pour supprimer la bannière du GIF. L'URL reste identique — vos emails existants afficheront automatiquement la nouvelle version.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Aperçu */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Eye size={14} /> Aperçu par format
              </h3>
              <PreviewSection result={result} defaultTab={mode === 'manual' ? 'gif' : 'animated'} />
            </div>

            {/* Grille des formats */}
            <div>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package size={14} /> Formats disponibles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <FormatCard
                  icon="📧" title="Gmail" subtitle="Table 100% inline-styles" badge="✅ Compatible" color="#EA4335"
                  filename={result.formats.gmail?.filename || 'signature-gmail.html'}
                  onDownload={() => downloadText(result.preview.gmailHtml, result.formats.gmail?.filename || 'signature-gmail.html')}
                />
                <FormatCard
                  icon="📮" title="Outlook" subtitle="MSO table + PNG fallback" badge="✅ MSO" color="#0078D4"
                  filename={result.formats.outlook?.filename || 'signature-outlook.htm'}
                  onDownload={() => downloadText(result.preview.gmailHtml.replace(
                    /<!--\[if !mso\]><!-->[\s\S]*?<!--<!\[endif\]-->/,
                    ''
                  ), result.formats.outlook?.filename || 'signature-outlook.htm')}
                />
                <FormatCard
                  icon="🍎" title="Apple Mail" subtitle="CSS animé webkit" badge="✅ Animé" color="#007AFF"
                  filename={result.formats.appleMail?.filename || 'signature-apple-mail.html'}
                  onDownload={() => downloadText(result.preview.gmailHtml, result.formats.appleMail?.filename || 'signature-apple.html')}
                />
                <FormatCard
                  icon="🌐" title="Universel" subtitle="Table inline, tous clients" badge="✅ Universel" color="#6366F1"
                  filename={result.formats.universal?.filename || 'signature-universelle.html'}
                  onDownload={() => downloadText(result.preview.universalHtml, result.formats.universal?.filename || 'signature-universelle.html')}
                />
                <FormatCard
                  icon="✦" title="SVG Animé" subtitle="SMIL, embed en img" badge="✅ SMIL" color="#00d4ff"
                  filename={result.formats.animatedSvg?.filename || 'signature-animee.svg'}
                  onDownload={() => downloadB64(result.preview.animatedSvgB64, result.formats.animatedSvg?.filename || 'signature-animee.svg', 'image/svg+xml')}
                />
                <FormatCard
                  icon="🎞" title="GIF Animé" subtitle="Universal, Outlook 1er frame" badge="✅ GIF" color="#f59e0b"
                  filename={result.formats.animatedGif?.filename || 'signature-animee.gif'}
                  onDownload={() => downloadB64(result.preview.animatedGifB64, result.formats.animatedGif?.filename || 'signature-animee.gif', 'image/gif')}
                />
                <FormatCard
                  icon="🖼" title="PNG Statique" subtitle="Fallback universel" badge="✅ Universel" color="#6b7280"
                  filename={result.formats.staticPng?.filename || 'signature-statique.png'}
                  onDownload={() => downloadB64(result.preview.staticPngB64, result.formats.staticPng?.filename || 'signature-statique.png', 'image/png')}
                />
                <FormatCard
                  icon="📋" title="Guide Installation" subtitle="Instructions par client" badge="✅ Guide" color="#059669"
                  filename="GUIDE_INSTALLATION.html"
                  onDownload={() => downloadText(result.preview.guideHtml, 'GUIDE_INSTALLATION.html')}
                />
              </div>
            </div>

            {/* Compatibilité matrix */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                  <Zap size={14} /> Matrice de compatibilité
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-3 text-white/40 font-medium">Client email</th>
                      <th className="px-4 py-3 text-white/40 font-medium">Animations</th>
                      <th className="px-4 py-3 text-white/40 font-medium">Logo</th>
                      <th className="px-4 py-3 text-white/40 font-medium">Liens cliquables</th>
                      <th className="px-4 py-3 text-white/40 font-medium">Fichier recommandé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { client: 'Gmail', anim: '⚠️ Aucune (CSS ignoré)', logo: '✅', links: '✅', file: 'signature-gmail.html' },
                      { client: 'Outlook 2016-2024', anim: '🖼 PNG statique', logo: '✅', links: '✅', file: 'signature-outlook.htm' },
                      { client: 'Apple Mail', anim: '✅ CSS webkit', logo: '✅', links: '✅', file: 'signature-apple-mail.html' },
                      { client: 'iOS Mail', anim: '⚠️ Aucune (table)', logo: '✅', links: '✅', file: 'signature-universelle.html' },
                      { client: 'Outlook.com', anim: '⚠️ Aucune (CSS ignoré)', logo: '✅', links: '✅', file: 'signature-gmail.html' },
                      { client: 'Thunderbird', anim: '✅ CSS webkit', logo: '✅', links: '✅', file: 'signature-apple-mail.html' },
                      { client: 'Yahoo Mail', anim: '⚠️ Aucune (table)', logo: '✅', links: '✅', file: 'signature-gmail.html' },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-white/[0.03] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                        <td className="px-6 py-3 text-white/80 font-medium">{row.client}</td>
                        <td className="px-4 py-3 text-center text-white/60">{row.anim}</td>
                        <td className="px-4 py-3 text-center">{row.logo}</td>
                        <td className="px-4 py-3 text-center">{row.links}</td>
                        <td className="px-4 py-3 text-center font-mono text-white/40">{row.file}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
