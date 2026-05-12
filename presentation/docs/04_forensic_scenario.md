# 04 Forensic Scenario

## Case Summary

The fictional case concerns an unauthorized EUR 2.3M wire transfer at TechCorp.

The transfer appears to have been approved through a combination of social engineering, spoofed communication, synthetic media, and suspicious network activity.

The player must inspect the evidence and understand whether the request was legitimate or fraudulent.

## Narrative Premise

The attacker appears to impersonate Marco Rossi, the CEO of TechCorp, and pressures Luca Ferrari, the CFO, to perform an urgent wire transfer.

The attacker uses multiple artifacts to make the request look legitimate:

- A fake executive email.
- A voice call imitating the CEO.
- A video meeting with deepfake indicators.
- A PDF invoice with matching payment details.
- Network activity pointing to suspicious infrastructure.

The case is designed to represent a modern fraud scenario where technical artifacts and social engineering overlap.

## Evidence File 1: Email

The file `email_1.eml` contains an urgent wire transfer request.

Important forensic details include:

- The sender domain is suspicious.
- SPF fails.
- DKIM shows a domain mismatch.
- The Return-Path points to mailer infrastructure.
- The X-Originating-IP is `91.200.81.47`.
- The spam score is high.

The email teaches the player to inspect authentication headers and not rely only on the visible sender name.

## Evidence File 2: Audio Call

The file `audio_call.mp3` contains a short call that appears to be from the CEO.

Important forensic details include:

- The creation timestamp is `2026-03-03T02:14:33Z`.
- The sample rate is `22050 Hz`.
- The encoder suggests a text-to-speech pipeline artifact.
- Spectral analysis indicates synthetic speech patterns.
- Background noise appears artificially added.

The audio file teaches the player to evaluate media metadata and recognize that voice content alone is not enough to prove authenticity.

## Evidence File 3: Teams Meeting

The file `teams_meeting.mp4` appears to show a Teams call involving the CEO.

Important forensic details include:

- The encoder is OBS Studio, not a native Teams recorder.
- GPS data is absent.
- The facial region has significantly higher bitrate than the background.
- The thumbnail hash does not match frame 0.
- Compression artifacts appear around the face boundary.

The video teaches the player to question visual authenticity and inspect technical metadata for manipulation indicators.

## Evidence File 4: PDF Invoice

The file `invoice_fraud.pdf` contains payment information for a supposed strategic advisory service.

Important forensic details include:

- The amount matches the wire transfer request.
- The IBAN matches the email content.
- The creator is `AutoDoc AI Writer v2.1`.
- The file was modified shortly after creation.
- The document has no digital signature.

The invoice teaches the player to inspect document metadata, creation tools, and payment data consistency.

## Evidence File 5: Network Logs

The file `network_logs.txt` contains firewall activity from the day of the incident.

Important forensic details include:

- The host `192.168.1.88` is an unregistered guest device.
- The destination `91.200.81.47` matches the email infrastructure.
- A Tor exit node connection occurs around `02:14`.
- An outbound anomaly suggests possible exfiltration.
- The log integrity chain is verified.

The network logs teach the player to correlate events across systems and use logs as timeline evidence.

## Cross-Evidence Reasoning

The scenario contains three main cross-evidence relationships:

1. The IP `91.200.81.47` appears in both the email metadata and network logs.
2. The audio file creation time aligns with suspicious network activity around `02:14`.
3. The invoice metadata and payment details relate to the fraudulent transfer narrative.

These relationships are important because real investigations rarely depend on a single artifact. Strong reasoning usually comes from multiple artifacts supporting the same timeline or hypothesis.

## Forensic Lesson

The case teaches that fraud investigations require both technical analysis and skepticism.

The attacker relies on urgency, authority, and plausible documentation. The investigator must respond with evidence, metadata, and careful correlation.
