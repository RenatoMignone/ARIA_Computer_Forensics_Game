# 01 Problem Statement

## The Educational Problem

Computer forensics requires careful reasoning, attention to detail, and a strong separation between evidence, inference, and speculation.

Students often learn forensic procedures through lectures, isolated exercises, or tool demonstrations. These approaches are useful, but they can make the investigation process feel fragmented. A student may understand what a hash is, what metadata is, or what an email header is, but still struggle to combine those elements into a coherent investigative workflow.

ARIA addresses this gap by creating a complete case scenario where the player must use multiple types of evidence together.

## The Modern Challenge

AI systems are increasingly used to support technical work. In cybersecurity and digital forensics, this can include:

- Summarizing logs.
- Explaining file metadata.
- Identifying suspicious artifacts.
- Suggesting correlations between events.
- Drafting reports.

However, AI systems can produce outputs that sound plausible while being wrong. This is especially risky in forensic work because a wrong conclusion can affect attribution, legal reasoning, incident response, and organizational decisions.

The problem is not only that AI can be wrong. The deeper problem is that AI can be wrong in a convincing way.

## Why This Matters In Forensics

Forensic work is evidence-driven. Every conclusion should be traceable to an artifact, a timestamp, a hash, a header, a log entry, or another verifiable source.

If an investigator accepts an unsupported claim because it sounds confident, the investigation becomes fragile. The final report may contain fabricated details, incorrect timelines, or invalid correlations.

In a real case, this could lead to:

- Misidentifying the source of an attack.
- Missing a true indicator of compromise.
- Trusting a spoofed email.
- Misreading metadata.
- Confusing correlation with proof.
- Producing a report that cannot be defended.

## Specific Problem Addressed By ARIA

ARIA focuses on the problem of **AI overtrust during forensic analysis**.

The player is given an AI assistant that sometimes provides correct observations and sometimes introduces hallucinated claims. The player must verify each claim using raw evidence.

This transforms AI hallucination from an abstract concept into a practical forensic challenge.

## Design Question

The project is built around one main design question:

**How can a game teach students to use AI support critically while preserving evidence-based forensic reasoning?**

ARIA answers this question by combining game mechanics, simulated evidence, claim validation, scoring, feedback, and a final debrief.
