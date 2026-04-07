import { rotator } from './api-key-rotator';
import Anthropic from '@anthropic-ai/sdk';
import { log } from '../vite';

const MAX_RETRIES = 5;
const CEREBRAS_MODEL = 'qwen-3-235b-a22b-instruct-2507';

export async function callCerebras(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    retryCount?: number;
    _fromGemini?: boolean;
  } = {}
): Promise<string> {
  const retryCount = options.retryCount || 0;
  if (retryCount >= MAX_RETRIES) {
    log('Cerebras: max retries atteint — fallback Claude', 'cerebras-wrapper');
    return callCerebrasClaudeFallback(prompt, options);
  }

  let key;
  try {
    key = await rotator.selectBestKey('cerebras');
  } catch (err: any) {
    log(`Cerebras pool épuisé: ${err.message} — fallback Claude`, 'cerebras-wrapper');
    return callCerebrasClaudeFallback(prompt, options);
  }

  const start = Date.now();

  const messages: { role: string; content: string }[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CEREBRAS_MODEL,
        messages,
        max_tokens: options.maxTokens ?? 2000,
        temperature: options.temperature ?? 0.7,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const errText = await response.text();
      await rotator.handleError(key, response.status, errText);

      if (response.status === 404) {
        log(`Cerebras ${key.id} modèle introuvable (404) — clé suivante`, 'cerebras-wrapper');
        return callCerebras(prompt, { ...options, retryCount: retryCount + 1 });
      }

      if (response.status === 429) {
        log(`Cerebras ${key.id} rate limit (429) — rotation clé`, 'cerebras-wrapper');
        return callCerebras(prompt, { ...options, retryCount: retryCount + 1 });
      }

      if (response.status === 401 || response.status === 403) {
        log(`Cerebras ${key.id} clé invalide (${response.status}) — clé suivante`, 'cerebras-wrapper');
        return callCerebras(prompt, { ...options, retryCount: retryCount + 1 });
      }

      log(`Cerebras ${key.id} erreur ${response.status} — retry`, 'cerebras-wrapper');
      return callCerebras(prompt, { ...options, retryCount: retryCount + 1 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Réponse Cerebras vide');

    await rotator.recordSuccess(key, Date.now() - start);
    log(`Cerebras ${key.id} succès en ${Date.now() - start}ms`, 'cerebras-wrapper');
    return text;
  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      await rotator.handleError(key, 408, 'Timeout');
    } else if (!err.message?.includes('retry')) {
      await rotator.handleError(key, 500, err.message);
    }
    log(`Cerebras ${key.id} exception: ${err.message} — retry`, 'cerebras-wrapper');
    return callCerebras(prompt, { ...options, retryCount: retryCount + 1 });
  }
}

async function callCerebrasClaudeFallback(prompt: string, options: any): Promise<string> {
  try {
    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Éviter la boucle infinie : si on vient de Gemini, ne pas rappeler Gemini
      if (options._fromGemini) {
        throw new Error('Cerebras et Gemini indisponibles (pas de fallback Claude)');
      }
      const { callGemini } = await import('./gemini-wrapper');
      const fullPrompt = options.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt;
      log('Cerebras → fallback Gemini (pas de clé Claude)', 'cerebras-wrapper');
      return await callGemini(fullPrompt, { maxTokens: options.maxTokens, _fromCerebras: true });
    }

    const anthropic = new Anthropic({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined,
    });

    const messages: any[] = [{ role: 'user', content: prompt }];

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: options.maxTokens ?? 2000,
      system: options.systemPrompt,
      messages,
    });

    log('Cerebras → fallback Claude Haiku réussi', 'cerebras-wrapper');
    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  } catch (err: any) {
    throw new Error(`Cerebras + Claude fallback échoués: ${err.message}`);
  }
}
