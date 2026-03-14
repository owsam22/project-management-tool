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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Top NavBar */}
      <nav className="glass border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold gradient-text">SCPM</h1>
        <div className="flex items-center gap-4">
          <Link href="/notifications" className="text-slate-400 hover:text-white relative">
            🔔
          </Link>
          <span className="text-sm text-slate-400">Hi, {user?.name}</span>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 cursor-pointer">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
            <p className="text-slate-400 text-sm mt-1">Manage and collaborate on your team projects</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-semibold text-white text-sm cursor-pointer"
          >
            + New Project
          </button>
        </div>

        {/* Create Project Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createProjectMutation.mutate({ name: projectName, description: projectDesc });
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white disabled:opacity-50 cursor-pointer"
                  >
                    {createProjectMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-5 py-2.5 border border-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer"
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
          <div className="text-center text-slate-400 py-20">Loading projects...</div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p: any) => (
              <Link
                key={p.project._id}
                href={`/project/${p.project._id}`}
                className="glass rounded-xl p-5 card-glow hover:border-indigo-500/30 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-indigo-300">{p.project.name}</h3>
                  <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-lg">{p.role}</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{p.project.description || 'No description'}</p>
                <div className="mt-4 flex items-center text-xs text-slate-500">
                  <span>Joined {new Date(p.joinedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">No projects yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
