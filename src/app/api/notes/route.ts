import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { noteSchema } from '@/lib/validations';
import { getNotes, createNote } from '@/lib/services/noteService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const documentId = searchParams.get('documentId') || undefined;
  const tagId = searchParams.get('tagId') || undefined;
  const search = searchParams.get('search') || undefined;

  const notes = await getNotes(user.id, {
    projectId,
    documentId,
    tagId,
    search,
  });

  return apiSuccess(notes);
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = noteSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid note data', result.error.flatten().fieldErrors);
    }

    const note = await createNote({
      ...result.data,
      userId: user.id,
    });

    return apiSuccess(note, undefined, 201);
  } catch (error) {
    console.error('Failed to create note:', error);
    return apiBadRequest('Failed to create note');
  }
}
