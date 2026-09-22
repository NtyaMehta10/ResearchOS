'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { UploadCloud, File, X } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultCollectionId?: string;
  onUploaded?: (doc: any) => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  defaultProjectId,
  defaultCollectionId,
  onUploaded,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [collectionId, setCollectionId] = useState(defaultCollectionId || '');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [doi, setDoi] = useState('');
  const [abstract, setAbstract] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (defaultProjectId) setProjectId(defaultProjectId);
      if (defaultCollectionId) setCollectionId(defaultCollectionId);

      // Fetch projects, collections, tags
      Promise.all([
        fetch('/api/projects?status=ACTIVE').then((r) => r.json()),
        fetch('/api/collections').then((r) => r.json()),
        fetch('/api/tags').then((r) => r.json()),
      ]).then(([projJson, colJson, tagJson]) => {
        if (projJson.success) setProjects(projJson.data);
        if (colJson.success) setCollections(colJson.data);
        if (tagJson.success) setTags(tagJson.data);
      }).catch(console.error);
    } else {
      setFile(null);
      setTitle('');
      setAuthors('');
      setJournal('');
      setPublicationYear('');
      setDoi('');
      setAbstract('');
      setSelectedTagIds([]);
    }
  }, [isOpen, defaultProjectId, defaultCollectionId]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      error('Please select a file to upload');
      return;
    }
    if (!title.trim()) {
      error('Document title is required');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      if (projectId) formData.append('projectId', projectId);
      if (collectionId) formData.append('collectionId', collectionId);
      if (authors.trim()) formData.append('authors', authors.trim());
      if (journal.trim()) formData.append('journal', journal.trim());
      if (publicationYear) formData.append('publicationYear', publicationYear);
      if (doi.trim()) formData.append('doi', doi.trim());
      if (abstract.trim()) formData.append('abstract', abstract.trim());
      formData.append('tagIds', JSON.stringify(selectedTagIds));

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Document uploaded successfully', `"${json.data.title}" is saved.`);
        onClose();
        if (onUploaded) onUploaded(json.data);
      } else {
        error('Upload failed', json.error || 'Server error');
      }
    } catch {
      error('Network error', 'Could not upload document');
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
      title="Upload Research Document"
      description="Add research publications, preprints, experimental datasets, or manuscripts."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-500/5'
                : 'border-border hover:border-indigo-500/50 bg-secondary/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Click to select or drag and drop a file
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, DOCX, TXT, Markdown, CSV, EPUB (up to 50MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <File className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <Input
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. A Programmable Dual-RNA-Guided DNA Endonuclease"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No Project (General Library)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Collection</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No Collection</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bibliographic Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Authors"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="e.g. Jinek M, Doudna J, et al."
          />
          <Input
            label="Journal / Venue"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="e.g. Science, Nature"
          />
          <Input
            label="Year"
            type="number"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            placeholder="e.g. 2024"
          />
        </div>

        <Input
          label="DOI"
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
          placeholder="e.g. 10.1126/science.1225829"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">Abstract</label>
          <textarea
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            rows={3}
            placeholder="Paste paper abstract or synopsis..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">Tags</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
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
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
