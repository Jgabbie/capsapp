export const buildVisaStatusTotalDaysMapFromSteps = (steps = []) => {
    const cumulativeMap = {};
    let runningTotal = 0;

    for (const step of steps) {
        const title = typeof step === 'string' ? step : String(step?.title || '').trim();
        if (!title) continue;

        const rawDays = typeof step === 'object' && step !== null
            ? (step.daysToBeCompleted ?? step.days ?? 0)
            : 0;
        const parsedDays = Number(rawDays);
        const safeDays = Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 0;

        runningTotal += safeDays;
        cumulativeMap[title] = runningTotal;
    }

    return cumulativeMap;
};