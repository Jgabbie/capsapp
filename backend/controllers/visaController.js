import VisaModel from "../models/visas.js";
import ServiceModel from "../models/service.js";
import UserModel from "../models/users.js";
import NotificationModel from "../models/notification.js";
import transporter from "../config/nodemailer.js";
import dayjs from "dayjs";
import logAction from "../utils/logger.js";
import { buildBrandedEmail } from "../utils/emailTemplate.js";

import {
  sendExpoPushNotification
} from "../utils/sendExpoPushNotification.js";


//send visa deadline warning function
export const createUserNotification = async ({
  userId,
  title,
  message,
  link = null,
  metadata = {},
}) => {
  const notification =
    await NotificationModel.create({
      userId,
      title,
      message,
      link,
      metadata,
      isRead: false,
    });

  try {
    const user = await UserModel.findById(
      userId
    ).select("expoPushTokens");

    await sendExpoPushNotification({
      tokens: user?.expoPushTokens || [],
      title,
      message,
      data: {
        notificationId:
          notification._id.toString(),
        link,
        routeState:
          metadata?.routeState || {},
      },
    });
  } catch (error) {
    // The notification remains saved even when push delivery
    // temporarily fails.
    console.error(
      "Push delivery error:",
      error.message
    );
  }

  return notification;
};

const PENALTY_AMOUNT = 1500;
const PENALTY_PAYMENT_WINDOW_DAYS = 1;
const SECOND_CHANCE_EXTENSION_DAYS = 3;

const VISA_STATUS_TOTAL_DAYS_MAP = {
  'Application Submitted': 2,
  'Application Approved': 4,
  'Payment Completed': 7,
  'Documents Uploaded': 12,
  'Documents Approved': 15,
  'Documents Received': 17,
  'Documents Submitted': 19,
  'Processing by Embassy': 19,
};

const VISA_STEPS_ORDER = [
  'Application Submitted',
  'Application Approved',
  'Payment Completed',
  'Documents Uploaded',
  'Documents Approved',
  'Documents Received',
  'Documents Submitted',
  'Processing by Embassy',
  'Embassy Approved',
  'DFA Approved',
  'Passport Released',
  'Rejected'
];


//build a map of visa status to total days from steps function
const buildVisaStatusTotalDaysMapFromSteps = (steps = []) => {
  const map = {};
  let total = 0;
  const trace = [];

  for (const step of steps) {
    const title = String(step?.title || '').trim();
    if (!title) continue;

    const days = Number(step?.daysToBeCompleted ?? 0);
    const safe = Number.isFinite(days) && days > 0 ? days : 0;

    total += safe;
    map[title] = total;
    trace.push({ title, daysToBeCompleted: safe, cumulativeDays: total });
  }

  return map;
};


//get visa process steps from application function
const getVisaProcessStepsFromApplication = (application) => {
  if (!application) return [];

  if (application.serviceId && typeof application.serviceId === 'object' && Array.isArray(application.serviceId.visaProcessSteps)) {
    return application.serviceId.visaProcessSteps;
  }

  return [];
};


