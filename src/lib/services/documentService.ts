import prisma from '@/lib/db';
import { logActivity } from './activityService';

export interface CreateDocumentInput {
  userId: string;
  projectId?: string | null;
  collectionId?: string | null;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  authors?: string;
  journal?: string;
  publicationYear?: number | null;
  doi?: string;
  abstract?: string;
  tagIds?: string[];
}

export interface UpdateDocumentInput {
  title?: string;
  projectId?: string | null;
  collectionId?: string | null;
  authors?: string;
  journal?: string;
  publicationYear?: number | null;
  doi?: string;
  abstract?: string;
  tagIds?: string[];
}

export async function getDocuments(
  userId: string,
  filters?: {
    projectId?: string;
    collectionId?: string;
    tagId?: string;
    search?: string;
    sortBy?: 'title' | 'createdAt' | 'fileSize';
    sortOrder?: 'asc' | 'desc';
  }
) {
  const where: any = { userId };

  if (filters?.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters?.collectionId) {
    where.collectionId = filters.collectionId;
  }

  if (filters?.tagId) {
    where.documentTags = {
      some: { tagId: filters.tagId },
    };
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { authors: { contains: filters.search } },
      { journal: { contains: filters.search } },
      { doi: { contains: filters.search } },
      { abstract: { contains: filters.search } },
    ];
  }

  const orderBy = {
    [filters?.sortBy || 'createdAt']: filters?.sortOrder || 'desc',
  };

  return prisma.document.findMany({
    where,
    orderBy,
    include: {
      project: { select: { id: true, title: true, color: true } },
      collection: { select: { id: true, name: true, color: true } },
      documentTags: { include: { tag: true } },
      _count: { select: { notes: true } },
    },
  });
}

export async function getDocumentById(userId: string, documentId: string) {
  return prisma.document.findFirst({
    where: { id: documentId, userId },
    include: {
      project: { select: { id: true, title: true, color: true } },
      collection: { select: { id: true, name: true, color: true } },
      documentTags: { include: { tag: true } },
      notes: {
        orderBy: { updatedAt: 'desc' },
        include: { noteTags: { include: { tag: true } } },
      },
    },
  });
}

export async function createDocument(input: CreateDocumentInput) {
  const { userId, tagIds, ...data } = input;

  const doc = await prisma.document.create({
    data: {
      ...data,
      userId,
      ...(tagIds && tagIds.length > 0
        ? {
            documentTags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
    include: {
      documentTags: { include: { tag: true } },
      project: true,
      collection: true,
    },
  });

  await logActivity({
    userId,
    projectId: doc.projectId,
    action: 'DOC_UPLOADED',
    entityType: 'DOCUMENT',
    entityId: doc.id,
    entityTitle: doc.title,
    details: `Uploaded document: ${doc.title} (${doc.fileName})`,
  });

  return doc;
}

export async function updateDocument(userId: string, documentId: string, input: UpdateDocumentInput) {
  const existing = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!existing) return null;

  const { tagIds, ...data } = input;

  if (tagIds !== undefined) {
    await prisma.documentTag.deleteMany({ where: { documentId } });
    if (tagIds.length > 0) {
      await prisma.documentTag.createMany({
        data: tagIds.map((tagId) => ({ documentId, tagId })),
      });
    }
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data,
    include: {
      documentTags: { include: { tag: true } },
      project: { select: { id: true, title: true, color: true } },
      collection: { select: { id: true, name: true, color: true } },
    },
  });

  await logActivity({
    userId,
    projectId: updated.projectId,
    action: 'DOC_UPDATED',
    entityType: 'DOCUMENT',
    entityId: updated.id,
    entityTitle: updated.title,
    details: `Updated metadata for document: ${updated.title}`,
  });

  return updated;
}

export async function deleteDocument(userId: string, documentId: string) {
  const existing = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!existing) return null;

  await logActivity({
    userId,
    projectId: existing.projectId,
    action: 'DOC_DELETED',
    entityType: 'DOCUMENT',
    entityId: existing.id,
    entityTitle: existing.title,
    details: `Deleted document: ${existing.title}`,
  });

  return prisma.document.delete({
    where: { id: documentId },
  });
}
