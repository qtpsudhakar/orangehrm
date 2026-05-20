#!/usr/bin/env node
/**
 * OrangeHRM RemoteMCP — Entry Point
 *
 * Starts the MCP server using stdio transport (compatible with Claude Desktop
 * and any MCP client that communicates via stdin/stdout).
 *
 * Required environment variables:
 *   ORANGEHRM_BASE_URL   — Base URL of the OrangeHRM instance
 *                          e.g. http://localhost:8080
 *   ORANGEHRM_USERNAME   — Admin username for OrangeHRM
 *   ORANGEHRM_PASSWORD   — Admin password for OrangeHRM
 *
 * Usage:
 *   node dist/index.js            (production after `npm run build`)
 *   npm run dev                   (development with tsx)
 *
 * Claude Desktop claude_desktop_config.json — simplified with cwd:
 * {
 *   "mcpServers": {
 *     "orangehrm": {
 *       "command": "node",
 *       "args": ["dist/index.js"],
 *       "cwd": "D:\\QtpSudhakarOrg\\orangehrm\\remotemcp",
 *       "env": {
 *         "ORANGEHRM_BASE_URL": "http://localhost:8080",
 *         "ORANGEHRM_USERNAME": "admin",
 *         "ORANGEHRM_PASSWORD": "admin123"
 *       }
 *     }
 *   }
 * }
 *
 * Alternative — run without building (requires tsx):
 * {
 *   "mcpServers": {
 *     "orangehrm": {
 *       "command": "npx",
 *       "args": ["tsx", "src/index.ts"],
 *       "cwd": "D:\\QtpSudhakarOrg\\orangehrm\\remotemcp",
 *       "env": {
 *         "ORANGEHRM_BASE_URL": "http://localhost:8080",
 *         "ORANGEHRM_USERNAME": "admin",
 *         "ORANGEHRM_PASSWORD": "admin123"
 *       }
 *     }
 *   }
 * }
 */

import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {createMcpServer} from './server.js';
import {getAuth} from './auth.js';

async function main(): Promise<void> {
  // Validate env vars and pre-warm the authenticated session before the MCP
  // handshake begins. This gives a clear error at startup rather than on the
  // first tool call.
  const auth = getAuth(); // Throws if env vars are missing
  await auth.login();

  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr so it doesn't pollute the stdio MCP channel.
  console.error(
    `[OrangeHRM RemoteMCP] Server running. Connected to ${process.env['ORANGEHRM_BASE_URL']}`,
  );
}

main().catch((err: unknown) => {
  console.error('[OrangeHRM RemoteMCP] Fatal error:', err);
  process.exit(1);
});