//get visa document label function
const getVisaDocumentLabel = (application, documentKey) => {
  if (!documentKey) return 'the selected document';

  const visaRequirements = Array.isArray(application?.serviceId?.visaRequirements)
    ? application.serviceId.visaRequirements
    : [];

  const matchedRequirement = visaRequirements.find((req, idx) => {
    const key = req?.key || req?.req || req?.label || `Requirement ${idx + 1}`;
    return String(key).toLowerCase() === String(documentKey).toLowerCase();
  });

  if (matchedRequirement?.req) return matchedRequirement.req;
  if (matchedRequirement?.label) return matchedRequirement.label;

  return String(documentKey)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


const VISA_TERMINAL_STATUSES = new Set(['Documents Submitted', 'Processing by Embassy', 'Embassy Approved', 'DFA Approved', 'Passport Released', 'Rejected']);


//get current visa status function
const getCurrentVisaStatus = (application) => {
  if (!application) return '';

  if (Array.isArray(application.status)) {
    return String(application.status[application.status.length - 1] || '').trim();
  }

  return String(application.status || '').trim();
};


//normalize visa date function
const normalizeVisaDate = (value) => {
  if (!value) return null;

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.startOf('day') : null;
};


//get visa process steps from service function
const getVisaProcessStepsFromService = (application) => {
  if (!application) return [];

  if (application.serviceId && typeof application.serviceId === 'object' && Array.isArray(application.serviceId.visaProcessSteps)) {
    return application.serviceId.visaProcessSteps;
  }

  return [];
};


//build visa process steps for application function
export const buildProcessSteps = (application, serviceProcessSteps = []) => {
  const out = {};
  if (!application) return out;

  const preferredDate = normalizeVisaDate(application.preferredDate);
  const createdAt = normalizeVisaDate(application.createdAt) || dayjs().startOf('day');
  const steps = Array.isArray(serviceProcessSteps) ? serviceProcessSteps : [];

  let prevDeadline = null;

  for (const step of steps) {
    const stepTitle = String(step?.title || '').trim();
    if (!stepTitle) continue;

    const setDate = getVisaStatusSetDate(application, stepTitle) || (stepTitle === 'Application Submitted' ? createdAt : null);
    const deadlineDays = Number(step?.daysToBeCompleted ?? 0);

    let deadline = null;

    if (stepTitle === 'Processing by Embassy' && preferredDate) {
      deadline = preferredDate.startOf('day');
    } else if (Number.isFinite(deadlineDays) && deadlineDays > 0) {
      if (stepTitle === 'Application Submitted') {
        if (setDate) deadline = setDate.add(deadlineDays, 'day').startOf('day');
      } else if (prevDeadline) {
        deadline = prevDeadline.add(deadlineDays, 'day').startOf('day');
      } else if (setDate) {
        deadline = setDate.add(deadlineDays, 'day').startOf('day');
      } else if (preferredDate) {
        deadline = preferredDate.startOf('day').add(deadlineDays, 'day');
      }
    }

    if (deadline) prevDeadline = deadline;

    out[stepTitle] = {
      setDate: setDate ? setDate.format('YYYY-MM-DD') : null,
      deadlineDate: deadline ? deadline.format('YYYY-MM-DD') : null,
    };
  }

  return out;
};


//get visa status set date function
const getVisaStatusSetDate = (application, status) => {
  if (!application) return null;

  const history = Array.isArray(application.statusHistory) ? application.statusHistory : [];
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (!entry) continue;

    if (String(entry.status || '').trim().toLowerCase() === String(status || '').trim().toLowerCase() && entry.changedAt) {
      return dayjs(entry.changedAt).startOf('day');
    }
  }

  if (application.updatedAt) return dayjs(application.updatedAt).startOf('day');
  if (application.createdAt) return dayjs(application.createdAt).startOf('day');
  return null;
};


//get visa stored deadline date function
const getVisaStoredDeadlineDate = (application, status) => {
  if (!application || !status) return null;

  const normalizedStatus = String(status || '').trim();
  const processStep = application.processSteps && typeof application.processSteps === 'object'
    ? application.processSteps[normalizedStatus]
    : null;

  if (processStep?.deadlineDate) {
    const deadlineDate = normalizeVisaDate(processStep.deadlineDate);
    if (deadlineDate) {
      return deadlineDate;
    }
  }

  if (String(application.status || '').trim() === normalizedStatus && application.statusDeadlineDate) {
    const deadlineDate = normalizeVisaDate(application.statusDeadlineDate);
    if (deadlineDate) {
      return deadlineDate;
    }
  }

  return null;
};


//get visa penalty deadline date function
const getVisaPenaltyDeadlineDate = (application) => {
  if (!application) return null;

  const storedDeadline = normalizeVisaDate(application.penaltyDeadline);
  if (storedDeadline) {
    return storedDeadline;
  }

  const anchorDate = normalizeVisaDate(application.updatedAt) || normalizeVisaDate(application.createdAt);
  return anchorDate ? anchorDate.add(PENALTY_PAYMENT_WINDOW_DAYS, 'day').startOf('day') : null;
};


//get visa second chance deadline date function
const getVisaSecondChanceDeadlineDate = (application) => {
  if (!application) return null;

  if (application.secondDeadline) {
    return normalizeVisaDate(application.secondDeadline);
  }

  return dayjs().startOf('day').add(SECOND_CHANCE_EXTENSION_DAYS, 'day');
};


