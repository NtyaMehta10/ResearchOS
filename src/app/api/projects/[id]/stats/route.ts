import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiNotFound, apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { getProjectStats } from '@/lib/services/projectService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const stats = await getProjectStats(user.id, id);

  if (!stats) return apiNotFound('Project not found');

  return apiSuccess(stats);
}
