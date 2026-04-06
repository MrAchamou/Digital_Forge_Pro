import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Sparkles, Download, CheckCircle2, Circle, Loader2, Brain, Cpu, Zap, Bot,
  RefreshCw, Link2, Upload, ImageIcon, Wand2, Star, MapPin, Phone, Mail,
  Globe, Building2, User, Briefcase, ChevronDown, ChevronUp, Eye, EyeOff,
  Package, Send, ExternalLink, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepStatus { status: 'idle' | 'running' | 'done' | 'error'; data?: any; }

interface PipelineState {
  scraping: StepStatus; brain1: StepStatus; brain2: StepStatus;
  brain3: StepStatus; svgGen: StepStatus;
}

interface DeliveryStepStatus {
  step: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
}

interface DeliveryResult {
  signature_id: string;
  preview_url: string;
  download_url: string;
  email_sent: boolean;
  package_contents: string[];
  steps: DeliveryStepStatus[];
}

interface FormData {
  nom: string; titre: string; entreprise: string;
  telephone: string; email: string; site: string;
  secteur: string; cta: string; palette: string[];
  adresse: string; ville: string; pays: string;
  note: number; avis: number; description: string;
  logo_url: string; logo_base64: string;
  style_visuel: string; slogan: string;
  mots_cles: string[]; ton: string;
  reseaux_sociaux: Record<string, string>;
  client_email: string;
}

interface StyleDetectResult {
  style_visuel: string; univers: string; mots_cles: string[];
  palette_narrative: string; reference_iconique: string; justification: string;
}

interface PipelineResult {
  brief_creatif?: any; scenario_narratif?: any; configuration_technique?: any;
  status_pipeline?: string; svg_content?: string; signature_id?: string;
  svg_url?: string; pdf_instructions_url?: string; config_json_url?: string;
}

// ─── Canvas Live ──────────────────────────────────────────────────────────────

const CANVAS_PHASES = [
  "Fond noir apparaît", "Séparateur se dessine", "Zone avatar trace un cercle",
  "Initiales apparaissent", "Nom s'écrit lettre à lettre", "Titre slide depuis la gauche",
  "Infos contact en cascade", "Icônes réseaux pop in", "CTA se dessine",
  "Effets vivants s'activent", "Preview final 4 variations",
];

