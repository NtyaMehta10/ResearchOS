import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { updateProjectSchema } from '@/lib/validations';
import { getProjectById, updateProject, deleteProject } from '@/lib/services/projectService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const project = await getProjectById(user.id, id);

  if (!project) return apiNotFound('Project not found');

  return apiSuccess(project);
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
    const result = updateProjectSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid project update data', result.error.flatten().fieldErrors);
    }

    const updated = await updateProject(user.id, id, result.data);
    if (!updated) return apiNotFound('Project not found');

    return apiSuccess(updated);
  } catch (error) {
    console.error('Failed to update project:', error);
    return apiInternalError('Failed to update project');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const deleted = await deleteProject(user.id, id);

  if (!deleted) return apiNotFound('Project not found');

  return apiSuccess({ message: 'Project deleted successfully' });
}

