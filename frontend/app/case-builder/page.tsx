"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CaseType =
  | "Housing"
  | "Student"
  | "Refund"
  | "Benefits"
  | "Documents"
  | "General";

type SampleCase = {
  label: string;
  caseType: CaseType;
  person: string;
  deadline: string;
  caseText: string;
  includedDocs: string;
  missingInfo: string;
  mainRequest: string;
};

const sampleCases: SampleCase[] = [
  {
    label: "Rent Assistance",
    caseType: "Housing",
    person: "Tenant",
    deadline: "June 15",
    caseText:
      "A tenant submitted a request for emergency rent assistance. They included a lease and proof of address, but did not include proof of income or a recent rent statement. The deadline is June 15, and they asked whether their case can still be reviewed before the notice period ends.",
    includedDocs: "Lease, proof of address",
    missingInfo: "Proof of income, recent rent statement",
    mainRequest: "Review whether the rent assistance request can continue before the deadline.",
  },
  {
    label: "Student Appeal",
    caseType: "Student",
    person: "Student",
    deadline: "July 3",
    caseText:
      "A student submitted an appeal asking for additional time to complete required documents. They included a student ID and course schedule, but did not include the requested explanation letter. The deadline is July 3, and they asked what they should submit next.",
    includedDocs: "Student ID, course schedule",
    missingInfo: "Explanation letter",
    mainRequest: "Explain what the student should submit next.",
  },
  {
    label: "Refund Review",
    caseType: "Refund",
    person: "Customer",
    deadline: "As soon as possible",
    caseText:
      "A customer says they were charged twice for the same order. They included the order number but did not include a receipt or bank statement. They want the issue resolved as soon as possible.",
    includedDocs: "Order number",
    missingInfo: "Receipt, bank statement",
    mainRequest: "Review the duplicate charge complaint and identify what is needed.",
  },
  {
    label: "Benefits Renewal",
    caseType: "Benefits",
    person: "Applicant",
    deadline: "June 28",
    caseText:
      "A family submitted a benefits renewal request. They included identification and proof of residency, but the income section is incomplete. The renewal deadline is June 28, and they asked whether missing documents will delay the review.",
    includedDocs: "Identification, proof of residency",
    missingInfo: "Income information",
    mainRequest: "Check whether missing income information will delay the renewal review.",
  },
  {
    label: "Missing Paperwork",
    caseType: "Documents",
    person: "Applicant",
    deadline: "Not listed",
    caseText:
      "An applicant submitted a support request after receiving a notice about missing paperwork. They included the notice and a short explanation, but did not include the requested verification document. They asked what the next step should be.",
    includedDocs: "Notice, short explanation",
    missingInfo: "Verification document",
    mainRequest: "Explain what document is still needed and what the next step should be.",
  },
];

const caseTypes: CaseType[] = [
  "Housing",
  "Student",
  "Refund",
  "Benefits",
  "Documents",
  "General",
];

