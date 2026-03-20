"""Database layer — SQLite with singleton pattern"""
import sqlite3
import json
from pathlib import Path


class Database:
    _path = Path(__file__).parent / "skillbridge.db"

    @classmethod
    def conn(cls) -> sqlite3.Connection:
        connection = sqlite3.connect(str(cls._path))
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA journal_mode=WAL")
        return connection

    @classmethod
    def initialize(cls):
        with cls.conn() as c:
            c.executescript("""
                CREATE TABLE IF NOT EXISTS profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    resume_text TEXT DEFAULT '',
                    skills JSON DEFAULT '[]',
                    target_role_id INTEGER,
                    experience_level TEXT DEFAULT 'entry',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS roadmap_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    profile_id INTEGER NOT NULL,
                    skill_name TEXT NOT NULL,
                    completed BOOLEAN DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(profile_id, skill_name)
                );
            """)

    @classmethod
    def insert_profile(cls, data: dict) -> dict:
        c = cls.conn()
        cur = c.execute(
            "INSERT INTO profiles (name, email, resume_text, skills, target_role_id, experience_level) VALUES (?,?,?,?,?,?)",
            (data["name"], data["email"], data.get("resume_text", ""),
             json.dumps(data.get("skills", [])), data.get("target_role_id"),
             data.get("experience_level", "entry")),
        )
        c.commit()
        result = cls.fetch_profile(cur.lastrowid)
        c.close()
        return result

    @classmethod
    def fetch_profile(cls, pid: int) -> dict | None:
        c = cls.conn()
        row = c.execute("SELECT * FROM profiles WHERE id = ?", (pid,)).fetchone()
        c.close()
        if not row:
            return None
        out = dict(row)
        out["skills"] = json.loads(out["skills"]) if out["skills"] else []
        return out

    @classmethod
    def patch_profile(cls, pid: int, data: dict) -> dict | None:
        c = cls.conn()
        parts, vals = [], []
        for col in ("name", "email", "resume_text", "skills", "target_role_id", "experience_level"):
            if col in data:
                parts.append(f"{col} = ?")
                vals.append(json.dumps(data[col]) if col == "skills" else data[col])
        if parts:
            parts.append("updated_at = CURRENT_TIMESTAMP")
            vals.append(pid)
            c.execute(f"UPDATE profiles SET {', '.join(parts)} WHERE id = ?", vals)
            c.commit()
        c.close()
        return cls.fetch_profile(pid)

    @classmethod
    def get_progress(cls, pid: int) -> dict:
        c = cls.conn()
        rows = c.execute("SELECT skill_name, completed FROM roadmap_progress WHERE profile_id = ?", (pid,)).fetchall()
        c.close()
        return {r["skill_name"]: bool(r["completed"]) for r in rows}

    @classmethod
    def set_progress(cls, pid: int, skill: str, done: bool) -> dict:
        c = cls.conn()
        c.execute(
            "INSERT INTO roadmap_progress (profile_id, skill_name, completed) VALUES (?,?,?) "
            "ON CONFLICT(profile_id, skill_name) DO UPDATE SET completed=?, updated_at=CURRENT_TIMESTAMP",
            (pid, skill, done, done),
        )
        c.commit()
        c.close()
        return {"skill_name": skill, "completed": done}
