import { buildMeetingSystemPrompt } from '../../constants/prompts';
import { LlmProviderHandler } from './types';

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string; status?: string };
};

export function normalizeGeminiModel(model: string): string {
  const trimmed = model.trim();
  const normalized = trimmed.toLowerCase().replace(/\s+/g, '-');

  if (normalized.includes('gemini-2.0-flash') || normalized.includes('flash-2')) {
    return 'gemini-2.0-flash';
  }

  if (normalized.includes('gemini-1.5-pro')) {
    return 'gemini-1.5-pro';
  }

  if (normalized.includes('flash')) {
    return 'gemini-2.0-flash';
  }

  return trimmed;
}

export const askGemini: LlmProviderHandler = async ({ settings, question }) => {
  if (!settings.apiKey.trim()) {
    throw new Error('Add your Google AI API key in Settings.');
  }

  const baseUrl = settings.baseUrl.replace(/\/$/, '');
  const model = normalizeGeminiModel(settings.model);
  const url = `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey.trim())}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildMeetingSystemPrompt(settings.context) }],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Question heard from a nearby meeting device:\n"${question}"\n\nProvide a spoken-style answer I can read aloud.`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 600,
        },
      }),
    });
  } catch {
    throw new Error('Network error calling Gemini. Check your connection and try again.');
  }

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(
      data.error?.message ??
        `Gemini API error (${response.status}). Check your API key and model name "${model}".`,
    );
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response. Try model name: gemini-2.0-flash');
  }

  return text;
};
