import PassportModel from "../models/passport.js";
import UserModel from "../models/users.js";
import NotificationModel from "../models/notification.js";
import transporter from "../config/nodemailer.js";
import dayjs from "dayjs";
import logAction from "../utils/logger.js";


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

const decoratePassportApplication = (application) => {
  if (!application) return application;

  const plainApplication = typeof application.toObject === 'function'
    ? application.toObject()
    : { ...application };

  const deadlineInfo = getPassportDeadlineInfo(plainApplication);

  return {
    ...plainApplication,
    statusDeadlineDate: deadlineInfo ? deadlineInfo.deadlineDate.format('YYYY-MM-DD') : null,
    statusDeadlineDays: deadlineInfo ? deadlineInfo.deadlineDays : null,
    statusDeadlineWarningDate: deadlineInfo ? deadlineInfo.warningDate.format('YYYY-MM-DD') : null,
    statusDeadlineDaysRemaining: deadlineInfo ? deadlineInfo.daysRemaining : null,
    statusDeadlineWarningSent: deadlineInfo ? deadlineInfo.warningAlreadySent : false,
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

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: "Error submitting passport application", error: error.message });
  }
};

export const getPassportApplications = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = String(user.role || "").toLowerCase() === "admin";
    const query = isAdmin ? {} : { userId: req.userId };

    const applications = await PassportModel.find(query).sort({ createdAt: -1 });
    return res.status(200).json(applications.map(decoratePassportApplication));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
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

    return res.status(200).json({
      message: "Passport documents updated successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating passport documents", error: error.message });
  }
};