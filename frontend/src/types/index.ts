export interface Profile {
  id: number;
  name: string;
  email: string;
  resume_text: string;
  skills: string[];
  target_role_id: number | null;
  experience_level: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileCreate {
  name: string;
  email: string;
  resume_text?: string;
  skills?: string[];
  target_role_id?: number | null;
  experience_level?: string;
}

export interface Role {
  id: number;
  title: string;
  company: string;
  industry: string;
  experience_level: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  skill_categories: Record<string, string[]>;
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface SkillExtractionResult {
  skills: string[];
  method: string;
  confidence: number;
}

export interface MissingSkill {
  name: string;
  importance: string;
  suggested_resource: string;
}

export interface SkillCategory {
  required: number;
  matched: number;
  percentage: number;
}

export interface GapAnalysis {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: MissingSkill[];
  skill_categories: Record<string, SkillCategory>;
  narrative: string;
  method: string;
  role: Role;
}

export interface RoadmapItem {
  skill: string;
  resource: string;
  url?: string;
  priority: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  items: RoadmapItem[];
}

export interface Roadmap {
  phases: RoadmapPhase[];
  method: string;
}

export interface RolesResponse {
  roles: Role[];
  total: number;
  limit: number;
  offset: number;
}
