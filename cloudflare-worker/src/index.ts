export interface Env {
  AI: Ai;
}

type ChatMessage = {
  role: "assistant" | "user" | "system";
  content: string;
};

type ChatRequest = {
  message?: string;
  case_text?: string;
  history?: ChatMessage[];
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function buildPrompt(message: string, caseText: string, history: ChatMessage[]) {
  const safeHistory = history
    .filter((item) => item.role === "user" || item.role === "assistant")
    .slice(-8)
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join("\n");

  return `
You are Arqivo AI, a professional case-assistant chatbot.

Rules:
- Answer naturally like a real chatbot.
- Use the case/document text as the main source.
- Help summarize cases, identify missing information, assess risk, suggest next steps, draft messages, and create reports.
- If the user says hello, greet them normally.
- If the user asks something vague, ask a useful follow-up question.
- Do not invent facts that are not supported by the case text.
- Do not say you are the Arqivo AI Team.
- Do not sign messages as Arqivo AI Team.
- Keep answers clear, professional, and useful.
- Remind users not to enter private or sensitive information in a public demo.

Case/document text:
${caseText || "No case text was provided."}

Recent conversation:
${safeHistory || "No previous messages."}

User message:
${message}

Answer:
`.trim();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return jsonResponse({
        message: "Arqivo AI Cloudflare Worker is running.",
        status: "ok",
      });
    }

    if (request.method !== "POST" || url.pathname !== "/chat") {
      return jsonResponse(
        {
          error: "Not found. Use POST /chat.",
        },
        404
      );
    }

    try {
      const body = (await request.json()) as ChatRequest;

      const message = body.message?.trim() || "";
      const caseText = body.case_text?.trim() || "";
      const history = Array.isArray(body.history) ? body.history : [];

      if (!message) {
        return jsonResponse(
          {
            reply: "Please enter a message first.",
            source: "Cloudflare Workers AI",
          },
          400
        );
      }

      const prompt = buildPrompt(message, caseText, history);

      const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt,
        max_tokens: 700,
        temperature: 0.6,
      });

      const reply =
        typeof result === "object" &&
        result !== null &&
        "response" in result &&
        typeof result.response === "string"
          ? result.response
          : "I could not generate a response right now.";

      return jsonResponse({
        reply,
        source: "Cloudflare Workers AI",
      });
    } catch {
      return jsonResponse(
        {
          reply:
            "Cloudflare Workers AI could not answer right now. The free daily limit may have been reached, or the request failed.",
          source: "Cloudflare Workers AI Error",
        },
        200
      );
    }
  },
};
