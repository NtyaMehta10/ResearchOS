'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NewCollectionModal } from '@/components/modals/NewCollectionModal';
import { useToast } from '@/components/providers/ToastProvider';
import {
  FolderGit2,
  Tag as TagIcon,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
} from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Collection
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  // Edit Collection
  const [editingCol, setEditingCol] = useState<any>(null);
  const [editColName, setEditColName] = useState('');
  const [editColDesc, setEditColDesc] = useState('');
  const [editColColor, setEditColColor] = useState('');
  // Delete Collection
  const [deleteColId, setDeleteColId] = useState<string | null>(null);

  // New Tag
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, tRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/tags'),
      ]);

      if (cRes.ok) {
        const c = await cRes.json();
        if (c.success) setCollections(c.data);
      }
      if (tRes.ok) {
        const t = await tRes.json();
        if (t.success) setTags(t.data);
      }
    } catch (err) {
      console.error('Failed to load collections/tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Edit Collection
  const openEditCollection = (col: any) => {
    setEditingCol(col);
    setEditColName(col.name);
    setEditColDesc(col.description || '');
    setEditColColor(col.color || '#0ea5e9');
  };

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !editColName.trim()) return;

    try {
      const res = await fetch(`/api/collections/${editingCol.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editColName.trim(),
          description: editColDesc.trim() || undefined,
          color: editColColor,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Collection updated');
        setEditingCol(null);
        fetchData();
      } else {
        error('Failed to update', json.error);
      }
    } catch {
      error('Network error');
    }
  };

  const confirmDeleteCollection = async () => {
    if (!deleteColId) return;
    try {
      const res = await fetch(`/api/collections/${deleteColId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Collection deleted');
        setDeleteColId(null);
        fetchData();
      } else {
        error('Failed to delete', json.error);
      }
    } catch {
      error('Network error');
    }
  };

  // Create Tag
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Tag created', `#${json.data.name}`);
        setNewTagName('');
        setIsNewTagOpen(false);
        fetchData();
      } else {
        error('Failed to create tag', json.error);
      }
    } catch {
      error('Network error');
    }
  };

  const confirmDeleteTag = async () => {
    if (!deleteTagId) return;
    try {
      const res = await fetch(`/api/tags/${deleteTagId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Tag deleted');
        setDeleteTagId(null);
        fetchData();
      } else {
        error('Failed to delete', json.error);
      }
    } catch {
      error('Network error');
    }
  };

  return (
    <AppShell
      title="Collections & Taxonomy"
      subtitle="Organize research publications into binders and define taxonomy tags"
      onRefreshData={fetchData}
    >
      <div className="space-y-10">
        {/* Collections Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Literature Collections</h2>
              <p className="text-xs text-muted-foreground">
                Grouped folders for organizing related manuscripts and reading lists
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsColModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Collection
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : collections.length === 0 ? (
            <EmptyState
              icon={<FolderGit2 className="w-6 h-6" />}
              title="No collections yet"
              description="Group papers, preprints, and experimental records into custom binders."
              actionLabel="Create First Collection"
              onAction={() => setIsColModalOpen(true)}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {collections.map((col) => (
                <Card
                  key={col.id}
                  className="p-5 hover:border-sky-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: col.color || '#0ea5e9' }}
                      >
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditCollection(col)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                          title="Edit collection"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteColId(col.id)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-foreground mt-4 line-clamp-1">
                      {col.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {col.description || 'No description provided.'}
                    </p>

                    {col.project && (
                      <div className="mt-3">
                        <Link href={`/projects/${col.project.id}`}>
                          <Badge variant="outline" className="text-[10px]">
                            Project: {col.project.title}
                          </Badge>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{col._count?.documents || 0} papers assigned</span>
                    <Link
                      href={`/documents?collectionId=${col.id}`}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      View documents
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tags Taxonomy Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Taxonomy & Tags</h2>
              <p className="text-xs text-muted-foreground">
                Cross-cutting classification tags applied across documents, notes, and projects
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsNewTagOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Tag
            </Button>
          </div>

          <div className="flex flex-wrap gap-2.5 p-6 rounded-2xl border border-border bg-card">
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No tags created yet.</p>
            ) : (
              tags.map((t) => (
                <div
                  key={t.id}
                  className="inline-flex items-center gap-2 pl-3 pr-2 py-1 rounded-full border text-xs font-semibold bg-secondary/50 group"
                  style={{ borderColor: `${t.color}40`, color: t.color }}
                >
                  <span>#{t.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/80 text-muted-foreground">
                    {(t._count?.documentTags || 0) + (t._count?.noteTags || 0)}
                  </span>
                  <button
                    onClick={() => setDeleteTagId(t.id)}
                    className="p-0.5 rounded-full hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Delete tag"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Collection Modal */}
      <Modal
        isOpen={!!editingCol}
        onClose={() => setEditingCol(null)}
        title="Edit Collection"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateCollection} className="space-y-4">
          <Input
            label="Collection Name"
            value={editColName}
            onChange={(e) => setEditColName(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Description</label>
            <textarea
              value={editColDesc}
              onChange={(e) => setEditColDesc(e.target.value)}
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditingCol(null)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Tag Modal */}
      <Modal
        isOpen={isNewTagOpen}
        onClose={() => setIsNewTagOpen(false)}
        title="Create New Taxonomy Tag"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateTag} className="space-y-4">
          <Input
            label="Tag Name (without #)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="e.g. In-Vivo, Cryo-EM, High-Yield"
            required
            autoFocus
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Tag Color</label>
            <div className="flex items-center gap-2">
              {['#6366f1', '#10b981', '#06b6d4', '#ec4899', '#f59e0b', '#ef4444'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewTagColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newTagColor === c ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsNewTagOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Tag
            </Button>
          </div>
        </form>
      </Modal>

      <NewCollectionModal
        isOpen={isColModalOpen}
        onClose={() => setIsColModalOpen(false)}
        onCreated={fetchData}
      />

      <ConfirmDialog
        isOpen={!!deleteColId}
        onClose={() => setDeleteColId(null)}
        onConfirm={confirmDeleteCollection}
        title="Delete Collection"
        message="Are you sure you want to delete this collection? Documents inside will remain in your library."
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deleteTagId}
        onClose={() => setDeleteTagId(null)}
        onConfirm={confirmDeleteTag}
        title="Delete Taxonomy Tag"
        message="Are you sure you want to delete this tag? It will be removed from all documents and notes."
        confirmLabel="Delete Tag"
      />
    </AppShell>
  );
}
