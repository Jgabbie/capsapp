import PassportModel from "../models/passport.js";
import UserModel from "../models/users.js";
import NotificationModel from "../models/notification.js";
import transporter from "../config/nodemailer.js";
import dayjs from "dayjs";
import logAction from "../utils/logger.js";
import { buildBrandedEmail } from "../utils/emailTemplate.js";


import {
  sendExpoPushNotification
} from "../utils/sendExpoPushNotification.js";

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

const PASSPORT_STATUS_DEADLINE_DAYS_MAP = {
  'Payment Completed': 5,
};

const PASSPORT_TERMINAL_STATUSES = new Set(['DFA Approved', 'Passport Released', 'Rejected']);


//NORMALIZE DATE TO START OF DAY
const normalizePassportDate = (value) => {
  if (!value) return null;

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.startOf('day') : null;
};

// Return the day the given status was set on the application (startOf day).
// Falls back to updatedAt or createdAt when no explicit history entry exists.
//GET THE STATUS SET DATE FROM THE APPLICATION
const getStatusSetDateFromApplication = (application, status) => {
  if (!application) return null;
  const history = Array.isArray(application.statusHistory) ? application.statusHistory : [];
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (!entry) continue;
    if (String(entry.status || '').trim() === String(status || '').trim() && entry.changedAt) {
      return dayjs(entry.changedAt).startOf('day');
    }
  }
  if (application.updatedAt) return dayjs(application.updatedAt).startOf('day');
  if (application.createdAt) return dayjs(application.createdAt).startOf('day');
  return null;
};


//GETS THE STORED DEADLINE DATE FOR A PASSPORT APPLICATION STATUS
const getPassportStoredDeadlineDate = (application, status) => {
  if (!application || !status) return null;

  const normalizedStatus = String(status || '').trim();
  const processStep = application.processSteps && typeof application.processSteps === 'object'
    ? application.processSteps[normalizedStatus]
    : null;

  if (processStep?.deadlineDate) {
    const deadlineDate = normalizePassportDate(processStep.deadlineDate);
    if (deadlineDate) {
      return deadlineDate;
    }
  }

  if (String(application.status || '').trim() === normalizedStatus && application.statusDeadlineDate) {
    const deadlineDate = normalizePassportDate(application.statusDeadlineDate);
    if (deadlineDate) {
      return deadlineDate;
    }
  }

  return null;
};


