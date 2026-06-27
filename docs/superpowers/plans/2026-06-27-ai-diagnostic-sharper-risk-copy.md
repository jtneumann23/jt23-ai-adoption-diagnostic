# AI Diagnostic Sharper Risk Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the JT23 AI Adoption Diagnostic more urgent and conversion-focused without rebuilding the site.

**Architecture:** Keep the existing vinext/React page structure. Update static content in `app/page.tsx` and diagnostic data in `app/lib/diagnostic.ts`; keep scoring logic untouched.

**Tech Stack:** vinext, React 19, TypeScript, Tailwind CSS v4, Sites hosting.

## Global Constraints

- Keep the tone balanced but sharper, with a little bluntness.
- Preserve the three-check diagnostic model.
- Do not add forms, storage, authentication, analytics, or new paid services.
- Do not change score values or maturity score ranges.
- Keep rating buttons shorter but still readable and tappable.

---

### Task 1: Update Diagnostic Content

**Files:**
- Modify: `app/lib/diagnostic.ts`

**Interfaces:**
- Consumes: existing `Assessment`, `Question`, and `MaturityLevel` types.
- Produces: the same `assessments`, `maturityLevels`, `scoreAssessment`, and `getMaturityLevel` exports.

- [ ] **Step 1: Update rating labels**

Replace the `scaleOptions` labels with:

```ts
const scaleOptions: Question["options"] = [
  { value: 1, label: "Not ready" },
  { value: 2, label: "Patchy" },
  { value: 3, label: "Some traction" },
  { value: 4, label: "Working" },
  { value: 5, label: "Clear habit" },
];
```

- [ ] **Step 2: Sharpen assessment descriptions, questions, and next steps**

Rewrite each assessment to name concrete pain points: unmanaged AI use, sensitive data, inconsistent staff practice, workflow waste, weak review habits, and missing policy ownership.

- [ ] **Step 3: Sharpen maturity explanations**

Rewrite all four `maturityLevels` explanations so low scores feel like risk, middle scores feel like uneven adoption, and high scores still point to governance and repeatable workflows.

- [ ] **Step 4: Run scoring test**

Run: `npm run test:scoring`

Expected: PASS.

### Task 2: Update Page Copy And Button Layout

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: unchanged `assessments`, `scoreAssessment`, and `getMaturityLevel`.
- Produces: same interactive diagnostic page.

- [ ] **Step 1: Rewrite hero copy**

Make the hero say that AI is already showing up in daily work, and the real question is whether the team has policy, training, and review habits.

- [ ] **Step 2: Rewrite diagnostic section copy**

Frame the three checks as a way to find where risk is building before it becomes a leadership problem.

- [ ] **Step 3: Make rating buttons shorter**

Change rating button classes from `min-h-16 px-3 py-3` to a shorter layout such as `min-h-12 px-3 py-2`.

- [ ] **Step 4: Rewrite results and CTA copy**

Make results point toward a readiness call, policy workshop, or training session.

- [ ] **Step 5: Run flow test**

Run: `npm run test:flow`

Expected: PASS.

### Task 3: Validate Build And Prepare Site Version

**Files:**
- Read: `.openai/hosting.json`
- Build output: `dist/`

**Interfaces:**
- Consumes: updated source.
- Produces: deployable Sites build.

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 2: Inspect changed files**

Run: `git diff -- app/page.tsx app/lib/diagnostic.ts docs/superpowers`

Expected: only approved copy/layout/spec changes.

- [ ] **Step 3: Commit changes**

Run:

```bash
git add app/page.tsx app/lib/diagnostic.ts docs/superpowers
git commit -m "Refine AI diagnostic risk messaging"
```

- [ ] **Step 4: Push and save a Sites version**

Use the Sites source repository credential, push the committed source, then save a Sites version using the new commit SHA.
