import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { documentUpdateSchema } from '@/lib/validations';
import { getDocumentById, updateDocument, deleteDocument } from '@/lib/services/documentService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const doc = await getDocumentById(user.id, id);

  if (!doc) return apiNotFound('Document not found');

  return apiSuccess(doc);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  try {
    const body = await req.json();
    const result = documentUpdateSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid update payload', result.error.flatten().fieldErrors);
    }

    const updated = await updateDocument(user.id, id, result.data);
    if (!updated) return apiNotFound('Document not found');

    return apiSuccess(updated);
  } catch (error) {
    console.error('Failed to update document:', error);
    return apiInternalError('Failed to update document');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const deleted = await deleteDocument(user.id, id);

  if (!deleted) return apiNotFound('Document not found');

  return apiSuccess({ message: 'Document deleted successfully' });
}


