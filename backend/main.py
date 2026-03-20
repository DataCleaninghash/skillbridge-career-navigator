"""SkillBridge API — Career Navigation Backend"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Database
from routes import profiles, roles, analysis, skills


@asynccontextmanager
async def on_startup(application: FastAPI):
    Database.initialize()
    yield


server = FastAPI(
    title="SkillBridge API",
    description="Career navigation and skill gap analysis service",
    version="2.0.0",
    lifespan=on_startup,
)

server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router_module in [profiles, roles, analysis, skills]:
    server.include_router(router_module.router, prefix="/api")


@server.get("/api/health", tags=["system"])
def healthcheck():
    return {"status": "healthy", "service": "SkillBridge API"}

# alias for uvicorn
app = server
