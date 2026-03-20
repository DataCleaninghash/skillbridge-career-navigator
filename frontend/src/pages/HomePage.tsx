import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(99,102,241,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            AI-POWERED CAREER INTELLIGENCE
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mb-6">
            <span className="gradient-text">Navigate</span><br />
            <span className="text-foreground">Your Career</span><br />
            <span className="text-muted-foreground">With Precision</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Extract skills from your resume. Identify gaps against target roles.
            Get a personalized learning roadmap — all powered by AI.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/profile" className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
              Get Started
            </Link>
            <Link to="/roles" className="px-8 py-3 bg-secondary text-foreground rounded-lg font-semibold border border-border hover:border-primary/50 transition-all duration-300">
              Explore Roles
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-20 max-w-2xl mx-auto">
            {[
              { value: '118', label: 'Roles' },
              { value: '534', label: 'Skills' },
              { value: '60+', label: 'Courses' },
              { value: 'AI', label: 'Powered' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold font-mono gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-16">Three steps to your personalized career roadmap</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Paste text or upload a PDF. AI extracts 25-30+ skills automatically.' },
              { step: '02', title: 'Pick a Role', desc: 'Browse 118 roles across cybersecurity, cloud, SWE, and AI. See salary estimates.' },
              { step: '03', title: 'Get Roadmap', desc: 'See your gaps, match %, and a phased learning plan with real courses.' },
            ].map(item => (
              <div key={item.step} className="relative p-6 rounded-xl bg-card border border-border group hover:border-primary/40 transition-all hover:glow-primary">
                <span className="text-4xl font-black font-mono gradient-text">{item.step}</span>
                <h3 className="text-lg font-semibold mt-4 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cybersecurity */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Cybersecurity First</h2>
          <p className="text-muted-foreground mb-10">Deep coverage of security roles including Palo Alto Networks certifications</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['SOC Analyst', 'Pen Tester', 'DevSecOps', 'Cloud Security', 'PCNSA/PCNSE', 'Incident Response', 'Threat Intel', 'Security Engineer'].map(role => (
              <span key={role} className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-mono">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
