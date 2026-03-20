import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfile, extractSkills, extractSkillsFromPDF, getRoles, updateProfile, getProfile, getRecommendations } from '../api/client';
import SkillTag from '../components/SkillTag';
import ErrorBanner from '../components/ErrorBanner';
import type { Role } from '../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [targetRoleId, setTargetRoleId] = useState<number | null>(null);
  const [experienceLevel, setExperienceLevel] = useState('entry');
  const [roles, setRoles] = useState<Role[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const existingProfileId = localStorage.getItem('profileId');

  useEffect(() => {
    getRoles({ limit: 100 }).then(res => setRoles(res.roles)).catch(() => {});
    if (existingProfileId) {
      getProfile(Number(existingProfileId)).then(profile => {
        setName(profile.name);
        setEmail(profile.email);
        setResumeText(profile.resume_text || '');
        setSkills(profile.skills || []);
        setTargetRoleId(profile.target_role_id);
        setExperienceLevel(profile.experience_level || 'entry');
      }).catch(() => localStorage.removeItem('profileId'));
    }
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!email.includes('@') || !email.includes('.')) errs.email = 'Invalid email format';
    if (resumeText.trim().length > 0 && resumeText.trim().length < 50) errs.resumeText = 'Resume must be at least 50 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleExtractSkills = async () => {
    if (!resumeText.trim()) {
      setErrors(prev => ({ ...prev, resumeText: 'Please enter resume text first' }));
      return;
    }
    setExtracting(true);
    setBanner(null);
    try {
      const result = await extractSkills(resumeText);
      setSkills(prev => [...new Set([...prev, ...result.skills])]);
      if (result.method === 'rule-based') {
        setBanner({ message: 'AI unavailable — used rule-based skill extraction', type: 'warning' });
      } else {
        setBanner({ message: `Extracted ${result.skills.length} skills using AI (${(result.confidence * 100).toFixed(0)}% confidence)`, type: 'info' });
      }
    } catch {
      setBanner({ message: 'Failed to extract skills. Please try again.', type: 'error' });
    }
    setExtracting(false);
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    setBanner(null);
    try {
      const result = await extractSkillsFromPDF(file);
      setSkills(prev => [...new Set([...prev, ...result.skills])]);
      setResumeText(result.resume_text);
      if (result.method === 'rule-based') {
        setBanner({ message: 'AI unavailable — used rule-based skill extraction from PDF', type: 'warning' });
      } else {
        setBanner({ message: `Extracted ${result.skills.length} skills from PDF using AI (${(result.confidence * 100).toFixed(0)}% confidence)`, type: 'info' });
      }
    } catch {
      setBanner({ message: 'Failed to extract skills from PDF. Please try again.', type: 'error' });
    }
    setPdfUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const data = { name, email, resume_text: resumeText, skills, target_role_id: targetRoleId, experience_level: experienceLevel };
      let profile;
      if (existingProfileId) {
        profile = await updateProfile(Number(existingProfileId), data);
      } else {
        profile = await createProfile(data);
      }
      localStorage.setItem('profileId', String(profile.id));
      // Fetch recommendations
      try {
        const recs = await getRecommendations(profile.id);
        setRecommendations(recs);
      } catch { /* ignore */ }
      if (profile.target_role_id) {
        navigate(`/dashboard/${profile.id}`);
      } else {
        setBanner({ message: 'Profile saved! Select a target role to see your gap analysis.', type: 'info' });
      }
    } catch {
      setBanner({ message: 'Failed to save profile. Please try again.', type: 'error' });
    }
    setSaving(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const inputClasses = (hasError: boolean) =>
    `w-full px-4 py-2.5 bg-secondary border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm ${hasError ? 'border-destructive' : 'border-border'}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">Profile Setup</div>
          <h1 className="text-3xl font-bold tracking-tight">Build Your Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure your identity and skills to unlock AI-powered career insights.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {banner && <div className="mb-6"><ErrorBanner message={banner.message} type={banner.type} /></div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-4">Identity</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className={inputClasses(!!errors.name)}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={inputClasses(!!errors.email)}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">Experience Level</label>
              <select
                value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}
                className={inputClasses(false)}
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
          </div>

          {/* Resume Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-4">Resume Input</div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Resume Text</label>
            <textarea
              value={resumeText} onChange={e => setResumeText(e.target.value)}
              rows={8}
              className={inputClasses(!!errors.resumeText)}
              placeholder="Paste your resume content here..."
            />
            {errors.resumeText && <p className="text-destructive text-xs mt-1">{errors.resumeText}</p>}
            <div className="flex items-center gap-3 mt-3">
              <button type="button" onClick={handleExtractSkills} disabled={extracting}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all">
                {extracting ? 'Extracting...' : 'Extract Skills with AI'}
              </button>
              <label className="px-4 py-2 bg-accent/10 text-accent border border-accent/30 rounded-lg text-sm font-medium hover:bg-accent/20 cursor-pointer transition-all">
                {pdfUploading ? 'Uploading...' : 'Upload PDF Resume'}
                <input type="file" accept=".pdf" className="hidden" onChange={handlePDFUpload} disabled={pdfUploading} />
              </label>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-4">Skills</div>
            <div className="bg-secondary/50 border border-border rounded-lg p-4 min-h-[3rem] mb-4">
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <SkillTag key={skill} name={skill} onRemove={() => setSkills(prev => prev.filter(s => s !== skill))} />
                ))}
                {skills.length === 0 && <p className="text-muted-foreground text-sm">No skills added yet. Extract from resume or add manually.</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                placeholder="Add a skill..."
                className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
              />
              <button type="button" onClick={addSkill} className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all">
                Add
              </button>
            </div>
          </div>

          {/* Target Role Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-4">Target Role</div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Select a role</label>
            <select
              value={targetRoleId ?? ''} onChange={e => setTargetRoleId(e.target.value ? Number(e.target.value) : null)}
              className={inputClasses(false)}
            >
              <option value="">Select a target role...</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.title} — {role.company} ({role.experience_level})</option>
              ))}
            </select>
          </div>

          <button
            type="submit" disabled={saving}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all text-base tracking-wide"
          >
            {saving ? 'Saving...' : existingProfileId ? 'Update Profile & Analyze' : 'Create Profile & Analyze'}
          </button>
        </form>

        {recommendations.length > 0 && (
          <div className="mt-12">
            <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">AI Recommendations</div>
            <h2 className="text-2xl font-bold mb-6">Recommended Roles for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 6).map((role: any) => (
                <div key={role.id} onClick={() => { setTargetRoleId(role.id); }}
                  className={`bg-card border rounded-xl p-5 cursor-pointer transition-all hover:glow-primary ${targetRoleId === role.id ? 'border-primary ring-2 ring-primary/20 glow-primary' : 'border-border hover:border-primary/40'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{role.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      role.match_percentage >= 70 ? 'bg-success/15 text-success' : role.match_percentage >= 50 ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'
                    }`}>{Math.round(role.match_percentage)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{role.company} · {role.experience_level}</p>
                  {role.salary_range && <p className="text-xs font-mono text-success mt-1">${(role.salary_range.min/1000).toFixed(0)}k - ${(role.salary_range.max/1000).toFixed(0)}k</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
