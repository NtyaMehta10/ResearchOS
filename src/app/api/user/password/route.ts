import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser, comparePassword, hashPassword } from '@/lib/auth';
import { apiBadRequest, apiSuccess, apiUnauthorized, apiInternalError } from '@/lib/api-response';
import { changePasswordSchema } from '@/lib/validations';

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return apiUnauthorized();

  try {
    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid password data', result.error.flatten().fieldErrors);
    }

    const { currentPassword, newPassword } = result.data;

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser) return apiUnauthorized();

    const isMatch = await comparePassword(currentPassword, fullUser.passwordHash);
    if (!isMatch) {
      return apiBadRequest('Current password does not match');
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return apiSuccess({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Failed to update password:', error);
    return apiInternalError('Failed to update password');
  }
}


