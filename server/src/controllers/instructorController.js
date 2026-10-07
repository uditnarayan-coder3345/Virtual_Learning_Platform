import { prisma } from '../config/database.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function sendSuccess(res, message, data, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function getCourseFields(body, partial = false) {
  const data = {};
  for (const field of ['title', 'description', 'category']) {
    if (!Object.hasOwn(body, field) && partial) continue;
    if (typeof body[field] !== 'string' || !body[field].trim()) return { error: `${field} is required` };
    data[field] = body[field].trim();
  }
  if (Object.hasOwn(body, 'thumbnail')) {
    if (body.thumbnail !== null && typeof body.thumbnail !== 'string') return { error: 'thumbnail must be a string or null' };
    data.thumbnail = typeof body.thumbnail === 'string' && body.thumbnail.trim() ? body.thumbnail.trim() : null;
  }
  return { data };
}

export async function getInstructorCourses(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { enrollments: true, lessons: true, assignments: true, quizzes: true } } },
    });
    return sendSuccess(res, 'Instructor courses retrieved', { courses });
  } catch {
    return sendError(res, 500, 'Unable to retrieve instructor courses');
  }
}

export async function createInstructorCourse(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const { data, error } = getCourseFields(body);
  if (error) return sendError(res, 400, error);
  try {
    const course = await prisma.course.create({
      data: { ...data, instructorId: req.user.userId },
    });
    return sendSuccess(res, 'Course created successfully', { course }, 201);
  } catch {
    return sendError(res, 500, 'Unable to create course');
  }
}

export async function updateInstructorCourse(req, res) {
  const { courseId } = req.params;
  if (!uuidPattern.test(courseId)) return sendError(res, 400, 'A valid course ID is required');
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const allowed = new Set(['title', 'description', 'category', 'thumbnail']);
  if (!Object.keys(body).length || Object.keys(body).some((key) => !allowed.has(key))) {
    return sendError(res, 400, 'Provide course fields to update');
  }
  const { data, error } = getCourseFields(body, true);
  if (error) return sendError(res, 400, error);
  try {
    const result = await prisma.course.updateMany({ where: { id: courseId, instructorId: req.user.userId }, data });
    if (!result.count) return sendError(res, 404, 'Course not found');
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    return sendSuccess(res, 'Course updated successfully', { course });
  } catch {
    return sendError(res, 500, 'Unable to update course');
  }
}

export async function deleteInstructorCourse(req, res) {
  const { courseId } = req.params;
  if (!uuidPattern.test(courseId)) return sendError(res, 400, 'A valid course ID is required');
  try {
    const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: req.user.userId }, select: { id: true } });
    if (!course) return sendError(res, 404, 'Course not found');
    await prisma.$transaction(async (tx) => {
      const lessons = await tx.lesson.findMany({ where: { courseId }, select: { id: true } });
      const lessonIds = lessons.map(({ id }) => id);
      await tx.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
      const quizzes = await tx.quiz.findMany({ where: { courseId }, select: { id: true } });
      const quizIds = quizzes.map(({ id }) => id);
      await tx.quizQuestion.deleteMany({ where: { quizId: { in: quizIds } } });
      await tx.quizAttempt.deleteMany({ where: { quizId: { in: quizIds } } });
      const assignments = await tx.assignment.findMany({ where: { courseId }, select: { id: true } });
      const assignmentIds = assignments.map(({ id }) => id);
      await tx.submission.deleteMany({ where: { assignmentId: { in: assignmentIds } } });
      await tx.assignment.deleteMany({ where: { courseId } });
      await tx.quiz.deleteMany({ where: { courseId } });
      await tx.lesson.deleteMany({ where: { courseId } });
      await tx.enrollment.deleteMany({ where: { courseId } });
      await tx.course.delete({ where: { id: courseId } });
    });
    return sendSuccess(res, 'Course deleted successfully', { deletedCourseId: courseId });
  } catch {
    return sendError(res, 500, 'Unable to delete course');
  }
}
