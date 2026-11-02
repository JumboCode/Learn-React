import type { Metadata } from "next";
import { RESOURCES } from "@/curriculum/resources";

export const metadata: Metadata = {
  title: "Resources",
  description: "Hand-picked references and courses for HTML, CSS, JavaScript, React, and developer tools.",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
      <p className="mt-2 text-muted">
        Good resources for learning more...
      </p>
      {RESOURCES.map((group) => (
        <section key={group.topic} aria-labelledby={`topic-${group.topic}`} className="mt-10">
          <h2 id={`topic-${group.topic}`} className="border-b border-line pb-2 text-xl font-semibold">
            {group.topic}
          </h2>
          <ul className="mt-3 space-y-4">
            {group.resources.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  {resource.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <p className="text-sm text-muted">{resource.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
