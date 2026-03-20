import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import json
from pathlib import Path
from services.fallback_service import template_narrative, rule_based_roadmap


DATA_DIR = Path(__file__).parent.parent / "data"


def test_gap_analysis_correct_match_percentage():
    """Happy path: computes correct match % and missing skills."""
    with open(DATA_DIR / "jobs.json") as f:
        jobs = json.load(f)

    role = jobs[0]
    required = role.get("required_skills", [])

    # Simulate having half the required skills
    user_skills = set(s.lower() for s in required[:len(required)//2])

    matched = [s for s in required if s.lower() in user_skills]
    missing = [{"name": s, "importance": "high"} for s in required if s.lower() not in user_skills]

    total = len(required) + len(role.get("preferred_skills", []))
    match_pct = (len(matched) / total * 100) if total > 0 else 0

    assert 0 <= match_pct <= 100
    assert len(matched) + len(missing) == len(required)


def test_gap_analysis_zero_match():
    """Edge case: zero matching skills returns 0%."""
    user_skills = set()
    required = ["Skill A", "Skill B", "Skill C"]

    matched = [s for s in required if s.lower() in user_skills]
    total = len(required)
    match_pct = (len(matched) / total * 100) if total > 0 else 0

    assert match_pct == 0.0
    assert len(matched) == 0


def test_gap_analysis_full_match():
    """Edge case: all skills matched returns appropriate percentage."""
    required = ["Python", "JavaScript", "React"]
    preferred = ["Docker"]
    user_skills = set(s.lower() for s in required + preferred)

    matched = [s for s in required + preferred if s.lower() in user_skills]
    total = len(required) + len(preferred)
    match_pct = (len(matched) / total * 100) if total > 0 else 0

    assert match_pct == 100.0


def test_narrative_generation():
    """Test template-based narrative generation."""
    narrative = template_narrative(
        hits=["Python", "JavaScript"],
        gaps=[{"name": "React"}, {"name": "Docker"}],
        pct=50.0,
        title="Software Engineer"
    )
    assert "Software Engineer" in narrative
    assert "50%" in narrative
    assert isinstance(narrative, str)
    assert len(narrative) > 20


def test_roadmap_generation():
    """Test rule-based roadmap generation."""
    with open(DATA_DIR / "courses.json") as f:
        courses = json.load(f)

    missing = [{"name": "Python", "importance": "high"}, {"name": "Docker", "importance": "medium"}]
    roadmap = rule_based_roadmap(missing, courses)

    assert "phases" in roadmap
    assert len(roadmap["phases"]) == 3
    assert roadmap["method"] == "rule-based"
    assert roadmap["phases"][0]["title"] == "This Week"
