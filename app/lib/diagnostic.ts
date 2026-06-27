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
  { value: 1, label: "Not on our radar" },
  { value: 2, label: "Little progress" },
  { value: 3, label: "Gaining traction" },
  { value: 4, label: "Working toward goals" },
  { value: 5, label: "Goals achieved" },
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
      "See whether your team knows when to use AI, when not to use it, and what still needs human judgment.",
    audience:
      "For owners, managers, nonprofit leaders, public-sector teams, and staff who need shared AI habits before tool use spreads unevenly.",
    questions: makeQuestions("literacy", [
      "People understand when AI is useful, when it is risky, and when the work should stay human.",
      "Staff can choose the right tool or agent for the task instead of using one chatbot for everything.",
      "People can write clear prompts, add context, and ask for better outputs without overtrusting the answer.",
      "AI-assisted work is checked by a person before it reaches clients, funders, leaders, residents, or the public.",
      "People know what private, confidential, client, staff, or community data must stay out of AI tools.",
      "The team knows the difference between beginner, intermediate, and advanced AI use in daily work.",
      "Leaders make time for hands-on practice instead of leaving staff to experiment alone.",
      "AI use is tied to real workflow problems, not just curiosity about new tools.",
    ]),
    nextSteps: [
      "Run a practical AI literacy session using real tasks, weak outputs, privacy examples, and human-review decisions.",
      "Create a simple guide for when to use AI, when not to use AI, and what work must stay human.",
      "Pick two low-risk workflows where staff can practice safely before moving into more sensitive work.",
    ],
  },
  {
    id: "policy",
    title: "AI Policy Check",
    description:
      "Check whether your AI rules match what people are already doing with tools, data, and client-facing work.",
    audience:
      "For business owners, nonprofit executives, municipal leaders, operations teams, boards, HR, and IT leads who need clear rules people can follow.",
    questions: makeQuestions("policy", [
      "We have a clear list of approved AI tools and what each one is allowed to be used for.",
      "People know what information is public, internal, confidential, or prohibited before they use AI.",
      "Our policy explains how to handle client, customer, resident, member, staff, or community information.",
      "AI rules reflect regulatory and public-sector requirements that apply to our organization.",
      "There is a clear approval path before teams adopt a new AI tool or connect AI to internal systems.",
      "People know when AI use should be disclosed to clients, funders, partners, boards, or the public.",
      "One person or team owns AI policy questions, updates, exceptions, and training reminders.",
      "Our policy covers cost discipline, tool sprawl, and the risk of paying for tools that do not improve work.",
    ]),
    nextSteps: [
      "Write a one-page safe-use policy covering approved tools, data rules, human review, disclosure, and prohibited uses.",
      "Create a simple approval path for new AI tools so shadow AI does not become the default policy.",
      "Assign a policy owner who can answer questions and keep rules current as tools and requirements change.",
    ],
  },
  {
    id: "risk",
    title: "AI Risk Check",
    description:
      "Find where uncontrolled AI use could expose data, weaken decisions, create compliance issues, or damage trust.",
    audience:
      "For any team handling client, customer, resident, member, staff, financial, operational, or public information.",
    questions: makeQuestions("risk", [
      "We know where staff are already using AI, including unofficial tools, browser extensions, and personal accounts.",
      "Data security and privacy risks are reviewed before AI is used with documents, records, emails, or internal files.",
      "People know which decisions should not be delegated to AI, especially hiring, performance, legal, financial, or client-impacting decisions.",
      "Important outputs are checked for accuracy, bias, missing context, and tone before they are used.",
      "We have boundaries for AI-generated content that could reach clients, residents, funders, boards, or the public.",
      "Tool access is managed so staff are not pasting sensitive information into whatever app is easiest.",
      "Leaders understand the risks of shadow AI, ignored policy, inconsistent tools, and unclear accountability.",
      "AI use is reviewed against business value, staff time, quality, safety, and maintainable process change.",
    ]),
    nextSteps: [
      "Run a quick AI risk inventory: tools in use, data touched, work affected, owners, and review habits.",
      "Set immediate red lines for confidential data, client/community impact, HR decisions, and public-facing outputs.",
      "Build a review rhythm so leaders can see whether AI is reducing risk and improving work instead of creating hidden exposure.",
    ],
  },
];

export const maturityLevels: MaturityLevel[] = [
  {
    name: "AI Unclear",
    range: "0 to 12",
    explanation:
      "AI is likely happening without enough shared language, safe-use rules, or leadership visibility. Start with basic literacy, clear boundaries, and one low-risk workflow before messy habits harden.",
  },
  {
    name: "AI Curious",
    range: "13 to 24",
    explanation:
      "Your team sees the upside, but habits are uneven. This is where privacy mistakes, weak outputs, shadow tools, and inconsistent confidence can quietly become leadership problems.",
  },
  {
    name: "AI Capable",
    range: "25 to 32",
    explanation:
      "Your team has useful pieces in place. The next move is consistency: practical training, approved tools, review habits, and rules people can actually follow.",
  },
  {
    name: "AI Multiplier",
    range: "33 to 40",
    explanation:
      "Your team is ready to turn AI from scattered help into safer, repeatable workflows. Keep the advantage by tightening oversight, measuring value, and keeping policy current.",
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
