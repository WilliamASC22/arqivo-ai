"use client";

import { useEffect, useState } from "react";

type CaseItem = {
  id: string;
  title: string;
  description: string;
  status: "Needs Review" | "Missing Info" | "High Priority" | "Resolved";
  risk: "Low" | "Medium" | "High";
  createdAt: number;
  notes: string[];
};

const defaultCases: CaseItem[] = [
  {
    id: "1",
    title: "Maria R.",
    description: "Rent assistance request",
    status: "Missing Info",
    risk: "Medium",
    createdAt: Date.now(),
    notes: [],
  },
  {
    id: "2",
    title: "Student Advising Case",
    description: "Graduation planning support",
    status: "Needs Review",
    risk: "Low",
    createdAt: Date.now(),
    notes: [],
  },
  {
    id: "3",
    title: "Customer Refund Case",
    description: "Duplicate charge complaint",
    status: "High Priority",
    risk: "High",
    createdAt: Date.now(),
    notes: [],
  },
];

export default function ReviewQueuePage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [newCaseText, setNewCaseText] = useState("");
  const [requestText, setRequestText] = useState("");

  const [showRequestBox, setShowRequestBox] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("arqivo_cases");

    if (stored) {
      setCases(JSON.parse(stored));
    } else {
      setCases(defaultCases);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("arqivo_cases", JSON.stringify(cases));
  }, [cases]);

  function addCase() {
    if (!newCaseText.trim()) return;

    const newCase: CaseItem = {
      id: crypto.randomUUID(),
      title: "User Submitted Case",
      description: newCaseText,
      status: "Needs Review",
      risk: "Low",
      createdAt: Date.now(),
      notes: [],
    };

    setCases((prev) => [newCase, ...prev]);
    setNewCaseText("");
  }

  function approveCase(id: string) {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "Resolved" } : c
      )
    );
    setSelectedCase(null);
  }

  function requestMoreInfo(id: string) {
    if (!requestText.trim()) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Missing Info",
              notes: [...c.notes, requestText],
            }
          : c
      )
    );

    setRequestText("");
    setShowRequestBox(false);
  }

  return (
    <main className="min-h-screen bg-[#070b16] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Review Queue</h1>

        <p className="mt-2 text-sm text-slate-400">
          Submit cases, review AI outputs, and manage workflow actions.
        </p>

        {/* ADD CASE */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#101827] p-4">
          <h2 className="text-sm font-semibold text-slate-200">
            Add New Case
          </h2>

          <textarea
            value={newCaseText}
            onChange={(e) => setNewCaseText(e.target.value)}
            placeholder="Paste a case here..."
            className="mt-3 h-28 w-full rounded-xl border border-white/10 bg-[#070b16] p-3 text-sm text-white outline-none"
          />

          <button
            onClick={addCase}
            className="mt-3 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold"
          >
            Add to Queue
          </button>
        </div>

        {/* CASE LIST */}
        <div className="mt-8 space-y-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-[#101827] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="text-sm text-slate-400">{c.description}</p>

                  <div className="mt-2 flex gap-3 text-xs text-slate-400">
                    <span>Status: {c.status}</span>
                    <span>Risk: {c.risk}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCase(c)}
                  className="rounded-lg bg-blue-500 px-3 py-1 text-sm"
                >
                  View
                </button>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => approveCase(c.id)}
                  className="rounded-lg bg-green-500/20 px-3 py-1 text-sm text-green-300"
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    setSelectedCase(c);
                    setShowRequestBox(true);
                  }}
                  className="rounded-lg bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300"
                >
                  Request More Info
                </button>
              </div>

              {/* NOTES */}
              {c.notes.length > 0 && (
                <div className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">
                    Requests:
                  </p>
                  {c.notes.map((n, i) => (
                    <p key={i}>• {n}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedCase && showRequestBox && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70">
            <div className="w-[500px] rounded-2xl bg-[#101827] p-5">
              <h2 className="text-lg font-semibold">
                Request More Info
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                For: {selectedCase.title}
              </p>

              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="What information is missing?"
                className="mt-4 h-24 w-full rounded-xl border border-white/10 bg-[#070b16] p-3 text-sm"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowRequestBox(false)}
                  className="rounded-lg px-3 py-1 text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={() => requestMoreInfo(selectedCase.id)}
                  className="rounded-lg bg-blue-500 px-3 py-1 text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}