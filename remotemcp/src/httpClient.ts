/**
 * HTTP client helpers for the OrangeHRM RemoteMCP layer.
 *
 * All calls go through the authenticated session managed by `auth.ts`.
 * This mirrors the browser-side apiClient.ts but runs in Node.js with a
 * persistent cookie jar instead of the browser's cookie store.
 */

import {getAuth} from './auth.js';

const API_BASE = '';

export const normalizeCollection = <T = unknown>(response: unknown): T[] => {
  const payload = response as {data?: T[]};
  return Array.isArray(payload?.data) ? payload.data : [];
};

export const normalizeRecord = <T = unknown>(response: unknown): T | null => {
  const payload = response as {data?: T};
  return payload?.data ?? null;
};

export const apiGet = async <T = unknown>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> => {
  const auth = getAuth();
  return auth.withAuth(async (client) => {
    const response = await client.get(`${API_BASE}${path}`, {params});
    return response.data as T;
  });
};

export const apiPost = async <T = unknown>(
  path: string,
  data?: Record<string, unknown>,
): Promise<T> => {
  const auth = getAuth();
  return auth.withAuth(async (client) => {
    const response = await client.post(`${API_BASE}${path}`, data ?? {});
    return response.data as T;
  });
};

export const apiPut = async <T = unknown>(
  path: string,
  data?: Record<string, unknown>,
): Promise<T> => {
  const auth = getAuth();
  return auth.withAuth(async (client) => {
    const response = await client.put(`${API_BASE}${path}`, data ?? {});
    return response.data as T;
  });
};

export const apiDelete = async <T = unknown>(path: string): Promise<T> => {
  const auth = getAuth();
  return auth.withAuth(async (client) => {
    const response = await client.delete(`${API_BASE}${path}`);
    return response.data as T;
  });
};
