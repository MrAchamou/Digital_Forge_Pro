import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, Download, ArrowLeft, Monitor, Smartphone, Mail,
  Maximize2, RefreshCw, Check, Film,
  Layers, Sparkles, MousePointer2, Move,
  Sun, Moon, Sliders, X, Info, Type, Image, Square,
  ZoomIn, ZoomOut, Grid3X3, Undo2, Redo2, Copy, Code2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Background = 'white' | 'dark' | 'email' | 'slate' | 'transparent';
type Viewport = 'desktop' | 'mobile' | 'email' | 'full';
type ElementType = 'text' | 'image' | 'shape' | 'group';

interface EffectParam { key: string; label: string; type: 'slider' | 'color'; min?: number; max?: number; step?: number; unit?: string; defaultVal: number | string; }
interface EffectDef { id: string; name: string; icon: string; description: string; forTypes: ElementType[]; params: EffectParam[]; cssFilter?: (p: Record<string, any>) => string; cssStyle?: (p: Record<string, any>) => Record<string, string>; }
interface AppliedEffect { defId: string; enabled: boolean; params: Record<string, any>; }
interface SvgElement { uid: string; tagName: string; type: ElementType; label: string; effects: AppliedEffect[]; }
interface ContextMenu { x: number; y: number; uid: string; }
interface StudioState { scale: number; speedPct: number; bg: Background; viewport: Viewport; showGrid: boolean; }

const DEFAULT_STATE: StudioState = { scale: 100, speedPct: 100, bg: 'white', viewport: 'desktop', showGrid: false };

const BG_OPTIONS: { key: Background; label: string; bg: string }[] = [
  { key: 'white', label: 'Blanc',   bg: '#ffffff' },
  { key: 'dark',  label: 'Sombre',  bg: '#0d0d0d' },
  { key: 'email', label: 'Email',   bg: '#f4f4f5' },
  { key: 'slate', label: 'Ardoise', bg: '#1e293b' },
  { key: 'transparent', label: 'Transp.', bg: 'transparent' },
];
const VIEWPORT_W: Record<Viewport, number | null> = { desktop: 700, mobile: 375, email: 600, full: null };

// ── Catalogue d'effets ────────────────────────────────────────────────────────
const EFFECT_DEFS: EffectDef[] = [
  {
    id: 'glow', name: 'Halo lumineux', icon: '✨', description: 'Aura colorée autour de l\'élément',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [
      { key: 'intensity', label: 'Intensité', type: 'slider', min: 2, max: 40, step: 2, unit: 'px', defaultVal: 14 },
      { key: 'color', label: 'Couleur', type: 'color', defaultVal: '#00d4ff' },
    ],
    cssFilter: (p) => `drop-shadow(0 0 ${p.intensity}px ${p.color}) drop-shadow(0 0 ${Math.round(p.intensity * 1.5)}px ${p.color}55)`,
  },
  {
    id: 'opacity', name: 'Opacité', icon: '💧', description: 'Transparence de l\'élément',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Opacité', type: 'slider', min: 0, max: 100, step: 5, unit: '%', defaultVal: 70 }],
    cssStyle: (p) => ({ opacity: String(p.value / 100) }),
  },
  {
    id: 'blur', name: 'Flou artistique', icon: '🌫️', description: 'Effet de flou doux',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Intensité', type: 'slider', min: 0.5, max: 15, step: 0.5, unit: 'px', defaultVal: 3 }],
    cssFilter: (p) => `blur(${p.value}px)`,
  },
  {
    id: 'neon', name: 'Néon Cyber', icon: '⚡', description: 'Effet néon électrique',
    forTypes: ['text', 'shape'],
    params: [
      { key: 'intensity', label: 'Intensité', type: 'slider', min: 2, max: 25, step: 1, unit: 'px', defaultVal: 10 },
      { key: 'color', label: 'Couleur néon', type: 'color', defaultVal: '#00ff88' },
    ],
    cssFilter: (p) => `drop-shadow(0 0 ${p.intensity}px ${p.color}) drop-shadow(0 0 ${p.intensity * 2}px ${p.color}) drop-shadow(0 0 1px #fff)`,
  },
  {
    id: 'shadow', name: 'Ombre portée', icon: '🌒', description: 'Ombre sous l\'élément',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [
      { key: 'x', label: 'Décalage X', type: 'slider', min: -15, max: 15, step: 1, unit: 'px', defaultVal: 4 },
      { key: 'y', label: 'Décalage Y', type: 'slider', min: -15, max: 15, step: 1, unit: 'px', defaultVal: 6 },
      { key: 'blur', label: 'Flou', type: 'slider', min: 0, max: 25, step: 1, unit: 'px', defaultVal: 12 },
      { key: 'color', label: 'Couleur', type: 'color', defaultVal: '#000000' },
    ],
    cssFilter: (p) => `drop-shadow(${p.x}px ${p.y}px ${p.blur}px ${p.color}88)`,
  },
  {
    id: 'scale', name: 'Agrandissement', icon: '🔍', description: 'Taille de l\'élément',
    forTypes: ['text', 'image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Échelle', type: 'slider', min: 30, max: 250, step: 5, unit: '%', defaultVal: 120 }],
    cssStyle: (p) => ({ transform: `scale(${p.value / 100})`, transformOrigin: 'center center' }),
  },
  {
    id: 'brightness', name: 'Luminosité', icon: '🔆', description: 'Intensité lumineuse',
    forTypes: ['image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Luminosité', type: 'slider', min: 0, max: 300, step: 10, unit: '%', defaultVal: 150 }],
    cssFilter: (p) => `brightness(${p.value}%)`,
  },
  {
    id: 'saturate', name: 'Saturation', icon: '🎨', description: 'Intensité des couleurs',
    forTypes: ['image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Saturation', type: 'slider', min: 0, max: 400, step: 10, unit: '%', defaultVal: 200 }],
    cssFilter: (p) => `saturate(${p.value}%)`,
  },
  {
    id: 'hue', name: 'Teinte (Hue)', icon: '🌈', description: 'Rotation colorimétrique',
    forTypes: ['image', 'shape', 'group'],
    params: [{ key: 'value', label: 'Angle', type: 'slider', min: 0, max: 360, step: 5, unit: '°', defaultVal: 90 }],
    cssFilter: (p) => `hue-rotate(${p.value}deg)`,
  },
  {
    id: 'sepia', name: 'Sépia vintage', icon: '📷', description: 'Effet photo vintage',
    forTypes: ['image'],
    params: [{ key: 'value', label: 'Intensité', type: 'slider', min: 0, max: 100, step: 5, unit: '%', defaultVal: 80 }],
    cssFilter: (p) => `sepia(${p.value}%)`,
  },
];

