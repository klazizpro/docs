import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SessionItem } from '../types';

type Props = {
  item: SessionItem;
  onRetry?: (question: string) => void;
};

const webAnswerTextStyle =
  Platform.OS === 'web'
    ? ({
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        width: '100%',
      } as const)
    : {};

export function AnswerCard({ item, onRetry }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionLabel}>Question</Text>
      <Text style={styles.question}>{item.question}</Text>

      <Text style={styles.answerLabel}>Suggested answer</Text>
      {item.status === 'loading' && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#2563eb" />
          <Text style={styles.loadingText}>Generating answer…</Text>
        </View>
      )}

      {item.status === 'done' && item.answer && (
        <ScrollView
          style={styles.answerScroll}
          contentContainerStyle={styles.answerScrollContent}
          nestedScrollEnabled
        >
          <Text style={[styles.answer, webAnswerTextStyle]}>{item.answer}</Text>
        </ScrollView>
      )}

      {item.status === 'error' && (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{item.error}</Text>
          {onRetry && (
            <Pressable onPress={() => onRetry(item.question)} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderColor: '#3b82f6',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }
      : {}),
  },
  questionLabel: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  question: {
    color: '#dbeafe',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 14,
  },
  answerLabel: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  answerScroll: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    maxHeight: Platform.OS === 'web' ? 480 : 600,
  },
  answerScrollContent: {
    padding: 16,
  },
  answer: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 32,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
  },
  loadingText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 14,
  },
  error: {
    color: '#b91c1c',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  retry: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
