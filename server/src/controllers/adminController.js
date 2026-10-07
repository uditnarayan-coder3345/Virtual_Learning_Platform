import { prisma } from '../config/database.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  createdAt: true,
};

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function sendSuccess(res, message, data, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function validId(value) {
  return typeof value === 'string' && uuidPattern.test(value);
}

function invalidId(res) {
  return sendError(res, 400, 'A valid ID is required');
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export async function getAdminDashboard(req, res) {
  try {
    const [totalStudents, totalInstructors, totalCourses, totalEnrollments] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
    ]);

    return sendSuccess(res, 'Admin dashboard statistics retrieved', {
      stats: {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
      },
    });
  } catch {
    return sendError(res, 500, 'Unable to retrieve dashboard statistics');
  }
}

export async function getAdminUsers(req, res) {
  const search = normalizeString(req.query.search);
  const roleFilter = normalizeString(req.query.role).toUpperCase();
  const validRoles = new Set(['STUDENT', 'INSTRUCTOR', 'ADMIN']);
  const statusFilter = normalizeString(req.query.status).toUpperCase();
  const validStatuses = new Set(['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED']);
  if (statusFilter && !validStatuses.has(statusFilter)) return sendError(res, 400, 'Status filter is invalid');

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (roleFilter && validRoles.has(roleFilter)) {
    where.role = roleFilter;
  }
  if (statusFilter) where.status = statusFilter;

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: publicUserSelect,
    });
    return sendSuccess(res, 'Users retrieved', { users });
  } catch {
    return sendError(res, 500, 'Unable to retrieve users');
  }
}

export async function getPendingAdminUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING', role: 'INSTRUCTOR' },
      orderBy: { createdAt: 'asc' },
      select: publicUserSelect,
    });
    return sendSuccess(res, 'Pending accounts retrieved', { users });
  } catch {
    return sendError(res, 500, 'Unable to retrieve pending accounts');
  }
}

async function updateAccountStatus(req, res, targetStatus, allowedStatuses, message, instructorRequestOnly = false) {
  const { userId } = req.params;
  if (!validId(userId)) return invalidId(res);
  try {
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, status: true } });
    if (!current) return sendError(res, 404, 'User not found');
    if (current.role === 'ADMIN') return sendError(res, 403, 'Admin accounts cannot be managed through this endpoint');
    if (instructorRequestOnly && current.role !== 'INSTRUCTOR') {
      return sendError(res, 403, 'Only instructor registration requests can be approved or rejected');
    }
    if (!allowedStatuses.includes(current.status)) return sendError(res, 409, `Cannot ${message.toLowerCase()} an account with status ${current.status}`);
    const user = await prisma.user.update({ where: { id: userId }, data: { status: targetStatus }, select: publicUserSelect });
    return sendSuccess(res, `Account ${message.toLowerCase()} successfully`, { user });
  } catch {
    return sendError(res, 500, `Unable to ${message.toLowerCase()} account`);
  }
}

export function approveAdminUser(req, res) { return updateAccountStatus(req, res, 'APPROVED', ['PENDING'], 'Approved', true); }
export function rejectAdminUser(req, res) { return updateAccountStatus(req, res, 'REJECTED', ['PENDING'], 'Rejected', true); }
export function blockAdminUser(req, res) { return updateAccountStatus(req, res, 'BLOCKED', ['APPROVED'], 'Blocked'); }
export function unblockAdminUser(req, res) { return updateAccountStatus(req, res, 'APPROVED', ['BLOCKED'], 'Unblocked'); }

export async function getAdminUserById(req, res) {
  const { userId } = req.params;
  if (!validId(userId)) return invalidId(res);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...publicUserSelect,
        courses: {
          select: { id: true, title: true, category: true },
          orderBy: { createdAt: 'desc' },
        },
        enrollments: {
          select: {
            id: true,
            status: true,
            course: { select: { id: true, title: true, category: true } },
          },
          orderBy: { enrolledAt: 'desc' },
        },
      },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 'User retrieved', { user });
  } catch {
    return sendError(res, 500, 'Unable to retrieve user');
  }
}

