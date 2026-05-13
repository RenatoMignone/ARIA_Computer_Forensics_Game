# Setup and API Key Guide

This document explains how to prepare ARIA for local development, classroom demos, and optional Gemini-backed live AI mode.

## Requirements

- Node.js 20 or newer
- npm
- A modern browser such as Chrome, Edge, or Firefox
- Optional: a Google Gemini API key for live AI mode

The game works without an API key. In the default scripted mode, all ARIA answers come from the curated responses in `src/data/aria_responses.json`, which is the recommended mode for stable university presentations.

## Local Setup

From the project root:

```bash
npm install
npm run dev
```

Vite will print a local URL, usually similar to:

```text
http://localhost:5173/
```

Open that URL in the browser to start the game.

## Production Build

Before presenting or submitting the project, run:

```bash
npm run build
```

This command checks TypeScript and creates the production build in `dist/`.

To preview the production build locally:

```bash
npm run preview
```

## Environment File

Create a local environment file by copying the example:

```bash
cp .env.example .env
```

The `.env` file is intentionally ignored by Git because it may contain private API keys.

## Scripted Mode

Scripted mode is the default and does not need any API key:

```env
VITE_LIVE_AI=false
```

Use this mode when the game needs deterministic behavior, especially during grading, demonstrations, and formal presentations.

## Gemini API Key

Live AI mode is optional. To use it, create a Gemini API key from Google AI Studio:

```text
https://aistudio.google.com/apikey
```

After creating the key, add it to `.env`:

```env
VITE_LIVE_AI=true
VITE_GEMINI_KEY=your_gemini_api_key_here
```

Restart the development server after editing `.env`, because Vite reads environment variables when the server starts.

## Important Security Notes

- Do not commit `.env`.
- Do not paste a real API key into screenshots, reports, or presentation slides.
- If a key is accidentally committed or shared, revoke it in Google AI Studio and create a new one.
- For a formal demo, prefer scripted mode unless live AI behavior is explicitly being evaluated.

## Troubleshooting

If live mode does not activate:

- Check that the variable name is exactly `VITE_GEMINI_KEY`.
- Check that `VITE_LIVE_AI=true` is present in `.env`.
- Restart `npm run dev`.
- Confirm that the key is active in Google AI Studio.

If the project does not start:

- Run `npm install` again.
- Check that Node.js is installed with `node --version`.
- Delete only generated folders such as `node_modules/` and `dist/` if you need a clean reinstall, then run `npm install`.
