import { env } from "cloudflare:workers";
import { createBrevoLead, validateLeadPayload } from "../../lib/lead-magnet";

function getBrevoConfig() {
  const runtimeEnv = env as Record<string, string | undefined>;
  const listId = Number(runtimeEnv.BREVO_LIST_ID);

  if (
    !runtimeEnv.BREVO_API_KEY ||
    !Number.isInteger(listId) ||
    listId <= 0 ||
    !runtimeEnv.LEAD_REPORT_FROM_EMAIL
  ) {
    return null;
  }

  return {
    apiKey: runtimeEnv.BREVO_API_KEY,
    fromEmail: runtimeEnv.LEAD_REPORT_FROM_EMAIL,
    fromName: runtimeEnv.LEAD_REPORT_FROM_NAME ?? "JT23 Impact Labs",
    listId,
    replyToEmail:
      runtimeEnv.LEAD_REPORT_REPLY_TO_EMAIL ??
      runtimeEnv.LEAD_REPORT_FROM_EMAIL,
  };
}

export async function POST(request: Request) {
  try {
    const validation = validateLeadPayload(await request.json());

    if (!validation.ok) {
      return Response.json(
        { error: validation.message },
        { status: validation.status },
      );
    }

    const config = getBrevoConfig();
    if (!config) {
      return Response.json(
        {
          error:
            "Report delivery is not configured yet. Add the Brevo API key, list ID, and sender email.",
        },
        { status: 503 },
      );
    }

    await createBrevoLead(validation.lead, config);

    return Response.json({
      message: "Your report is on its way.",
      result: {
        assessmentTitle: validation.lead.assessment.title,
        maturityName: validation.lead.maturity.name,
        score: validation.lead.score,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send the report.";

    return Response.json({ error: message }, { status: 500 });
  }
}
