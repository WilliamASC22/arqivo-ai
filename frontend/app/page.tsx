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

const sampleText = `Maria submitted a request for rent assistance. She included her ID and proof of address, but did not include proof of income. Her deadline is May 30. She asked if her case can still be reviewed before the deadline.`;

export default function Home() {
  const [text, setText] = useState(sampleText);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAgents() {
    setLoading(true);
    setResult(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">
            Multi-Agent AI Workflow Demo
          </p>
          <h1 className="mb-4 text-5xl font-bold">Arqivo AI</h1>
          <p className="max-w-3xl text-lg text-slate-300">
            A public demo app that turns messy case notes and documents into
            summaries, missing-information checks, risk flags, next-step plans,
            draft responses, and audit logs.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold">Try the demo</h2>
            <p className="mb-4 text-sm text-slate-400">
              Paste a fake case note below. Do not enter private or sensitive information.
            </p>

            <textarea
              className="h-72 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-blue-400"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              onClick={runAgents}
              disabled={loading}
              className="mt-4 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
            >
              {loading ? "Running agents..." : "Run AI Agents"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold">Agents in this system</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p><strong>Intake Agent:</strong> Finds the case type, dates, and keywords.</p>
              <p><strong>Summary Agent:</strong> Explains the case in simple words.</p>
              <p><strong>Missing Info Agent:</strong> Checks what required details are missing.</p>
              <p><strong>Risk Agent:</strong> Flags deadlines, missing info, and suspicious text.</p>
              <p><strong>Planner Agent:</strong> Creates next steps.</p>
              <p><strong>Message Agent:</strong> Drafts a human-reviewed response.</p>
              <p><strong>Quality Agent:</strong> Checks whether the result needs review.</p>
            </div>
          </div>
        </div>

        {result && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <ResultCard title="Summary">
              <p>{result.report.summary}</p>
            </ResultCard>

            <ResultCard title="Case Details">
              <p><strong>Case Type:</strong> {result.report.case_type}</p>
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
              <p><strong>Risk Level:</strong> {result.report.risk.risk_level}</p>
              <p><strong>Risk Score:</strong> {result.report.risk.risk_score}</p>
              <ul className="mt-2 list-inside list-disc">
                {result.report.risk.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard title="Recommended Next Steps">
              <ol className="list-inside list-decimal">
                {result.report.recommended_steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </ResultCard>

            <ResultCard title="Draft Message">
              <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm">
                {result.report.draft_message}
              </pre>
            </ResultCard>

            <ResultCard title="Quality Check">
              <p><strong>Status:</strong> {result.quality_check.quality_status}</p>
              {result.quality_check.warnings.length > 0 && (
                <ul className="mt-2 list-inside list-disc">
                  {result.quality_check.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
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
      <div className="space-y-2 text-sm text-slate-300">{children}</div>
    </div>
  );
}