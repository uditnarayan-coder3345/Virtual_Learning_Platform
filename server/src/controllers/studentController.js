import { prisma } from '../config/database.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  createdAt: true,
};

const instructorSelect = {
  id: true,
  name: true,
  email: true,
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

async function findCourse(courseId) {
  if (!validId(courseId)) return null;
  return prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
}

async function hasEnrollment(studentId, courseId) {
  return Boolean(await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  }));
}

async function requireEnrollment(req, res, courseId) {
  const course = await findCourse(courseId);
  if (!course) {
    sendError(res, 404, 'Course not found');
    return false;
  }
  if (!(await hasEnrollment(req.user.userId, courseId))) {
    sendError(res, 403, 'Enroll in this course to access its learning materials');
    return false;
  }
  return true;
}

function assignmentStatus(assignment, submission) {
  if (submission) return 'SUBMITTED';
  return assignment.dueDate < new Date() ? 'OVERDUE' : 'PENDING';
}

function toAssignmentResult(assignment) {
  const submission = assignment.submissions?.[0] ?? null;
  const { submissions, ...assignmentInfo } = assignment;
  return {
    ...assignmentInfo,
    submissionStatus: assignmentStatus(assignment, submission),
    submission,
  };
}

export async function getCurrentStudentProfile(req, res) {
  return sendSuccess(res, 'Student profile retrieved', {
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

export async function updateStudentProfile(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};
  const allowedFields = new Set(['name', 'phone']);
  if (Object.keys(body).some((key) => !allowedFields.has(key))) {
    return sendError(res, 400, 'Only name and phone can be updated');
  }
  if (!Object.keys(body).length) {
    return sendError(res, 400, 'Provide a name or phone to update');
  }

  const data = {};
  if (Object.hasOwn(body, 'name')) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return sendError(res, 400, 'Name must be a non-empty string');
    }
    data.name = body.name.trim();
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
      select: profileSelect,
    });
    return sendSuccess(res, 'Student profile updated', { user });
  } catch {
    return sendError(res, 500, 'Unable to update student profile');
  }
}

export async function getStudentCourses(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const where = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = { equals: category, mode: 'insensitive' };

  try {
    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        thumbnail: true,
        createdAt: true,
        instructor: { select: instructorSelect },
      },
    });
    return sendSuccess(res, 'Available courses retrieved', { courses });
  } catch {
    return sendError(res, 500, 'Unable to retrieve courses');
  }
}

export async function getCourse(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    if (!(await requireEnrollment(req, res, courseId))) return;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        thumbnail: true,
        createdAt: true,
        instructor: { select: instructorSelect },
        lessons: {
          select: { id: true, title: true, content: true, materialUrl: true, duration: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        assignments: {
          select: { id: true, title: true, description: true, dueDate: true, createdAt: true },
          orderBy: { dueDate: 'asc' },
        },
        quizzes: {
          select: { id: true, title: true, description: true, totalMarks: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return sendSuccess(res, 'Course details retrieved', { course });
  } catch {
    return sendError(res, 500, 'Unable to retrieve course details');
  }
}

export async function enrollInCourse(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    if (!(await findCourse(courseId))) return sendError(res, 404, 'Course not found');
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.userId, courseId } },
    });
    if (existing) return sendError(res, 409, 'You are already enrolled in this course');

    const enrollment = await prisma.enrollment.create({
      data: { studentId: req.user.userId, courseId, status: 'ACTIVE' },
      select: { id: true, courseId: true, status: true, enrolledAt: true },
    });
    return sendSuccess(res, 'Enrolled in course successfully', { enrollment }, 201);
  } catch (error) {
    if (error?.code === 'P2002') return sendError(res, 409, 'You are already enrolled in this course');
    return sendError(res, 500, 'Unable to enroll in course');
  }
}

export async function getStudentEnrollments(req, res) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.userId },
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            thumbnail: true,
            createdAt: true,
            instructor: { select: instructorSelect },
          },
        },
      },
    });
    return sendSuccess(res, 'Student enrollments retrieved', { enrollments });
  } catch {
    return sendError(res, 500, 'Unable to retrieve enrollments');
  }
}

