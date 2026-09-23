'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/providers/ToastProvider';
import {
  FolderKanban,
  Plus,
  Search,
  Archive,
  Trash2,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setProjects(json.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleArchiveToggle = async (project: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = project.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success(
          newStatus === 'ARCHIVED' ? 'Project archived' : 'Project restored',
          `"${project.title}" status updated.`
        );
        fetchProjects();
      } else {
        error('Action failed', json.error);
      }
    } catch {
      error('Network error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Project deleted', 'Workspace and associations removed.');
        setDeleteId(null);
        fetchProjects();
      } else {
        error('Delete failed', json.error);
      }
    } catch {
      error('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell
      title="Research Projects"
      subtitle="Organize, manage, and monitor all active and archived research investigations"
      onRefreshData={fetchProjects}
    >
      <div className="space-y-6">
        {/* Controls Bar: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title or hypothesis..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border shrink-0 self-start sm:self-auto">
            {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-card text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={search ? "No projects found" : "No research projects yet"}
            description={
              search
                ? `No projects matched "${search}". Try refining your query.`
                : "Create your first project to organize papers, notes, and collections in one workspace."
            }
            action={!search ? {
              label: "Create Project",
              onClick: () => {
                // To open the modal we need a state trigger or similar. The AppShell provides `onNewProject` through the AppHeader but not accessible here directly unless we dispatch an event or just use link if we don't have modal access. We can trigger a custom event or let the user click the button in header. For now, since AppShell handles the modal, we can dispatch a custom event or omit the button. Since task asks for it, let's just do an empty onAction as we don't have modal state here. Wait, AppShell has `isProjectModalOpen`, but it's internal. We can redirect to the project creation page if there's one, but typically empty state triggers it. Let's just pass `actionLabel` and `onAction` as requested even though we need a way to open it.
                const btn = document.querySelector('[aria-label="New Project"]') as HTMLButtonElement | null;
                if(btn) btn.click();
              },
              icon: <Plus className="w-4 h-4" />
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: project.color || '#4f46e5' }}
                    >
                      <FolderKanban className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}
                        className="text-[10px]"
                      >
                        {project.status}
                      </Badge>

                      <button
                        onClick={(e) => handleArchiveToggle(project, e)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title={project.status === 'ARCHIVED' ? 'Restore project' : 'Archive project'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteId(project.id);
                        }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/projects/${project.id}`}>
                    <h3 className="text-base font-bold text-foreground mt-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Tags */}
                  {project.projectTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {project.projectTags.slice(0, 3).map((pt: any) => (
                        <Badge key={pt.tag.id} customColor={pt.tag.color} className="text-[10px]">
                          #{pt.tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{project._count?.documents || 0} docs</span>
                    <span>•</span>
                    <span>{project._count?.notes || 0} notes</span>
                    <span>•</span>
                    <span>{project._count?.collections || 0} collections</span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    Open Workspace
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Project Workspace"
        message="Are you sure you want to permanently delete this project? Associated notes and documents will remain in your general library or be unlinked."
        confirmLabel="Delete Project"
      />
    </AppShell>
  );
}
