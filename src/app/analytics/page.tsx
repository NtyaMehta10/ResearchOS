'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  BarChart3,
  FolderKanban,
  FileText,
  StickyNote,
  HardDrive,
  TrendingUp,
  PieChart,
  Layers,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      title="Research Analytics & Telemetry"
      subtitle="Productivity indicators, literature intake velocity, and workspace storage metrics"
    >
      <div className="space-y-8 max-w-6xl">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Active Projects
              </span>
              <p className="text-3xl font-extrabold text-foreground mt-2">
                {loading ? <Skeleton className="h-8 w-12" /> : data?.overview?.activeProjects ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {data?.overview?.totalProjects ?? 0} total registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Cataloged Literature
              </span>
              <p className="text-3xl font-extrabold text-foreground mt-2">
                {loading ? <Skeleton className="h-8 w-12" /> : data?.overview?.totalDocuments ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across all research workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Authored Notes
              </span>
              <p className="text-3xl font-extrabold text-foreground mt-2">
                {loading ? <Skeleton className="h-8 w-12" /> : data?.overview?.totalNotes ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Markdown & lab syntheses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Vault Storage
              </span>
              <p className="text-3xl font-extrabold text-foreground mt-2 truncate">
                {loading ? <Skeleton className="h-8 w-16" /> : data?.overview?.formattedStorage ?? '0 Bytes'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Indexed binary & text data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Activity Velocity Bar Chart */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-sm font-bold">
                Weekly Research Velocity (Last 7 Days)
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Literature uploads, notes recorded, and project milestone updates
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {loading ? (
              <Skeleton className="h-44 w-full rounded-xl" />
            ) : (
              <div className="flex items-end justify-between gap-3 h-44 pt-6 pb-2">
                {data?.dailyActivityTrend?.map((item: any) => {
                  const maxCount = Math.max(...data.dailyActivityTrend.map((d: any) => d.count), 1);
                  const heightPercent = Math.max(Math.round((item.count / maxCount) * 100), 10);
                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[11px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </span>
                      <div className="w-full max-w-[48px] bg-secondary rounded-lg overflow-hidden flex items-end h-32">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-lg transition-all duration-500 group-hover:from-indigo-500 group-hover:to-indigo-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {item.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dual Grid: Project Item Breakdown & Document Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Distribution */}
          <Card>
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm font-bold">Research Project Distribution</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Volume of literature and notes per project</p>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : data?.projectDistribution?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No projects to plot.</p>
              ) : (
                data?.projectDistribution?.map((p: any) => {
                  const total = data.overview.totalDocuments + data.overview.totalNotes;
                  const pct = total > 0 ? Math.round((p.totalItems / total) * 100) : 0;
                  return (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-semibold text-foreground hover:text-indigo-600 truncate max-w-[280px]"
                        >
                          {p.title}
                        </Link>
                        <span className="text-muted-foreground shrink-0">
                          {p.totalItems} items ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: p.color || '#4f46e5',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Document Types Breakdown */}
          <Card>
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600" />
                <CardTitle className="text-sm font-bold">Literature File Types</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Format distribution of cataloged documents</p>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : data?.documentTypeBreakdown?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No documents in library.</p>
              ) : (
                data?.documentTypeBreakdown?.map((item: any) => (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{item.type}</span>
                      <span className="text-muted-foreground">
                        {item.count} docs ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