export async function getCourseLessons(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    if (!(await requireEnrollment(req, res, courseId))) return;
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        content: true,
        materialUrl: true,
        duration: true,
        createdAt: true,
        progress: {
          where: { studentId: req.user.userId },
          select: { completed: true, completedAt: true },
          take: 1,
        },
      },
    });
    return sendSuccess(res, 'Course lessons retrieved', {
      lessons: lessons.map(({ progress, ...lesson }) => ({ progress: progress[0] ?? null, ...lesson })),
    });
  } catch {
    return sendError(res, 500, 'Unable to retrieve lessons');
  }
}

export async function completeLesson(req, res) {
  const { lessonId } = req.params;
  if (!validId(lessonId)) return invalidId(res);

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true },
    });
    if (!lesson) return sendError(res, 404, 'Lesson not found');
    if (!(await hasEnrollment(req.user.userId, lesson.courseId))) {
      return sendError(res, 403, 'Enroll in this course to update lesson progress');
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: req.user.userId, lessonId } },
      create: { studentId: req.user.userId, lessonId, completed: true, completedAt: new Date() },
      update: { completed: true, completedAt: new Date() },
      select: { id: true, lessonId: true, completed: true, completedAt: true },
    });
    return sendSuccess(res, 'Lesson marked as complete', { progress });
  } catch {
    return sendError(res, 500, 'Unable to update lesson progress');
  }
}

export async function getCourseProgress(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    if (!(await requireEnrollment(req, res, courseId))) return;
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { courseId } }),
      prisma.lessonProgress.count({
        where: { studentId: req.user.userId, completed: true, lesson: { courseId } },
      }),
    ]);
    const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
    return sendSuccess(res, 'Course progress retrieved', { totalLessons, completedLessons, progressPercentage });
  } catch {
    return sendError(res, 500, 'Unable to retrieve course progress');
  }
}

export async function getCourseAssignments(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    if (!(await requireEnrollment(req, res, courseId))) return;
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        createdAt: true,
        submissions: {
          where: { studentId: req.user.userId },
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: { id: true, fileUrl: true, submittedAt: true, marks: true, feedback: true },
        },
      },
    });
    return sendSuccess(res, 'Course assignments retrieved', { assignments: assignments.map(toAssignmentResult) });
  } catch {
    return sendError(res, 500, 'Unable to retrieve assignments');
  }
}

export async function getAssignment(req, res) {
  const { assignmentId } = req.params;
  if (!validId(assignmentId)) return invalidId(res);

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        createdAt: true,
        courseId: true,
        submissions: {
          where: { studentId: req.user.userId },
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: { id: true, fileUrl: true, submittedAt: true, marks: true, feedback: true },
        },
      },
    });
    if (!assignment) return sendError(res, 404, 'Assignment not found');
    if (!(await hasEnrollment(req.user.userId, assignment.courseId))) {
      return sendError(res, 403, 'Enroll in this course to access the assignment');
    }
    const { courseId, ...result } = toAssignmentResult(assignment);
    return sendSuccess(res, 'Assignment details retrieved', { assignment: result });
  } catch {
    return sendError(res, 500, 'Unable to retrieve assignment');
  }
}

export async function submitAssignment(req, res) {
  const { assignmentId } = req.params;
  if (!validId(assignmentId)) return invalidId(res);
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (typeof body.fileUrl !== 'string' || !body.fileUrl.trim()) {
    return sendError(res, 400, 'A fileUrl is required');
  }
  let fileUrl;
  try {
    fileUrl = new URL(body.fileUrl.trim());
    if (!['http:', 'https:'].includes(fileUrl.protocol)) throw new Error('Invalid protocol');
  } catch {
    return sendError(res, 400, 'fileUrl must be a valid HTTP or HTTPS URL');
  }

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, courseId: true },
    });
    if (!assignment) return sendError(res, 404, 'Assignment not found');
    if (!(await hasEnrollment(req.user.userId, assignment.courseId))) {
      return sendError(res, 403, 'Enroll in this course to submit the assignment');
    }

    const previous = await prisma.submission.findFirst({
      where: { assignmentId, studentId: req.user.userId },
      orderBy: { submittedAt: 'desc' },
      select: { id: true },
    });
    const submission = previous
      ? await prisma.submission.update({
        where: { id: previous.id },
        data: { fileUrl: fileUrl.href, submittedAt: new Date() },
        select: { id: true, fileUrl: true, submittedAt: true, marks: true, feedback: true },
      })
      : await prisma.submission.create({
        data: { assignmentId, studentId: req.user.userId, fileUrl: fileUrl.href },
        select: { id: true, fileUrl: true, submittedAt: true, marks: true, feedback: true },
      });
    return sendSuccess(res, previous ? 'Assignment resubmitted successfully' : 'Assignment submitted successfully', {
      submission,
      submissionStatus: 'SUBMITTED',
    }, previous ? 200 : 201);
  } catch {
    return sendError(res, 500, 'Unable to submit assignment');
  }
}

