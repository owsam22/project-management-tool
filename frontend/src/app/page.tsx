'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-10 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      {/* Hero */}
      <div className="text-center max-w-3xl animate-fade-in relative z-10">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-600/10 border border-indigo-600/20">
          <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase">Evolutionary Workspace v2.0</span>
        </div>
        <h1 className="text-[clamp(2.5rem,12vw,4.5rem)] font-black mb-8 leading-[0.9] tracking-tighter" style={{ color: 'var(--text-primary)' }}>
          Collaborate at <br />
          <span className="gradient-text">Sync Velocity.</span>
        </h1>
        <p className="text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          The intelligent project hub designed for modern teams. Kanban intelligence, 
          decision neural logs, and real-time team synchronization.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-white text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 translate-y-0"
          >
            Initialize Workspace
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            style={{ color: 'var(--text-primary)' }}
          >
            Secure Log In
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-32 max-w-6xl w-full relative z-10">
        {[
          { icon: '📋', title: 'Kanban Boards', desc: 'Drag and drop tasks across customizable columns with real-time feedback.' },
          { icon: '🧠', title: 'Decision Logs', desc: 'Immutable records of project evolution and strategic methodology.' },
          { icon: '🔗', title: 'Dependency Graphs', desc: 'Neural mapping of task relationships and potential critical blockers.' },
          { icon: '⚡', title: 'Real-Time Sync', desc: 'Sub-millisecond synchronization across your entire distributed team.' },
          { icon: '📊', title: 'Workload Analytics', desc: 'Advanced monitoring of team balance and individual utilization.' },
          { icon: '📝', title: 'Meeting Extraction', desc: 'AI-assisted transformation of verbal notes into actionable tasks.' },
        ].map((f, i) => (
          <div key={i} className="glass rounded-[2.5rem] p-10 card-glow group">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500 group-hover:text-white shadow-sm">
              {f.icon}
            </div>
            <h3 className="text-xl font-black mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
            <p className="text-sm font-medium leading-relaxed opacity-60" style={{ color: 'var(--text-primary)' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer Branded Removal */}
      <footer className="mt-32 pb-32 lg:pb-12 flex flex-col items-center opacity-40">
        <div className="w-10 h-1 border-t border-slate-300 dark:border-slate-700 mb-8" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-primary)' }}>© Velo Intelligence System</p>
      </footer>
    </div>
  );
}
