"use client";

import { useEffect, useMemo, useState } from "react";

type CaseStatus =
  | "Needs Review"
  | "Missing Info"
  | "High Priority"
  | "Approved"
  | "More Info Requested";

type RiskLevel = "Low" | "Medium" | "High";

type CaseItem = {
  id: string;
  title: string;
  description: string;
  caseText: string;
  status: CaseStatus;
  risk: RiskLevel;
  createdAt: string;
  missingInfo: string[];
  includedDocs: string[];
  recommendedAction: string;
  requestNotes: string[];
  history: string[];
};

const sampleCases = [
  {
    title: "Rent Assistance Case",
    text: "A tenant submitted a request for emergency rent assistance. They included a lease and proof of address, but did not include proof of income or a recent rent statement. The deadline is June 15, and they asked whether their case can still be reviewed before the notice period ends.",
  },
  {
    title: "Student Advising Case",
    text: "A student submitted an appeal asking for additional time to complete required documents. They included a student ID and course schedule, but did not include the requested explanation letter. The deadline is July 3, and they asked what they should submit next.",
  },
  {
    title: "Benefits Renewal Case",
    text: "A family submitted a benefits renewal request. They included identification and proof of residency, but the income section is incomplete. The renewal deadline is June 28, and they asked whether missing documents will delay the review.",
  },
  {
    title: "Refund Review Case",
    text: "A customer says they were charged twice for the same order. They included the order number but did not include a receipt or bank statement. They want the issue resolved as soon as possible.",
  },
  {
    title: "Missing Paperwork Case",
    text: "An applicant submitted a support request after receiving a notice about missing paperwork. They included the notice and a short explanation, but did not include the requested verification document. They asked what the next step should be.",
  },
];

const defaultCases: CaseItem[] = [
  {
    id: "case-1",
    title: "Maria R.",
    description: "Rent assistance request",
    caseText:
      "Maria submitted a request for rent assistance. She included her ID and proof of address, but did not include proof of income. Her deadline is May 30. She asked if her case can still be reviewed before the deadline.",
    status: "Missing Info",
    risk: "Medium",
    createdAt: "Demo case",
    missingInfo: ["Proof of income"],
    includedDocs: ["ID", "Proof of address"],
    recommendedAction:
      "Request proof of income before marking the case ready for final review.",
    requestNotes: [],
    history: [
      "Case added to review queue.",
      "Missing information was identified.",
      "Case is waiting for human review.",
    ],
  },
  {
    id: "case-2",
    title: "Student Advising Case",
    description: "Graduation planning support",
    caseText:
      "A student is worried about graduating on time. They completed most major requirements but may be missing one upper-level elective. They need guidance before registration closes next week.",
    status: "Needs Review",
    risk: "Low",
    createdAt: "Demo case",
    missingInfo: ["Confirmation of remaining graduation requirements"],
    includedDocs: ["Student ID", "Course schedule"],
    recommendedAction:
      "Have a reviewer or advisor confirm the remaining graduation requirement.",
    requestNotes: [],
    history: [
      "Case added to review queue.",
      "Deadline language was found.",
      "Case is waiting for human review.",
    ],
  },
  {
    id: "case-3",
    title: "Customer Refund Case",
    description: "Duplicate charge complaint",
    caseText:
      "A customer says they were charged twice for the same order. They provided an order number but did not provide a receipt or bank statement. They want the issue resolved as soon as possible.",
    status: "High Priority",
    risk: "High",
    createdAt: "Demo case",
    missingInfo: ["Receipt", "Bank statement"],
    includedDocs: ["Order number"],
    recommendedAction:
      "Request the missing receipt and bank statement, then send the case for priority review.",
    requestNotes: [],
    history: [
      "Case added to review queue.",
      "Duplicate charge issue was detected.",
      "Case was marked high priority.",
    ],
  },
];

function getNow() {
  return new Date().toLocaleString();
}

