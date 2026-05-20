/**
 * Admin write tools for the OrangeHRM RemoteMCP layer.
 *
 * These tools create or modify admin/configuration data in OrangeHRM.
 * NOTE: System user creation requires a non-empty password — the caller is
 * responsible for supplying secure credentials.
 *
 * Mirrors: src/client/src/webmcp/tools/adminWriteTools.ts
 */
import { apiPost, normalizeRecord } from '../httpClient.js';
import { ok, fail } from '../types.js';
export const getAdminWriteTools = () => [
    {
        name: 'create_job_title',
        description: 'Create a new job title in the admin configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Job title name' },
                description: { type: 'string', description: 'Optional description' },
                note: { type: 'string', description: 'Optional note' },
            },
            required: ['name'],
        },
        handler: async (args) => {
            try {
                const response = await apiPost('/api/v2/admin/job-titles', {
                    name: args['name'],
                    description: args['description'] ?? '',
                    note: args['note'] ?? '',
                });
                return ok('Job title created', { jobTitle: normalizeRecord(response) });
            }
            catch (err) {
                return fail(`Failed to create job title: ${String(err)}`);
            }
        },
    },
    {
        name: 'create_job_category',
        description: 'Create a new job category in the admin configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Job category name' },
            },
            required: ['name'],
        },
        handler: async (args) => {
            try {
                const response = await apiPost('/api/v2/admin/job-categories', {
                    name: args['name'],
                });
                return ok('Job category created', { jobCategory: normalizeRecord(response) });
            }
            catch (err) {
                return fail(`Failed to create job category: ${String(err)}`);
            }
        },
    },
    {
        name: 'create_employment_status',
        description: 'Create a new employment status in the admin configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Employment status name' },
            },
            required: ['name'],
        },
        handler: async (args) => {
            try {
                const response = await apiPost('/api/v2/admin/employment-statuses', {
                    name: args['name'],
                });
                return ok('Employment status created', {
                    employmentStatus: normalizeRecord(response),
                });
            }
            catch (err) {
                return fail(`Failed to create employment status: ${String(err)}`);
            }
        },
    },
    {
        name: 'create_location',
        description: 'Create a new work location in the admin configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Location name' },
                countryCode: { type: 'string', description: 'ISO 3166-1 alpha-2 country code' },
                province: { type: 'string' },
                city: { type: 'string' },
                address: { type: 'string' },
                zipCode: { type: 'string' },
                phone: { type: 'string' },
                fax: { type: 'string' },
                note: { type: 'string' },
            },
            required: ['name', 'countryCode'],
        },
        handler: async (args) => {
            try {
                const response = await apiPost('/api/v2/admin/locations', {
                    name: args['name'],
                    countryCode: args['countryCode'],
                    province: args['province'] ?? '',
                    city: args['city'] ?? '',
                    address: args['address'] ?? '',
                    zipCode: args['zipCode'] ?? '',
                    phone: args['phone'] ?? '',
                    fax: args['fax'] ?? '',
                    note: args['note'] ?? '',
                });
                return ok('Location created', { location: normalizeRecord(response) });
            }
            catch (err) {
                return fail(`Failed to create location: ${String(err)}`);
            }
        },
    },
    {
        name: 'create_pay_grade',
        description: 'Create a new pay grade in the admin configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Pay grade name' },
            },
            required: ['name'],
        },
        handler: async (args) => {
            try {
                const response = await apiPost('/api/v2/admin/pay-grades', {
                    name: args['name'],
                });
                return ok('Pay grade created', { payGrade: normalizeRecord(response) });
            }
            catch (err) {
                return fail(`Failed to create pay grade: ${String(err)}`);
            }
        },
    },
    {
        name: 'create_system_user',
        description: 'Create a new system user account. Requires admin credentials.',
        inputSchema: {
            type: 'object',
            properties: {
                username: { type: 'string', description: 'Login username' },
                password: { type: 'string', description: 'Initial password (min 8 chars)' },
                userRoleId: { type: 'number', description: 'User role ID (1=Admin, 2=ESS)' },
                empNumber: { type: 'number', description: 'Associated employee number' },
                status: { type: 'boolean', description: 'Account enabled status' },
            },
            required: ['username', 'password', 'userRoleId', 'empNumber', 'status'],
        },
        handler: async (args) => {
            const password = args['password'];
            // Enforce minimum password length to avoid creating insecure accounts.
            if (!password || password.length < 8) {
                return fail('Password must be at least 8 characters', 'REMOTEMCP_VALIDATION_ERROR');
            }
            try {
                const response = await apiPost('/api/v2/admin/users', {
                    username: args['username'],
                    password,
                    userRoleId: args['userRoleId'],
                    empNumber: args['empNumber'],
                    status: args['status'],
                });
                return ok('System user created', { user: normalizeRecord(response) });
            }
            catch (err) {
                return fail(`Failed to create system user: ${String(err)}`);
            }
        },
    },
];
//# sourceMappingURL=adminWriteTools.js.map