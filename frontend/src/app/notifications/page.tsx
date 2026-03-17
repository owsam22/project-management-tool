'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Bell, Check, X, Info, UserPlus, Clock, MessageSquare, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';

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
      <header className="glass border-b px-8 py-6 flex items-center justify-between sticky top-0 z-50 overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="w-12 h-12 flex items-center justify-center rounded-2xl glass hover:text-indigo-600 transition-all border border-slate-200 dark:border-slate-800 shadow-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
              Terminal <span className="text-gradient">Feed</span>
            </h1>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-indigo-600 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Activity Synchronization Hub</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => markAllReadMutation.mutate()}
          className="px-6 py-3 bg-white dark:bg-slate-950 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm active:scale-95 cursor-pointer"
        >
          Flush All Data
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
                className={`glass rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 lg:p-10 flex flex-col sm:flex-row items-start gap-4 md:gap-8 border transition-all relative overflow-hidden card-glow ${
                  !n.read ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'opacity-60 border-slate-200/50 dark:border-slate-800/50 hover:opacity-100 hover:border-indigo-500/30'
                }`}
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                {!n.read && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-bl-[4rem] pointer-events-none" />
                )}
                
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform relative z-10">
                  {typeIcons[n.type] || <Bell size={22} className="text-slate-400" />}
                </div>
                
                <div className="flex-1 min-w-0 relative z-10 w-full">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                     <div className="flex items-center gap-2">
                       <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ${!n.read ? 'text-indigo-600' : 'text-slate-400'}`}>
                         {n.type.replace(/_/g, ' ')}
                       </span>
                       {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />}
                     </div>
                     <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  
                  <p className="text-base md:text-xl font-black leading-tight mb-4 md:mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {n.message}
                  </p>
 
                  {n.type === 'PROJECT_INVITE' && n.status === 'PENDING' && (
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          respondMutation.mutate({ id: n._id, action: 'accept' });
                        }}
                        disabled={respondMutation.isPending}
                        className="px-6 md:px-8 py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        <Check size={14} />
                        Accept Mission
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          respondMutation.mutate({ id: n._id, action: 'decline' });
                        }}
                        disabled={respondMutation.isPending}
                        className="px-6 md:px-8 py-3 md:py-4 glass text-slate-500 hover:text-rose-500 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        <X size={14} />
                        Abort
                      </button>
                    </div>
                  )}
 
                  {n.type === 'PROJECT_INVITE' && n.status !== 'PENDING' && (
                    <div className={`inline-flex items-center gap-3 px-5 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                      n.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}>
                      {n.status === 'ACCEPTED' ? <ShieldCheck size={14} /> : <X size={14} />}
                      Protocol {n.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-6 glass rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-inner">
                <Bell size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>Communications Zero</h3>
              <p className="max-w-md mx-auto text-base font-medium opacity-60 leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
                Your communication node is currently silent. No team synchronization signals or protocol requests have been intercepted.
              </p>
              <Link 
                href="/dashboard"
                className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-3"
              >
                <ArrowLeft size={18} />
                Return to Command
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