// ── Détection du type d'élément ───────────────────────────────────────────────
function detectType(tagName: string): ElementType {
  if (['text', 'tspan', 'textpath'].includes(tagName)) return 'text';
  if (['image', 'use'].includes(tagName)) return 'image';
  if (['rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line'].includes(tagName)) return 'shape';
  return 'group';
}

// ── Label intelligent basé sur les attributs SVG ──────────────────────────────
function getSmartLabel(el: SVGElement, index: number): string {
  const tag = el.tagName.toLowerCase();
  const id = el.getAttribute('id') || '';
  const cls = el.getAttribute('class') || '';
  const text = el.textContent?.trim().slice(0, 24) || '';

  // Labels basés sur l'id ou la class
  const idLower = id.toLowerCase();
  const clsLower = cls.toLowerCase();
  if (idLower.includes('avatar') || clsLower.includes('avatar')) return '🧑 Avatar';
  if (idLower.includes('logo') || clsLower.includes('logo')) return '🏢 Logo';
  if (idLower.includes('name') || idLower.includes('nom') || clsLower.includes('name')) return `✍ Nom${text ? `: ${text}` : ''}`;
  if (idLower.includes('title') || idLower.includes('titre') || idLower.includes('poste')) return `💼 Titre${text ? `: ${text}` : ''}`;
  if (idLower.includes('email') || idLower.includes('mail')) return `📧 Email`;
  if (idLower.includes('phone') || idLower.includes('tel')) return `📞 Téléphone`;
  if (idLower.includes('site') || idLower.includes('url') || idLower.includes('web')) return `🌐 Site web`;
  if (idLower.includes('bg') || idLower.includes('background') || idLower.includes('fond')) return `🎨 Fond`;
  if (idLower.includes('cta') || idLower.includes('button') || idLower.includes('btn')) return `🔘 Bouton CTA`;
  if (idLower.includes('social') || idLower.includes('icon')) return `📱 Icônes sociales`;
  if (idLower.includes('separator') || idLower.includes('sep') || idLower.includes('divider')) return `➖ Séparateur`;
  if (id) return `${tag}#${id}`;

  // Labels par type
  if (tag === 'text' || tag === 'tspan') return text ? `T "${text}"` : `Texte #${index + 1}`;
  if (tag === 'image') return `🖼 Image #${index + 1}`;
  if (tag === 'circle') return `⭕ Cercle #${index + 1}`;
  if (tag === 'rect') return `▭ Rectangle #${index + 1}`;
  if (tag === 'path') return `〜 Forme #${index + 1}`;
  if (tag === 'g') return `📁 Groupe #${index + 1}`;
  return `${tag} #${index + 1}`;
}

// ── Construction des filtres CSS cumulés ──────────────────────────────────────
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

// ── Application des effets CSS directement sur le DOM SVG ────────────────────
// IMPORTANT: tspan n'accepte pas filter — on remonte au parent <text>
function getEffectTarget(el: SVGElement): SVGElement {
  const tag = el.tagName.toLowerCase();
  if (tag === 'tspan' || tag === 'textpath') {
    const parent = el.closest('text') as SVGElement | null;
    if (parent) return parent;
  }
  return el;
}

