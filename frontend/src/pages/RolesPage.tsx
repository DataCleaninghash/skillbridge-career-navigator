import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoles, updateProfile } from '../api/client';
import RoleCard from '../components/RoleCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Role } from '../types';

export default function RolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (search) params.search = search;
      if (industry) params.industry = industry;
      if (experienceLevel) params.experience_level = experienceLevel;
      const res = await getRoles(params);
      setRoles(res.roles);
      setTotal(res.total);
    } catch {
      // silent fail
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, [search, industry, experienceLevel]);

  const handleSetTarget = async (roleId: number) => {
    const profileId = localStorage.getItem('profileId');
    if (!profileId) {
      navigate('/profile');
      return;
    }
    try {
      await updateProfile(Number(profileId), { target_role_id: roleId });
      navigate(`/dashboard/${profileId}`);
    } catch {
      navigate('/profile');
    }
  };

  const selectClasses = "px-4 py-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all text-sm";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">Role Explorer</div>
              <h1 className="text-3xl font-bold tracking-tight">Browse Roles</h1>
              <p className="text-muted-foreground mt-1 text-sm">Explore roles across cybersecurity, cloud, SWE, and data fields.</p>
            </div>
            <div className="font-mono text-primary text-2xl font-bold">{total} <span className="text-xs text-muted-foreground uppercase tracking-widest">roles</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card border border-border rounded-xl p-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <SearchBar onSearch={setSearch} placeholder="Search roles, skills, or companies..." />
          </div>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className={selectClasses}>
            <option value="">All Industries</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="cloud">Cloud / DevOps</option>
            <option value="software_engineering">Software Engineering</option>
            <option value="data_ai">Data / AI</option>
          </select>
          <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={selectClasses}>
            <option value="">All Levels</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading roles..." />
        ) : roles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground text-lg">No roles found matching your criteria.</div>
            <p className="text-sm text-muted-foreground mt-2 font-mono">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map(role => (
              <RoleCard
                key={role.id}
                role={role}
                onSetTarget={handleSetTarget}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
