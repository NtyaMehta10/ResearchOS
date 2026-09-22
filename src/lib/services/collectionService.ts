import prisma from '@/lib/db';
import { logActivity } from './activityService';

export interface CreateCollectionInput {
  userId: string;
  name: string;
  description?: string;
  color?: string;
  projectId?: string | null;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  color?: string;
  projectId?: string | null;
}

export async function getCollections(userId: string, projectId?: string) {
  return prisma.collection.findMany({
    where: {
      userId,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      project: { select: { id: true, title: true, color: true } },
      _count: { select: { documents: true } },
    },
  });
}

export async function createCollection(input: CreateCollectionInput) {
  const collection = await prisma.collection.create({
    data: input,
    include: {
      project: { select: { id: true, title: true, color: true } },
      _count: { select: { documents: true } },
    },
  });

  await logActivity({
    userId: input.userId,
    projectId: collection.projectId,
    action: 'COLLECTION_CREATED',
    entityType: 'COLLECTION',
    entityId: collection.id,
    entityTitle: collection.name,
    details: `Created collection: ${collection.name}`,
  });

  return collection;
}

export async function updateCollection(userId: string, id: string, input: UpdateCollectionInput) {
  const existing = await prisma.collection.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  const updated = await prisma.collection.update({
    where: { id },
    data: input,
    include: {
      project: { select: { id: true, title: true, color: true } },
      _count: { select: { documents: true } },
    },
  });

  await logActivity({
    userId,
    projectId: updated.projectId,
    action: 'COLLECTION_UPDATED',
    entityType: 'COLLECTION',
    entityId: updated.id,
    entityTitle: updated.name,
    details: `Updated collection: ${updated.name}`,
  });

  return updated;
}

export async function deleteCollection(userId: string, id: string) {
  const existing = await prisma.collection.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  await logActivity({
    userId,
    projectId: existing.projectId,
    action: 'COLLECTION_DELETED',
    entityType: 'COLLECTION',
    entityId: existing.id,
    entityTitle: existing.name,
    details: `Deleted collection: ${existing.name}`,
  });

  return prisma.collection.delete({
    where: { id },
  });
}
