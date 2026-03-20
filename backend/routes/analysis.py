import json
from pathlib import Path
from collections import Counter
from fastapi import APIRouter, HTTPException, Query
from database import Database
from services.gap_engine import run_gap_analysis, build_roadmap

router = APIRouter(tags=["analysis"])
_DATA = Path(__file__).parent.parent / "data"


@router.get("/profiles/{pid}/analysis")
async def gap_analysis(pid: int):
    profile = Database.fetch_profile(pid)
    if not profile:
        raise HTTPException(404, "Profile not found")
    if not profile.get("target_role_id"):
        raise HTTPException(400, "Select a target role first")
    return await run_gap_analysis(profile)


@router.get("/profiles/{pid}/roadmap")
async def learning_roadmap(pid: int):
    profile = Database.fetch_profile(pid)
    if not profile:
        raise HTTPException(404, "Profile not found")
    if not profile.get("target_role_id"):
        raise HTTPException(400, "Select a target role first")
    return await build_roadmap(profile)


@router.get("/profiles/{pid}/recommendations")
async def recommend_roles(pid: int):
    profile = Database.fetch_profile(pid)
    if not profile:
        raise HTTPException(404, "Profile not found")
    jobs = json.loads((_DATA / "jobs.json").read_text())
    owned = {s.lower() for s in profile.get("skills", [])}
    scored = []
    for j in jobs:
        pool = {s.lower() for s in j.get("required_skills", []) + j.get("preferred_skills", [])}
        if not pool:
            continue
        hits = owned & pool
        pct = round(len(hits) / len(pool) * 100, 1)
        scored.append({**j, "match_percentage": pct, "matched_count": len(hits), "total_count": len(pool)})
    scored.sort(key=lambda x: -x["match_percentage"])
    return {"recommendations": scored[:8]}


@router.get("/skill-trends")
async def skill_demand():
    jobs = json.loads((_DATA / "jobs.json").read_text())
    counts = Counter()
    for j in jobs:
        for s in j.get("required_skills", []) + j.get("preferred_skills", []):
            counts[s] += 1
    n = len(jobs)
    trends = {}
    for skill, cnt in counts.items():
        ratio = cnt / n * 100
        if ratio >= 15:
            trends[skill.lower()] = "hot"
        elif ratio >= 8:
            trends[skill.lower()] = "in-demand"
        elif ratio >= 4:
            trends[skill.lower()] = "emerging"
    return {"trends": trends, "total_jobs": n}


@router.get("/profiles/{pid}/progress")
async def read_progress(pid: int):
    return Database.get_progress(pid)


@router.post("/profiles/{pid}/progress")
async def write_progress(pid: int, body: dict):
    return Database.set_progress(pid, body["skill_name"], body["completed"])


@router.get("/roles/compare")
async def compare_two_roles(
    role_id_1: int = Query(...),
    role_id_2: int = Query(...),
    profile_id: int = Query(None),
):
    jobs = json.loads((_DATA / "jobs.json").read_text())
    r1 = next((j for j in jobs if j["id"] == role_id_1), None)
    r2 = next((j for j in jobs if j["id"] == role_id_2), None)
    if not r1 or not r2:
        raise HTTPException(404, "Role not found")
    owned = set()
    if profile_id:
        p = Database.fetch_profile(profile_id)
        if p:
            owned = {s.lower() for s in p.get("skills", [])}

    def score(role):
        req = {s.lower() for s in role.get("required_skills", [])}
        pref = {s.lower() for s in role.get("preferred_skills", [])}
        pool = req | pref
        matched = owned & pool if owned else set()
        return {"match_percentage": round(len(matched) / len(pool) * 100, 1) if pool else 0, "matched_skills": sorted(matched), "missing_skills": sorted(pool - owned) if owned else sorted(pool)}

    req1 = {s.lower() for s in r1.get("required_skills", [])}
    req2 = {s.lower() for s in r2.get("required_skills", [])}
    return {
        "role1": {**r1, **score(r1)},
        "role2": {**r2, **score(r2)},
        "common_skills": sorted(req1 & req2),
        "unique_to_role1": sorted(req1 - req2),
        "unique_to_role2": sorted(req2 - req1),
    }
