import prisma from '@/lib/db';
import { logActivity } from './activityService';
import { createInboxItem } from './inboxService';

export interface CreateNoteInput {
  userId: string;
  projectId?: string | null;
  documentId?: string | null;
  title: string;
  content: string;
  isPinned?: boolean;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  projectId?: string | null;
  documentId?: string | null;
  title?: string;
  content?: string;
  isPinned?: boolean;
  tagIds?: string[];
}

export async function getNotes(
  userId: string,
  filters?: {
    projectId?: string;
    documentId?: string;
    tagId?: string;
    search?: string;
  }
) {
  const where: any = { userId };

  if (filters?.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters?.documentId) {
    where.documentId = filters.documentId;
  }

  if (filters?.tagId) {
    where.noteTags = {
      some: { tagId: filters.tagId },
    };
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { content: { contains: filters.search } },
    ];
  }

  return prisma.note.findMany({
    where,
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    include: {
      project: { select: { id: true, title: true, color: true } },
      document: { select: { id: true, title: true } },
      noteTags: { include: { tag: true } },
    },
  });
}

export async function getNoteById(userId: string, noteId: string) {
  return prisma.note.findFirst({
    where: { id: noteId, userId },
    include: {
      project: { select: { id: true, title: true, color: true } },
      document: { select: { id: true, title: true } },
      noteTags: { include: { tag: true } },
    },
  });
}

export async function createNote(input: CreateNoteInput) {
  const { userId, tagIds, ...data } = input;

  const note = await prisma.note.create({
    data: {
      ...data,
      userId,
      ...(tagIds && tagIds.length > 0
        ? {
            noteTags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
    include: {
      project: { select: { id: true, title: true, color: true } },
      document: { select: { id: true, title: true } },
      noteTags: { include: { tag: true } },
    },
  });

  await logActivity({
    userId,
    projectId: note.projectId,
    action: 'NOTE_CREATED',
    entityType: 'NOTE',
    entityId: note.id,
    entityTitle: note.title,
    details: `Authored note: ${note.title}`,
  });

  await createInboxItem({
    userId,
    type: 'NEW_NOTE',
    message: `New note authored: ${note.title}`,
    resourceId: note.id,
    resourceType: 'NOTE',
  });

  return note;
}

export async function updateNote(userId: string, noteId: string, input: UpdateNoteInput) {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId },
  });

  if (!existing) return null;

  const { tagIds, ...data } = input;

  if (tagIds !== undefined) {
    await prisma.noteTag.deleteMany({ where: { noteId } });
    if (tagIds.length > 0) {
      await prisma.noteTag.createMany({
        data: tagIds.map((tagId) => ({ noteId, tagId })),
      });
    }
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data,
    include: {
      project: { select: { id: true, title: true, color: true } },
      document: { select: { id: true, title: true } },
      noteTags: { include: { tag: true } },
    },
  });

  await logActivity({
    userId,
    projectId: updated.projectId,
    action: 'NOTE_UPDATED',
    entityType: 'NOTE',
    entityId: updated.id,
    entityTitle: updated.title,
    details: `Updated note: ${updated.title}`,
  });

  return updated;
}

export async function deleteNote(userId: string, noteId: string) {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId },
  });

  if (!existing) return null;

  await logActivity({
    userId,
    projectId: existing.projectId,
    action: 'NOTE_DELETED',
    entityType: 'NOTE',
    entityId: existing.id,
    entityTitle: existing.title,
    details: `Deleted note: ${existing.title}`,
  });

  return prisma.note.delete({
    where: { id: noteId },
  });
}