export async function deleteAdminUser(req, res) {
  const { userId } = req.params;
  if (!validId(userId)) return invalidId(res);
  if (userId === req.user.userId) return sendError(res, 400, 'You cannot delete your own admin account');

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    if (user.role === 'ADMIN') {
      return sendError(res, 403, 'Admin accounts cannot be deleted through this endpoint');
    }

    await prisma.$transaction(async (tx) => {
      await tx.lessonProgress.deleteMany({
        where: { studentId: userId },
      });
      await tx.submission.deleteMany({
        where: { studentId: userId },
      });
      await tx.quizAttempt.deleteMany({
        where: { studentId: userId },
      });
      await tx.enrollment.deleteMany({
        where: { studentId: userId },
      });
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return sendSuccess(res, 'User deleted successfully', { deletedUserId: userId }, 200);
  } catch (error) {
    if (error?.code === 'P2025') {
      return sendError(res, 404, 'User not found');
    }
    return sendError(res, 500, 'Unable to delete user');
  }
}

export async function getAdminCourses(req, res) {
  const search = normalizeString(req.query.search);
  const category = normalizeString(req.query.category);

  const where = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  try {
    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: { select: publicUserSelect },
        lessons: { select: { id: true } },
        assignments: { select: { id: true } },
        quizzes: { select: { id: true } },
        enrollments: { select: { id: true } },
      },
    });

    const transformedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail: course.thumbnail,
      createdAt: course.createdAt,
      instructor: course.instructor,
      lessonCount: course.lessons.length,
      assignmentCount: course.assignments.length,
      quizCount: course.quizzes.length,
      enrollmentCount: course.enrollments.length,
    }));

    return sendSuccess(res, 'Courses retrieved', { courses: transformedCourses });
  } catch {
    return sendError(res, 500, 'Unable to retrieve courses');
  }
}

export async function getAdminCourseById(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: publicUserSelect },
        lessons: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            title: true,
            content: true,
            materialUrl: true,
            duration: true,
            createdAt: true,
          },
        },
        assignments: {
          orderBy: { dueDate: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            createdAt: true,
          },
        },
        quizzes: {
          orderBy: { createdAt: 'asc' },
          include: {
            questions: {
              orderBy: { id: 'asc' },
              select: {
                id: true,
                question: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    return sendSuccess(res, 'Course details retrieved', { course });
  } catch {
    return sendError(res, 500, 'Unable to retrieve course details');
  }
}

export async function createAdminCourse(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};

  const title = normalizeString(body.title);
  const description = normalizeString(body.description);
  const category = normalizeString(body.category);
  const thumbnail = typeof body.thumbnail === 'string' ? body.thumbnail.trim() : '';
  let instructorId = body.instructorId === undefined || body.instructorId === null ? null : normalizeString(body.instructorId);

  if (!title || !description || !category) {
    return sendError(res, 400, 'Title, description, and category are required');
  }
  if (instructorId && !validId(instructorId)) {
    return sendError(res, 400, 'A valid instructorId is required when provided');
  }

  try {
    if (instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { id: true, role: true },
      });

      if (!instructor || instructor.role !== 'INSTRUCTOR') {
        return sendError(res, 400, 'The provided instructorId must belong to an instructor');
      }
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        thumbnail: thumbnail || null,
        instructorId: instructorId || null,
      },
      include: {
        instructor: { select: publicUserSelect },
      },
    });

    return sendSuccess(res, 'Course created successfully', { course }, 201);
  } catch {
    return sendError(res, 500, 'Unable to create course');
  }
}

