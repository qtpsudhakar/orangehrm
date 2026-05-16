import {isWebMcpEnabled} from './core/toolGuards';
import {
  executeRegisteredTool,
  getRegisteredToolNames,
  registerTools,
} from './core/toolRegistry';
import {getReadTools} from './tools/readTools';
import {getWriteTools} from './tools/writeTools';
import {clearToolAuditLogs, getToolAuditLogs} from './core/auditLogger';

const attachWebMcpDebugApi = () => {
  const globalWindow = window as Window & {
    webmcp?: {
      tools: () => string[];
      executeTool: (
        toolName: string,
        args?: Record<string, unknown>,
      ) => Promise<unknown>;
      auditLogs: () => unknown[];
      clearAuditLogs: () => void;
    };
  };

  globalWindow.webmcp = {
    tools: () => getRegisteredToolNames(),
    executeTool: (toolName: string, args: Record<string, unknown> = {}) =>
      executeRegisteredTool(toolName, args),
    auditLogs: () => getToolAuditLogs(),
    clearAuditLogs: () => clearToolAuditLogs(),
  };
};

export const registerWebMcpTools = (): number => {
  if (!isWebMcpEnabled()) {
    return 0;
  }

  const tools = [...getReadTools(), ...getWriteTools()];
  const registeredCount = registerTools(tools);
  attachWebMcpDebugApi();
  return registeredCount;
};
