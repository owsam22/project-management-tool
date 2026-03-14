'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-4">
      {/* Hero */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-6 leading-tight">
          Smart Collaborative<br />Project Manager
        </h1>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          Manage tasks on Kanban boards, track decisions, visualize dependencies, 
          monitor workload — all in real-time with your team.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-semibold text-white"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 border border-slate-700 hover:border-indigo-500 rounded-xl font-semibold text-slate-300 hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
        {[
          { icon: '📋', title: 'Kanban Boards', desc: 'Drag and drop tasks across customizable columns' },
          { icon: '🧠', title: 'Decision Logs', desc: 'Track why every important decision was made' },
          { icon: '🔗', title: 'Dependency Graphs', desc: 'Visualize task relationships and blockers' },
          { icon: '⚡', title: 'Real-Time', desc: 'Changes appear instantly for all team members' },
          { icon: '📊', title: 'Workload Analytics', desc: 'Balance work and detect silent members' },
          { icon: '📝', title: 'Meeting → Tasks', desc: 'Paste notes, get tasks extracted automatically' },
        ].map((f, i) => (
          <div key={i} className="glass rounded-xl p-6 card-glow">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
