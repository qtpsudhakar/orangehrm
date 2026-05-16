interface ToolAuditEntry {
  toolName: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  success: boolean;
  errorCode?: string;
  input: Record<string, unknown>;
}

const AUDIT_KEY = 'WEBMCP_TOOL_AUDIT_LOGS';
const MAX_AUDIT_ENTRIES = 500;

const parseAuditLogs = (rawValue: string | null): ToolAuditEntry[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as ToolAuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const appendToolAuditLog = (entry: ToolAuditEntry): void => {
  const logs = parseAuditLogs(localStorage.getItem(AUDIT_KEY));
  logs.push(entry);

  if (logs.length > MAX_AUDIT_ENTRIES) {
    logs.splice(0, logs.length - MAX_AUDIT_ENTRIES);
  }

  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
};

export const getToolAuditLogs = (): ToolAuditEntry[] => {
  return parseAuditLogs(localStorage.getItem(AUDIT_KEY));
};

export const clearToolAuditLogs = (): void => {
  localStorage.removeItem(AUDIT_KEY);
};
