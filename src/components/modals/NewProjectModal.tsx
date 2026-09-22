'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: any) => void;
}

const COLOR_OPTIONS = [
  '#4f46e5', // Indigo
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#3b82f6', // Blue
];

export function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetch('/api/tags')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setAvailableTags(json.data);
        })
        .catch(console.error);
    } else {
      setTitle('');
      setDescription('');
      setColor('#4f46e5');
      setVisibility('PRIVATE');
      setSelectedTagIds([]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Project title is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          color,
          visibility,
          tagIds: selectedTagIds,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Project created successfully', `"${json.data.title}" is ready.`);
        onClose();
        if (onCreated) onCreated(json.data);
      } else {
        error('Failed to create project', json.error || 'Server error');
      }
    } catch {
      error('Network error', 'Could not connect to server');
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
      title="Create Research Project"
      description="Initialize a structured workspace for literature, notes, experiments, and protocols."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. CRISPR Off-Target Cleavage Specificity Review"
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Description & Hypotheses
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Summarize aims, scope, methodology, or key questions..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Color Palette */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Theme Color
          </label>
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

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Visibility Setting
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PRIVATE">Private (Only you)</option>
            <option value="SHARED">Shared (Lab collaborators)</option>
            <option value="PUBLIC">Public (Published repository)</option>
          </select>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">
              Assign Tags
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
              {availableTags.map((tag) => {
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
