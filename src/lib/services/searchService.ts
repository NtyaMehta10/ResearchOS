import prisma from '@/lib/db';

export interface SearchQueryOptions {
  userId: string;
  query: string;
  type?: 'all' | 'projects' | 'documents' | 'notes' | 'collections';
  projectId?: string;
  tagId?: string;
  limit?: number;
}

export async function searchAll(options: SearchQueryOptions) {
  const { userId, query, type = 'all', projectId, tagId, limit = 20 } = options;
  const q = query.trim();

  const results: {
    projects: any[];
    documents: any[];
    notes: any[];
    collections: any[];
    totalCount: number;
  } = {
    projects: [],
    documents: [],
    notes: [],
    collections: [],
    totalCount: 0,
  };

  if (!q) {
    return results;
  }

  // 1. Projects search
  if (type === 'all' || type === 'projects') {
    results.projects = await prisma.project.findMany({
      where: {
        userId,
        ...(projectId ? { id: projectId } : {}),
        ...(tagId ? { projectTags: { some: { tagId } } } : {}),
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: limit,
      include: {
        projectTags: { include: { tag: true } },
        _count: { select: { documents: true, notes: true } },
      },
    });
  }

  // 2. Documents search
  if (type === 'all' || type === 'documents') {
    results.documents = await prisma.document.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
        ...(tagId ? { documentTags: { some: { tagId } } } : {}),
        OR: [
          { title: { contains: q } },
          { authors: { contains: q } },
          { journal: { contains: q } },
          { doi: { contains: q } },
          { abstract: { contains: q } },
          { fileName: { contains: q } },
        ],
      },
      take: limit,
      include: {
        project: { select: { id: true, title: true, color: true } },
        collection: { select: { id: true, name: true, color: true } },
        documentTags: { include: { tag: true } },
      },
    });
  }

  // 3. Notes search
  if (type === 'all' || type === 'notes') {
    results.notes = await prisma.note.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
        ...(tagId ? { noteTags: { some: { tagId } } } : {}),
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      take: limit,
      include: {
        project: { select: { id: true, title: true, color: true } },
        document: { select: { id: true, title: true } },
        noteTags: { include: { tag: true } },
      },
    });
  }

  // 4. Collections search
  if (type === 'all' || type === 'collections') {
    results.collections = await prisma.collection.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: limit,
      include: {
        project: { select: { id: true, title: true, color: true } },
        _count: { select: { documents: true } },
      },
    });
  }

  results.totalCount =
    results.projects.length +
    results.documents.length +
    results.notes.length +
    results.collections.length;

  return results;
}
