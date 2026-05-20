/**
 * HTTP client helpers for the OrangeHRM RemoteMCP layer.
 *
 * All calls go through the authenticated session managed by `auth.ts`.
 * This mirrors the browser-side apiClient.ts but runs in Node.js with a
 * persistent cookie jar instead of the browser's cookie store.
 */
import { getAuth } from './auth.js';
const API_BASE = '';
export const normalizeCollection = (response) => {
    const payload = response;
    return Array.isArray(payload?.data) ? payload.data : [];
};
export const normalizeRecord = (response) => {
    const payload = response;
    return payload?.data ?? null;
};
export const apiGet = async (path, params) => {
    const auth = getAuth();
    return auth.withAuth(async (client) => {
        const response = await client.get(`${API_BASE}${path}`, { params });
        return response.data;
    });
};
export const apiPost = async (path, data) => {
    const auth = getAuth();
    return auth.withAuth(async (client) => {
        const response = await client.post(`${API_BASE}${path}`, data ?? {});
        return response.data;
    });
};
export const apiPut = async (path, data) => {
    const auth = getAuth();
    return auth.withAuth(async (client) => {
        const response = await client.put(`${API_BASE}${path}`, data ?? {});
        return response.data;
    });
};
export const apiDelete = async (path) => {
    const auth = getAuth();
    return auth.withAuth(async (client) => {
        const response = await client.delete(`${API_BASE}${path}`);
        return response.data;
    });
};
//# sourceMappingURL=httpClient.js.map