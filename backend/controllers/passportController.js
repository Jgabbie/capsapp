import PassportModel from "../models/passport.js";
import UserModel from "../models/users.js";
import NotificationModel from "../models/notification.js";
import transporter from "../config/nodemailer.js";
import dayjs from "dayjs";
import logAction from "../utils/logger.js";
import { buildBrandedEmail } from "../utils/emailTemplate.js";


const PASSPORT_STATUS_DEADLINE_DAYS_MAP = {
  // Days before the appointment (preferredDate) when each status must be completed
  // e.g. deadlineDate = preferredDate.subtract(deadlineDays, 'day')
  'Application Submitted': 2,
  'Application Approved': 2,
  'Payment Completed': 3,
  'Documents Uploaded': 5,
  'Documents Approved': 2,
  // documents received/submitted should be done in 2 days (relative to appointment)
  'Documents Received': 2,
  'Documents Submitted': 2,
  // processing by DFA happens on the appointment date itself
  'Processing by DFA': 0,
  'DFA Approved': 0,
  'Passport Released': 0,
};

const PASSPORT_TERMINAL_STATUSES = new Set(['DFA Approved', 'Passport Released', 'Rejected']);

const normalizePassportDate = (value) => {
  if (!value) return null;

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.startOf('day') : null;
};

// Return the day the given status was set on the application (startOf day).
// Falls back to updatedAt or createdAt when no explicit history entry exists.
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

const getPassportDeadlineInfo = (application, referenceDate = dayjs()) => {
  if (!application) return null;

  const status = String(application.status || '').trim();
  if (!status || PASSPORT_TERMINAL_STATUSES.has(status)) return null;

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

  const deadlineDays = PASSPORT_STATUS_DEADLINE_DAYS_MAP[status];
  if (!Number.isFinite(deadlineDays)) return null;

  const preferredDate = normalizePassportDate(application.preferredDate);
  if (!preferredDate) return null;

  // Determine deadline anchor:
  // - For 'Processing by DFA' (or any mapping explicitly set to 0) we anchor to the appointment (`preferredDate`).
  // - Otherwise the deadline stays relative to when the status was set.
  let deadlineDate = null;
  if (status === 'Processing by DFA' || deadlineDays === 0) {
    deadlineDate = preferredDate.startOf('day');
  } else {
    const statusSetDate = getStatusSetDateFromApplication(application, status);
    if (!statusSetDate) return null;
    deadlineDate = statusSetDate.add(deadlineDays, 'day').startOf('day');
  }
  const warningDate = deadlineDate.subtract(1, 'day').startOf('day');
  const currentDate = referenceDate.startOf('day');
  const daysRemaining = deadlineDate.diff(currentDate, 'day');
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

const formatManagedByName = (user) => {
  if (!user) return null;
  const fullName = [user.firstname, user.lastname]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();
  return fullName || String(user.username || '').trim() || null;
};

const getManagedByInfo = async (application) => {
  if (!application) return { managedBy: null, managedById: null };

  const history = Array.isArray(application.statusHistory) ? application.statusHistory : [];
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (!entry || !entry.changedBy) continue;

    const changedBy = entry.changedBy;
    if (typeof changedBy === 'object') {
      const role = String(changedBy.role || '').toLowerCase();
      if (role && role !== 'admin') continue;

      const managedBy = formatManagedByName(changedBy);
      if (managedBy) {
        return { managedBy, managedById: changedBy._id || null };
      }
    }

    const changedById = changedBy._id || changedBy;
    if (!changedById) continue;

    const user = await UserModel.findById(changedById).select('firstname lastname username role');
    if (!user || String(user.role || '').toLowerCase() !== 'admin') continue;

    const managedBy = formatManagedByName(user);
    if (managedBy) {
      return { managedBy, managedById: user._id };
    }
  }

  return { managedBy: null, managedById: null };
};

const decoratePassportApplication = async (application) => {
  if (!application) return application;

  const plainApplication = typeof application.toObject === 'function'
    ? application.toObject()
    : { ...application };

  const deadlineInfo = getPassportDeadlineInfo(plainApplication);
  const managedByInfo = await getManagedByInfo(plainApplication);
  // prefer stored processSteps; if not present compute an initial one
  const processSteps = plainApplication.processSteps && Object.keys(plainApplication.processSteps).length > 0
    ? plainApplication.processSteps
    : buildProcessSteps(plainApplication);

  return {
    ...plainApplication,
    statusDeadlineDate: deadlineInfo ? deadlineInfo.deadlineDate.format('YYYY-MM-DD') : null,
    statusDeadlineDays: deadlineInfo ? deadlineInfo.deadlineDays : null,
    statusDeadlineWarningDate: deadlineInfo ? deadlineInfo.warningDate.format('YYYY-MM-DD') : null,
    statusDeadlineDaysRemaining: deadlineInfo ? deadlineInfo.daysRemaining : null,
    statusDeadlineWarningSent: deadlineInfo ? deadlineInfo.warningAlreadySent : false,
    processSteps,
    managedBy: managedByInfo.managedBy,
    managedById: managedByInfo.managedById,
  };
};

const sendPassportDeadlineWarning = async (application) => {
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

  await NotificationModel.create({
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
    html: buildBrandedEmail({
      title: 'Passport Deadline Reminder',
      introHtml: `Hello <b>${displayName}</b>, one day remains to complete <b>${statusLabel}</b> for your passport application <b>${applicationNumber}</b>.`,
      bodyHtml: `
        <p style="margin:0 0 10px;">Deadline: <b>${deadlineLabel}</b></p>
        <p style="margin:0;">Please log in and finish the required step to stay on track for your appointment date.</p>
      `,
      ctaText: 'Continue in App',
      ctaUrl: 'travex://passportprogress',
    }),
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







const randomApplicationNumber = () =>
  `APP-PASS-${Math.floor(100000000 + Math.random() * 900000000)}`;

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
      applicationNumber: randomApplicationNumber(),
      status: "Application Submitted",
      submittedDocuments: {}, // Empty, since files are no longer required on creation
      documents: {}
    });

    if (typeof logAction === 'function') {
      logAction('PASSPORT_APPLICATION_SUBMITTED', userId, { "Application Number": application.applicationNumber });
    }

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

    if (typeof logAction === 'function') {
      logAction('PASSPORT_APPOINTMENT_CHOSEN', req.userId, { Application: application._id, date, time });
    }

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

    await application.save();

    if (typeof logAction === 'function') {
      logAction('PASSPORT_DOCUMENTS_UPLOADED', req.userId, { Application: application._id });
    }

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

    if (Number.isFinite(deadlineDays) && deadlineDays > 0) {
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