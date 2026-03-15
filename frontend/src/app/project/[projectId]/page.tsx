'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import Link from 'next/link';

// ========== TYPES ==========
type User = { id: string; name: string };
type Member = { _id: string; userId: User };
type Project = { _id: string; name: string; members: Member[] };
type Board = { _id: string; name: string };
type List = { _id: string; name: string };
type Task = {
  _id: string;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  health: 'HEALTHY' | 'WARNING' | 'AT_RISK';
  dueDate?: string;
  assignees?: { _id: string; name: string }[];
  status?: string;
  description?: string;
};
type Comment = { _id: string; message: string; createdAt: string; userId: User };
type Decision = { _id: string; problem: string; options: string; finalDecision: string; reason: string; approvedBy?: User; createdAt: string };

// ========== MAIN PAGE ==========
export default function ProjectPage() {
  const { projectId } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'analytics' | 'dependencies' | 'meetings'>('board');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!projectId || !user) return;
    const socket = connectSocket();
    socket.emit('join_project', projectId);
    socket.emit('user_online', user.id);

    socket.on('task_created', () => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
    socket.on('task_updated', () => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
    socket.on('task_moved', () => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
    socket.on('comment_added', () => queryClient.invalidateQueries({ queryKey: ['comments'] }));

    return () => {
      socket.emit('leave_project', projectId);
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_moved');
      socket.off('comment_added');
    };
  }, [projectId, user, queryClient]);

  const { data: projectData } = useQuery<{ project: Project }>({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then((r) => r.data.data),
    enabled: isAuthenticated && !!projectId,
  });

  const { data: boards } = useQuery<Board[]>({
    queryKey: ['boards', projectId],
    queryFn: () => api.get(`/boards/project/${projectId}`).then((r) => r.data.data),
    enabled: isAuthenticated && !!projectId,
  });

  const inviteMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/members`, { email: inviteEmail, role: inviteRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setShowInvite(false);
      setInviteEmail('');
    },
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Nav */}
      <nav className="glass border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">← Back</Link>
          <h1 className="text-lg font-bold text-white">{projectData?.project?.name || 'Project'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {projectData?.project?.members?.slice(0, 5).map((m: Member) => (
              <div key={m._id} className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold border-2 border-slate-900" title={m.userId?.name}>
                {m.userId?.name?.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-sm hover:bg-indigo-600/30 cursor-pointer"
          >
            + Invite
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-slate-800 px-6">
        <div className="flex gap-1 max-w-6xl mx-auto">
          {(['board', 'analytics', 'dependencies', 'meetings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize cursor-pointer ${
                activeTab === tab
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'dependencies' ? '🔗 Dependencies' : tab === 'meetings' ? '📝 Meeting Notes' : tab === 'analytics' ? '📊 Analytics' : '📋 Board'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-full mx-auto p-6">
        {activeTab === 'board' && boards && boards.length > 0 && (
          <KanbanBoard boardId={boards[0]._id} projectId={projectId as string} />
        )}
        {activeTab === 'analytics' && <AnalyticsPanel projectId={projectId as string} />}
        {activeTab === 'dependencies' && <DependenciesPanel projectId={projectId as string} />}
        {activeTab === 'meetings' && <MeetingNotesPanel />}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Invite Team Member</h3>
            <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(); }} className="space-y-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Member's email"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white cursor-pointer">Invite</button>
                <button type="button" onClick={() => setShowInvite(false)} className="px-5 py-2.5 border border-slate-700 rounded-xl text-slate-400 cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== KANBAN BOARD & LIST ==========
type KanbanBoardProps = { boardId: string; projectId: string };
function KanbanBoard({ boardId, projectId }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const { data: lists } = useQuery<List[]>({
    queryKey: ['lists', boardId],
    queryFn: () => api.get(`/boards/${boardId}/lists`).then((r) => r.data.data),
  });

  return (
    <>
      <div className="flex gap-5 overflow-x-auto pb-4">
        {lists?.map((list) => (
          <KanbanList
            key={list._id}
            list={list}
            projectId={projectId}
            newTaskTitle={newTaskTitle[list._id] || ''}
            onTitleChange={(val: string) => setNewTaskTitle((prev) => ({ ...prev, [list._id]: val }))}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      {selectedTask && <TaskDetailModal taskId={selectedTask} onClose={() => setSelectedTask(null)} />}
    </>
  );
}

type KanbanListProps = {
  list: List;
  projectId: string;
  newTaskTitle: string;
  onTitleChange: (val: string) => void;
  onTaskClick: (taskId: string) => void;
};
function KanbanList({ list, projectId, newTaskTitle, onTitleChange, onTaskClick }: KanbanListProps) {
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ['tasks', list._id],
    queryFn: () => api.get(`/tasks/list/${list._id}`).then((r) => r.data.data),
  });

  const createTask = useMutation({
    mutationFn: (title: string) => api.post('/tasks', { listId: list._id, title, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', list._id] });
      onTitleChange('');
    },
  });

  const moveTask = useMutation({
    mutationFn: ({ taskId, newListId }: { taskId: string; newListId: string }) =>
      api.patch(`/tasks/${taskId}/move`, { newListId, newPosition: 0, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const priorityColors: Record<string, string> = {
    URGENT: 'bg-red-500/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400',
    LOW: 'bg-green-500/20 text-green-400',
  };
  const healthIcons: Record<string, string> = {
    HEALTHY: '💚',
    WARNING: '⚠️',
    AT_RISK: '🔴',
  };
// Keep UI exactly the same, just type props and state as shown above.

  return (
    <div className="flex-shrink-0 w-72 glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm">{list.name}</h3>
        <span className="text-xs text-slate-500">{tasks?.length || 0}</span>
      </div>

      {/* Tasks */}
      <div className="space-y-2.5 mb-4 max-h-[60vh] overflow-y-auto">
        {tasks?.map((task: any) => (
          <div
            key={task._id}
            onClick={() => onTaskClick(task._id)}
            className="bg-slate-800/60 rounded-lg p-3 cursor-pointer hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/30"
            draggable
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm text-white font-medium">{task.title}</span>
              <span className="text-xs">{healthIcons[task.health]}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="text-xs text-slate-500">
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            {task.assignees?.length > 0 && (
              <div className="flex -space-x-1.5 mt-2">
                {task.assignees.slice(0, 3).map((a: any) => (
                  <div key={a._id} className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold border border-slate-800">
                    {a.name?.charAt(0)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add task input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newTaskTitle.trim()) createTask.mutate(newTaskTitle);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="+ Add task"
          className="flex-1 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </form>
    </div>
  );
}

// ========== TASK DETAIL MODAL ==========
function TaskDetailModal({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [showDecision, setShowDecision] = useState(false);
  const [decision, setDecision] = useState({ problem: '', options: '', finalDecision: '', reason: '' });

  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => api.get(`/tasks/${taskId}`).then((r) => r.data.data),
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => api.get(`/comments/${taskId}`).then((r) => r.data.data),
  });

  const { data: decisions } = useQuery({
    queryKey: ['decisions', taskId],
    queryFn: () => api.get(`/decisions/${taskId}`).then((r) => r.data.data),
  });

  const addComment = useMutation({
    mutationFn: () => api.post(`/comments/${taskId}`, { message: commentText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setCommentText('');
    },
  });

  const logDecision = useMutation({
    mutationFn: () => api.post(`/decisions/${taskId}`, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions', taskId] });
      setShowDecision(false);
      setDecision({ problem: '', options: '', finalDecision: '', reason: '' });
    },
  });

  const updateTask = useMutation({
    mutationFn: (data: any) => api.patch(`/tasks/${taskId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', taskId] }),
  });

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 pt-10 overflow-y-auto">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl mb-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-bold text-white">{task.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        {/* Status & Priority */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <select
            value={task.status}
            onChange={(e) => updateTask.mutate({ status: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            value={task.priority}
            onChange={(e) => updateTask.mutate({ priority: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <span className="px-3 py-1.5 rounded-lg bg-slate-800/40 text-sm text-slate-400">
            Health: {task.health === 'HEALTHY' ? '💚 Healthy' : task.health === 'WARNING' ? '⚠️ Warning' : '🔴 At Risk'}
          </span>
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-400 mb-1 block">Description</label>
          <textarea
            defaultValue={task.description}
            onBlur={(e) => updateTask.mutate({ description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            rows={3}
            placeholder="Add a description..."
          />
        </div>

        {/* Decision Logs */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">🧠 Decision Logs</h4>
            <button
              onClick={() => setShowDecision(!showDecision)}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              + Log Decision
            </button>
          </div>

          {showDecision && (
            <form onSubmit={(e) => { e.preventDefault(); logDecision.mutate(); }} className="space-y-2 mb-3 p-3 bg-slate-800/40 rounded-lg">
              <input value={decision.problem} onChange={(e) => setDecision({ ...decision, problem: e.target.value })} placeholder="Problem" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none" required />
              <input value={decision.options} onChange={(e) => setDecision({ ...decision, options: e.target.value })} placeholder="Options considered" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none" required />
              <input value={decision.finalDecision} onChange={(e) => setDecision({ ...decision, finalDecision: e.target.value })} placeholder="Final decision" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none" required />
              <input value={decision.reason} onChange={(e) => setDecision({ ...decision, reason: e.target.value })} placeholder="Reason" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none" required />
              <button type="submit" className="px-4 py-1.5 bg-indigo-600 rounded-lg text-sm text-white cursor-pointer">Save</button>
            </form>
          )}

          {decisions?.map((d: any) => (
            <div key={d._id} className="bg-slate-800/30 rounded-lg p-3 mb-2 border border-slate-700/30">
              <p className="text-sm text-white font-medium">❓ {d.problem}</p>
              <p className="text-xs text-slate-400 mt-1">Options: {d.options}</p>
              <p className="text-xs text-green-400 mt-1">✅ Decision: {d.finalDecision}</p>
              <p className="text-xs text-slate-500 mt-1">Reason: {d.reason}</p>
              <p className="text-xs text-slate-600 mt-1">By {d.approvedBy?.name} • {new Date(d.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {/* Comments */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">💬 Discussion</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
            {comments?.map((c: any) => (
              <div key={c._id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.userId?.name?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{c.userId?.name}</span>
                    <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-300">{c.message}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (commentText.trim()) addComment.mutate(); }} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-lg text-sm text-white cursor-pointer">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ========== ANALYTICS PANEL ==========
function AnalyticsPanel({ projectId }: { projectId: string }) {
  const { data: workload } = useQuery({
    queryKey: ['workload', projectId],
    queryFn: () => api.get(`/analytics/${projectId}/workload`).then((r) => r.data.data),
  });

  const { data: silentMembers } = useQuery({
    queryKey: ['silent', projectId],
    queryFn: () => api.get(`/analytics/${projectId}/silent-members`).then((r) => r.data.data),
  });

  const { data: health } = useQuery({
    queryKey: ['health', projectId],
    queryFn: () => api.get(`/analytics/${projectId}/health`).then((r) => r.data.data),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Project Health */}
      {health && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Project Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{health.totalTasks}</p>
              <p className="text-xs text-slate-400">Total Tasks</p>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{health.completionRate}%</p>
              <p className="text-xs text-slate-400">Completed</p>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{health.health?.WARNING || 0}</p>
              <p className="text-xs text-slate-400">⚠️ Warnings</p>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{health.health?.AT_RISK || 0}</p>
              <p className="text-xs text-slate-400">🔴 At Risk</p>
            </div>
          </div>
        </div>
      )}

      {/* Workload Distribution */}
      {workload && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">👥 Workload Distribution</h3>
          <div className="space-y-3">
            {workload.map((w: any) => (
              <div key={w.user.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {w.user.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{w.user.name}</span>
                    <span className="text-xs text-slate-400">{w.total} tasks</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${w.total > 8 ? 'bg-red-500' : w.total > 5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((w.total / 12) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Silent Members */}
      {silentMembers && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🔇 Team Activity</h3>
          <div className="space-y-2">
            {silentMembers.map((m: any) => (
              <div key={m.user.id} className="flex items-center justify-between bg-slate-800/40 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                    {m.user.name?.charAt(0)}
                  </div>
                  <span className="text-sm text-white">{m.user.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  m.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                  m.status === 'LOW' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {m.status === 'ACTIVE' ? '✅ Active' : m.status === 'LOW' ? '⚠️ Low' : '🔴 Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== DEPENDENCIES PANEL ==========
function DependenciesPanel({ projectId }: { projectId: string }) {
  return (
    <div className="glass rounded-xl p-6 max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-white mb-4">🔗 Task Dependency Graph</h3>
      <p className="text-sm text-slate-400 mb-4">
        View task dependencies to identify blockers. Open any task to add dependencies.
      </p>
      <div className="bg-slate-800/40 rounded-lg p-8 text-center text-slate-500">
        <p>Task dependency graph visualization will render here using React Flow.</p>
        <p className="text-xs mt-2">Add dependencies to tasks first from the task detail modal.</p>
      </div>
    </div>
  );
}

// ========== MEETING NOTES PANEL ==========
function MeetingNotesPanel() {
  const [notes, setNotes] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);

  const extractMutation = useMutation({
    mutationFn: () => api.post('/nlp/extract-tasks', { notes }),
    onSuccess: (res) => setExtractedTasks(res.data.data.tasks),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📝 Meeting Notes → Tasks</h3>
        <p className="text-sm text-slate-400 mb-4">
          Paste your meeting notes below and we&apos;ll extract actionable tasks automatically.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={6}
          placeholder={`Example:\nSam will design the landing page by Friday\nRahul will set up the API endpoints\nWe need to research authentication`}
        />
        <button
          onClick={() => extractMutation.mutate()}
          disabled={extractMutation.isPending || !notes.trim()}
          className="mt-3 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white disabled:opacity-50 cursor-pointer"
        >
          {extractMutation.isPending ? 'Extracting...' : '🔍 Extract Tasks'}
        </button>
      </div>

      {extractedTasks.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Extracted Tasks ({extractedTasks.length})</h3>
          <div className="space-y-2">
            {extractedTasks.map((t, i) => (
              <div key={i} className="bg-slate-800/40 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-white">✅ {t.title}</span>
                  {t.assigneeName && (
                    <span className="text-xs text-indigo-400 ml-2">→ {t.assigneeName}</span>
                  )}
                </div>
                {t.dueDate && <span className="text-xs text-slate-500">📅 {t.dueDate}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
