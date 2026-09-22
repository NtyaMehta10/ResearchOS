'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';

interface NewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  onCreated?: (col: any) => void;
}

const COLOR_OPTIONS = [
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
];

export function NewCollectionModal({
  isOpen,
  onClose,
  defaultProjectId,
  onCreated,
}: NewCollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0ea5e9');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (defaultProjectId) setProjectId(defaultProjectId);
      fetch('/api/projects?status=ACTIVE')
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setProjects(json.data);
        })
        .catch(console.error);
    } else {
      setName('');
      setDescription('');
      setColor('#0ea5e9');
    }
  }, [isOpen, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Collection name is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          projectId: projectId || null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Collection created successfully', `"${json.data.name}" is ready.`);
        onClose();
        if (onCreated) onCreated(json.data);
      } else {
        error('Failed to create collection', json.error || 'Server error');
      }
    } catch {
      error('Network error', 'Could not create collection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Document Collection"
      description="Group literature, preprints, and manuscripts into thematic binders."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Collection Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cryo-EM High Resolution Structures"
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional context about the collection contents..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Associated Project (Optional)
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Global (Not project-specific)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">Collection Color</label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Collection
          </Button>
        </div>
      </form>
    </Modal>
  );
}
