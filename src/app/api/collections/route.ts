import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { collectionSchema, updateCollectionSchema } from '@/lib/validations';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from '@/lib/services/collectionService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;

  const collections = await getCollections(user.id, projectId);
  return apiSuccess(collections);
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = collectionSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid collection data', result.error.flatten().fieldErrors);
    }

    const collection = await createCollection({
      ...result.data,
      userId: user.id,
    });

    return apiSuccess(collection, undefined, 201);
  } catch (error) {
    console.error('Failed to create collection:', error);
    return apiInternalError('Failed to create collection');
  }
}


