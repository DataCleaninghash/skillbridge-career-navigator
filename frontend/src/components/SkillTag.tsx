interface SkillTagProps {
  name: string;
  variant?: 'matched' | 'missing' | 'default' | 'high' | 'medium' | 'low';
  onRemove?: () => void;
}

export default function SkillTag({ name, variant = 'default', onRemove }: SkillTagProps) {
  const styles = {
    matched: 'bg-success/10 text-emerald-400 border-success/30',
    missing: 'bg-destructive/10 text-red-400 border-destructive/30',
    default: 'bg-primary/10 text-indigo-400 border-primary/30',
    high: 'bg-destructive/10 text-red-400 border-destructive/30',
    medium: 'bg-warning/10 text-amber-400 border-warning/30',
    low: 'bg-secondary text-muted-foreground border-border',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${styles[variant]} transition-colors`}>
      {name}
      {onRemove && (
        <button onClick={onRemove} className="ml-1.5 hover:opacity-60 transition-opacity" aria-label={`Remove ${name}`}>
          &times;
        </button>
      )}
    </span>
  );
}
