import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';
import { AnswerCard } from './src/components/AnswerCard';
import { ListenButton } from './src/components/ListenButton';
import { SettingsPanel } from './src/components/SettingsPanel';
import { TranscriptView } from './src/components/TranscriptView';
import { useMeetingAssistant } from './src/hooks/useMeetingAssistant';
import { useWebTheme } from './src/hooks/useWebTheme';

export default function App() {
  useWebTheme();
  const {
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
  } = useMeetingAssistant();

  const [manualQuestion, setManualQuestion] = useState('');

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#60a5fa" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Meeting Assistant</Text>
        <Pressable onPress={() => setSettingsOpen(true)} style={styles.settingsButton}>
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      <ListenButton listening={listening} onStart={startListening} onStop={stopListening} />

      {fullTranscript.length > 0 && (
        <Pressable onPress={answerFromTranscript} style={styles.getAnswerButton}>
          <Text style={styles.getAnswerText}>Get answer</Text>
        </Pressable>
      )}

      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <View style={styles.manualRow}>
        <TextInput
          placeholder="Type a question"
          placeholderTextColor="#6b7280"
          style={styles.manualInput}
          value={manualQuestion}
          onChangeText={setManualQuestion}
          onSubmitEditing={() => {
            askManually(manualQuestion);
            setManualQuestion('');
          }}
        />
        <Pressable
          onPress={() => {
            askManually(manualQuestion);
            setManualQuestion('');
          }}
          style={styles.askButton}
        >
          <Text style={styles.askButtonText}>Ask</Text>
        </Pressable>
      </View>

      <TranscriptView transcript={transcript} interimTranscript={interimTranscript} />

      <View style={styles.answersHeader}>
        <Text style={styles.answersTitle}>Answers</Text>
        <Pressable onPress={clearTranscript}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.answersList} contentContainerStyle={styles.answersContent}>
        {sessions.length === 0 ? (
          <Text style={styles.emptyAnswers}>
            Answers appear here. After speaking, tap Get answer — or type a question above.
          </Text>
        ) : (
          sessions.map((item) => <AnswerCard key={item.id} item={item} onRetry={askManually} />)
        )}
      </ScrollView>

      <SettingsPanel
        visible={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={persistSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#030712',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#030712',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: '#f9fafb',
    fontSize: 24,
    fontWeight: '700',
  },
  settingsButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  settingsText: {
    color: '#dbeafe',
    fontWeight: '600',
  },
  getAnswerButton: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 14,
    marginBottom: 10,
    marginTop: 10,
    paddingVertical: 16,
  },
  getAnswerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#451a1a',
    borderRadius: 10,
    color: '#fecaca',
    marginBottom: 8,
    padding: 12,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  manualInput: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderRadius: 12,
    borderWidth: 1,
    color: '#f9fafb',
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  askButton: {
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  askButtonText: {
    color: '#e5e7eb',
    fontWeight: '700',
  },
  answersHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 8,
  },
  answersTitle: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '700',
  },
  clearText: {
    color: '#93c5fd',
    fontWeight: '600',
  },
  answersList: {
    backgroundColor: '#111827',
    borderRadius: 16,
    flex: 1,
    minHeight: 360,
    paddingHorizontal: 6,
  },
  answersContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingTop: 8,
  },
  emptyAnswers: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    padding: 12,
  },
});
