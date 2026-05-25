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

    return {
        "case_type": case_type,
        "important_dates": important_dates,
        "detected_keywords": [
            word
            for word in ["deadline", "missing", "urgent", "refund", "rent", "student"]
            if word in lowered
        ],
    }


def summary_agent(text: str, intake: Dict) -> str:
    case_type = intake["case_type"]

    if case_type == "housing":
        return "This case is about a rent assistance request where some documents were submitted, but proof of income may be missing."

    if case_type == "student":
        return "This case is about a student who needs advising support to stay on track for graduation and registration."

    if case_type == "refund":
        return "This case is about a customer who believes they were charged twice and needs a refund review."

    return "This case contains a request that needs to be reviewed, organized, and assigned next steps."


def missing_info_agent(text: str, case_type: str) -> List[str]:
    lowered = text.lower()
    required = REQUIRED_DOCUMENTS.get(case_type, [])
    missing = []

    for item in required:
        if item.lower() not in lowered:
            missing.append(item)

    if "did not include proof of income" in lowered:
        if "proof of income" not in missing:
            missing.append("proof of income")

    return missing


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
    steps = ["Review the submitted information."]

    if missing_info:
        steps.append(
            "Ask the user to provide the missing information: "
            + ", ".join(missing_info)
            + "."
        )

    if risk["risk_level"] in ["Medium", "High"]:
        steps.append("Send the case to a human reviewer before taking final action.")

    steps.append("Prepare a clear response explaining the next step.")
    steps.append("Mark the case as complete after review.")

    return steps


def message_agent(case_type: str, missing_info: List[str]) -> str:
    if missing_info:
        return (
            "Hello,\n\n"
            "Thank you for submitting your request. We reviewed the information provided and noticed that "
            f"the following item is still missing: {', '.join(missing_info)}. "
            "Please provide this information so the case can continue to be reviewed.\n\n"
            "Best,\nArqivo AI Team"
        )

    return (
        "Hello,\n\n"
        "Thank you for submitting your request. We reviewed the information provided and your case is ready "
        "for the next step in the review process.\n\n"
        "Best,\nArqivo AI Team"
    )


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

    report = {
        "summary": summary,
        "case_type": intake["case_type"],
        "important_dates": intake["important_dates"],
        "missing_information": missing,
        "risk": risk,
        "recommended_steps": steps,
        "draft_message": draft,
    }

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