import { Platform } from 'react-native';
import { ExpoSpeechRecognitionOptions } from 'expo-speech-recognition';

const WEB_LISTENING_OPTIONS: ExpoSpeechRecognitionOptions = {
  lang: 'en-US',
  interimResults: true,
  continuous: true,
};

async function getNativeListeningOptions(): Promise<ExpoSpeechRecognitionOptions> {
  const {
    AVAudioSessionCategory,
    AVAudioSessionCategoryOptions,
    AVAudioSessionMode,
  } = await import('expo-speech-recognition');

  return {
    lang: 'en-US',
    interimResults: true,
    continuous: true,
    iosTaskHint: 'dictation',
    iosCategory: {
      category: AVAudioSessionCategory.playAndRecord,
      categoryOptions: [
        AVAudioSessionCategoryOptions.defaultToSpeaker,
        AVAudioSessionCategoryOptions.allowBluetooth,
      ],
      mode: AVAudioSessionMode.measurement,
    },
    androidIntentOptions: {
      EXTRA_LANGUAGE_MODEL: 'web_search',
    },
  };
}

export async function getListeningOptions(): Promise<ExpoSpeechRecognitionOptions> {
  if (Platform.OS === 'web') {
    return WEB_LISTENING_OPTIONS;
  }

  return getNativeListeningOptions();
}
