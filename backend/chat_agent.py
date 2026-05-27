from typing import Dict, List
from agents import run_all_agents


def format_list(items: List[str]) -> str:
    if not items:
        return "None found."

    return "\n".join([f"- {item}" for item in items])


def format_numbered_list(items: List[str]) -> str:
    if not items:
        return "None found."

    return "\n".join([f"{index + 1}. {item}" for index, item in enumerate(items)])


def build_full_case_analysis(case_text: str) -> Dict:
    agent_result = run_all_agents(case_text)

    return {
        "report": agent_result["report"],
        "quality": agent_result["quality_check"],
        "audit_log": agent_result["audit_log"],
    }


def create_plain_explanation(report: Dict) -> str:
    missing = report["missing_information"]
    dates = report["important_dates"]
    risk = report["risk"]

    explanation = (
        "Here is the case in simple words:\n\n"
        f"{report['summary']}\n\n"
    )

    if missing:
        explanation += (
            "The case is not fully ready yet because this required information appears to be missing:\n\n"
            f"{format_list(missing)}\n\n"
        )
    else:
        explanation += (
            "I do not see obvious missing information from the current case text.\n\n"
        )

    if dates:
        explanation += (
            "There is also a time concern because the case mentions this important date:\n\n"
            f"{format_list(dates)}\n\n"
        )

    explanation += (
        f"The current risk level is {risk['risk_level']}. "
        "A worker should review the case before taking final action."
    )

    return explanation


def create_first_action(report: Dict) -> str:
    missing = report["missing_information"]
    dates = report["important_dates"]
    risk = report["risk"]

    if missing:
        return (
            "The worker should first ask for the missing information.\n\n"
            f"Missing information:\n{format_list(missing)}\n\n"
            "Why this should happen first:\n"
            "The case cannot be fully reviewed until the required information is complete. "
            "Asking for the missing item first prevents delays and avoids making a decision "
            "based on incomplete information."
        )

    if dates:
        return (
            "The worker should first check the deadline and confirm whether there is enough time "
            "to complete the review.\n\n"
            f"Important date found:\n{format_list(dates)}\n\n"
            "Why this should happen first:\n"
            "Cases with deadlines should be handled carefully so the worker does not miss a "
            "time-sensitive issue."
        )

    if risk["risk_level"] in ["Medium", "High"]:
        return (
            "The worker should first send the case to a human reviewer.\n\n"
            f"Risk level: {risk['risk_level']}\n\n"
            "Why this should happen first:\n"
            "The case has enough risk that it should not be handled automatically."
        )

    return (
        "The worker should first review the submitted information and confirm that the case details "
        "are accurate.\n\n"
        "Why this should happen first:\n"
        "The case does not appear to have a major risk, but a human should still verify the details "
        "before marking it complete."
    )


def create_professional_email(report: Dict) -> str:
    missing = report["missing_information"]
    dates = report["important_dates"]

    if missing:
        deadline_sentence = ""

        if dates:
            deadline_sentence = (
                f"\n\nBecause your case mentions {', '.join(dates)}, "
                "please send the missing information as soon as possible so the review is not delayed."
            )

        return (
            "Here is a professional email draft:\n\n"
            "Subject: Additional Information Needed for Your Request\n\n"
            "Hello,\n\n"
            "Thank you for submitting your request. We reviewed the information you provided, "
            "and we noticed that the following item is still needed before the review can continue:\n\n"
            f"{format_list(missing)}"
            f"{deadline_sentence}\n\n"
            "Once we receive this information, we can continue reviewing your case.\n\n"
            "Best,\n"
            "[Your Name]\n"
            "[Your Role / Organization]"
        )

    return (
        "Here is a professional email draft:\n\n"
        "Subject: Your Request Is Ready for Review\n\n"
        "Hello,\n\n"
        "Thank you for submitting your request. We reviewed the information provided, "
        "and your case appears ready for the next step in the review process.\n\n"
        "A reviewer will look over the case and follow up if any additional information is needed.\n\n"
        "Best,\n"
        "[Your Name]\n"
        "[Your Role / Organization]"
    )


def create_supervisor_summary(report: Dict) -> str:
    missing = report["missing_information"]
    dates = report["important_dates"]
    risk = report["risk"]

    return (
        "Supervisor Summary:\n\n"
        f"Case Type: {report['case_type']}\n\n"
        f"Summary:\n{report['summary']}\n\n"
        f"Risk Level: {risk['risk_level']}\n"
        f"Risk Score: {risk['risk_score']}\n\n"
        f"Important Dates:\n{format_list(dates)}\n\n"
        f"Missing Information:\n{format_list(missing)}\n\n"
        f"Risk Reasons:\n{format_list(risk['reasons'])}\n\n"
        "Recommended Supervisor Action:\n"
        "Review the case before final action, especially if the deadline is close or required "
        "information is missing."
    )


def create_worker_checklist(report: Dict) -> str:
    missing = report["missing_information"]
    dates = report["important_dates"]

    checklist = [
        "Read the submitted case note.",
        "Confirm the main request or issue.",
    ]

    if missing:
        checklist.append("Request the missing information from the person.")
    else:
        checklist.append("Confirm that no required information is missing.")

    if dates:
        checklist.append("Check the deadline and prioritize the case if needed.")

    checklist.extend(
        [
            "Review the risk level and risk reasons.",
            "Send the case to a human reviewer if the risk is medium or high.",
            "Draft a clear response to the person.",
            "Record the action taken in the audit log.",
            "Mark the case complete only after review.",
        ]
    )

    return "Worker Checklist:\n\n" + format_numbered_list(checklist)


