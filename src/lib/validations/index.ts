import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  institution: z.string().optional(),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  institution: z.string().max(150).optional(),
  department: z.string().max(150).optional(),
  avatarUrl: z.string().url().or(z.string().length(0)).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required').max(200),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color hex code').default('#4f46e5'),
  icon: z.string().default('Folder'),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).default('ACTIVE'),
  visibility: z.enum(['PRIVATE', 'SHARED', 'PUBLIC']).default('PRIVATE'),
  tagIds: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

export const updateProjectSchema = projectSchema.partial();

export const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#0ea5e9'),
  projectId: z.string().nullable().optional(),
});

export const updateCollectionSchema = collectionSchema.partial();

export const documentUpdateSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(300).optional(),
  projectId: z.string().nullable().optional(),
  collectionId: z.string().nullable().optional(),
  authors: z.string().max(500).optional(),
  journal: z.string().max(200).optional(),
  publicationYear: z.number().int().min(1800).max(2100).nullable().optional(),
  doi: z.string().max(150).optional(),
  abstract: z.string().max(5000).optional(),
  tagIds: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1, 'Note title is required').max(250),
  content: z.string().default(''),
  projectId: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  isPinned: z.boolean().default(false),
  tagIds: z.array(z.string()).optional(),
});

export const updateNoteSchema = noteSchema.partial();

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional(),
  projectId: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  noteId: z.string().nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();
