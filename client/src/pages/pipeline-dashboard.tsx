import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Loader2, CheckCircle, AlertCircle, Clock, Package,
  ExternalLink, Copy, Trash2, RefreshCw, Zap, Mail, Download,
  ChevronDown, ChevronUp, X, Eye, EyeOff, FileText, Edit3,
  Save, User, Building, Phone, Globe, MapPin, Hash, Euro,
  StickyNote, Filter, Search, Tag,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PipelineClient {
  id: string;
  numero_commande: string;
  mode: 'demo' | 'reel';
  statut_crm: 'en_attente' | 'en_cours' | 'livre' | 'confirme' | 'annule';
  notes_interne: string;
  montant: string;
  nom: string;
  prenom: string;
  titre: string;
  entreprise: string;
  secteur: string;
  telephone: string;
  email: string;
  site: string;
  ville: string;
  logo_url: string;
  palette: string[];
  banniere_texte: string;
  banniere_lien: string;
  cta: string;
  destinataire_nom: string;
  destinataire_email: string;
  objet_mail: string;
  corps_mail: string;
  status: 'pending' | 'en_cours' | 'livre' | 'erreur';
  signature_id: string | null;
  gif_url: string | null;
  demo_url: string | null;
  zip_url: string | null;
  copier_url: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const SECTEURS = [
  { id: 'sante',      label: 'Santé / Médecine',   color: '#0ea5e9' },
  { id: 'juridique',  label: 'Juridique / Droit',  color: '#94a3b8' },
  { id: 'immobilier', label: 'Immobilier',          color: '#d97706' },
  { id: 'finance',    label: 'Finance / Banque',    color: '#0f766e' },
  { id: 'tech',       label: 'Tech / IT',           color: '#7c3aed' },
  { id: 'creatif',    label: 'Créatif / Marketing', color: '#db2777' },
  { id: 'autre',      label: 'Autre',               color: '#334155' },
];

const STATUT_CRM_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  en_attente: { label: 'En attente',  color: '#f59e0b', bg: '#f59e0b12', border: '#f59e0b30' },
  en_cours:   { label: 'En cours',    color: '#3b82f6', bg: '#3b82f612', border: '#3b82f630' },
  livre:      { label: 'Livré',       color: '#22c55e', bg: '#22c55e12', border: '#22c55e30' },
  confirme:   { label: 'Confirmé ✓',  color: '#a855f7', bg: '#a855f712', border: '#a855f730' },
  annule:     { label: 'Annulé',      color: '#6b7280', bg: '#6b728012', border: '#6b728030' },
};

const TECH_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: '#f59e0b' },
  en_cours: { label: 'Génération…', color: '#3b82f6' },
  livre:    { label: 'Généré ✓',   color: '#22c55e' },
  erreur:   { label: 'Erreur',     color: '#ef4444' },
};

// ── Formulaire Nouveau Client ─────────────────────────────────────────────────

interface FormState {
  mode: 'demo' | 'reel';
  white_label: boolean;
  prenom: string; nom: string; titre: string; entreprise: string;
  secteur: string; telephone: string; email: string; site: string; ville: string;
  logo_url: string; banniere_texte: string; banniere_lien: string; cta: string;
  destinataire_nom: string; destinataire_email: string; objet_mail: string; corps_mail: string;
  notes_interne: string; montant: string;
}

const EMPTY_FORM: FormState = {
  mode: 'demo', white_label: false,
  prenom: '', nom: '', titre: '', entreprise: '', secteur: 'sante',
  telephone: '', email: '', site: '', ville: '', logo_url: '',
  banniere_texte: '', banniere_lien: '', cta: 'Nous contacter',
  destinataire_nom: '', destinataire_email: '', objet_mail: '', corps_mail: '',
  notes_interne: '', montant: '',
};

function NouveauClientForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [section, setSection] = useState<'identite' | 'contacts' | 'demo' | 'commande'>('identite');
  const update = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));
  const updateBool = (k: keyof FormState, v: boolean) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (data: FormState) => {
      const res = await apiRequest('POST', '/api/pipeline/generate', data);
      return res.json();
    },
    onSuccess: (data) => {
      const label = form.mode === 'reel' ? 'réelle' : 'démo';
      toast({ title: `✅ Commande ${label} lancée !`, description: `N° ${data.numero_commande} · Signature en cours de génération.` });
      onSuccess();
      onClose();
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const inp = "w-full bg-black/20 border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-forge-purple/60 transition-colors";
  const lbl = "text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block";
  const tabs = [
    { id: 'identite', label: '1. Identité' },
    { id: 'contacts', label: '2. Contacts' },
    { id: 'commande', label: '3. Commande' },
    { id: 'demo',     label: '4. Mail démo' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Nouveau client</h2>
            <p className="text-xs text-white/40 mt-0.5">Le pipeline génère les livrables automatiquement</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors" data-testid="btn-fermer-form">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] flex-shrink-0 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setSection(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all ${
                section === tab.id ? 'text-white border-b-2 border-forge-purple' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── Identité ── */}
          {section === 'identite' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Prénom *</label>
                  <input className={inp} value={form.prenom} onChange={e => update('prenom', e.target.value)} placeholder="Jean" data-testid="input-prenom" />
                </div>
                <div>
                  <label className={lbl}>Nom *</label>
                  <input className={inp} value={form.nom} onChange={e => update('nom', e.target.value)} placeholder="Martin" data-testid="input-nom" />
                </div>
              </div>
              <div>
                <label className={lbl}>Titre professionnel *</label>
                <input className={inp} value={form.titre} onChange={e => update('titre', e.target.value)} placeholder="Médecin Généraliste" data-testid="input-titre" />
              </div>
              <div>
                <label className={lbl}>Entreprise / Cabinet</label>
                <input className={inp} value={form.entreprise} onChange={e => update('entreprise', e.target.value)} placeholder="Cabinet Martin" data-testid="input-entreprise" />
              </div>
              <div>
                <label className={lbl}>Secteur *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTEURS.map(s => (
                    <button key={s.id} type="button" onClick={() => update('secteur', s.id)} data-testid={`btn-secteur-${s.id}`}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border"
                      style={{
                        background: form.secteur === s.id ? `${s.color}20` : 'transparent',
                        borderColor: form.secteur === s.id ? `${s.color}60` : 'rgba(255,255,255,0.08)',
                        color: form.secteur === s.id ? s.color : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={lbl}>CTA bouton</label>
                <input className={inp} value={form.cta} onChange={e => update('cta', e.target.value)} placeholder="Nous contacter" data-testid="input-cta" />
              </div>
            </>
          )}

          {/* ── Contacts ── */}
          {section === 'contacts' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Téléphone</label>
                  <input className={inp} value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="+33 6 00 00 00 00" data-testid="input-telephone" />
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input className={inp} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="jean@cabinet.fr" data-testid="input-email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Site web</label>
                  <input className={inp} type="url" value={form.site} onChange={e => update('site', e.target.value)} placeholder="https://cabinet-martin.fr" data-testid="input-site" />
                </div>
                <div>
                  <label className={lbl}>Ville</label>
                  <input className={inp} value={form.ville} onChange={e => update('ville', e.target.value)} placeholder="Paris" data-testid="input-ville" />
                </div>
              </div>
              <div>
                <label className={lbl}>URL du logo (optionnel)</label>
                <input className={inp} type="url" value={form.logo_url} onChange={e => update('logo_url', e.target.value)} placeholder="https://..." data-testid="input-logo-url" />
              </div>
              <div className="border-t border-white/[0.06] pt-4">
                <label className={lbl}>Bannière dynamique (optionnel)</label>
                <input className={inp} value={form.banniere_texte} onChange={e => update('banniere_texte', e.target.value)} placeholder="Consultation en ligne disponible" data-testid="input-banniere-texte" />
                <input className={`${inp} mt-2`} type="url" value={form.banniere_lien} onChange={e => update('banniere_lien', e.target.value)} placeholder="https://..." data-testid="input-banniere-lien" />
              </div>
            </>
          )}

          {/* ── Commande ── */}
          {section === 'commande' && (
            <>
              {/* Mode démo/réel */}
              <div>
                <label className={lbl}>Mode de la commande</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update('mode', 'demo')}
                    data-testid="btn-mode-demo"
                    className="flex flex-col items-start px-4 py-4 rounded-xl border-2 transition-all"
                    style={{
                      background: form.mode === 'demo' ? '#f59e0b12' : 'transparent',
                      borderColor: form.mode === 'demo' ? '#f59e0b60' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <EyeOff size={14} className={form.mode === 'demo' ? 'text-amber-400' : 'text-white/30'} />
                      <span className={`font-bold text-sm ${form.mode === 'demo' ? 'text-amber-400' : 'text-white/40'}`}>Mode DÉMO</span>
                    </div>
                    <p className="text-[11px] text-white/30 text-left leading-relaxed">
                      Génère la signature sans enregistrement commercial. Préfixe <code className="text-white/50">DEM-</code>
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => update('mode', 'reel')}
                    data-testid="btn-mode-reel"
                    className="flex flex-col items-start px-4 py-4 rounded-xl border-2 transition-all"
                    style={{
                      background: form.mode === 'reel' ? '#22c55e12' : 'transparent',
                      borderColor: form.mode === 'reel' ? '#22c55e60' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Eye size={14} className={form.mode === 'reel' ? 'text-green-400' : 'text-white/30'} />
                      <span className={`font-bold text-sm ${form.mode === 'reel' ? 'text-green-400' : 'text-white/40'}`}>Mode RÉEL</span>
                    </div>
                    <p className="text-[11px] text-white/30 text-left leading-relaxed">
                      Enregistre la commande dans la base de données CRM. Préfixe <code className="text-white/50">CMD-</code>
                    </p>
                  </button>
                </div>
                {form.mode === 'demo' && (
                  <div className="mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/80">
                    ⚠️ En mode démo, la commande est visible dans le CRM mais ne compte pas comme une vente réelle.
                  </div>
                )}
                {form.mode === 'reel' && (
                  <div className="mt-3 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300/80">
                    ✅ En mode réel, la commande est enregistrée avec un numéro <strong>CMD-</strong> et un suivi commercial complet.
                  </div>
                )}
              </div>

              {/* Montant */}
              <div>
                <label className={lbl}>Montant (optionnel)</label>
                <div className="relative">
                  <Euro size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className={`${inp} pl-9`} value={form.montant} onChange={e => update('montant', e.target.value)}
                    placeholder="149,00 €" data-testid="input-montant" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateBool('white_label', !form.white_label)}
                data-testid="btn-white-label"
                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left"
                style={{
                  background: form.white_label ? '#8b5cf612' : 'transparent',
                  borderColor: form.white_label ? '#8b5cf660' : 'rgba(255,255,255,0.08)',
                }}
              >
                <span className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 ${form.white_label ? 'bg-forge-purple border-forge-purple' : 'border-white/20'}`} />
                <span>
                  <span className={`block text-sm font-bold ${form.white_label ? 'text-white' : 'text-white/60'}`}>Option white-label +50€</span>
                  <span className="block text-[11px] text-white/35 leading-relaxed mt-1">
                    Remplace les mentions EffectForge AI par le nom du client dans les pages livrées et fichiers d'installation.
                  </span>
                </span>
              </button>

              {/* Notes internes */}
              <div>
                <label className={lbl}>Notes internes (optionnel)</label>
                <textarea
                  className={`${inp} resize-none`}
                  rows={4}
                  value={form.notes_interne}
                  onChange={e => update('notes_interne', e.target.value)}
                  placeholder="Ex: Client recommandé par Dr. Durand, veut un style sobre…"
                  data-testid="input-notes"
                />
              </div>
            </>
          )}

          {/* ── Mail de démo ── */}
          {section === 'demo' && (
            <>
              <p className="text-xs text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 leading-relaxed">
                Le mail de démo simule un vrai email Gmail avec votre signature en bas. C'est ce que vous envoyez au client pour le convaincre.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Nom du destinataire</label>
                  <input className={inp} value={form.destinataire_nom} onChange={e => update('destinataire_nom', e.target.value)} placeholder="Marie Dupont" data-testid="input-dest-nom" />
                </div>
                <div>
                  <label className={lbl}>Email du destinataire</label>
                  <input className={inp} type="email" value={form.destinataire_email} onChange={e => update('destinataire_email', e.target.value)} placeholder="marie@exemple.com" data-testid="input-dest-email" />
                </div>
              </div>
              <div>
                <label className={lbl}>Objet du mail (auto-généré si vide)</label>
                <input className={inp} value={form.objet_mail} onChange={e => update('objet_mail', e.target.value)} placeholder="Suite à votre consultation..." data-testid="input-objet-mail" />
              </div>
              <div>
                <label className={lbl}>Corps du mail (auto-généré si vide)</label>
                <textarea
                  className={`${inp} resize-none`}
                  rows={5}
                  value={form.corps_mail}
                  onChange={e => update('corps_mail', e.target.value)}
                  placeholder={"Bonjour Marie,\n\nSuite à votre consultation, je vous transmets..."}
                  data-testid="input-corps-mail"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <div className="flex gap-2">
            {section !== 'identite' && (
              <button
                onClick={() => {
                  const order = ['identite', 'contacts', 'commande', 'demo'];
                  setSection(order[order.indexOf(section) - 1] as any);
                }}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 border border-white/[0.08] transition-colors"
              >
                ← Retour
              </button>
            )}
          </div>
          <div className="flex gap-3 items-center">
            {section !== 'demo' ? (
              <button
                onClick={() => {
                  const order = ['identite', 'contacts', 'commande', 'demo'];
                  setSection(order[order.indexOf(section) + 1] as any);
                }}
                disabled={!form.nom || !form.titre}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-forge-purple/80 hover:bg-forge-purple text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isPending || !form.nom || !form.titre}
                data-testid="btn-lancer-pipeline"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: form.mode === 'reel' ? 'linear-gradient(135deg, #22c55e, #0ea5e9)' : 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              >
                {mutation.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Lancement…</>
                  : <><Zap size={14} /> Lancer {form.mode === 'reel' ? 'commande réelle' : 'démo'}</>
                }
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Composant Statut CRM éditable ─────────────────────────────────────────────

function StatutCrmSelect({ clientId, value, onChange }: { clientId: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (statut_crm: string) => {
      const res = await apiRequest('PATCH', `/api/pipeline/clients/${clientId}/statut`, { statut_crm });
      return res.json();
    },
    onSuccess: (_, statut) => {
      onChange(statut);
      qc.invalidateQueries({ queryKey: ['/api/pipeline/clients'] });
      setOpen(false);
    },
    onError: () => toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' }),
  });

  const cfg = STATUT_CRM_CONFIG[value] || STATUT_CRM_CONFIG['en_attente'];

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        data-testid={`btn-statut-crm-${clientId.slice(0,8)}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all hover:brightness-125"
        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
      >
        {cfg.label}
        <ChevronDown size={9} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-full mt-1.5 left-0 z-50 bg-[#0d0d1a] border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl min-w-[140px]"
          >
            {Object.entries(STATUT_CRM_CONFIG).map(([key, c]) => (
              <button
                key={key}
                onClick={() => mutation.mutate(key)}
                className="w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-white/[0.06] flex items-center gap-2"
                style={{ color: c.color }}
                data-testid={`statut-option-${key}`}
              >
                {c.label}
                {value === key && <CheckCircle size={10} className="ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Fiche client expandable ───────────────────────────────────────────────────

function ClientCard({ client, onDelete }: { client: PipelineClient; onDelete: (id: string) => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [statutCrm, setStatutCrm] = useState(client.statut_crm);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(client.notes_interne || '');
  const [montant, setMontant] = useState(client.montant || '');

  const techCfg = TECH_STATUS_CONFIG[client.status] || TECH_STATUS_CONFIG['pending'];
  const secteurColor = SECTEURS.find(s => s.id === client.secteur)?.color || '#334155';
  const secteurLabel = SECTEURS.find(s => s.id === client.secteur)?.label || client.secteur;

  const initials = (client.nom || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();

  const dateCreated = new Date(client.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `✓ ${label} copié`, description: text.slice(0, 60) });
  };

  const notesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', `/api/pipeline/clients/${client.id}/notes`, { notes_interne: notes, montant });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/pipeline/clients'] });
      setEditingNotes(false);
      toast({ title: '✅ Notes sauvegardées' });
    },
    onError: () => toast({ title: 'Erreur', description: 'Sauvegarde échouée', variant: 'destructive' }),
  });

  return (
    <div
      className="border border-white/[0.06] rounded-xl overflow-hidden transition-all"
      data-testid={`card-client-${client.id.slice(0,8)}`}
    >
      {/* Ligne principale */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.035] transition-colors">

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: secteurColor }}
        >
          {initials}
        </div>

        {/* Identité */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white truncate">{client.nom}</p>
            {/* Badge mode */}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
              style={{
                background: client.mode === 'reel' ? '#22c55e18' : '#f59e0b18',
                color: client.mode === 'reel' ? '#22c55e' : '#f59e0b',
                border: `1px solid ${client.mode === 'reel' ? '#22c55e30' : '#f59e0b30'}`,
              }}
            >
              {client.mode === 'reel' ? 'RÉEL' : 'DÉMO'}
            </span>
          </div>
          <p className="text-[10px] text-white/40 truncate">
            {client.titre}{client.entreprise ? ` · ${client.entreprise}` : ''}
            {client.ville ? ` · ${client.ville}` : ''}
          </p>
        </div>

        {/* N° commande */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          <Hash size={9} className="text-white/20" />
          <span className="text-[10px] font-mono text-white/40">{client.numero_commande}</span>
        </div>

        {/* Secteur */}
        <span
          className="text-[9px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 hidden lg:block"
          style={{ background: `${secteurColor}20`, color: secteurColor }}
        >
          {secteurLabel}
        </span>

        {/* Date */}
        <span className="text-[10px] text-white/25 flex-shrink-0 hidden xl:block">{dateCreated}</span>

        {/* Statut CRM */}
        <div className="flex-shrink-0">
          <StatutCrmSelect clientId={client.id} value={statutCrm} onChange={setStatutCrm} />
        </div>

        {/* Statut technique */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0 text-[9px] font-medium border border-white/[0.06]"
          style={{ color: techCfg.color }}
        >
          {client.status === 'en_cours' && <Loader2 size={8} className="animate-spin" />}
          {client.status === 'livre' && <CheckCircle size={8} />}
          {client.status === 'erreur' && <AlertCircle size={8} />}
          {client.status === 'pending' && <Clock size={8} />}
          <span className="hidden sm:inline">{techCfg.label}</span>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {client.demo_url && (
            <a href={client.demo_url} target="_blank" rel="noopener noreferrer"
              title="Voir le mail de démo" data-testid={`btn-demo-${client.id.slice(0,8)}`}
              className="p-2 rounded-lg text-white/30 hover:text-forge-cyan hover:bg-forge-cyan/10 transition-all"
            >
              <Mail size={13} />
            </a>
          )}
          {client.zip_url && (
            <a href={client.zip_url} target="_blank" rel="noopener noreferrer"
              title="Télécharger ZIP" data-testid={`btn-zip-${client.id.slice(0,8)}`}
              className="p-2 rounded-lg text-white/30 hover:text-forge-purple hover:bg-forge-purple/10 transition-all"
            >
              <Download size={13} />
            </a>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Réduire' : 'Voir détails'}
            className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
            data-testid={`btn-expand-${client.id.slice(0,8)}`}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={() => onDelete(client.id)}
            title="Supprimer"
            data-testid={`btn-supprimer-${client.id.slice(0,8)}`}
            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Fiche expandable */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-5 bg-black/20 border-t border-white/[0.04] space-y-5">

              {/* Infos commande */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3">
                  <p className="text-[9px] text-white/35 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Hash size={8} /> N° Commande
                  </p>
                  <p className="text-sm font-mono font-bold text-white">{client.numero_commande || '—'}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3">
                  <p className="text-[9px] text-white/35 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Tag size={8} /> Mode
                  </p>
                  <p className="text-sm font-bold" style={{ color: client.mode === 'reel' ? '#22c55e' : '#f59e0b' }}>
                    {client.mode === 'reel' ? '● RÉEL' : '○ DÉMO'}
                  </p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3">
                  <p className="text-[9px] text-white/35 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Euro size={8} /> Montant
                  </p>
                  {editingNotes ? (
                    <input
                      value={montant}
                      onChange={e => setMontant(e.target.value)}
                      placeholder="149 €"
                      className="w-full bg-transparent text-sm font-bold text-white outline-none border-b border-forge-purple/60"
                    />
                  ) : (
                    <p className="text-sm font-bold text-white">{montant || '—'}</p>
                  )}
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3">
                  <p className="text-[9px] text-white/35 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock size={8} /> Date création
                  </p>
                  <p className="text-sm font-bold text-white">{dateCreated}</p>
                </div>
              </div>

              {/* Profil client */}
              <div>
                <p className="text-[9px] text-white/35 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={9} /> Profil client
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                  {[
                    { icon: User,     label: 'Nom complet',  value: client.nom },
                    { icon: Building, label: 'Entreprise',   value: client.entreprise },
                    { icon: FileText, label: 'Titre',        value: client.titre },
                    { icon: Phone,    label: 'Téléphone',    value: client.telephone },
                    { icon: Mail,     label: 'Email',        value: client.email },
                    { icon: Globe,    label: 'Site',         value: client.site },
                    { icon: MapPin,   label: 'Ville',        value: client.ville },
                  ].filter(f => f.value).map(field => (
                    <div key={field.label} className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2">
                      <field.icon size={10} className="text-white/25 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider">{field.label}</p>
                        <p className="text-white/80 font-medium truncate">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes internes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-white/35 uppercase tracking-wider flex items-center gap-1.5">
                    <StickyNote size={9} /> Notes internes
                  </p>
                  <div className="flex gap-2">
                    {editingNotes ? (
                      <>
                        <button onClick={() => { setNotes(client.notes_interne || ''); setMontant(client.montant || ''); setEditingNotes(false); }}
                          className="text-[10px] text-white/40 hover:text-white/70 transition-colors">
                          Annuler
                        </button>
                        <button onClick={() => notesMutation.mutate()}
                          disabled={notesMutation.isPending}
                          className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-forge-purple/30 text-forge-purple border border-forge-purple/40 hover:bg-forge-purple/50 transition-all"
                          data-testid={`btn-save-notes-${client.id.slice(0,8)}`}
                        >
                          {notesMutation.isPending ? <Loader2 size={9} className="animate-spin" /> : <Save size={9} />}
                          Sauvegarder
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditingNotes(true)}
                        className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
                        data-testid={`btn-edit-notes-${client.id.slice(0,8)}`}
                      >
                        <Edit3 size={9} /> Modifier
                      </button>
                    )}
                  </div>
                </div>
                {editingNotes ? (
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Notes internes, observations, suivi…"
                    className="w-full bg-black/20 border border-forge-purple/40 rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder-white/20 focus:outline-none resize-none"
                    data-testid={`textarea-notes-${client.id.slice(0,8)}`}
                  />
                ) : (
                  <p className="text-xs text-white/50 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2.5 min-h-[48px] whitespace-pre-wrap">
                    {notes || <span className="text-white/20 italic">Aucune note · cliquer sur Modifier pour ajouter</span>}
                  </p>
                )}
              </div>

              {/* Livrables */}
              {(client.gif_url || client.demo_url || client.zip_url || client.copier_url || client.error) && (
                <div>
                  <p className="text-[9px] text-white/35 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Download size={9} /> Livrables générés
                  </p>
                  <div className="space-y-2">
                    {client.gif_url && <DelivLink label="GIF animé" url={client.gif_url} color="#00d4ff" onCopy={copy} />}
                    {client.demo_url && <DelivLink label="Mail de démo" url={client.demo_url} color="#a855f7" onCopy={copy} />}
                    {client.zip_url && <DelivLink label="Package ZIP" url={client.zip_url} color="#22c55e" onCopy={copy} isDownload />}
                    {client.copier_url && <DelivLink label="Copier-coller" url={client.copier_url} color="#f59e0b" onCopy={copy} />}
                  </div>
                </div>
              )}

              {/* Aperçu signature animée CSS live */}
              {client.signature_id && (
                <div>
                  <p className="text-[9px] text-white/35 uppercase tracking-wider mb-2">
                    Aperçu signature <span className="text-forge-cyan/60 normal-case">· animé CSS</span>
                  </p>
                  <div className="max-w-sm w-full rounded-xl border border-white/[0.08] bg-white overflow-hidden" style={{ height: '220px' }}>
                    <iframe
                      src={`/api/sig/${client.signature_id}/live`}
                      title={`Signature ${client.nom}`}
                      className="w-full h-full"
                      style={{ border: 'none', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Erreur technique */}
              {client.error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-red-400 font-mono leading-relaxed">{client.error}</p>
                </div>
              )}

              {/* En cours */}
              {!client.gif_url && !client.error && client.status !== 'pending' && (
                <div className="flex items-center gap-2 text-xs text-white/30 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
                  <Loader2 size={13} className="animate-spin text-forge-cyan" />
                  Génération en cours… (30–60s)
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Composant lien livrable ───────────────────────────────────────────────────

function DelivLink({ label, url, color, onCopy, isDownload = false }: {
  label: string; url: string; color: string;
  onCopy: (url: string, label: string) => void;
  isDownload?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 bg-black/20 border border-white/[0.07] rounded-xl px-3 py-2.5">
      <span className="text-[10px] font-semibold flex-shrink-0 w-24" style={{ color }}>{label}</span>
      <code className="flex-1 text-[10px] text-white/40 font-mono truncate">{url}</code>
      {isDownload ? (
        <a href={url} download className="flex-shrink-0 p-1 text-white/30 hover:text-white/70 transition-colors">
          <Download size={11} />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1 text-white/30 hover:text-white/70 transition-colors">
          <ExternalLink size={11} />
        </a>
      )}
      <button onClick={() => onCopy(url, label)} className="flex-shrink-0 p-1 text-white/30 hover:text-white/70 transition-colors">
        <Copy size={11} />
      </button>
    </div>
  );
}

// ── Page principale CRM ───────────────────────────────────────────────────────

export default function PipelineDashboard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'demo' | 'reel'>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [search, setSearch] = useState('');

  const queryKey = filterMode !== 'all'
    ? ['/api/pipeline/clients', `?mode=${filterMode}`]
    : ['/api/pipeline/clients'];

  const { data: allClients = [], isLoading } = useQuery<PipelineClient[]>({
    queryKey: ['/api/pipeline/clients'],
    refetchInterval: (query) => {
      const data = query.state.data as PipelineClient[] | undefined;
      const hasRunning = data?.some(c => c.status === 'en_cours');
      return hasRunning ? 3000 : 15000;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/pipeline/clients/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/pipeline/clients'] });
      toast({ title: 'Client supprimé' });
    },
  });

  // Filtrage local
  const clients = allClients.filter(c => {
    if (filterMode !== 'all' && c.mode !== filterMode) return false;
    if (filterStatut !== 'all' && c.statut_crm !== filterStatut) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.nom.toLowerCase().includes(q) ||
        (c.entreprise || '').toLowerCase().includes(q) ||
        (c.numero_commande || '').toLowerCase().includes(q) ||
        (c.ville || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total:    allClients.length,
    reel:     allClients.filter(c => c.mode === 'reel').length,
    demo:     allClients.filter(c => c.mode === 'demo').length,
    confirme: allClients.filter(c => c.statut_crm === 'confirme').length,
    en_cours: allClients.filter(c => c.status === 'en_cours').length,
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-forge-purple/20 border border-forge-purple/40 flex items-center justify-center">
              <Package size={16} className="text-forge-purple" />
            </div>
            <h1 className="text-2xl font-bold text-white">CRM Clients</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-forge-cyan/10 border border-forge-cyan/30 text-forge-cyan">
              Base de données
            </span>
          </div>
          <p className="text-white/50 text-sm">
            Fiches clients, suivi des commandes, livrables et statuts commerciaux
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          data-testid="btn-nouveau-client"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)' }}
        >
          <Plus size={15} />
          Nouveau client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#6366f1', sub: 'tous modes' },
          { label: 'Commandes réelles', value: stats.reel, color: '#22c55e', sub: 'CMD-' },
          { label: 'Démos', value: stats.demo, color: '#f59e0b', sub: 'DEM-' },
          { label: 'Confirmés', value: stats.confirme, color: '#a855f7', sub: 'clients actifs' },
          { label: 'En génération', value: stats.en_cours, color: '#3b82f6', sub: 'en cours' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] text-white/50 mt-0.5">{label}</p>
            <p className="text-[9px] text-white/25 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher client, entreprise, n° commande…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-forge-purple/50 transition-colors"
            data-testid="input-search"
          />
        </div>

        {/* Filtre mode */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          {[
            { id: 'all',  label: 'Tous' },
            { id: 'reel', label: '● Réel' },
            { id: 'demo', label: '○ Démo' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id as any)}
              data-testid={`filter-mode-${f.id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterMode === f.id ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: filterMode === f.id ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Filtre statut CRM */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          <button
            onClick={() => setFilterStatut('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterStatut === 'all' ? 'rgba(99,102,241,0.25)' : 'transparent',
              color: filterStatut === 'all' ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
            }}
          >
            <Filter size={10} className="inline mr-1" />Statut
          </button>
          {Object.entries(STATUT_CRM_CONFIG).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setFilterStatut(filterStatut === key ? 'all' : key)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: filterStatut === key ? `${c.color}22` : 'transparent',
                color: filterStatut === key ? c.color : 'rgba(255,255,255,0.30)',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste clients */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-white/30">
            <Loader2 size={24} className="animate-spin mr-3" />
            Chargement de la base clients…
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <Package size={40} className="mx-auto mb-4 text-white/20" />
            {allClients.length === 0 ? (
              <>
                <p className="text-white/50 font-medium mb-2">Base clients vide</p>
                <p className="text-white/30 text-sm mb-6">Créez votre premier client pour lancer le pipeline</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)' }}
                >
                  <Plus size={14} /> Nouveau client
                </button>
              </>
            ) : (
              <>
                <p className="text-white/50 font-medium mb-2">Aucun résultat</p>
                <p className="text-white/30 text-sm">Essaie d'autres filtres ou une autre recherche</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-[11px] text-white/30">
                {clients.length} client{clients.length > 1 ? 's' : ''}
                {(filterMode !== 'all' || filterStatut !== 'all' || search) ? ' · filtré' : ''}
              </p>
            </div>
            {clients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={id => deleteMutation.mutate(id)}
              />
            ))}
          </>
        )}
      </div>

      {/* Modal formulaire */}
      <AnimatePresence>
        {showForm && (
          <NouveauClientForm
            onClose={() => setShowForm(false)}
            onSuccess={() => qc.invalidateQueries({ queryKey: ['/api/pipeline/clients'] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
