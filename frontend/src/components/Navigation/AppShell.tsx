'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, isHydrated, setHydrated } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Initial hydration
    const savedTheme = localStorage.getItem('scpm_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      useThemeStore.setState({ theme: savedTheme });
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    setHydrated(true);
  }, [theme, setHydrated]);

  useEffect(() => {
    // Sync theme toggle
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Don't show sidebar on auth pages or if not authenticated
  const isPublicPage = ['/', '/login', '/signup'].includes(pathname);
  const showSidebar = isAuthenticated && !isPublicPage;

  if (!isHydrated) return null;

  return (
    <div className="flex min-h-screen relative">
      <div className="bg-illustration animate-float" />
      {showSidebar && <Sidebar />}
      <main className={`flex-1 overflow-x-hidden relative ${showSidebar ? 'pb-20 lg:pb-0' : ''}`}>
        {children}
      </main>
    </div>
  );
}
