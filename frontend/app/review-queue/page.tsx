"use client";

import { useEffect, useMemo, useState } from "react";

type ReviewStatus =
  | "Needs Human Review"
  | "Missing Info"
  | "High Priority"
  | "Approved"
  | "More Info Requested";

type RiskLevel = "Low" | "Medium" | "High";

type ReviewCase = {
  id: number;
  name: string;
  issue: string;
  status: ReviewStatus;
  risk: RiskLevel;
  caseType: string;
  deadline: string;
  details: string;
  missingInformation: string[];
  includedDocuments: string[];
  recommendedAction: string;
  draftMessage: string;
  history: string[];
};

const defaultCases: ReviewCase[] = [
  {
    id: 1,
    name: "Maria R.",
    issue: "Rent assistance request",
    status: "Missing Info",
    risk: "Medium",
    caseType: "Housing",
    deadline: "May 30",
    details:
      "Maria submitted a rent assistance request. She included her ID and proof of address, but proof of income is missing. She asked whether her case can still be reviewed before the deadline.",
    missingInformation: ["Proof of income"],
    includedDocuments: ["ID", "Proof of address"],
    recommendedAction:
      "Request proof of income before marking the case ready for final review.",
    draftMessage:
      "Hello,\n\nThank you for submitting your rent assistance request. We reviewed the information provided, and proof of income is still needed before the review can continue.\n\nPlease provide proof of income so your case can move to the next step.\n\nBest,\n[Your Name / Department]",
    history: [
      "Case submitted.",
      "Safety Agent checked for possible sensitive information.",
      "Intake Agent identified this as a housing case.",
      "Missing Information Agent detected missing proof of income.",
      "Document Agent compared included documents against required documents.",
      "Deadline Agent found a May 30 deadline.",
      "Risk Agent marked the case as Medium risk.",
      "Planner Agent recommended requesting missing information.",
      "Quality Agent marked the case as needing human review.",
    ],
  },
  {
    id: 2,
    name: "Student Advising Case",
    issue: "Graduation planning support",
    status: "Needs Human Review",
    risk: "Low",
    caseType: "Student",
    deadline: "Next week",
    details:
      "A student is worried about graduating on time. They completed most major requirements but may be missing one upper-level elective. They need guidance before registration closes next week.",
    missingInformation: ["Confirmation of remaining graduation requirements"],
    includedDocuments: ["Student ID", "Course schedule"],
    recommendedAction:
      "Send the case to an advisor or reviewer to confirm the remaining requirement before registration closes.",
    draftMessage:
      "Hello,\n\nThank you for reaching out about your graduation plan. Your request should be reviewed before registration closes next week.\n\nPlease confirm your remaining requirements with an advisor so the next step can be planned clearly.\n\nBest,\n[Your Name / Department]",
    history: [
      "Case submitted.",
      "Intake Agent identified this as a student advising case.",
      "Deadline Agent detected time-sensitive registration language.",
      "Planner Agent recommended advisor review.",
      "Risk Agent marked the case as Low risk.",
      "Quality Agent marked the case as needing human review.",
    ],
  },
  {
    id: 3,
    name: "Customer Refund Case",
    issue: "Duplicate charge complaint",
    status: "High Priority",
    risk: "High",
    caseType: "Refund",
    deadline: "As soon as possible",
    details:
      "A customer says they were charged twice for the same order. They provided an order number but did not provide a receipt or bank statement. They want the issue resolved as soon as possible.",
    missingInformation: ["Receipt", "Bank statement"],
    includedDocuments: ["Order number"],
    recommendedAction:
      "Request the missing receipt and bank statement, then send the case for priority review because the customer reported a duplicate charge.",
    draftMessage:
      "Hello,\n\nThank you for contacting us about the duplicate charge. We reviewed the information provided, and a receipt and bank statement are still needed before the review can continue.\n\nPlease provide those documents so the case can be reviewed as soon as possible.\n\nBest,\n[Your Name / Department]",
    history: [
      "Case submitted.",
      "Intake Agent identified this as a refund case.",
      "Missing Information Agent detected missing receipt and bank statement.",
      "Document Agent found that only the order number was included.",
      "Risk Agent marked the case as High risk.",
      "Priority Agent marked the case as High Priority.",
      "Planner Agent recommended requesting missing documents and sending the case for priority review.",
      "Quality Agent marked the case as needing human review.",
    ],
  },
];

