'use client';

import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, FolderKanban, MessageSquare, Moon, Sun, Menu, LogOut, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard', icon: FolderKanban },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around lg:hidden z-[100] px-4 shadow-lg shadow-black/5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button onClick={toggleTheme} className="flex flex-col items-center gap-1 p-2 text-slate-400">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span className="text-[10px] font-black uppercase tracking-tighter">Theme</span>
        </button>
        <button onClick={logout} className="flex flex-col items-center gap-1 p-2 text-red-500/80">
          <LogOut size={20} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-500 z-[80] 
          ${isCollapsed ? 'w-24' : 'w-72'}`}
        style={{ 
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        {/* Branding */}
        <div className="p-10 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 rotate-3">
                <span className="text-white font-black text-2xl -rotate-3">V</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Velo</h1>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-indigo-600 shadow-sm"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-2 pt-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-5 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' 
                    : 'text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-indigo-600 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                <Icon size={22} className={`${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                {!isCollapsed && isActive && (
                   <span className="ml-auto w-2 h-2 rounded-full bg-white opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Footer */}
        <div className="p-8 space-y-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-white dark:hover:bg-slate-900 transition-all font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            {theme === 'light' ? <Moon size={18} className="text-indigo-600" /> : <Sun size={18} className="text-amber-400" />}
            {!isCollapsed && <span>{theme === 'light' ? 'NIGHT MODE' : 'DAY MODE'}</span>}
          </button>

          {/* Profile Card */}
          <div className={`p-5 rounded-[2rem] bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 transition-all ${isCollapsed ? 'px-3' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-xl shadow-indigo-600/30">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <button 
                    onClick={logout}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 flex items-center gap-1 mt-1 transition-colors uppercase tracking-widest"
                  >
                     Sign Out <LogOut size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
