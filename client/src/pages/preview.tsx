import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, Download, ArrowLeft, Monitor, Smartphone, Mail,
  Maximize2, RefreshCw, Check, RotateCw, Code2, Share2,
  Undo2, Redo2, Grid3X3, ZoomIn, ZoomOut, Copy, Film,
  Layers, Sparkles, MousePointer2, Move, ChevronRight,
  Sun, Moon, Power, Sliders, X, Info, Type, Image, Square,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SignatureMeta { nom: string; titre: string; entreprise: string; signature_id: string; email: string; telephone: string; }
type Background = 'white' | 'dark' | 'email' | 'slate' | 'transparent';
type Viewport = 'desktop' | 'mobile' | 'email' | 'full';
type ElementType = 'text' | 'image' | 'shape' | 'group';

interface EffectParam { key: string; label: string; type: 'slider' | 'color'; min?: number; max?: number; step?: number; unit?: string; defaultVal: number | string; }
interface EffectDef { id: string; name: string; icon: string; description: string; forTypes: ElementType[]; params: EffectParam[]; cssFilter?: (p: Record<string, any>) => string; cssStyle?: (p: Record<string, any>) => Record<string, string>; }
interface AppliedEffect { defId: string; enabled: boolean; params: Record<string, any>; }
interface SvgElement { uid: string; el: SVGElement; tagName: string; type: ElementType; label: string; effects: AppliedEffect[]; }
interface ContextMenu { x: number; y: number; uid: string; }

interface StudioState {
  scale: number; speedPct: number; bg: Background; viewport: Viewport;
  showGrid: boolean; svgOverride: string;
}
const DEFAULT_STATE: StudioState = { scale: 100, speedPct: 100, bg: 'white', viewport: 'desktop', showGrid: false, svgOverride: '' };

const BG_OPTIONS: { key: Background; label: string; bg: string }[] = [
  { key: 'white', label: 'Blanc', bg: '#ffffff' },
  { key: 'dark', label: 'Sombre', bg: '#0d0d0d' },
  { key: 'email', label: 'Email', bg: '#f4f4f5' },
  { key: 'slate', label: 'Ardoise', bg: '#1e293b' },
  { key: 'transparent', label: 'Transp.', bg: 'transparent' },
];
const VIEWPORT_W: Record<Viewport, number | null> = { desktop: 700, mobile: 375, email: 600, full: null };

