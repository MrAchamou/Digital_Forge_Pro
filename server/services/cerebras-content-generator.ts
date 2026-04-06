import { log } from '../vite';
import { callCerebras } from './cerebras-wrapper';

async function cerebrasGenerate(prompt: string): Promise<any> {
  const text = await callCerebras(prompt, { maxTokens: 2000, temperature: 0.7 });
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
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
  instructionsGmail: InstructionsContent;
  instructionsOutlook: InstructionsContent;
  instructionsApple: InstructionsContent;
  emailLivraison: DeliveryEmailContent;
  previewPage: PreviewPageContent;
  readme: ReadmeTxt;
}

export async function generateAllContent(
  metadata: { nom: string; entreprise: string; secteur: string },
  effectsUsed: string[],
  arcNarratif: string
): Promise<CerebrasPackageContent> {
  const { nom, entreprise, secteur } = metadata;
  const effetsStr = effectsUsed.join(', ');

  const baseClientInfo = `Client : ${nom} de ${entreprise}, secteur ${secteur}.`;

  const promptGmail = `Tu es un rédacteur technique expert UX.
Génère des instructions d'installation claires et élégantes pour Gmail en JSON :
{
  "titre": "Installer votre signature dans Gmail",
  "intro": "phrase accrocheuse personnalisée",
  "etapes": [
    {"numero": 1, "titre": "string", "description": "string détaillé", "conseil": "string astuce pro"},
    {"numero": 2, "titre": "string", "description": "string détaillé", "conseil": "string astuce pro"},
    {"numero": 3, "titre": "string", "description": "string détaillé", "conseil": "string astuce pro"}
  ],
  "note_finale": "string encourageant"
}
${baseClientInfo}
Ton : professionnel mais chaleureux. 3 étapes maximum. Réponds UNIQUEMENT en JSON valide.`;

  const promptOutlook = `Tu es un rédacteur technique expert UX.
Génère des instructions d'installation claires pour Outlook en JSON :
{
  "titre": "Installer votre signature dans Outlook",
  "intro": "phrase accrocheuse personnalisée",
  "etapes": [
    {"numero": 1, "titre": "string", "description": "string détaillé mentionnant le fichier .htm fourni", "conseil": "string astuce pro"},
    {"numero": 2, "titre": "string", "description": "string détaillé - ne pas copier-coller le SVG directement", "conseil": "string astuce pro"},
    {"numero": 3, "titre": "string", "description": "string détaillé", "conseil": "string astuce pro"}
  ],
  "note_finale": "string encourageant"
}
${baseClientInfo}
Ton : professionnel mais chaleureux. 3 étapes. Réponds UNIQUEMENT en JSON valide.`;

  const promptApple = `Tu es un rédacteur technique expert UX.
Génère des instructions d'installation claires pour Apple Mail en JSON :
{
  "titre": "Installer votre signature dans Apple Mail",
  "intro": "phrase accrocheuse personnalisée",
  "etapes": [
    {"numero": 1, "titre": "string", "description": "string détaillé", "conseil": "string astuce pro"},
    {"numero": 2, "titre": "string", "description": "string détaillé - désactiver RTF si nécessaire", "conseil": "string astuce pro"},
    {"numero": 3, "titre": "string", "description": "string détaillé", "conseil": "string astuce pro"}
  ],
  "note_finale": "string encourageant"
}
${baseClientInfo}
Ton : professionnel mais chaleureux. 3 étapes. Réponds UNIQUEMENT en JSON valide.`;

  const promptEmail = `Tu es un copywriter expert en emails de livraison premium pour agences créatives.
Génère un email de livraison professionnel et mémorable en JSON :
{
  "sujet": "string accrocheur",
  "intro": "string personnalisé warm",
  "corps": "string décrivant ce qui est livré",
  "section_magic": "string décrivant pourquoi cette signature est unique et vivante",
  "instructions_rapides": "string 1 phrase",
  "cta": "string texte bouton",
  "signature_expediteur": "string",
  "ps": "string conseil exclusif"
}
Client : ${nom}, ${entreprise}, ${secteur}.
Effets utilisés : ${effetsStr}.
Arc narratif : ${arcNarratif}.
Ton : premium, exclusif, mémorable. Réponds UNIQUEMENT en JSON valide.`;

  const promptPreview = `Tu es un développeur frontend expert.
Génère le contenu d'une page de prévisualisation premium pour une signature email vivante en JSON :
{
  "titre_page": "string",
  "headline": "string accrocheur",
  "description": "string 1-2 phrases",
  "section_effets": "string décrivant les effets utilisés",
  "texte_bouton_gmail": "string",
  "texte_bouton_outlook": "string",
  "texte_bouton_apple": "string",
  "texte_bouton_download": "string",
  "footer": "string"
}
Client : ${nom}, ${entreprise}. Effets : ${effetsStr}.
Ton : exclusif, technologique, premium. Réponds UNIQUEMENT en JSON valide.`;

  const promptReadme = `Tu es un assistant chaleureux et professionnel.
Génère un texte simple expliquant le contenu d'un dossier de signature email premium en JSON :
{
  "contenu": "texte de 8 à 10 lignes maximum, chaleureux, expliquant les fichiers du package"
}
Client : ${nom} de ${entreprise}.
Fichiers inclus : signature.svg, signature-fallback.png, signature-outlook.htm, signature-gmail.html, instructions-gmail.pdf, instructions-outlook.pdf, instructions-apple-mail.pdf, config.json.
Réponds UNIQUEMENT en JSON valide.`;

  log('Génération parallèle Cerebras de 6 contenus...', 'cerebras-content');

  const [
    instructionsGmail,
    instructionsOutlook,
    instructionsApple,
    emailLivraison,
    previewPage,
    readmeRaw,
  ] = await Promise.all([
    cerebrasGenerate(promptGmail),
    cerebrasGenerate(promptOutlook),
    cerebrasGenerate(promptApple),
    cerebrasGenerate(promptEmail),
    cerebrasGenerate(promptPreview),
    cerebrasGenerate(promptReadme),
  ]);

  log('Génération Cerebras terminée ✓', 'cerebras-content');

  return {
    instructionsGmail,
    instructionsOutlook,
    instructionsApple,
    emailLivraison,
    previewPage,
    readme: readmeRaw,
  };
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
      { numero: 1, titre: 'Ouvrir les paramètres', description: `Ouvrez ${client} et accédez aux Paramètres de signature.`, conseil: 'Utilisez le raccourci Ctrl+, pour accéder rapidement aux préférences.' },
      { numero: 2, titre: 'Créer une nouvelle signature', description: 'Créez une nouvelle signature et ouvrez l\'éditeur HTML.', conseil: 'Donnez un nom mémorable à votre signature pour la retrouver facilement.' },
      { numero: 3, titre: 'Coller le code fourni', description: `Collez le fichier signature approprié pour ${client} dans l'éditeur.`, conseil: 'Enregistrez et envoyez-vous un email test pour vérifier le rendu.' },
    ],
    note_finale: `Votre signature ${entreprise} est maintenant vivante ! Elle illuminera chaque email que vous enverrez.`,
  });

  return {
    instructionsGmail: makeInstructions('Gmail'),
    instructionsOutlook: makeInstructions('Outlook'),
    instructionsApple: makeInstructions('Apple Mail'),
    emailLivraison: {
      sujet: `✨ Votre signature vivante est prête, ${nom}`,
      intro: `Bonjour ${nom}, nous sommes ravis de vous livrer votre signature email exclusive.`,
      corps: `Votre package complet contient la signature SVG animée, ses versions Outlook et Gmail, ainsi que les guides d'installation illustrés.`,
      section_magic: `Votre signature n'est pas une image statique — c'est une œuvre vivante qui cycle entre 4 variations artistiques, chacune portant une intention narrative unique.`,
      instructions_rapides: 'Téléchargez le package et suivez le guide PDF correspondant à votre client mail.',
      cta: 'Voir ma signature en prévisualisation',
      signature_expediteur: 'L\'équipe EffectForge AI',
      ps: `Conseil pro : testez votre signature sur mobile en vous envoyant un email depuis votre téléphone.`,
    },
    previewPage: {
      titre_page: `Signature Vivante — ${nom} | ${entreprise}`,
      headline: `Votre signature email prend vie`,
      description: `Une signature exclusive en 4 variations qui raconte l'histoire de ${entreprise}.`,
      section_effets: `Effets utilisés : ${effectsUsed.join(', ')}`,
      texte_bouton_gmail: 'Installer dans Gmail',
      texte_bouton_outlook: 'Installer dans Outlook',
      texte_bouton_apple: 'Installer dans Apple Mail',
      texte_bouton_download: '⬇ Télécharger mon package complet',
      footer: 'Signature créée par EffectForge AI',
    },
    readme: {
      contenu: `Bienvenue ${nom},\n\nVoici votre package de signature email premium créé par EffectForge AI.\n\nContenu du dossier :\n- signature.svg : Votre signature animée principale\n- signature-fallback.png : Fallback haute résolution pour clients bloquant les SVG\n- signature-outlook.htm : Version optimisée pour Outlook\n- signature-gmail.html : Version optimisée pour Gmail\n- instructions-gmail.pdf : Guide d'installation Gmail\n- instructions-outlook.pdf : Guide d'installation Outlook\n- instructions-apple-mail.pdf : Guide d'installation Apple Mail\n- config.json : Configuration complète de votre signature\n\nBonne utilisation,\nL'équipe EffectForge AI`,
    },
  };
}
