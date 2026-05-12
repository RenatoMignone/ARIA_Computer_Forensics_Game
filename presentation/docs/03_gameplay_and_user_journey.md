# 03 Gameplay And User Journey

## Player Role

The player acts as a forensic investigator assigned to a corporate fraud case.

The objective is to determine what happened, identify which evidence supports the case, and evaluate the reliability of ARIA's claims.

The player is not asked to simply find one hidden answer. The real task is to build a defensible investigative process.

## Start Of The Game

The game begins with a difficulty selection screen. The player can choose the level of challenge and then enter the investigation.

A tutorial introduces the main interface:

- The evidence vault.
- The workspace.
- The ARIA chat.
- The forensic terminal.
- The evidence board.
- The panel controls.
- The claim validation system.
- The final report flow.

The tutorial also explains that interface sections can be temporarily hidden from the top-right panel controls when the player needs more workspace.

## Main Interface

The investigation screen is divided into several areas:

- The left side contains the evidence vault and cross-reference progress.
- The central area contains the workspace and evidence viewer.
- The right side contains the ARIA chat.
- The bottom area contains the forensic terminal.
- The top bar contains score, progress, tutorial state, difficulty, and panel toggles.

The layout is designed to make the player feel like they are working inside an investigation environment, not only reading static documents.

## Core Loop

The core gameplay loop is:

1. Select an evidence file.
2. Inspect its content and metadata.
3. Ask ARIA questions about the file.
4. Identify claim tags in ARIA's answer.
5. Validate each claim as verified or hallucinated.
6. Add notes when useful.
7. Compare the file with other evidence.
8. Discover cross-evidence connections.
9. Submit a final report.
10. Review the debrief.

This loop repeats across the evidence set and gradually builds the full case.

## Claim Validation

ARIA responses include claim tags such as `CLAIM-001`.

Each claim has a ground truth stored in the game data. The player must decide whether the claim is:

- Verified by the evidence.
- A hallucination.

The player also chooses a confidence level. This encourages calibration: the player should not only decide what is true, but also think about how strongly the evidence supports the decision.

## Terminal Interaction

The terminal gives the game a forensic investigation flavor. It supports command-style actions such as scanning evidence, checking hashes, inspecting metadata, validating claims, adding notes, connecting evidence, and submitting the report.

The terminal reinforces the idea that forensic work is procedural. It also makes the game feel closer to a technical investigation environment.

## Evidence Board

The board supports cross-evidence reasoning. The player can connect files when there is a meaningful relationship between them.

Examples include:

- Matching an IP address in an email header with an IP in firewall logs.
- Matching an audio creation timestamp with anomalous network activity.
- Comparing document modification times with other case events.

This encourages the player to move beyond single-file inspection and think in terms of a full timeline.

## End Of The Game

The player submits a final report when they believe the investigation is complete.

The debrief screen shows:

- Final score.
- Performance tier.
- Hallucinations found.
- Correct and incorrect validations.
- Calibration feedback.
- Final report details.
- Export options.

The debrief turns the play session into a learning moment by explaining what the player did well and where the reasoning failed.
