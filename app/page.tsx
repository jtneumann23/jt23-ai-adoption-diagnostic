"use client";

/* eslint-disable @next/next/no-img-element */
import { type FormEvent, useMemo, useState } from "react";
import {
  type AnswerMap,
  type Assessment,
  type ScoreValue,
  assessments,
  getMaturityLevel,
  scoreAssessment,
} from "./lib/diagnostic";

const bookingLink = "https://calendly.com/jtneumann23/jon-neumann-1x1";

export default function Home() {
  const [activeAssessmentId, setActiveAssessmentId] = useState(
    assessments[0].id,
  );
  const [answersByAssessment, setAnswersByAssessment] = useState<
    Record<string, AnswerMap>
  >({});
  const [resultAssessmentId, setResultAssessmentId] = useState<string | null>(
    null,
  );
  const [leadAssessmentId, setLeadAssessmentId] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({ email: "", name: "" });
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [leadError, setLeadError] = useState("");

  const activeAssessment =
    assessments.find((assessment) => assessment.id === activeAssessmentId) ??
    assessments[0];
  const activeAnswers = answersByAssessment[activeAssessment.id] ?? {};
  const answeredCount = Object.keys(activeAnswers).length;
  const isComplete = answeredCount === activeAssessment.questions.length;
  const leadAssessment = leadAssessmentId
    ? assessments.find((assessment) => assessment.id === leadAssessmentId)
    : null;

  const result = useMemo(() => {
    if (!resultAssessmentId) return null;

    const assessment = assessments.find(
      (item) => item.id === resultAssessmentId,
    );
    if (!assessment) return null;

    const score = scoreAssessment(answersByAssessment[assessment.id] ?? {});
    const maturity = getMaturityLevel(score);

    return { assessment, score, maturity };
  }, [answersByAssessment, resultAssessmentId]);

  function chooseAssessment(assessment: Assessment) {
    setActiveAssessmentId(assessment.id);
    setLeadAssessmentId(null);
    setResultAssessmentId(null);
    setLeadStatus("idle");
    setLeadError("");
    document.getElementById("assessment")?.scrollIntoView({ block: "start" });
  }

  function answerQuestion(questionId: string, value: ScoreValue) {
    setLeadAssessmentId(null);
    setResultAssessmentId(null);
    setLeadStatus("idle");
    setLeadError("");
    setAnswersByAssessment((current) => ({
      ...current,
      [activeAssessment.id]: {
        ...(current[activeAssessment.id] ?? {}),
        [questionId]: value,
      },
    }));
  }

  function requestReport() {
    if (!isComplete) return;

    setLeadAssessmentId(activeAssessment.id);
    setResultAssessmentId(null);
    setLeadStatus("idle");
    setLeadError("");
    document.getElementById("results")?.scrollIntoView({ block: "start" });
  }

  async function submitLeadForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!leadAssessment) return;

    setLeadStatus("sending");
    setLeadError("");

    const response = await fetch("/api/leads", {
      body: JSON.stringify({
        answers: answersByAssessment[leadAssessment.id] ?? {},
        assessmentId: leadAssessment.id,
        email: leadForm.email,
        name: leadForm.name,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setLeadStatus("error");
      setLeadError(payload.error ?? "Unable to send your report.");
      return;
    }

    setLeadStatus("sent");
    setResultAssessmentId(leadAssessment.id);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Hero />

      <section
        id="diagnostics"
        className="border-y border-[var(--line)] bg-[var(--panel)] px-5 py-16 sm:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
              Find the weak spot first
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three checks for the places AI risk usually hides.
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Use these checks to see whether your team needs stronger AI
              habits, clearer policy, better risk controls, or all three. No
              private data needed.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <article
                className="flex min-h-[300px] flex-col justify-between border border-[var(--line)] bg-[var(--background)] p-6 shadow-[0_0_0_1px_rgba(24,210,63,0.06)]"
                key={assessment.id}
              >
                <div>
                  <h3 className="text-xl font-bold">{assessment.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                    {assessment.description}
                  </p>
                  <div className="mt-5 border-l-2 border-[var(--jt23-green)] pl-4 text-sm leading-6 text-white">
                    <span className="font-bold">Who it is for: </span>
                    {assessment.audience}
                  </div>
                </div>
                <button
                  className="mt-7 w-full border border-[var(--jt23-green)] bg-[var(--jt23-green)] px-4 py-3 text-sm font-bold text-black transition hover:bg-white"
                  onClick={() => chooseAssessment(assessment)}
                  type="button"
                >
                  Start {assessment.title}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="assessment" className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
              Active check
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {activeAssessment.title}
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Answer eight questions honestly. Choose the option that describes
              the team today, especially where the current habit would be hard
              to defend in front of a client, board, or funder.
            </p>
            <div className="mt-6 border border-[var(--line)] bg-[var(--panel-soft)] p-5">
              <p className="text-sm font-bold text-white">
                Progress: {answeredCount} of{" "}
                {activeAssessment.questions.length}
              </p>
              <div className="mt-3 h-2 bg-black">
                <div
                  className="h-2 bg-[var(--jt23-green)] transition-all"
                  style={{
                    width: `${(answeredCount / activeAssessment.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            {activeAssessment.questions.map((question, questionIndex) => (
              <div
                aria-labelledby={`${question.id}-prompt`}
                className="border-2 border-[var(--line)] bg-[var(--panel)] p-5"
                key={question.id}
                role="group"
              >
                <h3
                  className="mb-4 flex gap-3 text-base font-bold leading-7 text-white"
                  id={`${question.id}-prompt`}
                >
                  <span className="mr-3 font-mono text-sm text-[var(--jt23-green)]">
                    {String(questionIndex + 1).padStart(2, "0")}
                  </span>
                  <span>{question.prompt}</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-5">
                  {question.options.map((option) => {
                    const selected = activeAnswers[question.id] === option.value;

                    return (
                      <button
                        aria-label={`${option.value}: ${option.label}`}
                        aria-pressed={selected}
                        className={`group flex min-h-[7.25rem] min-w-0 flex-col justify-between border-2 px-4 py-3 text-left transition hover:-translate-y-0.5 ${
                          selected
                            ? "border-[var(--jt23-green)] bg-[var(--jt23-green)] text-black shadow-[0_0_32px_rgba(24,210,63,0.58),inset_0_0_20px_rgba(255,255,255,0.18)]"
                            : "border-[var(--line)] bg-black text-white shadow-[0_0_0_1px_rgba(24,210,63,0.12)] hover:border-[var(--jt23-green)] hover:bg-[#071108]"
                        }`}
                        key={option.value}
                        onClick={() =>
                          answerQuestion(question.id, option.value)
                        }
                        type="button"
                      >
                        <span
                          className={`font-mono text-xl font-black ${
                            selected ? "text-black" : "text-[var(--jt23-green)]"
                          }`}
                        >
                          {option.value}
                        </span>
                        <span className="mt-3 text-sm font-bold leading-tight">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--panel-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-[var(--muted)]">
                Scores are not a grade. They are a pressure map for the next
                practical decision.
              </p>
              <button
                className="border border-[var(--jt23-green)] bg-black px-5 py-3 text-sm font-bold text-[var(--jt23-green)] shadow-[0_0_24px_rgba(24,210,63,0.36)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#071f0d] enabled:hover:text-white disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-black disabled:text-[var(--muted)] disabled:shadow-none"
                disabled={!isComplete}
                onClick={requestReport}
                type="button"
              >
                Get my report
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="results"
        className="border-y border-[var(--line)] bg-[var(--panel)] px-5 py-16 sm:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
            Results
          </p>

          {result ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="border border-[var(--jt23-green)] bg-black p-6">
                <p className="text-sm text-[var(--muted)]">
                  {result.assessment.title}
                </p>
                <div className="mt-6 flex items-end gap-3">
                  <span className="text-7xl font-black leading-none text-[var(--jt23-green)]">
                    {result.score}
                  </span>
                  <span className="pb-2 text-lg font-bold text-white">
                    / 40
                  </span>
                </div>
                <h2 className="mt-5 text-3xl font-bold">
                  {result.maturity.name}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Score range: {result.maturity.range}
                </p>
                <p className="mt-5 leading-7 text-white">
                  {result.maturity.explanation}
                </p>
              </div>

              <div className="border border-[var(--line)] bg-[var(--background)] p-6">
                <h3 className="text-2xl font-bold">
                  Top 3 moves to reduce risk
                </h3>
                <ol className="mt-5 space-y-4">
                  {result.assessment.nextSteps.map((step, index) => (
                    <li
                      className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[var(--line)] pt-4"
                      key={step}
                    >
                      <span className="font-mono text-sm font-bold text-[var(--jt23-green)]">
                        {index + 1}
                      </span>
                      <span className="leading-7 text-[var(--muted)]">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                <a
                  className="mt-7 inline-flex w-full justify-center border border-[var(--jt23-green)] bg-[var(--jt23-green)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white sm:w-auto"
                  href={bookingLink}
                >
                  Book a Readiness Call
                </a>
              </div>
            </div>
          ) : leadAssessment ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="border border-[var(--jt23-green)] bg-black p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
                  Report ready
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-tight">
                  Email me my AI readiness report
                </h2>
                <p className="mt-4 leading-7 text-[var(--muted)]">
                  Enter your name and email to receive the short report, then
                  your score and next moves will unlock here.
                </p>
                <div className="mt-6 border border-[var(--line)] bg-[var(--panel)] p-4">
                  <p className="text-sm font-bold text-white">
                    {leadAssessment.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Includes your score, maturity level, plain-English risk
                    read, top three next steps, and the call booking link.
                  </p>
                </div>
              </div>

              <form
                className="border border-[var(--line)] bg-[var(--background)] p-6"
                onSubmit={submitLeadForm}
              >
                <label className="block text-sm font-bold text-white">
                  Name
                  <input
                    className="mt-2 w-full border border-[var(--line)] bg-black px-4 py-3 text-white outline-none transition focus:border-[var(--jt23-green)]"
                    name="name"
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    type="text"
                    value={leadForm.name}
                  />
                </label>
                <label className="mt-5 block text-sm font-bold text-white">
                  Email
                  <input
                    className="mt-2 w-full border border-[var(--line)] bg-black px-4 py-3 text-white outline-none transition focus:border-[var(--jt23-green)]"
                    name="email"
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    required
                    type="email"
                    value={leadForm.email}
                  />
                </label>
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  We will use this to send your report and follow up about AI
                  readiness. No client data is needed for this diagnostic.
                </p>
                {leadError ? (
                  <p className="mt-4 border border-[#d97878] bg-black p-3 text-sm font-bold text-[#ffb3b3]">
                    {leadError}
                  </p>
                ) : null}
                <button
                  className="mt-6 w-full border border-[var(--jt23-green)] bg-[var(--jt23-green)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white disabled:cursor-wait disabled:bg-[#253026] disabled:text-[var(--muted)]"
                  disabled={leadStatus === "sending"}
                  type="submit"
                >
                  {leadStatus === "sending"
                    ? "Sending report..."
                    : "Email my report"}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-6 border border-[var(--line)] bg-black p-6">
              <h2 className="text-2xl font-bold">
                Complete a check to see your score.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                Your results will show the total score, maturity level, plain
                English risk read, and three next moves.
              </p>
            </div>
          )}
        </div>
      </section>

      <CallToAction />
      <About />
    </main>
  );
}

function Hero() {
  return (
    <section className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
          <a className="flex items-center gap-3" href="#top">
            <img
              alt="JT23 Impact Labs logo"
              className="h-12 w-12 border border-[var(--line)] object-cover"
              src="/jt23-logo.jpg"
            />
            <span className="text-sm font-bold uppercase tracking-[0.18em]">
              JT23 Impact Labs
            </span>
          </a>
          <a
            className="hidden border border-[var(--line)] px-4 py-2 text-sm font-bold text-white transition hover:border-[var(--jt23-green)] sm:inline-flex"
            href={bookingLink}
          >
            Book a call
          </a>
        </header>

        <div className="grid min-h-[calc(100vh-92px)] items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
              JT23 AI Adoption Diagnostic
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              AI is already in the workflow. Is it under control?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              JT23 helps teams turn scattered AI experiments into safer habits,
              clearer policy, and practical workflows people can actually use.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex justify-center border border-[var(--jt23-green)] bg-[var(--jt23-green)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white"
                href="#diagnostics"
              >
                Check Your AI Risk
              </a>
              <a
                className="inline-flex justify-center border border-[var(--line)] px-5 py-3 text-sm font-bold text-white transition hover:border-[var(--jt23-green)]"
                href={bookingLink}
              >
                Book a Readiness Call
              </a>
            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--panel)] p-6">
            <div className="border-b border-[var(--line)] pb-4">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
                Readiness snapshot
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                The problem is not AI use. It is unmanaged AI use.
              </h2>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {[
                {
                  color: "var(--snapshot-literacy)",
                  detail: "Can people choose the right tool and spot bad outputs?",
                  label: "AI Literacy",
                },
                {
                  color: "var(--snapshot-policy)",
                  detail: "Are the rules clear enough for staff to actually follow?",
                  label: "AI Policy",
                },
                {
                  color: "var(--snapshot-risk)",
                  detail: "Where could data, trust, or compliance exposure build up?",
                  label: "AI Risk",
                },
              ].map(({ color, detail, label }) => (
                <div className="grid grid-cols-[1.6rem_1fr] gap-4 py-5" key={label}>
                  <span
                    className="mt-1 h-3 w-3"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <p className="font-bold text-white">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 border border-[var(--jt23-green)] p-4 text-sm leading-6 text-white">
              No client data or company details are needed. Name and email are
              only requested when you ask for the report.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 border border-[var(--jt23-green)] bg-[var(--jt23-green)] p-6 text-black sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">
            Do not let the policy arrive after the problem.
          </h2>
          <p className="mt-3 max-w-3xl leading-7">
            JT23 can help your team run the workshop, write the safe-use rules,
            and choose the first workflows worth improving before scattered AI
            use becomes a bigger risk.
          </p>
        </div>
        <a
          className="inline-flex justify-center border border-black bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black"
          href={bookingLink}
        >
          Book a Readiness Call
        </a>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="border-t border-[var(--line)] px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.45fr_1fr]">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
          About JT23
        </p>
        <p className="max-w-3xl text-xl leading-9 text-white">
          JT23 Impact Labs helps teams use AI in practical, safe, and human
          ways. We focus on plain-English training, useful workflows, and
          safe-use policy support so teams can move faster without pretending
          the risks are small.
        </p>
      </div>
    </section>
  );
}
