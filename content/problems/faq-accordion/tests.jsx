import { test, expect, render, screen, fireEvent } from "testkit";
import App from "./App";

const FAQS = [
  { question: "What time do you open?", answer: "We open at 9am every day." },
  { question: "Where are you located?", answer: "Room 104, next to the library." },
  { question: "Do you offer refunds?", answer: "Yes, within 30 days of purchase." },
];

const click = (question) => fireEvent.click(screen.getByRole("button", { name: question }));
const openAnswers = () => FAQS.filter((faq) => screen.queryByText(faq.answer)).map((faq) => faq.answer);

test("shows every question as a button and no answers at first", () => {
  render(<App />);
  for (const faq of FAQS) expect(screen.getByRole("button", { name: faq.question })).toBeInTheDocument();
  expect(openAnswers()).toEqual([]);
});

test("clicking a question shows its answer", () => {
  render(<App />);
  click("Where are you located?");
  expect(openAnswers()).toEqual(["Room 104, next to the library."]);
});

test("opening a question closes the one that was open", () => {
  render(<App />);
  click("What time do you open?");
  click("Do you offer refunds?");
  expect(openAnswers()).toEqual(["Yes, within 30 days of purchase."]);
  click("Where are you located?");
  expect(openAnswers()).toEqual(["Room 104, next to the library."]);
});

test("clicking the open question again closes it", () => {
  render(<App />);
  click("Do you offer refunds?");
  click("Do you offer refunds?");
  expect(openAnswers()).toEqual([]);
});

test("a closed question can be reopened after closing", () => {
  render(<App />);
  click("What time do you open?");
  click("What time do you open?");
  click("What time do you open?");
  expect(openAnswers()).toEqual(["We open at 9am every day."]);
});
