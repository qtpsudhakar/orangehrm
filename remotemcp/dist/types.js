// Shared type definitions for OrangeHRM RemoteMCP layer
export const ok = (message, data) => ({
    success: true,
    message,
    data,
});
export const fail = (message, errorCode = 'REMOTEMCP_ERROR') => ({
    success: false,
    message,
    errorCode,
});
//# sourceMappingURL=types.js.map