// ── Catalogue d'effets par type d'élément ─────────────────────────────────────
const EFFECT_DEFS: EffectDef[] = [
  // Universels
  {
    id: 'opacity', name: 'Opacité', icon: '💧', description: 'Contrôle la transparence',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Opacité', type: 'slider', min: 0, max: 100, step: 5, unit: '%', defaultVal: 100 }],
    cssStyle: (p) => ({ opacity: String(p.value / 100) }),
  },
  {
    id: 'glow', name: 'Halo (Glow)', icon: '✨', description: 'Ajoute un halo lumineux autour',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [
      { key: 'intensity', label: 'Intensité', type: 'slider', min: 1, max: 30, step: 1, unit: 'px', defaultVal: 8 },
      { key: 'color', label: 'Couleur', type: 'color', defaultVal: '#00d4ff' },
    ],
    cssFilter: (p) => `drop-shadow(0 0 ${p.intensity}px ${p.color}) drop-shadow(0 0 ${Math.round(p.intensity / 2)}px ${p.color})`,
  },
  {
    id: 'blur', name: 'Flou doux', icon: '🌫️', description: 'Effet de flou artistique',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Flou', type: 'slider', min: 0.5, max: 15, step: 0.5, unit: 'px', defaultVal: 2 }],
    cssFilter: (p) => `blur(${p.value}px)`,
  },
  // Texte seulement
  {
    id: 'text-shadow', name: 'Ombre de texte', icon: '🌑', description: 'Ombre portée sous le texte',
    forTypes: ['text'],
    params: [
      { key: 'x', label: 'Décalage X', type: 'slider', min: -10, max: 10, step: 1, unit: 'px', defaultVal: 2 },
      { key: 'y', label: 'Décalage Y', type: 'slider', min: -10, max: 10, step: 1, unit: 'px', defaultVal: 2 },
      { key: 'blur', label: 'Flou', type: 'slider', min: 0, max: 20, step: 1, unit: 'px', defaultVal: 4 },
      { key: 'color', label: 'Couleur', type: 'color', defaultVal: '#000000' },
    ],
    cssStyle: (p) => ({ filter: `drop-shadow(${p.x}px ${p.y}px ${p.blur}px ${p.color})` }),
  },
  {
    id: 'text-scale', name: 'Agrandissement', icon: '🔍', description: 'Modifie la taille du texte',
    forTypes: ['text'],
    params: [{ key: 'value', label: 'Échelle', type: 'slider', min: 50, max: 200, step: 5, unit: '%', defaultVal: 100 }],
    cssStyle: (p) => ({ transform: `scale(${p.value / 100})`, transformOrigin: 'left center' }),
  },
  {
    id: 'neon-text', name: 'Néon Cyber', icon: '⚡', description: 'Effet néon cyberpunk sur le texte',
    forTypes: ['text'],
    params: [
      { key: 'intensity', label: 'Intensité', type: 'slider', min: 2, max: 20, step: 1, unit: 'px', defaultVal: 8 },
      { key: 'color', label: 'Couleur néon', type: 'color', defaultVal: '#00d4ff' },
    ],
    cssFilter: (p) => `drop-shadow(0 0 ${p.intensity}px ${p.color}) drop-shadow(0 0 ${p.intensity * 2}px ${p.color}) drop-shadow(0 0 1px #fff)`,
  },
  // Image seulement
  {
    id: 'brightness', name: 'Luminosité', icon: '🔆', description: 'Contrôle la luminosité',
    forTypes: ['image'],
    params: [{ key: 'value', label: 'Luminosité', type: 'slider', min: 0, max: 200, step: 5, unit: '%', defaultVal: 100 }],
    cssFilter: (p) => `brightness(${p.value}%)`,
  },
  {
    id: 'contrast', name: 'Contraste', icon: '🔲', description: 'Ajuste le contraste',
    forTypes: ['image'],
    params: [{ key: 'value', label: 'Contraste', type: 'slider', min: 0, max: 300, step: 5, unit: '%', defaultVal: 100 }],
    cssFilter: (p) => `contrast(${p.value}%)`,
  },
  {
    id: 'saturate', name: 'Saturation', icon: '🎨', description: 'Intensité des couleurs',
    forTypes: ['image'],
    params: [{ key: 'value', label: 'Saturation', type: 'slider', min: 0, max: 300, step: 5, unit: '%', defaultVal: 100 }],
    cssFilter: (p) => `saturate(${p.value}%)`,
  },
  {
    id: 'hue-rotate', name: 'Teinte (Hue)', icon: '🌈', description: 'Rotation de la teinte colorimétrique',
    forTypes: ['image'],
    params: [{ key: 'value', label: 'Angle', type: 'slider', min: 0, max: 360, step: 5, unit: '°', defaultVal: 0 }],
    cssFilter: (p) => `hue-rotate(${p.value}deg)`,
  },
  {
    id: 'sepia', name: 'Sépia', icon: '📷', description: 'Effet photo vintage sépia',
    forTypes: ['image'],
    params: [{ key: 'value', label: 'Intensité', type: 'slider', min: 0, max: 100, step: 5, unit: '%', defaultVal: 70 }],
    cssFilter: (p) => `sepia(${p.value}%)`,
  },
  // Formes seulement
  {
    id: 'shape-glow', name: 'Lueur de forme', icon: '💫', description: 'Halo coloré autour de la forme',
    forTypes: ['shape'],
    params: [
      { key: 'size', label: 'Taille', type: 'slider', min: 2, max: 25, step: 1, unit: 'px', defaultVal: 6 },
      { key: 'color', label: 'Couleur', type: 'color', defaultVal: '#8338ec' },
    ],
    cssFilter: (p) => `drop-shadow(0 0 ${p.size}px ${p.color})`,
  },
  {
    id: 'shape-shadow', name: 'Ombre portée', icon: '🌒', description: 'Ombre sous la forme',
    forTypes: ['shape'],
    params: [
      { key: 'x', label: 'X', type: 'slider', min: -15, max: 15, step: 1, unit: 'px', defaultVal: 4 },
      { key: 'y', label: 'Y', type: 'slider', min: -15, max: 15, step: 1, unit: 'px', defaultVal: 4 },
      { key: 'blur', label: 'Flou', type: 'slider', min: 0, max: 20, step: 1, unit: 'px', defaultVal: 8 },
      { key: 'color', label: 'Couleur', type: 'color', defaultVal: '#000000' },
    ],
    cssFilter: (p) => `drop-shadow(${p.x}px ${p.y}px ${p.blur}px ${p.color})`,
  },
];

// ── Utilitaires ────────────────────────────────────────────────────────────────
function detectType(tagName: string): ElementType {
  if (['text', 'tspan', 'textPath'].includes(tagName)) return 'text';
  if (['image', 'use'].includes(tagName)) return 'image';
  if (['rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line'].includes(tagName)) return 'shape';
  return 'group';
}

function getElementLabel(el: SVGElement, idx: number): string {
  const tag = el.tagName.toLowerCase();
  const id = el.getAttribute('id');
  const textContent = el.textContent?.trim().slice(0, 20);
  if (tag === 'text' || tag === 'tspan') return textContent ? `Texte: "${textContent}"` : `Texte #${idx + 1}`;
  if (tag === 'image') return `Image #${idx + 1}`;
  if (id) return `${tag}#${id}`;
  return `${tag} #${idx + 1}`;
}

