'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false);
      setProjectName('');
      setProjectDesc('');
    },
  });

  if (!isAuthenticated) return null;

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Your Projects</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage and collaborate on your team projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-semibold text-white text-sm cursor-pointer shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          + New Project
        </button>
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 dark:border-white/10">
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create New Project</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProjectMutation.mutate({ name: projectName, description: projectDesc });
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Design System Rehaul"
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all font-medium"
                  style={{ color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="What is this project about?"
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all font-medium resize-none"
                  style={{ color: 'var(--text-primary)' }}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
                >
                  {createProjectMutation.isPending ? 'Syncing...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
          <div className="w-14 h-14 rounded-2xl border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <p className="mt-6 font-black text-xs uppercase tracking-[0.2em] text-slate-400">Syncing Intelligence...</p>
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p: any) => (
            <Link
              key={p.project._id}
              href={`/project/${p.project._id}`}
              className="glass rounded-[2rem] p-8 card-glow group transition-all relative overflow-hidden flex flex-col h-full border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-2xl shadow-indigo-500/20 flex items-center justify-center text-white text-3xl mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  📁
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="text-[10px] bg-slate-50 dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-100 dark:border-slate-800 shadow-sm">
                    {p.role}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <span className="text-[10px] font-bold text-slate-400">ACTIVE HUB</span>
                  </div>
                </div>
              </div>
              <h3 
                className="text-2xl font-black group-hover:text-indigo-600 transition-colors mb-2 tracking-tighter"
                style={{ color: 'var(--text-primary)' }}
              >
                {p.project.name}
              </h3>
              <p 
                className="text-sm font-medium line-clamp-2 leading-relaxed flex-1 opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                {p.project.description || 'No specialized intelligence mission description provided.'}
              </p>
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                <span className="opacity-50">Deployed {new Date(p.joinedAt).toLocaleDateString()}</span>
                <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform font-black">ACCESS DATA →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 glass rounded-[3rem] border-2 border-dashed border-slate-300 dark:border-slate-800">
          <div className="text-7xl mb-8 grayscale opacity-20">📡</div>
          <h3 className="text-2xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>Terminal Empty</h3>
          <p className="max-w-md mx-auto text-sm font-medium opacity-60 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Your command center has no active projects. Initialize a new project hub to begin team synchronization.
          </p>
          <button 
            onClick={() => setShowCreate(true)}
            className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            Deploy First Hub
          </button>
        </div>
      )}
    </div>
  );
}
