import json
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(tags=["roles"])
_DATA = Path(__file__).parent.parent / "data"


def _load_roles():
    return json.loads((_DATA / "jobs.json").read_text())


@router.get("/roles")
def list_roles(
    search: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    roles = _load_roles()
    if search:
        q = search.lower()
        roles = [r for r in roles if q in r["title"].lower() or q in r.get("description", "").lower() or any(q in s.lower() for s in r.get("required_skills", []))]
    if industry:
        roles = [r for r in roles if r.get("industry", "").lower() == industry.lower()]
    if experience_level:
        roles = [r for r in roles if r.get("experience_level", "").lower() == experience_level.lower()]
    total = len(roles)
    return {"roles": roles[offset:offset + limit], "total": total, "limit": limit, "offset": offset}


@router.get("/roles/{rid}")
def read_role(rid: int):
    for r in _load_roles():
        if r["id"] == rid:
            return r
    raise HTTPException(404, "Role not found")
