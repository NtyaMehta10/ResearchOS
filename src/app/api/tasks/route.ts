import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { createTaskSchema } from '@/lib/validations';
import { getTasks, createTask } from '@/lib/services/taskService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get('projectId') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    const tasks = await getTasks(user.id, { projectId, status });
    return apiSuccess(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return apiInternalError('Failed to fetch tasks');
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid task data', result.error.flatten().fieldErrors);
    }

    const task = await createTask({
      ...result.data,
      userId: user.id,
      projectId: result.data.projectId || undefined,
      documentId: result.data.documentId || undefined,
      noteId: result.data.noteId || undefined,
    });

    return apiSuccess(task, undefined, 201);
  } catch (error) {
    console.error('Failed to create task:', error);
    return apiInternalError('Failed to create task');
  }
}
