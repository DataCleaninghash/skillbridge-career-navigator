"""OpenAI-powered skill extraction and career analysis"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

_ASSETS = Path(__file__).parent.parent / "data"


def _openai_client():
    key = os.getenv("OPENAI_API_KEY")
    if not key or key == "your_openai_api_key_here":
        raise RuntimeError("OpenAI API key is missing or not configured")
    from openai import OpenAI
    return OpenAI(api_key=key)


async def ai_extract_skills(text: str) -> dict:
    """Use GPT to identify skills present in resume text."""
    llm = _openai_client()

    catalog = json.loads((_ASSETS / "skill_dictionary.json").read_text())
    known_names = [entry["name"] for entry in catalog]

    completion = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": (
                "You are a highly accurate resume parser specialised in skill identification. "
                "Your task is to discover every technical skill, tool, technology, framework, "
                "methodology, platform, certification, soft skill, and domain expertise "
                "mentioned or implied in the provided resume text.\n\n"
                "Guidelines:\n"
                "- Aim for a minimum of 25-30 skills for any substantive resume\n"
                "- Cover programming languages, frameworks, libraries, databases, cloud services, "
                "DevOps tooling, security tools, methodologies (Agile, Scrum, etc.), interpersonal "
                "skills (leadership, communication), and industry knowledge\n"
                "- Be exhaustive — e.g. 'developed REST APIs' implies both 'REST API' and the "
                "associated framework\n"
                "- Derive implicit skills: React experience implies JavaScript, HTML, CSS\n"
                "- Treat certifications and methodologies as skills\n"
                "- Prefer matches from this reference list, but also include unlisted skills: "
                + json.dumps(known_names[:300]) + "\n\n"
                "Respond with a JSON object containing a single 'skills' array of strings. "
                "Target 25-40 skills."
            )},
            {"role": "user", "content": (
                "Thoroughly extract every skill from the following resume. "
                "Return at least 25 skills.\n\n" + text
            )},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=1000,
    )

    payload = json.loads(completion.choices[0].message.content)
    return {
        "skills": payload.get("skills", []),
        "method": "ai",
        "confidence": 0.9,
    }


async def ai_narrative(
    hits: list, gaps: list, pct: float, title: str
) -> str:
    """Produce a brief personalised gap-analysis narrative via GPT."""
    llm = _openai_client()

    gap_labels = [g["name"] for g in gaps[:10]]

    completion = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": (
                "You are an experienced career coach. Write a concise, encouraging, "
                "and personalised assessment (2-3 sentences) of a candidate's readiness "
                "for a specific role. Be concrete and suggest next steps."
            )},
            {"role": "user", "content": (
                f"Position: {title}\n"
                f"Match rate: {pct:.0f}%\n"
                f"Strengths: {', '.join(hits[:10])}\n"
                f"Gaps: {', '.join(gap_labels)}"
            )},
        ],
        temperature=0.7,
        max_tokens=200,
    )

    return completion.choices[0].message.content


async def ai_roadmap(
    gaps: list, courses: list, title: str
) -> dict:
    """Build a phased learning plan with GPT."""
    llm = _openai_client()

    course_briefs = [
        {
            "title": c["title"],
            "skills": c["skills_covered"],
            "difficulty": c["difficulty"],
            "duration_hours": c["duration_hours"],
            "cost": c.get("cost", "unknown"),
        }
        for c in courses[:30]
    ]
    gap_labels = [g["name"] for g in gaps]

    completion = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": (
                "You are a learning-path architect. Produce a structured roadmap as JSON "
                "with a 'phases' array. Each phase object: {phase: number, title: string, "
                "duration: string, items: [{skill: string, resource: string, url: string, "
                "priority: 'high'|'medium'|'low'}]}. Use exactly three phases: "
                "'This Week', 'This Month', 'Next 3 Months'."
            )},
            {"role": "user", "content": (
                f"Target position: {title}\n"
                f"Skills to acquire: {json.dumps(gap_labels)}\n"
                f"Course catalogue: {json.dumps(course_briefs)}"
            )},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=1000,
    )

    payload = json.loads(completion.choices[0].message.content)
    return {"phases": payload.get("phases", []), "method": "ai"}
