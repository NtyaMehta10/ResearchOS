import prisma from '@/lib/db';
import { logActivity } from './activityService';

export interface CreateTaskInput {
  userId: string;
  projectId?: string | null;
  documentId?: string | null;
  noteId?: string | null;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  dueDate?: string | null;
}

export async function getTasks(userId: string, filters?: { projectId?: string; status?: string }) {
  const where: any = { userId };
  if (filters?.projectId) where.projectId = filters.projectId;
  if (filters?.status) where.status = filters.status;

  return prisma.task.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ],
  });
}

export async function getTaskById(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, userId },
  });
}

export async function createTask(input: CreateTaskInput) {
  const { userId, dueDate, ...data } = input;
  
  const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

  const createData: any = { ...data, userId };
  if (parsedDueDate) createData.dueDate = parsedDueDate;
  // Remove nulls which prisma dislikes for required fields
  if (createData.status === null) delete createData.status;
  if (createData.priority === null) delete createData.priority;
  if (createData.description === null) delete createData.description;

  const task = await prisma.task.create({
    data: createData,
  });

  await logActivity({
    userId,
    projectId: task.projectId,
    action: 'TASK_CREATED',
    entityType: 'TASK',
    entityId: task.id,
    entityTitle: task.title,
    details: `Created task: ${task.title}`,
  });

  return task;
}

export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) return null;

  const parsedDueDate = input.dueDate ? new Date(input.dueDate) : undefined;

  const updateData: any = { ...input };
  if (input.dueDate !== undefined) updateData.dueDate = parsedDueDate;
  
  // Remove nulls for fields that shouldn't be null
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === null && ['title', 'status', 'priority'].includes(key)) {
      delete updateData[key];
    }
  });

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  const isCompleted = updated.status === 'COMPLETED' && existing.status !== 'COMPLETED';

  await logActivity({
    userId,
    projectId: updated.projectId,
    action: isCompleted ? 'TASK_COMPLETED' : 'TASK_UPDATED',
    entityType: 'TASK',
    entityId: updated.id,
    entityTitle: updated.title,
    details: isCompleted ? 'Completed task' : 'Updated task details',
  });

  return updated;
}

export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) return null;

  await logActivity({
    userId,
    projectId: existing.projectId,
    action: 'TASK_DELETED',
    entityType: 'TASK',
    entityId: existing.id,
    entityTitle: existing.title,
    details: `Deleted task: ${existing.title}`,
  });

  return prisma.task.delete({
    where: { id: taskId },
  });
}
