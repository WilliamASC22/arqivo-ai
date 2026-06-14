from typing import Dict, List


REQUIRED_DOCUMENTS = {
    "housing": ["ID", "proof of address", "proof of income"],
    "student": ["student ID", "degree audit", "course list"],
    "refund": ["order number", "receipt", "bank statement"],
    "benefits": ["ID", "proof of residency", "income information"],
    "documents": ["notice", "explanation", "verification document"],
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
    elif "benefits" in lowered or "renewal" in lowered:
        case_type = "benefits"
    elif "missing paperwork" in lowered or "verification document" in lowered:
        case_type = "documents"

    important_dates = []

    if "may 30" in lowered:
        important_dates.append("May 30")
    if "june 15" in lowered:
        important_dates.append("June 15")
    if "june 28" in lowered:
        important_dates.append("June 28")
    if "july 3" in lowered:
        important_dates.append("July 3")
    if "next week" in lowered:
        important_dates.append("Next week")
    if "tomorrow" in lowered:
        important_dates.append("Tomorrow")

    detected_keywords = [
        word
        for word in [
            "deadline",
            "missing",
            "urgent",
            "refund",
            "rent",
            "student",
            "benefits",
            "renewal",
            "documents",
            "paperwork",
            "verification",
        ]
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
            "This case is about a rent or housing assistance request. The person submitted "
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

    if case_type == "benefits":
        return (
            "This case is about a benefits renewal request. The review may be delayed "
            "because income information appears incomplete."
        )

    if case_type == "documents":
        return (
            "This case is about missing paperwork or a requested verification document. "
            "The person needs clear next steps about what to submit."
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
            f"{item_lower} is incomplete",
            f"incomplete {item_lower}",
        ]

        if any(phrase in lowered for phrase in negative_phrases):
            missing.append(item)
        elif item_lower not in lowered:
            missing.append(item)

    if "income section is incomplete" in lowered and "income information" not in missing:
        missing.append("income information")

    if "did not include proof of income" in lowered and "proof of income" not in missing:
        missing.append("proof of income")

    if (
        "did not include the requested verification document" in lowered
        and "verification document" not in missing
    ):
        missing.append("verification document")

    return list(dict.fromkeys(missing))


def deadline_agent(text: str, intake: Dict) -> Dict:
    lowered = text.lower()
    dates = intake.get("important_dates", [])
    deadline_terms = [
        "deadline",
        "due",
        "notice period",
        "registration closes",
        "as soon as possible",
        "urgent",
        "tomorrow",
        "next week",
    ]

    found_terms = [term for term in deadline_terms if term in lowered]

    if dates or found_terms:
        urgency = "Time-sensitive"
    else:
        urgency = "No clear deadline found"

    return {
        "urgency_status": urgency,
        "important_dates": dates,
        "deadline_terms": found_terms,
    }


def document_agent(text: str, case_type: str, missing_info: List[str]) -> Dict:
    lowered = text.lower()
    required_documents = REQUIRED_DOCUMENTS.get(case_type, [])
    included_documents = []

    for document in required_documents:
        document_lower = document.lower()

        negative_phrases = [
            f"did not include {document_lower}",
            f"does not include {document_lower}",
            f"missing {document_lower}",
            f"without {document_lower}",
        ]

        if document_lower in lowered and not any(
            phrase in lowered for phrase in negative_phrases
        ):
            included_documents.append(document)

    return {
        "required_documents": required_documents,
        "included_documents": included_documents,
        "missing_documents": missing_info,
        "document_status": "Incomplete" if missing_info else "Ready for review",
    }


def eligibility_agent(case_type: str, missing_info: List[str], deadline: Dict) -> Dict:
    if missing_info:
        status = "May not be ready for final review"
        reason = "Required information is missing."
    elif deadline["urgency_status"] == "Time-sensitive":
        status = "Ready for review, but time-sensitive"
        reason = "No missing documents were found, but the case mentions a deadline or urgent timing."
    else:
        status = "Ready for review"
        reason = "No obvious missing information was found."

    return {
        "eligibility_status": status,
        "reason": reason,
        "case_type": case_type,
    }


def priority_agent(risk: Dict, deadline: Dict, missing_info: List[str]) -> Dict:
    if risk["risk_level"] == "High":
        priority = "High"
        reason = "The case has high risk and should be reviewed quickly."
    elif deadline["urgency_status"] == "Time-sensitive" or missing_info:
        priority = "Medium"
        reason = "The case has a deadline or missing information."
    else:
        priority = "Normal"
        reason = "No urgent deadline or major missing information was found."

    return {
        "priority_level": priority,
        "reason": reason,
    }


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

    if "notice period" in lowered or "registration closes" in lowered:
        risk_score += 1
        reasons.append("The case may have a limited review window.")

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


def planner_agent(
    case_type: str,
    missing_info: List[str],
    risk: Dict,
    deadline: Dict,
    priority: Dict,
) -> List[str]:
    steps = []

    steps.append("Review the submitted information and confirm the main request.")

    if missing_info:
        steps.append(
            "Ask the person to provide the missing information: "
            + ", ".join(missing_info)
            + "."
        )

    if deadline["urgency_status"] == "Time-sensitive":
        steps.append("Check the deadline and decide whether the case needs faster review.")

    if priority["priority_level"] in ["Medium", "High"]:
        steps.append(
            "Place the case in the "
            + priority["priority_level"].lower()
            + " priority review group."
        )

    if risk["risk_level"] in ["Medium", "High"]:
        steps.append("Send the case to a human reviewer before taking final action.")

    steps.append("Prepare a clear response explaining what is needed or what will happen next.")
    steps.append("Update the audit log with the action taken.")
    steps.append("Mark the case complete only after the review is finished.")

    return steps


def tone_agent(draft_message: str) -> Dict:
    improved_message = draft_message

    if "Hello," not in improved_message:
        improved_message = "Hello,\n\n" + improved_message

    if "[Your Name]" not in improved_message:
        improved_message += "\n\nBest,\n[Your Name]"

    return {
        "tone_status": "Professional and review-ready",
        "notes": [
            "The message uses polite language.",
            "The message clearly explains what is needed next.",
            "The message leaves final approval to a human reviewer.",
        ],
        "improved_message": improved_message,
    }


def safety_agent(text: str) -> Dict:
    lowered = text.lower()
    warnings = []

    sensitive_terms = [
        "social security",
        "ssn",
        "medical record",
        "bank account",
        "credit card",
        "password",
        "private",
        "confidential",
    ]

    for term in sensitive_terms:
        if term in lowered:
            warnings.append(f"Possible sensitive term found: {term}")

    if "@" in text:
        warnings.append("Possible email address detected.")

    has_number_sequence = any(character.isdigit() for character in text)

    if has_number_sequence and len([char for char in text if char.isdigit()]) >= 9:
        warnings.append("Possible ID number or long number sequence detected.")

    return {
        "safety_status": "Needs privacy review" if warnings else "No obvious sensitive information found",
        "warnings": warnings,
    }


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
    deadline: Dict,
    documents: Dict,
    eligibility: Dict,
    priority: Dict,
    tone: Dict,
    safety: Dict,
) -> Dict:
    return {
        "summary": summary,
        "case_type": intake["case_type"],
        "important_dates": intake["important_dates"],
        "missing_information": missing_info,
        "risk": risk,
        "recommended_steps": steps,
        "draft_message": tone["improved_message"],
        "agent_checks": {
            "deadline": deadline,
            "documents": documents,
            "eligibility": eligibility,
            "priority": priority,
            "tone": tone,
            "safety": safety,
        },
    }


def quality_agent(report: Dict) -> Dict:
    warnings = []

    if not report["summary"]:
        warnings.append("Summary is missing.")

    if report["risk"]["risk_level"] == "High":
        warnings.append("High-risk case should be reviewed by a human.")

    if report["missing_information"] and "missing" not in report["draft_message"].lower():
        warnings.append("Draft message may not clearly mention missing information.")

    safety = report.get("agent_checks", {}).get("safety", {})
    safety_warnings = safety.get("warnings", [])

    if safety_warnings:
        warnings.append("Possible sensitive information should be reviewed or removed.")

    return {
        "quality_status": "Needs Review" if warnings else "Looks Good",
        "warnings": warnings,
    }


def audit_log_agent() -> List[str]:
    return [
        "Case submitted.",
        "Safety Agent checked for possible sensitive information.",
        "Intake Agent extracted the case type, dates, and keywords.",
        "Summary Agent created a plain-English summary.",
        "Missing Information Agent checked required fields.",
        "Document Agent compared included documents against required documents.",
        "Deadline Agent checked for due dates and time-sensitive language.",
        "Risk Agent evaluated missing information, deadlines, urgency, and suspicious text.",
        "Eligibility Agent estimated whether the case is ready for review.",
        "Priority Agent assigned a review priority.",
        "Planner Agent created next steps.",
        "Message Agent drafted a response.",
        "Tone Agent checked that the message is professional and review-ready.",
        "Quality Agent reviewed the output.",
        "Audit Log Agent recorded the workflow.",
    ]


def run_all_agents(text: str) -> Dict:
    safety = safety_agent(text)
    intake = intake_agent(text)
    summary = summary_agent(text, intake)
    missing = missing_info_agent(text, intake["case_type"])
    deadline = deadline_agent(text, intake)
    documents = document_agent(text, intake["case_type"], missing)
    risk = risk_agent(text, missing, intake)
    eligibility = eligibility_agent(intake["case_type"], missing, deadline)
    priority = priority_agent(risk, deadline, missing)
    steps = planner_agent(intake["case_type"], missing, risk, deadline, priority)
    draft = message_agent(intake["case_type"], missing)
    tone = tone_agent(draft)

    report = report_agent(
        summary,
        intake,
        missing,
        risk,
        steps,
        draft,
        deadline,
        documents,
        eligibility,
        priority,
        tone,
        safety,
    )

    quality = quality_agent(report)
    audit_log = audit_log_agent()

    return {
        "report": report,
        "quality_check": quality,
        "audit_log": audit_log,
    }