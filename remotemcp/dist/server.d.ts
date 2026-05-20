/**
 * OrangeHRM RemoteMCP Server
 *
 * Registers all OrangeHRM tools with the MCP SDK and maps them to the
 * authenticated HTTP client. Designed to be transport-agnostic — the entry
 * point (index.ts) chooses the transport (stdio for Claude Desktop, HTTP/SSE
 * for remote clients).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
export declare function createMcpServer(): McpServer;
//# sourceMappingURL=server.d.ts.map