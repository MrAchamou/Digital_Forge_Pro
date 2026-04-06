import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Download, CheckCircle2, Circle, Loader2, Brain, Cpu, Zap, Bot, RefreshCw, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepStatus {
  status: 'idle' | 'running' | 'done' | 'error';
  data?: any;
}

interface PipelineState {
  scraping: StepStatus;
  brain1: StepStatus;
  brain2: StepStatus;
  brain3: StepStatus;
  svgGen: StepStatus;
}

interface FormData {
  nom: string;
  titre: string;
  entreprise: string;
  telephone: string;
  email: string;
  site: string;
  secteur: string;
  cta: string;
  palette: string[];
}

interface PipelineResult {
  brief_creatif?: any;
  scenario_narratif?: any;
  configuration_technique?: any;
  status_pipeline?: string;
  svg_content?: string;
  signature_id?: string;
  svg_url?: string;
  pdf_instructions_url?: string;
  config_json_url?: string;
}

// ─── Canvas Live ──────────────────────────────────────────────────────────────

const CANVAS_PHASES = [
  { label: "Fond noir apparaît", color: "#1a1a2e" },
  { label: "Séparateur se dessine", color: "#6366f1" },
  { label: "Zone avatar trace un cercle", color: "#818cf8" },
  { label: "Initiales apparaissent", color: "#a5b4fc" },
  { label: "Nom s'écrit lettre à lettre", color: "#c7d2fe" },
  { label: "Titre slide depuis la gauche", color: "#e0e7ff" },
  { label: "Infos contact en cascade", color: "#6366f1" },
  { label: "Icônes réseaux pop in", color: "#818cf8" },
  { label: "CTA se dessine", color: "#a5b4fc" },
  { label: "Effets vivants s'activent", color: "#6366f1" },
  { label: "Preview final 4 variations", color: "#c7d2fe" },
];

