/**
 * Read tools for the OrangeHRM RemoteMCP layer.
 *
 * These are read-only tools: they fetch data from OrangeHRM APIs and return
 * it. No confirmations are required for read operations.
 *
 * Mirrors: src/client/src/webmcp/tools/readTools.ts
 * Difference: uses Node.js HTTP client (httpClient.ts) instead of browser axios.
 */

import {apiGet, normalizeCollection, normalizeRecord} from '../httpClient.js';
import {ok, fail, RemoteToolDefinition} from '../types.js';

export const getReadTools = (): RemoteToolDefinition[] => [
  {
    name: 'search_employees',
    description:
      'Search employees in PIM by name, id, and paging options.',
    inputSchema: {
      type: 'object',
      properties: {
        empNumber: {type: 'number', description: 'Filter by employee number'},
        nameOrId: {type: 'string', description: 'Search by name or employee ID string'},
        limit: {type: 'number', description: 'Max results to return (default 50)'},
        offset: {type: 'number', description: 'Pagination offset'},
      },
    },
    handler: async (args) => {
      try {
        const response = await apiGet('/api/v2/pim/employees', {
          empNumber: args['empNumber'],
          nameOrId: args['nameOrId'],
          limit: args['limit'],
          offset: args['offset'],
        });
        const employees = normalizeCollection(response);
        return ok('Employees fetched', {count: employees.length, employees});
      } catch (err) {
        return fail(`Failed to search employees: ${String(err)}`);
      }
    },
  },

  {
    name: 'get_employee_profile',
    description: 'Get full profile data for a single employee by empNumber.',
    inputSchema: {
      type: 'object',
      properties: {
        empNumber: {type: 'number', description: 'The employee number'},
      },
      required: ['empNumber'],
    },
    handler: async (args) => {
      try {
        const empNumber = args['empNumber'] as number;
        const response = await apiGet(`/api/v2/pim/employees/${empNumber}`);
        return ok('Employee profile fetched', {employee: normalizeRecord(response)});
      } catch (err) {
        return fail(`Failed to get employee profile: ${String(err)}`);
      }
    },
  },

  {
    name: 'list_leave_types',
    description: 'List all configured leave types.',
    handler: async () => {
      try {
        const response = await apiGet('/api/v2/leave/leave-types');
        const leaveTypes = normalizeCollection(response);
        return ok('Leave types fetched', {count: leaveTypes.length, leaveTypes});
      } catch (err) {
        return fail(`Failed to list leave types: ${String(err)}`);
      }
    },
  },

  {
    name: 'get_leave_balance',
    description: 'Get the logged-in user leave balance by leaveTypeId.',
    inputSchema: {
      type: 'object',
      properties: {
        leaveTypeId: {type: 'number', description: 'ID of the leave type'},
      },
      required: ['leaveTypeId'],
    },
    handler: async (args) => {
      try {
        const leaveTypeId = args['leaveTypeId'] as number;
        const response = await apiGet(
          `/api/v2/leave/leave-balances/my-leave-balance`,
          {leaveTypeId},
        );
        return ok('Leave balance fetched', {balance: normalizeRecord(response)});
      } catch (err) {
        return fail(`Failed to get leave balance: ${String(err)}`);
      }
    },
  },

  {
    name: 'list_projects',
    description: 'List all time-tracking projects.',
    handler: async () => {
      try {
        const response = await apiGet('/api/v2/time/projects');
        const projects = normalizeCollection(response);
        return ok('Projects fetched', {count: projects.length, projects});
      } catch (err) {
        return fail(`Failed to list projects: ${String(err)}`);
      }
    },
  },

  {
    name: 'list_project_activities',
    description: 'List activities for a given project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {type: 'number', description: 'The project ID'},
      },
      required: ['projectId'],
    },
    handler: async (args) => {
      try {
        const projectId = args['projectId'] as number;
        const response = await apiGet(
          `/api/v2/time/projects/${projectId}/activities`,
        );
        const activities = normalizeCollection(response);
        return ok('Project activities fetched', {count: activities.length, activities});
      } catch (err) {
        return fail(`Failed to list project activities: ${String(err)}`);
      }
    },
  },

  {
    name: 'list_vacancies',
    description: 'List all recruitment job vacancies.',
    handler: async () => {
      try {
        const response = await apiGet('/api/v2/recruitment/vacancies');
        const vacancies = normalizeCollection(response);
        return ok('Vacancies fetched', {count: vacancies.length, vacancies});
      } catch (err) {
        return fail(`Failed to list vacancies: ${String(err)}`);
      }
    },
  },

  {
    name: 'list_candidates',
    description: 'List recruitment candidates, optionally filtered by vacancy.',
    inputSchema: {
      type: 'object',
      properties: {
        vacancyId: {type: 'number', description: 'Filter by vacancy ID'},
        limit: {type: 'number'},
        offset: {type: 'number'},
      },
    },
    handler: async (args) => {
      try {
        const response = await apiGet('/api/v2/recruitment/candidates', {
          vacancyId: args['vacancyId'],
          limit: args['limit'],
          offset: args['offset'],
        });
        const candidates = normalizeCollection(response);
        return ok('Candidates fetched', {count: candidates.length, candidates});
      } catch (err) {
        return fail(`Failed to list candidates: ${String(err)}`);
      }
    },
  },
];
