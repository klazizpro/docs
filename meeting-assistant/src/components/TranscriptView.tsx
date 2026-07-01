import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  transcript: string;
  interimTranscript: string;
};

export function TranscriptView({ transcript, interimTranscript }: Props) {
  const display = [transcript, interimTranscript].filter(Boolean).join(' ').trim();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Heard</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.text}>{display || '…'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heading: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  scroll: {
    maxHeight: 40,
  },
  content: {
    paddingBottom: 2,
  },
  text: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
});
