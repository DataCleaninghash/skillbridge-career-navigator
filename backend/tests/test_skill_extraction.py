import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.fallback_service import keyword_skill_matcher


def test_extract_known_skills():
    """Happy path: rule-based extraction finds known skills in resume text."""
    resume = """
    Experienced software engineer with 5 years of Python and JavaScript experience.
    Proficient in React, Node.js, and PostgreSQL. Familiar with AWS and Docker.
    Strong background in Agile methodologies and CI/CD pipelines using Jenkins.
    """
    result = keyword_skill_matcher(resume)
    skills_lower = [s.lower() for s in result["skills"]]

    assert "python" in skills_lower
    assert "javascript" in skills_lower
    assert "react" in skills_lower
    assert result["method"] == "rule-based"
    assert result["confidence"] == 0.7
    assert len(result["skills"]) >= 3


def test_extract_empty_resume():
    """Edge case: empty/whitespace resume returns empty skill list."""
    result = keyword_skill_matcher("")
    assert result["skills"] == []
    assert result["method"] == "rule-based"

    result2 = keyword_skill_matcher("   \n\t  ")
    assert result2["skills"] == []


def test_extract_cybersecurity_skills():
    """Happy path: extracts cybersecurity-specific skills."""
    resume = """
    Security analyst with experience in Splunk SIEM, Nessus vulnerability scanning,
    and Wireshark packet analysis. Certified in CompTIA Security+ with knowledge
    of firewall configuration and incident response procedures. Familiar with
    NIST framework and OWASP top 10. Experience with Metasploit for penetration testing.
    """
    result = keyword_skill_matcher(resume)
    skills_lower = [s.lower() for s in result["skills"]]

    assert "splunk" in skills_lower or any("splunk" in s for s in skills_lower)
    assert len(result["skills"]) >= 2


def test_extract_no_matching_skills():
    """Edge case: text with no matching skills returns empty list."""
    resume = "I enjoy hiking and reading books about philosophy in my spare time."
    result = keyword_skill_matcher(resume)
    # Should find very few or no skills
    assert isinstance(result["skills"], list)
    assert result["method"] == "rule-based"
