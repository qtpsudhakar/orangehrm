import {ToolResult} from './modelContext.types';

export const ok = <T>(message: string, data?: T): ToolResult<T> => ({
  success: true,
  message,
  data,
});

export const fail = (
  message: string,
  errorCode = 'WEBMCP_ERROR',
): ToolResult => ({
  success: false,
  message,
  errorCode,
});
