import { type SectorId, SECTOR_TEMPLATES, getSectorByKeyword } from '../templates/sector-templates';
import { callGemini } from './gemini-wrapper';

interface GmbClassifyInput {
  nom?: string;
  entreprise?: string;
  secteur?: string;
  description?: string;
  mots_cles?: string[];
  titre?: string;
}

export interface ClassificationResult {
  sectorId: SectorId;
  confidence: number;
  method: 'ai' | 'keyword' | 'fallback';
  reasoning?: string;
}

export async function classifySector(data: GmbClassifyInput): Promise<ClassificationResult> {
  const sectorList = Object.values(SECTOR_TEMPLATES)
    .map(t => `- ${t.id} : ${t.label} (${t.description})`)
    .join('\n');

  const context = [
    data.entreprise && `Entreprise : ${data.entreprise}`,
    data.nom && `Nom : ${data.nom}`,
    data.secteur && `Secteur GMB : ${data.secteur}`,
    data.description && `Description : ${data.description}`,
    data.titre && `Titre : ${data.titre}`,
    data.mots_cles?.length && `Mots-clés : ${data.mots_cles.join(', ')}`,
  ].filter(Boolean).join('\n');

  try {
    const prompt = `Tu es un classificateur de secteur d'activité. À partir des informations d'une fiche Google My Business, identifie le secteur parmi les 10 catégories disponibles.

Catégories disponibles :
${sectorList}

Informations de l'entreprise :
${context}

Réponds UNIQUEMENT en JSON strict :
{
  "sectorId": "id_du_secteur",
  "confidence": 0.95,
  "reasoning": "explication courte en 1 phrase"
}

L'id doit être exactement l'un de ces valeurs : artisanat, restauration, sante, immobilier, commerce, services_pro, tech, education, loisirs, transport`;

    const raw = await callGemini(prompt, { temperature: 0.1, maxTokens: 200 });
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const validIds = Object.keys(SECTOR_TEMPLATES) as SectorId[];
    if (!validIds.includes(parsed.sectorId)) {
      throw new Error(`ID invalide reçu : ${parsed.sectorId}`);
    }

    return {
      sectorId: parsed.sectorId as SectorId,
      confidence: parsed.confidence || 0.85,
      method: 'ai',
      reasoning: parsed.reasoning,
    };

  } catch (err) {
    console.warn('[sector-classifier] Fallback keyword matching:', (err as Error).message);

    const allText = [
      data.entreprise, data.nom, data.secteur,
      data.description, data.titre, ...(data.mots_cles || [])
    ].filter(Boolean).join(' ').toLowerCase();

    const matched = getSectorByKeyword(allText);
    if (matched) {
      return {
        sectorId: matched.id,
        confidence: 0.7,
        method: 'keyword',
        reasoning: `Correspondance par mots-clés dans : "${allText.slice(0, 60)}..."`,
      };
    }

    return {
      sectorId: 'services_pro',
      confidence: 0.3,
      method: 'fallback',
      reasoning: 'Aucune correspondance trouvée — template Services Pro appliqué par défaut',
    };
  }
}
