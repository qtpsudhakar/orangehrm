#!/usr/bin/env node
/**
 * OrangeHRM RemoteMCP — HTTP Server Entry Point
 *
 * Runs as a persistent HTTP server using the MCP Streamable HTTP transport.
 * Credentials are supplied per-request via HTTP headers, making the
 * Claude Desktop (or any MCP client) configuration as simple as:
 *
 * {
 *   "mcpServers": {
 *     "orangehrm": {
 *       "url": "http://localhost:3000/mcp",
 *       "headers": {
 *         "ORANGEHRM_BASE_URL": "http://localhost:8080",
 *         "ORANGEHRM_USERNAME": "admin",
 *         "ORANGEHRM_PASSWORD": "admin123"
 *       }
 *     }
 *   }
 * }
 *
 * Start the server:
 *   npm run start:http      (production, after npm run build)
 *   npm run dev:http        (development, no build needed)
 *
 * Optional env vars:
 *   PORT                    — HTTP port (default: 3000)
 *   ORANGEHRM_BASE_URL      — Fallback base URL if header not provided
 *   ORANGEHRM_USERNAME      — Fallback username if header not provided
 *   ORANGEHRM_PASSWORD      — Fallback password if header not provided
 */

import {createServer, IncomingMessage, ServerResponse} from 'node:http';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {createMcpServer} from './server.js';
import {OrangeHrmAuth, authContext} from './auth.js';

// ─── Session cache ──────────────────────────────────────────────────────────
// Reuse authenticated sessions across requests with the same credentials to
// avoid an expensive OrangeHRM login on every MCP call.
const sessionCache = new Map<string, OrangeHrmAuth>();

async function resolveAuth(
  baseUrl: string,
  username: string,
  password: string,
): Promise<OrangeHrmAuth> {
  const key = `${username}@${baseUrl}`;
  let auth = sessionCache.get(key);
  if (!auth) {
    auth = new OrangeHrmAuth({baseUrl, username, password});
    await auth.login();
    sessionCache.set(key, auth);
  }
  return auth;
}

function invalidateSession(baseUrl: string, username: string): void {
  sessionCache.delete(`${username}@${baseUrl}`);
}

// ─── HTTP server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

function getHeader(req: IncomingMessage, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : (value ?? '');
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return undefined;
  }
}

async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  // Credentials from headers, with env-var fallbacks for convenience
  const baseUrl =
    getHeader(req, 'ORANGEHRM_BASE_URL') ||
    process.env['ORANGEHRM_BASE_URL'] ||
    '';
  const username =
    getHeader(req, 'ORANGEHRM_USERNAME') ||
    process.env['ORANGEHRM_USERNAME'] ||
    '';
  const password =
    getHeader(req, 'ORANGEHRM_PASSWORD') ||
    process.env['ORANGEHRM_PASSWORD'] ||
    '';

  if (!baseUrl || !username || !password) {
    res.writeHead(400, {'Content-Type': 'application/json'}).end(
      JSON.stringify({
        error:
          'Missing credentials. Supply ORANGEHRM_BASE_URL, ORANGEHRM_USERNAME, ' +
          'ORANGEHRM_PASSWORD as request headers (or set them as env vars on the server).',
      }),
    );
    return;
  }

  let auth: OrangeHrmAuth;
  try {
    auth = await resolveAuth(baseUrl, username, password);
  } catch (err) {
    res.writeHead(401, {'Content-Type': 'application/json'}).end(
      JSON.stringify({
        error: 'OrangeHRM authentication failed',
        detail: String(err),
      }),
    );
    return;
  }

  const body = await readBody(req);

  // Run the entire MCP request lifecycle inside the authContext so every
  // tool handler that calls getAuth() gets this request's session — without
  // any signature changes to the tools themselves.
  await authContext.run(auth, async () => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless — safe for per-request tools
    });

    transport.onerror = (err) => {
      // If the session was rejected as unauthorized, evict it so the next
      // request triggers a fresh login.
      if ((err as NodeJS.ErrnoException).message?.includes('401')) {
        invalidateSession(baseUrl, username);
      }
      console.error('[OrangeHRM RemoteMCP] Transport error:', err);
    };

    const server = createMcpServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  });
}

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, ORANGEHRM_BASE_URL, ORANGEHRM_USERNAME, ORANGEHRM_PASSWORD',
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/plain'}).end('OK');
    return;
  }

  if (req.url === '/mcp') {
    await handleMcpRequest(req, res).catch((err: unknown) => {
      if (!res.headersSent) {
        res.writeHead(500, {'Content-Type': 'application/json'}).end(
          JSON.stringify({error: 'Internal server error', detail: String(err)}),
        );
      }
      console.error('[OrangeHRM RemoteMCP] Unhandled error:', err);
    });
    return;
  }

  res.writeHead(404).end();
});

httpServer.listen(PORT, () => {
  console.error(
    `[OrangeHRM RemoteMCP] HTTP server ready — http://localhost:${PORT}/mcp`,
  );
  console.error(
    `[OrangeHRM RemoteMCP] Health check  — http://localhost:${PORT}/health`,
  );
  console.error('[OrangeHRM RemoteMCP] Claude Desktop config:');
  console.error(
    JSON.stringify(
      {
        mcpServers: {
          orangehrm: {
            url: `http://localhost:${PORT}/mcp`,
            headers: {
              ORANGEHRM_BASE_URL: process.env['ORANGEHRM_BASE_URL'] ?? 'http://localhost:8080',
              ORANGEHRM_USERNAME: process.env['ORANGEHRM_USERNAME'] ?? 'admin',
              ORANGEHRM_PASSWORD: '***',
            },
          },
        },
      },
      null,
      2,
    ),
  );
});
