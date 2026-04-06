import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Sparkles, Eye, EyeOff, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SOCIAL_OPTIONS = ["linkedin", "instagram", "twitter", "facebook", "github", "youtube"];

const AMBIANCE_PRESETS = [
  { value: "tech_premium", label: "Tech Premium — Épuré, futuriste, confiance" },
  { value: "creative_bold", label: "Créatif Audacieux — Coloré, dynamique, artistique" },
  { value: "corporate_elegant", label: "Corporate Élégant — Sobre, professionnel, luxe" },
  { value: "nature_organic", label: "Nature Organique — Doux, écologique, chaleureux" },
  { value: "startup_energetic", label: "Startup Énergique — Moderne, agile, impactant" },
  { value: "luxury_minimal", label: "Luxe Minimal — Noir, blanc, or, raffinement absolu" },
  { value: "custom", label: "Description personnalisée…" },
];

interface FormData {
  nom: string;
  titre: string;
  entreprise: string;
  email: string;
  telephone: string;
  site: string;
  reseaux: string[];
  cta: string;
  logo_url: string;
  photo_url: string;
  palette: string[];
  ambiance: string;
  ambiance_custom: string;
  intensite: "low" | "medium" | "high";
  secteur: string;
}

async function generateSignature(formData: FormData) {
  const ambiance = formData.ambiance === "custom"
    ? formData.ambiance_custom
    : AMBIANCE_PRESETS.find(a => a.value === formData.ambiance)?.label || formData.ambiance;

  const body = {
    signature: {
      nom: formData.nom,
      titre: formData.titre,
      entreprise: formData.entreprise,
      email: formData.email,
      telephone: formData.telephone,
      site: formData.site,
      reseaux: formData.reseaux,
      cta: formData.cta,
      logo_url: formData.logo_url || undefined,
      photo_url: formData.photo_url || undefined,
    },
    style: {
      palette: formData.palette,
      ambiance,
      intensite: formData.intensite,
      secteur: formData.secteur,
    },
  };

  const res = await fetch("/api/signature/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur de génération");
  }

  return res.json();
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer relative overflow-hidden"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span className="text-xs text-white/50">{label}</span>
    </div>
  );
}

