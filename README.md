# ARIA - Don't Trust the Machine

> **A computer forensics serious game built to teach students how to critically evaluate AI-generated output in real digital investigation workflows.**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]() [![Vite](https://img.shields.io/badge/vite-7.3-646CFF)]() [![React](https://img.shields.io/badge/react-19-61DAFB)]() [![TypeScript](https://img.shields.io/badge/typescript-5.9-3178C6)]() [![Tailwind](https://img.shields.io/badge/tailwind-4.2-38BDF8)]()

---

## Overview

**ARIA: AI-assisted Research & Investigation Assistant** – **"Don't Trust the Machine"**

This is a browser-based serious game designed for the Computer Forensics and Cyber Crime Analysis (CFCCA) course that teaches forensic investigators to operate with **critical thinking** within **hybrid (Human-AI) ecosystems**. Players take on the role of a digital forensic investigator who must sift through five pieces of multi-modal evidence while being "assisted" by an AI tool – ARIA – that **produces inaccurate output with documented reasoning flaws**.

**Strategic Vision & The Core Tension**

ARIA teaches a fundamental truth: **AI output is an investigative lead, not forensic evidence**. The integration of LLMs into investigative workflows is already a reality, but ARIA addresses the ultimate risk – the delegation of judgment. Students learn to validate AI-generated outputs by cross-referencing them with actual **raw metadata**, developing the **methodical doubt** that distinguishes an expert analyst from a mere tool operator.

The core educational tension is operationalized in gameplay: ARIA sounds confident, technical, and thorough. But she is wrong in specific, forensically significant ways. Your job is to **validate or refute every ARIA claim against the raw evidence metadata**, developing the habits of mind that real forensic practitioners need when working alongside AI tools.

**Learning Objectives**

- **Evidence Deconstruction**: Understanding that even the most confident AI response must be verified against binary logs and metadata.
- **Identifying Systematic Hallucinations**: Developing a specific forensic competency in recognizing timestamp errors, false attributions, manufactured correlations, and the model's "inflated confidence."
- **Skepticism Calibration**: Refining the instinct to determine when skepticism is justified (critical analysis) versus when it becomes paralyzing.
- **Responsible Integration**: Leveraging AI as a hypothesis multiplier while maintaining total control over the **chain of custody** and **scientific validation**.
- **Hierarchy of Trust**: Learning to trust **raw data** and your own **scientific rigor** more than the fluid (and often fallible) narrative of the machine.

**The Technological Foundation**

To ensure absolute realism, ARIA integrates **Gemini 2.5-Flash via API** and does not use pre-written scripts – the model generates dynamic responses in real-time. The system is prompted to simulate specific **investigative biases** (e.g., misreporting an audio sample rate or ignoring a specific system flag). In the event of API downtime, the game switches to a transparent offline mode, simulating the real-world risks of cloud dependency in critical environments.

**Game Modes**

The game can operate in two modes:
- **Scripted Mode** (default, offline): 18 pre-authored claims covering all 5 hallucination types, with static ground-truth verdicts and curated debrief explanations. No API key required.
- **Live Gemini AI Mode**: Powered by Google Gemini 2.5 Flash, ARIA generates dynamic responses grounded in the evidence metadata, prompted to embed specific wrong facts that players must detect. Requires a free Gemini API key.

**The Fundamental Teaching**

ARIA transforms the theoretical notion that "AI can hallucinate" into an **operational instinct**. Every action in the game forces you to ask: "What **raw metadata** contradicts this conclusion?" This is not just theory – it is high-stakes practice where every oversight impacts your score, calibration, and final investigator tier.

ARIA prepares the professionals of the future to harness the speed of LLMs without ever sacrificing the integrity and rigor required in a court of law.

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

You arrive post-incident. ARIA has already "processed" all the evidence. Your job is not just to understand what happened - it's to decide **which of ARIA's conclusions you can actually trust**.

---

## Innovation: Novel Theme in Forensic Education

**ARIA explores a **brand-new pedagogical frontier** in digital forensics: teaching students to work *alongside* AI systems while maintaining investigative rigor and skepticism.**

This game addresses a critical gap in forensic education: the textbooks teach how to analyze evidence and chain of custody, but they do not teach **how to critically evaluate AI-generated output within a real investigation workflow**. As LLMs and generative models become standard tools in digital forensic suites (automated log analysis, pattern recognition, evidence summarization), practitioners urgently need training in:

1. **AI Integration Without Blind Trust**: Using AI as a force-multiplier for hypothesis generation while refusing to accept AI conclusions as evidence
2. **Hallucination Recognition in Context**: Understanding that LLM hallucinations are not random errors - they are systematic, patterned failures (timestamp misreads, stylometric overconfidence, confabulated metadata) that are **forensically dangerous**
3. **Responsible Tool Use**: Developing the investigative instinct to ask "which specific metadata contradicts this AI claim?" rather than "does this sound plausible?"
4. **Calibration of Self**: Learning when to trust your own skepticism vs. when you're being unreasonably dismissive of legitimate AI analysis

**Why This Matters:**
The 2025–2026 CFCCA curriculum recognizes that AI is now embedded in every major forensic platform (EnCase, Cellebrite, Autopsy plugins, cloud-provider analysis tools). Students need hands-on experience **pressure-testing AI output** in a controlled, high-stakes environment - before they encounter AI-assisted analysis in real courtroom-ready investigations where errors have legal consequences.

**ARIA's Innovation:**
Rather than teaching AI skepticism in isolation (lectures on hallucinations, case studies of LLM failures), this game **operationalizes** that learning: students must validate every AI claim against raw forensic ground truth under time pressure, with scoring penalties for both false acceptance and false rejection of AI analysis. This transforms passive awareness of AI limitations into an **active, embodied investigative habit**.

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
- **Raw Metadata**: The ground truth - parsed file metadata in an **Interactive Metadata Inspector**. Forensically critical values are highlighted. You can click on any metadata row to reveal the specific ARIA `CLAIM-IDs` that reference it, complete with live validation status colors. Claim cards are displayed below.
- **⚡ Attack Timeline**: A chronological reconstruction of the attack chain that dynamically reveals cross-evidence connections as you discover them in the terminal.

### 3. ARIA Chat (right panel)
Type any natural language query. ARIA responds in 3–5 sentences, dynamically embedding `[CLAIM-XXX]` badges inline. When ARIA self-reports a numerical confidence or certainty (e.g. *"95% confidence"*, *"74% certainty match"*), a **colour-coded confidence meter** bar renders beneath the message - green for low (< 50 %), amber for moderate (50–85 %), red for inflated (> 85 %) - directly reinforcing the Confidence Inflation hallucination lesson. A top status strip shows your active evidence context. A corner indicator shows whether ARIA is running in **⚡ Live Gemini** (green) or **📋 Scripted** mode (amber if Live AI failed during the session).

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
An immersive ASCII art boot terminal animation sets the forensic workstation tone on first load. Once booted, you select a **Difficulty Level** (Standard, Hard, or Expert) which controls UI helpers, hints, and score multipliers. Selecting a difficulty opens a **timer prompt modal** letting you choose an investigation time limit (45 min, 30 min, or no timer) before the session begins. A **📋 View Last Debrief** button above the difficulty options lets you review your most recent investigation summary (score, tier, hallucination detection rate, calibration) without starting a new game. You can also view your **Best Scores** on the local leaderboard, paste a Base64 save code to **Resume a previous investigation** (schema version is validated to prevent loading incompatible saves), or paste a **classmate's score code** under *View a Classmate's Score* to see their result summary.

### 8. Tutorial (Expanded)
A comprehensive **8-stage guided walkthrough** that highlights the Evidence Vault, ARIA Chat, Workspace Metadata, the Evidence Board, and Terminal functions. Use this to onboard new investigators.

### 9. Case Log
A collapsible narrative feed located in the Evidence Vault. It auto-generates timestamped lore entries for every action you take (validating claims, finding connections, inspecting evidence), building a realistic chain-of-custody narrative log.

### 10. Debrief Screen (Expanded)
After successfully validating every claim and submitting the report, a comprehensive post-game screen appears with the following sections:

#### Score & Tier Display
- **Mode Badge**: A pill indicator above the score hero shows whether the session ran in **⚡ Live Gemini Mode** (green) or **📋 Scripted Mode** (amber - also shown when Live AI failed mid-session)
- **Raw Score**: The base score before difficulty multiplier
- **Final Score**: Raw score × difficulty multiplier (1.0×, 1.25×, or 1.5×)
- **Tier & Emoji**: Your rank (🥇 Expert Investigator, 🥈 Senior Analyst, 🥉 Junior Analyst, ⚠️ AI-Dependent)
- **Tier Description**: Forensic context for your performance level

#### Claim-by-Claim Breakdown Table
A full table mapping your verdicts against ground truth for each claim:
- Claim ID
- Claim text (redacted in Hard/Expert mode during gameplay; visible here)
- Your verdict (✅ Verified / ❌ Hallucination)
- Ground truth (✅ Verified / ❌ Hallucination)
- Your confidence (Low / Medium / High)
- Result (🟢 Correct / 🔴 Incorrect)

#### Confidence Calibration Table
Displays your calibration performance:
- **High Confidence Correct %**: Of verdicts marked "high", what percentage were actually correct?
- **Low Confidence Incorrect %**: Of verdicts marked "low", what percentage were actually incorrect?
- **Overall Calibration Rating**: Well-calibrated, Under-confident, Over-confident, or Miscalibrated

#### Per-Hallucination Type Lesson
For each hallucination type present in the evidence set:
- **Found**: ✅ You detected this hallucination type - here's the lesson & forensic best practice
- **Missed**: ❌ You missed this hallucination type - here's why it's dangerous and how to recognize it next time

All lessons directly relate to CFCCA textbook chapters and real-world investigation practices.

#### All-Time Leaderboard
A persistent local table ranking your historically best investigations by:
- Difficulty tier and raw/final score
- Hallucination detection rate
- Calibration rating
- Date / timestamp
- Speed bonus earned (yes/no)

#### Exports
- **Export as .txt**: A structured plain-text academic report including:
  - Executive summary (score, tier, difficulty, mode)
  - ARIA performance & hallucination detection breakdown
  - Claim-by-claim verdict analysis with explanations
  - All discovered connections with your reasoning
  - Full chain of custody log
  - `--- STUDENT ANNOTATIONS ---` section with all your sticky notes
  
- **Export as .json**: Machine-readable JSON for automated marking scripts or LMS ingestion. Includes:
  - All .txt report fields in structured form
  - Per-claim verdicts with confidence & timestamp
  - `studentNotes` array with per-evidence-field annotations
  - Leaderboard compatibility metadata

#### Score Sharing
- **Share Your Score**: Copy a compact **Base64-encoded score payload** to clipboard with one click
- **Recipients**: Paste the code on the start screen under *View a Classmate's Score* to see a decoded summary (score, tier, difficulty, hallucinations found, mode) without replaying

#### Actions
- **🔄 Restart Investigation**: Wipe the current session state and return to the startup interface
- **🗑️ Clear Leaderboard**: Delete all local leaderboard records (with confirmation prompt)



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
| Cross-evidence connection found (first 3: +15 each; 4th and beyond: +5) | **+15 / +5** |
| Reject a true claim as a hallucination | **−25** |
| Accept a hallucination as verified | **−30** |
| Use a hint | **−5** (per hint) |
| Speed Bonus (Submit report before timer hits 00:00) | **+50** |
| Submit final report | **+50** |
| Prompt Injection Attempt | **−10** + security notice |

### Score Tiers & Difficulty Multipliers
- 🥇 **≥ 150 pts**: Expert Investigator
- 🥈 **100–149 pts**: Senior Analyst
- 🥉 **50–99 pts**: Junior Analyst
- ⚠️ **< 50 pts**: AI-Dependent

Each difficulty applies a **final score multiplier** after all deltas:
- **Standard**: 1.0× (no multiplier)
- **Hard**: 1.25× (score × 1.25)
- **Expert**: 1.5× (score × 1.5)

**Calibration Score**: As you validate claims, you must select Low, Medium, or High confidence. The debrief assesses your Calibration: were your correct judgments made with High confidence, and were your incorrect judgments made with Low confidence? A well-calibrated investigator achieves high accuracy on high-confidence calls and low accuracy (or admits uncertainty) on low-confidence calls.

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

### 1. Semantic Input Validation & Anti-Injection Defense
Querying ARIA (chat or terminal) runs a comprehensive intent check with **two hard-block rules** and **two soft-warning rules**:

| # | Rule | Behavior | Examples |
|---|---|---|---|
| 1 | **Minimum query length** | Queries < 4 characters auto-rejected | ❌ `"spf"`, ❌ `"123"` |
| 2 | **Minimum word count** | No pure symbols/numbers; ≥1 real word required | ❌ `"!!!"`, ✅ `"who sent"` |
| 3 | **Intent heuristic** | Broad or social queries post soft warning, then proceed | ⚠️ `"hi how are you email_1"` → warning, still sends |
| 4 | **Forensic keyword density** | Non-forensic chat detected, soft warning | ⚠️ `"thanks for helping"` → warning, still sends |

**Prompt Injection Defense** (Hard Block, Rule 5):
- Queries matching injection patterns are **instantly rejected**:
  - `"ignore previous instructions"`, `"you are now DAN"`, `"reveal system prompt"`
  - `"forget your training"`, `"act as"`, jailbreak-like phrasing
- **Penalty**: −10 points + security-layer notice in chat
- **Result**: `🔒 [SECURITY FILTER] Prompt injection attempt detected. Query rejected.`

### 2. Dynamic Difficulty Scaling

| Difficulty | Claim Visibility | Terminal Hints | Auto-confirm Timer | Score Multiplier |
|---|---|---|---|---|
| **Standard** | Claim text visible immediately | ✅ Hints available | 4 sec (auto-confirm) | 1.0× |
| **Hard** | Claim text redacted; read ARIA's response to understand the claim | ✅ Hints available | 4 sec (auto-confirm) | 1.25× |
| **Expert** | Claim text redacted | ❌ Hints disabled | ❌ No timer (manual confirmation required) | 1.5× |

### 3. Verdict Confirmation & Undo Window
When you select a verdict on a Claim Badge, a **4-second countdown** begins (Standard/Hard) or **manual confirmation** (Expert):
- A staging UI shows the selected verdict while waiting
- An **Undo button** is displayed during this window to cancel before the verdict commits
- After timeout or manual confirm, the verdict is locked and the score delta (Δ) is applied

### 4. Confidence Rating System
Each verdict submission requires selecting a confidence level:
- **Low**: You doubt your own verdict; willing to be wrong
- **Medium**: Moderate certainty
- **High**: Strong confidence in your decision

The **Debrief Calibration Table** measures your accuracy against your confidence:
- **Well-calibrated**: High confidence ↔ Correct verdicts; Low confidence ↔ Incorrect verdicts
- **Miscalibrated**: Confident on wrong answers = overconfidence penalty / Uncertain on right answers = lack of conviction

### 5. Interactive Metadata Inspector & ARIA Confidence Meter
In the Workspace, click any raw metadata row to visually link it to the ARIA claims discussing that field. Additionally:
- When ARIA reports a numerical confidence in a response (e.g. *"95% confidence"*, *"74% certainty match"*), a **colour-coded confidence bar** renders beneath the message:
  - 🟢 **Green** = Low confidence (< 50%) - ARIA is uncertain
  - 🟠 **Amber** = Moderate confidence (50–85%) - reasonable but not expert-level
  - 🔴 **Red** = Inflated confidence (> 85%) - overconfident without methodology
  - This directly reinforces the **Confidence Inflation** hallucination lesson

### 6. Cross-Reference Connection System & Diminishing Returns
Use the `connect <file1> <file2> "reason"` terminal command to definitively link evidence. 

**Reward Structure**:
- **Connections 1–3**: +15 pts each (full reward)
- **Connections 4+**: +5 pts each (diminishing returns to prevent farming)

Discovered connections populate:
- A visual dashboard in the Evidence Vault
- Interactive link banners across related metadata files
- The Attack Timeline with visual indicators

### 7. Evidence Vault & Attack Timeline
- **List View**: Traditional hierarchical file list with live claim counters
- **Evidence Board**: A responsive, visually mapped view that dynamically plots discovered cross-references as SVG connection strings without horizontal clipping
- **Attack Timeline**: A chronological, interactive reconstruction of the attack chain that reveals connections as you discover them in the terminal

### 8. Session Export, Resume, and Save Management
Click the **Save icon** in the HUD at any time to open the **Save Manager**:
- **Save to Slot**: Store your investigation into one of 5 local browser slots (auto-stamped with timestamp, score, and metadata)
- **Export as Base64**: Generate a game state code for sharing or archiving
- **Load from Slot**: Resume exactly where you left off
- **Auto-save**: After every validated claim, the game attempts to auto-save the most recent slot (if any exists) with updated score and progress
- **Schema Version Guard**: Save codes are stamped with `SAVE_SCHEMA_VERSION = 1`; loading a save with a mismatched version shows: *"This save file was created with an older version of ARIA and cannot be loaded."*

### 9. Evidence Annotations (Sticky Notes)
Hover over the right edge of any metadata row in the Workspace and click the `✏️` icon to add inline textual notes. Review them with `notes list` in the terminal. Both `.txt` and `.json` exports include your annotations.

### 10. Persistent All-Time Leaderboard & Score Codes
- **Leaderboard**: A persistent local `localStorage` table ranking your historically best investigations by final score, difficulty tier, and calibration
- **Shareable Score Code**: The Debrief screen displays a compact **Base64-encoded score code** that includes your final score, difficulty, tier, hallucination detection rate, and more. Recipients paste it on the start screen to view a decoded result summary without replaying the game
- **Classmate Score Viewer**: *View a Classmate's Score* section decodes Base64 codes into readable summaries

### 11. Flexible Workspace Layout
All three secondary panels (Evidence Vault, ARIA Chat, and Terminal) are individually **resizable** and **togglable**, allowing players to focus on the workspace metadata when needed. Panel states are remembered across sessions.

### 12. Optional Investigation Timer
Selected at difficulty setup via a modal prompt (45 min, 30 min, or no timer). The HUD displays a live countdown and triggers a **Speed Bonus** (+50 pts) if the report is submitted before the timer expires.

### 13. Keyboard Shortcuts & Accessibility
- **Tab Navigation**: All claim badges are keyboard-focusable (`tabIndex=0`); **Enter** or **Space** toggles expanded state
- **Screen Reader Support**: Terminal output is exposed via an `aria-live` region; connection descriptions are enumerable in the Evidence Board
- **ARIA Labels**: Buttons and interactive elements carry descriptive `aria-label` attributes for assistive technology
- **Visible Focus Rings**: Keyboard focus displays a visible cyan ring on all focusable elements

### 14. Error Reveal & Learning Moments
If you incorrectly validate a claim (e.g., mark a hallucination as verified, or vice versa), the system stores the error state. This could trigger:
- A detailed explanation of why you were wrong
- A link to the specific metadata that contradicts your verdict
- A guided suggestion to review the claim with fresh context

### 15. Case Log & Chain of Custody Narrative
A side-panel feed that organically builds a timestamped story of your actions. Every validation, connection, evidence access, and hint use is logged with the exact action type, delta, and forensic narrative.

### 16. Mobile Viewport Warning
Viewports narrower than 1024 px display a full-screen overlay explaining that the game is optimized for widescreen forensic workstations. Students can dismiss with **Continue Anyway** (persisted in `localStorage`) or exit the tab.

### 17. Markdown & Rich Text Rendering in Chat
ARIA's responses support basic markdown syntax:
- `**bold text**` → **bold text**
- `*italic text*` → *italic text*
- `` `code snippet` `` → `code snippet`
- `[CLAIM-XXX]` badges are parsed inline and rendered as interactive cards

### 18. Streaming Message Animation
ARIA chat messages stream character-by-character into the chat panel at ~450 chars/sec, creating an immersive real-time feel. Large responses feel organic and incremental rather than instant.

### 19. Last Debrief Recall
A "📋 **View Last Debrief**" button on the Difficulty screen shows a summary of your most recent completed investigation (score, tier, hallucination rate, calibration) before starting a new one. The summary is persisted to `localStorage` as `aria_last_debrief`.

### 20. Claim Shuffling (Anti-Cheat)
Every session, claim badges for each evidence file are displayed in randomized order (Fisher-Yates shuffle on `REGISTER_CLAIMS`), preventing students from sharing shortcut claim-order sequences.

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

The game is **100% offline by default** (Scripted Mode). To enable **Live Gemini Mode**:

#### Step 1: Get a Gemini API Key
1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Create a new API key (free tier available)

#### Step 2: Create `.env` File
Copy `.env.example` to `.env` (or create a new `.env`):
```env
# Scripted mode (default, offline - no API key needed)
VITE_LIVE_AI=false

# OR enable Live Gemini AI mode
VITE_LIVE_AI=true
VITE_GEMINI_KEY=your_gemini_api_key_here
```

#### Environment Variables
| Variable | Default | Purpose |
|---|---|---|
| `VITE_LIVE_AI` | `false` | Set to `true` to enable Live Gemini mode; `false` uses Scripted Mode |
| `VITE_GEMINI_KEY` | (unset) | Your Gemini API key (only read if `VITE_LIVE_AI=true`) |

**Security Note**: Never commit `.env` files to version control. The `.gitignore` excludes `.env` by default.

---

## AI Integration: Scripted vs. Live Modes

### Scripted Mode (Default, Offline)
Operates 100% offline with no API key required. `aria_responses.json` holds 18 pre-authored responses triggered by an intelligent **OR-Logic Frequency Pattern Scanner**:

1. The scanner analyzes the player's query for forensic keywords and intent signals
2. For each evidence file, the system computes a match score against a query's keywords
3. The response with the highest match score is selected
4. If multiple responses tie, the system picks the one the player has heard least recently (frequency-based fairness)

**Why this is pedagogically superior**:
- Every student encounters exactly the required hallucinations with **pre-determined ground truth**
- Ensures consistent, reproducible graded assessments
- No API dependency or cost during class
- Claim IDs are numeric (e.g., `CLAIM-E01`) for predictable parsing

**Scripted Claims per Evidence File**:
- Email: 4 claims
- Audio: 4 claims
- Video: 4 claims
- Invoice: 4 claims
- Network Logs: 6 claims
- **Total**: 22 scripted claims across the evidence set

### Live Gemini Mode (Dynamic, Requires API Key)
Uses `gemini-2.5-flash` to dynamically generate responses. Requires:
```env
VITE_LIVE_AI=true
VITE_GEMINI_KEY=your_api_key_here
```

Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

#### Character Framing & Hallucination Injection
Instead of asking Gemini to "lie", the system instructs Gemini to play a **character with specific, hard-wired "biases"** per evidence file. For example:
- **Email**: "Your character always struggles to understand email authentication headers. You consistently miss SPF/DKIM failures."
- **Audio**: "Your character has a fixed belief: the audio sample rate is 44100 Hz (it's actually 22050 Hz)."
- **Video**: "Your character highly values facial biometric confidence percentages, even when unsupported by methodology."
- **Invoice**: "Your character assumes all PDFs are created by mainstream accounting software."
- **Network**: "Your character connects temporal events without explicit causality proof."

This approach:
- Respects Gemini's design principles (no explicit deception)
- Grounds responses in the actual evidence metadata
- Ensures hallucinations are **predictable and teachable**

#### Claim Extraction & Metadata Payload
Every Live Gemini response includes:
1. **Inline Claims**: Factual statements wrapped in `[CLAIM-XXX]` tags (e.g., `[CLAIM-L-E01]` for Live Email)
2. **Ground Truth Payload**: A `---CLAIM_METADATA---` JSON block at the end of the response declaring:
   ```json
   {
     "CLAIM-L-E01": { "isHallucination": false },
     "CLAIM-L-E02": { "isHallucination": true, "type": "false_attribution" }
   }
   ```

The app uses regex to:
- Extract the sentence containing each `[CLAIM-XXX]` tag
- Place it directly onto claim cards in the UI
- Parse the metadata block to determine ground truth

#### Live Mode Fallback
If Gemini API fails during the session:
1. A `liveAIFailed` flag is set
2. An inline `⚠️ [SYSTEM NOTICE]` banner posts explaining the swap to Scripted Mode
3. The mode indicator goes amber
4. The most relevant Scripted response is used for future queries
5. This **explicit fallback** is critical for Expert-mode assessments where students must know they're being graded against fallback reliability

---

## Terminal Commands Reference

| Command | Description | Example |
|---|---|---|
| `scan` / `ls` | List all 5 evidence files with type and status | `scan` |
| `inspect <file>` / `cat <file>` | Show full metadata analysis for a file | `inspect email_1.eml` |
| `strings <file>` | Extract printable strings from a file | `strings audio_call.mp3` |
| `grep <pattern> <file>` | Search for a pattern within a file | `grep SPF email_1.eml` |
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
| `timer start` | Start the optional investigation timer (prompts for duration) | `timer start` |
| `timer off` | Disable the active timer | `timer off` |
| `pwd` | Print working directory (immersion) | `pwd` |
| `whoami` | Display current user (immersion) | `whoami` |
| `history` | Show last 10 commands executed | `history` |
| `clear` | Clear terminal output | `clear` |
| `help` | Show all available commands | `help` |
| `help <command>` | Detailed usage, syntax, examples and forensic tips for one command | `help validate`, `help connect`, `help inspect` |

> *Tip: The Terminal supports **Tab autocomplete** for commands and filenames!*

> *Note: Prompt injection attempts (e.g., `ignore previous instructions`, `DAN`) are detected and rejected with a −10 point penalty.*

---

## File Structure & Data Organization

### Data Files (`src/data/`)

| File | Purpose | Content |
|---|---|---|
| `evidence.json` | **Master evidence definitions** - the single source of forensic truth | 5 Evidence objects with id, filename, type, displayContent (rich media), rawMetadata (K-V pairs), hash (MD5 + SHA256) |
| `aria_responses.json` | **Scripted AI responses** - 18 pre-authored responses per evidence context | AriaResponse objects with questionIntent, keywords, responseText, claims array, fallback text, timeline events |
| `connections.json` | **Cross-reference definitions** | Valid connection IDs (e.g. `conn_email_ip`, `conn_audio_exfil`) with connection text templates |
| `narrative_events.json` | **Case log string templates** | Localized narrative strings for chain of custody entries (SESSION_START, EVIDENCE_ACCESS, CLAIM_VALIDATED, etc.) |

### Type Definitions (`src/types/game.ts`)
Exports the following key interfaces:

| Type | Fields | Purpose |
|---|---|---|
| `GameState` | phase, difficulty, score, verdicts, allClaims, selectedEvidenceId, terminalHistory, chatHistory, chainOfCustody, timer, liveAIFailed, claimDisplayOrder, errorReveal | The global immutable state container |
| `Evidence` | id, filename, type, displayContent, rawMetadata, hash | A single evidence file with all metadata |
| `Claim` | id, text, isHallucination, hallucinationType, explanation, evidenceRef, hintText, metadataFields | A single AI-generated assertion |
| `VerdictRecord` | verdict, confidence, timestamp | The player's decision on a claim |
| `SaveSlot` | id, name, timestamp, difficulty, score, claimsValidated, totalClaims, hallucinationsFound, phase, gameState | A serialized investigation session |
| `LeaderboardEntry` | id, date, difficulty, rawScore, finalScore, multiplier, tier, tierEmoji, hallucinationsFound, calibrationRating, speedBonusEarned | A historical best-investigation record |
| `HallucinationType` | (Union type) | One of: `timestamp_error`, `false_attribution`, `fabricated_metadata`, `false_correlation`, `confidence_inflation` |



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

## Security & Reliability Systems

### 1. Prompt Injection Defense
ARIA Chat and the `ask aria` terminal command detect and block known injection patterns:
- `ignore previous instructions`, `you are now`, `DAN`, `system:`, `reveal your system prompt`
- Any jailbreak or override phrasing

**Effect**: Attempted injection → `🔒 [SECURITY FILTER]` notice + −10 pts penalty + custody log entry

### 2. ARIA Rate Limiter (Live Gemini Mode)
To prevent runaway API costs during supervised class use:
- Consecutive `ask aria` calls are **debounced by 2 seconds**
- **Hard cap**: 10 requests per 60 seconds
- Exceeding the cap triggers a **30-second cooldown** with an in-terminal notice

### 3. Double-Send Prevention
An `isGenerating` state guard blocks submitting a second query while ARIA processes the first:
- Input field and Send button are **disabled**
- `⏳ ARIA is processing…` indicator is shown in both Chat and Terminal panels

### 4. Live Gemini Fallback & Mode Indicator
When the Live Gemini API fails (network error, quota exceeded, etc.):
- The app dispatches a `SET_LIVE_AI_FAILED` flag
- An inline `⚠️ [SYSTEM NOTICE]` banner posts in chat explaining the fallback to Scripted Mode
- The ARIA mode indicator shifts from **green** (Live) to **amber** (Scripted fallback)
- The most contextually relevant **Scripted Mode response** is used instead

Previously, this swap was **silent**, which was particularly misleading in Expert-mode assessments where students might assume they're being graded against Live AI.

### 5. Save File Schema Migration Guard
Save codes and save-slot files are stamped with `SAVE_SCHEMA_VERSION = 1`. Loading a save made with a different schema version shows a clear error message rather than silently loading potentially broken state:
- `"This save file was created with an older version of ARIA and cannot be loaded. Please start a new investigation."`

---

## Architecture & State Management

### Global State (`GameContext.tsx`)
Built on a pure React `useReducer` pattern. The global `GameState` tracks:
- Phase (difficulty → tutorial → investigation → debrief)
- Difficulty and score multiplier
- All verdicts and claims
- Terminal and chat history
- Chain of custody log
- Persistent notes and connections
- Timer state and last auto-save timestamp
- Live AI failure flag
- Error reveal state
- Claim display order (shuffled)

### Actions
| Action | Payload | Effect |
|---|---|---|
| `SELECT_EVIDENCE` | `evidenceId` | Switch selected file; log access |
| `VALIDATE_CLAIM` | `claimId`, `verdict`, `confidence`, `claim` | Verify claim + compute delta + auto-save |
| `REGISTER_CLAIMS` | `claims[]` | Add claims & shuffle display order (Fisher-Yates) |
| `ADD_CHAT_MESSAGE` | `message` | Append message to chat history |
| `ADD_TERMINAL_LINE` | `line` | Append line to terminal output |
| `ADVANCE_TUTORIAL` | - | Increment tutorial step |
| `SUBMIT_REPORT` | - | Finalize session + compute bonuses + transition to debrief |
| `SET_LIVE_AI_FAILED` | - | Mark API failure; switch to fallback |

### Data Models (`src/types/game.ts`)
- **`GameState`**: Global immutable state shape
- **`Claim`**: Structured claim with id, text, hallucination ground truth, explanation, and optional hints
- **`VerdictRecord`**: `{ verdict, confidence, timestamp }`
- **`Evidence`**: File definition with id, type, displayContent, rawMetadata, and hash
- **`SaveSlot`**: Serialized investigation snapshot with difficulty, score, progress, and gameState
- **`LeaderboardEntry`**: Historical best-investigation record with tier and calibration metrics
- **`ChainEntry`**: Timestamped custody log action

### Scoring (`src/lib/scoring.ts`)
- **`computeDelta(claim, verdict)`**: Returns +20 / +10 / −25 / −30 based on verdict correctness and hallucination status
- **`getTier(score)`**: Returns tier info (label, emoji, color, description)
- **`countHallucinationsFound(verdicts, claims)`**: Tally correct hallucination detections
- **`allValidated(verdicts, claims)`**: Check if all claims have been verdicted
- **`connectionReward(count)`**: Returns +15 pts (connections 1–3) or +5 pts (connections 4+)

### Hooks

| Hook | Purpose |
|---|---|
| `useAria()` | Orchestrates Live Gemini API or Scripted Mode; handles query validation, response parsing, claim extraction, and ARIA character logic |
| `useAudio()` | Web Audio API: keyboard click sounds, system beeps, alert tones; respects `aria_settings_sound` localStorage preference |
| `useToast()` | Toast notification dispatcher - brief, transient UI messages |

---

## Advanced Features & Tips

### Auto-Save System
The game **automatically saves your progress** after every validated claim:
- Saves are written to **one of 5 local browser slots** (if a slot exists)
- Each auto-save updates the slot's timestamp, score, and progress metrics
- **Persists across browser sessions** using `localStorage`
- To manually save to a specific slot, use the **Save Manager** (HUD → Save icon)

### Leaderboard & Score Persistence
- **All-time leaderboard** is stored in `localStorage` under `aria_leaderboard`
- Automatically populated after every Debrief submission
- Records: difficulty, raw/final score, tier, mode, hallucinations found, calibration rating
- **Clear Leaderboard** button on Debrief (with confirmation) to reset

### Last Debrief Recall
- After completing an investigation, the Debrief summary is saved as `aria_last_debrief` in `localStorage`
- Visible on the Difficulty Screen via **"📋 View Last Debrief"** button
- Shows score, tier, hallucination rate, calibration stats without replaying

### Timer & Speed Bonus
- Optional investigation timer (45 min, 30 min, or no timer) selected at difficulty setup
- HUD displays live countdown
- Submitting report before timer expires = **+50 pts Speed Bonus**
- Speed bonus is multiplied by difficulty (e.g., Expert gets 1.5× × 50 = 75 pts)

### Keyboard & Accessibility
- **Tab Navigation**: All claim badges are keyboard-focusable; **Enter**/**Space** to toggle verdict state
- **Tab Autocomplete**: Terminal supports filename/command autocomplete with Tab key
- **Screen Reader Support**: Terminal output mirrored to `aria-live` region; SVG connections enumerated for assistive tech
- **Visible Focus Rings**: All keyboard-focused elements display a cyan ring

### Markdown & Rich Text in Chat
ARIA responses support lightweight formatting:
- `**bold**` → **bold**
- `*italic*` → *italic*
- `` `code` `` → `code`
- `[CLAIM-XXX]` → Interactive claim cards (parsed inline)

### Connection Rewards & Strategy
- **First 3 connections**: +15 pts each (high reward)
- **Connections 4+**: +5 pts each (diminishing returns)
- Strategy: Focus on high-value connections early; exploration beyond 3 yields lower returns

### Verdict Confidence Calibration
- **High confidence** on correct verdicts = well-calibrated
- **Low confidence** on incorrect verdicts = well-calibrated
- **High confidence on wrong answers** = overconfident (bad)
- **Low confidence on correct answers** = under-confident (lacks conviction; still functional)

The Debrief **Calibration Table** calculates your calibration score as a percentage.

### Live Gemini Mode Specifics
- **Mode Indicator**: Green pill badge in ARIA header = Live Mode; Amber = Scripted/Fallback
- **Claim ID Format**: Live mode uses alphanumeric prefixes (e.g., `[CLAIM-L-E01]`), Scripted uses numeric (e.g., `[CLAIM-E01]`)
- **Rate Limits**: 10 requests/60s; exceeding triggers 30s cooldown with in-terminal notice
- **Fallback Detection**: If API fails, an inline `⚠️ [SYSTEM NOTICE]` banner posts; mode indicator goes amber

### Evidence Vault Display Modes
- **List View**: Traditional hierarchical file listing with claim counters
- **Evidence Board**: Visual SVG-based connection map; dynamically updates as you discover links; uses ResizeObserver for responsive SVG redraw

### Prompt Injection Defense
Patterns that trigger the security filter:
- `ignore previous|instructions|prompts`
- `you are now|be|act as`
- `DAN|jailbreak|reveal system|pretend you are`
- `forget (everything|all|your) (you|instructions|training)`

**Penalty**: −10 pts + "🔒 [SECURITY FILTER]" message + custody log entry

---

## Repository Structure

```
ARIA_Computer_Forensics_Game/
├── index.html                    # Root entry point
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # NPM dependencies & build scripts
├── .env.example                  # Environment variable template
├── .gitignore                    # Git exclusions
├── README.md                     # This file
│
├── public/                       # Static assets
│
├── src/
│   ├── main.tsx                  # React DOM render entry point
│   ├── App.tsx                   # Top-level providers, Router
│   ├── index.css                 # Global CSS, Tailwind, custom properties
│   ├── style.css                 # Supplementary styles (CRT scanlines, etc.)
│   │
│   ├── data/
│   │   ├── evidence.json         # Master evidence definitions (forensic truth)
│   │   ├── aria_responses.json   # Scripted AI responses (18 pre-authored)
│   │   ├── narrative_events.json # Case Log string templates
│   │   └── connections.json      # Cross-reference definitions
│   │
│   ├── types/
│   │   └── game.ts               # TypeScript interfaces
│   │
│   ├── context/
│   │   └── GameContext.tsx       # Global useReducer state manager
│   │
│   ├── lib/
│   │   └── scoring.ts            # Score calculation, calibration logic
│   │
│   ├── hooks/
│   │   ├── useAria.ts            # Live Gemini + Scripted fallback
│   │   ├── useAudio.ts           # Web Audio system
│   │   └── useToast.tsx          # Toast notifications
│   │
│   └── components/
│       ├── App.tsx               # Main app component
│       ├── AppShell.tsx          # 3-panel layout container
│       ├── BootSequence.tsx      # ASCII boot animation
│       ├── DifficultyScreen.tsx  # Difficulty selection & timer prompt
│       ├── HUD.tsx               # Top status bar
│       ├── EvidenceVault.tsx     # Left panel: file list, case log
│       ├── AttackTimeline.tsx    # Timeline visualization
│       ├── Workspace.tsx         # Center panel: inspector, metadata
│       ├── ClaimBadge.tsx        # Claim card with verdict UI
│       ├── ARIAChat.tsx          # ARIA chat interface
│       ├── Terminal.tsx          # xterm.js emulator
│       ├── DebriefScreen.tsx     # End-game screen
│       ├── SaveModal.tsx         # Save/load manager
│       ├── SettingsModal.tsx     # Settings
│       ├── GlossaryModal.tsx     # Forensic glossary
│       ├── ToastContainer.tsx    # Toast renderer
│       ├── Tutorial.tsx          # Onboarding overlay
│       └── ForensicErrorModal.tsx # Error explanations
│
├── scripts/
│   └── aggregate_results.mjs     # Class results aggregator
│
└── CONTRIBUTING.md               # Development guidelines
```

---

### Class Results Aggregator (`scripts/aggregate_results.mjs`)

A standalone Node.js ESM script that reads all `aria_report_*.json` files exported by students from the Debrief screen and produces a single `class_summary.json` with class-level statistics.

**Usage:**
```bash
node scripts/aggregate_results.mjs [input-dir] [output-dir]
```

| Argument | Default | Description |
|---|---|---|
| `input-dir` | `./reports` | Directory containing student `aria_report_*.json` files |
| `output-dir` | same as input | Where to write `class_summary.json` |

**Output fields in `class_summary.json`:**
- `scoreStats`: mean, median, min, max, standard deviation
- `tierDistribution`: count of Expert / Senior / Junior / Dependent students
- `difficultyDistribution`: count per difficulty level
- `hallucinationDetectionRate`: mean % of hallucinations caught across all students
- `calibrationMeanPct`: mean calibration score
- `students`: per-student breakdown (score, tier, claims validated, hallucinations caught, connections, notes count)

**Dependencies**: Node.js built-ins only (`fs`, `path`) - no npm install required.

**Workflow for instructors:**
1. Ask students to "Export as JSON" from the Debrief screen
2. Collect all `aria_report_*.json` files into a folder (e.g. `./reports/`)
3. Run `node scripts/aggregate_results.mjs ./reports/`
4. Open `class_summary.json` or use the stdout table for marking

---

## Academic Context

**Course**: Computer Forensics and Cyber Crime Analysis, Prof. Atzeni  
**Academic year**: 2025–2026

**Pedagogical Note**:
> *"LLMs can generate false, misleading, or inaccurate information... LLMs cannot replicate the intuition of human investigators."* - Chapter 19

This application is designed specifically to operationalize that textbook statement, transforming passive reading about AI hallucinations into an active, high-pressure digital investigation environment.
