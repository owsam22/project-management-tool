import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    localStorage.setItem('scpm_token', token);
    localStorage.setItem('scpm_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('scpm_token');
    localStorage.removeItem('scpm_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('scpm_token');
      const userStr = localStorage.getItem('scpm_user');
      if (token && userStr) {
        set({ user: JSON.parse(userStr), token, isAuthenticated: true });
      }
    }
  },
}));
