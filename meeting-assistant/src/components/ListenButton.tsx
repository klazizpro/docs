import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  listening: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function ListenButton({ listening, onStart, onStop }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={listening ? onStop : onStart}
      style={({ pressed }) => [
        styles.button,
        listening ? styles.stop : styles.start,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.dot, listening && styles.dotActive]} />
      <Text style={styles.label}>{listening ? 'Stop listening' : 'Start listening'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  start: {
    backgroundColor: '#1f6feb',
  },
  stop: {
    backgroundColor: '#b42318',
  },
  pressed: {
    opacity: 0.85,
  },
  dot: {
    backgroundColor: '#ffffffaa',
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
