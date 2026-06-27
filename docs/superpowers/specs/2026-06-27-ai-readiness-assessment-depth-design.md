# AI Readiness Assessment Depth Design

## Goal

Upgrade the JT23 AI Adoption Diagnostic into a stronger lead magnet for small businesses, nonprofits, public-sector teams, and mixed operations groups that need a practical read on AI readiness.

## Current Understanding

The existing app has three eight-question flows and a simple 1-to-5 scoring model. The visible flows should remain familiar and short enough to complete quickly, but the content should feel more like a company readiness check than a light quiz.

The three visible flows stay:

- AI Literacy
- AI Policy
- AI Risk

People capability, risk control, and transformation value should be woven into those flows rather than replacing the flow names.

## Smallest Useful Version

Keep the current app structure, scoring model, and result flow. Rewrite the assessment titles, descriptions, questions, and next steps. Update the readiness snapshot so it does not rely only on repeated neon-green markers.

## Content Requirements

- Use roughly eight questions per assessment.
- Write for small business, nonprofit, municipal, public-sector, and practical operations audiences.
- Include when to use AI, when not to use AI, what stays human, choosing the right tool or agent for the task, beginner-to-advanced maturity, data security, privacy, confidential information, policy gaps, tool sprawl, shadow AI, client/community safety, workflow change, leadership, process design, measurable value, and cost discipline.
- Do not mention token spend.
- Use "regulatory and public-sector requirements" instead of narrower federal-policy wording.
- Keep the tone plain-English, direct, practical, and company-ready.

## UI Requirements

- Keep green as the JT23 accent.
- Reduce repeated neon-green use inside the readiness snapshot.
- Add calmer supporting status colors for the three snapshot rows.
- Keep the page accessible and easy to scan.

## Files

- `app/lib/diagnostic.ts`: assessment titles, descriptions, audience text, questions, next steps, and maturity explanations.
- `app/page.tsx`: readiness snapshot labels/details/color markers and any flow copy that references the old "training" framing.
- `app/globals.css`: supporting color tokens for calmer snapshot accents.
- `tests/scoring.test.ts`: update expectations if assessment IDs or titles change.

## Testing

- Run `npm run test:scoring`.
- Run `npm run test:flow`.
- Run `npm run lint`.
- Visually inspect the diagnostics page and readiness snapshot.

## Risks

- If the questions become too broad, the assessment will feel vague.
- If policy language is too heavy, small teams may feel the tool is not for them.
- If the categories are renamed too aggressively, returning users may lose the thread of the existing product.
- If scoring ranges change, tests and result copy need to stay aligned.

## Decision

Proceed with the existing three-flow structure, eight questions per flow, broad regulatory wording, no token-spend language, and a calmer readiness snapshot palette.
