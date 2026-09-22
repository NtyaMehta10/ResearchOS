import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiUnauthorized('Session expired or invalid');
  }

  return apiSuccess({ user });
}
