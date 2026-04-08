import { buildEffectPreviewHTML, saveEffectPreview } from '../services/effect-preview-generator';

export interface GeneratedEffect {
  code: string;
  metadata: {
    concepts: string[];
    modules: string[];
    qualityScore: number;
  };
  qualityReport: {
    overallScore: number;
  };
}

class Orchestrator {
  async generateEffect(
    description: string,
    platform: string,
    options: unknown
  ): Promise<GeneratedEffect> {
    const code = `// Effet généré pour: ${description}\n// Plateforme: ${platform}`;
    return {
      code,
      metadata: { concepts: [], modules: [], qualityScore: 80 },
      qualityReport: { overallScore: 80 },
    };
  }

  async buildPreview(jobId: string, description: string, platform: string, code: string): Promise<string> {
    const previewId = `effect_${jobId}`;
    const html = buildEffectPreviewHTML({
      previewId,
      code,
      description,
      concepts: [],
      modules: [],
      qualityScore: 80,
      platform,
    });
    return saveEffectPreview(previewId, html);
  }
}

export const orchestrator = new Orchestrator();
