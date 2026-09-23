'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { Inbox, CheckCircle2, Circle, X, Trash2, FileText, StickyNote, FolderKanban, CheckSquare, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InboxItem {
  id: string;
  type: string;
  message: string;
  resourceId: string;
  resourceType: string;
  isRead: boolean;
  createdAt: string;
}

export default function InboxPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = new URL('/api/inbox', window.location.origin);
      if (filter === 'UNREAD') {
        url.searchParams.append('isRead', 'false');
      }
      if (typeFilter !== 'ALL') {
        url.searchParams.append('type', typeFilter);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load inbox items');
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      } else {
        throw new Error(json.error || 'Failed to load inbox items');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, filter, typeFilter]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/inbox/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      });
      if (res.ok) {
        setItems(items.map((item) => (item.id === id ? { ...item, isRead: !isRead } : item)));
      }
    } catch (err) {
      console.error('Error updating inbox item:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/inbox/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error dismissing inbox item:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading('all');
      const res = await fetch('/api/inbox/mark-all-read', { method: 'POST' });
      if (res.ok) {
        setItems(items.map((item) => ({ ...item, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getResourceLink = (item: InboxItem) => {
    switch (item.resourceType) {
      case 'DOCUMENT':
        return `/documents/${item.resourceId}`; // Adjust if there's a doc detail route, otherwise just /documents
      case 'NOTE':
        return `/notes`; // Adjust to specific note if routing allows
      case 'TASK':
        return `/projects`; // Assuming tasks are viewed in projects context
      case 'PROJECT':
        return `/projects/${item.resourceId}`;
      default:
        return '#';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'NEW_DOCUMENT':
      case 'UPDATED_DOCUMENT':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'NEW_NOTE':
        return <StickyNote className="w-5 h-5 text-yellow-500" />;
      case 'NEW_TASK':
        return <CheckSquare className="w-5 h-5 text-green-500" />;
      case 'TASK_DUE':
      case 'TASK_OVERDUE':
        return <Clock className="w-5 h-5 text-red-500" />;
      case 'IMPORTANT_PROJECT_ACTIVITY':
        return <FolderKanban className="w-5 h-5 text-purple-500" />;
      default:
        return <Inbox className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    // Ideally this would be driven by enum/constants, but for MVP we can just provide the main ones
    ['NEW_DOCUMENT', 'UPDATED_DOCUMENT', 'NEW_NOTE', 'NEW_TASK', 'TASK_DUE', 'TASK_OVERDUE', 'IMPORTANT_PROJECT_ACTIVITY'].forEach(t => types.add(t));
    return Array.from(types);
  }, []);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 sm:px-8 border-b border-border flex items-center justify-between shrink-0 bg-card/40 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
              <Inbox className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Inbox</h1>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={handleMarkAllRead}
                disabled={actionLoading === 'all' || items.every(i => i.isRead)}
                className="text-sm px-3 py-1.5 font-medium rounded-lg text-foreground bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark all as read
              </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Filters */}
            <div className="flex bg-secondary/50 rounded-lg p-1">
               <button
                  onClick={() => setFilter('ALL')}
                  className={twMerge(
                    clsx(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                      filter === 'ALL' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('UNREAD')}
                  className={twMerge(
                    clsx(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                      filter === 'UNREAD' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )
                  )}
                >
                  Unread
                </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-background border border-border text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Events</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">
               {error}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">All caught up</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                There are no {filter === 'UNREAD' ? 'unread ' : ''}items in your inbox right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={twMerge(
                    clsx(
                      "group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all relative overflow-hidden",
                      item.isRead
                        ? "bg-card/50 border-border/50 opacity-75 hover:opacity-100"
                        : "bg-card border-indigo-200/50 dark:border-indigo-900/50 shadow-sm"
                    )
                  )}
                >
                  {!item.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                  )}
                  <div className="flex-shrink-0 pt-1">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                         {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                         • {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <Link href={getResourceLink(item)} className="block focus:outline-none">
                      <h4 className={twMerge(
                          clsx(
                            "text-sm sm:text-base font-medium mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
                            item.isRead ? "text-foreground" : "text-foreground font-semibold"
                          )
                        )}
                      >
                        {item.message}
                      </h4>
                    </Link>
                  </div>
                  <div className="flex items-start sm:items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleMarkAsRead(item.id, item.isRead)}
                      disabled={actionLoading === item.id}
                      title={item.isRead ? "Mark as unread" : "Mark as read"}
                      className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {item.isRead ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDismiss(item.id)}
                      disabled={actionLoading === item.id}
                      title="Dismiss"
                      className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
