# SkillBridge — Career Navigator

> **Demo Video:** [https://www.youtube.com/watch?v=f6B2eYFtGoM](https://www.youtube.com/watch?v=f6B2eYFtGoM)

An intelligent career gap analysis tool that parses resumes, maps skills against job requirements, and builds actionable learning paths. Focused on cybersecurity and tech roles with Palo Alto Networks coverage.

---

| | |
|---|---|
| **Candidate** | Shweta Patel |
| **Scenario** | Skill-Bridge Career Navigator |
| **Time Spent** | ~5 hours |

---

## Getting Started

**Prerequisites:** Python 3.10+, Node.js 18+

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # → http://localhost:8000

# 2. Frontend (new terminal)
cd frontend
npm install && npm run dev         # → http://localhost:5173

# 3. (Optional) Add OpenAI key for AI features
cp .env.example .env               # then add your key
```

> The app works fully without an OpenAI key using rule-based fallback.

---

## Technology Choices

| Layer | Choice | Rationale |
|---|---|---|
| UI | React 18 + TypeScript + Tailwind | Type-safe components, utility styling, fast iteration |
| Server | FastAPI + Pydantic | Async AI calls, auto-validation, generated docs |
| Storage | SQLite (WAL mode) | Zero-config, portable, parameterized queries |
| Intelligence | GPT-4o-mini + fallback | Cost-efficient structured extraction, graceful degradation |
| Quality | pytest + Vitest | 29 tests across unit, integration, and component layers |

---

## Capabilities

**Resume Intelligence**
- Text paste or PDF upload with automatic skill extraction (25-30+ skills per resume)
- AI-powered with dictionary-based regex fallback (534 skills, 10 categories)

**Career Matching**
- 118 curated roles (40% cybersecurity incl. Palo Alto PCNSA/PCNSE)
- Auto-ranked recommendations with salary estimates
- Side-by-side role comparison with skill overlap visualization

**Gap Analysis**
- Match scoring with per-category breakdown
- Market demand badges (HOT / IN DEMAND / RISING) computed across all postings
- Personalized AI narrative explaining strengths and focus areas

**Learning Path**
- Three-phase roadmap (This Week / This Month / Next Quarter)
- Mapped to 60 real courses and certifications
- Interactive progress tracking persisted in database

**Export** — One-click PDF report generation

---

## Endpoints

```
POST   /api/profiles                    Create profile
GET    /api/profiles/:id                Read profile
PUT    /api/profiles/:id                Update profile
POST   /api/extract-skills              Skills from text
POST   /api/extract-skills-pdf          Skills from PDF
GET    /api/profiles/:id/analysis       Gap analysis
GET    /api/profiles/:id/roadmap        Learning roadmap
GET    /api/profiles/:id/recommendations Role suggestions
GET    /api/profiles/:id/progress       Read progress
POST   /api/profiles/:id/progress       Update progress
GET    /api/roles                       Browse/filter roles
GET    /api/roles/compare               Compare two roles
GET    /api/skill-trends                Market demand data
GET    /api/health                      Health check
```

---

## Synthetic Data

| File | Contents |
|---|---|
| `jobs.json` | 118 roles with salary ranges |
| `courses.json` | 60 courses and certifications |
| `skill_dictionary.json` | 534 skills across 10 categories |
| `sample_resumes.json` | 5 profiles at varying levels |

No real personal data is used anywhere in this project.

---

## Testing

```bash
cd backend && python -m pytest tests/ -v    # 20 tests
cd frontend && npx vitest run               # 9 tests
```

Covers: skill extraction (happy + edge), gap analysis computation, API CRUD, input validation, component rendering, form behavior.

---

## AI Usage Disclosure

- **Tool used:** Claude Code (Anthropic) for development assistance
- **Verification:** All output reviewed, tested (29 passing), and manually verified through the running application
- **Rejected suggestion:** Initially generated a radar/spider chart for skill categories — replaced with horizontal progress bars after it rendered poorly with fewer than 4 data points

---

## Design Trade-offs

| Decision | Why |
|---|---|
| Strategy pattern for AI | Every AI call has a rule-based fallback — app never breaks without API key |
| SQLite over Postgres | Zero-setup for evaluation; parameterized queries make migration trivial |
| Static JSON for jobs/courses | Read-only reference data doesn't belong in a database |
| GPT-4o-mini over GPT-4o | Structured extraction tasks don't need expensive reasoning models |
| React+Vite over Next.js | No SSR/SEO needed — simpler toolchain, smaller bundle |

**If I had more time:** OAuth authentication, live job board APIs, team skill dashboards, email notifications for new matching roles.

**Known limits:** SQLite doesn't scale for concurrent users, PDF extraction fails on scanned/image PDFs, trend data is from synthetic dataset.
