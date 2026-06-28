import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReportEmail,
  createBrevoLead,
  validateLeadPayload,
} from "../app/lib/lead-magnet.ts";

test("validateLeadPayload accepts a complete lead request", () => {
  const result = validateLeadPayload({
    answers: {
      "literacy-1": 3,
      "literacy-2": 3,
      "literacy-3": 3,
      "literacy-4": 3,
      "literacy-5": 3,
      "literacy-6": 3,
      "literacy-7": 3,
      "literacy-8": 3,
    },
    assessmentId: "literacy",
    email: "owner@example.com",
    name: "Jordan Owner",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.lead.email, "owner@example.com");
    assert.equal(result.lead.name, "Jordan Owner");
    assert.equal(result.lead.score, 24);
    assert.equal(result.lead.maturity.name, "AI Curious");
  }
});

test("validateLeadPayload rejects an invalid email", () => {
  const result = validateLeadPayload({
    answers: {},
    assessmentId: "literacy",
    email: "not-an-email",
    name: "Jordan Owner",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 400);
    assert.equal(result.message, "Enter a valid email address.");
  }
});

test("buildReportEmail creates a PDF-style readiness report", () => {
  const result = validateLeadPayload({
    answers: {
      "policy-1": 4,
      "policy-2": 4,
      "policy-3": 4,
      "policy-4": 4,
      "policy-5": 4,
      "policy-6": 4,
      "policy-7": 4,
      "policy-8": 4,
    },
    assessmentId: "policy",
    email: "director@example.com",
    name: "Director Lee",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  const email = buildReportEmail(result.lead);

  assert.equal(email.subject, "Your JT23 AI Readiness Report");
  assert.ok(email.html.includes("Director Lee"));
  assert.ok(email.html.includes("AI Policy Check"));
  assert.ok(email.html.includes("32 / 40"));
  assert.ok(email.html.includes("AI Capable"));
  assert.ok(email.html.includes("Book a Readiness Call"));
  assert.ok(email.text.includes("Your JT23 AI Readiness Report"));
  assert.ok(email.text.includes("32 / 40"));
});

test("createBrevoLead adds a contact and sends the report email", async () => {
  const calls: Array<{ body: unknown; url: string }> = [];
  const leadResult = validateLeadPayload({
    answers: {
      "risk-1": 5,
      "risk-2": 5,
      "risk-3": 5,
      "risk-4": 5,
      "risk-5": 5,
      "risk-6": 5,
      "risk-7": 5,
      "risk-8": 5,
    },
    assessmentId: "risk",
    email: "leader@example.com",
    name: "Leader Morgan",
  });

  assert.equal(leadResult.ok, true);
  if (!leadResult.ok) return;

  await createBrevoLead(leadResult.lead, {
    apiKey: "test-key",
    fetcher: async (url, init) => {
      calls.push({
        body: JSON.parse(String(init?.body)),
        url: String(url),
      });

      return new Response("{}", { status: 201 });
    },
    fromEmail: "jon@jt23impactlabs.com",
    fromName: "Jon at JT23 Impact Labs",
    listId: 42,
    replyToEmail: "jon@jt23impactlabs.com",
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://api.brevo.com/v3/contacts");
  assert.deepEqual(calls[0].body, {
    attributes: {
      ASSESSMENT: "AI Risk Check",
      MATURITY: "AI Multiplier",
      SCORE: 40,
      SOURCE: "JT23 AI Adoption Diagnostic",
    },
    email: "leader@example.com",
    listIds: [42],
    updateEnabled: true,
  });
  assert.equal(calls[1].url, "https://api.brevo.com/v3/smtp/email");
});
