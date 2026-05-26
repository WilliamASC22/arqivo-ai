export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold">System Architecture</h1>

        <div className="space-y-4 text-slate-300">
          <p>
            Arqivo AI uses a public Next.js frontend deployed on Vercel and a
            FastAPI backend deployed on Hugging Face Spaces.
          </p>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-300">
              Frontend
            </h2>
            <p>
              Next.js, TypeScript, and Tailwind CSS provide the user interface,
              demo form, result cards, and product pages.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-300">
              Backend
            </h2>
            <p>
              FastAPI exposes endpoints for sample cases and multi-agent
              analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-300">
              Agent Layer
            </h2>
            <p>
              Specialized agents handle intake, summarization, missing
              information checks, risk analysis, planning, drafting, and quality
              review.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-300">
              Free-Safe Design
            </h2>
            <p>
              The public demo avoids paid AI APIs and paid cloud resources. It
              can run with rule-based agents publicly and optional local LLMs for
              private demos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}