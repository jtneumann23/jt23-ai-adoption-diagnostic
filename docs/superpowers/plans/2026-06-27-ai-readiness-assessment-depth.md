# AI Readiness Assessment Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the JT23 diagnostic content and readiness snapshot so the tool feels like a practical company AI readiness lead magnet.

**Architecture:** Keep the existing client-rendered page and diagnostic scoring model. Change assessment content in `app/lib/diagnostic.ts`, update page copy and snapshot markers in `app/page.tsx`, and add a few supporting CSS tokens in `app/globals.css`.

**Tech Stack:** Next/Vinext, React, TypeScript, Tailwind CSS utility classes, Node test runner.

## Global Constraints

- Keep visible flows as AI Literacy, AI Policy, and AI Risk.
- Keep eight questions per flow.
- Write for small business, nonprofit, public-sector, and mixed practical operations audiences.
- Do not mention token spend.
- Use "regulatory and public-sector requirements" for compliance language.
- Keep green as the JT23 accent, but reduce repeated neon-green snapshot markers.

---

### Task 1: Rewrite Diagnostic Assessment Content

**Files:**
- Modify: `app/lib/diagnostic.ts`
- Test: `tests/scoring.test.ts`

**Interfaces:**
- Consumes: `Assessment`, `Question`, `makeQuestions(prefix, prompts)`
- Produces: `assessments` with IDs `literacy`, `policy`, and `risk`, each with eight questions and five answer options.

- [ ] **Step 1: Update the assessment array**

Replace the three assessment objects with AI Literacy, AI Policy, and AI Risk. Keep eight prompts in each `makeQuestions` call.

- [ ] **Step 2: Update result guidance**

Revise `nextSteps` so each flow gives company-ready next moves tied to training, policy, and safe adoption.

- [ ] **Step 3: Keep scoring unchanged**

Leave `scoreAssessment` as the sum of selected values and keep `getMaturityLevel` score boundaries at 0-12, 13-24, 25-32, and 33-40.

- [ ] **Step 4: Run scoring test**

Run: `npm run test:scoring`

Expected: PASS, including the eight-question assertion.

### Task 2: Update Page Copy And Readiness Snapshot

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `assessments` exported from `app/lib/diagnostic.ts`
- Produces: readiness snapshot rows for AI Literacy, AI Policy, and AI Risk with calmer accent markers.

- [ ] **Step 1: Add supporting color tokens**

Add CSS variables for calm snapshot accents: policy amber, risk red, and soft green.

- [ ] **Step 2: Update diagnostics section copy**

Change the intro copy so it points to literacy, policy, and risk instead of literacy, workflow practice, and policy support.

- [ ] **Step 3: Update snapshot rows**

Use AI Literacy, AI Policy, and AI Risk rows. Give each row its own marker color instead of repeating JT23 green.

- [ ] **Step 4: Keep CTA behavior unchanged**

Leave assessment selection, result display, and booking links unchanged.

### Task 3: Verify Flow And Quality

**Files:**
- Test: `work/check-flow.tsx`
- Test: `package.json`

**Interfaces:**
- Consumes: updated visible page text and scoring behavior.
- Produces: passing tests and a visually checked diagnostic page.

- [ ] **Step 1: Run scoring test**

Run: `npm run test:scoring`

Expected: PASS.

- [ ] **Step 2: Run flow test**

Run: `npm run test:flow`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: PASS or only pre-existing warnings unrelated to this change.

- [ ] **Step 4: Start local app for visual check**

Run: `npm run dev`

Expected: local dev server starts and the diagnostics page shows the updated flows and calmer readiness snapshot.

## Self-Review

- Spec coverage: Tasks cover content rewrite, snapshot color update, and verification.
- Placeholder scan: No placeholders remain.
- Type consistency: Existing exported types and scoring functions stay unchanged.
