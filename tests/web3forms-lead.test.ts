import assert from "node:assert/strict";
import test from "node:test";
import {
  assessments,
  getMaturityLevel,
  scoreAssessment,
} from "../app/lib/diagnostic.ts";
import {
  aiChallengeOptions,
  buildWeb3FormsLeadPayload,
} from "../app/lib/web3forms-lead.ts";
import { POST } from "../app/api/lead/route.ts";

test("buildWeb3FormsLeadPayload includes lead and report details", () => {
  const assessment = assessments[0];
  const answers = Object.fromEntries(
    assessment.questions.map((question) => [question.id, 4]),
  );
  const score = scoreAssessment(answers);
  const maturity = getMaturityLevel(score);

  const payload = buildWeb3FormsLeadPayload(
    "public-test-key",
    {
      challenge: aiChallengeOptions[3],
      company: "Prairie Ops",
      email: "OWNER@EXAMPLE.COM ",
      name: " Jordan Owner ",
    },
    {
      answers,
      assessment,
      maturity,
      score,
    },
  );

  assert.equal(payload.access_key, "public-test-key");
  assert.equal(payload.botcheck, false);
  assert.equal(payload.name, "Jordan Owner");
  assert.equal(payload.email, "owner@example.com");
  assert.equal(payload.company, "Prairie Ops");
  assert.equal(payload["Biggest AI challenge"], aiChallengeOptions[3]);
  assert.equal(payload["Diagnostic completed"], "AI Literacy Check");
  assert.equal(payload["Score"], "32 / 40");
  assert.equal(payload["Maturity level"], "AI Capable");
  assert.match(String(payload["Answer details"]), /1\. People understand/);
});

test("lead route unlocks report after valid lead submission", async () => {
  const originalAccessKey = process.env.WEB3FORMS_ACCESS_KEY;
  const originalFetch = globalThis.fetch;
  const assessment = assessments[1];
  const answers = Object.fromEntries(
    assessment.questions.map((question) => [question.id, 5]),
  );

  process.env.WEB3FORMS_ACCESS_KEY = "server-test-key";

  let forwardedPayload: Record<string, unknown> | null = null;
  globalThis.fetch = (async (_url, init) => {
    forwardedPayload = JSON.parse(String(init?.body));
    return Response.json({ success: true });
  }) as typeof fetch;

  try {
    const response = await POST(
      new Request("https://example.com/api/lead", {
        body: JSON.stringify({
          answers,
          assessmentId: assessment.id,
          lead: {
            challenge: aiChallengeOptions[2],
            company: "",
            email: "LEAD@EXAMPLE.COM",
            name: "Lead Magnet",
          },
        }),
        method: "POST",
      }),
    );
    const payload = (await response.json()) as { success?: boolean };

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(forwardedPayload?.access_key, "server-test-key");
    assert.equal(forwardedPayload?.email, "lead@example.com");
    assert.equal(forwardedPayload?.company, "");
    assert.equal(forwardedPayload?.["Score"], "40 / 40");
  } finally {
    if (originalAccessKey === undefined) {
      delete process.env.WEB3FORMS_ACCESS_KEY;
    } else {
      process.env.WEB3FORMS_ACCESS_KEY = originalAccessKey;
    }
    globalThis.fetch = originalFetch;
  }
});

test("lead route blocks report without required lead details", async () => {
  const originalAccessKey = process.env.WEB3FORMS_ACCESS_KEY;
  process.env.WEB3FORMS_ACCESS_KEY = "server-test-key";

  try {
    const response = await POST(
      new Request("https://example.com/api/lead", {
        body: JSON.stringify({
          answers: {},
          assessmentId: assessments[0].id,
          lead: { email: "" },
        }),
        method: "POST",
      }),
    );
    const payload = (await response.json()) as {
      message?: string;
      success?: boolean;
    };

    assert.equal(response.status, 400);
    assert.equal(payload.success, false);
  } finally {
    if (originalAccessKey === undefined) {
      delete process.env.WEB3FORMS_ACCESS_KEY;
    } else {
      process.env.WEB3FORMS_ACCESS_KEY = originalAccessKey;
    }
  }
});
