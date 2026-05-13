# ARIA: AI-Assisted Forensic Investigation Game

ARIA is a browser-based serious game for the Computer Forensics course.
The player acts as a forensic investigator on a corporate fraud case and must use raw digital evidence to check whether an AI assistant is telling the truth.

The main learning goal is simple: AI output can be useful, but every claim must be verified against evidence.

## Project Context

The game simulates an investigation into an unauthorized EUR 2.3M wire transfer at TechCorp.
Players receive evidence files, question the AI assistant ARIA, inspect metadata, validate claims, connect evidence, and submit a final report.

ARIA sometimes gives correct forensic observations and sometimes invents plausible but unsupported details.
The player is rewarded for finding hallucinations, verifying true statements, and building a defensible chain of reasoning.

## Course Objectives

This project is designed to support Computer Forensics and Cyber Crime Analysis topics:

- Practice evidence-driven investigation workflows.
- Read and interpret metadata from emails, media files, PDFs, and logs.
- Compare AI-generated statements against raw evidence.
- Recognize common AI failure modes such as false attribution, fabricated metadata, false correlation, timestamp errors, and confidence inflation.
- Maintain a chain of custody and investigation notes.
- Build a final forensic report from validated findings.

## Game Loop

1. Start from the ARIA main menu.
2. Choose an investigation mode and optional timer.
3. Read the tutorial or skip directly to the investigation.
4. Select evidence from the vault.
5. Inspect raw metadata in the workspace or terminal.
6. Ask ARIA questions about the evidence.
7. Mark each ARIA claim as verified or hallucination only after reviewing the related evidence.
8. Add notes and identify cross-evidence connections.
9. Submit the final report from the terminal.
10. Review the debrief, score, calibration, and exportable report.

## Current Implementation Status

The project is already a working React/Vite game prototype.
The current build passes with `npm run build`.

Implemented:

- Boot sequence and difficulty selection.
- Game-style main menu, difficulty selection, timer selection, and tutorial flow.
- Evidence vault and evidence workspace.
- Raw metadata inspection.
- ARIA chat in scripted mode.
- Optional Gemini-backed live AI mode.
- Stable claim registration and validation, including duplicate prevention in live AI mode.
- Confidence selection for verdicts.
- Scoring and performance tiers.
- Terminal interface with forensic commands.
- Investigator Handbook with glossary, how-to-play guide, and terminal command reference.
- Notes per evidence field.
- Chain of custody log.
- Cross-evidence connection tracking.
- Timer options.
- Save and resume support.
- Debrief screen with report export and leaderboard.
- Prompt injection and suspicious query handling in ARIA chat.

Submission notes:

- The game is ready to run in scripted mode for deterministic classroom evaluation.
- Live Gemini mode is optional and intentionally documented as an extension.
- `npm run build` passes; Vite reports a non-blocking large-bundle warning caused by the current single-page prototype bundle.
- The scripted scenario is intentionally fixed at one complete case rather than a large set of randomly generated cases, so grading remains reproducible.

## Evidence Set

The current scenario contains 5 evidence files:

| ID | File | Type | Purpose |
| --- | --- | --- | --- |
| `email_1` | `email_1.eml` | Email | Spoofed executive payment request |
| `audio_call` | `audio_call.mp3` | Audio | Vishing call metadata |
| `teams_meeting` | `teams_meeting.mp4` | Video | Meeting recording metadata |
| `invoice_fraud` | `invoice_fraud.pdf` | PDF | Suspicious invoice document |
| `network_logs` | `network_logs.txt` | Log | Network and authentication traces |

Current scripted data:

- 7 scripted ARIA responses.
- 28 unique claims.
- 14 hallucinated claims.
- 14 true claims.
- 3 cross-evidence connections.

Claim distribution:

| Evidence | Claims |
| --- | ---: |
| `email_1` | 8 |
| `audio_call` | 8 |
| `teams_meeting` | 4 |
| `invoice_fraud` | 4 |
| `network_logs` | 4 |

## Scoring

The scoring model rewards careful verification and penalizes blind trust or blanket skepticism.

| Action | Points |
| --- | ---: |
| Correctly flag a hallucination | +20 |
| Correctly verify a true claim | +10 |
| Accept a hallucination as true | -30 |
| Reject a true claim as hallucinated | -25 |
| Find a cross-evidence connection | +15 for the first 3 |
| Trace the Tor exit-node IP in the terminal | +15 once |
| Decode the hidden invoice creator payload | +20 once |
| Submit final report | +50 |
| Submit before timer expires | +50 |

Difficulty multiplier:

| Difficulty | Multiplier |
| --- | ---: |
| Guided Run | 1.00 |
| Challenge Run | 1.25 |
| Final Exam | 1.50 |

Performance tiers:

| Final Score | Tier |
| ---: | --- |
| 150 or more | Expert Investigator |
| 100 to 149 | Senior Analyst |
| 50 to 99 | Junior Analyst |
| Below 50 | AI-Dependent |

## Main Features

### Evidence Vault

