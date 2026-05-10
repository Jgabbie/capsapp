import VisaApplicationModel from "../models/visaApplication.js";
import VisaServiceModel from "../models/visaService.js";
import UserModel from "../models/users.js";
import NotificationModel from "../models/notification.js";
import transporter from "../config/nodemailer.js";
import dayjs from "dayjs";
import logAction from "../utils/logger.js";
import { buildBrandedEmail } from "../utils/emailTemplate.js";

// Fallback days map - only used if process steps are not available
const VISA_STATUS_TOTAL_DAYS_MAP_FALLBACK = {
  'Application Submitted': 2,
  'Application Approved': 4,
  'Payment Completed': 7,
  'Documents Uploaded': 12,
  'Documents Approved': 15,
  'Documents Received': 17,
  'Documents Submitted': 19,
  'Processing by Embassy': 19,
};

const buildVisaStatusTotalDaysMapFromSteps = (steps = []) => {
  const map = {};
  let cumulativeDays = 0;

  for (const step of steps) {
    const title = String(step?.title || '').trim();
    if (!title) continue;

    const stepDays = Number(step?.daysToBeCompleted ?? 0);
    const daysToAdd = Number.isFinite(stepDays) && stepDays > 0 ? stepDays : 0;

    cumulativeDays += daysToAdd;
    map[title] = cumulativeDays;
  }

  return map;
};

const getVisaProcessStepsFromApplication = (application) => {
  if (!application) return [];

  // Try application's own steps first
  if (Array.isArray(application.visaProcessSteps)) {
    return application.visaProcessSteps;
  }

  // Fall back to service's steps
  if (application.serviceId?.visaProcessSteps) {
    return Array.isArray(application.serviceId.visaProcessSteps)
      ? application.serviceId.visaProcessSteps
      : [];
  }

  return [];
};

const getStatusTotalDaysMap = (application) => {
  const steps = getVisaProcessStepsFromApplication(application);
  if (steps.length > 0) {
    return buildVisaStatusTotalDaysMapFromSteps(steps);
  }
  return VISA_STATUS_TOTAL_DAYS_MAP_FALLBACK;
};


const VISA_TERMINAL_STATUSES = new Set(['Documents Submitted', 'Processing by Embassy', 'Embassy Approved', 'DFA Approved', 'Passport Released', 'Rejected']);

