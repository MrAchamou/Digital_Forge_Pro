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
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
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

        // Construction de la base de données fusionnées
        const merged: Record<string, string> = { ...formData };

        // Toujours stocker logo_url et logo_base64 (utilisés dans le rendu HBS)
        if (data.logo_url) merged.logo_url = data.logo_url;
        if (data.logo_base64) merged.logo_base64 = data.logo_base64;

        // Aplatir les réseaux sociaux dans les champs directs
        if (data.reseaux_sociaux && typeof data.reseaux_sociaux === 'object') {
          for (const [platform, url] of Object.entries(data.reseaux_sociaux)) {
            if (url && typeof url === 'string') merged[platform] = url;
          }
        }

        // Champs directs depuis les données GMB
        const directFields: Record<string, string | number | string[]> = {
          nom: data.nom || data.entreprise || '',
          entreprise: data.entreprise || '',
          titre: data.titre || '',
          telephone: data.telephone || '',
          email: data.email || '',
          site: data.site || '',
          adresse: data.adresse || '',
          ville: data.ville || '',
          code_postal: data.code_postal || '',
          note: data.note ? String(data.note) : '',
          horaires: Array.isArray(data.horaires) && data.horaires.length > 0
            ? data.horaires.slice(0, 3).join(' | ')
            : (data.horaires || ''),
          secteur: data.secteur || '',
        };
        for (const [key, val] of Object.entries(directFields)) {
          if (val !== undefined && val !== null && val !== '') merged[key] = String(val);
        }

        // Remplissage des champs spécifiques au secteur actif
        if (activeSector) {
          for (const field of activeSector.fields) {
            const val = data[field.key];
            if (val !== undefined && val !== null && val !== '' && !merged[field.key]) {
              merged[field.key] = String(val);
            }
          }
        }

        setFormData(merged);
        setExtractedData(data);

        const filledCount = Object.keys(merged).filter(k => merged[k]).length;
        const logoFound = !!data.logo_url;
        toast({
          title: "Import réussi ✓",
          description: `${filledCount} champs extraits${logoFound ? ' + logo trouvé' : ''} pour "${data.entreprise || data.nom}".`,
        });
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

                {/* Panneau de résultats après import */}
                {extractedData && (
                  <div className="mt-4 p-4 bg-white/[0.04] border border-white/[0.08] rounded-lg">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      {extractedData.logo_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={extractedData.logo_url}
                            alt="logo"
                            className="w-12 h-12 object-contain rounded-md bg-white/10 p-1"
                            data-testid="img-extracted-logo"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                      {!extractedData.logo_url && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                          🏢
                        </div>
                      )}

                      {/* Infos extraites */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate" data-testid="text-extracted-name">
                          {extractedData.entreprise || extractedData.nom || '—'}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5 space-y-0.5">
                          {extractedData.telephone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-[#00D4FF]" />
                              <span data-testid="text-extracted-phone">{extractedData.telephone}</span>
                            </div>
                          )}
                          {extractedData.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-[#00D4FF]" />
                              <span className="truncate" data-testid="text-extracted-email">{extractedData.email}</span>
                            </div>
                          )}
                          {extractedData.site && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-[#00D4FF]" />
                              <span className="truncate" data-testid="text-extracted-site">{extractedData.site}</span>
                            </div>
                          )}
                          {extractedData.adresse && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-[#00D4FF]" />
                              <span data-testid="text-extracted-address">{extractedData.adresse}{extractedData.ville ? `, ${extractedData.ville}` : ''}</span>
                            </div>
                          )}
                          {extractedData.note > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span data-testid="text-extracted-rating">{extractedData.note}/5 ({extractedData.avis} avis)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badge logo */}
                      <div className="flex-shrink-0 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${extractedData.logo_url ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-white/30'}`} data-testid="badge-logo-status">
                          {extractedData.logo_url ? '✓ Logo' : 'Pas de logo'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sector grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {templates.map((t) => {
                  const isSelected = selectedSector?.id === t.id;
                  const firstExample = t.description.split(',')[0].trim();
                  const toneLabel = t.tone.split(',')[0].trim();
                  return (
                    <button
                      key={t.id}
                      onClick={() => selectSector(t)}
                      className="relative group text-left overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(155deg, ${t.palette.background} 0%, ${t.palette.background}ee 100%)`,
                        borderColor: isSelected ? t.palette.accent : `${t.palette.accent}28`,
                        boxShadow: isSelected
                          ? `0 0 0 1px ${t.palette.accent}60, 0 4px 24px ${t.palette.accent}25, 0 0 60px ${t.palette.accent}10`
                          : `0 2px 12px rgba(0,0,0,0.3)`,
                      }}
                      data-testid={`sector-card-${t.id}`}
                    >
                      {/* Top accent shimmer line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent 0%, ${t.palette.accent}90 40%, ${t.palette.accent} 50%, ${t.palette.accent}90 60%, transparent 100%)` }}
                      />

                      {/* Hover radial glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={{ background: `radial-gradient(ellipse at 50% -10%, ${t.palette.accent}22 0%, transparent 65%)` }}
                      />

                      {/* Top-right corner accent orb */}
                      <div
                        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `radial-gradient(circle, ${t.palette.accent}20, transparent 70%)` }}
                      />

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div
                          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                          style={{ background: t.palette.accent, color: t.palette.background }}
                        >
                          ✓
                        </div>
                      )}

                      <div className="relative p-5">
                        {/* Emoji bubble */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                          style={{
                            background: `linear-gradient(135deg, ${t.palette.accent}25, ${t.palette.accent}10)`,
                            boxShadow: `0 0 0 1px ${t.palette.accent}35, 0 2px 8px ${t.palette.accent}15`,
                          }}
                        >
                          {t.emoji}
                        </div>

                        {/* Label */}
                        <div className="text-sm font-bold leading-tight mb-1 text-white">
                          {t.label}
                        </div>

                        {/* Example */}
                        <div className="text-[11px] text-white/40 mb-3 leading-snug">
                          {firstExample}
                        </div>

                        {/* Tone badge */}
                        <div
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider mb-4"
                          style={{
                            background: `${t.palette.accent}18`,
                            color: t.palette.accent,
                            border: `1px solid ${t.palette.accent}35`,
                          }}
                        >
                          {toneLabel}
                        </div>

                        {/* Field count dots + CTA */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(t.fieldCount ?? 6, 8) }).map((_, i) => (
                              <div
                                key={i}
                                className="rounded-full transition-all duration-300"
                                style={{
                                  width: i < 4 ? '5px' : '4px',
                                  height: i < 4 ? '5px' : '4px',
                                  background: i < 4 ? t.palette.accent : `${t.palette.accent}35`,
                                }}
                              />
                            ))}
                            <span className="text-[9px] ml-1 text-white/30">{t.fieldCount ?? 6}</span>
                          </div>
                          <div
                            className="text-[9px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-0.5"
                            style={{ color: t.palette.accent }}
                          >
                            CHOISIR <span className="text-[10px]">›</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom accent bar for selected */}
                      {isSelected && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ background: `linear-gradient(90deg, transparent, ${t.palette.accent}, transparent)` }}
                        />
                      )}
                    </button>
                  );
                })}
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

            {/* Résumé des données extraites */}
            {extractedData && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                {extractedData.logo_url ? (
                  <img
                    src={extractedData.logo_url}
                    alt="logo"
                    className="w-10 h-10 object-contain rounded bg-white/10 p-0.5 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{extractedData.entreprise || extractedData.nom}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">
                    {[extractedData.telephone, extractedData.email, extractedData.ville].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full ${extractedData.logo_url ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-white/30'}`}>
                  {extractedData.logo_url ? '✓ Logo' : 'Pas de logo'}
                </span>
              </div>
            )}
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
