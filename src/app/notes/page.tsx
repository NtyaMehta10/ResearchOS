'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NewNoteModal } from '@/components/modals/NewNoteModal';
import { useToast } from '@/components/providers/ToastProvider';
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  Trash2,
  Save,
  FileText,
  FolderKanban,
  Check,
} from 'lucide-react';

function NotesContent() {
  const searchParams = useSearchParams();
  const initialNoteId = searchParams.get('id');

  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState<any[]>([]);

  // Active note editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedProjectId) params.set('projectId', selectedProjectId);

      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotes(json.data);
          // If no note selected or initialNoteId given
          if (initialNoteId) {
            const found = json.data.find((n: any) => n.id === initialNoteId);
            if (found) selectNote(found);
            else if (json.data.length > 0) selectNote(json.data[0]);
          } else if (!selectedNote && json.data.length > 0) {
            selectNote(json.data[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedProjectId, initialNoteId]);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProjects(json.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  const selectNote = (note: any) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsPinned(note.isPinned);
    setProjectId(note.projectId || '');
    setIsSaved(false);
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    if (!title.trim()) {
      error('Note title cannot be blank');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content,
          isPinned,
          projectId: projectId || null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsSaved(true);
        setSelectedNote(json.data);
        setTimeout(() => setIsSaved(false), 2500);
        // Update item in notes list
        setNotes((prev) => prev.map((n) => (n.id === json.data.id ? json.data : n)));
      } else {
        error('Save failed', json.error);
      }
    } catch {
      error('Network error saving note');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Note deleted');
        setDeleteId(null);
        if (selectedNote?.id === deleteId) {
          setSelectedNote(null);
        }
        fetchNotes();
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
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-5">
      {/* Left Column: Notes List */}
      <div className="w-full md:w-80 flex flex-col border border-border rounded-2xl bg-card overflow-hidden shrink-0 shadow-sm">
        {/* Controls */}
        <div className="p-3 border-b border-border space-y-2.5 bg-secondary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Notes ({notes.length})
            </span>
            <Button
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="h-7 text-xs px-2.5"
            >
              New
            </Button>
          </div>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="h-8 text-xs"
          />

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {loading ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : notes.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No notes found.
            </div>
          ) : (
            notes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`p-3 cursor-pointer transition-colors text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                      : 'hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground'
                      }`}
                    >
                      {note.title}
                    </h4>
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug font-mono">
                    {note.content || 'Empty note'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                    <span className="truncate max-w-[130px]">
                      {note.project ? note.project.title : 'General'}
                    </span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Note Editor */}
      <div className="flex-1 border border-border rounded-2xl bg-card shadow-sm flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="p-4 border-b border-border bg-secondary/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    isPinned
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{isPinned ? 'Pinned' : 'Pin'}</span>
                </button>

                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value="">No Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>

                {selectedNote.document && (
                  <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                    <FileText className="w-3 h-3 mr-1" />
                    {selectedNote.document.title}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save
                </Button>
                <button
                  onClick={() => setDeleteId(selectedNote.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Editor Body */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title..."
                className="text-xl md:text-2xl font-extrabold bg-transparent border-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write research takeaways, lab observations, code, or equations..."
                className="flex-1 w-full bg-transparent border-none text-sm text-foreground/90 font-mono leading-relaxed placeholder:font-sans placeholder:text-muted-foreground/50 focus:outline-none resize-none min-h-[300px]"
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon={<StickyNote className="w-8 h-8" />}
            title="Select or create a note"
            description="Choose a note from the left sidebar or create a new observation."
            actionLabel="Create Note"
            onAction={() => setIsNewModalOpen(true)}
            actionIcon={<Plus className="w-4 h-4" />}
          />
        )}
      </div>

      <NewNoteModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={(newNote) => {
          fetchNotes();
          selectNote(newNote);
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Research Note"
        message="Are you sure you want to permanently delete this note?"
        confirmLabel="Delete Note"
      />
    </div>
  );
}

export default function NotesPage() {
  return (
    <AppShell
      title="Research Notes & Synthesis"
      subtitle="Full markdown editor for hypotheses, paper summaries, and experimental notes"
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <NotesContent />
      </Suspense>
    </AppShell>
  );
}
