'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import Link from 'next/link';
import { Moon, Sun, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.data.user, res.data.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-primary transition-colors duration-300">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 p-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-medium text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted hover:text-primary transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="w-full max-w-[400px] animate-fade-in">
        {/* Branding */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary border border-border mb-6">
            <span className="text-xl font-bold tracking-tighter text-primary">V</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Sign in to Velo</h1>
          <p className="text-sm text-secondary mt-2">Enter your credentials to access your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary ml-1" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted"
              placeholder="name@company.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-medium text-secondary" htmlFor="password">Password</label>
              <Link href="#" className="text-xs text-muted hover:text-primary transition-colors">Forgot password?</Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <span className="text-sm">!</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-primary text-bg-primary rounded-lg font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-8 text-[10px] font-medium text-muted uppercase tracking-[0.2em]">
        Velo Professional Suite
      </div>
    </div>
  );
}
