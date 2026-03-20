import axios from 'axios';
import type { ProfileCreate, Profile, SkillExtractionResult, GapAnalysis, Roadmap, RolesResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export async function createProfile(data: ProfileCreate): Promise<Profile> {
  const res = await api.post('/profiles', data);
  return res.data;
}

export async function getProfile(id: number): Promise<Profile> {
  const res = await api.get(`/profiles/${id}`);
  return res.data;
}

export async function updateProfile(id: number, data: Partial<ProfileCreate>): Promise<Profile> {
  const res = await api.put(`/profiles/${id}`, data);
  return res.data;
}

export async function extractSkills(resumeText: string): Promise<SkillExtractionResult> {
  const res = await api.post('/extract-skills', { resume_text: resumeText });
  return res.data;
}

export async function getAnalysis(profileId: number): Promise<GapAnalysis> {
  const res = await api.get(`/profiles/${profileId}/analysis`);
  return res.data;
}

export async function getRoadmap(profileId: number): Promise<Roadmap> {
  const res = await api.get(`/profiles/${profileId}/roadmap`);
  return res.data;
}

export async function getRoles(params?: {
  search?: string;
  industry?: string;
  experience_level?: string;
  limit?: number;
  offset?: number;
}): Promise<RolesResponse> {
  const res = await api.get('/roles', { params });
  return res.data;
}

export async function getRole(id: number) {
  const res = await api.get(`/roles/${id}`);
  return res.data;
}

export async function extractSkillsFromPDF(file: File): Promise<SkillExtractionResult & { resume_text: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/extract-skills-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getRecommendations(profileId: number) {
  const res = await api.get(`/profiles/${profileId}/recommendations`);
  return res.data;
}

export async function getSkillTrends() {
  const res = await api.get('/skill-trends');
  return res.data;
}

export async function getRoadmapProgress(profileId: number): Promise<Record<string, boolean>> {
  const res = await api.get(`/profiles/${profileId}/progress`);
  return res.data;
}

export async function toggleSkillProgress(profileId: number, skillName: string, completed: boolean) {
  const res = await api.post(`/profiles/${profileId}/progress`, { skill_name: skillName, completed });
  return res.data;
}

export async function compareRoles(roleId1: number, roleId2: number, profileId?: number) {
  const params: Record<string, number> = { role_id_1: roleId1, role_id_2: roleId2 };
  if (profileId) params.profile_id = profileId;
  const res = await api.get('/roles/compare', { params });
  return res.data;
}
