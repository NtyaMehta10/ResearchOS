import prisma from '@/lib/db';
import { logActivity } from './activityService';

export interface CreateInboxItemInput {
  userId: string;
  type: string;
  message: string;
  resourceId: string;
  resourceType: string;
}

export async function createInboxItem(input: CreateInboxItemInput) {
  // Prevent duplicate events for the same underlying action
  // For most events, we only want one inbox item per resource + type
  const existing = await prisma.inboxItem.findFirst({
    where: {
      userId: input.userId,
      type: input.type,
      resourceId: input.resourceId,
    },
  });

  if (existing) {
    return existing; // Return existing instead of throwing an error to silently skip duplicates
  }

  return prisma.inboxItem.create({
    data: input,
  });
}

export async function getInboxItems(
  userId: string,
  filters?: {
    isRead?: boolean;
    type?: string;
  }
) {
  const where: any = { userId };

  if (filters?.isRead !== undefined) {
    where.isRead = filters.isRead;
  }

  if (filters?.type) {
    where.type = filters.type;
  }

  return prisma.inboxItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.inboxItem.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markAsRead(userId: string, id: string) {
  // Verify ownership
  const existing = await prisma.inboxItem.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  return prisma.inboxItem.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAsUnread(userId: string, id: string) {
  // Verify ownership
  const existing = await prisma.inboxItem.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  return prisma.inboxItem.update({
    where: { id },
    data: { isRead: false },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.inboxItem.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export async function dismissInboxItem(userId: string, id: string) {
  // Verify ownership
  const existing = await prisma.inboxItem.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  return prisma.inboxItem.delete({
    where: { id },
  });
}
