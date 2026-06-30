import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { askClaude } from '../services/claude';
import { sendQuestionToClaudeShortcut } from '../services/claudeShortcut';
import { extractNewQuestions } from '../services/questionDetector';
import { loadSettings, saveSettings } from '../services/settings';
import { AppSettings, DEFAULT_SETTINGS, SessionItem } from '../types';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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
  const settingsRef = useRef(settings);
  const restartingRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setReady(true);
    });
  }, []);

  const updateSession = useCallback((id: string, patch: Partial<SessionItem>) => {
    setSessions((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const answerQuestion = useCallback(
    async (question: string) => {
      const item: SessionItem = {
        id: createId(),
        question,
        answer: null,
        status: 'loading',
        createdAt: Date.now(),
      };

      setSessions((prev) => [item, ...prev]);

      const currentSettings = settingsRef.current;

      try {
        if (currentSettings.answerMode === 'claude-shortcut') {
          await sendQuestionToClaudeShortcut({
            question,
            shortcutName: currentSettings.shortcutName,
          });
          updateSession(item.id, {
            status: 'done',
            answer:
              'Question copied and sent to your Claude Shortcut. Open Claude to read the answer, or check your Shortcut output.',
          });
          return;
        }

        const answer = await askClaude({
          apiKey: currentSettings.apiKey,
          question,
          context: currentSettings.context,
          model: currentSettings.model,
        });

        updateSession(item.id, { status: 'done', answer });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get an answer.';
        updateSession(item.id, { status: 'error', error: message });
      }
    },
    [updateSession],
  );

  const handleTranscriptUpdate = useCallback(
    (text: string, isFinal: boolean) => {
      if (!text.trim()) {
        return;
      }

      if (isFinal) {
        const merged = `${transcriptRef.current} ${text}`.trim();
        transcriptRef.current = merged;
        setTranscript(merged);
        setInterimTranscript('');

        const newQuestions = extractNewQuestions(merged, seenQuestions.current);
        if (settingsRef.current.autoAnswer) {
          newQuestions.forEach((question) => {
            void answerQuestion(question);
          });
        }
      } else {
        setInterimTranscript(text);
      }
    },
    [answerQuestion],
  );

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);

    if (restartingRef.current) {
      restartingRef.current = false;
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
        iosTaskHint: 'dictation',
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
    seenQuestions.current.clear();
    setTranscript('');
    setInterimTranscript('');
    setSessions([]);

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true,
      iosTaskHint: 'dictation',
    });
  }, []);

  const stopListening = useCallback(() => {
    restartingRef.current = false;
    ExpoSpeechRecognitionModule.stop();
    setListening(false);
  }, []);

  const askManually = useCallback(
    (question: string) => {
      const normalized = question.trim();
      if (!normalized) {
        return;
      }

      seenQuestions.current.add(normalized.toLowerCase());
      void answerQuestion(normalized);
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
    seenQuestions.current.clear();
    setTranscript('');
    setInterimTranscript('');
    setSessions([]);
    setError(null);
  }, []);

  return {
    ready,
    settings,
    listening,
    transcript,
    interimTranscript,
    sessions,
    error,
    settingsOpen,
    setSettingsOpen,
    startListening,
    stopListening,
    askManually,
    persistSettings,
    clearTranscript,
  };
}
