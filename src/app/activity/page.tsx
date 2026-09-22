'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Activity as ActivityIcon,
  FolderKanban,
  FileText,
  StickyNote,
  FolderGit2,
  Tag,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activity?limit=50');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setActivities(json.data);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'ALL') return true;
    return act.entityType === filterType;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return <FolderKanban className="w-4 h-4 text-indigo-500" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'NOTE':
        return <StickyNote className="w-4 h-4 text-amber-500" />;
      case 'COLLECTION':
        return <FolderGit2 className="w-4 h-4 text-sky-500" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-purple-500" />;
    }
  };

  const getEntityLink = (act: any) => {
    switch (act.entityType) {
      case 'PROJECT':
        return `/projects/${act.entityId}`;
      case 'DOCUMENT':
        return `/documents/${act.entityId}`;
      case 'NOTE':
        return `/notes?id=${act.entityId}`;
      case 'COLLECTION':
        return `/collections`;
      default:
        return null;
    }
  };

  return (
    <AppShell
      title="Research Activity History"
      subtitle="Complete chronological audit log of literature acquisitions, notes authored, and project milestones"
      onRefreshData={fetchActivities}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PROJECT', 'DOCUMENT', 'NOTE', 'COLLECTION'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {type === 'ALL' ? 'All Activity' : `${type.charAt(0) + type.slice(1).toLowerCase()}s`}
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        <Card className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <EmptyState
              icon={<ActivityIcon className="w-6 h-6" />}
              title="No activities recorded"
              description="Activities will appear here as you create projects, upload documents, and record notes."
            />
          ) : (
            <div className="relative pl-6 border-l border-border space-y-6 my-2">
              {filteredActivities.map((act) => {
                const link = getEntityLink(act);
                return (
                  <div key={act.id} className="relative group">
                    <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-background bg-indigo-600" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(act.entityType)}
                        {link ? (
                          <Link
                            href={link}
                            className="text-sm font-bold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{act.entityTitle}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ) : (
                          <span className="text-sm font-bold text-foreground">{act.entityTitle}</span>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {act.entityType}
                        </Badge>
                      </div>

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(act.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {act.details || act.action}
                    </p>

                    {act.project && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                        Project: {act.project.title}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
