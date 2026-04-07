import { log } from '../vite';
import { callCerebras } from './cerebras-wrapper';

async function cerebrasGenerate(prompt: string): Promise<any> {
  const text = await callCerebras(prompt, { maxTokens: 2000, temperature: 0.7 });
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error(`JSON invalide apres extraction: ${cleaned.slice(0, 120)}`);
      }
    }
    throw new Error(`Reponse Cerebras non JSON: ${cleaned.slice(0, 120)}`);
  }
}

function isValid<T>(obj: any, keys: (keyof T)[]): boolean {
  return obj && typeof obj === 'object' && keys.every(k => k in obj);
}

export interface InstructionsContent {
  titre: string;
  intro: string;
  etapes: Array<{ numero: number; titre: string; description: string; conseil: string }>;
  note_finale: string;
}

export interface DeliveryEmailContent {
  sujet: string;
  intro: string;
  corps: string;
  section_magic: string;
  instructions_rapides: string;
  cta: string;
  signature_expediteur: string;
  ps: string;
}

export interface PreviewPageContent {
  titre_page: string;
  headline: string;
  description: string;
  section_effets: string;
  texte_bouton_gmail: string;
  texte_bouton_outlook: string;
  texte_bouton_apple: string;
  texte_bouton_download: string;
  footer: string;
}

export interface ReadmeTxt {
  contenu: string;
}

export interface CerebrasPackageContent {
  instructionsGmail:   InstructionsContent;
  instructionsOutlook: InstructionsContent;
  instructionsApple:   InstructionsContent;
  emailLivraison:      DeliveryEmailContent;
  previewPage:         PreviewPageContent;
  readme:              ReadmeTxt;
}

