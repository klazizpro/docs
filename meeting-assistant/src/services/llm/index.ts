import { LlmProvider } from '../../types';
import { askAnthropic } from './anthropic';
import { askGemini } from './gemini';
import { askOpenAi, askOpenAiCompatible } from './openai';
import { LlmProviderHandler, LlmRequest } from './types';

const handlers: Record<LlmProvider, LlmProviderHandler> = {
  anthropic: askAnthropic,
  openai: askOpenAi,
  gemini: askGemini,
  'openai-compatible': askOpenAiCompatible,
};

export async function askLlm(request: LlmRequest): Promise<string> {
  const handler = handlers[request.settings.provider];
  if (!handler) {
    throw new Error(`Unsupported provider: ${request.settings.provider}`);
  }

  return handler(request);
}
