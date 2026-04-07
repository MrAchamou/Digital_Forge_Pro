import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, Download, ArrowLeft, Monitor, Smartphone, Mail, Sun, Moon,
  Maximize2, RefreshCw, Check, FlipHorizontal, FlipVertical, RotateCw,
  Code2, Palette, Sliders, Share2, Undo2, Redo2, Grid3X3, ZoomIn, ZoomOut,
  Copy, Film, Layers, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SignatureMeta { nom: string; titre: string; entreprise: string; signature_id: string; email: string; telephone: string; }
type Background = 'white' | 'dark' | 'email' | 'slate' | 'transparent';
type Viewport = 'desktop' | 'mobile' | 'email' | 'full';

interface StudioState {
  scale: number;
  speedPct: number;
  bg: Background;
  viewport: Viewport;
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  glowIntensity: number;
  glowColor: string;
  blur: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
  rotation: number;
  showGrid: boolean;
  svgOverride: string;
}

const DEFAULT_STATE: StudioState = {
  scale: 100, speedPct: 100, bg: 'white', viewport: 'desktop',
  brightness: 100, contrast: 100, saturate: 100, hueRotate: 0,
  glowIntensity: 0, glowColor: '#00d4ff', blur: 0, opacity: 100,
  flipH: false, flipV: false, rotation: 0,
  showGrid: false, svgOverride: '',
};

const BG_OPTIONS: { key: Background; label: string; bg: string; icon: any }[] = [
  { key: 'white', label: 'Blanc', bg: '#ffffff', icon: Sun },
  { key: 'dark', label: 'Sombre', bg: '#0d0d0d', icon: Moon },
  { key: 'email', label: 'Email', bg: '#f4f4f5', icon: Mail },
  { key: 'slate', label: 'Ardoise', bg: '#1e293b', icon: Layers },
  { key: 'transparent', label: 'Transp.', bg: 'transparent', icon: Maximize2 },
];

const VIEWPORT_W: Record<Viewport, number | null> = {
  desktop: 700, mobile: 375, email: 600, full: null,
};

// ── Extract SVG colors ─────────────────────────────────────────────────────────
function extractColors(svg: string): string[] {
  const matches = svg.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)/g) || [];
  const unique = [...new Set(matches)].filter(c => c !== '#000000' && c !== '#ffffff' && c !== '#000' && c !== '#fff');
  return unique.slice(0, 12);
}

function replaceColorInSvg(svg: string, from: string, to: string): string {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return svg.replace(new RegExp(escaped, 'gi'), to);
}

// ── PNG export via canvas ──────────────────────────────────────────────────────
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

function generateHtmlEmbed(svgStr: string, meta: SignatureMeta | null): string {
  return `<!-- Signature Email God Tier${meta?.nom ? ` — ${meta.nom}` : ''} -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="padding:0;">
      ${svgStr.trim()}
    </td>
  </tr>
</table>`;
}

