import { log } from '../vite';

export interface DemoMailConfig {
  signatureId:       string;
  nomClient:         string;
  titreClient:       string;
  entrepriseClient:  string;
  emailClient:       string;
  secteur:           string;
  gifUrl:            string;
  signatureHtml?:    string;  // HTML animé CSS — rendu direct navigateur
  palette:           string[];
  destinataireNom:   string;
  destinataireEmail: string;
  objetMail:         string;
  corpsMail:         string;
  whiteLabel?:       boolean;
}

const SECTOR_COLORS: Record<string, string> = {
  medecine: '#0ea5e9', medical: '#0ea5e9', sante: '#0ea5e9',
  juridique: '#1e293b', droit: '#1e293b',
  immobilier: '#d97706',
  finance: '#0f766e', banque: '#0f766e',
  tech: '#7c3aed', informatique: '#7c3aed',
  creatif: '#db2777', marketing: '#db2777',
  autre: '#334155',
};

const SECTOR_LABELS: Record<string, string> = {
  medecine: 'Médecin', medical: 'Médecin', sante: 'Santé',
  juridique: 'Avocat', droit: 'Droit',
  immobilier: 'Immobilier',
  finance: 'Finance', banque: 'Banque',
  tech: 'Tech', informatique: 'IT',
  creatif: 'Créatif', marketing: 'Marketing',
  autre: 'Professionnel',
};

const SECTOR_BODIES: Record<string, string> = {
  medecine: `Suite à votre consultation du {DATE}, je vous transmets le récapitulatif de notre échange ainsi que les recommandations convenues.\n\nN'hésitez pas à me contacter si vous avez des questions avant votre prochain rendez-vous.`,
  medical: `Suite à votre consultation du {DATE}, je vous transmets le récapitulatif de notre échange ainsi que les recommandations convenues.\n\nN'hésitez pas à me contacter si vous avez des questions avant votre prochain rendez-vous.`,
  sante: `Suite à votre consultation du {DATE}, je vous transmets le récapitulatif de notre échange ainsi que les recommandations convenues.\n\nN'hésitez pas à me contacter si vous avez des questions avant votre prochain rendez-vous.`,
  juridique: `Suite à notre entretien du {DATE} concernant votre dossier, je vous adresse les éléments convenus ainsi que les prochaines étapes de la procédure.\n\nJe reste disponible pour toute question complémentaire.`,
  droit: `Suite à notre entretien du {DATE} concernant votre dossier, je vous adresse les éléments convenus ainsi que les prochaines étapes de la procédure.\n\nJe reste disponible pour toute question complémentaire.`,
  immobilier: `Suite à la visite du bien situé au {ADRESSE} le {DATE}, je vous transmets le récapitulatif de notre échange ainsi que les modalités de l'offre.\n\nN'hésitez pas à revenir vers moi pour toute question.`,
  finance: `Suite à notre point patrimonial du {DATE}, je vous adresse la synthèse de nos recommandations et les documents d'information relatifs aux produits évoqués.\n\nJe reste à votre disposition pour en discuter.`,
  banque: `Suite à notre point patrimonial du {DATE}, je vous adresse la synthèse de nos recommandations et les documents d'information relatifs aux produits évoqués.\n\nJe reste à votre disposition pour en discuter.`,
  tech: `Suite à notre réunion du {DATE}, je vous transmets la documentation technique et les prochaines étapes du projet.\n\nN'hésitez pas à me contacter si vous avez des questions techniques.`,
  creatif: `Suite à notre brief du {DATE}, je vous transmets les premières propositions créatives et les plannings de livraison convenus.\n\nJe reste disponible pour tout ajustement.`,
  marketing: `Suite à notre brief du {DATE}, je vous transmets les premières propositions créatives et les plannings de livraison convenus.\n\nJe reste disponible pour tout ajustement.`,
  autre: `Suite à notre échange du {DATE}, je vous transmets les éléments convenus lors de notre rencontre.\n\nN'hésitez pas à revenir vers moi pour toute question.`,
};

