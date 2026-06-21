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
  { value: 1, label: "Not in place" },
  { value: 2, label: "Early thinking" },
  { value: 3, label: "Some progress" },
  { value: 4, label: "Working well" },
  { value: 5, label: "Clear and consistent" },
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
      "See how well your team understands AI basics, useful tasks, prompting, privacy, and judgment.",
    audience:
      "For owners, managers, and teams who want a plain starting point before choosing tools.",
    questions: makeQuestions("literacy", [
      "Our team understands what AI tools can and cannot do.",
      "We can spot everyday tasks where AI could save time.",
      "People feel confident writing clear prompts and improving the output.",
      "We know how to fact-check AI output before using it.",
      "People understand what private or sensitive information should not be entered into AI tools.",
      "Our team feels comfortable trying AI in low-risk work.",
      "We already use at least one AI tool in a practical way.",
      "Leaders support careful AI use and make time for learning.",
    ]),
    nextSteps: [
      "Run a 60-minute AI basics session using real tasks from the team.",
      "Pick three low-risk workflows where AI could help with drafting, sorting, or summarizing.",
      "Create a simple fact-checking habit before AI-assisted work is shared.",
    ],
  },
  {
    id: "training",
    title: "AI Training Needs Check",
    description:
      "Find where your team needs practical training by role, workflow, and confidence level.",
    audience:
      "For HR, operations, department leads, nonprofits, municipalities, and growing teams.",
    questions: makeQuestions("training", [
      "People on the team feel confident using AI for simple work tasks.",
      "Training needs are understood by role, not treated as one-size-fits-all.",
      "We know which workflow pain points are worth improving first.",
      "Document, reporting, or policy writing tasks are clear training candidates.",
      "Communication tasks like emails, updates, and summaries are clear training candidates.",
      "Meeting tasks like agendas, notes, and follow-ups are clear training candidates.",
      "Leaders agree on what practical AI adoption should improve first.",
      "We understand the main barriers that could slow adoption.",
    ]),
    nextSteps: [
      "Map the top five repeated tasks that drain time across roles.",
      "Group training by job function so examples feel useful right away.",
      "Start with one team workshop and one follow-up practice session.",
    ],
  },
  {
    id: "policy",
    title: "AI Policy Gap Check",
    description:
      "Check whether your team has clear safe-use rules before AI use spreads informally.",
    audience:
      "For leaders, HR, operations, IT, boards, and teams handling client or public information.",
    questions: makeQuestions("policy", [
      "We have a clear list of approved AI tools.",
      "People know the privacy rules for entering data into AI tools.",
      "We have rules for client, customer, resident, or member data.",
      "Important AI-assisted work requires human review before use.",
      "People know when AI use should be disclosed.",
      "We have rules for AI use in hiring, performance, or HR decisions.",
      "Cybersecurity risks are considered before new AI tools are used.",
      "One person or team clearly owns the AI policy and keeps it current.",
    ]),
    nextSteps: [
      "Write a one-page safe-use policy covering tools, data, review, and disclosure.",
      "Name a policy owner who can answer questions and update rules.",
      "Create a short approval path before teams adopt new AI tools.",
    ],
  },
];

export const maturityLevels: MaturityLevel[] = [
  {
    name: "AI Unclear",
    range: "0 to 12",
    explanation:
      "AI is still mostly undefined for your team. Start with basics, safety, and one useful workflow.",
  },
  {
    name: "AI Curious",
    range: "13 to 24",
    explanation:
      "Your team sees promise, but needs clearer habits, shared language, and practical training.",
  },
  {
    name: "AI Capable",
    range: "25 to 32",
    explanation:
      "Your team has useful pieces in place. The next move is consistency, role-based practice, and safer rules.",
  },
  {
    name: "AI Multiplier",
    range: "33 to 40",
    explanation:
      "Your team is ready to turn AI from scattered use into repeatable workflows with clear oversight.",
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
