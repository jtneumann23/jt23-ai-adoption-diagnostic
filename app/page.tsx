"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import {
  type AnswerMap,
  type Assessment,
  type ScoreValue,
  assessments,
  getMaturityLevel,
  scoreAssessment,
} from "./lib/diagnostic";

const bookingLink = "https://example.com/book";

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

  const activeAssessment =
    assessments.find((assessment) => assessment.id === activeAssessmentId) ??
    assessments[0];
  const activeAnswers = answersByAssessment[activeAssessment.id] ?? {};
  const answeredCount = Object.keys(activeAnswers).length;
  const isComplete = answeredCount === activeAssessment.questions.length;

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
    setResultAssessmentId(null);
    document.getElementById("assessment")?.scrollIntoView({ block: "start" });
  }

  function answerQuestion(questionId: string, value: ScoreValue) {
    setAnswersByAssessment((current) => ({
      ...current,
      [activeAssessment.id]: {
        ...(current[activeAssessment.id] ?? {}),
        [questionId]: value,
      },
    }));
  }

  function showResult() {
    if (!isComplete) return;

    setResultAssessmentId(activeAssessment.id);
    document.getElementById("results")?.scrollIntoView({ block: "start" });
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
              Start with the clearest gap
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three practical checks. No private data needed.
            </h2>
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
              Answer eight questions. Choose the option that best describes the
              team today, not the team you hope to have later.
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
              <fieldset
                className="border border-[var(--line)] bg-[var(--panel)] p-5"
                key={question.id}
              >
                <legend className="mb-4 text-base font-bold">
                  <span className="mr-3 font-mono text-sm text-[var(--jt23-green)]">
                    {String(questionIndex + 1).padStart(2, "0")}
                  </span>
                  {question.prompt}
                </legend>
                <div className="grid gap-2 sm:grid-cols-5">
                  {question.options.map((option) => {
                    const selected = activeAnswers[question.id] === option.value;

                    return (
                      <button
                        aria-pressed={selected}
                        className={`min-h-16 border px-3 py-3 text-left text-sm font-bold transition ${
                          selected
                            ? "border-[var(--jt23-green)] bg-[var(--jt23-green)] text-black"
                            : "border-[var(--line)] bg-black text-white hover:border-[var(--jt23-green)]"
                        }`}
                        key={option.value}
                        onClick={() => answerQuestion(question.id, option.value)}
                        type="button"
                      >
                        <span className="block font-mono text-xs">
                          {option.value}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--panel-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-[var(--muted)]">
                Scores are a guide for the next practical conversation, not a
                grade.
              </p>
              <button
                className="border border-[var(--jt23-green)] bg-[var(--jt23-green)] px-5 py-3 text-sm font-bold text-black transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[#253026] disabled:text-[var(--muted)]"
                disabled={!isComplete}
                onClick={showResult}
                type="button"
              >
                Show results
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
                  Top 3 recommended next steps
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
                  Book an AI Adoption Call
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-6 border border-[var(--line)] bg-black p-6">
              <h2 className="text-2xl font-bold">
                Complete a check to see your score.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                Your results will show the total score, maturity level, plain
                English explanation, and three next steps.
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
              Turn AI confusion into useful work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              JT23 Impact Labs helps teams understand AI, use it safely, and
              find practical workflows that save time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex justify-center border border-[var(--jt23-green)] bg-[var(--jt23-green)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white"
                href="#diagnostics"
              >
                Start the AI Adoption Diagnostic
              </a>
              <a
                className="inline-flex justify-center border border-[var(--line)] px-5 py-3 text-sm font-bold text-white transition hover:border-[var(--jt23-green)]"
                href={bookingLink}
              >
                Book an AI Readiness Call
              </a>
            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--panel)] p-6">
            <div className="border-b border-[var(--line)] pb-4">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--jt23-green)]">
                V1 diagnostic
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                A clear read on where your team stands.
              </h2>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {[
                ["AI Literacy", "Can people use AI with judgment?"],
                ["Training Needs", "Where would practical training help first?"],
                ["Policy Gaps", "Are safe-use rules clear enough?"],
              ].map(([label, detail]) => (
                <div className="grid grid-cols-[1.6rem_1fr] gap-4 py-5" key={label}>
                  <span className="mt-1 h-3 w-3 bg-[var(--jt23-green)]" />
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
              No names, emails, client data, or company details are collected in
              this first version.
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
            Want help turning the score into action?
          </h2>
          <p className="mt-3 max-w-3xl leading-7">
            JT23 can help your team build AI literacy, create safe-use rules,
            and map the first workflows worth improving.
          </p>
        </div>
        <a
          className="inline-flex justify-center border border-black bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black"
          href={bookingLink}
        >
          Book an AI Adoption Call
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
          ways. We focus on clear training, useful workflows, and plain-English
          policy support so teams can move from curiosity to confidence.
        </p>
      </div>
    </section>
  );
}
