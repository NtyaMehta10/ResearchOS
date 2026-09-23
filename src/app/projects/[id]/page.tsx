'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UploadDocumentModal } from '@/components/modals/UploadDocumentModal';
import { NewNoteModal } from '@/components/modals/NewNoteModal';
import { NewCollectionModal } from '@/components/modals/NewCollectionModal';
import { NewTaskModal } from '@/components/modals/NewTaskModal';
import { TaskCard, Task } from '@/components/ui/TaskCard';
import { useToast } from '@/components/providers/ToastProvider';
import {
  FolderKanban,
  FileText,
  StickyNote,
  FolderGit2,
  Activity,
  Plus,
  FileUp,
  Trash2,
  Archive,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Download,
  Pin,
  Clock,
  CheckSquare,
  Star,
} from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const router = useRouter();
  const { success, error } = useToast();

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, statsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/stats`),
      ]);

      if (projRes.ok) {
        const p = await projRes.json();
        if (p.success) setProject(p.data);
      } else {
        router.push('/projects');
        return;
      }

      if (statsRes.ok) {
        const s = await statsRes.json();
        if (s.success) setStats(s.data);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Project deleted', 'Workspace has been removed.');
        router.push('/projects');
      } else {
        error('Failed to delete', json.error);
      }
    } catch {
      error('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!project) return;
    const newStatus = project.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Status updated', `Project marked as ${newStatus}.`);
        fetchProjectData();
      }
    } catch {
      error('Failed to update status');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!project) return;
    const newFav = !project.isFavorite;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newFav }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success(newFav ? 'Added to favorites' : 'Removed from favorites');
        fetchProjectData();
      }
    } catch {
      error('Failed to update favorite status');
    }
  };

  if (loading && !project) {
    return (
      <AppShell title="Loading Project Workspace...">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!project) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FolderKanban className="w-3.5 h-3.5" /> },
    {
      id: 'documents',
      label: 'Documents',
      count: project.documents?.length || 0,
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: 'notes',
      label: 'Notes',
      count: project.notes?.length || 0,
      icon: <StickyNote className="w-3.5 h-3.5" />,
    },
    {
      id: 'collections',
      label: 'Collections',
      count: project.collections?.length || 0,
      icon: <FolderGit2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      count: project.tasks?.length || 0,
      icon: <CheckSquare className="w-3.5 h-3.5" />,
    },
    { id: 'timeline', label: 'Timeline', icon: <Activity className="w-3.5 h-3.5" /> },
    {
      id: 'ai-readiness',
      label: 'AI Layer (Phase 2)',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
    },
  ];

  return (
    <AppShell
      title={project.title}
      subtitle={`Project Workspace • ${project.status}`}
      onRefreshData={fetchProjectData}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link href="/projects">
                <Button variant="outline" size="sm" className="p-2 h-9 w-9">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: project.color || '#4f46e5' }}
              >
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg md:text-xl font-extrabold text-foreground">
                    {project.title}
                  </h1>
                  <button onClick={handleFavoriteToggle} className="text-muted-foreground hover:text-amber-500 transition-colors">
                    <Star className={`w-5 h-5 ${project.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                  <Badge variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline">{project.visibility}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveToggle}
                leftIcon={<Archive className="w-3.5 h-3.5" />}
              >
                {project.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Project Tags */}
          {project.projectTags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
              {project.projectTags.map((pt: any) => (
                <Badge key={pt.tag.id} customColor={pt.tag.color}>
                  #{pt.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Documents In Vault
                  </span>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {project.documents?.length || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Peer-reviewed papers & preprints
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Synthesis Notes
                  </span>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {project.notes?.length || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Hypotheses & observations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Curated Collections
                  </span>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {project.collections?.length || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Thematic research binders
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Tasks
                  </span>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {stats?.completedTaskCount || 0} / {stats?.taskCount || project.tasks?.length || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Completed tasks
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold">Research Scope & Hypotheses</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 text-xs text-foreground/90 leading-relaxed space-y-3">
                <p>
                  {project.description ||
                    'No detailed hypothesis registered. Add structured goals or methodology notes using the Notes tab.'}
                </p>
                <div className="p-3 rounded-xl bg-secondary/40 border border-border text-[11px] text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Workspace Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Upload full-text PDFs or data files in the Documents tab.</li>
                    <li>Synthesize experimental results and paper takeaways under Notes.</li>
                    <li>Categorize papers into thematic sub-collections.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Project Literature & Files</h3>
                <p className="text-xs text-muted-foreground">
                  Documents directly associated with this research initiative
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsUploadOpen(true)}
                leftIcon={<FileUp className="w-3.5 h-3.5" />}
              >
                Upload Document
              </Button>
            </div>

            {project.documents?.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-6 h-6" />}
                title="No documents yet"
                description="Upload papers, PDFs, or experimental data to this project."
                actionLabel="Upload First Document"
                onAction={() => setIsUploadOpen(true)}
                actionIcon={<FileUp className="w-4 h-4" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.documents.map((doc: any) => (
                  <Card key={doc.id} className="p-5 hover:border-indigo-500/50 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        download
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                    <Link href={`/documents/${doc.id}`}>
                      <h4 className="text-sm font-bold text-foreground mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                        {doc.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {doc.authors || doc.journal || doc.fileName}
                    </p>
                    {doc.collection && (
                      <Badge customColor={doc.collection.color} className="text-[10px] mt-2.5">
                        {doc.collection.name}
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Project Research Notes</h3>
                <p className="text-xs text-muted-foreground">
                  Hypotheses, literature syntheses, and laboratory annotations
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsNoteModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Write Note
              </Button>
            </div>

            {project.notes?.length === 0 ? (
              <EmptyState
                icon={<StickyNote className="w-6 h-6" />}
                title="No notes in this project"
                description="Write your first research note or protocol for this project."
                actionLabel="Write First Note"
                onAction={() => setIsNoteModalOpen(true)}
                actionIcon={<Plus className="w-4 h-4" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.notes.map((note: any) => (
                  <Link key={note.id} href={`/notes?id=${note.id}`}>
                    <Card className="p-5 h-full hover:border-amber-500/50 transition-all group flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {note.title}
                            </h4>
                            {note.isPinned && (
                              <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-4 leading-relaxed font-mono">
                          {note.content}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-4 pt-2 border-t border-border/60">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Collections */}
        {activeTab === 'collections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Project Collections</h3>
                <p className="text-xs text-muted-foreground">
                  Thematic binders organizing papers within this project
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsCollectionModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Collection
              </Button>
            </div>

            {project.collections?.length === 0 ? (
              <EmptyState
                icon={<FolderGit2 className="w-6 h-6" />}
                title="No collections in this project"
                description="Create a collection to bundle related literature together."
                actionLabel="Create Collection"
                onAction={() => setIsCollectionModalOpen(true)}
                actionIcon={<Plus className="w-4 h-4" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.collections.map((col: any) => (
                  <Card key={col.id} className="p-5 hover:border-sky-500/50 transition-all">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-3 shadow-sm"
                      style={{ backgroundColor: col.color || '#0ea5e9' }}
                    >
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{col.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {col.description || 'No description provided.'}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/60">
                      {col._count?.documents || 0} papers assigned
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Project Tasks</h3>
                <p className="text-xs text-muted-foreground">Manage your action items</p>
              </div>
              <Button size="sm" onClick={() => setIsTaskModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create Task
              </Button>
            </div>
            {(!project.tasks || project.tasks.length === 0) ? (
              <EmptyState
                icon={<CheckSquare className="w-6 h-6" />}
                title="No tasks in this project"
                description="Create a task to keep track of your progress."
                actionLabel="Create Task"
                onAction={() => setIsTaskModalOpen(true)}
                actionIcon={<Plus className="w-4 h-4" />}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {project.tasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Timeline (Audit Activity) */}
        {activeTab === 'timeline' && (
          <Card className="p-5">
            <CardTitle className="text-sm font-bold mb-4">Project Timeline</CardTitle>
            {project.activities?.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No activity logged for this project yet.
              </p>
            ) : (
              <div className="relative pl-6 border-l border-border space-y-4">
                {project.activities.map((act: any) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 border-background bg-indigo-600" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{act.entityTitle}</p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{act.details}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tab 6: Phase 2 AI Readiness Preview */}
        {activeTab === 'ai-readiness' && (
          <Card className="p-8 border-indigo-500/30 bg-indigo-500/5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold">Phase 2 AI Extension Slot</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              This project workspace is pre-architected to receive Phase 2 AI capabilities without breaking changes.
              In Phase 2, this tab will host the multi-paper RAG synthesis engine, automatic citation extraction graphs, and vector similarity explorer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-semibold text-foreground">Vector RAG Retrieval</p>
                <p className="text-[11px] text-muted-foreground mt-1">Ask questions across all {project.documents?.length || 0} project papers simultaneously.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-semibold text-foreground">Hypothesis Generation</p>
                <p className="text-[11px] text-muted-foreground mt-1">Cross-reference experimental notes against literature findings.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-semibold text-foreground">Citation Graph</p>
                <p className="text-[11px] text-muted-foreground mt-1">Traverse references, co-citations, and conflicting claims automatically.</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultProjectId={projectId}
        onUploaded={fetchProjectData}
      />

      <NewNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        defaultProjectId={projectId}
        onCreated={fetchProjectData}
      />

      <NewCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        defaultProjectId={projectId}
        onCreated={fetchProjectData}
      />

      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={projectId}
        onCreated={fetchProjectData}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        isLoading={isDeleting}
        title="Delete Project Workspace"
        message="Are you sure you want to delete this workspace? Associated files will be unlinked."
        confirmLabel="Delete Project"
      />
    </AppShell>
  );
}