def create_final_report(report: Dict, quality: Dict, audit_log: List[str]) -> str:
    risk = report["risk"]

    return (
        "Final Case Report\n\n"
        f"Case Type:\n{report['case_type']}\n\n"
        f"Summary:\n{report['summary']}\n\n"
        f"Important Dates:\n{format_list(report['important_dates'])}\n\n"
        f"Missing Information:\n{format_list(report['missing_information'])}\n\n"
        f"Risk Level:\n{risk['risk_level']}\n\n"
        f"Risk Score:\n{risk['risk_score']}\n\n"
        f"Risk Reasons:\n{format_list(risk['reasons'])}\n\n"
        f"Recommended Steps:\n{format_numbered_list(report['recommended_steps'])}\n\n"
        f"Draft Message:\n{report['draft_message']}\n\n"
        f"Quality Status:\n{quality['quality_status']}\n\n"
        f"Quality Warnings:\n{format_list(quality['warnings'])}\n\n"
        f"Audit Log:\n{format_numbered_list(audit_log)}"
    )


def answer_general_question(user_message: str, report: Dict) -> str:
    missing = report["missing_information"]
    dates = report["important_dates"]
    risk = report["risk"]

    return (
        "Based on the case text, here is the most useful answer:\n\n"
        f"{report['summary']}\n\n"
        f"Risk Level: {risk['risk_level']}\n\n"
        f"Missing Information:\n{format_list(missing)}\n\n"
        f"Important Dates:\n{format_list(dates)}\n\n"
        "Recommended first action:\n"
        f"{create_first_action(report)}"
    )


def get_chat_response(user_message: str, case_text: str = "") -> Dict:
    if not case_text.strip():
        return {
            "reply": (
                "Paste a case note or document text first. Then I can help you summarize it, "
                "find missing information, explain the risk, create a checklist, draft an email, "
                "write a supervisor summary, or generate a final report."
            ),
            "source": "Arqivo AI Assistant",
        }

    analysis = build_full_case_analysis(case_text)
    report = analysis["report"]
    quality = analysis["quality"]
    audit_log = analysis["audit_log"]

    message = user_message.lower().strip()

    if not message:
        return {
            "reply": "Ask me a question about the case, or choose one of the suggested actions.",
            "source": "Arqivo AI Assistant",
        }

    if (
        "simple" in message
        or "explain" in message
        or "new employee" in message
        or "understand" in message
        or "what is this case" in message
    ):
        return {
            "reply": create_plain_explanation(report),
            "source": "Case Explanation Assistant",
        }

    if "first" in message or "worker do" in message or "do first" in message:
        return {
            "reply": create_first_action(report),
            "source": "Action Planning Assistant",
        }

    if (
        "professional email" in message
        or "nicer email" in message
        or "email" in message
        or "draft" in message
        or "response" in message
    ):
        return {
            "reply": create_professional_email(report),
            "source": "Communication Assistant",
        }

    if "supervisor" in message or "manager" in message or "brief" in message:
        return {
            "reply": create_supervisor_summary(report),
            "source": "Supervisor Summary Assistant",
        }

    if "checklist" in message or "steps" in message or "task list" in message or "todo" in message:
        return {
            "reply": create_worker_checklist(report),
            "source": "Workflow Planning Assistant",
        }

    if "report" in message or "final" in message:
        return {
            "reply": create_final_report(report, quality, audit_log),
            "source": "Report Assistant",
        }

    if "missing" in message or "required" in message or "need" in message:
        missing = report["missing_information"]

        if missing:
            reply = (
                "The case appears to be missing the following information:\n\n"
                f"{format_list(missing)}\n\n"
                "This matters because the case may not be ready for full review until the "
                "missing information is provided."
            )
        else:
            reply = "I do not see obvious missing information based on the current case rules."

        return {
            "reply": reply,
            "source": "Missing Information Assistant",
        }

    if "risk" in message or "risky" in message or "problem" in message or "urgent" in message:
        risk = report["risk"]

        return {
            "reply": (
                f"The risk level is {risk['risk_level']}.\n\n"
                f"Risk score: {risk['risk_score']}\n\n"
                f"Reasons:\n{format_list(risk['reasons'])}\n\n"
                "This means the case should be reviewed carefully before any final action is taken."
            ),
            "source": "Risk Review Assistant",
        }

    if "summary" in message or "summarize" in message:
        return {
            "reply": report["summary"],
            "source": "Summary Assistant",
        }

    if "quality" in message or "review" in message:
        return {
            "reply": (
                f"Quality Status: {quality['quality_status']}\n\n"
                f"Warnings:\n{format_list(quality['warnings'])}\n\n"
                "A human reviewer should still confirm the final response before it is used."
            ),
            "source": "Quality Review Assistant",
        }

    if "audit" in message or "log" in message or "history" in message:
        return {
            "reply": "Audit Log:\n\n" + format_numbered_list(audit_log),
            "source": "Audit Assistant",
        }

    return {
        "reply": answer_general_question(user_message, report),
        "source": "Arqivo AI Assistant",
    }