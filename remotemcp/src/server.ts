/**
 * OrangeHRM RemoteMCP Server
 *
 * Registers all OrangeHRM tools with the MCP SDK and maps them to the
 * authenticated HTTP client. Designed to be transport-agnostic — the entry
 * point (index.ts) chooses the transport (stdio for Claude Desktop, HTTP/SSE
 * for remote clients).
 */

import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';
import {getReadTools} from './tools/readTools.js';
import {getWriteTools} from './tools/writeTools.js';
import {getAdminReadTools} from './tools/adminReadTools.js';
import {getAdminWriteTools} from './tools/adminWriteTools.js';
import {RemoteToolDefinition} from './types.js';

/**
 * Convert a RemoteToolDefinition's inputSchema properties into a Zod shape
 * that the MCP SDK can use for input validation.
 *
 * Only the subset of JSON Schema types used in our tool definitions is
 * handled here (string, number, boolean). Unknown types fall back to z.unknown().
 */
function buildZodShape(
  definition: RemoteToolDefinition,
): Record<string, z.ZodTypeAny> {
  const schema = definition.inputSchema;
  if (!schema?.properties) {
    return {};
  }

  const required = new Set(schema.required ?? []);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, rawProp] of Object.entries(schema.properties)) {
    const prop = rawProp as {type?: string; description?: string};
    let zodType: z.ZodTypeAny;

    switch (prop.type) {
      case 'string':
        zodType = z.string();
        break;
      case 'number':
        zodType = z.number();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      default:
        zodType = z.unknown();
    }

    if (prop.description) {
      zodType = zodType.describe(prop.description);
    }

    if (!required.has(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return shape;
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'orangehrm-remote-mcp',
    version: '1.0.0',
  });

  const allTools: RemoteToolDefinition[] = [
    ...getReadTools(),
    ...getWriteTools(),
    ...getAdminReadTools(),
    ...getAdminWriteTools(),
  ];

  for (const tool of allTools) {
    const zodShape = buildZodShape(tool);

    server.tool(
      tool.name,
      tool.description,
      zodShape,
      async (args: Record<string, unknown>) => {
        const result = await tool.handler(args);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
          isError: !result.success,
        };
      },
    );
  }

  return server;
}
