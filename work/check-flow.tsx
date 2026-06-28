import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
});

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
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
    selectedOption.className.includes("bg-[#071f0d]"),
    "selected answer should light up the full answer tile",
  );
  assert.ok(
    selectedOption.className.includes("shadow-[inset_0_0_0_1px_var(--jt23-green)"),
    "selected answer should have a visible neon green glow",
  );

  await answerAll(3);
  const showResultsButton = buttonByText("Show results");
  assert.equal(showResultsButton.hasAttribute("disabled"), false);
  assert.equal(
    showResultsButton.className.includes("bg-[var(--jt23-green)]"),
    false,
    "Show results should avoid the filled light-green style",
  );
  assert.ok(
    showResultsButton.className.includes("shadow-[0_0_24px_rgba(24,210,63,0.36)]"),
    "Show results should use a neon green treatment",
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
  await click(buttonByText("Show results"));

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

for (const bannedWord of ["revolutionary", "synergy", "cutting-edge", "unlock the power"]) {
  assert.equal(text().toLowerCase().includes(bannedWord), false);
}

console.log("Interaction checks passed: buttons, scoring levels, CTA, brand copy.");
