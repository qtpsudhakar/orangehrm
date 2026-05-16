import {apiPost, apiPut} from '../core/apiClient';
import {ModelContextToolDefinition} from '../core/modelContext.types';
import {ensureRoleAllowed, requestConfirmation} from '../core/toolGuards';
import {ok} from '../core/toolResponse';

type CreateEmployeeInput = {
  firstName: string;
  lastName: string;
  employeeId?: string;
};

type ApplyLeaveInput = {
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  comment?: string;
};

type SubmitTimesheetInput = {
  timesheetId: number;
  action: string;
};

type ApproveLeaveInput = {
  leaveRequestId: number;
  action: string;
  comment?: string;
};

type ShortlistCandidateInput = {
  candidateId: number;
  vacancyId: number;
  note?: string;
};

const normalizeRecord = <T = unknown>(response: unknown): T | null => {
  const payload = response as {data?: T};
  return payload?.data ?? null;
};

export const getWriteTools = (): ModelContextToolDefinition[] => {
  return [
    {
      name: 'create_employee',
      description: 'Create a new employee record in PIM.',
      inputSchema: {
        type: 'object',
        properties: {
          firstName: {type: 'string'},
          lastName: {type: 'string'},
          employeeId: {type: 'string'},
        },
        required: ['firstName', 'lastName'],
      },
      execute: async (args) => {
        const roleError = ensureRoleAllowed(['admin']);
        if (roleError) {
          return roleError;
        }

        const input = args as unknown as CreateEmployeeInput;

        const response = await apiPost('/api/v2/pim/employees', {
          firstName: input.firstName,
          lastName: input.lastName,
          employeeId: input.employeeId,
        });

        return ok('Employee created', {
          employee: normalizeRecord(response),
        });
      },
    },
    {
      name: 'apply_leave',
      description: 'Apply leave request for the logged-in employee.',
      inputSchema: {
        type: 'object',
        properties: {
          leaveTypeId: {type: 'number'},
          fromDate: {type: 'string'},
          toDate: {type: 'string'},
          comment: {type: 'string'},
        },
        required: ['leaveTypeId', 'fromDate', 'toDate'],
      },
      execute: async (args, agent) => {
        const roleError = ensureRoleAllowed(['admin', 'ess', 'supervisor']);
        if (roleError) {
          return roleError;
        }

        const input = args as unknown as ApplyLeaveInput;
        const confirmation = await requestConfirmation(
          agent,
          `Apply leave from ${input.fromDate} to ${input.toDate}?`,
        );
        if (!confirmation.success) {
          return confirmation;
        }

        const response = await apiPost('/api/v2/leave/leave-requests', {
          leaveTypeId: input.leaveTypeId,
          fromDate: input.fromDate,
          toDate: input.toDate,
          comment: input.comment ?? '',
        });

        return ok('Leave request created', {
          leaveRequest: normalizeRecord(response),
        });
      },
    },
    {
      name: 'submit_timesheet',
      description: 'Submit a timesheet for approval.',
      inputSchema: {
        type: 'object',
        properties: {
          timesheetId: {type: 'number'},
          action: {type: 'string'},
        },
        required: ['timesheetId', 'action'],
      },
      execute: async (args, agent) => {
        const roleError = ensureRoleAllowed(['admin', 'ess', 'supervisor']);
        if (roleError) {
          return roleError;
        }

        const input = args as unknown as SubmitTimesheetInput;
        const confirmation = await requestConfirmation(
          agent,
          `Submit timesheet ${input.timesheetId} with action '${input.action}'?`,
        );
        if (!confirmation.success) {
          return confirmation;
        }

        const response = await apiPut(
          `/api/v2/time/timesheets/${input.timesheetId}`,
          {
            action: input.action,
          },
        );

        return ok('Timesheet action completed', {
          timesheet: normalizeRecord(response),
        });
      },
    },
    {
      name: 'approve_leave_request',
      description: 'Approve or reject an employee leave request.',
      inputSchema: {
        type: 'object',
        properties: {
          leaveRequestId: {type: 'number'},
          action: {type: 'string'},
          comment: {type: 'string'},
        },
        required: ['leaveRequestId', 'action'],
      },
      execute: async (args, agent) => {
        const roleError = ensureRoleAllowed(['admin', 'supervisor']);
        if (roleError) {
          return roleError;
        }

        const input = args as unknown as ApproveLeaveInput;
        const confirmation = await requestConfirmation(
          agent,
          `Run '${input.action}' on leave request ${input.leaveRequestId}?`,
        );
        if (!confirmation.success) {
          return confirmation;
        }

        const response = await apiPut(
          `/api/v2/leave/employees/leave-requests/${input.leaveRequestId}`,
          {
            action: input.action,
            comment: input.comment ?? '',
          },
        );

        return ok('Leave request action completed', {
          leaveRequest: normalizeRecord(response),
        });
      },
    },
    {
      name: 'shortlist_candidate',
      description: 'Shortlist a candidate for a vacancy.',
      inputSchema: {
        type: 'object',
        properties: {
          candidateId: {type: 'number'},
          vacancyId: {type: 'number'},
          note: {type: 'string'},
        },
        required: ['candidateId', 'vacancyId'],
      },
      execute: async (args, agent) => {
        const roleError = ensureRoleAllowed(['admin', 'supervisor']);
        if (roleError) {
          return roleError;
        }

        const input = args as unknown as ShortlistCandidateInput;
        const confirmation = await requestConfirmation(
          agent,
          `Shortlist candidate ${input.candidateId} for vacancy ${input.vacancyId}?`,
        );
        if (!confirmation.success) {
          return confirmation;
        }

        const response = await apiPut(
          `/api/v2/recruitment/candidates/${input.candidateId}/shortlist`,
          {
            vacancyId: input.vacancyId,
            note: input.note ?? '',
          },
        );

        return ok('Candidate shortlisted', {
          candidate: normalizeRecord(response),
        });
      },
    },
  ];
};