//sets visa application to second chance function
export const setVisaSecondChance = (application) => {
  if (!application) return application;

  const secondChanceDeadlineDate = getVisaSecondChanceDeadlineDate(application);

  if (secondChanceDeadlineDate) {
    application.secondChance = true;
    application.secondDeadline = secondChanceDeadlineDate.format('YYYY-MM-DD');
    application.processSteps = {
      ...(application.processSteps || {}),
      'Payment Completed': {
        ...((application.processSteps && application.processSteps['Payment Completed']) || {}),
        deadlineDate: secondChanceDeadlineDate.format('YYYY-MM-DD'),
      },
    };
    application.penaltyDeadline = '';

    if (typeof application.markModified === 'function') {
      application.markModified('processSteps');
    }
  }

  return application;
};


//get visa deadline info function
export const getVisaDeadlineInfo = (
  application,
  referenceDate = dayjs()
) => {
  if (!application) return null;

  const currentStatus =
    getCurrentVisaStatus(application);

  if (
    !currentStatus ||
    VISA_TERMINAL_STATUSES.has(currentStatus)
  ) {
    return null;
  }

  const processSteps = getVisaProcessStepsFromApplication(application);
  const computedDaysMap = buildVisaStatusTotalDaysMapFromSteps(processSteps);

  const currentDate = referenceDate.startOf('day');

  if (application.secondChance) {
    const deadlineDate = getVisaSecondChanceDeadlineDate(application);
    if (!deadlineDate) {
      return null;
    }
    const warningDate = deadlineDate.subtract(1, 'day').startOf('day');
    const daysRemaining = deadlineDate.diff(currentDate, 'day');
    const warningAlreadySent = Array.isArray(application.deadlineWarnings) && application.deadlineWarnings.some((warning) => (
      warning
      && warning.status === `${currentStatus}|SECOND_CHANCE`
      && warning.deadlineDate === deadlineDate.format('YYYY-MM-DD')
    ));

    return {
      status: currentStatus,
      totalDays: SECOND_CHANCE_EXTENSION_DAYS,
      deadlineDays: SECOND_CHANCE_EXTENSION_DAYS,
      statusDeadlineMap: computedDaysMap,
      deadlineDate,
      warningDate,
      daysRemaining,
      warningAlreadySent,
      shouldSendWarning: false,
      isOverdue: daysRemaining < 0,
    };
  }

  if (application.onPenalty) {
    const deadlineDate = getVisaPenaltyDeadlineDate(application);
    if (!deadlineDate) {
      return null;
    }
    const warningDate = deadlineDate.subtract(1, 'day').startOf('day');
    const daysRemaining = deadlineDate.diff(currentDate, 'day');
    const warningAlreadySent = Array.isArray(application.deadlineWarnings) && application.deadlineWarnings.some((warning) => (
      warning
      && warning.status === `${currentStatus}|PENALTY`
      && warning.deadlineDate === deadlineDate.format('YYYY-MM-DD')
    ));

    return {
      status: currentStatus,
      totalDays: PENALTY_PAYMENT_WINDOW_DAYS,
      deadlineDays: PENALTY_PAYMENT_WINDOW_DAYS,
      statusDeadlineMap: computedDaysMap,
      deadlineDate,
      warningDate,
      daysRemaining,
      warningAlreadySent,
      shouldSendWarning: false,
      isOverdue: daysRemaining < 0,
    };
  }

  const storedDeadlineDate = getVisaStoredDeadlineDate(application, currentStatus);
  if (storedDeadlineDate) {
    const warningDate = storedDeadlineDate.subtract(1, 'day').startOf('day');
    const daysRemaining = storedDeadlineDate.diff(currentDate, 'day');
    const warningAlreadySent = Array.isArray(application.deadlineWarnings) && application.deadlineWarnings.some((warning) => (
      warning
      && warning.status === currentStatus
      && warning.deadlineDate === storedDeadlineDate.format('YYYY-MM-DD')
    ));

    return {
      status: currentStatus,
      totalDays: computedDaysMap[currentStatus] ?? VISA_STATUS_TOTAL_DAYS_MAP[currentStatus] ?? null,
      deadlineDays: computedDaysMap[currentStatus] ?? VISA_STATUS_TOTAL_DAYS_MAP[currentStatus] ?? null,
      statusDeadlineMap: computedDaysMap,
      deadlineDate: storedDeadlineDate,
      warningDate,
      daysRemaining,
      warningAlreadySent,
      shouldSendWarning: daysRemaining === 1 && !warningAlreadySent,
      isOverdue: daysRemaining < 0,
    };
  }

  const totalDays = Number.isFinite(computedDaysMap[currentStatus])
    ? computedDaysMap[currentStatus]
    : VISA_STATUS_TOTAL_DAYS_MAP[currentStatus];

  if (!Number.isFinite(totalDays)) {
    return null;
  }

  // ONLY USE CREATED AT
  const baseDate = dayjs(application.createdAt)
    .startOf('day');

  const deadlineDate = baseDate
    .add(totalDays, 'day')
    .startOf('day');

  const warningDate = deadlineDate
    .subtract(1, 'day')
    .startOf('day');

  const currentDateToday =
    referenceDate.startOf('day');

  const daysRemaining =
    deadlineDate.diff(currentDateToday, 'day');

  const warningAlreadySent =
    Array.isArray(application.deadlineWarnings) &&
    application.deadlineWarnings.some(
      (warning) =>
        warning &&
        warning.status === currentStatus &&
        warning.deadlineDate ===
        deadlineDate.format('YYYY-MM-DD')
    );

  return {
    status: currentStatus,
    totalDays,
    deadlineDays: totalDays,
    statusDeadlineMap: computedDaysMap,
    deadlineDate,
    warningDate,
    daysRemaining,
    warningAlreadySent,
    shouldSendWarning:
      daysRemaining === 1 &&
      !warningAlreadySent,
    isOverdue: daysRemaining < 0,
  };
};


