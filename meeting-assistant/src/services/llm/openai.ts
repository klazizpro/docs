import { buildMeetingSystemPrompt } from '../../constants/prompts';
import { LlmProviderHandler } from './types';

type OpenAiResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

async function fetchOpenAiChat(
  request: Parameters<LlmProviderHandler>[0],
  requireApiKey: boolean,
): Promise<string> {
  const { settings, question } = request;

  if (requireApiKey && !settings.apiKey.trim()) {
    throw new Error('Add your OpenAI API key in Settings.');
  }

  const baseUrl = settings.baseUrl.replace(/\/$/, '');
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (settings.apiKey.trim()) {
    headers.Authorization = `Bearer ${settings.apiKey.trim()}`;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 600,
      messages: [
        { role: 'system', content: buildMeetingSystemPrompt(settings.context) },
        {
          role: 'user',
          content: `Question heard from a nearby meeting device:\n"${question}"\n\nProvide a spoken-style answer I can read aloud.`,
        },
      ],
    }),
  });

  const data = (await response.json()) as OpenAiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `OpenAI API error (${response.status})`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('The model returned an empty response.');
  }

  return text;
}

export const askOpenAi: LlmProviderHandler = (request) => fetchOpenAiChat(request, true);

export const askOpenAiCompatible: LlmProviderHandler = (request) =>
  fetchOpenAiChat(request, false);
