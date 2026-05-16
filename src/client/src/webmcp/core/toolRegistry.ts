import {
  ModelContext,
  ModelContextAgent,
  ModelContextToolDefinition,
  ToolResult,
} from './modelContext.types';
import {fail} from './toolResponse';
import {validateRequiredInputs} from './toolSchemas';
import {appendToolAuditLog} from './auditLogger';

type ToolUiEventDetail = {
  toolName: string;
  success: boolean;
  message: string;
  errorCode?: string;
  navigatedTo?: string;
};

const TOOL_NAVIGATION_ROUTES: Record<string, string> = {
  search_employees: '/pim/viewEmployeeList',
  get_employee_profile: '/pim/viewEmployeeList',
  create_employee: '/pim/viewEmployeeList',
  list_leave_types: '/leave/viewLeaveList',
  get_leave_balance: '/leave/viewLeaveList',
  apply_leave: '/leave/applyLeave',
  approve_leave_request: '/leave/viewLeaveList',
  list_projects: '/time/viewProjectInfo',
  list_project_activities: '/time/viewProjectInfo',
  submit_timesheet: '/time/viewEmployeeTimesheet',
  list_vacancies: '/recruitment/viewJobVacancy',
  list_candidates: '/recruitment/viewCandidates',
  shortlist_candidate: '/recruitment/viewCandidates',
  list_system_users: '/admin/viewSystemUsers',
  list_job_titles: '/admin/viewJobTitleList',
};

const getBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const globalWindow = window as Window & {
    appGlobal?: {
      baseUrl?: string;
    };
  };

  return globalWindow.appGlobal?.baseUrl || '';
};

const getNavigationTarget = (toolName: string): string | undefined => {
  const route = TOOL_NAVIGATION_ROUTES[toolName];
  if (!route) {
    return undefined;
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return route;
  }

  return `${baseUrl}${route}`;
};

const navigateForTool = (toolName: string): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const target = getNavigationTarget(toolName);
  if (!target) {
    return undefined;
  }

  if (window.location.href.startsWith(target)) {
    return undefined;
  }

  window.location.assign(target);
  return target;
};

const emitToolUiEvent = (detail: ToolUiEventDetail): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('webmcp:tool-result', {detail}));
};

type ToolExecutor = (
  args: Record<string, unknown>,
  agent?: ModelContextAgent,
) => Promise<unknown>;

const toolExecutors = new Map<string, ToolExecutor>();

const getModelContext = (): ModelContext | null => {
  const navigatorWithModelContext = navigator as Navigator & {
    modelContext?: ModelContext;
  };
  return navigatorWithModelContext.modelContext || null;
};

export const registerTools = (tools: ModelContextToolDefinition[]): number => {
  const modelContext = getModelContext();
  if (!modelContext) {
    return 0;
  }

  tools.forEach((tool) => {
    const wrappedExecute: ToolExecutor = async (
      args: Record<string, unknown>,
      agent?: ModelContextAgent,
    ) => {
      const startedAt = new Date();
      const validationError = validateRequiredInputs(
        args,
        tool.inputSchema ?? {},
      );
      if (validationError) {
        emitToolUiEvent({
          toolName: tool.name,
          success: false,
          message: validationError.message,
          errorCode: validationError.errorCode,
        });
        appendToolAuditLog({
          toolName: tool.name,
          startedAt: startedAt.toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 0,
          success: false,
          errorCode: validationError.errorCode,
          input: args,
        });
        return validationError;
      }

      try {
        const result = (await tool.execute(args, agent)) as ToolResult;
        const navigatedTo = result?.success
          ? navigateForTool(tool.name)
          : undefined;
        emitToolUiEvent({
          toolName: tool.name,
          success: result?.success ?? true,
          message: result?.message || 'Tool executed',
          errorCode: result?.errorCode,
          navigatedTo,
        });
        const finishedAt = new Date();
        appendToolAuditLog({
          toolName: tool.name,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          durationMs: finishedAt.getTime() - startedAt.getTime(),
          success: result?.success ?? true,
          errorCode: result?.errorCode,
          input: args,
        });
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unexpected tool error';
        const failedResult = fail(
          message,
          'WEBMCP_EXECUTION_ERROR',
        ) as ToolResult;
        emitToolUiEvent({
          toolName: tool.name,
          success: false,
          message: failedResult.message,
          errorCode: failedResult.errorCode,
        });
        const finishedAt = new Date();
        appendToolAuditLog({
          toolName: tool.name,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          durationMs: finishedAt.getTime() - startedAt.getTime(),
          success: false,
          errorCode: failedResult.errorCode,
          input: args,
        });
        return failedResult;
      }
    };

    toolExecutors.set(tool.name, wrappedExecute);

    modelContext.registerTool({
      ...tool,
      execute: wrappedExecute,
    });
  });

  return tools.length;
};

export const executeRegisteredTool = async (
  toolName: string,
  args: Record<string, unknown>,
  agent?: ModelContextAgent,
): Promise<unknown> => {
  const executor = toolExecutors.get(toolName);
  if (!executor) {
    return fail(
      `Tool '${toolName}' is not registered`,
      'WEBMCP_TOOL_NOT_FOUND',
    );
  }

  return executor(args, agent);
};

export const getRegisteredToolNames = (): string[] => {
  return Array.from(toolExecutors.keys());
};
