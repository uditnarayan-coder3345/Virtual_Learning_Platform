import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './src/config/database.js';
import app from './src/app.js';
import { hashPassword } from './src/utils/auth.js';

const suffix = randomUUID();
const password = `Approval-${suffix}-Aa9!`;
const emails = {
  student: `approval-student-${suffix}@example.invalid`,
  teacher: `approval-teacher-${suffix}@example.invalid`,
  rejected: `approval-rejected-${suffix}@example.invalid`,
  admin: `approval-admin-${suffix}@example.invalid`,
  badType: `approval-bad-type-${suffix}@example.invalid`,
  roleAdmin: `approval-role-admin-${suffix}@example.invalid`,
  roleInstructor: `approval-role-instructor-${suffix}@example.invalid`,
};
const tokens = {};
let server;

async function request(baseUrl, path, body, token, method = body === undefined ? 'GET' : 'POST') {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, json: await response.json() };
}

async function register(baseUrl, email, accountType = 'STUDENT') {
  return request(baseUrl, '/api/auth/register', { name: 'Approval Flow Test', email, password, accountType });
}

try {
  await prisma.$connect();
  server = app.listen(0);
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const studentRegistration = await register(baseUrl, emails.student);
  const teacherRegistration = await register(baseUrl, emails.teacher, 'TEACHER');
  const rejectedRegistration = await register(baseUrl, emails.rejected);
  assert.equal(studentRegistration.status, 201);
  assert.equal(teacherRegistration.status, 201);
  assert.equal(rejectedRegistration.status, 201);
  for (const response of [studentRegistration, teacherRegistration, rejectedRegistration]) {
    assert.equal(response.json.data.user.status, 'PENDING');
    assert.equal('password' in response.json.data.user, false);
  }
  assert.equal(studentRegistration.json.data.user.role, 'STUDENT');
  assert.equal(teacherRegistration.json.data.user.role, 'INSTRUCTOR');

  for (const accountType of ['ADMIN', 'invalid']) {
    const denied = await register(baseUrl, emails.badType, accountType);
    assert.equal(denied.status, 400);
  }
  for (const role of ['ADMIN', 'INSTRUCTOR']) {
    const denied = await request(baseUrl, '/api/auth/register', { name: 'Role Injection Test', email: role === 'ADMIN' ? emails.roleAdmin : emails.roleInstructor, password, role });
    assert.equal(denied.status, 400);
  }
  for (const email of [emails.badType, emails.roleAdmin, emails.roleInstructor]) {
    assert.equal(await prisma.user.findUnique({ where: { email } }), null, `Denied registration created ${email}`);
  }

  const studentRecord = await prisma.user.findUnique({ where: { email: emails.student } });
  const teacherRecord = await prisma.user.findUnique({ where: { email: emails.teacher } });
  assert.equal(await bcrypt.compare(password, studentRecord.password), true);
  assert.equal(await bcrypt.compare(password, teacherRecord.password), true);
  const pendingLogin = await request(baseUrl, '/api/auth/login', { email: emails.student, password });
  assert.equal(pendingLogin.status, 403);
  assert.match(pendingLogin.json.message, /pending Admin approval/i);
  const pendingTeacherLogin = await request(baseUrl, '/api/auth/login', { email: emails.teacher, password });
  assert.equal(pendingTeacherLogin.status, 403);

  await prisma.user.create({ data: { name: 'Approval Flow Admin', email: emails.admin, password: await hashPassword(password), role: 'ADMIN', status: 'APPROVED' } });
  const adminLogin = await request(baseUrl, '/api/auth/login', { email: emails.admin, password, role: 'ADMIN' });
  assert.equal(adminLogin.status, 200);
  assert.equal(adminLogin.json.data.role, 'ADMIN');
  assert.equal(adminLogin.json.data.user.status, 'APPROVED');
  assert.equal('password' in adminLogin.json.data.user, false);
  assert.equal(JSON.stringify(adminLogin.json).includes((await prisma.user.findUnique({ where: { email: emails.admin } })).password), false);
  tokens.admin = adminLogin.json.data.token;
  assert.equal(jwt.decode(tokens.admin).role, 'ADMIN');

  const pendingList = await request(baseUrl, '/api/admin/users/pending', undefined, tokens.admin);
  assert.equal(pendingList.status, 200);
  assert.equal(pendingList.json.data.users.length, 3);
  assert.equal(pendingList.json.data.users.some((user) => 'password' in user), false);
  const nonAdminApproval = await request(baseUrl, `/api/admin/users/${studentRecord.id}/approve`, undefined, 'not-a-token', 'PATCH');
  assert.equal(nonAdminApproval.status, 401);

  const approvedStudent = await request(baseUrl, `/api/admin/users/${studentRecord.id}/approve`, undefined, tokens.admin, 'PATCH');
  assert.equal(approvedStudent.status, 200);
  assert.equal(approvedStudent.json.data.user.status, 'APPROVED');
  const approvedTeacher = await request(baseUrl, `/api/admin/users/${teacherRecord.id}/approve`, undefined, tokens.admin, 'PATCH');
  assert.equal(approvedTeacher.status, 200);
  assert.equal(approvedTeacher.json.data.user.status, 'APPROVED');

  for (const [email, role] of [[emails.student, 'STUDENT'], [emails.teacher, 'INSTRUCTOR']]) {
    const login = await request(baseUrl, '/api/auth/login', { email, password, role });
    assert.equal(login.status, 200, `${role} login failed after approval`);
    assert.equal(login.json.data.role, role);
    assert.equal(login.json.data.user.status, 'APPROVED');
    assert.equal('password' in login.json.data.user, false);
    tokens[role] = login.json.data.token;
    const me = await request(baseUrl, '/api/auth/me', undefined, login.json.data.token);
    assert.equal(me.status, 200);
    assert.equal(me.json.data.user.status, 'APPROVED');
    assert.equal('password' in me.json.data.user, false);
  }

  const rejectedRecord = await prisma.user.findUnique({ where: { email: emails.rejected } });
  const rejectedResult = await request(baseUrl, `/api/admin/users/${rejectedRecord.id}/reject`, undefined, tokens.admin, 'PATCH');
  assert.equal(rejectedResult.status, 200);
  assert.equal(rejectedResult.json.data.user.status, 'REJECTED');
  const rejectedLogin = await request(baseUrl, '/api/auth/login', { email: emails.rejected, password });
  assert.equal(rejectedLogin.status, 403);
  assert.match(rejectedLogin.json.message, /not approved/i);

  const blockedResult = await request(baseUrl, `/api/admin/users/${studentRecord.id}/block`, undefined, tokens.admin, 'PATCH');
  assert.equal(blockedResult.status, 200);
  assert.equal(blockedResult.json.data.user.status, 'BLOCKED');
  const blockedLogin = await request(baseUrl, '/api/auth/login', { email: emails.student, password });
  assert.equal(blockedLogin.status, 403);
  assert.match(blockedLogin.json.message, /blocked/i);
  assert.equal((await request(baseUrl, '/api/student/dashboard', undefined, tokens.STUDENT)).status, 403, 'Blocked session token must lose access');
  const unblockedResult = await request(baseUrl, `/api/admin/users/${studentRecord.id}/unblock`, undefined, tokens.admin, 'PATCH');
  assert.equal(unblockedResult.status, 200);
  assert.equal(unblockedResult.json.data.user.status, 'APPROVED');
  assert.equal((await request(baseUrl, '/api/auth/login', { email: emails.student, password })).status, 200);

  const studentCannotApprove = await request(baseUrl, `/api/admin/users/${rejectedRecord.id}/approve`, undefined, tokens.STUDENT, 'PATCH');
  assert.equal(studentCannotApprove.status, 403);
  const instructorCannotApprove = await request(baseUrl, `/api/admin/users/${rejectedRecord.id}/approve`, undefined, tokens.INSTRUCTOR, 'PATCH');
  assert.equal(instructorCannotApprove.status, 403);
  assert.equal((await request(baseUrl, '/api/admin/dashboard', undefined, tokens.STUDENT)).status, 403);
  assert.equal((await request(baseUrl, '/api/admin/dashboard', undefined, tokens.INSTRUCTOR)).status, 403);
  assert.equal((await request(baseUrl, '/api/student/dashboard', undefined, tokens.INSTRUCTOR)).status, 403);
  assert.equal((await request(baseUrl, '/api/admin/dashboard', undefined, tokens.admin)).status, 200);
  assert.equal((await request(baseUrl, '/api/student/dashboard', undefined, tokens.STUDENT)).status, 200);
  assert.equal((await request(baseUrl, '/api/admin/dashboard')).status, 401);

  const wrongPassword = await request(baseUrl, '/api/auth/login', { email: emails.student, password: `${password}-wrong` });
  assert.equal(wrongPassword.status, 401);
  assert.equal(wrongPassword.json.message, 'Invalid email or password');
  const roleMismatch = await request(baseUrl, '/api/auth/login', { email: emails.student, password, role: 'INSTRUCTOR' });
  assert.equal(roleMismatch.status, 403);
  assert.equal(roleMismatch.json.message, 'Selected account type does not match this account');

  console.log('PASS: public Student/Teacher accounts are pending; public Admin denied; Admin approves/rejects/blocks/unblocks; rejected/pending/blocked login denied; active tokens revoked on block; non-admin approval denied; approved Student/Instructor/Admin login and protected routes; safe responses.');
} catch (error) {
  console.error(`Registration approval flow test failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  try {
    await prisma.user.deleteMany({ where: { email: { in: Object.values(emails) } } });
  } finally {
    await prisma.$disconnect();
  }
}
