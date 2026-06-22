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

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

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
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b\d{9}\b/,
    /\b\d{16}\b/,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function getAgentsExplanation() {
  return (
    "Arqivo uses several focused agents and checks:\n\n" +
    "1. Safety Agent checks for possible private or sensitive information.\n" +
    "2. Intake Agent finds the case type, dates, keywords, and main request.\n" +
    "3. Summary Agent explains the case in simple words.\n" +
    "4. Missing Info Agent checks what required information is missing.\n" +
    "5. Document Agent checks whether required documents were included.\n" +
    "6. Deadline Agent looks for due dates and time-sensitive language.\n" +
    "7. Risk Agent flags missing information, urgency, deadlines, and suspicious text.\n" +
    "8. Eligibility Agent checks whether the case may be ready for review.\n" +
    "9. Priority Agent decides whether the case should be handled normally or quickly.\n" +
    "10. Planner Agent creates next steps.\n" +
    "11. Message Agent drafts a response.\n" +
    "12. Tone Agent checks that the response is clear and professional.\n" +
    "13. Quality Agent reviews the output before action.\n" +
    "14. Audit Log Agent records what the system checked.\n\n" +
    "On the main chat page, Cloudflare AI explains and applies this workflow. On the Agent Demo page, the FastAPI backend runs the structured Python agent pipeline."
  );
}

