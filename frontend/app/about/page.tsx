export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
          About
        </p>

        <h1 className="mb-6 text-4xl font-bold">About Arqivo AI</h1>

        <p className="mb-4 leading-7 text-slate-300">
          Arqivo AI is a public case-assistant demo that helps users turn messy
          case notes, emails, requests, and document text into organized
          summaries, missing-information checks, risk explanations, next-step
          plans, draft responses, and review-ready reports.
        </p>

        <p className="mb-4 leading-7 text-slate-300">
          The project is designed as a human-in-the-loop assistant. It does not
          make final decisions automatically, and it should not be treated as
          legal, medical, financial, government, or professional advice. Instead,
          it helps a person review information faster and more consistently.
        </p>

        <p className="mb-4 leading-7 text-slate-300">
          The main chat page uses Cloudflare Workers AI to process demo case
          text and answer natural questions. The app does not store the case
          text in an Arqivo AI database, and the workspace resets on refresh.
          Users should still avoid entering real private or sensitive
          information because the text is sent to Cloudflare Workers AI for
          processing.
        </p>

        <p className="mb-4 leading-7 text-slate-300">
          Arqivo AI also includes an agent demo backed by FastAPI and Hugging
          Face Spaces. That demo shows the structured workflow behind the app:
          intake, summarization, missing-information detection, risk review,
          planning, drafting, review queue support, and audit-style outputs.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-3 text-xl font-semibold">Current Architecture</h2>

          <ul className="space-y-2 text-slate-300">
            <li>Frontend: Next.js, TypeScript, and Tailwind CSS</li>
            <li>Main Chat: Cloudflare Worker with Cloudflare Workers AI</li>
            <li>Agent Demo Backend: FastAPI hosted on Hugging Face Spaces</li>
            <li>Deployment: Vercel, Cloudflare Workers, and Hugging Face Spaces</li>
            <li>Safety: no Arqivo AI database storage for user-entered case text</li>
          </ul>
        </div>
      </section>
    </main>
  );
}