const getCurrentVisaStatus = (application) => {
  if (!application) return '';

  if (Array.isArray(application.status)) {
    return String(application.status[application.status.length - 1] || '').trim();
  }

  return String(application.status || '').trim();
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

const getVisaDeadlineInfo = (
  application,
  referenceDate = dayjs()
) => {
  if (!application) return null;

  const currentStatus = getCurrentVisaStatus(application);

  if (!currentStatus || VISA_TERMINAL_STATUSES.has(currentStatus)) {
    return null;
  }

  // Get the cumulative days map from steps or fallback
  const statusDeadlineMap = getStatusTotalDaysMap(application);
  const totalDays = statusDeadlineMap[currentStatus];

  if (!Number.isFinite(totalDays)) {
    return null;
  }

  // Calculate deadline from application creation date
  const baseDate = dayjs(application.createdAt).startOf('day');
  const deadlineDate = baseDate.add(totalDays, 'day').startOf('day');
  const warningDate = deadlineDate.subtract(1, 'day').startOf('day');
  const currentDate = referenceDate.startOf('day');
  const daysRemaining = deadlineDate.diff(currentDate, 'day');

  // Check if warning was already sent
  const warningAlreadySent =
    Array.isArray(application.deadlineWarnings) &&
    application.deadlineWarnings.some(
      (warning) =>
        warning?.status === currentStatus &&
        warning.deadlineDate === deadlineDate.format('YYYY-MM-DD')
    );

  return {
    status: currentStatus,
    totalDays,
    statusDeadlineMap,
    deadlineDate,
    warningDate,
    daysRemaining,
    warningAlreadySent,
    shouldSendWarning: daysRemaining === 1 && !warningAlreadySent,
    isOverdue: daysRemaining < 0,
  };
};

const decorateVisaApplication = async (application) => {
  if (!application) return application;

  const plainApplication = typeof application.toObject === 'function'
    ? application.toObject()
    : { ...application };

  const statusText = getCurrentVisaStatus(plainApplication);
  const deadlineInfo = getVisaDeadlineInfo(plainApplication);
  const statusDeadlineMap = getStatusTotalDaysMap(plainApplication);
  const managedByInfo = await getManagedByInfo(plainApplication);

  return {
    ...plainApplication,
    status: statusText || plainApplication.status,
    statusDeadlineDate: deadlineInfo?.deadlineDate.toISOString() ?? null,
    statusDeadlineDays: deadlineInfo?.totalDays ?? null,
    visaStatusTotalDaysMap: statusDeadlineMap,
    statusDeadlineWarningDate: deadlineInfo?.warningDate.toISOString() ?? null,
    statusDeadlineDaysRemaining: deadlineInfo?.daysRemaining ?? null,
    statusDeadlineWarningSent: deadlineInfo?.warningAlreadySent ?? false,
    managedBy: managedByInfo.managedBy,
    managedById: managedByInfo.managedById,
  };
};

const sendVisaDeadlineWarning = async (application) => {
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

  await NotificationModel.create({
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
    html: buildBrandedEmail({
      title: 'Visa Deadline Reminder',
      introHtml: `Hello <b>${displayName}</b>, one day remains to complete <b>${statusLabel}</b> for your visa application <b>${applicationNumber}</b>.`,
      bodyHtml: `
        <p style="margin:0 0 10px;">Deadline: <b>${deadlineLabel}</b></p>
        <p style="margin:0;">Please log in and finish the required step to keep your application on track.</p>
      `,
      ctaText: 'Continue in App',
      ctaUrl: 'travex://visaprogress',
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

const autoRejectVisaApplication = async (application, deadlineInfo = null) => {
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

  if (typeof application.save === 'function') {
    await application.save();
  }

  const applicationNumber = application.applicationNumber || 'your visa application';
  const displayName = user?.firstname || user?.username || 'Customer';
  const deadlineLabel = resolvedDeadlineInfo.deadlineDate.format('MMMM DD, YYYY');

  if (user && user._id) {
    await NotificationModel.create({
      userId: user._id,
      title: 'Visa Application Automatically Rejected',
      message: `Your visa application ${applicationNumber} was automatically rejected because ${resolvedDeadlineInfo.status} was not completed by ${deadlineLabel}.`,
      type: 'visa',
      link: '/user-applications',
      metadata: {
        applicationId: application._id,
        applicationNumber,
        status: 'Rejected',
        rejectedForStatus: resolvedDeadlineInfo.status,
        deadlineDate: resolvedDeadlineInfo.deadlineDate.format('YYYY-MM-DD'),
      }
    });
  }

  if (user && user.email) {
    try {
      await transporter.sendMail({
        from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Visa Application Automatically Rejected: ${applicationNumber}`,
        html: buildBrandedEmail({
          title: 'Visa Application Automatically Rejected',
          introHtml: `Hello <b>${displayName}</b>, your visa application <b>${applicationNumber}</b> was automatically rejected because <b>${resolvedDeadlineInfo.status}</b> was not completed by <b>${deadlineLabel}</b>.`,
          bodyHtml: `
            <p style="margin:0;">Please contact our office if you need assistance or wish to submit a new application.</p>
          `,
          ctaText: 'View Application',
          ctaUrl: 'travex://userapplications',
        }),
      });
    } catch (emailError) {
      console.error('Failed to send visa auto-rejection email:', emailError);
    }
  }

  return { rejected: true, application };
};

const processVisaDeadlineAction = async (application) => {
  const deadlineInfo = getVisaDeadlineInfo(application);
  if (!deadlineInfo) {
    return { application, warned: false, rejected: false };
  }

  if (deadlineInfo.isOverdue) {
    return autoRejectVisaApplication(application, deadlineInfo);
  }

  if (deadlineInfo.shouldSendWarning) {
    const warningResult = await sendVisaDeadlineWarning(application);
    return { ...warningResult, warned: true, rejected: false };
  }

  return { application, warned: false, rejected: false };
};







const generateApplicationNumber = () =>
  `APP-VISA-${Math.floor(100000000 + Math.random() * 900000000)}`;

export const applyVisa = async (req, res) => {
  const { serviceId, preferredDate, preferredTime, purposeOfTravel } = req.body;
  const userId = req.userId;

  if (!serviceId || !preferredDate || !preferredTime || !purposeOfTravel) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await UserModel.findById(userId).select("firstname lastname username");
    const service = await VisaServiceModel.findById(serviceId).select("visaName");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const applicantName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;

    const newApplication = await VisaApplicationModel.create({
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

    if (typeof logAction === 'function') {
      logAction('VISA_APPLICATION_SUBMITTED', userId, { "Application Number": newApplication.applicationNumber });
    }

    return res.status(201).json(newApplication);
  } catch (error) {
    return res.status(500).json({ message: "Error applying for visa", error: error.message });
  }
};

export const getUserVisaApplications = async (req, res) => {
  try {
    const userId = req.userId;
    const applications = await VisaApplicationModel.find({ userId })
      .populate("serviceId")
      .sort({ createdAt: -1 });
    // Decorate each application with deadline info so client doesn't need fallbacks
    const decorated = await Promise.all(applications.map((app) => decorateVisaApplication(app)));
    res.status(200).json(decorated);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user visa applications", error: error.message });
  }
};

export const getVisaApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await VisaApplicationModel.findById(id)
      .populate("userId", "firstname lastname username")
      .populate("serviceId");
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

export const chooseAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  try {
    if (!date || !time) {
      return res.status(400).json({ message: "Chosen appointment date and time are required" });
    }

    const application = await VisaApplicationModel.findById(id);
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

    return res.status(200).json({
      message: "Preferred schedule updated successfully",
      application
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating schedule", error: error.message });
  }
};

export const updateVisaApplicationWithDocs = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { preferredDate, preferredTime, purposeOfTravel, submittedDocuments } = req.body;

    const application = await VisaApplicationModel.findById(id);
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

    await application.save();

    if (typeof logAction === 'function') {
      logAction('UPDATE_VISA_APPLICATION', userId, { "Application Number": application.applicationNumber });
    }

    res.status(200).json({
      message: "Visa application updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating visa application", error: error.message });
  }
};

export const passportReleaseOption = async (req, res) => {
  const { id } = req.params;
  const { option, deliveryAddress } = req.body;

  try {
    if (!option) {
      return res.status(400).json({ message: "Passport release option is required" });
    }

    const application = await VisaApplicationModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }

    application.passportReleaseOption = option;
    application.deliveryAddress = deliveryAddress || application.deliveryAddress;
    if (String(option || "").toLowerCase() === "delivery") {
      application.deliveryFee = 0;
      application.deliveryDate = "";
    }

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

export { buildVisaStatusTotalDaysMapFromSteps };