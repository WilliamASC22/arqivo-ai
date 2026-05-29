import os
import requests
from typing import Dict, List, Optional, Tuple

from agents import run_all_agents


HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "openai/gpt-oss-120b:fastest")


def format_items(items: List[str]) -> str:
    if not items:
        return "None found"

    return ", ".join(items)


def build_case_context(case_text: str) -> str:
    if not case_text.strip():
        return "No case text was provided."

    try:
        result = run_all_agents(case_text)
        report = result["report"]
        risk = report.get("risk", {})

        missing_information = report.get("missing_information", [])
        important_dates = report.get("important_dates", [])
        risk_reasons = risk.get("reasons", [])

        return f"""
Original case/document text:
{case_text}

Internal multi-agent analysis:
- Case type: {report.get("case_type", "general")}
- Summary: {report.get("summary", "No summary available.")}
- Missing information: {format_items(missing_information)}
- Important dates: {format_items(important_dates)}
- Risk level: {risk.get("risk_level", "Unknown")}
- Risk score: {risk.get("risk_score", "Unknown")}
- Risk reasons: {format_items(risk_reasons)}
""".strip()

    except Exception:
        return f"Original case/document text:\n{case_text}"


def local_fallback(user_message: str, case_text: str) -> str:
    """
    Backup response only.
    This runs when HF_TOKEN is missing or the hosted model is unavailable.
    """

    message = user_message.lower().strip()

    greetings = [
        "hi",
        "hello",
        "hey",
        "yo",
        "good morning",
        "good afternoon",
        "good evening",
    ]

    casual_checkins = [
        "how are you",
        "how r u",
        "what's up",
        "whats up",
        "sup",
    ]

    if not case_text.strip():
        if message in greetings:
            return (
                "Hi, I’m Arqivo AI. Paste a case note or document, and I can help you "
                "summarize it, identify missing information, assess risk, plan next steps, "
                "draft a response, or create a final report."
            )

        return (
            "I can help, but I need case or document text first. Paste a demo case on the left, "
            "then ask me a question about it."
        )

    if message in greetings:
        return (
            "Hi, I’m Arqivo AI. I can help with the case text on the left. "
            "You can ask what the case is about, what information is missing, how risky it is, "
            "what the worker should do next, or ask me to draft a response."
        )

    if message in casual_checkins:
        return (
            "I’m ready to help. I can review the case text, explain what is missing, "
            "suggest next steps, or draft a professional response."
        )

    if len(message) <= 5:
        return (
            "I need a little more detail to answer that well. Try asking something like "
            "'What is missing from this case?' or 'What should the worker do next?'"
        )

    try:
        result = run_all_agents(case_text)
        report = result["report"]
        risk = report["risk"]

        missing_information = report.get("missing_information", [])
        important_dates = report.get("important_dates", [])
        recommended_steps = report.get("recommended_steps", [])

        if "missing" in message or "need" in message or "required" in message:
            if missing_information:
                return (
                    "The main missing item appears to be:\n\n"
                    + "\n".join(f"- {item}" for item in missing_information)
                    + "\n\nThe worker should request this before completing the review."
                )

            return "I do not see obvious missing information from the current case text."

        if "risk" in message or "risky" in message or "urgent" in message:
            reasons = risk.get("reasons", [])

            return (
                f"The risk level is {risk.get('risk_level', 'Unknown')}.\n\n"
                f"Risk score: {risk.get('risk_score', 'Unknown')}\n\n"
                "Reason:\n"
                + (
                    "\n".join(f"- {reason}" for reason in reasons)
                    if reasons
                    else "- No specific risk reasons found"
                )
            )

        if "summary" in message or "summarize" in message or "about" in message:
            return report["summary"]

        if "next" in message or "worker" in message or "do" in message or "steps" in message:
            if recommended_steps:
                return (
                    "Here are the recommended next steps:\n\n"
                    + "\n".join(
                        f"{index + 1}. {step}"
                        for index, step in enumerate(recommended_steps)
                    )
                )

            return "The worker should review the case details and confirm what action is needed next."

        if "draft" in message or "email" in message or "response" in message:
            return report.get(
                "draft_message",
                "I can draft a response, but I need more case details first.",
            )

        if "money" in message or "rent" in message or "assistance" in message:
            return (
                "This case appears to involve rent assistance. The important issue is that the person "
                "submitted some documents, but proof of income appears to be missing. That missing item "
                "could delay the review."
            )

        return (
            "I can help with that. Based on the case text, this is a rent assistance request where "
            "proof of income appears to be missing and the case has a May 30 deadline. "
            "The best next step is to request the missing proof of income and review the case before the deadline."
        )

    except Exception:
        return (
            "I can help with this case, but I could not run the full analysis right now. "
            "Please check the case text and try again."
        )


def ask_free_chatbot(
    user_message: str,
    case_text: str = "",
    history: Optional[List[Dict]] = None,
) -> Tuple[str, str]:
    """
    Real chatbot response using Hugging Face's hosted chat API.
    Returns: (reply, source)
    """

    if not HF_TOKEN:
        return local_fallback(user_message, case_text), "Local Fallback"

    case_context = build_case_context(case_text)

    messages = [
        {
            "role": "system",
            "content": (
                "You are Arqivo AI, a professional case-assistant chatbot. "
                "You respond naturally like a real assistant, not like a rigid template. "
                "Use the case/document text as the source of truth. "
                "Help users summarize cases, identify missing information, assess risk, plan next steps, "
                "draft professional messages, and create review-ready reports. "
                "If the user says hello, greet them normally and explain what you can help with. "
                "If the user asks a vague question, ask a useful follow-up or explain what you can do. "
                "Do not invent facts that are not supported by the case text. "
                "Do not say you are the Arqivo AI Team. "
                "Do not sign messages as Arqivo AI Team. "
                "Keep answers polished, practical, and easy to understand."
            ),
        },
        {
            "role": "user",
            "content": f"Case/document context:\n{case_context}",
        },
    ]

    if history:
        for item in history[-8:]:
            role = item.get("role")
            content = item.get("content")

            if role in ["user", "assistant"] and content:
                messages.append(
                    {
                        "role": role,
                        "content": content,
                    }
                )

    messages.append(
        {
            "role": "user",
            "content": user_message,
        }
    )

    payload = {
        "model": HF_MODEL,
        "messages": messages,
        "max_tokens": 600,
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=25,
        )

        if response.status_code != 200:
            print("Hugging Face API error:", response.status_code, response.text)
            return local_fallback(user_message, case_text), "Local Fallback"

        data = response.json()
        answer = data["choices"][0]["message"]["content"].strip()

        if not answer:
            return local_fallback(user_message, case_text), "Local Fallback"

        return answer, "Arqivo AI Chatbot"

    except Exception as error:
        print("Chatbot error:", str(error))
        return local_fallback(user_message, case_text), "Local Fallback"


def get_chat_response(
    user_message: str,
    case_text: str = "",
    history: Optional[List[Dict]] = None,
) -> Dict:
    reply, source = ask_free_chatbot(user_message, case_text, history)

    return {
        "reply": reply,
        "source": source,
    }