export async function updateAdminCourse(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};

  if (!Object.keys(body).length) {
    return sendError(res, 400, 'Provide at least one field to update');
  }

  const data = {};
  if (Object.hasOwn(body, 'title')) {
    const title = normalizeString(body.title);
    if (!title) return sendError(res, 400, 'Title is required');
    data.title = title;
  }
  if (Object.hasOwn(body, 'description')) {
    const description = normalizeString(body.description);
    if (!description) return sendError(res, 400, 'Description is required');
    data.description = description;
  }
  if (Object.hasOwn(body, 'category')) {
    const category = normalizeString(body.category);
    if (!category) return sendError(res, 400, 'Category is required');
    data.category = category;
  }
  if (Object.hasOwn(body, 'thumbnail')) {
    data.thumbnail = typeof body.thumbnail === 'string' && body.thumbnail.trim() ? body.thumbnail.trim() : null;
  }
  if (Object.hasOwn(body, 'instructorId')) {
    const instructorId = body.instructorId === null ? null : normalizeString(body.instructorId);
    if (instructorId && !validId(instructorId)) return sendError(res, 400, 'A valid instructorId is required when provided');
    if (instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { id: true, role: true },
      });
      if (!instructor || instructor.role !== 'INSTRUCTOR') {
        return sendError(res, 400, 'The provided instructorId must belong to an instructor');
      }
    }
    data.instructorId = instructorId;
  }

  try {
    const course = await prisma.course.update({
      where: { id: courseId },
      data,
      include: { instructor: { select: publicUserSelect } },
    });
    return sendSuccess(res, 'Course updated successfully', { course });
  } catch (error) {
    if (error?.code === 'P2025') {
      return sendError(res, 404, 'Course not found');
    }
    return sendError(res, 500, 'Unable to update course');
  }
}

export async function deleteAdminCourse(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.lessonProgress.deleteMany({
        where: { lesson: { courseId } },
      });
      await tx.lesson.deleteMany({ where: { courseId } });

      await tx.submission.deleteMany({
        where: { assignment: { courseId } },
      });
      await tx.assignment.deleteMany({ where: { courseId } });

      await tx.quizQuestion.deleteMany({
        where: { quiz: { courseId } },
      });
      await tx.quizAttempt.deleteMany({
        where: { quiz: { courseId } },
      });
      await tx.quiz.deleteMany({ where: { courseId } });

      await tx.enrollment.deleteMany({ where: { courseId } });
      await tx.course.delete({ where: { id: courseId } });
    });

    return sendSuccess(res, 'Course deleted successfully', { deletedCourseId: courseId });
  } catch (error) {
    if (error?.code === 'P2025') {
      return sendError(res, 404, 'Course not found');
    }
    return sendError(res, 500, 'Unable to delete course');
  }
}

export async function getAdminCourseLessons(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return sendError(res, 404, 'Course not found');

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });

    return sendSuccess(res, 'Course lessons retrieved', { lessons });
  } catch {
    return sendError(res, 500, 'Unable to retrieve course lessons');
  }
}

export async function createAdminLesson(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const title = normalizeString(body.title);
  const content = normalizeString(body.content);
  const materialUrl = typeof body.materialUrl === 'string' ? body.materialUrl.trim() : '';
  const durationValue = body.duration === undefined || body.duration === null ? null : Number(body.duration);

  if (!title || !content) return sendError(res, 400, 'Lesson title and content are required');
  if (durationValue !== null && (!Number.isInteger(durationValue) || durationValue < 0)) {
    return sendError(res, 400, 'Duration must be a non-negative integer');
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return sendError(res, 404, 'Course not found');

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        content,
        materialUrl: materialUrl || null,
        duration: durationValue,
      },
    });

    return sendSuccess(res, 'Lesson created successfully', { lesson }, 201);
  } catch {
    return sendError(res, 500, 'Unable to create lesson');
  }
}

export async function updateAdminLesson(req, res) {
  const { lessonId } = req.params;
  if (!validId(lessonId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (!Object.keys(body).length) return sendError(res, 400, 'Provide at least one field to update');

  const data = {};
  if (Object.hasOwn(body, 'title')) {
    const title = normalizeString(body.title);
    if (!title) return sendError(res, 400, 'Lesson title is required');
    data.title = title;
  }
  if (Object.hasOwn(body, 'content')) {
    const content = normalizeString(body.content);
    if (!content) return sendError(res, 400, 'Lesson content is required');
    data.content = content;
  }
  if (Object.hasOwn(body, 'materialUrl')) {
    data.materialUrl = typeof body.materialUrl === 'string' && body.materialUrl.trim() ? body.materialUrl.trim() : null;
  }
  if (Object.hasOwn(body, 'duration')) {
    const durationValue = body.duration === null ? null : Number(body.duration);
    if (durationValue !== null && (!Number.isInteger(durationValue) || durationValue < 0)) {
      return sendError(res, 400, 'Duration must be a non-negative integer');
    }
    data.duration = durationValue;
  }

  try {
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });
    return sendSuccess(res, 'Lesson updated successfully', { lesson });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Lesson not found');
    return sendError(res, 500, 'Unable to update lesson');
  }
}

