const agents = [
  ["Intake Agent", "Extracts case type, dates, keywords, and important details."],
  ["Summary Agent", "Creates a plain-English summary of the case."],
  ["Missing Information Agent", "Checks whether required information is missing."],
  ["Risk Agent", "Flags deadlines, missing documents, urgent language, and suspicious instructions."],
  ["Planner Agent", "Creates recommended next steps for the user."],
  ["Message Agent", "Drafts a response that a human can review before using."],
  ["Quality Agent", "Reviews the output and warns when the case needs human review."],
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-4xl font-bold">AI Agents</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {agents.map(([name, description]) => (
            <div
              key={name}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="mb-2 text-xl font-semibold text-blue-300">
                {name}
              </h2>
              <p className="text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}