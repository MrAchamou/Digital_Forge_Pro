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

// ─── Effets SVG animés par secteur ──────────────────────────────────────────
function getSectorEffect(sectorId: string, accent: string): string {
  switch (sectorId) {
    case 'tech':
      return `
        <line x1="10" y1="30" x2="35" y2="15" stroke="${accent}" stroke-width="1" opacity="0.4"><animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.8s" repeatCount="indefinite"/></line>
        <line x1="10" y1="30" x2="35" y2="45" stroke="${accent}" stroke-width="1" opacity="0.4"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.1s" repeatCount="indefinite"/></line>
        <line x1="35" y1="15" x2="60" y2="30" stroke="${accent}" stroke-width="1" opacity="0.4"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.6s" repeatCount="indefinite"/></line>
        <line x1="35" y1="45" x2="60" y2="30" stroke="${accent}" stroke-width="1" opacity="0.4"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.9s" repeatCount="indefinite"/></line>
        <circle cx="10" cy="30" r="5" fill="${accent}" opacity="0.8"><animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="35" cy="15" r="4" fill="${accent}" opacity="0.6"><animate attributeName="r" values="3;5.5;3" dur="1.7s" repeatCount="indefinite"/></circle>
        <circle cx="35" cy="45" r="4" fill="${accent}" opacity="0.6"><animate attributeName="r" values="3;5.5;3" dur="2.2s" repeatCount="indefinite"/></circle>
        <circle cx="60" cy="30" r="5" fill="${accent}" opacity="0.85"><animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite"/></circle>`;
    case 'sante':
      return `
        <path d="M0,30 L12,30 L18,14 L24,46 L30,30 L42,30 L47,21 L53,39 L60,30" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round">
          <animate attributeName="stroke-dasharray" values="0 300;300 0;300 0" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" values="0;0;-300" dur="2s" repeatCount="indefinite"/>
        </path>
        <circle cx="30" cy="30" r="9" fill="${accent}" opacity="0.12"><animate attributeName="r" values="6;14;6" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.12;0.03;0.12" dur="1s" repeatCount="indefinite"/></circle>`;
    case 'immobilier':
      return `
        <rect x="4" y="22" width="14" height="34" rx="1" fill="${accent}" opacity="0.45"><animate attributeName="y" values="22;18;22" dur="2.8s" repeatCount="indefinite"/></rect>
        <rect x="22" y="12" width="18" height="44" rx="1" fill="${accent}" opacity="0.7"><animate attributeName="y" values="12;8;12" dur="3.2s" repeatCount="indefinite"/></rect>
        <rect x="44" y="25" width="13" height="31" rx="1" fill="${accent}" opacity="0.45"><animate attributeName="y" values="25;21;25" dur="2.2s" repeatCount="indefinite"/></rect>
        <line x1="0" y1="58" x2="60" y2="58" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>`;
    case 'commerce':
      return `
        <path d="M30,22 L32,28 L38,28 L33,32 L35,38 L30,34 L25,38 L27,32 L22,28 L28,28Z" fill="${accent}" opacity="0.9"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="rotate" values="0 30 30;15 30 30;0 30 30" dur="1.5s" repeatCount="indefinite"/></path>
        <path d="M12,10 L13.5,14 L18,14 L14.5,16.5 L16,21 L12,18 L8,21 L9.5,16.5 L6,14 L10.5,14Z" fill="${accent}" opacity="0.6"><animate attributeName="opacity" values="0;0.8;0" dur="2.1s" repeatCount="indefinite"/></path>
        <path d="M50,8 L51,11 L54,11 L52,13 L53,16 L50,14 L47,16 L48,13 L46,11 L49,11Z" fill="${accent}" opacity="0.6"><animate attributeName="opacity" values="0;0.8;0" dur="1.7s" begin="0.8s" repeatCount="indefinite"/></path>
        <path d="M8,44 L9,47 L12,47 L10,49 L11,52 L8,50 L5,52 L6,49 L4,47 L7,47Z" fill="${accent}" opacity="0.5"><animate attributeName="opacity" values="0;0.7;0" dur="2.4s" begin="0.4s" repeatCount="indefinite"/></path>
        <path d="M52,42 L53,45 L56,45 L54,47 L55,50 L52,48 L49,50 L50,47 L48,45 L51,45Z" fill="${accent}" opacity="0.5"><animate attributeName="opacity" values="0;0.7;0" dur="1.9s" begin="1.2s" repeatCount="indefinite"/></path>`;
    case 'restauration':
      return `
        <path d="M30,58 Q18,42 27,28 Q24,36 32,33 Q26,21 33,8 Q41,22 37,32 Q45,26 40,37 Q50,44 30,58Z" fill="${accent}" opacity="0.85">
          <animate attributeName="d" values="M30,58 Q18,42 27,28 Q24,36 32,33 Q26,21 33,8 Q41,22 37,32 Q45,26 40,37 Q50,44 30,58Z;M30,58 Q20,44 25,30 Q23,38 33,34 Q25,23 32,10 Q42,23 36,34 Q46,27 42,38 Q48,46 30,58Z;M30,58 Q18,42 27,28 Q24,36 32,33 Q26,21 33,8 Q41,22 37,32 Q45,26 40,37 Q50,44 30,58Z" dur="0.4s" repeatCount="indefinite"/>
        </path>
        <ellipse cx="30" cy="55" rx="10" ry="3.5" fill="${accent}" opacity="0.2"><animate attributeName="rx" values="8;13;8" dur="0.4s" repeatCount="indefinite"/></ellipse>`;
    case 'artisanat':
      return `
        <polygon points="30,7 46,17 46,37 30,47 14,37 14,17" fill="none" stroke="${accent}" stroke-width="2" opacity="0.75">
          <animateTransform attributeName="transform" type="rotate" from="0 30 27" to="360 30 27" dur="7s" repeatCount="indefinite"/>
        </polygon>
        <polygon points="30,15 40,21 40,33 30,39 20,33 20,21" fill="${accent}" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from="360 30 27" to="0 30 27" dur="7s" repeatCount="indefinite"/>
        </polygon>
        <circle cx="30" cy="27" r="5" fill="${accent}" opacity="0.9"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/></circle>`;
    case 'education':
      return `
        <rect x="10" y="12" width="40" height="44" rx="3" fill="${accent}" opacity="0.12" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
        <rect x="16" y="22" width="22" height="4" rx="2" fill="${accent}" opacity="0.7"/>
        <rect x="16" y="30" width="28" height="4" rx="2" fill="${accent}" opacity="0.5"/>
        <rect x="16" y="38" width="18" height="4" rx="2" fill="${accent}" opacity="0.5"/>
        <rect x="16" y="46" width="10" height="4" rx="2" fill="${accent}" opacity="0.4"/>
        <rect x="27" y="46" width="3" height="4" rx="1" fill="${accent}" opacity="0.95">
          <animate attributeName="opacity" values="0.95;0;0.95" dur="0.9s" repeatCount="indefinite"/>
        </rect>`;
    case 'loisirs':
      return `
        <circle cx="30" cy="30" r="10" fill="${accent}" opacity="0.12"/>
        <circle cx="30" cy="30" r="20" fill="none" stroke="${accent}" stroke-width="0.75" opacity="0.2" stroke-dasharray="4 3"/>
        <circle cx="50" cy="30" r="6" fill="${accent}" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="2.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="10" r="4.5" fill="${accent}" opacity="0.65">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="2.8s" begin="0.93s" repeatCount="indefinite"/>
        </circle>
        <circle cx="10" cy="30" r="3.5" fill="${accent}" opacity="0.45">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="2.8s" begin="1.87s" repeatCount="indefinite"/>
        </circle>`;
    case 'services_pro':
      return `
        <path d="M0,18 Q15,8 30,18 Q45,28 60,18" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.7" stroke-linecap="round">
          <animate attributeName="d" values="M0,18 Q15,8 30,18 Q45,28 60,18;M0,20 Q15,32 30,20 Q45,8 60,20;M0,18 Q15,8 30,18 Q45,28 60,18" dur="2.2s" repeatCount="indefinite"/>
        </path>
        <path d="M0,30 Q15,20 30,30 Q45,40 60,30" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.45" stroke-linecap="round">
          <animate attributeName="d" values="M0,30 Q15,20 30,30 Q45,40 60,30;M0,28 Q15,40 30,28 Q45,16 60,28;M0,30 Q15,20 30,30 Q45,40 60,30" dur="2.8s" repeatCount="indefinite"/>
        </path>
        <path d="M0,42 Q15,32 30,42 Q45,52 60,42" fill="none" stroke="${accent}" stroke-width="1" opacity="0.25" stroke-linecap="round">
          <animate attributeName="d" values="M0,42 Q15,32 30,42 Q45,52 60,42;M0,40 Q15,52 30,40 Q45,28 60,40;M0,42 Q15,32 30,42 Q45,52 60,42" dur="3.4s" repeatCount="indefinite"/>
        </path>`;
    case 'transport':
      return `
        <line x1="0" y1="22" x2="60" y2="22" stroke="${accent}" stroke-width="1" opacity="0.25"/>
        <line x1="0" y1="30" x2="60" y2="30" stroke="${accent}" stroke-width="2" opacity="0.5"/>
        <line x1="0" y1="38" x2="60" y2="38" stroke="${accent}" stroke-width="1" opacity="0.25"/>
        <circle cx="0" cy="30" r="7" fill="${accent}" opacity="0.9">
          <animate attributeName="cx" values="-7;67;-7" dur="1.4s" repeatCount="indefinite"/>
        </circle>
        <rect x="-22" y="26" width="22" height="8" rx="4" fill="${accent}" opacity="0.3">
          <animate attributeName="x" values="-22;44;-22" dur="1.4s" repeatCount="indefinite"/>
        </rect>`;
    default:
      return `
        <circle cx="30" cy="30" r="13" fill="${accent}" opacity="0.15"><animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="30" cy="30" r="22" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3"><animate attributeName="r" values="16;26;16" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="30" cy="30" r="5" fill="${accent}" opacity="0.85"/>`;
  }
}

