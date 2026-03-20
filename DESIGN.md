# Design — SkillBridge v2

## System

```
React SPA (:5173) → REST → FastAPI (:8000) → SQLite
                                 ↓
                          OpenAI GPT-4o-mini
                          (fallback: rule-based)
```

Vite proxies `/api` to backend. No CORS in dev.

## Decisions

**AI Fallback (Strategy Pattern)**
Every AI call wraps in try/catch with a rule-based fallback. Skill extraction falls back to regex matching against 534-skill dictionary. Narratives fall back to templates. Roadmaps fall back to skill→course tag matching. App never breaks.

**SQLite**
Zero-setup. WAL mode. Two tables: `profiles`, `roadmap_progress`. Parameterized queries. Production swap to Postgres is a single-file change.

**Static JSON**
Jobs, courses, skills are read-only reference data. JSON = version-controlled, no migrations, easy to review.

**GPT-4o-mini**
Skill extraction and narratives are structured tasks. Mini is 10x cheaper, faster, equivalent quality.

**Prompt Engineering**
5 iterations on skill extraction prompt. Final version: explicit 25-30 minimum, infer related skills, include soft skills + certs, reference 300-skill dictionary.

**CSS Variables**
Entire theme in CSS custom properties. Dark cyberpunk palette. Zero component changes to swap themes.

## Schema

```sql
profiles: id, name, email, resume_text, skills(JSON), target_role_id, experience_level, timestamps
roadmap_progress: id, profile_id, skill_name, completed, updated_at (UNIQUE profile+skill)
```

## Algorithm

```
gap_analysis(profile):
  user_skills = profile.skills (lowercased set)
  role_skills = required ∪ preferred (from jobs.json)
  matched = user_skills ∩ role_skills
  missing = role_skills - user_skills
  match% = |matched| / |role_skills| × 100
  categories = per-category breakdown
  narrative = AI or template
  return {match%, matched, missing, categories, narrative}
```

## Trends

```
for each skill across 118 jobs:
  freq ≥ 15% → HOT
  freq ≥ 8%  → IN DEMAND
  freq ≥ 4%  → RISING
```

## Tests

20 backend (pytest): extraction, gap analysis, API integration
9 frontend (vitest): component rendering, form validation

## Future

OAuth, live job APIs, team matrices, notifications, advanced analytics.
