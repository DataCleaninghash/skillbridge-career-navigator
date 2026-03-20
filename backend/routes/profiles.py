from fastapi import APIRouter, HTTPException
from models import NewProfile, ProfilePatch
from database import Database

router = APIRouter(tags=["profiles"])


@router.post("/profiles", status_code=201)
def create_profile(body: NewProfile):
    return Database.insert_profile(body.model_dump())


@router.get("/profiles/{pid}")
def read_profile(pid: int):
    profile = Database.fetch_profile(pid)
    if not profile:
        raise HTTPException(404, "Profile not found")
    return profile


@router.put("/profiles/{pid}")
def update_profile(pid: int, body: ProfilePatch):
    if not Database.fetch_profile(pid):
        raise HTTPException(404, "Profile not found")
    return Database.patch_profile(pid, body.model_dump(exclude_none=True))