function escHtml(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getBody(secteur: string, corpsMail: string): string {
  if (corpsMail && corpsMail.trim()) return corpsMail;
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const tmpl = SECTOR_BODIES[secteur] || SECTOR_BODIES['autre'];
  return tmpl.replace('{DATE}', today).replace('{ADRESSE}', 'votre choix');
}

function getObjet(secteur: string, objetMail: string, nomClient: string): string {
  if (objetMail && objetMail.trim()) return objetMail;
  const map: Record<string, string> = {
    medecine: 'Suite à votre consultation', medical: 'Suite à votre consultation', sante: 'Suite à votre consultation',
    juridique: 'Suite à notre entretien — votre dossier', droit: 'Suite à notre entretien — votre dossier',
    immobilier: 'Suite à la visite du bien',
    finance: 'Suite à notre point patrimonial', banque: 'Suite à notre point patrimonial',
    tech: 'Suite à notre réunion — votre projet',
    creatif: 'Suite à notre brief créatif', marketing: 'Suite à notre brief créatif',
    autre: 'Suite à notre échange',
  };
  return map[secteur] || map['autre'];
}

export function buildDemoMailHtml(cfg: DemoMailConfig): string {
  const {
    nomClient, titreClient, entrepriseClient, emailClient, secteur,
    gifUrl, signatureHtml, palette, destinataireNom, destinataireEmail, objetMail, corpsMail, whiteLabel = false,
  } = cfg;

  const accent = palette?.[0] || SECTOR_COLORS[secteur] || '#6366f1';
  const initials = nomClient.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const body = getBody(secteur, corpsMail).replace(/\n/g, '<br>');
  const sujet = getObjet(secteur, objetMail, nomClient);
  const destNom = destinataireNom || 'Marie Dupont';
  const destEmail = destinataireEmail || 'client@exemple.com';
  const destPrenom = destNom.split(' ')[0] || 'Marie';
  const senderLocal = emailClient || nomClient.toLowerCase().replace(/\s+/g, '.');
  const senderDomain = entrepriseClient.toLowerCase().replace(/\s+/g, '') || 'cabinet.fr';
  const brandLabel = whiteLabel ? entrepriseClient : 'EffectForge AI';

  log(`Demo mail généré pour ${nomClient} (${secteur})`, 'demo-builder');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aperçu — ${escHtml(nomClient)} — ${escHtml(sujet)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Google Sans',Roboto,Arial,sans-serif;background:#f2f2f2;min-height:100vh}
  .chrome-bar{background:#fff;border-bottom:1px solid #dadce0;padding:10px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100;box-shadow:0 1px 3px rgba(0,0,0,.12)}
  .chrome-dots{display:flex;gap:6px}
  .chrome-dot{width:12px;height:12px;border-radius:50%}
  .address-bar{flex:1;background:#f1f3f4;border-radius:20px;padding:6px 16px;font-size:13px;color:#5f6368;display:flex;align-items:center;gap:8px;max-width:520px;margin:0 auto}
  .lock-icon{color:#5f6368;font-size:12px}
  .gmail-ui{max-width:860px;margin:0 auto;background:#fff;min-height:calc(100vh - 53px);box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .gmail-header{background:#fff;border-bottom:1px solid #e0e0e0;padding:0 16px;display:flex;align-items:center;gap:0;height:64px}
  .gmail-logo{display:flex;align-items:center;gap:4px;font-size:22px;font-weight:400;color:#5f6368;margin-right:24px}
  .gmail-logo span{color:#EA4335}
  .gmail-search{flex:1;background:#eaf1fb;border-radius:24px;padding:10px 20px;font-size:16px;color:#202124;max-width:720px}
  .mail-thread{padding:20px 24px}
  .mail-subject{font-size:22px;font-weight:400;color:#202124;margin-bottom:20px;line-height:1.3}
  .mail-header-row{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px}
  .avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;color:#fff;flex-shrink:0;margin-top:2px}
  .sender-info{flex:1}
  .sender-name{font-size:14px;font-weight:600;color:#202124}
  .sender-email{font-size:12px;color:#5f6368}
  .mail-time{font-size:12px;color:#5f6368;white-space:nowrap}
  .to-line{font-size:12px;color:#5f6368;margin-top:2px}
  .mail-body{font-size:14px;line-height:1.8;color:#202124;padding:4px 0 28px 52px}
  .mail-body p{margin-bottom:16px}
  .sig-wrapper{padding:0 0 28px 52px}
  .sig-img{max-width:600px;width:100%;display:block;border-radius:4px}
  .sig-live{max-width:620px;transform-origin:left top;}
  .preview-label{background:linear-gradient(135deg,${accent},${accent}88);color:#fff;text-align:center;padding:10px 20px;font-size:12px;letter-spacing:.05em;font-weight:600}
  @media(max-width:600px){.mail-body,.sig-wrapper{padding-left:0}.gmail-search{display:none}.chrome-bar{gap:8px}}
</style>
</head>
<body>

<!-- Chrome simulé -->
<div class="chrome-bar">
  <div class="chrome-dots">
    <div class="chrome-dot" style="background:#ff5f57"></div>
    <div class="chrome-dot" style="background:#ffbd2e"></div>
    <div class="chrome-dot" style="background:#28c840"></div>
  </div>
  <div class="address-bar">
    <span class="lock-icon">🔒</span>
    <span>mail.google.com — aperçu de votre signature</span>
  </div>
</div>

<!-- Interface Gmail -->
<div class="gmail-ui">
  <div class="gmail-header">
    <div class="gmail-logo">
      <span>M</span>Gmail&nbsp;<span style="color:#5f6368;font-size:14px;font-weight:300">· Aperçu</span>
    </div>
    <div class="gmail-search">Rechercher dans les messages</div>
  </div>

  <div class="mail-thread">
    <div class="mail-subject">${escHtml(sujet)}</div>

    <div class="mail-header-row">
      <div class="avatar" style="background:${escHtml(accent)}">${escHtml(initials)}</div>
      <div class="sender-info">
        <div class="sender-name">${escHtml(nomClient)}${titreClient ? ` · <span style="font-weight:400;color:#5f6368">${escHtml(titreClient)}</span>` : ''}</div>
        <div class="sender-email">&lt;${escHtml(senderLocal)}@${escHtml(senderDomain)}&gt;</div>
        <div class="to-line">À : ${escHtml(destNom)} &lt;${escHtml(destEmail)}&gt;</div>
      </div>
      <div class="mail-time">${today} à ${heure}</div>
    </div>

    <div class="mail-body">
      <p>Bonjour ${escHtml(destPrenom)},</p>
      <p>${body}</p>
      <p>Cordialement,</p>
    </div>

    <!-- Signature vivante — HTML animé CSS si disponible, sinon GIF fallback -->
    <div class="sig-wrapper">
      ${signatureHtml
        ? `<div class="sig-live">${signatureHtml}</div>
      <!-- GIF fallback caché (pour compatibilité copier-coller email) -->
      <img src="${escHtml(gifUrl)}" alt="Signature ${escHtml(nomClient)}" class="sig-img" style="display:none" />`
        : `<img src="${escHtml(gifUrl)}" alt="Signature ${escHtml(nomClient)}" class="sig-img" onerror="this.style.display='none'" />`
      }
    </div>
  </div>

  <div class="preview-label">
    ✦ Aperçu de votre Signature Vivante ${escHtml(brandLabel)} · ${escHtml(nomClient)} · ${escHtml(SECTOR_LABELS[secteur] || 'Professionnel')}
  </div>
</div>

</body>
</html>`;
}
