"""Rule-based / fallback implementations for skill extraction and analysis"""
import re
import json
from pathlib import Path

_ASSETS = Path(__file__).parent.parent / "data"


def _load_catalog() -> list[dict]:
    return json.loads((_ASSETS / "skill_dictionary.json").read_text())


def keyword_skill_matcher(text: str) -> dict:
    """Identify skills in resume text via regex word-boundary matching."""
    catalog = _load_catalog()
    normalized = text.lower()
    detected: list[str] = []

    for entry in catalog:
        canonical = entry["name"]
        candidates = [canonical.lower()] + [a.lower() for a in entry.get("aliases", [])]
        for token in candidates:
            # Use regex word boundaries for accurate matching
            pattern = r"(?<![a-zA-Z0-9])" + re.escape(token) + r"(?![a-zA-Z0-9])"
            if re.search(pattern, normalized):
                if canonical not in detected:
                    detected.append(canonical)
                break

    return {
        "skills": detected,
        "method": "rule-based",
        "confidence": 0.7,
    }


def template_narrative(
    hits: list, gaps: list, pct: float, title: str
) -> str:
    """Build a gap-analysis narrative from templates."""
    if pct >= 80:
        grade = "excellent"
        guidance = (
            "You're strongly aligned with this role. "
            "Closing the few remaining gaps will make you an outstanding candidate."
        )
    elif pct >= 60:
        grade = "good"
        guidance = (
            "You bring a solid skill set to the table. "
            "Focused upskilling on the missing areas will boost your competitiveness."
        )
    elif pct >= 40:
        grade = "moderate"
        guidance = (
            "You possess some relevant capabilities but notable gaps exist. "
            "A structured learning plan is recommended."
        )
    else:
        grade = "developing"
        guidance = (
            "This role demands significant skill growth. "
            "Begin with foundational topics and progress step by step."
        )

    priority_gaps = [g["name"] for g in gaps[:3]]
    gap_summary = ", ".join(priority_gaps) if priority_gaps else "none identified"

    return (
        f"Your readiness for {title} is {grade} at {pct:.0f}%. "
        f"You currently possess {len(hits)} of the required skills. "
        f"Top gaps to address: {gap_summary}. "
        f"{guidance}"
    )


def rule_based_roadmap(gaps: list, courses: list) -> dict:
    """Produce a learning roadmap by mapping missing skills to available courses."""
    phases = [
        {"phase": 1, "title": "This Week", "duration": "1 week", "items": []},
        {"phase": 2, "title": "This Month", "duration": "1 month", "items": []},
        {"phase": 3, "title": "Next 3 Months", "duration": "3 months", "items": []},
    ]

    for idx, gap in enumerate(gaps):
        skill_label = gap["name"]

        # Search for a course that teaches this skill
        matched_course = None
        for c in courses:
            covered = [s.lower() for s in c.get("skills_covered", [])]
            if skill_label.lower() in covered:
                matched_course = c
                break

        resource_title = (
            matched_course["title"] if matched_course
            else f"Search for {skill_label} tutorials"
        )
        resource_url = matched_course.get("url", "") if matched_course else ""

        bucket = min(idx // 3, 2)
        phases[bucket]["items"].append({
            "skill": skill_label,
            "resource": resource_title,
            "url": resource_url,
            "priority": gap.get("importance", "medium"),
        })

    return {"phases": phases, "method": "rule-based"}
