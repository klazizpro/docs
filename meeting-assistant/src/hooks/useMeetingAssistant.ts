import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { getListeningOptions } from '../constants/speech';
import { askLlm } from '../services/llm';
import { sendQuestionToIosShortcut } from '../services/iosShortcut';
import {
  extractNewQuestions,
  extractTrailingQuestion,
  pickQuestionFromText,
} from '../services/questionDetector';
import { loadSettings, saveSettings } from '../services/settings';
import { AppSettings, DEFAULT_SETTINGS, SessionItem } from '../types';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const INTERIM_QUESTION_DELAY_MS = 700;

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
  const restartingRef = useRef(false);
  const interimQuestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (interimQuestionTimer.current) {
        clearTimeout(interimQuestionTimer.current);
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

  const scheduleInterimQuestionCheck = useCallback(
    (text: string) => {
      if (!settingsRef.current.autoAnswer) {
        return;
      }

      interimRef.current = text;

      if (interimQuestionTimer.current) {
        clearTimeout(interimQuestionTimer.current);
      }

      interimQuestionTimer.current = setTimeout(() => {
        const question = extractTrailingQuestion(interimRef.current);
        if (question) {
          void answerQuestion(question);
        }
      }, INTERIM_QUESTION_DELAY_MS);
    },
    [answerQuestion],
  );

  const processFinalTranscript = useCallback(
    (text: string) => {
      const merged = `${transcriptRef.current} ${text}`.trim();
      transcriptRef.current = merged;
      setTranscript(merged);
      setInterimTranscript('');
      interimRef.current = '';

      if (settingsRef.current.autoAnswer) {
        const newQuestions = extractNewQuestions(merged, seenQuestions.current);
        newQuestions.forEach((question) => {
          void answerQuestion(question, true);
        });
      }
    },
    [answerQuestion],
  );

  const handleTranscriptUpdate = useCallback(
    (text: string, isFinal: boolean) => {
      if (!text.trim()) {
        return;
      }

      if (isFinal) {
        if (interimQuestionTimer.current) {
          clearTimeout(interimQuestionTimer.current);
        }
        processFinalTranscript(text);
      } else {
        interimRef.current = text;
        setInterimTranscript(text);
        scheduleInterimQuestionCheck(text);
      }
    },
    [processFinalTranscript, scheduleInterimQuestionCheck],
  );

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);

    if (interimRef.current.trim()) {
      processFinalTranscript(interimRef.current);
    }

    if (restartingRef.current) {
      restartingRef.current = false;
      void getListeningOptions().then((options) => {
        ExpoSpeechRecognitionModule.start(options);
      });
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results.map((result) => result.transcript).join(' ').trim();
    handleTranscriptUpdate(text, event.isFinal);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') {
      return;
    }

    setError(event.message ?? event.error);
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
    seenQuestions.current.clear();
    setTranscript('');
    setInterimTranscript('');
    setSessions([]);

    const options = await getListeningOptions();
    ExpoSpeechRecognitionModule.start(options);
  }, []);

  const stopListening = useCallback(() => {
    restartingRef.current = false;

    if (interimQuestionTimer.current) {
      clearTimeout(interimQuestionTimer.current);
    }

    if (interimRef.current.trim()) {
      processFinalTranscript(interimRef.current);
    }

    ExpoSpeechRecognitionModule.stop();
    setListening(false);
  }, [processFinalTranscript]);

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
