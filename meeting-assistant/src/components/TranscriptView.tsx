import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  transcript: string;
  interimTranscript: string;
};

export function TranscriptView({ transcript, interimTranscript }: Props) {
  const display = [transcript, interimTranscript].filter(Boolean).join(' ').trim();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Live transcript</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.text}>
          {display || 'Speech from the nearby device will appear here as you listen.'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 140,
    padding: 14,
  },
  heading: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 8,
  },
  text: {
    color: '#e5e7eb',
    fontSize: 16,
    lineHeight: 24,
  },
});