//get visa deadline info function
export const decorateVisaApplication = (application) => {
  if (!application) return application;

  const plainApplication = typeof application.toObject === 'function'
    ? application.toObject()
    : { ...application };

  const deadlineInfo = getVisaDeadlineInfo(plainApplication);
  const statusText = getCurrentVisaStatus(plainApplication);
  const processSteps = plainApplication.processSteps || buildProcessSteps(plainApplication, getVisaProcessStepsFromApplication(plainApplication));

  return {
    ...plainApplication,
    status: statusText || plainApplication.status,
    processSteps,
    statusDeadlineDate: deadlineInfo ? deadlineInfo.deadlineDate.toISOString() : null,
    statusDeadlineDays: deadlineInfo ? deadlineInfo.deadlineDays : null,
    visaStatusTotalDaysMap: deadlineInfo ? deadlineInfo.statusDeadlineMap : buildVisaStatusTotalDaysMapFromSteps(getVisaProcessStepsFromApplication(plainApplication)),
    statusDeadlineWarningDate: deadlineInfo ? deadlineInfo.warningDate.toISOString() : null,
    statusDeadlineDaysRemaining: deadlineInfo ? deadlineInfo.daysRemaining : null,
    statusDeadlineWarningSent: deadlineInfo ? deadlineInfo.warningAlreadySent : false,
  };
};


