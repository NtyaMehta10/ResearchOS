import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { getUserActivities } from '@/lib/services/activityService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const activities = await getUserActivities(user.id, limit, projectId);
  return apiSuccess(activities);
}
