import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://recommendationtravex.onrender.com';
const RETRAIN_DEBOUNCE_MS = Number(process.env.RECOMMEND_RETRAIN_DEBOUNCE_MS || 15000);
const RETRAIN_TIMEOUT_MS = Number(process.env.RECOMMEND_RETRAIN_TIMEOUT_MS || 20000);

let retrainTimer = null;
let inFlight = false;
let shouldRerun = false;
const pendingReasons = new Set();

const triggerRetrain = async () => {
    if (inFlight) {
        shouldRerun = true;
        return;
    }

    inFlight = true;
    const reasons = Array.from(pendingReasons);
    pendingReasons.clear();

    try {
        await axios.post(`${AI_SERVICE_URL}/train`, {}, { timeout: RETRAIN_TIMEOUT_MS });
        console.log(`[AI Retrain] Training triggered successfully. Reasons: ${reasons.join(', ') || 'n/a'}`);
    } catch (error) {
        const details = error?.response?.data || error.message;
        console.error(`[AI Retrain] Training trigger failed. Reasons: ${reasons.join(', ') || 'n/a'}`, details);
    } finally {
        inFlight = false;
        if (shouldRerun) {
            shouldRerun = false;
            scheduleRetrain('queued-follow-up');
        }
    }
};

export const scheduleRetrain = (reason = 'unspecified-change') => {
    pendingReasons.add(String(reason));

    if (retrainTimer) {
        clearTimeout(retrainTimer);
    }

    retrainTimer = setTimeout(() => {
        retrainTimer = null;
        triggerRetrain();
    }, RETRAIN_DEBOUNCE_MS);
};
