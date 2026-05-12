# 09 Presentation Storyline

## Suggested Presentation Flow

This file provides a possible structure for the final presentation.

The goal is to tell the project as a clear story: problem, solution, implementation, demonstration, and learning value.

## 1. Title And Introduction

Introduce the project:

**ARIA: AI-Assisted Forensic Investigation Game**

Explain that it is a serious game for the Computer Forensics course.

The player investigates a corporate fraud case while using an AI assistant that can produce both correct observations and hallucinated claims.

## 2. Motivation

Explain the motivation behind the project.

Modern investigators increasingly interact with automated systems and AI assistants. These tools can accelerate analysis, but they can also produce persuasive errors.

In forensics, persuasive errors are dangerous because conclusions must be evidence-based and defensible.

## 3. Problem Statement

Present the core problem:

Students need to learn not only forensic artifacts, but also how to reason critically when an AI assistant provides analysis.

The challenge is AI overtrust.

An AI answer may sound technical, specific, and confident, but still be unsupported by evidence.

## 4. Proposed Concept

Present ARIA as the proposed solution.

ARIA turns the problem into an interactive investigation. The player must inspect evidence, question the assistant, validate claims, and produce a final report.

The key rule is:

**Every AI claim must be checked against raw evidence.**

## 5. Case Scenario

Explain the case.

TechCorp suffers an unauthorized EUR 2.3M wire transfer. The evidence suggests a coordinated fraud involving email spoofing, voice cloning, deepfake-style video artifacts, a suspicious invoice, and anomalous network activity.

The player receives five evidence files and must reconstruct what happened.

## 6. Evidence Set

Briefly present each evidence file:

- `email_1.eml`: suspicious executive wire transfer request.
- `audio_call.mp3`: voice call with synthetic indicators.
- `teams_meeting.mp4`: video meeting with manipulation artifacts.
- `invoice_fraud.pdf`: invoice with suspicious metadata.
- `network_logs.txt`: firewall logs with suspicious connections.

Explain that each file contains content, metadata, and hashes.

## 7. Gameplay Walkthrough

Show the gameplay loop:

1. Select evidence.
2. Inspect content and metadata.
3. Ask ARIA questions.
4. Read claim tags.
5. Validate claims.
6. Add notes.
7. Connect evidence.
8. Submit the final report.
9. Review the debrief.

This is the best point to include screenshots or a live demo.

## 8. AI Hallucination Examples

Show examples of hallucination types:

- False attribution.
- Fabricated metadata.
- Inverted findings.
- Timestamp errors.
- Confidence inflation.

Explain why these errors are risky in a forensic investigation.

## 9. Forensic Learning Outcomes

Explain what the player learns:

- How to inspect metadata.
- How to validate claims.
- How to correlate evidence.
- How to build a timeline.
- How to avoid blind trust in AI output.
- How to separate evidence, inference, and speculation.

## 10. Technical Implementation

Briefly present the implementation:

- React and TypeScript frontend.
- Vite build system.
- JSON-based evidence and claim data.
- Scripted ARIA responses for controlled educational behavior.
- Optional live AI mode.
- Local save system.
- Terminal and workspace interface.

Keep this section concise. The focus should remain on the educational design and forensic reasoning.

## 11. Results And Current Status

Explain that the game is currently playable from start to finish.

Implemented features include tutorial, evidence vault, workspace, ARIA chat, terminal, claim validation, scoring, cross-evidence board, final report, and debrief.

Mention that the project is a prototype but already demonstrates the main educational objective.

## 12. Limitations

Present limitations honestly:

- One main scenario.
- Limited scripted response coverage.
- Local-only save system.
- No backend for verified classroom-wide result sharing.
- Future expansion could add more scenarios and instructor tools.

## 13. Conclusion

Close with the main message:

ARIA teaches that AI can support forensic work, but cannot replace evidence-based reasoning.

The game trains the player to verify claims, question confidence, and build conclusions from artifacts rather than assumptions.

## Final Presentation Message

The strongest closing sentence is:

**In digital forensics, the assistant can suggest, but the evidence must decide.**