// ══ COMPOSANT PRINCIPAL ══════════════════════════════════════════════════════
export default function Preview() {
  const { toast } = useToast();
  const [sourceSvg, setSourceSvg] = useState('');
  const [meta, setMeta] = useState<SignatureMeta | null>(null);
  const [state, setState] = useState<StudioState>(DEFAULT_STATE);
  const [history, setHistory] = useState<StudioState[]>([DEFAULT_STATE]);
  const [histIdx, setHistIdx] = useState(0);
  const [svgColors, setSvgColors] = useState<string[]>([]);
  const [colorFrom, setColorFrom] = useState('');
  const [colorTo, setColorTo] = useState('#00d4ff');
  const [codeOpen, setCodeOpen] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [exported, setExported] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const canvasStageRef = useRef<HTMLDivElement>(null);

  // Charger SVG depuis localStorage
  useEffect(() => {
    const svg = localStorage.getItem('reality_preview_svg') || '';
    const rawMeta = localStorage.getItem('reality_preview_meta');
    setSourceSvg(svg);
    setEditedCode(svg);
    if (rawMeta) { try { setMeta(JSON.parse(rawMeta)); } catch { /* noop */ } }
    if (svg) setSvgColors(extractColors(svg));
  }, []);

  // ── History management ────────────────────────────────────────────────────
  const pushHistory = useCallback((next: StudioState) => {
    setHistory(h => [...h.slice(0, histIdx + 1), next]);
    setHistIdx(i => i + 1);
    setState(next);
  }, [histIdx]);

  const undo = () => {
    if (histIdx <= 0) return;
    const prev = history[histIdx - 1];
    setHistIdx(i => i - 1);
    setState(prev);
  };
  const redo = () => {
    if (histIdx >= history.length - 1) return;
    const next = history[histIdx + 1];
    setHistIdx(i => i + 1);
    setState(next);
  };

  const update = (patch: Partial<StudioState>) => pushHistory({ ...state, ...patch });
  const reset = () => pushHistory(DEFAULT_STATE);

  // ── SVG actif (source ou override) ───────────────────────────────────────
  const activeSvg = state.svgOverride || sourceSvg;

  // ── Appliquer la vitesse d'animation ─────────────────────────────────────
  const processedSvg = (() => {
    if (!activeSvg) return '';
    if (isPaused) {
      let s = activeSvg;
      s = s.replace(/animation-play-state:[^;"}]+/g, 'animation-play-state:paused');
      s = s.replace(/<animateTransform/g, '<animateTransform begin="indefinite"');
      return s;
    }
    if (state.speedPct === 100) return activeSvg;
    const f = 100 / state.speedPct;
    let s = activeSvg;
    s = s.replace(/animation-duration:\s*([\d.]+)s/g, (_, d) => `animation-duration:${(parseFloat(d) * f).toFixed(2)}s`);
    s = s.replace(/dur="([\d.]+)s"/g, (_, d) => `dur="${(parseFloat(d) * f).toFixed(2)}s"`);
    s = s.replace(/dur="([\d.]+)"/g, (_, d) => `dur="${(parseFloat(d) * f).toFixed(2)}"`);
    return s;
  })();

  // ── Filtre CSS ────────────────────────────────────────────────────────────
  const cssFilter = [
    state.brightness !== 100 ? `brightness(${state.brightness}%)` : '',
    state.contrast !== 100 ? `contrast(${state.contrast}%)` : '',
    state.saturate !== 100 ? `saturate(${state.saturate}%)` : '',
    state.hueRotate !== 0 ? `hue-rotate(${state.hueRotate}deg)` : '',
    state.blur > 0 ? `blur(${state.blur}px)` : '',
    state.glowIntensity > 0 ? `drop-shadow(0 0 ${state.glowIntensity * 2}px ${state.glowColor}) drop-shadow(0 0 ${state.glowIntensity}px ${state.glowColor})` : '',
  ].filter(Boolean).join(' ');

  const svgTransform = [
    state.flipH ? 'scaleX(-1)' : '',
    state.flipV ? 'scaleY(-1)' : '',
    state.rotation !== 0 ? `rotate(${state.rotation}deg)` : '',
  ].filter(Boolean).join(' ');

  // ── Remplacement couleur ──────────────────────────────────────────────────
  const applyColorSwap = () => {
    if (!colorFrom) return;
    const newSvg = replaceColorInSvg(activeSvg, colorFrom, colorTo);
    update({ svgOverride: newSvg });
    setSvgColors(extractColors(newSvg));
    toast({ title: 'Couleur remplacée', description: `${colorFrom} → ${colorTo}` });
  };

  const applyCodeEdit = () => {
    update({ svgOverride: editedCode });
    setSvgColors(extractColors(editedCode));
    toast({ title: '✅ SVG mis à jour', description: 'Modifications du code appliquées' });
  };

  // ── Exports ───────────────────────────────────────────────────────────────
  const downloadSvg = () => {
    const blob = new Blob([activeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signature_god_tier_${meta?.signature_id || 'export'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setExported('svg');
    toast({ title: '✅ SVG téléchargé !' });
  };

  const downloadPng = async () => {
    try {
      await exportAsPng(activeSvg, state.scale);
      setExported('png');
      toast({ title: '✅ PNG exporté !' });
    } catch (e: any) {
      toast({ title: 'Erreur PNG', description: e.message, variant: 'destructive' });
    }
  };

  const copyHtml = () => {
    const html = generateHtmlEmbed(activeSvg, meta);
    navigator.clipboard.writeText(html).then(() => {
      setExported('html');
      toast({ title: '✅ HTML copié !', description: 'Collez dans votre client email' });
    });
  };

  const copySvgCode = () => {
    navigator.clipboard.writeText(activeSvg).then(() =>
      toast({ title: '✅ Code SVG copié !' })
    );
  };

  const hasSvg = Boolean(activeSvg);
  const vw = VIEWPORT_W[state.viewport];
  const canUndo = histIdx > 0;
  const canRedo = histIdx < history.length - 1;

  // ── Slider helper ─────────────────────────────────────────────────────────
  const FilterSlider = ({ label, stateKey, min, max, step, unit = '', color = 'text-forge-cyan' }: {
    label: string; stateKey: keyof StudioState; min: number; max: number; step: number; unit?: string; color?: string;
  }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-white/40">{label}</span>
        <span className={color}>{state[stateKey] as number}{unit}</span>
      </div>
      <Slider
        value={[state[stateKey] as number]}
        onValueChange={([v]) => update({ [stateKey]: v } as Partial<StudioState>)}
        min={min} max={max} step={step} className="w-full"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-screen space-y-3">
      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 py-0.5">
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

        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-20" data-testid="button-undo">
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-7 w-7 p-0 text-white/40 hover:text-white disabled:opacity-20" data-testid="button-redo">
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
          <span className="text-white/15 text-xs">{histIdx + 1}/{history.length}</span>
          <div className="h-4 w-px bg-white/10" />

          {/* Compare */}
          <Button
            variant="ghost" size="sm"
            onClick={() => setCompareMode(m => !m)}
            className={`h-7 px-2.5 text-xs gap-1.5 ${compareMode ? 'text-forge-cyan bg-forge-cyan/10' : 'text-white/40 hover:text-white'}`}
            data-testid="button-compare"
          >
            <Eye className="w-3.5 h-3.5" /> Comparer
          </Button>

          {/* Grille */}
          <Button
            variant="ghost" size="sm"
            onClick={() => update({ showGrid: !state.showGrid })}
            className={`h-7 px-2.5 text-xs gap-1.5 ${state.showGrid ? 'text-forge-cyan bg-forge-cyan/10' : 'text-white/40 hover:text-white'}`}
            data-testid="button-grid"
          >
            <Grid3X3 className="w-3.5 h-3.5" /> Grille
          </Button>

          {/* Pause animation */}
          <Button
            variant="ghost" size="sm"
            onClick={() => setIsPaused(p => !p)}
            className={`h-7 px-2.5 text-xs gap-1.5 ${isPaused ? 'text-amber-400 bg-amber-400/10' : 'text-white/40 hover:text-white'}`}
            data-testid="button-pause-anim"
          >
            <Film className="w-3.5 h-3.5" /> {isPaused ? 'Relancer' : 'Pause anim.'}
          </Button>

          <div className="h-4 w-px bg-white/10" />
          <Button onClick={reset} variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-white/30 hover:text-white gap-1.5" data-testid="button-reset-all">
            <RefreshCw className="w-3 h-3" /> Reset
          </Button>
          <Button onClick={downloadSvg} size="sm" className="h-7 px-3 bg-gradient-to-r from-forge-cyan to-violet-600 text-white text-xs font-semibold gap-1.5" data-testid="button-quick-export">
            <Download className="w-3.5 h-3.5" /> Exporter
          </Button>
        </div>

        {meta && (
          <div className="text-right hidden xl:block">
            <p className="text-white/70 text-xs font-medium">{meta.nom}{meta.titre ? ` · ${meta.titre}` : ''}</p>
            <p className="text-white/25 text-[10px] font-mono">{meta.signature_id}</p>
          </div>
        )}
      </div>

      {!hasSvg ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/3 border border-white/10 flex items-center justify-center">
            <Eye className="w-8 h-8 text-white/15" />
          </div>
          <p className="text-white/30 text-center text-sm">
            Aucune signature chargée dans le Reality Studio.<br />
            <Link href="/studio"><span className="text-forge-cyan underline cursor-pointer">Générez-en une depuis le Studio Signature Vivante →</span></Link>
          </p>
        </div>
      ) : (
        <div className="flex gap-3 flex-1">

          {/* ── PANNEAU GAUCHE ─────────────────────────────────────────── */}
          <div className="w-52 flex-shrink-0 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 140px)' }}>

            {/* Fond */}
            <section className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Fond</p>
              <div className="grid grid-cols-3 gap-1">
                {BG_OPTIONS.map(({ key, label, bg }) => (
                  <button key={key} onClick={() => update({ bg: key })} data-testid={`button-bg-${key}`}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[10px] transition-all ${state.bg === key ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/10' : 'border-white/8 text-white/35 hover:border-white/25'}`}>
                    <div className="w-5 h-5 rounded border border-white/20 shadow-inner" style={{ background: bg === 'transparent' ? 'repeating-conic-gradient(#444 0% 25%, #222 0% 50%) 0 0 / 8px 8px' : bg }} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Viewport */}
            <section className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Contexte</p>
              {([['desktop', Monitor, 'Bureau 700px'], ['mobile', Smartphone, 'Mobile 375px'], ['email', Mail, 'Email 600px'], ['full', Maximize2, 'Plein écran']] as [Viewport, any, string][]).map(([v, Icon, label]) => (
                <button key={v} onClick={() => update({ viewport: v })} data-testid={`button-vp-${v}`}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all ${state.viewport === v ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/10' : 'border-white/8 text-white/35 hover:border-white/20'}`}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {label}
                </button>
              ))}
            </section>

            {/* Zoom */}
            <section className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Zoom</p>
                <span className="text-forge-cyan text-[11px] font-mono">{state.scale}%</span>
              </div>
              <div className="flex items-center gap-1.5">
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
            <section className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Anim. vitesse</p>
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

          </div>

          {/* ── CANVAS CENTRAL ─────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0 space-y-2">
            {/* Status bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 flex-wrap">
                {vw && <Badge variant="outline" className="border-white/15 text-white/35 text-[10px] h-5">{vw}px</Badge>}
                {state.scale !== 100 && <Badge variant="outline" className="border-violet-500/30 text-violet-300 text-[10px] h-5">⊕ {state.scale}%</Badge>}
                {state.speedPct !== 100 && <Badge variant="outline" className="border-forge-cyan/30 text-forge-cyan text-[10px] h-5">⚡ {state.speedPct}%</Badge>}
                {(cssFilter || svgTransform) && <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-[10px] h-5">✦ Effets actifs</Badge>}
                {isPaused && <Badge variant="outline" className="border-amber-400/40 text-amber-400 text-[10px] h-5">⏸ Pause</Badge>}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/25 text-[10px]">LIVE</span>
              </div>
            </div>

            {/* Preview area */}
            <div
              ref={canvasStageRef}
              className="relative flex-1 flex items-start justify-center overflow-auto rounded-xl border border-white/8"
              style={{ background: '#080b10', minHeight: 300 }}
            >
              {/* Grille overlay */}
              {state.showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10" style={{
                  backgroundImage: 'linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
              )}

              <div className="p-6 flex flex-col items-center gap-4 w-full">
                {compareMode ? (
                  /* Mode comparaison A/B */
                  <div className="w-full flex gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-white/30 text-center uppercase tracking-widest">Original</p>
                      <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: BG_OPTIONS.find(b => b.key === state.bg)?.bg || '#fff' }}>
                        <div dangerouslySetInnerHTML={{ __html: sourceSvg }} />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-forge-cyan text-center uppercase tracking-widest">Modifié</p>
                      <div className="rounded-xl overflow-hidden border border-forge-cyan/20" style={{ background: BG_OPTIONS.find(b => b.key === state.bg)?.bg || '#fff' }}>
                        <div
                          style={{ filter: cssFilter || undefined, transform: svgTransform || undefined, transformOrigin: 'center', opacity: state.opacity / 100 }}
                          dangerouslySetInnerHTML={{ __html: processedSvg }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mode preview normal */
                  <div
                    className="rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
                    style={{
                      width: vw ? Math.min(vw, 900) : '100%',
                      maxWidth: '100%',
                      background: BG_OPTIONS.find(b => b.key === state.bg)?.bg || '#fff',
                      transform: `scale(${state.scale / 100})`,
                      transformOrigin: 'top center',
                      border: state.bg === 'transparent' ? '1px dashed rgba(255,255,255,0.12)' : 'none',
                    }}
                    data-testid="signature-preview-canvas"
                  >
                    <div
                      style={{ filter: cssFilter || undefined, transform: svgTransform || undefined, transformOrigin: 'center', opacity: state.opacity / 100, display: 'block', lineHeight: 0 }}
                      dangerouslySetInnerHTML={{ __html: processedSvg }}
                    />
                  </div>
                )}

                {/* Simulation email */}
                {state.viewport === 'email' && !compareMode && (
                  <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-lg">
                    <div className="px-5 pt-4 pb-2 border-b border-gray-200" style={{ background: '#fff' }}>
                      <p className="text-[11px] text-gray-500 mb-0.5">De : {meta?.nom || 'Votre Nom'} &lt;{meta?.email || 'vous@exemple.com'}&gt;</p>
                      <p className="text-[11px] text-gray-500 mb-1">À : client@exemple.com</p>
                      <p className="text-sm font-semibold text-gray-800">Objet : Proposition commerciale</p>
                    </div>
                    <div className="px-5 py-4" style={{ background: '#fff' }}>
                      <p className="text-sm text-gray-700 mb-3">Bonjour,</p>
                      <p className="text-sm text-gray-700 mb-4">Suite à notre échange, je vous transmets notre offre. N'hésitez pas à me contacter.</p>
                      <p className="text-sm text-gray-700 mb-3">Bien cordialement,</p>
                      <div className="border-t border-gray-100 pt-3">
                        <div
                          style={{ filter: cssFilter || undefined, transform: svgTransform || undefined, opacity: state.opacity / 100, display: 'block', lineHeight: 0 }}
                          dangerouslySetInnerHTML={{ __html: processedSvg }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions finales */}
            <div className="flex gap-2">
              <Button onClick={downloadSvg} className="flex-1 h-10 bg-gradient-to-r from-forge-cyan to-violet-600 text-white font-semibold text-sm rounded-xl hover:opacity-90 gap-2" data-testid="button-export-svg-final">
                {exported === 'svg' ? <><Check className="w-4 h-4" /> SVG exporté !</> : <><Download className="w-4 h-4" /> Valider &amp; Exporter SVG</>}
              </Button>
              <Button onClick={downloadPng} className="h-10 px-4 bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-sm font-semibold rounded-xl gap-2" data-testid="button-export-png">
                <Download className="w-4 h-4" /> PNG
              </Button>
              <Button onClick={copyHtml} className="h-10 px-4 bg-green-500/15 border border-green-500/40 text-green-300 hover:bg-green-500/25 text-sm font-semibold rounded-xl gap-2" data-testid="button-copy-html">
                {exported === 'html' ? <><Check className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> HTML email</>}
              </Button>
            </div>
          </div>

          {/* ── PANNEAU DROIT — Studio Tools ───────────────────────────── */}
          <div className="w-60 flex-shrink-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            <Tabs defaultValue="filters" className="w-full">
              <TabsList className="grid grid-cols-4 w-full h-8 bg-white/5 rounded-lg mb-2">
                <TabsTrigger value="filters" className="text-[10px] h-7 data-[state=active]:bg-forge-cyan/20 data-[state=active]:text-forge-cyan rounded" title="Filtres"><Sliders className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="fx" className="text-[10px] h-7 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 rounded" title="Effets spéciaux"><Sparkles className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="colors" className="text-[10px] h-7 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded" title="Couleurs"><Palette className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="export" className="text-[10px] h-7 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300 rounded" title="Export & Code"><Share2 className="w-3 h-3" /></TabsTrigger>
              </TabsList>

              {/* ── FILTRES PHOTO ── */}
              <TabsContent value="filters" className="space-y-2 mt-0">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-3">
                  <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-1.5"><Sliders className="w-3 h-3 text-forge-cyan" /> Filtres photo</p>
                  <FilterSlider label="Luminosité" stateKey="brightness" min={0} max={200} step={5} unit="%" color="text-amber-300" />
                  <FilterSlider label="Contraste" stateKey="contrast" min={0} max={300} step={5} unit="%" color="text-orange-300" />
                  <FilterSlider label="Saturation" stateKey="saturate" min={0} max={300} step={5} unit="%" color="text-pink-300" />
                  <FilterSlider label="Teinte (Hue)" stateKey="hueRotate" min={0} max={360} step={5} unit="°" color="text-forge-cyan" />
                  <FilterSlider label="Opacité" stateKey="opacity" min={10} max={100} step={5} unit="%" color="text-white/60" />

                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {[
                      { label: 'Chaud', p: { hueRotate: 20, saturate: 130, brightness: 105 } },
                      { label: 'Froid', p: { hueRotate: 200, saturate: 80, brightness: 95 } },
                      { label: 'Néon', p: { saturate: 250, brightness: 110, contrast: 120 } },
                      { label: 'Rétro', p: { saturate: 60, hueRotate: 30, contrast: 90 } },
                      { label: 'B&W', p: { saturate: 0, contrast: 120 } },
                      { label: 'Cinéma', p: { contrast: 130, saturate: 85, brightness: 90 } },
                    ].map(({ label, p }) => (
                      <button key={label} onClick={() => update(p as Partial<StudioState>)}
                        className="text-[10px] py-1 px-1 rounded border border-white/10 text-white/40 hover:border-forge-cyan/40 hover:text-forge-cyan transition-all">{label}</button>
                    ))}
                  </div>

                  <Button onClick={() => update({ brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, opacity: 100 })}
                    variant="ghost" size="sm" className="w-full h-6 text-[10px] text-white/25 hover:text-white">
                    <RefreshCw className="w-2.5 h-2.5 mr-1" /> Réinitialiser filtres
                  </Button>
                </div>
              </TabsContent>

              {/* ── EFFETS SPÉCIAUX ── */}
              <TabsContent value="fx" className="space-y-2 mt-0">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-3">
                  <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-violet-400" /> Effets spéciaux</p>

                  {/* Glow */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Halo (Glow)</span>
                      <span className="text-violet-300 font-mono">{state.glowIntensity}px</span>
                    </div>
                    <Slider value={[state.glowIntensity]} onValueChange={([v]) => update({ glowIntensity: v })} min={0} max={20} step={1} className="w-full" data-testid="slider-glow" />
                    {state.glowIntensity > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/30">Couleur glow</span>
                        <input type="color" value={state.glowColor} onChange={e => update({ glowColor: e.target.value })}
                          className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer" data-testid="input-glow-color" />
                        <span className="text-[10px] font-mono text-white/30">{state.glowColor}</span>
                      </div>
                    )}
                  </div>

                  {/* Flou */}
                  <FilterSlider label="Flou (Blur)" stateKey="blur" min={0} max={20} step={0.5} unit="px" color="text-blue-300" />

                  {/* Transformations */}
                  <div className="space-y-1.5 pt-1 border-t border-white/6">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Transformation</p>
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => update({ flipH: !state.flipH })}
                        className={`flex-1 h-7 text-[10px] gap-1 ${state.flipH ? 'bg-forge-cyan/20 border-forge-cyan/50 text-forge-cyan' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'} border`}
                        data-testid="button-flip-h">
                        <FlipHorizontal className="w-3 h-3" /> FlipH
                      </Button>
                      <Button size="sm" onClick={() => update({ flipV: !state.flipV })}
                        className={`flex-1 h-7 text-[10px] gap-1 ${state.flipV ? 'bg-forge-cyan/20 border-forge-cyan/50 text-forge-cyan' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'} border`}
                        data-testid="button-flip-v">
                        <FlipVertical className="w-3 h-3" /> FlipV
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Rotation</span>
                        <span className="text-amber-300 font-mono">{state.rotation}°</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Slider value={[state.rotation]} onValueChange={([v]) => update({ rotation: v })} min={-180} max={180} step={5} className="flex-1" data-testid="slider-rotation" />
                        <Button variant="ghost" size="sm" onClick={() => update({ rotation: 0 })} className="h-6 w-6 p-0 text-white/30 hover:text-white"><RotateCw className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </div>

                  {/* Presets effets */}
                  <div className="space-y-1 border-t border-white/6 pt-2">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Presets God Tier</p>
                    <div className="space-y-1">
                      {[
                        { label: '✦ Cyber Neon', p: { glowIntensity: 8, glowColor: '#00d4ff', saturate: 200, brightness: 110 } },
                        { label: '🔥 Plasma Fire', p: { glowIntensity: 12, glowColor: '#ff006e', hueRotate: 340, saturate: 180 } },
                        { label: '💜 Violet Storm', p: { glowIntensity: 10, glowColor: '#8338ec', hueRotate: 260, saturate: 160, contrast: 120 } },
                        { label: '🌟 Gold Elite', p: { glowIntensity: 6, glowColor: '#FFB800', hueRotate: 40, saturate: 150, brightness: 108 } },
                        { label: '🖤 Shadow', p: { brightness: 70, contrast: 140, saturate: 30, glowIntensity: 0 } },
                      ].map(({ label, p }) => (
                        <button key={label} onClick={() => update(p as Partial<StudioState>)}
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg border border-white/8 text-white/40 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/5 transition-all">
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => update({ glowIntensity: 0, blur: 0, flipH: false, flipV: false, rotation: 0 })}
                    variant="ghost" size="sm" className="w-full h-6 text-[10px] text-white/25 hover:text-white">
                    <RefreshCw className="w-2.5 h-2.5 mr-1" /> Réinitialiser effets
                  </Button>
                </div>
              </TabsContent>

              {/* ── COULEURS ── */}
              <TabsContent value="colors" className="space-y-2 mt-0">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-3">
                  <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-1.5"><Palette className="w-3 h-3 text-amber-400" /> Éditeur couleurs</p>

                  {svgColors.length > 0 ? (
                    <>
                      <p className="text-[10px] text-white/30">Couleurs détectées — cliquer pour sélectionner</p>
                      <div className="flex flex-wrap gap-1.5">
                        {svgColors.map(c => (
                          <button key={c} onClick={() => setColorFrom(c)} title={c}
                            className={`w-6 h-6 rounded border-2 transition-all ${colorFrom === c ? 'border-white scale-110' : 'border-white/10 hover:border-white/40'}`}
                            style={{ background: c }} data-testid={`color-swatch-${c.replace('#', '')}`} />
                        ))}
                      </div>

                      <div className="space-y-2 pt-1 border-t border-white/6">
                        <p className="text-[10px] text-white/30">Remplacement</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-0.5">
                            <p className="text-[9px] text-white/25">Source</p>
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded border border-white/20" style={{ background: colorFrom || '#333' }} />
                              <span className="text-[10px] font-mono text-white/40 flex-1 truncate">{colorFrom || 'Choisir'}</span>
                            </div>
                          </div>
                          <span className="text-white/20">→</span>
                          <div className="flex-1 space-y-0.5">
                            <p className="text-[9px] text-white/25">Cible</p>
                            <div className="flex items-center gap-1.5">
                              <input type="color" value={colorTo} onChange={e => setColorTo(e.target.value)}
                                className="w-5 h-5 rounded border border-white/20 bg-transparent cursor-pointer" data-testid="input-color-to" />
                              <span className="text-[10px] font-mono text-white/40 flex-1 truncate">{colorTo}</span>
                            </div>
                          </div>
                        </div>
                        <Button onClick={applyColorSwap} disabled={!colorFrom}
                          className="w-full h-7 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[11px] disabled:opacity-30"
                          data-testid="button-apply-color-swap">
                          Appliquer le remplacement
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-white/25 text-center py-2">Aucune couleur détectée dans le SVG</p>
                  )}
                </div>
              </TabsContent>

              {/* ── EXPORT & CODE ── */}
              <TabsContent value="export" className="space-y-2 mt-0">
                {/* Exports */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-1.5"><Share2 className="w-3 h-3 text-green-400" /> Formats d'export</p>

                  <Button onClick={downloadSvg} className="w-full h-8 bg-gradient-to-r from-forge-cyan/20 to-violet-600/20 border border-forge-cyan/40 text-forge-cyan hover:bg-forge-cyan/25 text-[11px] font-semibold gap-2" data-testid="button-export-svg">
                    <Download className="w-3.5 h-3.5" /> Télécharger SVG animé
                  </Button>
                  <Button onClick={downloadPng} className="w-full h-8 bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-[11px] font-semibold gap-2" data-testid="button-export-png-tab">
                    <Download className="w-3.5 h-3.5" /> Exporter PNG ({state.scale}%)
                  </Button>
                  <Button onClick={copyHtml} className="w-full h-8 bg-green-500/15 border border-green-500/40 text-green-300 hover:bg-green-500/25 text-[11px] font-semibold gap-2" data-testid="button-copy-html-tab">
                    <Copy className="w-3.5 h-3.5" /> Copier HTML email
                  </Button>
                  <Button onClick={copySvgCode} className="w-full h-8 bg-white/5 border border-white/10 text-white/50 hover:text-white text-[11px] gap-2" data-testid="button-copy-svg-code">
                    <Code2 className="w-3.5 h-3.5" /> Copier code SVG
                  </Button>
                </div>

                {/* Éditeur code SVG */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
                  <button
                    onClick={() => { setCodeOpen(o => !o); setEditedCode(activeSvg); }}
                    className="flex items-center justify-between w-full text-[10px] font-semibold text-white/35 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Code2 className="w-3 h-3 text-white/40" /> Éditeur SVG brut</span>
                    {codeOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {codeOpen && (
                    <div className="space-y-2">
                      <textarea
                        value={editedCode}
                        onChange={e => setEditedCode(e.target.value)}
                        className="w-full h-40 text-[10px] font-mono bg-black/40 border border-white/10 rounded-lg p-2 text-white/60 resize-none focus:outline-none focus:border-forge-cyan/50"
                        spellCheck={false}
                        data-testid="textarea-svg-code"
                      />
                      <div className="flex gap-1.5">
                        <Button onClick={applyCodeEdit} size="sm" className="flex-1 h-7 bg-forge-cyan/20 border border-forge-cyan/40 text-forge-cyan text-[11px]" data-testid="button-apply-code">
                          <Check className="w-3 h-3 mr-1" /> Appliquer
                        </Button>
                        <Button onClick={() => setEditedCode(sourceSvg)} size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-white/30 hover:text-white" data-testid="button-reset-code">
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Infos signature */}
                {meta && (
                  <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Informations</p>
                    {[['Nom', meta.nom], ['Titre', meta.titre], ['Société', meta.entreprise], ['Email', meta.email], ['Tél', meta.telephone]].map(([k, v]) => v ? (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-white/25">{k}</span>
                        <span className="text-white/55 truncate ml-2 max-w-32">{v}</span>
                      </div>
                    ) : null)}
                    <div className="pt-1 border-t border-white/6">
                      <p className="text-[9px] font-mono text-white/20 break-all">{meta.signature_id}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
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