//MAIN FUNCTION TO GET THE DEADLINE INFO FOR A PASSPORT APPLICATION
export const getPassportDeadlineInfo = (application, referenceDate = dayjs()) => {
  if (!application) return null;

  const status = String(application.status || '').trim();
  if (!status || PASSPORT_TERMINAL_STATUSES.has(status)) return null;

  const currentDate = referenceDate.startOf('day');

  if (application.secondChance) {
    const deadlineDate = getPassportSecondChanceDeadlineDate(application);
    if (!deadlineDate) return null;

    const warningDate = deadlineDate.subtract(1, 'day').startOf('day');
    const daysRemaining = deadlineDate.diff(currentDate, 'day');
    const warningAlreadySent = Array.isArray(application.deadlineWarnings)
      && application.deadlineWarnings.some((warning) => (
        warning
        && warning.status === `${status}|SECOND_CHANCE`
        && warning.deadlineDate === deadlineDate.format('YYYY-MM-DD')
      ));

    return {
      status,
      deadlineDays: SECOND_CHANCE_EXTENSION_DAYS,
      preferredDate: normalizePassportDate(application.preferredDate),
      deadlineDate,
      warningDate,
      warningKey: `${status}|SECOND_CHANCE|${deadlineDate.format('YYYY-MM-DD')}`,
      daysRemaining,
      warningAlreadySent,
      shouldSendWarning: false,
      isOverdue: daysRemaining < 0,
    };
  }

  if (application.onPenalty) {
    const deadlineDate = getPassportPenaltyDeadlineDate(application);
    if (!deadlineDate) return null;

    const warningDate = deadlineDate.subtract(1, 'day').startOf('day');
    const daysRemaining = deadlineDate.diff(currentDate, 'day');
    const warningAlreadySent = Array.isArray(application.deadlineWarnings)
      && application.deadlineWarnings.some((warning) => (
        warning
        && warning.status === `${status}|PENALTY`
        && warning.deadlineDate === deadlineDate.format('YYYY-MM-DD')
      ));

    return {
      status,
      deadlineDays: PENALTY_PAYMENT_WINDOW_DAYS,
      preferredDate: normalizePassportDate(application.preferredDate),
      deadlineDate,
      warningDate,
      warningKey: `${status}|PENALTY|${deadlineDate.format('YYYY-MM-DD')}`,
      daysRemaining,
      warningAlreadySent,
      shouldSendWarning: false,
      isOverdue: daysRemaining < 0,
    };
  }

  // Special-case: if the status is 'Documents Submitted' and the applicant (user)
  // is the one who completed that status, do not create a deadline or warning.
  // This interprets "user complete the status" by checking the most recent
  // statusHistory entry for 'Documents Submitted' and comparing changedBy
  // to the application.userId.
  if (status === 'Documents Submitted') {
    try {
      const userIdStr = application.userId && typeof application.userId === 'object'
        ? String(application.userId._id || application.userId)
        : String(application.userId);
      const history = Array.isArray(application.statusHistory) ? application.statusHistory : [];
      for (let i = history.length - 1; i >= 0; i--) {
        const entry = history[i];
        if (!entry) continue;
        if (String(entry.status) === 'Documents Submitted') {
          const changedBy = entry.changedBy;
          const changedByStr = changedBy && typeof changedBy === 'object'
            ? String(changedBy._id || changedBy)
            : String(changedBy);
          if (userIdStr && changedByStr && userIdStr === changedByStr) {
            return null; // user completed it — no timer
          }
          break; // found entry but not completed by user -> continue with normal deadline
        }
      }
    } catch (e) {
      // if any error occurs while inspecting history, fall through to normal logic
    }
  }

  const storedDeadlineDate = getPassportStoredDeadlineDate(application, status);
  if (storedDeadlineDate) {
    const warningDate = storedDeadlineDate.subtract(1, 'day').startOf('day');
    const daysRemaining = storedDeadlineDate.diff(currentDate, 'day');
    const warningAlreadySent = Array.isArray(application.deadlineWarnings)
      && application.deadlineWarnings.some((warning) => (
        warning
        && warning.status === status
        && warning.deadlineDate === storedDeadlineDate.format('YYYY-MM-DD')
      ));

    return {
      status,
      deadlineDays: PASSPORT_STATUS_DEADLINE_DAYS_MAP[status] ?? null,
      preferredDate: normalizePassportDate(application.preferredDate),
      deadlineDate: storedDeadlineDate,
      warningDate,
      warningKey: `${status}|${storedDeadlineDate.format('YYYY-MM-DD')}`,
      daysRemaining,
      warningAlreadySent,
      shouldSendWarning: daysRemaining === 1 && !warningAlreadySent,
      isOverdue: daysRemaining < 0,
    };
  }

  const deadlineDays = PASSPORT_STATUS_DEADLINE_DAYS_MAP[status];
  if (!Number.isFinite(deadlineDays)) return null;

  const preferredDate = normalizePassportDate(application.preferredDate);

  // Determine deadline anchor:
  // - For 'Processing by DFA' (or any mapping explicitly set to 0) we anchor to the appointment (`preferredDate`).
  // - Otherwise the deadline is relative to when the status was set (statusHistory.changedAt),
  //   i.e. deadline = statusSetDate + deadlineDays.
  let deadlineDate = null;
  if ((status === 'Processing by DFA' || deadlineDays === 0) && preferredDate) {
    deadlineDate = preferredDate.startOf('day');
  } else {
    const statusSetDate = getStatusSetDateFromApplication(application, status);
    if (!statusSetDate) return null;
    deadlineDate = statusSetDate.add(deadlineDays, 'day').startOf('day');
  }
  const warningDate = deadlineDate.subtract(1, 'day').startOf('day');
  const currentDateToday = referenceDate.startOf('day');
  const daysRemaining = deadlineDate.diff(currentDateToday, 'day');
  const warningKey = `${status}|${deadlineDate.format('YYYY-MM-DD')}`;
  const warningAlreadySent = Array.isArray(application.deadlineWarnings)
    && application.deadlineWarnings.some((warning) => (
      warning
      && warning.status === status
      && warning.deadlineDate === deadlineDate.format('YYYY-MM-DD')
    ));

  return {
    status,
    deadlineDays,
    preferredDate,
    deadlineDate,
    warningDate,
    warningKey,
    daysRemaining,
    warningAlreadySent,
    shouldSendWarning: daysRemaining === 1 && !warningAlreadySent,
    isOverdue: daysRemaining < 0,
  };
};


