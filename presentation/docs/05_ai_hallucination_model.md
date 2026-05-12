# 05 AI Hallucination Model

## Purpose Of The Hallucination Model

ARIA intentionally produces a mix of correct and incorrect claims.

This design choice is central to the project. The player must learn that an AI assistant can be helpful and dangerous at the same time.

The goal is not to present AI as useless. The goal is to show that AI output must be verified before it becomes part of a forensic conclusion.

## Claim-Based Interaction

ARIA responses contain explicit claim identifiers such as `CLAIM-001`.

This makes the AI output easier to evaluate. Instead of asking the player to judge an entire paragraph at once, the game breaks the response into individual claims.

Each claim can then be checked against the evidence.

## Claim Types

The game includes both:

- True claims that are supported by evidence.
- Hallucinated claims that are not supported by evidence.

This balance is important. If every AI claim were wrong, the player would simply learn to reject everything. If every claim were true, the player would learn to trust blindly.

The correct behavior is selective trust based on verification.

## Hallucination Categories

ARIA includes several types of incorrect claims.

### False Attribution

False attribution occurs when ARIA assigns responsibility or authorship without enough evidence.

Example: claiming that the CEO authored an email based on writing style, even though the email authentication headers show spoofing indicators.

### Fabricated Metadata

Fabricated metadata occurs when ARIA invents technical details that are not present in the evidence.

Example: claiming that an archive of prior emails exists, or that a media file contains airport background noise, when no evidence supports the statement.

### Inverted Finding

An inverted finding occurs when ARIA states the opposite of what the evidence says.

Example: saying that SPF passed when the raw metadata clearly says SPF failed.

### Timestamp Error

A timestamp error occurs when ARIA reports the wrong time or misinterprets a time value.

Example: stating that an audio file was created during business hours when its metadata shows creation at `02:14`.

### Confidence Inflation

Confidence inflation occurs when ARIA attaches a strong percentage or certainty level to a conclusion without a valid methodology.

Example: claiming 95 percent facial biometric certainty without a tool report, reference database, or error rate.

## Why These Errors Matter

These hallucination types are dangerous because they resemble real forensic conclusions.

They include technical language, specific numbers, timestamps, and confident explanations. This makes them persuasive.

The game teaches the player to ask:

- Where is this claim supported?
- Which evidence field proves it?
- Is this a direct observation or an inference?
- Is the confidence justified?
- Could this be a plausible but unsupported detail?

## Verification Principle

The core rule is:

**No claim should be accepted unless it can be traced to evidence.**

In the game, this means checking content, metadata, hashes, timestamps, logs, and cross-evidence links before validating a claim.

In real forensic work, the same principle applies to reports, testimony, incident response documentation, and internal security decisions.

## Educational Value

The hallucination model turns abstract AI reliability concerns into concrete tasks.

The player does not only hear that AI can hallucinate. The player experiences the risk by reading a plausible claim, checking the evidence, and discovering that the claim is unsupported.

This makes the lesson memorable and operational.
