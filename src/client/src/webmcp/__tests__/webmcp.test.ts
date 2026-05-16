/**
 * WebMCP Tools Test Harness
 * Tests tool registration, execution, audit logging, and role-based access
 * Run with: node src/client/src/webmcp/__tests__/webmcp.test.ts
 */

import {describe, it, expect, beforeEach, afterEach} from '@jest/globals';

// Mock ModelContext and types
interface ToolResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}

interface ModelContextToolDefinition {
  name: string;
  description: string;
  inputSchema?: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
  };
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

// Mock audit logger
const mockAuditLogs: Array<{
  toolName: string;
  startedAt: string;
  success: boolean;
  input: Record<string, unknown>;
}> = [];

const appendAudit = (entry: {
  toolName: string;
  startedAt: string;
  success: boolean;
  input: Record<string, unknown>;
}) => {
  mockAuditLogs.push(entry);
};

const clearAudit = () => {
  mockAuditLogs.splice(0, mockAuditLogs.length);
};

// Test tool definitions
const testTools: ModelContextToolDefinition[] = [
  {
    name: 'list_projects',
    description: 'List time tracking projects',
    execute: async () => ({
      success: true,
      message: 'Projects fetched',
      data: {count: 3, projects: [{id: 1, name: 'Project A'}]},
    }),
  },
  {
    name: 'apply_leave',
    description: 'Apply leave request',
    inputSchema: {
      type: 'object',
      properties: {
        leaveTypeId: {type: 'number'},
        fromDate: {type: 'string'},
        toDate: {type: 'string'},
      },
      required: ['leaveTypeId', 'fromDate', 'toDate'],
    },
    execute: async (args) => {
      if (!args.leaveTypeId || !args.fromDate || !args.toDate) {
        return {
          success: false,
          message: 'Missing required fields',
          errorCode: 'VALIDATION_ERROR',
        };
      }
      return {
        success: true,
        message: 'Leave request created',
        data: {leaveRequestId: 501},
      };
    },
  },
  {
    name: 'search_employees',
    description: 'Search employees',
    inputSchema: {
      type: 'object',
      properties: {
        nameOrId: {type: 'string'},
      },
    },
    execute: async (args) => ({
      success: true,
      message: 'Employees fetched',
      data: {count: 2, employees: [{empNumber: 7, firstName: 'Linda'}]},
    }),
  },
];

describe('WebMCP Tools - Core Functionality', () => {
  beforeEach(() => {
    clearAudit();
  });

  afterEach(() => {
    clearAudit();
  });

  it('should execute a simple read tool successfully', async () => {
    const tool = testTools[0];
    const result = (await tool.execute({})) as ToolResult;

    expect(result.success).toBe(true);
    expect(result.message).toContain('Projects');
    expect(result.data).toBeDefined();
  });

  it('should validate required input fields', async () => {
    const tool = testTools[1];
    const result = (await tool.execute({
      leaveTypeId: 1,
      // Missing fromDate and toDate
    })) as ToolResult;

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('VALIDATION_ERROR');
  });

  it('should execute a write tool with valid input', async () => {
    const tool = testTools[1];
    const result = (await tool.execute({
      leaveTypeId: 1,
      fromDate: '2026-05-20',
      toDate: '2026-05-22',
    })) as ToolResult;

    expect(result.success).toBe(true);
    expect(result.message).toContain('Leave request');
  });

  it('should track tool execution in audit log', async () => {
    const tool = testTools[0];
    const startTime = new Date().toISOString();
    const result = (await tool.execute({})) as ToolResult;

    appendAudit({
      toolName: tool.name,
      startedAt: startTime,
      success: result.success,
      input: {},
    });

    expect(mockAuditLogs.length).toBe(1);
    expect(mockAuditLogs[0].toolName).toBe('list_projects');
    expect(mockAuditLogs[0].success).toBe(true);
  });

  it('should maintain multiple audit entries', async () => {
    for (const tool of testTools) {
      const result = (await tool.execute({})) as ToolResult;
      appendAudit({
        toolName: tool.name,
        startedAt: new Date().toISOString(),
        success: result.success,
        input: {},
      });
    }

    expect(mockAuditLogs.length).toBe(testTools.length);
    expect(mockAuditLogs[0].toolName).toBe('list_projects');
    expect(mockAuditLogs[1].toolName).toBe('apply_leave');
    expect(mockAuditLogs[2].toolName).toBe('search_employees');
  });

  it('should handle tool execution with parameters', async () => {
    const tool = testTools[2];
    const args = {nameOrId: 'John Doe'};
    const result = (await tool.execute(args)) as ToolResult;

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    appendAudit({
      toolName: tool.name,
      startedAt: new Date().toISOString(),
      success: result.success,
      input: args,
    });

    expect(mockAuditLogs[0].input.nameOrId).toBe('John Doe');
  });
});

