from fastapi import APIRouter, HTTPException, UploadFile, File
from models import ResumeInput, SkillResult
from services.ai_service import ai_extract_skills
from services.fallback_service import keyword_skill_matcher

router = APIRouter(tags=["skills"])


@router.post("/extract-skills", response_model=SkillResult)
async def extract_from_text(body: ResumeInput):
    try:
        return await ai_extract_skills(body.resume_text)
    except Exception:
        return keyword_skill_matcher(body.resume_text)


@router.post("/extract-skills-pdf")
async def extract_from_pdf(file: UploadFile = File(...)):
    from PyPDF2 import PdfReader
    import io
    content = await file.read()
    try:
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(p.extract_text() or "" for p in reader.pages)
    except Exception:
        raise HTTPException(400, "Failed to parse PDF file")
    if not text.strip():
        raise HTTPException(400, "No text found in PDF")
    try:
        result = await ai_extract_skills(text)
    except Exception:
        result = keyword_skill_matcher(text)
    return {**result, "resume_text": text}
