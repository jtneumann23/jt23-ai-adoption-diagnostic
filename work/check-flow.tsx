import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
});

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  Event: dom.window.Event,
  FormData: dom.window.FormData,
  HTMLElement: dom.window.HTMLElement,
  HTMLAnchorElement: dom.window.HTMLAnchorElement,
  MouseEvent: dom.window.MouseEvent,
});

Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: dom.window.navigator,
});

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};

const leadRequests: unknown[] = [];
globalThis.fetch = async (_url, init) => {
  leadRequests.push(JSON.parse(String(init?.body)));
  return Response.json({
    message: "Email sent successfully!",
    success: true,
  });
};

process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = "public-test-key";
const { default: Home } = await import("../app/page");

function text() {
  return document.body.textContent ?? "";
}

function buttonByText(label: string) {
  const button = [...document.querySelectorAll("button")].find((candidate) =>
    candidate.textContent?.includes(label),
  );
  assert.ok(button, `button not found: ${label}`);
  return button;
}

async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

async function typeInto(selector: string, value: string) {
  const input = document.querySelector(selector) as HTMLInputElement | null;
  assert.ok(input, `input not found: ${selector}`);
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  assert.ok(valueSetter, "input value setter not found");

  await act(async () => {
    valueSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function submitLeadForm() {
  await typeInto('input[name="name"]', "Jordan Owner");
  await typeInto('input[name="company"]', "Prairie Ops");
  await typeInto('input[name="email"]', "owner@example.com");
  await click(buttonByText("Unlock my report"));
}

async function answerAll(value: 1 | 2 | 3 | 4 | 5) {
  const questionGroups = [...document.querySelectorAll('[role="group"]')];
  assert.equal(questionGroups.length, 8);

  for (const group of questionGroups) {
    const option = [...group.querySelectorAll("button")].find((button) =>
      button.textContent?.trim().startsWith(String(value)),
    );
    assert.ok(option, `option ${value} not found`);
    await click(option);
  }
}

async function selectFirstVisibleOption(value: 1 | 2 | 3 | 4 | 5) {
  const firstQuestion = document.querySelector('[role="group"]');
  assert.ok(firstQuestion);

  const option = [...firstQuestion.querySelectorAll("button")].find((button) =>
    button.textContent?.trim().startsWith(String(value)),
  );
  assert.ok(option, `option ${value} not found`);
  await click(option);

  return option;
}

async function expectVisualSelectionState() {
  const selectedOption = await selectFirstVisibleOption(3);
  assert.equal(selectedOption.getAttribute("aria-pressed"), "true");
  assert.ok(
    selectedOption.className.includes("bg-[var(--jt23-green)]"),
    "selected answer should fill the full answer tile with neon green",
  );
  assert.ok(
    selectedOption.className.includes("0_0_32px_rgba(24,210,63,0.58)"),
    "selected answer should have a visible neon green glow",
  );

  await answerAll(3);
  const reportButton = buttonByText("Get my report");
  assert.equal(reportButton.hasAttribute("disabled"), false);
  assert.equal(
    reportButton.className.includes("bg-[var(--jt23-green)]"),
    false,
    "Report button should avoid the filled light-green style",
  );
  assert.ok(
    reportButton.className.includes("shadow-[0_0_24px_rgba(24,210,63,0.36)]"),
    "Report button should use a neon green treatment",
  );
}

async function expectAssessmentResult(
  startButton: string,
  answerValue: 1 | 2 | 3 | 4 | 5,
  score: number,
  level: string,
) {
  await click(buttonByText(startButton));
  assert.ok(text().includes(startButton.replace("Start ", "")));

  await answerAll(answerValue);
  await click(buttonByText("Get my report"));
  assert.ok(text().includes("Unlock my AI readiness report"));
  assert.ok(text().includes("Biggest AI challenge"));
  assert.equal(text().includes("Top 3 moves to reduce risk"), false);

  await submitLeadForm();

  assert.ok(text().includes(`${score}`), `score missing: ${score}`);
  assert.ok(text().includes(level), `level missing: ${level}`);
  assert.ok(text().includes("Top 3 moves to reduce risk"));
}

const rootElement = document.getElementById("root");
assert.ok(rootElement);

await act(async () => {
  createRoot(rootElement).render(<Home />);
});

assert.ok(text().includes("AI is already in the workflow. Is it under control?"));
assert.ok(text().includes("JT23 AI Adoption Diagnostic"));
assert.ok(text().includes("No private data needed."));
assert.ok(text().includes("Book a Readiness Call"));
assert.equal(text().includes("Answer key"), false);
assert.ok(text().includes("Not on our radar"));
assert.ok(text().includes("Goals achieved"));

await expectVisualSelectionState();
await expectAssessmentResult("Start AI Literacy Check", 1, 8, "AI Unclear");
await expectAssessmentResult("Start AI Policy Check", 3, 24, "AI Curious");
await expectAssessmentResult("Start AI Risk Check", 4, 32, "AI Capable");
await expectAssessmentResult("Start AI Literacy Check", 5, 40, "AI Multiplier");

const bookingLinks = [...document.querySelectorAll("a")].filter((anchor) =>
  anchor.textContent?.includes("Book a Readiness Call"),
) as HTMLAnchorElement[];

assert.ok(bookingLinks.length > 0);
assert.equal(
  bookingLinks[0].href,
  "https://calendly.com/jtneumann23/jon-neumann-1x1",
);
assert.ok(leadRequests.length >= 4);
assert.equal((leadRequests[0] as Record<string, unknown>).access_key, "public-test-key");
assert.equal((leadRequests[0] as Record<string, unknown>).company, "Prairie Ops");
assert.equal(
  (leadRequests[0] as Record<string, unknown>)["Biggest AI challenge"],
  "Getting staff to use AI safely",
);

for (const bannedWord of ["revolutionary", "synergy", "cutting-edge", "unlock the power"]) {
  assert.equal(text().toLowerCase().includes(bannedWord), false);
}

console.log("Interaction checks passed: buttons, scoring levels, CTA, brand copy.");
