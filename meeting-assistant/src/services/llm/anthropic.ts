import { buildMeetingSystemPrompt } from '../../constants/prompts';
import { LlmProviderHandler } from './types';

type ClaudeMessageResponse = {
  content: Array<{ type: string; text?: string }>;
  error?: { message?: string };
};

export const askAnthropic: LlmProviderHandler = async ({ settings, question }) => {
  if (!settings.apiKey.trim()) {
    throw new Error('Add your Anthropic API key in Settings.');
  }

  const response = await fetch(`${settings.baseUrl.replace(/\/$/, '')}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': settings.apiKey.trim(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 600,
      system: buildMeetingSystemPrompt(settings.context),
      messages: [
        {
          role: 'user',
          content: `Question heard from a nearby meeting device:\n"${question}"\n\nProvide a spoken-style answer I can read aloud.`,
        },
      ],
    }),
  });

  const data = (await response.json()) as ClaudeMessageResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Anthropic API error (${response.status})`);
  }

  const text = data.content
    .filter((block) => block.type === 'text' && block.text)
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('The model returned an empty response.');
  }

  return text;
};
