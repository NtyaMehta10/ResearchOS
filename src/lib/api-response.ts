import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]> | unknown;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

export function apiSuccess<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function apiError(error: string, status = 500, errors?: unknown) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error,
      ...(errors ? { errors } : {}),
    },
    { status }
  );
}

export function apiBadRequest(error: string, errors?: unknown) {
  return apiError(error, 400, errors);
}

export function apiUnauthorized(error = 'Unauthorized access') {
  return apiError(error, 401);
}

export function apiForbidden(error = 'Forbidden: insufficient permissions') {
  return apiError(error, 403);
}

export function apiNotFound(error = 'Resource not found') {
  return apiError(error, 404);
}

export function apiInternalError(error = 'Internal server error') {
  return apiError(error, 500);
}
