import assert from "node:assert/strict";
import test from "node:test";
import {
  assessments,
  getMaturityLevel,
  scoreAssessment,
} from "../app/lib/diagnostic.ts";

test("each assessment has eight five-point questions", () => {
  assert.equal(assessments.length, 3);
  assert.deepEqual(
    assessments.map((assessment) => assessment.id),
    ["literacy", "policy", "risk"],
  );

  for (const assessment of assessments) {
    assert.equal(assessment.questions.length, 8, assessment.title);

    for (const question of assessment.questions) {
      assert.equal(question.options.length, 5, question.prompt);
      assert.deepEqual(
        question.options.map((option) => option.value),
        [1, 2, 3, 4, 5],
        question.prompt,
      );
    }
  }
});

test("scoreAssessment totals the selected answer values", () => {
  const answers = {
    "q-1": 1,
    "q-2": 2,
    "q-3": 3,
    "q-4": 4,
    "q-5": 5,
    "q-6": 1,
    "q-7": 2,
    "q-8": 3,
  };

  assert.equal(scoreAssessment(answers), 21);
});

test("maturity levels match the requested score ranges", () => {
  assert.equal(getMaturityLevel(0).name, "AI Unclear");
  assert.equal(getMaturityLevel(12).name, "AI Unclear");
  assert.equal(getMaturityLevel(13).name, "AI Curious");
  assert.equal(getMaturityLevel(24).name, "AI Curious");
  assert.equal(getMaturityLevel(25).name, "AI Capable");
  assert.equal(getMaturityLevel(32).name, "AI Capable");
  assert.equal(getMaturityLevel(33).name, "AI Multiplier");
  assert.equal(getMaturityLevel(40).name, "AI Multiplier");
});
