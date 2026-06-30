import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppSettings, AnswerMode } from '../types';

type Props = {
  visible: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
};

const MODES: { id: AnswerMode; title: string; description: string }[] = [
  {
    id: 'api',
    title: 'Claude API (in-app answers)',
    description: 'Fastest option. Uses your Anthropic API key and shows answers inside this app.',
  },
  {
    id: 'claude-shortcut',
    title: 'Claude iPhone app (Shortcut)',
    description:
      'Sends the question to an iOS Shortcut that uses the "Ask Claude" action from your installed Claude app.',
  },
];

export function SettingsPanel({ visible, settings, onClose, onSave }: Props) {
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Done</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Answer source</Text>
          {MODES.map((mode) => {
            const selected = settings.answerMode === mode.id;
            return (
              <Pressable
                key={mode.id}
                onPress={() => onSave({ ...settings, answerMode: mode.id })}
                style={[styles.modeCard, selected && styles.modeCardSelected]}
              >
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </Pressable>
            );
          })}

          {settings.answerMode === 'api' && (
            <>
              <Text style={styles.label}>Anthropic API key</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="sk-ant-..."
                placeholderTextColor="#6b7280"
                secureTextEntry
                style={styles.input}
                value={settings.apiKey}
                onChangeText={(apiKey) => onSave({ ...settings, apiKey })}
              />

              <Text style={styles.label}>Claude model</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="claude-sonnet-4-20250514"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={settings.model}
                onChangeText={(model) => onSave({ ...settings, model })}
              />
            </>
          )}

          {settings.answerMode === 'claude-shortcut' && (
            <>
              <Text style={styles.label}>Shortcut name</Text>
              <TextInput
                autoCapitalize="words"
                placeholder="Ask Claude Meeting"
                placeholderTextColor="#6b7280"
                style={styles.input}
                value={settings.shortcutName}
                onChangeText={(shortcutName) => onSave({ ...settings, shortcutName })}
              />
              <Text style={styles.help}>
                Create a Shortcut in the Shortcuts app: receive input → Ask Claude → show result.
                Name it exactly as above.
              </Text>
            </>
          )}

          <Text style={styles.label}>Your background (resume, role, talking points)</Text>
          <TextInput
            multiline
            placeholder="Paste your resume summary, job description, or key facts Claude should use."
            placeholderTextColor="#6b7280"
            style={[styles.input, styles.textArea]}
            value={settings.context}
            onChangeText={(context) => onSave({ ...settings, context })}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchTitle}>Auto-answer detected questions</Text>
              <Text style={styles.switchDescription}>
                When enabled, new questions trigger Claude automatically.
              </Text>
            </View>
            <Switch
              value={settings.autoAnswer}
              onValueChange={(autoAnswer) => onSave({ ...settings, autoAnswer })}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#030712',
    flex: 1,
    paddingTop: 56,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#1f2937',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700',
  },
  close: {
    color: '#60a5fa',
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modeCard: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  modeCardSelected: {
    borderColor: '#2563eb',
  },
  modeTitle: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  modeDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderRadius: 12,
    borderWidth: 1,
    color: '#f9fafb',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  help: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  switchCopy: {
    flex: 1,
  },
  switchTitle: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
  },
});
