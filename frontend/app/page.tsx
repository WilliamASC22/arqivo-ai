"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  source?: string;
};

const sampleCase =
  "Maria submitted a request for rent assistance. She included her ID and proof of address, but did not include proof of income. Her deadline is May 30. She asked if her case can still be reviewed before the deadline.";

const quickPrompts = [
  "Summarize this case",
  "What information is missing?",
  "What is the risk level?",
  "What should the worker do next?",
  "Draft a response",
  "Generate a final report",
];

export default function Home() {
  const [caseText, setCaseText] = useState(sampleCase);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Arqivo AI. I can help you review the case text on the left. Ask me what is missing, what the risk is, what to do next, or ask me to draft a response.",
      source: "Arqivo AI",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(customText?: string) {
    const messageToSend = customText || input;

    if (!messageToSend.trim()) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: messageToSend,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          case_text: caseText,
          history: nextMessages.map((chatMessage) => ({
            role: chatMessage.role,
            content: chatMessage.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            data.reply ||
            data.answer ||
            "I received the request, but I could not generate a response.",
          source: data.source || "Arqivo AI",
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "I could not connect to the backend. Make sure the FastAPI server is running and NEXT_PUBLIC_API_URL is correct.",
          source: "Connection Error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl gap-6 px-6 py-6">
        <aside className="hidden w-[390px] shrink-0 flex-col rounded-3xl border border-white/10 bg-[#101827] shadow-2xl lg:flex">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Case Workspace
            </p>

            <h1 className="mt-2 text-2xl font-bold">Document Context</h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Paste demo case text here. Do not enter private or sensitive
              information.
            </p>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <textarea
              value={caseText}
              onChange={(event) => setCaseText(event.target.value)}
              className="min-h-[430px] flex-1 resize-none rounded-2xl border border-white/10 bg-[#070b16] p-4 text-sm leading-7 text-slate-100 outline-none transition focus:border-blue-400"
            />

            <button
              onClick={() => setCaseText(sampleCase)}
              className="mt-4 rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold transition hover:bg-slate-600"
            >
              Reset Sample Case
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101827] shadow-2xl">
          <header className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                  Professional Case Assistant
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Chat with Arqivo AI
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Ask natural questions. Arqivo can review the case, explain
                  risks, plan next steps, and draft responses.
                </p>
              </div>

              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                ● Chat mode
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-400 hover:bg-blue-500/10 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-4xl space-y-5">
              {messages.map((chatMessage, index) => (
                <div
                  key={`${chatMessage.role}-${index}`}
                  className={`flex ${
                    chatMessage.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-7 shadow-lg ${
                      chatMessage.role === "user"
                        ? "bg-blue-500 text-white"
                        : "border border-white/10 bg-[#1b2638] text-slate-100"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {chatMessage.content}
                    </div>

                    {chatMessage.role === "assistant" &&
                      chatMessage.source && (
                        <p className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                          {chatMessage.source}
                        </p>
                      )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-3xl border border-white/10 bg-[#1b2638] px-5 py-4 text-sm text-slate-300">
                    Arqivo AI is thinking...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-5">
            <div className="mx-auto flex max-w-4xl gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Message Arqivo AI..."
                className="flex-1 rounded-2xl border border-white/10 bg-[#070b16] px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-2xl bg-blue-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}