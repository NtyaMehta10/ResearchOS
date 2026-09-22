'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Search as SearchIcon,
  FolderKanban,
  FileText,
  StickyNote,
  FolderGit2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<'all' | 'projects' | 'documents' | 'notes' | 'collections'>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    projects: any[];
    documents: any[];
    notes: any[];
    collections: any[];
    totalCount: number;
  }>({
    projects: [],
    documents: [],
    notes: [],
    collections: [],
    totalCount: 0,
  });

  const performSearch = useCallback(async (q: string, type: string) => {
    if (!q.trim()) {
      setResults({ projects: [], documents: [], notes: [], collections: [], totalCount: 0 });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}&limit=30`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, activeType);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, activeType, performSearch]);

  const searchTabs = [
    { id: 'all', label: 'All Results', count: results.totalCount },
    { id: 'projects', label: 'Projects', count: results.projects.length },
    { id: 'documents', label: 'Documents', count: results.documents.length },
    { id: 'notes', label: 'Notes', count: results.notes.length },
    { id: 'collections', label: 'Collections', count: results.collections.length },
  ];

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keywords, author names, DOIs, equations, notes..."
          leftIcon={<SearchIcon className="w-5 h-5" />}
          className="text-base py-3"
          autoFocus
        />

        <Tabs
          tabs={searchTabs}
          activeTab={activeType}
          onChange={(id) => setActiveType(id as any)}
        />
      </div>

      {/* Results View */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : !query.trim() ? (
        <EmptyState
          icon={<SearchIcon className="w-6 h-6" />}
          title="Type to begin searching"
          description="Search your entire research catalog across projects, publications, notes, and collections."
        />
      ) : results.totalCount === 0 ? (
        <EmptyState
          icon={<SearchIcon className="w-6 h-6" />}
          title="No results found"
          description={`We couldn't find any matches for "${query}". Try alternative keywords, author surnames, or DOIs.`}
        />
      ) : (
        <div className="space-y-8">
          {/* Projects Results */}
          {(activeType === 'all' || activeType === 'projects') && results.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Projects ({results.projects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`}>
                    <Card className="p-5 hover:border-indigo-500/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: p.color || '#4f46e5' }}
                        >
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {p.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {(activeType === 'all' || activeType === 'documents') && results.documents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Documents & Literature ({results.documents.length})
              </h3>
              <div className="space-y-2">
                {results.documents.map((doc) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <Card className="p-4 hover:border-emerald-500/50 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.authors ? `${doc.authors} • ` : ''}
                            {doc.journal || doc.fileName}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notes Results */}
          {(activeType === 'all' || activeType === 'notes') && results.notes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Research Notes ({results.notes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.notes.map((note) => (
                  <Link key={note.id} href={`/notes?id=${note.id}`}>
                    <Card className="p-5 hover:border-amber-500/50 transition-all group">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-amber-500 shrink-0" />
                        <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {note.title}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-3 font-mono leading-relaxed">
                        {note.content}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Collections Results */}
          {(activeType === 'all' || activeType === 'collections') && results.collections.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Collections ({results.collections.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.collections.map((col) => (
                  <Link key={col.id} href={`/collections`}>
                    <Card className="p-4 hover:border-sky-500/50 transition-all">
                      <div className="flex items-center gap-2.5">
                        <FolderGit2 className="w-4 h-4 text-sky-500 shrink-0" />
                        <h4 className="text-sm font-bold text-foreground truncate">{col.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{col.description}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell
      title="Global Research Search"
      subtitle="Search across all projects, literature, synthesis notes, and collections"
    >
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <SearchPageContent />
      </Suspense>
    </AppShell>
  );
}
