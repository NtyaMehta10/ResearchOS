import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { getInboxItems } from '@/lib/services/inboxService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const isReadParam = searchParams.get('isRead');
    const typeParam = searchParams.get('type');

    let isRead: boolean | undefined = undefined;
    if (isReadParam === 'true') isRead = true;
    if (isReadParam === 'false') isRead = false;

    const items = await getInboxItems(user.id, {
      isRead,
      type: typeParam || undefined,
    });

    return apiSuccess(items);
  } catch (error) {
    console.error('Failed to fetch inbox items:', error);
    return apiInternalError('Failed to fetch inbox items');
  }
}
