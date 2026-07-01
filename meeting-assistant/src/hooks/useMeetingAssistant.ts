import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { getListeningOptions } from '../constants/speech';
import { askLlm } from '../services/llm';
import { sendQuestionToIosShortcut } from '../services/iosShortcut';
import { extractNewQuestions, pickQuestionFromText } from '../services/questionDetector';
import { loadSettings, saveSettings } from '../services/settings';
import { AppSettings, DEFAULT_SETTINGS, SessionItem } from '../types';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SPEECH_PAUSE_MS = Platform.OS === 'web' ? 1200 : 800;

export function useMeetingAssistant() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const seenQuestions = useRef(new Set<string>());
  const transcriptRef = useRef('');
  const interimRef = useRef('');
  const settingsRef = useRef(settings);
  const listeningRef = useRef(false);
  const restartingRef = useRef(false);
  const speechPauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInterimSnapshot = useRef('');

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      settingsRef.current = loaded;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (speechPauseTimer.current) {
        clearTimeout(speechPauseTimer.current);
      }
    };
  }, []);

  const getFullTranscript = useCallback(() => {
    return [transcriptRef.current, interimRef.current].filter(Boolean).join(' ').trim();
  }, []);

  const updateSession = useCallback((id: string, patch: Partial<SessionItem>) => {
    setSessions((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const answerQuestion = useCallback(
    async (question: string, allowRepeat = false) => {
      const normalized = question.trim();
      if (!normalized) {
        setError('No question text to send.');
        return;
      }

      const key = normalized.toLowerCase();
      if (!allowRepeat && seenQuestions.current.has(key)) {
        return;
      }
      seenQuestions.current.add(key);

      const item: SessionItem = {
        id: createId(),
        question: normalized,
        answer: null,
        status: 'loading',
        createdAt: Date.now(),
      };

      setSessions((prev) => [item, ...prev]);
      setError(null);

      const currentSettings = settingsRef.current;

      if (
        currentSettings.answerMode === 'api' &&
        currentSettings.provider !== 'openai-compatible' &&
        !currentSettings.apiKey.trim()
      ) {
        updateSession(item.id, {
          status: 'error',
          error: 'Add your API key in Settings and tap Done.',
        });
        return;
      }

      try {
        if (currentSettings.answerMode === 'ios-shortcut') {
          await sendQuestionToIosShortcut({
            question: normalized,
            shortcutName: currentSettings.shortcutName,
          });
          updateSession(item.id, {
            status: 'done',
            answer:
              'Question sent to your iOS Shortcut. Check the Shortcut output or your LLM app for the answer.',
          });
          return;
        }

        const answer = await askLlm({
          settings: currentSettings,
          question: normalized,
        });

        updateSession(item.id, { status: 'done', answer });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get an answer.';
        updateSession(item.id, { status: 'error', error: message });
        setError(message);
      }
    },
    [updateSession],
  );

  const tryAutoAnswer = useCallback(
    (sourceText?: string) => {
      if (!settingsRef.current.autoAnswer) {
        return;
      }

      const fullText = (sourceText ?? getFullTranscript()).trim();
      const question = pickQuestionFromText(fullText);
      if (!question) {
        return;
      }

      void answerQuestion(question, true);
    },
    [answerQuestion, getFullTranscript],
  );

  const appendTranscript = useCallback((text: string) => {
    const merged = `${transcriptRef.current} ${text}`.trim();
    transcriptRef.current = merged;
    setTranscript(merged);
    setInterimTranscript('');
    interimRef.current = '';
    return merged;
  }, []);

  const scheduleAutoAnswerAfterPause = useCallback(
    (text: string) => {
      if (!settingsRef.current.autoAnswer || !text.trim()) {
        return;
      }

      lastInterimSnapshot.current = text;
      interimRef.current = text;
      setInterimTranscript(text);

      if (speechPauseTimer.current) {
        clearTimeout(speechPauseTimer.current);
      }

      speechPauseTimer.current = setTimeout(() => {
        if (lastInterimSnapshot.current !== text) {
          return;
        }

        const merged = appendTranscript(text);
        tryAutoAnswer(merged);
      }, SPEECH_PAUSE_MS);
    },
    [appendTranscript, tryAutoAnswer],
  );

  const handleTranscriptUpdate = useCallback(
    (text: string, isFinal: boolean) => {
      if (!text.trim()) {
        return;
      }

      if (isFinal) {
        if (speechPauseTimer.current) {
          clearTimeout(speechPauseTimer.current);
        }

        const merged = appendTranscript(text);
        if (settingsRef.current.autoAnswer) {
          const newQuestions = extractNewQuestions(merged, seenQuestions.current);
          newQuestions.forEach((question) => {
            void answerQuestion(question, true);
          });

          if (newQuestions.length === 0) {
            tryAutoAnswer(merged);
          }
        }
      } else {
        scheduleAutoAnswerAfterPause(text);
      }
    },
    [appendTranscript, answerQuestion, scheduleAutoAnswerAfterPause, tryAutoAnswer],
  );

  const restartListeningIfNeeded = useCallback(() => {
    if (!listeningRef.current || restartingRef.current) {
      return;
    }

    restartingRef.current = true;
    void getListeningOptions().then((options) => {
      ExpoSpeechRecognitionModule.start(options);
    });
  }, []);

  useSpeechRecognitionEvent('start', () => {
    listeningRef.current = true;
    setListening(true);
    setError(null);
    restartingRef.current = false;
  });

  useSpeechRecognitionEvent('end', () => {
    if (speechPauseTimer.current) {
      clearTimeout(speechPauseTimer.current);
    }

    if (interimRef.current.trim()) {
      const merged = appendTranscript(interimRef.current);
      tryAutoAnswer(merged);
    }

    if (listeningRef.current && Platform.OS === 'web') {
      restartListeningIfNeeded();
      return;
    }

    listeningRef.current = false;
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results.map((result) => result.transcript).join(' ').trim();
    handleTranscriptUpdate(text, event.isFinal);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') {
      if (listeningRef.current && Platform.OS === 'web') {
        restartListeningIfNeeded();
      }
      return;
    }

    setError(event.message ?? event.error);
    listeningRef.current = false;
    setListening(false);
  });

  const startListening = useCallback(async () => {
    setError(null);

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError('Microphone and speech recognition permissions are required.');
      return;
    }

    const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
    if (!available) {
      setError('Speech recognition is not available on this device.');
      return;
    }

    transcriptRef.current = '';
    interimRef.current = '';
    lastInterimSnapshot.current = '';
    seenQuestions.current.clear();
    setTranscript('');
    setInterimTranscript('');
    setSessions([]);

    listeningRef.current = true;
    const options = await getListeningOptions();
    ExpoSpeechRecognitionModule.start(options);
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    restartingRef.current = false;

    if (speechPauseTimer.current) {
      clearTimeout(speechPauseTimer.current);
    }

    if (interimRef.current.trim()) {
      appendTranscript(interimRef.current);
    }

    ExpoSpeechRecognitionModule.stop();
    setListening(false);

    const fullText = getFullTranscript();
    if (fullText) {
      tryAutoAnswer(fullText);
    }
  }, [appendTranscript, getFullTranscript, tryAutoAnswer]);

  const answerFromTranscript = useCallback(() => {
    const fullText = getFullTranscript();
    const question = pickQuestionFromText(fullText);

    if (!question) {
      setError('No question found. Say something ending with "?" or type a question.');
      return;
    }

    void answerQuestion(question, true);
  }, [answerQuestion, getFullTranscript]);

  const askManually = useCallback(
    (question: string) => {
      void answerQuestion(question, true);
    },
    [answerQuestion],
  );

  const persistSettings = useCallback(async (next: AppSettings) => {
    setSettings(next);
    settingsRef.current = next;
    await saveSettings(next);
  }, []);

  const clearTranscript = useCallback(() => {
    transcriptRef.current = '';
    interimRef.current = '';
    lastInterimSnapshot.current = '';
    seenQuestions.current.clear();
    setTranscript('');
    setInterimTranscript('');
    setSessions([]);
    setError(null);
  }, []);

  const fullTranscript = [transcript, interimTranscript].filter(Boolean).join(' ').trim();

  return {
    ready,
    settings,
    listening,
    transcript,
    interimTranscript,
    fullTranscript,
    sessions,
    error,
    settingsOpen,
    setSettingsOpen,
    startListening,
    stopListening,
    answerFromTranscript,
    askManually,
    persistSettings,
    clearTranscript,
  };
}
