import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { updateNoteSchema } from '@/lib/validations';
import { getNoteById, updateNote, deleteNote } from '@/lib/services/noteService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const note = await getNoteById(user.id, id);

  if (!note) return apiNotFound('Note not found');

  return apiSuccess(note);
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
    const result = updateNoteSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid note update payload', result.error.flatten().fieldErrors);
    }

    const updated = await updateNote(user.id, id, result.data);
    if (!updated) return apiNotFound('Note not found');

    return apiSuccess(updated);
  } catch (error) {
    console.error('Failed to update note:', error);
    return apiBadRequest('Failed to update note');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const deleted = await deleteNote(user.id, id);

  if (!deleted) return apiNotFound('Note not found');

  return apiSuccess({ message: 'Note deleted successfully' });
}
