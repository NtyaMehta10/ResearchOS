import prisma from '@/lib/db';
import { logActivity } from './activityService';

export interface CreateTagInput {
  userId: string;
  name: string;
  color?: string;
}

export async function getTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          documentTags: true,
          noteTags: true,
          projectTags: true,
        },
      },
    },
  });
}

export async function createTag(input: CreateTagInput) {
  const existing = await prisma.tag.findUnique({
    where: {
      userId_name: {
        userId: input.userId,
        name: input.name.trim(),
      },
    },
  });

  if (existing) {
    return existing;
  }

  const tag = await prisma.tag.create({
    data: {
      userId: input.userId,
      name: input.name.trim(),
      color: input.color || '#6366f1',
    },
    include: {
      _count: {
        select: {
          documentTags: true,
          noteTags: true,
          projectTags: true,
        },
      },
    },
  });

  await logActivity({
    userId: input.userId,
    action: 'TAG_CREATED',
    entityType: 'TAG',
    entityId: tag.id,
    entityTitle: tag.name,
    details: `Created tag: #${tag.name}`,
  });

  return tag;
}

export async function deleteTag(userId: string, tagId: string) {
  const existing = await prisma.tag.findFirst({
    where: { id: tagId, userId },
  });

  if (!existing) return null;

  return prisma.tag.delete({
    where: { id: tagId },
  });
}
