import prisma from '@/lib/db';

export async function getUserAnalytics(userId: string) {
  const [
    projectCount,
    activeProjectCount,
    archivedProjectCount,
    documentCount,
    noteCount,
    collectionCount,
    tagCount,
    documents,
    recentActivities,
    projectsWithCounts,
  ] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.project.count({ where: { userId, status: 'ARCHIVED' } }),
    prisma.document.count({ where: { userId } }),
    prisma.note.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.tag.count({ where: { userId } }),
    prisma.document.findMany({
      where: { userId },
      select: { fileSize: true, mimeType: true, createdAt: true },
    }),
    prisma.activity.findMany({
      where: { userId },
      take: 30,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        color: true,
        status: true,
        _count: {
          select: { documents: true, notes: true },
        },
      },
    }),
  ]);

  const totalStorageBytes = documents.reduce((acc, doc) => acc + doc.fileSize, 0);

  // Group activity by date (last 7 days)
  const now = new Date();
  const activityByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    activityByDay[key] = 0;
  }

  recentActivities.forEach((act) => {
    const key = act.createdAt.toISOString().split('T')[0];
    if (activityByDay[key] !== undefined) {
      activityByDay[key]++;
    }
  });

  const dailyActivityTrend = Object.entries(activityByDay).map(([date, count]) => ({
    date,
    dayLabel: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    count,
  }));

  // Document types breakdown
  const mimeTypeMap: Record<string, number> = {};
  documents.forEach((d) => {
    const type = d.mimeType.includes('pdf')
      ? 'PDF'
      : d.mimeType.includes('word') || d.mimeType.includes('document')
      ? 'Word'
      : d.mimeType.includes('text') || d.mimeType.includes('markdown')
      ? 'Markdown / Text'
      : 'Other';
    mimeTypeMap[type] = (mimeTypeMap[type] || 0) + 1;
  });

  const documentTypeBreakdown = Object.entries(mimeTypeMap).map(([type, count]) => ({
    type,
    count,
    percentage: documentCount > 0 ? Math.round((count / documentCount) * 100) : 0,
  }));

  return {
    overview: {
      totalProjects: projectCount,
      activeProjects: activeProjectCount,
      archivedProjects: archivedProjectCount,
      totalDocuments: documentCount,
      totalNotes: noteCount,
      totalCollections: collectionCount,
      totalTags: tagCount,
      totalStorageBytes,
      formattedStorage: formatBytes(totalStorageBytes),
    },
    dailyActivityTrend,
    documentTypeBreakdown,
    projectDistribution: projectsWithCounts.map((p) => ({
      id: p.id,
      title: p.title,
      color: p.color,
      status: p.status,
      documents: p._count.documents,
      notes: p._count.notes,
      totalItems: p._count.documents + p._count.notes,
    })),
  };
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