function applyEffectsToEl(el: SVGElement, effects: AppliedEffect[], isSelected: boolean) {
  const target = getEffectTarget(el);
  const filterStr = buildFilter(effects);
  const styleObj = buildStyle(effects);

  target.style.filter = filterStr || '';
  for (const [k, v] of Object.entries(styleObj)) {
    (target.style as any)[k] = v;
  }

  // Highlight de sélection en plus des effets
  if (isSelected) {
    const existingFilter = target.style.filter;
    const highlight = 'drop-shadow(0 0 3px rgba(0,212,255,0.9)) drop-shadow(0 0 6px rgba(0,212,255,0.5))';
    target.style.filter = existingFilter ? `${existingFilter} ${highlight}` : highlight;
    target.style.outline = '1px dashed rgba(0,212,255,0.6)';
    target.style.outlineOffset = '2px';
  } else {
    target.style.outline = '';
    target.style.outlineOffset = '';
  }
}

// ── Détection des éléments SVG significatifs ──────────────────────────────────
function scanMeaningfulElements(svgEl: SVGElement): SVGElement[] {
  const SKIP_TAGS = new Set(['defs', 'style', 'title', 'desc', 'metadata', 'animatetransform', 'animate', 'set', 'mpath', 'filter', 'lineargradient', 'radialgradient', 'mask', 'clippath', 'symbol', 'marker']);
  const MEANING_TAGS = new Set(['g', 'text', 'image', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'use', 'tspan']);

  const result: SVGElement[] = [];

  // Niveau 1 : enfants directs du SVG (filtrés)
  const directChildren = Array.from(svgEl.children) as SVGElement[];
  directChildren.forEach(child => {
    const tag = child.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return;
    if (MEANING_TAGS.has(tag)) result.push(child);
  });

  // Si on a beaucoup de groupes, garder uniquement les groupes (plus lisible)
  const groups = result.filter(el => el.tagName.toLowerCase() === 'g');
  if (groups.length >= 3) return groups; // Structure groupée : parfait

  // Sinon aller un niveau plus profond dans les groupes existants
  const expanded: SVGElement[] = [];
  result.forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'g') {
      const children = Array.from(el.children) as SVGElement[];
      children.forEach(c => {
        const cTag = c.tagName.toLowerCase();
        if (!SKIP_TAGS.has(cTag) && MEANING_TAGS.has(cTag)) expanded.push(c);
      });
    } else {
      expanded.push(el);
    }
  });

  // Dédupliquer les textes identiques (garder premier de chaque contenu unique)
  const seen = new Set<string>();
  return expanded.filter(el => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'text' || tag === 'tspan') {
      const content = el.textContent?.trim() || '';
      const key = `${tag}:${content}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  }).slice(0, 25); // Max 25 éléments
}

// ── Export PNG ────────────────────────────────────────────────────────────────
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
        a.download = 'signature.png';
        a.click();
        resolve();
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

// ══ PANNEAU CONTEXTUEL ═══════════════════════════════════════════════════════
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
      className="fixed z-50 bg-[#0e1117]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl w-72 overflow-hidden"
      style={{ left: Math.min(ctx.x + 8, window.innerWidth - 300), top: Math.min(ctx.y, window.innerHeight - 420) }}
      onContextMenu={e => e.preventDefault()}
    >
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/8 bg-gradient-to-r from-forge-cyan/5 to-violet-500/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-forge-cyan/20 flex items-center justify-center">
            {el.type === 'text' && <Type className="w-3 h-3 text-forge-cyan" />}
            {el.type === 'image' && <Image className="w-3 h-3 text-amber-400" />}
            {el.type === 'shape' && <Square className="w-3 h-3 text-violet-400" />}
            {el.type === 'group' && <Layers className="w-3 h-3 text-green-400" />}
          </div>
          <span className="text-white text-xs font-semibold truncate max-w-[160px]">{el.label}</span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-80">
        {availableEffects.map(def => {
          const applied = el.effects.find(e => e.defId === def.id);
          const isEnabled = applied?.enabled ?? false;
          const isExpanded = expandedEff === def.id;

          return (
            <div key={def.id} className={`border-b border-white/5 last:border-0 transition-colors ${isEnabled ? 'bg-forge-cyan/4' : ''}`}>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                <span className="text-base w-5 flex-shrink-0">{def.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white/85">{def.name}</p>
                  <p className="text-[9px] text-white/30">{def.description}</p>
                </div>
                <button
                  onClick={() => onToggleEffect(ctx.uid, def.id)}
                  className={`relative flex items-center w-9 h-5 rounded-full transition-all flex-shrink-0 ${isEnabled ? 'bg-forge-cyan' : 'bg-white/15'}`}
                >
                  <span className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200 ${isEnabled ? 'left-4' : 'left-1'}`} />
                </button>
                {def.params.length > 0 && isEnabled && (
                  <button onClick={() => setExpandedEff(isExpanded ? null : def.id)} className="text-white/30 hover:text-white/70 transition-colors">
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isEnabled && isExpanded && applied && (
                <div className="px-3.5 pb-3 space-y-2.5 bg-black/20 border-t border-white/5">
                  {def.params.map(param => (
                    <div key={param.key} className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">{param.label}</span>
                        {param.type === 'slider' && <span className="text-forge-cyan font-mono">{applied.params[param.key]}{param.unit}</span>}
                      </div>
                      {param.type === 'slider' ? (
                        <Slider value={[Number(applied.params[param.key] ?? param.defaultVal)]} onValueChange={([v]) => onSetParam(ctx.uid, def.id, param.key, v)} min={param.min!} max={param.max!} step={param.step!} className="w-full" />
                      ) : (
                        <input type="color" value={String(applied.params[param.key] ?? param.defaultVal)} onChange={e => onSetParam(ctx.uid, def.id, param.key, e.target.value)} className="w-full h-7 rounded-lg border border-white/20 bg-transparent cursor-pointer" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3.5 py-2 border-t border-white/8 bg-white/2 text-center">
        <p className="text-[9px] text-white/20">Clic droit sur un élément SVG → ce menu</p>
      </div>
    </div>
  );
}

// ══ COMPOSANT PRINCIPAL ═══════════════════════════════════════════════════════
export default function Preview() {
  const { toast } = useToast();
  const [sourceSvg, setSourceSvg] = useState('');
  const [state, setState] = useState<StudioState>(DEFAULT_STATE);
  const [history, setHistory] = useState<StudioState[]>([DEFAULT_STATE]);
  const [histIdx, setHistIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'move'>('select');

  // Éléments SVG interactifs
  const [svgEls, setSvgEls] = useState<SvgElement[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  // DOM refs — On gère manuellement l'innerHTML pour préserver les DOM refs
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragTargetTagRef = useRef<string>('');
  const dragStartRef = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  // Map UID → DOM element (actualisée après chaque rescan)
  const domMapRef = useRef<Map<string, SVGElement>>(new Map());

  // ── Charger SVG depuis localStorage ──────────────────────────────────────
  useEffect(() => {
    const svg = localStorage.getItem('reality_preview_svg') || '';
    setSourceSvg(svg);
  }, []);

  // ── Calculer le SVG processé ──────────────────────────────────────────────
  const processedSvg = (() => {
    if (!sourceSvg) return '';
    let result = sourceSvg;
    if (isPaused) {
      result = result
        .replace(/animation-play-state:[^;"}]+/g, 'animation-play-state:paused')
        .replace(/<animateTransform/g, '<animateTransform begin="indefinite"');
    }
    if (state.speedPct !== 100) {
      const f = 100 / state.speedPct;
      result = result
        .replace(/animation-duration:\s*([\d.]+)s/g, (_, d) => `animation-duration:${(parseFloat(d) * f).toFixed(2)}s`)
        .replace(/dur="([\d.]+)s"/g, (_, d) => `dur="${(parseFloat(d) * f).toFixed(2)}s"`)
        .replace(/dur="([\d.]+)"/g, (_, d) => `dur="${(parseFloat(d) * f).toFixed(2)}"`);
    }
    return result;
  })();

  // ── Mise à jour innerHTML manuelle (préserve les refs DOM) ────────────────
  // On utilise useEffect pour injecter le SVG une seule fois par changement,
  // puis on re-scanne les éléments et on RE-APPLIQUE tous les effets existants.
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container || !processedSvg) return;

    container.innerHTML = processedSvg;

    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    // Curseur
    svgEl.style.cursor = tool === 'move' ? 'grab' : 'default';
    svgEl.style.display = 'block';
    svgEl.style.maxWidth = '100%';

    // Scanner les éléments significatifs
    const foundEls = scanMeaningfulElements(svgEl as SVGElement);
    const newDomMap = new Map<string, SVGElement>();

    setSvgEls(prev => {
      const mapped: SvgElement[] = foundEls.map((el, i) => {
        const uid = `el-${i}-${el.tagName.toLowerCase()}`;
        el.dataset.uid = uid;
        el.style.cursor = 'pointer';
        newDomMap.set(uid, el);

        // Retrouver les effets existants pour cet uid
        const prevEl = prev.find(p => p.uid === uid);
        const effects = prevEl?.effects || [];

        // Re-appliquer les effets après re-render SVG
        if (effects.some(e => e.enabled)) {
          applyEffectsToEl(el, effects, uid === selectedUid);
        }

        return {
          uid,
          tagName: el.tagName.toLowerCase(),
          type: detectType(el.tagName.toLowerCase()),
          label: getSmartLabel(el, i),
          effects,
        };
      });

      domMapRef.current = newDomMap;
      return mapped;
    });
  }, [processedSvg, tool]);

  // ── History ───────────────────────────────────────────────────────────────
  const pushHistory = useCallback((next: StudioState) => {
    setHistory(h => [...h.slice(0, histIdx + 1), next]);
    setHistIdx(i => i + 1);
    setState(next);
  }, [histIdx]);
  const undo = () => { if (histIdx <= 0) return; setHistIdx(i => i - 1); setState(history[histIdx - 1]); };
  const redo = () => { if (histIdx >= history.length - 1) return; setHistIdx(i => i + 1); setState(history[histIdx + 1]); };
  const update = (patch: Partial<StudioState>) => pushHistory({ ...state, ...patch });

  // ── Handlers pointer events sur le SVG ───────────────────────────────────
  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const uid = target.dataset?.uid || (target.closest('[data-uid]') as SVGElement | null)?.dataset?.uid;
    setContextMenu(null);
    if (!uid) { setSelectedUid(null); return; }
    setSelectedUid(uid);

    // Refresh visuel de la sélection
    setSvgEls(prev => {
      prev.forEach(el => {
        const domEl = domMapRef.current.get(el.uid);
        if (domEl) applyEffectsToEl(domEl, el.effects, el.uid === uid);
      });
      return prev;
    });
  }, []);

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

    const domEl = domMapRef.current.get(uid);
    if (!domEl) return;

    isDraggingRef.current = true;
    dragTargetTagRef.current = uid;
    const transform = domEl.getAttribute('transform') || '';
    const match = transform.match(/translate\(([-\d.]+)[,\s]+([-\d.]+)\)/);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;
    dragStartRef.current = { mx: e.clientX, my: e.clientY, tx, ty };
    e.preventDefault();
  }, [tool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const uid = dragTargetTagRef.current;
    const domEl = domMapRef.current.get(uid);
    if (!domEl) return;
    const dx = e.clientX - dragStartRef.current.mx;
    const dy = e.clientY - dragStartRef.current.my;
    domEl.setAttribute('transform', `translate(${dragStartRef.current.tx + dx}, ${dragStartRef.current.ty + dy})`);
  }, []);

  const handleMouseUp = useCallback(() => { isDraggingRef.current = false; dragStartRef.current = null; }, []);

  // ── Toggle / paramètre d'effet ────────────────────────────────────────────
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

      const domEl = domMapRef.current.get(uid);
      if (domEl) applyEffectsToEl(domEl, newEffects, uid === selectedUid);
      return { ...el, effects: newEffects };
    }));
  }, [selectedUid]);

  const handleSetParam = useCallback((uid: string, defId: string, paramKey: string, value: any) => {
    setSvgEls(prev => prev.map(el => {
      if (el.uid !== uid) return el;
      const newEffects = el.effects.map(e =>
        e.defId === defId ? { ...e, params: { ...e.params, [paramKey]: value } } : e
      );
      const domEl = domMapRef.current.get(uid);
      if (domEl) applyEffectsToEl(domEl, newEffects, uid === selectedUid);
      return { ...el, effects: newEffects };
    }));
  }, [selectedUid]);

  // ── Exports ───────────────────────────────────────────────────────────────
  const downloadSvg = () => {
    const blob = new Blob([sourceSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'signature.svg'; a.click(); URL.revokeObjectURL(url);
    setExported('svg'); toast({ title: '✅ SVG téléchargé !' });
  };
  const downloadPng = async () => {
    try { await exportAsPng(sourceSvg, state.scale); setExported('png'); toast({ title: '✅ PNG exporté !' }); }
    catch (e: any) { toast({ title: 'Erreur PNG', description: e.message, variant: 'destructive' }); }
  };
  const copyHtml = () => {
    const html = `<table cellpadding="0" cellspacing="0" border="0"><tr><td>${sourceSvg.trim()}</td></tr></table>`;
    navigator.clipboard.writeText(html).then(() => { setExported('html'); toast({ title: '✅ HTML email copié !' }); });
  };

  const hasSvg = Boolean(sourceSvg);
  const vw = VIEWPORT_W[state.viewport];
  const selectedEl = svgEls.find(e => e.uid === selectedUid);
  const activeEffectsCount = selectedEl ? selectedEl.effects.filter(e => e.enabled).length : 0;

  return (
    <div className="flex flex-col h-screen bg-[#080b10] text-white overflow-hidden" onClick={() => setContextMenu(null)}>

      {/* ── BARRE DU HAUT ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 bg-[#0a0d14] flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/studio">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white gap-1.5 h-8 text-xs" data-testid="button-back-studio">
              <ArrowLeft className="w-3.5 h-3.5" /> Studio
            </Button>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-forge-cyan animate-pulse" />
            <span className="text-forge-cyan text-sm font-bold tracking-widest hidden sm:block">REALITY STUDIO</span>
            <Badge className="bg-violet-600/30 border-violet-500/40 text-violet-300 text-[10px] px-1.5">GOD</Badge>
          </div>
        </div>

        {/* Outils centraux */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setTool('select')} data-testid="button-tool-select"
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] font-medium border transition-all ${tool === 'select' ? 'bg-forge-cyan/15 text-forge-cyan border-forge-cyan/30' : 'text-white/40 border-white/8 hover:text-white hover:border-white/20'}`}>
            <MousePointer2 className="w-3 h-3" /> Sélect.
          </button>
          <button onClick={() => setTool('move')} data-testid="button-tool-move"
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] font-medium border transition-all ${tool === 'move' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-white/40 border-white/8 hover:text-white hover:border-white/20'}`}>
            <Move className="w-3 h-3" /> Déplacer
          </button>
          <div className="h-4 w-px bg-white/10" />
          <Button variant="ghost" size="sm" onClick={undo} disabled={histIdx <= 0} className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-20"><Undo2 className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={histIdx >= history.length - 1} className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-20"><Redo2 className="w-3.5 h-3.5" /></Button>
          <div className="h-4 w-px bg-white/10" />
          <button onClick={() => update({ showGrid: !state.showGrid })} data-testid="button-grid"
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] border transition-all ${state.showGrid ? 'bg-forge-cyan/10 text-forge-cyan border-forge-cyan/30' : 'text-white/40 border-white/8 hover:text-white hover:border-white/20'}`}>
            <Grid3X3 className="w-3 h-3" /> Grille
          </button>
          <button onClick={() => setIsPaused(p => !p)} data-testid="button-pause"
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[11px] border transition-all ${isPaused ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'text-white/40 border-white/8 hover:text-white hover:border-white/20'}`}>
            <Film className="w-3 h-3" /> {isPaused ? 'Play' : 'Pause'}
          </button>
        </div>

        <Button onClick={downloadSvg} size="sm" className="h-7 px-3 bg-gradient-to-r from-forge-cyan to-violet-600 text-white text-xs font-semibold gap-1.5 flex-shrink-0" data-testid="button-quick-export">
          <Download className="w-3.5 h-3.5" /> Exporter SVG
        </Button>
      </div>

      {!hasSvg ? (
        <div className="flex flex-col items-center justify-center flex-1 space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/3 border border-white/10 flex items-center justify-center">
            <Eye className="w-8 h-8 text-white/15" />
          </div>
          <p className="text-white/30 text-center text-sm max-w-xs">
            Aucune signature dans le Reality Studio.<br />
            <Link href="/studio"><span className="text-forge-cyan underline cursor-pointer">Générez-en une depuis le Studio →</span></Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* ── PANNEAU GAUCHE ─────────────────────────────────────────────── */}
          <div className="w-44 flex-shrink-0 border-r border-white/8 bg-[#0a0d14] overflow-y-auto p-2 space-y-2">

            <section className="rounded-xl border border-white/8 bg-white/2 p-2.5 space-y-1.5">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">Fond</p>
              {BG_OPTIONS.map(({ key, label, bg }) => (
                <button key={key} onClick={() => update({ bg: key })} data-testid={`button-bg-${key}`}
                  className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-[11px] transition-all ${state.bg === key ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/8' : 'border-white/6 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
                  <div className="w-4 h-4 rounded border border-white/15 flex-shrink-0" style={{ background: bg === 'transparent' ? 'repeating-conic-gradient(#555 0% 25%, #222 0% 50%) 0 0 / 6px 6px' : bg }} />
                  {label}
                </button>
              ))}
            </section>

            <section className="rounded-xl border border-white/8 bg-white/2 p-2.5 space-y-1">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">Contexte</p>
              {([['desktop', Monitor, 'Bureau'], ['mobile', Smartphone, 'Mobile'], ['email', Mail, 'Email'], ['full', Maximize2, 'Plein']] as [Viewport, any, string][]).map(([v, Icon, label]) => (
                <button key={v} onClick={() => update({ viewport: v })} data-testid={`button-vp-${v}`}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[11px] transition-all ${state.viewport === v ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/8' : 'border-white/6 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
                  <Icon className="w-3 h-3 flex-shrink-0" /> {label}
                </button>
              ))}
            </section>

            <section className="rounded-xl border border-white/8 bg-white/2 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Zoom</p>
                <span className="text-forge-cyan text-[11px] font-mono">{state.scale}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => update({ scale: Math.max(20, state.scale - 10) })} className="h-6 w-6 p-0 text-white/30 hover:text-white"><ZoomOut className="w-3 h-3" /></Button>
                <Slider value={[state.scale]} onValueChange={([v]) => update({ scale: v })} min={20} max={200} step={5} className="flex-1" data-testid="slider-zoom" />
                <Button variant="ghost" size="sm" onClick={() => update({ scale: Math.min(200, state.scale + 10) })} className="h-6 w-6 p-0 text-white/30 hover:text-white"><ZoomIn className="w-3 h-3" /></Button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[50, 100, 150].map(v => (
                  <button key={v} onClick={() => update({ scale: v })}
                    className={`text-[10px] py-0.5 rounded border transition-all ${state.scale === v ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/8' : 'border-white/8 text-white/25 hover:border-white/25'}`}>{v}%</button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-white/8 bg-white/2 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Vitesse</p>
                <span className="text-violet-300 text-[11px] font-mono">{state.speedPct}%</span>
              </div>
              <Slider value={[state.speedPct]} onValueChange={([v]) => update({ speedPct: v })} min={10} max={300} step={10} className="w-full" data-testid="slider-speed" />
              <div className="grid grid-cols-3 gap-1">
                {[50, 100, 200].map(v => (
                  <button key={v} onClick={() => update({ speedPct: v })}
                    className={`text-[10px] py-0.5 rounded border transition-all ${state.speedPct === v ? 'border-violet-500 text-violet-300 bg-violet-500/8' : 'border-white/8 text-white/25 hover:border-white/25'}`}>{v}%</button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-blue-500/15 bg-blue-500/4 p-2.5">
              <p className="text-[9px] font-bold text-blue-300/50 uppercase tracking-widest flex items-center gap-1 mb-2"><Info className="w-3 h-3" /> Aide</p>
              <p className="text-[10px] text-white/30 leading-relaxed">
                <span className="text-forge-cyan">Clic gauche</span> — sélect.<br />
                <span className="text-amber-400">Clic droit</span> — effets<br />
                <span className="text-green-400">Outil déplacer</span> — glisser
              </p>
            </section>
          </div>

          {/* ── CANVAS CENTRAL ─────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-auto relative" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 bg-[#0a0d14] flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {vw && <Badge variant="outline" className="border-white/12 text-white/30 text-[10px] h-5">{vw}px</Badge>}
                {svgEls.length > 0 && <Badge variant="outline" className="border-white/12 text-white/30 text-[10px] h-5">{svgEls.length} calques</Badge>}
                {selectedEl && (
                  <Badge variant="outline" className="border-forge-cyan/40 text-forge-cyan text-[10px] h-5">
                    ✦ {selectedEl.label.slice(0, 20)} {activeEffectsCount > 0 ? `(${activeEffectsCount} effet${activeEffectsCount > 1 ? 's' : ''})` : ''}
                  </Badge>
                )}
                {isPaused && <Badge variant="outline" className="border-amber-400/40 text-amber-400 text-[10px] h-5">⏸ Pause</Badge>}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/20 text-[10px]">LIVE</span>
              </div>
            </div>

            {/* Zone de prévisualisation */}
            <div className="flex-1 flex items-start justify-center p-8 overflow-auto"
              style={{ background: 'radial-gradient(ellipse at center, #0d1117 0%, #080b10 100%)' }}>
              <div className="relative rounded-xl overflow-visible shadow-2xl transition-all duration-300"
                style={{
                  width: vw ? Math.min(vw, 900) : '100%',
                  maxWidth: '100%',
                  background: BG_OPTIONS.find(b => b.key === state.bg)?.bg || '#fff',
                  transform: `scale(${state.scale / 100})`,
                  transformOrigin: 'top center',
                  border: state.bg === 'transparent' ? '1px dashed rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                  cursor: tool === 'move' ? 'grab' : 'default',
                }}
                data-testid="signature-preview-canvas">
                {/* Grille */}
                {state.showGrid && (
                  <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                )}
                <div
                  ref={svgContainerRef}
                  onClick={handleSvgClick}
                  onContextMenu={handleSvgContextMenu}
                  onMouseDown={handleMouseDown}
                  style={{ display: 'block', lineHeight: 0, userSelect: 'none' }}
                />
              </div>
            </div>

            {/* Barre d'actions export */}
            <div className="flex gap-2 px-4 py-3 border-t border-white/8 bg-[#0a0d14] flex-shrink-0">
              <Button onClick={downloadSvg} className="flex-1 h-9 bg-gradient-to-r from-forge-cyan to-violet-600 text-white font-semibold text-sm rounded-xl hover:opacity-90 gap-2" data-testid="button-export-svg-final">
                {exported === 'svg' ? <><Check className="w-4 h-4" /> Exporté !</> : <><Download className="w-4 h-4" /> Exporter SVG</>}
              </Button>
              <Button onClick={downloadPng} className="h-9 px-4 bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-sm font-semibold rounded-xl gap-1.5" data-testid="button-export-png">
                <Download className="w-3.5 h-3.5" /> PNG
              </Button>
              <Button onClick={copyHtml} className="h-9 px-4 bg-green-500/10 border border-green-500/35 text-green-300 hover:bg-green-500/20 text-sm font-semibold rounded-xl gap-1.5" data-testid="button-copy-html">
                {exported === 'html' ? <><Check className="w-3.5 h-3.5" /> Copié !</> : <><Copy className="w-3.5 h-3.5" /> HTML email</>}
              </Button>
            </div>
          </div>

          {/* ── PANNEAU DROIT — Calques & Effets ──────────────────────────── */}
          <div className="w-60 flex-shrink-0 border-l border-white/8 bg-[#0a0d14] flex flex-col overflow-hidden">

            {/* Header calques */}
            <div className="px-3 py-2.5 border-b border-white/8 bg-gradient-to-r from-white/2 to-transparent">
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-forge-cyan" /> Calques ({svgEls.length})
              </p>
            </div>

            {/* Liste des calques */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {svgEls.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-white/4 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white/20" />
                  </div>
                  <p className="text-white/20 text-[10px] text-center">Chargement…</p>
                </div>
              )}
              {svgEls.map(el => {
                const isSelected = el.uid === selectedUid;
                const enabledCount = el.effects.filter(e => e.enabled).length;
                const typeColor = { text: 'text-forge-cyan', image: 'text-amber-400', shape: 'text-violet-400', group: 'text-green-400' }[el.type];

                return (
                  <div
                    key={el.uid}
                    onClick={() => {
                      setSelectedUid(el.uid);
                      setSvgEls(prev => {
                        prev.forEach(e => {
                          const domEl = domMapRef.current.get(e.uid);
                          if (domEl) applyEffectsToEl(domEl, e.effects, e.uid === el.uid);
                        });
                        return prev;
                      });
                    }}
                    onContextMenu={e => { e.preventDefault(); setSelectedUid(el.uid); setContextMenu({ x: e.clientX, y: e.clientY, uid: el.uid }); }}
                    data-testid={`element-layer-${el.uid}`}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all group ${isSelected ? 'border-forge-cyan/40 bg-forge-cyan/6 text-forge-cyan' : 'border-transparent text-white/45 hover:border-white/12 hover:bg-white/3 hover:text-white/70'}`}
                  >
                    {el.type === 'text' && <Type className={`w-3.5 h-3.5 flex-shrink-0 ${typeColor}`} />}
                    {el.type === 'image' && <Image className={`w-3.5 h-3.5 flex-shrink-0 ${typeColor}`} />}
                    {el.type === 'shape' && <Square className={`w-3.5 h-3.5 flex-shrink-0 ${typeColor}`} />}
                    {el.type === 'group' && <Layers className={`w-3.5 h-3.5 flex-shrink-0 ${typeColor}`} />}
                    <span className="text-[11px] flex-1 truncate font-medium">{el.label}</span>
                    {enabledCount > 0 && (
                      <Badge className="text-[9px] px-1 py-0 h-4 min-w-[16px] bg-forge-cyan/20 border-forge-cyan/30 text-forge-cyan flex-shrink-0 justify-center">
                        {enabledCount}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Panel effets de l'élément sélectionné */}
            {selectedEl ? (
              <div className="border-t border-white/8 bg-gradient-to-b from-white/3 to-white/1">
                <div className="px-3 py-2 border-b border-white/6">
                  <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-violet-400" /> Effets
                    <Badge className="ml-auto text-[9px] px-1.5 py-0 h-4 bg-white/8 border-white/10 text-white/40 capitalize">{selectedEl.type}</Badge>
                  </p>
                </div>
                <div className="p-2 space-y-1 max-h-52 overflow-y-auto">
                  {EFFECT_DEFS.filter(d => d.forTypes.includes(selectedEl.type)).map(def => {
                    const applied = selectedEl.effects.find(e => e.defId === def.id);
                    const enabled = applied?.enabled ?? false;
                    return (
                      <div key={def.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${enabled ? 'bg-forge-cyan/6 border border-forge-cyan/20' : 'hover:bg-white/3 border border-transparent'}`}>
                        <span className="text-sm w-5 flex-shrink-0">{def.icon}</span>
                        <span className="text-[11px] text-white/60 flex-1 truncate">{def.name}</span>
                        <button
                          onClick={() => handleToggleEffect(selectedEl.uid, def.id)}
                          data-testid={`panel-toggle-${def.id}`}
                          className={`relative flex items-center w-9 h-5 rounded-full transition-all flex-shrink-0 ${enabled ? 'bg-forge-cyan' : 'bg-white/12 hover:bg-white/20'}`}
                        >
                          <span className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200 ${enabled ? 'left-4' : 'left-1'}`} />
                        </button>
                      </div>
                    );
                  })}
                  <p className="text-[9px] text-white/18 text-center pt-1">Clic droit → réglages détaillés</p>
                </div>
              </div>
            ) : (
              <div className="border-t border-white/8 p-4 text-center">
                <Sparkles className="w-5 h-5 text-white/15 mx-auto mb-2" />
                <p className="text-[10px] text-white/20">Sélectionnez un calque<br />pour voir ses effets</p>
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