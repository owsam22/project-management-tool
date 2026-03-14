import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeProjectId: string | null;
  taskModalOpen: boolean;
  activeTaskId: string | null;
  toggleSidebar: () => void;
  setActiveProject: (id: string | null) => void;
  openTaskModal: (taskId: string) => void;
  closeTaskModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeProjectId: null,
  taskModalOpen: false,
  activeTaskId: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveProject: (id) => set({ activeProjectId: id }),
  openTaskModal: (taskId) => set({ taskModalOpen: true, activeTaskId: taskId }),
  closeTaskModal: () => set({ taskModalOpen: false, activeTaskId: null }),
}));
