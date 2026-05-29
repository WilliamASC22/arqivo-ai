import os
import requests
from typing import Dict, List, Optional

from agents import run_all_agents


HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "openai/gpt-oss-20b:fireworks")


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
- Missing information: {", ".join(missing_information) if missing_information else "None found"}
- Important dates: {", ".join(important_dates) if important_dates else "None found"}
- Risk level: {risk.get("risk_level", "Unknown")}
- Risk score: {risk.get("risk_score", "Unknown")}
- Risk reasons: {", ".join(risk_reasons) if risk_reasons else "None found"}
""".strip()

    except Exception:
        return f"Original case/document text:\n{case_text}"


def local_fallback(user_message: str, case_text: str) -> str:
    """
    Backup response only.
    This runs when there is no HF_TOKEN or the free hosted model is unavailable.
    """

    message = user_message.lower().strip()

    if not case_text.strip():
        return (
            "Hi, I’m Arqivo AI. Paste a case note or document on the left, and I can help you "
            "summarize it, find missing information, assess risk, plan next steps, draft a response, "
            "or create a final report."
        )

    if message in ["hi", "hello", "hey", "yo"] or len(message) <= 5:
        return (
            "Hi, I’m Arqivo AI. I can help with the case text on the left. "
            "You can ask me things like: what is this case about, what is missing, "
            "how risky is it, what should the worker do next, or can you draft a response?"
        )

    try:
        result = run_all_agents(case_text)
        report = result["report"]
        risk = report["risk"]

        missing_information = report.get("missing_information", [])
        important_dates = report.get("important_dates", [])

        return (
            "I can help with that. Here is what I see from the case:\n\n"
            f"{report['summary']}\n\n"
            f"Risk level: {risk['risk_level']}\n\n"
            f"Missing information: {', '.join(missing_information) if missing_information else 'None found'}\n\n"
            f"Important dates: {', '.join(important_dates) if important_dates else 'None found'}\n\n"
            "Note: This is the local fallback response. To make Arqivo AI act like a real chatbot, "
            "add HF_TOKEN to your backend environment."
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
) -> str:
    """
    Real chatbot response using Hugging Face's hosted chat API.
    """

    if not HF_TOKEN:
        return local_fallback(user_message, case_text)

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
            timeout=60,
        )

        if response.status_code != 200:
            print("Hugging Face API error:", response.status_code, response.text)
            return local_fallback(user_message, case_text)

        data = response.json()
        answer = data["choices"][0]["message"]["content"].strip()

        if not answer:
            return local_fallback(user_message, case_text)

        return answer

    except Exception as error:
        print("Chatbot error:", str(error))
        return local_fallback(user_message, case_text)


def get_chat_response(
    user_message: str,
    case_text: str = "",
    history: Optional[List[Dict]] = None,
) -> Dict:
    reply = ask_free_chatbot(user_message, case_text, history)

    return {
        "reply": reply,
        "source": "Arqivo AI Chatbot" if HF_TOKEN else "Local Fallback",
    }