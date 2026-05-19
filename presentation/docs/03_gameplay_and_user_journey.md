# 03 Gameplay And User Journey

## Player Role

The player is a forensic investigator assigned to a TechCorp fraud case. The goal is to evaluate evidence, test ARIA's claims, and produce a defensible report.

## Start Flow

The main menu supports:

- New investigation.
- Load saved run.
- How-to-play summary.
- Last debrief review when available.

New investigations offer three modes:

| Mode | Internal difficulty | Purpose |
| --- | --- | --- |
| Guided Run | `standard` | Best first run. Claim text remains visible while pending. |
| Challenge Run | `hard` | Claim text is hidden until validation. Score multiplier is 1.25x. |
| Final Exam | `expert` | Hard mode plus no hint command. Score multiplier is 1.5x. |

The player then chooses a 45-minute timer, 30-minute timer, or no timer.

## Interface Areas

- Left: evidence vault and cross-reference progress.
- Center: workspace and evidence viewer.
- Right: ARIA chat.
- Bottom: forensic terminal.
- Top bar: score, progress, difficulty, tutorial, handbook, and panel toggles.

The tutorial introduces each area and can be reopened during play.

## Core Loop

1. Select evidence.
2. Inspect content and raw metadata.
3. Ask ARIA about the selected file.
4. Review claim badges in the response.
5. Validate each claim as verified or hallucinated.
6. Choose confidence.
7. Add notes or inspect through the terminal.
8. Connect related evidence on the board.
9. Submit the final report, or intentionally submit early after an incomplete-investigation warning.
10. Review the debrief.

## Claim Validation Rules

Claims have stored ground truth in the game data. The current implementation blocks validation until the related evidence has been reviewed through a terminal inspection command.

Evidence counts as reviewed when the player:

- Runs `inspect <file>` in the terminal.
- Runs `cat <file>`, `strings <file>`, or `grep <text> <file>` in the terminal.
- Runs `hash verify <file>` in the terminal.

This gate is intentional. It prevents blind clicking and reinforces evidence-first reasoning.

## Terminal Role

The terminal gives the investigation a procedural forensic feel. It supports command-style actions for scanning, inspecting, validating, note-taking, connecting evidence, hash verification, tracing suspicious infrastructure, decoding encoded metadata, and report submission.

The Investigator Handbook includes terminal command help so players can recover syntax during the game.

## End State

The game ends when the player submits the final report from the terminal. If claims are missing or unvalidated, the terminal warns the player first and requires `report confirm` before ending early.

The final report leads to a debrief with:

- Final score and performance tier.
- Correct and incorrect validations.
- Hallucinations found.
- Confidence calibration feedback.
- Final report details.
- Export options.

The debrief is part of the learning design. It converts the play session into reflection about evidence quality, AI reliability, and the player's confidence calibration.
