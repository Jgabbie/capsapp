import Log from '../models/log.js';
import Audit from '../models/audit.js';

const auditExcludedActions = new Set([
    'CUSTOMER_LOGIN',
    'ADMIN_LOGIN',
    'EMPLOYEE_LOGIN',
    'CUSTOMER_LOGOUT',
    'ADMIN_LOGOUT',
    'EMPLOYEE_LOGOUT',
    'LOGIN_FAILED'
]);

const logIncludedActionsOnly = new Set([
    'CUSTOMER_LOGIN',
    'ADMIN_LOGIN',
    'EMPLOYEE_LOGIN',
    'LOGIN_FAILED',
    'CUSTOMER_LOGOUT',
    'ADMIN_LOGOUT',
    'EMPLOYEE_LOGOUT',
]);

const logAction = async (action, userId, details = {}) => {
    const logPayload = {
        action,
        performedBy: userId,
        details,
    };

    try {
        // Save to Logs collection if it's a login/logout event
        if (logIncludedActionsOnly.has(action)) {
            await Log.create(logPayload);
        }

        // Save to Audit collection if it's a major system action
        if (!auditExcludedActions.has(action)) {
            await Audit.create(logPayload);
        }

    } catch (error) {
        console.error("Failed to create audit/log:", error);
    }
};

export default logAction;