// ─── Mini-aperçu SVG dans les cartes secteur (Step 1) ───────────────────────
function SectorMiniPreview({ sector }: { sector: SectorConfig }) {
  const { id, palette, emoji } = sector;
  const bg = palette.background;
  const accent = palette.accent;
  const textColor = palette.text || '#ffffff';
  const effect = getSectorEffect(id, accent);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 72" width="200" height="72" style="display:block">
  <rect width="200" height="72" fill="${bg}"/>
  <rect width="200" height="72" fill="${accent}" opacity="0.09"/>
  <circle cx="28" cy="36" r="19" fill="${accent}" opacity="0.18"/>
  <circle cx="28" cy="36" r="19" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.4">
    <animate attributeName="r" values="17;21;17" dur="2.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.25;0.55;0.25" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <text x="28" y="42" text-anchor="middle" font-size="17" font-family="system-ui,sans-serif">${emoji}</text>
  <rect x="56" y="22" width="56" height="7" rx="3.5" fill="${accent}" opacity="0.8"/>
  <rect x="56" y="33" width="40" height="5" rx="2.5" fill="${textColor}" opacity="0.25"/>
  <rect x="56" y="42" width="50" height="4.5" rx="2.25" fill="${textColor}" opacity="0.14"/>
  <rect x="56" y="51" width="32" height="4" rx="2" fill="${textColor}" opacity="0.09"/>
  <rect x="120" y="5" width="72" height="62" rx="5" fill="${accent}" opacity="0.06"/>
  <g transform="translate(124,7) scale(1.17)">
    ${effect}
  </g>
  <rect x="147" y="7" width="30" height="11" rx="5.5" fill="${accent}" opacity="0.18"/>
  <text x="162" y="15.5" text-anchor="middle" font-size="6" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>LIVE</text>
  <rect x="0" y="70" width="0" height="2" fill="${accent}" opacity="0.75">
    <animate attributeName="width" values="0;200;0" dur="3.5s" repeatCount="indefinite"/>
  </rect>
</svg>`;

  return (
    <div
      className="rounded-t-xl overflow-hidden -mx-5 -mt-5 mb-3"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ─── Preview live complète pour l'étape 3 ───────────────────────────────────
function StudioLivePreview({ sector, data }: { sector: SectorConfig; data: Record<string, string> }) {
  const { id, palette, emoji, cta, tone } = sector;
  const bg = palette.background;
  const accent = palette.accent;
  const textColor = palette.text || '#ffffff';

  const name = data.nom || data.name || sector.label;
  const title = data.titre || data.title || tone?.split(',')[0] || '';
  const phone = data.telephone || '';
  const email = data.email || '';
  const displayName = name.length > 22 ? name.slice(0, 22) + '…' : name;
  const displayTitle = title.length > 30 ? title.slice(0, 30) + '…' : title;
  const displayCta = (cta || 'En savoir plus').slice(0, 20);
  const ctaWidth = Math.min(displayCta.length * 7.2 + 26, 185);

  const effect = getSectorEffect(id, accent);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 192" style="display:block;width:100%">
  <rect width="595" height="192" fill="${bg}" rx="12"/>
  <rect width="595" height="192" fill="${accent}" opacity="0.055" rx="12"/>
  <rect width="595" height="3" fill="${accent}" opacity="0.65" rx="1.5"/>

  <circle cx="72" cy="87" r="44" fill="${accent}" opacity="0.14"/>
  <circle cx="72" cy="87" r="44" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.35">
    <animate attributeName="r" values="41;47;41" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.25;0.55;0.25" dur="3s" repeatCount="indefinite"/>
  </circle>
  <text x="72" y="101" text-anchor="middle" font-size="36" font-family="system-ui,sans-serif">${emoji}</text>

  <text x="134" y="60" font-size="20" font-weight="700" fill="${textColor}" font-family="system-ui,sans-serif" opacity="0.95">${displayName}</text>
  <text x="134" y="80" font-size="12" fill="${accent}" font-family="system-ui,sans-serif" opacity="0.85">${displayTitle}</text>
  <line x1="134" y1="90" x2="432" y2="90" stroke="${accent}" stroke-width="0.75" opacity="0.28"/>

  ${phone ? `<text x="134" y="108" font-size="11" fill="${textColor}" opacity="0.5" font-family="system-ui,sans-serif">📞 ${phone.slice(0, 22)}</text>` : `<rect x="134" y="99" width="115" height="7" rx="3.5" fill="${textColor}" opacity="0.1"/>`}
  ${email ? `<text x="134" y="124" font-size="11" fill="${textColor}" opacity="0.5" font-family="system-ui,sans-serif">✉ ${email.slice(0, 30)}</text>` : `<rect x="134" y="112" width="88" height="7" rx="3.5" fill="${textColor}" opacity="0.07"/>`}

  <rect x="134" y="146" width="${ctaWidth}" height="27" rx="13.5" fill="${accent}">
    <animate attributeName="opacity" values="0.78;1;0.78" dur="2.5s" repeatCount="indefinite"/>
  </rect>
  <text x="${134 + ctaWidth / 2}" y="164" text-anchor="middle" font-size="10" font-weight="600" fill="${bg}" font-family="system-ui,sans-serif">${displayCta}</text>

  <rect x="440" y="14" width="144" height="164" rx="9" fill="${accent}" opacity="0.07"/>
  <g transform="translate(452,30) scale(2.35)">
    ${effect}
  </g>
  <text x="512" y="180" text-anchor="middle" font-size="7.5" fill="${accent}" font-family="system-ui,sans-serif" opacity="0.45">ANIMATION LIVE</text>

  <g opacity="0.55">
    <text x="134" y="187" font-size="6.5" fill="${textColor}" font-family="system-ui,sans-serif" opacity="0.38">GIF :</text>
    <rect x="156" y="180" width="28" height="9" rx="4.5" fill="${accent}" opacity="0.18"/>
    <text x="170" y="187" text-anchor="middle" font-size="6" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif">BUILD</text>
    <rect x="188" y="180" width="24" height="9" rx="4.5" fill="${accent}" opacity="0.28"/>
    <text x="200" y="187" text-anchor="middle" font-size="6" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif">LIVE</text>
    <rect x="216" y="180" width="28" height="9" rx="4.5" fill="${accent}" opacity="0.18"/>
    <text x="230" y="187" text-anchor="middle" font-size="6" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif">SHINE</text>
    <line x1="184" y1="184.5" x2="187" y2="184.5" stroke="${accent}" stroke-width="0.8" opacity="0.35"/>
    <line x1="212" y1="184.5" x2="215" y2="184.5" stroke="${accent}" stroke-width="0.8" opacity="0.35"/>
    <rect x="188" y="181.5" width="24" height="6" rx="3">
      <animate attributeName="x" values="156;188;216;188;156" dur="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      <animate attributeName="width" values="28;24;28;24;28" dur="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      <animate attributeName="fill" values="${accent};${accent};${accent};${accent};${accent}" dur="4.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.45;0;0.45;0" dur="4.5s" repeatCount="indefinite"/>
    </rect>
  </g>

  <rect x="548" y="7" width="40" height="14" rx="7" fill="${accent}" opacity="0.15"/>
  <text x="568" y="17" text-anchor="middle" font-size="7" font-weight="700" fill="${accent}" font-family="system-ui,sans-serif">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>LIVE
  </text>
</svg>`;

  return (
    <div
      className="mb-4 rounded-xl overflow-hidden border"
      style={{ borderColor: `${accent}33` }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
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
          for (const field of (activeSector.fields ?? [])) {
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

  const requiredFilled = (selectedSector?.fields ?? [])
    .filter(f => f.required)
    .every(f => (formData[f.key] ?? "").trim() !== "");

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
                        {/* Mini preview animée par secteur */}
                        <SectorMiniPreview sector={t} />

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
            {(selectedSector.fields ?? []).map((field) => {
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

          {/* Preview live SVG — adapté au secteur */}
          <StudioLivePreview sector={selectedSector} data={formData} />

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
                  {(selectedSector.fields ?? []).map(f => (
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
