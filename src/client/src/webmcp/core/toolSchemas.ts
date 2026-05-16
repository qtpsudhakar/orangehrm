import {fail} from './toolResponse';
import {ToolResult} from './modelContext.types';

export interface ToolInputSchema {
  required?: string[];
}

export const validateRequiredInputs = (
  payload: Record<string, unknown>,
  schema: ToolInputSchema,
): ToolResult | null => {
  const missing = (schema.required || []).filter((key) => {
    const value = payload[key];
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    return false;
  });

  if (missing.length > 0) {
    return fail(
      `Missing required input: ${missing.join(', ')}`,
      'WEBMCP_VALIDATION_ERROR',
    );
  }

  return null;
};
