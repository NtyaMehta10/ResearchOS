import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { updateCollectionSchema } from '@/lib/validations';
import { updateCollection, deleteCollection } from '@/lib/services/collectionService';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  try {
    const body = await req.json();
    const result = updateCollectionSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid collection update payload', result.error.flatten().fieldErrors);
    }

    const updated = await updateCollection(user.id, id, result.data);
    if (!updated) return apiNotFound('Collection not found');

    return apiSuccess(updated);
  } catch (error) {
    console.error('Failed to update collection:', error);
    return apiBadRequest('Failed to update collection');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const deleted = await deleteCollection(user.id, id);

  if (!deleted) return apiNotFound('Collection not found');

  return apiSuccess({ message: 'Collection deleted successfully' });
}
