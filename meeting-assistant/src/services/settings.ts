import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AppSettings, DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'meeting-assistant-settings-v1';
const API_KEY_KEY = 'meeting-assistant-api-key';

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  const apiKey = (await SecureStore.getItemAsync(API_KEY_KEY)) ?? '';

  if (!raw) {
    return { ...DEFAULT_SETTINGS, apiKey };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      apiKey,
    };
  } catch {
    return { ...DEFAULT_SETTINGS, apiKey };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { apiKey, ...rest } = settings;

  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));

  if (apiKey.trim()) {
    await SecureStore.setItemAsync(API_KEY_KEY, apiKey.trim());
  } else {
    await SecureStore.deleteItemAsync(API_KEY_KEY);
  }
}
