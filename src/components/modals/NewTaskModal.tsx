'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCreated?: (task: any) => void;
}

export function NewTaskModal({ isOpen, onClose, projectId, onCreated }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [assignee, setAssignee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Task title is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          assignee: assignee.trim() || undefined,
          projectId,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        success('Task created successfully', `"${json.data.title}" is ready.`);
        onClose();
        if (onCreated) onCreated(json.data);
      } else {
        error('Failed to create task', json.error || 'Server error');
      }
    } catch {
      error('Network error', 'Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Task"
      description="Add a new task to your project."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Literature Review"
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the task..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <Input
          label="Assignee (Optional)"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="e.g. John Doe"
        />

        <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
