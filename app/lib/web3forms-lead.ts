import type {
  AnswerMap,
  Assessment,
  MaturityLevel,
} from "./diagnostic";

export const web3FormsEndpoint = "https://api.web3forms.com/submit";

export const aiChallengeOptions = [
  "Getting staff to use AI safely",
  "Choosing the right AI tools",
  "Creating policy and guardrails",
  "Protecting client or company data",
  "Turning AI experiments into workflows",
];

export type Web3FormsLeadDetails = {
  challenge: string;
  company: string;
  email: string;
  name: string;
};

type Web3FormsDiagnosticResult = {
  answers: AnswerMap;
  assessment: Assessment;
  maturity: MaturityLevel;
  score: number;
};

function buildAnswerSummary(result: Web3FormsDiagnosticResult) {
  return result.assessment.questions
    .map((question, index) => {
      const answer = result.answers[question.id];
      return `${index + 1}. ${question.prompt} - ${answer}/5`;
    })
    .join("\n");
}

export function buildWeb3FormsLeadPayload(
  accessKey: string,
  lead: Web3FormsLeadDetails,
  result: Web3FormsDiagnosticResult,
) {
  return {
    access_key: accessKey,
    botcheck: false,
    subject: `New AI Diagnostic Lead - ${result.assessment.title}`,
    from_name: "JT23 AI Adoption Diagnostic",
    name: lead.name.trim(),
    email: lead.email.trim().toLowerCase(),
    company: lead.company.trim(),
    "Biggest AI challenge": lead.challenge,
    "Diagnostic completed": result.assessment.title,
    "Score": `${result.score} / 40`,
    "Maturity level": result.maturity.name,
    "Maturity range": result.maturity.range,
    "Result summary": result.maturity.explanation,
    "Recommended next steps": result.assessment.nextSteps.join("\n"),
    "Answer details": buildAnswerSummary(result),
  };
}