export default function Signature() {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<{ svg_content: string; filename: string; metadata: any } | null>(null);

  const [form, setForm] = useState<FormData>({
    nom: "Jean Dupont",
    titre: "Directeur Créatif",
    entreprise: "Studio Nova",
    email: "jean@studionova.fr",
    telephone: "+33 6 12 34 56 78",
    site: "https://studionova.fr",
    reseaux: ["linkedin", "instagram"],
    cta: "Réserver un appel",
    logo_url: "",
    photo_url: "",
    palette: ["#0f172a", "#6366f1", "#e2e8f0"],
    ambiance: "tech_premium",
    ambiance_custom: "",
    intensite: "medium",
    secteur: "Design & Créatif",
  });

  const mutation = useMutation({
    mutationFn: generateSignature,
    onSuccess: (data) => {
      setResult(data);
      setShowPreview(true);
      toast({ title: "Signature générée !", description: data.filename });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleReseau = (r: string) => {
    const current = form.reseaux;
    if (current.includes(r)) {
      updateField("reseaux", current.filter(x => x !== r));
    } else {
      updateField("reseaux", [...current, r]);
    }
  };

  const updatePaletteColor = (index: number, color: string) => {
    const newPalette = [...form.palette];
    newPalette[index] = color;
    updateField("palette", newPalette);
  };

  const downloadSVG = () => {
    if (!result) return;
    const blob = new Blob([result.svg_content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forge-cyan/10 border border-forge-cyan/30 text-forge-cyan text-sm font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          Signature Vivante
        </div>
        <h1 className="text-3xl font-bold text-white">
          Génération de Signature Email
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          Transformez vos données en une signature SVG autonome animée, 
          compatible Gmail, Outlook et Apple Mail — sans JavaScript.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-5">

          {/* Identity */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-forge-cyan uppercase tracking-widest">Identité</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/70 text-xs mb-1 block">Nom complet *</Label>
                <Input
                  value={form.nom}
                  onChange={e => updateField("nom", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs mb-1 block">Titre *</Label>
                <Input
                  value={form.titre}
                  onChange={e => updateField("titre", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  placeholder="Directeur Créatif"
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs mb-1 block">Entreprise</Label>
                <Input
                  value={form.entreprise}
                  onChange={e => updateField("entreprise", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  placeholder="Studio Nova"
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs mb-1 block">Secteur</Label>
                <Input
                  value={form.secteur}
                  onChange={e => updateField("secteur", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  placeholder="Design & Créatif"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-forge-cyan uppercase tracking-widest">Contact</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/70 text-xs mb-1 block">Email</Label>
                <Input
                  value={form.email}
                  onChange={e => updateField("email", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  type="email"
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs mb-1 block">Téléphone</Label>
                <Input
                  value={form.telephone}
                  onChange={e => updateField("telephone", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-white/70 text-xs mb-1 block">Site web</Label>
                <Input
                  value={form.site}
                  onChange={e => updateField("site", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  placeholder="https://mon-site.fr"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-white/70 text-xs mb-1 block">URL Photo (optionnel)</Label>
                <Input
                  value={form.photo_url}
                  onChange={e => updateField("photo_url", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  placeholder="https://…/photo.jpg"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-white/70 text-xs mb-1 block">URL Logo (optionnel)</Label>
                <Input
                  value={form.logo_url}
                  onChange={e => updateField("logo_url", e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-sm"
                  placeholder="https://…/logo.png"
                />
              </div>
            </div>

            {/* CTA */}
            <div>
              <Label className="text-white/70 text-xs mb-1 block">Bouton CTA</Label>
              <Input
                value={form.cta}
                onChange={e => updateField("cta", e.target.value)}
                className="bg-white/5 border-white/20 text-white text-sm"
                placeholder="Réserver un appel"
              />
            </div>
          </div>

          {/* Social */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-forge-cyan uppercase tracking-widest">Réseaux sociaux</h2>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_OPTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => toggleReseau(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.reseaux.includes(r)
                      ? "bg-forge-cyan/20 border-forge-cyan text-forge-cyan"
                      : "bg-white/5 border-white/20 text-white/50 hover:border-white/40"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-forge-cyan uppercase tracking-widest">Style visuel</h2>

            {/* Palette */}
            <div>
              <Label className="text-white/70 text-xs mb-2 block">Palette de couleurs</Label>
              <div className="flex gap-4 items-center">
                <ColorPicker
                  value={form.palette[0]}
                  onChange={c => updatePaletteColor(0, c)}
                  label="Fond"
                />
                <ColorPicker
                  value={form.palette[1]}
                  onChange={c => updatePaletteColor(1, c)}
                  label="Accent"
                />
                <ColorPicker
                  value={form.palette[2]}
                  onChange={c => updatePaletteColor(2, c)}
                  label="Texte"
                />
                <div className="ml-2">
                  <div
                    className="w-24 h-10 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${form.palette[0]} 0%, ${form.palette[1]} 50%, ${form.palette[2]} 100%)`
                    }}
                  />
                  <span className="text-xs text-white/40">Aperçu</span>
                </div>
              </div>
            </div>

            {/* Ambiance */}
            <div>
              <Label className="text-white/70 text-xs mb-1 block">Ambiance</Label>
              <Select value={form.ambiance} onValueChange={v => updateField("ambiance", v)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-forge-black border-white/20">
                  {AMBIANCE_PRESETS.map(a => (
                    <SelectItem key={a.value} value={a.value} className="text-white text-sm">
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.ambiance === "custom" && (
                <Textarea
                  className="mt-2 bg-white/5 border-white/20 text-white text-sm"
                  placeholder="Décrivez l'ambiance souhaitée…"
                  value={form.ambiance_custom}
                  onChange={e => updateField("ambiance_custom", e.target.value)}
                  rows={2}
                />
              )}
            </div>

            {/* Intensité */}
            <div>
              <Label className="text-white/70 text-xs mb-2 block">Intensité des effets</Label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => updateField("intensite", lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      form.intensite === lvl
                        ? "bg-forge-cyan/20 border-forge-cyan text-forge-cyan"
                        : "bg-white/5 border-white/20 text-white/50 hover:border-white/40"
                    }`}
                  >
                    {lvl === "low" ? "Subtil" : lvl === "medium" ? "Équilibré" : "Intense"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.nom}
            className="w-full h-12 bg-gradient-to-r from-forge-cyan to-forge-electric text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération en cours…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Générer la Signature Vivante
              </span>
            )}
          </Button>
        </div>

        {/* RIGHT: Preview */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-forge-cyan uppercase tracking-widest">
                Prévisualisation SVG
              </h2>
              {result && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="border-white/20 text-white/70 hover:text-white text-xs"
                  >
                    {showPreview ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {showPreview ? "Masquer" : "Afficher"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={downloadSVG}
                    className="bg-forge-cyan/20 border border-forge-cyan/50 text-forge-cyan hover:bg-forge-cyan/30 text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Télécharger SVG
                  </Button>
                </div>
              )}
            </div>

            {!result && !mutation.isPending && (
              <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-3">
                <Sparkles className="w-12 h-12 opacity-30" />
                <p className="text-sm">Remplissez le formulaire et générez votre signature</p>
              </div>
            )}

            {mutation.isPending && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-forge-cyan/30 border-t-forge-cyan rounded-full animate-spin" />
                <div className="text-sm text-white/60 space-y-1 text-center">
                  <p>Génération de la signature…</p>
                  <p className="text-xs text-white/40">Création des 4 variations d'effets</p>
                </div>
              </div>
            )}

            {result && showPreview && (
              <div className="flex-1 flex flex-col gap-4">
                {/* SVG Preview */}
                <div
                  className="rounded-xl overflow-hidden border border-white/10"
                  dangerouslySetInnerHTML={{ __html: result.svg_content }}
                />

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Cycle total", value: `${result.metadata.cycle_total}s` },
                    { label: "Variations", value: result.metadata.variations_count },
                    { label: "Dimensions", value: result.metadata.dimensions },
                    { label: "Compatibilité", value: result.metadata.compatible_clients.join(", ") },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg bg-white/5 px-3 py-2">
                      <p className="text-xs text-white/40">{item.label}</p>
                      <p className="text-sm text-white font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* SVG Source */}
                <details className="rounded-lg border border-white/10 overflow-hidden">
                  <summary className="px-4 py-2 text-xs text-white/50 cursor-pointer hover:text-white/70 bg-white/5">
                    Voir le code SVG source
                  </summary>
                  <pre className="text-xs text-white/50 p-4 overflow-auto max-h-40 bg-black/20">
                    {result.svg_content.slice(0, 2000)}
                    {result.svg_content.length > 2000 ? "\n…[tronqué]" : ""}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              À propos du SVG généré
            </h3>
            <ul className="text-xs text-white/50 space-y-1">
              <li>• <strong className="text-white/70">4 variations</strong> d'effets visuels en CSS natif SVG</li>
              <li>• <strong className="text-white/70">Cycle de 240s</strong> avant répétition exacte</li>
              <li>• <strong className="text-white/70">Zéro JavaScript</strong> — compatible tous clients email</li>
              <li>• <strong className="text-white/70">Largeur 600px</strong> — standard email universel</li>
              <li>• Transitions fluides de 2s entre chaque variation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
