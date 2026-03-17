'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Bell, Check, X, Info, UserPlus, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

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

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      api.post(`/notifications/${id}/respond`, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const typeIcons: Record<string, any> = {
    PROJECT_INVITE: <UserPlus className="text-indigo-500" size={18} />,
    MEMBER_JOINED: <Check className="text-emerald-500" size={18} />,
    MEMBER_REMOVED: <X className="text-rose-500" size={18} />,
    TASK_ASSIGNED: <Info className="text-blue-500" size={18} />,
    TASK_UPDATED: <Clock className="text-amber-500" size={18} />,
    COMMENT_MENTION: <MessageSquare className="text-purple-500" size={18} />,
    TEAM_UPDATE: <ShieldCheck className="text-indigo-400" size={18} />,
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <header className="glass border-b px-8 py-6 flex items-center justify-between sticky top-0 z-50" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="w-10 h-10 flex items-center justify-center rounded-2xl glass hover:text-indigo-600 transition-all border border-slate-200 dark:border-slate-800"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>Terminal Feed</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Activity Synchronization</p>
          </div>
        </div>
        <button
          onClick={() => markAllReadMutation.mutate()}
          className="px-6 py-2.5 glass text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-white dark:hover:bg-slate-900 transition-all rounded-xl border border-indigo-100 dark:border-indigo-900/40"
        >
          Flush All Read
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-8 lg:p-12">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Establishing Data Link...</p>
          </div>
        ) : notifications?.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((n: any) => (
              <div
                key={n._id}
                onClick={() => !n.read && n.type !== 'PROJECT_INVITE' && markReadMutation.mutate(n._id)}
                className={`glass rounded-[2rem] p-6 lg:p-8 flex items-start gap-6 border transition-all ${
                  !n.read ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'opacity-60 border-transparent hover:opacity-100'
                }`}
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: !n.read ? 'var(--indigo-600)' : 'var(--border-color)' }}
              >
                <div className="w-14 h-14 rounded-[1.25rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                  {typeIcons[n.type] || <Bell size={20} className="text-slate-400" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                       {n.type.replace(/_/g, ' ')}
                     </span>
                     <span className="text-[10px] font-medium text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                     </span>
                  </div>
                  
                  <p className="text-lg font-bold leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
                    {n.message}
                  </p>

                  {n.type === 'PROJECT_INVITE' && n.status === 'PENDING' && (
                    <div className="flex gap-3 max-w-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          respondMutation.mutate({ id: n._id, action: 'accept' });
                        }}
                        disabled={respondMutation.isPending}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-indigo-500/20"
                      >
                        Accept Mission
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          respondMutation.mutate({ id: n._id, action: 'decline' });
                        }}
                        disabled={respondMutation.isPending}
                        className="flex-1 py-3 glass text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-rose-500 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Abort
                      </button>
                    </div>
                  )}

                  {n.type === 'PROJECT_INVITE' && n.status !== 'PENDING' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest italic opacity-60">
                      <Check size={12} className={n.status === 'ACCEPTED' ? 'text-emerald-500' : 'hidden'} />
                      <X size={12} className={n.status === 'DECLINED' ? 'text-rose-500' : 'hidden'} />
                      Protocol {n.status}
                    </div>
                  )}
                </div>
                {!n.read && <div className="w-3 h-3 rounded-full bg-indigo-600 mt-2 flex-shrink-0 animate-pulse" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass rounded-[3rem] border-2 border-dashed border-slate-300 dark:border-slate-800">
            <div className="text-7xl mb-8 grayscale opacity-20">📡</div>
            <h3 className="text-2xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>Communications Zero</h3>
            <p className="max-w-md mx-auto text-sm font-medium opacity-60 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Your communication node has not intercepted any team synchronization signals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