export async function deleteAdminLesson(req, res) {
  const { lessonId } = req.params;
  if (!validId(lessonId)) return invalidId(res);

  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
    if (!lesson) return sendError(res, 404, 'Lesson not found');

    await prisma.$transaction(async (tx) => {
      await tx.lessonProgress.deleteMany({ where: { lessonId } });
      await tx.lesson.delete({ where: { id: lessonId } });
    });

    return sendSuccess(res, 'Lesson deleted successfully', { deletedLessonId: lessonId });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Lesson not found');
    return sendError(res, 500, 'Unable to delete lesson');
  }
}

export async function getAdminCourseAssignments(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return sendError(res, 404, 'Course not found');

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: 'asc' },
    });

    return sendSuccess(res, 'Course assignments retrieved', { assignments });
  } catch {
    return sendError(res, 500, 'Unable to retrieve assignments');
  }
}

export async function createAdminAssignment(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const title = normalizeString(body.title);
  const description = normalizeString(body.description);
  const dueDate = body.dueDate;

  if (!title || !description) return sendError(res, 400, 'Assignment title and description are required');
  if (!isValidDate(dueDate)) return sendError(res, 400, 'A valid dueDate is required');

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return sendError(res, 404, 'Course not found');

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description,
        dueDate: new Date(dueDate),
      },
    });

    return sendSuccess(res, 'Assignment created successfully', { assignment }, 201);
  } catch {
    return sendError(res, 500, 'Unable to create assignment');
  }
}

export async function updateAdminAssignment(req, res) {
  const { assignmentId } = req.params;
  if (!validId(assignmentId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (!Object.keys(body).length) return sendError(res, 400, 'Provide at least one field to update');

  const data = {};
  if (Object.hasOwn(body, 'title')) {
    const title = normalizeString(body.title);
    if (!title) return sendError(res, 400, 'Assignment title is required');
    data.title = title;
  }
  if (Object.hasOwn(body, 'description')) {
    const description = normalizeString(body.description);
    if (!description) return sendError(res, 400, 'Assignment description is required');
    data.description = description;
  }
  if (Object.hasOwn(body, 'dueDate')) {
    if (!isValidDate(body.dueDate)) return sendError(res, 400, 'A valid dueDate is required');
    data.dueDate = new Date(body.dueDate);
  }

  try {
    const assignment = await prisma.assignment.update({ where: { id: assignmentId }, data });
    return sendSuccess(res, 'Assignment updated successfully', { assignment });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Assignment not found');
    return sendError(res, 500, 'Unable to update assignment');
  }
}

export async function deleteAdminAssignment(req, res) {
  const { assignmentId } = req.params;
  if (!validId(assignmentId)) return invalidId(res);

  try {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { id: true } });
    if (!assignment) return sendError(res, 404, 'Assignment not found');

    await prisma.$transaction(async (tx) => {
      await tx.submission.deleteMany({ where: { assignmentId } });
      await tx.assignment.delete({ where: { id: assignmentId } });
    });

    return sendSuccess(res, 'Assignment deleted successfully', { deletedAssignmentId: assignmentId });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Assignment not found');
    return sendError(res, 500, 'Unable to delete assignment');
  }
}

export async function getAdminCourseQuizzes(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return sendError(res, 404, 'Course not found');

    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
      include: {
        questions: { select: { id: true } },
      },
    });

    return sendSuccess(res, 'Course quizzes retrieved', {
      quizzes: quizzes.map((quiz) => ({
        ...quiz,
        questionCount: quiz.questions.length,
      })),
    });
  } catch {
    return sendError(res, 500, 'Unable to retrieve quizzes');
  }
}

