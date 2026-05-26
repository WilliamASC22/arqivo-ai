"use client";

import { useEffect, useState } from "react";

type ReviewCase = {
  id: number;
  name: string;
  issue: string;
  status: string;
  risk: string;
  details: string;
  history: string[];
};

const defaultCases: ReviewCase[] = [
  {
    id: 1,
    name: "Maria R.",
    issue: "Rent assistance request",
    status: "Missing Info",
    risk: "Medium",
    details:
      "Maria submitted a rent assistance request. She included her ID and proof of address, but proof of income is missing.",
    history: [
      "Case created.",
      "Missing Information Agent detected missing proof of income.",
      "Risk Agent marked the case as Medium risk.",
    ],
  },
  {
    id: 2,
    name: "Student Advising Case",
    issue: "Graduation planning support",
    status: "Needs Review",
    risk: "Low",
    details:
      "A student is worried about graduating on time and needs advising before registration closes next week.",
    history: [
      "Case created.",
      "Planner Agent recommended advisor review.",
      "Risk Agent marked the case as Low risk.",
    ],
  },
  {
    id: 3,
    name: "Customer Refund Case",
    issue: "Duplicate charge complaint",
    status: "High Priority",
    risk: "High",
    details:
      "A customer says they were charged twice for the same order. They provided an order number but no receipt or bank statement.",
    history: [
      "Case created.",
      "Missing Information Agent detected missing receipt and bank statement.",
      "Risk Agent marked the case as High risk.",
    ],
  },
];

export default function ReviewQueuePage() {
  const [cases, setCases] = useState<ReviewCase[]>(defaultCases);
  const [expandedCaseId, setExpandedCaseId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCases = localStorage.getItem("arqivo-review-cases");

    if (savedCases) {
      setCases(JSON.parse(savedCases));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("arqivo-review-cases", JSON.stringify(cases));
  }, [cases]);

  function toggleView(caseId: number) {
    setExpandedCaseId((currentId) => (currentId === caseId ? null : caseId));
  }

  function approveCase(caseId: number) {
    setCases((prevCases) =>
      prevCases.map((item) =>
        item.id === caseId
          ? {
              ...item,
              status: "Approved",
              risk: "Low",
              history: [
                ...item.history,
                "Human reviewer approved the case.",
              ],
            }
          : item
      )
    );

    setMessage("Case was approved and saved in this browser.");
  }

  function requestInfo(caseId: number) {
    setCases((prevCases) =>
      prevCases.map((item) =>
        item.id === caseId
          ? {
              ...item,
              status: "More Info Requested",
              history: [
                ...item.history,
                "Human reviewer requested more information.",
              ],
            }
          : item
      )
    );

    setMessage("More information was requested and saved in this browser.");
  }

  function resetDemoData() {
    setCases(defaultCases);
    localStorage.setItem("arqivo-review-cases", JSON.stringify(defaultCases));
    setExpandedCaseId(null);
    setMessage("Demo data was reset.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold">Review Queue</h1>
            <p className="mt-2 text-slate-400">
              Review AI-assisted cases, approve them, or request more information.
            </p>
          </div>

          <button
            onClick={resetDemoData}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
          >
            Reset Demo Data
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-blue-400 bg-blue-500/10 p-4 text-blue-200">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {cases.map((item) => {
            const isExpanded = expandedCaseId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-300">
                      {item.name}
                    </h2>
                    <p className="text-slate-300">{item.issue}</p>
                  </div>

                  <div className="text-sm text-slate-300">
                    <p>
                      <strong>Status:</strong> {item.status}
                    </p>
                    <p>
                      <strong>Risk:</strong> {item.risk}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleView(item.id)}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-400"
                    >
                      {isExpanded ? "Hide" : "View"}
                    </button>

                    <button
                      onClick={() => approveCase(item.id)}
                      className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => requestInfo(item.id)}
                      className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
                    >
                      Request Info
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5">
                    <h3 className="mb-3 text-lg font-semibold text-blue-300">
                      Case Details
                    </h3>

                    <p className="mb-4 text-slate-300">
                      {item.details}
                    </p>

                    <h3 className="mb-2 text-lg font-semibold text-blue-300">
                      Audit History
                    </h3>

                    <ol className="list-inside list-decimal space-y-1 text-sm text-slate-300">
                      {item.history.map((entry, index) => (
                        <li key={`${item.id}-${index}`}>{entry}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}