import { AppSettings } from '../../types';

export type LlmRequest = {
  settings: AppSettings;
  question: string;
};

export type LlmProviderHandler = (request: LlmRequest) => Promise<string>;
