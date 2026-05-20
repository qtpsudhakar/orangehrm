/**
 * HTTP client helpers for the OrangeHRM RemoteMCP layer.
 *
 * All calls go through the authenticated session managed by `auth.ts`.
 * This mirrors the browser-side apiClient.ts but runs in Node.js with a
 * persistent cookie jar instead of the browser's cookie store.
 */
export declare const normalizeCollection: <T = unknown>(response: unknown) => T[];
export declare const normalizeRecord: <T = unknown>(response: unknown) => T | null;
export declare const apiGet: <T = unknown>(path: string, params?: Record<string, unknown>) => Promise<T>;
export declare const apiPost: <T = unknown>(path: string, data?: Record<string, unknown>) => Promise<T>;
export declare const apiPut: <T = unknown>(path: string, data?: Record<string, unknown>) => Promise<T>;
export declare const apiDelete: <T = unknown>(path: string) => Promise<T>;
//# sourceMappingURL=httpClient.d.ts.map