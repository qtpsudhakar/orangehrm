export interface ModelContextToolDefinition {
  name: string;
  description: string;
  inputSchema?: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
  };
  execute: (
    args: Record<string, unknown>,
    agent?: ModelContextAgent,
  ) => Promise<unknown> | unknown;
}

export interface ModelContextAgent {
  requestUserInteraction?<T>(callback: () => Promise<T> | T): Promise<T>;
}

export interface ModelContext {
  registerTool: (
    tool: ModelContextToolDefinition,
    options?: {signal?: AbortSignal},
  ) => void;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}
