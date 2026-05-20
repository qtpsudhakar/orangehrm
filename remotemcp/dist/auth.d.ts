/**
 * OrangeHRM session authentication for RemoteMCP.
 *
 * Logs in using form-based auth, acquires session cookies manually,
 * and refreshes them automatically when a 401 is encountered.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { AxiosInstance } from 'axios';
/**
 * Per-request auth context used by the HTTP server.
 * Tool handlers call getAuth() which checks here first before falling back
 * to the env-var singleton (stdio mode). No tool signatures need to change.
 */
export declare const authContext: AsyncLocalStorage<OrangeHrmAuth>;
export interface AuthConfig {
    baseUrl: string;
    username: string;
    password: string;
}
export declare class OrangeHrmAuth {
    private readonly config;
    readonly client: AxiosInstance;
    private sessionCookies;
    private authenticated;
    constructor(config: AuthConfig);
    /**
     * Fetch the login page to get the CSRF token and session cookie,
     * then POST credentials.
     */
    login(): Promise<void>;
    /**
     * Ensures the client is authenticated. Re-logs in if needed.
     */
    ensureAuthenticated(): Promise<void>;
    /**
     * Execute an API call, retrying once after re-login on 401.
     */
    withAuth<T>(fn: (client: AxiosInstance) => Promise<T>): Promise<T>;
}
export declare function getAuth(): OrangeHrmAuth;
//# sourceMappingURL=auth.d.ts.map