//
const getPassportPenaltyDeadlineDate = (application) => {
  if (!application) return null;

  const storedDeadline = normalizePassportDate(application.penaltyDeadline);
  if (storedDeadline) {
    return storedDeadline;
  }

  const anchorDate = normalizePassportDate(application.updatedAt) || normalizePassportDate(application.createdAt);
  return anchorDate ? anchorDate.add(PENALTY_PAYMENT_WINDOW_DAYS, 'day').startOf('day') : null;
};

const getPassportSecondChanceDeadlineDate = (application) => {
  if (!application) return null;

  if (application.secondDeadline) {
    return normalizePassportDate(application.secondDeadline);
  }

  return dayjs().startOf('day').add(SECOND_CHANCE_EXTENSION_DAYS, 'day');
};


//SETS SECONDDEADLINE AND CHANGE THE "PAYMENT COMPLETED" DEADLINE TO THE SECOND CHANCE DEADLINE
export const setPassportSecondChance = (application) => {
  if (!application) return application;

  const secondChanceDeadlineDate = getPassportSecondChanceDeadlineDate(application);

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


//SEND EMAIL AND NOTIFICATION IF THEIR APPLICATION IS ON PENALTY
const sendPassportPenaltyNotification = async (application, deadlineInfo) => {
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

  const applicationNumber = application.applicationNumber || 'your passport application';
  const displayName = user.firstname || user.username || 'Customer';
  const deadlineLabel = deadlineInfo.deadlineDate.format('MMMM DD, YYYY');

  await createUserNotification({
    userId: user._id,
    title: 'Passport Application On Penalty',
    message: `Your passport application ${applicationNumber} is now on penalty. Please pay PHP ${PENALTY_AMOUNT.toLocaleString('en-PH')} within 1 day.`,
    type: 'passport-penalty',
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
    subject: `Passport Application On Penalty: ${applicationNumber}`,
    html: `
            <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">
                    <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                    <h2 style="color:#305797;">Passport Application On Penalty</h2>
                    <p style="color:#555; font-size:16px;">Hello <b>${displayName}</b>,</p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Your passport application <b>${applicationNumber}</b> is on penalty because <b>${deadlineInfo.status}</b> was not completed on time.</p>
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


//REJECTS APPLICATION IF PENALTY DEADLINE IS OVERDUE WITHOUT PAYMENT OR IF SECOND CHANCE DEADLINE IS OVERDUE
const rejectPassportApplicationForDeadline = async (application, deadlineInfo, reachedSecondDeadline = false) => {
  if (!application || !deadlineInfo) {
    return { rejected: false, application };
  }

  const currentStatus = String(application.status || '').trim();
  if (!currentStatus || currentStatus === 'Rejected' || PASSPORT_TERMINAL_STATUSES.has(currentStatus)) {
    return { rejected: false, application };
  }

  const populatedUser = application.userId && typeof application.userId === 'object' ? application.userId : null;
  const userId = populatedUser?._id || application.userId;
  const user = populatedUser && populatedUser.email
    ? populatedUser
    : await UserModel.findById(userId).select('email username firstname lastname');

  application.reachedSecondDeadline = Boolean(reachedSecondDeadline);
  application.status = 'Rejected';

  try {
    application.statusHistory = application.statusHistory || [];
    application.statusHistory.push({
      status: 'Rejected',
      changedAt: new Date(),
      changedBy: null,
      changedByName: reachedSecondDeadline ? 'System Auto-Rejection (Penalty Deadline)' : 'System Auto-Rejection',
    });
  } catch (error) {
    console.error('Failed to record passport rejection history:', error);
  }

  if (typeof application.save === 'function') {
    await application.save();
  }

  if (user && user._id) {
    await createUserNotification({
      userId: user._id,
      title: 'Passport Application Automatically Rejected',
      message: reachedSecondDeadline
        ? `Your passport application ${application.applicationNumber || ''} was automatically rejected because the extra 3-day period after paying the penalty expired.`
        : `Your passport application ${application.applicationNumber || ''} was automatically rejected because the penalty fee was not paid within 1 day.`,
      type: 'passport',
      link: '/user-applications',
      metadata: {
        applicationId: application._id,
        applicationNumber: application.applicationNumber,
        status: 'Rejected',
        rejectedForStatus: deadlineInfo.status,
        deadlineDate: deadlineInfo.deadlineDate.format('YYYY-MM-DD'),
        reachedSecondDeadline: Boolean(reachedSecondDeadline),
      }
    });
  }

  if (user && user.email) {
    try {
      await transporter.sendMail({
        from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Passport Application Automatically Rejected: ${application.applicationNumber || 'Application'}`,
        html: `
                    <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">
                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797;">Passport Application Automatically Rejected</h2>
                            <p style="color:#555; font-size:16px;">Hello <b>${user.firstname || user.username || 'Customer'}</b>,</p>
                            <p style="color:#555; font-size:15px; line-height:1.6;">Your passport application <b>${application.applicationNumber || ''}</b> was automatically rejected because ${reachedSecondDeadline ? 'the extra 3-day period after penalty payment expired' : 'the penalty fee was not paid within 1 day'}.</p>
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
      console.error('Failed to send passport rejection email:', emailError);
    }
  }

  return { rejected: true, application };
};


//MARKS APPLICATION ON PENALTY IF DEADLINE IS OVERDUE AND PENALTY NOT YET APPLIED
const markPassportApplicationOnPenalty = async (application, deadlineInfo = null) => {
  if (!application) {
    return { penalized: false, application };
  }

  if (application.onPenalty || application.secondChance || String(application.status || '').trim() === 'Rejected') {
    return { penalized: false, application };
  }

  const resolvedDeadlineInfo = deadlineInfo || getPassportDeadlineInfo(application);
  if (!resolvedDeadlineInfo || !resolvedDeadlineInfo.isOverdue) {
    return { penalized: false, application };
  }

  const penaltyDeadlineDate = getPassportPenaltyDeadlineDate(application);
  const deadlineKey = penaltyDeadlineDate ? penaltyDeadlineDate.format('YYYY-MM-DD') : null;

  application.onPenalty = true;
  application.secondChance = false;
  application.reachedSecondDeadline = false;
  application.penaltyDeadline = deadlineKey || '';
  application.deadlineWarnings = Array.isArray(application.deadlineWarnings) ? application.deadlineWarnings : [];

  if (deadlineKey) {
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
  }

  if (typeof application.save === 'function') {
    await application.save();
  }

  await sendPassportPenaltyNotification(application, {
    ...resolvedDeadlineInfo,
    deadlineDate: penaltyDeadlineDate || resolvedDeadlineInfo.deadlineDate,
  });

  return { penalized: true, application };
};


//CHECKS DEADLINES AND APPLIES PENALTIES OR REJECTION IF NEEDED.
export const processPassportDeadlineAction = async (application) => {
  const deadlineInfo = getPassportDeadlineInfo(application);

  if (!deadlineInfo) {
    return { application, warned: false, penalized: false, rejected: false };
  }

  const currentStatus = String(application?.status || '').trim();
  const isPaymentCompleted = currentStatus.toLowerCase() === 'payment completed';

  if (application?.secondChance && isPaymentCompleted && deadlineInfo.isOverdue) {
    return rejectPassportApplicationForDeadline(application, deadlineInfo, true);
  }

  if (application?.onPenalty && !application?.secondChance && deadlineInfo.isOverdue) {
    return rejectPassportApplicationForDeadline(application, deadlineInfo, false);
  }

  if (!application?.onPenalty && !application?.secondChance && deadlineInfo.isOverdue) {
    return markPassportApplicationOnPenalty(application, deadlineInfo);
  }

  if (deadlineInfo.shouldSendWarning && !application?.onPenalty && !application?.secondChance) {
    const warningResult = await sendPassportDeadlineWarning(application);
    return { ...warningResult, warned: true, penalized: false, rejected: false };
  }

  return { application, warned: false, penalized: false, rejected: false };
};

export const decoratePassportApplication = (application) => {
  if (!application) return application;

  const plainApplication = typeof application.toObject === 'function'
    ? application.toObject()
    : { ...application };

  const deadlineInfo = getPassportDeadlineInfo(plainApplication);

  return {
    ...plainApplication,
    statusDeadlineDate: deadlineInfo ? deadlineInfo.deadlineDate.toISOString() : null,
    statusDeadlineDays: deadlineInfo ? deadlineInfo.deadlineDays : null,
    statusDeadlineWarningDate: deadlineInfo ? deadlineInfo.warningDate.toISOString() : null,
    statusDeadlineDaysRemaining: deadlineInfo ? deadlineInfo.daysRemaining : null,
    statusDeadlineWarningSent: deadlineInfo ? deadlineInfo.warningAlreadySent : false,
  };
};


//SENDS WARNING NOTIFICATION FOR APPLICATIONS APPROACHING DEADLINE (1 DAY BEFORE)
export const sendPassportDeadlineWarning = async (application) => {
  if (application?.onPenalty || application?.secondChance) {
    return { sent: false, application };
  }

  const deadlineInfo = getPassportDeadlineInfo(application);
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

  const applicationNumber = application.applicationNumber || 'your passport application';
  const displayName = user.firstname || user.username || 'Customer';
  const deadlineLabel = deadlineInfo.deadlineDate.format('MMMM DD, YYYY');
  const statusLabel = deadlineInfo.status;

  await createUserNotification({
    userId: user._id,
    title: 'Passport Deadline Reminder',
    message: `One day remains to complete ${statusLabel} for ${applicationNumber}. The deadline is ${deadlineLabel}.`,
    type: 'passport-deadline-reminder',
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
    subject: `Passport Deadline Reminder: ${statusLabel} due ${deadlineLabel}`,
    html: `
            <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">
                    <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                    <h2 style="color:#305797;">Passport Deadline Reminder</h2>
                    <p style="color:#555; font-size:16px;">Hello <b>${displayName}</b>,</p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">One day remains to complete <b>${statusLabel}</b> for your passport application <b>${applicationNumber}</b>.</p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Deadline: <b>${deadlineLabel}</b></p>
                    <p style="color:#555; font-size:15px; line-height:1.6;">Please log in and finish the required step to stay on track for your appointment date.</p>

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



const generateApplicationNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APP-PASS-${timestamp}${random}`;
};

export const applyPassport = async (req, res) => {
  try {
    const userId = req.userId;
    const { dfaLocation, preferredDate, preferredTime, applicationType } = req.body;

    if (!dfaLocation || !preferredDate || !preferredTime || !applicationType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await UserModel.findById(userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const application = await PassportModel.create({
      userId,
      username: user.username,
      dfaLocation,
      preferredDate,
      preferredTime,
      applicationType,
      applicationNumber: generateApplicationNumber(),
      status: "Application Submitted",
    });

    logAction('PASSPORT_APPLICATION_SUBMITTED', userId, { "Application Number": application.applicationNumber });

    // Populate initial processSteps and persist them on the application document.
    try {
      const built = buildProcessSteps(application);
      application.processSteps = built;
      await application.save();
    } catch (e) {
      // non-fatal — continue returning application but log
      console.error('Failed to build/persist processSteps:', e);
    }

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: "Error submitting passport application", error: error.message });
  }
};

export const chooseAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  try {
    if (!date || !time) {
      return res.status(400).json({ message: "Chosen appointment date and time are required" });
    }

    const application = await PassportModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Passport application not found" });
    }

    // Ensure the requester owns this application
    if (application.userId && application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this application" });
    }

    application.preferredDate = date;
    application.preferredTime = time;
    application.suggestedAppointmentScheduleChosen = {
      date,
      time
    };

    await application.save();

    // Rebuild processSteps since preferredDate changed (affects deadlines)
    try {
      const built = buildProcessSteps(application);
      application.processSteps = built;
      await application.save();
    } catch (e) {
      console.error('Failed to rebuild/persist processSteps after chooseAppointment:', e);
    }


    logAction('PASSPORT_APPOINTMENT_CHOSEN', req.userId, {
      "Passport Application Updated": `Application Number: ${application.applicationNumber}`,
      "Date": date,
      "Time": time
    });


    return res.status(200).json({
      message: "Preferred schedule updated successfully",
      application
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating schedule", error: error.message });
  }
};

export const updatePassportApplicationWithDocs = async (req, res) => {
  const { id } = req.params;
  const { submittedDocuments } = req.body;
  const userId = req.userId;

  try {
    if (!submittedDocuments || typeof submittedDocuments !== 'object') {
      return res.status(400).json({ message: "submittedDocuments is required" });
    }

    const application = await PassportModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Passport application not found" });
    }

    if (application.userId && application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this application" });
    }

    application.submittedDocuments = {
      ...(application.submittedDocuments || {}),
      ...submittedDocuments,
    };

    application.status = "Documents Uploaded";

    try {
      const userWho = await UserModel.findById(userId).select('username firstname lastname');
      application.statusHistory = application.statusHistory || [];
      application.statusHistory.push({
        status: application.status,
        changedAt: new Date(),
        changedBy: userId,
        changedByName: userWho ? (userWho.firstname || userWho.username) : ''
      });
    } catch (e) {
      console.error('Failed to record status history:', e);
    }

    await application.save();

    logAction('PASSPORT_DOCUMENTS_UPLOADED', userId, { "Documents Uploaded": `Application Number: ${application.applicationNumber}` });

    // Rebuild processSteps since status changed
    try {
      const built = buildProcessSteps(application);
      application.processSteps = built;
      await application.save();
    } catch (e) {
      console.error('Failed to rebuild/persist processSteps after documents upload:', e);
    }

    return res.status(200).json({
      message: "Passport documents updated successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating passport documents", error: error.message });
  }
};

// Ordered steps used to build the processSteps object stored on the application.
const STEPS_ORDER = [
  'Application Submitted',
  'Application Approved',
  'Payment Completed',
  'Documents Uploaded',
  'Documents Approved',
  'Documents Received',
  'Documents Submitted',
  'Processing by DFA',
  'DFA Approved',
  'Passport Released'
];

// Build a processSteps object keyed by step name with setDate and deadlineDate (YYYY-MM-DD or null).
// Deadline chaining rule: the first step's deadline = setDate + mapped days; subsequent deadlines
// are computed by adding the mapped days to the previous step's computed deadline (if available).
const buildProcessSteps = (application) => {
  const out = {};
  if (!application) return out;

  const preferredDate = normalizePassportDate(application.preferredDate);
  const createdAt = normalizePassportDate(application.createdAt) || dayjs().startOf('day');

  let prevDeadline = null;

  for (const step of STEPS_ORDER) {
    const setDate = getStatusSetDateFromApplication(application, step) || (step === 'Application Submitted' ? createdAt : null);
    const deadlineDays = PASSPORT_STATUS_DEADLINE_DAYS_MAP[step];

    let deadline = null;

    if (step === 'Processing by DFA' && preferredDate) {
      deadline = preferredDate.startOf('day');
    } else if (Number.isFinite(deadlineDays) && deadlineDays > 0) {
      if (step === 'Application Submitted') {
        if (setDate) deadline = setDate.add(deadlineDays, 'day').startOf('day');
      } else if (prevDeadline) {
        deadline = prevDeadline.add(deadlineDays, 'day').startOf('day');
      } else if (setDate) {
        deadline = setDate.add(deadlineDays, 'day').startOf('day');
      } else if (preferredDate) {
        // fallback: if nothing else, anchor to preferredDate
        deadline = preferredDate.add(-0, 'day').startOf('day').add(deadlineDays, 'day');
      }
    } else {
      // mapping days === 0 or undefined => no deadline stored
      deadline = null;
    }

    if (deadline) prevDeadline = deadline;

    out[step] = {
      setDate: setDate ? setDate.format('YYYY-MM-DD') : null,
      deadlineDate: deadline ? deadline.format('YYYY-MM-DD') : null,
    };
  }

  return out;
};

export const getPassportApplications = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const applications = await PassportModel.find({ userId }).sort({ createdAt: -1 });

    if (!applications || applications.length === 0) {
      return res.status(200).json([]);
    }

    const decorated = await Promise.all(
      applications.map((app) => decoratePassportApplication(app))
    );

    return res.status(200).json(decorated);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving passport applications", error: error.message });
  }
};

export const getPassportApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await PassportModel.findById(id)
      .populate('statusHistory.changedBy', 'username firstname lastname')
      .populate('userId', 'username firstname lastname');
    if (!application) {
      return res.status(404).json({ message: "Passport application not found" });
    }

    // Optionally, populate documents if you have a documents field
    await processPassportDeadlineAction(application).catch((error) => {
      console.error('Failed to process passport deadline warning:', error);
    });

    res.status(200).json(decoratePassportApplication(application));
  } catch (error) {
    console.error("Error fetching passport application by id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};