'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, Lock, Mail, User, Building, GraduationCap, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Missing required fields', 'Please complete all required fields');
      return;
    }

    if (password.length < 8) {
      error('Weak password', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name,
      email,
      password,
      institution: institution || undefined,
      department: department || undefined,
    });
    setIsLoading(false);

    if (result.success) {
      success('Account created', 'Welcome to ResearchOS!');
      router.push('/dashboard');
    } else {
      error('Registration failed', result.error);
    }
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
          Create your researcher account
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Join leading scientists and teams organizing their research in ResearchOS.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border py-8 px-6 sm:px-10 rounded-2xl shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name & Title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Jennifer Doudna"
              leftIcon={<User className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="Institutional Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jennifer@berkeley.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Institution / University"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. UC Berkeley"
                leftIcon={<Building className="w-4 h-4" />}
              />

              <Input
                label="Department / Lab"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Molecular Biology"
                leftIcon={<GraduationCap className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
