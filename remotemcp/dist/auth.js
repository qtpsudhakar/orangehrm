/**
 * OrangeHRM session authentication for RemoteMCP.
 *
 * Logs in using form-based auth, acquires session cookies manually,
 * and refreshes them automatically when a 401 is encountered.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import axios from 'axios';
/**
 * Per-request auth context used by the HTTP server.
 * Tool handlers call getAuth() which checks here first before falling back
 * to the env-var singleton (stdio mode). No tool signatures need to change.
 */
export const authContext = new AsyncLocalStorage();
/** Extract all Set-Cookie values from a response header. */
function extractCookies(setCookieHeader) {
    if (!setCookieHeader)
        return [];
    const values = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    return values.map(c => c.split(';')[0].trim()).filter(Boolean);
}
export class OrangeHrmAuth {
    config;
    client;
    sessionCookies = [];
    authenticated = false;
    constructor(config) {
        this.config = config;
        // Plain axios — we manage the Cookie header ourselves.
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            // Follow redirects but don't throw on 3xx (we handle URLs manually).
            maxRedirects: 10,
        });
        // Attach session cookies to every outgoing request.
        this.client.interceptors.request.use(cfg => {
            if (this.sessionCookies.length > 0) {
                cfg.headers = cfg.headers ?? {};
                cfg.headers['Cookie'] = this.sessionCookies.join('; ');
            }
            return cfg;
        });
    }
    /**
     * Fetch the login page to get the CSRF token and session cookie,
     * then POST credentials.
     */
    async login() {
        // Reset existing session cookies before a fresh login.
        this.sessionCookies = [];
        // Step 1: GET the login page — collect the pre-auth session cookie.
        const loginPageResp = await axios.get(`${this.config.baseUrl}/auth/login`, {
            headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
            maxRedirects: 5,
        });
        // Grab the session cookie(s) from the GET response.
        const getCookies = extractCookies(loginPageResp.headers['set-cookie']);
        if (getCookies.length > 0) {
            this.sessionCookies = getCookies;
        }
        // OrangeHRM v5 is a Vue.js SPA — the CSRF token is a component prop:
        // <auth-login :token="&quot;TOKEN_VALUE&quot;" ...>
        const tokenMatch = loginPageResp.data.match(/:token="&quot;([^&]+)&quot;"/);
        const csrfToken = tokenMatch ? tokenMatch[1] : '';
        // Step 2: POST credentials with the session cookie and CSRF token.
        // IMPORTANT: Use maxRedirects:0 — OrangeHRM regenerates the session ID on
        // successful authentication and returns it via Set-Cookie in the 302 response.
        // If we let axios auto-follow the redirect, it carries the OLD session cookie
        // and the server sees an unauthenticated session, causing a CSRF error loop.
        const formData = new URLSearchParams({
            username: this.config.username,
            password: this.config.password,
            _token: csrfToken ?? '',
        });
        const loginResp = await axios.post(`${this.config.baseUrl}/auth/validate`, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: this.sessionCookies.join('; '),
            },
            maxRedirects: 0, // Do NOT auto-follow the redirect
            validateStatus: (s) => s < 400, // Allow 200 and 3xx
        });
        // Capture the new (post-auth) session cookie from the 302 Set-Cookie header.
        const postCookies = extractCookies(loginResp.headers['set-cookie']);
        if (postCookies.length > 0) {
            const merged = new Map();
            for (const c of [...this.sessionCookies, ...postCookies]) {
                const eq = c.indexOf('=');
                if (eq !== -1)
                    merged.set(c.substring(0, eq), c);
            }
            this.sessionCookies = Array.from(merged.values());
        }
        // 302 with Location pointing away from /auth/login means success.
        const location = loginResp.headers['location'] ?? '';
        if (loginResp.status === 302) {
            if (!location.includes('/auth/login')) {
                this.authenticated = true;
                return;
            }
            throw new Error('OrangeHRM login failed — check ORANGEHRM_USERNAME / ORANGEHRM_PASSWORD');
        }
        // Fallback: if for some reason we got a 200 directly (no redirect),
        // treat a landing on /auth/login as failure.
        const responseUrl = loginResp.request
            ?.res?.responseUrl ?? '';
        if (responseUrl.includes('/auth/login')) {
            throw new Error('OrangeHRM login failed — check ORANGEHRM_USERNAME / ORANGEHRM_PASSWORD');
        }
        this.authenticated = true;
    }
    /**
     * Ensures the client is authenticated. Re-logs in if needed.
     */
    async ensureAuthenticated() {
        if (!this.authenticated) {
            await this.login();
        }
    }
    /**
     * Execute an API call, retrying once after re-login on 401.
     */
    async withAuth(fn) {
        await this.ensureAuthenticated();
        try {
            return await fn(this.client);
        }
        catch (err) {
            const status = err?.response?.status;
            if (status === 401) {
                this.authenticated = false;
                await this.login();
                return fn(this.client);
            }
            throw err;
        }
    }
}
let _auth = null;
export function getAuth() {
    // HTTP server mode: use the per-request context set by authContext.run()
    const contextAuth = authContext.getStore();
    if (contextAuth) {
        return contextAuth;
    }
    // Stdio mode: fall back to env-var singleton
    if (!_auth) {
        const baseUrl = process.env['ORANGEHRM_BASE_URL'];
        const username = process.env['ORANGEHRM_USERNAME'];
        const password = process.env['ORANGEHRM_PASSWORD'];
        if (!baseUrl || !username || !password) {
            throw new Error('Missing required environment variables: ' +
                'ORANGEHRM_BASE_URL, ORANGEHRM_USERNAME, ORANGEHRM_PASSWORD');
        }
        _auth = new OrangeHrmAuth({ baseUrl, username, password });
    }
    return _auth;
}
//# sourceMappingURL=auth.js.map