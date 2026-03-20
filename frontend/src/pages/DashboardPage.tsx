import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis, getRoadmap, getProfile, getSkillTrends, getRoadmapProgress, toggleSkillProgress } from '../api/client';
import MatchGauge from '../components/MatchGauge';
import RadarChart from '../components/RadarChart';
import RoadmapTimeline from '../components/RoadmapTimeline';
import SkillTag from '../components/SkillTag';
import ErrorBanner from '../components/ErrorBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import type { GapAnalysis, Roadmap, Profile } from '../types';

export default function DashboardPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trends, setTrends] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!profileId) return;
    const id = Number(profileId);
    setLoading(true);
    Promise.all([
      getProfile(id),
      getAnalysis(id),
      getRoadmap(id),
      getSkillTrends().catch(() => ({})),
      getRoadmapProgress(id).catch(() => ({})),
    ])
      .then(([prof, anal, road, trendData, progressData]) => {
        setProfile(prof);
        setAnalysis(anal);
        setRoadmap(road);
        setTrends(trendData);
        setProgress(progressData);
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to load analysis. Make sure you have a target role selected.');
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <LoadingSpinner message="Analyzing your skills..." />;
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ErrorBanner message={error} type="error" />
      <Link to="/profile" className="mt-4 inline-block text-primary hover:underline font-medium">Go to Profile</Link>
    </div>
  );
  const handleExportPDF = () => {
    window.print();
  };

  const handleToggleProgress = async (skillName: string, completed: boolean) => {
    if (!profileId) return;
    await toggleSkillProgress(Number(profileId), skillName, completed);
    setProgress(prev => ({ ...prev, [skillName]: completed }));
  };

  if (!analysis || !profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Full-width header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-1">Gap Analysis</div>
              <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted-foreground">{analysis.role.title} at {analysis.role.company}</span>
                {analysis.role.salary_range && (
                  <span className="text-sm font-mono text-success">
                    ${(analysis.role.salary_range.min/1000).toFixed(0)}k - ${(analysis.role.salary_range.max/1000).toFixed(0)}k {analysis.role.salary_range.currency}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MatchGauge percentage={analysis.match_percentage} />
              <div className="flex flex-col gap-2">
                <button onClick={handleExportPDF} className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-mono tracking-wide hover:border-primary/50 transition-all border border-border">
                  Export PDF
                </button>
                <Link to="/profile" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm font-medium transition-all text-center border border-primary/20">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {analysis.method === 'rule-based' && (
          <div className="mb-6">
            <ErrorBanner message="AI unavailable — using rule-based analysis" type="warning" />
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left column: AI Analysis + Skill Categories */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">Intelligence Report</div>
              <h2 className="text-lg font-bold mb-3">AI Analysis</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{analysis.narrative}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">Radar</div>
              <h2 className="text-lg font-bold mb-4">Skill Categories</h2>
              <RadarChart categories={analysis.skill_categories} />
            </div>
          </div>

          {/* Right column: Matched + Missing skills */}
          <div className="lg:col-span-5 space-y-6">
            {/* Matched Skills */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 bg-success rounded-full" />
                <div>
                  <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">Matched</div>
                  <h2 className="text-base font-bold">
                    Skills You Have
                    <span className="text-sm font-normal text-muted-foreground ml-1.5 font-mono">({analysis.matched_skills.length})</span>
                  </h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matched_skills.length > 0 ? analysis.matched_skills.map(skill => {
                  const trend = trends[skill.toLowerCase()];
                  return (
                    <div key={skill} className="flex items-center gap-1">
                      <SkillTag name={skill} variant="matched" />
                      {trend && (
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                          trend === 'hot' ? 'bg-destructive/15 text-destructive' :
                          trend === 'in-demand' ? 'bg-warning/15 text-warning' :
                          'bg-primary/15 text-primary'
                        }`}>{trend === 'hot' ? 'HOT' : trend === 'in-demand' ? 'IN DEMAND' : 'RISING'}</span>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-muted-foreground text-sm">No matching skills yet</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 bg-destructive rounded-full" />
                <div>
                  <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">Gaps</div>
                  <h2 className="text-base font-bold">
                    Skills to Acquire
                    <span className="text-sm font-normal text-muted-foreground ml-1.5 font-mono">({analysis.missing_skills.length})</span>
                  </h2>
                </div>
              </div>
              {analysis.missing_skills.length === 0 ? (
                <p className="text-success text-sm font-medium font-mono">ALL SKILLS MATCHED</p>
              ) : (
                <div className="space-y-1">
                  {analysis.missing_skills.map(skill => (
                    <div key={skill.name} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          skill.importance === 'high' ? 'bg-destructive' : 'bg-warning'
                        }`} />
                        <span className="text-sm font-medium text-foreground truncate">{skill.name}</span>
                      </div>
                      {skill.suggested_resource && (
                        <span className="text-xs text-muted-foreground truncate max-w-[130px] flex-shrink-0 font-mono">{skill.suggested_resource}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Roadmap — full width */}
        {roadmap && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-1">Roadmap</div>
                <h2 className="text-2xl font-bold">Learning Roadmap</h2>
              </div>
              {roadmap.method === 'rule-based' && (
                <span className="text-xs font-mono bg-secondary text-muted-foreground px-3 py-1 rounded-full border border-border">RULE-BASED</span>
              )}
            </div>
            <RoadmapTimeline phases={roadmap.phases} progress={progress} onToggle={handleToggleProgress} />
          </div>
        )}
      </div>
    </div>
  );
}
