'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderKanban,
  FileText,
  StickyNote,
  FolderGit2,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
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

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or hook
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ projects: [], documents: [], notes: [], collections: [], totalCount: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], documents: [], notes: [], collections: [], totalCount: 0 });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
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
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-secondary/20">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search projects, papers, notes..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin mr-2" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-muted text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground/80">Search everything in ResearchOS</p>
              <p>Type keywords, DOIs, authors, or note content to jump directly to work.</p>
            </div>
          )}

          {query && !loading && results.totalCount === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for &ldquo;<span className="font-semibold text-foreground">{query}</span>&rdquo;
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                Projects
              </p>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/projects/${p.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-secondary/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: p.color || '#4f46e5' }}
                      >
                        <FolderKanban className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {p.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                Documents & Literature
              </p>
              <div className="space-y-1">
                {results.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => navigateTo(`/documents/${doc.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-secondary/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {doc.authors || doc.journal || doc.fileName}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                Research Notes
              </p>
              <div className="space-y-1">
                {results.notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => navigateTo(`/notes?id=${note.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-secondary/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <StickyNote className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {note.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {note.project ? note.project.title : 'General note'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {results.totalCount > 0 && (
          <div className="p-3 border-t border-border bg-secondary/30 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Showing top matches</span>
            <button
              onClick={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View all results in search page →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
