import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { getUnreadCount } from '@/lib/services/inboxService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const count = await getUnreadCount(user.id);
    return apiSuccess({ count });
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return apiInternalError('Failed to get unread count');
  }
}
