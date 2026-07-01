# Meeting Assistant

A mobile app for **meetings and interviews on a separate device** (laptop, tablet, another phone). Your phone listens through its microphone, detects questions from the audio, and shows LLM-generated answers you can read aloud.

Built with **Expo (React Native)** for iPhone and Android.

## How it works

```
[Laptop / tablet runs Zoom, Teams, interview call]
              ↓ speaker audio
[Your phone — Meeting Assistant listens via mic]
              ↓ speech-to-text
[Question detected] → [Your chosen LLM] → [Answer on screen]
```

**This phone does not join the meeting.** It only picks up sound from the other device's speakers.

## Setup for separate-device listening

1. Run the meeting or interview on a **laptop or tablet** (Zoom, Teams, Google Meet, phone call on speaker, etc.)
2. Place this phone **6–12 inches** from that device's speaker
3. Use **speakers on the meeting device**, not earbuds — otherwise this phone cannot hear the interviewer
4. Tap **Start listening** and keep this app in the foreground
5. Read the suggested answers on screen

## LLM providers (swap anytime)

The app is **LLM-agnostic**. In **Settings → LLM provider**, choose:

| Provider | Use case |
|----------|----------|
| **Anthropic (Claude)** | Claude models via API key |
| **OpenAI** | GPT-4o, GPT-4o-mini, etc. |
| **Google Gemini** | Gemini Flash / Pro |
| **OpenAI-compatible** | Ollama, Groq, Together, LM Studio, any `/v1/chat/completions` endpoint |

You can change provider, model, and API base URL at any time without reinstalling.

### Using Claude on your iPhone (without API)

If you have the **Claude app** installed but prefer not to use the API:

1. Settings → **iOS Shortcut (external app)**
2. Create a Shortcut with: Receive input → **Ask Claude** → Show result
3. Name it `Ask LLM Meeting` (or match the name in Settings)

Same pattern works for ChatGPT or any app with a Shortcuts action.

### Local models (Ollama)

1. Run Ollama on your Mac: `ollama serve`
2. Settings → **OpenAI-compatible**
3. Base URL: `http://YOUR_MAC_IP:11434/v1` (same Wi‑Fi as your phone)
4. Model: e.g. `llama3.2`

## Quick start

```bash
cd meeting-assistant
npm install
npx expo start
```

Scan the QR code with **Expo Go**, or build natively:

```bash
npx expo run:ios    # macOS + Xcode required
npx expo run:android
```

For reliable microphone access, use a **development build** or production build rather than Expo Go.

## Project structure

```
meeting-assistant/
├── App.tsx
├── src/
│   ├── constants/
│   │   ├── providers.ts      # LLM provider presets
│   │   └── speech.ts         # Ambient listening audio config
│   ├── services/
│   │   ├── llm/              # Provider-specific API clients
│   │   ├── questionDetector.ts
│   │   └── settings.ts
│   └── components/
│       └── ListeningTips.tsx # Separate-device setup guide
```

## Limitations

- **Audio quality** depends on speaker volume, room noise, and phone placement
- **iOS backgrounding** may pause speech recognition — keep the app open
- **Privacy** — get consent before recording others; follow workplace and local laws
- **API vs app** — Claude/ChatGPT app subscriptions are separate from API keys

## License

MIT
