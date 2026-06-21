const architectureCards = [
  {
    title: "Frontend",
    subtitle: "Next.js, TypeScript, Tailwind CSS, and Vercel",
    description:
      "The frontend provides the public chat page, editable case workspace, agent demo page, result cards, navigation pages, and safety reminders.",
  },
  {
    title: "Main Chat System",
    subtitle: "Cloudflare Worker and Cloudflare Workers AI",
    description:
      "The main chat page sends user questions and fake case text to a Cloudflare Worker. The Worker calls Cloudflare Workers AI and returns a conversational response.",
  },
  {
    title: "Structured Agent Demo",
    subtitle: "FastAPI, Python, and Hugging Face Spaces",
    description:
      "The Agent Demo page sends case text to the FastAPI backend. The backend runs the structured Python agent pipeline and returns organized result sections.",
  },
  {
    title: "Agent Layer",
    subtitle: "Focused case-review agents",
    description:
      "The agent layer includes safety, intake, summary, missing information, document, deadline, risk, eligibility, priority, planning, message, tone, quality, and audit log agents.",
  },
  {
    title: "Human-in-the-Loop Design",
    subtitle: "AI support, not automatic decisions",
    description:
      "Arqivo AI organizes information and drafts review-ready outputs, but a person must review and approve the result before using it.",
  },
  {
    title: "Safety-Aware Demo Design",
    subtitle: "Public demo with privacy reminders",
    description:
      "The app reminds users not to enter real private information. The workspace uses browser state and clears on refresh or when the user clears it.",
  },
];

const mainChatFlow = [
  "User enters fake case text",
  "Vercel frontend sends request",
  "Cloudflare Worker receives request",
  "Cloudflare Workers AI generates response",
  "Response appears in chat",
];

const agentDemoFlow = [
  "User selects or edits fake sample case",
  "Vercel frontend sends text to FastAPI",
  "FastAPI runs structured Python agents",
  "Agents create checks and report sections",
  "Frontend displays result cards and audit log",
];

const structuredPipeline = [
  "Safety",
  "Intake",
  "Summary",
  "Missing Info",
  "Document",
  "Deadline",
  "Risk",
  "Eligibility",
  "Priority",
  "Planner",
  "Message",
  "Tone",
  "Quality",
  "Audit Log",
  "Final Report",
];

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            System Design
          </p>

          <h1 className="mb-4 text-5xl font-bold">System Architecture</h1>

          <p className="max-w-4xl text-lg leading-8 text-slate-300">
            Arqivo AI uses a Vercel-hosted Next.js frontend, a Cloudflare Worker
            with Cloudflare Workers AI for the main chat, and a FastAPI backend
            for the structured agent demo.
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {architectureCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
              <h2 className="mb-2 text-xl font-semibold text-blue-300">
                {card.title}
              </h2>

              <p className="mb-3 text-sm font-semibold text-slate-400">
                {card.subtitle}
              </p>

              <p className="text-sm leading-7 text-slate-300">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <FlowCard title="Main Chat Flow" steps={mainChatFlow} />

          <FlowCard title="Agent Demo Flow" steps={agentDemoFlow} />
        </div>

        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-semibold text-blue-300">
            Structured Agent Pipeline
          </h2>

          <p className="mb-5 max-w-4xl text-sm leading-7 text-slate-300">
            The structured demo breaks the review into smaller checks. This
            makes the output easier to inspect and helps show how the final
            report was created.
          </p>

          <div className="flex flex-wrap gap-2">
            {structuredPipeline.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  {step}
                </span>

                {index < structuredPipeline.length - 1 && (
                  <span className="text-slate-500">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
            <h2 className="mb-3 text-xl font-semibold text-emerald-300">
              Frontend Deployment
            </h2>

            <p className="text-sm leading-7 text-slate-300">
              Vercel hosts the Next.js app and updates the public website when
              frontend files are pushed.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-300">
              Chat Deployment
            </h2>

            <p className="text-sm leading-7 text-slate-300">
              Cloudflare Workers host the chat endpoint and connect it to
              Cloudflare Workers AI.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6">
            <h2 className="mb-3 text-xl font-semibold text-purple-300">
              Agent Demo Deployment
            </h2>

            <p className="text-sm leading-7 text-slate-300">
              Hugging Face Spaces hosts the FastAPI backend for the structured
              agent demo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function FlowCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-2xl font-semibold text-blue-300">{title}</h2>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-7 text-slate-300">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {index + 1}
            </span>

            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}