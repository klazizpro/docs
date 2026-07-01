import { buildMeetingSystemPrompt } from '../../constants/prompts';
import { LlmProviderHandler } from './types';

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

export const askGemini: LlmProviderHandler = async ({ settings, question }) => {
  if (!settings.apiKey.trim()) {
    throw new Error('Add your Google AI API key in Settings.');
  }

  const baseUrl = settings.baseUrl.replace(/\/$/, '');
  const model = settings.model;
  const url = `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey.trim())}`;

  const response = await fetch(url, {
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

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini API error (${response.status})`);
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('The model returned an empty response.');
  }

  return text;
};
