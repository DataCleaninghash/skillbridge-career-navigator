import { useState, useEffect } from 'react';
import { getRoles, compareRoles } from '../api/client';
import SkillTag from '../components/SkillTag';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Role } from '../types';

export default function ComparisonPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId1, setRoleId1] = useState<number | null>(null);
  const [roleId2, setRoleId2] = useState<number | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const profileId = localStorage.getItem('profileId');

  useEffect(() => {
    getRoles({ limit: 100 }).then(res => setRoles(res.roles)).catch(() => {});
  }, []);

  const handleCompare = async () => {
    if (!roleId1 || !roleId2) return;
    setLoading(true);
    try {
      const result = await compareRoles(roleId1, roleId2, profileId ? Number(profileId) : undefined);
      setComparison(result);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const selectClasses = "w-full px-4 py-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all text-sm";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">Role Comparison</div>
          <h1 className="text-3xl font-bold tracking-tight">Compare Roles</h1>
          <p className="text-muted-foreground mt-1 text-sm">See which role is the better fit for your skills</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Selection area */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Role 1</label>
              <select value={roleId1 ?? ''} onChange={e => setRoleId1(Number(e.target.value) || null)} className={selectClasses}>
                <option value="">Select first role...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.title} — {r.company}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Role 2</label>
              <select value={roleId2 ?? ''} onChange={e => setRoleId2(Number(e.target.value) || null)} className={selectClasses}>
                <option value="">Select second role...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.title} — {r.company}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <button onClick={handleCompare} disabled={!roleId1 || !roleId2 || loading}
              className="px-8 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all text-sm tracking-wide">
              {loading ? 'Comparing...' : 'Compare Roles'}
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner message="Comparing roles..." />}

        {comparison && (
          <div className="space-y-6">
            {/* Side by side match */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[comparison.role1, comparison.role2].map((role: any, i: number) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 hover:glow-primary transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">{role.company} · {role.experience_level}</p>
                      {role.salary_range && <p className="text-sm font-mono text-success mt-0.5">${(role.salary_range.min/1000).toFixed(0)}k - ${(role.salary_range.max/1000).toFixed(0)}k</p>}
                    </div>
                    <span className={`text-3xl font-bold font-mono ${role.match_percentage >= 70 ? 'text-success' : role.match_percentage >= 50 ? 'text-warning' : 'text-destructive'}`}>
                      {Math.round(role.match_percentage)}%
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-success rounded-full" />Your Matched Skills ({role.matched_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5 bg-secondary/50 rounded-lg p-3 min-h-[2.5rem]">
                        {role.matched_skills.map((s: string) => <SkillTag key={s} name={s} variant="matched" />)}
                        {role.matched_skills.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-destructive rounded-full" />Skills to Learn ({role.missing_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5 bg-secondary/50 rounded-lg p-3 min-h-[2.5rem]">
                        {role.missing_skills.map((s: string) => <SkillTag key={s} name={s} variant="missing" />)}
                        {role.missing_skills.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skill overlap */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">Overlap Analysis</div>
              <h3 className="text-lg font-bold mb-5">Skill Overlap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Common to Both <span className="text-primary">({comparison.common_skills.length})</span></h4>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.common_skills.map((s: string) => <SkillTag key={s} name={s} variant="default" />)}
                  </div>
                </div>
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Unique to {comparison.role1.title} <span className="text-primary">({comparison.unique_to_role1.length})</span></h4>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.unique_to_role1.map((s: string) => <SkillTag key={s} name={s} variant="low" />)}
                  </div>
                </div>
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Unique to {comparison.role2.title} <span className="text-primary">({comparison.unique_to_role2.length})</span></h4>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.unique_to_role2.map((s: string) => <SkillTag key={s} name={s} variant="low" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
