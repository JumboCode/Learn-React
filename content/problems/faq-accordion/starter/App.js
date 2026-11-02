import { useState } from "react";

const FAQS = [
  { question: "What time do you open?", answer: "We open at 9am every day." },
  { question: "Where are you located?", answer: "Room 104, next to the library." },
  { question: "Do you offer refunds?", answer: "Yes, within 30 days of purchase." },
];

// Each Panel remembers its own isOpen, so opening one cannot close the others.
// Lift this state up to App, and pass isOpen and a callback down as props instead.
function Panel({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <h3>
        <button onClick={() => setIsOpen(!isOpen)}>{question}</button>
      </h3>
      {isOpen && <p>{answer}</p>}
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h2>FAQ</h2>
      {FAQS.map((faq) => (
        <Panel key={faq.question} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
}
