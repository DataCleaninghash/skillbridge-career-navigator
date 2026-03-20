interface MatchGaugeProps {
  percentage: number;
}

export default function MatchGauge({ percentage }: MatchGaugeProps) {
  const color = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r={radius} stroke="#27272a" strokeWidth="6" fill="none" />
          <circle
            cx="70" cy="70" r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono" style={{ color }}>{Math.round(percentage)}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">percent</span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Match Score</span>
    </div>
  );
}
