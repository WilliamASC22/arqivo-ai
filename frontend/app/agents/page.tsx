const agents = [
  {
    name: "Safety Agent",
    type: "Safety Check",
    description:
      "Checks for possible private or sensitive information before the case is reviewed.",
  },
  {
    name: "Intake Agent",
    type: "Case Understanding",
    description:
      "Finds the case type, important dates, keywords, and main request.",
  },
  {
    name: "Summary Agent",
    type: "Case Understanding",
    description:
      "Creates a simple plain-English summary so the case is easier to understand.",
  },
  {
    name: "Missing Information Agent",
    type: "Document Review",
    description:
      "Checks whether required information or required documents are missing.",
  },
  {
    name: "Document Agent",
    type: "Document Review",
    description:
      "Compares included documents against the documents needed for review.",
  },
  {
    name: "Deadline Agent",
    type: "Time Review",
    description:
      "Looks for deadlines, due dates, notice periods, and time-sensitive language.",
  },
  {
    name: "Risk Agent",
    type: "Risk Review",
    description:
      "Scores the case based on missing information, deadlines, urgency, and suspicious text.",
  },
  {
    name: "Eligibility Agent",
    type: "Readiness Review",
    description:
      "Estimates whether the case may be ready for review or still incomplete.",
  },
  {
    name: "Priority Agent",
    type: "Readiness Review",
    description:
      "Helps decide whether the case should be handled normally or reviewed quickly.",
  },
  {
    name: "Planner Agent",
    type: "Next Steps",
    description:
      "Creates recommended next steps for a human reviewer or case team.",
  },
  {
    name: "Message Agent",
    type: "Communication",
    description:
      "Drafts a response message that a person can review and edit before using.",
  },
  {
    name: "Tone Agent",
    type: "Communication",
    description:
      "Checks that the draft response sounds clear, respectful, and professional.",
  },
  {
    name: "Quality Agent",
    type: "Final Review",
    description:
      "Reviews the output and warns when the case should be checked by a human before action.",
  },
  {
    name: "Audit Log Agent",
    type: "Final Review",
    description:
      "Creates a simple record of what the system checked during the workflow.",
  },
];

const pipelineSteps = [
  "Input Text",
  "Safety Agent",
  "Intake Agent",
  "Summary Agent",
  "Missing Information Agent",
  "Document Agent",
  "Deadline Agent",
  "Risk Agent",
  "Eligibility Agent",
  "Priority Agent",
  "Planner Agent",
  "Message Agent",
  "Tone Agent",
  "Quality Agent",
  "Audit Log Agent",
  "Final Report",
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Multi-Agent Workflow
          </p>

          <h1 className="mb-4 text-5xl font-bold">AI Agents</h1>

          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            Arqivo AI uses focused agents and checks to turn messy case text into
            a clearer summary, missing-information review, risk explanation,
            next-step plan, draft response, and audit log.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
          <h2 className="mb-3 text-2xl font-semibold text-blue-300">
            How the agents work together
          </h2>

          <p className="max-w-4xl text-sm leading-7 text-slate-300">
            Each agent checks one part of the case. The final output is not an
            automatic decision. It is a review-ready result that a human can
            inspect, edit, and approve before using.
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-blue-300">
            Agent Pipeline
          </h2>

          <div className="flex flex-wrap gap-2">
            {pipelineSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  {step}
                </span>

                {index < pipelineSteps.length - 1 && (
                  <span className="text-slate-500">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {agent.type}
              </p>

              <h2 className="mb-3 text-xl font-semibold text-blue-300">
                {agent.name}
              </h2>

              <p className="text-sm leading-7 text-slate-300">
                {agent.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-300">
              Main Chat Page
            </h2>

            <p className="text-sm leading-7 text-slate-300">
              The main chat page uses Cloudflare Workers AI. It explains and
              applies the agent workflow in a conversational way.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-300">
              Agent Demo Page
            </h2>

            <p className="text-sm leading-7 text-slate-300">
              The Agent Demo page uses the FastAPI backend to run the structured
              Python agent pipeline and show separate result cards.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}