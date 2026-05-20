// Shared type definitions for OrangeHRM RemoteMCP layer

export interface ToolResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}

export interface RemoteMcpConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export interface RemoteToolDefinition {
  name: string;
  description: string;
  inputSchema?: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export const ok = <T>(message: string, data?: T): ToolResult<T> => ({
  success: true,
  message,
  data,
});

export const fail = (
  message: string,
  errorCode = 'REMOTEMCP_ERROR',
): ToolResult => ({
  success: false,
  message,
  errorCode,
});
