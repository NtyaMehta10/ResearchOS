import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { markAllAsRead } from '@/lib/services/inboxService';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const result = await markAllAsRead(user.id);
    return apiSuccess(result);
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return apiInternalError('Failed to mark all as read');
  }
}
