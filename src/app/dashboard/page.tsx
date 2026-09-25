"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  FolderKanban,
  FileText,
  StickyNote,
  FolderGit2,
  HardDrive,
  Clock,
  ArrowRight,
  Plus,
  FileUp,
  Pin,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        analyticsRes,
        projectsRes,
        docsRes,
        notesRes,
        activityRes,
        tasksRes,
        inboxRes,
      ] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/projects?status=ACTIVE"),
        fetch("/api/documents"),
        fetch("/api/notes"),
        fetch("/api/activity?limit=8"),
        fetch("/api/tasks?status=TODO"),
        fetch("/api/inbox?isRead=false"),
      ]);

      if (analyticsRes.ok) {
        const a = await analyticsRes.json();
        if (a.success) setAnalytics(a.data);
      }
      if (projectsRes.ok) {
        const p = await projectsRes.json();
        if (p.success) setProjects(p.data);
      }
      if (docsRes.ok) {
        const d = await docsRes.json();
        if (d.success) setDocuments(d.data.slice(0, 5));
      }
      if (notesRes.ok) {
        const n = await notesRes.json();
        if (n.success) setNotes(n.data.slice(0, 5));
      }
      if (activityRes.ok) {
        const act = await activityRes.json();
        if (act.success) setActivities(act.data);
      }
      if (tasksRes.ok) {
        const t = await tasksRes.json();
        if (t.success) setTasks(t.data);
      }
      if (inboxRes.ok) {
        const i = await inboxRes.json();
        if (i.success) setInboxItems(i.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AppShell
      title="Research Workspace Dashboard"
      subtitle="Overview of your active projects, documents, synthesis notes, and telemetry"
      onRefreshData={fetchDashboardData}
    >
      <div className="space-y-8">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <Card className="hover:border-indigo-500/40 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Projects
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (analytics?.overview?.activeProjects ?? 0)
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {analytics?.overview?.totalProjects ?? 0} total tracked
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/40 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Literature Docs
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (analytics?.overview?.totalDocuments ?? 0)
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Full-text indexed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500/40 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Synthesis Notes
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <StickyNote className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (analytics?.overview?.totalNotes ?? 0)
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Markdown & code
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-sky-500/40 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Collections
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (analytics?.overview?.totalCollections ?? 0)
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Curated binders
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500/40 transition-colors col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Storage
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2 truncate">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  (analytics?.overview?.formattedStorage ?? "0 Bytes")
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Local vault
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Projects & Active Projects Grid */}
        <div className="space-y-8">
          {/* Favorite Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Favorite Projects
                </h2>
                <p className="text-xs text-muted-foreground">
                  Quick access to your starred workspaces
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : projects.filter((p) => p.isFavorite).length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-border bg-card">
                <p className="text-sm font-semibold text-foreground">
                  No favorite projects
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Star a project to pin it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects
                  .filter((p) => p.isFavorite)
                  .map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`}>
                      <Card className="h-full hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                              style={{ backgroundColor: p.color || "#4f46e5" }}
                            >
                              <FolderKanban className="w-4 h-4" />
                            </div>
                            <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                            {p.title}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Active Projects
                </h2>
                <p className="text-xs text-muted-foreground">
                  Primary workspaces currently under investigation
                </p>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View all projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
                <p className="text-sm font-semibold text-foreground">
                  No active research projects
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first research workspace to begin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`}>
                    <Card className="h-full hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: p.color || "#4f46e5" }}
                          >
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {p.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-bold text-foreground mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                          {p.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {p.description || "No description provided."}
                        </p>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <div className="flex items-center gap-2 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                          <span>{p._count?.documents || 0} docs</span>
                          <span>•</span>
                          <span>{p._count?.tasks || 0} tasks</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Needs Attention
              </h2>
              <p className="text-sm text-muted-foreground">
                Tasks to complete and unread notifications
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unread Inbox */}
            <Card>
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    Inbox Notifications
                    {inboxItems.length > 0 && (
                      <Badge
                        variant="danger"
                        className="ml-2 h-5 text-[10px] bg-rose-500"
                      >
                        {inboxItems.length}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <Link
                  href="/inbox"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="p-3 divide-y divide-border/40">
                {loading ? (
                  <div className="space-y-3 p-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : inboxItems.length === 0 ? (
                  <p className="p-6 text-center text-xs text-muted-foreground">
                    All caught up!
                  </p>
                ) : (
                  inboxItems.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/inbox`}
                      className="flex items-start justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors group"
                    >
                      <div className="flex gap-3 min-w-0">
                        <div className="mt-0.5 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <p className="text-xs text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-relaxed">
                            {item.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(item.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Incomplete Tasks */}
            <Card>
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    Active Tasks
                    {tasks.length > 0 && (
                      <Badge
                        variant="outline"
                        className="ml-2 h-5 text-[10px] border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400"
                      >
                        {tasks.length}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 divide-y divide-border/40">
                {loading ? (
                  <div className="space-y-3 p-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : tasks.length === 0 ? (
                  <p className="p-6 text-center text-xs text-muted-foreground">
                    No pending tasks.
                  </p>
                ) : (
                  tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors"
                    >
                      <div className="flex gap-3 min-w-0">
                        <div className="mt-0.5 w-4 h-4 rounded border border-indigo-200 dark:border-indigo-800 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              Priority: {task.priority}
                            </span>
                            {task.dueDate && (
                              <span
                                className={`text-[10px] font-medium ${new Date(task.dueDate) < new Date() ? "text-rose-500" : "text-emerald-500"}`}
                              >
                                Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Discoveries & Activity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Recent Discoveries & Activity
              </h2>
              <p className="text-sm text-muted-foreground">
                Latest literature, notes, and log events
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Documents & Notes (2 columns wide on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Recently Uploaded Documents
                    </CardTitle>
                  </div>
                  <Link
                    href="/documents"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className="p-3 divide-y divide-border/40">
                  {loading ? (
                    <div className="space-y-3 p-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : documents.length === 0 ? (
                    <p className="p-6 text-center text-xs text-muted-foreground">
                      No documents uploaded yet.
                    </p>
                  ) : (
                    documents.slice(0, 3).map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/documents/${doc.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {doc.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {doc.authors ? `${doc.authors} • ` : ""}
                              {doc.journal || doc.fileName}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-amber-500" />
                      Recent Research Notes
                    </CardTitle>
                  </div>
                  <Link
                    href="/notes"
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className="p-3 divide-y divide-border/40">
                  {loading ? (
                    <div className="space-y-3 p-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : notes.length === 0 ? (
                    <p className="p-6 text-center text-xs text-muted-foreground">
                      No notes written yet.
                    </p>
                  ) : (
                    notes.slice(0, 3).map((note) => (
                      <Link
                        key={note.id}
                        href={`/notes?id=${note.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <StickyNote className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {note.title}
                              </p>
                              {note.isPinned && (
                                <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {note.project
                                ? note.project.title
                                : "General note"}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Stream (1 column wide on large screens) */}
            <Card className="h-full flex flex-col">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Activity Stream
                  </CardTitle>
                </div>
                <Link
                  href="/activity"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Full timeline
                </Link>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto min-h-[300px]">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    No research activities recorded yet.
                  </p>
                ) : (
                  <div className="relative pl-5 border-l border-border space-y-6 my-2">
                    {activities.map((act) => (
                      <div key={act.id} className="relative group">
                        <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full border-2 border-background bg-indigo-500" />
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold text-foreground leading-snug">
                            {act.entityTitle}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {act.details ||
                              act.action.replace("_", " ").toLowerCase()}
                          </p>
                          <span className="text-[9px] text-muted-foreground/80 mt-1">
                            {new Date(act.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