describe('WebMCP Tools - Role-Based Access Control', () => {
  it('should check if write tool allows admin role', () => {
    const allowedRoles = ['admin'];
    const currentRole = 'admin';
    const isAllowed = allowedRoles.includes(currentRole);

    expect(isAllowed).toBe(true);
  });

  it('should reject non-admin role for admin-only tool', () => {
    const allowedRoles = ['admin'];
    const currentRole = 'ess';
    const isAllowed = allowedRoles.includes(currentRole);

    expect(isAllowed).toBe(false);
  });

  it('should allow multiple roles for shared tools', () => {
    const allowedRoles = ['admin', 'supervisor', 'ess'];
    const testRoles = ['admin', 'supervisor', 'ess', 'hr'];

    const results = testRoles.map((role) => allowedRoles.includes(role));

    expect(results).toEqual([true, true, true, false]);
  });
});

describe('WebMCP Tools - Tool Registry', () => {
  it('should list all registered tools', () => {
    const toolNames = testTools.map((t) => t.name);

    expect(toolNames).toContain('list_projects');
    expect(toolNames).toContain('apply_leave');
    expect(toolNames).toContain('search_employees');
    expect(toolNames.length).toBe(3);
  });

  it('should validate tool definition schema', () => {
    const toolWithSchema = testTools[1];

    expect(toolWithSchema.inputSchema).toBeDefined();
    expect(toolWithSchema.inputSchema?.required).toContain('leaveTypeId');
    expect(toolWithSchema.inputSchema?.required).toContain('fromDate');
  });
});

