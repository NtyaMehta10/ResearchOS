import prisma from '@/lib/db';

export interface LogActivityParams {
  userId: string;
  projectId?: string | null;
  action:
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_ARCHIVED'
    | 'PROJECT_DELETED'
    | 'DOC_UPLOADED'
    | 'DOC_UPDATED'
    | 'DOC_DELETED'
    | 'NOTE_CREATED'
    | 'NOTE_UPDATED'
    | 'NOTE_DELETED'
    | 'COLLECTION_CREATED'
    | 'COLLECTION_UPDATED'
    | 'COLLECTION_DELETED'
    | 'TAG_CREATED'
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_COMPLETED'
    | 'TASK_DELETED';
  entityType: 'PROJECT' | 'DOCUMENT' | 'NOTE' | 'COLLECTION' | 'TAG' | 'TASK';
  entityId: string;
  entityTitle: string;
  details?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    return await prisma.activity.create({
      data: {
        userId: params.userId,
        projectId: params.projectId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityTitle: params.entityTitle,
        details: params.details || null,
      },
    });
  } catch (error) {
    console.error('Failed to record activity log:', error);
    return null;
  }
}

export async function getUserActivities(userId: string, limit = 20, projectId?: string) {
  return prisma.activity.findMany({
    where: {
      userId,
      ...(projectId ? { projectId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      project: {
        select: { id: true, title: true, color: true },
      },
    },
  });
}
