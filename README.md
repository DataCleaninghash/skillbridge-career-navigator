# SkillBridge v2

> **Demo:** [https://youtu.be/ltAo5QsY6AM](https://youtu.be/ltAo5QsY6AM)

Career intelligence platform. Upload your resume, identify skill gaps against target roles, get a personalized learning path.

---

**Candidate:** Shyamal Narang
**Scenario:** Skill-Bridge Career Navigator
**Time Spent:** ~5.5 hours

---

## Setup

```bash
# Backend
cd backend && pip install -r requirements.txt
cp ../.env.example ../.env  # add OpenAI key (optional)
uvicorn main:app --reload    # localhost:8000

# Frontend
cd frontend && npm install && npm run dev  # localhost:5173

# Tests
cd backend && pytest tests/ -v    # 20 tests
cd frontend && npx vitest run     # 9 tests
```

**Requirements:** Python 3.10+, Node 18+. Works without OpenAI key (rule-based fallback).

---

## Stack

| | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Python, FastAPI, SQLite, Pydantic |
| **AI** | OpenAI GPT-4o-mini with rule-based fallback |
| **Tests** | pytest + Vitest (29 total) |

---

## What It Does

- **Resume Parsing** — Paste text or upload PDF. AI extracts 25-30+ skills.
- **Role Matching** — 118 roles (40% cybersecurity, incl. Palo Alto certs). Auto-recommends best fits with salary ranges.
- **Gap Analysis** — Match %, category breakdown, matched/missing skills, AI narrative.
- **Skill Trends** — HOT / IN DEMAND / RISING badges based on market frequency.
- **Learning Roadmap** — Phased plan (week/month/quarter) with real courses. Interactive progress tracking.
- **Role Comparison** — Side-by-side analysis of two roles.
- **PDF Export** — One-click report generation.

---

## API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/profiles` | POST | Create profile |
| `/api/profiles/:id` | GET/PUT | Read/update profile |
| `/api/extract-skills` | POST | Extract skills from text |
| `/api/extract-skills-pdf` | POST | Extract skills from PDF |
| `/api/profiles/:id/analysis` | GET | Gap analysis |
| `/api/profiles/:id/roadmap` | GET | Learning roadmap |
| `/api/profiles/:id/recommendations` | GET | Role recommendations |
| `/api/profiles/:id/progress` | GET/POST | Progress tracking |
| `/api/roles` | GET | Search/filter roles |
| `/api/roles/compare` | GET | Compare two roles |
| `/api/skill-trends` | GET | Skill demand data |
| `/api/health` | GET | Health check |

---

## Data (Synthetic)

- `jobs.json` — 118 roles with salary ranges
- `courses.json` — 60 learning resources
- `skill_dictionary.json` — 534 skills, 10 categories
- `sample_resumes.json` — 5 sample profiles

---

## AI Disclosure

Used **Claude Code** (Anthropic) for development assistance. All code reviewed, tested (29 passing), and manually verified. Example of rejected suggestion: radar chart replaced with progress bars after poor rendering with few data points.

---

## Tradeoffs

**Chose:** SQLite (zero-setup) over PostgreSQL. Static JSON for reference data over database tables. GPT-4o-mini (10x cheaper) over GPT-4o. Strategy pattern (always works) over AI-only (breaks without key).

**Would add next:** OAuth, live job board APIs, team skill matrices, notification system.

**Limitations:** SQLite single-user, PDF extraction limited to text-based PDFs, trends from synthetic data, progress resets on DB recreate.
