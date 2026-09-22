import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { getUserAnalytics } from '@/lib/services/analyticsService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const stats = await getUserAnalytics(user.id);
  return apiSuccess(stats);
}
