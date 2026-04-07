import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Eye, Download, ArrowLeft, Monitor, Smartphone, Mail,
  Sun, Moon, Maximize2, RefreshCw, Check, Settings2
} from "lucide-react";

interface SignatureMeta {
  nom: string;
  titre: string;
  entreprise: string;
  signature_id: string;
  email: string;
  telephone: string;
}

type Background = 'white' | 'dark' | 'email' | 'transparent';
type Viewport = 'desktop' | 'mobile' | 'email';

const BG_STYLES: Record<Background, { bg: string; label: string; icon: any }> = {
  white:       { bg: '#ffffff', label: 'Fond blanc',       icon: Sun },
  dark:        { bg: '#0d0d0d', label: 'Fond sombre',      icon: Moon },
  email:       { bg: '#f4f4f5', label: 'Fond email',       icon: Mail },
  transparent: { bg: 'transparent', label: 'Transparent', icon: Maximize2 },
};

const VIEWPORT_W: Record<Viewport, number> = {
  desktop: 700,
  mobile:  375,
  email:   600,
};

export default function Preview() {
  const [svgContent, setSvgContent] = useState<string>('');
  const [meta, setMeta] = useState<SignatureMeta | null>(null);
  const [scale, setScale] = useState(100);
  const [speedPct, setSpeedPct] = useState(100);
  const [bg, setBg] = useState<Background>('white');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const svg = localStorage.getItem('reality_preview_svg') || '';
    const rawMeta = localStorage.getItem('reality_preview_meta');
    setSvgContent(svg);
    if (rawMeta) {
      try { setMeta(JSON.parse(rawMeta)); } catch { /* noop */ }
    }
  }, []);

  const processedSvg = (() => {
    if (!svgContent) return '';
    let s = svgContent;
    if (speedPct !== 100) {
      const factor = 100 / speedPct;
      s = s.replace(/animation-duration:\s*([\d.]+)s/g, (_, d) => `animation-duration:${(parseFloat(d) * factor).toFixed(2)}s`);
      s = s.replace(/dur="([\d.]+)s"/g, (_, d) => `dur="${(parseFloat(d) * factor).toFixed(2)}s"`);
    }
    return s;
  })();

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signature_god_tier_${meta?.signature_id || 'export'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setValidated(true);
  };

  const hasSvg = Boolean(svgContent);
  const vw = VIEWPORT_W[viewport];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/studio">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white gap-2" data-testid="button-back-to-studio">
              <ArrowLeft className="w-4 h-4" /> Retour au Studio
            </Button>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-forge-cyan animate-pulse" />
            <span className="text-forge-cyan text-sm font-semibold tracking-wide">REALITY PREVIEW</span>
          </div>
        </div>
        {meta && (
          <div className="text-right">
            <p className="text-white/80 text-sm font-medium">{meta.nom}{meta.titre ? ` · ${meta.titre}` : ''}</p>
            <p className="text-white/30 text-xs font-mono">{meta.signature_id}</p>
          </div>
        )}
      </div>

      {!hasSvg ? (
        /* État vide — aucune signature chargée */
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Eye className="w-16 h-16 text-white/10" />
          <p className="text-white/30 text-center">
            Aucune signature chargée.<br />
            Générez-en une depuis le <Link href="/studio"><span className="text-forge-cyan underline cursor-pointer">Studio Signature Vivante</span></Link>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">

          {/* ── PANNEAU GAUCHE — Contrôles ── */}
          <div className="col-span-12 lg:col-span-3 space-y-4">

            {/* Fond de prévisualisation */}
            <Card className="glass-morphism border-white/10 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Settings2 className="w-3.5 h-3.5" /> Fond
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {(Object.entries(BG_STYLES) as [Background, typeof BG_STYLES[Background]][]).map(([key, val]) => {
                  const Icon = val.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setBg(key)}
                      data-testid={`button-bg-${key}`}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${bg === key ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/10' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="leading-tight text-center">{val.label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Viewport */}
            <Card className="glass-morphism border-white/10 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5" /> Contexte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {([['desktop', Monitor, 'Bureau (700px)'], ['mobile', Smartphone, 'Mobile (375px)'], ['email', Mail, 'Email (600px)']] as [Viewport, any, string][]).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    onClick={() => setViewport(v)}
                    data-testid={`button-viewport-${v}`}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${viewport === v ? 'border-forge-cyan text-forge-cyan bg-forge-cyan/10' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Échelle */}
            <Card className="glass-morphism border-white/10 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5" /> Échelle — {scale}%
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Slider
                  value={[scale]}
                  onValueChange={([v]) => setScale(v)}
                  min={40} max={150} step={5}
                  className="w-full"
                  data-testid="slider-scale"
                />
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>40%</span><span>100%</span><span>150%</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScale(100)}
                  className="w-full text-xs text-white/40 hover:text-white h-7"
                  data-testid="button-reset-scale"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Réinitialiser
                </Button>
              </CardContent>
            </Card>

            {/* Vitesse animation */}
            <Card className="glass-morphism border-white/10 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Vitesse animation — {speedPct}%
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Slider
                  value={[speedPct]}
                  onValueChange={([v]) => setSpeedPct(v)}
                  min={25} max={200} step={25}
                  className="w-full"
                  data-testid="slider-speed"
                />
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>Lent</span><span>Normal</span><span>Rapide</span>
                </div>
              </CardContent>
            </Card>

            {/* Infos */}
            {meta && (
              <Card className="glass-morphism border-white/10 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-white/50 uppercase tracking-widest">Infos signature</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs text-white/50">
                  {meta.nom && <p><span className="text-white/30">Nom :</span> {meta.nom}</p>}
                  {meta.titre && <p><span className="text-white/30">Titre :</span> {meta.titre}</p>}
                  {meta.entreprise && <p><span className="text-white/30">Société :</span> {meta.entreprise}</p>}
                  {meta.email && <p><span className="text-white/30">Email :</span> {meta.email}</p>}
                  {meta.telephone && <p><span className="text-white/30">Tél :</span> {meta.telephone}</p>}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── ZONE CENTRALE — Prévisualisation ── */}
          <div className="col-span-12 lg:col-span-9 space-y-4">

            {/* Viewport indicator */}
            <div className="flex items-center gap-2 justify-center">
              <Badge variant="outline" className="border-white/20 text-white/40 text-xs">
                {viewport === 'desktop' ? '🖥' : viewport === 'mobile' ? '📱' : '📧'} {vw}px
              </Badge>
              {speedPct !== 100 && (
                <Badge variant="outline" className="border-forge-cyan/40 text-forge-cyan text-xs">
                  ⚡ Vitesse {speedPct}%
                </Badge>
              )}
              {scale !== 100 && (
                <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-xs">
                  ⊕ Échelle {scale}%
                </Badge>
              )}
            </div>

            {/* Canvas preview */}
            <Card className="glass-morphism border-white/10 bg-transparent overflow-hidden">
              <CardContent className="p-0">
                <div className="flex justify-center py-8 px-4 transition-colors duration-300" style={{ background: '#111' }}>
                  <div
                    className="transition-all duration-300 rounded-xl overflow-hidden shadow-2xl"
                    style={{
                      width: vw,
                      maxWidth: '100%',
                      background: BG_STYLES[bg].bg,
                      transform: `scale(${scale / 100})`,
                      transformOrigin: 'top center',
                      border: bg === 'transparent' ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                    }}
                    data-testid="signature-preview-container"
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: processedSvg }}
                      style={{ display: 'block', lineHeight: 0 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contexte email simulé */}
            {viewport === 'email' && (
              <Card className="glass-morphism border-white/10 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Simulation email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-white/10" style={{ background: '#f4f4f5' }}>
                    <div className="px-6 pt-4 pb-2" style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                      <p className="text-[11px] text-gray-500 mb-0.5">De : {meta?.nom || 'Votre Nom'} &lt;{meta?.email || 'vous@exemple.com'}&gt;</p>
                      <p className="text-[11px] text-gray-500 mb-0.5">À : client@exemple.com</p>
                      <p className="text-sm font-semibold text-gray-800">Objet : Proposition commerciale</p>
                    </div>
                    <div className="px-6 py-4" style={{ background: '#fff' }}>
                      <p className="text-sm text-gray-700 mb-4">Bonjour,</p>
                      <p className="text-sm text-gray-700 mb-4">Suite à notre échange, je vous transmets en pièce jointe notre offre détaillée. N'hésitez pas à me contacter pour tout complément d'information.</p>
                      <p className="text-sm text-gray-700 mb-4">Bien cordialement,</p>
                      <div
                        className="border-t border-gray-100 pt-3"
                        dangerouslySetInnerHTML={{ __html: processedSvg }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions de validation */}
            <div className="flex gap-3">
              <Button
                onClick={downloadSVG}
                className="flex-1 h-12 bg-gradient-to-r from-forge-cyan to-violet-600 text-white font-semibold text-sm rounded-xl hover:opacity-90"
                data-testid="button-validate-export"
              >
                {validated ? (
                  <><Check className="w-4 h-4 mr-2" /> Signature validée &amp; exportée !</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Valider &amp; Télécharger le SVG final</>
                )}
              </Button>
              <Link href="/studio">
                <Button
                  variant="outline"
                  className="h-12 border-white/20 text-white/60 hover:text-white px-6"
                  data-testid="button-back-to-studio-bottom"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Studio
                </Button>
              </Link>
            </div>

            {validated && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                <p className="text-green-400 font-semibold text-sm">
                  ✅ Signature God Tier validée — SVG téléchargé avec succès
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Intégrez ce fichier SVG directement dans votre client email (Gmail, Outlook, Apple Mail)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