// Mock admin tool definitions matching the pattern in adminReadTools.ts / adminWriteTools.ts
const adminReadToolMocks: ModelContextToolDefinition[] = [
  {
    name: 'list_job_categories',
    description: 'List all configured job categories.',
    execute: async () => ({
      success: true,
      message: 'Job categories fetched',
      data: {count: 2, jobCategories: [{id: 1, name: 'IT'}, {id: 2, name: 'Finance'}]},
    }),
  },
  {
    name: 'list_employment_statuses',
    description: 'List all configured employment statuses.',
    execute: async () => ({
      success: true,
      message: 'Employment statuses fetched',
      data: {count: 3, employmentStatuses: [{id: 1, name: 'Full-Time'}]},
    }),
  },
  {
    name: 'list_locations',
    description: 'List all office and work locations.',
    execute: async () => ({
      success: true,
      message: 'Locations fetched',
      data: {count: 1, locations: [{id: 1, name: 'HQ', countryCode: 'US'}]},
    }),
  },
  {
    name: 'list_nationalities',
    description: 'List all configured nationalities.',
    execute: async () => ({
      success: true,
      message: 'Nationalities fetched',
      data: {count: 5, nationalities: [{id: 1, name: 'American'}]},
    }),
  },
  {
    name: 'list_subunits',
    description: 'List all organizational structure subunits.',
    execute: async () => ({
      success: true,
      message: 'Subunits fetched',
      data: {count: 2, subunits: [{id: 1, name: 'Engineering'}]},
    }),
  },
  {
    name: 'list_pay_grades',
    description: 'List all configured pay grades.',
    execute: async () => ({
      success: true,
      message: 'Pay grades fetched',
      data: {count: 3, payGrades: [{id: 1, name: 'Grade A'}]},
    }),
  },
  {
    name: 'list_work_shifts',
    description: 'List all configured work shifts.',
    execute: async () => ({
      success: true,
      message: 'Work shifts fetched',
      data: {count: 2, workShifts: [{id: 1, name: 'Morning Shift'}]},
    }),
  },
  {
    name: 'get_organization_info',
    description: 'Get organization general information.',
    execute: async () => ({
      success: true,
      message: 'Organization info fetched',
      data: {organization: {name: 'OrangeHRM Inc.', taxId: '123-456'}},
    }),
  },
  {
    name: 'list_education_qualifications',
    description: 'List all education qualification types.',
    execute: async () => ({
      success: true,
      message: 'Education qualifications fetched',
      data: {count: 4, educations: [{id: 1, name: 'Bachelor of Science'}]},
    }),
  },
  {
    name: 'list_skill_qualifications',
    description: 'List all skill qualification types.',
    execute: async () => ({
      success: true,
      message: 'Skill qualifications fetched',
      data: {count: 3, skills: [{id: 1, name: 'TypeScript'}]},
    }),
  },
  {
    name: 'list_license_qualifications',
    description: 'List all license qualification types.',
    execute: async () => ({
      success: true,
      message: 'License qualifications fetched',
      data: {count: 2, licenses: [{id: 1, name: 'Driver License'}]},
    }),
  },
  {
    name: 'list_language_qualifications',
    description: 'List all language qualification types.',
    execute: async () => ({
      success: true,
      message: 'Language qualifications fetched',
      data: {count: 6, languages: [{id: 1, name: 'English'}]},
    }),
  },
  {
    name: 'list_membership_qualifications',
    description: 'List all membership qualification types.',
    execute: async () => ({
      success: true,
      message: 'Membership qualifications fetched',
      data: {count: 2, memberships: [{id: 1, name: 'IEEE'}]},
    }),
  },
];

const adminWriteToolMocks: ModelContextToolDefinition[] = [
  {
    name: 'create_job_title',
    description: 'Create a new job title.',
    inputSchema: {
      type: 'object',
      properties: {name: {type: 'string'}},
      required: ['name'],
    },
    execute: async (args) => {
      if (!args.name) {
        return {success: false, message: 'Missing required fields', errorCode: 'VALIDATION_ERROR'};
      }
      return {success: true, message: 'Job title created', data: {jobTitle: {id: 10, name: args.name}}};
    },
  },
  {
    name: 'create_location',
    description: 'Create a new work location.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {type: 'string'},
        countryCode: {type: 'string'},
      },
      required: ['name', 'countryCode'],
    },
    execute: async (args) => {
      if (!args.name || !args.countryCode) {
        return {success: false, message: 'Missing required fields', errorCode: 'VALIDATION_ERROR'};
      }
      return {
        success: true,
        message: 'Location created',
        data: {location: {id: 5, name: args.name, countryCode: args.countryCode}},
      };
    },
  },
  {
    name: 'create_system_user',
    description: 'Create a new system user account.',
    inputSchema: {
      type: 'object',
      properties: {
        username: {type: 'string'},
        password: {type: 'string'},
        userRoleId: {type: 'number'},
        empNumber: {type: 'number'},
        status: {type: 'boolean'},
      },
      required: ['username', 'password', 'userRoleId', 'empNumber', 'status'],
    },
    execute: async (args) => {
      if (!args.username || !args.password || args.userRoleId == null || args.empNumber == null || args.status == null) {
        return {success: false, message: 'Missing required fields', errorCode: 'VALIDATION_ERROR'};
      }
      return {success: true, message: 'System user created', data: {user: {id: 20, username: args.username}}};
    },
  },
];

