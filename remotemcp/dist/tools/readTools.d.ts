/**
 * Read tools for the OrangeHRM RemoteMCP layer.
 *
 * These are read-only tools: they fetch data from OrangeHRM APIs and return
 * it. No confirmations are required for read operations.
 *
 * Mirrors: src/client/src/webmcp/tools/readTools.ts
 * Difference: uses Node.js HTTP client (httpClient.ts) instead of browser axios.
 */
import { RemoteToolDefinition } from '../types.js';
export declare const getReadTools: () => RemoteToolDefinition[];
//# sourceMappingURL=readTools.d.ts.map