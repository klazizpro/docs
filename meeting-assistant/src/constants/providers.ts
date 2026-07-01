import { LlmProvider } from '../types';

export type ProviderConfig = {
  id: LlmProvider;
  name: string;
  description: string;
  defaultModel: string;
  defaultBaseUrl: string;
  apiKeyPlaceholder: string;
  modelExamples: string[];
};

export const LLM_PROVIDERS: ProviderConfig[] = [
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Claude models via the Anthropic API.',
    defaultModel: 'claude-sonnet-4-20250514',
    defaultBaseUrl: 'https://api.anthropic.com',
    apiKeyPlaceholder: 'sk-ant-...',
    modelExamples: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-latest'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models via the OpenAI API.',
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    apiKeyPlaceholder: 'sk-...',
    modelExamples: ['gpt-4o-mini', 'gpt-4o'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini models via the Google AI API.',
    defaultModel: 'gemini-2.0-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKeyPlaceholder: 'AIza...',
    modelExamples: ['gemini-2.0-flash', 'gemini-1.5-pro'],
  },
  {
    id: 'openai-compatible',
    name: 'OpenAI-compatible',
    description: 'Any OpenAI-style endpoint: Ollama, Groq, Together, local servers, etc.',
    defaultModel: 'llama3.2',
    defaultBaseUrl: 'http://localhost:11434/v1',
    apiKeyPlaceholder: 'optional for local servers',
    modelExamples: ['llama3.2', 'mistral', 'qwen2.5'],
  },
];

export function getProviderConfig(provider: LlmProvider): ProviderConfig {
  return LLM_PROVIDERS.find((item) => item.id === provider) ?? LLM_PROVIDERS[0];
}