//get visa deadline info function
export const sendVisaDeadlineWarning = async (application) => {
  if (application?.onPenalty || application?.secondChance) {
    return { sent: false, application };
  }

  const deadlineInfo = getVisaDeadlineInfo(application);
  if (!deadlineInfo || !deadlineInfo.shouldSendWarning) {
    return { sent: false, application };
  }

  const populatedUser = application.userId && typeof application.userId === 'object' ? application.userId : null;
  const userId = populatedUser?._id || application.userId;
  const user = populatedUser && populatedUser.email
    ? populatedUser
    : await UserModel.findById(userId).select('email username firstname lastname');

  if (!user || !user.email) {
    return { sent: false, application };
  }

  const applicationNumber = application.applicationNumber || 'your visa application';
  const displayName = user.firstname || user.username || 'Customer';
  const deadlineLabel = deadlineInfo.deadlineDate.format('MMMM DD, YYYY');
  const statusLabel = deadlineInfo.status;

  await createUserNotification({
    userId: user._id,
    title: 'Visa Deadline Reminder',
    message: `One day remains to complete ${statusLabel} for ${applicationNumber}. The deadline is ${deadlineLabel}.`,
    type: 'visa-deadline-reminder',
    link: '/user-applications',
    metadata: {
      applicationId: application._id,
      applicationNumber,
      status: statusLabel,
      deadlineDate: deadlineInfo.deadlineDate.format('YYYY-MM-DD'),
    }
  });

  await transporter.sendMail({
    from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: `Visa Deadline Reminder: ${statusLabel} due ${deadlineLabel}`,
    html: `
            <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">
                    <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                    <h2 style="color:#305797;">Visa Deadline Reminder</h2>
                    <p style="color:#555; font-size:16px;">Hello <b>${displayName}</b>,</p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">One day remains to complete <b>${statusLabel}</b> for your visa application <b>${applicationNumber}</b>.</p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Deadline: <b>${deadlineLabel}</b></p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Please log in and finish the required step to keep your application on track.</p>

                    <a href="https://mrctravelandtours.com/home"
                        style="display:inline-block; margin-top:26px; padding:12px 24px; background:#305797; color:#ffffff; text-decoration:none; border-radius:999px; font-size:12px; letter-spacing:1.8px; font-weight:700; text-transform:uppercase;">
                        Login to Your Account
                    </a>

                    <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
                    <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                        <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                        <p>M&RC Travel and Tours</p>
                        <p>info1@mrctravels.com</p>
                        <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `,
  });

  application.deadlineWarnings = application.deadlineWarnings || [];
  application.deadlineWarnings.push({
    status: deadlineInfo.status,
    deadlineDate: deadlineInfo.deadlineDate.format('YYYY-MM-DD'),
    warnedAt: new Date(),
  });

  if (typeof application.save === 'function') {
    await application.save();
  }

  return { sent: true, application };
};


//append visa status history function
const appendVisaStatusHistory = (application, status, changedBy, changedByName) => {
  if (!application) return;

  const normalizedStatus = String(status || '').trim();
  if (!normalizedStatus) return;

  application.statusHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];
  application.statusHistory.push({
    status: normalizedStatus,
    changedAt: new Date(),
    changedBy: changedBy || undefined,
    changedByName: changedByName || undefined,
  });
};


//send visa penalty notification function
const sendVisaPenaltyNotification = async (application, deadlineInfo) => {
  if (!application || !deadlineInfo) {
    return { sent: false, application };
  }

  const populatedUser = application.userId && typeof application.userId === 'object' ? application.userId : null;
  const userId = populatedUser?._id || application.userId;
  const user = populatedUser && populatedUser.email
    ? populatedUser
    : await UserModel.findById(userId).select('email username firstname lastname');

  if (!user || !user.email) {
    return { sent: false, application };
  }

  const applicationNumber = application.applicationNumber || 'your visa application';
  const displayName = user.firstname || user.username || 'Customer';
  const deadlineLabel = deadlineInfo.deadlineDate.format('MMMM DD, YYYY');

  await createUserNotification({
    userId: user._id,
    title: 'Visa Application On Penalty',
    message: `Your visa application ${applicationNumber} is now on penalty. Please pay PHP ${PENALTY_AMOUNT.toLocaleString('en-PH')} within 1 day.`,
    type: 'visa-penalty',
    link: '/user-applications',
    metadata: {
      applicationId: application._id,
      applicationNumber,
      status: deadlineInfo.status,
      penaltyAmount: PENALTY_AMOUNT,
      deadlineDate: deadlineInfo.deadlineDate.format('YYYY-MM-DD'),
    }
  });

  await transporter.sendMail({
    from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: `Visa Application On Penalty: ${applicationNumber}`,
    html: `
            <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">
                    <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                    <h2 style="color:#305797;">Visa Application On Penalty</h2>
                    <p style="color:#555; font-size:16px;">Hello <b>${displayName}</b>,</p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Your visa application <b>${applicationNumber}</b> is on penalty because <b>${deadlineInfo.status}</b> was not completed on time.</p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Penalty fee: <b>PHP ${PENALTY_AMOUNT.toLocaleString('en-PH')}</b></p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Pay within <b>1 day</b> to avoid rejection. Deadline: <b>${deadlineLabel}</b></p>

                    <a href="https://mrctravelandtours.com/home"
                        style="display:inline-block; margin-top:26px; padding:12px 24px; background:#305797; color:#ffffff; text-decoration:none; border-radius:999px; font-size:12px; letter-spacing:1.8px; font-weight:700; text-transform:uppercase;">
                        Login to Your Account
                    </a>

                    <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
                    <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                        <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                        <p>M&RC Travel and Tours</p>
                        <p>info1@mrctravels.com</p>
                        <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `,
  });

  return { sent: true, application };
};


