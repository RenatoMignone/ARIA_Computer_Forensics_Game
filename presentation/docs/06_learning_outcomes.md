# 06 Learning Outcomes

## Main Learning Goal

The main learning goal of ARIA is to develop evidence-based judgment in AI-assisted forensic analysis.

After playing the game, the student should better understand that AI output can support an investigation, but it cannot replace forensic verification.

## Forensic Skills

The game trains several forensic skills.

### Metadata Analysis

The player inspects metadata from emails, audio files, video files, PDF documents, and network logs.

This includes fields such as:

- SPF and DKIM results.
- Return-Path and originating IP.
- Creation and modification timestamps.
- Encoders and creator tools.
- Media format details.
- Hash values.
- Network source and destination addresses.

### Timeline Reasoning

The player must compare timestamps across evidence files.

This helps build a case timeline and reveals meaningful relationships, such as the connection between the audio file creation time and suspicious network activity.

### Cross-Evidence Correlation

The player learns that strong investigations often require more than one artifact.

A single file can be suspicious, but multiple aligned artifacts make the reasoning stronger.

### Chain Of Custody Awareness

The game includes hashes, evidence selection, notes, and investigation events.

This introduces the idea that evidence must be tracked and handled carefully.

The terminal command `hash verify <file>` and the chain-of-custody log make this concept visible during play instead of leaving it only as theory.

### Report-Oriented Thinking

The final report flow encourages the player to think about the investigation as something that must be communicated clearly.

A forensic conclusion is not only a private belief. It must be explainable.

The debrief then connects the player's actions back to the learning goal by showing correct validations, mistakes, hallucinations found, calibration feedback, and report results.

## AI Literacy Skills

The game also trains AI literacy in a forensic context.

### Detecting Unsupported Claims

The player learns to recognize claims that sound technical but are not supported by the available artifacts.

### Understanding AI Overconfidence

The player sees that confident wording or numerical certainty does not automatically mean reliability.

### Separating Evidence From Inference

The player learns the difference between:

- A direct metadata value.
- A reasonable inference.
- A speculation.
- A hallucinated claim.

### Calibrating Trust

The player must neither trust everything nor reject everything.

The correct behavior is calibrated trust: accept what is supported, reject what is unsupported, and remain careful when evidence is incomplete.

The evidence-review gate supports this outcome by making raw evidence inspection a required step before claim validation.

## Cybersecurity Concepts

The scenario introduces several cybersecurity and fraud concepts:

- Spear phishing.
- Email spoofing.
- Business email compromise.
- Voice cloning.
- Deepfake indicators.
- Suspicious PDF generation.
- Tor-related network activity.
- Exfiltration patterns.
- Social engineering pressure.

These concepts are introduced through evidence rather than only through definitions.

## Expected Student Outcomes

After completing the game, the student should be able to:

- Explain why AI output must be verified in forensic contexts.
- Identify common hallucination patterns in technical analysis.
- Read basic forensic metadata across multiple evidence types.
- Validate or reject claims using evidence.
- Build a simple incident timeline.
- Understand the value of cross-evidence correlation.
- Recognize the risks of unsupported confidence.
- Produce a more defensible investigative conclusion.
- Use an AI assistant as a source of leads without treating it as the source of truth.

## Broader Educational Outcome

ARIA encourages a professional mindset.

The player learns that forensic work is not about guessing the most likely story. It is about building the strongest conclusion that the evidence can support.