function LiveCanvas({ phase, metadata }: { phase: number; metadata: FormData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const progressRef = useRef(0);
  const variantRef = useRef(0);
  const variantTimerRef = useRef(0);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  const palette = metadata.palette?.length >= 3 ? metadata.palette : ['#0f0f0f', '#6366f1', '#e8e8ff'];
  const [bg, accent, textColor] = palette;

  useEffect(() => {
    const logoSrc = metadata.logo_base64 || metadata.logo_url;
    if (logoSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { logoImgRef.current = img; };
      img.onerror = () => { logoImgRef.current = null; };
      img.src = logoSrc;
    } else {
      logoImgRef.current = null;
    }
  }, [metadata.logo_base64, metadata.logo_url]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width; const H = canvas.height;
    progressRef.current = Math.min(progressRef.current + 0.006, 1);
    const p = progressRef.current; const ph = phase;

    ctx.fillStyle = ph >= 0 ? bg : '#000';
    ctx.globalAlpha = ph >= 0 ? Math.min(p * 2, 1) : 1;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    if (ph >= 1) {
      const sepH = Math.min((p - 0.1) * 3, 1) * (H - 40);
      ctx.beginPath(); ctx.moveTo(130, 20); ctx.lineTo(130, 20 + sepH);
      ctx.strokeStyle = accent; ctx.lineWidth = 2;
      ctx.shadowColor = accent; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
    }

    if (ph >= 2) {
      const circleP = Math.min((p - 0.2) * 3, 1);
      ctx.beginPath(); ctx.arc(65, H / 2, 48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * circleP);
      ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke();
    }

    if (ph >= 3) {
      const alpha = Math.min((p - 0.3) * 4, 1);
      ctx.globalAlpha = alpha;
      if (logoImgRef.current) {
        const logoSize = 68; const lx = 65 - logoSize / 2; const ly = H / 2 - logoSize / 2;
        ctx.save(); ctx.beginPath(); ctx.arc(65, H / 2, 38, 0, Math.PI * 2);
        ctx.clip(); ctx.drawImage(logoImgRef.current, lx, ly, logoSize, logoSize);
        ctx.restore();
      } else {
        ctx.font = 'bold 26px system-ui'; ctx.fillStyle = accent; ctx.textAlign = 'center';
        ctx.fillText(`${metadata.nom.charAt(0)}${(metadata.nom.split(' ')[1] || '').charAt(0)}`, 65, H / 2 + 10);
        ctx.textAlign = 'left';
      }
      ctx.globalAlpha = 1;
    }

    if (ph >= 4) {
      const lettersToShow = Math.floor(Math.min((p - 0.35) * 6, 1) * (metadata.nom || '').length);
      ctx.font = 'bold 18px system-ui'; ctx.fillStyle = textColor; ctx.globalAlpha = 0.9;
      ctx.fillText((metadata.nom || '').slice(0, lettersToShow), 148, H / 2 - 28);
      ctx.globalAlpha = 1;
    }

    if (ph >= 5) {
      const slideX = Math.max(0, (1 - Math.min((p - 0.45) * 5, 1)) * -60);
      ctx.font = '11px system-ui'; ctx.fillStyle = accent;
      ctx.globalAlpha = Math.min((p - 0.45) * 5, 1);
      ctx.fillText((metadata.titre || '').toUpperCase(), 148 + slideX, H / 2 - 10);
      ctx.globalAlpha = 1;
    }

    if (ph >= 6) {
      const lines = [metadata.entreprise, metadata.email, metadata.telephone].filter(Boolean);
      lines.forEach((line, i) => {
        const alpha = Math.min((p - 0.5 - i * 0.05) * 8, 1);
        if (alpha <= 0) return;
        ctx.font = '10px system-ui'; ctx.fillStyle = textColor;
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillText(line, 148, H / 2 + 10 + i * 16);
      });
      ctx.globalAlpha = 1;
    }

    if (ph >= 7) {
      ['in', 'ig', 'tw'].forEach((icon, i) => {
        const t = Math.min((p - 0.6 - i * 0.04) * 8, 1);
        if (t <= 0) return;
        const bounce = 1 + Math.sin(t * Math.PI) * 0.3 * (1 - t);
        ctx.save(); ctx.translate(148 + i * 30 + 12, H / 2 + 52); ctx.scale(bounce, bounce);
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.globalAlpha = t; ctx.stroke();
        ctx.font = '7px system-ui'; ctx.fillStyle = accent; ctx.textAlign = 'center';
        ctx.fillText(icon, 0, 3); ctx.restore(); ctx.globalAlpha = 1; ctx.textAlign = 'left';
      });
    }

    if (ph >= 8 && metadata.cta) {
      const alpha = Math.min((p - 0.75) * 8, 1); ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.roundRect(W - 168, H / 2 - 18, 148, 32, 16);
      ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = '10px system-ui'; ctx.fillStyle = accent; ctx.textAlign = 'center';
      ctx.fillText(metadata.cta, W - 94, H / 2 + 5); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }

    if (ph >= 9) {
      const haloAlpha = 0.15 + Math.sin(Date.now() / 800) * 0.1;
      ctx.beginPath(); ctx.arc(65, H / 2, 55 + Math.sin(Date.now() / 600) * 4, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(65, H / 2, 30, 65, H / 2, 60);
      grad.addColorStop(0, accent + '44'); grad.addColorStop(1, accent + '00');
      ctx.fillStyle = grad; ctx.globalAlpha = haloAlpha; ctx.fill(); ctx.globalAlpha = 1;
    }

    if (ph >= 10) {
      variantTimerRef.current++;
      if (variantTimerRef.current > 180) { variantTimerRef.current = 0; variantRef.current = (variantRef.current + 1) % 4; }
      const vColor = [accent, '#ec4899', '#f59e0b', '#10b981'][variantRef.current];
      ctx.font = 'bold 10px system-ui'; ctx.fillStyle = vColor; ctx.globalAlpha = 0.5;
      ctx.fillText(`VARIATION ${'ABCD'[variantRef.current]}`, W - 90, H - 12); ctx.globalAlpha = 1;
      const t = Date.now() / 1000; const sepGlow = 0.4 + Math.sin(t * 2) * 0.2;
      ctx.beginPath(); ctx.moveTo(130, 20); ctx.lineTo(130, H - 20);
      ctx.strokeStyle = vColor; ctx.lineWidth = 1.5; ctx.shadowColor = vColor;
      ctx.shadowBlur = 12 * sepGlow; ctx.stroke(); ctx.shadowBlur = 0;
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [bg, accent, textColor, metadata, phase]);

  useEffect(() => {
    progressRef.current = 0;
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} width={560} height={200} className="w-full rounded-xl border border-white/10" style={{ background: bg }} />
      {phase < 10 && phase >= 0 && (
        <div className="absolute bottom-3 left-3 text-xs text-white/40 bg-black/40 px-2 py-1 rounded-md">
          {CANVAS_PHASES[Math.min(phase, CANVAS_PHASES.length - 1)]}
        </div>
      )}
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ icon: Icon, label, sublabel, status }: {
  icon: any; label: string; sublabel?: string; status: StepStatus;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-500 ${
      status.status === 'done' ? 'border-green-500/30 bg-green-500/5' :
      status.status === 'running' ? 'border-forge-cyan/40 bg-forge-cyan/5' :
      status.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
      'border-white/10 bg-white/2'
    }`}>
      <div className={`mt-0.5 flex-shrink-0 ${
        status.status === 'done' ? 'text-green-400' : status.status === 'running' ? 'text-forge-cyan' :
        status.status === 'error' ? 'text-red-400' : 'text-white/20'
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
          <div className="mt-1">
            {status.data.mot_clef_narratif && <p className="text-xs text-forge-cyan font-medium">"{status.data.mot_clef_narratif}"</p>}
            {status.data.arc_emotionnel && <p className="text-xs text-white/50">{status.data.arc_emotionnel}</p>}
            {status.data.cycle_total && <p className="text-xs text-white/50">Cycle: {status.data.cycle_total}s</p>}
            {status.data.entreprise && <p className="text-xs text-green-400 font-medium">{status.data.entreprise}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Meta Panel ───────────────────────────────────────────────────────────────

function MetaPanel({ pipeline }: { pipeline: PipelineState }) {
  return (
    <div className="space-y-3 h-full">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Méta Créative</h3>

      {pipeline.brain1.status !== 'idle' && (
        <div className={`rounded-xl border p-3 space-y-2 transition-all ${pipeline.brain1.status === 'done' ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">💡 GPT-4o Vision</span>
            {pipeline.brain1.status === 'running' && <Loader2 className="w-3 h-3 text-violet-400 animate-spin ml-auto" />}
            {pipeline.brain1.status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
          </div>
          {pipeline.brain1.data && (
            <div className="space-y-1 text-xs text-white/50">
              {pipeline.brain1.data.references_visuelles && (
                <p>Réf : <span className="text-violet-300">{pipeline.brain1.data.references_visuelles.slice(0, 3).join(', ')}</span></p>
              )}
              {pipeline.brain1.data.univers_visuel && (
                <p className="italic text-white/40 line-clamp-2">"{pipeline.brain1.data.univers_visuel}"</p>
              )}
              {pipeline.brain1.data.differentiateur && (
                <p className="text-white/60">{pipeline.brain1.data.differentiateur}</p>
              )}
            </div>
          )}
        </div>
      )}

      {pipeline.brain2.status !== 'idle' && (
        <div className={`rounded-xl border p-3 space-y-2 transition-all ${pipeline.brain2.status === 'done' ? 'border-pink-500/30 bg-pink-500/5' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-semibold text-pink-300">🎭 Claude Opus</span>
            {pipeline.brain2.status === 'running' && <Loader2 className="w-3 h-3 text-pink-400 animate-spin ml-auto" />}
            {pipeline.brain2.status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
          </div>
          {pipeline.brain2.data && (
            <div className="space-y-1 text-xs text-white/50">
              {pipeline.brain2.data.arc_emotionnel && (
                <p>Arc : <span className="text-pink-300">{pipeline.brain2.data.arc_emotionnel}</span></p>
              )}
              {pipeline.brain2.data.fil_conducteur && (
                <p className="italic text-white/40 line-clamp-2">"{pipeline.brain2.data.fil_conducteur}"</p>
              )}
              {pipeline.brain2.data.variations && (
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {Object.entries(pipeline.brain2.data.variations).map(([k, v]: any) => (
                    <div key={k} className="text-xs">
                      <span className="text-white/30">Var {k} : </span>
                      <span className="text-pink-200">{v.titre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {pipeline.brain3.status !== 'idle' && (
        <div className={`rounded-xl border p-3 space-y-2 transition-all ${pipeline.brain3.status === 'done' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">⚡ Gemini Pro</span>
            {pipeline.brain3.status === 'running' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin ml-auto" />}
            {pipeline.brain3.status === 'done' && <CheckCircle2 className="w-3 h-3 text-green-400 ml-auto" />}
          </div>
          {pipeline.brain3.data && (
            <div className="space-y-1 text-xs text-white/50">
              {pipeline.brain3.data.cycle_total && <p>Cycle : <span className="text-amber-300">{pipeline.brain3.data.cycle_total}s</span></p>}
              {pipeline.brain3.data.notes_techniques && <p className="text-white/40 line-clamp-2">{pipeline.brain3.data.notes_techniques}</p>}
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

// ─── Logo Section ─────────────────────────────────────────────────────────────

function LogoSection({ form, onUpdate }: { form: FormData; onUpdate: (data: Partial<FormData>) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Format invalide", description: "Seules les images sont acceptées", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      onUpdate({ logo_base64: base64, logo_url: '' });
      toast({ title: "Logo importé", description: file.name });
    };
    reader.readAsDataURL(file);
  };

  const currentLogo = form.logo_base64 || form.logo_url;
  const hasLogo = !!currentLogo;

  return (
    <div className="space-y-2">
      <Label className="text-white/40 text-xs uppercase tracking-wider">Logo</Label>
      <div className="flex items-center gap-3">
        {/* Aperçu logo */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
          hasLogo ? 'border-white/20 bg-white/5' : 'border-dashed border-white/20 bg-white/3'
        }`}>
          {hasLogo ? (
            <img
              src={currentLogo}
              alt="Logo"
              className="w-10 h-10 object-contain rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-white/20" />
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          {/* URL du logo (depuis scraper) */}
          <Input
            value={form.logo_url}
            onChange={e => onUpdate({ logo_url: e.target.value, logo_base64: '' })}
            placeholder="URL logo (auto-détecté)"
            className="bg-white/5 border-white/10 text-white text-xs h-7"
            data-testid="input-logo-url"
          />
          {/* Bouton upload manuel */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="h-7 w-full border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 text-xs gap-1.5"
            data-testid="button-upload-logo"
          >
            <Upload className="w-3 h-3" />
            {form.logo_base64 ? 'Remplacer le logo' : 'Importer un logo manuellement'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Style Visuel avec IA ─────────────────────────────────────────────────────

function StyleVisuelSection({ form, onUpdate }: { form: FormData; onUpdate: (data: Partial<FormData>) => void }) {
  const { toast } = useToast();
  const [styleResult, setStyleResult] = useState<StyleDetectResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const detectStyleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/signature/detect-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: form }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<StyleDetectResult>;
    },
    onSuccess: (data) => {
      setStyleResult(data);
      onUpdate({ style_visuel: data.style_visuel });
      toast({ title: "✨ Style détecté par l'IA", description: data.reference_iconique ? `Inspiré de ${data.reference_iconique}` : data.style_visuel });
    },
    onError: (err: any) => {
      toast({ title: "Erreur détection style", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-2">
      <Label className="text-white/40 text-xs uppercase tracking-wider">Style Visuel</Label>
      <div className="flex gap-2">
        <Input
          value={form.style_visuel}
          onChange={e => onUpdate({ style_visuel: e.target.value })}
          placeholder="Décrivez le style ou laissez l'IA le détecter…"
          className="bg-white/5 border-white/10 text-white text-xs h-8 flex-1"
          data-testid="input-style-visuel"
        />
        <Button
          type="button"
          onClick={() => detectStyleMutation.mutate()}
          disabled={detectStyleMutation.isPending}
          className="h-8 px-3 bg-gradient-to-r from-violet-600/80 to-amber-500/80 border border-violet-400/30 text-white hover:opacity-90 text-xs font-semibold gap-1.5 whitespace-nowrap flex-shrink-0"
          data-testid="button-detect-style-ai"
          title="Gemini analyse vos données et révèle le style parfait"
        >
          {detectStyleMutation.isPending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Magie…</>
          ) : (
            <><Wand2 className="w-3.5 h-3.5" /> Utiliser l'IA</>
          )}
        </Button>
      </div>

      {/* Résultat détaillé Gemini */}
      {styleResult && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">{styleResult.reference_iconique}</span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-white/30 hover:text-white/60 transition-colors"
              data-testid="button-toggle-style-details"
            >
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {styleResult.mots_cles?.map((mot, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20">
                {mot}
              </span>
            ))}
          </div>

          {showDetails && (
            <div className="space-y-2 pt-1 border-t border-white/10">
              <p className="text-xs text-white/50 italic">"{styleResult.univers}"</p>
              <p className="text-xs text-white/40">{styleResult.palette_narrative}</p>
              <p className="text-xs text-white/40">{styleResult.justification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Studio ──────────────────────────────────────────────────────────────

const DEFAULT_FORM: FormData = {
  nom: "Jean Dupont", titre: "Directeur Créatif", entreprise: "Studio Nova",
  telephone: "+33 6 12 34 56 78", email: "jean@studionova.fr", site: "https://studionova.fr",
  secteur: "Design & Créatif", cta: "Réserver un appel",
  palette: ["#0f0f0f", "#6366f1", "#e8e8ff"],
  adresse: "", ville: "Paris", pays: "France",
  note: 0, avis: 0, description: "", logo_url: "", logo_base64: "",
  style_visuel: "", slogan: "", mots_cles: [], ton: "professionnel et moderne",
  reseaux_sociaux: {},
  client_email: "",
};

// ─── DeliverySection ──────────────────────────────────────────────────────────

const DELIVERY_STEP_ICONS: Record<string, string> = {
  png: '🖼', formats: '📄', cerebras: '🧠', pdfs: '📋', preview: '🌐', zip: '📦', email: '📧',
};

function DeliverySection({
  svgContent, form, result, onDelivered,
}: {
  svgContent: string;
  form: FormData;
  result: PipelineResult | null;
  onDelivered: (dr: DeliveryResult) => void;
}) {
  const { toast } = useToast();
  const [clientEmail, setClientEmail] = useState(form.client_email || form.email || '');
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const deliveryMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        svg_content: svgContent,
        client_email: clientEmail || undefined,
        metadata: {
          ...form,
          palette: form.palette,
        },
        creative_config: {
          brief: result?.brief_creatif || null,
          scenario: result?.scenario_narratif || null,
          technique: result?.configuration_technique || null,
        },
      };

      const res = await fetch('/api/signature/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      return res.json() as Promise<DeliveryResult>;
    },
    onSuccess: (data) => {
      setDeliveryResult(data);
      onDelivered(data);
      toast({ title: '✅ Livraison complète !', description: 'Votre package God Tier est prêt.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur de livraison', description: err.message, variant: 'destructive' });
    },
  });

  const isRunning = deliveryMutation.isPending;

  const copyLink = () => {
    if (deliveryResult?.preview_url) {
      navigator.clipboard.writeText(deliveryResult.preview_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!svgContent) return null;

  return (
    <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-4 mt-4">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-widest">
          Livraison God Tier
        </h3>
      </div>

      {/* Email client */}
      {!deliveryResult && (
        <div className="space-y-2">
          <Label className="text-white/40 text-xs flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Email client (optionnel)
          </Label>
          <Input
            type="email"
            value={clientEmail}
            onChange={e => setClientEmail(e.target.value)}
            placeholder="client@entreprise.com"
            className="bg-white/5 border-white/10 text-white text-xs h-8"
            data-testid="input-client-email"
          />
          <p className="text-xs text-white/30">
            Si renseigné, l'email de livraison avec les 3 PDFs sera envoyé automatiquement.
          </p>
        </div>
      )}

      {/* Bouton lancer */}
      {!deliveryResult && (
        <Button
          onClick={() => deliveryMutation.mutate()}
          disabled={isRunning}
          className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:opacity-90"
          data-testid="button-launch-delivery"
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Pipeline livraison en cours…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" /> Lancer la Livraison Complète
            </span>
          )}
        </Button>
      )}

      {/* Statut en temps réel */}
      {(isRunning || deliveryResult) && (
        <div className="space-y-2">
          {(deliveryResult?.steps || [
            { step: 'png', label: 'Génération du fallback PNG', status: isRunning ? 'running' : 'pending' },
            { step: 'formats', label: 'Création versions Outlook + Gmail', status: 'pending' },
            { step: 'cerebras', label: 'Cerebras rédige les instructions', status: 'pending' },
            { step: 'pdfs', label: 'Génération des PDFs', status: 'pending' },
            { step: 'preview', label: 'Construction de la page preview', status: 'pending' },
            { step: 'zip', label: 'Assemblage du package ZIP', status: 'pending' },
            { step: 'email', label: 'Envoi de l\'email client', status: 'pending' },
          ] as DeliveryStepStatus[]).map((s) => (
            <div key={s.step} className="flex items-center gap-3 py-1">
              <span className="text-base w-5 text-center">{DELIVERY_STEP_ICONS[s.step] || '•'}</span>
              <span className="text-xs text-white/60 flex-1">{s.label}</span>
              {s.status === 'running' && <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />}
              {s.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
              {s.status === 'error' && <span className="text-xs text-red-400">✗</span>}
              {s.status === 'pending' && <Circle className="w-3.5 h-3.5 text-white/20" />}
            </div>
          ))}
        </div>
      )}

      {/* Résultat */}
      {deliveryResult && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">LIVRAISON COMPLÈTE</span>
            {deliveryResult.email_sent && (
              <span className="ml-auto text-xs text-white/40 flex items-center gap-1">
                <Send className="w-3 h-3" /> Email envoyé
              </span>
            )}
          </div>

          {/* Boutons d'action */}
          <a
            href={deliveryResult.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              className="w-full h-9 bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 text-xs"
              data-testid="button-view-preview"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2" /> Voir la page de prévisualisation
            </Button>
          </a>

          <a
            href={deliveryResult.download_url}
            className="block"
          >
            <Button
              className="w-full h-9 bg-green-600/20 border border-green-500/40 text-green-300 hover:bg-green-600/30 text-xs"
              data-testid="button-download-package"
            >
              <Download className="w-3.5 h-3.5 mr-2" /> Télécharger le package complet
            </Button>
          </a>

          <Button
            onClick={() => deliveryMutation.mutate()}
            variant="outline"
            className="w-full h-9 border-white/15 text-white/40 hover:text-white text-xs"
            data-testid="button-resend-delivery"
          >
            <Send className="w-3.5 h-3.5 mr-2" /> Renvoyer l'email client
          </Button>

          {/* Lien de prévisualisation */}
          <div className="rounded-lg bg-black/30 p-3 space-y-2">
            <p className="text-xs text-white/30">Lien de prévisualisation client</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/60 font-mono flex-1 truncate">
                {deliveryResult.preview_url}
              </p>
              <button
                onClick={copyLink}
                className="text-white/40 hover:text-white transition-colors"
                data-testid="button-copy-preview-link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Contenu du package */}
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs text-white/30 mb-2">Package ZIP contient</p>
            <div className="flex flex-wrap gap-1">
              {deliveryResult.package_contents.map((f) => (
                <span key={f} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/8 font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const idle: StepStatus = { status: 'idle' };

export default function Studio() {
  const { toast } = useToast();
  const [gmbUrl, setGmbUrl] = useState('');
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [canvasPhase, setCanvasPhase] = useState(-1);
  const [svgContent, setSvgContent] = useState('');
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [showFullForm, setShowFullForm] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState>({
    scraping: idle, brain1: idle, brain2: idle, brain3: idle, svgGen: idle,
  });

  const updateForm = (data: Partial<FormData>) => setForm(prev => ({ ...prev, ...data }));
  const setStep = (key: keyof PipelineState, s: StepStatus) => setPipeline(prev => ({ ...prev, [key]: s }));

  // ── Scraping GMB ───
  const scrapeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch('/api/signature/scrape-gmb', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmb_url: url }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onMutate: () => setStep('scraping', { status: 'running' }),
    onSuccess: (data) => {
      setStep('scraping', { status: 'done', data });
      // Remplissage automatique complet du formulaire
      setForm(prev => ({
        ...prev,
        entreprise: data.entreprise || prev.entreprise,
        telephone: data.telephone || prev.telephone,
        email: data.email || prev.email,
        site: data.site || prev.site,
        secteur: data.secteur || prev.secteur,
        palette: data.palette?.length >= 3 ? data.palette : prev.palette,
        ton: data.ton || prev.ton,
        description: data.description || prev.description,
        adresse: data.adresse || prev.adresse,
        ville: data.ville || prev.ville,
        pays: data.pays || prev.pays,
        note: data.note || prev.note,
        avis: data.avis || prev.avis,
        logo_url: data.logo_url || prev.logo_url,
        slogan: data.slogan || prev.slogan,
        mots_cles: data.mots_cles || prev.mots_cles,
        reseaux_sociaux: data.reseaux_sociaux || prev.reseaux_sociaux,
      }));
      setShowFullForm(true);
      toast({ title: "✅ GMB importé", description: `${data.entreprise}${data.note ? ` · ${data.note}★` : ''}${data.ville ? ` · ${data.ville}` : ''}` });
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
      setCanvasPhase(0);
      await delay(400);
      setCanvasPhase(1);

      const res = await fetch('/api/signature/analyze-and-configure', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      setCanvasPhase(2); await delay(300);
      setStep('brain2', { status: 'done', data: data.scenario_narratif });
      setCanvasPhase(4); await delay(300);
      setStep('brain3', { status: 'done', data: data.configuration_technique });
      setCanvasPhase(7); await delay(200);
      setStep('svgGen', { status: 'running' });
      setCanvasPhase(9);

      const exportRes = await fetch('/api/signature/export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: form, brief: data.brief_creatif, scenario: data.scenario_narratif, config: data.configuration_technique }),
      });
      if (!exportRes.ok) throw new Error('Erreur export SVG');
      const exportData = await exportRes.json();

      await delay(400);
      setCanvasPhase(10);
      setStep('svgGen', { status: 'done', data: { cycle_total: data.configuration_technique?.cycle_total } });
      setSvgContent(exportData.svg_content);
      setResult({ ...data, ...exportData });
      toast({ title: "✅ Signature God Tier générée !", description: `Cycle ${data.configuration_technique?.cycle_total || 240}s — 4 variations` });
    },
    onError: (err: any) => {
      setStep('brain1', { status: 'error' });
      toast({ title: "Erreur pipeline", description: err.message, variant: "destructive" });
    },
  });

  const handleReset = () => {
    setCanvasPhase(-1); setSvgContent(''); setResult(null);
    setPipeline({ scraping: idle, brain1: idle, brain2: idle, brain3: idle, svgGen: idle });
  };

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `signature_god_tier_${result?.signature_id || 'export'}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  const isRunning = pipelineMutation.isPending;
  const gmbDone = pipeline.scraping.status === 'done';

  return (
    <div className="space-y-5">
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
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 text-forge-cyan" />
          Import automatique Google My Business
        </h3>
        <div className="flex gap-2">
          <Input
            value={gmbUrl}
            onChange={e => setGmbUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && gmbUrl && scrapeMutation.mutate(gmbUrl)}
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

        {/* Résumé GMB importé */}
        {gmbDone && pipeline.scraping.data && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {pipeline.scraping.data.logo_url || pipeline.scraping.data.logo_base64 ? (
              <img src={pipeline.scraping.data.logo_base64 || pipeline.scraping.data.logo_url} alt="logo" className="w-7 h-7 rounded-lg object-contain bg-white/5 border border-white/10" />
            ) : null}
            <span className="text-green-400 font-semibold">{pipeline.scraping.data.entreprise}</span>
            {pipeline.scraping.data.secteur && <span className="text-white/40">{pipeline.scraping.data.secteur}</span>}
            {pipeline.scraping.data.ville && (
              <span className="text-white/40 flex items-center gap-1"><MapPin className="w-3 h-3" />{pipeline.scraping.data.ville}</span>
            )}
            {pipeline.scraping.data.note > 0 && (
              <span className="text-amber-400 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" />{pipeline.scraping.data.note} ({pipeline.scraping.data.avis} avis)</span>
            )}
            {pipeline.scraping.data.telephone && (
              <span className="text-white/40 flex items-center gap-1"><Phone className="w-3 h-3" />{pipeline.scraping.data.telephone}</span>
            )}
          </div>
        )}
      </div>

      {/* 3 zones principales */}
      <div className="grid grid-cols-12 gap-4">

        {/* GAUCHE — Formulaire + Pipeline (3/12) */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Pipeline Status</h3>
          <StepIndicator icon={Link2} label="Scraping GMB" sublabel="Toutes données entreprise" status={pipeline.scraping} />
          <StepIndicator icon={Brain} label="Cerveau 1 — GPT-4o" sublabel="Brief créatif & analyse logo" status={pipeline.brain1} />
          <StepIndicator icon={Bot} label="Cerveau 2 — Claude Opus" sublabel="Scénario narratif 4 variations" status={pipeline.brain2} />
          <StepIndicator icon={Zap} label="Cerveau 3 — Gemini Pro" sublabel="Config technique optimisée" status={pipeline.brain3} />
          <StepIndicator icon={Sparkles} label="Génération SVG" sublabel="Assemblage final God Tier" status={pipeline.svgGen} />
        </div>

        {/* CENTRE — Canvas + Form (6/12) */}
        <div className="col-span-12 lg:col-span-6 space-y-4">

          {/* Canvas Live */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Canvas Live</h3>
              {canvasPhase >= 10 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Preview Final</span>}
            </div>
            <LiveCanvas phase={canvasPhase} metadata={form} />
            <div className="flex gap-1 mt-3 flex-wrap">
              {CANVAS_PHASES.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= canvasPhase ? 'bg-forge-cyan' : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="text-xs text-white/30 mt-1.5">
              {canvasPhase >= 0 && canvasPhase < CANVAS_PHASES.length ? CANVAS_PHASES[canvasPhase] :
               canvasPhase >= 10 ? 'Cycle 4 variations actif' : 'En attente du lancement'}
            </p>
          </div>

          {/* Formulaire de données */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Données de la signature</h4>
              <button
                onClick={() => setShowFullForm(!showFullForm)}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                data-testid="button-toggle-form"
              >
                {showFullForm ? <><EyeOff className="w-3.5 h-3.5" /> Réduire</> : <><Eye className="w-3.5 h-3.5" /> Voir tout</>}
              </button>
            </div>

            {/* Section Identité */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><User className="w-3 h-3" /> Prénom Nom</Label>
                <Input value={form.nom} onChange={e => updateForm({ nom: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-nom" />
              </div>
              <div>
                <Label className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><Briefcase className="w-3 h-3" /> Titre</Label>
                <Input value={form.titre} onChange={e => updateForm({ titre: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-titre" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><Building2 className="w-3 h-3" /> Entreprise</Label>
                <Input value={form.entreprise} onChange={e => updateForm({ entreprise: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-entreprise" />
              </div>
              <div>
                <Label className="text-white/40 text-xs mb-1 block">Secteur</Label>
                <Input value={form.secteur} onChange={e => updateForm({ secteur: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-secteur" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><Mail className="w-3 h-3" /> Email</Label>
                <Input value={form.email} onChange={e => updateForm({ email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-email" />
              </div>
              <div>
                <Label className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><Phone className="w-3 h-3" /> Téléphone</Label>
                <Input value={form.telephone} onChange={e => updateForm({ telephone: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-telephone" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><Globe className="w-3 h-3" /> Site web</Label>
                <Input value={form.site} onChange={e => updateForm({ site: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-site" />
              </div>
              <div>
                <Label className="text-white/40 text-xs mb-1 block">CTA (Bouton)</Label>
                <Input value={form.cta} onChange={e => updateForm({ cta: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-cta" />
              </div>
            </div>

            {/* Logo */}
            <LogoSection form={form} onUpdate={updateForm} />

            {/* Style visuel + IA */}
            <StyleVisuelSection form={form} onUpdate={updateForm} />

            {/* Champs étendus */}
            {showFullForm && (
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3" /> Adresse</Label>
                    <Input value={form.adresse} onChange={e => updateForm({ adresse: e.target.value })}
                      className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-adresse" />
                  </div>
                  <div>
                    <Label className="text-white/40 text-xs mb-1 block">Ville</Label>
                    <Input value={form.ville} onChange={e => updateForm({ ville: e.target.value })}
                      className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-ville" />
                  </div>
                </div>

                <div>
                  <Label className="text-white/40 text-xs mb-1 block">Slogan / Tagline</Label>
                  <Input value={form.slogan} onChange={e => updateForm({ slogan: e.target.value })}
                    placeholder="Le slogan de l'entreprise…" className="bg-white/5 border-white/10 text-white text-xs h-8" data-testid="input-slogan" />
                </div>

                <div>
                  <Label className="text-white/40 text-xs mb-1 block">Description (GMB)</Label>
                  <Textarea value={form.description} onChange={e => updateForm({ description: e.target.value })}
                    rows={2} placeholder="Description Google My Business…"
                    className="bg-white/5 border-white/10 text-white text-xs resize-none" data-testid="input-description" />
                </div>

                {/* Palette couleurs */}
                <div>
                  <Label className="text-white/40 text-xs mb-2 block">Palette couleurs</Label>
                  <div className="flex gap-2">
                    {form.palette.map((color, i) => (
                      <div key={i} className="flex-1 space-y-1">
                        <div className="w-full h-6 rounded-lg border border-white/20" style={{ background: color }} />
                        <Input
                          type="text"
                          value={color}
                          onChange={e => {
                            const newPalette = [...form.palette];
                            newPalette[i] = e.target.value;
                            updateForm({ palette: newPalette });
                          }}
                          className="bg-white/5 border-white/10 text-white text-xs h-6 font-mono text-center"
                          data-testid={`input-palette-${i}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note GMB */}
                {form.note > 0 && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{form.note}/5 · {form.avis} avis Google</span>
                  </div>
                )}

                {/* Réseaux sociaux */}
                {Object.keys(form.reseaux_sociaux).length > 0 && (
                  <div>
                    <Label className="text-white/40 text-xs mb-1 block">Réseaux détectés</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(form.reseaux_sociaux).map(([net]) => (
                        <span key={net} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">{net}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SVG Preview */}
          {svgContent && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-green-400 uppercase tracking-widest">SVG God Tier Final</h3>
                <span className="text-xs text-white/40 font-mono">{result?.signature_id}</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-white/10" dangerouslySetInnerHTML={{ __html: svgContent }} />
            </div>
          )}

          {/* Section Livraison */}
          {svgContent && (
            <DeliverySection
              svgContent={svgContent}
              form={form}
              result={result}
              onDelivered={(_dr) => {}}
            />
          )}

          {/* CTA principal */}
          <div className="flex gap-3">
            <Button
              onClick={() => pipelineMutation.mutate()}
              disabled={isRunning || !form.nom}
              className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-forge-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90"
              data-testid="button-launch-pipeline"
            >
              {isRunning ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Pipeline IA en cours…</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Lancer la Pipeline 3 Cerveaux</span>
              )}
            </Button>
            {result && (
              <Button onClick={handleReset} variant="outline"
                className="border-white/20 text-white/60 hover:text-white h-12"
                data-testid="button-reset-pipeline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* DROITE — Méta créative + Exports (3/12) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <MetaPanel pipeline={pipeline} />

          {result && (
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Exports</h4>
              <Button onClick={downloadSVG}
                className="w-full h-9 bg-violet-600/30 border border-violet-500/50 text-violet-300 hover:bg-violet-600/40 text-xs"
                data-testid="button-download-svg">
                <Download className="w-3.5 h-3.5 mr-2" /> Télécharger SVG God Tier
              </Button>
              {result.pdf_instructions_url && (
                <a href={result.pdf_instructions_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full h-9 border-white/20 text-white/60 hover:text-white text-xs"
                    data-testid="button-download-guide">
                    <Download className="w-3.5 h-3.5 mr-2" /> Guide installation
                  </Button>
                </a>
              )}
              {result.config_json_url && (
                <a href={result.config_json_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full h-9 border-white/20 text-white/60 hover:text-white text-xs"
                    data-testid="button-download-config">
                    <Cpu className="w-3.5 h-3.5 mr-2" /> Config JSON
                  </Button>
                </a>
              )}
              <div className="rounded-lg bg-black/30 p-3">
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

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