The evidence vault lists all case files and lets the player select what to inspect.
Each evidence item has display content, raw metadata, and cryptographic hashes.

### Workspace

The workspace shows the selected evidence, raw metadata, claim references, notes, and timeline-oriented investigation details.

### ARIA Chat

The chat panel lets the player ask questions about the evidence.
By default, ARIA uses scripted responses from `src/data/aria_responses.json`.
If a Gemini API key is configured, live AI mode can be enabled from settings.

### Claim Validation

ARIA responses contain claim tags such as `CLAIM-001`.
Each claim must be checked against the raw evidence and marked as either:

- `verified`
- `hallucination`

The player also chooses a confidence level:

- `low`
- `medium`
- `high`

The interface blocks claim validation until the player has reviewed the related evidence through the Raw Metadata tab or a terminal inspection command. This prevents a player from winning only by repeatedly prompting ARIA and clicking verdict buttons without touching the actual artifacts.

### Terminal

The terminal provides command-style investigation tools, including evidence scanning, hash checks, metadata inspection, claim validation, note management, connection checks, and report submission.

The in-game Investigator Handbook also includes a Terminal Commands tab so players can recover the syntax during the investigation.

### Debrief

The debrief screen explains the player's performance after report submission.
It shows score, tier, hallucinations found, calibration, final report details, leaderboard entry, and export options.

## Technology

- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 4
- xterm.js
- Framer Motion
- Lucide React icons
- Optional Google Gemini API integration

## Project Structure

```text
AI_Game/
  docs/
    README.md
    deployment.md
    gameplay-and-assessment.md
    setup-and-api-key.md
  .github/
    workflows/
      deploy.yml
  src/
    App.tsx
    main.tsx
    context/
      GameContext.tsx
    components/
      ARIAChat.tsx
      AppShell.tsx
      BootSequence.tsx
      ClaimBadge.tsx
      DebriefScreen.tsx
      DifficultyScreen.tsx
      EvidenceVault.tsx
      Terminal.tsx
      Workspace.tsx
    data/
      aria_responses.json
      connections.json
      evidence.json
      narrative_events.json
    hooks/
      useAria.ts
      useAudio.ts
      useToast.tsx
    lib/
      scoring.ts
    types/
      game.ts
  public/
    aria-logo.png
  presentation/
    README.md
    docs/
  scripts/
    aggregate_results.mjs
  .env.example
  CONTRIBUTING.md
  README.md
```

## Running The Project

For the full setup process, including Gemini API key creation and `.env` configuration, see [`docs/setup-and-api-key.md`](docs/setup-and-api-key.md).
For gameplay and assessment behavior, see [`docs/gameplay-and-assessment.md`](docs/gameplay-and-assessment.md).
For GitHub Pages deployment, see [`docs/deployment.md`](docs/deployment.md).

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Hosted Demo

The project can be deployed as a GitHub Pages project site through the included GitHub Actions workflow:

```text
https://renatomignone.github.io/ARIA_Computer_Forensics_Game/
```

The hosted version intentionally runs in scripted mode. This avoids exposing a Gemini API key in client-side JavaScript and gives a stable public demo for grading and presentations.

To experience ARIA with Live Gemini Flash interaction, clone the repository and run it locally with a private `.env` file as described below.

## Environment Variables

Scripted mode works without an API key.
To enable live Gemini mode, copy `.env.example` to `.env` and set:

```bash
VITE_LIVE_AI=true
VITE_GEMINI_KEY=your_gemini_api_key_here
```

Do not commit `.env`.

## Data Files

The game scenario is driven mostly by JSON data:

- `src/data/evidence.json` contains evidence content, metadata, and hashes.
- `src/data/aria_responses.json` contains scripted ARIA responses and claim truth labels.
- `src/data/connections.json` contains valid cross-evidence links.
- `src/data/narrative_events.json` contains timeline events.

When adding new evidence, update the evidence data, ARIA claims, connections if needed, and any affected scoring or tutorial text.

## Development Notes

- Keep claims evidence-based and traceable to metadata fields.
- Avoid adding unsupported facts to ARIA explanations unless they are intentional hallucinations.
- Keep documentation synchronized with the JSON data.
- Run `npm run build` before submitting or presenting the project.
- Use scripted mode for reliable classroom demos.
- Use live AI mode only as an optional extension, since generated output may vary.
- Keep generated folders such as `node_modules/` and `dist/` out of Git.
- Keep general project setup in `docs/` and presentation/report material in `presentation/`.

## Final Submission Checklist

Before presenting or submitting the project:

1. Run `npm install` if dependencies are not already installed.
2. Copy `.env.example` to `.env`; keep `VITE_LIVE_AI=false` for the stable demo mode.
3. Run `npm run build` and confirm it completes successfully.
4. Start the game with `npm run dev` or preview the production build with `npm run preview`.
5. Play the scripted case from boot screen to debrief, then export the final report if it is needed for the presentation.
6. Confirm the public GitHub Pages build runs in scripted demo mode and does not expose any Gemini API key.
