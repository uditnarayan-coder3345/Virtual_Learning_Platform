import { prisma } from '../config/database.js';
import { comparePassword, createAuthToken, hashPassword } from '../utils/auth.js';

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  createdAt: true,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const registrationRoles = {
  STUDENT: 'STUDENT',
  TEACHER: 'INSTRUCTOR',
};

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

export async function register(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const accountType = Object.hasOwn(body, 'accountType') ? body.accountType : 'STUDENT';

  if (!name || !email || !password) {
    return sendError(res, 400, 'Name, email, and password are required');
  }
  if (Object.hasOwn(body, 'role')) {
    return sendError(res, 400, 'Do not provide a role; use accountType');
  }
  if (typeof accountType !== 'string' || !Object.hasOwn(registrationRoles, accountType)) {
    return sendError(res, 400, 'accountType must be STUDENT or TEACHER');
  }
  if (!emailPattern.test(email)) {
    return sendError(res, 400, 'A valid email address is required');
  }
  if (Buffer.byteLength(password, 'utf8') < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return sendError(res, 400, 'Password must be between 8 and 72 bytes');
  }
  if (body.phone != null && typeof body.phone !== 'string') {
    return sendError(res, 400, 'Phone must be a string');
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: registrationRoles[accountType],
        status: registrationRoles[accountType] === 'INSTRUCTOR' ? 'PENDING' : 'APPROVED',
        phone: typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null,
      },
      select: publicUserFields,
    });

    return res.status(201).json({
      success: true,
      message: registrationRoles[accountType] === 'INSTRUCTOR'
        ? 'Registration successful. Your instructor account is pending admin approval.'
        : 'Registration successful.',
      data: { user },
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      return sendError(res, 409, 'An account with this email already exists');
    }
    return sendError(res, 500, 'Unable to register account');
  }
}

export async function login(req, res) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const selectedRole = body.role;

  if (!email) {
    return sendError(res, 400, 'Email is required');
  }
  if (!emailPattern.test(email)) {
    return sendError(res, 400, 'Enter a valid email address');
  }
  if (!password) {
    return sendError(res, 400, 'Password is required');
  }
  if (selectedRole != null && !['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(selectedRole)) {
    return sendError(res, 400, 'Selected account type is invalid');
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      return sendError(res, 401, 'Invalid email or password');
    }
    if (user.status === 'PENDING') {
      return sendError(res, 403, user.role === 'INSTRUCTOR'
        ? 'Your instructor account is pending admin approval.'
        : 'Your account is pending Admin approval. You can log in after an Admin approves it.');
    }
    if (user.status === 'REJECTED') {
      return sendError(res, 403, user.role === 'INSTRUCTOR'
        ? 'Your instructor account request was rejected.'
        : 'Your account was not approved. Please contact an Admin.');
    }
    if (user.status === 'BLOCKED') return sendError(res, 403, 'Your account has been blocked.');
    if (selectedRole && selectedRole !== user.role) {
      return sendError(res, 403, 'Selected account type does not match this account');
    }

    const token = createAuthToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user: safeUser, role: user.role },
    });
  } catch {
    return sendError(res, 500, 'Unable to log in');
  }
}

export function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved',
    data: { user: req.user },
  });
}
