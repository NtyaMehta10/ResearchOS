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
    isFavorite?: boolean;
    isArchived?: boolean;
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

  if (filters?.isFavorite !== undefined) {
    where.isFavorite = filters.isFavorite;
  }

  if (filters?.isArchived !== undefined) {
    where.isArchived = filters.isArchived;
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

export async function bulkDeleteDocuments(userId: string, documentIds: string[]) {
  // Validate ownership first
  const docs = await prisma.document.findMany({
    where: { id: { in: documentIds }, userId },
    select: { id: true, title: true, projectId: true },
  });

  if (docs.length === 0) return { count: 0 };

  const validIds = docs.map(d => d.id);

  // Log activity
  for (const doc of docs) {
    await logActivity({
      userId,
      projectId: doc.projectId,
      action: 'DOC_DELETED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      entityTitle: doc.title,
      details: `Bulk deleted document: ${doc.title}`,
    });
  }

  return prisma.document.deleteMany({
    where: { id: { in: validIds } },
  });
}

export async function bulkUpdateDocuments(
  userId: string, 
  documentIds: string[], 
  data: { isArchived?: boolean; isFavorite?: boolean; collectionId?: string | null }
) {
  const docs = await prisma.document.findMany({
    where: { id: { in: documentIds }, userId },
    select: { id: true, title: true, projectId: true },
  });

  if (docs.length === 0) return { count: 0 };

  const validIds = docs.map(d => d.id);

  const updated = await prisma.document.updateMany({
    where: { id: { in: validIds } },
    data,
  });

  for (const doc of docs) {
    await logActivity({
      userId,
      projectId: doc.projectId,
      action: 'DOC_UPDATED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      entityTitle: doc.title,
      details: `Bulk updated document metadata for: ${doc.title}`,
    });
  }

  return updated;
}

export async function createDocumentVersion(
  userId: string,
  documentId: string,
  versionData: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
  }
) {
  const existing = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!existing) return null;

  const newVersionNumber = existing.version + 1;

  // Transaction: Update document and create version
  const [updatedDoc, newVersion] = await prisma.$transaction([
    prisma.document.update({
      where: { id: documentId },
      data: {
        version: newVersionNumber,
        fileName: versionData.fileName,
        fileSize: versionData.fileSize,
        mimeType: versionData.mimeType,
        filePath: versionData.filePath,
      },
    }),
    prisma.documentVersion.create({
      data: {
        documentId,
        version: newVersionNumber,
        fileName: versionData.fileName,
        fileSize: versionData.fileSize,
        mimeType: versionData.mimeType,
        filePath: versionData.filePath,
        uploaderId: userId,
      },
    }),
  ]);

  await logActivity({
    userId,
    projectId: existing.projectId,
    action: 'DOC_UPDATED',
    entityType: 'DOCUMENT',
    entityId: existing.id,
    entityTitle: existing.title,
    details: `Uploaded version ${newVersionNumber} of document`,
  });

  return { document: updatedDoc, version: newVersion };
}

export async function getDocumentVersions(userId: string, documentId: string) {
  const existing = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!existing) return null;

  return prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { version: 'desc' },
  });
}