export async function getCourseQuizzes(req, res) {
  const { courseId } = req.params;
  if (!validId(courseId)) return invalidId(res);

  try {
    if (!(await requireEnrollment(req, res, courseId))) return;
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, description: true, totalMarks: true, createdAt: true },
    });
    return sendSuccess(res, 'Course quizzes retrieved', { quizzes });
  } catch {
    return sendError(res, 500, 'Unable to retrieve quizzes');
  }
}

export async function getQuiz(req, res) {
  const { quizId } = req.params;
  if (!validId(quizId)) return invalidId(res);

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        description: true,
        totalMarks: true,
        createdAt: true,
        courseId: true,
        questions: {
          select: { id: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true },
        },
      },
    });
    if (!quiz) return sendError(res, 404, 'Quiz not found');
    if (!(await hasEnrollment(req.user.userId, quiz.courseId))) {
      return sendError(res, 403, 'Enroll in this course to access the quiz');
    }
    const { courseId, ...result } = quiz;
    return sendSuccess(res, 'Quiz retrieved', { quiz: result });
  } catch {
    return sendError(res, 500, 'Unable to retrieve quiz');
  }
}

function answerIsCorrect(question, answer) {
  const correct = question.correctAnswer.trim();
  if (/^[A-D]$/i.test(correct)) return correct.toUpperCase() === answer;
  const optionName = { A: 'optionA', B: 'optionB', C: 'optionC', D: 'optionD' }[answer];
  return question[optionName].trim().toLowerCase() === correct.toLowerCase();
}

export async function submitQuiz(req, res) {
  const { quizId } = req.params;
  if (!validId(quizId)) return invalidId(res);
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return sendError(res, 400, 'Answers must be a non-empty array');
  }

  const seenQuestionIds = new Set();
  for (const answer of body.answers) {
    if (!answer || typeof answer !== 'object' || !validId(answer.questionId)) {
      return sendError(res, 400, 'Each answer must include a valid questionId');
    }
    if (seenQuestionIds.has(answer.questionId)) {
      return sendError(res, 400, 'Duplicate question IDs are not allowed');
    }
    if (typeof answer.answer !== 'string' || !/^[A-D]$/i.test(answer.answer.trim())) {
      return sendError(res, 400, 'Each answer must be A, B, C, or D');
    }
    seenQuestionIds.add(answer.questionId);
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        courseId: true,
        totalMarks: true,
        questions: {
          select: { id: true, correctAnswer: true, optionA: true, optionB: true, optionC: true, optionD: true },
        },
      },
    });
    if (!quiz) return sendError(res, 404, 'Quiz not found');
    if (!(await hasEnrollment(req.user.userId, quiz.courseId))) {
      return sendError(res, 403, 'Enroll in this course to submit the quiz');
    }
    if (!quiz.questions.length) return sendError(res, 400, 'This quiz has no questions');

    const questionsById = new Map(quiz.questions.map((question) => [question.id, question]));
    for (const answer of body.answers) {
      if (!questionsById.has(answer.questionId)) {
        return sendError(res, 400, 'An answer references a question outside this quiz');
      }
    }

    const correctAnswers = body.answers.reduce((count, answer) => (
      count + Number(answerIsCorrect(questionsById.get(answer.questionId), answer.answer.trim().toUpperCase()))
    ), 0);
    const score = Math.round((correctAnswers / quiz.questions.length) * quiz.totalMarks);
    const attempt = await prisma.quizAttempt.create({
      data: { quizId, studentId: req.user.userId, score },
      select: { id: true, score: true, attemptedAt: true },
    });
    return sendSuccess(res, 'Quiz submitted successfully', {
      result: {
        attemptId: attempt.id,
        quizId,
        score,
        totalMarks: quiz.totalMarks,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        percentage: quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 0,
        attemptedAt: attempt.attemptedAt,
      },
    }, 201);
  } catch {
    return sendError(res, 500, 'Unable to submit quiz');
  }
}

