import { StyleSheet, Text, View } from 'react-native';

export function ListeningTips() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listening from another device</Text>
      <Text style={styles.tip}>
        Run your Zoom, Teams, or interview call on a laptop or tablet. This phone only listens through
        its microphone — it does not join the meeting.
      </Text>
      <Text style={styles.tip}>• Place this phone 6–12 inches from the other device&apos;s speaker</Text>
      <Text style={styles.tip}>• Use the meeting device&apos;s speakers, not earbuds, so audio reaches this phone</Text>
      <Text style={styles.tip}>• Keep this phone screen on and the app in the foreground while listening</Text>
      <Text style={styles.tip}>• Test once in a quiet room before a real interview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderColor: '#1e3a8a',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  title: {
    color: '#bfdbfe',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  tip: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
});
