import 'dotenv/config';
import assert from 'node:assert/strict';
import { prisma } from './src/config/database.js';

const teacherEmail = 'e2e-teacher-mumqhr6wx5writ@example.invalid';
try {
  const students = await prisma.user.findMany({
    where: { email: { startsWith: 'e2e-student-' }, name: 'E2E Student', role: 'STUDENT' },
    select: { id: true, role: true },
  });
  const teacher = await prisma.user.findUnique({
    where: { email: teacherEmail },
    select: { id: true, role: true },
  });
  assert.equal(students.length, 1, 'Expected the single browser-created student fixture');
  assert.equal(teacher?.role, 'INSTRUCTOR', 'Browser-created teacher should have the INSTRUCTOR role');
  const student = students[0];
  const [enrollments, progress, submissions, attempts, courses] = await Promise.all([
    prisma.enrollment.count({ where: { studentId: student.id } }),
    prisma.lessonProgress.count({ where: { studentId: student.id } }),
    prisma.submission.count({ where: { studentId: student.id } }),
    prisma.quizAttempt.count({ where: { studentId: student.id } }),
    prisma.course.count({ where: { instructorId: teacher.id } }),
  ]);
  assert.deepEqual({ enrollments, progress, submissions, attempts, courses }, {
    enrollments: 0, progress: 0, submissions: 0, attempts: 0, courses: 0,
  });
  await prisma.user.deleteMany({ where: { id: { in: [student.id, teacher.id] } } });
  console.log('Browser registrations verified: STUDENT and INSTRUCTOR roles; all requested related-record counts were zero; test accounts deleted.');
} finally {
  await prisma.$disconnect();
}
