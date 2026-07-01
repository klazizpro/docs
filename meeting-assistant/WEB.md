# Use Meeting Assistant in Safari (iPhone)

No Mac or app install needed. Open the web app in **Safari** on your iPhone.

## Live URL

After GitHub Pages is enabled (see below):

**https://klazizpro.github.io/docs/**

## One-time setup on your iPhone

1. Open **Safari** on your iPhone
2. Go to **https://klazizpro.github.io/docs/**
3. Tap **Share** (square with arrow) → **Add to Home Screen**
4. Name it **Meeting Assistant** → **Add**

You now have an app icon on your home screen.

## First use

1. Open **Meeting Assistant** from your home screen
2. Tap **Allow** when Safari asks for the **microphone**
3. Tap **Settings** → choose your LLM provider and paste your API key
4. Run your meeting on a **laptop or tablet** (speakers on)
5. Place your iPhone near that device's speaker
6. Tap **Start listening**

## Enable GitHub Pages (repo owner, one time)

If the link above does not load yet:

1. On any device, open your GitHub repo: `https://github.com/klazizpro/docs`
2. Go to **Settings → Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. Go to **Actions** → **Deploy Meeting Assistant Web** → **Run workflow** (must run on the **master** branch)

> **Note:** Deployments only work from the `master` branch due to GitHub environment protection rules. If you see "branch is not allowed to deploy", make sure the workflow runs on `master`, not a feature branch.

## Safari tips

- Use **Safari**, not Chrome or an in-app browser (LinkedIn, Instagram, etc.)
- Keep the app **in the foreground** while listening
- Speech recognition on iPhone Safari may pause if you switch apps
- For best audio pickup, use the meeting device's **speakers**, not earbuds

## LLM providers

Same as the native app — change anytime in **Settings**:

- Anthropic (Claude)
- OpenAI
- Google Gemini
- OpenAI-compatible (Ollama, Groq, etc.)

Your API key is stored in your browser's local storage on your phone only.