function LiveCanvas({ phase, metadata, svgContent }: { phase: number; metadata: FormData; svgContent?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const progressRef = useRef(0);
  const variantRef = useRef(0);
  const variantTimerRef = useRef(0);

  const palette = metadata.palette || ['#0f0f0f', '#6366f1', '#e8e8ff'];
  const [bg, accent, textColor] = palette;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    progressRef.current = Math.min(progressRef.current + 0.006, 1);
    const p = progressRef.current;
    const ph = phaseRef.current;

    // Fond
    ctx.fillStyle = ph >= 0 ? bg : '#000';
    ctx.globalAlpha = ph >= 0 ? Math.min(p * 2, 1) : 1;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    if (ph >= 1) {
      // Séparateur
      const sepH = ph >= 1 ? Math.min((p - 0.1) * 3, 1) * (H - 40) : 0;
      ctx.beginPath();
      ctx.moveTo(130, 20);
      ctx.lineTo(130, 20 + sepH);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (ph >= 2) {
      // Cercle avatar
      const circleP = Math.min((p - 0.2) * 3, 1);
      ctx.beginPath();
      ctx.arc(65, H / 2, 48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * circleP);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (ph >= 3) {
      // Initiales
      const alpha = Math.min((p - 0.3) * 4, 1);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 26px system-ui';
      ctx.fillStyle = accent;
      ctx.textAlign = 'center';
      ctx.fillText(
        `${metadata.nom.charAt(0)}${(metadata.nom.split(' ')[1] || '').charAt(0)}`,
        65, H / 2 + 10
      );
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    if (ph >= 4) {
      // Nom lettre à lettre
      const fullName = metadata.nom || 'Jean Dupont';
      const lettersToShow = Math.floor(Math.min((p - 0.35) * 6, 1) * fullName.length);
      const displayName = fullName.slice(0, lettersToShow);
      ctx.font = 'bold 18px system-ui';
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.9;
      ctx.fillText(displayName, 148, H / 2 - 28);
      ctx.globalAlpha = 1;
    }

    if (ph >= 5) {
      // Titre slide depuis gauche
      const slideX = Math.max(0, (1 - Math.min((p - 0.45) * 5, 1)) * -60);
      ctx.font = '11px system-ui';
      ctx.fillStyle = accent;
      ctx.globalAlpha = Math.min((p - 0.45) * 5, 1);
      ctx.fillText(metadata.titre.toUpperCase(), 148 + slideX, H / 2 - 10);
      ctx.globalAlpha = 1;
    }

    if (ph >= 6) {
      // Contact en cascade
      const lines = [metadata.entreprise, metadata.email, metadata.telephone].filter(Boolean);
      lines.forEach((line, i) => {
        const alpha = Math.min((p - 0.5 - i * 0.05) * 8, 1);
        if (alpha <= 0) return;
        ctx.font = '10px system-ui';
        ctx.fillStyle = textColor;
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillText(line, 148, H / 2 + 10 + i * 16);
      });
      ctx.globalAlpha = 1;
    }

    if (ph >= 7) {
      // Icônes réseaux avec rebond
      const icons = ['in', 'ig', 'tw'];
      icons.forEach((icon, i) => {
        const t = Math.min((p - 0.6 - i * 0.04) * 8, 1);
        if (t <= 0) return;
        const bounce = 1 + Math.sin(t * Math.PI) * 0.3 * (1 - t);
        const x = 148 + i * 30;
        const y = H / 2 + 52;
        ctx.save();
        ctx.translate(x + 12, y);
        ctx.scale(bounce, bounce);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = t;
        ctx.stroke();
        ctx.font = '7px system-ui';
        ctx.fillStyle = accent;
        ctx.textAlign = 'center';
        ctx.fillText(icon, 0, 3);
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      });
    }

    if (ph >= 8 && metadata.cta) {
      // CTA
      const alpha = Math.min((p - 0.75) * 8, 1);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.roundRect(W - 168, H / 2 - 18, 148, 32, 16);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = '10px system-ui';
      ctx.fillStyle = accent;
      ctx.textAlign = 'center';
      ctx.fillText(metadata.cta, W - 94, H / 2 + 5);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    if (ph >= 9) {
      // Effets vivants — halo pulsant
      const haloAlpha = 0.15 + Math.sin(Date.now() / 800) * 0.1;
      ctx.beginPath();
      ctx.arc(65, H / 2, 55 + Math.sin(Date.now() / 600) * 4, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(65, H / 2, 30, 65, H / 2, 60);
      grad.addColorStop(0, accent + '44');
      grad.addColorStop(1, accent + '00');
      ctx.fillStyle = grad;
      ctx.globalAlpha = haloAlpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (ph >= 10) {
      // Preview 4 variations
      variantTimerRef.current++;
      if (variantTimerRef.current > 180) {
        variantTimerRef.current = 0;
        variantRef.current = (variantRef.current + 1) % 4;
      }
      const varLabels = ['A', 'B', 'C', 'D'];
      const varColors = [accent, '#ec4899', '#f59e0b', '#10b981'];
      const vColor = varColors[variantRef.current];

      ctx.font = 'bold 10px system-ui';
      ctx.fillStyle = vColor;
      ctx.globalAlpha = 0.5;
      ctx.fillText(`VARIATION ${varLabels[variantRef.current]}`, W - 90, H - 12);
      ctx.globalAlpha = 1;

      // Sep animation couleur
      const time = Date.now() / 1000;
      const sepGlow = 0.4 + Math.sin(time * 2) * 0.2;
      ctx.beginPath();
      ctx.moveTo(130, 20);
      ctx.lineTo(130, H - 20);
      ctx.strokeStyle = vColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = vColor;
      ctx.shadowBlur = 12 * sepGlow;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [bg, accent, textColor, metadata]);

  useEffect(() => {
    progressRef.current = 0;
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={560}
        height={200}
        className="w-full rounded-xl border border-white/10"
        style={{ background: bg }}
      />
      {phase < 10 && (
        <div className="absolute bottom-3 left-3 text-xs text-white/40 bg-black/40 px-2 py-1 rounded-md">
          {CANVAS_PHASES[Math.min(phase, CANVAS_PHASES.length - 1)]?.label}
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Status Panel ────────────────────────────────────────────────────

function StepIndicator({ icon: Icon, label, sublabel, status, progress }: {
  icon: any; label: string; sublabel?: string; status: StepStatus; progress?: number;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-500 ${
      status.status === 'done' ? 'border-green-500/30 bg-green-500/5' :
      status.status === 'running' ? 'border-forge-cyan/40 bg-forge-cyan/5' :
      status.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
      'border-white/10 bg-white/2'
    }`}>
      <div className={`mt-0.5 flex-shrink-0 ${
        status.status === 'done' ? 'text-green-400' :
        status.status === 'running' ? 'text-forge-cyan' :
        status.status === 'error' ? 'text-red-400' :
        'text-white/20'
      }`}>
        {status.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> :
         status.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> :
         <Circle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${status.status === 'running' ? 'text-forge-cyan' : 'text-white/40'}`} />
          <span className={`text-xs font-medium truncate ${status.status === 'idle' ? 'text-white/30' : 'text-white/80'}`}>{label}</span>
        </div>
        {sublabel && <p className="text-xs text-white/30 mt-0.5 truncate">{sublabel}</p>}
        {status.status === 'running' && (
          <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-forge-cyan rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
        {status.status === 'done' && status.data && (
          <div className="mt-1 space-y-0.5">
            {status.data.mot_clef_narratif && (
              <p className="text-xs text-forge-cyan font-medium">"{status.data.mot_clef_narratif}"</p>
            )}
            {status.data.arc_emotionnel && (
              <p className="text-xs text-white/50">{status.data.arc_emotionnel}</p>
            )}
            {status.data.cycle_total && (
              <p className="text-xs text-white/50">Cycle: {status.data.cycle_total}s</p>
            )}
            {status.data.entreprise && (
              <p className="text-xs text-green-400 font-medium">{status.data.entreprise}</p>
            )}
          </div>
        )}
        {progress !== undefined && progress > 0 && (
          <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Right Meta Panel ─────────────────────────────────────────────────────────

function MetaPanel({ pipeline }: { pipeline: PipelineState }) {
  const { brain1, brain2, brain3 } = pipeline;
  return (
    <div className="space-y-4 h-full">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Méta Créative</h3>

      {brain1.status !== 'idle' && (
        <div className={`rounded-xl border p-3 space-y-2 transition-all ${brain1.status === 'done' ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">💡 GPT-4o Vision</span>
            {brain1.status === 'running' && <Loader2 className="w-3 h-3 text-violet-400 animate-spin ml-auto" />}
            {brain1.status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
          </div>
          {brain1.data && (
            <div className="space-y-1 text-xs text-white/50">
              {brain1.data.references_visuelles && (
                <p>Références : <span className="text-violet-300">{brain1.data.references_visuelles.slice(0, 3).join(', ')}</span></p>
              )}
              {brain1.data.univers_visuel && (
                <p className="italic text-white/40">"{brain1.data.univers_visuel}"</p>
              )}
              {brain1.data.intensite_mouvement && (
                <p>Intensité : <span className="text-white/70">{brain1.data.intensite_mouvement}</span></p>
              )}
            </div>
          )}
        </div>
      )}

      {brain2.status !== 'idle' && (
        <div className={`rounded-xl border p-3 space-y-2 transition-all ${brain2.status === 'done' ? 'border-pink-500/30 bg-pink-500/5' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-semibold text-pink-300">🎭 Claude Sonnet</span>
            {brain2.status === 'running' && <Loader2 className="w-3 h-3 text-pink-400 animate-spin ml-auto" />}
            {brain2.status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
          </div>
          {brain2.data && (
            <div className="space-y-1 text-xs text-white/50">
              {brain2.data.arc_emotionnel && (
                <p>Arc : <span className="text-pink-300">{brain2.data.arc_emotionnel}</span></p>
              )}
              {brain2.data.variations && (
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {Object.entries(brain2.data.variations).map(([k, v]: any) => (
                    <div key={k} className="text-xs">
                      <span className="text-white/40">Var {k} : </span>
                      <span className="text-pink-200 text-xs">{v.titre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {brain3.status !== 'idle' && (
        <div className={`rounded-xl border p-3 space-y-2 transition-all ${brain3.status === 'done' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">⚡ Gemini Flash</span>
            {brain3.status === 'running' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin ml-auto" />}
            {brain3.status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
          </div>
          {brain3.data && (
            <div className="space-y-1 text-xs text-white/50">
              {brain3.data.cycle_total && (
                <p>Cycle : <span className="text-amber-300">{brain3.data.cycle_total}s</span></p>
              )}
              {brain3.data.variation_a?.logo && (
                <p>Logo A : <span className="text-white/70">{brain3.data.variation_a.logo.effet}</span></p>
              )}
              <div className="flex gap-2 mt-1">
                <span className="text-green-400 text-xs">Gmail ✓</span>
                <span className="text-green-400 text-xs">Outlook ✓</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Studio Page ─────────────────────────────────────────────────────────

const DEFAULT_FORM: FormData = {
  nom: "Jean Dupont",
  titre: "Directeur Créatif",
  entreprise: "Studio Nova",
  telephone: "+33 6 12 34 56 78",
  email: "jean@studionova.fr",
  site: "https://studionova.fr",
  secteur: "Design & Créatif",
  cta: "Réserver un appel",
  palette: ["#0f0f0f", "#6366f1", "#e8e8ff"],
};

const idle: StepStatus = { status: 'idle' };

export default function Studio() {
  const { toast } = useToast();

  const [gmbUrl, setGmbUrl] = useState('');
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [canvasPhase, setCanvasPhase] = useState(-1);
  const [svgContent, setSvgContent] = useState<string>('');
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [pipeline, setPipeline] = useState<PipelineState>({
    scraping: idle, brain1: idle, brain2: idle, brain3: idle, svgGen: idle,
  });

  const setStep = (key: keyof PipelineState, status: StepStatus) => {
    setPipeline(prev => ({ ...prev, [key]: status }));
  };

  const advanceCanvasPhase = (ph: number) => {
    setCanvasPhase(ph);
  };

  // ── Scraping GMB ───
  const scrapeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch('/api/signature/scrape-gmb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmb_url: url }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onMutate: () => setStep('scraping', { status: 'running' }),
    onSuccess: (data) => {
      setStep('scraping', { status: 'done', data });
      setForm(prev => ({ ...prev, ...data, palette: data.palette || prev.palette }));
      toast({ title: "Données GMB importées", description: data.entreprise });
    },
    onError: (err: any) => {
      setStep('scraping', { status: 'error' });
      toast({ title: "Erreur GMB", description: err.message, variant: "destructive" });
    },
  });

  // ── Pipeline IA ───
  const pipelineMutation = useMutation({
    mutationFn: async () => {
      setStep('brain1', { status: 'running' });
      advanceCanvasPhase(0);

      await delay(400);
      advanceCanvasPhase(1);

      const res = await fetch('/api/signature/analyze-and-configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: form }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onMutate: () => {
      setPipeline({ scraping: pipeline.scraping, brain1: { status: 'running' }, brain2: idle, brain3: idle, svgGen: idle });
    },
    onSuccess: async (data) => {
      setStep('brain1', { status: 'done', data: data.brief_creatif });
      advanceCanvasPhase(2);
      await delay(300);

      setStep('brain2', { status: 'done', data: data.scenario_narratif });
      advanceCanvasPhase(4);
      await delay(300);

      setStep('brain3', { status: 'done', data: data.configuration_technique });
      advanceCanvasPhase(7);
      await delay(200);

      setStep('svgGen', { status: 'running' });
      advanceCanvasPhase(9);

      const exportRes = await fetch('/api/signature/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: form,
          brief: data.brief_creatif,
          scenario: data.scenario_narratif,
          config: data.configuration_technique,
        }),
      });

      if (!exportRes.ok) throw new Error('Erreur export SVG');
      const exportData = await exportRes.json();

      await delay(400);
      advanceCanvasPhase(10);
      setStep('svgGen', { status: 'done', data: { cycle_total: data.configuration_technique?.cycle_total } });

      setSvgContent(exportData.svg_content);
      setResult({ ...data, ...exportData });

      toast({ title: "✅ Signature God Tier générée !", description: `Cycle ${data.configuration_technique?.cycle_total || 240}s` });
    },
    onError: (err: any) => {
      setStep('brain1', { status: 'error' });
      toast({ title: "Erreur pipeline", description: err.message, variant: "destructive" });
    },
  });

  const handleReset = () => {
    setCanvasPhase(-1);
    setSvgContent('');
    setResult(null);
    setPipeline({ scraping: idle, brain1: idle, brain2: idle, brain3: idle, svgGen: idle });
  };

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signature_god_tier_${result?.signature_id || 'export'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isRunning = pipelineMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-2">
          <Brain className="w-4 h-4" />
          Studio Signature — Pipeline 3 Cerveaux IA
        </div>
        <h1 className="text-3xl font-bold text-white">God Tier Studio</h1>
        <p className="text-white/50 max-w-xl mx-auto text-sm">
          3 IA en cascade analysent, narrent et optimisent votre signature vivante en temps réel
        </p>
      </div>

      {/* GMB Scraper */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-4">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
          <Link2 className="w-3.5 h-3.5 inline mr-2 text-forge-cyan" />
          Import automatique Google My Business
        </h3>
        <div className="flex gap-2">
          <Input
            value={gmbUrl}
            onChange={e => setGmbUrl(e.target.value)}
            placeholder="https://maps.google.com/maps/place/..."
            className="bg-white/5 border-white/20 text-white text-sm flex-1"
            data-testid="input-gmb-url"
          />
          <Button
            onClick={() => scrapeMutation.mutate(gmbUrl)}
            disabled={!gmbUrl || scrapeMutation.isPending}
            className="bg-forge-cyan/20 border border-forge-cyan/40 text-forge-cyan hover:bg-forge-cyan/30 text-xs whitespace-nowrap"
            data-testid="button-scrape-gmb"
          >
            {scrapeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Importer GMB'}
          </Button>
        </div>
        {pipeline.scraping.status === 'done' && (
          <p className="text-xs text-green-400 mt-2">✓ {pipeline.scraping.data?.entreprise} — {pipeline.scraping.data?.secteur}</p>
        )}
      </div>

      {/* 3 zones principales */}
      <div className="grid grid-cols-12 gap-4">

        {/* GAUCHE — Pipeline Status (3/12) */}
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Pipeline Status</h3>

          <StepIndicator icon={Link2} label="Scraping GMB" sublabel="Données entreprise" status={pipeline.scraping} />
          <StepIndicator icon={Brain} label="Cerveau 1 — GPT-4o" sublabel="Brief créatif visuel" status={pipeline.brain1} />
          <StepIndicator icon={Bot} label="Cerveau 2 — Claude" sublabel="Scénario narratif 4 variations" status={pipeline.brain2} />
          <StepIndicator icon={Zap} label="Cerveau 3 — Gemini" sublabel="Config technique optimisée" status={pipeline.brain3} />
          <StepIndicator icon={Sparkles} label="Génération SVG" sublabel="Assemblage final God Tier" status={pipeline.svgGen}
            progress={pipeline.svgGen.status === 'done' ? 100 : pipeline.svgGen.status === 'running' ? 75 : 0}
          />

          {/* Formulaire rapide */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-3 space-y-2 mt-4">
            <h4 className="text-xs text-white/40 uppercase tracking-wider">Données</h4>
            {(['nom', 'titre', 'entreprise'] as const).map(field => (
              <div key={field}>
                <Label className="text-white/40 text-xs">{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Input
                  value={form[field]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white text-xs h-7 mt-0.5"
                  data-testid={`input-form-${field}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CENTRE — Canvas Live (6/12) */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Canvas Live</h3>
              {canvasPhase >= 10 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Preview Final</span>
              )}
            </div>

            <LiveCanvas phase={canvasPhase} metadata={form} svgContent={svgContent} />

            {/* Progress phases */}
            <div className="flex gap-1 mt-3 flex-wrap">
              {CANVAS_PHASES.map((ph, i) => (
                <div
                  key={i}
                  title={ph.label}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= canvasPhase ? 'bg-forge-cyan' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-white/30 mt-1.5">
              {canvasPhase >= 0 && canvasPhase < CANVAS_PHASES.length
                ? CANVAS_PHASES[canvasPhase].label
                : canvasPhase >= 10 ? 'Cycle 4 variations actif' : 'En attente du lancement'}
            </p>
          </div>

          {/* SVG Preview final */}
          {svgContent && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-green-400 uppercase tracking-widest">SVG God Tier Final</h3>
                <span className="text-xs text-white/40">{result?.signature_id}</span>
              </div>
              <div
                className="rounded-lg overflow-hidden border border-white/10"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          )}

          {/* CTA Principal */}
          <div className="flex gap-3">
            <Button
              onClick={() => pipelineMutation.mutate()}
              disabled={isRunning || !form.nom}
              className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-forge-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90"
              data-testid="button-launch-pipeline"
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pipeline IA en cours…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Lancer la Pipeline 3 Cerveaux
                </span>
              )}
            </Button>
            {result && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-white/20 text-white/60 hover:text-white h-12"
                data-testid="button-reset-pipeline"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* DROITE — Méta créative (3/12) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <MetaPanel pipeline={pipeline} />

          {/* Export */}
          {result && (
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Exports</h4>

              <Button
                onClick={downloadSVG}
                className="w-full h-9 bg-violet-600/30 border border-violet-500/50 text-violet-300 hover:bg-violet-600/40 text-xs"
                data-testid="button-download-svg"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Télécharger SVG God Tier
              </Button>

              {result.pdf_instructions_url && (
                <a href={result.pdf_instructions_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-9 border-white/20 text-white/60 hover:text-white text-xs"
                    data-testid="button-download-guide"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Guide installation
                  </Button>
                </a>
              )}

              {result.config_json_url && (
                <a href={result.config_json_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-9 border-white/20 text-white/60 hover:text-white text-xs"
                    data-testid="button-download-config"
                  >
                    <Cpu className="w-3.5 h-3.5 mr-2" />
                    Config JSON
                  </Button>
                </a>
              )}

              <div className="rounded-lg bg-black/30 p-3 space-y-1">
                <p className="text-xs text-white/30">Signature ID</p>
                <p className="text-xs text-white/70 font-mono break-all">{result.signature_id}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