//reject visa application for deadline function
export const rejectVisaApplicationForDeadline = async (application, deadlineInfo, reachedSecondDeadline = false) => {
  if (!application) {
    return { rejected: false, application };
  }

  const currentStatus = getCurrentVisaStatus(application);
  if (!currentStatus || VISA_TERMINAL_STATUSES.has(currentStatus) || currentStatus === 'Rejected') {
    return { rejected: false, application };
  }

  const resolvedDeadlineInfo = deadlineInfo || getVisaDeadlineInfo(application);
  if (!resolvedDeadlineInfo || !resolvedDeadlineInfo.isOverdue) {
    return { rejected: false, application };
  }

  const populatedUser = application.userId && typeof application.userId === 'object' ? application.userId : null;
  const userId = populatedUser?._id || application.userId;
  const user = populatedUser && populatedUser.email
    ? populatedUser
    : await UserModel.findById(userId).select('email username firstname lastname');

  appendVisaStatusHistory(application, 'Rejected', null, 'System Auto-Rejection');
  application.status = 'Rejected';
  application.reachedSecondDeadline = Boolean(reachedSecondDeadline);

  if (typeof application.save === 'function') {
    await application.save();
  }

  const applicationNumber = application.applicationNumber || 'your visa application';
  const displayName = user?.firstname || user?.username || 'Customer';
  const deadlineLabel = resolvedDeadlineInfo.deadlineDate.format('MMMM DD, YYYY');

  if (user && user._id) {
    await createUserNotification({
      userId: user._id,
      title: 'Visa Application Automatically Rejected',
      message: reachedSecondDeadline
        ? `Your visa application ${applicationNumber} was automatically rejected because the extra 3-day period after paying the penalty expired.`
        : `Your visa application ${applicationNumber} was automatically rejected because the penalty fee was not paid within 1 day.`,
      type: 'visa',
      link: '/user-applications',
      metadata: {
        applicationId: application._id,
        applicationNumber,
        status: 'Rejected',
        rejectedForStatus: resolvedDeadlineInfo.status,
        deadlineDate: resolvedDeadlineInfo.deadlineDate.format('YYYY-MM-DD'),
        reachedSecondDeadline: Boolean(reachedSecondDeadline),
      }
    });
  }

  if (user && user.email) {
    try {
      await transporter.sendMail({
        from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Visa Application Automatically Rejected: ${applicationNumber}`,
        html: `
                    <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">
                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797;">Visa Application Automatically Rejected</h2>
                            <p style="color:#555; font-size:16px;">Hello <b>${displayName}</b>,</p>
                            <p style="color:#555; font-size:15px; line-height:1.6;">Your visa application <b>${applicationNumber}</b> was automatically rejected because ${reachedSecondDeadline ? 'the extra 3-day period after penalty payment expired' : 'the penalty fee was not paid within 1 day'}.</p>
                            <p style="color:#555; font-size:15px; line-height:1.6;">Please contact our office if you need assistance or wish to submit a new application.</p>

                            <a href="https://mrctravelandtours.com/home"
                                style="display:inline-block; margin-top:26px; padding:12px 24px; background:#305797; color:#ffffff; text-decoration:none; border-radius:999px; font-size:12px; letter-spacing:1.8px; font-weight:700; text-transform:uppercase;">
                                Login to Your Account
                            </a>

                            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
                            <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                                <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                                <p>M&RC Travel and Tours</p>
                                <p>info1@mrctravels.com</p>
                                <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `,
      });
    } catch (emailError) {
      console.error('Failed to send visa auto-rejection email:', emailError);
    }
  }

  return { rejected: true, application };
};


//mark visa application on penalty function
const markVisaApplicationOnPenalty = async (application, deadlineInfo = null) => {
  if (!application) {
    return { penalized: false, application };
  }

  if (application.onPenalty || application.secondChance || String(application.status || '').trim() === 'Rejected') {
    return { penalized: false, application };
  }

  const resolvedDeadlineInfo = deadlineInfo || getVisaDeadlineInfo(application);
  if (!resolvedDeadlineInfo || !resolvedDeadlineInfo.isOverdue) {
    return { penalized: false, application };
  }

  const penaltyDeadlineDate = getVisaPenaltyDeadlineDate(application);
  const deadlineKey = penaltyDeadlineDate.format('YYYY-MM-DD');

  application.onPenalty = true;
  application.secondChance = false;
  application.reachedSecondDeadline = false;
  application.penaltyDeadline = deadlineKey;
  application.deadlineWarnings = Array.isArray(application.deadlineWarnings) ? application.deadlineWarnings : [];

  const alreadyRecorded = application.deadlineWarnings.some((warning) => (
    warning
    && warning.status === `Penalty:${resolvedDeadlineInfo.status}`
    && warning.deadlineDate === deadlineKey
  ));

  if (!alreadyRecorded) {
    application.deadlineWarnings.push({
      status: `Penalty:${resolvedDeadlineInfo.status}`,
      deadlineDate: deadlineKey,
      warnedAt: new Date(),
    });
  }

  if (typeof application.save === 'function') {
    await application.save();
  }

  await sendVisaPenaltyNotification(application, {
    ...resolvedDeadlineInfo,
    deadlineDate: penaltyDeadlineDate,
  });

  return { penalized: true, application };
};


//process visa deadline action function
export const processVisaDeadlineAction = async (application) => {
  const deadlineInfo = getVisaDeadlineInfo(application);
  if (!deadlineInfo) {
    return { application, warned: false, rejected: false };
  }

  const currentStatus = String(getCurrentVisaStatus(application) || '').trim();
  const isPaymentCompleted = currentStatus.toLowerCase() === 'payment completed';

  if (deadlineInfo.isOverdue) {
    if (application?.secondChance && isPaymentCompleted) {
      return rejectVisaApplicationForDeadline(application, deadlineInfo, true);
    }

    if (application?.onPenalty) {
      return rejectVisaApplicationForDeadline(application, deadlineInfo, false);
    }

    return markVisaApplicationOnPenalty(application, deadlineInfo);
  }

  if (deadlineInfo.shouldSendWarning) {
    const warningResult = await sendVisaDeadlineWarning(application);
    return { ...warningResult, warned: true, rejected: false };
  }

  return { application, warned: false, rejected: false };
};


//generate visa application number function
const generateApplicationNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APP-VISA-${timestamp}${random}`
}


//apply for visa function
const applyVisa = async (req, res) => {
  const { serviceId, preferredDate, preferredTime, purposeOfTravel } = req.body;
  const userId = req.userId;

  if (!serviceId || !preferredDate || !preferredTime || !purposeOfTravel) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await UserModel.findById(userId).select("firstname lastname username");
    const service = await ServiceModel.findById(serviceId).select("visaName visaProcessSteps");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const applicantName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;

    const newApplication = await VisaModel.create({
      userId,
      serviceId,
      serviceName: service.visaName,
      applicantName,
      preferredDate,
      preferredTime,
      purposeOfTravel,
      applicationNumber: generateApplicationNumber(),
      status: ["Application Submitted"],
      currentStepIndex: 0,
      submittedDocuments: {}, // Empty, just like passport
      documents: {}
    });

    try {
      newApplication.processSteps = buildProcessSteps(newApplication, service.visaProcessSteps);
      await newApplication.save();
    } catch (processStepsError) {
      console.error('Failed to build/persist visa processSteps:', processStepsError);
    }

    logAction('VISA_APPLICATION_SUBMITTED', userId, { "Application Number": newApplication.applicationNumber });
    return res.status(201).json(newApplication);
  } catch (error) {
    return res.status(500).json({ message: "Error applying for visa", error: error.message });
  }
};


//get user visa applications function
const getUserVisaApplications = async (req, res) => {
  try {
    const userId = req.userId;
    const applications = await VisaModel.find({ userId })
      .populate("serviceId")
      .sort({ createdAt: -1 });
    // Decorate each application with deadline info so client doesn't need fallbacks
    const decorated = await Promise.all(applications.map((app) => decorateVisaApplication(app)));
    res.status(200).json(decorated);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user visa applications", error: error.message });
  }
};


//get visa application by ID function
const getVisaApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await VisaModel.findById(id)
      .populate("userId", "firstname lastname username")
      .populate("serviceId")
      .populate('statusHistory.changedBy', 'firstname lastname username');
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }


    // Decorate with deadline info
    const decorated = await decorateVisaApplication(application);
    res.status(200).json(decorated);
  } catch (error) {
    res.status(500).json({ message: "Error fetching visa application", error: error.message });
  }
};


