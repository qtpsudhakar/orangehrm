/**
 * Admin read tools for the OrangeHRM RemoteMCP layer.
 *
 * These tools are read-only and retrieve admin/configuration data from
 * OrangeHRM. No side effects.
 *
 * Mirrors: src/client/src/webmcp/tools/adminReadTools.ts
 */
import { apiGet, normalizeCollection, normalizeRecord } from '../httpClient.js';
import { ok, fail } from '../types.js';
export const getAdminReadTools = () => [
    {
        name: 'list_system_users',
        description: 'List all system user accounts.',
        inputSchema: {
            type: 'object',
            properties: {
                limit: { type: 'number' },
                offset: { type: 'number' },
            },
        },
        handler: async (args) => {
            try {
                const response = await apiGet('/api/v2/admin/users', {
                    limit: args['limit'],
                    offset: args['offset'],
                });
                const users = normalizeCollection(response);
                return ok('System users fetched', { count: users.length, users });
            }
            catch (err) {
                return fail(`Failed to list system users: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_job_titles',
        description: 'List all configured job titles.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/job-titles');
                const jobTitles = normalizeCollection(response);
                return ok('Job titles fetched', { count: jobTitles.length, jobTitles });
            }
            catch (err) {
                return fail(`Failed to list job titles: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_job_categories',
        description: 'List all configured job categories.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/job-categories');
                const jobCategories = normalizeCollection(response);
                return ok('Job categories fetched', { count: jobCategories.length, jobCategories });
            }
            catch (err) {
                return fail(`Failed to list job categories: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_employment_statuses',
        description: 'List all configured employment statuses.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/employment-statuses');
                const employmentStatuses = normalizeCollection(response);
                return ok('Employment statuses fetched', {
                    count: employmentStatuses.length,
                    employmentStatuses,
                });
            }
            catch (err) {
                return fail(`Failed to list employment statuses: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_locations',
        description: 'List all office and work locations.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/locations');
                const locations = normalizeCollection(response);
                return ok('Locations fetched', { count: locations.length, locations });
            }
            catch (err) {
                return fail(`Failed to list locations: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_nationalities',
        description: 'List all configured nationalities.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/nationalities');
                const nationalities = normalizeCollection(response);
                return ok('Nationalities fetched', { count: nationalities.length, nationalities });
            }
            catch (err) {
                return fail(`Failed to list nationalities: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_subunits',
        description: 'List all organizational structure subunits.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/subunits');
                const subunits = normalizeCollection(response);
                return ok('Subunits fetched', { count: subunits.length, subunits });
            }
            catch (err) {
                return fail(`Failed to list subunits: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_pay_grades',
        description: 'List all configured pay grades.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/pay-grades');
                const payGrades = normalizeCollection(response);
                return ok('Pay grades fetched', { count: payGrades.length, payGrades });
            }
            catch (err) {
                return fail(`Failed to list pay grades: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_work_shifts',
        description: 'List all configured work shifts.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/work-shifts');
                const workShifts = normalizeCollection(response);
                return ok('Work shifts fetched', { count: workShifts.length, workShifts });
            }
            catch (err) {
                return fail(`Failed to list work shifts: ${String(err)}`);
            }
        },
    },
    {
        name: 'get_organization_info',
        description: 'Get organization general information.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/organization');
                return ok('Organization info fetched', { organization: normalizeRecord(response) });
            }
            catch (err) {
                return fail(`Failed to get organization info: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_education_qualifications',
        description: 'List all education qualification types.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/educations');
                const educations = normalizeCollection(response);
                return ok('Education qualifications fetched', { count: educations.length, educations });
            }
            catch (err) {
                return fail(`Failed to list education qualifications: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_skill_qualifications',
        description: 'List all skill qualification types.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/skills');
                const skills = normalizeCollection(response);
                return ok('Skill qualifications fetched', { count: skills.length, skills });
            }
            catch (err) {
                return fail(`Failed to list skill qualifications: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_license_qualifications',
        description: 'List all license qualification types.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/licenses');
                const licenses = normalizeCollection(response);
                return ok('License qualifications fetched', { count: licenses.length, licenses });
            }
            catch (err) {
                return fail(`Failed to list license qualifications: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_language_qualifications',
        description: 'List all language qualification types.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/languages');
                const languages = normalizeCollection(response);
                return ok('Language qualifications fetched', { count: languages.length, languages });
            }
            catch (err) {
                return fail(`Failed to list language qualifications: ${String(err)}`);
            }
        },
    },
    {
        name: 'list_membership_qualifications',
        description: 'List all membership qualification types.',
        handler: async () => {
            try {
                const response = await apiGet('/api/v2/admin/memberships');
                const memberships = normalizeCollection(response);
                return ok('Membership qualifications fetched', { count: memberships.length, memberships });
            }
            catch (err) {
                return fail(`Failed to list membership qualifications: ${String(err)}`);
            }
        },
    },
];
//# sourceMappingURL=adminReadTools.js.map