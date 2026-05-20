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
export declare const ok: <T>(message: string, data?: T) => ToolResult<T>;
export declare const fail: (message: string, errorCode?: string) => ToolResult;
//# sourceMappingURL=types.d.ts.map