function getCurrentTimeStamp() {
  return new Date().toLocaleString();
}

function getStatusStyle(status: ReviewStatus) {
  if (status === "Approved") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "More Info Requested") {
    return "border-yellow-400/30 bg-yellow-500/10 text-yellow-200";
  }

  if (status === "High Priority") {
    return "border-red-400/30 bg-red-500/10 text-red-200";
  }

  if (status === "Missing Info") {
    return "border-orange-400/30 bg-orange-500/10 text-orange-200";
  }

  return "border-blue-400/30 bg-blue-500/10 text-blue-200";
}

function getRiskStyle(risk: RiskLevel) {
  if (risk === "High") {
    return "text-red-300";
  }

  if (risk === "Medium") {
    return "text-yellow-200";
  }

  return "text-emerald-300";
}

export default function ReviewQueuePage() {
  const [cases, setCases] = useState<ReviewCase[]>(defaultCases);
  const [selectedCaseId, setSelectedCaseId] = useState<number>(defaultCases[0].id);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCases = localStorage.getItem("arqivo-review-cases");

    if (savedCases) {
      try {
        const parsedCases = JSON.parse(savedCases) as ReviewCase[];

        if (Array.isArray(parsedCases) && parsedCases.length > 0) {
          setCases(parsedCases);
          setSelectedCaseId(parsedCases[0].id);
        }
      } catch {
        setCases(defaultCases);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("arqivo-review-cases", JSON.stringify(cases));
  }, [cases]);

  const selectedCase = useMemo(() => {
    return cases.find((item) => item.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  const queueStats = useMemo(() => {
    const total = cases.length;
    const approved = cases.filter((item) => item.status === "Approved").length;
    const needsReview = cases.filter((item) => item.status !== "Approved").length;
    const highRisk = cases.filter((item) => item.risk === "High").length;

    return {
      total,
      approved,
      needsReview,
      highRisk,
    };
  }, [cases]);

  function updateCaseStatus(caseId: number, status: ReviewStatus) {
    const timeStamp = getCurrentTimeStamp();

    setCases((prevCases) =>
      prevCases.map((item) => {
        if (item.id !== caseId) {
          return item;
        }

        let newHistoryEntry = "";

        if (status === "Approved") {
          newHistoryEntry =
            "Human reviewer approved this demo case after review.";
        } else if (status === "More Info Requested") {
          newHistoryEntry =
            "Human reviewer requested more information before approval.";
        } else {
          newHistoryEntry = "Human reviewer returned the case to the review queue.";
        }

        return {
          ...item,
          status,
          history: [...item.history, `${newHistoryEntry} (${timeStamp})`],
        };
      }),
    );

    if (status === "Approved") {
      setMessage(
        "Demo case marked as approved. This only updates the browser demo data.",
      );
    } else if (status === "More Info Requested") {
      setMessage(
        "Demo case marked as more information requested. This only updates the browser demo data.",
      );
    } else {
      setMessage(
        "Demo case returned to the review queue. This only updates the browser demo data.",
      );
    }
  }

  function resetDemoData() {
    setCases(defaultCases);
    setSelectedCaseId(defaultCases[0].id);
    localStorage.setItem("arqivo-review-cases", JSON.stringify(defaultCases));
    setMessage("Demo data was reset.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Human Review Workspace
            </p>

            <h1 className="text-5xl font-bold">Review Queue</h1>

            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-400">
              This page shows what happens after Arqivo AI organizes a case. A
              human reviewer can inspect the AI-assisted summary, approve the
              demo case, or request more information.
            </p>
          </div>

          <button
            onClick={resetDemoData}
            className="rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold transition hover:bg-slate-600"
          >
            Reset Demo Data
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total Cases" value={queueStats.total.toString()} />
          <StatCard label="Need Review" value={queueStats.needsReview.toString()} />
          <StatCard label="High Risk" value={queueStats.highRisk.toString()} />
          <StatCard label="Approved" value={queueStats.approved.toString()} />
        </div>

        <div className="mb-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
          <h2 className="mb-2 text-xl font-semibold text-blue-300">
            What does this page do?
          </h2>

          <p className="text-sm leading-7 text-slate-300">
            This is a demo review queue. It does not send real approvals to any
            outside system. The buttons only update local browser demo data so a
            user can see how a human-in-the-loop review process could work.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-200">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <div className="space-y-4">
            {cases.map((item) => {
              const isSelected = selectedCaseId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCaseId(item.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-blue-400 bg-blue-500/10"
                      : "border-slate-800 bg-slate-900 hover:border-blue-400/60"
                  }`}
                >
                  <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-300">
                        {item.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-300">
                        {item.issue}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        item.status,
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                    <p>
                      <strong>Type:</strong> {item.caseType}
                    </p>

                    <p>
                      <strong>Deadline:</strong> {item.deadline}
                    </p>

                    <p>
                      <strong>Risk:</strong>{" "}
                      <span className={getRiskStyle(item.risk)}>
                        {item.risk}
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCase && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                    Selected Case
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {selectedCase.name}
                  </h2>

                  <p className="mt-2 text-slate-400">{selectedCase.issue}</p>
                </div>

                <span
                  className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                    selectedCase.status,
                  )}`}
                >
                  {selectedCase.status}
                </span>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <InfoBox label="Case Type" value={selectedCase.caseType} />
                <InfoBox label="Deadline" value={selectedCase.deadline} />
                <InfoBox label="Risk" value={selectedCase.risk} />
              </div>

              <Section title="Case Details">
                <p>{selectedCase.details}</p>
              </Section>

              <Section title="Included Documents">
                {selectedCase.includedDocuments.length ? (
                  <ul className="list-inside list-disc">
                    {selectedCase.includedDocuments.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No included documents listed.</p>
                )}
              </Section>

              <Section title="Missing Information">
                {selectedCase.missingInformation.length ? (
                  <ul className="list-inside list-disc">
                    {selectedCase.missingInformation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No missing information listed.</p>
                )}
              </Section>

              <Section title="Recommended Human Action">
                <p>{selectedCase.recommendedAction}</p>
              </Section>

              <Section title="Draft Message">
                <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                  {selectedCase.draftMessage}
                </pre>
              </Section>

              <Section title="Audit History">
                <ol className="list-inside list-decimal space-y-1">
                  {selectedCase.history.map((entry, index) => (
                    <li key={`${selectedCase.id}-${index}`}>{entry}</li>
                  ))}
                </ol>
              </Section>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <button
                  onClick={() => updateCaseStatus(selectedCase.id, "Approved")}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-500"
                >
                  Mark Approved
                </button>

                <button
                  onClick={() =>
                    updateCaseStatus(selectedCase.id, "More Info Requested")
                  }
                  className="rounded-xl bg-yellow-600 px-4 py-3 text-sm font-semibold transition hover:bg-yellow-500"
                >
                  Request More Info
                </button>

                <button
                  onClick={() =>
                    updateCaseStatus(selectedCase.id, "Needs Human Review")
                  }
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  Return to Review
                </button>
              </div>

              <p className="mt-4 text-xs leading-6 text-slate-500">
                Demo note: These actions are saved only in this browser with
                localStorage. They do not approve real cases or contact anyone.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-blue-300">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
      <h3 className="mb-3 text-lg font-semibold text-blue-300">{title}</h3>
      <div className="space-y-2 text-sm leading-7 text-slate-300">
        {children}
      </div>
    </div>
  );
}