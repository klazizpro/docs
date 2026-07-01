import { StyleSheet, Text, View } from 'react-native';

export function SafariTips() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safari on iPhone</Text>
      <Text style={styles.tip}>• Open this page in <Text style={styles.strong}>Safari</Text> (not an in-app browser)</Text>
      <Text style={styles.tip}>• Tap <Text style={styles.strong}>Share → Add to Home Screen</Text> for an app-like icon</Text>
      <Text style={styles.tip}>• Allow the microphone when Safari asks</Text>
      <Text style={styles.tip}>• Keep Safari open and in the foreground while listening</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#172554',
    borderColor: '#1d4ed8',
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
  strong: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
});
