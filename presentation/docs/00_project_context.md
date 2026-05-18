# 00 Project Context

## Project Identity

**ARIA: AI-Assisted Forensic Investigation Game** is a browser-based serious game for a Computer Forensics course.

The player acts as a forensic investigator on a simulated corporate fraud case. They inspect digital evidence, question an AI assistant named ARIA, validate AI-generated claims, connect related artifacts, and submit a final report.

## Core Thesis

ARIA is built around one rule:

**AI can assist an investigation, but forensic conclusions must be verified against evidence.**

The fictional fraud case is the vehicle for that lesson. The deeper learning objective is to train the habit of separating artifact-backed findings, reasonable inference, and unsupported AI output.

## Academic Context

The project sits at the intersection of:

- Digital forensics and cyber crime analysis.
- AI-assisted investigative workflows.
- AI hallucination and overtrust risks.
- Serious game design for applied learning.

In real forensic work, automated tools and AI assistants can summarize material, suggest leads, and accelerate triage. They can also produce plausible errors. ARIA turns that risk into a playable verification loop.

## Project Scope

The current prototype focuses on one complete investigation scenario: an unauthorized EUR 2.3M transfer at TechCorp.

The scenario includes five evidence files:

- `email_1.eml`
- `audio_call.mp3`
- `teams_meeting.mp4`
- `invoice_fraud.pdf`
- `network_logs.txt`

The game currently includes 7 scripted ARIA responses, 28 unique claims, 14 hallucinated claims, 14 true claims, and 3 valid cross-evidence connections.

## Source Of Truth

The main project documentation is split across:

- [README.md](../../README.md): project overview, feature summary, scoring, structure, and run commands.
- [docs/](../../docs): setup, gameplay, assessment, and deployment guides.
- [src/data/](../../src/data): canonical scenario data, scripted AI responses, claim truth labels, and evidence connections.
- [presentation/docs/](.): contextual notes about the project, learning design, scenario, and implementation rationale.

These files should stay consistent with the application data and behavior. If the evidence set, scoring rules, claim catalog, or deployment mode changes, update this context folder as well.

## Intended Learning Experience

Students should practice:

- Inspecting evidence content and raw metadata.
- Checking hashes, headers, timestamps, encoders, logs, and payment details.
- Comparing AI claims with artifacts.
- Marking claims as verified or hallucinated.
- Connecting evidence across files.
- Building a defensible final report.

## Design Position

ARIA is not a chatbot demo and not a general-purpose forensic suite. It is a focused learning environment where the AI assistant is useful but intentionally unreliable.

The player succeeds by using ARIA as a lead generator while allowing the evidence to decide which claims are accepted.
