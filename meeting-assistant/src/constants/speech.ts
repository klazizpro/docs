import {
  AVAudioSessionCategory,
  AVAudioSessionCategoryOptions,
  AVAudioSessionMode,
  ExpoSpeechRecognitionOptions,
} from 'expo-speech-recognition';

export const AMBIENT_LISTENING_OPTIONS: ExpoSpeechRecognitionOptions = {
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
