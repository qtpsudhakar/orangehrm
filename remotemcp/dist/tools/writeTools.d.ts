/**
 * Write tools for the OrangeHRM RemoteMCP layer.
 *
 * These tools mutate state in OrangeHRM. Each one calls the relevant REST
 * endpoint via the authenticated HTTP client. Unlike the WebMCP browser layer,
 * there is no `window.confirm` here — confirmations are handled at the MCP
 * protocol level by the calling LLM/client.
 *
 * Mirrors: src/client/src/webmcp/tools/writeTools.ts
 */
import { RemoteToolDefinition } from '../types.js';
export declare const getWriteTools: () => RemoteToolDefinition[];
//# sourceMappingURL=writeTools.d.ts.map