import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { apiBadRequest, apiSuccess, apiUnauthorized } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return apiBadRequest('Invalid input', result.error.flatten().fieldErrors);
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return apiUnauthorized('Invalid email or password');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return apiUnauthorized('Invalid email or password');
    }

    const token = signToken({ userId: user.id, email: user.email });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      institution: user.institution,
      department: user.department,
      role: user.role,
      createdAt: user.createdAt,
    };

    const response = apiSuccess({ user: safeUser, token });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return apiBadRequest('Login failed');
  }
}
