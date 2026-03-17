'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import Link from 'next/link';
import NotificationDropdown from '@/components/NotificationDropdown';
import { Layout, Plus, Users, Clock, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';

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
      {/* Refined Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
              <Zap size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600/60">Command Center v2.0</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Base'}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Your intelligence node is synchronized. You have <span className="text-indigo-600 dark:text-indigo-400 font-bold">{projects?.length || 0} active missions</span> in progress.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="hidden md:flex items-center gap-6 px-8 py-4 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/50 mr-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Sync</span>
              <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{projects?.length || 0}</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roles</span>
              <div className="flex -space-x-2 mt-1">
                <div className="w-5 h-5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" title="Owner" />
                <div className="w-5 h-5 rounded-full bg-purple-600 border-2 border-white dark:border-slate-900" title="Member" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3"
            >
              <Plus size={16} />
              New Hub
            </button>
          </div>
        </div>
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
              className="glass rounded-[2.5rem] p-8 card-glow group transition-all relative overflow-hidden flex flex-col h-full border border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/50 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-2 duration-500"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:bg-indigo-600/10 transition-colors" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                  <Layout size={32} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border shadow-sm ${
                    p.role === 'OWNER' 
                      ? 'bg-indigo-600 text-white border-indigo-500' 
                      : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'
                  }`}>
                    {p.role}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">Synchronized</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-black group-hover:text-indigo-600 transition-colors mb-3 tracking-tighter leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {p.project.name}
                </h3>
                <p className="text-sm font-medium line-clamp-2 leading-relaxed opacity-60 mb-8" style={{ color: 'var(--text-secondary)' }}>
                  {p.project.description || 'No specialized intelligence mission description provided.'}
                </p>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Team Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">{new Date(p.joinedAt).toLocaleDateString([], {month: 'short', day: 'numeric'})}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between group/btn">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">Open Terminal</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 px-6 glass rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-inner">
              <BookOpen size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>Initialize Your Command</h3>
            <p className="max-w-md mx-auto text-base font-medium opacity-60 leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
              Your command center is currently offline. Deploy your first intelligence hub to begin synchronized team operations and mission tracking.
            </p>
            <button 
              onClick={() => setShowCreate(true)}
              className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-3"
            >
              <Plus size={18} />
              Deploy Project Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
