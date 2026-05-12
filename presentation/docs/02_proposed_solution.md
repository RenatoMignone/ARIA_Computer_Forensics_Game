# 02 Proposed Solution

## Overview

ARIA proposes a serious game where the player performs a simulated forensic investigation with the assistance of an AI system.

The AI assistant is useful but unreliable. It produces a mix of true statements and hallucinated claims. The player must decide which claims are valid by inspecting evidence, metadata, logs, and cross-evidence relationships.

The solution is not to remove AI from the workflow. The solution is to teach the player how to use AI safely.

## Educational Approach

The game uses active learning. Instead of presenting rules passively, it asks the player to make decisions and then shows the consequences of those decisions.

The player learns by:

- Asking questions.
- Inspecting evidence.
- Comparing claims against raw data.
- Flagging hallucinations.
- Verifying true statements.
- Connecting evidence across files.
- Submitting a final report.
- Reviewing the debrief.

This structure helps transform forensic concepts into applied reasoning.

## Main Concept

The game introduces a fictional assistant named ARIA, which stands for AI-Assisted Research and Investigation Assistant.

ARIA helps the player analyze the evidence, but its responses are intentionally imperfect. Some claims are correct, while others contain errors such as fabricated metadata, false attribution, timestamp mistakes, and exaggerated confidence.

The player cannot win by simply trusting ARIA. The player also cannot win by rejecting everything ARIA says. The best strategy is careful verification.

## Investigation Structure

The case is built around a corporate fraud scenario involving an unauthorized EUR 2.3M wire transfer at TechCorp.

The player receives five evidence files:

- A suspicious email.
- An audio call.
- A Teams meeting recording.
- A PDF invoice.
- Network logs.

Each evidence item contains visible content, raw metadata, and hashes. The player must use these artifacts to evaluate ARIA's claims and reconstruct the case.

## Game Mechanics

ARIA uses several mechanics to support the learning goal:

- **Evidence vault:** lists the available files.
- **Workspace:** displays content, metadata, notes, and timeline details.
- **ARIA chat:** provides AI-style analysis and claim tags.
- **Claim validation:** asks the player to mark each claim as verified or hallucinated.
- **Confidence selection:** encourages the player to think about certainty.
- **Terminal:** provides command-style forensic interactions.
- **Evidence board:** supports cross-evidence reasoning.
- **Debrief:** explains the final performance and reinforces the lessons.

## Why A Game Format

A game format is appropriate because forensic reasoning is procedural and decision-based.

The player must manage uncertainty, compare artifacts, and make judgments. These actions are easier to understand when experienced interactively rather than only described in slides or text.

The game also provides immediate feedback. Correct decisions are rewarded, wrong decisions are penalized, and the debrief explains what happened. This helps the player understand both the technical facts and the reasoning process.

## Main Contribution

The main contribution of ARIA is the combination of:

- Digital forensic evidence analysis.
- AI hallucination detection.
- Interactive claim verification.
- Serious game design.
- A complete case narrative.

The result is a learning tool that teaches students how to investigate with AI while remaining skeptical, precise, and evidence-driven.
