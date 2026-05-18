# 09 Context Map

## Purpose

This file maps the project knowledge sources so future updates can stay consistent. It is not a slide outline; it is a maintenance reference for understanding where facts live.

## Canonical Files

| Topic | Primary source |
| --- | --- |
| Project overview | `README.md` |
| Local setup and Gemini configuration | `docs/setup-and-api-key.md` |
| Gameplay flow and assessment gates | `docs/gameplay-and-assessment.md` |
| GitHub Pages deployment | `docs/deployment.md` |
| Evidence content and metadata | `src/data/evidence.json` |
| Scripted responses and claim truth labels | `src/data/aria_responses.json` |
| Cross-evidence connections | `src/data/connections.json` |
| Scoring constants | `src/lib/scoring.ts` |
| Game state transitions | `src/context/GameContext.tsx` |
| Terminal command behavior | `src/components/Terminal.tsx` |

## Context Files In This Folder

| File | Role |
| --- | --- |
| `00_project_context.md` | Defines identity, thesis, scope, and source-of-truth boundaries. |
| `01_problem_statement.md` | Explains the educational and forensic problem addressed by the game. |
| `02_proposed_solution.md` | Describes the solution model, mechanics, and design principle. |
| `03_gameplay_and_user_journey.md` | Documents the player flow and claim-validation journey. |
| `04_forensic_scenario.md` | Summarizes the case, evidence files, and cross-evidence links. |
| `05_ai_hallucination_model.md` | Defines claim structure, hallucination categories, and verification rules. |
| `06_learning_outcomes.md` | Lists forensic, AI literacy, and cybersecurity learning outcomes. |
| `07_technical_implementation.md` | Summarizes stack, architecture, data files, AI modes, and safeguards. |
| `08_evaluation_and_results.md` | Captures implementation status, scoring, limitations, and future work. |
| `09_context_map.md` | Maps documentation and implementation sources. |
| `10_project_runbook.md` | Provides practical operating and update notes. |

## Consistency Checklist

When the project changes, check whether these facts need updating:

- Evidence file list.
- Number of scripted responses.
- Number of claims, true claims, and hallucinated claims.
- Cross-evidence connection list.
- Scoring constants and difficulty multipliers.
- Terminal command set.
- Setup requirements.
- Deployment URL and public demo mode.
- Live AI fallback behavior.
- Known limitations and future work.

## Terminology

Use these terms consistently:

- **ARIA:** the AI assistant and the game identity.
- **Evidence:** the file artifacts inspected by the player.
- **Raw metadata:** the artifact fields used to verify claims.
- **Claim:** an individual AI statement with a claim ID.
- **Verified claim:** a true claim supported by evidence.
- **Hallucination:** an unsupported or contradicted AI claim.
- **Connection:** a valid relationship between two evidence files.
- **Debrief:** the final reflective scoring and feedback screen.

## Update Rule

Implementation data should lead the documentation. If a conflict appears between this folder and `src/data` or `src/lib/scoring.ts`, treat the implementation as the current behavior and update the context files.
