'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Missing credentials', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      success('Welcome back', 'Signed in successfully');
      router.push('/dashboard');
    } else {
      error('Authentication failed', result.error);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Research<span className="text-indigo-600 dark:text-indigo-400">OS</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Sign in to your research workspace
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Access your projects, literature collections, and active hypotheses.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border py-8 px-6 sm:px-10 rounded-2xl shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Academic or Institutional Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. demo@researchos.io"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Accounts Quick-Fill */}
          <div className="pt-4 border-t border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Access (One-Click)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('demo@researchos.io')}
                className="w-full text-left p-2.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary transition-colors"
              >
                <p className="text-xs font-semibold text-foreground">Dr. Sarah Lin (Stanford Bio-X)</p>
                <p className="text-[10px] text-muted-foreground">CRISPR & Biophysics • demo@researchos.io</p>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('dr.elena@researchos.io')}
                className="w-full text-left p-2.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary transition-colors"
              >
                <p className="text-xs font-semibold text-foreground">Dr. Elena Rostova (MIT Quantum)</p>
                <p className="text-[10px] text-muted-foreground">Quantum Physics • dr.elena@researchos.io</p>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
