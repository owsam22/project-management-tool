'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Bell, Check, X, Info, UserPlus, Clock, MessageSquare, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { connectSocket } from '@/lib/socket';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data.data),
    enabled: isOpen,
    refetchInterval: 30000, // Refetch every 30s when open
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data.data),
    refetchInterval: 10000, // Check for unread every 10s
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
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

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    socket.on('notification_received', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    });

    return () => {
      socket.off('notification_received');
    };
  }, [queryClient]);

  const typeIcons: Record<string, any> = {
    PROJECT_INVITE: <UserPlus className="text-indigo-500" size={16} />,
    MEMBER_JOINED: <Check className="text-emerald-500" size={16} />,
    MEMBER_REMOVED: <X className="text-rose-500" size={16} />,
    TASK_ASSIGNED: <Info className="text-blue-500" size={16} />,
    TASK_UPDATED: <Clock className="text-amber-500" size={16} />,
    COMMENT_MENTION: <MessageSquare className="text-purple-500" size={16} />,
    TEAM_UPDATE: <ShieldCheck className="text-indigo-400" size={16} />,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <Bell size={20} />
        {unreadData?.count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[8px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadData.count > 9 ? '9+' : unreadData.count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute top-20 sm:top-auto left-4 right-4 sm:left-auto sm:right-0 sm:mt-4 sm:w-96 glass rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300 max-h-[80vh] flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Activity Hub</h3>
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase text-slate-400">Syncing Feed...</p>
              </div>
            ) : notifications?.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-900">
                {notifications.map((n: any) => (
                  <div
                    key={n._id}
                    className={`p-5 transition-all group ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}
                    onClick={() => !n.read && n.type !== 'PROJECT_INVITE' && markReadMutation.mutate(n._id)}
                  >
                    <div className="flex gap-3 md:gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {typeIcons[n.type] || <Bell size={16} className="text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] md:text-xs leading-relaxed ${!n.read ? 'font-bold' : 'font-medium opacity-60'}`} style={{ color: 'var(--text-primary)' }}>
                          {n.message}
                        </p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
 
                        {n.type === 'PROJECT_INVITE' && n.status === 'PENDING' && (
                          <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                respondMutation.mutate({ id: n._id, action: 'accept' });
                              }}
                              disabled={respondMutation.isPending}
                              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                respondMutation.mutate({ id: n._id, action: 'decline' });
                              }}
                              disabled={respondMutation.isPending}
                              className="flex-1 py-2.5 glass text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-rose-500 transition-all active:scale-95 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {n.type === 'PROJECT_INVITE' && n.status !== 'PENDING' && (
                          <div className="mt-2 text-[10px] font-black uppercase tracking-widest italic opacity-40">
                            Invitation {n.status.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="text-4xl mb-4 opacity-10 grayscale">🔔</div>
                <p className="text-xs font-bold text-slate-400 italic">No activity recorded</p>
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-4 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700 border-t border-slate-100 dark:border-slate-800 transition-all"
          >
            Terminal View Full Feed
          </Link>
        </div>
      )}
    </div>
  );
}