function getTaskHint(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes("which agents") ||
    lower.includes("what agents") ||
    lower.includes("agents being used")
  ) {
    return "Task: Explain which Arqivo agents are used and what each agent does.";
  }

  if (lower.includes("summarize") || lower.includes("summary")) {
    return `
Task: Summarize the case clearly.

Use this format:

Summary Agent

- Main request:
- Key facts:
- Important dates:
- Main issue:
- What the reviewer should notice:

Rules:
- Use only the case text.
- Do not invent facts.
- Keep it concise.
`.trim();
  }

  if (
    lower.includes("missing") ||
    lower.includes("required") ||
    lower.includes("need")
  ) {
    return `
Task: Identify missing or incomplete information.

Use this format:

Missing Information Agent

Missing or incomplete items:
1.
2.
3.

Document Agent

Included documents:
-

Missing documents:
-

Why this matters:
-

Recommended request:
-

Rules:
- Use only the case text.
- Do not invent documents unless clearly marked as "may be needed."
- Keep the answer practical.
`.trim();
  }

  if (
    lower.includes("risk") ||
    lower.includes("risky") ||
    lower.includes("urgent")
  ) {
    return `
Task: Assess the risk level.

Use this format:

Risk Agent

Risk level: Low, Medium, or High

Reasons:
1.
2.
3.

Deadline Agent

Time-sensitive details:
-

Priority Agent

Recommended priority:
-

Quality note:
A human reviewer should review the output before action.

Rules:
- Do not overstate risk beyond what the case text supports.
- Use only the case text.
`.trim();
  }

  if (
    lower.includes("next") ||
    lower.includes("reviewer") ||
    lower.includes("case manager") ||
    lower.includes("steps") ||
    lower.includes("recommend") ||
    lower.includes("do")
  ) {
    return `
Task: Recommend practical next steps.

Use this format:

Planner Agent

Recommended next steps:
1.
2.
3.
4.

Priority Agent

Review priority:
-

Quality Agent

Human review note:
-

Rules:
- Do not use the word "worker" in the final answer.
- Use "reviewer", "case reviewer", "case manager", or "team."
- Keep the steps clear and realistic.
`.trim();
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

Use this format:

Message Agent

Dear [Client Name],

[Clear opening paragraph that acknowledges the request.]

[Clear body paragraph explaining what is missing, what is needed, or what happens next.]

Best regards,
[Your Name or Department]

Tone Agent

Tone review:
- Clear
- Respectful
- Professional

Rules for drafted messages:
- Do not wrap the message in quotation marks.
- Do not say "Here is a draft" unless the user asks for explanation.
- Do not add extra commentary after the signature except the Tone Agent section.
- Use placeholders like [Client Name] and [Your Name or Department] if names are not provided.
- If a client, applicant, tenant, or contact name is clearly provided in the case text, you may use it.
- Do not sign as Arqivo AI Team.
`.trim();
  }

  if (lower.includes("report") || lower.includes("final")) {
    return `
Task: Create a final case report using the full Arqivo multi-agent workflow.

Use these exact sections in this exact order:

1. Case Summary
Use the Summary Agent to explain the case in simple language.

2. Safety Check
Use the Safety Agent to say whether the case text appears safe for a public demo or whether private information should be removed.

3. Intake Details
Use the Intake Agent to identify:
- Case type
- Main request
- Important dates
- Keywords or key issues

4. Missing Information
Use the Missing Information Agent to list missing or incomplete information.

5. Document Check
Use the Document Agent to explain:
- Documents included
- Documents missing
- Documents that may need review

6. Deadline Check
Use the Deadline Agent to identify:
- Deadlines
- Due dates
- Notice periods
- Time-sensitive language

7. Risk Level
Use the Risk Agent to give a Low, Medium, or High risk level and explain why.

8. Eligibility / Readiness
Use the Eligibility Agent to explain whether the case appears ready for review or still incomplete.

9. Priority
Use the Priority Agent to say whether the case should be handled normally or reviewed quickly.

10. Recommended Next Steps
Use the Planner Agent to list practical next steps for the reviewer or case team.

11. Draft Response
Use the Message Agent to draft a clear response message with placeholders if needed.

12. Tone Review
Use the Tone Agent to briefly confirm whether the draft sounds clear, respectful, and professional.

13. Quality Review
Use the Quality Agent to state whether a human should review the output before action.

14. Audit Log
Use the Audit Log Agent to list every agent used:
- Safety Agent
- Intake Agent
- Summary Agent
- Missing Information Agent
- Document Agent
- Deadline Agent
- Risk Agent
- Eligibility Agent
- Priority Agent
- Planner Agent
- Message Agent
- Tone Agent
- Quality Agent
- Audit Log Agent

Rules:
- Do not invent facts not supported by the case text.
- Do not use the word "worker" in the final answer.
- Use "reviewer", "case reviewer", "case manager", or "team" instead.
- Do not sign as Arqivo AI Team.
- Keep the report organized and readable.
- A human must review the final output before anyone uses it.
`.trim();
  }

  return "Task: Answer the user's question using the case text. If the question is vague, ask one helpful follow-up question. Do not use the word worker in the final answer.";
}

function buildMessages(message: string, caseText: string, history: ChatMessage[]) {
  const safeCaseText = limitText(caseText, 4000);

  const safeHistory = history
    .filter((item) => item.role === "user" || item.role === "assistant")
    .slice(-4)
    .map((item) => `${item.role.toUpperCase()}: ${limitText(item.content, 500)}`)
    .join("\n");

  const taskHint = getTaskHint(message);

  const systemPrompt = `
You are Arqivo AI, a professional case-assistant chatbot.

Use a multi-agent style internally:
1. Safety Agent: check for possible private or sensitive information.
2. Intake Agent: identify the request type and key facts.
3. Summary Agent: summarize the case clearly.
4. Missing Information Agent: find missing or incomplete information.
5. Document Agent: check whether documents are included or missing.
6. Deadline Agent: identify due dates and time-sensitive language.
7. Risk Agent: identify urgency, deadlines, incomplete documents, or review risks.
8. Eligibility Agent: explain whether the case seems ready for review.
9. Priority Agent: decide whether the case should be handled normally or quickly.
10. Planner Agent: suggest practical next steps.
11. Message Agent: draft clear messages when asked.
12. Tone Agent: keep responses clear, respectful, and professional.
13. Quality Agent: remind the user that a person must review the output.
14. Audit Log Agent: explain what was checked when asked.

Safety rules:
- Do not claim this is legal, medical, financial, or government advice.
- Do not invent facts that are not supported by the case text.
- Do not say you are the Arqivo AI Team.
- Do not sign messages as Arqivo AI Team.
- Do not use the word "worker" in the final answer. Use "reviewer", "case reviewer", "case manager", or "team" instead.
- When drafting a message, use a clean letter/email format with greeting, body paragraphs, closing, and sender placeholder.
- If sensitive real information appears, remind the user to replace it with placeholders.
- Keep the answer concise to save free AI usage.

Important:
- If the user asks for a final report, include all 14 agent sections.
- If the user asks which agents are being used, list all 14 agents.
- A human must review the output before anyone uses it.

${taskHint}
`.trim();

  const userPrompt = `
Case/document text:
${safeCaseText || "No case text was provided."}

Recent conversation:
${safeHistory || "No previous messages."}

User message:
${limitText(message, 500)}
`.trim();

  return [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];
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
        model: MODEL,
      });
    }

    if (request.method !== "POST" || url.pathname !== "/chat") {
      return jsonResponse(
        {
          error: "Not found. Use POST /chat.",
        },
        404,
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
          400,
        );
      }

      if (caseText.length > 4000) {
        return jsonResponse(
          {
            reply:
              "This case is too long for the free demo limit. Please shorten it to 4,000 characters or less before sending.",
            source: "Arqivo AI Safety Limit",
          },
          200,
        );
      }

      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("which agents") ||
        lowerMessage.includes("what agents") ||
        lowerMessage.includes("agents being used")
      ) {
        return jsonResponse({
          reply: getAgentsExplanation(),
          source: "Arqivo AI",
        });
      }

      if (!env.AI) {
        return jsonResponse(
          {
            reply:
              "Cloudflare Workers AI is not connected to this Worker. Check the AI binding in wrangler.toml and redeploy the Worker.",
            source: "Cloudflare Workers AI Binding Error",
          },
          200,
        );
      }

      const sensitiveFound = detectPossibleSensitiveInfo(caseText);
      const messages = buildMessages(message, caseText, history);

      const result = await env.AI.run(MODEL, {
        messages,
        max_tokens: 900,
        temperature: 0.3,
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
    } catch (error) {
      console.error("Arqivo Worker AI error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown Worker AI error";

      return jsonResponse(
        {
          reply:
            "Cloudflare Workers AI could not answer right now. This is likely a Worker AI binding, model, or deployment issue. Check npx wrangler tail for the full error.",
          source: "Cloudflare Workers AI Error",
          error: errorMessage,
        },
        200,
      );
    }
  },
};