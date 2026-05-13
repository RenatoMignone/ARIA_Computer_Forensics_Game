# 07 Technical Implementation

## Technology Stack

ARIA is implemented as a browser-based application.

The main technologies are:

- React 19.
- TypeScript 5.9.
- Vite 7.
- Tailwind CSS 4.
- xterm.js.
- Framer Motion.
- Lucide React icons.
- Optional Gemini API integration for live AI mode.

The current project is a working React and Vite game prototype.

## Repository Structure

The game source is located in the root of the `AI_Game` repository.

The most important areas are:

```text
AI_Game/
  .github/workflows/
  docs/
  src/
    components/
    context/
    data/
    hooks/
    lib/
    types/
  public/
  scripts/
  presentation/
```

The `docs/` folder contains setup, gameplay, assessment, and deployment documentation. The `presentation/` folder contains material for the final university presentation.

The `presentation/` folder contains the material used to explain the project.

## Main Application Areas

### Components

The `components/` folder contains the main interface elements:

- App shell.
- Difficulty screen.
- Tutorial.
- Evidence vault.
- Workspace.
- ARIA chat.
- Terminal.
- Claim badges.
- Evidence board.
- Debrief screen.
- Settings and glossary modals.
- Investigator Handbook with glossary, how-to-play, and terminal command reference.

### Context

The `context/` folder contains the game state and reducer logic.

This includes selected evidence, score, validated claims, notes, timeline events, discovered connections, tutorial progress, and save data.

### Data

The `data/` folder contains the case content:

- `evidence.json` stores evidence files and metadata.
- `aria_responses.json` stores scripted ARIA responses and claims.
- `connections.json` stores valid cross-evidence relationships.
- `narrative_events.json` stores investigation feedback messages.

This structure makes the scenario data separate from the interface code.

### Scoring

The scoring logic rewards careful verification.

Correctly identifying hallucinations gives more points than verifying true claims because hallucination detection is the central learning objective.

The game also penalizes incorrect validation decisions. This discourages blind trust and blanket skepticism.

## Scripted AI Mode

By default, ARIA uses scripted responses.

This is useful for the course project because it keeps the educational experience controlled and reproducible. Every player can receive the same core claims, and each claim has a known ground truth.

Scripted mode also allows precise scoring and clear debrief explanations.

## Optional Live AI Mode

The game includes optional support for a Gemini-backed live mode when an API key is configured.

This is not required for the main educational experience. The controlled scripted mode remains the primary mode because it supports consistent assessment and predictable classroom demonstration.

If live mode fails because the key is missing, invalid, rate-limited, or exhausted, the game falls back to scripted responses. This prevents the investigation from becoming blocked during a presentation.

Live responses also receive the selected evidence content, raw metadata, and the known claim catalog for that evidence. This reduces repeated duplicate claims and helps the assistant reuse existing claim IDs.

## GitHub Pages Deployment

The repository includes a GitHub Actions workflow for static deployment to GitHub Pages.

The public version is intentionally built in scripted mode:

- It avoids exposing a Gemini API key in the JavaScript bundle.
- It provides a stable demo URL for the professor.
- It keeps live Gemini as a local optional enhancement.

## Save System

The game supports local save and resume functionality through browser local storage.

This allows the player to keep an investigation state on the same browser and device. It does not require a server.

The project removed unused external score-code sharing features because they were not backed by a real server or trustworthy validation system.

## Build Status

The current build passes with:

```bash
npm run build
```

The build may show a Vite bundle-size warning because the application includes several interactive libraries. This warning does not prevent the game from working.

## Technical Design Goal

The implementation is designed to prioritize:

- A playable browser experience.
- Clear separation between game data and interface logic.
- Reproducible educational behavior.
- Fast local development.
- A strong demonstration flow for the course presentation.
- Safe public hosting without leaking API keys.
