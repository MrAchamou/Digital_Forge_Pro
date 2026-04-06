import { rotator } from './api-key-rotator';
import { log } from '../vite';

const MAX_RETRIES = 3;
const CEREBRAS_MODEL = 'llama-3.3-70b';

export async function callCerebras(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    retryCount?: number;
  } = {}
): Promise<string> {
  const retryCount = options.retryCount || 0;
  if (retryCount >= MAX_RETRIES) {
    log('Cerebras: max retries atteint — fallback Gemini', 'cerebras-wrapper');
    return callCerebrasGeminiFallback(prompt, options);
  }

  let key;
  try {
    key = await rotator.selectBestKey('cerebras');
  } catch (err: any) {
    log(`Cerebras pool épuisé: ${err.message} — fallback Gemini`, 'cerebras-wrapper');
    return callCerebrasGeminiFallback(prompt, options);
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
      log(`Cerebras ${key.id} erreur ${response.status} — retry`, 'cerebras-wrapper');
      return callCerebras(prompt, { ...options, retryCount: retryCount + 1 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Réponse Cerebras vide');

    await rotator.recordSuccess(key, Date.now() - start);
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

async function callCerebrasGeminiFallback(prompt: string, options: any): Promise<string> {
  try {
    const { callGemini } = await import('./gemini-wrapper');
    const fullPrompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;
    log('Cerebras → fallback Gemini', 'cerebras-wrapper');
    return await callGemini(fullPrompt, { maxTokens: options.maxTokens });
  } catch (err: any) {
    throw new Error(`Cerebras + Gemini fallback échoués: ${err.message}`);
  }
}
