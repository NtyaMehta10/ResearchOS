'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NewNoteModal } from '@/components/modals/NewNoteModal';
import { useToast } from '@/components/providers/ToastProvider';
import {
  FileText,
  Download,
  Trash2,
  Edit,
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  Sparkles,
  Plus,
  StickyNote,
} from 'lucide-react';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editAuthors, setEditAuthors] = useState('');
  const [editJournal, setEditJournal] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDoi, setEditDoi] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [editProjectId, setEditProjectId] = useState('');
  const [editCollectionId, setEditCollectionId] = useState('');

  const router = useRouter();
  const { success, error } = useToast();

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${documentId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDoc(json.data);
          setEditTitle(json.data.title || '');
          setEditAuthors(json.data.authors || '');
          setEditJournal(json.data.journal || '');
          setEditYear(json.data.publicationYear ? String(json.data.publicationYear) : '');
          setEditDoi(json.data.doi || '');
          setEditAbstract(json.data.abstract || '');
          setEditProjectId(json.data.projectId || '');
          setEditCollectionId(json.data.collectionId || '');
        }
      } else {
        router.push('/documents');
      }
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setLoading(false);
    }
  }, [documentId, router]);

  useEffect(() => {
    fetchDocument();
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/collections').then((r) => r.json()),
    ]).then(([p, c]) => {
      if (p.success) setProjects(p.data);
      if (c.success) setCollections(c.data);
    }).catch(console.error);
  }, [fetchDocument]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          authors: editAuthors.trim() || undefined,
          journal: editJournal.trim() || undefined,
          publicationYear: editYear ? parseInt(editYear, 10) : null,
          doi: editDoi.trim() || undefined,
          abstract: editAbstract.trim() || undefined,
          projectId: editProjectId || null,
          collectionId: editCollectionId || null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Document updated', 'Metadata saved successfully.');
        setIsEditOpen(false);
        fetchDocument();
      } else {
        error('Update failed', json.error);
      }
    } catch {
      error('Network error');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Document deleted', 'File removed from research library.');
        router.push('/documents');
      } else {
        error('Delete failed', json.error);
      }
    } catch {
      error('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !doc) {
    return (
      <AppShell title="Loading Document...">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!doc) return null;

  return (
    <AppShell
      title={doc.title}
      subtitle="Document Metadata & Synthesis"
      onRefreshData={fetchDocument}
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/documents">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Documents
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit Metadata
            </Button>
            <a href={`/api/documents/${doc.id}/download`} download>
              <Button size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download File
              </Button>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Main Paper Metadata Card */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {doc.project && (
                <Link href={`/projects/${doc.project.id}`}>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-md text-white hover:opacity-90"
                    style={{ backgroundColor: doc.project.color || '#4f46e5' }}
                  >
                    Project: {doc.project.title}
                  </span>
                </Link>
              )}
              {doc.collection && (
                <Badge customColor={doc.collection.color} className="text-xs">
                  Collection: {doc.collection.name}
                </Badge>
              )}
              {doc.documentTags?.map((dt: any) => (
                <Badge key={dt.tag.id} customColor={dt.tag.color} className="text-xs">
                  #{dt.tag.name}
                </Badge>
              ))}
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
              {doc.title}
            </h1>

            {doc.authors && (
              <p className="text-sm font-medium text-foreground/80">
                {doc.authors}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {doc.journal && (
                <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  {doc.journal}
                </span>
              )}
              {doc.publicationYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {doc.publicationYear}
                </span>
              )}
              {doc.doi && (
                <span className="font-mono text-foreground/80">
                  DOI: {doc.doi}
                </span>
              )}
              <span>
                File: {doc.fileName} ({(doc.fileSize / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          </div>

          {/* Abstract */}
          {doc.abstract && (
            <div className="pt-4 border-t border-border space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Abstract / Synopsis
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed bg-secondary/30 p-4 rounded-xl border border-border">
                {doc.abstract}
              </p>
            </div>
          )}

          {/* Phase 2 Extension Hook Preview */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Phase 2 AI Synthesis Hook
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Document embedding status: <code>{doc.embeddingStatus}</code>. In Phase 2, automated extraction of key conclusions, methodology parameters, and citation verification will populate this panel.
            </p>
          </div>
        </Card>

        {/* Associated Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Linked Research Notes</h3>
              <p className="text-xs text-muted-foreground">
                Syntheses and laboratory observations linked to this paper
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsNoteOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Note
            </Button>
          </div>

          {doc.notes?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No notes linked to this document yet. Click &ldquo;Add Note&rdquo; to record your insights.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doc.notes.map((note: any) => (
                <Link key={note.id} href={`/notes?id=${note.id}`}>
                  <Card className="p-5 h-full hover:border-amber-500/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
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
          )}
        </div>
      </div>

      {/* Edit Metadata Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Document Metadata"
        maxWidth="xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Document Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground/80">Project</label>
              <select
                value={editProjectId}
                onChange={(e) => setEditProjectId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground/80">Collection</label>
              <select
                value={editCollectionId}
                onChange={(e) => setEditCollectionId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Authors"
              value={editAuthors}
              onChange={(e) => setEditAuthors(e.target.value)}
            />
            <Input
              label="Journal"
              value={editJournal}
              onChange={(e) => setEditJournal(e.target.value)}
            />
            <Input
              label="Year"
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
            />
          </div>

          <Input
            label="DOI"
            value={editDoi}
            onChange={(e) => setEditDoi(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Abstract</label>
            <textarea
              value={editAbstract}
              onChange={(e) => setEditAbstract(e.target.value)}
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <NewNoteModal
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        defaultProjectId={doc.projectId}
        defaultDocumentId={doc.id}
        onCreated={fetchDocument}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Document"
        message="Are you sure you want to delete this document permanently?"
        confirmLabel="Delete Document"
      />
    </AppShell>
  );
}
