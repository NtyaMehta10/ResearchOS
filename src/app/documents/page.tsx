'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UploadDocumentModal } from '@/components/modals/UploadDocumentModal';
import { useToast } from '@/components/providers/ToastProvider';
import {
  FileText,
  FileUp,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Filter,
  Layers,
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedTagId, setSelectedTagId] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'fileSize'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const fetchFilters = useCallback(async () => {
    try {
      const [pRes, cRes, tRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/collections'),
        fetch('/api/tags'),
      ]);
      if (pRes.ok) {
        const p = await pRes.json();
        if (p.success) setProjects(p.data);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        if (c.success) setCollections(c.data);
      }
      if (tRes.ok) {
        const t = await tRes.json();
        if (t.success) setTags(t.data);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedProjectId) params.set('projectId', selectedProjectId);
      if (selectedCollectionId) params.set('collectionId', selectedCollectionId);
      if (selectedTagId) params.set('tagId', selectedTagId);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setDocuments(json.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedProjectId, selectedCollectionId, selectedTagId, sortBy, sortOrder]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        success('Document deleted', 'File removed from library.');
        setDeleteId(null);
        fetchDocuments();
      } else {
        error('Delete failed', json.error);
      }
    } catch {
      error('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <AppShell
      title="Research Document Library"
      subtitle="Catalog, inspect, tag, and organize literature, preprints, and experimental records"
      onRefreshData={fetchDocuments}
    >
      <div className="space-y-6">
        {/* Actions & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, authors, DOI, journal..."
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <Button
              onClick={() => setIsUploadOpen(true)}
              leftIcon={<FileUp className="w-4 h-4" />}
              className="self-start sm:self-auto"
            >
              Upload Document
            </Button>
          </div>

          {/* Facet Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-card border border-border text-foreground text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Project: {p.title}
                </option>
              ))}
            </select>

            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="bg-card border border-border text-foreground text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Collections</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  Collection: {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="bg-card border border-border text-foreground text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  Tag: #{t.name}
                </option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="bg-card border border-border text-foreground text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ml-auto"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="fileSize-desc">File Size (Large-Small)</option>
            </select>
          </div>
        </div>

        {/* Documents Table / Cards */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="No documents found"
            description={
              search || selectedProjectId || selectedCollectionId || selectedTagId
                ? 'No documents matched your active search or filter criteria.'
                : 'Upload literature publications or research files to get started.'
            }
            actionLabel="Upload First Document"
            onAction={() => setIsUploadOpen(true)}
            actionIcon={<FileUp className="w-4 h-4" />}
          />
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/40 transition-colors group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/documents/${doc.id}`}>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {doc.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {doc.authors ? `${doc.authors} • ` : ''}
                        {doc.journal ? `${doc.journal} (${doc.publicationYear || ''})` : doc.fileName}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {doc.project && (
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: doc.project.color || '#4f46e5' }}
                          >
                            {doc.project.title}
                          </span>
                        )}

                        {doc.collection && (
                          <Badge customColor={doc.collection.color} className="text-[10px]">
                            {doc.collection.name}
                          </Badge>
                        )}

                        {doc.documentTags?.map((dt: any) => (
                          <Badge key={dt.tag.id} customColor={dt.tag.color} className="text-[10px]">
                            #{dt.tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center gap-4 sm:shrink-0 justify-between sm:justify-end text-xs text-muted-foreground pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="text-right hidden md:block">
                      <p className="text-[11px] font-medium text-foreground">
                        {formatFileSize(doc.fileSize)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        download
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <Link
                        href={`/documents/${doc.id}`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                        title="View details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setDeleteId(doc.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={fetchDocuments}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Document"
        message="Are you sure you want to permanently delete this document and file?"
        confirmLabel="Delete Document"
      />
    </AppShell>
  );
}
