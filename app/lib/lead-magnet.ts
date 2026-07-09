import {
  type AnswerMap,
  type Assessment,
  assessments,
  getMaturityLevel,
  scoreAssessment,
} from "./diagnostic";

const bookingLink = "https://calendly.com/jtneumann23/jon-neumann-1x1";
const sourceName = "JT23 AI Adoption Diagnostic";

type LeadPayload = {
  answers?: unknown;
  assessmentId?: unknown;
  email?: unknown;
  name?: unknown;
};

export type LeadReport = {
  answers: AnswerMap;
  assessment: Assessment;
  email: string;
  maturity: ReturnType<typeof getMaturityLevel>;
  name: string;
  score: number;
};

export type LeadValidationResult =
  | { ok: true; lead: LeadReport }
  | { ok: false; message: string; status: number };

export type BrevoConfig = {
  apiKey: string;
  fetcher?: typeof fetch;
  fromEmail: string;
  fromName: string;
  listId: number;
  replyToEmail: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const scoreValues = new Set([1, 2, 3, 4, 5]);

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeAnswers(value: unknown): AnswerMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const answers: AnswerMap = {};
  for (const [questionId, answer] of Object.entries(value)) {
    if (!scoreValues.has(answer as number)) return null;
    answers[questionId] = answer as AnswerMap[string];
  }

  return answers;
}

export function validateLeadPayload(payload: LeadPayload): LeadValidationResult {
  const name = cleanText(payload.name);
  const email = cleanText(payload.email).toLowerCase();
  const assessmentId = cleanText(payload.assessmentId);
  const assessment = assessments.find((item) => item.id === assessmentId);
  const answers = normalizeAnswers(payload.answers);

  if (name.length < 2) {
    return { ok: false, message: "Enter your name.", status: 400 };
  }

  if (!emailPattern.test(email)) {
    return { ok: false, message: "Enter a valid email address.", status: 400 };
  }

  if (!assessment) {
    return { ok: false, message: "Choose a valid diagnostic.", status: 400 };
  }

  if (!answers || Object.keys(answers).length !== assessment.questions.length) {
    return {
      ok: false,
      message: "Complete the diagnostic before requesting your report.",
      status: 400,
    };
  }

  const score = scoreAssessment(answers);

  return {
    lead: {
      answers,
      assessment,
      email,
      maturity: getMaturityLevel(score),
      name,
      score,
    },
    ok: true,
  };
}

export function buildReportEmail(lead: LeadReport) {
  const firstName = lead.name.split(/\s+/)[0] || lead.name;
  const nextSteps = lead.assessment.nextSteps
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join("");
  const plainSteps = lead.assessment.nextSteps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  const html = `
    <div style="margin:0;background:#050705;color:#f7fff7;font-family:Arial,Helvetica,sans-serif;padding:28px;">
      <div style="max-width:680px;margin:0 auto;border:1px solid #18d23f;background:#0d120f;padding:28px;">
        <p style="margin:0 0 12px;color:#18d23f;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">JT23 AI Readiness Report</p>
        <h1 style="margin:0 0 16px;font-size:30px;line-height:1.1;">${escapeHtml(firstName)}, here is your AI readiness snapshot.</h1>
        <p style="margin:0 0 22px;color:#b9c5bb;line-height:1.65;">This is a quick pressure test, not a grade. Use it to spot where AI habits, policy, or risk controls need attention next.</p>
        <div style="border:1px solid #233226;background:#050705;padding:20px;margin:0 0 20px;">
          <p style="margin:0 0 8px;color:#b9c5bb;">Prepared for ${escapeHtml(lead.name)}</p>
          <p style="margin:0 0 8px;color:#b9c5bb;">${escapeHtml(lead.assessment.title)}</p>
          <p style="margin:0;color:#18d23f;font-size:48px;font-weight:900;line-height:1;">${lead.score} / 40</p>
          <h2 style="margin:12px 0 8px;font-size:24px;">${escapeHtml(lead.maturity.name)}</h2>
          <p style="margin:0;color:#b9c5bb;line-height:1.6;">${escapeHtml(lead.maturity.explanation)}</p>
        </div>
        <h3 style="margin:22px 0 12px;font-size:20px;">Top 3 moves to reduce risk</h3>
        <ol style="margin:0 0 24px;padding-left:22px;color:#f7fff7;line-height:1.65;">${nextSteps}</ol>
        <a href="${bookingLink}" style="display:inline-block;background:#18d23f;color:#050705;font-weight:800;text-decoration:none;padding:14px 18px;">Book a Readiness Call</a>
        <p style="margin:24px 0 0;color:#b9c5bb;font-size:13px;line-height:1.5;">You received this because you requested your report from the JT23 AI Adoption Diagnostic.</p>
      </div>
    </div>
  `;

  const text = `Your JT23 AI Readiness Report

Hi ${firstName},

${lead.assessment.title}
Score: ${lead.score} / 40
Level: ${lead.maturity.name}

${lead.maturity.explanation}

Top 3 moves to reduce risk:
${plainSteps}

Book a Readiness Call: ${bookingLink}
`;

  return {
    html,
    subject: "Your JT23 AI Readiness Report",
    text,
  };
}

async function postBrevo(
  path: string,
  body: unknown,
  config: BrevoConfig,
): Promise<void> {
  const fetcher = config.fetcher ?? fetch;
  const response = await fetcher(`https://api.brevo.com/v3/${path}`, {
    body: JSON.stringify(body),
    headers: {
      "accept": "application/json",
      "api-key": config.apiKey,
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Brevo request failed: ${response.status}`);
  }
}

export async function createBrevoLead(
  lead: LeadReport,
  config: BrevoConfig,
): Promise<void> {
  await postBrevo(
    "contacts",
    {
      attributes: {
        ASSESSMENT: lead.assessment.title,
        MATURITY: lead.maturity.name,
        SCORE: lead.score,
        SOURCE: sourceName,
      },
      email: lead.email,
      listIds: [config.listId],
      updateEnabled: true,
    },
    config,
  );

  const reportEmail = buildReportEmail(lead);

  await postBrevo(
    "smtp/email",
    {
      htmlContent: reportEmail.html,
      replyTo: {
        email: config.replyToEmail,
        name: config.fromName,
      },
      sender: {
        email: config.fromEmail,
        name: config.fromName,
      },
      subject: reportEmail.subject,
      textContent: reportEmail.text,
      to: [
        {
          email: lead.email,
          name: lead.name,
        },
      ],
    },
    config,
  );
}