export async function getQuizResults(req, res) {
  const { quizId } = req.params;
  if (!validId(quizId)) return invalidId(res);

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, courseId: true, title: true, totalMarks: true },
    });
    if (!quiz) return sendError(res, 404, 'Quiz not found');
    if (!(await hasEnrollment(req.user.userId, quiz.courseId))) {
      return sendError(res, 403, 'Enroll in this course to access quiz results');
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId, studentId: req.user.userId },
      orderBy: { attemptedAt: 'desc' },
      select: { id: true, score: true, attemptedAt: true },
    });
    return sendSuccess(res, 'Quiz results retrieved', {
      quiz: { id: quiz.id, title: quiz.title, totalMarks: quiz.totalMarks },
      attempts: attempts.map((attempt) => ({
        ...attempt,
        percentage: quiz.totalMarks > 0 ? Math.round((attempt.score / quiz.totalMarks) * 100) : 0,
      })),
    });
  } catch {
    return sendError(res, 500, 'Unable to retrieve quiz results');
  }
}

export async function getDashboard(req, res) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.userId },
      orderBy: { enrolledAt: 'desc' },
      select: {
        status: true,
        enrolledAt: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            thumbnail: true,
            instructor: { select: instructorSelect },
          },
        },
      },
    });
    const courseIds = enrollments.map(({ course }) => course.id);
    const [lessons, pendingAssignments, recentQuizAttempts] = await Promise.all([
      courseIds.length
        ? prisma.lesson.findMany({
          where: { courseId: { in: courseIds } },
          select: {
            courseId: true,
            progress: { where: { studentId: req.user.userId, completed: true }, select: { id: true } },
          },
        })
        : Promise.resolve([]),
      courseIds.length
        ? prisma.assignment.count({
          where: {
            courseId: { in: courseIds },
            dueDate: { gte: new Date() },
            submissions: { none: { studentId: req.user.userId } },
          },
        })
        : Promise.resolve(0),
      prisma.quizAttempt.findMany({
        where: { studentId: req.user.userId },
        orderBy: { attemptedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          score: true,
          attemptedAt: true,
          quiz: { select: { id: true, title: true, totalMarks: true } },
        },
      }),
    ]);

    const progressByCourse = new Map();
    for (const enrollment of enrollments) progressByCourse.set(enrollment.course.id, { total: 0, completed: 0 });
    for (const lesson of lessons) {
      const progress = progressByCourse.get(lesson.courseId);
      progress.total += 1;
      if (lesson.progress.length) progress.completed += 1;
    }
    const progressValues = [...progressByCourse.values()].map(({ total, completed }) => (
      total === 0 ? 0 : Math.round((completed / total) * 100)
    ));
    const completedCourses = enrollments.filter(({ status, course }) => {
      const progress = progressByCourse.get(course.id);
      return status === 'COMPLETED' || (progress.total > 0 && progress.completed === progress.total);
    }).length;
    const averageCourseProgress = progressValues.length
      ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
      : 0;

    return sendSuccess(res, 'Student dashboard retrieved', {
      totalEnrolledCourses: enrollments.length,
      completedCourses,
      averageCourseProgress,
      pendingAssignments,
      recentQuizResults: recentQuizAttempts.map((attempt) => ({
        id: attempt.id,
        score: attempt.score,
        attemptedAt: attempt.attemptedAt,
        quiz: attempt.quiz,
      })),
      recentEnrolledCourses: enrollments.slice(0, 5).map(({ course, status, enrolledAt }) => ({
        ...course,
        status,
        enrolledAt,
      })),
    });
  } catch {
    return sendError(res, 500, 'Unable to retrieve student dashboard');
  }
}