function findMissingInfo(text: string) {
  const lowered = text.toLowerCase();
  const missing: string[] = [];

  if (
    lowered.includes("did not include proof of income") ||
    lowered.includes("missing proof of income") ||
    lowered.includes("without proof of income")
  ) {
    missing.push("Proof of income");
  }

  if (
    lowered.includes("recent rent statement") &&
    (lowered.includes("did not include") || lowered.includes("missing"))
  ) {
    missing.push("Recent rent statement");
  }

  if (
    lowered.includes("explanation letter") &&
    (lowered.includes("did not include") || lowered.includes("missing"))
  ) {
    missing.push("Explanation letter");
  }

  if (
    lowered.includes("receipt") &&
    (lowered.includes("did not include") || lowered.includes("missing"))
  ) {
    missing.push("Receipt");
  }

  if (
    lowered.includes("bank statement") &&
    (lowered.includes("did not include") || lowered.includes("missing"))
  ) {
    missing.push("Bank statement");
  }

  if (
    lowered.includes("income section is incomplete") ||
    lowered.includes("income section")
  ) {
    missing.push("Income information");
  }

  if (
    lowered.includes("verification document") &&
    (lowered.includes("did not include") || lowered.includes("missing"))
  ) {
    missing.push("Verification document");
  }

  return Array.from(new Set(missing));
}

function findIncludedDocs(text: string) {
  const lowered = text.toLowerCase();
  const included: string[] = [];

  if (lowered.includes("id") || lowered.includes("identification")) {
    included.push("ID / identification");
  }

  if (lowered.includes("proof of address")) {
    included.push("Proof of address");
  }

  if (lowered.includes("lease")) {
    included.push("Lease");
  }

  if (lowered.includes("course schedule")) {
    included.push("Course schedule");
  }

  if (lowered.includes("order number")) {
    included.push("Order number");
  }

  if (lowered.includes("notice")) {
    included.push("Notice");
  }

  if (lowered.includes("proof of residency")) {
    included.push("Proof of residency");
  }

  return Array.from(new Set(included));
}

function estimateRisk(text: string, missingInfo: string[]): RiskLevel {
  const lowered = text.toLowerCase();

  if (
    lowered.includes("as soon as possible") ||
    lowered.includes("urgent") ||
    lowered.includes("high priority") ||
    missingInfo.length >= 2
  ) {
    return "High";
  }

  if (
    lowered.includes("deadline") ||
    lowered.includes("next week") ||
    lowered.includes("tomorrow") ||
    missingInfo.length === 1
  ) {
    return "Medium";
  }

  return "Low";
}

function estimateStatus(risk: RiskLevel, missingInfo: string[]): CaseStatus {
  if (risk === "High") {
    return "High Priority";
  }

  if (missingInfo.length > 0) {
    return "Missing Info";
  }

  return "Needs Review";
}

function createCaseFromText(text: string, title?: string): CaseItem {
  const cleanText = text.trim();
  const missingInfo = findMissingInfo(cleanText);
  const includedDocs = findIncludedDocs(cleanText);
  const risk = estimateRisk(cleanText, missingInfo);
  const status = estimateStatus(risk, missingInfo);

  return {
    id: crypto.randomUUID(),
    title: title || "User Submitted Case",
    description:
      cleanText.length > 90 ? `${cleanText.slice(0, 90)}...` : cleanText,
    caseText: cleanText,
    status,
    risk,
    createdAt: getNow(),
    missingInfo,
    includedDocs,
    recommendedAction:
      missingInfo.length > 0
        ? `Request the missing information: ${missingInfo.join(", ")}.`
        : "Review the case details and decide the next step.",
    requestNotes: [],
    history: [
      "Case added to review queue.",
      "Basic missing information check completed.",
      "Basic risk estimate completed.",
      "Case is ready for human review.",
    ],
  };
}

