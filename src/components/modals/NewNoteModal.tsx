'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { Pin } from 'lucide-react';

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultDocumentId?: string;
  onCreated?: (note: any) => void;
}

export function NewNoteModal({
  isOpen,
  onClose,
  defaultProjectId,
  defaultDocumentId,
  onCreated,
}: NewNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [documentId, setDocumentId] = useState(defaultDocumentId || '');
  const [isPinned, setIsPinned] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (defaultProjectId) setProjectId(defaultProjectId);
      if (defaultDocumentId) setDocumentId(defaultDocumentId);

      Promise.all([
        fetch('/api/projects?status=ACTIVE').then((r) => r.json()),
        fetch('/api/documents').then((r) => r.json()),
        fetch('/api/tags').then((r) => r.json()),
      ]).then(([projJson, docJson, tagJson]) => {
        if (projJson.success) setProjects(projJson.data);
        if (docJson.success) setDocuments(docJson.data);
        if (tagJson.success) setTags(tagJson.data);
      }).catch(console.error);
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
      setSelectedTagIds([]);
    }
  }, [isOpen, defaultProjectId, defaultDocumentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Note title is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          projectId: projectId || null,
          documentId: documentId || null,
          isPinned,
          tagIds: selectedTagIds,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Note created successfully', `"${json.data.title}" is saved.`);
        onClose();
        if (onCreated) onCreated(json.data);
      } else {
        error('Failed to create note', json.error || 'Server error');
      }
    } catch {
      error('Network error', 'Could not create note');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Research Note"
      description="Record laboratory observations, paper annotations, hypotheses, or synthesis."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Critical Residue Contacts in SpCas9 REC3 Domain"
          required
          autoFocus
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">General (No project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Linked Document</label>
            <select
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No linked paper</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-foreground/80">
              Note Content (Markdown supported)
            </label>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${
                isPinned
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isPinned ? 'Pinned to top' : 'Pin note'}</span>
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write observations, equations, bullet points, citations, or code snippets..."
            className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground font-mono placeholder:font-sans placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Tags</label>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1">
              {tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Note
          </Button>
        </div>
      </form>
    </Modal>
  );
}
