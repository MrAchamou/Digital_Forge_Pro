import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, Check, Loader2, Copy, Download,
  RefreshCw, Link2, Mail, Phone, Globe, MapPin, Star,
  User, Briefcase, Building2, Clock, Tag, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SectorConfig {
  id: string;
  label: string;
  emoji: string;
  description: string;
  palette: { background: string; accent: string; text: string; muted: string };
  animation: { name: string; intensity: string };
  fields: Array<{ key: string; label: string; required: boolean; type: string }>;
  tone: string;
  cta: string;
  fieldCount: number;
}

const FIELD_ICONS: Record<string, any> = {
  phone: Phone, email: Mail, url: Globe, text: User,
  badge: Tag, hours: Clock, rating: Star,
};

const STEP_LABELS = ["Secteur", "Informations", "Aperçu & Export"];

export default function Studio() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSector, setSelectedSector] = useState<SectorConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);
  const [gmbUrl, setGmbUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: templatesData, isLoading } = useQuery<{ templates: SectorConfig[] }>({
    queryKey: ["/api/signature/templates"],
  });

  const templates = templatesData?.templates ?? [];

  const renderPreview = useCallback(async (sectorId: string, data: Record<string, string>) => {
    setIsRendering(true);
    try {
      const res = await fetch("/api/signature/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectorId, data }),
      });
      if (res.ok) {
        const html = await res.text();
        setPreviewHtml(html);
      }
    } catch (e) {
      console.error("render error", e);
    } finally {
      setIsRendering(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedSector || step !== 3) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      renderPreview(selectedSector.id, formData);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [formData, selectedSector, step, renderPreview]);

  useEffect(() => {
    if (selectedSector && step === 3 && !previewHtml) {
      renderPreview(selectedSector.id, formData);
    }
  }, [step]);

  const handleGmbImport = async () => {
    if (!gmbUrl.trim()) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/signature/scrape-gmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmb_url: gmbUrl }),
      });
      const data = await res.json();
      if (data.entreprise || data.nom) {
        let activeSector = selectedSector;

        // Auto-détection du secteur depuis les données GMB
        try {
          const res2 = await fetch("/api/signature/classify-sector", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ metadata: data }),
          });
          const classified = await res2.json();
          if (classified.sectorId) {
            const found = templates.find(t => t.id === classified.sectorId);
            if (found) { setSelectedSector(found); activeSector = found; }
          }
        } catch (_) {}

        // Remplissage des champs si on a un secteur actif
        if (activeSector) {
          const merged: Record<string, string> = { ...formData };
          for (const field of activeSector.fields) {
            const val = data[field.key];
            if (val !== undefined && val !== null && val !== '') {
              merged[field.key] = String(val);
            }
          }
          if (!merged.nom && data.entreprise) merged.nom = data.entreprise;
          setFormData(merged);
        }

        toast({ title: "Import réussi", description: `Données de "${data.entreprise || data.nom}" importées.` });
      } else {
        toast({ title: "Aucune donnée trouvée", description: "Vérifiez l'URL Google Maps.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Erreur import", description: "Impossible d'importer l'URL GMB.", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCopy = async () => {
    if (!previewHtml) return;
    await navigator.clipboard.writeText(previewHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié !", description: "Le HTML de la signature est dans votre presse-papiers." });
  };

  const handleDownload = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signature-${selectedSector?.id ?? "email"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Téléchargé !", description: "signature.html sauvegardé." });
  };

  const selectSector = (sector: SectorConfig) => {
    setSelectedSector(sector);
    setFormData({});
    setPreviewHtml("");
    setStep(2);
  };

  const goToStep3 = () => {
    setStep(3);
  };

  const requiredFilled = selectedSector?.fields
    .filter(f => f.required)
    .every(f => (formData[f.key] ?? "").trim() !== "") ?? false;

  return (
    <div className="min-h-screen" data-testid="studio-page">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold tracking-widest text-[#FF006E] uppercase">
            Générateur de Signatures
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">
          {selectedSector ? `${selectedSector.emoji} ${selectedSector.label}` : "Signature Email"}
        </h1>
        <p className="text-white/40 text-sm">
          {selectedSector ? selectedSector.tone : "Choisissez votre secteur pour générer une signature professionnelle calibrée"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const isDone = step > n;
          const isActive = step === n;
          return (
            <div key={n} className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isDone || (n === 2 && selectedSector)) setStep(n as 1 | 2 | 3);
                }}
                className="flex items-center gap-2 group"
                disabled={n > step && !(n === 2 && selectedSector)}
                data-testid={`step-btn-${n}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isDone ? "bg-[#FF006E] text-white" :
                    isActive ? "bg-white text-black" :
                    "bg-white/10 text-white/30"}`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : n}
                </div>
                <span className={`text-sm transition-colors hidden sm:block
                  ${isActive ? "text-white font-medium" :
                    isDone ? "text-[#FF006E]" : "text-white/30"}`}>
                  {label}
                </span>
              </button>
              {i < 2 && (
                <div className={`hidden sm:block h-px w-10 transition-colors ${isDone ? "bg-[#FF006E]" : "bg-white/10"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1 — Sélection du secteur */}
      {step === 1 && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF006E]" />
            </div>
          ) : (
            <>
              {/* GMB import */}
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-sm font-semibold text-white">Import Google My Business</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#00D4FF]/10 text-[#00D4FF] rounded-full">Optionnel</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://maps.google.com/... ou URL courte maps.app.goo.gl/..."
                    value={gmbUrl}
                    onChange={e => setGmbUrl(e.target.value)}
                    className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 flex-1"
                    data-testid="input-gmb-url"
                  />
                  <Button
                    onClick={handleGmbImport}
                    disabled={!gmbUrl.trim() || isImporting}
                    className="bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 hover:bg-[#00D4FF]/20"
                    data-testid="btn-import-gmb"
                  >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Importer"}
                  </Button>
                </div>
                <p className="text-xs text-white/30 mt-2">
                  {selectedSector ? `Secteur sélectionné : ${selectedSector.label}` : "Importez votre fiche Google pour auto-détecter le secteur"}
                </p>
              </div>

              {/* Sector grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectSector(t)}
                    className="relative group p-4 rounded-xl border transition-all duration-200 text-left overflow-hidden hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      background: `${t.palette.background}cc`,
                      borderColor: `${t.palette.accent}44`,
                    }}
                    data-testid={`sector-card-${t.id}`}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `radial-gradient(circle at 50% 50%, ${t.palette.accent}18, transparent 70%)` }}
                    />
                    <div className="text-2xl mb-2">{t.emoji}</div>
                    <div className="text-xs font-bold text-white mb-1 leading-tight">{t.label}</div>
                    <div className="text-[10px] leading-relaxed" style={{ color: t.palette.muted }}>
                      {t.description.split(',')[0].split('.')[0]}
                    </div>
                    <div
                      className="mt-3 flex items-center gap-1"
                      style={{ color: t.palette.accent }}
                    >
                      <div className="w-4 h-0.5 rounded-full" style={{ background: t.palette.accent }} />
                      <span className="text-[9px] font-semibold tracking-wider uppercase">{t.animation?.name ?? '—'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2 — Formulaire */}
      {step === 2 && selectedSector && (
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="text-white/40 hover:text-white"
              data-testid="btn-back-step1"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Changer de secteur
            </Button>
          </div>

          {/* Sector banner */}
          <div
            className="rounded-xl p-5 mb-6 border"
            style={{
              background: `linear-gradient(135deg, ${selectedSector.palette.background}, ${selectedSector.palette.muted}22)`,
              borderColor: `${selectedSector.palette.accent}44`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedSector.emoji}</span>
              <div>
                <div className="font-bold text-white">{selectedSector.label}</div>
                <div className="text-xs" style={{ color: selectedSector.palette.accent }}>
                  {selectedSector.tone} · Animation : {selectedSector.animation?.name ?? '—'}
                </div>
              </div>
              <div className="ml-auto">
                <div className="w-8 h-8 rounded-full border" style={{ background: selectedSector.palette.accent, borderColor: `${selectedSector.palette.accent}66` }} />
              </div>
            </div>
          </div>

          {/* GMB import for step 2 */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="text-xs font-semibold text-white/70">Import Google My Business</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="URL Google Maps ou maps.app.goo.gl/..."
                value={gmbUrl}
                onChange={e => setGmbUrl(e.target.value)}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 text-sm flex-1"
                data-testid="input-gmb-url-step2"
              />
              <Button
                onClick={handleGmbImport}
                disabled={!gmbUrl.trim() || isImporting}
                size="sm"
                className="bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 hover:bg-[#00D4FF]/20"
                data-testid="btn-import-gmb-step2"
              >
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Importer"}
              </Button>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {selectedSector.fields.map((field) => {
              const IconComp = FIELD_ICONS[field.type] || User;
              return (
                <div key={field.key} data-testid={`field-${field.key}`}>
                  <Label className="text-white/60 text-xs font-medium flex items-center gap-1.5 mb-1.5">
                    <IconComp className="w-3.5 h-3.5" />
                    {field.label}
                    {field.required && <span style={{ color: selectedSector.palette.accent }}>*</span>}
                  </Label>
                  <Input
                    placeholder={field.type === 'phone' ? '06 12 34 56 78' :
                      field.type === 'email' ? 'contact@entreprise.fr' :
                      field.type === 'url' ? 'https://...' :
                      field.type === 'hours' ? 'Lun-Ven 9h-18h' :
                      field.type === 'rating' ? '4.8' :
                      field.label}
                    type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                    value={formData[field.key] ?? ""}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#FF006E]/50"
                    style={{ borderColor: formData[field.key] ? `${selectedSector.palette.accent}66` : undefined }}
                    data-testid={`input-${field.key}`}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              onClick={goToStep3}
              className="flex-1 text-black font-bold py-3"
              style={{ background: selectedSector.palette.accent }}
              data-testid="btn-preview"
            >
              Voir l'aperçu <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!requiredFilled && (
              <p className="self-center text-xs text-white/30">
                Remplissez les champs obligatoires (*)
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 3 — Aperçu & Export */}
      {step === 3 && selectedSector && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(2)}
              className="text-white/40 hover:text-white"
              data-testid="btn-back-step2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Modifier les infos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => renderPreview(selectedSector.id, formData)}
              disabled={isRendering}
              className="text-white/40 hover:text-white"
              data-testid="btn-refresh-preview"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRendering ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  Aperçu en direct
                </span>
                {isRendering && (
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Rendu...
                  </div>
                )}
              </div>

              {/* White bg preview */}
              <div className="rounded-xl overflow-hidden border border-white/10 mb-3">
                <div className="px-3 py-2 bg-white/[0.04] border-b border-white/[0.06] flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="text-[10px] text-white/20 ml-2">Fond blanc (Gmail, Outlook)</span>
                </div>
                <div className="bg-white p-6 overflow-x-auto">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-0"
                      style={{ height: `${(selectedSector?.fieldCount ?? 6) * 30 + 120}px`, minHeight: "180px", maxHeight: "320px" }}
                      title="Aperçu signature fond blanc"
                      data-testid="preview-iframe-white"
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Dark bg preview */}
              <div className="rounded-xl overflow-hidden border border-white/10">
                <div className="px-3 py-2 bg-white/[0.04] border-b border-white/[0.06] flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="text-[10px] text-white/20 ml-2">Fond sombre</span>
                </div>
                <div className="bg-[#111827] p-6 overflow-x-auto">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-0"
                      style={{ height: `${(selectedSector?.fieldCount ?? 6) * 30 + 120}px`, minHeight: "180px", maxHeight: "320px" }}
                      title="Aperçu signature fond sombre"
                      data-testid="preview-iframe-dark"
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Export panel */}
            <div className="space-y-4">
              <div
                className="rounded-xl p-5 border"
                style={{
                  background: `${selectedSector.palette.background}dd`,
                  borderColor: `${selectedSector.palette.accent}33`,
                }}
              >
                <div className="text-sm font-bold text-white mb-1">{selectedSector.emoji} {selectedSector.label}</div>
                <div className="text-xs mb-4" style={{ color: selectedSector.palette.muted }}>
                  {selectedSector.tone}
                </div>
                <div className="space-y-1 text-xs text-white/40 mb-4">
                  {selectedSector.fields.map(f => (
                    <div key={f.key} className="flex justify-between">
                      <span>{f.label}</span>
                      <span style={{ color: formData[f.key] ? selectedSector.palette.accent : undefined }}>
                        {formData[f.key] ? "✓" : f.required ? "—" : "vide"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCopy}
                  className="w-full font-semibold"
                  style={{ background: selectedSector.palette.accent, color: selectedSector.palette.background }}
                  disabled={!previewHtml}
                  data-testid="btn-copy-html"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copié !" : "Copier le HTML"}
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full border-white/10 text-white/70 hover:text-white hover:border-white/20"
                  disabled={!previewHtml}
                  data-testid="btn-download-html"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger .html
                </Button>

                <a
                  href={`/api/signature/preview-sector/${selectedSector.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    className="w-full text-white/40 hover:text-white text-xs"
                    data-testid="btn-open-preview"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Ouvrir dans un nouvel onglet
                  </Button>
                </a>
              </div>

              <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xs font-semibold text-white/60 mb-2">Instructions d'installation</div>
                <ol className="text-xs text-white/30 space-y-1.5 list-decimal list-inside">
                  <li>Copiez le HTML de la signature</li>
                  <li>Ouvrez Gmail → Paramètres → Signature</li>
                  <li>Collez dans l'éditeur HTML (mode source)</li>
                  <li>Enregistrez et testez un envoi</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
