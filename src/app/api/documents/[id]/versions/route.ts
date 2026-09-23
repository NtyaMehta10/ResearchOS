import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { getDocumentVersions, createDocumentVersion } from '@/lib/services/documentService';
import { z } from 'zod';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  try {
    const versions = await getDocumentVersions(user.id, id);
    if (!versions) return apiNotFound('Document not found');
    
    return apiSuccess(versions);
  } catch (error) {
    console.error('Failed to fetch document versions:', error);
    return apiInternalError('Failed to fetch document versions');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return apiBadRequest('No file provided');
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return apiBadRequest('File size exceeds 10MB limit');
    }

    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'application/epub+zip',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
    ];
    
    const mimeType = file.type || 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return apiBadRequest(`File type '${mimeType}' is not allowed.`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = randomBytes(8).toString('hex');
    const storedFileName = `${Date.now()}-${uniqueSuffix}-${safeName}`;
    const filePath = path.join(uploadsDir, storedFileName);
    
    const resolvedStoredPath = path.resolve(uploadsDir, storedFileName);
    if (!resolvedStoredPath.startsWith(path.resolve(uploadsDir))) {
      return apiBadRequest('Invalid filename');
    }

    await writeFile(filePath, buffer);
    const relativeFilePath = `/uploads/${storedFileName}`;

    const result = await createDocumentVersion(user.id, id, {
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      filePath: relativeFilePath,
    });

    if (!result) return apiNotFound('Document not found');

    return apiSuccess(result, undefined, 201);
  } catch (error) {
    console.error('Failed to upload document version:', error);
    return apiInternalError('Failed to upload document version');
  }
}
