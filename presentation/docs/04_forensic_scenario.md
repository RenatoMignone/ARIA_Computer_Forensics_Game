# 04 Forensic Scenario

## Case Summary

TechCorp suffers an unauthorized EUR 2.3M wire transfer. The request appears to combine social engineering, spoofed communication, synthetic media, suspicious documentation, and network activity.

The attacker appears to impersonate Marco Rossi, TechCorp's CEO, and pressures Luca Ferrari, the CFO, to perform an urgent transfer.

## Evidence Files

### `email_1.eml`

Suspicious executive wire transfer request.

Key facts:

- Sender domain is suspicious.
- SPF fails.
- DKIM has a domain mismatch.
- Return-Path points to `mailer-svc-eu7.xyz`.
- X-Originating-IP is `91.200.81.47`.
- Spam score is high.
- The email is a single plain-text message with no attachments indicated.

Lesson: inspect headers and authentication results, not only the visible sender name.

### `audio_call.mp3`

Short call that appears to be from the CEO.

Key facts:

- Creation timestamp is `2026-03-03T02:14:33Z`.
- Duration is `00:02:14`.
- Sample rate is `22050 Hz`.
- Encoder suggests a text-to-speech pipeline artifact.
- Spectral analysis indicates synthetic speech patterns.
- Background noise appears artificially added.

Lesson: voice content alone does not prove authenticity.

### `teams_meeting.mp4`

Meeting recording that appears to show the CEO.

Key facts:

- Creation timestamp is `2026-03-04T09:22:11Z`.
- Encoder is OBS Studio, not a native Teams recorder.
- GPS data is absent.
- Facial region has higher bitrate than the background.
- Thumbnail hash does not match frame 0.
- Compression artifacts appear around the face boundary.

Lesson: visual media must be checked through metadata and manipulation indicators.

### `invoice_fraud.pdf`

Invoice for a supposed strategic advisory service.

Key facts:

- Amount is EUR 2.3M and matches the wire transfer request.
- IBAN is `DE89 3704 0044 0532 0130 00` and matches the email content.
- Creator is `AutoDoc AI Writer v2.1`.
- File was modified shortly after creation.
- No digital signature is present.
- The `CreatorTool` field contains base64-encoded metadata.

Lesson: document metadata and payment details matter as much as visible content.

### `network_logs.txt`

Firewall activity from the incident period.

Key facts:

- Host `192.168.1.88` is an unregistered guest device.
- Destination `91.200.81.47` matches the email infrastructure.
- A Tor exit node connection occurs around `02:14`.
- Outbound anomaly suggests possible exfiltration.
- Log integrity chain is verified.

Lesson: logs provide correlation and timeline evidence, but correlation still needs careful wording.

## Main Cross-Evidence Links

1. `91.200.81.47` appears in both email metadata and network logs.
2. Audio creation time aligns with suspicious network activity around `02:14`.
3. Invoice creation and modification times are close to suspicious outbound activity from the unregistered workstation.

## Scenario Lesson

The fraud works because the artifacts look plausible together. The investigator must resist urgency and authority pressure by checking evidence, metadata, and timeline consistency.
