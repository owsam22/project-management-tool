'use client';

import { Layout, Link2, BarChart3, FileText, Plus, GripVertical, CheckCircle2, AlertCircle, AlertTriangle, Calendar, Users, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ========== TYPES ==========
type User = { _id: string; name: string };
type Project = { _id: string; name: string };
type Member = { _id: string; userId: { _id: string; name: string; email: string; avatarUrl?: string }; role: string };
type ProjectData = { project: Project; members: Member[]; currentUserRole: string };
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
  const [activeTab, setActiveTab] = useState<'board' | 'analytics' | 'dependencies' | 'meetings' | 'team'>('board');

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

  const { data: projectData } = useQuery<ProjectData>({
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

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/projects/${projectId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  if (!isAuthenticated) return null;

  return (
    <div className="animate-fade-in flex flex-col h-screen overflow-hidden">
      {/* Dynamic Header */}
      <header 
        className="glass border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-10 h-10 flex items-center justify-center rounded-2xl glass hover:text-indigo-600 transition-all border border-slate-200 dark:border-slate-800"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {projectData?.project?.name || 'Project Intelligence'}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Node Synchronized</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-2">
            {projectData?.members?.slice(0, 5).map((m: Member) => (
              <div 
                key={m._id} 
                className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white border-2 dark:border-slate-900 border-white shadow-sm" 
                title={m.userId?.name}
              >
                {m.userId?.avatarUrl ? (
                  <img src={m.userId.avatarUrl} alt={m.userId.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  m.userId?.name?.charAt(0).toUpperCase()
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs hover:bg-indigo-600/20 transition-all border border-indigo-100 dark:border-indigo-900/50 cursor-pointer"
          >
            + Invite
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div 
        className="glass border-b z-30 flex items-center justify-start md:justify-center overflow-x-auto custom-scrollbar"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex px-4">
          {(['board', 'analytics', 'team', 'dependencies', 'meetings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50/30'
                  : 'text-slate-400 border-transparent hover:text-indigo-600 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'board' && <Layout size={14} />}
                {tab === 'analytics' && <BarChart3 size={14} />}
                {tab === 'team' && <Users size={14} />}
                {tab === 'dependencies' && <Link2 size={14} />}
                {tab === 'meetings' && <FileText size={14} />}
                <span className={activeTab === tab ? 'scale-110 inline-block transition-transform' : ''}>
                  {tab === 'dependencies' ? 'Links' : tab === 'meetings' ? 'Notes' : tab === 'analytics' ? 'Stats' : tab === 'team' ? 'Team' : 'Board'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 h-full">
        <div className={`${activeTab === 'board' ? 'w-full' : 'max-w-7xl mx-auto'} h-full`}>
          {activeTab === 'board' && boards && boards.length > 0 && (
            <KanbanBoard boardId={boards[0]._id} projectId={projectId as string} />
          )}
          {activeTab === 'analytics' && <AnalyticsPanel projectId={projectId as string} />}
          {activeTab === 'team' && projectData && (
            <TeamPanel 
              members={projectData.members} 
              currentUserRole={projectData.currentUserRole}
              currentUserId={user?.id}
              onRemove={(userId) => removeMemberMutation.mutate(userId)}
              onInvite={() => setShowInvite(true)}
            />
          )}
          {activeTab === 'dependencies' && <DependenciesPanel projectId={projectId as string} />}
          {activeTab === 'meetings' && <MeetingNotesPanel />}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 dark:border-white/10">
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Invite Team Member</h3>
            <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(); }} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Member Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all font-medium"
                  style={{ color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all font-bold appearance-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="MEMBER">Standard Member</option>
                  <option value="VIEWER">Read Only Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={inviteMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                >
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowInvite(false)} 
                  className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
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

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const createList = useMutation({
    mutationFn: (name: string) => api.post(`/boards/${boardId}/lists`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
      setIsAddingList(false);
      setNewListTitle('');
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (!lists) return;
      const oldIndex = lists.findIndex((l) => l._id === active.id);
      const newIndex = lists.findIndex((l) => l._id === over.id);
      const newOrderedIds = arrayMove(lists, oldIndex, newIndex).map((l) => l._id);
      
      // Optimistic update
      queryClient.setQueryData(['lists', boardId], (old: List[]) => arrayMove(old, oldIndex, newIndex));
      
      api.patch(`/boards/${boardId}/lists/reorder`, { listIds: newOrderedIds });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x scroll-smooth custom-scrollbar-h min-h-[70vh]">
        <SortableContext items={lists?.map(l => l._id) || []} strategy={horizontalListSortingStrategy}>
          {lists?.map((list, index) => (
            <KanbanList
              key={list._id}
              list={list}
              index={index}
              projectId={projectId}
              newTaskTitle={newTaskTitle[list._id] || ''}
              onTitleChange={(val: string) => setNewTaskTitle((prev) => ({ ...prev, [list._id]: val }))}
              onTaskClick={setSelectedTask}
            />
          ))}
        </SortableContext>
        
        {isAddingList ? (
          <div className="flex-shrink-0 w-80 glass rounded-[2rem] p-6 border shadow-xl animate-fade-in h-fit" style={{ borderColor: 'var(--border-color)' }}>
            <input
              autoFocus
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Node Name..."
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all mb-4"
              style={{ color: 'var(--text-primary)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newListTitle.trim()) createList.mutate(newListTitle);
                if (e.key === 'Escape') setIsAddingList(false);
              }}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => newListTitle.trim() && createList.mutate(newListTitle)}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
              >
                Launch Node
              </button>
              <button 
                onClick={() => setIsAddingList(false)}
                className="px-4 py-3 glass text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsAddingList(true)}
            className="flex-shrink-0 w-80 h-16 glass rounded-2xl flex items-center justify-center border-dashed border-2 border-slate-300 dark:border-slate-800 opacity-50 hover:opacity-100 transition-all cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/5 group"
          >
             <Plus className="w-4 h-4 mr-2 text-indigo-600 group-hover:scale-125 transition-transform" />
             <span className="text-xs font-black uppercase tracking-widest group-hover:text-indigo-600">Add Intelligence Node</span>
          </div>
        )}
      </div>

      {selectedTask && <TaskDetailModal taskId={selectedTask} onClose={() => setSelectedTask(null)} />}
    </DndContext>
  );
}

type KanbanListProps = {
  list: List;
  index: number;
  projectId: string;
  newTaskTitle: string;
  onTitleChange: (val: string) => void;
  onTaskClick: (taskId: string) => void;
};
function KanbanList({ list, index, projectId, newTaskTitle, onTitleChange, onTaskClick }: KanbanListProps) {
  const queryClient = useQueryClient();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const columnColors = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
  ];

  const headerColor = columnColors[index % columnColors.length];

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

  const healthIcons: Record<string, React.ReactNode> = {
    HEALTHY: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    WARNING: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    AT_RISK: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
  };

  const priorityColors: Record<string, string> = {
    URGENT: 'bg-red-500/10 text-red-500 border border-red-200/50',
    HIGH: 'bg-orange-500/10 text-orange-500 border border-orange-200/50',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500 border border-yellow-200/50',
    LOW: 'bg-emerald-500/10 text-emerald-500 border border-emerald-200/50',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 glass rounded-[2.5rem] p-6 flex flex-col max-h-[calc(100vh-220px)] snap-start border shadow-2xl shadow-indigo-500/5 transition-shadow hover:shadow-indigo-500/10"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${headerColor}`} />
        <button 
          {...attributes} 
          {...listeners} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-grab active:cursor-grabbing text-slate-400 transition-colors"
        >
          <GripVertical size={14} />
        </button>
      </div>
      
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="font-black text-[11px] uppercase tracking-[0.2em] opacity-80" style={{ color: 'var(--text-primary)' }}>{list.name}</h3>
        <span className="text-[10px] font-black px-3 py-1 rounded-full glass text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800">{tasks?.length || 0}</span>
      </div>

      {/* Tasks */}
      <div className="space-y-4 mb-4 overflow-y-auto pr-1 custom-scrollbar">
        {tasks?.map((task: any) => (
          <div
            key={task._id}
            onClick={() => onTaskClick(task._id)}
            className="rounded-[1.5rem] p-4 cursor-pointer transition-all border group relative overflow-hidden active:scale-[0.98]"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-sm font-bold leading-tight group-hover:text-indigo-600 transition-colors" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
              <div className="flex-shrink-0 mt-0.5">
                {healthIcons[task.health]}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <Calendar size={10} />
                    <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {task.assignees?.length > 0 && (
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((a: any) => (
                    <div 
                      key={a._id} 
                      className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white border-2 dark:border-slate-900 border-white shadow-sm"
                      title={a.name}
                    >
                      {a.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500 border-2 dark:border-slate-900 border-white">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add task input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newTaskTitle.trim()) createTask.mutate(newTaskTitle);
        }}
        className="mt-auto px-1 group"
      >
        <div className="relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Initialize task..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all pr-10"
            style={{ color: 'var(--text-primary)' }}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
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
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[100] p-4 pt-10 overflow-y-auto backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-[2rem] p-8 w-full max-w-2xl mb-10 shadow-2xl border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{task.title}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Task Intelligence Hub</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {/* Status & Priority */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Process Priority</label>
            <select
              value={task.priority}
              onChange={(e) => updateTask.mutate({ priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <option value="LOW">Low Velocity</option>
              <option value="MEDIUM">Medium Velocity</option>
              <option value="HIGH">High Velocity</option>
              <option value="URGENT">Immediate Action</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Task Milestone</label>
            <select
              value={task.status}
              onChange={(e) => updateTask.mutate({ status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <option value="TODO">Backlog</option>
              <option value="IN_PROGRESS">Active Build</option>
              <option value="REVIEW">Quality Assurance</option>
              <option value="COMPLETED">Shipped</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Brief & Context</label>
          <textarea
            defaultValue={task.description}
            onBlur={(e) => updateTask.mutate({ description: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/10 transition-all resize-none leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
            rows={4}
            placeholder="No description provided yet..."
          />
        </div>

        {/* Decision Logs */}
        <div className="mb-8 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>🧠 Strategy & Decisions</h4>
            <button
              onClick={() => setShowDecision(!showDecision)}
              className="px-3 py-1 bg-indigo-600 text-[10px] font-black text-white rounded-full uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all"
            >
              {showDecision ? 'Close Form' : '+ New Entry'}
            </button>
          </div>

          {showDecision && (
            <form onSubmit={(e) => { e.preventDefault(); logDecision.mutate(); }} className="space-y-3 mb-6 animate-fade-in">
              <input value={decision.problem} onChange={(e) => setDecision({ ...decision, problem: e.target.value })} placeholder="What was the challenge?" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none" required />
              <input value={decision.options} onChange={(e) => setDecision({ ...decision, options: e.target.value })} placeholder="Alternative paths" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none" required />
              <div className="grid grid-cols-2 gap-3">
                <input value={decision.finalDecision} onChange={(e) => setDecision({ ...decision, finalDecision: e.target.value })} placeholder="Final Verdict" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none" required />
                <input value={decision.reason} onChange={(e) => setDecision({ ...decision, reason: e.target.value })} placeholder="The 'Why'" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none" required />
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Authenticate Decision</button>
            </form>
          )}

          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {decisions?.map((d: any) => (
              <div key={d._id} className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{d.problem}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest"><span className="text-green-500">Verdict:</span> {d.finalDecision}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Rationale: {d.reason}</p>
                </div>
                <div className="mt-4 flex items-center justify-between opacity-50">
                  <span className="text-[8px] font-black uppercase tracking-widest">{d.approvedBy?.name}</span>
                  <span className="text-[8px] font-medium">{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {(!decisions || decisions.length === 0) && !showDecision && (
              <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No methodology recorded</p>
            )}
          </div>
        </div>

        {/* Discussion Section */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40">
          <h4 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: 'var(--text-primary)' }}>💬 Workspace Discussion</h4>
          <div className="space-y-6 max-h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar">
            {comments?.map((c: any) => (
              <div key={c._id} className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {c.userId?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black" style={{ color: 'var(--text-primary)' }}>{c.userId?.name}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-80" style={{ color: 'var(--text-primary)' }}>{c.message}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (commentText.trim()) addComment.mutate(); }} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Deploy a thought..."
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/10 transition-all"
              style={{ color: 'var(--text-primary)' }}
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ========== ANALYTICS PANEL ==========
function AnalyticsPanel({ projectId }: { projectId: string }) {
  const { data: health } = useQuery({
    queryKey: ['health', projectId],
    queryFn: () => api.get(`/analytics/${projectId}/health`).then((r) => r.data.data),
  });

  const { data: workload } = useQuery({
    queryKey: ['workload', projectId],
    queryFn: () => api.get(`/analytics/${projectId}/workload`).then((r) => r.data.data),
  });

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Project Health Radar */}
      <div className="p-8 rounded-[2rem] glass border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <div className="w-32 h-32 rounded-full border-[10px] border-indigo-600"></div>
        </div>
        
        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--text-primary)' }}>Radar Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>{health?.totalTasks || 0}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Ops</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black tracking-tighter text-indigo-600">{health?.completionRate || 0}%</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Efficiency</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black tracking-tighter text-yellow-500">{health?.health?.WARNING || 0}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alerts</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black tracking-tighter text-red-500">{health?.health?.AT_RISK || 0}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Workload */}
        <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: 'var(--text-primary)' }}>Team Utilization</h3>
          <div className="space-y-6">
            {workload?.map((w: any) => (
              <div key={w.user.id} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span style={{ color: 'var(--text-primary)' }}>{w.user.name}</span>
                  <span className="text-indigo-600">{w.total} active</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((w.total / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action */}
        <div className="p-8 rounded-[2rem] bg-indigo-600 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">Operations</h3>
            <p className="text-xl font-bold leading-tight">Generate a real-time status report of current blockers.</p>
          </div>
          <button className="mt-8 px-6 py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/20">
            Export Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== DEPENDENCIES PANEL ==========
function DependenciesPanel({ projectId }: { projectId: string }) {
  return (
    <div className="animate-fade-in py-20 text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-3xl">🔗</div>
      <h3 className="text-xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Dependency Neural Network</h3>
      <p className="text-sm font-medium opacity-60 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        Our automated logic engine is currently mapping your project dependencies. This visualization helps identify critical path blockers.
      </p>
      <div className="mt-12 p-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logic Engine Status: Standby</p>
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
    <div className="animate-fade-in p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <div className="p-10 rounded-[3rem] glass border border-slate-100 dark:border-slate-800">
        <div className="mb-10">
          <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Meeting Intelligence</h3>
          <p className="text-sm font-medium opacity-60 mt-1" style={{ color: 'var(--text-primary)' }}>Transform verbal discussions into actionable project tasking.</p>
        </div>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-6 py-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/10 transition-all resize-none mb-6 leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
          rows={8}
          placeholder="Paste meeting transcript or highlights here. Mention teammates and dates for better extraction..."
        />
        
        <button
          onClick={() => extractMutation.mutate()}
          disabled={extractMutation.isPending || !notes.trim()}
          className="w-full sm:w-auto px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {extractMutation.isPending ? 'Processing Logic...' : 'Analyze & Extract'}
        </button>
      </div>

      {extractedTasks.length > 0 && (
        <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-6">Extracted Intelligence ({extractedTasks.length})</h4>
          <div className="grid gap-4">
            {extractedTasks.map((t, i) => (
              <div key={i} className="p-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-indigo-50 dark:border-indigo-900/30 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                    {t.assigneeName && (
                      <p className="text-[10px] font-black text-indigo-500 uppercase mt-0.5">Assigned to: {t.assigneeName}</p>
                    )}
                  </div>
                </div>
                {t.dueDate && <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Due {t.dueDate}</span>}
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Import to Board</button>
        </div>
      )}
    </div>
  );
}

// ========== TEAM PANEL ==========
function TeamPanel({ 
  members, 
  currentUserRole, 
  currentUserId,
  onRemove, 
  onInvite 
}: { 
  members: Member[]; 
  currentUserRole: string;
  currentUserId?: string;
  onRemove: (userId: string) => void;
  onInvite: () => void;
}) {
  const isAuthorized = ['OWNER', 'ADMIN'].includes(currentUserRole);

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Team Synergy</h3>
          <p className="text-sm font-medium opacity-60 mt-1" style={{ color: 'var(--text-primary)' }}>Active collaborators synchronized on this project node.</p>
        </div>
        <div className="flex items-center gap-3">
          {isAuthorized && (
            <button
              onClick={onInvite}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer flex items-center gap-2"
            >
              <Plus size={14} />
              Invite Member
            </button>
          )}
          <div className="px-4 py-2 glass rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-black text-indigo-600">{members.length} Members</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div 
            key={member._id}
            className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all group relative"
          >
            {isAuthorized && member.role !== 'OWNER' && member.userId?._id !== currentUserId && (
              <button
                onClick={() => onRemove(member.userId._id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                title="Remove Member"
              >
                <Plus size={14} className="rotate-45" />
              </button>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110">
                {member.userId?.avatarUrl ? (
                  <img src={member.userId.avatarUrl} alt={member.userId.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  member.userId?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{member.userId?.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{member.role}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <Send size={14} className="opacity-50" />
                <span className="truncate">{member.userId?.email}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase text-emerald-500">Online</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