function getStatusStyle(status: CaseStatus) {
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
  const [cases, setCases] = useState<CaseItem[]>(defaultCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(defaultCases[0].id);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [newCaseText, setNewCaseText] = useState(sampleCases[0].text);
  const [requestText, setRequestText] = useState("");
  const [showRequestBox, setShowRequestBox] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedCases = localStorage.getItem("arqivo-review-queue-cases");

    if (savedCases) {
      try {
        const parsedCases = JSON.parse(savedCases) as CaseItem[];

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
    localStorage.setItem("arqivo-review-queue-cases", JSON.stringify(cases));
  }, [cases]);

  const selectedCase = useMemo(() => {
    return cases.find((item) => item.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  const stats = useMemo(() => {
    return {
      total: cases.length,
      needsReview: cases.filter((item) => item.status !== "Approved").length,
      highRisk: cases.filter((item) => item.risk === "High").length,
      approved: cases.filter((item) => item.status === "Approved").length,
    };
  }, [cases]);

  function useAnotherSample() {
    const nextIndex = (sampleIndex + 1) % sampleCases.length;
    setSampleIndex(nextIndex);
    setNewCaseText(sampleCases[nextIndex].text);
    setNotice(`Loaded sample: ${sampleCases[nextIndex].title}`);
  }

  function clearInput() {
    setNewCaseText("");
    setNotice("Case input cleared.");
  }

  function addCase() {
    if (!newCaseText.trim()) {
      setNotice("Paste or load a case before adding it to the queue.");
      return;
    }

    const newCase = createCaseFromText(newCaseText, sampleCases[sampleIndex].title);

    setCases((currentCases) => [newCase, ...currentCases]);
    setSelectedCaseId(newCase.id);
    setNotice("Case added to the review queue. Click View to inspect it.");
  }

  function approveCase(caseId: string) {
    setCases((currentCases) =>
      currentCases.map((item) => {
        if (item.id !== caseId) {
          return item;
        }

        return {
          ...item,
          status: "Approved",
          history: [
            ...item.history,
            `Human reviewer marked this demo case approved. (${getNow()})`,
          ],
        };
      }),
    );

    setNotice("Case marked approved. This only updates the browser demo queue.");
  }

  function openRequestMoreInfo(caseId: string) {
    setSelectedCaseId(caseId);
    setShowRequestBox(true);
    setRequestText("");
  }

  function saveRequestMoreInfo() {
    if (!selectedCase) {
      return;
    }

    if (!requestText.trim()) {
      setNotice("Type what information should be requested first.");
      return;
    }

    setCases((currentCases) =>
      currentCases.map((item) => {
        if (item.id !== selectedCase.id) {
          return item;
        }

        return {
          ...item,
          status: "More Info Requested",
          requestNotes: [...item.requestNotes, requestText.trim()],
          history: [
            ...item.history,
            `More information requested: ${requestText.trim()} (${getNow()})`,
          ],
        };
      }),
    );

    setShowRequestBox(false);
    setRequestText("");
    setNotice("Request saved on the case.");
  }

  function resetDemoData() {
    setCases(defaultCases);
    setSelectedCaseId(defaultCases[0].id);
    setSampleIndex(0);
    setNewCaseText(sampleCases[0].text);
    localStorage.setItem("arqivo-review-queue-cases", JSON.stringify(defaultCases));
    setNotice("Demo queue reset.");
  }

  return (
    <main className="min-h-screen bg-[#070b16] px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Human Review Workspace
            </p>

            <h1 className="text-5xl font-bold">Review Queue</h1>

            <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-400">
              Use this page to practice a human review workflow. Load or paste a
              case, add it to the queue, view the case details, approve it, or
              write a request for more information.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            className="rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold transition hover:bg-slate-600"
          >
            Reset Demo Data
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total Cases" value={stats.total.toString()} />
          <StatCard label="Need Review" value={stats.needsReview.toString()} />
          <StatCard label="High Risk" value={stats.highRisk.toString()} />
          <StatCard label="Approved" value={stats.approved.toString()} />
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-[#101827] p-6">
          <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-xl font-semibold">Add a Case to the Queue</h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                The box below starts with a fake sample case. You can edit it,
                paste your own fake case, use another sample, or clear it. Do
                not enter real private information.
              </p>
            </div>

            <div className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
              Current sample: {sampleCases[sampleIndex].title}
            </div>
          </div>

          <textarea
            value={newCaseText}
            onChange={(event) => setNewCaseText(event.target.value)}
            placeholder="Paste a fake case here..."
            className="h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#070b16] p-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addCase}
              className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-400"
            >
              Add to Queue
            </button>

            <button
              type="button"
              onClick={useAnotherSample}
              className="rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold transition hover:bg-slate-600"
            >
              Use Another Sample
            </button>

            <button
              type="button"
              onClick={clearInput}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/5"
            >
              Clear Input
            </button>
          </div>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-200">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            {cases.map((item) => {
              const isSelected = selectedCaseId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 transition ${
                    isSelected
                      ? "border-blue-400 bg-blue-500/10"
                      : "border-white/10 bg-[#101827]"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                          Risk:{" "}
                          <span className={getRiskStyle(item.risk)}>
                            {item.risk}
                          </span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCaseId(item.id);
                        setNotice(`Viewing ${item.title}.`);
                      }}
                      className="w-fit rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold transition hover:bg-blue-400"
                    >
                      View
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => approveCase(item.id)}
                      className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => openRequestMoreInfo(item.id)}
                      className="rounded-xl bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-500/30"
                    >
                      Request More Info
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101827] p-6">
            {selectedCase ? (
              <>
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                      Selected Case
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                      {selectedCase.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Added: {selectedCase.createdAt}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                      selectedCase.status,
                    )}`}
                  >
                    {selectedCase.status}
                  </span>
                </div>

                <DetailSection title="Case Text">
                  <p>{selectedCase.caseText}</p>
                </DetailSection>

                <div className="grid gap-4 md:grid-cols-2">
                  <DetailSection title="Included Documents">
                    {selectedCase.includedDocs.length ? (
                      <ul className="list-inside list-disc">
                        {selectedCase.includedDocs.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>None found from the text.</p>
                    )}
                  </DetailSection>

                  <DetailSection title="Missing Information">
                    {selectedCase.missingInfo.length ? (
                      <ul className="list-inside list-disc">
                        {selectedCase.missingInfo.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No missing information found from the text.</p>
                    )}
                  </DetailSection>
                </div>

                <DetailSection title="Recommended Action">
                  <p>{selectedCase.recommendedAction}</p>
                </DetailSection>

                <DetailSection title="Requests for More Info">
                  {selectedCase.requestNotes.length ? (
                    <ul className="list-inside list-disc">
                      {selectedCase.requestNotes.map((note, index) => (
                        <li key={`${selectedCase.id}-request-${index}`}>
                          {note}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No request notes yet.</p>
                  )}
                </DetailSection>

                <DetailSection title="Audit History">
                  <ol className="list-inside list-decimal space-y-1">
                    {selectedCase.history.map((entry, index) => (
                      <li key={`${selectedCase.id}-history-${index}`}>
                        {entry}
                      </li>
                    ))}
                  </ol>
                </DetailSection>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => approveCase(selectedCase.id)}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold transition hover:bg-emerald-500"
                  >
                    Approve Selected Case
                  </button>

                  <button
                    type="button"
                    onClick={() => openRequestMoreInfo(selectedCase.id)}
                    className="rounded-xl bg-yellow-600 px-5 py-3 text-sm font-semibold transition hover:bg-yellow-500"
                  >
                    Request More Info
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Select a case to view details.
              </p>
            )}
          </div>
        </div>

        {showRequestBox && selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#101827] p-6 shadow-2xl">
              <h2 className="text-2xl font-bold">Request More Information</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Write what the reviewer should ask for. This note will be saved
                on the selected demo case.
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-[#070b16] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                  Selected Case
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedCase.title}
                </p>
              </div>

              <textarea
                value={requestText}
                onChange={(event) => setRequestText(event.target.value)}
                placeholder="Example: Please provide proof of income and a recent rent statement."
                className="mt-4 h-32 w-full resize-none rounded-xl border border-white/10 bg-[#070b16] p-4 text-sm leading-6 text-slate-100 outline-none focus:border-blue-400"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestBox(false);
                    setRequestText("");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveRequestMoreInfo}
                  className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold transition hover:bg-blue-400"
                >
                  Save Request
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101827] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-blue-300">{value}</p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-[#070b16] p-5">
      <h3 className="mb-3 text-lg font-semibold text-blue-300">{title}</h3>
      <div className="space-y-2 text-sm leading-7 text-slate-300">
        {children}
      </div>
    </div>
  );
}