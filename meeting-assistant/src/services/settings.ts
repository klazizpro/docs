import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getProviderConfig } from '../constants/providers';
import { AppSettings, DEFAULT_SETTINGS, LlmProvider } from '../types';

const SETTINGS_KEY = 'meeting-assistant-settings-v2';
const LEGACY_SETTINGS_KEY = 'meeting-assistant-settings-v1';
const API_KEY_KEY = 'meeting-assistant-api-key';

type LegacySettings = Partial<Omit<AppSettings, 'answerMode'>> & {
  answerMode?: string;
};

function normalizeProvider(value: unknown): LlmProvider {
  if (
    value === 'anthropic' ||
    value === 'openai' ||
    value === 'gemini' ||
    value === 'openai-compatible'
  ) {
    return value;
  }

  return DEFAULT_SETTINGS.provider;
}

function migrateSettings(parsed: LegacySettings, apiKey: string): AppSettings {
  const provider = normalizeProvider(parsed.provider);
  const providerDefaults = getProviderConfig(provider);

  const answerMode =
    parsed.answerMode === 'claude-shortcut'
      ? 'ios-shortcut'
      : parsed.answerMode === 'ios-shortcut'
        ? 'ios-shortcut'
        : parsed.answerMode === 'api'
          ? 'api'
          : DEFAULT_SETTINGS.answerMode;

  return {
    answerMode,
    provider,
    apiKey,
    model: parsed.model ?? providerDefaults.defaultModel,
    baseUrl: parsed.baseUrl ?? providerDefaults.defaultBaseUrl,
    shortcutName: parsed.shortcutName ?? DEFAULT_SETTINGS.shortcutName,
    context: parsed.context ?? '',
    autoAnswer: parsed.autoAnswer ?? DEFAULT_SETTINGS.autoAnswer,
  };
}

async function loadApiKey(): Promise<string> {
  if (Platform.OS === 'web') {
    return (await AsyncStorage.getItem(API_KEY_KEY)) ?? '';
  }

  return (await SecureStore.getItemAsync(API_KEY_KEY)) ?? '';
}

async function saveApiKey(apiKey: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (apiKey.trim()) {
      await AsyncStorage.setItem(API_KEY_KEY, apiKey.trim());
    } else {
      await AsyncStorage.removeItem(API_KEY_KEY);
    }
    return;
  }

  if (apiKey.trim()) {
    await SecureStore.setItemAsync(API_KEY_KEY, apiKey.trim());
  } else {
    await SecureStore.deleteItemAsync(API_KEY_KEY);
  }
}

export async function loadSettings(): Promise<AppSettings> {
  const apiKey = await loadApiKey();
  const raw =
    (await AsyncStorage.getItem(SETTINGS_KEY)) ??
    (await AsyncStorage.getItem(LEGACY_SETTINGS_KEY));

  if (!raw) {
    return { ...DEFAULT_SETTINGS, apiKey };
  }

  try {
    return migrateSettings(JSON.parse(raw) as LegacySettings, apiKey);
  } catch {
    return { ...DEFAULT_SETTINGS, apiKey };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { apiKey, ...rest } = settings;

  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));
  await saveApiKey(apiKey);
}
