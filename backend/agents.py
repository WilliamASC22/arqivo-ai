from typing import Dict, List


REQUIRED_DOCUMENTS = {
    "housing": ["ID", "proof of address", "proof of income"],
    "student": ["student ID", "degree audit", "course list"],
    "refund": ["order number", "receipt", "bank statement"],
}


def intake_agent(text: str) -> Dict:
    lowered = text.lower()

    case_type = "general"

    if "rent" in lowered or "housing" in lowered:
        case_type = "housing"
    elif "student" in lowered or "graduating" in lowered or "registration" in lowered:
        case_type = "student"
    elif "refund" in lowered or "charged" in lowered or "order" in lowered:
        case_type = "refund"

    important_dates = []

    if "may 30" in lowered:
        important_dates.append("May 30")
    if "next week" in lowered:
        important_dates.append("Next week")
    if "tomorrow" in lowered:
        important_dates.append("Tomorrow")

    detected_keywords = [
        word
        for word in ["deadline", "missing", "urgent", "refund", "rent", "student"]
        if word in lowered
    ]

    return {
        "case_type": case_type,
        "important_dates": important_dates,
        "detected_keywords": detected_keywords,
    }


def summary_agent(text: str, intake: Dict) -> str:
    case_type = intake["case_type"]

    if case_type == "housing":
        return (
            "This case is about a rent assistance request. The person submitted "
            "some documents, but the case may be incomplete because proof of income "
            "appears to be missing."
        )

    if case_type == "student":
        return (
            "This case is about a student who needs advising support to stay on track "
            "for graduation and registration."
        )

    if case_type == "refund":
        return (
            "This case is about a customer who believes they were charged twice and "
            "needs a refund review."
        )

    return (
        "This case contains a request that needs to be reviewed, organized, and assigned "
        "clear next steps."
    )


def missing_info_agent(text: str, case_type: str) -> List[str]:
    lowered = text.lower()
    required = REQUIRED_DOCUMENTS.get(case_type, [])
    missing = []

    for item in required:
        item_lower = item.lower()

        negative_phrases = [
            f"did not include {item_lower}",
            f"does not include {item_lower}",
            f"missing {item_lower}",
            f"without {item_lower}",
        ]

        if any(phrase in lowered for phrase in negative_phrases):
            missing.append(item)
        elif item_lower not in lowered:
            missing.append(item)

    return list(dict.fromkeys(missing))


def risk_agent(text: str, missing_info: List[str], intake: Dict) -> Dict:
    lowered = text.lower()
    risk_score = 0
    reasons = []

    if missing_info:
        risk_score += 2
        reasons.append("Required information is missing.")

    if "deadline" in lowered or intake["important_dates"]:
        risk_score += 2
        reasons.append("The case mentions a deadline.")

    if "as soon as possible" in lowered or "urgent" in lowered or "tomorrow" in lowered:
        risk_score += 1
        reasons.append("The message sounds time-sensitive.")

    if "ignore previous instructions" in lowered or "ignore all instructions" in lowered:
        risk_score += 3
        reasons.append("Possible prompt injection attempt detected.")

    if risk_score >= 4:
        level = "High"
    elif risk_score >= 2:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_level": level,
        "risk_score": risk_score,
        "reasons": reasons,
    }


def planner_agent(case_type: str, missing_info: List[str], risk: Dict) -> List[str]:
    steps = []

    steps.append("Review the submitted information and confirm the main request.")

    if missing_info:
        steps.append(
            "Ask the person to provide the missing information: "
            + ", ".join(missing_info)
            + "."
        )

    if risk["risk_level"] in ["Medium", "High"]:
        steps.append("Send the case to a human reviewer before taking final action.")

    steps.append("Prepare a clear response explaining what is needed or what will happen next.")
    steps.append("Update the audit log with the action taken.")
    steps.append("Mark the case complete only after the review is finished.")

    return steps


def message_agent(case_type: str, missing_info: List[str]) -> str:
    if missing_info:
        return (
            "Subject: Additional Information Needed for Your Request\n\n"
            "Hello,\n\n"
            "Thank you for submitting your request. We reviewed the information you provided, "
            "and we noticed that the following item is still needed before the review can continue:\n\n"
            + "\n".join([f"- {item}" for item in missing_info])
            + "\n\nPlease provide this information so your case can continue through the review process.\n\n"
            "Best,\n"
            "[Your Name]\n"
            "[Your Role / Organization]"
        )

    return (
        "Subject: Your Request Is Ready for Review\n\n"
        "Hello,\n\n"
        "Thank you for submitting your request. We reviewed the information provided, "
        "and your case appears ready for the next step in the review process.\n\n"
        "A reviewer will follow up if any additional information is needed.\n\n"
        "Best,\n"
        "[Your Name]\n"
        "[Your Role / Organization]"
    )


def report_agent(
    summary: str,
    intake: Dict,
    missing_info: List[str],
    risk: Dict,
    steps: List[str],
    draft_message: str,
) -> Dict:
    return {
        "summary": summary,
        "case_type": intake["case_type"],
        "important_dates": intake["important_dates"],
        "missing_information": missing_info,
        "risk": risk,
        "recommended_steps": steps,
        "draft_message": draft_message,
    }


def quality_agent(report: Dict) -> Dict:
    warnings = []

    if not report["summary"]:
        warnings.append("Summary is missing.")

    if report["risk"]["risk_level"] == "High":
        warnings.append("High-risk case should be reviewed by a human.")

    if report["missing_information"] and "missing" not in report["draft_message"].lower():
        warnings.append("Draft message may not clearly mention missing information.")

    return {
        "quality_status": "Needs Review" if warnings else "Looks Good",
        "warnings": warnings,
    }


def run_all_agents(text: str) -> Dict:
    intake = intake_agent(text)
    summary = summary_agent(text, intake)
    missing = missing_info_agent(text, intake["case_type"])
    risk = risk_agent(text, missing, intake)
    steps = planner_agent(intake["case_type"], missing, risk)
    draft = message_agent(intake["case_type"], missing)
    report = report_agent(summary, intake, missing, risk, steps, draft)
    quality = quality_agent(report)

    audit_log = [
        "Case submitted.",
        "Intake Agent extracted key details.",
        "Summary Agent created a plain-English summary.",
        "Missing Information Agent checked required fields.",
        "Risk Agent evaluated possible issues.",
        "Planner Agent created next steps.",
        "Message Agent drafted a response.",
        "Quality Agent reviewed the output.",
    ]

    return {
        "report": report,
        "quality_check": quality,
        "audit_log": audit_log,
    }