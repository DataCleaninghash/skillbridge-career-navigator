"""Request/response schemas"""
from pydantic import BaseModel, field_validator
from typing import Optional


class NewProfile(BaseModel):
    name: str
    email: str
    resume_text: Optional[str] = ""
    skills: list[str] = []
    target_role_id: Optional[int] = None
    experience_level: str = "entry"

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Enter a valid email address")
        return v.strip().lower()

    @field_validator("experience_level")
    @classmethod
    def validate_level(cls, v):
        allowed = {"entry", "mid", "senior"}
        if v not in allowed:
            raise ValueError(f"Level must be one of: {', '.join(allowed)}")
        return v


class ProfilePatch(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    resume_text: Optional[str] = None
    skills: Optional[list[str]] = None
    target_role_id: Optional[int] = None
    experience_level: Optional[str] = None


class ResumeInput(BaseModel):
    resume_text: str

    @field_validator("resume_text")
    @classmethod
    def not_blank(cls, v):
        if not v.strip():
            raise ValueError("Resume text must not be empty")
        return v


class SkillResult(BaseModel):
    skills: list[str]
    method: str
    confidence: float


class GapResult(BaseModel):
    match_percentage: float
    matched_skills: list[str]
    missing_skills: list[dict]
    skill_categories: dict
    narrative: str
    method: str


class RoadmapResult(BaseModel):
    phases: list[dict]
    method: str