export async function generateAllContent(
  metadata: { nom: string; entreprise: string; secteur: string },
  effectsUsed: string[],
  arcNarratif: string
): Promise<CerebrasPackageContent> {
  const { nom, entreprise, secteur } = metadata;
  const effetsStr = effectsUsed.join(', ');
  const baseInfo = `Client : ${nom} de ${entreprise}, secteur ${secteur}.`;

  const makeInstructionsPrompt = (client: string, tips: string) => `
Tu es un redacteur technique expert UX.
Genere des instructions d'installation pour ${client} en JSON valide uniquement :
{"titre":"string","intro":"string personnalise","etapes":[{"numero":1,"titre":"string","description":"string detaille","conseil":"string astuce"},{"numero":2,"titre":"string","description":"string","conseil":"string"},{"numero":3,"titre":"string","description":"string","conseil":"string"}],"note_finale":"string"}
${baseInfo} ${tips}
Ton : professionnel et chaleureux. Reponds UNIQUEMENT avec le JSON, sans texte autour.`.trim();

  const prompts = {
    gmail:   makeInstructionsPrompt('Gmail',      'Mentionner le fichier signature-gmail.html.'),
    outlook: makeInstructionsPrompt('Outlook',    'Mentionner le fichier .htm. Ne pas copier-coller SVG directement.'),
    apple:   makeInstructionsPrompt('Apple Mail', 'Mentionner de desactiver le format RTF si necessaire.'),

    email: `Tu es un copywriter premium.
Genere un email de livraison en JSON valide uniquement :
{"sujet":"string accrocheur","intro":"string warm","corps":"string descriptif","section_magic":"string unique","instructions_rapides":"string 1 phrase","cta":"string bouton","signature_expediteur":"string","ps":"string conseil"}
Client : ${nom}, ${entreprise}, ${secteur}. Effets : ${effetsStr}. Arc : ${arcNarratif}.
Reponds UNIQUEMENT avec le JSON.`.trim(),

    preview: `Tu es un copywriter premium specialise en email marketing de luxe.
Genere le contenu d'une page preview PERSONNALISEE pour la signature email de "${nom}" chez "${entreprise}" (secteur: ${metadata.secteur}).
JSON valide uniquement, TOUTES les valeurs doivent mentionner "${nom}" ou "${entreprise}" ou les deux :
{"titre_page":"Signature Vivante de ${nom} — ${entreprise} | EffectForge AI","headline":"Phrase poetique et elegante de 6-10 mots qui parle directement de ${nom} ou de l'identite de ${entreprise}. Exemples : '${nom} — Une présence qui s'anime', '${entreprise} — L'élégance en mouvement'","description":"2 phrases qui parlent de la signature email de ${nom} chez ${entreprise} dans le secteur ${metadata.secteur}. Personnalise, chaleureux, premium.","section_effets":"Phrase sur les effets visuels qui incarnent l'univers de ${entreprise} ou de ${nom}","texte_bouton_gmail":"Installer dans Gmail","texte_bouton_outlook":"Installer dans Outlook","texte_bouton_apple":"Installer dans Apple Mail","texte_bouton_download":"Telecharger mon package complet","footer":"Signature de ${nom} — ${entreprise} · Creee par EffectForge AI"}
Reponds UNIQUEMENT avec le JSON valide.`.trim(),

    readme: `Tu es un assistant chaleureux et professionnel.
Genere un texte README premium en JSON valide uniquement :
{"contenu":"string de 10 a 12 lignes (avec sauts de ligne \\n) expliquant le package de ${nom}, personnalise avec son nom et ${entreprise}, liste les fichiers et leur role, chaleureux et professionnel"}
Client : ${nom} de ${entreprise}, secteur ${secteur}.
Fichiers du package :
- "PREVIEW — Ouvrez ce fichier.html" : page de previsualisation locale interactive (A OUVRIR EN PREMIER dans votre navigateur)
- signature.svg : signature animee principale
- signature-fallback.png : version statique haute resolution
- signature-gmail.html : version optimisee Gmail
- signature-outlook.htm : version optimisee Outlook
- instructions-gmail.pdf : guide d'installation Gmail
- instructions-outlook.pdf : guide d'installation Outlook
- instructions-apple-mail.pdf : guide d'installation Apple Mail
- palette-de-marque.html : charte colorimetrique de votre signature
- config.json : configuration technique complete
Reponds UNIQUEMENT avec le JSON.`.trim(),
  };

  log('Generation parallele Cerebras de 6 contenus...', 'cerebras-content');

  const [
    rGmail, rOutlook, rApple, rEmail, rPreview, rReadme,
  ] = await Promise.allSettled([
    cerebrasGenerate(prompts.gmail),
    cerebrasGenerate(prompts.outlook),
    cerebrasGenerate(prompts.apple),
    cerebrasGenerate(prompts.email),
    cerebrasGenerate(prompts.preview),
    cerebrasGenerate(prompts.readme),
  ]);

  const failed = [rGmail, rOutlook, rApple, rEmail, rPreview, rReadme]
    .filter(r => r.status === 'rejected')
    .map(r => (r as PromiseRejectedResult).reason?.message || 'erreur inconnue');

  if (failed.length > 0) {
    log(`Cerebras: ${failed.length}/6 section(s) en fallback — ${failed.join(' | ')}`, 'cerebras-content');
  }

  const fallback = getFallbackContent(metadata, effectsUsed);

  const resolve = <T>(result: PromiseSettledResult<T>, fallbackVal: T, keys: string[]): T => {
    if (result.status === 'fulfilled' && isValid(result.value, keys as any)) return result.value;
    return fallbackVal;
  };

  const instructionsGmail   = resolve(rGmail,   fallback.instructionsGmail,   ['titre','intro','etapes','note_finale']);
  const instructionsOutlook = resolve(rOutlook, fallback.instructionsOutlook, ['titre','intro','etapes','note_finale']);
  const instructionsApple   = resolve(rApple,   fallback.instructionsApple,   ['titre','intro','etapes','note_finale']);
  const emailLivraison      = resolve(rEmail,   fallback.emailLivraison,      ['sujet','intro','corps','cta']);
  const previewPage         = resolve(rPreview, fallback.previewPage,         ['titre_page','headline','description']);
  const readme              = resolve(rReadme,  fallback.readme,              ['contenu']);

  log(`Generation Cerebras terminee (${6 - failed.length}/6 succes)`, 'cerebras-content');

  return { instructionsGmail, instructionsOutlook, instructionsApple, emailLivraison, previewPage, readme };
}

