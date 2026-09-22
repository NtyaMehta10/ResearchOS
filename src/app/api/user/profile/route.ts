import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  return apiSuccess(user);
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid profile data', result.error.flatten().fieldErrors);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: result.data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        institution: true,
        department: true,
        role: true,
        createdAt: true,
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return apiBadRequest('Failed to update profile');
  }
}
