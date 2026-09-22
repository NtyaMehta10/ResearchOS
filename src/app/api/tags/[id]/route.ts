import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiNotFound, apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { deleteTag } from '@/lib/services/tagService';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const deleted = await deleteTag(user.id, id);

  if (!deleted) return apiNotFound('Tag not found');

  return apiSuccess({ message: 'Tag deleted successfully' });
}
