import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Mail, Smartphone, Monitor, Globe, Zap,
  CheckCircle, Loader2, ExternalLink, Copy, Package,
  Sparkles, ChevronDown, ChevronRight, Eye, Upload, X, Star
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

  const update = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

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
      manualExport.mutate({
        sectorId: form.sectorId,
        data: {
          nom: form.nom, titre: form.titre, entreprise: form.entreprise,
          telephone: form.telephone, email: form.email, site: form.site,
          adresse: form.adresse, ville: form.ville, code_postal: form.code_postal,
          cta: form.cta,
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
