# 01 Problem Statement

## Educational Gap

Computer forensics requires students to combine many small observations into a defensible conclusion. Lectures and isolated tool exercises can teach individual artifacts, but they do not always train the full investigation workflow.

ARIA addresses this gap with a complete case where the player must inspect multiple evidence types, compare observations, and reason across artifacts.

## Modern Risk

AI assistants are increasingly used to support technical work, including:

- Summarizing logs.
- Explaining metadata.
- Identifying suspicious artifacts.
- Suggesting event correlations.
- Drafting reports.

The risk is not only that AI can be wrong. The risk is that AI can be wrong while sounding precise, technical, and confident.

## Why This Matters In Forensics

Forensic conclusions must be traceable to artifacts such as headers, timestamps, hashes, logs, metadata fields, or file contents.

Unsupported AI claims can cause:

- Incorrect attribution.
- Wrong timelines.
- Misread metadata.
- Trust in spoofed communication.
- Confusion between correlation and proof.
- Reports that cannot be defended.

## Project Problem

ARIA focuses on **AI overtrust during forensic analysis**.

The player receives helpful and flawed AI output. Each claim must be checked against raw evidence before it can be accepted. The game also avoids teaching blanket rejection by including true claims that deserve verification.

## Design Requirement

The learning system must make evidence review the central action. A good solution should:

- Require interaction with raw evidence before claim validation.
- Represent AI output as individually checkable claims.
- Reward correct verification and hallucination detection.
- Penalize both blind trust and excessive skepticism.
- Provide reflective feedback after the investigation.

## Guiding Question

How can an interactive game teach students to use AI support critically while preserving evidence-based forensic reasoning?

ARIA answers with a claim-validation loop: inspect evidence, ask ARIA, verify or reject claims, connect artifacts, submit a report, and review the debrief.
