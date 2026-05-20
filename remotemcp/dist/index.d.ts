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
export {};
//# sourceMappingURL=index.d.ts.map