export async function createAdminQuiz(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const title = normalizeString(body.title);
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const totalMarks = Number(body.totalMarks);

  if (!title) return sendError(res, 400, 'Quiz title is required');
  if (!Number.isInteger(totalMarks) || totalMarks <= 0) return sendError(res, 400, 'Total marks must be a positive integer');

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return sendError(res, 404, 'Course not found');

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        title,
        description: description || null,
        totalMarks,
      },
    });

    return sendSuccess(res, 'Quiz created successfully', { quiz }, 201);
  } catch {
    return sendError(res, 500, 'Unable to create quiz');
  }
}

export async function updateAdminQuiz(req, res) {
  const { quizId } = req.params;
  if (!validId(quizId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (!Object.keys(body).length) return sendError(res, 400, 'Provide at least one field to update');

  const data = {};
  if (Object.hasOwn(body, 'title')) {
    const title = normalizeString(body.title);
    if (!title) return sendError(res, 400, 'Quiz title is required');
    data.title = title;
  }
  if (Object.hasOwn(body, 'description')) {
    data.description = typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null;
  }
  if (Object.hasOwn(body, 'totalMarks')) {
    const totalMarks = Number(body.totalMarks);
    if (!Number.isInteger(totalMarks) || totalMarks <= 0) return sendError(res, 400, 'Total marks must be a positive integer');
    data.totalMarks = totalMarks;
  }

  try {
    const quiz = await prisma.quiz.update({ where: { id: quizId }, data });
    return sendSuccess(res, 'Quiz updated successfully', { quiz });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Quiz not found');
    return sendError(res, 500, 'Unable to update quiz');
  }
}

export async function deleteAdminQuiz(req, res) {
  const { quizId } = req.params;
  if (!validId(quizId)) return invalidId(res);

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } });
    if (!quiz) return sendError(res, 404, 'Quiz not found');

    await prisma.$transaction(async (tx) => {
      await tx.quizQuestion.deleteMany({ where: { quizId } });
      await tx.quizAttempt.deleteMany({ where: { quizId } });
      await tx.quiz.delete({ where: { id: quizId } });
    });

    return sendSuccess(res, 'Quiz deleted successfully', { deletedQuizId: quizId });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Quiz not found');
    return sendError(res, 500, 'Unable to delete quiz');
  }
}

export async function getAdminQuizQuestions(req, res) {
  const { quizId } = req.params;
  if (!validId(quizId)) return invalidId(res);

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } });
    if (!quiz) return sendError(res, 404, 'Quiz not found');

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId },
      orderBy: { id: 'asc' },
    });

    return sendSuccess(res, 'Quiz questions retrieved', { questions });
  } catch {
    return sendError(res, 500, 'Unable to retrieve quiz questions');
  }
}

export async function createAdminQuizQuestion(req, res) {
  const { quizId } = req.params;
  if (!validId(quizId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const question = normalizeString(body.question);
  const optionA = normalizeString(body.optionA);
  const optionB = normalizeString(body.optionB);
  const optionC = normalizeString(body.optionC);
  const optionD = normalizeString(body.optionD);
  const correctAnswer = normalizeString(body.correctAnswer);

  if (!question || !optionA || !optionB || !optionC || !optionD) {
    return sendError(res, 400, 'Question and all four options are required');
  }
  if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
    return sendError(res, 400, 'correctAnswer must be one of A, B, C, or D');
  }

  const answerMap = {
    A: optionA,
    B: optionB,
    C: optionC,
    D: optionD,
  };

  if (answerMap[correctAnswer.toUpperCase()] === undefined || !answerMap[correctAnswer.toUpperCase()]) {
    return sendError(res, 400, 'correctAnswer must match one of the provided options');
  }

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } });
    if (!quiz) return sendError(res, 404, 'Quiz not found');

    const questionEntry = await prisma.quizQuestion.create({
      data: {
        quizId,
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: correctAnswer.toUpperCase(),
      },
    });

    return sendSuccess(res, 'Question created successfully', { question: questionEntry }, 201);
  } catch {
    return sendError(res, 500, 'Unable to create quiz question');
  }
}

