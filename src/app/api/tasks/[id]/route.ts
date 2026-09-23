import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { updateTaskSchema } from '@/lib/validations';
import { getTaskById, updateTask, deleteTask } from '@/lib/services/taskService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  try {
    const task = await getTaskById(user.id, id);
    if (!task) return apiNotFound('Task not found');
    return apiSuccess(task);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return apiInternalError('Failed to fetch task');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  try {
    const body = await req.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid task data', result.error.flatten().fieldErrors);
    }

    const updated = await updateTask(user.id, id, result.data);
    if (!updated) return apiNotFound('Task not found');

    return apiSuccess(updated);
  } catch (error) {
    console.error('Failed to update task:', error);
    return apiInternalError('Failed to update task');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  try {
    const deleted = await deleteTask(user.id, id);
    if (!deleted) return apiNotFound('Task not found');

    return apiSuccess({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return apiInternalError('Failed to delete task');
  }
}
