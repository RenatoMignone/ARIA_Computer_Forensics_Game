# Deployment Guide

ARIA can be deployed as a static GitHub Pages project site through GitHub Actions.

## Public URL

The expected public URL is:

```text
https://renatomignone.github.io/ARIA_Computer_Forensics_Game/
```

This does not replace the personal website hosted at:

```text
https://renatomignone.github.io/
```

GitHub Pages serves the personal website from the user site repository and this game from the project repository path.

## Workflow

The deployment workflow is stored in:

```text
.github/workflows/deploy.yml
```

It runs on pushes to `master` or `main`, builds the Vite application, uploads the `dist/` folder, and publishes it through GitHub Pages.

Before the first deployment, enable GitHub Pages in the repository:

1. Open the GitHub repository settings.
2. Go to `Pages`.
3. Under `Build and deployment`, select `GitHub Actions`.
4. Push to `master` or run the workflow manually from the Actions tab.

## Vite Base Path

The Vite config uses a GitHub Pages base path only during the GitHub Actions build:

```text
/ARIA_Computer_Forensics_Game/
```

Local development still runs from `/`, so `npm run dev` behaves normally.

## Public Demo Mode

The workflow builds the hosted version with:

```env
VITE_PUBLIC_DEMO=true
VITE_LIVE_AI=false
```

This means the public demo uses scripted ARIA responses.

This is intentional. A Gemini API key must not be embedded into a public static frontend because visitors could extract it from the JavaScript bundle.

For the full Live Gemini Flash experience, clone the repository, create a local `.env`, set `VITE_LIVE_AI=true`, add `VITE_GEMINI_KEY`, and run the game locally.

## Submission Check

Before submitting or presenting:

```bash
npm run build
```

The build may report a Vite chunk-size warning. That warning is non-blocking for the current single-page prototype.
