'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  FolderKanban,
  FileUp,
  StickyNote,
  FolderGit2,
  Bell,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenSearch: () => void;
  onNewProject?: () => void;
  onUploadDoc?: () => void;
  onNewNote?: () => void;
  onNewCollection?: () => void;
  onToggleMobileMenu?: () => void;
}

export function AppHeader({
  title,
  subtitle,
  onOpenSearch,
  onNewProject,
  onUploadDoc,
  onNewNote,
  onNewCollection,
  onToggleMobileMenu,
}: AppHeaderProps) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={false}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {title && (
          <div>
            <h1 className="text-sm md:text-base font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Center Search Trigger */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={onOpenSearch}
          aria-label="Search research papers, notes, tags"
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-border bg-background/60 hover:bg-secondary/70 text-xs text-muted-foreground transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 group-hover:text-foreground" />
            <span>Search research papers, notes, tags...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-border bg-muted text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary sm:hidden"
          title="Search"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <Link
          href="/activity"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Activity history"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
          >
            Create
          </Button>

          {createMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setCreateMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {onNewProject && (
                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      onNewProject();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                  >
                    <FolderKanban className="w-4 h-4 text-indigo-500" />
                    <span>New Project</span>
                  </button>
                )}

                {onUploadDoc && (
                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      onUploadDoc();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                  >
                    <FileUp className="w-4 h-4 text-emerald-500" />
                    <span>Upload Document</span>
                  </button>
                )}

                {onNewNote && (
                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      onNewNote();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                  >
                    <StickyNote className="w-4 h-4 text-amber-500" />
                    <span>New Note</span>
                  </button>
                )}

                {onNewCollection && (
                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      onNewCollection();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                  >
                    <FolderGit2 className="w-4 h-4 text-sky-500" />
                    <span>New Collection</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
