import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { searchAll } from '@/lib/services/searchService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') as any) || 'all';
  const projectId = searchParams.get('projectId') || undefined;
  const tagId = searchParams.get('tagId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '25', 10);

  const results = await searchAll({
    userId: user.id,
    query,
    type,
    projectId,
    tagId,
    limit,
  });

  return apiSuccess(results);
}
