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

  const queries: Promise<void>[] = [];

  // 1. Projects search
  if (type === 'all' || type === 'projects') {
    queries.push(prisma.project.findMany({
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
    }).then(res => { results.projects = res; }));
  }

  // 2. Documents search
  if (type === 'all' || type === 'documents') {
    queries.push(prisma.document.findMany({
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
    }).then(res => { results.documents = res; }));
  }

  // 3. Notes search
  if (type === 'all' || type === 'notes') {
    queries.push(prisma.note.findMany({
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
    }).then(res => { results.notes = res; }));
  }

  // 4. Collections search
  if (type === 'all' || type === 'collections') {
    queries.push(prisma.collection.findMany({
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
    }).then(res => { results.collections = res; }));
  }

  await Promise.all(queries);

  results.totalCount =
    results.projects.length +
    results.documents.length +
    results.notes.length +
    results.collections.length;

  return results;
}
