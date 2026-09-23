import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: string;
}

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
        <div className="flex justify-between items-center">
          <Badge>{task.status}</Badge>
          {task.assignee && <span className="text-xs text-gray-500">Assigned to: {task.assignee}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
