"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  source?: string;
};

const sampleCase = `Maria submitted a request for rent assistance. She included her ID and proof of address, but did not include proof of income. Her deadline is May 30. She asked if her case can still be reviewed before the deadline.`;

const suggestedQuestions = [
  "Summarize this case",
  "What information is missing?",
  "What is the risk level?",
  "What should I do next?",
  "Draft a response",
  "Generate a final report",
];

export default function ChatHomePage() {
  const [caseText, setCaseText] = useState(sampleCase);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Arqivo AI. Paste a case note or document text, then ask me to summarize it, find missing information, check risk, plan next steps, or draft a response.",
      source: "Arqivo AI",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(customMessage?: string) {
    const finalMessage = customMessage || message;

    if (!finalMessage.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: finalMessage,
    };

    setChat((previous) => [...previous, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: finalMessage,
          case_text: caseText,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
        source: data.source,
      };

      setChat((previous) => [...previous, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I could not reach the Arqivo AI backend. Make sure your FastAPI server is running.",
        source: "System",
      };

      setChat((previous) => [...previous, errorMessage]);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">
            Multi-Agent AI Chatbot
          </p>

          <h1 className="mb-4 text-5xl font-bold">Arqivo AI</h1>

          <p className="max-w-3xl text-lg text-slate-300">
            Chat with a multi-agent assistant that can summarize case notes,
            find missing information, check risks, create next steps, draft
            responses, and generate review-ready reports.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-3 text-2xl font-semibold">
              Case or Document Text
            </h2>

            <p className="mb-4 text-sm text-slate-400">
              Paste fake demo text here. Do not enter private or sensitive
              information.
            </p>

            <textarea
              className="h-[420px] w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-blue-400"
              value={caseText}
              onChange={(event) => setCaseText(event.target.value)}
            />

            <button
              onClick={() => setCaseText(sampleCase)}
              className="mt-4 rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
            >
              Reset Sample Case
            </button>
          </aside>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="border-b border-slate-800 p-6">
              <h2 className="text-2xl font-semibold">Chat with Arqivo AI</h2>

              <p className="mt-1 text-sm text-slate-400">
                Ask questions about the case text using the buttons below or
                type your own.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-blue-400 hover:text-white"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[460px] space-y-4 overflow-y-auto p-6">
              {chat.map((item, index) => (
                <div
                  key={index}
                  className={
                    item.role === "user"
                      ? "ml-auto max-w-[80%] rounded-2xl bg-blue-500 p-4 text-white"
                      : "mr-auto max-w-[80%] rounded-2xl bg-slate-800 p-4 text-slate-100"
                  }
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
                    {item.content}
                  </pre>

                  {item.source && (
                    <p className="mt-3 text-xs text-slate-400">
                      Source: {item.source}
                    </p>
                  )}
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-[80%] rounded-2xl bg-slate-800 p-4 text-sm text-slate-300">
                  Arqivo AI is thinking...
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 p-4">
              <div className="flex gap-3">
                <input
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Ask Arqivo AI a question..."
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={loading}
                  className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}