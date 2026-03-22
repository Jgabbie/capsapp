const logAction = (actionType, userId, details = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ACTION: ${actionType} | USER: ${userId} | DETAILS:`, JSON.stringify(details));
};

export default logAction;