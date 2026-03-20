interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorBanner({ message, type = 'warning' }: ErrorBannerProps) {
  const styles = {
    error: 'bg-destructive/10 border-destructive/30 text-red-400',
    warning: 'bg-warning/10 border-warning/30 text-amber-400',
    info: 'bg-primary/10 border-primary/30 text-indigo-400',
  };
  const icons = { error: '\u2715', warning: '\u26A0', info: '\u2139' };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles[type]}`} role="alert">
      <span className="text-lg">{icons[type]}</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