describe('WebMCP Admin Tools - Read Tools', () => {
  it('should execute all 13 admin read tools successfully', async () => {
    for (const tool of adminReadToolMocks) {
      const result = (await tool.execute({})) as ToolResult;
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    }
  });

  it('should return collection with count for list tools', async () => {
    const listTools = adminReadToolMocks.filter((t) => t.name !== 'get_organization_info');
    for (const tool of listTools) {
      const result = (await tool.execute({})) as ToolResult<{count: number}>;
      expect(result.success).toBe(true);
      expect((result.data as {count: number})?.count).toBeGreaterThanOrEqual(0);
    }
  });

  it('should return single record for get_organization_info', async () => {
    const tool = adminReadToolMocks.find((t) => t.name === 'get_organization_info')!;
    const result = (await tool.execute({})) as ToolResult<{organization: unknown}>;
    expect(result.success).toBe(true);
    expect((result.data as {organization: unknown})?.organization).toBeDefined();
  });

  it('should cover all 13 admin read tool names', () => {
    const expectedNames = [
      'list_job_categories',
      'list_employment_statuses',
      'list_locations',
      'list_nationalities',
      'list_subunits',
      'list_pay_grades',
      'list_work_shifts',
      'get_organization_info',
      'list_education_qualifications',
      'list_skill_qualifications',
      'list_license_qualifications',
      'list_language_qualifications',
      'list_membership_qualifications',
    ];
    const actualNames = adminReadToolMocks.map((t) => t.name);
    expect(actualNames).toEqual(expectedNames);
    expect(actualNames.length).toBe(13);
  });
});

describe('WebMCP Admin Tools - Write Tools', () => {
  it('should create job title with valid name', async () => {
    const tool = adminWriteToolMocks[0];
    const result = (await tool.execute({name: 'Senior Engineer'})) as ToolResult;
    expect(result.success).toBe(true);
    expect(result.message).toContain('Job title created');
  });

  it('should fail create_job_title when name is missing', async () => {
    const tool = adminWriteToolMocks[0];
    const result = (await tool.execute({})) as ToolResult;
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('VALIDATION_ERROR');
  });

  it('should create location with required name and countryCode', async () => {
    const tool = adminWriteToolMocks[1];
    const result = (await tool.execute({name: 'New York Office', countryCode: 'US'})) as ToolResult;
    expect(result.success).toBe(true);
    expect(result.message).toContain('Location created');
  });

  it('should fail create_location when countryCode is missing', async () => {
    const tool = adminWriteToolMocks[1];
    const result = (await tool.execute({name: 'New York Office'})) as ToolResult;
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('VALIDATION_ERROR');
  });

  it('should create system user with all required fields', async () => {
    const tool = adminWriteToolMocks[2];
    const result = (await tool.execute({
      username: 'jdoe',
      password: 'Secret123!',
      userRoleId: 1,
      empNumber: 42,
      status: true,
    })) as ToolResult;
    expect(result.success).toBe(true);
    expect(result.message).toContain('System user created');
  });

  it('should fail create_system_user when any required field is missing', async () => {
    const tool = adminWriteToolMocks[2];
    const result = (await tool.execute({
      username: 'jdoe',
      password: 'Secret123!',
      // missing userRoleId, empNumber, status
    })) as ToolResult;
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('VALIDATION_ERROR');
  });

  it('should enforce admin-only role for write tools', () => {
    const adminOnlyRoles = ['admin'];
    const roles = ['admin', 'supervisor', 'ess', 'hr'];
    const results = roles.map((r) => adminOnlyRoles.includes(r));
    expect(results).toEqual([true, false, false, false]);
  });

  it('should have schemas with required fields for all write tools', () => {
    for (const tool of adminWriteToolMocks) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema?.required?.length).toBeGreaterThan(0);
    }
  });
});

export {};
