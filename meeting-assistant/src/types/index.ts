export type AnswerMode = 'api' | 'claude-shortcut';

export type SessionItem = {
  id: string;
  question: string;
  answer: string | null;
  status: 'pending' | 'loading' | 'done' | 'error';
  error?: string;
  createdAt: number;
};

export type AppSettings = {
  apiKey: string;
  answerMode: AnswerMode;
  shortcutName: string;
  context: string;
  model: string;
  autoAnswer: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  answerMode: 'api',
  shortcutName: 'Ask Claude Meeting',
  context: '',
  model: 'claude-sonnet-4-20250514',
  autoAnswer: true,
};
