'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  StickyNote,
  FolderGit2,
  Search,
  Activity as ActivityIcon,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProjectQuickLink {
  id: string;
  title: string;
  color: string;
}

interface AppSidebarProps {
  onNewProject?: () => void;
  onUploadDoc?: () => void;
  onNewNote?: () => void;
}

export function AppSidebar({ onNewProject }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [projects, setProjects] = useState<ProjectQuickLink[]>([]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects?status=ACTIVE');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setProjects(json.data.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Failed to load quick projects in sidebar:', err);
      }
    }
    loadProjects();
  }, [pathname]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Notes', href: '/notes', icon: StickyNote },
    { label: 'Collections', href: '/collections', icon: FolderGit2 },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Activity', href: '/activity', icon: ActivityIcon },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen border-r border-border bg-card/60 backdrop-blur-md flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Research<span className="text-indigo-600 dark:text-indigo-400">OS</span>
          </span>
        </Link>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Toggle light/dark theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )
                )}
              >
                <Icon
                  className={twMerge(
                    clsx(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-foreground'
                    )
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Quick Projects */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          <div className="px-3 pb-2 flex items-center justify-between">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground"
            >
              <span>Active Projects</span>
              <ChevronDown
                className={twMerge(
                  clsx('w-3 h-3 transition-transform', !projectsExpanded && '-rotate-90')
                )}
              />
            </button>
            {onNewProject && (
              <button
                onClick={onNewProject}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {projectsExpanded && (
            <div className="space-y-0.5">
              {projects.length === 0 ? (
                <p className="px-3 py-1.5 text-xs text-muted-foreground/70 italic">
                  No active projects yet
                </p>
              ) : (
                projects.map((p) => {
                  const isCurrent = pathname === `/projects/${p.id}`;
                  return (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className={twMerge(
                        clsx(
                          'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors truncate',
                          isCurrent
                            ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        )
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color || '#4f46e5' }}
                      />
                      <span className="truncate">{p.title}</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-border bg-card/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/40 border border-border/40">
          <Link href="/settings" className="flex items-center gap-2.5 min-w-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'Researcher'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.institution || user?.email}</p>
            </div>
          </Link>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
