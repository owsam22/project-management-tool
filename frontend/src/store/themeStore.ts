import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isHydrated: boolean;
  setHydrated: (val: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark', // Default to dark as per current state
  isHydrated: false,
  setTheme: (theme) => {
    localStorage.setItem('scpm_theme', theme);
    set({ theme });
  },
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('scpm_theme', newTheme);
    return { theme: newTheme };
  }),
  setHydrated: (val) => set({ isHydrated: val }),
}));
