import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

const SHORTCUT_PROMPT = `Meeting question to answer:\n`;

export async function sendQuestionToClaudeShortcut(params: {
  question: string;
  shortcutName: string;
}): Promise<void> {
  const { question, shortcutName } = params;
  const payload = `${SHORTCUT_PROMPT}${question}`;

  await Clipboard.setStringAsync(payload);

  const encodedName = encodeURIComponent(shortcutName);
  const encodedInput = encodeURIComponent(payload);
  const shortcutUrl = `shortcuts://run-shortcut?name=${encodedName}&input=${encodedInput}`;

  const canOpen = await Linking.canOpenURL(shortcutUrl);
  if (canOpen) {
    await Linking.openURL(shortcutUrl);
    return;
  }

  throw new Error(
    `Could not open Shortcut "${shortcutName}". Create it in the Shortcuts app using the "Ask Claude" action, then set the same name in Settings.`,
  );
}
