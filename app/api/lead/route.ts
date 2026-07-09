import {
  type AnswerMap,
  type ScoreValue,
  assessments,
  getMaturityLevel,
  scoreAssessment,
} from "../../lib/diagnostic";
import {
  aiChallengeOptions,
  buildWeb3FormsLeadPayload,
  type Web3FormsLeadDetails,
  web3FormsEndpoint,
} from "../../lib/web3forms-lead";

type LeadRequestBody = {
  answers?: Record<string, unknown>;
  assessmentId?: unknown;
  lead?: Partial<Web3FormsLeadDetails>;
};

function jsonResponse(body: { message: string; success: boolean }, status = 200) {
  return Response.json(body, { status });
}

function isScoreValue(value: unknown): value is ScoreValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function getValidatedAnswers(
  rawAnswers: LeadRequestBody["answers"],
  questionIds: string[],
): AnswerMap | null {
  if (!rawAnswers) return null;

  const answers: AnswerMap = {};
  for (const questionId of questionIds) {
    const value = rawAnswers[questionId];
    if (!isScoreValue(value)) return null;
    answers[questionId] = value;
  }

  return answers;
}

function getValidatedLead(lead: LeadRequestBody["lead"]): Web3FormsLeadDetails | null {
  const name = lead?.name?.trim() ?? "";
  const email = lead?.email?.trim().toLowerCase() ?? "";
  const company = lead?.company?.trim() ?? "";
  const challenge = lead?.challenge?.trim() ?? "";

  if (!name || !email || !email.includes("@")) return null;

  return {
    challenge: aiChallengeOptions.includes(challenge)
      ? challenge
      : "Not provided",
    company,
    email,
    name,
  };
}

export async function POST(request: Request) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return jsonResponse(
      { message: "The report form is not connected yet.", success: false },
      500,
    );
  }

  let body: LeadRequestBody;
  try {
    body = (await request.json()) as LeadRequestBody;
  } catch {
    return jsonResponse(
      { message: "The report request was not readable.", success: false },
      400,
    );
  }

  const assessment = assessments.find(
    (item) => item.id === body.assessmentId,
  );
  if (!assessment) {
    return jsonResponse(
      { message: "Choose a valid diagnostic before requesting a report.", success: false },
      400,
    );
  }

  const answers = getValidatedAnswers(
    body.answers,
    assessment.questions.map((question) => question.id),
  );
  if (!answers) {
    return jsonResponse(
      { message: "Complete every question before requesting a report.", success: false },
      400,
    );
  }

  const lead = getValidatedLead(body.lead);
  if (!lead) {
    return jsonResponse(
      { message: "Enter your name and a valid email to unlock the report.", success: false },
      400,
    );
  }

  const score = scoreAssessment(answers);
  const maturity = getMaturityLevel(score);

  try {
    const response = await fetch(web3FormsEndpoint, {
      body: JSON.stringify(
        buildWeb3FormsLeadPayload(accessKey, lead, {
          answers,
          assessment,
          maturity,
          score,
        }),
      ),
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response.json()) as {
      message?: string;
      success?: boolean;
    };

    if (!response.ok || payload.success === false) {
      return jsonResponse(
        { message: payload.message ?? "Unable to unlock your report.", success: false },
        response.ok ? 502 : response.status,
      );
    }

    return jsonResponse({ message: "Report unlocked.", success: true });
  } catch {
    return jsonResponse(
      { message: "Unable to reach the report form. Try again in a minute.", success: false },
      502,
    );
  }
}