export function getFallbackContent(
  metadata: { nom: string; entreprise: string; secteur: string },
  effectsUsed: string[]
): CerebrasPackageContent {
  const { nom, entreprise } = metadata;

  const makeInstructions = (client: string): InstructionsContent => ({
    titre: `Installer votre signature dans ${client}`,
    intro: `Bonjour ${nom}, voici comment installer votre signature vivante dans ${client}.`,
    etapes: [
      {
        numero: 1,
        titre: 'Ouvrir les parametres',
        description: `Ouvrez ${client} et accdez aux Parametres de signature.`,
        conseil: 'Utilisez le raccourci Ctrl+, pour acceèder rapidement aux preferences.',
      },
      {
        numero: 2,
        titre: 'Creer une nouvelle signature',
        description: 'Creez une nouvelle signature et ouvrez l\'editeur HTML.',
        conseil: 'Donnez un nom memorable a votre signature pour la retrouver facilement.',
      },
      {
        numero: 3,
        titre: 'Coller le code fourni',
        description: `Collez le fichier signature approprie pour ${client} dans l'editeur.`,
        conseil: 'Enregistrez et envoyez-vous un email test pour verifier le rendu.',
      },
    ],
    note_finale: `Votre signature ${entreprise} est maintenant vivante !`,
  });

  return {
    instructionsGmail:   makeInstructions('Gmail'),
    instructionsOutlook: makeInstructions('Outlook'),
    instructionsApple:   makeInstructions('Apple Mail'),
    emailLivraison: {
      sujet:                `Votre signature vivante est prete, ${nom}`,
      intro:                `Bonjour ${nom}, nous sommes ravis de vous livrer votre signature email exclusive.`,
      corps:                `Votre package contient la signature SVG animee, ses versions Outlook et Gmail, ainsi que les guides d'installation.`,
      section_magic:        `Votre signature cycle entre 4 variations artistiques, chacune portant une intention narrative unique.`,
      instructions_rapides: 'Telechargez le package et suivez le guide PDF correspondant a votre client mail.',
      cta:                  'Voir ma signature en previsualisation',
      signature_expediteur: 'L\'equipe EffectForge AI',
      ps:                   `Conseil pro : testez votre signature sur mobile.`,
    },
    previewPage: {
      titre_page:            `${nom} — Signature Vivante | ${entreprise} · EffectForge AI`,
      headline:              `${nom} — Une identité qui s'anime`,
      description:           `Une signature email exclusive pour ${entreprise}, conçue en 4 atmosphères visuelles qui incarnent votre univers créatif. Chaque message devient une expérience.`,
      section_effets:        `4 variations vivantes qui racontent l'histoire de ${entreprise}`,
      texte_bouton_gmail:    'Installer dans Gmail',
      texte_bouton_outlook:  'Installer dans Outlook',
      texte_bouton_apple:    'Installer dans Apple Mail',
      texte_bouton_download: 'Télécharger mon package complet',
      footer:                `Signature de ${nom} · ${entreprise} · Créée par EffectForge AI`,
    },
    readme: {
      contenu: `Bienvenue ${nom},\n\nVoici votre package de signature email premium cree par EffectForge AI pour ${entreprise}.\n\n→ COMMENCEZ ICI : Ouvrez "PREVIEW — Ouvrez ce fichier.html" dans votre navigateur pour voir votre signature animee en action !\n\nContenu du dossier :\n- "PREVIEW — Ouvrez ce fichier.html" : Page de previsualisation interactive — ouvrez-la EN PREMIER\n- signature.svg : Votre signature animee principale\n- signature-fallback.png : Version statique haute resolution (PNG)\n- signature-gmail.html : Version optimisee pour Gmail\n- signature-outlook.htm : Version optimisee pour Outlook\n- instructions-gmail.pdf : Guide d'installation Gmail (PDF)\n- instructions-outlook.pdf : Guide d'installation Outlook (PDF)\n- instructions-apple-mail.pdf : Guide d'installation Apple Mail (PDF)\n- palette-de-marque.html : Charte colorimetrique de votre signature\n- config.json : Configuration technique complete\n\nBonne utilisation, ${nom} !\nL'equipe EffectForge AI`,
    },
  };
}
