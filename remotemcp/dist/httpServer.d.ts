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
export {};
//# sourceMappingURL=httpServer.d.ts.map