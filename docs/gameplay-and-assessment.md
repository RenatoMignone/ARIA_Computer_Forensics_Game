# Gameplay and Assessment Guide

This document describes the final playable workflow of ARIA and the assessment logic used by the game.

## Intended Learning Loop

ARIA is designed around one repeated action pattern:

1. Select an evidence file.
2. Inspect the file content and raw metadata.
3. Ask ARIA a focused forensic question.
4. Read the generated claim badges.
5. Validate each claim against evidence.
6. Connect related evidence when a shared artifact is found.
7. Submit the final report after the case is complete.

The game should not reward blind trust in ARIA. It should also not reward rejecting every AI answer automatically. The target behavior is calibrated verification.

## Main Menu Flow

The player starts from a simple ARIA main menu.

The menu offers:

- Start a new investigation.
- Load a saved investigation.
- Read the how-to-play summary.
- Review the last debrief when available.

Starting a new investigation opens the mode selection:

| Mode | Internal difficulty | Purpose |
| --- | --- | --- |
| Guided Run | `standard` | Best first run. Claim text remains visible while pending. |
| Challenge Run | `hard` | Claim text is hidden until validation. Score multiplier is 1.25x. |
| Final Exam | `expert` | Hard mode plus no hint command. Score multiplier is 1.5x. |

After choosing a mode, the player chooses a timer:

- 45 Minutes: relaxed timed run.
- 30 Minutes: faster timed challenge.
- No Timer: story mode.

Submitting before an active timer expires gives the speed bonus.

## Tutorial and Handbook

The tutorial can be navigated forward and backward and can be reopened with the `?` button in the top bar.

The book icon opens the Investigator Handbook. It contains:

- Glossary.
- How to Play.
- Terminal Commands.

The handbook is important for the educational part of the game because it explains the forensic and AI-literacy concepts without interrupting the investigation flow.

## Evidence Review Gate

A claim cannot be validated until the related evidence has been reviewed.

Evidence counts as reviewed when the player:

- Opens the Raw Metadata tab for that file.
- Runs `inspect <file>` in the terminal.
- Runs `hash verify <file>` in the terminal.

This gate exists to prevent a weak gameplay pattern where the player asks ARIA repeated questions and validates badges without inspecting evidence.

## Scripted and Live ARIA Behavior

Scripted mode is the recommended assessment mode. It uses curated responses and fixed truth labels from `src/data/aria_responses.json`.

Live Gemini mode is optional. When enabled locally, ARIA receives:

- The selected evidence ID and filename.
- The display content visible to the player.
- The raw metadata for that evidence.
- A catalog of existing claims for the same evidence.

The claim catalog tells the model to reuse existing claim IDs when it repeats the same forensic fact. The client also checks for near-duplicate generated claims and remaps them to existing IDs when appropriate.

If Gemini is unavailable, rate-limited, or exhausted, the game falls back to scripted mode.

## Terminal Role

The terminal is part of the investigation, not only a visual effect.

Important commands include:

- `scan`: list evidence files.
- `inspect <file>`: show content and raw metadata.
- `hash verify <file>`: verify evidence integrity.
- `ask aria "<question>"`: ask ARIA about the selected evidence.
- `validate <CLAIM-ID> verified`: confirm a supported claim.
- `validate <CLAIM-ID> hallucination`: reject an unsupported claim.
- `connect <f1> <f2> "<reason>"`: register a valid cross-evidence relationship.
- `report`: submit the final investigation.

The report command is intentionally blocked until the required claims have been discovered and validated.

## Scoring Summary

| Action | Points |
| --- | ---: |
| Correctly flag a hallucination | +20 |
| Correctly verify a true claim | +10 |
| Accept a hallucination as true | -30 |
| Reject a true claim as hallucinated | -25 |
| Find a cross-evidence connection | +15 |
| Trace the Tor exit-node IP in the terminal | +15 once |
| Decode the hidden invoice creator payload | +20 once |
| Use a hint | -5 |
| Submit final report | +50 |
| Submit before timer expires | +50 |

Difficulty multipliers are applied at report submission:

- Guided Run: 1.00x.
- Challenge Run: 1.25x.
- Final Exam: 1.50x.

## End of the Game

The game ends when the player submits the final report from the terminal.

The debrief screen shows:

- Final score.
- Performance tier.
- Correct and incorrect validations.
- Hallucinations found.
- Calibration feedback.
- Report details.
- Export option.

This final screen is part of the learning experience. It converts the play session into reflection on the player's forensic reasoning.
