import {apiGet} from '../core/apiClient';
import {ModelContextToolDefinition} from '../core/modelContext.types';
import {ok} from '../core/toolResponse';

type SearchEmployeesInput = {
  empNumber?: number;
  nameOrId?: string;
  limit?: number;
  offset?: number;
};

type GetEmployeeProfileInput = {
  empNumber: number;
};

type GetLeaveBalanceInput = {
  leaveTypeId: number;
};

type ProjectActivitiesInput = {
  projectId: number;
};

const normalizeCollection = <T = unknown>(response: unknown): T[] => {
  const payload = response as {data?: T[]};
  return Array.isArray(payload?.data) ? payload.data : [];
};

const normalizeRecord = <T = unknown>(response: unknown): T | null => {
  const payload = response as {data?: T};
  return payload?.data ?? null;
};

export const getReadTools = (): ModelContextToolDefinition[] => {
  return [
    {
      name: 'search_employees',
      description: 'Search employees in PIM by name, id, and paging options.',
      inputSchema: {
        type: 'object',
        properties: {
          empNumber: {type: 'number'},
          nameOrId: {type: 'string'},
          limit: {type: 'number'},
          offset: {type: 'number'},
        },
      },
      execute: async (args) => {
        const input = args as unknown as SearchEmployeesInput;
        const response = await apiGet('/api/v2/pim/employees', {
          empNumber: input.empNumber,
          nameOrId: input.nameOrId,
          limit: input.limit,
          offset: input.offset,
        });

        const employees = normalizeCollection(response);
        return ok('Employees fetched', {
          count: employees.length,
          employees,
        });
      },
    },
    {
      name: 'get_employee_profile',
      description: 'Get full profile data for a single employee by empNumber.',
      inputSchema: {
        type: 'object',
        properties: {
          empNumber: {type: 'number'},
        },
        required: ['empNumber'],
      },
      execute: async (args) => {
        const input = args as unknown as GetEmployeeProfileInput;
        const response = await apiGet(
          `/api/v2/pim/employees/${input.empNumber}`,
        );
        const employee = normalizeRecord(response);
        return ok('Employee profile fetched', {employee});
      },
    },
    {
      name: 'list_leave_types',
      description: 'List all configured leave types.',
      execute: async () => {
        const response = await apiGet('/api/v2/leave/leave-types');
        const leaveTypes = normalizeCollection(response);
        return ok('Leave types fetched', {
          count: leaveTypes.length,
          leaveTypes,
        });
      },
    },
    {
      name: 'get_leave_balance',
      description: 'Get logged-in user leave balance by leaveTypeId.',
      inputSchema: {
        type: 'object',
        properties: {
          leaveTypeId: {type: 'number'},
        },
        required: ['leaveTypeId'],
      },
      execute: async (args) => {
        const input = args as unknown as GetLeaveBalanceInput;
        const response = await apiGet(
          `/api/v2/leave/leave-balance/leave-type/${input.leaveTypeId}`,
        );
        return ok('Leave balance fetched', {
          balance: normalizeRecord(response),
        });
      },
    },
    {
      name: 'list_projects',
      description: 'List time tracking projects.',
      execute: async () => {
        const response = await apiGet('/api/v2/time/projects');
        const projects = normalizeCollection(response);
        return ok('Projects fetched', {
          count: projects.length,
          projects,
        });
      },
    },
    {
      name: 'list_project_activities',
      description: 'List activities for a project by projectId.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {type: 'number'},
        },
        required: ['projectId'],
      },
      execute: async (args) => {
        const input = args as unknown as ProjectActivitiesInput;
        const response = await apiGet(
          `/api/v2/time/project/${input.projectId}/activities`,
        );
        const activities = normalizeCollection(response);
        return ok('Project activities fetched', {
          count: activities.length,
          activities,
        });
      },
    },
    {
      name: 'list_vacancies',
      description: 'List recruitment vacancies.',
      execute: async () => {
        const response = await apiGet('/api/v2/recruitment/vacancies');
        const vacancies = normalizeCollection(response);
        return ok('Vacancies fetched', {
          count: vacancies.length,
          vacancies,
        });
      },
    },
    {
      name: 'list_candidates',
      description: 'List recruitment candidates.',
      execute: async () => {
        const response = await apiGet('/api/v2/recruitment/candidates');
        const candidates = normalizeCollection(response);
        return ok('Candidates fetched', {
          count: candidates.length,
          candidates,
        });
      },
    },
    {
      name: 'list_system_users',
      description: 'List admin system users.',
      execute: async () => {
        const response = await apiGet('/api/v2/admin/users');
        const users = normalizeCollection(response);
        return ok('System users fetched', {
          count: users.length,
          users,
        });
      },
    },
    {
      name: 'list_job_titles',
      description: 'List configured job titles.',
      execute: async () => {
        const response = await apiGet('/api/v2/admin/job-titles');
        const jobTitles = normalizeCollection(response);
        return ok('Job titles fetched', {
          count: jobTitles.length,
          jobTitles,
        });
      },
    },
  ];
};
