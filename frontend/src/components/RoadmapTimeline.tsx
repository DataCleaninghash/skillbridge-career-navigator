import type { RoadmapPhase } from '../types';

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
  progress?: Record<string, boolean>;
  onToggle?: (skillName: string, completed: boolean) => void;
}

export default function RoadmapTimeline({ phases, progress = {}, onToggle }: RoadmapTimelineProps) {
  if (!phases || phases.length === 0) {
    return (
      <div className="font-mono text-sm text-gray-500 p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
        <span className="text-gray-600">$</span> cat roadmap.json<br />
        <span className="text-red-400">Error:</span> No roadmap data available.
      </div>
    );
  }

  const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);
  const completedItems = phases.reduce((sum, p) => sum + p.items.filter(i => progress[i.skill]).length, 0);
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const prioritySymbol = (p: string) => {
    if (p === 'high') return { sym: '!!!', color: '#f43f5e', label: 'CRIT' };
    if (p === 'medium') return { sym: ' !!', color: '#f59e0b', label: 'WARN' };
    return { sym: '  !', color: '#475569', label: 'LOW ' };
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Terminal-style progress header */}
      {onToggle && totalItems > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 20px rgba(6,182,212,0.05), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f43f5e' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
            </div>
            <span className="text-[10px] text-gray-500 ml-2">progress --status</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 text-sm mb-2">
              <span className="text-gray-500">$</span>
              <span className="text-cyan-400">progress</span>
              <span className="text-gray-600">--verbose</span>
            </div>
            <div className="flex items-center gap-3">
              {/* ASCII-style progress bar */}
              <span className="text-gray-600 text-xs">[</span>
              <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: progressPct >= 70
                      ? 'linear-gradient(90deg, #06b6d4, #22c55e)'
                      : progressPct >= 40
                        ? 'linear-gradient(90deg, #06b6d4, #f59e0b)'
                        : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    boxShadow: '0 0 12px rgba(6,182,212,0.4)',
                  }}
                />
              </div>
              <span className="text-gray-600 text-xs">]</span>
              <span
                className="text-sm font-bold min-w-[4ch] text-right"
                style={{
                  color: progressPct >= 70 ? '#22c55e' : progressPct >= 40 ? '#f59e0b' : '#06b6d4',
                  textShadow: `0 0 10px ${progressPct >= 70 ? 'rgba(34,197,94,0.4)' : progressPct >= 40 ? 'rgba(245,158,11,0.4)' : 'rgba(6,182,212,0.4)'}`,
                }}
              >
                {progressPct}%
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-gray-600">&gt;</span> Completed <span className="text-cyan-400">{completedItems}</span> of <span className="text-cyan-400">{totalItems}</span> objectives
            </div>
          </div>
        </div>
      )}

      {/* Phases */}
      {phases.map((phase) => (
        <div
          key={phase.phase}
          className="rounded-lg overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
          }}
        >
          {/* Phase header as a terminal command */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(99,102,241,0.05) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                color: '#fff',
                boxShadow: '0 0 12px rgba(6,182,212,0.3)',
              }}
            >
              {phase.phase}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">$</span>
                <h3 className="text-sm font-bold text-gray-200 truncate">
                  {phase.title}
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="text-cyan-700">//</span> duration: {phase.duration}
              </p>
            </div>
            <span className="text-[10px] text-gray-600 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {phase.items.length} tasks
            </span>
          </div>

          {/* Items */}
          {phase.items.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-600">
              <span className="text-gray-700">&gt;</span> <span className="italic">// empty phase -- no tasks assigned</span>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {phase.items.map((item, idx) => {
                const isCompleted = progress[item.skill] || false;
                const prio = prioritySymbol(item.priority);

                return (
                  <div
                    key={idx}
                    className="px-4 py-2.5 flex items-start gap-3 transition-all duration-200 group"
                    style={{
                      background: isCompleted ? 'rgba(34,197,94,0.03)' : 'transparent',
                      borderLeft: `2px solid ${isCompleted ? '#22c55e' : prio.color}`,
                      opacity: isCompleted ? 0.55 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isCompleted) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCompleted) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Checkbox as terminal toggle */}
                    {onToggle && (
                      <button
                        onClick={() => onToggle(item.skill, !isCompleted)}
                        className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200"
                        style={{
                          background: isCompleted ? '#22c55e' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isCompleted ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: isCompleted ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
                        }}
                      >
                        {isCompleted && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Priority indicator */}
                    <span
                      className="text-[9px] font-bold mt-1 flex-shrink-0 px-1 rounded"
                      style={{
                        color: prio.color,
                        background: `${prio.color}15`,
                        textShadow: `0 0 6px ${prio.color}40`,
                      }}
                    >
                      {prio.label}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm leading-tight"
                        style={{
                          color: isCompleted ? '#64748b' : '#e2e8f0',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {item.skill}
                      </p>
                      <p className="text-[11px] mt-0.5 flex items-center gap-1">
                        <span className="text-gray-600">&gt;</span>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors duration-200"
                            style={{ color: '#06b6d4' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#22d3ee';
                              e.currentTarget.style.textShadow = '0 0 8px rgba(6,182,212,0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#06b6d4';
                              e.currentTarget.style.textShadow = 'none';
                            }}
                          >
                            {item.resource}
                          </a>
                        ) : (
                          <span className="text-gray-500">{item.resource}</span>
                        )}
                      </p>
                    </div>

                    {/* Status indicator */}
                    <span className="text-[10px] mt-0.5 flex-shrink-0" style={{ color: isCompleted ? '#22c55e' : '#334155' }}>
                      {isCompleted ? '[DONE]' : `[${String(idx + 1).padStart(2, '0')}]`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
