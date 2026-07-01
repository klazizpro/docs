export type LlmProvider = 'anthropic' | 'openai' | 'gemini' | 'openai-compatible';

export type AnswerMode = 'api' | 'ios-shortcut';

export type SessionItem = {
  id: string;
  question: string;
  answer: string | null;
  status: 'pending' | 'loading' | 'done' | 'error';
  error?: string;
  createdAt: number;
};

export type AppSettings = {
  answerMode: AnswerMode;
  provider: LlmProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  shortcutName: string;
  context: string;
  autoAnswer: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  answerMode: 'api',
  provider: 'anthropic',
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  baseUrl: 'https://api.anthropic.com',
  shortcutName: 'Ask LLM Meeting',
  context: '',
  autoAnswer: true,
};
