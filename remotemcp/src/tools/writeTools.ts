/**
 * Write tools for the OrangeHRM RemoteMCP layer.
 *
 * These tools mutate state in OrangeHRM. Each one calls the relevant REST
 * endpoint via the authenticated HTTP client. Unlike the WebMCP browser layer,
 * there is no `window.confirm` here — confirmations are handled at the MCP
 * protocol level by the calling LLM/client.
 *
 * Mirrors: src/client/src/webmcp/tools/writeTools.ts
 */

import {apiPost, apiPut, normalizeRecord} from '../httpClient.js';
import {ok, fail, RemoteToolDefinition} from '../types.js';

export const getWriteTools = (): RemoteToolDefinition[] => [
  {
    name: 'create_employee',
    description: 'Create a new employee record in PIM.',
    inputSchema: {
      type: 'object',
      properties: {
        firstName: {type: 'string', description: 'Employee first name'},
        lastName: {type: 'string', description: 'Employee last name'},
        employeeId: {type: 'string', description: 'Optional custom employee ID'},
      },
      required: ['firstName', 'lastName'],
    },
    handler: async (args) => {
      try {
        const response = await apiPost('/api/v2/pim/employees', {
          firstName: args['firstName'] as string,
          lastName: args['lastName'] as string,
          employeeId: (args['employeeId'] as string | undefined) ?? '',
        });
        return ok('Employee created', {employee: normalizeRecord(response)});
      } catch (err) {
        return fail(`Failed to create employee: ${String(err)}`);
      }
    },
  },

  {
    name: 'apply_leave',
    description: 'Apply a leave request for the authenticated employee.',
    inputSchema: {
      type: 'object',
      properties: {
        leaveTypeId: {type: 'number', description: 'Leave type ID'},
        fromDate: {type: 'string', description: 'Start date (YYYY-MM-DD)'},
        toDate: {type: 'string', description: 'End date (YYYY-MM-DD)'},
        comment: {type: 'string', description: 'Optional comment'},
      },
      required: ['leaveTypeId', 'fromDate', 'toDate'],
    },
    handler: async (args) => {
      try {
        const response = await apiPost('/api/v2/leave/leave-requests', {
          leaveTypeId: args['leaveTypeId'] as number,
          fromDate: args['fromDate'] as string,
          toDate: args['toDate'] as string,
          comment: (args['comment'] as string | undefined) ?? '',
        });
        return ok('Leave request created', {leaveRequest: normalizeRecord(response)});
      } catch (err) {
        return fail(`Failed to apply leave: ${String(err)}`);
      }
    },
  },

  {
    name: 'approve_leave_request',
    description: 'Approve or reject an employee leave request.',
    inputSchema: {
      type: 'object',
      properties: {
        leaveRequestId: {
          type: 'number',
          description: 'The leave request ID',
        },
        action: {
          type: 'string',
          description: 'Action to perform: APPROVE, REJECT, CANCEL',
        },
        comment: {type: 'string', description: 'Optional comment'},
      },
      required: ['leaveRequestId', 'action'],
    },
    handler: async (args) => {
      try {
        const leaveRequestId = args['leaveRequestId'] as number;
        const response = await apiPut(
          `/api/v2/leave/employees/leave-requests/${leaveRequestId}`,
          {
            action: args['action'] as string,
            comment: (args['comment'] as string | undefined) ?? '',
          },
        );
        return ok('Leave request action completed', {
          leaveRequest: normalizeRecord(response),
        });
      } catch (err) {
        return fail(`Failed to update leave request: ${String(err)}`);
      }
    },
  },

  {
    name: 'submit_timesheet',
    description: 'Submit a timesheet for approval.',
    inputSchema: {
      type: 'object',
      properties: {
        timesheetId: {type: 'number', description: 'The timesheet ID'},
        action: {
          type: 'string',
          description: 'Action: SUBMIT, APPROVE, REJECT, RESET',
        },
      },
      required: ['timesheetId', 'action'],
    },
    handler: async (args) => {
      try {
        const timesheetId = args['timesheetId'] as number;
        const response = await apiPut(
          `/api/v2/time/timesheets/${timesheetId}`,
          {action: args['action'] as string},
        );
        return ok('Timesheet action completed', {
          timesheet: normalizeRecord(response),
        });
      } catch (err) {
        return fail(`Failed to submit timesheet: ${String(err)}`);
      }
    },
  },

  {
    name: 'shortlist_candidate',
    description: 'Shortlist a recruitment candidate for a vacancy.',
    inputSchema: {
      type: 'object',
      properties: {
        candidateId: {type: 'number', description: 'Candidate ID'},
        vacancyId: {type: 'number', description: 'Vacancy ID'},
        note: {type: 'string', description: 'Optional note'},
      },
      required: ['candidateId', 'vacancyId'],
    },
    handler: async (args) => {
      try {
        const candidateId = args['candidateId'] as number;
        const response = await apiPut(
          `/api/v2/recruitment/candidates/${candidateId}/shortlist`,
          {
            vacancyId: args['vacancyId'] as number,
            note: (args['note'] as string | undefined) ?? '',
          },
        );
        return ok('Candidate shortlisted', {candidate: normalizeRecord(response)});
      } catch (err) {
        return fail(`Failed to shortlist candidate: ${String(err)}`);
      }
    },
  },
];
