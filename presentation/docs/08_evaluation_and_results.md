# 08 Evaluation And Results

## Current Result

ARIA is a working game prototype that demonstrates the main idea of the project.

The player can complete an investigation from start to finish, validate AI claims, discover evidence connections, submit a final report, and receive a debrief.

This makes the project suitable for a course presentation because it is not only a concept. It is an implemented interactive artifact.

## Implemented Features

The current game includes:

- Difficulty selection.
- Tutorial flow.
- Evidence vault.
- Evidence workspace.
- Metadata inspection.
- ARIA chat in scripted mode.
- Optional live AI mode.
- Claim validation.
- Confidence selection.
- Scoring.
- Terminal commands.
- Investigation notes.
- Cross-evidence connections.
- Timer options.
- Local save and resume.
- Final report submission.
- Debrief screen.
- Report export.
- Accessibility-oriented settings such as high contrast and reduced effects.
- Panel toggles for managing screen space.

## Educational Results

The implemented prototype successfully supports the project learning goals:

- It creates a realistic investigation context.
- It forces the player to inspect evidence rather than trust the assistant blindly.
- It introduces several common forensic artifacts.
- It makes AI hallucinations visible and measurable.
- It provides feedback through scoring and debriefing.
- It connects technical investigation with final reporting.

## Scoring Model

The scoring model is designed to reward evidence-based reasoning.

The player gains points for:

- Correctly flagging hallucinations.
- Correctly verifying true claims.
- Finding cross-evidence relationships.
- Submitting the final report.
- Completing the investigation within timer constraints when timers are active.

The player loses points for:

- Accepting hallucinations as true.
- Rejecting true claims as hallucinations.

This structure teaches that both overtrust and excessive skepticism can be wrong.

## Player Feedback

The debrief is important because it converts gameplay into learning.

It shows not only the score, but also how the player performed in relation to hallucination detection and claim verification.

The feedback helps the player understand mistakes and reflect on the investigation process.

## Strengths Of The Project

The main strengths are:

- A clear educational problem.
- A focused and understandable scenario.
- A playable implementation.
- A strong connection between AI reliability and forensic reasoning.
- Multiple evidence types.
- A claim-based validation system.
- A final debrief that reinforces learning.

## Current Limitations

The project is still a course prototype.

Current limitations include:

- The evidence set is limited to one scenario.
- Scripted ARIA responses cover selected questions rather than every possible question.
- The local save system works only on the same browser and device.
- The game does not include a real backend for multiplayer, class comparison, or tamper-resistant result sharing.
- The live AI mode is optional and not the primary assessment path.

## Future Improvements

Possible future improvements include:

- Additional forensic scenarios.
- More evidence files.
- More scripted ARIA responses.
- Expanded debrief explanations.
- More detailed report grading.
- Better bundle optimization.
- Instructor-facing result export.
- A controlled server-side system for classroom submissions.

## Overall Evaluation

ARIA achieves its main objective: it demonstrates how a serious game can teach students to critically evaluate AI-assisted forensic analysis.

The final value of the project is not only the solved case. The value is the reasoning habit that the game trains: verify first, conclude later.
