"""Core gap analysis and roadmap generation logic"""
import json
from pathlib import Path
from services.ai_service import ai_narrative, ai_roadmap
from services.fallback_service import template_narrative, rule_based_roadmap

_ASSETS = Path(__file__).parent.parent / "data"


def _read_jobs():
    return json.loads((_ASSETS / "jobs.json").read_text())


def _read_courses():
    return json.loads((_ASSETS / "courses.json").read_text())


async def run_gap_analysis(profile: dict) -> dict:
    """Compare a user's skills against their target role and produce a gap report."""
    jobs = _read_jobs()

    # Locate the target role
    target = None
    for entry in jobs:
        if entry["id"] == profile["target_role_id"]:
            target = entry
            break

    if target is None:
        return {"error": "Target role not found"}

    owned = {s.lower() for s in profile.get("skills", [])}
    req_set = {s.lower() for s in target.get("required_skills", [])}
    pref_set = {s.lower() for s in target.get("preferred_skills", [])}
    combined = req_set | pref_set

    hits: list[str] = []
    gaps: list[dict] = []

    for skill in target.get("required_skills", []):
        if skill.lower() in owned:
            hits.append(skill)
        else:
            gaps.append({"name": skill, "importance": "high", "suggested_resource": ""})

    for skill in target.get("preferred_skills", []):
        if skill.lower() in owned:
            hits.append(skill)
        else:
            gaps.append({"name": skill, "importance": "medium", "suggested_resource": ""})

    # Attach course suggestions to each gap
    courses = _read_courses()
    for g in gaps:
        for c in courses:
            covered = [s.lower() for s in c.get("skills_covered", [])]
            if g["name"].lower() in covered:
                g["suggested_resource"] = c["title"]
                break

    total = len(req_set) + len(pref_set)
    pct = (len(hits) / total * 100) if total else 0

    # Build per-category radar data
    categories: dict = {}
    for cat_name, cat_skills in target.get("skill_categories", {}).items():
        have = sum(1 for s in cat_skills if s.lower() in owned)
        categories[cat_name] = {
            "required": len(cat_skills),
            "matched": have,
            "percentage": (have / len(cat_skills) * 100) if cat_skills else 0,
        }

    # Narrative — prefer AI, fall back to template
    method = "rule-based"
    try:
        narrative = await ai_narrative(hits, gaps, pct, target["title"])
        method = "ai"
    except Exception:
        narrative = template_narrative(hits, gaps, pct, target["title"])

    return {
        "match_percentage": round(pct, 1),
        "matched_skills": hits,
        "missing_skills": gaps,
        "skill_categories": categories,
        "narrative": narrative,
        "method": method,
        "role": target,
    }


async def build_roadmap(profile: dict) -> dict:
    """Create a phased learning plan for a user's skill gaps."""
    report = await run_gap_analysis(profile)
    if "error" in report:
        return report

    gaps = report["missing_skills"]
    courses = _read_courses()

    try:
        plan = await ai_roadmap(gaps, courses, report["role"]["title"])
        return plan
    except Exception:
        return rule_based_roadmap(gaps, courses)
