import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { tagSchema } from '@/lib/validations';
import { getTags, createTag } from '@/lib/services/tagService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const tags = await getTags(user.id);
  return apiSuccess(tags);
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = tagSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid tag data', result.error.flatten().fieldErrors);
    }

    const tag = await createTag({
      ...result.data,
      userId: user.id,
    });

    return apiSuccess(tag, undefined, 201);
  } catch (error) {
    console.error('Failed to create tag:', error);
    return apiInternalError('Failed to create tag');
  }
}


