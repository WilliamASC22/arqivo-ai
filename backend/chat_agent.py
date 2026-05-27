from typing import Dict
from agents import run_all_agents


def get_chat_response(user_message: str, case_text: str = "") -> Dict:
    """
    Free-safe chatbot logic for Arqivo AI.

    This does not use a paid AI API.
    It routes the user's question to the correct internal agent result.
    """

    message = user_message.lower().strip()

    if not case_text.strip():
        return {
            "reply": (
                "Please paste a case note or document text first. "
                "Then you can ask me to summarize it, find missing information, "
                "check risks, create next steps, draft a message, or generate a report."
            ),
            "source": "Chat Agent",
        }

    agent_result = run_all_agents(case_text)
    report = agent_result["report"]
    quality = agent_result["quality_check"]
    audit_log = agent_result["audit_log"]

    if "summary" in message or "summarize" in message:
        return {
            "reply": report["summary"],
            "source": "Summary Agent",
        }

    if "missing" in message or "missing information" in message or "required" in message:
        missing = report["missing_information"]

        if missing:
            reply = "The missing information appears to be: " + ", ".join(missing) + "."
        else:
            reply = "I did not find any obvious missing information based on the current rules."

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
        step_text = "\n".join(
            [f"{index + 1}. {step}" for index, step in enumerate(steps)]
        )

        return {
            "reply": "Recommended next steps:\n" + step_text,
            "source": "Planner Agent",
        }

    if "draft" in message or "email" in message or "message" in message or "response" in message:
        return {
            "reply": report["draft_message"],
            "source": "Message Agent",
        }

    if "report" in message or "final" in message:
        missing = report["missing_information"]
        dates = report["important_dates"]

        reply = (
            "Final Report\n\n"
            f"Summary: {report['summary']}\n\n"
            f"Case Type: {report['case_type']}\n\n"
            f"Important Dates: {', '.join(dates) if dates else 'None found'}\n\n"
            f"Missing Information: {', '.join(missing) if missing else 'None found'}\n\n"
            f"Risk Level: {report['risk']['risk_level']}\n\n"
            "Recommended Steps:\n"
            + "\n".join(
                [
                    f"{index + 1}. {step}"
                    for index, step in enumerate(report["recommended_steps"])
                ]
            )
        )

        return {
            "reply": reply,
            "source": "Report Agent",
        }

    if "quality" in message or "review" in message or "check" in message:
        warnings = quality["warnings"]

        if warnings:
            warning_text = "\n".join([f"- {warning}" for warning in warnings])
        else:
            warning_text = "No major quality warnings were found."

        return {
            "reply": (
                f"Quality Status: {quality['quality_status']}\n\n"
                f"Warnings:\n{warning_text}"
            ),
            "source": "Quality Agent",
        }

    if "audit" in message or "log" in message or "history" in message:
        log_text = "\n".join(
            [f"{index + 1}. {item}" for index, item in enumerate(audit_log)]
        )

        return {
            "reply": "Audit Log:\n" + log_text,
            "source": "Audit Log",
        }

    return {
        "reply": (
            "I can help with this case. Try asking me one of these:\n\n"
            "- Summarize this case\n"
            "- What information is missing?\n"
            "- What is the risk level?\n"
            "- What should I do next?\n"
            "- Draft a response\n"
            "- Generate a final report\n"
            "- Run a quality check\n"
            "- Show the audit log"
        ),
        "source": "Chat Agent",
    }