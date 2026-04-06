import { rotator } from './api-key-rotator';
import Anthropic from '@anthropic-ai/sdk';
import { log } from '../vite';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_VERSION = 'v1';
const MAX_RETRIES = 5;

export async function callGemini(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    isVision?: boolean;
    imageBase64?: string;
    retryCount?: number;
  } = {}
): Promise<string> {
  const retryCount = options.retryCount || 0;
  if (retryCount >= MAX_RETRIES) {
    log('Gemini: max retries atteint — fallback Claude', 'gemini-wrapper');
    return callGeminiFallbackClaude(prompt, options);
  }

  let key;
  try {
    key = await rotator.selectBestKey('gemini');
  } catch (err: any) {
    log(`Gemini pool épuisé: ${err.message} — fallback Claude`, 'gemini-wrapper');
    return callGeminiFallbackClaude(prompt, options);
  }

  const start = Date.now();

  try {
    const parts: any[] = options.isVision && options.imageBase64
      ? [{ text: prompt }, { inline_data: { mime_type: 'image/png', data: options.imageBase64 } }]
      : [{ text: prompt }];

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2000,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${key.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      await rotator.handleError(key, response.status, errText);

      if (response.status === 404) {
        log(`Gemini ${key.id} modèle introuvable (404) — clé suivante`, 'gemini-wrapper');
        return callGemini(prompt, { ...options, retryCount: retryCount + 1 });
      }

      if (response.status === 429) {
        log(`Gemini ${key.id} rate limit (429) — rotation clé`, 'gemini-wrapper');
        return callGemini(prompt, { ...options, retryCount: retryCount + 1 });
      }

      log(`Gemini ${key.id} erreur ${response.status} — retry`, 'gemini-wrapper');
      return callGemini(prompt, { ...options, retryCount: retryCount + 1 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Réponse Gemini vide');

    await rotator.recordSuccess(key, Date.now() - start);
    log(`Gemini ${key.id} succès en ${Date.now() - start}ms`, 'gemini-wrapper');
    return text;
  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      await rotator.handleError(key, 408, 'Timeout');
    } else if (!err.message?.includes('retry')) {
      await rotator.handleError(key, 500, err.message);
    }
    log(`Gemini ${key.id} exception: ${err.message} — retry`, 'gemini-wrapper');
    return callGemini(prompt, { ...options, retryCount: retryCount + 1 });
  }
}

async function callGeminiFallbackClaude(prompt: string, options: any): Promise<string> {
  try {
    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY non disponible');

    const anthropic = new Anthropic({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined,
    });

    const messages: any[] = [];
    if (options.isVision && options.imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: options.imageBase64 } },
          { type: 'text', text: prompt },
        ],
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: options.maxTokens ?? 2000,
      messages,
    });

    log('Gemini → fallback Claude Opus réussi', 'gemini-wrapper');
    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  } catch (err: any) {
    throw new Error(`Gemini + Claude fallback échoués: ${err.message}`);
  }
}
