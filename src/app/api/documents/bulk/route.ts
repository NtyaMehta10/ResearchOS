import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { bulkUpdateDocuments, bulkDeleteDocuments } from '@/lib/services/documentService';
import { z } from 'zod';

const bulkUpdateSchema = z.object({
  documentIds: z.array(z.string()).min(1),
  isArchived: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  collectionId: z.string().nullable().optional(),
});

const bulkDeleteSchema = z.object({
  documentIds: z.array(z.string()).min(1),
});

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = bulkUpdateSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid bulk update data', result.error.flatten().fieldErrors);
    }

    const { documentIds, ...data } = result.data;
    
    if (Object.keys(data).length === 0) {
      return apiBadRequest('No update fields provided');
    }

    const res = await bulkUpdateDocuments(user.id, documentIds, data);
    return apiSuccess({ count: res.count });
  } catch (error) {
    console.error('Failed to bulk update documents:', error);
    return apiInternalError('Failed to bulk update documents');
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = bulkDeleteSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid bulk delete data', result.error.flatten().fieldErrors);
    }

    const res = await bulkDeleteDocuments(user.id, result.data.documentIds);
    return apiSuccess({ count: res.count });
  } catch (error) {
    console.error('Failed to bulk delete documents:', error);
    return apiInternalError('Failed to bulk delete documents');
  }
}