export async function updateAdminQuizQuestion(req, res) {
  const { questionId } = req.params;
  if (!validId(questionId)) return invalidId(res);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (!Object.keys(body).length) return sendError(res, 400, 'Provide at least one field to update');

  const data = {};
  if (Object.hasOwn(body, 'question')) {
    const question = normalizeString(body.question);
    if (!question) return sendError(res, 400, 'Question is required');
    data.question = question;
  }
  if (Object.hasOwn(body, 'optionA')) {
    const optionA = normalizeString(body.optionA);
    if (!optionA) return sendError(res, 400, 'Option A is required');
    data.optionA = optionA;
  }
  if (Object.hasOwn(body, 'optionB')) {
    const optionB = normalizeString(body.optionB);
    if (!optionB) return sendError(res, 400, 'Option B is required');
    data.optionB = optionB;
  }
  if (Object.hasOwn(body, 'optionC')) {
    const optionC = normalizeString(body.optionC);
    if (!optionC) return sendError(res, 400, 'Option C is required');
    data.optionC = optionC;
  }
  if (Object.hasOwn(body, 'optionD')) {
    const optionD = normalizeString(body.optionD);
    if (!optionD) return sendError(res, 400, 'Option D is required');
    data.optionD = optionD;
  }
  if (Object.hasOwn(body, 'correctAnswer')) {
    const correctAnswer = normalizeString(body.correctAnswer).toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return sendError(res, 400, 'correctAnswer must be one of A, B, C, or D');
    }
    data.correctAnswer = correctAnswer;
  }

  try {
    const questionRecord = await prisma.quizQuestion.findUnique({ where: { id: questionId }, select: { optionA: true, optionB: true, optionC: true, optionD: true, correctAnswer: true } });
    if (!questionRecord) return sendError(res, 404, 'Question not found');

    if (Object.hasOwn(body, 'correctAnswer')) {
      const answerMap = {
        A: data.optionA ?? questionRecord.optionA,
        B: data.optionB ?? questionRecord.optionB,
        C: data.optionC ?? questionRecord.optionC,
        D: data.optionD ?? questionRecord.optionD,
      };
      if (!answerMap[data.correctAnswer]) {
        return sendError(res, 400, 'correctAnswer must match one of the provided options');
      }
    }

    const question = await prisma.quizQuestion.update({
      where: { id: questionId },
      data,
    });
    return sendSuccess(res, 'Question updated successfully', { question });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Question not found');
    return sendError(res, 500, 'Unable to update question');
  }
}

export async function deleteAdminQuizQuestion(req, res) {
  const { questionId } = req.params;
  if (!validId(questionId)) return invalidId(res);

  try {
    const question = await prisma.quizQuestion.findUnique({ where: { id: questionId }, select: { id: true } });
    if (!question) return sendError(res, 404, 'Question not found');

    await prisma.quizQuestion.delete({ where: { id: questionId } });
    return sendSuccess(res, 'Question deleted successfully', { deletedQuestionId: questionId });
  } catch (error) {
    if (error?.code === 'P2025') return sendError(res, 404, 'Question not found');
    return sendError(res, 500, 'Unable to delete question');
  }
}

export async function getAdminProfile(req, res) {
  return sendSuccess(res, 'Admin profile retrieved', {
    user: {
      id: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      createdAt: req.user.createdAt,
    },
  });
}

export async function updateAdminProfile(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const allowedFields = new Set(['name', 'phone']);

  if (Object.keys(body).some((key) => !allowedFields.has(key))) {
    return sendError(res, 400, 'Only name and phone can be updated');
  }
  if (!Object.keys(body).length) {
    return sendError(res, 400, 'Provide a name or phone to update');
  }

  const data = {};
  if (Object.hasOwn(body, 'name')) {
    const name = normalizeString(body.name);
    if (!name) return sendError(res, 400, 'Name must be a non-empty string');
    data.name = name;
  }
  if (Object.hasOwn(body, 'phone')) {
    if (body.phone !== null && typeof body.phone !== 'string') {
      return sendError(res, 400, 'Phone must be a string or null');
    }
    data.phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null;
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: publicUserSelect,
    });
    return sendSuccess(res, 'Admin profile updated', { user });
  } catch {
    return sendError(res, 500, 'Unable to update profile');
  }
}
