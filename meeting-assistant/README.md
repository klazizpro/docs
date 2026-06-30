# Meeting Assistant

A mobile app that listens to meetings and interviews, detects questions from speech, and generates concise text answers you can read aloud — powered by Claude.

Built with **Expo (React Native)** for iPhone and Android.

## What it does

1. **Listens** to the room via your phone microphone
2. **Transcribes** speech in real time
3. **Detects questions** (e.g. sentences ending with `?`, or starting with "what", "how", "tell me", etc.)
4. **Sends questions to Claude** and shows suggested answers on screen

## Claude integration (two options)

### Option A — Claude API (recommended, answers in-app)

Uses the [Anthropic API](https://docs.anthropic.com/en/api/getting-started) with the same Claude models. You need an API key from [console.anthropic.com](https://console.anthropic.com/).

> **Note:** The Claude iPhone app subscription and the API are separate products. The API gives the fastest in-app experience.

1. Open **Settings** in the app
2. Choose **Claude API (in-app answers)**
3. Paste your API key
4. Add your resume / background context for better interview answers

### Option B — Claude iPhone app via Shortcuts (iOS 18+)

If you already have the **Claude** app installed, you can route questions through an iOS Shortcut using Apple's **Ask Claude** action ([Anthropic guide](https://support.anthropic.com/en/articles/10263469-using-claude-app-intents-and-shortcuts-on-ios)).

1. Open the **Shortcuts** app on your iPhone
2. Create a new Shortcut named `Ask Claude Meeting`
3. Add actions:
   - **Receive input** (or use Shortcut Input)
   - **Ask Claude** (pass the input)
   - **Show result** or **Copy to clipboard**
4. In Meeting Assistant **Settings**, choose **Claude iPhone app (Shortcut)** and set the shortcut name to match

When a question is detected, the app copies the question and runs your Shortcut.

## Quick start (development)

```bash
cd meeting-assistant
npm install
npx expo start
```

Then scan the QR code with **Expo Go** on your phone, or run a development build:

```bash
npx expo run:ios    # requires macOS + Xcode
npx expo run:android
```

For microphone access on a real device, use a **development build** or production build — Expo Go has limitations for some native features.

## iOS limitations to know

- **In-person meetings:** Works well — the mic picks up nearby speakers.
- **Phone / video calls:** iOS does **not** let third-party apps access call audio directly. The mic may only hear your voice and faint speaker audio depending on setup.
- **Background listening:** iOS may pause speech recognition when the app is backgrounded.
- **Privacy & consent:** Recording or transcribing others without consent may be illegal in your region. Use responsibly and follow workplace rules.

## Project structure

```
meeting-assistant/
├── App.tsx                          # Main UI
├── src/
│   ├── hooks/useMeetingAssistant.ts # Listen → detect → answer flow
│   ├── services/
│   │   ├── claude.ts                # Anthropic API
│   │   ├── claudeShortcut.ts        # iOS Shortcut handoff
│   │   ├── questionDetector.ts      # Question heuristics
│   │   └── settings.ts              # Secure API key storage
│   └── components/                  # UI components
```

## Tips for interviews

1. Paste a short **resume summary** and the **job description** into Settings → background context.
2. Keep **auto-answer** on so questions are answered as they are detected.
3. Read answers naturally — shorten them in your own words if needed.
4. Test in a mock interview before using it live.

## License

MIT
