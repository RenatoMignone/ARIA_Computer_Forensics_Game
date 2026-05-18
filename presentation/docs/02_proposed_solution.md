# 02 Solution Design

## Overview

ARIA is a serious game where the player investigates a simulated corporate fraud with help from an unreliable AI assistant.

The assistant produces a mix of supported and hallucinated claims. The player must inspect evidence and decide which claims are valid.

## Educational Method

ARIA uses active learning:

- The player asks questions and receives AI-style analysis.
- Claims are split into tagged units such as `CLAIM-001`.
- The player reviews evidence before validating claims.
- Scoring and debriefing show the cost of overtrust and excessive skepticism.

## Case Structure

The scenario concerns an unauthorized EUR 2.3M wire transfer at TechCorp. The evidence set contains:

- `email_1.eml`: suspicious executive payment request.
- `audio_call.mp3`: call with synthetic speech indicators.
- `teams_meeting.mp4`: meeting recording with manipulation indicators.
- `invoice_fraud.pdf`: invoice with suspicious metadata and payment details.
- `network_logs.txt`: firewall logs with suspicious infrastructure links.

## Main Mechanics

- **Evidence Vault:** lists available files, file status, and cross-reference progress.
- **Workspace:** shows evidence content, raw metadata, notes, timeline details, and claim references.
- **ARIA Chat:** returns AI analysis and claim badges.
- **Claim Validation:** lets the player mark claims as verified or hallucinated.
- **Confidence Selection:** asks the player to record how certain they are.
- **Terminal:** supports forensic commands such as `scan`, `inspect`, `hash verify`, `validate`, `connect`, `note`, `trace`, `decode`, and `report`.
- **Evidence Board:** shows discovered cross-evidence relationships.
- **Debrief:** explains score, mistakes, hallucinations found, calibration, and final report quality.

## Verification Gate

The application blocks claim validation until the related evidence has been reviewed through the Raw Metadata tab or a terminal inspection command.

This is a central design choice. It prevents a player from winning by only prompting ARIA and clicking verdict buttons without touching the artifacts.

## AI Modes

ARIA supports two assistant modes:

- **Scripted mode:** deterministic responses and known truth labels from `src/data/aria_responses.json`. This is the default and recommended assessment mode.
- **Live Gemini mode:** optional local mode backed by a private Gemini API key. It can generate live answers while reusing known claim IDs where possible. If it fails or is unavailable, the game falls back to scripted mode.

## Design Principle

The game should not teach "AI is useless" or "AI is always right." It teaches selective trust: use AI as a lead generator, then accept only what the evidence supports.
