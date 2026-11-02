import { useState } from "react";

const FAQS = [
  { question: "What time do you open?", answer: "We open at 9am every day." },
  { question: "Where are you located?", answer: "Room 104, next to the library." },
  { question: "Do you offer refunds?", answer: "Yes, within 30 days of purchase." },
];

function Panel({ question, answer, isOpen, onToggle }) {
  return (
    <section>
      <h3>
        <button onClick={onToggle}>{question}</button>
      </h3>
      {isOpen && <p>{answer}</p>}
    </section>
  );
}

export default function App() {
  // The single source of truth: which panel is open (null means none).
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div>
      <h2>FAQ</h2>
      {FAQS.map((faq, index) => (
        <Panel
          key={faq.question}
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
