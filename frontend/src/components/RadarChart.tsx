import type { SkillCategory } from '../types';

interface RadarChartProps {
  categories: Record<string, SkillCategory>;
}

export default function RadarChart({ categories }: RadarChartProps) {
  const data = Object.entries(categories).map(([name, cat]) => ({
    category: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    percentage: Math.round(cat.percentage),
    matched: cat.matched,
    required: cat.required,
  }));

  if (data.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8 font-mono text-sm tracking-widest uppercase">
        // no category data
      </p>
    );
  }

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const ringWidth = 22;
  const gap = 4;
  const maxRadius = (size / 2) - 10;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-lg"
        >
          {/* Background glow */}
          <defs>
            <filter id="ringGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle center glow */}
          <circle cx={cx} cy={cy} r={maxRadius * 0.3} fill="url(#centerGlow)" />

          {data.map((item, i) => {
            const radius = maxRadius - i * (ringWidth + gap);
            if (radius <= 0) return null;

            const circumference = 2 * Math.PI * radius;
            const fillLength = (item.percentage / 100) * circumference;
            const bgColor = 'rgba(255,255,255,0.04)';

            const hue = item.percentage >= 70 ? 160 : item.percentage >= 40 ? 45 : 340;
            const saturation = item.percentage >= 70 ? '80%' : item.percentage >= 40 ? '85%' : '75%';
            const lightness = '55%';
            const color = `hsl(${hue}, ${saturation}, ${lightness})`;
            const glowColor = `hsla(${hue}, ${saturation}, ${lightness}, 0.6)`;

            return (
              <g key={item.category}>
                {/* Track ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={bgColor}
                  strokeWidth={ringWidth}
                  strokeLinecap="round"
                />
                {/* Border edges */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={ringWidth + 1}
                  strokeLinecap="round"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Filled segment */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={ringWidth - 2}
                  strokeLinecap="round"
                  strokeDasharray={`${fillLength} ${circumference - fillLength}`}
                  strokeDashoffset={circumference * 0.25}
                  style={{
                    filter: 'url(#ringGlow)',
                    transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {/* Percentage label at ring center-right */}
                <text
                  x={cx + radius + ringWidth / 2 + 2}
                  y={cy}
                  fill={color}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  dominantBaseline="central"
                  textAnchor="start"
                  style={{ textShadow: `0 0 6px ${glowColor}` }}
                >
                  {item.percentage}%
                </text>
              </g>
            );
          })}

          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
            SKILLS
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
            {data.length} categories
          </text>
        </svg>
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {data.map((item, i) => {
          const hue = item.percentage >= 70 ? 160 : item.percentage >= 40 ? 45 : 340;
          const color = `hsl(${hue}, 80%, 55%)`;
          const glowColor = `hsla(${hue}, 80%, 55%, 0.3)`;

          return (
            <div
              key={item.category}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = `${glowColor}`;
                e.currentTarget.style.boxShadow = `0 0 12px ${glowColor}, inset 0 0 12px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${glowColor}`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-mono text-gray-300 truncate leading-tight">
                  {item.category}
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  {item.matched}/{item.required}
                </p>
              </div>
              <span
                className="text-xs font-mono font-bold flex-shrink-0"
                style={{ color, textShadow: `0 0 8px ${glowColor}` }}
              >
                {item.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
