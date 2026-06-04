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

function limitText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
}

function detectPossibleSensitiveInfo(text: string) {
  const patterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN style
    /\b\d{9}\b/, // possible 9 digit ID
    /\b\d{16}\b/, // possible card number
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // email
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function getTaskHint(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("summarize") || lower.includes("summary")) {
    return "Task: Summarize the case clearly in 3-5 bullet points.";
  }

  if (
    lower.includes("missing") ||
    lower.includes("required") ||
    lower.includes("need")
  ) {
    return "Task: Identify missing or incomplete information from the case. Explain why it matters and what should be requested next.";
  }

  if (
    lower.includes("risk") ||
    lower.includes("risky") ||
    lower.includes("urgent")
  ) {
    return "Task: Assess the risk level and explain the reasons briefly. Do not overstate risk beyond what the case text supports.";
  }

  if (
    lower.includes("next") ||
    lower.includes("worker") ||
    lower.includes("steps") ||
    lower.includes("do")
  ) {
    return "Task: Recommend practical next steps for the worker in a numbered list.";
  }

  if (
    lower.includes("draft") ||
    lower.includes("email") ||
    lower.includes("message") ||
    lower.includes("response") ||
    lower.includes("letter")
  ) {
    return `
Task: Draft a professional message.

Format the message exactly like this:

Dear [Recipient],

[Clear opening paragraph that acknowledges the request.]

[Clear body paragraph explaining what is needed, what is missing, or what the next step is.]

Best regards,
[Sender]

Rules for drafted messages:
- Do not wrap the message in quotation marks.
- Do not say "Here is a draft" unless the user asks for explanation.
- Do not add extra commentary after the signature.
- Use placeholders like [Recipient] and [Sender] if names are not provided.
- If a recipient name is clearly provided in the case text, you may use it.
- Do not sign as Arqivo AI Team.
`.trim();
  }

  if (lower.includes("report") || lower.includes("final")) {
    return "Task: Create a concise final case report with sections for Summary, Missing Information, Risk Level, Recommended Next Steps, and Draft Response if relevant.";
  }

  return "Task: Answer the user's question using the case text. If the question is vague, ask one helpful follow-up question.";
}

function buildPrompt(message: string, caseText: string, history: ChatMessage[]) {
  const safeCaseText = limitText(caseText, 4000);

  const safeHistory = history
    .filter((item) => item.role === "user" || item.role === "assistant")
    .slice(-4)
    .map((item) => `${item.role.toUpperCase()}: ${limitText(item.content, 500)}`)
    .join("\n");

  const taskHint = getTaskHint(message);

  return `
You are Arqivo AI, a professional case-assistant chatbot.

Use a multi-agent style internally:
1. Intake Agent: identify the request type and key facts.
2. Missing Information Agent: find missing or incomplete information.
3. Risk Agent: identify urgency, deadlines, incomplete documents, or review risks.
4. Planner Agent: suggest practical next steps.
5. Communication Agent: draft clear messages when asked.

Safety rules:
- Do not claim this is legal, medical, financial, or government advice.
- Do not invent facts that are not supported by the case text.
- Do not say you are the Arqivo AI Team.
- Do not sign messages as Arqivo AI Team.
- When drafting a message, use a clean letter/email format with greeting, body paragraphs, closing, and sender placeholder.
- If sensitive real information appears, remind the user to replace it with placeholders.
- Keep the answer concise to save free AI usage.

${taskHint}

Case/document text:
${safeCaseText || "No case text was provided."}

Recent conversation:
${safeHistory || "No previous messages."}

User message:
${limitText(message, 500)}

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

      if (caseText.length > 4000) {
        return jsonResponse(
          {
            reply:
              "This case is too long for the free demo limit. Please shorten it to 4,000 characters or less before sending.",
            source: "Arqivo AI Safety Limit",
          },
          200
        );
      }

      const sensitiveFound = detectPossibleSensitiveInfo(caseText);
      const prompt = buildPrompt(message, caseText, history);

      const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt,
        max_tokens: 450,
        temperature: 0.4,
      });

      const aiReply =
        typeof result === "object" &&
        result !== null &&
        "response" in result &&
        typeof result.response === "string"
          ? result.response.trim()
          : "I could not generate a response right now.";

      const safetyNote = sensitiveFound
        ? "\n\nSafety note: This text may contain private information. For a public demo, replace real personal details with fake placeholders."
        : "";

      return jsonResponse({
        reply: `${aiReply}${safetyNote}`,
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