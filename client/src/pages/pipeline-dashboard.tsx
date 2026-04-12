import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Loader2, CheckCircle, AlertCircle, Clock, Package,
  ExternalLink, Copy, Trash2, RefreshCw, Zap, Mail, Download,
  ChevronDown, ChevronUp, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PipelineClient {
  id: string;
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
  error: string | null;
  createdAt: string;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const SECTEURS = [
  { id: 'sante',       label: 'Santé / Médecine',    color: '#0ea5e9' },
  { id: 'juridique',   label: 'Juridique / Droit',   color: '#1e293b' },
  { id: 'immobilier',  label: 'Immobilier',           color: '#d97706' },
  { id: 'finance',     label: 'Finance / Banque',     color: '#0f766e' },
  { id: 'tech',        label: 'Tech / IT',            color: '#7c3aed' },
  { id: 'creatif',     label: 'Créatif / Marketing',  color: '#db2777' },
  { id: 'autre',       label: 'Autre',                color: '#334155' },
];

const STATUS_CONFIG = {
  pending:  { label: 'En attente', color: '#f59e0b', bg: '#f59e0b18', Icon: Clock },
  en_cours: { label: 'En cours',   color: '#3b82f6', bg: '#3b82f618', Icon: Loader2 },
  livre:    { label: 'Livré',      color: '#22c55e', bg: '#22c55e18', Icon: CheckCircle },
  erreur:   { label: 'Erreur',     color: '#ef4444', bg: '#ef444418', Icon: AlertCircle },
};

// ── Formulaire client ─────────────────────────────────────────────────────────

interface FormState {
  prenom: string; nom: string; titre: string; entreprise: string;
  secteur: string; telephone: string; email: string; site: string; ville: string;
  logo_url: string; banniere_texte: string; banniere_lien: string; cta: string;
  destinataire_nom: string; destinataire_email: string; objet_mail: string; corps_mail: string;
}

const EMPTY_FORM: FormState = {
  prenom: '', nom: '', titre: '', entreprise: '', secteur: 'sante',
  telephone: '', email: '', site: '', ville: '', logo_url: '',
  banniere_texte: '', banniere_lien: '', cta: 'Nous contacter',
  destinataire_nom: '', destinataire_email: '', objet_mail: '', corps_mail: '',
};

function NouveauClientForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [section, setSection] = useState<'identite' | 'contacts' | 'demo'>('identite');

  const update = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (data: FormState) => {
      const res = await apiRequest('POST', '/api/pipeline/generate', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: '✅ Pipeline lancé !', description: 'La signature est en cours de génération.' });
      onSuccess();
      onClose();
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const inp = "w-full bg-black/20 border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-forge-purple/60 transition-colors";
  const lbl = "text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block";

  const selectedSecteur = SECTEURS.find(s => s.id === form.secteur);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Nouveau client</h2>
            <p className="text-xs text-white/40 mt-0.5">Le pipeline génère les 5 livrables automatiquement</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] flex-shrink-0">
          {[
            { id: 'identite', label: 'Identité' },
            { id: 'contacts', label: 'Contacts & Visuel' },
            { id: 'demo',     label: 'Mail de démo' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id as any)}
              className={`px-5 py-3 text-sm font-medium transition-all ${
                section === tab.id
                  ? 'text-white border-b-2 border-forge-purple'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => update('secteur', s.id)}
                      data-testid={`btn-secteur-${s.id}`}
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
                <input className={`${inp} mt-2`} type="url" value={form.banniere_lien} onChange={e => update('banniere_lien', e.target.value)} placeholder="https://... (lien cliquable)" data-testid="input-banniere-lien" />
              </div>
            </>
          )}

          {section === 'demo' && (
            <>
              <p className="text-xs text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 leading-relaxed">
                Le mail de démo simule un vrai email Gmail avec votre signature en bas. C'est ce que vous envoyez au client pour le convaincre.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Nom du destinataire (faux patient/client)</label>
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
                  placeholder="Bonjour Marie,&#10;&#10;Suite à votre consultation, je vous transmets..."
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
              <button onClick={() => setSection(section === 'demo' ? 'contacts' : 'identite')} className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 border border-white/[0.08] transition-colors">
                ← Retour
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {section !== 'demo' ? (
              <button
                onClick={() => setSection(section === 'identite' ? 'contacts' : 'demo')}
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
                style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)' }}
              >
                {mutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Lancement…</> : <><Zap size={14} /> Lancer le pipeline</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Ligne client dans le tableau ──────────────────────────────────────────────

function ClientRow({ client, onDelete, onRefresh }: {
  client: PipelineClient;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[client.status] || STATUS_CONFIG['pending'];
  const { Icon } = statusCfg;
  const secteurColor = SECTEURS.find(s => s.id === client.secteur)?.color || '#334155';

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `✓ ${label} copié`, description: text.slice(0, 60) + '…' });
  };

  const dateStr = new Date(client.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden" data-testid={`row-client-${client.id.slice(0,8)}`}>
      {/* Row principale */}
      <div className="flex items-center gap-4 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
        {/* Avatar initiales */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: secteurColor }}
        >
          {client.nom.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()}
        </div>

        {/* Nom + secteur */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{client.nom}</p>
          <p className="text-[10px] text-white/40 truncate">{client.titre}{client.entreprise ? ` · ${client.entreprise}` : ''}</p>
        </div>

        {/* Secteur */}
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 hidden md:block"
          style={{ background: `${secteurColor}20`, color: secteurColor }}
        >
          {SECTEURS.find(s => s.id === client.secteur)?.label || client.secteur}
        </span>

        {/* Date */}
        <span className="text-[10px] text-white/30 flex-shrink-0 hidden lg:block">{dateStr}</span>

        {/* Statut */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
          style={{ background: statusCfg.bg, color: statusCfg.color }}
        >
          <Icon size={10} className={client.status === 'en_cours' ? 'animate-spin' : ''} />
          {statusCfg.label}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {client.demo_url && (
            <a href={client.demo_url} target="_blank" rel="noopener noreferrer"
              title="Voir le mail de démo" data-testid={`btn-voir-demo-${client.id.slice(0,8)}`}
              className="p-2 rounded-lg text-white/40 hover:text-forge-cyan hover:bg-forge-cyan/10 transition-all"
            >
              <Mail size={14} />
            </a>
          )}
          {client.zip_url && (
            <a href={client.zip_url} target="_blank" rel="noopener noreferrer"
              title="Télécharger ZIP" data-testid={`btn-zip-${client.id.slice(0,8)}`}
              className="p-2 rounded-lg text-white/40 hover:text-forge-purple hover:bg-forge-purple/10 transition-all"
            >
              <Download size={14} />
            </a>
          )}
          {client.demo_url && (
            <button
              onClick={() => copy(client.demo_url!, 'Lien démo')}
              title="Copier le lien de démo"
              data-testid={`btn-copy-demo-${client.id.slice(0,8)}`}
              className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            >
              <Copy size={14} />
            </button>
          )}
          <button
            onClick={() => onRefresh(client.id)}
            title="Actualiser"
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => onDelete(client.id)}
            title="Supprimer"
            data-testid={`btn-supprimer-${client.id.slice(0,8)}`}
            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Détails expandables */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 bg-black/20 border-t border-white/[0.04] grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* GIF aperçu */}
              {client.gif_url && (
                <div className="md:col-span-1">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Aperçu GIF</p>
                  <img src={client.gif_url} alt={`Signature ${client.nom}`} className="w-full rounded-lg border border-white/[0.08]" />
                </div>
              )}

              {/* URLs */}
              <div className={`${client.gif_url ? 'md:col-span-2' : 'md:col-span-3'} space-y-3`}>
                {client.gif_url && (
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">URL GIF permanente</p>
                    <div className="flex items-center gap-2 bg-black/20 border border-white/[0.08] rounded-lg px-3 py-2">
                      <code className="flex-1 text-[11px] text-forge-cyan font-mono truncate">{client.gif_url}</code>
                      <button onClick={() => copy(client.gif_url!, 'URL GIF')} className="flex-shrink-0 text-white/40 hover:text-white/80">
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>
                )}
                {client.demo_url && (
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Lien mail de démo</p>
                    <div className="flex items-center gap-2 bg-black/20 border border-white/[0.08] rounded-lg px-3 py-2">
                      <code className="flex-1 text-[11px] text-forge-purple font-mono truncate">{client.demo_url}</code>
                      <a href={client.demo_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-white/40 hover:text-white/80"><ExternalLink size={11} /></a>
                      <button onClick={() => copy(client.demo_url!, 'Lien démo')} className="flex-shrink-0 text-white/40 hover:text-white/80"><Copy size={11} /></button>
                    </div>
                  </div>
                )}
                {client.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-red-400 font-mono">{client.error}</p>
                  </div>
                )}
                {!client.gif_url && !client.demo_url && !client.error && (
                  <div className="flex items-center gap-2 text-sm text-white/30">
                    <Loader2 size={14} className="animate-spin" />
                    Génération en cours… (30-60s)
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function PipelineDashboard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: clients = [], isLoading } = useQuery<PipelineClient[]>({
    queryKey: ['/api/pipeline/clients'],
    refetchInterval: (query) => {
      const data = query.state.data as PipelineClient[] | undefined;
      const hasRunning = data?.some(c => c.status === 'en_cours');
      return hasRunning ? 3000 : false;
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

  const refreshClient = async (id: string) => {
    await qc.invalidateQueries({ queryKey: ['/api/pipeline/clients'] });
  };

  const stats = {
    total:    clients.length,
    livre:    clients.filter(c => c.status === 'livre').length,
    en_cours: clients.filter(c => c.status === 'en_cours').length,
    erreur:   clients.filter(c => c.status === 'erreur').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-forge-purple/20 border border-forge-purple/40 flex items-center justify-center">
              <Package size={16} className="text-forge-purple" />
            </div>
            <h1 className="text-2xl font-bold text-white">Livraisons clients</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-forge-cyan/10 border border-forge-cyan/30 text-forge-cyan">
              Output Pipeline
            </span>
          </div>
          <p className="text-white/50 text-sm">
            Créez un client → 5 livrables générés automatiquement : GIF · Mail démo · Guide PDF · Copier-coller · ZIP
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total clients', value: stats.total, color: '#6366f1' },
          { label: 'Livrés',        value: stats.livre,    color: '#22c55e' },
          { label: 'En cours',      value: stats.en_cours, color: '#3b82f6' },
          { label: 'Erreurs',       value: stats.erreur,   color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-white/30">
            <Loader2 size={24} className="animate-spin mr-3" />
            Chargement des clients…
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <Package size={40} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/50 font-medium mb-2">Aucun client pour l'instant</p>
            <p className="text-white/30 text-sm mb-6">Créez votre premier client pour lancer le pipeline</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)' }}
            >
              <Plus size={14} /> Créer un client
            </button>
          </div>
        ) : (
          clients.map(client => (
            <ClientRow
              key={client.id}
              client={client}
              onDelete={(id) => {
                if (confirm('Supprimer ce client ?')) deleteMutation.mutate(id);
              }}
              onRefresh={refreshClient}
            />
          ))
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
