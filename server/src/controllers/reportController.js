import { prisma } from '../config/database.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const categories = new Set([
  'PAYMENT_ISSUE',
  'COURSE_ACCESS_ISSUE',
  'ASSIGNMENT_ISSUE',
  'QUIZ_ISSUE',
  'INSTRUCTOR_ISSUE',
  'TECHNICAL_ISSUE',
  'OTHER',
]);
const statuses = new Set(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']);
const adminReportSelect = {
  id: true,
  userId: true,
  category: true,
  subject: true,
  description: true,
  status: true,
  adminResponse: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  user: { select: { id: true, name: true, email: true, phone: true, role: true } },
};
const studentReportSelect = {
  id: true,
  userId: true,
  category: true,
  subject: true,
  description: true,
  status: true,
  adminResponse: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
};

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function sendSuccess(res, message, data, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function createStudentReport(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const category = body.category;
  const subject = normalizeString(body.subject);
  const description = normalizeString(body.description);

  if (!categories.has(category)) return sendError(res, 400, 'Select a valid report category');
  if (subject.length < 3 || subject.length > 160) return sendError(res, 400, 'Subject must be between 3 and 160 characters');
  if (description.length < 10 || description.length > 5000) return sendError(res, 400, 'Description must be between 10 and 5000 characters');

  try {
    const report = await prisma.report.create({
      data: { userId: req.user.userId, category, subject, description },
      select: studentReportSelect,
    });
    return sendSuccess(res, 'Report submitted successfully', { report }, 201);
  } catch {
    return sendError(res, 500, 'Unable to submit report');
  }
}

export async function getStudentReports(req, res) {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      select: studentReportSelect,
    });
    return sendSuccess(res, 'Your reports retrieved', { reports });
  } catch {
    return sendError(res, 500, 'Unable to retrieve your reports');
  }
}

export async function getStudentReport(req, res) {
  const { reportId } = req.params;
  if (!uuidPattern.test(reportId)) return sendError(res, 400, 'A valid report ID is required');
  try {
    const report = await prisma.report.findFirst({
      where: { id: reportId, userId: req.user.userId },
      select: studentReportSelect,
    });
    if (!report) return sendError(res, 404, 'Report not found');
    return sendSuccess(res, 'Report retrieved', { report });
  } catch {
    return sendError(res, 500, 'Unable to retrieve report');
  }
}

export async function getAdminReports(req, res) {
  const status = normalizeString(req.query.status).toUpperCase();
  const category = normalizeString(req.query.category).toUpperCase();
  if (status && !statuses.has(status)) return sendError(res, 400, 'Report status filter is invalid');
  if (category && !categories.has(category)) return sendError(res, 400, 'Report category filter is invalid');
  try {
    const reports = await prisma.report.findMany({
      where: { ...(status ? { status } : {}), ...(category ? { category } : {}) },
      orderBy: { createdAt: 'desc' },
      select: adminReportSelect,
    });
    return sendSuccess(res, 'Reports retrieved', { reports });
  } catch {
    return sendError(res, 500, 'Unable to retrieve reports');
  }
}

export async function getAdminReport(req, res) {
  const { reportId } = req.params;
  if (!uuidPattern.test(reportId)) return sendError(res, 400, 'A valid report ID is required');
  try {
    const report = await prisma.report.findUnique({ where: { id: reportId }, select: adminReportSelect });
    if (!report) return sendError(res, 404, 'Report not found');
    return sendSuccess(res, 'Report retrieved', { report });
  } catch {
    return sendError(res, 500, 'Unable to retrieve report');
  }
}

export async function updateAdminReport(req, res) {
  const { reportId } = req.params;
  if (!uuidPattern.test(reportId)) return sendError(res, 400, 'A valid report ID is required');
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const targetStatus = body.status;
  const adminResponse = body.adminResponse == null ? undefined : normalizeString(body.adminResponse);
  if (!statuses.has(targetStatus)) return sendError(res, 400, 'Select a valid report status');
  if (adminResponse !== undefined && adminResponse.length > 5000) return sendError(res, 400, 'Admin response must be 5000 characters or fewer');

  try {
    const current = await prisma.report.findUnique({ where: { id: reportId }, select: { id: true, status: true, resolvedAt: true } });
    if (!current) return sendError(res, 404, 'Report not found');
    const transitions = {
      PENDING: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      IN_PROGRESS: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      RESOLVED: ['RESOLVED'],
      REJECTED: ['REJECTED'],
    };
    if (!transitions[current.status].includes(targetStatus)) {
      return sendError(res, 409, `A ${current.status.toLowerCase().replace('_', ' ')} report cannot be changed to ${targetStatus.toLowerCase().replace('_', ' ')}`);
    }
    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: targetStatus,
        ...(adminResponse !== undefined ? { adminResponse: adminResponse || null } : {}),
        resolvedAt: targetStatus === 'RESOLVED' ? current.resolvedAt || new Date() : null,
      },
      select: adminReportSelect,
    });
    return sendSuccess(res, 'Report updated successfully', { report });
  } catch {
    return sendError(res, 500, 'Unable to update report');
  }
}
