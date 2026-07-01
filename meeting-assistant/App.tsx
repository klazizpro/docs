import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Platform,
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
import { ListeningTips } from './src/components/ListeningTips';
import { SafariTips } from './src/components/SafariTips';
import { SettingsPanel } from './src/components/SettingsPanel';
import { TranscriptView } from './src/components/TranscriptView';
import { useMeetingAssistant } from './src/hooks/useMeetingAssistant';

export default function App() {
  const {
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
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Meeting Assistant</Text>
          <Text style={styles.subtitle}>
            Hear a nearby laptop or tablet, detect questions, get LLM answers
          </Text>
        </View>
        <Pressable onPress={() => setSettingsOpen(true)} style={styles.settingsButton}>
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      <ListeningTips />
      {Platform.OS === 'web' && <SafariTips />}

      <ListenButton listening={listening} onStart={startListening} onStop={stopListening} />

      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <View style={styles.manualRow}>
        <TextInput
          placeholder="Or type / paste a question manually"
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
            Questions picked up from the other device and LLM answers will show up here. Choose your
            provider in Settings and add your resume for better interview answers.
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: '#f9fafb',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
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
  errorBanner: {
    backgroundColor: '#451a1a',
    borderRadius: 10,
    color: '#fecaca',
    marginTop: 12,
    padding: 12,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
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
    paddingVertical: 12,
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
    marginBottom: 8,
    marginTop: 14,
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
    flex: 1,
  },
  answersContent: {
    paddingBottom: 24,
  },
  emptyAnswers: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
});
