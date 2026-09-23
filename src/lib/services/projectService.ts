import prisma from '@/lib/db';
import { logActivity } from './activityService';
import { createInboxItem } from './inboxService';

export interface CreateProjectInput {
  userId: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: string;
  visibility?: string;
  tagIds?: string[];
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: string;
  visibility?: string;
  tagIds?: string[];
}

export async function getProjects(userId: string, filters?: { status?: string; search?: string }) {
  const where: any = { userId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  return prisma.project.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      projectTags: {
        include: { tag: true },
      },
      _count: {
        select: {
          documents: true,
          notes: true,
          collections: true,
        },
      },
    },
  });
}

export async function getProjectById(userId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      projectTags: {
        include: { tag: true },
      },
      collections: {
        include: {
          _count: { select: { documents: true } },
        },
      },
      documents: {
        orderBy: { updatedAt: 'desc' },
        include: {
          documentTags: { include: { tag: true } },
          collection: { select: { id: true, name: true, color: true } },
        },
      },
      notes: {
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        include: {
          noteTags: { include: { tag: true } },
        },
      },
      tasks: {
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
      },
      activities: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          documents: true,
          notes: true,
          collections: true,
          tasks: true,
        },
      },
    },
  });
}

export async function createProject(input: CreateProjectInput) {
  const { userId, tagIds, ...data } = input;

  const project = await prisma.project.create({
    data: {
      ...data,
      userId,
      ...(tagIds && tagIds.length > 0
        ? {
            projectTags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
    include: {
      projectTags: { include: { tag: true } },
      _count: {
        select: { documents: true, notes: true, collections: true },
      },
    },
  });

  await logActivity({
    userId,
    projectId: project.id,
    action: 'PROJECT_CREATED',
    entityType: 'PROJECT',
    entityId: project.id,
    entityTitle: project.title,
    details: `Created new project: ${project.title}`,
  });

  return project;
}

export async function updateProject(userId: string, projectId: string, input: UpdateProjectInput) {
  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!existing) return null;

  const { tagIds, ...data } = input;

  // If tagIds provided, update relations
  if (tagIds !== undefined) {
    await prisma.projectTag.deleteMany({ where: { projectId } });
    if (tagIds.length > 0) {
      await prisma.projectTag.createMany({
        data: tagIds.map((tagId) => ({ projectId, tagId })),
      });
    }
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      projectTags: { include: { tag: true } },
      _count: {
        select: { documents: true, notes: true, collections: true },
      },
    },
  });

  const isArchived = data.status === 'ARCHIVED' && existing.status !== 'ARCHIVED';

  await logActivity({
    userId,
    projectId: updated.id,
    action: isArchived ? 'PROJECT_ARCHIVED' : 'PROJECT_UPDATED',
    entityType: 'PROJECT',
    entityId: updated.id,
    entityTitle: updated.title,
    details: isArchived ? 'Archived research project' : 'Updated project details',
  });

  if (isArchived) {
    await createInboxItem({
      userId,
      type: 'IMPORTANT_PROJECT_ACTIVITY',
      message: `Project archived: ${updated.title}`,
      resourceId: updated.id,
      resourceType: 'PROJECT',
    });
  } else if (existing.status === 'ARCHIVED' && data.status === 'ACTIVE') {
    await createInboxItem({
      userId,
      type: 'IMPORTANT_PROJECT_ACTIVITY',
      message: `Project restored: ${updated.title}`,
      resourceId: updated.id,
      resourceType: 'PROJECT',
    });
  }

  return updated;
}

export async function deleteProject(userId: string, projectId: string) {
  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!existing) return null;

  await logActivity({
    userId,
    projectId: null,
    action: 'PROJECT_DELETED',
    entityType: 'PROJECT',
    entityId: existing.id,
    entityTitle: existing.title,
    details: `Deleted project: ${existing.title}`,
  });

  return prisma.project.delete({
    where: { id: projectId },
  });
}

export async function getProjectStats(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          documents: true,
          notes: true,
          collections: true,
          tasks: true,
        },
      },
    },
  });

  if (!project) return null;

  const docs = await prisma.document.findMany({
    where: { projectId, userId },
    select: { fileSize: true, mimeType: true },
  });

  const totalBytes = docs.reduce((acc, d) => acc + d.fileSize, 0);

  const completedTasks = await prisma.task.count({
    where: { projectId, userId, status: 'COMPLETED' },
  });

  return {
    ...project,
    totalStorageBytes: totalBytes,
    documentCount: project._count.documents,
    noteCount: project._count.notes,
    collectionCount: project._count.collections,
    taskCount: project._count.tasks,
    completedTaskCount: completedTasks,
    remainingTaskCount: project._count.tasks - completedTasks,
  };
}
