import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiInternalError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { markAsRead, markAsUnread, dismissInboxItem } from '@/lib/services/inboxService';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const { id } = await context.params;
    const body = await req.json();

    let result;
    if (body.isRead === true) {
      result = await markAsRead(user.id, id);
    } else if (body.isRead === false) {
      result = await markAsUnread(user.id, id);
    } else {
      return apiBadRequest('Invalid payload');
    }

    if (!result) {
      return apiNotFound('Not Found or Unauthorized');
    }

    return apiSuccess(result);
  } catch (error) {
    console.error('Failed to update inbox item:', error);
    return apiInternalError('Failed to update inbox item');
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const { id } = await context.params;

    const result = await dismissInboxItem(user.id, id);

    if (!result) {
      return apiNotFound('Not Found or Unauthorized');
    }

    return apiSuccess(result);
  } catch (error) {
    console.error('Failed to dismiss inbox item:', error);
    return apiInternalError('Failed to dismiss inbox item');
  }
}
