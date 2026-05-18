# 08 Current Status And Evaluation

## Current Status

ARIA is a playable prototype. A player can start an investigation, inspect evidence, question ARIA, validate claims, connect evidence, submit a report, and review a debrief.

The project is ready to run in scripted mode for deterministic classroom evaluation. Live Gemini mode is an optional local extension.

## Implemented Features

- Main menu, difficulty selection, and timer selection.
- Guided Run, Challenge Run, and Final Exam modes.
- Tutorial with reopenable navigation.
- Evidence vault and workspace.
- Raw metadata inspection.
- Scripted ARIA chat.
- Optional live AI mode with scripted fallback.
- Duplicate live-claim reuse for repeated forensic facts.
- Claim validation with confidence selection.
- Evidence-review gate before validation.
- Scoring and penalties.
- Forensic terminal.
- Investigator Handbook with glossary, how-to-play, and terminal command reference.
- Notes, cross-evidence connections, evidence board, and attack timeline.
- Local save and resume.
- Final report, debrief, and report export.
- Accessibility-oriented settings such as high contrast and reduced effects.
- Panel toggles for managing screen space.

## Scoring Summary

| Action | Points |
| --- | ---: |
| Correctly flag a hallucination | +20 |
| Correctly verify a true claim | +10 |
| Accept a hallucination as true | -30 |
| Reject a true claim as hallucinated | -25 |
| Find a cross-evidence connection | +15 for the first 3 |
| Trace the Tor exit-node IP in the terminal | +15 once |
| Decode the hidden invoice creator payload | +20 once |
| Use a hint | -5 |
| Submit final report | +50 |
| Submit before timer expires | +50 |

Difficulty multipliers are applied at report submission:

| Difficulty | Multiplier |
| --- | ---: |
| Guided Run | 1.00 |
| Challenge Run | 1.25 |
| Final Exam | 1.50 |

## Educational Evaluation

The prototype supports the intended learning goals because it:

- Forces evidence inspection before claim validation.
- Makes hallucinations visible and measurable.
- Rewards correct verification and hallucination detection.
- Penalizes both blind trust and blanket rejection.
- Connects single artifacts into a case timeline.
- Turns the final score into feedback through the debrief.

## Known Limitations

- One main scenario.
- Scripted responses cover selected questions, not every possible user question.
- Save data is local to the same browser and device.
- No backend for tamper-resistant classroom submissions.
- Live AI is optional and not part of the public hosted assessment path.
- GitHub Pages cannot safely include a private Gemini API key.
- The current single-page prototype can trigger a non-blocking Vite bundle-size warning.

## Future Improvements

Possible extensions:

- Additional forensic scenarios.
- More scripted ARIA responses.
- Expanded debrief explanations.
- More detailed report grading.
- Bundle-size optimization.
- Instructor-facing result export.
- Server-side classroom submission flow.

## Evaluation Summary

ARIA demonstrates how a serious game can teach critical use of AI in forensic analysis. Its strongest educational mechanism is the evidence-review gate combined with mixed true and hallucinated claims.
