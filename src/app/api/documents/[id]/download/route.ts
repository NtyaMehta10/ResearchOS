import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiNotFound, apiUnauthorized } from '@/lib/api-response';
import { getDocumentById } from '@/lib/services/documentService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;
  const doc = await getDocumentById(user.id, id);

  if (!doc) return apiNotFound('Document not found');

  const relativePath = doc.filePath.startsWith('/') ? doc.filePath.slice(1) : doc.filePath;
  const absolutePath = path.join(process.cwd(), relativePath);

  const safeFileName = doc.fileName.replace(/["\\\r\n]/g, '_');

  if (!fs.existsSync(absolutePath)) {
    return new NextResponse('File content placeholder available in ResearchOS storage.', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
      },
    });
  }

  const fileStream = fs.createReadStream(absolutePath);
  return new NextResponse(fileStream as any, {
    headers: {
      'Content-Type': doc.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFileName}"`,
    },
  });
}