function buildFilter(effects: AppliedEffect[]): string {
  const parts: string[] = [];
  for (const eff of effects) {
    if (!eff.enabled) continue;
    const def = EFFECT_DEFS.find(d => d.id === eff.defId);
    if (def?.cssFilter) parts.push(def.cssFilter(eff.params));
  }
  return parts.filter(Boolean).join(' ');
}

function buildStyle(effects: AppliedEffect[]): Record<string, string> {
  let style: Record<string, string> = {};
  for (const eff of effects) {
    if (!eff.enabled) continue;
    const def = EFFECT_DEFS.find(d => d.id === eff.defId);
    if (def?.cssStyle) style = { ...style, ...def.cssStyle(eff.params) };
  }
  return style;
}

function applyEffectsToElement(el: SVGElement, effects: AppliedEffect[]) {
  const filterStr = buildFilter(effects);
  const styleObj = buildStyle(effects);

  el.style.filter = filterStr || '';
  for (const [k, v] of Object.entries(styleObj)) {
    (el.style as any)[k] = v;
  }
}

async function exportAsPng(svgStr: string, scale: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const w = Math.round(img.width * scale / 100);
      const h = Math.round(img.height * scale / 100);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context failed')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => {
        if (!b) { reject(new Error('PNG export failed')); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'signature_god_tier.png';
        a.click();
        resolve();
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

// ── Composant Menu Contextuel ─────────────────────────────────────────────────
function ContextMenuPanel({ ctx, svgEls, onClose, onToggleEffect, onSetParam }: {
  ctx: ContextMenu;
  svgEls: SvgElement[];
  onClose: () => void;
  onToggleEffect: (uid: string, defId: string) => void;
  onSetParam: (uid: string, defId: string, paramKey: string, value: any) => void;
}) {
  const el = svgEls.find(e => e.uid === ctx.uid);
  if (!el) return null;
  const availableEffects = EFFECT_DEFS.filter(d => d.forTypes.includes(el.type));
  const [expandedEff, setExpandedEff] = useState<string | null>(null);

  return (
    <div
      className="fixed z-50 bg-[#0e1117] border border-white/15 rounded-xl shadow-2xl w-72 overflow-hidden"
      style={{ left: Math.min(ctx.x, window.innerWidth - 300), top: Math.min(ctx.y, window.innerHeight - 400) }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2">
          {el.type === 'text' && <Type className="w-3.5 h-3.5 text-forge-cyan" />}
          {el.type === 'image' && <Image className="w-3.5 h-3.5 text-amber-400" />}
          {el.type === 'shape' && <Square className="w-3.5 h-3.5 text-violet-400" />}
          {el.type === 'group' && <Layers className="w-3.5 h-3.5 text-green-400" />}
          <span className="text-white text-xs font-semibold truncate max-w-[160px]">{el.label}</span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Type badge */}
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
        <span className="text-[10px] text-white/30">Effets disponibles pour</span>
        <Badge className="text-[9px] px-1.5 py-0 h-4 bg-white/8 border-white/15 text-white/60 capitalize">{el.type}</Badge>
      </div>

      {/* Effects list */}
      <div className="overflow-y-auto max-h-80">
        {availableEffects.map(def => {
          const applied = el.effects.find(e => e.defId === def.id);
          const isEnabled = applied?.enabled ?? false;
          const isExpanded = expandedEff === def.id;

          return (
            <div key={def.id} className={`border-b border-white/5 last:border-0 transition-colors ${isEnabled ? 'bg-forge-cyan/3' : ''}`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-sm">{def.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-white/80">{def.name}</p>
                  <p className="text-[9px] text-white/30 truncate">{def.description}</p>
                </div>
                {/* Toggle activer/désactiver */}
                <button
                  data-testid={`toggle-effect-${def.id}`}
                  onClick={() => onToggleEffect(ctx.uid, def.id)}
                  className={`flex items-center justify-center w-8 h-4 rounded-full transition-all flex-shrink-0 ${isEnabled ? 'bg-forge-cyan' : 'bg-white/15'}`}
                >
                  <span className={`w-3 h-3 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-1' : '-translate-x-1'}`} />
                </button>
                {/* Expand params */}
                {def.params.length > 0 && isEnabled && (
                  <button
                    onClick={() => setExpandedEff(isExpanded ? null : def.id)}
                    className="text-white/30 hover:text-white transition-colors ml-1"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Params panel */}
              {isEnabled && isExpanded && applied && (
                <div className="px-3 pb-2.5 space-y-2 bg-white/3 border-t border-white/5">
                  {def.params.map(param => (
                    <div key={param.key} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">{param.label}</span>
                        {param.type === 'slider' && (
                          <span className="text-forge-cyan font-mono">{applied.params[param.key]}{param.unit}</span>
                        )}
                      </div>
                      {param.type === 'slider' ? (
                        <Slider
                          value={[Number(applied.params[param.key] ?? param.defaultVal)]}
                          onValueChange={([v]) => onSetParam(ctx.uid, def.id, param.key, v)}
                          min={param.min!} max={param.max!} step={param.step!}
                          className="w-full"
                        />
                      ) : (
                        <input
                          type="color"
                          value={String(applied.params[param.key] ?? param.defaultVal)}
                          onChange={e => onSetParam(ctx.uid, def.id, param.key, e.target.value)}
                          className="w-full h-6 rounded border border-white/20 bg-transparent cursor-pointer"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-white/8 bg-white/2">
        <p className="text-[9px] text-white/20 text-center">Clic droit sur un élément pour ouvrir ce menu</p>
      </div>
    </div>
  );
}

// ══ COMPOSANT PRINCIPAL ══════════════════════════════════════════════════════
export default function Preview() {
  const { toast } = useToast();
  const [sourceSvg, setSourceSvg] = useState('');
  const [meta, setMeta] = useState<SignatureMeta | null>(null);
  const [state, setState] = useState<StudioState>(DEFAULT_STATE);
  const [history, setHistory] = useState<StudioState[]>([DEFAULT_STATE]);
  const [histIdx, setHistIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [exported, setExported] = useState<string | null>(null);

  // Éléments interactifs
  const [svgEls, setSvgEls] = useState<SvgElement[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'select' | 'move'>('select');

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragTargetRef = useRef<SVGElement | null>(null);
  const dragStartRef = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  // ── Charger SVG depuis localStorage ──────────────────────────────────────
  useEffect(() => {
    const svg = localStorage.getItem('reality_preview_svg') || '';
    const rawMeta = localStorage.getItem('reality_preview_meta');
    setSourceSvg(svg);
    if (rawMeta) { try { setMeta(JSON.parse(rawMeta)); } catch { /* noop */ } }
  }, []);

  // ── History ───────────────────────────────────────────────────────────────
  const pushHistory = useCallback((next: StudioState) => {
    setHistory(h => [...h.slice(0, histIdx + 1), next]);
    setHistIdx(i => i + 1);
    setState(next);
  }, [histIdx]);
  const undo = () => { if (histIdx <= 0) return; setHistIdx(i => i - 1); setState(history[histIdx - 1]); };
  const redo = () => { if (histIdx >= history.length - 1) return; setHistIdx(i => i + 1); setState(history[histIdx + 1]); };
  const update = (patch: Partial<StudioState>) => pushHistory({ ...state, ...patch });

  // ── SVG actif ─────────────────────────────────────────────────────────────
  const activeSvg = state.svgOverride || sourceSvg;

  const processedSvg = (() => {
    if (!activeSvg) return '';
    if (isPaused) {
      return activeSvg
        .replace(/animation-play-state:[^;"}]+/g, 'animation-play-state:paused')
        .replace(/<animateTransform/g, '<animateTransform begin="indefinite"');
    }
    if (state.speedPct === 100) return activeSvg;
    const f = 100 / state.speedPct;
    return activeSvg
      .replace(/animation-duration:\s*([\d.]+)s/g, (_, d) => `animation-duration:${(parseFloat(d) * f).toFixed(2)}s`)
      .replace(/dur="([\d.]+)s"/g, (_, d) => `dur="${(parseFloat(d) * f).toFixed(2)}s"`)
      .replace(/dur="([\d.]+)"/g, (_, d) => `dur="${(parseFloat(d) * f).toFixed(2)}"`);
  })();

  // ── Scanner les éléments SVG après montage ────────────────────────────────
  useEffect(() => {
    if (!processedSvg || !svgContainerRef.current) return;
    const timer = setTimeout(() => {
      const container = svgContainerRef.current;
      if (!container) return;
      const svgEl = container.querySelector('svg');
      if (!svgEl) return;

      const SELECTABLE = ['text', 'tspan', 'image', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g'];
      const found: SVGElement[] = [];
      SELECTABLE.forEach(tag => {
        const els = svgEl.querySelectorAll(tag);
        els.forEach(el => {
          const parent = el.parentElement;
          if (parent && parent.tagName.toLowerCase() === 'tspan') return;
          found.push(el as SVGElement);
        });
      });

      const mapped: SvgElement[] = found.map((el, i) => {
        const uid = `el-${i}-${el.tagName}`;
        el.dataset.uid = uid;
        el.style.cursor = 'pointer';
        return {
          uid,
          el,
          tagName: el.tagName.toLowerCase(),
          type: detectType(el.tagName.toLowerCase()),
          label: getElementLabel(el, i),
          effects: [],
        };
      });
      setSvgEls(mapped);
    }, 150);
    return () => clearTimeout(timer);
  }, [processedSvg]);

  // ── Handlers SVG pointer events ───────────────────────────────────────────
  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const uid = target.dataset?.uid || (target.closest('[data-uid]') as SVGElement | null)?.dataset?.uid;

    if (!uid) {
      setSelectedUid(null);
      setContextMenu(null);
      return;
    }
    setSelectedUid(uid);
    setContextMenu(null);

    // Highlight selected
    svgEls.forEach(el => {
      el.el.style.outline = '';
      el.el.style.boxShadow = '';
      el.el.style.filter = buildFilter(el.effects) || el.el.style.filter;
    });
    const found = svgEls.find(el => el.uid === uid);
    if (found) {
      const existing = buildFilter(found.effects);
      found.el.style.filter = existing
        ? `${existing} drop-shadow(0 0 2px rgba(0,212,255,0.8))`
        : 'drop-shadow(0 0 2px rgba(0,212,255,0.8))';
    }
  }, [svgEls]);

  const handleSvgContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as SVGElement;
    const uid = target.dataset?.uid || (target.closest('[data-uid]') as SVGElement | null)?.dataset?.uid;
    if (!uid) { setContextMenu(null); return; }

    setSelectedUid(uid);
    setContextMenu({ x: e.clientX, y: e.clientY, uid });
  }, []);

  // ── Drag to move ──────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool !== 'move') return;
    const target = e.target as SVGElement;
    const uid = target.dataset?.uid || (target.closest('[data-uid]') as SVGElement | null)?.dataset?.uid;
    if (!uid) return;

    const found = svgEls.find(el => el.uid === uid);
    if (!found) return;

    dragTargetRef.current = found.el;
    const transform = found.el.getAttribute('transform') || '';
    const match = transform.match(/translate\(([-\d.]+)[,\s]+([-\d.]+)\)/);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;

    dragStartRef.current = { mx: e.clientX, my: e.clientY, tx, ty };
    setIsDragging(true);
    e.preventDefault();
  }, [tool, svgEls]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragTargetRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.mx;
    const dy = e.clientY - dragStartRef.current.my;
    const nx = dragStartRef.current.tx + dx;
    const ny = dragStartRef.current.ty + dy;
    dragTargetRef.current.setAttribute('transform', `translate(${nx}, ${ny})`);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragTargetRef.current = null;
    dragStartRef.current = null;
  }, []);

  // ── Toggle effect ─────────────────────────────────────────────────────────
  const handleToggleEffect = useCallback((uid: string, defId: string) => {
    setSvgEls(prev => prev.map(el => {
      if (el.uid !== uid) return el;
      const def = EFFECT_DEFS.find(d => d.id === defId);
      if (!def) return el;

      const existing = el.effects.find(e => e.defId === defId);
      let newEffects: AppliedEffect[];

      if (existing) {
        newEffects = el.effects.map(e => e.defId === defId ? { ...e, enabled: !e.enabled } : e);
      } else {
        const defaultParams: Record<string, any> = {};
        def.params.forEach(p => { defaultParams[p.key] = p.defaultVal; });
        newEffects = [...el.effects, { defId, enabled: true, params: defaultParams }];
      }

      const updated = { ...el, effects: newEffects };
      applyEffectsToElement(el.el, newEffects);
      // Re-add selection highlight if still selected
      if (uid === selectedUid) {
        const f = buildFilter(newEffects);
        el.el.style.filter = f
          ? `${f} drop-shadow(0 0 2px rgba(0,212,255,0.8))`
          : 'drop-shadow(0 0 2px rgba(0,212,255,0.8))';
      }
      return updated;
    }));
  }, [selectedUid]);

  const handleSetParam = useCallback((uid: string, defId: string, paramKey: string, value: any) => {
    setSvgEls(prev => prev.map(el => {
      if (el.uid !== uid) return el;
      const newEffects = el.effects.map(e =>
        e.defId === defId ? { ...e, params: { ...e.params, [paramKey]: value } } : e
      );
      const updated = { ...el, effects: newEffects };
      applyEffectsToElement(el.el, newEffects);
      if (uid === selectedUid) {
        const f = buildFilter(newEffects);
        el.el.style.filter = f
          ? `${f} drop-shadow(0 0 2px rgba(0,212,255,0.8))`
          : 'drop-shadow(0 0 2px rgba(0,212,255,0.8))';
      }
      return updated;
    }));
  }, [selectedUid]);

  // ── Exports ───────────────────────────────────────────────────────────────
  const downloadSvg = () => {
    const blob = new Blob([activeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `signature_god_tier_${meta?.signature_id || 'export'}.svg`; a.click();
    URL.revokeObjectURL(url); setExported('svg');
    toast({ title: '✅ SVG téléchargé !' });
  };
  const downloadPng = async () => {
    try { await exportAsPng(activeSvg, state.scale); setExported('png'); toast({ title: '✅ PNG exporté !' }); }
    catch (e: any) { toast({ title: 'Erreur PNG', description: e.message, variant: 'destructive' }); }
  };
  const copyHtml = () => {
    const html = `<table cellpadding="0" cellspacing="0" border="0"><tr><td>${activeSvg.trim()}</td></tr></table>`;
    navigator.clipboard.writeText(html).then(() => { setExported('html'); toast({ title: '✅ HTML copié !' }); });
  };

  const hasSvg = Boolean(activeSvg);
  const vw = VIEWPORT_W[state.viewport];
  const selectedEl = svgEls.find(e => e.uid === selectedUid);
  const activeEffectsCount = selectedEl ? selectedEl.effects.filter(e => e.enabled).length : 0;

  return (
    <div
      className="flex flex-col h-screen bg-[#080b10] text-white overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 bg-[#0a0d14] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/studio">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white gap-1.5 h-8 text-xs" data-testid="button-back-studio">
              <ArrowLeft className="w-3.5 h-3.5" /> Studio
            </Button>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-forge-cyan animate-pulse" />
            <span className="text-forge-cyan text-sm font-bold tracking-widest">REALITY STUDIO</span>
            <Badge className="bg-violet-600/30 border-violet-500/40 text-violet-300 text-[10px] px-1.5">GOD TIER</Badge>
          </div>
        </div>

        {/* Outils */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTool('select')}
            data-testid="button-tool-select"
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] font-medium transition-all ${tool === 'select' ? 'bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30' : 'text-white/40 hover:text-white border border-transparent'}`}>
            <MousePointer2 className="w-3 h-3" /> Sélect.
          </button>
          <button
            onClick={() => setTool('move')}
            data-testid="button-tool-move"
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] font-medium transition-all ${tool === 'move' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-white/40 hover:text-white border border-transparent'}`}>
            <Move className="w-3 h-3" /> Déplacer
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <Button variant="ghost" size="sm" onClick={undo} disabled={histIdx <= 0} className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-20" data-testid="button-undo"><Undo2 className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={histIdx >= history.length - 1} className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-20" data-testid="button-redo"><Redo2 className="w-3.5 h-3.5" /></Button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={() => update({ showGrid: !state.showGrid })}
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] border transition-all ${state.showGrid ? 'bg-forge-cyan/10 text-forge-cyan border-forge-cyan/30' : 'text-white/40 border-transparent hover:text-white'}`}
            data-testid="button-grid">
            <Grid3X3 className="w-3 h-3" /> Grille
          </button>
          <button
            onClick={() => setIsPaused(p => !p)}
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] border transition-all ${isPaused ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'text-white/40 border-transparent hover:text-white'}`}
            data-testid="button-pause">
            <Film className="w-3 h-3" /> {isPaused ? 'Relancer' : 'Pause'}
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <Button onClick={downloadSvg} size="sm" className="h-7 px-3 bg-gradient-to-r from-forge-cyan to-violet-600 text-white text-xs font-semibold gap-1.5" data-testid="button-quick-export">
            <Download className="w-3.5 h-3.5" /> Exporter
          </Button>
        </div>
      </div>

      {!hasSvg ? (
        <div className="flex flex-col items-center justify-center flex-1 space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/3 border border-white/10 flex items-center justify-center">
            <Eye className="w-8 h-8 text-white/15" />
          </div>
          <p className="text-white/30 text-center text-sm">
            Aucune signature chargée dans le Reality Studio.<br />
            <Link href="/studio"><span className="text-forge-cyan underline cursor-pointer">Générez-en une depuis le Studio →</span></Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* ── PANNEAU GAUCHE — Global ──────────────────────────────────── */}
          <div className="w-48 flex-shrink-0 border-r border-white/8 bg-[#0a0d14] overflow-y-auto p-2 space-y-2">

            {/* Fond */}
            <section className="rounded-xl border border-white/8 bg-white/3 p-2.5 space-y-2">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Fond</p>
              <div className="grid grid-cols-2 gap-1">
                {BG_OPTIONS.map(({ key, label, bg }) => (
                  <button key={key} onClick={() => update({ bg: key })} data-testid={`button-bg-${key}`}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] transition-all ${state.bg === key ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/10' : 'border-white/8 text-white/35 hover:border-white/25'}`}>
                    <div className="w-3.5 h-3.5 rounded border border-white/20 flex-shrink-0" style={{ background: bg === 'transparent' ? 'repeating-conic-gradient(#444 0% 25%, #222 0% 50%) 0 0 / 6px 6px' : bg }} />
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {/* Viewport */}
            <section className="rounded-xl border border-white/8 bg-white/3 p-2.5 space-y-1">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Contexte</p>
              {([['desktop', Monitor, 'Bureau'], ['mobile', Smartphone, 'Mobile'], ['email', Mail, 'Email'], ['full', Maximize2, 'Plein']] as [Viewport, any, string][]).map(([v, Icon, label]) => (
                <button key={v} onClick={() => update({ viewport: v })} data-testid={`button-vp-${v}`}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[11px] transition-all ${state.viewport === v ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/10' : 'border-white/8 text-white/35 hover:border-white/20'}`}>
                  <Icon className="w-3 h-3 flex-shrink-0" /> {label}
                </button>
              ))}
            </section>

            {/* Zoom */}
            <section className="rounded-xl border border-white/8 bg-white/3 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Zoom</p>
                <span className="text-forge-cyan text-[11px] font-mono">{state.scale}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => update({ scale: Math.max(20, state.scale - 10) })} className="h-6 w-6 p-0 text-white/40 hover:text-white"><ZoomOut className="w-3 h-3" /></Button>
                <Slider value={[state.scale]} onValueChange={([v]) => update({ scale: v })} min={20} max={200} step={5} className="flex-1" data-testid="slider-zoom" />
                <Button variant="ghost" size="sm" onClick={() => update({ scale: Math.min(200, state.scale + 10) })} className="h-6 w-6 p-0 text-white/40 hover:text-white"><ZoomIn className="w-3 h-3" /></Button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[50, 100, 150].map(v => (
                  <button key={v} onClick={() => update({ scale: v })}
                    className={`text-[10px] py-0.5 rounded border transition-all ${state.scale === v ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/10' : 'border-white/10 text-white/30 hover:border-white/25'}`}>{v}%</button>
                ))}
              </div>
            </section>

            {/* Vitesse */}
            <section className="rounded-xl border border-white/8 bg-white/3 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Vitesse</p>
                <span className="text-violet-300 text-[11px] font-mono">{state.speedPct}%</span>
              </div>
              <Slider value={[state.speedPct]} onValueChange={([v]) => update({ speedPct: v })} min={10} max={300} step={10} className="w-full" data-testid="slider-speed" />
              <div className="grid grid-cols-3 gap-1">
                {[50, 100, 200].map(v => (
                  <button key={v} onClick={() => update({ speedPct: v })}
                    className={`text-[10px] py-0.5 rounded border transition-all ${state.speedPct === v ? 'border-violet-500 text-violet-300 bg-violet-500/10' : 'border-white/10 text-white/30 hover:border-white/25'}`}>{v}%</button>
                ))}
              </div>
            </section>

            {/* Info outil */}
            <section className="rounded-xl border border-white/8 bg-blue-500/5 p-2.5 space-y-1">
              <p className="text-[10px] font-semibold text-blue-300/60 uppercase tracking-widest flex items-center gap-1"><Info className="w-3 h-3" /> Instructions</p>
              <p className="text-[10px] text-white/30 leading-relaxed">
                <span className="text-forge-cyan">Clic gauche</span> → sélectionner<br />
                <span className="text-amber-400">Clic droit</span> → effets de l'élément<br />
                <span className="text-green-400">Outil déplacer</span> → glisser
              </p>
            </section>
          </div>

          {/* ── CANVAS CENTRAL ──────────────────────────────────────────── */}
          <div
            ref={canvasRef}
            className="flex-1 flex flex-col overflow-auto relative"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 bg-[#0a0d14] flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {vw && <Badge variant="outline" className="border-white/15 text-white/35 text-[10px] h-5">{vw}px</Badge>}
                {svgEls.length > 0 && <Badge variant="outline" className="border-white/15 text-white/35 text-[10px] h-5">{svgEls.length} éléments</Badge>}
                {selectedEl && (
                  <Badge variant="outline" className="border-forge-cyan/40 text-forge-cyan text-[10px] h-5">
                    ✦ {selectedEl.label.slice(0, 24)} {activeEffectsCount > 0 ? `(${activeEffectsCount} effet${activeEffectsCount > 1 ? 's' : ''})` : ''}
                  </Badge>
                )}
                {isPaused && <Badge variant="outline" className="border-amber-400/40 text-amber-400 text-[10px] h-5">⏸ Pause</Badge>}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/25 text-[10px]">LIVE</span>
              </div>
            </div>

            {/* Zone de prévisualisation */}
            <div className="flex-1 flex items-start justify-center p-6 overflow-auto">
              <div
                className="relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
                style={{
                  width: vw ? Math.min(vw, 900) : '100%',
                  maxWidth: '100%',
                  background: BG_OPTIONS.find(b => b.key === state.bg)?.bg || '#fff',
                  transform: `scale(${state.scale / 100})`,
                  transformOrigin: 'top center',
                  border: state.bg === 'transparent' ? '1px dashed rgba(255,255,255,0.12)' : 'none',
                  cursor: tool === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'default',
                }}
                data-testid="signature-preview-canvas"
              >
                {/* Grille overlay */}
                {state.showGrid && (
                  <div className="absolute inset-0 pointer-events-none z-10" style={{
                    backgroundImage: 'linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }} />
                )}
                <div
                  ref={svgContainerRef}
                  onClick={handleSvgClick}
                  onContextMenu={handleSvgContextMenu}
                  onMouseDown={handleMouseDown}
                  style={{ display: 'block', lineHeight: 0, userSelect: 'none' }}
                  dangerouslySetInnerHTML={{ __html: processedSvg }}
                />
              </div>
            </div>

            {/* Barre d'actions export */}
            <div className="flex gap-2 px-4 py-3 border-t border-white/8 bg-[#0a0d14] flex-shrink-0">
              <Button onClick={downloadSvg} className="flex-1 h-9 bg-gradient-to-r from-forge-cyan to-violet-600 text-white font-semibold text-sm rounded-xl hover:opacity-90 gap-2" data-testid="button-export-svg-final">
                {exported === 'svg' ? <><Check className="w-4 h-4" /> SVG exporté !</> : <><Download className="w-4 h-4" /> Exporter SVG</>}
              </Button>
              <Button onClick={downloadPng} className="h-9 px-4 bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-sm font-semibold rounded-xl gap-1.5" data-testid="button-export-png">
                <Download className="w-3.5 h-3.5" /> PNG
              </Button>
              <Button onClick={copyHtml} className="h-9 px-4 bg-green-500/15 border border-green-500/40 text-green-300 hover:bg-green-500/25 text-sm font-semibold rounded-xl gap-1.5" data-testid="button-copy-html">
                {exported === 'html' ? <><Check className="w-3.5 h-3.5" /> Copié !</> : <><Copy className="w-3.5 h-3.5" /> HTML email</>}
              </Button>
            </div>
          </div>

          {/* ── PANNEAU DROIT — Éléments & Effets ───────────────────────── */}
          <div className="w-64 flex-shrink-0 border-l border-white/8 bg-[#0a0d14] flex flex-col overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/8">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-forge-cyan" /> Calques & Effets
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {svgEls.length === 0 && (
                <p className="text-white/20 text-[11px] text-center py-8">Chargement des éléments…</p>
              )}
              {svgEls.map(el => {
                const isSelected = el.uid === selectedUid;
                const enabledCount = el.effects.filter(e => e.enabled).length;
                return (
                  <div
                    key={el.uid}
                    onClick={() => {
                      setSelectedUid(el.uid);
                      // Scroll to + highlight
                      svgEls.forEach(e => {
                        const f = buildFilter(e.effects);
                        e.el.style.filter = f || '';
                      });
                      const f = buildFilter(el.effects);
                      el.el.style.filter = f
                        ? `${f} drop-shadow(0 0 2px rgba(0,212,255,0.8))`
                        : 'drop-shadow(0 0 2px rgba(0,212,255,0.8))';
                      el.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    onContextMenu={e => { e.preventDefault(); setSelectedUid(el.uid); setContextMenu({ x: e.clientX, y: e.clientY, uid: el.uid }); }}
                    data-testid={`element-layer-${el.uid}`}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-forge-cyan/50 bg-forge-cyan/8 text-forge-cyan' : 'border-white/6 text-white/50 hover:border-white/20 hover:text-white/70'}`}
                  >
                    {el.type === 'text' && <Type className="w-3.5 h-3.5 flex-shrink-0 text-forge-cyan" />}
                    {el.type === 'image' && <Image className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />}
                    {el.type === 'shape' && <Square className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />}
                    {el.type === 'group' && <Layers className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />}
                    <span className="text-[11px] flex-1 truncate">{el.label}</span>
                    {enabledCount > 0 && (
                      <Badge className="text-[9px] px-1.5 py-0 h-4 bg-forge-cyan/20 border-forge-cyan/30 text-forge-cyan flex-shrink-0">
                        {enabledCount}
                      </Badge>
                    )}
                    <ChevronRight className="w-3 h-3 opacity-30 flex-shrink-0" />
                  </div>
                );
              })}
            </div>

            {/* Panel effets actifs de l'élément sélectionné */}
            {selectedEl && (
              <div className="border-t border-white/8 bg-white/2 p-2 space-y-2 max-h-56 overflow-y-auto">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-violet-400" /> Effets actifs
                </p>
                {EFFECT_DEFS.filter(d => d.forTypes.includes(selectedEl.type)).map(def => {
                  const applied = selectedEl.effects.find(e => e.defId === def.id);
                  const enabled = applied?.enabled ?? false;
                  return (
                    <div key={def.id} className="flex items-center gap-2">
                      <span className="text-sm w-5 flex-shrink-0">{def.icon}</span>
                      <span className="text-[11px] text-white/60 flex-1 truncate">{def.name}</span>
                      <button
                        onClick={() => handleToggleEffect(selectedEl.uid, def.id)}
                        data-testid={`panel-toggle-${def.id}`}
                        className={`flex items-center justify-center w-8 h-4 rounded-full transition-all flex-shrink-0 ${enabled ? 'bg-forge-cyan' : 'bg-white/10'}`}
                      >
                        <span className={`w-3 h-3 rounded-full bg-white transition-transform ${enabled ? 'translate-x-1' : '-translate-x-1'}`} />
                      </button>
                    </div>
                  );
                })}
                <p className="text-[9px] text-white/20 mt-1">Clic droit → réglages fins de chaque effet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MENU CONTEXTUEL ──────────────────────────────────────────────────── */}
      {contextMenu && (
        <div onClick={e => e.stopPropagation()}>
          <ContextMenuPanel
            ctx={contextMenu}
            svgEls={svgEls}
            onClose={() => setContextMenu(null)}
            onToggleEffect={handleToggleEffect}
            onSetParam={handleSetParam}
          />
        </div>
      )}
    </div>
  );
}

// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion