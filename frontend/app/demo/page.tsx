"use client";

import { useState } from "react";

type AnalysisResult = {
  report: {
    summary: string;
    case_type: string;
    important_dates: string[];
    missing_information: string[];
    risk: {
      risk_level: string;
      risk_score: number;
      reasons: string[];
    };
    recommended_steps: string[];
    draft_message: string;
  };
  quality_check: {
    quality_status: string;
    warnings: string[];
  };
  audit_log: string[];
};

type SampleCase = {
  label: string;
  title: string;
  text: string;
};

type AgentInfo = {
  name: string;
  description: string;
};

const sampleCases: SampleCase[] = [
  {
    label: "Housing",
    title: "Rent Assistance Case",
    text: `Maria submitted a request for rent assistance. She included her ID and proof of address, but did not include proof of income. Her deadline is May 30. She asked if her case can still be reviewed before the deadline.`,
  },
  {
    label: "Student",
    title: "Student Advising Case",
    text: `A student emailed the advising office saying they are worried about graduating on time. They completed most major requirements but are missing one upper-level elective. They need guidance before registration closes next week.`,
  },
  {
    label: "Refund",
    title: "Duplicate Charge Case",
    text: `A customer says they were charged twice for the same order. They included the order number but did not include a bank statement or receipt. They want the issue resolved as soon as possible.`,
  },
  {
    label: "Benefits",
    title: "Benefits Renewal Case",
    text: `A family submitted a benefits renewal request. They included identification and proof of residency, but the income section is incomplete. The renewal deadline is June 28, and they asked whether missing documents will delay the review.`,
  },
  {
    label: "Documents",
    title: "Missing Paperwork Case",
    text: `An applicant submitted a support request after receiving a notice about missing paperwork. They included the notice and a short explanation, but did not include the requested verification document. They asked what the next step should be.`,
  },
];

const agents: AgentInfo[] = [
  {
    name: "Intake Agent",
    description: "Finds the case type, dates, keywords, and main request.",
  },
  {
    name: "Summary Agent",
    description: "Explains the case in simple words.",
  },
  {
    name: "Missing Info Agent",
    description: "Checks what required details or documents are missing.",
  },
  {
    name: "Risk Agent",
    description: "Flags deadlines, missing information, urgency, and suspicious text.",
  },
  {
    name: "Deadline Agent",
    description: "Looks for due dates, review dates, and time-sensitive language.",
  },
  {
    name: "Document Agent",
    description: "Checks whether the person included the documents needed for review.",
  },
  {
    name: "Eligibility Agent",
    description: "Identifies whether the case may be ready for review or still incomplete.",
  },
  {
    name: "Priority Agent",
    description: "Helps decide whether the case should be handled normally or quickly.",
  },
  {
    name: "Planner Agent",
    description: "Creates next steps for a human reviewer.",
  },
  {
    name: "Message Agent",
    description: "Drafts a response that a person can review and edit.",
  },
  {
    name: "Tone Agent",
    description: "Makes the response sound clear, respectful, and professional.",
  },
  {
    name: "Quality Agent",
    description: "Checks whether the result needs review before action.",
  },
  {
    name: "Safety Agent",
    description: "Reminds users not to enter private or sensitive real information.",
  },
  {
    name: "Audit Log Agent",
    description: "Creates a simple record of what the system checked.",
  },
];

export default function Home() {
  const [selectedSample, setSelectedSample] = useState(0);
  const [text, setText] = useState(sampleCases[0].text);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function chooseSample(index: number) {
    setSelectedSample(index);
    setText(sampleCases[index].text);
    setResult(null);
    setErrorMessage("");
  }

  async function runAgents() {
    if (!text.trim()) {
      setErrorMessage("Please enter a fake case note before running the agents.");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMessage("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setLoading(false);
      setErrorMessage(
        "NEXT_PUBLIC_API_URL is missing. Add your backend URL in Vercel or your local .env file.",
      );
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("The backend did not return a successful response.");
      }

      const data = await response.json();
      setResult(data);
    } catch {
      setErrorMessage(
        "The agent backend could not be reached. Make sure the FastAPI backend is running and NEXT_PUBLIC_API_URL is correct.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">
            Multi-Agent AI Workflow Demo
          </p>

          <h1 className="mb-4 text-5xl font-bold">Arqivo AI</h1>

          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            A public demo app that turns messy case notes and documents into
            summaries, missing-information checks, risk flags, next-step plans,
            draft responses, and audit logs.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold">Try the demo</h2>

            <p className="mb-4 text-sm leading-6 text-slate-400">
              Choose a fake sample case or edit the text below. Then click Run
              AI Agents to see how Arqivo reviews the case step by step.
            </p>

            <div className="mb-5 flex flex-wrap gap-2">
              {sampleCases.map((sample, index) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => chooseSample(index)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedSample === index
                      ? "border-blue-400 bg-blue-500 text-white"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:border-blue-400 hover:bg-slate-800"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                Current Sample
              </p>

              <p className="mt-1 text-base font-semibold text-white">
                {sampleCases[selectedSample].title}
              </p>
            </div>

            <textarea
              className="h-72 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-100 outline-none focus:border-blue-400"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste a fake case note here..."
            />

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Safety reminder: do not enter private or sensitive information.
              Use fake demo text or placeholders.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={runAgents}
              disabled={loading || !text.trim()}
              className="mt-4 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running agents..." : "Run AI Agents"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold">
              Agents in this system
            </h2>

            <p className="mb-5 text-sm leading-6 text-slate-400">
              Arqivo uses several focused agents. Each one checks a different
              part of the case so the final output is easier for a person to
              review.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {agents.map((agent) => (
                <div
                  key={agent.name}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="font-semibold text-blue-300">{agent.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {agent.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <ResultCard title="Summary">
              <p>{result.report.summary}</p>
            </ResultCard>

            <ResultCard title="Case Details">
              <p>
                <strong>Case Type:</strong> {result.report.case_type}
              </p>

              <p>
                <strong>Important Dates:</strong>{" "}
                {result.report.important_dates.length
                  ? result.report.important_dates.join(", ")
                  : "None found"}
              </p>
            </ResultCard>

            <ResultCard title="Missing Information">
              {result.report.missing_information.length ? (
                <ul className="list-inside list-disc">
                  {result.report.missing_information.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No missing information found.</p>
              )}
            </ResultCard>

            <ResultCard title="Risk Analysis">
              <p>
                <strong>Risk Level:</strong> {result.report.risk.risk_level}
              </p>

              <p>
                <strong>Risk Score:</strong> {result.report.risk.risk_score}
              </p>

              {result.report.risk.reasons.length ? (
                <ul className="mt-2 list-inside list-disc">
                  {result.report.risk.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2">No risk reasons found.</p>
              )}
            </ResultCard>

            <ResultCard title="Recommended Next Steps">
              {result.report.recommended_steps.length ? (
                <ol className="list-inside list-decimal">
                  {result.report.recommended_steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p>No next steps were created.</p>
              )}
            </ResultCard>

            <ResultCard title="Draft Message">
              <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm leading-6">
                {result.report.draft_message}
              </pre>
            </ResultCard>

            <ResultCard title="Quality Check">
              <p>
                <strong>Status:</strong>{" "}
                {result.quality_check.quality_status}
              </p>

              {result.quality_check.warnings.length > 0 ? (
                <ul className="mt-2 list-inside list-disc">
                  {result.quality_check.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2">No quality warnings found.</p>
              )}
            </ResultCard>

            <ResultCard title="Audit Log">
              <ol className="list-inside list-decimal">
                {result.audit_log.map((log) => (
                  <li key={log}>{log}</li>
                ))}
              </ol>
            </ResultCard>
          </section>
        )}
      </section>
    </main>
  );
}

function ResultCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h3 className="mb-3 text-xl font-semibold text-blue-300">{title}</h3>
      <div className="space-y-2 text-sm leading-6 text-slate-300">
        {children}
      </div>
    </div>
  );
}