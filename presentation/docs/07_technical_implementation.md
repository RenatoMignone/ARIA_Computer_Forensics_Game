# 07 Technical Implementation

## Stack

ARIA is a browser-based React and Vite game.

Main technologies:

- React 19.
- TypeScript 5.9.
- Vite 7.
- Tailwind CSS 4.
- xterm.js.
- Framer Motion.
- Lucide React.
- Optional Gemini API integration for local live AI mode.

## Repository Map

```text
AI_Game/
  .github/workflows/   GitHub Pages deployment
  docs/                setup, gameplay, assessment, and deployment docs
  presentation/docs/   project context and design reference
  public/              static assets
  scripts/             helper scripts
  src/
    components/        UI and game screens
    context/           game state and reducer
    data/              scenario, claims, connections
    hooks/             audio, toast, and ARIA helpers
    lib/               utility modules
    types/             TypeScript game types
```

## Main Components

- App shell and main menu.
- Difficulty and timer selection.
- Tutorial.
- Evidence vault.
- Workspace and metadata viewer.
- ARIA chat.
- Claim badges.
- Terminal.
- Evidence board.
- Attack timeline.
- Settings, glossary, and Investigator Handbook.
- Save/load modal.
- Final report and debrief.

## Data Files

- `src/data/evidence.json`: evidence content, raw metadata, and hashes.
- `src/data/aria_responses.json`: scripted ARIA responses, claim ground truth, feedback, and hints.
- `src/data/connections.json`: valid cross-evidence relationships and connection lessons.
- `src/data/narrative_events.json`: investigation feedback events.

Scenario data is kept separate from UI logic so the case can be inspected or expanded without rewriting the interface.

## Game State

`src/context/GameContext.tsx` owns the main game state and reducer actions. It tracks phase, score, verdicts, discovered claims, reviewed evidence, found connections, notes, timer state, settings, save data, and debrief data.

The reducer is also where score updates, report submission, connection registration, hint penalties, and prompt-injection penalties are applied.

## AI Modes

### Scripted Mode

Scripted mode is the default and primary mode. It is deterministic, safe for public hosting, and suitable for assessment because claim truth labels are known.

### Live Gemini Mode

Live mode is optional and local. It is enabled with environment variables and sends selected evidence content, raw metadata, and a known claim catalog to Gemini.

If live mode is unavailable, invalid, rate-limited, or exhausted, the game falls back to scripted responses.

## Current UX And Gameplay Safeguards

- Claim validation requires evidence review first.
- Scripted report flow requires the full case claim set before final submission.
- Live AI report flow avoids requiring scripted-only claim IDs.
- Repeated claim registration avoids duplicating already known claim IDs in display order.
- Suspicious prompt-injection attempts are detected and penalized.
- Public asset paths respect the Vite base path for GitHub Pages.

## Deployment

GitHub Pages deployment uses the static scripted build. Private Gemini keys must not be shipped in the public JavaScript bundle.

## Build Status

The project builds with:

```bash
npm run build
```

A Vite bundle-size warning can appear because of interactive libraries. It does not block the build.
