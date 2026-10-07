import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from './src/config/database.js';
import app from './src/app.js';
import { hashPassword } from './src/utils/auth.js';

const suffix = randomUUID();
const password = `Reports-${suffix}-Aa8!`;
const emails = {
  admin: `requests-admin-${suffix}@example.invalid`,
  studentA: `requests-student-a-${suffix}@example.invalid`,
  studentB: `requests-student-b-${suffix}@example.invalid`,
  instructor: `requests-instructor-${suffix}@example.invalid`,
  rejectedInstructor: `requests-rejected-${suffix}@example.invalid`,
};
let server;
let adminToken;
const tokens = {};

async function request(baseUrl, path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, json: await response.json() };
}

async function register(baseUrl, email, accountType) {
  return request(baseUrl, '/api/auth/register', {
    method: 'POST',
    body: { name: 'Requests Reports Test', email, password, accountType },
  });
}

async function login(baseUrl, email, role) {
  return request(baseUrl, '/api/auth/login', { method: 'POST', body: { email, password, role } });
}

try {
  await prisma.$connect();
  server = app.listen(0);
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  await prisma.user.create({
    data: { name: 'Requests Reports Admin', email: emails.admin, password: await hashPassword(password), role: 'ADMIN', status: 'APPROVED' },
  });
  const adminLogin = await login(baseUrl, emails.admin, 'ADMIN');
  assert.equal(adminLogin.status, 200);
  adminToken = adminLogin.json.data.token;

  const instructorRegistration = await register(baseUrl, emails.instructor, 'TEACHER');
  assert.equal(instructorRegistration.status, 201);
  assert.equal(instructorRegistration.json.data.user.role, 'INSTRUCTOR');
  assert.equal(instructorRegistration.json.data.user.status, 'PENDING');
  const pendingInstructorLogin = await login(baseUrl, emails.instructor, 'INSTRUCTOR');
  assert.equal(pendingInstructorLogin.status, 403);
  assert.equal(pendingInstructorLogin.json.message, 'Your instructor account is pending admin approval.');
  const pending = await request(baseUrl, '/api/admin/users/pending', { token: adminToken });
  assert.equal(pending.status, 200);
  assert.ok(pending.json.data.users.some((user) => user.email === emails.instructor));
  const instructorId = instructorRegistration.json.data.user.id;

  const studentARegistration = await register(baseUrl, emails.studentA, 'STUDENT');
  const studentBRegistration = await register(baseUrl, emails.studentB, 'STUDENT');
  assert.equal(studentARegistration.json.data.user.status, 'APPROVED');
  assert.equal(studentBRegistration.json.data.user.status, 'APPROVED');
  const pendingAfterStudents = await request(baseUrl, '/api/admin/users/pending', { token: adminToken });
  assert.equal(pendingAfterStudents.json.data.users.some((user) => user.role === 'STUDENT'), false);
  assert.ok(pendingAfterStudents.json.data.users.every((user) => user.role === 'INSTRUCTOR'));
  const [studentALogin, studentBLogin] = await Promise.all([login(baseUrl, emails.studentA, 'STUDENT'), login(baseUrl, emails.studentB, 'STUDENT')]);
  assert.equal(studentALogin.status, 200);
  assert.equal(studentBLogin.status, 200);
  assert.equal('token' in studentALogin.json.data, true);
  assert.equal('token' in studentBLogin.json.data, true);
  tokens.studentA = studentALogin.json.data.token;
  tokens.studentB = studentBLogin.json.data.token;

  const nonAdminApprove = await request(baseUrl, `/api/admin/users/${instructorId}/approve`, { method: 'PATCH', token: tokens.studentA });
  assert.equal(nonAdminApprove.status, 403);
  const approvedInstructor = await request(baseUrl, `/api/admin/users/${instructorId}/approve`, { method: 'PATCH', token: adminToken });
  assert.equal(approvedInstructor.status, 200);
  assert.equal(approvedInstructor.json.data.user.status, 'APPROVED');
  const instructorLogin = await login(baseUrl, emails.instructor, 'INSTRUCTOR');
  assert.equal(instructorLogin.status, 200);
  tokens.instructor = instructorLogin.json.data.token;
  assert.equal((await request(baseUrl, '/api/admin/reports', { token: tokens.instructor })).status, 403);

  const rejectedRegistration = await register(baseUrl, emails.rejectedInstructor, 'TEACHER');
  assert.equal(rejectedRegistration.json.data.user.status, 'PENDING');
  const rejected = await request(baseUrl, `/api/admin/users/${rejectedRegistration.json.data.user.id}/reject`, { method: 'PATCH', token: adminToken });
  assert.equal(rejected.status, 200);
  assert.equal(rejected.json.data.user.status, 'REJECTED');
  const rejectedLogin = await login(baseUrl, emails.rejectedInstructor, 'INSTRUCTOR');
  assert.equal(rejectedLogin.status, 403);
  assert.equal(rejectedLogin.json.message, 'Your instructor account request was rejected.');

  const created = await request(baseUrl, '/api/student/reports', {
    method: 'POST', token: tokens.studentA,
    body: { category: 'COURSE_ACCESS_ISSUE', subject: 'Cannot open course lesson', description: 'The first lesson page stays blank after I enroll in the course.' },
  });
  assert.equal(created.status, 201);
  assert.equal(created.json.data.report.status, 'PENDING');
  const reportId = created.json.data.report.id;
  const adminList = await request(baseUrl, '/api/admin/reports', { token: adminToken });
  assert.equal(adminList.status, 200);
  assert.ok(adminList.json.data.reports.some((report) => report.id === reportId));
  assert.equal('password' in adminList.json.data.reports.find((report) => report.id === reportId).user, false);

  const progressUpdate = await request(baseUrl, `/api/admin/reports/${reportId}`, {
    method: 'PATCH', token: adminToken,
    body: { status: 'IN_PROGRESS', adminResponse: 'We are reviewing your course access issue.' },
  });
  assert.equal(progressUpdate.status, 200);
  assert.equal(progressUpdate.json.data.report.status, 'IN_PROGRESS');
  const resolved = await request(baseUrl, `/api/admin/reports/${reportId}`, {
    method: 'PATCH', token: adminToken,
    body: { status: 'RESOLVED', adminResponse: 'Course access has been restored. Please try again.' },
  });
  assert.equal(resolved.status, 200);
  assert.equal(resolved.json.data.report.status, 'RESOLVED');
  assert.ok(resolved.json.data.report.resolvedAt);
  const studentReports = await request(baseUrl, '/api/student/reports', { token: tokens.studentA });
  assert.ok(studentReports.json.data.reports.some((report) => report.id === reportId && report.status === 'RESOLVED'));
  const studentDetail = await request(baseUrl, `/api/student/reports/${reportId}`, { token: tokens.studentA });
  assert.equal(studentDetail.status, 200);
  assert.equal(studentDetail.json.data.report.adminResponse, 'Course access has been restored. Please try again.');
  const otherStudentList = await request(baseUrl, '/api/student/reports', { token: tokens.studentB });
  assert.equal(otherStudentList.json.data.reports.some((report) => report.id === reportId), false);
  const otherStudentDetail = await request(baseUrl, `/api/student/reports/${reportId}`, { token: tokens.studentB });
  assert.equal(otherStudentDetail.status, 404);
  assert.equal((await request(baseUrl, `/api/admin/reports/${reportId}`, { token: tokens.studentA })).status, 403);

  console.log('PASS: instructor request lifecycle, pending approval, rejection/login denial, Admin-only review, report creation, admin progress/resolution responses, student-owned list/detail, and cross-student access denial.');
} catch (error) {
  console.error(`Requests & Reports test failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  try {
    await prisma.user.deleteMany({ where: { email: { in: Object.values(emails) } } });
  } finally {
    await prisma.$disconnect();
  }
}
