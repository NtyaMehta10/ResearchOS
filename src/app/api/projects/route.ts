import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { projectSchema } from '@/lib/validations';
import { getProjects, createProject } from '@/lib/services/projectService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const projects = await getProjects(user.id, { status, search });
  return apiSuccess(projects);
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid project data', result.error.flatten().fieldErrors);
    }

    const project = await createProject({
      ...result.data,
      userId: user.id,
    });

    return apiSuccess(project, undefined, 201);
  } catch (error) {
    console.error('Failed to create project:', error);
    return apiInternalError('Failed to create project');
  }
}


