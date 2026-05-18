# 05 AI Hallucination Model

## Purpose

ARIA intentionally produces both supported and unsupported claims. This makes AI reliability a practical task instead of an abstract warning.

The goal is calibrated trust: use the assistant for leads, then verify before accepting.

## Claim-Based Design

ARIA responses contain claim IDs such as `CLAIM-001`. Each claim is evaluated independently instead of asking the player to judge a full paragraph at once.

Each claim has:

- A unique ID.
- Related evidence.
- Claim text.
- Ground truth: verified or hallucinated.
- Hallucination type when applicable.
- Feedback explanation.
- Hint text.
- Relevant metadata fields.

The canonical scripted claim catalog is stored in `src/data/aria_responses.json`.

## Claim Balance

The current scripted scenario contains:

| Category | Count |
| --- | ---: |
| Scripted ARIA responses | 7 |
| Unique claims | 28 |
| True claims | 14 |
| Hallucinated claims | 14 |

Balanced claims are important:

- If all claims were false, players would learn blanket rejection.
- If all claims were true, players would learn blind trust.
- Mixed claims force evidence-based judgment.

## Hallucination Categories

### False Attribution

ARIA assigns responsibility or authorship without enough evidence.

Example: claiming the CEO authored an email based only on writing style while headers show spoofing indicators.

### Fabricated Metadata

ARIA invents details that are not present in the evidence.

Example: claiming a prior email archive or background airport noise exists when no artifact supports it.

### Inverted Finding

ARIA states the opposite of the evidence.

Example: saying SPF passed when raw metadata says SPF failed.

### Timestamp Error

ARIA reports or interprets time incorrectly.

Example: claiming an audio file was created during business hours when metadata shows `02:14`.

### Confidence Inflation

ARIA gives strong certainty without methodology.

Example: claiming biometric certainty without a tool report, reference database, or error rate.

## Live AI Handling

In live Gemini mode, repeated forensic facts should reuse existing claim IDs when possible. This prevents duplicate badges and keeps attention on validation rather than claim proliferation.

The live mode prompt receives the selected evidence, raw metadata, and a catalog of known claims for that evidence. If Gemini is unavailable, invalid, rate-limited, or exhausted, the app falls back to scripted responses.

## Verification Principle

No AI claim should be accepted unless it can be traced to evidence.

Valid support can come from:

- Content.
- Raw metadata.
- Headers.
- Hashes.
- Timestamps.
- Logs.
- Cross-evidence links.

The interface reinforces this by blocking claim validation until the relevant evidence has been reviewed.
