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

function PreviewSection({ result }: { result: ExportResult }) {
  const [activeTab, setActiveTab] = useState<'animated' | 'gmail' | 'gif' | 'static'>('animated');
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
  note: string;
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
  cta: string; note: string; sectorId: string; logoPreview: string | null;
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

function renderLiveEffectPreview(effectId: string, zone: ZoneName, index: number, accent: string, textColor: string) {
  const rects: Record<ZoneName, { x: number; y: number; w: number; h: number; cx: number; cy: number; r?: number }> = {
    fond: { x: 0, y: 0, w: 600, h: 190, cx: 300, cy: 95 },
    avatar: { x: 10, y: 50, w: 90, h: 90, cx: 55, cy: 95, r: 45 },
    nom: { x: 106, y: 32, w: 260, h: 70, cx: 236, cy: 67 },
    contact: { x: 106, y: 106, w: 330, h: 52, cx: 271, cy: 132 },
    cta: { x: 106, y: 154, w: 210, h: 34, cx: 211, cy: 171 },
  };
  const z = rects[zone];
  const delay = (index * 0.35).toFixed(2);
  const opacity = zone === 'fond' ? 0.22 : 0.72;
  const clipId = `live-zone-${zone}-${index}-${effectId}`;
  const clip = zone === 'avatar'
    ? `<clipPath id="${clipId}"><circle cx="${z.cx}" cy="${z.cy}" r="${z.r}"/></clipPath>`
    : `<clipPath id="${clipId}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="10"/></clipPath>`;
  const particles = Array.from({ length: zone === 'fond' ? 14 : 7 }, (_, i) => {
    const px = z.x + 8 + ((i * 37 + index * 19) % Math.max(12, z.w - 16));
    const py = z.y + 8 + ((i * 23 + index * 11) % Math.max(12, z.h - 16));
    const toY = py - 10 - (i % 4) * 2;
    return `<circle cx="${px}" cy="${py}" r="${zone === 'fond' ? 1.4 : 1.8}" fill="${accent}" opacity="0">
      <animate attributeName="opacity" values="0;${opacity};0" dur="${(1.6 + (i % 4) * 0.25).toFixed(2)}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${py};${toY};${py}" dur="${(2.2 + (i % 3) * 0.4).toFixed(2)}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');

  const wavePath = `M ${z.x - 20} ${z.cy} C ${z.x + z.w * 0.2} ${z.cy - 18}, ${z.x + z.w * 0.35} ${z.cy + 18}, ${z.x + z.w * 0.55} ${z.cy} S ${z.x + z.w * 0.85} ${z.cy - 18}, ${z.x + z.w + 20} ${z.cy}`;
  const zigzagPath = `M ${z.x + 4} ${z.cy} L ${z.x + z.w * 0.18} ${z.y + 8} L ${z.x + z.w * 0.33} ${z.y + z.h - 8} L ${z.x + z.w * 0.50} ${z.cy - 12} L ${z.x + z.w * 0.68} ${z.cy + 14} L ${z.x + z.w - 4} ${z.cy - 4}`;

  const body: Record<string, string> = {
    neuralPulse: `<circle cx="${z.cx}" cy="${z.cy}" r="6" fill="${accent}" opacity="0.8"/><circle cx="${z.cx}" cy="${z.cy}" r="12" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.75"><animate attributeName="r" values="8;${Math.min(z.w, z.h) * 0.48};8" dur="2.2s" begin="${delay}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.75;0;0.75" dur="2.2s" begin="${delay}s" repeatCount="indefinite"/></circle>`,
    sparkleAura: particles,
    orbitalRings: `<ellipse cx="${z.cx}" cy="${z.cy}" rx="${Math.max(20, z.w * 0.32)}" ry="${Math.max(10, z.h * 0.23)}" fill="none" stroke="${accent}" stroke-width="1.4" opacity="${opacity}" transform="rotate(-16 ${z.cx} ${z.cy})"><animate attributeName="stroke-dashoffset" values="0;-70" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/></ellipse><ellipse cx="${z.cx}" cy="${z.cy}" rx="${Math.max(14, z.w * 0.22)}" ry="${Math.max(8, z.h * 0.16)}" fill="none" stroke="${textColor}" stroke-width="0.8" opacity="0.35" transform="rotate(24 ${z.cx} ${z.cy})"/>`,
    electricArcs: `<path d="${zigzagPath}" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"><animate attributeName="stroke-dasharray" values="0 260;80 80;0 260" dur="1.35s" begin="${delay}s" repeatCount="indefinite"/></path>`,
    waveDistortion: `<path d="${wavePath}" fill="none" stroke="${accent}" stroke-width="2" opacity="${opacity}"><animate attributeName="d" values="${wavePath};M ${z.x - 20} ${z.cy + 6} C ${z.x + z.w * 0.2} ${z.cy + 20}, ${z.x + z.w * 0.35} ${z.cy - 20}, ${z.x + z.w * 0.55} ${z.cy + 4} S ${z.x + z.w * 0.85} ${z.cy + 18}, ${z.x + z.w + 20} ${z.cy - 2};${wavePath}" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/></path>`,
    neonGlow: `<rect x="${z.x + 4}" y="${z.y + 4}" width="${Math.max(20, z.w - 8)}" height="${Math.max(12, z.h - 8)}" rx="12" fill="none" stroke="${accent}" stroke-width="2" opacity="${opacity}" filter="url(#lp-glow)"><animate attributeName="opacity" values="0.3;${opacity};0.3" dur="1.8s" begin="${delay}s" repeatCount="indefinite"/></rect>`,
    particleStream: `<path d="${wavePath}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.2"/>${particles}`,
    glitchScan: `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="5" fill="${accent}" opacity="0.5"><animate attributeName="y" values="${z.y};${z.y + z.h};${z.y}" dur="1.7s" begin="${delay}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.55;0" dur="1.7s" begin="${delay}s" repeatCount="indefinite"/></rect><rect x="${z.x + 8}" y="${z.cy}" width="${Math.max(30, z.w * 0.4)}" height="1" fill="${textColor}" opacity="0.45"/>`,
    crystalFacets: `<polygon points="${z.cx},${z.y + 7} ${z.x + z.w - 8},${z.cy} ${z.cx},${z.y + z.h - 7} ${z.x + 8},${z.cy}" fill="${accent}" opacity="0.13" stroke="${accent}" stroke-width="1.2"><animate attributeName="opacity" values="0.08;0.24;0.08" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/></polygon><path d="M ${z.cx} ${z.y + 7} L ${z.cx} ${z.y + z.h - 7} M ${z.x + 8} ${z.cy} L ${z.x + z.w - 8} ${z.cy}" stroke="${accent}" opacity="0.35"/>`,
    magneticField: `<ellipse cx="${z.cx}" cy="${z.cy}" rx="${Math.max(18, z.w * 0.38)}" ry="${Math.max(10, z.h * 0.18)}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/><ellipse cx="${z.cx}" cy="${z.cy}" rx="${Math.max(24, z.w * 0.46)}" ry="${Math.max(14, z.h * 0.28)}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.25"><animate attributeName="rx" values="${Math.max(24, z.w * 0.40)};${Math.max(28, z.w * 0.50)};${Math.max(24, z.w * 0.40)}" dur="2.6s" begin="${delay}s" repeatCount="indefinite"/></ellipse>`,
    echoTrail: `<rect x="${z.x + 8}" y="${z.y + 8}" width="${Math.max(16, z.w - 16)}" height="${Math.max(10, z.h - 16)}" rx="10" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.45"/><rect x="${z.x + 14}" y="${z.y + 14}" width="${Math.max(16, z.w - 28)}" height="${Math.max(10, z.h - 28)}" rx="8" fill="none" stroke="${accent}" stroke-width="1" opacity="0.22"><animate attributeName="opacity" values="0.08;0.35;0.08" dur="2.1s" begin="${delay}s" repeatCount="indefinite"/></rect>`,
    stellarDrift: particles,
  };

  return `${clip}<g clip-path="url(#${clipId})" data-live-effect="${effectId}" opacity="${zone === 'fond' ? 1 : 0.9}">${body[effectId] ?? particles}</g>`;
}

function LiveSignaturePreview({ nom, titre, entreprise, telephone, email, site, cta, note, sectorId, logoPreview, paletteOverride, zoneEffects = {} }: LivePreviewProps) {
  const palette = paletteOverride ?? SECTOR_PALETTES[sectorId] ?? SECTOR_PALETTES['tech'];
  const [bg, accent, textColor] = palette;

  const [bgH, bgS, bgL] = hex2hslClient(bg);
  const bgLight      = `hsl(${bgH},${bgS}%,${clampC(bgL + 28, 18, 62)}%)`;
  const bgUltraLight = `hsl(${bgH},${clampC(bgS - 15, 8, 100)}%,${clampC(bgL + 46, 42, 80)}%)`;
  const bgHue2       = `hsl(${(bgH + 60) % 360},${bgS}%,${bgL}%)`;
  const bgHue2Light  = `hsl(${(bgH + 60) % 360},${bgS}%,${clampC(bgL + 32, 18, 60)}%)`;
  const bgHue3       = `hsl(${(bgH + 180) % 360},${bgS}%,${bgL}%)`;
  const bgHue3Light  = `hsl(${(bgH + 180) % 360},${bgS}%,${clampC(bgL + 24, 14, 55)}%)`;

  const displayNom = escapeSvgText(nom || 'Votre Nom');
  const displayTitre = escapeSvgText(titre || 'Votre Titre');
  const displayEntreprise = escapeSvgText(entreprise || 'Votre Entreprise');
  const displayCta = escapeSvgText(cta || 'Nous contacter');
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

  const liveEffectLayers = selectedEffectEntries.map(({ zone, effectId, index }) =>
    renderLiveEffectPreview(effectId, zone, index, accent, textColor)
  ).join('');

  const activeEffectLabels = selectedEffectEntries.map(({ zone, effectId }) => {
    const zoneLabel = COMPOSER_ZONES.find(z => z.id === zone)?.label ?? zone;
    const effect = EFFECT_CATALOG.find(e => e.id === effectId);
    return `${zoneLabel}: ${effect?.label ?? effectId}`;
  });

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 190" width="600" height="190">
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
    <clipPath id="lp-avatar-clip"><circle cx="55" cy="95" r="40"/></clipPath>
    <filter id="lp-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="lp-soft"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>

  <!-- Fond animé -->
  <rect width="600" height="190" fill="url(#lp-anim-bg)" rx="10"/>

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
  <circle cx="55" cy="95" r="48" fill="${accent}" opacity="0.08" filter="url(#lp-soft)">
    <animate attributeName="r" values="44;50;44" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.06;0.13;0.06" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- Avatar -->
  ${logoPreview
    ? `<image href="${logoPreview}" x="15" y="55" width="80" height="80" clip-path="url(#lp-avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="55" cy="95" r="40" fill="url(#lp-avatar-grad)" opacity="0.9"/>
       <text x="55" y="101" text-anchor="middle" font-size="26" font-weight="700" fill="${textColor}" font-family="system-ui,sans-serif">${initiale}</text>`
  }
  <circle cx="55" cy="95" r="40" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.6">
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

  <!-- Bouton CTA -->
  <rect x="112" y="160" width="${Math.min(displayCta.length * 7.5 + 24, 180)}" height="22" rx="11" fill="${accent}" opacity="0.9">
    <animate attributeName="opacity" values="0.75;1;0.75" dur="2.5s" repeatCount="indefinite"/>
  </rect>
  <text x="${112 + Math.min(displayCta.length * 7.5 + 24, 180) / 2}" y="175" text-anchor="middle" font-size="9.5" font-weight="600" fill="${bg}" font-family="system-ui,sans-serif">${displayCta.slice(0, 22)}</text>

  <!-- Coin badge LIVE -->
  <rect x="552" y="6" width="40" height="14" rx="7" fill="${accent}" opacity="0.15"/>
  <text x="572" y="16.5" text-anchor="middle" font-size="7" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif" opacity="0.8">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
    LIVE
  </text>
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
    ville: '', code_postal: '', cta: 'Nous contacter', note: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [customPalette, setCustomPalette] = useState<[string, string, string] | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('pulse');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [zoneEffects, setZoneEffects] = useState<ZoneEffectsMap>({});
  const prevSectorRef = useRef(form.sectorId);

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

  const toggleZoneEffect = (zone: ZoneName, effectId: string) => {
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
      toast({ title: 'Export complet généré !', description: `7 formats prêts pour ${data.sectorLabel || data.sectorId}` });
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
      toast({ title: 'Export complet généré !', description: '7 formats exportés avec succès' });
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const isPending = gmbExport.isPending || manualExport.isPending;

  const handleSubmit = () => {
    if (mode === 'gmb') {
      if (!form.gmbUrl) return toast({ title: 'URL Google Maps requise', variant: 'destructive' });
      gmbExport.mutate({
        gmb_url: form.gmbUrl,
        extra_data: {
          nom: form.nom || undefined,
          titre: form.titre || undefined,
          email: form.email || undefined,
        },
      });
    } else {
      if (!form.nom) return toast({ title: 'Le nom est requis', variant: 'destructive' });
      const cleanZoneEffects = Object.fromEntries(
        Object.entries(zoneEffects).filter(([, v]) => v && v.length > 0)
      );
      manualExport.mutate({
        sectorId: activePreset.sectorId,
        data: {
          nom: form.nom, titre: form.titre, entreprise: form.entreprise,
          telephone: form.telephone, email: form.email, site: form.site,
          adresse: form.adresse, ville: form.ville, code_postal: form.code_postal,
          cta: form.cta,
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

              {/* ── Ligne 4 : Site web + Texte CTA ─────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Site web</label>
                  <input type="url" value={form.site} onChange={e => update('site', e.target.value)}
                    placeholder="https://cabinet.fr" data-testid="input-site"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Texte bouton CTA</label>
                  <input type="text" value={form.cta} onChange={e => update('cta', e.target.value)}
                    placeholder="Nous contacter" data-testid="input-cta"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-forge-purple/60 transition-colors" />
                </div>
              </div>

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
        <button
          onClick={handleSubmit}
          disabled={isPending}
          data-testid="btn-generate-export"
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)', color: '#fff' }}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Génération en cours... (SVG · GIF · 5 formats HTML · ZIP)
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Générer la Signature Vivante Complète
            </>
          )}
        </button>
      </div>

      {/* Résultat */}
      <AnimatePresence>
        {result && (
          <motion.div
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

            {/* Aperçu */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Eye size={14} /> Aperçu par format
              </h3>
              <PreviewSection result={result} />
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
