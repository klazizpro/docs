import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SessionItem } from '../types';

type Props = {
  item: SessionItem;
  onRetry?: (question: string) => void;
};

export function AnswerCard({ item, onRetry }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionLabel}>Question</Text>
      <Text style={styles.question}>{item.question}</Text>

      <Text style={styles.answerLabel}>Suggested answer</Text>
      {item.status === 'loading' && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#60a5fa" />
          <Text style={styles.loadingText}>Claude is thinking…</Text>
        </View>
      )}

      {item.status === 'done' && item.answer && (
        <Text style={styles.answer} selectable>
          {item.answer}
        </Text>
      )}

      {item.status === 'error' && (
        <View>
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
    backgroundColor: '#0b1220',
    borderColor: '#1d4ed8',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
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
    color: '#86efac',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  answer: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 30,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  error: {
    color: '#fca5a5',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  retry: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
});
