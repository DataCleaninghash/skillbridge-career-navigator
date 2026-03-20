import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from fastapi.testclient import TestClient
from main import app
from database import Database
from pathlib import Path


@pytest.fixture(autouse=True)
def clean_db():
    """Use a test database."""
    test_db = Path(__file__).parent / "test.db"
    Database._path = test_db
    Database.initialize()
    yield
    if test_db.exists():
        test_db.unlink()


client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_profile():
    response = client.post("/api/profiles", json={
        "name": "Test User",
        "email": "test@example.com",
        "resume_text": "Experienced Python developer with AWS knowledge",
        "skills": ["Python", "AWS"],
        "experience_level": "mid"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert "id" in data


def test_get_profile():
    # Create first
    create_res = client.post("/api/profiles", json={
        "name": "Jane Doe",
        "email": "jane@example.com"
    })
    profile_id = create_res.json()["id"]

    response = client.get(f"/api/profiles/{profile_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Jane Doe"


def test_get_nonexistent_profile():
    response = client.get("/api/profiles/99999")
    assert response.status_code == 404


def test_update_profile():
    create_res = client.post("/api/profiles", json={
        "name": "Update Test",
        "email": "update@example.com"
    })
    profile_id = create_res.json()["id"]

    response = client.put(f"/api/profiles/{profile_id}", json={
        "skills": ["React", "TypeScript"]
    })
    assert response.status_code == 200
    assert "React" in response.json()["skills"]


def test_list_roles():
    response = client.get("/api/roles")
    assert response.status_code == 200
    data = response.json()
    assert "roles" in data
    assert "total" in data
    assert len(data["roles"]) > 0


def test_search_roles():
    response = client.get("/api/roles?search=security")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["roles"], list)


def test_filter_roles_by_industry():
    response = client.get("/api/roles?industry=cybersecurity")
    assert response.status_code == 200
    data = response.json()
    for role in data["roles"]:
        assert role["industry"].lower() == "cybersecurity"


def test_extract_skills_endpoint():
    response = client.post("/api/extract-skills", json={
        "resume_text": "Experienced Python developer with knowledge of JavaScript, React, Docker, and AWS. Worked on CI/CD pipelines and Agile teams."
    })
    assert response.status_code == 200
    data = response.json()
    assert "skills" in data
    assert "method" in data
    assert isinstance(data["skills"], list)


def test_extract_skills_empty_text():
    response = client.post("/api/extract-skills", json={
        "resume_text": ""
    })
    assert response.status_code == 422  # Validation error


def test_profile_validation():
    response = client.post("/api/profiles", json={
        "name": "",
        "email": "test@example.com"
    })
    assert response.status_code == 422
