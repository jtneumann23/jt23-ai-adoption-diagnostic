# AI Diagnostic Sharper Risk Copy Design

## Goal

Revise the JT23 AI Adoption Diagnostic so it keeps its practical, approachable tone while making the risk of unmanaged AI use more obvious and more compelling for consulting and workshop leads.

## Current Understanding

The existing site works as a clean diagnostic with three checks: AI literacy, training needs, and policy gaps. The layout is usable and should be preserved. The weakness is conversion pressure: the copy is helpful but too gentle, and it does not clearly name the cost of missing policy, training, review habits, and shared AI rules.

## Approved Direction

Use a balanced but sharper tone with a little bluntness. Keep the site credible and practical, but make the visitor feel the operational pain: staff are already experimenting, policy may lag behind behavior, private information can leak, weak AI output can reach clients, and leaders may not know where risk is concentrated.

## Smallest Useful Version

Do a focused content and layout polish pass:

- Tighten the hero around unmanaged AI use and policy/training gaps.
- Make diagnostic cards more specific about pain points.
- Shorten the 1-5 rating buttons.
- Rename score 2 from "Early thinking" to a more direct label.
- Rewrite result explanations and next steps so they lead naturally into a readiness call, policy workshop, or role-based training.
- Avoid new data storage, authentication, forms, analytics, or major visual redesign.

## Build Steps

1. Update `app/lib/diagnostic.ts` for rating labels, assessment descriptions, questions, maturity explanations, and recommended next steps.
2. Update `app/page.tsx` for hero, diagnostic section, helper text, result framing, CTA, and About copy.
3. Adjust button sizing in `app/page.tsx` so rating controls feel shorter while remaining readable and tappable.
4. Validate the scoring and flow tests.
5. Run the production build before saving or deploying.

## Testing Steps

- Run `npm run test:scoring`.
- Run `npm run test:flow`.
- Run `npm run build`.
- Confirm the source has no secrets or private data.

## Risks

- Too much fear-based copy could reduce trust, especially with public sector, nonprofit, or cautious business audiences.
- Shorter buttons can hurt touch usability if reduced too far.
- Changing labels must not change score values or scoring logic.
- The current booking URL is a placeholder and will not convert until replaced with the real booking link.

## Blind Spots

- The exact target audience is broad: municipalities, nonprofits, small businesses, HR, operations, and leaders may respond to slightly different pain points.
- The site does not currently collect leads directly, so conversion depends on the booking link.
- The live booking destination is still `https://example.com/book`.

## Decision

Approved by the user on 2026-06-27: balanced but sharper, with a little bluntness.
