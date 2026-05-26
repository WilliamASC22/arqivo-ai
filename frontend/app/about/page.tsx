export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold">About Arqivo AI</h1>

        <p className="mb-4 text-slate-300">
          Arqivo AI is a public multi-agent workflow demo that helps users turn
          messy case notes and documents into organized summaries, risk flags,
          missing-information checks, next-step plans, and draft responses.
        </p>

        <p className="mb-4 text-slate-300">
          The project is designed as a human-in-the-loop assistant. It does not
          make final decisions automatically. Instead, it helps a person review
          information faster and more consistently.
        </p>

        <p className="text-slate-300">
          This demo uses a free-safe architecture with a Next.js frontend,
          FastAPI backend, Hugging Face Spaces hosting, and rule-based AI agents
          with optional local LLM support.
        </p>
      </section>
    </main>
  );
}