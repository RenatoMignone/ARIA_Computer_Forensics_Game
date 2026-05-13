# 10 Demo Script

This file is a practical guide for the live part of the final presentation.

## Demo Goal

The demo should prove that ARIA is not only a static interface. It should show a complete educational loop:

1. The player receives evidence.
2. ARIA suggests claims.
3. The player checks raw evidence.
4. The player validates or rejects claims.
5. The game gives feedback and eventually produces a debrief.

The strongest message is: ARIA can help, but the evidence decides.

## Recommended Demo Mode

Use:

- Guided Run.
- No Timer.
- Scripted mode.

This gives the most stable presentation. The scripted assistant is deterministic, claim truth labels are known, and the professor can see the intended educational design without depending on API availability.

Mention that Live Gemini Flash is available locally through `.env`, but the public GitHub Pages version intentionally avoids shipping an API key.

## Suggested Live Walkthrough

### 1. Main Menu

Show the ARIA title screen and explain that the game starts like a videogame, not like a dashboard.

Open Start Game and choose Guided Run.

### 2. Tutorial

Move through a few tutorial slides:

- Evidence Vault.
- Raw Metadata.
- ARIA Chat.
- Claim Validation.
- Investigator Handbook.

Point out that the tutorial can go backward and forward and can be reopened with the `?` button.

### 3. Evidence Inspection

Select `email_1.eml`.

Show:

- Content preview.
- Raw metadata.
- SPF and DKIM results.
- Originating IP.

Explain that raw metadata is the ground truth for claim validation.

### 4. Ask ARIA

Ask a focused question such as:

```text
What is suspicious about this email?
```

Show that ARIA answers with claim badges. Explain that claim badges are individual assessment units, not decorative labels.

### 5. Validate One Claim

Click a claim badge and validate it only after showing the related evidence.

If possible, demonstrate one hallucination and one true claim:

- A hallucination shows why confident AI output can be dangerous.
- A true claim shows that the correct strategy is not automatic distrust.

### 6. Terminal

Open the terminal and run:

```text
scan
inspect email_1
hash verify email_1
help validate
```

Explain that the terminal reinforces procedural forensic work and that the in-game Handbook lists the commands.

### 7. Cross-Evidence Reasoning

Briefly show the Board tab or explain one cross-evidence relationship:

- The IP `91.200.81.47` appears in both the email metadata and network logs.
- The audio creation time aligns with suspicious network activity.
- The invoice metadata relates to the fraudulent transfer narrative.

### 8. Report and Debrief

If time is short, use screenshots or describe the final report flow.

Explain that the report unlocks only when the required claims are discovered and validated. The debrief then shows score, mistakes, hallucinations found, calibration, and exportable report details.

## What To Emphasize Verbally

- ARIA is a serious game, not only a chatbot demo.
- The player learns by doing forensic verification.
- The assistant is intentionally imperfect.
- The game prevents blind clicking by requiring evidence review before validation.
- The final debrief turns the gameplay into reflection.
- Public hosting uses scripted mode for security and reproducibility.

## Backup Plan

If the live browser demo has any issue, use the GitHub Pages hosted version for the interface walkthrough and explain that it intentionally runs in scripted mode.

If internet access is unavailable, run the local build:

```bash
npm run dev
```

Then open the local Vite URL printed in the terminal.
