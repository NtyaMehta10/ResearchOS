import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { getDocuments, createDocument } from '@/lib/services/documentService';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;
  const collectionId = searchParams.get('collectionId') || undefined;
  const tagId = searchParams.get('tagId') || undefined;
  const search = searchParams.get('search') || undefined;
  const sortBy = (searchParams.get('sortBy') as any) || undefined;
  const sortOrder = (searchParams.get('sortOrder') as any) || undefined;

  const docs = await getDocuments(user.id, {
    projectId,
    collectionId,
    tagId,
    search,
    sortBy,
    sortOrder,
  });

  return apiSuccess(docs);
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || (file ? file.name.replace(/\.[^/.]+$/, '') : '');
    const projectId = (formData.get('projectId') as string) || null;
    const collectionId = (formData.get('collectionId') as string) || null;
    const authors = (formData.get('authors') as string) || null;
    const journal = (formData.get('journal') as string) || null;
    const publicationYearStr = formData.get('publicationYear') as string;
    const publicationYear = publicationYearStr ? parseInt(publicationYearStr, 10) : null;
    const doi = (formData.get('doi') as string) || null;
    const abstract = (formData.get('abstract') as string) || null;
    const tagIdsRaw = formData.get('tagIds') as string;
    const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw) : [];

    if (!file) {
      return apiBadRequest('No file provided for upload');
    }

    if (!title.trim()) {
      return apiBadRequest('Document title is required');
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
      return apiBadRequest(`File type '${mimeType}' is not allowed. Permitted types: PDF, Word, TXT, Markdown, EPUB, images.`);
    }

    const fileExt = path.extname(file.name);
    const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.md', '.epub', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
    if (fileExt && !ALLOWED_EXTENSIONS.includes(fileExt.toLowerCase())) {
      return apiBadRequest(`File extension '${fileExt}' is not allowed.`);
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    const storedFileName = `${Date.now()}-${safeBase}${fileExt}`;
    const storedFilePath = path.join(uploadsDir, storedFileName);

    const resolvedStoredPath = path.resolve(uploadsDir, storedFileName);
    if (!resolvedStoredPath.startsWith(path.resolve(uploadsDir))) {
      return apiBadRequest('Invalid filename');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(storedFilePath, buffer);

    const document = await createDocument({
      userId: user.id,
      projectId: projectId || undefined,
      collectionId: collectionId || undefined,
      title: title.trim(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      filePath: `/uploads/${storedFileName}`,
      authors: authors || undefined,
      journal: journal || undefined,
      publicationYear,
      doi: doi || undefined,
      abstract: abstract || undefined,
      tagIds,
    });

    return apiSuccess(document, undefined, 201);
  } catch (error) {
    console.error('Failed to upload document:', error);
    return apiInternalError('Failed to process document upload');
  }
}


