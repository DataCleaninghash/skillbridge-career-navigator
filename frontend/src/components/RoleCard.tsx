import { useState } from 'react';
import type { Role } from '../types';

interface RoleCardProps {
  role: Role;
  matchPercentage?: number;
  onSetTarget?: (roleId: number) => void;
}

export default function RoleCard({ role, matchPercentage, onSetTarget }: RoleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const levelConfig: Record<string, { color: string; glow: string; label: string }> = {
    entry: { color: '#22c55e', glow: 'rgba(34,197,94,0.3)', label: 'ENTRY' },
    mid: { color: '#06b6d4', glow: 'rgba(6,182,212,0.3)', label: 'MID' },
    senior: { color: '#a855f7', glow: 'rgba(168,85,247,0.3)', label: 'SENIOR' },
  };

  const level = levelConfig[role.experience_level] || { color: '#64748b', glow: 'rgba(100,116,139,0.3)', label: role.experience_level.toUpperCase() };

  const matchColor = matchPercentage !== undefined
    ? matchPercentage >= 70 ? '#22c55e' : matchPercentage >= 40 ? '#f59e0b' : '#f43f5e'
    : undefined;
  const matchGlow = matchPercentage !== undefined
    ? matchPercentage >= 70 ? 'rgba(34,197,94,0.3)' : matchPercentage >= 40 ? 'rgba(245,158,11,0.3)' : 'rgba(244,63,94,0.3)'
    : undefined;

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-300 cursor-default group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${isHovered ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isHovered
          ? '0 0 30px rgba(6,182,212,0.1), 0 0 60px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Gradient border shimmer on hover */}
      <div
        className="absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, transparent 40%, transparent 60%, rgba(99,102,241,0.1) 100%)',
        }}
      />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-bold font-mono leading-tight truncate transition-colors duration-300"
              style={{
                color: isHovered ? '#e2e8f0' : '#cbd5e1',
                textShadow: isHovered ? '0 0 20px rgba(6,182,212,0.3)' : 'none',
              }}
            >
              {role.title}
            </h3>
            <p className="text-xs font-mono mt-1 flex items-center gap-1.5" style={{ color: '#64748b' }}>
              <span style={{ color: '#475569' }}>@</span>
              {role.company}
            </p>
          </div>

          {matchPercentage !== undefined && (
            <div
              className="flex-shrink-0 ml-3 px-2.5 py-1.5 rounded-lg font-mono text-sm font-bold relative"
              style={{
                color: matchColor,
                background: `${matchColor}10`,
                border: `1px solid ${matchColor}30`,
                textShadow: `0 0 10px ${matchGlow}`,
                boxShadow: `0 0 12px ${matchGlow}`,
              }}
            >
              {Math.round(matchPercentage)}%
            </div>
          )}
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider"
            style={{
              color: level.color,
              background: `${level.color}12`,
              border: `1px solid ${level.color}25`,
              textShadow: `0 0 6px ${level.glow}`,
            }}
          >
            {level.label}
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wide"
            style={{
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {role.industry}
          </span>
          {role.salary_range && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{
                color: '#22c55e',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.15)',
              }}
            >
              ${(role.salary_range.min / 1000).toFixed(0)}k-${(role.salary_range.max / 1000).toFixed(0)}k
            </span>
          )}
        </div>

        {/* Description */}
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-4 font-mono"
          style={{ color: '#64748b' }}
        >
          {role.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {role.required_skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded text-[10px] font-mono transition-all duration-200"
              style={{
                color: '#06b6d4',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.15)',
              }}
            >
              {skill}
            </span>
          ))}
          {role.required_skills.length > 4 && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono"
              style={{
                color: '#475569',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              +{role.required_skills.length - 4}
            </span>
          )}
        </div>

        {/* CTA Button */}
        {onSetTarget && (
          <button
            onClick={() => onSetTarget(role.id)}
            className="w-full py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 relative overflow-hidden group/btn"
            style={{
              color: '#06b6d4',
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.2)',
              boxShadow: '0 0 15px rgba(6,182,212,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.15))';
              e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.15), inset 0 0 20px rgba(6,182,212,0.05)';
              e.currentTarget.style.color = '#22d3ee';
              e.currentTarget.style.textShadow = '0 0 10px rgba(6,182,212,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(6,182,212,0.08)';
              e.currentTarget.style.borderColor = 'rgba(6,182,212,0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(6,182,212,0.05)';
              e.currentTarget.style.color = '#06b6d4';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            Set as Target
          </button>
        )}
      </div>
    </div>
  );
}