//choose appointment function
const chooseAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  try {
    if (!date || !time) {
      return res.status(400).json({ message: "Chosen appointment date and time are required" });
    }

    const application = await VisaModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }

    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this application" });
    }

    application.preferredDate = date;
    application.preferredTime = time;
    application.suggestedAppointmentScheduleChosen = {
      date,
      time
    };

    await application.save();

    logAction('VISA_APPOINTMENT_CHOSEN', req.userId, {
      "Visa Application Updated": `Application Number: ${application.applicationNumber}`,
      "Date": date,
      "Time": time
    });


    // Rebuild processSteps since preferredDate changed (affects deadlines)
    try {
      const serviceDoc = await ServiceModel.findById(application.serviceId).select('visaProcessSteps');
      if (serviceDoc) {
        application.processSteps = buildProcessSteps(application, serviceDoc.visaProcessSteps);
        await application.save();
      }
    } catch (e) {
      console.error('Failed to rebuild/persist processSteps after chooseAppointment:', e);
    }

    return res.status(200).json({
      message: "Preferred schedule updated successfully",
      application
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating schedule", error: error.message });
  }
};


//update visa application with documents function
const updateVisaApplicationWithDocs = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { preferredDate, preferredTime, purposeOfTravel, submittedDocuments } = req.body;

    const application = await VisaModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }

    if (application.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to update this application" });
    }

    application.preferredDate = preferredDate || application.preferredDate;
    application.preferredTime = preferredTime || application.preferredTime;
    application.purposeOfTravel = purposeOfTravel || application.purposeOfTravel;
    application.submittedDocuments = {
      ...(application.submittedDocuments || {}),
      ...(submittedDocuments || {})
    };
    application.status = ["Documents Uploaded"];
    application.currentStepIndex = Math.max(application.currentStepIndex || 0, 3);


    try {
      const serviceDoc = await ServiceModel.findById(application.serviceId).select('visaProcessSteps');
      application.processSteps = buildProcessSteps(application, serviceDoc.visaProcessSteps);
      await application.save();
    } catch (processStepsError) {
      console.error('Failed to build/persist visa processSteps:', processStepsError);
    }

    await application.save();


    logAction('VISA_DOCUMENTS_UPLOADED', userId, { "Documents Uploaded": `Application Number: ${application.applicationNumber}` });


    res.status(200).json({
      message: "Visa application updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating visa application", error: error.message });
  }
};


//update passport release option function
const passportReleaseOption = async (req, res) => {
  const { id } = req.params;
  const { option, deliveryAddress } = req.body;

  try {
    if (!option) {
      return res.status(400).json({ message: "Passport release option is required" });
    }

    const application = await VisaModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }

    application.passportReleaseOption = option;
    application.deliveryAddress = deliveryAddress || application.deliveryAddress;

    application.status = "Passport Released"
    await application.save();

    res.status(200).json({
      message: "Passport release option updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating passport release option", error: error.message });
  }
}

export {
  applyVisa,
  getUserVisaApplications,
  getVisaApplicationById,
  chooseAppointment,
  updateVisaApplicationWithDocs,
  passportReleaseOption
};