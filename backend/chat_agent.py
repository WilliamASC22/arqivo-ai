from typing import Dict
from agents import run_all_agents

try:
    from transformers import pipeline
except Exception:
    pipeline = None


chat_model = None


def get_model():
    """
    Loads the free local Hugging Face model only when needed.
    This avoids loading the model when the backend first starts.
    """
    global chat_model

    if chat_model is None and pipeline is not None:
        chat_model = pipeline(
            "text2text-generation",
            model="google/flan-t5-small",
        )

    return chat_model


def build_agent_context(case_text: str) -> str:
    """
    Runs the existing Arqivo AI agents and turns their output into context
    for the chatbot model.
    """
    agent_result = run_all_agents(case_text)
    report = agent_result["report"]
    quality = agent_result["quality_check"]
    audit_log = agent_result["audit_log"]

    missing = report["missing_information"]
    dates = report["important_dates"]
    risk = report["risk"]
    steps = report["recommended_steps"]

    context = f"""
Case Summary:
{report["summary"]}

Case Type:
{report["case_type"]}

Important Dates:
{", ".join(dates) if dates else "None found"}

Missing Information:
{", ".join(missing) if missing else "None found"}

Risk Level:
{risk["risk_level"]}

Risk Score:
{risk["risk_score"]}

Risk Reasons:
{" ".join(risk["reasons"]) if risk["reasons"] else "No major risk reasons found."}

Recommended Steps:
{" ".join([f"{index + 1}. {step}" for index, step in enumerate(steps)])}

Draft Message:
{report["draft_message"]}

Quality Status:
{quality["quality_status"]}

Quality Warnings:
{" ".join(quality["warnings"]) if quality["warnings"] else "No major quality warnings."}

Audit Log:
{" ".join(audit_log)}
"""

    return context


def get_rule_based_backup(user_message: str, case_text: str) -> Dict:
    """
    Backup response if the free AI model is unavailable or too slow.
    """
    message = user_message.lower().strip()
    agent_result = run_all_agents(case_text)
    report = agent_result["report"]
    quality = agent_result["quality_check"]
    audit_log = agent_result["audit_log"]

    if "summary" in message or "summarize" in message:
        return {
            "reply": report["summary"],
            "source": "Summary Agent",
        }

    if "missing" in message or "required" in message:
        missing = report["missing_information"]

        if missing:
            reply = "The missing information appears to be: " + ", ".join(missing) + "."
        else:
            reply = "I did not find any obvious missing information."

        return {
            "reply": reply,
            "source": "Missing Information Agent",
        }

    if "risk" in message or "danger" in message or "problem" in message or "urgent" in message:
        risk = report["risk"]
        reasons = risk["reasons"]
        reason_text = " ".join(reasons) if reasons else "No major risk reasons were detected."

        return {
            "reply": (
                f"Risk Level: {risk['risk_level']}\n"
                f"Risk Score: {risk['risk_score']}\n"
                f"Reason: {reason_text}"
            ),
            "source": "Risk Agent",
        }

    if "next step" in message or "plan" in message or "what should" in message or "do next" in message:
        steps = report["recommended_steps"]
        step_text = "\n".join([f"{index + 1}. {step}" for index, step in enumerate(steps)])

        return {
            "reply": "Recommended next steps:\n" + step_text,
            "source": "Planner Agent",
        }

    if "draft" in message or "email" in message or "message" in message or "response" in message:
        return {
            "reply": report["draft_message"],
            "source": "Message Agent",
        }

    if "quality" in message or "review" in message or "check" in message:
        warnings = quality["warnings"]
        warning_text = "\n".join([f"- {warning}" for warning in warnings]) if warnings else "No major quality warnings were found."

        return {
            "reply": (
                f"Quality Status: {quality['quality_status']}\n\n"
                f"Warnings:\n{warning_text}"
            ),
            "source": "Quality Agent",
        }

    if "audit" in message or "log" in message or "history" in message:
        log_text = "\n".join([f"{index + 1}. {item}" for index, item in enumerate(audit_log)])

        return {
            "reply": "Audit Log:\n" + log_text,
            "source": "Audit Log",
        }

    return {
        "reply": (
            "I can help with this case. You can ask me to summarize it, explain the risk, "
            "find missing information, create next steps, draft a response, or generate a report."
        ),
        "source": "Backup Chat Agent",
    }


def get_chat_response(user_message: str, case_text: str = "") -> Dict:
    """
    Actual free-safe chatbot.

    It uses:
    1. Your existing Arqivo AI agents to analyze the case.
    2. A small local Hugging Face model to write a natural response.
    3. A rule-based backup if the model is unavailable.
    """

    if not case_text.strip():
        return {
            "reply": (
                "Please paste a case note or document text first. "
                "Then you can ask me to summarize it, find missing information, "
                "check risks, create next steps, draft a message, or generate a report."
            ),
            "source": "Arqivo AI Chatbot",
        }

    try:
        model = get_model()

        if model is None:
            return get_rule_based_backup(user_message, case_text)

        context = build_agent_context(case_text)

        prompt = f"""
You are Arqivo AI, a helpful multi-agent workflow assistant.

Use the case analysis below to answer the user's question.
Do not make final decisions.
Do not claim to have sent messages.
Keep the answer clear, useful, and professional.

Case Analysis:
{context}

User Question:
{user_message}

Answer:
"""

        output = model(
            prompt,
            max_new_tokens=220,
            do_sample=False,
        )

        reply = output[0]["generated_text"].strip()

        if not reply:
            return get_rule_based_backup(user_message, case_text)

        return {
            "reply": reply,
            "source": "Free Local LLM + Arqivo Agents",
        }

    except Exception:
        return get_rule_based_backup(user_message, case_text)