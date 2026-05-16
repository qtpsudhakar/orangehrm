import {ModelContextAgent} from './modelContext.types';
import {fail, ok} from './toolResponse';

export const isWebMcpEnabled = (): boolean => {
  const flag = localStorage.getItem('WEBMCP_ENABLED');
  return flag !== 'false';
};

export const ensurePermission = (allowed = true) => {
  if (!allowed) {
    return fail('Permission denied for this tool', 'WEBMCP_FORBIDDEN');
  }
  return null;
};

export const getCurrentWebMcpRole = (): string => {
  const roleFromStorage = localStorage.getItem('WEBMCP_ROLE');
  if (roleFromStorage) {
    return roleFromStorage.toLowerCase();
  }

  const roleFromGlobal = (
    window.appGlobal as {webmcpRole?: string; userRole?: string}
  ).webmcpRole;
  if (roleFromGlobal) {
    return roleFromGlobal.toLowerCase();
  }

  return 'admin';
};

export const ensureRoleAllowed = (allowedRoles: string[]) => {
  const currentRole = getCurrentWebMcpRole();
  if (!allowedRoles.map((role) => role.toLowerCase()).includes(currentRole)) {
    return fail(
      `Role '${currentRole}' is not allowed for this tool`,
      'WEBMCP_FORBIDDEN',
    );
  }
  return null;
};

export const requestConfirmation = async (
  agent: ModelContextAgent | undefined,
  message: string,
) => {
  if (agent?.requestUserInteraction) {
    const confirmed = await agent.requestUserInteraction(async () =>
      Promise.resolve(window.confirm(message)),
    );
    return confirmed
      ? ok('Confirmed')
      : fail('Action cancelled', 'WEBMCP_CANCELLED');
  }

  const confirmed = window.confirm(message);
  return confirmed
    ? ok('Confirmed')
    : fail('Action cancelled', 'WEBMCP_CANCELLED');
};
