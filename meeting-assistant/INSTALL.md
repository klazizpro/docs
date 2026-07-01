# Install Meeting Assistant on Your Phone

**App name on your home screen:** `Meeting Assistant`

Yes — you run it **on your phone**. The meeting stays on your laptop/tablet; the phone listens and shows answers.

---

## Important: Expo Go is not enough

This app uses the microphone and speech recognition, which need a **real install** (development or production build). Scanning with the regular **Expo Go** app will not work reliably.

---

## Option A — Install on iPhone (recommended, no Mac required)

Uses [Expo Application Services (EAS)](https://expo.dev/eas) to build in the cloud and install on your phone.

### One-time setup (on your computer)

1. Install Node.js if you do not have it: https://nodejs.org
2. Open a terminal in the project folder:

```bash
cd meeting-assistant
npm install
npm install -g eas-cli
eas login
```

Create a free Expo account if prompted.

3. Link the project:

```bash
eas init
```

4. Build an installable iPhone app:

```bash
eas build --profile preview --platform ios
```

5. When the build finishes, EAS gives you a **link** or **QR code**.
6. Open that link **on your iPhone** in Safari and follow the steps to install.
7. If iOS asks you to trust the developer: **Settings → General → VPN & Device Management** → trust the profile.

You only need to repeat step 4 when the app code changes. Day-to-day use is just opening **Meeting Assistant** on your phone.

---

## Option B — Install on iPhone with a Mac

If you have a Mac with Xcode:

1. Connect your iPhone with a USB cable.
2. In terminal:

```bash
cd meeting-assistant
npm install
npx expo run:ios --device
```

3. Select your iPhone when prompted. The app installs like any other dev app.

---

## Option C — Install on Android

```bash
cd meeting-assistant
npm install
eas build --profile preview --platform android
```

Open the build link on your Android phone and install the APK.

Or with Android Studio / USB:

```bash
npx expo run:android --device
```

---

## After install — first launch

1. Open **Meeting Assistant**
2. Allow **microphone** and **speech recognition** when asked
3. Tap **Settings** and choose your LLM provider (Claude, OpenAI, Gemini, etc.)
4. For interviews: put your laptop next to the phone, speakers on, then tap **Start listening**

---

## App identity

| Field | Value |
|-------|--------|
| Display name | **Meeting Assistant** |
| Project folder | `meeting-assistant` |
| iOS bundle ID | `com.meetingassistant.app` |

The app is **not** on the App Store yet — you install it yourself via EAS or Xcode as above.
