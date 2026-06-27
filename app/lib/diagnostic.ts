export type ScoreValue = 1 | 2 | 3 | 4 | 5;

export type AnswerMap = Record<string, ScoreValue>;

export type Question = {
  id: string;
  prompt: string;
  options: Array<{
    value: ScoreValue;
    label: string;
  }>;
};

export type Assessment = {
  id: string;
  title: string;
  description: string;
  audience: string;
  questions: Question[];
  nextSteps: string[];
};

export type MaturityLevel = {
  name: "AI Unclear" | "AI Curious" | "AI Capable" | "AI Multiplier";
  range: string;
  explanation: string;
};

const scaleOptions: Question["options"] = [
  { value: 1, label: "Not ready" },
  { value: 2, label: "Patchy" },
  { value: 3, label: "Some traction" },
  { value: 4, label: "Working" },
  { value: 5, label: "Clear habit" },
];

const makeQuestions = (prefix: string, prompts: string[]): Question[] =>
  prompts.map((prompt, index) => ({
    id: `${prefix}-${index + 1}`,
    prompt,
    options: scaleOptions,
  }));

export const assessments: Assessment[] = [
  {
    id: "literacy",
    title: "AI Literacy Check",
    description:
      "Find out whether your team can use AI with judgment, or whether people are guessing their way through it.",
    audience:
      "For owners, managers, and teams who need shared language before AI habits spread unevenly.",
    questions: makeQuestions("literacy", [
      "Our team understands where AI is useful, risky, and simply wrong.",
      "We can spot repeated work where AI could save time without raising risk.",
      "People can write clear prompts instead of hoping the tool figures it out.",
      "AI-assisted work gets checked before it reaches clients, leaders, or the public.",
      "People know what private, sensitive, or client information must stay out of AI tools.",
      "Our team can try AI in low-risk work without creating confusion or rework.",
      "We already use at least one AI tool in a practical, repeatable way.",
      "Leaders make time for careful AI learning instead of leaving people to experiment alone.",
    ]),
    nextSteps: [
      "Run a 60-minute AI literacy session using real tasks, weak outputs, and privacy examples from the team.",
      "Pick three low-risk workflows where AI can help without touching sensitive data.",
      "Create a review habit so AI-assisted work is checked before it leaves the team.",
    ],
  },
  {
    id: "training",
    title: "AI Training Needs Check",
    description:
      "See where training gaps are causing hesitation, inconsistent quality, or wasted time.",
    audience:
      "For HR, operations, department leads, nonprofits, municipalities, and teams where AI use is uneven.",
    questions: makeQuestions("training", [
      "People feel confident using AI for simple work tasks without overtrusting the output.",
      "Training needs are mapped by role instead of handled as one generic demo.",
      "We know which workflow pain points are costly enough to improve first.",
      "Document, reporting, or policy writing tasks have clear training examples.",
      "Communication tasks like emails, updates, and summaries have safe-use examples.",
      "Meeting tasks like agendas, notes, and follow-ups have a practical training path.",
      "Leaders agree on what AI adoption should improve first, not just what tools look interesting.",
      "We understand the barriers that could slow adoption: confidence, policy, privacy, time, or trust.",
    ]),
    nextSteps: [
      "Map the top five repeated tasks where staff lose time or quality slips.",
      "Group training by role so examples feel practical on day one.",
      "Start with one hands-on workshop and a follow-up practice session tied to real work.",
    ],
  },
  {
    id: "policy",
    title: "AI Policy Gap Check",
    description:
      "Check whether AI use is governed, or whether policy is trailing behind what staff already do.",
    audience:
      "For leaders, HR, operations, IT, boards, and any team handling client, resident, member, or public information.",
    questions: makeQuestions("policy", [
      "We have a clear list of approved AI tools.",
      "People know what data must never be entered into AI tools.",
      "We have rules for client, customer, resident, member, or staff data.",
      "Important AI-assisted work requires human review before use.",
      "People know when AI use should be disclosed to clients, funders, partners, or the public.",
      "We have rules for AI use in hiring, performance, or HR decisions.",
      "Cybersecurity risks are considered before new AI tools are used.",
      "One person or team clearly owns AI policy, questions, approvals, and updates.",
    ]),
    nextSteps: [
      "Write a one-page safe-use policy covering tools, data, human review, disclosure, and prohibited uses.",
      "Name a policy owner who can answer questions before staff make risky judgment calls alone.",
      "Create a short approval path before teams adopt new AI tools or paste sensitive data into them.",
    ],
  },
];

export const maturityLevels: MaturityLevel[] = [
  {
    name: "AI Unclear",
    range: "0 to 12",
    explanation:
      "AI is likely happening without enough shared language, training, or guardrails. Start with basic literacy, safe-use rules, and one low-risk workflow before the messy habits harden.",
  },
  {
    name: "AI Curious",
    range: "13 to 24",
    explanation:
      "Your team sees the upside, but the habits are uneven. This is where privacy mistakes, weak outputs, and inconsistent staff confidence can quietly become leadership problems.",
  },
  {
    name: "AI Capable",
    range: "25 to 32",
    explanation:
      "Your team has useful pieces in place. The next move is consistency: role-based practice, review habits, approved tools, and rules that people can actually follow.",
  },
  {
    name: "AI Multiplier",
    range: "33 to 40",
    explanation:
      "Your team is ready to turn AI from scattered help into repeatable workflows. Keep the advantage by tightening oversight, measuring time saved, and keeping policy current.",
  },
];

// Keep scoring tiny and auditable: every selected answer is worth 1 to 5 points.
export function scoreAssessment(answers: AnswerMap): number {
  return Object.values(answers).reduce((total, value) => total + value, 0);
}

export function getMaturityLevel(score: number): MaturityLevel {
  if (score <= 12) return maturityLevels[0];
  if (score <= 24) return maturityLevels[1];
  if (score <= 32) return maturityLevels[2];
  return maturityLevels[3];
}
