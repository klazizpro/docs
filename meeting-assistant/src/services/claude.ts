import { buildMeetingSystemPrompt } from '../constants/prompts';

type ClaudeMessageResponse = {
  content: Array<{ type: string; text?: string }>;
  error?: { message?: string };
};

export async function askClaude(params: {
  apiKey: string;
  question: string;
  context: string;
  model: string;
}): Promise<string> {
  const { apiKey, question, context, model } = params;

  if (!apiKey.trim()) {
    throw new Error('Add your Anthropic API key in Settings to use in-app answers.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: buildMeetingSystemPrompt(context),
      messages: [
        {
          role: 'user',
          content: `Question heard in the meeting:\n"${question}"\n\nProvide a spoken-style answer I can read aloud.`,
        },
      ],
    }),
  });

  const data = (await response.json()) as ClaudeMessageResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Claude API error (${response.status})`);
  }

  const text = data.content
    .filter((block) => block.type === 'text' && block.text)
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Claude returned an empty response.');
  }

  return text;
}
