# 10 Project Runbook

## Purpose

This runbook records practical project operations: how to run the game, which mode to use for stable evaluation, what to check before sharing the project, and how to update the context when the implementation changes.

## Recommended Evaluation Mode

Use:

- Guided Run.
- No Timer.
- Scripted mode.

This path is deterministic and does not depend on API availability. Live Gemini can run locally with a private `.env`, while the public GitHub Pages build intentionally uses scripted mode.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Optional Live AI Mode

Scripted mode is the default and needs no API key:

```env
VITE_LIVE_AI=false
```

Live Gemini mode is local-only. Create `.env` from `.env.example`, then set:

```env
VITE_LIVE_AI=true
VITE_GEMINI_KEY=your_gemini_api_key_here
```

Restart the Vite dev server after changing `.env`.

Do not commit `.env` or expose a real API key in screenshots, reports, or public hosting configuration.

## Public Deployment

GitHub Pages deployment uses the workflow in `.github/workflows/deploy.yml`.

The public demo build uses:

```env
VITE_PUBLIC_DEMO=true
VITE_LIVE_AI=false
```

This keeps the hosted version deterministic and avoids leaking private Gemini credentials through client-side JavaScript.

## Basic Smoke Test

After meaningful changes, check this path:

1. Run `npm run build`.
2. Start a Guided Run with no timer.
3. Select `email_1.eml`.
4. Open raw metadata.
5. Ask ARIA about suspicious email indicators.
6. Validate one true claim and one hallucinated claim.
7. Run terminal commands such as `scan`, `inspect email_1`, and `hash verify email_1`.
8. Confirm that claim validation requires evidence review.
9. Confirm that the report remains blocked until the case claim set is complete.

## Updating Scenario Data

When changing `src/data/evidence.json`:

- Keep evidence IDs stable if existing claims or connections refer to them.
- Update claim metadata fields that point to renamed or removed evidence fields.
- Update cross-evidence connections if shared indicators change.
- Update this context folder if the evidence list or scenario lesson changes.

When changing `src/data/aria_responses.json`:

- Keep claim IDs unique.
- Preserve a mix of true and hallucinated claims.
- Ensure every claim has a clear explanation and evidence reference.
- Recalculate claim totals in `00_project_context.md` and `05_ai_hallucination_model.md`.

When changing `src/data/connections.json`:

- Keep descriptions precise about what the connection proves.
- Avoid overstating correlation as identity or causation.
- Update scoring/status references if the number of connections changes.

## Updating Scoring

Scoring constants currently live in `src/lib/scoring.ts` and report/bonus handling also appears in `src/context/GameContext.tsx` and `src/components/Terminal.tsx`.

If scoring changes, update:

- [08_evaluation_and_results.md](08_evaluation_and_results.md)
- [README.md](../../README.md)
- [docs/gameplay-and-assessment.md](../../docs/gameplay-and-assessment.md)

## Maintenance Principle

Keep this folder as durable project context. It should explain what the project is, how it works, and why the design choices exist without depending on a specific live presentation or demo sequence.
