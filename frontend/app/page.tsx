"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  source?: string;
};

const sampleCases = [
  "A tenant submitted a request for emergency rent assistance. They included a lease and proof of address, but did not include proof of income or a recent rent statement. The deadline is June 15, and they asked whether their case can still be reviewed before the notice period ends.",
  "A student submitted an appeal asking for additional time to complete required documents. They included a student ID and course schedule, but did not include the requested explanation letter. The deadline is July 3, and they asked what they should submit next.",
  "A client requested help updating an application after moving to a new apartment. They included a new lease but did not include proof that the previous address is no longer active. They asked whether the application can continue while the address update is reviewed.",
  "A family submitted a benefits renewal request. They included identification and proof of residency, but the income section is incomplete. The renewal deadline is June 28, and they asked whether missing documents will delay the review.",
  "An applicant submitted a support request after receiving a notice about missing paperwork. They included the notice and a short explanation, but did not include the requested verification document. They asked what the next step should be.",
];

const quickPrompts = [
  "Summarize this case",
  "What information is missing?",
  "What is the risk level?",
  "Recommend next steps",
  "Draft a response",
  "Generate a final report",
  "Which agents are being used?",
];

const sensitivePatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b\d{9}\b/,
  /\b\d{16}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
];

const welcomeMessage =
  "Hi, I’m Arqivo.\n\n" +
  "What is a case?\n" +
  "A case is text that needs review, like a request, email, note, application, or document.\n\n" +
  "What can I do?\n" +
  "I can summarize it, find missing information, explain risk, recommend next steps, draft a response, or make a report.\n\n" +
  "How to use me:\n" +
  "1. Put a case, email, note, or document in the box on the left.\n" +
  "2. Check the safety box to confirm you are not entering private information.\n" +
  "3. Choose what you need: summary, missing info, risk, next steps, draft, or report.\n" +
  "4. Arqivo will give you an organized answer based only on the text you entered.\n" +
  "5. Review the answer. A real person must approve it before anyone uses it.";

function hasPossibleSensitiveInfo(text: string) {
  return sensitivePatterns.some((pattern) => pattern.test(text));
}

function limitText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
}

export default function Home() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [caseText, setCaseText] = useState(sampleCases[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const chatApiUrl =
    process.env.NEXT_PUBLIC_CHAT_API_URL ||
    "https://arqivo-ai-chat.williab.workers.dev";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: welcomeMessage,
      source: "Arqivo AI",
    },
  ]);

  const possibleSensitiveInfo = hasPossibleSensitiveInfo(caseText);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(customText?: string) {
    const messageToSend = customText || input;

    if (!messageToSend.trim()) {
      return;
    }

    if (!privacyAccepted) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "Please check the safety box on the left first. This means you understand not to enter private real information.",
          source: "Safety Check",
        },
      ]);

      return;
    }

    if (possibleSensitiveInfo) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "This text may contain private information. Please remove real names, emails, phone numbers, ID numbers, or other private details before sending.",
          source: "Safety Check",
        },
      ]);

      return;
    }

    const trimmedCaseText = limitText(caseText, 4000);

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

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(`${chatApiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: messageToSend,
          case_text: trimmedCaseText,
          history: nextMessages.slice(-6).map((chatMessage) => ({
            role: chatMessage.role,
            content: limitText(chatMessage.content, 800),
          })),
        }),
      });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "I could not connect to Cloudflare Workers AI right now. The free daily limit may have been reached, or the chat endpoint may be unavailable.",
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

  function clearWorkspace() {
    setCaseText("");
    setInput("");
    setMessages([
      {
        role: "assistant",
        content:
          "Workspace cleared.\n\n" +
          "To start again:\n" +
          "1. Paste a case, email, note, or document in the box on the left.\n" +
          "2. Check the safety box.\n" +
          "3. Choose what you need: summary, missing info, risk, next steps, draft, or report.",
        source: "Arqivo AI",
      },
    ]);
  }

  function useAnotherSample() {
    const nextIndex = (sampleIndex + 1) % sampleCases.length;

    setSampleIndex(nextIndex);
    setCaseText(sampleCases[nextIndex]);
    setMessages([
      {
        role: "assistant",
        content:
          "A new sample is ready.\n\n" +
          "To use it:\n" +
          "1. Read the sample text on the left.\n" +
          "2. Check the safety box.\n" +
          "3. Choose what you need: summary, missing info, risk, next steps, draft, or report.",
        source: "Arqivo AI",
      },
    ]);
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl gap-6 px-6 py-6">
        <aside className="hidden w-[410px] shrink-0 flex-col rounded-3xl border border-white/10 bg-[#101827] shadow-2xl lg:flex">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Case Workspace
            </p>

            <h1 className="mt-2 text-2xl font-bold">Enter Case Text</h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Paste a request, application, email, note, or document. Arqivo AI
              does not store your text, and the workspace clears on refresh.
            </p>
          </div>

          <div className="border-b border-white/10 bg-blue-500/10 p-5">
            <p className="text-sm font-semibold text-blue-200">
              Safety Reminder
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Do not enter real names, addresses, ID numbers, phone numbers,
              emails, medical details, financial details, or other private
              information. Use fake demo text or placeholders.
            </p>

            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-300">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                className="mt-1 h-4 w-4"
              />

              <span>
                I understand this is a public demo and I will not enter private
                or sensitive real information.
              </span>
            </label>
          </div>

          <div className="flex flex-1 flex-col p-5">
            {possibleSensitiveInfo && (
              <div className="mb-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-100">
                Possible sensitive information detected. Please replace real
                private details with fake placeholders before sending.
              </div>
            )}

            <textarea
              value={caseText}
              onChange={(event) => setCaseText(event.target.value)}
              placeholder="Paste demo case text here..."
              className="min-h-[390px] flex-1 resize-none rounded-2xl border border-white/10 bg-[#070b16] p-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400"
            />

            <p className="mt-3 text-xs text-slate-500">
              To save free AI usage, only the first 4,000 characters are sent.
              Current length: {caseText.length} characters.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={useAnotherSample}
                className="rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold transition hover:bg-slate-600"
              >
                Use Another Sample
              </button>

              <button
                onClick={clearWorkspace}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Clear All
              </button>
            </div>
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
                  Paste a request, email, note, or document. Arqivo helps turn
                  it into a summary, checklist, next-step plan, or draft
                  response.
                </p>
              </div>

              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                ● Cloudflare AI mode
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
                placeholder="Ask about the case..."
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