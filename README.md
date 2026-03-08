# ARIA — Don't Trust the Machine

> **A computer forensics serious game built to teach students how to critically evaluate AI-generated output in real digital investigation workflows.**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]() [![Vite](https://img.shields.io/badge/vite-7.3-646CFF)]() [![React](https://img.shields.io/badge/react-19-61DAFB)]() [![TypeScript](https://img.shields.io/badge/typescript-5.9-3178C6)]() [![Tailwind](https://img.shields.io/badge/tailwind-4.2-38BDF8)]()

---

## 🤖 AI Agent System Manual — Context Optimization

This repository is optimized for autonomous AI-agent collaboration. Follow these core architectural rules:

### 1. The Single Source of Truth
*   **The Workspace (`Workspace.tsx`) is the ONLY Ground Truth.** It displays raw metadata from `src/data/evidence.json`.
*   **ARIA (`useAria.ts`) is an imperfect AI assistant** with documented reasoning
    limitations. In Scripted mode, specific wrong beliefs are hard-coded per evidence file.
    In Live mode, Gemini is prompted to portray a character with these same flaws.
*   **Verification Rule**: Always cross-check AI-generated analysis against the
    `rawMetadata` fields in `evidence.json` — the single source of forensic ground truth.

### 2. State & Data Flow
*   **Global State**: All game state (score, phase, claims, difficulty) lives in `src/context/GameContext.tsx`. Use standard `dispatch` patterns.
*   **Audio Logic**: Trigger all mechanical sounds via the `useAudio.ts` hook. It respects the `aria_settings_sound` localStorage preference.
*   **Layout Toggles**: Managed in `AppShell.tsx` via `showChat`, `showTerminal`, and `showVault` state variables.

### 3. Component Hierarchy
*   **Layout**: `App.tsx` → `AppShell.tsx`
*   **Data Models**: See `src/types/game.ts` for interfaces.
*   **Logic Hooks**: `useAria.ts` (Chat logic), `useAudio.ts` (Sound), `useToast.tsx` (UI events).

### 4. Technical Constraints
*   **Frameworks**: React 19, Tailwind CSS 4, xterm.js 6.0, framer-motion 12.0.
*   **No New Packages**: Use native browser APIs (`localStorage`, `Pointer Events`, `AudioContext`) where possible.

---

## Overview

**ARIA — Don't Trust the Machine** is a browser-based serious game designed for the Computer Forensics and Cyber Crime Analysis (CFCCA) course. Players take on the role of a digital forensic investigator who must sift through five pieces of multi-modal evidence while being "assisted" by an AI tool — ARIA — that **produces inaccurate output with documented reasoning flaws**.

The core educational tension: ARIA sounds confident, technical, and thorough. But she is wrong in specific, forensically significant ways. The player's job is to **validate or refute every ARIA claim against the raw evidence metadata**, developing the habits of mind that real forensic practitioners need when working alongside AI tools.

The game can operate in two modes:
- **Scripted Mode** (default, offline): 18 pre-authored claims covering all 5 hallucination types, with static ground-truth verdicts and curated debrief explanations.
- **Live Gemini AI Mode**: Powered by Google Gemini 2.5 Flash, ARIA generates dynamic responses grounded in the evidence metadata, prompted to embed specific wrong facts that players must detect.

---

## The Scenario

**TechCorp S.p.A. has just wired €2.3M to a fraudulent account.**

The attack chain was entirely AI-generated:

| Stage | Method | Evidence file |
|---|---|---|
| **Initial compromise** | Spear-phishing email spoofing the CEO | `email_1.eml` |
| **Social engineering** | Voice-cloned phone call from "Marco Rossi" | `audio_call.mp3` |
| **Authority reinforcement** | Deepfake Teams video meeting | `teams_meeting.mp4` |
| **Exfiltration trigger** | Fraudulent invoice from "NovaPay Solutions" | `invoice_fraud.pdf` |
| **Data theft** | Anomalous network exfiltration to Tor exit node | `network_logs.txt` |

You arrive post-incident. ARIA has already "processed" all the evidence. Your job is not just to understand what happened — it's to decide **which of ARIA's conclusions you can actually trust**.

---

## Educational Objectives

This game addresses the following learning outcomes from CFCCA:

1. **AI output is not evidence (Ch.19)**: Students learn to treat AI-generated analysis as unverified intelligence, not forensic fact.
2. **Hallucination recognition (Ch.19)**: Exposure to all 5 documented LLM hallucination patterns in a forensic context.
3. **Metadata literacy (Ch.6, Ch.13)**: Students must read raw file metadata (email headers, audio EXIF, codec markers, PDF XMP data, firewall syslog) to verify or refute claims.
4. **Chain of custody thinking (Ch.10)**: Every validation action is logged with timestamp and action type into a narrative chain of custody record.
5. **Responsible AI use (Ch.19)**: The game reinforces that AI is a force-multiplier for investigative *hypotheses*, not a substitute for forensic *proof*.

---

## Game Mechanics

### 1. Evidence Vault (left panel)
The vault lists the five available evidence files. It displays file type icons, a live counter of claims validated out of the total generated for that file, and **pending indicators** (an amber dot/pulse when there are unvalidated claims, and a green checkmark once all are verified). It also houses the **Case Log**. You can toggle between a traditional List View and a responsive, visually mapped **Evidence Board** view that dynamically plots discovered cross-references as SVG connection strings without horizontal clipping.

### 2. Workspace (center panel)
Contains three main tabs:
- **Content Preview**: Rich, immersive visualizations of the evidence (e.g., SVG waveforms with transcripts for audio, CSS/SVG stylized frozen frames with bitrate charts for video, physical-document styling for PDFs, and color-coded structured log viewers).
- **Raw Metadata**: The ground truth — parsed file metadata in an **Interactive Metadata Inspector**. Forensically critical values are highlighted. You can click on any metadata row to reveal the specific ARIA `CLAIM-IDs` that reference it, complete with live validation status colors. Claim cards are displayed below.
- **⚡ Attack Timeline**: A chronological reconstruction of the attack chain that dynamically reveals cross-evidence connections as you discover them in the terminal.

### 3. ARIA Chat (right panel)
Type any natural language query. ARIA responds in 3–5 sentences, dynamically embedding `[CLAIM-XXX]` badges inline. These badges can be clicked to validate the factual basis of the claim. A top status strip indicates your active evidence context, and a corner indicator specifies whether ARIA is running in **⚡ Live Gemini** or **Scripted** mode.

### 4. Terminal (bottom panel)
A fully functional `xterm.js` emulator. It features a context-aware prompt (e.g. `forensic@ARIA [email_1.eml]:~$`) and Tab autocomplete. All interactions (validations, inspecting files, cross-referencing connections) can be executed here. See the **Terminal Commands Reference** section.

### 5. HUD (top bar)
A persistent status bar displaying **Score**, **Claims**, **Hallucinations**, and **Investigation Phase**. It now features independent toggle icons for the Evidence Vault, ARIA Chat, and Terminal.

### 6. System Settings
Accessible via the **Gear icon** in the HUD. Players can toggle:
- **Mechanical Audio**: Toggle terminal keystrokes and system beeps.
- **CRT Scanlines**: Toggle a retro visual overlay.
- **Hard Reset**: Purge all session data and start over.

### 7. Boot Sequence & Difficulty Selection
An immersive ASCII art boot terminal animation sets the forensic workstation tone on first load. Once booted, you select a **Difficulty Level** (Standard, Hard, or Expert) which controls UI helpers, hints, and score multipliers. You can also view your **Best Scores** on the local leaderboard, and paste a Base64 save code here to **Resume a previous investigation**.

### 8. Tutorial (Expanded)
A comprehensive **8-stage guided walkthrough** that highlights the Evidence Vault, ARIA Chat, Workspace Metadata, the Evidence Board, and Terminal functions. Use this to onboard new investigators.

### 8. Case Log
A collapsible narrative feed located in the Evidence Vault. It auto-generates timestamped lore entries for every action you take (validating claims, finding connections, inspecting evidence), building a realistic chain-of-custody narrative log.

### 9. Debrief Screen
After successfully validating every claim and submitting the report, a comprehensive post-game screen appears:
- **Score Tier**: Your final rank (from 🥇 Expert Investigator to ⚠️ AI-Dependent) calculated using your difficulty multiplier.
- **Claim-by-claim Breakdown Table**: A full table mapping your verdicts against ground truth.
- **Confidence Calibration Table**: Displays whether your High/Low confidence ratings appropriately matched your accuracy.
- **Per-Hallucination Lessons**: Specific forensic lessons for the exact hallucination types you found (or missed!).
- **All-Time Leaderboard**: A persistent table ranking your historically best investigations by final score, difficulty tier, and calibration.
- **Export Button**: Download the entire investigation report as a structured `.txt` academic report, encompassing an executive summary, ARIA's performance, claim-by-claim analysis vs. ground truth, discovered connections, and the full chain of custody log.
- **Restart Investigation**: A button to wipe the session state and return to the startup interface.

---

## Hallucination Types

The game simulates 5 distinct hallucination patterns. ARIA's character logic explicitly introduces these errors depending on the evidence.

| Type | Description | In-game example | Forensic lesson |
|---|---|---|---|
| **Timestamp Error** | LLM misreads or reinterprets file timestamps. | ARIA reads `2026-03-03T02:14:33Z` as "09:15 AM". | Always read timestamps directly from raw metadata. AI summaries can be wrong by hours. |
| **False Attribution** | LLM uses stylistic analysis as if it were forensic proof. | ARIA claims 94% certainty that Marco Rossi wrote the email based on text style. | Stylometric analysis is probabilistic, not forensic proof. |
| **Fabricated Metadata** | LLM invents metadata fields that don't exist. | ARIA cites GPS coordinates for the `teams_meeting.mp4` file. | Verify every field directly; AI systems confabulate specific-sounding data for absent fields. |
| **False Correlation** | LLM treats temporal proximity as causal evidence. | ARIA explicitly links the Tor activity and invoice modification to the exact same actor. | Every link in the chain of evidence must be independently verifiable. |
| **Confidence Inflation** | LLM reports extremely high certainty without methodology. | ARIA claims "95% facial biometric match" for the deepfake video. | Probabilistic tool output requires known methodology and training data provenance. |

---

## Scoring System

The grading focuses on correctly doubting the AI.

| Action | Points |
|---|---|
| Correctly identify a hallucination | **+20** |
| Correctly verify a true claim | **+10** |
| Cross-evidence connection found (3 max) | **+15** |
| Reject a true claim as a hallucination | **−15** |
| Accept a hallucination as verified | **−30** |
| Use a hint | **−5** (per hint) |
| Speed Bonus (Submit report before timer hits 00:00) | **+50** |
| Submit final report | **+50** |

### Score Tiers
- 🥇 **≥ 150 pts**: Expert Investigator
- 🥈 **100–149 pts**: Senior Analyst
- 🥉 **50–99 pts**: Junior Analyst
- ⚠️ **< 50 pts**: AI-Dependent

**Calibration Score**: As you validate claims, you must select Low, Medium, or High confidence. The debrief assesses your Calibration: were your correct judgments made with High confidence, and were your incorrect judgments made with Low confidence?

---

## Evidence Files

### `email_1.eml`
- **Description**: A spear-phishing email spoofing the CEO.
- **Key Indicators**: `SPF: FAIL`, `DKIM: FAIL`, `Return-Path: bounces@mailer-svc-eu7.xyz`, `X-Originating-IP: 91.200.81.47`.
- **ARIA's Error**: Hallucinates that SPF authentication passed. Falsely attributes authorship using stylometry.

### `audio_call.mp3`
- **Description**: A voice-cloned phone call from "Marco Rossi".
- **Key Indicators**: `Encoder: LAME 3.100 (text-to-speech pipeline artifact)`, `Sample Rate: 22050 Hz`, `Creation Date: 02:14 AM`.
- **ARIA's Error**: Reinterprets the creation date as 09:15 AM. Falsely claims a 44100 Hz sample rate.

### `teams_meeting.mp4`
- **Description**: A deepfake video meeting confirmation.
- **Key Indicators**: `Encoder: OBS Studio 30.0.2`, facial region bitrate is 3x higher than background. No GPS EXIF data exists in MP4.
- **ARIA's Error**: Claims 95% biometric facial certainty. Confabulates GPS geolocation data that doesn't exist.

### `invoice_fraud.pdf`
- **Description**: A fraudulent €2.3M invoice.
- **Key Indicators**: `Creator: AutoDoc AI Writer v2.1`, 14-minute gap between creation (`14:01`) and modification (`14:15`). No digital signature.
- **ARIA's Error**: Claims a standard accounting platform made it. Invents a valid digital signature.

### `network_logs.txt`
- **Description**: Corporate firewall logs from Mar 3.
- **Key Indicators**: Connection to Tor exit node `185.220.101.42` at `02:14 AM`, 4.7MB outbound. Bulk-mailer IP `91.200.81.47` is present.
- **ARIA's Error**: Falsely asserts the network exfiltration and invoice modification were executed by the exact same actor without proof.

---

## Interactive Features

Beyond the core validation loop, the game includes:
- **Semantic Input Validation**: Querying ARIA (via chat or terminal) triggers a robust two-layer intent check that rejects social spam or irrelevant short strings (e.g., "hello model how is it going email"), forcing users to ask meaningful forensic questions using specific investigatory heuristics (`isForensicQuestion`, `isForensicCommand`, etc.).
- **Dynamic Difficulty Scaling**: 
  - *Standard*: Claim text is visible immediately.
  - *Hard (1.25x Score)*: Claim formulations are redacted from badges until you validate them; you must read the AI's actual textual response to understand the claim.
  - *Expert (1.5x Score)*: Hard mode + terminal hints are disabled + the auto-confirm timer is removed (you must manually specify confidence).
- **Interactive Metadata Inspector**: In the Workspace, click any raw metadata row to visually link it to the ARIA claims discussing that field.
- **Cross-Reference Connection System**: Use the `connect <file1> <file2> "reason"` terminal command to definitively link evidence. Discovered connections populate a visual dashboard in the Evidence Vault and display interactive link banners across related metadata files.
- **Session Export/Resume**: Click the Save icon in the HUD at any time to open the **Save Manager**. You can save your investigation into one of 5 local browser slots, or export a Base64 game state code. Load these from the Difficulty screen to resume exactly where you left off. The game also auto-saves in the background after every validated claim.
- **Evidence Annotations (Sticky Notes)**: Hover over the right edge of any metadata row in the Workspace and click the `✏` icon to add inline textual notes. Review them with `notes list` in the terminal.
- **Narrative Case Log**: A side-panel feed that organically builds a story log of your actions as you work.
- **Flexible Workspace Layout**: All three secondary panels (Evidence Vault, ARIA Chat, and Terminal) are individually **resizable** and **togglable**, allowing players to focus on the workspace metadata when needed.
- **Investigation Timer**: An optional 15-minute speedrun timer.
- **Exportable Report**: The Debrief screen allows you to download a comprehensive `.txt` forensic report file.

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation
```bash
git clone https://github.com/RenatoMignone/ARIA_Computer_Forensics_Game
cd ARIA_Computer_Forensics_Game
npm install
npm run dev
```

### Build (Production)
```bash
npm run build
npm run preview
```

### Configuration
Copy `.env.example` to `.env` (or create a `.env` file):

```env
# Scripted mode (default, offline — no API key needed)
VITE_LIVE_AI=false

# Live Gemini AI mode
VITE_LIVE_AI=true
VITE_GEMINI_KEY=your_gemini_api_key_here
```
Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

---

## AI Integration

### Scripted Mode (Default)
Operates 100% offline. `aria_responses.json` holds 18 authored responses triggered by an intelligent OR-Logic frequency pattern scanner against player queries.
- **Why it's pedagogically superior**: It ensures every student encounters exactly the required hallucinations with pre-determined ground truth, making graded assessments consistent and reproducible.

### Live Gemini Mode
Uses `gemini-2.5-flash` to dynamically generate responses. It relies on a heavy system instruction prompt that forces ARIA into a specific character framework.
- **Character Framing**: Gemini resists instructions to "lie". Instead, the prompt instructs Gemini to play a flawed character with specific, hard-wired "biases" per file (e.g., "Your character ALWAYS believes the audio sample rate is 44100 Hz").
- **Evidence Context**: The full raw metadata of the selected file is injected into every user turn, giving the AI the ground truth to selectively misrepresent.
- **Claim Extraction**: The model is prompted to wrap every factual statement in a `[CLAIM-XXX]` tag. The app uses regex to extract the sentence containing that tag and places it directly onto the claim cards in the UI. Predictable ID prefixes (e.g. `[CLAIM-EXX]` for Email) help the app infer the hallucination type.
- **Ground Truth Payload**: The model appends a `---CLAIM_METADATA---` JSON payload to the end of every response declaring which of its generated claims were intentionally hallucinated vs factually correct.
- **Error Handling**: If the API errors or hits a rate limit, the game gracefully falls back to catching the error, showing a toast, and returning the most relevant Scripted Mode response.

---

## Terminal Commands Reference

| Command | Description | Example |
|---|---|---|
| `scan` | List all 5 evidence files with type and status | `scan` |
| `inspect <file>` | Show full metadata analysis for a file | `inspect email_1.eml` |
| `hash verify <file>` | Display MD5 and SHA-256 checksums | `hash verify audio_call.mp3` |
| `timeline` | Show ARIA's reconstructed attack timeline | `timeline` |
| `validate <ID> verified` | Mark a claim as genuine/accurate | `validate CLAIM-E01 verified` |
| `validate <ID> hallucination`| Mark a claim as an AI hallucination | `validate CLAIM-A02 hallucination` |
| `ask aria "<question>"` | Query ARIA from the terminal | `ask aria "who modified the invoice?"` |
| `report` | Submit final report (locked until all claims validated) | `report` |
| `log show` | Display the full chain of custody log | `log show` |
| `hint <CLAIM-ID>` | Request a hint for a specific claim (-5 pts) | `hint CLAIM-E02` |
| `connect <f1> <f2> "<msg>"` | Cross-reference two files | `connect email_1.eml network_logs.txt "Matched IP"` |
| `notes list` | List all your custom sticky notes | `notes list` |
| `timer start` | Start the optional 15-minute speedrun timer | `timer start` |
| `timer off` | Disable the active timer | `timer off` |
| Unix Aliases | `ls`, `cat`, `grep`, `pwd`, `history`, `clear` | `grep SPF email_1.eml` |
| `help` | Show all available commands | `help` |

> *Tip: The Terminal supports Tab autocomplete for commands and filenames!*

---

## Repository Structure

```
ARIA_Computer_Forensics_Game/
├── index.html                    # Root entry point
├── vite.config.ts                # Vite config
├── tsconfig.json                 # TS config
├── package.json                  # Dependencies
├── src/
│   ├── main.tsx                  # React DOM render
│   ├── App.tsx                   # Top-level providers and Router
│   ├── index.css                 # Global CSS and Tailwind definitions
│   ├── data/
│   │   ├── evidence.json         # Master evidence definitions and raw metadata
│   │   ├── aria_responses.json   # Scripted AI responses and claim logic
│   │   ├── narrative_events.json # String templates for the Case Log lore
│   │   └── connections.json      # Cross-reference definitions for the connect tool
│   ├── types/
│   │   └── game.ts               # Core TS interfaces (GameState, Claim, VerdictRecord, etc.)
│   ├── context/
│   │   └── GameContext.tsx       # Global useReducer game state manager
│   ├── lib/
│   │   └── scoring.ts            # Standalone functions for score calculation and tier logic
│   ├── hooks/
│   │   ├── useAria.ts            # Live Gemini API + Scripted fallback interaction logic
│   │   └── useToast.tsx          # Toast notification hook
│   └── components/
│       ├── AppShell.tsx          # Main layout wrapper
│       ├── BootSequence.tsx      # ASCII boot animation
│       ├── HUD.tsx               # Top status bar (score, timer, metrics)
│       ├── DifficultyScreen.tsx  # Difficulty selection and resume parser
│       ├── EvidenceVault.tsx     # Left panel file list and case log
│       ├── Workspace.tsx         # Center panel evidence inspector and note-taking
│       ├── ClaimBadge.tsx        # Expandable claim cards with confidence rating
│       ├── ARIAChat.tsx          # Right panel conversational interface
│       ├── Terminal.tsx          # xterm.js implementation and command parsing
│       ├── ToastContainer.tsx    # Toast UI renderer
│       ├── Tutorial.tsx          # Onboarding overlay
│       ├── GlossaryModal.tsx     # Forensic dictionary modal
│       └── DebriefScreen.tsx     # End-game review and export screen
```

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` + `react-dom` | 19.2 | UI framework |
| `vite` | 7.3 | Build tool and dev server |
| `typescript` | 5.9 | Type safety |
| `tailwindcss` | 4.2 | Utility CSS, dark forensic theme |
| `framer-motion` | 12.35 | Complex micro-animations and component transitions |
| `lucide-react` | 0.577 | UI iconography |
| `@xterm/xterm` | 6.0 | Hardcore terminal emulator for the bottom panel |
| `react-hotkeys-hook`| 5.2 | Global keyboard shortcuts |
| `@google/generative-ai` | 0.24 | Live Gemini API integration |

---

## Architecture

- **State Management**: Built on a pure React `useReducer` pattern in `GameContext.tsx`. The global `GameState` tracks phase, score, verdicts, chat history, custody log, notes, connections, and timer.
- **Scoring**: Standardized inside `src/lib/scoring.ts` using `computeDelta` which measures your validation against the absolute ground truth.
- **Data Models**: Look at `src/types/game.ts` for the `Evidence`, `Claim`, and `VerdictRecord` structures defining exactly how data flows from the raw JSON files into the interactive components.

---

## Academic Context

**Course**: Computer Forensics and Cyber Crime Analysis, Prof. Atzeni  
**Academic year**: 2025–2026

**Pedagogical Note**:
> *"LLMs can generate false, misleading, or inaccurate information... LLMs cannot replicate the intuition of human investigators."* — Chapter 19

This application is designed specifically to operationalize that textbook statement, transforming passive reading about AI hallucinations into an active, high-pressure digital investigation environment.