function splitList(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CaseBuilderPage() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [caseType, setCaseType] = useState<CaseType>(sampleCases[0].caseType);
  const [person, setPerson] = useState(sampleCases[0].person);
  const [deadline, setDeadline] = useState(sampleCases[0].deadline);
  const [mainRequest, setMainRequest] = useState(sampleCases[0].mainRequest);
  const [caseText, setCaseText] = useState(sampleCases[0].caseText);
  const [includedDocs, setIncludedDocs] = useState(sampleCases[0].includedDocs);
  const [missingInfo, setMissingInfo] = useState(sampleCases[0].missingInfo);
  const [copied, setCopied] = useState(false);

  const casePacket = useMemo(() => {
    const included = splitList(includedDocs);
    const missing = splitList(missingInfo);

    return (
      "CASE PACKET\n\n" +
      `Case Type: ${caseType}\n` +
      `Person / Role: ${person || "Not listed"}\n` +
      `Deadline: ${deadline || "Not listed"}\n\n` +
      "Main Request:\n" +
      `${mainRequest || "Not listed"}\n\n` +
      "Case Text:\n" +
      `${caseText || "No case text entered."}\n\n` +
      "Included Documents:\n" +
      `${included.length ? included.map((item) => `- ${item}`).join("\n") : "- None listed"}\n\n` +
      "Missing Information:\n" +
      `${missing.length ? missing.map((item) => `- ${item}`).join("\n") : "- None listed"}\n\n` +
      "Suggested AI Tasks:\n" +
      "- Summarize the case.\n" +
      "- Identify missing information.\n" +
      "- Explain risk level.\n" +
      "- Recommend next steps.\n" +
      "- Draft a response.\n" +
      "- Generate a final report.\n\n" +
      "Human Review Reminder:\n" +
      "A person should review the AI output before anyone uses it."
    );
  }, [caseType, person, deadline, mainRequest, caseText, includedDocs, missingInfo]);

  function loadSample(index: number) {
    const sample = sampleCases[index];

    setSampleIndex(index);
    setCaseType(sample.caseType);
    setPerson(sample.person);
    setDeadline(sample.deadline);
    setMainRequest(sample.mainRequest);
    setCaseText(sample.caseText);
    setIncludedDocs(sample.includedDocs);
    setMissingInfo(sample.missingInfo);
    setCopied(false);
  }

  function useAnotherSample() {
    const nextIndex = (sampleIndex + 1) % sampleCases.length;
    loadSample(nextIndex);
  }

  function clearBuilder() {
    setCaseType("General");
    setPerson("");
    setDeadline("");
    setMainRequest("");
    setCaseText("");
    setIncludedDocs("");
    setMissingInfo("");
    setCopied(false);
  }

  async function copyPacket() {
    try {
      await navigator.clipboard.writeText(casePacket);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b16] px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Case Preparation Workspace
          </p>

          <h1 className="text-5xl font-bold">Case Builder</h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-400">
            Build a clean demo case before sending it to Arqivo AI. Choose a
            sample, edit the details, mark what is included, list what is
            missing, then copy the finished case packet into Chat or the Agent
            Demo.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
          <h2 className="mb-2 text-xl font-semibold text-blue-300">
            How to use this page
          </h2>

          <p className="text-sm leading-7 text-slate-300">
            This page does not make a final decision. It helps you organize fake
            case text into a clear packet so the AI can give better summaries,
            missing-information checks, risk explanations, next steps, drafts,
            and reports.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[#101827] p-6 shadow-xl">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="text-2xl font-semibold">Build the Case</h2>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Start with a sample or type your own fake case. Do not enter
                  real private information.
                </p>
              </div>

              <span className="w-fit rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
                Current sample: {sampleCases[sampleIndex].label}
              </span>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {sampleCases.map((sample, index) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => loadSample(index)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    sampleIndex === index
                      ? "border-blue-400 bg-blue-500 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-400 hover:bg-blue-500/10"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-300">
                Case Type
                <select
                  value={caseType}
                  onChange={(event) => setCaseType(event.target.value as CaseType)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b16] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
                >
                  {caseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-300">
                Person / Role
                <input
                  value={person}
                  onChange={(event) => setPerson(event.target.value)}
                  placeholder="Example: tenant, student, applicant"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b16] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                />
              </label>

              <label className="text-sm font-semibold text-slate-300">
                Deadline
                <input
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  placeholder="Example: June 15"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b16] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                />
              </label>

              <label className="text-sm font-semibold text-slate-300">
                Main Request
                <input
                  value={mainRequest}
                  onChange={(event) => setMainRequest(event.target.value)}
                  placeholder="What does the person need?"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b16] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                />
              </label>
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-300">
              Case Text
              <textarea
                value={caseText}
                onChange={(event) => setCaseText(event.target.value)}
                placeholder="Paste or write fake case text here..."
                className="mt-2 h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#070b16] p-4 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-400"
              />
            </label>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-300">
                Included Documents
                <textarea
                  value={includedDocs}
                  onChange={(event) => setIncludedDocs(event.target.value)}
                  placeholder="Example: ID, lease, proof of address"
                  className="mt-2 h-28 w-full resize-none rounded-xl border border-white/10 bg-[#070b16] p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Separate items with commas.
                </span>
              </label>

              <label className="text-sm font-semibold text-slate-300">
                Missing Information
                <textarea
                  value={missingInfo}
                  onChange={(event) => setMissingInfo(event.target.value)}
                  placeholder="Example: proof of income, explanation letter"
                  className="mt-2 h-28 w-full resize-none rounded-xl border border-white/10 bg-[#070b16] p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Separate items with commas.
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={useAnotherSample}
                className="rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold transition hover:bg-slate-600"
              >
                Use Another Sample
              </button>

              <button
                type="button"
                onClick={clearBuilder}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Clear Builder
              </button>

              <button
                type="button"
                onClick={copyPacket}
                className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-400"
              >
                Copy Case Packet
              </button>
            </div>

            {copied && (
              <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                Case packet copied. You can paste it into Chat or the Agent Demo.
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#101827] p-6 shadow-xl">
              <h2 className="text-2xl font-semibold">Generated Case Packet</h2>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                This is the clean version you can copy into Arqivo AI.
              </p>

              <pre className="mt-4 max-h-[620px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#070b16] p-5 text-sm leading-7 text-slate-200">
                {casePacket}
              </pre>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101827] p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-blue-300">
                Next Step
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                Copy the case packet, then open Chat for a conversational answer
                or Agent Demo for structured result cards.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-400"
                >
                  Open Chat
                </Link>

                <Link
                  href="/demo"
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/5"
                >
                  Open Agent Demo
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-6">
              <h2 className="text-xl font-semibold text-yellow-200">
                Safety Reminder
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                Use fake demo text or placeholders. Do not enter real names,
                addresses, phone numbers, emails, ID numbers, medical details,
                financial details, or confidential case information.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}