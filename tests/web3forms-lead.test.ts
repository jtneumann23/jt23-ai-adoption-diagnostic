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
