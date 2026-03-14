'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const typeIcons: Record<string, string> = {
    TASK_ASSIGNED: '📋',
    TASK_UPDATED: '✏️',
    COMMENT_MENTION: '💬',
    PROJECT_INVITE: '📩',
    DEADLINE_REMINDER: '⏰',
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      <nav className="glass border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold text-white">Notifications</h1>
        </div>
        <button
          onClick={() => markAll.mutate()}
          className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
        >
          Mark all as read
        </button>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        {isLoading ? (
          <p className="text-slate-400 text-center py-10">Loading...</p>
        ) : notifications?.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div
                key={n._id}
                onClick={() => !n.read && markOne.mutate(n._id)}
                className={`glass rounded-xl p-4 flex items-start gap-3 cursor-pointer ${
                  !n.read ? 'border-indigo-500/30' : 'opacity-60'
                }`}
              >
                <span className="text-xl">{typeIcons[n.type] || '🔔'}</span>
                <div className="flex-1">
                  <p className="text-sm text-white">{n.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-10">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
